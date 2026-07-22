## 3.2.3

### Enhancement

* Improved the per-line slash-command placeholder to no longer appear inside table cells.

### Bugfix

* Fixed a bug where the Enter key stopped working in environments that block `beforeinput` at runtime (some corporate security software, DLP, or VDI).
* Fixed a bug where percentage-sized media components (image, video, audio, iframe) reset to 100% after a code view toggle, `setValue`, or paste. [#1673]
* Fixed a bug where the block handle buttons were positioned slightly below the block's first line, making them harder to click.
* Fixed a bug where Shift+Enter (soft line break) did nothing on empty lines, split the paragraph on Safari, or stopped when the key was held.
* Fixed a bug where Backspace or Delete did not remove a soft line break (Shift+Enter) in a single press.
* Fixed a bug where some editor-internal buttons defaulted to `type="submit"` and submitted an enclosing `<form>` when clicked. [#1675]
* Fixed a bug where an empty heading line was serialized as a bare `####` in the markdown view.
