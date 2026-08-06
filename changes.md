### feat

- `menu.subscribeDropdownOff(cb)`: subscribe to dropdown-off events, returns an unsubscribe (mirrors `store.subscribe()`) (`src/core/logic/panel/menu.js`)

- `lineBreakClearStyle` option: when `true`, pressing Enter at the end of a line starts a fresh line without carrying inline style nodes (bold/italic/color/links); line-level element/attrs preserved.
  End-of-line only; mid-line splits, start-of-line breaks, and Shift+Enter unchanged (`src/core/event/effects/keydown.registry.js`)

- `toolbar_sticky` object form gains `position: 'sticky' | 'fixed'` (default `'sticky'`): `'fixed'` forces the JS `position: fixed` sticky engine over native CSS `position: sticky`, for environments where CSS sticky misbehaves and can't be feature-detected (`src/core/logic/panel/toolbar.js`)

- `placeholder_line` now accepts an object for per-type hints, keyed by tag name (`pre`, `blockquote`, ...) or a category sentinel matching the editor's format classification (`@line`, `@normalLine`, `@list`, `@brLine`, `@closureBrLine`, `@block`, `@closureBlock`), resolved most-specific → least like `tagStyles`. String form unchanged (`src/core/logic/shell/ui.js`, `src/core/config/optionProvider.js`)

- Toolbar dropdown menus now close on <kbd>Esc</kbd> (including dropdown-free menus like fontColor).

### fix

- Focus-temp input (`.__se__focus__temp__`) is now `tabindex="-1"` — no longer reachable by Tab (`src/core/section/constructor.js`) #1677

- Finder toolbar button now toggles

- Enter/Backspace/Delete: a key-rule branch with nothing to do now falls back to the browser's native behavior instead of a dead `preventDefault`.

- Enter on an empty line inside a block (e.g. blockquote) with content below now splits the block and puts the new line — and the caret — **between** the two chunks, instead of below the lower chunk (`src/core/event/effects/keydown.registry.js`)

- CommandMenu (slashCommand / blockHandle): opening a dropdown-free plugin's sub-panel — e.g. fontColor's color-picker hue slider — no longer closes the whole menu; the flyout now closes only when the plugin commits (`src/modules/ui/CommandMenu.js`, `src/core/logic/panel/menu.js`)

### change

- Table cell controller: the unmerge button is now hidden (not disabled) when there are no merged cells, matching the merge/split button's display toggle (`src/plugins/dropdown/table/services/table.cell.js`)
