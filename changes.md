### feat

- Added row/column move commands to the table's row and column menus — moving a row or column steps it over its neighbour, and a merged region travels as one block instead of being torn apart. A direction with nothing left to move over is greyed out (`plugins/dropdown/table`)
- Added row/column drag-move handles to the table — while the table is hovered or selected, a handle appears left of the hovered row and above the hovered column (sized to the merged block when cells are merged); dragging it shows a drop indicator on the nearest legal position and drops the whole row/column there. Escape cancels the drag (`plugins/dropdown/table`)
- Clicking a table move handle selects (pins) the whole row/column and opens its menu on the grip — the row/column menu plus cell properties and merge (multi-cell) or split (single cell). Clicking the pinned band again, pressing Escape, or clicking a cell releases it (`plugins/dropdown/table`)
- Added a `nonDragHandle` option to `Figure.open()` — a plugin can suppress the component drag handle for that open (the table uses it on hover, where the handle would overlap the column move handle) (`modules/contract/Figure`)

### fix

- SelectMenu no longer mistakes a DOM-node item for a submenu config — a node item with child elements (e.g. a heading in the anchor bookmark list) was rendered as a broken submenu instead of a plain row (`modules/ui/SelectMenu`)
