/**
 * @fileoverview Format class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Format = function (editor) {
	CoreInterface.call(this, editor);
	this.selection = editor.selection;
};

Format.prototype = {
	setLine: function () {
		const info = this._lineWork();
		const lines = info.lines;
		let firstNode = info.firstNode;
		let lastNode = info.lastNode;

		for (let i = 0, len = lines.length, node, newFormat; i < len; i++) {
			node = lines[i];

			if (
				(node.nodeName.toLowerCase() !== value.toLowerCase() ||
					(node.className.match(/(\s|^)__se__format__[^\s]+/) || [""])[0].trim() !== className) &&
				!util.isComponent(node)
			) {
				newFormat = tag.cloneNode(false);
				this.copyAttributes(newFormat, node);
				newFormat.innerHTML = node.innerHTML;

				node.parentNode.replaceChild(newFormat, node);
			}

			if (i === 0) firstNode = newFormat || node;
			if (i === len - 1) lastNode = newFormat || node;
			newFormat = null;
		}

		this.setRange(
			util.getNodeFromPath(info.firstPath, firstNode),
			startOffset,
			util.getNodeFromPath(info.lastPath, lastNode),
			endOffset
		);

		// history stack
		this.history.push(false);
	},

	/**
	 * @description If a parent node that contains an argument node finds a format node (util.isFormatElement), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {Function|null} validation Additional validation function.
	 * @returns {Element|null}
	 */
	getLine: function (element, validation) {
		if (!element) return null;
		if (!validation) {
			validation = function () {
				return true;
			};
		}

		while (element) {
			if (this.isWysiwygDiv(element)) return null;
			if (this.isRangeFormatElement(element)) element.firstElementChild;
			if (this.isFormatElement(element) && validation(element)) return element;

			element = element.parentNode;
		}

		return null;
	},

	setBrLine: function () {
		const lines = this._lineWork().lines;
		const len = lines.length - 1;
		let parentNode = lines[len].parentNode;
		let freeElement = tag.cloneNode(false);
		const focusElement = freeElement;

		for (let i = len, f, html, before, next, inner, isComp, first = true; i >= 0; i--) {
			f = lines[i];
			if (f === (!lines[i + 1] ? null : lines[i + 1].parentNode)) continue;

			isComp = util.isComponent(f);
			html = isComp ? "" : f.innerHTML.replace(/(?!>)\s+(?=<)|\n/g, " ");
			before = util.getParentElement(f, function (current) {
				return current.parentNode === parentNode;
			});

			if (parentNode !== f.parentNode || isComp) {
				if (util.isFormatElement(parentNode)) {
					parentNode.parentNode.insertBefore(freeElement, parentNode.nextSibling);
					parentNode = parentNode.parentNode;
				} else {
					parentNode.insertBefore(freeElement, before ? before.nextSibling : null);
					parentNode = f.parentNode;
				}

				next = freeElement.nextSibling;
				if (next && freeElement.nodeName === next.nodeName && util.isSameAttributes(freeElement, next)) {
					freeElement.innerHTML += "<BR>" + next.innerHTML;
					util.removeItem(next);
				}

				freeElement = tag.cloneNode(false);
				first = true;
			}

			inner = freeElement.innerHTML;
			freeElement.innerHTML = (first || !html || !inner || /<br>$/i.test(html) ? html : html + "<BR>") + inner;

			if (i === 0) {
				parentNode.insertBefore(freeElement, f);
				next = f.nextSibling;
				if (next && freeElement.nodeName === next.nodeName && util.isSameAttributes(freeElement, next)) {
					freeElement.innerHTML += "<BR>" + next.innerHTML;
					util.removeItem(next);
				}

				const prev = freeElement.previousSibling;
				if (prev && freeElement.nodeName === prev.nodeName && util.isSameAttributes(freeElement, prev)) {
					prev.innerHTML += "<BR>" + freeElement.innerHTML;
					util.removeItem(freeElement);
				}
			}

			if (!isComp) util.removeItem(f);
			if (!!html) first = false;
		}

		this.setRange(focusElement, 0, focusElement, 0);

		// history stack
		this.history.push(false);
	},

	/**
	 * @description If a parent node that contains an argument node finds a free format node (util.isFreeFormatElement), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {Function|null} validation Additional validation function.
	 * @returns {Element|null}
	 */
	getBrLine: function (element, validation) {
		if (!element) return null;
		if (!validation) {
			validation = function () {
				return true;
			};
		}

		while (element) {
			if (this.isWysiwygDiv(element)) return null;
			if (this.isFreeFormatElement(element) && validation(element)) return element;

			element = element.parentNode;
		}

		return null;
	},

	/**
	 * @description Append format element to sibling node of argument element.
	 * If the "lineNode" argument value is present, the tag of that argument value is inserted,
	 * If not, the currently selected format tag is inserted.
	 * @param {Element} element Insert as siblings of that element
	 * @param {String|Element|null} lineNode Node name or node obejct to be inserted
	 * @returns {Element}
	 */
	appendLine: function (element, lineNode) {
		if (!element.parentNode) return null;

		const currentFormatEl = util.getFormatElement(this.getSelectionNode(), null);
		let oFormat = null;
		if (util.isFreeFormatElement(currentFormatEl || element.parentNode)) {
			oFormat = util.createElement('BR');
		} else {
			const oFormatName = lineNode ? (typeof lineNode === 'string' ? lineNode : lineNode.nodeName) : (util.isFormatElement(currentFormatEl) && !util.isRangeFormatElement(currentFormatEl) && !util.isFreeFormatElement(currentFormatEl)) ? currentFormatEl.nodeName : options.defaultTag;
			oFormat = util.createElement(oFormatName);
			oFormat.innerHTML = '<br>';
			if ((lineNode && typeof lineNode !== 'string') || (!lineNode && util.isFormatElement(currentFormatEl))) {
				util.copyTagAttributes(oFormat, lineNode || currentFormatEl);
			}
		}

		if (util.isTableCell(element)) element.insertBefore(oFormat, element.nextElementSibling);
		else element.parentNode.insertBefore(oFormat, element.nextElementSibling);

		return oFormat;
	},

	/**
	 * @description If a parent node that contains an argument node finds a format node (util.isRangeFormatElement), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {Function|null} validation Additional validation function.
	 * @returns {Element|null}
	 */
	getRangeBlock: function (element, validation) {
		if (!element) return null;
		if (!validation) {
			validation = function () {
				return true;
			};
		}

		while (element) {
			if (this.isWysiwygDiv(element)) return null;
			if (
				this.isRangeFormatElement(element) &&
				!/^(THEAD|TBODY|TR)$/i.test(element.nodeName) &&
				validation(element)
			)
				return element;
			element = element.parentNode;
		}

		return null;
	},

	/**
	 * @description Appended all selected format Element to the argument element and insert
	 * @param {Element} rangeBlock Element of wrap the arguments (BLOCKQUOTE...)
	 */
	applyRangeBlock: function (rangeBlock) {
		this.getRange_addLine(this.getRange(), null);
		const rangeLines = this.selection.getLinesAndComponents(false);
		if (!rangeLines || rangeLines.length === 0) return;

		linesLoop: for (let i = 0, len = rangeLines.length, line, nested, fEl, lEl, f, l; i < len; i++) {
			line = rangeLines[i];
			if (!util.isListCell(line)) continue;

			nested = line.lastElementChild;
			if (
				nested &&
				util.isListCell(line.nextElementSibling) &&
				rangeLines.indexOf(line.nextElementSibling) > -1
			) {
				lEl = nested.lastElementChild;
				if (rangeLines.indexOf(lEl) > -1) {
					let list = null;
					while ((list = lEl.lastElementChild)) {
						if (util.isList(list)) {
							if (rangeLines.indexOf(list.lastElementChild) > -1) {
								lEl = list.lastElementChild;
							} else {
								continue linesLoop;
							}
						}
					}

					fEl = nested.firstElementChild;
					f = rangeLines.indexOf(fEl);
					l = rangeLines.indexOf(lEl);
					rangeLines.splice(f, l - f + 1);
					len = rangeLines.length;
					continue;
				}
			}
		}

		let last = rangeLines[rangeLines.length - 1];
		let standTag, beforeTag, pElement;

		if (util.isRangeFormatElement(last) || util.isFormatElement(last)) {
			standTag = last;
		} else {
			standTag = this.getRangeBlock(last, null) || this.getLine(last, null);
		}

		if (util.isTableCell(standTag)) {
			beforeTag = null;
			pElement = standTag;
		} else {
			beforeTag = standTag.nextSibling;
			pElement = standTag.parentNode;
		}

		let parentDepth = util.getElementDepth(standTag);
		let listParent = null;
		const lineArr = [];
		const removeItems = function (parent, origin, before) {
			let cc = null;
			if (parent !== origin && !util.isTable(origin)) {
				if (origin && util.getElementDepth(parent) === util.getElementDepth(origin)) return before;
				cc = util.removeItemAllParents(origin, null, parent);
			}

			return cc ? cc.ec : before;
		};

		for (
			let i = 0, len = rangeLines.length, line, originParent, depth, before, nextLine, nextList, nested; i < len; i++
		) {
			line = rangeLines[i];
			originParent = line.parentNode;
			if (!originParent || rangeBlock.contains(originParent)) continue;

			depth = util.getElementDepth(line);

			if (util.isList(originParent)) {
				if (listParent === null) {
					if (nextList) {
						listParent = nextList;
						nested = true;
						nextList = null;
					} else {
						listParent = originParent.cloneNode(false);
					}
				}

				lineArr.push(line);
				nextLine = rangeLines[i + 1];

				if (i === len - 1 || (nextLine && nextLine.parentNode !== originParent)) {
					// nested list
					if (nextLine && line.contains(nextLine.parentNode)) {
						nextList = nextLine.parentNode.cloneNode(false);
					}

					let list = originParent.parentNode,
						p;
					while (util.isList(list)) {
						p = util.createElement(list.nodeName);
						p.appendChild(listParent);
						listParent = p;
						list = list.parentNode;
					}

					const edge = this.removeRangeBlock(originParent, lineArr, null, true, true);

					if (parentDepth >= depth) {
						parentDepth = depth;
						pElement = edge.cc;
						beforeTag = removeItems(pElement, originParent, edge.ec);
						if (beforeTag) pElement = beforeTag.parentNode;
					} else if (pElement === edge.cc) {
						beforeTag = edge.ec;
					}

					if (pElement !== edge.cc) {
						before = removeItems(pElement, edge.cc, before);
						if (before !== undefined) beforeTag = before;
						else beforeTag = edge.cc;
					}

					for (let c = 0, cLen = edge.removeArray.length; c < cLen; c++) {
						listParent.appendChild(edge.removeArray[c]);
					}

					if (!nested) rangeBlock.appendChild(listParent);
					if (nextList) edge.removeArray[edge.removeArray.length - 1].appendChild(nextList);
					listParent = null;
					nested = false;
				}
			} else {
				if (parentDepth >= depth) {
					parentDepth = depth;
					pElement = originParent;
					beforeTag = line.nextSibling;
				}

				rangeBlock.appendChild(line);

				if (pElement !== originParent) {
					before = removeItems(pElement, originParent);
					if (before !== undefined) beforeTag = before;
				}
			}
		}

		this.effectNode = null;
		this.node.merge(rangeBlock, null, false);
		util.mergeNestedTags(
			rangeBlock,
			function (current) {
				return this.isList(current);
			}.bind(util)
		);

		// Nested list
		if (
			beforeTag &&
			util.getElementDepth(beforeTag) > 0 &&
			(util.isList(beforeTag.parentNode) || util.isList(beforeTag.parentNode.parentNode))
		) {
			const depthFormat = util.getParentElement(
				beforeTag,
				function (current) {
					return this.isRangeFormatElement(current) && !this.isList(current);
				}.bind(util)
			);
			const splitRange = this.editor.node.split(
				beforeTag,
				null,
				!depthFormat ? 0 : util.getElementDepth(depthFormat) + 1
			);
			splitRange.parentNode.insertBefore(rangeBlock, splitRange);
		} else {
			// basic
			pElement.insertBefore(rangeBlock, beforeTag);
			removeItems(rangeBlock, beforeTag);
		}

		const edge = util.getEdgeChildNodes(rangeBlock.firstElementChild, rangeBlock.lastElementChild);
		if (rangeLines.length > 1) {
			this.setRange(edge.sc, 0, edge.ec, edge.ec.textContent.length);
		} else {
			this.setRange(edge.ec, edge.ec.textContent.length, edge.ec, edge.ec.textContent.length);
		}

		// history stack
		this.history.push(false);
	},

	/**
	 * @description The elements of the "selectedFormats" array are detached from the "rangeElement" element. ("LI" tags are converted to "P" tags)
	 * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
	 * @param {Element} rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
	 * @param {Array|null} selectedFormats Array of format elements (P, DIV, LI...) to remove.
	 * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
	 * @param {Element|null} newRangeElement The node(rangeElement) to replace the currently wrapped node.
	 * @param {Boolean} remove If true, deleted without detached.
	 * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
	 * @returns {Object}
	 */
	removeRangeBlock: function (rangeElement, selectedFormats, newRangeElement, remove, notHistoryPush) {
		const range = this.getRange();
		const so = range.startOffset;
		const eo = range.endOffset;

		let children = util.getListChildNodes(rangeElement, function (current) {
			return current.parentNode === rangeElement;
		});
		let parent = rangeElement.parentNode;
		let firstNode = null;
		let lastNode = null;
		let rangeEl = rangeElement.cloneNode(false);

		const removeArray = [];
		const newList = util.isList(newRangeElement);
		let insertedNew = false;
		let reset = false;
		let moveComplete = false;

		function appendNode(parent, insNode, sibling, originNode) {
			if (util.onlyZeroWidthSpace(insNode)) insNode.innerHTML = util.zeroWidthSpace;

			if (insNode.nodeType === 3) {
				parent.insertBefore(insNode, sibling);
				return insNode;
			}

			const insChildren = (moveComplete ? insNode : originNode).childNodes;
			let format = insNode.cloneNode(false);
			let first = null;
			let c = null;

			while (insChildren[0]) {
				c = insChildren[0];
				if (util._notTextNode(c) && !util.isBreak(c) && !util.isListCell(format)) {
					if (format.childNodes.length > 0) {
						if (!first) first = format;
						parent.insertBefore(format, sibling);
						format = insNode.cloneNode(false);
					}
					parent.insertBefore(c, sibling);
					if (!first) first = c;
				} else {
					format.appendChild(c);
				}
			}

			if (format.childNodes.length > 0) {
				if (util.isListCell(parent) && util.isListCell(format) && util.isList(sibling)) {
					if (newList) {
						first = sibling;
						while (sibling) {
							format.appendChild(sibling);
							sibling = sibling.nextSibling;
						}
						parent.parentNode.insertBefore(format, parent.nextElementSibling);
					} else {
						const originNext = originNode.nextElementSibling;
						const detachRange = this._removeNestedList(originNode, false);
						if (rangeElement !== detachRange || originNext !== originNode.nextElementSibling) {
							const fChildren = format.childNodes;
							while (fChildren[0]) {
								originNode.appendChild(fChildren[0]);
							}

							rangeElement = detachRange;
							reset = true;
						}
					}
				} else {
					parent.insertBefore(format, sibling);
				}

				if (!first) first = format;
			}

			return first;
		}

		// detach loop
		for (let i = 0, len = children.length, insNode, lineIndex, next; i < len; i++) {
			insNode = children[i];
			if (insNode.nodeType === 3 && util.isList(rangeEl)) continue;

			moveComplete = false;
			if (remove && i === 0) {
				if (!selectedFormats || selectedFormats.length === len || selectedFormats[0] === insNode) {
					firstNode = rangeElement.previousSibling;
				} else {
					firstNode = rangeEl;
				}
			}

			if (selectedFormats) lineIndex = selectedFormats.indexOf(insNode);
			if (selectedFormats && lineIndex === -1) {
				if (!rangeEl) rangeEl = rangeElement.cloneNode(false);
				rangeEl.appendChild(insNode);
			} else {
				if (selectedFormats) next = selectedFormats[lineIndex + 1];
				if (rangeEl && rangeEl.children.length > 0) {
					parent.insertBefore(rangeEl, rangeElement);
					rangeEl = null;
				}

				if (!newList && util.isListCell(insNode)) {
					if (
						next &&
						util.getElementDepth(insNode) !== util.getElementDepth(next) &&
						(util.isListCell(parent) || util.getArrayItem(insNode.children, util.isList, false))
					) {
						const insNext = insNode.nextElementSibling;
						const detachRange = this._removeNestedList(insNode, false);
						if (rangeElement !== detachRange || insNext !== insNode.nextElementSibling) {
							rangeElement = detachRange;
							reset = true;
						}
					} else {
						const inner = insNode;
						insNode = util.createElement(
							remove ?
							inner.nodeName :
							util.isList(rangeElement.parentNode) || util.isListCell(rangeElement.parentNode) ?
							"LI" :
							util.isTableCell(rangeElement.parentNode) ?
							"DIV" :
							options.defaultTag
						);
						const isCell = util.isListCell(insNode);
						const innerChildren = inner.childNodes;
						while (innerChildren[0]) {
							if (util.isList(innerChildren[0]) && !isCell) break;
							insNode.appendChild(innerChildren[0]);
						}
						this.copyAttributes(insNode, inner);
						moveComplete = true;
					}
				} else {
					insNode = insNode.cloneNode(false);
				}

				if (!reset) {
					if (!remove) {
						if (newRangeElement) {
							if (!insertedNew) {
								parent.insertBefore(newRangeElement, rangeElement);
								insertedNew = true;
							}
							insNode = appendNode(newRangeElement, insNode, null, children[i]);
						} else {
							insNode = appendNode(parent, insNode, rangeElement, children[i]);
						}

						if (!reset) {
							if (selectedFormats) {
								lastNode = insNode;
								if (!firstNode) {
									firstNode = insNode;
								}
							} else if (!firstNode) {
								firstNode = lastNode = insNode;
							}
						}
					} else {
						removeArray.push(insNode);
						util.removeItem(children[i]);
					}

					if (reset) {
						reset = moveComplete = false;
						children = util.getListChildNodes(rangeElement, function (current) {
							return current.parentNode === rangeElement;
						});
						rangeEl = rangeElement.cloneNode(false);
						parent = rangeElement.parentNode;
						i = -1;
						len = children.length;
						continue;
					}
				}
			}
		}

		const rangeParent = rangeElement.parentNode;
		let rangeRight = rangeElement.nextSibling;
		if (rangeEl && rangeEl.children.length > 0) {
			rangeParent.insertBefore(rangeEl, rangeRight);
		}

		if (newRangeElement) firstNode = newRangeElement.previousSibling;
		else if (!firstNode) firstNode = rangeElement.previousSibling;
		rangeRight = rangeElement.nextSibling !== rangeEl ? rangeElement.nextSibling : rangeEl ? rangeEl.nextSibling : null;

		if (rangeElement.children.length === 0 || rangeElement.textContent.length === 0) {
			util.removeItem(rangeElement);
		} else {
			util.removeEmptyNode(rangeElement, null);
		}

		let edge = null;
		if (remove) {
			edge = {
				cc: rangeParent,
				sc: firstNode,
				ec: rangeRight,
				removeArray: removeArray
			};
		} else {
			if (!firstNode) firstNode = lastNode;
			if (!lastNode) lastNode = firstNode;
			const childEdge = util.getEdgeChildNodes(firstNode, lastNode.parentNode ? firstNode : lastNode);
			edge = {
				cc: (childEdge.sc || childEdge.ec).parentNode,
				sc: childEdge.sc,
				ec: childEdge.ec
			};
		}

		this.effectNode = null;
		if (notHistoryPush) return edge;

		if (!remove && edge) {
			if (!selectedFormats) {
				this.setRange(edge.sc, 0, edge.sc, 0);
			} else {
				this.setRange(edge.sc, so, edge.ec, eo);
			}
		}

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Append all selected format Element to the list and insert.
	 * @param {String} type List type. (bullet | numbered):[listStyleType]
	 * @param {Element} selectedCells Format elements or list cells.
	 * @param {Boolean} nested If true, indenting existing list cells.
	 */
	applyList: function (type, selectedCells, nested) {
		const listTag = type.split(":")[0] === "bullet" ? "OL" : "UL";
		const listStyle = type.split(":")[1] || "";

		let range = this.getRange();
		let selectedFormats = !selectedCells ? this.selection.getLinesAndComponents(false) : selectedCells;

		if (selectedFormats.length === 0) {
			if (selectedCells) return;
			range = this.getRange_addLine(range, null);
			selectedFormats = this.selection.getLinesAndComponents(false);
			if (selectedFormats.length === 0) return;
		}

		const util = this.util;
		util.sortByDepth(selectedFormats, true);

		// merge
		let firstSel = selectedFormats[0];
		let lastSel = selectedFormats[selectedFormats.length - 1];
		let topEl =
			(util.isListCell(firstSel) || util.isComponent(firstSel)) && !firstSel.previousElementSibling ?
			firstSel.parentNode.previousElementSibling :
			firstSel.previousElementSibling;
		let bottomEl =
			(util.isListCell(lastSel) || util.isComponent(lastSel)) && !lastSel.nextElementSibling ?
			lastSel.parentNode.nextElementSibling :
			lastSel.nextElementSibling;

		const originRange = {
			sc: range.startContainer,
			so: (range.startContainer === range.endContainer && util.onlyZeroWidthSpace(range.startContainer) && range.startOffset === 0 && range.endOffset === 1) ? range.endOffset : range.startOffset,
			ec: range.endContainer,
			eo: range.endOffset
		};

		let isRemove = true;

		for (let i = 0, len = selectedFormats.length; i < len; i++) {
			if (
				!util.isList(
					this.getRangeBlock(
						selectedFormats[i],
						function (current) {
							return this.getRangeBlock(current) && current !== selectedFormats[i];
						}.bind(this)
					)
				)
			) {
				isRemove = false;
				break;
			}
		}

		if (
			isRemove &&
			(!topEl || firstSel.tagName !== topEl.tagName || listTag !== topEl.tagName.toUpperCase()) &&
			(!bottomEl || lastSel.tagName !== bottomEl.tagName || listTag !== bottomEl.tagName.toUpperCase())
		) {
			if (nested) {
				for (let i = 0, len = selectedFormats.length; i < len; i++) {
					for (let j = i - 1; j >= 0; j--) {
						if (selectedFormats[j].contains(selectedFormats[i])) {
							selectedFormats.splice(i, 1);
							i--;
							len--;
							break;
						}
					}
				}
			}

			const currentFormat = this.getRangeBlock(firstSel);
			const cancel = currentFormat && currentFormat.tagName === listTag;
			let rangeArr, tempList;
			const passComponent = function (current) {
				return !this.isComponent(current);
			}.bind(util);

			if (!cancel) {
				tempList = util.createElement(listTag);
				tempList.style.listStyleType = listStyle;
			}

			for (let i = 0, len = selectedFormats.length, r, o; i < len; i++) {
				o = this.getRangeBlock(selectedFormats[i], passComponent);
				if (!o || !util.isList(o)) continue;

				if (!r) {
					r = o;
					rangeArr = {
						r: r,
						f: [util.getParentElement(selectedFormats[i], "LI")]
					};
				} else {
					if (r !== o) {
						if (nested && util.isListCell(o.parentNode)) {
							this._detachNested(rangeArr.f);
						} else {
							this.removeRangeBlock(rangeArr.f[0].parentNode, rangeArr.f, tempList, false, true);
						}

						o = selectedFormats[i].parentNode;
						if (!cancel) {
							tempList = util.createElement(listTag);
							tempList.style.listStyleType = listStyle;
						}

						r = o;
						rangeArr = {
							r: r,
							f: [util.getParentElement(selectedFormats[i], "LI")]
						};
					} else {
						rangeArr.f.push(util.getParentElement(selectedFormats[i], "LI"));
					}
				}

				if (i === len - 1) {
					if (nested && util.isListCell(o.parentNode)) {
						this._detachNested(rangeArr.f);
					} else {
						this.removeRangeBlock(rangeArr.f[0].parentNode, rangeArr.f, tempList, false, true);
					}
				}
			}
		} else {
			const topElParent = topEl ? topEl.parentNode : topEl;
			const bottomElParent = bottomEl ? bottomEl.parentNode : bottomEl;
			topEl =
				topElParent && !util.isWysiwygDiv(topElParent) && topElParent.nodeName === listTag ?
				topElParent :
				topEl;
			bottomEl =
				bottomElParent && !util.isWysiwygDiv(bottomElParent) && bottomElParent.nodeName === listTag ?
				bottomElParent :
				bottomEl;

			const mergeTop = topEl && topEl.tagName === listTag;
			const mergeBottom = bottomEl && bottomEl.tagName === listTag;

			let list = mergeTop ? topEl : util.createElement(listTag);
			list.style.listStyleType = listStyle;
			let firstList = null;
			let lastList = null;
			let topNumber = null;
			let bottomNumber = null;

			const passComponent = function (current) {
				return !this.isComponent(current) && !this.isList(current);
			}.bind(util);

			for (
				let i = 0,
					len = selectedFormats.length,
					newCell,
					fTag,
					isCell,
					next,
					originParent,
					nextParent,
					parentTag,
					siblingTag,
					rangeTag; i < len; i++
			) {
				fTag = selectedFormats[i];
				if (fTag.childNodes.length === 0 && !util._isIgnoreNodeChange(fTag)) {
					util.removeItem(fTag);
					continue;
				}
				next = selectedFormats[i + 1];
				originParent = fTag.parentNode;
				nextParent = next ? next.parentNode : null;
				isCell = util.isListCell(fTag);
				rangeTag = util.isRangeFormatElement(originParent) ? originParent : null;
				parentTag = isCell && !util.isWysiwygDiv(originParent) ? originParent.parentNode : originParent;
				siblingTag =
					isCell && !util.isWysiwygDiv(originParent) ?
					!next || util.isListCell(parentTag) ?
					originParent :
					originParent.nextSibling :
					fTag.nextSibling;

				newCell = util.createElement("LI");
				this.copyAttributes(newCell, fTag);
				if (util.isComponent(fTag)) {
					const isHR = /^HR$/i.test(fTag.nodeName);
					if (!isHR) newCell.innerHTML = "<br>";
					newCell.innerHTML += fTag.outerHTML;
					if (isHR) newCell.innerHTML += "<br>";
				} else {
					const fChildren = fTag.childNodes;
					while (fChildren[0]) {
						newCell.appendChild(fChildren[0]);
					}
				}
				list.appendChild(newCell);

				if (!next) lastList = list;
				if (!next || parentTag !== nextParent || util.isRangeFormatElement(siblingTag)) {
					if (!firstList) firstList = list;
					if (
						(!mergeTop || !next || parentTag !== nextParent) &&
						!(next && util.isList(nextParent) && nextParent === originParent)
					) {
						if (list.parentNode !== parentTag) parentTag.insertBefore(list, siblingTag);
					}
				}

				util.removeItem(fTag);
				if (mergeTop && topNumber === null) topNumber = list.children.length - 1;
				if (
					next &&
					(this.getRangeBlock(nextParent, passComponent) !==
						this.getRangeBlock(originParent, passComponent) ||
						(util.isList(nextParent) &&
							util.isList(originParent) &&
							util.getElementDepth(nextParent) !== util.getElementDepth(originParent)))
				) {
					list = util.createElement(listTag);
					list.style.listStyleType = listStyle;
				}

				if (rangeTag && rangeTag.children.length === 0) util.removeItem(rangeTag);
			}

			if (topNumber) {
				firstList = firstList.children[topNumber];
			}

			if (mergeBottom) {
				bottomNumber = list.children.length - 1;
				list.innerHTML += bottomEl.innerHTML;
				lastList = list.children[bottomNumber] || lastList;
				util.removeItem(bottomEl);
			}
		}

		this.effectNode = null;
		return originRange;
	},

	/**
	 * @description "selectedCells" array are detached from the list element.
	 * The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param {Array} selectedCells Array of format elements (LI, P...) to remove.
	 * @param {Boolean} remove If true, It does not just remove the list, it deletes the contents.
	 * @returns {Object} {sc: <LI>, ec: <LI>}.
	 */
	removeList: function (selectedCells, remove) {
		let rangeArr = {};
		let listFirst = false;
		let listLast = false;
		let first = null;
		let last = null;
		const passComponent = function (current) {
			return !this.isComponent(current);
		}.bind(util);

		for (let i = 0, len = selectedCells.length, r, o, lastIndex, isList; i < len; i++) {
			lastIndex = i === len - 1;
			o = this.getRangeBlock(selectedCells[i], passComponent);
			isList = util.isList(o);
			if (!r && isList) {
				r = o;
				rangeArr = {
					r: r,
					f: [util.getParentElement(selectedCells[i], "LI")]
				};
				if (i === 0) listFirst = true;
			} else if (r && isList) {
				if (r !== o) {
					const edge = this.detachRangeFormatElement(
						rangeArr.f[0].parentNode,
						rangeArr.f,
						null,
						remove,
						true
					);
					o = selectedCells[i].parentNode;
					if (listFirst) {
						first = edge.sc;
						listFirst = false;
					}
					if (lastIndex) last = edge.ec;

					if (isList) {
						r = o;
						rangeArr = {
							r: r,
							f: [util.getParentElement(selectedCells[i], "LI")]
						};
						if (lastIndex) listLast = true;
					} else {
						r = null;
					}
				} else {
					rangeArr.f.push(util.getParentElement(selectedCells[i], "LI"));
					if (lastIndex) listLast = true;
				}
			}

			if (lastIndex && util.isList(r)) {
				const edge = this.detachRangeFormatElement(rangeArr.f[0].parentNode, rangeArr.f, null, remove, true);
				if (listLast || len === 1) last = edge.ec;
				if (listFirst) first = edge.sc || last;
			}
		}

		return {
			sc: first,
			ec: last
		};
	},

	/**
	 * @description Indent more the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
	indent: function () {
		const range = this.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;
		const so = range.startOffset;
		const eo = range.endOffset;

		const lines = this.selection.getLines(null);
		const cells = SetLineMargin(
			lines,
			this._variable.indentSize,
			options.rtl ? "marginRight" : "marginLeft"
		);

		// list cells
		if (cells.length > 0) {
			this.format._applyNestedList(cells, true);
		}

		this.effectNode = null;
		this.setRange(sc, so, ec, eo);

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Indent less the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
	outdent: function () {
		const range = this.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;
		const so = range.startOffset;
		const eo = range.endOffset;

		const lines = this.selection.getLines(null);
		const cells = SetLineMargin(
			lines,
			this._variable.indentSize * -1,
			options.rtl ? "marginRight" : "marginLeft"
		);

		// list cells
		if (cells.length > 0) {
			this.format._applyNestedList(cells, false);
		}

		this.effectNode = null;
		this.setRange(sc, so, ec, eo);

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Add, update, and delete style node from selected text. (a, span, strong, ect.)
	 * 1. If there is a node in the "styleNode" argument, a node with the same tags and attributes as "styleNode" is added to the selection text.
	 * 2. If it is in the same tag, only the tag's attributes are changed without adding a tag.
	 * 3. If the "styleNode" argument is null, the node of the selection is update or remove without adding a new node.
	 * 4. The same style as the style attribute of the "styleArray" argument is deleted.
	 *    (Styles should be put with attribute names from css. ["background-color"])
	 * 5. The same class name as the class attribute of the "styleArray" argument is deleted.
	 *    (The class name is preceded by "." [".className"])
	 * 6. Use a list of styles and classes of "styleNode" in "styleArray" to avoid duplicate property values.
	 * 7. If a node with all styles and classes removed has the same tag name as "styleNode" or "removeNodeArray", or "styleNode" is null, that node is deleted.
	 * 8. Regardless of the style and class of the node, the tag with the same name as the "removeNodeArray" argument value is deleted.
	 * 9. If the "strictRemove" argument is true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
	 *10. It won't work if the parent node has the same class and same value style.
	 *    However, if there is a value in "removeNodeArray", it works and the text node is separated even if there is no node to replace.
	 * @param {Element|null} styleNode The element to be added to the selection. If it is null, only delete the node.
	 * @param {Array|null} styleArray The style or className attribute name Array to check (['font-size'], ['.className'], ['font-family', 'color', '.className']...])
	 * @param {Array|null} removeNodeArray An array of node names to remove types from, remove all formats when "styleNode" is null and there is an empty array or null value. (['span'], ['strong', 'em'] ...])
	 * @param {Boolean|null} strictRemove If true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
	 */
	applyStyleNode: function (styleNode, styleArray, removeNodeArray, strictRemove) {
		this._resetRangeToTextNode();
		let range = this.getRange_addLine(this.getRange(), null);
		styleArray = styleArray && styleArray.length > 0 ? styleArray : false;
		removeNodeArray = removeNodeArray && removeNodeArray.length > 0 ? removeNodeArray : false;

		const isRemoveNode = !styleNode;
		const isRemoveFormat = isRemoveNode && !removeNodeArray && !styleArray;
		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;

		if (
			(isRemoveFormat &&
				range.collapsed &&
				util.isFormatElement(startCon.parentNode) &&
				util.isFormatElement(endCon.parentNode)) ||
			(startCon === endCon && startCon.nodeType === 1 && util.isNonEditable(startCon))
		) {
			return;
		}

		if (range.collapsed && !isRemoveFormat) {
			if (startCon.nodeType === 1 && !util.isBreak(startCon) && !util.isComponent(startCon)) {
				let afterNode = null;
				const focusNode = startCon.childNodes[startOff];

				if (focusNode) {
					if (!focusNode.nextSibling) {
						afterNode = null;
					} else {
						afterNode = util.isBreak(focusNode) ? focusNode : focusNode.nextSibling;
					}
				}

				const zeroWidth = util.createTextNode(util.zeroWidthSpace);
				startCon.insertBefore(zeroWidth, afterNode);
				this.setRange(zeroWidth, 1, zeroWidth, 1);

				range = this.getRange();
				startCon = range.startContainer;
				startOff = range.startOffset;
				endCon = range.endContainer;
				endOff = range.endOffset;
			}
		}

		if (util.isFormatElement(startCon)) {
			startCon = startCon.childNodes[startOff] || startCon.firstChild;
			startOff = 0;
		}
		if (util.isFormatElement(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild;
			endOff = endCon.textContent.length;
		}

		if (isRemoveNode) {
			styleNode = util.createElement("DIV");
		}

		const wRegExp = _w.RegExp;
		const newNodeName = styleNode.nodeName;

		/* checked same style property */
		if (!isRemoveFormat && startCon === endCon && !removeNodeArray && styleNode) {
			let sNode = startCon;
			let checkCnt = 0;
			const checkAttrs = [];

			const checkStyles = styleNode.style;
			for (let i = 0, len = checkStyles.length; i < len; i++) {
				checkAttrs.push(checkStyles[i]);
			}

			const ckeckClasses = styleNode.classList;
			for (let i = 0, len = ckeckClasses.length; i < len; i++) {
				checkAttrs.push("." + ckeckClasses[i]);
			}

			if (checkAttrs.length > 0) {
				while (!util.isFormatElement(sNode) && !util.isWysiwygDiv(sNode)) {
					for (let i = 0; i < checkAttrs.length; i++) {
						if (sNode.nodeType === 1) {
							const s = checkAttrs[i];
							const classReg = /^\./.test(s) ?
								new wRegExp("\\s*" + s.replace(/^\./, "") + "(\\s+|$)", "ig") :
								false;

							const styleCheck = isRemoveNode ?
								!!sNode.style[s] :
								!!sNode.style[s] && !!styleNode.style[s] && sNode.style[s] === styleNode.style[s];
							const classCheck =
								classReg === false ?
								false :
								isRemoveNode ?
								!!sNode.className.match(classReg) :
								!!sNode.className.match(classReg) && !!styleNode.className.match(classReg);
							if (styleCheck || classCheck) {
								checkCnt++;
							}
						}
					}
					sNode = sNode.parentNode;
				}

				if (checkCnt >= checkAttrs.length) return;
			}
		}

		let start = {},
			end = {};
		let newNode,
			styleRegExp = "",
			classRegExp = "",
			removeNodeRegExp = "";

		if (styleArray) {
			for (let i = 0, len = styleArray.length, s; i < len; i++) {
				s = styleArray[i];
				if (/^\./.test(s)) {
					classRegExp += (classRegExp ? "|" : "\\s*(?:") + s.replace(/^\./, "");
				} else {
					styleRegExp += (styleRegExp ? "|" : "(?:;|^|\\s)(?:") + s;
				}
			}

			if (styleRegExp) {
				styleRegExp += ")\\s*:[^;]*\\s*(?:;|$)";
				styleRegExp = new wRegExp(styleRegExp, "ig");
			}

			if (classRegExp) {
				classRegExp += ")(?=\\s+|$)";
				classRegExp = new wRegExp(classRegExp, "ig");
			}
		}

		if (removeNodeArray) {
			removeNodeRegExp = "^(?:" + removeNodeArray[0];
			for (let i = 1; i < removeNodeArray.length; i++) {
				removeNodeRegExp += "|" + removeNodeArray[i];
			}
			removeNodeRegExp += ")$";
			removeNodeRegExp = new wRegExp(removeNodeRegExp, "i");
		}

		/** validation check function*/
		const wBoolean = _w.Boolean;
		const _removeCheck = {
			v: false
		};
		const validation = function (checkNode) {
			const vNode = checkNode.cloneNode(false);

			// all path
			if (vNode.nodeType === 3 || util.isBreak(vNode)) return vNode;
			// all remove
			if (isRemoveFormat) return null;

			// remove node check
			const tagRemove =
				(!removeNodeRegExp && isRemoveNode) || (removeNodeRegExp && removeNodeRegExp.test(vNode.nodeName));

			// tag remove
			if (tagRemove && !strictRemove) {
				_removeCheck.v = true;
				return null;
			}

			// style regexp
			const originStyle = vNode.style.cssText;
			let style = "";
			if (styleRegExp && originStyle.length > 0) {
				style = originStyle.replace(styleRegExp, "").trim();
				if (style !== originStyle) _removeCheck.v = true;
			}

			// class check
			const originClasses = vNode.className;
			let classes = "";
			if (classRegExp && originClasses.length > 0) {
				classes = originClasses.replace(classRegExp, "").trim();
				if (classes !== originClasses) _removeCheck.v = true;
			}

			// remove only
			if (isRemoveNode) {
				if (
					(classRegExp || !originClasses) &&
					(styleRegExp || !originStyle) &&
					!style &&
					!classes &&
					tagRemove
				) {
					_removeCheck.v = true;
					return null;
				}
			}

			// change
			if (
				style ||
				classes ||
				vNode.nodeName !== newNodeName ||
				wBoolean(styleRegExp) !== wBoolean(originStyle) ||
				wBoolean(classRegExp) !== wBoolean(originClasses)
			) {
				if (styleRegExp && originStyle.length > 0) vNode.style.cssText = style;
				if (!vNode.style.cssText) {
					vNode.removeAttribute("style");
				}

				if (classRegExp && originClasses.length > 0) vNode.className = classes.trim();
				if (!vNode.className.trim()) {
					vNode.removeAttribute("class");
				}

				if (!vNode.style.cssText && !vNode.className && (vNode.nodeName === newNodeName || tagRemove)) {
					_removeCheck.v = true;
					return null;
				}

				return vNode;
			}

			_removeCheck.v = true;
			return null;
		};

		// get line nodes
		const lineNodes = this.selection.getLines(null);
		range = this.getRange();
		startCon = range.startContainer;
		startOff = range.startOffset;
		endCon = range.endContainer;
		endOff = range.endOffset;

		if (!this.getLine(startCon, null)) {
			startCon = util.getEdgeChild(
				lineNodes[0],
				function (current) {
					return current.nodeType === 3;
				},
				false
			);
			startOff = 0;
		}

		if (!this.getLine(endCon, null)) {
			endCon = util.getEdgeChild(
				lineNodes[lineNodes.length - 1],
				function (current) {
					return current.nodeType === 3;
				},
				false
			);
			endOff = endCon.textContent.length;
		}

		const oneLine = this.getLine(startCon, null) === this.getLine(endCon, null);
		const endLength = lineNodes.length - (oneLine ? 0 : 1);

		// node Changes
		newNode = styleNode.cloneNode(false);

		const isRemoveAnchor =
			isRemoveFormat ||
			(isRemoveNode &&
				(function (inst, arr) {
					for (let n = 0, len = arr.length; n < len; n++) {
						if (inst.node.isNonSplitNode(arr[n]) || inst._sn_isSizeNode(arr[n])) return true;
					}
					return false;
				})(this, removeNodeArray));

		const isSizeNode = isRemoveNode || this._sn_isSizeNode(newNode);
		const _getMaintainedNode = this._sn_getMaintainedNode.bind(isRemoveAnchor, isSizeNode);
		const _isMaintainedNode = this._sn_isMaintainedNode.bind(isRemoveAnchor, isSizeNode);

		// one line
		if (oneLine) {
			const newRange = this._setNode_oneLine(
				lineNodes[0],
				newNode,
				validation,
				startCon,
				startOff,
				endCon,
				endOff,
				isRemoveFormat,
				isRemoveNode,
				range.collapsed,
				_removeCheck,
				_getMaintainedNode,
				_isMaintainedNode
			);
			start.container = newRange.startContainer;
			start.offset = newRange.startOffset;
			end.container = newRange.endContainer;
			end.offset = newRange.endOffset;
			if (start.container === end.container && util.onlyZeroWidthSpace(start.container)) {
				start.offset = end.offset = 1;
			}
			this._sn_setCommonListStyle(newRange.ancestor, null);
		} else {
			// multi line
			// end
			if (endLength > 0) {
				newNode = styleNode.cloneNode(false);
				end = this._setNode_endLine(
					lineNodes[endLength],
					newNode,
					validation,
					endCon,
					endOff,
					isRemoveFormat,
					isRemoveNode,
					_removeCheck,
					_getMaintainedNode,
					_isMaintainedNode
				);
			}

			// mid
			for (let i = endLength - 1, newRange; i > 0; i--) {
				newNode = styleNode.cloneNode(false);
				newRange = this._setNode_middleLine(
					lineNodes[i],
					newNode,
					validation,
					isRemoveFormat,
					isRemoveNode,
					_removeCheck,
					end.container
				);
				if (newRange.endContainer) {
					end.ancestor = null;
					end.container = newRange.endContainer;
				}
				this._sn_setCommonListStyle(newRange.ancestor, null);
			}

			// start
			newNode = styleNode.cloneNode(false);
			start = this._setNode_startLine(
				lineNodes[0],
				newNode,
				validation,
				startCon,
				startOff,
				isRemoveFormat,
				isRemoveNode,
				_removeCheck,
				_getMaintainedNode,
				_isMaintainedNode,
				end.container
			);

			if (start.endContainer) {
				end.ancestor = null;
				end.container = start.endContainer;
			}

			if (endLength <= 0) {
				end = start;
			} else if (!end.container) {
				end.ancestor = null;
				end.container = start.container;
				end.offset = start.container.textContent.length;
			}

			this._sn_setCommonListStyle(start.ancestor, null);
			this._sn_setCommonListStyle(end.ancestor || this.getLine(end.container), null);
		}

		// set range
		this.controllersOff();
		this.setRange(start.container, start.offset, end.container, end.offset);

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
	 * @param {Element} originEl Origin element
	 * @param {Element} copyEl Element to copy
	 */
	copyAttributes: function (originEl, copyEl) {
		copyEl = copyEl.cloneNode(false);
		copyEl.className = copyEl.className.replace(/(\s|^)__se__format__[^\s]+/g, "");
		this.copyTagAttributes(originEl, copyEl);
	},

	/**
	 * @description Remove format of the currently selected text.
	 */
	removeStyleNode: function () {
		this.applyStyleNode(null, null, null, null);
	},

	_lineWork: function () {
		let range = this.getRange();
		let selectedFormsts = this.selection.getLinesAndComponents(false);

		if (selectedFormsts.length === 0) {
			range = this.getRange_addLine(range, null);
			selectedFormsts = this.selection.getLinesAndComponents(false);
			if (selectedFormsts.length === 0) return;
		}

		const startOffset = range.startOffset;
		const endOffset = range.endOffset;

		const util = this.util;
		let first = selectedFormsts[0];
		let last = selectedFormsts[selectedFormsts.length - 1];
		const firstPath = util.getNodePath(range.startContainer, first, null, null);
		const lastPath = util.getNodePath(range.endContainer, last, null, null);

		// remove selected list
		const rlist = this.removeList(selectedFormsts, false);
		if (rlist.sc) first = rlist.sc;
		if (rlist.ec) last = rlist.ec;

		// change format tag
		this.setRange(
			util.getNodeFromPath(firstPath, first),
			startOffset,
			util.getNodeFromPath(lastPath, last),
			endOffset
		);

		return {
			lines: this.selection.getLinesAndComponents(false),
			firstNode: first,
			lastNode: last,
			firstPath: firstPath,
			lastPath: lastPath
		};
	},

	_attachNested: function (originList, innerList, prev, next, nodePath) {
		let insertPrev = false;

		if (prev && innerList.tagName === prev.tagName) {
			const children = innerList.children;
			while (children[0]) {
				prev.appendChild(children[0]);
			}

			innerList = prev;
			insertPrev = true;
		}

		if (next && innerList.tagName === next.tagName) {
			const children = next.children;
			while (children[0]) {
				innerList.appendChild(children[0]);
			}

			const temp = next.nextElementSibling;
			next.parentNode.removeChild(next);
			next = temp;
		}

		if (!insertPrev) {
			if (this.util.isListCell(prev)) {
				originList = prev;
				next = null;
			}

			originList.insertBefore(innerList, next);

			if (!nodePath.s) {
				nodePath.s = this.util.getNodePath(innerList.firstElementChild.firstChild, originList, null);
				nodePath.sl = originList;
			}

			const slPath = originList.contains(nodePath.sl) ? this.util.getNodePath(nodePath.sl, originList) : null;
			nodePath.e = this.util.getNodePath(innerList.lastElementChild.firstChild, originList, null);
			nodePath.el = originList;

			this.util.mergeSameTags(originList, [nodePath.s, nodePath.e, slPath], false);
			this.util.mergeNestedTags(originList);
			if (slPath) nodePath.sl = this.util.getNodeFromPath(slPath, originList);
		}

		return innerList;
	},

	_detachNested: function (cells) {
		const first = cells[0];
		const last = cells[cells.length - 1];
		const next = last.nextElementSibling;
		const originList = first.parentNode;
		const sibling = originList.parentNode.nextElementSibling;
		const parentNode = originList.parentNode.parentNode;

		for (let c = 0, cLen = cells.length; c < cLen; c++) {
			parentNode.insertBefore(cells[c], sibling);
		}

		if (next && originList.children.length > 0) {
			const newList = originList.cloneNode(false);
			const children = originList.childNodes;
			const index = this.util.getPositionIndex(next);
			while (children[index]) {
				newList.appendChild(children[index]);
			}
			last.appendChild(newList);
		}

		if (originList.children.length === 0) this.util.removeItem(originList);
		this.node.merge(parentNode);

		const edge = this.util.getEdgeChildNodes(first, last);

		return {
			cc: first.parentNode,
			sc: edge.sc,
			ec: edge.ec
		};
	},

	/**
	 * @description Nest list cells or cancel nested cells.
	 * @param selectedCells List cells.
	 * @param nested Nested or cancel nested.
	 * @private
	 */
	_applyNestedList: function (selectedCells, nested) {
		selectedCells = !selectedCells ?
			this.selection.getLines().filter(
				function (el) {
					return this.isListCell(el);
				}.bind(this.util)
			) :
			selectedCells;
		const cellsLen = selectedCells.length;
		if (
			cellsLen === 0 ||
			(!nested &&
				!this.util.isListCell(selectedCells[0].previousElementSibling) &&
				!this.util.isListCell(selectedCells[cellsLen - 1].nextElementSibling))
		) {
			return {
				sc: selectedCells[0],
				so: 0,
				ec: selectedCells[cellsLen - 1],
				eo: 1
			};
		}

		let originList = selectedCells[0].parentNode;
		let lastCell = selectedCells[cellsLen - 1];
		let range = null;

		if (nested) {
			if (
				originList !== lastCell.parentNode &&
				this.util.isList(lastCell.parentNode.parentNode) &&
				lastCell.nextElementSibling
			) {
				lastCell = lastCell.nextElementSibling;
				while (lastCell) {
					selectedCells.push(lastCell);
					lastCell = lastCell.nextElementSibling;
				}
			}
			range = this.applyList(
				(originList.nodeName.toUpperCase() === "OL" ? "bullet" : "numbered") +
				":" +
				originList.style.listStyleType,
				selectedCells,
				true
			);
		} else {
			let innerList = this.util.createElement(originList.nodeName);
			let prev = selectedCells[0].previousElementSibling;
			let next = lastCell.nextElementSibling;
			const nodePath = {
				s: null,
				e: null,
				sl: originList,
				el: originList
			};

			for (let i = 0, len = cellsLen, c; i < len; i++) {
				c = selectedCells[i];
				if (c.parentNode !== originList) {
					this._attachNested(originList, innerList, prev, next, nodePath);
					originList = c.parentNode;
					innerList = this.util.createElement(originList.nodeName);
				}

				prev = c.previousElementSibling;
				next = c.nextElementSibling;
				innerList.appendChild(c);
			}

			this._attachNested(originList, innerList, prev, next, nodePath);

			const sc = this.util.getNodeFromPath(nodePath.s, nodePath.sl);
			const ec = this.util.getNodeFromPath(nodePath.e, nodePath.el);
			range = {
				sc: sc,
				so: 0,
				ec: ec,
				eo: ec.textContent.length
			};
		}

		return range;
	},

	/**
	 * @description Detach Nested all nested lists under the "baseNode".
	 * Returns a list with nested removed.
	 * @param {Node} baseNode Element on which to base.
	 * @param {Boolean} all If true, it also detach all nested lists of a returned list.
	 * @returns {Element}
	 * @private
	 */
	_removeNestedList: function (baseNode, all) {
		const rNode = DeleteNestedList(baseNode);
		let rangeElement, cNodes;

		if (rNode) {
			rangeElement = rNode.cloneNode(false);
			cNodes = rNode.childNodes;
			const index = this.getPositionIndex(baseNode);
			while (cNodes[index]) {
				rangeElement.appendChild(cNodes[index]);
			}
		} else {
			rangeElement = baseNode;
		}

		let rChildren;
		if (!all) {
			const depth = this.getElementDepth(baseNode) + 2;
			rChildren = this.getListChildren(
				baseNode,
				function (current) {
					return (
						this.isListCell(current) &&
						!current.previousElementSibling &&
						this.getElementDepth(current) === depth
					);
				}.bind(this)
			);
		} else {
			rChildren = this.getListChildren(
				rangeElement,
				function (current) {
					return this.isListCell(current) && !current.previousElementSibling;
				}.bind(this)
			);
		}

		for (let i = 0, len = rChildren.length; i < len; i++) {
			DeleteNestedList(rChildren[i]);
		}

		if (rNode) {
			rNode.parentNode.insertBefore(rangeElement, rNode.nextSibling);
			if (cNodes && cNodes.length === 0) this.removeItem(rNode);
		}

		return rangeElement === baseNode ? rangeElement.parentNode : rangeElement;
	},

	/**
	 * @description wraps text nodes of line selected text.
	 * @param {Element} element The node of the line that contains the selected text node.
	 * @param {Element} newInnerNode The dom that will wrap the selected text area
	 * @param {Function} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {Number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {Number} endOff The endOffset property of the selection object.
	 * @param {Boolean} isRemoveFormat Is the remove all formats command?
	 * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Boolean} collapsed range.collapsed
	 * @returns {{ancestor: *, startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
	 * @private
	 */
	_setNode_oneLine: function (
		element,
		newInnerNode,
		validation,
		startCon,
		startOff,
		endCon,
		endOff,
		isRemoveFormat,
		isRemoveNode,
		collapsed,
		_removeCheck,
		_getMaintainedNode,
		_isMaintainedNode
	) {
		// not add tag
		let parentCon = startCon.parentNode;
		while (
			!parentCon.nextSibling &&
			!parentCon.previousSibling &&
			!util.isFormatElement(parentCon.parentNode) &&
			!util.isWysiwygDiv(parentCon.parentNode)
		) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon === endCon.parentNode && parentCon.nodeName === newInnerNode.nodeName) {
			if (
				util.onlyZeroWidthSpace(startCon.textContent.slice(0, startOff)) &&
				util.onlyZeroWidthSpace(endCon.textContent.slice(endOff))
			) {
				const children = parentCon.childNodes;
				let sameTag = true;

				for (let i = 0, len = children.length, c, s, e, z; i < len; i++) {
					c = children[i];
					z = !util.onlyZeroWidthSpace(c);
					if (c === startCon) {
						s = true;
						continue;
					}
					if (c === endCon) {
						e = true;
						continue;
					}
					if ((!s && z) || (s && e && z)) {
						sameTag = false;
						break;
					}
				}

				if (sameTag) {
					util.copyTagAttributes(parentCon, newInnerNode);

					return {
						startContainer: startCon,
						startOffset: startOff,
						endContainer: endCon,
						endOffset: endOff
					};
				}
			}
		}

		// add tag
		_removeCheck.v = false;
		const inst = this;
		const el = element;
		const nNodeArray = [newInnerNode];
		const pNode = element.cloneNode(false);
		const isSameNode = startCon === endCon;
		let startContainer = startCon;
		let startOffset = startOff;
		let endContainer = endCon;
		let endOffset = endOff;
		let startPass = false;
		let endPass = false;
		let pCurrent, newNode, appendNode, cssText, anchorNode;

		const wRegExp = _w.RegExp;

		function checkCss(vNode) {
			const regExp = new wRegExp("(?:;|^|\\s)(?:" + cssText + "null)\\s*:[^;]*\\s*(?:;|$)", "ig");
			let style = "";

			if (regExp && vNode.style.cssText.length > 0) {
				style = regExp.test(vNode.style.cssText);
			}

			return !style;
		}

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
				let child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;
				let cloneNode;

				// startContainer
				if (!startPass && child === startContainer) {
					let line = pNode;
					anchorNode = _getMaintainedNode(child);
					const prevNode = util.createTextNode(
						startContainer.nodeType === 1 ? "" : startContainer.substringData(0, startOffset)
					);
					const textNode = util.createTextNode(
						startContainer.nodeType === 1 ?
						"" :
						startContainer.substringData(
							startOffset,
							isSameNode ?
							endOffset >= startOffset ?
							endOffset - startOffset :
							startContainer.data.length - startOffset :
							startContainer.data.length - startOffset
						)
					);

					if (anchorNode) {
						const a = _getMaintainedNode(ancestor);
						if (a && a.parentNode !== line) {
							let m = a;
							let p = null;
							while (m.parentNode !== line) {
								ancestor = p = m.parentNode.cloneNode(false);
								while (m.childNodes[0]) {
									p.appendChild(m.childNodes[0]);
								}
								m.appendChild(p);
								m = m.parentNode;
							}
							m.parentNode.appendChild(a);
						}
						anchorNode = anchorNode.cloneNode(false);
					}

					if (!util.onlyZeroWidthSpace(prevNode)) {
						ancestor.appendChild(prevNode);
					}

					const prevAnchorNode = _getMaintainedNode(ancestor);
					if (!!prevAnchorNode) anchorNode = prevAnchorNode;
					if (anchorNode) line = anchorNode;

					newNode = child;
					pCurrent = [];
					cssText = "";
					while (newNode !== line && newNode !== el && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
							pCurrent.push(vNode);
							cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(":")) + "|";
						}
						newNode = newNode.parentNode;
					}

					const childNode = pCurrent.pop() || textNode;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					newInnerNode.appendChild(childNode);
					line.appendChild(newInnerNode);

					if (anchorNode && !_getMaintainedNode(endContainer)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					startContainer = textNode;
					startOffset = 0;
					startPass = true;

					if (newNode !== textNode) newNode.appendChild(startContainer);
					if (!isSameNode) continue;
				}

				// endContainer
				if (!endPass && child === endContainer) {
					anchorNode = _getMaintainedNode(child);
					const afterNode = util.createTextNode(
						endContainer.nodeType === 1 ?
						"" :
						endContainer.substringData(endOffset, endContainer.length - endOffset)
					);
					const textNode = util.createTextNode(
						isSameNode || endContainer.nodeType === 1 ? "" : endContainer.substringData(0, endOffset)
					);

					if (anchorNode) {
						anchorNode = anchorNode.cloneNode(false);
					} else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!util.onlyZeroWidthSpace(afterNode)) {
						newNode = child;
						cssText = "";
						pCurrent = [];
						const anchors = [];
						while (newNode !== pNode && newNode !== el && newNode !== null) {
							if (newNode.nodeType === 1 && checkCss(newNode)) {
								if (_isMaintainedNode(newNode)) anchors.push(newNode.cloneNode(false));
								else pCurrent.push(newNode.cloneNode(false));
								cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(":")) + "|";
							}
							newNode = newNode.parentNode;
						}
						pCurrent = pCurrent.concat(anchors);

						cloneNode = appendNode = newNode = pCurrent.pop() || afterNode;
						while (pCurrent.length > 0) {
							newNode = pCurrent.pop();
							appendNode.appendChild(newNode);
							appendNode = newNode;
						}

						pNode.appendChild(cloneNode);
						newNode.textContent = afterNode.data;
					}

					if (anchorNode && cloneNode) {
						const afterAnchorNode = _getMaintainedNode(cloneNode);
						if (afterAnchorNode) {
							anchorNode = afterAnchorNode;
						}
					}

					newNode = child;
					pCurrent = [];
					cssText = "";
					while (newNode !== pNode && newNode !== el && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
							pCurrent.push(vNode);
							cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(":")) + "|";
						}
						newNode = newNode.parentNode;
					}

					const childNode = pCurrent.pop() || textNode;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						newInnerNode.appendChild(childNode);
						anchorNode.insertBefore(newInnerNode, anchorNode.firstChild);
						pNode.appendChild(anchorNode);
						nNodeArray.push(newInnerNode);
						anchorNode = null;
					} else {
						newInnerNode.appendChild(childNode);
					}

					endContainer = textNode;
					endOffset = textNode.data.length;
					endPass = true;

					if (!isRemoveFormat && collapsed) {
						newInnerNode = textNode;
						textNode.textContent = util.zeroWidthSpace;
					}

					if (newNode !== textNode) newNode.appendChild(endContainer);
					continue;
				}

				// other
				if (startPass) {
					if (child.nodeType === 1 && !util.isBreak(child)) {
						if (util._isIgnoreNodeChange(child)) {
							pNode.appendChild(child.cloneNode(true));
							if (!collapsed) {
								newInnerNode = newInnerNode.cloneNode(false);
								pNode.appendChild(newInnerNode);
								nNodeArray.push(newInnerNode);
							}
						} else {
							recursionFunc(child, child);
						}
						continue;
					}

					newNode = child;
					pCurrent = [];
					cssText = "";
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = endPass ? newNode.cloneNode(false) : validation(newNode);
						if (newNode.nodeType === 1 && !util.isBreak(child) && vNode && checkCss(newNode)) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
							cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(":")) + "|";
						}
						newNode = newNode.parentNode;
					}
					pCurrent = pCurrent.concat(anchors);

					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (
						_isMaintainedNode(newInnerNode.parentNode) &&
						!_isMaintainedNode(childNode) &&
						!util.onlyZeroWidthSpace(newInnerNode)
					) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!endPass && !anchorNode && _isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						const aChildren = childNode.childNodes;
						for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
							newInnerNode.appendChild(aChildren[a]);
						}
						childNode.appendChild(newInnerNode);
						pNode.appendChild(childNode);
						nNodeArray.push(newInnerNode);
						if (newInnerNode.children.length > 0) ancestor = newNode;
						else ancestor = newInnerNode;
					} else if (childNode === child) {
						if (!endPass) ancestor = newInnerNode;
						else ancestor = pNode;
					} else if (endPass) {
						pNode.appendChild(childNode);
						ancestor = newNode;
					} else {
						newInnerNode.appendChild(childNode);
						ancestor = newNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = util.getParentElement(ancestor, function (current) {
								return inst.isNonSplitNode(current.parentNode) || current.parentNode === pNode;
							});
							anchorNode.appendChild(ancestorAnchorNode);
							newInnerNode = ancestorAnchorNode.cloneNode(false);
							nNodeArray.push(newInnerNode);
							pNode.appendChild(newInnerNode);
						} else {
							anchorNode = null;
						}
					}
				}

				cloneNode = child.cloneNode(false);
				ancestor.appendChild(cloneNode);
				if (child.nodeType === 1 && !util.isBreak(child)) coverNode = cloneNode;

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				startContainer: startCon,
				startOffset: startOff,
				endContainer: endCon,
				endOffset: endOff
			};
		}

		isRemoveFormat = isRemoveFormat && isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				let removeNode = nNodeArray[i];
				let textNode, textNode_s, textNode_e;

				if (collapsed) {
					textNode = util.createTextNode(util.zeroWidthSpace);
					pNode.replaceChild(textNode, removeNode);
				} else {
					const rChildren = removeNode.childNodes;
					textNode_s = rChildren[0];
					while (rChildren[0]) {
						textNode_e = rChildren[0];
						pNode.insertBefore(textNode_e, removeNode);
					}
					util.removeItem(removeNode);
				}

				if (i === 0) {
					if (collapsed) {
						startContainer = endContainer = textNode;
					} else {
						startContainer = textNode_s;
						endContainer = textNode_e;
					}
				}
			}
		} else {
			if (isRemoveNode) {
				for (let i = 0; i < nNodeArray.length; i++) {
					SN_StripRemoveNode(nNodeArray[i]);
				}
			}

			if (collapsed) {
				startContainer = endContainer = newInnerNode;
			}
		}

		util.removeEmptyNode(pNode, newInnerNode);

		if (collapsed) {
			startOffset = startContainer.textContent.length;
			endOffset = endContainer.textContent.length;
		}

		// endContainer reset
		const endConReset = isRemoveFormat || endContainer.textContent.length === 0;

		if (!util.isBreak(endContainer) && endContainer.textContent.length === 0) {
			util.removeItem(endContainer);
			endContainer = startContainer;
		}
		endOffset = endConReset ? endContainer.textContent.length : endOffset;

		// node change
		const newStartOffset = {
			s: 0,
			e: 0
		};
		const startPath = util.getNodePath(startContainer, pNode, newStartOffset);

		const mergeEndCon = !endContainer.parentNode;
		if (mergeEndCon) endContainer = startContainer;
		const newEndOffset = {
			s: 0,
			e: 0
		};
		const endPath = util.getNodePath(endContainer, pNode, !mergeEndCon && !endConReset ? newEndOffset : null);

		startOffset += newStartOffset.s;
		endOffset = collapsed ?
			startOffset :
			mergeEndCon ?
			startContainer.textContent.length :
			endConReset ?
			endOffset + newStartOffset.s :
			endOffset + newEndOffset.s;

		// tag merge
		const newOffsets = util.mergeSameTags(pNode, [startPath, endPath], true);

		element.parentNode.replaceChild(pNode, element);

		startContainer = util.getNodeFromPath(startPath, pNode);
		endContainer = util.getNodeFromPath(endPath, pNode);

		return {
			ancestor: pNode,
			startContainer: startContainer,
			startOffset: startOffset + newOffsets[0],
			endContainer: endContainer,
			endOffset: endOffset + newOffsets[1]
		};
	},

	/**
	 * @description wraps first line selected text.
	 * @param {Element} element The node of the line that contains the selected text node.
	 * @param {Element} newInnerNode The dom that will wrap the selected text area
	 * @param {Function} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {Number} startOff The startOffset property of the selection object.
	 * @param {Boolean} isRemoveFormat Is the remove all formats command?
	 * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
	 * @returns {null|Node} If end container is renewed, returned renewed node
	 * @returns {Object} { ancestor, container, offset, endContainer }
	 * @private
	 */
	_setNode_startLine: function (
		element,
		newInnerNode,
		validation,
		startCon,
		startOff,
		isRemoveFormat,
		isRemoveNode,
		_removeCheck,
		_getMaintainedNode,
		_isMaintainedNode,
		_endContainer
	) {
		// not add tag
		let parentCon = startCon.parentNode;
		while (
			!parentCon.nextSibling &&
			!parentCon.previousSibling &&
			!util.isFormatElement(parentCon.parentNode) &&
			!util.isWysiwygDiv(parentCon.parentNode)
		) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (
			!isRemoveNode &&
			parentCon.nodeName === newInnerNode.nodeName &&
			!util.isFormatElement(parentCon) &&
			!parentCon.nextSibling &&
			util.onlyZeroWidthSpace(startCon.textContent.slice(0, startOff))
		) {
			let sameTag = true;
			let s = startCon.previousSibling;
			while (s) {
				if (!util.onlyZeroWidthSpace(s)) {
					sameTag = false;
					break;
				}
				s = s.previousSibling;
			}

			if (sameTag) {
				util.copyTagAttributes(parentCon, newInnerNode);

				return {
					ancestor: element,
					container: startCon,
					offset: startOff
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		const inst = this;
		const el = element;
		const nNodeArray = [newInnerNode];
		const pNode = element.cloneNode(false);

		let container = startCon;
		let offset = startOff;
		let passNode = false;
		let pCurrent, newNode, appendNode, anchorNode;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
				const child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;

				if (passNode && !util.isBreak(child)) {
					if (child.nodeType === 1) {
						if (util._isIgnoreNodeChange(child)) {
							newInnerNode = newInnerNode.cloneNode(false);
							cloneChild = child.cloneNode(true);
							pNode.appendChild(cloneChild);
							pNode.appendChild(newInnerNode);
							nNodeArray.push(newInnerNode);

							// end container
							if (_endContainer && child.contains(_endContainer)) {
								const endPath = util.getNodePath(_endContainer, child);
								_endContainer = util.getNodeFromPath(endPath, cloneChild);
							}
						} else {
							recursionFunc(child, child);
						}
						continue;
					}

					newNode = child;
					pCurrent = [];
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = validation(newNode);
						if (newNode.nodeType === 1 && vNode) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
						}
						newNode = newNode.parentNode;
					}
					pCurrent = pCurrent.concat(anchors);

					const isTopNode = pCurrent.length > 0;
					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!anchorNode && _isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						const aChildren = childNode.childNodes;
						for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
							newInnerNode.appendChild(aChildren[a]);
						}
						childNode.appendChild(newInnerNode);
						pNode.appendChild(childNode);
						ancestor = !_isMaintainedNode(newNode) ? newNode : newInnerNode;
						nNodeArray.push(newInnerNode);
					} else if (isTopNode) {
						newInnerNode.appendChild(childNode);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = util.getParentElement(ancestor, function (current) {
								return inst.isNonSplitNode(current.parentNode) || current.parentNode === pNode;
							});
							anchorNode.appendChild(ancestorAnchorNode);
							newInnerNode = ancestorAnchorNode.cloneNode(false);
							nNodeArray.push(newInnerNode);
							pNode.appendChild(newInnerNode);
						} else {
							anchorNode = null;
						}
					}
				}

				// startContainer
				if (!passNode && child === container) {
					let line = pNode;
					anchorNode = _getMaintainedNode(child);
					const prevNode = util.createTextNode(
						container.nodeType === 1 ? "" : container.substringData(0, offset)
					);
					const textNode = util.createTextNode(
						container.nodeType === 1 ? "" : container.substringData(offset, container.length - offset)
					);

					if (anchorNode) {
						const a = _getMaintainedNode(ancestor);
						if (a && a.parentNode !== line) {
							let m = a;
							let p = null;
							while (m.parentNode !== line) {
								ancestor = p = m.parentNode.cloneNode(false);
								while (m.childNodes[0]) {
									p.appendChild(m.childNodes[0]);
								}
								m.appendChild(p);
								m = m.parentNode;
							}
							m.parentNode.appendChild(a);
						}
						anchorNode = anchorNode.cloneNode(false);
					}

					if (!util.onlyZeroWidthSpace(prevNode)) {
						ancestor.appendChild(prevNode);
					}

					const prevAnchorNode = _getMaintainedNode(ancestor);
					if (!!prevAnchorNode) anchorNode = prevAnchorNode;
					if (anchorNode) line = anchorNode;

					newNode = ancestor;
					pCurrent = [];
					while (newNode !== line && newNode !== null) {
						vNode = validation(newNode);
						if (newNode.nodeType === 1 && vNode) {
							pCurrent.push(vNode);
						}
						newNode = newNode.parentNode;
					}

					const childNode = pCurrent.pop() || ancestor;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (childNode !== ancestor) {
						newInnerNode.appendChild(childNode);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (util.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));
					line.appendChild(newInnerNode);

					container = textNode;
					offset = 0;
					passNode = true;

					ancestor.appendChild(container);
					continue;
				}

				vNode = !passNode ? child.cloneNode(false) : validation(child);
				if (vNode) {
					ancestor.appendChild(vNode);
					if (child.nodeType === 1 && !util.isBreak(child)) coverNode = vNode;
				}

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				container: startCon,
				offset: startOff,
				endContainer: _endContainer
			};
		}

		isRemoveFormat = isRemoveFormat && isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				let removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				const textNode = rChildren[0];
				while (rChildren[0]) {
					pNode.insertBefore(rChildren[0], removeNode);
				}
				util.removeItem(removeNode);

				if (i === 0) container = textNode;
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		if (!isRemoveFormat && pNode.childNodes.length === 0) {
			if (element.childNodes) {
				container = element.childNodes[0];
			} else {
				container = util.createTextNode(util.zeroWidthSpace);
				element.appendChild(container);
			}
		} else {
			util.removeEmptyNode(pNode, newInnerNode);

			if (util.onlyZeroWidthSpace(pNode.textContent)) {
				container = pNode.firstChild;
				offset = 0;
			}

			// node change
			const offsets = {
				s: 0,
				e: 0
			};
			const path = util.getNodePath(container, pNode, offsets);
			offset += offsets.s;

			// tag merge
			const newOffsets = util.mergeSameTags(pNode, [path], true);

			element.parentNode.replaceChild(pNode, element);

			container = util.getNodeFromPath(path, pNode);
			offset += newOffsets[0];
		}

		return {
			ancestor: pNode,
			container: container,
			offset: offset,
			endContainer: _endContainer
		};
	},

	/**
	 * @description wraps mid lines selected text.
	 * @param {Element} element The node of the line that contains the selected text node.
	 * @param {Element} newInnerNode The dom that will wrap the selected text area
	 * @param {Function} validation Check if the node should be stripped.
	 * @param {Boolean} isRemoveFormat Is the remove all formats command?
	 * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Node} _endContainer Offset node of last line already modified (end.container)
	 * @returns {Object} { ancestor, endContainer: "If end container is renewed, returned renewed node" }
	 * @private
	 */
	_setNode_middleLine: function (
		element,
		newInnerNode,
		validation,
		isRemoveFormat,
		isRemoveNode,
		_removeCheck,
		_endContainer
	) {
		// not add tag
		if (!isRemoveNode) {
			// end container path
			let endPath = null;
			if (_endContainer && element.contains(_endContainer)) endPath = util.getNodePath(_endContainer, element);

			const tempNode = element.cloneNode(true);
			const newNodeName = newInnerNode.nodeName;
			const newCssText = newInnerNode.style.cssText;
			const newClass = newInnerNode.className;

			let children = tempNode.childNodes;
			let i = 0,
				len = children.length;
			for (let child; i < len; i++) {
				child = children[i];
				if (child.nodeType === 3) break;
				if (child.nodeName === newNodeName) {
					child.style.cssText += newCssText;
					util.addClass(child, newClass);
				} else if (!util.isBreak(child) && util._isIgnoreNodeChange(child)) {
					continue;
				} else if (len === 1) {
					children = child.childNodes;
					len = children.length;
					i = -1;
					continue;
				} else {
					break;
				}
			}

			if (len > 0 && i === len) {
				element.innerHTML = tempNode.innerHTML;
				return {
					ancestor: element,
					endContainer: endPath ? util.getNodeFromPath(endPath, element) : null
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		const pNode = element.cloneNode(false);
		const nNodeArray = [newInnerNode];
		let noneChange = true;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
				let child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;

				if (!util.isBreak(child) && util._isIgnoreNodeChange(child)) {
					if (newInnerNode.childNodes.length > 0) {
						pNode.appendChild(newInnerNode);
						newInnerNode = newInnerNode.cloneNode(false);
					}

					cloneChild = child.cloneNode(true);
					pNode.appendChild(cloneChild);
					pNode.appendChild(newInnerNode);
					nNodeArray.push(newInnerNode);
					ancestor = newInnerNode;

					// end container
					if (_endContainer && child.contains(_endContainer)) {
						const endPath = util.getNodePath(_endContainer, child);
						_endContainer = util.getNodeFromPath(endPath, cloneChild);
					}

					continue;
				} else {
					vNode = validation(child);
					if (vNode) {
						noneChange = false;
						ancestor.appendChild(vNode);
						if (child.nodeType === 1) coverNode = vNode;
					}
				}

				if (!util.isBreak(child)) recursionFunc(child, coverNode);
			}
		})(element, newInnerNode);

		// not remove tag
		if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v))
			return {
				ancestor: element,
				endContainer: _endContainer
			};

		pNode.appendChild(newInnerNode);

		if (isRemoveFormat && isRemoveNode) {
			for (let i = 0; i < nNodeArray.length; i++) {
				let removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				while (rChildren[0]) {
					pNode.insertBefore(rChildren[0], removeNode);
				}
				util.removeItem(removeNode);
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		util.removeEmptyNode(pNode, newInnerNode);
		util.mergeSameTags(pNode, null, true);

		// node change
		element.parentNode.replaceChild(pNode, element);
		return {
			ancestor: pNode,
			endContainer: _endContainer
		};
	},

	/**
	 * @description wraps last line selected text.
	 * @param {Element} element The node of the line that contains the selected text node.
	 * @param {Element} newInnerNode The dom that will wrap the selected text area
	 * @param {Function} validation Check if the node should be stripped.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {Number} endOff The endOffset property of the selection object.
	 * @param {Boolean} isRemoveFormat Is the remove all formats command?
	 * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
	 * @returns {Object} { ancestor, container, offset }
	 * @private
	 */
	_setNode_endLine: function (
		element,
		newInnerNode,
		validation,
		endCon,
		endOff,
		isRemoveFormat,
		isRemoveNode,
		_removeCheck,
		_getMaintainedNode,
		_isMaintainedNode
	) {
		// not add tag
		let parentCon = endCon.parentNode;
		while (
			!parentCon.nextSibling &&
			!parentCon.previousSibling &&
			!util.isFormatElement(parentCon.parentNode) &&
			!util.isWysiwygDiv(parentCon.parentNode)
		) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (
			!isRemoveNode &&
			parentCon.nodeName === newInnerNode.nodeName &&
			!util.isFormatElement(parentCon) &&
			!parentCon.previousSibling &&
			util.onlyZeroWidthSpace(endCon.textContent.slice(endOff))
		) {
			let sameTag = true;
			let e = endCon.nextSibling;
			while (e) {
				if (!util.onlyZeroWidthSpace(e)) {
					sameTag = false;
					break;
				}
				e = e.nextSibling;
			}

			if (sameTag) {
				util.copyTagAttributes(parentCon, newInnerNode);

				return {
					ancestor: element,
					container: endCon,
					offset: endOff
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		const inst = this;
		const el = element;
		const nNodeArray = [newInnerNode];
		const pNode = element.cloneNode(false);

		let container = endCon;
		let offset = endOff;
		let passNode = false;
		let pCurrent, newNode, appendNode, anchorNode;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = childNodes.length - 1, vNode; 0 <= i; i--) {
				const child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;

				if (passNode && !util.isBreak(child)) {
					if (child.nodeType === 1) {
						if (util._isIgnoreNodeChange(child)) {
							newInnerNode = newInnerNode.cloneNode(false);
							const cloneChild = child.cloneNode(true);
							pNode.insertBefore(cloneChild, ancestor);
							pNode.insertBefore(newInnerNode, cloneChild);
							nNodeArray.push(newInnerNode);
						} else {
							recursionFunc(child, child);
						}
						continue;
					}

					newNode = child;
					pCurrent = [];
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = validation(newNode);
						if (vNode && newNode.nodeType === 1) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
						}
						newNode = newNode.parentNode;
					}
					pCurrent = pCurrent.concat(anchors);

					const isTopNode = pCurrent.length > 0;
					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.insertBefore(newInnerNode, pNode.firstChild);
						nNodeArray.push(newInnerNode);
					}

					if (!anchorNode && _isMaintainedNode(childNode)) {
						newInnerNode = newInnerNode.cloneNode(false);
						const aChildren = childNode.childNodes;
						for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
							newInnerNode.appendChild(aChildren[a]);
						}
						childNode.appendChild(newInnerNode);
						pNode.insertBefore(childNode, pNode.firstChild);
						nNodeArray.push(newInnerNode);
						if (newInnerNode.children.length > 0) ancestor = newNode;
						else ancestor = newInnerNode;
					} else if (isTopNode) {
						newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = util.getParentElement(ancestor, function (current) {
								return inst.node.isNonSplitNode(current.parentNode) || current.parentNode === pNode;
							});
							anchorNode.appendChild(ancestorAnchorNode);
							newInnerNode = ancestorAnchorNode.cloneNode(false);
							nNodeArray.push(newInnerNode);
							pNode.insertBefore(newInnerNode, pNode.firstChild);
						} else {
							anchorNode = null;
						}
					}
				}

				// endContainer
				if (!passNode && child === container) {
					anchorNode = _getMaintainedNode(child);
					const afterNode = util.createTextNode(
						container.nodeType === 1 ? "" : container.substringData(offset, container.length - offset)
					);
					const textNode = util.createTextNode(
						container.nodeType === 1 ? "" : container.substringData(0, offset)
					);

					if (anchorNode) {
						anchorNode = anchorNode.cloneNode(false);
						const a = _getMaintainedNode(ancestor);
						if (a && a.parentNode !== pNode) {
							let m = a;
							let p = null;
							while (m.parentNode !== pNode) {
								ancestor = p = m.parentNode.cloneNode(false);
								while (m.childNodes[0]) {
									p.appendChild(m.childNodes[0]);
								}
								m.appendChild(p);
								m = m.parentNode;
							}
							m.parentNode.insertBefore(a, m.parentNode.firstChild);
						}
						anchorNode = anchorNode.cloneNode(false);
					} else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!util.onlyZeroWidthSpace(afterNode)) {
						ancestor.insertBefore(afterNode, ancestor.firstChild);
					}

					newNode = ancestor;
					pCurrent = [];
					while (newNode !== pNode && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1) {
							pCurrent.push(vNode);
						}
						newNode = newNode.parentNode;
					}

					const childNode = pCurrent.pop() || ancestor;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (childNode !== ancestor) {
						newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (util.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));

					if (anchorNode) {
						anchorNode.insertBefore(newInnerNode, anchorNode.firstChild);
						pNode.insertBefore(anchorNode, pNode.firstChild);
						anchorNode = null;
					} else {
						pNode.insertBefore(newInnerNode, pNode.firstChild);
					}

					container = textNode;
					offset = textNode.data.length;
					passNode = true;

					ancestor.insertBefore(container, ancestor.firstChild);
					continue;
				}

				vNode = !passNode ? child.cloneNode(false) : validation(child);
				if (vNode) {
					ancestor.insertBefore(vNode, ancestor.firstChild);
					if (child.nodeType === 1 && !util.isBreak(child)) coverNode = vNode;
				}

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				container: endCon,
				offset: endOff
			};
		}

		isRemoveFormat = isRemoveFormat && isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				let removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				let textNode = null;
				while (rChildren[0]) {
					textNode = rChildren[0];
					pNode.insertBefore(textNode, removeNode);
				}
				util.removeItem(removeNode);

				if (i === nNodeArray.length - 1) {
					container = textNode;
					offset = textNode.textContent.length;
				}
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		if (!isRemoveFormat && pNode.childNodes.length === 0) {
			if (element.childNodes) {
				container = element.childNodes[0];
			} else {
				container = util.createTextNode(util.zeroWidthSpace);
				element.appendChild(container);
			}
		} else {
			if (!isRemoveNode && newInnerNode.textContent.length === 0) {
				util.removeEmptyNode(pNode, null);
				return {
					ancestor: null,
					container: null,
					offset: 0
				};
			}

			util.removeEmptyNode(pNode, newInnerNode);

			if (util.onlyZeroWidthSpace(pNode.textContent)) {
				container = pNode.firstChild;
				offset = container.textContent.length;
			} else if (util.onlyZeroWidthSpace(container)) {
				container = newInnerNode;
				offset = 1;
			}

			// node change
			const offsets = {
				s: 0,
				e: 0
			};
			const path = util.getNodePath(container, pNode, offsets);
			offset += offsets.s;

			// tag merge
			const newOffsets = util.mergeSameTags(pNode, [path], true);

			element.parentNode.replaceChild(pNode, element);

			container = util.getNodeFromPath(path, pNode);
			offset += newOffsets[0];
		}

		return {
			ancestor: pNode,
			container: container,
			offset: offset
		};
	},

	/**
	 * @description Node with font-size style
	 * @param {Node} element Element to check
	 * @returns {Boolean}
	 * @private
	 */
	_sn_isSizeNode: function (element) {
		return element && element.nodeType !== 3 && this.node.isTextStyleNode(element) && !!element.style.fontSize;
	},

	/**
	 * @description Return the parent maintained tag. (bind and use a util object)
	 * @param {Element} element Element
	 * @returns {Element}
	 * @private
	 */
	_sn_getMaintainedNode: function (_isRemove, _isSizeNode, element) {
		if (!element || _isRemove) return null;
		return (
			util.getParentElement(element, this.node.isNonSplitNode) ||
			(!_isSizeNode ? util.getParentElement(element, Format.IsSizeNode) : null)
		);
	},

	/**
	 * @description Check if element is a tag that should be persisted. (bind and use a util object)
	 * @param {Element} element Element
	 * @returns {Element}
	 * @private
	 */
	_sn_isMaintainedNode = function (_isRemove, _isSizeNode, element) {
		if (!element || _isRemove || element.nodeType !== 1) return false;
		const anchor = this.node.isNonSplitNode(element);
		return util.getParentElement(element, this.node.isNonSplitNode) ?
			anchor :
			anchor || (!_isSizeNode ? Format.IsSizeNode(element) : false);
	},

	/**
	 * @description If certain styles are applied to all child nodes of the list cell, the style of the list cell is also changed. (bold, color, size)
	 * @param {Element} el List cell element. <li>
	 * @param {Element|null} child Variable for recursive call. ("null" on the first call)
	 * @private
	 */
	_sn_setCommonListStyle: function (el, child) {
		if (!util.isListCell(el)) return;
		if (!child) el.removeAttribute("style");

		const children = util.getArrayItem(
			(child || el).childNodes,
			function (current) {
				return !util.isBreak(current);
			},
			true
		);

		if (children[0] && children.length === 1) {
			child = children[0];
			if (!child || child.nodeType !== 1) return;

			const childStyle = child.style;
			const elStyle = el.style;

			// bold, italic
			if (this.options._textTagsMap[child.nodeName.toLowerCase()] === this.editor._defaultCommand.bold.toLowerCase()) elStyle.fontWeight = 'bold'; // bold
			else if (childStyle.fontWeight) elStyle.fontWeight = childStyle.fontWeight;
			if (this.options._textTagsMap[child.nodeName.toLowerCase()] === this.editor._defaultCommand.italic.toLowerCase()) elStyle.fontStyle = 'italic'; // italic
			else if (childStyle.fontStyle) elStyle.fontStyle = childStyle.fontStyle;

			// styles
			if (childStyle.color) elStyle.color = childStyle.color; // color
			if (childStyle.fontSize) elStyle.fontSize = childStyle.fontSize; // size

			this._sn_setCommonListStyle(el, child);
		}
	},

	constructor: Format
};

