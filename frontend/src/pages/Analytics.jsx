import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getAnalyticsMetrics,
  getAttackSeries,
  getCategoryCounts,
  getGeoOrigins,
  getSeverityDistribution,
  getTrafficSeries,
} from '../data/mock';
import { formatCompact, formatNumber } from '../lib/format';
import { Badge, ChartCard, PageHeader, ProgressBar } from '../components/ui/Primitives';
import { HBarList, Ring } from '../components/ui/Charts';
import { SeverityDonut, ThreatAreaChart } from '../components/ui/Viz';
import { SEVERITY_COLORS, SERIES_COLORS } from '../lib/colors';

export default function Analytics() {
  const { range } = useApp();

  const attackSeries = useMemo(() => getAttackSeries(range), [range]);
  const traffic = useMemo(() => getTrafficSeries(range), [range]);
  const categories = useMemo(() => getCategoryCounts(range), [range]);
  const origins = useMemo(() => getGeoOrigins(range), [range]);

  const severity = useMemo(() => {
    const distribution = getSeverityDistribution(range);
    return Object.entries(distribution).map(([label, value]) => ({
      label,
      value,
      color: SEVERITY_COLORS[label],
    }));
  }, [range]);

  const totalRequests = traffic.reduce((sum, point) => sum + point.requests, 0);
  const totalBlocked = traffic.reduce((sum, point) => sum + point.blocked, 0);
  const totalThreats = traffic.reduce((sum, point) => sum + point.threats, 0);
  const blockRate = (totalBlocked / totalRequests) * 100;
  const threatRate = (totalThreats / totalRequests) * 100;
  const metrics = useMemo(() => getAnalyticsMetrics(range), [range]);

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        title="Attack analytics"
        description="Volume, categorization and origin analysis for detected and blocked activity in the selected window."
        actions={
          <span className="inline">
            <Badge tone="blue" dot>
              Block rate {blockRate.toFixed(2)}%
            </Badge>
            <Badge tone="teal" dot>
              {formatCompact(totalRequests)} requests
            </Badge>
          </span>
        }
      />

      <div className="grid grid--kpis">
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Detection accuracy</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--teal)' }}>{metrics.detectionAccuracy}%</p>
            <p className="record-sub">True positives across evaluated traffic.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">False-positive rate</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--amber)' }}>{metrics.falsePositiveRate}%</p>
            <p className="record-sub">Legitimate requests challenged in error.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">False-negative rate</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--red)' }}>{metrics.falseNegativeRate}%</p>
            <p className="record-sub">Malicious requests that required later review.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stack stack--sm">
            <p className="section-title">Detection latency</p>
            <p style={{ fontSize: 22, fontWeight: 600 }}>{metrics.detectionLatency} ms</p>
            <p className="record-sub">Median inline inspection overhead per request.</p>
          </div>
        </div>
      </div>

      <div className="grid grid--2-1">
        <ChartCard
          title="Traffic versus threats"
          subtitle="Evaluated requests against detected threats"
          footer={`${formatCompact(totalThreats)} threats detected from ${formatCompact(totalRequests)} requests (${threatRate.toFixed(2)}%) · requests use the right axis`}
        >
          <ThreatAreaChart
            data={traffic}
            height={230}
            series={[
              { key: 'requests', label: 'Requests', color: 'rgba(113, 153, 199, 0.55)', fillOpacity: 0.04, axis: 'right' },
              { key: 'threats', label: 'Threats', color: SERIES_COLORS.detected },
              { key: 'blocked', label: 'Blocked', color: SERIES_COLORS.blocked },
            ]}
          />
        </ChartCard>

        <ChartCard title="Severity distribution" subtitle="Classified threats in range">
          <SeverityDonut data={severity} height={188} />
          <div className="inline" style={{ justifyContent: 'space-around', gap: 12, marginTop: 8 }}>
            <div className="stack" style={{ alignItems: 'center', gap: 4 }}>
              <Ring value={blockRate} label={`${blockRate.toFixed(1)}%`} size={58} stroke={5} />
              <span className="record-sub">Block rate</span>
            </div>
            <div className="stack" style={{ alignItems: 'center', gap: 4 }}>
              <Ring value={97.8} label="97.8%" size={58} stroke={5} color="#7199C7" />
              <span className="record-sub">Coverage</span>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Blocked versus allowed requests"
        subtitle="Containment decisions across the selected window"
        footer={`${formatCompact(metrics.allowed)} allowed (right axis) · ${formatCompact(metrics.blocked)} blocked (left axis)`}
      >
        <ThreatAreaChart
          data={traffic}
          height={210}
          series={[
            { key: 'allowed', label: 'Allowed', color: 'rgba(85, 185, 166, 0.55)', fillOpacity: 0.04, axis: 'right' },
            { key: 'blocked', label: 'Blocked', color: SERIES_COLORS.detected },
          ]}
        />
      </ChartCard>

      <div className="grid grid--2">
        <ChartCard title="Detections by attack family" subtitle="Projected occurrences in the selected window">
          <HBarList
            suffix=" events"
            items={categories.map((category) => ({
              label: category.name,
              value: category.count,
              tone:
                category.severity === 'Critical' ? 'red' : category.severity === 'High' ? 'amber' : 'blue',
            }))}
          />
        </ChartCard>

        <ChartCard title="Blocked by attack family" subtitle="Containment per family">
          <div className="stack" style={{ gap: 14 }}>
            {categories.map((category) => (
              <div key={category.id} className="stack stack--sm" style={{ gap: 5 }}>
                <div className="stat-line">
                  <span style={{ fontSize: 12 }}>{category.name}</span>
                  <strong>
                    {category.blocked.toLocaleString()}{' '}
                    <span className="muted" style={{ fontWeight: 400 }}>
                      / {category.count.toLocaleString()}
                    </span>
                  </strong>
                </div>
                <ProgressBar
                  value={category.count ? (category.blocked / category.count) * 100 : 0}
                  tone={category.severity === 'Critical' ? 'red' : 'teal'}
                  label={`${category.name} blocked`}
                />
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid--2-1">
        <ChartCard
          title="Geographic origin"
          subtitle="Request volume by source country"
          footer={`${origins.length} countries observed · top five account for ${origins
            .slice(0, 5)
            .reduce((sum, origin) => sum + origin.share, 0)
            .toFixed(1)}% of traffic`}
        >
          <div className="grid grid--2">
            <HBarList
              items={origins.slice(0, 8).map((origin, index) => ({
                label: origin.name,
                value: origin.count,
                tone: index === 0 ? 'red' : index < 3 ? 'amber' : 'blue',
              }))}
            />
            <div className="meta-list">
              {origins.slice(0, 8).map((origin) => (
                <div key={origin.code} className="meta-row">
                  <span>
                    {origin.code} · {origin.name}
                  </span>
                  <span className="mono" style={{ fontSize: 11.5 }}>
                    {formatNumber(origin.blocked)} blocked
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Collection summary" subtitle="What this window covers">
          <div className="meta-list">
            <div className="meta-row">
              <span>Requests evaluated</span>
              <span className="mono">{formatNumber(totalRequests)}</span>
            </div>
            <div className="meta-row">
              <span>Threats detected</span>
              <span className="mono">{formatNumber(totalThreats)}</span>
            </div>
            <div className="meta-row">
              <span>Requests blocked</span>
              <span className="mono">{formatNumber(totalBlocked)}</span>
            </div>
            <div className="meta-row">
              <span>Attack families</span>
              <span className="mono">{categories.length}</span>
            </div>
            <div className="meta-row">
              <span>Detection accuracy</span>
              <span className="mono">99.2%</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </>
  );
}
