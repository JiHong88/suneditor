/** --+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+-- */
/**
 * ================================================================================================================================
 * === UTILITIES : Manage Option Map ⭐️
 * =================================================================================================================================
 */
/**
 * @typedef {Object} BaseOptionsMap
 * @description A Map containing all processed editor base options.
 * - This Map contains all keys from {@link AllBaseOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link AllBaseOptions} for details)
 *
 * @property {(k: keyof AllBaseOptions) => *} get - Retrieves the value of a specific option.
 * @property {(k: keyof AllBaseOptions, v: *) => void} set - Sets the value of a specific option.
 * @property {(k: keyof AllBaseOptions) => boolean} has - Checks if a specific option exists.
 * @property {() => Object<keyof AllBaseOptions, *>} getAll - Retrieves all options as an object.
 * @property {(options: Object<keyof AllBaseOptions, *>) => void} setMany - Sets multiple options at once.
 * @property {(newMap: Map<string, *>) => void} reset - Replaces all options with a new Map.
 * @property {() => void} clear - Clears all stored options.
 */
/**
 * @typedef {Object} FrameOptionsMap
 * @description A Map containing all processed frame-level options.
 * - This Map contains all keys from {@link AllFrameOptions}, where:
 * - Keys are option names (string)
 * - Values depend on the specific option (see {@link AllFrameOptions} for details)
 *
 * @property {(k: keyof AllFrameOptions) => *} get - Retrieves the value of a specific option.
 * @property {(k: keyof AllFrameOptions, v: *) => void} set - Sets the value of a specific option.
 * @property {(k: keyof AllFrameOptions) => boolean} has - Checks if a specific option exists.
 * @property {() => Object<keyof AllFrameOptions, *>} getAll - Retrieves all options as an object.
 * @property {(options: Object<keyof AllFrameOptions, *>) => void} setMany - Sets multiple options at once.
 * @property {(newMap: Map<string, *>) => void} reset - Replaces all options with a new Map.
 * @property {() => void} clear - Clears all stored options.
 */
/** ================================================================================================================================= */
/** ================================================================================================================================= */
/**
 * @description Creates a utility wrapper for editor frame options.
 * Provides get, set, has, getAll, and setMany methods with internal Map support.
 * @param {*} editor - The editor instance
 * @returns {FrameOptionsMap}
 */
export function FrameOptionsMap(editor: any): FrameOptionsMap;
export type FrameOptionsMap = any;
/**
 * @description Creates a utility wrapper for editor base options.
 * - Provides get, set, has, getAll, and setMany methods with internal Map support.
 * @param {*} editor - The editor instance
 * @returns {BaseOptionsMap}
 */
export function BaseOptionsMap(editor: any): BaseOptionsMap;
export type BaseOptionsMap = any;
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
		'ol|ul': string;
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
 *
 * === Layout & Sizing ===
 * @property {string} [width="100%"] - Width for the editor.
 * @property {string} [minWidth=""] - Min width for the editor.
 * @property {string} [maxWidth=""] - Max width for the editor.
 * @property {string} [height="auto"] - Height for the editor.
 * @property {string} [minHeight=""] - Min height for the editor.
 * @property {string} [maxHeight=""] - Max height for the editor.
 * @property {string} [editorStyle=""] - Style string of the top frame of the editor. (e.g. "border: 1px solid #ccc;").
 *
 * === Iframe Mode ===
 * @property {boolean} [iframe=false] - Content will be placed in an iframe and isolated from the rest of the page.
 * @property {boolean} [iframe_fullPage=false] - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the "iframe".
 * @property {Object<string, string>} [iframe_attributes={}] - Attributes of the "iframe". (e.g. {'scrolling': 'no'})
 * @property {string} [iframe_cssFileName="suneditor"] - Name or Array of the CSS file to apply inside the iframe.
 * - You can also use regular expressions.
 * - Applied by searching by filename in the link tag of document,
 * - or put the URL value (".css" can be omitted).
 *
 * === Statusbar & Character Counter ===
 * @property {boolean} [statusbar=true] - Enables the status bar.
 * @property {boolean} [statusbar_showPathLabel=true] - Displays the current node structure to status bar.
 * @property {boolean} [statusbar_resizeEnable=true] - Enables resize function of bottom status bar
 * @property {boolean} [charCounter=false] - Shows the number of characters in the editor.
 * - If the maxCharCount option has a value, it becomes true.
 * @property {number} [charCounter_max=null] - The maximum number of characters allowed to be inserted into the editor.
 * @property {string} [charCounter_label=null] - Text to be displayed in the "charCounter" area of the bottom bar. (e.g. "Characters : 20/200")
 * @property {"char"|"byte"|"byte-html"} [charCounter_type="char"] - Defines the calculation method of the "charCounter" option.
 * - 'char': Characters length.
 * - 'byte': Binary data size of characters.
 * - 'byte-html': Binary data size of the full HTML string.
 *
 * === Advanced ===
 * @property {Object} [__statusbarEvent] - Status bar event configuration.
 * ================================================================================================================================
 */
