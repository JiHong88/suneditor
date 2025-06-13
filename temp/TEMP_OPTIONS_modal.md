### Audio Plugin (`audio`)

**Description:**
This plugin provides a modal window to insert audio.\
Users can insert audio by uploading a file directly or by providing a URL.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	audio: {
		createFileInput: true,
		uploadUrl: '/api/audio/upload',
		uploadHeaders: { Authorization: 'Bearer TOKEN' },
		acceptedFormats: 'audio/mpeg, audio/wav',
		audioTagAttributes: {
			'data-custom': 'my-value'
		}
	}
});
```

### Options

#### `defaultWidth`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'300px'`
-   **Description:** The default width of the inserted audio player.

#### `defaultHeight`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'150px'`
-   **Description:** The default height of the inserted audio player.

#### `createFileInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, shows the file input tab for direct audio uploads.

#### `createUrlInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, shows the URL input tab for embedding audio from a URL.

#### `uploadUrl`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** The server endpoint URL for file uploads. This is required if `createFileInput` is `true`.

#### `uploadHeaders`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Custom headers to be sent with the file upload request.

#### `uploadSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The total size limit in bytes for all files when `allowMultiple` is `true`. A value of `0` means no limit.

#### `uploadSingleSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The size limit in bytes for a single file. A value of `0` means no limit.

#### `allowMultiple`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, allows users to select and upload multiple audio files at once.

#### `acceptedFormats`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'audio/*'`
-   **Description:** A comma-separated string of accepted audio formats (MIME types).

#### `audioTagAttributes`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Additional attributes to add to the `<audio>` tag when it is inserted into the editor.

---

### Drawing Plugin (`drawing`)

**Description:**
This plugin provides a modal window with a canvas, allowing users to draw images with their mouse or finger.\
The created drawing can be inserted into the editor as a data URL or an SVG file.

**Dependencies:**

-   This plugin requires the `image` plugin to be active.
-   To use the `outputFormat: 'svg'` option, the `image` plugin must have its `uploadUrl` option configured, as the SVG is uploaded as a file.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	drawing: {
		lineWidth: 10,
		lineColor: '#ff0000',
		formSize: {
			width: '90vw'
		}
	}
});
```

### Options

#### `outputFormat`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'dataurl'`
-   **Description:** The output format of the drawing. Can be `'dataurl'` (base64 encoded) or `'svg'`. Using `'svg'` requires the `image.uploadUrl` option to be set.

#### `useFormatType`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, enables a UI choice to insert the drawing as a 'block' or 'inline' element.

#### `defaultFormatType`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'block'`
-   **Description:** The default insertion format for the drawing. Can be `'block'` or `'inline'`.

#### `keepFormatType`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, the chosen format type ('block' or 'inline') is maintained for the next drawing session.

#### `lineWidth`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `5`
-   **Description:** The default width of the drawing brush in pixels.

#### `lineReconnect`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, lines will reconnect smoothly as you draw.

#### `lineCap`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'round'`
-   **Description:** The style of the line ends. Can be `'butt'`, `'round'`, or `'square'`.

#### `lineColor`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** The default color of the drawing brush (e.g., HEX, RGB). If empty, it defaults to the editor's text color.

#### `canResize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, the drawing modal window can be resized by the user.

#### `maintainRatio`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, the aspect ratio of the drawing canvas is maintained when resizing the modal.

#### `formSize`

