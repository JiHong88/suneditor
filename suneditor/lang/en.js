/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
if(typeof window.SUNEDITOR === 'undefined') {window.SUNEDITOR = {}; SUNEDITOR.plugin = {};}

SUNEDITOR.lang = {
    toolbar : {
        fontFamily : 'Font',
        fontFamilyDelete : 'Remove Font Family',
        formats : 'Formats',
        fontSize : 'Size',
        bold : 'Bold',
        underline : 'Underline',
        italic : 'Italic',
        strike : 'Strike',
        fontColor : 'Font Color',
        hiliteColor : 'Background Color',
        indent : 'Indent',
        outdent : 'Outdent',
        align : 'Align',
        alignLeft : 'Align left',
        alignRight : 'Align right',
        alignCenter : 'Align center',
        justifyFull : 'Justify full',
        list : 'list',
        orderList : 'Ordered list',
        unorderList : 'Unordered list',
        line : 'Line',
        table : 'Table',
        link : 'Link',
        image : 'Picture',
        video : 'Video',
        fullScreen : 'Full Screen',
        htmlEditor : 'Code View',
        undo : 'Undo',
        redo : 'Redo'
    },
    dialogBox : {
        linkBox : {
            title : 'Insert Link',
            url : 'URL to link',
            text : 'Text to display',
            newWindowCheck : 'Open in new window'
        },
        imageBox : {
            title : 'Insert Image',
            file : 'Select from files',
            url : 'Image URL',
            resize100 : 'resize 100%',
            resize75 : 'resize 75%',
            resize50 : 'resize 50%',
            resize25 : 'resize 25%',
            remove : 'remove image'
        },
        videoBox : {
            title : 'Insert Video',
            url : 'Media embed URL, YouTube',
            width : 'Width',
            height : 'Height'
        },
        submitButton : 'Submit'
    },
    editLink : {
        edit : 'Edit',
        remove : 'Remove'
    }
};