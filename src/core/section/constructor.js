import _icons from '../../assets/icons/defaultIcons';
import _defaultLang from '../../langs/en';
import { CreateContext } from '../schema/context';
import { CreateFrameContext } from '../schema/frameContext';
import { dom, numbers, converter, env } from '../../helper';
import { DEFAULTS } from '../schema/options';

const _d = env._d;

/**
 * @typedef {import('../schema/options').AllBaseOptions} AllBaseOptions_constructor
 */

/**
 * @typedef {Object} ConstructorReturnType
 * @property {SunEditor.Context} context - Editor context object
 * @property {HTMLElement} carrierWrapper - Carrier wrapper element
 * @property {Map<string, *>} options - Processed editor options (`Map`)
 * @property {Object<string, *>} plugins - Loaded plugins
 * @property {Object<string, string>} icons - Icon set
 * @property {Object<string, string>} lang - Language pack
 * @property {?string} value - Initial editor value
 * @property {?string} rootId - Root frame ID
 * @property {Array<string|null>} rootKeys - Array of frame keys
 * @property {Map<string|null, ReturnType<import('../schema/frameContext').CreateFrameContext>>} frameRoots - Map of frame contexts
 * @property {Object<string, Array<HTMLElement>>} pluginCallButtons - Plugin toolbar buttons
 * @property {Array<HTMLElement>} responsiveButtons - Responsive toolbar buttons
 * @property {Object<string, Array<HTMLElement>>|[]} pluginCallButtons_sub - Sub-toolbar plugin buttons
 * @property {Array<HTMLElement>} responsiveButtons_sub - Sub-toolbar responsive buttons
 */

/**
 * @description Creates a new SunEditor instance with specified options.
 * @param {Array<{target: Element, key: *, options: SunEditor.InitFrameOptions}>} editorTargets - Target element or multi-root object.
 * @param {SunEditor.InitOptions} options - Configuration options for the editor.
 * @returns {ConstructorReturnType} - SunEditor instance with context, options, and DOM elements.
 */
