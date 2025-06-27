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
		['preview', 'print']
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
		'direction|display|' +
		'float|font|font-family|font-size|font-style|font-weight|' +
		'height|' +
		'left|letter-spacing|line-height|list-style-position|list-style-type|' +
		'margin|margin-block-end|margin-block-start|margin-bottom|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|max-width|min-width|' +
		'outline|overflow|' +
		'position|padding|padding-bottom|padding-inline-start|padding-left|padding-right|padding-top|' +
		'page-break-before|page-break-after|page-break-inside|' +
		'rotate|rotateX|rotateY|' +
		'table-layout|text-align|text-decoration|text-shadow|text-transform|top|' +
		'text-indent|text-rendering|' +
		'vertical-align|visibility|' +
		'white-space|width|word-break|word-wrap',
	TAG_STYLES: {
		'table|th|td': 'border|border-[a-z]+|color|background-color|text-align|float|font-weight|text-decoration|font-style|vertical-align|text-align',
		'table|td': 'width',
		tr: 'height',
		col: 'width',
		'ol|ul': 'list-style-type'
	},
	SPAN_STYLES: 'font-family|font-size|color|background-color|width|height',
	LINE_STYLES: 'text-align|margin-left|margin-right|line-height',

	RETAIN_STYLE_MODE: ['repeat', 'always', 'none']
};

/**
 * @typedef {Object} EditorFrameOptions
 * @property {string} [value=""] - Initial value for the editor.
 * @property {string} [placeholder=""] - Placeholder text.
 * @property {Object<string, string>} [editableFrameAttributes={}] - Attributes for the editable frame[.sun-editor-editable]. (e.g. [key]: value)
 * @property {string} [width="100%"] - Width for the editor.
 * @property {string} [minWidth=""] - Min width for the editor.
 * @property {string} [maxWidth=""] - Max width for the editor.
 * @property {string} [height="auto"] - Height for the editor.
 * @property {string} [minHeight=""] - Min height for the editor.
 * @property {string} [maxHeight=""] - Max height for the editor.
 * @property {string} [editorStyle=""] - Style string of the top frame of the editor. (e.g. "border: 1px solid #ccc;").
 * @property {boolean} [iframe=false] - Content will be placed in an iframe and isolated from the rest of the page.
 * @property {boolean} [iframe_fullPage=false] - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the "iframe".
 * @property {Object<string, string>} [iframe_attributes={}] - Attributes of the "iframe". (e.g. {'scrolling': 'no'})
 * @property {string} [iframe_cssFileName="suneditor"] - Name or Array of the CSS file to apply inside the iframe.
 * - You can also use regular expressions.
 * - Applied by searching by filename in the link tag of document,
 * - or put the URL value (".css" can be omitted).
 * @property {boolean} [statusbar=true] - Enables the status bar.
 * @property {boolean} [statusbar_showPathLabel=true] - Displays the current node structure to status bar.
 * @property {boolean} [statusbar_resizeEnable=true] - Enables resize function of bottom status bar
 * @property {boolean} [charCounter=false] - Shows the number of characters in the editor.
 * - If the maxCharCount option has a value, it becomes true.
 * @property {number} [charCounter_max] - The maximum number of characters allowed to be inserted into the editor.
 * @property {string} [charCounter_label] - Text to be displayed in the "charCounter" area of the bottom bar. (e.g. "Characters : 20/200")
 * @property {"char"|"byte"|"byte-html"} [charCounter_type="char"] - Defines the calculation method of the "charCounter" option.
 * - 'char': Characters length.
 * - 'byte': Binary data size of characters.
 * - 'byte-html': Binary data size of the full HTML string.
 */

