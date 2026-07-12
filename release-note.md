## 3.2.0

### New Feature

* Support Block handle — line side handles provide hover, drag, and an action menu.
* `SelectMenu` now supports submenus.
* A `toolbar_innerWidth` and `innerWidth` option has been added.
* Support `slashCommand` plugin — a Notion/Tiptap-style command menu with a configurable trigger character (default `/`) and user-defined menu items.
* A `placeholder_line` option has been added — a Notion-style line placeholder shown at the cursor line when it is empty. When enabled together with `placeholder`, the line placeholder takes precedence on the focused empty line.

### Enhancement

* Unified dropdown plugin menu creation onto a shared method. `menu.initDropdownTarget(classObj, itemsOrNode, options?)` now accepts an `Array<DropdownItem>` in addition to the existing `Node` argument, generating `<button>`/`<li>` markup internally (the existing `Node` signature stays compatible). A `DropdownItem` follows the `{ command, value?, title, innerHTML, className?, attrs? }` schema, and the 10 built-in dropdown plugins (`align`, `blockStyle`, `font`, `hr`, `layout`, `lineHeight`, `list`, `paragraphStyle`, `template`, `textStyle`) were migrated to the new form.
* Coalesced the wysiwyg `mousemove` handler using `requestAnimationFrame`.
* Updated `SelectMenu` item hover/active colors to a blue tone.

### Bugfix

* Fixed a bug where a `pageBreak` component could not be deleted with Delete/Backspace after being selected. [#1670](https://github.com/JiHong88/suneditor/issues/1670)
* Fixed a bug where the distributed types (`types/`) for `Hook.*` (component/modal/controller/browser/colorPicker/hueSlider) were broken.
* Fixed a bug where `SelectMenu` did not flip left/right in `left`/`right` mode due to mixed coordinate systems.
* Fixed a bug where bullet markers overflowed outside the list by changing `list-style-position` to `inside`.
* Fixed a bug where the controller did not hide when its target scrolled out of view inside `wysiwyg-inner`, or stayed stuck at the editor edge.
* Fixed a bug where the placeholder position was misaligned in `documentType`.
* Fixed a bug where pressing Enter on an empty line (a line containing only `<br>`) created a new line above and left the cursor on the original line — the cursor now moves to the new line for empty paragraphs, list items, and headings.
* Fixed a bug where pressing Enter with an active selection (including full-line or multi-line selections) left the cursor on the upper line instead of the lower line.
* Fixed a bug where backspace/delete did not work on empty lines (e.g. created via Enter) in Firefox. [#1671](https://github.com/JiHong88/suneditor/issues/1671)
* Fixed a bug where pasting into a table cell threw a JavaScript error and did nothing. [#1668](https://github.com/JiHong88/suneditor/issues/1668)
* Fixed a bug where whitespace-only text such as `&nbsp;` was removed during HTML cleanup. [#1667](https://github.com/JiHong88/suneditor/issues/1667)
* Fixed a bug where HTML cleanup (e.g. `value`) converted whitespace between block elements (`</p>\n<p>`) into a dead line without `<br>` (`<p></p>`), or left a line break after an in-line `<br>` (`<p><br>\n</p>`) as whitespace.
* Fixed a bug where pressing Enter on an empty line or in an empty editor duplicated the paragraph (in an empty editor the wysiwyg container itself was cloned). [#1657](https://github.com/JiHong88/suneditor/issues/1657)
* Fixed a bug where pressing Enter inside a `PRE` code block within a scroll-embedded editor scrolled to the whole `PRE` block instead of the line — scrolling now uses the actual cursor position after Enter.
