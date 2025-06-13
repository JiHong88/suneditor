### Font Size Plugin (`fontSize`)

**Description:**
This plugin provides a tool to change the font size of the selected text.\
It supports various units (px, pt, em, text, etc.) and can be displayed as a dropdown list, a direct input field, or with increment/decrement buttons.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	fontSize: {
		sizeUnit: 'rem',
		showIncDecControls: true,
		disableInput: false,
		// Example of overriding the 'rem' unit's list
		unitMap: {
			rem: {
				list: [0.5, 0.8, 1, 1.2, 1.5, 2]
			}
		}
	}
});
```

### Options

#### `sizeUnit`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'px'`
-   **Description:** The primary unit for font size. Accepted values: `'px'`, `'pt'`, `'em'`, `'rem'`, `'vw'`, `'vh'`, `'%'`, `'text'`. If `'text'`, a descriptive list (e.g., Small, Large) is used instead of a numeric one.

#### `showDefaultSizeLabel`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, displays the default size for the current unit as the first item in the dropdown list.

#### `showIncDecControls`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `false`
-   **Description:** If `true`, displays '+' (increase) and '-' (decrease) buttons for adjusting the font size. This does not apply if `sizeUnit` is `'text'`.

#### `disableInput`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, the direct input field for font size is disabled, showing only a dropdown or label. Set to `false` to enable the input field.

#### `unitMap`

-   **Type:** `Object`
-   **Required:** `false`
-   **Default:** See 'Default Unit Map' below.
-   **Description:** An object to override or extend the default settings for each unit. You can change the `default` size, `inc` step, `min`/`max` values, and the dropdown `list` for any unit.

### Default Unit Map

The following object is used by default. You can override any part of it using the `unitMap` option.

```javascript
{
    text: {
        default: '13px',
        list: [
            { title: 'XX-Small', size: '8px' },
            { title: 'X-Small', size: '10px' },
            { title: 'Small', size: '13px' },
            { title: 'Medium', size: '16px' },
            { title: 'Large', size: '18px' },
            { title: 'X-Large', size: '24px' },
            { title: 'XX-Large', size: '32px' }
        ]
    },
    px: {
        default: 13, inc: 1, min: 8, max: 72,
        list: [8, 10, 13, 15, 18, 20, 22, 26, 28, 36, 48, 72]
    },
    pt: {
        default: 10, inc: 1, min: 6, max: 72,
        list: [6, 8, 10, 12, 14, 18, 22, 26, 32]
    },
    em: {
        default: 1, inc: 0.1, min: 0.5, max: 5,
        list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
    },
    rem: {
        default: 1, inc: 0.1, min: 0.5, max: 5,
        list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
    },
    vw: {
        inc: 0.1, min: 0.5, max: 10,
        list: [2, 3.5, 4, 4.5, 6, 8]
    },
    vh: {
        default: 1.5, inc: 0.1, min: 0.5, max: 10,
        list: [1, 1.5, 2, 2.5, 3, 3.5, 4]
    },
    '%': {
        default: 100, inc: 1, min: 50, max: 200,
        list: [50, 70, 90, 100, 120, 140, 160, 180, 200]
    }
}
```

---

### Page navigator Plugin (`pageNavigator`)

**Description:**

This plugin displays the current page number and total number of pages, and provides the ability to navigate between them.\
It is typically used in document-style editors.

### Options

This plugin has no configurable options.
