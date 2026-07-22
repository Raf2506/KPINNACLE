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

type EmployeeSeed = {
  name: string;
  role: string;
  department: string;
  kpis: KpiSeed[];
};

const EMPLOYEES: EmployeeSeed[] = [
  {
    name: "Aisha Rahman",
    role: "Sales Executive",
    department: "Sales",
    kpis: [
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
  },
  {
    name: "Daniel Teo",
    role: "Sales Executive",
    department: "Sales",
    kpis: [
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
  },
  {
    name: "Nurul Huda",
    role: "Operations Manager",
    department: "Operations",
    kpis: [
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
  },
  {
    name: "Marcus Lim",
    role: "Operations Analyst",
    department: "Operations",
    kpis: [
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
  },
  {
    name: "Farah Aziz",
    role: "Compliance Officer",
    department: "Compliance & Engineering",
    kpis: [
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
  },
  {
    name: "Kevin Wong",
    role: "Software Developer",
    department: "Compliance & Engineering",
    kpis: [
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
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.kpi.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.reviewCycle.deleteMany();

  const cycle = await prisma.reviewCycle.create({
    data: {
      name: "Q3 2026 (Jul–Sep)",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      isActive: true,
    },
  });

  for (const employeeSeed of EMPLOYEES) {
    const employee = await prisma.employee.create({
      data: {
        name: employeeSeed.name,
        role: employeeSeed.role,
        department: employeeSeed.department,
      },
    });

    await prisma.kpi.createMany({
      data: employeeSeed.kpis.map((kpi) => ({
        ...kpi,
        employeeId: employee.id,
        cycleId: cycle.id,
      })),
    });
  }

  const employeeCount = await prisma.employee.count();
  const kpiCount = await prisma.kpi.count();
  console.log(`Seeded ${employeeCount} employees and ${kpiCount} KPIs in cycle "${cycle.name}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
