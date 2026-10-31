### feat

- Typing `>` then Space at the start of a line turns it into a blockquote, like `1.` / `*.` + Space make a list (inside a blockquote it nests one); turn it off with `shortcuts: { blockquote: undefined }` (`plugins/command/blockquote`)

### enhance

- `msOffice`: detect Word Online/Office 365, strip EOP/Selected cursor markers, unwrap OutlineElement wrappers, and sanitize legacy font tags (`helper/msOffice`, `core/event/eventOrchestrator`)

### fix

- Editing a link's display text keeps the inline formatting that wraps the whole link text (e.g. `<a><b><i>text</i></b></a>`, a font applied to the link text) instead of replacing it with plain text, and the link text is selected again afterwards whatever wrappers it holds (`modules/ui/ModalAnchorEditor`, `plugins/modal/link`)
- Dropping a dragged selection onto itself (a click that drifts a few pixels on selected text) no longer moves the text to the start of the line or empties a link; a moved selection lands where it was dropped, also when removing it rewrote or took out the text under the drop point, instead of at a stale offset (`core/event/handlers/handler_ww_dragDrop`, `core/event/eventOrchestrator`)
- Dropping onto a component (an image, a video, an inline component, a math formula) puts the content beside it, on the side the pointer is over, and the drag cursor shows that spot, instead of inside the component, which broke it or removed it with the rest of the content; below the last block component it goes into a new line (`core/event/handlers/handler_ww_dragDrop`)
- Pasting or dropping over a selection that leaves only whitespace in its text (e.g. `a&nbsp;` with `a` selected) keeps that whitespace, its inline formatting and its line, instead of removing them and inserting on the next line or at the line end (`core/logic/dom/html`)
- `$.eventManager.addEvent()`/`removeEvent()` given an iframe window that holds frames (e.g. an `iframe`-mode editor with a video embed) uses that window instead of throwing a `SecurityError` or listening on the embedded frame, and an empty `NodeList` returns `null` instead of throwing (`core/config/eventManager`)

### change

- An `iframe_attributes.sandbox` value is kept as given, with only `allow-same-origin` added, instead of also getting `allow-scripts`; leave out `allow-scripts` only if the editor need not work in Safari or iOS browsers (an error is logged there) (#1716) (`core/section/constructor`)
