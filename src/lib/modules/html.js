/**
 * @fileoverview Char class
 * @author Yi JiHong.
 */

import CoreInterface from '../../interface/_core';
import { domUtils, converter, numbers, unicode, global } from '../../helper';

const HTML = function (editor) {
	CoreInterface.call(this, editor);

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

	// set disallow text nodes
	const options = this.options;
	const _w = this._w;
	const disallowStyleNodes = _w.Object.keys(options._styleNodeMap);
	const allowStyleNodes = !options.elementWhitelist
		? []
		: options.elementWhitelist.split('|').filter(function (v) {
				return /b|i|ins|s|strike/i.test(v);
		  });
	for (let i = 0; i < allowStyleNodes.length; i++) {
		disallowStyleNodes.splice(disallowStyleNodes.indexOf(allowStyleNodes[i].toLowerCase()), 1);
	}
	this._disallowedStyleNodesRegExp = disallowStyleNodes.length === 0 ? null : new _w.RegExp('(<\\/?)(' + disallowStyleNodes.join('|') + ')\\b\\s*([^>^<]+)?\\s*(?=>)', 'gi');

	// whitelist
	// tags
	const defaultAttr = options._defaultAttributeWhitelist;
	this._allowHTMLComment = options._editorElementWhitelist.indexOf('//') > -1 || options._editorElementWhitelist === '*';
	// html check
	this._htmlCheckWhitelistRegExp = new _w.RegExp('^(' + GetRegList(options._editorElementWhitelist.replace('|//', ''), '') + ')$', 'i');
	this._htmlCheckBlacklistRegExp = new _w.RegExp('^(' + (options.elementBlacklist || '^') + ')$', 'i');
	// tags
	this._elementWhitelistRegExp = converter.createElementWhitelist(GetRegList(options._editorElementWhitelist.replace('|//', '|<!--|-->'), ''));
	this._elementBlacklistRegExp = converter.createElementBlacklist(options.elementBlacklist.replace('|//', '|<!--|-->'));
	// attributes
	const regEndStr = '\\s*=\\s*(")[^"]*\\1';
	const _wAttr = options.attributeWhitelist;
	let tagsAttr = {};
	let allAttr = '';
	if (!!_wAttr) {
		for (let k in _wAttr) {
			if (!_wAttr.hasOwnProperty(k) || /^on[a-z]+$/i.test(_wAttr[k])) continue;
			if (k === 'all') {
				allAttr = GetRegList(_wAttr[k], defaultAttr);
			} else {
				tagsAttr[k] = new _w.RegExp('\\s(?:' + GetRegList(_wAttr[k], '') + ')' + regEndStr, 'ig');
			}
		}
	}

	this._attributeWhitelistRegExp = new _w.RegExp('\\s(?:' + (allAttr || defaultAttr) + ')' + regEndStr, 'ig');
	this._attributeWhitelist = tagsAttr;

	// blacklist
	const _bAttr = options.attributeBlacklist;
	tagsAttr = {};
	allAttr = '';
	if (!!_bAttr) {
		for (let k in _bAttr) {
			if (!_bAttr.hasOwnProperty(k)) continue;
			if (k === 'all') {
				allAttr = GetRegList(_bAttr[k], '');
			} else {
				tagsAttr[k] = new _w.RegExp('\\s(?:' + GetRegList(_bAttr[k], '') + ')' + regEndStr, 'ig');
			}
		}
	}

	this._attributeBlacklistRegExp = new _w.RegExp('\\s(?:' + (allAttr || '^') + ')' + regEndStr, 'ig');
	this._attributeBlacklist = tagsAttr;
};

