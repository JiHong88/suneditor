class domUtils {
	/**
	 * @description Create Element node
	 * @param elementName Element name
	 * @param attributes The attributes of the tag. {style: "font-size:12px;..", class: "el_class",..}
	 * @param {string|Element|null|undefined} inner A innerHTML or inner element.
	 * @returns
	 */
	createElement(elementName: string, attributes?: Record<string, string> | null, inner?: string | Element | null): Element;

	/**
	 * @description Create text node
	 * @param text text content
	 * @returns
	 */
	createTextNode(text: string): Node;

	/**
	 * @description Get the argument iframe's document object
	 * @param iframe Iframe element (context.element.wysiwygFrame)
	 * @returns
	 */
	getIframeDocument(iframe: Element): Document;

	/**
	 * @description Get attributes of argument element to string ('class="---" name="---" ')
	 * @param element Element object
	 * @param exceptAttrs Array of attribute names to exclude from the result
	 * @returns
	 */
	getAttributesToString(element: Element, exceptAttrs?: string[]): string;

	/**
	 * @description Returns the index compared to other sibling nodes.
	 * @param node The Node to find index
	 * @returns
	 */
	getPositionIndex(node: Node): number;

	/**
	 * @description Returns the position of the "node" in the "parentNode" in a numerical array.
	 * ex) <p><span>aa</span><span>bb</span></p> : getNodePath(node: "bb", parentNode: "<P>") -> [1, 0]
	 * @param node The Node to find position path
	 * @param parentNode Parent node. If null, wysiwyg div area
	 * @param _newOffsets If you send an object of the form "{s: 0, e: 0}", the text nodes that are attached together are merged into one, centered on the "node" argument.
	 * "_newOffsets.s" stores the length of the combined characters after "node" and "_newOffsets.e" stores the length of the combined characters before "node".
	 * Do not use unless absolutely necessary.
	 * @returns
	 */
	getNodePath(node: Node, parentNode?: Node, _newOffsets?: { s: number; e: number }): number[];

	/**
	 * @description Returns the node in the location of the path array obtained from "util.getNodePath".
	 * @param offsets Position array, array obtained from "util.getNodePath"
	 * @param parentNode Base parent element
	 * @returns
	 */
	getNodeFromPath(offsets: number[], parentNode: Node): Node;

	/**
	 * @description Get all "children" of the argument value element (Without text nodes)
	 * @param element element to get child node
	 * @param validation Conditional function
	 * @returns
	 */
	getListChildren(element: Element, validation?: Function): Element[];

	/**
	 * @description Get all "childNodes" of the argument value element (Include text nodes)
	 * @param element element to get child node
	 * @param validation Conditional function
	 * @returns
	 */
	getListChildNodes(element: Node, validation?: Function): Node[];

	/**
	 * @description Returns the number of parents nodes.
	 * "0" when the parent node is the WYSIWYG area.
	 * "-1" when the element argument is the WYSIWYG area.
	 * @param element The element to check
	 * @returns
	 */
	getNodeDepth(element: Node): number;

	/**
	 * @description Sort a element array by depth of element.
	 * @param array Array object
	 * @param des true: descending order / false: ascending order
	 */
	sortNodeByDepth(array: Node[], des: boolean): void;

	/**
	 * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
	 * @param a Node to compare.
	 * @param b Node to compare.
	 * @returns
	 */
	compareElements(a: Node, b: Node): { ancestor: Element | null; a: Node; b: Node; result: number };

	/**
	 * @description Get the parent element of the argument value.
	 * A tag that satisfies the query condition is imported.
	 * Returns null if not found.
	 * @param element Reference element
	 * @param query Query String (nodeName, .className, #ID, :name) or validation function.
	 * Not use it like jquery.
	 * Only one condition can be entered at a time.
	 * @returns
	 */
	getParentElement(element: Node, query: string | Function): Element;

	/**
	 * @description Get the child element of the argument value.
	 * A tag that satisfies the query condition is imported.
	 * Returns null if not found.
	 * @param element Reference element
	 * @param query Query String (nodeName, .className, #ID, :name) or validation function.
	 * @param last If true returns the last node among the found child nodes. (default: first node)
	 * Not use it like jquery.
	 * Only one condition can be entered at a time.
	 * @returns
	 */
	getEdgeChild(element: Node, query: string | Function, last: boolean): Element;

	/**
	 * @description 1. The first node of all the child nodes of the "first" element is returned.
	 * 2. The last node of all the child nodes of the "last" element is returned.
	 * 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
	 * { sc: "first", ec: "last" }
	 * @param first First element
	 * @param last Last element
	 * @returns
	 */
	getEdgeChildNodes(first: Node, last?: Node): { sc: Node; ec: Node | null };

	/**
	 * @description Get the item from the array that matches the condition.
	 * @param array Array to get item
	 * @param validation Conditional function
	 * @param multi If true, returns all items that meet the criteria otherwise, returns an empty array.
	 * If false, returns only one item that meet the criteria otherwise return null.
	 * @returns
	 */
	getArrayItem(array: any[] | HTMLCollection | NodeList, validation: Function | null, multi: boolean): any[] | Node | null;

	/**
	 * @description Check if an array contains an element
	 * @param {Array|HTMLCollection|NodeList} array element array
	 * @param {Node} element The element to check for
	 * @returns {Boolean}
	 */
	arrayIncludes(array: any[], element: Node): boolean;

	/**
	 * @description Get the index of the argument value in the element array
	 * @param array element array
	 * @param element The element to find index
	 * @returns
	 */
	getArrayIndex(array: any[] | HTMLCollection | NodeList, element: Node): number;

	/**
	 * @description Get the next index of the argument value in the element array
	 * @param array element array
	 * @param item The element to find index
	 * @returns
	 */
	nextIndex(array: any[] | HTMLCollection | NodeList, item: Node): number;

	/**
	 * @description Add style and className of copyEl to originEl
	 * @param originEl Origin element
	 * @param copyEl Element to copy
	 */
	copyTagAttributes(originEl: Element, copyEl: Element): void;

	/**
	 * @description Compares the style and class for equal values.
	 * Returns true if both are text nodes.
	 * @param a Node to compare
	 * @param b Node to compare
	 * @returns
	 */
	isSameAttributes(a: Node, b: Node): boolean;

	/**
	 * @description Delete argumenu value element
	 * @param item Node to be remove
	 */
	remove(item: Node): void;

	/**
	 * @description Replace icon
	 * @param element Target element
	 * @param newElement String or element of the new element to apply
	 */
	changeElement(element: Element, newElement: string | Element): void;

	/**
	 * @description Set the text content value of the argument value element
	 * @param element Element to replace text content
	 * @param txt Text to be applied
	 */
	changeTxt(element: Node, txt: string): void;

	/**
	 * @description Set style, if all styles are deleted, the style properties are deleted.
	 * @param element Element to set style
	 * @param styleName Style attribute name (marginLeft, textAlign...)
	 * @param value Style value
	 */
	setStyle(element: Element, styleName: string, value: string | number): void;

	/**
	 * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
	 * core.codeViewDisabledButtons (An array of buttons whose class name is not "se-code-view-enabled")
	 * core.resizingDisabledButtons (An array of buttons whose class name is not "se-resizing-enabled")
	 * @param disabled Disabled value
	 * @param buttonList Button array
	 */
	setDisabled(disabled: boolean, buttonList: Element[] | HTMLCollection | NodeList): void;

	/**
	 * @description Determine whether any of the matched elements are assigned the given class
	 * @param element Elements to search class name
	 * @param className Class name to search for
	 * @returns
	 */
	hasClass(element: Element, className: string): boolean;

	/**
	 * @description Append the className value of the argument value element
	 * @param element Elements to add class name
	 * @param className Class name to be add
	 */
	addClass(element: Element, className: string): void;

	/**
	 * @description Delete the className value of the argument value element
	 * @param element Elements to remove class name
	 * @param className Class name to be remove
	 */
	removeClass(element: Element, className: string): void;

	/**
	 * @description Argument value If there is no class name, insert it and delete the class name if it exists
	 * @param element Elements to replace class name
	 * @param className Class name to be change
	 * @returns
	 */
	toggleClass(element: Element, className: string): boolean | undefined;

	/**
	 * @description Get the previous index of the argument value in the element array
	 * @param array Element array
	 * @param item The element to find index
	 * @returns
	 */
	prevIndex(array: any[] | HTMLCollection | NodeList, item: Node): number;

	/**
	 * @description Determine if this offset is the edge offset of container
	 * @param container The container property of the selection object.
	 * @param offset The offset property of the selection object.
	 * @param dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
	 * @returns
	 */
	isEdgePoint(container: Node, offset: number, dir?: "front" | "end"): boolean;

	/**
	 * @description It is judged whether it is the edit region top div element or iframe's body tag.
	 * @param element The node to check
	 * @returns
	 */
	isWysiwygFrame(element: Node): boolean;

	/**
	 * @description It is judged whether it is the contenteditable property is false.
	 * @param element The node to check
	 * @returns
	 */
	isNonEditable(element: Node): boolean;

	/**
	 * @description Check the node is a list (ol, ul)
	 * @param node The element or element name to check
	 * @returns
	 */
	isList(node: string | Node): boolean;

	/**
	 * @description Check the node is a list cell (li)
	 * @param node The element or element name to check
	 * @returns
	 */
	isListCell(node: string | Node): boolean;

	/**
	 * @description Check the node is a table (table, thead, tbody, tr, th, td)
	 * @param node The element or element name to check
	 * @returns
	 */
	isTable(node: string | Node): boolean;

	/**
	 * @description Check the node is a table cell (td, th)
	 * @param node The element or element name to check
	 * @returns
	 */
	isTableCell(node: string | Node): boolean;

	/**
	 * @description Check the node is a break node (BR)
	 * @param node The element or element name to check
	 * @returns
	 */
	isBreak(node: string | Node): boolean;

	/**
	 * @description Check the node is a anchor node (A)
	 * @param node The element or element name to check
	 * @returns
	 */
	isAnchor(node: string | Node): boolean;

	/**
	 * @description Check the node is a media node (img, iframe, audio, video, canvas)
	 * @param node The element or element name to check
	 * @returns
	 */
	isMedia(node: string | Node): boolean;

	/**
	 * @description Check the line element is empty.
	 * @param {Element} element Format element node
	 * @returns {boolean}
	 */
	isEmptyLine(element: Element): boolean;

	/**
	 * @description Checks for "__se__uneditable" in the class list.
	 * Components with class "__se__uneditable" cannot be modified.
	 * @param element The node to check
	 * @returns
	 */
	isUneditable(element: Element): boolean;
}

export default domUtils;
