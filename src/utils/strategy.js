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

/**
 * RFM segment ladder — branches into 5 city archetypes so the GM never
 * sees the same brief twice. The "high-value retention" tail (non-price
 * retention via membership / SLA / dedicated CS) is preserved across all
 * archetypes — it's a universal truth about k=0.15 + organic 70%.
 *
 *   Archetype 1: keetaPresent          → defensive: dormant recall first
 *   Archetype 2: launched + ifood>82   → red-ocean: price-sensitive first
 *   Archetype 3: launched + Tier A/B   → pilot:    new-user funnel first
 *   Archetype 4: !launched + entry≥50  → cold:     activation first
 *   Archetype 5: default (hold/watch)  → minimal:  small budget, observe
 */
function segmentLadder(city) {
  const highValueTail = {
    segment: 'High-value retention',
    rationale:
      '弹性 k=0.15 + 自然转化 70% —— 价格刺激 ROI 必然 < 1。' +
      '但留存依然是核心目标——通过服务体验差异化建立 switching cost，对抗 iFood 高 LTV 用户流失。',
    tactics: ['会员权益', '优先派单', '客服 SLA', '专属客服热线'],
    priority: 99,
  };

  // ── Archetype 1: Contest mode — Keeta beachhead, we go IN to fight (Santos) ──
  // For launched markets where Keeta arrived later (SP), the market is already
  // a red-ocean iFood lock-in — route to mature archetype below.
  if (city.keetaPresent && !city.isLaunched) {
    return [
      {
        segment: 'Dormant · silent recall',
        rationale: `${city.name} 是 Keeta 滩头，目标是抢签那些已接触过 99Food 但被 Keeta 撬走的用户。` +
          '已注册用户切换成本最低，召回 ROI 高于纯新客。',
        priority: 1,
      },
      {
        segment: 'New user · first order',
        rationale: '基本盘必须稳——但补贴严格卡在 sweet spot，' +
          '不与 Keeta 比拼券额（Keeta 五年 R$5.6B 弹药 vs 我们补贴战必输）。',
        priority: 2,
      },
      {
        segment: 'Price-sensitive segment',
        rationale: '防御性人群——最容易被 Keeta 低券额撬动。' +
          '差异化打法：99Pay 折扣 + 99 mobility 跨业积分绑定，降低跳转概率。',
        priority: 3,
      },
      highValueTail,
    ];
  }

  // ── Archetype 2: Launched + mature iFood market (SP / Rio / BH) ────
  if (city.isLaunched && city.ifoodShare > 82) {
    return [
      {
        segment: 'Price-sensitive segment',
        rationale: `${city.name} iFood 锁定 ${city.ifoodShare}%，是被 iFood 用补贴教育多年的红海。` +
          '这部分用户对绝对价差敏感，是从 iFood 那里抢边际订单最容易撬动的层。',
        priority: 1,
      },
      {
        segment: 'New user · second order',
        rationale: '复购阶梯：首单已破冰，二单决定能否进入习惯期。' +
          'k=0.45 仍可观，是把月活转成月留存的核心节点。',
        priority: 2,
      },
      {
        segment: 'New user · first order',
        rationale: '红海里拉新成本上升——必须严格卡在 sweet spot 精准投放，' +
          '避免与 iFood 进入券额竞赛。',
        priority: 3,
      },
      highValueTail,
    ];
  }

  // ── Archetype 3: Launched + pilot/secondary (Goiânia / Salvador / Fortaleza) ──
  if (city.isLaunched && (city._tier === 'A' || city._tier === 'B')) {
    return [
      {
        segment: 'New user · first order',
        rationale: `${city.name} 处于模型验证阶段——拉新单 ROI 是否符合 Goiânia 复制玩法的 sweet spot 预测，` +
          '决定是否能 D90 跨过飞轮临界。这是 pilot 的根基。',
        priority: 1,
      },
      {
        segment: 'New user · second order',
        rationale: '首单后 30 天内的复购窗口——习惯养成 = 飞轮启动的前置条件，' +
          '比拉纯新客更要紧。Goiânia 45 天破百万单的核心就是这一阶。',
        priority: 2,
      },
      {
        segment: 'Dormant · silent recall',
        rationale: '已接触过的用户唤回成本最低，pilot 阶段就要建立召回 pipeline，' +
          '为 D90 后规模化做储备。',
        priority: 3,
      },
      highValueTail,
    ];
  }

  // ── Archetype 4: Unlaunched candidate with high entry score ────────
  if (!city.isLaunched && (city._entryScore ?? 0) >= 50) {
    return [
      {
        segment: 'New user · first order',
        rationale: `${city.name} 是冷启动城市，零自然转化——补贴每 R$ 都是真增量。` +
          '90 天内首单密度直接决定能否达到飞轮临界。',
        priority: 1,
      },
      {
        segment: 'Price-sensitive segment',
        rationale: '建立"99Food = 性价比"初始心智的窗口期。' +
          '这部分用户尚未对外卖品牌产生 lock-in，是抢先建立认知的最佳目标。',
        priority: 2,
      },
      {
        segment: 'New user · second order',
        rationale: '冷启动后 30 天的习惯锚点——' +
          '直接决定 D90 时自然单占比能否达 40% 飞轮临界。',
        priority: 3,
      },
      highValueTail,
    ];
  }

  // ── Archetype 5: Default — hold / watch cities, minimal-budget mode ──
  return [
    {
      segment: 'New user · first order',
      rationale: `${city.name} 优先级低，预算受限——只投最高弹性人群拉首单，` +
        '观察 30 天 ROI 决定是否继续投入。',
      priority: 1,
    },
    {
      segment: 'Dormant · silent recall',
      rationale: '低成本召回 pipeline，配合首单券形成最小可行运营，' +
        '保留再评估窗口。',
      priority: 2,
    },
    {
      segment: 'Price-sensitive segment',
      rationale: '次要预算池——观察响应再决定加码或撤退。',
      priority: 3,
    },
    highValueTail,
  ];
}

