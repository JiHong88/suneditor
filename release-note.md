## 3.2.4

### Bugfix

* Fixed a bug where the caret was not scrolled into view after Backspace when deleting a character or merging a line at the edge of the viewport.
* Fixed a bug where Backspace or Delete broke deletion when the caret container was the line element instead of a text node.
* Fixed a bug where the per-line placeholder (`placeholder_line`) lingered on multiple lines after a batched multi-line insert.
