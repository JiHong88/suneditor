/**
 * @description Create shortcuts desc span.
 * @param {string} command Command string
 * @param {Array<string>} values options.shortcuts[command]
 * @param {Element|null} button Command button element
 * @param {Map<string, *>} keyMap Map to store shortcut key info
 * @param {Array} rc "_reverseCommandArray" option
 * @param {Array} reverseKeys Reverse key array
 */
export function CreateShortcuts(command: string, button: Element | null, values: Array<string>, keyMap: Map<string, any>, rc: any[], reverseKeys: any[]): void;
/**
 * @description Initialize options
 * @param {EditorInitOptions} options Configuration options for the editor.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions}>} editorTargets Target textarea
 * @param {Object<string, *>} plugins Plugins object
 * @returns {{o: Map<string, *>, i: Object<string, string>, l: Object<string, string>, v: string, buttons: Array<string[]|string>, subButtons: Array<string[]|string>, statusbarContainer: Element|null, frameMap: Map<*, *>}}
 * - o: options
 * - i: icons
 * - l: lang
 * - v: value
 * - buttons: Toolbar button list
 * - subButtons: Sub-Toolbar button list
 * - statusbarContainer: statusbar container
 * - frameMap: converted options map
 */
export function InitOptions(
	options: EditorInitOptions,
	editorTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions;
	}>,
	plugins: {
		[x: string]: any;
	}
): {
	o: Map<string, any>;
	i: {
		[x: string]: string;
	};
	l: {
		[x: string]: string;
	};
	v: string;
	buttons: Array<string[] | string>;
	subButtons: Array<string[] | string>;
	statusbarContainer: Element | null;
	frameMap: Map<any, any>;
};
/**
 * @description Create a context object for the editor frame.
 * @param {Map<string, *>} targetOptions - editor.frameOptions
 * @param {HTMLElement} statusbar - statusbar element
 * @returns {{statusbar: HTMLElement, navigation: HTMLElement, charWrapper: HTMLElement, charCounter: HTMLElement}}
 */
export function CreateStatusbar(
	targetOptions: Map<string, any>,
	statusbar: HTMLElement
): {
	statusbar: HTMLElement;
	navigation: HTMLElement;
	charWrapper: HTMLElement;
	charCounter: HTMLElement;
};
/**
 * @description Update a button state, attributes, and icons
 * @param {HTMLElement|null} element Button element
 * @param {Object<string, *>} plugin Plugin
 * @param {Object<string, string>} icons Icons
 * @param {Object<string, string>} lang lang
 */
export function UpdateButton(
	element: HTMLElement | null,
	plugin: {
		[x: string]: any;
	},
	icons: {
		[x: string]: string;
	},
	lang: {
		[x: string]: string;
	}
): void;
/**
 * @description Create editor HTML
 * @param {Array} buttonList option.buttonList
 * @param {?Object<string, *>} plugins Plugins
 * @param {Map<string, *>} options options
 * @param {Object<string, string>} icons icons
 * @param {Object<string, string>} lang lang
 * @param {boolean} isUpdate Is update
 * @returns {{element: HTMLElement, pluginCallButtons: Object<string, Array<HTMLElement>>, responsiveButtons: Array<HTMLElement>, buttonTray: HTMLElement, updateButtons: Array<{button: HTMLElement, plugin: *, key: string}>}}}
 */
