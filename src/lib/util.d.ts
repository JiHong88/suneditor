declare interface util {
    isIE: boolean;
    isIE_Edge: boolean;
    /**
     * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
     */
    zeroWidthSpace: string;

    /**
     * @description Regular expression to find 'zero width space' (/\u200B/g)
     */
    zeroWidthRegExp: RegExp;

    /**
     * @description Regular expression to find only 'zero width space' (/^\u200B+$/)
     */
    onlyZeroWidthRegExp: RegExp;

    /**
     * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (util.zeroWidthSpace)
     * @param text String value or Node
     * @returns
     */
    onlyZeroWidthSpace(text: string | Node): boolean;

    /**
     * @description Gets XMLHttpRequest object
     * @returns
     */
    getXMLHttpRequest(): XMLHttpRequest | ActiveXObject;

    /**
     * @description Create Element node
     * @param elementName Element name
     * @returns
     */
    createElement(elementName: string): Element;

    /**
     * @description Create text node
     * @param text text contents
     * @returns
     */
    createTextNode(text: string): Node;

    /**
     * @description The editor checks tags by string.
     * If there is "<" or ">" in the attribute of tag, HTML is broken when checking the tag.
     * When using an attribute with "<" or ">", use "HTMLEncoder" to save. (ex: math(katex))
     * @param contents HTML or Text string
     * @returns
     */
    HTMLEncoder(contents: string): string;

    /**
     * @description The editor checks tags by string.
     * If there is "<" or ">" in the attribute of tag, HTML is broken when checking the tag.
     * Decoder of data stored as "HTMLEncoder" (ex: math(katex))
     * @param contents HTML or Text string
     * @returns
     */
    HTMLDecoder(contents: string): string;

    /**
     * @description This method run Object.prototype.hasOwnProperty.call(obj, key)
     * @param obj Object
     * @param key obj.key
     * @returns
     */
    hasOwn(obj: any, key: string): boolean;

    /**
     * @description Get the the tag path of the arguments value
     * If not found, return the first found value
     * @param nameArray File name array
     * @param extension js, css
     * @returns
     */
    getIncludePath(nameArray: string[], extension: string): string;

    /**
     * @description Returns the CSS text that has been applied to the current page.
     * @param doc To get the CSS text of an document(core._wd). If null get the current document.
     * @returns Styles string
     */
    getPageStyle(doc?: Document): string;

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
     * @descriptionGets Get the length in bytes of a string.
     * referencing code: "https://github.com/shaan1974/myrdin/blob/master/expressions/string.js#L11"
     * @param text String text
     * @returns
     */
    getByteLength(text: string): number;

    /**
     * @description It is judged whether it is the edit region top div element or iframe's body tag.
     * @param element The node to check
     * @returns
     */
    isWysiwygDiv(element: Node): boolean;

    /**
     * @description It is judged whether it is the contenteditable property is false.
     * @param element The node to check
     * @returns
     */
    isNonEditable(element: Node): boolean;

    /**
     * @description It is judged whether it is a node related to the text style.
     * (strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label)
     * @param element The node to check
     * @returns
     */
    isTextStyleElement(element: Node): boolean;

    /**
     * @description It is judged whether it is the format element (P, DIV, H[1-6], PRE, LI | class="__se__format__replace_xxx")
     * Format element also contain "free format Element"
     * @param element The node to check
     * @returns
     */
    isFormatElement(element: Node): boolean;

    /**
     * @description It is judged whether it is the range format element. (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__range_xxx")
     * * Range format element is wrap the format element  (util.isFormatElement)
     * @param element The node to check
     * @returns
     */
    isRangeFormatElement(element: Node): boolean;
    
    /**
     * @description It is judged whether it is the closure range format element. (TH, TD | class="__se__format__range__closure_xxx")
     * Closure range format elements is included in the range format element.
     *  - Closure range format element is wrap the "format element" and "component"
     * ※ You cannot exit this format with the Enter key or Backspace key.
     * ※ Use it only in special cases. ([ex] format of table cells)
     * @param element The node to check
     * @returns
     */
    isClosureRangeFormatElement(element: Node): boolean;

    /**
     * @description It is judged whether it is the free format element. (PRE | class="__se__format__free_xxx")
     * Free format elements is included in the format element.
     * Free format elements's line break is "BR" tag.
     * ※ Entering the Enter key in the space on the last line ends "Free Format" and appends "Format".
     * @param element The node to check
     * @returns
     */
    isFreeFormatElement(element: Node): boolean;

    /**
     * @description It is judged whether it is the closure free format element. (class="__se__format__free__closure_xxx")
     * Closure free format elements is included in the free format element.
     *  - Closure free format elements's line break is "BR" tag.
     * ※ You cannot exit this format with the Enter key.
     * ※ Use it only in special cases. ([ex] format of table cells)
     * @param element The node to check
     * @returns
     */
    isClosureFreeFormatElement(element: Node): boolean;

    /**
     * @description It is judged whether it is the component [img, iframe, video, audio] cover(class="se-component") and table, hr
     * @param element The node to check
     * @returns
     */
    isComponent(element: Node): boolean;

    /**
     * @description Checks for "__se__uneditable" in the class list.
     * Components with class "__se__uneditable" cannot be modified.
     * @param element The node to check
     * @returns
     */
    isUneditableComponent(element: Element): boolean;

    /**
     * @description It is judged whether it is the not checking node. (class="katex", "__se__tag")
     * @param element The node to check
     * @returns
     */
    isMediaComponent(element: Node): boolean;

    /**
     * @description It is judged whether it is the component [img, iframe] cover(class="se-component")
     * @param element The node to check
     * @returns
     */
    isNotCheckingNode(element: Node): boolean;

    /**
     * @description If a parent node that contains an argument node finds a format node (util.isFormatElement), it returns that node.
     * @param element Reference node.
     * @param validation Additional validation function.
     * @returns
     */
    getFormatElement(element: Node, validation?: Function): Element | null;

    /**
     * @description If a parent node that contains an argument node finds a format node (util.isRangeFormatElement), it returns that node.
     * @param element Reference node.
     * @param validation Additional validation function.
     * @returns
     */
    getRangeFormatElement(element: Node, validation?: Function): Element | null;

    /**
     * @description If a parent node that contains an argument node finds a free format node (util.isFreeFormatElement), it returns that node.
     * @param element Reference node.
     * @param validation Additional validation function.
     * @returns
     */
    getFreeFormatElement(element: Node, validation?: Function): Element | null;

    /**
     * @description If a parent node that contains an argument node finds a closure free format node (util.isClosureFreeFormatElement), it returns that node.
     * @param element Reference node.
     * @param validation Additional validation function.
     * @returns
     */
    getClosureFreeFormatElement(element: Node, validation?: Function): Element | null;

    /**
     * @description Add style and className of copyEl to originEl
     * @param originEl Origin element
     * @param copyEl Element to copy
     */
    copyTagAttributes(originEl: Element, copyEl: Element): void;

    /**
     * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
     * @param originEl Origin element
     * @param copyEl Element to copy
     */
    copyFormatAttributes(originEl: Element, copyEl: Element): void;

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
    nextIdx(array: any[] | HTMLCollection | NodeList, item: Node): number;

    /**
     * @description Get the previous index of the argument value in the element array
     * @param array Element array
     * @param item The element to find index
     * @returns
     */
    prevIdx(array: any[] | HTMLCollection | NodeList, item: Node): number;

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
    getNodePath(node: Node, parentNode?: Node, _newOffsets?: { s: number; e: number; }): number[];

    /**
     * @description Returns the node in the location of the path array obtained from "util.getNodePath".
     * @param offsets Position array, array obtained from "util.getNodePath"
     * @param parentNode Base parent element
     * @returns
     */
    getNodeFromPath(offsets: number[], parentNode: Node): Node;

    /**
     * @description Compares the style and class for equal values.
     * Returns true if both are text nodes.
     * @param a Node to compare
     * @param b Node to compare
     * @returns
     */
    isSameAttributes(a: Node, b: Node): boolean;

    /**
     * @description Check the line element(util.isFormatElement) is empty.
     * @param {Element} element Format element node
     * @returns {Boolean}
     */
    isEmptyLine(element: Element): boolean;

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
    isCell(node: string | Node): boolean;

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
     * @description Checks for numeric (with decimal point).
     * @param text Text string or number
     * @returns
     */
    isNumber(text: string | number): boolean;

    /**
     * @description Get a number.
     * @param text Text string or number
     * @param maxDec Maximum number of decimal places (-1 : Infinity)
     * @returns
     */
    getNumber(text: string | number, maxDec: number): number;

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
    getElementDepth(element: Node): number;

    /**
     * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
     * @param a Node to compare.
     * @param b Node to compare.
     * @returns
     */
    compareElements(a: Node, b: Node): {ancestor: Element | null, a: Node, b: Node, result: number};

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
    getChildElement(element: Node, query: string | Function, last: boolean): Element;

    /**
     * @description 1. The first node of all the child nodes of the "first" element is returned.
     * 2. The last node of all the child nodes of the "last" element is returned.
     * 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
     * { sc: "first", ec: "last" }
     * @param first First element
     * @param last Last element
     * @returns
     */
    getEdgeChildNodes(first: Node, last?: Node): {sc: Node; ec: Node | null;};

    /**
     * @description Returns the position of the left and top of argument. {left:0, top:0}
     * @param element Target node
     * @param wysiwygFrame When use iframe option, iframe object should be sent (context.element.wysiwygFrame)
     * @returns
     */
    getOffset(element: Node, wysiwygFrame?: Element): Record<string, number>;

    /**
     * @description It compares the start and end indexes of "a" and "b" and returns the number of overlapping indexes in the range.
     * ex) 1, 5, 4, 6 => "2" (4 ~ 5)
     * @param aStart Start index of "a"
     * @param aEnd End index of "a"
     * @param bStart Start index of "b"
     * @param bEnd Start index of "b"
     * @returns
     */
    getOverlapRangeAtIndex(aStart: number, aEnd: number, bStart: number, bEnd: number): number;

    /**
     * @description Set the text content value of the argument value element
     * @param element Element to replace text content
     * @param txt Text to be applied
     */
    changeTxt(element: Node, txt: string): void;

    /**
     * @description Replace icon
     * @param element Target element
     * @param newElement String or element of the new element to apply
     */
    changeElement(icon: Element, newIcon: string | Element): void;

    /**
     * @description Set style, if all styles are deleted, the style properties are deleted.
     * @param element Element to set style
     * @param styleName Style attribute name (marginLeft, textAlign...)
     * @param value Style value
     */
    setStyle(element: Element, styleName: string, value: string | number): void;

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
     * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
     * core.codeViewDisabledButtons (An array of buttons whose class name is not "se-code-view-enabled")
     * core.resizingDisabledButtons (An array of buttons whose class name is not "se-resizing-enabled")
     * @param disabled Disabled value
     * @param buttonList Button array
     */
    setDisabledButtons(disabled: boolean, buttonList: Element[] | HTMLCollection | NodeList): void;

    /**
     * @description Delete argumenu value element
     * @param item Node to be remove
     */
    removeItem(item: Node): void;

    /**
     * @description Delete all parent nodes that match the condition.
     * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
     * @param item Node to be remove
     * @param validation Validation function. default(Deleted if it only have breakLine and blanks)
     * @param stopParent Stop when the parent node reaches stopParent
     * @returns
     */
    removeItemAllParents(item: Node, validation?: Function, stopParent?: Element): Record<string, Node | null> | null;
    
    /**
     * @description Detach Nested all nested lists under the "baseNode".
     * Returns a list with nested removed.
     * @param baseNode Element on which to base.
     * @param all If true, it also detach all nested lists of a returned list.
     * @returns
     */
    detachNestedList(baseNode: Node, all: boolean): Element;

    /**
     * @description Split all tags based on "baseNode"
     * Returns the last element of the splited tag.
     * @param baseNode Element or text node on which to base
     * @param offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
     * @param depth The nesting depth of the element being split. (default: 0)
     * @returns
     */
    splitElement(baseNode: Node, offset: number | null, depth: number): Element;

    /**
     * @description Use with "npdePath (util.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
     * If "offset" has been changed, it will return as much "offset" as it has been modified.
     * An array containing change offsets is returned in the order of the "nodePathArray" array.
     * @param element Element
     * @param nodePathArray Array of NodePath object ([util.getNodePath(), ..])
     * @param onlyText If true, non-text nodes(!util._isIgnoreNodeChange) like 'span', 'strong'.. are ignored.
     * @returns [offset, ..]
     */
    mergeSameTags(element: Element, nodePathArray: any[], onlyText: boolean): number[];

    /**
     * @description Remove nested tags without other child nodes.
     * @param element Element object
     * @param validation Validation function / String("tag1|tag2..") / If null, all tags are applicable.
     */
    mergeNestedTags(element: Element, validation?: string | Function): void;

    /**
     * @description Delete a empty child node of argument element
     * @param element Element node
     * @param notRemoveNode Do not remove node
     */
    removeEmptyNode(element: Element, notRemoveNode?: Node): void;

    /**
     * @description Remove whitespace between tags in HTML string.
     * @param html HTML string
     * @returns
     */
    htmlRemoveWhiteSpace(html: string): string;

    /**
     * @description Sort a element array by depth of element.
     * @param array Array object
     * @param des true: descending order / false: ascending order
     */
    sortByDepth(array: Node[], des: boolean): void;

    /**
     * @description Create whitelist RegExp object.
     * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
     * @param list Tags list ("br|p|div|pre...")
     * @returns
     */
    createTagsWhitelist(list: string): RegExp;
}

export default util;