import type {} from '../../typedef';
/**
 * @template {Node} T
 * @description Clones a node while preserving its type.
 * @param {T} node - The node to clone.
 * @param {boolean} [deep=false] - Whether to perform a deep clone.
 * @returns {T} - The cloned node.
 */
export function clone<T extends Node>(node: T, deep?: boolean): T;
/**
 * @template {HTMLElement} T
 * @description Create Element node
 * @param {string} elementName Element name
 * @param {?Object<string, string>=} attributes The attributes of the tag. {style: 'font-size:12px;..', class: 'el_class',..}
 * @param {?string|Node=} inner A innerHTML string or inner node.
 * @returns {T}
 */
export function createElement<T extends HTMLElement>(
	elementName: string,
	attributes?:
		| ({
				[x: string]: string;
		  } | null)
		| undefined,
	inner?: ((string | Node) | null) | undefined,
): T;
/**
 * @description Create text node
 * @param {string} text text content
 * @returns {Text}
 */
export function createTextNode(text: string): Text;
/**
 * @description Get attributes of argument element to string ('class="---" name="---" ')
 * @param {Node} element Element object
 * @param {Array<string>|null} exceptAttrs Array of attribute names to exclude from the result
 * @returns {string}
 */
export function getAttributesToString(element: Node, exceptAttrs: Array<string> | null): string;
/**
 * @description Get the items array from the array that matches the condition.
 * @param {SunEditor.NodeCollection} array Array to get item
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Array<Node>|null}
 */
export function arrayFilter(array: SunEditor.NodeCollection, validation: ((current: any) => boolean) | null): Array<Node> | null;
/**
 * @description Get the item from the array that matches the condition.
 * @param {SunEditor.NodeCollection} array Array to get item
 * @param {?(current: *) => boolean} validation Conditional function
 * @returns {Node|null}
 */
export function arrayFind(array: SunEditor.NodeCollection, validation: ((current: any) => boolean) | null): Node | null;
/**
 * @description Check if an array contains an element
 * @param {SunEditor.NodeCollection} array element array
 * @param {Node} node The node to check for
 * @returns {boolean}
 */
export function arrayIncludes(array: SunEditor.NodeCollection, node: Node): boolean;
/**
 * @description Get the index of the argument value in the element array
 * @param {SunEditor.NodeCollection} array element array
 * @param {Node} node The element to find index
 * @returns {number}
 */
export function getArrayIndex(array: SunEditor.NodeCollection, node: Node): number;
/**
 * @description Get the next index of the argument value in the element array
 * @param {SunEditor.NodeCollection} array element array
 * @param {Node} item The element to find index
 * @returns {number}
 */
export function nextIndex(array: SunEditor.NodeCollection, item: Node): number;
/**
 * @description Get the previous index of the argument value in the element array
 * @param {SunEditor.NodeCollection} array Element array
 * @param {Node} item The element to find index
 * @returns {number}
 */
export function prevIndex(array: SunEditor.NodeCollection, item: Node): number;
/**
 * @description Add style and className of copyEl to originEl
 * @param {Node} originEl Origin element
 * @param {Node} copyEl Element to copy
 * @param {?Array<string>=} blacklist Blacklist array(LowerCase)
 */
export function copyTagAttributes(originEl: Node, copyEl: Node, blacklist?: (Array<string> | null) | undefined): void;
/**
 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
 * @param {Node} originEl Origin element
 * @param {Node} copyEl Element to copy
 */
export function copyFormatAttributes(originEl: Node, copyEl: Node): void;
/**
 * @description Delete argumenu value element
 * @param {Node} item Node to be remove
 */
export function removeItem(item: Node): void;
/**
 * @description Replace element
 * @param {Node} element Target element
 * @param {string|Node} newElement String or element of the new element to apply
 */
export function changeElement(element: Node, newElement: string | Node): void;
/**
 * @description Set the text content value of the argument value element
 * @param {Node} node Element to replace text content
 * @param {string} txt Text to be applied
 */
export function changeTxt(node: Node, txt: string): void;
/**
 * @description Set style, if all styles are deleted, the style properties are deleted.
 * @param {Node|Node[]} elements Element to set style
 * @param {string} styleName Style attribute name (marginLeft, textAlign...)
 * @param {string|number} value Style value
 */
export function setStyle(elements: Node | Node[], styleName: string, value: string | number): void;
/**
 * @description Gets the style value of the element. If the elements is an array, the style of the first element is returned.
 * @param {Node} element Element to get style from.
 * @param {string} styleName Style attribute name (e.g., 'marginLeft', 'textAlign').
 * @returns {string | undefined} The value of the style attribute, or undefined if the element does not exist.
 */
