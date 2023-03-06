import _icons from '../assets/defaultIcons';
import _defaultLang from '../langs/en';
import { CreateContext, CreateFrameContext } from './context';
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

	/** --- Plugins ------------------------------------------------------------------------------------------ */
	const plugins = {};
	if (options.plugins) {
		const originPlugins = options.plugins;
		const pluginsValues = _w.Array.isArray(originPlugins.length)
			? originPlugins
			: _w.Object.keys(originPlugins).map(function (name) {
					return originPlugins[name];
			  });

		for (let i = 0, len = pluginsValues.length, p; i < len; i++) {
			p = pluginsValues[i].default || pluginsValues[i];
			plugins[p.key] = p;
		}
	}

	/** --- options --------------------------------------------------------------- */
	const optionMap = InitOptions(options, editorTargets);
	const o = optionMap.o;
	const icons = optionMap.i;
	const lang = optionMap.l;

	/** --- carrier wrapper --------------------------------------------------------------- */
	const editor_carrier_wrapper = domUtils.createElement('DIV', { class: 'sun-editor sun-editor-carrier-wrapper' + (o.get('_rtl') ? ' se-rtl' : '') });

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
	_d.body.insertBefore(editor_carrier_wrapper, _d.body.firstElementChild);

	/** --- toolbar --------------------------------------------------------------- */
	const tool_bar_main = CreateToolBar(o.get('buttonList'), plugins, o, icons, lang);
	const toolbar = tool_bar_main.element;
	toolbar.style.visibility = 'hidden';
	if (tool_bar_main.pluginCallButtons.math) _checkKatexMath(o.get('katex'));

	// toolbar mode
	if (/inline/i.test(o.get('mode'))) {
		toolbar.className += ' se-toolbar-inline';
		toolbar.style.width = o.get('toolbar_width');
	} else if (/balloon/i.test(o.get('mode'))) {
		toolbar.className += ' se-toolbar-balloon';
		toolbar.style.width = o.get('toolbar_width');
		toolbar.appendChild(domUtils.createElement('DIV', { class: 'se-arrow' }));
	}

	// editor frame
	/** multi root set - start -------------------------------------------------------------- */
	const rootId = editorTargets[0].key || null;
	const rootKeys = [];
	const rootTargets = new _w.Map();
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		const editTarget = editorTargets[i];
		const to = editTarget.options;
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (to.get('_rtl') ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		const editor_div = domUtils.createElement('DIV', { class: 'se-wrapper' });

		const toolbarShadow = toolbar.cloneNode(false);
		toolbarShadow.className += ' se-toolbar-shadow';
		container.appendChild(toolbarShadow);

		// init element
		const initElements = _initTargetElements(o, top_div, to);
		const bottomBar = initElements.bottomBar;
		const status_bar = bottomBar.statusbar;
		const wysiwyg_div = initElements.wysiwygFrame;
		const placeholder_span = initElements.placeholder;
		let textarea = initElements.codeView;

		// line breaker
		const line_breaker = domUtils.createElement('DIV', { class: 'se-line-breaker' }, '<button class="se-btn">' + icons.line_break + '</button>');
		const line_breaker_t = domUtils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-t' }, '<button class="se-btn">' + icons.line_break + '</button>');
		const line_breaker_b = domUtils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-b' }, '<button class="se-btn">' + icons.line_break + '</button>');
		line_breaker_t.innerHTML = line_breaker_b.innerHTML = icons.line_break;
		editor_div.appendChild(line_breaker);
		editor_div.appendChild(line_breaker_t);
		editor_div.appendChild(line_breaker_b);

		// append container
		editor_div.appendChild(textarea);
		if (placeholder_span) editor_div.appendChild(placeholder_span);
		container.appendChild(domUtils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
		container.appendChild(editor_div);

		// statusbar
		if (status_bar) {
			const statusbar_container = to.get('statusbar_container');
			if (statusbar_container) statusbar_container.appendChild(status_bar);
			else container.appendChild(status_bar);
		}

		// root key
		const key = editTarget.key || null;
		textarea = _checkCodeMirror(o, to, textarea);
		top_div.appendChild(container);
		rootKeys.push(key);
		rootTargets.set(key, CreateFrameContext(editTarget, top_div, wysiwyg_div, textarea, key));
	}
	/** multi root set - end -------------------------------------------------------------- */

	// toolbar container
	const toolbar_container = o.get('toolbar_container');
	if (toolbar_container) {
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (o.get('_rtl') ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		container.appendChild(toolbar);
		top_div.appendChild(container);
		toolbar_container.appendChild(top_div);
		toolbar_container.appendChild(domUtils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
	} else {
		const rootContainer = rootTargets.get(rootId).get('container');
		rootContainer.insertBefore(toolbar, rootContainer.firstElementChild);
	}

	return {
		context: CreateContext(toolbar, toolbar_container),
		carrierWrapper: editor_carrier_wrapper,
		options: o,
		plugins: plugins,
		icons: icons,
		lang: lang,
		value: optionMap.v,
		rootId: rootId,
		rootKeys: rootKeys,
		rootTargets: rootTargets,
		pluginCallButtons: tool_bar_main.pluginCallButtons,
		responsiveButtons: tool_bar_main.responsiveButtons
	};
};

/**
 * @description Reset the options
 * @returns {Object}
 */
export function ResetOptions() {}

/**
 * @description Initialize options
 * @param {Object} options Options object
 * @param {Element|Array.<Element>} editorTargets Target textarea
 * @returns {o:Map, p:Map} {{o: options map, p: plugins map}}
 */
function InitOptions(options, editorTargets) {
	const buttonList = options.buttonList || DEFAULT_BUTTON_LIST;
	const o = new _w.Map();
	o.set('events', options.events || {});

	/** Multi root */
	if (options.multiRoot) {
		if (!options.toolbar_container && !/inline|balloon/i.test(options.mode)) throw Error('[SUNEDITOR.create.fail] In multi root, The "mode" option cannot be "classic" without using the "toolbar_container" option.');
		if (options.statusbar && !options.statusbar_container) throw Error('[SUNEDITOR.create.fail] In multi root, The "statusbar_container" option is required unless the "statusbar" option is "false".');
	}

	/** Base */
	o.set('mode', options.mode || 'classic'); // classic, inline, balloon, balloon-always
	// text style tags
	const textTags = [{ bold: 'STRONG', underline: 'U', italic: 'EM', strike: 'DEL', sub: 'SUB', sup: 'SUP' }, options.textTags || {}].reduce(function (_default, _new) {
		for (let key in _new) {
			_default[key] = _new[key];
		}
		return _default;
	}, {});
	o.set('textTags', textTags);
	o.set('_spanStylesRegExp', new _w.RegExp('\\s*[^-a-zA-Z](font-family|font-size|color|background-color' + (options.spanStyles ? '|' + options.spanStyles : '') + ')\\s*:[^;]+(?!;)*', 'gi'));
	o.set('_formatStylesRegExp', new _w.RegExp('\\s*[^-a-zA-Z](text-align|margin-left|margin-right' + (options.formatStyles ? '|' + options.formatStyles : '') + ')\\s*:[^;]+(?!;)*', 'gi'));
	o.set('_styleNodeMap', {
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
	});
	o.set('_defaultCommand', {
		bold: textTags.bold,
		underline: textTags.underline,
		italic: textTags.italic,
		strike: textTags.strike,
		subscript: textTags.sub,
		superscript: textTags.sup
	});
	// text direction
	o.set('_rtl', o.get('textDirection') === 'rtl');
	o.set('textDirection', typeof options.textDirection !== 'string' ? 'ltr' : options.textDirection);
	o.set('buttonList', o.get('_rtl') ? buttonList.reverse() : buttonList);

	// etc
	o.set('historyStackDelayTime', typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400);
	o.set('frameAttrbutes', options.frameAttrbutes || {});
	o.set('_editableClass', 'sun-editor-editable' + (o.get('_rtl') ? ' se-rtl' : ''));
	o.set('callBackSave', options.callBackSave);
	o.set('lineAttrReset', typeof options.lineAttrReset === 'string' && options.lineAttrReset ? (options.lineAttrReset === '*' ? '*' : new _w.RegExp('^(' + options.lineAttrReset + ')$', 'i')) : null);
	o.set('_printClass', typeof options._printClass === 'string' ? options._printClass : null);

	/** whitelist, blacklist */
	// default line
	o.set('defaultLineTag', typeof options.defaultLineTag === 'string' && options.defaultLineTag.length > 0 ? options.defaultLineTag : 'p');
	// element
	o.set('elementWhitelist', (typeof options.elementWhitelist === 'string' ? options.elementWhitelist : '').toLowerCase());
	o.set('elementBlacklist', _createBlacklist((typeof options.elementBlacklist === 'string' ? options.elementBlacklist : '').toLowerCase(), o.get('defaultLineTag')));
	// attribute
	o.set('attributeWhitelist', !options.attributeWhitelist || typeof options.attributeWhitelist !== 'object' ? null : options.attributeWhitelist);
	o.set('attributeBlacklist', !options.attributeBlacklist || typeof options.attributeBlacklist !== 'object' ? null : options.attributeBlacklist);
	// format tag
	o.set('formatClosureBrLine', _createFormatInfo(options.formatClosureBrLine, (options.__defaultFormatClosureBrLine = typeof options.__defaultFormatClosureBrLine === 'string' ? options.__defaultFormatClosureBrLine : DEFAULT_FORMAT_CLOSURE_BR_LINE).toLowerCase(), o.get('elementBlacklist')));
	o.set('formatBrLine', _createFormatInfo((options.formatBrLine || '') + '|' + o.get('formatClosureBrLine').str, (options.__defaultFormatBrLine = typeof options.__defaultFormatBrLine === 'string' ? options.__defaultFormatBrLine : DEFAULT_FORMAT_BR_LINE).toLowerCase(), o.get('elementBlacklist')));
	o.set('formatLine', _createFormatInfo((options.formatLine || '') + '|' + o.get('formatBrLine').str, (options.__defaultFormatLine = typeof options.__defaultFormatLine === 'string' ? options.__defaultFormatLine : DEFAULT_FORMAT_LINE).toLowerCase(), o.get('elementBlacklist')));
	o.set('formatClosureBlock', _createFormatInfo(options.formatClosureBlock, (options.__defaultFormatClosureBlock = typeof options.__defaultFormatClosureBlock === 'string' ? options.__defaultFormatClosureBlock : DEFAULT_FORMAT_CLOSURE_BLOCK).toLowerCase(), o.get('elementBlacklist')));
	o.set('formatBlock', _createFormatInfo((options.formatBlock || '') + '|' + o.get('formatClosureBlock').str, (options.__defaultFormatBlock = typeof options.__defaultFormatBlock === 'string' ? options.__defaultFormatBlock : DEFAULT_FORMAT_BLOCK).toLowerCase(), o.get('elementBlacklist')));

	/** __defaults */
	o.set('__defaultElementWhitelist', (typeof options.__defaultElementWhitelist === 'string' ? options.__defaultElementWhitelist : DEFAULT_ELEMENT_WHITELIST).toLowerCase());
	o.set('__defaultAttributeWhitelist', (typeof options.__defaultAttributeWhitelist === 'string' ? options.__defaultAttributeWhitelist : DEFAULT_ATTRIBUTE_WHITELIST).toLowerCase());
	// --- create element whitelist (__defaultElementWhiteList + elementWhitelist + format[line, BrLine, Block, Closureblock, ClosureBrLine] - elementBlacklist)
	o.set('_editorElementWhitelist', o.get('elementWhitelist') === '*' ? '*' : _createWhitelist(o));

	/** Toolbar */
	o.set('toolbar_width', options.toolbar_width ? (numbers.is(options.toolbar_width) ? options.toolbar_width + 'px' : options.toolbar_width) : 'auto');
	o.set('toolbar_container', options.toolbar_container && !/inline/i.test(o.get('mode')) ? (typeof options.toolbar_container === 'string' ? _d.querySelector(options.toolbar_container) : options.toolbar_container) : null);
	o.set('toolbar_sticky', /balloon/i.test(o.get('mode')) ? -1 : options.toolbar_sticky === undefined ? 0 : /^\d+/.test(options.toolbar_sticky) ? numbers.get(options.toolbar_sticky, 0) : -1);
	o.set('toolbar_hide', !!options.toolbar_hide);

	/** styles */
	InitRootOptions(editorTargets, options);

	/** IFrame */
	o.set('iframe', !!options.iframe_fullPage || !!options.iframe);
	o.set('iframe_fullPage', !!options.iframe_fullPage);
	o.set('iframe_attributes', options.iframe_attributes || {});
	o.set('iframe_cssFileName', options.iframe ? (typeof options.iframe_cssFileName === 'string' ? [options.iframe_cssFileName] : options.iframe_cssFileName || ['suneditor']) : null);

	/** Key actions */
	o.set('tabDisable', !!options.tabDisable);
	o.set('shortcutsDisable', _w.Array.isArray(options.shortcutsDisable) ? options.shortcutsDisable : []);
	o.set('shortcutsHint', options.shortcutsHint === undefined ? true : !!options.shortcutsHint);

	/** View */
	o.set('fullScreenOffset', options.fullScreenOffset === undefined ? 0 : /^\d+/.test(options.fullScreenOffset) ? numbers.get(options.fullScreenOffset, 0) : 0);
	o.set('previewTemplate', typeof options.previewTemplate === 'string' ? options.previewTemplate : null);
	o.set('printTemplate', typeof options.printTemplate === 'string' ? options.printTemplate : null);

	/** Defining menu items */
	o.set('hrItems', !options.hrItems ? null : options.hrItems);
	o.set('font', !options.font ? ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'] : options.font);
	o.set('fontSize', !options.fontSize ? null : options.fontSize);
	o.set('formats', !options.formats ? null : options.formats);
	o.set('colorList_font', !options.colorList_font ? null : options.colorList_font);
	o.set('colorList_background', !options.colorList_background ? null : options.colorList_background);
	o.set('lineHeights', !options.lineHeights ? null : options.lineHeights);
	o.set('paragraphStyles', !options.paragraphStyles ? null : options.paragraphStyles);
	o.set('textStyles', !options.textStyles ? null : options.textStyles);
	o.set('fontSizeUnit', typeof options.fontSizeUnit === 'string' ? options.fontSizeUnit.trim().toLowerCase() || 'px' : 'px');
	o.set('alignItems', typeof options.alignItems === 'object' ? options.alignItems : o.get('_rtl') ? ['right', 'center', 'left', 'justify'] : ['left', 'center', 'right', 'justify']);
	o.set('templates', !options.templates ? null : options.templates);
	o.set(
		'mathFontSize',
		!!options.mathFontSize
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
			  ]
	);

	/** --- Media */
	o.set('mediaAutoSelect', options.mediaAutoSelect === undefined ? true : !!options.mediaAutoSelect);

	/** Image */
	o.set('imageResizing', options.imageResizing === undefined ? true : options.imageResizing);
	o.set('imageWidth', !options.imageWidth ? 'auto' : numbers.is(options.imageWidth) ? options.imageWidth + 'px' : options.imageWidth);
	o.set('imageHeight', !options.imageHeight ? 'auto' : numbers.is(options.imageHeight) ? options.imageHeight + 'px' : options.imageHeight);
	o.set(
		'imageControls',
		options.imageControls || !o.get('imageResizing')
			? [['mirror_h', 'mirror_v', 'align', 'caption', 'revert', 'edit', 'remove']]
			: [
					['percent_100', 'percent_75', 'percent_50', 'auto', 'rotate_l', 'rotate_r'],
					['mirror_h', 'mirror_v', 'align', 'caption', 'revert', 'edit', 'remove']
			  ]
	);
	// @todo
	o.set('imageHeightShow', options.imageHeightShow === undefined ? true : !!options.imageHeightShow);
	o.set('imageAlignShow', options.imageAlignShow === undefined ? true : !!options.imageAlignShow);
	o.set('imageSizeOnlyPercentage', !!options.imageSizeOnlyPercentage);
	o.set('_imageSizeUnit', o.get('imageSizeOnlyPercentage') ? '%' : 'px');
	o.set('imageRotation', options.imageRotation !== undefined ? options.imageRotation : !(o.get('imageSizeOnlyPercentage') || !o.get('imageHeightShow')));
	o.set('imageFileInput', options.imageFileInput === undefined ? true : options.imageFileInput);
	o.set('imageUrlInput', options.imageUrlInput === undefined || !options.imageFileInput ? true : options.imageUrlInput);
	o.set('imageUploadHeader', options.imageUploadHeader || null);
	o.set('imageUploadUrl', typeof options.imageUploadUrl === 'string' ? options.imageUploadUrl : null);
	o.set('imageUploadSizeLimit', /\d+/.test(options.imageUploadSizeLimit) ? numbers.get(options.imageUploadSizeLimit, 0) : null);
	o.set('imageMultipleFile', !!options.imageMultipleFile);
	o.set('imageAccept', typeof options.imageAccept !== 'string' || options.imageAccept.trim() === '*' ? 'image/*' : options.imageAccept.trim() || 'image/*');

	/** Image - image gallery */
	o.set('imageGalleryUrl', typeof options.imageGalleryUrl === 'string' ? options.imageGalleryUrl : null);
	o.set('imageGalleryHeader', options.imageGalleryHeader || null);

	/** Video */
	o.set('videoResizing', options.videoResizing === undefined ? true : options.videoResizing);
	o.set('videoWidth', !options.videoWidth || !numbers.get(options.videoWidth, 0) ? '' : numbers.is(options.videoWidth) ? options.videoWidth + 'px' : options.videoWidth);
	o.set('videoHeight', !options.videoHeight || !numbers.get(options.videoHeight, 0) ? '' : numbers.is(options.videoHeight) ? options.videoHeight + 'px' : options.videoHeight);
	o.set(
		'videoControls',
		options.videoControls || !o.get('videoResizing')
			? [['mirror_h', 'mirror_v', 'align', 'revert', 'edit', 'remove']]
			: [
					['percent_100', 'percent_75', 'percent_50', 'auto', 'rotate_l', 'rotate_r'],
					['mirror_h', 'mirror_v', 'align', 'revert', 'edit', 'remove']
			  ]
	);
	// @todo
	o.set('videoRatioShow', options.videoRatioShow === undefined ? true : !!options.videoRatioShow);
	o.set('videoRatio', numbers.get(options.videoRatio, 4) || 0.5625);
	o.set('videoRatioList', !options.videoRatioList ? null : options.videoRatioList);
	// @todo
	o.set('videoHeightShow', options.videoHeightShow === undefined ? true : !!options.videoHeightShow);
	o.set('videoAlignShow', options.videoAlignShow === undefined ? true : !!options.videoAlignShow);
	o.set('videoSizeOnlyPercentage', !!options.videoSizeOnlyPercentage);
	o.set('_videoSizeUnit', o.get('videoSizeOnlyPercentage') ? '%' : 'px');
	o.set('videoRotation', options.videoRotation !== undefined ? options.videoRotation : !(o.get('videoSizeOnlyPercentage') || !o.get('videoHeightShow')));
	o.set('youtubeQuery', (options.youtubeQuery || '').replace('?', ''));
	o.set('videoFileInput', !!options.videoFileInput);
	o.set('videoUrlInput', options.videoUrlInput === undefined || !options.videoFileInput ? true : options.videoUrlInput);
	o.set('videoUploadHeader', options.videoUploadHeader || null);
	o.set('videoUploadUrl', typeof options.videoUploadUrl === 'string' ? options.videoUploadUrl : null);
	o.set('videoUploadSizeLimit', /\d+/.test(options.videoUploadSizeLimit) ? numbers.get(options.videoUploadSizeLimit, 0) : null);
	o.set('videoMultipleFile', !!options.videoMultipleFile);
	o.set('videoTagAttrs', options.videoTagAttrs || null);
	o.set('videoIframeAttrs', options.videoIframeAttrs || null);
	o.set('videoAccept', typeof options.videoAccept !== 'string' || options.videoAccept.trim() === '*' ? 'video/*' : options.videoAccept.trim() || 'video/*');

	/** Audio */
	o.set('audioWidth', !options.audioWidth ? '' : numbers.is(options.audioWidth) ? options.audioWidth + 'px' : options.audioWidth);
	o.set('audioHeight', !options.audioHeight ? '' : numbers.is(options.audioHeight) ? options.audioHeight + 'px' : options.audioHeight);
	o.set('audioFileInput', !!options.audioFileInput);
	o.set('audioUrlInput', options.audioUrlInput === undefined || !options.audioFileInput ? true : options.audioUrlInput);
	o.set('audioUploadHeader', options.audioUploadHeader || null);
	o.set('audioUploadUrl', typeof options.audioUploadUrl === 'string' ? options.audioUploadUrl : null);
	o.set('audioUploadSizeLimit', /\d+/.test(options.audioUploadSizeLimit) ? numbers.get(options.audioUploadSizeLimit, 0) : null);
	o.set('audioMultipleFile', !!options.audioMultipleFile);
	o.set('audioTagAttrs', options.audioTagAttrs || null);
	o.set('audioAccept', typeof options.audioAccept !== 'string' || options.audioAccept.trim() === '*' ? 'audio/*' : options.audioAccept.trim() || 'audio/*');

	/** Table */
	o.set('tableCellControllerPosition', typeof options.tableCellControllerPosition === 'string' ? options.tableCellControllerPosition.toLowerCase() : 'cell');

	/** Link */
	o.set('linkTargetNewWindow', !!options.linkTargetNewWindow);
	o.set('linkProtocol', typeof options.linkProtocol === 'string' ? options.linkProtocol : null);
	o.set('linkRel', _w.Array.isArray(options.linkRel) ? options.linkRel : []);
	o.set('linkRelDefault', options.linkRelDefault || {});

	/** External library */
	// CodeMirror
	if (options.codeMirror) {
		o.set('codeMirror', options.codeMirror);
		if (options.codeMirror.EditorView) {
			o.set('codeMirror6Editor', true);
		} else if (options.codeMirror.src) {
			o.set('codeMirror5Editor', true);
		} else {
			console.warn('[SUNEDITOR.options.codeMirror.fail] The codeMirror option is set incorrectly.');
			o.set('codeMirror', null);
		}
	}

	// katex (Math plugin)
	if (options.katex) {
		if (!options.katex.src) {
			console.warn('[SUNEDITOR.options.katex.fail] The katex option is set incorrectly.');
			o.set('katex', null);
		} else {
			o.set('katex', options.katex);
		}
	}

	/** Private options */
	o.set('__listCommonStyle', options.__listCommonStyle || ['fontSize', 'color', 'fontFamily', 'fontWeight', 'fontStyle']);
	o.set('__defaultFontSize', options.__defaultFontSize);

	/** --- Icons ------------------------------------------------------------------------------------------ */
	let icons =
		!options.icons || typeof options.icons !== 'object'
			? _icons
			: [_icons, options.icons].reduce(function (_default, _new) {
					for (let key in _new) {
						_default[key] = _new[key];
					}
					return _default;
			  }, {});
	// rtl
	if (o.get('_rtl')) {
		icons = [o.get('icons'), o.get('icons')._rtl].reduce(function (_default, _new) {
			for (let key in _new) {
				_default[key] = _new[key];
			}
			return _default;
		}, {});
	}

	return {
		o: o,
		i: icons,
		l: options.lang || _defaultLang,
		v: (options.value = typeof options.value === 'string' ? options.value : null)
	};
}

function InitRootOptions(editorTargets, options) {
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		InitFrameOptions(editorTargets[i].options || {}, options, (editorTargets[i].options = new _w.Map()));
	}
}

function InitFrameOptions(o, origin, fo) {
	// members
	const value = o.value === undefined ? origin.value : o.value;
	const placeholder = o.placeholder === undefined ? origin.placeholder : o.placeholder;
	const width = o.width === undefined ? origin.width : o.width;
	const minWidth = o.minWidth === undefined ? origin.minWidth : o.minWidth;
	const maxWidth = o.maxWidth === undefined ? origin.maxWidth : o.maxWidth;
	const height = o.height === undefined ? origin.height : o.height;
	const minHeight = o.minHeight === undefined ? origin.minHeight : o.minHeight;
	const maxHeight = o.maxHeight === undefined ? origin.maxHeight : o.maxHeight;
	const editorStyle = o.editorStyle === undefined ? origin.editorStyle : o.editorStyle;
	const statusbar = o.statusbar === undefined ? origin.statusbar : o.statusbar;
	const statusbar_showPathLabel = o.statusbar_showPathLabel === undefined ? origin.statusbar_showPathLabel : o.statusbar_showPathLabel;
	const statusbar_resizeEnable = o.statusbar_resizeEnable === undefined ? origin.statusbar_resizeEnable : o.statusbar_resizeEnable;
	const statusbar_container = o.statusbar_container === undefined ? origin.statusbar_container : o.statusbar_container;
	const charCounter = o.charCounter === undefined ? origin.charCounter : o.charCounter;
	const charCounter_max = o.charCounter_max === undefined ? origin.charCounter_max : o.charCounter_max;
	const charCounter_label = o.charCounter_label === undefined ? origin.charCounter_label : o.charCounter_label;
	const charCounter_type = o.charCounter_type === undefined ? origin.charCounter_type : o.charCounter_type;

	// value
	fo.set('value', value);
	fo.set('placeholder', placeholder);
	// styles
	fo.set('width', width ? (numbers.is(width) ? width + 'px' : width) : '100%');
	fo.set('minWidth', (numbers.is(minWidth) ? minWidth + 'px' : minWidth) || '');
	fo.set('maxWidth', (numbers.is(maxWidth) ? maxWidth + 'px' : maxWidth) || '');
	fo.set('height', height ? (numbers.is(height) ? height + 'px' : height) : 'auto');
	fo.set('minHeight', (numbers.is(minHeight) ? minHeight + 'px' : minHeight) || '');
	fo.set('maxHeight', (numbers.is(maxHeight) ? maxHeight + 'px' : maxHeight) || '');
	fo.set('_defaultStyles', converter._setDefaultOptionStyle(fo, typeof editorStyle === 'string' ? editorStyle : ''));
	// status bar
	const hasStatusbar = statusbar === undefined ? true : statusbar;
	fo.set('statusbar', hasStatusbar);
	fo.set('statusbar_showPathLabel', !hasStatusbar ? false : typeof statusbar_showPathLabel === 'boolean' ? statusbar_showPathLabel : true);
	fo.set('statusbar_resizeEnable', !hasStatusbar ? false : statusbar_resizeEnable === undefined ? true : !!statusbar_resizeEnable);
	fo.set('statusbar_container', typeof statusbar_container === 'string' ? _d.querySelector(statusbar_container) : statusbar_container);
	// status bar - character count
	fo.set('charCounter', charCounter_max > 0 ? true : typeof charCounter === 'boolean' ? charCounter : false);
	fo.set('charCounter_max', numbers.is(charCounter_max) && charCounter_max > -1 ? charCounter_max * 1 : null);
	fo.set('charCounter_label', typeof charCounter_label === 'string' ? charCounter_label.trim() : null);
	fo.set('charCounter_type', typeof charCounter_type === 'string' ? charCounter_type : 'char');
}

/**
 * @description Initialize property of suneditor elements
 * @param {Object} options Options
 * @param {Element} topDiv Suneditor top div
 * @returns {Object} Bottom bar elements (statusbar, navigation, charWrapper, charCounter)
 */
function _initTargetElements(options, topDiv, targetOptions) {
	const editorStyles = targetOptions.get('_defaultStyles');
	/** top div */
	topDiv.style.cssText = editorStyles.top;

	/** editor */
	// wysiwyg div or iframe
	const wysiwygDiv = domUtils.createElement(!options.get('iframe') ? 'DIV' : 'IFRAME', { class: 'se-wrapper-inner se-wrapper-wysiwyg' });

	if (!options.get('iframe')) {
		wysiwygDiv.setAttribute('contenteditable', true);
		wysiwygDiv.setAttribute('scrolling', 'auto');
		const frameAttrs = options.get('iframe_attributes');
		for (let key in frameAttrs) {
			wysiwygDiv.setAttribute(key, frameAttrs[key]);
		}
		wysiwygDiv.className += ' ' + options.get('_editableClass');
		wysiwygDiv.style.cssText = editorStyles.frame + editorStyles.editor;
	} else {
		wysiwygDiv.allowFullscreen = true;
		wysiwygDiv.frameBorder = 0;
		wysiwygDiv.style.cssText = editorStyles.frame;
	}

	// textarea for code view
	const textarea = domUtils.createElement('TEXTAREA', {
		class: 'se-wrapper-inner se-wrapper-code',
		style: editorStyles.frame
	});

	textarea.style.setProperty('display', 'none', 'important');
	if (targetOptions.get('height') === 'auto') textarea.style.overflow = 'hidden';

	/** status bar */
	let statusbar = null;
	let navigation = null;
	let charWrapper = null;
	let charCounter = null;
	if (targetOptions.get('statusbar')) {
		statusbar = domUtils.createElement('DIV', { class: 'se-status-bar sun-editor-common' });

		/** navigation */
		navigation = domUtils.createElement('DIV', { class: 'se-navigation sun-editor-common' });
		statusbar.appendChild(navigation);

		/** char counter */
		if (targetOptions.get('charCounter')) {
			charWrapper = domUtils.createElement('DIV', { class: 'se-char-counter-wrapper' });

			if (targetOptions.get('charCounter_label')) {
				const charLabel = domUtils.createElement('SPAN', { class: 'se-char-label' });
				charLabel.textContent = targetOptions.get('charCounter_label');
				charWrapper.appendChild(charLabel);
			}

			charCounter = domUtils.createElement('SPAN', { class: 'se-char-counter' });
			charCounter.textContent = '0';
			charWrapper.appendChild(charCounter);

			if (targetOptions.get('charCounter_max') > 0) {
				const char_max = domUtils.createElement('SPAN');
				char_max.textContent = ' / ' + targetOptions.get('charCounter_max');
				charWrapper.appendChild(char_max);
			}

			statusbar.appendChild(charWrapper);
		}
	}

	let placeholder = null;
	if (targetOptions.get('placeholder')) {
		placeholder = domUtils.createElement('SPAN', { class: 'se-placeholder' });
		placeholder.innerText = targetOptions.get('placeholder');
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
		].reduce(function (init, option) {
			for (let key in option) {
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
		cmeditor.className += ' se-wrapper-code-mirror';
		cmeditor.style.setProperty('display', 'none', 'important');
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
			init[key] = option[key];
		}
		return init;
	}, {});

	katex.options = katexOptions;
}

/**
 * @description create blacklist
 * @param {string} blacklist blacklist
 * @param {string} defaultLineTag options.get('defaultLineTag')
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
 * @param {Object} o options
 * @returns {string} whitelist
 */
function _createWhitelist(o) {
	const blacklist = o.get('elementBlacklist').split('|');
	const whitelist = (o.get('__defaultElementWhitelist') + '|' + o.get('elementWhitelist') + '|' + o.get('formatLine').str + '|' + o.get('formatBrLine').str + '|' + o.get('formatClosureBlock').str + '|' + o.get('formatClosureBrLine').str)
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
function _defaultButtons(options, icons, lang) {
	const cmdIcon = env.cmdIcon;
	const shiftIcon = env.shiftIcon;
	const shortcutsDisable = !options.get('shortcutsHint') ? ['bold', 'strike', 'underline', 'italic', 'undo', 'indent', 'save'] : options.get('shortcutsDisable');
	const isRTL = options.get('_rtl');
	const indentKey = isRTL ? ['[', ']'] : [']', '['];
	const indentIcon = isRTL ? [icons.outdent, icons.indent] : [icons.indent, icons.outdent];

	return {
		bold: ['', lang.bold + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('bold') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">B</span>') + '</span>', 'bold', '', icons.bold],
		underline: ['', lang.underline + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('underline') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">U</span>') + '</span>', 'underline', '', icons.underline],
		italic: ['', lang.italic + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('italic') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">I</span>') + '</span>', 'italic', '', icons.italic],
		strike: ['', lang.strike + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('strike') > -1 ? '' : cmdIcon + shiftIcon + '+<span class="se-shortcut-key">S</span>') + '</span>', 'strike', '', icons.strike],
		subscript: ['', lang.subscript, 'SUB', '', icons.subscript],
		superscript: ['', lang.superscript, 'SUP', '', icons.superscript],
		removeFormat: ['', lang.removeFormat, 'removeFormat', '', icons.erase],
		indent: ['', lang.indent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">' + indentKey[0] + '</span>') + '</span>', 'indent', '', indentIcon[0]],
		outdent: ['', lang.outdent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">' + indentKey[1] + '</span>') + '</span>', 'outdent', '', indentIcon[1]],
		fullScreen: ['se-code-view-enabled se-resizing-enabled', lang.fullScreen, 'fullScreen', '', icons.expansion],
		showBlocks: ['', lang.showBlocks, 'showBlocks', '', icons.show_blocks],
		codeView: ['se-code-view-enabled se-resizing-enabled', lang.codeView, 'codeView', '', icons.code_view],
		undo: ['', lang.undo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'undo', '', icons.undo],
		redo: ['', lang.redo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">Y</span> / ' + cmdIcon + shiftIcon + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'redo', '', icons.redo],
		preview: ['se-resizing-enabled', lang.preview, 'preview', '', icons.preview],
		print: ['se-resizing-enabled', lang.print, 'print', '', icons.print],
		dir: ['', lang[isRTL ? 'dir_ltr' : 'dir_rtl'], 'dir', '', icons[isRTL ? 'dir_ltr' : 'dir_rtl']],
		dir_ltr: ['', lang.dir_ltr, 'dir_ltr', '', icons.dir_ltr],
		dir_rtl: ['', lang.dir_rtl, 'dir_rtl', '', icons.dir_rtl],
		save: ['se-resizing-enabled', lang.save + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('save') > -1 ? '' : cmdIcon + '+<span class="se-shortcut-key">S</span>') + '</span>', 'save', '', icons.save]
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
 * @param {Object} icons Icons
 * @returns {Object}
 */
function _createButton(className, title, dataCommand, dataType, innerHTML, _disabled, icons) {
	const oLi = domUtils.createElement('LI');
	const label = title || '';
	const oButton = domUtils.createElement('BUTTON', {
		type: 'button',
		class: 'se-btn se-tooltip' + (className ? ' ' + className : ''),
		'data-command': dataCommand,
		'data-type': dataType,
		'aria-label': label.replace(/<span .+<\/span>/, ''),
		tabindex: '-1'
	});

	if (/^default\./i.test(innerHTML)) {
		innerHTML = icons[innerHTML.replace(/^default\./i, '')];
	}
	if (/^text\./i.test(innerHTML)) {
		innerHTML = innerHTML.replace(/^text\./i, '');
		oButton.className += ' se-btn-more-text';
	}

	if (_disabled) oButton.setAttribute('disabled', true);

	if (label) innerHTML += '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + label + '</span></span>';
	if (innerHTML) oButton.innerHTML = innerHTML;

	oLi.appendChild(oButton);

	return {
		li: oLi,
		button: oButton
	};
}

export function UpdateButton(element, plugin, icons, lang) {
	if (!element) return;
	element.innerHTML = (icons[plugin.icon] || plugin.icon || '<span class="se-icon-text">!</span>') + '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + (lang[plugin.title] || plugin.title) + '</span></span>';
	element.setAttribute('aria-label', plugin.title);
	if (plugin.type) element.setAttribute('data-type', plugin.type);
	if (plugin.className) element.className += ' ' + plugin.className;
}

/**
 * @description Create editor HTML
 * @param {Array} buttonList option.buttonList
 * @param {Object|null} plugins Plugins
 * @param {Array} options options
 * @param {Object} icons icons
 * @param {Object} lang lang
 * @returns {Object} { element: (Element) Toolbar element, plugins: (Array|null) Plugins Array, pluginCallButtons: (Object), responsiveButtons: (Array) }
 */
export function CreateToolBar(buttonList, plugins, options, icons, lang) {
	const _buttonTray = domUtils.createElement('DIV', { class: 'se-btn-tray' });
	const separator_vertical = domUtils.createElement('DIV', { class: 'se-toolbar-separator-vertical' });
	const tool_bar = domUtils.createElement('DIV', { class: 'se-toolbar sun-editor-common' }, _buttonTray);

	/** create button list */
	buttonList = _w.JSON.parse(_w.JSON.stringify(buttonList));
	const defaultButtonList = _defaultButtons(options, icons, lang);
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
						module = ['se-btn-more', /^lang\./i.test(title) ? lang[title.replace(/^lang\./i, '')] : title, moreCommand, 'MORE', innerHTML];
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
			if (options.get('_rtl')) {
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

	if (options.get('toolbar_hide')) tool_bar.style.display = 'none';

	return {
		element: tool_bar,
		pluginCallButtons: pluginCallButtons,
		responsiveButtons: responsiveButtons,
		_menuTray: _menuTray,
		_buttonTray: _buttonTray
	};
}

export default Constructor;
