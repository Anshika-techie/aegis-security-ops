import { useMemo, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import { Badge } from './Primitives';
import { SEVERITY_COLORS } from '../../lib/colors';
import { formatNumber } from '../../lib/format';

const WIDTH = 800;
const HEIGHT = 400;

const LAND = feature(world, world.objects.countries).features;

export default function WorldMap({ origins = [], legend = true }) {
  const [active, setActive] = useState(null);

  const { paths, projection } = useMemo(() => {
    const project = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [WIDTH - 8, HEIGHT - 8],
      ],
      { type: 'Sphere' },
    );
    const path = geoPath(project);
    return {
      projection: project,
      paths: LAND.map((country) => path(country)).filter(Boolean),
    };
  }, []);

  const markers = useMemo(() => {
    if (!projection) return [];
    const max = Math.max(...origins.map((origin) => origin.count), 1);
    return origins
      .map((origin) => {
        const point = projection(origin.coords);
        if (!point) return null;
        return {
          ...origin,
          x: point[0],
          y: point[1],
          radius: 4.5 + Math.sqrt(origin.count / max) * 10,
        };
      })
      .filter(Boolean);
  }, [origins, projection]);

  const graticule = useMemo(() => geoPath(projection)(geoGraticule10()), [projection]);

  if (!markers.length) {
    return <p className="record-sub">No geographic activity in this range.</p>;
  }

  return (
    <div className="world-map">
      <div className="world-map__canvas">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="world-map__svg"
          role="img"
          aria-label="World map of attack origins"
        >
          <rect width={WIDTH} height={HEIGHT} fill="#151D25" rx="8" />
          <path d={graticule} fill="none" stroke="#263039" strokeWidth="0.4" />
          {paths.map((d, index) => (
            <path key={index} d={d} fill="#1E2832" stroke="#303B46" strokeWidth="0.45" />
          ))}
          {markers.map((marker) => (
            <g
              key={marker.code}
              className={`world-map__marker ${active?.code === marker.code ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(marker)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(marker)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              role="button"
              aria-label={`${marker.name}: ${formatNumber(marker.count)} attacks`}
            >
              <circle cx={marker.x} cy={marker.y} r={marker.radius + 9} fill="transparent" />
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.radius + 5}
                fill={SEVERITY_COLORS[marker.severity]}
                opacity="0.14"
              />
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.radius}
                fill={SEVERITY_COLORS[marker.severity]}
                stroke="#10151B"
                strokeWidth="1.2"
              />
            </g>
          ))}
        </svg>

        <div className="world-map__tip" aria-live="polite">
          {active ? (
            <>
              <div className="world-map__tip-head">
                <strong>{active.name}</strong>
                <Badge tone={active.severity === 'Critical' ? 'critical' : active.severity === 'High' ? 'high' : active.severity === 'Medium' ? 'medium' : 'low'}>
                  {active.severity}
                </Badge>
              </div>
              <dl>
                <div>
                  <dt>Detected</dt>
                  <dd>{formatNumber(active.count)}</dd>
                </div>
                <div>
                  <dt>Blocked</dt>
                  <dd>{formatNumber(active.blocked)}</dd>
                </div>
                <div>
                  <dt>Share</dt>
                  <dd>{active.share.toFixed(1)}%</dd>
                </div>
              </dl>
            </>
          ) : (
            <span className="record-sub">Hover a marker for origin detail.</span>
          )}
        </div>

        {legend ? (
          <div className="world-map__legend">
            {Object.entries(SEVERITY_COLORS).map(([label, color]) => (
              <span key={label}>
                <span className="dot" style={{ background: color }} aria-hidden="true" /> {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
