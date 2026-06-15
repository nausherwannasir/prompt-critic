export interface EvalInput {
  intent: string;
  prompt: string;
  model?: string;
}

export interface Score {
  clarity: number;
  intentAlignment: number;
  formatGuidance: number;
  robustness: number;
  overall: number;
}

export interface CritiqueResult {
  scores: Score;
  analysis: string[];
  rewrites: [string, string];
}

export interface EvalResult {
  input: EvalInput;
  preview: string;
  critique: CritiqueResult;
}
