### Align Plugin (`align`)

**Description:**
This plugin provides toolbar buttons for aligning text and other elements within the editor.\
It allows setting the alignment to left, center, right, or justify.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	align: {
		items: ['left', 'center', 'right']
	}
});
```

### Options

#### `items`

-   **Type:** `Array<"left" | "center" | "right" | "justify">`
-   **Required:** `false`
-   **Default:** `['left', 'center', 'right', 'justify']`
-   **Description:** An array that specifies which alignment buttons to include in the dropdown menu. The order of items in the array determines their order in the menu.

---

### Background Color Plugin (`backgroundColor`)

**Description:**
This plugin provides a color picker to change the background color of the text.\
The color palette and other features of the picker can be customized.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	backgroundColor: {
		items: [['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff'], { value: '#f1f1f1', name: 'Light Grey' }],
		splitNum: 5,
		disableHEXInput: true
	}
});
```

### Options

#### `items`

-   **Type:** `Array<string | {value: string, name: string}>`
-   **Required:** `false`
-   **Default:** A default array of 64 standard web colors.
-   **Description:** An array of colors to display in the palette. Items can be simple hex color strings (e.g., `'#FFFFFF'`) or objects with a `value` (the color) and a `name` (the tooltip text).

#### `splitNum`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `8`
-   **Description:** The number of color swatches to display per line in the palette.

#### `disableHEXInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If set to `true`, the HEX color input field and the hue slider in the color picker will be disabled.

---

### Font Family Plugin (`font`)

**Description:**
This plugin provides a dropdown menu in the toolbar to change the font family of the selected text.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	font: {
		items: ['Times New Roman', 'Helvetica', 'Consolas', 'sans-serif']
	}
});
```

### Options

#### `items`

-   **Type:** `Array<string>`
-   **Required:** `false`
-   **Default:** `['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana']`
-   **Description:** An array of font family names to display in the dropdown list. The values should be valid CSS `font-family` strings.

---

### Font Color Plugin (`fontColor`)

**Description:**
This plugin provides a color picker to change the color of the text.\
The color palette and other features of the picker can be customized.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	fontColor: {
		items: [['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff'], { value: '#f1f1f1', name: 'Light Grey' }],
		splitNum: 5,
		disableHEXInput: true
	}
});
```

### Options

#### `items`

-   **Type:** `Array<string | {value: string, name: string}>`
-   **Required:** `false`
-   **Default:** A default array of 64 standard web colors.
-   **Description:** An array of colors to display in the palette. Items can be simple hex color strings (e.g., `'#FFFFFF'`) or objects with a `value` (the color) and a `name` (the tooltip text).

#### `splitNum`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `8`
-   **Description:** The number of color swatches to display per line in the palette.

#### `disableHEXInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If set to `true`, the HEX color input field and the hue slider in the color picker will be disabled.

---

### Format Block Plugin (`formatBlock`)

