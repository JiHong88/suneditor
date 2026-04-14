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
5. Transform all `changes.md` entries into the release note format
6. Write `## <version>` section to `release-note.md`
   - If the top section already has the same version, replace that section
   - If the top section has a different version, clear the entire file and write only the new version section
7. Clear `changes.md` contents (keep the file, empty the content)
