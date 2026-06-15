import { describe, it, expect } from "vitest";
import { parseCritiqueJson, validateScore } from "../src/critique.js";

const validJson = JSON.stringify({
  scores: {
    clarity: 2,
    intentAlignment: 1,
    formatGuidance: 1,
    robustness: 2,
    overall: 1.5,
  },
  analysis: [
    "Clarity: 'Summarize' is too vague without audience or length constraints.",
    "Intent alignment: the prompt never mentions non-lawyer audience.",
  ],
  rewrites: [
    "Summarize this legal document in plain English for a non-lawyer. Use bullet points. Highlight obligations, deadlines, and rights. Keep under 300 words.",
    "You are a plain-language translator. Explain this legal document to someone with no legal background using simple terms and short paragraphs.",
  ],
});

describe("parseCritiqueJson", () => {
  it("parses valid critique JSON", () => {
    const result = parseCritiqueJson(validJson);
    expect(result.scores.clarity).toBe(2);
    expect(result.scores.overall).toBe(1.5);
    expect(result.analysis).toHaveLength(2);
    expect(result.rewrites).toHaveLength(2);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseCritiqueJson("not json")).toThrow("Invalid critique JSON");
  });

  it("throws when scores object is missing", () => {
    expect(() => parseCritiqueJson(JSON.stringify({ analysis: [], rewrites: ["a", "b"] }))).toThrow("Missing scores");
  });

  it("throws when analysis is missing", () => {
    expect(() =>
      parseCritiqueJson(
        JSON.stringify({ scores: { clarity: 1, intentAlignment: 1, formatGuidance: 1, robustness: 1, overall: 1 }, rewrites: ["a", "b"] })
      )
    ).toThrow("Missing analysis");
  });

  it("throws when rewrites array does not have exactly 2 items", () => {
    expect(() =>
      parseCritiqueJson(
        JSON.stringify({
          scores: { clarity: 1, intentAlignment: 1, formatGuidance: 1, robustness: 1, overall: 1 },
          analysis: ["x"],
          rewrites: ["only one"],
        })
      )
    ).toThrow("exactly 2 rewrites");
  });
});

describe("validateScore", () => {
  it("accepts valid 1-5 integer scores", () => {
    expect(() => validateScore(1, "clarity")).not.toThrow();
    expect(() => validateScore(5, "clarity")).not.toThrow();
    expect(() => validateScore(3, "clarity")).not.toThrow();
  });

  it("throws on score below 1", () => {
    expect(() => validateScore(0, "clarity")).toThrow("clarity");
  });

  it("throws on score above 5", () => {
    expect(() => validateScore(6, "clarity")).toThrow("clarity");
  });

  it("throws on non-number", () => {
    expect(() => validateScore("3" as unknown as number, "clarity")).toThrow("clarity");
  });
});
