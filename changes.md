### enhance

- Kept the selection highlighted while the editor is blurred (modal, toolbar/dropdown inputs, clicks outside; not in iframe mode); color via `--se-selection-blur-color`, `transparent` to disable (`selection`)
- Added `dom.utils.injectStyle` to insert a `<style>` once per document or shadow root (`helper`)

### fix

- Fixed the style buttons (bold, underline, italic, strike, subscript, superscript) losing their `active` state after the styled text at the caret is deleted, while typing still produced styled text (#1731, `selectionState`)
- Fixed find/replace highlights not painted when the editor is inside a shadow root in Firefox and Safari (`finder`)
- Fixed printed lines in `document` type being wider than the editor page (#1728, `viewer`)
- Fixed the editor padding being added on top of the page margin when printing in `iframe_fullPage` mode with `editorStyle` (`viewer`)