/**
 * @typedef {Object} OptionStyleResult
 * @property {string} top - Styles applied to the top container (e.g. width, z-index, etc).
 * @property {string} frame - Styles applied to the iframe container (e.g. height, min-height).
 * @property {string} editor - Styles applied to the editable content area.
 */
/**
 * ================================================================================================================================
 * @typedef {Object} InternalFrameOptions
 * **Runtime-only frame options (computed internally, cannot be set by users)**
 * @property {OptionStyleResult} [_defaultStyles] - Enables fixed positioning for the editor frame.
 * ================================================================================================================================
 */
/**
 * @typedef {EditorFrameOptions & InternalFrameOptions} AllFrameOptions
 */
/** --+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+-- */
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
 * @property {string} [__textStyleTags=CONSTANTS.TEXT_STYLE_TAGS] - The basic tags that serves as the base for "textStyleTags"
 * - The default follows {@link DEFAULTS.TEXT_STYLE_TAGS}
 * @property {Object<string, string>} [__tagStyles=CONSTANTS.TAG_STYLES] - The basic tags that serves as the base for "tagStyles"
 * - The default follows {@link DEFAULTS.TAG_STYLES}
 * @property {string} [__defaultElementWhitelist] - A custom string used to construct a list of HTML elements to allow.
 * - The final list of allowed elements (regex pattern) is dynamically generated according to the following rules:
 * - A list of required elements, {@link DEFAULTS.REQUIRED_ELEMENT_WHITELIST}, is always included.
 * - If a string value is provided for this option (`__defaultElementWhitelist`):** That string value is used.
 * - If this option is not provided or is not a string: The default constant {@link DEFAULTS.ELEMENT_WHITELIST} is used.
 * - 1. If no options are given, the final pattern is:
 * - 'a|img|p|div|...' (REQUIRED + DEFAULT)
 * - 2. If options are given directly, the final pattern is:
 * - 'a|img|custom|tags' (REQUIRED + options.__defaultElementWhitelist)
 * @property {string} [__defaultAttributeWhitelist=CONSTANTS.ATTRIBUTE_WHITELIST] - A complete list of attributes that are allowed by default on all tags. Delimiter: "|" (e.g. "href|target").
 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}
 *
 *  === Formatting  ===
 * @property {string} [__defaultFormatLine=CONSTANTS.FORMAT_LINE] - Specifies the tag to be used as the editor's default "line" element.
 * - The default follows {@link DEFAULTS.FORMAT_LINE}
 * @property {string} [__defaultFormatBrLine=CONSTANTS.FORMAT_BR_LINE] - Specifies the tag to be used as the editor's default "brLine" element.
 * - The default follows {@link DEFAULTS.FORMAT_BR_LINE}
 * @property {string} [__defaultFormatClosureBrLine=CONSTANTS.FORMAT_CLOSURE_BR_LINE] - Specifies the tag to be used as the editor's default "closureBrLine" element.
 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BR_LINE}
 * @property {string} [__defaultFormatBlock=CONSTANTS.FORMAT_BLOCK] - Specifies the tag to be used as the editor's default "block" element.
 * - The default follows {@link DEFAULTS.FORMAT_BLOCK}
 * @property {string} [__defaultFormatClosureBlock=CONSTANTS.FORMAT_CLOSURE_BLOCK] - Specifies the tag to be used as the editor's default "closureBlock" element.
 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BLOCK}
 *
 * === Filters & Behavior ===
 * @property {boolean} [__lineFormatFilter=true] - Line format filter configuration.
 * @property {Array<string>} [__listCommonStyle=["fontSize", "color", "fontFamily", "fontWeight", "fontStyle"]] - Defines the list of styles that are applied directly to the `<li>` element
 * - when a text style is applied to the entire list item.
 * - For example, when changing the font size or color of a list item (`<li>`),
 * - these styles will be applied to the `<li>` tag instead of wrapping the content inside additional tags.
 * @property {{pluginName: string, we: boolean}|boolean} [__pluginRetainFilter=true] - Plugin retain filter configuration. (Internal use primarily)
 * - You can turn it off/on globally with true/false or set it per plugin. (e.g. { table: false })
 * @property {boolean} [__allowedScriptTag=false] - Allows the `<script>` tag to be used in the editor.
 * ================================================================================================================================
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
 * @property {Array<string[]|string>} [buttonList=CONSTANTS.BUTTON_LIST] - List of toolbar buttons, grouped by sub-arrays.
 * - The default follows {@link DEFAULTS.BUTTON_LIST}
 *
 * === Modes & Themes ===
 * @property {boolean} [v2Migration=false] - Enables migration mode for SunEditor v2.
 * @property {"classic"|"inline"|"balloon"|"balloon-always"} [mode="classic"] - Toolbar mode: "classic", "inline", "balloon", "balloon-always".
 * @property {string} [type=""] - Editor type: "document:header,page".
 * @property {string} [theme=""] - Editor theme.
 * @property {Object<string, string>} [lang] - Language configuration. default : EN
 * @property {Object<string, string>} [icons] - Overrides the default icons.
 * @property {string} [textDirection="ltr"] - Text direction: "ltr" or "rtl".
 * @property {Array<string>} [reverseButtons=['indent-outdent']] - An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
 *
 * === Strict & Advanced Filtering ===
 * @property {boolean | {
 * 		tagFilter: boolean,
 * 		formatFilter: boolean,
 * 		classFilter: boolean,
 * 		textStyleTagFilter: boolean,
 * 		attrFilter: boolean,
 * 		styleFilter: boolean
 * 	}} [strictMode=true] - Enables strict filtering of tags, attributes, and styles.
 * @property {Array<string>} [scopeSelectionTags=CONSTANTS.SCOPE_SELECTION_TAGS] - Tags treated as whole units when selecting all content.
 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}
 *
 * === Content Filtering & Formatting ===
 * ==
 * #### 1) Tag & Element Control
 * @property {string} [elementWhitelist=""] - Specifies HTML elements to additionally allow beyond the 'default' allow list. Delimiter: "|" (e.g. "p|div", "*").
 * - The value entered here will be added to the end of the default list determined by the {@link PrivateBaseOptions.__defaultElementWhitelist} logic above.
 * @property {string} [elementBlacklist=""] - Filters by specifying HTML elements that should not be used. Delimiter: "|" (e.g. "script|style").
 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
 * @property {string} [allowedEmptyTags=CONSTANTS.ALLOWED_EMPTY_NODE_LIST] - A list of tags that are allowed to be kept even if their values are empty.
 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}
 * - It is concatenated with the value of "ALLOWED_EMPTY_NODE_LIST" to form the final 'allowedEmptyTags' list.
 * @property {string} [allowedClassName=""] - Allowed class names.
 * - Added the default value {@link DEFAULTS.CLASS_NAME}
 *
 * #### 2) Attribute Control
 * @property {Object<string, string>} [attributeWhitelist=null] - Specifies additional attributes to allow for each tag. (e.g. {a: "href|target", img: "src|alt", "*": "id"}).
 * - Rules for objects specified here will be merged into the {@link PrivateBaseOptions.__defaultAttributeWhitelist}.
 * @property {Object<string, string>} [attributeBlacklist=null] - Filter by specifying attributes to disallow by tag. (e.g. {a: "href|target", img: "src|alt", "*": "name"}).
 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
 *
 * #### 3) Text & Inline Style Control
 * @property {string} [textStyleTags=__textStyleTags] - Additional text style tags.
 * - The default follows {@link PrivateBaseOptions.__textStyleTags}
 * @property {Object<string, string>} [convertTextTags={bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}] - Maps text styles to specific HTML tags.
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles. Delimiter: "|" (e.g. "color|background-color").
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags.
 * @property {string} [spanStyles=CONSTANTS.SPAN_STYLES] - Specifies allowed styles for the "span" tag.
 * - The default follows {@link DEFAULTS.SPAN_STYLES}
 * @property {string} [lineStyles=CONSTANTS.LINE_STYLES] - Specifies allowed styles for the "line" element (p..).
 * - The default follows {@link DEFAULTS.LINE_STYLES}
 * @property {Array<string>} [fontSizeUnits=CONSTANTS.SIZE_UNITS] - Allowed font size units.
 * - The default follows {@link DEFAULTS.SIZE_UNITS}
 * @property {"repeat"|"always"|"none"} [retainStyleMode="repeat"] - This option determines how inline elements (such as <span>, <strong>, etc.) are handled when deleting text.
 * - "repeat": Inline styles are retained unless the backspace key is repeatedly pressed. If the user continuously presses backspace, the styles will eventually be removed.
 * - "none": Inline styles are not retained at all. When deleting text, the associated inline elements are immediately removed along with it.
 * - "always": Inline styles persist indefinitely unless explicitly removed. Even if all text inside an inline element is deleted, the element itself remains until manually removed.
 *
 * #### 4) Line & Block Formatting
 * @property {string} [defaultLine="p"] - Default line element when inserting new lines.
 * @property {"line"|"br"} [defaultLineBreakFormat="line"] - Specifies the default line break format.
 * - [Recommended] "line" :  is a line break that is divided into general tags.
 * - [Not recommended] "br" : Line breaks are treated as <br> on the same line. (like shift+enter)
 * - Line breaks are handled as <br> within "line".
 * - You can create a new "line" by entering a line break twice in a row.
 * - Formats that include "line", such as "Quote", still operate on a "line" basis.
 * - ● suneditor processes work in "line" units.
 * - ● When set to "br", performance may decrease when editing a lot of data.
 * @property {string} [lineAttrReset=""] - Line properties that should be reset when changing lines (e.g. "id|name").
 * @property {string} [formatLine=__defaultFormatLine] - Additionally allowed "line" elements beyond the default. Delimiter: "|" (e.g. "p|div").
 * It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatLine} to form the final 'line' element list.
 * - "line" element also contain "brLine" element
 * @property {string} [formatBrLine=__defaultFormatBrLine] - Additionally allowed "brLine" elements beyond the default. (e.g. "PRE").
 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatBrLine} to form the final 'brLine' element list.
 * - "brLine" elements is included in the "line" element.
 * - "brLine" elements's line break is "BR" tag.
 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
 * @property {string} [formatClosureBrLine=__defaultFormatClosureBrLine] - Additionally allowed "closureBrLine" elements beyond the default.
 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatClosureBrLine} to form the final 'closureBrLine' element list.
 * - "closureBrLine" elements is included in the "brLine".
 * - "closureBrLine" elements's line break is "BR" tag.
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [formatBlock=__defaultFormatBlock] - Additionally allowed "block" elements beyond the default.
 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatBlock} to form the final 'block' element list.
 * - "block" is wrap the "line" and "component"
 * @property {string} [formatClosureBlock=__defaultFormatClosureBlock] - Additionally allowed "closureBlock" elements beyond the default.
 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatClosureBlock} to form the final 'closureBlock' element list.
 * - "closureBlock" elements is included in the "block".
 * - "closureBlock" element is wrap the "line" and "component"
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. (e.g. format of table cells)
 *
 * === UI & Interaction ===
 * @property {boolean} [closeModalOutsideClick=false] - Closes modals when clicking outside.
 * @property {boolean} [syncTabIndent=true] - Synchronizes tab indent with spaces.
 * @property {boolean} [tabDisable=false] - Disables tab key input.
 * @property {number|string} [toolbar_width="auto"] - Toolbar width.
 * @property {Element|string} [toolbar_container] - Container element for the toolbar.
 * @property {number} [toolbar_sticky=0] - Enables sticky toolbar with optional offset.
 * @property {boolean} [toolbar_hide=false] - Hides toolbar initially.
 * @property {Object} [subToolbar={}] - Sub-toolbar configuration.
 * @property {Array<Array<string>>} [subToolbar.buttonList] - List of Sub-toolbar buttons, grouped by sub-arrays.
 * @property {"balloon"|"balloon-always"} [subToolbar.mode="balloon"] - Sub-toolbar mode: "balloon", "balloon-always".
 * @property {number|string} [subToolbar.width="auto"] - Sub-toolbar width.
 * @property {Element|string} [statusbar_container] - Container element for the status bar.
 * @property {boolean} [shortcutsHint=true] - Displays shortcut hints in tooltips.
 * @property {boolean} [shortcutsDisable=false] - Disables keyboard shortcuts.
 * @property {Object<string, Array<string>>} [shortcuts={}] - Custom keyboard shortcuts.
 *
 * === Advanced Features ===
 * @property {boolean} [copyFormatKeepOn=false] - Keeps the format of the copied content.
 * @property {boolean} [autoLinkify] - Automatically converts URLs into hyperlinks. ("Link" plugin required)
 * - Default value is determined dynamically based on whether the 'link' plugin is enabled. (default : Boolean(plugins.link))
 * @property {Array<string>} [autoStyleify=["bold", "underline", "italic", "strike"]] - Styles applied automatically on text input.
 * @property {number} [historyStackDelayTime=400] - Delay time for history stack updates (ms).
 * @property {string} [printClass=""] - Class name for printing.
 * @property {number} [fullScreenOffset=0] - Offset applied when entering fullscreen mode.
 * @property {string} [previewTemplate=null] - Custom template for preview mode.
 * @property {string} [printTemplate=null] - Custom template for print mode.
 * @property {__se__ComponentInsertBehaviorType} [componentInsertBehavior="auto"] - Enables automatic selection of inserted components.
 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
 * - For block components: executes behavior based on `selectMode`:
 *    - `auto`: Move cursor to the next line if possible, otherwise select the component.
 *    - `select`: Always select the inserted component.
 *    - `line`: Move cursor to the next line if possible, or create a new line and move there.
 *    - `none`: Do nothing.
 * @property {string} [defaultUrlProtocol=null] - Default URL protocol for links.
 * @property {Object<"copy", number>} [toastMessageTime={copy: 1500}] - {"copy": 1500} - Duration for displaying toast messages.
 * @property {string} [freeCodeViewMode=false] - Enables free code view mode.
 *
 * === Dynamic Options ===
 * @property {Object<string, *>} [externalLibs] - External libraries like CodeMirror or MathJax.
 * @property {Object<string, (...args: *) => *>} [events={}] - Custom event handlers.
 * @property {Object<string, boolean>} [allowedExtraTags=CONSTANTS.EXTRA_TAG_MAP] - Specifies extra allowed or disallowed tags.
 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}
 *
 * === Dynamic Plugin Options ===
 * @property {Object<string, *>} [Dynamic_pluginOptions] - Dynamic plugin options, where the key is the plugin name and the value is its configuration.
 * ================================================================================================================================
 */
