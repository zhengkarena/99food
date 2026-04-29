/**
 * CSV upload parsing & validation
 * ================================
 * Three CSV schemas the GM can upload to override default data:
 *
 *   1. cities.csv             — replaces the 30-city dataset
 *   2. benchmarks.csv         — overrides numeric business benchmarks
 *   3. experiment_results.csv — refits subsidy elasticity k per segment
 *
 * Failed validation → returns { ok: false, errors: [...] } with line-level
 * error messages. The UI shows them; default data is NOT touched on failure.
 */

import Papa from 'papaparse';

// Required columns per schema
const SCHEMAS = {
  cities: [
    'id', 'name', 'state', 'population', 'gdp_per_capita',
    'is_launched', 'ifood_market_share',
    'density_99', 'density_potential', 'supply_readiness', 'strategic_value',
    'avg_meal_price',
  ],
  benchmarks: ['metric_name', 'value', 'unit'],
  experiments: ['segment', 'subsidy_amount', 'conversion_lift', 'sample_size'],
};

/** Parse a File or text string with PapaParse, returning rows + parse errors. */
function parseCsv(input) {
  return new Promise((resolve) => {
    Papa.parse(input, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,                 // we coerce manually for clarity
      complete: (res) => resolve(res),
      error: (err) => resolve({ data: [], errors: [err] }),
    });
  });
}

function ensureColumns(headers, schema) {
  const missing = schema.filter((c) => !headers.includes(c));
  return missing;
}

