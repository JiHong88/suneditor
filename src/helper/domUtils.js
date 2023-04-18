import { _d, _w } from './env';
import { onlyZeroWidthRegExp, zeroWidthRegExp } from './unicode';

/**
 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (unicode.zeroWidthSpace)
 * @param {string|Node} text String value or Node
 * @returns {boolean}
 */
export function isZeroWith(text) {
	if (text === null || text === undefined) return false;
	if (typeof text !== 'string') text = text.textContent;
	return text === '' || onlyZeroWidthRegExp.test(text);
}

/**
 * @description Create Element node
 * @param {string} elementName Element name
 * @param {Object.<string, string>|null|undefined} attributes The attributes of the tag. {style: 'font-size:12px;..', class: 'el_class',..}
 * @param {string|Node|null|undefined} inner A innerHTML string or inner node.
 * @returns {Element}
 */
export function createElement(elementName, attributes, inner) {
	const el = _d.createElement(elementName);

	if (attributes) {
		for (let key in attributes) {
			if (attributes[key] !== undefined && attributes[key] !== null) el.setAttribute(key, attributes[key]);
		}
	}

	if (inner) {
		if (typeof inner === 'string') {
			el.innerHTML = inner;
		} else if (typeof inner === 'object') {
			el.appendChild(inner);
		}
	}

	return el;
}

/**
 * @description Create text node
 * @param {string} text text content
 * @returns {Text}
 */
export function createTextNode(text) {
	return _d.createTextNode(text || '');
}

/**
 * @description Get the argument iframe's document object if use the "iframe" or "fullPage" options
 * @param {Element} iframe Iframe element (this.editor.frameContext.get('wysiwygFrame'))
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
 * @param {Array.<string>|null} exceptAttrs Array of attribute names to exclude from the result
 * @returns {string}
 */
export function getAttributesToString(element, exceptAttrs) {
	if (!element.attributes) return '';

	const attrs = element.attributes;
	let attrString = '';

	for (let i = 0, len = attrs.length; i < len; i++) {
		if (exceptAttrs && exceptAttrs.indexOf(attrs[i].name) > -1) continue;
		attrString += attrs[i].name + '="' + attrs[i].value + '" ';
	}

	return attrString;
}

/**
 * @description Returns the index compared to other sibling nodes.
 * @param {Node} node The Node to find index
 * @returns {number}
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
 * @param {{s: number, e: number}|null} _newOffsets If you send an object of the form "{s: 0, e: 0}", the text nodes that are attached together are merged into one, centered on the "node" argument.
 * "_newOffsets.s" stores the length of the combined characters after "node" and "_newOffsets.e" stores the length of the combined characters before "node".
 * Do not use unless absolutely necessary.
 * @returns {Array.<number>}
 */
export function getNodePath(node, parentNode, _newOffsets) {
	const path = [];
	let finds = true;

	getParentElement(
		node,
		function (el) {
			if (el === parentNode) finds = false;
			if (finds && !isWysiwygFrame(el)) {
				// merge text nodes
				if (_newOffsets && el.nodeType === 3) {
					let temp = null,
						tempText = null;
					_newOffsets.s = _newOffsets.e = 0;

					let previous = el.previousSibling;
					while (previous && previous.nodeType === 3) {
						tempText = previous.textContent.replace(zeroWidthRegExp, '');
						_newOffsets.s += tempText.length;
						el.textContent = tempText + el.textContent;
						temp = previous;
						previous = previous.previousSibling;
						removeItem(temp);
					}

					let next = el.nextSibling;
					while (next && next.nodeType === 3) {
						tempText = next.textContent.replace(zeroWidthRegExp, '');
						_newOffsets.e += tempText.length;
						el.textContent += tempText;
						temp = next;
						next = next.nextSibling;
						removeItem(temp);
					}
				}

				// index push
				path.push(el);
			}
			return false;
		}.bind(this)
	);

	return path.map(getPositionIndex).reverse();
}

