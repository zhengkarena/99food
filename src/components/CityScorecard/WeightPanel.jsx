import { RotateCcw } from 'lucide-react';

const WEIGHT_LABELS = [
  { key: 'marketSize',          label: 'Market size' },
  { key: 'existingBase',        label: '99 existing base' },
  { key: 'densityPotential',    label: 'Density potential' },
  { key: 'competitionPressure', label: 'Competitive room' },
  { key: 'supplyReadiness',     label: 'Supply readiness' },
  { key: 'strategicValue',      label: 'Strategic value' },
];

export function WeightPanel({ weights, onChange, onReset, isDefault }) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="label-xs">Score weights · drag to reframe ranking</div>
        <button
          type="button"
          onClick={onReset}
          disabled={isDefault}
          className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border transition-colors ${
            isDefault
              ? 'border-ink-700 text-ink-500 cursor-default'
              : 'border-ink-600 text-ink-300 hover:border-signal hover:text-signal'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {WEIGHT_LABELS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-ink-300">{label}</span>
              <span className="num text-sm">{(weights[key] * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={Math.round(weights[key] * 100)}
              onChange={(e) => onChange(key, Number(e.target.value) / 100)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-700">
        <div className="text-[10px] font-mono text-ink-500 uppercase tracking-[0.16em]">
          Total weight
        </div>
        <div className={`num text-sm ${Math.abs(total - 1.0) > 0.001 ? 'text-signal' : 'text-verde'}`}>
          {(total * 100).toFixed(0)}%
          {Math.abs(total - 1.0) > 0.001 && (
            <span className="ml-2 text-[10px] text-ink-500">
              (normalized at score time)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
