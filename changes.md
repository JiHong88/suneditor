### feat

- Added row/column move commands to the table's row and column menus — moving a row or column steps it over its neighbour, and a merged region travels as one block instead of being torn apart. A direction with nothing left to move over is greyed out (`plugins/dropdown/table`)
- Added row/column drag-move handles to the table — while the table is hovered or selected, a handle appears left of the hovered row and above the hovered column (sized to the merged block when cells are merged); dragging it shows a drop indicator on the nearest legal position and drops the whole row/column there. Escape cancels the drag (`plugins/dropdown/table`)