**Description:**
This plugin provides a dropdown menu in the toolbar to change the block-level format of the current line, such as changing a paragraph to a heading.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	formatBlock: {
		items: [
			'p', // Paragraph
			'h1', // Heading 1
			'h2', // Heading 2
			'blockquote' // Blockquote
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<string>`
-   **Required:** `false`
-   **Default:** `['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote']`
-   **Description:** An array of block-level HTML tag names to display in the dropdown list. Valid values are typically 'p', 'h1'-'h6', 'pre', and 'blockquote'.

---

### Horizontal Line Plugin (`hr`)

**Description:**
This plugin adds a button to insert a horizontal line (`<hr>`).\
It can also be configured with a dropdown menu to insert horizontal lines with different styles.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	hr: {
		items: [
			{ name: 'Solid', class: 'hr_solid' },
			{ name: 'Dotted', class: 'hr_dotted' },
			{ name: 'Dashed', class: 'hr_dashed' }
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<{name: string, class: string}>`
-   **Required:** `false`
-   **Default:** `[{ name: 'Solid', class: '' }, { name: 'Dotted', class: 'se-hr-dotted' }, { name: 'Dashed', class: 'se-hr-dashed' }]`
-   **Description:** An array of objects to create a dropdown menu of styled horizontal lines. Each object must have a `name` for the display text in the menu and a `class` which will be applied to the inserted `<hr>` element.

---

### Layout Plugin (`layout`)

**Description:**
This plugin provides a dropdown menu to insert pre-defined HTML structures or layouts into the editor, such as multi-column templates.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	layout: {
		items: [
			{
				name: 'Two Columns',
				html: '<div style="display: flex;"><div style="flex: 1; padding: 0 5px;"><p>Column 1</p></div><div style="flex: 1; padding: 0 5px;"><p>Column 2</p></div></div>'
			},
			{
				name: 'Three Columns',
				html: '<div style="display: flex;"><div style="flex: 1; padding: 0 5px;">Col 1</div><div style="flex: 1; padding: 0 5px;">Col 2</div><div style="flex: 1; padding: 0 5px;">Col 3</div></div>'
			}
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<{name: string, html: string}>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array of layout objects to create a dropdown menu. Each object must have a `name` for the display text and an `html` property containing the HTML string to be inserted. The plugin is not functional unless this option is configured.

---

### Line Height Plugin (`lineHeight`)

**Description:**
This plugin provides a dropdown menu in the toolbar to change the line height of the current block or selected lines.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	lineHeight: {
		items: [
			{ text: 'Single', value: 1 },
			{ text: '1.15', value: 1.15 },
			{ text: 'Double', value: 2 }
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<{text: string, value: number}>`
-   **Required:** `false`
-   **Default:** `[{ text: '1', value: 1 }, { text: '1.15', value: 1.15 }, { text: '1.5', value: 1.5 }, { text: '2', value: 2 }]`
-   **Description:** An array of line height objects to create a dropdown menu. Each object must have a `text` property for the display name in the menu and a `value` property, which is a unitless number that will be applied to the `line-height` CSS style.

---

### List Plugin (`list`)

**Description:**
This plugin provides a bulleted list (`<ul>` | `<ol>`) dropdown menu in your toolbar.

### Options

This plugin has no configurable options.

---

### Paragraph Style Plugin (`paragraphStyle`)

**Description:**
This plugin provides a dropdown menu to apply custom CSS classes to paragraph blocks, allowing for different paragraph styles.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	paragraphStyle: {
		// Using custom styles
		items: [
			{
				name: 'My Custom Style',
				class: '__se__p-custom-style'
			},
			{
				name: 'Highlighted',
				class: 'highlight-p'
			}
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<string | {name: string, class: string}>`
-   **Required:** `false`
-   **Default:** `['spaced', 'bordered', 'neon']`
-   **Description:** An array that defines the styles in the dropdown. Items can be:
    -   A `string`: The name of a default style provided by the editor ('spaced', 'bordered', 'neon').
    -   An `object`: A custom style with a `name` for the display text and a `class` which is the CSS class to be applied to the paragraph (`<p>`) tag.

---

### Table Plugin (`table`)

**Description:**
This plugin provides a comprehensive tool for creating and editing tables.\
It includes functions for inserting tables, editing rows and columns, merging cells, and customizing table and cell properties.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	table: {
		scrollType: 'xy',
		captionPosition: 'top',
		cellControllerPosition: 'table'
	}
});
```

### Options

#### `scrollType`

-   **Type:** `"x" | "y" | "xy"`
-   **Required:** `false`
-   **Default:** `'x'`
-   **Description:** Defines the scroll behavior when the table's width or height exceeds the editor's content area. `'x'` for horizontal scroll, `'y'` for vertical scroll, `'xy'` for both.

#### `captionPosition`

-   **Type:** `"top" | "bottom"`
-   **Required:** `false`
-   **Default:** `'bottom'`
-   **Description:** Sets the default position for a new table's caption, either `'top'` or `'bottom'` of the table.

#### `cellControllerPosition`

-   **Type:** `"cell" | "table"`
-   **Required:** `false`
-   **Default:** `'cell'`
-   **Description:** Determines the position of the cell-editing controller. `'cell'` places it near the selected cell(s). `'table'` places it at the top of the entire table.

#### `colorList`

-   **Type:** `Array<string | {value: string, name:string}>`
-   **Required:** `false`
-   **Default:** A default array of 64 standard web colors.
-   **Description:** An array of colors used for the background color picker in the table properties controller.

---

### Template Plugin (`template`)

**Description:**
This plugin provides a dropdown menu to insert pre-defined HTML snippets or templates into the editor.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	template: {
		items: [
			{
				name: 'Template 1',
				html: '<h3>Title</h3><p>Content</p>'
			},
			{
				name: 'Template 2',
				html: '<p>Some pre-filled text...</p>'
			}
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<{name: string, html: string}>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array of template objects to create a dropdown menu. Each object must have a `name` for the display text and an `html` property containing the HTML string to be inserted. The plugin is not functional unless this option is configured.

---

### Text Style Plugin (`textStyle`)

**Description:**
This plugin provides a dropdown menu to apply various inline text styles to the selected text by wrapping it with specific HTML tags.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	textStyle: {
		items: [
			{
				name: 'Code',
				html: 'code' // The tag to wrap the selection
			},
			{
				name: 'Keyboard Input',
				html: 'kbd'
			},
			{
				name: 'Highlight',
				html: 'mark'
			}
		]
	}
});
```

### Options

#### `items`

-   **Type:** `Array<{name: string, html: string}>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** An array of text style objects to create a dropdown menu. Each object must have a `name` for the display text and an `html` property containing the tag name (e.g., 'code', 'mark', 'kbd') to wrap the selected text with. The plugin is not functional unless this option is configured.

---
