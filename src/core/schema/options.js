/**
 * ================================================================================================================================
 * === DEFAULTS : Constants
 * =================================================================================================================================
 */

export const DEFAULTS = {
	BUTTON_LIST: [
		['undo', 'redo'],
		'|',
		['bold', 'underline', 'italic', 'strike', '|', 'subscript', 'superscript'],
		'|',
		['removeFormat'],
		'|',
		['outdent', 'indent'],
		'|',
		['fullScreen', 'showBlocks', 'codeView'],
		'|',
		['preview', 'print'],
	],

	REQUIRED_FORMAT_LINE: 'div',
	REQUIRED_ELEMENT_WHITELIST: 'br|div',

	ELEMENT_WHITELIST:
		'p|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|colgroup|col|thead|tbody|tr|th|td|caption|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary',
	TEXT_STYLE_TAGS: 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary',

	SCOPE_SELECTION_TAGS: ['td', 'table', 'li', 'ol', 'ul', 'pre', 'figcaption', 'blockquote', 'dl', 'dt', 'dd'],

	ATTRIBUTE_WHITELIST:
		'contenteditable|target|href|title|download|rel|src|alt|class|type|colspan|rowspan' +
		'|width|height|controls|autoplay|loop|muted|poster|preload|playsinline|volume|crossorigin|disableRemotePlayback|controlsList' +
		'|allowfullscreen|sandbox|loading|allow|referrerpolicy|frameborder|scrolling',

	FORMAT_LINE: 'P|H[1-6]|LI|TH|TD|DETAILS',
	FORMAT_BR_LINE: 'PRE',
	FORMAT_CLOSURE_BR_LINE: '',
	FORMAT_BLOCK: 'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS',
	FORMAT_CLOSURE_BLOCK: 'TH|TD',

	ALLOWED_EMPTY_NODE_LIST: '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details',

	SIZE_UNITS: ['px', 'pt', 'em', 'rem'],

	CLASS_NAME: '^__se__|^se-|^katex|^MathJax',
	CLASS_MJX: 'mjx-container|mjx-math|mjx-mrow|mjx-mi|mjx-mo|mjx-mn|mjx-msup|mjx-mfrac|mjx-munderover',
	EXTRA_TAG_MAP: { script: false, style: false, meta: false, link: false, '[a-z]+:[a-z]+': false },

	CONTENT_STYLES:
		'background|background-clip|background-color|' +
		'border|border-bottom|border-collapse|border-color|border-image|border-left-width|border-radius|border-right-width|border-spacing|border-style|border-top|border-width|' +
		'box-shadow|box-sizing|' +
		'caption-side|color|content|' +
		'direction|display|position|' +
		'float|font|font-family|font-size|font-style|font-weight|' +
		'height|min-height|max-height|' +
		'width|min-width|max-width|' +
		'left|letter-spacing|line-height|list-style-position|list-style-type|' +
		'margin|margin-block-end|margin-block-start|margin-bottom|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|' +
		'padding|padding-bottom|padding-inline-start|padding-left|padding-right|padding-top|' +
		'outline|overflow|' +
		'page-break-before|page-break-after|page-break-inside|' +
		'rotate|rotateX|rotateY|' +
		'table-layout|text-align|text-decoration|text-shadow|text-transform|top|' +
		'text-indent|text-rendering|' +
		'vertical-align|visibility|' +
		'white-space|word-break|word-wrap',
	TAG_STYLES: {
		'table|th|td': 'border|border-[a-z]+|color|background-color|text-align|float|font-weight|text-decoration|font-style|vertical-align',
		'table|td': 'width',
		tr: 'height',
		col: 'width',
		caption: 'text-align|caption-side',
		'ol|ul': 'list-style-type',
		figure: 'display|width|height|padding|padding-bottom',
		figcaption: 'margin|margin-top|margin-bottom|text-align',
		'img|video|iframe': 'transform|transform-origin|width|min-width|max-width|height|min-height|max-height|float|margin|margin-top',
		hr: '',
	},
	SPAN_STYLES: 'font-family|font-size|color|background-color|width|height',
	LINE_STYLES: 'text-align|margin|margin-left|margin-right|line-height',

	RETAIN_STYLE_MODE: ['repeat', 'always', 'none'],
};

/**
 * ================================================================================================================================
 * === OPTIONS TYPES : Frame
 * =================================================================================================================================
 */

