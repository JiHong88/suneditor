### Audio Gallery Plugin Options (`audioGallery`)

This plugin provides a gallery UI for users to browse and insert audio files into the editor.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	audioGallery: {
		// Configure audioGallery options here
		url: '/my/audio/list/url',
		headers: { Authorization: 'Bearer YOUR-TOKEN' },
		thumbnail: (item) => item.thumbnailUrl
	}
});
```

#### `data`

-   **Description**: An array of audio data to display directly in the gallery without a server call. Cannot be used with the `url` option.
-   **Type**: `Array<Object>`
-   **Default**: `undefined`

#### `url`

-   **Description**: The server URL to fetch the list of audio data for the gallery.
-   **Type**: `string`
-   **Default**: `undefined`

#### `headers`

-   **Description**: An object of HTTP headers to use when sending a request to the server with the `url` option. Useful for passing authorization tokens, etc.
-   **Type**: `Object<string, string>`
-   **Default**: `undefined`

#### `thumbnail`

-   **Description**: Specifies the default thumbnail image for audio files in the gallery.
-   **Type**: `string | ((item: Object) => string)`
-   **Default**: The editor's built-in default audio icon (`this.icons.audio_thumbnail`).
-   **Details**:
    -   **As a `string`**: The same thumbnail image URL will be used for all audio items.
    -   **As a `function`**: Receives each audio item (`item`) as an argument and should return a thumbnail image URL dynamically. Use this when you want to display different thumbnails for each item.

---

### File Browser Plugin Options (`fileBrowser`)

This plugin provides a UI to browse and insert various files, such as videos, audio, or other documents.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	fileBrowser: {
		url: '/my/file/list/url',
		headers: { Authorization: 'Bearer YOUR-TOKEN' },
		props: ['link', 'caption']
	}
});
```

#### `data`

-   **Description**: An array of file data to display directly in the browser without a server call. Cannot be used with the `url` option.
-   **Type**: `Array<Object> | Object<string, *>`
-   **Default**: `undefined`

#### `url`

-   **Description**: The server URL to fetch the list of file data for the browser.
-   **Type**: `string`
-   **Default**: `undefined`

#### `headers`

-   **Description**: An object of HTTP headers to use when sending a request to the server with the `url` option.
-   **Type**: `Object<string, string>`
-   **Default**: `undefined`

#### `thumbnail`

-   **Description**: Specifies the thumbnail image for files in the browser.
-   **Type**: `string | ((item: Object) => string)`
-   **Default**: A function that returns a default icon based on the file's `type` property.
-   **Details**:
    -   If this option is not set, a default icon is shown based on the `item.type` property of your data ('video', 'audio'). If the type does not match, a generic file icon is used.
    -   **As a `function`**: Receives each file item (`item`) as an argument and should return a thumbnail image URL dynamically. This allows for custom thumbnails for each file.

#### `props`

-   **Description**: An array of strings specifying additional property names to be associated with each file item.
-   **Type**: `Array<string>`
-   **Default**: `[]`
-   **Details**: The property `'frame'` is always added to this list automatically by the plugin.

---

Of course. Here is the documentation for the `fileGallery` plugin options in both English and Korean.

---

### File Gallery Plugin Options (`fileGallery`)

