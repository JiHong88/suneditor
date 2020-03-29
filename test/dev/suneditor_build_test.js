'use strict';

import '../../src/assets/css/suneditor.css';
import '../../src/assets/css/suneditor-contents.css';

import suneditor from '../../src/suneditor';
import plugins from '../../src/plugins';
import { ko } from '../../src/lang';
import lang from '../../src/lang';

import custom_plugin_submenu from './custom_plugin_submenu';
import custom_plugin_dialog from './custom_plugin_dialog';
import Resolutions from './Resolutions';
import custom_container from './custom_container';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import CodeMirror from 'codemirror';


import 'katex/dist/katex.min.css';
import Katex from 'katex';


const align = require('../../src/plugins/submenu/align')


suneditor.create("sample1", {
    plugins: [custom_plugin_dialog, custom_container, Resolutions, plugins.template, plugins.blockquote, plugins.link, plugins.table, plugins.textStyle],
    // mode: "balloon",
    // iframe: true,
    width: '100%',
    height: '500px',
    imageFileInput: false,
    buttonList: [
        [
            {
                name: 'customLink', 
                dataCommand: 'customLink',
                buttonClass:'', 
                title:'Custom - Link', 
                dataDisplay:'dialog',
                innerHTML:'D'
            },
            {
                name: 'custom_container', 
                dataCommand: 'custom_container',
                buttonClass:'', 
                title:'Custom - Container', 
                dataDisplay:'container',
                innerHTML:'C'
            },
            {
                name: 'Resolutions', 
                dataCommand: 'Resolutions',
                buttonClass:'', 
                title:'Resolutions - Container', 
                dataDisplay:'submenu',
                innerHTML:'S'
            },
            'bold', 'italic', 'template'
        ]
    ],
    maxCharCount: 2000
});


let s1 = suneditor.create('editor', {
    plugins: plugins,
    // mode: 'balloon-always', 
    katex: Katex,
    // attributesWhitelist: 'style',
    buttonList: [
        ['undo', 'redo',
        'font', 'fontSize', 'formatBlock',
        'blockquote', 'paragraphStyle',
        'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
        'fontColor', 'hiliteColor', 'textStyle',
        'removeFormat',
        'outdent', 'indent',
        'list',
        'align', 'horizontalRule', 'lineHeight',
        'table', 'link', 'image', 'video', 'math',
        'fullScreen', 'showBlocks', 'codeView',
        'preview', 'print', 'save', 'template']
    ],
    icons: {
        undo: 'U',
        bold: '<span class="se-icon-text">B</span>'
    },
    width: '100%',
    height: '500',
    defaultStyle: 'font-size: 10px;',
    // fullPage: true,
    // pasteTagsWhitelist: 'p|h[1-6]',
    // attributesWhitelist: {
    //     table: "style",
    //     tbody: "style",
    //     thead: "style",
    //     tr: "style",
    //     td: "style"
    // },
    addTagsWhitelist: '//',
    // addTagsWhitelist: '//',
    formats: [
        { 
            tag: 'div', // Tag name
            name: 'NORMAL', // default: tag name 
            command: 'free', // default: "replace" 
            class: '__se__format__free_NORMAL', // Class names must always begin with "__se__format__" 
        }, 
        { 
            tag: 'div', // Tag name
            name: 'CODE', // default: tag name 
            command: 'replace', // default: "replace" 
            class: '__se__format__replace_CODE', // Class names must always begin with "__se__format__" 
        },
        'pre',
        'blockquote'
    ],
    charCounterType: 'byte',
    charCounterLabel: 'BYTE : ',
    maxCharCount: 2000
})

// s1.core._charCount = function (nextCharCount, blink) {
//     const charCounter = this.context.element.charCounter;
//     if (!charCounter) return true;
//     if (!nextCharCount || nextCharCount < 0) nextCharCount = 0;

//     const maxCharCount = this.context.options.maxCharCount;
//     const wysiwyg = this.context.element.wysiwyg;

//     ///// -- get empty list ////
//     const emptyListCount = this.util.getListChildren(wysiwyg, function (current) {
//         return this.isListCell(current) && current.childNodes.length === 1 && this.isBreak(current.firstChild)
//     }.bind(this.util)).length;
//     //// ------------------ ////

//     this._w.setTimeout(function () {
//         charCounter.textContent = wysiwyg.textContent.length + emptyListCount; // add empty list
//     });

//     if (maxCharCount > 0) {
//         let over = false;
//         const count = wysiwyg.textContent.length + emptyListCount; // add empty list
        
//         if (count > maxCharCount) {
//             this._editorRange();
//             const range = this.getRange();
//             const endOff = range.endOffset - 1;
//             const text = this.getSelectionNode().textContent;

