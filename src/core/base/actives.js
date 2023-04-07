import { domUtils } from '../../helper';

const StyleMap = {
	STRONG: ['font-weight'],
	U: ['text-decoration'],
	EM: ['font-style'],
	DEL: ['text-decoration']
};

export const BASIC_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'sub', 'sup', 'undo', 'redo', 'save', 'outdent', 'indent', 'fullScreen', 'showBlocks', 'codeView', 'dir', 'dir_ltr', 'dir_rtl'];

export function GET_DEFAULT_COMMAND_KEY(textTags, command) {
	return textTags[command] || command;
}

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

	// change indent buttons
	editor.applyCmdTarget('indent', function (e) {
		domUtils.changeElement(e.firstElementChild, rtl ? icons.outdent : icons.indent);
	});
	editor.applyCmdTarget('outdent', function (e) {
		domUtils.changeElement(e.firstElementChild, rtl ? icons.indent : icons.outdent);
	});

	// change dir buttons
	editor.applyCmdTarget('dir', function (e) {
		domUtils.changeTxt(e.querySelector('.se-tooltip-text'), editor.lang[editor.options.get('_rtl') ? 'dir_ltr' : 'dir_rtl']);
		domUtils.changeElement(e.firstElementChild, icons[editor.options.get('_rtl') ? 'dir_ltr' : 'dir_rtl']);
	});
	editor.applyCmdTarget('dir_ltr', function (e) {
		if (rtl) domUtils.removeClass(e, 'active');
		else domUtils.addClass(e, 'active');
	});
	editor.applyCmdTarget('dir_rtl', function (e) {
		if (rtl) domUtils.addClass(e, 'active');
		else domUtils.removeClass(e, 'active');
	});
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
	editor.applyCmdTarget('save', function (e) {
		e.setAttribute('disabled', true);
	});

	// user event
	if (typeof editor.events.onSave === 'function') {
		editor.events.onSave(value);
		return;
	}
}

// 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'
export function FONT_STYLE(editor, command) {
	command = editor.options.get('_defaultCommand')[command.toLowerCase()] || command;
	const nodesMap = editor.status.currentNodesMap;
	const cmd = nodesMap.indexOf(command) > -1 ? null : domUtils.createElement(command);
	let removeNode = command;

	if (/^SUB$/i.test(command) && nodesMap.indexOf('SUP') > -1) {
		removeNode = 'SUP';
	} else if (/^SUP$/i.test(command) && nodesMap.indexOf('SUB') > -1) {
		removeNode = 'SUB';
	}

	editor.format.applyTextStyle(cmd, StyleMap[command] || null, [removeNode], false);
	editor.focus();
}
