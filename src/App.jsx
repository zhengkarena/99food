import { useState } from 'react';
import { TopNav } from './components/shared/TopNav.jsx';
import { TabBar } from './components/shared/TabBar.jsx';
import { CityScorecard } from './components/CityScorecard/CityScorecard.jsx';
import { SubsidySimulator } from './components/SubsidySimulator/SubsidySimulator.jsx';
import { StrategyGenerator } from './components/StrategyGenerator/StrategyGenerator.jsx';
import { UnitEconomics } from './components/UnitEconomics/UnitEconomics.jsx';
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
  // Default vs user-uploaded data — Phase 3 will wire upload to setCities/setBenchmarks
  const [cities] = useState(CITIES);
  const [benchmarks] = useState(BENCHMARKS);
  const [dataSource] = useState('Default Data');

  const selectedCity = cities.find((c) => c.id === selectedCityId) ?? cities[0];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        selectedCity={selectedCity}
        dataSource={dataSource}
        launchedCount={cities.filter((c) => c.isLaunched).length}
        target={benchmarks.food99CitiesTarget.value}
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
    </div>
  );
}
