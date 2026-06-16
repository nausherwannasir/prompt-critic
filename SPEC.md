# Prompt Critic — Specification

## 1. Objective

A self-contained Claude skill that evaluates a prompt against the user's stated intent using a **two-pass approach that Claude runs itself, in one conversation turn**:

1. **Preview pass** — Claude responds to the prompt exactly as written to get a real, ground-truth output.
2. **Critique pass** — Claude scores the prompt and output against the intent across five axes, identifies mismatches, and produces two improved rewrites.

Claude is the model the prompt would run against, so there is no external tool and no second API call: the user is already talking to the model that can do both passes. That keeps the whole flow on the fewest tokens possible.

**Target users**: everyone — developers, prompt engineers, and general Claude users who want to know whether their prompt will actually do what they mean before they commit to it.

---

## 2. Invocation

```
/prompt-critic
```

Claude needs two inputs — the **intent** (what the user wants to accomplish) and the **prompt** (the text to evaluate). It accepts them inline:

```
What's your intent? (what you actually want to accomplish)
> ...

What's your prompt? (what you wrote or plan to send)
> ...
```

If the user supplies both in the invoking message (in any format), Claude parses them out without re-asking. If the intent is fewer than 5 words, Claude asks for a more specific one first. If the prompt looks like a system prompt ("You are…"), Claude asks whether to evaluate a user turn against it too.

---

## 3. Evaluation Report Format

```
─────────────────────────────────────────────────
 PROMPT CRITIC REPORT
─────────────────────────────────────────────────

 INTENT
 "summarize a legal document for a non-lawyer"

 YOUR PROMPT
 "Summarize this document."

─────────────────────────────────────────────────
 PREVIEW  (what the model actually produces)
─────────────────────────────────────────────────
 [real model output from running the prompt]

─────────────────────────────────────────────────
 SCORES
─────────────────────────────────────────────────
 Clarity & Specificity    2/5  ██░░░
 Intent Alignment         1/5  █░░░░
 Output Format Guidance   1/5  █░░░░
 Robustness               2/5  ██░░░
 Token Economy            3/5  ███░░
 ─────────────────────────────────
 Overall                  1.8/5

─────────────────────────────────────────────────
 ANALYSIS
─────────────────────────────────────────────────
 ✗ Clarity: "Summarize" gives the model no cues about depth, length, or audience.
 ✗ Intent alignment: The prompt never mentions the audience (non-lawyer) — the model
   produced legal jargon instead of plain language.
 ✗ Format: No output structure requested (bullets, length, sections).
 ✗ Robustness: Will produce wildly different results across runs with no anchors.
 ~ Token economy: Terse, but the few tokens it spends don't actually accomplish the
   intent — brevity here is under-specification, not efficiency.

─────────────────────────────────────────────────
 REWRITES
─────────────────────────────────────────────────
 [1] Summarize the legal document below in plain English for a non-lawyer. Use bullet
     points, under 300 words. Flag any deadlines, obligations, or rights.

 [2] You are a plain-language translator. Explain what the legal document below means
     to a non-lawyer — no jargon, short paragraphs. Cover: what it requires, what it
     restricts, and any important dates or penalties.
─────────────────────────────────────────────────
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

**Token Economy** — Does every token earn its place? Penalize padding, politeness theater, restated instructions, and over-specification that doesn't change the output. Lean *and* complete scores high; bloated scores low. Clarity and Token Economy pull against each other only if you let them — the target is maximum signal per token, where every token adds clarity and none is wasted.

**Overall** = average of the five axes, rounded to one decimal. The overall can't exceed what the weakest axis would justify.

---

## 5. Project Structure

```
prompt-critic/
├── SKILL.md      ← the self-contained skill (runs both passes itself)
├── README.md     ← install + usage
├── SPEC.md       ← this document
└── .gitignore
```

There is no source tree, build step, or dependency: the skill is a single Markdown file Claude executes directly.

---

## 6. Rewrite Goal

Both rewrites must (a) directly address the weaknesses found and (b) be **token-economical** — say everything the intent needs in as few tokens as possible. Both rewrites should be usable as-is. A rewrite that is stronger but flabby is a failure; rewrites are held to the same Token Economy bar they're scored on.

---

## 7. Boundaries

| Category | Rule |
|----------|------|
| Always | Show the raw preview output before the analysis |
| Always | Run the preview pass for real before scoring — the critique must be grounded in actual output |
| Always | Produce exactly 2 rewrites, both token-economical |
| Always | Show all five per-axis scores AND the overall |
| Always | Explain each below-4 score with a concrete reason tied to the preview |
| Ask first | If the intent is empty or fewer than 5 words |
| Ask first | If the prompt appears to be a system prompt (starts with "You are") — whether to also evaluate a user turn |
| Never | Silently modify the user's prompt |
| Never | Skip the preview pass |
| Never | Score an axis higher than the preview evidence supports |
| Never | Let the overall exceed what the weakest axis would justify |

---

## 8. Installation

```bash
cp SKILL.md ~/.claude/skills/prompt-critic/SKILL.md
```

Then invoke it in Claude:

```
/prompt-critic
```

No clone, no build, no API key.
