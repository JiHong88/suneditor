### feat

- Added `blockHandle.onPlusClick` — runs after the plus button inserted a new line, so a host can decide what opens next. Inserting the line stays fixed behavior, and nothing opens by default. The context carries the new `block` plus an `openMenu()` helper for the block handle's own menu (`core/logic/panel/blockHandle`)
- Block handle is now shown for top-level components (image, table, ...) so they can be reordered like any other block; its handle button opens that component's own controller (`core/logic/panel/blockResolver`, `blockHandle`)

### fix

- Fixed code view failing to close and dropping every image after the first when one inline wrapper held multiple images (`<span><img><img></span>`) (`modules/contract/Figure` - `retainFigureFormat`)
- Fixed the `plugins` option in array form (`plugins: [image, link]`) registering nothing, which made editor creation fail (`core/section/constructor`)
- Fixed `html.clean` leaving empty caret-less lines behind (a `<p></p>` with no `<br>`) (`core/logic/dom/html`)
- Fixed a dropdown-free flyout (table, fontColor, ...) staying open while the arrow keys kept walking the parent menu behind it (`modules/ui/SelectMenu`)
- Fixed a menu's sub-panel (submenu or dropdown-free flyout) tearing the whole menu down on the next keypress when a second `SelectMenu` existed.
- Fixed arrow-key navigation in a scrollable menu (`maxHeight`, e.g. the slash command list) moving the cursor onto rows outside the visible area without scrolling to them (`modules/ui/SelectMenu`)

### change

- Fixed global (`window`) listeners surviving `destroy()` when the module that owned them never closed (an open menu or controller). They kept firing against the destroyed editor and threw (`core/config/eventManager`)
- Fixed picking a dropdown-free plugin (table, fontColor, ...) from the slash command menu with the keyboard: Enter closed the menu before the flyout could anchor to it, so the picker vanished and the plugin's dropdown was stranded outside the toolbar menu tray (`plugins/field/slashCommand`)
- Fixed an exception thrown from a plugin `retainFormat` hook aborting the whole `html.clean` — the failing element is now skipped with a warning and the rest are still processed (`core/logic/shell/pluginManager`) #1679
