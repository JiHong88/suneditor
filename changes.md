### changes

- Components (image, table, hr, pageBreak) now treated as atomic units in tree traversal — not traversed into even when checking deepest child nodes (`helper/dom/domQuery`)

### fix

- Backspace/Delete not removing an empty list cell when the caret sits on its `<br>` (`core/event/rules/keydown.rule.backspace`, `keydown.rule.delete`) #1681
- Delete did nothing on an empty list cell — the nested-list branch claimed the key without having anything to lift, blocking the empty-line merge behind it (`core/event/rules/keydown.rule.delete`)
- Delete did nothing on a line before a list, and at the end of the last list cell the following line was not pulled up — edge decisions now use the next/previous line in document order instead of local siblings (`core/event/rules/keydown.rule.delete`, `keydown.rule.backspace`)
