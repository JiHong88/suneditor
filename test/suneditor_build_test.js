import '../src/assets/css/suneditor.css'
import '../src/assets/css/suneditor-contents.css'

import suneditor from '../src/suneditor'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from '../src/plugins/plugins_init'
import {dialog} from '../src/plugins/modules_init'
import lang_ko from '../src/lang/ko'


const editor = suneditor.init({
    plugins: [
        hiliteColor,
        align,
        horizontalRule,
        list,
        table,
    ],
    buttonList: [
        ['undo', 'redo'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/',
        ['indent', 'outdent'],
        ['align', 'horizontalRule', 'list', 'table'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ]
});

editor.create(document.getElementById('editor'));


const editor2 = suneditor.init({
    modules: [
        dialog
    ],
    plugins: [
        font,
        fontSize,
        formatBlock,
        fontColor,
        hiliteColor,
        align,
        horizontalRule,
        list,
        table,
        link,
        image,
        video
    ],
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock']
    ],
    lang: lang_ko
});

editor2.create(document.getElementById('editor2'), {
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/',
        ['fontColor', 'hiliteColor'],
        ['indent', 'outdent'],
        ['align', 'horizontalRule', 'list', 'table'],
        ['link', 'image', 'video'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ]
});


suneditor.create(document.getElementById('editor3'), {
    buttonList: [
        ['undo', 'redo'],
        [font, fontSize, formatBlock],
        [fontColor, hiliteColor],
        [align, horizontalRule, list, table],
        [link, image, video],
    ]
});