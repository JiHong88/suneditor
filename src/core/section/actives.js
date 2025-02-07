import { domUtils, env } from '../../helper';
const { NO_EVENT } = env;

const StyleMap = {
	bold: ['font-weight'],
	underline: ['text-decoration'],
	italic: ['font-style'],
	strike: ['text-decoration']
};

let __globalEventKeydown = null;
let __globalEventMousedown = null;
const __RemoveCopyformt = function (ww, button) {
	__globalEventKeydown = this.eventManager.removeGlobalEvent('keydown', __globalEventKeydown);
	__globalEventMousedown = this.eventManager.removeGlobalEvent('mousedown', __globalEventMousedown);
	this._onCopyFormatInfo = null;
	this._onCopyFormatInitMethod = null;
	domUtils.removeClass(ww, 'se-copy-format-cursor');
	domUtils.removeClass(button, 'on');

	return true;
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
 * @param {object} editor - The root editor instance
 */
export function SELECT_ALL(editor) {
	editor.ui._offCurrentController();
	editor.menu.containerOff();
	const figcaption = domUtils.getParentElement(editor.selection.getNode(), 'FIGCAPTION');
	const selectArea = figcaption || editor.frameContext.get('wysiwyg');

	let first = domUtils.getEdgeChild(selectArea.firstChild, (current) => current.childNodes.length === 0 || current.nodeType === 3 || domUtils.isTable(current), false) || selectArea.firstChild;
	let last = domUtils.getEdgeChild(selectArea.lastChild, (current) => current.childNodes.length === 0 || current.nodeType === 3 || domUtils.isTable(current), true) || selectArea.lastChild;

	if (!first || !last) return;

	if (domUtils.isMedia(first) || editor.component.is(first.parentElement) || domUtils.isTableElements(first)) {
		const info = editor.component.get(first) || editor.component.get(first.parentElement);
		const br = domUtils.createElement('BR');
		const format = domUtils.createElement(editor.options.get('defaultLine'), null, br);
		first = info ? info.container || info.cover : first;
		first.parentNode.insertBefore(format, first);
		first = br;
	}

	if (domUtils.isMedia(last) || editor.component.is(last.parentElement) || domUtils.isTableElements(last)) {
		last = domUtils.createElement('BR');
		selectArea.appendChild(domUtils.createElement(editor.options.get('defaultLine'), null, last));
	}

	editor.toolbar._showBalloon(editor.selection.setRange(first, 0, last, last.textContent.length));
}

/**
 * @description Toggles direction button active state.
 * @param {Object} editor - The root editor instance
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
		const temp = info.c;
		info.c = info.r;
		info.r = temp;
	});

	// change dir buttons
	editor.applyCommandTargets('dir', (e) => {
		domUtils.changeTxt(e.querySelector('.se-tooltip-text'), editor.lang[rtl ? 'dir_ltr' : 'dir_rtl']);
		domUtils.changeElement(e.firstElementChild, icons[rtl ? 'dir_ltr' : 'dir_rtl']);
	});

	if (rtl) {
		domUtils.addClass(commandTargets.get('dir_rtl'), 'active');
		domUtils.removeClass(commandTargets.get('dir_ltr'), 'active');
	} else {
		domUtils.addClass(commandTargets.get('dir_ltr'), 'active');
		domUtils.removeClass(commandTargets.get('dir_rtl'), 'active');
	}
}

/**
 * @description Saves the editor content.
 * @param {Object} editor - The root editor instance
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
		e.setAttribute('disabled', true);
	});
}

/**
 * @description Copies formatting from selected text.
 * @param {Object} editor - The root editor instance
 * @param {HTMLElement} button - The button triggering the copy format function.
 */
export function COPY_FORMAT(editor, button) {
	if (typeof editor._onCopyFormatInitMethod === 'function') {
		editor._onCopyFormatInitMethod();
		return;
	}

	const ww = editor.frameContext.get('wysiwyg');
	editor._onCopyFormatInfo = [...editor.eventManager.__cacheStyleNodes];
	editor._onCopyFormatInitMethod = __RemoveCopyformt.bind(editor, ww, button);
	domUtils.addClass(ww, 'se-copy-format-cursor');
	domUtils.addClass(button, 'on');

	__globalEventKeydown = editor.eventManager.addGlobalEvent('keydown', (e) => {
		if (e.keyCode !== 27) return;
		editor._onCopyFormatInitMethod?.();
	});
	__globalEventMousedown = editor.eventManager.addGlobalEvent('mousedown', (e) => {
		if (ww.contains(e.target) || e.target === button) return;
		editor._onCopyFormatInitMethod?.();
	});
}

/**
 * @description Applies font styling to selected text.
 * @param {Object} editor - The root editor instance
 * @param {string} command - The font style command (e.g., bold, italic, underline).
 */
export function FONT_STYLE(editor, command) {
	command = editor.options.get('_defaultTagCommand')[command.toLowerCase()] || command;
	let nodeName = editor.options.get('convertTextTags')[command] || command;
	const nodesMap = editor.status.currentNodesMap;
	const el = nodesMap.includes(editor.options.get('_styleCommandMap')[nodeName]) ? null : domUtils.createElement(nodeName);

	if (/^sub$/i.test(nodeName) && nodesMap.includes('superscript')) {
		nodeName = 'sup';
	} else if (/^sup$/i.test(nodeName) && nodesMap.includes('subscript')) {
		nodeName = 'sub';
	}

	editor.format.applyInlineElement(el, { stylesToModify: StyleMap[command] || null, nodesToRemove: [nodeName], strictRemove: false });
	editor.focus();
}

/**
 * @description Inserts a page break element into the editor.
 * @param {Object} editor - The root editor instance
 */
export function PAGE_BREAK(editor) {
	const pageBreak = domUtils.createElement('DIV', { class: 'se-component se-component-line-break se-page-break' });
	editor.component.insert(pageBreak, { skipCharCount: true, skipSelection: true, skipHistory: false });
	const line = pageBreak.nextElementSibling || editor.format.addLine(pageBreak);
	editor.selection.setRange(line, 1, line, 1);
	editor.history.push(false);
}
