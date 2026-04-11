---
name: changes
description: 수동 코드 수정 후 changes.md에 누락된 변경사항 추가
---

The user has manually modified code and needs `changes.md` updated.
(When Claude modifies code, `changes.md` is updated automatically per CLAUDE.md instructions. This skill is only for user-initiated changes.)

Follow the rules defined in `prompts/changes-guide.md` exactly.

Steps:
1. Read `prompts/changes-guide.md` for formatting rules
2. Run `git diff --staged` and `git diff` to find current changes
3. If no changes found, run `git diff HEAD~1` for the last commit
4. Read the current `changes.md`
5. Analyze the diff — classify each user-facing change as `feat`, `fix`, `change`, or `breaking`
6. Skip internal-only changes (`style`, `docs`, `test`, `chore`, `ci`, `build`)
7. Add new entries to the appropriate section in `changes.md` (do not duplicate existing entries)
8. If unsure about a change's classification, ask before adding
