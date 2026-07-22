import type { EmployeeInput, KpiInput } from "@/lib/validation";
import type {
  Category,
  Employee,
  EmployeeWithKpis,
  Kpi,
  MetricsResponse,
  ReviewCycle,
  Status,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;
  issues?: unknown;

  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error ?? "Request failed", res.status, body.issues);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function getMetrics(cycleId?: string) {
  const qs = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : "";
  return request<MetricsResponse>(`/api/metrics${qs}`);
}

export function getEmployees() {
  return request<EmployeeWithKpis[]>("/api/employees");
}

export function createEmployee(data: EmployeeInput) {
  return request<Employee>("/api/employees", { method: "POST", body: JSON.stringify(data) });
}

export function updateEmployee(id: string, data: Partial<EmployeeInput>) {
  return request<Employee>(`/api/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id: string) {
  return request<void>(`/api/employees/${id}`, { method: "DELETE" });
}

export interface KpiFilters {
  employeeId?: string;
  category?: Category;
  status?: Status;
  cycleId?: string;
}

export function getKpis(filters: KpiFilters = {}) {
  const params = new URLSearchParams();
  if (filters.employeeId) params.set("employeeId", filters.employeeId);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.cycleId) params.set("cycleId", filters.cycleId);
  const qs = params.toString();
  return request<Kpi[]>(`/api/kpis${qs ? `?${qs}` : ""}`);
}

export function createKpi(data: KpiInput) {
  return request<Kpi>("/api/kpis", { method: "POST", body: JSON.stringify(data) });
}

export function updateKpi(id: string, data: Partial<KpiInput>) {
  return request<Kpi>(`/api/kpis/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteKpi(id: string) {
  return request<void>(`/api/kpis/${id}`, { method: "DELETE" });
}

export function getCycles() {
  return request<ReviewCycle[]>("/api/cycles");
}
