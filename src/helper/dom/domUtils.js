import { _d, _w } from '../env';
import check from './domCheck';

/**
 * @template {Node} T
 * @description Clones a node while preserving its type.
 * @param {T} node - The node to clone.
 * @param {boolean} [deep=false] - Whether to perform a deep clone.
 * @returns {T} - The cloned node.
 */
export function clone(node, deep = false) {
	return /** @type {T} */ (node.cloneNode(deep));
}

/**
 * @template {HTMLElement} T
 * @description Create Element node
 * @param {string} elementName Element name
 * @param {?Object<string, string>=} attributes The attributes of the tag. {style: 'font-size:12px;..', class: 'el_class',..}
 * @param {?string|Node=} inner A innerHTML string or inner node.
 * @returns {T}
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

	return /** @type {T} */ (el);
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
 * @description Get attributes of argument element to string ('class="---" name="---" ')
 * @param {Node} element Element object
 * @param {Array<string>|null} exceptAttrs Array of attribute names to exclude from the result
 * @returns {string}
 */
export function getAttributesToString(element, exceptAttrs) {
	const attrs = /** @type {HTMLElement} */ (element).attributes;
	if (!attrs) return '';

	let attrString = '';
	for (let i = 0, len = attrs.length; i < len; i++) {
		if (exceptAttrs?.includes(attrs[i].name)) continue;
		attrString += attrs[i].name + '="' + attrs[i].value + '" ';
	}

	return attrString;
}

/**
 * @description Get the items array from the array that matches the condition.
 * @param {__se__NodeCollection} array Array to get item
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
 * @param {__se__NodeCollection} array Array to get item
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
 * @param {__se__NodeCollection} array element array
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
 * @param {__se__NodeCollection} array element array
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
 * @param {__se__NodeCollection} array element array
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
 * @param {__se__NodeCollection} array Element array
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
	const o = /** @type {HTMLElement} */ (originEl);
	const c = /** @type {HTMLElement} */ (copyEl);
	if (c.style.cssText) {
		const copyStyles = c.style;
		for (let i = 0, len = copyStyles.length; i < len; i++) {
			o.style[copyStyles[i]] = copyStyles[copyStyles[i]];
		}
	}

	const attrs = c.attributes;
	for (let i = 0, len = attrs.length, name; i < len; i++) {
		name = attrs[i].name.toLowerCase();
		if (blacklist?.includes(name) || !attrs[i].value) o.removeAttribute(name);
		else if (name !== 'style') o.setAttribute(attrs[i].name, attrs[i].value);
	}
}

/**
 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
 * @param {Node} originEl Origin element
 * @param {Node} copyEl Element to copy
 */
