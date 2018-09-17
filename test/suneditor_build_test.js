import '../src/assets/css/suneditor.css'
import '../src/assets/css/suneditor-contents.css'

import suneditor from '../src/suneditor'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from '../src/plugins/plugins_init'
import {dialog} from '../src/plugins/modules_init'
import lang_ko from '../src/lang/ko'

import custom_plugin_test from './custom_plugin_test'


const editor = suneditor.init({
    plugins: [
        hiliteColor,
        align,
        horizontalRule,
        list,
        table,
        custom_plugin_test
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
editor.create(document.getElementById('editor2'), {
    buttonList: [
        ['align', 'horizontalRule', 'list', 'table',
            {
                name: 'custom_plugin_test',
                buttonClass:'',
                title:'custom_plugin_test',
                dataCommand:'custom_plugin_test',
                dataDisplay:'submenu',
                displayOption:'',
                innerHTML:'<div class="icon-map-pin"></div>'
            }]
    ],
    lang: lang_ko
});

suneditor.create(document.getElementById('editor3'), {
    modules: [
        dialog
    ],
    buttonList: [
        ['undo', 'redo'],
        [font, fontSize, formatBlock],
        [fontColor, hiliteColor],
        [align, horizontalRule, list, table],
        [link, image, video],
    ]
});