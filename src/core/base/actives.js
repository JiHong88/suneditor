import { dom, env, keyCodeMap } from '../../helper';
import { isTable, isList } from '../../helper/dom/domCheck';
const { NO_EVENT } = env;

/**
 * @constant {Object.<string, string[]>} StyleMap - Map of font styles to CSS properties.
 */
const StyleMap = {
	bold: ['font-weight'],
	underline: ['text-decoration'],
	italic: ['font-style'],
	strike: ['text-decoration']
};

let __globalEventKeydown = null;
let __globalEventMousedown = null;

/**
 * @private
 * @this {SunEditor.Core}
 * @param {Node} ww Wywsiwyg element
 * @param {Node} button Button element
 */
const __RemoveCopyformt = function (ww, button) {
	__globalEventKeydown = this.eventManager.removeGlobalEvent('keydown', __globalEventKeydown);
	__globalEventMousedown = this.eventManager.removeGlobalEvent('mousedown', __globalEventMousedown);
	this._onCopyFormatInfo = null;
	this._onCopyFormatInitMethod = null;
	dom.utils.removeClass(ww, 'se-copy-format-cursor');
	dom.utils.removeClass(button, 'on');

	return true;
};

/**
 * @private
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
			false
		) || selectArea.firstChild;
	const last =
		dom.query.getEdgeChild(
			selectArea.lastChild,
			(current) => {
				return current.childNodes.length === 0 || current.nodeType === 3 || isTable(current) || isList(current);
			},
			true
		) || selectArea.lastChild;

	return { first, last };
};

/**
 * @description List of commands that trigger active event handling in the editor.
 * - These commands typically apply inline formatting or structural changes.
 * @constant {string[]}
 */
export const ACTIVE_EVENT_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'indent', 'outdent'];

/**
 * @description List of basic editor commands, including active event commands and additional actions
 * - such as undo, redo, saving, full-screen toggle, and text direction commands.
 * @constant {string[]}
 */
export const BASIC_COMMANDS = ACTIVE_EVENT_COMMANDS.concat(['undo', 'redo', 'save', 'fullScreen', 'showBlocks', 'codeView', 'dir', 'dir_ltr', 'dir_rtl']);

/**
 * @description Selects all content in the editor.
 * @param {SunEditor.Core} editor - The root editor instance
 */
export function SELECT_ALL(editor) {
	editor.ui._offCurrentController();
	editor.menu.containerOff();

	// check all tags
	const ww = editor.frameContext.get('wysiwyg');
	let prevScopeTag = null;
	let prevScopeTagName = '';
	const scopeSelectionTags = editor.options.get('scopeSelectionTags');
	const range = editor.selection.getRange();
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
	const scopeBaseTag = dom.query.getParentElement(prevScopeTag || editor.selection.getNode(), (current) => scopeTagList.includes(current.nodeName?.toLowerCase()));

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
	if (dom.check.isMedia(first) || (info = editor.component.get(first)) || dom.check.isTableElements(first)) {
		info ||= editor.component.get(first);
		const br = dom.utils.createElement('BR');
		const format = dom.utils.createElement(editor.options.get('defaultLine'), null, br);
		first = info ? info.container || info.cover : first;
		first.parentElement.insertBefore(format, first);
		first = br;
	}

	if (dom.check.isMedia(last) || (info = editor.component.get(last)) || dom.check.isTableElements(last)) {
		info ||= editor.component.get(last);
		const br = dom.utils.createElement('BR');
		const format = dom.utils.createElement(editor.options.get('defaultLine'), null, br);
		last = info ? info.container || info.cover : last;
		last.parentElement.appendChild(format);
		last = br;
	}

	editor.toolbar._showBalloon(editor.selection.setRange(first, 0, last, last.textContent.length));
}

/**
 * @description Toggles direction button active state.
 * @param {SunEditor.Core} editor - The root editor instance
 * @param {boolean} rtl - Whether the text direction is right-to-left.
 */
