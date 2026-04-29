import { Placeholder } from '../shared/Placeholder.jsx';

export function CityScorecard({ cities, selectedCityId, onSelectCity }) {
  // Phase-0 preview: simple ranked list using a quick flywheel proxy.
  // Full scoring engine (weighted, adjustable, with radar + SVG map) ships in Phase 2.
  const ranked = [...cities]
    .map((c) => ({
      ...c,
      _score: Math.round(
        c.densityPotential * 0.35 +
        c.density99 * 0.25 +
        c.supplyReadiness * 0.20 +
        c.strategicValue * 0.20
      ),
    }))
    .sort((a, b) => b._score - a._score);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-7">
        <Placeholder
          phase={2}
          title="City Flywheel Scorecard"
          intent="Rank Brazil's top 30 cities by 99Food flywheel potential — a weighted mix of market size, 99 existing base, density potential, competitive pressure, supply readiness, and strategic value. Adjustable weights, radar comparison, and an interactive Brazil SVG map ship in Phase 2."
          willInclude={[
            'Six-axis radar chart comparing any 2–3 cities side-by-side',
            'Brazil SVG map with launched / candidate / hold dots',
            'Live weight sliders — re-rank in real time',
            'Tier S/A/B/C bands with auto-justification',
            'Full source citations for every score (verified vs estimated)',
          ]}
        />
      </div>

      <aside className="col-span-5 panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="label-xs">Phase-0 preview · ranked list</div>
          <div className="text-[10px] font-mono text-ink-500">{ranked.length} cities</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto pr-1">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.16em] text-ink-500 font-mono">
              <tr className="border-b border-ink-700">
                <th className="text-left py-2 w-8">#</th>
                <th className="text-left py-2">City</th>
                <th className="text-right py-2 w-16">Score</th>
                <th className="text-right py-2 w-20">Status</th>
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
                    {c.isLaunched ? (
                      <span className="text-[10px] uppercase tracking-wider text-verde font-mono">● Live</span>
                    ) : c.keetaPresent ? (
                      <span className="text-[10px] uppercase tracking-wider text-alert font-mono">⚑ Keeta</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-ink-500 font-mono">○ Cand.</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
}
