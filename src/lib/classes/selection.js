/**
 * @fileoverview Selection class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Selection = function (editor) {
	CoreInterface.call(this, editor);

	this.range = null;
	this.selectionNode = null;
};

Selection.prototype = {
	/**
	 * @description Return the range object of editor's first child node
	 * @returns {Object}
	 * @private
	 */
	_createDefaultRange: function () {
		const wysiwyg = context.element.wysiwyg;
		wysiwyg.focus();
		const range = this._wd.createRange();

		let focusEl = wysiwyg.firstElementChild;
		if (!focusEl) {
			focusEl = util.createElement(options.defaultTag);
			focusEl.innerHTML = "<br>";
			wysiwyg.appendChild(focusEl);
		}

		range.setStart(focusEl, 0);
		range.setEnd(focusEl, 0);

		return range;
	},

	/**
	 * @description Saving the range object and the currently selected node of editor
	 * @private
	 */
	_init: function () {
		const selection = this.get();
		if (!selection) return null;
		let range = null;
		let selectionNode = null;

		if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
		} else {
			range = this._createDefaultRange();
		}

		this._variable._range = range;

		if (range.collapsed) {
			if (util.isWysiwygDiv(range.commonAncestorContainer))
				selectionNode =
					range.commonAncestorContainer.children[range.startOffset] || range.commonAncestorContainer;
			else selectionNode = range.commonAncestorContainer;
		} else {
			selectionNode = selection.extentNode || selection.anchorNode;
		}

		this._variable._selectionNode = selectionNode;
	},

	/**
	 * @description Get current editor's range object
	 * @returns {Object}
	 */
	getRange: function () {
		const range = this._variable._range || this._createDefaultRange();
		const selection = this.get();
		if (range.collapsed === selection.isCollapsed || !context.element.wysiwyg.contains(selection.focusNode))
			return range;

		if (selection.rangeCount > 0) {
			this._variable._range = selection.getRangeAt(0);
			return this._variable._range;
		} else {
			const sc = selection.anchorNode,
				ec = selection.focusNode,
				so = selection.anchorOffset,
				eo = selection.focusOffset;
			const compareValue = util.compareElements(sc, ec);
			const rightDir =
				compareValue.ancestor &&
				(compareValue.result === 0 ? so <= eo : compareValue.result > 1 ? true : false);
			return this.setRange(rightDir ? sc : ec, rightDir ? so : eo, rightDir ? ec : sc, rightDir ? eo : so);
		}
	},

	/**
	 * @description Set current editor's range object and return.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {Number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {Number} endOff The endOffset property of the selection object.
	 * @returns {Object} Range object.
	 */
	setRange: function (startCon, startOff, endCon, endOff) {
		if (!startCon || !endCon) return;
		if (startOff > startCon.textContent.length) startOff = startCon.textContent.length;
		if (endOff > endCon.textContent.length) endOff = endCon.textContent.length;
		if (util.isFormatElement(startCon)) {
			startCon = startCon.childNodes[startOff] || startCon;
			startOff = 0;
		}
		if (util.isFormatElement(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon;
			endOff = startOff > 1 ? startOff : 0;
		}

		const range = this._wd.createRange();

		try {
			range.setStart(startCon, startOff);
			range.setEnd(endCon, endOff);
		} catch (error) {
			console.warn("[SUNEDITOR.core.focus.error] " + error);
			this.nativeFocus();
			return;
		}

		const selection = this.get();

		if (selection.removeAllRanges) {
			selection.removeAllRanges();
		}

		selection.addRange(range);
		this._init();
		if (options.iframe) this.nativeFocus();

		return range;
	},

	/**
	 * @description Remove range object and button effect
	 */
	removeRange: function () {
		this._variable._range = null;
		this._variable._selectionNode = null;
		if (this.hasFocus) this.get().removeAllRanges();
		this.editor.eventManager._setKeyEffect([]);
	},

	/**
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * Returns a new "range" or argument "range".
	 * @param {Object} range core.getRange()
	 * @param {Element|null} container If there is "container" argument, it creates a line in front of the container.
	 * @returns {Object} range
	 */
	getRange_addLine: function (range, container) {
		if (this.isNone(range)) {
			const wysiwyg = context.element.wysiwyg;
			const op = util.createElement(options.defaultTag);
			op.innerHTML = "<br>";
			wysiwyg.insertBefore(
				op,
				container && container !== wysiwyg ? container.nextElementSibling : wysiwyg.firstElementChild
			);
			this.setRange(op.firstElementChild, 0, op.firstElementChild, 1);
			range = this._variable._range;
		}
		return range;
	},

	/**
	 * @description Get window selection obejct
	 * @returns {Object}
	 */
	get: function () {
		return this._shadowRoot && this._shadowRoot.getSelection
			? this._shadowRoot.getSelection()
			: this._ww.getSelection();
	},

	/**
	 * @description Get current select node
	 * @returns {Node}
	 */
	getNode: function () {
		if (!context.element.wysiwyg.contains(this._variable._selectionNode)) this._init();
		if (!this._variable._selectionNode) {
			const selectionNode = util.getEdgeChild(
				context.element.wysiwyg.firstChild,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false
			);
			if (!selectionNode) {
				this._init();
			} else {
				this._variable._selectionNode = selectionNode;
				return selectionNode;
			}
		}
		return this._variable._selectionNode;
	},

	/**
	 * @description Reset range object to text node selected status.
	 * @returns {Boolean} Returns false if there is no valid selection.
	 * @private
	 */
	_resetRangeToTextNode: function () {
		const range = this.getRange();
		if (this.isNone(range)) return false;

		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;
		let tempCon, tempOffset, tempChild;

		if (util.isFormatElement(startCon)) {
			if (!startCon.childNodes[startOff]) {
				startCon = startCon.lastChild;
				startOff = startCon.textContent.length;
			} else {
				startCon = startCon.childNodes[startOff];
				startOff = 0;
			}
			while (startCon && startCon.nodeType === 1 && startCon.firstChild) {
				startCon = startCon.firstChild;
				startOff = 0;
			}
		}
		if (util.isFormatElement(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild;
			while (endCon && endCon.nodeType === 1 && endCon.lastChild) {
				endCon = endCon.lastChild;
			}
			endOff = endCon.textContent.length;
		}

		// startContainer
		tempCon = util.isWysiwygDiv(startCon) ? context.element.wysiwyg.firstChild : startCon;
		tempOffset = startOff;

		if (util.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = util.isBreak(tempCon);
			if (!onlyBreak) {
				while (tempCon && !util.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempCon = tempCon.childNodes[tempOffset] || tempCon.nextElementSibling || tempCon.nextSibling;
					tempOffset = 0;
				}

				let format = this.format.getLine(tempCon, null);
				if (format === this.format.getRangeBlock(format, null)) {
					format = util.createElement(
						util.getParentElement(tempCon, util.isTableCell) ? "DIV" : options.defaultTag
					);
					tempCon.parentNode.insertBefore(format, tempCon);
					format.appendChild(tempCon);
				}
			}

			if (util.isBreak(tempCon)) {
				const emptyText = util.createTextNode(util.zeroWidthSpace);
				tempCon.parentNode.insertBefore(emptyText, tempCon);
				tempCon = emptyText;
				if (onlyBreak) {
					if (startCon === endCon) {
						endCon = tempCon;
						endOff = 1;
					}
				}
			}
		}

		// set startContainer
		startCon = tempCon;
		startOff = tempOffset;

		// endContainer
		tempCon = util.isWysiwygDiv(endCon) ? context.element.wysiwyg.lastChild : endCon;
		tempOffset = endOff;

		if (util.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
			const onlyBreak = util.isBreak(tempCon);
			if (!onlyBreak) {
				while (tempCon && !util.isBreak(tempCon) && tempCon.nodeType === 1) {
					tempChild = tempCon.childNodes;
					if (tempChild.length === 0) break;
					tempCon =
						tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] ||
						!/FIGURE/i.test(tempChild[0].nodeName)
							? tempChild[0]
							: tempCon.previousElementSibling || tempCon.previousSibling || startCon;
					tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
				}

				let format = this.format.getLine(tempCon, null);
				if (format === this.format.getRangeBlock(format, null)) {
					format = util.createElement(util.isTableCell(format) ? "DIV" : options.defaultTag);
					tempCon.parentNode.insertBefore(format, tempCon);
					format.appendChild(tempCon);
				}
			}

			if (util.isBreak(tempCon)) {
				const emptyText = util.createTextNode(util.zeroWidthSpace);
				tempCon.parentNode.insertBefore(emptyText, tempCon);
				tempCon = emptyText;
				tempOffset = 1;
				if (onlyBreak && !tempCon.previousSibling) {
					util.removeItem(endCon);
				}
			}
		}

		// set endContainer
		endCon = tempCon;
		endOff = tempOffset;

		// set Range
		this.setRange(startCon, startOff, endCon, endOff);
		return true;
	},

	/**
	 * @description Returns a "line" array from the currently selected range.
	 * @param {Function|null} validation The validation function. (Replaces the default validation format.isLine(current))
	 * @returns {Array}
	 */
	getLines: function (validation) {
		if (!this._resetRangeToTextNode()) return [];
		let range = this.getRange();

		if (util.isWysiwygDiv(range.startContainer)) {
			const children = context.element.wysiwyg.children;
			if (children.length === 0) return [];

			this.setRange(
				children[0],
				0,
				children[children.length - 1],
				children[children.length - 1].textContent.trim().length
			);
			range = this.getRange();
		}

		const startCon = range.startContainer;
		const endCon = range.endContainer;
		const commonCon = range.commonAncestorContainer;

		// get line nodes
		const lineNodes = util.getListChildren(commonCon, function (current) {
			return validation ? validation(current) : util.isFormatElement(current);
		});

		if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon))
			lineNodes.unshift(this.format.getLine(commonCon, null));
		if (startCon === endCon || lineNodes.length === 1) return lineNodes;

		let startLine = this.format.getLine(startCon, null);
		let endLine = this.format.getLine(endCon, null);
		let startIdx = null;
		let endIdx = null;

		const onlyTable = function (current) {
			return util.isTable(current) ? /^TABLE$/i.test(current.nodeName) : true;
		};

		let startRangeEl = this.format.getRangeBlock(startLine, onlyTable);
		let endRangeEl = this.format.getRangeBlock(endLine, onlyTable);
		if (util.isTable(startRangeEl) && util.isListCell(startRangeEl.parentNode))
			startRangeEl = startRangeEl.parentNode;
		if (util.isTable(endRangeEl) && util.isListCell(endRangeEl.parentNode)) endRangeEl = endRangeEl.parentNode;

		const sameRange = startRangeEl === endRangeEl;
		for (let i = 0, len = lineNodes.length, line; i < len; i++) {
			line = lineNodes[i];

			if (startLine === line || (!sameRange && line === startRangeEl)) {
				startIdx = i;
				continue;
			}

			if (endLine === line || (!sameRange && line === endRangeEl)) {
				endIdx = i;
				break;
			}
		}

		if (startIdx === null) startIdx = 0;
		if (endIdx === null) endIdx = lineNodes.length - 1;

		return lineNodes.slice(startIdx, endIdx + 1);
	},

	/**
	 * @description Get lines and components from the selected area. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * If some of the component are included in the selection, get the entire that component.
	 * @param {Boolean} removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns {Array}
	 */
	getLinesAndComponents: function (removeDuplicate) {
		const commonCon = this.getRange().commonAncestorContainer;
		const myComponent = util.getParentElement(commonCon, this.node.isComponent);
		const selectedLines = util.isTable(commonCon)
			? this.getLines(null)
			: this.getLines(
					function (current) {
						const component = util.getParentElement(current, this.node.isComponent);
						return (
							(this.isFormatElement(current) && (!component || component === myComponent)) ||
							(this.node.isComponent(current) && !this.getLine(current))
						);
					}.bind(this.format)
			  );

		if (removeDuplicate) {
			for (let i = 0, len = selectedLines.length; i < len; i++) {
				for (let j = i - 1; j >= 0; j--) {
					if (selectedLines[j].contains(selectedLines[i])) {
						selectedLines.splice(i, 1);
						i--;
						len--;
						break;
					}
				}
			}
		}

		return selectedLines;
	},

	/**
	 * @description Delete selected node and insert argument value node and return.
	 * If the "afterNode" exists, it is inserted after the "afterNode"
	 * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
	 * @param {Node} oNode Element to be inserted
	 * @param {Node|null} afterNode If the node exists, it is inserted after the node
	 * @param {Boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
	 * @returns {Object|Node|null}
	 */
	insertNode: function (oNode, afterNode, checkCharCount) {
		if (this.editor.isReadOnly || (checkCharCount && !this.char.check(oNode))) {
			return null;
		}

		const brLine = this.format.getBrLine(this.selection.getNode(), null);
		const isFormats =
			(!brLine && (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode))) || this.node.isComponent(oNode);

		if (!afterNode && (isFormats || this.node.isComponent(oNode) || util.isMedia(oNode))) {
			const r = this.removeNode();
			if (r.container.nodeType === 3 || util.isBreak(r.container)) {
				const depthFormat = util.getParentElement(
					r.container,
					function (current) {
						return this.isRangeFormatElement(current) || this.isListCell(current);
					}.bind(util)
				);
				afterNode = this.node.split(
					r.container,
					r.offset,
					!depthFormat ? 0 : util.getElementDepth(depthFormat) + 1
				);
				if (afterNode) afterNode = afterNode.previousSibling;
			}
		}

		const range = !afterNode && !isFormats ? this.getRange_addLine(this.getRange(), null) : this.getRange();
		const commonCon = range.commonAncestorContainer;
		const startOff = range.startOffset;
		const endOff = range.endOffset;
		const formatRange = range.startContainer === commonCon && util.isFormatElement(commonCon);
		const startCon = formatRange ? commonCon.childNodes[startOff] || commonCon.childNodes[0] : range.startContainer;
		const endCon = formatRange
			? commonCon.childNodes[endOff] || commonCon.childNodes[commonCon.childNodes.length - 1]
			: range.endContainer;
		let parentNode,
			originAfter = null;

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
					if (!util.isBreak(parentNode)) {
						let c = parentNode.childNodes[startOff];
						const focusNode =
							c && c.nodeType === 3 && util.onlyZeroWidthSpace(c) && util.isBreak(c.nextSibling)
								? c.nextSibling
								: c;
						if (focusNode) {
							if (!focusNode.nextSibling) {
								parentNode.removeChild(focusNode);
								afterNode = null;
							} else {
								afterNode =
									util.isBreak(focusNode) && !util.isBreak(oNode) ? focusNode : focusNode.nextSibling;
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
					if (this.isEdgePoint(endCon, endOff)) afterNode = endCon.nextSibling;
					else afterNode = endCon.splitText(endOff);

					let removeNode = startCon;
					if (!this.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

					parentNode.removeChild(removeNode);
					if (parentNode.childNodes.length === 0 && isFormats) {
						parentNode.innerHTML = "<br>";
					}
				} else {
					const removedTag = this.removeNode();
					const container = removedTag.container;
					const prevContainer = removedTag.prevContainer;
					if (container && container.childNodes.length === 0 && isFormats) {
						if (util.isFormatElement(container)) {
							container.innerHTML = "<br>";
						} else if (util.isRangeFormatElement(container)) {
							container.innerHTML = "<" + options.defaultTag + "><br></" + options.defaultTag + ">";
						}
					}

					if (!isFormats && prevContainer) {
						parentNode = prevContainer.nodeType === 3 ? prevContainer.parentNode : prevContainer;
						if (parentNode.contains(container)) {
							let sameParent = true;
							afterNode = container;
							while (afterNode.parentNode !== parentNode) {
								afterNode = afterNode.parentNode;
								sameParent = false;
							}
							if (sameParent && container === prevContainer) afterNode = afterNode.nextSibling;
						} else {
							afterNode = null;
						}
					} else {
						afterNode = isFormats
							? endCon
							: container === prevContainer
							? container.nextSibling
							: container;
						parentNode = !afterNode || !afterNode.parentNode ? commonCon : afterNode.parentNode;
					}

					while (afterNode && !util.isFormatElement(afterNode) && afterNode.parentNode !== commonCon) {
						afterNode = afterNode.parentNode;
					}
				}
			}
		}
		// has afterNode
		else {
			parentNode = afterNode.parentNode;
			afterNode = afterNode.nextSibling;
			originAfter = true;
		}

		// --- insert node ---
		try {
			if (util.isWysiwygDiv(afterNode) || parentNode === context.element.wysiwyg.parentNode) {
				parentNode = context.element.wysiwyg;
				afterNode = null;
			}

			if (
				util.isFormatElement(oNode) ||
				util.isRangeFormatElement(oNode) ||
				(!util.isListCell(parentNode) && this.node.isComponent(oNode))
			) {
				const oldParent = parentNode;
				if (util.isList(afterNode)) {
					parentNode = afterNode;
					afterNode = null;
				} else if (util.isListCell(afterNode)) {
					parentNode = afterNode.previousElementSibling || afterNode;
				} else if (!originAfter && !afterNode) {
					const r = this.removeNode();
					const container =
						r.container.nodeType === 3
							? util.isListCell(this.format.getLine(r.container, null))
								? r.container
								: this.format.getLine(r.container, null) || r.container.parentNode
							: r.container;
					const rangeCon = util.isWysiwygDiv(container) || util.isRangeFormatElement(container);
					parentNode = rangeCon ? container : container.parentNode;
					afterNode = rangeCon ? null : container.nextSibling;
				}

				if (oldParent.childNodes.length === 0 && parentNode !== oldParent) util.removeItem(oldParent);
			}

			if (
				isFormats &&
				!brLine &&
				!util.isRangeFormatElement(parentNode) &&
				!util.isListCell(parentNode) &&
				!util.isWysiwygDiv(parentNode)
			) {
				afterNode = parentNode.nextElementSibling;
				parentNode = parentNode.parentNode;
			}

			if (util.isWysiwygDiv(parentNode) && (oNode.nodeType === 3 || util.isBreak(oNode))) {
				const fNode = util.createElement(options.defaultTag);
				fNode.appendChild(oNode);
				oNode = fNode;
			}

			parentNode.insertBefore(oNode, parentNode === afterNode ? parentNode.lastChild : afterNode);
		} catch (e) {
			parentNode.appendChild(oNode);
		} finally {
			if ((util.isFormatElement(oNode) || this.node.isComponent(oNode)) && startCon === endCon) {
				const cItem = this.format.getLine(commonCon, null);
				if (cItem && cItem.nodeType === 1 && util.isEmptyLine(cItem)) {
					util.removeItem(cItem);
				}
			}

			if (brLine && (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode))) {
				oNode = this._setIntoFreeFormat(oNode);
			}

			if (!this.node.isComponent(oNode)) {
				let offset = 1;
				if (oNode.nodeType === 3) {
					const previous = oNode.previousSibling;
					const next = oNode.nextSibling;
					const previousText =
						!previous || previous.nodeType === 1 || util.onlyZeroWidthSpace(previous)
							? ""
							: previous.textContent;
					const nextText =
						!next || next.nodeType === 1 || util.onlyZeroWidthSpace(next) ? "" : next.textContent;

					if (previous && previousText.length > 0) {
						oNode.textContent = previousText + oNode.textContent;
						util.removeItem(previous);
					}

					if (next && next.length > 0) {
						oNode.textContent += nextText;
						util.removeItem(next);
					}

					const newRange = {
						container: oNode,
						startOffset: previousText.length,
						endOffset: oNode.textContent.length - nextText.length
					};

					this.setRange(oNode, newRange.startOffset, oNode, newRange.endOffset);

					return newRange;
				} else if (!util.isBreak(oNode) && util.isFormatElement(parentNode)) {
					let zeroWidth = null;
					if (!oNode.previousSibling || util.isBreak(oNode.previousSibling)) {
						zeroWidth = util.createTextNode(util.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode);
					}

					if (!oNode.nextSibling || util.isBreak(oNode.nextSibling)) {
						zeroWidth = util.createTextNode(util.zeroWidthSpace);
						oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
					}

					if (util._isIgnoreNodeChange(oNode)) {
						oNode = oNode.nextSibling;
						offset = 0;
					}
				}

				this.setRange(oNode, offset, oNode, offset);
			}

			// history stack
			this.history.push(true);

			return oNode;
		}
	},

	_setIntoFreeFormat: function (oNode) {
		const parentNode = oNode.parentNode;
		let oNodeChildren, lastONode;

		while (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode)) {
			oNodeChildren = oNode.childNodes;
			lastONode = null;

			while (oNodeChildren[0]) {
				lastONode = oNodeChildren[0];
				if (util.isFormatElement(lastONode) || util.isRangeFormatElement(lastONode)) {
					this._setIntoFreeFormat(lastONode);
					if (!oNode.parentNode) break;
					oNodeChildren = oNode.childNodes;
					continue;
				}

				parentNode.insertBefore(lastONode, oNode);
			}

			if (oNode.childNodes.length === 0) util.removeItem(oNode);
			oNode = util.createElement("BR");
			parentNode.insertBefore(oNode, lastONode.nextSibling);
		}

		return oNode;
	},

	/**
	 * @description Delete the currently selected nodes and reset selection range
	 * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
	 * @returns {Object}
	 */
	removeNode: function () {
		this._resetRangeToTextNode();

		const range = this.getRange();
		let container,
			offset = 0;
		let startCon = range.startContainer;
		let endCon = range.endContainer;
		let startOff = range.startOffset;
		let endOff = range.endOffset;
		const commonCon =
			range.commonAncestorContainer.nodeType === 3 &&
			range.commonAncestorContainer.parentNode === startCon.parentNode
				? startCon.parentNode
				: range.commonAncestorContainer;
		if (commonCon === startCon && commonCon === endCon) {
			startCon = commonCon.children[startOff];
			endCon = commonCon.children[endOff];
			startOff = endOff = 0;
		}

		let beforeNode = null;
		let afterNode = null;

		const childNodes = util.getListChildNodes(commonCon, null);
		let startIndex = util.getArrayIndex(childNodes, startCon);
		let endIndex = util.getArrayIndex(childNodes, endCon);

		if (childNodes.length > 0 && startIndex > -1 && endIndex > -1) {
			for (let i = startIndex + 1, startNode = startCon; i >= 0; i--) {
				if (
					childNodes[i] === startNode.parentNode &&
					childNodes[i].firstChild === startNode &&
					startOff === 0
				) {
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
				if (
					util.isFormatElement(commonCon) ||
					util.isRangeFormatElement(commonCon) ||
					util.isWysiwygDiv(commonCon) ||
					util.isBreak(commonCon) ||
					util.isMedia(commonCon)
				) {
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
				if (util.isBreak(startCon) || util.onlyZeroWidthSpace(startCon)) {
					return {
						container: util.isMedia(commonCon) ? commonCon : startCon,
						offset: 0
					};
				}
			}

			startIndex = endIndex = 0;
		}

		const remove = function (item) {
			const format = this.format.getLine(item, null);
			util.removeItem(item);

			if (util.isListCell(format)) {
				const list = util.getArrayItem(format.children, util.isList, false);
				if (list) {
					const child = list.firstElementChild;
					const children = child.childNodes;
					while (children[0]) {
						format.insertBefore(children[0], list);
					}
					util.removeItemAllParents(child, null, null);
				}
			}
		}.bind(this);

		for (let i = startIndex; i <= endIndex; i++) {
			const item = childNodes[i];

			if (item.length === 0 || (item.nodeType === 3 && item.data === undefined)) {
				remove(item);
				continue;
			}

			if (item === startCon) {
				if (startCon.nodeType === 1) {
					if (this.node.isComponent(startCon)) continue;
					else beforeNode = util.createTextNode(startCon.textContent);
				} else {
					if (item === endCon) {
						beforeNode = util.createTextNode(
							startCon.substringData(0, startOff) + endCon.substringData(endOff, endCon.length - endOff)
						);
						offset = startOff;
					} else {
						beforeNode = util.createTextNode(startCon.substringData(0, startOff));
					}
				}

				if (beforeNode.length > 0) {
					startCon.data = beforeNode.data;
				} else {
					remove(startCon);
				}

				if (item === endCon) break;
				continue;
			}

			if (item === endCon) {
				if (endCon.nodeType === 1) {
					if (this.node.isComponent(endCon)) continue;
					else afterNode = util.createTextNode(endCon.textContent);
				} else {
					afterNode = util.createTextNode(endCon.substringData(endOff, endCon.length - endOff));
				}

				if (afterNode.length > 0) {
					endCon.data = afterNode.data;
				} else {
					remove(endCon);
				}

				continue;
			}

			remove(item);
		}

		container =
			endCon && endCon.parentNode
				? endCon
				: startCon && startCon.parentNode
				? startCon
				: range.endContainer || range.startContainer;

		if (!util.isWysiwygDiv(container) && container.childNodes.length === 0) {
			const rc = util.removeItemAllParents(
				container,
				function (current) {
					if (this.node.isComponent(current)) return false;
					const text = current.textContent;
					return text.length === 0 || /^(\n|\u200B)+$/.test(text);
				}.bind(util),
				null
			);

			if (rc) container = rc.sc || rc.ec || context.element.wysiwyg;
		}

		// set range
		this.setRange(container, offset, container, offset);
		// history stack
		this.history.push(true);

		return {
			container: container,
			offset: offset,
			prevContainer: startCon && startCon.parentNode ? startCon : null
		};
	},

	/**
	 * @description Returns true if there is no valid selection.
	 * @param {Object} range selection.getRange()
	 * @returns {Boolean}
	 */
	isNone: function (range) {
		const comm = range.commonAncestorContainer;
		return (
			(util.isWysiwygDiv(range.startContainer) && util.isWysiwygDiv(range.endContainer)) ||
			/FIGURE/i.test(comm.nodeName) ||
			this._fileManager.regExp.test(comm.nodeName) ||
			this.node.isComponent(comm)
		);
	},

	constructor: Selection
};

export default Selection;
