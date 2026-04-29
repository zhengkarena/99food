/**
 * Strategy Brief Generator
 * ========================
 *
 * Pure-logic module. Consumes a city (with attached _flywheelScore /
 * _entryScore / _tier / _recommendation from scoring.js) plus benchmarks,
 * and emits a structured strategic brief consumed by the UI.
 *
 *   Output sections:
 *     - verdict      : enter-now / 6m / 12m / hold + headline rationale
 *     - segments     : RFM-ranked target segments
 *     - merchant     : M1 / M2 / M3 ramp
 *     - subsidyBudget: how to split the spend
 *     - milestones   : 30/60/90 KPIs
 *     - risks        : iFood counter / Keeta entry / supply gap
 *     - whyHere      : citations from underlying data
 *
 * Deliberately readable — every conditional in this file is something we
 * can explain to the GM out loud during the 5-minute demo.
 */

export const VERDICT_META = {
  'enter-now':  { label: '立即进入',     tone: 'verde',  pill: 'ENTER NOW' },
  'enter-6m':   { label: '6 个月后进入',  tone: 'signal', pill: 'ENTER · 6M' },
  'enter-12m':  { label: '12 个月后观察', tone: 'orange', pill: 'WATCH · 12M' },
  'hold':       { label: '暂不进入',     tone: 'muted',  pill: 'HOLD' },
  'launched':   { label: '已上线 · 优化', tone: 'signal', pill: 'OPTIMIZE' },
  'contest':    { label: '抢滩对抗',     tone: 'alert',  pill: 'CONTEST' },
};

/** Top-level verdict from city status + entry score. */
function decideVerdict(city) {
  if (city.isLaunched) return 'launched';
  if (city.keetaPresent) return 'contest';
  if (city._entryScore >= 55) return 'enter-now';
  if (city._entryScore >= 50) return 'enter-6m';
  if (city._entryScore >= 45) return 'enter-12m';
  return 'hold';
}

/** Pick the top RFM segments for this city, ordered by ROI fit. */
function segmentLadder(city) {
  // Lower-AOV cities favour price-sensitive + new-user-first.
  // Higher-AOV cities favour second-order habit + selective high-value.
  const lowAOV = city.avgMealPrice <= 50;
  const tourismBent = /tourism|beach|hub/i.test(city.note ?? '');

  const ladder = [
    {
      segment: 'New user · first order',
      rationale: '最高弹性 (k=0.60)，组件零自然转化——补贴每 R$ 都是真增量。',
      priority: 1,
    },
    {
      segment: lowAOV ? 'Price-sensitive segment' : 'New user · second order',
      rationale: lowAOV
        ? '低 AOV 城市价格敏感人群密度高，二阶 ROI 仅次于首单。'
        : '高 AOV 城市重点是把首单用户转成习惯，二阶 k=0.45 仍可观。',
      priority: 2,
    },
    {
      segment: 'Dormant · silent recall',
      rationale: '已接触过但流失的用户，唤回成本低于纯新客。',
      priority: 3,
    },
  ];
  if (tourismBent) {
    ladder.splice(2, 0, {
      segment: 'Tourist & weekend bursts',
      rationale: '旅游城周末峰值需求 30%+，专门人群预算独立配比。',
      priority: 2.5,
    });
  }
  // Always last: high-value retention with a warning, NOT a recommendation
  ladder.push({
    segment: 'High-value retention',
    rationale: '⚠ k=0.15，70% 自然转化——任何首单券形式补贴都是浪费。改用积分 / 会员。',
    priority: 99,
  });
  return ladder;
}

function merchantRamp(city) {
  const tier = city._tier;
  // M1 reflects how aggressive we can be in week 1
  const m1 = tier === 'S' ? 800 : tier === 'A' ? 500 : 300;
  return [
    {
      phase: 'M1',
      window: 'Week 1–4',
      target: `${m1}+ 商户上线 · 重点 CBD 午餐 + 晚餐双高峰商圈`,
      detail: '先签 50 家头部品牌（连锁 + 网红）作为 anchor，再放量长尾。',
    },
    {
      phase: 'M2',
      window: 'Week 5–8',
      target: `${Math.round(m1 * 2.5)}+ 商户 · 拓宽至住宅区 + 商务园`,
      detail: '密度铺开，骑手平均接单距离应从 4.5 km 降到 3.0 km 以内。',
    },
    {
      phase: 'M3',
      window: 'Week 9–13',
      target: `${Math.round(m1 * 5)}+ 商户 · 长尾 + 早餐 + 夜宵补全`,
      detail: '飞轮启动信号：自然单量占比 > 40%、骑手时薪稳定在 R$ 25 以上。',
    },
  ];
}

function budgetSplit(city, benchmarks) {
  // Default mix: 50% user acquisition / 30% rider supply / 15% merchant / 5% brand
  // City-level adjustments
  const heavyCompetition = city.ifoodShare >= 84 || city.keetaPresent;
  const supplyConstrained = city.supplyReadiness < 65;
  const userPct      = heavyCompetition ? 55 : 45;
  const riderPct     = supplyConstrained ? 35 : 25;
  const merchantPct  = heavyCompetition ? 15 : 20;
  const brandPct     = 100 - userPct - riderPct - merchantPct;
  return [
    { bucket: 'User acquisition (sweet-spot subsidy on new users)', pct: userPct },
    { bucket: 'Rider supply (top-up incentives + onboarding)',     pct: riderPct },
    { bucket: 'Merchant subsidy (commission relief week 1–4)',     pct: merchantPct },
    { bucket: 'Brand & launch ops',                                pct: brandPct },
  ];
}

