# Suneditor
Pure JavaScript based WYSIWYG web editor

**Demo site : <a href="http://suneditor.com" target="_blank">suneditor.com</a>**

```properties
The Suneditor is based on pure JavaScript
Suneditor is a lightweight, flexible, customizable WYSIWYG text editor for your web applications

Supported Browser -
Chrome, Safari, Opera, Edge, IE 10+, Android,
IOS(not fully : table picker, selection, cursor), Firefox(not fully : Button effect when changing selection)
```

## Sample
```text
Download source and run
 - sample/index.html
```

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
<textarea id="sample">Hi</textarea>
```

#### 3. create

```javascript
/**
* ID : 'suneditor_sample'
* ClassName : 'sun-eidtor'
*/
var suneditor = SUNEDITOR.create('sample',{
    // insert options
});
```

## Examples
**<a href="http://suneditor.com/sample/html/examples.html" target="_blank">examples</a>**

## Customize
**<a href="http://suneditor.com/sample/html/customize.html" target="_blank">customize</a>**

## Document
**<a href="http://suneditor.com/sample/html/document.html" target="_blank">document</a>**
    
    
### License
Suneditor may be freely distributed under the MIT license.