function DeleteNestedList(baseNode) {
	const baseParent = baseNode.parentNode;
	let sibling = baseParent;
	let parent = sibling.parentNode;
	let liSibling, liParent, child, index, c;

	while (util.isListCell(parent)) {
		index = util.getPositionIndex(baseNode);
		liSibling = parent.nextElementSibling;
		liParent = parent.parentNode;
		child = sibling;
		while (child) {
			sibling = sibling.nextSibling;
			if (util.isList(child)) {
				c = child.childNodes;
				while (c[index]) {
					liParent.insertBefore(c[index], liSibling);
				}
				if (c.length === 0) util.removeItem(child);
			} else {
				liParent.appendChild(child);
			}
			child = sibling;
		}
		sibling = liParent;
		parent = liParent.parentNode;
	}

	if (baseParent.children.length === 0) util.removeItem(baseParent);

	return liParent;
};

function SetLineMargin(lines, size, dir) {
	const cells = [];

	for (let i = 0, len = lines.length, f, margin; i < len; i++) {
		f = lines[i];
		if (!util.isListCell(f)) {
			margin = /\d+/.test(f.style[dir]) ? util.getNumber(f.style[dir], 0) : 0;
			margin += size;
			util.setStyle(f, dir, margin <= 0 ? "" : margin + "px");
		} else {
			if (size < 0 || f.previousElementSibling) {
				cells.push(f);
			}
		}
	}

	return cells;
};

/**
 * @description Strip remove node
 * @param {Node} removeNode The remove node
 * @private
 */
function SN_StripRemoveNode(removeNode) {
	const element = removeNode.parentNode;
	if (!removeNode || removeNode.nodeType === 3 || !element) return;

	const children = removeNode.childNodes;
	while (children[0]) {
		element.insertBefore(children[0], removeNode);
	}

	element.removeChild(removeNode);
};

export default Format;