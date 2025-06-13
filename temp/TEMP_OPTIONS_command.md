### Blockquote Plugin Options (`blockquote`)

**Description:**

This plugin inserts selected lines as blockquotes.

### Options

This plugin has no options that can be set separately.

---

### Export to PDF Plugin (`exportPDF`)

**Description:**
This plugin adds a 'PDF' button to the toolbar, allowing users to export the editor's content as a PDF file. It works by sending the editor's HTML content to a specified server endpoint, which is then responsible for generating and returning the PDF.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	exportPDF: {
		apiUrl: 'https://your-server.com/api/convert-to-pdf',
		fileName: 'my-document'
	}
});
```

### Options

#### `apiUrl`

-   **Type:** `string`
-   **Required:** `true`
-   **Description:** The URL of your server endpoint that will receive the editor's content and convert it to a PDF. The plugin sends a POST request with a JSON body: `{ "html": "..." }`. Your server should process this HTML and return a PDF file as a blob.

#### `fileName`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'suneditor-pdf'`
-   **Description:** The name of the PDF file that will be downloaded by the user (without the `.pdf` extension).

---

### File Upload Plugin (`fileUpload`)

**Description:**
This plugin provides a UI for uploading local files directly to a server.\
When a file is selected, it is uploaded, and upon a successful response from the server, it is inserted into the editor content area as either a formatted 'box' or a simple 'link'.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	fileUpload: {
		uploadUrl: '/api/file/upload',
		uploadHeaders: { Authorization: 'Bearer TOKEN' },
		allowMultiple: true,
		acceptedFormats: 'image/jpeg, image/png, application/pdf',
		as: 'link'
	}
});
```

### Options

#### `uploadUrl`

-   **Type:** `string`
-   **Required:** `true`
-   **Description:** The server endpoint URL for file uploads. The server should handle the file upload and return a JSON object with a `result` array containing information about the uploaded file(s).

#### `uploadHeaders`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Description:** Custom headers to be sent with the file upload request, such as authorization tokens.

#### `uploadSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The total size limit in bytes for all files when `allowMultiple` is true. A value of `0` means no limit.

#### `uploadSingleSizeLimit`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The size limit in bytes for a single file. A value of `0` means no limit.

#### `allowMultiple`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If set to `true`, it allows users to select and upload multiple files at once.

#### `acceptedFormats`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'*'`
-   **Description:** A comma-separated string of accepted file formats (MIME types or extensions) that the user can upload. Example: `'image/jpeg, image/png, .pdf'`.

#### `as`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'box'`
-   **Description:** Determines how the uploaded file is inserted into the editor. It can be `'box'` (a formatted block with controls) or `'link'` (a simple hyperlink).

#### `controls`

-   **Type:** `Array<Array<string>>`
-   **Required:** `false`
-   **Default:** `[['custom-as', 'align', 'edit', 'custom-download', 'copy', 'remove']]`
-   **Description:** Customizes the floating toolbar that appears when a file "box" is selected. It is an array of arrays, where each inner array represents a group of buttons.
-   **Available Controls:**
    -   **Standard:** `align`, `edit`, `copy`, `remove`
    -   **Custom:**
        -   `custom-as`: A button to toggle the format between 'box' and 'link'.
        -   `custom-download`: A button to download the file.

---

네, 알겠습니다. 옵션이 없는 플러그인에 대한 문서를 요청하신 스타일에 맞춰 작성하겠습니다.

이러한 핵심 플러그인은 별도의 옵션 설정은 없지만, `buttonList`에 키를 추가하여 활성화하므로 이 부분을 예시에 포함하여 설명하는 것이 가장 명확합니다.

---

### Bulleted List Plugin (`list_bulleted`)

**Description:**
This plugin manages the creation and formatting of bulleted lists (`<ul>`).

### Options

This plugin has no configurable options.

---

### Numbered List Plugin (`list_numbered`)

**Description:**
This plugin manages the creation and formatting of numbered lists (`<ol>`).

### Options

This plugin has no configurable options.

---
