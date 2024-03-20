import _icons from '../../assets/icons/_default';
import _defaultLang from '../../langs/en';
import { CreateContext, CreateFrameContext } from './context';
import { domUtils, numbers, converter, env } from '../../helper';

const _d = env._d;
const DEFAULT_BUTTON_LIST = [['undo', 'redo'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'], ['outdent', 'indent'], ['fullScreen', 'showBlocks', 'codeView'], ['preview', 'print']];

const REQUIRED_FORMAT_LINE = 'div';
const REQUIRED_ELEMENT_WHITELIST = 'br|div';
const DEFAULT_ELEMENT_WHITELIST =
	'p|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|caption|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
const DEFAULT_ATTRIBUTE_WHITELIST = 'contenteditable|target|href|download|rel|src|alt|class|type|controls|colspan|rowspan';
const DEFAULT_TABLE_STYLES = {
	'table|th|td': 'border|border-[a-z]+|background-color|text-align|float|font-weight|text-decoration|font-style'
};

const DEFAULT_FORMAT_LINE = 'P|H[1-6]|LI|TH|TD|DETAILS';
const DEFAULT_FORMAT_BR_LINE = 'PRE';
const DEFAULT_FORMAT_CLOSURE_BR_LINE = '';
const DEFAULT_FORMAT_BLOCK = 'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS';
const DEFAULT_FORMAT_CLOSURE_BLOCK = 'TH|TD';

const DEFAULT_SIZE_UNITS = ['px', 'pt', 'em', 'rem'];

const DEFAULT_CLASS_NAME = '^__se__|^se-|^katex';
const DEFAULT_EXTRA_TAG_MAP = { script: false, style: false, meta: false, link: false, '[a-z]+:[a-z]+': false };

export const RO_UNAVAILABD = [
	'mode',
	'keepStyleOnDelete',
	'iframe',
	'textTags',
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
		const pluginsValues = Array.isArray(originPlugins.length)
			? originPlugins
			: Object.keys(originPlugins).map(function (name) {
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
	const loadingBox = domUtils.createElement('DIV', { class: 'se-loading-box sun-editor-common' }, '<div class="se-loading-effect"></div>');

	/** --- carrier wrapper --------------------------------------------------------------- */
	const editor_carrier_wrapper = domUtils.createElement('DIV', { class: 'sun-editor sun-editor-carrier-wrapper sun-editor-common' + (o.get('_rtl') ? ' se-rtl' : '') });
	// menuTray
	const menuTray = domUtils.createElement('DIV', { class: 'se-menu-tray' });
	editor_carrier_wrapper.appendChild(menuTray);

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
		const to = editTarget.options;
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (to.get('_rtl') ? ' se-rtl' : '') });
		const container = domUtils.createElement('DIV', { class: 'se-container' });
		const editor_div = domUtils.createElement('DIV', { class: 'se-wrapper' });

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
					statusbarContainer.appendChild(domUtils.createElement('DIV', { class: 'sun-editor' }, statusbar));
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

		// set container
		top_div.appendChild(container);
		rootKeys.push(key);
		frameRoots.set(key, CreateFrameContext(editTarget, top_div, wysiwyg_div, codeWrapper, textarea, default_status_bar || statusbar, key));
	}
	/** frame - root set - end -------------------------------------------------------------- */

	// toolbar container
	const toolbar_container = o.get('toolbar_container');
	if (toolbar_container) {
		const top_div = domUtils.createElement('DIV', { class: 'sun-editor' + (o.get('_rtl') ? ' se-rtl' : '') });
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
};

/**
 * @description Create shortcuts desc span.
 * @param {string} command Command string
 * @param {Array.<string>} values options.shortcuts[command]
 * @param {Element} button Command button element
 * @param {Map} keyMap Map to store shortcut key info
 * @param {Array} rc "_reverseCommandArray" option
 * @param {Array} reverseKeys Reverse key array
 */
export function CreateShortcuts(command, button, values, keyMap, rc, reverseKeys) {
	if (!values || values.length < 2) return;
	const tooptip = button.querySelector('.se-tooltip-text');

	for (let i = 0, v, s, t, k, r; i < values.length; i += 2) {
		v = values[i];
		s = /^s/i.test(v);
		k = numbers.get(v) + (s ? 1000 : 0);
		if (!keyMap.has(k)) {
			r = rc.indexOf(command);
			r = r === -1 ? '' : numbers.isOdd(r) ? rc[r + 1] : rc[r - 1];
			if (r) reverseKeys.push(k);
			keyMap.set(k, { c: command, r: r, t: button.getAttribute('data-type'), e: button });
		}

		if (!(t = values[i + 1])) continue;
		if (tooptip) _addTooltip(tooptip, s, t);
	}
}

function _addTooltip(tooptipBtn, shift, shortcut) {
	tooptipBtn.appendChild(domUtils.createElement('SPAN', { class: 'se-shortcut' }, env.cmdIcon + (shift ? env.shiftIcon : '') + '+<span class="se-shortcut-key">' + shortcut + '</span>'));
}

/**
 * @description Returns a new object with merge "a" and "b"
 * @param {Object} obj object
 * @returns {Object}
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
 * @param {Object} options Options object
 * @param {Array.<Element>} editorTargets Target textarea
 * @returns {o:Map, p:Map} {{o: options map, p: plugins map}}
 */
export function InitOptions(options, editorTargets) {
	const buttonList = options.buttonList || DEFAULT_BUTTON_LIST;
	const o = new Map();

	/** Multi root */
	if (editorTargets.length > 1) {
		if (!options.toolbar_container && !/inline|balloon/i.test(options.mode)) throw Error('[SUNEDITOR.create.fail] In multi root, The "mode" option cannot be "classic" without using the "toolbar_container" option.');
	}

	/** Base */
	const defaultMode = options.strictMode !== false;
	o.set('strictMode', {
		pluginPattern: defaultMode,
		tagFilter: defaultMode,
		formatFilter: defaultMode,
		classFilter: defaultMode,
		styleNodeFilter: defaultMode,
		attrFilter: defaultMode,
		styleFilter: defaultMode,
		...options.strictMode
	});
	o.set('mode', options.mode || 'classic'); // classic, inline, balloon, balloon-always
	o.set('externalLibs', options.externalLibs || {});
	o.set('keepStyleOnDelete', !!options.keepStyleOnDelete);
	o.set('fontSizeUnits', Array.isArray(options.fontSizeUnits) && options.fontSizeUnits.length > 0 ? options.fontSizeUnits.map((v) => v.toLowerCase()) : DEFAULT_SIZE_UNITS);
	o.set('allowedClassName', new RegExp(`${options.allowedClassName && typeof options.allowedClassName === 'string' ? options.allowedClassName + '|' : ''}${DEFAULT_CLASS_NAME}`));

	const allowedExtraTags = { ...DEFAULT_EXTRA_TAG_MAP, ...options.allowedExtraTags, '-': true };
	const extraKeys = Object.keys(allowedExtraTags);
	const allowedKeys = extraKeys.filter((k) => allowedExtraTags[k]).join('|');
	const disallowedKeys = extraKeys.filter((k) => !allowedExtraTags[k]).join('|');
	o.set('_allowedExtraTag', allowedKeys);
	o.set('_disallowedExtraTag', disallowedKeys);

	o.set('events', options.events || {});
	// text style tags
	const textTags = _mergeObject(
		{
			bold: 'strong',
			underline: 'u',
			italic: 'em',
			strike: 'del',
			subscript: 'sub',
			superscript: 'sup'
		},
		options.textTags || {}
	);
	o.set('textTags', textTags);
	o.set('_textStyleTags', Object.values(textTags).concat(['span']));
	o.set('tagStyles', { ...DEFAULT_TABLE_STYLES, ...(options.tagStyles || {}) });
	o.set('_spanStylesRegExp', new RegExp(`\\s*[^-a-zA-Z](font-family|font-size|color|background-color${options.spanStyles ? '|' + options.spanStyles : ''})\\s*:[^;]+(?!;)*`, 'gi'));
	o.set('_lineStylesRegExp', new RegExp(`\\s*[^-a-zA-Z](text-align|margin-left|margin-right${options.lineStyles ? '|' + options.lineStyles : ''})\\s*:[^;]+(?!;)*`, 'gi'));
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
	o.set('reverseCommands', ['indent-outdent'].concat(options.reverseButtons || []));
	o.set('_reverseCommandArray', ('-' + o.get('reverseCommands').join('-')).split('-'));
	if (numbers.isEven(o.get('_reverseCommandArray').length)) {
		console.warn('[SUNEDITOR.create.warning] The "reverseCommands" option is invalid, Shortcuts key may not work properly.');
	}

	// etc
	o.set('historyStackDelayTime', typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400);
	o.set('_editableClass', 'sun-editor-editable' + (o.get('_rtl') ? ' se-rtl' : ''));
	o.set('lineAttrReset', ['id'].concat(options.lineAttrReset && typeof options.lineAttrReset === 'string' ? options.lineAttrReset.toLowerCase().split('|') : []));
	o.set('printClass', typeof options.printClass === 'string' ? options.printClass : null);

	/** whitelist, blacklist */
	// default line
	o.set('defaultLine', typeof options.defaultLine === 'string' && options.defaultLine.length > 0 ? options.defaultLine : 'p');
	// element
	const elw = (typeof options.elementWhitelist === 'string' ? options.elementWhitelist : '').toLowerCase();
	o.set('elementWhitelist', elw + (elw ? '|' : '') + o.get('_allowedExtraTag'));
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

	/** __defaults */
	o.set('__defaultElementWhitelist', REQUIRED_ELEMENT_WHITELIST + '|' + (typeof options.__defaultElementWhitelist === 'string' ? options.__defaultElementWhitelist : DEFAULT_ELEMENT_WHITELIST).toLowerCase());
	o.set('__defaultAttributeWhitelist', (typeof options.__defaultAttributeWhitelist === 'string' ? options.__defaultAttributeWhitelist : DEFAULT_ATTRIBUTE_WHITELIST).toLowerCase());
	// --- create element whitelist (__defaultElementWhiteList + elementWhitelist + format[line, BrLine, Block, Closureblock, ClosureBrLine] - elementBlacklist)
	o.set('_editorElementWhitelist', o.get('elementWhitelist') === '*' ? '*' : _createWhitelist(o));

	/** Toolbar */
	o.set('toolbar_width', options.toolbar_width ? (numbers.is(options.toolbar_width) ? options.toolbar_width + 'px' : options.toolbar_width) : 'auto');
	o.set('toolbar_container', options.toolbar_container && !/inline/i.test(o.get('mode')) ? (typeof options.toolbar_container === 'string' ? _d.querySelector(options.toolbar_container) : options.toolbar_container) : null);
	o.set('toolbar_sticky', /balloon/i.test(o.get('mode')) ? -1 : options.toolbar_sticky === undefined ? 0 : /^\d+/.test(options.toolbar_sticky) ? numbers.get(options.toolbar_sticky, 0) : -1);
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
		}
	}

	/** root options */
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		InitFrameOptions(editorTargets[i].options || {}, options, (editorTargets[i].options = new Map()));
	}

	/** Key actions */
	o.set('tabDisable', !!options.tabDisable);
	o.set('shortcutsHint', options.shortcutsHint === undefined ? true : !!options.shortcutsHint);
	const shortcuts = !(options.shortcutsDisable === undefined ? true : !!options.shortcutsDisable)
		? {}
		: [
				{
					// default command
					selectAll: ['65', 'A'],
					bold: ['66', 'B'],
					strike: ['s83', 'S'],
					underline: ['85', 'U'],
					italic: ['73', 'I'],
					redo: ['89', 'Y', 's90', 'Z'],
					undo: ['90', 'Z'],
					indent: ['221', ']'],
					outdent: ['219', '['],
					sup: ['187', '='],
					sub: ['s187', '='],
					save: ['83', 'S'],
					// plugins
					link: ['75', 'K']
				},
				options.shortcuts || {}
		  ].reduce(function (_default, _new) {
				for (const key in _new) {
					_default[key] = _new[key];
				}
				return _default;
		  }, {});
	o.set('shortcuts', shortcuts);

	/** View */
	o.set('fullScreenOffset', options.fullScreenOffset === undefined ? 0 : /^\d+/.test(options.fullScreenOffset) ? numbers.get(options.fullScreenOffset, 0) : 0);
	o.set('previewTemplate', typeof options.previewTemplate === 'string' ? options.previewTemplate : null);
	o.set('printTemplate', typeof options.printTemplate === 'string' ? options.printTemplate : null);

	/** --- Media select */
	o.set('mediaAutoSelect', options.mediaAutoSelect === undefined ? true : !!options.mediaAutoSelect);

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
			: [_icons, options.icons].reduce(function (_default, _new) {
					for (const key in _new) {
						_default[key] = _new[key];
					}
					return _default;
			  }, {});
	o.set('icons', icons);

	return {
		o: o,
		i: icons,
		l: options.lang || _defaultLang,
		v: (options.value = typeof options.value === 'string' ? options.value : null),
		buttons: o.get('_rtl') ? buttonList.reverse() : buttonList,
		subButtons: subButtons,
		statusbarContainer: typeof options.statusbar_container === 'string' ? _d.querySelector(options.statusbar_container) : options.statusbar_container
	};
}

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
		navigation: navigation,
		charWrapper: charWrapper,
		charCounter: charCounter
	};
}

