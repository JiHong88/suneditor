### fix

- `html.get()` / `getContents()` no longer replaces a table cell with `<br>` when its only content is a component, an inline component in its line, or an `hr` — including a custom component recognized only by its plugin's `static component()`. The empty-line check behind Backspace/Delete merges, the blockquote shortcut and the line placeholder now treats such a line as content too (#1721, `helper/dom/domCheck`, `core/logic/dom/html`)
