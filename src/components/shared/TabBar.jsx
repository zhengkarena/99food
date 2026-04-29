export function TabBar({ tabs, active, onChange }) {
  return (
    <nav className="border-b border-ink-700 bg-ink-950">
      <div className="max-w-[1600px] mx-auto px-6 flex">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`px-5 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'text-signal border-signal'
                  : 'text-ink-500 border-transparent hover:text-ink-300'
              }`}
            >
              <span>{t.label}</span>
              <span className="ml-2 text-[10px] text-ink-500 normal-case tracking-normal">
                {t.hint}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
