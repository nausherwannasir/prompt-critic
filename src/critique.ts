import Anthropic from "@anthropic-ai/sdk";
import type { EvalInput, CritiqueResult } from "./types.js";

const DEFAULT_MODEL = "claude-sonnet-4-6";

const CRITIQUE_SYSTEM = `You are a prompt quality evaluator. Given a user's intent, their prompt, and the model's actual output, evaluate the prompt quality.

Respond with ONLY valid JSON in this exact shape:
{
  "scores": {
    "clarity": <integer 1-5>,
    "intentAlignment": <integer 1-5>,
    "formatGuidance": <integer 1-5>,
    "robustness": <integer 1-5>,
    "overall": <number 1-5, one decimal>
  },
  "analysis": [<string per axis that scored below 4, explaining WHY concretely>],
  "rewrites": [<improved prompt 1>, <improved prompt 2>]
}

Scoring rubric:
- 1: Missing or harmful to the intent
- 2: Weak — present but insufficient
- 3: Adequate — does the job but leaves room
- 4: Good — clear, specific, well-formed
- 5: Excellent — no obvious improvement

Axes:
- clarity: Is the prompt unambiguous? Does it give the model enough detail without guessing?
- intentAlignment: Does the prompt actually ask for what the stated intent describes?
- formatGuidance: Does the prompt specify output structure (length, format, tone, sections)?
- robustness: Will it produce consistent results across runs with different inputs?

overall = average of the four axes, rounded to one decimal.

The rewrites must directly address the weaknesses found. Both rewrites should be usable as-is.`;

export function validateScore(value: unknown, axis: string): void {
  if (typeof value !== "number" || value < 1 || value > 5) {
    throw new Error(`Invalid score for ${axis}: must be a number between 1 and 5, got ${JSON.stringify(value)}`);
  }
}

export function parseCritiqueJson(raw: string): CritiqueResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid critique JSON: " + raw.slice(0, 100));
  }

  if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid critique JSON: not an object");

  const obj = parsed as Record<string, unknown>;

  if (!obj.scores || typeof obj.scores !== "object") throw new Error("Missing scores in critique response");
  if (!Array.isArray(obj.analysis)) throw new Error("Missing analysis array in critique response");
  if (!Array.isArray(obj.rewrites) || obj.rewrites.length !== 2) {
    throw new Error("Expected exactly 2 rewrites in critique response");
  }

  const scores = obj.scores as Record<string, unknown>;
  validateScore(scores.clarity, "clarity");
  validateScore(scores.intentAlignment, "intentAlignment");
  validateScore(scores.formatGuidance, "formatGuidance");
  validateScore(scores.robustness, "robustness");
  validateScore(scores.overall, "overall");

  return {
    scores: {
      clarity: scores.clarity as number,
      intentAlignment: scores.intentAlignment as number,
      formatGuidance: scores.formatGuidance as number,
      robustness: scores.robustness as number,
      overall: scores.overall as number,
    },
    analysis: obj.analysis as string[],
    rewrites: [obj.rewrites[0] as string, obj.rewrites[1] as string],
  };
}

export async function runCritique(input: EvalInput, preview: string): Promise<CritiqueResult> {
  const client = new Anthropic();

  const userMessage = `INTENT: ${input.intent}

PROMPT: ${input.prompt}

MODEL OUTPUT (actual preview):
${preview}`;

  const response = await client.messages.create({
    model: input.model ?? DEFAULT_MODEL,
    max_tokens: 1024,
    system: CRITIQUE_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in critique response");

  return parseCritiqueJson(jsonMatch[0]);
}
