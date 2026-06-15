#!/usr/bin/env node
import { fileURLToPath } from "url";
import minimist from "minimist";
import { evaluate } from "./evaluate.js";
import { formatReport } from "./format.js";

interface ParsedArgs {
  intent?: string;
  prompt?: string;
  model?: string;
  json: boolean;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed = minimist(argv, {
    string: ["intent", "prompt", "model"],
    boolean: ["json"],
    default: { json: false },
  });
  return {
    intent: parsed["intent"] as string | undefined,
    prompt: parsed["prompt"] as string | undefined,
    model: parsed["model"] as string | undefined,
    json: parsed["json"] as boolean,
  };
}

export function buildUsage(): string {
  return [
    "Usage: prompt-critic --intent <intent> --prompt <prompt> [options]",
    "",
    "Required:",
    "  --intent   What you actually want to accomplish",
    "  --prompt   The prompt text to evaluate",
    "",
    "Options:",
    "  --model    Claude model to use for preview (default: claude-sonnet-4-6)",
    "  --json     Output raw JSON instead of formatted report",
  ].join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.intent || !args.prompt) {
    console.error("Error: --intent and --prompt are required\n");
    console.error(buildUsage());
    process.exit(1);
  }

  const result = await evaluate({
    intent: args.intent,
    prompt: args.prompt,
    model: args.model,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatReport(result));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
