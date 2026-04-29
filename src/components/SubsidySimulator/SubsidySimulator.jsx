import { Placeholder } from '../shared/Placeholder.jsx';

export function SubsidySimulator({ cities, benchmarks, selectedCityId, onSelectCity }) {
  const city = cities.find((c) => c.id === selectedCityId) ?? cities[0];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8">
        <Placeholder
          phase={1}
          title="Subsidy ROI Simulator — Marginal Decay Curve"
          intent="The soul of the tool. Drag a single slider; watch the marginal-ROI curve bend in real time. Five user segments — each with its own subsidy elasticity (k value) — produce a distinct decay shape. The simulator auto-locates the 'sweet-spot' where marginal ROI = 1, and flags the share of subsidy spend that's pure cannibalization."
          willInclude={[
            'Dual-axis curve: cumulative incremental orders vs. marginal incremental orders',
            'Auto-located sweet spot (∂ROI/∂subsidy = 1) with pulsing dot',
            'Segment selector — k value updates live (new-user 0.60 → high-value 0.15)',
            'Real-vs-cannibalized split donut',
            'Long-term flag: subsidy dependency + 7-day retention prediction',
            'When experiment_results.csv is uploaded → k refits live, with "calibrated from your data" badge',
          ]}
        />
      </div>

      <aside className="col-span-4 panel p-4">
        <div className="label-xs mb-3">Selected city · current defaults</div>
        <div className="font-display text-2xl text-ink-100 tracking-tightest mb-1">{city.name}</div>
        <div className="text-xs text-ink-500 font-mono mb-4">
          {city.state} · {city.region} · pop {(city.population / 1_000_000).toFixed(2)}M
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="AOV (avg order value)" value={`R$ ${city.avgMealPrice}`} note="city-adjusted" />
          <Row
            label="Default CAC"
            value={`R$ ${benchmarks.cacNewUser.value}`}
            note={benchmarks.cacNewUser.estimated ? 'estimated' : 'verified'}
          />
          <Row
            label="iFood share (city)"
            value={`${city.ifoodShare}%`}
            note="estimated · capital + region rule"
          />
          <Row
            label="Keeta presence"
            value={city.keetaPresent ? 'Yes' : 'No'}
            note={city.keetaPresent ? 'contest priority' : ''}
          />
          <Row
            label="Organic share (mature city)"
            value={`${Math.round(benchmarks.organicShareLaunched.value * 100)}%`}
            note="cross-sell baseline"
          />
        </dl>

        <div className="hairline mt-4 pt-3">
          <div className="label-xs mb-2">分析师批注</div>
          <p className="text-sm text-ink-300 leading-relaxed">
            {city.isLaunched
              ? `${city.name} 已上线，重点是把补贴从"撒钱"切到"边际有效区"。${
                  city.keetaPresent ? '注意 Keeta 同城在场，补贴战可能被反向拉高。' : ''
                }`
              : `${city.name} 尚未进入。先用模拟器测算单城启动 ROI，再去看模块 3 自动生成的进入策略。`}
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, note }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-700/40 pb-2">
      <dt className="text-ink-400 text-xs">{label}</dt>
      <dd className="text-right">
        <div className="num text-base">{value}</div>
        {note ? <div className="text-[10px] text-ink-500 font-mono">{note}</div> : null}
      </dd>
    </div>
  );
}
