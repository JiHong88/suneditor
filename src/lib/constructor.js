import _icons from '../assets/defaultIcons';
import _defaultLang from '../langs/en';
import { domUtils, numbers, converter, env } from '../helper';
import { _d, _w } from '../helper/global';

const DEFAULT_ELEMENT_WHITELIST = 'br|p|div|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
const DEFAULT_ATTRIBUTE_WHITELIST = 'br|p|div|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
const DEFAULT_BUTTON_LIST = [['undo', 'redo'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'], ['outdent', 'indent'], ['fullScreen', 'showBlocks', 'codeView'], ['preview', 'print']];

/**
 * @description document create
 * @param {Element} element Textarea
 * @param {Object} options Options
 * @returns {Object}
 */
const Constructor = function (element, options) {
	if (typeof options !== 'object') options = {};

	/** --- init options --- */
	_initOptions(element, options);

	// suneditor div
	const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (options._rtl ? ' se-rtl' : '') });
	if (element.id) top_div.id = 'suneditor_' + element.id;

	// relative div
	const relative = domUtils.createElement('DIV', { class: 'se-container' });

	// toolbar
	const tool_bar = _createToolBar(options.buttonList, options.plugins, options);
	const toolbarShadow = tool_bar.element.cloneNode(false);
	toolbarShadow.className += ' se-toolbar-shadow';
	tool_bar.element.style.visibility = 'hidden';
	if (tool_bar.pluginCallButtons.math) _checkKatexMath(options.katex);
	const arrow = domUtils.createElement('DIV', { class: 'se-arrow' });

	// sticky toolbar dummy
	const sticky_dummy = domUtils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' });

	// inner editor div
	const editor_div = domUtils.createElement('DIV', { class: 'se-wrapper' });

	/** --- init elements and create bottom bar --- */
	const initElements = _initElements(options, top_div, tool_bar.element, arrow);

	const bottomBar = initElements.bottomBar;
	const wysiwyg_div = initElements.wysiwygFrame;
	const placeholder_span = initElements.placeholder;
	let textarea = initElements.codeView;

	// resizing bar
	const status_bar = bottomBar.statusbar;
	const navigation = bottomBar.navigation;
	const char_wrapper = bottomBar.charWrapper;
	const char_counter = bottomBar.charCounter;

	// loading box
	const loading_box = domUtils.createElement('DIV', { class: 'se-loading-box sun-editor-common' }, '<div class="se-loading-effect"></div>');
	// enter line
	const line_breaker = domUtils.createElement('DIV', { class: 'se-line-breaker' }, '<button class="se-btn">' + options.icons.line_break + '</button>');
	const line_breaker_t = domUtils.createElement('DIV', { class: 'se-line-breaker-component' }, '<button class="se-btn">' + options.icons.line_break + '</button>');
	const line_breaker_b = line_breaker_t.cloneNode(true);
	line_breaker_t.innerHTML = line_breaker_b.innerHTML = options.icons.line_break;

	// resize operation background
	const resize_back = domUtils.createElement('DIV', { class: 'se-resizing-back' });

	// toolbar container
	const toolbar_container = options.toolbar_container;
	if (toolbar_container) {
		toolbar_container.appendChild(tool_bar.element);
		toolbar_container.appendChild(toolbarShadow);
	}

	// statusbar
	const statusbar_container = options.statusbar_container;
	if (status_bar && statusbar_container) statusbar_container.appendChild(status_bar);

	/** append html */
	editor_div.appendChild(textarea);
	if (placeholder_span) editor_div.appendChild(placeholder_span);
	if (!toolbar_container) {
		relative.appendChild(tool_bar.element);
		relative.appendChild(toolbarShadow);
	}
	relative.appendChild(sticky_dummy);
	relative.appendChild(editor_div);
	relative.appendChild(resize_back);
	relative.appendChild(loading_box);
	relative.appendChild(line_breaker);
	relative.appendChild(line_breaker_t);
	relative.appendChild(line_breaker_b);
	if (status_bar && !statusbar_container) relative.appendChild(status_bar);
	top_div.appendChild(relative);

	textarea = _checkCodeMirror(options, textarea);

	return {
		constructed: {
			_top: top_div,
			_relative: relative,
			_toolBar: tool_bar.element,
			_toolbarShadow: toolbarShadow,
			_menuTray: tool_bar._menuTray,
			_editorArea: editor_div,
			_wysiwygArea: wysiwyg_div,
			_codeArea: textarea,
			_placeholder: placeholder_span,
			_statusbar: status_bar,
			_navigation: navigation,
			_charWrapper: char_wrapper,
			_charCounter: char_counter,
			_loading: loading_box,
			_lineBreaker: line_breaker,
			_lineBreaker_t: line_breaker_t,
			_lineBreaker_b: line_breaker_b,
			_resizeBack: resize_back,
			_stickyDummy: sticky_dummy,
			_arrow: arrow
		},
		options: options,
		plugins: tool_bar.plugins,
		pluginCallButtons: tool_bar.pluginCallButtons,
		_responsiveButtons: tool_bar.responsiveButtons
	};
};

