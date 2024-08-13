import { get as getNumber } from '../../helper/numbers';

/**
 * @description Elements and variables you should have
 * @param {Element} editorTargets Target textarea
 * @param {Element} top Editor top area
 * @param {Element} wwFrame Editor wysiwyg frame
 * @param {Element} codeWrapper Editor code view wrapper
 * @param {Element} codeFrame Editor code view frame
 * @param {Object} documentTypeInner Document type inner
 * @param {Element|null} statusbar Editor statusbar
 * @param {any} key root key
 * @returns {Map}
 */
export const CreateFrameContext = function (editorTarget, top, wwFrame, codeWrapper, codeFrame, statusbar, documentTypeInner, key) {
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
		['savedIndex', -1]
	]);

	if (statusbar) UpdateStatusbarContext(statusbar, m);

	const placeholder = top.querySelector('.se-placeholder');
	if (placeholder) m.set('placeholder', placeholder);

	return m;
};

/**
 * @description Update statusbar context
 * @param {Element} statusbar Statusbar element
 * @param {FrameContext} mapper FrameContext map
 */
export const UpdateStatusbarContext = function (statusbar, mapper) {
	statusbar ? mapper.set('statusbar', statusbar) : mapper.delete('statusbar');
	const navigation = statusbar ? statusbar.querySelector('.se-navigation') : null;
	const charWrapper = statusbar ? statusbar.querySelector('.se-char-counter-wrapper') : null;
	const charCounter = statusbar ? statusbar.querySelector('.se-char-counter-wrapper .se-char-counter') : null;
	navigation ? mapper.set('navigation', navigation) : mapper.delete('navigation');
	charWrapper ? mapper.set('charWrapper', charWrapper) : mapper.delete('charWrapper');
	charCounter ? mapper.set('charCounter', charCounter) : mapper.delete('charCounter');
};

/**
 * @description Common elements and variables you should have
 * @param {Element} toolbar Toolbar frame
 * @param {Element|null} toolbarContainer Toolbar container
 * @param {Element} menuTray menu tray
 * @param {Element|null} subbar sub toolbar
 * @returns {Map}
 */
export const CreateContext = function (toolbar, toolbarContainer, menuTray, subbar, statusbarContainer) {
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
};
