# Suneditor
pure javascript based WYSIWYG web editor

**demo site : <a href="#">www.suneditor.com</a>**

## Getting Started

#### 1. include JS/CSS

```html
<link href="suneditor/css/suneditor.css" rel="stylesheet" type="text/css">
<script src="suneditor/js/suneditor.js"></script>
<!-- default language english -->
<!--<script src="suneditor/lang/en.js"></script>-->
```

#### 2. target a element

```html
<textarea id="sample">Hello World!!!</textarea>
```

#### 3. create

```javascript
var suneditor = SUNEDITOR.create('sample',{
    // insert options
    addFont : [
        {value:'Times New Roman,Times,serif;', text:'Times New Roman'},
        {value:'Trebuchet MS,Helvetica,sans-serif;', text:'Trebuchet MS'}
    ], /** default: null */
    videoX : 560, /** default: 560 */
    videoY : 315, /** default: 315 */
    height : '300px', /** default: textarea.offsetHeight */
    width : '100%', /** default: textarea.style.width or offsetWidth */
    showFontFamily : true, /** default: true */
    showFormats : true, /** default: true */
    showBold : true, /** default: true */
    showUnderline : true, /** default: true */
    showItalic : true, /** default: true */
    showStrike : true, /** default: true */
    showForeColor : true, /** default: true */
    showHiliteColor : true, /** default: true */
    showInOutDent : true, /** default: true */
    showAlign : true, /** default: true */
    showList : true, /** default: true */
    showLine : true, /** default: true */
    showTable : true, /** default: true */
    showLink : true, /** default: true */
    showImage : true, /** default: true */
    showVideo : true, /** default: true */
    showFullScreen : true, /** default: true */
    showCodeView : true /** default: true */
});
```

### License
suneditor may be freely distributed under the MIT license.
