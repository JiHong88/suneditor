## 3.3.1

### New Feature

* A `blockHandle.onPlusClick` option has been added — a hook that runs after the plus button inserts a new line, letting the host decide what opens next.
* `blockHandle.maxHeight` / `blockHandle.minWidth` and `slashCommand.maxHeight` / `slashCommand.minWidth` options have been added to size the menu.
* A `table.insert(cols, rows)` method has been added to insert a table without going through the size picker.
* The block handle is now shown for top-level components (image, table, ...) so they can be reordered like any other block.

### Changes

* The default value of the `slashCommand.limitSize` option has been changed to no limit; set it explicitly to restore a cap.

### Bugfix

* Fixed a bug where code view failed to close and dropped every image after the first when a single inline wrapper held multiple images.
* Fixed a bug where the `plugins` option in array form (`plugins: [image, link]`) registered nothing and editor creation failed.
* Fixed an issue where cleaning HTML left behind empty lines that had no caret position.
* Fixed an issue where a dropdown-free flyout (table, fontColor, ...) stayed open while the arrow keys kept navigating the menu behind it.
* Fixed a bug where a menu's sub-panel closed the entire menu on the next keypress when a second menu existed.
* Fixed a bug where the text fields inside a dropdown-free flyout, such as the color picker's hex box, could not be focused or typed into.
* Fixed a bug where the table size picker inserted a table with no rows or columns when it was clicked before a size had been hovered.
* Fixed a bug where the toolbar button group order was scrambled when `textDirection` was set to `rtl`. [#1680](https://github.com/JiHong88/suneditor/issues/1680)
* Fixed a bug where global `window` listeners survived `destroy()` and kept firing against the destroyed editor.
* Fixed an issue where picking a dropdown-free plugin from the slash command menu with the keyboard made its picker vanish.
* Fixed a bug where an exception thrown from a plugin `retainFormat` hook aborted the entire HTML cleaning pass. [#1679](https://github.com/JiHong88/suneditor/issues/1679)