//             this.getSelectionNode().textContent = text.slice(0, range.endOffset - 1) + text.slice(range.endOffset, text.length);
//             this.setRange(range.endContainer, endOff, range.endContainer, endOff);
//             over = true;
//         } else if ((count + nextCharCount) > maxCharCount) {
//             over = true;
//         }

//         if (over) {
//             if (blink && !this.util.hasClass(charCounter, 'se-blink')) {
//                 this.util.addClass(charCounter, 'se-blink');
//                 this._w.setTimeout(function () {
//                     this.removeClass(charCounter, 'se-blink');
//                 }.bind(this.util), 600);
//             }

//             return false;
//         }
//     }

//     return true;
// }.bind(s1.core)

window.cm = CodeMirror

// let s1 = window.s1 = suneditor.create(document.getElementById('editor'), {
//     plugins: [lineHeight],
//     buttonList: [
//         [
//             'lineHeight'
//         ]
//     ],
//     height: 'auto',
//     width: '500px',
//     // mode: 'balloon',
//     stickyToolbar: '0',
//     videoResizing: false,
//     imageWidth: 150,
//     placeholder: 'Start typing something...'
//     // fullPage: true,
    
// });

window.sun_destroy1 = function () {
    s1.destroy()
    // s1.setDefaultStyle('font-family: cursive; font-size: 10px;');
    // s1.setContents('<!DOCTYPE html>'+
    // '<html lang="en">'+
    // '<head>'+
    //     '<meta charset="UTF-8">'+
    //     '<meta name="viewport" content="width=device-width, initial-scale=1">'+
    //     '<meta name="author" content="https://github.com/JiHong88" />'+
    //     '<meta name="description" content="Pure javascript wysiwyg web editor" /> <!-- meta comment -->'+
    // '<style>'+
    // '/* css comment goes here */'+
    // '</style>'+
    // '</head>'+
    // '<body>'+
    // '<!-- html comment goes here -->'+

    // '</body>'+
    // '</html>')
}

window.sun_create1 = function () {
    // s1.destroy();
    // s1 = suneditor.create('editor', {
    //     plugins: [align, plugins.link],
    //     buttonList: [['align', 'link', 'bold', 'underline', 'italic', 'strike', 'removeFormat', 'codeView']],
    //     width: '100%',
    //     height: 'auto'
    //   })
}

s1.onKeyDown = function (e, core) {
    const keyCode = e.keyCode
    const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92;
    if (ctrl && keyCode === 187) {
        e.preventDefault();
        const anchor = core.util.getParentElement(core.getSelectionNode(), core.util.isAnchor)
        if (anchor) {
            window.open(anchor.href)
        }
    }
}

let ss = window.ss = suneditor.create(document.getElementById('editor1'), {
    // lang: lang.ko,
    plugins: plugins,
    // mode: 'balloon-always',
    buttonList: [
        ['undo', 'redo',
        'font', 'fontSize', 'formatBlock',
        'blockquote', 'paragraphStyle',
        'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
        'fontColor', 'hiliteColor', 'textStyle',
        'removeFormat',
        'outdent', 'indent',
        'align', 'horizontalRule', 'list', 'lineHeight',
        'table', 
        'link', 'image', 'video', 'math',
        'fullScreen', 'showBlocks', 'codeView',
        'preview', 'print', 'save', 'template']
    ],
    // maxCharCount: 20,
    katex: Katex,
    height: 'auto',
    width: '100%',
    youtubeQuery :'autoplay=1&mute=1&enablejsapi=1',
    placeholder: 'SSSFdjskfdsff.f.fdsa.f...',
    fullPage: true,
    addTagsWhitelist: 'mark|canvas|label|select|option|input|nav|button',
    imageUploadUrl: 'http://localhost:3000/files/upload',
    // attributesWhitelist: {
    //     table: "style",
    //     tbody: "style",
    //     thead: "style",
    //     tr: "style",
    //     td: "style"
    // },
    templates: [
        {
            name: 'Template-1',
            html: '<p>HTML source1</p>'
        },
        {
            name: 'Template-2',
            html: '<p>HTML source2</p>'
        }
    ],
    // mode: 'inline',
    // videoHeightShow: false,
    // videoRatioShow: false,
    // imageHeightShow: false,
    // imageRotation: true,
    // imageResizing: false,
    // imageSizeOnlyPercentage: true,
    // videoResizing: false,
    // videoSizeOnlyPercentage: true
});
// ss.setContents('fsafsa')
ss.onload = function (core) {
    console.log('onload', core);
    // core.focus();
};
ss.onScroll = function (e) {
    console.log('onScroll', e);
};
ss.onClick = function (e) {
    console.log('onClick', e);
};
ss.onFocus = function (e, core) {
    console.log('onFocus', e);
};
ss.onBlur = function (e, core) {
    console.log('onBlur', e);
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

// ss.imageUploadHandler = function (response, core) {
//     console.log('rrrr', response)
// }

ss.onImageUploadBefore = function (files, info, core) {
    console.log('files--', files);
    console.log('info--', info);
    return true;
}

ss.onImageUpload = function () {
    console.log(ss.getImagesInfo());
}

ss.showInline = function (toolbar, context) {

},

ss.showController = function (name, controllers, core) {
    let c = null;
    console.log('target', core.currentControllerTarget);
    for (let i in controllers) {
        c = controllers[i];
        if (core.util.hasClass(c, 'se-controller-resizing')) {
            const updateButton = c.querySelector('[data-command="update"]');
            if (name === 'image') updateButton.setAttribute('disabled', true);
            else updateButton.removeAttribute('disabled');
        }
    }
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
    ss.insertHTML('aaaaa')
}

window.sun_getContents = function () {
    // alert(ss.getContents());

    console.log(ss.getContents());

    // ss.core.commandHandler(null, 'selectAll')
    // let t = '';
    // const lines = ss.core.getSelectedElements();
    // for (let i = 0, len = lines.length; i < len; i++) {
    //     t += lines[i].textContent + '\n';
    // }
    // console.log(t);

    // console.log(ss.core.context.element.wysiwyg.textContent)
}

window.sun_setContents = function (content) {
    ss.setContents('<style>div{color: red;}</style><p><br></p><img src="https://picsum.photos/200/300"><img src="https://picsum.photos/200/300"><p><br></p>');
    ss.core.history.reset(true);
    // ss.core.context.tool.save.disabled = true;
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
    // iframe: true,
});

