/**
 * @description Get the argument iframe's document object
 * @param {Element} iframe Iframe element (context.element.wysiwygFrame)
 * @returns {Document}
 */
export function getIframeDocument(iframe) {
	let wDocument = iframe.contentWindow || iframe.contentDocument;
	if (wDocument.document) wDocument = wDocument.document;
	return wDocument;
}

/**
 * @description Get attributes of argument element to string ('class="---" name="---" ')
 * @param {Element} element Element object
 * @param {Array|null} exceptAttrs Array of attribute names to exclude from the result
 * @returns {String}
 */
export function getAttributesToString(element, exceptAttrs) {
	if (!element.attributes) return "";

	const attrs = element.attributes;
	let attrString = "";

	for (let i = 0, len = attrs.length; i < len; i++) {
		if (exceptAttrs && exceptAttrs.indexOf(attrs[i].name) > -1) continue;
		attrString += attrs[i].name + '="' + attrs[i].value + '" ';
	}

	return attrString;
}

/**
 * @description It is judged whether it is the edit region top div element or iframe's body tag.
 * @param {Node} element The node to check
 * @returns {Boolean}
 */
export function isWysiwygDiv(element) {
	return (
		element &&
		element.nodeType === 1 &&
		(this.hasClass(element, "se-wrapper-wysiwyg") || /^BODY$/i.test(element.nodeName))
	);
}

/**
 * @description It is judged whether it is the contenteditable property is false.
 * @param {Node} element The node to check
 * @returns {Boolean}
 */
export function isNonEditable(element) {
	return element && element.nodeType === 1 && element.getAttribute("contenteditable") === "false";
}

/**
 * @description It is judged whether it is a node related to the text style.
 * (strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code)
 * @param {Node} element The node to check
 * @returns {Boolean}
 */
export function isTextStyleElement(element) {
	return (
		element &&
		element.nodeType !== 3 &&
		/^(strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code)$/i.test(element.nodeName)
	);
}

/**
 * @description It is judged whether it is the not checking node. (class="katex", "__se__tag")
 * @param {Node} element The node to check
 * @returns {Boolean}
 */
export function isNotCheckingNode(element) {
	return element && /katex|__se__tag/.test(element.className);
}

/**
 * @description Returns the index compared to other sibling nodes.
 * @param {Node} node The Node to find index
 * @returns {Number}
 */
export function getPositionIndex(node) {
	let idx = 0;
	while ((node = node.previousSibling)) {
		idx += 1;
	}
	return idx;
}

/**
 * @description Returns the position of the "node" in the "parentNode" in a numerical array.
 * ex) <p><span>aa</span><span>bb</span></p> : getNodePath(node: "bb", parentNode: "<P>") -> [1, 0]
 * @param {Node} node The Node to find position path
 * @param {Node|null} parentNode Parent node. If null, wysiwyg div area
 * @param {Object|null} _newOffsets If you send an object of the form "{s: 0, e: 0}", the text nodes that are attached together are merged into one, centered on the "node" argument.
 * "_newOffsets.s" stores the length of the combined characters after "node" and "_newOffsets.e" stores the length of the combined characters before "node".
 * Do not use unless absolutely necessary.
 * @returns {Array}
 */
export function getNodePath(node, parentNode, _newOffsets) {
	const path = [];
	let finds = true;

	this.getParentElement(
		node,
		function(el) {
			if (el === parentNode) finds = false;
			if (finds && !this.isWysiwygDiv(el)) {
				// merge text nodes
				if (_newOffsets && el.nodeType === 3) {
					let temp = null,
						tempText = null;
					_newOffsets.s = _newOffsets.e = 0;

					let previous = el.previousSibling;
					while (previous && previous.nodeType === 3) {
						tempText = previous.textContent.replace(this.zeroWidthRegExp, "");
						_newOffsets.s += tempText.length;
						el.textContent = tempText + el.textContent;
						temp = previous;
						previous = previous.previousSibling;
						this.removeItem(temp);
					}

					let next = el.nextSibling;
					while (next && next.nodeType === 3) {
						tempText = next.textContent.replace(this.zeroWidthRegExp, "");
						_newOffsets.e += tempText.length;
						el.textContent += tempText;
						temp = next;
						next = next.nextSibling;
						this.removeItem(temp);
					}
				}

				// index push
				path.push(el);
			}
			return false;
		}.bind(this)
	);

	return path.map(this.getPositionIndex).reverse();
}

