## 3.2.5

### Bugfix

* Fixed a bug where the caret was not scrolled into view after Backspace in additional delete and merge cases (selection delete, list merge, component delete, `<br>`-line, soft break, and empty-line merges).
* Fixed a bug where the caret could be hidden under the top sticky toolbar (`_toolbar_sticky`) when the editor was placed inside an outer scroll container.
* Fixed a bug where an already-visible caret was pulled downward on Backspace in auto-height mode after it had already cleared the top sticky toolbar.
