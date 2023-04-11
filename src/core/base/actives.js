import { domUtils } from '../../helper';

const StyleMap = {
	bold: ['font-weight'],
	underline: ['text-decoration'],
	italic: ['font-style'],
	strike: ['text-decoration']
};

export const BASIC_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'undo', 'redo', 'save', 'outdent', 'indent', 'fullScreen', 'showBlocks', 'codeView', 'dir', 'dir_ltr', 'dir_rtl'];
export const DEFAULT_ACTIVE_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fullScreen', 'showBlocks', 'codeView'];

export function SELECT_ALL(editor) {
	editor._offCurrentController();
	editor.menu.containerOff();
	const figcaption = domUtils.getParentElement(editor.selection.getNode(), 'FIGCAPTION');
	const selectArea = figcaption || editor.frameContext.get('wysiwyg');

	let first =
		domUtils.getEdgeChild(
			selectArea.firstChild,
			function (current) {
				return current.childNodes.length === 0 || current.nodeType === 3;
			},
			false
		) || selectArea.firstChild;

	let last =
		domUtils.getEdgeChild(
			selectArea.lastChild,
			function (current) {
				return current.childNodes.length === 0 || current.nodeType === 3;
			},
			true
		) || selectArea.lastChild;

	if (!first || !last) return;

	if (domUtils.isMedia(first)) {
		const info = editor.component.get(first);
		const br = domUtils.createElement('BR');
		const format = domUtils.createElement(editor.options.get('defaultLineTag'), null, br);
		first = info ? info.container : first;
		first.parentNode.insertBefore(format, first);
		first = br;
	}

	if (domUtils.isMedia(last)) {
		last = domUtils.createElement('BR');
		selectArea.appendChild(domUtils.createElement(editor.options.get('defaultLineTag'), null, last));
	}

	editor.toolbar._showBalloon(editor.selection.setRange(first, 0, last, last.textContent.length));
}

export function DIR_BTN_ACTIVE(editor, rtl) {
	const icons = editor.icons;
	const commandTargets = editor.commandTargets;
	const shortcutsKeyMap = editor.shortcutsKeyMap;

	// change reverse shortcuts key
	editor.reverseKeys.forEach(function (e) {
		const info = shortcutsKeyMap.get(e);
		if (!info) return;
		const temp = info.c;
		info.c = info.r;
		info.r = temp;
	});

	// change reverse buttons
	editor.options.get('reverseCommands').forEach(function (reverseCmds) {
		const cmds = reverseCmds.split('-');
		let a = commandTargets.get(cmds[0]);
		let b = commandTargets.get(cmds[1]);
		if (!a || !b) return;

		a = a[0].innerHTML;
		b = b[0].innerHTML;
		editor.applyCommandTargets(cmds[0], function (e) {
			e.innerHTML = b;
		});
		editor.applyCommandTargets(cmds[1], function (e) {
			e.innerHTML = a;
		});
	});

	// change dir buttons
	editor.applyCommandTargets('dir', function (e) {
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

export function SAVE(editor) {
	const value = editor.html.get();

	if (typeof editor.options.get('callBackSave') === 'function') {
		editor.options.get('callBackSave')(value, editor.status.isChanged);
	} else if (editor.status.isChanged && typeof editor.events.save === 'function') {
		editor.events.save();
	} else {
		editor.frameContext.get('originElement').value = value;
	}

	editor.status.isChanged = false;

	// set save button disable
	editor.applyCommandTargets('save', function (e) {
		e.setAttribute('disabled', true);
	});

	// user event
	if (typeof editor.events.onSave === 'function') {
		editor.events.onSave(value);
		return;
	}
}

export function FONT_STYLE(editor, command) {
	command = editor.options.get('_defaultCommand')[command.toLowerCase()] || command;
	let nodeName = editor.options.get('textTags')[command] || command;
	const nodesMap = editor.status.currentNodesMap;
	const el = nodesMap.indexOf(nodeName) > -1 ? null : domUtils.createElement(nodeName);

	if (/^sub$/i.test(nodeName) && nodesMap.indexOf('sup') > -1) {
		nodeName = 'sup';
	} else if (/^sup$/i.test(nodeName) && nodesMap.indexOf('sub') > -1) {
		nodeName = 'sub';
	}

	editor.format.applyTextStyle(el, StyleMap[command] || null, [nodeName], false);
	editor.focus();
}
