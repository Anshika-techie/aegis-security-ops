import { useId } from 'react';

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

export function Sparkline({ data, color = 'var(--teal)', width = 108, height = 34 }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - 3 - ((value - min) / span) * (height - 6);
    return [x, y];
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} ${width},${height} 0,${height}`;

  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polygon points={area} fill={color} opacity="0.09" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Grouped bar chart — labels come from the dataset.                   */
/* ------------------------------------------------------------------ */

export function BarSeries({ data, series, height = 210 }) {
  const max = Math.max(...data.flatMap((row) => series.map((item) => row[item.key])), 1);
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <div className="bar-chart">
      <div className="bar-chart__axis" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick}>{Math.round(max * tick).toLocaleString()}</span>
        ))}
      </div>
      <div className="bar-chart__plot" style={{ height }}>
        <div className="bar-chart__grid" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} />
          ))}
        </div>
        <div className="bar-chart__groups">
          {data.map((row, index) => (
            <div key={row.label + index} className="bar-group">
              <div className="bar-group__bars">
                {series.map((item) => (
                  <span
                    key={item.key}
                    className="bar-group__bar"
                    style={{
                      height: `${Math.max(2, (row[item.key] / max) * 100)}%`,
                      background: item.color,
                    }}
                    title={`${item.label} · ${row.label}: ${row[item.key].toLocaleString()}`}
                  />
                ))}
              </div>
              <span className="bar-group__label">
                {index % labelEvery === 0 || index === data.length - 1 ? row.label : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal breakdown                                                */
/* ------------------------------------------------------------------ */

export function HBarList({ items, tone = 'teal', suffix = '' }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="h-bars">
      {items.map((item) => (
        <li
          key={item.label}
          className="h-bar"
          title={`${item.label}: ${item.value.toLocaleString()}${suffix}`}
        >
          <div className="h-bar__top">
            <span className="h-bar__label">{item.label}</span>
            <span className="h-bar__value">
              {item.value.toLocaleString()}
              {suffix}
            </span>
          </div>
          <div className="h-bar__track">
            <span
              className={`h-bar__fill h-bar__fill--${item.tone ?? tone}`}
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Ring / donut                                                        */
/* ------------------------------------------------------------------ */

export function Ring({ value, label, size = 62, stroke = 5, color = 'var(--teal)' }) {
  const id = useId();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          id={id}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring__value">{label ?? `${Math.round(value)}%`}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked severity strip                                              */
/* ------------------------------------------------------------------ */

export function SeverityStrip({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="severity-strip">
      <div className="severity-strip__bar" role="img" aria-label="Severity distribution">
        {data.map((item) => (
          <span
            key={item.label}
            style={{ width: `${(item.value / total) * 100}%`, background: item.color }}
            title={`${item.label}: ${item.value.toLocaleString()}`}
          />
        ))}
      </div>
      <ul className="severity-strip__legend">
        {data.map((item) => (
          <li key={item.label}>
            <span className="dot" style={{ background: item.color }} aria-hidden="true" />
            <span>{item.label}</span>
            <strong>{item.value.toLocaleString()}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
