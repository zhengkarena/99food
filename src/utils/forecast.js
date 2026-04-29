/**
 * 90-Day Unit Economics Forecast
 * ===============================
 *
 * Pure-logic engine. Given a city + a strategy preset (+ optional Keeta-attack
 * scenario), simulates 13 weeks of:
 *
 *   - DAU                   (logistic growth toward city ceiling)
 *   - daily orders          (DAU × frequency, frequency itself an S-curve)
 *   - CAC                   (decays as organic share rises)
 *   - LTV/CAC               (rises with retention)
 *   - rider hourly earnings (orders × per-order revenue ÷ riders)
 *   - delivery time         (improves with merchant + rider density)
 *   - cumulative subsidy    (paid acquisition + rider top-up)
 *   - cumulative GMV        (sum of daily GMV)
 *   - flywheelOrganicShare  (the headline curve — when this crosses
 *                            FLYWHEEL_THRESHOLD = 0.40 the city is self-sustaining)
 *
 * Two derived "wow" anchors per series:
 *   - igniteDay   : first day organicShare ≥ 0.40 (飞轮启动日)
 *   - breakEvenDay: first day cumulativeProfit ≥ 0  (盈亏平衡日)
 */

export const FLYWHEEL_THRESHOLD = 0.40;

// ───────────────────────── strategy presets ─────────────────────────

export const STRATEGIES = {
  aggressive: {
    id: 'aggressive', label: '激进 · Aggressive',
    color: '#E63946',
    budgetMillionBRL: 40,             // R$40M over 90 days
    growthMultiplier: 1.25,           // burns harder, growth faster
    cacFloor: 12,                     // CAC anchor at floor
    cacStart: 30,                     // initial CAC
    riderTopupBRL: 3.0,               // pays riders more to get supply
    description: '高额补贴 + 大幅商户拓展，最快达到飞轮启动，但 ROI 短期为负。',
  },
  balanced: {
    id: 'balanced', label: '稳健 · Balanced',
    color: '#FFD200',
    budgetMillionBRL: 25,
    growthMultiplier: 1.0,
    cacFloor: 14,
    cacStart: 25,
    riderTopupBRL: 2.0,
    description: '中等补贴，商户分批上线，平衡飞轮速度与单位经济。',
  },
  goiania: {
    id: 'goiania', label: 'Goiânia 复制',
    color: '#3FCB6B',
    budgetMillionBRL: 18,
    growthMultiplier: 0.95,
    cacFloor: 10,                     // 99 mobility cross-sell drives CAC down
    cacStart: 18,
    riderTopupBRL: 1.5,
    description: '复制 Goiânia 玩法：99 mobility 司机交叉转化 + 中频补贴 + 区域聚焦，ROI 最优。',
  },
};

// ───────────────────────── simulation core ─────────────────────────

/**
 * Logistic growth toward a city-specific DAU ceiling.
 * dau(t) = ceiling / (1 + exp(-r·(t-tMid)))
 */
function logisticGrowth(t, ceiling, r, tMid) {
  return ceiling / (1 + Math.exp(-r * (t - tMid)));
}

/**
 * Run the 90-day simulation for one strategy.
 * `keetaAttackDay` (optional): day at which a Keeta defensive scenario
 * triggers — adds a sudden CAC bump and slows growth.
 */
