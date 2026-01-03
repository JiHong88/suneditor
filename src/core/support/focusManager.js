import { dom } from '../../helper';

export default class FocusManager {
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor) {
		this.editor = editor;
		this.options = editor.options;
		this.frameContext = editor.frameContext;
		this.frameOptions = editor.frameOptions;
	}

	get #eventManager() {
		return this.editor.eventManager;
	}

	get #selection() {
		return this.editor.selection;
	}

	get #format() {
		return this.editor.format;
	}

	get #component() {
		return this.editor.component;
	}

	/**
	 * @description Focus to wysiwyg area
	 * @param {*} [rootKey] Root frame key.
	 */
	focus(rootKey) {
		if (rootKey) this.editor.changeFrameContext(rootKey);
		if (this.frameContext.get('wysiwygFrame').style.display === 'none') return;
		this._preventBlur = false;

		if (this.frameOptions.get('iframe') || !this.frameContext.get('wysiwyg').contains(this.#selection.getNode())) {
			this.nativeFocus();
		} else {
			try {
				const range = this.#selection.getRange();
				if (range.startContainer === range.endContainer && dom.check.isWysiwygFrame(range.startContainer)) {
					const currentNode = /** @type {HTMLElement} */ (range.commonAncestorContainer).children[range.startOffset];
					if (!this.#format.isLine(currentNode) && !this.#component.is(currentNode)) {
						const br = dom.utils.createElement('BR');
						const format = dom.utils.createElement(this.options.get('defaultLine'), null, br);
						this.frameContext.get('wysiwyg').insertBefore(format, currentNode);
						this.#selection.setRange(br, 0, br, 0);
						return;
					}
				}
				this.#selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
			} catch (e) {
				console.warn('[SUNEDITOR.focus.warn] ', e);
				this.nativeFocus();
			}
		}

		if (this.editor.isBalloon) this.#eventManager._toggleToolbarBalloon();
	}

	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * - If "focusEdge" is null, then selected last element
	 * @param {?Node} [focusEl] Focus element
	 */
	focusEdge(focusEl) {
		this._preventBlur = false;
		focusEl ||= this.frameContext.get('wysiwyg').lastElementChild;

		const fileComponentInfo = this.#component.get(focusEl);
		if (fileComponentInfo) {
			this.#component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
		} else if (focusEl) {
			if (focusEl.nodeType !== 3) {
				focusEl = dom.query.getEdgeChild(
					focusEl,
					function (current) {
						return current.childNodes.length === 0 || current.nodeType === 3;
					},
					true,
				);
			}
			if (!focusEl) this.nativeFocus();
			else this.#selection.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
		} else {
			this.focus();
		}
	}

	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	nativeFocus() {
		this.#selection.__focus();
		this.#selection.init();
	}

	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur() {
		if (this.frameOptions.get('iframe')) {
			this.frameContext.get('wysiwygFrame').blur();
		} else {
			this.frameContext.get('wysiwyg').blur();
		}
	}
}
