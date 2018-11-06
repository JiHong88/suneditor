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
            resizingBar: cons._resizingBar,
            navigation: cons._navigation,
            editorArea: cons._editorArea,
            wysiwyg: cons._wysiwygArea,
            code: cons._codeArea,
            loading: cons._loading,
            resizeBackground: cons._resizeBack,
            _stickyDummy: cons._stickyDummy
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
            stickyToolbar: options.stickyToolbar,
            resizingBar: options.resizingBar,
            popupDisplay: options.popupDisplay,
            videoWidth: options.videoWidth,
            videoHeight: options.videoHeight,
            imageFileInput: options.imageFileInput,
            imageUrlInput: options.imageUrlInput,
            imageUploadUrl: options.imageUploadUrl,
            imageWidth: options.imageWidth,
            imageMaxSize: options.imageMaxSize,
            imageTotalMaxSize: options.imageTotalMaxSize,
            imageMaxCount: options.imageMaxCount,
            font: options.font,
            fontSize: options.fontSize,
            colorList: options.colorList,
            height: options.height,
            minHeight: options.minHeight,
            maxHeight: options.maxHeight,
            showPathLabel: options.showPathLabel,
            display: options.display
        }
    };
};

export default _Context;