-   **Type:** `Object`
-   **Required:** `false`
-   **Default:** `{ width: '750px', height: '50vh', ... }`
-   **Description:** An object to customize the size of the drawing modal. It accepts `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, and `minHeight` properties.

---

### Embed Plugin (`embed`)

**Description:**
This plugin provides a modal interface for embedding external content into the editor.\
It supports a wide range of services like YouTube, Vimeo, and social media posts by parsing the URL and converting it into the appropriate embeddable iframe.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	embed: {
		query_youtube: 'rel=0&autoplay=1',
		embedQuery: {
			// Adding a new service
			twitch: {
				pattern: /twitch\.tv\/(.+)/i,
				action: (url) => {
					const channel = url.match(/twitch\.tv\/(.+)/i)[1];
					// Replace YOUR_DOMAIN with the domain where the editor is hosted
					return `https://player.twitch.tv/?channel=${channel}&parent=YOUR_DOMAIN`;
				},
				tag: 'iframe'
			}
		}
	}
});
```

### Options

#### `canResize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, allows the embedded iframe element to be resized by the user.

#### `showHeightInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, displays the height input field in the embed modal.

#### `defaultWidth`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** The default width of the embed element (e.g., `'560px'`, `'100%'`).

#### `defaultHeight`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** The default height of the embed element (e.g., `'315px'`).

#### `percentageOnlySize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, resizing handles will only use percentage units instead of pixels.

#### `uploadUrl`, `uploadHeaders`, `uploadSizeLimit`, `uploadSingleSizeLimit`

-   **Description:** These options are used for embedding local media files (like videos) that need to be uploaded to a server first. They function identically to the options in the `video` or `audio` plugins.

#### `iframeTagAttributes`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An object of additional attributes to add to the `<iframe>` tag when it is inserted.

#### `query_youtube`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** An additional query string to append to YouTube embed URLs (e.g., `'autoplay=1&mute=1'`).

#### `query_vimeo`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** An additional query string to append to Vimeo embed URLs.

#### `urlPatterns`

-   **Type:** `Array<RegExp>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array of additional RegExp patterns to recognize embeddable URLs.

#### `embedQuery`

-   **Type:** `Object`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An object to define or override embeddable services. This extends a built-in list that includes Facebook, Twitter, Instagram, etc. Each key is a service name, and the value is an object with a `pattern` (RegExp), `action` (a function returning the embed URL), and `tag` ('iframe').

#### `controls`

-   **Type:** `Array<Array<string>>`
-   **Required:** `false`
-   **Default:** Depends on the `canResize` option.
    -   If `canResize` is `true`: `[['resize_auto,75,50', 'align', 'edit', 'revert', 'copy', 'remove']]`
    -   If `canResize` is `false`: `[['align', 'edit', 'copy', 'remove']]`
-   **Description:** Customizes the floating toolbar for the embed component.

---

### Image Plugin (`image`)

**Description:**
This plugin provides a modal interface for inserting and editing images.\
It supports image insertion via file upload or URL, and offers a rich set of tools for resizing, rotating, aligning, and adding captions and links to images.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	image: {
		uploadUrl: '/api/image/upload',
		uploadHeaders: { Authorization: 'Bearer TOKEN' },
		allowMultiple: true,
		acceptedFormats: 'image/jpeg, image/png, image/gif',
		defaultWidth: 'auto',
		defaultHeight: 'auto'
	}
});
```

### Options

#### `canResize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, allows the inserted image to be resized by the user.

#### `showHeightInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, displays the height input field in the image modal.

#### `defaultWidth`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'auto'`
-   **Description:** The default width of the image.

#### `defaultHeight`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'auto'`
-   **Description:** The default height of the image.

#### `percentageOnlySize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, resizing handles will only use percentage units instead of pixels.

#### `createFileInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, shows the file input tab for direct image uploads.

#### `createUrlInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, shows the URL input tab for inserting an image from a URL.

#### `uploadUrl`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** The server endpoint URL for file uploads. This is required if `createFileInput` is `true`.

#### `uploadHeaders`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Custom headers to be sent with the file upload request.

#### `uploadSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The total size limit in bytes for all files when `allowMultiple` is `true`. `0` means no limit.

#### `uploadSingleSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The size limit in bytes for a single file. `0` means no limit.

#### `allowMultiple`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, allows users to select and upload multiple images at once.

