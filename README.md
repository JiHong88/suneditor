# Suneditor
Pure javascript based WYSIWYG web editor

**Demo site : <a href="#" target="_blank">www.suneditor.com</a>**

## Getting Started

#### 1. include JS/CSS

```html
<link href="suneditor/css/suneditor.css" rel="stylesheet" type="text/css">
<script src="suneditor/js/suneditor.js"></script>
<!-- Setting language (Default : English) -->
<!--<script src="suneditor/lang/ko.js"></script>-->
```

#### 2. target a element

```html
<textarea id="sample">Hello World!</textarea>
```

#### 3. create

```javascript
var suneditor = SUNEDITOR.create('sample',{
    // insert options
});
```

## Options Setting

```properties
addFont         : Add a new font
width           : The width size of the editor
height          : The height size of the editor
videoX          : The default width size of the video frame
videoY          : The default heigth size of the video frame
imageS          : The default width size of the image frame
showFont        : Display font module
showFormats     : Display formats module
showBold        : Display bold module
showUnderline   : Display underline module
showItalic      : Display italic module
showStrike      : Display strike module
showFontColor   : Display font color module
showHiliteColor : Display hilite color module
showInOutDent   : Display indent, outdent module
showAlign       : Display align module
showList        : Display list module
showLine        : Display line module
showTable       : Display table module
showLink        : Display link module
showImage       : Display image module
showVideo       : Display video module
showFullScreen  : Display full screen module
showCodeView    : Display code view module
```
    
## Function

```properties
save()                 : Copies the contents of the suneditor into a [textarea]
getContent()           : Gets the contents of the suneditor
setContent(content)    : Change the contents of the suneditor
appendContent(content) : Add content to the suneditor
disabled()             : Disable the suneditor
enabled()              : Enabled the suneditor
hide()                 : Hide the suneditor
show()                 : Show the suneditor
```

### License
suneditor may be freely distributed under the MIT license.
