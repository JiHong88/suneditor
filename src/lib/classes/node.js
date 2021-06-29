/**
 * @fileoverview Event class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Node = function (editor) {
	CoreInterface.call(this, editor);
};

Node.prototype = {
	/**
	 * @description Split all tags based on "baseNode"
	 * Returns the last element of the splited tag.
	 * @param {Node} baseNode Element or text node on which to base
	 * @param {Number|null} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
	 * @param {Number} depth The nesting depth of the element being split. (default: 0)
	 * @returns {Element}
	 */
	split: function (baseNode, offset, depth) {
		const bp = baseNode.parentNode;
		let index = 0,
			newEl,
			children,
			temp;
		let next = true;
		if (!depth || depth < 0) depth = 0;

		if (baseNode.nodeType === 3) {
			index = util.getPositionIndex(baseNode);
			if (offset >= 0) {
				baseNode.splitText(offset);
				const after = util.getNodeFromPath([index + 1], bp);
				if (util.onlyZeroWidthSpace(after)) after.data = util.zeroWidthSpace;
			}
		} else if (baseNode.nodeType === 1) {
			if (!baseNode.previousSibling) {
				if (util.getElementDepth(baseNode) === depth) next = false;
			} else {
				baseNode = baseNode.previousSibling;
			}
		}

		let depthEl = baseNode;
		while (util.getElementDepth(depthEl) > depth) {
			index = util.getPositionIndex(depthEl) + 1;
			depthEl = depthEl.parentNode;

			temp = newEl;
			newEl = depthEl.cloneNode(false);
			children = depthEl.childNodes;

			if (temp) {
				if (util.isListCell(newEl) && util.isList(temp) && temp.firstElementChild) {
					newEl.innerHTML = temp.firstElementChild.innerHTML;
					util.removeItem(temp.firstElementChild);
					if (temp.children.length > 0) newEl.appendChild(temp);
				} else {
					newEl.appendChild(temp);
				}
			}

			while (children[index]) {
				newEl.appendChild(children[index]);
			}
		}

		if (depthEl.childNodes.length <= 1 && (!depthEl.firstChild || depthEl.firstChild.textContent.length === 0))
			depthEl.innerHTML = "<br>";

		const pElement = depthEl.parentNode;
		if (next) depthEl = depthEl.nextSibling;
		if (!newEl) return depthEl;

		this.mergeSameTags(newEl, null, false);
		this.mergeNestedTags(newEl, util.isList);

		if (newEl.childNodes.length > 0) pElement.insertBefore(newEl, depthEl);
		else newEl = depthEl;

		if (bp.childNodes.length === 0) util.removeItem(bp);

		return newEl;
	},

	/**
	 * @description Use with "npdePath (util.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
	 * If "offset" has been changed, it will return as much "offset" as it has been modified.
	 * An array containing change offsets is returned in the order of the "nodePathArray" array.
	 * @param {Element} element Element
	 * @param {Array|null} nodePathArray Array of NodePath object ([util.getNodePath(), ..])
	 * @param {Boolean} onlyText If true, non-text nodes like 'span', 'strong'.. are ignored.
	 * @returns {Array} [offset, ..]
	 */
	mergeSameTags: function (element, nodePathArray, onlyText) {
		const inst = this;
		const nodePathLen = nodePathArray ? nodePathArray.length : 0;
		let offsets = null;

		if (nodePathLen) {
			offsets = this._w.Array.apply(null, new this._w.Array(nodePathLen)).map(
				this._w.Number.prototype.valueOf,
				0
			);
		}

		(function recursionFunc(current, depth, depthIndex) {
			const children = current.childNodes;

			for (let i = 0, len = children.length, child, next; i < len; i++) {
				child = children[i];
				next = children[i + 1];
				if (!child) break;
				if (
					(onlyText && util._isIgnoreNodeChange(child)) ||
					(!onlyText &&
						(dom.isTable(child) ||
							dom.isListCell(child) ||
							(inst.format.isFormatElement(child) && !inst.format.isFreeFormatElement(child))))
				) {
					if (dom.isTable(child) || dom.isListCell(child)) {
						recursionFunc(child, depth + 1, i);
					}
					continue;
				}
				if (len === 1 && current.nodeName === child.nodeName && current.parentNode) {
					// update nodePath
					if (nodePathLen) {
						let path, c, p, cDepth, spliceDepth;
						for (let n = 0; n < nodePathLen; n++) {
							path = nodePathArray[n];
							if (path && path[depth] === i) {
								(c = child), (p = current), (cDepth = depth), (spliceDepth = true);
								while (cDepth >= 0) {
									if (util.getArrayIndex(p.childNodes, c) !== path[cDepth]) {
										spliceDepth = false;
										break;
									}
									c = child.parentNode;
									p = c.parentNode;
									cDepth--;
								}
								if (spliceDepth) {
									path.splice(depth, 1);
									path[depth] = i;
								}
							}
						}
					}

					// merge tag
					dom.copyTagAttributes(child, current);
					current.parentNode.insertBefore(child, current);
					dom.removeItem(current);
				}
				if (!next) {
					if (child.nodeType === 1) recursionFunc(child, depth + 1, i);
					break;
				}

				if (child.nodeName === next.nodeName && dom.isSameAttributes(child, next) && child.href === next.href) {
					const childs = child.childNodes;
					let childLength = 0;
					for (let n = 0, nLen = childs.length; n < nLen; n++) {
						if (childs[n].textContent.length > 0) childLength++;
					}

					const l = child.lastChild;
					const r = next.firstChild;
					let addOffset = 0;
					if (l && r) {
						const textOffset = l.nodeType === 3 && r.nodeType === 3;
						addOffset = l.textContent.length;
						let tempL = l.previousSibling;
						while (tempL && tempL.nodeType === 3) {
							addOffset += tempL.textContent.length;
							tempL = tempL.previousSibling;
						}

						if (
							childLength > 0 &&
							l.nodeType === 3 &&
							r.nodeType === 3 &&
							(l.textContent.length > 0 || r.textContent.length > 0)
						)
							childLength--;

						if (nodePathLen) {
							let path = null;
							for (let n = 0; n < nodePathLen; n++) {
								path = nodePathArray[n];
								if (path && path[depth] > i) {
									if (depth > 0 && path[depth - 1] !== depthIndex) continue;

									path[depth] -= 1;
									if (path[depth + 1] >= 0 && path[depth] === i) {
										path[depth + 1] += childLength;
										if (textOffset) {
											if (l && l.nodeType === 3 && r && r.nodeType === 3) {
												offsets[n] += addOffset;
											}
										}
									}
								}
							}
						}
					}

					if (child.nodeType === 3) {
						addOffset = child.textContent.length;
						child.textContent += next.textContent;
						if (nodePathLen) {
							let path = null;
							for (let n = 0; n < nodePathLen; n++) {
								path = nodePathArray[n];
								if (path && path[depth] > i) {
									if (depth > 0 && path[depth - 1] !== depthIndex) continue;

									path[depth] -= 1;
									if (path[depth + 1] >= 0 && path[depth] === i) {
										path[depth + 1] += childLength;
										offsets[n] += addOffset;
									}
								}
							}
						}
					} else {
						child.innerHTML += next.innerHTML;
					}

					dom.removeItem(next);
					i--;
				} else if (child.nodeType === 1) {
					recursionFunc(child, depth + 1, i);
				}
			}
		})(element, 0, 0);

		return offsets;
	},

	/**
	 * @description Remove nested tags without other child nodes.
	 * @param {Element} element Element object
	 * @param {Function|String|null} validation Validation function / String("tag1|tag2..") / If null, all tags are applicable.
	 */
	mergeNestedTags: function (element, validation) {
		if (typeof validation === "string") {
			validation = function (current) {
				return this.test(current.tagName);
			}.bind(new this._w.RegExp("^(" + (validation ? validation : ".+") + ")$", "i"));
		} else if (typeof validation !== "function") {
			validation = function () {
				return true;
			};
		}

		(function recursionFunc(current) {
			let children = current.children;
			if (children.length === 1 && children[0].nodeName === current.nodeName && validation(current)) {
				const temp = children[0];
				children = temp.children;
				while (children[0]) {
					current.appendChild(children[0]);
				}
				current.removeChild(temp);
			}

			for (let i = 0, len = current.children.length; i < len; i++) {
				recursionFunc(current.children[i]);
			}
		})(element);
	},

	/**
	 * @description Delete argumenu value element
	 * @param {Node} item Node to be remove
	 */
	removeItem: function (item) {
		if (!item) return;
		if (typeof item.remove === "function") item.remove();
		else if (item.parentNode) item.parentNode.removeChild(item);
	},

	/**
	 * @description Delete itself and all parent nodes that match the condition.
	 * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param {Node} item Node to be remove
	 * @param {Function|null} validation Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param {Element|null} stopParent Stop when the parent node reaches stopParent
	 * @returns {Object|null} {sc: previousSibling, ec: nextSibling}
	 */
	removeItemAllParents: function (item, validation, stopParent) {
		if (!item) return null;
		let cc = null;
		if (!validation) {
			validation = function (current) {
				if (current === stopParent || this.isComponent(current)) return false;
				const text = current.textContent.trim();
				return text.length === 0 || /^(\n|\u200B)+$/.test(text);
			}.bind(util);
		}

		(function recursionFunc(element) {
			if (!util.isWysiwygDiv(element)) {
				const parent = element.parentNode;
				if (parent && validation(element)) {
					cc = {
						sc: element.previousElementSibling,
						ec: element.nextElementSibling
					};
					util.removeItem(element);
					recursionFunc(parent);
				}
			}
		})(item);

		return cc;
	},

	/**
	 * @description Delete a empty child node of argument element
	 * @param {Element} element Element node
	 * @param {Node|null} notRemoveNode Do not remove node
	 */
	removeEmptyNode: function (element, notRemoveNode) {
		if (notRemoveNode) {
			notRemoveNode = util.getParentElement(notRemoveNode, function (current) {
				return element === current.parentElement;
			});
		}

		(function recursionFunc(current) {
			if (util._notTextNode(current) || current === notRemoveNode || dom.isNonEditable(current)) return 0;
			if (
				current !== element &&
				util.onlyZeroWidthSpace(current.textContent) &&
				(!current.firstChild || !dom.isBreak(current.firstChild)) &&
				!current.querySelector(_allowedEmptyNodeList)
			) {
				if (current.parentNode) {
					current.parentNode.removeChild(current);
					return -1;
				}
			} else {
				const children = current.children;
				for (let i = 0, len = children.length, r = 0; i < len; i++) {
					if (!children[i + r] || util.isComponent(children[i + r])) continue;
					r += recursionFunc(children[i + r]);
				}
			}

			return 0;
		})(element);

		if (element.childNodes.length === 0) element.innerHTML = "<br>";
	},

	/**
	 * @description Remove whitespace between tags in HTML string.
	 * @param {String} html HTML string
	 * @returns {String}
	 */
	htmlRemoveWhiteSpace: function (html) {
		if (!html) return "";
		return html
			.trim()
			.replace(
				/<\/?(?!strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary)[^>^<]+>\s+(?=<)/gi,
				function (m) {
					return m.trim();
				}
			);
	},

	/**
	 * @description Check if the container and offset values are the edges of the "line"
	 * @param {Node} container The node of the selection object. (range.startContainer..)
	 * @param {Number} offset The offset of the selection object. (core.getRange().startOffset...)
	 * @param {String} dir Select check point - "front": Front edge, "end": End edge, undefined: Both edge.
	 * @returns {Boolean}
	 */
	isEdgeLine: function (node, offset, dir) {
		if (!this.isEdgePoint(node, offset, dir)) return false;

		const result = [];
		dir = dir === 'front' ? 'previousSibling' : 'nextSibling';
		while (node && !this.isFormatElement(node) && !util.isWysiwygDiv(node)) {
			if (!node[dir] || (util.isBreak(node[dir]) && !node[dir][dir])) {
				if (node.nodeType === 1) result.push(node.cloneNode(false));
				node = node.parentNode;
			} else {
				return null;
			}
		}

		return result;
	},

	/**
	 * @description It is judged whether it is the not checking node. (class="katex", "__se__tag")
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isNotCheckingNode: function(element) {
		return element && /katex|__se__tag/.test(element.className);
	},

	/**
	 * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
	 * @param {Node|String} element Element to check
	 * @returns {Boolean}
	 * @private
	 */
	isNonSplitNode: function (element) {
		return (
			element &&
			element.nodeType !== 3 &&
			/^(a|label|code|summary)$/i.test(typeof element === "string" ? element : element.nodeName)
		);
	},

	/**
	 * @description It is judged whether it is a node related to the text style.
	 * (strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary)
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isTextStyleNode: function (element) {
		return (
			element &&
			element.nodeType !== 3 &&
			/^(strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary)$/i.test(element.nodeName)
		);
	},

	/**
	 * @description It is judged whether it is the format element (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
	 * Format element also contain "free format Element"
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isFormatElement: function (element) {
		return (
			element &&
			element.nodeType === 1 &&
			(/^(P|DIV|H[1-6]|PRE|LI|TH|TD|DETAILS)$/i.test(element.nodeName) ||
				util.hasClass(element, "(\\s|^)__se__format__line_.+(\\s|$)|(\\s|^)__se__format__br_line_.+(\\s|$)")) &&
			!this.isComponent(element) &&
			!this.isWysiwygDiv(element)
		);
	},

	/**
	 * @description It is judged whether it is the range format element. (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__range_block_xxx")
	 * Range format element is wrap the "format element" and "component"
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isRangeFormatElement: function (element) {
		return (
			element &&
			element.nodeType === 1 &&
			(/^(BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|TH|TD|DETAILS)$/i.test(element.nodeName) ||
				this.hasClass(element, "(\\s|^)__se__format__range_block_.+(\\s|$)"))
		);
	},

	/**
	 * @description It is judged whether it is the closure range format element. (TH, TD | class="__se__format__range_block_closure_xxx")
	 * Closure range format elements is included in the range format element.
	 *  - Closure range format element is wrap the "format element" and "component"
	 * ※ You cannot exit this format with the Enter key or Backspace key.
	 * ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isClosureRangeFormatElement: function (element) {
		return (
			element &&
			element.nodeType === 1 &&
			(/^(TH|TD)$/i.test(element.nodeName) ||
				this.hasClass(element, "(\\s|^)__se__format__range_block_closure_.+(\\s|$)"))
		);
	},

	/**
	 * @description It is judged whether it is the free format element. (PRE | class="__se__format__br_line_xxx")
	 * Free format elements is included in the format element.
	 * Free format elements's line break is "BR" tag.
	 * ※ Entering the Enter key in the space on the last line ends "Free Format" and appends "Format".
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isFreeFormatElement: function (element) {
		return (
			element &&
			element.nodeType === 1 &&
			(/^PRE$/i.test(element.nodeName) || this.hasClass(element, "(\\s|^)__se__format__br_line_.+(\\s|$)")) &&
			!this.isComponent(element) &&
			!this.isWysiwygDiv(element)
		);
	},

	/**
	 * @description It is judged whether it is the closure free format element. (class="__se__format__br_line__closure_xxx")
	 * Closure free format elements is included in the free format element.
	 *  - Closure free format elements's line break is "BR" tag.
	 * ※ You cannot exit this format with the Enter key or Backspace key.
	 * ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isClosureFreeFormatElement: function (element) {
		return (
			element &&
			element.nodeType === 1 &&
			this.hasClass(element, "(\\s|^)__se__format__br_line__closure_.+(\\s|$)")
		);
	},

	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isComponent: function (element) {
		return element && (/se-component/.test(element.className) || /^(TABLE|HR)$/.test(element.nodeName));
	},

	/**
	 * @description Nodes that need to be added without modification when changing text nodes
	 * @param {Node} element Element to check
	 * @returns {Boolean}
	 * @private
	 */
	_isIgnoreNodeChange: function (element) {
		return element && element.nodeType !== 3 && (this.isNonEditable(element) || !this.isTextStyleNode(element));
	},

	/**
	 * @description Nodes without text
	 * @param {Node} element Element to check
	 * @returns {Boolean}
	 * @private
	 */
	_notTextNode: function (element) {
		return (
			element &&
			element.nodeType !== 3 &&
			(this.isComponent(element) ||
				/^(br|input|select|canvas|img|iframe|audio|video)$/i.test(
					typeof element === "string" ? element : element.nodeName
				))
		);
	},

	/**
	 * @description Check disallowed tags
	 * @param {Node} element Element to check
	 * @returns {Boolean}
	 * @private
	 */
	_disallowedTags: function (element) {
		return /^(meta|script|link|style|[a-z]+\:[a-z]+)$/i.test(element.nodeName);
	},

	constructor: Node
};

export default Node;