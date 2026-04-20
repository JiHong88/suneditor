## 3.1.2

### Enhancement

* Updated design border-radius values

### Bugfix

* Fixed a bug where `textDirection`, `_editableClass`, and `printClass` options were not synchronized when switching to RTL via `setDir()`
* Fixed a bug where toolbar button order was not reversed when switching to RTL via `setDir()`
* Fixed a bug where shortcut tooltips were added as duplicates
* Fixed a bug where tooltips in `se-toolbar-bottom` toolbar did not appear above the toolbar
* Fixed RTL mode issues including missing wysiwyg `dir` attribute, arrow key component detection, bidi edge correction for Enter/Backspace/Delete, empty line Backspace component selection, and modal input direction. [#1631](https://github.com/nicedoc/suneditor/issues/1631)