/**
 * ================================================================================================================================
 * @typedef {Object} EditorFrameOptions
 *
 * **Frame-level editable area options**
 * -----------------
 *
 * === Content & Editing ===
 * @property {string} [value=""] - Initial value for the editor.
 * @property {string} [placeholder=""] - Placeholder text.
 * @property {Object<string, string>} [editableFrameAttributes={spellcheck: "false"}] - Attributes for the editable frame[.sun-editor-editable].
 * ```js
 * { editableFrameAttributes: { spellcheck: 'true', autocomplete: 'on' } }
 * ```
 * ///
 *
 * === Layout & Sizing ===
 * @property {string|number} [width="100%"] - Width for the editor.
 * @property {string|number} [minWidth=""] - Min width for the editor.
 * @property {string|number} [maxWidth=""] - Max width for the editor.
 * @property {string|number} [height="auto"] - Height for the editor.
 * @property {string|number} [minHeight=""] - Min height for the editor.
 * @property {string|number} [maxHeight=""] - Max height for the editor.
 * @property {string} [editorStyle=""] - Style string of the top frame of the editor.
 * ```js
 * { editorStyle: 'border: 1px solid #ccc; border-radius: 4px;' }
 * ```
 * ///
 *
 * === Iframe Mode ===
 * @property {boolean} [iframe=false] - Content will be placed in an iframe and isolated from the rest of the page.
 * @property {boolean} [iframe_fullPage=false] - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the `iframe`.
 * @property {Object<string, string>} [iframe_attributes={}] - Attributes of the `iframe`.
 * ```js
 * { iframe_attributes: { 'allow-scripts': 'true', sandbox: 'allow-same-origin' } }
 * ```
 * @property {Array<string>} [iframe_cssFileName=["suneditor"]] - CSS files to apply inside the iframe.
 * - String: Filename pattern to search in document `<link>` tags.
 * - `"*"`: Wildcard to include ALL stylesheets from the page.
 * - Absolute URLs and data URLs (`data:text/css,`) are also supported.
 * ```js
 * { iframe_cssFileName: ['suneditor', 'custom', 'https://example.com/style.css'] }
 * ```
 * ///
 *
 * === Statusbar & Character Counter ===
 * @property {boolean} [statusbar=true] - Enables the status bar.
 * @property {boolean} [statusbar_showPathLabel=true] - Displays the current node structure in the status bar.
 * @property {boolean} [statusbar_resizeEnable=true] - Enables resize function of the bottom status bar.
 * @property {boolean} [charCounter=false] - Shows the number of characters in the editor.
 * - If the `maxCharCount` option has a value, it becomes `true`.
 * @property {?number} [charCounter_max=null] - The maximum number of characters allowed to be inserted into the editor.
 * @property {?string} [charCounter_label=null] - Text to be displayed in the `charCounter` area of the bottom bar.
 * ```js
 * { charCounter_label: 'Characters :' }
 * ```
 * @property {"char"|"byte"|"byte-html"} [charCounter_type="char"] - Defines the calculation method of the `charCounter` option.
 * - `char`: Characters length.
 * - `byte`: Binary data size of characters.
 * - `byte-html`: Binary data size of the full HTML string.
 */

/** ================================================================================================================================ */

/**
 * @typedef {Object} OptionStyleResult
 * @property {string} top - Styles applied to the top container (e.g. width, z-index, etc).
 * @property {string} frame - Styles applied to the iframe container (e.g. height, min-height).
 * @property {string} editor - Styles applied to the editable content area.
 */
/**
 * @typedef {Object} InternalFrameOptions
 * **Runtime-only frame options (computed internally, cannot be set by users)**
 * @property {Object} [__statusbarEvent] - Status bar event configuration.
 * @property {SunEditor.InitFrameOptions} _origin - origin frame options
 * @property {OptionStyleResult} [_defaultStyles] - Enables fixed positioning for the editor frame.
 * @property {*} [codeMirrorEditor] - CodeMirror editor instance (frame-level). Set by `_checkCodeMirror` after initialization.
 */

/**
 * @typedef {EditorFrameOptions & InternalFrameOptions} AllFrameOptions
 */

/**
 * @typedef {'width'|'minWidth'|'maxWidth'|'height'|'minHeight'|'maxHeight'} TransformedFrameOptionKeys
 */

/**
 * @typedef {Object} TransformedFrameOptions
 * @property {string} width
 * @property {string} minWidth
 * @property {string} maxWidth
 * @property {string} height
 * @property {string} minHeight
 * @property {string} maxHeight
 */

/**
 * @typedef {Omit<AllFrameOptions, TransformedFrameOptionKeys> & TransformedFrameOptions} ProcessedFrameOptions
 */

/**
 * ================================================================================================================================
 * === OPTIONS TYPES : Base
 * =================================================================================================================================
 */

