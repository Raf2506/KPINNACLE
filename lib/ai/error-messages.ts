import { ApiError } from "@/lib/api";

const MESSAGES: Record<string, string> = {
  MISSING_KEY: "AI features aren't configured yet — an LLM_API_KEY needs to be set on the server.",
  RATE_LIMITED: "The AI provider is rate-limiting requests right now. Try again in a moment.",
  MODEL_ERROR: "Something went wrong generating this.",
  PARSE_ERROR: "The AI response couldn't be understood.",
};

export function aiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
    return error.message;
  }
  return "Something went wrong.";
}
