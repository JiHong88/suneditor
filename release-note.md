## 3.1.4

### New Feature

* A `searchUrl` and `searchHeaders` option has been added to the `imageGallery`, `videoGallery`, `audioGallery`, `fileGallery`, and `fileBrowser` plugins for server-side search. [#1651](https://github.com/JiHong88/suneditor/issues/1651)
* A `scriptSrcWhitelist` option has been added to the `embed` plugin to allow `<script src>` in raw HTML embeds via an explicit allowlist. [#1649](https://github.com/JiHong88/suneditor/issues/1649)

### Bugfix

* Fixed a bug where Figure menu actions (alignment, block-inline toggle, preset resize) did not fire `onChange`. [#1644](https://github.com/JiHong88/suneditor/issues/1644)
* Fixed a bug where `tagStyles` entries were ignored when the tag was also matched by a category default (`@text` or `@line`)
* Fixed an issue in the `embed` plugin where the raw HTML path did not validate iframe `src` against the URL allowlist, allowing arbitrary iframe URLs to bypass sanitization. [#1649](https://github.com/JiHong88/suneditor/issues/1649)

### Breaking Changes

* Removed `spanStyles` / `lineStyles` options — unified into `tagStyles` via the category sentinel keys `@text` / `@line`. An explicit tag entry always wins over the category default (e.g. `tagStyles.div` is used even though `div` is a line element — `@line` is ignored for `div`).
    - Migration:
      ```js
      // Before
      { spanStyles: 'color|font-size', lineStyles: 'text-align|margin', tagStyles: { div: 'color' } }

      // After
      { tagStyles: { '@text': 'color|font-size', '@line': 'text-align|margin', div: 'color' } }
      ```
* `embed` plugin: `<script>` tags in raw HTML embeds are now rejected by default — add trusted patterns to `scriptSrcWhitelist` to allow them. [#1649](https://github.com/JiHong88/suneditor/issues/1649)
    - Migration: for Twitter blockquote and similar embeds that require an external script, configure `pluginOptions.embed.scriptSrcWhitelist: [/^https:\/\/platform\.twitter\.com\/widgets\.js$/]`
* `embed` plugin: iframe `src` in raw HTML embeds is now validated against the registered URL patterns (`embedQuery`); non-matching URLs are rejected. [#1649](https://github.com/JiHong88/suneditor/issues/1649)
* `Browser` module (`modules/contract/Browser`): renamed `params.searchUrlHeader` → `params.searchHeaders`, internal field `urlHeader` → `headers`. Custom browser plugins that import `Browser` directly must update the option name and field reference. [#1651](https://github.com/JiHong88/suneditor/issues/1651)
