# Prompt Critic — Specification

## 1. Objective

A Claude Code skill and TypeScript CLI tool that evaluates a prompt against the user's stated intent using a **two-pass approach**:

1. **Preview pass** — run the prompt against Claude to get a real, ground-truth output
2. **Critique pass** — score the prompt and output against the intent across four axes, identify mismatches, and produce improved rewrites

**Target users**: everyone — developers, prompt engineers, and general Claude users who want to know whether their prompt will actually do what they mean before they commit to it.

---

## 2. Commands & Invocation

### Skill invocation (conversational)

```
/prompt-critic
```

Claude prompts the user for two things inline:

```
What's your intent? (what you actually want to accomplish)
> ...

What's your prompt? (what you wrote or plan to write)
> ...
```

The skill then runs the two-pass evaluation and prints a structured report.

### CLI invocation (for scripting / CI use)

```bash
npx prompt-critic --intent "..." --prompt "..."
```

Flags:
- `--intent` (required) — the goal in plain English
- `--prompt` (required) — the prompt text to evaluate
- `--model` (optional, default: `claude-sonnet-4-6`) — model to use for the preview pass
- `--json` (optional) — output raw JSON instead of formatted report

---

## 3. Evaluation Report Format

```
─────────────────────────────────────────
 PROMPT CRITIC REPORT
─────────────────────────────────────────

 INTENT
 "summarize a legal document for a non-lawyer"

 YOUR PROMPT
 "Summarize this document."

─────────────────────────────────────────
 PREVIEW (what the model actually produces)
─────────────────────────────────────────
 [real model output from running the prompt]

─────────────────────────────────────────
 SCORES
─────────────────────────────────────────
 Clarity & Specificity    2/5  ██░░░
 Intent Alignment         1/5  █░░░░
 Output Format Guidance   1/5  █░░░░
 Robustness               2/5  ██░░░
 ─────────────────────────
 Overall                  1.5/5

─────────────────────────────────────────
 ANALYSIS
─────────────────────────────────────────
 ✗ Clarity: "Summarize" gives the model no cues about depth, length, or audience.
 ✗ Intent alignment: The prompt never mentions the audience (non-lawyer) — the model
   produced legal jargon instead of plain language.
 ✗ Format: No output structure requested (bullets, length, sections).
 ~ Robustness: Will produce wildly different results across runs with no anchors.

─────────────────────────────────────────
 REWRITES
─────────────────────────────────────────
 [1] Summarize the following legal document in plain English for someone with no
     legal background. Use bullet points. Highlight any deadlines, obligations, or
     rights the reader should be aware of. Keep it under 300 words.

 [2] You are a plain-language translator. Read the legal document below and explain
     what it means to a non-lawyer in simple terms. Avoid jargon. Use short
     paragraphs. Focus on: what this agreement requires, what it restricts, and
     any important dates or penalties.
─────────────────────────────────────────
```

---

## 4. Scoring Rubric

Each axis is scored 1–5. Scores are integers.

| Score | Meaning |
|-------|---------|
| 1 | Missing / harmful to the intent |
| 2 | Weak — present but insufficient |
| 3 | Adequate — does the job but leaves room |
| 4 | Good — clear, specific, well-formed |
| 5 | Excellent — no obvious improvement possible |

### Axes

**Clarity & Specificity** — Is the prompt unambiguous? Does it give the model enough detail to act without guessing? Penalize vague verbs (summarize, help, analyze) without qualifiers.

**Intent Alignment** — Does the prompt actually ask for what the user stated as their intent? Penalize omissions of key context, audience, or goal that the intent named but the prompt dropped.

**Output Format Guidance** — Does the prompt specify how the output should be structured (length, format, tone, sections)? A prompt with no format guidance scores 1.

**Robustness** — Will the prompt produce consistent results across multiple runs and across slightly different inputs? Penalize ambiguity that would cause high variance.

**Overall** = average of the four axes, rounded to one decimal.

---

## 5. Project Structure

```
prompt-critic/
├── skills/
│   └── prompt-critic.md       ← Claude Code skill file
├── src/
│   ├── types.ts               ← shared types (EvalInput, EvalResult, Score)
│   ├── preview.ts             ← pass 1: run prompt, return raw output
│   ├── critique.ts            ← pass 2: score + mismatch analysis + rewrites
│   ├── evaluate.ts            ← orchestrates both passes
│   ├── format.ts              ← formats EvalResult into human-readable report
│   └── cli.ts                 ← CLI entrypoint (parses args, calls evaluate, prints)
├── tests/
│   ├── preview.test.ts
│   ├── critique.test.ts
│   ├── evaluate.test.ts
│   └── format.test.ts
├── fixtures/
│   └── cases.ts               ← known intent/prompt pairs with expected score ranges
├── SPEC.md
├── README.md
├── package.json
└── tsconfig.json
```

---

## 6. Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **AI**: `@anthropic-ai/sdk` — `claude-sonnet-4-6` for both passes
- **Testing**: Vitest
- **CLI parsing**: `minimist` (lightweight, no framework)
- **No build step for tests** — Vitest runs TypeScript natively via `--reporter=verbose`

---

## 7. Code Style

- Strict TypeScript — no `any`, explicit return types on all exported functions
- No comments unless the WHY is non-obvious
- Small, single-purpose functions — each file does one thing
- `EvalInput`, `EvalResult`, `Score` are the only shared data structures — no ad-hoc objects
- Errors surface as thrown `Error` with a descriptive message; no silent swallowing
- No retries, no fallbacks — if the API call fails, throw

---

## 8. Testing Strategy

- **Unit tests** (no API calls): scoring logic in `critique.ts`, formatting in `format.ts`
- **Integration tests** (real API calls, marked `// integration`): `preview.ts`, `evaluate.ts` end-to-end
- **Fixture-based**: `fixtures/cases.ts` defines known poor/good prompt pairs; integration tests assert score ranges (not exact values, since LLM output varies)
- Tests run with `npm test` (unit only by default); `npm run test:integration` adds real API calls
- No mocking of the Anthropic client in unit tests — instead, test pure functions that don't call the API

---

## 9. Boundaries

| Category | Rule |
|----------|------|
| Always | Show the raw preview output before the analysis |
| Always | Produce exactly 2 rewrites |
| Always | Show per-axis scores AND overall |
| Always | Explain each low score with a concrete reason |
| Ask first | If the intent is empty or fewer than 5 words |
| Ask first | If the prompt appears to be a system prompt (starts with "You are") — ask if they want the user-turn evaluated too |
| Never | Silently modify the user's prompt |
| Never | Use a model other than Claude for either pass |
| Never | Skip the preview pass — the critique must be grounded in real output |
| Never | Score higher than the weakest axis would support |

---

## 10. Installation (for users)

```bash
# Clone the repo
git clone https://github.com/nausherwannasir/prompt-critic
cd prompt-critic
npm install

# Add the skill to Claude Code
cp skills/prompt-critic.md ~/.claude/agent-skills/

# Set your API key
export ANTHROPIC_API_KEY=sk-...

# Use as a skill
/prompt-critic

# Or use the CLI directly
npx prompt-critic --intent "..." --prompt "..."
```
