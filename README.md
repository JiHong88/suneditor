# Suneditor
pure javascript based WYSIWYG web editor

**demo site : <a href="#">www.suneditor.com</a>**

## Getting Started

#### 1. include JS/CSS

```html
<link href="suneditor/css/suneditor.css" rel="stylesheet" type="text/css">
<script src="suneditor/js/suneditor.js"></script>
<script src="suneditor/lang/en.js"></script>
```

#### 2. target a element

```html
<textarea id="sample">Hello World!!!</div>
```

#### 3. create

```javascript
var suneditor = document.getElementById('sample').suneditor({
    // insert options
});
```

### License
suneditor may be freely distributed under the MIT license.
