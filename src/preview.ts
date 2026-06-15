import Anthropic from "@anthropic-ai/sdk";
import type { EvalInput } from "./types.js";

const DEFAULT_MODEL = "claude-sonnet-4-6";

type ContentBlock = Anthropic.Messages.ContentBlock;

export function extractTextContent(blocks: ContentBlock[]): string {
  const text = blocks
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  if (!text) throw new Error("No text content in preview response");
  return text;
}

export async function runPreview(input: EvalInput): Promise<string> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: input.model ?? DEFAULT_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: input.prompt }],
  });
  return extractTextContent(response.content);
}
