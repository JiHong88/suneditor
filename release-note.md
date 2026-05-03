## 3.1.3

### Enhancement

- Support Popover API for floating UI elements (dialogs, dropdowns, controllers) to render above browser top-layer contexts such as Angular CDK Overlay. [#1639](https://github.com/JiHong88/suneditor/issues/1639)

- Added stable `id` and `autocomplete="off"` to generated form fields to suppress Chrome form diagnostics. [#1640](https://github.com/JiHong88/suneditor/pull/1640)
- Marked decorative line-number textareas as `aria-hidden` and removed from tab order

### Bugfix

- Fixed a bug where page height calculation did not restart after a page break in document type mode
- Fixed a bug where anchor wrappers were lost when changing image format between inline and block styles. [#1636](https://github.com/JiHong88/suneditor/issues/1636)

### Breaking Changes

- Minimum supported Firefox version changed from 121 to 125 (required for Popover API)
