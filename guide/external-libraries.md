# External Libraries Integration Guide

SunEditor supports integration with external libraries for enhanced functionality. This guide explains how to configure and use **CodeMirror** (code highlighting in code view) and **KaTeX/MathJax** (math formula rendering).

---

## Table of Contents

- [CodeMirror Integration](#codemirror-integration)
    - [CodeMirror 6](#codemirror-6)
    - [CodeMirror 5](#codemirror-5)
- [Math Libraries](#math-libraries)
    - [KaTeX](#katex)
    - [MathJax](#mathjax)
    - [Math Plugin Options](#math-plugin-options)
- [Troubleshooting](#troubleshooting)

---

## CodeMirror Integration

CodeMirror provides syntax highlighting and advanced editing features for the **code view** mode. SunEditor supports both CodeMirror 5 and CodeMirror 6.

### CodeMirror 6

**Installation:**

```bash
npm install codemirror @codemirror/lang-html @codemirror/lang-javascript
```

**Configuration:**

```javascript
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import SUNEDITOR from 'suneditor';
import plugins from 'suneditor/src/plugins';

const editor = SUNEDITOR.create('editor', {
	plugins: plugins,
	buttonList: [['codeView']],
	externalLibs: {
		codeMirror: {
			EditorView: EditorView,
			extensions: [
				basicSetup,
				html({
					matchClosingTags: true,
					autoCloseTags: true,
				}),
				javascript(),
			],
			// state: EditorState.create({...}) // Optional: custom initial state
		},
	},
});
```

**CodeMirror 6 Options:**

| Property     | Type          | Required | Description                          |
| ------------ | ------------- | -------- | ------------------------------------ |
| `EditorView` | `Class`       | ✅       | The EditorView class from codemirror |
| `extensions` | `Array`       | ✅       | Array of CodeMirror 6 extensions     |
| `state`      | `EditorState` | ❌       | Optional custom initial state        |

---

### CodeMirror 5

**Installation:**

```bash
npm install codemirror@5
```

**Configuration:**

```javascript
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import SUNEDITOR from 'suneditor';
import plugins from 'suneditor/src/plugins';

const editor = SUNEDITOR.create('editor', {
	plugins: plugins,
	buttonList: [['codeView']],
	externalLibs: {
		codeMirror: {
			src: CodeMirror,
			options: {
				// Optional: Override default options
				mode: 'htmlmixed',
				htmlMode: true,
				lineNumbers: true,
				lineWrapping: true,
			},
		},
	},
});
```

**CodeMirror 5 Options:**

| Property  | Type     | Required | Description                      |
| --------- | -------- | -------- | -------------------------------- |
| `src`     | `Object` | ✅       | The CodeMirror library object    |
| `options` | `Object` | ❌       | CodeMirror configuration options |

**Default CodeMirror 5 Options:**

```javascript
{
  mode: 'htmlmixed',
  htmlMode: true,
  lineNumbers: true,
  lineWrapping: true
}
```

**CDN Usage (HTML):**

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.0/lib/codemirror.min.css" />

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.0/lib/codemirror.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.0/mode/htmlmixed/htmlmixed.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.0/mode/xml/xml.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.0/mode/css/css.js"></script>
```

```javascript
// CodeMirror is available as global variable
SUNEDITOR.create('editor', {
	externalLibs: {
		codeMirror: {
			src: CodeMirror,
		},
	},
});
```

> **Note:** CodeMirror 6 does not support CDN usage due to its modular ES module architecture.

---

## Math Libraries

The **math** plugin allows inserting mathematical formulas. It requires either KaTeX or MathJax library.

> **Important:** Include the `math` plugin in your buttonList to use math formula features.

### KaTeX

KaTeX is a fast, lightweight library for rendering LaTeX math.

**Installation:**

```bash
npm install katex
```

**Configuration:**

```javascript
import katex from 'katex';
import 'katex/dist/katex.css';
import SUNEDITOR from 'suneditor';
import plugins from 'suneditor/src/plugins';

const editor = SUNEDITOR.create('editor', {
	plugins: plugins,
	buttonList: [['math']],
	externalLibs: {
		katex: {
			src: katex,
			options: {
				// Optional: KaTeX render options
				throwOnError: false,
				displayMode: true,
			},
		},
	},
});
```

**KaTeX Options:**

| Property  | Type     | Required | Description              |
| --------- | -------- | -------- | ------------------------ |
| `src`     | `Object` | ✅       | The katex library object |
| `options` | `Object` | ❌       | KaTeX rendering options  |

**Default KaTeX Options:**

```javascript
{
	throwOnError: false;
}
```

**CDN Usage (HTML):**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.css" />
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.js"></script>
```

```javascript
// katex is available as global variable
SUNEDITOR.create('editor', {
	externalLibs: {
		katex: {
			src: katex,
		},
	},
});
```

---

### MathJax

MathJax provides comprehensive math rendering with broader LaTeX support.

> **Note:** MathJax is **not supported** in iframe mode.

**Installation:**

```bash
npm install mathjax-full
```

**Configuration:**

```javascript
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import SUNEDITOR from 'suneditor';
import plugins from 'suneditor/src/plugins';

const editor = SUNEDITOR.create('editor', {
	plugins: plugins,
	buttonList: [['math']],
	externalLibs: {
		mathjax: {
			src: mathjax,
			TeX: TeX,
			CHTML: CHTML,
			browserAdaptor: browserAdaptor,
			RegisterHTMLHandler: RegisterHTMLHandler,
		},
	},
});
```

**MathJax Options:**

| Property              | Type       | Required | Description                        |
| --------------------- | ---------- | -------- | ---------------------------------- |
| `src`                 | `Object`   | ✅       | The mathjax library object         |
| `TeX`                 | `Class`    | ✅       | TeX input processor class          |
| `CHTML`               | `Class`    | ✅       | CHTML output processor class       |
| `browserAdaptor`      | `Function` | ✅       | Browser adaptor function           |
| `RegisterHTMLHandler` | `Function` | ✅       | HTML handler registration function |

---

### Math Plugin Options

The `math` plugin has additional configuration options:

```javascript
SUNEDITOR.create('editor', {
	externalLibs: {
		katex: { src: katex },
	},
	math: {
		fontSizeList: [
			{ text: '1', value: '1em' },
			{ text: '1.5', value: '1.5em' },
			{ text: '2', value: '2em', default: true },
			{ text: '2.5', value: '2.5em' },
		],
		formSize: {
			width: '460px',
			height: '14em',
			minWidth: '400px',
			minHeight: '40px',
			maxWidth: '800px',
			maxHeight: '400px',
		},
		canResize: true,
		autoHeight: false,
		onPaste: function (event) {
			// Custom paste handler for math input
		},
	},
});
```

---

## Troubleshooting

### CodeMirror not working

1. **Check import:** Ensure you're importing the correct version
2. **Verify options:** CodeMirror 6 requires `EditorView`, CodeMirror 5 requires `src`
3. **Check console:** Look for `[SUNEDITOR.options.externalLibs.codeMirror.fail]` warnings

### Math formulas not rendering

1. **Library not loaded:** Check for `[SUNEDITOR.plugins.math.warn]` in console
2. **KaTeX CSS missing:** Include katex.min.css for proper rendering
3. **MathJax in iframe:** MathJax is not supported in iframe mode

### Common Console Warnings

| Warning                                                         | Cause                               | Solution                                   |
| --------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| `The math plugin must need either "KaTeX" or "MathJax" library` | No math library configured          | Add katex or mathjax to externalLibs       |
| `The katex option is set incorrectly`                           | Missing `src` property              | Add `src: katex` to katex options          |
| `The MathJax option is set incorrectly`                         | Missing required MathJax components | Include all required MathJax imports       |
| `The MathJax option is not supported in the iframe`             | Using MathJax with iframe mode      | Use KaTeX instead or disable iframe mode   |
| `The codeMirror option is set incorrectly`                      | Neither EditorView nor src provided | Check CodeMirror version and configuration |