function num(v, fallback = NaN) {
  if (v === '' || v == null) return fallback;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function bool(v) {
  if (typeof v === 'boolean') return v;
  return ['1', 'true', 'yes', 'y', 'TRUE'].includes(String(v).trim());
}

// ────────────────────── cities.csv ──────────────────────

export async function parseCitiesCsv(input) {
  const res = await parseCsv(input);
  const errors = [];
  if (!res.data.length) return { ok: false, errors: ['Empty file'] };

  const headers = Object.keys(res.data[0]);
  const missing = ensureColumns(headers, SCHEMAS.cities);
  if (missing.length) {
    return { ok: false, errors: [`Missing columns: ${missing.join(', ')}`] };
  }

  const out = [];
  res.data.forEach((row, i) => {
    const line = i + 2; // header is line 1
    const id = String(row.id || '').trim();
    const name = String(row.name || '').trim();
    if (!id || !name) {
      errors.push(`Line ${line}: missing id or name`);
      return;
    }
    const population = num(row.population);
    if (!Number.isFinite(population) || population < 1000) {
      errors.push(`Line ${line} (${name}): population must be a positive number`);
      return;
    }
    out.push({
      id,
      name,
      state: String(row.state || '').trim(),
      region: String(row.region || '').trim() || 'Other',
      population,
      gdpPerCapita: num(row.gdp_per_capita, 30000),
      isLaunched: bool(row.is_launched),
      launchDate: String(row.launch_date || '').trim() || undefined,
      keetaPresent: bool(row.keeta_present),
      ifoodShare: num(row.ifood_market_share, 80),
      density99: num(row.density_99, 60),
      densityPotential: num(row.density_potential, 60),
      supplyReadiness: num(row.supply_readiness, 60),
      strategicValue: num(row.strategic_value, 50),
      avgMealPrice: num(row.avg_meal_price, 55),
      lat: num(row.lat, -15.0),
      lng: num(row.lng, -50.0),
      note: String(row.note || '').trim(),
    });
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, cities: out };
}

// ────────────────────── benchmarks.csv ──────────────────────

// Maps user-facing metric_name → benchmarks object path.
const BENCHMARK_KEYS = {
  avg_order_value:           'avgOrderValue',
  ifood_commission:          'ifoodCommission',
  rider_hourly_wage:         'riderHourlyWage',
  rider_min_per_order:       'riderMinPerOrder',
  rider_per_km:              'riderPerKm',
  cac_new_user:              'cacNewUser',
  organic_share_launched:    'organicShareLaunched',
  industry_reality_subsidy:  'industryRealitySubsidy',
};

export async function parseBenchmarksCsv(input) {
  const res = await parseCsv(input);
  const errors = [];
  if (!res.data.length) return { ok: false, errors: ['Empty file'] };

  const headers = Object.keys(res.data[0]);
  const missing = ensureColumns(headers, SCHEMAS.benchmarks);
  if (missing.length) return { ok: false, errors: [`Missing columns: ${missing.join(', ')}`] };

  const overrides = {};
  res.data.forEach((row, i) => {
    const line = i + 2;
    const key = String(row.metric_name || '').trim().toLowerCase();
    if (!key) return;
    const target = BENCHMARK_KEYS[key];
    if (!target) {
      errors.push(`Line ${line}: unknown metric "${key}". Allowed: ${Object.keys(BENCHMARK_KEYS).join(', ')}`);
      return;
    }
    const value = num(row.value);
    if (!Number.isFinite(value)) {
      errors.push(`Line ${line} (${key}): value must be a number`);
      return;
    }
    overrides[target] = {
      value,
      unit: String(row.unit || '').trim(),
      source: 'User upload',
      estimated: false,
    };
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, overrides };
}

// ────────────────────── experiment_results.csv ──────────────────────

const ALLOWED_SEGMENTS = [
  'new_user_first', 'new_user_second', 'price_sensitive',
  'silent_recall', 'high_value',
];

/**
 * Refit k per segment via least-squares against (subsidy, conversion_lift)
 * pairs, given the saturation model:  lift(s) = baseRate · (1 − exp(−k·s/avgPrice))
 *
 * For a single segment with N data points, k that minimises Σ (lift_i − f(s_i))²
 * doesn't have a closed form — so we use coarse grid search over k ∈ [0.05, 1.5].
 */
function fitK(samples, baseRate, avgPrice) {
  let best = { k: 0.5, sse: Infinity };
  for (let k = 0.05; k <= 1.5; k += 0.025) {
    let sse = 0;
    samples.forEach(({ subsidy, lift }) => {
      const pred = baseRate * (1 - Math.exp(-k * subsidy / avgPrice));
      sse += (lift - pred) ** 2;
    });
    if (sse < best.sse) best = { k: Number(k.toFixed(3)), sse };
  }
  return best;
}

export async function parseExperimentsCsv(input, defaultElasticity, avgPrice = 55) {
  const res = await parseCsv(input);
  const errors = [];
  if (!res.data.length) return { ok: false, errors: ['Empty file'] };

  const headers = Object.keys(res.data[0]);
  const missing = ensureColumns(headers, SCHEMAS.experiments);
  if (missing.length) return { ok: false, errors: [`Missing columns: ${missing.join(', ')}`] };

  // Group rows by segment
  const bySegment = {};
  res.data.forEach((row, i) => {
    const line = i + 2;
    const seg = String(row.segment || '').trim();
    if (!ALLOWED_SEGMENTS.includes(seg)) {
      errors.push(`Line ${line}: segment "${seg}" not in allowed set: ${ALLOWED_SEGMENTS.join(', ')}`);
      return;
    }
    const subsidy = num(row.subsidy_amount);
    const lift = num(row.conversion_lift);
    if (!Number.isFinite(subsidy) || !Number.isFinite(lift)) {
      errors.push(`Line ${line}: subsidy_amount and conversion_lift must be numbers`);
      return;
    }
    (bySegment[seg] = bySegment[seg] || []).push({ subsidy, lift });
  });

  if (errors.length) return { ok: false, errors };

  // Refit each segment's k against its samples
  const refitted = {};
  for (const [seg, samples] of Object.entries(bySegment)) {
    if (samples.length < 2) {
      errors.push(`Segment "${seg}": need ≥2 (subsidy, lift) samples to refit k`);
      continue;
    }
    const meta = defaultElasticity[seg];
    const fit = fitK(samples, meta.baseRate, avgPrice);
    refitted[seg] = { ...meta, k: fit.k, _refitted: true, _samples: samples.length };
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, refitted };
}
