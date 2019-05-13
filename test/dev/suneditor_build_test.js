'use strict';

import '../../src/assets/css/suneditor.css';
import '../../src/assets/css/suneditor-contents.css';

import suneditor from '../../src/suneditor';
import plugins from '../../src/plugins';
import { ko } from '../../src/lang';

import custom_plugin_submenu from './custom_plugin_submenu';


let s1 = suneditor.create(document.getElementById('editor'), {
    plugins: plugins,
    buttonList: [
        [
        'formatBlock', 'fontColor', 'fontSize',
        'bold', 'underline', 'italic', 'strike',
        'removeFormat', 'table',
        'link',
        ]
    ],
    height: 'auto',
    width: '500px',
    mode: 'balloon',
    stickyToolbar: '0',
    videoResizing: false,
    imageWidth: 150
});

window.sun_destroy1 = function () {
    s1.destroy();
}

window.sun_create1 = function () {
    s1 = suneditor.create('editor', {
    });
}


let ss = suneditor.create(document.getElementById('editor1'), {
    plugins: plugins,
    buttonList: [
        ['undo', 'redo','removeFormat',
        'font', 'fontSize', 'formatBlock',
        'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
        'fontColor', 'hiliteColor',
        'outdent', 'indent',
        'align', 'horizontalRule', 'list', 'table',
        'link', 'image', 'video',
        'fullScreen', 'showBlocks', 'codeView',
        'preview', 'print', 'save']
    ],
    width: '100%',
    stickyToolbar: 0,
    mode: 'inline',
    toolbarWidth: 800,
    height: 'auto',
    tableWidth: 'auto'
    // callBackSave: (contents) => {
    //     console.log('callback')
    // }
});

ss.onScroll = function (e) {
    console.log('onScroll', e);
};
ss.onClick = function (e) {
    console.log('onClick', e);
};
ss.onKeyDown = function (e) {
    console.log('onKeyDown', e);
};
ss.onKeyUp = function (e) {
    console.log('onKeyUp', e);
};
ss.onDrop = function (e) {
    console.log('onDrop', e);
};

ss.onChange = function (contents) {
    console.log('change')
}

ss.onImageUpload = function () {
    console.log(ss.getImagesInfo());
}

window.sun_noticeOpen = function () {
    ss.noticeOpen('test notice');
}

window.sun_noticeClose = function () {
    ss.noticeClose();
}

window.sun_save = function () {
    ss.save();
}

window.sun_getContext = function () {
    console.log(ss.getContext());
}

window.sun_getImagesInfo = function () {
    console.log(ss.getImagesInfo());
    ss.getImagesInfo().list[0].select();
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
        plugins.link,
        custom_plugin_submenu
    ],
    width: '100%',
});

let s2 = editor.create(document.getElementById('editor2'), {
    plugins: plugins,
    minHeight: '150px',
    maxHeight: '500px',
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        ['fontColor', 'hiliteColor'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'table'],
        ['link', 'image', 'video'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['save'],
    ],
    callBackSave: function (contents) {
        alert(contents)
    }
        
});
window.sun_destroy2 = function () {
    s2.destroy();
}

window.sun_create2 = function () {
    s2 = suneditor.create('editor2', {
    });
}

let s3 = editor.create(document.getElementsByName('editor3')[0], {
    buttonList: [
        ['align', 'horizontalRule', 'list', 'table', 'codeView', plugins.link, plugins.fontColor, plugins.hiliteColor, plugins.fontSize],
        [
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
                // HTML to be append to button
                innerHTML:'<i class="icon-checked"></i>'
            }
        ]
    ],
    lang: ko,
    width: '100%',
    stickyToolbar: false,
    popupDisplay: 'local'
});
window.sun_destroy3 = function () {
    s3.destroy();
}

window.sun_create3 = function () {
    s3 = suneditor.create(document.getElementsByName('editor3')[0], {
    });
}
