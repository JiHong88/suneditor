'use strict';

import '../../src/assets/css/suneditor.css';
import '../../src/assets/css/suneditor-contents.css';

import suneditor from '../../src/suneditor';
import plugins from '../../src/plugins';
import { ko } from '../../src/lang';

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
    ],
    height: 'auto',
    width: '100%'
});

let ss = suneditor.create(document.getElementById('editor1'), {
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
    ],
    width: '100%'
});

window.sun_save = function () {
    ss.save();
}

window.sun_getContext = function () {
    console.log(ss.getContext());
}

window.sun_insertHTML = function (html) {
    ss.insertHTML(html)
}

window.sun_getContents = function () {
    alert(ss.getContents());
}

window.sun_setContents = function (content) {
    ss.setContents(content);
}

window.sun_appendContents = function (content) {
    ss.appendContents(content);
}

window.sun_disabled = function () {
    ss.disabled();
}

window.sun_enabled = function () {
    ss.enabled();
}

window.sun_show = function () {
    ss.show();
}

window.sun_hide = function () {
    ss.hide();
}

window.sun_destroy = function () {
    ss.destroy();
}

window.sun_create = function () {
    ss = suneditor.create('editor1', {
        height: 148
    });
}


const editor = suneditor.init({
    plugins: [
        plugins.hiliteColor,
        plugins.align,
        plugins.horizontalRule,
        plugins.list,
        plugins.table,
        custom_plugin_submenu
    ],
    width: '100%'
});

editor.create(document.getElementById('editor2'));
editor.create(document.getElementsByName('editor3')[0], {
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
    lang: ko,
    width: '100%'
});
