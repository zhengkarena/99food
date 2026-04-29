import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot, ResponsiveContainer,
} from 'recharts';
import { FLYWHEEL_THRESHOLD } from '../../utils/forecast.js';

/**
 * Multi-strategy 90-day chart.
 * - Y-axis primary  : organic share (0–1) — the headline curve
 * - Reference line  : 40% flywheel threshold
 * - Reference dots  : per-strategy ignition day
 * - Vertical line   : Keeta-attack day (when active)
 *
 * The "breakeven" series is rendered as a faint area below for context.
 */
export function ForecastChart({ forecasts, keetaAttackDay, focusMetric = 'organicShare' }) {
  // Build a unified row-per-day data: { day, [strategyId]: value, ... }
  const days = forecasts[0]?.series?.length ?? 0;
  const data = Array.from({ length: days }, (_, day) => {
    const row = { day };
    forecasts.forEach((f) => {
      row[f.strategy.id] = f.series[day][focusMetric];
    });
    return row;
  });

  const isShare = focusMetric === 'organicShare';
  const yDomain = isShare ? [0, 0.7] : ['auto', 'auto'];

  return (
    <div className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 24, right: 32, bottom: 8, left: 32 }}>
          <defs>
            {forecasts.map((f) => (
              <linearGradient key={f.strategy.id} id={`grad-${f.strategy.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={f.strategy.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={f.strategy.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#252932" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="day"
            type="number"
            domain={[0, 90]}
            ticks={[0, 15, 30, 45, 60, 75, 90]}
            tickFormatter={(v) => `D${v}`}
            stroke="#5A6172"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B92A3' }}
            axisLine={{ stroke: '#252932' }}
          />
          <YAxis
            domain={yDomain}
            stroke="#5A6172"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B92A3' }}
            tickFormatter={(v) => isShare ? `${Math.round(v * 100)}%` : formatNum(v)}
            axisLine={{ stroke: '#252932' }}
            width={50}
          />
          <Tooltip
            cursor={{ stroke: '#3A3F4B', strokeDasharray: '3 3' }}
            contentStyle={{
              background: '#0F1115',
              border: '1px solid #252932',
              borderRadius: 6,
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
            }}
            labelStyle={{ color: '#EAECF2', fontWeight: 600 }}
            itemStyle={{ color: '#B8BFD0' }}
            labelFormatter={(v) => `Day ${v}`}
            formatter={(v, name) => [
              isShare ? `${(v * 100).toFixed(1)}%` : formatNum(v),
              forecasts.find((f) => f.strategy.id === name)?.strategy.label ?? name,
            ]}
          />

          {/* Flywheel threshold line */}
          {isShare && (
            <ReferenceLine
              y={FLYWHEEL_THRESHOLD}
              stroke="#3FCB6B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Flywheel threshold · ${Math.round(FLYWHEEL_THRESHOLD * 100)}% organic`,
                position: 'insideBottomRight',
                fill: '#3FCB6B',
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
              }}
            />
          )}

          {/* Keeta attack vertical line */}
          {keetaAttackDay != null && (
            <ReferenceLine
              x={keetaAttackDay}
              stroke="#E63946"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Keeta attack · Day ${keetaAttackDay}`,
                position: 'insideTopRight',
                fill: '#FF6B75',
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
              }}
            />
          )}

          {forecasts.map((f) => (
            <Area
              key={f.strategy.id}
              type="monotone"
              dataKey={f.strategy.id}
              stroke={f.strategy.color}
              strokeWidth={2.5}
              fill={`url(#grad-${f.strategy.id})`}
              isAnimationActive={false}
              name={f.strategy.id}
            />
          ))}

          {/* Ignition-day dots */}
          {isShare && forecasts.map((f) => f.igniteDay != null && (
            <ReferenceDot
              key={`ig-${f.strategy.id}`}
              x={f.igniteDay}
              y={f.series[f.igniteDay].organicShare}
              r={6}
              fill={f.strategy.color}
              stroke="#0F1115"
              strokeWidth={2}
              isFront
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-ink-500">
        <div className="flex items-center gap-4">
          {forecasts.map((f) => (
            <span key={f.strategy.id} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5" style={{ background: f.strategy.color }} />
              <span className="text-ink-300">{f.strategy.label}</span>
              {f.igniteDay != null && (
                <span className="text-ink-500">· ignite D{f.igniteDay}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatNum(v) {
  if (v == null) return '';
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return Math.round(v).toString();
}
