import { _d, _w } from './env';
import { onlyZeroWidthRegExp, zeroWidthRegExp } from './unicode';

/**
 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (unicode.zeroWidthSpace)
 * @param {string|Node} text String value or Node
 * @returns {boolean}
 */
export function isZeroWidth(text) {
	if (text === null || text === undefined) return false;
	if (typeof text !== 'string') text = text.textContent;
	return text === '' || onlyZeroWidthRegExp.test(text);
}

/**
 * @description Create Element node
 * @param {string} elementName Element name
 * @param {?Object<string, string>=} attributes The attributes of the tag. {style: 'font-size:12px;..', class: 'el_class',..}
 * @param {?string|Node=} inner A innerHTML string or inner node.
 * @returns {HTMLElement}
 */
export function createElement(elementName, attributes, inner) {
	const el = _d.createElement(elementName);

	if (attributes) {
		for (const key in attributes) {
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
 * @param {HTMLIFrameElement} iframe Iframe element (this.editor.frameContext.get('wysiwygFrame'))
 * @returns {Document}
 */
export function getIframeDocument(iframe) {
	return iframe.contentWindow?.document || iframe.contentDocument;
}

/**
 * @description Get attributes of argument element to string ('class="---" name="---" ')
 * @param {Node} element Element object
 * @param {Array<string>|null} exceptAttrs Array of attribute names to exclude from the result
 * @returns {string}
 */
export function getAttributesToString(element, exceptAttrs) {
	if (!element.attributes) return '';

	const attrs = element.attributes;
	let attrString = '';

	for (let i = 0, len = attrs.length; i < len; i++) {
		if (exceptAttrs?.includes(attrs[i].name)) continue;
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
 * - e.g.) <p><span>aa</span><span>bb</span></p> : getNodePath(node: "bb", parentNode: "<P>") -> [1, 0]
 * @param {Node} node The Node to find position path
 * @param {?Node} parentNode Parent node. If null, wysiwyg div area
 * @param {?{s: number, e: number}=} _newOffsets If you send an object of the form "{s: 0, e: 0}", the text nodes that are attached together are merged into one, centered on the "node" argument.
 * "_newOffsets.s" stores the length of the combined characters after "node" and "_newOffsets.e" stores the length of the combined characters before "node".
 * Do not use unless absolutely necessary.
 * @returns {Array<number>}
 */
export function getNodePath(node, parentNode, _newOffsets) {
	const path = [];
	let finds = true;

	getParentElement(node, (el) => {
		if (el === parentNode) finds = false;
		if (finds && !isWysiwygFrame(el)) {
			// merge text nodes
			if (_newOffsets && el.nodeType === 3) {
				let temp = null,
					tempText = null;
				_newOffsets.s = _newOffsets.e = 0;

				let previous = el.previousSibling;
				while (previous?.nodeType === 3) {
					tempText = previous.textContent.replace(zeroWidthRegExp, '');
					_newOffsets.s += tempText.length;
					el.textContent = tempText + el.textContent;
					temp = previous;
					previous = previous.previousSibling;
					removeItem(temp);
				}

				let next = el.nextSibling;
				while (next?.nodeType === 3) {
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
	});

	return path.map(getPositionIndex).reverse();
}

/**
 * @description Returns the node in the location of the path array obtained from "helper.dom.getNodePath".
 * @param {Array<number>} offsets Position array, array obtained from "helper.dom.getNodePath"
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
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Array<Element>}
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

	return /** @type {Array<Element>} */ (children);
}

/**
 * @description Get all "childNodes" of the argument value element (Include text nodes)
 * @param {Node} element element to get child node
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Array<Node>}
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
 * - "0" when the parent node is the WYSIWYG area.
 * - '-1' when the element argument is the WYSIWYG area.
 * @param {Node} node The element to check
 * @returns {number}
 */
export function getNodeDepth(node) {
	if (!node || isWysiwygFrame(node)) return -1;

	let depth = 0;
	node = node.parentElement;

	while (node && !isWysiwygFrame(node)) {
		depth += 1;
		node = node.parentElement;
	}

	return depth;
}

/**
 * @description Sort a node array by depth of element.
 * @param {Array<Node>} array Node array
 * @param {boolean} des true: descending order / false: ascending order
 */
export function sortNodeByDepth(array, des) {
	const t = !des ? -1 : 1;
	const f = t * -1;

	array.sort(function (a, b) {
		if (!isListCell(a) || !isListCell(b)) return 0;
		const a_i = getNodeDepth(a);
		const b_i = getNodeDepth(b);
		return a_i > b_i ? t : a_i < b_i ? f : 0;
	});
}

/**
 * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
 * @param {Node} a Node to compare.
 * @param {Node} b Node to compare.
 * @returns {{ancestor: Element|null, a: Node, b: Node, result: number}} { ancesstor, a, b, result: (a > b ? 1 : a < b ? -1 : 0) };
 */
export function compareElements(a, b) {
	let aNode = a,
		bNode = b;
	while (aNode && bNode && aNode.parentElement !== bNode.parentElement) {
		aNode = aNode.parentElement;
		bNode = bNode.parentElement;
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
		ancestor: aNode.parentElement,
		a: aNode,
		b: bNode,
		result: aIndex > bIndex ? 1 : aIndex < bIndex ? -1 : 0
	};
}

/**
 * @description Get the parent element of the argument value.
 * - A tag that satisfies the query condition is imported.
 * @param {Node} element Reference element
 * @param {string|((current: *) => boolean)|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * - Not use it like jquery.
 * - Only one condition can be entered at a time.
 * @param {?number=} depth Number of parent levels to depth.
 * @returns {Node|null} Not found: null
 */
export function getParentElement(element, query, depth) {
	let check;

	if (typeof query === 'function') {
		check = query;
	} else if (typeof query === 'object') {
		/** @param {Node} current */
		check = (current) => current === query;
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

		const regExp = new RegExp(query, 'i');
		/** @param {Node} el */
		check = (el) => regExp.test(el[attr]);
	}

	if (!depth) depth = Infinity;
	let index = 0;
	while (element && !check(element)) {
		if (index >= depth || isWysiwygFrame(element)) {
			return null;
		}
		element = element.parentElement;
		index++;
	}

	return element;
}

/**
 * @description Gets all ancestors of the argument value.
 * - Get all tags that satisfy the query condition.
 * @param {Node} element Reference element
 * @param {string|((current: *) => boolean)|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @param {?number=} depth Number of parent levels to depth.
 * @returns {Array<Node>} Returned in an array in order.
 */
export function getParentElements(element, query, depth) {
	let check;

	if (typeof query === 'function') {
		check = query;
	} else if (typeof query === 'object') {
		/** @param {Node} current */
		check = (current) => current === query;
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

		const regExp = new RegExp(query, 'i');
		/** @param {Node} el */
		check = (el) => regExp.test(el[attr]);
	}

	const elementList = [];
	if (!depth) depth = Infinity;
	let index = 0;
	while (index <= depth && element && !isWysiwygFrame(element)) {
		if (check(element)) {
			elementList.push(element);
		}
		element = element.parentElement;
		index++;
	}

	return elementList;
}

/**
 * @description Gets the element with "data-command" attribute among the parent elements.
 * @param {Node} target Target element
 * @returns {Element|null}
 */
export function getCommandTarget(target) {
	while (target && !/^(UL)$/i.test(target.tagName) && !hasClass(target, 'sun-editor')) {
		if (target.hasAttribute('data-command')) return /** @type {HTMLElement} */ (target);
		target = target.parentElement;
	}

	return null;
}

/**
 * @description Get the child element of the argument value.
 * - A tag that satisfies the query condition is imported.
 * @param {Node} node Reference element
 * @param {string|((current: *) => boolean)|Node} query Query String (nodeName, .className, #ID, :name) or validation function.
 * @param {boolean} last If true returns the last node among the found child nodes. (default: first node)
 * Not use it like jquery.
 * Only one condition can be entered at a time.
 * @returns {Node|null} Not found: null
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

		const regExp = new RegExp(query, 'i');
		check = function (el) {
			return regExp.test(el[attr]);
		};
	}

	const childList = getListChildNodes(node, (current) => check(current));

	return childList[last ? childList.length - 1 : 0];
}

/**
 * @description Get edge child nodes of the argument value.
 * - 1. The first node of all the child nodes of the "first" element is returned.
 * - 2. The last node of all the child nodes of the "last" element is returned.
 * - 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
 * @param {Node} first First element
 * @param {Node|null} last Last element
 * @returns {{sc: Node, ec: Node}} { sc: "first", ec: "last" }
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
 * @description Get the items array from the array that matches the condition.
 * @param {NodeCollection} array Array to get item
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Array<Node>|null}
 */
export function arrayFilter(array, validation) {
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
			arr.push(a);
		}
	}

	return arr;
}

/**
 * @description Get the item from the array that matches the condition.
 * @param {NodeCollection} array Array to get item
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Node|null}
 */
export function arrayFind(array, validation) {
	if (!array || array.length === 0) return null;

	validation =
		validation ||
		function () {
			return true;
		};

	for (let i = 0, len = array.length, a; i < len; i++) {
		a = array[i];
		if (validation(a)) {
			return a;
		}
	}

	return null;
}

/**
 * @description Check if an array contains an element
 * @param {NodeCollection} array element array
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
 * @param {NodeCollection} array element array
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
 * @param {NodeCollection} array element array
 * @param {Node} item The element to find index
 * @returns {number}
 */
export function nextIndex(array, item) {
	const idx = getArrayIndex(array, item);
	if (idx === -1) return -1;
	return idx + 1;
}

/**
 * @description Get the previous index of the argument value in the element array
 * @param {NodeCollection} array Element array
 * @param {Node} item The element to find index
 * @returns {number}
 */
export function prevIndex(array, item) {
	const idx = getArrayIndex(array, item);
	if (idx === -1) return -1;
	return idx - 1;
}

/**
 * @description Add style and className of copyEl to originEl
 * @param {Node} originEl Origin element
 * @param {Node} copyEl Element to copy
 * @param {?Array<string>=} blacklist Blacklist array(LowerCase)
 */
export function copyTagAttributes(originEl, copyEl, blacklist) {
	if (copyEl.style.cssText) {
		const copyStyles = copyEl.style;
		for (let i = 0, len = copyStyles.length; i < len; i++) {
			originEl.style[copyStyles[i]] = copyStyles[copyStyles[i]];
		}
	}

	const attrs = copyEl.attributes;
	for (let i = 0, len = attrs.length, name; i < len; i++) {
		name = attrs[i].name.toLowerCase();
		if (blacklist?.includes(name) || !attrs[i].value) originEl.removeAttribute(name);
		else if (name !== 'style') originEl.setAttribute(attrs[i].name, attrs[i].value);
	}
}

/**
 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
 * @param {Node} originEl Origin element
 * @param {Node} copyEl Element to copy
 */
export function copyFormatAttributes(originEl, copyEl) {
	copyEl = /** @type {Element} */ (copyEl.cloneNode(false));
	copyEl.className = copyEl.className.replace(/(\s|^)__se__format__[^\s]+/g, '');
	copyTagAttributes(originEl, copyEl);
}

/**
 * @description Compares the style and class for equal values.
 * @param {Node} a Node to compare
 * @param {Node} b Node to compare
 * @returns {boolean} Returns true if both are text nodes.
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
	const wRegExp = RegExp;
	let compClass = 0;

	for (let i = 0, len = class_a.length; i < len; i++) {
		if (wRegExp('(s|^)' + class_a[i] + '(s|$)').test(class_b.value)) compClass++;
	}

	return compStyle === style_b.length && compStyle === style_a.length && compClass === class_b.length && compClass === class_a.length;
}

/**
 * @description Delete argumenu value element
 * @param {Node} item Node to be remove
 */
export function removeItem(item) {
	if (!item) return;
	if ('remove' in item && typeof item.remove === 'function') item.remove();
	else if (item.parentNode) item.parentNode.removeChild(item);
}

/**
 * @description Replace element
 * @param {Node} element Target element
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
			element.parentNode.replaceChild(doc.firstChild, element);
		}
	} else if (newElement?.nodeType === 1) {
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
 * @param {Node|Node[]} elements Element to set style
 * @param {string} styleName Style attribute name (marginLeft, textAlign...)
 * @param {string|number} value Style value
 */
export function setStyle(elements, styleName, value) {
	elements = Array.isArray(elements) ? elements : [elements];

	for (let i = 0, len = elements.length, e; i < len; i++) {
		e = elements[i];
		e.style[styleName] = value;
		if (!value && !e.style.cssText) {
			e.removeAttribute('style');
		}
	}
}

/**
 * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
 * @param {Array<HTMLButtonElement|HTMLInputElement>} buttonList (Button | Input) Element array
 * @param {boolean} disabled Disabled value
 * @param {boolean} [important=false] If priveleged mode should be used (Necessary to switch importantDisabled buttons)
 */
export function setDisabled(buttonList, disabled, important) {
	for (let i = 0, len = buttonList.length; i < len; i++) {
		const button = buttonList[i];
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
 * @param {?Node} element Elements to search class name
 * @param {string} className Class name to search for
 * @returns {boolean}
 */
export function hasClass(element, className) {
	if (!element) return;
	const check = new RegExp(`(\\s|^)${className}(\\s|$)`);
	return check.test(element.className);
}

/**
 * @description Append the className value of the argument value element
 * @param {Node|NodeCollection} element Elements to add class name
 * @param {string} className Class name to be add
 */
export function addClass(element, className) {
	if (!element) return;

	const elements = element instanceof HTMLCollection || element instanceof NodeList || element instanceof Array ? element : [element];
	const classNames = className.split('|');

	for (const e of elements) {
		if (!e || e.nodeType !== 1) continue;
		for (const c of classNames) {
			if (c) /** @type {HTMLElement} */ (e).classList.add(c);
		}
	}
}

/**
 * @description Delete the className value of the argument value element
 * @param {Node|NodeCollection} element Elements to remove class name
 * @param {string} className Class name to be remove
 */
export function removeClass(element, className) {
	if (!element) return;

	const elements = element instanceof HTMLCollection || element instanceof NodeList || element instanceof Array ? element : [element];
	const classNames = className.split('|');

	for (const e of elements) {
		if (!e || e.nodeType !== 1) continue;
		for (const c of classNames) {
			if (c) /** @type {HTMLElement} */ (e).classList.remove(c);
		}
	}
}

/**
 * @description Argument value If there is no class name, insert it and delete the class name if it exists
 * @param {Node} element Element to replace class name
 * @param {string} className Class name to be change
 * @returns {boolean|undefined}
 */
export function toggleClass(element, className) {
	if (!element) return;
	if (element.nodeType !== 1) return;

	let result = false;

	const check = new RegExp(`(\\s|^)${className}(\\s|$)`);
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
 * @param {?"front"|"end"=} dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
 * @returns {boolean}
 */
export function isEdgePoint(container, offset, dir) {
	return (dir !== 'end' && offset === 0) || ((!dir || dir !== 'front') && !container.nodeValue && offset === 1) || ((!dir || dir === 'end') && container.nodeValue && offset >= container.nodeValue.length);
}

/**
 * @description It is judged whether it is the edit region top div element or iframe's body tag.
 * @param {?Node=} element The node to check
 * @returns {boolean}
 */
export function isWysiwygFrame(element) {
	return element?.nodeType === 1 && (hasClass(element, 'se-wrapper-wysiwyg|sun-editor-carrier-wrapper') || /^BODY$/i.test(element.nodeName));
}

/**
 * @description It is judged whether it is the contenteditable property is false.
 * @param {?Node=} element The node to check
 * @returns {boolean}
 */
export function isNonEditable(element) {
	return element?.nodeType === 1 && element.getAttribute('contenteditable') === 'false';
}

/**
 * @description Check the node is a list (ol, ul)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isList(node) {
	return /^(OL|UL)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a list cell (li)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isListCell(node) {
	return /^LI$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isTable(node) {
	return /^TABLE$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table elements. (table, thead, tbody, tr, th, td)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isTableElements(node) {
	return /^(TABLE|THEAD|TBODY|TR|TH|TD|COL)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table cell (td, th)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isTableCell(node) {
	return /^(TD|TH)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a table row (tr)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isTableRow(node) {
	return /^TR$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a break node (BR)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isBreak(node) {
	return /^BR$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a anchor node (A)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isAnchor(node) {
	return /^A$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a media node (img, iframe, audio, video, canvas)
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isMedia(node) {
	return /^(IMG|IFRAME|AUDIO|VIDEO|CANVAS)$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description Check the node is a figure tag
 * @param {?Node|string=} node The element or element name to check
 * @returns {boolean}
 */
export function isFigure(node) {
	return /^FIGURE$/i.test(typeof node === 'string' ? node : node?.nodeName);
}

/**
 * @description It is judged whether it is the input element (INPUT, TEXTAREA)
 * @param {?Node=} element The node to check
 * @returns {boolean}
 */
export function isInputElement(element) {
	return element?.nodeType === 1 && /^(INPUT|TEXTAREA|SELECT|OPTION)$/i.test(element.nodeName);
}

/**
 * @description Check the line element is empty.
 * @param {Node} element "line" element node
 * @returns {boolean}
 */
export function isEmptyLine(element) {
	return !element?.parentNode || (!element.querySelector('IMG, IFRAME, AUDIO, VIDEO, CANVAS, TABLE') && element.children.length === 0 && isZeroWidth(element.textContent));
}

/**
 * @description Check the span's attributes are empty.
 * @param {?Node} element Element node
 * @returns {boolean}
 */
export function isSpanWithoutAttr(element) {
	return element?.nodeType === 1 && /^SPAN$/i.test(element.nodeName) && !element.className && !(/** @type {HTMLElement} */ (element).style.cssText);
}

/**
 * @description Checks for "__se__uneditable" in the class list.
 * - Components with class "__se__uneditable" cannot be modified.
 * @param {Node} element The element to check
 * @returns {boolean}
 */
export function isUneditable(element) {
	return hasClass(element, '__se__uneditable');
}

/**
 * @description Checks if element can't be easily enabled
 * @param {Node} element Element to check for
 * @returns {boolean}
 */
export function isImportantDisabled(element) {
	return element.hasAttribute('data-important-disabled');
}

/**
 * @description It is judged whether it is the not checking node. (class="katex", "MathJax", "se-exclude-format")
 * @param {Node} element The node to check
 * @returns {boolean}
 */
export function isExcludeFormat(element) {
	return /(\s|^)(katex|MathJax|se-exclude-format)(\s|$)/.test(element?.className);
}

/**
 * @description Get nearest scrollable parent
 * @param {Node} element Element
 * @returns {Element|null}
 */
export function getScrollParent(element) {
	if (!element || /^(body|html)$/i.test(element.nodeName)) {
		return null;
	}

	if (element.scrollHeight > element.clientHeight) {
		return /** @type {Element} */ (element);
	} else {
		return getScrollParent(element.parentElement);
	}
}

/**
 * @description Gets the size of the documentElement client size.
 * @param {Document} doc Document object
 * @returns {{w: number, h: number}} documentElement.clientWidth, documentElement.clientHeight
 */
export function getClientSize(doc = _d) {
	return {
		w: doc.documentElement.clientWidth,
		h: doc.documentElement.clientHeight
	};
}

/**
 * @description Gets the size of the window visualViewport size
 * @returns {{top: number, left: number, scale: number}}
 */
export function getViewportSize() {
	if ('visualViewport' in _w) {
		return {
			top: _w.visualViewport.pageTop,
			left: _w.visualViewport.pageLeft,
			scale: _w.visualViewport.scale
		};
	}

	return {
		top: 0,
		left: 0,
		scale: 1
	};
}

/**
 * @description Gets the previous sibling last child. If there is no sibling, then it'll take it from the closest ancestor with child
 * @param {Node} node Reference element
 * @param {?(Node & ParentNode)=} ceiling Highest boundary allowed
 * @returns {Node|null} Not found: null
 */
export function getPreviousDeepestNode(node, ceiling) {
	let previousNode = node.previousSibling;
	if (!previousNode) {
		for (let parentNode = node.parentNode; parentNode; parentNode = parentNode.parentNode) {
			if (parentNode === ceiling) return null;
			if (parentNode.previousSibling) {
				previousNode = parentNode.previousSibling;
				break;
			}
		}
		if (!previousNode) return null;
	}

	if (isNonEditable(previousNode)) return previousNode;

	while (previousNode.lastChild) previousNode = previousNode.lastChild;

	return previousNode;
}

/**
 * @description Gets the next sibling first child. If there is no sibling, then it'll take it from the closest ancestor with child
 * @param {Node} node Reference element
 * @param {?(Node & ParentNode)=} ceiling Highest boundary allowed
 * @returns {Node|null} Not found: null
 */
export function getNextDeepestNode(node, ceiling) {
	let nextNode = node.nextSibling;
	if (!nextNode) {
		for (let parentNode = node.parentNode; parentNode; parentNode = parentNode.parentNode) {
			if (parentNode === ceiling) return null;
			if (parentNode.nextSibling) {
				nextNode = parentNode.nextSibling;
				break;
			}
		}
		if (!nextNode) return null;
	}

	if (isNonEditable(nextNode)) return nextNode;

	while (nextNode.firstChild) nextNode = nextNode.firstChild;

	return nextNode;
}

/**
 * @description Find the index of the text node in the line element.
 * @param {Node} line Line element (p, div, etc.)
 * @param {Node} offsetContainer Base node to start searching
 * @param {number} offset Base offset to start searching
 * @param {?(current: *) => boolean=} validate Validation function
 * @returns {number}
 */
export function findTextIndexOnLine(line, offsetContainer, offset, validate) {
	if (!line) return 0;
	if (!validate) validate = () => true;

	let index = 0;
	let found = false;

	(function recursionFunc(node) {
		if (found || node.nodeType === 8) return;
		if (validate(node)) return; //  component.is

		if (node.nodeType === 3) {
			if (node === offsetContainer) {
				index += offset;
				found = true;
				return;
			}
			index += node.textContent.length;
		} else if (node.nodeType === 1) {
			for (const child of node.childNodes) {
				recursionFunc(child);
				if (found) return;
			}
		}
	})(line);

	return index;
}

/**
 * @description Find the end index of a sequence of at least minTabSize consecutive non-breaking spaces or spaces
 * - which are interpreted as a tab key, occurring after a given base index in a text string.
 * @param {Node} line Line element (p, div, etc.)
 * @param {number} baseIndex Base index to start searching
 * @param {number} minTabSize Minimum number of consecutive spaces to consider as a tab
 * @returns {number} The adjusted index within the line element accounting for non-space characters
 */
export function findTabEndIndex(line, baseIndex, minTabSize) {
	if (!line) return 0;
	const innerText = line.innerText;
	const regex = new RegExp(`((\\u00A0|\\s){${minTabSize},})`, 'g');
	let match;

	regex.lastIndex = baseIndex;

	while ((match = regex.exec(innerText)) !== null) {
		if (match.index >= baseIndex) {
			const spaceEndIndex = match.index + match[0].length - 1;
			const precedingText = innerText.slice(0, spaceEndIndex + 1);
			const nonSpaceCharCount = (precedingText.match(/[^\u00A0\s]/g) || []).length;
			return spaceEndIndex + nonSpaceCharCount + minTabSize;
		}
	}

	return 0;
}

/**
 * @description Copies the "wwTarget" element and returns it with inline all styles applied.
 * @param {Element} wwTarget Target element to copy(.sun-editor.sun-editor-editable)
 * @param {boolean} includeWW Include the "wwTarget" element in the copy
 * @param {Array<string>} styles Style list - kamel case
 * @returns
 */
export function applyInlineStylesAll(wwTarget, includeWW, styles) {
	if (!wwTarget) {
		console.warn('"parentTarget" is not exist');
		return null;
	}

	const tempTarget = _d.createElement('DIV');
	tempTarget.style.display = 'none';

	if (/body/i.test(wwTarget.nodeName)) {
		const wwDiv = _d.createElement('DIV');
		const attrs = wwTarget.attributes;
		for (let i = 0, len = attrs.length; i < len; i++) {
			wwDiv.setAttribute(attrs[i].name, attrs[i].value);
		}
		wwDiv.innerHTML = wwTarget.innerHTML;
		wwTarget = wwDiv;
	} else {
		wwTarget = /** @type {Element} */ (wwTarget.cloneNode(true));
	}

	tempTarget.appendChild(wwTarget);
	_d.body.appendChild(tempTarget);

	const allElements = Array.from(wwTarget.querySelectorAll('*'));
	const elements = includeWW ? [wwTarget].concat(allElements) : allElements;
	for (let i = 0, el; (el = elements[i]); i++) {
		if (el.nodeType !== 1) continue;
		const computedStyle = _w.getComputedStyle(el);
		const els = el.style;
		for (const props of styles) {
			els.setProperty(props, computedStyle.getPropertyValue(props) || '');
		}
	}

	_d.body.removeChild(tempTarget);

	return wwTarget;
}

/**
 * @description Wait for media elements to load
 * @param {number} timeout Timeout milliseconds
 * @param {Node} target Target element
 * @returns {Promise<void>}
 */
function waitForMediaLoad(target, timeout = 5000) {
	const doc = target || _d;
	return new Promise((resolveAll) => {
		const selectors = ['img', 'video', 'audio', 'iframe'];
		const mediaElements = selectors.flatMap((selector) => Array.from(doc.querySelectorAll(selector)));

		if (mediaElements.length === 0) {
			resolveAll();
			return;
		}

		const mediaPromises = mediaElements.map((element) => {
			// image
			if (element instanceof HTMLImageElement) {
				if (element.complete) {
					return Promise.resolve();
				}
			}
			// video, audio
			else if (element instanceof HTMLMediaElement) {
				if (element.readyState >= 2) {
					return Promise.resolve();
				}
			}
			// iframe
			else if (element instanceof HTMLIFrameElement) {
				try {
					if (element.contentDocument?.readyState === 'complete') {
						return Promise.resolve();
					}
				} catch (e) {
					console.warn(['[SUNEDITOR] Iframe load error', e]);
				}
			}

			// load event
			return new Promise((resolve) => {
				element.addEventListener('load', resolve, { once: true });
				element.addEventListener('error', resolve, { once: true });
			});
		});

		Promise.race([Promise.all(mediaPromises), new Promise((resolve) => setTimeout(resolve, timeout))]).then(() => {
			resolveAll();
		});
	});
}

const domUtils = {
	isZeroWidth,
	createElement,
	createTextNode,
	getIframeDocument,
	getAttributesToString,
	getPositionIndex,
	getNodePath,
	getNodeFromPath,
	getListChildren,
	getListChildNodes,
	getNodeDepth,
	sortNodeByDepth,
	compareElements,
	getParentElement,
	getParentElements,
	getCommandTarget,
	getEdgeChild,
	getEdgeChildNodes,
	arrayFilter,
	arrayFind,
	arrayIncludes,
	getArrayIndex,
	nextIndex,
	prevIndex,
	copyTagAttributes,
	copyFormatAttributes,
	isSameAttributes,
	removeItem,
	changeElement,
	changeTxt,
	setStyle,
	setDisabled,
	hasClass,
	addClass,
	removeClass,
	toggleClass,
	isEdgePoint,
	isWysiwygFrame,
	isNonEditable,
	isList,
	isListCell,
	isTable,
	isTableElements,
	isTableCell,
	isTableRow,
	isBreak,
	isAnchor,
	isMedia,
	isFigure,
	isInputElement,
	isEmptyLine,
	isSpanWithoutAttr,
	isUneditable,
	isImportantDisabled,
	isExcludeFormat,
	getScrollParent,
	getClientSize,
	getViewportSize,
	getPreviousDeepestNode,
	getNextDeepestNode,
	findTextIndexOnLine,
	findTabEndIndex,
	applyInlineStylesAll,
	waitForMediaLoad
};

export default domUtils;
