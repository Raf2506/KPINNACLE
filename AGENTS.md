<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KPI Analyzer — project memory for Claude Code

## What this is
OJH intern assessment: employee KPI dashboard with AI features. Rubric priorities:
metric correctness, prompt design, defensive parsing, clean UX, incremental commits.

## Stack
Next.js 15 App Router, TypeScript strict, Tailwind + shadcn/ui, Prisma + SQLite,
Zod, Recharts, TanStack Query, Vitest.

## Non-negotiable rules
- LLM API key is server-only (Route Handlers). Never NEXT_PUBLIC_, never in client bundles, never committed.
- All metrics come from lib/metrics.ts pure functions. UI never re-implements formulas.
- Every LLM response passes through a Zod normalizer: clamp numbers, default arrays/strings, drop unknown keys. UI must render partial data without crashing.
- AI-derived values always show an "AI" badge component, distinct from computed metrics.
- Small commits with conventional messages after each working unit. Never one giant commit.
- Run `npm test` before declaring any phase done.

## Metrics (source of truth)
achievement% = clamp(current/target × 100, 0, 100); target ≤ 0 → 0
overallScore = Σ(weight × achievement%) ÷ Σ(weight); Σweight = 0 → 0
onTrack% = on_track ÷ total; atRisk = count(at_risk ∪ behind)

## Data model

```prisma
model ReviewCycle {
  id        String  @id @default(cuid())
  name      String            // "Q3 2026 (Jul–Sep)"
  startDate DateTime
  endDate   DateTime
  isActive  Boolean @default(true)
  kpis      Kpi[]
}

model Employee {
  id         String @id @default(cuid())
  name       String
  role       String            // "Sales Executive"
  department String            // "Sales"
  kpis       Kpi[]
}

model Kpi {
  id          String  @id @default(cuid())
  title       String
  description String
  category    Category          // SALES | OPERATIONS | COMPLIANCE | DEVELOPMENT
  weight      Float             // % — per-employee weights should sum ~100
  target      Float
  current     Float
  unit        String            // "RM" | "%" | "count"
  status      Status            // NOT_STARTED | ON_TRACK | AT_RISK | BEHIND
  aiGenerated Boolean @default(false)   // powers the "AI" badge on applied suggestions
  employee    Employee    @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  employeeId  String
  cycle       ReviewCycle @relation(fields: [cycleId], references: [id])
  cycleId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## AI output schemas
Not implemented yet — this pass (frontend + data layer) intentionally stops before
the AI features. When they're built, follow the plan doc's §5 schemas:
KPI Generator (4–6 KPIs, weights renormalized to 100), Risk Detection (riskScore +
ranked risk cards with kpiId hallucination guard), Executive Insights (highlights +
recommendations).

## Current phase
Frontend-first pass: Prisma schema + seed, metrics engine + tests, API route handlers,
and 3 pages (`/` dashboard, `/employees`, `/kpis`). AI features and README are later phases.
