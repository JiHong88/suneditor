### feat

- Added `blockHandle.onPlusClick` — runs after the plus button inserted a new line, so a host can decide what opens next. Inserting the line stays fixed behavior, and nothing opens by default. The context carries the new `block` plus an `openMenu()` helper for the block handle's own menu (`core/logic/panel/blockHandle`)
- Block handle is now shown for top-level components (image, table, ...) so they can be reordered like any other block; its handle button opens that component's own controller (`core/logic/panel/blockResolver`, `blockHandle`)
- Added `blockHandle.maxHeight` / `blockHandle.minWidth` and `slashCommand.maxHeight` / `slashCommand.minWidth` — the menu size was hardcoded and could not be configured (`core/logic/panel/blockHandle`, `plugins/field/slashCommand`)

### fix

- Fixed code view failing to close and dropping every image after the first when one inline wrapper held multiple images (`<span><img><img></span>`) (`modules/contract/Figure` - `retainFigureFormat`)
- Fixed the `plugins` option in array form (`plugins: [image, link]`) registering nothing, which made editor creation fail (`core/section/constructor`)
- Fixed `html.clean` leaving empty caret-less lines behind (a `<p></p>` with no `<br>`) (`core/logic/dom/html`)
- Fixed a dropdown-free flyout (table, fontColor, ...) staying open while the arrow keys kept walking the parent menu behind it (`modules/ui/SelectMenu`)
- Fixed a menu's sub-panel (submenu or dropdown-free flyout) tearing the whole menu down on the next keypress when a second `SelectMenu` existed.
- Fixed the text fields inside a dropdown-free flyout being unusable — the color picker's hex box could not be focused or typed into, and typing in it moved the caret back into the editor (`modules/ui/CommandMenu`)
- Fixed `textDirection: 'rtl'` scrambling the toolbar button group order. The groups were reordered in the DOM on top of the CSS mirroring (`.se-btn-tray { direction: rtl }`), so the groups were mirrored twice while the buttons inside each group were mirrored once. Both paths did it - at create time, and again in `ui.setDir` on every runtime direction switch, which also left the order scrambled after switching back to `ltr`. The DOM now keeps the order `buttonList` declares in both directions, and the user's `buttonList` array is no longer reversed in place (`core/section/constructor`, `core/logic/shell/ui`)

### change

- Fixed global (`window`) listeners surviving `destroy()` when the module that owned them never closed (an open menu or controller). They kept firing against the destroyed editor and threw (`core/config/eventManager`)
- Fixed picking a dropdown-free plugin (table, fontColor, ...) from the slash command menu with the keyboard: Enter closed the menu before the flyout could anchor to it, so the picker vanished and the plugin's dropdown was stranded outside the toolbar menu tray (`plugins/field/slashCommand`)
- `slashCommand.limitSize` now defaults to no limit (was `10`). The list scrolls within `maxHeight`, so a count cap only dropped matches the user could otherwise reach; set it explicitly to restore a cap (`plugins/field/slashCommand`)
- Fixed an exception thrown from a plugin `retainFormat` hook aborting the whole `html.clean` — the failing element is now skipped with a warning and the rest are still processed (`core/logic/shell/pluginManager`) #1679
