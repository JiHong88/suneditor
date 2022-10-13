/**
 * @description Elements and variables you should have
 * @param {Element} editorTarget textarea element
 * @param {Element} top Editor top div
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeFrame Editor code view frame
 * * @param {JSON|Object} options Inserted options
 * @returns {Object} {Elements, variables of the editor, option}
 * @private
 */
const Context = function (editorTarget, top, wwFrame, codeFrame, options) {
	return {
		toolbar: {
			main: top.querySelector('.se-toolbar'),
			buttonTray: top.querySelector('.se-toolbar .se-btn-tray'),
			_menuTray: top.querySelector('.se-toolbar .se-menu-tray'),
			_arrow: top.querySelector('.se-toolbar .se-arrow')
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
			wysiwyg: wwFrame, // if (options.iframe) cons._wysiwygArea.contentDocument.body
			code: codeFrame,
			placeholder: top.querySelector('.se-placeholder'),
			loading: top.querySelector('.se-loading-box'),
			lineBreaker: top.querySelector('.se-line-breaker'),
			lineBreaker_t: top.querySelector('.se-line-breaker-component-t'),
			lineBreaker_b: top.querySelector('.se-line-breaker-component-b'),
			resizeBackground: top.querySelector('.se-resizing-back'),
			_toolbarShadow: top.querySelector('.se-toolbar-shadow'),
			_stickyDummy: top.querySelector('.se-toolbar-sticky-dummy')
		},
		buttons: {
			bold: top.querySelector('.se-toolbar [data-command="bold"]'),
			underline: top.querySelector('.se-toolbar [data-command="underline"]'),
			italic: top.querySelector('.se-toolbar [data-command="italic"]'),
			strike: top.querySelector('.se-toolbar [data-command="strike"]'),
			sub: top.querySelector('.se-toolbar [data-command="SUB"]'),
			sup: top.querySelector('.se-toolbar [data-command="SUP"]'),
			undo: top.querySelector('.se-toolbar [data-command="undo"]'),
			redo: top.querySelector('.se-toolbar [data-command="redo"]'),
			save: top.querySelector('.se-toolbar [data-command="save"]'),
			outdent: top.querySelector('.se-toolbar [data-command="outdent"]'),
			indent: top.querySelector('.se-toolbar [data-command="indent"]'),
			fullScreen: top.querySelector('.se-toolbar [data-command="fullScreen"]'),
			showBlocks: top.querySelector('.se-toolbar [data-command="showBlocks"]'),
			codeView: top.querySelector('.se-toolbar [data-command="codeView"]'),
			dir: top.querySelector('.se-toolbar [data-command="dir"]'),
			dir_ltr: top.querySelector('.se-toolbar [data-command="dir_ltr"]'),
			dir_rtl: top.querySelector('.se-toolbar [data-command="dir_rtl"]')
		},
		options: options
	};
};

export default Context;
