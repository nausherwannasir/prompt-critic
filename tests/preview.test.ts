import { describe, it, expect } from "vitest";
import { extractTextContent } from "../src/preview.js";

describe("extractTextContent", () => {
  it("returns text from a single text block", () => {
    const blocks = [{ type: "text" as const, text: "Hello world" }];
    expect(extractTextContent(blocks)).toBe("Hello world");
  });

  it("concatenates multiple text blocks", () => {
    const blocks = [
      { type: "text" as const, text: "Hello" },
      { type: "text" as const, text: " world" },
    ];
    expect(extractTextContent(blocks)).toBe("Hello world");
  });

  it("throws when no text blocks are present", () => {
    expect(() => extractTextContent([])).toThrow("No text content in preview response");
  });

  it("ignores non-text blocks", () => {
    const blocks = [
      { type: "tool_use" as const, id: "x", name: "fn", input: {} },
      { type: "text" as const, text: "result" },
    ];
    expect(extractTextContent(blocks as Parameters<typeof extractTextContent>[0])).toBe("result");
  });
});