/**
 * @description Returns the node in the location of the path array obtained from "util.getNodePath".
 * @param {Array} offsets Position array, array obtained from "util.getNodePath"
 * @param {Node} parentNode Base parent element
 * @returns {Node}
 */
export function getNodeFromPath(offsets, parentNode) {
	let current = parentNode;
	let nodes;

	for (let i = 0, len = offsets.length; i < len; i++) {
		nodes = current.childNodes;
		if (nodes.length === 0) break;
		if (nodes.length <= offsets[i]) {
			current = nodes[nodes.length - 1];
		} else {
			current = nodes[offsets[i]];
		}
	}

	return current;
}

/**
 * @description Compares the style and class for equal values.
 * Returns true if both are text nodes.
 * @param {Node} a Node to compare
 * @param {Node} b Node to compare
 * @returns {Boolean}
 */
export function isSameAttributes(a, b) {
	if (a.nodeType === 3 && b.nodeType === 3) return true;
	if (a.nodeType === 3 || b.nodeType === 3) return false;

	const style_a = a.style;
	const style_b = b.style;
	let compStyle = 0;

	for (let i = 0, len = style_a.length; i < len; i++) {
		if (style_a[style_a[i]] === style_b[style_a[i]]) compStyle++;
	}

	const class_a = a.classList;
	const class_b = b.classList;
	const reg = this._w.RegExp;
	let compClass = 0;

	for (let i = 0, len = class_a.length; i < len; i++) {
		if (reg("(s|^)" + class_a[i] + "(s|$)").test(class_b.value)) compClass++;
	}

	return (
		compStyle === style_b.length &&
		compStyle === style_a.length &&
		(compClass === class_b.length && compClass === class_a.length)
	);
}

/**
 * @description Check the node is a list (ol, ul)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isList(node) {
	return node && /^(OL|UL)$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Check the node is a list cell (li)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isListCell(node) {
	return node && /^LI$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Check the node is a table (table, thead, tbody, tr, th, td)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isTable(node) {
	return node && /^(TABLE|THEAD|TBODY|TR|TH|TD)$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Check the node is a table cell (td, th)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isCell(node) {
	return node && /^(TD|TH)$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Check the node is a break node (BR)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isBreak(node) {
	return node && /^BR$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Check the node is a anchor node (A)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isAnchor(node) {
	return node && /^A$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Check the node is a media node (img, iframe, audio, video, canvas)
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isMedia(node) {
	return node && /^(IMG|IFRAME|AUDIO|VIDEO|CANVAS)$/i.test(typeof node === "string" ? node : node.nodeName);
}

/**
 * @description Get all "children" of the argument value element (Without text nodes)
 * @param {Element} element element to get child node
 * @param {Function|null} validation Conditional function
 * @returns {Array}
 */
export function getListChildren(element, validation) {
	const children = [];
	if (!element || !element.children || element.children.length === 0) return children;

	validation =
		validation ||
		function() {
			return true;
		};

	(function recursionFunc(current) {
		if (element !== current && validation(current)) {
			children.push(current);
		}

		if (!!current.children) {
			for (let i = 0, len = current.children.length; i < len; i++) {
				recursionFunc(current.children[i]);
			}
		}
	})(element);

	return children;
}

/**
 * @description Get all "childNodes" of the argument value element (Include text nodes)
 * @param {Node} element element to get child node
 * @param {Function|null} validation Conditional function
 * @returns {Array}
 */
export function getListChildNodes(element, validation) {
	const children = [];
	if (!element || element.childNodes.length === 0) return children;

	validation =
		validation ||
		function() {
			return true;
		};

	(function recursionFunc(current) {
		if (element !== current && validation(current)) {
			children.push(current);
		}

		for (let i = 0, len = current.childNodes.length; i < len; i++) {
			recursionFunc(current.childNodes[i]);
		}
	})(element);

	return children;
}

/**
 * @description Returns the number of parents nodes.
 * "0" when the parent node is the WYSIWYG area.
 * "-1" when the element argument is the WYSIWYG area.
 * @param {Node} element The element to check
 * @returns {Number}
 */
export function getElementDepth(element) {
	if (!element || this.isWysiwygDiv(element)) return -1;

	let depth = 0;
	element = element.parentNode;

	while (element && !this.isWysiwygDiv(element)) {
		depth += 1;
		element = element.parentNode;
	}

	return depth;
}