/**
 * @description Reset the options.
 * @param {Object} mergeOptions The new options
 * @param {Object} context Context object
 * @param {Object} originOptions The origin optins
 * @returns {Object}
 */
export function ResetOptions(mergeOptions, context, originOptions) {
	_initOptions(context.element.originElement, mergeOptions);

	const el = context.element;
	const relative = el.relative;
	const editorArea = el.editorArea;
	const isNewToolbarContainer = mergeOptions.toolbar_container && mergeOptions.toolbar_container !== originOptions.toolbar_container;
	const isNewToolbar = mergeOptions.lang !== originOptions.lang || mergeOptions.buttonList !== originOptions.buttonList || mergeOptions.mode !== originOptions.mode || isNewToolbarContainer;

	const tool_bar = _createToolBar(isNewToolbar ? mergeOptions.buttonList : originOptions.buttonList, mergeOptions.plugins, mergeOptions);
	if (tool_bar.pluginCallButtons.math) _checkKatexMath(mergeOptions.katex);
	const arrow = domUtils.createElement('DIV', { class: 'se-arrow' });

	if (isNewToolbar) {
		tool_bar.element.style.visibility = 'hidden';
		// toolbar container
		if (isNewToolbarContainer) {
			mergeOptions.toolbar_container.appendChild(tool_bar.element);
			el.toolbar.parentElement.removeChild(el.toolbar);
		} else {
			el.toolbar.parentElement.replaceChild(tool_bar.element, el.toolbar);
		}

		el.toolbar = tool_bar.element;
		el._menuTray = tool_bar._menuTray;
		el._arrow = arrow;
	}

	const initElements = _initElements(mergeOptions, el.topArea, isNewToolbar ? tool_bar.element : el.toolbar, arrow);

	const bottomBar = initElements.bottomBar;
	const wysiwygFrame = initElements.wysiwygFrame;
	const placeholder_span = initElements.placeholder;
	let code = initElements.codeView;

	if (el.statusbar) util.removeItem(el.statusbar);
	if (bottomBar.statusbar) {
		if (mergeOptions.statusbar_container && mergeOptions.statusbar_container !== originOptions.statusbar_container) {
			mergeOptions.statusbar_container.appendChild(bottomBar.statusbar);
		} else {
			relative.appendChild(bottomBar.statusbar);
		}
	}

	editorArea.innerHTML = '';
	editorArea.appendChild(code);
	if (placeholder_span) editorArea.appendChild(placeholder_span);

	code = _checkCodeMirror(mergeOptions, code);

	el.statusbar = bottomBar.statusbar;
	el.navigation = bottomBar.navigation;
	el.charWrapper = bottomBar.charWrapper;
	el.charCounter = bottomBar.charCounter;
	el.wysiwygFrame = wysiwygFrame;
	el.code = code;
	el.placeholder = placeholder_span;

	if (mergeOptions._rtl) domUtils.addClass(el.topArea, 'se-rtl');
	else domUtils.removeClass(el.topArea, 'se-rtl');

	return {
		callButtons: tool_bar.pluginCallButtons,
		plugins: tool_bar.plugins,
		toolbar: tool_bar
	};
}

