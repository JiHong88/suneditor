import type {} from '../../typedef';
export namespace DEFAULTS {
	let BUTTON_LIST: (string | string[])[];
	let REQUIRED_FORMAT_LINE: string;
	let REQUIRED_ELEMENT_WHITELIST: string;
	let ELEMENT_WHITELIST: string;
	let TEXT_STYLE_TAGS: string;
	let SCOPE_SELECTION_TAGS: string[];
	let ATTRIBUTE_WHITELIST: string;
	let FORMAT_LINE: string;
	let FORMAT_BR_LINE: string;
	let FORMAT_CLOSURE_BR_LINE: string;
	let FORMAT_BLOCK: string;
	let FORMAT_CLOSURE_BLOCK: string;
	let ALLOWED_EMPTY_NODE_LIST: string;
	let SIZE_UNITS: string[];
	let CLASS_NAME: string;
	let CLASS_MJX: string;
	let EXTRA_TAG_MAP: {
		script: boolean;
		style: boolean;
		meta: boolean;
		link: boolean;
		'[a-z]+:[a-z]+': boolean;
	};
	let CONTENT_STYLES: string;
	let TAG_STYLES: {
		'table|th|td': string;
		'table|td': string;
		tr: string;
		col: string;
		caption: string;
		'ol|ul': string;
		figure: string;
		figcaption: string;
		'img|video|iframe': string;
		hr: string;
	};
	let SPAN_STYLES: string;
	let LINE_STYLES: string;
	let RETAIN_STYLE_MODE: string[];
}
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
 * @property {Object<string, string>} [editableFrameAttributes={spellcheck: "false"}] - Attributes for the editable frame[.sun-editor-editable]. (e.g. [key]: value)
 * ///
 *
 * === Layout & Sizing ===
 * @property {string|number} [width="100%"] - Width for the editor.
 * @property {string|number} [minWidth=""] - Min width for the editor.
 * @property {string|number} [maxWidth=""] - Max width for the editor.
 * @property {string|number} [height="auto"] - Height for the editor.
 * @property {string|number} [minHeight=""] - Min height for the editor.
 * @property {string|number} [maxHeight=""] - Max height for the editor.
 * @property {string} [editorStyle=""] - Style string of the top frame of the editor. (e.g. "border: 1px solid #ccc;").
 * ///
 *
 * === Iframe Mode ===
 * @property {boolean} [iframe=false] - Content will be placed in an iframe and isolated from the rest of the page.
 * @property {boolean} [iframe_fullPage=false] - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the `iframe`.
 * @property {Object<string, string>} [iframe_attributes={}] - Attributes of the `iframe`. (e.g. {'allow-scripts': 'true'})
 * @property {Array<string>} [iframe_cssFileName=["suneditor"]] - CSS files to apply inside the iframe.
 * - String: Filename pattern to search in document `<link>` tags.
 * - (e.g. "suneditor" or "suneditor.[a-z0-9]+" matches "suneditor.abc123.css")
 * - "*": Wildcard to include ALL stylesheets from the page.
 * - Array: Multiple patterns (e.g. ["suneditor", "custom", "*"]).
 * - Absolute URLs and data URLs (data:text/css,) are also supported.
 * ///
 *
 * === Statusbar & Character Counter ===
 * @property {boolean} [statusbar=true] - Enables the status bar.
 * @property {boolean} [statusbar_showPathLabel=true] - Displays the current node structure in the status bar.
 * @property {boolean} [statusbar_resizeEnable=true] - Enables resize function of the bottom status bar.
 * @property {boolean} [charCounter=false] - Shows the number of characters in the editor.
 * - If the `maxCharCount` option has a value, it becomes `true`.
 * @property {?number} [charCounter_max=null] - The maximum number of characters allowed to be inserted into the editor.
 * @property {?string} [charCounter_label=null] - Text to be displayed in the `charCounter` area of the bottom bar. (e.g. "Characters : 20/200")
 * @property {"char"|"byte"|"byte-html"} [charCounter_type="char"] - Defines the calculation method of the `charCounter` option.
 * - `char`: Characters length.
 * - `byte`: Binary data size of characters.
 * - `byte-html`: Binary data size of the full HTML string.
 *
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
 * @property {*} [codeMirror5Editor] - CodeMirror5 editor instance (frame-level). Set by `_checkCodeMirror` after initialization.
 * @property {*} [codeMirror6Editor] - CodeMirror6 EditorView instance (frame-level). Set by `_checkCodeMirror` after initialization.
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
 * @property {string} [__defaultAttributeWhitelist=CONSTANTS.ATTRIBUTE_WHITELIST] - A complete list of attributes that are allowed by default on all tags.
 * - Delimiter: "|" (e.g. "href|target").
 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}
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
 * - You can turn it off/on globally with `true`/`false` or set it per plugin. (e.g. { table: false })
 */
