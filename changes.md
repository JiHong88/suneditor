### feat

- `menu.subscribeDropdownOff(cb)`: subscribe to dropdown-off events, returns an unsubscribe (mirrors `store.subscribe()`) (`src/core/logic/panel/menu.js`)

### fix

- CommandMenu (slashCommand / blockHandle): opening a dropdown-free plugin's sub-panel — e.g. fontColor's color-picker hue slider — no longer closes the whole menu; the flyout now closes only when the plugin commits (`src/modules/ui/CommandMenu.js`, `src/core/logic/panel/menu.js`)
