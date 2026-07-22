import { PrismaClient, Category, Status } from "@prisma/client";

const prisma = new PrismaClient();

type KpiSeed = {
  title: string;
  description: string;
  category: Category;
  weight: number;
  target: number;
  current: number;
  unit: string;
  status: Status;
};

type EmployeeProfile = {
  name: string;
  role: string;
  department: string;
};

const EMPLOYEE_PROFILES: EmployeeProfile[] = [
  { name: "Aisha Rahman", role: "Sales Executive", department: "Sales" },
  { name: "Daniel Teo", role: "Sales Executive", department: "Sales" },
  { name: "Nurul Huda", role: "Operations Manager", department: "Operations" },
  { name: "Marcus Lim", role: "Operations Analyst", department: "Operations" },
  { name: "Farah Aziz", role: "Compliance Officer", department: "Compliance & Engineering" },
  { name: "Kevin Wong", role: "Software Developer", department: "Compliance & Engineering" },
];

/** Active cycle — the full, deliberately messy KPI set (edge cases documented inline). */
const Q3_KPIS: Record<string, KpiSeed[]> = {
  "Aisha Rahman": [
    {
      title: "Monthly Sales Revenue",
      description: "Total closed revenue for the quarter against the assigned target.",
      category: Category.SALES,
      weight: 40,
      target: 150000,
      current: 138000,
      unit: "RM",
      status: Status.ON_TRACK,
    },
    {
      title: "New Client Acquisitions",
      description: "Number of new paying clients signed this cycle.",
      category: Category.SALES,
      weight: 30,
      target: 12,
      current: 9,
      unit: "count",
      status: Status.ON_TRACK,
    },
    {
      title: "Client Retention Rate",
      description: "Percentage of existing clients retained through the cycle.",
      category: Category.SALES,
      weight: 20,
      target: 95,
      current: 88,
      unit: "%",
      status: Status.AT_RISK,
    },
    {
      title: "Upsell Revenue",
      description: "Additional revenue from upselling existing accounts.",
      category: Category.SALES,
      weight: 10,
      target: 20000,
      current: 4000,
      unit: "RM",
      status: Status.BEHIND,
    },
  ],
  "Daniel Teo": [
    {
      title: "Monthly Sales Revenue",
      description:
        "Total closed revenue for the quarter against the assigned target. Deliberately overachieved (current > target) to exercise achievement clamping.",
      category: Category.SALES,
      weight: 25,
      target: 120000,
      current: 128000,
      unit: "RM",
      status: Status.ON_TRACK,
    },
    {
      title: "New Client Acquisitions",
      description: "Number of new paying clients signed this cycle.",
      category: Category.SALES,
      weight: 25,
      target: 10,
      current: 10,
      unit: "count",
      status: Status.ON_TRACK,
    },
    {
      title: "Cold Call Conversion Rate",
      description: "Percentage of cold calls converted into qualified leads.",
      category: Category.SALES,
      weight: 25,
      target: 15,
      current: 6,
      unit: "%",
      status: Status.BEHIND,
    },
    {
      title: "CRM Data Hygiene Score",
      description: "Completeness/accuracy score of CRM records owned by this rep.",
      category: Category.SALES,
      weight: 25,
      target: 100,
      current: 0,
      unit: "%",
      status: Status.NOT_STARTED,
    },
  ],
  "Nurul Huda": [
    {
      title: "Process Efficiency Improvement",
      description: "Measured reduction in average process cycle time.",
      category: Category.OPERATIONS,
      weight: 30,
      target: 15,
      current: 11,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "On-Time Delivery Rate",
      description: "Percentage of orders fulfilled within the promised window.",
      category: Category.OPERATIONS,
      weight: 30,
      target: 98,
      current: 94,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Operational Cost Reduction",
      description: "Cost savings achieved through process changes this cycle.",
      category: Category.OPERATIONS,
      weight: 25,
      target: 10,
      current: 3,
      unit: "%",
      status: Status.AT_RISK,
    },
    {
      title: "Team Training Completion",
      description: "Percentage of the team that completed mandatory SOP training.",
      category: Category.OPERATIONS,
      weight: 15,
      target: 100,
      current: 100,
      unit: "%",
      status: Status.ON_TRACK,
    },
  ],
  "Marcus Lim": [
    {
      title: "Inventory Accuracy Rate",
      description: "Cycle-count accuracy across managed warehouse locations.",
      category: Category.OPERATIONS,
      weight: 35,
      target: 99,
      current: 97.5,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "New Vendor Partnerships",
      description:
        "Target intentionally left unset (0) pending sourcing strategy approval — exercises the target<=0 clamp-to-zero rule.",
      category: Category.OPERATIONS,
      weight: 35,
      target: 0,
      current: 2,
      unit: "count",
      status: Status.NOT_STARTED,
    },
    {
      title: "Warehouse Safety Incidents Resolved",
      description: "Reported safety incidents fully investigated and closed.",
      category: Category.OPERATIONS,
      weight: 20,
      target: 5,
      current: 5,
      unit: "count",
      status: Status.ON_TRACK,
    },
    {
      title: "Process Documentation Coverage",
      description: "Percentage of SOPs with up-to-date written documentation.",
      category: Category.OPERATIONS,
      weight: 10,
      target: 100,
      current: 40,
      unit: "%",
      status: Status.BEHIND,
    },
  ],
  "Farah Aziz": [
    {
      title: "Audit Findings Closure Rate",
      description:
        "Percentage of prior audit findings remediated. Employee's KPI weights deliberately sum to 95 (not 100) to exercise weight-sum normalization.",
      category: Category.COMPLIANCE,
      weight: 25,
      target: 100,
      current: 78,
      unit: "%",
      status: Status.AT_RISK,
    },
    {
      title: "Policy Training Completion",
      description: "Percentage of staff who completed annual compliance training.",
      category: Category.COMPLIANCE,
      weight: 25,
      target: 100,
      current: 100,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Regulatory Filing Timeliness",
      description: "Percentage of regulatory filings submitted before deadline.",
      category: Category.COMPLIANCE,
      weight: 25,
      target: 100,
      current: 60,
      unit: "%",
      status: Status.BEHIND,
    },
    {
      title: "Incident Reports Reviewed",
      description: "Compliance incident reports reviewed and signed off.",
      category: Category.COMPLIANCE,
      weight: 20,
      target: 30,
      current: 30,
      unit: "count",
      status: Status.ON_TRACK,
    },
  ],
  "Kevin Wong": [
    {
      title: "Sprint Velocity Achievement",
      description: "Story points delivered vs. sprint commitment, averaged over the cycle.",
      category: Category.DEVELOPMENT,
      weight: 30,
      target: 100,
      current: 87,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Code Review Turnaround",
      description: "Percentage of PRs reviewed within the 1-business-day SLA.",
      category: Category.DEVELOPMENT,
      weight: 30,
      target: 90,
      current: 92,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Production Bugs Resolved",
      description: "Production-severity bugs resolved this cycle.",
      category: Category.DEVELOPMENT,
      weight: 20,
      target: 25,
      current: 25,
      unit: "count",
      status: Status.ON_TRACK,
    },
    {
      title: "Test Coverage Increase",
      description: "Percentage-point increase in automated test coverage.",
      category: Category.DEVELOPMENT,
      weight: 20,
      target: 20,
      current: 0,
      unit: "%",
      status: Status.NOT_STARTED,
    },
  ],
};

