import { Placeholder } from '../shared/Placeholder.jsx';

export function UnitEconomics({ city }) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8">
        <Placeholder
          phase={4}
          title={`90-Day Unit Economics — ${city.name}`}
          intent="Project the next 90 days of a city launch. Logistic user growth × S-curve order density × decaying CAC × rider-supply equilibrium. Compare three playbooks side-by-side: Aggressive / Balanced / Goiânia-replica. The chart highlights both the breakeven day and the flywheel-ignition day — the moment organic momentum overtakes paid acquisition."
          willInclude={[
            'Weekly multi-line chart: DAU, new-users, retention, order density, CAC, LTV/CAC, rider hourly, delivery time',
            'Cumulative subsidy vs cumulative GMV with breakeven day highlighted',
            'Flywheel-ignition day flag (organic > paid)',
            'Three-playbook overlay (Aggressive vs Balanced vs Goiânia replica)',
            'Budget input: R$1M – R$50M; pacing: aggressive / balanced / conservative',
            'Tooltip on every metric: "this number = what equation"',
          ]}
        />
      </div>

      <aside className="col-span-4 panel p-4">
        <div className="label-xs mb-2">Forecast preset</div>
        <h3 className="font-display text-xl text-ink-100 tracking-tightest mb-3">{city.name}</h3>

        <div className="space-y-3 text-sm">
          <Mini label="Starting budget" value="R$ 25 M" hint="default · adjustable" />
          <Mini label="Pacing" value="Balanced" hint="default · 3 modes" />
          <Mini label="Target breakeven" value="Day 78" hint="estimated · refines live" />
          <Mini label="Flywheel ignition" value="Day 52" hint="organic > paid" />
        </div>

        <div className="hairline mt-4 pt-3">
          <div className="label-xs mb-2">分析师批注</div>
          <p className="text-sm text-ink-300 leading-relaxed">
            预测引擎在 Phase 4 接入。骨架先把"飞轮启动日"和"盈亏平衡日"两个 wow 锚点
            占好位置——这是模块 4 的视觉核心，演示时一定要让 GM 看到它们高亮。
          </p>
        </div>
      </aside>
    </div>
  );
}

function Mini({ label, value, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-700/40 pb-2">
      <dt className="text-ink-400 text-xs">{label}</dt>
      <dd className="text-right">
        <div className="num text-base">{value}</div>
        <div className="text-[10px] text-ink-500 font-mono">{hint}</div>
      </dd>
    </div>
  );
}
