# KPINNACLE — KPI Analyzer

A KPI performance dashboard built for the OJH internship assessment: track employee
KPIs across review cycles, see computed performance metrics, and use three AI features
(powered by Google Gemini) to spot risk, draft new KPIs, and summarize a cycle for
leadership.

**Live:** [kpinnacle.vercel.app](https://kpinnacle.vercel.app)

## What it does

- **Dashboard** — overall weighted score, on-track %, at-risk count, status/category
  charts, a computed "Needs attention" list, and cycle-over-cycle trend deltas.
- **Employees** — per-employee KPI breakdown and a read-only detail page.
- **KPIs** — every KPI across the company, filterable and sortable, with CSV export.
- **AI Risk Detection** — analyzes the current cycle's KPIs and flags which ones are
  most likely to slip, with a reason and a recommended action for each.
- **AI KPI Generator** — given an employee and optional context, drafts 4–6 KPIs with
  weights, targets, and a rationale, that a manager can review and apply.
- **AI Executive Summary** — a plain-language overview of the cycle plus severity-tagged
  highlights and recommendations, written for a non-technical reader.

Every AI-derived value is marked with a visible **AI** badge and is never mixed into the
computed metrics — those two data sources are kept deliberately separate.

## Tech stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS + shadcn/ui (Base UI) ·
Prisma + PostgreSQL (Neon) · Zod · TanStack Query · Recharts · Vitest · Google Gemini
(`@google/genai`)

## Running it locally

```bash
npm install
npm run seed   # populates two review cycles, 6 employees, 24 KPIs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a `.env` file (copy `.env.example`) with:

```bash
DATABASE_URL="postgresql://..."           # pooled connection
DATABASE_URL_UNPOOLED="postgresql://..."  # direct connection, used for migrations
LLM_PROVIDER="gemini"
LLM_API_KEY="your-gemini-api-key"         # from aistudio.google.com — optional
```

The app works fully without `LLM_API_KEY` — the three AI panels just show a
"not configured" state with a Retry button instead of crashing. Everything else
(dashboard, employees, KPIs, CRUD) has no AI dependency at all.

```bash
npm test    # 29 tests: metrics engine, insights, LLM plumbing
npm run build
```

## How the metrics work

All formulas live in one place, [lib/metrics.ts](lib/metrics.ts), as pure functions with
no framework or database imports — every page and API route reads from here instead of
recalculating anything itself.

| Metric | Formula |
| --- | --- |
| Achievement % | `clamp(current / target × 100, 0, 100)`; a target ≤ 0 always scores 0 |
| Overall score | `Σ(weight × achievement%) / Σ(weight)`; 0 if weights sum to 0 |
| On-track % | `count(status = ON_TRACK) / total` |
| At-risk count | `count(status ∈ {AT_RISK, BEHIND})` |

## How the AI features are built

Each feature follows the same shape, in [lib/llm.ts](lib/llm.ts):

1. **Prompt** ([lib/ai/prompts.ts](lib/ai/prompts.ts)) — every system prompt explicitly
   tells the model to ground its output only in the data it's given and never invent
   names, ids, or numbers.
2. **Structured output** — Gemini is asked for JSON directly (`responseMimeType`), guided
   by a JSON Schema generated from the feature's own Zod schema, so the prompt and the
   validator can never drift apart.
3. **Defensive parsing** ([lib/ai/normalize.ts](lib/ai/normalize.ts),
   [lib/ai/schemas.ts](lib/ai/schemas.ts)) — every response is re-validated with Zod:
   numbers get clamped into valid ranges, missing strings/arrays get safe defaults, and
   unknown keys are dropped. A malformed or truncated model response degrades to a clear
   error state instead of a crash.
4. **Hallucination guard** — Risk Detection's `kpiId` references are checked against the
   real KPIs sent to the model, and any id that doesn't match a real record is dropped.
5. **Weight renormalization** — the KPI Generator's suggested weights are rescaled so
   they sum to exactly 100, regardless of what the model actually returned.
6. **Caching** — Risk Detection and Executive Summary results are cached per review cycle
   in the database (`AiInsight` model), so the dashboard shows "Generated X min ago"
   instead of re-calling the model on every page load; a Regenerate button forces a
   fresh call.

## Project structure

```
app/
  page.tsx                  # Dashboard
  employees/                # Employee list + detail page
  kpis/                     # KPI table page
  api/
    metrics/, employees/, kpis/, cycles/   # CRUD + computed metrics
    ai/risk/, ai/generate-kpis/, ai/insights/   # AI routes
lib/
  metrics.ts                # Pure metrics engine (+ metrics.test.ts)
  insights.ts                # Computed (non-AI) highlights
  llm.ts                     # Provider-agnostic LLM call + defensive parsing
  ai/                        # Prompts, Zod schemas, normalizers, error messages
  validation.ts               # Zod schemas for form input
components/                  # UI components (shadcn/ui-based)
prisma/                      # Schema + seed data
```

## Deployment

Vercel (hosting) + Neon (serverless Postgres). Pushing to `main` auto-deploys; the
`LLM_API_KEY` and `LLM_PROVIDER` environment variables are configured directly in the
Vercel project, never committed to the repo.
