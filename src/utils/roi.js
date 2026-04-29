/**
 * ROI / subsidy marginal-decay engine
 * ====================================
 *
 * The economic core of the simulator. Three responsibilities:
 *
 *   1. incrementalRate(s)      — what fraction of *targetable* users actually
 *                                convert at subsidy level s (0 → asymptote)
 *   2. economicsAtSubsidy(s)   — translate that rate into orders, GMV,
 *                                gross profit, and ROI for a given city
 *                                + segment + reach
 *   3. solveSweetSpot()        — the point where marginal ROI = 1
 *                                (dropping a R$1 of subsidy returns < R$1
 *                                of incremental gross profit beyond it)
 *
 * MODEL
 * -----
 *   incrementalRate(s) = baseRate × (1 − exp(−k · s / avgPrice))
 *
 *   - As s → ∞,  rate → baseRate  (saturation ceiling per segment)
 *   - k is the segment-specific elasticity (higher = more responsive)
 *   - normalising by avgPrice makes the curve city-agnostic in shape but
 *     city-sensitive in absolute peso amount
 *
 * MARGINAL ROI
 * ------------
 *   marginalROI(s) = (∂ incremental_profit / ∂ s)
 *                  =  (baseRate · (k / avgPrice) · exp(−k · s / avgPrice))
 *                       · margin_per_order
 *                  − 1                                  // each R$1 of subsidy reach is R$1 cost
 *
 *   The sweet spot is the largest s where marginalROI(s) ≥ 0.
 *   Closed-form:
 *     s* = (avgPrice / k) · ln( baseRate · k · margin_per_order / avgPrice )
 *
 *   If the argument of ln() ≤ 1, the segment is uneconomic at *any*
 *   non-trivial subsidy — sweet spot is 0 and the UI flags this.
 */

/** Conversion saturation curve. Returns conversion rate ∈ [0, baseRate]. */
export function incrementalRate(subsidy, k, baseRate, avgPrice) {
  if (subsidy <= 0) return 0;
  return baseRate * (1 - Math.exp(-k * subsidy / avgPrice));
}

/**
 * Gross profit per order (before per-order subsidy).
 *
 * Platform P&L per order, NOT rider P&L:
 *   - Platform revenue        : avgPrice × commission              (from restaurant)
 *   - Platform ops cost       : avgPrice × opsRate                 (payment + support + fraud + tech)
 *   - Platform rider top-up   : riderTopup                         (incentives / peak bonuses;
 *                                                                   the R$7.50 base + R$1.50/km
 *                                                                   is paid mostly by the customer's
 *                                                                   delivery fee, not the platform)
 *
 *   marginPerOrder = commission_revenue − ops_cost − rider_topup
 *
 * Industry benchmark: ~15% of AOV nets to platform on a healthy order.
 */
export function marginPerOrder({
  avgPrice,
  commission = 0.23,
  opsRate = 0.04,
  riderTopup = 2.0,
}) {
  return avgPrice * commission - avgPrice * opsRate - riderTopup;
}

/**
 * Compute the full economics at a given subsidy level.
 *
 *   reach        : number of targetable users in the segment for this city
 *   subsidy      : R$ per order, applied to all converted users
 *   organicShare : share of orders that would happen without subsidy
 *                  → these orders are NOT incremental, they cannibalise
 *
 * Returns scalar economics for THIS subsidy level.
 */
export function economicsAtSubsidy({
  subsidy,
  k,
  baseRate,
  avgPrice,
  reach,
  organicShare,         // segment-specific: 0 for cold new users, ≈0.7 for high-value retention
  commission,
  riderTopup,
  opsRate,
}) {
  const rate = incrementalRate(subsidy, k, baseRate, avgPrice);
  const totalOrders = reach * rate;

  // organicShare = fraction of segment's saturation rate that would convert
  // organically (without subsidy). New users have ~0 (cold start);
  // high-value users have ~0.7 (loyal — they'd order anyway).
  const organicOrders = baseRate * reach * organicShare;
  const incrementalOrders = Math.max(0, totalOrders - organicOrders);
  const cannibalisedOrders = Math.min(totalOrders, organicOrders);

  const m = marginPerOrder({ avgPrice, commission, opsRate, riderTopup });

  const gmv = totalOrders * avgPrice;
  const subsidyCost = totalOrders * subsidy;
  // Profit attribution: only incremental orders earn "new" margin.
  // Cannibalised orders earn the same margin they would have earned anyway,
  // but now we're paying subsidy on them — so they're a pure cost wash.
  const incrementalProfit = incrementalOrders * m - subsidyCost;
  const cac = incrementalOrders > 0 ? subsidyCost / incrementalOrders : Infinity;
  const roi = subsidyCost > 0 ? (incrementalOrders * m) / subsidyCost - 1 : Infinity;

  return {
    subsidy,
    rate,
    totalOrders,
    incrementalOrders,
    cannibalisedOrders,
    organicOrders,
    gmv,
    subsidyCost,
    incrementalProfit,
    marginPerOrder: m,
    cac,
    roi,
  };
}

/**
 * Closed-form sweet spot — the subsidy level where the *next* R$1 of subsidy
 * returns exactly R$1 of incremental gross profit.
 *
 *  d(incrementalProfit) / d(subsidy)
 *    = reach · baseRate · (k/avgPrice) · exp(−k · s / avgPrice) · margin
 *      − reach · rate(s)                                    // marginal subsidy cost on existing converters
 *      − reach · (drate/ds) · subsidy                       // marginal cost on new converters
 *
 * For decision-making, the dominant intuition GM cares about is:
 *
 *    "where does the marginal incremental order × margin == marginal subsidy spend?"
 *
 * The cleanest scalar answer:
 *
 *    s*  s.t.  baseRate · (k/avgPrice) · exp(−k · s / avgPrice) · margin
 *              == (rate(s) + (k/avgPrice) · subsidy · exp(−k · s / avgPrice))
 *
 * We solve this numerically — bisection on a monotone-decreasing marginal curve
 * over s ∈ [0, sMax]. Robust, fast, and avoids scary closed-form blow-ups when
 * the argument of ln() is < 1.
 */
