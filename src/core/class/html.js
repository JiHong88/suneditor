/**
 * @fileoverview Char class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, converter, numbers, unicode, clipboard } from '../../helper';

const REQUIRED_DATA_ATTRS = 'data-se-[^\\s]+';
const V2_MIG_DATA_ATTRS = '|data-index|data-file-size|data-file-name|data-exp|data-font-size';

/**
 * @description All HTML related classes involved in the editing area
 */
class HTML extends CoreInjector {
	#fontSizeUnitRegExp;
	#isAllowedClassName;
	#allowHTMLComment;
	#disallowedStyleNodesRegExp;
	#htmlCheckWhitelistRegExp;
	#htmlCheckBlacklistRegExp;
	#elementWhitelistRegExp;
	#elementBlacklistRegExp;
	#attributeWhitelist;
	#attributeBlacklist;
	#attributeWhitelistRegExp;
	#attributeBlacklistRegExp;
	#cleanStyleTagKeyRegExp;
	#cleanStyleRegExpMap;
	#textStyleTags;
	#autoStyleify;
	#disallowedTagsRegExp;
	#disallowedTagNameRegExp;
	#allowedTagNameRegExp;

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor) {
		super(editor);
		const options = this.options;

		// members
		this.#fontSizeUnitRegExp = null;
		this.#isAllowedClassName = function (v) {
			return this.test(v) ? v : '';
		}.bind(options.get('allowedClassName'));
		this.#allowHTMLComment = null;
		this.#disallowedStyleNodesRegExp = null;
		this.#htmlCheckWhitelistRegExp = null;
		this.#htmlCheckBlacklistRegExp = null;
		this.#elementWhitelistRegExp = null;
		this.#elementBlacklistRegExp = null;
		/** @type {Object<string, RegExp>} */
		this.#attributeWhitelist = null;
		/** @type {Object<string, RegExp>} */
		this.#attributeBlacklist = null;
		this.#attributeWhitelistRegExp = null;
		this.#attributeBlacklistRegExp = null;
		this.#cleanStyleTagKeyRegExp = null;
		this.#cleanStyleRegExpMap = null;
		this.#textStyleTags = options.get('_textStyleTags');
		/** @type {Object<string, *>} */
		this.#autoStyleify = null;
		this.#disallowedTagsRegExp = null;
		this.#disallowedTagNameRegExp = null;
		this.#allowedTagNameRegExp = null;

		// clean styles
		const tagStyles = options.get('tagStyles');
		const splitTagStyles = {};
		for (const k in tagStyles) {
			const s = k.split('|');
			for (let i = 0, len = s.length, n; i < len; i++) {
				n = s[i];
				if (!splitTagStyles[n]) splitTagStyles[n] = '';
				else splitTagStyles[n] += '|';
				splitTagStyles[n] += tagStyles[k];
			}
		}
		for (const k in splitTagStyles) {
			splitTagStyles[k] = new RegExp(`\\s*[^-a-zA-Z](${splitTagStyles[k]})\\s*:[^;]+(?!;)*`, 'gi');
		}

		const stylesMap = new Map();
		const stylesObj = {
			...splitTagStyles,
			line: options.get('_lineStylesRegExp'),
		};
		this.#textStyleTags.forEach((v) => {
			stylesObj[v] = options.get('_textStylesRegExp');
		});

		for (const key in stylesObj) {
			stylesMap.set(new RegExp(`^(${key})$`), stylesObj[key]);
		}
		this.#cleanStyleTagKeyRegExp = new RegExp(`^(${Object.keys(stylesObj).join('|')})$`, 'i');
		this.#cleanStyleRegExpMap = stylesMap;

		// font size unit
		this.#fontSizeUnitRegExp = new RegExp('\\d+(' + options.get('fontSizeUnits').join('|') + ')$', 'i');

		// extra tags
		const allowedExtraTags = options.get('_allowedExtraTag');
		const disallowedExtraTags = options.get('_disallowedExtraTag');
		this.#disallowedTagsRegExp = new RegExp(`<(${disallowedExtraTags})[^>]*>([\\s\\S]*?)<\\/\\1>|<(${disallowedExtraTags})[^>]*\\/?>`, 'gi');
		this.#disallowedTagNameRegExp = new RegExp(`^(${disallowedExtraTags})$`, 'i');
		this.#allowedTagNameRegExp = new RegExp(`^(${allowedExtraTags})$`, 'i');

		// set disallow text nodes
		const disallowStyleNodes = Object.keys(options.get('_defaultStyleTagMap'));
		const allowStyleNodes = !options.get('elementWhitelist')
			? []
			: options
					.get('elementWhitelist')
					.split('|')
					.filter((v) => /b|i|ins|s|strike/i.test(v));
		for (let i = 0; i < allowStyleNodes.length; i++) {
			disallowStyleNodes.splice(disallowStyleNodes.indexOf(allowStyleNodes[i].toLowerCase()), 1);
		}
		this.#disallowedStyleNodesRegExp = disallowStyleNodes.length === 0 ? null : new RegExp('(<\\/?)(' + disallowStyleNodes.join('|') + ')\\b\\s*([^>^<]+)?\\s*(?=>)', 'gi');

		// whitelist
		// tags
		const defaultAttr = options.get('__defaultAttributeWhitelist');
		this.#allowHTMLComment = options.get('_editorElementWhitelist').includes('//') || options.get('_editorElementWhitelist') === '*';
		// html check
		this.#htmlCheckWhitelistRegExp = new RegExp('^(' + GetRegList(options.get('_editorElementWhitelist').replace('|//', ''), '') + ')$', 'i');
		this.#htmlCheckBlacklistRegExp = new RegExp('^(' + (options.get('elementBlacklist') || '^') + ')$', 'i');
		// elements
		this.#elementWhitelistRegExp = converter.createElementWhitelist(GetRegList(options.get('_editorElementWhitelist').replace('|//', '|<!--|-->'), ''));
		this.#elementBlacklistRegExp = converter.createElementBlacklist(options.get('elementBlacklist').replace('|//', '|<!--|-->'));
		// attributes
		const regEndStr = '\\s*=\\s*(")[^"]*\\1';
		const _wAttr = options.get('attributeWhitelist');

		/** @type {Object<string, RegExp>} */
		let tagsAttr = {};
		let allAttr = '';
		if (_wAttr) {
			for (const k in _wAttr) {
				if (/^on[a-z]+$/i.test(_wAttr[k])) continue;
				if (k === '*') {
					allAttr = GetRegList(_wAttr[k], defaultAttr);
				} else {
					tagsAttr[k] = new RegExp('\\s(?:' + GetRegList(_wAttr[k], defaultAttr) + ')' + regEndStr, 'ig');
				}
			}
		}

		this.#attributeWhitelistRegExp = new RegExp('\\s(?:' + (allAttr || defaultAttr) + '|' + REQUIRED_DATA_ATTRS + (options.get('v2Migration') ? V2_MIG_DATA_ATTRS : '') + ')' + regEndStr, 'ig');
		this.#attributeWhitelist = tagsAttr;

		// blacklist
		const _bAttr = options.get('attributeBlacklist');
		tagsAttr = {};
		allAttr = '';
		if (_bAttr) {
			for (const k in _bAttr) {
				if (k === '*') {
					allAttr = GetRegList(_bAttr[k], '');
				} else {
					tagsAttr[k] = new RegExp('\\s(?:' + GetRegList(_bAttr[k], '') + ')' + regEndStr, 'ig');
				}
			}
		}

		this.#attributeBlacklistRegExp = new RegExp('\\s(?:' + (allAttr || '^') + ')' + regEndStr, 'ig');
		this.#attributeBlacklist = tagsAttr;

		// autoStyleify
		this.__resetAutoStyleify(options.get('autoStyleify'));
	}

	/** @type {SunEditor.Core['selection']} */
	get #selection() {
		return this.editor.selection;
	}
	/** @type {SunEditor.Core['format']} */
	get #format() {
		return this.editor.format;
	}
	/** @type {SunEditor.Core['component']} */
	get #component() {
		return this.editor.component;
	}
	/** @type {SunEditor.Core['char']} */
	get #char() {
		return this.editor.char;
	}
	/** @type {SunEditor.Core['ui']} */
	get #ui() {
		return this.editor.ui;
	}
	/** @type {SunEditor.Core['viewer']} */
	get #viewer() {
		return this.editor.viewer;
	}
	/** @type {SunEditor.Core['nodeTransform']} */
	get #nodeTransform() {
		return this.editor.nodeTransform;
	}
	/** @type {SunEditor.Core['inline']} */
	get #inline() {
		return this.editor.inline;
	}

	/**
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
	filter(html, { tagWhitelist, tagBlacklist, validate, validateAll }) {
		if (tagWhitelist) {
			html = html.replace(converter.createElementWhitelist(tagWhitelist), '');
		}
		if (tagBlacklist) {
			html = html.replace(converter.createElementBlacklist(tagBlacklist), '');
		}
		if (validate) {
			const parseDocument = new DOMParser().parseFromString(html, 'text/html');
			parseDocument.body.querySelectorAll('*').forEach((node) => {
				if (!node.closest('.se-component') && !node.closest('.se-flex-component')) {
					const result = validate(node);
					if (result === null) {
						node.remove();
					} else if (this.instanceCheck.isNode(result)) {
						node.replaceWith(result);
					} else if (typeof result === 'string') {
						node.outerHTML = result;
					}
				}
			});
			html = parseDocument.body.innerHTML;
		} else if (validateAll) {
			const parseDocument = new DOMParser().parseFromString(html, 'text/html');
			const compClass = ['.se-component', '.se-flex-component'];
			const closestAny = (element) => compClass.some((selector) => element.closest(selector));
			parseDocument.body.querySelectorAll('*').forEach((node) => {
				if (!closestAny(node)) {
					const result = validate(node);
					if (result === null) {
						node.remove();
					} else if (this.instanceCheck.isNode(result)) {
						node.replaceWith(result);
					} else if (typeof result === 'string') {
						node.outerHTML = result;
					}
				}
			});
			html = parseDocument.body.innerHTML;
		}

		return html;
	}

	/**
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
	clean(html, { forceFormat, whitelist, blacklist, _freeCodeViewMode } = {}) {
		const { tagFilter, formatFilter, classFilter, textStyleTagFilter, attrFilter, styleFilter } = this.options.get('strictMode');
		let cleanData = '';

		html = this.compress(html);

		if (tagFilter) {
			html = html.replace(this.#disallowedTagsRegExp, '');
			html = this.#deleteDisallowedTags(html, this.#elementWhitelistRegExp, this.#elementBlacklistRegExp).replace(/<br\/?>$/i, '');
		}

		if (this.#autoStyleify) {
			const domParser = new DOMParser().parseFromString(html, 'text/html');
			dom.query.getListChildNodes(domParser.body, converter.spanToStyleNode.bind(null, this.#autoStyleify), null);
			html = domParser.body.innerHTML;
		}

		if (attrFilter || styleFilter) {
			html = html.replace(/(<[a-zA-Z0-9-]+)[^>]*(?=>)/g, this.#CleanElements.bind(this, attrFilter, styleFilter));
		}

		// get dom tree
		const domParser = this._d.createRange().createContextualFragment(html);

		if (tagFilter) {
			try {
				this.#consistencyCheckOfHTML(domParser, this.#htmlCheckWhitelistRegExp, this.#htmlCheckBlacklistRegExp, tagFilter, formatFilter, classFilter, _freeCodeViewMode);
			} catch (error) {
				console.warn('[SUNEDITOR.html.clean.fail]', error.message);
			}
		}

		// iframe placeholder parsing
		const iframePlaceholders = domParser.querySelectorAll('[data-se-iframe-holder]');
		for (let i = 0, len = iframePlaceholders.length; i < len; i++) {
			/** @type {HTMLIFrameElement} */
			const iframe = dom.utils.createElement('iframe');

			const attrs = JSON.parse(iframePlaceholders[i].getAttribute('data-se-iframe-holder-attrs'));
			for (const [key, value] of Object.entries(attrs)) {
				iframe.setAttribute(key, value);
			}

			iframePlaceholders[i].replaceWith(iframe);
		}

		let retainFilter;
		if ((retainFilter = this.options.get('__pluginRetainFilter'))) {
			this.editor._MELInfo.forEach((plugin, query) => {
				const infoLst = domParser.querySelectorAll(query);
				for (let i = 0, len = infoLst.length; i < len; i++) {
					if (retainFilter === true || retainFilter[plugin.key] !== false) plugin.method(infoLst[i]);
				}
			});
		}

		if (formatFilter) {
			let domTree = domParser.childNodes;
			forceFormat ||= this.#isFormatData(domTree);
			if (forceFormat) domTree = this.#editFormat(domParser).childNodes;

			for (let i = 0, len = domTree.length, t; i < len; i++) {
				t = domTree[i];
				if (this.#allowedTagNameRegExp.test(t.nodeName)) {
					cleanData += /** @type {HTMLElement} */ (t).outerHTML;
					continue;
				}
				cleanData += this.#makeLine(t, forceFormat);
			}
		}

		// set clean data
		cleanData ||= html;

		// whitelist, blacklist
		if (tagFilter) {
			if (whitelist) cleanData = cleanData.replace(typeof whitelist === 'string' ? converter.createElementWhitelist(whitelist) : whitelist, '');
			if (blacklist) cleanData = cleanData.replace(typeof blacklist === 'string' ? converter.createElementBlacklist(blacklist) : blacklist, '');
		}

		if (textStyleTagFilter) {
			cleanData = this.#styleNodeConvertor(cleanData);
		}

		return cleanData;
	}

	/**
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
	insert(html, { selectInserted, skipCharCount, skipCleaning } = {}) {
		if (!this.frameContext.get('wysiwyg').contains(this.#selection.get().focusNode)) this.editor.focus();

		this.remove();
		this.editor.focus();

		let focusNode = null;
		if (typeof html === 'string') {
			if (!skipCleaning) html = this.clean(html, { forceFormat: false, whitelist: null, blacklist: null });
			try {
				if (dom.check.isListCell(this.#format.getLine(this.#selection.getNode(), null))) {
					const domParser = this._d.createRange().createContextualFragment(html);
					const domTree = domParser.childNodes;
					if (this.#isFormatData(domTree)) html = this.#convertListCell(domTree);
				}

				const domParser = this._d.createRange().createContextualFragment(html);
				const domTree = domParser.childNodes;

				if (!skipCharCount) {
					const type = this.frameOptions.get('charCounter_type') === 'byte-html' ? 'outerHTML' : 'textContent';
					let checkHTML = '';
					for (let i = 0, len = domTree.length; i < len; i++) {
						checkHTML += domTree[i][type];
					}
					if (!this.#char.check(checkHTML)) return;
				}

				let c, a, t, prev, firstCon;
				while ((c = domTree[0])) {
					if (prev?.nodeType === 3 && a?.nodeType === 1 && dom.check.isBreak(c)) {
						prev = c;
						dom.utils.removeItem(c);
						continue;
					}
					t = this.insertNode(c, { afterNode: a, skipCharCount: true });
					a = t.container || t;
					firstCon ||= t;
					prev = c;
				}

				if (prev?.nodeType === 3 && a?.nodeType === 1) a = prev;
				const offset = a.nodeType === 3 ? t.endOffset || a.textContent.length : a.childNodes.length;
				focusNode = a;

				if (selectInserted) {
					this.#selection.setRange(firstCon.container || firstCon, firstCon.startOffset || 0, a, offset);
				} else if (!this.#component.is(a)) {
					this.#selection.setRange(a, offset, a, offset);
				}
			} catch (error) {
				if (this.frameContext.get('isReadOnly') || this.frameContext.get('isDisabled')) return;
				throw Error(`[SUNEDITOR.html.insert.error] ${error.message}`);
			}
		} else {
			if (this.#component.is(html)) {
				this.#component.insert(html, { skipCharCount, insertBehavior: 'none' });
			} else {
				let afterNode = null;
				if (this.#format.isLine(html) || dom.check.isMedia(html)) {
					afterNode = this.#format.getLine(this.#selection.getNode(), null);
				}
				this.insertNode(html, { afterNode, skipCharCount });
			}
		}

		// focus
		this.editor.effectNode = null;

		if (focusNode) {
			const children = dom.query.getListChildNodes(focusNode, null, null);
			if (children.length > 0) {
				focusNode = children.at(-1);
				const offset = focusNode?.nodeType === 3 ? focusNode.textContent.length : 1;
				this.#selection.setRange(focusNode, offset, focusNode, offset);
			} else {
				this.editor.focus();
			}
		} else {
			this.editor.focus();
		}

		this.history.push(false);
	}

	/**
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
	insertNode(oNode, { afterNode, skipCharCount } = {}) {
		let result = null;
		if (this.frameContext.get('isReadOnly') || (!skipCharCount && !this.#char.check(oNode))) {
			return result;
		}

		let fNode = null;
		let range = null;

		if (afterNode) {
			const afterNewLine = this.#format.isLine(afterNode) || this.#format.isBlock(afterNode) || this.#component.is(afterNode) ? this.#format.addLine(afterNode, null) : afterNode;
			range = this.#selection.setRange(afterNewLine, 1, afterNewLine, 1);
		} else {
			range = this.#selection.getRange();
		}

		let line = dom.check.isListCell(range.commonAncestorContainer) ? range.commonAncestorContainer : this.#format.getLine(this.#selection.getNode(), null);
		let insertListCell = dom.check.isListCell(line) && (dom.check.isListCell(oNode) || dom.check.isList(oNode));

		let parentNode,
			originAfter,
			tempAfterNode,
			tempParentNode = null;
		const freeFormat = this.#format.isBrLine(line);
		const isFormats = this.#format.isLine(oNode) || this.#format.isBlock(oNode) || this.#component.isBasic(oNode);

		if (insertListCell) {
			tempAfterNode = afterNode || dom.check.isList(oNode) ? line.lastChild : line.nextElementSibling;
			tempParentNode = dom.check.isList(oNode) ? line : (tempAfterNode || line).parentNode;
		}

		if (!afterNode && (isFormats || this.#component.isBasic(oNode) || dom.check.isMedia(oNode))) {
			const isEdge = dom.check.isEdgePoint(range.endContainer, range.endOffset, 'end');
			const r = this.remove();
			const container = r.container;
			const prevContainer = container === r.prevContainer && range.collapsed ? null : r.prevContainer;

			if (insertListCell && prevContainer) {
				tempParentNode = prevContainer.nodeType === 3 ? prevContainer.parentNode : prevContainer;
				if (tempParentNode.contains(container)) {
					let sameParent = true;
					tempAfterNode = container;
					while (tempAfterNode.parentNode && tempAfterNode.parentNode !== tempParentNode) {
						tempAfterNode = tempAfterNode.parentNode;
						sameParent = false;
					}
					if (sameParent && container === prevContainer) tempAfterNode = tempAfterNode.nextSibling;
				} else {
					tempAfterNode = null;
				}
			} else if (insertListCell && dom.check.isListCell(container) && !line.parentElement) {
				line = dom.utils.createElement('LI');
				tempParentNode.appendChild(line);
				container.appendChild(tempParentNode);
				tempAfterNode = null;
			} else if (container.nodeType === 3 || dom.check.isBreak(container) || insertListCell) {
				const depthFormat = dom.query.getParentElement(container, (current) => {
					return this.#format.isBlock(current) || dom.check.isListCell(current);
				});
				afterNode = this.#nodeTransform.split(container, r.offset, !depthFormat ? 0 : dom.query.getNodeDepth(depthFormat) + 1);
				if (!afterNode) {
					if (!dom.check.isListCell(line)) {
						tempAfterNode = afterNode = line;
					}
				} else if (insertListCell) {
					if (line.contains(container)) {
						const subList = dom.check.isList(line.lastElementChild);
						let newCell = null;
						if (!isEdge) {
							newCell = line.cloneNode(false);
							newCell.appendChild(afterNode.textContent.trim() ? afterNode : dom.utils.createTextNode(unicode.zeroWidthSpace));
						}
						if (subList) {
							if (!newCell) {
								newCell = line.cloneNode(false);
								newCell.appendChild(dom.utils.createTextNode(unicode.zeroWidthSpace));
							}
							newCell.appendChild(line.lastElementChild);
						}
						if (newCell) {
							line.parentNode.insertBefore(newCell, line.nextElementSibling);
							tempAfterNode = afterNode = newCell;
						}
					}
				} else {
					afterNode = afterNode.previousSibling;
				}
			}
		}

		range = !afterNode && !isFormats ? this.#selection.getRangeAndAddLine(this.#selection.getRange(), null) : this.#selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startOff = range.startOffset;
		const endOff = range.endOffset;
		const formatRange = range.startContainer === commonCon && this.#format.isLine(commonCon);
		const startCon = formatRange ? commonCon.childNodes[startOff] || commonCon.childNodes[0] || range.startContainer : range.startContainer;
		const endCon = formatRange ? commonCon.childNodes[endOff] || commonCon.childNodes[commonCon.childNodes.length - 1] || range.endContainer : range.endContainer;

		if (!insertListCell) {
			if (!afterNode) {
				parentNode = startCon;
				if (startCon.nodeType === 3) {
					parentNode = startCon.parentNode;
				}

				/** No Select range node */
				if (range.collapsed) {
					if (commonCon.nodeType === 3) {
						if (commonCon.textContent.length > endOff) afterNode = /** @type {Text} */ (commonCon).splitText(endOff);
						else afterNode = commonCon.nextSibling;
					} else {
						if (!dom.check.isBreak(parentNode)) {
							const c = parentNode.childNodes[startOff];
							const focusNode = c?.nodeType === 3 && dom.check.isZeroWidth(c) && dom.check.isBreak(c.nextSibling) ? c.nextSibling : c;
							if (focusNode) {
								if (!focusNode.nextSibling && dom.check.isBreak(focusNode)) {
									parentNode.removeChild(focusNode);
									afterNode = null;
								} else {
									afterNode = dom.check.isBreak(focusNode) && !dom.check.isBreak(oNode) ? focusNode : focusNode.nextSibling;
								}
							} else {
								afterNode = null;
							}
						} else {
							afterNode = parentNode;
							parentNode = parentNode.parentNode;
						}
					}
				} else {
					/** Select range nodes */
					const isSameContainer = startCon === endCon;

					if (isSameContainer) {
						if (dom.check.isEdgePoint(endCon, endOff)) afterNode = endCon.nextSibling;
						else afterNode = /** @type {Text} */ (endCon).splitText(endOff);

						let removeNode = startCon;
						if (!dom.check.isEdgePoint(startCon, startOff)) removeNode = /** @type {Text} */ (startCon).splitText(startOff);

						parentNode.removeChild(removeNode);
						if (parentNode.childNodes.length === 0 && isFormats) {
							/** @type {HTMLElement} */ (parentNode).innerHTML = '<br>';
						}
					} else {
						const removedTag = this.remove();
						const container = removedTag.container;
						const prevContainer = removedTag.prevContainer;

						if (container?.childNodes.length === 0 && isFormats) {
							if (this.#format.isLine(container)) {
								container.innerHTML = '<br>';
							} else if (this.#format.isBlock(container)) {
								container.innerHTML = '<' + this.options.get('defaultLine') + '><br></' + this.options.get('defaultLine') + '>';
							}
						}

						if (dom.check.isListCell(container) && oNode.nodeType === 3) {
							parentNode = container;
							afterNode = null;
						} else if (!isFormats && prevContainer) {
							parentNode = prevContainer.nodeType === 3 ? prevContainer.parentNode : prevContainer;
							if (parentNode.contains(container)) {
								let sameParent = true;
								afterNode = container;
								while (afterNode.parentNode && afterNode.parentNode !== parentNode) {
									afterNode = afterNode.parentNode;
									sameParent = false;
								}
								if (sameParent && container === prevContainer) afterNode = afterNode.nextSibling;
							} else {
								afterNode = null;
							}
						} else if (dom.check.isWysiwygFrame(container) && !this.#format.isLine(oNode)) {
							parentNode = container.appendChild(dom.utils.createElement(this.options.get('defaultLine')));
							afterNode = null;
						} else {
							afterNode = isFormats ? endCon : container === prevContainer ? container.nextSibling : container;
							parentNode = !afterNode || !afterNode.parentNode ? commonCon : afterNode.parentNode;
						}

						while (afterNode && !this.#format.isLine(afterNode) && afterNode.parentNode !== commonCon) {
							afterNode = afterNode.parentNode;
						}
					}
				}
			} else {
				// has afterNode
				parentNode = afterNode.parentNode;
				afterNode = afterNode.nextSibling;
				originAfter = true;
			}
		}

		try {
			// set node
			const wysiwyg = this.frameContext.get('wysiwyg');
			if (!insertListCell) {
				if (dom.check.isWysiwygFrame(afterNode) || parentNode === wysiwyg.parentNode) {
					parentNode = wysiwyg;
					afterNode = null;
				}

				if (this.#format.isLine(oNode) || this.#format.isBlock(oNode) || (!dom.check.isListCell(parentNode) && this.#component.isBasic(oNode))) {
					const oldParent = parentNode;
					if (dom.check.isListCell(afterNode)) {
						parentNode = afterNode.previousElementSibling || afterNode;
					} else if (!originAfter && !afterNode) {
						const r = this.remove();
						const container = r.container.nodeType === 3 ? (dom.check.isListCell(this.#format.getLine(r.container, null)) ? r.container : this.#format.getLine(r.container, null) || r.container.parentNode) : r.container;
						const rangeCon = dom.check.isWysiwygFrame(container) || this.#format.isBlock(container);
						parentNode = rangeCon ? container : container.parentNode;
						afterNode = rangeCon ? null : container.nextSibling;
					}

					if (oldParent.childNodes.length === 0 && parentNode !== oldParent) dom.utils.removeItem(oldParent);
				}

				if (isFormats && !freeFormat && !this.#format.isBlock(parentNode) && !dom.check.isListCell(parentNode) && !dom.check.isWysiwygFrame(parentNode)) {
					afterNode = parentNode.nextElementSibling;
					parentNode = parentNode.parentNode;
				}

				if (dom.check.isWysiwygFrame(parentNode) && (oNode.nodeType === 3 || dom.check.isBreak(oNode))) {
					const formatNode = dom.utils.createElement(this.options.get('defaultLine'), null, oNode);
					fNode = oNode;
					oNode = formatNode;
				}
			}

			// insert--
			if (insertListCell) {
				if (!tempParentNode.parentNode) {
					parentNode = wysiwyg;
					afterNode = null;
				} else {
					parentNode = tempParentNode;
					afterNode = tempAfterNode;
				}
			} else {
				afterNode = parentNode === afterNode ? parentNode.lastChild : afterNode;
			}

			if (dom.check.isListCell(oNode) && !dom.check.isList(parentNode)) {
				if (dom.check.isListCell(parentNode)) {
					afterNode = parentNode.nextElementSibling;
					parentNode = parentNode.parentNode;
				} else {
					const ul = dom.utils.createElement('ol');
					parentNode.insertBefore(ul, afterNode);
					parentNode = ul;
					afterNode = null;
				}
				insertListCell = true;
			}

			this.#checkDuplicateNode(oNode, parentNode);
			parentNode.insertBefore(oNode, afterNode);

			if (insertListCell) {
				if (dom.check.isZeroWidth(line.textContent.trim())) {
					dom.utils.removeItem(line);
					oNode = oNode.lastChild;
				} else {
					const chList = dom.utils.arrayFind(line.children, dom.check.isList);
					if (chList) {
						if (oNode !== chList) {
							oNode.appendChild(chList);
							oNode = chList.previousSibling;
						} else {
							parentNode.appendChild(oNode);
							oNode = parentNode;
						}

						if (dom.check.isZeroWidth(line.textContent.trim())) {
							dom.utils.removeItem(line);
						}
					}
				}
			}
		} catch (error) {
			parentNode.appendChild(oNode);
			console.warn('[SUNEDITOR.html.insertNode.warn]', error);
		} finally {
			if (fNode) oNode = fNode;

			const dupleNodes = parentNode.querySelectorAll('[data-duple]');
			if (dupleNodes.length > 0) {
				for (let i = 0, len = dupleNodes.length, d, c, ch, parent; i < len; i++) {
					d = dupleNodes[i];
					ch = d.childNodes;
					parent = d.parentNode;

					while (ch[0]) {
						c = ch[0];
						parent.insertBefore(c, d);
					}

					if (d === oNode) oNode = c;
					dom.utils.removeItem(d);
				}
			}

			if ((this.#format.isLine(oNode) || this.#component.isBasic(oNode)) && startCon === endCon) {
				const cItem = this.#format.getLine(commonCon, null);
				if (cItem?.nodeType === 1 && dom.check.isEmptyLine(cItem)) {
					dom.utils.removeItem(cItem);
				}
			}

			if (freeFormat && !dom.check.isList(oNode) && (this.#format.isLine(oNode) || this.#format.isBlock(oNode))) {
				oNode = this.#setIntoFreeFormat(oNode);
			}

			if (!this.#component.isBasic(oNode)) {
				let offset = 1;
				if (oNode.nodeType === 3) {
					offset = oNode.textContent.length;
					this.#selection.setRange(oNode, offset, oNode, offset);
				} else if (!dom.check.isBreak(oNode) && !dom.check.isListCell(oNode) && this.#format.isLine(parentNode)) {
					let zeroWidth = null;
					if (!oNode.previousSibling || dom.check.isBreak(oNode.previousSibling)) {
						zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode);
					}

					if (!oNode.nextSibling || dom.check.isBreak(oNode.nextSibling)) {
						zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
					}

					if (this.#inline._isIgnoreNodeChange(oNode)) {
						oNode = oNode.nextSibling;
						offset = 0;
					}

					this.#selection.setRange(oNode, offset, oNode, offset);
				}
			}

			result = oNode;
		}

		return result;
	}

	/**
	 * @description Delete the selected range.
	 * @returns {{container: Node, offset: number, commonCon?: ?Node, prevContainer?: ?Node}}
	 * - container: "the last element after deletion"
	 * - offset: "offset"
	 * - commonCon: "commonAncestorContainer"
	 * - prevContainer: "previousElementSibling Of the deleted area"
	 */
	remove() {
		this.#selection.resetRangeToTextNode();

		const range = this.#selection.getRange();
		const isStartEdge = range.startOffset === 0;
		const isEndEdge = dom.check.isEdgePoint(range.endContainer, range.endOffset, 'end');
		let prevContainer = null;
		let startPrevEl = null;
		let endNextEl = null;
		if (isStartEdge) {
			startPrevEl = this.#format.getLine(range.startContainer);
			prevContainer = startPrevEl ? startPrevEl.previousElementSibling : null;
			startPrevEl = startPrevEl ? prevContainer : startPrevEl;
		}
		if (isEndEdge) {
			endNextEl = this.#format.getLine(range.endContainer);
			endNextEl = endNextEl ? endNextEl.nextElementSibling : endNextEl;
		}

		let container,
			offset = 0;
		let startCon = range.startContainer;
		let endCon = range.endContainer;
		let startOff = range.startOffset;
		let endOff = range.endOffset;
		const commonCon = /** @type {HTMLElement} */ (range.commonAncestorContainer.nodeType === 3 && range.commonAncestorContainer.parentNode === startCon.parentNode ? startCon.parentNode : range.commonAncestorContainer);

		if (dom.check.isWysiwygFrame(startCon) && dom.check.isWysiwygFrame(endCon)) {
			this.set('');
			const newInitBR = this.#selection.getNode();
			return {
				container: newInitBR,
				offset: 0,
				commonCon,
			};
		}

		if (commonCon === startCon && commonCon === endCon) {
			if (this.#component.isBasic(commonCon)) {
				const compInfo = this.#component.get(commonCon);
				const compContainer = compInfo.container;
				const parent = compContainer.parentElement;

				const next = compContainer.nextSibling || compContainer.previousSibling;
				const nextOffset = next === compContainer.previousSibling ? next?.textContent?.length || 1 : 0;
				const parentNext = parent.nextElementSibling || parent.previousElementSibling;
				const parentNextOffset = parentNext === parent.previousElementSibling ? parentNext?.textContent?.length || 1 : 0;

				dom.utils.removeItem(compContainer);

				if (this.#format.isLine(parent)) {
					if (parent.childNodes.length === 0) {
						dom.utils.removeItem(parent);
						return {
							container: parentNext,
							offset: parentNextOffset,
							commonCon,
						};
					} else {
						return {
							container: next,
							offset: nextOffset,
							commonCon,
						};
					}
				} else {
					return {
						container: parentNext,
						offset: parentNextOffset,
						commonCon,
					};
				}
			} else {
				if ((commonCon.nodeType === 1 && startOff === 0 && endOff === 1) || (commonCon.nodeType === 3 && startOff === 0 && endOff === commonCon.textContent.length)) {
					const nextEl = dom.query.getNextDeepestNode(commonCon, this.frameContext.get('wysiwyg'));
					const prevEl = dom.query.getPreviousDeepestNode(commonCon, this.frameContext.get('wysiwyg'));
					const line = this.#format.getLine(commonCon);
					dom.utils.removeItem(commonCon);

					let rEl = nextEl || prevEl;
					let rOffset = nextEl ? 0 : rEl?.nodeType === 3 ? rEl.textContent.length : 1;

					const npEl = this.#format.getLine(rEl) || this.#component.get(rEl);
					if (line !== npEl) {
						rEl = /** @type {Node} */ (npEl);
						rOffset = rOffset === 0 ? 0 : 1;
					}

					if (dom.check.isZeroWidth(line) && !line.contains(rEl)) {
						dom.utils.removeItem(line);
					}

					return {
						container: rEl,
						offset: rOffset,
						commonCon,
					};
				}

				startCon = commonCon.children[startOff];
				endCon = commonCon.children[endOff];
				startOff = endOff = 0;
			}
		}

		if (!startCon || !endCon)
			return {
				container: commonCon,
				offset: 0,
				commonCon,
			};

		if (startCon === endCon && range.collapsed) {
			if (dom.check.isZeroWidth(startCon.textContent?.substring(startOff))) {
				return {
					container: startCon,
					offset: startOff,
					prevContainer: startCon && startCon.parentNode ? startCon : null,
					commonCon,
				};
			}
		}

		let beforeNode = null;
		let afterNode = null;

		const childNodes = dom.query.getListChildNodes(commonCon, null, null);
		let startIndex = dom.utils.getArrayIndex(childNodes, startCon);
		let endIndex = dom.utils.getArrayIndex(childNodes, endCon);

		if (childNodes.length > 0 && startIndex > -1 && endIndex > -1) {
			for (let i = startIndex + 1, startNode = startCon; i >= 0; i--) {
				if (childNodes[i] === startNode.parentNode && childNodes[i].firstChild === startNode && startOff === 0) {
					startIndex = i;
					startNode = startNode.parentNode;
				}
			}

			for (let i = endIndex - 1, endNode = endCon; i > startIndex; i--) {
				if (childNodes[i] === endNode.parentNode && childNodes[i].nodeType === 1) {
					childNodes.splice(i, 1);
					endNode = endNode.parentNode;
					--endIndex;
				}
			}
		} else {
			if (childNodes.length === 0) {
				if (this.#format.isLine(commonCon) || this.#format.isBlock(commonCon) || dom.check.isWysiwygFrame(commonCon) || dom.check.isBreak(commonCon) || dom.check.isMedia(commonCon)) {
					return {
						container: commonCon,
						offset: 0,
						commonCon,
					};
				} else if (dom.check.isText(commonCon)) {
					return {
						container: commonCon,
						offset: endOff,
						commonCon,
					};
				}
				childNodes.push(commonCon);
				startCon = endCon = commonCon;
			} else {
				startCon = endCon = childNodes[0];
				if (dom.check.isBreak(startCon) || dom.check.isZeroWidth(startCon)) {
					return {
						container: dom.check.isMedia(commonCon) ? commonCon : startCon,
						offset: 0,
						commonCon,
					};
				}
			}

			startIndex = endIndex = 0;
		}

		const _isText = dom.check.isText;
		const _isElement = dom.check.isElement;
		const _isSingleItem = startIndex === endIndex;
		let nextFocusNodes = null;
		for (let i = startIndex; i <= endIndex; i++) {
			const item = /** @type {Text} */ (childNodes[i]);

			if (_isText(item) && (item.data === undefined || item.length === 0)) {
				nextFocusNodes = this.#nodeRemoveListItem(item, _isSingleItem);
				continue;
			}

			if (item === startCon) {
				if (_isElement(startCon)) {
					if (this.#component.is(startCon)) continue;
					else beforeNode = dom.utils.createTextNode(startCon.textContent);
				} else {
					const sc = /** @type {Text} */ (startCon);
					const ec = /** @type {Text} */ (endCon);
					if (item === endCon) {
						beforeNode = dom.utils.createTextNode(sc.substringData(0, startOff) + ec.substringData(endOff, ec.length - endOff));
						offset = startOff;
					} else {
						beforeNode = dom.utils.createTextNode(sc.substringData(0, startOff));
					}
				}

				if (beforeNode.length > 0) {
					/** @type {Text} */ (startCon).data = beforeNode.data;
				} else {
					nextFocusNodes = this.#nodeRemoveListItem(startCon, _isSingleItem);
				}

				if (item === endCon) break;
				continue;
			}

			if (item === endCon) {
				if (_isText(endCon)) {
					afterNode = dom.utils.createTextNode(endCon.substringData(endOff, endCon.length - endOff));
				} else {
					if (this.#component.is(endCon)) continue;
					else afterNode = dom.utils.createTextNode(endCon.textContent);
				}

				if (afterNode.length > 0) {
					/** @type {Text} */ (endCon).data = afterNode.data;
				} else {
					nextFocusNodes = this.#nodeRemoveListItem(endCon, _isSingleItem);
				}

				continue;
			}

			nextFocusNodes = this.#nodeRemoveListItem(item, _isSingleItem);
		}

		const endUl = dom.query.getParentElement(endCon, 'ul');
		const startLi = dom.query.getParentElement(startCon, 'li');
		if (endUl && startLi && startLi.contains(endUl)) {
			container = endUl.previousSibling;
			offset = container.textContent.length;
		} else {
			container = endCon && endCon.parentNode ? endCon : startCon && startCon.parentNode ? startCon : range.endContainer || range.startContainer;
			if (isStartEdge || isEndEdge) {
				if (isEndEdge) {
					if (container.nodeType === 1 && container.childNodes.length === 0) {
						container.appendChild(dom.utils.createElement('BR'));
						offset = 1;
					} else {
						offset = container.textContent.length;
					}
				} else {
					offset = 0;
				}
			}
		}

		if (!this.#format.getLine(container) && !(startCon && startCon.parentNode)) {
			if (endNextEl) {
				container = endNextEl;
				offset = 0;
			} else if (startPrevEl) {
				container = startPrevEl;
				offset = 1;
			}
		}

		if (!dom.check.isWysiwygFrame(container) && container.childNodes.length === 0) {
			const rc = this.#nodeTransform.removeAllParents(container, null, null);
			if (rc) container = rc.sc || rc.ec || this.frameContext.get('wysiwyg');
		}

		if (!container || (container.nodeType === 1 && !this.#format.isLine(container) && !dom.check.isBreak(container))) {
			container = nextFocusNodes?.sc || nextFocusNodes?.ec;
			offset = container?.nodeType === 3 ? container.textContent.length : 1;
		}

		// set range
		this.#selection.setRange(container, offset, container, offset);

		return {
			container,
			offset,
			prevContainer,
			commonCon: commonCon?.parentElement ? commonCon : null,
		};
	}

	/**
	 * @description Gets the current content
	 * @param {Object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * Ignored for targetOptions.get('iframe_fullPage') is true.
	 * @param {boolean} [options.includeFullPage=false] Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 * @returns {string|Object<*, string>}
	 */
	get({ withFrame, includeFullPage, rootKey } = {}) {
		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		const prevrootKey = this.status.rootKey;
		const resultValue = {};
		for (let i = 0, len = rootKey.length, r; i < len; i++) {
			this.editor.changeFrameContext(rootKey[i]);

			const fc = this.frameContext;
			const renderHTML = dom.utils.createElement('DIV', null, this._convertToCode(fc.get('wysiwyg'), true));

			const isTableCell = dom.check.isTableCell;
			const isEmptyLine = dom.check.isEmptyLine;
			const editableEls = [];
			const emptyCells = [];
			dom.query.getListChildren(
				renderHTML,
				(current) => {
					if (current.hasAttribute('contenteditable')) {
						editableEls.push(current);
					}

					const parent = current.parentElement;
					if (isTableCell(parent) && parent.children.length <= 1 && isEmptyLine(current)) {
						emptyCells.push(parent);
					}
					return false;
				},
				null,
			);

			for (let j = 0, jlen = editableEls.length; j < jlen; j++) {
				editableEls[j].removeAttribute('contenteditable');
			}
			for (let j = 0, jlen = emptyCells.length; j < jlen; j++) {
				emptyCells[j].innerHTML = '<br>';
			}

			const content = renderHTML.innerHTML;
			if (this.frameOptions.get('iframe_fullPage')) {
				if (includeFullPage) {
					const attrs = dom.utils.getAttributesToString(fc.get('_wd').body, ['contenteditable']);
					r = `<!DOCTYPE html><html>${fc.get('_wd').head.outerHTML}<body ${attrs}>${content}</body></html>`;
				} else {
					r = content;
				}
			} else {
				r = withFrame ? `<div class="${this.options.get('_editableClass') + '' + (this.options.get('_rtl') ? ' se-rtl' : '')}">${content}</div>` : renderHTML.innerHTML;
			}

			resultValue[rootKey[i]] = r;
		}

		this.editor.changeFrameContext(prevrootKey);
		return rootKey.length > 1 ? resultValue : resultValue[rootKey[0]];
	}

	/**
	 * @description Sets the HTML string to the editor content
	 * @param {string} html HTML string
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	set(html, { rootKey } = {}) {
		this.#ui.offCurrentController();
		this.#selection.removeRange();
		const convertValue = html === null || html === undefined ? '' : this.clean(html, { forceFormat: true, whitelist: null, blacklist: null });

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.editor.changeFrameContext(rootKey[i]);

			if (!this.frameContext.get('isCodeView')) {
				this.frameContext.get('wysiwyg').innerHTML = convertValue;
				this.editor._resetComponents();
				this.history.push(false, rootKey[i]);
			} else {
				const value = this._convertToCode(convertValue, false);
				this.#viewer._setCodeView(value);
			}
		}
	}

	/**
	 * @description Add content to the end of content.
	 * @param {string} html Content to Input
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	add(html, { rootKey } = {}) {
		this.#ui.offCurrentController();

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.editor.changeFrameContext(rootKey[i]);
			const convertValue = this.clean(html, { forceFormat: true, whitelist: null, blacklist: null });

			if (!this.frameContext.get('isCodeView')) {
				const temp = dom.utils.createElement('DIV', null, convertValue);
				const children = temp.children;
				const len = children.length;
				for (let j = 0; j < len; j++) {
					if (!children[j]) continue;
					this.frameContext.get('wysiwyg').appendChild(children[j]);
				}
				this.history.push(false, rootKey[i]);
				this.#selection.scrollTo(children[len - 1]);
			} else {
				this.#viewer._setCodeView(this.#viewer._getCodeView() + '\n' + this._convertToCode(convertValue, false));
			}
		}
	}

	/**
	 * @description Gets the current content to JSON data
	 * @param {Object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 * @returns {Object<string, *>} JSON data
	 */
	getJson({ withFrame, rootKey } = {}) {
		return converter.htmlToJson(this.get({ withFrame, rootKey }));
	}

	/**
	 * @description Sets the JSON data to the editor content
	 * @param {Object<string, *>} jsdonData HTML string
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	setJson(jsdonData, { rootKey } = {}) {
		this.set(converter.jsonToHtml(jsdonData), { rootKey });
	}

	/**
	 * @description Call "clipboard.write" to copy the contents and display a success/failure toast message.
	 * @param {Node|Element|Text|string} content Content to be copied to the clipboard
	 * @returns {Promise<boolean>} Success or failure
	 */
	async copy(content) {
		try {
			if (typeof content !== 'string' && !dom.check.isElement(content) && !dom.check.isText(content)) return false;

			if ((await clipboard.write(content)) === false) {
				this.#ui.showToast(this.lang.message_copy_fail, this.options.get('toastMessageTime').copy, 'error');
				return false;
			}
			this.#ui.showToast(this.lang.message_copy_success, this.options.get('toastMessageTime').copy);
			return true;
		} catch (err) {
			console.error('[SUNEDITOR.html.copy.fail] :', err);
			this.#ui.showToast(this.lang.message_copy_fail, this.options.get('toastMessageTime').copy, 'error');
			return false;
		}
	}

	/**
	 * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "iframe_fullPage" option.
	 * @param {{head: string, body: string}} ctx { head: HTML string, body: HTML string}
	 * @param {Object} [options] Options
	 * @param {number|Array<number>} [options.rootKey=null] Root index
	 */
	setFullPage(ctx, { rootKey } = {}) {
		if (!this.frameOptions.get('iframe')) return false;

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.editor.changeFrameContext(rootKey[i]);
			if (ctx.head) this.frameContext.get('_wd').head.innerHTML = ctx.head.replace(this.#disallowedTagsRegExp, '');
			if (ctx.body) this.frameContext.get('_wd').body.innerHTML = this.clean(ctx.body, { forceFormat: true, whitelist: null, blacklist: null });
			this.editor._resetComponents();
		}
	}

	/**
	 * @description HTML code compression
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 */
	compress(html) {
		return html.replace(/>\s+</g, '> <').replace(/\n/g, '').trim();
	}

	/**
	 * @internal
	 * @description construct wysiwyg area element to html string
	 * @param {Node|string} html WYSIWYG element (this.frameContext.get('wysiwyg')) or HTML string.
	 * @param {boolean} comp If true, does not line break and indentation of tags.
	 * @returns {string}
	 */
	_convertToCode(html, comp) {
		let returnHTML = '';
		const wRegExp = RegExp;
		const brReg = new wRegExp('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
		const wDoc = typeof html === 'string' ? this._d.createRange().createContextualFragment(html) : html;
		const isFormat = (current) => {
			return this.#format.isLine(current) || this.#component.is(current);
		};
		const brChar = comp ? '' : '\n';

		const codeSize = comp ? 0 : this.status.codeIndentSize * 1;
		const indentSize = codeSize > 0 ? new Array(codeSize + 1).join(' ') : '';

		(function recursionFunc(element, indent) {
			const children = element?.childNodes;
			if (!children) return;

			const elementRegTest = brReg.test(element.nodeName);
			const elementIndent = elementRegTest ? indent : '';

			for (let i = 0, len = children.length, node, br, lineBR, nodeRegTest, tag, tagIndent; i < len; i++) {
				node = children[i];
				nodeRegTest = brReg.test(node.nodeName);
				br = nodeRegTest ? brChar : '';
				lineBR = isFormat(node) && !elementRegTest && !/^(TH|TD)$/i.test(element.nodeName) ? brChar : '';

				if (node.nodeType === 8) {
					returnHTML += '\n<!-- ' + node.textContent.trim() + ' -->' + br;
					continue;
				}
				if (node.nodeType === 3) {
					if (!dom.check.isList(node.parentElement)) returnHTML += converter.htmlToEntity(/^\n+$/.test(/** @type {Text} */ (node).data) ? '' : /** @type {Text} */ (node).data);
					continue;
				}
				if (node.childNodes.length === 0) {
					returnHTML += (/^HR$/i.test(node.nodeName) ? brChar : '') + (/^PRE$/i.test(node.parentElement.nodeName) && /^BR$/i.test(node.nodeName) ? '' : elementIndent) + /** @type {HTMLElement} */ (node).outerHTML + br;
					continue;
				}

				if (!(/** @type {HTMLElement} */ (node).outerHTML)) {
					returnHTML += new XMLSerializer().serializeToString(node);
				} else {
					tag = node.nodeName.toLowerCase();
					tagIndent = elementIndent || nodeRegTest ? indent : '';
					returnHTML += (lineBR || (elementRegTest ? '' : br)) + tagIndent + /** @type {HTMLElement} */ (node).outerHTML.match(wRegExp('<' + tag + '[^>]*>', 'i'))[0] + br;
					recursionFunc(node, indent + indentSize + '');
					returnHTML += (/\n$/.test(returnHTML) ? tagIndent : '') + '</' + tag + '>' + (lineBR || br || elementRegTest ? brChar : /^(TH|TD)$/i.test(node.nodeName) ? brChar : '');
				}
			}
		})(wDoc, '');

		return returnHTML.trim() + brChar;
	}

	/**
	 * @description Checks whether the given list item node should be removed and handles necessary clean-up.
	 * @param {Node} item The list item node to be checked.
	 * @param {boolean} isSingleItem Single item
	 * @returns {{sc:Node, ec:Node}|null} An object containing the start and end containers if any transformations were made, otherwise null.
	 */
	#nodeRemoveListItem(item, isSingleItem) {
		const line = this.#format.getLine(item, null);
		dom.utils.removeItem(item);

		if (!dom.check.isListCell(line) || isSingleItem) return;

		const result = this.#nodeTransform.removeAllParents(line, null, null);

		if (dom.check.isList(line?.firstChild)) {
			line.insertBefore(dom.utils.createTextNode(unicode.zeroWidthSpace), line.firstChild);
		}

		return result ? { sc: result.sc, ec: result.ec } : null;
	}

	/**
	 * @description Recursive function  when used to place a node in "BrLine" in "html.insertNode"
	 * @param {Node} oNode Node to be inserted
	 * @returns {Node} "oNode"
	 */
	#setIntoFreeFormat(oNode) {
		const parentNode = oNode.parentNode;
		let oNodeChildren, lastONode;

		while (this.#format.isLine(oNode) || this.#format.isBlock(oNode)) {
			oNodeChildren = oNode.childNodes;
			lastONode = null;

			while (oNodeChildren[0]) {
				lastONode = oNodeChildren[0];
				if (this.#format.isLine(lastONode) || this.#format.isBlock(lastONode)) {
					this.#setIntoFreeFormat(lastONode);
					if (!oNode.parentNode) break;
					oNodeChildren = oNode.childNodes;
					continue;
				}

				parentNode.insertBefore(lastONode, oNode);
			}

			if (oNode.childNodes.length === 0) dom.utils.removeItem(oNode);
			oNode = dom.utils.createElement('BR');
			parentNode.insertBefore(oNode, lastONode.nextSibling);
		}

		return oNode;
	}

	/**
	 * @description Returns HTML string according to tag type and configurati isExcludeFormat.
	 * @param {Node} node Node
	 * @param {boolean} forceFormat If true, text nodes that do not have a format node is wrapped with the format tag.
	 */
	#makeLine(node, forceFormat) {
		const defaultLine = this.options.get('defaultLine');
		// element
		if (node.nodeType === 1) {
			if (this.#disallowedTagNameRegExp.test(node.nodeName)) return '';
			if (dom.check.isExcludeFormat(node)) return node.outerHTML;

			const ch =
				dom.query.getListChildNodes(
					node,
					(current) => {
						return dom.check.isSpanWithoutAttr(current) && !dom.query.getParentElement(current, dom.check.isExcludeFormat);
					},
					null,
				) || [];
			for (let i = ch.length - 1, c; i >= 0; i--) {
				c = /** @type {HTMLElement} */ (ch[i]);
				c.outerHTML = c.innerHTML;
			}

			if (
				!forceFormat ||
				this.#format.isLine(node) ||
				this.#format.isBlock(node) ||
				this.#component.is(node) ||
				dom.check.isMedia(node) ||
				dom.check.isFigure(node) ||
				(dom.check.isAnchor(node) && dom.check.isMedia(node.firstElementChild))
			) {
				const n = /** @type {HTMLElement} */ (node);
				return dom.check.isSpanWithoutAttr(node) ? n.innerHTML : n.outerHTML;
			} else {
				const n = /** @type {HTMLElement} */ (node);
				return '<' + defaultLine + '>' + (dom.check.isSpanWithoutAttr(node) ? n.innerHTML : n.outerHTML) + '</' + defaultLine + '>';
			}
		}
		// text
		if (node.nodeType === 3) {
			if (!forceFormat) return converter.htmlToEntity(node.textContent);
			const textArray = node.textContent.split(/\n/g);
			let html = '';
			for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
				text = textArray[i].trim();
				if (text.length > 0) html += '<' + defaultLine + '>' + converter.htmlToEntity(text) + '</' + defaultLine + '>';
			}
			return html;
		}
		// comments
		if (node.nodeType === 8 && this.#allowHTMLComment) {
			return '<!--' + node.textContent.trim() + '-->';
		}

		return '';
	}

	/**
	 * @description Fix tags that do not fit the editor format.
	 * @param {DocumentFragment} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
	 * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist
	 * @param {RegExp} htmlCheckBlacklistRegExp Editor tags blacklist
	 * @param {boolean} tagFilter Tag filter option
	 * @param {boolean} formatFilter Format filter option
	 * @param {boolean} classFilter Class name filter option
	 * @param {boolean} _freeCodeViewMode Enforces strict HTML validation based on the editor`s policy
	 */
	#consistencyCheckOfHTML(documentFragment, htmlCheckWhitelistRegExp, htmlCheckBlacklistRegExp, tagFilter, formatFilter, classFilter, _freeCodeViewMode) {
		const removeTags = [],
			emptyTags = [],
			wrongList = [],
			withoutFormatCells = [];

		// wrong position
		const wrongTags = dom.query.getListChildNodes(
			documentFragment,
			(current) => {
				if (current.nodeType !== 1) {
					if (formatFilter && dom.check.isList(current.parentElement)) removeTags.push(current);
					if (current.nodeType === 3 && !current.textContent.trim()) removeTags.push(current);
					return false;
				}

				// tag filter
				if (tagFilter) {
					// white list
					if (htmlCheckBlacklistRegExp.test(current.nodeName) || (!htmlCheckWhitelistRegExp.test(current.nodeName) && current.childNodes.length === 0 && dom.check.isExcludeFormat(current))) {
						removeTags.push(current);
						return false;
					}
				}

				const nrtag = !dom.query.getParentElement(current, dom.check.isExcludeFormat);

				// formatFilter
				if (formatFilter) {
					// empty tags
					if (
						!dom.check.isTableElements(current) &&
						!dom.check.isListCell(current) &&
						!dom.check.isAnchor(current) &&
						(this.#format.isLine(current) || this.#format.isBlock(current) || this.#format.isTextStyleNode(current)) &&
						current.childNodes.length === 0 &&
						nrtag
					) {
						emptyTags.push(current);
						return false;
					}

					// wrong list
					if (dom.check.isList(current.parentNode) && !dom.check.isList(current) && !dom.check.isListCell(current)) {
						wrongList.push(current);
						return false;
					}

					// table cells
					if (dom.check.isTableCell(current)) {
						const fel = current.firstElementChild;
						if (!this.#format.isLine(fel) && !this.#format.isBlock(fel) && !this.#component.is(fel)) {
							withoutFormatCells.push(current);
							return false;
						}
					}
				}

				// class filter
				if (classFilter) {
					if (nrtag && current.className) {
						const className = new Array(current.classList).map(this.#isAllowedClassName).join(' ').trim();
						if (className) current.className = className;
						else current.removeAttribute('class');
					}
				}

				// format filter
				if (!formatFilter) {
					return false;
				}

				const result =
					!_freeCodeViewMode &&
					current.parentNode !== documentFragment &&
					nrtag &&
					((dom.check.isListCell(current) && !dom.check.isList(current.parentNode)) ||
						((this.#format.isLine(current) || this.#component.is(current)) && !this.#format.isBlock(current.parentNode) && !dom.query.getParentElement(current, this.#component.is.bind(this.#component))));

				return result;
			},
			null,
		);

		for (let i = 0, len = removeTags.length; i < len; i++) {
			dom.utils.removeItem(removeTags[i]);
		}

		const checkTags = [];
		for (let i = 0, len = wrongTags.length, t, p; i < len; i++) {
			t = wrongTags[i];
			p = t.parentNode;
			if (!p || !p.parentNode) continue;

			if (dom.query.getParentElement(t, dom.check.isListCell)) {
				const cellChildren = t.childNodes;
				for (let j = cellChildren.length - 1; len >= 0; j--) {
					p.insertBefore(t, cellChildren[j]);
				}
				checkTags.push(t);
			} else {
				p.parentNode.insertBefore(t, p);
				checkTags.push(p);
			}
		}

		for (let i = 0, len = checkTags.length, t; i < len; i++) {
			t = checkTags[i];
			if (dom.check.isZeroWidth(t.textContent.trim())) {
				dom.utils.removeItem(t);
			}
		}

		for (let i = 0, len = emptyTags.length; i < len; i++) {
			dom.utils.removeItem(emptyTags[i]);
		}

		for (let i = 0, len = wrongList.length, t, tp, children, p; i < len; i++) {
			t = wrongList[i];
			p = t.parentNode;
			if (!p) continue;

			tp = dom.utils.createElement('LI');

			if (this.#format.isLine(t)) {
				children = t.childNodes;
				while (children[0]) {
					tp.appendChild(children[0]);
				}
				p.insertBefore(tp, t);
				dom.utils.removeItem(t);
			} else {
				t = t.nextSibling;
				tp.appendChild(wrongList[i]);
				p.insertBefore(tp, t);
			}
		}

		for (let i = 0, len = withoutFormatCells.length, t, f; i < len; i++) {
			t = withoutFormatCells[i];
			f = dom.utils.createElement('DIV');
			f.innerHTML = t.textContent.trim().length === 0 && t.children.length === 0 ? '<br>' : t.innerHTML;
			t.innerHTML = f.outerHTML;
		}
	}

	/**
	 * @description Removes attribute values such as style and converts tags that do not conform to the "html5" standard.
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 */
	#styleNodeConvertor(html) {
		if (!this.#disallowedStyleNodesRegExp) return html;

		const ec = this.options.get('_defaultStyleTagMap');
		return html.replace(this.#disallowedStyleNodesRegExp, (m, t, n, p) => {
			return t + (typeof ec[n] === 'string' ? ec[n] : n) + (p ? ' ' + p : '');
		});
	}

	/**
	 * @description Determines if formatting is required and returns a domTree
	 * @param {DocumentFragment} domFrag documentFragment
	 * @returns {DocumentFragment}
	 */
	#editFormat(domFrag) {
		let value = '',
			f;
		const tempTree = domFrag.childNodes;

		for (let i = 0, len = tempTree.length, n; i < len; i++) {
			n = /** @type {HTMLElement} */ (tempTree[i]);
			if (this.#allowedTagNameRegExp.test(n.nodeName)) {
				value += n.outerHTML;
				continue;
			}

			if (n.nodeType === 8) {
				value += '<!-- ' + n.textContent + ' -->';
			} else if (!/meta/i.test(n.nodeName) && !this.#format.isLine(n) && !this.#format.isBlock(n) && !this.#component.is(n) && !dom.check.isExcludeFormat(n)) {
				f ||= dom.utils.createElement(this.options.get('defaultLine'));
				if (this.#format.isTextStyleNode(n)) {
					/** @type {HTMLElement} */
					(n).removeAttribute('style');
				}
				f.appendChild(n);
				i--;
				len--;
			} else {
				if (f) {
					value += f.outerHTML;
					f = null;
				}
				value += n.outerHTML;
			}
		}

		if (f) value += f.outerHTML;

		return this._d.createRange().createContextualFragment(value);
	}

	/**
	 * @description Converts a list of DOM nodes into an HTML list structure.
	 * - If the node is already a list, its innerHTML is used. If it is a block element,
	 * - the function is called recursively.
	 * @param {SunEditor.NodeCollection} domTree List of DOM nodes to be converted.
	 * @returns {string} The generated HTML list.
	 */
	#convertListCell(domTree) {
		let html = '';

		for (let i = 0, len = domTree.length, node; i < len; i++) {
			node = domTree[i];
			if (node.nodeType === 1) {
				if (dom.check.isList(node)) {
					html += node.innerHTML;
				} else if (dom.check.isListCell(node)) {
					html += node.outerHTML;
				} else if (this.#format.isLine(node)) {
					html += '<li>' + (node.innerHTML.trim() || '<br>') + '</li>';
				} else if (this.#format.isBlock(node) && !dom.check.isTableElements(node)) {
					html += this.#convertListCell(node.children);
				} else {
					html += '<li>' + /** @type {HTMLElement} */ (node).outerHTML + '</li>';
				}
			} else {
				html += '<li>' + (node.textContent || '<br>') + '</li>';
			}
		}

		return html;
	}

	/**
	 * @description Checks whether the provided DOM nodes require formatting.
	 * @param {NodeList} domTree List of DOM nodes to check.
	 * @returns {boolean} True if formatting is required, otherwise false.
	 */
	#isFormatData(domTree) {
		let requireFormat = false;

		for (let i = 0, len = domTree.length, t; i < len; i++) {
			t = domTree[i];
			if (t.nodeType === 1 && !this.#format.isTextStyleNode(t) && !dom.check.isBreak(t) && !this.#disallowedTagNameRegExp.test(t.nodeName)) {
				requireFormat = true;
				break;
			}
		}

		return requireFormat;
	}

	/**
	 * @description Cleans the inline style attributes of an HTML element.
	 * - Extracts allowed styles and removes disallowed ones based on editor settings.
	 * @param {string} m The full matched string from a regular expression.
	 * @param {?Array} v The list of allowed attributes.
	 * @param {string} name The tag name of the element being cleaned.
	 * @returns {Array} The updated list of allowed attributes including cleaned styles.
	 */
	#cleanStyle(m, v, name) {
		let sv = (m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/) || [])[0];
		if (this.#textStyleTags.includes(name) && !sv && (m.match(/<[^\s]+\s(.+)/) || [])[1]) {
			const size = (m.match(/\ssize="([^"]+)"/i) || [])[1];
			const face = (m.match(/\sface="([^"]+)"/i) || [])[1];
			const color = (m.match(/\scolor="([^"]+)"/i) || [])[1];
			if (size || face || color) {
				sv = 'style="' + (size ? 'font-size:' + numbers.get(Number(size) / 3.333, 1) + 'rem;' : '') + (face ? 'font-family:' + face + ';' : '') + (color ? 'color:' + color + ';' : '') + '"';
			}
		}

		if (sv) {
			v ||= [];

			let mv;
			for (const [key, value] of this.#cleanStyleRegExpMap) {
				if (key.test(name)) {
					mv = value;
					break;
				}
			}
			if (!mv) return v;

			const style = sv.replace(/&quot;/g, '').match(mv);
			if (!style) return v;

			const allowedStyle = [];
			for (let i = 0, len = style.length, r; i < len; i++) {
				r = style[i].match(/([a-zA-Z0-9-]+)(:)([^"']+)/);
				if (r && !/inherit|initial|revert|unset/i.test(r[3])) {
					const k = converter.kebabToCamelCase(r[1].trim());
					const cs = this.frameContext.get('wwComputedStyle')[k]?.replace(/"/g, '');
					const c = r[3].trim();
					switch (k) {
						case 'fontFamily':
							if (!this.plugins.font || !this.plugins.font.fontArray.includes(c)) continue;
							break;
						case 'fontSize':
							if (!this.plugins.fontSize) continue;
							if (!this.#fontSizeUnitRegExp.test(r[0])) {
								r[0] = r[0].replace((r[0].match(/:\s*([^;]+)/) || [])[1], converter.toFontUnit.bind(null, this.options.get('fontSizeUnits')[0]));
							}
							break;
						case 'color':
							if (!this.plugins.fontColor || /rgba\(([0-9]+\s*,\s*){3}0\)|windowtext/i.test(c)) continue;
							break;
						case 'backgroundColor':
							if (!this.plugins.backgroundColor || /rgba\(([0-9]+\s*,\s*){3}0\)|windowtext/i.test(c)) continue;
							break;
					}

					if (cs !== c) {
						allowedStyle.push(r[0]);
					}
				}
			}
			if (allowedStyle.length > 0) v.push('style="' + allowedStyle.join(';') + '"');
		}

		return v;
	}

	/**
	 * @description Delete disallowed tags
	 * @param {string} html HTML string
	 * @returns {string}
	 */
	#deleteDisallowedTags(html, whitelistRegExp, blacklistRegExp) {
		if (whitelistRegExp.test('<font>')) {
			html = html.replace(/(<\/?)font(\s?)/gi, '$1span$2');
		}

		return html.replace(whitelistRegExp, '').replace(blacklistRegExp, '');
	}

	/**
	 * @description Recursively checks for duplicate text style nodes within a given parent node.
	 * @param {Node} oNode The node to check for duplicate styles.
	 * @param {Node} parentNode The parent node where the duplicate check occurs.
	 */
	#checkDuplicateNode(oNode, parentNode) {
		const recursionFunc = (current) => {
			this.#dupleCheck(current, parentNode);
			const childNodes = current.childNodes;
			for (let i = 0, len = childNodes.length; i < len; i++) {
				recursionFunc(childNodes[i]);
			}
		};
		recursionFunc(oNode);
	}

	/**
	 * @description Recursively checks for duplicate text style nodes within a given parent node.
	 * - If duplicate styles are found, redundant attributes are removed.
	 * @param {Node} oNode The node to check for duplicate styles.
	 * @param {Node} parentNode The parent node where the duplicate check occurs.
	 * @returns {Node} The cleaned node with redundant styles removed.
	 */
	#dupleCheck(oNode, parentNode) {
		if (!this.#format.isTextStyleNode(oNode)) return;

		const oStyles = (oNode.style.cssText.match(/[^;]+;/g) || []).map(function (v) {
			return v.trim();
		});
		const nodeName = oNode.nodeName;
		if (/^span$/i.test(nodeName) && oStyles.length === 0) return oNode;

		const inst = this.#format;
		let duple = false;
		(function recursionFunc(ancestor) {
			if (dom.check.isWysiwygFrame(ancestor) || !inst.isTextStyleNode(ancestor)) return;
			if (ancestor.nodeName === nodeName) {
				duple = true;
				const styles = ancestor.style.cssText.match(/[^;]+;/g) || [];
				for (let i = 0, len = styles.length, j; i < len; i++) {
					if ((j = oStyles.indexOf(styles[i].trim())) > -1) {
						oStyles.splice(j, 1);
					}
				}
				for (let i = 0, len = ancestor.classList.length; i < len; i++) {
					oNode.classList.remove(ancestor.classList[i]);
				}
			}

			recursionFunc(ancestor.parentElement);
		})(parentNode);

		if (duple) {
			if (!(oNode.style.cssText = oStyles.join(' '))) {
				oNode.setAttribute('style', '');
				oNode.removeAttribute('style');
			}
			if (oNode.attributes.length === 0) {
				oNode.setAttribute('data-duple', 'true');
			}
		}

		return oNode;
	}

	/**
	 * @description Tag and tag attribute check RegExp function.
	 * @param {string} m RegExp value
	 * @param {string} t RegExp value
	 * @returns {string}
	 */
	#CleanElements(attrFilter, styleFilter, m, t) {
		if (/^<[a-z0-9]+:[a-z0-9]+/i.test(m)) return m;

		let v = null;
		const tagName = t.match(/(?!<)[a-zA-Z0-9-]+/)[0].toLowerCase();

		if (attrFilter) {
			// blacklist
			const bAttr = this.#attributeBlacklist[tagName];
			m = m.replace(/\s(?:on[a-z]+)\s*=\s*(")[^"]*\1/gi, '');
			if (bAttr) m = m.replace(bAttr, '');
			else m = m.replace(this.#attributeBlacklistRegExp, '');

			// whitelist
			const wAttr = this.#attributeWhitelist[tagName];
			if (wAttr) v = m.match(wAttr);
			else v = m.match(this.#attributeWhitelistRegExp);
		}

		if (!styleFilter) return m;

		// attribute
		if (tagName === 'a') {
			const sv = m.match(/(?:(?:id|name)\s*=\s*(?:"|')[^"']*(?:"|'))/g);
			if (sv) {
				v ||= [];
				v.push(sv[0]);
			}
		} else if (!v || !/style=/i.test(v.toString())) {
			if (this.#textStyleTags.includes(tagName)) {
				v = this.#cleanStyle(m, v, tagName);
			} else if (this.#format.isLine(tagName)) {
				v = this.#cleanStyle(m, v, 'line');
			} else if (this.#cleanStyleTagKeyRegExp.test(tagName)) {
				v = this.#cleanStyle(m, v, tagName);
			}
		}

		// figure
		if (dom.check.isMedia(tagName) || dom.check.isFigure(tagName)) {
			const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
			v ||= [];
			if (sv) v.push(sv[0]);
		}

		if (v) {
			for (let i = 0, len = v.length, a; i < len; i++) {
				a = /^(?:href|src)\s*=\s*('|"|\s)*javascript\s*:/i.test(v[i].trim()) ? '' : v[i];
				t += (/^\s/.test(a) ? '' : ' ') + a;
			}
		}

		return t;
	}

	/**
	 * @internal
	 * @description Reset autoStyleify options.
	 * @param {Array.<string>} autoStyleify Styles applied automatically on text input.
	 * - ex ["bold", "underline", "italic", "strike"]
	 */
	__resetAutoStyleify(autoStyleify) {
		if (autoStyleify.length > 0) {
			const convertTextTags = this.options.get('convertTextTags');
			const styleToTag = {};
			autoStyleify.forEach((style) => {
				switch (style) {
					case 'bold':
						styleToTag.bold = { regex: /font-weight\s*:\s*bold/i, tag: convertTextTags.bold };
						break;
					case 'italic':
						styleToTag.italic = { regex: /font-style\s*:\s*italic/i, tag: convertTextTags.italic };
						break;
					case 'underline':
						styleToTag.underline = { regex: /text-decoration\s*:\s*underline/i, tag: convertTextTags.underline };
						break;
					case 'strike':
						styleToTag.strike = { regex: /text-decoration\s*:\s*line-through/i, tag: convertTextTags.strike };
						break;
				}
			});
			this.#autoStyleify = styleToTag;
		} else {
			this.#autoStyleify = null;
		}
	}

	/**
	 * @internal
	 * @description Destroy the HTML instance and release memory
	 */
	_destroy() {
		// Clear Map
		if (this.#cleanStyleRegExpMap) {
			this.#cleanStyleRegExpMap.clear();
		}
	}
}

/**
 * @description Get related list
 * @param {string} str Regular expression string
 * @param {string} str2 Regular expression string
 */
function GetRegList(str, str2) {
	return !str ? '^' : str === '*' ? '[a-z-]+' : !str2 ? str : str + '|' + str2;
}

export default HTML;
