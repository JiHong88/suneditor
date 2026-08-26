---
name: release-note
description: changes.md를 릴리즈 노트 형식으로 변환
---

Read `changes.md` and write a release note to `release-note.md`.

Follow the style and rules defined in `prompts/release-note.md` exactly.

Steps:
1. Read `prompts/release-note.md` for formatting rules
2. Read `package.json` to get the current version
3. Read `changes.md` for current change entries
4. Read `release-note.md` for existing release notes
5. Rewrite every `changes.md` entry into the release note format — one sentence each, with the
   source-file references (`` (`core/logic/shell/ui`) ``), root cause, and internal identifiers
   removed. Never copy an entry through unchanged; see "Condense First" in the rules.
6. Write `## <version>` section to `release-note.md`
   - If the top section already has the same version, replace that section
   - If the top section has a different version, clear the entire file and write only the new version section
7. Clear `changes.md` contents (keep the file, empty the content)

Before writing, check the draft: no `` (`path/to/file`) `` references, no internal method or CSS
selector names, no item longer than one sentence.
