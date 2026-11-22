// Centralized mock dataset for the Aegis SOC demo.
// All visualizations and tables derive from these deterministic fixtures.

const NOW = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export const RANGES = [
  { id: '24h', label: 'Last 24 hours', short: '24H', points: 24, step: HOUR, scale: 0.039 },
  { id: '7d', label: 'Last 7 days', short: '7D', points: 28, step: 6 * HOUR, scale: 0.25 },
  { id: '30d', label: 'Last 30 days', short: '30D', points: 30, step: DAY, scale: 1 },
  { id: '90d', label: 'Last 90 days', short: '90D', points: 30, step: 3 * DAY, scale: 2.91 },
];

export const RANGE_MAP = Object.fromEntries(RANGES.map((r) => [r.id, r]));

export const ATTACK_TYPES = [
  {
    id: 'sqli',
    name: 'SQL Injection',
    short: 'SQLi',
    severity: 'Critical',
    mitre: 'T1190',
    endpoint: '/api/v1/auth/login',
    description:
      'Malicious SQL fragments were detected inside request parameters, attempting to bypass authentication or extract records from the users table.',
    mitigation: 'Parameterized queries enforced; WAF rule 942100 blocking offending payloads.',
  },
  {
    id: 'xss',
    name: 'Cross-Site Scripting',
    short: 'XSS',
    severity: 'High',
    mitre: 'T1059.007',
    endpoint: '/api/v1/search',
    description:
      'Reflected script payloads were submitted through search and comment parameters in an attempt to execute code in a privileged session.',
    mitigation: 'Output encoding and CSP header policy rejected the payload before rendering.',
  },
  {
    id: 'brute',
    name: 'Brute Force',
    short: 'Brute',
    severity: 'High',
    mitre: 'T1110',
    endpoint: '/api/v1/auth/login',
    description:
      'A high volume of failed authentication attempts originated from a single autonomous host against privileged accounts.',
    mitigation: 'Credential stuffing protection locked the source and forced step-up verification.',
  },
  {
    id: 'traversal',
    name: 'Path Traversal',
    short: 'Traversal',
    severity: 'Critical',
    mitre: 'T1083',
    endpoint: '/api/v1/files/download',
    description:
      'Directory traversal sequences were detected in file download parameters, targeting configuration and secret files outside the web root.',
    mitigation: 'Canonical path validation rejected the request and the source was quarantined.',
  },
  {
    id: 'rate',
    name: 'Abnormal Request Rate',
    short: 'Rate',
    severity: 'Medium',
    mitre: 'T1499',
    endpoint: '/api/v1/orders',
    description:
      'Traffic from a clustered botnet exceeded the behavioral baseline for the endpoint by more than eight standard deviations.',
    mitigation: 'Adaptive rate governor throttled the source cluster and queued legitimate traffic.',
  },
  {
    id: 'cmdi',
    name: 'Command Injection',
    short: 'RCE',
    severity: 'Critical',
    mitre: 'T1059',
    endpoint: '/api/v1/admin/config',
    description:
      'Shell metacharacters were detected in a configuration update payload, indicating an attempt at remote command execution.',
    mitigation: 'Input normalization blocked the payload; the session token was revoked.',
  },
];

export const ATTACK_MAP = Object.fromEntries(ATTACK_TYPES.map((a) => [a.id, a]));

export const ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/users',
  '/api/v1/orders',
  '/api/v1/admin/config',
  '/api/v1/files/download',
  '/api/v1/search',
  '/api/v1/payments',
  '/api/v1/session',
  '/graphql',
  '/wp-login.php',
];

