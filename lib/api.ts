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
import type {
  ExecutiveInsightsResult,
  InvoiceExtractionResult,
  KpiSuggestion,
  RiskDetectionResult,
} from "@/lib/ai/schemas";

export class ApiError extends Error {
  status: number;
  issues?: unknown;
  /** Machine-readable error code, e.g. an LlmErrorCode from lib/llm.ts, when present. */
  code?: string;

  constructor(message: string, status: number, issues?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
    this.code = code;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error ?? "Request failed", res.status, body.issues, body.code);
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

export function getEmployees(cycleId?: string) {
  const qs = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : "";
  return request<EmployeeWithKpis[]>(`/api/employees${qs}`);
}

export function getEmployee(id: string, cycleId?: string) {
  const qs = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : "";
  return request<EmployeeWithKpis>(`/api/employees/${id}${qs}`);
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

export interface CachedAiResult<T> {
  cached: { payload: T; updatedAt: string } | null;
}

export interface AiResult<T> {
  payload: T;
  updatedAt: string;
}

export function getCachedRiskDetection(cycleId?: string) {
  const qs = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : "";
  return request<CachedAiResult<RiskDetectionResult>>(`/api/ai/risk${qs}`);
}

export function generateRiskDetection(cycleId?: string) {
  return request<AiResult<RiskDetectionResult>>("/api/ai/risk", {
    method: "POST",
    body: JSON.stringify({ cycleId }),
  });
}

export function generateKpiSuggestions(employeeId: string, context: string) {
  return request<{ suggestions: KpiSuggestion[] }>("/api/ai/generate-kpis", {
    method: "POST",
    body: JSON.stringify({ employeeId, context }),
  });
}

export function getCachedExecutiveInsights(cycleId?: string) {
  const qs = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : "";
  return request<CachedAiResult<ExecutiveInsightsResult>>(`/api/ai/insights${qs}`);
}

export function generateExecutiveInsights(cycleId?: string) {
  return request<AiResult<ExecutiveInsightsResult>>("/api/ai/insights", {
    method: "POST",
    body: JSON.stringify({ cycleId }),
  });
}

export function extractInvoice(data: string, mimeType: string) {
  return request<InvoiceExtractionResult>("/api/ai/extract-invoice", {
    method: "POST",
    body: JSON.stringify({ data, mimeType }),
  });
}
