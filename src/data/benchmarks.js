/**
 * 99Food City Console — business benchmarks
 *
 * Every value carries its source. Estimated values are flagged so the UI can show
 * a (?) badge with the derivation. See DATA_SOURCES.md for full provenance.
 */

export const BENCHMARKS = {
  // ---------- Market context ----------
  brazilMarketSize2024: {
    value: 1.29, unit: 'USD billion',
    // SOURCE: IMARC Group "Brazil Food Delivery Market 2024–2033" (verified)
    source: 'IMARC 2024',
    estimated: false,
  },
  brazilMarketSize2033: {
    value: 4.53, unit: 'USD billion',
    source: 'IMARC 2024 (projection at 15.0% CAGR)',
    estimated: false,
  },
  ifoodMarketShare: {
    value: 80, unit: '%',
    // SOURCE: Reuters 2025 ("80%+ market share"). 87% figure from secondary
    // media is unreliable — sticking to primary reporting.
    source: 'Reuters 2025',
    estimated: false,
  },
  ifoodActiveUsers: {
    value: 55, unit: 'million',
    source: 'iFood institutional data 2024',
    estimated: false,
  },
  ifoodCities: {
    value: 1700, unit: 'cities',
    source: 'iFood 2024 corporate fact sheet',
    estimated: false,
  },
  ifoodRestaurants: {
    value: 400_000, unit: 'restaurants',
    // SOURCE: Reuters 2025. 350k figure was outdated.
    source: 'Reuters 2025',
    estimated: false,
  },
  ifoodMonthlyOrders: {
    value: 120, unit: 'million / month',
    // SOURCE: Reuters 2025. 100M was Aug-2024 milestone; 120M is current.
    source: 'Reuters 2025',
    estimated: false,
  },

  // ---------- 99Food current state ----------
  didi99Investment: {
    value: 2.0, unit: 'BRL billion',
    source: 'TI Inside 2025-09-15 (doubled from R$1B)',
    estimated: false,
  },
  food99CitiesNow: {
    value: 70, unit: 'cities',
    // SOURCE: TI Inside 2026-03-31 ("present in more than 70 cities").
    // NOTE: Of the 30-city benchmark set in this tool, 15 are launched.
    // The 70+ company-wide figure includes smaller cities outside this set.
    source: 'TI Inside 2026-03',
    estimated: false,
  },
  food99CitiesTarget: {
    value: 100, unit: 'cities by mid-2026',
    source: 'TI Inside 2025-09-15',
    estimated: false,
  },
  goianiaOrdersIn45Days: {
    value: 1_000_000, unit: 'orders',
    source: 'Yicai Global 2025-08 (Goiânia pilot)',
    estimated: false,
  },
  spRestaurantsSigned: {
    value: 20_000, unit: 'restaurants',
    source: 'Global Times 2025-08 (São Paulo launch)',
    estimated: false,
  },
  spRidersSigned: {
    value: 50_000, unit: 'riders',
    source: 'Global Times 2025-08',
    estimated: false,
  },
  didiBrazilUsers: {
    value: 55, unit: 'million riders (99 mobility)',
    source: 'DiDi 2025 annual letter',
    estimated: false,
  },
  didiBrazilDrivers: {
    value: 1.5, unit: 'million drivers (99 mobility)',
    source: 'DiDi 2025 annual letter',
    estimated: false,
  },

  // ---------- Keeta competitive context ----------
  keetaInvestment: {
    value: 5.6, unit: 'BRL billion (5y, ≈ USD 1.1B)',
    source: 'Bloomberg 2025-05-13',
    estimated: false,
  },
  keetaLaunchCities: {
    value: ['Santos', 'São Vicente', 'São Paulo + 8 metros'],
    source: 'Caixin 2025-12-01',
    estimated: false,
  },
  keetaCommissionMin: { value: 10, unit: '%', source: 'Rwazi blog 2025', estimated: false },
  keetaCommissionMax: { value: 20, unit: '%', source: 'Rwazi blog 2025', estimated: false },

  // ---------- Unit economics defaults (used by ROI simulator) ----------
  avgOrderValue: {
    value: 55, unit: 'BRL',
    // ESTIMATED: Statista 2021 reported R$46.5; inflated ~18% to 2025
    source: 'Statista 2021 + IPCA inflator',
    estimated: true,
    derivation: 'R$46.5 (Statista 2021) × 1.18 (cumulative IPCA 2021→2025)',
  },
  ifoodCommission: {
    value: 23, unit: '%',
    // SOURCE: Multiple (12-27% range; 23% representative)
    source: 'Rwazi 2025 / industry consensus',
    estimated: true,
    derivation: 'Midpoint of iFood disclosed 12–27% range, weighted toward marketplace average',
  },
  riderHourlyWage: {
    value: 25, unit: 'BRL/hr',
    source: 'iFood Data Portal 2023 (R$23) + 2025 inflator',
    estimated: true,
    derivation: 'iFood disclosed R$23/hr (2023) × 1.09 (IPCA 2023→2025)',
  },
  riderMinPerOrder: {
    value: 7.50, unit: 'BRL (motorbike)',
    source: 'iFood May 2025 minimum-rate update',
    estimated: false,
  },
  riderPerKm: {
    value: 1.50, unit: 'BRL/km',
    source: 'iFood May 2025',
    estimated: false,
  },

  // ---------- Subsidy / growth assumptions ----------
  cacNewUser: {
    value: 18, unit: 'BRL / acquired user',
    // ESTIMATED: industry-benchmark anchor, not budget arithmetic.
    source: 'LatAm delivery industry benchmark',
    estimated: true,
    derivation:
      'LatAm food-delivery CAC range USD 3–5 (iFood / Rappi public IR commentary 2022–2024); ' +
      'BRL/USD ≈ 5.5 → R$ 16–28 native range; R$18 sits at the conservative end, ' +
      'reflecting 99Food late-mover discount via 99 mobility cross-sell. ' +
      'Override via uploaded benchmarks.csv when city A/B data is available.',
  },
  targetLtvCacRatio: {
    value: 3.0, unit: 'ratio',
    source: 'SaaS / marketplace industry standard',
    estimated: false,
  },
  organicShareLaunched: {
    value: 0.35, unit: 'share',
    source: 'Estimated from 99 mobility cross-sell baseline',
    estimated: true,
    derivation: '99Pay + 99 mobility user overlap ≈ 35% of orders are organic in mature city',
  },

  // Industry reality water-level for first-order coupons.
  // The point of contrasting this with the model's sweet spot:
  // exposes that the market burns subsidy on the wrong segments,
  // not on too-low subsidy values.
  industryRealitySubsidy: {
    value: 15, unit: 'BRL',
    source: 'Public coupon observation 2024–2026 (iFood / Rappi / 99Food)',
    estimated: true,
    derivation:
      'iFood / Rappi / 99Food first-order coupons publicly observed at R$10–R$20. ' +
      'Midpoint R$15 used as the "industry reality" reference line. ' +
      'Compare against the model\'s per-segment sweet spot to expose mis-targeted spend.',
  },

  // ---------- Subsidy elasticity (k values) — drives marginal-decay curve ----------
  // incrementalConversion(s) = baseRate * (1 - exp(-k * s / avgPrice))
  // These k values are the SOUL of the model. UI lets user upload A/B data to refit.
  elasticity: {
    // organicShare = fraction of segment that would convert WITHOUT subsidy.
    // Cold new users → 0; loyal high-value → 0.70.
    new_user_first:    { k: 0.60, baseRate: 0.08, organicShare: 0.00, label: 'New user — first order' },
    new_user_second:   { k: 0.45, baseRate: 0.12, organicShare: 0.10, label: 'New user — second order' },
    price_sensitive:   { k: 0.50, baseRate: 0.18, organicShare: 0.20, label: 'Price-sensitive segment' },
    silent_recall:     { k: 0.40, baseRate: 0.10, organicShare: 0.05, label: 'Dormant / silent recall' },
    high_value:        { k: 0.15, baseRate: 0.32, organicShare: 0.70, label: 'High-value retention' },
    // Source: Marketplace subsidy elasticity literature + Mexico DiDi Food playbook (2019-2024)
    // ESTIMATED. Uploadable via experiment_results.csv to refit per segment.
    _meta: { estimated: true, source: 'Industry priors; refittable' },
  },
};

// IPCA index used for inflators above (cumulative, 2021 base).
// SOURCE: IBGE IPCA — 2021 +10.06%, 2022 +5.79%, 2023 +4.62%, 2024 +4.83% (verified)
export const IPCA_2021_TO_2025 = 1.18;
