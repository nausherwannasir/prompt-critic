import { describe, it, expect } from "vitest";
import { scoreBar, formatReport } from "../src/format.js";
import type { EvalResult } from "../src/types.js";

describe("scoreBar", () => {
  it("renders 1/5 as one filled block", () => {
    expect(scoreBar(1)).toBe("█░░░░");
  });

  it("renders 5/5 as all filled", () => {
    expect(scoreBar(5)).toBe("█████");
  });

  it("renders 3/5 as three filled blocks", () => {
    expect(scoreBar(3)).toBe("███░░");
  });

  it("rounds down for decimals", () => {
    expect(scoreBar(2.5)).toBe("██░░░");
  });
});

const sampleResult: EvalResult = {
  input: {
    intent: "summarize a legal doc for a non-lawyer",
    prompt: "Summarize this document.",
  },
  preview: "This agreement establishes the terms and conditions governing...",
  critique: {
    scores: {
      clarity: 2,
      intentAlignment: 1,
      formatGuidance: 1,
      robustness: 2,
      overall: 1.5,
    },
    analysis: [
      "Clarity: 'Summarize' is too vague without audience or length constraints.",
      "Intent alignment: the prompt never mentions the non-lawyer audience.",
    ],
    rewrites: [
      "Summarize this legal document in plain English for a non-lawyer. Use bullet points.",
      "You are a plain-language translator. Explain this legal document to someone with no legal background.",
    ],
  },
};

describe("formatReport", () => {
  it("includes the PROMPT CRITIC REPORT header", () => {
    expect(formatReport(sampleResult)).toContain("PROMPT CRITIC REPORT");
  });

  it("includes the intent", () => {
    expect(formatReport(sampleResult)).toContain("summarize a legal doc for a non-lawyer");
  });

  it("includes the original prompt", () => {
    expect(formatReport(sampleResult)).toContain("Summarize this document.");
  });

  it("includes the preview output", () => {
    expect(formatReport(sampleResult)).toContain("This agreement establishes");
  });

  it("includes score bars", () => {
    const report = formatReport(sampleResult);
    expect(report).toContain("██░░░");
    expect(report).toContain("█░░░░");
  });

  it("includes the overall score", () => {
    expect(formatReport(sampleResult)).toContain("1.5");
  });

  it("includes analysis lines", () => {
    const report = formatReport(sampleResult);
    expect(report).toContain("Clarity:");
    expect(report).toContain("Intent alignment:");
  });

  it("marks both rewrites with [1] and [2]", () => {
    const report = formatReport(sampleResult);
    expect(report).toContain("[1]");
    expect(report).toContain("[2]");
  });
});
