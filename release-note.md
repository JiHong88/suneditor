## 3.4.0

### New Feature

* An `allowedURLProtocols` option has been added to allow custom app links without disabling attribute filtering or permitting script protocols and non-image data URLs.
* Support moving table rows and columns through their menus while preserving merged cells.
* Support dragging table rows and columns to new positions while preserving merged cells.
* Support selecting a table row or column and opening its menu by clicking its move handle.
* A `nonDragHandle` option has been added to `Figure.open()` to hide the component drag handle.
* `cellControllerPosition` now accepts `'dot'` to open cell controls from a small launcher beside the selected cell.
* A `tableControllerPosition` option has been added to choose between a dot launcher and table controls.
* The `selection` and `escape` options have been added to `Controller` to control component selection and how Escape closes nested controls.
* Added `ui.closeAllControllers()` to close all controllers and clear component selection.
* Added `ui.isInsideController()`, `ui.getControllerAt()` and `ui.hasFloatingController()` for querying controller state.
* Added `component.isHoverSelected` to distinguish hover selection from explicit component selection.
* `Controller` now accepts `container: 'wrapper'` and a `place` callback for controls positioned inside the editor.
* Added `dom.check.isPopoverOpen()` to check popover visibility across supported and unsupported browsers. [#1703](https://github.com/JiHong88/suneditor/pull/1703) ([@Identity-labs](https://github.com/Identity-labs))
* Added `SunEditor.Module.<Name>.Instance` types for all public modules.

### Changes

* Raw embed HTML is now sanitized on insertion instead of only when reloaded; use `attributeWhitelist` and `allowedClassName` to preserve required widget attributes.
* Table and cell controls now default to dot launchers instead of opening automatically; set `tableControllerPosition: 'table'` and `cellControllerPosition: 'cell'` to restore the previous behavior.
* Table and cell border settings now default to a width of `2` and the editing area's text color when no border is set.

### Bugfix

* Fixed an issue where saving and reloading raw embed HTML could corrupt content or prevent the original input from being restored in the edit dialog.
* Fixed a bug where the font-size label stayed at “Size” with `fontSize.disableInput: true`, including when increment/decrement controls were enabled. [#1710](https://github.com/JiHong88/suneditor/pull/1710) ([@orshih6](https://github.com/orshih6))
* Fixed an issue where Enter or arrow keys could fail after the selected component was removed. [#1703](https://github.com/JiHong88/suneditor/pull/1703) ([@Identity-labs](https://github.com/Identity-labs))
* Fixed an issue where hovering or dragging table edges could fail when resize guides were unavailable. [#1703](https://github.com/JiHong88/suneditor/pull/1703) ([@Identity-labs](https://github.com/Identity-labs))
* Fixed an issue where hovering over controllers or opening submenus could fail in browsers without popover-state selector support. [#1703](https://github.com/JiHong88/suneditor/pull/1703) ([@Identity-labs](https://github.com/Identity-labs))
* Fixed an issue where loading a bare supported embed iframe failed to create an editable embed component.
* Fixed an issue where embed and video format-validation failures produced unhandled errors.
* Fixed a bug where special characters in bookmark searches caused the link dialog to fail.
* Fixed an issue where deselecting a component left its controllers partially open and prevented them from reopening correctly.
* Fixed a bug where closing a child controller prevented the selected component from being deselected by an outside click.
* Fixed a bug where dropdowns opened over their buttons instead of upward in bottom-toolbar modes.
* Fixed an issue where sticky bottom toolbars shifted the page while scrolling or appeared below the status bar.
* Fixed a bug where sticky bottom toolbars ignored the configured `toolbar_sticky` top offset near the editor's boundaries.
* Fixed a bug where pressing Escape in a select menu also closed its parent dialog or cleared the underlying component selection.
* Fixed a bug where table selection outlines and selected-cell styles flickered during selection or resizing.
* Fixed an issue where `SelectMenu` rendered DOM-node items containing child elements as broken submenus.
* Fixed a bug where the document page indicator drifted out of sync while scrolling.

### Security

* Fixed a vulnerability where iframe clipboard content could bypass HTML attribute sanitization. ([GHSA-q867-q2hw-f8gp](https://github.com/JiHong88/suneditor/security/advisories/GHSA-q867-q2hw-f8gp))
* Fixed a vulnerability where malformed namespaced tags could retain unsafe event handlers. ([GHSA-6pm3-2q9w-2926](https://github.com/JiHong88/suneditor/security/advisories/GHSA-6pm3-2q9w-2926))
* Fixed a vulnerability where encoded URL values could bypass protocol validation. ([GHSA-v4jx-8pj6-w4w8](https://github.com/JiHong88/suneditor/security/advisories/GHSA-v4jx-8pj6-w4w8))
* Fixed a vulnerability where raw HTML inserted through the embed plugin was not sanitized. ([GHSA-wxhr-f7jg-wphq](https://github.com/JiHong88/suneditor/security/advisories/GHSA-wxhr-f7jg-wphq))
* Hardened HTML sanitization so unsafe attributes and URLs are removed even when `strictMode.styleFilter` or `strictMode.attrFilter` is disabled.
* Hardened `allowedExtraTags` enforcement when `strictMode.tagFilter` is disabled, including full-page content and malformed HTML.
* Fixed a vulnerability where file-browser metadata and search results could execute untrusted HTML. ([GHSA-pwf4-x78x-9937](https://github.com/JiHong88/suneditor/security/advisories/GHSA-pwf4-x78x-9937))
* Fixed a vulnerability where bookmark headings in the link dialog could execute untrusted HTML. ([GHSA-5pp5-5qrp-vq56](https://github.com/JiHong88/suneditor/security/advisories/GHSA-5pp5-5qrp-vq56))
* Fixed a vulnerability where uploaded file names displayed by `fileUpload` could execute untrusted HTML. ([GHSA-2w4v-r3v4-f5h4](https://github.com/JiHong88/suneditor/security/advisories/GHSA-2w4v-r3v4-f5h4))
* Fixed a vulnerability where document-header content could execute untrusted HTML. ([GHSA-h9pq-57qf-vvfh](https://github.com/JiHong88/suneditor/security/advisories/GHSA-h9pq-57qf-vvfh))
* Hardened URL validation for `poster`, `xlink:href`, `background`, `cite`, `action` and `formaction` attributes.

### Translation

* Corrected the French labels for inserting table rows above and below.
* Corrected the French translation of “resize”. [#1692](https://github.com/JiHong88/suneditor/issues/1692)