/**
 * ================================================================================================================================
 * @typedef {Object} PrivateBaseOptions
 *
 * **Advanced internal options (user-configurable, prefixed with `__`)**
 * -----------------
 *
 * === Defaults & Whitelists ===
 * @property {string} [__textStyleTags=CONSTANTS.TEXT_STYLE_TAGS] - The basic tags that serves as the base for `textStyleTags`
 * - The default follows {@link DEFAULTS.TEXT_STYLE_TAGS}
 * @property {Object<string, string>} [__tagStyles=CONSTANTS.TAG_STYLES] - The basic tags that serves as the base for `tagStyles`
 * - The default follows {@link DEFAULTS.TAG_STYLES}
 * @property {string} [__defaultElementWhitelist] - A custom string used to construct a list of HTML elements to allow.
 * - The final list (regex pattern) is dynamically generated according to the following rules:
 * - A list of required elements, {@link DEFAULTS.REQUIRED_ELEMENT_WHITELIST}, is always included.
 * - If this option (`__defaultElementWhitelist`) is provided as a string: That value is used.
 * - If not provided or not a string: The default {@link DEFAULTS.ELEMENT_WHITELIST} is used.
 * - 1. If no options are given, the final pattern is:
 * - 'a|img|p|div|...' (REQUIRED + DEFAULT)
 * - 2. If options are given directly, the final pattern is:
 * - 'a|img|custom|tags' (REQUIRED + options.__defaultElementWhitelist)
 * @property {string} [__defaultAttributeWhitelist=CONSTANTS.ATTRIBUTE_WHITELIST] - A complete list of attributes that are allowed by default on all tags. Delimiter: `"|"`.
 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}
 * ```js
 * { __defaultAttributeWhitelist: 'href|target|src|alt|class' }
 * ```
 * ///
 *
 *  === Formatting  ===
 * @property {string} [__defaultFormatLine=CONSTANTS.FORMAT_LINE] - Specifies the tag to be used as the editor's default `line` element.
 * - The default follows {@link DEFAULTS.FORMAT_LINE}
 * @property {string} [__defaultFormatBrLine=CONSTANTS.FORMAT_BR_LINE] - Specifies the tag to be used as the editor's default `brLine` element.
 * - The default follows {@link DEFAULTS.FORMAT_BR_LINE}
 * @property {string} [__defaultFormatClosureBrLine=CONSTANTS.FORMAT_CLOSURE_BR_LINE] - Specifies the tag to be used as the editor's default `closureBrLine` element.
 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BR_LINE}
 * @property {string} [__defaultFormatBlock=CONSTANTS.FORMAT_BLOCK] - Specifies the tag to be used as the editor's default `block` element.
 * - The default follows {@link DEFAULTS.FORMAT_BLOCK}
 * @property {string} [__defaultFormatClosureBlock=CONSTANTS.FORMAT_CLOSURE_BLOCK] - Specifies the tag to be used as the editor's default `closureBlock` element.
 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BLOCK}
 * ///
 *
 * === Filters & Behavior ===
 * @property {boolean} [__lineFormatFilter=true] - Line format filter configuration.
 * @property {Array<string>} [__listCommonStyle=["fontSize", "color", "fontFamily", "fontWeight", "fontStyle"]] - Defines the styles applied directly to `<li>` when a text style is set on the entire list item.
 * - For example, when changing the font size or color of a list item (`<li>`),
 * - these styles apply to the `<li>` tag instead of wrapping content in additional tags.
 * @property {{pluginName: string, we: boolean}|boolean} [__pluginRetainFilter=true] - Plugin retain filter configuration. (Internal use primarily)
 * - You can turn it off/on globally with `true`/`false` or set it per plugin.
 * ```js
 * // disable filter for table plugin only
 * {
 *   __pluginRetainFilter: { table: false }
 * }
 * ```
 */

