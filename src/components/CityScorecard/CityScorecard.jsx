import { useMemo, useState } from 'react';
import { DEFAULT_WEIGHTS } from '../../data/cities.js';
import { rankCities, RECOMMENDATION_META } from '../../utils/scoring.js';
import { BrazilMap } from './BrazilMap.jsx';
import { RadarComparison } from './RadarComparison.jsx';
import { WeightPanel } from './WeightPanel.jsx';

const DEFAULT_COMPARE = ['goiania', 'sao-paulo', 'fortaleza'];

export function CityScorecard({ cities, selectedCityId, onSelectCity }) {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [compareIds, setCompareIds] = useState(DEFAULT_COMPARE);

  // Normalise weights at score time so sliders feel free but total stays 1
  const normalisedWeights = useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(
      Object.entries(weights).map(([k, v]) => [k, v / total])
    );
  }, [weights]);

  const ranked = useMemo(
    () => rankCities(cities, normalisedWeights),
    [cities, normalisedWeights]
  );

  const compareCities = compareIds
    .map((id) => ranked.find((c) => c.id === id))
    .filter(Boolean);

  const isDefaultWeights = useMemo(
    () => Object.keys(DEFAULT_WEIGHTS).every(
      (k) => Math.abs(weights[k] - DEFAULT_WEIGHTS[k]) < 0.001
    ),
    [weights]
  );

  function setSlot(slotIdx, cityId) {
    setCompareIds((prev) => {
      const next = [...prev];
      next[slotIdx] = cityId;
      return next;
    });
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* ───── LEFT COLUMN: map + weights ───── */}
      <div className="col-span-7 space-y-5">
        {/* Analyst note */}
        <div className="panel p-4">
          <div className="label-xs mb-2">分析师批注</div>
          <p className="text-sm text-ink-200 leading-relaxed">
            飞轮指数 = 6 维加权（市场规模 / 99 已有基础 / 密度潜力 / 竞争空间 / 供给就绪 / 战略价值）。
            权重默认按 99Food 复盘 Goiânia 的成功模型（Density + Strategic 加重）。
            拖动右侧权重滑块——你会看到 <span className="text-signal">Goiânia 一直在 Tier S</span>，
            而 <span className="text-alert">São Paulo 在 Keeta 在场后排名下滑</span>，这就是策略工具的价值。
          </p>
        </div>

        <BrazilMap
          cities={ranked}
          selectedCityId={selectedCityId}
          onSelectCity={onSelectCity}
        />

        <WeightPanel
          weights={weights}
          onChange={(key, val) => setWeights((w) => ({ ...w, [key]: val }))}
          onReset={() => setWeights(DEFAULT_WEIGHTS)}
          isDefault={isDefaultWeights}
        />
      </div>

      {/* ───── RIGHT COLUMN: radar + ranking ───── */}
      <div className="col-span-5 space-y-5">
        {/* Radar comparison */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="label-xs">3-city flywheel comparison</div>
            <button
              type="button"
              className="text-[10px] font-mono uppercase tracking-wider text-ink-500 hover:text-signal"
              onClick={() => setCompareIds(DEFAULT_COMPARE)}
            >
              ↺ Default trio
            </button>
          </div>
          <RadarComparison cities={compareCities} />

          {/* Slot pickers under chart */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[0, 1, 2].map((slot) => {
              const c = compareCities[slot];
              const slotColors = ['border-signal', 'border-verde', 'border-[#FF8C42]'];
              return (
                <div key={slot} className={`border-l-2 pl-2 ${slotColors[slot]}`}>
                  <select
                    value={compareIds[slot] ?? ''}
                    onChange={(e) => setSlot(slot, e.target.value)}
                    className="w-full bg-ink-800 border border-ink-700 rounded px-1.5 py-1 text-[11px] text-ink-100 font-mono focus:border-signal focus:outline-none"
                  >
                    {ranked.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                  {c && (
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="num text-base">{c._score}</span>
                      <span className="text-[10px] font-mono text-ink-500">Tier {c._tier}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking table */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="label-xs">Top 30 · ranked live</div>
            <div className="text-[10px] font-mono text-ink-500">
              {ranked.filter((c) => c._tier === 'S').length} S ·
              {' '}{ranked.filter((c) => c._tier === 'A').length} A ·
              {' '}{ranked.filter((c) => c._tier === 'B').length} B ·
              {' '}{ranked.filter((c) => c._tier === 'C').length} C
            </div>
          </div>
          <div className="max-h-[480px] overflow-y-auto pr-1">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.16em] text-ink-500 font-mono sticky top-0 bg-ink-900">
                <tr className="border-b border-ink-700">
                  <th className="text-left py-2 w-8">#</th>
                  <th className="text-left py-2">City</th>
                  <th className="text-right py-2 w-12">Score</th>
                  <th className="text-right py-2 w-10">Tier</th>
                  <th className="text-right py-2 w-16">Status</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCity(c.id)}
                    className={`border-b border-ink-700/50 cursor-pointer hover:bg-ink-800/60 ${
                      c.id === selectedCityId ? 'bg-ink-800' : ''
                    }`}
                  >
                    <td className="py-2 num text-ink-500 text-xs">{String(i + 1).padStart(2, '0')}</td>
                    <td className="py-2">
                      <div className="text-ink-100">{c.name}</div>
                      <div className="text-[10px] text-ink-500 font-mono">
                        {c.state} · {(c.population / 1_000_000).toFixed(2)}M
                      </div>
                    </td>
                    <td className="py-2 text-right num">{c._score}</td>
                    <td className="py-2 text-right">
                      <TierPill tier={c._tier} />
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider"
                        style={{ color: RECOMMENDATION_META[c._recommendation].color }}
                      >
                        {RECOMMENDATION_META[c._recommendation].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TierPill({ tier }) {
  const styles = {
    S: 'bg-signal text-ink-950',
    A: 'bg-verde/80 text-ink-100',
    B: 'bg-ink-700 text-ink-300',
    C: 'bg-alert/40 text-ink-300',
  }[tier];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${styles}`}>
      {tier}
    </span>
  );
}
