import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

const AXES = [
  { key: 'marketSize',          label: 'Market size' },
  { key: 'existingBase',        label: '99 base' },
  { key: 'densityPotential',    label: 'Density potential' },
  { key: 'competitionPressure', label: 'Competitive room' },
  { key: 'supplyReadiness',     label: 'Supply readiness' },
  { key: 'strategicValue',      label: 'Strategic value' },
];

const SERIES_COLORS = ['#FFD200', '#3FCB6B', '#FF8C42'];

export function RadarComparison({ cities }) {
  // Reshape: one row per axis, one column per city
  const data = AXES.map((a) => {
    const row = { axis: a.label };
    cities.forEach((c) => {
      row[c.name] = Math.round(c._components[a.key]);
    });
    return row;
  });

  return (
    <div className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 24, right: 32, bottom: 8, left: 32 }}>
          <PolarGrid stroke="#252932" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fontFamily: 'JetBrains Mono',
              fontSize: 10,
              fill: '#8B92A3',
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#5A6172' }}
            stroke="#252932"
            tickCount={5}
          />
          {cities.map((c, i) => (
            <Radar
              key={c.id}
              name={c.name}
              dataKey={c.name}
              stroke={SERIES_COLORS[i] ?? '#B8BFD0'}
              fill={SERIES_COLORS[i] ?? '#B8BFD0'}
              fillOpacity={0.12}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: '#0F1115',
              border: '1px solid #252932',
              borderRadius: 6,
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
            }}
            labelStyle={{ color: '#EAECF2' }}
            itemStyle={{ color: '#B8BFD0' }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              paddingTop: 8,
            }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
