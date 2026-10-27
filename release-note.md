## 3.4.1

### Design

* Added the `paragraph`, `heading` and `heading_1`-`heading_6` icons, shown on the built-in paragraph and heading menu items.

### New Feature

* `CommandMenuItem` now accepts `children` to show a submenu in the block handle and slash command menus.
* `slashCommand.items` now accepts the built-in block items (`p`, `h1`-`h6`, `heading`, `ul`, `ol`, `list`, `blockquote`, `pre`), which work without a plugin.

### Enhancement

* Added the `dom.check.hasMediaOrTable()` helper.
* Added a link to the matching Troubleshooting entry to the "plugin not found" and "target not found" errors.
* Added `env.TROUBLESHOOTING_URLS` and `env.GUIDE_EXTERNAL_LIBRARIES_URL` for the documentation links used in error messages.

### Bugfix

* Fixed an issue where switching to Markdown View lost inline whitespace, punctuation adjacency and ordered-list start numbers. [#1711](https://github.com/JiHong88/suneditor/issues/1711)
* Fixed an issue where lists with a negative start number and multiline inline formatting were not preserved in Markdown round trips.
* Fixed a bug where `converter.htmlToJson` and `html.getJson` dropped whitespace from text content.
* Fixed an issue where adjacent or space-padded emphasis was not kept inline in Markdown round trips.
* Fixed an issue where line breaks were lost or turned into Markdown blocks in Markdown round trips.
* Fixed an issue where Markdown parsing ignored hard line breaks and empty list items, lost escapes in link text, and treated a paragraph starting with inline HTML as an HTML block.
* Fixed an issue where text containing Markdown syntax such as `2*3*4` or `<b>` turned into formatting, links or HTML after a Markdown round trip.
* Fixed a bug where a split list copied the original `start` number instead of restarting its numbering.
* Fixed a bug where applying a block such as a blockquote to list items moved them after the rest of the list.
* Fixed a bug where inserting a component such as a horizontal rule in a list item created a list item inside it.
* Fixed an issue where splitting a list cleared a line that held only an image or other media.
* Fixed a bug where `editor.events` was `undefined` since 3.3.3, so assigning a handler such as `editor.events.onChange` threw an error.
* Fixed an issue where the documented built-in block handle menu items were missing and the default menu did not open when `blockHandle.menu` was not set.
* Fixed a bug where `blockStyle` dropped the `'pre'` and `'div'` entries in `items`.
* Fixed an issue where the External Libraries guide link in the math and CodeMirror warnings pointed to the wrong repository.

### Breaking Changes

* `listFormat.applyNested(cells, nested)` now indents when `nested` is `true` and outdents when it is `false`, the reverse of before; swap the boolean in direct calls (`format.indent()`, `format.outdent()` and the Tab key are unaffected).
