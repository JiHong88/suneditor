import { dom, env, keyCodeMap } from '../../../helper';
import { isTable, isList } from '../../../helper/dom/domCheck';

const { NO_EVENT } = env;

/**
 * @constant {Object.<string, string[]>} StyleMap - Map of font styles to CSS properties.
 */
const StyleMap = {
	bold: ['font-weight'],
	underline: ['text-decoration'],
	italic: ['font-style'],
	strike: ['text-decoration'],
};

/**
 * @description Executes built-in editor commands (formatting, undo/redo, save, codeView, etc.)
 * - and manages copy-format state.
 */
export default class CommandExecutor {
	#kernel;
	#$;
	#store;

	#frameContext;
	#options;
	#eventManager;

	#globalEventKeydown = null;
	#globalEventMousedown = null;

	/**
	 * @description Copy format info
	 * - `eventManager.__cacheStyleNodes` copied
	 * @type {?Array<Node>}
	 */
	#onCopyFormatInfo = null;

	/**
	 * @description Copy format init method
	 * @type {?(...args: *) => *}
	 */
	#onCopyFormatInitMethod = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#kernel = kernel;
		this.#$ = kernel.$;
		this.#store = kernel.store;
		this.#frameContext = this.#$.frameContext;
		this.#options = this.#$.options;
		this.#eventManager = this.#$.eventManager;
	}

	/**
	 * @description Execute default command of command button
	 */
	async execute(command, button) {
		if (this.#frameContext.get('isReadOnly') && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;

		switch (command) {
			case 'selectAll':
				this.#SELECT_ALL();
				break;
			case 'copy': {
				const range = this.#$.selection.getRange();
				if (range.collapsed) break;

				const container = dom.utils.createElement('div', null, range.cloneContents());
				await this.#$.html.copy(container.innerHTML);

				break;
			}
			case 'newDocument':
				this.#$.html.set(`<${this.#options.get('defaultLine')}><br></${this.#options.get('defaultLine')}>`);
				this.#$.focusManager.focus();
				this.#$.history.push(false);
				// document type
				if (this.#frameContext.has('documentType_use_header')) {
					this.#frameContext.get('documentType').reHeader();
				}
				break;
			case 'codeView':
				this.#$.viewer.codeView(!this.#frameContext.get('isCodeView'));
				break;
			case 'fullScreen':
				this.#$.viewer.fullScreen(!this.#frameContext.get('isFullScreen'));
				break;
			case 'indent':
				this.#$.format.indent();
				break;
			case 'outdent':
				this.#$.format.outdent();
				break;
			case 'undo':
				this.#$.history.undo();
				break;
			case 'redo':
				this.#$.history.redo();
				break;
			case 'removeFormat':
				this.#$.inline.remove();
				this.#$.focusManager.focus();
				break;
			case 'print':
				this.#$.viewer.print();
				break;
			case 'preview':
				this.#$.viewer.preview();
				break;
			case 'showBlocks':
				this.#$.viewer.showBlocks(!this.#frameContext.get('isShowBlocks'));
				break;
			case 'dir':
				this.#$.ui.setDir(this.#options.get('_rtl') ? 'ltr' : 'rtl');
				break;
			case 'dir_ltr':
				this.#$.ui.setDir('ltr');
				break;
			case 'dir_rtl':
				this.#$.ui.setDir('rtl');
				break;
			case 'save':
				await this.#SAVE();
				break;
			case 'copyFormat':
				this.#COPY_FORMAT(button);
				break;
			case 'pageBreak':
				this.#PAGE_BREAK();
				break;
			case 'pageUp':
				this.#frameContext.get('documentType').pageUp();
				break;
			case 'pageDown':
				this.#frameContext.get('documentType').pageDown();
				break;
			default:
				this.#FONT_STYLE(command);
		}
	}

	copyFormat() {
		if (!this.#onCopyFormatInfo?.length) return;

		try {
			const _styleNode = [...this.#onCopyFormatInfo];
			const n = _styleNode.pop();

			this.#$.inline.remove();

			if (n) {
				const insertedNode = this.#$.inline.apply(n, { stylesToModify: null, nodesToRemove: [n.nodeName], strictRemove: false });
				const { parent, inner } = this.#$.nodeTransform.createNestedNode(_styleNode);
				insertedNode.parentNode.insertBefore(parent, insertedNode);
				inner.appendChild(insertedNode);

				this.#$.selection.setRange(insertedNode, dom.check.isZeroWidth(insertedNode) ? 1 : 0, insertedNode, 1);
			}

			if (this.#options.get('copyFormatKeepOn')) return;

			this.#onCopyFormatInitMethod();
		} catch (err) {
			console.warn('[SUNEDITOR.copyFormat.error] ', err);
			if (!this.#onCopyFormatInitMethod?.()) {
				this.#onCopyFormatInfo = null;
				this.#onCopyFormatInitMethod = null;
			}
		}
	}

	/**
	 * @description Selects all content in the editor.
	 */
	#SELECT_ALL() {
		this.#$.ui.offCurrentController();
		this.#$.menu.containerOff();

		// check all tags
		const ww = this.#frameContext.get('wysiwyg');
		let prevScopeTag = null;
		let prevScopeTagName = '';
		const scopeSelectionTags = this.#options.get('scopeSelectionTags');
		const range = this.#$.selection.getRange();
		if (!range.collapsed) {
			let commonNode = (prevScopeTag = range.commonAncestorContainer);
			let commonNodeName = (prevScopeTagName = commonNode.nodeName?.toLowerCase());
			if (range.startOffset === 0 && range.endOffset === range.endContainer.textContent?.length) {
				const commonParent = commonNode.parentElement;
				if ((dom.check.isList(commonParent) || dom.check.isListCell(commonParent)) && commonParent.firstChild.contains?.(range.startContainer) && commonParent.lastChild?.contains(range.endContainer)) {
					prevScopeTag = commonNode = commonParent.parentElement;
					prevScopeTagName = commonNode.nodeName?.toLowerCase();
				}
			}

			commonNodeName = commonNode.nodeName?.toLowerCase();
			while (commonNode && ((!commonNode.nextSibling && !commonNode.previousSibling && !scopeSelectionTags.includes(commonNodeName)) || dom.check.isContentLess(commonNodeName)) && commonNode !== ww) {
				commonNode = commonNode.parentElement;
				commonNodeName = commonNode.nodeName?.toLowerCase();
			}

			if (scopeSelectionTags.includes(commonNodeName)) {
				prevScopeTag = commonNode;
				prevScopeTagName = commonNodeName;
			}
		}

		// select all
		const scopeTagList = scopeSelectionTags.filter((tagName) => tagName !== prevScopeTagName);
		const scopeBaseTag = dom.query.getParentElement(prevScopeTag || this.#$.selection.getNode(), (current) => scopeTagList.includes(current.nodeName?.toLowerCase()));

		let selectArea = scopeBaseTag || ww;
		let { first, last } = __findFirstAndLast(selectArea);

		if (!first || !last) return;

		const isZeroWidth = dom.check.isZeroWidth;
		while (isZeroWidth(first) && isZeroWidth(last) && selectArea !== ww) {
			selectArea = selectArea.parentElement;
			({ first, last } = __findFirstAndLast(dom.query.getParentElement(selectArea, (current) => scopeTagList.includes(current.nodeName?.toLowerCase())) || ww));
		}

		if (!first || !last) return;

		let info = null;
		if (dom.check.isMedia(first) || (info = this.#$.component.get(first)) || dom.check.isTableElements(first)) {
			info ||= this.#$.component.get(first);
			const br = dom.utils.createElement('BR');
			const format = dom.utils.createElement(this.#options.get('defaultLine'), null, br);
			first = info ? info.container || info.cover : first;
			first.parentElement.insertBefore(format, first);
			first = br;
		}

		if (dom.check.isMedia(last) || (info = this.#$.component.get(last)) || dom.check.isTableElements(last)) {
			info ||= this.#$.component.get(last);
			const br = dom.utils.createElement('BR');
			const format = dom.utils.createElement(this.#options.get('defaultLine'), null, br);
			last = info ? info.container || info.cover : last;
			last.parentElement.appendChild(format);
			last = br;
		}

		this.#$.toolbar._showBalloon(this.#$.selection.setRange(first, 0, last, last.textContent.length));
	}

	/**
	 * @description Saves the editor content.
	 * @returns {Promise<void>}
	 */
	async #SAVE() {
		const fc = this.#frameContext;
		if (!fc.get('isChanged')) return;

		const data = this.#$.html.get();
		const saved = await this.#eventManager.triggerEvent('onSave', { frameContext: fc, data });
		if (saved === NO_EVENT) {
			const origin = fc.get('originElement');
			if (/^TEXTAREA$/i.test(origin.nodeName)) {
				origin.value = data;
			} else {
				origin.innerHTML = data;
			}
		} else if (saved === false) {
			return;
		}

		fc.set('isChanged', false);
		fc.set('savedIndex', this.#$.history.getRootStack()[this.#store.get('rootKey')].index);

		// set save button disable
		this.#$.commandDispatcher.applyTargets('save', (e) => {
			e.disabled = true;
		});
	}

	/**
	 * @description Copies formatting from selected text.
	 * @param {Node} button - The button triggering the copy format function.
	 */
	#COPY_FORMAT(button) {
		if (typeof this.#onCopyFormatInitMethod === 'function') {
			this.#onCopyFormatInitMethod();
			return;
		}

		const ww = this.#frameContext.get('wysiwyg');
		this.#onCopyFormatInfo = [...this.#kernel._eventOrchestrator.__cacheStyleNodes];
		this.#onCopyFormatInitMethod = this.#removeCopyformt.bind(this, this.#eventManager, ww, button);
		dom.utils.addClass(ww, 'se-copy-format-cursor');
		dom.utils.addClass(button, 'on');

		this.#globalEventKeydown = this.#eventManager.addGlobalEvent('keydown', (e) => {
			if (!keyCodeMap.isEsc(e.code)) return;
			this.#onCopyFormatInitMethod?.();
		});
		this.#globalEventMousedown = this.#eventManager.addGlobalEvent('mousedown', (e) => {
			if (ww.contains(e.target) || e.target === button) return;
			this.#onCopyFormatInitMethod?.();
		});
	}

	/**
	 * @param {import('../../config/eventManager').default} eventManager
	 * @param {Node} ww Wywsiwyg element
	 * @param {Node} button Button element
	 */
	#removeCopyformt(eventManager, ww, button) {
		this.#globalEventKeydown = eventManager.removeGlobalEvent(this.#globalEventKeydown);
		this.#globalEventMousedown = eventManager.removeGlobalEvent(this.#globalEventMousedown);
		this.#onCopyFormatInfo = null;
		this.#onCopyFormatInitMethod = null;
		dom.utils.removeClass(ww, 'se-copy-format-cursor');
		dom.utils.removeClass(button, 'on');

		return true;
	}

	/**
	 * @description Applies font styling to selected text.
	 * @param {string} command - The font style command (e.g., bold, italic, underline).
	 */
	#FONT_STYLE(command) {
		command = this.#options.get('_defaultTagCommand')[command.toLowerCase()] || command;
		let nodeName = this.#options.get('convertTextTags')[command] || command;
		const nodesMap = this.#store.get('currentNodesMap');
		const el = nodesMap.includes(this.#options.get('_styleCommandMap')[nodeName]) ? null : dom.utils.createElement(nodeName);

		if (/^sub$/i.test(nodeName) && nodesMap.includes('superscript')) {
			nodeName = 'sup';
		} else if (/^sup$/i.test(nodeName) && nodesMap.includes('subscript')) {
			nodeName = 'sub';
		}

		this.#$.inline.apply(el, { stylesToModify: StyleMap[command] || null, nodesToRemove: [nodeName], strictRemove: false });
		this.#$.focusManager.focus();
	}

	/**
	 * @description Inserts a page break element into the editor.
	 */
	#PAGE_BREAK() {
		const pageBreak = dom.utils.createElement('DIV', { class: 'se-component se-component-line-break se-page-break' });
		this.#$.component.insert(pageBreak, { skipCharCount: true, insertBehavior: 'line' });
		const line = pageBreak.nextElementSibling || this.#$.format.addLine(pageBreak);
		this.#$.selection.setRange(line, 1, line, 1);
		this.#$.history.push(false);
	}
}

/**
 * @description Finds the first and last child elements in a selection area.
 * @param {Element} selectArea Selection area element
 * @returns {{ first: Node, last: Node}} Object containing the first and last child elements
 */
const __findFirstAndLast = function (selectArea) {
	const isContentLess = dom.check.isContentLess;
	const first =
		dom.query.getEdgeChild(
			dom.query.getEdgeChild(selectArea, (current) => !isContentLess(current), false),
			(current) => {
				return current.childNodes.length === 0 || current.nodeType === 3 || isTable(current) || isList(current);
			},
			false,
		) || selectArea.firstChild;
	const last =
		dom.query.getEdgeChild(
			selectArea.lastChild,
			(current) => {
				return current.childNodes.length === 0 || current.nodeType === 3 || isTable(current) || isList(current);
			},
			true,
		) || selectArea.lastChild;

	return { first, last };
};
