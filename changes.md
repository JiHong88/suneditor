### change

- Pasting from Word Online / Office 365 is detected by strong Office markers in `msOffice.isMSOffice(html)` and cleaned with `msOffice.cleanHTML(html)`: empty `EOP`/`Selected` cursor spans, `OutlineElement` wrapper divs, `data-ccp-*` / `data-contrast` attributes, and non-anchor `color: windowtext` are stripped, blank paragraphs are preserved, and `<font>` tags are converted to styled `<span>` elements with inline style precedence (#1717) (`helper/msOffice`, `core/event/eventOrchestrator`)