/**
 * ================================================================================================================================
 * @typedef {Object} EditorBaseOptions
 *
 * **Top-level editor configuration**
 * -----------------
 *
 * === Plugins & Toolbar ===
 * @property {Object<string, *>|Array<Object<string, *>>} [plugins] - Plugin configuration. Pass an array of plugin classes or an object keyed by plugin name.
 * ```js
 * import plugins, { image, link, table } from 'suneditor/src/plugins';
 * { plugins: plugins,
 *   plugins: [image, link, table],
 *   plugins: { image, link, table }
 * }
 * ```
 * @property {Array<string>} [excludedPlugins=[]] - List of plugin names to exclude.
 * ```js
 * { excludedPlugins: ['image', 'video'] }
 * ```
 * @property {SunEditor.UI.ButtonList} [buttonList=CONSTANTS.BUTTON_LIST] - List of toolbar buttons, grouped by sub-arrays.
 * - The default follows {@link DEFAULTS.BUTTON_LIST}
 * ///
 *
 * === Modes & Themes ===
 * @property {boolean} [v2Migration=false] - Enables migration mode for SunEditor v2.
 * @property {"classic"|"inline"|"balloon"|"balloon-always"} [mode="classic"] - Toolbar mode: `classic`, `inline`, `balloon`, `balloon-always`.
 * @property {string} [type=""] - Editor type. Use `"document"` for a document-style layout, with optional sub-types after `:`.
 * ```js
 * // type
 * 'document:header,page'
 * ```
 * @property {string} [theme=""] - Editor theme.
 * @property {Object<string, string>} [lang] - Language configuration. default : EN
 * @property {Object<string, string>} [icons] - Overrides the default icons.
 * @property {"ltr"|"rtl"} [textDirection="ltr"] - Text direction: `ltr` or `rtl`.
 * @property {Array<string>} [reverseButtons=['indent-outdent']] - An array of command pairs whose shortcut icons should be opposite each other.
 * - Depends on the `textDirection` mode.
 * ///
 *
 * === Strict & Advanced Filtering ===
 * @property {true | {
 * 		tagFilter: boolean,
 * 		formatFilter: boolean,
 * 		classFilter: boolean,
 * 		textStyleTagFilter: boolean,
 * 		attrFilter: boolean,
 * 		styleFilter: boolean
 * 	}} [strictMode=true]  - Enables strict filtering of tags, attributes, and styles.
 * - Use `true` to enable all filters (default), or an object to control individual filters.
 * - Setting `false` is not supported; use the object form to disable specific filters instead.
 * - :filter description
 * - `tagFilter`: Filters disallowed HTML tags (`elementWhitelist`/`elementBlacklist`)
 * - `formatFilter`: Filters format elements (`formatLine`/`formatBlock`)
 * - `classFilter`: Filters disallowed CSS class names (`allowedClassName`)
 * - `textStyleTagFilter`: Filters text style tags (b, i, u, span, etc.)
 * - `attrFilter`: Filters disallowed HTML attributes (`attributeWhitelist`/`attributeBlacklist`)
 * - `styleFilter`: Filters disallowed inline styles (`spanStyles`/`lineStyles`/`allUsedStyles`)
 * ```js
 * // disable only attribute and style filters
 * {
 *   strictMode: {
 *     tagFilter: true,
 *     formatFilter: true,
 *     classFilter: true,
 *     textStyleTagFilter: true,
 *     attrFilter: false,
 *     styleFilter: false
 *   }
 * }
 * ```
 * @property {Array<string>} [scopeSelectionTags=CONSTANTS.SCOPE_SELECTION_TAGS] - Tags treated as whole units when selecting all content.
 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}
 * ///
 *
 * === Content Filtering & Formatting ===
 * ==
 * #### 1) Tag & Element Control
 * @property {string} [elementWhitelist=""] - Specifies HTML elements to additionally allow beyond the default allow list. Delimiter: `"|"`.
 * - Added to the default list determined by {@link PrivateBaseOptions.__defaultElementWhitelist}.
 * ```js
 * { elementWhitelist: 'mark|details|summary' }
 * ```
 * @property {string} [elementBlacklist=""] - Specifies HTML elements that should not be used. Delimiter: `"|"`.
 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
 * ```js
 * { elementBlacklist: 'script|style|iframe' }
 * ```
 * @property {string} [allowedEmptyTags=CONSTANTS.ALLOWED_EMPTY_NODE_LIST] - A list of tags that are allowed to be kept even if their values are empty.
 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}
 * - Concatenated with `ALLOWED_EMPTY_NODE_LIST` to form the final `allowedEmptyTags` list.
 * @property {string} [allowedClassName=""] - Allowed class names.
 * - Added the default value {@link DEFAULTS.CLASS_NAME}
 * ///
 *
 * #### 2) Attribute Control
 * @property {{[key: string]: string|undefined}} [attributeWhitelist=null] - Specifies additional attributes to allow for each tag. `"*"` applies to all tags.
 * - Rules specified here will be merged into {@link PrivateBaseOptions.__defaultAttributeWhitelist}.
 * ```js
 * {
 *   attributeWhitelist: {
 *     a: 'href|target',
 *     img: 'src|alt',
 *     '*': 'id|data-*'
 *   }
 * }
 * ```
 * @property {{[key: string]: string|undefined}} [attributeBlacklist=null] - Specifies attributes to disallow by tag. `"*"` applies to all tags.
 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
 * ```js
 * { attributeBlacklist: { '*': 'onclick|onerror' } }
 * ```
 * ///
 *
 * #### 3) Text & Inline Style Control
 * @property {string} [textStyleTags=__textStyleTags] - Additional text style tags.
 * - The default follows {@link PrivateBaseOptions.__textStyleTags}
 * @property {Object<string, string>} [convertTextTags={bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}] - Maps text styles to specific HTML tags.
 * ```js
 * {
 *   convertTextTags: {
 *     bold: 'b',
 *     italic: 'i',
 *     underline: 'u',
 *     strike: 's'
 *   }
 * }
 * ```
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles. Delimiter: `"|"`.
 * ```js
 * { allUsedStyles: 'color|background-color|text-shadow' }
 * ```
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags. Key is tag name(s), value is pipe-delimited allowed styles.
 * ```js
 * {
 *   tagStyles: {
 *     'table|td': 'border|color|background-color',
 *     hr: 'border-top'
 *   }
 * }
 * ```
 * @property {string} [spanStyles=CONSTANTS.SPAN_STYLES] - Specifies allowed styles for the `span` tag.
 * - The default follows {@link DEFAULTS.SPAN_STYLES}
 * @property {string} [lineStyles=CONSTANTS.LINE_STYLES] - Specifies allowed styles for the `line` element (p..).
 * - The default follows {@link DEFAULTS.LINE_STYLES}
 * @property {Array<string>} [fontSizeUnits=CONSTANTS.SIZE_UNITS] - Allowed font size units.
 * - The default follows {@link DEFAULTS.SIZE_UNITS}
 * @property {"repeat"|"always"|"none"} [retainStyleMode="repeat"] - Determines how inline elements (e.g. `<span>`, `<strong>`) are handled when deleting text.
 * - `repeat`: Styles are retained unless backspace is repeatedly pressed.
 * - Continuous pressing will eventually remove the styles.
 * - `none`: Styles are not retained. Inline elements are immediately removed with the text.
 * - `always`: Styles persist indefinitely unless explicitly removed.
 * - Even if all text inside an inline element is deleted, the element itself remains.
 * ///
 *
 * #### 4) Line & Block Formatting
 * @property {string} [defaultLine="p"] - Default `line` element when inserting new lines.
 * @property {"line"|"br"} [defaultLineBreakFormat="line"] - Specifies the default line break format.
 * - [Recommended] `line` : Line break is divided into general tags.
 * - [Not recommended] `br` : Line breaks are treated as <br> on the same line. (like shift+enter)
 * - Line breaks are handled as <br> within `line`.
 * - You can create a new `line` by entering a line break twice in a row.
 * - Formats that include `line`, such as "Quote", still operate on a `line` basis.
 * - suneditor processes work in `line` units.
 * - When set to `br`, performance may decrease when editing a lot of data.
 * @property {string} [lineAttrReset=""] - Line properties that should be reset when changing lines. Delimiter: `"|"`.
 * ```js
 * { lineAttrReset: 'id|name' }
 * ```
 * @property {string} [formatLine=__defaultFormatLine] - Additionally allowed `line` elements beyond the default. Delimiter: `"|"`.
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatLine} to form the final `line` list.
 * - `line` element also contains `brLine` element.
 * ```js
 * { formatLine: 'ARTICLE|SECTION' }
 * ```
 * @property {string} [formatBrLine=__defaultFormatBrLine] - Additionally allowed `brLine` elements beyond the default.
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatBrLine} to form the final `brLine` list.
 * - `brLine` elements are included in the `line` element.
 * - `brLine` elements' line break is `BR` tag.
 * ```js
 * { formatBrLine: 'CODE' }
 * ```
 * - ※ Entering the Enter key on the last line ends `brLine` and appends `line`.
 * @property {string} [formatClosureBrLine=__defaultFormatClosureBrLine] - Additionally allowed `closureBrLine` elements beyond the default.
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatClosureBrLine} for the final `closureBrLine` list.
 * - `closureBrLine` elements are included in the `brLine`.
 * - `closureBrLine` elements' line break is `BR` tag.
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [formatBlock=__defaultFormatBlock] - Additionally allowed `block` elements beyond the default.
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatBlock} to form the final `block` list.
 * - `block` wraps the `line` and `component`.
 * @property {string} [formatClosureBlock=__defaultFormatClosureBlock] - Additionally allowed `closureBlock` elements beyond the default.
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatClosureBlock} for the final `closureBlock` list.
 * - `closureBlock` elements are included in the `block`.
 * - `closureBlock` element wraps the `line` and `component`.
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. (e.g. format of table cells)
 * ///
 *
 * === UI & Interaction ===
 * @property {boolean} [closeModalOutsideClick=false] - Closes modals when clicking outside.
 * @property {boolean} [syncTabIndent=true] - Synchronizes tab indent with spaces.
 * @property {boolean} [tabDisable=false] - Disables tab key input.
 * @property {string} [toolbar_width="auto"] - Toolbar width.
 * @property {?HTMLElement} [toolbar_container] - Container element for the toolbar.
 * @property {number} [toolbar_sticky=0] - Enables sticky toolbar with optional offset.
 * @property {boolean} [toolbar_hide=false] - Hides toolbar initially.
 * @property {Object} [subToolbar={}] - Sub-toolbar configuration. A secondary toolbar that appears on text selection.
 * @property {SunEditor.UI.ButtonList} [subToolbar.buttonList] - List of Sub-toolbar buttons, grouped by sub-arrays.
 * @property {"balloon"|"balloon-always"} [subToolbar.mode="balloon"] - Sub-toolbar mode: `balloon`, `balloon-always`.
 * @property {string} [subToolbar.width="auto"] - Sub-toolbar width.
 * ```js
 * { subToolbar: { buttonList: [['bold', 'italic', 'link']], mode: 'balloon' } }
 * ```
 * @property {?HTMLElement} [statusbar_container] - Container element for the status bar.
 * @property {boolean} [shortcutsHint=true] - Displays shortcut hints in tooltips.
 * @property {boolean} [shortcutsDisable=false] - Disables keyboard shortcuts.
 * @property {{[key: string]: Array<string>|undefined}} [shortcuts={}] - Custom keyboard shortcuts.
 * - Keys starting with `_` are user-defined custom shortcuts. Each value is an array of `[keyCombo, hintLabel]` pairs.
 * - Key combos use `c` (Ctrl/Cmd), `s` (Shift), and `KeyEvent.code` values joined by `+`.
 * - Use `$~pluginName.method` to call a specific plugin method.
 * ```js
 * {
 *   shortcuts: {
 *     bold: ['c+KeyB', 'B'],
 *     _h1: ['c+s+Digit1+$~blockStyle.applyHeaderByShortcut', '']
 *   }
 * }
 * ```
 * ///
 *
 * === Advanced Features ===
 * @property {boolean} [copyFormatKeepOn=false] - Keeps the format of the copied content.
 * @property {boolean} [autoLinkify] - Automatically converts URLs into hyperlinks. (`Link` plugin required)
 * - Default: `Boolean(plugins.link)` — determined by whether the `link` plugin is enabled.
 * @property {Array<string>} [autoStyleify=["bold", "underline", "italic", "strike"]] - Styles applied automatically on text input.
 * @property {number} [historyStackDelayTime=400] - Delay time for history stack updates (ms).
 * @property {string} [printClass=""] - Class name for printing.
 * @property {number} [fullScreenOffset=0] - Offset applied when entering fullscreen mode.
 * @property {?string} [previewTemplate=null] - Custom HTML template for preview mode. Use `{{ contents }}` as a placeholder for editor content.
 * @property {?string} [printTemplate=null] - Custom HTML template for print mode. Use `{{ contents }}` as a placeholder for editor content.
 * ```js
 * { previewTemplate: '<div class="my-preview"><h1>Preview</h1>{{ contents }}</div>' }
 * ```
 * @property {SunEditor.ComponentInsertType} [componentInsertBehavior="auto"] - Enables automatic selection of inserted components.
 * - For inline components: places cursor near the component, or selects if no nearby range.
 * - For block components: executes behavior based on `selectMode`:
 *    - `auto`: Move cursor to the next line if possible, otherwise select the component.
 *    - `select`: Always select the inserted component.
 *    - `line`: Move cursor to the next line if possible, or create a new line and move there.
 *    - `none`: Do nothing.
 * @property {?string} [defaultUrlProtocol=null] - Default URL protocol for links.
 * @property {Object<"copy", number>} [toastMessageTime={copy: 1500}] - Duration for displaying toast messages (ms).
 * @property {boolean} [freeCodeViewMode=false] - Enables free code view mode.
 *
 * === Dynamic Options ===
 * @property {Object<string, *>} [externalLibs] - External libraries like CodeMirror, KaTeX, or MathJax.
 * - See {@link https://github.com/ARA-developer/suneditor/blob/develop/guide/external-libraries.md External Libraries Guide}
 * ```js
 * {
 *   externalLibs: {
 *     katex: window.katex,
 *     codeMirror: { src: CodeMirror }
 *   }
 * }
 * ```
 * @property {Object<string, boolean>} [allowedExtraTags=CONSTANTS.EXTRA_TAG_MAP] - Specifies extra allowed or disallowed tags. `true` to allow, `false` to disallow.
 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}
 * ```js
 * {
 *   allowedExtraTags: {
 *     script: false,
 *     style: false,
 *     mark: true
 *   }
 * }
 * ```
 * ///
 *
 * === User Events ===
 * @property {SunEditor.Event.Handlers} [events] - User event handlers configuration.
 * ```js
 * {
 *   events: {
 *     onChange: (content) => console.log(content),
 *     onImageUploadBefore: (files, info) => true
 *   }
 * }
 * ```
 * ///
 *
 * === [ Plugin-Specific Options ] ===
 * ---[ Auto-generated by scripts/check/inject-plugin-jsdoc.cjs - DO NOT EDIT MANUALLY ]---
 * @property {import('../../plugins/dropdown/align.js').AlignPluginOptions} [align]
 * @property {import('../../plugins/modal/audio.js').AudioPluginOptions} [audio]
 * @property {import('../../plugins/browser/audioGallery.js').AudioGalleryPluginOptions} [audioGallery]
 * @property {import('../../plugins/dropdown/backgroundColor.js').BackgroundColorPluginOptions} [backgroundColor]
 * @property {import('../../plugins/dropdown/blockStyle.js').BlockStylePluginOptions} [blockStyle]
 * @property {import('../../plugins/modal/drawing.js').DrawingPluginOptions} [drawing]
 * @property {import('../../plugins/modal/embed.js').EmbedPluginOptions} [embed]
 * @property {import('../../plugins/command/exportPDF.js').ExportPDFPluginOptions} [exportPDF]
 * @property {import('../../plugins/browser/fileBrowser.js').FileBrowserPluginOptions} [fileBrowser]
 * @property {import('../../plugins/browser/fileGallery.js').FileGalleryPluginOptions} [fileGallery]
 * @property {import('../../plugins/command/fileUpload.js').FileUploadPluginOptions} [fileUpload]
 * @property {import('../../plugins/dropdown/font.js').FontPluginOptions} [font]
 * @property {import('../../plugins/dropdown/fontColor.js').FontColorPluginOptions} [fontColor]
 * @property {import('../../plugins/input/fontSize.js').FontSizePluginOptions} [fontSize]
 * @property {import('../../plugins/dropdown/hr.js').HRPluginOptions} [hr]
 * @property {import('../../plugins/modal/image/index.js').ImagePluginOptions} [image]
 * @property {import('../../plugins/browser/imageGallery.js').ImageGalleryPluginOptions} [imageGallery]
 * @property {import('../../plugins/dropdown/layout.js').LayoutPluginOptions} [layout]
 * @property {import('../../plugins/dropdown/lineHeight.js').LineHeightPluginOptions} [lineHeight]
 * @property {import('../../plugins/modal/link.js').LinkPluginOptions} [link]
 * @property {import('../../plugins/modal/math.js').MathPluginOptions} [math]
 * @property {import('../../plugins/field/mention.js').MentionPluginOptions} [mention]
 * @property {import('../../plugins/dropdown/paragraphStyle.js').ParagraphStylePluginOptions} [paragraphStyle]
 * @property {import('../../plugins/dropdown/table/index.js').TablePluginOptions} [table]
 * @property {import('../../plugins/dropdown/template.js').TemplatePluginOptions} [template]
 * @property {import('../../plugins/dropdown/textStyle.js').TextStylePluginOptions} [textStyle]
 * @property {import('../../plugins/modal/video/index.js').VideoPluginOptions} [video]
 * @property {import('../../plugins/browser/videoGallery.js').VideoGalleryPluginOptions} [videoGallery]
 * ///
 * ---[ End of auto-generated plugin options ]---
 * ================================================================================================================================
 */

