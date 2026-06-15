import type { EvalInput } from "../src/types.js";

export interface FixtureCase {
  name: string;
  input: EvalInput;
  expectedOverallRange: { min: number; max: number };
}

export const cases: FixtureCase[] = [
  {
    name: "poor prompt — vague, no audience, no format",
    input: {
      intent: "summarize a legal document for someone with no legal background",
      prompt: "Summarize this document.",
    },
    expectedOverallRange: { min: 1, max: 2.5 },
  },
  {
    name: "adequate prompt — mentions task but lacks format and audience",
    input: {
      intent: "write a Python function that sorts a list of dictionaries by a given key",
      prompt: "Write a Python function to sort a list of dicts by a key. Handle edge cases.",
    },
    expectedOverallRange: { min: 2, max: 3.5 },
  },
  {
    name: "strong prompt — specific intent, audience, format, and constraints",
    input: {
      intent: "write a Python function that sorts a list of dictionaries by a given key",
      prompt:
        "Write a Python function called `sort_by_key(items: list[dict], key: str, reverse: bool = False) -> list[dict]` that sorts a list of dictionaries by the given key. Handle missing keys by placing those items at the end. Include type hints, a docstring, and at least 3 usage examples in a `if __name__ == '__main__'` block.",
    },
    expectedOverallRange: { min: 3.5, max: 5 },
  },
];