function milestones(city) {
  const popMillions = city.population / 1_000_000;
  const expectedDailyOrders30 = Math.round(popMillions * 600);     // ~600 orders/day per 1M pop @ launch
  const expectedDailyOrders60 = Math.round(popMillions * 2000);
  const expectedDailyOrders90 = Math.round(popMillions * 4500);
  return [
    {
      day: 30,
      kpi: `日单量 ${expectedDailyOrders30.toLocaleString()} · 商户 ${city._tier === 'S' ? 1200 : 800}+`,
      gate: '日单量 < 60% 目标 → 加码新客补贴 + 商户首月免佣',
    },
    {
      day: 60,
      kpi: `日单量 ${expectedDailyOrders60.toLocaleString()} · 骑手时薪稳定 R$ 25+`,
      gate: '骑手时薪 < R$ 22 → 立即触发 supply-side 补贴',
    },
    {
      day: 90,
      kpi: `日单量 ${expectedDailyOrders90.toLocaleString()} · 自然单占比 ≥ 40%`,
      gate: '自然单 < 30% → 飞轮未启动，进 risk review',
    },
  ];
}

function riskFlags(city, benchmarks) {
  const risks = [];
  if (city.ifoodShare >= 84) {
    risks.push({
      level: 'high',
      title: 'iFood 反击',
      detail: `${city.name} iFood 锁定率 ${city.ifoodShare}%，任何动作都会触发反向补贴战。建议预留 30% 弹药应对 90 天反击窗口。`,
    });
  }
  if (city.keetaPresent) {
    risks.push({
      level: 'high',
      title: 'Keeta 同城',
      detail: `Keeta 已在 ${city.name} 落地（5 年 R$ 5.6B 弹药）。低佣金 10–20% + 零配送费策略，会拉高骑手 / 商户成本。差异化打法：99 mobility 司机 + 99Pay 支付。`,
    });
  }
  if (city.supplyReadiness < 65) {
    risks.push({
      level: 'medium',
      title: '骑手供给瓶颈',
      detail: `Supply readiness ${city.supplyReadiness}/100，建议提前 30 天启动 99 mobility 跨业转化计划，避免上线时配送时长爆破。`,
    });
  }
  if (city._tier === 'S' && !city.isLaunched) {
    risks.push({
      level: 'medium',
      title: 'Tier-S 拖延成本',
      detail: 'Tier-S 城市每延后 1 个月，竞品多累积 ~1M 单的飞轮加速。机会窗口正在收窄。',
    });
  }
  return risks;
}

/**
 * Top-level entry point — returns a complete brief structure.
 * `city` must be a ranked city (with _flywheelScore / _entryScore / _tier
 * / _recommendation attached by rankCities()).
 */
export function generateBrief(city, benchmarks) {
  const verdictId = decideVerdict(city);
  return {
    verdictId,
    verdict: VERDICT_META[verdictId],
    headline: headlineFor(verdictId, city),
    segments: segmentLadder(city),
    merchantRamp: merchantRamp(city),
    budget: budgetSplit(city, benchmarks),
    milestones: milestones(city),
    risks: riskFlags(city, benchmarks),
    whyHere: whyHere(city, benchmarks),
  };
}

function headlineFor(verdictId, city) {
  const map = {
    'enter-now':  `${city.name} 是下一波扩张的高优先候选——立即启动 90 天进入计划。`,
    'enter-6m':   `${city.name} 是 6 个月后的下一波目标——先打通 ${city._tier === 'B' ? '密度' : '战略'} 验证。`,
    'enter-12m':  `${city.name} 12 个月后再评估，当前优先级低于 5 个 Enter 候选。`,
    'hold':       `${city.name} 短期 ROI 不支持进入，建议等基础设施 / 收入水平改善后再评。`,
    'launched':   `${city.name} 已上线，重心从「破冰」切换到「补贴打靶 + 飞轮加速」。`,
    'contest':    `${city.name} 是 Keeta 滩头——抢滩战 ROI 不靠纯补贴，要靠 99 母资产差异化。`,
  };
  return map[verdictId];
}

function whyHere(city, benchmarks) {
  return [
    { fact: `Population ${(city.population / 1_000_000).toFixed(2)}M`,           source: 'IBGE 2022 Census' },
    { fact: `GDP/capita R$ ${city.gdpPerCapita.toLocaleString('pt-BR')}`,         source: 'IBGE PIB Municípios 2021' },
    { fact: `iFood share ~${city.ifoodShare}%`,                                  source: 'Estimated · capital + region rule' },
    { fact: `Flywheel score ${city._flywheelScore} · Tier ${city._tier}`,        source: 'Module 1 scoring engine' },
    { fact: `Entry priority ${city._entryScore}`,                                source: 'Module 1 entry-priority engine' },
    { fact: city.keetaPresent ? 'Keeta in market — contest priority' : 'Keeta not yet present',
      source: city.keetaPresent ? 'Bloomberg 2025-10-30' : '—' },
  ];
}
