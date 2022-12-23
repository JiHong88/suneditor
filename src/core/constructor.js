import _icons from '../assets/defaultIcons';
import _defaultLang from '../langs/en';
import Context, { CreateContextElement } from './context';
import { domUtils, numbers, converter, env } from '../helper';

const _d = env._d;
const _w = env._w;
const DEFAULT_BUTTON_LIST = [['undo', 'redo'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'], ['outdent', 'indent'], ['fullScreen', 'showBlocks', 'codeView'], ['preview', 'print']];
const DEFAULT_ELEMENT_WHITELIST = 'br|p|div|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
const DEFAULT_ATTRIBUTE_WHITELIST = 'contenteditable|colspan|rowspan|target|href|download|rel|src|alt|class|type|controls';
const DEFAULT_FORMAT_LINE = 'P|DIV|H[1-6]|LI|TH|TD|DETAILS';
const DEFAULT_FORMAT_BR_LINE = 'PRE';
const DEFAULT_FORMAT_CLOSURE_BR_LINE = '';
const DEFAULT_FORMAT_BLOCK = 'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|DETAILS';
const DEFAULT_FORMAT_CLOSURE_BLOCK = 'TH|TD';

/**
 * @description document create
 * @param {Object} options Options
 * @param {Element|Array.<Element>} editorTargets Target textarea
 * @returns {Object}
 */
const Constructor = function (editorTargets, options) {
	if (typeof options !== 'object') options = {};

	/** --- options --------------------------------------------------------------- */
	InitOptions(options, editorTargets);

	/** --- carrier wrapper --------------------------------------------------------------- */
	const editor_carrier_wrapper = domUtils.createElement('DIV', { class: 'sun-editor sun-editor-carrier-wrapper' + (options._rtl ? ' se-rtl' : '') });

	// modal
	const modal = domUtils.createElement('DIV', { class: 'se-modal sun-editor-common' });
	const modal_back = domUtils.createElement('DIV', { class: 'se-modal-back', style: 'display: none;' });
	const modal_inner = domUtils.createElement('DIV', { class: 'se-modal-inner', style: 'display: none;' });
	modal.appendChild(modal_back);
	modal.appendChild(modal_inner);
	editor_carrier_wrapper.appendChild(modal);

	// loding box, resizing back
	editor_carrier_wrapper.appendChild(domUtils.createElement('DIV', { class: 'se-resizing-back' }));
	editor_carrier_wrapper.appendChild(domUtils.createElement('DIV', { class: 'se-loading-box sun-editor-common' }, '<div class="se-loading-effect"></div>'));
	_d.body.appendChild(editor_carrier_wrapper);

	/** --- toolbar --------------------------------------------------------------- */
	const tool_bar_main = CreateToolBar(options.buttonList, options.plugins, options);
	const toolbar = tool_bar_main.element;
	toolbar.style.visibility = 'hidden';
	if (tool_bar_main.pluginCallButtons.math) _checkKatexMath(options.katex);

	// toolbar mode
	if (/inline/i.test(options.mode)) {
		toolbar.className += ' se-toolbar-inline';
		toolbar.style.width = options.toolbar_width;
	} else if (/balloon/i.test(options.mode)) {
		toolbar.className += ' se-toolbar-balloon';
		toolbar.style.width = options.toolbar_width;
		toolbar.appendChild(domUtils.createElement('DIV', { class: 'se-arrow' }));
	}

	/** multi root set - start -------------------------------------------------------------- */
	/** --- editor div --------------------------------------------------------------- */
	const rootId = editorTargets[0].key || null;
	const rootKeys = [];
	const rootTargets = new _w.Map();
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		const editTarget = editorTargets[i];
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (options._rtl ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		const editor_div = domUtils.createElement('DIV', { class: 'se-wrapper' });

		const toolbarShadow = toolbar.cloneNode(false);
		toolbarShadow.className += ' se-toolbar-shadow';
		container.appendChild(toolbarShadow);

		// init element
		const initElements = _initElements(options, top_div, editTarget.options || {});
		const bottomBar = initElements.bottomBar;
		const status_bar = bottomBar.statusbar;
		const wysiwyg_div = initElements.wysiwygFrame;
		const placeholder_span = initElements.placeholder;
		let textarea = initElements.codeView;

		// line breaker
		const line_breaker = domUtils.createElement('DIV', { class: 'se-line-breaker' }, '<button class="se-btn">' + options.icons.line_break + '</button>');
		const line_breaker_t = domUtils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-t' }, '<button class="se-btn">' + options.icons.line_break + '</button>');
		const line_breaker_b = domUtils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-b' }, '<button class="se-btn">' + options.icons.line_break + '</button>');
		line_breaker_t.innerHTML = line_breaker_b.innerHTML = options.icons.line_break;
		editor_div.appendChild(line_breaker);
		editor_div.appendChild(line_breaker_t);
		editor_div.appendChild(line_breaker_b);

		// statusbar
		const statusbar_container = options.statusbar_container;
		if (status_bar && statusbar_container) statusbar_container.appendChild(status_bar);

		// append container
		editor_div.appendChild(textarea);
		if (placeholder_span) editor_div.appendChild(placeholder_span);
		container.appendChild(domUtils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
		container.appendChild(editor_div);

		const key = editTarget.key || null;
		if (status_bar && !statusbar_container) container.appendChild(status_bar);
		textarea = _checkCodeMirror(options, textarea);
		top_div.appendChild(container);
		top_div.setAttribute('data-se-root', key);

		rootKeys.push(key);
		rootTargets.set(key, CreateContextElement(editTarget, top_div, wysiwyg_div, textarea));
	}
	/** multi root set - end -------------------------------------------------------------- */

	// toolbar container
	const toolbar_container = options.toolbar_container;
	if (toolbar_container) {
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (options._rtl ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		container.appendChild(toolbar);
		top_div.appendChild(container);
		toolbar_container.appendChild(top_div);
	} else {
		const rootContainer = rootTargets.get(rootId).get('container');
		rootContainer.insertBefore(toolbar, rootContainer.firstElementChild);
	}

	return {
		commonContext: Context(toolbar, editor_carrier_wrapper, options),
		rootId: rootId,
		rootKeys: rootKeys,
		rootTargets: rootTargets,
		pluginCallButtons: tool_bar_main.pluginCallButtons,
		responsiveButtons: tool_bar_main.responsiveButtons
	};
};

/**
 * @description Reset the options.
 * @param {Object} context Context object
 * @param {Object} mergeOptions The new options
 * @returns {Object}
 */
export function ResetOptions(context, originOptions, mergeOptions) {
	InitOptions(mergeOptions);

	const tc = this.targetContext;
	const toolbar = context.toolBar.main;
	const editorContainer = tc.get('container');
	const editorArea = tc.get('editorArea');
	const isNewToolbarContainer = mergeOptions.toolbar_container && mergeOptions.toolbar_container !== originOptions.toolbar_container;
	const isNewToolbar = mergeOptions.lang !== originOptions.lang || mergeOptions.buttonList !== originOptions.buttonList || mergeOptions.mode !== originOptions.mode || isNewToolbarContainer;

	const tool_bar = CreateToolBar(isNewToolbar ? mergeOptions.buttonList : originOptions.buttonList, mergeOptions.plugins, mergeOptions);
	if (tool_bar.pluginCallButtons.math) _checkKatexMath(mergeOptions.katex);
	const arrow = domUtils.createElement('DIV', { class: 'se-arrow' });

	if (isNewToolbar) {
		tool_bar.element.style.visibility = 'hidden';
		// toolbar container
		if (isNewToolbarContainer) {
			mergeOptions.toolbar_container.appendChild(tool_bar.element);
			toolbar.parentElement.removeChild(toolbar);
		} else {
			toolbar.parentElement.replaceChild(tool_bar.element, toolbar);
		}

		context.toolBar.main = tool_bar.element;
		context.toolBar._menuTray = tool_bar._menuTray;
		context.toolBar._arrow = arrow;
	}

	const initElements = _initElements(mergeOptions, tc.get('topArea'), isNewToolbar ? tool_bar.element : toolbar, arrow);
	const bottomBar = initElements.bottomBar;
	const wysiwygFrame = initElements.wysiwygFrame;
	const placeholder_span = initElements.placeholder;
	let code = initElements.codeView;

	if (tc.get('statusbar')) domUtils.removeItem(tc.get('statusbar'));
	if (bottomBar.statusbar) {
		if (mergeOptions.statusbar_container && mergeOptions.statusbar_container !== originOptions.statusbar_container) {
			mergeOptions.statusbar_container.appendChild(bottomBar.statusbar);
		} else {
			editorContainer.appendChild(bottomBar.statusbar);
		}
	}

	editorArea.innerHTML = '';
	editorArea.appendChild(code);
	if (placeholder_span) editorArea.appendChild(placeholder_span);

	code = _checkCodeMirror(mergeOptions, code);

	tc.set('statusbar', bottomBar.statusbar);
	tc.set('navigation', bottomBar.navigation);
	tc.set('charWrapper', bottomBar.charWrapper);
	tc.set('charCounter', bottomBar.charCounter);
	tc.set('wysiwygFrame', wysiwygFrame);
	tc.set('code', code);
	tc.set('placeholder', placeholder_span);

	if (mergeOptions._rtl) {
		domUtils.addClass(tc.get('topArea'), 'se-rtl');
		domUtils.addClass(context.toolbar._wrapper, 'se-rtl');
		domUtils.addClass(context._carrierWrapper, 'se-rtl');
	} else {
		domUtils.removeClass(tc.get('topArea'), 'se-rtl');
		domUtils.removeClass(context.toolbar._wrapper, 'se-rtl');
		domUtils.removeClass(context._carrierWrapper, 'se-rtl');
	}

	return {
		callButtons: tool_bar.pluginCallButtons,
		toolbar: tool_bar
	};
}

/**
 * @description Initialize options
 * @param {Object} options Options object
 * @param {Element|Array.<Element>} editorTargets Target textarea
 */
function InitOptions(options, editorTargets) {
	if (options.multiRoot) {
		if (!options.toolbar_container && !/inline|balloon/i.test(options.mode)) throw Error('[SUNEDITOR.create.fail] In multi root, The "mode" option cannot be "classic" without using the "toolbar_container" option.');
		if (options.statusbar && !options.statusbar_container) throw Error('[SUNEDITOR.create.fail] In multi root, The "statusbar_container" option is required unless the "statusbar" option is "false".');
	}

	const plugins = {};
	if (options.plugins) {
		const _plugins = (options._init_plugins = options.plugins);
		const pluginsValues = _plugins.length
			? _plugins
			: _w.Object.keys(_plugins).map(function (name) {
					return _plugins[name];
			  });
		for (let i = 0, len = pluginsValues.length, p; i < len; i++) {
			p = pluginsValues[i].default || pluginsValues[i];
			plugins[p.key] = p;
		}
	}
	options.plugins = plugins;
	options.events = options.events || {};

	/** Base */
	options.mode = options.mode || 'classic'; // classic, inline, balloon, balloon-always
	options.lang = options.lang || _defaultLang;
	// text style tags
	const textTags = (options.textTags = [{ bold: 'STRONG', underline: 'U', italic: 'EM', strike: 'DEL', sub: 'SUB', sup: 'SUP' }, options.textTags || {}].reduce(function (_default, _new) {
		for (let key in _new) {
			_default[key] = _new[key];
		}
		return _default;
	}, {}));
	options._spanStylesRegExp = new _w.RegExp('\\s*[^-a-zA-Z](font-family|font-size|color|background-color' + (options.spanStyles ? '|' + options.spanStyles : '') + ')\\s*:[^;]+(?!;)*', 'gi');
	options._formatStylesRegExp = new _w.RegExp('\\s*[^-a-zA-Z](text-align|margin-left|margin-right' + (options.formatStyles ? '|' + options.formatStyles : '') + ')\\s*:[^;]+(?!;)*', 'gi');
	options._styleNodeMap = {
		strong: textTags.bold.toLowerCase(),
		b: textTags.bold.toLowerCase(),
		u: textTags.underline.toLowerCase(),
		ins: textTags.underline.toLowerCase(),
		em: textTags.italic.toLowerCase(),
		i: textTags.italic.toLowerCase(),
		del: textTags.strike.toLowerCase(),
		strike: textTags.strike.toLowerCase(),
		s: textTags.strike.toLowerCase(),
		sub: textTags.sub.toLowerCase(),
		sup: textTags.sup.toLowerCase()
	};
	options._defaultCommand = {
		bold: options.textTags.bold,
		underline: options.textTags.underline,
		italic: options.textTags.italic,
		strike: options.textTags.strike,
		subscript: options.textTags.sub,
		superscript: options.textTags.sup
	};
	// text direction
	options.textDirection = typeof options.textDirection !== 'string' ? 'ltr' : options.textDirection;
	options._rtl = options.textDirection === 'rtl';
	if (options._rtl) options.buttonList = options.buttonList.reverse();
	// icons
	options.icons =
		!options.icons || typeof options.icons !== 'object'
			? _icons
			: [_icons, options.icons].reduce(function (_default, _new) {
					for (let key in _new) {
						if (_new.hasOwnProperty(key)) _default[key] = _new[key];
					}
					return _default;
			  }, {});
	// rtl
	options.icons = !options._rtl
		? options.icons
		: [options.icons, options.icons._rtl].reduce(function (_default, _new) {
				for (let key in _new) {
					if (_new.hasOwnProperty(key)) _default[key] = _new[key];
				}
				return _default;
		  }, {});
	// etc
	options.callBackSave = !options.callBackSave ? null : options.callBackSave;
	options.lineAttrReset = typeof options.lineAttrReset === 'string' && options.lineAttrReset ? (options.lineAttrReset === '*' ? '*' : new _w.RegExp('^(' + options.lineAttrReset + ')$', 'i')) : null;
	options.historyStackDelayTime = typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400;
	options.frameAttrbutes = options.frameAttrbutes || {};
	options._editableClass = 'sun-editor-editable' + (options._rtl ? ' se-rtl' : '');
	options._printClass = typeof options._printClass === 'string' ? options._printClass : null;

	/** whitelist, blacklist */
	// default line
	options.defaultLineTag = typeof options.defaultLineTag === 'string' && options.defaultLineTag.length > 0 ? options.defaultLineTag : 'p';
	// __defaults
	options.__defaultElementWhitelist = (typeof options.__defaultElementWhitelist === 'string' ? options.__defaultElementWhitelist : DEFAULT_ELEMENT_WHITELIST).toLowerCase();
	options.__defaultAttributeWhitelist = (typeof options.__defaultAttributeWhitelist === 'string' ? options.__defaultAttributeWhitelist : DEFAULT_ATTRIBUTE_WHITELIST).toLowerCase();
	// element
	options.elementWhitelist = (typeof options.elementWhitelist === 'string' ? options.elementWhitelist : '').toLowerCase();
	options.elementBlacklist = _createBlacklist((typeof options.elementBlacklist === 'string' ? options.elementBlacklist : '').toLowerCase(), options.defaultLineTag);
	// attribute
	options.attributeWhitelist = !options.attributeWhitelist || typeof options.attributeWhitelist !== 'object' ? null : options.attributeWhitelist;
	options.attributeBlacklist = !options.attributeBlacklist || typeof options.attributeBlacklist !== 'object' ? null : options.attributeBlacklist;
	// format tag
	options.formatClosureBrLine = _createFormatInfo(options.formatClosureBrLine, (options.__defaultFormatClosureBrLine = typeof options.__defaultFormatClosureBrLine === 'string' ? options.__defaultFormatClosureBrLine : DEFAULT_FORMAT_CLOSURE_BR_LINE).toLowerCase(), options.elementBlacklist);
	options.formatBrLine = _createFormatInfo((options.formatBrLine || '') + '|' + options.formatClosureBrLine.str, (options.__defaultFormatBrLine = typeof options.__defaultFormatBrLine === 'string' ? options.__defaultFormatBrLine : DEFAULT_FORMAT_BR_LINE).toLowerCase(), options.elementBlacklist);
	options.formatLine = _createFormatInfo((options.formatLine || '') + '|' + options.formatBrLine.str, (options.__defaultFormatLine = typeof options.__defaultFormatLine === 'string' ? options.__defaultFormatLine : DEFAULT_FORMAT_LINE).toLowerCase(), options.elementBlacklist);
	options.formatClosureBlock = _createFormatInfo(options.formatClosureBlock, (options.__defaultFormatClosureBlock = typeof options.__defaultFormatClosureBlock === 'string' ? options.__defaultFormatClosureBlock : DEFAULT_FORMAT_CLOSURE_BLOCK).toLowerCase(), options.elementBlacklist);
	options.formatBlock = _createFormatInfo((options.formatBlock || '') + '|' + options.formatClosureBlock.str, (options.__defaultFormatBlock = typeof options.__defaultFormatBlock === 'string' ? options.__defaultFormatBlock : DEFAULT_FORMAT_BLOCK).toLowerCase(), options.elementBlacklist);
	// --- create element whitelist (__defaultElementWhiteList + elementWhitelist + format[line, BrLine, Block, Closureblock, ClosureBrLine] - elementBlacklist)
	options._editorElementWhitelist = options.elementWhitelist === '*' ? '*' : _createWhitelist(options);

	/** Toolbar */
	options.buttonList = !!options.buttonList ? options.buttonList : DEFAULT_BUTTON_LIST;
	options.toolbar_width = options.toolbar_width ? (numbers.is(options.toolbar_width) ? options.toolbar_width + 'px' : options.toolbar_width) : 'auto';
	options.toolbar_container = /inline/i.test(options.mode) ? null : typeof options.toolbar_container === 'string' ? _d.querySelector(options.toolbar_container) : options.toolbar_container;
	options.toolbar_sticky = /balloon/i.test(options.mode) ? -1 : options.toolbar_sticky === undefined ? 0 : /^\d+/.test(options.toolbar_sticky) ? numbers.get(options.toolbar_sticky, 0) : -1;
	options.toolbar_hide = !!options.toolbar_hide;

	// value
	options.value = typeof options.value === 'string' ? options.value : null;
	options.placeholder = typeof options.placeholder === 'string' ? options.placeholder : null;
	// styles
	options.editorCSSText = typeof options.editorCSSText === 'string' ? options.editorCSSText : '';
	options.width = options.width ? (numbers.is(options.width) ? options.width + 'px' : options.width) : '100%';
	options.minWidth = (numbers.is(options.minWidth) ? options.minWidth + 'px' : options.minWidth) || '';
	options.maxWidth = (numbers.is(options.maxWidth) ? options.maxWidth + 'px' : options.maxWidth) || '';
	options.height = options.height ? (numbers.is(options.height) ? options.height + 'px' : options.height) : 'auto';
	options.minHeight = (numbers.is(options.minHeight) ? options.minHeight + 'px' : options.minHeight) || '';
	options.maxHeight = (numbers.is(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
	options._editorStyles = converter._setDefaultOptionStyle(options, options.editorCSSText);

	/** Status bar */
	/** Multi root */
	if (options.multiRoot) InitMultiRootOptions(editorTargets);

	options.statusbar = options.statusbar === undefined ? true : options.statusbar;
	options.statusbar_showPathLabel = !options.statusbar ? false : typeof options.statusbar_showPathLabel === 'boolean' ? options.statusbar_showPathLabel : true;
	options.statusbar_resizeEnable = options.statusbar_resizeEnable === undefined ? true : !!options.statusbar_resizeEnable;
	options.statusbar_container = typeof options.statusbar_container === 'string' ? _d.querySelector(options.statusbar_container) : options.statusbar_container;
	// status bar - character count
	options.charCounter = options.charCounter_max > 0 ? true : typeof options.charCounter === 'boolean' ? options.charCounter : false;
	options.charCounter_max = numbers.is(options.charCounter_max) && options.charCounter_max > -1 ? options.charCounter_max * 1 : null;
	options.charCounter_label = typeof options.charCounter_label === 'string' ? options.charCounter_label.trim() : null;
	options.charCounter_type = typeof options.charCounter_type === 'string' ? options.charCounter_type : 'char';

	/** IFrame */
	options.iframe = !!options.iframe_fullPage || !!options.iframe;
	options.iframe_fullPage = !!options.iframe_fullPage;
	options.iframe_attributes = options.iframe_attributes || {};
	options.iframe_cssFileName = options.iframe ? (typeof options.iframe_cssFileName === 'string' ? [options.iframe_cssFileName] : options.iframe_cssFileName || ['suneditor']) : null;

	/** Key actions */
	options.tabDisable = !!options.tabDisable;
	options.shortcutsDisable = _w.Array.isArray(options.shortcutsDisable) ? options.shortcutsDisable : [];
	options.shortcutsHint = options.shortcutsHint === undefined ? true : !!options.shortcutsHint;

	/** View */
	options.fullScreenOffset = options.fullScreenOffset === undefined ? 0 : /^\d+/.test(options.fullScreenOffset) ? numbers.get(options.fullScreenOffset, 0) : 0;
	options.previewTemplate = typeof options.previewTemplate === 'string' ? options.previewTemplate : null;
	options.printTemplate = typeof options.printTemplate === 'string' ? options.printTemplate : null;

	/** Defining menu items */
	options.hrItems = !options.hrItems ? null : options.hrItems;
	options.font = !options.font ? ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'] : options.font;
	options.fontSize = !options.fontSize ? null : options.fontSize;
	options.formats = !options.formats ? null : options.formats;
	options.colorList_font = !options.colorList_font ? null : options.colorList_font;
	options.colorList_background = !options.colorList_background ? null : options.colorList_background;
	options.lineHeights = !options.lineHeights ? null : options.lineHeights;
	options.paragraphStyles = !options.paragraphStyles ? null : options.paragraphStyles;
	options.textStyles = !options.textStyles ? null : options.textStyles;
	options.fontSizeUnit = typeof options.fontSizeUnit === 'string' ? options.fontSizeUnit.trim().toLowerCase() || 'px' : 'px';
	options.alignItems = typeof options.alignItems === 'object' ? options.alignItems : options._rtl ? ['right', 'center', 'left', 'justify'] : ['left', 'center', 'right', 'justify'];
	options.templates = !options.templates ? null : options.templates;
	options.mathFontSize = !!options.mathFontSize
		? options.mathFontSize
		: [
				{
					text: '1',
					value: '1em'
				},
				{
					text: '1.5',
					value: '1.5em'
				},
				{
					text: '2',
					value: '2em'
				},
				{
					text: '2.5',
					value: '2.5em'
				}
		  ];

	/** --- Media */
	options.mediaAutoSelect = options.mediaAutoSelect === undefined ? true : !!options.mediaAutoSelect;

	/** Image */
	options.imageResizing = options.imageResizing === undefined ? true : options.imageResizing;
	options.imageWidth = !options.imageWidth ? 'auto' : numbers.is(options.imageWidth) ? options.imageWidth + 'px' : options.imageWidth;
	options.imageHeight = !options.imageHeight ? 'auto' : numbers.is(options.imageHeight) ? options.imageHeight + 'px' : options.imageHeight;
	options.imageControls =
		options.imageControls || !options.imageResizing
			? [['mirror_h', 'mirror_v', 'align', 'caption', 'revert', 'edit', 'remove']]
			: [
					['percent_100', 'percent_75', 'percent_50', 'auto', 'rotate_l', 'rotate_r'],
					['mirror_h', 'mirror_v', 'align', 'caption', 'revert', 'edit', 'remove']
			  ];

	// @todo
	options.imageHeightShow = options.imageHeightShow === undefined ? true : !!options.imageHeightShow;
	options.imageAlignShow = options.imageAlignShow === undefined ? true : !!options.imageAlignShow;
	options.imageSizeOnlyPercentage = !!options.imageSizeOnlyPercentage;
	options._imageSizeUnit = options.imageSizeOnlyPercentage ? '%' : 'px';
	options.imageRotation = options.imageRotation !== undefined ? options.imageRotation : !(options.imageSizeOnlyPercentage || !options.imageHeightShow);
	options.imageFileInput = options.imageFileInput === undefined ? true : options.imageFileInput;
	options.imageUrlInput = options.imageUrlInput === undefined || !options.imageFileInput ? true : options.imageUrlInput;
	options.imageUploadHeader = options.imageUploadHeader || null;
	options.imageUploadUrl = typeof options.imageUploadUrl === 'string' ? options.imageUploadUrl : null;
	options.imageUploadSizeLimit = /\d+/.test(options.imageUploadSizeLimit) ? numbers.get(options.imageUploadSizeLimit, 0) : null;
	options.imageMultipleFile = !!options.imageMultipleFile;
	options.imageAccept = typeof options.imageAccept !== 'string' || options.imageAccept.trim() === '*' ? 'image/*' : options.imageAccept.trim() || 'image/*';

	/** Image - image gallery */
	options.imageGalleryUrl = typeof options.imageGalleryUrl === 'string' ? options.imageGalleryUrl : null;
	options.imageGalleryHeader = options.imageGalleryHeader || null;

	/** Video */
	options.videoResizing = options.videoResizing === undefined ? true : options.videoResizing;
	options.videoWidth = !options.videoWidth || !numbers.get(options.videoWidth, 0) ? '' : numbers.is(options.videoWidth) ? options.videoWidth + 'px' : options.videoWidth;
	options.videoHeight = !options.videoHeight || !numbers.get(options.videoHeight, 0) ? '' : numbers.is(options.videoHeight) ? options.videoHeight + 'px' : options.videoHeight;
	options.videoControls =
		options.videoControls || !options.videoResizing
			? [['mirror_h', 'mirror_v', 'align', 'revert', 'edit', 'remove']]
			: [
					['percent_100', 'percent_75', 'percent_50', 'auto', 'rotate_l', 'rotate_r'],
					['mirror_h', 'mirror_v', 'align', 'revert', 'edit', 'remove']
			  ];

	// @todo
	options.videoRatioShow = options.videoRatioShow === undefined ? true : !!options.videoRatioShow;
	options.videoRatio = numbers.get(options.videoRatio, 4) || 0.5625;
	options.videoRatioList = !options.videoRatioList ? null : options.videoRatioList;
	// @todo
	options.videoHeightShow = options.videoHeightShow === undefined ? true : !!options.videoHeightShow;
	options.videoAlignShow = options.videoAlignShow === undefined ? true : !!options.videoAlignShow;
	options.videoSizeOnlyPercentage = !!options.videoSizeOnlyPercentage;
	options._videoSizeUnit = options.videoSizeOnlyPercentage ? '%' : 'px';
	options.videoRotation = options.videoRotation !== undefined ? options.videoRotation : !(options.videoSizeOnlyPercentage || !options.videoHeightShow);
	options.youtubeQuery = (options.youtubeQuery || '').replace('?', '');
	options.videoFileInput = !!options.videoFileInput;
	options.videoUrlInput = options.videoUrlInput === undefined || !options.videoFileInput ? true : options.videoUrlInput;
	options.videoUploadHeader = options.videoUploadHeader || null;
	options.videoUploadUrl = typeof options.videoUploadUrl === 'string' ? options.videoUploadUrl : null;
	options.videoUploadSizeLimit = /\d+/.test(options.videoUploadSizeLimit) ? numbers.get(options.videoUploadSizeLimit, 0) : null;
	options.videoMultipleFile = !!options.videoMultipleFile;
	options.videoTagAttrs = options.videoTagAttrs || null;
	options.videoIframeAttrs = options.videoIframeAttrs || null;
	options.videoAccept = typeof options.videoAccept !== 'string' || options.videoAccept.trim() === '*' ? 'video/*' : options.videoAccept.trim() || 'video/*';

	/** Audio */
	options.audioWidth = !options.audioWidth ? '' : numbers.is(options.audioWidth) ? options.audioWidth + 'px' : options.audioWidth;
	options.audioHeight = !options.audioHeight ? '' : numbers.is(options.audioHeight) ? options.audioHeight + 'px' : options.audioHeight;
	options.audioFileInput = !!options.audioFileInput;
	options.audioUrlInput = options.audioUrlInput === undefined || !options.audioFileInput ? true : options.audioUrlInput;
	options.audioUploadHeader = options.audioUploadHeader || null;
	options.audioUploadUrl = typeof options.audioUploadUrl === 'string' ? options.audioUploadUrl : null;
	options.audioUploadSizeLimit = /\d+/.test(options.audioUploadSizeLimit) ? numbers.get(options.audioUploadSizeLimit, 0) : null;
	options.audioMultipleFile = !!options.audioMultipleFile;
	options.audioTagAttrs = options.audioTagAttrs || null;
	options.audioAccept = typeof options.audioAccept !== 'string' || options.audioAccept.trim() === '*' ? 'audio/*' : options.audioAccept.trim() || 'audio/*';

	/** Table */
	options.tableCellControllerPosition = typeof options.tableCellControllerPosition === 'string' ? options.tableCellControllerPosition.toLowerCase() : 'cell';

	/** Link */
	options.linkTargetNewWindow = !!options.linkTargetNewWindow;
	options.linkProtocol = typeof options.linkProtocol === 'string' ? options.linkProtocol : null;
	options.linkRel = _w.Array.isArray(options.linkRel) ? options.linkRel : [];
	options.linkRelDefault = options.linkRelDefault || {};

	/** External library */
	// CodeMirror
	if (options.codeMirror) {
		if (options.codeMirror.EditorView) {
			options.codeMirror6Editor = true;
		} else if (options.codeMirror.src) {
			options.codeMirror5Editor = true;
		} else {
			console.warn('[SUNEDITOR.options.codeMirror.fail] The codeMirror option is set incorrectly.');
			options.codeMirror = null;
		}
	}

	// katex (Math plugin)
	if (options.katex && !options.katex.src) {
		console.warn('[SUNEDITOR.options.katex.fail] The katex option is set incorrectly.');
		options.katex = null;
	}

	/** Private options */
	options.__listCommonStyle = options.__listCommonStyle || ['fontSize', 'color', 'fontFamily', 'fontWeight', 'fontStyle'];
	// options.__defaultFontSize;
}

function InitMultiRootOptions(editorTargets) {
	for (let i = 0, len = editorTargets.length, options; i < len; i++) {
		options = editorTargets.options;
		if (!options) continue;

		// value
		options.value = typeof options.value === 'string' ? options.value : null;
		options.placeholder = typeof options.placeholder === 'string' ? options.placeholder : null;
		// styles
		options.editorCSSText = typeof options.editorCSSText === 'string' ? options.editorCSSText : '';
		options.width = options.width ? (numbers.is(options.width) ? options.width + 'px' : options.width) : '100%';
		options.minWidth = (numbers.is(options.minWidth) ? options.minWidth + 'px' : options.minWidth) || '';
		options.maxWidth = (numbers.is(options.maxWidth) ? options.maxWidth + 'px' : options.maxWidth) || '';
		options.height = options.height ? (numbers.is(options.height) ? options.height + 'px' : options.height) : 'auto';
		options.minHeight = (numbers.is(options.minHeight) ? options.minHeight + 'px' : options.minHeight) || '';
		options.maxHeight = (numbers.is(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
		options._editorStyles = converter._setDefaultOptionStyle(options, options.editorCSSText);
		// status bar
		options.statusbar = options.statusbar === undefined ? true : options.statusbar;
		options.statusbar_showPathLabel = !options.statusbar ? false : typeof options.statusbar_showPathLabel === 'boolean' ? options.statusbar_showPathLabel : true;
		options.statusbar_resizeEnable = options.statusbar_resizeEnable === undefined ? true : !!options.statusbar_resizeEnable;
		options.statusbar_container = typeof options.statusbar_container === 'string' ? _d.querySelector(options.statusbar_container) : options.statusbar_container;
		// status bar - character count
		options.charCounter = options.charCounter_max > 0 ? true : typeof options.charCounter === 'boolean' ? options.charCounter : false;
		options.charCounter_max = numbers.is(options.charCounter_max) && options.charCounter_max > -1 ? options.charCounter_max * 1 : null;
		options.charCounter_label = typeof options.charCounter_label === 'string' ? options.charCounter_label.trim() : null;
		options.charCounter_type = typeof options.charCounter_type === 'string' ? options.charCounter_type : 'char';
	}
}

/**
 * @description Initialize property of suneditor elements
 * @param {Object} options Options
 * @param {Element} topDiv Suneditor top div
 * @returns {Object} Bottom bar elements (statusbar, navigation, charWrapper, charCounter)
 */
function _initElements(options, topDiv, targetOptions) {
	/** top div */
	topDiv.style.cssText = options._editorStyles.top;

	/** editor */
	// wysiwyg div or iframe
	const wysiwygDiv = domUtils.createElement(!options.iframe ? 'DIV' : 'IFRAME', { class: 'se-wrapper-inner se-wrapper-wysiwyg' });

	if (!options.iframe) {
		wysiwygDiv.setAttribute('contenteditable', true);
		wysiwygDiv.setAttribute('scrolling', 'auto');
		for (let key in options.iframe_attributes) {
			wysiwygDiv.setAttribute(key, options.iframe_attributes[key]);
		}
		wysiwygDiv.className += ' ' + options._editableClass;
		wysiwygDiv.style.cssText = options._editorStyles.frame + options._editorStyles.editor;
	} else {
		wysiwygDiv.allowFullscreen = true;
		wysiwygDiv.frameBorder = 0;
		wysiwygDiv.style.cssText = options._editorStyles.frame;
	}

	// textarea for code view
	const textarea = domUtils.createElement('TEXTAREA', {
		class: 'se-wrapper-inner se-wrapper-code se-display-none',
		style: options._editorStyles.frame
	});
	if (options.height === 'auto') textarea.style.overflow = 'hidden';

	/** status bar */
	let statusbar = null;
	let navigation = null;
	let charWrapper = null;
	let charCounter = null;
	if (targetOptions.statusbar) {
		statusbar = domUtils.createElement('DIV', { class: 'se-status-bar sun-editor-common' });

		/** navigation */
		navigation = domUtils.createElement('DIV', { class: 'se-navigation sun-editor-common' });
		statusbar.appendChild(navigation);

		/** char counter */
		if (targetOptions.charCounter) {
			charWrapper = domUtils.createElement('DIV', { class: 'se-char-counter-wrapper' });

			if (targetOptions.charCounter_label) {
				const charLabel = domUtils.createElement('SPAN', { class: 'se-char-label' });
				charLabel.textContent = targetOptions.charCounter_label;
				charWrapper.appendChild(charLabel);
			}

			charCounter = domUtils.createElement('SPAN', { class: 'se-char-counter' });
			charCounter.textContent = '0';
			charWrapper.appendChild(charCounter);

			if (targetOptions.charCounter_max > 0) {
				const char_max = domUtils.createElement('SPAN');
				char_max.textContent = ' / ' + targetOptions.charCounter_max;
				charWrapper.appendChild(char_max);
			}

			statusbar.appendChild(charWrapper);
		}
	}

	let placeholder = null;
	if (targetOptions.placeholder) {
		placeholder = domUtils.createElement('SPAN', { class: 'se-placeholder' });
		placeholder.innerText = options.placeholder;
	}

	return {
		bottomBar: {
			statusbar: statusbar,
			navigation: navigation,
			charWrapper: charWrapper,
			charCounter: charCounter
		},
		wysiwygFrame: wysiwygDiv,
		codeView: textarea,
		placeholder: placeholder
	};
}

/**
 * @description Check the CodeMirror option to apply the CodeMirror and return the CodeMirror element.
 * @param {Object} options options
 * @param {Element} textarea textarea element
 */
function _checkCodeMirror(options, textarea) {
	let cmeditor = null;
	options.hasCodeMirror = false;

	if (options.codeMirror6Editor) {
		const codeStyles = textarea.style.cssText;
		const cm = new options.codeMirror.EditorView({
			parent: textarea.parentElement,
			extensions: options.codeMirror.extensions,
			state: options.codeMirror.state
		});

		options.codeMirror6Editor = cm;
		cmeditor = cm.dom;
		cmeditor.style.cssText = codeStyles;
		options.hasCodeMirror = true;
	} else if (options.codeMirror5Editor) {
		const cmOptions = [
			{
				mode: 'htmlmixed',
				htmlMode: true,
				lineNumbers: true,
				lineWrapping: true
			},
			options.codeMirror.options || {}
		].reduce(function (init, option) {
			for (let key in option) {
				if (option.hasOwnProperty(key)) init[key] = option[key];
			}
			return init;
		}, {});

		if (options.height === 'auto') {
			cmOptions.viewportMargin = Infinity;
			cmOptions.height = 'auto';
		}

		const codeStyles = textarea.style.cssText;
		const cm = options.codeMirror.src.fromTextArea(textarea, cmOptions);
		options.codeMirror5Editor = cm;
		cmeditor = cm.display.wrapper;
		cmeditor.style.cssText = codeStyles;
		options.hasCodeMirror = true;
	}

	if (cmeditor) {
		domUtils.removeItem(textarea);
		cmeditor.className += ' se-wrapper-code-mirror se-display-none';
		return cmeditor;
	}

	return textarea;
}

/**
 * @description Check for a katex object.
 * @param {Object} katex katex object
 */
function _checkKatexMath(katex) {
	if (!katex) {
		console.warn('[SUNEDITOR.create.fail] To use the math button you need to add a "katex" object to the options.');
		return;
	}

	const katexOptions = [
		{
			throwOnError: false
		},
		katex.options || {}
	].reduce(function (init, option) {
		for (let key in option) {
			if (option.hasOwnProperty(key)) init[key] = option[key];
		}
		return init;
	}, {});

	katex.options = katexOptions;
}

/**
 * @description create blacklist
 * @param {string} blacklist blacklist
 * @param {string} defaultLineTag options.defaultLineTag
 * @returns {string}
 */
function _createBlacklist(blacklist, defaultLineTag) {
	defaultLineTag = defaultLineTag.toLowerCase();
	return blacklist
		.split('|')
		.filter(function (v) {
			if (v !== defaultLineTag) {
				return true;
			} else {
				console.warn('[SUNEDITOR.constructor.createBlacklist.warn] defaultLineTag("<' + defaultLineTag + '>") cannot be included in the blacklist and will be removed.');
				return false;
			}
		})
		.join('|');
}

/**
 * @description create formats regexp object.
 * @param {string} value value
 * @param {string} defaultValue default value
 * @param {string} blacklist blacklist
 * @returns {{reg: RegExp, str: string}}
 */
function _createFormatInfo(value, defaultValue, blacklist) {
	const str = (defaultValue + '|' + (typeof value === 'string' ? value.toLowerCase() : ''))
		.replace(/^\||\|$/g, '')
		.split('|')
		.filter(function (v) {
			return v && blacklist.indexOf(v) < 0;
		})
		.join('|');
	return {
		reg: new _w.RegExp('^(' + str + ')$', 'i'),
		str: str
	};
}

/**
 * @description create whitelist or blacklist.
 * @param {Object} options options
 * @returns {string} whitelist
 */
function _createWhitelist(options) {
	const blacklist = options.elementBlacklist.split('|');
	const whitelist = (options.__defaultElementWhitelist + '|' + options.elementWhitelist + '|' + options.formatLine.str + '|' + options.formatBrLine.str + '|' + options.formatClosureBlock.str + '|' + options.formatClosureBrLine.str)
		.replace(/(^\||\|$)/g, '')
		.split('|')
		.filter(function (v, i, a) {
			return v && a.indexOf(v) === i && blacklist.indexOf(v) < 0;
		});

	return whitelist.join('|');
}

/**
 * @description Suneditor's Default button list
 * @param {Object} options options
 */
function _defaultButtons(options) {
	const icons = options.icons;
	const lang = options.lang;
	const cmdIcon = env.cmdIcon;
	const shiftIcon = env.shiftIcon;
	const shortcutsDisable = !options.shortcutsHint ? ['bold', 'strike', 'underline', 'italic', 'undo', 'indent', 'save'] : options.shortcutsDisable;
	const indentKey = options._rtl ? ['[', ']'] : [']', '['];
	const indentIcon = options._rtl ? [icons.outdent, icons.indent] : [icons.indent, icons.outdent];

	return {
		bold: ['', lang.toolbar.bold + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('bold') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">B</span>') + '</span>', 'bold', '', icons.bold],
		underline: ['', lang.toolbar.underline + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('underline') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">U</span>') + '</span>', 'underline', '', icons.underline],
		italic: ['', lang.toolbar.italic + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('italic') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">I</span>') + '</span>', 'italic', '', icons.italic],
		strike: ['', lang.toolbar.strike + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('strike') > -1 ? '' : cmdIcon + shiftIcon + '+<span class="se-shortcut-key">S</span>') + '</span>', 'strike', '', icons.strike],
		subscript: ['', lang.toolbar.subscript, 'SUB', '', icons.subscript],
		superscript: ['', lang.toolbar.superscript, 'SUP', '', icons.superscript],
		removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '', icons.erase],
		indent: ['', lang.toolbar.indent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">' + indentKey[0] + '</span>') + '</span>', 'indent', '', indentIcon[0]],
		outdent: ['', lang.toolbar.outdent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">' + indentKey[1] + '</span>') + '</span>', 'outdent', '', indentIcon[1]],
		fullScreen: ['se-code-view-enabled se-resizing-enabled', lang.toolbar.fullScreen, 'fullScreen', '', icons.expansion],
		showBlocks: ['', lang.toolbar.showBlocks, 'showBlocks', '', icons.show_blocks],
		codeView: ['se-code-view-enabled se-resizing-enabled', lang.toolbar.codeView, 'codeView', '', icons.code_view],
		undo: ['', lang.toolbar.undo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'undo', '', icons.undo],
		redo: ['', lang.toolbar.redo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">Y</span> / ' + cmdIcon + shiftIcon + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'redo', '', icons.redo],
		preview: ['se-resizing-enabled', lang.toolbar.preview, 'preview', '', icons.preview],
		print: ['se-resizing-enabled', lang.toolbar.print, 'print', '', icons.print],
		dir: ['', lang.toolbar[options._rtl ? 'dir_ltr' : 'dir_rtl'], 'dir', '', icons[options._rtl ? 'dir_ltr' : 'dir_rtl']],
		dir_ltr: ['', lang.toolbar.dir_ltr, 'dir_ltr', '', icons.dir_ltr],
		dir_rtl: ['', lang.toolbar.dir_rtl, 'dir_rtl', '', icons.dir_rtl],
		save: ['se-resizing-enabled', lang.toolbar.save + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('save') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">S</span>') + '</span>', 'save', '', icons.save]
	};
}

/**
 * @description Create a group div containing each module
 * @returns {Object}
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
 * @description Create a button element
 * @param {string} className className in button
 * @param {string} title Title in button
 * @param {string} dataCommand The data-command property of the button
 * @param {string} dataType The data-type property of the button ('modal', 'dropdown', 'command',  'container')
 * @param {string} innerHTML Html in button
 * @param {string} _disabled Button disabled
 * @param {Object} _icons Icons
 * @returns {Object}
 */
function _createButton(className, title, dataCommand, dataType, innerHTML, _disabled, _icons) {
	const oLi = domUtils.createElement('LI');
	const label = title || '';
	const oButton = domUtils.createElement('BUTTON', {
		type: 'button',
		class: 'se-btn' + (className ? ' ' + className : '') + ' se-tooltip',
		'data-command': dataCommand,
		'data-type': dataType,
		'aria-label': label.replace(/<span .+<\/span>/, ''),
		tabindex: '-1'
	});

	if (/^default\./i.test(innerHTML)) {
		innerHTML = _icons[innerHTML.replace(/^default\./i, '')];
	}
	if (/^text\./i.test(innerHTML)) {
		innerHTML = innerHTML.replace(/^text\./i, '');
		oButton.className += ' se-btn-more-text';
	}

	if (label) innerHTML += '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + label + '</span></span>';

	if (_disabled) oButton.setAttribute('disabled', true);

	oButton.innerHTML = innerHTML;
	oLi.appendChild(oButton);

	return {
		li: oLi,
		button: oButton
	};
}

export function UpdateButton(element, plugin) {
	if (!element) return;
	element.innerHTML = (plugin.icon || '<span class="se-icon-text">!</span>') + '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + plugin.title + '</span></span>';
	element.setAttribute('aria-label', plugin.title);
	if (plugin.type) element.setAttribute('data-type', plugin.type);
	if (plugin.className) element.className += ' ' + plugin.className;
}

/**
 * @description Create editor HTML
 * @param {Array} buttonList option.buttonList
 * @param {Object|null} plugins Plugins
 * @param {Array} options options
 * @returns {Object} { element: (Element) Toolbar element, plugins: (Array|null) Plugins Array, pluginCallButtons: (Object), responsiveButtons: (Array) }
 */
export function CreateToolBar(buttonList, plugins, options) {
	const _buttonTray = domUtils.createElement('DIV', { class: 'se-btn-tray' });
	const separator_vertical = domUtils.createElement('DIV', { class: 'se-toolbar-separator-vertical' });
	const tool_bar = domUtils.createElement('DIV', { class: 'se-toolbar sun-editor-common' }, _buttonTray);

	/** create button list */
	buttonList = _w.JSON.parse(_w.JSON.stringify(buttonList));
	const icons = options.icons;
	const defaultButtonList = _defaultButtons(options);
	const pluginCallButtons = {};
	const responsiveButtons = [];

	let module = null;
	let button = null;
	let moduleElement = null;
	let buttonElement = null;
	let pluginName = '';
	let vertical = false;
	const moreLayer = domUtils.createElement('DIV', {
		class: 'se-toolbar-more-layer'
	});

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

				if (/^\%\d+/.test(button) && j === 0) {
					buttonGroup[0] = button.replace(/[^\d]/g, '');
					responsiveButtons.push(buttonGroup);
					buttonList.splice(i--, 1);
					continue buttonGroupLoop;
				}

				if (/object|function/.test(typeof plugins[button])) {
					const plugin = plugins[button];
					pluginName = button;
					module = [plugin.className, plugin.title, pluginName, plugin.type, plugin.innerHTML, plugin._disabled];
				} else {
					// align
					if (/^\-/.test(button)) {
						align = button.substr(1);
						moduleElement.div.className += ' module-float-' + align;
						continue;
					}

					// rtl fix
					if (/^\#/.test(button)) {
						const option = button.substr(1);
						if (option === 'fix') moduleElement.ul.className += ' se-menu-dir-fix';
						continue;
					}

					// more button
					if (/^\:/.test(button)) {
						moreButton = true;
						const matched = button.match(/^\:([^\-]+)\-([^\-]+)/);
						moreCommand = '__se__more_' + i;
						const title = matched[1].trim();
						const innerHTML = matched[2].trim();
						module = ['se-btn-more', /^lang\./i.test(title) ? options.lang[title.replace(/^lang\./i, '')] : title, moreCommand, 'MORE', innerHTML];
					} else {
						// buttons
						module = defaultButtonList[button];
					}

					pluginName = button;
					if (!module) {
						const custom = plugins[pluginName];
						if (!custom) throw Error('[SUNEDITOR.create.toolbar.fail] The button name of a plugin that does not exist. [' + pluginName + ']');
						module = [custom.className, custom.title, custom.key, custom.type, custom.innerHTML, custom._disabled];
					}
				}

				buttonElement = _createButton(module[0], module[1], module[2], module[3], module[4], module[5], icons);
				(more ? moreContainer : moduleElement.ul).appendChild(buttonElement.li);

				if (plugins[pluginName]) {
					pluginCallButtons[pluginName] = buttonElement.button;
				}

				// more button
				if (moreButton) {
					more = true;
					moreContainer = domUtils.createElement('DIV');
					moreContainer.className = 'se-more-layer ' + moreCommand;
					moreContainer.innerHTML = '<div class="se-more-form"><ul class="se-menu-list"' + (align ? ' style="float: ' + align + ';"' : '') + '></ul></div>';
					moreLayer.appendChild(moreContainer);
					moreContainer = moreContainer.firstElementChild.firstElementChild;
				}
			}

			if (vertical) {
				const sv = separator_vertical.cloneNode(false);
				_buttonTray.appendChild(sv);
			}

			_buttonTray.appendChild(moduleElement.div);
			vertical = true;
		} else if (/^\/$/.test(buttonGroup)) {
			/** line break  */
			const enterDiv = domUtils.createElement('DIV', { class: 'se-btn-module-enter' });
			_buttonTray.appendChild(enterDiv);
			vertical = false;
		}
	}

	switch (_buttonTray.children.length) {
		case 0:
			_buttonTray.style.display = 'none';
			break;
		case 1:
			domUtils.removeClass(_buttonTray.firstElementChild, 'se-btn-module-border');
			break;
		default:
			if (options._rtl) {
				const sv = separator_vertical.cloneNode(false);
				sv.style.float = _buttonTray.lastElementChild.style.float;
				_buttonTray.appendChild(sv);
			}
	}

	if (moreLayer.children.length > 0) _buttonTray.appendChild(moreLayer);
	if (responsiveButtons.length > 0) responsiveButtons.unshift(buttonList);

	// menu tray
	const _menuTray = domUtils.createElement('DIV', { class: 'se-menu-tray' });
	tool_bar.appendChild(_menuTray);

	if (options.toolbar_hide) tool_bar.style.display = 'none';

	return {
		element: tool_bar,
		pluginCallButtons: pluginCallButtons,
		responsiveButtons: responsiveButtons,
		_menuTray: _menuTray,
		_buttonTray: _buttonTray
	};
}

export default Constructor;
