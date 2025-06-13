### Mention Plugin (`mention`)

**Description:**
This plugin provides an auto-completing mention list, typically used for tagging users.\
When a user types a trigger character (like '@') followed by a search term, a list of matching items appears, fetched either from a local data array or a remote API.

**Example:**

```javascript
suneditor.create('editor', {
	// ...other options
	mention: {
		triggerText: '#',
		delayTime: 100,
		apiUrl: 'https://my-api.com/search?tag={searchTerm}',
		apiHeaders: { Accept: 'application/json' }
	}
});
```

### Options

#### `triggerText`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `'@'`
-   **Description:** The character that triggers the mention list.

#### `limitSize`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `5`
-   **Description:** The maximum number of items to display in the mention list.

#### `searchStartLength`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `0`
-   **Description:** The minimum number of characters to type after the trigger text to start searching.

#### `delayTime`

-   **Type:** `number`
-   **Required:** `false`
-   **Default:** `200`
-   **Description:** The delay in milliseconds after typing stops before the mention list is requested from the API.

#### `data`

-   **Type:** `Array<{key: string, name: string, url: string}>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** A local array of mentionable items. Use this for a static list instead of fetching from an API.

#### `apiUrl`

-   **Type:** `string`
-   **Required:** `false`
-   **Default:** `''`
-   **Description:** The URL of the API to fetch mention data. You can use the placeholder `{searchTerm}`, which will be replaced by the user's query. Example: `'/api/users?q={searchTerm}'`.

#### `apiHeaders`

-   **Type:** `Object<string, string>`
-   **Required:** `false`
-   **Default:** `undefined`
-   **Description:** Custom headers to send with the API request.

#### `useCachingData`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, caches the results from API calls to reduce server requests for the same search term.

#### `useCachingFieldData`

-   **Type:** `boolean`
-   **Required:** `false`
-   **Default:** `true`
-   **Description:** If `true`, caches the mention data within the field.

---
