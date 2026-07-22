import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";

/**
 * Provider-agnostic LLM plumbing. Currently implemented for Anthropic only
 * (LLM_PROVIDER="anthropic"); the callLLM signature is the single seam a
 * second provider would plug into.
 */

export type LlmErrorCode = "MISSING_KEY" | "RATE_LIMITED" | "MODEL_ERROR" | "PARSE_ERROR";

export type LlmResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: LlmErrorCode; message: string };

const MODEL = "claude-sonnet-5";

export async function callLLM<T>(opts: {
  system: string;
  user: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  maxTokens?: number;
}): Promise<LlmResult<T>> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "MISSING_KEY",
      message: "LLM_API_KEY is not configured on the server.",
    };
  }

  const client = new Anthropic({ apiKey });
  const jsonSchema = zodToJsonSchema(opts.schema, "response").definitions?.response ?? {};

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 1536,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
      tools: [
        {
          name: "submit_response",
          description: "Submit the structured response for this request.",
          input_schema: jsonSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "submit_response" },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "MISSING_KEY", message: "The configured LLM_API_KEY was rejected." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "RATE_LIMITED", message: "Rate limited by the model provider. Try again shortly." };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: "MODEL_ERROR", message: error.message };
    }
    return { ok: false, error: "MODEL_ERROR", message: "Unexpected error calling the model." };
  }

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    return { ok: false, error: "PARSE_ERROR", message: "The model did not return structured output." };
  }

  const parsed = opts.schema.safeParse(toolUse.input);
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
