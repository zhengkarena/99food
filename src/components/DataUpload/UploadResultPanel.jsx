import { useEffect, useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * Floating result panel rendered AFTER an upload succeeds.
 * Fixed bottom-right, slides up. Auto-dismisses after 8s, manual close.
 *
 * Branches by `result.kind`:
 *   experiments → before/after k table per segment
 *   benchmarks  → list of overridden metrics with prior vs new value
 *   cities      → "30 → X cities, Y changed" summary
 */
export function UploadResultPanel({ result, onClose, onNavigate }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!result) return;
    setMounted(true);
    const t = setTimeout(() => onClose(), 8000);
    return () => clearTimeout(t);
  }, [result, onClose]);

  if (!result) return null;

  return (
    <div
      key={result.ts}
      className="fixed bottom-4 right-4 z-[60] w-[380px] panel-raised border border-verde/50 shadow-2xl slide-up"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700">
        <div className="flex items-center gap-2 text-verde">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">
            {result.kind === 'experiments' && 'A/B Data Refitted'}
            {result.kind === 'benchmarks' && 'Benchmarks Overridden'}
            {result.kind === 'cities' && 'Cities Loaded'}
          </span>
        </div>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 text-sm">
        {result.kind === 'experiments' && <ExperimentsBody refits={result.refits} />}
        {result.kind === 'benchmarks'  && <BenchmarksBody  diffs={result.diffs} />}
        {result.kind === 'cities'      && <CitiesBody      summary={result.summary} />}
      </div>

      {result.linkTo && (
        <button
          onClick={() => { onNavigate(result.linkTo); onClose(); }}
          className="w-full px-4 py-2.5 border-t border-ink-700 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-signal hover:bg-signal/5 transition-colors"
        >
          <span>{result.linkLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function ExperimentsBody({ refits }) {
  const entries = Object.entries(refits);
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-[10px] font-mono uppercase tracking-wider text-ink-500 pb-1 border-b border-ink-700/60">
        <span>Segment</span>
        <span className="text-right">Prior</span>
        <span className="text-right">→ Yours</span>
        <span className="text-right">Δ</span>
      </div>
      {entries.map(([seg, { before, after, n }]) => {
        const delta = ((after - before) / before) * 100;
        const sign = delta >= 0 ? '+' : '';
        return (
          <div key={seg} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-baseline">
            <div className="text-xs text-ink-200">
              {seg.replace(/_/g, ' ')}
              <span className="text-ink-500 font-mono"> · n={n}</span>
            </div>
            <span className="num text-xs text-ink-500">{before.toFixed(2)}</span>
            <span className="num text-xs text-signal">{after.toFixed(2)}</span>
            <span className={`num text-xs ${delta >= 0 ? 'text-verde' : 'text-alert'}`}>
              {sign}{delta.toFixed(0)}%
            </span>
          </div>
        );
      })}
      <div className="text-[11px] text-ink-300 leading-relaxed pt-2 border-t border-ink-700/60 flex gap-2">
        <span>💡</span>
        <span>
          Your A/B data shows {anyHigher(refits) ? 'higher' : 'different'} elasticity than industry priors.
          Subsidy strategies will recalibrate accordingly.
        </span>
      </div>
    </div>
  );
}

function BenchmarksBody({ diffs }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] text-ink-400 mb-2">
        Overrode {diffs.length} benchmark{diffs.length === 1 ? '' : 's'}:
      </div>
      {diffs.map(({ key, before, after, unit }) => (
        <div key={key} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-baseline text-xs">
          <span className="text-ink-200 font-mono">{key}</span>
          <span className="num text-ink-500">{before}</span>
          <span className="text-ink-500">→</span>
          <span className="num text-signal">{after}{unit ? ` ${unit}` : ''}</span>
        </div>
      ))}
      <div className="text-[11px] text-ink-300 leading-relaxed pt-2 border-t border-ink-700/60 mt-2 flex gap-2">
        <span>💡</span>
        <span>All four modules now run on your benchmarks. Sweet-spot, ROI, and forecasts updated.</span>
      </div>
    </div>
  );
}

function CitiesBody({ summary }) {
  const { before, after, changed, added, removed } = summary;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Before" value={before} />
        <Stat label="After" value={after} tone="signal" />
        <Stat label="Changed" value={changed} tone="verde" />
      </div>
      {(added > 0 || removed > 0) && (
        <div className="text-[11px] font-mono text-ink-500 flex justify-around pt-1 border-t border-ink-700/60">
          {added > 0 && <span><span className="text-verde">+{added}</span> added</span>}
          {removed > 0 && <span><span className="text-alert">−{removed}</span> removed</span>}
        </div>
      )}
      <div className="text-[11px] text-ink-300 leading-relaxed pt-2 border-t border-ink-700/60 flex gap-2">
        <span>💡</span>
        <span>Scorecard rankings, Brazil map, and strategy briefs now run on your dataset.</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === 'signal' ? 'text-signal' : tone === 'verde' ? 'text-verde' : 'text-ink-100';
  return (
    <div>
      <div className="label-xs">{label}</div>
      <div className={`num text-xl ${color}`}>{value}</div>
    </div>
  );
}

function anyHigher(refits) {
  return Object.values(refits).some(({ before, after }) => after > before);
}
