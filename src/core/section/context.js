import { get as getNumber } from '../../helper/numbers';

/**
 * @typedef {Map<string, *>} FrameOptions
 * @property {string} value - Initial value for the editor.
 * @property {string} placeholder - Placeholder text.
 * @property {Object.<string, string|number>} editableFrameAttributes - Attributes for the editable frame.
 * @property {string} width - Width for the editor (e.g., '100%', '600px').
 * @property {string} minWidth - Minimum width for the editor.
 * @property {string} maxWidth - Maximum width for the editor.
 * @property {string} height - Height for the editor (e.g., 'auto', '400px').
 * @property {string} minHeight - Minimum height for the editor.
 * @property {string} maxHeight - Maximum height for the editor.
 * @property {string} _defaultStyles - Computed default styles for the editor.
 * @property {boolean} iframe - Whether to use an iframe for the editor.
 * @property {boolean} iframe_fullPage - Whether to allow full-page HTML inside the iframe.
 * @property {Object.<string, string|number>} iframe_attributes - Attributes applied to the iframe.
 * @property {Array<string>|null} iframe_cssFileName - CSS files applied inside the iframe.
 * @property {boolean} statusbar - Whether the status bar is enabled.
 * @property {boolean} statusbar_showPathLabel - Whether to show the current node structure in the status bar.
 * @property {boolean} statusbar_resizeEnable - Whether resizing via the status bar is enabled.
 * @property {boolean} charCounter - Whether character count display is enabled.
 * @property {number|null} charCounter_max - Maximum allowed characters in the editor.
 * @property {string|null} charCounter_label - Label text for the character counter.
 * @property {"char"|"byte"|"byte-html"} charCounter_type - Defines how the character counter is calculated.
 */

/**
 * @typedef {Map<string, *>} FrameContext
 * @property {string} key The root key identifier
 * @property {FrameOptions} options Editor frame options map
 * @property {Element} originElement The original target element
 * @property {Element} topArea The top area of the editor
 * @property {Element} container The editor container element
 * @property {Element} wrapper The editor wrapper element
 * @property {Element} wysiwygFrame The wysiwyg frame element
 * @property {Element} wysiwyg The wysiwyg content area
 * @property {Element} codeWrapper The code view wrapper
 * @property {Element} code The code view frame
 * @property {Element|null} codeNumbers The code line numbers container
 * @property {Element} lineBreaker_t The top line breaker element
 * @property {Element} lineBreaker_b The bottom line breaker element
 * @property {Element|null} statusbar The status bar element
 * @property {boolean} isCodeView Whether the editor is in code view mode
 * @property {boolean} isFullScreen Whether the editor is in full-screen mode
 * @property {boolean} isReadOnly Whether the editor is in read-only mode
 * @property {boolean} isDisabled Whether the editor is disabled
 * @property {number} isChanged Change tracking flag (-1 for initial state)
 * @property {number} historyIndex The index of the current history state
 * @property {number} savedIndex The index of the last saved history state
 * @property {Element} eventWysiwyg Editable element for event delegation (isIframe ? fc.get('_ww') : fc.get('wysiwyg'))
 */

/**
 * @typedef {Map<string, *>} Context
 * @property {Element} menuTray The menu tray element
 * @property {Element} toolbar.main The main toolbar frame
 * @property {Element} toolbar.buttonTray The toolbar button tray
 * @property {Element} toolbar._arrow The toolbar arrow
 * @property {Element} [toolbar.sub.main] The sub-toolbar frame
 * @property {Element} [toolbar.sub.buttonTray] The sub-toolbar button tray
 * @property {Element} [toolbar.sub._arrow] The sub-toolbar arrow
 * @property {Element} [toolbar.sub._wrapper] The sub-toolbar wrapper element
 * @property {Element} [toolbar._wrapper] The main toolbar wrapper
 * @property {Element} [_stickyDummy] The sticky toolbar placeholder
 * @property {Element} [statusbar._wrapper] The status bar wrapper element
 */

/**
 * @description Elements and variables you should have
 * @param {Element} editorTargets Target textarea
 * @param {Element} top Editor top area
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeWrapper Editor code view wrapper
 * @param {Element} codeFrame Editor code view frame
 * @param {{inner: Element, page: Element, pageMirror: Element}} documentTypeInner Document type elements
 * @param {Element|null} statusbar Editor statusbar
 * @param {*} key root key
 * @returns {FrameContext}
 */