/**
 * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
 * @param {Node} a Node to compare.
 * @param {Node} b Node to compare.
 * @returns {Object} { ancesstor, a, b, result: (a > b ? 1 : a < b ? -1 : 0) };
 */
export function compareElements(a, b) {
	let aNode = a,
		bNode = b;
	while (aNode && bNode && aNode.parentNode !== bNode.parentNode) {
		aNode = aNode.parentNode;
		bNode = bNode.parentNode;
	}

	if (!aNode || !bNode) return { ancestor: null, a: a, b: b, result: 0 };

	const children = aNode.parentNode.childNodes;
	const aIndex = this.getArrayIndex(children, aNode);
	const bIndex = this.getArrayIndex(children, bNode);

	return {
		ancestor: aNode.parentNode,
		a: aNode,
		b: bNode,
		result: aIndex > bIndex ? 1 : aIndex < bIndex ? -1 : 0
	};
}

/**
 * @description Get the parent element of the argument value.
 * A tag that satisfies the query condition is imported.
 * Returns null if not found.
 * @param {Node} element Reference element
 * @param {String|Function} query Query String (nodeName, .className, #ID, :name) or validation function.
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @returns {Element|null}
 */
export function getParentElement(element, query) {
	let check;

	if (typeof query === "function") {
		check = query;
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = "className";
			query = query.split(".")[1];
		} else if (/^#/.test(query)) {
			attr = "id";
			query = "^" + query.split("#")[1] + "$";
		} else if (/^:/.test(query)) {
			attr = "name";
			query = "^" + query.split(":")[1] + "$";
		} else {
			attr = "nodeName";
			query = "^" + query + "$";
		}

		const regExp = new this._w.RegExp(query, "i");
		check = function(el) {
			return regExp.test(el[attr]);
		};
	}

	while (element && !check(element)) {
		if (this.isWysiwygDiv(element)) {
			return null;
		}
		element = element.parentNode;
	}

	return element;
}

/**
 * @description Get the child element of the argument value.
 * A tag that satisfies the query condition is imported.
 * Returns null if not found.
 * @param {Node} element Reference element
 * @param {String|Function} query Query String (nodeName, .className, #ID, :name) or validation function.
 * @param {Boolean} last If true returns the last node among the found child nodes. (default: first node)
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @returns {Element|null}
 */
export function getChildElement(element, query, last) {
	let check;

	if (typeof query === "function") {
		check = query;
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = "className";
			query = query.split(".")[1];
		} else if (/^#/.test(query)) {
			attr = "id";
			query = "^" + query.split("#")[1] + "$";
		} else if (/^:/.test(query)) {
			attr = "name";
			query = "^" + query.split(":")[1] + "$";
		} else {
			attr = "nodeName";
			query = "^" + (query === "text" ? "#" + query : query) + "$";
		}

		const regExp = new this._w.RegExp(query, "i");
		check = function(el) {
			return regExp.test(el[attr]);
		};
	}

	const childList = this.getListChildNodes(element, function(current) {
		return check(current);
	});

	return childList[last ? childList.length - 1 : 0];
}

/**
 * @description 1. The first node of all the child nodes of the "first" element is returned.
 * 2. The last node of all the child nodes of the "last" element is returned.
 * 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
 * { sc: "first", ec: "last" }
 * @param {Node} first First element
 * @param {Node|null} last Last element
 * @returns {Object}
 */
export function getEdgeChildNodes(first, last) {
	if (!first) return;
	if (!last) last = first;

	while (first && first.nodeType === 1 && first.childNodes.length > 0 && !this.isBreak(first))
		first = first.firstChild;
	while (last && last.nodeType === 1 && last.childNodes.length > 0 && !this.isBreak(last)) last = last.lastChild;

	return {
		sc: first,
		ec: last || first
	};
}

/**
 * @description Replace element
 * @param {Element} element Target element
 * @param {String|Element} newElement String or element of the new element to apply
 */
export function changeElement(element, newElement) {
	if (typeof newElement === "string") {
		if (element.outerHTML) {
			element.outerHTML = newElement;
		} else {
			const doc = this.createElement("DIV");
			doc.innerHTML = newElement;
			newElement = doc.firstChild;
			element.parentNode.replaceChild(newElement, element);
		}
	} else if (newElement.nodeType === 1) {
		element.parentNode.replaceChild(newElement, element);
	}
}

