export namespace DEFAULTS {
	let BUTTON_LIST: [
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
	];
	let REQUIRED_FORMAT_LINE: 'div';
	let REQUIRED_ELEMENT_WHITELIST: 'br|div';
	let ELEMENT_WHITELIST: 'p|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|colgroup|col|thead|tbody|tr|th|td|caption|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
	let TEXT_STYLE_TAGS: 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary';
	let SCOPE_SELECTION_TAGS: ['td', 'table', 'li', 'ol', 'ul', 'pre', 'figcaption', 'blockquote', 'dl', 'dt', 'dd'];
	let ATTRIBUTE_WHITELIST: 'contenteditable|target|href|title|download|rel|src|alt|class|type|colspan|rowspan|width|height|controls|autoplay|loop|muted|poster|preload|playsinline|volume|crossorigin|disableRemotePlayback|controlsList|allowfullscreen|sandbox|loading|allow|referrerpolicy|frameborder|scrolling';
	let FORMAT_LINE: 'P|H[1-6]|LI|TH|TD|DETAILS';
	let FORMAT_BR_LINE: 'PRE';
	let FORMAT_CLOSURE_BR_LINE: '';
	let FORMAT_BLOCK: 'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS';
	let FORMAT_CLOSURE_BLOCK: 'TH|TD';
	let ALLOWED_EMPTY_NODE_LIST: '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details';
	let SIZE_UNITS: ['px', 'pt', 'em', 'rem'];
	let CLASS_NAME: '^__se__|^se-|^katex|^MathJax';
	let CLASS_MJX: 'mjx-container|mjx-math|mjx-mrow|mjx-mi|mjx-mo|mjx-mn|mjx-msup|mjx-mfrac|mjx-munderover';
	let EXTRA_TAG_MAP: { script: false; style: false; meta: false; link: false; '[a-z]+:[a-z]+': false };
	let CONTENT_STYLES: 'background|background-clip|background-color|border|border-bottom|border-collapse|border-color|border-image|border-left-width|border-radius|border-right-width|border-spacing|border-style|border-top|border-width|box-shadow|box-sizing|caption-side|color|content|direction|display|float|font|font-family|font-size|font-style|font-weight|height|left|letter-spacing|line-height|list-style-position|list-style-type|margin|margin-block-end|margin-block-start|margin-bottom|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|max-width|min-width|outline|overflow|position|padding|padding-bottom|padding-inline-start|padding-left|padding-right|padding-top|page-break-before|page-break-after|page-break-inside|rotate|rotateX|rotateY|table-layout|text-align|text-decoration|text-shadow|text-transform|top|text-indent|text-rendering|vertical-align|visibility|white-space|width|word-break|word-wrap';
	let TAG_STYLES: {
		'table|th|td': 'border|border-[a-z]+|color|background-color|text-align|float|font-weight|text-decoration|font-style|vertical-align|text-align';
		'table|td': 'width';
		tr: 'height';
		col: 'width';
		'ol|ul': 'list-style-type';
	};
	let TEXT_STYLES: 'font-family|font-size|color|background-color';
	let LINE_STYLES: 'text-align|margin-left|margin-right|line-height';
	let RETAIN_STYLE_MODE: ['repeat', 'always', 'none'];
}
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
	 * - The default follows {@link DEFAULTS.BUTTON_LIST}
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
				textStyleTagFilter: boolean;
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
	 * - Language configuration. default : EN
	 */
	lang?: {
		[x: string]: string;
	};
	/**
	 * - Allowed font size units.
	 * - The default follows {@link DEFAULTS.SIZE_UNITS}
	 */
	fontSizeUnits?: Array<string>;
	/**
	 * - Allowed class names.
	 * - Added the default value {@link DEFAULTS.CLASS_NAME}
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
	 * - Default value is determined dynamically based on whether the 'link' plugin is enabled. (default : Boolean(plugins.link))
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
	 * - The default follows {@link DEFAULTS.EXTRA_TAG_MAP}
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
	 * - The default follows {@link DEFAULTS.TEXT_STYLE_TAGS}
	 */
	__textStyleTags?: string;
	/**
	 * - Additional text style tags.
	 * - The default follows {@link EditorBaseOptions.__textStyleTags}
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
	 * - The default follows {@link DEFAULTS.TAG_STYLES}
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
	 * - The default follows {@link DEFAULTS.TEXT_STYLES}
	 */
	spanStyles?: string;
	/**
	 * - Specifies allowed styles for the "line" element (p..).
	 * - The default follows {@link DEFAULTS.LINE_STYLES}
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
	 * - The default follows {@link DEFAULTS.SCOPE_SELECTION_TAGS}
	 */
	scopeSelectionTags?: Array<string>;
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
	 * - Specifies HTML elements to additionally allow beyond the 'default' allow list. Delimiter: "|" (e.g. "p|div", "*").
	 * - The value entered here will be added to the end of the default list determined by the {@link EditorBaseOptions.__defaultElementWhitelist} logic above.
	 */
	elementWhitelist?: string;
	/**
	 * - Filters by specifying HTML elements that should not be used. Delimiter: "|" (e.g. "script|style").
	 * - Tags specified here will eventually be removed, even if they are included in other whitelists.
	 */
	elementBlacklist?: string;
	/**
	 * - A complete list of attributes that are allowed by default on all tags. Delimiter: "|" (e.g. "href|target").
	 * - The default follows {@link DEFAULTS.ATTRIBUTE_WHITELIST}
	 */
	__defaultAttributeWhitelist?: string;
	/**
	 * - Specifies additional attributes to allow for each tag. (e.g. {a: "href|target", img: "src|alt", "*": "id"}).
	 * - Rules for objects specified here will be merged into the {@link EditorBaseOptions.__defaultAttributeWhitelist}.
	 */
	attributeWhitelist?: {
		[x: string]: string;
	};
	/**
	 * - Filter by specifying attributes to disallow by tag. (e.g. {a: "href|target", img: "src|alt", "*": "name"}).
	 * - Attributes specified here will eventually be removed even if they are allowed by other settings.
	 */
	attributeBlacklist?: {
		[x: string]: string;
	};
	/**
	 * - Specifies the tag to be used as the editor's default "line" element.
	 * - The default follows {@link DEFAULTS.FORMAT_LINE}
	 * - A list of required elements, {@link DEFAULTS.REQUIRED_FORMAT_LINE}, is always included.
	 */
	__defaultFormatLine?: string;
	/**
	 * - Additionally allowed "line" elements beyond the default. Delimiter: "|" (e.g. "p|div").
	 * It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatLine} to form the final 'line' element list.
	 * - "line" element also contain "brLine" element
	 */
	formatLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "brLine" element.
	 * - The default follows {@link DEFAULTS.FORMAT_BR_LINE}
	 */
	__defaultFormatBrLine?: string;
	/**
	 * - Additionally allowed "brLine" elements beyond the default. (e.g. "PRE").
	 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatBrLine} to form the final 'brLine' element list.
	 * - "brLine" elements is included in the "line" element.
	 * - "brLine" elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
	 */
	formatBrLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "closureBrLine" element.
	 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BR_LINE}
	 */
	__defaultFormatClosureBrLine?: string;
	/**
	 * - Additionally allowed "closureBrLine" elements beyond the default.
	 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatClosureBrLine} to form the final 'closureBrLine' element list.
	 * - "closureBrLine" elements is included in the "brLine".
	 * - "closureBrLine" elements's line break is "BR" tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 */
	formatClosureBrLine?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "block" element.
	 * - The default follows {@link DEFAULTS.FORMAT_BLOCK}
	 */
	__defaultFormatBlock?: string;
	/**
	 * - Additionally allowed "block" elements beyond the default.
	 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatBlock} to form the final 'block' element list.
	 * - "block" is wrap the "line" and "component"
	 */
	formatBlock?: string;
	/**
	 * - Specifies the tag to be used as the editor's default "closureBlock" element.
	 * - The default follows {@link DEFAULTS.FORMAT_CLOSURE_BLOCK}
	 */
	__defaultFormatClosureBlock?: string;
	/**
	 * - Additionally allowed "closureBlock" elements beyond the default.
	 * - It is concatenated with the value of {@link EditorBaseOptions.__defaultFormatClosureBlock} to form the final 'closureBlock' element list.
	 * - "closureBlock" elements is included in the "block".
	 * - "closureBlock" element is wrap the "line" and "component"
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. (e.g. format of table cells)
	 */
	formatClosureBlock?: string;
	/**
	 * - A list of tags that are allowed to be kept even if their values are empty.
	 * - The default follows {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST}
	 * - It is concatenated with the value of {@link DEFAULTS.ALLOWED_EMPTY_NODE_LIST} to form the final 'allowedEmptyTags' list.
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
	 * - You can turn it off/on globally with true/false or set it per plugin. (e.g. { table: false })
	 */
	__pluginRetainFilter?:
		| boolean
		| {
				[x: string]: boolean;
		  };
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