let s2 = window.s2 = editor.create(document.getElementById('editor2'), {
    lang: lang.ru,
    mode: 'balloon-always',
    // toolbarWidth: 500,
    plugins: plugins,
    // maxHeight: '400px',
    height: 'auto',
    // height: 400,
    fontSizeUnit: 'pt',
    imageResizing: true,
    // imageWidth: '400',
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight', 'table'],
        ['link', 'image', 'video'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['save', 'template'],
    ],
    icons: {
        underline: '',
        strike: '',
        caption: ''
    },
    templates: [
        {
            name: 'template1',
            html: '<p>fdkjslfjdslkf</p>'
        },
        {
            name: 'templeeeeeeeeeeeeeate2',
            html: '<p><strong>11111</strong></p>'
        },
        {
            name: 'template3',
            html: '<p><u>22222</u></p>'
        }
    ],
    callBackSave: function (contents) {
        alert(contents)
    },
    formats: ['h1', 'p', 'blockquote', {
        tag: 'div',
        class: '__se__format__aaa',
        name: 'custom div',
        command: 'replace'
    }],
    // iframe: true,
    // fullPage: true,
    // mode: 'balloon',
    codeMirror: CodeMirror,
    // codeMirror: {
    //     src: CodeMirror,
    //     options: {
    //         mode: 'xml'
    //     }
    // },
    // placeholder: 'Start typing something.3..'
    // imageUploadSizeLimit: 30000
});

const newOption = {
    mode: 'balloon',
    iframe: false,
    plugins: plugins,
    minHeight: '300',
    textSizeUnit: 'pt',
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
    colorList: [
        ['#ccc', '#dedede', 'OrangeRed', 'Orange', 'RoyalBlue', 'SaddleBrown'],
        ['SlateGray', 'BurlyWood', 'DeepPink', 'FireBrick', 'Gold', 'SeaGreen']
    ],
    placeholder: 'Placeholder...'
}
const newOption2 = {
    plugins: [plugins.align],
    mode: 'classic',
    maxHeight: '400px',
    height: 150,
    imageWidth: '100%',
    colorList: null,
    iframe: true,
    charCounter: true,
    maxCharCount: 200
}
const newOption3 = {
    plugins: plugins,
    mode: 'inline',
    iframe: false,
}

let imageList = [];
let selectedImages = [];
const imageWrapper = document.getElementById('image_wrapper');
const imageSize = document.getElementById('image_size');
const imageRemove = document.getElementById('image_remove');
const imageTable = document.getElementById('image_list');

window.findIndex = function (arr, index) {
    let idx = -1;

    arr.some(function (a, i) {
        if ((typeof a === 'number' ? a : a.index) === index) {
            idx = i;
            return true;
        }
        return false;
    })

    return idx;
}

window.setImage = function (type, index) {
    imageList[findIndex(imageList, index)][type]();
}

window.checkImage = function (index) {
    const li = imageTable.querySelector('#img_' + index);
    const currentImageIdx = findIndex(selectedImages, index)

    if (currentImageIdx > -1) {
        selectedImages.splice(currentImageIdx, 1)
        li.className = '';
    } else {
        selectedImages.push(index)
        li.className = 'checked';
    }

    if (selectedImages.length > 0) {
        imageRemove.removeAttribute('disabled');
    } else {
        imageRemove.setAttribute('disabled', true);
    }
}

