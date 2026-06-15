import { describe, it, expect } from "vitest";
import { evaluate } from "../src/evaluate.js";
import { cases } from "../fixtures/cases.js";

const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

describe.skipIf(!hasApiKey)("evaluate — integration", () => {
  for (const fixture of cases) {
    it(`scores within expected range: ${fixture.name}`, async () => {
      const result = await evaluate(fixture.input);

      expect(result.preview).toBeTruthy();
      expect(result.preview.length).toBeGreaterThan(10);

      const { overall } = result.critique.scores;
      expect(overall).toBeGreaterThanOrEqual(fixture.expectedOverallRange.min);
      expect(overall).toBeLessThanOrEqual(fixture.expectedOverallRange.max);

      expect(result.critique.rewrites).toHaveLength(2);
      expect(result.critique.rewrites[0].length).toBeGreaterThan(20);
      expect(result.critique.rewrites[1].length).toBeGreaterThan(20);

      expect(result.critique.analysis.length).toBeGreaterThan(0);
    }, 30_000);
  }
});