export function getStyle(element: Node, styleName: string): string | undefined;
/**
 * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
 * @param {SunEditor.NodeCollection} buttonList (Button | Input) Element array
 * @param {boolean} disabled Disabled value
 * @param {boolean} [important=false] If priveleged mode should be used (Necessary to switch importantDisabled buttons)
 */
export function setDisabled(buttonList: SunEditor.NodeCollection, disabled: boolean, important?: boolean): void;
/**
 * @description Determine whether any of the matched elements are assigned the given class
 * @param {?Node} element Elements to search class name
 * @param {string} className Class name to search for
 * @returns {boolean}
 */
export function hasClass(element: Node | null, className: string): boolean;
/**
 * @description Append the className value of the argument value element
 * @param {Node|SunEditor.NodeCollection} element Elements to add class name
 * @param {string} className Class name to be add
 */
export function addClass(element: Node | SunEditor.NodeCollection, className: string): void;
/**
 * @description Delete the className value of the argument value element
 * @param {Node|SunEditor.NodeCollection} element Elements to remove class name
 * @param {string} className Class name to be remove
 */
export function removeClass(element: Node | SunEditor.NodeCollection, className: string): void;
/**
 * @description Argument value If there is no class name, insert it and delete the class name if it exists
 * @param {Node} element Element to replace class name
 * @param {string} className Class name to be change
 * @returns {boolean|undefined}
 */
export function toggleClass(element: Node, className: string): boolean | undefined;
/**
 * @description Flash the class name of the argument value element for a certain time
 * @param {Node} element Element to flash class name
 * @param {string} className class name
 * @param {number} [duration=120] duration milliseconds
 */
export function flashClass(element: Node, className: string, duration?: number): void;
/**
 * @description Gets the size of the documentElement client size.
 * @param {Document} doc Document object
 * @returns {{w: number, h: number}} documentElement.clientWidth, documentElement.clientHeight
 */
export function getClientSize(doc?: Document): {
	w: number;
	h: number;
};
/**
 * @description Gets the size of the window visualViewport size
 * @returns {{top: number, left: number, scale: number}}
 */
export function getViewportSize(): {
	top: number;
	left: number;
	scale: number;
};
/**
 * @description Copies the "wwTarget" element and returns it with inline all styles applied.
 * @param {Node} wwTarget Target element to copy(.sun-editor.sun-editor-editable)
 * @param {boolean} includeWW Include the "wwTarget" element in the copy
 * @param {Array<string>} styles Style list - kamel case
 * @returns
 */
export function applyInlineStylesAll(wwTarget: Node, includeWW: boolean, styles: Array<string>): HTMLElement;
/**
 * @description Wait for media elements to load
 * @param {Node} target Target element
 * @param {number} timeout Timeout milliseconds
 * @returns {Promise<void>}
 */
export function waitForMediaLoad(target: Node, timeout?: number): Promise<void>;
/**
 * @description Gets a CSS variable on the root element of the editor.
 * @param {string} name - The CSS variable name (e.g. `--se-color-primary`)
 * @return {string} The value of the CSS variable
 */
export function getRootCssVar(name: string): string;
/**
 * @description Sets a CSS variable on the root element of the editor.
 * @param {string} name - The CSS variable name (e.g. `--se-color-primary`)
 * @param {string} value - The CSS variable value
 */
export function setRootCssVar(name: string, value: string): void;
/**
 * @description Create tooltip HTML
 * @param {string} text Tooltip text
 * @returns {string} Tooltip HTML
 */
export function createTooltipInner(text: string): string;
export default utils;
declare namespace utils {
	export { clone };
	export { createElement };
	export { createTextNode };
	export { getAttributesToString };
	export { arrayFilter };
	export { arrayFind };
	export { arrayIncludes };
	export { getArrayIndex };
	export { nextIndex };
	export { prevIndex };
	export { copyTagAttributes };
	export { copyFormatAttributes };
	export { removeItem };
	export { changeElement };
	export { changeTxt };
	export { setStyle };
	export { getStyle };
	export { setDisabled };
	export { hasClass };
	export { addClass };
	export { removeClass };
	export { toggleClass };
	export { flashClass };
	export { getClientSize };
	export { getViewportSize };
	export { applyInlineStylesAll };
	export { waitForMediaLoad };
	export { getRootCssVar };
	export { setRootCssVar };
	export { createTooltipInner };
}
