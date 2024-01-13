/**
 * @fileoverview Node util class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, unicode, env, numbers } from '../../helper';

const NodeTransform = function (editor) {
	CoreInjector.call(this, editor);
};

NodeTransform.prototype = {
	/**
	 * @description Split all tags based on "baseNode"
	 * Returns the last element of the splited tag.
	 * @param {Node} baseNode Element or text node on which to base
	 * @param {Number|Node|null} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
	 * @param {number} depth The nesting depth of the element being split. (default: 0)
	 * @returns {Element}
	 */
	split(baseNode, offset, depth) {
		if (domUtils.isWysiwygFrame(baseNode)) return baseNode;

		if (offset && !numbers.is(offset)) {
			const children = baseNode.childNodes;
			let index = domUtils.getPositionIndex(offset);
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
			if (next.childNodes.length > 0) baseNode.parentNode.insertBefore(next, baseNode.nextElementSibling);

			return baseNode;
		}

		const bp = baseNode.parentNode;
		let index = 0;
		let suffixIndex = 1;
		let next = true;
		let newEl, children, temp;
		if (!depth || depth < 0) depth = 0;

		if (baseNode.nodeType === 3) {
			index = domUtils.getPositionIndex(baseNode);
			if (offset >= 0 && baseNode.length !== offset) {
				baseNode.splitText(offset);
				const after = domUtils.getNodeFromPath([index + 1], bp);
				if (domUtils.isZeroWith(after)) after.data = unicode.zeroWidthSpace;
			}
		} else if (baseNode.nodeType === 1) {
			if (offset === 0) {
				while (baseNode.firstChild) {
					baseNode = baseNode.firstChild;
				}
				if (baseNode.nodeType === 3) {
					const after = domUtils.createTextNode(unicode.zeroWidthSpace);
					baseNode.parentNode.insertBefore(after, baseNode);
					baseNode = after;
				}
			}

			if (!baseNode.previousSibling) {
				if (domUtils.getNodeDepth(baseNode) === depth) next = false;
			} else {
				baseNode = baseNode.previousSibling;
			}
		}

		if (baseNode.nodeType === 1) suffixIndex = 0;
		let depthEl = baseNode;
		while (domUtils.getNodeDepth(depthEl) > depth) {
			index = domUtils.getPositionIndex(depthEl) + suffixIndex;
			depthEl = depthEl.parentNode;

			temp = newEl;
			newEl = depthEl.cloneNode(false);
			children = depthEl.childNodes;

			if (temp) {
				if (domUtils.isListCell(newEl) && domUtils.isList(temp) && temp.firstElementChild) {
					newEl.innerHTML = temp.firstElementChild.innerHTML;
					domUtils.removeItem(temp.firstElementChild);
					if (temp.children.length > 0) newEl.appendChild(temp);
				} else {
					newEl.appendChild(temp);
				}
			}

			while (children[index]) {
				newEl.appendChild(children[index]);
			}
		}

		if (depthEl.childNodes.length <= 1 && (!depthEl.firstChild || depthEl.firstChild.textContent.length === 0)) depthEl.innerHTML = '<br>';

		const pElement = depthEl.parentNode;
		if (next) depthEl = depthEl.nextSibling;
		if (!newEl) return depthEl;

		this.mergeSameTags(newEl, null, false);
		this.mergeNestedTags(newEl, domUtils.isList);

		if (newEl.childNodes.length > 0) pElement.insertBefore(newEl, depthEl);
		else newEl = depthEl;

		if (domUtils.isListCell(newEl) && newEl.children && domUtils.isList(newEl.children[0])) {
			newEl.insertBefore(domUtils.createElement('BR'), newEl.children[0]);
		}

		if (bp.childNodes.length === 0) domUtils.removeItem(bp);

		return newEl;
	},

	/**
	 * @description Use with "npdePath (domUtils.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
	 * If "offset" has been changed, it will return as much "offset" as it has been modified.
	 * An array containing change offsets is returned in the order of the "nodePathArray" array.
	 * @param {Element} element Element
	 * @param {Array|null} nodePathArray Array of NodePath object ([domUtils.getNodePath(), ..])
	 * @param {boolean} onlyText If true, non-text nodes like 'span', 'strong'.. are ignored.
	 * @returns {Array} [offset, ..]
	 */
	mergeSameTags(element, nodePathArray, onlyText) {
		const inst = this;
		const nodePathLen = nodePathArray ? nodePathArray.length : 0;
		let offsets = null;

		if (nodePathLen) {
			offsets = Array.apply(null, new Array(nodePathLen)).map(Number.prototype.valueOf, 0);
		}

		(function recursionFunc(current, depth, depthIndex) {
			const children = current.childNodes;

			for (let i = 0, len = children.length, child, next; i < len; i++) {
				child = children[i];
				next = children[i + 1];
				if (!child) break;
				if ((onlyText && inst.format._isIgnoreNodeChange(child)) || (!onlyText && (domUtils.isTableElements(child) || domUtils.isListCell(child) || (inst.format.isLine(child) && !inst.format.isBrLine(child))))) {
					if (domUtils.isTableElements(child) || domUtils.isListCell(child)) {
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
									if (domUtils.getArrayIndex(p.childNodes, c) !== path[cDepth]) {
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
					domUtils.copyTagAttributes(child, current);
					current.parentNode.insertBefore(child, current);
					domUtils.removeItem(current);
				}
				if (!next) {
					if (child.nodeType === 1) recursionFunc(child, depth + 1, i);
					break;
				}

				if (child.nodeName === next.nodeName && domUtils.isSameAttributes(child, next) && child.href === next.href) {
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

					domUtils.removeItem(next);
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
	mergeNestedTags(element, validation) {
		if (typeof validation === 'string') {
			validation = function (current) {
				return this.test(current.tagName);
			}.bind(new RegExp(`^(${validation ? validation : '.+'})$`, 'i'));
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
		})(element);
	},

	/**
	 * @description Delete itself and all parent nodes that match the condition.
	 * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
	 * @param {Node} item Node to be remove
	 * @param {Function|null} validation Validation function. default(Deleted if it only have breakLine and blanks)
	 * @param {Element|null} stopParent Stop when the parent node reaches stopParent
	 * @returns {Object|null} {sc: previousSibling, ec: nextSibling}
	 */
	removeAllParents(item, validation, stopParent) {
		if (!item) return null;
		let cc = null;
		if (!validation) {
			validation = (current) => {
				if (current === stopParent || this.component.is(current)) return false;
				const text = current.textContent.trim();
				return text.length === 0 || /^(\n|\u200B)+$/.test(text);
			};
		}

		(function recursionFunc(element) {
			if (!domUtils.isWysiwygFrame(element)) {
				const parent = element.parentNode;
				if (parent && validation(element)) {
					cc = {
						sc: element.previousElementSibling,
						ec: element.nextElementSibling
					};
					domUtils.removeItem(element);
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
	 * @param {boolean} forceDelete When all child nodes are deleted, the parent node is also deleted.
	 */
	removeEmptyNode(element, notRemoveNode, forceDelete) {
		const inst = this;

		if (notRemoveNode) {
			notRemoveNode = domUtils.getParentElement(notRemoveNode, function (current) {
				return element === current.parentElement;
			});
		}

		(function recursionFunc(current) {
			if (inst.format._notTextNode(current) || current === notRemoveNode || domUtils.isNonEditable(current)) return 0;
			if (current !== element && domUtils.isZeroWith(current.textContent) && (!current.firstChild || !domUtils.isBreak(current.firstChild)) && !current.querySelector(env._allowedEmptyNodeList)) {
				if (current.parentNode) {
					current.parentNode.removeChild(current);
					return -1;
				}
			} else {
				const children = current.children;
				for (let i = 0, len = children.length, r = 0; i < len; i++) {
					if (!children[i + r] || inst.component.is(children[i + r])) continue;
					r += recursionFunc(children[i + r]);
				}
			}

			return 0;
		})(element);

		if (element.childNodes.length === 0) {
			if (forceDelete) {
				domUtils.removeItem(element);
			} else {
				element.innerHTML = '<br>';
			}
		}
	},

	constructor: NodeTransform
};

export default NodeTransform;