/**
 * ================================================================================================================================
 * @typedef {Object} InternalBaseOptions
 * -----------------
 * **Runtime-only base options (computed internally, cannot be set by users)**
 *
 * @property {string} [_themeClass] - Computed className for the selected theme (e.g., 'se-theme-default').
 * @property {string} [_type_options] - Additional sub-type string from the `type` option (after `:`).
 * @property {string} [_allowedExtraTag] - Preprocessed allowed tag string for RegExp (e.g., "mark|figure").
 * @property {string} [_disallowedExtraTag] - Preprocessed disallowed tag string.
 * @property {string} [_editableClass] - Final computed editable class (used in editor wrapper).
 * @property {boolean} [_rtl] - Whether text direction is RTL.
 * @property {string[]} [_reverseCommandArray] - Internal key shortcut matcher for reverse commands.
 * @property {string} [_subMode] - Sub toolbar mode (e.g., 'balloon').
 * @property {Set<string>} [_textStyleTags] - Tag names used for text styling, plus span/li.
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
 *
 * @property {boolean} [hasCodeMirror] - Uses CodeMirror for code view.
 * @property {*} [codeMirror5Editor] - CodeMirror5 support.
 * @property {*} [codeMirror6Editor] - CodeMirror6 support.
 * ================================================================================================================================
 */
