'use strict';

import '../../src/assets/css/suneditor.css';
import '../../src/assets/css/suneditor-contents.css';

import suneditor from '../../src/suneditor';
import plugins from '../../src/plugins';
import { ko } from '../../src/lang';
import lang from '../../src/lang';

import custom_plugin_submenu from './custom_plugin_submenu';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import CodeMirror from 'codemirror';

import lineHeight from '../../src/plugins/submenu/lineHeight'

const align = require('../../src/plugins/submenu/align')

suneditor.create('editor', {
  plugins: [align],
  buttonList: [['align']]
})

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
    s1.destroy();
}

window.sun_create1 = function () {
    s1 = suneditor.create('editor', {
    });
}


let ss = window.ss = suneditor.create(document.getElementById('editor1'), {
    lang: lang.ko,
    plugins: plugins,
    buttonList: [
        ['undo', 'redo','removeFormat',
        'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'textStyle',
        'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
        'fontColor', 'hiliteColor',
        'outdent', 'indent',
        'align', 'horizontalRule', 'list', 'table',
        'link', 'image', 'video',
        'fullScreen', 'showBlocks', 'codeView',
        'preview', 'print', 'save']
    ],
    height: 'auto',
    width: '100%',
    youtubeQuery :'autoplay=1&mute=1&enablejsapi=1',
    // videoHeightShow: false,
    // videoRatioShow: false,
    // imageHeightShow: false,
    // imageRotation: true,
    // imageResizing: false,
    // imageSizeOnlyPercentage: true,
    // videoResizing: false,
    // videoSizeOnlyPercentage: true
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

ss.showInline = function (toolbar, context) {

},

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
    console.log(ss.getContents());
}

window.sun_setContents = function (content) {
    ss.setContents(content);
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
    mode: 'balloon',
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
    plugins: plugins,
    mode: 'classic',
    maxHeight: '400px',
    height: 150,
    imageWidth: '100%',
    colorList: null,
    iframe: true,
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
                innerHTML:'<i class="se-icon-checked"></i>'
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
    placeholder: 'Start typing something.4..'
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
        height: 'auto',
        placeholder: 'Start typing something..5.'
        // callBackSave: (contents) => {
        //     console.log('callback')
        // }
    });
}