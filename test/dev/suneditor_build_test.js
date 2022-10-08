import '../../src/assets/suneditor.css';
import '../../src/assets/suneditor-content.css';

import suneditor from '../../src/suneditor';
// import lang from '../../src/langs';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import CodeMirror from 'codemirror';

// import 'katex/dist/katex.min.css';
import Katex from 'katex';

import blockquote from "../../src/plugins/command/blockquote";
import align from "../../src/plugins/dropdown/align";
import font from "../../src/plugins/dropdown/font";
import fontColor from "../../src/plugins/dropdown/fontColor";
import backgroundColor from "../../src/plugins/dropdown/backgroundColor";
import fontSize from "../../src/plugins/dropdown/fontSize";
import formatBlock from "../../src/plugins/dropdown/formatBlock";
import horizontalLine from "../../src/plugins/dropdown/horizontalLine";
import lineHeight from "../../src/plugins/dropdown/lineHeight";
import list from "../../src/plugins/dropdown/list";
import paragraphStyle from "../../src/plugins/dropdown/paragraphStyle";
import template from "../../src/plugins/dropdown/template";
import textStyle from "../../src/plugins/dropdown/textStyle";
import table from "../../src/plugins/dropdown/table";
import math from "../../src/plugins/modal/math";
import link from "../../src/plugins/modal/link";
import audio from "../../src/plugins/modal/audio";
import image from "../../src/plugins/modal/image";
import video from "../../src/plugins/modal/video";