/**
 * Merchant ramp — population-scaled M1 + city-archetype-specific detail copy.
 *
 *   Counts:  M1 = max(50, pop / 20_000)   M2 = M1 × 2.5    M3 = M1 × 5
 *   Display rounding: <100 → step 5;  100–999 → step 50;  ≥1000 → step 100
 *
 *   Detail copy varies by archetype so São Paulo doesn't read the same
 *   "head chains as anchor" line as Florianópolis.
 */
function roundMerchant(n) {
  if (n < 100)  return Math.ceil(n / 5)   * 5;
  if (n < 1000) return Math.ceil(n / 50)  * 50;
  return            Math.ceil(n / 100) * 100;
}

function merchantArchetype(city) {
  // Contest = unlaunched Keeta beachhead (Santos). Launched + Keeta routes
  // to mature: that's red-ocean defense, not beachhead attack.
  if (city.keetaPresent && !city.isLaunched)               return 'contest';
  if (city.isLaunched && city.ifoodShare > 82)             return 'mature';
  if (city.isLaunched && (city._tier === 'A' || city._tier === 'B')) return 'pilot';
  if (!city.isLaunched && (city._entryScore ?? 0) >= 50)   return 'candidate';
  return 'minimal';
}

const MERCHANT_DETAIL = {
  contest: {
    m1: '防守优先：抢签 Keeta 尚未签下的头部商户，每家给 90 天免佣 + 流量保底。',
    m2: '区域覆盖率 > 60% 是阻断 Keeta 密度的临界——不到这个数 Keeta 就有缝可钻。',
    m3: '把 Keeta 没有的早餐 / 夜宵时段补齐，用时段差异化锁住用户日均频次。',
  },
  mature: {
    m1: '红海突围靠头部连锁 + iFood 独家品牌挖角——一家麦当劳/Outback 抵 50 家长尾。',
    m2: '密度铺开到住宅区 + 商务园，骑手接单距离从 4.5 km 降到 3.0 km 以内。',
    m3: '飞轮启动信号：自然单占比 > 40%、配送时长稳定 < 30 分钟。',
  },
  pilot: {
    m1: '复制 Goiânia 玩法：区域品牌 + 网红店 + 99 mobility 司机推荐的本地餐厅。',
    m2: '验证完头部模型后向次商圈复制，重点观察 W4→W8 自然单增长曲线。',
    m3: '飞轮启动信号：D90 自然单占比 ≥ 40%，准备进入下一城复制。',
  },
  candidate: {
    m1: '冷启动靠区域优势商家：先签 5–10 家本地连锁做密度锚点，再用网红店带流量。',
    m2: '随首单密度上升铺开住宅区，骑手平均接单距离 < 3.5 km 即过密度门槛。',
    m3: '验证 Goiânia 复制玩法是否在该城市奏效——D90 自然单占比 ≥ 40% 即放量。',
  },
  minimal: {
    m1: '最小可行运营：先签头部 + 高价值长尾，观察首月响应再决定追加。',
    m2: '若 M1 ROI 达标再扩容；不达标进 risk review，重新评估进入时机。',
    m3: '若达 D60 仍未跨密度门槛，启动撤退预案 / 重谈合作模式。',
  },
};

function merchantRamp(city) {
  const m1Raw = Math.max(50, Math.round(city.population / 20_000));
  const m1 = roundMerchant(m1Raw);
  const m2 = roundMerchant(m1Raw * 2.5);
  const m3 = roundMerchant(m1Raw * 5);
  const detail = MERCHANT_DETAIL[merchantArchetype(city)];
  return [
    {
      phase: 'M1', window: 'Week 1–4',
      target: `${m1}+ 商户上线 · 重点 CBD 午餐 + 晚餐双高峰商圈`,
      detail: detail.m1,
    },
    {
      phase: 'M2', window: 'Week 5–8',
      target: `${m2}+ 商户 · 拓宽至住宅区 + 商务园`,
      detail: detail.m2,
    },
    {
      phase: 'M3', window: 'Week 9–13',
      target: `${m3}+ 商户 · 长尾 + 早餐 + 夜宵补全`,
      detail: detail.m3,
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