/**
 * @typedef {EditorBaseOptions & PrivateBaseOptions & EditorFrameOptions} EditorInitOptions
 */
/**
 * @typedef {EditorBaseOptions & PrivateBaseOptions & InternalBaseOptions} AllBaseOptions
 */
/** --+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+-- */
/**
 * ================================================================================================================================
 * === OPTION FLAGS : Fixed / Resettable
 * =================================================================================================================================
 */
/**
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - 'fixed' → Immutable / null → Resettable.
 * @type {Partial<Object<keyof EditorInitOptions, "fixed" | true>>}
 */
export const OPTION_FRAME_FIXED_FLAG: Partial<any>;
/**
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - 'fixed' → Immutable / null → Resettable.
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
	 *
	 * === Layout & Sizing ===
	 */
	editableFrameAttributes?: {
		[x: string]: string;
	};
	/**
	 * - Width for the editor.
	 */
	width?: string;
	/**
	 * - Min width for the editor.
	 */
	minWidth?: string;
	/**
	 * - Max width for the editor.
	 */
	maxWidth?: string;
	/**
	 * - Height for the editor.
	 */
	height?: string;
	/**
	 * - Min height for the editor.
	 */
	minHeight?: string;
	/**
	 * - Max height for the editor.
	 */
	maxHeight?: string;
	/**
	 * - Style string of the top frame of the editor. (e.g. "border: 1px solid #ccc;").
	 *
	 * === Iframe Mode ===
	 */
	editorStyle?: string;
	/**
	 * - Content will be placed in an iframe and isolated from the rest of the page.
	 */
	iframe?: boolean;
	/**
	 * - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the "iframe".
	 */
	iframe_fullPage?: boolean;
	/**
	 * - Attributes of the "iframe". (e.g. {'scrolling': 'no'})
	 */
	iframe_attributes?: {
		[x: string]: string;
	};
	/**
	 * - Name or Array of the CSS file to apply inside the iframe.
	 * - You can also use regular expressions.
	 * - Applied by searching by filename in the link tag of document,
	 * - or put the URL value (".css" can be omitted).
	 *
	 * === Statusbar & Character Counter ===
	 */
	iframe_cssFileName?: string;
	/**
	 * - Enables the status bar.
	 */
	statusbar?: boolean;
	/**
	 * - Displays the current node structure to status bar.
	 */
	statusbar_showPathLabel?: boolean;
	/**
	 * - Enables resize function of bottom status bar
	 */
	statusbar_resizeEnable?: boolean;
	/**
	 * - Shows the number of characters in the editor.
	 * - If the maxCharCount option has a value, it becomes true.
	 */
	charCounter?: boolean;
	/**
	 * - The maximum number of characters allowed to be inserted into the editor.
	 */
	charCounter_max?: number;
	/**
	 * - Text to be displayed in the "charCounter" area of the bottom bar. (e.g. "Characters : 20/200")
	 */
	charCounter_label?: string;
	/**
	 * - Defines the calculation method of the "charCounter" option.
	 * - 'char': Characters length.
	 * - 'byte': Binary data size of characters.
	 * - 'byte-html': Binary data size of the full HTML string.
	 *
	 * === Advanced ===
	 */
	charCounter_type?: 'char' | 'byte' | 'byte-html';
	/**
	 * - Status bar event configuration.
	 * ================================================================================================================================
	 */
	__statusbarEvent?: any;
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
	 * - Enables fixed positioning for the editor frame.
	 * ================================================================================================================================
	 */
	_defaultStyles?: OptionStyleResult;
};
export type AllFrameOptions = EditorFrameOptions & InternalFrameOptions;
/**
 * **Advanced internal options (user-configurable, prefixed with `__`)**
 * -----------------
 *
 * === Defaults & Whitelists ===
 */