/** Oldest closed cycle — final, resolved results (no NOT_STARTED; the quarter is over). */
const Q1_KPIS: Record<string, KpiSeed[]> = {
  "Aisha Rahman": [
    {
      title: "Q1 Sales Revenue",
      description: "Final closed revenue for Q1 against the assigned target.",
      category: Category.SALES,
      weight: 60,
      target: 130000,
      current: 121000,
      unit: "RM",
      status: Status.BEHIND,
    },
    {
      title: "New Client Acquisitions",
      description: "Number of new paying clients signed in Q1.",
      category: Category.SALES,
      weight: 40,
      target: 8,
      current: 7,
      unit: "count",
      status: Status.AT_RISK,
    },
  ],
  "Daniel Teo": [
    {
      title: "Q1 Sales Revenue",
      description: "Final closed revenue for Q1 against the assigned target.",
      category: Category.SALES,
      weight: 60,
      target: 100000,
      current: 94000,
      unit: "RM",
      status: Status.AT_RISK,
    },
    {
      title: "Client Retention Rate",
      description: "Percentage of existing clients retained through Q1.",
      category: Category.SALES,
      weight: 40,
      target: 88,
      current: 85,
      unit: "%",
      status: Status.AT_RISK,
    },
  ],
  "Nurul Huda": [
    {
      title: "On-Time Delivery Rate",
      description: "Percentage of orders fulfilled within the promised window in Q1.",
      category: Category.OPERATIONS,
      weight: 50,
      target: 92,
      current: 89,
      unit: "%",
      status: Status.AT_RISK,
    },
    {
      title: "Team Training Completion",
      description: "Percentage of the team that completed mandatory SOP training in Q1.",
      category: Category.OPERATIONS,
      weight: 50,
      target: 100,
      current: 100,
      unit: "%",
      status: Status.ON_TRACK,
    },
  ],
  "Marcus Lim": [
    {
      title: "Inventory Accuracy Rate",
      description: "Cycle-count accuracy across managed warehouse locations in Q1.",
      category: Category.OPERATIONS,
      weight: 60,
      target: 97,
      current: 95,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Process Documentation Coverage",
      description: "Percentage of SOPs with up-to-date written documentation in Q1.",
      category: Category.OPERATIONS,
      weight: 40,
      target: 80,
      current: 55,
      unit: "%",
      status: Status.BEHIND,
    },
  ],
  "Farah Aziz": [
    {
      title: "Policy Training Completion",
      description: "Percentage of staff who completed annual compliance training in Q1.",
      category: Category.COMPLIANCE,
      weight: 50,
      target: 100,
      current: 96,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Regulatory Filing Timeliness",
      description: "Percentage of regulatory filings submitted before deadline in Q1.",
      category: Category.COMPLIANCE,
      weight: 50,
      target: 100,
      current: 88,
      unit: "%",
      status: Status.AT_RISK,
    },
  ],
  "Kevin Wong": [
    {
      title: "Sprint Velocity Achievement",
      description: "Story points delivered vs. sprint commitment, averaged over Q1.",
      category: Category.DEVELOPMENT,
      weight: 50,
      target: 100,
      current: 82,
      unit: "%",
      status: Status.AT_RISK,
    },
    {
      title: "Code Review Turnaround",
      description: "Percentage of PRs reviewed within the 1-business-day SLA in Q1.",
      category: Category.DEVELOPMENT,
      weight: 50,
      target: 85,
      current: 80,
      unit: "%",
      status: Status.AT_RISK,
    },
  ],
};

