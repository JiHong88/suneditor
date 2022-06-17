/**
 * @description Elements and variables you should have
 * @param {Element} element textarea element
 * @param {Element} top Editor top div
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeFrame Editor code view frame
 * * @param {JSON|Object} options Inserted options
 * @returns {Object} {Elements, variables of the editor, option}
 * @private
 */
const Context = function (element, top, wwFrame, codeFrame, options) {
	return {
		element: {
			originElement: element,
			topArea: top,
			relative: top.querySelector('.se-container'),
			toolbar: top.querySelector('.se-toolbar'),
			_toolbarShadow: top.querySelector('.se-toolbar-shadow'),
			_buttonTray: top.querySelector('.se-toolbar .se-btn-tray'),
			_menuTray: top.querySelector('.se-toolbar .se-menu-tray'),
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
			_stickyDummy: top.querySelector('.se-toolbar-sticky-dummy'),
			_arrow: top.querySelector('.se-toolbar .se-arrow'),
			_modal: {
				area: top.querySelector('.se-modal'),
				back: top.querySelector('.se-modal-back'),
				inner: top.querySelector('.se-modal-inner'),
			}
		},
		buttons: {
			cover: top.querySelector('.se-toolbar .se-toolbar-cover'),
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