/**
 * @description Set the text content value of the argument value element
 * @param {Node} element Element to replace text content
 * @param {String} txt Text to be applied
 */
export function changeTxt(element, txt) {
	if (!element || !txt) return;
	element.textContent = txt;
}

/**
 * @description Set style, if all styles are deleted, the style properties are deleted.
 * @param {Element} element Element to set style
 * @param {String} styleName Style attribute name (marginLeft, textAlign...)
 * @param {String|Number} value Style value
 */
export function setStyle(element, styleName, value) {
	element.style[styleName] = value;

	if (!value && !element.style.cssText) {
		element.removeAttribute("style");
	}
}

/**
 * @description Determine whether any of the matched elements are assigned the given class
 * @param {Element} element Elements to search class name
 * @param {String} className Class name to search for
 * @returns {Boolean}
 */
export function hasClass(element, className) {
	if (!element) return;

	return new this._w.RegExp(className).test(element.className);
}

/**
 * @description Append the className value of the argument value element
 * @param {Element} element Elements to add class name
 * @param {String} className Class name to be add
 */
export function addClass(element, className) {
	if (!element) return;

	const check = new this._w.RegExp("(\\s|^)" + className + "(\\s|$)");
	if (check.test(element.className)) return;

	element.className += (element.className.length > 0 ? " " : "") + className;
}

/**
 * @description Delete the className value of the argument value element
 * @param {Element} element Elements to remove class name
 * @param {String} className Class name to be remove
 */
export function removeClass(element, className) {
	if (!element) return;

	const check = new this._w.RegExp("(\\s|^)" + className + "(\\s|$)");
	element.className = element.className.replace(check, " ").trim();

	if (!element.className.trim()) element.removeAttribute("class");
}

/**
 * @description Argument value If there is no class name, insert it and delete the class name if it exists
 * @param {Element} element Elements to replace class name
 * @param {String} className Class name to be change
 * @returns {Boolean|undefined}
 */
export function toggleClass(element, className) {
	if (!element) return;
	let result = false;

	const check = new this._w.RegExp("(\\s|^)" + className + "(\\s|$)");
	if (check.test(element.className)) {
		element.className = element.className.replace(check, " ").trim();
	} else {
		element.className += " " + className;
		result = true;
	}

	if (!element.className.trim()) element.removeAttribute("class");

	return result;
}

/**
 * @description Delete argumenu value element
 * @param {Node} item Node to be remove
 */
export function removeItem(item) {
	if (!item) return;
	try {
		item.remove();
	} catch (e) {
		if (item.parentNode) item.parentNode.removeChild(item);
	}
}

/**
 * @description Delete all parent nodes that match the condition.
 * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
 * @param {Node} item Node to be remove
 * @param {Function|null} validation Validation function. default(Deleted if it only have breakLine and blanks)
 * @param {Element|null} stopParent Stop when the parent node reaches stopParent
 * @returns {Object|null} {sc: previousSibling, ec: nextSibling}
 */
