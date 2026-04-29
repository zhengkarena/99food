import { useMemo, useRef } from 'react';
import { Download, AlertTriangle, AlertCircle } from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../../data/cities.js';
import { rankCities } from '../../utils/scoring.js';
import { generateBrief } from '../../utils/strategy.js';
import html2pdf from 'html2pdf.js';

const VERDICT_TONE_CLASS = {
  verde:  'border-verde/60 bg-verde/5 text-verde',
  signal: 'border-signal/60 bg-signal/5 text-signal',
  orange: 'border-[#FF8C42]/60 bg-[#FF8C42]/5 text-[#FF8C42]',
  alert:  'border-alert/60 bg-alert/5 text-alert',
  muted:  'border-ink-600 bg-ink-800 text-ink-300',
};

export function StrategyGenerator({ city, benchmarks, cities }) {
  // Re-rank to attach _flywheelScore / _entryScore / _tier on the active city
  const ranked = useMemo(() => rankCities(cities, DEFAULT_WEIGHTS), [cities]);
  const enriched = ranked.find((c) => c.id === city.id) ?? city;
  const brief = useMemo(() => generateBrief(enriched, benchmarks), [enriched, benchmarks]);
  const pdfRef = useRef(null);

  async function exportPDF() {
    const node = pdfRef.current;
    if (!node) return;
    // Force white-on-black mode just for the snapshot — restore immediately after.
    node.classList.add('pdf-export-mode');
    // Wait one frame so the browser repaints with the new class before html2canvas reads it.
    await new Promise((r) => requestAnimationFrame(() => r()));
    try {
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `99food-strategy-brief-${city.id}.pdf`,
          image: { type: 'jpeg', quality: 0.96 },
          html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(node)
        .save();
    } finally {
      node.classList.remove('pdf-export-mode');
    }
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-9">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="label-xs">Auto-generated entry brief</div>
            <h2 className="font-display text-2xl text-ink-100 tracking-tightest mt-0.5">
              {city.name} <span className="text-ink-500 text-base">· {city.state}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={exportPDF}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-200 border border-ink-600 hover:border-signal hover:text-signal px-3 py-1.5 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>

        {/* Printable brief */}
        <div ref={pdfRef} className="space-y-5">
          <VerdictBlock brief={brief} city={enriched} />
          <SegmentLadder segments={brief.segments} />
          <MerchantRamp ramp={brief.merchantRamp} />
          <BudgetSplit budget={brief.budget} />
          <MilestoneTrack milestones={brief.milestones} />
          <RiskFlags risks={brief.risks} />
          <WhyHere whyHere={brief.whyHere} />
        </div>
      </div>

      <aside className="col-span-3 space-y-4">
        <div className="panel p-4">
          <div className="label-xs mb-2">City selector</div>
          <p className="text-xs text-ink-400 mb-3">Switch the city in any other tab to regenerate this brief.</p>

          <div className="space-y-2">
            <KV k="Flywheel score" v={enriched._flywheelScore} />
            <KV k="Entry priority" v={enriched._entryScore} />
            <KV k="Tier" v={enriched._tier} />
            <KV k="Population" v={`${(city.population / 1_000_000).toFixed(2)}M`} />
            <KV k="GDP/capita" v={`R$ ${(city.gdpPerCapita / 1000).toFixed(0)}K`} />
            <KV k="iFood share" v={`${city.ifoodShare}%`} />
            <KV k="Keeta" v={city.keetaPresent ? 'Present' : '—'} />
          </div>
        </div>

        <div className="panel p-4 border-l-2 border-l-signal">
          <div className="label-xs mb-2">分析师批注</div>
          <p className="text-sm text-ink-200 leading-relaxed">
            这份简报由 Module 1 + Module 2 自动联动生成：城市评分给「进不进」，
            补贴模型给「怎么花」，加上人群 RFM 阶梯 + 商户节奏 + 风险预警，
            一键 PDF 给业务负责人。
          </p>
        </div>
      </aside>
    </div>
  );
}

// ────────────────────────────────────────────────────────────

