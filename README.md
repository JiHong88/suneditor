# SunEditor
Vanilla javscript based WYSIWYG web editor.
SunEditor supports all modern browsers except IE without any dependencies and polyfills.
Coded based on ES2018(ES9), Nodejs@v18 and written in "prototype" syntax.
Nodejs version 14 is required to build or test this project.

#### 🌤 Demo : <a href="http://suneditor.com" target="_blank">suneditor.com</a> 🌤

⭐ If you would like to contribute, please refer to [guidelines](/CONTRIBUTING.md) and a list of [open tasks](https://github.com/jihong88/suneditor/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).⭐

[![GitHub](https://img.shields.io/github/license/jihong88/suneditor.svg?style=flat-square)](https://github.com/JiHong88/SunEditor/blob/master/LICENSE.txt)
[![GitHub release](https://img.shields.io/github/release/jihong88/suneditor.svg?style=flat-square)](https://github.com/JiHong88/SunEditor/releases)
[![npm version](https://img.shields.io/npm/v/suneditor.svg?style=flat-square)](https://www.npmjs.com/package/suneditor)
[![bower version](https://img.shields.io/bower/v/suneditor.svg?style=flat-square)](https://github.com/JiHong88/SunEditor/releases/latest)
[![](https://data.jsdelivr.com/v1/package/npm/suneditor/badge)](https://www.jsdelivr.com/package/npm/suneditor)
[![npm](https://img.shields.io/npm/dt/suneditor.svg?style=flat-square)](https://www.npmjs.com/package/suneditor)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/suneditor.svg?style=flat-square)

> The Suneditor is a lightweight, flexible, customizable WYSIWYG text editor for your web applications.
> - Pasting from Microsoft Word and Excel.
> - Custom table selection, merge and split.
> - Media embed, images upload.
> - Can use CodeMirror, KaTeX.
> - And.. many other features :)

![WYSIWYG HTML Editor](http://suneditor.com/docs/screen-main-w.png?v=2700)

## Table of content
- [Browser Support](#browser-support)
- [Install](#install)
- [Getting Started](#getting-started)
- [When inserting custom tags in the editor](#when-inserting-custom-tags-in-the-editor)
- [Use import statement](#use-import-statement)
    - [Load only what you want](#1-load-only-what-you-want)
    - [Load all plugins](#2-load-all-plugins)
- [Init function](#init-function)
- [Use CodeMirror](#use-codemirror)
- [Use KaTeX (math plugin)](#use-katex-math-plugin)
- [Options](#options)
- [Functions](#functions)
- [Plugins list](#plugins-list)
- [Examples](#examples)
- [Options template](#options-template)
- [Custom plugins](#custom-plugins)
- [Document](#document)
- [Other libraries using SunEditor](#other-libraries-using-sunEditor)
    - [suneditor-react](#lib-suneditor-react)
    - [angular-suneditor](#lib-angular-suneditor)
    - [Using SunEditor with Livewire & Alpine.JS](#lib-livewire-alpine)
    - [Plugin for Pluxml](#lib-pluxml)
    - [AEM-SunEditor](#lib-aem-suneditor)
- [License](#license)


#### Browser Support

| <img src="http://suneditor.com/docs/chrome-64.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="http://suneditor.com/docs/mozilla-64.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="http://suneditor.com/docs/opera-64.png" alt="Opera" width="16px" height="16px" /> Opera | <img src="http://suneditor.com/docs/safari-64.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="http://suneditor.com/docs/edge-64.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="http://suneditor.com/docs/explorer-64.png" alt="Explorer" width="16px" height="16px" /> Internet Explorer |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Yes | Yes | Yes | Yes | Yes | 11 |

## Install
#### Npm
``` sh
$ npm install suneditor --save
```
#### Bower
``` sh
$ bower install suneditor --save
```
#### CDN
``` html
<link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
<!-- <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/assets/suneditor.css" rel="stylesheet"> -->
<!-- <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/assets/suneditor-content.css" rel="stylesheet"> -->
<script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
<!-- languages (Basic Language: English/en) -->
<script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/langs/ko.js"></script>
```
[jsdelivr/suneditor](https://www.jsdelivr.com/package/npm/suneditor)

## Getting Started
### 1. Target Element
```html
<textarea id="sample">Hi</textarea>
```

### 2. Create
```javascript
/**
* ID : 'suneditor_sample'
* ClassName : 'sun-eidtor'
*/
// ID or DOM object
const editor = SUNEDITOR.create((document.getElementById('sample') || 'sample'),{
    // All of the plugins are loaded in the "window.SUNEDITOR" object in dist/suneditor.min.js file
    // Insert options
    // Language global object (default: en)
    lang: SUNEDITOR_LANG['ko']
});
```

### 3. Content display
```java
When you display a document created by suneditor
You need to include "src/assets/suneditor-content.css" or "dist/css/suneditor.min.css" file.
Then add "sun-editor-editable" to the class name of the Tag element that displays the content.
If you are using RTL mode, you also need to add "se-rtl".
In "suneditor-content.css", you can define the style of all the tags created in suneditor.
```

## When inserting custom tags in the editor
```text
- Empty tags without meaning or tags that do not fit the editor's format are modified or deleted.
    Tags with the class name "se-component" or "__se__block" of the top-level tag will not be deleted.
        "se-component" is the component type of the editor.
        Class name for wrapper tags such as images and videos.
```

## Use import statement

### 1. Load only what you want
```javascript
import 'suneditor/dist/css/suneditor.min.css'
// import 'suneditor/assets/suneditor.css'
// import 'suneditor/assets/suneditor-content.css'
import suneditor from 'suneditor'

// How to import plugins
import image from 'suneditor/src/plugins/modal/link'
import list from 'suneditor/src/plugins/dropdown/list'
import {font, video} from 'suneditor/src/plugins'

// How to import language files (default: en)
import lang from 'suneditor/src/langs'
import {ko} from 'suneditor/src/langs'
import de from 'suneditor/src/langs/de'

suneditor.create('sample', {
    plugins: [font, video, image, list],
    buttonList: [
        ['font', 'video', 'image', 'list']
    ],
    lang: lang.ko
});
```

### 2. Load all plugins
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import plugins from 'suneditor/src/plugins'

suneditor.create('sample', {
    plugins: plugins,
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'backgroundColor', 'textStyle'],
        ['removeFormat'],
        '/', // Line break
        ['outdent', 'indent'],
        ['align', 'horizontalLine', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video', 'audio' /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
        /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['save', 'template', 'layout'],
        /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
    ]
})
```

## Init function
```text
The init function can be used by predefining options and calling the create function on the returned object.
The value of the option argument put in the "create" function call takes precedence
```
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import plugins from 'suneditor/src/plugins'

// all plugins
const initEditor = suneditor.init({
    plugins: plugins,
    height: 200,
    buttonList: [
        [
        'undo', 'redo',
        'font', 'fontSize', 'formatBlock',
        'paragraphStyle', 'blockquote',
        'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
        'fontColor', 'backgroundColor', 'textStyle',
        'removeFormat',
        'outdent', 'indent',
        'align', 'horizontalLine', 'list', 'lineHeight',
        'table', 'link', 'image', 'video', 'audio', /** 'math', */ // You must add the 'katex' library at options to use the 'math' plugin.
        /** 'imageGallery', */ // You must add the "imageGalleryUrl".
        'fullScreen', 'showBlocks', 'codeView',
        'preview', 'print', 'save', 'template', 'layout',
        /** 'dir', 'dir_ltr', 'dir_rtl' */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
        ]
    ]
});

initEditor.create('sample_1', {
    // The value of the option argument put in the "create" function call takes precedence
});

initEditor.create('sample_2', {
    // The value of the option argument put in the "create" function call takes precedence
    height: 'auto',
    buttonList: [
        ['bold', 'underline', 'italic'],
        ['removeFormat'],
        ['preview', 'print']
    ]
});
```

## Use CodeMirror
```html
<!-- https://github.com/codemirror/CodeMirror -->
<!-- codeMirror (^5.0.0) -->
<!-- Use version 5.x.x -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.min.css">
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/htmlmixed/htmlmixed.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/xml/xml.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/css/css.js"></script>
```
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
// Import codeMirror
import CodeMirror from 'codemirror'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/lib/codemirror.css'

suneditor.create('sample', {
    codeMirror: CodeMirror // window.CodeMirror,
    // Set options
    // codeMirror: {
    //     src: CodeMirror,
    //     options: {...}
    // }
    buttonList: [
        ['codeView']
    ],
    height: 400
});
```

## Use KaTeX (math plugin)
```html
<!-- https://github.com/KaTeX/KaTeX -->
<!-- KaTeX (^0.11.1) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js"></script>
```
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
// Import katex
import katex from 'katex'
import 'katex/dist/katex.min.css'

suneditor.create('sample', {
    katex: katex // window.katex,
    // Set options
    // katex: {
    //     src: katex,
    //     options: {...}
    // }
    buttonList: [
        ['math']
    ]
});
```

<!-- ## Use mention plugin
```javascript
import { mention } from 'suneditor/dist/plugins';

// implement your api to find the user to mention.
mention.getItems = async function(term) {
  return callApi('/users?q='+escape(term));
}

// renderItem shows a user in the list
mention.renderItem = function(user) {
  return '<span>' + user.name + '</span>';
}

// getId should return a unique id
mention.getId = function(user) {
  return user.id;
}

// getValue should return what you want to display in the editor
mention.getValue = function(user) {
  return '@' + user.name;
}

// getLinkHref should return the link target
mention.getLinkHref = function(user) {
  return user.profile;
}

let editor = suneditor.create('sample', {
    plugins: [mention],
    buttonList: [
        ['mention']
    ]
})

// if you would like to have this triggered when pressing @
editor.core.registerPlugin('mention');
editor.onKeyDown = e => {
  if (e.key === '@') {
    editor.core.mention.open();
    e.preventDefault();
    e.stopPropagation();
  }
}

// when saving changes from the editor you will want to obtain the mentions added
let newMentions = editor.core.getMentions();

``` -->

## Options
```java
plugins: [
    /** command */
    blockquote,
    /** Dropdown */
    align,
    font,
    fontColor,
    fontSize,
    formatBlock,
    backgroundColor,
    horizontalLine,
    lineHeight,
    list,
    paragraphStyle,
    table,
    template,
    textStyle,
    /** Modal */
    image,
    link,
    video,
    audio,
    math, // You must add the 'katex' library at options to use the 'math' plugin.
    /** File browser */
    // You must add the "imageGalleryUrl".
    // A button is added to the image modal.
    // You can also use image gallery by adding it directly to the button list. (You must add "image" plugin.)
    imageGallery
]
: Plugins array.     default: null {Array}
// * Custom options and default options are all treated the same. 
// * When using a custom plugin and a default plugin together, register as follows.
// * {custom_plugin, ...plugins}

// Values
lang            : language object.   default : en {Object}
defaultLine      : Specifies default tag name of the editor.     default: 'p' {string}
textTags        : You can change the tag of the default text button.   default: { bold: 'STRONG', underline: 'U', italic: 'EM', strike: 'DEL' }
                  ex) {
                      bold: 'b',
                      strike: 's'
                  }
value           : Initial value(html string) of the edit area.
                  If not, the value of the "target textarea".   default: null {string}
historyStackDelayTime : When recording the history stack, this is the delay time(miliseconds) since the last input.  default: 400 {number}
editableFrameAttributes  : Specifies the properties of the editing area DIV.     default: {} {Object}
                  ex)  {
                    "spellcheck": false
                  }
allowedClassNames  : Specifies the allowed class name, It can be specified in the form of a regular expression.
                     Appended before the "default" value. (`${option}|${defaultValue}`)     default: '^se-|__se__|katex';

// Whitelist, Blacklist -----------------------------------------------------------------------------------------
// (You can use regular expression syntax.)
// __defaultElementWhitelist : 'br|p|div|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|table|thead|tbody|tr|th|td|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary'
elementWhitelist      : Add tags to the default tags whitelist of editor.   default: '' {string}
                        ex) 'mark|canvas|label|select|option|input|//' // "//" This means HTML comments.
                        ex) '*' // This means all tags are allowed. (Not available on "blacklist")
elementBlacklist         : Blacklist of the editor default tags.               default: null {string}
                        ex) 'h1|h2'
attributeWhitelist   : Add attributes whitelist of tags that should be kept undeleted from the editor.   default: null {Object}
                        // -- Fixed whitelist --
                        // Native attributes: 'contenteditable|colspan|rowspan|target|href|download|rel|src|alt|class|type|controls'
                        // Editor attributes: 'data-se-index|data-se-key|data-se-value|data-se-type|data-se-size|data-se-file-name|data-se-file-size|data-se-embed'
                        ex) {
                            '*': 'style|data-.+', // Apply to all tags
                            'input': 'checked|name' // Apply to input tag
                            '???': '*' // "*" === all attributes
                        }
attributeBlacklist   : Add attribute blacklist of tags that should be deleted in editor.   default: null {Object}
                        ex) {
                            '*': 'id', // Apply to all tags
                            'input': 'style' // Apply to input tag
                            '???': '*' // "*" === all attributes
                        }
tagStyles        : Add the allowable style items for each tag.      default: {'table|td|th':'border|border-[a-z]+|background-color|text-align|float'}
                      ex) {
                          'h1': 'id', // Apply to h1 tag
                        }
spanStyles    : Add the span tag style
// Layout-------------------------------------------------------------------------------------------------------
mode            : The mode of the editor ('classic', 'inline', 'balloon', 'balloon-always'). default: 'classic' {string}
rtl             : If true, the editor is set to RTL(Right To Left) mode.   default: false {Boolean}
lineAttrReset   : Deletes other attributes except for the property set at the time of line break.
                  If there is no value, no all attribute is deleted.    default: '' {string}
                  ex) 'class|style': Attributes other than "class" and "style" are deleted at line break.
                      '*': All attributes are deleted at line break.
toolbar_width    : The width of the toolbar. Applies only when the editor mode is 
                  'inline' or 'balloon' mode.     default: 'auto' {Number|String}
toolbar_container: A custom HTML selector placing the toolbar inside.
                  The class name of the element must be 'sun-editor'.
                  Element or querySelector argument.     default: null {Element|String}
                  ex) document.querySelector('#id') || '#id'
toolbar_sticky   : Top offset value of "sticky toolbar".
                  Set to 0, '0px', '50px'...
                  If set to -1 or false or null to turn off.        default: 0 {Number|String|Boolean}
toolbar_hide     : The toolbar is rendered hidden.                   default: false {Boolean}
fullScreenOffset: Top offset value of "full Screen".
                  Set to 0, '0px', '50px'...     default: 0 {Number|String}
iframe          : Content will be placed in an iframe and isolated from the rest of the page.  default: false {Boolean}
iframe_fullPage        : Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration.  default: false {Boolean}
iframe_attributes  : Attributes of the iframe.                       default: null {Object}
                    ex) {'scrolling': 'no'}
iframe_cssFileName : Name or Array of the CSS file to apply inside the iframe.
                    You can also use regular expressions.
                    Applied by searching by filename in the link tag of document,
                    or put the URL value (".css" can be omitted).   default: 'suneditor' {Array|String}
                    ex) '.+' or ['suneditor', 'http://suneditor.com/sample/css/sample.css', '.+\\.min\\.css']
previewTemplate : A template of the "preview".
                  The {{content}} part in the HTML string is replaced with the content of the editor. default: null {string}
                  ex) "<div style='width:auto; max-width:1080px; margin:auto;'><h1>Preview Template</h1> {{content}} <div>_Footer_</div></div>"
printTemplate   : A template of the "print".
                  The {{content}} part in the HTML string is replaced with the content of the editor. default: null {string}
                  ex) "<div style='width:auto; max-width:1080px; margin:auto;'><h1>Print Template</h1> {{content}} <div>_Footer_</div></div>"
codeMirror     : https://codemirror.net/try/
codeMirror     : If you put the CodeMirror object as an option, you can do Codeview using CodeMirror. default: null {Object}
                  Use version 5.x.x // https://github.com/codemirror/CodeMirror
                      codeMirror5: { // Custom option
                        src: CodeMirror,
                        options: {
                            /** default options **
                            * mode: 'htmlmixed',
                            * htmlMode: true,
                            * lineNumbers: true
                            * lineWrapping: true
                            */
                        }
                      }
katex           : Required library for math plugins.               default: null {Object}
                  Use version 0.x.x // https://github.com/KaTeX/KaTeX
                      katex: { // Custom option
                        src: katex,
                        options: {
                            /** default options **
                            * throwOnError: false,
                            */
                        }
                      }
mathFontSize    : Math plugin font size list.                       default: [{..}] {Array}
                  Default value: [
                    {text: '1', value: '1em', default: true},
                    {text: '1.5', value: '1.5em'},
                    {text: '2', value: '2em'},
                    {text: '2.5', value: '2.5em'}
                  ]

// Statusbar-------------------------------------------------------------------------------------------
statusbar     : Show the bottom resizing bar.
                  If 'height' value is 'auto', it will not be resized. default: true {Boolean}
statusbar_showPathLabel   : Displays the current node structure to statusbar.  default: true {Boolean}
statusbar_resizeEnable  : Enable/disable resize function of bottom resizing bar.   default: true {Boolean}
statusbar_container: A custom HTML selector placing the resizing bar inside.
                      The class name of the element must be 'sun-editor'.
                      Element or querySelector argument.     default: null {Element|String}
                      ex) document.querySelector('#id') || '#id'

// Character count-----------------------------------------------------------------------------------------------
charCounter     : Shows the number of characters in the editor.     
                  If the charCounter_max option has a value, it becomes true. default: false {boolean}
charCounter_type : Defines the calculation method of the "charCounter" option.
                  'char': Characters length.
                  'byte': Binary data size of characters.
                  'byte-html': Binary data size of the full HTML string.   default: 'char' {string}
charCounter_label: Text to be displayed in the "charCounter" area of the bottom bar.
                  Screen ex) 'charCounter_label : 20/200'.           default: null {string}
charCounter_max    : The maximum number of characters allowed to be inserted into the editor. default: null {number}

// Width size----------------------------------------------------------------------------------------------------
width           : The width size of the editor.                     default: clientWidth||'100%' {Number|String}
minWidth        : The min-width size of the editor.
                  Used when 'width' value is 'auto' or '~%'.        default: null {Number|String}
maxWidth        : The max-width size of the editor.
                  Used when 'width' value is 'auto' or '~%'.        default: null {Number|String}

// Height size---------------------------------------------------------------------------------------------------
height          : The height size of the editor.                    default: clientHeight||'auto' {Number|String}
minHeight       : The min-height size of the editor.
                  Used when 'height' value is 'auto'.               default: null {Number|String}
maxHeight       : The max-height size of the editor.
                  Used when 'height' value is 'auto'.               default: null {Number|String}

// Editing area -------------------------------------------------------------------------------------------------
className       : Add a "class" to the editing area[.sun-editor-editable].    default: '' {string}
editorStyle    : You can define the style of the editing area[.sun-editor-editable].
                  It affects the entire editing area.               default: '' {string}
                  ('z-index', 'position', 'display', 'width' properties apply to the top div.)
                  ex) 'font-family: cursive; font-size: 10px;'

// Defining menu items-------------------------------------------------------------------------------------------
font            : Change default font-family array.                 default: [...] {Array}
                  Default value: [
                    'Arial', 'Comic Sans MS', 'Courier New', 'Impact',
                    'Georgia','tahoma', 'Trebuchet MS', 'Verdana'
                  ]
fontSize        : Change default font-size array.                   default: [...] {Array}
                  Default value: [
                    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
                  ]
fontSizeUnit    : The font size unit.                               default: 'px' {string}
alignItems      : A list of drop-down options for the 'align' plugin.   default: rtl === true ? ['right', 'center', 'left', 'justify'] : ['left', 'center', 'right', 'justify'] {Array}
formats         : Change default formatBlock array.                 default: [...] {Array}
                  Default value: [
                    'p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
                    // "blockquote": block, "pre": brBlock, "Other tags": line
                  ],
                  Custom: [{
                    tag: 'div', // Tag name
                    name: 'Custom div' || null, // default: tag name
                    command: 'line' || 'br-line' || 'block', // default: "replace"
                    class: '__se__format__line_xxx' || '__se__format__br_line_xxx' || '__se__format__block_xxx' || '__se__format__br_line_closure_xxx' || '__se__format__block_closure_xxx'
                    // Class names must always begin with "__se__format__(line, br_line, block)_"
                  }]
colorList_font, colorList_background    : Change default color array of color picker.       default: [..[..]..] {Array}
                  Default value: [
                    '#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000',
                    '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa', '#f1f1f1',
                    '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd',
                    '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
                    '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535',
                    '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#222222'
                  ]
                  ex) [
                    ['#ccc', '#dedede', 'OrangeRed', 'Orange', 'RoyalBlue', 'SaddleBrown'], // Line break
                    ['SlateGray', 'BurlyWood', 'DeepPink', 'FireBrick', 'Gold', 'SeaGreen']
                  ]
lineHeights     : Change default line-height array.                 default: [{}..] {Array}
                  Default value: [
                    {text: '1', value: 1},
                    {text: '1.15', value: 1.15},
                    {text: '1.5', value: 1.5},
                    {text: '2', value: 2}
                  ]
                  ex) [
                    {text: 'Single', value: 1},
                    {text: 'Double', value: 2}
                  ]
paragraphStyles : You can apply custom class to format.
                  ex) '.sun-editor-editable .__se__customClass'
                      '.sun-editor .__se__customClass' // If you want to apply styles to menu items as well
                  Default value: [
                    {
                        name: 'Spaced', // Format style name
                        class: '__se__p-spaced', // Define style for used class (Class names must always begin with "__se__")
                        _class: '' // You can control the style of the tags displayed in the menu by putting a class on the button of the menu.
                    },
                    {
                        name: 'Bordered',
                        class: '__se__p-bordered'
                    },
                    {
                        name: 'Neon',
                        class: '__se__p-neon'
                    }
                  ]
                  ex) [
                      'spaced', 'neon', // The default value is called by name only and the name is called in the language file.
                      {
                          name: 'Custom',
                          class: '__se__customClass'
                      }
                  ]
textStyles      : You can apply custom class to selected text.
                  ex(using a class)) '.sun-editor-editable .__se__customClass'
                                     '.sun-editor .__se__customClass' // If you want to apply styles to menu items as well
                  Default value: [
                    {
                        name: 'Code',
                        class: '__se__t-code',
                        tag: 'code',
                    },
                    {
                        name: 'Shadow',
                        class: '__se__t-shadow', // Class names (Class names must always begin with "__se__")
                        tag: 'span'
                    }
                  ]

// Image---------------------------------------------------------------------------------------------------------
imageResizing   : Can resize the image.                               default: true {Boolean}
imageHeightShow : Choose whether the image height input is visible.   default: true {Boolean}
imageAlignShow  : Choose whether the image align radio buttons are visible.       default: true {Boolean}
imageWidth      : The default width size of the image frame.          default: 'auto' {string}
imageHeight     : The default height size of the image frame.         default: 'auto' {string}
imageSizeOnlyPercentage : If true, image size can only be scaled by percentage.   default: false {Boolean}
imageRotation   : Choose whether to image rotation buttons display.
                  When "imageSizeOnlyPercentage" is "true" or  or "imageHeightShow" is "false" the default value is false.                       
                  If you want the button to be visible, put it a true.     default: true {boolean}
imageFileInput  : Choose whether to create a file input tag in the image upload window.  default: true {boolean}
imageUrlInput   : Choose whether to create a image url input tag in the image upload window.
                  If the value of imageFileInput is false, it will be unconditionally.   default: true {boolean}
imageUploadHeader : Http Header when uploading images.              default: null {Object}
imageUploadUrl  : The image upload to server mapping address.       default: null {string}
                  (When not used the "imageUploadUrl" option, image is enters base64 data)
                  ex) "/editor/uploadImage"
                  request format: {
                            "file-0": File,
                            "file-1": File
                        }
                  response format: {
                            "errorMessage": "insert error message",
                            "result": [
                                {
                                    "url": "/download/editorImg/test_image.jpg",
                                    "name": "test_image.jpg",
                                    "size": "561276"
                                }
                            ]
                        }
imageUploadSizeLimit: The size of the total uploadable images (in bytes).
                      Invokes the "onImageUploadError" method.  default: null {number}
imageMultipleFile: If true, multiple images can be selected.    default: false {boolean}
imageAccept      : Define the "accept" attribute of the input.  default: "*" {string}
                   ex) "*" or ".jpg, .png .."
// Image - image gallery
imageGalleryUrl     : The url of the image gallery, if you use the image gallery.
                      When "imageUrlInput" is true, an image gallery button is created in the image modal.
                      You can also use it by adding "imageGallery" to the button list.   default: null {string}
                      ex) "/editor/getGallery"
                      response format: {
                            "result": [
                                {
                                    "src": "/download/editorImg/test_image.jpg", // @Require
                                    "thumbnail": "/download/editorImg/test_thumbnail.jpg", // @Option - Thumbnail image to be displayed in the image gallery.
                                    "name": "Test image", // @Option - default: src.split('/').pop()
                                    "alt": "Alt text", // @Option - default: src.split('/').pop()
                                    "tag": "Tag name" // @Option
                                }
                            ],
                            "nullMessage": "Text string or HTML string", // It is displayed when "result" is empty.
                            "errorMessage": "Insert error message", // It is displayed when an error occurs. 
                        }
                      You can redefine the "plugins.imageGallery.drawItems" method.
imageGalleryHeader: Http Header when get image gallery.         default: null {Object}

// Video----------------------------------------------------------------------------------------------------------
videoResizing   : Can resize the video (iframe, video).                         default: true {Boolean}
videoHeightShow : Choose whether the video height input is visible.    default: true {Boolean}
videoAlignShow  : Choose whether the video align radio buttons are visible.       default: true {Boolean}
videoRatioShow  : Choose whether the video ratio options is visible.   default: true {Boolean}
videoWidth      : The default width size of the video frame.           default: '100%' {string}
videoHeight     : The default height size of the video frame.          default: '56.25%' {string}
videoSizeOnlyPercentage : If true, video size can only be scaled by percentage.   default: false {Boolean}
videoRotation   : Choose whether to video rotation buttons display.
                  When "videoSizeOnlyPercentage" is "true" or "videoHeightShow" is "false" the default value is false.
                  If you want the button to be visible, put it a true.     default: true {boolean}
videoRatio      : The default aspect ratio of the video.
                  Up to four decimal places are allowed.             default: 0.5625 (16:9) {Float}
videoRatioList  : Video ratio selection options.
                  default: [
                    {name: '16:9', value: 0.5625},
                    {name: '4:3', value: 0.75},
                    {name: '21:9', value: 0.4285}
                  ],
                  ex) [
                    {name: 'Classic Film 3:2', value: 0.6666},
                    {name: 'HD', value: 0.5625}
                  ]
youtubeQuery    : The query string of a YouTube embedded URL.        default: '' {string}
                  It takes precedence over the value user entered.
                  ex) 'autoplay=1&mute=1&enablejsapi=1&controls=0&rel=0&modestbranding=1'
                    // https://developers.google.com/youtube/player_parameters
videoFileInput  : Choose whether to create a file input tag in the video upload window.  default: false {boolean}
videoUrlInput   : Choose whether to create a video url input tag in the video upload window.
                  If the value of videoFileInput is false, it will be unconditionally.   default: true {boolean}
videoUploadHeader : Http Header when uploading videos.              default: null {Object}
videoUploadUrl  : The video upload to server mapping address.       default: null {string}
                  ex) "/editor/uploadVideo"
                  request format: {
                            "file-0": File,
                            "file-1": File
                        }
                  Use video tags. (supported video formats: '.mp4', '.webm', '.ogg')
                  response format: {
                            "errorMessage": "insert error message",
                            "result": [
                                {
                                    "url": "/download/editorVideos/test_video.mp4",
                                    "name": "test_video.mp4",
                                    "size": "561276"
                                }
                            ]
                        }
videoUploadSizeLimit: The size of the total uploadable videos (in bytes).
                      Invokes the "onVideoUploadError" method.  default: null {number}
videoMultipleFile: If true, multiple videos can be selected.    default: false {boolean}
videoTagAttrs    : Define "Attributes" of the video tag.                      default: null {Object} 
                   ex) { poster: "http://suneditor.com/docs/loading.gif", autoplay: true }
videoIframeAttrs : Define "Attributes" of the iframe tag. (Youtube, Vimeo).   default: null {Object}
                   ex) { style: "border: 2px solid red;" }
videoAccept      : Define the "accept" attribute of the input.  default: "*" {string}
                   ex) "*" or ".mp4, .avi .."

// Audio----------------------------------------------------------------------------------------------------------
audioWidth      : The default width size of the audio frame.        default: '300px' {string}
audioHeight     : The default height size of the audio frame.       default: '54px' {string}
audioFileInput  : Choose whether to create a file input tag in the audio upload window.  default: false {boolean}
audioUrlInput   : Choose whether to create a audio url input tag in the audio upload window.
                  If the value of audioFileInput is false, it will be unconditionally.   default: true {boolean}
audioUploadHeader : Http Header when uploading audios.              default: null {Object}
audioUploadUrl  : The audio upload to server mapping address.       default: null {string}
                  ex) "/editor/uploadAudio"
                  request format: {
                            "file-0": File,
                            "file-1": File
                        }
                  Use audio tags. (supported audio formats: '.mp4', '.webm', '.ogg')
                  response format: {
                            "errorMessage": "insert error message",
                            "result": [
                                {
                                    "url": "/download/editorAudios/test_audio.mp3",
                                    "name": "test_audio.mp3",
                                    "size": "561276"
                                }
                            ]
                        }
audioUploadSizeLimit: The size of the total uploadable audios (in bytes).
                      Invokes the "onAudioUploadError" method.  default: null {number}
audioMultipleFile: If true, multiple audios can be selected.    default: false {boolean}
audioTagAttrs    : Define "Attributes" of the audio tag.        default: null {Object} 
                   ex) { controlslist: "nodownload", autoplay: true }
videoAccept      : Define the "accept" attribute of the input.  default: "*" {string}
                   ex) "*" or ".mp3, .wav .."

// Table----------------------------------------------------------------------------------------------------------
tableCellControllerPosition : Define position to the table cell controller('cell', 'top'). default: 'cell' {string}

// Url input
defaultUrlProtocol    : Default protocol for the links. ('link', 'image', 'video', 'audio')
                  This applies to all plugins that enter the internet url.   default: null {string}
                  
// Link-----------------------------------------------------------------------------------------------------------
linkTargetNewWindow : Default checked value of the "Open in new window" checkbox.   default: false {Boolean}
                  // https://www.w3schools.com/tags/att_a_rel.asp
                  ex) [
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
                ]
linkRelDefault  : Defines default "rel" attributes of anchor tag.   default: {} {Object}
                  ex) linkRelDefault: {
                        default: 'nofollow', // Default rel
                        check_new_window: 'noreferrer noopener', // When "open new window" is checked 
                        check_bookmark: 'bookmark' // When "bookmark" is checked 
                    },
                    // If properties other than "default" start with "only:", the existing "rel" is cleared and applied. 
                    linkRelDefault: {
                        check_new_window: 'only:noreferrer noopener'
                    }
linkRel         : Defines "rel" attribute list of anchor tag.   default: [] {Array}
linkNoPrefix   : If true, disables the automatic prefixing of the host URL to the value of the link. default: false {Boolean}

// HR----------------------------------------------------------------------------------------------------
hrItems         : Defines the hr items.
                  "class" or "style" must be specified.
                  default: [
                      {name: lang.hr_solid, class: '__se__solid'},
                      {name: lang.hr_dashed, class: '__se__dashed'},
                      {name: lang.hr_dotted, class: '__se__dotted'}
                  ]
                  ex) [ {name: "Outset", style: "border-style: outset;"} ]


// Key actions----------------------------------------------------------------------------------------------------
tabDisable      : If true, disables the interaction of the editor and tab key.  default: false {boolean}
shortcutsDisable: You can disable shortcuts.    default: [] {Array}
                  ex) ['bold', 'strike', 'underline', 'italic', 'undo', 'indent', 'save']
shortcutsHint   : If false, hide the shortcuts hint.    default: true {boolean}

// Defining save button-------------------------------------------------------------------------------------------
callBackSave    : Callback functions that is called when the Save button is clicked. 
                  Arguments - (content, isChanged).                            default: editorInstance.save {Function}

// Templates Array------------------------------------------------------------------------------------------------
templates       : If you use a template plugin, add it.
                  Defines a list of templates.                       default: null {Array} 
                  ex) [
                    {
                        name: 'Template-1',
                        html: '<p>HTML source1</p>'
                    },
                    {
                        name: 'Template-2',
                        html: '<p>HTML source2</p>'
                    }
                  ]
layouts       : If you use a layout plugin, add it.
                  Defines a list of templates.                       default: null {Array} 
                  ex) [
                    {
                        name: 'Template-1',
                        html: '<p>HTML source1</p>'
                    },
                    {
                        name: 'Template-2',
                        html: '<p>HTML source2</p>'
                    }
                  ]

// ETC------------------------------------------------------------------------------------------------------------
__allowedScriptTag  : Allows script tags.                            default: false {Boolean}
placeholder     : The placeholder text.                              default: null {string}
mediaAutoSelect : Activate the media[image, video, audio] selection status immediately after inserting the media tag.  default: true {boolean}
icons           : You can redefine icons.                            default: null {Object}
                  ex) {
                      bold: '<span class="se-icon-text">B</span>',
                      table: '<i class="xx xxx></i>',
                      insert_row_above: '<svg></svg>'
                  }

// Buttons--------------------------------------------------------------------------------------------------------
buttonList      : Defines button list to array {Array}
                  default: [
                    ['undo', 'redo'],
                    // ['font', 'fontSize', 'formatBlock'],
                    // ['paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    // ['fontColor', 'backgroundColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    // ['align', 'horizontalLine', 'list', 'lineHeight'],
                    // ['table', 'link', 'image', 'video', 'math'], // You must add the 'katex' library at options to use the 'math' plugin.
                    // ['imageGallery'], // You must add the "imageGalleryUrl".
                    ['fullScreen', 'showBlocks', 'codeView'],
                    ['preview', 'print'],
                    // ['save', 'template', 'layout'],
                    // ['dir', 'dir_ltr', 'dir_rtl'],
                    // '/', Line break
                  ]

----------------- ex) When do not use group: ----------------------------------------------------------------------
                  // If you don't want to use a group, put all the buttons in one array.
                  [
                    ['undo', 'redo', 'bold', 'underline', 'fontColor', 'table', 'link', 'image', 'video']
                  ]

------------------ex) Alignment of button group:-------------------------------------------------------------------
                  // Set "-[align]" to the first item in the group. (default: left)
                  [
                    ['-left', 'undo', 'redo']
                    ['-right', 'bold', 'underline', 'italic', 'strike'],
                  ]

------------------ex) Options in the button group(#):--------------------------------------------------------------
                  // Set "#fix" - Fixed the order of buttons within a group in the "rtl" mode.
                  [
                    ['bold'],
                    ['preview', 'print'],
                    ['-left', '#fix', 'rtl_l', 'rtl_r']
                  ]

----------------- ex) More button: --------------------------------------------------------------------------------
                  // The more button is defined as a string starting with a colon.(":").
                  // :Title - Button's innerHTML
                  /**
                   * "Title": Title attribute of the button to be displayed as a tooltip.
                   * * lang.[options.lang.key] -> Use the text of the "lang" option.
                   * * xxx -> Text
                   * "Button's innerHTML": Define the button's "innerHTML".
                   * * default.[defaultIcon] -> Use the attributes of "defaultIcons".
                   * * * default.[more_text, more_paragraph, more_plus, more_horizontal, more_vertical]
                   * * text.[xxx] -> Use the text.
                   * * xxx -> HTML
                   */
                  [
                    ['undo', 'redo'],
                    [':lang.option_lang_text-default.more_text', 'bold', 'underline', 'italic'],
                    [':More Paragraph-default.more_paragraph', 'font', 'formatBlock', 'align', 'list'],
                    [':More Rich-default.more_plus', 'table', 'link', 'image', 'video'],
                    [':View-text.View', 'fullScreen', 'codeView', 'print'],
                    ['-right', ':More Others-<i class="xxx"></i>', 'save', 'template', 'layout'], // Used with alignment
                  ]
                  
----------------- ex) Responsive setting: -------------------------------------------------------------------------
                  // You can specify the arrangement of buttons according to the screen size in advance.
                  // Responsive settings start with a percent sign.("%").
                  // %510(Number based on "px")
                  [
                    // Default
                    ['undo', 'redo'],
                    ['font', 'fontSize', 'formatBlock'],
                    ['paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['fontColor', 'backgroundColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    ['align', 'horizontalLine', 'list', 'lineHeight'],
                    ['table', 'link', 'image', 'video', 'audio', 'math'],
                    ['imageGallery'],
                    ['fullScreen', 'showBlocks', 'codeView'],
                    ['preview', 'print'],
                    ['save', 'template', 'layout'],
                    ['-left', '#fix', 'dir_ltr', 'dir_rtl'],
                    // (min-width:992px)
                    ['%992', [
                        ['undo', 'redo'],
                        [':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                        ['bold', 'underline', 'italic', 'strike'],
                        [':More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
                        ['removeFormat'],
                        ['outdent', 'indent'],
                        ['align', 'horizontalLine', 'list', 'lineHeight'],
                        ['-right', 'dir'],
                        ['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout'],
                        ['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
                    ]],
                    // (min-width:768px)
                    ['%768', [
                        ['undo', 'redo'],
                        [':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                        [':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle', 'removeFormat'],
                        [':More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'horizontalLine', 'list', 'lineHeight'],
                        [':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
                        ['-right', 'dir'],
                        ['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout']
                    ]]
                  ]
                  
```

## License
Suneditor may be freely distributed under the MIT license.
