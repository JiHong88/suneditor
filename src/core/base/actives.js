import { domUtils } from '../../helper';

const StyleMap = {
    STRONG: ['font-weight'],
    U: ['text-decoration'],
    EM: ['font-style'],
    DEL: ['text-decoration']
};

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
    const ctx = editor.context;

    // change indent buttons
    if (ctx.has('buttons.indent')) domUtils.changeElement(ctx.get('buttons.indent').firstElementChild, editor.icons.indent);
    if (ctx.has('buttons.sub.indent')) domUtils.changeElement(ctx.get('buttons.sub.indent').firstElementChild, editor.icons.indent);
    if (ctx.has('buttons.outdent')) domUtils.changeElement(ctx.get('buttons.outdent').firstElementChild, editor.icons.outdent);
    if (ctx.has('buttons.sub.outdent')) domUtils.changeElement(ctx.get('buttons.sub.outdent').firstElementChild, editor.icons.outdent);

    // dir active
    _SET_DIR_BTN(editor, ctx.get('buttons.dir'), '', rtl);
    _SET_DIR_BTN(editor, ctx.get('buttons.sub.dir'), '', rtl);
    _SET_DIR_BTN(editor, ctx.get('buttons.dir_ltr'), 'ltr', rtl);
    _SET_DIR_BTN(editor, ctx.get('buttons.sub.dir_ltr'), 'ltr', rtl);
    _SET_DIR_BTN(editor, ctx.get('buttons.dir_rtl'), 'rtl', rtl);
    _SET_DIR_BTN(editor, ctx.get('buttons.sub.dir_rtl'), 'rtl', rtl);
}

export function INDENT_ACTIVE(editor) {

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
    if (editor.context.has('buttons.save')) editor.context.get('buttons.save').setAttribute('disabled', true);
    if (editor.context.has('buttons.sub.save')) editor.context.get('buttons.sub.save').setAttribute('disabled', true);

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

function _SET_DIR_BTN(editor, btn, str, isRtl) {
    if (!btn) return;

    if (str === '') {
        domUtils.changeTxt(btn.querySelector('.se-tooltip-text'), editor.lang[editor.options.get('_rtl') ? 'dir_ltr' : 'dir_rtl']);
        domUtils.changeElement(btn.firstElementChild, editor.icons[editor.options.get('_rtl') ? 'dir_ltr' : 'dir_rtl']);
        return;
    }

    if (str === 'ltr') {
        if (isRtl) domUtils.removeClass(btn, 'active');
        else domUtils.addClass(btn, 'active');
        return;
    }

    if (str === 'rtl') {
        if (isRtl) domUtils.addClass(btn, 'active');
        else domUtils.removeClass(btn, 'active');
        return;
    }
}