/** Closed prior cycle — final, resolved results (no NOT_STARTED; the quarter is over). */
const Q2_KPIS: Record<string, KpiSeed[]> = {
  "Aisha Rahman": [
    {
      title: "Q2 Sales Revenue",
      description: "Final closed revenue for Q2 against the assigned target.",
      category: Category.SALES,
      weight: 60,
      target: 140000,
      current: 145000,
      unit: "RM",
      status: Status.ON_TRACK,
    },
    {
      title: "Client Retention Rate",
      description: "Percentage of existing clients retained through Q2.",
      category: Category.SALES,
      weight: 40,
      target: 90,
      current: 92,
      unit: "%",
      status: Status.ON_TRACK,
    },
  ],
  "Daniel Teo": [
    {
      title: "Q2 Sales Revenue",
      description: "Final closed revenue for Q2 against the assigned target.",
      category: Category.SALES,
      weight: 60,
      target: 110000,
      current: 98000,
      unit: "RM",
      status: Status.BEHIND,
    },
    {
      title: "New Client Acquisitions",
      description: "Number of new paying clients signed in Q2.",
      category: Category.SALES,
      weight: 40,
      target: 8,
      current: 8,
      unit: "count",
      status: Status.ON_TRACK,
    },
  ],
  "Nurul Huda": [
    {
      title: "Process Efficiency Improvement",
      description: "Measured reduction in average process cycle time during Q2.",
      category: Category.OPERATIONS,
      weight: 50,
      target: 12,
      current: 13,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "On-Time Delivery Rate",
      description: "Percentage of orders fulfilled within the promised window in Q2.",
      category: Category.OPERATIONS,
      weight: 50,
      target: 95,
      current: 91,
      unit: "%",
      status: Status.AT_RISK,
    },
  ],
  "Marcus Lim": [
    {
      title: "Inventory Accuracy Rate",
      description: "Cycle-count accuracy across managed warehouse locations in Q2.",
      category: Category.OPERATIONS,
      weight: 60,
      target: 98,
      current: 96,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Warehouse Safety Incidents Resolved",
      description: "Reported safety incidents fully investigated and closed in Q2.",
      category: Category.OPERATIONS,
      weight: 40,
      target: 4,
      current: 4,
      unit: "count",
      status: Status.ON_TRACK,
    },
  ],
  "Farah Aziz": [
    {
      title: "Audit Findings Closure Rate",
      description: "Percentage of prior audit findings remediated during Q2.",
      category: Category.COMPLIANCE,
      weight: 50,
      target: 100,
      current: 82,
      unit: "%",
      status: Status.AT_RISK,
    },
    {
      title: "Policy Training Completion",
      description: "Percentage of staff who completed annual compliance training in Q2.",
      category: Category.COMPLIANCE,
      weight: 50,
      target: 100,
      current: 100,
      unit: "%",
      status: Status.ON_TRACK,
    },
  ],
  "Kevin Wong": [
    {
      title: "Sprint Velocity Achievement",
      description: "Story points delivered vs. sprint commitment, averaged over Q2.",
      category: Category.DEVELOPMENT,
      weight: 50,
      target: 100,
      current: 91,
      unit: "%",
      status: Status.ON_TRACK,
    },
    {
      title: "Production Bugs Resolved",
      description: "Production-severity bugs resolved during Q2.",
      category: Category.DEVELOPMENT,
      weight: 50,
      target: 20,
      current: 18,
      unit: "count",
      status: Status.AT_RISK,
    },
  ],
};

