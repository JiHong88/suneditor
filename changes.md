### change

- Pasting from Word Online / Office 365 is detected by `msOffice.isMSOffice(html)` and cleaned with `msOffice.cleanHTML(html)`: empty `EOP`/`Selected` cursor spans, `OutlineElement`/`Paragraph` wrapper divs, `data-ccp-*` / `data-contrast` attributes, and default `color: windowtext` are stripped, and `<font>` tags are converted to styled `<span>` elements (#1717) (`helper/msOffice`, `core/event/eventOrchestrator`)