/**
 * ================================================================================================================================
 * @typedef {Object} InternalBaseOptions
 *
 * **Runtime-only base options (computed internally, cannot be set by users)**
 *
 * @property {string} [_themeClass] - Computed className for the selected theme (e.g., `se-theme-default`).
 * @property {string} [_type_options] - Additional sub-type string from the `type` option (after `:`).
 * @property {string} [_allowedExtraTag] - Preprocessed allowed tag string for RegExp (e.g., "mark|figure").
 * @property {string} [_disallowedExtraTag] - Preprocessed disallowed tag string.
 * @property {string} [_editableClass] - Final computed editable class (used in editor wrapper).
 * @property {boolean} [_rtl] - Whether text direction is RTL.
 * @property {string[]} [_reverseCommandArray] - Internal key shortcut matcher for reverse commands.
 * @property {string} [_subMode] - Sub toolbar mode (e.g., `balloon`).
 * @property {string[]} [_textStyleTags] - Tag names used for text styling, plus span/li.
 * @property {RegExp} [_textStylesRegExp] - Regex to match inline styles (e.g., fontSize, color).
 * @property {RegExp} [_lineStylesRegExp] - Regex to match line styles (e.g., text-align, padding).
 * @property {Object<string, string>} [_defaultStyleTagMap] - Mapping HTML tag => standard tag.
 * @property {Object<string, string>} [_styleCommandMap] - Mapping HTML tag => command (e.g., bold, underline).
 * @property {Object<string, string>} [_defaultTagCommand] - Mapping command => preferred tag.
 * @property {string} [_editorElementWhitelist] - Element whitelist regex pattern for the editor.
 *
 * @property {Set} [buttons] - List of currently used toolbar buttons
 * @property {Set} [buttons_sub] - List of currently used sub-toolbar buttons
 * @property {string} [toolbar_sub_width] - Sub-toolbar width.
 * @property {string[]} [reverseCommands] - Merged reverse command pairs array.
 * - Includes default `indent-outdent` + user's `reverseButtons`.
 *
 * @property {*} [codeMirror] - CodeMirror configuration object from `externalLibs.codeMirror`.
 * @property {boolean} [codeMirrorEditor] - Whether CodeMirror is available (base-level flag). Frame-level stores the actual CM instance.
 * @property {boolean} [hasCodeMirror] - Uses CodeMirror for code view.
 *
 * @property {Set<string>} [allUsedStyles] - Processed set of all allowed CSS styles.
 * - Converted from user's `string` input ("|" delimited) to `Set<string>` in constructor.
 */

