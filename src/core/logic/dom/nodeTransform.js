/**
 * @fileoverview Node util class
 */

import { dom, unicode, numbers } from '../../../helper';

/**
 * @description Node utility class. split, merge, etc.
 */
class NodeTransform {
	#$;
	#options;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#$ = kernel.$;
		this.#options = this.#$.options;
	}

	/**
	 * @template {HTMLElement} T
	 * @description Split all tags based on "baseNode"
	 * @param {Node} baseNode Element or text node on which to base
	 * @param {?(number|Node)} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
	 * @param {number} [depth=0] The nesting depth of the element being split. (default: 0)
	 * @returns {T} The last element of the splited tag.
	 * @example
	 * // Split at text offset
	 * const textNode = editor.selection.getNode();
	 * const newElement = editor.nodeTransform.split(textNode, 5, 0);
	 *
	 * // Split at specific depth to preserve parent structure
	 * const paragraph = editor.selection.getNode().closest('p');
	 * editor.nodeTransform.split(textNode, 10, 2);
	 *
	 * // Split by node reference
	 * const splitResult = editor.nodeTransform.split(parentNode, childNode, 1);
	 */
	split(baseNode, offset, depth) {
		if (dom.check.isWysiwygFrame(baseNode) || this.#$.component.is(baseNode) || !baseNode) return /** @type {T} */ (baseNode);

		if (offset && !numbers.is(offset)) {
			const children = baseNode.childNodes;
			let index = dom.query.getPositionIndex(/** @type {Node} */ (offset));
			const prev = baseNode.cloneNode(false);
			const next = baseNode.cloneNode(false);
			for (let i = 0, len = children.length; i < len; i++) {
				if (i < index) prev.appendChild(children[i]);
				else if (i > index) next.appendChild(children[i]);
				else continue;
				i--;
				len--;
				index--;
			}

			if (prev.childNodes.length > 0) baseNode.parentNode.insertBefore(prev, baseNode);
			if (next.childNodes.length > 0) baseNode.parentNode.insertBefore(next, /** @type {HTMLElement|Text} */ (baseNode).nextElementSibling);

			return /** @type {T} */ (baseNode);
		}

		const bp = baseNode.parentNode;
		let index = 0;
		let suffixIndex = 1;
		let next = true;
		let newEl, children, temp;
		if (!depth || depth < 0) depth = 0;

		if (dom.check.isText(baseNode)) {
			index = dom.query.getPositionIndex(baseNode);
			offset = Number(offset);
			if (offset >= 0 && baseNode.length !== offset) {
				baseNode.splitText(offset);
				const after = /** @type {Text} */ (dom.query.getNodeFromPath([index + 1], bp));
				if (dom.check.isZeroWidth(after)) after.data = unicode.zeroWidthSpace;
			}
		} else if (baseNode.nodeType === 1) {
			if (offset === 0) {
				while (baseNode.firstChild) {
					baseNode = baseNode.firstChild;
				}
				if (baseNode.nodeType === 3) {
					const after = dom.utils.createTextNode(unicode.zeroWidthSpace);
					baseNode.parentNode.insertBefore(after, baseNode);
					baseNode = after;
				}
			}

			if (!baseNode.previousSibling) {
				if (dom.query.getNodeDepth(baseNode) === depth) next = false;
			} else {
				baseNode = baseNode.previousSibling;
			}
		}

		if (baseNode.nodeType === 1) suffixIndex = 0;
		let depthEl = baseNode;
		while (dom.query.getNodeDepth(depthEl) > depth) {
			index = dom.query.getPositionIndex(depthEl) + suffixIndex;
			depthEl = depthEl.parentNode;

			temp = newEl;
			newEl = depthEl.cloneNode(false);
			children = depthEl.childNodes;

			if (temp) {
				if (dom.check.isListCell(newEl) && dom.check.isList(temp) && temp.firstElementChild) {
					newEl.innerHTML = temp.firstElementChild.innerHTML;
					dom.utils.removeItem(temp.firstElementChild);
					if (temp.children.length > 0) newEl.appendChild(temp);
				} else {
					newEl.appendChild(temp);
				}
			}

			while (children[index]) {
				newEl.appendChild(children[index]);
			}
		}

		if (depthEl.nodeType === 1 && depthEl.childNodes.length <= 1 && !depthEl.firstChild?.textContent?.length) /** @type {HTMLElement} */ (depthEl).innerHTML = '<br>';

		const pElement = depthEl.parentNode;
		if (next) depthEl = depthEl.nextSibling;
		if (!newEl) return /** @type {T} */ (depthEl);

		this.mergeSameTags(newEl, null, false);
		this.mergeNestedTags(newEl, dom.check.isList);

		if (newEl.childNodes.length > 0) pElement.insertBefore(newEl, depthEl);
		else newEl = depthEl;

		if (dom.check.isListCell(newEl) && newEl.children && dom.check.isList(newEl.children[0])) {
			newEl.insertBefore(dom.utils.createElement('BR'), newEl.children[0]);
		}

		if (bp.childNodes.length === 0) dom.utils.removeItem(bp);

		return /** @type {T} */ (newEl);
	}

	/**
	 * @description Use with "npdePath (dom-query-GetNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
	 * - If "offset" has been changed, it will return as much "offset" as it has been modified.
	 * - An array containing change offsets is returned in the order of the "nodePathArray" array.
	 * @param {Node} element Element
	 * @param {?number[][]} [nodePathArray] Array of NodePath object ([dom-query-GetNodePath(), ..])
	 * @param {?boolean} [onlyText] If true, non-text nodes like 'span', 'strong'.. are ignored.
	 * @returns {Array<number>} [offset, ..]
	 * @example
	 * // Merge adjacent tags with same attributes
	 * const container = editor.selection.getNode().closest('div');
	 * editor.nodeTransform.mergeSameTags(container, null, false);
	 *
	 * // Merge with path tracking
	 * const startPath = [0, 1, 2];
	 * const endPath = [0, 2, 1];
	 * const offsets = editor.nodeTransform.mergeSameTags(element, [startPath, endPath], false);
	 *
	 * // Merge only text nodes
	 * editor.nodeTransform.mergeSameTags(paragraph, null, true);
	 */
	mergeSameTags(element, nodePathArray, onlyText) {
		const nodePathLen = nodePathArray ? nodePathArray.length : 0;
		let offsets = null;

		if (nodePathLen) {
			offsets = Array.apply(null, new Array(nodePathLen)).map(Number.prototype.valueOf, 0);
		}

		const recursionFunc = (current, depth, depthIndex) => {
			const children = current.childNodes;

			for (let i = 0, len = children.length, child, next; i < len; i++) {
				child = /** @type {HTMLElement} */ (children[i]);
				next = /** @type {HTMLElement} */ (children[i + 1]);
				if (!child) break;
				if (dom.check.isBreak(child) || dom.check.isMedia(child) || dom.check.isInputElement(child)) continue;
				if ((onlyText && this.#$.inline._isIgnoreNodeChange(child)) || (!onlyText && (dom.check.isTableElements(child) || dom.check.isListCell(child) || (this.#$.format.isLine(child) && !this.#$.format.isBrLine(child))))) {
					if (dom.check.isTableElements(child) || dom.check.isListCell(child)) {
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
								c = child;
								p = current;
								cDepth = depth;
								spliceDepth = true;
								while (cDepth >= 0) {
									if (dom.utils.getArrayIndex(p.childNodes, c) !== path[cDepth]) {
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
					dom.utils.copyTagAttributes(child, current);
					current.parentNode.insertBefore(child, current);
					dom.utils.removeItem(current);
				}

				if (!next) {
					if (child.nodeType === 1) recursionFunc(child, depth + 1, i);
					break;
				}

				if (child.nodeName === next.nodeName && dom.check.isSameAttributes(child, next) && child.getAttribute?.('href') === next.getAttribute?.('href')) {
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

						if (childLength > 0 && l.nodeType === 3 && r.nodeType === 3 && (l.textContent.length > 0 || r.textContent.length > 0)) childLength--;

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

					dom.utils.removeItem(next);
					i--;
				} else if (child.nodeType === 1) {
					recursionFunc(child, depth + 1, i);
				}
			}
		};

		recursionFunc(element, 0, 0);

		return offsets;
	}

	/**
	 * @description Remove nested tags without other child nodes.
	 * @param {Node} element Element object
	 * @param {?(((current: Node) => boolean)|string)} [validation] Validation function / String("tag1|tag2..") / If null, all tags are applicable.
	 */
	mergeNestedTags(element, validation) {
		if (typeof validation === 'string') {
			const tagRegExp = new RegExp(`^(${validation ? validation : '.+'})$`, 'i');
			validation = (current) => tagRegExp.test(current.nodeName);
		} else if (typeof validation !== 'function') {
			validation = () => true;
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
		})(/** @type {Element} */ (element));
	}

	/**
	 * @description Delete itself and all parent nodes that match the condition.
	 * - Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param {Node} item Node to be remove
	 * @param {?(current: Node) => boolean} [validation] Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param {?Node} [stopParent] Stop when the parent node reaches stopParent
	 * @returns {{sc: Node|null, ec: Node|null}|null} {sc: previousSibling, ec: nextSibling} (the deleted node reference) or null.
	 * @example
	 * // Remove empty parent elements recursively
	 * const emptySpan = document.querySelector('span:empty');
	 * const result = editor.nodeTransform.removeAllParents(emptySpan, null, null);
	 *
	 * // Remove with custom validation
	 * editor.nodeTransform.removeAllParents(node, (current) => {
	 *   return current.textContent.trim().length === 0;
	 * }, null);
	 *
	 * // Remove up to specific parent
	 * const stopAt = editor.selection.getNode().closest('.container');
	 * editor.nodeTransform.removeAllParents(childNode, null, stopAt);
	 */
	removeAllParents(item, validation, stopParent) {
		if (!item) return null;
		let cc = null;

		validation ||= (current) => {
			if (current === stopParent || this.#$.component.is(current)) return false;
			const text = current.textContent.trim();
			return text.length === 0 || /^(\n|\u200B)+$/.test(text);
		};

		(function recursionFunc(element) {
			if (!dom.check.isWysiwygFrame(element)) {
				const parent = element.parentNode;
				if (parent && validation(element)) {
					cc = {
						sc: element.previousElementSibling,
						ec: element.nextElementSibling,
					};
					dom.utils.removeItem(element);
					recursionFunc(/** @type {Element} */ (parent));
				}
			}
		})(/** @type {Element} */ (item));

		return cc;
	}

	/**
	 * @description Delete a empty child node of argument element
	 * @param {Node} element Element node
	 * @param {?Node} notRemoveNode Do not remove node
	 * @param {boolean} forceDelete When all child nodes are deleted, the parent node is also deleted.
	 */
	removeEmptyNode(element, notRemoveNode, forceDelete) {
		const allowedEmptyTags = this.#options.get('allowedEmptyTags');

		notRemoveNode &&= dom.query.getParentElement(notRemoveNode, (current) => element === current.parentElement);

		const recursionFunc = (current) => {
			if (this.#$.format._isNotTextNode(current) || current === notRemoveNode || dom.check.isNonEditable(current)) return 0;
			if (current !== element && dom.check.isZeroWidth(current.textContent) && (!current.firstChild || !dom.check.isBreak(current.firstChild)) && !current.querySelector(allowedEmptyTags)) {
				if (current.parentNode) {
					current.parentNode.removeChild(current);
					return -1;
				}
			} else {
				const children = current.children;
				for (let i = 0, len = children.length, r = 0; i < len; i++) {
					if (!children[i + r] || this.#$.component.is(children[i + r])) continue;
					r += recursionFunc(children[i + r]);
				}
			}

			return 0;
		};
		recursionFunc(/** @type {Element} */ (element));

		if (element.childNodes.length === 0) {
			if (forceDelete) {
				dom.utils.removeItem(element);
			} else {
				/** @type {HTMLElement} */ (element).innerHTML = '<br>';
			}
		}
	}

	/**
	 * @description Creates a nested node structure from the given array of nodes.
	 * @param {SunEditor.NodeCollection} nodeArray An array of nodes to clone. The first node in the array will be the top-level parent.
	 * @param {?(current: Node) => boolean} [validate] A validate function.
	 * @returns {{ parent: Node, inner: Node }} An object containing the top-level parent node and the innermost child node.
	 */
	createNestedNode(nodeArray, validate) {
		if (typeof validate !== 'function') validate = () => true;

		const el = /** @type {HTMLElement} */ (nodeArray[0].cloneNode(false));
		let n = el;
		for (let i = 1, len = nodeArray.length, t; i < len; i++) {
			if (!validate(nodeArray[i])) continue;
			t = /** @type {HTMLElement} */ (nodeArray[i].cloneNode(false));
			n.appendChild(t);
			n = t;
		}

		n.innerHTML = '';

		return {
			parent: el,
			inner: n,
		};
	}
}

export default NodeTransform;
