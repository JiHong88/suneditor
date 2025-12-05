/**
 * @fileoverview Inline class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, unicode, converter } from '../../helper';

/**
 * @typedef {Omit<Inline & Partial<SunEditor.Injector>, 'inline'>} InlineThis
 */

/**
 * @typedef {Object} NodeStyleContainerType
 * @property {?Node} [ancestor]
 * @property {?number} [offset]
 * @property {?Node} [container]
 * @property {?Node} [endContainer]
 */

/**
 * @constructor
 * @this {InlineThis}
 * @description Classes related to editor inline formats such as style node like strong, span, etc.
 * @param {SunEditor.Core} editor - The root editor instance
 */
function Inline(editor) {
	CoreInjector.call(this, editor);

	// members
	this._listCamel = this.options.get('__listCommonStyle');
	this._listKebab = converter.camelToKebabCase(this.options.get('__listCommonStyle'));
}

Inline.prototype = {
	/**
	 * @this {InlineThis}
	 * @description Adds, updates, or deletes style nodes from selected text (a, span, strong, etc.).
	 * - 1. If styleNode is provided, a node with the same tags and attributes is added to the selected text.
	 * - 2. If the same tag already exists, only its attributes are updated.
	 * - 3. If styleNode is null, existing nodes are updated or removed without adding new ones.
	 * - 4. Styles matching those in stylesToModify are removed. (Use CSS attribute names, e.g., "background-color")
	 * - 5. Classes matching those in stylesToModify (prefixed with ".") are removed.
	 * - 6. stylesToModify is used to avoid duplicate property values from styleNode.
	 * - 7. Nodes with all styles and classes removed are deleted if they match styleNode, are in nodesToRemove, or if styleNode is null.
	 * - 8. Tags matching names in nodesToRemove are deleted regardless of their style and class.
	 * - 9. If strictRemove is true, nodes in nodesToRemove are only removed if all their styles and classes are removed.
	 * - 10. The function won't modify nodes if the parent has the same class and style values.
	 * - However, if nodesToRemove has values, it will work and separate text nodes even if there's no node to replace.
	 * @param {?Node} styleNode The element to be added to the selection. If null, only existing nodes are modified or removed.
	 * @param {Object} [options] Options
	 * @param {Array<string>} [options.stylesToModify=null] Array of style or class names to check and modify.
	 *        (e.g., ['font-size'], ['.className'], ['font-family', 'color', '.className'])
	 * @param {Array<string>} [options.nodesToRemove=null] Array of node names to remove.
	 *        If empty array or null when styleNode is null, all formats are removed.
	 *        (e.g., ['span'], ['strong', 'em'])
	 * @param {boolean} [options.strictRemove=false] If true, only removes nodes from nodesToRemove if all styles and classes are removed.
	 * @returns {HTMLElement} The element that was added to or modified in the selection.
	 * @example
	 * // Apply bold formatting
	 * const bold = dom.utils.createElement('STRONG');
	 * editor.inline.apply(bold);
	 *
	 * // Remove specific styles
	 * editor.inline.apply(null, { stylesToModify: ['font-size'] });
	 *
	 * // Remove specific tags
	 * editor.inline.apply(null, { nodesToRemove: ['span'] });
	 */
	apply(styleNode, { stylesToModify, nodesToRemove, strictRemove } = {}) {
		if (dom.query.getParentElement(this.selection.getNode(), dom.check.isNonEditable)) return;

		this.selection._resetRangeToTextNode();
		let range = this.selection.getRangeAndAddLine(this.selection.getRange(), null);
		stylesToModify = stylesToModify?.length > 0 ? stylesToModify : null;
		nodesToRemove = nodesToRemove?.length > 0 ? nodesToRemove : null;

		const isRemoveNode = !styleNode;
		const isRemoveFormat = isRemoveNode && !nodesToRemove && !stylesToModify;
		let startCon = range.startContainer;
		let startOff = range.startOffset;
		let endCon = range.endContainer;
		let endOff = range.endOffset;

		if ((isRemoveFormat && range.collapsed && this.format.isLine(startCon.parentNode) && this.format.isLine(endCon.parentNode)) || (startCon === endCon && startCon.nodeType === 1 && dom.check.isNonEditable(startCon))) {
			const format = startCon.parentNode;
			if (!dom.check.isListCell(format) || !converter.getValues(format.style).some((k) => this._listKebab.includes(k))) {
				return;
			}
		}

		if (range.collapsed && !isRemoveFormat) {
			if (startCon.nodeType === 1 && !dom.check.isBreak(startCon) && !this.component.is(startCon)) {
				let afterNode = null;
				const focusNode = startCon.childNodes[startOff];

				if (focusNode) {
					if (!focusNode.nextSibling) {
						afterNode = null;
					} else {
						afterNode = dom.check.isBreak(focusNode) ? focusNode : focusNode.nextSibling;
					}
				}

				const zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				startCon.insertBefore(zeroWidth, afterNode);
				this.selection.setRange(zeroWidth, 1, zeroWidth, 1);

				range = this.selection.getRange();
				startCon = range.startContainer;
				startOff = range.startOffset;
				endCon = range.endContainer;
				endOff = range.endOffset;
			}
		}

		if (this.format.isLine(startCon)) {
			startCon = startCon.childNodes[startOff] || startCon.firstChild;
			startOff = 0;
		}
		if (this.format.isLine(endCon)) {
			endCon = endCon.childNodes[endOff] || endCon.lastChild;
			endOff = endCon.textContent.length;
		}

		if (isRemoveNode) {
			styleNode = dom.utils.createElement('DIV');
		}

		const wRegExp = RegExp;
		const newNodeName = styleNode.nodeName;

		/* checked same style property */
		if (!isRemoveFormat && startCon === endCon && !nodesToRemove && styleNode) {
			let sNode = startCon;
			let checkCnt = 0;
			const checkAttrs = [];

			const checkStyles = /** @type {HTMLElement} */ (styleNode).style;
			for (let i = 0, len = checkStyles.length; i < len; i++) {
				checkAttrs.push(checkStyles[i]);
			}

			const checkClassName = /** @type {HTMLElement} */ (styleNode).className;
			const ckeckClasses = /** @type {HTMLElement} */ (styleNode).classList;
			for (let i = 0, len = ckeckClasses.length; i < len; i++) {
				checkAttrs.push('.' + ckeckClasses[i]);
			}

			if (checkAttrs.length > 0) {
				while (!this.format.isLine(sNode) && !dom.check.isWysiwygFrame(sNode)) {
					for (let i = 0; i < checkAttrs.length; i++) {
						if (sNode.nodeType === 1) {
							const s = checkAttrs[i];
							const classReg = /^\./.test(s) ? new wRegExp('\\s*' + s.replace(/^\./, '') + '(\\s+|$)', 'ig') : false;
							const sNodeStyle = /** @type {HTMLElement} */ (sNode).style;
							const sNodeClassName = /** @type {HTMLElement} */ (sNode).className;

							const styleCheck = isRemoveNode ? !!sNodeStyle[s] : !!sNodeStyle[s] && !!checkStyles[s] && sNodeStyle[s] === checkStyles[s];
							const classCheck = classReg === false ? false : isRemoveNode ? !!sNodeClassName.match(classReg) : !!sNodeClassName.match(classReg) && !!checkClassName.match(classReg);
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

		let newNode;
		/** @type {NodeStyleContainerType} */
		let start = {};
		/** @type {NodeStyleContainerType} */
		let end = {};

		/** @type {string|RegExp} */
		let styleRegExp = '';
		/** @type {string|RegExp} */
		let classRegExp = '';
		/** @type {string|RegExp} */
		let removeNodeRegExp;

		if (stylesToModify) {
			for (let i = 0, len = stylesToModify.length, s; i < len; i++) {
				s = stylesToModify[i];
				if (/^\./.test(s)) {
					classRegExp += (classRegExp ? '|' : '\\s*(?:') + s.replace(/^\./, '');
				} else {
					styleRegExp += (styleRegExp ? '|' : '(?:;|^|\\s)(?:') + s;
				}
			}

			if (styleRegExp) {
				styleRegExp += ')\\s*:[^;]*\\s*(?:;|$)';
				styleRegExp = new wRegExp(styleRegExp, 'ig');
			}

			if (classRegExp) {
				classRegExp += ')(?=\\s+|$)';
				classRegExp = new wRegExp(classRegExp, 'ig');
			}
		}

		if (nodesToRemove) {
			removeNodeRegExp = '^(?:' + nodesToRemove[0];
			for (let i = 1; i < nodesToRemove.length; i++) {
				removeNodeRegExp += '|' + nodesToRemove[i];
			}
			removeNodeRegExp += ')$';
			removeNodeRegExp = new wRegExp(removeNodeRegExp, 'i');
		}

		/** validation check function*/
		const _removeCheck = {
			v: false,
		};
		const validation = function (checkNode) {
			const vNode = checkNode.cloneNode(false);

			// all path
			if (vNode.nodeType === 3 || dom.check.isBreak(vNode)) return vNode;
			// all remove
			if (isRemoveFormat) return null;

			// remove node check
			const tagRemove = (!removeNodeRegExp && isRemoveNode) || /** @type {RegExp} */ (removeNodeRegExp)?.test(vNode.nodeName);

			// tag remove
			if (tagRemove && !strictRemove) {
				_removeCheck.v = true;
				return null;
			}

			// style regexp
			const originStyle = vNode.style.cssText;
			let style = '';
			if (styleRegExp && originStyle.length > 0) {
				style = originStyle.replace(styleRegExp, '').trim();
				if (style !== originStyle) _removeCheck.v = true;
			}

			// class check
			const originClasses = vNode.className;
			let classes = '';
			if (classRegExp && originClasses.length > 0) {
				classes = originClasses.replace(classRegExp, '').trim();
				if (classes !== originClasses) _removeCheck.v = true;
			}

			// remove only
			if (isRemoveNode) {
				if ((classRegExp || !originClasses) && (styleRegExp || !originStyle) && !style && !classes && tagRemove) {
					_removeCheck.v = true;
					return null;
				}
			}

			// change
			if (style || classes || vNode.nodeName !== newNodeName || Boolean(styleRegExp) !== Boolean(originStyle) || Boolean(classRegExp) !== Boolean(originClasses)) {
				if (styleRegExp && originStyle.length > 0) vNode.style.cssText = style;
				if (!vNode.style.cssText) {
					vNode.removeAttribute('style');
				}

				if (classRegExp && originClasses.length > 0) vNode.className = classes.trim();
				if (!vNode.className.trim()) {
					vNode.removeAttribute('class');
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
		const lineNodes = this.format.getLines(null);
		if (lineNodes.length === 0) {
			console.warn('[SUNEDITOR.inline.apply.warn] There is no line to apply.');
			return;
		}

		range = this.selection.getRange();
		startCon = range.startContainer;
		startOff = range.startOffset;
		endCon = range.endContainer;
		endOff = range.endOffset;

		if (!this.format.getLine(startCon, null)) {
			startCon = dom.query.getEdgeChild(
				lineNodes[0],
				function (current) {
					return current.nodeType === 3;
				},
				false,
			);
			startOff = 0;
		}

		if (!this.format.getLine(endCon, null)) {
			endCon = dom.query.getEdgeChild(
				lineNodes.at(-1),
				function (current) {
					return current.nodeType === 3;
				},
				false,
			);
			endOff = endCon.textContent.length;
		}

		const oneLine = this.format.getLine(startCon, null) === this.format.getLine(endCon, null);
		const endLength = lineNodes.length - (oneLine ? 0 : 1);

		// node Changes
		newNode = styleNode.cloneNode(false);

		const isRemoveAnchor =
			isRemoveFormat ||
			(isRemoveNode &&
				(function (inst, arr) {
					for (let n = 0, len = arr.length; n < len; n++) {
						if (inst._isNonSplitNode(arr[n])) return true;
					}
					return false;
				})(this, nodesToRemove));

		const isSizeNode = isRemoveNode || this._sn_isSizeNode(newNode);
		const _getMaintainedNode = this._sn_getMaintainedNode.bind(this, isRemoveAnchor, isSizeNode);
		const _isMaintainedNode = this._sn_isMaintainedNode.bind(this, isRemoveAnchor, isSizeNode);

		// one line
		if (oneLine) {
			if (this._sn_resetCommonListCell(lineNodes[0], stylesToModify)) range = this.selection.setRange(startCon, startOff, endCon, endOff);

			const newRange = this._setNode_oneLine(lineNodes[0], newNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, range.collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode);
			start.container = newRange.startContainer;
			start.offset = newRange.startOffset;
			end.container = newRange.endContainer;
			end.offset = newRange.endOffset;

			if (start.container === end.container && dom.check.isZeroWidth(start.container)) {
				start.offset = end.offset = 1;
			}
			this._sn_setCommonListStyle(newRange.ancestor, null);
		} else {
			// multi line
			let appliedCommonList = false;
			if (endLength > 0 && this._sn_resetCommonListCell(lineNodes[endLength], stylesToModify)) appliedCommonList = true;
			if (this._sn_resetCommonListCell(lineNodes[0], stylesToModify)) appliedCommonList = true;
			if (appliedCommonList) this.selection.setRange(startCon, startOff, endCon, endOff);

			// end
			if (endLength > 0) {
				newNode = styleNode.cloneNode(false);
				end = this._setNode_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode);
			}

			// mid
			for (let i = endLength - 1, newRange; i > 0; i--) {
				this._sn_resetCommonListCell(lineNodes[i], stylesToModify);
				newNode = styleNode.cloneNode(false);
				newRange = this._setNode_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, end.container);
				if (newRange.endContainer && newRange.ancestor.contains(newRange.endContainer)) {
					end.ancestor = null;
					end.container = newRange.endContainer;
				}
				this._sn_setCommonListStyle(newRange.ancestor, null);
			}

			// start
			newNode = styleNode.cloneNode(false);
			start = this._setNode_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, end.container);

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
			this._sn_setCommonListStyle(end.ancestor || this.format.getLine(end.container), null);
		}

		// set range
		this.ui._offCurrentController();
		this.selection.setRange(start.container, start.offset, end.container, end.offset);
		this.history.push(false);

		return /** @type {HTMLElement} */ (newNode);
	},

	/**
	 * @this {InlineThis}
	 * @description Remove all inline formats (styles and tags) from the currently selected text.
	 * - This is a convenience method that calls apply() with null parameters to strip all formatting.
	 * - Removes all inline style nodes (span, strong, em, a, etc.)
	 * - Preserves only the plain text content
	 * - Works on the current selection or collapsed cursor position
	 */
	remove() {
		this.apply(null, { stylesToModify: null, nodesToRemove: null, strictRemove: null });
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_isNonSplitNode(element) {
		if (!element) return false;
		const checkRegExp = /^(a|label|code|summary)$/i;
		if (typeof element === 'string') return checkRegExp.test(element);
		return element.nodeType === 1 && checkRegExp.test(element.nodeName);
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Nodes that need to be added without modification when changing text nodes
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_isIgnoreNodeChange(element) {
		return element && element.nodeType === 1 && (dom.check.isNonEditable(element) || !this.format.isTextStyleNode(element) || this.component.is(element));
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps text nodes of line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {boolean} collapsed range.collapsed
	 * @param {Object} _removeCheck Object with "v" property tracking removal state.
	 * @param {(element: Node) => Node|null} _getMaintainedNode Function to get maintained parent node.
	 * @param {(element: Node) => boolean} _isMaintainedNode Function to check if node should be maintained.
	 * @returns {{ancestor: *, startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
	 */
	_setNode_oneLine(element, newInnerNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
		// not add tag
		let parentCon = startCon.parentNode;
		while (!parentCon.nextSibling && !parentCon.previousSibling && !this.format.isLine(parentCon.parentNode) && !dom.check.isWysiwygFrame(parentCon.parentNode)) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon === endCon.parentNode && parentCon.nodeName === newInnerNode.nodeName) {
			if (dom.check.isZeroWidth(startCon.textContent.slice(0, startOff)) && dom.check.isZeroWidth(endCon.textContent.slice(endOff))) {
				const children = parentCon.childNodes;
				let sameTag = false;

				for (let i = 0, len = children.length, c, s, e, z; i < len; i++) {
					c = children[i];
					z = !dom.check.isZeroWidth(c);
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
					dom.utils.copyTagAttributes(parentCon, newInnerNode);

					return {
						ancestor: element,
						startContainer: startCon,
						startOffset: startOff,
						endContainer: endCon,
						endOffset: endOff,
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

		const wRegExp = RegExp;
		function checkCss(vNode) {
			const regExp = new wRegExp('(?:;|^|\\s)(?:' + cssText + 'null)\\s*:[^;]*\\s*(?:;|$)', 'ig');
			let style = false;

			if (regExp && vNode.style.cssText.length > 0) {
				style = regExp.test(vNode.style.cssText);
			}

			return !style;
		}

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
				const child = childNodes[i];
				if (!child) continue;
				let coverNode = ancestor;
				let cloneNode;

				// startContainer
				if (!startPass && child === startContainer) {
					let line = pNode;
					anchorNode = _getMaintainedNode(child);

					let _prevText = '';
					let _nextText = '';
					if (startContainer.nodeType === 3) {
						const sText = /** @type {Text} */ (startContainer);
						_prevText = sText.substringData(0, startOffset);
						_nextText = sText.substringData(startOffset, isSameNode ? (endOffset >= startOffset ? endOffset - startOffset : sText.data.length - startOffset) : sText.data.length - startOffset);
					}

					const prevNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						const a = _getMaintainedNode(ancestor);
						if (a.parentNode !== line) {
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

					if (!dom.check.isZeroWidth(prevNode)) {
						ancestor.appendChild(prevNode);
					}

					const prevAnchorNode = _getMaintainedNode(ancestor);
					if (prevAnchorNode) anchorNode = prevAnchorNode;
					if (anchorNode) line = anchorNode;

					newNode = /** @type {HTMLElement} */ (child);
					pCurrent = [];
					cssText = '';
					while (newNode !== line && newNode !== el && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
							pCurrent.push(vNode);
							cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
						}
						newNode = newNode.parentElement;
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

					let _prevText = '';
					let _nextText = '';
					if (endContainer.nodeType === 3) {
						const eText = /** @type {Text} */ (endContainer);
						_prevText = eText.substringData(endOffset, eText.length - endOffset);
						_nextText = isSameNode ? '' : eText.substringData(0, endOffset);
					}

					const afterNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						anchorNode = anchorNode.cloneNode(false);
					} else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
						newInnerNode = newInnerNode.cloneNode(false);
						pNode.appendChild(newInnerNode);
						nNodeArray.push(newInnerNode);
					}

					if (!dom.check.isZeroWidth(afterNode)) {
						newNode = /** @type {HTMLElement} */ (child);
						cssText = '';
						pCurrent = [];
						const anchors = [];
						while (newNode !== pNode && newNode !== el && newNode !== null) {
							if (newNode.nodeType === 1 && checkCss(newNode)) {
								if (_isMaintainedNode(newNode)) anchors.push(newNode.cloneNode(false));
								else pCurrent.push(newNode.cloneNode(false));
								cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
							}
							newNode = newNode.parentElement;
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

					newNode = /** @type {HTMLElement} */ (child);
					pCurrent = [];
					cssText = '';
					while (newNode !== pNode && newNode !== el && newNode !== null) {
						vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
						if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
							pCurrent.push(vNode);
							cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
						}
						newNode = newNode.parentElement;
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
						textNode.textContent = unicode.zeroWidthSpace;
					}

					if (newNode !== textNode) newNode.appendChild(endContainer);
					continue;
				}

				// other
				if (startPass) {
					if (child.nodeType === 1 && !dom.check.isBreak(child)) {
						if (inst._isIgnoreNodeChange(child)) {
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

					newNode = /** @type {HTMLElement} */ (child);
					pCurrent = [];
					cssText = '';
					const anchors = [];
					while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
						vNode = endPass ? newNode.cloneNode(false) : validation(newNode);
						if (newNode.nodeType === 1 && !dom.check.isBreak(child) && vNode && checkCss(newNode)) {
							if (_isMaintainedNode(newNode)) {
								if (!anchorNode) anchors.push(vNode);
							} else {
								pCurrent.push(vNode);
							}
							cssText += newNode.style.cssText.substring(0, newNode.style.cssText.indexOf(':')) + '|';
						}
						newNode = newNode.parentElement;
					}
					pCurrent = pCurrent.concat(anchors);

					const childNode = pCurrent.pop() || child;
					appendNode = newNode = childNode;
					while (pCurrent.length > 0) {
						newNode = pCurrent.pop();
						appendNode.appendChild(newNode);
						appendNode = newNode;
					}

					if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode) && !dom.check.isZeroWidth(newInnerNode)) {
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
						if (/** @type {HTMLElement} */ (newInnerNode).children.length > 0) ancestor = newNode;
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
							const ancestorAnchorNode = dom.query.getParentElement(ancestor, (c) => {
								return inst._isNonSplitNode(c.parentNode) || c.parentNode === pNode;
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
				if (child.nodeType === 1 && !dom.check.isBreak(child)) coverNode = cloneNode;

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
				endOffset: endOff,
			};
		}

		isRemoveFormat &&= isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];
				let textNode, textNode_s, textNode_e;

				if (collapsed) {
					textNode = dom.utils.createTextNode(unicode.zeroWidthSpace);
					pNode.replaceChild(textNode, removeNode);
				} else {
					const rChildren = removeNode.childNodes;
					textNode_s = rChildren[0];
					while (rChildren[0]) {
						textNode_e = rChildren[0];
						pNode.insertBefore(textNode_e, removeNode);
					}
					dom.utils.removeItem(removeNode);
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

		this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);

		if (collapsed) {
			startOffset = startContainer.textContent.length;
			endOffset = endContainer.textContent.length;
		}

		// endContainer reset
		const endConReset = isRemoveFormat || endContainer.textContent.length === 0;

		if (!dom.check.isBreak(endContainer) && endContainer.textContent.length === 0) {
			dom.utils.removeItem(endContainer);
			endContainer = startContainer;
		}
		endOffset = endConReset ? endContainer.textContent.length : endOffset;

		// node change
		const newStartOffset = {
			s: 0,
			e: 0,
		};
		const startPath = dom.query.getNodePath(startContainer, pNode, newStartOffset);

		const mergeEndCon = !endContainer.parentNode;
		if (mergeEndCon) endContainer = startContainer;
		const newEndOffset = {
			s: 0,
			e: 0,
		};
		const endPath = dom.query.getNodePath(endContainer, pNode, !mergeEndCon && !endConReset ? newEndOffset : null);

		startOffset += newStartOffset.s;
		endOffset = collapsed ? startOffset : mergeEndCon ? startContainer.textContent.length : endConReset ? endOffset + newStartOffset.s : endOffset + newEndOffset.s;

		// tag merge
		const newOffsets = this.nodeTransform.mergeSameTags(pNode, [startPath, endPath], true);

		element.parentNode.replaceChild(pNode, element);

		startContainer = dom.query.getNodeFromPath(startPath, pNode);
		endContainer = dom.query.getNodeFromPath(endPath, pNode);

		return {
			ancestor: pNode,
			startContainer: startContainer,
			startOffset: startOffset + newOffsets[0],
			endContainer: endContainer,
			endOffset: endOffset + newOffsets[1],
		};
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps first line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} startCon The startContainer property of the selection object.
	 * @param {number} startOff The startOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Object} _removeCheck Object tracking removal state.
	 * @param {(element: Node) => Node|null} _getMaintainedNode Function to get maintained parent node.
	 * @param {(element: Node) => boolean} _isMaintainedNode Function to check if node should be maintained.
	 * @param {Node} _endContainer End container node.
	 * @returns {NodeStyleContainerType} { ancestor, container, offset, endContainer }
	 */
	_setNode_startLine(element, newInnerNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, _endContainer) {
		// not add tag
		let parentCon = startCon.parentNode;
		while (!parentCon.nextSibling && !parentCon.previousSibling && !this.format.isLine(parentCon.parentNode) && !dom.check.isWysiwygFrame(parentCon.parentNode)) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !this.format.isLine(parentCon) && !parentCon.nextSibling && dom.check.isZeroWidth(startCon.textContent.slice(0, startOff))) {
			let sameTag = false;
			let s = startCon.previousSibling;
			while (s) {
				if (!dom.check.isZeroWidth(s)) {
					sameTag = false;
					break;
				}
				s = s.previousSibling;
			}

			if (sameTag) {
				dom.utils.copyTagAttributes(parentCon, newInnerNode);

				return {
					ancestor: element,
					container: startCon,
					offset: startOff,
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
				const child = /** @type {HTMLElement} */ (childNodes[i]);
				if (!child) continue;
				let coverNode = ancestor;

				if (passNode && !dom.check.isBreak(child)) {
					if (child.nodeType === 1) {
						if (inst._isIgnoreNodeChange(child)) {
							newInnerNode = newInnerNode.cloneNode(false);
							cloneChild = child.cloneNode(true);
							pNode.appendChild(cloneChild);
							pNode.appendChild(newInnerNode);
							nNodeArray.push(newInnerNode);

							// end container
							if (_endContainer && child.contains(_endContainer)) {
								const endPath = dom.query.getNodePath(_endContainer, child);
								_endContainer = dom.query.getNodeFromPath(endPath, cloneChild);
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
							const ancestorAnchorNode = dom.query.getParentElement(ancestor, (c) => {
								return inst._isNonSplitNode(c.parentNode) || c.parentNode === pNode;
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

					let _prevText = '';
					let _nextText = '';
					if (container.nodeType === 3) {
						const cText = /** @type {Text} */ (container);
						_prevText = cText.substringData(0, offset);
						_nextText = cText.substringData(offset, cText.length - offset);
					}

					const prevNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

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

					if (!dom.check.isZeroWidth(prevNode)) {
						ancestor.appendChild(prevNode);
					}

					const prevAnchorNode = _getMaintainedNode(ancestor);
					if (prevAnchorNode) anchorNode = prevAnchorNode;
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

					if (dom.check.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));
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
					if (child.nodeType === 1 && !dom.check.isBreak(child)) coverNode = vNode;
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
				endContainer: _endContainer,
			};
		}

		isRemoveFormat &&= isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				const textNode = rChildren[0];
				while (rChildren[0]) {
					pNode.insertBefore(rChildren[0], removeNode);
				}
				dom.utils.removeItem(removeNode);

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
				container = dom.utils.createTextNode(unicode.zeroWidthSpace);
				element.appendChild(container);
			}
		} else {
			this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);

			if (dom.check.isZeroWidth(pNode.textContent)) {
				container = pNode.firstChild;
				offset = 0;
			}

			// node change
			const offsets = {
				s: 0,
				e: 0,
			};
			const path = dom.query.getNodePath(container, pNode, offsets);
			offset += offsets.s;

			// tag merge
			const newOffsets = this.nodeTransform.mergeSameTags(pNode, [path], true);

			element.parentNode.replaceChild(pNode, element);

			container = dom.query.getNodeFromPath(path, pNode);
			offset += newOffsets[0];
		}

		return {
			ancestor: pNode,
			container: container,
			offset: offset,
			endContainer: _endContainer,
		};
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps mid lines selected text.
	 * @param {HTMLElement} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Object} _removeCheck Object tracking removal state.
	 * @param {Node} _endContainer Offset node of last line already modified (end.container)
	 * @returns {NodeStyleContainerType} { ancestor, endContainer: "If end container is renewed, returned renewed node" }
	 */
	_setNode_middleLine(element, newInnerNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, _endContainer) {
		// not add tag
		if (!isRemoveNode) {
			// end container path
			let endPath = null;
			if (_endContainer && element.contains(_endContainer)) endPath = dom.query.getNodePath(_endContainer, element);

			const tempNode = element.cloneNode(true);
			const newNodeName = /** @type {HTMLElement} */ (newInnerNode).nodeName;
			const newCssText = /** @type {HTMLElement} */ (newInnerNode).style.cssText;
			const newClass = /** @type {HTMLElement} */ (newInnerNode).className;

			let children = tempNode.childNodes;
			let i = 0,
				len = children.length;
			for (let child; i < len; i++) {
				child = /** @type {HTMLElement} */ (children[i]);
				if (child.nodeType === 3) break;
				if (child.nodeName === newNodeName) {
					child.style.cssText += newCssText;
					dom.utils.addClass(child, newClass);
				} else if (!dom.check.isBreak(child) && this._isIgnoreNodeChange(child)) {
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
				element.innerHTML = /** @type {HTMLElement} */ (tempNode).innerHTML;
				return {
					ancestor: element,
					endContainer: endPath ? dom.query.getNodeFromPath(endPath, element) : null,
				};
			}
		}

		// add tag
		_removeCheck.v = false;
		const inst = this;
		const pNode = element.cloneNode(false);
		const nNodeArray = [newInnerNode];
		let noneChange = true;

		(function recursionFunc(current, ancestor) {
			const childNodes = current.childNodes;

			for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
				const child = /** @type {HTMLElement} */ (childNodes[i]);
				if (!child) continue;
				let coverNode = ancestor;

				if (!dom.check.isBreak(child) && inst._isIgnoreNodeChange(child)) {
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
						const endPath = dom.query.getNodePath(_endContainer, child);
						_endContainer = dom.query.getNodeFromPath(endPath, cloneChild);
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

				if (!dom.check.isBreak(child)) recursionFunc(child, coverNode);
			}
		})(element, newInnerNode);

		// not remove tag
		if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v))
			return {
				ancestor: element,
				endContainer: _endContainer,
			};

		pNode.appendChild(newInnerNode);

		if (isRemoveFormat && isRemoveNode) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				while (rChildren[0]) {
					pNode.insertBefore(rChildren[0], removeNode);
				}
				dom.utils.removeItem(removeNode);
			}
		} else if (isRemoveNode) {
			newInnerNode = newInnerNode.firstChild;
			for (let i = 0; i < nNodeArray.length; i++) {
				SN_StripRemoveNode(nNodeArray[i]);
			}
		}

		this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);
		this.nodeTransform.mergeSameTags(pNode, null, true);

		// node change
		element.parentNode.replaceChild(pNode, element);
		return {
			ancestor: pNode,
			endContainer: _endContainer,
		};
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description wraps last line selected text.
	 * @param {Node} element The node of the line that contains the selected text node.
	 * @param {Node} newInnerNode The dom that will wrap the selected text area
	 * @param {(current: Node) => Node|null} validation Check if the node should be stripped.
	 * @param {Node} endCon The endContainer property of the selection object.
	 * @param {number} endOff The endOffset property of the selection object.
	 * @param {boolean} isRemoveFormat Is the remove all formats command?
	 * @param {boolean} isRemoveNode "newInnerNode" is remove node?
	 * @param {Object} _removeCheck Object tracking removal state.
	 * @param {(element: Node) => Node|null} _getMaintainedNode Function to get maintained parent node.
	 * @param {(element: Node) => boolean} _isMaintainedNode Function to check if node should be maintained.
	 * @returns {NodeStyleContainerType} { ancestor, container, offset }
	 */
	_setNode_endLine(element, newInnerNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
		// not add tag
		let parentCon = endCon.parentNode;
		while (!parentCon.nextSibling && !parentCon.previousSibling && !this.format.isLine(parentCon.parentNode) && !dom.check.isWysiwygFrame(parentCon.parentNode)) {
			if (parentCon.nodeName === newInnerNode.nodeName) break;
			parentCon = parentCon.parentNode;
		}

		if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !this.format.isLine(parentCon) && !parentCon.previousSibling && dom.check.isZeroWidth(endCon.textContent.slice(endOff))) {
			let sameTag = false;
			let e = endCon.nextSibling;
			while (e) {
				if (!dom.check.isZeroWidth(e)) {
					sameTag = false;
					break;
				}
				e = e.nextSibling;
			}

			if (sameTag) {
				dom.utils.copyTagAttributes(parentCon, newInnerNode);

				return {
					ancestor: element,
					container: endCon,
					offset: endOff,
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

				if (passNode && !dom.check.isBreak(child)) {
					if (child.nodeType === 1) {
						if (inst._isIgnoreNodeChange(child)) {
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
						if (/** @type {HTMLElement} */ (newInnerNode).children.length > 0) ancestor = newNode;
						else ancestor = newInnerNode;
					} else if (isTopNode) {
						newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
						ancestor = newNode;
					} else {
						ancestor = newInnerNode;
					}

					if (anchorNode && child.nodeType === 3) {
						if (_getMaintainedNode(child)) {
							const ancestorAnchorNode = dom.query.getParentElement(ancestor, (c) => {
								return inst._isNonSplitNode(c.parentNode) || c.parentNode === pNode;
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

					let _prevText = '';
					let _nextText = '';
					if (container.nodeType === 3) {
						const cText = /** @type {Text} */ (container);
						_prevText = cText.substringData(offset, cText.length - offset);
						_nextText = cText.substringData(0, offset);
					}

					const afterNode = dom.utils.createTextNode(_prevText);
					const textNode = dom.utils.createTextNode(_nextText);

					if (anchorNode) {
						anchorNode = anchorNode.cloneNode(false);
						const a = _getMaintainedNode(ancestor);
						if (a.parentNode !== pNode) {
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

					if (!dom.check.isZeroWidth(afterNode)) {
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

					if (dom.check.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));

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
					if (child.nodeType === 1 && !dom.check.isBreak(child)) coverNode = vNode;
				}

				recursionFunc(child, coverNode);
			}
		})(element, pNode);

		// not remove tag
		if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
			return {
				ancestor: element,
				container: endCon,
				offset: endOff,
			};
		}

		isRemoveFormat &&= isRemoveNode;

		if (isRemoveFormat) {
			for (let i = 0; i < nNodeArray.length; i++) {
				const removeNode = nNodeArray[i];

				const rChildren = removeNode.childNodes;
				let textNode = null;
				while (rChildren[0]) {
					textNode = rChildren[0];
					pNode.insertBefore(textNode, removeNode);
				}
				dom.utils.removeItem(removeNode);

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
				container = dom.utils.createTextNode(unicode.zeroWidthSpace);
				element.appendChild(container);
			}
		} else {
			if (!isRemoveNode && newInnerNode.textContent.length === 0) {
				this.nodeTransform.removeEmptyNode(pNode, null, false);
				return {
					ancestor: null,
					container: null,
					offset: 0,
				};
			}

			this.nodeTransform.removeEmptyNode(pNode, newInnerNode, false);

			if (dom.check.isZeroWidth(pNode.textContent)) {
				container = pNode.firstChild;
				offset = container.textContent.length;
			} else if (dom.check.isZeroWidth(container)) {
				container = newInnerNode;
				offset = 1;
			}

			// node change
			const offsets = {
				s: 0,
				e: 0,
			};
			const path = dom.query.getNodePath(container, pNode, offsets);
			offset += offsets.s;

			// tag merge
			const newOffsets = this.nodeTransform.mergeSameTags(pNode, [path], true);

			element.parentNode.replaceChild(pNode, element);

			container = dom.query.getNodeFromPath(path, pNode);
			offset += newOffsets[0];
		}

		return {
			ancestor: pNode,
			container: container,
			offset: container.nodeType === 1 && offset === 1 ? container.childNodes.length : offset,
		};
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Node with font-size style
	 * @param {Node} element Element to check
	 * @returns {boolean}
	 */
	_sn_isSizeNode(element) {
		return element && typeof element !== 'string' && element.nodeType !== 3 && this.format.isTextStyleNode(element) && !!element.style.fontSize;
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Return the parent maintained tag. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {Node|null}
	 */
	_sn_getMaintainedNode(_isRemove, _isSizeNode, element) {
		if (!element || _isRemove) return null;
		return dom.query.getParentElement(element, this._isNonSplitNode.bind(this)) || (!_isSizeNode ? dom.query.getParentElement(element, this._sn_isSizeNode.bind(this)) : null);
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Check if element is a tag that should be persisted. (bind and use a util object)
	 * @param {boolean} _isRemove is remove anchor
	 * @param {boolean} _isSizeNode is size span node
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_sn_isMaintainedNode(_isRemove, _isSizeNode, element) {
		if (!element || _isRemove || element.nodeType !== 1) return false;
		const anchor = this._isNonSplitNode(element);
		return dom.query.getParentElement(element, this._isNonSplitNode.bind(this)) ? anchor : anchor || (!_isSizeNode ? this._sn_isSizeNode(element) : false);
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description If certain styles are applied to all child nodes of the list cell, the style of the list cell is also changed. (bold, color, size)
	 * @param {Node} el List cell element. <li>
	 * @param {?Node} child Variable for recursive call. ("null" on the first call)
	 */
	_sn_setCommonListStyle(el, child) {
		if (!dom.check.isListCell(el)) return;

		const children = dom.utils.arrayFilter((child || el).childNodes, (current) => !dom.check.isBreak(current));
		child = children[0];

		if (!dom.check.isElement(child) || children.length > 1) return;

		// set cell style---
		const childStyle = child.style;
		const elStyle = el.style;
		const nodeName = child.nodeName.toLowerCase();
		let appliedEl = false;

		// bold, italic
		if (this.options.get('_defaultStyleTagMap')[nodeName] === this.options.get('_defaultTagCommand').bold.toLowerCase()) elStyle.fontWeight = 'bold';
		if (this.options.get('_defaultStyleTagMap')[nodeName] === this.options.get('_defaultTagCommand').italic.toLowerCase()) elStyle.fontStyle = 'italic';

		// styles
		const cKeys = converter.getValues(childStyle);
		if (cKeys.length > 0) {
			for (let i = 0, len = this._listCamel.length; i < len; i++) {
				if (cKeys.includes(this._listKebab[i])) {
					elStyle[this._listCamel[i]] = childStyle[this._listCamel[i]];
					childStyle.removeProperty(this._listKebab[i]);
					appliedEl = true;
				}
			}
		}

		this._sn_setCommonListStyle(el, child);
		if (!appliedEl) return;

		// common style
		if (childStyle.length === 0) {
			const ch = child.childNodes;
			const p = child.parentNode;
			const n = child.nextSibling;
			while (ch.length > 0) {
				p.insertBefore(ch[0], n);
			}
			dom.utils.removeItem(child);
		}
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Watch the applied text nodes and adjust the common styles of the list.
	 * @param {Node} el "LI" element
	 * @param {?Array} styleArray Refer style array
	 */
	_sn_resetCommonListCell(el, styleArray) {
		if (!dom.check.isListCell(el)) return;
		styleArray ||= this._listKebab;

		const children = dom.utils.arrayFilter(el.childNodes, (current) => !dom.check.isBreak(current));
		const elStyles = el.style;

		const ec = [],
			ek = [],
			elKeys = converter.getValues(elStyles);
		for (let i = 0, len = this._listKebab.length; i < len; i++) {
			if (elKeys.includes(this._listKebab[i]) && styleArray.includes(this._listKebab[i])) {
				ec.push(this._listCamel[i]);
				ek.push(this._listKebab[i]);
			}
		}

		if (ec.length === 0) return;

		// reset cell style---
		const refer = dom.utils.createElement('SPAN');
		for (let i = 0, len = ec.length; i < len; i++) {
			refer.style[ec[i]] = elStyles[ek[i]];
			elStyles.removeProperty(ek[i]);
		}

		let sel = refer.cloneNode(false);
		let r = null,
			appliedEl = false;
		for (let i = 0, len = children.length, c, s; i < len; i++) {
			c = /** @type {HTMLElement} */ (children[i]);
			if (this.options.get('_defaultStyleTagMap')[c.nodeName.toLowerCase()]) continue;

			s = converter.getValues(c.style);
			if (
				s.length === 0 ||
				(ec.some(function (k) {
					return !s.includes(k);
				}) &&
					s.some(function (k) {
						ec.includes(k);
					}))
			) {
				r = c.nextSibling;
				sel.appendChild(c);
			} else if (sel.childNodes.length > 0) {
				el.insertBefore(sel, r);
				sel = refer.cloneNode(false);
				r = null;
				appliedEl = true;
			}
		}

		if (sel.childNodes.length > 0) {
			el.insertBefore(sel, r);
			appliedEl = true;
		}
		if (elStyles.length === 0) {
			el.removeAttribute('style');
		}

		return appliedEl;
	},

	/**
	 * @internal
	 * @this {InlineThis}
	 * @description Destroy the Inline instance and release memory
	 */
	_destroy() {
		// No cleanup needed - GC handles internal properties
	},

	constructor: Inline,
};

/**
 * @description Strip remove node
 * @param {Node} removeNode The remove node
 */
function SN_StripRemoveNode(removeNode) {
	const element = removeNode.parentNode;
	if (!removeNode || removeNode.nodeType === 3 || !element) return;

	const children = removeNode.childNodes;
	while (children[0]) {
		element.insertBefore(children[0], removeNode);
	}

	element.removeChild(removeNode);
}

export default Inline;
