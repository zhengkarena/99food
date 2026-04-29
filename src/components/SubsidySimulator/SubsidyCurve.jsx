import { useMemo } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot, ResponsiveContainer,
} from 'recharts';

/**
 * Dual-axis decay curve.
 *  - Left axis: cumulative incremental orders (solid yellow line)
 *  - Right axis: marginal incremental orders per +R$1 of subsidy (dashed dim line)
 *
 *  Pulsing dot = current subsidy position (user-controlled).
 *  Vertical reference line = sweet spot (∂ROI/∂s = 1).
 */
export function SubsidyCurve({ data, currentSubsidy, sweet, segmentLabel, industryReality }) {
  const current = useMemo(() => {
    // Find nearest sample to current subsidy for tooltip dot
    return data.reduce((best, p) =>
      Math.abs(p.subsidy - currentSubsidy) < Math.abs(best.subsidy - currentSubsidy) ? p : best
    , data[0]);
  }, [data, currentSubsidy]);

  return (
    <div className="h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 32, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD200" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#FFD200" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#252932" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="subsidy"
            type="number"
            domain={[0, 25]}
            ticks={[0, 5, 10, 15, 20, 25]}
            tickFormatter={(v) => `R$${v}`}
            stroke="#5A6172"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B92A3' }}
            axisLine={{ stroke: '#252932' }}
          >
          </XAxis>
          <YAxis
            yAxisId="cum"
            stroke="#5A6172"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B92A3' }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            axisLine={{ stroke: '#252932' }}
            width={55}
          />
          <YAxis
            yAxisId="marg"
            orientation="right"
            stroke="#5A6172"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B92A3' }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
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
            labelFormatter={(v) => `Subsidy R$${Number(v).toFixed(2)}`}
            formatter={(v, name) => {
              if (name === 'Cumulative incremental orders') return [Number(v).toLocaleString(), name];
              if (name === 'Marginal orders per +R$1') return [Number(v).toLocaleString(), name];
              return [v, name];
            }}
          />

          {/* Sweet-spot vertical reference */}
          {sweet?.viable && (
            <ReferenceLine
              yAxisId="cum"
              x={sweet.sweetSubsidy}
              stroke="#009C3B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Sweet spot · R$${sweet.sweetSubsidy.toFixed(1)}`,
                position: 'top',
                fill: '#3FCB6B',
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
              }}
            />
          )}

          {/* Industry reality water-level reference */}
          {industryReality != null && (
            <ReferenceLine
              yAxisId="cum"
              x={industryReality}
              stroke="#E63946"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Industry reality · R$${industryReality}`,
                position: 'insideTopRight',
                fill: '#FF6B75',
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
              }}
            />
          )}

          <Area
            yAxisId="cum"
            type="monotone"
            dataKey="cumulativeOrders"
            stroke="#FFD200"
            strokeWidth={2.5}
            fill="url(#cumFill)"
            name="Cumulative incremental orders"
            isAnimationActive={false}
          />
          <Line
            yAxisId="marg"
            type="monotone"
            dataKey="marginalPerReal"
            stroke="#8B92A3"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            name="Marginal orders per +R$1"
            isAnimationActive={false}
          />

          {/* Current position dot */}
          <ReferenceDot
            yAxisId="cum"
            x={current.subsidy}
            y={current.cumulativeOrders}
            r={6}
            fill="#FFD200"
            stroke="#0F1115"
            strokeWidth={2}
            isFront
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-ink-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-signal" /> Cumulative incremental
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 border-t border-dashed border-ink-400" /> Marginal per +R$1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-verde rounded-full" /> Sweet spot
          </span>
          {industryReality != null && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-alert rounded-full" /> Industry reality
            </span>
          )}
        </div>
        <div className="text-ink-500">Segment: <span className="text-ink-300">{segmentLabel}</span></div>
      </div>
    </div>
  );
}
