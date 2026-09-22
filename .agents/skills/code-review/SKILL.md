---
name: code-review
description: 코드 리뷰 — 버그, 로직 오류, 성능 회귀, 수명 관리 및 프로젝트 규칙 위반 검출
---

Review the specified file(s) or current git diff for bugs, logic errors, and dead code.

Target: `$ARGUMENTS` (file path, or blank for current diff)

Steps:
1. Read `AGENTS.md`, applicable rules and `prompts/coding-rules.md`. If arguments are provided, read those files. Otherwise inspect both `git diff` and `git diff --cached`, plus relevant untracked files from `git status --short`. Do not alter the index.
2. Exclude `test/dev/` files from review — they are local dev-only and not review targets.
3. Analyze for:
   - Logic bugs (off-by-one, null access, race conditions)
   - Dead code (unreachable branches, unused variables)
   - Missing edge cases in the changed path, including undo/cancellation/frame ownership
   - Avoidable repeated scans/serialization/layout on hot paths and work while the feature is inactive
   - Duplicate event registration, retained detached DOM, subscriptions/timers/observers/requests without effective cleanup
   - Reimplemented shared behavior, wrong history ownership, or import/API contract violations
   Read `prompts/performance-guide.md` for new features or performance-sensitive changes.
   Trace actual callers and cleanup before reporting a violation; legacy code is not automatically a template.
4. Report findings with file path and line numbers.
5. Do NOT fix anything — report only. Let the user decide what to fix.

Review guidelines — avoid false positives:
- **Null/guard checks**: If a null check already exists upstream in the call chain (caller side), do NOT flag the callee for lacking its own null guard. Only flag if there is a realistic unguarded path.
- **Intentional patterns**: If code looks intentional and consistent with surrounding patterns, do NOT report it as a bug. If unsure, note it as a confirmation question (e.g. "의도된 동작인지 확인: ...") rather than a bug.
- **Severity filtering**: Report concrete incorrect behavior, demonstrable resource/performance regressions, or a specific project contract violation on the changed path. Include the triggering scenario and source evidence; label unmeasured cost concerns as such. Do not report style preferences, hypothetical future risks, or "would be nice" improvements.
- **staged/unstaged diff**: Do not flag git staging state differences as findings.
