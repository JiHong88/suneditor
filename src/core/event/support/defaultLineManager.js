import { dom, unicode } from '../../../helper';

/**
 * @description Service responsible for line breaking and default line creation logic.
 * - Handles the 'Enter' key behavior (P vs BR vs DIV).
 * - Manages the initial line creation when the editor is empty.
 */
export default class DefaultLineManager {
	#editor;
	#options;
	#frameContext;
	#uiManager;

	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor) {
		this.#editor = editor;
		this.#options = editor.options;
		this.#frameContext = editor.frameContext;
		this.#uiManager = editor.uiManager;
	}

	get #selection() {
		return this.#editor.selection;
	}

	get #format() {
		return this.#editor.format;
	}

	get #component() {
		return this.#editor.component;
	}

	/**
	 * @description Executes the default line creation logic.
	 * - If no formatName is provided, it uses the 'defaultLine' option (usually 'P').
	 * - Handles creating a new block element when the user presses Enter or when initializing.
	 * @param {string} [formatName] The tag name to be used for the new line (e.g., 'P', 'DIV', 'BR').
	 * @returns {?void}
	 */
	execute(formatName) {
		if (!this.#options.get('__lineFormatFilter')) return null;
		if (this.#editor.pluginManager.fileInfo.pluginRegExp.test(this.#uiManager.currentControllerName)) return;

		const range = this.#selection.getRange();
		const commonCon = /** @type {HTMLElement} */ (range.commonAncestorContainer);
		const startCon = range.startContainer;
		const endOffset = range.endOffset;
		const rangeEl = this.#format.getBlock(commonCon, null);

		/** @type {Node} */
		let focusNode;
		let offset, format;

		if (rangeEl) {
			format = dom.utils.createElement(formatName || this.#options.get('defaultLine'));
			format.innerHTML = rangeEl.innerHTML;
			if (format.childNodes.length === 0) format.innerHTML = unicode.zeroWidthSpace;

			rangeEl.innerHTML = format.outerHTML;
			format = rangeEl.firstChild;
			focusNode = format.childNodes[endOffset] || dom.query.getEdgeChildNodes(format, null).sc;

			if (!focusNode) {
				focusNode = dom.utils.createTextNode(unicode.zeroWidthSpace);
				format.insertBefore(focusNode, format.firstChild);
			}

			offset = focusNode.textContent.length;
			this.#selection.setRange(focusNode, offset, focusNode, offset);
			return;
		}

		if (commonCon.nodeType === 3 && this.#component.is(commonCon.parentElement)) {
			const compInfo = this.#component.get(commonCon.parentElement);
			if (!compInfo) return;

			const container = compInfo.container;

			if (commonCon.parentElement === container) {
				const siblingEl = commonCon.nextElementSibling ? container : container.nextElementSibling;
				const el = dom.utils.createElement(this.#options.get('defaultLine'), null, commonCon);
				container.parentElement.insertBefore(el, siblingEl);
				this.#editor.focusManager.focusEdge(el);
				return;
			}

			this.#component.select(compInfo.target, compInfo.pluginName);
			return null;
		} else if (commonCon.nodeType === 1 && commonCon.getAttribute('data-se-embed') === 'true') {
			let el = commonCon.nextElementSibling;
			if (!this.#format.isLine(el)) el = this.#format.addLine(commonCon, this.#options.get('defaultLine'));
			this.#selection.setRange(el.firstChild, 0, el.firstChild, 0);
			return;
		}

		if ((this.#format.isBlock(startCon) || dom.check.isWysiwygFrame(startCon)) && (this.#component.is(startCon.children[range.startOffset]) || this.#component.is(startCon.children[range.startOffset - 1]))) return;
		if (dom.query.getParentElement(commonCon, dom.check.isExcludeFormat)) return null;

		if (this.#format.isBlock(commonCon) && commonCon.childNodes.length <= 1) {
			let br = null;
			if (commonCon.childNodes.length === 1 && dom.check.isBreak(commonCon.firstChild)) {
				br = commonCon.firstChild;
			} else {
				br = dom.utils.createTextNode(unicode.zeroWidthSpace);
				commonCon.appendChild(br);
			}

			this.#selection.setRange(br, 1, br, 1);
			return;
		}

		try {
			if (commonCon.nodeType === 3) {
				format = dom.utils.createElement(formatName || this.#options.get('defaultLine'));
				commonCon.parentNode.insertBefore(format, commonCon);
				format.appendChild(commonCon);
			}

			if (dom.check.isBreak(format.nextSibling)) dom.utils.removeItem(format.nextSibling);
			if (dom.check.isBreak(format.previousSibling)) dom.utils.removeItem(format.previousSibling);
			if (dom.check.isBreak(focusNode)) {
				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				focusNode.parentNode.insertBefore(zeroWidth, focusNode);
				focusNode = zeroWidth;
			}
		} catch {
			this.#frameContext.get('_wd').execCommand('formatBlock', false, `<${formatName || this.#options.get('defaultLine')}>`);
			this.#editor.effectNode = null;
			this.#selection.init();
			return;
		}

		if (format) {
			if (dom.check.isBreak(format.nextSibling)) dom.utils.removeItem(format.nextSibling);
			if (dom.check.isBreak(format.previousSibling)) dom.utils.removeItem(format.previousSibling);
			if (dom.check.isBreak(focusNode)) {
				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				focusNode.parentNode.insertBefore(zeroWidth, focusNode);
				focusNode = zeroWidth;
			}
		}

		this.#editor.effectNode = null;
		if (startCon) {
			this.#selection.setRange(startCon, 1, startCon, 1);
		} else {
			this.#editor.focusManager.nativeFocus();
		}
	}
}
