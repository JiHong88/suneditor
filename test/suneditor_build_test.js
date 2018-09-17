import {css} from '../src/index'

import suneditor from '../src/suneditor'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from '../src/plugins/plugins_init'
import {dialog} from '../src/plugins/modules_init'
import lang_ko from '../src/lang/ko'

import custom_plugin_submenu from './custom_plugin_submenu'


suneditor.create(document.getElementById('editor'), {
    modules: [
        dialog
    ],
    buttonList: [
        ['undo', 'redo'],
        [font, fontSize, formatBlock],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/',
        [fontColor, hiliteColor],
        ['indent', 'outdent'],
        [align, horizontalRule, list, table],
        [link, image, video],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ]
});


const editor = suneditor.init({
    plugins: [
        hiliteColor,
        align,
        horizontalRule,
        list,
        table,
        custom_plugin_submenu
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

editor.create(document.getElementById('editor2'));
editor.create(document.getElementById('editor3'), {
    buttonList: [
        ['align', 'horizontalRule', 'list', 'table',
            {
                // plugin's name attribute
                name: 'custom_plugin_submenu', 
                // name of the plugin to be recognized by the toolbar.
                // It must be the same as the name attribute of the plugin 
                dataCommand: 'custom_plugin_submenu',
                // button's class ("btn_editor" class is registered, basic button click css is applied.)
                buttonClass:'btn_editor', 
                // HTML title attribute
                title:'Custom plugin of the submenu', 
                // 'submenu' or 'dialog' or '' (command button)
                dataDisplay:'submenu',
                // 'full' or '' (Only applies to dialog plugin.)
                displayOption:'',
                // HTML to be append to button
                innerHTML:'<div class="icon-map-pin"></div>'
            }]
    ],
    lang: lang_ko
});
