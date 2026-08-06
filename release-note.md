## 3.3.0

### Design

* Redesigned the full editor icon set.
* Increased the corner rounding (`border-radius`) across the editor UI for a rounder look.

### New Feature

* A `lineBreakClearStyle` option has been added — when `true`, pressing Enter at the end of a line starts a fresh line without carrying the caret's inline style nodes (bold, italic, color, links); the line-level element and its attributes are preserved. Affects the end-of-line case only.
* `toolbar_sticky` option now accepts a `position: 'sticky' | 'fixed'` field (default `'sticky'`); `'fixed'` forces the JS `position: fixed` sticky engine over native CSS `position: sticky` for environments where CSS sticky misbehaves.
* `placeholder_line` option now accepts an object for per-type hints, keyed by tag name (`pre`, `blockquote`, ...) or a category sentinel (`@line`, `@normalLine`, `@list`, `@brLine`, `@closureBrLine`, `@block`, `@closureBlock`), resolved most-specific to least. The string form is unchanged.
* A `menu.subscribeDropdownOff(callback)` method has been added to subscribe to dropdown-off events; it returns an unsubscribe function.

### Enhancement

* Added `Esc` key support to close open toolbar dropdown menus, including dropdown-free menus like fontColor.
* Updated the table cell controller so the unmerge button is hidden instead of disabled when there are no merged cells, matching the merge/split button toggle.

### Bugfix

* Fixed an issue where the off-screen focus-temp input (`.__se__focus__temp__`) was a keyboard tab stop; it is now `tabindex="-1"` and no longer reachable by Tab. [#1677](https://github.com/JiHong88/suneditor/issues/1677)
* Fixed a bug where the finder toolbar button did not toggle the finder panel closed when pressed again.
* Fixed an issue where pressing Enter on an empty line inside a block (e.g. `<blockquote>`) with content below placed the new line and caret below the lower chunk instead of between the two chunks.
* Fixed an issue where opening a dropdown-free plugin's sub-panel from the command menu (e.g. fontColor's color-picker hue slider) closed the entire menu; the flyout now closes only when the plugin commits.
