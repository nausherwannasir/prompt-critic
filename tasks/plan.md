# Prompt Critic — Build Plan

## Tasks

### T1: Project scaffolding
**Status**: pending  
**Dependencies**: none  
**Acceptance criteria**:
- `package.json` exists with `name: "prompt-critic"`, `type: "module"`, scripts for `build`, `test`, `test:integration`, `start`
- `tsconfig.json` with `strict: true`, `module: NodeNext`, `target: ES2022`
- `src/`, `tests/`, `fixtures/`, `skills/` directories exist
- `npm install` succeeds with `@anthropic-ai/sdk`, `minimist`, `vitest`, `typescript`

---

### T2: Shared types
**Status**: pending  
**Dependencies**: T1  
**Acceptance criteria**:
- `src/types.ts` exports `EvalInput`, `Score`, `CritiqueResult`, `EvalResult`
- `EvalInput` has `intent: string` and `prompt: string` and optional `model?: string`
- `Score` has `clarity: number`, `intentAlignment: number`, `formatGuidance: number`, `robustness: number`, `overall: number` (all 1–5)
- `CritiqueResult` has `scores: Score`, `analysis: string[]`, `rewrites: [string, string]`
- `EvalResult` has `input: EvalInput`, `preview: string`, `critique: CritiqueResult`
- Types file has zero runtime code — types only
- Tests: type-level tests via `satisfies` to confirm shape is correct

---

### T3: Preview pass (src/preview.ts)
**Status**: pending  
**Dependencies**: T2  
**Acceptance criteria**:
- Exports `runPreview(input: EvalInput): Promise<string>`
- Creates an Anthropic client and calls `messages.create` with the user's prompt as a user message
- Returns the text content of the first response block
- Throws a descriptive `Error` if the API returns no content
- Unit tests: test the pure extraction logic (parse content block → string) without calling the API

---

### T4: Critique pass (src/critique.ts)
**Status**: pending  
**Dependencies**: T2  
**Acceptance criteria**:
- Exports `runCritique(input: EvalInput, preview: string): Promise<CritiqueResult>`
- Sends a structured meta-prompt to Claude with: intent, original prompt, and preview output
- Instructs Claude to return JSON with `scores`, `analysis` (array of strings), and `rewrites` (array of 2 strings)
- Parses the JSON response and returns a `CritiqueResult`
- Throws if JSON is malformed or missing required fields
- Unit tests: test JSON parsing and validation logic with fixture JSON strings (no API calls)

---

### T5: Evaluate orchestrator (src/evaluate.ts)
**Status**: pending  
**Dependencies**: T3, T4  
**Acceptance criteria**:
- Exports `evaluate(input: EvalInput): Promise<EvalResult>`
- Calls `runPreview` then `runCritique` in sequence
- Returns an `EvalResult` combining both
- Unit tests: mock `runPreview` and `runCritique` and verify orchestration order and output shape

---

### T6: Format (src/format.ts)
**Status**: pending  
**Dependencies**: T2  
**Acceptance criteria**:
- Exports `formatReport(result: EvalResult): string`
- Exports `scoreBar(score: number): string` — renders `█░` bars (5 chars)
- Output matches the report structure in SPEC.md Section 3
- Unit tests: given a known `EvalResult`, assert the formatted string contains expected substrings (header, score bars, rewrite markers)

---

### T7: CLI entrypoint (src/cli.ts)
**Status**: pending  
**Dependencies**: T5, T6  
**Acceptance criteria**:
- Parses `--intent`, `--prompt`, `--model`, `--json` flags via `minimist`
- Validates that `--intent` and `--prompt` are present; prints usage and exits with code 1 otherwise
- Calls `evaluate`, then either `formatReport` (default) or `JSON.stringify` (`--json` flag)
- Prints to stdout
- `package.json` `"bin"` field points to compiled CLI
- Unit tests: test arg parsing and validation logic (not the full API flow)

---

### T8: Skill file (skills/prompt-critic.md)
**Status**: pending  
**Dependencies**: T6  
**Acceptance criteria**:
- `skills/prompt-critic.md` is a valid Claude Code skill file
- Instructs Claude to ask for intent (if not provided) and prompt inline
- Runs the CLI via `npx prompt-critic` (or `node dist/cli.js`) and displays the output
- Includes install instructions as a comment at the top
- No automated tests needed — verified by reading the file

---

### T9: Test fixtures and integration tests
**Status**: pending  
**Dependencies**: T5  
**Acceptance criteria**:
- `fixtures/cases.ts` exports at least 3 `FixtureCase` objects: one poor prompt, one adequate, one strong
- Each has `intent`, `prompt`, and `expectedScoreRange: { min: number, max: number }` for overall
- `tests/evaluate.integration.test.ts` runs each fixture through `evaluate()` and asserts overall score is within range
- Integration tests are skipped by default (`test.skipIf(!process.env.ANTHROPIC_API_KEY)`)
- `npm run test:integration` sets the env var and runs all tests

---

## Dependency order

```
T1 (scaffold)
  └─ T2 (types)
       ├─ T3 (preview)  ─┐
       ├─ T4 (critique) ─┼─ T5 (evaluate) ─┬─ T7 (CLI)
       └─ T6 (format)   ─┘                 └─ T9 (integration)
T8 (skill) — after T6
```

**Execution order**: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9
