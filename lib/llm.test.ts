import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { callLLM } from "./llm";

describe("callLLM", () => {
  const originalKey = process.env.LLM_API_KEY;

  beforeEach(() => {
    delete process.env.LLM_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.LLM_API_KEY;
    } else {
      process.env.LLM_API_KEY = originalKey;
    }
  });

  it("returns a typed MISSING_KEY error when LLM_API_KEY is unset, without calling the network", async () => {
    const result = await callLLM({
      system: "test",
      user: "test",
      schema: z.object({ value: z.string() }),
    });

    expect(result).toEqual({
      ok: false,
      error: "MISSING_KEY",
      message: "LLM_API_KEY is not configured on the server.",
    });
  });
});