// ================================================================================================================================

/**
 * @typedef {EditorBaseOptions & PrivateBaseOptions & EditorFrameOptions} EditorInitOptions
 */

/**
 * @typedef {EditorBaseOptions & PrivateBaseOptions & InternalBaseOptions} AllBaseOptions
 */

/**
 * ================================================================================================================================
 * === OPTION FLAGS : Fixed / Resettable
 * =================================================================================================================================
 */

/**
 * @description For all EditorInitOptions keys, only `boolean` | `null` values are allowed.
 * - `fixed` → Immutable / `null` → Resettable.
 * @type {Partial<Object<keyof EditorInitOptions, "fixed" | true>>}
 */
export const OPTION_FRAME_FIXED_FLAG = {
	value: 'fixed',
	placeholder: true,
	editableFrameAttributes: true,
	width: true,
	minWidth: true,
	maxWidth: true,
	height: true,
	minHeight: true,
	maxHeight: true,
	editorStyle: true,
	iframe: 'fixed',
	iframe_fullPage: 'fixed',
	iframe_attributes: true,
	iframe_cssFileName: true,
	statusbar: true,
	statusbar_showPathLabel: true,
	statusbar_resizeEnable: 'fixed',
	charCounter: true,
	charCounter_max: true,
	charCounter_label: true,
	charCounter_type: true,
};