function VerdictBlock({ brief, city }) {
  const tone = VERDICT_TONE_CLASS[brief.verdict.tone];
  return (
    <div className={`panel p-5 border-2 ${tone}`}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <span className={`font-mono text-[11px] uppercase tracking-[0.18em] px-2 py-0.5 rounded ${tone}`}>
            {brief.verdict.pill}
          </span>
          <span className="font-display text-xl text-ink-100 tracking-tightest">
            {brief.verdict.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-ink-500">
          Entry score {city._entryScore} · Tier {city._tier}
        </span>
      </div>
      <p className="text-sm text-ink-200 leading-relaxed">{brief.headline}</p>
    </div>
  );
}

function SegmentLadder({ segments }) {
  return (
    <Section title="人群优先级 · RFM 阶梯">
      <ol className="space-y-2">
        {segments.map((s, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-mono text-xs ${
              s.priority === 99
                ? 'bg-alert/20 text-alert'
                : i === 0 ? 'bg-signal text-ink-950' : 'bg-ink-700 text-ink-200'
            }`}>
              {s.priority === 99 ? '!' : Math.round(s.priority)}
            </span>
            <div className="flex-1">
              <div className="text-sm text-ink-100 font-medium">{s.segment}</div>
              <div className="text-xs text-ink-400 leading-relaxed mt-0.5">{s.rationale}</div>
              {s.tactics && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-verde font-mono">→ 改投</span>
                  {s.tactics.map((t, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 rounded text-[10px] font-mono text-verde border border-verde/40 bg-verde/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function MerchantRamp({ ramp }) {
  return (
    <Section title="商家拓展节奏">
      <div className="grid grid-cols-3 gap-3">
        {ramp.map((p, i) => (
          <div key={i} className="border-l-2 border-l-signal pl-3">
            <div className="font-mono text-[11px] text-signal">{p.phase}</div>
            <div className="text-[10px] text-ink-500 font-mono uppercase tracking-wider">{p.window}</div>
            <div className="text-sm text-ink-100 mt-1.5 leading-snug">{p.target}</div>
            <div className="text-xs text-ink-400 mt-1 leading-relaxed">{p.detail}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function BudgetSplit({ budget }) {
  return (
    <Section title="补贴预算分配">
      <div className="space-y-2">
        {budget.map((b, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-ink-200">{b.bucket}</span>
              <span className="num text-sm">{b.pct}%</span>
            </div>
            <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-signal"
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MilestoneTrack({ milestones }) {
  return (
    <Section title="30 / 60 / 90 天里程碑">
      <div className="grid grid-cols-3 gap-3">
        {milestones.map((m, i) => (
          <div key={i} className="panel-raised p-3">
            <div className="font-display text-2xl text-signal tracking-tightest">D{m.day}</div>
            <div className="text-sm text-ink-100 mt-1 leading-snug">{m.kpi}</div>
            <div className="text-[11px] text-ink-400 mt-2 leading-relaxed border-t border-ink-700 pt-2">
              <span className="text-alert">⚠</span> {m.gate}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RiskFlags({ risks }) {
  if (risks.length === 0) {
    return (
      <Section title="风险预警">
        <p className="text-sm text-ink-400">— 当前模型未识别到 high-priority 风险</p>
      </Section>
    );
  }
  return (
    <Section title="风险预警">
      <div className="space-y-2">
        {risks.map((r, i) => {
          const Icon = r.level === 'high' ? AlertCircle : AlertTriangle;
          const color = r.level === 'high' ? 'text-alert border-alert/40' : 'text-signal border-signal/40';
          return (
            <div key={i} className={`panel-raised p-3 flex items-start gap-3 border ${color}`}>
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
              <div>
                <div className="text-sm text-ink-100">{r.title}</div>
                <p className="text-xs text-ink-300 leading-relaxed mt-0.5">{r.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function WhyHere({ whyHere }) {
  return (
    <Section title="数据依据 · why this brief">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {whyHere.map((w, i) => (
          <li key={i} className="flex items-baseline justify-between text-xs gap-3">
            <span className="text-ink-300">{w.fact}</span>
            <span className="text-ink-500 font-mono text-[10px] truncate">{w.source}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Section({ title, children }) {
  return (
    <div className="panel p-5">
      <div className="label-xs mb-3">{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-700/40 pb-1.5 last:border-0 last:pb-0">
      <dt className="text-xs text-ink-400">{k}</dt>
      <dd className="num text-sm">{v}</dd>
    </div>
  );
}