export function CreateFrameContext(editorTarget, top, wwFrame, codeWrapper, codeFrame, statusbar, documentTypeInner, key) {
	const m = new Map([
		['key', key],
		['options', editorTarget.options],
		['originElement', editorTarget.target],
		['topArea', top],
		['container', top.querySelector('.se-container')],
		['wrapper', top.querySelector('.se-wrapper')],
		['documentTypeInner', documentTypeInner.inner],
		['documentTypePage', documentTypeInner.page],
		['documentTypePageMirror', documentTypeInner.pageMirror],
		['wysiwygFrame', wwFrame],
		['wysiwyg', wwFrame], // options.iframe ? wwFrame.contentDocument.body : wwFrame
		['codeWrapper', codeWrapper],
		['code', codeFrame],
		['codeNumbers', codeWrapper?.querySelector('.se-code-view-line')],
		['lineBreaker_t', top.querySelector('.se-line-breaker-component-t')],
		['lineBreaker_b', top.querySelector('.se-line-breaker-component-b')],
		['_stickyDummy', top.querySelector('.se-toolbar-sticky-dummy')],
		['_toolbarShadow', top.querySelector('.se-toolbar-shadow')],
		['_minHeight', getNumber(wwFrame.style.minHeight || '65', 0)],
		['isCodeView', false],
		['isFullScreen', false],
		['isReadOnly', false],
		['isDisabled', false],
		['isChanged', -1],
		['historyIndex', -1],
		['savedIndex', -1],
		['eventwysiwyg', null]
	]);

	if (statusbar) UpdateStatusbarContext(statusbar, m);

	const placeholder = top.querySelector('.se-placeholder');
	if (placeholder) m.set('placeholder', placeholder);

	return m;
}

/**
 * @description Update statusbar context
 * @param {Element} statusbar Statusbar element
 * @param {FrameContext} mapper FrameContext map
 */
export function UpdateStatusbarContext(statusbar, mapper) {
	statusbar ? mapper.set('statusbar', statusbar) : mapper.delete('statusbar');
	const navigation = statusbar ? statusbar.querySelector('.se-navigation') : null;
	const charWrapper = statusbar ? statusbar.querySelector('.se-char-counter-wrapper') : null;
	const charCounter = statusbar ? statusbar.querySelector('.se-char-counter-wrapper .se-char-counter') : null;
	navigation ? mapper.set('navigation', navigation) : mapper.delete('navigation');
	charWrapper ? mapper.set('charWrapper', charWrapper) : mapper.delete('charWrapper');
	charCounter ? mapper.set('charCounter', charCounter) : mapper.delete('charCounter');
}

/**
 * @description Common elements and variables you should have
 * @param {Element} toolbar Toolbar frame
 * @param {Element|null} toolbarContainer Toolbar container
 * @param {Element} menuTray menu tray
 * @param {Element|null} subbar sub toolbar
 * @returns {Context}
 */
export function CreateContext(toolbar, toolbarContainer, menuTray, subbar, statusbarContainer) {
	const m = new Map([
		['menuTray', menuTray],
		['toolbar.main', toolbar],
		['toolbar.buttonTray', toolbar.querySelector('.se-btn-tray')],
		['toolbar._arrow', toolbar.querySelector('.se-arrow')]
	]);

	if (subbar) {
		m.set('toolbar.sub.main', subbar);
		m.set('toolbar.sub.buttonTray', subbar.querySelector('.se-btn-tray'));
		m.set('toolbar.sub._arrow', subbar.querySelector('.se-arrow'));
		m.set('toolbar.sub._wrapper', subbar.parentElement.parentElement);
	}

	if (toolbarContainer) {
		m.set('toolbar._wrapper', toolbarContainer.querySelector('.sun-editor'));
		m.set('_stickyDummy', toolbarContainer.querySelector('.se-toolbar-sticky-dummy'));
	}

	if (statusbarContainer) {
		m.set('statusbar._wrapper', statusbarContainer.querySelector('.sun-editor'));
	}

	return m;
}
