import type { EvalResult } from "./types.js";

const DIVIDER = "─".repeat(49);

export function scoreBar(score: number): string {
  const filled = Math.floor(score);
  return "█".repeat(filled) + "░".repeat(5 - filled);
}

export function formatReport(result: EvalResult): string {
  const { input, preview, critique } = result;
  const { scores, analysis, rewrites } = critique;

  const lines: string[] = [
    DIVIDER,
    " PROMPT CRITIC REPORT",
    DIVIDER,
    "",
    " INTENT",
    ` "${input.intent}"`,
    "",
    " YOUR PROMPT",
    ` "${input.prompt}"`,
    "",
    DIVIDER,
    " PREVIEW  (what the model actually produces)",
    DIVIDER,
    preview,
    "",
    DIVIDER,
    " SCORES",
    DIVIDER,
    ` Clarity & Specificity    ${scores.clarity}/5  ${scoreBar(scores.clarity)}`,
    ` Intent Alignment         ${scores.intentAlignment}/5  ${scoreBar(scores.intentAlignment)}`,
    ` Output Format Guidance   ${scores.formatGuidance}/5  ${scoreBar(scores.formatGuidance)}`,
    ` Robustness               ${scores.robustness}/5  ${scoreBar(scores.robustness)}`,
    " " + "─".repeat(33),
    ` Overall                  ${scores.overall}/5`,
    "",
    DIVIDER,
    " ANALYSIS",
    DIVIDER,
    ...analysis.map((line) => ` ${line}`),
    "",
    DIVIDER,
    " REWRITES",
    DIVIDER,
    ` [1] ${rewrites[0]}`,
    "",
    ` [2] ${rewrites[1]}`,
    DIVIDER,
  ];

  return lines.join("\n");
}
