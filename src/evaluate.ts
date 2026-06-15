import { runPreview } from "./preview.js";
import { runCritique } from "./critique.js";
import type { EvalInput, EvalResult } from "./types.js";

export async function evaluate(input: EvalInput): Promise<EvalResult> {
  const preview = await runPreview(input);
  const critique = await runCritique(input, preview);
  return { input, preview, critique };
}