HTML.prototype = {
	/**
	 * @description Gets the clean HTML code for editor
	 * @param {string} html HTML string
	 * @param {boolean} requireFormat If true, text nodes that do not have a format node is wrapped with the format tag.
	 * @param {string|RegExp|null} whitelist Regular expression of allowed tags.
	 * RegExp object is create by helper.converter.createElementWhitelist method.
	 * @param {string|RegExp|null} blacklist Regular expression of disallowed tags.
	 * RegExp object is create by helper.converter.createElementBlacklist method.
	 * @returns {string}
	 */
	clean: function (html, requireFormat, whitelist, blacklist) {
		html = DeleteDisallowedTags(this.editor._parser.parseFromString(html, 'text/html').body.innerHTML, this._elementWhitelistRegExp, this._elementBlacklistRegExp).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, CleanElements.bind(this, true));
		const dom = this._d.createRange().createContextualFragment(html, true);

		try {
			this._consistencyCheckOfHTML.call(this, dom, this._htmlCheckWhitelistRegExp, this._htmlCheckBlacklistRegExp, true);
		} catch (error) {
			console.warn('[SUNEDITOR.html.clean.fail] ' + error);
		}

		if (this._managedElementInfo && this._managedElementInfo.query) {
			const textCompList = dom.querySelectorAll(this._managedElementInfo.query);
			for (let i = 0, len = textCompList.length, initMethod, classList; i < len; i++) {
				classList = [].slice.call(textCompList[i].classList);
				for (let c = 0, cLen = classList.length; c < cLen; c++) {
					initMethod = this._managedElementInfo.map[classList[c]];
					if (initMethod) {
						initMethod(textCompList[i]);
						break;
					}
				}
			}
		}

		let domTree = dom.childNodes;
		let cleanData = '';
		const requireFormat = this._isFormatData(domTree);

		if(requireFormat) {
			domTree = this._editFormat(dom).childNodes;
		}

		for (let i = 0, len = domTree.length; i < len; i++) {
			cleanData += this._makeLine(domTree[i], requireFormat);
		}

		cleanData = this.node.removeWhiteSpace(cleanData);

		if (!cleanData) {
			cleanData = html;
		} else {
			if (whitelist) cleanData = cleanData.replace(typeof whitelist === 'string' ? converter.createElementWhitelist(whitelist) : whitelist, '');
			if (blacklist) cleanData = cleanData.replace(typeof blacklist === 'string' ? converter.createElementBlacklist(blacklist) : blacklist, '');
		}

		return this._tagConvertor(cleanData);
	},

	/**
	 * @description Insert an (HTML element / HTML string / plain string) at selection range.
	 * @param {Element|String} html HTML Element or HTML string or plain string
	 * @param {boolean} notCleaningData If true, inserts the HTML string without refining it with html.clean.
	 * @param {boolean} checkCharCount If true, if "options.charCounter_max" is exceeded when "element" is added, null is returned without addition.
	 * @param {boolean} rangeSelection If true, range select the inserted node.
	 */
	insert: function (html, notCleaningData, checkCharCount, rangeSelection) {
		if (!this.context.element.wysiwygFrame.contains(this.selection.get().focusNode)) this.editor.focus();

		if (typeof html === 'string') {
			if (!notCleaningData) html = this.clean(html, false, null, null);
			try {
				if (domUtils.isListCell(this.format.getLine(this.selection.getNode(), null))) {
					const dom = this._d.createRange().createContextualFragment(html);
					const domTree = dom.childNodes;
					if (this._isFormatData(domTree)) html = this._convertListCell(domTree);
				}

				const dom = this._d.createRange().createContextualFragment(html);
				const domTree = dom.childNodes;

				if (checkCharCount) {
					const type = this.options.charCounter_type === 'byte-html' ? 'outerHTML' : 'textContent';
					let checkHTML = '';
					for (let i = 0, len = domTree.length; i < len; i++) {
						checkHTML += domTree[i][type];
					}
					if (!this.char.check(checkHTML)) return;
				}

				let c, a, t, prev, firstCon;
				while ((c = domTree[0])) {
					if (prev && prev.nodeType === 3 && a && a.nodeType === 1 && domUtils.isBreak(c)) {
						prev = c;
						domUtils.removeItem(c);
						continue;
					}
					t = this.insertNode(c, a, false);
					a = t.container || t;
					if (!firstCon) firstCon = t;
					prev = c;
				}

				if (prev.nodeType === 3 && a.nodeType === 1) a = prev;
				const offset = a.nodeType === 3 ? t.endOffset || a.textContent.length : a.childNodes.length;
				if (rangeSelection) this.selection.setRange(firstCon.container || firstCon, firstCon.startOffset || 0, a, offset);
				else this.selection.setRange(a, offset, a, offset);
			} catch (error) {
				if (this.status.isDisabled || this.status.isReadOnly) return;
				console.warn('[SUNEDITOR.html.insert.warn] ' + error);
				this.editor.execCommand('insertHTML', false, html);
			}
		} else {
			if (this.component.is(html)) {
				this.component.insert(html, false, checkCharCount, false);
			} else {
				let afterNode = null;
				if (this.format.isLine(html) || domUtils.isMedia(html)) {
					afterNode = this.format.getLine(this.selection.getNode(), null);
				}
				this.insertNode(html, afterNode, checkCharCount);
			}
		}

		this.editor.effectNode = null;
		this.editor.focus();

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Delete selected node and insert argument value node and return.
	 * If the "afterNode" exists, it is inserted after the "afterNode"
	 * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param {Node} oNode Node to be inserted
	 * @param {Node|null} afterNode If the node exists, it is inserted after the node
	 * @param {boolean} checkCharCount If true, if "options.charCounter_max" is exceeded when "element" is added, null is returned without addition.
	 * @returns {Object|Node|null}
	 */
	insertNode: function (oNode, afterNode, checkCharCount) {
		if (this.editor.isReadOnly || (checkCharCount && !this.char.check(oNode, null))) {
			return null;
		}

		let range = this.selection.getRange();
		let line = domUtils.isListCell(range.commonAncestorContainer) ? range.commonAncestorContainer : this.format.getLine(this.selection.getNode(), null);
		let insertListCell = domUtils.isListCell(line) && (domUtils.isListCell(oNode) || domUtils.isList(oNode));

		let parentNode,
			originAfter,
			tempAfterNode,
			tempParentNode = null;
		const freeFormat = this.format.isBrLine(line);
		const isFormats = (!freeFormat && (this.format.isLine(oNode) || this.format.isBlock(oNode))) || this.component.is(oNode);

		if (insertListCell) {
			tempAfterNode = afterNode || domUtils.isList(oNode) ? line.lastChild : line.nextElementSibling;
			tempParentNode = domUtils.isList(oNode) ? line : (tempAfterNode || line).parentNode;
		}

		if (!afterNode && (isFormats || this.component.is(oNode) || domUtils.isMedia(oNode))) {
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
				const depthFormat = domUtils.getParentElement(
					container,
					function (current) {
						return this.format.isBlock(current) || domUtils.isListCell(current);
					}.bind(this)
				);
				afterNode = this.node.split(container, r.offset, !depthFormat ? 0 : domUtils.getNodeDepth(depthFormat) + 1);
				if (afterNode) {
					if (insertListCell) {
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
							let c = parentNode.childNodes[startOff];
							const focusNode = c && c.nodeType === 3 && unicode.onlyZeroWidthSpace(c) && domUtils.isBreak(c.nextSibling) ? c.nextSibling : c;
							if (focusNode) {
								if (!focusNode.nextSibling) {
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

						if (container && container.childNodes.length === 0 && isFormats) {
							if (this.format.isLine(container)) {
								container.innerHTML = '<br>';
							} else if (this.format.isBlock(container)) {
								container.innerHTML = '<' + this.options.defaultTag + '><br></' + this.options.defaultTag + '>';
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
			if (!insertListCell) {
				if (domUtils.isWysiwygFrame(afterNode) || parentNode === this.context.element.wysiwyg.parentNode) {
					parentNode = this.context.element.wysiwyg;
					afterNode = null;
				}

				if (this.format.isLine(oNode) || this.format.isBlock(oNode) || (!domUtils.isListCell(parentNode) && this.component.is(oNode))) {
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
					const fNode = domUtils.createElement(this.options.defaultTag, null, oNode);
					oNode = fNode;
				}
			}

			// insert--
			if (insertListCell) {
				if (!tempParentNode.parentNode) {
					parentNode = this.context.element.wysiwyg;
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

			parentNode.insertBefore(oNode, afterNode);

			if (insertListCell) {
				if (unicode.onlyZeroWidthSpace(line.textContent.trim())) {
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

						if (unicode.onlyZeroWidthSpace(line.textContent.trim())) {
							domUtils.removeItem(line);
						}
					}
				}
			}
		} catch (e) {
			console.warn('[SUNEDITOR.html.insertNode.warn]', e);
			parentNode.appendChild(oNode);
		} finally {
			if ((this.format.isLine(oNode) || this.component.is(oNode)) && startCon === endCon) {
				const cItem = this.format.getLine(commonCon, null);
				if (cItem && cItem.nodeType === 1 && domUtils.isEmptyLine(cItem)) {
					domUtils.removeItem(cItem);
				}
			}

			if (freeFormat && (this.format.isLine(oNode) || this.format.isBlock(oNode))) {
				oNode = this._setIntoFreeFormat(oNode);
			}

			if (!this.component.is(oNode)) {
				let offset = 1;
				if (oNode.nodeType === 3) {
					const previous = oNode.previousSibling;
					const next = oNode.nextSibling;
					const previousText = !previous || previous.nodeType === 1 || unicode.onlyZeroWidthSpace(previous) ? '' : previous.textContent;
					const nextText = !next || next.nodeType === 1 || unicode.onlyZeroWidthSpace(next) ? '' : next.textContent;

					if (previous && previousText.length > 0) {
						oNode.textContent = previousText + oNode.textContent;
						domUtils.removeItem(previous);
					}

					if (next && next.length > 0) {
						oNode.textContent += nextText;
						domUtils.removeItem(next);
					}

					const newRange = {
						container: oNode,
						startOffset: previousText.length,
						endOffset: oNode.textContent.length - nextText.length
					};

					this.selection.setRange(oNode, newRange.startOffset, oNode, newRange.endOffset);

					return newRange;
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
				}

				this.selection.setRange(oNode, offset, oNode, offset);
			}

			// history stack
			this.history.push(true);

			return oNode;
		}
	},

	/**
	 * @description Delete the selected range.
	 * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
	 * @returns {Object}
	 */
	remove: function () {
		this.selection._resetRangeToTextNode();

		const range = this.selection.getRange();
		let container,
			offset = 0;
		let startCon = range.startContainer;
		let endCon = range.endContainer;
		let startOff = range.startOffset;
		let endOff = range.endOffset;
		const commonCon = range.commonAncestorContainer.nodeType === 3 && range.commonAncestorContainer.parentNode === startCon.parentNode ? startCon.parentNode : range.commonAncestorContainer;
		if (commonCon === startCon && commonCon === endCon) {
			startCon = commonCon.children[startOff];
			endCon = commonCon.children[endOff];
			startOff = endOff = 0;
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
						offset: 0
					};
				} else if (commonCon.nodeType === 3) {
					return {
						container: commonCon,
						offset: endOff
					};
				}
				childNodes.push(commonCon);
				startCon = endCon = commonCon;
			} else {
				startCon = endCon = childNodes[0];
				if (domUtils.isBreak(startCon) || unicode.onlyZeroWidthSpace(startCon)) {
					return {
						container: domUtils.isMedia(commonCon) ? commonCon : startCon,
						offset: 0
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
		}

		if (!domUtils.isWysiwygFrame(container) && container.childNodes.length === 0) {
			const rc = this.node.removeAllParents(container, null, null);
			if (rc) container = rc.sc || rc.ec || this.context.element.wysiwyg;
		}

		// set range
		this.selection.setRange(container, offset, container, offset);
		// history stack
		this.history.push(true);

		return {
			container: container,
			offset: offset,
			prevContainer: startCon && startCon.parentNode ? startCon : null
		};
	},

	_nodeRemoveListItem: function (item) {
		const line = this.format.getLine(item, null);
		domUtils.removeItem(item);

		if (!domUtils.isListCell(line)) return;

		domUtils.removeAllParents(line, null, null);

		if (line && domUtils.isList(line.firstChild)) {
			line.insertBefore(domUtils.createTextNode(unicode.zeroWidthSpace), line.firstChild);
		}
	},

	/**
	 * @description Recursive function  when used to place a node in "BrLine" in "html.insertNode"
	 * @param {Node} oNode Node to be inserted
	 * @returns {Node} "oNode"
	 * @private
	 */
	_setIntoFreeFormat: function (oNode) {
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
	 * @description Returns HTML string according to tag type and configuration.
	 * @param {Node} node Node
	 * @param {boolean} requireFormat If true, text nodes that do not have a format node is wrapped with the format tag.
	 * @private
	 */
	_makeLine: function (node, requireFormat) {
		const defaultLineTag = this.options.defaultLineTag;
		// element
		if (node.nodeType === 1) {
			if (DisallowedElements(node)) return '';

			const ch = domUtils.getListChildNodes(node, domUtils.isSpanWithoutAttr) || [];
			for (let i = ch.length - 1; i >= 0; i--) {
				ch[i].outerHTML = ch[i].innerHTML;
			}

			if (!requireFormat || this.format.isLine(node) || this.format.isBlock(node) || this.component.is(node) || domUtils.isMedia(node) || (domUtils.isAnchor(node) && domUtils.isMedia(node.firstElementChild))) {
				return domUtils.isSpanWithoutAttr(node) ? node.innerHTML : node.outerHTML;
			} else {
				return '<' + defaultTag + '>' + (domUtils.isSpanWithoutAttr(node) ? node.innerHTML : node.outerHTML) + '</' + defaultTag + '>';
			}
		}
		// text
		if (node.nodeType === 3) {
			if (!requireFormat) return converter.htmlToEntity(node.textContent);
			const textArray = node.textContent.split(/\n/g);
			let html = '';
			for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
				text = textArray[i].trim();
				if (text.length > 0) html += '<' + defaultLineTag + '>' + converter.htmlToEntity(text) + '</' + defaultLineTag + '>';
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
	 * @description It is judged whether it is the not checking node. (class="katex", "__se__block")
	 * @param {Node} element The node to check
	 * @returns {boolean}
	 * @private
	 */
	_isNotCheckingNode: function (element) {
		return element && /katex|__se__block/.test(element.className);
	},

	/**
	 * @description Fix tags that do not fit the editor format.
	 * @param {Element} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
	 * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist
	 * @param {RegExp} htmlCheckBlacklistRegExp Editor tags blacklist
	 * @param {Boolean} lowLevelCheck Row level check
	 * @private
	 */
	_consistencyCheckOfHTML: function (documentFragment, htmlCheckWhitelistRegExp, htmlCheckBlacklistRegExp, lowLevelCheck) {
		/**
		 * It is can use ".children(domUtils.getListChildren)" to exclude text nodes, but "documentFragment.children" is not supported in IE.
		 * So check the node type and exclude the text no (current.nodeType !== 1)
		 */
		const removeTags = [],
			emptyTags = [],
			wrongList = [],
			withoutFormatCells = [];

		// wrong position
		const wrongTags = domUtils.getListChildNodes(
			documentFragment,
			function (current) {
				if (current.nodeType !== 1) {
					if (domUtils.isList(current.parentNode)) removeTags.push(current);
					return false;
				}

				// white list
				if (htmlCheckBlacklistRegExp.test(current.nodeName) || (!htmlCheckWhitelistRegExp.test(current.nodeName) && current.childNodes.length === 0 && this._isNotCheckingNode(current))) {
					removeTags.push(current);
					return false;
				}

				const nrtag = !domUtils.getParentElement(current, this._isNotCheckingNode);
				// empty tags
				if (!domUtils.isTable(current) && !domUtils.isListCell(current) && !domUtils.isAnchor(current) && (this.format.isLine(current) || this.format.isBlock(current) || this.format.isTextStyleNode(current)) && current.childNodes.length === 0 && nrtag) {
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

				const result =
					current.parentNode !== documentFragment &&
					nrtag &&
					((domUtils.isListCell(current) && !domUtils.isList(current.parentNode)) || (lowLevelCheck && (this.format.isLine(current) || this.component.is(current)) && !this.format.isBlock(current.parentNode) && !domUtils.getParentElement(current, this.component.is)));

				return result;
			}.bind(this)
		);

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
			if (unicode.onlyZeroWidthSpace(t.textContent.trim())) {
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
	 * @param {string} text
	 * @returns {string} HTML string
	 * @private
	 */
	_tagConvertor: function (text) {
		if (!this._disallowedStyleNodesRegExp) return text;

		const ec = this.options._styleNodeMap;
		return text.replace(this._disallowedStyleNodesRegExp, function (m, t, n, p) {
			return t + (typeof ec[n] === 'string' ? ec[n] : n) + (p ? ' ' + p : '');
		});
	},

	/**
	 * @description Determines if formatting is required and returns a domTree
	 * @param {Element} dom documentFragment
	 * @returns {Element}
	 * @private
	 */
	_editFormat: function (dom) {
		let value = '',
			f;
		const tempTree = dom.childNodes;
		for (let i = 0, len = tempTree.length, n; i < len; i++) {
			n = tempTree[i];
			if (!this.format.isLine(n) && !this.format.isBlock(n) && !this.component.is(n) && !/meta/i.test(n.nodeName)) {
				if (!f) f = domUtils.createElement(options.defaultTag);
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

	_convertListCell: function (domTree) {
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
				} else if (this.format.isBlock(node) && !domUtils.isTable(node)) {
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

	_isFormatData: function (domTree) {
		let requireFormat = false;

		for (let i = 0, len = domTree.length, t; i < len; i++) {
			t = domTree[i];
			if (t.nodeType === 1 && !this.format.isTextStyleNode(t) && !domUtils.isBreak(t) && !DisallowedElements(t)) {
				requireFormat = true;
				break;
			}
		}

		return requireFormat;
	},

	constructor: HTML
};

/**
 *
 * @param {Element} element Rmove the disallowed tag.
 * @returns {boolean}
 * @private
 */
function DisallowedElements(element) {
	return /^(meta|script|link|style|[a-z]+\:[a-z]+)$/i.test(element.nodeName);
}

/**
 * @description Delete disallowed tags
 * @param {string} html HTML string
 * @returns {string}
 * @private
 */
function DeleteDisallowedTags(html, whitelistRegExp, blacklistRegExp) {
	return html
		.replace(/\n/g, '')
		.replace(/<(script|style)[\s\S]*>[\s\S]*<\/(script|style)>/gi, '')
		.replace(/<[a-z0-9]+\:[a-z0-9]+[^>^\/]*>[^>]*<\/[a-z0-9]+\:[a-z0-9]+>/gi, '')
		.replace(whitelistRegExp, '')
		.replace(blacklistRegExp, '');
}

/**
 * @description Tag and tag attribute check RegExp function.
 * @param {boolean} lowLevelCheck Low level check
 * @param {string} m RegExp value
 * @param {string} t RegExp value
 * @returns {string}
 * @private
 */
function CleanElements(lowLevelCheck, m, t) {
	if (/^<[a-z0-9]+\:[a-z0-9]+/i.test(m)) return m;

	let v = null;
	const tagName = t.match(/(?!<)[a-zA-Z0-9\-]+/)[0].toLowerCase();

	// blacklist
	const bAttr = this._attributeBlacklist[tagName];
	if (bAttr) m = m.replace(bAttr, '');
	else m = m.replace(this._attributeBlacklistRegExp, '');

	// whitelist
	const wAttr = this._attributeWhitelist[tagName];
	if (wAttr) v = m.match(wAttr);
	else v = m.match(this._attributeWhitelistRegExp);

	// anchor
	if (!lowLevelCheck || /<a\b/i.test(t)) {
		const sv = m.match(/(?:(?:id|name)\s*=\s*(?:"|')[^"']*(?:"|'))/g);
		if (sv) {
			if (!v) v = [];
			v.push(sv[0]);
		}
	}

	// span
	if ((!lowLevelCheck || /<span/i.test(t)) && (!v || !/style=/i.test(v.toString()))) {
		const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
		if (sv) {
			if (!v) v = [];
			const style = sv[0].replace(/&quot;/g, '').match(/\s*(font-family|font-size|color|background-color)\s*:[^;]+(?!;)*/gi);
			if (style) {
				const allowedStyle = [];
				for (let i = 0, len = style.length, r; i < len; i++) {
					r = style[i].match(/(.+)(:)([^:]+$)/);
					if (r && !/inherit|initial/i.test(r[3])) {
						const k = global.kebabToCamelCase(r[1].trim());
						const v = this.wwComputedStyle[k].replace(/"/g, '');
						const c = r[3].trim();
						switch (k) {
							case 'fontFamily':
								if (this.options.plugins.font ? this.options.font.indexOf(c) === -1 : true) continue;
								break;
							case 'fontSize':
								if (!this.options.plugins.fontSize) continue;
								break;
							case 'color':
								if (!this.options.plugins.fontColor) continue;
								break;
							case 'backgroundColor':
								if (!this.options.plugins.hiliteColor) continue;
								break;
						}

						if (v !== c) {
							allowedStyle.push(r[0]);
						}
					}
				}
				if (allowedStyle.length > 0) v.push('style="' + allowedStyle.join(';') + '"');
			}
		}
	}

	// img
	if (/<img/i.test(t)) {
		let w = '',
			h = '';
		const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
		if (!v) v = [];
		if (sv) {
			w = sv[0].match(/width:(.+);/);
			w = numbers.get(w ? w[1] : '', -1) || '';
			h = sv[0].match(/height:(.+);/);
			h = numbers.get(h ? h[1] : '', -1) || '';
		}

		if (!w || !h) {
			const avw = m.match(/width\s*=\s*((?:"|')[^"']*(?:"|'))/);
			const avh = m.match(/height\s*=\s*((?:"|')[^"']*(?:"|'))/);
			if (avw || avh) {
				w = !w ? numbers.get(avw ? avw[1] : '') || '' : w;
				h = !h ? numbers.get(avh ? avh[1] : '') || '' : h;
			}
		}
		v.push('data-origin="' + (w + ',' + h) + '"');
	}

	if (v) {
		for (let i = 0, len = v.length; i < len; i++) {
			if (lowLevelCheck && /^class="(?!(__se__|se-|katex))/.test(v[i].trim())) continue;
			t += ' ' + (/^(?:href|src)\s*=\s*('|"|\s)*javascript\s*\:/i.test(v[i].trim()) ? '' : v[i]);
		}
	}

	return t;
}

function GetRegList(str, str2) {
	return !str ? '^' : str === '*' ? '[a-z-]+' : !str2 ? str : str + '|' + str2;
}

export default HTML;
