### feat

- Added row/column move commands to the table's row and column menus — moving a row or column steps it over its neighbour, and a merged region travels as one block instead of being torn apart. A direction with nothing left to move over is greyed out (`plugins/dropdown/table`)
- Added row/column drag-move handles to the table — while the table is hovered or selected, a handle appears left of the hovered row and above the hovered column (sized to the merged block when cells are merged); dragging it shows a drop indicator on the nearest legal position and drops the whole row/column there. Escape cancels the drag (`plugins/dropdown/table`)
- Clicking a table move handle selects (pins) the whole row/column and opens its menu on the grip — the row/column menu plus cell properties and merge (multi-cell) or split (single cell). Clicking the pinned band again, pressing Escape, or clicking a cell releases it (`plugins/dropdown/table`)
- Added a `nonDragHandle` option to `Figure.open()` — a plugin can suppress the component drag handle for that open (the table uses it on hover, where the handle would overlap the column move handle) (`modules/contract/Figure`)
- Added a `dot` value to the table plugin's `cellControllerPosition` option — selecting a cell shows a small dot on the cell's right edge (left in RTL) instead of the cell controller; clicking the dot opens the controller anchored to it, clicking it again hides the controller (`plugins/dropdown/table`)
- Added a `tableControllerPosition` option to the table plugin (`'dot'` default, `'table'`) — with `dot`, selecting the table shows a dot on its top-left corner (top-right in RTL) instead of the table controller, and clicking the dot opens/hides the controller (`plugins/dropdown/table`)
- Added `SunEditor.Module.<Name>.Instance` types for every public module class (`Controller`, `Figure`, `SelectMenu`, `Modal`, `Browser`, `ColorPicker`, `HueSlider`, `CommandMenu`, `ModalAnchorEditor`, `ApiManager`, `FileManager`) — annotate a module instance passed between functions without a relative `import('…').default` path (`typedef`)

### change

- The table plugin's controllers now default to the dot launchers — `cellControllerPosition` and `tableControllerPosition` both default to `'dot'`, so selecting a table/cell shows a small dot instead of auto-opening the controllers. Pass `cellControllerPosition: 'cell'` (the previous default) or `'table'`, and `tableControllerPosition: 'table'` to restore the previous auto-open behavior (`plugins/dropdown/table`)

### fix

- SelectMenu no longer mistakes a DOM-node item for a submenu config — a node item with child elements (e.g. a heading in the anchor bookmark list) was rendered as a broken submenu instead of a plain row (`modules/ui/SelectMenu`)
- Fixed document-type page indicator drifting out of sync with the scroll position — page offsets accumulated an error on scroll and the current-page detection used stale positions (`core/section/documentType`)
- Fixed the French translation of `resize` (was Czech text) (`langs/fr`, #1692)
