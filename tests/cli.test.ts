import { describe, it, expect } from "vitest";
import { parseArgs, buildUsage } from "../src/cli.js";

describe("parseArgs", () => {
  it("parses --intent and --prompt flags", () => {
    const result = parseArgs(["--intent", "my goal", "--prompt", "do something"]);
    expect(result.intent).toBe("my goal");
    expect(result.prompt).toBe("do something");
  });

  it("parses optional --model flag", () => {
    const result = parseArgs(["--intent", "x", "--prompt", "y", "--model", "claude-haiku-4-5-20251001"]);
    expect(result.model).toBe("claude-haiku-4-5-20251001");
  });

  it("parses --json flag", () => {
    const result = parseArgs(["--intent", "x", "--prompt", "y", "--json"]);
    expect(result.json).toBe(true);
  });

  it("returns json false by default", () => {
    const result = parseArgs(["--intent", "x", "--prompt", "y"]);
    expect(result.json).toBe(false);
  });

  it("returns null intent when missing", () => {
    const result = parseArgs(["--prompt", "y"]);
    expect(result.intent).toBeUndefined();
  });

  it("returns null prompt when missing", () => {
    const result = parseArgs(["--intent", "x"]);
    expect(result.prompt).toBeUndefined();
  });
});

describe("buildUsage", () => {
  it("includes required flags in usage string", () => {
    const usage = buildUsage();
    expect(usage).toContain("--intent");
    expect(usage).toContain("--prompt");
  });
});
