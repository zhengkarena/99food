import { Upload, ArrowUpRight } from 'lucide-react';

function tierOf(score) {
  if (score >= 80) return 'S';
  if (score >= 65) return 'A';
  if (score >= 50) return 'B';
  return 'C';
}

const TIER_COLOR = {
  S: 'bg-signal text-ink-950',
  A: 'bg-verde text-ink-100',
  B: 'bg-ink-700 text-ink-100',
  C: 'bg-alert/80 text-ink-100',
};

// Quick estimate of flywheel score for tier badge — actual full calc lives in scoring.js (Phase 2).
function quickFlywheel(c) {
  return Math.round(
    (c.densityPotential ?? 0) * 0.35 +
    (c.density99 ?? 0) * 0.25 +
    (c.supplyReadiness ?? 0) * 0.20 +
    (c.strategicValue ?? 0) * 0.20
  );
}

export function TopNav({ selectedCity, dataSource, launchedCount, target, onUploadClick }) {
  const score = quickFlywheel(selectedCity);
  const tier = tierOf(score);
  const progressPct = Math.min(100, (launchedCount / target) * 100);

  return (
    <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
        {/* LEFT: brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-signal flex items-center justify-center">
            <span className="text-ink-950 font-display font-bold text-sm">99</span>
          </div>
          <div>
            <div className="font-display text-ink-100 text-base leading-none tracking-tightest">
              99Food City Console
            </div>
            <div className="label-xs mt-1">Brazil unit economics simulator · v0.1</div>
          </div>
        </div>

        {/* MIDDLE: selected city */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="label-xs">Active city</div>
          <div className="font-display text-ink-100 text-lg">{selectedCity.name}</div>
          <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${TIER_COLOR[tier]}`}>
            TIER {tier} · {score}
          </div>
          {selectedCity.isLaunched ? (
            <span className="text-[10px] uppercase tracking-[0.18em] text-verde font-mono">
              ● Launched
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-500 font-mono">
              ○ Candidate
            </span>
          )}
        </div>

        {/* RIGHT: progress + upload */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="label-xs">100-city target</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="num text-sm">{launchedCount}/{target}</div>
              <div className="w-24 h-1 bg-ink-700 rounded-full overflow-hidden">
                <div className="h-full bg-signal" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-ink-300 border border-ink-600 hover:border-signal hover:text-signal px-3 py-1.5 rounded-md transition-colors font-mono uppercase tracking-wider"
            onClick={onUploadClick}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload data
          </button>

          <div className="text-right">
            <div className="label-xs">Source</div>
            <div className={`text-[11px] font-mono mt-1 flex items-center gap-1 ${
              dataSource === 'Default Data' ? 'text-ink-300' : 'text-verde'
            }`}>
              {dataSource === 'Custom Data' && <span className="w-1.5 h-1.5 bg-verde rounded-full" />}
              {dataSource}
              <ArrowUpRight className="w-3 h-3 text-ink-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
