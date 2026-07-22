import type { Category, Status } from "@/lib/metrics";

export type { Category, Status };

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Kpi {
  id: string;
  title: string;
  description: string;
  category: Category;
  weight: number;
  target: number;
  current: number;
  unit: string;
  status: Status;
  aiGenerated: boolean;
  employeeId: string;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  cycle?: ReviewCycle;
}

export interface EmployeeWithKpis extends Employee {
  kpis: Kpi[];
}

export interface EmployeeMetric {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  kpiCount: number;
  overallScore: number;
  onTrackPct: number;
  atRiskCount: number;
}

export interface MetricsResponse {
  cycle: ReviewCycle | null;
  overallScore: number;
  onTrackPct: number;
  atRiskCount: number;
  totalKpis: number;
  totalEmployees: number;
  categoryBreakdown: Record<Category, number>;
  statusDistribution: Record<Status, number>;
  perEmployee: EmployeeMetric[];
}