function Constructor(editorTargets, options) {
	if (typeof options !== 'object') options = /** @type {SunEditor.InitOptions} */ ({});

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
	const loadingBox = dom.utils.createElement('DIV', { class: 'se-loading-box sun-editor-common' }, '<div class="se-loading-effect"></div>');

	/** --- carrier wrapper --------------------------------------------------------------- */
	const editor_carrier_wrapper = dom.utils.createElement('DIV', { class: 'sun-editor sun-editor-carrier-wrapper sun-editor-common' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') });
	// menuTray
	const menuTray = dom.utils.createElement('DIV', { class: 'se-menu-tray' });
	editor_carrier_wrapper.appendChild(menuTray);
	// focus temp element
	const focusTemp = /** @type {HTMLInputElement} */ (
		dom.utils.createElement('INPUT', {
			class: '__se__focus__temp__',
			style: 'position: fixed !important; top: -10000px !important; left: -10000px !important; display: block !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important;',
		})
	);
	focusTemp.tabIndex = 0;
	editor_carrier_wrapper.appendChild(focusTemp);

	// modal
	const modal = dom.utils.createElement('DIV', { class: 'se-modal se-modal-area sun-editor-common' });
	const modal_back = dom.utils.createElement('DIV', { class: 'se-modal-back' });
	const modal_inner = dom.utils.createElement('DIV', { class: 'se-modal-inner' });
	modal.appendChild(modal_back);
	modal.appendChild(modal_inner);
	editor_carrier_wrapper.appendChild(modal);

	// alert
	const alert = dom.utils.createElement('DIV', { class: 'se-alert se-modal-area sun-editor-common', style: 'display: none;' });
	const alert_back = dom.utils.createElement('DIV', { class: 'se-modal-back' });
	const alert_inner = dom.utils.createElement('DIV', { class: 'se-modal-inner' });
	alert.appendChild(alert_back);
	alert.appendChild(alert_inner);
	editor_carrier_wrapper.appendChild(alert);

	// loding box, resizing back
	editor_carrier_wrapper.appendChild(dom.utils.createElement('DIV', { class: 'se-back-wrapper' }));
	editor_carrier_wrapper.appendChild(loadingBox.cloneNode(true));

	// drag cursor
	const dragCursor = dom.utils.createElement('DIV', { class: 'se-drag-cursor' });
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
		toolbar.appendChild(dom.utils.createElement('DIV', { class: 'se-arrow' }));
	}

	/** --- subToolbar --------------------------------------------------------------- */
	if (optionMap.subButtons) {
		sub_main = CreateToolBar(optionMap.subButtons, plugins, o, icons, lang, false);
		subbar = sub_main.element;
		subbar.style.visibility = 'hidden';
		// subbar mode must be balloon-*
		subbar.className += ' se-toolbar-balloon se-toolbar-sub';
		subbar.style.width = o.get('toolbar_sub_width');
		subbar.appendChild(dom.utils.createElement('DIV', { class: 'se-arrow' }));
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
		const top_div = dom.utils.createElement('DIV', { class: 'sun-editor' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') });
		const container = dom.utils.createElement('DIV', { class: 'se-container' });
		const editor_div = dom.utils.createElement('DIV', { class: 'se-wrapper' + (o.get('type') === 'document' ? ' se-type-document' : '') + (o.get('_type_options').includes('header') ? ' se-type-document-header' : '') });

		container.appendChild(dom.utils.createElement('DIV', { class: 'se-toolbar-shadow' }));

		// init element
		const initElements = _initTargetElements(editTarget.key, o, top_div, to);
		const bottomBar = initElements.bottomBar;
		const statusbar = bottomBar.statusbar;
		const wysiwyg_div = initElements.wysiwygFrame;
		const placeholder_span = initElements.placeholder;
		let textarea = initElements.codeView;

		// line breaker
		const line_breaker_t = dom.utils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-t', title: lang.insertLine }, icons.line_break);
		const line_breaker_b = dom.utils.createElement('DIV', { class: 'se-line-breaker-component se-line-breaker-component-b', title: lang.insertLine }, icons.line_break);

		editor_div.appendChild(line_breaker_t);
		editor_div.appendChild(line_breaker_b);

		// append container
		if (placeholder_span) editor_div.appendChild(placeholder_span);
		container.appendChild(dom.utils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
		container.appendChild(editor_div);

		// statusbar
		if (statusbar) {
			if (statusbarContainer) {
				if (!default_status_bar) {
					statusbarContainer.appendChild(dom.utils.createElement('DIV', { class: 'sun-editor' + o.get('_themeClass') }, statusbar));
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
		const codeWrapper = dom.utils.createElement('DIV', { class: 'se-code-wrapper' }, textarea);
		codeWrapper.style.setProperty('display', 'none', 'important');
		editor_div.appendChild(codeWrapper);

		// check code mirror
		const codeMirrorEl = _checkCodeMirror(o, to, textarea);
		// not used code mirror
		if (textarea === codeMirrorEl) {
			// add line nubers
			const codeNumbers = dom.utils.createElement('TEXTAREA', { class: 'se-code-view-line', readonly: 'true' }, null);
			codeWrapper.insertBefore(codeNumbers, textarea);
		} else {
			textarea = codeMirrorEl;
		}

		// document type
		const documentTypeInner = { inner: null, page: null, pageMirror: null };
		if (o.get('_type_options').includes('header')) {
			documentTypeInner.inner = dom.utils.createElement('DIV', { class: 'se-document-lines', style: `height: ${to.get('height')};` }, '<div class="se-document-lines-inner"></div>');
		}
		if (o.get('_type_options').includes('page')) {
			documentTypeInner.page = dom.utils.createElement('DIV', { class: 'se-document-page' }, null);
			documentTypeInner.pageMirror = dom.utils.createElement(
				'DIV',
				{
					class: 'sun-editor-editable se-document-page-mirror-a4',
					style: `position: absolute; width: 21cm; columns: 21cm; border: 0; overflow: hidden; height: auto; top: -10000px; left: -10000px;`,
				},
				null,
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
		const top_div = dom.utils.createElement('DIV', { class: 'sun-editor' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') });
		const container = dom.utils.createElement('DIV', { class: 'se-container' });
		container.appendChild(toolbar);
		if (subbar) container.appendChild(subbar);
		top_div.appendChild(container);
		toolbar_container.appendChild(top_div);
		toolbar_container.appendChild(dom.utils.createElement('DIV', { class: 'se-toolbar-sticky-dummy' }));
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
		responsiveButtons_sub: sub_main ? sub_main.responsiveButtons : [],
	};
}

/**
 * @description Create shortcuts desc span.
 * @param {string} command Command string
 * @param {Array<string>} values `options.shortcuts[command]`
 * @param {?Element} button Command button element
 * @param {Map<string, *>} keyMap Map to store shortcut key info
 * @param {Array} rc `_reverseCommandArray` option
 * @param {Set} reverseKeys Reverse key array
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
			// plugin key, method
			plugin = command;
			method = a.pop().trim().substring(1);
		} else if (method.startsWith('$~')) {
			// custom key, plugin method
			const a_ = a.pop().trim().substring(2).split('.');
			plugin = a_[0];
			method = a_[1];
		} else if (method.startsWith('$')) {
			// directly method
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

		v = v.split('|');
		for (let j = 0, len = v.length; j < len; j++) {
			k = c ? v[j] + (s ? '1000' : '') : v[j];
			if (!keyMap.has(k)) {
				r = rc.indexOf(command);
				r = r === -1 ? '' : numbers.isOdd(r) ? rc[r + 1] : rc[r - 1];
				if (r) reverseKeys.add(k);

				keyMap.set(k, { c, s, edge, space, enter, textTrigger, plugin, command, method, r, type: button?.getAttribute('data-type'), button, key: k });
			}
		}

		if (!(t = values[i + 1])) continue;
		if (tooptip) _addTooltip(tooptip, s, t);
	}
}

function _addTooltip(tooptipBtn, shift, shortcut) {
	tooptipBtn.appendChild(dom.utils.createElement('SPAN', { class: 'se-shortcut' }, env.cmdIcon + (shift ? env.shiftIcon : '') + '+<span class="se-shortcut-key">' + shortcut + '</span>'));
}

/**
 * @description Returns a new object with merge `a` and `b`
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
 * @typedef {Object} InitOptionsReturnType
 * @property {Map<string, *>} o - Processed base options (`Map` containing {@link AllBaseOptions_constructor} keys)
 * @property {Object<string, string>} i - Icon set
 * @property {Object<string, string>} l - Language pack
 * @property {?string} v - Initial editor value
 * @property {SunEditor.UI.ButtonList} buttons - Toolbar button list (arrays for groups, strings for single buttons)
 * @property {?SunEditor.UI.ButtonList} subButtons - Sub-toolbar button list
 * @property {?Element} statusbarContainer - Container element for status bar (if specified)
 * @property {Map<string|null, SunEditor.FrameOptions>} frameMap - Map of frame-specific options (frame key => `SunEditor.FrameOptions`)
 */

/**
 * @description Initialize options
 * @param {SunEditor.InitOptions} options Configuration options for the editor.
 * @param {Array<{target: Element, key: *, options: SunEditor.InitFrameOptions}>} editorTargets Target textarea
 * @param {Object<string, *>} plugins Plugins object
 * @returns {InitOptionsReturnType} Initialized options and configuration
 */
export function InitOptions(options, editorTargets, plugins) {
	const buttonList = options.buttonList || DEFAULTS.BUTTON_LIST;
	const o = new Map();

	/** Multi root */
	if (editorTargets.length > 1) {
		if (!options.toolbar_container && !/inline|balloon/i.test(options.mode)) throw Error('[SUNEDITOR.create.fail] In multi root, The "mode" option cannot be "classic" without using the "toolbar_container" option.');
	}

	// migration data-.+
	o.set('v2Migration', !!options.v2Migration);

	/** Base */
	o.set('buttons', new Set(buttonList.toString().split(',')));
	o.set('strictMode', {
		tagFilter: true,
		formatFilter: true,
		classFilter: true,
		textStyleTagFilter: true,
		attrFilter: true,
		styleFilter: true,
		...(typeof options.strictMode === 'boolean' ? {} : options.strictMode),
	});
	o.set('freeCodeViewMode', !!options.freeCodeViewMode);
	o.set('__lineFormatFilter', options.__lineFormatFilter ?? true);
	o.set('__pluginRetainFilter', options.__pluginRetainFilter ?? true);
	o.set('mode', options.mode || 'classic'); // classic, inline, balloon, balloon-always
	o.set('type', options.type?.split(':')[0] || ''); // document:header,page
	o.set('theme', options.theme || '');
	o.set('_themeClass', options.theme ? ` se-theme-${options.theme}` : '');
	o.set('_type_options', options.type?.split(':')[1] || '');
	o.set('externalLibs', options.externalLibs || {});
	o.set('fontSizeUnits', Array.isArray(options.fontSizeUnits) && options.fontSizeUnits.length > 0 ? options.fontSizeUnits.map((v) => v.toLowerCase()) : DEFAULTS.SIZE_UNITS);
	o.set('allowedClassName', new RegExp(`${options.allowedClassName && typeof options.allowedClassName === 'string' ? options.allowedClassName + '|' : ''}${DEFAULTS.CLASS_NAME}`));
	o.set('closeModalOutsideClick', !!options.closeModalOutsideClick);

	// format
	o.set('copyFormatKeepOn', !!options.copyFormatKeepOn);
	o.set('syncTabIndent', options.syncTabIndent ?? true);

	// auto convert on paste
	o.set('autoLinkify', options.autoLinkify ?? !!plugins.link);
	o.set('autoStyleify', Array.isArray(options.autoStyleify) ? options.autoStyleify : ['bold', 'underline', 'italic', 'strike']);

	let retainStyleMode = options.retainStyleMode || 'repeat';
	if (typeof retainStyleMode === 'string' && !DEFAULTS.RETAIN_STYLE_MODE.includes(retainStyleMode)) {
		console.error(`Invalid retainStyleMode: ${retainStyleMode}. Valid options are ${DEFAULTS.RETAIN_STYLE_MODE.join(', ')}. Using default 'repeat'.`);
		retainStyleMode = 'repeat';
	}
	o.set('retainStyleMode', retainStyleMode);

	const allowedExtraTags = { ...DEFAULTS.EXTRA_TAG_MAP, ...options.allowedExtraTags, '-': true };
	const extraKeys = Object.keys(allowedExtraTags);
	const allowedKeys = extraKeys.filter((k) => allowedExtraTags[k]).join('|');
	const disallowedKeys = extraKeys.filter((k) => !allowedExtraTags[k]).join('|');
	o.set('_allowedExtraTag', allowedKeys);
	o.set('_disallowedExtraTag', disallowedKeys);

	o.set('events', options.events || {});

	// text style tags
	o.set('textStyleTags', (typeof options.__textStyleTags === 'string' ? options.__textStyleTags : DEFAULTS.TEXT_STYLE_TAGS) + (options.textStyleTags ? '|' + options.textStyleTags : ''));
	const textTags = _mergeObject(
		{
			bold: 'strong',
			underline: 'u',
			italic: 'em',
			strike: 'del',
			subscript: 'sub',
			superscript: 'sup',
		},
		options.convertTextTags || {},
	);
	o.set('convertTextTags', textTags);
	o.set('_textStyleTags', Object.values(textTags).concat(['span', 'li']));
	o.set(
		'tagStyles',
		[{ ...DEFAULTS.TAG_STYLES, ...(options.__tagStyles || {}) }, options.tagStyles || {}].reduce((_default, _new) => {
			for (const key in _new) {
				_default[key] = _new[key];
			}
			return _default;
		}, {}),
	);
	o.set('_textStylesRegExp', new RegExp(`\\s*[^-a-zA-Z](${DEFAULTS.SPAN_STYLES}${options.spanStyles ? '|' + options.spanStyles : ''})\\s*:[^;]+(?!;)*`, 'gi'));
	o.set('_lineStylesRegExp', new RegExp(`\\s*[^-a-zA-Z](${DEFAULTS.LINE_STYLES}${options.lineStyles ? '|' + options.lineStyles : ''})\\s*:[^;]+(?!;)*`, 'gi'));
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
		sup: textTags.superscript,
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
			sup: 'superscript',
		}),
	);
	o.set('_defaultTagCommand', {
		bold: textTags.bold,
		underline: textTags.underline,
		italic: textTags.italic,
		strike: textTags.strike,
		subscript: textTags.sub,
		superscript: textTags.sup,
	});
	// text direction
	o.set('textDirection', options.textDirection ?? 'ltr');
	o.set('_rtl', o.get('textDirection') === 'rtl');
	// An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
	o.set('reverseCommands', ['indent-outdent'].concat(options.reverseButtons || []));
	o.set('_reverseCommandArray', ('-' + o.get('reverseCommands').join('-')).split('-'));
	if (numbers.isEven(o.get('_reverseCommandArray').length)) {
		console.warn('[SUNEDITOR.create.warning] The "reverseCommands" option is invalid, Shortcuts key may not work properly.');
	}

	// etc
	o.set('historyStackDelayTime', typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400);
	o.set('_editableClass', 'sun-editor-editable' + o.get('_themeClass') + (o.get('_rtl') ? ' se-rtl' : '') + (o.get('type') === 'document' ? ' se-type-document-editable-a4' : ''));
	o.set('lineAttrReset', ['id'].concat(options.lineAttrReset && typeof options.lineAttrReset === 'string' ? options.lineAttrReset.toLowerCase().split('|') : []));
	o.set('printClass', typeof options.printClass === 'string' ? options.printClass + ' ' + o.get('_editableClass') : null);

	/** whitelist, blacklist */
	// default line
	o.set('defaultLine', typeof options.defaultLine === 'string' && options.defaultLine.length > 0 ? options.defaultLine : 'p');
	o.set('defaultLineBreakFormat', options.defaultLineBreakFormat || 'line');
	o.set('scopeSelectionTags', options.scopeSelectionTags || DEFAULTS.SCOPE_SELECTION_TAGS);
	// element
	const elw = (typeof options.elementWhitelist === 'string' ? options.elementWhitelist : '').toLowerCase();
	const mjxEls = o.get('externalLibs').mathjax ? DEFAULTS.CLASS_MJX + '|' : '';
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
			(options.__defaultFormatClosureBrLine = typeof options.__defaultFormatClosureBrLine === 'string' ? options.__defaultFormatClosureBrLine : DEFAULTS.FORMAT_CLOSURE_BR_LINE).toLowerCase(),
			o.get('elementBlacklist'),
		),
	);
	o.set(
		'formatBrLine',
		_createFormatInfo(
			(options.formatBrLine || '') + '|' + o.get('formatClosureBrLine').str,
			(options.__defaultFormatBrLine = typeof options.__defaultFormatBrLine === 'string' ? options.__defaultFormatBrLine : DEFAULTS.FORMAT_BR_LINE).toLowerCase(),
			o.get('elementBlacklist'),
		),
	);
	o.set(
		'formatLine',
		_createFormatInfo(
			DEFAULTS.REQUIRED_FORMAT_LINE + '|' + (options.formatLine || '') + '|' + o.get('formatBrLine').str,
			(options.__defaultFormatLine = typeof options.__defaultFormatLine === 'string' ? options.__defaultFormatLine : DEFAULTS.FORMAT_LINE).toLowerCase(),
			o.get('elementBlacklist'),
		),
	);

	// Error - default line
	if (!o.get('formatLine').reg.test(o.get('defaultLine'))) {
		throw Error(`[SUNEDITOR.create.fail] The "defaultLine(${o.get('defaultLine')})" option must be included in the "formatLine(${o.get('formatLine').str})" option.`);
	}

	o.set(
		'formatClosureBlock',
		_createFormatInfo(
			options.formatClosureBlock,
			(options.__defaultFormatClosureBlock = typeof options.__defaultFormatClosureBlock === 'string' ? options.__defaultFormatClosureBlock : DEFAULTS.FORMAT_CLOSURE_BLOCK).toLowerCase(),
			o.get('elementBlacklist'),
		),
	);
	o.set(
		'formatBlock',
		_createFormatInfo(
			(options.formatBlock || '') + '|' + o.get('formatClosureBlock').str,
			(options.__defaultFormatBlock = typeof options.__defaultFormatBlock === 'string' ? options.__defaultFormatBlock : DEFAULTS.FORMAT_BLOCK).toLowerCase(),
			o.get('elementBlacklist'),
		),
	);

	o.set('allowedEmptyTags', DEFAULTS.ALLOWED_EMPTY_NODE_LIST + (options.allowedEmptyTags ? ', ' + options.allowedEmptyTags : ''));

	/** __defaults */
	o.set('__defaultElementWhitelist', DEFAULTS.REQUIRED_ELEMENT_WHITELIST + '|' + (typeof options.__defaultElementWhitelist === 'string' ? options.__defaultElementWhitelist : DEFAULTS.ELEMENT_WHITELIST).toLowerCase());
	o.set('__defaultAttributeWhitelist', (typeof options.__defaultAttributeWhitelist === 'string' ? options.__defaultAttributeWhitelist : DEFAULTS.ATTRIBUTE_WHITELIST).toLowerCase());
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
			o.set('toolbar_sub_width', subbar.width ? (numbers.is(subbar.width) ? subbar.width + 'px' : subbar.width) : 'auto');
			subButtons = o.get('_rtl') ? subbar.buttonList.reverse() : subbar.buttonList;
			o.set('buttons_sub', new Set(subButtons.toString().split(',')));
		}
	}

	/** root options */
	const frameMap = new Map();
	for (let i = 0, len = editorTargets.length; i < len; i++) {
		frameMap.set(editorTargets[i].key, InitFrameOptions(editorTargets[i].options || /** @type {SunEditor.InitFrameOptions} */ ({}), options));
	}

	/** Key actions */
	o.set('tabDisable', !!options.tabDisable);
	o.set('shortcutsHint', options.shortcutsHint === undefined ? true : !!options.shortcutsHint);
	const shortcuts = !(options.shortcutsDisable === undefined ? true : !!options.shortcutsDisable)
		? {}
		: [
				{
					// default command
					selectAll: ['c+KeyA', 'A'],
					bold: ['c+KeyB', 'B'],
					strike: ['c+s+KeyS', 'S'],
					underline: ['c+KeyU', 'U'],
					italic: ['c+KeyI', 'I'],
					redo: ['c+KeyY', 'Y', 'c+s+KeyZ', 'Z'],
					undo: ['c+KeyZ', 'Z'],
					indent: ['c+BracketRight', ']'],
					outdent: ['c+BracketLeft', '['],
					save: ['c+KeyS', 'S'],
					// plugins
					link: ['c+KeyK', 'K'],
					hr: ['!+---+=+~shortcut', ''],
					list_numbered: ['!+1.+_+~shortcut', ''],
					list_bulleted: ['!+*.+_+~shortcut', ''],
					// custom
					_h1: ['c+s+Digit1|Numpad1+$~blockStyle.applyHeaderByShortcut', ''],
					_h2: ['c+s+Digit2|Numpad2+$~blockStyle.applyHeaderByShortcut', ''],
					_h3: ['c+s+Digit3|Numpad3+$~blockStyle.applyHeaderByShortcut', ''],
				},
				options.shortcuts || {},
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
	o.set('componentInsertBehavior', ['auto', 'select', 'line', 'none'].includes(options.componentInsertBehavior) ? options.componentInsertBehavior : 'auto');

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
			console.warn('[SUNEDITOR.options.externalLibs.codeMirror.fail] The codeMirror option is set incorrectly. See: https://github.com/ARA-developer/suneditor/blob/develop/guide/external-libraries.md');
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
	const allUsedStyles = new Set(DEFAULTS.CONTENT_STYLES.split('|'));
	const _ss = options.spanStyles?.split('|') || [];
	const _ls = o.get('__listCommonStyle');
	const _dts = DEFAULTS.SPAN_STYLES.split('|');
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
	o.set('toastMessageTime', { copy: 1500, ...options.toastMessageTime });

	return {
		o: o,
		i: icons,
		l: /** @type {Object<string, string>} */ (options.lang || _defaultLang),
		v: (options.value = typeof options.value === 'string' ? options.value : null),
		buttons: o.get('_rtl') ? buttonList.reverse() : buttonList,
		subButtons: subButtons,
		statusbarContainer: typeof options.statusbar_container === 'string' ? _d.querySelector(options.statusbar_container) : options.statusbar_container,
		frameMap: frameMap,
	};
}

/**
 * @description Create a context object for the editor frame.
 * @param {SunEditor.FrameOptions} targetOptions - `editor.frameOptions`
 * @param {HTMLElement} statusbar - statusbar element
 * @returns {{statusbar: HTMLElement, navigation: HTMLElement, charWrapper: HTMLElement, charCounter: HTMLElement}}
 */
export function CreateStatusbar(targetOptions, statusbar) {
	let navigation = null;
	let charWrapper = null;
	let charCounter = null;

	if (targetOptions.get('statusbar')) {
		statusbar ||= dom.utils.createElement('DIV', { class: 'se-status-bar sun-editor-common' });

		/** navigation */
		navigation = statusbar.querySelector('.se-navigation') || dom.utils.createElement('DIV', { class: 'se-navigation sun-editor-common' });
		statusbar.appendChild(navigation);

		/** char counter */
		if (targetOptions.get('charCounter')) {
			charWrapper = statusbar.querySelector('.se-char-counter-wrapper') || dom.utils.createElement('DIV', { class: 'se-char-counter-wrapper' });

			if (targetOptions.get('charCounter_label')) {
				const charLabel = charWrapper.querySelector('.se-char-label') || dom.utils.createElement('SPAN', { class: 'se-char-label' });
				charLabel.textContent = targetOptions.get('charCounter_label');
				charWrapper.appendChild(charLabel);
			}

			charCounter = charWrapper.querySelector('.se-char-counter') || dom.utils.createElement('SPAN', { class: 'se-char-counter' });
			charCounter.textContent = '0';
			charWrapper.appendChild(charCounter);

			if (targetOptions.get('charCounter_max') > 0) {
				const char_max = charWrapper.querySelector('.se-char-max') || dom.utils.createElement('SPAN', { class: 'se-char-max' });
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
		charCounter: /** @type {HTMLElement} */ (charCounter),
	};
}

/**
 * @description Initialize options.
 * @param {SunEditor.InitFrameOptions} o - Target options
 * @param {SunEditor.InitOptions} origin - Full options
 * @returns {SunEditor.FrameOptions} Processed frame options `Map`
 */
function InitFrameOptions(o, origin) {
	const fo = /** @type {SunEditor.FrameOptions} */ (/** @type {unknown} */ (new Map()));

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
	fo.set('editableFrameAttributes', { spellcheck: 'false', ...editableFrameAttributes });
	// styles
	fo.set('width', width ? String(numbers.is(width) ? width + 'px' : width) : '100%');
	fo.set('minWidth', minWidth ? String(numbers.is(minWidth) ? minWidth + 'px' : minWidth) : '');
	fo.set('maxWidth', maxWidth ? String(numbers.is(maxWidth) ? maxWidth + 'px' : maxWidth) : '');
	fo.set('height', height ? String(numbers.is(height) ? height + 'px' : height) : 'auto');
	fo.set('minHeight', minHeight ? String(numbers.is(minHeight) ? minHeight + 'px' : minHeight) : '');
	fo.set('maxHeight', maxHeight ? String(numbers.is(maxHeight) ? maxHeight + 'px' : maxHeight) : '');
	fo.set('editorStyle', editorStyle);
	fo.set('_defaultStyles', converter._setDefaultOptionStyle(fo, typeof editorStyle === 'string' ? editorStyle : ''));
	// iframe
	fo.set('iframe', !!(iframe_fullPage || iframe));
	fo.set('iframe_fullPage', !!iframe_fullPage);
	fo.set('iframe_attributes', iframe_attributes || {});
	fo.set('iframe_cssFileName', iframe ? (typeof iframe_cssFileName === 'string' ? [iframe_cssFileName] : iframe_cssFileName) || ['suneditor'] : null);
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
 * @description Initialize property of `suneditor` elements
 * @param {string} key - The key of the editor frame
 * @param {Map<string, *>} options - Options
 * @param {HTMLElement} topDiv - Top div
 * @param {SunEditor.FrameOptions} targetOptions - `editor.frameOptions`
 * @returns {{bottomBar: ReturnType<CreateStatusbar>, wysiwygFrame: HTMLElement, codeView: HTMLElement, placeholder: HTMLElement}}
 */
function _initTargetElements(key, options, topDiv, targetOptions) {
	const editorStyles = targetOptions.get('_defaultStyles');
	/** top div */
	topDiv.style.cssText = editorStyles.top;

	/** editor */
	// wysiwyg div or iframe
	const wysiwygDiv = dom.utils.createElement(!targetOptions.get('iframe') ? 'DIV' : 'IFRAME', {
		class: 'se-wrapper-inner se-wrapper-wysiwyg' + (options.get('type') === 'document' ? ' se-type-document-iframe-a4' : ''),
		'data-root-key': key,
	});

	if (!targetOptions.get('iframe')) {
		wysiwygDiv.setAttribute('contenteditable', 'true');
		wysiwygDiv.className += ' ' + options.get('_editableClass');
		wysiwygDiv.style.cssText = editorStyles.frame + editorStyles.editor;
	} else {
		const iframeWW = /** @type {HTMLIFrameElement} */ (wysiwygDiv);
		const frameAttrs = targetOptions.get('iframe_attributes');

		// [sandbox] prop
		let sandboxValue = frameAttrs.sandbox;
		if (sandboxValue) {
			const requiredSandbox = ['allow-same-origin'];
			const userSandbox = sandboxValue.split(/\s+/);
			const missingSandbox = requiredSandbox.filter((req) => !userSandbox.includes(req));

			if (missingSandbox.length > 0) {
				// Add missing required value
				sandboxValue = userSandbox.concat(missingSandbox).join(' ');
			}
		} else {
			sandboxValue = 'allow-same-origin';
		}

		// iframe [sandbox] attr
		iframeWW.setAttribute('sandbox', sandboxValue);

		// iframe [default border]
		iframeWW.setAttribute('frameBorder', '0');

		// iframe attr
		for (const frameKey in frameAttrs) {
			if (frameKey === 'sandbox') continue;
			iframeWW.setAttribute(frameKey, frameAttrs[frameKey]);
		}

		iframeWW.allowFullscreen = true;
		iframeWW.setAttribute('scrolling', targetOptions.get('height') === 'auto' ? 'no' : 'auto');
		iframeWW.style.cssText = editorStyles.frame;
	}

	// textarea for code view
	const textarea = dom.utils.createElement('TEXTAREA', { class: 'se-wrapper-inner se-code-viewer', style: editorStyles.frame });
	const placeholder = dom.utils.createElement('SPAN', { class: 'se-placeholder' });
	if (targetOptions.get('placeholder')) {
		placeholder.textContent = targetOptions.get('placeholder');
	}

	return {
		bottomBar: CreateStatusbar(targetOptions, null),
		wysiwygFrame: wysiwygDiv,
		codeView: textarea,
		placeholder: placeholder,
	};
}

/**
 * @description Check the `CodeMirror` option to apply the `CodeMirror` and return the `CodeMirror` element.
 * @param {Map<string, *>} options Options
 * @param {HTMLElement} textarea Textarea element
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
			state: codeMirror.state,
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
				lineWrapping: true,
			},
			codeMirror.options || {},
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
		dom.utils.removeItem(textarea);
		cmeditor.className += ' se-code-viewer-mirror';
		return cmeditor;
	}

	return textarea;
}

/**
 * @description Create blacklist
 * @param {string} blacklist Blacklist
 * @param {string} defaultLine `options.get('defaultLine')`
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
 * @description Create formats regexp object.
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
		str: str,
	};
}

/**
 * @description Create whitelist or blacklist.
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
 * @description SunEditor's default button list
 * @param {boolean} isRTL `rtl`
 */
function _defaultButtons(isRTL, icons, lang) {
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
		copy: ['', lang.copy, 'copy', '', icons.copy],
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
		pageNavigator: ['se-component-enabled', '', 'pageNavigator', 'input', ''],
	};
}

/**
 * @description Create a group div containing each module
 * @returns {{div: Element, ul: Element}}
 */
function _createModuleGroup() {
	const oUl = dom.utils.createElement('UL', { class: 'se-menu-list' });
	const oDiv = dom.utils.createElement('DIV', { class: 'se-btn-module se-btn-module-border' }, oUl);

	return {
		div: oDiv,
		ul: oUl,
	};
}

/**
 * @description Create a button element
 * @param {string} className `className` in button
 * @param {string} title Title in button
 * @param {string} dataCommand The `data-command` property of the button
 * @param {"command"|"dropdown"|"field"|"browser"|"input"|"modal"|"popup"} dataType The `data-type` property of the button
 * @param {string} innerHTML HTML in button
 * @param {string} _disabled Button `disabled`
 * @param {Object<string, string>} icons Icons
 * @returns {{li: HTMLElement, button: HTMLElement}}
 */
function _createButton(className, title, dataCommand, dataType, innerHTML, _disabled, icons) {
	innerHTML ||= '';

	const oLi = dom.utils.createElement('LI');
	const label = title || '';
	const isDiv = /^INPUT|FIELD$/i.test(dataType);
	const oButton = /** @type {HTMLButtonElement} */ (
		'se-toolbar-separator-vertical' === className
			? dom.utils.createElement('DIV', { class: className, tabindex: '-1' }, null)
			: dom.utils.createElement(isDiv ? 'DIV' : 'BUTTON', {
					class: 'se-toolbar-btn se-btn se-tooltip' + (className ? ' ' + className : ''),
					'data-command': dataCommand,
					'data-type': dataType,
					'aria-label': label.replace(/<span .+<\/span>/, ''),
					tabindex: '-1',
				})
	);

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

	if (_disabled) oButton.disabled = true;

	if (/^FIELD$/i.test(dataType)) dom.utils.addClass(oLi, 'se-toolbar-hidden-btn');

	if (label) innerHTML += dom.utils.createTooltipInner(label);
	if (innerHTML) oButton.innerHTML = innerHTML;

	oLi.appendChild(oButton);

	return {
		li: oLi,
		button: oButton,
	};
}

/**
 * @description Update a button state, attributes, and icons
 * @param {?HTMLElement} element Button element
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
		dom.utils.addClass(plugin.afterItem, 'se-toolbar-btn');
		element.parentElement.appendChild(plugin.afterItem);

		dom.utils.addClass(element, 'se-side-btn-a');
		dom.utils.addClass(plugin.afterItem, 'se-side-btn-after');
	}
	if (plugin.beforeItem) {
		dom.utils.addClass(plugin.beforeItem, 'se-toolbar-btn');
		element.parentElement.insertBefore(plugin.beforeItem, element);

		if (plugin.afterItem) {
			dom.utils.addClass(element, 'se-side-btn');
			dom.utils.removeClass(element, 'se-side-btn-a');
		} else {
			dom.utils.addClass(element, 'se-side-btn-b');
		}
		dom.utils.addClass(plugin.beforeItem, 'se-side-btn-before');
	}
	if (plugin.replaceButton) {
		element.parentElement.appendChild(plugin.replaceButton);
		element.style.display = 'none';
	}

	if (!plugin.replaceButton && /^INPUT$/i.test(element.getAttribute('data-type'))) {
		const inputTarget = element.querySelector('input');
		if (inputTarget) {
			dom.utils.addClass(inputTarget, 'se-toolbar-btn');
			inputTarget.setAttribute('data-command', element.getAttribute('data-command'));
			inputTarget.setAttribute('data-type', element.getAttribute('data-type'));
			if (element.hasAttribute('disabled')) inputTarget.disabled = true;
		}
	}
}

/**
 * @description Create editor HTML
 * @param {Array} buttonList `option.buttonList`
 * @param {?Object<string, *>} plugins Plugins
 * @param {Map<string, *>|SunEditor.Options} options Options
 * @param {Object<string, string>} icons Icons
 * @param {Object<string, string>} lang Lang
 * @param {boolean} isUpdate Is update
 * @returns {{element: HTMLElement, pluginCallButtons: Object<string, Array<HTMLElement>>, responsiveButtons: Array<HTMLElement>, buttonTray: HTMLElement, updateButtons: Array<{button: HTMLElement, plugin: *, key: string}>}}}
 */
export function CreateToolBar(buttonList, plugins, options, icons, lang, isUpdate) {
	/** create button list */
	buttonList = JSON.parse(JSON.stringify(buttonList));
	const defaultButtonList = _defaultButtons(options.get('_rtl'), icons, lang);
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
	const moreLayer = dom.utils.createElement('DIV', { class: 'se-toolbar-more-layer' });
	const buttonTray = dom.utils.createElement('DIV', { class: 'se-btn-tray' });
	const separator_vertical = dom.utils.createElement('DIV', { class: 'se-toolbar-separator-vertical' });

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
						align = button.substring(1);
						moduleElement.div.className += ' module-float-' + align;
						continue;
					}

					// rtl fix
					if (/^#/.test(button)) {
						const option = button.substring(1);
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
						if (button === 'copy' && !env.isClipboardSupported) {
							console.warn('[SUNEDITOR.constructor.warn] Clipboard is not supported in this browser. : [copy] button is not rendered.');
						}
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
					moreContainer = dom.utils.createElement('DIV');
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
			const enterDiv = dom.utils.createElement('DIV', { class: 'se-btn-module-enter' });
			buttonTray.appendChild(enterDiv);
			// vertical = false;
		}
	}

	switch (buttonTray.children.length) {
		case 0:
			buttonTray.style.display = 'none';
			break;
		case 1:
			dom.utils.removeClass(buttonTray.firstElementChild, 'se-btn-module-border');
			break;
	}

	if (moreLayer.children.length > 0) buttonTray.appendChild(moreLayer);
	if (responsiveButtons.length > 0) responsiveButtons.unshift(buttonList);

	// rendering toolbar
	const tool_bar = dom.utils.createElement('DIV', { class: 'se-toolbar sun-editor-common' + (!options.get('shortcutsHint') ? ' se-shortcut-hide' : '') }, buttonTray);

	if (options.get('toolbar_hide')) tool_bar.style.display = 'none';

	return {
		element: tool_bar,
		pluginCallButtons,
		responsiveButtons,
		buttonTray,
		updateButtons,
	};
}

export default Constructor;
