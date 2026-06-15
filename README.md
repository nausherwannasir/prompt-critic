# prompt-critic

Evaluate your prompt against your intent before you commit to it.

Uses a two-pass approach: first runs your prompt against Claude to get the real output, then critiques both the prompt and output against your stated intent — scoring four axes and producing two improved rewrites.

## Quick start

```bash
git clone https://github.com/nausherwannasir/prompt-critic
cd prompt-critic
npm install
npm run build
export ANTHROPIC_API_KEY=sk-...
```

### As a Claude Code skill

```bash
cp skills/skill.md ~/.claude/agent-skills/prompt-critic.md
```

Then in Claude Code:
```
/prompt-critic
```

### As a CLI

```bash
npx prompt-critic --intent "summarize a legal doc for a non-lawyer" --prompt "Summarize this document."
```

Output:
```
─────────────────────────────────────────────────
 PROMPT CRITIC REPORT
─────────────────────────────────────────────────
 INTENT
 "summarize a legal doc for a non-lawyer"

 YOUR PROMPT
 "Summarize this document."

─────────────────────────────────────────────────
 PREVIEW  (what the model actually produces)
─────────────────────────────────────────────────
[real model output]

─────────────────────────────────────────────────
 SCORES
─────────────────────────────────────────────────
 Clarity & Specificity    2/5  ██░░░
 Intent Alignment         1/5  █░░░░
 Output Format Guidance   1/5  █░░░░
 Robustness               2/5  ██░░░
 ─────────────────────────────────
 Overall                  1.5/5
...
```

## Options

| Flag | Description |
|------|-------------|
| `--intent` | What you actually want to accomplish (required) |
| `--prompt` | The prompt to evaluate (required) |
| `--model` | Claude model for preview pass (default: `claude-sonnet-4-6`) |
| `--json` | Output raw JSON instead of formatted report |

## Scoring axes

| Axis | What it measures |
|------|-----------------|
| Clarity & Specificity | Unambiguous? Enough detail? |
| Intent Alignment | Does it ask for what you meant? |
| Output Format Guidance | Specifies length, structure, tone? |
| Robustness | Consistent across runs? |

Scores are integers 1–5. Overall is the average, one decimal.

## Development

```bash
npm test                  # unit tests only (no API calls)
npm run test:integration  # includes real API calls (requires ANTHROPIC_API_KEY)
npm run build             # compile TypeScript to dist/
```
