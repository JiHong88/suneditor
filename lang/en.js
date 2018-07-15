/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
if (typeof window.SUNEDITOR === 'undefined') {
    window.SUNEDITOR = {};
    SUNEDITOR.plugin = {};
}

SUNEDITOR.lang = {
    toolbar: {
        font: 'Font',
        formats: 'Formats',
        fontSize: 'Size',
        bold: 'Bold',
        underline: 'Underline',
        italic: 'Italic',
        strike: 'Strike',
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
        line: 'Line',
        table: 'Table',
        link: 'Link',
        image: 'Image',
        video: 'Video',
        fullScreen: 'Full Screen',
        codeView: 'Code View',
        undo: 'Undo',
        redo: 'Redo',
        preview: 'Preview',
        print: 'print',
        tag_p: 'Paragraph',
        tag_div: 'Normal (DIV)',
        tag_h: 'Header'
    },
    dialogBox: {
        linkBox: {
            title: 'Insert Link',
            url: 'URL to link',
            text: 'Text to display',
            newWindowCheck: 'Open in new window'
        },
        imageBox: {
            title: 'Insert Image',
            file: 'Select from files',
            url: 'Image URL',
            resize100: 'resize 100%',
            resize75: 'resize 75%',
            resize50: 'resize 50%',
            resize25: 'resize 25%',
            remove: 'remove image',
            caption: 'Insert image description',
            altText: 'Alternative Text'
        },
        videoBox: {
            title: 'Insert Video',
            url: 'Media embed URL, YouTube'
        },
        submitButton: 'Submit',
        width: 'Width',
        height: 'Height',
        basic: 'Basic',
        left: 'Left',
        right: 'Right',
        center: 'Center'
    },
    editLink: {
        edit: 'Edit',
        remove: 'Remove'
    }
};