/**
 * @description Initialize options
 * @param {Element} element Options object
 * @param {Object} options Options object
 */
function _initOptions(element, options) {
	/** base */
	options.mode = options.mode || 'classic'; // classic, inline, balloon, balloon-always
	options.lang = options.lang || _defaultLang;
	const textTags = (options.textTags = [{ bold: 'STRONG', underline: 'U', italic: 'EM', strike: 'DEL', sub: 'SUB', sup: 'SUP' }, options.textTags || {}].reduce(function (_default, _new) {
		for (let key in _new) {
			_default[key] = _new[key];
		}
		return _default;
	}, {}));
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
	options.value = typeof options.value === 'string' ? options.value : null;
	options.textDirection = options.textDirection !== 'string' ? 'ltr' : options.textDirection;
	// text direction
	options._rtl = options.textDirection === 'rtl';
	if (options._rtl) options.buttonList = options.buttonList.reverse();
	// icons
	// custom
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
	options.placeholder = typeof options.placeholder === 'string' ? options.placeholder : null;
	options.mediaAutoSelect = options.mediaAutoSelect === undefined ? true : !!options.mediaAutoSelect;
	options.buttonList = !!options.buttonList ? options.buttonList : DEFAULT_BUTTON_LIST;
	options.callBackSave = !options.callBackSave ? null : options.callBackSave;
	options.defaultLineTag = typeof options.defaultLineTag === 'string' && options.defaultLineTag.length > 0 ? options.defaultLineTag : 'p';
	options.lineAttrReset = typeof options.lineAttrReset === 'string' && options.lineAttrReset ? (options.lineAttrReset === '*' ? '*' : new _w.RegExp('^(' + options.lineAttrReset + ')$', 'i')) : null;
	options.historyStackDelayTime = typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400;
	options._editableClass = 'sun-editor-editable' + (options._rtl ? ' se-rtl' : '');
	options._printClass = typeof options._printClass === 'string' ? options._printClass : null;

	/** whitelist, blacklist */
	// element
	options._defaultElementWhitelist = typeof options._defaultElementWhitelist === 'string' ? options._defaultElementWhitelist : DEFAULT_ELEMENT_WHITELIST;
	options._defaultAttributeWhitelist = typeof options._defaultAttributeWhitelist === 'string' ? options._defaultAttributeWhitelist : DEFAULT_ATTRIBUTE_WHITELIST;
	options.elementWhitelist = options.elementWhitelist || '';
	options.elementBlacklist = options.elementBlacklist || '';
	options._editorElementWhitelist = options.elementWhitelist === '*' ? '*' : _setWhitelist(options._defaultElementWhitelist + (typeof options.elementWhitelist === 'string' && options.elementWhitelist.length > 0 ? '|' + options.elementWhitelist : ''), options.elementBlacklist);
	// attribute
	options.attributeWhitelist = !options.attributeWhitelist || typeof options.attributeWhitelist !== 'object' ? null : options.attributeWhitelist;
	options.attributeBlacklist = !options.attributeBlacklist || typeof options.attributeBlacklist !== 'object' ? null : options.attributeBlacklist;

	/** Toolbar */
	options.toolbar_width = options.toolbar_width ? (numbers.is(options.toolbar_width) ? options.toolbar_width + 'px' : options.toolbar_width) : 'auto';
	options.toolbar_container = typeof options.toolbar_container === 'string' ? _d.querySelector(options.toolbar_container) : options.toolbar_container;
	options.toolbar_sticky = /balloon/i.test(options.mode) || !!options.toolbar_container ? -1 : options.toolbar_sticky === undefined ? 0 : /^\d+/.test(options.toolbar_sticky) ? numbers.get(options.toolbar_sticky, 0) : -1;

	/** Status bar */
	options.statusbar = options.statusbar === undefined ? true : options.statusbar;
	options.statusbar_showPathLabel = !options.statusbar ? false : typeof options.statusbar_showPathLabel === 'boolean' ? options.statusbar_showPathLabel : true;
	options.statusbar_resizeEnable = options.statusbar_resizeEnable === undefined ? true : !!options.statusbar_resizeEnable;
	options.statusbar_container = typeof options.statusbar_container === 'string' ? _d.querySelector(options.statusbar_container) : options.statusbar_container;

	/** Character count */
	options.charCounter = options.charCounter_max > 0 ? true : typeof options.charCounter === 'boolean' ? options.charCounter : false;
	options.charCounter_max = numbers.is(options.charCounter_max) && options.charCounter_max > -1 ? options.charCounter_max * 1 : null;
	options.charCounter_label = typeof options.charCounter_label === 'string' ? options.charCounter_label.trim() : null;
	options.charCounter_type = typeof options.charCounter_type === 'string' ? options.charCounter_type : 'char';

	/** IFrame */
	options.iframe = !!options.iframe_fullPage || !!options.iframe;
	options.iframe_fullPage = !!options.iframe_fullPage;
	options.iframe_attributes = options.iframe_attributes || {};
	options.iframe_cssFileName = options.iframe ? (typeof options.iframe_cssFileName === 'string' ? [options.iframe_cssFileName] : options.iframe_cssFileName || ['suneditor']) : null;

	/** Styles */
	options.popupType = options.popupType || 'full';
	options.editorCSSText = typeof options.editorCSSText === 'string' ? options.editorCSSText : '';
	options.width = options.width ? (numbers.is(options.width) ? options.width + 'px' : options.width) : element.clientWidth ? element.clientWidth + 'px' : '100%';
	options.minWidth = (numbers.is(options.minWidth) ? options.minWidth + 'px' : options.minWidth) || '';
	options.maxWidth = (numbers.is(options.maxWidth) ? options.maxWidth + 'px' : options.maxWidth) || '';
	options.height = options.height ? (numbers.is(options.height) ? options.height + 'px' : options.height) : element.clientHeight ? element.clientHeight + 'px' : 'auto';
	options.minHeight = (numbers.is(options.minHeight) ? options.minHeight + 'px' : options.minHeight) || '';
	options.maxHeight = (numbers.is(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
	options._editorStyles = converter._setDefaultOptionStyle(options, options.editorCSSText);

	/** Key actions */
	options.tabDisable = !!options.tabDisable;
	options.shortcutsDisable = Array.isArray(options.shortcutsDisable) ? options.shortcutsDisable : [];
	options.shortcutsHint = options.shortcutsHint === undefined ? true : !!options.shortcutsHint;

	/** View */
	options.fullScreenOffset = options.fullScreenOffset === undefined ? 0 : /^\d+/.test(options.fullScreenOffset) ? numbers.get(options.fullScreenOffset, 0) : 0;
	options.previewTemplate = typeof options.previewTemplate === 'string' ? options.previewTemplate : null;
	options.printTemplate = typeof options.printTemplate === 'string' ? options.printTemplate : null;

	/** Defining menu items */
	options.hrItems = !options.hrItems ? null : options.hrItems;
	options.font = !options.font ? null : options.font;
	options.fontSize = !options.fontSize ? null : options.fontSize;
	options.formats = !options.formats ? null : options.formats;
	options.colorList = !options.colorList ? null : options.colorList;
	options.lineHeights = !options.lineHeights ? null : options.lineHeights;
	options.paragraphStyles = !options.paragraphStyles ? null : options.paragraphStyles;
	options.textStyles = !options.textStyles ? null : options.textStyles;
	options.fontSizeUnit = typeof options.fontSizeUnit === 'string' ? options.fontSizeUnit.trim() || 'px' : 'px';
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

	/** Image */
	options.imageResizing = options.imageResizing === undefined ? true : options.imageResizing;
	options.imageHeightShow = options.imageHeightShow === undefined ? true : !!options.imageHeightShow;
	options.imageAlignShow = options.imageAlignShow === undefined ? true : !!options.imageAlignShow;
	options.imageWidth = !options.imageWidth ? 'auto' : numbers.is(options.imageWidth) ? options.imageWidth + 'px' : options.imageWidth;
	options.imageHeight = !options.imageHeight ? 'auto' : numbers.is(options.imageHeight) ? options.imageHeight + 'px' : options.imageHeight;
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
	options.videoHeightShow = options.videoHeightShow === undefined ? true : !!options.videoHeightShow;
	options.videoAlignShow = options.videoAlignShow === undefined ? true : !!options.videoAlignShow;
	options.videoRatioShow = options.videoRatioShow === undefined ? true : !!options.videoRatioShow;
	options.videoWidth = !options.videoWidth || !numbers.get(options.videoWidth, 0) ? '' : numbers.is(options.videoWidth) ? options.videoWidth + 'px' : options.videoWidth;
	options.videoHeight = !options.videoHeight || !numbers.get(options.videoHeight, 0) ? '' : numbers.is(options.videoHeight) ? options.videoHeight + 'px' : options.videoHeight;
	options.videoSizeOnlyPercentage = !!options.videoSizeOnlyPercentage;
	options._videoSizeUnit = options.videoSizeOnlyPercentage ? '%' : 'px';
	options.videoRotation = options.videoRotation !== undefined ? options.videoRotation : !(options.videoSizeOnlyPercentage || !options.videoHeightShow);
	options.videoRatio = numbers.get(options.videoRatio, 4) || 0.5625;
	options.videoRatioList = !options.videoRatioList ? null : options.videoRatioList;
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
	options.linkRel = Array.isArray(options.linkRel) ? options.linkRel : [];
	options.linkRelDefault = options.linkRelDefault || {};

	/** External library */
	// CodeMirror object
	options.codeMirror = options.codeMirror
		? options.codeMirror.src
			? options.codeMirror
			: {
					src: options.codeMirror
			  }
		: null;
	// katex object (Math plugin)
	options.katex = options.katex
		? options.katex.src
			? options.katex
			: {
					src: options.katex
			  }
		: null;

	/** Private options */
	options.__listCommonStyle = options.__listCommonStyle || ['fontSize', 'color', 'fontFamily'];
	
	/** _init options */
	// options.__defaultFontSize;
}

/**
 * @description Initialize property of suneditor elements
 * @param {Object} options Options
 * @param {Element} topDiv Suneditor top div
 * @param {Element} toolBar Tool bar
 * @param {Element} toolBarArrow Tool bar arrow (balloon editor)
 * @returns {Object} Bottom bar elements (statusbar, navigation, charWrapper, charCounter)
 */
function _initElements(options, topDiv, toolBar, toolBarArrow) {
	/** top div */
	topDiv.style.cssText = options._editorStyles.top;

	/** toolbar */
	if (/inline/i.test(options.mode)) {
		toolBar.className += ' se-toolbar-inline';
		toolBar.style.width = options.toolbar_width;
	} else if (/balloon/i.test(options.mode)) {
		toolBar.className += ' se-toolbar-balloon';
		toolBar.style.width = options.toolbar_width;
		toolBar.appendChild(toolBarArrow);
	}

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
		class: 'se-wrapper-inner se-wrapper-code',
		style: options._editorStyles.frame
	});
	textarea.style.display = 'none';
	if (options.height === 'auto') textarea.style.overflow = 'hidden';

	/** resize bar */
	let statusbar = null;
	let navigation = null;
	let charWrapper = null;
	let charCounter = null;
	if (options.statusbar) {
		statusbar = domUtils.createElement('DIV', { class: 'se-resizing-bar sun-editor-common' });

		/** navigation */
		navigation = domUtils.createElement('DIV', { class: 'se-navigation sun-editor-commo' });
		statusbar.appendChild(navigation);

		/** char counter */
		if (options.charCounter) {
			charWrapper = domUtils.createElement('DIV', { class: 'se-char-counter-wrapper' });

			if (options.charCounter_label) {
				const charLabel = domUtils.createElement('SPAN', { class: 'se-char-label' });
				charLabel.textContent = options.charCounter_label;
				charWrapper.appendChild(charLabel);
			}

			charCounter = domUtils.createElement('SPAN', { class: 'se-char-counter' });
			charCounter.textContent = '0';
			charWrapper.appendChild(charCounter);

			if (options.charCounter_max > 0) {
				const char_max = domUtils.createElement('SPAN');
				char_max.textContent = ' / ' + options.charCounter_max;
				charWrapper.appendChild(char_max);
			}

			statusbar.appendChild(charWrapper);
		}
	}

	let placeholder = null;
	if (options.placeholder) {
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
	if (options.codeMirror) {
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

		const cm = options.codeMirror.src.fromTextArea(textarea, cmOptions);
		cm.display.wrapper.style.cssText = textarea.style.cssText;

		options.codeMirrorEditor = cm;
		textarea = cm.display.wrapper;
		textarea.className += ' se-wrapper-code-mirror';
	}

	return textarea;
}

/**
 * @description Check for a katex object.
 * @param {Object} katex katex object
 */
function _checkKatexMath(katex) {
	if (!katex) throw Error('[SUNEDITOR.create.fail] To use the math button you need to add a "katex" object to the options.');

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
 * @description create whitelist or blacklist.
 * @param {string} whitelist Whitelist
 * @param {string} blacklist Blacklist
 * @returns {string} Whitelist | Blacklist
 */
function _setWhitelist(whitelist, blacklist) {
	if (typeof blacklist !== 'string') return whitelist;
	blacklist = blacklist.split('|');
	whitelist = whitelist.split('|');
	for (let i = 0, len = blacklist.length, index; i < len; i++) {
		index = whitelist.indexOf(blacklist[i]);
		if (index > -1) whitelist.splice(index, 1);
	}
	return whitelist.join('|');
}

/**
 * @description Suneditor's Default button list
 * @param {Object} options options
 */
function _defaultButtons(options) {
	const icons = options.icons;
	const lang = options.lang;
	const cmd = env.isOSX_IOS ? '⌘' : 'CTRL';
	const addShift = env.isOSX_IOS ? '⇧' : '+SHIFT';
	const shortcutsDisable = !options.shortcutsHint ? ['bold', 'strike', 'underline', 'italic', 'undo', 'indent', 'save'] : options.shortcutsDisable;
	const indentKey = options._rtl ? ['[', ']'] : [']', '['];

	return {
		/** default command */
		bold: ['_se_command_bold', lang.toolbar.bold + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('bold') > -1 ? '' : cmd + '+<span class="se-shortcut-key">B</span>') + '</span>', 'bold', '', icons.bold],
		underline: ['_se_command_underline', lang.toolbar.underline + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('underline') > -1 ? '' : cmd + '+<span class="se-shortcut-key">U</span>') + '</span>', 'underline', '', icons.underline],
		italic: ['_se_command_italic', lang.toolbar.italic + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('italic') > -1 ? '' : cmd + '+<span class="se-shortcut-key">I</span>') + '</span>', 'italic', '', icons.italic],
		strike: ['_se_command_strike', lang.toolbar.strike + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('strike') > -1 ? '' : cmd + addShift + '+<span class="se-shortcut-key">S</span>') + '</span>', 'strike', '', icons.strike],
		subscript: ['_se_command_subscript', lang.toolbar.subscript, 'SUB', '', icons.subscript],
		superscript: ['_se_command_superscript', lang.toolbar.superscript, 'SUP', '', icons.superscript],
		removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '', icons.erase],
		indent: ['_se_command_indent', lang.toolbar.indent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmd + '+<span class="se-shortcut-key">' + indentKey[0] + '</span>') + '</span>', 'indent', '', icons.indent],
		outdent: ['_se_command_outdent', lang.toolbar.outdent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmd + '+<span class="se-shortcut-key">' + indentKey[1] + '</span>') + '</span>', 'outdent', '', icons.outdent],
		fullScreen: ['se-code-view-enabled se-resizing-enabled _se_command_fullScreen', lang.toolbar.fullScreen, 'fullScreen', '', icons.expansion],
		showBlocks: ['_se_command_showBlocks', lang.toolbar.showBlocks, 'showBlocks', '', icons.show_blocks],
		codeView: ['se-code-view-enabled se-resizing-enabled _se_command_codeView', lang.toolbar.codeView, 'codeView', '', icons.code_view],
		undo: ['_se_command_undo', lang.toolbar.undo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmd + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'undo', '', icons.undo],
		redo: ['_se_command_redo', lang.toolbar.redo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmd + '+<span class="se-shortcut-key">Y</span> / ' + cmd + addShift + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'redo', '', icons.redo],
		preview: ['se-resizing-enabled', lang.toolbar.preview, 'preview', '', icons.preview],
		print: ['se-resizing-enabled', lang.toolbar.print, 'print', '', icons.print],
		dir: ['_se_command_dir', lang.toolbar[options._rtl ? 'dir_ltr' : 'dir_rtl'], 'dir', '', icons[options._rtl ? 'dir_ltr' : 'dir_rtl']],
		dir_ltr: ['_se_command_dir_ltr', lang.toolbar.dir_ltr, 'dir_ltr', '', icons.dir_ltr],
		dir_rtl: ['_se_command_dir_rtl', lang.toolbar.dir_rtl, 'dir_rtl', '', icons.dir_rtl],
		save: ['_se_command_save se-resizing-enabled', lang.toolbar.save + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('save') > -1 ? '' : cmd + '+<span class="se-shortcut-key">S</span>') + '</span>', 'save', '', icons.save],
		/** plugins - command */
		blockquote: ['', lang.toolbar.tag_blockquote, 'blockquote', 'command', icons.blockquote],
		/** plugins - dropdown */
		font: ['se-btn-select se-btn-tool-font', lang.toolbar.font, 'font', 'dropdown', '<span class="txt">' + lang.toolbar.font + '</span>' + icons.arrow_down],
		formatBlock: ['se-btn-select se-btn-tool-format', lang.toolbar.formats, 'formatBlock', 'dropdown', '<span class="txt">' + lang.toolbar.formats + '</span>' + icons.arrow_down],
		fontSize: ['se-btn-select se-btn-tool-size', lang.toolbar.fontSize, 'fontSize', 'dropdown', '<span class="txt">' + lang.toolbar.fontSize + '</span>' + icons.arrow_down],
		fontColor: ['', lang.toolbar.fontColor, 'fontColor', 'dropdown', icons.font_color],
		hiliteColor: ['', lang.toolbar.hiliteColor, 'hiliteColor', 'dropdown', icons.highlight_color],
		align: ['se-btn-align', lang.toolbar.align, 'align', 'dropdown', options._rtl ? icons.align_right : icons.align_left],
		list: ['', lang.toolbar.list, 'list', 'dropdown', icons.list_number],
		horizontalRule: ['btn_line', lang.toolbar.horizontalRule, 'horizontalRule', 'dropdown', icons.horizontal_rule],
		table: ['', lang.toolbar.table, 'table', 'dropdown', icons.table],
		lineHeight: ['', lang.toolbar.lineHeight, 'lineHeight', 'dropdown', icons.line_height],
		template: ['', lang.toolbar.template, 'template', 'dropdown', icons.template],
		paragraphStyle: ['', lang.toolbar.paragraphStyle, 'paragraphStyle', 'dropdown', icons.paragraph_style],
		textStyle: ['', lang.toolbar.textStyle, 'textStyle', 'dropdown', icons.text_style],
		/** plugins - dialog */
		link: ['', lang.toolbar.link, 'link', 'dialog', icons.link],
		image: ['', lang.toolbar.image, 'image', 'dialog', icons.image],
		video: ['', lang.toolbar.video, 'video', 'dialog', icons.video],
		audio: ['', lang.toolbar.audio, 'audio', 'dialog', icons.audio],
		math: ['', lang.toolbar.math, 'math', 'dialog', icons.math],
		/** plugins - fileBrowser */
		imageGallery: ['', lang.toolbar.imageGallery, 'imageGallery', 'fileBrowser', icons.image_gallery]
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
 * @param {string} buttonClass className in button
 * @param {string} title Title in button
 * @param {string} dataCommand The data-command property of the button
 * @param {string} dataType The data-type property of the button ('dialog', 'dropdown', 'command',  'container')
 * @param {string} innerHTML Html in button
 * @param {string} _disabled Button disabled
 * @param {Object} _icons Icons
 * @returns {Object}
 */
