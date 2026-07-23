import Link from "next/link";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ListChecks,
  Printer,
  Receipt,
  Sparkles,
  StickyNote,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai-badge";

const STEPS = [
  {
    number: 1,
    icon: Calendar,
    title: "Start with a review cycle",
    body: "Everything in KPINNACLE belongs to a review cycle — a time period like \"Q3 2026 (Jul–Sep)\". The cycle switcher at the top of the Dashboard and Employees pages lets you jump between past and current cycles. Run `npm run seed` once to get sample data, or ask whoever manages your database to create a cycle for you.",
  },
  {
    number: 2,
    icon: Users,
    title: "Add your employees",
    body: "Go to the Employees page and add each person with their name, role, and department. You don't set any performance numbers here yet — this is just the roster.",
    action: { label: "Go to Employees", href: "/employees" },
  },
  {
    number: 3,
    icon: ListChecks,
    title: "Add KPIs for each employee",
    body: "Open the KPIs page and click \"Add KPI\". Each KPI needs a title, a category, a target, a starting current value, and a weight. See the field cheat sheet below — the weight field is the one beginners get wrong most often.",
    action: { label: "Go to KPIs", href: "/kpis" },
  },
  {
    number: 4,
    icon: CheckCircle2,
    title: "Keep KPIs updated as the cycle progresses",
    body: "As real performance numbers come in, edit each KPI's \"Current\" value and update its status (On track, At risk, Behind). Every other number on the Dashboard — achievement %, overall score, at-risk count — is calculated automatically from this, so keeping it current is the main ongoing task.",
  },
  {
    number: 5,
    icon: BarChart3,
    title: "Read the Dashboard",
    body: "The Dashboard shows the whole company at a glance: overall score, on-track %, at-risk KPIs, and per-category performance. Click any employee or KPI to drill in. Nothing here is editable — it's a read-only summary computed from the KPIs you've entered.",
    action: { label: "Go to Dashboard", href: "/" },
  },
  {
    number: 6,
    icon: Sparkles,
    title: "Use the AI features when you want a second opinion",
    body: "Three panels are powered by AI and always carry an AI badge so you can tell them apart from the numbers above: Risk Detection flags which KPIs are likely to slip, the KPI Generator drafts a starting set of KPIs for a new employee, and the Executive Summary writes a plain-language recap for leadership. All three are optional — the dashboard works fully without them.",
  },
  {
    number: 7,
    icon: Printer,
    title: "Print a report before a review meeting",
    body: "The \"Print report\" button on the Dashboard opens a clean, printable page combining the executive summary, key numbers, and the leaderboard — handy for bringing a physical or PDF copy into a meeting.",
    action: { label: "Open report", href: "/report" },
  },
];

const FIELD_GUIDE: { field: string; hint: string }[] = [
  { field: "Title & description", hint: "Keep the title short — it's what shows in tables and cards. Put the detail in the description." },
  { field: "Category", hint: "Sales, Operations, Compliance, or Development — used to group the category breakdown chart." },
  { field: "Target & current", hint: "Target is the goal; current is where the employee actually is right now. Achievement % is just current ÷ target." },
  { field: "Weight", hint: "How much this KPI counts toward the employee's overall score. A single employee's KPI weights should add up to 100% — the Dashboard's Highlights panel will warn you if they don't." },
  { field: "Status", hint: "Not started, On track, At risk, or Behind — set this yourself based on judgment, it isn't calculated automatically." },
  { field: "Notes", hint: "Optional free-text field for review context, e.g. \"Discussed with employee on 8/15, improvement plan agreed.\" Shown as a note icon in the KPI list." },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Getting started</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          How to use KPINNACLE
        </h1>
        <p className="text-sm text-muted-foreground">
          A short walkthrough for anyone using this dashboard for the first time — from setting
          up your first review cycle to reading what the AI features are telling you.
        </p>
      </header>

      <div className="space-y-4">
        {STEPS.map((step) => (
          <Card key={step.number}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {step.title}
                  </CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">{step.body}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {step.action && (
              <CardContent className="pl-[3.25rem]">
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  render={<Link href={step.action.href} />}
                  nativeButton={false}
                >
                  {step.action.label}
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <section aria-labelledby="field-guide-heading" className="space-y-3">
        <h2 id="field-guide-heading" className="text-lg font-semibold text-foreground">
          KPI field cheat sheet
        </h2>
        <div className="divide-y divide-border rounded-lg border border-border">
          {FIELD_GUIDE.map((item) => (
            <div key={item.field} className="p-4">
              <p className="text-sm font-medium text-foreground">{item.field}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="ai-features-heading" className="space-y-3">
        <h2 id="ai-features-heading" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          What each AI badge means
          <AiBadge />
        </h2>
        <p className="text-sm text-muted-foreground">
          Anything marked with this badge was written or suggested by an AI model (Google
          Gemini) rather than calculated from a formula. Treat it as a well-informed first draft
          to review, not a final answer — especially the KPI Generator&apos;s suggestions, which you
          choose to apply or discard one by one.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Extract from invoice</span> (in the
              KPI form) reads a total amount off an uploaded invoice image or PDF and offers to
              fill in the KPI&apos;s current value — you still confirm before it&apos;s applied.
            </p>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Review notes</span> are written by
              you, not AI — they&apos;re just a place to keep context that numbers alone can&apos;t
              capture.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
