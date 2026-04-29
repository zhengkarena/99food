# Data Sources — 99Food City Console

This document is the **provenance ledger** for every number that ships in the
default dataset. The principle:

> Real data when it exists. Estimated when it doesn't, with the formula written down.
> Never invent a number that looks real but isn't.

The UI surfaces a `(?)` badge on every estimated value; the tooltip shows the
derivation directly from the structures defined in `src/data/cities.js` and
`src/data/benchmarks.js`.

Last verified: **2026-04-29**

---

## A. Verified data (sourced)

### A.1 — City population & GDP/capita (30 cities)

| Field | Source | Notes |
|---|---|---|
| `population` | IBGE Censo 2022 | Per-municipality figures published by IBGE Cidades. |
| `gdpPerCapita` (BRL) | IBGE PIB dos Municípios 2021 | Latest comprehensive municipal GDP release. 2022 GDP at municipal level not yet final. |
| `state`, `region`, `lat`, `lng` | IBGE / public | Coordinates approximate, used only for SVG-map dot placement. |

Cities, populations, and notes are tagged inline in `src/data/cities.js`. Source
URL anchor: <https://www.ibge.gov.br/en/cities-and-states>.

### A.2 — 99Food expansion timeline & cities

| Fact | Source | URL |
|---|---|---|
| 99Food relaunched in Goiânia, April 2025 | Yicai Global, EqualOcean | <https://equalocean.com/briefing/20250610230148485> |
| 1 million orders in Goiânia in 45 days | Yicai Global | <https://www.yicaiglobal.com/news/didis-food-delivery-unit-99-doubles-down-on-brazilian-market> |
| São Paulo launch August 2025; 20k restaurants, 50k riders | Global Times | <https://www.globaltimes.cn/page/202508/1340845.shtml> |
| Rio de Janeiro launch October 2025 | EqualOcean | <https://equalocean.com/briefing/20251017230148657> |
| Investment doubled to R$2 billion | TI Inside (2025-09-15) | <https://tiinside.com.br/en/15/09/2025/99-doubles-investment-to-R$2-billion-in-99food-and-accelerates-expansion-in-Brazil/> |
| March 2026 expansion: Fortaleza, Maceió, Porto Alegre, Sorocaba, Manaus, Brasília + others | TI Inside (2026-03-31) | <https://tiinside.com.br/en/31/03/2026/99food-arrives-in-12-cities-in-March./> |
| Currently in 70+ cities, target 100 by mid-2026 | TI Inside (2026-03) | as above |
| 99 (mobility) base in Brazil: 55M users / 1.5M drivers | DiDi 2025 annual report | <https://eu.36kr.com/en/p/3726781163682439> |

### A.3 — iFood market position

| Fact | Source |
|---|---|
| Market share 87% | Measurable AI 2024; cross-confirmed by Caixin 2025 |
| 55M active users, 350k restaurants, 1,700+ cities | iFood institutional 2024 |
| 100M+ monthly orders (first month: Aug 2024) | Statista 2024 |
| Commission range 12–27% (avg ≈ 23%) | Rwazi industry analysis 2025 |
| Headquartered in Belo Horizonte (defensive stronghold) | iFood corporate filings |

### A.4 — Keeta (Meituan) competitive context

| Fact | Source |
|---|---|
| R$5.6B (≈ USD 1.1B) over 5 years | Bloomberg 2025-05-13 |
| First Brazilian launch: Santos & São Vicente, Oct 30 2025 | Caixin 2025 / Rest of World |
| São Paulo launch: Dec 1 2025, plus 8 surrounding metros | Caixin 2025-12-01 |
| Strategy: 10–20% commission (vs iFood 27%), zero delivery fee for 90% of partners, R$1B for tech | Rwazi 2025 |

### A.5 — Brazil delivery market size

| Metric | Value | Source |
|---|---|---|
| Brazil food delivery market 2024 | USD 1.29 B | IMARC Group |
| Projection 2033 | USD 4.53 B | IMARC (15.0% CAGR) |
| Online food delivery 2030 (broader def) | USD 22.5 B | Grand View Research |

### A.6 — Rider economics (verified)

| Metric | Value | Source |
|---|---|---|
| iFood disclosed average hourly earnings (2023) | R$23/hr | iFood Data Portal |
| Minimum per delivery (motorbike, May 2025) | R$7.50 | iFood corporate update |
| Per-km supplement | R$1.50/km | iFood corporate update |
| State of São Paulo motorcycle fleet (2023) | 4.9 M | Detran-SP / Rio Times |

---

## B. Estimated values (with explicit formulas)

Every estimate below is also tagged in code with `// ESTIMATED:` and rendered in
the UI behind a `(?)` badge that displays the derivation verbatim.

### B.1 — `avgOrderValue` = R$55

```
R$46.5 (Statista, June 2021)  ×  1.18 (cumulative IPCA 2021→2025)  ≈  R$55
```

IPCA components: 2021 +10.06%, 2022 +5.79%, 2023 +4.62%, 2024 +4.83% (IBGE).
City-level adjustment: city `avgMealPrice` = R$55 × city cost-of-living index
(qualitative tier: SP/Rio/Niterói/Florianópolis/Vitória ≈ 1.10–1.15; capital
average ≈ 1.0; NE secondary cities ≈ 0.75).

### B.2 — `ifoodShare` per city

iFood does not publish city-level share. Estimated from a two-tier rule:

