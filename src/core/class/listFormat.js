/**
 * @fileoverview Format class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom } from '../../helper';

/**
 * @description Classes related to editor formats such as "list" (ol, ul, li)
 * - "list" is a special "line", "block" format.
 */
class ListFormat extends CoreInjector {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor) {
		super(editor);
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
	/** @type {SunEditor.Core['inline']} */
	get #inline() {
		return this.editor.inline;
	}
	/** @type {SunEditor.Core['nodeTransform']} */
	get #nodeTransform() {
		return this.editor.nodeTransform;
	}

	/**
	 * @description Append all selected "line" element to the list and insert.
	 * @param {string} type List type. (ol | ul):[listStyleType]
	 * @param {Array<Node>} selectedCells "line" elements or list cells.
	 * @param {boolean} nested If true, indenting existing list cells.
	 * @example
	 * // Create ordered list from selected lines
	 * const lines = editor.format.getLines();
	 * editor.listFormat.apply('ol', lines, false);
	 *
	 * // Create unordered list with custom style
	 * editor.listFormat.apply('ul:circle', selectedElements, false);
	 *
	 * // Indent existing list items
	 * const listItems = [li1, li2, li3];
	 * editor.listFormat.apply('ul', listItems, true);
	 */
	apply(type, selectedCells, nested) {
		const listTag = (type.split(':')[0] || 'ol').toUpperCase();
		const listStyle = type.split(':')[1] || '';

		let range = this.#selection.getRange();
		let selectedFormats = /** @type {Array<HTMLElement>} */ (!selectedCells ? this.#format.getLinesAndComponents(false) : selectedCells);

		if (selectedFormats.length === 0) {
			if (selectedCells) return;
			range = this.#selection.getRangeAndAddLine(range, null);
			selectedFormats = this.#format.getLinesAndComponents(false);
			if (selectedFormats.length === 0) return;
		}

		dom.query.sortNodeByDepth(selectedFormats, true);

		// merge
		const firstSel = selectedFormats[0];
		const lastSel = selectedFormats.at(-1);
		let topEl = (dom.check.isListCell(firstSel) || this.#component.is(firstSel)) && !firstSel.previousElementSibling ? firstSel.parentElement.previousElementSibling : firstSel.previousElementSibling;
		let bottomEl = (dom.check.isListCell(lastSel) || this.#component.is(lastSel)) && !lastSel.nextElementSibling ? lastSel.parentElement.nextElementSibling : lastSel.nextElementSibling;

		const isCollapsed = range.collapsed;
		const originRange = {
			sc: range.startContainer,
			so: range.startContainer === range.endContainer && dom.check.isZeroWidth(range.startContainer) && range.startOffset === 0 && range.endOffset === 1 ? range.endOffset : range.startOffset,
			ec: range.endContainer,
			eo: range.endOffset,
		};
		let afterRange = null;
		let isRemove = true;

		for (let i = 0, len = selectedFormats.length; i < len; i++) {
			if (!dom.check.isList(this.#format.getBlock(selectedFormats[i], (current) => this.#format.getBlock(current) && current !== selectedFormats[i]))) {
				isRemove = false;
				break;
			}
		}

		if (isRemove && (!topEl || firstSel.tagName !== topEl.tagName || listTag !== topEl.tagName.toUpperCase()) && (!bottomEl || lastSel.tagName !== bottomEl.tagName || listTag !== bottomEl.tagName.toUpperCase())) {
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

			const currentFormat = this.#format.getBlock(firstSel);
			const cancel = currentFormat?.tagName === listTag;
			let rangeArr, tempList;
			const passComponent = (current) => {
				return !dom.check.isComponentContainer(current);
			};

			if (!cancel) {
				tempList = dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
			}

			for (let i = 0, len = selectedFormats.length, r, o; i < len; i++) {
				o = this.#format.getBlock(selectedFormats[i], passComponent);
				if (!o || !dom.check.isList(o)) continue;

				if (!r) {
					r = o;
					rangeArr = {
						r: r,
						f: [dom.query.getParentElement(selectedFormats[i], 'LI')],
					};
				} else {
					if (r !== o) {
						if (nested && dom.check.isListCell(o.parentNode)) {
							this.#detachNested(rangeArr.f);
						} else {
							afterRange = this.#format.removeBlock(rangeArr.f[0].parentElement, { selectedFormats: rangeArr.f, newBlockElement: tempList, shouldDelete: false, skipHistory: true });
						}

						o = selectedFormats[i].parentNode;
						if (!cancel) {
							tempList = dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
						}

						r = o;
						rangeArr = {
							r: r,
							f: [dom.query.getParentElement(selectedFormats[i], 'LI')],
						};
					} else {
						rangeArr.f.push(dom.query.getParentElement(selectedFormats[i], 'LI'));
					}
				}

				if (i === len - 1) {
					if (nested && dom.check.isListCell(o.parentNode)) {
						this.#detachNested(rangeArr.f);
					} else {
						afterRange = this.#format.removeBlock(rangeArr.f[0].parentElement, { selectedFormats: rangeArr.f, newBlockElement: tempList, shouldDelete: false, skipHistory: true });
					}
				}
			}
		} else {
			const topElParent = topEl ? topEl.parentNode : topEl;
			const bottomElParent = bottomEl ? bottomEl.parentNode : bottomEl;
			topEl = /** @type {HTMLElement} */ (topElParent && !dom.check.isWysiwygFrame(topElParent) && topElParent.nodeName === listTag ? topElParent : topEl);
			bottomEl = /** @type {HTMLElement} */ (bottomElParent && !dom.check.isWysiwygFrame(bottomElParent) && bottomElParent.nodeName === listTag ? bottomElParent : bottomEl);

			const mergeTop = topEl?.tagName === listTag;
			const mergeBottom = bottomEl?.tagName === listTag;

			let list = mergeTop ? topEl : dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
			let firstList = null;
			let topNumber = null;
			// let lastList = null;
			// let bottomNumber = null;

			const passComponent = (current) => {
				return !dom.check.isComponentContainer(current) && !dom.check.isList(current);
			};

			for (let i = 0, len = selectedFormats.length, newCell, fTag, isCell, next, originParent, nextParent, parentTag, siblingTag, rangeTag; i < len; i++) {
				fTag = selectedFormats[i];
				if (fTag.childNodes.length === 0 && !this.#inline._isIgnoreNodeChange(fTag)) {
					dom.utils.removeItem(fTag);
					continue;
				}
				next = selectedFormats[i + 1];
				originParent = fTag.parentNode;
				nextParent = next ? next.parentNode : null;
				isCell = dom.check.isListCell(fTag);
				rangeTag = this.#format.isBlock(originParent) ? originParent : null;
				parentTag = isCell && !dom.check.isWysiwygFrame(originParent) ? originParent.parentNode : originParent;
				siblingTag = isCell && !dom.check.isWysiwygFrame(originParent) ? (!next || dom.check.isListCell(parentTag) ? originParent : originParent.nextSibling) : fTag.nextSibling;

				newCell = dom.utils.createElement('LI');

				if (this.#component.is(fTag)) {
					const isHR = /^HR$/i.test(fTag.nodeName);
					if (!isHR) newCell.innerHTML = '<br>';
					newCell.innerHTML += fTag.outerHTML;
					if (isHR) newCell.innerHTML += '<br>';
				} else {
					dom.utils.copyFormatAttributes(newCell, fTag);
					const fChildren = fTag.childNodes;
					while (fChildren[0]) {
						newCell.appendChild(fChildren[0]);
					}
				}
				list.appendChild(newCell);

				// if (!next) lastList = list;
				if (!next || parentTag !== nextParent || this.#format.isBlock(siblingTag)) {
					firstList ||= list;
					if ((!mergeTop || !next || parentTag !== nextParent) && !(next && dom.check.isList(nextParent) && nextParent === originParent)) {
						if (list.parentNode !== parentTag) parentTag.insertBefore(list, siblingTag);
					}
				}

				dom.utils.removeItem(fTag);
				if (mergeTop && topNumber === null) topNumber = list.children.length - 1;
				if (
					next &&
					(this.#format.getBlock(nextParent, passComponent) !== this.#format.getBlock(originParent, passComponent) ||
						(dom.check.isList(nextParent) && dom.check.isList(originParent) && dom.query.getNodeDepth(nextParent) !== dom.query.getNodeDepth(originParent)))
				) {
					list = dom.utils.createElement(listTag, { style: 'list-style-type: ' + listStyle });
				}

				if (rangeTag?.children.length === 0) dom.utils.removeItem(rangeTag);
			}

			if (topNumber) {
				firstList = firstList.children[topNumber];
			}

			if (mergeBottom) {
				// bottomNumber = list.children.length - 1;
				list.innerHTML += bottomEl.innerHTML;
				// lastList = list.children[bottomNumber] || lastList;
				dom.utils.removeItem(bottomEl);
			}
		}

		this.editor.effectNode = null;
		return !isRemove || !isCollapsed ? originRange : afterRange || originRange;
	}

	/**
	 * @description "selectedCells" array are detached from the list element.
	 * - The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
	 * @param {Array<Node>} selectedCells Array of ["line", li] elements(LI, P...) to remove.
	 * @param {boolean} shouldDelete If true, It does not just remove the list, it deletes the content.
	 * @returns {{sc: Node, ec: Node}} Node information after deletion
	 * - sc: Start container node
	 * - ec: End container node
	 */
	remove(selectedCells, shouldDelete) {
		let rangeArr = {};
		let listFirst = false;
		let listLast = false;
		let first = null;
		let last = null;
		const passComponent = (current) => {
			return !dom.check.isComponentContainer(current);
		};

		for (let i = 0, len = selectedCells.length, r, o, lastIndex, isList; i < len; i++) {
			lastIndex = i === len - 1;
			o = this.#format.getBlock(selectedCells[i], passComponent);
			isList = dom.check.isList(o);
			if (!r && isList) {
				r = o;
				rangeArr = {
					r: r,
					f: [dom.query.getParentElement(selectedCells[i], 'LI')],
				};
				if (i === 0) listFirst = true;
			} else if (r && isList) {
				if (r !== o) {
					const edge = this.#format.removeBlock(rangeArr.f[0].parentNode, { selectedFormats: rangeArr.f, newBlockElement: null, shouldDelete, skipHistory: true });
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
							f: [dom.query.getParentElement(selectedCells[i], 'LI')],
						};
						if (lastIndex) listLast = true;
					} else {
						r = null;
					}
				} else {
					rangeArr.f.push(dom.query.getParentElement(selectedCells[i], 'LI'));
					if (lastIndex) listLast = true;
				}
			}

			if (lastIndex && dom.check.isList(r)) {
				const edge = this.#format.removeBlock(rangeArr.f[0].parentNode, { selectedFormats: rangeArr.f, newBlockElement: null, shouldDelete, skipHistory: true });
				if (listLast || len === 1) last = edge.ec;
				if (listFirst) first = edge.sc || last;
			}
		}

		return {
			sc: first,
			ec: last,
		};
	}

	/**
	 * @description Nest list cells or cancel nested cells.
	 * @param {Array<HTMLElement>} selectedCells List cells.
	 * @param {boolean} nested Nested or cancel nested.
	 * @example
	 * // Indent list items (increase nesting)
	 * const selectedItems = [liElement1, liElement2];
	 * editor.listFormat.applyNested(selectedItems, true);
	 *
	 * // Outdent list items (decrease nesting)
	 * editor.listFormat.applyNested(selectedItems, false);
	 *
	 * // Get current list cells and nest them
	 * const cells = editor.format.getLines().filter(el => el.tagName === 'LI');
	 * editor.listFormat.applyNested(cells, true);
	 */
	applyNested(selectedCells, nested) {
		selectedCells = !selectedCells
			? this.#format.getLines().filter(function (el) {
					return dom.check.isListCell(el);
				})
			: selectedCells;
		const cellsLen = selectedCells.length;
		if (cellsLen === 0 || (!nested && !dom.check.isListCell(selectedCells[0].previousElementSibling) && !dom.check.isListCell(selectedCells.at(-1).nextElementSibling))) {
			return {
				sc: selectedCells[0],
				so: 0,
				ec: selectedCells.at(-1),
				eo: 1,
			};
		}

		let originList = selectedCells[0].parentElement;
		let lastCell = selectedCells.at(-1);
		let range = null;

		if (nested) {
			if (originList !== lastCell.parentElement && dom.check.isList(lastCell.parentElement.parentElement) && lastCell.nextElementSibling) {
				lastCell = /** @type {HTMLElement} */ (lastCell.nextElementSibling);
				while (lastCell) {
					selectedCells.push(lastCell);
					lastCell = /** @type {HTMLElement} */ (lastCell.nextElementSibling);
				}
			}
			range = this.apply(originList.nodeName + ':' + originList.style.listStyleType, selectedCells, true);
		} else {
			let innerList = dom.utils.createElement(originList.nodeName);
			let prev = selectedCells[0].previousElementSibling;
			let next = lastCell.nextElementSibling;
			const nodePath = {
				s: null,
				e: null,
				sl: originList,
				el: originList,
			};

			const { startContainer, startOffset, endContainer, endOffset } = this.#selection.getRange();
			for (let i = 0, len = cellsLen, c; i < len; i++) {
				c = selectedCells[i];
				if (c.parentElement !== originList) {
					this.#attachNested(originList, innerList, prev, next, nodePath);
					originList = c.parentElement;
					innerList = dom.utils.createElement(originList.nodeName);
				}

				prev = c.previousElementSibling;
				next = c.nextElementSibling;
				innerList.appendChild(c);
			}

			this.#attachNested(originList, innerList, prev, next, nodePath);

			if (cellsLen > 1) {
				const sc = dom.query.getNodeFromPath(nodePath.s, nodePath.sl);
				const ec = dom.query.getNodeFromPath(nodePath.e, nodePath.el);
				range = {
					sc: sc,
					so: 0,
					ec: ec,
					eo: ec.textContent.length,
				};
			} else {
				range = {
					sc: startContainer,
					so: startOffset,
					ec: endContainer,
					eo: endOffset,
				};
			}
		}

		return range;
	}

	/**
	 * @description Detach Nested all nested lists under the "baseNode".
	 * - Returns a list with nested removed.
	 * @param {HTMLElement} baseNode Element on which to base.
	 * @param {boolean} all If true, it also detach all nested lists of a returned list.
	 * @returns {Node} Result element
	 * @example
	 * // Remove first level of nesting
	 * const listItem = document.querySelector('li');
	 * editor.listFormat.removeNested(listItem, false);
	 *
	 * // Flatten all nested lists completely
	 * editor.listFormat.removeNested(listItem, true);
	 *
	 * // Remove nesting and get result
	 * const result = editor.listFormat.removeNested(nestedLi, false);
	 * console.log(result); // parent list element
	 */
	removeNested(baseNode, all) {
		const rNode = DeleteNestedList(baseNode);
		let rangeElement, cNodes;

		if (rNode) {
			rangeElement = rNode.cloneNode(false);
			cNodes = rNode.childNodes;
			const index = dom.query.getPositionIndex(baseNode);
			while (cNodes[index]) {
				rangeElement.appendChild(cNodes[index]);
			}
		} else {
			rangeElement = baseNode;
		}

		let rChildren;
		if (!all) {
			const depth = dom.query.getNodeDepth(baseNode) + 2;
			rChildren = dom.query.getListChildren(
				baseNode,
				(current) => {
					return dom.check.isListCell(current) && !current.previousElementSibling && dom.query.getNodeDepth(current) === depth;
				},
				null,
			);
		} else {
			rChildren = dom.query.getListChildren(
				rangeElement,
				(current) => {
					return dom.check.isListCell(current) && !current.previousElementSibling;
				},
				null,
			);
		}

		for (let i = 0, len = rChildren.length; i < len; i++) {
			DeleteNestedList(rChildren[i]);
		}

		if (rNode) {
			rNode.parentNode.insertBefore(rangeElement, rNode.nextSibling);
			if (cNodes?.length === 0) dom.utils.removeItem(rNode);
		}

		return rangeElement === baseNode ? rangeElement.parentNode : rangeElement;
	}

	/**
	 * @description Attaches a nested list structure by merging adjacent lists if applicable.
	 * - Ensures that the nested list is placed correctly in the document structure.
	 * @param {Element} originList The original list element where the nested list is inserted.
	 * @param {Element} innerList The nested list element.
	 * @param {Element} prev The previous sibling element.
	 * @param {Element} next The next sibling element.
	 * @param {{s: Array<number> | null, e: Array<number> | null, sl: Node | null, el: Node | null}} nodePath Object storing the start and end node paths.
	 * - s : Start node path.
	 * - e : End node path.
	 * - sl : Start node's parent element.
	 * - el : End node's parent element.
	 * @returns {Node} The attached inner list.
	 */
	#attachNested(originList, innerList, prev, next, nodePath) {
		let insertPrev = false;

		if (innerList.tagName === prev?.tagName) {
			const children = innerList.children;
			while (children[0]) {
				prev.appendChild(children[0]);
			}

			innerList = prev;
			insertPrev = true;
		}

		if (innerList.tagName === next?.tagName) {
			const children = next.children;
			while (children[0]) {
				innerList.appendChild(children[0]);
			}

			const temp = next.nextElementSibling;
			next.parentNode.removeChild(next);
			next = temp;
		}

		if (!insertPrev) {
			if (dom.check.isListCell(prev)) {
				originList = prev;
				next = null;
			}

			originList.insertBefore(innerList, next);

			if (!nodePath.s) {
				nodePath.s = dom.query.getNodePath(innerList.firstElementChild.firstChild, originList, null);
				nodePath.sl = originList;
			}

			const slPath = originList.contains(nodePath.sl) ? dom.query.getNodePath(nodePath.sl, originList) : null;
			nodePath.e = dom.query.getNodePath(innerList.lastElementChild.firstChild, originList, null);
			nodePath.el = originList;

			this.#nodeTransform.mergeSameTags(originList, [nodePath.s, nodePath.e, slPath], false);
			this.#nodeTransform.mergeNestedTags(originList);
			if (slPath) nodePath.sl = dom.query.getNodeFromPath(slPath, originList);
		}

		return innerList;
	}

	/**
	 * @description Detaches a nested list structure by extracting list items from their parent list.
	 * - Ensures proper restructuring of the list elements.
	 * @param {Array<HTMLElement>} cells The list items to be detached.
	 * @returns {{cc: Node, sc: Node, ec: Node}} An object containing reference nodes for repositioning.
	 * - cc : The parent node of the first list item.
	 * - sc : The first list item.
	 * - ec : The last list item.
	 */
	#detachNested(cells) {
		const first = cells[0];
		const last = cells.at(-1);
		const next = last.nextElementSibling;
		const originList = first.parentElement;
		const sibling = originList.parentElement.nextElementSibling;
		const parentNode = originList.parentElement.parentElement;

		for (let c = 0, cLen = cells.length; c < cLen; c++) {
			parentNode.insertBefore(cells[c], sibling);
		}

		if (next && originList.children.length > 0) {
			const newList = originList.cloneNode(false);
			const children = originList.childNodes;
			const index = dom.query.getPositionIndex(next);
			while (children[index]) {
				newList.appendChild(children[index]);
			}
			last.appendChild(newList);
		}

		if (originList.children.length === 0) dom.utils.removeItem(originList);
		this.#nodeTransform.mergeSameTags(parentNode);

		const edge = dom.query.getEdgeChildNodes(first, last);

		return {
			cc: first.parentNode,
			sc: edge.sc,
			ec: edge.ec,
		};
	}

	/**
	 * @internal
	 * @description Destroy the ListFormat instance and release memory
	 */
	_destroy() {
		// No internal state to clean up
	}
}

/**
 * @description Removes nested list structure by unwrapping child list elements and promoting their items to the parent level.
 * @param {Node} baseNode Node
 */
function DeleteNestedList(baseNode) {
	const baseParent = baseNode.parentNode;
	let parent = baseParent.parentNode;
	let siblingNode = /** @type {*} */ (baseParent);
	let liSibling, liParent, child, index, c;

	while (dom.check.isListCell(parent)) {
		index = dom.query.getPositionIndex(baseNode);
		liSibling = parent.nextElementSibling;
		liParent = parent.parentNode;
		child = siblingNode;

		while (child) {
			siblingNode = siblingNode.nextSibling;
			if (dom.check.isList(child)) {
				c = child.childNodes;
				while (c[index]) {
					liParent.insertBefore(c[index], liSibling);
				}
				if (c.length === 0) dom.utils.removeItem(child);
			} else {
				liParent.appendChild(child);
			}
			child = siblingNode;
		}

		parent = liParent.parentNode;
	}

	if (baseParent.children.length === 0) dom.utils.removeItem(baseParent);

	return liParent;
}

export default ListFormat;
