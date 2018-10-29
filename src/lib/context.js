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
 * @param {HTMLElement} element - textarea element
 * @param {object} cons - Toolbar element you created
 * @param {json} options - user options
 * @returns Elements, variables of the editor
 * @private
 */
const _Context = function (element, cons, options) {
    return {
        element: {
            originElement: element,
            topArea: cons._top,
            relative: cons._relative,
            toolbar: cons._toolBar,
            resizebar: cons._resizeBar,
            navigation: cons._navigation,
            editorArea: cons._editorArea,
            wysiwyg: cons._wysiwygArea,
            code: cons._codeArea,
            loading: cons._loading,
            resizeBackground: cons._resizeBack
        },
        tool: {
            cover: cons._toolBar.getElementsByClassName('sun-editor-id-toolbar-cover')[0],
            bold: cons._toolBar.getElementsByClassName('sun-editor-id-bold')[0],
            underline: cons._toolBar.getElementsByClassName('sun-editor-id-underline')[0],
            italic: cons._toolBar.getElementsByClassName('sun-editor-id-italic')[0],
            strike: cons._toolBar.getElementsByClassName('sun-editor-id-strike')[0],
            subscript: cons._toolBar.getElementsByClassName('sun-editor-id-subscript')[0],
            superscript: cons._toolBar.getElementsByClassName('sun-editor-id-superscript')[0],
            font: cons._toolBar.getElementsByClassName('sun-editor-font-family')[0],
            format: cons._toolBar.getElementsByClassName('sun-editor-font-format')[0],
            fontSize: cons._toolBar.getElementsByClassName('sun-editor-font-size')[0]
        },
        user: {
            videoX: options.videoX,
            videoY: options.videoY,
            imageFileInput: options.imageFileInput,
            imageUrlInput: options.imageUrlInput,
            imageSize: options.imageSize,
            imageUploadUrl: options.imageUploadUrl,
            font: options.font,
            fontSize: options.fontSize,
            colorList: options.colorList,
            height: options.height,
            showPathLabel: options.showPathLabel,
            display: options.display
        },
        dialog: {},
        submenu: {}
    };
};

export default _Context;