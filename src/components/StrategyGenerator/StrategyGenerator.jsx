import { Placeholder } from '../shared/Placeholder.jsx';

export function StrategyGenerator({ city }) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8">
        <Placeholder
          phase={3}
          title={`Entry Strategy — ${city.name}`}
          intent="Auto-generated strategic brief for the selected city. Pulls from Module 1 (flywheel score) and Module 2 (subsidy fit) to produce a one-page recommendation: enter / wait / hold, plus 30/60/90-day milestones, segment priority, and risk flags."
          willInclude={[
            'Verdict block: 立即进入 / 6 个月后 / 12 个月后 / 暂不进入',
            'First-shopping-district recommendation (CBD vs residential mix)',
            'Segment-priority RFM ladder: 通勤午餐 → 晚餐家庭 → 夜宵高频',
            'Merchant ramp: M1 launch volume / M2 widening / M3 long-tail',
            'Subsidy budget split by segment, anchored to Module 2 sweet-spot',
            '30/60/90 milestones with KPI targets',
            'Risk flags: iFood counter-attack / Keeta entry / supply gap',
            'PDF export — single-page strategic brief',
          ]}
        />
      </div>

      <aside className="col-span-4 panel p-4">
        <div className="label-xs mb-2">City vitals</div>
        <h3 className="font-display text-xl text-ink-100 tracking-tightest mb-1">{city.name}</h3>
        <p className="text-xs text-ink-500 font-mono mb-4">{city.state} · {city.region}</p>

        <p className="text-sm text-ink-300 leading-relaxed mb-3">{city.note}</p>

        <div className="hairline pt-3 space-y-2 text-sm">
          <KV k="Population" v={`${(city.population / 1_000_000).toFixed(2)}M`} />
          <KV k="GDP / capita" v={`R$ ${city.gdpPerCapita.toLocaleString('pt-BR')}`} />
          <KV k="iFood share" v={`${city.ifoodShare}%`} />
          <KV k="Keeta present" v={city.keetaPresent ? 'Yes' : 'No'} />
          <KV k="99Food status" v={city.isLaunched ? `Launched · ${city.launchDate}` : 'Candidate'} />
        </div>
      </aside>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink-700/40 pb-1.5">
      <dt className="text-ink-400 text-xs">{k}</dt>
      <dd className="num text-sm">{v}</dd>
    </div>
  );
}