export const COUNTRIES = [
  { code: 'CN', name: 'China', coords: [104, 35], weight: 1480 },
  { code: 'RU', name: 'Russia', coords: [96, 61], weight: 1240 },
  { code: 'US', name: 'United States', coords: [-98, 39], weight: 980 },
  { code: 'BR', name: 'Brazil', coords: [-52, -10], weight: 640 },
  { code: 'IN', name: 'India', coords: [78, 21], weight: 520 },
  { code: 'NL', name: 'Netherlands', coords: [5.5, 52], weight: 410 },
  { code: 'DE', name: 'Germany', coords: [10, 51], weight: 360 },
  { code: 'VN', name: 'Vietnam', coords: [106, 16], weight: 330 },
  { code: 'IR', name: 'Iran', coords: [53, 32], weight: 300 },
  { code: 'UA', name: 'Ukraine', coords: [32, 49], weight: 240 },
  { code: 'ID', name: 'Indonesia', coords: [118, -2], weight: 210 },
  { code: 'SG', name: 'Singapore', coords: [103.8, 1.35], weight: 180 },
  { code: 'RO', name: 'Romania', coords: [25, 46], weight: 160 },
  { code: 'TR', name: 'Turkey', coords: [35, 39], weight: 140 },
  { code: 'KR', name: 'South Korea', coords: [128, 36], weight: 120 },
  { code: 'GB', name: 'United Kingdom', coords: [-2, 54], weight: 110 },
  { code: 'FR', name: 'France', coords: [2, 47], weight: 95 },
  { code: 'PL', name: 'Poland', coords: [19, 52], weight: 80 },
  { code: 'NG', name: 'Nigeria', coords: [8, 10], weight: 65 },
  { code: 'BG', name: 'Bulgaria', coords: [25, 43], weight: 55 },
];

export const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

const SOURCE_IPS = [
  '185.220.101.4',
  '45.155.205.233',
  '103.145.13.9',
  '194.26.29.156',
  '89.248.165.74',
  '5.188.206.14',
  '198.98.51.189',
  '91.92.109.7',
  '141.98.10.62',
  '20.61.32.118',
  '185.7.214.9',
  '172.104.11.32',
  '64.62.197.30',
  '167.94.138.44',
  '218.92.0.112',
  '42.193.44.18',
  '51.15.43.205',
  '89.163.242.19',
  '185.180.143.77',
  '104.248.144.52',
  '203.145.94.7',
  '139.162.99.14',
  '87.251.64.19',
  '154.61.71.8',
];

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Detected', 'Blocked', 'Investigating', 'Resolved'];
const DETECTORS = [
  'WAF signature engine',
  'Behavioral baseline',
  'Authentication anomaly model',
  'Rate governor',
  'Request semantic analyzer',
  'Threat intel correlation',
];

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

function weighted(rand, pairs) {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [value, weight] of pairs) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
}

function pad(num, size = 2) {
  return String(num).padStart(size, '0');
}

export function eventCode(index) {
  return `EVT-${String(48210 + index)}`;
}

const ATTACK_WEIGHTS = [
  ['xss', 24],
  ['brute', 23],
  ['sqli', 18],
  ['rate', 16],
  ['traversal', 11],
  ['cmdi', 8],
];

const SEVERITY_WEIGHTS = [
  ['Critical', 13],
  ['High', 29],
  ['Medium', 36],
  ['Low', 22],
];

const STATUS_WEIGHTS = [
  ['Blocked', 44],
  ['Resolved', 23],
  ['Detected', 19],
  ['Investigating', 14],
];

const COUNTRY_WEIGHTS = COUNTRIES.map((c) => [c.code, c.weight]);

function buildEvents() {
  const rand = mulberry32(20261118);
  const events = [];
  for (let i = 0; i < 280; i += 1) {
    const bucket = rand();
    let ago;
    if (bucket < 0.16) ago = rand() * DAY;
    else if (bucket < 0.42) ago = DAY + rand() * 6 * DAY;
    else if (bucket < 0.78) ago = 7 * DAY + rand() * 23 * DAY;
    else ago = 30 * DAY + rand() * 60 * DAY;

    const type = ATTACK_MAP[weighted(rand, ATTACK_WEIGHTS)];
    const severity = weighted(rand, SEVERITY_WEIGHTS);
    const status = weighted(rand, STATUS_WEIGHTS);
    const country = COUNTRY_MAP[weighted(rand, COUNTRY_WEIGHTS)];
    const timestamp = new Date(NOW - ago);
    const endpoint = rand() > 0.55 ? type.endpoint : pick(rand, ENDPOINTS);
    const action =
      status === 'Blocked'
        ? 'Request blocked'
        : status === 'Resolved'
          ? 'Quarantined and closed'
          : status === 'Investigating'
            ? 'Rate limited'
            : 'Logged for review';

    events.push({
      id: '',
      timestamp: timestamp.toISOString(),
      attackType: type.id,
      attackName: type.name,
      sourceIp: pick(rand, SOURCE_IPS),
      sourceCountry: country.name,
      countryCode: country.code,
      endpoint,
      method: pick(rand, ['GET', 'POST', 'PUT', 'PATCH']),
      severity,
      status,
      action,
      detector: pick(rand, DETECTORS),
      rule: `WAF-${9300 + Math.floor(rand() * 600)}`,
      confidence: Math.round(76 + rand() * 23),
      responseCode: status === 'Blocked' ? 403 : rand() > 0.5 ? 429 : 200,
      bytes: Math.round(320 + rand() * 8400),
      userAgent:
        rand() > 0.6
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          : rand() > 0.3
            ? 'python-requests/2.31.0'
            : 'curl/8.1.2',
      description: type.description,
      mitigation: type.mitigation,
      mitre: type.mitre,
    });
  }
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return events.map((event, index) => ({ ...event, id: eventCode(index) }));
}