function _createButton(buttonClass, title, dataCommand, dataType, innerHTML, _disabled, _icons) {
	const oLi = domUtils.createElement('LI');
	const oButton = domUtils.createElement('BUTTON', {
		type: 'button',
		class: 'se-btn' + (buttonClass ? ' ' + buttonClass : '') + ' se-tooltip',
		'data-command': dataCommand,
		'data-type': dataType,
		tabindex: '-1'
	});

	if (!innerHTML) innerHTML = '<span class="se-icon-text">!</span>';
	if (/^default\./i.test(innerHTML)) {
		innerHTML = _icons[innerHTML.replace(/^default\./i, '')];
	}
	if (/^text\./i.test(innerHTML)) {
		innerHTML = innerHTML.replace(/^text\./i, '');
		oButton.className += ' se-btn-more-text';
	}

	innerHTML += '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + (title || dataCommand) + '</span></span>';

	if (_disabled) oButton.setAttribute('disabled', true);

	oButton.innerHTML = innerHTML;
	oLi.appendChild(oButton);

	return {
		li: oLi,
		button: oButton
	};
}

/**
 * @description Create editor HTML
 * @param {Array} buttonList option.buttonList
 * @param {Array|Object|null} _plugins Plugins
 * @param {Array} options options
 * @returns {Object} { element: (Element) Toolbar element, plugins: (Array|null) Plugins Array, pluginCallButtons: (Object), responsiveButtons: (Array) }
 */