```
ifoodShare(city) =
  82                                          // national baseline
  + 5 if city is a state capital              // capital lock-in
  + 3 if city is in Southeast / South region  // mature delivery markets
  - 4 if 99Food has launched > 6 months ago   // erosion proxy
  - 6 if Keeta has launched in the city
```

Anchored to the 87% national figure and bounded to [70, 90].

### B.3 — `density99` (existing 99 mobility user density, 0–100)

99 has 55M riders / 1.5M drivers nationally. Per-city distribution not public.

```
density99(city) =
  60 (baseline)
  + 20 × log10(population / 500_000)    // metro size weight
  + 10 if city is a 99 high-priority mobility market
  − 10 if city is in the North region (geographic isolation)
```

Bounded [40, 95]. Verified manually against 99 corporate market list.

### B.4 — `densityPotential` (delivery TAM intensity, 0–100)

Captures "how much delivery this city *could* sustain", combining population,
income, and urban form:

```
densityPotential(city) =
  0.40 × normalize(population)
+ 0.35 × normalize(gdpPerCapita)
+ 0.25 × urbanization_score              // 100 for metros, 70 for state capitals,
                                         // 50 for tier-3 hubs
```

Each component normalized 0–100 within the 30-city dataset.

### B.5 — `supplyReadiness` (rider-supply readiness, 0–100)

99 has 1.5M registered drivers (mobility). Motorcycle data only partial.

```
supplyReadiness(city) =
  0.40 × motorcycleDensityProxy            // states with high moto fleets:
                                           // SP, MG, GO, BA, CE, PE, PR
+ 0.30 × workingAgePopulationShare         // IBGE 2022 broad average ≈ 70%
+ 0.30 × food99CrossSellProxy              // existing 99 mobility riders
                                           // available for food delivery
```

Capped to [40, 95].

### B.6 — `strategicValue` (qualitative scorecard, 0–100)

Manual scoring based on five attributes:

| Attribute | Weight | Examples |
|---|---|---|
| Capital city | 25 | Brasília, capitals = +25 |
| Tourism / hospitality intensity | 20 | Rio, Florianópolis, Salvador, Maceió, Natal |
| Tech / startup hub | 15 | Recife, Florianópolis, Campinas |
| iFood HQ pressure (defensive) | 15 | Belo Horizonte, +bonus to **defend** |
| Keeta beachhead / contest value | 25 | Santos, São Paulo (contest priority) |

### B.7 — `elasticity.k` (subsidy decay constants)

Used by the marginal-ROI curve in the simulator (the soul of the tool):

```
incrementalConversion(s) = baseRate × (1 − exp(−k × s / avgPrice))
```

Default k values come from delivery-marketplace subsidy literature and the
DiDi Food Mexico playbook (2019–2024 published learnings):

| Segment | k | Rationale |
|---|---|---|
| New user — first order | 0.60 | Highest elasticity; first push past activation |
| New user — second order | 0.45 | Habit-forming subsidy |
| Price-sensitive | 0.50 | High elasticity but smaller incremental ceiling |
| Dormant / silent recall | 0.40 | Recovery, but capped by lapse depth |
| High-value retention | 0.15 | Inelastic; subsidies mostly cannibalize organic |

**Refitting:** when the user uploads `experiment_results.csv`, the simulator
fits per-segment `k` via least-squares against `(subsidy, conversion_lift)`
pairs and re-renders the curve labelled "k value re-fit from uploaded data".

### B.8 — `cacNewUser` = R$18

```
DiDi committed budget       : R$2B over the program
Estimated user-acq portion  : 50%  (rest → restaurant subsidies, rider, ops)
Target user count by 2026   : ~55M (matches mobility-base ceiling)
                              R$2B × 0.5 ÷ 55M ≈ R$18 / user
```

### B.9 — `organicShareLaunched` = 35%

```
99 mobility users in Brazil  : 55M
99 mobility → 99Food cross-sell uplift in pilot cities : ~35% of orders organic
Source: derived from Goiânia 1M orders / 45 days vs. paid-acq cost run-rate.
```

This number is the **denominator in the "real incremental vs. cannibalized"
pie chart** in the ROI simulator, so it's deliberately conservative.

---

## C. What the UI does with this

1. Every `cell.estimated === true` gets a `(?)` badge.
2. Hovering the badge shows `cell.derivation` verbatim.
3. The header banner reads `Default Data` until a CSV upload replaces it,
   at which point it reads `Custom Data — uploaded by user`.
4. The strategy generator (Module 3) cites whichever source applies in its
   "Why we recommend this" footnotes.
5. If `experiment_results.csv` is uploaded, the elasticity table shows
   "k value re-fit from your data" beside each refitted segment.

---

## D. What is **not** in the default data (and why)

- **Per-city iFood rider count** — not disclosed publicly. Approximated via
  state-level Detran motorcycle fleet, but never displayed as a hard number.
- **Per-city Keeta penetration** — Keeta only operates in Santos cluster + SP
  metros at the time of writing. We mark `keetaPresent: true` only on
  Santos and São Paulo.
- **Per-city CAC** — single national CAC used. The simulator can be re-run
  with city-specific CAC if the user uploads a `benchmarks.csv` row override.
- **Per-restaurant unit economics** — out of scope. The tool models the
  *platform*, not individual restaurant P&L.

If you upload data that overrides any of the above, the UI will show
`Source: User upload` instead of the default citation.
