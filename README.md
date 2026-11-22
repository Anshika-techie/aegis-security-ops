# Aegis Security Operations

A dark-themed security operations (SOC) front-end for threat detection, monitoring and reporting. Aegis presents live-feeling KPIs, attack telemetry, geolocated threat origins, block logs and audit-ready exports across a responsive analyst workspace.

> **Demo project.** There is no backend. All figures, events and credentials are deterministic mock data generated in the browser. Authentication is client-side only and is **not** a security boundary.

---

## Contents

- [About the app](#about-the-app)
- [Roles and demo accounts](#roles-and-demo-accounts)
- [Feature tour](#feature-tour)
- [Frontend specifications](#frontend-specifications)
  - [Tech stack](#tech-stack)
  - [Routing map](#routing-map)
  - [State and persistence](#state-and-persistence)
  - [Data layer](#data-layer)
  - [Design system](#design-system)
  - [Charts and visualization](#charts-and-visualization)
  - [CSV export](#csv-export)
  - [Responsive and accessibility](#responsive-and-accessibility)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Configuration](#configuration)
- [Known limitations](#known-limitations)

---

## About the app

Aegis models the working surface of a security operations team:

- **Overview** — KPI cards (traffic, threats, blocks, active events, system health), detection/block trends, severity mix, protection posture radar, a recent-event queue with per-session review toggles, and detection performance metrics.
- **Monitoring** — searchable/paginated tables of security events, detected attacks and blocked requests, each filterable by the global date range.
- **Intelligence** — curated threat advisories, IOC matches and attack analytics (volume, categorisation, origin geography).
- **Operations** — reporting catalogue with CSV generation plus workspace settings and account management.

Every view derives from one central mock dataset, so numbers stay consistent across pages for a given time window.

## Roles and demo accounts

Authentication is simulated against seeded accounts and users registered in the browser. Two roles exist:

| Role | Access |
| --- | --- |
| `admin` | Full workspace plus the admin-only **Operations overview** (`/admin`) with elevated views of every monitoring page. |
| `analyst` | Standard workspace (dashboard, monitoring, intelligence, reports, settings, profile). |

**Demo credentials** (password for both: `demo1234`):

| Email | Role |
| --- | --- |
| `admin@aegis.example` | Administrator |
| `analyst@aegis.example` | Security analyst |

New registrations are created as `analyst` accounts and persisted in `localStorage`.

## Feature tour

- **Login / Register** — single-page auth with inline validation and seeded demo accounts.
- **Dashboard** (`/dashboard`) — greeting, last-sync indicator, KPI grid with directional deltas, threat area chart, severity donut, posture radar, recent events, performance rings, and summary cards.
- **Security events** (`/events`) — sortable, searchable, paginated event log with severity/status badges, detail overlay and CSV export.
- **Detected attacks** (`/attacks`) — attack-family cards showing volume, severity profile, targeted endpoints, MITRE technique and current mitigation.
- **Blocked requests** (`/blocked`) — denied traffic with signature rule, blocking layer, reason and response code.
- **Threat intelligence** (`/intelligence`) — advisory feed, IOC watchlist and correlated matches.
- **Attack analytics** (`/analytics`) — traffic vs. blocked series, category breakdown and a geolocated origin world map.
- **Reports** (`/reports`) — report catalogue with on-demand CSV generation and schedule metadata.
- **Settings** (`/settings`) — notification routing, detection behaviour and workspace defaults (admin-flavoured labels for admins).
- **Profile** (`/profile`) — identity, role, department, contact details and editable profile fields.
- **Admin overview** (`/admin`, admin only) — organisation-wide operations view; analysts are redirected to `/dashboard`.
- **Global shell** — collapsible sidebar with mobile scrim; topbar with date-range selector, global search (`/` shortcut) across pages and events, notification tray with unread counts, and an account menu; plus toast feedback.

## Frontend specifications

### Tech stack

| Concern | Choice |
| --- | --- |
| UI framework | React 18 (`react`, `react-dom`) |
| Build tool | Vite 5 with `@vitejs/plugin-react` |
| Routing | `react-router-dom` v6 (client-side `BrowserRouter`) |
| Charts | `recharts` for area/donut/radar; custom SVG for rings and sparklines |
| Maps | `d3-geo` + `topojson-client` with `world-atlas` geometry |
| Icons | `lucide-react` |
| Styling | Hand-written CSS (no CSS framework): design tokens + component styles |
| Fonts | Inter (UI) and IBM Plex Mono (identifiers), loaded from Google Fonts |
| Language | JavaScript (JSX, ESM) — no TypeScript |

No state library, CSS framework, component library, test runner or linter is included.

### Routing map

| Path | Component | Guard |
| --- | --- | --- |
| `/` | `Login` | Public |
| `/register` | `Register` | Public |
| `/dashboard` | `Dashboard` | Authenticated |
| `/events` | `Events` | Authenticated |
| `/attacks` | `Attacks` | Authenticated |
| `/blocked` | `Blocked` | Authenticated |
| `/intelligence` | `Intelligence` | Authenticated |
| `/analytics` | `Analytics` | Authenticated |
| `/reports` | `Reports` | Authenticated |
| `/settings` | `Settings` | Authenticated |
| `/profile` | `Profile` | Authenticated |
| `/admin` | `AdminOverview` | Authenticated **and** `admin` |
| `/admin/events`, `/admin/attacks`, `/admin/blocked`, `/admin/intelligence`, `/admin/analytics`, `/admin/reports`, `/admin/settings` | Reuses the standard pages | Authenticated **and** `admin` |
| `*` | `NotFound` | Public |

Authenticated routes render inside `AppLayout` (sidebar + topbar). `ProtectedRoute` redirects unauthenticated visitors to `/` and non-admins away from admin routes. Guards are UX only — there is no server enforcement.

### State and persistence

A single React context (`AppContext`) owns app-wide state; pages consume it via `useApp()`.

- Session user, registered users and UI preferences are persisted to `localStorage` under `aegis.session`, `aegis.users` and `aegis.prefs`.
- Global date range (`24h` · `7d` · `30d` · `90d`, default `30d`) is shared by every page.
- Also in context: sidebar collapse state, mobile nav state, notification read state, toast queue (max 3, auto-dismiss after 4.2s), and per-session event review flags.
- Demo accounts are compiled in; registered accounts are appended to the stored user list. Passwords are stored in plain text in `localStorage` (demo only).

### Data layer

`src/data/mock.js` is the single source of truth — a deterministic, seeded dataset (fixed PRNG seeds and a fixed "now"), so charts and tables are stable between reloads.

| Fixture | Size / values |
| --- | --- |
| Security events | 280 generated records across the full 90-day window |
| Blocked requests | 190 records |
| Attack families | 6 — SQLi, XSS, brute force, path traversal, abnormal rate, command injection |
| Severity levels | Critical, High, Medium, Low |
| Statuses | Detected, Blocked, Investigating, Resolved |
| Endpoints | 10 protected API/app routes |
| Origin countries | 20 with coordinates and weights |
| Time ranges | 24h, 7d, 30d, 90d |

Derived selectors scale aggregates per range: `getKpis`, `getAttackSeries`, `getTrafficSeries`, `getCategoryCounts`, `getSeverityDistribution`, `getGeoOrigins`, `getRecentEvents`, `getAttackSummary`, `getThreatOrigins`, `getAnalyticsMetrics`. Static content includes the posture radar, performance indicators, notifications, intelligence feed, IOCs, sessions, team members and report catalogue.

### Design system

- **Tokens** (`src/styles/tokens.css`): dark-only palette (`--bg: #10151b`, surfaces, borders, text tiers), semantic accents (teal `#55b9a6`, blue `#7199c7`, amber `#e5ae57`, red `#e47777`), radii, shadows, easing/duration, layout metrics (`--sidebar-w: 252px`, `--sidebar-w-collapsed: 78px`, `--topbar-h: 64px`, `--page-max: 1680px`).
- **Styles** (`src/styles/app.css`): layout shell, cards, tables, forms, overlays, toasts, badges and page-specific rules, including breakpoints and a collapsible/mobile sidebar.
- **Primitives** (`src/components/ui/Primitives.jsx`): `Button`, `Badge`, `SeverityBadge`, `StatusBadge`, `StatCard`, `PageHeader`, `ChartCard`, etc.
- **Overlays** (`src/components/ui/Overlays.jsx`): modals, drawers, toasts, confirmation surfaces.
- **DataTable** (`src/components/ui/DataTable.jsx`): shared sortable/searchable/paginated table used by monitoring pages.

### Charts and visualization

- `Charts.jsx` — `Ring` (SVG progress ring) and small chart helpers.
- `Viz.jsx` — `ThreatAreaChart`, `SeverityDonut`, `PostureRadar`, and related Recharts wrappers.
- `WorldMap.jsx` — d3-geo projection with world-atlas topojson, plotting weighted origin markers.
- `src/lib/colors.js` — central colour map for charts and severity (`COLORS`, `SEVERITY_COLORS`, `SERIES_COLORS`).

### CSV export

`src/lib/csv.js` serialises rows client-side and triggers a browser download (no server round-trip). The Reports, Security events and Blocked requests pages use it to produce audit-friendly CSV files.

### Responsive and accessibility

- Responsive layout: sidebar collapses to icons on desktop and becomes an off-canvas drawer with a scrim on mobile; grids reflow from multi-column to single column.
- Semantic landmarks, `aria-label`s on icon-only controls, `sr-only` labels for select inputs, keyboard handlers on custom interactive elements, and visible focus styling through the token palette.
- Motion uses short, consistent easing/duration tokens; no animation-only information.

## Project structure

```
.
└── frontend/
    ├── index.html              # HTML shell, fonts, meta, theme colour
    ├── vite.config.js          # React plugin, port 5173, host 0.0.0.0
    ├── package.json
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── main.jsx            # React root; imports tokens + app styles
        ├── App.jsx             # Router and route guards
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── layout/         # AppLayout, Sidebar, Topbar
        │   └── ui/             # Primitives, Charts, Viz, DataTable, Overlays, WorldMap
        ├── context/AppContext.jsx   # Auth, session, prefs, notifications, toasts
        ├── data/mock.js        # Deterministic fixtures and selectors
        ├── lib/                # colors, csv, format, hooks
        ├── pages/              # 13 route components (incl. Login, Register, NotFound)
        └── styles/             # tokens.css, app.css
```

## Getting started

Requires **Node.js 18+** and npm.

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173> and sign in with a demo account (or register one).

## Available scripts

Run from `frontend/`:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173 (bound to `0.0.0.0`). |
| `npm run build` | Produce a production bundle in `frontend/dist/`. |
| `npm run preview` | Serve the built bundle locally. |

There is no `test` or `lint` script configured.

## Configuration

- **Dev server** — `vite.config.js` sets `port: 5173` and `host: '0.0.0.0'` (reachable from other devices on the network).
- **Environment variables** — none are used; there is no API base URL or secret to configure.
- **Theme** — colours, spacing and typography come from `src/styles/tokens.css`; the browser theme colour is set in `index.html` (`#10151B`).
- **Demo data** — adjust fixtures and seeds in `src/data/mock.js`; add or change seeded accounts in `src/context/AppContext.jsx` (`DEMO_ACCOUNTS`).

## Known limitations

- **No backend or API.** All data is generated in the browser; nothing is fetched or persisted server-side.
- **Auth is demonstrative.** Credentials live in `localStorage`, passwords are stored in plain text, and route guards can be bypassed through devtools.
- **Session-scoped review state.** "Reviewed" flags and notification read state reset on reload (only session/prefs/users persist).
- **Static time window.** The dataset is anchored to a fixed timestamp at load, so "last sync" and relative times do not advance across a long session.
- **No tests, linting or type checking** are configured.
- Scheduling shown in Reports is descriptive only — no jobs run.