/**
 * ================================================================================================================================
 * @typedef {Object} EditorBaseOptions
 *
 * **Top-level editor configuration**
 * -----------------
 *
 * === Plugins & Toolbar ===
 * @property {Object<string, *>|Array<Object<string, *>>} [plugins] - Plugin configuration.
 * @property {Array<string>} [excludedPlugins=[]] - Plugin configuration.
 * @property {SunEditor.UI.ButtonList} [buttonList=CONSTANTS.BUTTON_LIST] - List of toolbar buttons, grouped by sub-arrays.
 * - The default follows {@link DEFAULTS.BUTTON_LIST}
 * ///
 *
 * === Modes & Themes ===
 * @property {boolean} [v2Migration=false] - Enables migration mode for SunEditor v2.
 * @property {"classic"|"inline"|"balloon"|"balloon-always"} [mode="classic"] - Toolbar mode: `classic`, `inline`, `balloon`, `balloon-always`.
 * @property {string} [type=""] - Editor type: `document:header,page`.
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
 * @property {Array<string>} [scopeSelectionTags=CONSTANTS.SCOPE_SELECTION_TAGS] - Tags treated as whole units when selecting all content.
 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}
 * ///
 *
 * === Content Filtering & Formatting ===
 * ==
 * #### 1) Tag & Element Control
 * @property {string} [elementWhitelist=""] - Specifies HTML elements to additionally allow beyond the default allow list.
 * - Delimiter: "|" (e.g. "p|div", "*").
 * - Added to the default list determined by {@link PrivateBaseOptions.__defaultElementWhitelist}.
 * @property {string} [elementBlacklist=""] - Specifies HTML elements that should not be used.
 * - Delimiter: "|" (e.g. "script|style").
 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
 * @property {string} [allowedEmptyTags=CONSTANTS.ALLOWED_EMPTY_NODE_LIST] - A list of tags that are allowed to be kept even if their values are empty.
 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}
 * - Concatenated with `ALLOWED_EMPTY_NODE_LIST` to form the final `allowedEmptyTags` list.
 * @property {string} [allowedClassName=""] - Allowed class names.
 * - Added the default value {@link DEFAULTS.CLASS_NAME}
 * ///
 *
 * #### 2) Attribute Control
 * @property {{[key: string]: string|undefined}} [attributeWhitelist=null] - Specifies additional attributes to allow for each tag.
 * - (e.g. {a: "href|target", img: "src|alt", "*": "id"})
 * - Rules specified here will be merged into {@link PrivateBaseOptions.__defaultAttributeWhitelist}.
 * @property {{[key: string]: string|undefined}} [attributeBlacklist=null] - Specifies attributes to disallow by tag.
 * - (e.g. {a: "href|target", img: "src|alt", "*": "name"})
 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
 * ///
 *
 * #### 3) Text & Inline Style Control
 * @property {string} [textStyleTags=__textStyleTags] - Additional text style tags.
 * - The default follows {@link PrivateBaseOptions.__textStyleTags}
 * @property {Object<string, string>} [convertTextTags={bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}] - Maps text styles to specific HTML tags.
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles.
 * - Delimiter: "|" (e.g. "color|background-color").
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags.
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
 * @property {string} [lineAttrReset=""] - Line properties that should be reset when changing lines (e.g. "id|name").
 * @property {string} [formatLine=__defaultFormatLine] - Additionally allowed `line` elements beyond the default. Delimiter: "|" (e.g. "p|div").
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatLine} to form the final `line` list.
 * - `line` element also contains `brLine` element.
 * @property {string} [formatBrLine=__defaultFormatBrLine] - Additionally allowed `brLine` elements beyond the default. (e.g. "PRE").
 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatBrLine} to form the final `brLine` list.
 * - `brLine` elements are included in the `line` element.
 * - `brLine` elements' line break is `BR` tag.
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
 * @property {Object} [subToolbar={}] - Sub-toolbar configuration.
 * @property {SunEditor.UI.ButtonList} [subToolbar.buttonList] - List of Sub-toolbar buttons, grouped by sub-arrays.
 * @property {"balloon"|"balloon-always"} [subToolbar.mode="balloon"] - Sub-toolbar mode: `balloon`, `balloon-always`.
 * @property {string} [subToolbar.width="auto"] - Sub-toolbar width.
 * @property {?HTMLElement} [statusbar_container] - Container element for the status bar.
 * @property {boolean} [shortcutsHint=true] - Displays shortcut hints in tooltips.
 * @property {boolean} [shortcutsDisable=false] - Disables keyboard shortcuts.
 * @property {{[key: string]: Array<string>|undefined}} [shortcuts={}] - Custom keyboard shortcuts.
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
 * @property {?string} [previewTemplate=null] - Custom template for preview mode.
 * @property {?string} [printTemplate=null] - Custom template for print mode.
 * @property {SunEditor.ComponentInsertType} [componentInsertBehavior="auto"] - Enables automatic selection of inserted components.
 * - For inline components: places cursor near the component, or selects if no nearby range.
 * - For block components: executes behavior based on `selectMode`:
 *    - `auto`: Move cursor to the next line if possible, otherwise select the component.
 *    - `select`: Always select the inserted component.
 *    - `line`: Move cursor to the next line if possible, or create a new line and move there.
 *    - `none`: Do nothing.
 * @property {?string} [defaultUrlProtocol=null] - Default URL protocol for links.
 * @property {Object<"copy", number>} [toastMessageTime={copy: 1500}] - {"copy": 1500} - Duration for displaying toast messages.
 * @property {boolean} [freeCodeViewMode=false] - Enables free code view mode.
 *
 * === Dynamic Options ===
 * @property {Object<string, *>} [externalLibs] - External libraries like CodeMirror or MathJax.
 * - See {@link https://github.com/ARA-developer/suneditor/blob/develop/guide/external-libraries.md External Libraries Guide}
 * @property {Object<string, boolean>} [allowedExtraTags=CONSTANTS.EXTRA_TAG_MAP] - Specifies extra allowed or disallowed tags.
 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}
 * ///
 *
 * === User Events ===
 * @property {SunEditor.Event.Handlers} [events] - User event handlers configuration
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
 * @property {boolean} [codeMirror6Editor] - Whether CodeMirror 6 is available (base-level flag).
 * - Frame-level stores the actual EditorView instance.
 * @property {boolean} [codeMirror5Editor] - Whether CodeMirror 5 is available (base-level flag). Frame-level stores the actual CM5 instance.
 * @property {boolean} [hasCodeMirror] - Uses CodeMirror for code view.
 *
 * @property {Set<string>} [allUsedStyles] - Processed set of all allowed CSS styles.
 * - Converted from user's `string` input ("|" delimited) to `Set<string>` in constructor.
 */
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
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - `fixed` → Immutable / `null` → Resettable.
 * @type {Partial<Object<keyof EditorInitOptions, "fixed" | true>>}
 */
