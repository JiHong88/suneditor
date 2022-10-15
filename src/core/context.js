/**
 * @description Elements and variables you should have
 * @param {Element} toolbar Editor top div
 * @param {Element} editorTarget textarea element
 * @param {Element} wwFrame Toolbar frame
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeFrame Editor code view frame
 * @param {Element} carrierWrapper Carrier wrapper
 * * @param {JSON|Object} options Inserted options
 * @returns {Object} {Elements, variables of the editor, option}
 * @private
 */
const Context = function (editorTarget, toolbar, top, wwFrame, codeFrame, carrierWrapper, options) {
	return {
		toolbar: {
			main: toolbar,
			_buttonTray: toolbar.querySelector('.se-btn-tray'),
			_menuTray: toolbar.querySelector('.se-menu-tray'),
			_arrow: toolbar.querySelector('.se-arrow'),
			_wrapper: toolbar.parentElement.parentElement
		},
		element: {
			originElement: editorTarget,
			topArea: top,
			container: top.querySelector('.se-container'),
			statusbar: top.querySelector('.se-status-bar'),
			navigation: top.querySelector('.se-status-bar .se-navigation'),
			charWrapper: top.querySelector('.se-status-bar .se-char-counter-wrapper'),
			charCounter: top.querySelector('.se-char-counter-wrapper .se-char-counter'),
			editorArea: top.querySelector('.se-wrapper'),
			wysiwygFrame: wwFrame,
			wysiwyg: wwFrame, // options.iframe ? wwFrame.contentDocument.body : wwFrame
			code: codeFrame,
			placeholder: top.querySelector('.se-placeholder'),
			lineBreaker: top.querySelector('.se-line-breaker'),
			lineBreaker_t: top.querySelector('.se-line-breaker-component-t'),
			lineBreaker_b: top.querySelector('.se-line-breaker-component-b'),
			_stickyDummy: top.querySelector('.se-toolbar-sticky-dummy'),
			_toolbarShadow: top.querySelector('.se-toolbar-shadow')
		},
		buttons: {
			bold: toolbar.querySelector('[data-command="bold"]'),
			underline: toolbar.querySelector('[data-command="underline"]'),
			italic: toolbar.querySelector('[data-command="italic"]'),
			strike: toolbar.querySelector('[data-command="strike"]'),
			sub: toolbar.querySelector('[data-command="SUB"]'),
			sup: toolbar.querySelector('[data-command="SUP"]'),
			undo: toolbar.querySelector('[data-command="undo"]'),
			redo: toolbar.querySelector('[data-command="redo"]'),
			save: toolbar.querySelector('[data-command="save"]'),
			outdent: toolbar.querySelector('[data-command="outdent"]'),
			indent: toolbar.querySelector('[data-command="indent"]'),
			fullScreen: toolbar.querySelector('[data-command="fullScreen"]'),
			showBlocks: toolbar.querySelector('[data-command="showBlocks"]'),
			codeView: toolbar.querySelector('[data-command="codeView"]'),
			dir: toolbar.querySelector('[data-command="dir"]'),
			dir_ltr: toolbar.querySelector('[data-command="dir_ltr"]'),
			dir_rtl: toolbar.querySelector('[data-command="dir_rtl"]')
		},
		options: options,
		_carrierWrapper: carrierWrapper,
		_loading: carrierWrapper.querySelector('.se-loading-box'),
		_resizeBackground: carrierWrapper.querySelector('.se-resizing-back')
	};
};

export default Context;
