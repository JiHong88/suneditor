/**
 * @fileoverview Char class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, converter, numbers, unicode, env } from '../../helper';

const REQUIRED_DATA_ATTRS = 'data-se-[^\\s]+';
const V2_MIG_DATA_ATTRS = '|data-index|data-file-size|data-file-name|data-exp|data-font-size';

/**
 * @constructor
 * @description All HTML related classes involved in the editing area
 * @param {object} editor - editor core object
 */
const HTML = function (editor) {
	CoreInjector.call(this, editor);

	// members
	const options = this.options;
	this._isAllowedClassName = function (v) {
		return this.test(v) ? v : '';
	}.bind(this.options.get('allowedClassName'));
	this._allowHTMLComment = null;
	this._disallowedStyleNodesRegExp = null;
	this._htmlCheckWhitelistRegExp = null;
	this._htmlCheckBlacklistRegExp = null;
	this._elementWhitelistRegExp = null;
	this._elementBlacklistRegExp = null;
	this._attributeWhitelist = null;
	this._attributeWhitelistRegExp = null;
	this._attributeBlacklist = null;
	this._attributeBlacklistRegExp = null;
	this._textStyleTags = options.get('_textStyleTags');
	this._autoStyleify = null;

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
		line: options.get('_lineStylesRegExp')
	};
	this._textStyleTags.forEach((v) => {
		stylesObj[v] = options.get('_textStylesRegExp');
	});

	for (const key in stylesObj) {
		stylesMap.set(new RegExp(`^(${key})$`), stylesObj[key]);
	}
	this._cleanStyleTagKeyRegExp = new RegExp(`^(${Object.keys(stylesObj).join('|')})$`, 'i');
	this._cleanStyleRegExpMap = stylesMap;

	// font size unit
	this.fontSizeUnitRegExp = new RegExp('\\d+(' + this.options.get('fontSizeUnits').join('|') + ')$', 'i');

	// extra tags
	const allowedExtraTags = options.get('_allowedExtraTag');
	const disallowedExtraTags = options.get('_disallowedExtraTag');
	this.__disallowedTagsRegExp = new RegExp(`<(${disallowedExtraTags})[^>]*>([\\s\\S]*?)<\\/\\1>|<(${disallowedExtraTags})[^>]*\\/?>`, 'gi');
	this.__disallowedTagNameRegExp = new RegExp(`^(${disallowedExtraTags})$`, 'i');
	this.__allowedTagNameRegExp = new RegExp(`^(${allowedExtraTags})$`, 'i');

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
	this._disallowedStyleNodesRegExp = disallowStyleNodes.length === 0 ? null : new RegExp('(<\\/?)(' + disallowStyleNodes.join('|') + ')\\b\\s*([^>^<]+)?\\s*(?=>)', 'gi');

	// whitelist
	// tags
	const defaultAttr = options.get('__defaultAttributeWhitelist');
	this._allowHTMLComment = options.get('_editorElementWhitelist').includes('//') || options.get('_editorElementWhitelist') === '*';
	// html check
	this._htmlCheckWhitelistRegExp = new RegExp('^(' + GetRegList(options.get('_editorElementWhitelist').replace('|//', ''), '') + ')$', 'i');
	this._htmlCheckBlacklistRegExp = new RegExp('^(' + (options.get('elementBlacklist') || '^') + ')$', 'i');
	// elements
	this._elementWhitelistRegExp = converter.createElementWhitelist(GetRegList(options.get('_editorElementWhitelist').replace('|//', '|<!--|-->'), ''));
	this._elementBlacklistRegExp = converter.createElementBlacklist(options.get('elementBlacklist').replace('|//', '|<!--|-->'));
	// attributes
	const regEndStr = '\\s*=\\s*(")[^"]*\\1';
	const _wAttr = options.get('attributeWhitelist');
	let tagsAttr = {};
	let allAttr = '';
	if (_wAttr) {
		for (const k in _wAttr) {
			if (/^on[a-z]+$/i.test(_wAttr[k])) continue;
			if (k === '*') {
				allAttr = GetRegList(_wAttr[k], defaultAttr);
			} else {
				tagsAttr[k] = new RegExp('\\s(?:' + GetRegList(_wAttr[k], '') + ')' + regEndStr, 'ig');
			}
		}
	}

	this._attributeWhitelistRegExp = new RegExp('\\s(?:' + (allAttr || defaultAttr) + '|' + REQUIRED_DATA_ATTRS + (this.options.get('v2Migration') ? V2_MIG_DATA_ATTRS : '') + ')' + regEndStr, 'ig');
	this._attributeWhitelist = tagsAttr;

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

	this._attributeBlacklistRegExp = new RegExp('\\s(?:' + (allAttr || '^') + ')' + regEndStr, 'ig');
	this._attributeBlacklist = tagsAttr;

	// autoStyleify
	if (this.options.get('autoStyleify').length > 0) {
		const convertTextTags = this.options.get('convertTextTags');
		const styleToTag = {};
		this.options.get('autoStyleify').forEach((style) => {
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
		this._autoStyleify = styleToTag;
	}
};

HTML.prototype = {
	/**
	 * @description Filter HTML by whitelist, blacklist, and validate.
	 * @param {string} html HTML string to be filtered.
	 * @param {object} params Filtering parameters.
	 * @param {string} params.tagWhitelist Whitelist of allowed tags, specified as a string with tags separated by '|'. ex) "div|p|span".
	 * @param {string} params.tagBlacklist Blacklist of disallowed tags, specified as a string with tags separated by '|'. ex) "script|iframe".
	 * @param {function} params.validate Function to validate or replace individual elements based on custom conditions. Should return a new node for replacement, a string for outerHTML replacement, or null to remove the node.
	 * @param {function} params.validateAll Function to validate or replace all elements based on custom conditions. Should return a new node for replacement, a string for outerHTML replacement, or null to remove the node.
	 * @returns {string} Filtered HTML string.
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
					} else if (result instanceof Node) {
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
			const closestAny = function (element) {
				return compClass.some((selector) => element.closest(selector));
			};
			parseDocument.body.querySelectorAll('*').forEach((node) => {
				if (!closestAny(node)) {
					const result = validate(node);
					if (result === null) {
						node.remove();
					} else if (result instanceof Node) {
						node.replaceWith(result);
					} else if (typeof result === 'string') {
						node.outerHTML = result;
					}
				}
			});
			html = parseDocument.body.innerHTML;
		}

		return html;
	},

	/**
	 * @description Cleans and compresses HTML code to suit the editor format.
	 * @param {string} html HTML string to clean and compress
	 * @param {object} [options] Cleaning options
	 * @param {boolean} [options.forceFormat=false] If true, wraps text nodes without a format node in the format tag.
	 * @param {string|RegExp|null} [options.whitelist=null] Regular expression of allowed tags.
	 * Create RegExp object using helper.converter.createElementWhitelist method.
	 * @param {string|RegExp|null} [options.blacklist=null] Regular expression of disallowed tags.
	 * Create RegExp object using helper.converter.createElementBlacklist method.
	 * @returns {string} Cleaned and compressed HTML string
	 */
	clean(html, { forceFormat, whitelist, blacklist, _freeCodeViewMode } = {}) {
		const { tagFilter, formatFilter, classFilter, styleNodeFilter, attrFilter, styleFilter } = this.options.get('strictMode');
		let cleanData = '';

		html = this.compress(html);

		if (tagFilter) {
			html = html.replace(this.__disallowedTagsRegExp, '');
			html = this._deleteDisallowedTags(html, this._elementWhitelistRegExp, this._elementBlacklistRegExp).replace(/<br\/?>$/i, '');
		}

		if (this._autoStyleify) {
			const dom = new DOMParser().parseFromString(html, 'text/html');
			domUtils.getListChildNodes(dom.body, converter.spanToStyleNode.bind(null, this._autoStyleify));
			html = dom.body.innerHTML;
		}

		if (attrFilter || styleFilter) {
			html = html.replace(/(<[a-zA-Z0-9-]+)[^>]*(?=>)/g, CleanElements.bind(this, attrFilter, styleFilter));
		}

		// get dom tree
		const dom = this._d.createRange().createContextualFragment(html, true);

		if (tagFilter) {
			try {
				this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, this._htmlCheckBlacklistRegExp, tagFilter, formatFilter, classFilter, _freeCodeViewMode);
			} catch (error) {
				console.warn('[SUNEDITOR.html.clean.fail]', error.message);
			}
		}

		if (this.options.get('__pluginRetainFilter')) {
			this.editor._MELInfo.forEach((method, query) => {
				const infoLst = dom.querySelectorAll(query);
				for (let i = 0, len = infoLst.length; i < len; i++) {
					method(infoLst[i]);
				}
			});
		}

		if (formatFilter) {
			let domTree = dom.childNodes;
			if (!forceFormat) forceFormat = this._isFormatData(domTree);
			if (forceFormat) domTree = this._editFormat(dom).childNodes;

			for (let i = 0, len = domTree.length, t; i < len; i++) {
				t = domTree[i];
				if (this.__allowedTagNameRegExp.test(t.nodeName)) {
					cleanData += t.outerHTML;
					continue;
				}
				cleanData += this._makeLine(t, forceFormat);
			}
		}

		// set clean data
		if (!cleanData) cleanData = html;

		// whitelist, blacklist
		if (tagFilter) {
			if (whitelist) cleanData = cleanData.replace(typeof whitelist === 'string' ? converter.createElementWhitelist(whitelist) : whitelist, '');
			if (blacklist) cleanData = cleanData.replace(typeof blacklist === 'string' ? converter.createElementBlacklist(blacklist) : blacklist, '');
		}

		if (styleNodeFilter) {
			cleanData = this._styleNodeConvertor(cleanData);
		}

		return cleanData;
	},

	/**
	 * @description Inserts an (HTML element / HTML string / plain string) at the selection range.
	 * If "frameOptions.get('charCounter_max')" is exceeded when "html" is added, null is returned without addition.
	 * @param {Element|string} html HTML Element or HTML string or plain string
	 * @param {object} [options] Options
	 * @param {boolean} [options.selectInserted=false] If true, selects the range of the inserted node.
	 * @param {boolean} [options.skipCharCount=false] If true, inserts even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @param {boolean} [options.skipCleaning=false] If true, inserts the HTML string without refining it with html.clean.
	 * @returns {Element|null} The inserted element or null if insertion failed
	 */
	insert(html, { selectInserted, skipCharCount, skipCleaning } = {}) {
		if (!this.editor.frameContext.get('wysiwyg').contains(this.selection.get().focusNode)) this.editor.focus();

		if (typeof html === 'string') {
			if (!skipCleaning) html = this.clean(html, { forceFormat: false, whitelist: null, blacklist: null });
			try {
				if (domUtils.isListCell(this.format.getLine(this.selection.getNode(), null))) {
					const dom = this._d.createRange().createContextualFragment(html);
					const domTree = dom.childNodes;
					if (this._isFormatData(domTree)) html = this._convertListCell(domTree);
				}

				const dom = this._d.createRange().createContextualFragment(html);
				const domTree = dom.childNodes;

				if (!skipCharCount) {
					const type = this.editor.frameOptions.get('charCounter_type') === 'byte-html' ? 'outerHTML' : 'textContent';
					let checkHTML = '';
					for (let i = 0, len = domTree.length; i < len; i++) {
						checkHTML += domTree[i][type];
					}
					if (!this.char.check(checkHTML)) return;
				}

				let c, a, t, prev, firstCon;
				while ((c = domTree[0])) {
					if (prev?.nodeType === 3 && a?.nodeType === 1 && domUtils.isBreak(c)) {
						prev = c;
						domUtils.removeItem(c);
						continue;
					}
					t = this.insertNode(c, { afterNode: a, skipCharCount: true });
					a = t.container || t;
					if (!firstCon) firstCon = t;
					prev = c;
				}

				if (prev?.nodeType === 3 && a?.nodeType === 1) a = prev;
				const offset = a.nodeType === 3 ? t.endOffset || a.textContent.length : a.childNodes.length;

				if (selectInserted) {
					this.selection.setRange(firstCon.container || firstCon, firstCon.startOffset || 0, a, offset);
				} else if (!this.component.is(a)) {
					this.selection.setRange(a, offset, a, offset);
				}
			} catch (error) {
				if (this.editor.frameContext.get('isReadOnly') || this.editor.frameContext.get('isDisabled')) return;
				throw Error('[SUNEDITOR.html.insert.error]', error.message);
			}
		} else {
			if (this.component.is(html)) {
				this.component.insert(html, { skipCharCount, skipSelection: false, skipHistory: false });
			} else {
				let afterNode = null;
				if (this.format.isLine(html) || domUtils.isMedia(html)) {
					afterNode = this.format.getLine(this.selection.getNode(), null);
				}
				this.insertNode(html, { afterNode, skipCharCount });
			}
		}

		this.editor.effectNode = null;
		this.editor.focus();
		this.history.push(false);
	},

	/**
	 * @description Delete selected node and insert argument value node and return.
	 * If the "afterNode" exists, it is inserted after the "afterNode"
	 * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param {Node} oNode Node to be inserted
	 * @param {object} [options] Options
	 * @param {Node} [options.afterNode=null] If the node exists, it is inserted after the node
	 * @param {boolean} [options.skipCharCount=null] If true, it will be inserted even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @returns {Object|Node|null}
	 */
	insertNode(oNode, { afterNode, skipCharCount } = {}) {
		let result = null;
		if (this.editor.frameContext.get('isReadOnly') || (!skipCharCount && !this.char.check(oNode, null))) {
			return result;
		}

		let fNode = null;
		let range = this.selection.getRange();
		let line = domUtils.isListCell(range.commonAncestorContainer) ? range.commonAncestorContainer : this.format.getLine(this.selection.getNode(), null);
		let insertListCell = domUtils.isListCell(line) && (domUtils.isListCell(oNode) || domUtils.isList(oNode));

		let parentNode,
			originAfter,
			tempAfterNode,
			tempParentNode = null;
		const freeFormat = this.format.isBrLine(line);
		const isFormats = (!freeFormat && (this.format.isLine(oNode) || this.format.isBlock(oNode))) || this.component.isBasic(oNode);

		if (insertListCell) {
			tempAfterNode = afterNode || domUtils.isList(oNode) ? line.lastChild : line.nextElementSibling;
			tempParentNode = domUtils.isList(oNode) ? line : (tempAfterNode || line).parentNode;
		}

		if (!afterNode && (isFormats || this.component.isBasic(oNode) || domUtils.isMedia(oNode))) {
			const isEdge = domUtils.isEdgePoint(range.endContainer, range.endOffset, 'end');
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
			} else if (insertListCell && domUtils.isListCell(container) && !line.parentElement) {
				line = domUtils.createElement('LI');
				tempParentNode.appendChild(line);
				container.appendChild(tempParentNode);
				tempAfterNode = null;
			} else if (container.nodeType === 3 || domUtils.isBreak(container) || insertListCell) {
				const depthFormat = domUtils.getParentElement(container, (current) => {
					return this.format.isBlock(current) || domUtils.isListCell(current);
				});
				afterNode = this.nodeTransform.split(container, r.offset, !depthFormat ? 0 : domUtils.getNodeDepth(depthFormat) + 1);
				if (!afterNode) {
					tempAfterNode = afterNode = line;
				} else if (insertListCell) {
					if (line.contains(container)) {
						const subList = domUtils.isList(line.lastElementChild);
						let newCell = null;
						if (!isEdge) {
							newCell = line.cloneNode(false);
							newCell.appendChild(afterNode.textContent.trim() ? afterNode : domUtils.createTextNode(unicode.zeroWidthSpace));
						}
						if (subList) {
							if (!newCell) {
								newCell = line.cloneNode(false);
								newCell.appendChild(domUtils.createTextNode(unicode.zeroWidthSpace));
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

		range = !afterNode && !isFormats ? this.selection.getRangeAndAddLine(this.selection.getRange(), null) : this.selection.getRange();
		const commonCon = range.commonAncestorContainer;
		const startOff = range.startOffset;
		const endOff = range.endOffset;
		const formatRange = range.startContainer === commonCon && this.format.isLine(commonCon);
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
						if (commonCon.textContent.length > endOff) afterNode = commonCon.splitText(endOff);
						else afterNode = commonCon.nextSibling;
					} else {
						if (!domUtils.isBreak(parentNode)) {
							const c = parentNode.childNodes[startOff];
							const focusNode = c?.nodeType === 3 && domUtils.isZeroWith(c) && domUtils.isBreak(c.nextSibling) ? c.nextSibling : c;
							if (focusNode) {
								if (!focusNode.nextSibling && domUtils.isBreak(focusNode)) {
									parentNode.removeChild(focusNode);
									afterNode = null;
								} else {
									afterNode = domUtils.isBreak(focusNode) && !domUtils.isBreak(oNode) ? focusNode : focusNode.nextSibling;
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
						if (domUtils.isEdgePoint(endCon, endOff)) afterNode = endCon.nextSibling;
						else afterNode = endCon.splitText(endOff);

						let removeNode = startCon;
						if (!domUtils.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

						parentNode.removeChild(removeNode);
						if (parentNode.childNodes.length === 0 && isFormats) {
							parentNode.innerHTML = '<br>';
						}
					} else {
						const removedTag = this.remove();
						const container = removedTag.container;
						const prevContainer = removedTag.prevContainer;

						if (container?.childNodes.length === 0 && isFormats) {
							if (this.format.isLine(container)) {
								container.innerHTML = '<br>';
							} else if (this.format.isBlock(container)) {
								container.innerHTML = '<' + this.options.get('defaultLine') + '><br></' + this.options.get('defaultLine') + '>';
							}
						}

						if (domUtils.isListCell(container) && oNode.nodeType === 3) {
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
						} else if (domUtils.isWysiwygFrame(container) && !this.format.isLine(oNode)) {
							parentNode = container.appendChild(domUtils.createElement(this.options.get('defaultLine')));
							afterNode = null;
						} else {
							afterNode = isFormats ? endCon : container === prevContainer ? container.nextSibling : container;
							parentNode = !afterNode || !afterNode.parentNode ? commonCon : afterNode.parentNode;
						}

						while (afterNode && !this.format.isLine(afterNode) && afterNode.parentNode !== commonCon) {
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
			const wysiwyg = this.editor.frameContext.get('wysiwyg');
			if (!insertListCell) {
				if (domUtils.isWysiwygFrame(afterNode) || parentNode === wysiwyg.parentNode) {
					parentNode = wysiwyg;
					afterNode = null;
				}

				if (this.format.isLine(oNode) || this.format.isBlock(oNode) || (!domUtils.isListCell(parentNode) && this.component.isBasic(oNode))) {
					const oldParent = parentNode;
					if (domUtils.isList(afterNode)) {
						parentNode = afterNode;
						afterNode = null;
					} else if (domUtils.isListCell(afterNode)) {
						parentNode = afterNode.previousElementSibling || afterNode;
					} else if (!originAfter && !afterNode) {
						const r = this.remove();
						const container = r.container.nodeType === 3 ? (domUtils.isListCell(this.format.getLine(r.container, null)) ? r.container : this.format.getLine(r.container, null) || r.container.parentNode) : r.container;
						const rangeCon = domUtils.isWysiwygFrame(container) || this.format.isBlock(container);
						parentNode = rangeCon ? container : container.parentNode;
						afterNode = rangeCon ? null : container.nextSibling;
					}

					if (oldParent.childNodes.length === 0 && parentNode !== oldParent) domUtils.removeItem(oldParent);
				}

				if (isFormats && !freeFormat && !this.format.isBlock(parentNode) && !domUtils.isListCell(parentNode) && !domUtils.isWysiwygFrame(parentNode)) {
					afterNode = parentNode.nextElementSibling;
					parentNode = parentNode.parentNode;
				}

				if (domUtils.isWysiwygFrame(parentNode) && (oNode.nodeType === 3 || domUtils.isBreak(oNode))) {
					const formatNode = domUtils.createElement(this.options.get('defaultLine'), null, oNode);
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

			if (domUtils.isListCell(oNode) && !domUtils.isList(parentNode)) {
				if (domUtils.isListCell(parentNode)) {
					afterNode = parentNode.nextElementSibling;
					parentNode = parentNode.parentNode;
				} else {
					const ul = domUtils.createElement('ol');
					parentNode.insertBefore(ul, afterNode);
					parentNode = ul;
					afterNode = null;
				}
				insertListCell = true;
			}

			this._checkDuplicateNode(oNode, parentNode);
			parentNode.insertBefore(oNode, afterNode);

			if (insertListCell) {
				if (domUtils.isZeroWith(line.textContent.trim())) {
					domUtils.removeItem(line);
					oNode = oNode.lastChild;
				} else {
					const chList = domUtils.getArrayItem(line.children, domUtils.isList);
					if (chList) {
						if (oNode !== chList) {
							oNode.appendChild(chList);
							oNode = chList.previousSibling;
						} else {
							parentNode.appendChild(oNode);
							oNode = parentNode;
						}

						if (domUtils.isZeroWith(line.textContent.trim())) {
							domUtils.removeItem(line);
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
					domUtils.removeItem(d);
				}
			}

			if ((this.format.isLine(oNode) || this.component.isBasic(oNode)) && startCon === endCon) {
				const cItem = this.format.getLine(commonCon, null);
				if (cItem?.nodeType === 1 && domUtils.isEmptyLine(cItem)) {
					domUtils.removeItem(cItem);
				}
			}

			if (freeFormat && (this.format.isLine(oNode) || this.format.isBlock(oNode))) {
				oNode = this._setIntoFreeFormat(oNode);
			}

			if (!this.component.isBasic(oNode)) {
				let offset = 1;
				if (oNode.nodeType === 3) {
					offset = oNode.textContent.length;
					this.selection.setRange(oNode, offset, oNode, offset);
				} else if (!domUtils.isBreak(oNode) && !domUtils.isListCell(oNode) && this.format.isLine(parentNode)) {
					let zeroWidth = null;
					if (!oNode.previousSibling || domUtils.isBreak(oNode.previousSibling)) {
						zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode);
					}

					if (!oNode.nextSibling || domUtils.isBreak(oNode.nextSibling)) {
						zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
					}

					if (this.format._isIgnoreNodeChange(oNode)) {
						oNode = oNode.nextSibling;
						offset = 0;
					}

					this.selection.setRange(oNode, offset, oNode, offset);
				}
			}

			result = oNode;
		}

		return result;
	},

	/**
	 * @description Delete the selected range.
	 * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
	 * @returns {object}
	 */
	remove() {
		this.selection._resetRangeToTextNode();

		const range = this.selection.getRange();
		const isStartEdge = range.startOffset === 0;
		const isEndEdge = domUtils.isEdgePoint(range.endContainer, range.endOffset, 'end');
		let prevContainer = null;
		let startPrevEl = null;
		let endNextEl = null;
		if (isStartEdge) {
			startPrevEl = this.format.getLine(range.startContainer);
			prevContainer = startPrevEl ? startPrevEl.previousElementSibling : null;
			startPrevEl = startPrevEl ? prevContainer : startPrevEl;
		}
		if (isEndEdge) {
			endNextEl = this.format.getLine(range.endContainer);
			endNextEl = endNextEl ? endNextEl.nextElementSibling : endNextEl;
		}

		let container,
			offset = 0;
		let startCon = range.startContainer;
		let endCon = range.endContainer;
		let startOff = range.startOffset;
		let endOff = range.endOffset;
		const commonCon = range.commonAncestorContainer.nodeType === 3 && range.commonAncestorContainer.parentNode === startCon.parentNode ? startCon.parentNode : range.commonAncestorContainer;
		if (commonCon === startCon && commonCon === endCon) {
			if (this.component.isBasic(commonCon)) {
				const compInfo = this.component.get(commonCon);
				const compContainer = compInfo.container;
				const parent = compContainer.parentNode;

				const next = compContainer.nextSibling || compContainer.previousSibling;
				const nextOffset = next === compContainer.previousSibling ? next?.textContent?.length || 1 : 0;
				const parentNext = parent.nextElementSibling || parent.previousElementSibling;
				const parentNextOffset = parentNext === parent.previousElementSibling ? parentNext?.textContent?.length || 1 : 0;

				domUtils.removeItem(compContainer);

				if (this.format.isLine(parent)) {
					if (parent.childNodes.length === 0) {
						domUtils.removeItem(parent);
						return {
							container: parentNext,
							offset: parentNextOffset,
							commonCon
						};
					} else {
						return {
							container: next,
							offset: nextOffset,
							commonCon
						};
					}
				} else {
					return {
						container: parentNext,
						offset: parentNextOffset,
						commonCon
					};
				}
			} else {
				if ((commonCon.nodeType === 1 && startOff === 0 && endOff === 1) || (commonCon.nodeType === 3 && startOff === 0 && endOff === commonCon.textContent.length)) {
					const nextEl = domUtils.getNextDeepestNode(commonCon, this.editor.frameContext.get('wysiwyg'));
					const prevEl = domUtils.getPreviousDeepestNode(commonCon, this.editor.frameContext.get('wysiwyg'));
					const line = this.format.getLine(commonCon);
					domUtils.removeItem(commonCon);

					let rEl = nextEl || prevEl;
					let rOffset = nextEl ? 0 : rEl?.nodeType === 3 ? rEl.textContent.length : 1;

					const npEl = this.format.getLine(rEl) || this.component.get(rEl);
					if (line !== npEl) {
						rEl = npEl;
						rOffset = rOffset === 0 ? 0 : 1;
					}

					if (domUtils.isZeroWith(line) && !line.contains(rEl)) {
						domUtils.removeItem(line);
					}

					return {
						container: rEl,
						offset: rOffset,
						commonCon
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
				commonCon
			};

		if (startCon === endCon && range.collapsed) {
			if (domUtils.isZeroWith(startCon.textContent?.substr(startOff))) {
				return {
					container: startCon,
					offset: startOff,
					prevContainer: startCon && startCon.parentNode ? startCon : null,
					commonCon
				};
			}
		}

		let beforeNode = null;
		let afterNode = null;

		const childNodes = domUtils.getListChildNodes(commonCon, null);
		let startIndex = domUtils.getArrayIndex(childNodes, startCon);
		let endIndex = domUtils.getArrayIndex(childNodes, endCon);

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
				if (this.format.isLine(commonCon) || this.format.isBlock(commonCon) || domUtils.isWysiwygFrame(commonCon) || domUtils.isBreak(commonCon) || domUtils.isMedia(commonCon)) {
					return {
						container: commonCon,
						offset: 0,
						commonCon
					};
				} else if (commonCon.nodeType === 3) {
					return {
						container: commonCon,
						offset: endOff,
						commonCon
					};
				}
				childNodes.push(commonCon);
				startCon = endCon = commonCon;
			} else {
				startCon = endCon = childNodes[0];
				if (domUtils.isBreak(startCon) || domUtils.isZeroWith(startCon)) {
					return {
						container: domUtils.isMedia(commonCon) ? commonCon : startCon,
						offset: 0,
						commonCon
					};
				}
			}

			startIndex = endIndex = 0;
		}

		for (let i = startIndex; i <= endIndex; i++) {
			const item = childNodes[i];

			if (item.length === 0 || (item.nodeType === 3 && item.data === undefined)) {
				this._nodeRemoveListItem(item);
				continue;
			}

			if (item === startCon) {
				if (startCon.nodeType === 1) {
					if (this.component.is(startCon)) continue;
					else beforeNode = domUtils.createTextNode(startCon.textContent);
				} else {
					if (item === endCon) {
						beforeNode = domUtils.createTextNode(startCon.substringData(0, startOff) + endCon.substringData(endOff, endCon.length - endOff));
						offset = startOff;
					} else {
						beforeNode = domUtils.createTextNode(startCon.substringData(0, startOff));
					}
				}

				if (beforeNode.length > 0) {
					startCon.data = beforeNode.data;
				} else {
					this._nodeRemoveListItem(startCon);
				}

				if (item === endCon) break;
				continue;
			}

			if (item === endCon) {
				if (endCon.nodeType === 1) {
					if (this.component.is(endCon)) continue;
					else afterNode = domUtils.createTextNode(endCon.textContent);
				} else {
					afterNode = domUtils.createTextNode(endCon.substringData(endOff, endCon.length - endOff));
				}

				if (afterNode.length > 0) {
					endCon.data = afterNode.data;
				} else {
					this._nodeRemoveListItem(endCon);
				}

				continue;
			}

			this._nodeRemoveListItem(item);
		}

		const endUl = domUtils.getParentElement(endCon, 'ul');
		const startLi = domUtils.getParentElement(startCon, 'li');
		if (endUl && startLi && startLi.contains(endUl)) {
			container = endUl.previousSibling;
			offset = container.textContent.length;
		} else {
			container = endCon && endCon.parentNode ? endCon : startCon && startCon.parentNode ? startCon : range.endContainer || range.startContainer;
			if (isStartEdge || isEndEdge) {
				if (isEndEdge) {
					if (container.nodeType === 1 && container.childNodes.length === 0) {
						container.appendChild(domUtils.createElement('BR'));
						offset = 1;
					} else {
						offset = container.textContent.length;
					}
				} else {
					offset = 0;
				}
			}
		}

		if (!this.format.getLine(container) && !(startCon && startCon.parentNode)) {
			if (endNextEl) {
				container = endNextEl;
				offset = 0;
			} else if (startPrevEl) {
				container = startPrevEl;
				offset = 1;
			}
		}

		if (!domUtils.isWysiwygFrame(container) && container.childNodes.length === 0) {
			const rc = this.nodeTransform.removeAllParents(container, null, null);
			if (rc) container = rc.sc || rc.ec || this.editor.frameContext.get('wysiwyg');
		}

		// set range
		this.selection.setRange(container, offset, container, offset);

		return {
			container,
			offset,
			prevContainer,
			commonCon
		};
	},

	/**
	 * @description Gets the current content
	 * @param {object} [options] Options
	 * @param {boolean} [options.withFrame=false] Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
	 * Ignored for targetOptions.get('iframe_fullPage') is true.
	 * @param {boolean} [options.includeFullPage=false] Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @param {number|Array.<number>} [options.rootKey=null] Root index
	 * @returns {string|Array.<string>}
	 */
	get({ withFrame, includeFullPage, rootKey } = {}) {
		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		const prevrootKey = this.status.rootKey;
		const resultValue = {};
		for (let i = 0, len = rootKey.length, r; i < len; i++) {
			this.editor.changeFrameContext(rootKey[i]);

			const fc = this.editor.frameContext;
			const renderHTML = domUtils.createElement('DIV', null, this._convertToCode(fc.get('wysiwyg'), true));
			const editableEls = domUtils.getListChildren(renderHTML, (current) => current.hasAttribute('contenteditable'));

			for (let j = 0, jlen = editableEls.length; j < jlen; j++) {
				editableEls[j].removeAttribute('contenteditable');
			}

			const content = renderHTML.innerHTML;
			if (this.editor.frameOptions.get('iframe_fullPage')) {
				if (includeFullPage) {
					const attrs = domUtils.getAttributesToString(fc.get('_wd').body, ['contenteditable']);
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
	},

	/**
	 * @description Sets the HTML string
	 * @param {string} html HTML string
	 * @param {object} [options] Options
	 * @param {number|Array.<number>} [options.rootKey=null] Root index
	 */
	set(html, { rootKey } = {}) {
		this.selection.removeRange();
		const convertValue = html === null || html === undefined ? '' : this.clean(html, { forceFormat: true, whitelist: null, blacklist: null });

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.editor.changeFrameContext(rootKey[i]);

			if (!this.editor.frameContext.get('isCodeView')) {
				this.editor.frameContext.get('wysiwyg').innerHTML = convertValue;
				this.editor._resetComponents();
				this.history.push(false, rootKey[i]);
			} else {
				const value = this._convertToCode(convertValue, false);
				this.viewer._setCodeView(value);
			}
		}
	},

	/**
	 * @description Add content to the end of content.
	 * @param {string} html Content to Input
	 * @param {object} [options] Options
	 * @param {number|Array.<number>} [options.rootKey=null] Root index
	 */
	add(html, { rootKey } = {}) {
		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.editor.changeFrameContext(rootKey[i]);
			const convertValue = this.clean(html, { forceFormat: true, whitelist: null, blacklist: null });

			if (!this.editor.frameContext.get('isCodeView')) {
				const temp = domUtils.createElement('DIV', null, convertValue);
				const children = temp.children;
				const len = children.length;
				for (let j = 0; j < len; j++) {
					if (!children[j]) continue;
					this.editor.frameContext.get('wysiwyg').appendChild(children[j]);
				}
				this.history.push(false, rootKey[i]);
				this.selection.scrollTo(children[len - 1]);
			} else {
				this.viewer._setCodeView(this.viewer._getCodeView() + '\n' + this._convertToCode(convertValue, false));
			}
		}
	},

	/**
	 * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "iframe_fullPage" option.
	 * @param {object} ctx { head: HTML string, body: HTML string}
	 * @param {object} [options] Options
	 * @param {number|Array.<number>} [options.rootKey=null] Root index
	 */
	setFullPage(ctx, { rootKey } = {}) {
		if (!this.editor.frameOptions.get('iframe')) return false;

		if (!rootKey) rootKey = [this.status.rootKey];
		else if (!Array.isArray(rootKey)) rootKey = [rootKey];

		for (let i = 0; i < rootKey.length; i++) {
			this.editor.changeFrameContext(rootKey[i]);
			if (ctx.head) this.editor.frameContext.get('_wd').head.innerHTML = ctx.head.replace(this.__disallowedTagsRegExp, '');
			if (ctx.body) this.editor.frameContext.get('_wd').body.innerHTML = this.clean(ctx.body, { forceFormat: true, whitelist: null, blacklist: null });
			this.editor._resetComponents();
		}
	},

	/**
	 * @description HTML code compression
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 */
	compress(html) {
		return html
			.replace(/\n/g, '')
			.replace(/(>)(?:\s+)(<)/g, '$1$2')
			.trim();
	},

	/**
	 * @description construct wysiwyg area element to html string
	 * @param {Element|string} html WYSIWYG element (this.editor.frameContext.get('wysiwyg')) or HTML string.
	 * @param {boolean} comp If true, does not line break and indentation of tags.
	 * @returns {string}
	 */
	_convertToCode(html, comp) {
		let returnHTML = '';
		const wRegExp = RegExp;
		const brReg = new wRegExp('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
		const wDoc = typeof html === 'string' ? this._d.createRange().createContextualFragment(html) : html;
		const isFormat = (current) => {
			return this.format.isLine(current) || this.component.is(current);
		};
		const brChar = comp ? '' : '\n';

		let indentSize = comp ? 0 : this.status.codeIndentSize * 1;
		indentSize = indentSize > 0 ? new Array(indentSize + 1).join(' ') : '';

		(function recursionFunc(element, indent) {
			const children = element.childNodes;
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
					if (!domUtils.isList(node.parentElement)) returnHTML += converter.htmlToEntity(/^\n+$/.test(node.data) ? '' : node.data);
					continue;
				}
				if (node.childNodes.length === 0) {
					returnHTML += (/^HR$/i.test(node.nodeName) ? brChar : '') + (/^PRE$/i.test(node.parentElement.nodeName) && /^BR$/i.test(node.nodeName) ? '' : elementIndent) + node.outerHTML + br;
					continue;
				}

				if (!node.outerHTML) {
					returnHTML += new XMLSerializer().serializeToString(node);
				} else {
					tag = node.nodeName.toLowerCase();
					tagIndent = elementIndent || nodeRegTest ? indent : '';
					returnHTML += (lineBR || (elementRegTest ? '' : br)) + tagIndent + node.outerHTML.match(wRegExp('<' + tag + '[^>]*>', 'i'))[0] + br;
					recursionFunc(node, indent + indentSize, '');
					returnHTML += (/\n$/.test(returnHTML) ? tagIndent : '') + '</' + tag + '>' + (lineBR || br || elementRegTest ? brChar : '' || /^(TH|TD)$/i.test(node.nodeName) ? brChar : '');
				}
			}
		})(wDoc, '');

		return returnHTML.trim() + brChar;
	},

	_nodeRemoveListItem(item) {
		const line = this.format.getLine(item, null);
		domUtils.removeItem(item);

		if (!domUtils.isListCell(line)) return;

		this.nodeTransform.removeAllParents(line, null, null);

		if (domUtils.isList(line?.firstChild)) {
			line.insertBefore(domUtils.createTextNode(unicode.zeroWidthSpace), line.firstChild);
		}
	},

	/**
	 * @description Recursive function  when used to place a node in "BrLine" in "html.insertNode"
	 * @param {Node} oNode Node to be inserted
	 * @returns {Node} "oNode"
	 * @private
	 */
	_setIntoFreeFormat(oNode) {
		const parentNode = oNode.parentNode;
		let oNodeChildren, lastONode;

		while (this.format.isLine(oNode) || this.format.isBlock(oNode)) {
			oNodeChildren = oNode.childNodes;
			lastONode = null;

			while (oNodeChildren[0]) {
				lastONode = oNodeChildren[0];
				if (this.format.isLine(lastONode) || this.format.isBlock(lastONode)) {
					this._setIntoFreeFormat(lastONode);
					if (!oNode.parentNode) break;
					oNodeChildren = oNode.childNodes;
					continue;
				}

				parentNode.insertBefore(lastONode, oNode);
			}

			if (oNode.childNodes.length === 0) domUtils.removeItem(oNode);
			oNode = domUtils.createElement('BR');
			parentNode.insertBefore(oNode, lastONode.nextSibling);
		}

		return oNode;
	},

	/**
	 * @description Returns HTML string according to tag type and configurati isExcludeFormat.
	 * @param {Node} node Node
	 * @param {boolean} forceFormat If true, text nodes that do not have a format node is wrapped with the format tag.
	 * @private
	 */
	_makeLine(node, forceFormat) {
		const defaultLine = this.options.get('defaultLine');
		// element
		if (node.nodeType === 1) {
			if (this.__disallowedTagNameRegExp.test(node.nodeName)) return '';
			if (domUtils.isExcludeFormat(node)) return node.outerHTML;

			const ch =
				domUtils.getListChildNodes(node, (current) => {
					return domUtils.isSpanWithoutAttr(current) && !domUtils.getParentElement(current, domUtils.isExcludeFormat);
				}) || [];
			for (let i = ch.length - 1; i >= 0; i--) {
				ch[i].outerHTML = ch[i].innerHTML;
			}

			if (
				!forceFormat ||
				this.format.isLine(node) ||
				this.format.isBlock(node) ||
				this.component.is(node) ||
				domUtils.isMedia(node) ||
				domUtils.isFigure(node) ||
				(domUtils.isAnchor(node) && domUtils.isMedia(node.firstElementChild))
			) {
				return domUtils.isSpanWithoutAttr(node) ? node.innerHTML : node.outerHTML;
			} else {
				return '<' + defaultLine + '>' + (domUtils.isSpanWithoutAttr(node) ? node.innerHTML : node.outerHTML) + '</' + defaultLine + '>';
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
		if (node.nodeType === 8 && this._allowHTMLComment) {
			return '<!--' + node.textContent.trim() + '-->';
		}

		return '';
	},

	/**
	 * @description Fix tags that do not fit the editor format.
	 * @param {Element} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
	 * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist
	 * @param {RegExp} htmlCheckBlacklistRegExp Editor tags blacklist
	 * @param {boolean} tagFilter Tag filter option
	 * @param {boolean} formatFilter Format filter option
	 * @param {boolean} classFilter Class name filter option
	 * @param {boolean} _freeCodeViewMode Enforces strict HTML validation based on the editor`s policy
	 * @private
	 */
	_consistencyCheckOfHTML(documentFragment, htmlCheckWhitelistRegExp, htmlCheckBlacklistRegExp, tagFilter, formatFilter, classFilter, _freeCodeViewMode) {
		const removeTags = [],
			emptyTags = [],
			wrongList = [],
			withoutFormatCells = [];

		// wrong position
		const wrongTags = domUtils.getListChildNodes(documentFragment, (current) => {
			if (formatFilter && current.nodeType !== 1) {
				if (domUtils.isList(current.parentElement)) removeTags.push(current);
				return false;
			}

			// tag filter
			if (tagFilter) {
				// white list
				if (htmlCheckBlacklistRegExp.test(current.nodeName) || (!htmlCheckWhitelistRegExp.test(current.nodeName) && current.childNodes.length === 0 && domUtils.isExcludeFormat(current))) {
					removeTags.push(current);
					return false;
				}
			}

			const nrtag = !domUtils.getParentElement(current, domUtils.isExcludeFormat);

			// formatFilter
			if (formatFilter) {
				// empty tags
				if (
					!domUtils.isTableElements(current) &&
					!domUtils.isListCell(current) &&
					!domUtils.isAnchor(current) &&
					(this.format.isLine(current) || this.format.isBlock(current) || this.format.isTextStyleNode(current)) &&
					current.childNodes.length === 0 &&
					nrtag
				) {
					emptyTags.push(current);
					return false;
				}

				// wrong list
				if (domUtils.isList(current.parentNode) && !domUtils.isList(current) && !domUtils.isListCell(current)) {
					wrongList.push(current);
					return false;
				}

				// table cells
				if (domUtils.isTableCell(current)) {
					const fel = current.firstElementChild;
					if (!this.format.isLine(fel) && !this.format.isBlock(fel) && !this.component.is(fel)) {
						withoutFormatCells.push(current);
						return false;
					}
				}
			}

			// class filter
			if (classFilter) {
				if (nrtag && current.className) {
					const className = new Array(current.classList).map(this._isAllowedClassName).join(' ').trim();
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
				((domUtils.isListCell(current) && !domUtils.isList(current.parentNode)) ||
					((this.format.isLine(current) || this.component.is(current)) && !this.format.isBlock(current.parentNode) && !domUtils.getParentElement(current, this.component.is.bind(this.component))));

			return result;
		});

		for (let i = 0, len = removeTags.length; i < len; i++) {
			domUtils.removeItem(removeTags[i]);
		}

		const checkTags = [];
		for (let i = 0, len = wrongTags.length, t, p; i < len; i++) {
			t = wrongTags[i];
			p = t.parentNode;
			if (!p || !p.parentNode) continue;

			if (domUtils.getParentElement(t, domUtils.isListCell)) {
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
			if (domUtils.isZeroWith(t.textContent.trim())) {
				domUtils.removeItem(t);
			}
		}

		for (let i = 0, len = emptyTags.length; i < len; i++) {
			domUtils.removeItem(emptyTags[i]);
		}

		for (let i = 0, len = wrongList.length, t, tp, children, p; i < len; i++) {
			t = wrongList[i];
			p = t.parentNode;
			if (!p) continue;

			tp = domUtils.createElement('LI');

			if (this.format.isLine(t)) {
				children = t.childNodes;
				while (children[0]) {
					tp.appendChild(children[0]);
				}
				p.insertBefore(tp, t);
				domUtils.removeItem(t);
			} else {
				t = t.nextSibling;
				tp.appendChild(wrongList[i]);
				p.insertBefore(tp, t);
			}
		}

		for (let i = 0, len = withoutFormatCells.length, t, f; i < len; i++) {
			t = withoutFormatCells[i];
			f = domUtils.createElement('DIV');
			f.innerHTML = t.textContent.trim().length === 0 && t.children.length === 0 ? '<br>' : t.innerHTML;
			t.innerHTML = f.outerHTML;
		}
	},

	/**
	 * @description Removes attribute values such as style and converts tags that do not conform to the "html5" standard.
	 * @param {string} html HTML string
	 * @returns {string} HTML string
	 * @private
	 */
	_styleNodeConvertor(html) {
		if (!this._disallowedStyleNodesRegExp) return html;

		const ec = this.options.get('_defaultStyleTagMap');
		return html.replace(this._disallowedStyleNodesRegExp, (m, t, n, p) => {
			return t + (typeof ec[n] === 'string' ? ec[n] : n) + (p ? ' ' + p : '');
		});
	},

	/**
	 * @description Determines if formatting is required and returns a domTree
	 * @param {Element} dom documentFragment
	 * @returns {Element}
	 * @private
	 */
	_editFormat(dom) {
		let value = '',
			f;
		const tempTree = dom.childNodes;

		for (let i = 0, len = tempTree.length, n; i < len; i++) {
			n = tempTree[i];
			if (this.__allowedTagNameRegExp.test(n.nodeName)) {
				value += n.outerHTML;
				continue;
			}

			if (n.nodeType === 8) {
				value += '<!-- ' + n.textContent + ' -->';
			} else if (!this.format.isLine(n) && !this.format.isBlock(n) && !this.component.is(n) && !/meta/i.test(n.nodeName) && !domUtils.isExcludeFormat(n)) {
				if (!f) f = domUtils.createElement(this.options.get('defaultLine'));
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
	},

	_convertListCell(domTree) {
		let html = '';

		for (let i = 0, len = domTree.length, node; i < len; i++) {
			node = domTree[i];
			if (node.nodeType === 1) {
				if (domUtils.isList(node)) {
					html += node.innerHTML;
				} else if (domUtils.isListCell(node)) {
					html += node.outerHTML;
				} else if (this.format.isLine(node)) {
					html += '<li>' + (node.innerHTML.trim() || '<br>') + '</li>';
				} else if (this.format.isBlock(node) && !domUtils.isTableElements(node)) {
					html += this._convertListCell(node);
				} else {
					html += '<li>' + node.outerHTML + '</li>';
				}
			} else {
				html += '<li>' + (node.textContent || '<br>') + '</li>';
			}
		}

		return html;
	},

	_isFormatData(domTree) {
		let requireFormat = false;

		for (let i = 0, len = domTree.length, t; i < len; i++) {
			t = domTree[i];
			if (t.nodeType === 1 && !this.format.isTextStyleNode(t) && !domUtils.isBreak(t) && !this.__disallowedTagNameRegExp.test(t.nodeName)) {
				requireFormat = true;
				break;
			}
		}

		return requireFormat;
	},

	_cleanStyle(m, v, name) {
		let sv = (m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/) || [])[0];
		if (this._textStyleTags.includes(name) && !sv && (m.match(/<[^\s]+\s(.+)/) || [])[1]) {
			const size = (m.match(/\ssize="([^"]+)"/i) || [])[1];
			const face = (m.match(/\sface="([^"]+)"/i) || [])[1];
			const color = (m.match(/\scolor="([^"]+)"/i) || [])[1];
			if (size || face || color) {
				sv = 'style="' + (size ? 'font-size:' + numbers.get(size / 3.333, 1) + 'rem;' : '') + (face ? 'font-family:' + face + ';' : '') + (color ? 'color:' + color + ';' : '') + '"';
			}
		}

		if (sv) {
			if (!v) v = [];

			let mv;
			for (const [key, value] of this._cleanStyleRegExpMap) {
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
					const k = env.kebabToCamelCase(r[1].trim());
					const cs = this.editor.frameContext.get('wwComputedStyle')[k]?.replace(/"/g, '');
					const c = r[3].trim();
					switch (k) {
						case 'fontFamily':
							if (!this.plugins.font || !this.plugins.font.fontArray.includes(c)) continue;
							break;
						case 'fontSize':
							if (!this.plugins.fontSize) continue;
							if (!this.fontSizeUnitRegExp.test(r[0])) {
								r[0] = r[0].replace((r[0].match(/:\s*([^;]+)/) || [])[1], converter.fontSize.bind(null, this.options.get('fontSizeUnits')[0]));
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
	},

	/**
	 * @description Delete disallowed tags
	 * @param {string} html HTML string
	 * @returns {string}
	 * @private
	 */
	_deleteDisallowedTags(html, whitelistRegExp, blacklistRegExp) {
		if (whitelistRegExp.test('<font>')) {
			html = html.replace(/(<\/?)font(\s?)/gi, '$1span$2');
		}

		return html.replace(whitelistRegExp, '').replace(blacklistRegExp, '');
	},

	_checkDuplicateNode(oNode, parentNode) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const inst = this;
		(function recursionFunc(current) {
			inst._dupleCheck(current, parentNode);
			const childNodes = current.childNodes;
			for (let i = 0, len = childNodes.length; i < len; i++) {
				recursionFunc(childNodes[i]);
			}
		})(oNode);
	},

	_dupleCheck(oNode, parentNode) {
		if (!this.format.isTextStyleNode(oNode)) return;

		const oStyles = (oNode.style.cssText.match(/[^;]+;/g) || []).map(function (v) {
			return v.trim();
		});
		const nodeName = oNode.nodeName;
		if (/^span$/i.test(nodeName) && oStyles.length === 0) return oNode;

		const inst = this.format;
		let duple = false;
		(function recursionFunc(ancestor) {
			if (domUtils.isWysiwygFrame(ancestor) || !inst.isTextStyleNode(ancestor)) return;
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
			if (!oNode.attributes.length) {
				oNode.setAttribute('data-duple', 'true');
			}
		}

		return oNode;
	},

	constructor: HTML
};

/**
 * @description Tag and tag attribute check RegExp function.
 * @param {string} m RegExp value
 * @param {string} t RegExp value
 * @returns {string}
 * @private
 */
function CleanElements(attrFilter, styleFilter, m, t) {
	if (/^<[a-z0-9]+:[a-z0-9]+/i.test(m)) return m;

	let v = null;
	const tagName = t.match(/(?!<)[a-zA-Z0-9-]+/)[0].toLowerCase();

	if (attrFilter) {
		// blacklist
		const bAttr = this._attributeBlacklist[tagName];
		m = m.replace(/\s(?:on[a-z]+)\s*=\s*(")[^"]*\1/gi, '');
		if (bAttr) m = m.replace(bAttr, '');
		else m = m.replace(this._attributeBlacklistRegExp, '');

		// whitelist
		const wAttr = this._attributeWhitelist[tagName];
		if (wAttr) v = m.match(wAttr);
		else v = m.match(this._attributeWhitelistRegExp);
	}

	if (!styleFilter) return m;

	// attribute
	if (tagName === 'a') {
		const sv = m.match(/(?:(?:id|name)\s*=\s*(?:"|')[^"']*(?:"|'))/g);
		if (sv) {
			if (!v) v = [];
			v.push(sv[0]);
		}
	} else if (!v || !/style=/i.test(v.toString())) {
		if (this._textStyleTags.includes(tagName)) {
			v = this._cleanStyle(m, v, tagName);
		} else if (this.format.isLine(tagName)) {
			v = this._cleanStyle(m, v, 'line');
		} else if (this._cleanStyleTagKeyRegExp.test(tagName)) {
			v = this._cleanStyle(m, v, tagName);
		}
	}

	// figure
	if (domUtils.isMedia(tagName) || domUtils.isFigure(tagName)) {
		const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
		if (!v) v = [];
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

function GetRegList(str, str2) {
	return !str ? '^' : str === '*' ? '[a-z-]+' : !str2 ? str : str + '|' + str2;
}

export default HTML;
