import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM, httpStatusForLlmError } from "@/lib/llm";
import { kpiGeneratorResultSchema } from "@/lib/ai/schemas";
import { KPI_GENERATOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { renormalizeWeights } from "@/lib/ai/normalize";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const employeeId = typeof body.employeeId === "string" ? body.employeeId : null;
  const context = typeof body.context === "string" ? body.context : "";

  if (!employeeId) {
    return NextResponse.json({ error: "An employee is required.", code: "MODEL_ERROR" }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return NextResponse.json({ error: "Employee not found.", code: "MODEL_ERROR" }, { status: 404 });
  }

  const result = await callLLM({
    system: KPI_GENERATOR_SYSTEM_PROMPT,
    user: `Employee: ${employee.name}, ${employee.role}, ${employee.department} department.\nAdditional context from the manager: ${context.trim() || "(none provided)"}`,
    schema: kpiGeneratorResultSchema,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status: httpStatusForLlmError(result.error) }
    );
  }

  const suggestions = renormalizeWeights(result.data.suggestions);

  return NextResponse.json({ suggestions });
}
