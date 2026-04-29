import { useState } from 'react';
import { RECOMMENDATION_META } from '../../utils/scoring.js';

/**
 * Lightweight Brazil map: simplified country outline + city dots placed via
 * lat/lng → SVG x/y projection. No mapping library, no GeoJSON parser —
 * just an SVG path approximating Brazil's outline (good enough for an
 * interactive briefing tool, not a GIS app).
 */

// Approximate equirectangular projection bounds for Brazil
const LNG_MIN = -74, LNG_MAX = -34;       // west to east
const LAT_MIN = -34, LAT_MAX = 6;         // south to north
const SVG_W = 520, SVG_H = 540, PAD = 12;

function project(lng, lat) {
  const x = PAD + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (SVG_W - 2 * PAD);
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (SVG_H - 2 * PAD);
  return [x, y];
}

// Hand-traced simplified Brazil outline. Coordinates in lng/lat order, projected
// to the SVG box at render time. Aims for "recognisable shape", not GIS accuracy.
const BRAZIL_OUTLINE = [
  [-60.5, 5.2], [-58.0, 4.5], [-54.5, 2.5], [-51.5, 4.2], [-50.0, 1.7],
  [-46.5, -0.5], [-43.5, -2.5], [-41.5, -2.8], [-38.5, -3.5], [-35.5, -5.3],
  [-34.8, -7.2], [-35.0, -9.5], [-37.0, -11.0], [-37.5, -13.0], [-39.0, -15.5],
  [-39.5, -18.0], [-40.0, -21.0], [-41.5, -23.0], [-44.0, -23.5], [-46.5, -24.0],
  [-48.5, -25.5], [-48.7, -26.5], [-48.5, -28.5], [-50.0, -30.5], [-52.0, -32.5],
  [-53.5, -33.7], [-56.0, -33.0], [-57.5, -30.3], [-57.0, -28.0], [-55.5, -25.5],
  [-54.5, -24.0], [-54.5, -22.5], [-56.0, -21.0], [-57.5, -19.0], [-58.0, -17.0],
  [-58.5, -15.5], [-60.5, -15.0], [-62.5, -13.5], [-64.5, -12.0], [-66.5, -11.0],
  [-69.0, -10.5], [-70.5, -11.0], [-72.5, -10.0], [-73.5, -8.5], [-73.0, -7.5],
  [-72.0, -5.0], [-70.0, -4.5], [-69.5, -2.0], [-69.0, -0.5], [-69.0, 1.5],
  [-67.5, 2.0], [-66.0, 1.0], [-64.0, 1.0], [-62.5, 2.5], [-60.5, 5.2],
];

function outlinePath() {
  return BRAZIL_OUTLINE
    .map(([lng, lat], i) => {
      const [x, y] = project(lng, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}

export function BrazilMap({ cities, selectedCityId, onSelectCity }) {
  const [hoverId, setHoverId] = useState(null);
  const hoverCity = hoverId ? cities.find((c) => c.id === hoverId) : null;
  const hoverCoord = hoverCity ? project(hoverCity.lng, hoverCity.lat) : null;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="label-xs">Geographic distribution</div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-ink-500">
          <Legend color="#FFD200" label="Launched" />
          <Legend color="#FF8C42" label="Enter" />
          <Legend color="#E63946" label="Contest" />
          <Legend color="#8B92A3" label="Watch" />
          <Legend color="#3A3F4B" label="Hold" />
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto"
          style={{ maxHeight: 540 }}
        >
          <defs>
            <pattern id="brazilGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="url(#brazilGrid)" />

          {/* Country outline */}
          <path
            d={outlinePath()}
            fill="rgba(255, 210, 0, 0.04)"
            stroke="#3A3F4B"
            strokeWidth="1.2"
          />

          {/* City dots */}
          {cities.map((c) => {
            const [x, y] = project(c.lng, c.lat);
            const meta = RECOMMENDATION_META[c._recommendation] ?? RECOMMENDATION_META.hold;
            const isSelected = c.id === selectedCityId;
            const isHover = c.id === hoverId;
            const r = isSelected ? 8 : isHover ? 7 : 5;
            return (
              <g
                key={c.id}
                onClick={() => onSelectCity(c.id)}
                onMouseEnter={() => setHoverId(c.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor: 'pointer' }}
              >
                {(isSelected || isHover) && (
                  <circle cx={x} cy={y} r={r + 4} fill={meta.color} opacity={0.15} />
                )}
                <circle
                  cx={x} cy={y} r={r}
                  fill={meta.color}
                  stroke={isSelected ? '#0F1115' : 'rgba(15,17,21,0.8)'}
                  strokeWidth={isSelected ? 2 : 1}
                />
              </g>
            );
          })}

          {/* Selected city label always visible */}
          {(() => {
            const sel = cities.find((c) => c.id === selectedCityId);
            if (!sel) return null;
            const [x, y] = project(sel.lng, sel.lat);
            return (
              <g>
                <text
                  x={x + 12} y={y + 4}
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  fill="#EAECF2"
                  style={{ paintOrder: 'stroke', stroke: '#0F1115', strokeWidth: 3 }}
                >
                  {sel.name}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Hover info card */}
        {hoverCity && hoverCoord && (
          <div
            className="absolute panel-raised p-3 pointer-events-none shadow-xl"
            style={{
              left: Math.min(hoverCoord[0] + 18, SVG_W - 200),
              top: Math.max(hoverCoord[1] - 60, 8),
              width: 200,
              zIndex: 20,
            }}
          >
            <div className="font-display text-base text-ink-100 leading-tight tracking-tightest">
              {hoverCity.name}
            </div>
            <div className="text-[10px] font-mono text-ink-500 mb-2">
              {hoverCity.state} · {hoverCity.region}
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="label-xs">Tier</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                style={{
                  background:
                    hoverCity._tier === 'S' ? '#FFD200'
                    : hoverCity._tier === 'A' ? '#009C3B'
                    : hoverCity._tier === 'B' ? '#3A3F4B' : '#9C232C',
                  color: hoverCity._tier === 'S' ? '#0F1115' : '#EAECF2',
                }}
              >
                {hoverCity._tier}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="label-xs">Flywheel</span>
              <span className="num text-base">{hoverCity._score}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="label-xs">Status</span>
              <span
                className="text-[10px] font-mono"
                style={{ color: RECOMMENDATION_META[hoverCity._recommendation].color }}
              >
                {RECOMMENDATION_META[hoverCity._recommendation].label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </span>
  );
}