export function solveSweetSpot({
  k, baseRate, avgPrice, reach, organicShare, sMax = 25,
  commission, riderTopup, opsRate,
}) {
  const econ = (s) => economicsAtSubsidy({
    subsidy: s, k, baseRate, avgPrice, reach, organicShare,
    commission, riderTopup, opsRate,
  });

  // Marginal incremental profit per ΔR$0.10 of subsidy
  const dProfit = (s) => {
    const eps = 0.1;
    const a = econ(s).incrementalProfit;
    const b = econ(s + eps).incrementalProfit;
    return (b - a) / eps;
  };

  // If even the first peso is unprofitable at the margin, sweet spot = 0
  if (dProfit(0.5) <= 0) return { sweetSubsidy: 0, viable: false };

  // Bisect for largest s with dProfit(s) ≥ 0
  let lo = 0, hi = sMax;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (dProfit(mid) > 0) lo = mid;
    else hi = mid;
  }
  return { sweetSubsidy: lo, viable: lo > 0.05 };
}

/**
 * Build a curve sample for plotting.
 *
 * Returns an array of points along [0, sMax] with both cumulative incremental
 * orders and the marginal-orders-per-extra-R$1 (the "decay" curve).
 */
export function buildCurve({
  k, baseRate, avgPrice, reach, organicShare, sMax = 25, steps = 51,
  commission, riderTopup, opsRate,
}) {
  const out = [];
  let prevIncremental = 0;
  for (let i = 0; i < steps; i++) {
    const s = (i / (steps - 1)) * sMax;
    const e = economicsAtSubsidy({
      subsidy: s, k, baseRate, avgPrice, reach, organicShare,
      commission, riderTopup, opsRate,
    });
    const ds = i === 0 ? 0 : sMax / (steps - 1);
    // marginalOrdersPerReal = ΔincrementalOrders / ΔR$
    const marginalPerReal = ds > 0 ? (e.incrementalOrders - prevIncremental) / ds : 0;
    out.push({
      subsidy: Number(s.toFixed(2)),
      cumulativeOrders: Math.round(e.incrementalOrders),
      marginalPerReal: Math.round(marginalPerReal),
      roi: e.roi,
    });
    prevIncremental = e.incrementalOrders;
  }
  return out;
}

/**
 * Estimate a target reach for the city × segment combo.
 *
 * Reach is the addressable population in this segment within the city.
 * We use a coarse but defensible model:
 *
 *   reach = population × deliveryUserShare × segmentShare
 *
 *   deliveryUserShare → ESTIMATED. National benchmark: ~30% of urban adults
 *                       are active delivery users (iFood 55M / Brazil pop).
 *   segmentShare      → segment-specific slice (new users 25%,
 *                       price_sensitive 35%, silent_recall 20%,
 *                       high_value 15%, new_user_second 25%)
 *
 * Override available via uploaded benchmarks.csv.
 */
export const SEGMENT_SHARE = {
  new_user_first:    0.25,
  new_user_second:   0.18,
  price_sensitive:   0.35,
  silent_recall:     0.20,
  high_value:        0.15,
};

export function estimateReach(city, segmentId) {
  const DELIVERY_USER_SHARE = 0.30;          // iFood 55M / Brazil ~213M
  const segmentShare = SEGMENT_SHARE[segmentId] ?? 0.25;
  return Math.round(city.population * DELIVERY_USER_SHARE * segmentShare);
}

/** Generate human-readable insight bullets from a simulation snapshot. */
export function buildInsights({ city, segment, current, sweet }) {
  const insights = [];
  const realPct = current.totalOrders > 0
    ? (current.incrementalOrders / current.totalOrders) * 100 : 0;
  const cannPct = 100 - realPct;

  insights.push({
    tone: realPct < 50 ? 'warn' : 'good',
    text: `当前补贴下，${realPct.toFixed(0)}% 是真实增量订单，${cannPct.toFixed(0)}% 给了本来就会下单的人。`,
  });

  if (sweet.viable && Math.abs(current.subsidy - sweet.sweetSubsidy) > 1) {
    if (current.subsidy > sweet.sweetSubsidy) {
      const wasted = (current.subsidy - sweet.sweetSubsidy) * current.totalOrders;
      insights.push({
        tone: 'warn',
        text: `已超过甜点 R$${sweet.sweetSubsidy.toFixed(1)}。降至甜点可省 R$${(wasted / 1000).toFixed(0)}K，转向 ${segment.label.includes('high') ? '新用户首单' : '高价值留存'} 拉留存。`,
      });
    } else {
      insights.push({
        tone: 'good',
        text: `还在甜点之内（R$${sweet.sweetSubsidy.toFixed(1)} 之前）。可加注，但越接近甜点边际越平。`,
      });
    }
  } else if (!sweet.viable) {
    insights.push({
      tone: 'warn',
      text: `${segment.label} 在 ${city.name} 弹性不足以覆盖补贴成本——任意补贴 ROI 都 < 1。换人群或砍预算。`,
    });
  }

  if (current.subsidy > 12 && segment.k > 0.4) {
    insights.push({
      tone: 'note',
      text: `每多投 1 元补贴，仅带来 ${current.subsidy >= 15 ? '< 0.3' : '~0.5'} 单增量。曲线已进入平坦区。`,
    });
  }

  return insights;
}
