import _icons from '../../assets/icons/_default';
import _defaultLang from '../../langs/en';
import { CreateContext, CreateFrameContext } from './context';
import { domUtils, numbers, converter, env } from '../../helper';

const _d = env._d;
const DEFAULT_BUTTON_LIST = [
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

const REQUIRED_FORMAT_LINE = 'div';
const REQUIRED_ELEMENT_WHITELIST = 'br|div';
const DEFAULT_ELEMENT_WHITELIST =
	'p|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|caption|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
const DEFAULT_TEXT_STYLE_TAGS = 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary';

const _video_audio_attr = '|controls|autoplay|loop|muted|poster|preload|playsinline|volume|crossorigin|disableRemotePlayback|controlsList';
const _iframe_attr = '|allowfullscreen|sandbox|loading|allow|referrerpolicy|frameborder|scrolling';
const DEFAULT_ATTRIBUTE_WHITELIST = 'contenteditable|target|href|title|download|rel|src|alt|class|type|colspan|rowspan' + _video_audio_attr + _iframe_attr;

const DEFAULT_FORMAT_LINE = 'P|H[1-6]|LI|TH|TD|DETAILS';
const DEFAULT_FORMAT_BR_LINE = 'PRE';
const DEFAULT_FORMAT_CLOSURE_BR_LINE = '';
const DEFAULT_FORMAT_BLOCK = 'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS';
const DEFAULT_FORMAT_CLOSURE_BLOCK = 'TH|TD';

const DEFAULT_ALLOWED_EMPTY_NODE_LIST = '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details';

const DEFAULT_SIZE_UNITS = ['px', 'pt', 'em', 'rem'];

const DEFAULT_CLASS_NAME = '^__se__|^se-|^katex|^MathJax';
const DEFAULT_CLASS_MJX = 'mjx-container|mjx-math|mjx-mrow|mjx-mi|mjx-mo|mjx-mn|mjx-msup|mjx-mfrac|mjx-munderover';
const DEFAULT_EXTRA_TAG_MAP = { script: false, style: false, meta: false, link: false, '[a-z]+:[a-z]+': false };

const DEFAULT_TAG_STYLES = {
	'table|th|td': 'border|border-[a-z]+|background-color|text-align|float|font-weight|text-decoration|font-style',
	'ol|ul': 'list-style-type'
};
const DEFAULT_TEXT_STYLES = 'font-family|font-size|color|background-color';
const DEFAULT_LINE_STYLES = 'text-align|margin-left|margin-right|line-height';
const DEFAULT_CONTENT_STYLES =
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
	'white-space|width|word-break|word-wrap';

const RETAIN_STYLE_MODE = ['repeat', 'always', 'none'];

export const RO_UNAVAILABD = [
	'mode',
	'type',
	'externalLibs',
	'iframe',
	'convertTextTags',
	'textStyleTags',
	'fontSizeUnits',
	'spanStyles',
	'lineStyles',
	'tagStyles',
	'reverseCommands',
	'shortcutsDisable',
	'shortcuts',
	'buttonList',
	'subToolbar',
	'toolbar_container',
	'statusbar_container',
	'elementWhitelist',
	'elementBlacklist',
	'attributeWhitelist',
	'attributeBlacklist',
	'defaultLine',
	'formatClosureBrLine',
	'formatBrLine',
	'formatLine',
	'formatClosureBlock',
	'formatBlock',
	'__defaultElementWhitelist',
	'__defaultAttributeWhitelist',
	'__listCommonStyle',
	'icons',
	'lang',
	'codeMirror'
];

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
 * @property {Object<string, string>} [__tagStyles={'table|th|td': 'border|border-[a-z]+|background-color|text-align|float|font-weight|text-decoration|font-style', 'ol|ul': 'list-style-type'}] - The basic tags that serves as the base for "tagStyles"
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags.
 * @property {string} [spanStyles="font-family|font-size|color|background-color"] - Specifies allowed styles for the "span" tag.
 * @property {string} [lineStyles="text-align|margin-left|margin-right|line-height"] - Specifies allowed styles for the "line" element (p..).
 * @property {string} [textDirection="ltr"] - Text direction: "ltr" or "rtl".
 * @property {Array<string>} [reverseButtons=['indent-outdent']] - An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
 * @property {number} [historyStackDelayTime=400] - Delay time for history stack updates (ms).
 * @property {string} [lineAttrReset=""] - Line properties that should be reset when changing lines (e.g. "id|name").
 * @property {string} [printClass=""] - Class name for printing.
 * @property {string} [defaultLine="p"] - Default line element when inserting new lines.
 * @property {string} [__defaultElementWhitelist="br|div"] - Default allowed HTML elements. The default values are maintained.
 * @property {string} [elementWhitelist=""] - Allowed HTML elements. Delimiter: "|" (e.g. "p|div", "*").
 * @property {string} [elementBlacklist=""] - Disallowed HTML elements. Delimiter: "|" (e.g. "script|style").
 * @property {string} [__defaultAttributeWhitelist] - Allowed attributes. Delimiter: "|" (e.g. "href|target").
 * @property {Object<string, string>} [attributeWhitelist=""] - Allowed attributes. (e.g. {a: "href|target", img: "src|alt"}).
 * @property {Object<string, string>} [attributeBlacklist=""] - Disallowed attributes. (e.g. {a: "href|target", img: "src|alt"}).
 * @property {string} [__defaultFormatLine="P|H[1-6]|LI|TH|TD|DETAILS"] - Overrides the editor's default "line" element.
 * @property {string} [formatLine="P|H[1-6]|LI|TH|TD|DETAILS"] - Specifies the editor's "line" elements.
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
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles. Delimiter: "|" (e.g. "color|background-color").
 * @property {Object<string, string>} [icons] - Overrides the default icons.
 * @property {string} [freeCodeViewMode=false] - Enables free code view mode.
 * @property {boolean} [__lineFormatFilter=true] - Line format filter configuration.
 * @property {boolean} [__pluginRetainFilter=true] - Plugin retain filter configuration.
 * @property {Array<string>} [__listCommonStyle=["fontSize", "color", "fontFamily", "fontWeight", "fontStyle"]] - Defines the list of styles that are applied directly to the `<li>` element
 * - when a text style is applied to the entire list item.
 * - For example, when changing the font size or color of a list item (`<li>`),
 * - these styles will be applied to the `<li>` tag instead of wrapping the content inside additional tags.
 * @property {Object<string, *>} [externalLibs] - External libraries like CodeMirror or MathJax.
 * @property {Object<string, *>} [PluginOptions] - Dynamic plugin options, where the key is the plugin name and the value is its configuration.
 */

/**
 * @typedef {EditorBaseOptions & EditorFrameOptions} EditorInitOptions
 */

/**
 * @description Creates a new SunEditor instance with specified options.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions}>} editorTargets - Target element or multi-root object.
 * @param {EditorInitOptions} options - Configuration options for the editor.
 * @returns {Object<string, *>} - SunEditor instance with context, options, and DOM elements.
 */
function Constructor(editorTargets, options) {
	if (typeof options !== 'object') options = {};

	/** --- Plugins ------------------------------------------------------------------------------------------ */
	const plugins = {};
	if (options.plugins) {
		const excludedPlugins = options.excludedPlugins || [];
		const originPlugins = options.plugins;
		const pluginsValues = (Array.isArray(originPlugins) ? originPlugins : Object.keys(originPlugins)).filter((name) => !excludedPlugins.includes(name)).map((name) => originPlugins[name]);

		for (let i = 0, len = pluginsValues.length, p; i < len; i++) {
			p = pluginsValues[i].default || pluginsValues[i];
			plugins[p.key] = p;
		}
	}

	/** --- options --------------------------------------------------------------- */
	const optionMap = InitOptions(options, editorTargets, plugins);
	const o = optionMap.o;
	const icons = optionMap.i;
	const lang = optionMap.l;
	const loadingBox = domUtils.createElement('DIV', { class: 'se-loading-box sun-editor-common' }, '<div class="se-loading-effect"></div>');

	/** --- carrier wrapper --------------------------------------------------------------- */
	const editor_carrier_wrapper = domUtils.createElement('DIV', { class: 'sun-editor sun-editor-carrier-wrapper sun-editor-common' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') });
	// menuTray
	const menuTray = domUtils.createElement('DIV', { class: 'se-menu-tray' });
	editor_carrier_wrapper.appendChild(menuTray);
	// focus temp element
	const focusTemp = /** @type {HTMLInputElement} */ (
		domUtils.createElement('INPUT', {
			class: '__se__focus__temp__',
			style: 'position: fixed !important; top: -10000px !important; left: -10000px !important; display: block !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important;'
		})
	);
	focusTemp.tabIndex = 0;
	editor_carrier_wrapper.appendChild(focusTemp);

	// modal
	const modal = domUtils.createElement('DIV', { class: 'se-modal sun-editor-common' });
	const modal_back = domUtils.createElement('DIV', { class: 'se-modal-back', style: 'display: none;' });
	const modal_inner = domUtils.createElement('DIV', { class: 'se-modal-inner', style: 'display: none;' });
	modal.appendChild(modal_back);
	modal.appendChild(modal_inner);
	editor_carrier_wrapper.appendChild(modal);

	// loding box, resizing back
	editor_carrier_wrapper.appendChild(domUtils.createElement('DIV', { class: 'se-back-wrapper' }));
	editor_carrier_wrapper.appendChild(loadingBox.cloneNode(true));

	// drag cursor
	const dragCursor = domUtils.createElement('DIV', { class: 'se-drag-cursor' });
	editor_carrier_wrapper.appendChild(dragCursor);

	// set carrier wrapper
	_d.body.appendChild(editor_carrier_wrapper);

	/** --- toolbar --------------------------------------------------------------- */
	let subbar = null,
		sub_main = null;
	const tool_bar_main = CreateToolBar(optionMap.buttons, plugins, o, icons, lang, false);
	const toolbar = tool_bar_main.element;
	toolbar.style.visibility = 'hidden';
	// toolbar mode
	if (/inline/i.test(o.get('mode'))) {
		toolbar.className += ' se-toolbar-inline';
		toolbar.style.width = o.get('toolbar_width');
	} else if (/balloon/i.test(o.get('mode'))) {
		toolbar.className += ' se-toolbar-balloon';
		toolbar.style.width = o.get('toolbar_width');
		toolbar.appendChild(domUtils.createElement('DIV', { class: 'se-arrow' }));
	}

	/** --- subToolbar --------------------------------------------------------------- */
	if (optionMap.subButtons) {
		sub_main = CreateToolBar(optionMap.subButtons, plugins, o, icons, lang, false);
		subbar = sub_main.element;
		subbar.style.visibility = 'hidden';
		// subbar mode must be balloon-*
		subbar.className += ' se-toolbar-balloon se-toolbar-sub';
		subbar.style.width = o.get('toolbar.sub_width');
		subbar.appendChild(domUtils.createElement('DIV', { class: 'se-arrow' }));
	}

	/** frame - root set - start -------------------------------------------------------------- */
	const rootId = editorTargets[0].key || null;
	const rootKeys = [];
	const frameRoots = new Map();
	const statusbarContainer = optionMap.statusbarContainer;
	let default_status_bar = null;
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		const editTarget = editorTargets[i];
		const to = optionMap.frameMap.get(editTarget.key);
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + o.get('_themeClass') + (to.get('_rtl') ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		const editor_div = domUtils.createElement('DIV', { class: 'se-wrapper' + (o.get('type') === 'document' ? ' se-type-document' : '') });

		container.appendChild(domUtils.createElement('DIV', { class: 'se-toolbar-shadow' }));

		// init element
		const initElements = _initTargetElements(editTarget.key, o, top_div, to);
		const bottomBar = initElements.bottomBar;
		const statusbar = bottomBar.statusbar;
		const wysiwyg_div = initElements.wysiwygFrame;
		const placeholder_span = initElements.placeholder;
		let textarea = initElements.codeView;

		// line breaker
		const line_breaker_t = domUtils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-t', title: lang.insertLine }, icons.line_break);
		const line_breaker_b = domUtils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-b', title: lang.insertLine }, icons.line_break);

		editor_div.appendChild(line_breaker_t);
		editor_div.appendChild(line_breaker_b);

		// append container
		if (placeholder_span) editor_div.appendChild(placeholder_span);
		container.appendChild(domUtils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
		container.appendChild(editor_div);

		// statusbar
		if (statusbar) {
			if (statusbarContainer) {
				if (!default_status_bar) {
					statusbarContainer.appendChild(domUtils.createElement('DIV', { class: 'sun-editor' + o.get('_themeClass') }, statusbar));
					default_status_bar = statusbar;
				}
			} else {
				container.appendChild(statusbar);
			}
		}

		// loading bar
		container.appendChild(loadingBox.cloneNode(true));

		// root key
		const key = editTarget.key || null;

		// code view - wrapper
		const codeWrapper = domUtils.createElement('DIV', { class: 'se-code-wrapper' }, textarea);
		codeWrapper.style.setProperty('display', 'none', 'important');
		editor_div.appendChild(codeWrapper);

		// check code mirror
		const codeMirrorEl = _checkCodeMirror(o, to, textarea);
		// not used code mirror
		if (textarea === codeMirrorEl) {
			// add line nubers
			const codeNumbers = domUtils.createElement('TEXTAREA', { class: 'se-code-view-line', readonly: 'true' }, null);
			codeWrapper.insertBefore(codeNumbers, textarea);
		} else {
			textarea = codeMirrorEl;
		}

		// document type
		const documentTypeInner = { inner: null, page: null, pageMirror: null };
		if (o.get('type-options').includes('header')) {
			documentTypeInner.inner = domUtils.createElement('DIV', { class: 'se-document-lines', style: `height: ${to.get('height')};` }, '<div class="se-document-lines-inner"></div>');
		}
		if (o.get('type-options').includes('page')) {
			documentTypeInner.page = domUtils.createElement('DIV', { class: 'se-document-page' }, null);
			documentTypeInner.pageMirror = domUtils.createElement(
				'DIV',
				{
					class: 'sun-editor-editable se-document-page-mirror-a4',
					style: `position: absolute; width: 21cm; columns: 21cm; border: 0; overflow: hidden; height: auto; top: -10000px; left: -10000px;`
				},
				null
			);
		}

		// set container
		top_div.appendChild(container);
		rootKeys.push(key);
		frameRoots.set(key, CreateFrameContext({ target: editTarget.target, key: editTarget.key, options: to }, top_div, wysiwyg_div, codeWrapper, textarea, default_status_bar || statusbar, documentTypeInner, key));
	}
	/** frame - root set - end -------------------------------------------------------------- */

	// toolbar container
	const toolbar_container = o.get('toolbar_container');
	if (toolbar_container) {
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		container.appendChild(toolbar);
		if (subbar) container.appendChild(subbar);
		top_div.appendChild(container);
		toolbar_container.appendChild(top_div);
		toolbar_container.appendChild(domUtils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
	} else {
		const rootContainer = frameRoots.get(rootId).get('container');
		rootContainer.insertBefore(toolbar, rootContainer.firstElementChild);
		if (subbar) rootContainer.insertBefore(subbar, rootContainer.firstElementChild);
	}

	return {
		context: CreateContext(toolbar, toolbar_container, menuTray, subbar, statusbarContainer),
		carrierWrapper: editor_carrier_wrapper,
		options: o,
		plugins: plugins,
		icons: icons,
		lang: lang,
		value: optionMap.v,
		rootId: rootId,
		rootKeys: rootKeys,
		frameRoots: frameRoots,
		pluginCallButtons: tool_bar_main.pluginCallButtons,
		responsiveButtons: tool_bar_main.responsiveButtons,
		pluginCallButtons_sub: sub_main ? sub_main.pluginCallButtons : [],
		responsiveButtons_sub: sub_main ? sub_main.responsiveButtons : []
	};
}

/**
 * @description Create shortcuts desc span.
 * @param {string} command Command string
 * @param {Array<string>} values options.shortcuts[command]
 * @param {Element|null} button Command button element
 * @param {Map<string|number, *>} keyMap Map to store shortcut key info
 * @param {Array} rc "_reverseCommandArray" option
 * @param {Array} reverseKeys Reverse key array
 */
export function CreateShortcuts(command, button, values, keyMap, rc, reverseKeys) {
	if (!values || values.length < 2) return;
	const tooptip = button?.querySelector('.se-tooltip-text');

	for (let i = 0, a, v, c, s, edge, space, enter, textTrigger, plugin, method, t, k, r, _i; i < values.length; i += 2 + _i) {
		_i = 0;
		a = values[i].split('+');

		plugin = null;
		method = a.at(-1).trim?.();
		if (method.startsWith('~')) {
			plugin = command;
			method = a.pop().trim().substring(1);
		} else if (method.startsWith('p~')) {
			const a_ = a.pop().trim().substring(2).split('.');
			plugin = a_[0];
			method = a_[1];
		} else if (method.startsWith('$')) {
			_i = 1;
			method = values[i + 2];
		} else {
			method = '';
		}

		c = s = edge = space = enter = textTrigger = v = null;
		for (const a_ of a) {
			switch (a_.trim()) {
				case 'c':
					c = true;
					break;
				case '!':
					edge = true;
					break;
				case 's':
					s = true;
					break;
				case '_':
					space = true;
					break;
				case '=':
					textTrigger = true;
					break;
				case '/':
					enter = true;
					break;
				default:
					v = a_;
			}
		}

		k = c ? numbers.get(v) + (s ? 1000 : 0) : v;
		if (!keyMap.has(k)) {
			r = rc.indexOf(command);
			r = r === -1 ? '' : numbers.isOdd(r) ? rc[r + 1] : rc[r - 1];
			if (r) reverseKeys.push(k);

			keyMap.set(k, { c, s, edge, space, enter, textTrigger, plugin, command, method, r, type: button?.getAttribute('data-type'), button, key: k });
		}

		if (!(t = values[i + 1])) continue;
		if (tooptip) _addTooltip(tooptip, s, t);
	}
}

function _addTooltip(tooptipBtn, shift, shortcut) {
	tooptipBtn.appendChild(domUtils.createElement('SPAN', { class: 'se-shortcut' }, env.cmdIcon + (shift ? env.shiftIcon : '') + '+<span class="se-shortcut-key">' + shortcut + '</span>'));
}

/**
 * @private
 * @description Returns a new object with merge "a" and "b"
 * @param {Object<*, *>} a object
 * @param {Object<*, *>} b object
 * @returns {Object<*, *>} new object
 */
function _mergeObject(a, b) {
	return [a, b].reduce((_default, _new) => {
		for (const key in _new) {
			_default[key] = (_new[key] || '').toLowerCase();
		}
		return _default;
	}, {});
}

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
export function InitOptions(options, editorTargets, plugins) {
	const buttonList = options.buttonList || DEFAULT_BUTTON_LIST;
	const o = new Map();

	/** Multi root */
	if (editorTargets.length > 1) {
		if (!options.toolbar_container && !/inline|balloon/i.test(options.mode)) throw Error('[SUNEDITOR.create.fail] In multi root, The "mode" option cannot be "classic" without using the "toolbar_container" option.');
	}

	// migration data-.+
	o.set('v2Migration', !!options.v2Migration);

	/** Base */
	o.set('buttons', new Set(buttonList.toString().split(',')));
	const modeValue = options.strictMode !== false;
	o.set('strictMode', {
		tagFilter: modeValue,
		formatFilter: modeValue,
		classFilter: modeValue,
		styleNodeFilter: modeValue,
		attrFilter: modeValue,
		styleFilter: modeValue,
		...(typeof options.strictMode === 'boolean' ? {} : options.strictMode)
	});
	o.set('freeCodeViewMode', !!options.freeCodeViewMode);
	o.set('__lineFormatFilter', options.__lineFormatFilter ?? true);
	o.set('__pluginRetainFilter', options.__pluginRetainFilter ?? true);
	o.set('mode', options.mode || 'classic'); // classic, inline, balloon, balloon-always
	o.set('type', options.type?.split(':')[0] || ''); // document:header,page
	o.set('theme', options.theme || '');
	o.set('_themeClass', options.theme ? ` se-theme-${options.theme}` : '');
	o.set('type-options', options.type?.split(':')[1] || '');
	o.set('externalLibs', options.externalLibs || {});
	o.set('fontSizeUnits', Array.isArray(options.fontSizeUnits) && options.fontSizeUnits.length > 0 ? options.fontSizeUnits.map((v) => v.toLowerCase()) : DEFAULT_SIZE_UNITS);
	o.set('allowedClassName', new RegExp(`${options.allowedClassName && typeof options.allowedClassName === 'string' ? options.allowedClassName + '|' : ''}${DEFAULT_CLASS_NAME}`));
	o.set('closeModalOutsideClick', !!options.closeModalOutsideClick);

	// format
	o.set('copyFormatKeepOn', !!options.copyFormatKeepOn);
	o.set('syncTabIndent', options.syncTabIndent ?? true);

	// auto convert on paste
	o.set('autoLinkify', options.autoLinkify ?? !!plugins.link);
	o.set('autoStyleify', Array.isArray(options.autoStyleify) ? options.autoStyleify : ['bold', 'underline', 'italic', 'strike']);

	// scroll options
	o.set('scrollToOptions', { behavior: 'auto', block: 'nearest', ...options.scrollToOptions });
	o.set('componentScrollToOptions', { behavior: 'smooth', block: 'center', ...options.componentScrollToOptions });

	let retainStyleMode = options.retainStyleMode;
	if (typeof retainStyleMode === 'string' && !RETAIN_STYLE_MODE.includes(retainStyleMode)) {
		console.error(`Invalid retainStyleMode: ${retainStyleMode}. Valid options are ${RETAIN_STYLE_MODE.join(', ')}. Using default 'once'.`);
		retainStyleMode = 'repeat';
	}
	o.set('retainStyleMode', retainStyleMode);

	const allowedExtraTags = { ...DEFAULT_EXTRA_TAG_MAP, ...options.allowedExtraTags, '-': true };
	const extraKeys = Object.keys(allowedExtraTags);
	const allowedKeys = extraKeys.filter((k) => allowedExtraTags[k]).join('|');
	const disallowedKeys = extraKeys.filter((k) => !allowedExtraTags[k]).join('|');
	o.set('_allowedExtraTag', allowedKeys);
	o.set('_disallowedExtraTag', disallowedKeys);

	o.set('events', options.events || {});

	// text style tags
	o.set('textStyleTags', (typeof options.__textStyleTags === 'string' ? options.__textStyleTags : DEFAULT_TEXT_STYLE_TAGS) + (options.textStyleTags ? '|' + options.textStyleTags : ''));
	const textTags = _mergeObject(
		{
			bold: 'strong',
			underline: 'u',
			italic: 'em',
			strike: 'del',
			subscript: 'sub',
			superscript: 'sup'
		},
		options.convertTextTags || {}
	);
	o.set('convertTextTags', textTags);
	o.set('_textStyleTags', Object.values(textTags).concat(['span', 'li']));
	o.set(
		'tagStyles',
		[{ ...DEFAULT_TAG_STYLES, ...(options.__tagStyles || {}) }, options.tagStyles || {}].reduce((_default, _new) => {
			for (const key in _new) {
				_default[key] = _new[key];
			}
			return _default;
		}, {})
	);
	o.set('_textStylesRegExp', new RegExp(`\\s*[^-a-zA-Z](${DEFAULT_TEXT_STYLES}${options.spanStyles ? '|' + options.spanStyles : ''})\\s*:[^;]+(?!;)*`, 'gi'));
	o.set('_lineStylesRegExp', new RegExp(`\\s*[^-a-zA-Z](${DEFAULT_LINE_STYLES}${options.lineStyles ? '|' + options.lineStyles : ''})\\s*:[^;]+(?!;)*`, 'gi'));
	o.set('_defaultStyleTagMap', {
		strong: textTags.bold,
		b: textTags.bold,
		u: textTags.underline,
		ins: textTags.underline,
		em: textTags.italic,
		i: textTags.italic,
		del: textTags.strike,
		strike: textTags.strike,
		s: textTags.strike,
		sub: textTags.subscript,
		sup: textTags.superscript
	});
	o.set(
		'_styleCommandMap',
		_mergeObject(converter.swapKeyValue(textTags), {
			strong: 'bold',
			b: 'bold',
			u: 'underline',
			ins: 'underline',
			em: 'italic',
			i: 'italic',
			del: 'strike',
			strike: 'strike',
			s: 'strike',
			sub: 'subscript',
			sup: 'superscript'
		})
	);
	o.set('_defaultTagCommand', {
		bold: textTags.bold,
		underline: textTags.underline,
		italic: textTags.italic,
		strike: textTags.strike,
		subscript: textTags.sub,
		superscript: textTags.sup
	});
	// text direction
	o.set('textDirection', typeof options.textDirection !== 'string' ? 'ltr' : options.textDirection);
	o.set('_rtl', o.get('textDirection') === 'rtl');
	// An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
	o.set('reverseCommands', ['indent-outdent'].concat(options.reverseButtons || []));
	o.set('_reverseCommandArray', ('-' + o.get('reverseCommands').join('-')).split('-'));
	if (numbers.isEven(o.get('_reverseCommandArray').length)) {
		console.warn('[SUNEDITOR.create.warning] The "reverseCommands" option is invalid, Shortcuts key may not work properly.');
	}

	// etc
	o.set('historyStackDelayTime', typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400);
	o.set('_editableClass', 'sun-editor-editable' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') + (o.get('type') === 'document' ? ' se-type-document-editable' : ''));
	o.set('lineAttrReset', ['id'].concat(options.lineAttrReset && typeof options.lineAttrReset === 'string' ? options.lineAttrReset.toLowerCase().split('|') : []));
	o.set('printClass', typeof options.printClass === 'string' ? options.printClass + ' ' + o.get('_editableClass') : null);

	/** whitelist, blacklist */
	// default line
	o.set('defaultLine', typeof options.defaultLine === 'string' && options.defaultLine.length > 0 ? options.defaultLine : 'p');
	// element
	const elw = (typeof options.elementWhitelist === 'string' ? options.elementWhitelist : '').toLowerCase();
	const mjxEls = o.get('externalLibs').mathjax ? DEFAULT_CLASS_MJX + '|' : '';
	o.set('elementWhitelist', elw + (elw ? '|' : '') + mjxEls + o.get('_allowedExtraTag'));
	const elb = _createBlacklist((typeof options.elementBlacklist === 'string' ? options.elementBlacklist : '').toLowerCase(), o.get('defaultLine'));
	o.set('elementBlacklist', elb + (elb ? '|' : '') + o.get('_disallowedExtraTag'));
	// attribute
	o.set('attributeWhitelist', !options.attributeWhitelist || typeof options.attributeWhitelist !== 'object' ? null : options.attributeWhitelist);
	o.set('attributeBlacklist', !options.attributeBlacklist || typeof options.attributeBlacklist !== 'object' ? null : options.attributeBlacklist);
	// format tag
	o.set(
		'formatClosureBrLine',
		_createFormatInfo(
			options.formatClosureBrLine,
			(options.__defaultFormatClosureBrLine = typeof options.__defaultFormatClosureBrLine === 'string' ? options.__defaultFormatClosureBrLine : DEFAULT_FORMAT_CLOSURE_BR_LINE).toLowerCase(),
			o.get('elementBlacklist')
		)
	);
	o.set(
		'formatBrLine',
		_createFormatInfo(
			(options.formatBrLine || '') + '|' + o.get('formatClosureBrLine').str,
			(options.__defaultFormatBrLine = typeof options.__defaultFormatBrLine === 'string' ? options.__defaultFormatBrLine : DEFAULT_FORMAT_BR_LINE).toLowerCase(),
			o.get('elementBlacklist')
		)
	);
	o.set(
		'formatLine',
		_createFormatInfo(
			REQUIRED_FORMAT_LINE + '|' + (options.formatLine || '') + '|' + o.get('formatBrLine').str,
			(options.__defaultFormatLine = typeof options.__defaultFormatLine === 'string' ? options.__defaultFormatLine : DEFAULT_FORMAT_LINE).toLowerCase(),
			o.get('elementBlacklist')
		)
	);

	// Error - default line
	if (!o.get('formatLine').reg.test(o.get('defaultLine'))) {
		throw Error(`[SUNEDITOR.create.fail] The "defaultLine(${o.get('defaultLine')})" option must be included in the "formatLine(${o.get('formatLine').str})" option.`);
	}

	o.set(
		'formatClosureBlock',
		_createFormatInfo(
			options.formatClosureBlock,
			(options.__defaultFormatClosureBlock = typeof options.__defaultFormatClosureBlock === 'string' ? options.__defaultFormatClosureBlock : DEFAULT_FORMAT_CLOSURE_BLOCK).toLowerCase(),
			o.get('elementBlacklist')
		)
	);
	o.set(
		'formatBlock',
		_createFormatInfo(
			(options.formatBlock || '') + '|' + o.get('formatClosureBlock').str,
			(options.__defaultFormatBlock = typeof options.__defaultFormatBlock === 'string' ? options.__defaultFormatBlock : DEFAULT_FORMAT_BLOCK).toLowerCase(),
			o.get('elementBlacklist')
		)
	);

	o.set('allowedEmptyTags', DEFAULT_ALLOWED_EMPTY_NODE_LIST + (options.allowedEmptyTags ? ', ' + options.allowedEmptyTags : ''));

	/** __defaults */
	o.set('__defaultElementWhitelist', REQUIRED_ELEMENT_WHITELIST + '|' + (typeof options.__defaultElementWhitelist === 'string' ? options.__defaultElementWhitelist : DEFAULT_ELEMENT_WHITELIST).toLowerCase());
	o.set('__defaultAttributeWhitelist', (typeof options.__defaultAttributeWhitelist === 'string' ? options.__defaultAttributeWhitelist : DEFAULT_ATTRIBUTE_WHITELIST).toLowerCase());
	// --- create element whitelist (__defaultElementWhiteList + elementWhitelist + format[line, BrLine, Block, Closureblock, ClosureBrLine] - elementBlacklist)
	o.set('_editorElementWhitelist', o.get('elementWhitelist') === '*' ? '*' : _createWhitelist(o));

	/** Toolbar */
	o.set('toolbar_width', options.toolbar_width ? (numbers.is(options.toolbar_width) ? options.toolbar_width + 'px' : options.toolbar_width) : 'auto');
	o.set('toolbar_container', options.toolbar_container && !/inline/i.test(o.get('mode')) ? (typeof options.toolbar_container === 'string' ? _d.querySelector(options.toolbar_container) : options.toolbar_container) : null);
	o.set('toolbar_sticky', /balloon/i.test(o.get('mode')) ? -1 : options.toolbar_sticky === undefined ? 0 : numbers.is(options.toolbar_sticky) ? numbers.get(options.toolbar_sticky, 0) : -1);
	o.set('toolbar_hide', !!options.toolbar_hide);

	/** subToolbar */
	let subButtons = null;
	const subbar = options.subToolbar;
	if (subbar?.buttonList?.length > 0) {
		if (/balloon/.test(o.get('mode'))) {
			console.warn('[SUNEDITOR.create.subToolbar.fail] When the "mode" option is "balloon-*", the "subToolbar" option is omitted.');
		} else {
			o.set('_subMode', subbar.mode || 'balloon');
			o.set('toolbar.sub_width', subbar.width ? (numbers.is(subbar.width) ? subbar.width + 'px' : subbar.width) : 'auto');
			subButtons = o.get('_rtl') ? subbar.buttonList.reverse() : subbar.buttonList;
			o.set('buttons_sub', new Set(subButtons.toString().split(',')));
		}
	}

	/** root options */
	const frameMap = new Map();
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		frameMap.set(editorTargets[i].key, InitFrameOptions(editorTargets[i].options || {}, options));
	}

	/** Key actions */
	o.set('tabDisable', !!options.tabDisable);
	o.set('shortcutsHint', options.shortcutsHint === undefined ? true : !!options.shortcutsHint);
	const shortcuts = !(options.shortcutsDisable === undefined ? true : !!options.shortcutsDisable)
		? {}
		: [
				{
					// default command
					selectAll: ['c+65', 'A'],
					bold: ['c+66', 'B'],
					strike: ['c+s+83', 'S'],
					underline: ['c+85', 'U'],
					italic: ['c+73', 'I'],
					redo: ['c+89', 'Y', 'c+s+90', 'Z'],
					undo: ['c+90', 'Z'],
					indent: ['c+221', ']'],
					outdent: ['c+219', '['],
					save: ['c+83', 'S'],
					// plugins
					link: ['c+75', 'K'],
					hr: ['!+---+=+~shortcut', ''],
					list_numbered: ['!+1.+_+~shortcut', ''],
					list_bulleted: ['!+*.+_+~shortcut', ''],
					// custom
					_h1: ['c+s+49+p~formatBlock.createHeader', ''],
					_h2: ['c+s+50+p~formatBlock.createHeader', ''],
					_h3: ['c+s+51+p~formatBlock.createHeader', '']
				},
				options.shortcuts || {}
		  ].reduce((_default, _new) => {
				for (const key in _new) {
					_default[key] = _new[key];
				}
				return _default;
		  }, {});
	o.set('shortcuts', shortcuts);

	/** View */
	o.set('fullScreenOffset', options.fullScreenOffset === undefined ? 0 : numbers.is(options.fullScreenOffset) ? numbers.get(options.fullScreenOffset, 0) : 0);
	o.set('previewTemplate', typeof options.previewTemplate === 'string' ? options.previewTemplate : null);
	o.set('printTemplate', typeof options.printTemplate === 'string' ? options.printTemplate : null);

	/** --- Media select */
	o.set('componentAutoSelect', options.componentAutoSelect === undefined ? false : !!options.componentAutoSelect);

	/** --- Url input protocol */
	o.set('defaultUrlProtocol', typeof options.defaultUrlProtocol === 'string' ? options.defaultUrlProtocol : null);

	/** External library */
	// CodeMirror
	const cm = o.get('externalLibs').codeMirror;
	if (cm) {
		o.set('codeMirror', cm);
		if (cm.EditorView) {
			o.set('codeMirror6Editor', true);
		} else if (cm.src) {
			o.set('codeMirror5Editor', true);
		} else {
			console.warn('[SUNEDITOR.options.externalLibs.codeMirror.fail] The codeMirror option is set incorrectly.');
			o.set('codeMirror', null);
		}
	}

	/** Private options */
	o.set('__listCommonStyle', options.__listCommonStyle || ['fontSize', 'color', 'fontFamily', 'fontWeight', 'fontStyle']);

	/** --- Icons ------------------------------------------------------------------------------------------ */
	const icons =
		!options.icons || typeof options.icons !== 'object'
			? _icons
			: [_icons, options.icons].reduce((_default, _new) => {
					for (const key in _new) {
						_default[key] = _new[key];
					}
					return _default;
			  }, {});
	o.set('icons', icons);

	/** Create all used styles  */
	const allUsedStyles = new Set(DEFAULT_CONTENT_STYLES.split('|'));
	const _ss = options.spanStyles?.split('|') || [];
	const _ls = o.get('__listCommonStyle');
	const _dts = DEFAULT_TEXT_STYLES.split('|');
	for (let i = 0, len = _dts.length; i < len; i++) {
		allUsedStyles.add(_dts[i]);
	}
	for (const _ts of Object.values(o.get('tagStyles'))) {
		const _tss = _ts.split('|');
		for (let i = 0, len = _tss.length; i < len; i++) {
			allUsedStyles.add(_tss[i]);
		}
	}
	for (let i = 0, len = _ss.length; i < len; i++) {
		allUsedStyles.add(_ss[i]);
	}
	for (let i = 0, len = _ls.length; i < len; i++) {
		allUsedStyles.add(_ls[i]);
	}
	const _aus = (typeof options.allUsedStyles === 'string' ? options.allUsedStyles.split('|') : options.allUsedStyles) || [];
	for (let i = 0, len = _aus.length; i < len; i++) {
		allUsedStyles.add(_aus[i]);
	}
	o.set('allUsedStyles', allUsedStyles);

	return {
		o: o,
		i: icons,
		l: /** @type {Object<string, string>} */ (options.lang || _defaultLang),
		v: (options.value = typeof options.value === 'string' ? options.value : null),
		buttons: o.get('_rtl') ? buttonList.reverse() : buttonList,
		subButtons: subButtons,
		statusbarContainer: typeof options.statusbar_container === 'string' ? _d.querySelector(options.statusbar_container) : options.statusbar_container,
		frameMap: frameMap
	};
}

/**
 * @description Create a context object for the editor frame.
 * @param {Map<string, *>} targetOptions - editor.frameOptions
 * @param {HTMLElement} statusbar - statusbar element
 * @returns {{statusbar: HTMLElement, navigation: HTMLElement, charWrapper: HTMLElement, charCounter: HTMLElement}}
 */
export function CreateStatusbar(targetOptions, statusbar) {
	let navigation = null;
	let charWrapper = null;
	let charCounter = null;

	if (targetOptions.get('statusbar')) {
		statusbar = statusbar || domUtils.createElement('DIV', { class: 'se-status-bar sun-editor-common' });

		/** navigation */
		navigation = statusbar.querySelector('.se-navigation') || domUtils.createElement('DIV', { class: 'se-navigation sun-editor-common' });
		statusbar.appendChild(navigation);

		/** char counter */
		if (targetOptions.get('charCounter')) {
			charWrapper = statusbar.querySelector('.se-char-counter-wrapper') || domUtils.createElement('DIV', { class: 'se-char-counter-wrapper' });

			if (targetOptions.get('charCounter_label')) {
				const charLabel = charWrapper.querySelector('.se-char-label') || domUtils.createElement('SPAN', { class: 'se-char-label' });
				charLabel.textContent = targetOptions.get('charCounter_label');
				charWrapper.appendChild(charLabel);
			}

			charCounter = charWrapper.querySelector('.se-char-counter') || domUtils.createElement('SPAN', { class: 'se-char-counter' });
			charCounter.textContent = '0';
			charWrapper.appendChild(charCounter);

			if (targetOptions.get('charCounter_max') > 0) {
				const char_max = charWrapper.querySelector('.se-char-max') || domUtils.createElement('SPAN', { class: 'se-char-max' });
				char_max.textContent = ' / ' + targetOptions.get('charCounter_max');
				charWrapper.appendChild(char_max);
			}

			statusbar.appendChild(charWrapper);
		}
	}

	return {
		statusbar: statusbar,
		navigation: /** @type {HTMLElement} */ (navigation),
		charWrapper: /** @type {HTMLElement} */ (charWrapper),
		charCounter: /** @type {HTMLElement} */ (charCounter)
	};
}

/**
 * @description Initialize options.
 * @param {EditorFrameOptions} o - Target options
 * @param {EditorInitOptions} origin - Full options
 * @returns {Map<string, *>}
 */
function InitFrameOptions(o, origin) {
	const fo = new Map();

	fo.set('_origin', o);
	const barContainer = origin.statusbar_container;

	// members
	const value = o.value === undefined ? origin.value : o.value;
	const placeholder = o.placeholder === undefined ? origin.placeholder : o.placeholder;
	const editableFrameAttributes = o.editableFrameAttributes === undefined ? origin.editableFrameAttributes : o.editableFrameAttributes;
	const width = o.width === undefined ? origin.width : o.width;
	const minWidth = o.minWidth === undefined ? origin.minWidth : o.minWidth;
	const maxWidth = o.maxWidth === undefined ? origin.maxWidth : o.maxWidth;
	const height = o.height === undefined ? origin.height : o.height;
	const minHeight = o.minHeight === undefined ? origin.minHeight : o.minHeight;
	const maxHeight = o.maxHeight === undefined ? origin.maxHeight : o.maxHeight;
	const editorStyle = o.editorStyle === undefined ? origin.editorStyle : o.editorStyle;
	const iframe = o.iframe === undefined ? origin.iframe : o.iframe;
	const iframe_fullPage = o.iframe_fullPage === undefined ? origin.iframe_fullPage : o.iframe_fullPage;
	const iframe_attributes = o.iframe_attributes === undefined ? origin.iframe_attributes : o.iframe_attributes;
	const iframe_cssFileName = o.iframe_cssFileName === undefined ? origin.iframe_cssFileName : o.iframe_cssFileName;
	const statusbar = barContainer || o.statusbar === undefined ? origin.statusbar : o.statusbar;
	const statusbar_showPathLabel = barContainer || o.statusbar_showPathLabel === undefined ? origin.statusbar_showPathLabel : o.statusbar_showPathLabel;
	const statusbar_resizeEnable = barContainer ? false : o.statusbar_resizeEnable === undefined ? origin.statusbar_resizeEnable : o.statusbar_resizeEnable;
	const charCounter = barContainer || o.charCounter === undefined ? origin.charCounter : o.charCounter;
	const charCounter_max = barContainer || o.charCounter_max === undefined ? origin.charCounter_max : o.charCounter_max;
	const charCounter_label = barContainer || o.charCounter_label === undefined ? origin.charCounter_label : o.charCounter_label;
	const charCounter_type = barContainer || o.charCounter_type === undefined ? origin.charCounter_type : o.charCounter_type;

	// value
	fo.set('value', value);
	fo.set('placeholder', placeholder);
	fo.set('editableFrameAttributes', editableFrameAttributes || {});
	// styles
	fo.set('width', width ? (numbers.is(width) ? width + 'px' : width) : '100%');
	fo.set('minWidth', (numbers.is(minWidth) ? minWidth + 'px' : minWidth) || '');
	fo.set('maxWidth', (numbers.is(maxWidth) ? maxWidth + 'px' : maxWidth) || '');
	fo.set('height', height ? (numbers.is(height) ? height + 'px' : height) : 'auto');
	fo.set('minHeight', (numbers.is(minHeight) ? minHeight + 'px' : minHeight) || '');
	fo.set('maxHeight', (numbers.is(maxHeight) ? maxHeight + 'px' : maxHeight) || '');
	fo.set('_defaultStyles', converter._setDefaultOptionStyle(fo, typeof editorStyle === 'string' ? editorStyle : ''));
	// iframe
	fo.set('iframe', !!(iframe_fullPage || iframe));
	fo.set('iframe_fullPage', !!iframe_fullPage);
	fo.set('iframe_attributes', iframe_attributes || {});
	fo.set('iframe_cssFileName', iframe ? (typeof iframe_cssFileName === 'string' ? [iframe_cssFileName] : iframe_cssFileName || ['suneditor']) : null);
	// status bar
	const hasStatusbar = statusbar === undefined ? true : !!statusbar;
	fo.set('statusbar', hasStatusbar);
	fo.set('statusbar_showPathLabel', !hasStatusbar ? false : typeof statusbar_showPathLabel === 'boolean' ? statusbar_showPathLabel : true);
	fo.set('statusbar_resizeEnable', !hasStatusbar ? false : statusbar_resizeEnable === undefined ? true : !!statusbar_resizeEnable);
	// status bar - character count
	fo.set('charCounter', charCounter_max > 0 ? true : typeof charCounter === 'boolean' ? charCounter : false);
	fo.set('charCounter_max', numbers.is(charCounter_max) && charCounter_max > -1 ? charCounter_max * 1 : null);
	fo.set('charCounter_label', typeof charCounter_label === 'string' ? charCounter_label.trim() : null);
	fo.set('charCounter_type', typeof charCounter_type === 'string' ? charCounter_type : 'char');

	return fo;
}

/**
 * @private
 * @description Initialize property of suneditor elements
 * @param {string} key - The key of the editor frame
 * @param {Map<string, *>} options - options
 * @param {Element} topDiv - top div
 * @param {Map<string, *>} targetOptions - editor.frameOptions
 * @returns {{bottomBar: ReturnType<CreateStatusbar>, wysiwygFrame: Element, codeView: Element, placeholder: Element}}
 */
function _initTargetElements(key, options, topDiv, targetOptions) {
	const editorStyles = targetOptions.get('_defaultStyles');
	/** top div */
	topDiv.style.cssText = editorStyles.top;

	/** editor */
	// wysiwyg div or iframe
	const wysiwygDiv = domUtils.createElement(!targetOptions.get('iframe') ? 'DIV' : 'IFRAME', {
		class: 'se-wrapper-inner se-wrapper-wysiwyg',
		'data-root-key': key
	});

	if (!targetOptions.get('iframe')) {
		wysiwygDiv.setAttribute('contenteditable', 'true');
		wysiwygDiv.setAttribute('scrolling', 'auto');
		wysiwygDiv.className += ' ' + options.get('_editableClass');
		wysiwygDiv.style.cssText = editorStyles.frame + editorStyles.editor;
	} else {
		const frameAttrs = targetOptions.get('iframe_attributes');
		for (const frameKey in frameAttrs) {
			wysiwygDiv.setAttribute(frameKey, frameAttrs[frameKey]);
		}

		const iframeWW = /** @type {HTMLIFrameElement} */ (/** @type {unknown} */ (wysiwygDiv));
		iframeWW.allowFullscreen = true;
		iframeWW.frameBorder = '0';
		iframeWW.style.cssText = editorStyles.frame;
	}

	// textarea for code view
	const textarea = domUtils.createElement('TEXTAREA', { class: 'se-wrapper-inner se-code-viewer', style: editorStyles.frame });
	let placeholder = null;
	if (targetOptions.get('placeholder')) {
		placeholder = domUtils.createElement('SPAN', { class: 'se-placeholder' });
		placeholder.textContent = targetOptions.get('placeholder');
	}

	return {
		bottomBar: CreateStatusbar(targetOptions, null),
		wysiwygFrame: wysiwygDiv,
		codeView: textarea,
		placeholder: placeholder
	};
}

/**
 * @private
 * @description Check the CodeMirror option to apply the CodeMirror and return the CodeMirror element.
 * @param {Map<string, *>} options options
 * @param {Element} textarea textarea element
 */
function _checkCodeMirror(options, targetOptions, textarea) {
	let cmeditor = null;
	let hasCodeMirror = false;

	if (options.get('codeMirror6Editor')) {
		const codeMirror = options.get('codeMirror');
		const codeStyles = textarea.style.cssText;
		const cm = new codeMirror.EditorView({
			parent: textarea.parentElement,
			extensions: codeMirror.extensions,
			state: codeMirror.state
		});

		targetOptions.set('codeMirror6Editor', cm);
		cmeditor = cm.dom;
		cmeditor.style.cssText = codeStyles;
		hasCodeMirror = true;
	} else if (options.get('codeMirror5Editor')) {
		const codeMirror = options.get('codeMirror');
		const cmOptions = [
			{
				mode: 'htmlmixed',
				htmlMode: true,
				lineNumbers: true,
				lineWrapping: true
			},
			codeMirror.options || {}
		].reduce((init, option) => {
			for (const key in option) {
				init[key] = option[key];
			}
			return init;
		}, {});

		if (targetOptions.get('height') === 'auto') {
			cmOptions.viewportMargin = Infinity;
			cmOptions.height = 'auto';
		}

		const codeStyles = textarea.style.cssText;
		const cm = codeMirror.src.fromTextArea(textarea, cmOptions);
		targetOptions.set('codeMirror5Editor', cm);
		cmeditor = cm.display.wrapper;
		cmeditor.style.cssText = codeStyles;
		hasCodeMirror = true;
	}

	options.set('hasCodeMirror', hasCodeMirror);
	if (cmeditor) {
		domUtils.removeItem(textarea);
		cmeditor.className += ' se-code-viewer-mirror';
		return cmeditor;
	}

	return textarea;
}

/**
 * @private
 * @description create blacklist
 * @param {string} blacklist blacklist
 * @param {string} defaultLine options.get('defaultLine')
 * @returns {string}
 */
function _createBlacklist(blacklist, defaultLine) {
	defaultLine = defaultLine.toLowerCase();
	return blacklist
		.split('|')
		.filter(function (v) {
			if (v !== defaultLine) {
				return true;
			} else {
				console.warn(`[SUNEDITOR.constructor.createBlacklist.warn] defaultLine("<${defaultLine}>") cannot be included in the blacklist and will be removed.`);
				return false;
			}
		})
		.join('|');
}

/**
 * @private
 * @description create formats regexp object.
 * @param {string} value value
 * @param {string} defaultValue default value
 * @param {string} blacklist blacklist
 * @returns {{reg: RegExp, str: string}}
 */
function _createFormatInfo(value, defaultValue, blacklist) {
	const blist = blacklist.split('|');
	const str = (defaultValue + '|' + (typeof value === 'string' ? value.toLowerCase() : ''))
		.replace(/^\||\|$/g, '')
		.split('|')
		.filter((v) => v && !blist.includes(v))
		.join('|');
	return {
		reg: new RegExp(`^(${str})$`, 'i'),
		str: str
	};
}

/**
 * @private
 * @description create whitelist or blacklist.
 * @param {Map<string, *>} o options
 * @returns {string} whitelist
 */
function _createWhitelist(o) {
	const blacklist = o.get('elementBlacklist').split('|');
	const whitelist = (o.get('__defaultElementWhitelist') + '|' + o.get('elementWhitelist') + '|' + o.get('formatLine').str + '|' + o.get('formatBrLine').str + '|' + o.get('formatClosureBlock').str + '|' + o.get('formatClosureBrLine').str)
		.replace(/(^\||\|$)/g, '')
		.split('|')
		.filter((v, i, a) => v && a.indexOf(v) === i && !blacklist.includes(v));

	return whitelist.join('|');
}

/**
 * @private
 * @description Suneditor's Default button list
 * @param {Map<string, *>} options options
 */
function _defaultButtons(options, icons, lang) {
	const isRTL = options.get('_rtl');
	return {
		bold: ['', lang.bold, 'bold', '', icons.bold],
		underline: ['', lang.underline, 'underline', '', icons.underline],
		italic: ['', lang.italic, 'italic', '', icons.italic],
		strike: ['', lang.strike, 'strike', '', icons.strike],
		subscript: ['', lang.subscript, 'subscript', '', icons.subscript],
		superscript: ['', lang.superscript, 'superscript', '', icons.superscript],
		removeFormat: ['', lang.removeFormat, 'removeFormat', '', icons.remove_format],
		copyFormat: ['', lang.copyFormat, 'copyFormat', '', icons.format_paint],
		indent: ['se-icon-flip-rtl', lang.indent, 'indent', '', isRTL ? icons.outdent : icons.indent],
		outdent: ['se-icon-flip-rtl', lang.outdent, 'outdent', '', isRTL ? icons.indent : icons.outdent],
		fullScreen: ['se-code-view-enabled se-component-enabled', lang.fullScreen, 'fullScreen', '', icons.expansion],
		showBlocks: ['', lang.showBlocks, 'showBlocks', '', icons.show_blocks],
		codeView: ['se-code-view-enabled se-component-enabled', lang.codeView, 'codeView', '', icons.code_view],
		undo: ['se-component-enabled', lang.undo, 'undo', '', icons.undo],
		redo: ['se-component-enabled', lang.redo, 'redo', '', icons.redo],
		preview: ['se-component-enabled', lang.preview, 'preview', '', icons.preview],
		print: ['se-component-enabled', lang.print, 'print', '', icons.print],
		dir: ['', lang[isRTL ? 'dir_ltr' : 'dir_rtl'], 'dir', '', icons[isRTL ? 'dir_ltr' : 'dir_rtl']],
		dir_ltr: ['', lang.dir_ltr, 'dir_ltr', '', icons.dir_ltr],
		dir_rtl: ['', lang.dir_rtl, 'dir_rtl', '', icons.dir_rtl],
		save: ['se-component-enabled', lang.save, 'save', '', icons.save],
		newDocument: ['se-component-enabled', lang.newDocument, 'newDocument', '', icons.new_document],
		selectAll: ['se-component-enabled', lang.selectAll, 'selectAll', '', icons.select_all],
		pageBreak: ['se-component-enabled', lang.pageBreak, 'pageBreak', '', icons.page_break],
		// document type buttons
		pageUp: ['se-component-enabled', lang.pageUp, 'pageUp', '', icons.page_up],
		pageDown: ['se-component-enabled', lang.pageDown, 'pageDown', '', icons.page_down],
		pageNavigator: ['se-component-enabled', '', 'pageNavigator', 'input', '']
	};
}

/**
 * @private
 * @description Create a group div containing each module
 * @returns {{div: Element, ul: Element}}
 */
function _createModuleGroup() {
	const oUl = domUtils.createElement('UL', { class: 'se-menu-list' });
	const oDiv = domUtils.createElement('DIV', { class: 'se-btn-module se-btn-module-border' }, oUl);

	return {
		div: oDiv,
		ul: oUl
	};
}

/**
 * @private
 * @description Create a button element
 * @param {string} className className in button
 * @param {string} title Title in button
 * @param {string} dataCommand The data-command property of the button
 * @param {"command"|"dropdown"|"field"|"browser"|"input"|"modal"|"popup"} dataType The data-type property of the button
 * @param {string} innerHTML Html in button
 * @param {string} _disabled Button disabled
 * @param {Object<string, string>} icons Icons
 * @returns {{li: HTMLElement, button: HTMLElement}}
 */
function _createButton(className, title, dataCommand, dataType, innerHTML, _disabled, icons) {
	if (!innerHTML) innerHTML = '';

	const oLi = domUtils.createElement('LI');
	const label = title || '';
	const isDiv = /^INPUT|FIELD$/i.test(dataType);
	const oButton =
		'se-toolbar-separator-vertical' === className
			? domUtils.createElement('DIV', { class: className, tabindex: '-1' }, null)
			: domUtils.createElement(isDiv ? 'DIV' : 'BUTTON', {
					class: 'se-toolbar-btn se-btn se-tooltip' + (className ? ' ' + className : ''),
					'data-command': dataCommand,
					'data-type': dataType,
					'aria-label': label.replace(/<span .+<\/span>/, ''),
					tabindex: '-1'
			  });

	if (!isDiv) {
		oButton.setAttribute('type', 'button');
	}

	if (/^default\./i.test(innerHTML)) {
		innerHTML = icons[innerHTML.replace(/^default\./i, '')];
	}
	if (/^text\./i.test(innerHTML)) {
		innerHTML = innerHTML.replace(/^text\./i, '');
		oButton.className += ' se-btn-more-text';
	}

	if (_disabled) oButton.setAttribute('disabled', 'true');

	if (/^FIELD$/i.test(dataType)) domUtils.addClass(oLi, 'se-toolbar-hidden-btn');

	if (label) innerHTML += CreateTooltipInner(label);
	if (innerHTML) oButton.innerHTML = innerHTML;

	oLi.appendChild(oButton);

	return {
		li: oLi,
		button: oButton
	};
}

/**
 * @description Create tooltip HTML
 * @param {string} text Tooltip text
 * @returns {string} Tooltip HTML
 */
export function CreateTooltipInner(text) {
	return `<span class="se-tooltip-inner"><span class="se-tooltip-text">${text}</span></span>`;
}

/**
 * @description Update a button state, attributes, and icons
 * @param {HTMLElement|null} element Button element
 * @param {Object<string, *>} plugin Plugin
 * @param {Object<string, string>} icons Icons
 * @param {Object<string, string>} lang lang
 */
export function UpdateButton(element, plugin, icons, lang) {
	if (!element) return;

	const noneInner = plugin.inner === false;

	if (plugin.inner?.nodeType === 1) {
		element.appendChild(plugin.inner);
	} else {
		element.innerHTML = noneInner
			? ''
			: (plugin.inner || icons[plugin.icon] || plugin.icon || '<span class="se-icon-text">!</span>') + '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + (lang[plugin.title] || plugin.title) + '</span></span>';
	}

	element.setAttribute('aria-label', plugin.title);

	if (plugin.type) {
		element.setAttribute('data-type', plugin.type);
	}

	if (plugin.className) {
		element.className += ' ' + plugin.className;
	}

	// side, replace button
	if (plugin.afterItem) {
		domUtils.addClass(plugin.afterItem, 'se-toolbar-btn');
		element.parentElement.appendChild(plugin.afterItem);

		domUtils.addClass(element, 'se-side-btn-a');
		domUtils.addClass(plugin.afterItem, 'se-side-btn-after');
	}
	if (plugin.beforeItem) {
		domUtils.addClass(plugin.beforeItem, 'se-toolbar-btn');
		element.parentElement.insertBefore(plugin.beforeItem, element);

		if (plugin.afterItem) {
			domUtils.addClass(element, 'se-side-btn');
			domUtils.removeClass(element, 'se-side-btn-a');
		} else {
			domUtils.addClass(element, 'se-side-btn-b');
		}
		domUtils.addClass(plugin.beforeItem, 'se-side-btn-before');
	}
	if (plugin.replaceButton) {
		element.parentElement.appendChild(plugin.replaceButton);
		element.style.display = 'none';
	}

	if (!plugin.replaceButton && /^INPUT$/i.test(element.getAttribute('data-type'))) {
		const inputTarget = element.querySelector('input');
		if (inputTarget) {
			domUtils.addClass(inputTarget, 'se-toolbar-btn');
			inputTarget.setAttribute('data-command', element.getAttribute('data-command'));
			inputTarget.setAttribute('data-type', element.getAttribute('data-type'));
			if (element.hasAttribute('disabled')) inputTarget.setAttribute('disabled', 'true');
		}
	}
}

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
export function CreateToolBar(buttonList, plugins, options, icons, lang, isUpdate) {
	/** create button list */
	buttonList = JSON.parse(JSON.stringify(buttonList));
	const defaultButtonList = _defaultButtons(options, icons, lang);
	/** @type {Object<string, Array<HTMLElement>>} */
	const pluginCallButtons = {};
	const responsiveButtons = [];
	const updateButtons = [];

	let modules = null;
	let button = null;
	let plugin = null;
	let moduleElement = null;
	let buttonElement = null;
	// let vertical = false;
	const moreLayer = domUtils.createElement('DIV', { class: 'se-toolbar-more-layer' });
	const buttonTray = domUtils.createElement('DIV', { class: 'se-btn-tray' });
	const separator_vertical = domUtils.createElement('DIV', { class: 'se-toolbar-separator-vertical' });

	buttonGroupLoop: for (let i = 0, more, moreContainer, moreCommand, buttonGroup, align; i < buttonList.length; i++) {
		more = false;
		align = '';
		buttonGroup = buttonList[i];
		moduleElement = _createModuleGroup();

		// button object
		if (typeof buttonGroup === 'object') {
			// buttons loop
			for (let j = 0, moreButton; j < buttonGroup.length; j++) {
				button = buttonGroup[j];
				moreButton = false;
				plugin = plugins[button];

				if (/^%\d+/.test(button) && j === 0) {
					buttonGroup[0] = button.replace(/[^\d]/g, '');
					responsiveButtons.push(buttonGroup);
					buttonList.splice(i--, 1);
					continue buttonGroupLoop;
				}
				if (typeof plugin === 'function') {
					modules = [plugin.className, plugin.title, button, plugin.type, plugin.innerHTML, plugin._disabled];
				} else if (typeof plugin === 'object') {
					const originFnc = plugin.constructor;
					modules = [plugin.className || originFnc.className, plugin.title || originFnc.title, button, plugin.type || originFnc.type, plugin.innerHTML || originFnc.innerHTML, plugin._disabled || originFnc._disabled];
				} else {
					// align
					if (/^-/.test(button)) {
						align = button.substr(1);
						moduleElement.div.className += ' module-float-' + align;
						continue;
					}

					// rtl fix
					if (/^#/.test(button)) {
						const option = button.substr(1);
						if (option === 'fix') moduleElement.ul.className += ' se-menu-dir-fix';
						continue;
					}

					// more button
					if (/^:/.test(button)) {
						moreButton = true;
						const matched = button.match(/^:([^-]+)-([^-]+)/);
						moreCommand = '__se__more_' + i;
						const title = matched[1].trim();
						const innerHTML = matched[2].trim();
						modules = ['se-btn-more', /^lang\./i.test(title) ? lang[title.replace(/^lang\./i, '')] : title, moreCommand, 'MORE', innerHTML];
					} else if (button === '|') {
						// separator vertical
						modules = ['se-toolbar-separator-vertical', '', '', 'separator', ''];
					} else {
						// default command
						modules = defaultButtonList[button];
					}

					if (!modules) {
						if (!plugin) throw Error(`[SUNEDITOR.create.toolbar.fail] The button name of a plugin that does not exist. [${button}]`);
						plugin = typeof plugin === 'object' ? plugin.constructor : plugin;
						modules = [plugin.className, plugin.title, plugin.key, plugin.type, plugin.innerHTML, plugin._disabled];
					}
				}

				buttonElement = _createButton(modules[0], modules[1], modules[2], modules[3], modules[4], modules[5], icons);
				(more ? moreContainer : moduleElement.ul).appendChild(buttonElement.li);

				if (plugin) {
					if (pluginCallButtons[button]) {
						pluginCallButtons[button].push(buttonElement.button);
					} else {
						pluginCallButtons[button] = [buttonElement.button];
					}

					if (isUpdate) {
						updateButtons.push({ button: buttonElement.button, plugin, key: button });
					}
				}

				// more button
				if (moreButton) {
					more = true;
					moreContainer = domUtils.createElement('DIV');
					moreContainer.className = 'se-more-layer ' + moreCommand;
					moreContainer.setAttribute('data-ref', moreCommand);
					moreContainer.innerHTML = '<div class="se-more-form"><ul class="se-menu-list"' + (align ? ' style="float: ' + align + ';"' : '') + '></ul></div>';
					moreLayer.appendChild(moreContainer);
					moreContainer = moreContainer.firstElementChild.firstElementChild;
				}
			}

			// if (vertical) {
			// 	const sv = separator_vertical.cloneNode(false);
			// 	buttonTray.appendChild(sv);
			// }

			buttonTray.appendChild(moduleElement.div);
			// vertical = true;
		} else if (buttonGroup === '|') {
			// // separator vertical
			const sv = separator_vertical.cloneNode(false);
			buttonTray.appendChild(sv);
			continue;
		} else if (/^\/$/.test(buttonGroup)) {
			/** line break  */
			const enterDiv = domUtils.createElement('DIV', { class: 'se-btn-module-enter' });
			buttonTray.appendChild(enterDiv);
			// vertical = false;
		}
	}

	switch (buttonTray.children.length) {
		case 0:
			buttonTray.style.display = 'none';
			break;
		case 1:
			domUtils.removeClass(buttonTray.firstElementChild, 'se-btn-module-border');
			break;
	}

	if (moreLayer.children.length > 0) buttonTray.appendChild(moreLayer);
	if (responsiveButtons.length > 0) responsiveButtons.unshift(buttonList);

	// rendering toolbar
	const tool_bar = domUtils.createElement('DIV', { class: 'se-toolbar sun-editor-common' + (!options.get('shortcutsHint') ? ' se-shortcut-hide' : '') }, buttonTray);

	if (options.get('toolbar_hide')) tool_bar.style.display = 'none';

	return {
		element: tool_bar,
		pluginCallButtons,
		responsiveButtons,
		buttonTray,
		updateButtons
	};
}

export default Constructor;
