# SunEditor Configuration Options

This document outlines the various configuration options available for SunEditor. These options allow for extensive customization of the editor's appearance, behavior, and available features.

## Default Value Constants

Many options use predefined constants for their default values. Here are their definitions:

-   **`DEFAULT_BUTTON_LIST`**:

    ```javascript
    [['undo', 'redo'], '|', ['bold', 'underline', 'italic', 'strike', '|', 'subscript', 'superscript'], '|', ['removeFormat'], '|', ['outdent', 'indent'], '|', ['fullScreen', 'showBlocks', 'codeView'], '|', ['preview', 'print']];
    ```

-   **`REQUIRED_FORMAT_LINE`**: `'div'`

-   **`REQUIRED_ELEMENT_WHITELIST`**: `'br|div'`

-   **`DEFAULT_ELEMENT_WHITELIST`**: `'p|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|colgroup|col|thead|tbody|tr|th|td|caption|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary'`

-   **`DEFAULT_TEXT_STYLE_TAGS`**: `'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary'`

-   **`DEFAULT_SCOPE_SELECTION_TAGS`**: `'td|table|li|ol|ul|pre|figcaption|blockquote|dl|dt|dd'`

-   **`_media_attr`**: `'|width|height|controls|autoplay|loop|muted|poster|preload|playsinline|volume|crossorigin|disableRemotePlayback|controlsList'` (Used within `DEFAULT_ATTRIBUTE_WHITELIST`)

-   **`_iframe_attr`**: `'|allowfullscreen|sandbox|loading|allow|referrerpolicy|frameborder|scrolling'` (Used within `DEFAULT_ATTRIBUTE_WHITELIST`)

-   **`DEFAULT_ATTRIBUTE_WHITELIST`**: `'contenteditable|target|href|title|download|rel|src|alt|class|type|colspan|rowspan' + _media_attr + _iframe_attr`

-   **`DEFAULT_FORMAT_LINE`**: `'P|H[1-6]|LI|TH|TD|DETAILS'`

-   **`DEFAULT_FORMAT_BR_LINE`**: `'PRE'`

-   **`DEFAULT_FORMAT_CLOSURE_BR_LINE`**: `''`

-   **`DEFAULT_FORMAT_BLOCK`**: `'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS'`

-   **`DEFAULT_FORMAT_CLOSURE_BLOCK`**: `'TH|TD'`

-   **`DEFAULT_ALLOWED_EMPTY_NODE_LIST`**: `'.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details'`

-   **`DEFAULT_SIZE_UNITS`**: `['px', 'pt', 'em', 'rem']`

-   **`DEFAULT_CLASS_NAME`**: `'^__se__|^se-|^katex|^MathJax'`

-   **`DEFAULT_CLASS_MJX`**: `'mjx-container|mjx-math|mjx-mrow|mjx-mi|mjx-mo|mjx-mn|mjx-msup|mjx-mfrac|mjx-munderover'`

-   **`DEFAULT_EXTRA_TAG_MAP`**: `{ script: false, style: false, meta: false, link: false, '[a-z]+:[a-z]+': false }`

-   **`DEFAULT_TAG_STYLES`**:

    ```javascript
    {
        'table|th|td': 'border|border-[a-z]+|color|background-color|text-align|float|font-weight|text-decoration|font-style|vertical-align|text-align',
        'table|td': 'width',
        tr: 'height',
        col: 'width',
        'ol|ul': 'list-style-type'
    }
    ```

-   **`DEFAULT_TEXT_STYLES`**: `'font-family|font-size|color|background-color'`

-   **`DEFAULT_LINE_STYLES`**: `'text-align|margin-left|margin-right|line-height'`

-   **`DEFAULT_CONTENT_STYLES`**: (A very long string including various CSS properties for content)
    `'background|background-clip|background-color|border|border-bottom|...|word-wrap'`

-   **`RETAIN_STYLE_MODE`**: `['repeat', 'always', 'none']` (Possible values for `retainStyleMode` option)

---

## Editor Frame Options (`EditorFrameOptions`)

These options define the editor's frame, dimensions, and iframe specific settings.

### `value`

-   **Description**: Initial value for the editor.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Fixed (Cannot be reset after initialization)

### `placeholder`

-   **Description**: Placeholder text.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `editableFrameAttributes`

-   **Description**: Attributes for the editable frame (`.sun-editor-editable`). (e.g. `[key]: value`)
-   **Type**: `Object<string, string>`
-   **Default**: `{}`
-   **Mutability**: Resettable

