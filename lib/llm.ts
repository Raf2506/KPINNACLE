import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";

/**
 * Provider-agnostic LLM plumbing. Currently implemented for Google Gemini
 * (LLM_PROVIDER="gemini"); callLLM's signature is the seam a different
 * provider would plug into.
 *
 * We ask Gemini for raw JSON (responseMimeType) rather than a provider-native
 * structured schema, then run the result through the caller's Zod schema.
 * That's the same defensive-normalization pass every LLM response already
 * has to pass per project convention, so it doubles as our schema enforcement.
 */

export type LlmErrorCode = "MISSING_KEY" | "RATE_LIMITED" | "MODEL_ERROR" | "PARSE_ERROR";

export type LlmResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: LlmErrorCode; message: string };

const MODEL = "gemini-flash-latest";

export async function callLLM<T>(opts: {
  system: string;
  user: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  maxTokens?: number;
  /** Optional file (base64 data + MIME type) attached alongside the user prompt, for multimodal input like invoice images/PDFs. */
  file?: { data: string; mimeType: string };
}): Promise<LlmResult<T>> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "MISSING_KEY",
      message: "LLM_API_KEY is not configured on the server.",
    };
  }

  const client = new GoogleGenAI({ apiKey });
  const jsonSchema = zodToJsonSchema(opts.schema, "response").definitions?.response ?? {};
  const systemInstruction = `${opts.system}\n\nRespond with ONLY a single valid JSON object matching this schema — no markdown fences, no commentary before or after:\n${JSON.stringify(jsonSchema)}`;

  const contents = opts.file
    ? [{ inlineData: { data: opts.file.data, mimeType: opts.file.mimeType } }, { text: opts.user }]
    : opts.user;

  let text: string | undefined;
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        // Gemini's flash models spend part of this budget on internal "thinking"
        // tokens before writing the answer, so this needs real headroom above
        // the visible JSON output size or responses truncate mid-object.
        maxOutputTokens: opts.maxTokens ?? 8192,
      },
    });
    text = response.text;
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return { ok: false, error: "MISSING_KEY", message: "The configured LLM_API_KEY was rejected." };
    }
    if (status === 429) {
      return { ok: false, error: "RATE_LIMITED", message: "Rate limited by the model provider. Try again shortly." };
    }
    const message = error instanceof Error ? error.message : "Unexpected error calling the model.";
    return { ok: false, error: "MODEL_ERROR", message };
  }

  if (!text) {
    return { ok: false, error: "PARSE_ERROR", message: "The model did not return any output." };
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "PARSE_ERROR", message: "The model's response wasn't valid JSON." };
  }

  const parsed = opts.schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "PARSE_ERROR", message: "The model's response didn't match the expected shape." };
  }

  return { ok: true, data: parsed.data };
}

export function httpStatusForLlmError(code: LlmErrorCode): number {
  switch (code) {
    case "MISSING_KEY":
      return 503;
    case "RATE_LIMITED":
      return 429;
    case "PARSE_ERROR":
    case "MODEL_ERROR":
    default:
      return 502;
  }
}
