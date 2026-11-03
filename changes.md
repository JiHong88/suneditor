### feat

- Typing `>` then Space at the start of a line turns it into a blockquote, like `1.` / `*.` + Space make a list (inside a blockquote it nests one); turn it off with `shortcuts: { blockquote: undefined }` (`plugins/command/blockquote`)

### fix

- Editing a link's display text keeps the inline formatting that wraps the whole link text (e.g. `<a><b><i>text</i></b></a>`, a font applied to the link text) instead of replacing it with plain text, and the link text is selected again afterwards whatever wrappers it holds (`modules/ui/ModalAnchorEditor`, `plugins/modal/link`)
- Dropping a dragged selection onto itself (a click that drifts a few pixels on selected text) no longer moves the text to the start of the line or empties a link; a moved selection lands where it was dropped, also when removing it rewrote or took out the text under the drop point, instead of at a stale offset (`core/event/handlers/handler_ww_dragDrop`, `core/event/eventOrchestrator`)
- Dropping onto a component (an image, a video, an inline component, a math formula) puts the content beside it, on the side the pointer is over, and the drag cursor shows that spot, instead of inside the component, which broke it or removed it with the rest of the content; below the last block component it goes into a new line (`core/event/handlers/handler_ww_dragDrop`)
- Pasting or dropping over a selection that leaves only whitespace in its text (e.g. `a&nbsp;` with `a` selected) keeps that whitespace, its inline formatting and its line, instead of removing them and inserting on the next line or at the line end (`core/logic/dom/html`)
- `$.eventManager.addEvent()`/`removeEvent()` given an iframe window that holds frames (e.g. an `iframe`-mode editor with a video embed) uses that window instead of throwing a `SecurityError` or listening on the embedded frame, and an empty `NodeList` returns `null` instead of throwing (`core/config/eventManager`)
- `html.clean()` / `html.compress()` (used by `html.set`, paste, code view and markdown view) turn a line break inside text into a space instead of deleting it, which joined the words, and a line break inside a `PRE` (brLine) into `<br>` instead of removing it, so Markdown code blocks keep their lines; code view no longer adds layout line breaks or indentation inside a `PRE`, so its rows survive a toggle (`core/logic/dom/html`)
- Markdown view and `jsonToMarkdown()` keep the lines of a code block written in the editor (`<br>` in `PRE`) instead of joining them (`helper/markdown`)
- Markdown view and `jsonToMarkdown()` escape `]` in text only where it would form syntax (before `(` or `:`, closing a task box `[ ]` / `[x]`) instead of everywhere, so `The [Name] Collection` stays as written; inside link text and an image `alt` both `[` and `]` are escaped (an `alt` was not escaped at all), so `<a>a [b] c</a>` and `alt="a]b"` survive a Markdown round trip and read the same in GFM; `markdownToHtml()` reads a link or image text with balanced `[...]` pairs as CommonMark does and no longer joins `[a [b](u)` into one link (`helper/markdown`)
- `editor.destroy()` with CodeMirror enabled (`externalLibs.codeMirror`) no longer throws `TypeError: textarea.parentNode is null` from CodeMirror's `toTextArea()`, which skipped the rest of the teardown (toolbar, global listeners); `destroy()` no longer calls `toTextArea()`, since the CodeMirror wrapper is removed with the editor (`core/editor`)
- Code view and markdown view hide the block handle gutter (`.se-block-handle-area`), which stayed on the side of the source frame and narrowed it (`assets/suneditor.css`)

### change

- The balloon toolbar and the controllers (link, image, table, math, audio, file) no longer draw a pointer arrow toward their target; they float on their shadow; the balloon toolbar and the anchor popup sit 10px from the selection (was 12px) and element-anchored controllers keep their 8px gap. The `.se-arrow` element stays in the markup, hidden, and still sets that gap, so custom controllers keep requiring it (`assets/suneditor.css`). To keep drawing the pointer, add after the editor CSS:
    ```css
    .sun-editor .se-arrow:not(.se-arrow-visible-hidden),
    .sun-editor .se-arrow:not(.se-arrow-visible-hidden)::after {
    	visibility: visible;
    	border-left-width: 12px;
    	border-right-width: 12px;
    	margin-left: -12px;
    }
    ```
- Dark-family themes (`dark`, `midnight`, `cobalt`): toolbar/menu buttons in the `.on` / `.active` state now get a visibly tinted fill with a bright accent icon instead of a near-background fill with a darker-than-fill icon.
- An `iframe_attributes.sandbox` value is kept as given, with only `allow-same-origin` added, instead of also getting `allow-scripts`; leave out `allow-scripts` only if the editor need not work in Safari or iOS browsers (an error is logged there) (#1716) (`core/section/constructor`)
