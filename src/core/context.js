import { _w } from '../helper/env';
import { get as getNumber } from '../helper/numbers';

/**
 * @description Elements and variables you should have
 * @param {Element} editorTargets Target textarea
 * @param {Element} top Editor top area
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeFrame Editor code view frame
 * @returns {Object}
 * @private
 */
export const CreateFrameContext = function (editorTarget, top, wwFrame, codeFrame) {
	return new _w.Map([
		['originElement', editorTarget.target],
		['options', editorTarget.options],
		['topArea', top],
		['container', top.querySelector('.se-container')],
		['statusbar', top.querySelector('.se-status-bar')],
		['navigation', top.querySelector('.se-status-bar .se-navigation')],
		['charWrapper', top.querySelector('.se-status-bar .se-char-counter-wrapper')],
		['charCounter', top.querySelector('.se-char-counter-wrapper .se-char-counter')],
		['editorArea', top.querySelector('.se-wrapper')],
		['wysiwygFrame', wwFrame],
		['wysiwyg', wwFrame], // options.iframe ? wwFrame.contentDocument.body , wwFrame
		['code', codeFrame],
		['placeholder', top.querySelector('.se-placeholder')],
		['lineBreaker', top.querySelector('.se-line-breaker')],
		['lineBreaker_t', top.querySelector('.se-line-breaker-component-t')],
		['lineBreaker_b', top.querySelector('.se-line-breaker-component-b')],
		['_stickyDummy', top.querySelector('.se-toolbar-sticky-dummy')],
		['_toolbarShadow', top.querySelector('.se-toolbar-shadow')],

		['_minHeight', getNumber(wwFrame.style.minHeight || '65', 0)]
	]);
};

/**
 * @description Common elements and variables you should have
 * @param {Element} toolbar Toolbar frame
 * @param {Element} carrierWrapper Carrier wrapper
 * @returns {Object}
 * @private
 */
export const CreateToolContext = function (toolbar, carrierWrapper) {
	return new _w.Map([
		['toolbar.main', toolbar],
		['toolbar._buttonTray', toolbar.querySelector('.se-btn-tray')],
		['toolbar._menuTray', toolbar.querySelector('.se-menu-tray')],
		['toolbar._arrow', toolbar.querySelector('.se-arrow')],
		['toolbar._wrapper', toolbar.parentElement.parentElement],

		['buttons.bold', toolbar.querySelector('[data-command="bold"]')],
		['buttons.underline', toolbar.querySelector('[data-command="underline"]')],
		['buttons.italic', toolbar.querySelector('[data-command="italic"]')],
		['buttons.strike', toolbar.querySelector('[data-command="strike"]')],
		['buttons.sub', toolbar.querySelector('[data-command="SUB"]')],
		['buttons.sup', toolbar.querySelector('[data-command="SUP"]')],
		['buttons.undo', toolbar.querySelector('[data-command="undo"]')],
		['buttons.redo', toolbar.querySelector('[data-command="redo"]')],
		['buttons.save', toolbar.querySelector('[data-command="save"]')],
		['buttons.outdent', toolbar.querySelector('[data-command="outdent"]')],
		['buttons.indent', toolbar.querySelector('[data-command="indent"]')],
		['buttons.fullScreen', toolbar.querySelector('[data-command="fullScreen"]')],
		['buttons.showBlocks', toolbar.querySelector('[data-command="showBlocks"]')],
		['buttons.codeView', toolbar.querySelector('[data-command="codeView"]')],
		['buttons.dir', toolbar.querySelector('[data-command="dir"]')],
		['buttons.dir_ltr', toolbar.querySelector('[data-command="dir_ltr"]')],
		['buttons.dir_rtl', toolbar.querySelector('[data-command="dir_rtl"]')],

		['_carrierWrapper', carrierWrapper],
		['_loading', carrierWrapper.querySelector('.se-loading-box')],
		['_resizeBackground', carrierWrapper.querySelector('.se-resizing-back')]
	]);
};
