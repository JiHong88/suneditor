### feat

- Browser plugins (`imageGallery`, `videoGallery`, `audioGallery`, `fileGallery`, `fileBrowser`): added `searchUrl` / `searchHeaders` options for server-side search (#1651)
- `embed` plugin: added `scriptSrcWhitelist` option to allow `<script src>` in raw HTML embeds via an explicit allowlist (#1649)

### fix

- Figure menu actions (alignment / block-inline toggle / preset resize) did not fire `onChange` (#1644)
- `tagStyles` entries were ignored when the tag was also matched by a category default (line / text)
- Embed: raw HTML path did not validate iframe `src` against the URL allowlist (`#checkContentType`), allowing arbitrary iframe URLs to bypass sanitization (#1649)

### breaking

- ⚠️ Removed `spanStyles` / `lineStyles` options — unified into `tagStyles` via the category sentinel keys `@text` / `@line`
    - Migration:
      ```js
      // Before
      { spanStyles: 'color|font-size', lineStyles: 'text-align|margin', tagStyles: { div: 'color' } }

      // After
      { tagStyles: { '@text': 'color|font-size', '@line': 'text-align|margin', div: 'color' } }
      ```
    - An explicit tag entry always wins over the category default (e.g. `tagStyles.div` is used even though `div` is a line element — `@line` is ignored for `div`)
- ⚠️ `embed` plugin: `<script>` tags in raw HTML embeds are now rejected by default — add trusted patterns to `scriptSrcWhitelist` to allow them (#1649)
    - Migration: for Twitter blockquote and similar embeds that require an external script, configure `pluginOptions.embed.scriptSrcWhitelist: [/^https:\/\/platform\.twitter\.com\/widgets\.js$/]`
- ⚠️ `embed` plugin: iframe `src` in raw HTML embeds is now validated against the registered URL patterns (`embedQuery`); non-matching URLs are rejected (#1649)
- ⚠️ `Browser` module (`modules/contract/Browser`): renamed `params.searchUrlHeader` → `params.searchHeaders`, internal field `urlHeader` → `headers` (#1651)
    - Impact: custom browser plugins that import `Browser` directly must update the option name and field reference
