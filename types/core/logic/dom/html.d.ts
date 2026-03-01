import type {} from '../../../typedef';
export default HTML;
/**
 * @description All HTML related classes involved in the editing area
 */
declare class HTML {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Filters an HTML string based on allowed and disallowed tags, with optional custom validation.
	 * - Removes blacklisted tags and keeps only whitelisted tags.
	 * - Allows custom validation functions to replace, modify, or remove elements.
	 * @param {string} html - The HTML string to be filtered.
	 * @param {Object} params - Filtering parameters.
	 * @param {string} [params.tagWhitelist] - Allowed tags, specified as a string with tags separated by `'|'`. (e.g. `"div|p|span"`).
	 * @param {string} [params.tagBlacklist] - Disallowed tags, specified as a string with tags separated by `'|'`. (e.g. `"script|iframe"`).
	 * @param {(node: Node) => Node | string | null} [params.validate] - Function to validate and modify individual nodes.
	 *   - Return `null` to remove the node.
	 *   - Return a `Node` to replace the current node.
	 *   - Return a `string` to replace the node's `outerHTML`.
	 * @param {boolean} [params.validateAll] - Whether to apply validation to all nodes.
	 * @returns {string} - The filtered HTML string.
	 * @example
	 * // Remove script and iframe tags using blacklist
	 * const filtered = editor.html.filter('<div>Content<script>alert("xss")</script></div>', {
	 *   tagBlacklist: 'script|iframe'
	 * });
	 *
	 * // Keep only specific tags using whitelist
	 * const filtered = editor.html.filter('<div><span>Text</span><img src="x"></div>', {
	 *   tagWhitelist: 'div|span'
	 * });
	 *
	 * // Custom validation to modify nodes
	 * const filtered = editor.html.filter('<div class="test"><a href="#">Link</a></div>', {
	 *   validate: (node) => {
	 *     if (node.tagName === 'A') {
	 *       node.setAttribute('target', '_blank');
	 *       return node;
	 *     }
	 *   }
	 * });
	 */
	filter(
		html: string,
		{
			tagWhitelist,
			tagBlacklist,
			validate,
			validateAll,
		}: {
			tagWhitelist?: string;
			tagBlacklist?: string;
			validate?: (node: Node) => Node | string | null;
			validateAll?: boolean;
		},
	): string;
	/**
	 * @description Cleans and compresses HTML code to suit the editor format.
	 * @param {string} html HTML string to clean and compress
	 * @param {Object} [options] Cleaning options
	 * @param {boolean} [options.forceFormat=false] If `true`, wraps text nodes without a format node in the format tag.
	 * @param {?(string|RegExp)} [options.whitelist] Regular expression of allowed tags.
	 * Create RegExp object using `helper.converter.createElementWhitelist` method.
	 * @param {?(string|RegExp)} [options.blacklist] Regular expression of disallowed tags.
	 * Create RegExp object using `helper.converter.createElementBlacklist` method.
	 * @param {boolean} [options._freeCodeViewMode=false] If `true`, the free code view mode is enabled.
	 * @returns {string} Cleaned and compressed HTML string
	 * @example
	 * // Basic cleaning
	 * const cleaned = editor.html.clean('<div>  <p>Hello</p>  </div>');
	 *
	 * // Clean with format wrapping
	 * const cleaned = editor.html.clean('Plain text content', { forceFormat: true });
	 *
	 * // Clean with blacklist to remove specific tags
	 * const cleaned = editor.html.clean('<div><script>alert(1)</script>Content</div>', {
	 *   blacklist: 'script|style'
	 * });
	 */
	clean(
		html: string,
		{
			forceFormat,
			whitelist,
			blacklist,
			_freeCodeViewMode,
		}?: {
			forceFormat?: boolean;
			whitelist?: (string | RegExp) | null;
			blacklist?: (string | RegExp) | null;
			_freeCodeViewMode?: boolean;
		},
	): string;
	/**
	 * @description Inserts an (HTML element / HTML string / plain string) at the selection range.
	 * - If `frameOptions.get('charCounter_max')` is exceeded when `html` is added, `null` is returned without addition.
	 * @param {Node|string} html HTML Element or HTML string or plain string
	 * @param {Object} [options] Options
	 * @param {boolean} [options.selectInserted=false] If `true`, selects the range of the inserted node.
	 * @param {boolean} [options.skipCharCount=false] If `true`, inserts even if `frameOptions.get('charCounter_max')` is exceeded.
	 * @param {boolean} [options.skipCleaning=false] If `true`, inserts the HTML string without refining it with `html.clean`.
	 * @returns {HTMLElement|null} The inserted element or `null` if insertion failed
	 * @example
	 * // Insert HTML string at cursor
	 * editor.html.insert('<strong>Bold text</strong>');
	 *
	 * // Insert and select the inserted content
	 * editor.html.insert('<p>New paragraph</p>', { selectInserted: true });
	 *
	 * // Insert raw HTML without cleaning
	 * editor.html.insert('<div class="custom">Content</div>', { skipCleaning: true });
	 */
	insert(
		html: Node | string,
		{
			selectInserted,
			skipCharCount,
			skipCleaning,
		}?: {
			selectInserted?: boolean;
			skipCharCount?: boolean;
			skipCleaning?: boolean;
		},
	): HTMLElement | null;
	/**
	 * @description Delete selected node and insert argument value node and return.
	 * - If the `afterNode` exists, it is inserted after the `afterNode`
	 * - Inserting a text node merges with both text nodes on both sides and returns a new `{ container, startOffset, endOffset }`.
	 * @param {Node} oNode Node to be inserted
	 * @param {Object} [options] Options
	 * @param {Node} [options.afterNode=null] If the node exists, it is inserted after the node
	 * @param {boolean} [options.skipCharCount=null] If `true`, it will be inserted even if `frameOptions.get('charCounter_max')` is exceeded.
	 * @returns {Object|Node|null}
	 * @example
	 * // Insert node at current selection
	 * const strongNode = document.createElement('strong');
	 * strongNode.textContent = 'Bold';
	 * editor.html.insertNode(strongNode);
	 *
	 * // Insert node after a specific element
	 * const paragraph = editor.html.getNode();
	 * const newSpan = document.createElement('span');
	 * editor.html.insertNode(newSpan, { afterNode: paragraph });
	 *
	 * // Insert bypassing character count limit
	 * editor.html.insertNode(largeContentNode, { skipCharCount: true });
	 */
	insertNode(
		oNode: Node,
		{
			afterNode,
			skipCharCount,
		}?: {
			afterNode?: Node;
			skipCharCount?: boolean;
		},
	): any | Node | null;
	/**
	 * @description Delete the selected range.
	 * @returns {{container: Node, offset: number, commonCon?: ?Node, prevContainer?: ?Node}}
	 * - `container`: the last element after deletion
	 * - `offset`: offset
	 * - `commonCon`: `commonAncestorContainer`
	 * - `prevContainer`: `previousElementSibling` of the deleted area
	 */
	remove(): {
		container: Node;
		offset: number;
		commonCon?: Node | null;
		prevContainer?: Node | null;
	};
	/**
	 * @description Gets the current content
	 * @param {Object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent `div.sun-editor-editable` (`<div class="sun-editor-editable">{content}</div>`).
	 * Ignored for `targetOptions.get('iframe_fullPage')` is `true`.
	 * @param {boolean} [options.includeFullPage=false] Return only the content of the body without headers when the `iframe_fullPage` option is `true`
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 * @returns {string|Object<*, string>}
	 */
	get({ withFrame, includeFullPage, rootKey }?: { withFrame?: boolean; includeFullPage?: boolean; rootKey?: number | Array<number> }): string | any;
	/**
	 * @description Sets the HTML string to the editor content
	 * @param {string} html HTML string
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	set(
		html: string,
		{
			rootKey,
		}?: {
			rootKey?: number | Array<number>;
		},
	): void;
	/**
	 * @description Add content to the end of content.
	 * @param {string} html Content to Input
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	add(
		html: string,
		{
			rootKey,
		}?: {
			rootKey?: number | Array<number>;
		},
	): void;
	/**
	 * @description Gets the current content to JSON data
	 * @param {Object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent `div.sun-editor-editable` (`<div class="sun-editor-editable">{content}</div>`).
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 * @returns {Object<string, *>} JSON data
	 */
	getJson({ withFrame, rootKey }?: { withFrame?: boolean; rootKey?: number | Array<number> }): {
		[x: string]: any;
	};
	/**
	 * @description Sets the JSON data to the editor content
	 * @param {Object<string, *>} jsdonData HTML string
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	setJson(
		jsdonData: {
			[x: string]: any;
		},
		{
			rootKey,
		}?: {
			rootKey?: number | Array<number>;
		},
	): void;
	/**
	 * @description Call `clipboard.write` to copy the contents and display a success/failure toast message.
	 * @param {Node|Element|Text|string} content Content to be copied to the clipboard
	 * @returns {Promise<boolean>} Success or failure
	 */
	copy(content: Node | Element | Text | string): Promise<boolean>;
	/**
	 * @description Sets the content of the iframe's head tag and body tag when using the `iframe` or `iframe_fullPage` option.
	 * @param {{head: string, body: string}} ctx { head: HTML string, body: HTML string}
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	setFullPage(
		ctx: {
			head: string;
			body: string;
		},
		{
			rootKey,
		}?: {
			rootKey?: number | Array<number>;
		},
	): boolean;
	/**
	 * @description HTML code compression
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 */
	compress(html: string): string;
	/**
	 * @internal
	 * @description construct wysiwyg area element to html string
	 * @param {Node|string} html WYSIWYG element (this.#frameContext.get('wysiwyg')) or HTML string.
	 * @param {boolean} comp If `true`, does not line break and indentation of tags.
	 * @returns {string}
	 */
	_convertToCode(html: Node | string, comp: boolean): string;
	/**
	 * @internal
	 * @description Reset autoStyleify options.
	 * @param {Array.<string>} autoStyleify Styles applied automatically on text input.
	 * - ex `["bold", "underline", "italic", "strike"]`
	 */
	__resetAutoStyleify(autoStyleify: Array<string>): void;
	/**
	 * @internal
	 * @description Destroy the HTML instance and release memory
	 */
	_destroy(): void;
	#private;
}
