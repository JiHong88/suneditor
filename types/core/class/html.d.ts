import type {} from '../../typedef';
export default HTML;
export type HTMLThis = Omit<HTML & Partial<SunEditor.Injector>, 'html'>;
/**
 * @typedef {Omit<HTML & Partial<SunEditor.Injector>, 'html'>} HTMLThis
 */
/**
 * @constructor
 * @this {HTMLThis}
 * @description All HTML related classes involved in the editing area
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function HTML(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, editor: SunEditor.Core): void;
declare class HTML {
	/**
	 * @typedef {Omit<HTML & Partial<SunEditor.Injector>, 'html'>} HTMLThis
	 */
	/**
	 * @constructor
	 * @this {HTMLThis}
	 * @description All HTML related classes involved in the editing area
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor: SunEditor.Core);
	fontSizeUnitRegExp: RegExp;
	_isAllowedClassName: any;
	_allowHTMLComment: any;
	_disallowedStyleNodesRegExp: RegExp;
	_htmlCheckWhitelistRegExp: RegExp;
	_htmlCheckBlacklistRegExp: RegExp;
	_elementWhitelistRegExp: RegExp;
	_elementBlacklistRegExp: RegExp;
	/** @type {Object<string, RegExp>} */
	_attributeWhitelist: {
		[x: string]: RegExp;
	};
	/** @type {Object<string, RegExp>} */
	_attributeBlacklist: {
		[x: string]: RegExp;
	};
	_attributeWhitelistRegExp: RegExp;
	_attributeBlacklistRegExp: RegExp;
	_cleanStyleTagKeyRegExp: RegExp;
	_cleanStyleRegExpMap: Map<any, any>;
	_textStyleTags: any;
	/** @type {Object<string, *>} */
	_autoStyleify: {
		[x: string]: any;
	};
	__disallowedTagsRegExp: RegExp;
	__disallowedTagNameRegExp: RegExp;
	__allowedTagNameRegExp: RegExp;
	/**
	 * @this {HTMLThis}
	 * @description Filters an HTML string based on allowed and disallowed tags, with optional custom validation.
	 * - Removes blacklisted tags and keeps only whitelisted tags.
	 * - Allows custom validation functions to replace, modify, or remove elements.
	 * @param {string} html - The HTML string to be filtered.
	 * @param {Object} params - Filtering parameters.
	 * @param {string} [params.tagWhitelist] - Allowed tags, specified as a string with tags separated by '|'. (e.g. "div|p|span").
	 * @param {string} [params.tagBlacklist] - Disallowed tags, specified as a string with tags separated by '|'. (e.g. "script|iframe").
	 * @param {(node: Node) => Node | string | null} [params.validate] - Function to validate and modify individual nodes.
	 *   - Return `null` to remove the node.
	 *   - Return a `Node` to replace the current node.
	 *   - Return a `string` to replace the node's outerHTML.
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
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
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
	 * @this {HTMLThis}
	 * @description Cleans and compresses HTML code to suit the editor format.
	 * @param {string} html HTML string to clean and compress
	 * @param {Object} [options] Cleaning options
	 * @param {boolean} [options.forceFormat=false] If true, wraps text nodes without a format node in the format tag.
	 * @param {?(string|RegExp)} [options.whitelist] Regular expression of allowed tags.
	 * Create RegExp object using helper.converter.createElementWhitelist method.
	 * @param {?(string|RegExp)} [options.blacklist] Regular expression of disallowed tags.
	 * Create RegExp object using helper.converter.createElementBlacklist method.
	 * @param {boolean} [options._freeCodeViewMode=false] If true, the free code view mode is enabled.
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
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
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
	 * @this {HTMLThis}
	 * @description Inserts an (HTML element / HTML string / plain string) at the selection range.
	 * - If "frameOptions.get('charCounter_max')" is exceeded when "html" is added, null is returned without addition.
	 * @param {Node|string} html HTML Element or HTML string or plain string
	 * @param {Object} [options] Options
	 * @param {boolean} [options.selectInserted=false] If true, selects the range of the inserted node.
	 * @param {boolean} [options.skipCharCount=false] If true, inserts even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @param {boolean} [options.skipCleaning=false] If true, inserts the HTML string without refining it with html.clean.
	 * @returns {HTMLElement|null} The inserted element or null if insertion failed
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
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
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
	 * @this {HTMLThis}
	 * @description Delete selected node and insert argument value node and return.
	 * - If the "afterNode" exists, it is inserted after the "afterNode"
	 * - Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param {Node} oNode Node to be inserted
	 * @param {Object} [options] Options
	 * @param {Node} [options.afterNode=null] If the node exists, it is inserted after the node
	 * @param {boolean} [options.skipCharCount=null] If true, it will be inserted even if "frameOptions.get('charCounter_max')" is exceeded.
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
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
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
	 * @this {HTMLThis}
	 * @description Delete the selected range.
	 * @returns {{container: Node, offset: number, commonCon?: ?Node, prevContainer?: ?Node}}
	 * - container: "the last element after deletion"
	 * - offset: "offset"
	 * - commonCon: "commonAncestorContainer"
	 * - prevContainer: "previousElementSibling Of the deleted area"
	 */
	remove(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>): {
		container: Node;
		offset: number;
		commonCon?: Node | null;
		prevContainer?: Node | null;
	};
	/**
	 * @this {HTMLThis}
	 * @description Gets the current content
	 * @param {Object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * Ignored for targetOptions.get('iframe_fullPage') is true.
	 * @param {boolean} [options.includeFullPage=false] Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 * @returns {string|Object<*, string>}
	 */
	get(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
		{
			withFrame,
			includeFullPage,
			rootKey,
		}?: {
			withFrame?: boolean;
			includeFullPage?: boolean;
			rootKey?: number | Array<number>;
		},
	): string | any;
	/**
	 * @this {HTMLThis}
	 * @description Sets the HTML string to the editor content
	 * @param {string} html HTML string
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	set(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
		html: string,
		{
			rootKey,
		}?: {
			rootKey?: number | Array<number>;
		},
	): void;
	/**
	 * @this {HTMLThis}
	 * @description Add content to the end of content.
	 * @param {string} html Content to Input
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	add(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
		html: string,
		{
			rootKey,
		}?: {
			rootKey?: number | Array<number>;
		},
	): void;
	/**
	 * @this {HTMLThis}
	 * @description Gets the current content to JSON data
	 * @param {Object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 * @returns {Object<string, *>} JSON data
	 */
	getJson(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
		{
			withFrame,
			rootKey,
		}?: {
			withFrame?: boolean;
			rootKey?: number | Array<number>;
		},
	): {
		[x: string]: any;
	};
	/**
	 * @this {HTMLThis}
	 * @description Sets the JSON data to the editor content
	 * @param {Object<string, *>} jsdonData HTML string
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	setJson(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
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
	 * @this {HTMLThis}
	 * @description Call "clipboard.write" to copy the contents and display a success/failure toast message.
	 * @param {Node|Element|Text|string} content Content to be copied to the clipboard
	 * @returns {Promise<boolean>} Success or failure
	 */
	copy(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, content: Node | Element | Text | string): Promise<boolean>;
	/**
	 * @this {HTMLThis}
	 * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "iframe_fullPage" option.
	 * @param {{head: string, body: string}} ctx { head: HTML string, body: HTML string}
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	setFullPage(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
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
	 * @this {HTMLThis}
	 * @description HTML code compression
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 */
	compress(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, html: string): string;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description construct wysiwyg area element to html string
	 * @param {Node|string} html WYSIWYG element (this.frameContext.get('wysiwyg')) or HTML string.
	 * @param {boolean} comp If true, does not line break and indentation of tags.
	 * @returns {string}
	 */
	_convertToCode(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, html: Node | string, comp: boolean): string;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Checks whether the given list item node should be removed and handles necessary clean-up.
	 * @param {Node} item The list item node to be checked.
	 * @param {boolean} isSingleItem Single item
	 * @returns {{sc:Node, ec:Node}|null} An object containing the start and end containers if any transformations were made, otherwise null.
	 */
	_nodeRemoveListItem(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
		item: Node,
		isSingleItem: boolean,
	): {
		sc: Node;
		ec: Node;
	} | null;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Recursive function  when used to place a node in "BrLine" in "html.insertNode"
	 * @param {Node} oNode Node to be inserted
	 * @returns {Node} "oNode"
	 */
	_setIntoFreeFormat(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, oNode: Node): Node;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Returns HTML string according to tag type and configurati isExcludeFormat.
	 * @param {Node} node Node
	 * @param {boolean} forceFormat If true, text nodes that do not have a format node is wrapped with the format tag.
	 */
	_makeLine(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, node: Node, forceFormat: boolean): string;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Fix tags that do not fit the editor format.
	 * @param {DocumentFragment} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
	 * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist
	 * @param {RegExp} htmlCheckBlacklistRegExp Editor tags blacklist
	 * @param {boolean} tagFilter Tag filter option
	 * @param {boolean} formatFilter Format filter option
	 * @param {boolean} classFilter Class name filter option
	 * @param {boolean} _freeCodeViewMode Enforces strict HTML validation based on the editor`s policy
	 */
	_consistencyCheckOfHTML(
		this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>,
		documentFragment: DocumentFragment,
		htmlCheckWhitelistRegExp: RegExp,
		htmlCheckBlacklistRegExp: RegExp,
		tagFilter: boolean,
		formatFilter: boolean,
		classFilter: boolean,
		_freeCodeViewMode: boolean,
	): void;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Removes attribute values such as style and converts tags that do not conform to the "html5" standard.
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 */
	_styleNodeConvertor(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, html: string): string;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Determines if formatting is required and returns a domTree
	 * @param {DocumentFragment} domFrag documentFragment
	 * @returns {DocumentFragment}
	 */
	_editFormat(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, domFrag: DocumentFragment): DocumentFragment;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Converts a list of DOM nodes into an HTML list structure.
	 * - If the node is already a list, its innerHTML is used. If it is a block element,
	 * - the function is called recursively.
	 * @param {SunEditor.NodeCollection} domTree List of DOM nodes to be converted.
	 * @returns {string} The generated HTML list.
	 */
	_convertListCell(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, domTree: SunEditor.NodeCollection): string;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Checks whether the provided DOM nodes require formatting.
	 * @param {NodeList} domTree List of DOM nodes to check.
	 * @returns {boolean} True if formatting is required, otherwise false.
	 */
	_isFormatData(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, domTree: NodeList): boolean;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Cleans the inline style attributes of an HTML element.
	 * - Extracts allowed styles and removes disallowed ones based on editor settings.
	 * @param {string} m The full matched string from a regular expression.
	 * @param {?Array} v The list of allowed attributes.
	 * @param {string} name The tag name of the element being cleaned.
	 * @returns {Array} The updated list of allowed attributes including cleaned styles.
	 */
	_cleanStyle(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, m: string, v: any[] | null, name: string): any[];
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Delete disallowed tags
	 * @param {string} html HTML string
	 * @returns {string}
	 */
	_deleteDisallowedTags(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, html: string, whitelistRegExp: any, blacklistRegExp: any): string;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Recursively checks for duplicate text style nodes within a given parent node.
	 * @param {Node} oNode The node to check for duplicate styles.
	 * @param {Node} parentNode The parent node where the duplicate check occurs.
	 */
	_checkDuplicateNode(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, oNode: Node, parentNode: Node): void;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Recursively checks for duplicate text style nodes within a given parent node.
	 * - If duplicate styles are found, redundant attributes are removed.
	 * @param {Node} oNode The node to check for duplicate styles.
	 * @param {Node} parentNode The parent node where the duplicate check occurs.
	 * @returns {Node} The cleaned node with redundant styles removed.
	 */
	_dupleCheck(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, oNode: Node, parentNode: Node): Node;
	/**
	 * @private
	 * @this {HTMLThis}
	 * @description Reset autoStyleify options.
	 * @param {Array.<string>} autoStyleify Styles applied automatically on text input.
	 * - ex ["bold", "underline", "italic", "strike"]
	 */
	__resetAutoStyleify(this: Omit<HTML & Partial<import('../../editorInjector').default>, 'html'>, autoStyleify: Array<string>): void;
}
