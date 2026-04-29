import { useState } from 'react';

/**
 * Hover badge for any estimated value. Tooltip shows the derivation verbatim
 * — the user (GM) can see exactly how a number was computed, no hand-waving.
 */
export function EstimatedBadge({ derivation, source }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="ml-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-ink-500 text-ink-400 text-[9px] font-mono leading-none cursor-help select-none"
        aria-label="estimated value"
      >
        ?
      </span>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 z-50 panel-raised p-3 shadow-xl">
          <div className="label-xs mb-1 text-signal">Estimated · derivation</div>
          <div className="text-xs text-ink-300 leading-relaxed font-mono whitespace-pre-line">{derivation}</div>
          {source ? <div className="mt-2 text-[10px] text-ink-500 font-mono">Source: {source}</div> : null}
        </div>
      )}
    </span>
  );
}
