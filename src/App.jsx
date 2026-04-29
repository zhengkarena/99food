import { useMemo, useState } from 'react';
import { TopNav } from './components/shared/TopNav.jsx';
import { TabBar } from './components/shared/TabBar.jsx';
import { CityScorecard } from './components/CityScorecard/CityScorecard.jsx';
import { SubsidySimulator } from './components/SubsidySimulator/SubsidySimulator.jsx';
import { StrategyGenerator } from './components/StrategyGenerator/StrategyGenerator.jsx';
import { UnitEconomics } from './components/UnitEconomics/UnitEconomics.jsx';
import { UploadModal } from './components/DataUpload/UploadModal.jsx';
import { CITIES } from './data/cities.js';
import { BENCHMARKS } from './data/benchmarks.js';

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
        onCitiesUpload={setCustomCities}
        onBenchmarksUpload={setBenchmarkOverrides}
        onExperimentsUpload={setRefittedElasticity}
        defaultElasticity={BENCHMARKS.elasticity}
        avgPrice={BENCHMARKS.avgOrderValue.value}
        hasCustomCities={!!customCities}
        hasCustomBenchmarks={!!benchmarkOverrides}
        hasCustomExperiments={!!refittedElasticity}
        onResetAll={() => {
          setCustomCities(null);
          setBenchmarkOverrides(null);
          setRefittedElasticity(null);
        }}
      />
    </div>
  );
}
