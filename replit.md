# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **ML**: Python 3.11, scikit-learn, pandas, numpy, joblib
- **Frontend**: React + Vite + Recharts + Framer Motion + Tailwind CSS v4

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── weather-dashboard/  # React weather ML dashboard (previewPath: /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   ├── src/                # Individual .ts scripts
│   └── ml/                 # Python ML pipeline
│       ├── train_model.py  # Full ML training pipeline (EDA + RF + GridSearchCV)
│       ├── predict.py      # Prediction helper (reads stdin JSON, outputs prediction)
│       └── model/          # Saved model artifacts
│           ├── model.pkl   # Trained Random Forest model
│           ├── scaler.pkl  # StandardScaler
│           ├── label_encoder.pkl  # LabelEncoder
│           ├── metadata.json     # Model metadata
│           └── stats.json        # Pre-computed EDA stats + model metrics
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Weather ML Project

### ML Pipeline (`scripts/ml/`)

- **Dataset**: 8,784 hourly weather records from `weatherHistory.csv`
- **Features**: Temp_C, Dew Point Temp_C, Rel Hum_%, Wind Speed_km/h, Visibility_km, Press_kPa + engineered: Hour, Month, DayOfWeek, Temp_DewPoint_Diff
- **Target**: Weather condition classified into 8 groups: Snow, Rain, Fog, Clear, Cloudy, Freezing Precip, Haze, Other
- **Model**: Random Forest Classifier with GridSearchCV (best: n_estimators=200, max_depth=None)
- **Accuracy**: ~77.58% test accuracy
- **Run training**: `python3 scripts/ml/train_model.py`

### API Endpoints (`artifacts/api-server/src/routes/ml.ts`)

- `GET /api/eda-stats` — Returns pre-computed EDA statistics and model metrics from stats.json
- `POST /api/predict` — Accepts sensor readings, spawns `python3 scripts/ml/predict.py` subprocess, returns predicted weather with probabilities

### Dashboard (`artifacts/weather-dashboard/`)

React + Vite dark-mode multi-page application with full navigation:
- **Home** (`/`) — Hero section, quick stats cards, platform feature highlights
- **EDA Explorer** (`/eda`) — Dataset stats cards, weather class distribution bar chart, monthly temp line chart, temp vs humidity scatter plot, correlation heatmap
- **Analytics** (`/analytics`) — Hottest/coldest month, avg humidity/wind stats, weather type frequency pie chart, monthly temp/humidity bar charts, temperature trend area chart, wind/visibility line chart, pressure trend
- **Live Prediction** (`/predict`) — 6 sliders for sensor inputs, predict button, animated result display with confidence and class probabilities
- **Model Performance** (`/performance`) — Test/CV accuracy hero card, top features bar chart, confusion matrix grid, classification report table
- **About** (`/about`) — Project description, dataset details, ML pipeline steps, tech stack badges, future scope
- **Footer** — Social links (Instagram/Facebook/Twitter @hlofaam) on every page
- **Navbar** — Persistent top navigation with mobile hamburger menu

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health`; `src/routes/ml.ts` exposes `GET /eda-stats` and `POST /predict`
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/weather-dashboard` (`@workspace/weather-dashboard`)

React + Vite dark-mode dashboard for weather ML project. Uses `@workspace/api-client-react` for API hooks.

- Entry: `src/App.tsx` — React Query provider + wouter routing + Navbar + Footer
- Pages: `src/pages/HomePage.tsx`, `EdaPage.tsx`, `AnalyticsPage.tsx`, `PredictPage.tsx`, `PerformancePage.tsx`, `AboutPage.tsx`
- Views: `src/components/views/EdaView.tsx`, `PredictView.tsx`, `PerformanceView.tsx`
- Layout: `src/components/Navbar.tsx`, `src/components/Footer.tsx`
- Data hooks: `src/hooks/use-weather-data.ts`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).
Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`.
