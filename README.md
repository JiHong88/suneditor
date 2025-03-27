<p align="center">
  <a href="https://suneditor.com" target="_blank">
    <img src="https://suneditor-files.s3.ap-northeast-2.amazonaws.com/docs/se3_logo_title_flat.svg" alt="SunEditor" width="280" />
  </a>
</p>

<p align="center"><em>A lightweight and powerful WYSIWYG editor built with vanilla JavaScript</em></p>

<p align="center">
<a href="https://github.com/JiHong88/SunEditor/blob/master/LICENSE" title="MIT License"><img src="https://img.shields.io/github/license/jihong88/suneditor.svg?style=flat" alt="GitHub License"></a>
<a href="https://www.npmjs.com/package/suneditor" title="npm release"><img src="https://img.shields.io/npm/v/suneditor.svg?style=flat" alt="npm"></a>
<a href="https://www.npmjs.com/package/suneditor" title="npm download"><img src="https://img.shields.io/npm/dt/suneditor.svg?style=flat" alt="npm download"></a>
<a href="https://www.jsdelivr.com/package/npm/suneditor" title="jsDelivr CDN"><img src="https://img.shields.io/jsdelivr/npm/hm/suneditor?label=CDN&style=flat" alt="jsDelivr CDN" /></a>
</p>

#

SunEditor supports all modern browsers without dependencies or polyfills.

## 🌟 Why SunEditor?

-   ⚡ Lightweight and fast
-   ✨ Pure vanilla JavaScript (no dependencies)
-   🧩 Plugin-based architecture
-   📱 Responsive and touch-friendly
-   🌐 Easy integration with frameworks (React, Vue, etc.)

🌤 **[ Live Demo – Try SunEditor Now! ](https://suneditor.com)** 🌤

⭐ **Contributions welcome!** Please refer to [Contribution Guidelines](/CONTRIBUTING.md) and check out our [open tasks](https://github.com/jihong88/suneditor/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22). ⭐

---

## 🌍 Browser Support

|               | ![Chrome](https://img.shields.io/badge/-Chrome-4285F4?logo=GoogleChrome&logoColor=white) | ![Firefox](https://img.shields.io/badge/-Firefox-FF7139?logo=FirefoxBrowser&logoColor=white) | ![Safari](https://img.shields.io/badge/-Safari-0D96F6?logo=Safari&logoColor=white) | ![Edge](https://img.shields.io/badge/-Edge-0078D7?logo=MicrosoftEdge&logoColor=white) | ![Opera](https://img.shields.io/badge/-Opera-FF1B2D?logo=Opera&logoColor=white) | ![iOS Safari](https://img.shields.io/badge/-iOS%20Safari-000000?logo=apple&logoColor=white) | ![Android WebView](https://img.shields.io/badge/-Android%20WebView-3DDC84?logo=android&logoColor=white) | ![Samsung Internet](https://img.shields.io/badge/-Samsung%20Internet-1428A0?logo=samsunginternet&logoColor=white) |
| ------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Version ≥** | 80                                                                                       | 74                                                                                           | 13.1                                                                               | 80                                                                                    | 67                                                                              | 13.4                                                                                        | 80                                                                                                      | 11.1                                                                                                              |
| **Since**     | Feb 2020                                                                                 | Mar 2020                                                                                     | Mar 2020                                                                           | Jan 2020                                                                              | Feb 2020                                                                        | Mar 2020                                                                                    | Feb 2020                                                                                                | Apr 2020                                                                                                          |

❌ Not Supported : IE, Legacy Edge

---

## 🚀 Install & Quick Start

> 💡 **Want to see it in action?**  
> Check out the 🌤 [**Live Demo**](https://suneditor.com) 🌤 with full options and examples.

### NPM

```bash
npm install suneditor --save
```

```js
import 'suneditor/dist/suneditor.min.css';
import suneditor from 'suneditor';

// HTML: <div id="editor"></div> or <textarea id="editor"></textarea>
suneditor.create(document.querySelector('#editor'), {
	buttonList: [
		['undo', 'redo'],
		'|',
		['bold', 'underline', 'italic', 'strike', '|', 'subscript', 'superscript'],
		'|',
		['removeFormat'],
		'|',
		['outdent', 'indent'],
		'|',
		['fullScreen', 'showBlocks', 'codeView'],
		'|',
		['preview', 'print', 'copy']
	],
	height: 'auto'
});
```

### CDN ([jsDelivr](https://www.jsdelivr.com/package/npm/suneditor))

```html
<script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.css" rel="stylesheet" />
<!-- Optional language (default is English): e.g., Korean (ko) -->
<!-- <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/langs/ko.js"></script> -->

<div id="editor"></div>
<!-- or <textarea id="editor"></textarea> -->

<script>
	SUNEDITOR.create(document.querySelector('#editor'), {
		buttonList: [
			['undo', 'redo'],
			'|',
			['bold', 'underline', 'italic', 'strike', '|', 'subscript', 'superscript'],
			'|',
			['removeFormat'],
			'|',
			['outdent', 'indent'],
			'|',
			['fullScreen', 'showBlocks', 'codeView'],
			'|',
			['preview', 'print', 'copy']
		],
		height: 'auto'
	});
</script>
```

---

## 📦 Plugins

SunEditor supports a plugin-based architecture.
You can enable only the plugins you need or even create your own custom ones.

```js
suneditor.create('#editor', {
	plugins: ['font', 'image', 'video'],
	image: {
		uploadUrl: 'https://upload.image'
	}
});
```

📘 [Learn how to build your own plugin →](https://suneditor.com/plugins)

---

## ✨ Contributors

<a href="https://github.com/jihong88/suneditor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jihong88/suneditor" alt="contributors"/>
</a>

---

## 📄 License

SunEditor is an open-source project available under the [MIT License](./LICENSE).