function _createToolBar(buttonList, _plugins, options) {
	const _buttonTray = domUtils.createElement('DIV', { class: 'se-btn-tray' });
	const separator_vertical = domUtils.createElement('DIV', { class: 'se-toolbar-separator-vertical' });
	const tool_bar = domUtils.createElement('DIV', { class: 'se-toolbar sun-editor-common' }, _buttonTray);

	/** create button list */
	buttonList = _w.JSON.parse(_w.JSON.stringify(buttonList));
	const icons = options.icons;
	const defaultButtonList = _defaultButtons(options);
	const pluginCallButtons = {};
	const responsiveButtons = [];
	const plugins = {};
	if (_plugins) {
		const pluginsValues = _plugins.length
			? _plugins
			: Object.keys(_plugins).map(function (name) {
					return _plugins[name];
			  });
		for (let i = 0, len = pluginsValues.length, p; i < len; i++) {
			p = pluginsValues[i].default || pluginsValues[i];
			plugins[p.name] = p;
		}
	}

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

				if (typeof button === 'object') {
					if (typeof button.add === 'function') {
						pluginName = button.name;
						module = defaultButtonList[pluginName];
						plugins[pluginName] = button;
					} else {
						pluginName = button.name;
						module = [button.buttonClass, button.title, button.name, button.type, button.innerHTML, button._disabled];
					}
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
						const matched = button.match(/^\:([^\-]+)\-([^\-]+)\-([^\-]+)/);
						moreCommand = '__se__' + matched[1].trim();
						const title = matched[2].trim();
						const innerHTML = matched[3].trim();
						module = ['se-btn-more', title, moreCommand, 'MORE', innerHTML];
					} else {
						// buttons
						module = defaultButtonList[button];
					}

					pluginName = button;
					if (!module) {
						const custom = plugins[pluginName];
						if (!custom) throw Error('[SUNEDITOR.create.toolbar.fail] The button name of a plugin that does not exist. [' + pluginName + ']');
						module = [custom.buttonClass, custom.title, custom.name, custom.type, custom.innerHTML, custom._disabled];
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
					moreContainer = util.createElement('DIV');
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

	if (responsiveButtons.length > 0) responsiveButtons.unshift(buttonList);
	if (moreLayer.children.length > 0) _buttonTray.appendChild(moreLayer);

	// menu tray
	const _menuTray = domUtils.createElement('DIV', { class: 'se-menu-tray' });
	tool_bar.appendChild(_menuTray);

	// cover
	const tool_cover = domUtils.createElement('DIV', { class: 'se-toolbar-cover' });
	tool_bar.appendChild(tool_cover);

	return {
		element: tool_bar,
		plugins: plugins,
		pluginCallButtons: pluginCallButtons,
		responsiveButtons: responsiveButtons,
		_menuTray: _menuTray,
		_buttonTray: _buttonTray
	};
}

export default Constructor;
