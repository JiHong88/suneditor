# Suneditor
pure javascript based WYSIWYG web editor

**Demo site : <a href="#">www.suneditor.com</a>**

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

### License
suneditor may be freely distributed under the MIT license.

```javascript
var suneditor = SUNEDITOR.create('exampleEditor');

function sun_save() {
    suneditor.save();
    document.getElementById('frm').submit();
}
function sun_getContent(){alert(suneditor.getContent());}
function sun_setContent(content) {suneditor.setContent(content);}
function sun_appendContent(content) {suneditor.appendContent(content);}
function sun_disabled() {suneditor.disabled();}
function sun_enabled() {suneditor.enabled();}
function sun_show() {suneditor.show();}
function sun_hide() {suneditor.hide();}
```