/**
 * @description For all EditorInitOptions keys, only `boolean` | `null` values are allowed.
 * - `fixed` → Immutable / `null` → Resettable.
 * @type {Partial<Object<keyof EditorInitOptions, "fixed" | true>>}
 */
export const OPTION_FIXED_FLAG = {
	plugins: 'fixed',
	excludedPlugins: 'fixed',
	buttonList: 'fixed',
	v2Migration: 'fixed',
	strictMode: 'fixed',
	mode: 'fixed',
	type: 'fixed',
	theme: true,
	lang: 'fixed',
	fontSizeUnits: 'fixed',
	allowedClassName: 'fixed',
	closeModalOutsideClick: 'fixed',
	copyFormatKeepOn: true,
	syncTabIndent: true,
	tabDisable: true,
	autoLinkify: true,
	autoStyleify: true,
	retainStyleMode: true,
	allowedExtraTags: 'fixed',
	events: true,
	__textStyleTags: 'fixed',
	textStyleTags: 'fixed',
	convertTextTags: 'fixed',
	__tagStyles: 'fixed',
	tagStyles: 'fixed',
	spanStyles: 'fixed',
	lineStyles: 'fixed',
	textDirection: true,
	reverseButtons: 'fixed',
	historyStackDelayTime: true,
	lineAttrReset: true,
	printClass: true,
	defaultLine: 'fixed',
	defaultLineBreakFormat: true,
	scopeSelectionTags: true,
	__defaultElementWhitelist: 'fixed',
	elementWhitelist: 'fixed',
	elementBlacklist: 'fixed',
	__defaultAttributeWhitelist: 'fixed',
	attributeWhitelist: 'fixed',
	attributeBlacklist: 'fixed',
	__defaultFormatLine: 'fixed',
	formatLine: 'fixed',
	__defaultFormatBrLine: 'fixed',
	formatBrLine: 'fixed',
	__defaultFormatClosureBrLine: 'fixed',
	formatClosureBrLine: 'fixed',
	__defaultFormatBlock: 'fixed',
	formatBlock: 'fixed',
	__defaultFormatClosureBlock: 'fixed',
	formatClosureBlock: 'fixed',
	allowedEmptyTags: true,
	toolbar_width: true,
	toolbar_container: 'fixed',
	toolbar_sticky: true,
	toolbar_hide: true,
	subToolbar: 'fixed',
	statusbar_container: 'fixed',
	shortcutsHint: true,
	shortcutsDisable: 'fixed',
	shortcuts: 'fixed',
	fullScreenOffset: true,
	previewTemplate: true,
	printTemplate: true,
	componentInsertBehavior: true,
	defaultUrlProtocol: true,
	allUsedStyles: 'fixed',
	toastMessageTime: true,
	icons: 'fixed',
	freeCodeViewMode: true,
	__lineFormatFilter: true,
	__pluginRetainFilter: true,
	__listCommonStyle: 'fixed',
	externalLibs: 'fixed',
};

