/**
 * @fileoverview Format class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Format = function(editor) {
	CoreInterface.call(this, editor);

	this.range = null;
	this.selectionNode = null;
};

Format.prototype = {
	/**
	 * @description Append format element to sibling node of argument element.
	 * If the "lineNode" argument value is present, the tag of that argument value is inserted,
	 * If not, the currently selected format tag is inserted.
	 * @param {Element} element Insert as siblings of that element
	 * @param {String|Element|null} lineNode Node name or node obejct to be inserted
	 * @returns {Element}
	 */
	appendLine: function(element, lineNode) {
		const currentFormatEl = util.getFormatElement(this.getSelectionNode(), null);
		const oFormatName = lineNode
			? typeof lineNode === "string"
				? lineNode
				: lineNode.nodeName
			: util.isFormatElement(currentFormatEl) && !util.isFreeFormatElement(currentFormatEl)
			? currentFormatEl.nodeName
			: options.defaultTag;
		const oFormat = util.createElement(oFormatName);
		oFormat.innerHTML = "<br>";

		if ((lineNode && typeof lineNode !== "string") || (!lineNode && util.isFormatElement(currentFormatEl))) {
			util.copyTagAttributes(oFormat, lineNode || currentFormatEl);
		}

		if (util.isCell(element)) element.insertBefore(oFormat, element.nextElementSibling);
		else element.parentNode.insertBefore(oFormat, element.nextElementSibling);

		return oFormat;
	},

	/**
	 * @description Appended all selected format Element to the argument element and insert
	 * @param {Element} rangeBlock Element of wrap the arguments (BLOCKQUOTE...)
	 */
	applyRangeBlock: function(rangeBlock) {
		this.getRange_addLine(this.getRange(), null);
		const rangeLines = this.getSelectedElementsAndComponents(false);
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
			standTag = util.getRangeFormatElement(last, null) || util.getFormatElement(last, null);
		}

		if (util.isCell(standTag)) {
			beforeTag = null;
			pElement = standTag;
		} else {
			beforeTag = standTag.nextSibling;
			pElement = standTag.parentNode;
		}

		let parentDepth = util.getElementDepth(standTag);
		let listParent = null;
		const lineArr = [];
		const removeItems = function(parent, origin, before) {
			let cc = null;
			if (parent !== origin && !util.isTable(origin)) {
				if (origin && util.getElementDepth(parent) === util.getElementDepth(origin)) return before;
				cc = util.removeItemAllParents(origin, null, parent);
			}

			return cc ? cc.ec : before;
		};

		for (
			let i = 0, len = rangeLines.length, line, originParent, depth, before, nextLine, nextList, nested;
			i < len;
			i++
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
		util.mergeSameTags(rangeBlock, null, false);
		util.mergeNestedTags(
			rangeBlock,
			function(current) {
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
				function(current) {
					return this.isRangeFormatElement(current) && !this.isList(current);
				}.bind(util)
			);
			const splitRange = util.splitElement(
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
	removeRangeBlock: function(rangeElement, selectedFormats, newRangeElement, remove, notHistoryPush) {
		const range = this.getRange();
		const so = range.startOffset;
		const eo = range.endOffset;

		let children = util.getListChildNodes(rangeElement, function(current) {
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
							remove
								? inner.nodeName
								: util.isList(rangeElement.parentNode) || util.isListCell(rangeElement.parentNode)
								? "LI"
								: util.isCell(rangeElement.parentNode)
								? "DIV"
								: options.defaultTag
						);
						const isCell = util.isListCell(insNode);
						const innerChildren = inner.childNodes;
						while (innerChildren[0]) {
							if (util.isList(innerChildren[0]) && !isCell) break;
							insNode.appendChild(innerChildren[0]);
						}
						util.copyFormatAttributes(insNode, inner);
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
						children = util.getListChildNodes(rangeElement, function(current) {
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
		rangeRight = rangeElement.nextSibling;

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
	applyList: function(type, selectedCells, nested) {
		const listTag = type.split(":")[0] === "bullet" ? "OL" : "UL";
		const listStyle = type.split(":")[1] || "";

		let range = this.getRange();
		let selectedFormats = !selectedCells ? this.getSelectedElementsAndComponents(false) : selectedCells;

		if (selectedFormats.length === 0) {
			if (selectedCells) return;
			range = this.getRange_addLine(range, null);
			selectedFormats = this.getSelectedElementsAndComponents(false);
			if (selectedFormats.length === 0) return;
		}

		const util = this.util;
		util.sortByDepth(selectedFormats, true);

		// merge
		let firstSel = selectedFormats[0];
		let lastSel = selectedFormats[selectedFormats.length - 1];
		let topEl =
			(util.isListCell(firstSel) || util.isComponent(firstSel)) && !firstSel.previousElementSibling
				? firstSel.parentNode.previousElementSibling
				: firstSel.previousElementSibling;
		let bottomEl =
			(util.isListCell(lastSel) || util.isComponent(lastSel)) && !lastSel.nextElementSibling
				? lastSel.parentNode.nextElementSibling
				: lastSel.nextElementSibling;

		const originRange = {
			sc: range.startContainer,
			so: range.startOffset,
			ec: range.endContainer,
			eo: range.endOffset
		};

		let isRemove = true;

		for (let i = 0, len = selectedFormats.length; i < len; i++) {
			if (
				!util.isList(
					util.getRangeFormatElement(
						selectedFormats[i],
						function(current) {
							return this.getRangeFormatElement(current) && current !== selectedFormats[i];
						}.bind(util)
					)
				)
			) {
				isRemove = false;
				break;
			}
		}

		if (
			isRemove &&
			(!topEl || (firstSel.tagName !== topEl.tagName || listTag !== topEl.tagName.toUpperCase())) &&
			(!bottomEl || (lastSel.tagName !== bottomEl.tagName || listTag !== bottomEl.tagName.toUpperCase()))
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

			const currentFormat = util.getRangeFormatElement(firstSel);
			const cancel = currentFormat && currentFormat.tagName === listTag;
			let rangeArr, tempList;
			const passComponent = function(current) {
				return !this.isComponent(current);
			}.bind(util);

			if (!cancel) {
				tempList = util.createElement(listTag);
				tempList.style.listStyleType = listStyle;
			}

			for (let i = 0, len = selectedFormats.length, r, o; i < len; i++) {
				o = util.getRangeFormatElement(selectedFormats[i], passComponent);
				if (!o || !util.isList(o)) continue;

				if (!r) {
					r = o;
					rangeArr = { r: r, f: [util.getParentElement(selectedFormats[i], "LI")] };
				} else {
					if (r !== o) {
						if (nested && util.isListCell(o.parentNode)) {
							Format.DetachNested(rangeArr.f);
						} else {
							this.removeRangeBlock(rangeArr.f[0].parentNode, rangeArr.f, tempList, false, true);
						}

						o = selectedFormats[i].parentNode;
						if (!cancel) {
							tempList = util.createElement(listTag);
							tempList.style.listStyleType = listStyle;
						}

						r = o;
						rangeArr = { r: r, f: [util.getParentElement(selectedFormats[i], "LI")] };
					} else {
						rangeArr.f.push(util.getParentElement(selectedFormats[i], "LI"));
					}
				}

				if (i === len - 1) {
					if (nested && util.isListCell(o.parentNode)) {
						Format.DetachNested(rangeArr.f);
					} else {
						this.removeRangeBlock(rangeArr.f[0].parentNode, rangeArr.f, tempList, false, true);
					}
				}
			}
		} else {
			const topElParent = topEl ? topEl.parentNode : topEl;
			const bottomElParent = bottomEl ? bottomEl.parentNode : bottomEl;
			topEl =
				topElParent && !util.isWysiwygDiv(topElParent) && topElParent.nodeName === listTag
					? topElParent
					: topEl;
			bottomEl =
				bottomElParent && !util.isWysiwygDiv(bottomElParent) && bottomElParent.nodeName === listTag
					? bottomElParent
					: bottomEl;

			const mergeTop = topEl && topEl.tagName === listTag;
			const mergeBottom = bottomEl && bottomEl.tagName === listTag;

			let list = mergeTop ? topEl : util.createElement(listTag);
			list.style.listStyleType = listStyle;
			let firstList = null;
			let lastList = null;
			let topNumber = null;
			let bottomNumber = null;

			const passComponent = function(current) {
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
					rangeTag;
				i < len;
				i++
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
					isCell && !util.isWysiwygDiv(originParent)
						? !next || util.isListCell(parentTag)
							? originParent
							: originParent.nextSibling
						: fTag.nextSibling;

				newCell = util.createElement("LI");
				util.copyFormatAttributes(newCell, fTag);
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
					(util.getRangeFormatElement(nextParent, passComponent) !==
						util.getRangeFormatElement(originParent, passComponent) ||
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
	removeList: function(selectedCells, remove) {
		let rangeArr = {};
		let listFirst = false;
		let listLast = false;
		let first = null;
		let last = null;
		const passComponent = function(current) {
			return !this.isComponent(current);
		}.bind(util);

		for (let i = 0, len = selectedCells.length, r, o, lastIndex, isList; i < len; i++) {
			lastIndex = i === len - 1;
			o = util.getRangeFormatElement(selectedCells[i], passComponent);
			isList = util.isList(o);
			if (!r && isList) {
				r = o;
				rangeArr = { r: r, f: [util.getParentElement(selectedCells[i], "LI")] };
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
						rangeArr = { r: r, f: [util.getParentElement(selectedCells[i], "LI")] };
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
	 * @description Nest list cells or cancel nested cells.
	 * @param selectedCells List cells.
	 * @param nested Nested or cancel nested.
	 * @private
	 */
	_applyNestedList: function(selectedCells, nested) {
		selectedCells = !selectedCells
			? this.getSelectedElements().filter(
					function(el) {
						return this.isListCell(el);
					}.bind(this.util)
			  )
			: selectedCells;
		const cellsLen = selectedCells.length;
		if (
			cellsLen === 0 ||
			(!nested &&
				(!this.util.isListCell(selectedCells[0].previousElementSibling) &&
					!this.util.isListCell(selectedCells[cellsLen - 1].nextElementSibling)))
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
			const nodePath = { s: null, e: null, sl: originList, el: originList };

			for (let i = 0, len = cellsLen, c; i < len; i++) {
				c = selectedCells[i];
				if (c.parentNode !== originList) {
					Format.InsiedList(originList, innerList, prev, next, nodePath);
					originList = c.parentNode;
					innerList = this.util.createElement(originList.nodeName);
				}

				prev = c.previousElementSibling;
				next = c.nextElementSibling;
				innerList.appendChild(c);
			}

			Format.InsiedList(originList, innerList, prev, next, nodePath);

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
	_removeNestedList: function(baseNode, all) {
		const rNode = Format.DeleteNestedList(baseNode);
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
				function(current) {
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
				function(current) {
					return this.isListCell(current) && !current.previousElementSibling;
				}.bind(this)
			);
		}

		for (let i = 0, len = rChildren.length; i < len; i++) {
			Format.DeleteNestedList(rChildren[i]);
		}

		if (rNode) {
			rNode.parentNode.insertBefore(rangeElement, rNode.nextSibling);
			if (cNodes && cNodes.length === 0) this.removeItem(rNode);
		}

		return rangeElement === baseNode ? rangeElement.parentNode : rangeElement;
	},

	/**
	 * @description Indent more the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
	indent: function() {
		const range = this.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;
		const so = range.startOffset;
		const eo = range.endOffset;

		const lines = this.getSelectedElements(null);
		const cells = Format.SetLineMargin(
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
	outdent: function() {
		const range = this.getRange();
		const sc = range.startContainer;
		const ec = range.endContainer;
		const so = range.startOffset;
		const eo = range.endOffset;

		const lines = this.getSelectedElements(null);
		const cells = Format.SetLineMargin(
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

	constructor: Format
};

Format.DetachNested = function(cells) {
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
	this.util.mergeSameTags(parentNode);

	const edge = this.util.getEdgeChildNodes(first, last);

	return {
		cc: first.parentNode,
		sc: edge.sc,
		ec: edge.ec
	};
};

Format.InsiedList = function(originList, innerList, prev, next, nodePath) {
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
};

Format.DeleteNestedList = function(baseNode) {
	const baseParent = baseNode.parentNode;
	let sibling = baseParent;
	let parent = sibling.parentNode;
	let liSibling, liParent, child, index, c;

	while (this.isListCell(parent)) {
		index = this.getPositionIndex(baseNode);
		liSibling = parent.nextElementSibling;
		liParent = parent.parentNode;
		child = sibling;
		while (child) {
			sibling = sibling.nextSibling;
			if (this.isList(child)) {
				c = child.childNodes;
				while (c[index]) {
					liParent.insertBefore(c[index], liSibling);
				}
				if (c.length === 0) this.removeItem(child);
			} else {
				liParent.appendChild(child);
			}
			child = sibling;
		}
		sibling = liParent;
		parent = liParent.parentNode;
	}

	if (baseParent.children.length === 0) this.removeItem(baseParent);

	return liParent;
};

Format.SetLineMargin = function(lines, size, dir) {
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

export default Format;
