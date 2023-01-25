import { _w } from '../helper/env';
import { get as getNumber } from '../helper/numbers';

/**
 * @description Elements and variables you should have
 * @param {Element} editorTargets Target textarea
 * @param {Element} top Editor top area
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeFrame Editor code view frame
 * @param {any} key root key
 * @returns {Map}
 */
export const CreateFrameContext = function (editorTarget, top, wwFrame, codeFrame, key) {
	const m = new _w.Map([
		['key', key],
		['options', editorTarget.options],
		['originElement', editorTarget.target],
		['topArea', top],
		['container', top.querySelector('.se-container')],
		['editorArea', top.querySelector('.se-wrapper')],
		['wysiwygFrame', wwFrame],
		['wysiwyg', wwFrame], // options.iframe ? wwFrame.contentDocument.body : wwFrame
		['code', codeFrame],
		['lineBreaker', top.querySelector('.se-line-breaker')],
		['lineBreaker_t', top.querySelector('.se-line-breaker-component-t')],
		['lineBreaker_b', top.querySelector('.se-line-breaker-component-b')],
		['_stickyDummy', top.querySelector('.se-toolbar-sticky-dummy')],
		['_toolbarShadow', top.querySelector('.se-toolbar-shadow')],
		['_minHeight', getNumber(wwFrame.style.minHeight || '65', 0)]
	]);

	const statusbar = top.querySelector('.se-status-bar');
	if (statusbar) {
		m.set('statusbar', statusbar);
		const navigation = top.querySelector('.se-status-bar .se-navigation');
		const charWrapper = top.querySelector('.se-status-bar .se-char-counter-wrapper');
		const charCounter = top.querySelector('.se-char-counter-wrapper .se-char-counter');
		if (navigation) m.set('navigation', navigation);
		if (charWrapper) m.set('charWrapper', charWrapper);
		if (charCounter) m.set('charCounter', charCounter);
	}

	const placeholder = top.querySelector('.se-placeholder');
	if (placeholder) m.set('placeholder', placeholder);

	return m;
};

const BASIC_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'sub', 'sup', 'undo', 'redo', 'save', 'outdent', 'indent', 'fullScreen', 'showBlocks', 'codeView', 'dir', 'dir_ltr', 'dir_rtl'];
/**
 * @description Common elements and variables you should have
 * @param {Element} toolbar Toolbar frame
 * @param {Element|null} toolbarContainer Toolbar container
 * @returns {Map}
 */
export const CreateContext = function (toolbar, toolbarContainer) {
	const m = new _w.Map([
		['toolbar.main', toolbar],
		['toolbar._buttonTray', toolbar.querySelector('.se-btn-tray')],
		['toolbar._menuTray', toolbar.querySelector('.se-menu-tray')],
		['toolbar._arrow', toolbar.querySelector('.se-arrow')],
		['toolbar._wrapper', toolbar.parentElement.parentElement],
		['_stickyDummy', toolbarContainer ? toolbarContainer.querySelector('.se-toolbar-sticky-dummy') : null]
	]);

	for (let i = 0, len = BASIC_COMMANDS.length, b; i < len; i++) {
		b = toolbar.querySelector('[data-command="' + BASIC_COMMANDS[i] + '"]');
		if (b) m.set('buttons.' + BASIC_COMMANDS[i], b);
	}

	return m;
};

/**
 * @description Update context
 * @param {Map} fc context
 * @param {Map} ctx context to change
 */
export const UpdateContextMap = function (c, ctx) {
	ctx.forEach(function (v, k) {
		if (v) c.set(k, v);
		else c.delete(k);
	});
};