/**
 * @typedef {'formatClosureBrLine' | 'formatBrLine' | 'formatLine' | 'formatClosureBlock' | 'formatBlock' | 'toolbar_width' | 'toolbar_container' | 'toolbar_sticky' | 'strictMode' | 'lineAttrReset'} TransformedOptionKeys
 */

/**
 * @typedef {Object} StrictModeOptions
 * @property {boolean} tagFilter - Filters disallowed HTML tags (`elementWhitelist`/`elementBlacklist`)
 * @property {boolean} formatFilter - Filters format elements (`formatLine`/`formatBlock`)
 * @property {boolean} classFilter - Filters disallowed CSS class names (`allowedClassName`)
 * @property {boolean} textStyleTagFilter - Filters text style tags (b, i, u, span, etc.)
 * @property {boolean} attrFilter - Filters disallowed HTML attributes (`attributeWhitelist`/`attributeBlacklist`)
 * @property {boolean} styleFilter - Filters disallowed inline styles (`spanStyles`/`lineStyles`/`allUsedStyles`)
 */

/**
 * @typedef {Object} TransformedOptions
 * @property {{ reg: RegExp, str: string }} formatClosureBrLine
 * @property {{ reg: RegExp, str: string }} formatBrLine
 * @property {{ reg: RegExp, str: string }} formatLine
 * @property {{ reg: RegExp, str: string }} formatClosureBlock
 * @property {{ reg: RegExp, str: string }} formatBlock
 * @property {string} toolbar_width
 * @property {HTMLElement|null} toolbar_container
 * @property {number} toolbar_sticky
 * @property {StrictModeOptions} strictMode
 * @property {string[]} lineAttrReset
 */

/**
 * @typedef {Omit<AllBaseOptions, TransformedOptionKeys> & TransformedOptions} ProcessedBaseOptions
 */