async function main() {
  console.log("Seeding database...");

  await prisma.kpi.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.reviewCycle.deleteMany();

  const q1Cycle = await prisma.reviewCycle.create({
    data: {
      name: "Q1 2026 (Jan–Mar)",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
      isActive: false,
    },
  });

  const q2Cycle = await prisma.reviewCycle.create({
    data: {
      name: "Q2 2026 (Apr–Jun)",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      isActive: false,
    },
  });

  const q3Cycle = await prisma.reviewCycle.create({
    data: {
      name: "Q3 2026 (Jul–Sep)",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      isActive: true,
    },
  });

  for (const profile of EMPLOYEE_PROFILES) {
    const employee = await prisma.employee.create({ data: profile });

    await prisma.kpi.createMany({
      data: Q1_KPIS[profile.name].map((kpi) => ({
        ...kpi,
        employeeId: employee.id,
        cycleId: q1Cycle.id,
      })),
    });

    await prisma.kpi.createMany({
      data: Q2_KPIS[profile.name].map((kpi) => ({
        ...kpi,
        employeeId: employee.id,
        cycleId: q2Cycle.id,
      })),
    });

    await prisma.kpi.createMany({
      data: Q3_KPIS[profile.name].map((kpi) => ({
        ...kpi,
        employeeId: employee.id,
        cycleId: q3Cycle.id,
      })),
    });
  }

  const employeeCount = await prisma.employee.count();
  const kpiCount = await prisma.kpi.count();
  console.log(
    `Seeded ${employeeCount} employees and ${kpiCount} KPIs across cycles "${q1Cycle.name}", "${q2Cycle.name}", and "${q3Cycle.name}".`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
