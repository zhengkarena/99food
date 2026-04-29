import { useMemo, useState } from 'react';
import { TopNav } from './components/shared/TopNav.jsx';
import { TabBar } from './components/shared/TabBar.jsx';
import { CityScorecard } from './components/CityScorecard/CityScorecard.jsx';
import { SubsidySimulator } from './components/SubsidySimulator/SubsidySimulator.jsx';
import { StrategyGenerator } from './components/StrategyGenerator/StrategyGenerator.jsx';
import { UnitEconomics } from './components/UnitEconomics/UnitEconomics.jsx';
import { UploadModal } from './components/DataUpload/UploadModal.jsx';
import { UploadResultPanel } from './components/DataUpload/UploadResultPanel.jsx';
import { CITIES } from './data/cities.js';
import { BENCHMARKS } from './data/benchmarks.js';

/** Snapshot what changed between default and uploaded city dataset. */
function diffCities(before, after) {
  const beforeIds = new Set(before.map((c) => c.id));
  const afterIds = new Set(after.map((c) => c.id));
  const added = [...afterIds].filter((id) => !beforeIds.has(id)).length;
  const removed = [...beforeIds].filter((id) => !afterIds.has(id)).length;
  // count rows where any tracked numeric field differs
  const FIELDS = ['population', 'gdpPerCapita', 'ifoodShare', 'density99',
                  'densityPotential', 'supplyReadiness', 'strategicValue', 'avgMealPrice'];
  const beforeMap = new Map(before.map((c) => [c.id, c]));
  let changed = 0;
  after.forEach((c) => {
    const orig = beforeMap.get(c.id);
    if (!orig) return;
    if (FIELDS.some((f) => orig[f] !== c[f])) changed += 1;
  });
  return { before: before.length, after: after.length, changed, added, removed };
}

const TABS = [
  { id: 'scorecard',  label: '01 · City Scorecard',     hint: 'Flywheel ranking' },
  { id: 'subsidy',    label: '02 · Subsidy ROI',        hint: 'Marginal-decay simulator' },
  { id: 'strategy',   label: '03 · Entry Strategy',     hint: 'Auto brief' },
  { id: 'economics',  label: '04 · 90-Day Forecast',    hint: 'Unit economics' },
];

export default function App() {
  const [active, setActive] = useState('scorecard');
  const [selectedCityId, setSelectedCityId] = useState('fortaleza');
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload overrides — null when default
  const [customCities, setCustomCities] = useState(null);
  const [benchmarkOverrides, setBenchmarkOverrides] = useState(null);
  const [refittedElasticity, setRefittedElasticity] = useState(null);
  // Floating result panel — bottom-right, 8s auto-dismiss
  const [uploadResult, setUploadResult] = useState(null);

  // Effective data (default merged with any uploads)
  const cities = customCities ?? CITIES;
  const benchmarks = useMemo(() => {
    let b = BENCHMARKS;
    if (benchmarkOverrides) b = { ...b, ...benchmarkOverrides };
    if (refittedElasticity) {
      b = {
        ...b,
        elasticity: { ...b.elasticity, ...refittedElasticity },
      };
    }
    return b;
  }, [benchmarkOverrides, refittedElasticity]);

  const dataSourceLabel = customCities || benchmarkOverrides || refittedElasticity
    ? 'Custom Data'
    : 'Default Data';

  const selectedCity = cities.find((c) => c.id === selectedCityId) ?? cities[0];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        selectedCity={selectedCity}
        dataSource={dataSourceLabel}
        launchedCount={cities.filter((c) => c.isLaunched).length}
        target={benchmarks.food99CitiesTarget.value}
        onUploadClick={() => setUploadOpen(true)}
      />

      <TabBar tabs={TABS} active={active} onChange={setActive} />

      <main className="flex-1 px-6 py-5 max-w-[1600px] w-full mx-auto">
        {active === 'scorecard' && (
          <CityScorecard
            cities={cities}
            selectedCityId={selectedCityId}
            onSelectCity={setSelectedCityId}
          />
        )}
        {active === 'subsidy' && (
          <SubsidySimulator
            cities={cities}
            benchmarks={benchmarks}
            selectedCityId={selectedCityId}
            onSelectCity={setSelectedCityId}
          />
        )}
        {active === 'strategy' && (
          <StrategyGenerator
            city={selectedCity}
            cities={cities}
            benchmarks={benchmarks}
          />
        )}
        {active === 'economics' && (
          <UnitEconomics
            city={selectedCity}
            cities={cities}
            benchmarks={benchmarks}
          />
        )}
      </main>

      <footer className="px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-ink-500 font-mono border-t border-ink-700">
        99Food City Console · interview demo · data verified 2026-04-29 · see DATA_SOURCES.md
      </footer>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onCitiesUpload={(newCities) => {
          setCustomCities(newCities);
          setUploadResult({
            kind: 'cities',
            summary: diffCities(CITIES, newCities),
            ts: Date.now(),
            linkTo: 'scorecard',
            linkLabel: 'See updated rankings →',
          });
        }}
        onBenchmarksUpload={(overrides) => {
          setBenchmarkOverrides(overrides);
          setUploadResult({
            kind: 'benchmarks',
            diffs: Object.entries(overrides).map(([key, override]) => ({
              key,
              before: BENCHMARKS[key]?.value,
              after: override.value,
              unit: override.unit,
            })),
            ts: Date.now(),
            linkTo: 'subsidy',
            linkLabel: 'See updated ROI curves →',
          });
        }}
        onExperimentsUpload={(refitted) => {
          setRefittedElasticity(refitted);
          const refits = {};
          Object.entries(refitted).forEach(([seg, m]) => {
            refits[seg] = {
              before: BENCHMARKS.elasticity[seg].k,
              after: m.k,
              n: m._samples,
            };
          });
          setUploadResult({
            kind: 'experiments',
            refits,
            ts: Date.now(),
            linkTo: 'subsidy',
            linkLabel: 'See updated curves in Subsidy ROI →',
          });
        }}
        defaultElasticity={BENCHMARKS.elasticity}
        avgPrice={BENCHMARKS.avgOrderValue.value}
        hasCustomCities={!!customCities}
        hasCustomBenchmarks={!!benchmarkOverrides}
        hasCustomExperiments={!!refittedElasticity}
        onResetAll={() => {
          setCustomCities(null);
          setBenchmarkOverrides(null);
          setRefittedElasticity(null);
          setUploadResult(null);
        }}
      />

      <UploadResultPanel
        result={uploadResult}
        onClose={() => setUploadResult(null)}
        onNavigate={setActive}
      />
    </div>
  );
}
