# AGENTS.md

Primary entry point for AI coding agents working on this repository.
Tool-specific aliases (`CLAUDE.md`, `GEMINI.md`) redirect here.

---

> 📌 **Single Source of Truth:**
> **[GUIDE.md](./GUIDE.md)** is the project map. Follow its links to the owning contract;
> do not maintain parallel copies of architecture, coding or validation instructions.

---

## Always-On Rules

**Before any edit, read every rule in [`.agents/rules/`](./.agents/rules/).** They are hard
guardrails shared by all AI agents — git safety (never stage/commit without user approval),
generated-file protection, core-change and plugin conventions. Claude auto-loads the always-on
tier via `CLAUDE.md`; `component-model`, `keydown-edge-decisions` and `options-changes` are
on-demand — routed by the core-changes jump table, file-top notices and edit hooks — and are
**mandatory when the edit context matches**. Other agents must read the rules at session start.

## Implementation Workflow

1. Read all `.agents/rules/` and `prompts/editing-rules.md`; inspect staged and unstaged changes.
   Use `GUIDE.md` for orientation and read the relevant sections. Read the full architecture
   for broad structural changes, not every documentation or test edit.
2. For source changes, read `prompts/coding-rules.md` and trace the closest sibling implementation,
   its shared APIs, callers and cleanup. For new features or hot-path changes, read
   [prompts/performance-guide.md](./prompts/performance-guide.md).
3. Reuse the existing owner before introducing helpers or abstractions. Preserve native editing,
   optional plugin cost, frame isolation and one history owner per logical edit.
4. Validate via [.agents/skills/post-edit/SKILL.md](./.agents/skills/post-edit/SKILL.md), selecting
   browser/performance checks for the changed behavior. Report checks actually run and limitations.

## Harness Ownership

- `AGENTS.md`: entry point and reading order; `CLAUDE.md` / `GEMINI.md`: thin aliases.
- `.agents/rules/`: concise always-on guardrails; `prompts/`: detailed task-specific contracts.
- `GUIDE.md`: navigation; `ARCHITECTURE.md`: architecture and rationale.
- `guide/testing.md`: test commands, CI coverage and performance budgets; the
  [post-edit skill](./.agents/skills/post-edit/SKILL.md) owns validation order by edit scope.
- `.agents/skills/`: project workflows; `.claude/skills` points here. Edit the shared files,
  not local backup directories. Use `code-review` for the project review skill (not an unrelated `review`).
- `.claude/settings.json` and `.codex/hooks.json` provide host-specific edit hooks; see
  [hook behavior and validation](./guide/testing.md#agent-edit-hooks). They supplement the shared workflow.
  If a host has no Skill tool, read the relevant `SKILL.md` and execute it with available tools.
- When changing a rule, update its aliases/examples and run `npm run check:harness` for links,
  skill metadata, aliases and command names; verify API behavior at its source.
  Existing code is evidence, not permission to copy a legacy exception. Resolve conflicts with
  the specific rule and executable implementation; do not claim a check enforces rules it does not.

## Editing Rules

**[prompts/editing-rules.md](./prompts/editing-rules.md)** owns generated-file protection,
language-file restrictions, three-file export sync and generation side effects.

## Coding Rules

Before writing or modifying any `.js` file under `src/`, read **[prompts/coding-rules.md](./prompts/coding-rules.md)**.
Defines the enforceable conventions: events through `eventManager`, DOM mutations through `$.html`/`$.format`/`$.inline`, state through `store`/`context`/`frameContext`, iframe-safe checks, history/onChange wiring, plugin and module shapes, layer/import boundaries.

## changes.md Update

After user-facing code changes, update [changes.md](./changes.md). Documentation/harness-only, test and internal-only changes are excluded by the changes guide.
Refer to [prompts/changes-guide.md](./prompts/changes-guide.md) for formatting rules.

## Release Note

When asked to write a release note, read [changes.md](./changes.md) and write a release note to [release-note.md](./release-note.md) following the style and rules in [prompts/release-note.md](./prompts/release-note.md).
Replace the entire contents of `release-note.md` with the generated release note.
