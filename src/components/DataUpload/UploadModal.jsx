import { useState } from 'react';
import { X, Upload, Download, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import {
  parseCitiesCsv, parseBenchmarksCsv, parseExperimentsCsv,
} from '../../utils/csvParser.js';

const TABS = [
  { id: 'cities',      label: 'Cities',          file: 'cities_template.csv',
    desc: 'Replace the 30-city dataset. Required columns: id, name, state, population, gdp_per_capita, is_launched, ifood_market_share, density_99, density_potential, supply_readiness, strategic_value, avg_meal_price.' },
  { id: 'benchmarks',  label: 'Benchmarks',      file: 'benchmarks_template.csv',
    desc: 'Override specific business benchmarks. Allowed metric_name values: avg_order_value, ifood_commission, rider_hourly_wage, cac_new_user, organic_share_launched, industry_reality_subsidy.' },
  { id: 'experiments', label: 'A/B experiments', file: 'experiment_results_template.csv',
    desc: 'Refit per-segment subsidy elasticity k from real A/B data. Required columns: segment, subsidy_amount, conversion_lift, sample_size. ≥2 rows per segment.' },
];

export function UploadModal({
  isOpen, onClose,
  onCitiesUpload, onBenchmarksUpload, onExperimentsUpload,
  defaultElasticity, avgPrice,
  hasCustomCities, hasCustomBenchmarks, hasCustomExperiments,
  onResetAll,
}) {
  const [tab, setTab] = useState('cities');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  function clearStatus() {
    setErrors([]);
    setSuccess(null);
  }

  async function handleFile(file) {
    clearStatus();
    if (!file) return;
    const text = await file.text();

    if (tab === 'cities') {
      const r = await parseCitiesCsv(text);
      if (!r.ok) return setErrors(r.errors);
      onCitiesUpload(r.cities);
      setSuccess(`✓ Loaded ${r.cities.length} cities. Models recomputed.`);
    } else if (tab === 'benchmarks') {
      const r = await parseBenchmarksCsv(text);
      if (!r.ok) return setErrors(r.errors);
      onBenchmarksUpload(r.overrides);
      setSuccess(`✓ Overrode ${Object.keys(r.overrides).length} benchmarks.`);
    } else if (tab === 'experiments') {
      const r = await parseExperimentsCsv(text, defaultElasticity, avgPrice);
      if (!r.ok) return setErrors(r.errors);
      onExperimentsUpload(r.refitted);
      const keys = Object.keys(r.refitted);
      setSuccess(`✓ Refitted k for ${keys.length} segments: ${keys.join(', ')}.`);
    }
  }

  function downloadTemplate() {
    const path = `/templates/${TABS.find((t) => t.id === tab).file}`;
    const a = document.createElement('a');
    a.href = path;
    a.download = TABS.find((t) => t.id === tab).file;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-ink-900 border border-ink-700 rounded-lg shadow-2xl w-[720px] max-h-[88vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-700">
          <div>
            <div className="font-display text-lg text-ink-100 tracking-tightest">Upload custom data</div>
            <div className="text-[11px] text-ink-500 font-mono">CSV → instant model recalculation</div>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ink-700 bg-ink-950">
          {TABS.map((t) => {
            const isActive = t.id === tab;
            const hasCustom =
              (t.id === 'cities' && hasCustomCities) ||
              (t.id === 'benchmarks' && hasCustomBenchmarks) ||
              (t.id === 'experiments' && hasCustomExperiments);
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); clearStatus(); }}
                className={`px-5 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                  isActive ? 'text-signal border-signal' : 'text-ink-500 border-transparent hover:text-ink-300'
                }`}
              >
                {t.label}
                {hasCustom && <span className="w-1.5 h-1.5 bg-verde rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          <div className="text-sm text-ink-300 leading-relaxed mb-4">
            {TABS.find((t) => t.id === tab).desc}
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-300 border border-ink-600 hover:border-signal hover:text-signal px-3 py-1.5 rounded-md transition-colors mb-4"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV template
          </button>

          {/* Drop zone */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-signal bg-signal/5' : 'border-ink-600 hover:border-ink-500'
            }`}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Upload className="w-8 h-8 mx-auto text-ink-500 mb-2" />
            <div className="text-sm text-ink-300">Drag & drop CSV here, or click to browse</div>
            <div className="text-[10px] font-mono text-ink-500 mt-1">UTF-8, comma-separated, header row required</div>
          </label>

          {/* Error / success */}
          {errors.length > 0 && (
            <div className="mt-4 panel-raised p-3 border border-alert/40">
              <div className="flex items-center gap-2 text-alert text-xs font-mono uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" /> Validation failed — defaults preserved
              </div>
              <ul className="text-xs text-ink-300 space-y-1 max-h-40 overflow-y-auto">
                {errors.map((e, i) => <li key={i} className="font-mono">{e}</li>)}
              </ul>
            </div>
          )}
          {success && (
            <div className="mt-4 panel-raised p-3 border border-verde/40 flex items-center gap-2 text-verde text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ink-700 flex items-center justify-between bg-ink-950">
          <div className="text-[10px] font-mono text-ink-500 uppercase tracking-wider">
            All uploads stored in browser memory — no server.
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all data to defaults? Custom uploads will be cleared.')) {
                onResetAll();
                clearStatus();
              }
            }}
            disabled={!hasCustomCities && !hasCustomBenchmarks && !hasCustomExperiments}
            className={`flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border transition-colors ${
              hasCustomCities || hasCustomBenchmarks || hasCustomExperiments
                ? 'border-alert/60 text-alert hover:bg-alert/10'
                : 'border-ink-700 text-ink-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3 h-3" /> Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
