### changes

- Components (image, table, hr, pageBreak) now treated as atomic units in tree traversal — not traversed into even when checking deepest child nodes (`helper/dom/domQuery`)
- An explicit `tagStyles` tag entry is now merged with its `@line`/`@text` category styles instead of replacing them, so category edits keep applying to tags with their own entry (`core/logic/dom/html`)
- perf: `innerHTML` serialize/reparse round-trips replaced with direct node moves in hot paths — document-type page-mirror sync (ran per edit), span unwrap in `clean()`, table-cell format wrap, line tag change, and list split/merge (`core/editor`, `core/logic/shell/ui`, `core/logic/dom/html`, `format`, `nodeTransform`)

### fix

- Styles the editor lifts onto a fully-styled list item (`font-family`, `font-size`, `color`, `font-weight`, `font-style`) were stripped on a clean round-trip — `li` now has its own `tagStyles` whitelist entry (`core/schema/options`) #1682
- Fixed a bug where the structure was broken when pasting into Google Docs. (googleDocs.js added) #1683
- `placeholder_line` hint overflowed past the line on right/center-aligned lines (it grew rightward from the caret) — the hint now spans the line, inheriting its alignment and padding (`assets/suneditor.css`)

- Backspace/Delete not removing an empty list cell when the caret sits on its `<br>` (`core/event/rules/keydown.rule.backspace`, `keydown.rule.delete`) #1681
- Delete did nothing on an empty list cell — the nested-list branch claimed the key without having anything to lift, blocking the empty-line merge behind it (`core/event/rules/keydown.rule.delete`)
- Delete did nothing on a line before a list, and at the end of the last list cell the following line was not pulled up — edge decisions now use the next/previous line in document order instead of local siblings (`core/event/rules/keydown.rule.delete`, `keydown.rule.backspace`)