function InitFrameOptions(o, origin, fo) {
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
}

/**
 * @description Initialize property of suneditor elements
 * @param {string} key Key
 * @param {Object} options Options
 * @param {Element} topDiv Suneditor top div
 * @returns {Object} Bottom bar elements (statusbar, navigation, charWrapper, charCounter)
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
		wysiwygDiv.setAttribute('contenteditable', true);
		wysiwygDiv.setAttribute('scrolling', 'auto');
		wysiwygDiv.className += ' ' + options.get('_editableClass');
		wysiwygDiv.style.cssText = editorStyles.frame + editorStyles.editor;
	} else {
		const frameAttrs = targetOptions.get('iframe_attributes');
		for (const frameKey in frameAttrs) {
			wysiwygDiv.setAttribute(frameKey, frameAttrs[frameKey]);
		}
		wysiwygDiv.allowFullscreen = true;
		wysiwygDiv.frameBorder = 0;
		wysiwygDiv.style.cssText = editorStyles.frame;
	}

	// textarea for code view
	const textarea = domUtils.createElement('TEXTAREA', { class: 'se-wrapper-inner se-code-viewer', style: editorStyles.frame });
	let placeholder = null;
	if (targetOptions.get('placeholder')) {
		placeholder = domUtils.createElement('SPAN', { class: 'se-placeholder' });
		placeholder.innerText = targetOptions.get('placeholder');
	}

	return {
		bottomBar: CreateStatusbar(targetOptions, null),
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
 * @description create whitelist or blacklist.
 * @param {Object} o options
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
 * @description Suneditor's Default button list
 * @param {Object} options options
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
		removeFormat: ['', lang.removeFormat, 'removeFormat', '', icons.erase],
		indent: ['se-icon-flip-rtl', lang.indent, 'indent', '', isRTL ? icons.outdent : icons.indent],
		outdent: ['se-icon-flip-rtl', lang.outdent, 'outdent', '', isRTL ? icons.indent : icons.outdent],
		fullScreen: ['se-code-view-enabled se-resizing-enabled', lang.fullScreen, 'fullScreen', '', icons.expansion],
		showBlocks: ['', lang.showBlocks, 'showBlocks', '', icons.show_blocks],
		codeView: ['se-code-view-enabled se-resizing-enabled', lang.codeView, 'codeView', '', icons.code_view],
		undo: ['se-resizing-enabled', lang.undo, 'undo', '', icons.undo],
		redo: ['se-resizing-enabled', lang.redo, 'redo', '', icons.redo],
		preview: ['se-resizing-enabled', lang.preview, 'preview', '', icons.preview],
		print: ['se-resizing-enabled', lang.print, 'print', '', icons.print],
		dir: ['', lang[isRTL ? 'dir_ltr' : 'dir_rtl'], 'dir', '', icons[isRTL ? 'dir_ltr' : 'dir_rtl']],
		dir_ltr: ['', lang.dir_ltr, 'dir_ltr', '', icons.dir_ltr],
		dir_rtl: ['', lang.dir_rtl, 'dir_rtl', '', icons.dir_rtl],
		save: ['se-resizing-enabled', lang.save, 'save', '', icons.save],
		newDocument: ['se-resizing-enabled', lang.newDocument, 'newDocument', '', icons.new_document],
		selectAll: ['se-resizing-enabled', lang.selectAll, 'selectAll', '', icons.select_all]
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
	const oButton = domUtils.createElement(/^INPUT|FIELD$/i.test(dataType) ? 'DIV' : 'BUTTON', {
		type: 'button',
		class: 'se-toolbar-btn se-btn se-tooltip' + (className ? ' ' + className : ''),
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

	if (/^FIELD$/i.test(dataType)) domUtils.addClass(oLi, 'se-toolbar-hidden-btn');

	if (label) innerHTML += `<span class="se-tooltip-inner"><span class="se-tooltip-text">${label}</span></span>`;
	if (innerHTML) oButton.innerHTML = innerHTML;

	oLi.appendChild(oButton);

	return {
		li: oLi,
		button: oButton
	};
}

export function UpdateButton(element, plugin, icons, lang) {
	if (!element) return;

	const noneInner = plugin.inner === false;

	element.innerHTML = noneInner
		? ''
		: (plugin.inner || icons[plugin.icon] || plugin.icon || '<span class="se-icon-text">!</span>') + '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + (lang[plugin.title] || plugin.title) + '</span></span>';

	element.setAttribute('aria-label', plugin.title);

	if (plugin.type) {
		element.setAttribute('data-type', plugin.type);
	}

	if (plugin.className) {
		element.className += ' ' + plugin.className;
	}

	// side, replace button
	if (plugin.afterButton) {
		domUtils.addClass(plugin.afterButton, 'se-toolbar-btn');
		element.parentElement.appendChild(plugin.afterButton);

		domUtils.addClass(element, 'se-side-btn-a');
		domUtils.addClass(plugin.afterButton, 'se-side-btn-after');
	}
	if (plugin.beforeButton) {
		domUtils.addClass(plugin.beforeButton, 'se-toolbar-btn');
		element.parentElement.insertBefore(plugin.beforeButton, element);

		if (plugin.afterButton) {
			domUtils.addClass(element, 'se-side-btn');
			domUtils.removeClass(element, 'se-side-btn-a');
		} else {
			domUtils.addClass(element, 'se-side-btn-b');
		}
		domUtils.addClass(plugin.beforeButton, 'se-side-btn-before');
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
			if (element.hasAttribute('disabled')) inputTarget.setAttribute('disabled', true);
		}
	}
}

/**
 * @description Create editor HTML
 * @param {Array} buttonList option.buttonList
 * @param {Object|null} plugins Plugins
 * @param {Array} options options
 * @param {Object} icons icons
 * @param {Object} lang lang
 * @param {boolean} isUpdate Is update
 * @returns {Object} { element: (Element) Toolbar element, plugins: (Array|null) Plugins Array, pluginCallButtons: (Object), responsiveButtons: (Array) }
 */
export function CreateToolBar(buttonList, plugins, options, icons, lang, isUpdate) {
	/** create button list */
	buttonList = JSON.parse(JSON.stringify(buttonList));
	const defaultButtonList = _defaultButtons(options, icons, lang);
	const pluginCallButtons = {};
	const responsiveButtons = [];
	const updateButtons = [];

	let modules = null;
	let button = null;
	let plugin = null;
	let moduleElement = null;
	let buttonElement = null;
	let vertical = false;
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

			if (vertical) {
				const sv = separator_vertical.cloneNode(false);
				buttonTray.appendChild(sv);
			}

			buttonTray.appendChild(moduleElement.div);
			vertical = true;
		} else if (/^\/$/.test(buttonGroup)) {
			/** line break  */
			const enterDiv = domUtils.createElement('DIV', { class: 'se-btn-module-enter' });
			buttonTray.appendChild(enterDiv);
			vertical = false;
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
