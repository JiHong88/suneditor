import { dom, env, converter, numbers } from '../../../helper';

const { _w, _d } = env;

/**
 * @description Viewer (`codeView`, `fullScreen`, `showBlocks`) class
 */
class Viewer {
	#kernel;
	#$;
	#store;

	#icons;
	#lang;
	#frameRoots;
	#context;
	#frameContext;
	#options;
	#frameOptions;
	#eventManager;

	#disallowedTagNameRegExp;

	#bodyOverflow = '';
	#editorAreaOriginCssText = '';
	#wysiwygOriginCssText = '';
	#codeWrapperOriginCssText = '';
	#codeOriginCssText = '';
	#codeNumberOriginCssText = '';
	#toolbarOriginCssText = '';
	#arrowOriginCssText = '';
	#fullScreenInnerHeight = 0;
	#fullScreenSticky = false;
	#fullScreenBalloon = false;
	#fullScreenInline = false;
	#toolbarParent = null;
	#originCssText = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#kernel = kernel;
		this.#$ = kernel.$;
		this.#store = kernel.store;

		this.#icons = this.#$.icons;
		this.#lang = this.#$.lang;
		this.#frameRoots = this.#$.frameRoots;
		this.#context = this.#$.context;
		this.#frameContext = this.#$.frameContext;
		this.#options = this.#$.options;
		this.#frameOptions = this.#$.frameOptions;
		this.#eventManager = this.#$.eventManager;