export function copyFormatAttributes(originEl, copyEl) {
	const c = /** @type {HTMLElement} */ (copyEl.cloneNode(false));
	c.className = c.className.replace(/(\s|^)__se__format__[^\s]+/g, '');
	copyTagAttributes(originEl, c);
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
 * @param {string|Node} newElement String or element of the new element to apply
 */
export function changeElement(element, newElement) {
	if (!element) return;

	if (typeof newElement === 'string') {
		if ('outerHTML' in element) {
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
		e = /** @type {HTMLElement} */ (elements[i]);
		e.style[styleName] = value;
		if (!e.style.cssText) {
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
		if (important || !check.isImportantDisabled(button)) button.disabled = disabled;
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
	if (!element || element.nodeType !== 1) return;
	const valid = new RegExp(`(\\s|^)${className}(\\s|$)`);
	return valid.test(/** @type {HTMLElement} */ (element).className);
}

/**
 * @description Append the className value of the argument value element
 * @param {Node|__se__NodeCollection} element Elements to add class name
 * @param {string} className Class name to be add
 */
export function addClass(element, className) {
	if (!element) return;

	const elements = element instanceof HTMLCollection || element instanceof NodeList || element instanceof Array ? element : [element];
	const classNames = className.split('|');

	for (let i = 0, len = elements.length; i < len; i++) {
		const e = elements[i];
		if (!e || e.nodeType !== 1) continue;
		for (const c of classNames) {
			if (c) /** @type {HTMLElement} */ (e).classList.add(c);
		}
	}
}

/**
 * @description Delete the className value of the argument value element
 * @param {Node|__se__NodeCollection} element Elements to remove class name
 * @param {string} className Class name to be remove
 */
export function removeClass(element, className) {
	if (!element) return;

	const elements = element instanceof HTMLCollection || element instanceof NodeList || element instanceof Array ? element : [element];
	const classNames = className.split('|');

	for (let i = 0, len = elements.length; i < len; i++) {
		const e = elements[i];
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
	if (!element || element.nodeType !== 1) return;

	const el = /** @type {HTMLElement} */ (element);

	let result = false;
	const valid = new RegExp(`(\\s|^)${className}(\\s|$)`);
	if (valid.test(el.className)) {
		el.className = el.className.replace(valid, ' ').trim();
	} else {
		el.className += ' ' + className;
		result = true;
	}

	if (!el.className.trim()) el.removeAttribute('class');

	return result;
}

/**
 * @description Flash the class name of the argument value element for a certain time
 * @param {Node} element Element to flash class name
 * @param {string} className class name
 * @param {number} [duration=120] duration milliseconds
 */
export function flashClass(element, className, duration = 120) {
	addClass(element, className);
	_w.setTimeout(() => {
		removeClass(element, className);
	}, duration);
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
 * @description Copies the "wwTarget" element and returns it with inline all styles applied.
 * @param {Node} wwTarget Target element to copy(.sun-editor.sun-editor-editable)
 * @param {boolean} includeWW Include the "wwTarget" element in the copy
 * @param {Array<string>} styles Style list - kamel case
 * @returns
 */
export function applyInlineStylesAll(wwTarget, includeWW, styles) {
	if (!wwTarget) {
		console.warn('"parentTarget" is not exist');
		return null;
	}

	let ww = /** @type {HTMLElement} */ (wwTarget);
	const tempTarget = _d.createElement('DIV');
	tempTarget.style.display = 'none';

	if (/body/i.test(ww.nodeName)) {
		const wwDiv = _d.createElement('DIV');
		const attrs = ww.attributes;
		for (let i = 0, len = attrs.length; i < len; i++) {
			wwDiv.setAttribute(attrs[i].name, attrs[i].value);
		}
		wwDiv.innerHTML = ww.innerHTML;
		ww = wwDiv;
	} else {
		ww = /** @type {HTMLElement} */ (ww.cloneNode(true));
	}

	tempTarget.appendChild(ww);
	_d.body.appendChild(tempTarget);

	/** @type {HTMLElement[]} */
	const allElements = Array.from(ww.querySelectorAll('*'));
	const elements = includeWW ? [ww].concat(allElements) : allElements;
	for (let i = 0, el; (el = elements[i]); i++) {
		if (el.nodeType !== 1) continue;
		const computedStyle = _w.getComputedStyle(el);
		const els = el.style;
		for (const props of styles) {
			els.setProperty(props, computedStyle.getPropertyValue(props) || '');
		}
	}

	_d.body.removeChild(tempTarget);

	return ww;
}

/**
 * @description Wait for media elements to load
 * @param {Node} target Target element
 * @param {number} timeout Timeout milliseconds
 * @returns {Promise<void>}
 */
export function waitForMediaLoad(target, timeout = 5000) {
	const doc = /** @type {HTMLElement|Document} */ (target || _d);
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

		Promise.race([Promise.all(mediaPromises), new Promise((resolve) => _w.setTimeout(resolve, timeout))]).then(() => {
			resolveAll();
		});
	});
}

/**
 * @description Create tooltip HTML
 * @param {string} text Tooltip text
 * @returns {string} Tooltip HTML
 */
export function createTooltipInner(text) {
	return `<span class="se-tooltip-inner"><span class="se-tooltip-text">${text}</span></span>`;
}

const utils = {
	clone,
	createElement,
	createTextNode,
	getAttributesToString,
	arrayFilter,
	arrayFind,
	arrayIncludes,
	getArrayIndex,
	nextIndex,
	prevIndex,
	copyTagAttributes,
	copyFormatAttributes,
	removeItem,
	changeElement,
	changeTxt,
	setStyle,
	setDisabled,
	hasClass,
	addClass,
	removeClass,
	toggleClass,
	flashClass,
	getClientSize,
	getViewportSize,
	applyInlineStylesAll,
	waitForMediaLoad,
	createTooltipInner
};

export default utils;