export function runForecast(city, strategy, opts = {}) {
  const { keetaAttackDay = null } = opts;
  const days = 91;                    // 0..90

  // ───── city-specific calibration ─────
  // DAU ceiling = some fraction of population that becomes daily-active in 90 days.
  // Baseline 0.6% of population × Tier multiplier (S/A higher density potential).
  const tierMult = city._tier === 'S' ? 1.4 : city._tier === 'A' ? 1.1 : city._tier === 'B' ? 0.9 : 0.6;
  const dauCeiling = Math.round(city.population * 0.006 * tierMult * strategy.growthMultiplier);

  // logistic params: speed (r) and midpoint (tMid). Tier-S grows faster.
  const r = 0.10 * strategy.growthMultiplier;
  const tMid = 38;                    // ~midpoint of 90-day curve

  const series = [];
  let cumulativeSubsidy = 0;
  let cumulativeGMV = 0;
  let cumulativeProfit = 0;
  let igniteDay = null;
  let breakEvenDay = null;

  for (let day = 0; day <= 90; day++) {
    // Keeta attack: sudden 30% slowdown + CAC spike for the rest of the run
    const underAttack = keetaAttackDay != null && day >= keetaAttackDay;
    const attackDrag = underAttack ? 0.7 : 1.0;

    // Core curves
    const dau = Math.round(logisticGrowth(day, dauCeiling, r, tMid) * attackDrag);
    // frequency: S-curve from 0.4 → 1.2 orders/DAU/day over 90 days
    const freq = 0.4 + 0.8 / (1 + Math.exp(-0.10 * (day - 45)));
    const dailyOrders = Math.round(dau * freq);

    // Organic share builds at different speeds per strategy:
    //  - Aggressive: paid acquisition floods the funnel with low-stickiness users → late ignition
    //  - Goiânia-replica: density focus + 99 mobility cross-sell = early organic stickiness
    //  - Balanced: middle ground
    const organicMid =
      strategy.id === 'aggressive' ? 60
      : strategy.id === 'goiania'  ? 42
      :                              50;
    const organicBase = 0.05 + 0.55 / (1 + Math.exp(-0.10 * (day - organicMid)));
    // Keeta attack drags organic share down (users have alternative)
    const organicShare = underAttack ? organicBase * 0.75 : organicBase;

    // CAC: decays from cacStart to cacFloor with organic momentum
    const cacOrganic = strategy.cacStart - (strategy.cacStart - strategy.cacFloor) * organicShare;
    const cac = underAttack ? cacOrganic * 1.5 : cacOrganic;     // Keeta forces CAC up

    // Daily new users: roughly proportional to DAU growth rate
    const yesterdayDau = day === 0 ? 0 : series[day - 1].dau;
    const newUsers = Math.max(0, dau - yesterdayDau) + Math.round(dau * 0.02);  // churn replacement

    // Rider supply: scales with order density. Riders earn (gmv × commission − ops) ÷ riders.
    const riderCount = Math.max(1, Math.round(dailyOrders / 18));    // 18 orders per rider per day
    const gmv = dailyOrders * city.avgMealPrice;
    const platformRev = gmv * 0.23;
    const riderHourly = (riderHourlyFrom(dailyOrders, riderCount, city.avgMealPrice, strategy.riderTopupBRL));

    // Delivery time: 45min → 28min as density grows
    const baseDeliveryMin = 45 - 17 / (1 + Math.exp(-0.10 * (day - 35)));
    const deliveryTime = underAttack ? baseDeliveryMin + 4 : baseDeliveryMin;

    // Cost / spend
    const acquisitionSpend = newUsers * cac;
    const riderTopupSpend = dailyOrders * strategy.riderTopupBRL;
    const dailySubsidy = acquisitionSpend + riderTopupSpend;
    cumulativeSubsidy += dailySubsidy;
    cumulativeGMV += gmv;

    // Profit: platform revenue − ops − rider topup − acquisition
    const opsCost = gmv * 0.04;
    const dailyProfit = platformRev - opsCost - dailySubsidy;
    cumulativeProfit += dailyProfit;

    if (igniteDay === null && organicShare >= FLYWHEEL_THRESHOLD) igniteDay = day;
    if (breakEvenDay === null && cumulativeProfit >= 0 && day >= 7) breakEvenDay = day;

    series.push({
      day,
      week: Math.floor(day / 7) + 1,
      dau, dailyOrders, freq: Number(freq.toFixed(3)),
      newUsers, organicShare: Number(organicShare.toFixed(3)),
      cac: Number(cac.toFixed(2)),
      ltvCac: Number((organicShare * 4 / Math.max(cac, 1)).toFixed(2)),  // proxy LTV/CAC
      riderCount, riderHourly: Number(riderHourly.toFixed(2)),
      deliveryTime: Number(deliveryTime.toFixed(1)),
      gmv: Math.round(gmv),
      dailySubsidy: Math.round(dailySubsidy),
      cumulativeSubsidy: Math.round(cumulativeSubsidy),
      cumulativeGMV: Math.round(cumulativeGMV),
      cumulativeProfit: Math.round(cumulativeProfit),
      underAttack,
    });
  }

  return {
    strategy,
    series,
    igniteDay,
    breakEvenDay,
    summary: {
      day90Dau: series[90].dau,
      day90DailyOrders: series[90].dailyOrders,
      totalSubsidy: series[90].cumulativeSubsidy,
      totalGMV: series[90].cumulativeGMV,
      finalProfit: series[90].cumulativeProfit,
      finalOrganicShare: series[90].organicShare,
    },
  };
}

/** Approximate rider hourly earnings. */
function riderHourlyFrom(dailyOrders, riderCount, avgPrice, riderTopup) {
  // Each rider does dailyOrders/riderCount orders × ~8 hours/day
  const ordersPerRiderPerHour = (dailyOrders / riderCount) / 8;
  // Per-order rider take = customer delivery fee (R$7.50 avg) + platform topup
  const perOrderRiderTake = 7.50 + riderTopup;
  return ordersPerRiderPerHour * perOrderRiderTake;
}

/** Derived insights for the UI callout strip. */
export function buildForecastInsights(forecasts) {
  const insights = [];
  // Sort by ignition speed
  const byIgnition = [...forecasts].sort((a, b) => (a.igniteDay ?? 999) - (b.igniteDay ?? 999));
  const fastest = byIgnition[0];
  if (fastest?.igniteDay != null) {
    insights.push({
      tone: 'good',
      text: `${fastest.strategy.label} 在 Day ${fastest.igniteDay} 跨过飞轮临界（自然单 ≥ 40%）——最早自驱。`,
    });
  }

  // ROI winner
  const byProfit = [...forecasts].sort((a, b) => b.summary.finalProfit - a.summary.finalProfit);
  const profitWinner = byProfit[0];
  insights.push({
    tone: 'good',
    text: `90 天累计利润 ${profitWinner.strategy.label} 最优 (R$ ${(profitWinner.summary.finalProfit / 1_000_000).toFixed(2)}M)，对应 ROI ${roiOf(profitWinner)}%。`,
  });

  // Spend efficiency
  const efficiencyOrdered = [...forecasts].map((f) => ({
    label: f.strategy.label,
    perOrder: f.summary.totalSubsidy / Math.max(f.series[90].dailyOrders * 90, 1),
  })).sort((a, b) => a.perOrder - b.perOrder);
  insights.push({
    tone: 'note',
    text: `单位订单补贴成本: ${efficiencyOrdered.map((e) => `${e.label.split(' ')[0]} R$${e.perOrder.toFixed(2)}`).join(' · ')}。`,
  });

  return insights;
}

function roiOf(f) {
  const gmv = f.summary.totalGMV;
  const sub = f.summary.totalSubsidy;
  if (sub === 0) return '∞';
  return ((f.summary.finalProfit / sub) * 100).toFixed(0);
}