export const OPTION_FRAME_FIXED_FLAG: Partial<any>;
/**
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - `fixed` → Immutable / `null` → Resettable.
 * @type {Partial<Object<keyof EditorInitOptions, "fixed" | true>>}
 */
export const OPTION_FIXED_FLAG: Partial<any>;
/**
 * **Frame-level editable area options**
 * -----------------
 *
 * === Content & Editing ===
 */
export type EditorFrameOptions = {
	/**
	 * - Initial value for the editor.
	 */
	value?: string;
	/**
	 * - Placeholder text.
	 */
	placeholder?: string;
	/**
	 * - Attributes for the editable frame[.sun-editor-editable]. (e.g. [key]: value)
	 * ///
	 *
	 * === Layout & Sizing ===
	 */
	editableFrameAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Width for the editor.
	 */
	width?: string | number;
	/**
	 * - Min width for the editor.
	 */
	minWidth?: string | number;
	/**
	 * - Max width for the editor.
	 */
	maxWidth?: string | number;
	/**
	 * - Height for the editor.
	 */
	height?: string | number;
	/**
	 * - Min height for the editor.
	 */
	minHeight?: string | number;
	/**
	 * - Max height for the editor.
	 */
	maxHeight?: string | number;
	/**
	 * - Style string of the top frame of the editor. (e.g. "border: 1px solid #ccc;").
	 * ///
	 *
	 * === Iframe Mode ===
	 */
	editorStyle?: string;
	/**
	 * - Content will be placed in an iframe and isolated from the rest of the page.
	 */
	iframe?: boolean;
	/**
	 * - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the `iframe`.
	 */
	iframe_fullPage?: boolean;
	/**
	 * - Attributes of the `iframe`. (e.g. {'allow-scripts': 'true'})
	 */
	iframe_attributes?: {
		[x: string]: string;
	};
	/**
	 * - CSS files to apply inside the iframe.
	 * - String: Filename pattern to search in document `<link>` tags.
	 * - (e.g. "suneditor" or "suneditor.[a-z0-9]+" matches "suneditor.abc123.css")
	 * - "*": Wildcard to include ALL stylesheets from the page.
	 * - Array: Multiple patterns (e.g. ["suneditor", "custom", "*"]).
	 * - Absolute URLs and data URLs (data:text/css,) are also supported.
	 * ///
	 *
	 * === Statusbar & Character Counter ===
	 */
	iframe_cssFileName?: Array<string>;
	/**
	 * - Enables the status bar.
	 */
	statusbar?: boolean;
	/**
	 * - Displays the current node structure in the status bar.
	 */
	statusbar_showPathLabel?: boolean;
	/**
	 * - Enables resize function of the bottom status bar.
	 */
	statusbar_resizeEnable?: boolean;
	/**
	 * - Shows the number of characters in the editor.
	 * - If the `maxCharCount` option has a value, it becomes `true`.
	 */
	charCounter?: boolean;
	/**
	 * - The maximum number of characters allowed to be inserted into the editor.
	 */
	charCounter_max?: number | null;
	/**
	 * - Text to be displayed in the `charCounter` area of the bottom bar. (e.g. "Characters : 20/200")
	 */
	charCounter_label?: string | null;
	/**
	 * - Defines the calculation method of the `charCounter` option.
	 * - `char`: Characters length.
	 * - `byte`: Binary data size of characters.
	 * - `byte-html`: Binary data size of the full HTML string.
	 */
	charCounter_type?: 'char' | 'byte' | 'byte-html';
};
export type OptionStyleResult = {
	/**
	 * - Styles applied to the top container (e.g. width, z-index, etc).
	 */
	top: string;
	/**
	 * - Styles applied to the iframe container (e.g. height, min-height).
	 */
	frame: string;
	/**
	 * - Styles applied to the editable content area.
	 */
	editor: string;
};
/**
 * **Runtime-only frame options (computed internally, cannot be set by users)**
 */
