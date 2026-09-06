## 3.3.2

### Enhancement

* Improved editing performance in frequently-run operations such as content cleaning, line format changes, and list merging.

### Changes

* Components (image, table, hr, ...) are now treated as atomic units in tree traversal and are no longer traversed into.
* An explicit `tagStyles` tag entry is now merged with its `@line`/`@text` category styles instead of replacing them.

### Bugfix

* Fixed a bug where styles applied across an entire list item (`font-family`, `font-size`, `color`, ...) were stripped when the HTML was cleaned. [#1682](https://github.com/JiHong88/suneditor/issues/1682)
* Fixed a bug where the content structure was broken when pasting into Google Docs. [#1683](https://github.com/JiHong88/suneditor/issues/1683)
* Fixed a bug where the `placeholder_line` hint overflowed past the line on center- or right-aligned lines.
* Fixed a bug where Backspace and Delete did nothing on an empty list item. [#1681](https://github.com/JiHong88/suneditor/issues/1681)
* Fixed a bug where Delete did nothing on the line before a list and did not pull the following line up at the end of the last list item.