/**
 * @typedef {Object} EditorBaseOptions
 * @property {Object<string, *>|Array<Object<string, *>>} [plugins] - Plugin configuration.
 * @property {Array<string>} [excludedPlugins=[]] - Plugin configuration.
 * @property {Array<string[]|string>} [buttonList=CONSTANTS.BUTTON_LIST] - List of toolbar buttons, grouped by sub-arrays.
 * - The default follows {@link DEFAULTS.BUTTON_LIST}
 * @property {boolean} [v2Migration=false] - Enables migration mode for SunEditor v2.
 * @property {boolean|{tagFilter: boolean, formatFilter: boolean, classFilter: boolean, textStyleTagFilter: boolean, attrFilter: boolean, styleFilter: boolean}} [strictMode=true] - Enables strict filtering of tags, attributes, and styles.
 * @property {"classic"|"inline"|"balloon"|"balloon-always"} [mode="classic"] - Toolbar mode: "classic", "inline", "balloon", "balloon-always".
 * @property {string} [type=""] - Editor type: "document:header,page".
 * @property {string} [theme=""] - Editor theme.
 * @property {Object<string, string>} [lang] - Language configuration. default : EN
 * @property {Array<string>} [fontSizeUnits=CONSTANTS.SIZE_UNITS] - Allowed font size units.
 * - The default follows {@link DEFAULTS.SIZE_UNITS}
 * @property {string} [allowedClassName=""] - Allowed class names.
 * - Added the default value {@link DEFAULTS.CLASS_NAME}
 * @property {boolean} [closeModalOutsideClick=false] - Closes modals when clicking outside.
 * @property {boolean} [copyFormatKeepOn=false] - Keeps the format of the copied content.
 * @property {boolean} [syncTabIndent=true] - Synchronizes tab indent with spaces.
 * @property {boolean} [tabDisable=false] - Disables tab key input.
 * @property {boolean} [autoLinkify] - Automatically converts URLs into hyperlinks. ("Link" plugin required)
 * - Default value is determined dynamically based on whether the 'link' plugin is enabled. (default : Boolean(plugins.link))
 * @property {Array<string>} [autoStyleify=["bold", "underline", "italic", "strike"]] - Styles applied automatically on text input.
 * @property {Object<string, string|number>} [scrollToOptions={behavior: "smooth", block: "nearest", inline: "nearest"}] - Configuration for scroll behavior when navigating editor content.
 * @property {"repeat"|"always"|"none"} [retainStyleMode="repeat"] - This option determines how inline elements (such as <span>, <strong>, etc.) are handled when deleting text.
 * - "repeat": Inline styles are retained unless the backspace key is repeatedly pressed. If the user continuously presses backspace, the styles will eventually be removed.
 * - "none": Inline styles are not retained at all. When deleting text, the associated inline elements are immediately removed along with it.
 * - "always": Inline styles persist indefinitely unless explicitly removed. Even if all text inside an inline element is deleted, the element itself remains until manually removed.
 * @property {Object<string, boolean>} [allowedExtraTags=CONSTANTS.EXTRA_TAG_MAP] - Specifies extra allowed or disallowed tags.
 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}
 * @property {Object<string, (...args: *) => *>} [events={}] - Custom event handlers.
 * @property {string} [__textStyleTags=CONSTANTS.TEXT_STYLE_TAGS] - The basic tags that serves as the base for "textStyleTags"
 * - The default follows {@link DEFAULTS.TEXT_STYLE_TAGS}
 * @property {string} [textStyleTags=__textStyleTags] - Additional text style tags.
 * - The default follows {@link EditorBaseOptions.__textStyleTags}
 * @property {Object<string, string>} [convertTextTags={bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}] - Maps text styles to specific HTML tags.
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles. Delimiter: "|" (e.g. "color|background-color").
 * @property {Object<string, string>} [__tagStyles=CONSTANTS.TAG_STYLES] - The basic tags that serves as the base for "tagStyles"
 * - The default follows {@link DEFAULTS.TAG_STYLES}
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags.
 * @property {string} [spanStyles=CONSTANTS.SPAN_STYLES] - Specifies allowed styles for the "span" tag.
 * - The default follows {@link DEFAULTS.SPAN_STYLES}
 * @property {string} [lineStyles=CONSTANTS.LINE_STYLES] - Specifies allowed styles for the "line" element (p..).
 * - The default follows {@link DEFAULTS.LINE_STYLES}
 * @property {string} [textDirection="ltr"] - Text direction: "ltr" or "rtl".
 * @property {Array<string>} [reverseButtons=['indent-outdent']] - An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
 * @property {number} [historyStackDelayTime=400] - Delay time for history stack updates (ms).
 * @property {string} [lineAttrReset=""] - Line properties that should be reset when changing lines (e.g. "id|name").
 * @property {string} [printClass=""] - Class name for printing.
 * @property {string} [defaultLine="p"] - Default line element when inserting new lines.
 * @property {"line"|"br"} [defaultLineBreakFormat="line"] - Specifies the default line break format.
 * - [Recommended] "line" :  is a line break that is divided into general tags.
 * - [Not recommended] "br" : Line breaks are treated as <br> on the same line. (like shift+enter)
 * - Line breaks are handled as <br> within "line".
 * - You can create a new "line" by entering a line break twice in a row.
 * - Formats that include "line", such as "Quote", still operate on a "line" basis.
 * - ● suneditor processes work in "line" units.
 * - ● When set to "br", performance may decrease when editing a lot of data.
 * @property {Array<string>} [scopeSelectionTags=CONSTANTS.SCOPE_SELECTION_TAGS] - Tags treated as whole units when selecting all content.
 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}
 * @property {string} [__defaultElementWhitelist] - A custom string used to construct a list of HTML elements to allow.
 * - The final list of allowed elements (regex pattern) is dynamically generated according to the following rules:
 * - A list of required elements, {@link DEFAULTS.REQUIRED_ELEMENT_WHITELIST}, is always included.
 * - If a string value is provided for this option (`__defaultElementWhitelist`):** That string value is used.
 * - If this option is not provided or is not a string: The default constant {@link DEFAULTS.ELEMENT_WHITELIST} is used.
 * - 1. If no options are given, the final pattern is:
 * - 'a|img|p|div|...' (REQUIRED + DEFAULT)
 * - 2. If options are given directly, the final pattern is:
 * - 'a|img|custom|tags' (REQUIRED + options.__defaultElementWhitelist)
 * @property {string} [elementWhitelist=""] - Specifies HTML elements to additionally allow beyond the 'default' allow list. Delimiter: "|" (e.g. "p|div", "*").
 * - The value entered here will be added to the end of the default list determined by the {@link EditorBaseOptions.__defaultElementWhitelist} logic above.
 * @property {string} [elementBlacklist=""] - Filters by specifying HTML elements that should not be used. Delimiter: "|" (e.g. "script|style").
 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
 * @property {string} [__defaultAttributeWhitelist=CONSTANTS.ATTRIBUTE_WHITELIST] - A complete list of attributes that are allowed by default on all tags. Delimiter: "|" (e.g. "href|target").
 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}
 * @property {Object<string, string>} [attributeWhitelist=""] - Specifies additional attributes to allow for each tag. (e.g. {a: "href|target", img: "src|alt", "*": "id"}).
 * - Rules for objects specified here will be merged into the {@link EditorBaseOptions.__defaultAttributeWhitelist}.
 * @property {Object<string, string>} [attributeBlacklist=""] - Filter by specifying attributes to disallow by tag. (e.g. {a: "href|target", img: "src|alt", "*": "name"}).
 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
 * @property {string} [__defaultFormatLine=CONSTANTS.FORMAT_LINE] - Specifies the tag to be used as the editor's default "line" element.
 * - The default follows {@link DEFAULTS.FORMAT_LINE}
 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
 * @property {string} [formatLine=__defaultFormatLine] - Additionally allowed "line" elements beyond the default. Delimiter: "|" (e.g. "p|div").
 * It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatLine} to form the final 'line' element list.
 * - "line" element also contain "brLine" element
 * @property {string} [__defaultFormatBrLine=CONSTANTS.FORMAT_BR_LINE] - Specifies the tag to be used as the editor's default "brLine" element.
 * - The default follows {@link DEFAULTS.FORMAT_BR_LINE}
 * @property {string} [formatBrLine=__defaultFormatBrLine] - Additionally allowed "brLine" elements beyond the default. (e.g. "PRE").
 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatBrLine} to form the final 'brLine' element list.
 * - "brLine" elements is included in the "line" element.
 * - "brLine" elements's line break is "BR" tag.
 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
 * @property {string} [__defaultFormatClosureBrLine=CONSTANTS.FORMAT_CLOSURE_BR_LINE] - Specifies the tag to be used as the editor's default "closureBrLine" element.
 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BR_LINE}
 * @property {string} [formatClosureBrLine=__defaultFormatClosureBrLine] - Additionally allowed "closureBrLine" elements beyond the default.
 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatClosureBrLine} to form the final 'closureBrLine' element list.
 * - "closureBrLine" elements is included in the "brLine".
 * - "closureBrLine" elements's line break is "BR" tag.
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [__defaultFormatBlock=CONSTANTS.FORMAT_BLOCK] - Specifies the tag to be used as the editor's default "block" element.
 * - The default follows {@link DEFAULTS.FORMAT_BLOCK}
 * @property {string} [formatBlock=__defaultFormatBlock] - Additionally allowed "block" elements beyond the default.
 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatBlock} to form the final 'block' element list.
 * - "block" is wrap the "line" and "component"
 * @property {string} [__defaultFormatClosureBlock=CONSTANTS.FORMAT_CLOSURE_BLOCK] - Specifies the tag to be used as the editor's default "closureBlock" element.
 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BLOCK}
 * @property {string} [formatClosureBlock=__defaultFormatClosureBlock] - Additionally allowed "closureBlock" elements beyond the default.
 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatClosureBlock} to form the final 'closureBlock' element list.
 * - "closureBlock" elements is included in the "block".
 * - "closureBlock" element is wrap the "line" and "component"
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. (e.g. format of table cells)
 * @property {string} [allowedEmptyTags=CONSTANTS.ALLOWED_EMPTY_NODE_LIST] - A list of tags that are allowed to be kept even if their values are empty.
 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}
 * - It is concatenated with the value of {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST} to form the final 'allowedEmptyTags' list.
 * @property {number|string} [toolbar_width="auto"] - Toolbar width.
 * @property {Element|string} [toolbar_container] - Container element for the toolbar.
 * @property {number} [toolbar_sticky=0] - Enables sticky toolbar with optional offset.
 * @property {boolean} [toolbar_hide=false] - Hides toolbar initially.
 * @property {Object} [subToolbar] - Sub-toolbar configuration.
 * @property {Array<Array<string>>} [subToolbar.buttonList] - List of Sub-toolbar buttons, grouped by sub-arrays.
 * @property {"balloon"|"balloon-always"} [subToolbar.mode="balloon"] - Sub-toolbar mode: "balloon", "balloon-always".
 * @property {number|string} [subToolbar.width="auto"] - Sub-toolbar width.
 * @property {Element|string} [statusbar_container] - Container element for the status bar.
 * @property {boolean} [shortcutsHint=true] - Displays shortcut hints in tooltips.
 * @property {boolean} [shortcutsDisable=false] - Disables keyboard shortcuts.
 * @property {Object<string, Array<string>>} [shortcuts] - Custom keyboard shortcuts.
 * @property {number} [fullScreenOffset=0] - Offset applied when entering fullscreen mode.
 * @property {string} [previewTemplate] - Custom template for preview mode.
 * @property {string} [printTemplate] - Custom template for print mode.
 * @property {boolean} [componentAutoSelect=false] - Enables automatic selection of inserted components.
 * @property {string} [defaultUrlProtocol] - Default URL protocol for links.
 * @property {Object<"copy", number>} [toastMessageTime] - {"copy": 1500} - Duration for displaying toast messages.
 * @property {Object<string, string>} [icons] - Overrides the default icons.
 * @property {string} [freeCodeViewMode=false] - Enables free code view mode.
 * @property {boolean} [__lineFormatFilter=true] - Line format filter configuration.
 * @property {boolean|Object<string, boolean>} [__pluginRetainFilter=true] - Plugin retain filter configuration.
 * - You can turn it off/on globally with true/false or set it per plugin. (e.g. { table: false })
 * @property {Array<string>} [__listCommonStyle=["fontSize", "color", "fontFamily", "fontWeight", "fontStyle"]] - Defines the list of styles that are applied directly to the `<li>` element
 * - when a text style is applied to the entire list item.
 * - For example, when changing the font size or color of a list item (`<li>`),
 * - these styles will be applied to the `<li>` tag instead of wrapping the content inside additional tags.
 * @property {Object<string, *>} [externalLibs] - External libraries like CodeMirror or MathJax.
 *
 * @property {Object<string, *>} [Dynamic_pluginOptions] - Dynamic plugin options, where the key is the plugin name and the value is its configuration.
 */

/**
 * @typedef {EditorBaseOptions & EditorFrameOptions} EditorInitOptions
 */

/** ------------- [OPTIONS FRAG] ------------- */
/**
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - 'fixed' → Immutable / null → Resettable.
 * @type {Partial<Record<keyof EditorInitOptions, "fixed" | true>>}
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
	charCounter_type: true
};
/**
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - 'fixed' → Immutable / null → Resettable.
 * @type {Partial<Record<keyof EditorInitOptions, "fixed" | true>>}
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
	scrollToOptions: true,
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
	componentAutoSelect: true,
	defaultUrlProtocol: true,
	allUsedStyles: 'fixed',
	toastMessageTime: true,
	icons: 'fixed',
	freeCodeViewMode: true,
	__lineFormatFilter: true,
	__pluginRetainFilter: true,
	__listCommonStyle: 'fixed',
	externalLibs: 'fixed'
};