export function removeItemAllParents(item, validation, stopParent) {
	if (!item) return null;
	let cc = null;
	if (!validation) {
		validation = function(current) {
			if (current === stopParent || this.isComponent(current)) return false;
			const text = current.textContent.trim();
			return text.length === 0 || /^(\n|\u200B)+$/.test(text);
		}.bind(this);
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
}

/**
 * @description Split all tags based on "baseNode"
 * Returns the last element of the splited tag.
 * @param {Node} baseNode Element or text node on which to base
 * @param {Number|null} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
 * @param {Number} depth The nesting depth of the element being split. (default: 0)
 * @returns {Element}
 */
export function splitElement(baseNode, offset, depth) {
	const bp = baseNode.parentNode;
	let index = 0,
		newEl,
		children,
		temp;
	let next = true;
	if (!depth || depth < 0) depth = 0;

	if (baseNode.nodeType === 3) {
		index = this.getPositionIndex(baseNode);
		if (offset >= 0) {
			baseNode.splitText(offset);
			const after = this.getNodeFromPath([index + 1], bp);
			if (this.onlyZeroWidthSpace(after)) after.data = this.zeroWidthSpace;
		}
	} else if (baseNode.nodeType === 1) {
		if (!baseNode.previousSibling) {
			if (this.getElementDepth(baseNode) === depth) next = false;
		} else {
			baseNode = baseNode.previousSibling;
		}
	}

	let depthEl = baseNode;
	while (this.getElementDepth(depthEl) > depth) {
		index = this.getPositionIndex(depthEl) + 1;
		depthEl = depthEl.parentNode;

		temp = newEl;
		newEl = depthEl.cloneNode(false);
		children = depthEl.childNodes;

		if (temp) {
			if (this.isListCell(newEl) && this.isList(temp) && temp.firstElementChild) {
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
	this.mergeNestedTags(
		newEl,
		function(current) {
			return this.isList(current);
		}.bind(this)
	);

	if (newEl.childNodes.length > 0) pElement.insertBefore(newEl, depthEl);
	else newEl = depthEl;

	if (bp.childNodes.length === 0) this.removeItem(bp);

	return newEl;
}

/**
 * @description Use with "npdePath (util.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
 * If "offset" has been changed, it will return as much "offset" as it has been modified.
 * An array containing change offsets is returned in the order of the "nodePathArray" array.
 * @param {Element} element Element
 * @param {Array|null} nodePathArray Array of NodePath object ([util.getNodePath(), ..])
 * @param {Boolean} onlyText If true, non-text nodes(!util._isIgnoreNodeChange) like 'span', 'strong'.. are ignored.
 * @returns {Array} [offset, ..]
 */
export function mergeSameTags(element, nodePathArray, onlyText) {
	const inst = this;
	const nodePathLen = nodePathArray ? nodePathArray.length : 0;
	let offsets = null;

	if (nodePathLen) {
		offsets = this._w.Array.apply(null, new this._w.Array(nodePathLen)).map(this._w.Number.prototype.valueOf, 0);
	}

	(function recursionFunc(current, depth, depthIndex) {
		const children = current.childNodes;

		for (let i = 0, len = children.length, child, next; i < len; i++) {
			child = children[i];
			next = children[i + 1];
			if (!child) break;
			if (
				(onlyText && inst._isIgnoreNodeChange(child)) ||
				(!onlyText &&
					(inst.isTable(child) ||
						inst.isListCell(child) ||
						(inst.isFormatElement(child) && !inst.isFreeFormatElement(child))))
			) {
				if (inst.isTable(child) || inst.isListCell(child)) {
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
								if (inst.getArrayIndex(p.childNodes, c) !== path[cDepth]) {
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
				inst.copyTagAttributes(child, current);
				current.parentNode.insertBefore(child, current);
				inst.removeItem(current);
			}
			if (!next) {
				if (child.nodeType === 1) recursionFunc(child, depth + 1, i);
				break;
			}

			if (child.nodeName === next.nodeName && inst.isSameAttributes(child, next) && child.href === next.href) {
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

				inst.removeItem(next);
				i--;
			} else if (child.nodeType === 1) {
				recursionFunc(child, depth + 1, i);
			}
		}
	})(element, 0, 0);

	return offsets;
}

/**
 * @description Remove nested tags without other child nodes.
 * @param {Element} element Element object
 * @param {Function|String|null} validation Validation function / String("tag1|tag2..") / If null, all tags are applicable.
 */
export function mergeNestedTags(element, validation) {
	if (typeof validation === "string") {
		validation = function(current) {
			return this.test(current.tagName);
		}.bind(new this._w.RegExp("^(" + (validation ? validation : ".+") + ")$", "i"));
	} else if (typeof validation !== "function") {
		validation = function() {
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
}

/**
 * @description Delete a empty child node of argument element
 * @param {Element} element Element node
 * @param {Node|null} notRemoveNode Do not remove node
 */
export function removeEmptyNode(element, notRemoveNode) {
	const inst = this;

	if (notRemoveNode) {
		notRemoveNode = inst.getParentElement(notRemoveNode, function(current) {
			return element === current.parentElement;
		});
	}

	(function recursionFunc(current) {
		if (inst._notTextNode(current) || current === notRemoveNode || inst.isNonEditable(current)) return 0;
		if (
			current !== element &&
			inst.onlyZeroWidthSpace(current.textContent) &&
			(!current.firstChild || !inst.isBreak(current.firstChild))
		) {
			if (current.parentNode) {
				current.parentNode.removeChild(current);
				return -1;
			}
		} else {
			const children = current.children;
			for (let i = 0, len = children.length, r = 0; i < len; i++) {
				if (!children[i + r] || inst.isComponent(children[i + r])) continue;
				r += recursionFunc(children[i + r]);
			}
		}

		return 0;
	})(element);

	if (element.childNodes.length === 0) element.innerHTML = "<br>";
}