### `width`

-   **Description**: Width for the editor.
-   **Type**: `string`
-   **Default**: `"100%"`
-   **Mutability**: Resettable

### `minWidth`

-   **Description**: Min width for the editor.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `maxWidth`

-   **Description**: Max width for the editor.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `height`

-   **Description**: Height for the editor.
-   **Type**: `string`
-   **Default**: `"auto"`
-   **Mutability**: Resettable

### `minHeight`

-   **Description**: Min height for the editor.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `maxHeight`

-   **Description**: Max height for the editor.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `editorStyle`

-   **Description**: Style string of the top frame of the editor. (e.g. `"border: 1px solid #ccc;"`).
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `iframe`

-   **Description**: Content will be placed in an iframe and isolated from the rest of the page.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Fixed

### `iframe_fullPage`

-   **Description**: Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the "iframe".
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Fixed

### `iframe_attributes`

-   **Description**: Attributes of the "iframe". (e.g. `{'scrolling': 'no'}`)
-   **Type**: `Object<string, string>`
-   **Default**: `{}`
-   **Mutability**: Resettable

### `iframe_cssFileName`

-   **Description**: Name or Array of the CSS file to apply inside the iframe.
    -   You can also use regular expressions.
    -   Applied by searching by filename in the link tag of document,
    -   or put the URL value (".css" can be omitted).
-   **Type**: `string`
-   **Default**: `"suneditor"`
-   **Mutability**: Resettable

### `statusbar`

-   **Description**: Enables the status bar.
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Resettable

### `statusbar_showPathLabel`

-   **Description**: Displays the current node structure to status bar.
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Resettable

### `statusbar_resizeEnable`

-   **Description**: Enables resize function of bottom status bar.
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Fixed

### `charCounter`

-   **Description**: Shows the number of characters in the editor. If the `charCounter_max` option has a value, it becomes true.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Resettable

### `charCounter_max`

-   **Description**: The maximum number of characters allowed to be inserted into the editor.
-   **Type**: `number`
-   **Default**: `undefined` (no explicit default, implies no limit unless `charCounter` is set)
-   **Mutability**: Resettable

### `charCounter_label`

-   **Description**: Text to be displayed in the "charCounter" area of the bottom bar. (e.g. `"Characters : 20/200"`)
-   **Type**: `string`
-   **Default**: `undefined`
-   **Mutability**: Resettable

### `charCounter_type`

-   **Description**: Defines the calculation method of the "charCounter" option.
    -   `'char'`: Characters length.
    -   `'byte'`: Binary data size of characters.
    -   `'byte-html'`: Binary data size of the full HTML string.
-   **Type**: `"char"|"byte"|"byte-html"`
-   **Default**: `"char"`
-   **Mutability**: Resettable

---

## Editor Base Options (`EditorBaseOptions`)

These options control the core functionality, plugins, toolbar, styling, and content handling of the editor.

### `plugins`

-   **Description**: Plugin configuration.
-   **Type**: `Object<string, *>|Array<Object<string, *>>`
-   **Default**: `undefined`
-   **Mutability**: Fixed

### `excludedPlugins`

-   **Description**: Plugin configuration. List of plugin names to exclude.
-   **Type**: `Array<string>`
-   **Default**: `undefined` (empty array likely)
-   **Mutability**: Fixed

### `buttonList`

-   **Description**: List of toolbar buttons, grouped by sub-arrays.
-   **Type**: `Array<string[]|string>`
-   **Default**: `DEFAULT_BUTTON_LIST` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `v2Migration`

-   **Description**: Enables migration mode for SunEditor v2.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Fixed

### `strictMode`

-   **Description**: Enables strict filtering of tags, attributes, and styles. Can be a boolean or an object to configure specific filters.
-   **Type**: `boolean|{tagFilter: boolean, formatFilter: boolean, classFilter: boolean, textStyleTagFilter: boolean, attrFilter: boolean, styleFilter: boolean}`
-   **Default**: `true`
-   **Mutability**: Fixed

### `mode`

-   **Description**: Toolbar mode.
-   **Type**: `"classic"|"inline"|"balloon"|"balloon-always"`
-   **Default**: `"classic"`
-   **Mutability**: Fixed

### `type`

-   **Description**: Editor type. (e.g., `"document:header,page"`)
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Fixed

### `theme`

-   **Description**: Editor theme.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `lang`

-   **Description**: Language configuration.
-   **Type**: `Object<string, string>`
-   **Default**: `undefined` (Likely uses a default English pack internally if not specified)
-   **Mutability**: Fixed

