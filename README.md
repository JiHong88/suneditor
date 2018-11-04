# Suneditor
Pure javscript based WYSIWYG web editor, with no dependencies

**Demo site : <a href="http://suneditor.com" target="_blank">suneditor.com</a>**

[![NPM](https://nodei.co/npm/suneditor.png)](https://nodei.co/npm/suneditor/)

[![GitHub](https://img.shields.io/github/license/jihong88/suneditor.svg)](https://github.com/JiHong88/SunEditor/blob/master/LICENSE.txt)
[![GitHub release](https://img.shields.io/github/release/jihong88/suneditor.svg)](https://github.com/JiHong88/SunEditor/releases)
[![npm](https://img.shields.io/npm/dt/suneditor.svg)](https://www.npmjs.com/package/suneditor)
![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/suneditor.svg)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/suneditor.svg)


```properties
The Suneditor is based on pure javascript, with no dependencies.
Suneditor is a lightweight, flexible, customizable WYSIWYG text editor for your web applications.

Supported Browser -
Chrome, Opera, Firefox, Edge, IE 11, Safari(macOS, IOS), Mobile web.
```

#### npm

``` sh
$ npm install --save suneditor
```

#### bower

``` sh
$ bower install --save suneditor
```

## Getting Started
**<a href="http://suneditor.com/sample/html/getting-started.html" target="_blank">Getting Started</a>**
### 1. Include
```html
<link href="../dist/suneditor.min.css" rel="stylesheet" type="text/css">
<script src="../dist/suneditor.min.js"></script>
```

### 2. Target Element
```html
<textarea id="sample">Hi</textarea>
```

### 3. Create
```javascript
/**
* ID : 'suneditor_sample'
* ClassName : 'sun-eidtor'
*/
// ID or DOM object
const suneditor = SUNEDITOR.create((document.getElementById('sample') || 'sample'),{
    // All of the plugins are loaded in the "window.SUNEDITOR" object in dist/suneditor.min.js file
    // insert options
});
```

### 4. Contents display
```text
When you display a document created by suneditor

You need to include "src/assets/css/suneditor-contents.css" or "dist/css/suneditor.min.css" file.

Then add "sun-editor-editable" to the class name of the Tag element that displays the content.

In "suneditor-contents.css", you can define the style of all the tags created in suneditor.
```

### Use import statement

### 1. Default options
```javascript
import 'suneditor/dist/css/suneditor.min.css'
// or
// import 'suneditor/src/assets/css/suneditor.css'
// import 'suneditor/src/assets/css/suneditor-contents.css'

import suneditor from 'suneditor'

// The default button list is created.
suneditor.create('sample', {
    // insert options
});
```

### 2. Load only what you want
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import {en, ko} from 'suneditor/src/lang'
import {align, font, fontSize, fontColor, hiliteColor,
        horizontalRule, list, table, formatBlock, link, image, video} from 'suneditor/src/plugins'

suneditor.create('sample', {
    plugins: [
        align,
        font,
        fontSize,
        fontColor,
        hiliteColor,
        horizontalRule,
        list,
        table,
        formatBlock,
        link,
        image,
        video
    ],
    buttonList: [
        ['font', 'fontSize', 'formatBlock'],
        ['fontColor', 'hiliteColor'],
        ['align', 'horizontalRule', 'list', 'table'],
        ['link', 'image', 'video']
    ],
    lang: ko
});
```

### 3. Load all plugins
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import plugins from 'suneditor/src/plugins'

suneditor.create('sample', {
    plugins: plugins,
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/', // Line break
        ['fontColor', 'hiliteColor'],
        ['indent', 'outdent'],
        ['align', 'horizontalRule', 'list', 'table'],
        ['link', 'image', 'video'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ]
})

// You can also load what you want
suneditor.create('sample', {
    plugins: [
        plugins.font
        plugins.fontSize,
        plugins.formatBlock
    ],
    buttonList: [
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['font', 'fontSize', 'formatBlock', 'removeFormat', 'preview', 'print']
    ]
})
```

### 4. Plugins can be used directly in the button list
```javascript
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import {align, font, fontSize, fontColor, hiliteColor,
        horizontalRule, list, table, formatBlock, link, image, video} from 'suneditor/src/plugins'

suneditor.create('sample', {
    buttonList: [
        ['undo', 'redo'],
        [font, fontSize, formatBlock],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/', // Line break
        [fontColor, hiliteColor],
        ['indent', 'outdent'],
        [align, horizontalRule, list, table],
        [link, image, video],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ],
})
```

### 5. Use init function
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

initEditor.create('sample_1', {
    // The value of the option argument put in the "create" function call takes precedence
});
initEditor.create('sample_2', {
    // The value of the option argument put in the "create" function call takes precedence
    buttonList: [
        ['undo', 'redo'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        ['indent', 'outdent'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ]
});
```

### Options
```javascript
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
]               : Plugins array                                     default : null {Array}
stickyToolbar   : Reference height value that should be changed to sticky toolbar mode
                  It can also be used when there is another fixed toolbar at the top
                  Set to 0, '0px', '50px', etc
                  If set to -1 or false or null to turn off         default : 0 {Number|String|Boolean}
resizingBar     : Show the bottom resizing bar.
                  If 'height' value is 'auto', it will not be resized default : true {Boolean}
fontSize        : Change default font-size array                    default : null {Array}
font            : Change default font-family array                  default : null {Array}
colorList       : Change default color array of color picker        default : null {Array}
width           : The width size of the editor                      default : textarea.clientWidth || '100%' {Number|String}
height          : The height size of the editor                     default : textarea.clientHeight|| 'auto' {Number|String}
minHeight       : The min-height size of the editor.
                  Used when 'height' value is 'auto'                default : null {Number|String}
maxHeight       : The max-height size of the editor
                  Used when 'height' value is 'auto'                default : null {Number|String}
display         : The display property of suneditor                 default : 'block' {String}
videoWidth      : The default width size of the video frame         default : 560 {Number}
videoHeight     : The default heigth size of the video frame        default : 315 {Number}
showPathLabel   : Displays the current node structure to resizingBar default : true {Boolean}
popupDisplay    : Size of background area when activating dialog window ('full' || 'local') default : 'full' {String}

lang            : language object (en, ko) default : English {Object}

imageFileInput  : Choose whether to create a file input tag in the image upload window default : true {Boolean}
imageUrlInput   : Choose whether to create a image url input tag in the image upload window default : true {Boolean}
                  If the value of imageFileInput is false, it will be unconditionally true {Boolean}
imageSize       : The default width size of the image frame  default : 350 {Number}
imageUploadUrl  : The image upload to server mapping address default : null {String}
                  ex) "/editor/uploadImage.ajax"
                  When not used, it enters base64 data
                  return type : JSONArray [{"SUNEDITOR_IMAGE_SRC":"/download/editorImg/image1.jpg"},
                                           {"SUNEDITOR_IMAGE_SRC":"/download/editorImg/image2.jpg"}]

buttonList      : Defines button list to array {Array}
                default : [
                    ['undo', 'redo'],
                    // ['font', 'fontSize', 'formatBlock'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['removeFormat'],
                    // '/', Line break
                    // ['fontColor', 'hiliteColor'],
                    ['indent', 'outdent'],
                    // ['align', 'horizontalRule', 'list', 'table'],
                    // ['link', 'image', 'video'],
                    ['fullScreen', 'showBlocks', 'codeView'],
                    ['preview', 'print']
                ]
```

### Functions
```javascript
import suneditor from 'suneditor'

const editor = suneditor.create('example');

// Copies the contents of the suneditor into a [textarea]
editor.save();

// Gets the suneditor's context object. Contains settings, plugins, and cached element objects
editor.getContext();

// Gets the contents of the suneditor
editor.getContents();

// Inserts an HTML element or HTML string or plain string at the current cursor position
editor.insertHTML('<img src="http://suneditor.com/sample/img/sunset.jpg">');

// Change the contents of the suneditor
editor.setContents('set contents');

// Add content to the suneditor
editor.appendContents('append contents');

// Disable the suneditor
editor.disabled();

// Enabled the suneditor
editor.enabled();

// Hide the suneditor
editor.hide();

// Show the suneditor
editor.show();
    
// Destroy the suneditor
editor.destroy();
```

## Examples
**<a href="http://suneditor.com/sample/html/examples.html" target="_blank">Examples</a>**

## Customize
**<a href="http://suneditor.com/sample/html/customize.html" target="_blank">Customize</a>**

## Document
**<a href="http://suneditor.com/sample/html/document.html" target="_blank">Document</a>**
    
    
### License
Suneditor may be freely distributed under the MIT license.