window.e = suneditor.create(document.getElementById('editor2'), {
    // value: '<h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2>',
    // textDirection: 'rtl',
    charCounter: true,
    // tableCellControllerPosition: 'top',
    statusbar: true,
    // mode: "inline",
    imageUploadUrl: 'http://localhost:3000/editor/upload',
    videoUploadUrl: 'http://localhost:3000/editor/upload',
    audioUploadUrl: 'http://localhost:3000/editor/upload',
    katex: Katex,
    width: "100%",
    height: '500px',
    minHeight : 300,
    charCounter: true,
    font: [
        'Vazir', 'Arial', 'Comic Sans MS', 'Courier New', 'Impact',
        'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'
    ],
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
    // iframe: true,
    // iframe_fullPage: true,
    linkRel: [
        'author',
        'external',
        'help',
        'license',
        'next',
        'follow',
        'nofollow',
        'noreferrer',
        'noopener',
        'prev',
        'search',
        'tag'
    ],
    linkRelDefault: 'noreferrer noopener',
    linkTargetNewWindow: true,
    linkProtocol: 'https://',
    imageMultipleFile: true,
    imageResizing: true,
    plugins: [align, blockquote, font, fontColor, backgroundColor, fontSize, formatBlock, horizontalLine, lineHeight, list,
        paragraphStyle, template, textStyle, table, math, link, audio, image, video
    ],
    buttonList: [
        ['undo', 'redo'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['align', 'blockquote', 'font', 'fontColor', 'backgroundColor', 'fontSize', 'formatBlock', 'horizontalLine'],
        ['lineHeight', 'list', 'paragraphStyle', 'template', 'textStyle', 'table'],
        ['math', 'link', 'audio', 'image', 'video']
    ],
    events: {
        onAudioUpload: (a, b, c, d, e) => {
            window.d = d;
        }
    }
});

// window.e.events.onAudioUpload = () => {
//     console.log("arg", arguments)
// }

// const complexEditor = null;

// // shadowroot test
// const shadow = document.querySelector('#app').attachShadow({ mode: 'open' })
// const appEl = document.createElement('textarea')
// const appStyle = document.createElement('style')

// shadow.appendChild(appStyle);
// shadow.appendChild(appEl);
// suneditor.create(appEl, {
//     mode: "balloon",
//     katex: Katex,
//     width: '400px',
//     height: 500,
//     buttonList: complexEditor
// })

// let ssss = suneditor.create(("sample1"), {
//     // font: [
//     //     'Arial', 'Impact', 'Georgia', 'tahoma', 'Verdana'
//     // ],
//     toolbar_container: document.getElementById('test_tool2'),
//     tabDisable: true,
//     mode: "balloon",
//     linkProtocol: 'https://',
// });

// // ssss.disable();

// // ssss.setContent(`<p><br /></p><div class="se-component se-image-container __se__float-none"><img src="http://suneditor.com/docs/cat.jpg" alt="" style="" /></div><p><br /></p>`)


// suneditor.create('scrolleditor', {
//     // mode: 'balloon-always',
//     katex: Katex,
//     // attributeWhitelist: 'style',
//     buttonList: [
//         ['font', 'fontSize', 'formatBlock'],
//     ],
// })

// let s1 = suneditor.create('editor', {
//     mode: "balloon-always",
//     value: '',
//     statusbar: false,
//     statusbar_showPathLabel: false,
//     display: "inline",  
//     tabDisable: false,
//     placeholder: "Enter the question image here",
// })


// window.sun_destroy1 = function () {
//     s1.destroy()

// }

// window.sun_create1 = function () {
//     // s1.destroy();
//     s1 = suneditor.create('editor', {
//         buttonList: [['align', 'link', 'bold', 'underline', 'italic', 'strike', 'removeFormat', 'codeView']],
//         width: '100%',
//         height: 'auto'
//       })
// }

// s1.onKeyDown = function (e, core) {
//     const keyCode = e.keyCode
//     const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92;
//     if (ctrl && keyCode === 187) {
//         e.preventDefault();
//         const anchor = core.util.getParentElement(core.getSelectionNode(), core.util.isAnchor)
//         if (anchor) {
//             window.open(anchor.href)
//         }
//     }
// }

// let ss = window.ss = suneditor.create(document.getElementById('editor1'), {
    
//     lineAttrReset: '*',
//     alignItems: ['left', 'right', 'center'],
//     value: `<p>ss&nbsp; fdf fdsfa fds</p>

//     <p>a fdsa fdsa fdas</p>
    
//     <p>&nbsp;dsa fdsa fdsa fdsa<br>
//     </p>
//     `,
//     linkTargetNewWindow: true,
//     imageAlignShow: false,
//     katex: Katex,
//     codeMirror: CodeMirror,
//     // value: '<html bgcolor="e4e4e4"><p><meta content="text/html; charset=utf-8"http-equiv="Content-Type"><title>Postman</title><p><body bgcolor="e4e4e4"style="margin:0;padding:0"><p><table cellpadding="0"cellspacing="0"width="100%"bgcolor="e4e4e4"><tr><td><p><table cellpadding="20"cellspacing="0"align="center"id="top-message"width="600"><tr><td><table cellpadding="10"cellspacing="0"align="center"id="header"><tr><td bgcolor="434343"width="570"><table cellpadding="0"cellspacing="0"align="center"id="content-1"><tr><td width="100"valign="top"><table cellpadding="5"cellspacing="0"><tr><td bgcolor="434343"><img src="https://www.guidovisser.com/bell-small.png"></table><td width="370"><h1 style="font-family:Arial,Helvetica Neue,Helvetica,sans-serif;font-size:30px;padding-top:25px;color:#fff">Awesome HTML Email Template</h1><td width="100"valign="top"colspan="3"><table cellpadding="5"cellspacing="0"><tr><td bgcolor="434343"><img src="https://www.guidovisser.com/pixel.png"></table></table><!-- content 1 --><tr><td bgcolor="ffffff"width="570"style="font-family:Arial,Helvetica Neue,Helvetica,sans-serif">TEST TEXT<tr><td bgcolor="434343"width="570"><p><table cellpadding="10"cellspacing="0"width="100%"><tr><td bgcolor="434343"><tr><td style="color:#fff;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"align="center"cellspacing="10"><!-- <a href="https://guidovisser.com" style="background-color: #D2694B; color: #ffffff; height:25px; text-decoration: none;">Go to Test Testing</a> --><!-- <a href="$(SELFRESLINK)" style="background-color: #D2694B;color: #ffffff; text-decoration: none;">Go to Henk Henken</a> --><!--[if mso]><v:roundrect xmlns_v="urn:schemas-microsoft-com:vml"xmlns_w="urn:schemas-microsoft-com:office:word"href="https://guidovisser.com"style="height:36px;v-text-anchor:middle;width:200px"arcsize="5%"strokecolor="#D2694B"fillcolor="#D2694B"><w:anchorlock><center style="color:#fff;font-family:Helvetica,Arial,sans-serif">I am a button →</center></v:roundrect><![endif]--> <a href="https://guidovisser.com"style="background-color:#d2694b;border:1px solid #d2694b;border-radius:3px;color:#fff;display:inline-block;font-family:sans-serif;line-height:44px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all">Go to Test</a><td style="color:#fff;font-family:Arial,Helvetica Neue,Helvetica,sans-serif"align="center"cellpadding="10"><!--[if mso]><v:roundrect xmlns_v="urn:schemas-microsoft-com:vml"xmlns_w="urn:schemas-microsoft-com:office:word"href="$(SELFRESLINK)"style="height:36px;v-text-anchor:middle;width:200px"arcsize="5%"strokecolor="#D2694B"fillcolor="#D2694B"><w:anchorlock><center style="color:#fff;font-family:Helvetica,Arial,sans-serif">I am a button →</center></v:roundrect><![endif]--> <a href="https://guidovisser.com"style="background-color:#d2694b;border:1px solid #d2694b;border-radius:3px;color:#fff;display:inline-block;font-family:sans-serif;line-height:44px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all">Go to test 2</a></table><tr><td bgcolor="434343"width="570"style="color:#fff"><p><table cellpadding="5"cellspacing="0"><tr><td bgcolor="434343"><img src="https://www.guidovisser.com/bell-small.png"><td style="font-family:Arial,Helvetica Neue,Helvetica,sans-serif;color:#fff;font-size:12px;padding-top:22px"valign="top"><p><p>Test footer<p>If you need support, contact: <a href="mailto:notexistingaddress@guidovisser.com?subject=Contact Support"style="color:#fff;text-decoration:underline">notexistingaddress@guidovisser.com</a><p>This email is automatically generated, replying has no use.</table></p><!-- header --><!-- header --><!-- top message --><p><!-- wrapper --><p><p>',
//     toolbar_sticky: 50,
//     _printClass: '',
//     linkProtocol: 'http://',
//     fullScreenOffset: '10px',
//     charCounter_type: "byte-html",
//     mediaAutoSelect: false,
//     formats: [
//         'p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
//         {
//             tag: 'x-foo',
//             name: 'x-foo',
//             command: 'replace',
//             class: '__se__format__replace_x_foo',
//         }
//     ],
//     // mode: 'balloon',
//     // rtl: true,
//     // iframe_fullPage: true,
//     // pasteTagsWhitelist: 'p|a|strong|em|h3|h4|h5|ul|ol|li|blockquote|table|thead|tbody|tfoot|tr|td|sup|sub',
//     linkRel: [
//         'alternate',
//         'author',
//         'external',
//         'help',
//         'license',
//         'next',
//         'follow',
//         'nofollow',
//         'noreferrer',
//         'noopener',
//         'prev',
//         'search',
//         'tag'
//     ],
//     linkRelDefault: {
//         default: 'nofollow',
//         check_new_window: 'only: noreferrer noopener',
//         check_bookmark: 'bookmark'
//     },
//     callBackSave: function (content){
//         console.log('save', content)
//     },
//     // attributeWhitelist: {
//     //     all: "style|bgcolor|border|cellpadding|colspan|cellspacing|align",
//     //     input: "checked"
//     // },
//     // addTagsWhitelist: "table|thead|tbody|tr|td|title|html|body|meta",
//     // iframe: true,
//     // defaultLineTag: 'div',
//     // textTags: {
//     //     strike:'s',
//     //     bold: 'b',
//     //     underline: 'em',
//     //     italic: 'u'
//     // },
//     tableCellControllerPosition: 'top',
//     // value: '',
//     // imageAccept: "*",
//     // videoAccept: "*",
//     // audioAccept: ".mp3",
//     display: 'block',
//     width: '100%',
//     height: 'auto',
//     // audioTagAttrs: {
//     //     controlslist: "nodownload",
//     // },
//     // videoTagAttrs: {
//     //     poster: "http://suneditor.com/docs/loading.gif",
//     //     autoplay: true
//     // },
//     // videoIframeAttrs: {
//     //     style: "border: 2px solid red;" 
//     // },
//     // height: 'auto',
//     iframe_cssFileName: '.+',
//     modallType: 'full',
//     charCounter: true,
//     charCounter_type: 'byte-html',
//     charCounter_label: 'Characters :',
//     icons: {
//         expansion: "<span>A</span>",
//         reduction: "<span>Z</span>"
//     },
//     // iframe: true,
//     placeholder: window.aa || 'Start typing something...',
//     // maxCharCount: 670,
//     // addTagsWhitelist: 'section|footer|details|summary|metadata|path|svg',
//     addTagsWhitelist: '*',
//     // tagsBlacklist: 'style',
//     // pasteTagsBlacklist: 'div',
//     // tagsBlacklist: 'section|aside',
//     // statusbar_resizeEnable: false,
//     statusbar_container: "#rb",
//     attributeWhitelist: {'all': '*'},  // html5 <details open="">..</details>
//     // attributeBlacklist: {
//     //     all: 'data-a',
//     //     span: 'name'
//     // },
//     imageGalleryUrl: 'https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo',
//     buttonList: complexEditor,
//     // iframe_fullPage: true,
//     editorCSSText: "font-weight: bold;",
//     // rtl: true,
//     // buttonList: [['custom_container']]
// });

// ss.onSetToolbarButtons = function(buttonList, core) {
//     console.log("bbbbb-", buttonList);
// }

// // ss.setContent("")
// // ss.setContent('fsafsa')
// ss.onload = function (core) {
//     console.log('_editorStyles', core.options.editorCSSText);
//     // core.focus();
// };
// ss.onScroll = function (e) {
//     // console.log('onScroll', e);
// };
// ss.onClick = function (e) {
//     // console.log('onClick', e);
// };
// ss.onFocus = function (e, core) {
//     console.log('onFocus', e);
// };
// ss.onBlur = function (e, core) {
//     console.log('onBlur', e);
// };
// // ss.onKeyDown = function (e) {
// //     const { key, shiftKey } = e;
// //     const keyCode = e.which || e.keyCode;
// //     if (key === 'Enter' || keyCode === 13) {
// //       console.log('preventing');
// //       e.preventDefault();
// //       return false;
// //     }
// // };
// ss.onKeyUp = function (e) {
//     // console.log('onKeyUp', e);
// };
// ss.onDrop = function (e) {
//     // console.log('onDrop', e);
//     return true;
// };
// // ss.onPaste = function (e, cleanData, maxCharCount, core) {
// //     // replace () > span.katex
// //     cleanData = cleanData.replaceAll("(", '<span class="temp-katex">').replaceAll(")", "</span>");

// //     // set attribute "data-exp"
// //     // create html string
// //     let html = "";
// //     const children = core._d.createRange().createContextualFragment(cleanData).childNodes;
// //     for (let i = 0, len = children.length, node; i < len; i++) {
// //         node = children[i];
// //         if (node.className === "temp-katex") {
// //             node.className = "katex";
// //             node.setAttribute("data-exp", node.textContent);
// //         }
// //         html += node.outerHTML || node.textContent;
// //     }

// //     return core.cleanHTML(html, core._pasteTagsWhitelistRegExp);
// // }
// ss.onAudioUpload = function (targetElement, index, state, videoInfo) {
//     // console.log('targetElement:${targetElement}, index:${index}, state:${state}')
//     console.log('videoInfo-----', videoInfo)
// }
// // ss.onVideoUploadError = function (messge, result, core) {
// //     console.log('video error-----', messge)
// //     return true
// // }
// ss.onAudioUploadBefore = function (files, info, core) {
//     console.log('before-----', files)
//     console.log('before----info-', info)
//     return true
// }
// ss.onChange = function (content, core) {
//     console.log('change', core.context.video._infoList)
// }

// // ss.imageUploadHandler = function (response, core) {
// //     console.log('rrrr', response)
// // }
// function ResizeImage (files, uploadHandler) {
//     const uploadFile = files[0];
//     const img = document.createElement('img');
//     const canvas = document.createElement('canvas');
//     const reader = new FileReader();

//     reader.onload = function (e) {
//         img.src = e.target.result
//         img.onload = function () {
//             let ctx = canvas.getContext("2d");
//             ctx.drawImage(img, 0, 0);

//             const MAX_WIDTH = 200;
//             const MAX_HEIGHT = 100;
//             let width = img.width;
//             let height = img.height;

//             if (width > height) {
//                 if (width > MAX_WIDTH) {
//                     height *= MAX_WIDTH / width;
//                     width = MAX_WIDTH;
//                 }
//             } else {
//                 if (height > MAX_HEIGHT) {
//                     width *= MAX_HEIGHT / height;
//                     height = MAX_HEIGHT;
//                 }
//             }

//             canvas.width = width;
//             canvas.height = height;

//             ctx = canvas.getContext("2d");
//             ctx.drawImage(img, 0, 0, width, height);

//             canvas.toBlob(function (blob) {
//                 uploadHandler([new File([blob], uploadFile.name)])
//             }, uploadFile.type, 1);
//         }
//     }

//     reader.readAsDataURL(uploadFile);
// }

// // ss.onImageUploadBefore = function (files, info, core, uploadHandler) {
// //     // ResizeImage(files, uploadHandler)
    
// //     console.log("infoinfoinfo", info);
// //     info.alt = "test-123";
// //     const response = { // Same format as "videoUploadUrl" response
// //         "result": [ { "url": "http://suneditor.com/docs/cat.jpg", "name": "test", "size": "0" }, ]
// //     };
// //     uploadHandler(response);
// // }

// // ss.onImageUpload = function (targetElement, index, state, info, core) {
// //     console.log('imageInfo-----', info);
// // }

// ss.showInline = function (toolbar, context) {

// },

// ss.showController = (currentControllerName, currentControllerItems, core) => {
//     console.log("currentControllerItems",currentControllerItems);
//     if (currentControllerName === "image") {
//         currentControllerItems[1].querySelector('[data-command="update"]').style.display = 'none'
//     }
// }

// // ss.showController = function (name, controllers, core) {
// //     let c = null;
// //     console.log('target', core.currentControllerTarget);
// //     for (let i in controllers) {
// //         c = controllers[i];
// //         if (core.util.hasClass(c, 'se-controller-resizing')) {
// //             const updateButton = c.querySelector('[data-command="update"]');
// //             if (name === 'image') updateButton.setAttribute('disabled', true);
// //             else updateButton.removeAttribute('disabled');
// //         }
// //     }
// // }
// window.aaa = false;
// window.sun_noticeOpen = function () {
//     ss.setOptions({
//         statusbar_container: null,
//     })
    
//     // ss.core.setDir(!window.aaa ? 'rtl' : 'ltr');
    
//     // window.aaa = !window.aaa
//     // ss.core.setDir("rtl")
//     // ss.noticeOpen('test notice');
//     // ss.setContent('<html><head>aaa</head><body><div>abc</div></body></html>')
//     // const { core } = ss;
//     // core.commandHandler(core._styleCommandMap.fullScreen, 'fullScreen')
//     // ss.core.commandHandler(null, 'selectAll');
//     // ss.core.remove()
//     // window.abc = ss.core.getContent();
//     // console.log(window.abc);
//     // \vec{P}.\vec{Q}=PQ
// //     ss.setContent(`
// //     <p>If&nbsp;<span class="__se__katex katex" contenteditable="false" data-exp="\\vec{P}.\\vec{Q}=PQ" data-font-size="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>P</mi><mo>⃗</mo></mover><mi mathvariant="normal">.</mi><mover accent="true"><mi>Q</mi><mo>⃗</mo></mover><mo>=</mo><mi>P</mi><mi>Q</mi></mrow><annotation encoding="application/x-tex">\\vec{P}.\\vec{Q}=PQ</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1607699999999999em;vertical-align:-0.19444em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9663299999999999em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathdefault" style="margin-right:0.13889em;">P</span></span></span><span style="top:-3.25233em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.15216em;"><span class="overlay" style="height:0.714em;width:0.471em;"><svg width="0.471em" height="0.714em" style="width:0.471em" viewBox="0 0 471 714" preserveAspectRatio="xMinYMin"><path d="M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5
// // 3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11
// // 10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63
// // -1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1
// // -7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59
// // H213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359
// // c-16-25.333-24-45-24-59z"></path></svg></span></span></span></span></span></span></span><span class="mord">.</span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9663299999999999em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathdefault">Q</span></span></span><span style="top:-3.25233em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.15216em;"><span class="overlay" style="height:0.714em;width:0.471em;"><svg width="0.471em" height="0.714em" style="width:0.471em" viewBox="0 0 471 714" preserveAspectRatio="xMinYMin"><path d="M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5
// // 3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11
// // 10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63
// // -1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1
// // -7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59
// // H213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359
// // c-16-25.333-24-45-24-59z"></path></svg></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.19444em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span></span><span class="base"><span class="strut" style="height:0.8777699999999999em;vertical-align:-0.19444em;"></span><span class="mord mathdefault" style="margin-right:0.13889em;">P</span><span class="mord mathdefault">Q</span></span></span></span>​, then angle between&nbsp;<span class="__se__katex katex" contenteditable="false" data-exp="\\vec{P}" data-font-size="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>P</mi><mo>⃗</mo></mover></mrow><annotation encoding="application/x-tex">\\vec{P}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9663299999999999em;vertical-align:0em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9663299999999999em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathdefault" style="margin-right:0.13889em;">P</span></span></span><span style="top:-3.25233em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.15216em;"><span class="overlay" style="height:0.714em;width:0.471em;"><svg width="0.471em" height="0.714em" style="width:0.471em" viewBox="0 0 471 714" preserveAspectRatio="xMinYMin"><path d="M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5
// // 3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11
// // 10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63
// // -1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1
// // -7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59
// // H213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359
// // c-16-25.333-24-45-24-59z"></path></svg></span></span></span></span></span></span></span></span></span></span>​&nbsp;and&nbsp;<span class="__se__katex katex" contenteditable="false" data-exp="\\vec{Q}" data-font-size="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>Q</mi><mo>⃗</mo></mover></mrow><annotation encoding="application/x-tex">\\vec{Q}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1607699999999999em;vertical-align:-0.19444em;"></span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9663299999999999em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathdefault">Q</span></span></span><span style="top:-3.25233em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.15216em;"><span class="overlay" style="height:0.714em;width:0.471em;"><svg width="0.471em" height="0.714em" style="width:0.471em" viewBox="0 0 471 714" preserveAspectRatio="xMinYMin"><path d="M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5
// // 3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11
// // 10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63
// // -1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1
// // -7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59
// // H213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359
// // c-16-25.333-24-45-24-59z"></path></svg></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.19444em;"><span></span></span></span></span></span></span></span></span>​&nbsp;is</p>
// //     `)
//     // ss.core.focus();
//     // ss.core.setFullPageContent({
//     //     head: '<style>* {color: red;}</style>'
//     // })
// }

// window.sun_noticeClose = function () {
//     // ss.core.setContent(window.abc);
//     // ss.noticeClose();
//     // ss.setContent('<div class="se-component se-image-container __se__float-none" contenteditable="false"><figure style="margin: 0px;"><img src="http://suneditor.com/docs/cat.jpg" alt="Tabby" data-rotate="" data-proportion="true" data-rotatex="" data-rotatey="" data-size="," data-align="none" data-percentage="auto,auto" data-index="0" data-file-name="Tabby" data-file-size="0" data-origin-size="640,404" data-origin="," style=""></figure></div>')
//     // ss.setContent('<span class="__se__katex katex" data-exp="\\\\tilde{a}" data-font-size="1em" style="font-size: 1em;" contenteditable="false"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>a</mi><mo>~</mo></mover></mrow><annotation encoding="application/x-tex">\\tilde{a}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6678599999999999em;vertical-align:0em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6678599999999999em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathdefault">a</span></span></span><span style="top:-3.35em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">~</span></span></span></span></span></span></span></span></span></span>​​')
// }

// window.sun_save = function () {
//     console.log(ss.getContent())
//     window.aaa = ss.getContent()
// }

// window.sun_getContext = function () {
//     console.log(ss.getContext());
// }

// window.sun_getImagesInfo = function () {
//     console.log(ss.getImagesInfo());
//     ss.getImagesInfo().list[0].select();
// }

// window.sun_insertHTML = function (html) {
//     // ss.insert('<img style="height:100px; width:100px;" src="http://suneditor.com/docs/cat.jpg" /><p>fdafds</p>', true, true, false);
//     ss.setContent("");
//     ss.setOptions({
//         mathFontSize: [
//             {text: '1', value: '1em'},
//             {text: '2', value: '2em', default: true},
//         ]
//     })
// }

// window.sun_getContent = function () {
//     // alert(ss.getContent());

//     console.log(ss.getText());

//     // ss.core.commandHandler(null, 'selectAll')
//     // let t = '';
//     // const lines = ss.core.getSelectedElements();
//     // for (let i = 0, len = lines.length; i < len; i++) {
//     //     t += lines[i].textContent + '\n';
//     // }
//     // console.log(t);

//     // console.log(ss.core.context.element.wysiwyg.textContent)
// }

// window.sun_setContent = function (content) {
//     ss.setContent('<style>div{color: red;}</style><p><br></p><img src="https://picsum.photos/200/300"><img src="https://picsum.photos/200/300"><p><br></p>');
//     ss.core.history.reset(true);
//     ss.core.focusEdge(null);
//     // ss.core.context.tool.save.disabled = true;
// }

// window.sun_addContent = function (content) {
//     // ss.addContent(content);
//     ss.readOnly(!ss.core.isReadOnly);
// }

// window.sun_disable = function () {
//     ss.disable();
// }

// window.sun_enable = function () {
//     ss.enable();
// }

// window.sun_show = function () {
//     ss.show();
// }

// window.sun_hide = function () {
//     ss.hide();
// }

// window.sun_destroy = function () {
//     // ss.destroy();
//     ss.setToolbarButtons([
//         [':command2-title2-text.Insert', 'codeView', 'preview'],
//         ['outdent', 'indent']
//     ])
// }

// window.sun_create = function () {
//     console.log("langlang")
// }


// const editor = suneditor.init({
//     width: '100%',
//     // iframe: true,
// });

// let s2 = window.s2 = editor.create(document.getElementById('editor2'), {
//     // value: 'abc',
//     plugins: [align],
//     minHeight : 300,
//     charCounter: true,
//     font: [
//         'Vazir', 'Arial', 'Comic Sans MS', 'Courier New', 'Impact',
//         'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'
//     ],
//     iframe: true,
//     iframe_fullPage: true,
//     imageMultipleFile: true,
//     buttonList: [
//         ['undo', 'redo'],
//         ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
//         ['removeFormat'],
//         ['outdent', 'indent'],
//         ['fullScreen', 'showBlocks', 'codeView'],
//         ['preview', 'print'],
//         ['align']
//     ]
// });

// s2.onResizeEditor = (height, prevHeight, core) => {
//     console.log("heig", height)
//     console.log("prevHeight", prevHeight)
//     console.log("core", core)
// }


// const newOption = {
//     mode: 'balloon',
//     iframe: false,
//     // editorCSSText: 'height: 200px;',
//     height: 150,
//     textSizeUnit: 'pt',
    
//     placeholder: 'Placeholder...'
// }
// const newOption2 = {
//     mode: 'classic',
//     toolbar_container: document.getElementById('test_tool'),
//     maxHeight: '400px',
//     height: 150,
//     imageWidth: '100%',
//     colorList: null,
//     iframe: true,
//     charCounter: true,
//     maxCharCount: 200
// }
// const newOption3 = {
//     mode: 'inline',
//     minHeight: '300px',
// }

// let imageList = [];
// let videoList = [];
// let selectedImages = [];
// const imageWrapper = document.getElementById('image_wrapper');
// const imageSize = document.getElementById('image_size');
// const imageRemove = document.getElementById('image_remove');
// const imageTable = document.getElementById('image_list');
// const videoTable = document.getElementById('video_list');

// window.findIndex = function (arr, index) {
//     let idx = -1;

//     arr.some(function (a, i) {
//         if ((typeof a === 'number' ? a : a.index) === index) {
//             idx = i;
//             return true;
//         }
//         return false;
//     })

//     return idx;
// }

// window.setVideoList = function () {
//     let list = '';

//     for (let i = 0, video; i < videoList.length; i++) {
//         video = videoList[i];
            
//         list += '<li>' +
//                     '<button title="delete" onclick="selectVideo(\'delete\',' + video.index + ')">X</button>' +
//                     '<a href="javascript:void(0)" onclick="selectVideo(\'select\',' + video.index + ')">' + video.src + '</a>' +
//                 '</li>';
//     }

//     videoTable.innerHTML = list;
// }

// window.selectVideo = function (type, index) {
//     videoList[findIndex(videoList, index)][type]();
// }

// window.setImage = function (type, index) {
//     imageList[findIndex(imageList, index)][type]();
// }

// window.checkImage = function (index) {
//     const li = imageTable.querySelector('#img_' + index);
//     const currentImageIdx = findIndex(selectedImages, index)

//     if (currentImageIdx > -1) {
//         selectedImages.splice(currentImageIdx, 1)
//         li.className = '';
//     } else {
//         selectedImages.push(index)
//         li.className = 'checked';
//     }

//     if (selectedImages.length > 0) {
//         imageRemove.removeAttribute('disabled');
//     } else {
//         imageRemove.setAttribute('disabled', true);
//     }
// }

// window.deleteCheckedImages = function () {
//     const iamgesInfo = s2.getImagesInfo();
    
//     for (let i = 0; i < iamgesInfo.length; i++) {
//         if (selectedImages.indexOf(iamgesInfo[i].index) > -1) {
//             iamgesInfo[i].delete();
//             i--;
//         }
//     }

//     selectedImages = []
// }

// window.setImageList = function () {
//     if (imageList.length > 0) imageWrapper.style.display = 'flex';
//     else imageWrapper.style.display = 'none';

//     let list = '';
//     let size = 0;

//     for (let i = 0, image, fixSize; i < imageList.length; i++) {
//         image = imageList[i];
//         fixSize = (image.size / 1000).toFixed(1) * 1
            
//         list += '<li id="img_' + image.index + '">' +
//                     '<div onclick="checkImage(' + image.index + ')">' +
//                         '<div><img src="' + image.src + '"></div>' +
//                     '</div>' +
//                     '<a href="javascript:void(0)" onclick="setImage(\'select\',' + image.index + ')" class="image-size">' + fixSize + 'KB</a>' +
//                     '<div class="image-check"><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg></div>' +
//                 '</li>';
        
//         size += fixSize;
//     }

//     imageSize.innerText = size.toFixed(1) + 'KB';
//     imageTable.innerHTML = list;
// }

// s2.onload = (core, isUpdate) => {
// }

// s2.onBlur = () => {console.log("ff?!?!?!?!?")}

// s2.onImageUpload = function (targetElement, index, state, imageInfo, remainingFilesCount) {
//     console.log('imageInfo', imageInfo);

//     if (state === 'delete') {
//         imageList.splice(findIndex(imageList, index), 1)
//     } else {
//         if (state === 'create') {
//             const image = s2.getImagesInfo()[findIndex(s2.getImagesInfo(), index)]
//             imageList.push(image)
//         } else { // update
            
//         }
//     }

//     if (remainingFilesCount === 0) {
//         console.log('imageList', imageList)
//         setImageList(imageList)
//     }
// }

// s2.onVideoUpload = function (targetElement, index, state, videoInfo, remainingFilesCount) {
//     console.log('videoInfo', videoInfo);

//     if (state === 'delete') {
//         videoList.splice(findIndex(videoList, index), 1)
//     } else {
//         if (state === 'create') {
//             videoList.push(videoInfo)
//         } else { // update
//             //
//         }
//     }

//     if (remainingFilesCount === 0) {
//         console.log('videoList', videoList)
//         setVideoList(videoList)
//     }
// }

// window.sun_setOptions2 = function () {
//     // s2.setOptions({
//     //     placeholder: 'fdsfda',
//     //     buttonList: []
//     // });
//     s2.core.commandHandler('copy');
// }

// window.sun_setOptions3 = function () {
//     // s2.setOptions(newOption2);
//     s2.core.commandHandler('cut');
// }
// window.sun_setOptions4 = function () {
//     s2.core.commandHandler('paste');
//     // s2.setOptions(newOption3);
// }

// window.sun_insertImage2 = function () {
//     s2.insertImage(document.getElementById('sun_files').files);
// }


// window.sun_destroy2 = function () {
//     s2.destroy();
// }

// window.sun_create2 = function () {
//     s2 = suneditor.create('editor2', {
//     });
// }

// let s3 = editor.create(document.getElementsByName('editor3')[0], {
//     mode: 'balloon-always',
//     width: '100%',
//     height: '500px',
//     toolbar_sticky: false,
//     modallType: 'local',
//     // iframe: true,
//     // maxCharCount: 300,
//     // statusbar: false
//     // statusbar_showPathLabel:false
//     charCounter: true,
//     // formats: ['h1', 'h4', 'pre', 'p', 'blockquote', {
//     //     tag: 'div',
//     //     class: '__se__format__aaa',
//     //     name: 'red div',
//     //     style: 'margin: 10px; background-color: #f5f5f5;',
//     //     command: 'replace'
//     // }],
//     placeholder: 'Start typing something.4..',
//     // maxCharCount: 280,
// });
// window.sun_destroy3 = function () {
//     s3.destroy();
// }

// window.sun_create3 = function () {
//     s3 = suneditor.create(document.getElementsByName('editor3')[0], {
//     });
// }

// let s4;

// window.sun_create4 = function() {
//     const win = window.open();
//     document.querySelectorAll('link').forEach(function (linkNode) {
//         win.document.write(linkNode.outerHTML);
//     })
//     win.document.write('<textarea name="editor4" id="editor4" style="width: 1080px; height: 200px;"></textarea>');
//     s4 = suneditor.create(win.document.querySelector('#editor4'), {
        
//         width: '100%',
//         toolbar_sticky: 0,
//         imageWidth: 300,
//         mode: 'classic',
//         // toolbarWidth: 800,
//         maxCharCount: 280,
//         height: '500px',
//         placeholder: 'Start typing something..5.'
//         // callBackSave: (content) => {
//         //     console.log('callback')
//         // }
//     });
// }