export type PrivateBaseOptions = {
	/**
	 * - The basic tags that serves as the base for "textStyleTags"
	 * - The default follows {@link DEFAULTS.TEXT_STYLE_TAGS}
	 */
	__textStyleTags?: string;
	/**
	 * - The basic tags that serves as the base for "tagStyles"
	 * - The default follows {@link DEFAULTS.TAG_STYLES}
	 */
	__tagStyles?: {
		[x: string]: string;
	};
	/**
	 * - A custom string used to construct a list of HTML elements to allow.
	 * - The final list of allowed elements (regex pattern) is dynamically generated according to the following rules:
	 * - A list of required elements, {@link DEFAULTS.REQUIRED_ELEMENT_WHITELIST}, is always included.
	 * - If a string value is provided for this option (`__defaultElementWhitelist`):** That string value is used.
	 * - If this option is not provided or is not a string: The default constant {@link DEFAULTS.ELEMENT_WHITELIST} is used.
	 * - 1. If no options are given, the final pattern is:
	 * - 'a|img|p|div|...' (REQUIRED + DEFAULT)
	 * - 2. If options are given directly, the final pattern is:
	 * - 'a|img|custom|tags' (REQUIRED + options.__defaultElementWhitelist)
	 */
	__defaultElementWhitelist?: string;
	/**
	 * - A complete list of attributes that are allowed by default on all tags. Delimiter: "|" (e.g. "href|target").
	 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}=== Formatting  ===
	 */
	__defaultAttributeWhitelist?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "line" element.
	 * - The default follows {@link DEFAULTS.FORMAT_LINE}
	 */
	__defaultFormatLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "brLine" element.
	 * - The default follows {@link DEFAULTS.FORMAT_BR_LINE}
	 */
	__defaultFormatBrLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "closureBrLine" element.
	 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BR_LINE}
	 */
	__defaultFormatClosureBrLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "block" element.
	 * - The default follows {@link DEFAULTS.FORMAT_BLOCK}
	 */
	__defaultFormatBlock?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "closureBlock" element.
	 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BLOCK}=== Filters & Behavior ===
	 */
	__defaultFormatClosureBlock?: string;
	/**
	 * - Line format filter configuration.
	 */
	__lineFormatFilter?: boolean;
	/**
	 * - Defines the list of styles that are applied directly to the `<li>` element
	 * - when a text style is applied to the entire list item.
	 * - For example, when changing the font size or color of a list item (`<li>`),
	 * - these styles will be applied to the `<li>` tag instead of wrapping the content inside additional tags.
	 */
	__listCommonStyle?: Array<string>;
	/**
	 * - Plugin retain filter configuration. (Internal use primarily)
	 * - You can turn it off/on globally with true/false or set it per plugin. (e.g. { table: false })
	 */
	__pluginRetainFilter?:
		| {
				pluginName: string;
				we: boolean;
		  }
		| boolean;
	/**
	 * - Allows the `<script>` tag to be used in the editor.
	 * ================================================================================================================================
	 */
	__allowedScriptTag?: boolean;
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
	 * - The default follows {@link DEFAULTS.BUTTON_LIST}=== Modes & Themes ===
	 */
	buttonList?: Array<string[] | string>;
	/**
	 * - Enables migration mode for SunEditor v2.
	 */
	v2Migration?: boolean;
	/**
	 * - Toolbar mode: "classic", "inline", "balloon", "balloon-always".
	 */
	mode?: 'classic' | 'inline' | 'balloon' | 'balloon-always';
	/**
	 * - Editor type: "document:header,page".
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
	 * - Text direction: "ltr" or "rtl".
	 */
	textDirection?: string;
	/**
	 * - An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
	 *
	 * === Strict & Advanced Filtering ===
	 */
	reverseButtons?: Array<string>;
	/**
	 * - Enables strict filtering of tags, attributes, and styles.
	 */
	strictMode?:
		| boolean
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
	 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}=== Content Filtering & Formatting ===
	 * ==
	 * #### 1) Tag & Element Control
	 */
	scopeSelectionTags?: Array<string>;
	/**
	 * - Specifies HTML elements to additionally allow beyond the 'default' allow list. Delimiter: "|" (e.g. "p|div", "*").
	 * - The value entered here will be added to the end of the default list determined by the {@link PrivateBaseOptions.__defaultElementWhitelist} logic above.
	 */
	elementWhitelist?: string;
	/**
	 * - Filters by specifying HTML elements that should not be used. Delimiter: "|" (e.g. "script|style").
	 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
	 */
	elementBlacklist?: string;
	/**
	 * - A list of tags that are allowed to be kept even if their values are empty.
	 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}- It is concatenated with the value of "ALLOWED_EMPTY_NODE_LIST" to form the final 'allowedEmptyTags' list.
	 */
	allowedEmptyTags?: string;
	/**
	 * - Allowed class names.
	 * - Added the default value {@link DEFAULTS.CLASS_NAME}#### 2) Attribute Control
	 */
	allowedClassName?: string;
	/**
	 * - Specifies additional attributes to allow for each tag. (e.g. {a: "href|target", img: "src|alt", "*": "id"}).
	 * - Rules for objects specified here will be merged into the {@link PrivateBaseOptions.__defaultAttributeWhitelist}.
	 */
	attributeWhitelist?: {
		[x: string]: string;
	};
	/**
	 * - Filter by specifying attributes to disallow by tag. (e.g. {a: "href|target", img: "src|alt", "*": "name"}).
	 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
	 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
	 *
	 * #### 3) Text & Inline Style Control
	 */
	attributeBlacklist?: {
		[x: string]: string;
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
	 * - Specifies additional styles to the list of allowed styles. Delimiter: "|" (e.g. "color|background-color").
	 */
	allUsedStyles?: string;
	/**
	 * - Specifies allowed styles for HTML tags.
	 */
	tagStyles?: {
		[x: string]: string;
	};
	/**
	 * - Specifies allowed styles for the "span" tag.
	 * - The default follows {@link DEFAULTS.SPAN_STYLES}
	 */
	spanStyles?: string;
	/**
	 * - Specifies allowed styles for the "line" element (p..).
	 * - The default follows {@link DEFAULTS.LINE_STYLES}
	 */
	lineStyles?: string;
	/**
	 * - Allowed font size units.
	 * - The default follows {@link DEFAULTS.SIZE_UNITS}
	 */
	fontSizeUnits?: Array<string>;
	/**
	 * - This option determines how inline elements (such as <span>, <strong>, etc.) are handled when deleting text.
	 * - "repeat": Inline styles are retained unless the backspace key is repeatedly pressed. If the user continuously presses backspace, the styles will eventually be removed.
	 * - "none": Inline styles are not retained at all. When deleting text, the associated inline elements are immediately removed along with it.
	 * - "always": Inline styles persist indefinitely unless explicitly removed. Even if all text inside an inline element is deleted, the element itself remains until manually removed.
	 *
	 * #### 4) Line & Block Formatting
	 */
	retainStyleMode?: 'repeat' | 'always' | 'none';
	/**
	 * - Default line element when inserting new lines.
	 */
	defaultLine?: string;
	/**
	 * - Specifies the default line break format.
	 * - [Recommended] "line" :  is a line break that is divided into general tags.
	 * - [Not recommended] "br" : Line breaks are treated as <br> on the same line. (like shift+enter)
	 * - Line breaks are handled as <br> within "line".
	 * - You can create a new "line" by entering a line break twice in a row.
	 * - Formats that include "line", such as "Quote", still operate on a "line" basis.
	 * - ● suneditor processes work in "line" units.
	 * - ● When set to "br", performance may decrease when editing a lot of data.
	 */
	defaultLineBreakFormat?: 'line' | 'br';
	/**
	 * - Line properties that should be reset when changing lines (e.g. "id|name").
	 */
	lineAttrReset?: string;
	/**
	 * - Additionally allowed "line" elements beyond the default. Delimiter: "|" (e.g. "p|div").
	 * It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatLine} to form the final 'line' element list.
	 * - "line" element also contain "brLine" element
	 */
	formatLine?: string;
	/**
	 * - Additionally allowed "brLine" elements beyond the default. (e.g. "PRE").
	 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatBrLine} to form the final 'brLine' element list.
	 * - "brLine" elements is included in the "line" element.
	 * - "brLine" elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
	 */
	formatBrLine?: string;
	/**
	 * - Additionally allowed "closureBrLine" elements beyond the default.
	 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatClosureBrLine} to form the final 'closureBrLine' element list.
	 * - "closureBrLine" elements is included in the "brLine".
	 * - "closureBrLine" elements's line break is "BR" tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 */
	formatClosureBrLine?: string;
	/**
	 * - Additionally allowed "block" elements beyond the default.
	 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatBlock} to form the final 'block' element list.
	 * - "block" is wrap the "line" and "component"
	 */
	formatBlock?: string;
	/**
	 * - Additionally allowed "closureBlock" elements beyond the default.
	 * - It is concatenated with the value of {@link PrivateBaseOptions.__defaultFormatClosureBlock} to form the final 'closureBlock' element list.
	 * - "closureBlock" elements is included in the "block".
	 * - "closureBlock" element is wrap the "line" and "component"
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. (e.g. format of table cells)
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
	toolbar_width?: number | string;
	/**
	 * - Container element for the toolbar.
	 */
	toolbar_container?: Element | string;
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
		buttonList?: Array<Array<string>>;
		mode?: 'balloon' | 'balloon-always';
		width?: number | string;
	};
	/**
	 * - Container element for the status bar.
	 */
	statusbar_container?: Element | string;
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
	 *
	 * === Advanced Features ===
	 */
	shortcuts?: {
		[x: string]: string[];
	};
	/**
	 * - Keeps the format of the copied content.
	 */
	copyFormatKeepOn?: boolean;
	/**
	 * - Automatically converts URLs into hyperlinks. ("Link" plugin required)
	 * - Default value is determined dynamically based on whether the 'link' plugin is enabled. (default : Boolean(plugins.link))
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
	previewTemplate?: string;
	/**
	 * - Custom template for print mode.
	 */
	printTemplate?: string;
	/**
	 * - Enables automatic selection of inserted components.
	 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
	 * - For block components: executes behavior based on `selectMode`:
	 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
	 * - `select`: Always select the inserted component.
	 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
	 * - `none`: Do nothing.
	 */
	componentInsertBehavior?: __se__ComponentInsertBehaviorType;
	/**
	 * - Default URL protocol for links.
	 */
	defaultUrlProtocol?: string;
	/**
	 * - {"copy": 1500} - Duration for displaying toast messages.
	 */
	toastMessageTime?: any;
	/**
	 * - Enables free code view mode.
	 *
	 * === Dynamic Options ===
	 */
	freeCodeViewMode?: string;
	/**
	 * - External libraries like CodeMirror or MathJax.
	 */
	externalLibs?: {
		[x: string]: any;
	};
	/**
	 * - Custom event handlers.
	 */
	events?: {
		[x: string]: (...args: any) => any;
	};
	/**
	 * - Specifies extra allowed or disallowed tags.
	 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}=== Dynamic Plugin Options ===
	 */
	allowedExtraTags?: {
		[x: string]: boolean;
	};
	/**
	 * - Dynamic plugin options, where the key is the plugin name and the value is its configuration.
	 * ================================================================================================================================
	 */
	Dynamic_pluginOptions?: {
		[x: string]: any;
	};
};
/**
 * -----------------
 * **Runtime-only base options (computed internally, cannot be set by users)**
 */
export type InternalBaseOptions = {
	/**
	 * - Computed className for the selected theme (e.g., 'se-theme-default').
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
	 * - Sub toolbar mode (e.g., 'balloon').
	 */
	_subMode?: string;
	/**
	 * - Tag names used for text styling, plus span/li.
	 */
	_textStyleTags?: Set<string>;
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
	 * - Uses CodeMirror for code view.
	 */
	hasCodeMirror?: boolean;
	/**
	 * - CodeMirror5 support.
	 */
	codeMirror5Editor?: any;
	/**
	 * - CodeMirror6 support.
	 * ================================================================================================================================
	 */
	codeMirror6Editor?: any;
};
export type EditorInitOptions = EditorBaseOptions & PrivateBaseOptions & EditorFrameOptions;
export type AllBaseOptions = EditorBaseOptions & PrivateBaseOptions & InternalBaseOptions;
