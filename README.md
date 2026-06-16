# prompt-critic

Evaluate a prompt against your intent before you commit to it — fully inside Claude, no setup.

It runs your prompt for real to get the actual output, then critiques both the prompt and that output against your stated intent: scoring five axes (including **token economy**) and producing two leaner, stronger rewrites. Because Claude is the model the prompt would run against, both passes happen in a single conversation turn — no clone, no build, no API key, no separate CLI calls.

## Install

Copy the skill into your Claude skills directory:

```bash
cp SKILL.md ~/.claude/skills/prompt-critic/SKILL.md
```

(or wherever your Claude Code skills live). That's the whole install.

## Use

In Claude:

```
/prompt-critic
```

Give it your intent and your prompt — or pass both at once:

```
/prompt-critic
intent:  summarize a legal doc for a non-lawyer
prompt:  Summarize this document.
```

You get back the real preview output, per-axis scores, a concrete analysis of every weak axis, and two rewrites:

```
─────────────────────────────────────────────────
 PROMPT CRITIC REPORT
─────────────────────────────────────────────────
 INTENT       "summarize a legal doc for a non-lawyer"
 YOUR PROMPT  "Summarize this document."

 PREVIEW  (what the model actually produces)
 [real model output]

 SCORES
 Clarity & Specificity    2/5  ██░░░
 Intent Alignment         1/5  █░░░░
 Output Format Guidance   1/5  █░░░░
 Robustness               2/5  ██░░░
 Token Economy            3/5  ███░░
 ─────────────────────────────────
 Overall                  1.8/5
 ...
```

## Scoring axes

| Axis | What it measures |
|------|------------------|
| Clarity & Specificity | Unambiguous? Enough detail to act without guessing? |
| Intent Alignment | Does it ask for what you actually meant? |
| Output Format Guidance | Specifies length, structure, tone? |
| Robustness | Consistent across runs and inputs? |
| Token Economy | Does every token earn its place, or is it padded? |

Scores are integers 1–5; overall is the average, one decimal. The two rewrites are held to the same token-economy bar they're scored on.
