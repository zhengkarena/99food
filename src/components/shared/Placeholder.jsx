/**
 * Placeholder panel for tabs that ship in later phases.
 * Designed to look intentional — not "WIP" — so the skeleton demo still feels real.
 */
export function Placeholder({ phase, title, intent, willInclude }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="label-xs">Phase {phase} module</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-signal font-mono">
          ● scaffolding
        </span>
      </div>
      <h2 className="font-display text-2xl text-ink-100 mb-3 tracking-tightest">{title}</h2>
      <p className="text-ink-400 text-sm leading-relaxed max-w-3xl mb-5">{intent}</p>
      <div className="hairline pt-4">
        <div className="label-xs mb-2">This module will include</div>
        <ul className="text-sm text-ink-300 space-y-1.5">
          {willInclude.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-signal font-mono text-xs mt-0.5">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