		// members
		this.#disallowedTagNameRegExp = new RegExp(`^(${this.#options.get('_disallowedExtraTag')})$`, 'i');
	}

	/**
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `codeView` mode.
	 */
	codeView(value) {
		const fc = this.#frameContext;
		if (value === undefined) value = !fc.get('isCodeView');
		if (value === fc.get('isCodeView')) return;

		fc.set('isCodeView', value);
		this.#$.ui.offCurrentController();
		this.#$.ui.offCurrentModal();

		const codeWrapper = fc.get('codeWrapper');
		const codeFrame = fc.get('code');
		const wysiwygFrame = fc.get('wysiwygFrame');
		const wrapper = fc.get('wrapper');

		if (value) {
			this.#setEditorDataToCodeView();
			codeWrapper.style.setProperty('display', 'flex', 'important');
			wysiwygFrame.style.display = 'none';

			if (fc.get('isFullScreen')) {
				codeFrame.style.height = '100%';
			} else if (this.#frameOptions.get('height') === 'auto' && !this.#options.get('hasCodeMirror')) {
				codeFrame.style.height = codeFrame.scrollHeight > 0 ? codeFrame.scrollHeight + 'px' : 'auto';
			}

			if (this.#options.get('hasCodeMirror')) {
				this._codeMirrorEditor('refresh', null, null);
			}

			if (!fc.get('isFullScreen')) {
				this.#$.ui.preventToolbarHide(true);
				if (this.#store.mode.isBalloon) {
					this.#context.get('toolbar_arrow').style.display = 'none';
					this.#context.get('toolbar_main').style.left = '';
					this.#store.mode.isInline = this.#$.toolbar.isInlineMode = true;
					this.#store.mode.isBalloon = this.#$.toolbar.isBalloonMode = false;
					this.#$.toolbar._showInline();
				}
			}

			if (this.#store.mode.isBalloon) {
				this.#$.subToolbar.hide();
			}

			CreateLineNumbers(fc);

			this.#store.set('_range', null);
			codeFrame.focus();
			dom.utils.addClass(this.#$.commandDispatcher.targets.get('codeView'), 'active');
			dom.utils.addClass(wrapper, 'se-code-view-status');
		} else {
			if (!dom.check.isNonEditable(wysiwygFrame)) this.#setCodeDataToEditor();
			wysiwygFrame.scrollTop = 0;
			codeWrapper.style.setProperty('display', 'none', 'important');
			wysiwygFrame.style.display = 'block';

			if (this.#frameOptions.get('height') === 'auto' && !this.#options.get('hasCodeMirror')) fc.get('code').style.height = '0px';

			if (!fc.get('isFullScreen')) {
				this.#$.ui.preventToolbarHide(false);
				if (/balloon/.test(this.#options.get('mode'))) {
					this.#context.get('toolbar_arrow').style.display = '';
					this.#store.mode.isInline = this.#$.toolbar.isInlineMode = false;
					this.#store.mode.isBalloon = this.#$.toolbar.isBalloonMode = true;
					this.#kernel._eventOrchestrator._hideToolbar();
				}
			}

			this.#$.focusManager.nativeFocus();
			dom.utils.removeClass(this.#$.commandDispatcher.targets.get('codeView'), 'active');

			if (!dom.check.isNonEditable(wysiwygFrame)) {
				this.#$.history.push(false);
				this.#$.history.resetButtons(fc.get('key'), null);
			}
			dom.utils.removeClass(wrapper, 'se-code-view-status');
		}

		this.#$.ui._updatePlaceholder(fc);
		this.#$.ui._toggleCodeViewButtons(value);

		// document type
		if (fc.has('documentType_use_header')) {
			if (value) {
				fc.get('documentTypeInner').style.display = 'none';
			} else {
				fc.get('documentTypeInner').style.display = '';
				fc.get('documentType').reHeader();
			}
		}

		// user event
		this.#eventManager.triggerEvent('onToggleCodeView', { frameContext: fc, is: fc.get('isCodeView') });
	}

	/**
	 * @description Changes to full screen or default screen
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `fullScreen` mode.
	 */
	fullScreen(value) {
		const fc = this.#frameContext;
		if (value === undefined) value = !fc.get('isFullScreen');
		if (value === fc.get('isFullScreen')) return;

		fc.set('isFullScreen', value);
		const topArea = fc.get('topArea');
		const toolbar = this.#context.get('toolbar_main');
		const editorArea = fc.get('wrapper');
		const wysiwygFrame = fc.get('wysiwygFrame');
		const codeWrapper = fc.get('codeWrapper');
		const code = fc.get('code');
		const codeNumbers = fc.get('codeNumbers');
		const isCodeView = this.#frameContext.get('isCodeView');
		const arrow = this.#context.get('toolbar_arrow');

		this.#$.ui.offCurrentController();
		const wasToolbarHidden = toolbar.style.display === 'none' || (this.#store.mode.isInline && !this.#$.toolbar.inlineToolbarAttr.isShow);

		if (value) {
			this.#originCssText = topArea.style.cssText;
			this.#editorAreaOriginCssText = editorArea.style.cssText;
			this.#wysiwygOriginCssText = wysiwygFrame.style.cssText;
			this.#codeWrapperOriginCssText = codeWrapper.style.cssText;
			this.#codeOriginCssText = code.style.cssText;
			this.#codeNumberOriginCssText = codeNumbers?.style.cssText;
			this.#toolbarOriginCssText = toolbar.style.cssText;
			if (arrow) this.#arrowOriginCssText = arrow.style.cssText;

			if (this.#store.mode.isBalloon || this.#store.mode.isInline) {
				if (arrow) arrow.style.display = 'none';
				this.#fullScreenInline = this.#store.mode.isInline;
				this.#fullScreenBalloon = this.#store.mode.isBalloon;
				this.#store.mode.isInline = this.#$.toolbar.isInlineMode = false;
				this.#store.mode.isBalloon = this.#$.toolbar.isBalloonMode = false;
			}

			if (this.#options.get('toolbar_container')) {
				this.#toolbarParent = toolbar.parentElement;
				fc.get('container').insertBefore(toolbar, editorArea);
			}

			topArea.style.position = 'fixed';
			topArea.style.top = '0';
			topArea.style.left = '0';
			topArea.style.width = '100%';
			topArea.style.maxWidth = '100%';
			topArea.style.height = '100%';
			topArea.style.zIndex = '2147483639';

			if (fc.get('_stickyDummy').style.display !== 'none' && fc.get('_stickyDummy').style.display !== '') {
				this.#fullScreenSticky = true;
				fc.get('_stickyDummy').style.display = 'none';
				dom.utils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			this.#bodyOverflow = _d.body.style.overflow;
			_d.body.style.overflow = 'hidden';

			// frame
			editorArea.style.cssText = toolbar.style.cssText = '';
			wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0] + this.#frameOptions.get('_defaultStyles').editor + (isCodeView ? 'display: none;' : '');

			// code wrapper
			codeWrapper.style.cssText = (codeWrapper.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0] + `display: ${!isCodeView ? 'none' : 'flex'} !important;`;
			codeWrapper.style.overflow = 'auto';
			codeWrapper.style.height = '100%';

			// code
			code.style.height = '';

			// toolbar, editor area
			toolbar.style.width = wysiwygFrame.style.height = '100%';
			toolbar.style.position = 'relative';
			toolbar.style.display = 'block';

			this.#fullScreenInnerHeight = _w.innerHeight - toolbar.offsetHeight;
			editorArea.style.height = this.#fullScreenInnerHeight - (fc.has('statusbar') ? fc.get('statusbar').offsetHeight : 0) - this.#options.get('fullScreenOffset') + 'px';

			if (this.#frameOptions.get('iframe') && this.#frameOptions.get('height') === 'auto') {
				editorArea.style.overflow = 'auto';
				this.#$.ui._iframeAutoHeight(fc);
			}

			fc.get('topArea').style.marginTop = this.#options.get('fullScreenOffset') + 'px';

			const reductionIcon = this.#icons.reduction;
			this.#$.commandDispatcher.applyTargets('fullScreen', (e) => {
				dom.utils.changeElement(e.firstElementChild, reductionIcon);
				dom.utils.addClass(e, 'active');
			});
		} else {
			// frame
			wysiwygFrame.style.cssText = this.#wysiwygOriginCssText.replace(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/, '') + (isCodeView ? 'display: none;' : '');

			// code wrapper
			codeWrapper.style.cssText = this.#codeWrapperOriginCssText.replace(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/, '') + `display: ${!isCodeView ? 'none' : 'flex'} !important;`;

			// code
			code.style.cssText = this.#codeOriginCssText;
			if (codeNumbers) codeNumbers.style.cssText = this.#codeNumberOriginCssText;

			// toolbar, editor area
			toolbar.style.cssText = this.#toolbarOriginCssText;
			editorArea.style.cssText = this.#editorAreaOriginCssText;
			topArea.style.cssText = this.#originCssText;
			if (arrow) arrow.style.cssText = this.#arrowOriginCssText;
			_d.body.style.overflow = this.#bodyOverflow;

			if (this.#frameOptions.get('height') === 'auto' && !this.#options.get('hasCodeMirror')) this._codeViewAutoHeight(fc.get('code'), fc.get('codeNumbers'), true);

			if (this.#toolbarParent) {
				this.#toolbarParent.appendChild(toolbar);
				this.#toolbarParent = null;
			}

			if (this.#options.get('toolbar_sticky') > -1) {
				dom.utils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			if (this.#fullScreenSticky && !this.#options.get('toolbar_container')) {
				this.#fullScreenSticky = false;
				fc.get('_stickyDummy').style.display = 'block';
				dom.utils.addClass(toolbar, 'se-toolbar-sticky');
			}

			this.#store.mode.isInline = this.#$.toolbar.isInlineMode = this.#fullScreenInline;
			this.#store.mode.isBalloon = this.#$.toolbar.isBalloonMode = this.#fullScreenBalloon;
			if (!fc.get('isCodeView')) {
				if (this.#store.mode.isInline) this.#$.toolbar._showInline();
				else if (this.#store.mode.isBalloon) this.#$.toolbar._showBalloon();
			}

			this.#$.toolbar._resetSticky();
			fc.get('topArea').style.marginTop = '';

			const expansionIcon = this.#icons.expansion;
			this.#$.commandDispatcher.applyTargets('fullScreen', (e) => {
				dom.utils.changeElement(e.firstElementChild, expansionIcon);
				dom.utils.removeClass(e, 'active');
			});
		}

		if (wasToolbarHidden && !fc.get('isCodeView')) this.#$.toolbar.hide();

		// user event
		this.#eventManager.triggerEvent('onToggleFullScreen', { frameContext: fc, is: fc.get('isFullScreen') });
	}

	/**
	 * @description Add or remove the class name of `body` so that the code block is visible
	 * @param {boolean} [value] `true`/`false`, If `undefined` toggle the `showBlocks` mode.
	 */
	showBlocks(value) {
		const fc = this.#frameContext;
		if (value === undefined) value = !fc.get('isShowBlocks');
		fc.set('isShowBlocks', !!value);

		if (value) {
			dom.utils.addClass(fc.get('wysiwyg'), 'se-show-block');
			dom.utils.addClass(this.#$.commandDispatcher.targets.get('showBlocks'), 'active');
		} else {
			dom.utils.removeClass(fc.get('wysiwyg'), 'se-show-block');
			dom.utils.removeClass(this.#$.commandDispatcher.targets.get('showBlocks'), 'active');
		}

		this.#$.ui._syncFrameState(fc);
	}

	/**
	 * @internal
	 * @description Set the `active` class to the button of the toolbar
	 */
	_setButtonsActive() {
		const fc = this.#frameContext;

		// codeView
		if (fc.get('isCodeView')) {
			dom.utils.addClass(this.#$.commandDispatcher.targets.get('codeView'), 'active');
		} else {
			dom.utils.removeClass(this.#$.commandDispatcher.targets.get('codeView'), 'active');
		}

		// fullScreen
		if (fc.get('isFullScreen')) {
			const reductionIcon = this.#icons.reduction;
			this.#$.commandDispatcher.applyTargets('fullScreen', (e) => {
				dom.utils.changeElement(e.firstElementChild, reductionIcon);
				dom.utils.addClass(e, 'active');
			});
		} else {
			const expansionIcon = this.#icons.expansion;
			this.#$.commandDispatcher.applyTargets('fullScreen', (e) => {
				dom.utils.changeElement(e.firstElementChild, expansionIcon);
				dom.utils.removeClass(e, 'active');
			});
		}

		// showBlocks
		if (fc.get('isShowBlocks')) {
			dom.utils.addClass(this.#$.commandDispatcher.targets.get('showBlocks'), 'active');
		} else {
			dom.utils.removeClass(this.#$.commandDispatcher.targets.get('showBlocks'), 'active');
		}
	}

	/**
	 * @description Prints the current content of the editor.
	 * @throws {Error} Throws error if print operation fails.
	 */
	print() {
		/** @type {HTMLIFrameElement} */
		const iframe = dom.utils.createElement('IFRAME', { style: 'display: none;' });
		_d.body.appendChild(iframe);

		const innerPadding = _w.getComputedStyle(this.#frameContext.get('wysiwyg')).padding;
		const contentHTML = this.#options.get('printTemplate') ? this.#options.get('printTemplate').replace(/\{\{\s*contents\s*\}\}/i, this.#$.html.get()) : this.#$.html.get();
		const printDocument = dom.query.getIframeDocument(iframe);
		const wDoc = this.#frameContext.get('_wd');
		const rtlClass = this.#options.get('_rtl') ? ' se-rtl' : '';
		const pageCSS = /*html*/ `
			<style>
				@page {
					size: A4;
					margin: ${innerPadding};
				}
			</style>`;

		if (this.#frameOptions.get('iframe')) {
			const arrts = this.#options.get('printClass')
				? 'class="' + this.#options.get('printClass') + rtlClass + '"'
				: this.#frameOptions.get('iframe_fullPage')
					? dom.utils.getAttributesToString(wDoc.body, ['contenteditable'])
					: 'class="' + this.#options.get('_editableClass') + rtlClass + '"';

			printDocument.write(/*html*/ `
				<!DOCTYPE html>
				<html>
					<head>
						${wDoc.head.innerHTML}
						${pageCSS}
					</head>
					<body ${arrts} style="padding: 0; padding-left: 0; padding-top: 0; padding-right: 0; padding-bottom: 0;">
						${contentHTML}
					</body>
				</html>`);
		} else {
			const links = _d.head.getElementsByTagName('link');
			const styles = _d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			printDocument.write(/*html*/ `
				<!DOCTYPE html>
				<html>
					<head>
						${linkHTML}
						${pageCSS}
					</head>
					<body class="${(this.#options.get('printClass') || this.#options.get('_editableClass')) + rtlClass}" style="padding: 0; padding-left: 0; padding-top: 0; padding-right: 0; padding-bottom: 0;">
						${contentHTML}
					</body>
				</html>`);
		}

		this.#$.ui.showLoading();
		// Defer print — allow loading overlay to render before blocking the main thread with print dialog
		_w.setTimeout(() => {
			try {
				iframe.focus();
				// Edge, Chromium
				if (env.isEdge || env.isChromium || 'StyleMedia' in env._w) {
					try {
						iframe.contentWindow.document.execCommand('print', false, null);
					} catch (e) {
						console.warn('[SUNEDITOR.print.warn]', e);
						iframe.contentWindow.print();
					}
				} else {
					// Other browsers
					iframe.contentWindow.print();
				}
			} catch (error) {
				throw Error(`[SUNEDITOR.print.fail] error: ${error.message}`);
			} finally {
				this.#$.ui.hideLoading();
				dom.utils.removeItem(iframe);
			}
		}, 1000);
	}

	/**
	 * @description Open the preview window.
	 */
	preview() {
		this.#$.menu.dropdownOff();
		this.#$.menu.containerOff();
		this.#$.ui.offCurrentController();
		this.#$.ui.offCurrentModal();

		const contentHTML = this.#options.get('previewTemplate') ? this.#options.get('previewTemplate').replace(/\{\{\s*contents\s*\}\}/i, this.#$.html.get({ withFrame: true })) : this.#$.html.get({ withFrame: true });
		const windowObject = _w.open('', '_blank');
		const wDoc = this.#frameContext.get('_wd');
		const rtlClass = this.#options.get('_rtl') ? ' se-rtl' : '';

		if (this.#frameOptions.get('iframe')) {
			const arrts = this.#options.get('printClass')
				? 'class="' + this.#options.get('printClass') + rtlClass + '"'
				: this.#frameOptions.get('iframe_fullPage')
					? dom.utils.getAttributesToString(wDoc.body, ['contenteditable'])
					: 'class="' + this.#options.get('_editableClass') + rtlClass + '"';

			windowObject.document.write(/*html*/ `<!DOCTYPE html>
				<html>
					<head>
						${wDoc.head.innerHTML}
						<style>
							body {overflow:auto !important; height:auto !important;}
						</style>
					</head>
					<body ${arrts}>
						${contentHTML}
					</body>
				</html>`);
		} else {
			const links = _d.head.getElementsByTagName('link');
			const styles = _d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			windowObject.document.write(/*html*/ `<!DOCTYPE html>
				<html>
					<head>
						<meta charset="utf-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
						<title>${this.#lang.preview}</title>
						${linkHTML}
					</head>
					<body class="${(this.#options.get('printClass') ? this.#options.get('printClass') : this.#options.get('_editableClass')) + rtlClass}" style="height:auto">
						${contentHTML}
					</body>
				</html>`);
		}
	}

	/**
	 * @internal
	 * @description Resets the full-screen height of the editor.
	 * - Updates the editor's height dynamically when in full-screen mode.
	 */
	_resetFullScreenHeight() {
		if (this.#frameContext.get('isFullScreen')) {
			this.#fullScreenInnerHeight += _w.innerHeight - this.#context.get('toolbar_main').offsetHeight - (this.#frameContext.has('statusbar') ? this.#frameContext.get('statusbar').offsetHeight : 0) - this.#fullScreenInnerHeight;
			this.#frameContext.get('wrapper').style.height = this.#fullScreenInnerHeight + 'px';
			return true;
		}
	}

	/**
	 * @internal
	 * @description Run `CodeMirror` Editor
	 * @param {"set"|"get"|"readonly"|"refresh"} key Method key
	 * @param {*} value `CodeMirror` params
	 * @param {string} [rootKey] Root key
	 */
	_codeMirrorEditor(key, value, rootKey) {
		const fo = rootKey ? this.#frameRoots.get(rootKey).get('options') : this.#frameOptions;
		switch (key) {
			case 'set':
				fo.get('codeMirrorEditor').getDoc().setValue(value);
				break;
			case 'get':
				return fo.get('codeMirrorEditor').getDoc().getValue();
			case 'readonly':
				fo.get('codeMirrorEditor').setOption('readOnly', value);
				break;
			case 'refresh':
				fo.get('codeMirrorEditor').refresh();
				break;
		}
	}

	/**
	 * @internal
	 * @description Set method in the code view area
	 * @param {string} value HTML string
	 */
	_setCodeView(value) {
		if (this.#options.get('hasCodeMirror')) {
			this._codeMirrorEditor('set', value, null);
		} else {
			this.#frameContext.get('code').value = value;
		}
	}

	/**
	 * @internal
	 * @description Get method in the code view area
	 */
	_getCodeView() {
		if (this.#options.get('hasCodeMirror')) {
			return this._codeMirrorEditor('get', null, null);
		} else {
			return this.#frameContext.get('code').value;
		}
	}

	/**
	 * @internal
	 * @description Adjusts the height of the code view area.
	 * - Ensures the code block `auto`-resizes based on its content.
	 * @param {HTMLElement} code - Code area
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers area
	 * @param {boolean} isAuto - `auto` height option
	 */
	_codeViewAutoHeight(code, codeNumbers, isAuto) {
		if (isAuto) code.style.height = code.scrollHeight + 'px';
		this.#updateLineNumbers(codeNumbers, code);
	}

	/**
	 * @internal
	 * @this {HTMLElement} Code numbers area
	 * @description Synchronizes scrolling of line numbers with the code editor.
	 * - Keeps the line numbers aligned with the text.
	 * @param {HTMLTextAreaElement} codeNumbers - Code numbers textarea
	 */
	_scrollLineNumbers(codeNumbers) {
		codeNumbers.scrollTop = this.scrollTop;
		codeNumbers.scrollLeft = this.scrollLeft;
	}

	/**
	 * @description Convert the data of the code view and put it in the `WYSIWYG` area.
	 */
	#setCodeDataToEditor() {
		const code_html = this._getCodeView();

		if (this.#frameOptions.get('iframe_fullPage')) {
			const wDoc = this.#frameContext.get('_wd');
			const parseDocument = new DOMParser().parseFromString(code_html, 'text/html');

			if (!this.#disallowedTagNameRegExp.test('script')) {
				const headChildren = parseDocument.head.children;
				for (let i = 0, len = headChildren.length; i < len; i++) {
					if (/^script$/i.test(headChildren[i].tagName)) {
						parseDocument.head.removeChild(headChildren[i]);
						i--;
						len--;
					}
				}
			}

			let headers = parseDocument.head.innerHTML;
			if (!parseDocument.head.querySelector('link[rel="stylesheet"]') || (this.#frameOptions.get('height') === 'auto' && !parseDocument.head.querySelector('style'))) {
				headers += converter._setIframeStyleLinks(this.#frameOptions.get('iframe_cssFileName')) + converter._setAutoHeightStyle(this.#frameOptions.get('height'));
			}

			wDoc.head.innerHTML = headers;
			wDoc.body.innerHTML = this.#$.html.clean(parseDocument.body.innerHTML, { forceFormat: true, whitelist: null, blacklist: null, _freeCodeViewMode: this.#options.get('freeCodeViewMode') });

			const attrs = parseDocument.body.attributes;
			for (let i = 0, len = attrs.length; i < len; i++) {
				if (attrs[i].name === 'contenteditable') continue;
				wDoc.body.setAttribute(attrs[i].name, attrs[i].value);
			}
			if (!dom.utils.hasClass(wDoc.body, 'sun-editor-editable')) {
				const editableClasses = this.#options.get('_editableClass').split(' ');
				for (let i = 0; i < editableClasses.length; i++) {
					dom.utils.addClass(wDoc.body, editableClasses[i]);
				}
			}
		} else {
			this.#frameContext.get('wysiwyg').innerHTML =
				code_html.length > 0
					? this.#$.html.clean(code_html, { forceFormat: true, whitelist: null, blacklist: null, _freeCodeViewMode: this.#options.get('freeCodeViewMode') })
					: '<' + this.#options.get('defaultLine') + '><br></' + this.#options.get('defaultLine') + '>';
		}
	}

	/**
	 * @description Convert the data of the `WYSIWYG` area and put it in the code view area.
	 */
	#setEditorDataToCodeView() {
		const codeContent = this.#$.html._convertToCode(this.#frameContext.get('wysiwyg'), false);
		let codeValue = '';

		if (this.#frameOptions.get('iframe_fullPage')) {
			const attrs = dom.utils.getAttributesToString(this.#frameContext.get('_wd').body, null);
			codeValue = '<!DOCTYPE html>\n<html>\n' + this.#frameContext.get('_wd').head.outerHTML.replace(/>(?!\n)/g, '>\n') + '<body ' + attrs + '>\n' + codeContent + '</body>\n</html>';
		} else {
			codeValue = codeContent;
		}

		this._setCodeView(codeValue);
	}

	/**
	 * @description Updates the line numbers for the code editor.
	 * - Dynamically adjusts line numbers as content grows.
	 * @param {HTMLTextAreaElement} lineNumbers - Code numbers area
	 * @param {HTMLElement} code - Code area
	 */
	#updateLineNumbers(lineNumbers, code) {
		if (!lineNumbers) return;

		const lineHeight = GetLineHeight(lineNumbers);
		const numberOfLinesNeeded = Math.ceil(code.scrollHeight / lineHeight);

		const currentLineCount = (lineNumbers.value.match(/\n/g) || []).length;
		if (numberOfLinesNeeded > currentLineCount) {
			let n = '';
			for (let i = currentLineCount + 1; i <= numberOfLinesNeeded; i++) {
				n += `${i}\n`;
			}
			lineNumbers.value += n;
		}
	}

	/**
	 * @internal
	 * @description Destroy the Viewer instance and release memory
	 */
	_destroy() {
		// No internal state to clean up
	}
}

/**
 * @description Create line numbers for the code view area
 * @param {SunEditor.FrameContext} fc - Frame context
 */
function CreateLineNumbers(fc) {
	const codeNumbers = fc.get('codeNumbers');
	if (!codeNumbers) return;

	const lineHeight = GetLineHeight(codeNumbers);
	const numberOfLines = fc.get('code').scrollHeight / lineHeight;

	let n = '';
	for (let i = 1; i <= numberOfLines; i++) {
		n += `${i}\n`;
	}

	const { padding, margin } = _w.getComputedStyle(fc.get('code'));
	codeNumbers.value = n;
	codeNumbers.style.padding = padding || '';
	codeNumbers.style.margin = margin || '';
}

/**
 * @description Get the `line-height` of the textarea
 * @param {HTMLTextAreaElement} textarea Textarea element
 * @returns {number}
 */
function GetLineHeight(textarea) {
	const lineHeight = _w.getComputedStyle(textarea).lineHeight;
	let lineHeightMatch;

	if (!numbers.is(lineHeight)) {
		const fontSize = _w.getComputedStyle(textarea).fontSize;
		lineHeightMatch = numbers.get(fontSize) * 1.2;
	} else {
		lineHeightMatch = numbers.get(lineHeight);
	}

	return lineHeightMatch;
}

export default Viewer;
