/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    toolbar: {
        font: 'Font',
        formats: 'Formats',
        fontSize: 'Size',
        bold: 'Bold',
        underline: 'Underline',
        italic: 'Italic',
        strike: 'Strike',
        subscript: 'Subscript',
        superscript: 'Superscript',
        removeFormat: 'Remove Format',
        fontColor: 'Font Color',
        hiliteColor: 'Hilite Color',
        indent: 'Indent',
        outdent: 'Outdent',
        align: 'Align',
        alignLeft: 'Align left',
        alignRight: 'Align right',
        alignCenter: 'Align center',
        justifyFull: 'Justify full',
        list: 'list',
        orderList: 'Ordered list',
        unorderList: 'Unordered list',
        horizontalRule: 'horizontal line',
        hr_solid: 'solid',
        hr_dotted: 'dotted',
        hr_dashed: 'dashed',
        table: 'Table',
        link: 'Link',
        image: 'Image',
        video: 'Video',
        fullScreen: 'Full screen',
        showBlocks: 'Show blocks',
        codeView: 'Code view',
        undo: 'Undo',
        redo: 'Redo',
        preview: 'Preview',
        print: 'print',
        tag_p: 'Paragraph',
        tag_div: 'Normal (DIV)',
        tag_h: 'Header',
        tag_quote: 'Quote',
        pre: 'Code'
    },
    dialogBox: {
        linkBox: {
            title: 'Insert Link',
            url: 'URL to link',
            text: 'Text to display',
            newWindowCheck: 'Open in new window'
        },
        imageBox: {
            title: 'Insert image',
            file: 'Select from files',
            url: 'Image URL',
            caption: 'Insert image description',
            altText: 'Alternative text'
        },
        videoBox: {
            title: 'Insert Video',
            url: 'Media embed URL, YouTube'
        },
        close: 'Close',
        submitButton: 'Submit',
        revertButton: 'Revert',
        proportion: 'constrain proportions',
        width: 'Width',
        height: 'Height',
        basic: 'Basic',
        left: 'Left',
        right: 'Right',
        center: 'Center'
    },
    controller: {
        edit: 'Edit',
        remove: 'Remove',
        insertRowAbove: 'Insert row above',
        insertRowBelow: 'Insert row below',
        deleteRow: 'Delete row',
        insertColumnBefore: 'Insert column before',
        insertColumnAfter: 'Insert column after',
        deleteColumn: 'Delete column',
        resize100: 'Resize 100%',
        resize75: 'Resize 75%',
        resize50: 'Resize 50%',
        resize25: 'Resize 25%',
        mirrorHorizontal: 'Mirror, Horizontal',
        mirrorVertical: 'Mirror, Vertical'
    }
};
