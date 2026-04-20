---
name: review
description: 코드 리뷰 — 버그, 로직 오류, dead code 검출
---

Review the specified file(s) or current git diff for bugs, logic errors, and dead code.

Target: `$ARGUMENTS` (file path, or blank for current diff)

Steps:
1. If arguments provided, read those files. Otherwise run `git diff` to get current changes.
2. Exclude `test/dev/` files from review — they are local dev-only and not review targets.
3. Analyze for:
   - Logic bugs (off-by-one, null access, race conditions)
   - Dead code (unreachable branches, unused variables)
   - Missing edge cases
4. Report findings with file path and line numbers.
5. Do NOT fix anything — report only. Let the user decide what to fix.

Review guidelines — avoid false positives:
- **Null/guard checks**: If a null check already exists upstream in the call chain (caller side), do NOT flag the callee for lacking its own null guard. Only flag if there is a realistic unguarded path.
- **Intentional patterns**: If code looks intentional and consistent with surrounding patterns, do NOT report it as a bug. If unsure, note it as a confirmation question (e.g. "의도된 동작인지 확인: ...") rather than a bug.
- **Severity filtering**: Only report issues that could actually cause incorrect behavior or crashes. Do not report style preferences, hypothetical future risks, or "would be nice" improvements.
- **staged/unstaged diff**: Do not flag git staging state differences as findings.