### `fontSizeUnits`

-   **Description**: Allowed font size units.
-   **Type**: `Array<string>`
-   **Default**: `DEFAULT_SIZE_UNITS` (see [Default Value Constants](#default-value-constants) -> `['px', 'pt', 'em', 'rem']`)
-   **Mutability**: Fixed

### `allowedClassName`

-   **Description**: Allowed class names (regular expression).
-   **Type**: `string`
-   **Default**: `DEFAULT_CLASS_NAME` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `closeModalOutsideClick`

-   **Description**: Closes modals when clicking outside.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Fixed

### `copyFormatKeepOn`

-   **Description**: Keeps the format of the copied content.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Resettable

### `syncTabIndent`

-   **Description**: Synchronizes tab indent with spaces.
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Resettable

### `tabDisable`

-   **Description**: Disables tab key input.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Resettable

### `autoLinkify`

-   **Description**: Automatically converts URLs into hyperlinks. ("Link" plugin required)
-   **Type**: `boolean`
-   **Default**: `undefined` (likely false, depends on Link plugin)
-   **Mutability**: Resettable

### `autoStyleify`

-   **Description**: Styles applied automatically on text input.
-   **Type**: `Array<string>`
-   **Default**: `["bold", "underline", "italic", "strike"]`
-   **Mutability**: Resettable

### `scrollToOptions`

-   **Description**: Configuration for scroll behavior when navigating editor content.
-   **Type**: `Object<string, string|number>`
-   **Default**: `{behavior: "auto", block: "nearest"}`
-   **Mutability**: Resettable

### `componentScrollToOptions`

-   **Description**: Configuration for scroll behavior when navigating components.
-   **Type**: `Object<string, string|number>`
-   **Default**: `{behavior: "smooth", block: "center"}`
-   **Mutability**: Resettable

### `retainStyleMode`

-   **Description**: Determines how inline elements are handled when deleting text.
    -   `"repeat"`: Inline styles are retained unless backspace is repeatedly pressed.
    -   `"none"`: Inline styles are not retained.
    -   `"always"`: Inline styles persist until explicitly removed.
-   **Type**: `"repeat"|"always"|"none"`
-   **Default**: `"repeat"` (Possible values in `RETAIN_STYLE_MODE`)
-   **Mutability**: Resettable

### `allowedExtraTags`

-   **Description**: Specifies extra allowed or disallowed tags.
-   **Type**: `Object<string, boolean>`
-   **Default**: `DEFAULT_EXTRA_TAG_MAP` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `events`

-   **Description**: Custom event handlers.
-   **Type**: `Object<string, (...args: *) => *>`
-   **Default**: `{}`
-   **Mutability**: Resettable

### `__textStyleTags`

-   **Description**: The basic tags that serves as the base for "textStyleTags". (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_TEXT_STYLE_TAGS` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `textStyleTags`

-   **Description**: Additional text style tags.
-   **Type**: `string`
-   **Default**: `DEFAULT_TEXT_STYLE_TAGS` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `convertTextTags`

-   **Description**: Maps text styles to specific HTML tags.
-   **Type**: `Object<string, string>`
-   **Default**: `{bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}`
-   **Mutability**: Fixed

### `allUsedStyles`

-   **Description**: Specifies additional styles to the list of allowed styles. Delimiter: `|`.
-   **Type**: `string`
-   **Default**: `undefined`
-   **Mutability**: Fixed

### `__tagStyles`

-   **Description**: The basic tags that serves as the base for "tagStyles". (Internal use primarily)
-   **Type**: `Object<string, string>`
-   **Default**: `DEFAULT_TAG_STYLES` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `tagStyles`

-   **Description**: Specifies allowed styles for HTML tags.
-   **Type**: `Object<string, string>`
-   **Default**: `{}` (Extends `__tagStyles`)
-   **Mutability**: Fixed

### `spanStyles`

-   **Description**: Specifies allowed styles for the "span" tag.
-   **Type**: `string`
-   **Default**: `DEFAULT_TEXT_STYLES` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `lineStyles`

-   **Description**: Specifies allowed styles for the "line" element (p..).
-   **Type**: `string`
-   **Default**: `DEFAULT_LINE_STYLES` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `textDirection`

-   **Description**: Text direction: "ltr" or "rtl".
-   **Type**: `string`
-   **Default**: `"ltr"`
-   **Mutability**: Resettable

### `reverseButtons`

-   **Description**: An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
-   **Type**: `Array<string>`
-   **Default**: `['indent-outdent']`
-   **Mutability**: Fixed

### `historyStackDelayTime`

-   **Description**: Delay time for history stack updates (ms).
-   **Type**: `number`
-   **Default**: `400`
-   **Mutability**: Resettable

### `lineAttrReset`

-   **Description**: Line properties that should be reset when changing lines (e.g. `"id|name"`).
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `printClass`

-   **Description**: Class name for printing.
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Resettable

### `defaultLine`

-   **Description**: Default line element when inserting new lines.
-   **Type**: `string`
-   **Default**: `"p"`
-   **Mutability**: Fixed

### `defaultLineBreakFormat`

-   **Description**: Specifies the default line break format.
    -   `"line"`: [Recommended] Line break is a new block-level element.
    -   `"br"`: [Not recommended] Line breaks are `<br>` tags within the same block.
-   **Type**: `"line"|"br"`
-   **Default**: `"line"`
-   **Mutability**: Resettable

### `scopeSelectionTags`

-   **Description**: Tags treated as whole units when selecting all content.
-   **Type**: `Array<string>`
-   **Default**: `DEFAULT_SCOPE_SELECTION_TAGS` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Resettable

### `__defaultElementWhitelist`

-   **Description**: Default allowed HTML elements. The default values are maintained. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `REQUIRED_ELEMENT_WHITELIST` (see [Default Value Constants](#default-value-constants) -> `'br|div'`)
-   **Mutability**: Fixed

### `elementWhitelist`

-   **Description**: Allowed HTML elements. Delimiter: `|` (e.g. `"p|div"`, `"*"`).
-   **Type**: `string`
-   **Default**: `""` (Effectively means `DEFAULT_ELEMENT_WHITELIST` is used unless overridden)
-   **Mutability**: Fixed

### `elementBlacklist`

-   **Description**: Disallowed HTML elements. Delimiter: `|` (e.g. `"script|style"`).
-   **Type**: `string`
-   **Default**: `""`
-   **Mutability**: Fixed

### `__defaultAttributeWhitelist`

-   **Description**: Allowed attributes. Delimiter: `|`. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_ATTRIBUTE_WHITELIST` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `attributeWhitelist`

-   **Description**: Allowed attributes. (e.g. `{a: "href|target", img: "src|alt", "*": "id"}`).
-   **Type**: `Object<string, string>`
-   **Default**: `""` (Effectively means `DEFAULT_ATTRIBUTE_WHITELIST` is used unless overridden)
-   **Mutability**: Fixed

### `attributeBlacklist`

-   **Description**: Disallowed attributes. (e.g. `{a: "href|target", img: "src|alt", "*": "name"}`).
-   **Type**: `Object<string, string>`
-   **Default**: `""`
-   **Mutability**: Fixed

### `__defaultFormatLine`

-   **Description**: Overrides the editor's default "line" element. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_LINE` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `formatLine`

-   **Description**: Specifies the editor's "line" elements. (e.g., `P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx"`)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_LINE` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `__defaultFormatBrLine`

-   **Description**: Overrides the editor's default "brLine" element. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_BR_LINE` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `formatBrLine`

-   **Description**: Specifies the editor's "brLine" elements. (e.g. `"PRE"`)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_BR_LINE` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `__defaultFormatClosureBrLine`

-   **Description**: Overrides the editor's default "closureBrLine" element. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_CLOSURE_BR_LINE` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `formatClosureBrLine`

-   **Description**: Specifies the editor's "closureBrLine" elements. Cannot exit this format with Enter/Backspace.
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_CLOSURE_BR_LINE` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `__defaultFormatBlock`

-   **Description**: Overrides the editor's default "block" element. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_BLOCK` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `formatBlock`

-   **Description**: Specifies the editor's "block" elements. Wraps "line" and "component".
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_BLOCK` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `__defaultFormatClosureBlock`

-   **Description**: Overrides the editor's default "closureBlock" element. (Internal use primarily)
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_CLOSURE_BLOCK` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `formatClosureBlock`

-   **Description**: Specifies the editor's "closureBlock" elements. Cannot exit this format with Enter/Backspace.
-   **Type**: `string`
-   **Default**: `DEFAULT_FORMAT_CLOSURE_BLOCK` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Fixed

### `allowedEmptyTags`

-   **Description**: Allowed empty tags.
-   **Type**: `string`
-   **Default**: `DEFAULT_ALLOWED_EMPTY_NODE_LIST` (see [Default Value Constants](#default-value-constants))
-   **Mutability**: Resettable

### `toolbar_width`

-   **Description**: Toolbar width.
-   **Type**: `number|string`
-   **Default**: `"auto"`
-   **Mutability**: Resettable

### `toolbar_container`

-   **Description**: Container element for the toolbar.
-   **Type**: `Element|string`
-   **Default**: `undefined`
-   **Mutability**: Fixed

### `toolbar_sticky`

-   **Description**: Enables sticky toolbar with optional offset.
-   **Type**: `number`
-   **Default**: `0` (0 means not sticky, >0 is offset)
-   **Mutability**: Resettable

### `toolbar_hide`

-   **Description**: Hides toolbar initially.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Resettable

### `subToolbar`

-   **Description**: Sub-toolbar configuration.
-   **Type**: `Object` containing `buttonList`, `mode`, `width`.
    -   `buttonList`: `Array<Array<string>>`
    -   `mode`: `"balloon"|"balloon-always"` (default `"balloon"`)
    -   `width`: `number|string` (default `"auto"`)
-   **Default**: `undefined`
-   **Mutability**: Fixed

### `statusbar_container`

-   **Description**: Container element for the status bar.
-   **Type**: `Element|string`
-   **Default**: `undefined`
-   **Mutability**: Fixed

### `shortcutsHint`

-   **Description**: Displays shortcut hints in tooltips.
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Resettable

### `shortcutsDisable`

-   **Description**: Disables keyboard shortcuts.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Fixed

### `shortcuts`

-   **Description**: Custom keyboard shortcuts.
-   **Type**: `Object<string, Array<string>>`
-   **Default**: `undefined` (uses editor defaults)
-   **Mutability**: Fixed

### `fullScreenOffset`

-   **Description**: Offset applied when entering fullscreen mode.
-   **Type**: `number`
-   **Default**: `0`
-   **Mutability**: Resettable

### `previewTemplate`

-   **Description**: Custom template for preview mode.
-   **Type**: `string`
-   **Default**: `undefined`
-   **Mutability**: Resettable

### `printTemplate`

-   **Description**: Custom template for print mode.
-   **Type**: `string`
-   **Default**: `undefined`
-   **Mutability**: Resettable

### `componentAutoSelect`

-   **Description**: Enables automatic selection of inserted components.
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Resettable

### `defaultUrlProtocol`

-   **Description**: Default URL protocol for links (e.g., `http://` or `https://`).
-   **Type**: `string`
-   **Default**: `undefined`
-   **Mutability**: Resettable

### `toastMessageTime`

-   **Description**: Duration for displaying toast messages.
-   **Type**: `Object<"copy", number>`
-   **Default**: `{"copy": 1500}`
-   **Mutability**: Resettable

### `icons`

-   **Description**: Overrides the default icons.
-   **Type**: `Object<string, string>` (key is command, value is SVG string or path)
-   **Default**: `undefined` (uses editor's built-in icons)
-   **Mutability**: Fixed

### `freeCodeViewMode`

-   **Description**: Enables free code view mode (less strict HTML parsing in code view).
-   **Type**: `boolean`
-   **Default**: `false`
-   **Mutability**: Resettable

### `__lineFormatFilter`

-   **Description**: Line format filter configuration. (Internal use primarily)
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Resettable

### `__pluginRetainFilter`

-   **Description**: Plugin retain filter configuration. (Internal use primarily)
-   **Type**: `boolean`
-   **Default**: `true`
-   **Mutability**: Resettable

### `__listCommonStyle`

-   **Description**: Defines the list of styles applied directly to `<li>` elements when a text style is applied to the entire list item. (Internal use primarily)
-   **Type**: `Array<string>`
-   **Default**: `["fontSize", "color", "fontFamily", "fontWeight", "fontStyle"]`
-   **Mutability**: Fixed

### `externalLibs`

-   **Description**: External libraries like CodeMirror or MathJax.
-   **Type**: `Object<string, *>`
-   **Default**: `undefined`
-   **Mutability**: Fixed

### `Dynamic_pluginOptions`

-   **Description**: Dynamic plugin options, where the key is the plugin name and the value is its configuration. This is not a direct option but represents how plugin-specific options are handled.
-   **Type**: `Object<string, *>`
-   **Default**: Varies by plugin
-   **Mutability**: Generally Resettable (depends on the plugin)

**Note on Mutability**:

-   **Fixed**: These options are generally set at editor initialization and cannot be changed dynamically using a `setOptions` method (or similar) afterwards without re-initializing the editor.
-   **Resettable**: These options can typically be changed after editor initialization.