export function DIR_BTN_ACTIVE(editor, rtl) {
	const icons = editor.icons;
	const commandTargets = editor.commandTargets;
	const shortcutsKeyMap = editor.shortcutsKeyMap;

	// change reverse shortcuts key
	editor.reverseKeys.forEach((e) => {
		const info = shortcutsKeyMap.get(e);
		if (!info) return;
		[info.command, info.r] = [info.r, info.command];
	});

	// change dir buttons
	editor.applyCommandTargets('dir', (e) => {
		dom.utils.changeTxt(e.querySelector('.se-tooltip-text'), editor.lang[rtl ? 'dir_ltr' : 'dir_rtl']);
		dom.utils.changeElement(e.firstElementChild, icons[rtl ? 'dir_ltr' : 'dir_rtl']);
	});

	if (rtl) {
		dom.utils.addClass(commandTargets.get('dir_rtl'), 'active');
		dom.utils.removeClass(commandTargets.get('dir_ltr'), 'active');
	} else {
		dom.utils.addClass(commandTargets.get('dir_ltr'), 'active');
		dom.utils.removeClass(commandTargets.get('dir_rtl'), 'active');
	}
}

/**
 * @description Saves the editor content.
 * @param {SunEditor.Core} editor - The root editor instance
 * @returns {Promise<void>}
 */
export async function SAVE(editor) {
	const fc = editor.frameContext;
	if (!fc.get('isChanged')) return;

	const data = editor.html.get();
	const saved = await editor.triggerEvent('onSave', { frameContext: fc, data });
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
	fc.set('savedIndex', editor.history.getRootStack()[editor.status.rootKey].index);

	// set save button disable
	editor.applyCommandTargets('save', (e) => {
		e.disabled = true;
	});
}

/**
 * @description Copies formatting from selected text.
 * @param {SunEditor.Core} editor - The root editor instance
 * @param {Node} button - The button triggering the copy format function.
 */
export function COPY_FORMAT(editor, button) {
	if (typeof editor._onCopyFormatInitMethod === 'function') {
		editor._onCopyFormatInitMethod();
		return;
	}

	const ww = editor.frameContext.get('wysiwyg');
	editor._onCopyFormatInfo = [...editor.eventManager.__cacheStyleNodes];
	editor._onCopyFormatInitMethod = __RemoveCopyformt.bind(editor, ww, button);
	dom.utils.addClass(ww, 'se-copy-format-cursor');
	dom.utils.addClass(button, 'on');

	__globalEventKeydown = editor.eventManager.addGlobalEvent('keydown', (e) => {
		if (!keyCodeMap.isEsc(e.code)) return;
		editor._onCopyFormatInitMethod?.();
	});
	__globalEventMousedown = editor.eventManager.addGlobalEvent('mousedown', (e) => {
		if (ww.contains(e.target) || e.target === button) return;
		editor._onCopyFormatInitMethod?.();
	});
}

/**
 * @description Applies font styling to selected text.
 * @param {SunEditor.Core} editor - The root editor instance
 * @param {string} command - The font style command (e.g., bold, italic, underline).
 */
export function FONT_STYLE(editor, command) {
	command = editor.options.get('_defaultTagCommand')[command.toLowerCase()] || command;
	let nodeName = editor.options.get('convertTextTags')[command] || command;
	const nodesMap = editor.status.currentNodesMap;
	const el = nodesMap.includes(editor.options.get('_styleCommandMap')[nodeName]) ? null : dom.utils.createElement(nodeName);

	if (/^sub$/i.test(nodeName) && nodesMap.includes('superscript')) {
		nodeName = 'sup';
	} else if (/^sup$/i.test(nodeName) && nodesMap.includes('subscript')) {
		nodeName = 'sub';
	}

	editor.inline.apply(el, { stylesToModify: StyleMap[command] || null, nodesToRemove: [nodeName], strictRemove: false });
	editor.focus();
}

/**
 * @description Inserts a page break element into the editor.
 * @param {SunEditor.Core} editor - The root editor instance
 */
export function PAGE_BREAK(editor) {
	const pageBreak = dom.utils.createElement('DIV', { class: 'se-component se-component-line-break se-page-break' });
	editor.component.insert(pageBreak, { skipCharCount: true, insertBehavior: 'line' });
	const line = pageBreak.nextElementSibling || editor.format.addLine(pageBreak);
	editor.selection.setRange(line, 1, line, 1);
	editor.history.push(false);
}
