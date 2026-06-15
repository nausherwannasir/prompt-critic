import { describe, it } from "vitest";
import type { EvalInput, Score, CritiqueResult, EvalResult } from "../src/types.js";

describe("types", () => {
  it("EvalInput has required intent and prompt fields", () => {
    const input = { intent: "test", prompt: "do something" } satisfies EvalInput;
    void input;
  });

  it("EvalInput accepts optional model", () => {
    const input = { intent: "test", prompt: "do something", model: "claude-sonnet-4-6" } satisfies EvalInput;
    void input;
  });

  it("Score has all five numeric fields", () => {
    const score: Score = {
      clarity: 3,
      intentAlignment: 4,
      formatGuidance: 2,
      robustness: 3,
      overall: 3.0,
    };
    void score;
  });

  it("CritiqueResult has scores, analysis array, and exactly two rewrites", () => {
    const critique: CritiqueResult = {
      scores: { clarity: 3, intentAlignment: 3, formatGuidance: 3, robustness: 3, overall: 3 },
      analysis: ["clarity is weak"],
      rewrites: ["rewrite one", "rewrite two"],
    };
    void critique;
  });

  it("EvalResult composes all parts", () => {
    const result: EvalResult = {
      input: { intent: "goal", prompt: "do it" },
      preview: "model output here",
      critique: {
        scores: { clarity: 2, intentAlignment: 1, formatGuidance: 1, robustness: 2, overall: 1.5 },
        analysis: ["missing audience", "no format specified"],
        rewrites: ["better prompt 1", "better prompt 2"],
      },
    };
    void result;
  });
});