export const EVENTS = buildEvents();

function buildBlocked() {
  const rand = mulberry32(771902);
  const reasons = {
    sqli: 'SQL injection signature matched in query parameter',
    xss: 'Reflected script payload detected in request body',
    brute: 'Credential brute-force threshold exceeded',
    traversal: 'Directory traversal sequence in file path',
    rate: 'Request rate exceeded adaptive threshold',
    cmdi: 'Shell metacharacters detected in payload',
  };
  const list = [];
  for (let i = 0; i < 190; i += 1) {
    const ago = rand() * 90 * DAY;
    const type = ATTACK_MAP[weighted(rand, ATTACK_WEIGHTS)];
    const country = COUNTRY_MAP[weighted(rand, COUNTRY_WEIGHTS)];
    list.push({
      id: `BLK-${String(9050 + i)}`,
      timestamp: new Date(NOW - ago).toISOString(),
      sourceIp: pick(rand, SOURCE_IPS),
      country: country.name,
      countryCode: country.code,
      endpoint: rand() > 0.5 ? type.endpoint : pick(rand, ENDPOINTS),
      attackType: type.id,
      attackName: type.name,
      severity: weighted(rand, SEVERITY_WEIGHTS),
      reason: reasons[type.id],
      rule: `WAF-${9300 + Math.floor(rand() * 600)}`,
      layer: pick(rand, ['Edge WAF', 'API gateway', 'Auth service', 'Rate governor']),
      responseCode: rand() > 0.25 ? 403 : 429,
      reviewed: false,
    });
  }
  return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export const BLOCKED_REQUESTS = buildBlocked();

export const KPI_BASE = {
  '24h': [
    { id: 'requests', label: 'Total Requests', value: 48210, delta: 8.2, goodWhen: 'up', icon: 'activity' },
    { id: 'threats', label: 'Threats Detected', value: 412, delta: -4.1, goodWhen: 'down', icon: 'shield-alert' },
    { id: 'blocked', label: 'Blocked Requests', value: 486, delta: 6.7, goodWhen: 'up', icon: 'ban' },
    { id: 'active', label: 'Active Security Events', value: 138, delta: 3.4, goodWhen: 'down', icon: 'radar' },
    { id: 'health', label: 'System Health', value: 99.2, suffix: '%', delta: 0.2, goodWhen: 'up', icon: 'heart-pulse' },
  ],
  '7d': [
    { id: 'requests', label: 'Total Requests', value: 312480, delta: 12.4, goodWhen: 'up', icon: 'activity' },
    { id: 'threats', label: 'Threats Detected', value: 1870, delta: 6.8, goodWhen: 'down', icon: 'shield-alert' },
    { id: 'blocked', label: 'Blocked Requests', value: 2430, delta: 9.1, goodWhen: 'up', icon: 'ban' },
    { id: 'active', label: 'Active Security Events', value: 640, delta: -2.3, goodWhen: 'down', icon: 'radar' },
    { id: 'health', label: 'System Health', value: 98.7, suffix: '%', delta: 0.1, goodWhen: 'up', icon: 'heart-pulse' },
  ],
  '30d': [
    { id: 'requests', label: 'Total Requests', value: 1243480, delta: 9.7, goodWhen: 'up', icon: 'activity' },
    { id: 'threats', label: 'Threats Detected', value: 8214, delta: 14.2, goodWhen: 'down', icon: 'shield-alert' },
    { id: 'blocked', label: 'Blocked Requests', value: 9430, delta: 11.6, goodWhen: 'up', icon: 'ban' },
    { id: 'active', label: 'Active Security Events', value: 2310, delta: 7.9, goodWhen: 'down', icon: 'radar' },
    { id: 'health', label: 'System Health', value: 98.4, suffix: '%', delta: -0.3, goodWhen: 'up', icon: 'heart-pulse' },
  ],
  '90d': [
    { id: 'requests', label: 'Total Requests', value: 3621000, delta: 18.3, goodWhen: 'up', icon: 'activity' },
    { id: 'threats', label: 'Threats Detected', value: 24680, delta: 22.4, goodWhen: 'down', icon: 'shield-alert' },
    { id: 'blocked', label: 'Blocked Requests', value: 27800, delta: 19.8, goodWhen: 'up', icon: 'ban' },
    { id: 'active', label: 'Active Security Events', value: 6890, delta: 12.1, goodWhen: 'down', icon: 'radar' },
    { id: 'health', label: 'System Health', value: 98.1, suffix: '%', delta: -0.5, goodWhen: 'up', icon: 'heart-pulse' },
  ],
};

export function getKpis(rangeId) {
  const base = KPI_BASE[rangeId] ?? KPI_BASE['30d'];
  const metrics = getAnalyticsMetrics(rangeId);
  return base.map((kpi) => {
    if (kpi.id === 'requests') return { ...kpi, value: metrics.requests };
    if (kpi.id === 'threats') return { ...kpi, value: metrics.threats };
    if (kpi.id === 'blocked') return { ...kpi, value: metrics.blocked };
    return kpi;
  });
}

export function getGeoOrigins(rangeId) {
  const scale = (RANGE_MAP[rangeId] ?? RANGE_MAP['30d']).scale;
  const rand = mulberry32(4412);
  const raw = COUNTRIES.map((country) => {
    const count = Math.round(country.weight * scale * (0.85 + rand() * 0.3));
    const share = country.weight / COUNTRIES.reduce((sum, c) => sum + c.weight, 0);
    return {
      ...country,
      count,
      blocked: Math.round(count * (0.76 + rand() * 0.18)),
      share: share * 100,
      severity: share > 0.11 ? 'Critical' : share > 0.06 ? 'High' : share > 0.035 ? 'Medium' : 'Low',
    };
  });
  const rawTotal = raw.reduce((sum, country) => sum + country.count, 0) || 1;
  const attributed = getAnalyticsMetrics(rangeId).threats;
  return raw
    .map((country) => ({
      ...country,
      count: Math.round((country.count / rawTotal) * attributed),
      blocked: Math.round((country.blocked / rawTotal) * attributed),
    }))
    .sort((a, b) => b.count - a.count);
}

function pointLabel(date, rangeId) {
  if (rangeId === '24h') return `${pad(date.getHours())}:00`;
  if (rangeId === '7d')
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${pad(date.getHours())}:00`;
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export function getAttackSeries(rangeId) {
  const range = RANGE_MAP[rangeId] ?? RANGE_MAP['30d'];
  const rand = mulberry32(rangeId === '24h' ? 99 : rangeId === '7d' ? 303 : rangeId === '90d' ? 707 : 515);
  const perPoint = rangeId === '24h' ? 1 : rangeId === '7d' ? 2.1 : rangeId === '30d' ? 2.9 : 8.8;
  return Array.from({ length: range.points }, (_, i) => {
    const date = new Date(NOW - (range.points - 1 - i) * range.step);
    const base = 165 * perPoint;
    const wave = Math.sin(i / 2.6) * 34 + Math.cos(i / 4.1) * 22;
    const attacks = Math.max(24, Math.round(base + wave + rand() * 72 * perPoint));
    const blocked = Math.round(attacks * (0.66 + rand() * 0.16));
    const detected = Math.round(attacks * (0.83 + rand() * 0.1));
    return {
      label: pointLabel(date, rangeId),
      iso: date.toISOString(),
      attacks,
      blocked,
      detected,
      allowed: Math.round(attacks * (0.05 + rand() * 0.08)),
    };
  });
}

export function getTrafficSeries(rangeId) {
  const range = RANGE_MAP[rangeId] ?? RANGE_MAP['30d'];
  const rand = mulberry32(1802);
  const base = rangeId === '24h' ? 1850 : rangeId === '7d' ? 11500 : rangeId === '30d' ? 42000 : 120000;
  return Array.from({ length: range.points }, (_, i) => {
    const date = new Date(NOW - (range.points - 1 - i) * range.step);
    const requests = Math.round(base * (0.82 + rand() * 0.3) + Math.sin(i / 3) * base * 0.09);
    const blocked = Math.round(requests * (0.014 + rand() * 0.012));
    const threats = Math.round(requests * (0.012 + rand() * 0.011));
    return {
      label: pointLabel(date, rangeId),
      requests,
      allowed: requests - blocked,
      blocked,
      threats,
    };
  });
}

export function getCategoryCounts(rangeId = '30d') {
  const range = RANGE_MAP[rangeId] ?? RANGE_MAP['30d'];
  const rand = mulberry32(6201);
  const base = { sqli: 742, xss: 938, brute: 1104, rate: 688, traversal: 462, cmdi: 318 };
  const raw = ATTACK_TYPES.map((type) => ({
    ...type,
    count: Math.round(base[type.id] * range.scale * (0.9 + rand() * 0.2)),
    blocked: Math.round(base[type.id] * range.scale * (0.72 + rand() * 0.2)),
  }));
  const rawTotal = raw.reduce((sum, type) => sum + type.count, 0) || 1;
  const attributed = getAnalyticsMetrics(rangeId).threats;
  return raw
    .map((type) => ({
      ...type,
      count: Math.round((type.count / rawTotal) * attributed),
      blocked: Math.round((type.blocked / rawTotal) * attributed),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getSeverityDistribution(rangeId = '30d') {
  const range = RANGE_MAP[rangeId] ?? RANGE_MAP['30d'];
  return {
    Critical: Math.round(428 * range.scale),
    High: Math.round(1240 * range.scale),
    Medium: Math.round(2210 * range.scale),
    Low: Math.round(1350 * range.scale),
  };
}

export const SECURITY_POSTURE = [
  { dimension: 'Authentication', score: 88 },
  { dimension: 'Validation', score: 94 },
  { dimension: 'Injection', score: 91 },
  { dimension: 'Rate limit', score: 86 },
  { dimension: 'Sessions', score: 93 },
];

export const PERFORMANCE_INDICATORS = [
  {
    id: 'accuracy',
    label: 'Detection Accuracy',
    value: 99.2,
    status: 'healthy',
    note: 'True positives across 30-day window',
  },
  {
    id: 'blocking',
    label: 'Blocking Efficiency',
    value: 97.8,
    status: 'healthy',
    note: 'Malicious requests stopped at the edge',
  },
  {
    id: 'availability',
    label: 'System Availability',
    value: 99.98,
    status: 'healthy',
    note: 'Protection uptime, trailing 30 days',
  },
  {
    id: 'response',
    label: 'Threat Response',
    value: 94.6,
    status: 'caution',
    note: 'Median containment under 2 minutes',
  },
];

export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Critical: command injection blocked',
    body: 'WAF-9482 stopped an RCE attempt against /api/v1/admin/config from 141.98.10.62.',
    time: new Date(NOW - 4 * 60 * 1000).toISOString(),
    severity: 'Critical',
    read: false,
    to: '/admin/events',
  },
  {
    id: 'n2',
    title: 'New threat feed correlation',
    body: 'CVE-2026-4182 exploit attempts are now tracked for all internet-facing endpoints.',
    time: new Date(NOW - 47 * 60 * 1000).toISOString(),
    severity: 'High',
    read: false,
    to: '/admin/intelligence',
  },
  {
    id: 'n3',
    title: 'Blocked request volume up 11.6%',
    body: 'Blocked traffic rose against the prior 30-day period, led by brute-force attempts.',
    time: new Date(NOW - 2.4 * HOUR).toISOString(),
    severity: 'Medium',
    read: false,
    to: '/admin/blocked',
  },
  {
    id: 'n4',
    title: 'Weekly security report ready',
    body: 'Detection performance and attack distribution reports were regenerated.',
    time: new Date(NOW - 7 * HOUR).toISOString(),
    severity: 'Low',
    read: true,
    to: '/admin/reports',
  },
  {
    id: 'n5',
    title: 'Analyst note added to EVT-48210',
    body: 'M. Okafor escalated the incident to the on-call response pod.',
    time: new Date(NOW - 26 * HOUR).toISOString(),
    severity: 'Medium',
    read: true,
    to: '/admin/events',
  },
];

export const INTEL_FEED = [
  {
    id: 'CVE-2026-4182',
    title: 'Apache HTTP Server path traversal under active exploitation',
    severity: 'Critical',
    published: new Date(NOW - 2 * HOUR).toISOString(),
    source: 'Aegis Research',
    actor: 'Silent Current',
    affected: 'Apache 2.4.x < 2.4.63',
    status: 'Actively exploited',
    summary:
      'A path normalization flaw allows unauthenticated attackers to read files outside the document root. Exploit attempts are being observed against file download endpoints.',
    indicators: ['185.220.101.4', 'update-service[.]io', 'e3b0c442...b855'],
  },
  {
    id: 'CVE-2026-3391',
    title: 'Authentication bypass in identity provider federation',
    severity: 'High',
    published: new Date(NOW - 9 * HOUR).toISOString(),
    source: 'Partner feed',
    actor: 'UNC-7741',
    affected: 'SAML federation module 3.2–3.4',
    status: 'Exploit available',
    summary:
      'Improper signature validation permits forged assertions under specific XML canonicalization conditions. Identity logs should be reviewed for anomalous sessions.',
    indicators: ['45.155.205.233', 'login-sso[.]cloud'],
  },
  {
    id: 'CAMP-2291',
    title: 'Credential stuffing campaign targeting SaaS portals',
    severity: 'High',
    published: new Date(NOW - 22 * HOUR).toISOString(),
    source: 'Aegis Research',
    actor: 'Scarlet Tide',
    affected: 'SaaS authentication portals',
    status: 'Ongoing',
    summary:
      'Distributed low-and-slow authentication attempts are rotating through residential proxies. Detection currently relies on behavioral baselines rather than signatures.',
    indicators: ['91.92.109.7', '103.145.13.9'],
  },
  {
    id: 'CVE-2026-2207',
    title: 'Deserialization flaw in reporting worker',
    severity: 'Medium',
    published: new Date(NOW - 2 * DAY).toISOString(),
    source: 'Vendor advisory',
    actor: 'Unattributed',
    affected: 'reporting-worker 1.8.x',
    status: 'Patch available',
    summary:
      'Untrusted job payloads are deserialized without type restrictions. No exploitation observed in production traffic; patching is recommended this cycle.',
    indicators: ['194.26.29.156'],
  },
  {
    id: 'CAMP-2274',
    title: 'Botnet infrastructure rotation across Eastern Europe',
    severity: 'Medium',
    published: new Date(NOW - 4 * DAY).toISOString(),
    source: 'Partner feed',
    actor: 'Storm Relay',
    affected: 'Public APIs',
    status: 'Monitoring',
    summary:
      'A resilient proxy network shifted to new address space. Request rates remain within adaptive thresholds but origin diversity has increased.',
    indicators: ['5.188.206.14', '89.163.242.19'],
  },
  {
    id: 'CVE-2026-1980',
    title: 'GraphQL introspection abuse enabling schema discovery',
    severity: 'Low',
    published: new Date(NOW - 6 * DAY).toISOString(),
    source: 'Aegis Research',
    actor: 'Unattributed',
    affected: 'GraphQL gateway',
    status: 'Mitigated',
    summary:
      'Automated schema discovery probes were observed. Introspection has been disabled for unauthenticated requests with no observed impact.',
    indicators: ['64.62.197.30'],
  },
];

export const IOCS = [
  { id: 'ioc-1', type: 'IPv4', value: '185.220.101.4', confidence: 96, firstSeen: new Date(NOW - 3 * DAY).toISOString(), source: 'Aegis Research', tags: ['C2', 'Tor exit'], hits: 47 },
  { id: 'ioc-2', type: 'IPv4', value: '45.155.205.233', confidence: 91, firstSeen: new Date(NOW - 5 * DAY).toISOString(), source: 'Partner feed', tags: ['Credential stuffing'], hits: 33 },
  { id: 'ioc-3', type: 'Domain', value: 'update-service[.]io', confidence: 88, firstSeen: new Date(NOW - 2 * DAY).toISOString(), source: 'Aegis Research', tags: ['Payload host'], hits: 12 },
  { id: 'ioc-4', type: 'SHA-256', value: 'e3b0c44298fc1c14...85', confidence: 84, firstSeen: new Date(NOW - 8 * DAY).toISOString(), source: 'Sandbox', tags: ['Webshell'], hits: 3 },
  { id: 'ioc-5', type: 'IPv4', value: '103.145.13.9', confidence: 79, firstSeen: new Date(NOW - 11 * DAY).toISOString(), source: 'Partner feed', tags: ['Brute force'], hits: 26 },
  { id: 'ioc-6', type: 'Domain', value: 'login-sso[.]cloud', confidence: 93, firstSeen: new Date(NOW - 1 * DAY).toISOString(), source: 'Aegis Research', tags: ['Phishing'], hits: 18 },
  { id: 'ioc-7', type: 'IPv4', value: '141.98.10.62', confidence: 90, firstSeen: new Date(NOW - 6 * HOUR).toISOString(), source: 'Detection', tags: ['RCE attempt'], hits: 9 },
  { id: 'ioc-8', type: 'Domain', value: 'cdn-metrics[.]top', confidence: 66, firstSeen: new Date(NOW - 14 * DAY).toISOString(), source: 'DNS telemetry', tags: ['Beacon'], hits: 5 },
  { id: 'ioc-9', type: 'IPv4', value: '91.92.109.7', confidence: 81, firstSeen: new Date(NOW - 9 * DAY).toISOString(), source: 'Partner feed', tags: ['Proxy'], hits: 21 },
  { id: 'ioc-10', type: 'SHA-256', value: '9f2c41d07a5e13b8...c1', confidence: 74, firstSeen: new Date(NOW - 21 * DAY).toISOString(), source: 'Sandbox', tags: ['Loader'], hits: 2 },
];

export const SESSIONS = [
  {
    id: 's1',
    device: 'MacBook Pro · Chrome 131',
    location: 'London, United Kingdom',
    ip: '82.14.60.184',
    lastActive: new Date(NOW - 12 * 60 * 1000).toISOString(),
    current: true,
  },
  {
    id: 's2',
    device: 'Windows 11 · Edge 131',
    location: 'Manchester, United Kingdom',
    ip: '81.140.22.90',
    lastActive: new Date(NOW - 3 * HOUR).toISOString(),
    current: false,
  },
  {
    id: 's3',
    device: 'iPhone 15 · Safari',
    location: 'London, United Kingdom',
    ip: '82.14.61.20',
    lastActive: new Date(NOW - 2 * DAY).toISOString(),
    current: false,
  },
];

export const TEAM_MEMBERS = [
  { id: 'u1', name: 'Avery Lane', email: 'avery.lane@aegis.example', role: 'Admin', status: 'Active', lastActive: 'Online' },
  { id: 'u2', name: 'Mara Okafor', email: 'mara.okafor@aegis.example', role: 'Analyst', status: 'Active', lastActive: '12m ago' },
  { id: 'u3', name: 'Daniel Cho', email: 'daniel.cho@aegis.example', role: 'Analyst', status: 'Active', lastActive: '2h ago' },
  { id: 'u4', name: 'Priya Raman', email: 'priya.raman@aegis.example', role: 'Viewer', status: 'Invited', lastActive: '—' },
];

export function getRecentEvents(limit = 8, rangeId = '30d') {
  const days = rangeId === '24h' ? 1 : rangeId === '7d' ? 7 : rangeId === '90d' ? 90 : 30;
  const cutoff = NOW - days * DAY;
  return EVENTS.filter((event) => new Date(event.timestamp).getTime() >= cutoff).slice(0, limit);
}

export function getAttackSummary() {
  const now = NOW;
  const recent = EVENTS.filter((e) => now - new Date(e.timestamp).getTime() <= 30 * DAY);
  const prior = EVENTS.filter((e) => {
    const age = now - new Date(e.timestamp).getTime();
    return age > 30 * DAY && age <= 60 * DAY;
  });
  const countBy = (list, id) => list.filter((e) => e.attackType === id).length;

  return ATTACK_TYPES.map((type) => {
    const all = EVENTS.filter((e) => e.attackType === type.id);
    const recentCount = countBy(recent, type.id);
    const priorCount = Math.max(1, countBy(prior, type.id));
    const trend = ((recentCount - priorCount) / priorCount) * 100;
    const endpointCounts = {};
    all.forEach((e) => {
      endpointCounts[e.endpoint] = (endpointCounts[e.endpoint] ?? 0) + 1;
    });
    const topEndpoint =
      Object.entries(endpointCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? type.endpoint;
    const severityCounts = SEVERITIES.map((sev) => ({
      severity: sev,
      count: all.filter((e) => e.severity === sev).length,
    }));
    return {
      ...type,
      occurrences: all.length,
      topEndpoint,
      latest: all[0]?.timestamp ?? new Date(NOW - DAY * 30).toISOString(),
      trend,
      severityCounts,
      critical: severityCounts.find((s) => s.severity === 'Critical')?.count ?? 0,
    };
  }).sort((a, b) => b.occurrences - a.occurrences);
}

export function getThreatOrigins(rangeId = '30d') {
  return getGeoOrigins(rangeId).slice(0, 5);
}

export const REPORT_CATALOG = [
  {
    id: 'overview',
    name: 'Security overview report',
    description: 'Executive summary of detections, containment outcomes and open risk across the selected window.',
    cadence: 'Weekly · Monday 06:00',
    format: 'CSV',
    owner: 'Avery Lane',
    includes: ['KPI totals', 'Severity mix', 'Open investigations'],
  },
  {
    id: 'attacks',
    name: 'Attack distribution report',
    description: 'Attack family volume, most targeted endpoints and latest occurrence per category.',
    cadence: 'Weekly · Monday 06:00',
    format: 'CSV',
    owner: 'Mara Okafor',
    includes: ['Attack categories', 'Occurrences by severity', 'Top endpoints'],
  },
  {
    id: 'blocked',
    name: 'Blocked requests report',
    description: 'Every request denied at the edge with signature, blocking layer and reason.',
    cadence: 'On demand',
    format: 'CSV',
    owner: 'Daniel Cho',
    includes: ['Blocked request log', 'Blocking reasons', 'Source geography'],
  },
  {
    id: 'performance',
    name: 'Detection performance report',
    description: 'Detection accuracy, false-positive and false-negative rates, and latency for the period.',
    cadence: 'Monthly · 1st 07:00',
    format: 'CSV',
    owner: 'Avery Lane',
    includes: ['Accuracy metrics', 'Error rates', 'Detection latency'],
  },
];

export function getAnalyticsMetrics(rangeId = '30d') {
  const series = getTrafficSeries(rangeId);
  const requests = series.reduce((sum, point) => sum + point.requests, 0);
  const allowed = series.reduce((sum, point) => sum + point.allowed, 0);
  const blocked = series.reduce((sum, point) => sum + point.blocked, 0);
  const threats = series.reduce((sum, point) => sum + point.threats, 0);
  const seed = rangeId === '24h' ? 0.2 : rangeId === '7d' ? 0.6 : rangeId === '90d' ? 2.1 : 1;
  return {
    requests,
    allowed,
    blocked,
    threats,
    blockRate: requests ? (blocked / requests) * 100 : 0,
    threatRate: requests ? (threats / requests) * 100 : 0,
    detectionAccuracy: 99.2,
    falsePositiveRate: Number((0.58 * (0.8 + seed * 0.18)).toFixed(2)),
    falseNegativeRate: Number((0.74 * (0.85 + seed * 0.16)).toFixed(2)),
    detectionLatency: Number((7.8 + seed * 1.4).toFixed(1)),
    series,
  };
}

export const LAST_SYNC = new Date(NOW - 90 * 1000).toISOString();
