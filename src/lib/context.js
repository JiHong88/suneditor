/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

/**
 * @description Elements and variables you should have
 * @param {Element} element textarea element
 * @param {object} cons Toolbar element you created
 * @param {JSON|Object} options Inserted options
 * @returns {Object} {Elements, variables of the editor, option}
 * @private
 */
const _Context = function (element, cons, options) {
    return {
        element: {
            originElement: element,
            topArea: cons._top,
            relative: cons._relative,
            toolbar: cons._toolBar,
            _buttonTray: cons._toolBar.querySelector('.se-btn-tray'),
            _menuTray: cons._menuTray,
            resizingBar: cons._resizingBar,
            navigation: cons._navigation,
            charWrapper: cons._charWrapper,
            charCounter: cons._charCounter,
            editorArea: cons._editorArea,
            wysiwygFrame: cons._wysiwygArea,
            wysiwyg: cons._wysiwygArea, // if (options.iframe) cons._wysiwygArea.contentDocument.body
            code: cons._codeArea,
            placeholder: cons._placeholder,
            loading: cons._loading,
            lineBreaker: cons._lineBreaker,
            lineBreaker_t: cons._lineBreaker_t,
            lineBreaker_b: cons._lineBreaker_b,
            resizeBackground: cons._resizeBack,
            _stickyDummy: cons._stickyDummy,
            _arrow: cons._arrow
        },
        tool: {
            cover: cons._toolBar.querySelector('.se-toolbar-cover'),
            bold: cons._toolBar.querySelector('._se_command_bold'),
            underline: cons._toolBar.querySelector('._se_command_underline'),
            italic: cons._toolBar.querySelector('._se_command_italic'),
            strike: cons._toolBar.querySelector('._se_command_strike'),
            subscript: cons._toolBar.querySelector('._se_command_subscript'),
            superscript: cons._toolBar.querySelector('._se_command_superscript'),
            undo: cons._toolBar.querySelector('._se_command_undo'),
            redo: cons._toolBar.querySelector('._se_command_redo'),
            save: cons._toolBar.querySelector('._se_command_save'),
            outdent: cons._toolBar.querySelector('._se_command_outdent'),
            indent: cons._toolBar.querySelector('._se_command_indent'),
            fullScreen: cons._toolBar.querySelector('._se_command_fullScreen'),
            showBlocks: cons._toolBar.querySelector('._se_command_showBlocks'),
            codeView: cons._toolBar.querySelector('._se_command_codeView')
        },
        options: options,
        option: options
    };
};

export default _Context;