### Breaking Changes

- The `mention` plugin has been replaced with a generic `autocomplete` plugin. Option key renamed from `mention` to `autocomplete`, per-trigger settings are now configured via the `triggers` object, `data-se-mention` → `data-se-autocomplete`, CSS class `.se-mention-item` → `.se-autocomplete-item`. [#713]

### New Feature

- Support MS Office HTML paste conversion (`src/helper/msOffice.js`).
    - MsoListParagraph → `<ol>`/`<ul>`/`<li>` conversion (nested lists, `list-style-type` detection)
    - `mso-outline-level` / `MsoHeading*` → `<h1>`–`<h6>` conversion
    - Table cleanup: removes `mso-yfti-*`, `mso-border-*`, `MsoTableGrid`; unwraps MsoNormal `<p>` inside cells
    - Track changes / comment removal (`<del>`, `<ins>`, `MsoCommentReference`, `MsoCommentText`)
    - `file:///` link/image removal, bookmark anchor cleanup
    - Page / section / column break handling, section wrapper unwrap
    - `mso-spacerun`, `mso-tab-count` → single space normalization
    - `mso-highlight` → `background-color` conversion
    - Soft hyphen and excessive `&nbsp;` removal

### Bugfix

- Fixed a bug where the toolbar was hidden on keypress in `balloonAlways` / `subBalloonAlways` mode. [#591]
- Fixed a bug where theme classes were included in print output, breaking print styles.
- Fixed a bug where switching folders in the file browser did not refresh the item list and tags, causing search and tag filters to operate on stale data.
- Fixed a bug where menu buttons in `layout` and `template` dropdown plugins were missing the `data-command` attribute, preventing click and keyboard selection from working.
- Fixed a bug where iframe mode did not work in Firefox — the sandboxed iframe's `load` event fired twice, clearing content and leaving buttons unresponsive.
