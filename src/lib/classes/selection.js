/**
 * @fileoverview Selection class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Selection = function(editor) {
	CoreInterface.call(this, editor);

	this.range = null;
	this.selectionNode = null;
};

Selection.prototype = {
	/**
	 * @description Saving the range object and the currently selected node of editor
	 * @private
	 */
	_editorRange: function() {
		const selection = this.getSelection();
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
	 * @description Set current editor's range object and return.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {Number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {Number} endOff The endOffset property of the selection object.
	 * @returns {Object} Range object.
	 */
	setRange: function(startCon, startOff, endCon, endOff) {
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

		const selection = this.getSelection();

		if (selection.removeAllRanges) {
			selection.removeAllRanges();
		}

		selection.addRange(range);
		this._editorRange();
		if (options.iframe) this.nativeFocus();

		return range;
	},

	/**
	 * @description Remove range object and button effect
	 */
	removeRange: function() {
		this._variable._range = null;
		this._variable._selectionNode = null;
		if (this.hasFocus) this.getSelection().removeAllRanges();

		const commandMap = this.commandMap;
		const activePlugins = this.activePlugins;
		for (let key in commandMap) {
			if (!util.hasOwn(commandMap, key)) continue;
			if (activePlugins.indexOf(key) > -1) {
				plugins[key].active.call(this, null);
			} else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
				commandMap.OUTDENT.setAttribute("disabled", true);
			} else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
				commandMap.INDENT.removeAttribute("disabled");
			} else {
				util.removeClass(commandMap[key], "active");
			}
		}
	},

	/**
	 * @description Get current editor's range object
	 * @returns {Object}
	 */
	getRange: function() {
		const range = this._variable._range || this._createDefaultRange();
		const selection = this.getSelection();
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
	 * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
	 * Returns a new "range" or argument "range".
	 * @param {Object} range core.getRange()
	 * @param {Element|null} container If there is "container" argument, it creates a line in front of the container.
	 * @returns {Object} range
	 */
	getRange_addLine: function(range, container) {
		if (this._selectionVoid(range)) {
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
	getSelection: function() {
		return this._shadowRoot && this._shadowRoot.getSelection
			? this._shadowRoot.getSelection()
			: this._ww.getSelection();
	},

	/**
	 * @description Get current select node
	 * @returns {Node}
	 */
	getSelectionNode: function() {
		if (!context.element.wysiwyg.contains(this._variable._selectionNode)) this._editorRange();
		if (!this._variable._selectionNode) {
			const selectionNode = util.getChildElement(
				context.element.wysiwyg.firstChild,
				function(current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false
			);
			if (!selectionNode) {
				this._editorRange();
			} else {
				this._variable._selectionNode = selectionNode;
				return selectionNode;
			}
		}
		return this._variable._selectionNode;
	},

	/**
	 * @description Return the range object of editor's first child node
	 * @returns {Object}
	 * @private
	 */
	_createDefaultRange: function() {
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
	 * @description Returns true if there is no valid "selection".
	 * @param {Object} range core.getRange()
	 * @returns {Object} range
	 * @private
	 */
	_selectionVoid: function(range) {
		const comm = range.commonAncestorContainer;
		return (
			(util.isWysiwygDiv(range.startContainer) && util.isWysiwygDiv(range.endContainer)) ||
			/FIGURE/i.test(comm.nodeName) ||
			this._fileManager.regExp.test(comm.nodeName) ||
			util.isMediaComponent(comm)
		);
	},

	/**
	 * @description Reset range object to text node selected status.
	 * @returns {Boolean} Returns false if there is no valid selection.
	 * @private
	 */
	_resetRangeToTextNode: function() {
		const range = this.getRange();
		if (this._selectionVoid(range)) return false;

		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;
		let tempCon, tempOffset, tempChild;

		if (util.isFormatElement(startCon)) {
			startCon = startCon.childNodes[startOff] || startCon.lastChild;
			startOff = startCon.textContent.length;
		}
		if (util.isFormatElement(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild;
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

				let format = util.getFormatElement(tempCon, null);
				if (format === util.getRangeFormatElement(format, null)) {
					format = util.createElement(
						util.getParentElement(tempCon, util.isCell) ? "DIV" : options.defaultTag
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

				let format = util.getFormatElement(tempCon, null);
				if (format === util.getRangeFormatElement(format, null)) {
					format = util.createElement(util.isCell(format) ? "DIV" : options.defaultTag);
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
	 * @description Returns a "formatElement"(util.isFormatElement) array from the currently selected range.
	 * @param {Function|null} validation The validation function. (Replaces the default validation function-util.isFormatElement(current))
	 * @returns {Array}
	 */
	getSelectedElements: function(validation) {
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
		const lineNodes = util.getListChildren(commonCon, function(current) {
			return validation ? validation(current) : util.isFormatElement(current);
		});

		if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon))
			lineNodes.unshift(util.getFormatElement(commonCon, null));
		if (startCon === endCon || lineNodes.length === 1) return lineNodes;

		let startLine = util.getFormatElement(startCon, null);
		let endLine = util.getFormatElement(endCon, null);
		let startIdx = null;
		let endIdx = null;

		const onlyTable = function(current) {
			return util.isTable(current) ? /^TABLE$/i.test(current.nodeName) : true;
		};

		let startRangeEl = util.getRangeFormatElement(startLine, onlyTable);
		let endRangeEl = util.getRangeFormatElement(endLine, onlyTable);
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
	 * @description Get format elements and components from the selected area. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * If some of the component are included in the selection, get the entire that component.
	 * @param {Boolean} removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns {Array}
	 */
	getSelectedElementsAndComponents: function(removeDuplicate) {
		const commonCon = this.getRange().commonAncestorContainer;
		const myComponent = util.getParentElement(commonCon, util.isComponent);
		const selectedLines = util.isTable(commonCon)
			? this.getSelectedElements(null)
			: this.getSelectedElements(
					function(current) {
						const component = this.getParentElement(current, this.isComponent);
						return (
							(this.isFormatElement(current) && (!component || component === myComponent)) ||
							(this.isComponent(current) && !this.getFormatElement(current))
						);
					}.bind(util)
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
	insertNode: function(oNode, afterNode, checkCharCount) {
		if (checkCharCount && !this.char.check(oNode)) {
			return null;
		}

		const freeFormat = util.getFreeFormatElement(this.getSelectionNode(), null);
		const isFormats =
			(!freeFormat && (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode))) ||
			util.isComponent(oNode);

		if (!afterNode && (isFormats || util.isComponent(oNode) || util.isMedia(oNode))) {
			const r = this.removeNode();
			if (r.container.nodeType === 3 || util.isBreak(r.container)) {
				const depthFormat = util.getParentElement(
					r.container,
					function(current) {
						return this.isRangeFormatElement(current) || this.isListCell(current);
					}.bind(util)
				);
				afterNode = util.splitElement(
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
				(!util.isListCell(parentNode) && util.isComponent(oNode))
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
							? util.isListCell(util.getFormatElement(r.container, null))
								? r.container
								: util.getFormatElement(r.container, null) || r.container.parentNode
							: r.container;
					const rangeCon = util.isWysiwygDiv(container) || util.isRangeFormatElement(container);
					parentNode = rangeCon ? container : container.parentNode;
					afterNode = rangeCon ? null : container.nextSibling;
				}

				if (oldParent.childNodes.length === 0 && parentNode !== oldParent) util.removeItem(oldParent);
			}

			if (
				isFormats &&
				!freeFormat &&
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
			if ((util.isFormatElement(oNode) || util.isComponent(oNode)) && startCon === endCon) {
				const cItem = util.getFormatElement(commonCon, null);
				if (cItem && cItem.nodeType === 1 && util.isEmptyLine(cItem)) {
					util.removeItem(cItem);
				}
			}

			if (freeFormat && (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode))) {
				oNode = this._setIntoFreeFormat(oNode);
			}

			if (!util.isComponent(oNode)) {
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

	_setIntoFreeFormat: function(oNode) {
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
	removeNode: function() {
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

		function remove(item) {
			const format = util.getFormatElement(item, null);
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
		}

		for (let i = startIndex; i <= endIndex; i++) {
			const item = childNodes[i];

			if (item.length === 0 || (item.nodeType === 3 && item.data === undefined)) {
				remove(item);
				continue;
			}

			if (item === startCon) {
				if (startCon.nodeType === 1) {
					if (util.isComponent(startCon)) continue;
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
					if (util.isComponent(endCon)) continue;
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
				function(current) {
					if (this.isComponent(current)) return false;
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
	 * @description Appended all selected format Element to the argument element and insert
	 * @param {Element} rangeElement Element of wrap the arguments (BLOCKQUOTE...)
	 */
	applyRangeFormatElement: function(rangeElement) {
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
			if (!originParent || rangeElement.contains(originParent)) continue;

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

					const edge = this.detachRangeFormatElement(originParent, lineArr, null, true, true);

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

					if (!nested) rangeElement.appendChild(listParent);
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

				rangeElement.appendChild(line);

				if (pElement !== originParent) {
					before = removeItems(pElement, originParent);
					if (before !== undefined) beforeTag = before;
				}
			}
		}

		this.effectNode = null;
		util.mergeSameTags(rangeElement, null, false);
		util.mergeNestedTags(
			rangeElement,
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
			splitRange.parentNode.insertBefore(rangeElement, splitRange);
		} else {
			// basic
			pElement.insertBefore(rangeElement, beforeTag);
			removeItems(rangeElement, beforeTag);
		}

		const edge = util.getEdgeChildNodes(rangeElement.firstElementChild, rangeElement.lastElementChild);
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
	detachRangeFormatElement: function(rangeElement, selectedFormats, newRangeElement, remove, notHistoryPush) {
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
						const detachRange = util.detachNestedList(originNode, false);
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
						const detachRange = util.detachNestedList(insNode, false);
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
	 * @description "selectedFormats" array are detached from the list element.
	 * The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param {Array} selectedFormats Array of format elements (LI, P...) to remove.
	 * @param {Boolean} remove If true, deleted without detached.
	 * @returns {Object} {sc: <LI>, ec: <LI>}.
	 */
	detachList: function(selectedFormats, remove) {
		let rangeArr = {};
		let listFirst = false;
		let listLast = false;
		let first = null;
		let last = null;
		const passComponent = function(current) {
			return !this.isComponent(current);
		}.bind(util);

		for (let i = 0, len = selectedFormats.length, r, o, lastIndex, isList; i < len; i++) {
			lastIndex = i === len - 1;
			o = util.getRangeFormatElement(selectedFormats[i], passComponent);
			isList = util.isList(o);
			if (!r && isList) {
				r = o;
				rangeArr = { r: r, f: [util.getParentElement(selectedFormats[i], "LI")] };
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
					o = selectedFormats[i].parentNode;
					if (listFirst) {
						first = edge.sc;
						listFirst = false;
					}
					if (lastIndex) last = edge.ec;

					if (isList) {
						r = o;
						rangeArr = { r: r, f: [util.getParentElement(selectedFormats[i], "LI")] };
						if (lastIndex) listLast = true;
					} else {
						r = null;
					}
				} else {
					rangeArr.f.push(util.getParentElement(selectedFormats[i], "LI"));
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

	constructor: Selection
};

export default Selection;
