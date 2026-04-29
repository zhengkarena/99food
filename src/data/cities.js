/**
 * 99Food City Console — 30 Brazilian cities dataset
 *
 * SOURCING POLICY (see DATA_SOURCES.md for full provenance):
 *   - population, state         → IBGE 2022 Census (verified)
 *   - gdpPerCapita              → IBGE PIB dos Municípios 2021 (latest published)
 *   - isLaunched                → Verified news (TI Inside, Reuters, Folha, Rio Times,
 *                                  Yicai Global, Caixin) as of April 2026
 *   - ifoodShare                → ESTIMATED (city-level not published; derived)
 *   - density99                 → ESTIMATED (99 ride-hailing presence proxy)
 *   - densityPotential          → ESTIMATED (population × urbanization × disposable income)
 *   - supplyReadiness           → ESTIMATED (motorcycle proxy × working-age pop)
 *   - strategicValue            → SCORED qualitatively (capital / hub / tourism / metro)
 *   - avgMealPrice              → ESTIMATED (national R$55 baseline × cost-of-living index)
 *   - keeta                     → Verified from Bloomberg / Caixin / TechBuzzChina
 *
 * Score fields are 0–100. lat/lng used only for SVG-map dot placement (approximate).
 */

// SOURCE: IBGE 2022 Census + 2021 GDP. Estimated cells documented per-row.
export const CITIES = [
  // ---------- TIER 1: > 2M, all major capitals ----------
  {
    id: 'sao-paulo', name: 'São Paulo', state: 'SP', region: 'Southeast',
    population: 11451245, gdpPerCapita: 70770,         // SOURCE: IBGE 2022 / IBGE PIB 2021
    isLaunched: true, launchDate: '2025-08',           // SOURCE: TI Inside 2025-09-15
    keetaPresent: true,                                // SOURCE: Caixin 2025-12-01 (Keeta SP launch)
    ifoodShare: 86,                                    // ESTIMATED: capital + Keeta battleground = high iFood lock-in
    density99: 92, densityPotential: 95, supplyReadiness: 95, strategicValue: 100,
    avgMealPrice: 62,                                  // ESTIMATED: national R$55 × 1.13 SP cost-of-living
    lat: -23.55, lng: -46.63,
    note: 'Largest LatAm metro. Keeta vs 99Food vs iFood three-way war.',
  },
  {
    id: 'rio', name: 'Rio de Janeiro', state: 'RJ', region: 'Southeast',
    population: 6211423, gdpPerCapita: 58144,
    isLaunched: true, launchDate: '2025-10',           // SOURCE: EqualOcean 2025-10-17
    keetaPresent: false,
    ifoodShare: 84, density99: 88, densityPotential: 90, supplyReadiness: 88, strategicValue: 95,
    avgMealPrice: 60, lat: -22.91, lng: -43.17,
    note: 'Tourism hub. High moto-courier supply. Tier-S city.',
  },
  {
    id: 'brasilia', name: 'Brasília', state: 'DF', region: 'Center-West',
    population: 2817381, gdpPerCapita: 96129,          // Highest among capitals
    isLaunched: true, launchDate: '2026-03',           // SOURCE: TI Inside 2026-03-31
    keetaPresent: false,
    ifoodShare: 82, density99: 78, densityPotential: 82, supplyReadiness: 70, strategicValue: 88,
    avgMealPrice: 68, lat: -15.78, lng: -47.93,
    note: 'Highest GDP/capita capital. Government workforce → predictable lunch demand.',
  },
  {
    id: 'salvador', name: 'Salvador', state: 'BA', region: 'Northeast',
    population: 2418005, gdpPerCapita: 28163,
    isLaunched: true, launchDate: '2025-12',
    keetaPresent: false,
    ifoodShare: 80, density99: 74, densityPotential: 75, supplyReadiness: 78, strategicValue: 80,
    avgMealPrice: 48, lat: -12.97, lng: -38.50,
    note: 'NE capital. Lower AOV, higher subsidy elasticity.',
  },
  {
    id: 'fortaleza', name: 'Fortaleza', state: 'CE', region: 'Northeast',
    population: 2428708, gdpPerCapita: 27567,
    isLaunched: true, launchDate: '2026-03',           // SOURCE: TI Inside 2026-03-31
    keetaPresent: false,
    ifoodShare: 78, density99: 76, densityPotential: 78, supplyReadiness: 82, strategicValue: 75,
    avgMealPrice: 46, lat: -3.71, lng: -38.54,
    note: 'High motorcycle density. Beach + tourism upside.',
  },
  {
    id: 'belo-horizonte', name: 'Belo Horizonte', state: 'MG', region: 'Southeast',
    population: 2315560, gdpPerCapita: 38127,
    isLaunched: true, launchDate: '2025-11',
    keetaPresent: false,
    ifoodShare: 85, density99: 82, densityPotential: 84, supplyReadiness: 80, strategicValue: 85,
    avgMealPrice: 56, lat: -19.92, lng: -43.94,
    note: 'iFood headquarters city — defensive stronghold. Hard market.',
  },
  {
    id: 'manaus', name: 'Manaus', state: 'AM', region: 'North',
    population: 2063547, gdpPerCapita: 38245,
    isLaunched: true, launchDate: '2026-03',
    keetaPresent: false,
    ifoodShare: 76, density99: 60, densityPotential: 65, supplyReadiness: 58, strategicValue: 60,
    avgMealPrice: 54, lat: -3.12, lng: -60.02,
    note: 'Free-trade zone. Geographically isolated → logistics challenging.',
  },
  // ---------- TIER 2: 1–2M, major capitals & hubs ----------
  {
    id: 'curitiba', name: 'Curitiba', state: 'PR', region: 'South',
    population: 1773718, gdpPerCapita: 51400,
    isLaunched: true, launchDate: '2025-12',
    keetaPresent: false,
    ifoodShare: 84, density99: 80, densityPotential: 82, supplyReadiness: 78, strategicValue: 78,
    avgMealPrice: 58, lat: -25.43, lng: -49.27,
    note: 'High income. Strong iFood penetration. Premium segment opportunity.',
  },
  {
    id: 'recife', name: 'Recife', state: 'PE', region: 'Northeast',
    population: 1488920, gdpPerCapita: 38530,
    isLaunched: true, launchDate: '2026-02',
    keetaPresent: false,
    ifoodShare: 80, density99: 70, densityPotential: 76, supplyReadiness: 74, strategicValue: 72,
    avgMealPrice: 48, lat: -8.05, lng: -34.88,
    note: 'NE tech hub (Porto Digital). Young user skew.',
  },
  {
    id: 'goiania', name: 'Goiânia', state: 'GO', region: 'Center-West',
    population: 1437366, gdpPerCapita: 30836,
    isLaunched: true, launchDate: '2025-04',           // First city — relaunch pilot
    keetaPresent: false,
    ifoodShare: 73, density99: 72, densityPotential: 80, supplyReadiness: 76, strategicValue: 90,
    avgMealPrice: 50, lat: -16.69, lng: -49.27,
    note: 'PILOT CITY. 1M orders in 45 days (Yicai Global). Playbook to replicate.',
  },
  {
    id: 'porto-alegre', name: 'Porto Alegre', state: 'RS', region: 'South',
    population: 1332570, gdpPerCapita: 51895,
    isLaunched: true, launchDate: '2026-03',
    keetaPresent: false,
    ifoodShare: 83, density99: 76, densityPotential: 80, supplyReadiness: 75, strategicValue: 75,
    avgMealPrice: 56, lat: -30.03, lng: -51.22,
    note: 'High income. Cold winters → strong delivery seasonality.',
  },
  {
    id: 'belem', name: 'Belém', state: 'PA', region: 'North',
    population: 1303403, gdpPerCapita: 22567,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 74, density99: 50, densityPotential: 55, supplyReadiness: 52, strategicValue: 55,
    avgMealPrice: 44, lat: -1.46, lng: -48.50,
    note: 'COP30 host (2025). Short-term demand spike but small base.',
  },
  {
    id: 'campinas', name: 'Campinas', state: 'SP', region: 'Southeast',
    population: 1138309, gdpPerCapita: 53485,
    isLaunched: true, launchDate: '2025-11',
    keetaPresent: false,
    ifoodShare: 82, density99: 78, densityPotential: 86, supplyReadiness: 76, strategicValue: 70,
    avgMealPrice: 58, lat: -22.91, lng: -47.06,
    note: 'SP-state second city. Tech corridor. High AOV.',
  },
  {
    id: 'sao-luis', name: 'São Luís', state: 'MA', region: 'Northeast',
    population: 1037589, gdpPerCapita: 25690,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 72, density99: 48, densityPotential: 52, supplyReadiness: 55, strategicValue: 50,
    avgMealPrice: 42, lat: -2.53, lng: -44.30,
    note: 'NE capital. Lower-income market. Subsidy-sensitive.',
  },
  {
    id: 'maceio', name: 'Maceió', state: 'AL', region: 'Northeast',
    population: 957916, gdpPerCapita: 22890,
    isLaunched: true, launchDate: '2026-03',
    keetaPresent: false,
    ifoodShare: 70, density99: 50, densityPotential: 58, supplyReadiness: 56, strategicValue: 52,
    avgMealPrice: 42, lat: -9.66, lng: -35.74,
    note: 'Just launched March 2026. Beach tourism upside.',
  },
  {
    id: 'campo-grande', name: 'Campo Grande', state: 'MS', region: 'Center-West',
    population: 916001, gdpPerCapita: 33820,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 76, density99: 58, densityPotential: 64, supplyReadiness: 62, strategicValue: 55,
    avgMealPrice: 48, lat: -20.45, lng: -54.62,
    note: 'Agribusiness hub. Mid-tier candidate.',
  },
  {
    id: 'teresina', name: 'Teresina', state: 'PI', region: 'Northeast',
    population: 866300, gdpPerCapita: 24105,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 68, density99: 44, densityPotential: 48, supplyReadiness: 50, strategicValue: 42,
    avgMealPrice: 40, lat: -5.09, lng: -42.80,
    note: 'Hot climate → strong delivery demand. Lower buying power.',
  },
  {
    id: 'natal', name: 'Natal', state: 'RN', region: 'Northeast',
    population: 751300, gdpPerCapita: 27940,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 72, density99: 50, densityPotential: 56, supplyReadiness: 58, strategicValue: 52,
    avgMealPrice: 44, lat: -5.79, lng: -35.21,
    note: 'Tourism city. Seasonal peaks.',
  },
  {
    id: 'joao-pessoa', name: 'João Pessoa', state: 'PB', region: 'Northeast',
    population: 833932, gdpPerCapita: 28547,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 70, density99: 50, densityPotential: 56, supplyReadiness: 56, strategicValue: 48,
    avgMealPrice: 44, lat: -7.12, lng: -34.86,
    note: 'NE coastal capital. Mid-density.',
  },
  // ---------- TIER 3: 400k–900k, regional hubs ----------
  {
    id: 'uberlandia', name: 'Uberlândia', state: 'MG', region: 'Southeast',
    population: 713232, gdpPerCapita: 47900,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 78, density99: 64, densityPotential: 72, supplyReadiness: 70, strategicValue: 60,
    avgMealPrice: 52, lat: -18.92, lng: -48.28,
    note: 'Cerrado logistics hub. High income for tier-3.',
  },
  {
    id: 'sorocaba', name: 'Sorocaba', state: 'SP', region: 'Southeast',
    population: 687357, gdpPerCapita: 48230,
    isLaunched: true, launchDate: '2026-03',
    keetaPresent: false,
    ifoodShare: 80, density99: 70, densityPotential: 76, supplyReadiness: 72, strategicValue: 62,
    avgMealPrice: 54, lat: -23.50, lng: -47.45,
    note: 'SP industrial belt. Just launched.',
  },
  {
    id: 'ribeirao-preto', name: 'Ribeirão Preto', state: 'SP', region: 'Southeast',
    population: 698418, gdpPerCapita: 56300,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 80, density99: 68, densityPotential: 80, supplyReadiness: 70, strategicValue: 65,
    avgMealPrice: 56, lat: -21.18, lng: -47.81,
    note: 'High GDP/capita. Agribusiness wealth. Premium opportunity.',
  },
  {
    id: 'cuiaba', name: 'Cuiabá', state: 'MT', region: 'Center-West',
    population: 650877, gdpPerCapita: 41150,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 74, density99: 56, densityPotential: 64, supplyReadiness: 60, strategicValue: 50,
    avgMealPrice: 50, lat: -15.60, lng: -56.10,
    note: 'Hottest capital. Strong delivery weather demand.',
  },
  {
    id: 'feira-de-santana', name: 'Feira de Santana', state: 'BA', region: 'Northeast',
    population: 616279, gdpPerCapita: 22460,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 68, density99: 42, densityPotential: 48, supplyReadiness: 52, strategicValue: 38,
    avgMealPrice: 40, lat: -12.27, lng: -38.97,
    note: 'BA second city. Logistics crossroads.',
  },
  {
    id: 'aracaju', name: 'Aracaju', state: 'SE', region: 'Northeast',
    population: 602757, gdpPerCapita: 26590,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 70, density99: 50, densityPotential: 56, supplyReadiness: 56, strategicValue: 45,
    avgMealPrice: 42, lat: -10.91, lng: -37.07,
    note: 'Smallest NE state capital. Compact metro.',
  },
  {
    id: 'joinville', name: 'Joinville', state: 'SC', region: 'South',
    population: 597658, gdpPerCapita: 49870,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 78, density99: 60, densityPotential: 70, supplyReadiness: 68, strategicValue: 55,
    avgMealPrice: 54, lat: -26.30, lng: -48.85,
    note: 'SC industrial leader. High income.',
  },
  {
    id: 'florianopolis', name: 'Florianópolis', state: 'SC', region: 'South',
    population: 537211, gdpPerCapita: 51890,
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 80, density99: 64, densityPotential: 78, supplyReadiness: 64, strategicValue: 70,
    avgMealPrice: 60, lat: -27.59, lng: -48.55,
    note: 'High income + tourism + tech scene. Premium tier-3.',
  },
  {
    id: 'niteroi', name: 'Niterói', state: 'RJ', region: 'Southeast',
    population: 481549, gdpPerCapita: 65890,
    isLaunched: true, launchDate: '2025-10',
    keetaPresent: false,
    ifoodShare: 84, density99: 78, densityPotential: 86, supplyReadiness: 72, strategicValue: 68,
    avgMealPrice: 62, lat: -22.88, lng: -43.10,
    note: 'Highest GDP/capita in RJ metro. Premium suburb of Rio.',
  },
  {
    id: 'santos', name: 'Santos', state: 'SP', region: 'Southeast',
    population: 418608, gdpPerCapita: 64740,
    isLaunched: false,                                 // Verified: Keeta launched here Oct 30 2025
    keetaPresent: true,                                // SOURCE: Bloomberg 2025-10-30 (Keeta first Brazil launch)
    ifoodShare: 76, density99: 70, densityPotential: 80, supplyReadiness: 70, strategicValue: 75,
    avgMealPrice: 60, lat: -23.96, lng: -46.33,
    note: 'KEETA FIRST BEACHHEAD. Strategic to contest. Port city, high income.',
  },
  {
    id: 'vitoria', name: 'Vitória', state: 'ES', region: 'Southeast',
    population: 322869, gdpPerCapita: 88950,           // One of highest in Brazil
    isLaunched: false,
    keetaPresent: false,
    ifoodShare: 78, density99: 60, densityPotential: 78, supplyReadiness: 62, strategicValue: 60,
    avgMealPrice: 60, lat: -20.32, lng: -40.34,
    note: 'Smallest pop, highest GDP/capita. Compact + wealthy = ideal pilot.',
  },
];

// Default flywheel-score weights (0–1, sum = 1). Mutable in UI.
export const DEFAULT_WEIGHTS = {
  marketSize: 0.20,
  existingBase: 0.20,
  densityPotential: 0.20,
  competitionPressure: 0.10, // applied as (100 - competition)
  supplyReadiness: 0.15,
  strategicValue: 0.15,
};

// Tier thresholds applied to flywheel score (0–100).
export const TIER_THRESHOLDS = { S: 80, A: 65, B: 50 };
// >=80 S | >=65 A | >=50 B | <50 C
