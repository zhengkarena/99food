import { useMemo, useState } from 'react';
import { Sparkles, Zap, AlertTriangle, TrendingUp, MinusCircle } from 'lucide-react';
import { ForecastChart } from './ForecastChart.jsx';
import { runForecast, STRATEGIES, buildForecastInsights, FLYWHEEL_THRESHOLD } from '../../utils/forecast.js';
import { rankCities } from '../../utils/scoring.js';
import { DEFAULT_WEIGHTS } from '../../data/cities.js';

const METRICS = [
  { id: 'organicShare',      label: 'Organic share',      hint: 'flywheel signal' },
  { id: 'dailyOrders',       label: 'Daily orders',       hint: 'volume' },
  { id: 'cumulativeProfit',  label: 'Cumulative profit',  hint: 'P&L' },
  { id: 'cac',               label: 'CAC',                hint: 'cost / new user' },
  { id: 'riderHourly',       label: 'Rider hourly',       hint: 'supply health' },
  { id: 'deliveryTime',      label: 'Delivery time',      hint: 'minutes' },
];

const TONE = {
  good: { Icon: TrendingUp,   color: 'text-verde border-verde/40' },
  warn: { Icon: AlertTriangle, color: 'text-signal border-signal/40' },
  note: { Icon: MinusCircle,   color: 'text-ink-300 border-ink-600' },
};

