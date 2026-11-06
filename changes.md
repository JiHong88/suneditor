### change

- Pasting from Word Online / Office 365 is detected by strong Office markers in `msOffice.isMSOffice(html)` and cleaned with `msOffice.cleanHTML(html)`: empty `EOP`/`Selected` cursor spans, `OutlineElement` wrapper divs, `data-ccp-*` / `data-contrast` attributes, and non-anchor `color: windowtext` are stripped, blank paragraphs are preserved, and `<font>` tags are converted to styled `<span>` elements with inline style precedence (#1717) (`helper/msOffice`, `core/event/eventOrchestrator`)

### fix

- `html.get()` / `getContents()` no longer replaces a table cell with `<br>` when its only content is a component, an inline component in its line, or an `hr` — including a custom component recognized only by its plugin's `static component()`. The empty-line check behind Backspace/Delete merges, the blockquote shortcut and the line placeholder now treats such a line as content too (#1721, `helper/dom/domCheck`, `core/logic/dom/html`)
- The link modal now honors `link: { title: false, textToDisplay: false }` and hides those inputs; both were always shown (#1722, `plugins/modal/link`)
