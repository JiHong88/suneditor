<p align="center">
  <a href="https://suneditor.com" target="_blank">
    <img src="https://suneditor-files.s3.ap-northeast-2.amazonaws.com/docs/se3_logo_title_flat.svg" alt="SunEditor" width="280" />
  </a>
</p>

<p align="center"><em>A lightweight and powerful WYSIWYG editor built with vanilla JavaScript</em></p>

<p align="center">
	<a href="https://github.com/JiHong88/SunEditor/blob/master/LICENSE" title="MIT License"><img src="https://img.shields.io/github/license/jihong88/suneditor.svg?style=flat-square" alt="GitHub License"></a>
	<a href="https://www.npmjs.com/package/suneditor" title="npm release"><img src="https://img.shields.io/npm/v/suneditor.svg?style=flat-square" alt="npm"></a>
	<a href="https://www.npmjs.com/package/suneditor" title="npm month downloads"><img src="https://img.shields.io/npm/dm/suneditor.svg?logo=npm&style=flat-square" alt="npm weekly downloads"></a>
	<a href="https://www.jsdelivr.com/package/npm/suneditor" title="jsDelivr CDN month downloads"><img src="https://img.shields.io/jsdelivr/npm/hm/suneditor?label=CDN&style=flat-square" alt="jsDelivr CDN" /></a>
</p>

#

SunEditor supports all modern browsers without dependencies or polyfills.

## 🌟 Why SunEditor?

SunEditor is a lightweight, fast, and extensible WYSIWYG editor written in pure JavaScript.  
It's easy to integrate, highly customizable, and built for modern web applications.

### Key Features

-   ⚡ **No dependencies** — Optimized for speed and simplicity
-   🧩 **Modular architecture** — Enable only the plugins you need
-   📱 **Responsive UI** — Works smoothly on all modern devices
-   🔌 **Framework-friendly** — Easy to use with React, Vue, Svelte, etc.
-   💼 **Feature-rich plugin ecosystem**, including:
    -   🏷 @Mentions with autocomplete
    -   🎨 Advanced table editing & custom layouts
    -   🧮 Math (LaTeX), drawing, and code block support
    -   📂 Built-in media galleries (image, video, audio, file)
    -   📄 PDF export, templates, and embedded content (audio/video/iframe)

🌤 **[Explore all plugins](https://suneditor.com/plugins)**

⭐ **Contributions welcome!** Please refer to [Contribution Guidelines](/CONTRIBUTING.md) and check out our [open tasks](https://github.com/jihong88/suneditor/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22). ⭐

---

## 🌍 Browser Support

| Browser                                                                                                                             | Since    | Version ≥ |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| ![Chrome](https://img.shields.io/badge/-Chrome-4285F4?logo=GoogleChrome&logoColor=white&style=flat-square)                          | Feb 2020 | 80        |
| ![Firefox](https://img.shields.io/badge/-Firefox-FF7139?logo=FirefoxBrowser&logoColor=white&style=flat-square)                      | Mar 2020 | 74        |
| ![Safari](https://img.shields.io/badge/-Safari-0D96F6?logo=Safari&logoColor=white&style=flat-square)                                | Mar 2020 | 13.1      |
| ![Edge](https://img.shields.io/badge/-Edge-0078D7?logo=MicrosoftEdge&logoColor=white&style=flat-square)                             | Jan 2020 | 80        |
| ![Opera](https://img.shields.io/badge/-Opera-FF1B2D?logo=Opera&logoColor=white&style=flat-square)                                   | Feb 2020 | 67        |
| ![iOS Safari](https://img.shields.io/badge/-iOS%20Safari-000000?logo=apple&logoColor=white&style=flat-square)                       | Mar 2020 | 13.4      |
| ![Android WebView](https://img.shields.io/badge/-Android%20WebView-3DDC84?logo=android&logoColor=white&style=flat-square)           | Feb 2020 | 80        |
| ![Samsung Internet](https://img.shields.io/badge/-Samsung%20Internet-1428A0?logo=samsunginternet&logoColor=white&style=flat-square) | Apr 2020 | 11.1      |

❌ Not Supported : IE, Legacy Edge

---

## 📦 Legacy Version (v2-legacy)

> **SunEditor v3 is the latest version.**  
> This section refers to the **previous stable version, SunEditor v2**.

The `v2-legacy` branch is no longer actively maintained,  
but still available for compatibility with older projects.

👉 [`v2-legacy` branch](https://github.com/JiHong88/SunEditor/tree/v2-legacy)

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

## 🔧 Framework Integration

You can use the official wrappers for easier integration:

React – [suneditor-react](https://github.com/JiHong88/suneditor-react)\
Vue – [suneditor-vue](https://github.com/JiHong88/suneditor-vue)

---

## 📦 Plugins

SunEditor supports a plugin-based architecture.\
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

🤖 Want to build plugins? Get real-time help from [SunEditor Devs AI](https://chatgpt.com/g/g-JViNPCrkD-suneditor-devs).\
See [Contribution Guide](./CONTRIBUTING.md#ai-plugin-helper) for tips and examples.

---

## ✨ Contributors

<a href="https://github.com/jihong88/suneditor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jihong88/suneditor" alt="contributors"/>
</a>

---

## 📄 License

SunEditor is an open-source project available under the [MIT License](./LICENSE).
