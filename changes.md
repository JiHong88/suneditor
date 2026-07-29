### feat

- `menu.subscribeDropdownOff(cb)`: subscribe to dropdown-off events, returns an unsubscribe (mirrors `store.subscribe()`) (`src/core/logic/panel/menu.js`)
- `lineBreakClearStyle` option: when `true`, pressing Enter at the end of a line starts a fresh line without carrying inline style nodes (bold/italic/color/links); line-level element/attrs preserved. End-of-line only; mid-line splits, start-of-line breaks, and Shift+Enter unchanged (`src/core/event/effects/keydown.registry.js`)
- `toolbar_sticky` object form gains `position: 'sticky' | 'fixed'` (default `'sticky'`): `'fixed'` forces the JS `position: fixed` sticky engine over native CSS `position: sticky`, for environments where CSS sticky misbehaves and can't be feature-detected (`src/core/logic/panel/toolbar.js`)

### fix

- CommandMenu (slashCommand / blockHandle): opening a dropdown-free plugin's sub-panel — e.g. fontColor's color-picker hue slider — no longer closes the whole menu; the flyout now closes only when the plugin commits (`src/modules/ui/CommandMenu.js`, `src/core/logic/panel/menu.js`)

### change

- Table cell controller: the unmerge button is now hidden (not disabled) when there are no merged cells, matching the merge/split button's display toggle (`src/plugins/dropdown/table/services/table.cell.js`)
