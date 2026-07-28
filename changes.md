### feat

- `menu.subscribeDropdownOff(cb)`: subscribe to dropdown-off events, returns an unsubscribe (mirrors `store.subscribe()`) (`src/core/logic/panel/menu.js`)
- Customizable icon-size tokens in `size.css`: `--se-icon-size` (18px, main toolbar icons) and `--se-icon-size-command-menu` (16px, blockHandle/slashCommand menu icons) (`src/assets/design/size.css`)

### fix

- CommandMenu (slashCommand / blockHandle): opening a dropdown-free plugin's sub-panel — e.g. fontColor's color-picker hue slider — no longer closes the whole menu; the flyout now closes only when the plugin commits (`src/modules/ui/CommandMenu.js`, `src/core/logic/panel/menu.js`)

### change

- Table cell controller: the unmerge button is now hidden (not disabled) when there are no merged cells, matching the merge/split button's display toggle (`src/plugins/dropdown/table/services/table.cell.js`)