#### `acceptedFormats`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'image/*'`
-   **Description:** A comma-separated string of accepted image formats (MIME types).

#### `useFormatType`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, enables a UI choice to insert the image as a 'block' or 'inline' element.

#### `defaultFormatType`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'block'`
-   **Description:** The default insertion format for the image, either `'block'` or `'inline'`.

#### `keepFormatType`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, the chosen format type ('block' or 'inline') is maintained for the next image insertion.

#### `linkEnableFileUpload`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, enables a file upload button in the "Edit Link" modal for an image.

#### `controls`

-   **Type:** `Array<Array<string>>`
-   **Required:** `false`
-   **Default:** Depends on the `canResize` option.
    -   If `canResize` is `true`: `[['resize_auto,100,75,50', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v'], ['align', 'caption', 'edit', 'revert', 'copy', 'remove']]`
    -   If `canResize` is `false`: `[['as', 'mirror_h', 'mirror_v', 'align', 'caption', 'edit', 'revert', 'copy', 'remove']]`
-   **Description:** Customizes the floating toolbar for the image component.

---

### Link Plugin (`link`)

**Description:**
This plugin provides a modal interface for inserting and editing hyperlinks.\
It also supports creating links by uploading files, which requires configuring an upload URL.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	link: {
		uploadUrl: '/api/link/upload',
		defaultRel: 'nofollow noreferrer',
		acceptedFormats: 'application/pdf, .zip',
		openNewWindow: true
	}
});
```

### Options

#### File Upload Options

These options enable the functionality to create a link by uploading a file.

#### `uploadUrl`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** The server endpoint URL for file uploads. Providing this URL enables the file upload functionality in the link modal.

#### `uploadHeaders`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Custom headers to be sent with the file upload request.

#### `uploadSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The total size limit in bytes for all files if multiple uploads are enabled. `0` means no limit.

#### `uploadSingleSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The size limit in bytes for a single file. `0` means no limit.

#### `acceptedFormats`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** A comma-separated string of accepted file formats for upload (MIME types or extensions).

#### Link Behavior Options

These options control the behavior and attributes of the created link (`<a>` tag).

#### `openNewWindow`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, a checkbox to open the link in a new window (`target='_blank'`) is added and checked by default.

#### `noAutoPrefix`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, does not automatically add 'http://' to URLs that lack a protocol.

#### `relList`

-   **Type:** `Array<Object>`
-   **Required:** `false`
-   **Default:** `[]`
-   **Description:** A list of `rel` attribute options to display as checkboxes. Example: `[{name: 'nofollow', value: 'nofollow', checked: true}]`.

#### `defaultRel`

-   **Type:** `Object | string`
-   **Required:** `false`
-   **Default:** `{}`
-   **Description:** The default `rel` attribute values to apply to new links. It can be a simple string (e.g., `'nofollow'`) or an object for more complex scenarios, like: `{ default: 'nofollow', check_new_window: 'noreferrer noopener' }`.

---

### Math (KaTeX) Plugin (`math`)

**Description:**
This plugin provides a modal to insert and edit mathematical expressions using the KaTeX or MathJax libraries.\
It allows for writing LaTeX expressions and renders them visually in the editor.

**Dependencies:**

-   This plugin requires an external math library.\
    You must provide either **KaTeX** or **MathJax** through the editor's top-level `externalLibs` option.\
    If neither is provided, the plugin will not function.

**Example:**

```javascript
suneditor.create('editor', {
	// Provide the external library
	externalLibs: {
		katex: window.katex // Or your own path to the KaTeX library
	},
	// ...other options
	math: {
		autoHeight: true,
		fontSizeList: [
			{ text: 'Small', value: '1em' },
			{ text: 'Medium', value: '1.5em' },
			{ text: 'Large', value: '2em' }
		]
	}
});
```

### Options

#### `canResize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, allows the math modal window to be resized by the user.

