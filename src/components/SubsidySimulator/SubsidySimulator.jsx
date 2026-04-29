import { useMemo, useState } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, MinusCircle } from 'lucide-react';
import { SubsidyCurve } from './SubsidyCurve.jsx';
import {
  buildCurve, economicsAtSubsidy, solveSweetSpot, estimateReach, buildInsights,
} from '../../utils/roi.js';
import { EstimatedBadge } from '../shared/EstimatedBadge.jsx';

const SEGMENTS = [
  { id: 'new_user_first',  label: 'New user · first order',  color: '#FFD200' },
  { id: 'new_user_second', label: 'New user · second order', color: '#FFE45C' },
  { id: 'price_sensitive', label: 'Price-sensitive segment',  color: '#3FCB6B' },
  { id: 'silent_recall',   label: 'Dormant · silent recall',  color: '#B8BFD0' },
  { id: 'high_value',      label: 'High-value retention',     color: '#E63946' },
];

const TONE = {
  good: { Icon: TrendingUp,   color: 'text-verde border-verde/40' },
  warn: { Icon: AlertTriangle, color: 'text-signal border-signal/40' },
  note: { Icon: MinusCircle,   color: 'text-ink-300 border-ink-600' },
};

export function SubsidySimulator({ cities, benchmarks, selectedCityId, onSelectCity }) {
  const city = cities.find((c) => c.id === selectedCityId) ?? cities[0];

  const [segmentId, setSegmentId] = useState('new_user_first');
  const [subsidy, setSubsidy] = useState(8);
  const [reachPct, setReachPct] = useState(60);

  const segMeta = benchmarks.elasticity[segmentId];
  const segmentLabel = SEGMENTS.find((s) => s.id === segmentId).label;

  const params = useMemo(() => {
    const baseReach = estimateReach(city, segmentId);
    return {
      k: segMeta.k,
      baseRate: segMeta.baseRate,
      avgPrice: city.avgMealPrice,
      reach: Math.round(baseReach * (reachPct / 100)),
      organicShare: segMeta.organicShare,                    // per-segment, not global
      commission: benchmarks.ifoodCommission.value / 100,    // industry avg as reference
      opsRate: 0.04,
      riderTopup: 2.0,                                       // platform's per-order rider top-up
    };
  }, [city, segmentId, segMeta, reachPct, benchmarks]);

  const curve = useMemo(() => buildCurve({ ...params, sMax: 25, steps: 51 }), [params]);
  const sweet = useMemo(() => solveSweetSpot({ ...params, sMax: 25 }), [params]);
  const current = useMemo(() => economicsAtSubsidy({ subsidy, ...params }), [subsidy, params]);
  const insights = useMemo(
    () => buildInsights({ city, segment: { ...segMeta, label: segmentLabel }, current, sweet }),
    [city, segMeta, segmentLabel, current, sweet]
  );
  const industryReality = benchmarks.industryRealitySubsidy.value;
  // Reality-gap is the wow callout: only when slider is near industry water-level
  // AND the model has a viable sweet spot to contrast against.
  const showRealityGap = sweet?.viable && Math.abs(subsidy - industryReality) <= 3;
  const gap = industryReality - (sweet?.sweetSubsidy ?? 0);

  const realPct = current.totalOrders > 0
    ? (current.incrementalOrders / current.totalOrders) * 100 : 0;

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* ───── LEFT: chart + curve story ───── */}
      <section className="col-span-8 space-y-5">
        <div className="panel p-5">
          <Header city={city} segmentLabel={segmentLabel} sweet={sweet} subsidy={subsidy} />
          <SubsidyCurve
            data={curve}
            currentSubsidy={subsidy}
            sweet={sweet}
            segmentLabel={segmentLabel}
            industryReality={industryReality}
          />
        </div>

        {/* Real vs cannibalized + ROI block */}
        <div className="grid grid-cols-3 gap-5">
          <KpiPanel
            label="Incremental orders"
            value={current.incrementalOrders.toLocaleString('en-US')}
            sub="real new demand"
            tone="signal"
          />
          <KpiPanel
            label="ROI"
            value={Number.isFinite(current.roi) ? `${(current.roi * 100).toFixed(0)}%` : '—'}
            sub={current.roi >= 0 ? 'profitable subsidy' : 'destroying value'}
            tone={current.roi >= 0 ? 'verde' : 'alert'}
          />
          <KpiPanel
            label="Effective CAC"
            value={Number.isFinite(current.cac) ? `R$${current.cac.toFixed(2)}` : '∞'}
            sub={current.cac < 18 ? 'below benchmark' : 'above benchmark'}
            tone={current.cac < 18 ? 'verde' : 'signal'}
          />
        </div>

        {/* Real vs cannibalized split */}
        <div className="panel p-5">
          <div className="label-xs mb-3">Real incremental vs. cannibalized</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-ink-700 overflow-hidden flex">
              <div
                className="h-full bg-verde transition-all"
                style={{ width: `${realPct}%` }}
              />
              <div
                className="h-full bg-alert/70 transition-all"
                style={{ width: `${100 - realPct}%` }}
              />
            </div>
            <div className="num text-sm tabular-nums w-32 text-right">
              <span className="text-verde">{realPct.toFixed(0)}%</span>
              <span className="text-ink-500"> · </span>
              <span className="text-alert">{(100 - realPct).toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-ink-500 mt-2">
            <span>{current.incrementalOrders.toLocaleString()} truly incremental</span>
            <span>{Math.round(current.cannibalisedOrders).toLocaleString()} would have ordered anyway</span>
          </div>
        </div>

        {/* Reality-gap callout — fires when slider is at industry water-level */}
        {showRealityGap && (
          <div className="panel p-4 border-2 border-alert/60 bg-alert/5">
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none">🎯</span>
              <div className="text-sm text-ink-100 leading-relaxed">
                <span className="font-mono text-alert">行业现实补贴 R${industryReality}</span>
                <span className="text-ink-400"> vs </span>
                <span className="font-mono text-verde">模型理论甜点 R${sweet.sweetSubsidy.toFixed(2)}</span>
                <div className="mt-2 text-ink-300">
                  差距 <span className="num text-alert">R${gap.toFixed(2)}</span>，意味着：行业每发 1 单 R${industryReality} 券，
                  有 <span className="num text-alert">R${gap.toFixed(2)}</span> 是花在
                  「本来就会转化的人 + 边际递减区」。
                </div>
                <div className="mt-2 text-ink-200">
                  核心问题不是要不要补贴，是<span className="text-signal">补贴打偏了人群</span>。
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* ───── RIGHT: controls ───── */}
      <aside className="col-span-4 space-y-5">
        <CityPicker cities={cities} selectedCityId={selectedCityId} onSelectCity={onSelectCity} />

        <div className="panel p-5 space-y-5">
          <div className="label-xs">Controls</div>

          {/* Segment selector */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs text-ink-300">Target segment</label>
              <span className="text-[10px] font-mono text-ink-500">
                k = <span className="text-signal">{segMeta.k.toFixed(2)}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SEGMENTS.map((s) => {
                const meta = benchmarks.elasticity[s.id];
                const isActive = s.id === segmentId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSegmentId(s.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm border transition-colors ${
                      isActive
                        ? 'border-signal bg-signal/5 text-ink-100'
                        : 'border-ink-700 hover:border-ink-600 text-ink-300'
                    }`}
                  >
                    <KBar k={meta.k} color={s.color} />
                    <div className="flex-1">{s.label}</div>
                    <span className="num text-xs text-ink-500">{meta.k.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
            {benchmarks.elasticity._meta?.estimated && (
              <div className="mt-2 text-[10px] text-ink-500 font-mono flex items-center gap-1">
                k values: industry priors
                <EstimatedBadge
                  derivation={`incrementalRate(s) = baseRate × (1 − exp(−k · s / avgPrice))\n\nk derived from delivery-marketplace subsidy literature + DiDi Food Mexico playbook (2019–2024). Refittable via uploaded experiment_results.csv.`}
                  source={benchmarks.elasticity._meta.source}
                />
              </div>
            )}
          </div>

          {/* Subsidy slider */}
          <SliderRow
            label="Per-order subsidy"
            value={subsidy}
            min={0} max={25} step={0.5}
            onChange={setSubsidy}
            unit="R$"
            sweet={sweet?.viable ? sweet.sweetSubsidy : null}
          />

          {/* Reach slider */}
          <SliderRow
            label="Audience reach"
            value={reachPct}
            min={10} max={100} step={5}
            onChange={setReachPct}
            unit="%"
            hint={`${params.reach.toLocaleString()} users targeted`}
          />
        </div>

        {/* Spend & GMV summary */}
        <div className="panel p-5 space-y-3">
          <div className="label-xs">Spend snapshot</div>
          <KV k="Total subsidy" v={`R$ ${(current.subsidyCost / 1000).toFixed(0)}K`} />
          <KV k="GMV generated" v={`R$ ${(current.gmv / 1_000_000).toFixed(2)}M`} />
          <KV k="Margin / order" v={`R$ ${current.marginPerOrder.toFixed(2)}`} note="commission − rider − ops" />
          <KV
            k="Incremental profit"
            v={`R$ ${(current.incrementalProfit / 1000).toFixed(0)}K`}
            tone={current.incrementalProfit >= 0 ? 'verde' : 'alert'}
          />
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

function Header({ city, segmentLabel, sweet, subsidy }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="label-xs">Marginal-decay simulator</span>
          <Sparkles className="w-3 h-3 text-signal" />
        </div>
        <h2 className="font-display text-2xl text-ink-100 tracking-tightest mt-1">
          {city.name} <span className="text-ink-500 text-base">· {segmentLabel}</span>
        </h2>
        <p className="text-xs text-ink-500 mt-1 font-mono">
          subsidy R${subsidy.toFixed(1)}
          {sweet?.viable
            ? <> · sweet spot at <span className="text-verde">R${sweet.sweetSubsidy.toFixed(1)}</span></>
            : <span className="text-alert"> · uneconomic — no profitable subsidy exists</span>}
        </p>
      </div>
    </div>
  );
}

function CityPicker({ cities, selectedCityId, onSelectCity }) {
  return (
    <div className="panel p-3">
      <div className="label-xs mb-2">City</div>
      <select
        value={selectedCityId}
        onChange={(e) => onSelectCity(e.target.value)}
        className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-ink-100 font-mono focus:border-signal focus:outline-none"
      >
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.state} {c.isLaunched ? '● live' : '○ candidate'}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, unit, sweet, hint }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs text-ink-300">{label}</label>
        <span className="num text-base">
          {unit === 'R$' ? `R$ ${Number(value).toFixed(1)}` : `${value}${unit}`}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {sweet != null && (
          <div
            className="absolute top-0 -translate-x-1/2 w-px h-3 bg-verde pointer-events-none"
            style={{ left: `${((sweet - min) / (max - min)) * 100}%` }}
            title={`Sweet spot R$${sweet.toFixed(1)}`}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-ink-500 mt-1">
        <span>{unit === 'R$' ? `R$${min}` : `${min}${unit}`}</span>
        {hint ? <span className="text-ink-400">{hint}</span> : <span />}
        <span>{unit === 'R$' ? `R$${max}` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function KBar({ k, color }) {
  // visual indicator for elasticity — bar length proportional to k
  return (
    <div className="w-8 h-1 bg-ink-700 rounded-full overflow-hidden shrink-0">
      <div
        className="h-full"
        style={{ width: `${Math.min(100, k * 130)}%`, background: color }}
      />
    </div>
  );
}

function KpiPanel({ label, value, sub, tone }) {
  const colors = {
    signal: 'border-signal/30',
    verde: 'border-verde/40',
    alert: 'border-alert/50',
  }[tone] ?? '';
  return (
    <div className={`panel p-4 border ${colors}`}>
      <div className="label-xs">{label}</div>
      <div className="font-display text-3xl text-ink-100 tracking-tightest mt-1 tabular-nums">
        {value}
      </div>
      <div className="text-[11px] font-mono text-ink-500 mt-1">{sub}</div>
    </div>
  );
}

function KV({ k, v, note, tone }) {
  const color = tone === 'verde' ? 'text-verde' : tone === 'alert' ? 'text-alert' : 'text-ink-100';
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-700/40 pb-2 last:border-0 last:pb-0">
      <dt className="text-ink-400 text-xs">{k}</dt>
      <dd className="text-right">
        <div className={`num text-base ${color}`}>{v}</div>
        {note ? <div className="text-[10px] text-ink-500 font-mono">{note}</div> : null}
      </dd>
    </div>
  );
}