export function CreateToolBar(
	buttonList: any[],
	plugins: {
		[x: string]: any;
	} | null,
	options: Map<string, any>,
	icons: {
		[x: string]: string;
	},
	lang: {
		[x: string]: string;
	},
	isUpdate: boolean
): {
	element: HTMLElement;
	pluginCallButtons: {
		[x: string]: Array<HTMLElement>;
	};
	responsiveButtons: Array<HTMLElement>;
	buttonTray: HTMLElement;
	updateButtons: Array<{
		button: HTMLElement;
		plugin: any;
		key: string;
	}>;
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
 * @property {Array<string>} [excludedPlugins] - Plugin configuration.
 * @property {Array<string[]|string>} [buttonList] - List of toolbar buttons, grouped by sub-arrays.
 * @property {boolean} [v2Migration=false] - Enables migration mode for SunEditor v2.
 * @property {boolean|{tagFilter: boolean, formatFilter: boolean, classFilter: boolean, styleNodeFilter: boolean, attrFilter: boolean, styleFilter: boolean}} [strictMode=true] - Enables strict filtering of tags, attributes, and styles.
 * @property {"classic"|"inline"|"balloon"|"balloon-always"} [mode="classic"] - Toolbar mode: "classic", "inline", "balloon", "balloon-always".
 * @property {string} [type=""] - Editor type: "document:header,page".
 * @property {string} [theme=""] - Editor theme.
 * @property {Object<string, string>} [lang] - Language configuration.
 * @property {Array<string>} [fontSizeUnits=["px", "pt", "em", "rem"]] - Allowed font size units.
 * @property {string} [allowedClassName] - Allowed class names.
 * @property {boolean} [closeModalOutsideClick=false] - Closes modals when clicking outside.
 * @property {boolean} [copyFormatKeepOn=false] - Keeps the format of the copied content.
 * @property {boolean} [syncTabIndent=true] - Synchronizes tab indent with spaces.
 * @property {boolean} [tabDisable=false] - Disables tab key input.
 * @property {boolean} [autoLinkify] - Automatically converts URLs into hyperlinks. ("Link" plugin required)
 * @property {Array<string>} [autoStyleify=["bold", "underline", "italic", "strike"]] - Styles applied automatically on text input.
 * @property {Object<string, string|number>} [scrollToOptions={behavior: "auto", block: "nearest"}] - Configuration for scroll behavior when navigating editor content.
 * @property {Object<string, string|number>} [componentScrollToOptions={behavior: "smooth", block: "center"}] - Configuration for scroll behavior when navigating components.
 * @property {"repeat"|"always"|"none"} [retainStyleMode="repeat"] - This option determines how inline elements (such as <span>, <strong>, etc.) are handled when deleting text.
 * - "repeat": Inline styles are retained unless the backspace key is repeatedly pressed. If the user continuously presses backspace, the styles will eventually be removed.
 * - "none": Inline styles are not retained at all. When deleting text, the associated inline elements are immediately removed along with it.
 * - "always": Inline styles persist indefinitely unless explicitly removed. Even if all text inside an inline element is deleted, the element itself remains until manually removed.
 * @property {Object<string, boolean>} [allowedExtraTags={script: false, style: false, meta: false, link: false, "[a-z]+:[a-z]+": false}] - Specifies extra allowed or disallowed tags.
 * @property {Object<string, (...args: *) => *>} [events={}] - Custom event handlers.
 * @property {string} [__textStyleTags="strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary"] - The basic tags that serves as the base for "textStyleTags"
 * @property {string} [textStyleTags="strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary"] - Additional text style tags.
 * @property {Object<string, string>} [convertTextTags={bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}] - Maps text styles to specific HTML tags.
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles. Delimiter: "|" (e.g. "color|background-color").
 * @property {Object<string, string>} [__tagStyles={
    'table|th|td': 'border|border-[a-z]+|color|background-color|text-align|float|font-weight|text-decoration|font-style|vertical-align|text-align',
    'table|td': 'width',
    tr: 'height',
    col: 'width',
    'ol|ul': 'list-style-type'
    }] - The basic tags that serves as the base for "tagStyles"
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags.
 * @property {string} [spanStyles="font-family|font-size|color|background-color"] - Specifies allowed styles for the "span" tag.
 * @property {string} [lineStyles="text-align|margin-left|margin-right|line-height"] - Specifies allowed styles for the "line" element (p..).
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
 * @property {Array<string>} [scopeSelectionTags=["td", "table", "li", "ol", "ul", "pre", "figcaption", "blockquote", "dl", "dt", "dd"]] - Tags treated as whole units when selecting all content.
 * @property {string} [__defaultElementWhitelist="br|div"] - Default allowed HTML elements. The default values are maintained.
 * @property {string} [elementWhitelist=""] - Allowed HTML elements. Delimiter: "|" (e.g. "p|div", "*").
 * @property {string} [elementBlacklist=""] - Disallowed HTML elements. Delimiter: "|" (e.g. "script|style").
 * @property {string} [__defaultAttributeWhitelist] - Allowed attributes. Delimiter: "|" (e.g. "href|target").
 * @property {Object<string, string>} [attributeWhitelist=""] - Allowed attributes. (e.g. {a: "href|target", img: "src|alt", "*": "id"}).
 * @property {Object<string, string>} [attributeBlacklist=""] - Disallowed attributes. (e.g. {a: "href|target", img: "src|alt", "*": "name"}).
 * @property {string} [__defaultFormatLine="P|DIV|H[1-6]|LI|TH|TD|DETAILS"] - Overrides the editor's default "line" element.
 * @property {string} [formatLine="P|DIV|H[1-6]|LI|TH|TD|DETAILS"] - Specifies the editor's "line" elements.
 * - (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
 * - "line" element also contain "brLine" element
 * @property {string} [__defaultFormatBrLine="PRE"] - Overrides the editor's default "brLine" element.
 * @property {string} [formatBrLine="PRE"] - Specifies the editor's "brLine" elements. (e.g. "PRE").
 * - (PRE | class="__se__format__br_line_xxx")
 * - "brLine" elements is included in the "line" element.
 * - "brLine" elements's line break is "BR" tag.
 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
 * @property {string} [__defaultFormatClosureBrLine=""] - Overrides the editor's default "closureBrLine" element.
 * @property {string} [formatClosureBrLine=""] - Specifies the editor's "closureBrLine" elements.
 * - (class="__se__format__br_line__closure_xxx")
 * - "closureBrLine" elements is included in the "brLine".
 * - "closureBrLine" elements's line break is "BR" tag.
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [__defaultFormatBlock="BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS"] - Overrides the editor's default "block" element.
 * @property {string} [formatBlock="BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS"] - Specifies the editor's "block" elements.
 * - (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__block_xxx")
 * - "block" is wrap the "line" and "component"
 * @property {string} [__defaultFormatClosureBlock="TH|TD"] - Overrides the editor's default "closureBlock" element.
 * @property {string} [formatClosureBlock="TH|TD"] - Specifies the editor's "closureBlock" elements.
 * - (TH, TD | class="__se__format__block_closure_xxx")
 * - "closureBlock" elements is included in the "block".
 * - "closureBlock" element is wrap the "line" and "component"
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [allowedEmptyTags=".se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details"] - Allowed empty tags.
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
 * @property {boolean} [__pluginRetainFilter=true] - Plugin retain filter configuration.
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
export const OPTION_FRAME_FIXED_FLAG: Partial<Record<keyof EditorInitOptions, 'fixed' | true>>;
/**
 * @description For all EditorInitOptions keys, only boolean | null values are allowed.
 * - 'fixed' → Immutable / null → Resettable.
 * @type {Partial<Record<keyof EditorInitOptions, "fixed" | true>>}
 */
export const OPTION_FIXED_FLAG: Partial<Record<keyof EditorInitOptions, 'fixed' | true>>;
export default Constructor;
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
	 */
	charCounter_type?: 'char' | 'byte' | 'byte-html';
};
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
	 */
	buttonList?: Array<string[] | string>;
	/**
	 * - Enables migration mode for SunEditor v2.
	 */
	v2Migration?: boolean;
	/**
	 * - Enables strict filtering of tags, attributes, and styles.
	 */
	strictMode?:
		| boolean
		| {
				tagFilter: boolean;
				formatFilter: boolean;
				classFilter: boolean;
				styleNodeFilter: boolean;
				attrFilter: boolean;
				styleFilter: boolean;
		  };
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
	 * - Language configuration.
	 */
	lang?: {
		[x: string]: string;
	};
	/**
	 * - Allowed font size units.
	 */
	fontSizeUnits?: Array<string>;
	/**
	 * - Allowed class names.
	 */
	allowedClassName?: string;
	/**
	 * - Closes modals when clicking outside.
	 */
	closeModalOutsideClick?: boolean;
	/**
	 * - Keeps the format of the copied content.
	 */
	copyFormatKeepOn?: boolean;
	/**
	 * - Synchronizes tab indent with spaces.
	 */
	syncTabIndent?: boolean;
	/**
	 * - Disables tab key input.
	 */
	tabDisable?: boolean;
	/**
	 * - Automatically converts URLs into hyperlinks. ("Link" plugin required)
	 */
	autoLinkify?: boolean;
	/**
	 * - Styles applied automatically on text input.
	 */
	autoStyleify?: Array<string>;
	/**
	 * - Configuration for scroll behavior when navigating editor content.
	 */
	scrollToOptions?: {
		[x: string]: string | number;
	};
	/**
	 * - Configuration for scroll behavior when navigating components.
	 */
	componentScrollToOptions?: {
		[x: string]: string | number;
	};
	/**
	 * - This option determines how inline elements (such as <span>, <strong>, etc.) are handled when deleting text.
	 * - "repeat": Inline styles are retained unless the backspace key is repeatedly pressed. If the user continuously presses backspace, the styles will eventually be removed.
	 * - "none": Inline styles are not retained at all. When deleting text, the associated inline elements are immediately removed along with it.
	 * - "always": Inline styles persist indefinitely unless explicitly removed. Even if all text inside an inline element is deleted, the element itself remains until manually removed.
	 */
	retainStyleMode?: 'repeat' | 'always' | 'none';
	/**
	 * - Specifies extra allowed or disallowed tags.
	 */
	allowedExtraTags?: {
		[x: string]: boolean;
	};
	/**
	 * - Custom event handlers.
	 */
	events?: {
		[x: string]: (...args: any) => any;
	};
	/**
	 * - The basic tags that serves as the base for "textStyleTags"
	 */
	__textStyleTags?: string;
	/**
	 * - Additional text style tags.
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
	 * - The basic tags that serves as the base for "tagStyles"
	 */
	__tagStyles?: {
		[x: string]: string;
	};
	/**
	 * - Specifies allowed styles for HTML tags.
	 */
	tagStyles?: {
		[x: string]: string;
	};
	/**
	 * - Specifies allowed styles for the "span" tag.
	 */
	spanStyles?: string;
	/**
	 * - Specifies allowed styles for the "line" element (p..).
	 */
	lineStyles?: string;
	/**
	 * - Text direction: "ltr" or "rtl".
	 */
	textDirection?: string;
	/**
	 * - An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
	 */
	reverseButtons?: Array<string>;
	/**
	 * - Delay time for history stack updates (ms).
	 */
	historyStackDelayTime?: number;
	/**
	 * - Line properties that should be reset when changing lines (e.g. "id|name").
	 */
	lineAttrReset?: string;
	/**
	 * - Class name for printing.
	 */
	printClass?: string;
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
	 * - Tags treated as whole units when selecting all content.
	 */
	scopeSelectionTags?: Array<string>;
	/**
	 * - Default allowed HTML elements. The default values are maintained.
	 */
	__defaultElementWhitelist?: string;
	/**
	 * - Allowed HTML elements. Delimiter: "|" (e.g. "p|div", "*").
	 */
	elementWhitelist?: string;
	/**
	 * - Disallowed HTML elements. Delimiter: "|" (e.g. "script|style").
	 */
	elementBlacklist?: string;
	/**
	 * - Allowed attributes. Delimiter: "|" (e.g. "href|target").
	 */
	__defaultAttributeWhitelist?: string;
	/**
	 * - Allowed attributes. (e.g. {a: "href|target", img: "src|alt", "*": "id"}).
	 */
	attributeWhitelist?: {
		[x: string]: string;
	};
	/**
	 * - Disallowed attributes. (e.g. {a: "href|target", img: "src|alt", "*": "name"}).
	 */
	attributeBlacklist?: {
		[x: string]: string;
	};
	/**
	 * - Overrides the editor's default "line" element.
	 */
	__defaultFormatLine?: string;
	/**
	 * - Specifies the editor's "line" elements.
	 * - (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
	 * - "line" element also contain "brLine" element
	 */
	formatLine?: string;
	/**
	 * - Overrides the editor's default "brLine" element.
	 */
	__defaultFormatBrLine?: string;
	/**
	 * - Specifies the editor's "brLine" elements. (e.g. "PRE").
	 * - (PRE | class="__se__format__br_line_xxx")
	 * - "brLine" elements is included in the "line" element.
	 * - "brLine" elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
	 */
	formatBrLine?: string;
	/**
	 * - Overrides the editor's default "closureBrLine" element.
	 */
	__defaultFormatClosureBrLine?: string;
	/**
	 * - Specifies the editor's "closureBrLine" elements.
	 * - (class="__se__format__br_line__closure_xxx")
	 * - "closureBrLine" elements is included in the "brLine".
	 * - "closureBrLine" elements's line break is "BR" tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 */
	formatClosureBrLine?: string;
	/**
	 * - Overrides the editor's default "block" element.
	 */
	__defaultFormatBlock?: string;
	/**
	 * - Specifies the editor's "block" elements.
	 * - (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__block_xxx")
	 * - "block" is wrap the "line" and "component"
	 */
	formatBlock?: string;
	/**
	 * - Overrides the editor's default "closureBlock" element.
	 */
	__defaultFormatClosureBlock?: string;
	/**
	 * - Specifies the editor's "closureBlock" elements.
	 * - (TH, TD | class="__se__format__block_closure_xxx")
	 * - "closureBlock" elements is included in the "block".
	 * - "closureBlock" element is wrap the "line" and "component"
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 */
	formatClosureBlock?: string;
	/**
	 * - Allowed empty tags.
	 */
	allowedEmptyTags?: string;
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
	 */
	shortcuts?: {
		[x: string]: string[];
	};
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
	 */
	componentAutoSelect?: boolean;
	/**
	 * - Default URL protocol for links.
	 */
	defaultUrlProtocol?: string;
	/**
	 * - {"copy": 1500} - Duration for displaying toast messages.
	 */
	toastMessageTime?: any;
	/**
	 * - Overrides the default icons.
	 */
	icons?: {
		[x: string]: string;
	};
	/**
	 * - Enables free code view mode.
	 */
	freeCodeViewMode?: string;
	/**
	 * - Line format filter configuration.
	 */
	__lineFormatFilter?: boolean;
	/**
	 * - Plugin retain filter configuration.
	 */
	__pluginRetainFilter?: boolean;
	/**
	 * - Defines the list of styles that are applied directly to the `<li>` element
	 * - when a text style is applied to the entire list item.
	 * - For example, when changing the font size or color of a list item (`<li>`),
	 * - these styles will be applied to the `<li>` tag instead of wrapping the content inside additional tags.
	 */
	__listCommonStyle?: Array<string>;
	/**
	 * - External libraries like CodeMirror or MathJax.
	 */
	externalLibs?: {
		[x: string]: any;
	};
	/**
	 * - Dynamic plugin options, where the key is the plugin name and the value is its configuration.
	 */
	Dynamic_pluginOptions?: {
		[x: string]: any;
	};
};
export type EditorInitOptions = EditorBaseOptions & EditorFrameOptions;
/**
 * @description Creates a new SunEditor instance with specified options.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions}>} editorTargets - Target element or multi-root object.
 * @param {EditorInitOptions} options - Configuration options for the editor.
 * @returns {Object<string, *>} - SunEditor instance with context, options, and DOM elements.
 */
declare function Constructor(
	editorTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions;
	}>,
	options: EditorInitOptions
): {
	[x: string]: any;
};