/**
 * @description Returns the node in the location of the path array obtained from "helper.dom.getNodePath".
 * @param {Array.<number>} offsets Position array, array obtained from "helper.dom.getNodePath"
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
 * @description Get all "children" of the argument value element (Without text nodes)
 * @param {Element} element element to get child node
 * @param {Function|null} validation Conditional function
 * @returns {Array.<Element>}
 */
export function getListChildren(element, validation) {
	const children = [];
	if (!element || !element.children || element.children.length === 0) return children;

	validation =
		validation ||
		function () {
			return true;
		};

	(function recursionFunc(current) {
		if (element !== current && validation(current)) {
			children.push(current);
		}

		if (current.children) {
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
 * @returns {Array.<Node>}
 */
export function getListChildNodes(element, validation) {
	const children = [];
	if (!element || element.childNodes.length === 0) return children;

	validation =
		validation ||
		function () {
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
 * '-1' when the element argument is the WYSIWYG area.
 * @param {Node} node The element to check
 * @returns {number}
 */
export function getNodeDepth(node) {
	if (!node || isWysiwygFrame(node)) return -1;

	let depth = 0;
	node = node.parentNode;

	while (node && !isWysiwygFrame(node)) {
		depth += 1;
		node = node.parentNode;
	}

	return depth;
}

/**
 * @description Sort a node array by depth of element.
 * @param {Array.<Node>} array Node array
 * @param {boolean} des true: descending order / false: ascending order
 */
export function sortNodeByDepth(array, des) {
	const t = !des ? -1 : 1;
	const f = t * -1;

	array.sort(function (a, b) {
		if (!isListCell(a) || !isListCell(b)) return 0;
		a = getNodeDepth(a);
		b = getNodeDepth(b);
		return a > b ? t : a < b ? f : 0;
	});
}

/**
 * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
 * @param {Node} a Node to compare.
 * @param {Node} b Node to compare.
 * @returns {{ancesstor: Node, a: Node, b: Node, ressult: number}} { ancesstor, a, b, result: (a > b ? 1 : a < b ? -1 : 0) };
 */
export function compareElements(a, b) {
	let aNode = a,
		bNode = b;
	while (aNode && bNode && aNode.parentNode !== bNode.parentNode) {
		aNode = aNode.parentNode;
		bNode = bNode.parentNode;
	}

	if (!aNode || !bNode)
		return {
			ancestor: null,
			a: a,
			b: b,
			result: 0
		};

	const children = aNode.parentNode.childNodes;
	const aIndex = getArrayIndex(children, aNode);
	const bIndex = getArrayIndex(children, bNode);

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
 * @param {string|Function|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @returns {Element|null}
 */
export function getParentElement(element, query) {
	let check;

	if (typeof query === 'function') {
		check = query;
	} else if (typeof query === 'object') {
		check = function (current) {
			return current === query;
		};
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = 'className';
			query = '(\\s|^)' + query.split('.')[1] + '(\\s|$)';
		} else if (/^#/.test(query)) {
			attr = 'id';
			query = '^' + query.split('#')[1] + '$';
		} else if (/^:/.test(query)) {
			attr = 'name';
			query = '^' + query.split(':')[1] + '$';
		} else {
			attr = 'nodeName';
			query = '^' + query + '$';
		}

		const regExp = new _w.RegExp(query, 'i');
		check = function (el) {
			return regExp.test(el[attr]);
		};
	}

	while (element && !check(element)) {
		if (isWysiwygFrame(element)) {
			return null;
		}
		element = element.parentNode;
	}

	return element;
}

/**
 * @description Gets the element with "data-command" attribute among the parent elements.
 * @param {Element} target Target element
 * @returns {Element|null}
 */
export function getCommandTarget(target) {
	let command = target.getAttribute('data-command');

	while (!command && !/^(UL|DIV)$/i.test(target.tagName)) {
		target = target.parentNode;
		if (target.getAttribute('data-command')) return target;
	}

	return command ? target : null;
}

/**
 * @description Get the child element of the argument value.
 * A tag that satisfies the query condition is imported.
 * Returns null if not found.
 * @param {Node} node Reference element
 * @param {string|Function|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * @param {boolean} last If true returns the last node among the found child nodes. (default: first node)
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @returns {Element|null}
 */
export function getEdgeChild(node, query, last) {
	let check;

	if (typeof query === 'function') {
		check = query;
	} else if (typeof query === 'object') {
		check = function (current) {
			return current === query;
		};
	} else {
		let attr;
		if (/^\./.test(query)) {
			attr = 'className';
			query = '(\\s|^)' + query.split('.')[1] + '(\\s|$)';
		} else if (/^#/.test(query)) {
			attr = 'id';
			query = '^' + query.split('#')[1] + '$';
		} else if (/^:/.test(query)) {
			attr = 'name';
			query = '^' + query.split(':')[1] + '$';
		} else {
			attr = 'nodeName';
			query = '^' + (query === 'text' ? '#' + query : query) + '$';
		}

		const regExp = new _w.RegExp(query, 'i');
		check = function (el) {
			return regExp.test(el[attr]);
		};
	}

	const childList = getListChildNodes(node, function (current) {
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
 * @returns {{sc: Node, ec: Node}}
 */
export function getEdgeChildNodes(first, last) {
	if (!first) return;
	if (!last) last = first;

	while (first && first.nodeType === 1 && first.childNodes.length > 0 && !isBreak(first)) first = first.firstChild;
	while (last && last.nodeType === 1 && last.childNodes.length > 0 && !isBreak(last)) last = last.lastChild;

	return {
		sc: first,
		ec: last || first
	};
}

/**
 * @description Get the item from the array that matches the condition.
 * @param {Array.<Node>|HTMLCollection|NodeList} array Array to get item
 * @param {Function|null} validation Conditional function
 * @param {boolean} multi If true, returns all items that meet the criteria otherwise, returns an empty array.
 * If false, returns only one item that meet the criteria otherwise return null.
 * @returns {Array.<Node>|null}
 */
export function getArrayItem(array, validation, multi) {
	if (!array || array.length === 0) return null;

	validation =
		validation ||
		function () {
			return true;
		};
	const arr = [];

	for (let i = 0, len = array.length, a; i < len; i++) {
		a = array[i];
		if (validation(a)) {
			if (!multi) return a;
			else arr.push(a);
		}
	}

	return !multi ? null : arr;
}

/**
 * @description Check if an array contains an element
 * @param {Array.<Node>|HTMLCollection|NodeList} array element array
 * @param {Node} node The node to check for
 * @returns {boolean}
 */
export function arrayIncludes(array, node) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === node) {
			return true;
		}
	}
	return false;
}

/**
 * @description Get the index of the argument value in the element array
 * @param {Array|HTMLCollection|NodeList} array element array
 * @param {Node} node The element to find index
 * @returns {number}
 */
export function getArrayIndex(array, node) {
	let idx = -1;
	for (let i = 0, len = array.length; i < len; i++) {
		if (array[i] === node) {
			idx = i;
			break;
		}
	}

	return idx;
}

/**
 * @description Get the next index of the argument value in the element array
 * @param {Array.<Node>|HTMLCollection|NodeList} array element array
 * @param {Node} item The element to find index
 * @returns {number}
 */
export function nextIndex(array, item) {
	let idx = getArrayIndex(array, item);
	if (idx === -1) return -1;
	return idx + 1;
}

/**
 * @description Get the previous index of the argument value in the element array
 * @param {Array.<Node>|HTMLCollection|NodeList} array Element array
 * @param {Node} item The element to find index
 * @returns {number}
 */
export function prevIndex(array, item) {
	let idx = getArrayIndex(array, item);
	if (idx === -1) return -1;
	return idx - 1;
}

/**
 * @description Add style and className of copyEl to originEl
 * @param {Element} originEl Origin element
 * @param {Element} copyEl Element to copy
 * @param {Array.<string>|null} blacklist Blacklist array(LowerCase)
 */
export function copyTagAttributes(originEl, copyEl, blacklist) {
	if (copyEl.style.cssText) {
		originEl.style.cssText += copyEl.style.cssText;
	}

	const attrs = copyEl.attributes;
	for (let i = 0, len = attrs.length, name; i < len; i++) {
		name = attrs[i].name.toLowerCase();
		if ((blacklist && blacklist.indexOf(name) > -1) || !attrs[i].value) originEl.removeAttribute(name);
		else originEl.setAttribute(attrs[i].name, attrs[i].value);
	}
}

/**
 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
 * @param {Element} originEl Origin element
 * @param {Element} copyEl Element to copy
 */
export function copyFormatAttributes(originEl, copyEl) {
	copyEl = copyEl.cloneNode(false);
	copyEl.className = copyEl.className.replace(/(\s|^)__se__format__[^\s]+/g, '');
	copyTagAttributes(originEl, copyEl);
}

/**
 * @description Compares the style and class for equal values.
 * Returns true if both are text nodes.
 * @param {Node} a Node to compare
 * @param {Node} b Node to compare
 * @returns {boolean}
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
	const reg = _w.RegExp;
	let compClass = 0;

	for (let i = 0, len = class_a.length; i < len; i++) {
		if (reg('(s|^)' + class_a[i] + '(s|$)').test(class_b.value)) compClass++;
	}

	return compStyle === style_b.length && compStyle === style_a.length && compClass === class_b.length && compClass === class_a.length;
}

/**
 * @description Delete argumenu value element
 * @param {Node} item Node to be remove
 */
export function removeItem(item) {
	if (!item) return;
	if (typeof item.remove === 'function') item.remove();
	else if (item.parentNode) item.parentNode.removeChild(item);
}

/**
 * @description Replace element
 * @param {Element} element Target element
 * @param {string|Element} newElement String or element of the new element to apply
 */
export function changeElement(element, newElement) {
	if (!element) return;

	if (typeof newElement === 'string') {
		if (element.outerHTML) {
			element.outerHTML = newElement;
		} else {
			const doc = createElement('DIV');
			doc.innerHTML = newElement;
			newElement = doc.firstChild;
			element.parentNode.replaceChild(newElement, element);
		}
	} else if (newElement && newElement.nodeType === 1) {
		element.parentNode.replaceChild(newElement, element);
	}
}

/**
 * @description Set the text content value of the argument value element
 * @param {Node} node Element to replace text content
 * @param {string} txt Text to be applied
 */
export function changeTxt(node, txt) {
	if (!node || !txt) return;
	node.textContent = txt;
}

/**
 * @description Set style, if all styles are deleted, the style properties are deleted.
 * @param {Element} element Element to set style
 * @param {string} styleName Style attribute name (marginLeft, textAlign...)
 * @param {string|number} value Style value
 */
export function setStyle(element, styleName, value) {
	element.style[styleName] = value;

	if (!value && !element.style.cssText) {
		element.removeAttribute('style');
	}
}

/**
 * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
 * @param {Array.<Element>|HTMLCollection|NodeList} buttonList Button array
 * @param {boolean} disabled Disabled value
 * @param {boolean} important If priveleged mode should be used (Necessary to switch importantDisabled buttons)
 */
export function setDisabled(buttonList, disabled, important) {
	for (let i = 0, len = buttonList.length; i < len; i++) {
		let button = buttonList[i];
		if (important || !isImportantDisabled(button)) button.disabled = disabled;
		if (important) {
			if (disabled) {
				button.setAttribute('data-important-disabled', '');
			} else {
				button.removeAttribute('data-important-disabled');
			}
		}
	}
}

/**
 * @description Determine whether any of the matched elements are assigned the given class
 * @param {Element} element Elements to search class name
 * @param {string} className Class name to search for
 * @returns {boolean}
 */
export function hasClass(element, className) {
	if (!element) return;

	return new _w.RegExp(className).test(element.className);
}

/**
 * @description Append the className value of the argument value element
 * @param {Element|Array.<Element>|NodeList} element Elements to add class name
 * @param {string} className Class name to be add
 */
export function addClass(element, className) {
	if (!element) return;

	const check = new _w.RegExp('(\\s|^)' + className + '(\\s|$)');
	((element instanceof window.NodeList || element instanceof window.Array) ? element : [element]).forEach(function (e) {
		if (!check.test(e.className)) e.className += (e.className.length > 0 ? ' ' : '') + className;
	});
}

/**
 * @description Delete the className value of the argument value element
 * @param {Element|Array.<Element>|NodeList} element Elements to remove class name
 * @param {string} className Class name to be remove
 */
export function removeClass(element, className) {
	if (!element) return;

	const check = new _w.RegExp('(\\s|^)' + className + '(\\s|$)');
	((element instanceof window.NodeList || element instanceof window.Array) ? element : [element]).forEach(function (e) {
		e.className = e.className.replace(check, ' ').trim();
		if (!e.className.trim()) e.removeAttribute('class');
	});
}

/**
 * @description Argument value If there is no class name, insert it and delete the class name if it exists
 * @param {Element} element Element to replace class name
 * @param {string} className Class name to be change
 * @returns {boolean|undefined}
 */
export function toggleClass(element, className) {
	if (!element) return;
	let result = false;

	const check = new _w.RegExp('(\\s|^)' + className + '(\\s|$)');
	if (check.test(element.className)) {
		element.className = element.className.replace(check, ' ').trim();
	} else {
		element.className += ' ' + className;
		result = true;
	}

	if (!element.className.trim()) element.removeAttribute('class');

	return result;
}

/**
 * @description Determine if this offset is the edge offset of container
 * @param {Node} container The node of the selection object. (range.startContainer..)
 * @param {number} offset The offset of the selection object. (core.getRange().startOffset...)
 * @param {string|undefined} dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
 * @returns {boolean}
 */
export function isEdgePoint(container, offset, dir) {
	return (dir !== 'end' && offset === 0) || ((!dir || dir !== 'front') && !container.nodeValue && offset === 1) || ((!dir || dir === 'end') && container.nodeValue && offset === container.nodeValue.length);
}

/**
 * @description It is judged whether it is the edit region top div element or iframe's body tag.
 * @param {Node} element The node to check
 * @returns {boolean}
 */
export function isWysiwygFrame(element) {
	return element && element.nodeType === 1 && (hasClass(element, 'se-wrapper-wysiwyg') || /^BODY$/i.test(element.nodeName));
}

/**
 * @description It is judged whether it is the contenteditable property is false.
 * @param {Node} element The node to check
 * @returns {boolean}
 */
export function isNonEditable(element) {
	return element && element.nodeType === 1 && element.getAttribute('contenteditable') === 'false';
}

/**
 * @description Check the node is a list (ol, ul)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isList(node) {
	return node && /^(OL|UL)$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a list cell (li)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isListCell(node) {
	return node && /^LI$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a table (table, thead, tbody, tr, th, td)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isTable(node) {
	return node && /^(TABLE|THEAD|TBODY|TR|TH|TD)$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a table cell (td, th)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isTableCell(node) {
	return node && /^(TD|TH)$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a break node (BR)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isBreak(node) {
	return node && /^BR$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a anchor node (A)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isAnchor(node) {
	return node && /^A$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a media node (img, iframe, audio, video, canvas)
 * @param {Node|string} node The element or element name to check
 * @returns {boolean}
 */
export function isMedia(node) {
	return node && /^(IMG|IFRAME|AUDIO|VIDEO|CANVAS)$/i.test(typeof node === 'string' ? node : node.nodeName);
}

/**
 * @description Check the node is a figure tag or domUtils.isMedia()
 * @param {Node|String} node The element or element name to check
 * @returns {Boolean}
 */
export function isFigures (node) {
	return node && (isMedia(node) || /^(FIGURE)$/i.test(typeof node === 'string' ? node : node.nodeName));
}

/**
 * @description Check the line element is empty.
 * @param {Element} element Format element node
 * @returns {boolean}
 */
export function isEmptyLine(element) {
	return !element || !element.parentNode || (!element.querySelector('IMG, IFRAME, AUDIO, VIDEO, CANVAS, TABLE') && element.children.length === 0 && isZeroWith(element.textContent));
}

/**
 * @description Check the span's attributes are empty.
 * @param {Element|null} element Element node
 * @returns {Boolean}
 */
export function isSpanWithoutAttr(element) {
	return element && element.nodeType === 1 && /^SPAN$/i.test(element.nodeName) && !element.className && !element.style.cssText;
}

/**
 * @description Checks for "__se__uneditable" in the class list.
 * Components with class "__se__uneditable" cannot be modified.
 * @param {Element} element The element to check
 * @returns {boolean}
 */
export function isUneditable(element) {
	return element && hasClass(element, '__se__uneditable');
}

/**
 * @description Checks if element can't be easily enabled
 * @param {Element} element Element to check for
 */
export function isImportantDisabled(element) {
	return element.hasAttribute('data-important-disabled');
}

export function isAllowClassName(v) {
	return /^(__se__|se-|katex)/.test(v) ? v : '';
}

/**
 * @description It is judged whether it is the not checking node. (class="katex", "__se__exclude-format")
 * @param {Node} element The node to check
 * @returns {boolean}
 */
export function isExcludeFormat(element) {
	return element && /(\s|^)(katex|__se__exclude-format)(\s|$)/.test(element.className);
}

/**
 * @description Get nearest scrollable parent
 * @param {Element} element Element
 * @returns {Element|null}
 */
export function getScrollParent(element) {
	if (!element || /^(body|html)$/i.test(element.nodeName)) {
		return null;
	}

	if (element.scrollHeight > element.clientHeight) {
		return element;
	} else {
		return getScrollParent(element.parentNode);
	}
}

const domUtils = {
	isZeroWith: isZeroWith,
	createElement: createElement,
	createTextNode: createTextNode,
	getIframeDocument: getIframeDocument,
	getAttributesToString: getAttributesToString,
	getPositionIndex: getPositionIndex,
	getNodePath: getNodePath,
	getNodeFromPath: getNodeFromPath,
	getListChildren: getListChildren,
	getListChildNodes: getListChildNodes,
	getNodeDepth: getNodeDepth,
	sortNodeByDepth: sortNodeByDepth,
	compareElements: compareElements,
	getParentElement: getParentElement,
	getCommandTarget: getCommandTarget,
	getEdgeChild: getEdgeChild,
	getEdgeChildNodes: getEdgeChildNodes,
	getArrayItem: getArrayItem,
	arrayIncludes: arrayIncludes,
	getArrayIndex: getArrayIndex,
	nextIndex: nextIndex,
	prevIndex: prevIndex,
	copyTagAttributes: copyTagAttributes,
	copyFormatAttributes: copyFormatAttributes,
	isSameAttributes: isSameAttributes,
	removeItem: removeItem,
	changeElement: changeElement,
	changeTxt: changeTxt,
	setStyle: setStyle,
	setDisabled: setDisabled,
	hasClass: hasClass,
	addClass: addClass,
	removeClass: removeClass,
	toggleClass: toggleClass,
	isEdgePoint: isEdgePoint,
	isWysiwygFrame: isWysiwygFrame,
	isNonEditable: isNonEditable,
	isList: isList,
	isListCell: isListCell,
	isTable: isTable,
	isTableCell: isTableCell,
	isBreak: isBreak,
	isAnchor: isAnchor,
	isMedia: isMedia,
	isFigures: isFigures,
	isEmptyLine: isEmptyLine,
	isSpanWithoutAttr: isSpanWithoutAttr,
	isUneditable: isUneditable,
	isImportantDisabled: isImportantDisabled,
	isAllowClassName: isAllowClassName,
	isExcludeFormat: isExcludeFormat,
	getScrollParent: getScrollParent
};

export default domUtils;
