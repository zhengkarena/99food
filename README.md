# 99Food City Console — Brazil Unit Economics Simulator

Interactive decision-support tool for 99Food's Brazil expansion. Answers the
question:

> Given any Brazilian city, should 99Food enter, when, how, and will it pay back?

## Quick start

```bash
npm install
npm run dev          # → http://localhost:5173
npm run build        # production bundle
```

Deploys to Vercel out of the box (no backend; data is bundled or user-uploaded).

## What's in the box

- **30-city dataset** — real population & GDP from IBGE 2022/2021,
  verified 99Food / iFood / Keeta status from public news (April 2026).
  Every estimated value is documented in `DATA_SOURCES.md`.
- **Four modules**
  1. `01 · City Scorecard` — 6-axis flywheel ranking, weights adjustable
  2. `02 · Subsidy ROI` — marginal-decay simulator (the soul)
  3. `03 · Entry Strategy` — auto-generated brief, PDF-exportable
  4. `04 · 90-Day Forecast` — unit economics over a city launch
- **CSV upload** — replace defaults with your own `cities.csv`,
  `benchmarks.csv`, or `experiment_results.csv`. Schema templates in
  `templates/`.

## Build phases

| Phase | Status | What |
|---|---|---|
| 0 | ✅ | Data + skeleton + 4 tab placeholders |
| 1 | ⏳ | Module 2 (subsidy ROI simulator) — the soul |
| 2 | ⏳ | Module 1 (scorecard + radar + Brazil map) |
| 3 | ⏳ | Module 3 (strategy brief + PDF) + CSV upload |
| 4 | ⏳ | Module 4 (90-day forecast) + visual polish |

## Stack

React 18 · Vite · Tailwind · Recharts · lucide-react · PapaParse · html2pdf.js.
No state library, no router, no UI kit. State stays in `useState` / `useReducer`.

## Files of interest

- `src/data/cities.js` — 30-city dataset with inline source comments
- `src/data/benchmarks.js` — business benchmarks with provenance metadata
- `DATA_SOURCES.md` — full ledger: verified sources + estimated derivations
- `DEMO_SCRIPT.md` — 5-minute walkthrough script (ships in Phase 4)

## Visual system

Bloomberg-Terminal × consulting-deck cockpit. Dark `#0F1115`, 99 brand yellow
`#FFD200` for signal, Brazil-flag green `#009C3B` for positive deltas, alert
red `#E63946` for negative. Type: Fraunces (display) / JetBrains Mono (data) /
Geist (body).