export type InternalFrameOptions = {
	/**
	 * - Status bar event configuration.
	 */
	__statusbarEvent?: any;
	/**
	 * - origin frame options
	 */
	_origin: SunEditor.InitFrameOptions;
	/**
	 * - Enables fixed positioning for the editor frame.
	 */
	_defaultStyles?: OptionStyleResult;
	/**
	 * - CodeMirror5 editor instance (frame-level). Set by `_checkCodeMirror` after initialization.
	 */
	codeMirror5Editor?: any;
	/**
	 * - CodeMirror6 EditorView instance (frame-level). Set by `_checkCodeMirror` after initialization.
	 */
	codeMirror6Editor?: any;
};
export type AllFrameOptions = EditorFrameOptions & InternalFrameOptions;
export type TransformedFrameOptionKeys = 'width' | 'minWidth' | 'maxWidth' | 'height' | 'minHeight' | 'maxHeight';
export type TransformedFrameOptions = {
	width: string;
	minWidth: string;
	maxWidth: string;
	height: string;
	minHeight: string;
	maxHeight: string;
};
export type ProcessedFrameOptions = Omit<AllFrameOptions, TransformedFrameOptionKeys> & TransformedFrameOptions;
/**
 * **Advanced internal options (user-configurable, prefixed with `__`)**
 * -----------------
 *
 * === Defaults & Whitelists ===
 */
export type PrivateBaseOptions = {
	/**
	 * - The basic tags that serves as the base for `textStyleTags`
	 * - The default follows {@link DEFAULTS.TEXT_STYLE_TAGS}
	 */
	__textStyleTags?: string;
	/**
	 * - The basic tags that serves as the base for `tagStyles`
	 * - The default follows {@link DEFAULTS.TAG_STYLES}
	 */
	__tagStyles?: {
		[x: string]: string;
	};
	/**
	 * - A custom string used to construct a list of HTML elements to allow.
	 * - The final list (regex pattern) is dynamically generated according to the following rules:
	 * - A list of required elements, {@link DEFAULTS.REQUIRED_ELEMENT_WHITELIST}, is always included.
	 * - If this option (`__defaultElementWhitelist`) is provided as a string: That value is used.
	 * - If not provided or not a string: The default {@link DEFAULTS.ELEMENT_WHITELIST} is used.
	 * - 1. If no options are given, the final pattern is:
	 * - 'a|img|p|div|...' (REQUIRED + DEFAULT)
	 * - 2. If options are given directly, the final pattern is:
	 * - 'a|img|custom|tags' (REQUIRED + options.__defaultElementWhitelist)
	 */
	__defaultElementWhitelist?: string;
	/**
	 * - A complete list of attributes that are allowed by default on all tags.
	 * - Delimiter: "|" (e.g. "href|target").
	 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}///
	 *
	 * === Formatting  ===
	 */
	__defaultAttributeWhitelist?: string;
	/**
	 * - Specifies the tag to be used as the editor's default `line` element.
	 * - The default follows {@link DEFAULTS.FORMAT_LINE}
	 */
	__defaultFormatLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default `brLine` element.
	 * - The default follows {@link DEFAULTS.FORMAT_BR_LINE}
	 */
	__defaultFormatBrLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default `closureBrLine` element.
	 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BR_LINE}
	 */
	__defaultFormatClosureBrLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default `block` element.
	 * - The default follows {@link DEFAULTS.FORMAT_BLOCK}
	 */
	__defaultFormatBlock?: string;
	/**
	 * - Specifies the tag to be used as the editor's default `closureBlock` element.
	 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BLOCK}///
	 *
	 * === Filters & Behavior ===
	 */
	__defaultFormatClosureBlock?: string;
	/**
	 * - Line format filter configuration.
	 */
	__lineFormatFilter?: boolean;
	/**
	 * - Defines the styles applied directly to `<li>` when a text style is set on the entire list item.
	 * - For example, when changing the font size or color of a list item (`<li>`),
	 * - these styles apply to the `<li>` tag instead of wrapping content in additional tags.
	 */
	__listCommonStyle?: Array<string>;
	/**
	 * - Plugin retain filter configuration. (Internal use primarily)
	 * - You can turn it off/on globally with `true`/`false` or set it per plugin. (e.g. { table: false })
	 */
	__pluginRetainFilter?:
		| {
				pluginName: string;
				we: boolean;
		  }
		| boolean;
};
/**
 * **Top-level editor configuration**
 * -----------------
 *
 * === Plugins & Toolbar ===
 */
