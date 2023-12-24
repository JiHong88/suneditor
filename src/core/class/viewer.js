/**
 * @fileoverview Viewer class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, env, converter, numbers } from '../../helper';

const Viewer = function (editor) {
	CoreInjector.call(this, editor);

	// members
	this.bodyOverflow = '';
	this.editorAreaOriginCssText = '';
	this.wysiwygOriginCssText = '';
	this.codeWrapperOriginCssText = '';
	this.codeOriginCssText = '';
	this.codeNumberOriginCssText = '';
	this.toolbarOriginCssText = '';
	this.arrowOriginCssText = '';
	this.fullScreenInnerHeight = 0;
	this.fullScreenSticky = false;
	this.fullScreenBalloon = false;
	this.fullScreenInline = false;
	this.toolbarParent = null;
};

Viewer.prototype = {
	/**
	 * @description Changes to code view or wysiwyg view
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	codeView(value) {
		const fc = this.editor.frameContext;
		if (value === undefined) value = !fc.get('isCodeView');
		if (value === fc.get('isCodeView')) return;

		fc.set('isCodeView', value);
		this.editor._offCurrentController();
		this.editor._offCurrentModal();

		const codeWrapper = fc.get('codeWrapper');
		const codeFrame = fc.get('code');
		const wysiwygFrame = fc.get('wysiwygFrame');

		if (value) {
			this._setEditorDataToCodeView();
			codeWrapper.style.setProperty('display', 'flex', 'important');
			wysiwygFrame.style.display = 'none';

			if (fc.get('isFullScreen')) {
				codeFrame.style.height = '100%';
			} else if (this.editor.frameOptions.get('height') === 'auto' && !this.options.get('hasCodeMirror')) {
				codeFrame.style.height = codeFrame.scrollHeight > 0 ? codeFrame.scrollHeight + 'px' : 'auto';
			}

			if (this.options.get('hasCodeMirror')) {
				this._codeMirrorEditor('refresh', null, null);
			}

			if (!fc.get('isFullScreen')) {
				this.editor._notHideToolbar = true;
				if (this.editor.isBalloon) {
					this.context.get('toolbar._arrow').style.display = 'none';
					this.context.get('toolbar.main').style.left = '';
					this.editor.isInline = this.toolbar._isInline = true;
					this.editor.isBalloon = this.toolbar._isBalloon = false;
					this.toolbar._showInline();
				}
			}

			if (this.editor.isSubBalloon) {
				this.subToolbar.hide();
			}

			CreateLineNumbers(fc);

			this.status._range = null;
			codeFrame.focus();
			domUtils.addClass(this.editor.commandTargets.get('codeView'), 'active');
		} else {
			if (!domUtils.isNonEditable(wysiwygFrame)) this._setCodeDataToEditor();
			wysiwygFrame.scrollTop = 0;
			codeWrapper.style.setProperty('display', 'none', 'important');
			wysiwygFrame.style.display = 'block';

			if (this.editor.frameOptions.get('height') === 'auto' && !this.options.get('hasCodeMirror')) fc.get('code').style.height = '0px';

			if (!fc.get('isFullScreen')) {
				this.editor._notHideToolbar = false;
				if (/balloon/.test(this.options.get('mode'))) {
					this.context.get('toolbar._arrow').style.display = '';
					this.editor.isInline = this.toolbar._isInline = false;
					this.editor.isBalloon = this.toolbar._isBalloon = true;
					this.eventManager._hideToolbar();
				}
			}

			this.editor._nativeFocus();
			domUtils.removeClass(this.editor.commandTargets.get('codeView'), 'active');

			if (!domUtils.isNonEditable(wysiwygFrame)) {
				this.history.push(false);
				this.history.resetButtons(fc.get('key'), null);
			}
		}

		this.editor._checkPlaceholder();
		domUtils.setDisabled(this.editor._codeViewDisabledButtons, value);

		// user event
		this.triggerEvent('onToggleCodeView', { frameContext: fc, is: fc.get('isCodeView') });
	},

	/**
	 * @description Changes to full screen or default screen
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	fullScreen(value) {
		const fc = this.editor.frameContext;
		if (value === undefined) value = !fc.get('isFullScreen');
		if (value === fc.get('isFullScreen')) return;

		fc.set('isFullScreen', value);
		const topArea = fc.get('topArea');
		const toolbar = this.context.get('toolbar.main');
		const editorArea = fc.get('wrapper');
		const wysiwygFrame = fc.get('wysiwygFrame');
		const codeWrapper = fc.get('codeWrapper');
		const code = fc.get('code');
		const codeNumbers = fc.get('codeNumbers');
		const isCodeView = this.editor.frameContext.get('isCodeView');
		const arrow = this.context.get('toolbar._arrow');

		this.editor._offCurrentController();
		const wasToolbarHidden = toolbar.style.display === 'none' || (this.editor.isInline && !this.editor.toolbar._inlineToolbarAttr.isShow);

		if (value) {
			this._originCssText = topArea.style.cssText;
			this.editorAreaOriginCssText = editorArea.style.cssText;
			this.wysiwygOriginCssText = wysiwygFrame.style.cssText;
			this.codeWrapperOriginCssText = codeWrapper.style.cssText;
			this.codeOriginCssText = code.style.cssText;
			this.codeNumberOriginCssText = codeNumbers?.style.cssText;
			this.toolbarOriginCssText = toolbar.style.cssText;
			if (arrow) this.arrowOriginCssText = arrow.style.cssText;

			if (this.editor.isBalloon || this.editor.isInline) {
				if (arrow) arrow.style.display = 'none';
				this.fullScreenInline = this.editor.isInline;
				this.fullScreenBalloon = this.editor.isBalloon;
				this.editor.isInline = this.toolbar._isInline = false;
				this.editor.isBalloon = this.toolbar._isBalloon = false;
			}

			if (this.options.get('toolbar_container')) {
				this.toolbarParent = toolbar.parentElement;
				fc.get('container').insertBefore(toolbar, editorArea);
			}

			topArea.style.position = 'fixed';
			topArea.style.top = '0';
			topArea.style.left = '0';
			topArea.style.width = '100%';
			topArea.style.maxWidth = '100%';
			topArea.style.height = '100%';
			topArea.style.zIndex = '2147483646';

			if (fc.get('_stickyDummy').style.display !== 'none' && fc.get('_stickyDummy').style.display !== '') {
				this.fullScreenSticky = true;
				fc.get('_stickyDummy').style.display = 'none';
				domUtils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			this.bodyOverflow = this._d.body.style.overflow;
			this._d.body.style.overflow = 'hidden';

			// frame
			editorArea.style.cssText = toolbar.style.cssText = '';
			wysiwygFrame.style.cssText =
				(wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0] +
				this.editor.frameOptions.get('_defaultStyles').editor +
				(isCodeView ? 'display: none;' : '');

			// code wrapper
			codeWrapper.style.cssText = (codeWrapper.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0] + `display: ${!isCodeView ? 'none' : 'flex'} !important;`;
			codeWrapper.style.overflow = 'auto';
			codeWrapper.style.height = '100%';

			// code
			code.style.height = '';
			if (codeNumbers) codeNumbers.style.height = code.clientHeight;

			// toolbar, editor area
			toolbar.style.width = wysiwygFrame.style.height = '100%';
			toolbar.style.position = 'relative';
			toolbar.style.display = 'block';

			this.fullScreenInnerHeight = this._w.innerHeight - toolbar.offsetHeight;
			editorArea.style.height = this.fullScreenInnerHeight - (fc.has('statusbar') ? fc.get('statusbar').offsetHeight : 0) - this.options.get('fullScreenOffset') + 'px';

			if (this.editor.frameOptions.get('iframe') && this.editor.frameOptions.get('height') === 'auto') {
				editorArea.style.overflow = 'auto';
				this.editor._iframeAutoHeight(fc);
			}

			fc.get('topArea').style.marginTop = this.options.get('fullScreenOffset') + 'px';

			const reductionIcon = this.icons.reduction;
			this.editor.applyCommandTargets('fullScreen', (e) => {
				domUtils.changeElement(e.firstElementChild, reductionIcon);
				domUtils.addClass(e, 'active');
			});
		} else {
			// frame
			wysiwygFrame.style.cssText = this.wysiwygOriginCssText.replace(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/, '') + (isCodeView ? 'display: none;' : '');

			// code wrapper
			codeWrapper.style.cssText = this.codeWrapperOriginCssText.replace(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/, '') + `display: ${!isCodeView ? 'none' : 'flex'} !important;`;

			// code
			code.style.cssText = this.codeOriginCssText;
			if (codeNumbers) codeNumbers.style.cssText = this.codeNumberOriginCssText;

			// toolbar, editor area
			toolbar.style.cssText = this.toolbarOriginCssText;
			editorArea.style.cssText = this.editorAreaOriginCssText;
			topArea.style.cssText = this._originCssText;
			if (arrow) arrow.style.cssText = this.arrowOriginCssText;
			this._d.body.style.overflow = this.bodyOverflow;

			if (this.editor.frameOptions.get('height') === 'auto' && !this.options.get('hasCodeMirror')) this._codeViewAutoHeight(fc);

			if (this.toolbarParent) {
				this.toolbarParent.appendChild(toolbar);
				this.toolbarParent = null;
			}

			if (this.options.get('toolbar_sticky') > -1) {
				domUtils.removeClass(toolbar, 'se-toolbar-sticky');
			}

			if (this.fullScreenSticky && !this.options.get('toolbar_container')) {
				this.fullScreenSticky = false;
				fc.get('_stickyDummy').style.display = 'block';
				domUtils.addClass(toolbar, 'se-toolbar-sticky');
			}

			this.editor.isInline = this.toolbar._isInline = this.fullScreenInline;
			this.editor.isBalloon = this.toolbar._isBalloon = this.fullScreenBalloon;
			if (!fc.get('isCodeView')) {
				if (this.editor.isInline) this.editor.toolbar._showInline();
				else if (this.editor.isBalloon) this.editor.toolbar._showBalloon();
			}

			this.editor.toolbar._resetSticky();
			fc.get('topArea').style.marginTop = '';

			const expansionIcon = this.icons.expansion;
			this.editor.applyCommandTargets('fullScreen', (e) => {
				domUtils.changeElement(e.firstElementChild, expansionIcon);
				fc;
				domUtils.removeClass(e, 'active');
			});
		}

		if (wasToolbarHidden && !fc.get('isCodeView')) this.editor.toolbar.hide();

		// user event
		this.triggerEvent('onToggleFullScreen', { frameContext: fc, is: fc.get('isFullScreen') });
	},

	/**
	 * @description Add or remove the class name of "body" so that the code block is visible
	 * @param {boolean|undefined} value true/false, If undefined toggle the codeView mode.
	 */
	showBlocks(value) {
		const fc = this.editor.frameContext;
		if (value === undefined) value = !fc.get('isShowBlocks');
		fc.set('isShowBlocks', !!value);

		if (value) {
			domUtils.addClass(fc.get('wysiwyg'), 'se-show-block');
			domUtils.addClass(this.editor.commandTargets.get('showBlocks'), 'active');
		} else {
			domUtils.removeClass(fc.get('wysiwyg'), 'se-show-block');
			domUtils.removeClass(this.editor.commandTargets.get('showBlocks'), 'active');
		}

		this.editor._resourcesStateChange(fc);
	},

	/**
	 * @description Prints the current content of the editor.
	 */
	print() {
		const iframe = domUtils.createElement('IFRAME', { style: 'display: none;' });
		this._d.body.appendChild(iframe);

		const contentHTML = this.options.get('printTemplate') ? this.options.get('printTemplate').replace(/\{\{\s*content\s*\}\}/i, this.html.get(true)) : this.html.get(true);
		const printDocument = domUtils.getIframeDocument(iframe);
		const wDoc = this.editor.frameContext.get('_wd');

		if (this.editor.frameOptions.get('iframe')) {
			const arrts = this.options.get('printClass')
				? 'class="' + this.options.get('printClass') + '"'
				: this.editor.frameOptions.get('iframe_fullPage')
				? domUtils.getAttributesToString(wDoc.body, ['contenteditable'])
				: 'class="' + this.options.get('_editableClass') + '"';

			printDocument.write('' + '<!DOCTYPE html><html>' + '<head>' + wDoc.head.innerHTML + '</head>' + '<body ' + arrts + '>' + contentHTML + '</body>' + '</html>');
		} else {
			const links = this._d.head.getElementsByTagName('link');
			const styles = this._d.head.getElementsByTagName('style');
			let linkHTML = '';
			for (let i = 0, len = links.length; i < len; i++) {
				linkHTML += links[i].outerHTML;
			}
			for (let i = 0, len = styles.length; i < len; i++) {
				linkHTML += styles[i].outerHTML;
			}

			printDocument.write(/*html*/ `<!DOCTYPE html>
				<html>
					<head>
						${linkHTML}
					</head>
					<body class="${this.options.get('printClass') ? this.options.get('printClass') : this.options.get('_editableClass')}">
						${contentHTML} 
					</body>
				</html>`);
		}

		this.editor.showLoading();
		this._w.setTimeout(() => {
			try {
				iframe.focus();
				// Edge, Chromium
				if (env.isEdge || env.isChromium || this._d.documentMode || this._w.StyleMedia) {
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
				this.editor.hideLoading();
				domUtils.removeItem(iframe);
			}
		}, 1000);
	},

	/**
	 * @description Open the preview window.
	 */
	preview() {
		this.menu.dropdownOff();
		this.menu.containerOff();
		this.editor._offCurrentController();
		this.editor._offCurrentModal();

		const contentHTML = this.options.get('previewTemplate') ? this.options.get('previewTemplate').replace(/\{\{\s*content\s*\}\}/i, this.html.get(true)) : this.html.get(true);
		const windowObject = this._w.open('', '_blank');
		windowObject.mimeType = 'text/html';
		const wDoc = this.editor.frameContext.get('_wd');

		if (this.editor.frameOptions.get('iframe')) {
			const arrts = this.options.get('printClass')
				? 'class="' + this.options.get('printClass') + '"'
				: this.editor.frameOptions.get('iframe_fullPage')
				? domUtils.getAttributesToString(wDoc.body, ['contenteditable'])
				: 'class="' + this.options.get('_editableClass') + '"';

			windowObject.document.write(/*html*/ `<!DOCTYPE html>
				<html>
					<head>
						${wDoc.head.innerHTML}
						<style>
							body {overflow:auto !important; margin: 10px auto !important; height:auto !important; outline:1px dashed #ccc;}
						</style>
					</head>
					<body ${arrts}>
						${contentHTML}
					</body>
				</html>`);
		} else {
			const links = this._d.head.getElementsByTagName('link');
			const styles = this._d.head.getElementsByTagName('style');
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
						<title>${this.lang.preview}</title>
						${linkHTML}
					</head>
					<body class="${
						this.options.get('printClass') ? this.options.get('printClass') : this.options.get('_editableClass')
					}" style="margin:10px auto !important; height:auto !important; outline:1px dashed #ccc;">
						${contentHTML}
					</body>
				</html>`);
		}
	},

	_resetFullScreenHeight() {
		if (this.editor.frameContext.get('isFullScreen')) {
			this.fullScreenInnerHeight +=
				this._w.innerHeight -
				this.context.get('toolbar.main').offsetHeight -
				(this.editor.frameContext.has('statusbar') ? this.editor.frameContext.get('statusbar').offsetHeight : 0) -
				this.fullScreenInnerHeight;
			this.editor.frameContext.get('wrapper').style.height = this.fullScreenInnerHeight + 'px';
			return true;
		}
	},

	/**
	 * @description Run CodeMirror Editor
	 * @param {"set"|"get"|"readonly"|"refresh"} key method key
	 * @param {any} value params
	 * @param {string|undefined} rootKey Root key
	 * @returns
	 * @private
	 */
	_codeMirrorEditor(key, value, rootKey) {
		const fo = rootKey ? this.frameRoots.get(rootKey).get('options') : this.editor.frameOptions;
		switch (key) {
			case 'set':
				if (fo.has('codeMirror5Editor')) {
					fo.get('codeMirror5Editor').getDoc().setValue(value);
				} else if (fo.has('codeMirror6Editor')) {
					fo.get('codeMirror6Editor').dispatch({
						changes: { from: 0, to: fo.get('codeMirror6Editor').state.doc.length, insert: value }
					});
				}
				break;
			case 'get':
				if (fo.has('codeMirror5Editor')) {
					return fo.get('codeMirror5Editor').getDoc().getValue();
				} else if (fo.has('codeMirror6Editor')) {
					return fo.get('codeMirror6Editor').state.doc.toString();
				}
				break;
			case 'readonly':
				if (fo.has('codeMirror5Editor')) {
					fo.get('codeMirror5Editor').setOption('readOnly', value);
				} else if (fo.has('codeMirror6Editor')) {
					if (!value) fo.get('codeMirror6Editor').contentDOM.setAttribute('contenteditable', true);
					else fo.get('codeMirror6Editor').contentDOM.removeAttribute('contenteditable');
				}
				break;
			case 'refresh':
				if (fo.has('codeMirror5Editor')) {
					fo.get('codeMirror5Editor').refresh();
				}
				break;
		}
	},

	/**
	 * @description Set method in the code view area
	 * @param {string} value HTML string
	 * @private
	 */
	_setCodeView(value) {
		if (this.options.get('hasCodeMirror')) {
			this._codeMirrorEditor('set', value, null);
		} else {
			this.editor.frameContext.get('code').value = value;
		}
	},

	/**
	 * @description Get method in the code view area
	 * @private
	 */
	_getCodeView() {
		if (this.options.get('hasCodeMirror')) {
			return this._codeMirrorEditor('get', null, null);
		} else {
			return this.editor.frameContext.get('code').value;
		}
	},

	/**
	 * @description Convert the data of the code view and put it in the WYSIWYG area.
	 * @private
	 */
	_setCodeDataToEditor() {
		const code_html = this._getCodeView();

		if (this.editor.frameOptions.get('iframe_fullPage')) {
			const wDoc = this.editor.frameContext.get('_wd');
			const parseDocument = new DOMParser().parseFromString(code_html, 'text/html');

			if (!this.options.get('__allowedScriptTag')) {
				const headChildren = parseDocument.head.children;
				for (let i = 0, len = headChildren.length; i < len; i++) {
					if (/^script$/i.test(headChildren[i].tagName)) {
						parseDocument.head.removeChild(headChildren[i]);
						i--, len--;
					}
				}
			}

			let headers = parseDocument.head.innerHTML;
			if (!parseDocument.head.querySelector('link[rel="stylesheet"]') || (this.editor.frameOptions.get('height') === 'auto' && !parseDocument.head.querySelector('style'))) {
				headers +=
					converter._setIframeStyleLinks(this.editor.frameOptions.get('iframe_cssFileName')) + converter._setAutoHeightStyle(this.editor.frameOptions.get('height'));
			}

			wDoc.head.innerHTML = headers;
			wDoc.body.innerHTML = this.html.clean(parseDocument.body.innerHTML, true, null, null);

			const attrs = parseDocument.body.attributes;
			for (let i = 0, len = attrs.length; i < len; i++) {
				if (attrs[i].name === 'contenteditable') continue;
				wDoc.body.setAttribute(attrs[i].name, attrs[i].value);
			}
			if (!domUtils.hasClass(wDoc.body, 'sun-editor-editable')) {
				const editableClasses = this.options.get('_editableClass').split(' ');
				for (let i = 0; i < editableClasses.length; i++) {
					domUtils.addClass(wDoc.body, this.options.get('_editableClass')[i]);
				}
			}
		} else {
			this.editor.frameContext.get('wysiwyg').innerHTML =
				code_html.length > 0 ? this.html.clean(code_html, true, null, null) : '<' + this.options.get('defaultLine') + '><br></' + this.options.get('defaultLine') + '>';
		}
	},

	/**
	 * @description Convert the data of the WYSIWYG area and put it in the code view area.
	 * @private
	 */
	_setEditorDataToCodeView() {
		const codeContent = this.html._convertToCode(this.editor.frameContext.get('wysiwyg'), false);
		let codeValue = '';

		if (this.editor.frameOptions.get('iframe_fullPage')) {
			const attrs = domUtils.getAttributesToString(this.editor.frameContext.get('_wd').body, null);
			codeValue =
				'<!DOCTYPE html>\n<html>\n' +
				this.editor.frameContext.get('_wd').head.outerHTML.replace(/>(?!\n)/g, '>\n') +
				'<body ' +
				attrs +
				'>\n' +
				codeContent +
				'</body>\n</html>';
		} else {
			codeValue = codeContent;
		}

		this._setCodeView(codeValue);
	},

	_codeViewAutoHeight(code, codeNumbers, isAuto) {
		if (isAuto) code.style.height = code.scrollHeight + 'px';
		this._updateLineNumbers(codeNumbers, code);
	},

	_updateLineNumbers(lineNumbers, code) {
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
	},

	_scrollLineNumbers(codeNumbers) {
		codeNumbers.scrollTop = this.scrollTop;
		codeNumbers.scrollLeft = this.scrollLeft;
	},

	constructor: Viewer
};

function CreateLineNumbers(fc) {
	const codeNumbers = fc.get('codeNumbers');
	if (!codeNumbers) return;

	const lineHeight = GetLineHeight(codeNumbers);
	const numberOfLines = fc.get('code').scrollHeight / lineHeight;

	let n = '';
	for (let i = 1; i <= numberOfLines; i++) {
		n += `${i}\n`;
	}

	const { padding, margin } = window.getComputedStyle(fc.get('code'));
	codeNumbers.value = n;
	codeNumbers.style.padding = padding || '';
	codeNumbers.style.margin = margin || '';
}

function GetLineHeight(textarea) {
	let lineHeight = window.getComputedStyle(textarea).lineHeight;

	if (!numbers.is(lineHeight)) {
		const fontSize = window.getComputedStyle(textarea).fontSize;
		lineHeight = numbers.get(fontSize) * 1.2;
	} else {
		lineHeight = numbers.get(lineHeight);
	}

	return lineHeight;
}

export default Viewer;
