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

```javascript
var suneditor = SUNEDITOR.create('exampleEditor');

/** Copies the contents of the suneditor into a [textarea] */
function sun_save() {
    suneditor.save();
    document.getElementById('frm').submit();
};

/** Gets the contents of the suneditor */
function sun_getContent() {
    var content = suneditor.getContent();
    alert(content);
};

/** Change the contents of the suneditor */
function sun_setContent(content) {
    suneditor.setContent(content);
};

/** Add content to the suneditor */
function sun_appendContent(content) {
    suneditor.appendContent(content);
};

/** Disable the suneditor */
function sun_disabled() {
    suneditor.disabled();
};

/** Enabled the suneditor */
function sun_enabled() {
    suneditor.enabled();
};

/** Hide the suneditor */
function sun_hide() {
    suneditor.hide();
};

/** Show the suneditor */
function sun_show() {
    suneditor.show();
};
```

### License
suneditor may be freely distributed under the MIT license.
