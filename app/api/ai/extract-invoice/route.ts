import { NextRequest, NextResponse } from "next/server";
import { callLLM, httpStatusForLlmError } from "@/lib/llm";
import { invoiceExtractionSchema } from "@/lib/ai/schemas";
import { INVOICE_EXTRACTION_SYSTEM_PROMPT } from "@/lib/ai/prompts";

const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
// Base64 runs ~33% larger than the source file, so this caps the raw file at ~8MB.
const MAX_BASE64_LENGTH = 11_000_000;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const data = typeof body?.data === "string" ? body.data : null;
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : null;

  if (!data || !mimeType) {
    return NextResponse.json(
      { error: "No file was provided.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }
  if (!ACCEPTED_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PNG, JPG, WEBP, or PDF.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }
  if (data.length > MAX_BASE64_LENGTH) {
    return NextResponse.json(
      { error: "File is too large. Please upload a file under 8MB.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }

  const result = await callLLM({
    system: INVOICE_EXTRACTION_SYSTEM_PROMPT,
    user: "Extract the total amount from this invoice.",
    schema: invoiceExtractionSchema,
    file: { data, mimeType },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status: httpStatusForLlmError(result.error) }
    );
  }

  return NextResponse.json(result.data);
}
