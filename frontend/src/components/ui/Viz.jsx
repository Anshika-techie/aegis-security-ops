import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompact, formatNumber } from '../../lib/format';
import { CHART_TOOLTIP_STYLE } from '../../lib/colors';

const AXIS = {
  stroke: 'transparent',
  tick: { fill: '#7E8B98', fontSize: 10.5 },
};

const TOOLTIP = {
  contentStyle: CHART_TOOLTIP_STYLE,
  labelStyle: { color: '#929EAA', fontSize: 11, marginBottom: 4 },
  itemStyle: { fontSize: 11.5 },
  cursor: { stroke: '#3A4652', strokeDasharray: '3 3' },
};

function tooltipFormatter(value, name) {
  return [formatNumber(value), name];
}

export function ThreatAreaChart({ data, series, height = 240, yTickFormatter = formatCompact, legend = true }) {
  const hasRightAxis = series.some((item) => item.axis === 'right');

  return (
    <div>
      <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: hasRightAxis ? 4 : 6, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#263039" vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" {...AXIS} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis
            yAxisId="left"
            {...AXIS}
            tickLine={false}
            axisLine={false}
            tickFormatter={yTickFormatter}
            width={48}
          />
          {hasRightAxis ? (
            <YAxis
              yAxisId="right"
              orientation="right"
              {...AXIS}
              tickLine={false}
              axisLine={false}
              tickFormatter={yTickFormatter}
              width={44}
            />
          ) : null}
          <Tooltip {...TOOLTIP} formatter={tooltipFormatter} />
          {series.map((item) => (
            <Area
              key={item.key}
              yAxisId={item.axis ?? 'left'}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={1.7}
              fill={item.color}
              fillOpacity={item.fillOpacity ?? 0.1}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      </div>
      {legend ? (
        <div className="chart-legend" style={{ marginTop: 8 }}>
          {series.map((item) => (
            <span key={item.key}>
              <span className="dot" style={{ background: item.color }} aria-hidden="true" /> {item.label}
              {item.axis === 'right' ? ' (right axis)' : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CategoryBarChart({ data, series, height = 230 }) {
  return (
    <div>
      <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -20 }} barGap={2}>
          <CartesianGrid stroke="#263039" vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" {...AXIS} tickLine={false} axisLine={false} interval={0} />
          <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={formatCompact} width={48} />
          <Tooltip {...TOOLTIP} formatter={tooltipFormatter} />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      </div>
      <div className="chart-legend" style={{ marginTop: 8 }}>
        {series.map((item) => (
          <span key={item.key}>
            <span className="dot" style={{ background: item.color }} aria-hidden="true" /> {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PostureRadar({ data, height = 250 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#303B46" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#929EAA', fontSize: 10.5 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Posture"
            dataKey="score"
            stroke="#55B9A6"
            fill="#55B9A6"
            fillOpacity={0.16}
            strokeWidth={1.6}
            dot={{ r: 2.5, fill: '#55B9A6', strokeWidth: 0 }}
          />
          <Tooltip {...TOOLTIP} formatter={(value) => [`${value}%`, 'Score']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityDonut({ data, height = 208, centerLabel = 'Threats' }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="donut">
      <div className="donut__chart" style={{ height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="86%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              {...TOOLTIP}
              formatter={(value, name) => [`${formatNumber(value)} · ${((value / total) * 100).toFixed(1)}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__center">
          <strong>{formatCompact(total)}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="donut__legend">
        {data.map((item) => (
          <li key={item.label}>
            <span className="dot" style={{ background: item.color }} aria-hidden="true" />
            <span className="donut__legend-label">{item.label}</span>
            <strong>{((item.value / total) * 100).toFixed(1)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
