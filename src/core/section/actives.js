import { domUtils, env } from '../../helper';
const { NO_EVENT } = env;

const StyleMap = {
	bold: ['font-weight'],
	underline: ['text-decoration'],
	italic: ['font-style'],
	strike: ['text-decoration']
};

export const ACTIVE_EVENT_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'indent', 'outdent', 'fullScreen', 'showBlocks', 'codeView'];
export const BASIC_COMMANDS = ACTIVE_EVENT_COMMANDS.concat(['undo', 'redo', 'save', 'dir', 'dir_ltr', 'dir_rtl']);

export function SELECT_ALL(editor) {
	editor._offCurrentController();
	editor.menu.containerOff();
	const figcaption = domUtils.getParentElement(editor.selection.getNode(), 'FIGCAPTION');
	const selectArea = figcaption || editor.frameContext.get('wysiwyg');

	let first = domUtils.getEdgeChild(selectArea.firstChild, (current) => current.childNodes.length === 0 || current.nodeType === 3 || domUtils.isTable(current), false) || selectArea.firstChild;
	let last = domUtils.getEdgeChild(selectArea.lastChild, (current) => current.childNodes.length === 0 || current.nodeType === 3 || domUtils.isTable(current), true) || selectArea.lastChild;

	if (!first || !last) return;

	if (domUtils.isMedia(first) || domUtils.isTableElements(first)) {
		const info = editor.component.get(first);
		const br = domUtils.createElement('BR');
		const format = domUtils.createElement(editor.options.get('defaultLine'), null, br);
		first = info ? info.container || info.cover : first;
		first.parentNode.insertBefore(format, first);
		first = br;
	}

	if (domUtils.isMedia(last) || domUtils.isTableElements(last)) {
		last = domUtils.createElement('BR');
		selectArea.appendChild(domUtils.createElement(editor.options.get('defaultLine'), null, last));
	}

	editor.toolbar._showBalloon(editor.selection.setRange(first, 0, last, last.textContent.length));
}

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

export async function SAVE(editor) {
	const fc = editor.frameContext;
	if (!fc.get('isChanged')) return;

	const data = editor.html.get();
	if ((await editor.triggerEvent('onSave', { frameContext: fc, data })) === NO_EVENT) {
		const origin = fc.get('originElement');
		if (/^TEXTAREA$/i.test(origin.nodeName)) {
			origin.value = data;
		} else {
			origin.innerHTML = data;
		}
	}

	fc.set('isChanged', false);
	fc.set('savedIndex', editor.history.getRootStack()[editor.status.rootKey].index);

	// set save button disable
	editor.applyCommandTargets('save', (e) => {
		e.setAttribute('disabled', true);
	});
}

export function FONT_STYLE(editor, command) {
	command = editor.options.get('_defaultTagCommand')[command.toLowerCase()] || command;
	let nodeName = editor.options.get('convertTextTags')[command] || command;
	const nodesMap = editor.status.currentNodesMap;
	const el = nodesMap.includes(editor.options.get('_styleCommandMap')[nodeName]) ? null : domUtils.createElement(nodeName);

	if (/^sub$/i.test(nodeName) && nodesMap.includes('sup')) {
		nodeName = 'sup';
	} else if (/^sup$/i.test(nodeName) && nodesMap.includes('sub')) {
		nodeName = 'sub';
	}

	editor.format.applyTextStyle(el, StyleMap[command] || null, [nodeName], false);
	editor.focus();
}