export type EditorBaseOptions = {
	/**
	 * - Plugin configuration.
	 */
	plugins?:
		| {
				[x: string]: any;
		  }
		| Array<{
				[x: string]: any;
		  }>;
	/**
	 * - Plugin configuration.
	 */
	excludedPlugins?: Array<string>;
	/**
	 * - List of toolbar buttons, grouped by sub-arrays.
	 * - The default follows {@link DEFAULTS.BUTTON_LIST}///
	 *
	 * === Modes & Themes ===
	 */
	buttonList?: SunEditor.UI.ButtonList;
	/**
	 * - Enables migration mode for SunEditor v2.
	 */
	v2Migration?: boolean;
	/**
	 * - Toolbar mode: `classic`, `inline`, `balloon`, `balloon-always`.
	 */
	mode?: 'classic' | 'inline' | 'balloon' | 'balloon-always';
	/**
	 * - Editor type: `document:header,page`.
	 */
	type?: string;
	/**
	 * - Editor theme.
	 */
	theme?: string;
	/**
	 * - Language configuration. default : EN
	 */
	lang?: {
		[x: string]: string;
	};
	/**
	 * - Overrides the default icons.
	 */
	icons?: {
		[x: string]: string;
	};
	/**
	 * - Text direction: `ltr` or `rtl`.
	 */
	textDirection?: 'ltr' | 'rtl';
	/**
	 * - An array of command pairs whose shortcut icons should be opposite each other.
	 * - Depends on the `textDirection` mode.
	 * ///
	 *
	 * === Strict & Advanced Filtering ===
	 */
	reverseButtons?: Array<string>;
	/**
	 * - Enables strict filtering of tags, attributes, and styles.
	 * - Use `true` to enable all filters (default), or an object to control individual filters.
	 * - Setting `false` is not supported; use the object form to disable specific filters instead.
	 * - :filter description
	 * - `tagFilter`: Filters disallowed HTML tags (`elementWhitelist`/`elementBlacklist`)
	 * - `formatFilter`: Filters format elements (`formatLine`/`formatBlock`)
	 * - `classFilter`: Filters disallowed CSS class names (`allowedClassName`)
	 * - `textStyleTagFilter`: Filters text style tags (b, i, u, span, etc.)
	 * - `attrFilter`: Filters disallowed HTML attributes (`attributeWhitelist`/`attributeBlacklist`)
	 * - `styleFilter`: Filters disallowed inline styles (`spanStyles`/`lineStyles`/`allUsedStyles`)
	 */
	strictMode?:
		| true
		| {
				tagFilter: boolean;
				formatFilter: boolean;
				classFilter: boolean;
				textStyleTagFilter: boolean;
				attrFilter: boolean;
				styleFilter: boolean;
		  };
	/**
	 * - Tags treated as whole units when selecting all content.
	 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}///
	 *
	 * === Content Filtering & Formatting ===
	 * ==
	 * #### 1) Tag & Element Control
	 */
	scopeSelectionTags?: Array<string>;
	/**
	 * - Specifies HTML elements to additionally allow beyond the default allow list.
	 * - Delimiter: "|" (e.g. "p|div", "*").
	 * - Added to the default list determined by {@link PrivateBaseOptions.__defaultElementWhitelist}.
	 */
	elementWhitelist?: string;
	/**
	 * - Specifies HTML elements that should not be used.
	 * - Delimiter: "|" (e.g. "script|style").
	 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
	 */
	elementBlacklist?: string;
	/**
	 * - A list of tags that are allowed to be kept even if their values are empty.
	 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}- Concatenated with `ALLOWED_EMPTY_NODE_LIST` to form the final `allowedEmptyTags` list.
	 */
	allowedEmptyTags?: string;
	/**
	 * - Allowed class names.
	 * - Added the default value {@link DEFAULTS.CLASS_NAME}///
	 *
	 * #### 2) Attribute Control
	 */
	allowedClassName?: string;
	/**
	 * - Specifies additional attributes to allow for each tag.
	 * - (e.g. {a: "href|target", img: "src|alt", "*": "id"})
	 * - Rules specified here will be merged into {@link PrivateBaseOptions.__defaultAttributeWhitelist}.
	 */
	attributeWhitelist?: {
		[key: string]: string | undefined;
	};
	/**
	 * - Specifies attributes to disallow by tag.
	 * - (e.g. {a: "href|target", img: "src|alt", "*": "name"})
	 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
	 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
	 * ///
	 *
	 * #### 3) Text & Inline Style Control
	 */
	attributeBlacklist?: {
		[key: string]: string | undefined;
	};
	/**
	 * - Additional text style tags.
	 * - The default follows {@link PrivateBaseOptions.__textStyleTags}
	 */
	textStyleTags?: string;
	/**
	 * - Maps text styles to specific HTML tags.
	 */
	convertTextTags?: {
		[x: string]: string;
	};
	/**
	 * - Specifies additional styles to the list of allowed styles.
	 * - Delimiter: "|" (e.g. "color|background-color").
	 */
	allUsedStyles?: string;
	/**
	 * - Specifies allowed styles for HTML tags.
	 */
	tagStyles?: {
		[x: string]: string;
	};
	/**
	 * - Specifies allowed styles for the `span` tag.
	 * - The default follows {@link DEFAULTS.SPAN_STYLES}
	 */
	spanStyles?: string;
	/**
	 * - Specifies allowed styles for the `line` element (p..).
	 * - The default follows {@link DEFAULTS.LINE_STYLES}
	 */
	lineStyles?: string;
	/**
	 * - Allowed font size units.
	 * - The default follows {@link DEFAULTS.SIZE_UNITS}
	 */
	fontSizeUnits?: Array<string>;
	/**
	 * - Determines how inline elements (e.g. `<span>`, `<strong>`) are handled when deleting text.
	 * - `repeat`: Styles are retained unless backspace is repeatedly pressed.
	 * - Continuous pressing will eventually remove the styles.
	 * - `none`: Styles are not retained. Inline elements are immediately removed with the text.
	 * - `always`: Styles persist indefinitely unless explicitly removed.
	 * - Even if all text inside an inline element is deleted, the element itself remains.
	 * ///
	 *
	 * #### 4) Line & Block Formatting
	 */
	retainStyleMode?: 'repeat' | 'always' | 'none';
	/**
	 * - Default `line` element when inserting new lines.
	 */
	defaultLine?: string;
	/**
	 * - Specifies the default line break format.
	 * - [Recommended] `line` : Line break is divided into general tags.
	 * - [Not recommended] `br` : Line breaks are treated as <br> on the same line. (like shift+enter)
	 * - Line breaks are handled as <br> within `line`.
	 * - You can create a new `line` by entering a line break twice in a row.
	 * - Formats that include `line`, such as "Quote", still operate on a `line` basis.
	 * - suneditor processes work in `line` units.
	 * - When set to `br`, performance may decrease when editing a lot of data.
	 */
	defaultLineBreakFormat?: 'line' | 'br';
	/**
	 * - Line properties that should be reset when changing lines (e.g. "id|name").
	 */
	lineAttrReset?: string;
	/**
	 * - Additionally allowed `line` elements beyond the default. Delimiter: "|" (e.g. "p|div").
	 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatLine} to form the final `line` list.
	 * - `line` element also contains `brLine` element.
	 */
	formatLine?: string;
	/**
	 * - Additionally allowed `brLine` elements beyond the default. (e.g. "PRE").
	 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatBrLine} to form the final `brLine` list.
	 * - `brLine` elements are included in the `line` element.
	 * - `brLine` elements' line break is `BR` tag.
	 * - ※ Entering the Enter key on the last line ends `brLine` and appends `line`.
	 */
	formatBrLine?: string;
	/**
	 * - Additionally allowed `closureBrLine` elements beyond the default.
	 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatClosureBrLine} for the final `closureBrLine` list.
	 * - `closureBrLine` elements are included in the `brLine`.
	 * - `closureBrLine` elements' line break is `BR` tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 */
	formatClosureBrLine?: string;
	/**
	 * - Additionally allowed `block` elements beyond the default.
	 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatBlock} to form the final `block` list.
	 * - `block` wraps the `line` and `component`.
	 */
	formatBlock?: string;
	/**
	 * - Additionally allowed `closureBlock` elements beyond the default.
	 * - Concatenated with {@link PrivateBaseOptions.__defaultFormatClosureBlock} for the final `closureBlock` list.
	 * - `closureBlock` elements are included in the `block`.
	 * - `closureBlock` element wraps the `line` and `component`.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. (e.g. format of table cells)
	 * ///
	 *
	 * === UI & Interaction ===
	 */
	formatClosureBlock?: string;
	/**
	 * - Closes modals when clicking outside.
	 */
	closeModalOutsideClick?: boolean;
	/**
	 * - Synchronizes tab indent with spaces.
	 */
	syncTabIndent?: boolean;
	/**
	 * - Disables tab key input.
	 */
	tabDisable?: boolean;
	/**
	 * - Toolbar width.
	 */
	toolbar_width?: string;
	/**
	 * - Container element for the toolbar.
	 */
	toolbar_container?: HTMLElement | null;
	/**
	 * - Enables sticky toolbar with optional offset.
	 */
	toolbar_sticky?: number;
	/**
	 * - Hides toolbar initially.
	 */
	toolbar_hide?: boolean;
	/**
	 * - Sub-toolbar configuration.
	 */
	subToolbar?: {
		buttonList?: SunEditor.UI.ButtonList;
		mode?: 'balloon' | 'balloon-always';
		width?: string;
	};
	/**
	 * - Container element for the status bar.
	 */
	statusbar_container?: HTMLElement | null;
	/**
	 * - Displays shortcut hints in tooltips.
	 */
	shortcutsHint?: boolean;
	/**
	 * - Disables keyboard shortcuts.
	 */
	shortcutsDisable?: boolean;
	/**
	 * - Custom keyboard shortcuts.
	 * ///
	 *
	 * === Advanced Features ===
	 */
	shortcuts?: {
		[key: string]: Array<string> | undefined;
	};
	/**
	 * - Keeps the format of the copied content.
	 */
	copyFormatKeepOn?: boolean;
	/**
	 * - Automatically converts URLs into hyperlinks. (`Link` plugin required)
	 * - Default: `Boolean(plugins.link)` — determined by whether the `link` plugin is enabled.
	 */
	autoLinkify?: boolean;
	/**
	 * - Styles applied automatically on text input.
	 */
	autoStyleify?: Array<string>;
	/**
	 * - Delay time for history stack updates (ms).
	 */
	historyStackDelayTime?: number;
	/**
	 * - Class name for printing.
	 */
	printClass?: string;
	/**
	 * - Offset applied when entering fullscreen mode.
	 */
	fullScreenOffset?: number;
	/**
	 * - Custom template for preview mode.
	 */
	previewTemplate?: string | null;
	/**
	 * - Custom template for print mode.
	 */
	printTemplate?: string | null;
	/**
	 * - Enables automatic selection of inserted components.
	 * - For inline components: places cursor near the component, or selects if no nearby range.
	 * - For block components: executes behavior based on `selectMode`:
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	componentInsertBehavior?: SunEditor.ComponentInsertType;
	/**
	 * - Default URL protocol for links.
	 */
	defaultUrlProtocol?: string | null;
	/**
	 * - {"copy": 1500} - Duration for displaying toast messages.
	 */
	toastMessageTime?: any;
	/**
	 * - Enables free code view mode.
	 *
	 * === Dynamic Options ===
	 */
	freeCodeViewMode?: boolean;
	/**
	 * - External libraries like CodeMirror or MathJax.
	 * - See {@link https://github.com/ARA-developer/suneditor/blob/develop/guide/external-libraries.md External Libraries Guide}
	 */
	externalLibs?: {
		[x: string]: any;
	};
	/**
	 * - Specifies extra allowed or disallowed tags.
	 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}///
	 *
	 * === User Events ===
	 */
	allowedExtraTags?: {
		[x: string]: boolean;
	};
	/**
	 * - User event handlers configuration
	 * ///
	 *
	 * === [ Plugin-Specific Options ] ===
	 * ---[ Auto-generated by scripts/check/inject-plugin-jsdoc.cjs - DO NOT EDIT MANUALLY ]---
	 */
	events?: SunEditor.Event.Handlers;
	align?: import('../../plugins/dropdown/align.js').AlignPluginOptions;
	audio?: import('../../plugins/modal/audio.js').AudioPluginOptions;
	audioGallery?: import('../../plugins/browser/audioGallery.js').AudioGalleryPluginOptions;
	backgroundColor?: import('../../plugins/dropdown/backgroundColor.js').BackgroundColorPluginOptions;
	blockStyle?: import('../../plugins/dropdown/blockStyle.js').BlockStylePluginOptions;
	drawing?: import('../../plugins/modal/drawing.js').DrawingPluginOptions;
	embed?: import('../../plugins/modal/embed.js').EmbedPluginOptions;
	exportPDF?: import('../../plugins/command/exportPDF.js').ExportPDFPluginOptions;
	fileBrowser?: import('../../plugins/browser/fileBrowser.js').FileBrowserPluginOptions;
	fileGallery?: import('../../plugins/browser/fileGallery.js').FileGalleryPluginOptions;
	fileUpload?: import('../../plugins/command/fileUpload.js').FileUploadPluginOptions;
	font?: import('../../plugins/dropdown/font.js').FontPluginOptions;
	fontColor?: import('../../plugins/dropdown/fontColor.js').FontColorPluginOptions;
	fontSize?: import('../../plugins/input/fontSize.js').FontSizePluginOptions;
	hr?: import('../../plugins/dropdown/hr.js').HRPluginOptions;
	image?: import('../../plugins/modal/image/index.js').ImagePluginOptions;
	imageGallery?: import('../../plugins/browser/imageGallery.js').ImageGalleryPluginOptions;
	layout?: import('../../plugins/dropdown/layout.js').LayoutPluginOptions;
	lineHeight?: import('../../plugins/dropdown/lineHeight.js').LineHeightPluginOptions;
	link?: import('../../plugins/modal/link.js').LinkPluginOptions;
	math?: import('../../plugins/modal/math.js').MathPluginOptions;
	mention?: import('../../plugins/field/mention.js').MentionPluginOptions;
	paragraphStyle?: import('../../plugins/dropdown/paragraphStyle.js').ParagraphStylePluginOptions;
	table?: import('../../plugins/dropdown/table/index.js').TablePluginOptions;
	template?: import('../../plugins/dropdown/template.js').TemplatePluginOptions;
	textStyle?: import('../../plugins/dropdown/textStyle.js').TextStylePluginOptions;
	video?: import('../../plugins/modal/video/index.js').VideoPluginOptions;
	/**
	 * ///
	 * ---[ End of auto-generated plugin options ]---
	 * ================================================================================================================================
	 */
	videoGallery?: import('../../plugins/browser/videoGallery.js').VideoGalleryPluginOptions;
};
/**
 * **Runtime-only base options (computed internally, cannot be set by users)**
 */