#### `autoHeight`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, the modal's height automatically adjusts to the content.

#### `fontSizeList`

-   **Type:** `Array<Object>`
-   **Required:** `false`
-   **Default:** `[{ text: '1', value: '1em' }, { text: '1.5', value: '1.5em' }, { text: '2', value: '2em' }, { text: '2.5', value: '2.5em' }]`
-   **Description:** A list of font size options for the math expression preview. Each object must have a `text` (display name) and `value` (CSS size) property.

#### `onPaste`

-   **Type:** `Function`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** A custom callback function to execute on paste events within the math input area.

#### `formSize`

-   **Type:** `Object`
-   **Required:** `false`
-   **Default:** `{ width: '460px', height: '14em', ... }`
-   **Description:** An object to customize the size of the math modal. It accepts `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, and `minHeight` properties.

---

### Video Plugin (`video`)

**Description:**
This plugin provides a modal interface for inserting and embedding videos.\
It supports direct video file uploads, embedding from URLs, and recognizes links from popular services like YouTube and Vimeo.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	video: {
		createFileInput: true,
		uploadUrl: '/api/video/upload',
		ratioOptions: [
			{ name: 'Square', value: 1 },
			{ name: 'Cinema', value: 21 / 9 }
		],
		query_youtube: 'rel=0&autoplay=1'
	}
});
```

### Options

#### General & Sizing Options

#### `canResize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, allows the embedded video to be resized.

#### `showHeightInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, displays the height input field in the modal.

#### `defaultWidth`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** The default width of the video element (e.g., `'560px'`, `'100%'`).

#### `defaultHeight`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** The default height of the video element (e.g., `'315px'`).

#### `percentageOnlySize`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, resizing handles will only use percentage units instead of pixels.

#### Aspect Ratio Options

#### `defaultRatio`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0.5625` (16:9)
-   **Description:** The default aspect ratio for the video (height / width).

#### `showRatioOption`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, displays the aspect ratio selection options in the modal.

#### `ratioOptions`

-   **Type:** `Array<Object>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array to define custom aspect ratio options. Example: `[{ name: 'Square', value: 1 }]`.

#### Modal UI Options

#### `createFileInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, shows the file input tab for direct video uploads.

#### `createUrlInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, shows the URL input tab for embedding videos.

#### File Upload Options

These options are only relevant if `createFileInput` is `true`.

#### `uploadUrl`, `uploadHeaders`, `uploadSizeLimit`, `uploadSingleSizeLimit`, `allowMultiple`

-   **Description:** These function identically to the options in the `audio` or `fileUpload` plugins, but for video files.

#### `acceptedFormats`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'video/*'`
-   **Description:** A comma-separated string of accepted video formats.

#### `extensions`

-   **Type:** `Array<string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array of additional file extensions to be recognized as video files.

#### Embedding & Attribute Options

#### `videoTagAttributes`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Additional attributes to add to the `<video>` tag.

#### `iframeTagAttributes`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Additional attributes to add to the `<iframe>` tag for embedded videos.

#### `query_youtube`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** An additional query string to append to YouTube embed URLs.

#### `query_vimeo`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** An additional query string to append to Vimeo embed URLs.

#### `embedQuery`

-   **Type:** `Object`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An object to define or override embeddable services, similar to the `embed` plugin.

#### `urlPatterns`

-   **Type:** `Array<RegExp>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array of additional RegExp patterns to recognize embeddable video URLs.

#### `controls`

-   **Type:** `Array<Array<string>>`
-   **Required:** `false`
-   **Default:** Depends on the `canResize` option.
    -   If `canResize` is `true`: `[['resize_auto,75,50', 'align', 'edit', 'revert', 'copy', 'remove']]`
    -   If `canResize` is `false`: `[['align', 'edit', 'copy', 'remove']]`
-   **Description:** Customizes the floating toolbar for the video component.

---