This plugin provides a gallery UI for users to browse and insert generic files.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	fileGallery: {
		url: '/my/file/gallery/url',
		headers: { Authorization: 'Bearer YOUR-TOKEN' },
		thumbnail: (item) => item.thumbnail_url // Example for a dynamic thumbnail
	}
});
```

#### `data`

-   **Description**: An array of file data to display directly in the gallery without a server call. Cannot be used with the `url` option.
-   **Type**: `Array<Object>`
-   **Default**: `undefined`

#### `url`

-   **Description**: The server URL to fetch the list of file data for the gallery.
-   **Type**: `string`
-   **Default**: `undefined`

#### `headers`

-   **Description**: An object of HTTP headers to use when sending a request to the server with the `url` option.
-   **Type**: `Object<string, string>`
-   **Default**: `undefined`

#### `thumbnail`

-   **Description**: Specifies the thumbnail image for files in the gallery.
-   **Type**: `string | ((item: Object) => string)`
-   **Default**: The editor's built-in default file icon (`this.icons.file_thumbnail`).
-   **Details**:
    -   **As a `string`**: The provided URL will be used as the thumbnail for all file items in the gallery.
    -   **As a `function`**: Receives each file item (`item`) as an argument and should return a thumbnail URL dynamically. This allows you to set different thumbnails for different files.
    -   If this option is not set, all items will use the editor's default file icon.

---

Of course. Here is the documentation for the `imageGallery` plugin options in both English and Korean.

---

### Image Gallery Plugin Options (`imageGallery`)

This plugin provides a gallery UI for users to browse and insert images.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	imageGallery: {
		url: '/my/image/gallery/url',
		headers: { Authorization: 'Bearer YOUR-TOKEN' }
	}
});
```

#### `data`

-   **Description**: An array of image data to display directly in the gallery without a server call. Cannot be used with the `url` option.
-   **Type**: `Array<Object>`
-   **Default**: `undefined`

#### `url`

-   **Description**: The server URL to fetch the list of image data for the gallery. The server response should be a JSON object with an array of image objects in the `result` property (e.g., `{ "result": [...] }`).
-   **Type**: `string`
-   **Default**: `undefined`

#### `headers`

-   **Description**: An object of HTTP headers to use when sending a request to the server with the `url` option.
-   **Type**: `Object<string, string>`
-   **Default**: `undefined`

### `defaultWidth`

-   **Description**: This is the default initial width when creating an image.
-   **Type**: `string`
-   **Default**: `auto`

### `defaultHeight`

-   **Description**: This is the default initial height when creating an image.
-   **Type**: `string`
-   **Default**: `auto`

---

Of course. Here is the documentation for the `videoGallery` plugin options in both English and Korean.

---

### **English Version**

### Video Gallery Plugin Options (`videoGallery`)

This plugin provides a gallery UI for users to browse and insert videos.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	videoGallery: {
		url: '/my/video/gallery/url',
		headers: { Authorization: 'Bearer YOUR-TOKEN' },
		thumbnail: (item) => item.custom_thumbnail_url // Example for a dynamic thumbnail
	}
});
```

#### `data`

-   **Description**: An array of video data to display directly in the gallery without a server call. Cannot be used with the `url` option.
-   **Type**: `Array<Object>`
-   **Default**: `undefined`

#### `url`

-   **Description**: The server URL to fetch the list of video data for the gallery. The server response should be a JSON object with an array of video objects in the `result` property (e.g., `{ "result": [...] }`).
-   **Type**: `string`
-   **Default**: `undefined`

#### `headers`

-   **Description**: An object of HTTP headers to use when sending a request to the server with the `url` option.
-   **Type**: `Object<string, string>`
-   **Default**: `undefined`

#### `thumbnail`

-   **Description**: Specifies the thumbnail image for videos in the gallery.
-   **Type**: `string | ((item: Object) => string)`
-   **Default**: The editor's built-in default video icon (`this.icons.video_thumbnail`).
-   **Details**:
    -   **As a `string`**: The provided URL will be used as the thumbnail for all video items in the gallery.
    -   **As a `function`**: Receives each video item (`item`) as an argument and should return a thumbnail URL dynamically. This allows you to set different thumbnails for different videos.
    -   If this option is not set, all items will use the editor's default video icon.

### `defaultWidth`

-   **Description**: This is the default initial width when creating an video.
-   **Type**: `string`
-   **Default**: `auto`

### `defaultHeight`

-   **Description**: This is the default initial height when creating an video.
-   **Type**: `string`
-   **Default**: `auto`

---