export type InternalBaseOptions = {
	/**
	 * - Computed className for the selected theme (e.g., `se-theme-default`).
	 */
	_themeClass?: string;
	/**
	 * - Additional sub-type string from the `type` option (after `:`).
	 */
	_type_options?: string;
	/**
	 * - Preprocessed allowed tag string for RegExp (e.g., "mark|figure").
	 */
	_allowedExtraTag?: string;
	/**
	 * - Preprocessed disallowed tag string.
	 */
	_disallowedExtraTag?: string;
	/**
	 * - Final computed editable class (used in editor wrapper).
	 */
	_editableClass?: string;
	/**
	 * - Whether text direction is RTL.
	 */
	_rtl?: boolean;
	/**
	 * - Internal key shortcut matcher for reverse commands.
	 */
	_reverseCommandArray?: string[];
	/**
	 * - Sub toolbar mode (e.g., `balloon`).
	 */
	_subMode?: string;
	/**
	 * - Tag names used for text styling, plus span/li.
	 */
	_textStyleTags?: string[];
	/**
	 * - Regex to match inline styles (e.g., fontSize, color).
	 */
	_textStylesRegExp?: RegExp;
	/**
	 * - Regex to match line styles (e.g., text-align, padding).
	 */
	_lineStylesRegExp?: RegExp;
	/**
	 * - Mapping HTML tag => standard tag.
	 */
	_defaultStyleTagMap?: {
		[x: string]: string;
	};
	/**
	 * - Mapping HTML tag => command (e.g., bold, underline).
	 */
	_styleCommandMap?: {
		[x: string]: string;
	};
	/**
	 * - Mapping command => preferred tag.
	 */
	_defaultTagCommand?: {
		[x: string]: string;
	};
	/**
	 * - Element whitelist regex pattern for the editor.
	 */
	_editorElementWhitelist?: string;
	/**
	 * - List of currently used toolbar buttons
	 */
	buttons?: Set<any>;
	/**
	 * - List of currently used sub-toolbar buttons
	 */
	buttons_sub?: Set<any>;
	/**
	 * - Sub-toolbar width.
	 */
	toolbar_sub_width?: string;
	/**
	 * - Merged reverse command pairs array.
	 * - Includes default `indent-outdent` + user's `reverseButtons`.
	 */
	reverseCommands?: string[];
	/**
	 * - CodeMirror configuration object from `externalLibs.codeMirror`.
	 */
	codeMirror?: any;
	/**
	 * - Whether CodeMirror 6 is available (base-level flag).
	 * - Frame-level stores the actual EditorView instance.
	 */
	codeMirror6Editor?: boolean;
	/**
	 * - Whether CodeMirror 5 is available (base-level flag). Frame-level stores the actual CM5 instance.
	 */
	codeMirror5Editor?: boolean;
	/**
	 * - Uses CodeMirror for code view.
	 */
	hasCodeMirror?: boolean;
	/**
	 * - Processed set of all allowed CSS styles.
	 * - Converted from user's `string` input ("|" delimited) to `Set<string>` in constructor.
	 */
	allUsedStyles?: Set<string>;
};
export type EditorInitOptions = EditorBaseOptions & PrivateBaseOptions & EditorFrameOptions;
export type AllBaseOptions = EditorBaseOptions & PrivateBaseOptions & InternalBaseOptions;
export type TransformedOptionKeys = 'formatClosureBrLine' | 'formatBrLine' | 'formatLine' | 'formatClosureBlock' | 'formatBlock' | 'toolbar_width' | 'toolbar_container' | 'toolbar_sticky' | 'strictMode' | 'lineAttrReset';
export type StrictModeOptions = {
	/**
	 * - Filters disallowed HTML tags (`elementWhitelist`/`elementBlacklist`)
	 */
	tagFilter: boolean;
	/**
	 * - Filters format elements (`formatLine`/`formatBlock`)
	 */
	formatFilter: boolean;
	/**
	 * - Filters disallowed CSS class names (`allowedClassName`)
	 */
	classFilter: boolean;
	/**
	 * - Filters text style tags (b, i, u, span, etc.)
	 */
	textStyleTagFilter: boolean;
	/**
	 * - Filters disallowed HTML attributes (`attributeWhitelist`/`attributeBlacklist`)
	 */
	attrFilter: boolean;
	/**
	 * - Filters disallowed inline styles (`spanStyles`/`lineStyles`/`allUsedStyles`)
	 */
	styleFilter: boolean;
};
export type TransformedOptions = {
	formatClosureBrLine: {
		reg: RegExp;
		str: string;
	};
	formatBrLine: {
		reg: RegExp;
		str: string;
	};
	formatLine: {
		reg: RegExp;
		str: string;
	};
	formatClosureBlock: {
		reg: RegExp;
		str: string;
	};
	formatBlock: {
		reg: RegExp;
		str: string;
	};
	toolbar_width: string;
	toolbar_container: HTMLElement | null;
	toolbar_sticky: number;
	strictMode: StrictModeOptions;
	lineAttrReset: string[];
};
export type ProcessedBaseOptions = Omit<AllBaseOptions, TransformedOptionKeys> & TransformedOptions;
