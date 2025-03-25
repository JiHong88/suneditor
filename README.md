# ![SunEditor](https://se3-docs-repo.s3.ap-northeast-2.amazonaws.com/logo/se3_logo_title.svg)

**A vanilla JavaScript (ES2020) WYSIWYG web editor**

SunEditor supports all modern browsers (excluding IE) without dependencies or polyfills.

🌤 **[✨ Live Demo – Try SunEditor Now! ✨](http://suneditor.com)** 🌤

⭐ **Contributions welcome!** Please refer to [Contribution Guidelines](/CONTRIBUTING.md) and check out our [open tasks](https://github.com/jihong88/suneditor/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22). ⭐

[![GitHub License](https://img.shields.io/github/license/jihong88/suneditor.svg?style=flat-square)](https://github.com/JiHong88/SunEditor/blob/master/LICENSE.txt)
[![GitHub Release](https://img.shields.io/github/release/jihong88/suneditor.svg?style=flat-square)](https://github.com/JiHong88/SunEditor/releases)
[![npm version](https://img.shields.io/npm/v/suneditor.svg?style=flat-square)](https://www.npmjs.com/package/suneditor)
[![jsDelivr CDN](https://data.jsdelivr.com/v1/package/npm/suneditor/badge)](https://www.jsdelivr.com/package/npm/suneditor)

---

## 🌍 Browser Support

| Browser           | Supported Versions |
| ----------------- | ------------------ |
| Chrome            | ≥ 80 (Feb 2020)    |
| Firefox           | ≥ 74 (Mar 2020)    |
| Safari            | ≥ 13.1 (Mar 2020)  |
| iOS Safari        | ≥ 13.4 (Mar 2020)  |
| Edge (Chromium)   | ≥ 80 (Jan 2020)    |
| Android WebView   | ≥ 80 (Feb 2020)    |
| **Not Supported** | IE, Legacy Edge    |

---

## ⚡ Install & Quick Start

You can use SunEditor via **npm** or **CDN**.

Please refer to the 🌤 **[Live Demo](https://suneditor.com)** 🌤 for detailed documentation and examples.

### 🧩 NPM

```bash
npm install suneditor --save
```

```js
import 'suneditor/dist/suneditor.min.css';
import suneditor from 'suneditor';

// HTML: <div id="editor"></div> or <textarea id="editor"></textarea>
suneditor.create(document.querySelector('#editor'), {
	/** options */
});
```

### 🌐 CDN ([jsDelivr](https://www.jsdelivr.com/package/npm/suneditor))

```html
<script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.css" rel="stylesheet" />
<!-- Optional language (default is English): e.g., Korean (ko) -->
<!-- <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/langs/ko.js"></script> -->

<div id="editor"></div>
<!-- or <textarea id="editor"></textarea> -->

<script>
	SUNEDITOR.create(document.querySelector('#editor'), {
		/** options */
	});
</script>
```

---

## ✨ Contributors

<a href="https://github.com/jihong88/suneditor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jihong88/suneditor" alt="contributors"/>
</a>

---

## 📄 License

SunEditor is an open-source project available under the [MIT License](./LICENSE).
