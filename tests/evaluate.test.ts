import { describe, it, expect, vi } from "vitest";
import type { EvalInput, CritiqueResult } from "../src/types.js";

vi.mock("../src/preview.js", () => ({
  runPreview: vi.fn().mockResolvedValue("mocked model output"),
}));

vi.mock("../src/critique.js", () => ({
  runCritique: vi.fn().mockResolvedValue({
    scores: { clarity: 2, intentAlignment: 1, formatGuidance: 1, robustness: 2, overall: 1.5 },
    analysis: ["clarity is weak", "no format specified"],
    rewrites: ["better prompt 1", "better prompt 2"],
  } satisfies CritiqueResult),
}));

const { evaluate } = await import("../src/evaluate.js");
const { runPreview } = await import("../src/preview.js");
const { runCritique } = await import("../src/critique.js");

describe("evaluate", () => {
  const input: EvalInput = { intent: "summarize legal doc for non-lawyer", prompt: "Summarize this." };

  it("calls runPreview with the input", async () => {
    await evaluate(input);
    expect(runPreview).toHaveBeenCalledWith(input);
  });

  it("calls runCritique with input and preview output", async () => {
    await evaluate(input);
    expect(runCritique).toHaveBeenCalledWith(input, "mocked model output");
  });

  it("returns EvalResult combining input, preview, and critique", async () => {
    const result = await evaluate(input);
    expect(result.input).toBe(input);
    expect(result.preview).toBe("mocked model output");
    expect(result.critique.scores.overall).toBe(1.5);
    expect(result.critique.rewrites).toHaveLength(2);
  });

  it("propagates errors from runPreview", async () => {
    vi.mocked(runPreview).mockRejectedValueOnce(new Error("API down"));
    await expect(evaluate(input)).rejects.toThrow("API down");
  });
});