export function UnitEconomics({ city, benchmarks, cities }) {
  // Re-rank to attach _tier etc to the active city
  const ranked = useMemo(() => rankCities(cities, DEFAULT_WEIGHTS), [cities]);
  const enriched = ranked.find((c) => c.id === city.id) ?? city;

  const [metric, setMetric] = useState('organicShare');
  const [keetaAttack, setKeetaAttack] = useState(false);
  const keetaAttackDay = keetaAttack ? 45 : null;

  const forecasts = useMemo(
    () => Object.values(STRATEGIES).map((s) => runForecast(enriched, s, { keetaAttackDay })),
    [enriched, keetaAttackDay]
  );

  // Baseline (no Keeta) — only computed when What-if is on, used to compute
  // the "delayed by N days" comparison number for the worst-case callout.
  const baselineForecasts = useMemo(
    () => keetaAttack
      ? Object.values(STRATEGIES).map((s) => runForecast(enriched, s, {}))
      : null,
    [enriched, keetaAttack]
  );

  const insights = useMemo(() => buildForecastInsights(forecasts), [forecasts]);
  const headline = useMemo(
    () => keetaAttack
      ? buildKeetaCallout(forecasts, baselineForecasts)
      : buildNormalCallout(forecasts),
    [forecasts, baselineForecasts, keetaAttack]
  );

  return (
    <div className="grid grid-cols-12 gap-5">
      <section className="col-span-9 space-y-5">
        {/* Headline callout — normal vs Keeta-attack mode swap colors and copy */}
        <div className={`panel p-4 ${
          keetaAttack
            ? 'border-2 border-alert/60 bg-alert/5'
            : 'border-l-4 border-l-signal'
        }`}>
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-center gap-2">
              {keetaAttack
                ? <AlertTriangle className="w-4 h-4 text-alert" />
                : <Sparkles className="w-4 h-4 text-signal" />}
              <span className="label-xs">
                {keetaAttack ? '最坏情况推演 · Keeta 在 Day 45 抢入' : `90-Day forecast · ${enriched.name}`}
              </span>
            </div>
            <KeetaToggle active={keetaAttack} onChange={setKeetaAttack} />
          </div>
          <div className="flex items-start gap-3">
            {keetaAttack
              ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-alert" />
              : <Zap className="w-5 h-5 shrink-0 mt-0.5 text-signal" />}
            <div className="flex-1">
              <div className={`font-display text-lg leading-tight tracking-tightest mb-1 ${
                keetaAttack ? 'text-alert' : 'text-signal'
              }`}>
                {headline.head}
              </div>
              <div className="text-sm text-ink-100 leading-relaxed whitespace-pre-line">
                {headline.body}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-xs">Three-strategy overlay</div>
              <h2 className="font-display text-xl text-ink-100 tracking-tightest mt-0.5">
                {METRICS.find((m) => m.id === metric).label}
                <span className="text-ink-500 text-sm ml-2 font-sans">· {METRICS.find((m) => m.id === metric).hint}</span>
              </h2>
            </div>
            <MetricPicker metric={metric} onChange={setMetric} />
          </div>
          <ForecastChart forecasts={forecasts} keetaAttackDay={keetaAttackDay} focusMetric={metric} />
        </div>

        {/* Strategy comparison cards */}
        <div className="grid grid-cols-3 gap-4">
          {forecasts.map((f) => (
            <StrategyCard key={f.strategy.id} forecast={f} winner={isWinner(f, forecasts)} />
          ))}
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {insights.map((ins, i) => {
            const t = TONE[ins.tone] ?? TONE.note;
            const Icon = t.Icon;
            return (
              <div key={i} className={`panel p-3 flex items-start gap-3 border ${t.color}`}>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${t.color}`} />
                <p className="text-sm text-ink-200 leading-relaxed">{ins.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT: city vitals + analyst note */}
      <aside className="col-span-3 space-y-4">
        <div className="panel p-4">
          <div className="label-xs mb-2">Forecast city</div>
          <h3 className="font-display text-xl text-ink-100 tracking-tightest mb-1">{enriched.name}</h3>
          <p className="text-xs text-ink-500 font-mono mb-3">{enriched.state} · Tier {enriched._tier} · pop {(enriched.population/1e6).toFixed(2)}M</p>
          <div className="space-y-2">
            <KV k="DAU ceiling (90d)" v={`${(forecasts[0].summary.day90Dau).toLocaleString()}`} />
            <KV k="Flywheel threshold" v={`${(FLYWHEEL_THRESHOLD * 100).toFixed(0)}% organic`} />
            <KV k="Keeta scenario" v={keetaAttack ? `Attack · D${keetaAttackDay}` : 'Off'} tone={keetaAttack ? 'alert' : null} />
          </div>
        </div>

        <div className="panel p-4 border-l-2 border-l-signal">
          <div className="label-xs mb-2">分析师批注</div>
          <p className="text-sm text-ink-200 leading-relaxed">
            「飞轮启动日」= 自然单占比首次跨过 <span className="text-signal">{Math.round(FLYWHEEL_THRESHOLD * 100)}%</span> 的那一天。
            过此日，城市从「补贴拉单」切换到「口碑自驱」，每多 1 单的边际成本降到补贴成本的 1/3 以下。
            这是 99Food 单城投资回收的核心节点——不是盈亏平衡日，是飞轮自驱日。
          </p>
        </div>

        <div className="panel p-4">
          <div className="label-xs mb-2">What-if Keeta</div>
          <p className="text-xs text-ink-300 leading-relaxed">
            模拟 Keeta 在 Day 45 介入：CAC × 1.5，growth × 0.7，飞轮启动日延后约 14 天。
            打开开关看 90 天预测的防御场景——给 GM 的「最坏情况下我们还能不能跑」答案。
          </p>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

/** Normal-mode callout: contrast fastest vs slowest strategy.
 *  Falls back to a neutral version when ignite-day spread is < 10 days
 *  (to avoid overselling a contrast that doesn't exist). */
function buildNormalCallout(forecasts) {
  const igniters = forecasts.filter((f) => f.igniteDay != null);
  if (igniters.length === 0) {
    return {
      head: '90 天内未达飞轮临界',
      body: '当前预测下三种策略均未跨过自然单 40% 临界。需重新评估补贴打靶或目标人群组合。',
    };
  }
  const sorted = [...igniters].sort((a, b) => a.igniteDay - b.igniteDay);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];
  const fastestSpend = fastest.summary.totalSubsidy / 1_000_000;
  const slowestSpend = slowest.summary.totalSubsidy / 1_000_000;
  const dayDelta = slowest.igniteDay - fastest.igniteDay;
  const spendMult = (slowest.summary.totalSubsidy / Math.max(fastest.summary.totalSubsidy, 1)).toFixed(1);

  if (dayDelta < 10) {
    // Tightly clustered — don't oversell the contrast.
    return {
      head: `Day ${fastest.igniteDay} · 飞轮自驱`,
      body: `${fastest.strategy.label} 最早达成，累计支出 R$${fastestSpend.toFixed(2)}M。三种策略的启动日差距小于 10 天，关键差异在累计支出与最终 ROI（见下方对比卡）。`,
    };
  }

  return {
    head: `Day ${fastest.igniteDay} · 飞轮自驱`,
    body:
      `${fastest.strategy.label} 只用 R$${fastestSpend.toFixed(2)}M、${fastest.igniteDay} 天达成自驱；\n` +
      `而 ${slowest.strategy.label} 花了 ${spendMult} 倍预算（R$${slowestSpend.toFixed(2)}M），反而晚 ${dayDelta} 天。\n` +
      `核心洞察：外卖飞轮靠密度，不靠预算。`,
  };
}

/** Keeta-attack callout: defensive scenario, with honest fallback when
 *  any strategy actually fails under attack (ignite > 90 OR profit < 0). */
function buildKeetaCallout(forecasts, baselineForecasts) {
  const goianiaRun = forecasts.find((f) => f.strategy.id === 'goiania');
  const goianiaBaseline = baselineForecasts?.find((f) => f.strategy.id === 'goiania');

  // Identify any strategy that's broken under Keeta
  const broken = forecasts.find((f) => f.igniteDay == null || f.summary.finalProfit < 0);

  // Catastrophic: even Goiânia replica failed
  if (!goianiaRun || goianiaRun.igniteDay == null) {
    return {
      head: '所有策略 90 天内未启动飞轮',
      body:
        'Keeta D45 介入下，三种策略均未跨过自然单 40% 临界。' +
        '机会窗口已关闭 —— 这是「延迟进入」的代价实证。',
    };
  }

  // Honest version: at least one strategy broken, but Goiânia replica survives
  if (broken) {
    return {
      head: `Day ${goianiaRun.igniteDay} · Goiânia 复制仍能启动`,
      body:
        `Keeta D45 介入下，${broken.strategy.label}${broken.igniteDay == null ? ' 90 天内未启动飞轮' : ` 90 天累计亏损 R$${(-broken.summary.finalProfit/1_000_000).toFixed(2)}M`}。\n` +
        `Goiânia 复制仍能 Day ${goianiaRun.igniteDay} 启动，这是先发密度优势的实证。\n` +
        `韧性来自先发密度，不来自预算厚度。`,
    };
  }

  // Best case: all 3 strategies still ignite + profit. Quote Goiânia replica's resilience.
  const baselineDay = goianiaBaseline?.igniteDay ?? goianiaRun.igniteDay;
  const delay = Math.max(0, goianiaRun.igniteDay - baselineDay);
  const profitM = (goianiaRun.summary.finalProfit / 1_000_000).toFixed(2);
  return {
    head: `Day ${goianiaRun.igniteDay} · 韧性预测`,
    body:
      `即便如此，Goiânia 复制策略仍能在 Day ${goianiaRun.igniteDay} 启动飞轮（` +
      `${delay > 0 ? `延后 ~${delay} 天` : '基本未受影响'}），` +
      `90 天累计仍盈利 R$${profitM}M。\n` +
      `韧性来自先发密度，不来自预算厚度。`,
  };
}

function isWinner(f, forecasts) {
  const minIgnite = Math.min(...forecasts.filter((x) => x.igniteDay != null).map((x) => x.igniteDay ?? 999));
  return f.igniteDay === minIgnite;
}

function KeetaToggle({ active, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded border transition-colors ${
        active
          ? 'border-alert text-alert bg-alert/10'
          : 'border-ink-600 text-ink-300 hover:border-alert/60 hover:text-alert'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-alert' : 'bg-ink-500'}`} />
      What-if Keeta @ D45
    </button>
  );
}

function MetricPicker({ metric, onChange }) {
  return (
    <select
      value={metric}
      onChange={(e) => onChange(e.target.value)}
      className="bg-ink-800 border border-ink-700 rounded-md px-2.5 py-1.5 text-xs text-ink-100 font-mono focus:border-signal focus:outline-none"
    >
      {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label} · {m.hint}</option>)}
    </select>
  );
}

function StrategyCard({ forecast, winner }) {
  const f = forecast;
  const profitMillion = (f.summary.finalProfit / 1_000_000).toFixed(2);
  const subsidyMillion = (f.summary.totalSubsidy / 1_000_000).toFixed(2);
  const roi = f.summary.totalSubsidy > 0
    ? Math.round((f.summary.finalProfit / f.summary.totalSubsidy) * 100)
    : null;
  return (
    <div
      className={`panel p-4 border ${winner ? 'border-signal/60' : 'border-ink-700'}`}
      style={{ borderLeftWidth: 4, borderLeftColor: f.strategy.color }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-display text-base text-ink-100 tracking-tightest">{f.strategy.label}</div>
        {winner && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-signal">★ Fastest</span>
        )}
      </div>
      <div className="space-y-1.5 text-xs">
        <KV k="Ignite day" v={f.igniteDay != null ? `D${f.igniteDay}` : '—'} tone={winner ? 'signal' : null} />
        <KV k="Breakeven day" v={f.breakEvenDay != null ? `D${f.breakEvenDay}` : '—'} />
        <KV k="Total spend" v={`R$ ${subsidyMillion}M`} />
        <KV k="90d profit" v={`R$ ${profitMillion}M`} tone={f.summary.finalProfit > 0 ? 'verde' : 'alert'} />
        <KV k="ROI" v={roi != null ? `${roi}%` : '—'} />
      </div>
      <p className="text-[11px] text-ink-400 leading-relaxed mt-2 pt-2 border-t border-ink-700">
        {f.strategy.description}
      </p>
    </div>
  );
}

function KV({ k, v, tone }) {
  const color = tone === 'verde' ? 'text-verde' : tone === 'alert' ? 'text-alert' : tone === 'signal' ? 'text-signal' : 'text-ink-100';
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-400">{k}</dt>
      <dd className={`num ${color}`}>{v}</dd>
    </div>
  );
}
