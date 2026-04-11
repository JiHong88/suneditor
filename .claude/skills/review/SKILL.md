---
name: review
description: 코드 리뷰 — 버그, 로직 오류, dead code 검출
---

Review the specified file(s) or current git diff for bugs, logic errors, and dead code.

Target: `$ARGUMENTS` (file path, or blank for current diff)

Steps:
1. If arguments provided, read those files. Otherwise run `git diff` to get current changes.
2. Analyze for:
   - Logic bugs (off-by-one, null access, race conditions)
   - Dead code (unreachable branches, unused variables)
   - Missing edge cases
   - Inconsistencies with surrounding code patterns
3. Report findings with file path and line numbers
4. Do NOT fix anything — report only. Let the user decide what to fix.
