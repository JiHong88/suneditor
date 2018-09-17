# Suneditor
Pure JavaScript based WYSIWYG web editor

**Demo site : <a href="http://suneditor.com" target="_blank">suneditor.com</a>**

```properties
The Suneditor is based on pure JavaScript
Suneditor is a lightweight, flexible, customizable WYSIWYG text editor for your web applications

Supported Browser -
Chrome, Safari, Opera, Firefox, Edge, IE 11, Mobile web
```

#### npm

``` sh
$ npm install suneditor
```

#### bower

``` sh
$ bower install suneditor
```

## Sample
```text
Download source and run
 - sample/index.html
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
const suneditor = SUNEDITOR.create('sample',{
    // insert options
});
```

### 4. Contents display
```text
When you display a document created by suneditor

You need to include "src/css/suneditor-contents.css" or "dist/css/suneditor.min.css" file.

Then add "sun-editor-editable" to the class name of the Tag element that displays the content.

In "suneditor-contents.css", you can define the style of all the tags created in suneditor.
```

### Use import statement

### 1. Basic objects that contain all the plugins
```javascript
import {css} from 'suneditor'
import suneditor from 'suneditor'

suneditor.create('sample', {
    // insert options
});
```

### 2. Customize
```text
The link, image, video plugins require a dialog module.
```
```javascript
import {css} from 'suneditor'
import {suneditor, modules, plugins, ko, en} from 'suneditor'

suneditor.create('sample', {
    modules: [
        modules.dialog
    ],
    plugins: [
        plugins.link,
        plugins.image,
        plugins.video
    ],
    buttonList: [
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['link', 'image', 'video']
    ],
    lang: ko,
    popupDisplay: 'full'
})

// Plugins can be used directly in the button list
suneditor.create('sample', {
    modules: [
        modules.dialog
    ],
    buttonList: [
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        [plugins.link, plugins.image, plugins.video]
    ],
})
```

### init function
```text
If the options overlap, the options of the 'create' function take precedence.
```
```javascript
import {css} from 'suneditor'
import {suneditor, modules, plugins} from 'suneditor'

// all plugins
const sampleEditor = suneditor.init({
    modules: [
        modules.dialog
    ],
    plugins: [
        plugins.font,
        plugins.fontSize,
        plugins.formatBlock,
        plugins.fontColor,
        plugins.hiliteColor,
        plugins.align,
        plugins.horizontalRule,
        plugins.list,
        plugins.table,
        plugins.link,
        plugins.image,
        plugins.video
    ],
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/',
        ['fontColor', 'hiliteColor'],
        ['indent', 'outdent'],
        ['align', 'horizontalRule', 'list', 'table'],
        ['link', 'image', 'video'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ]
});

sampleEditor.create('sample', {
    // If the options overlap, the options of the 'create' function take precedence.
});
```

## Examples
**<a href="http://suneditor.com/sample/html/examples.html" target="_blank">Examples</a>**

## Customize
**<a href="http://suneditor.com/sample/html/customize.html" target="_blank">Customize</a>**

## Document
**<a href="http://suneditor.com/sample/html/document.html" target="_blank">Document</a>**
    
    
### License
Suneditor may be freely distributed under the MIT license.
