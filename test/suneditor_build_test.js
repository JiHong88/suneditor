'use strict';

import '../src/assets/css/suneditor.css';
import '../src/assets/css/suneditor-contents.css';

import suneditor from '../src/suneditor';
import plugins from '../src/plugins';
import { ko } from '../src/lang';

import custom_plugin_submenu from './custom_plugin_submenu';


suneditor.create(document.getElementById('editor'), {
    plugins: plugins,
    buttonList: [
        ['undo', 'redo',
        'font', 'fontSize', 'formatBlock',
        'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
        'removeFormat',
        'fontColor', 'hiliteColor',
        'indent', 'outdent',
        'align', 'horizontalRule', 'list', 'table',
        'link', 'image', 'video',
        'fullScreen', 'showBlocks', 'codeView',
        'preview', 'print']
    ]
});


const editor = suneditor.init({
    plugins: [
        plugins.hiliteColor,
        plugins.align,
        plugins.horizontalRule,
        plugins.list,
        plugins.table,
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
        ['align', 'horizontalRule', 'list', 'table', plugins.link,
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
    lang: ko
});