window.deleteCheckedImages = function () {
    const iamgesInfo = s2.getImagesInfo();
    
    for (let i = 0; i < iamgesInfo.length; i++) {
        if (selectedImages.indexOf(iamgesInfo[i].index) > -1) {
            iamgesInfo[i].delete();
            i--;
        }
    }

    selectedImages = []
}

window.setImageList = function () {
    if (imageList.length > 0) imageWrapper.style.display = 'flex';
    else imageWrapper.style.display = 'none';

    let list = '';
    let size = 0;

    for (let i = 0, image, fixSize; i < imageList.length; i++) {
        image = imageList[i];
        fixSize = (image.size / 1000).toFixed(1) * 1
            
        list += '<li id="img_' + image.index + '">' +
                    '<div onclick="checkImage(' + image.index + ')">' +
                        '<div><img src="' + image.src + '"></div>' +
                    '</div>' +
                    '<a href="javascript:void(0)" onclick="setImage(\'select\',' + image.index + ')" class="image-size">' + fixSize + 'KB</a>' +
                    '<div class="image-check"><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg></div>' +
                '</li>';
        
        size += fixSize;
    }

    imageSize.innerText = size.toFixed(1) + 'KB';
    imageTable.innerHTML = list;
}

s2.onload = function (core, isUpdate) {
    console.log('2222onload222', isUpdate)
}

s2.onImageUpload = function (targetImgElement, index, state, imageInfo, remainingFilesCount) {
    console.log('imageInfo', imageInfo);

    if (state === 'delete') {
        imageList.splice(findIndex(imageList, index), 1)
    } else {
        if (state === 'create') {
            const image = s2.getImagesInfo()[findIndex(s2.getImagesInfo(), index)]
            imageList.push(image)
        } else { // update
            
        }
    }

    if (remainingFilesCount === 0) {
        console.log('imageList', imageList)
        setImageList(imageList)
    }
}

window.sun_setOptions2 = function () {
    s2.setOptions(newOption);
}

window.sun_setOptions3 = function () {
    s2.setOptions(newOption2);
}
window.sun_setOptions4 = function () {
    s2.setOptions(newOption3);
}

window.sun_insertImage2 = function () {
    s2.insertImage(document.getElementById('sun_files').files);
}


window.sun_destroy2 = function () {
    s2.destroy();
}

window.sun_create2 = function () {
    s2 = suneditor.create('editor2', {
    });
}

let s3 = editor.create(document.getElementsByName('editor3')[0], {
    buttonList: [
        [plugins.formatBlock, 'align', 'horizontalRule', 'list', 'table', 'codeView', plugins.image, plugins.video, plugins.link, plugins.link, plugins.fontColor, plugins.hiliteColor, plugins.fontSize],
        [
            {
                // plugin's name attribute
                name: 'custom_plugin_submenu', 
                // name of the plugin to be recognized by the toolbar.
                // It must be the same as the name attribute of the plugin 
                dataCommand: 'custom_plugin_submenu',
                // button's class ("se-btn" class is registered, basic button click css is applied.)
                buttonClass:'se-btn', 
                // HTML title attribute
                title:'Custom plugin of the submenu', 
                // 'submenu' or 'dialog' or '' (command button)
                dataDisplay:'submenu',
                // HTML to be append to button
                innerHTML:''
            }
        ]
    ],
    lang: ko,
    width: '100%',
    stickyToolbar: false,
    popupDisplay: 'local',
    // iframe: true,
    // maxCharCount: 300,
    // resizingBar: false
    // showPathLabel:false
    charCounter: true,
    formats: ['h1', 'h4', 'pre', 'p', 'blockquote', {
        tag: 'div',
        class: '__se__format__aaa',
        name: 'red div',
        style: 'margin: 10px; background-color: #f5f5f5;',
        command: 'replace'
    }],
    placeholder: 'Start typing something.4..',
    maxCharCount: 280,
});
window.sun_destroy3 = function () {
    s3.destroy();
}

window.sun_create3 = function () {
    s3 = suneditor.create(document.getElementsByName('editor3')[0], {
    });
}

let s4;

window.sun_create4 = function() {
    const win = window.open();
    document.querySelectorAll('link').forEach(function (linkNode) {
        win.document.write(linkNode.outerHTML);
    })
    win.document.write('<textarea name="editor4" id="editor4" style="width: 1080px; height: 200px;"></textarea>');
    s4 = suneditor.create(win.document.querySelector('#editor4'), {
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
        imageWidth: 300,
        mode: 'classic',
        // toolbarWidth: 800,
        maxCharCount: 280,
        height: 'auto',
        placeholder: 'Start typing something..5.'
        // callBackSave: (contents) => {
        //     console.log('callback')
        // }
    });
}