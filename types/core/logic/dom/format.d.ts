import type {} from '../../../typedef';
export default Format;
/**
 * @description Classes related to editor formats such as `line` and `block`.
 */
declare class Format {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Replace the line tag of the current selection.
	 * @param {Node} element Line element (P, DIV..)
	 * @example
	 * // Replace the format tag of selected lines with H1
	 * const h1 = document.createElement('h1');
	 * editor.format.setLine(h1);
	 *
	 * // Replace the format tag of selected lines with DIV
	 * const div = document.createElement('div');
	 * editor.format.setLine(div);
	 */
	setLine(element: Node): void;
	/**
	 * @description If a parent node that contains an argument node finds a format node (`format.isLine`), it returns that node.
	 * @param {Node} node Reference node.
	 * @param {?(current: Node) => boolean} [validation] Additional validation function.
	 * @returns {HTMLElement|null}
	 * @example
	 * const line = editor.$.format.getLine(editor.$.selection.getNode());
	 * const lineWithFilter = editor.$.format.getLine(node, (el) => el.nodeName !== 'LI');
	 */
	getLine(node: Node, validation?: ((current: Node) => boolean) | null): HTMLElement | null;
	/**
	 * @description Replace the br-line tag of the current selection.
	 * @param {Node} element BR-Line element (PRE..)
	 * @example
	 * editor.$.format.setBrLine(document.createElement('pre'));
	 */
	setBrLine(element: Node): void;
	/**
	 * @description If a parent node that contains an argument node finds a `brLine` (`format.isBrLine`), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {?(current: Node) => boolean} [validation] Additional validation function.
	 * @returns {HTMLBRElement|null}
	 * @example
	 * const brLine = editor.$.format.getBrLine(editor.$.selection.getNode());
	 */
	getBrLine(element: Node, validation?: ((current: Node) => boolean) | null): HTMLBRElement | null;
	/**
	 * @description Append `line` element to sibling node of argument element.
	 * - If the `lineNode` argument value is present, the tag of that argument value is inserted,
	 * - If not, the currently selected format tag is inserted.
	 * @param {Node} element Insert as siblings of that element
	 * @param {?(string|Node)} [lineNode] Node name or node obejct to be inserted
	 * @returns {HTMLElement}
	 */
	addLine(element: Node, lineNode?: (string | Node) | null): HTMLElement;
	/**
	 * @description If a parent node that contains an argument node finds a format node (`format.isBlock`), it returns that node.
	 * @param {Node} element Reference node.
	 * @param {?(current: Node) => boolean} [validation] Additional validation function.
	 * @returns {HTMLElement|null}
	 * @example
	 * const block = editor.$.format.getBlock(editor.$.selection.getNode());
	 */
	getBlock(element: Node, validation?: ((current: Node) => boolean) | null): HTMLElement | null;
	/**
	 * @description Appended all selected `line` element to the argument element(`block`) and insert
	 * @param {Node} blockElement Element of wrap the arguments (BLOCKQUOTE...)
	 * @example
	 * // Wrap selected lines in a blockquote
	 * const blockquote = document.createElement('blockquote');
	 * editor.format.applyBlock(blockquote);
	 */
	applyBlock(blockElement: Node): void;
	/**
	 * @description The elements of the `selectedFormats` array are detached from the `blockElement` element. (`LI` tags are converted to `P` tags)
	 * - When `selectedFormats` is `null`, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
	 * @param {Node} blockElement `block` element (PRE, BLOCKQUOTE, OL, UL...)
	 * @param {Object} [options] Options
	 * @param {Array<Node>} [options.selectedFormats=null] Array of `line` elements (P, DIV, LI...) to remove.
	 * - If `null`, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
	 * @param {Node} [options.newBlockElement=null] The node(`blockElement`) to replace the currently wrapped node.
	 * @param {boolean} [options.shouldDelete=false] If `true`, deleted without detached.
	 * @param {boolean} [options.skipHistory=false] When `true`, it does not update the history stack and the selection object and return `EdgeNodes` (dom-query-GetEdgeChildNodes)
	 * @returns {{cc: Node, sc: Node, so: number, ec: Node, eo: number, removeArray: ?Array<Node>}} Node information after deletion
	 * - cc: Common parent container node
	 * - sc: Start container node
	 * - so: Start offset
	 * - ec: End container node
	 * - eo: End offset
	 * - removeArray: Array of removed elements
	 * @example
	 * // Remove all list items from a list
	 * const listElement = editor.selection.getNode().closest('ul');
	 * editor.format.removeBlock(listElement);
	 *
	 * // Remove specific list items only
	 * const selectedItems = [liElement1, liElement2];
	 * editor.format.removeBlock(listElement, { selectedFormats: selectedItems });
	 *
	 * // Replace blockquote with div
	 * const blockquote = editor.selection.getNode().closest('blockquote');
	 * const newDiv = document.createElement('div');
	 * editor.format.removeBlock(blockquote, { newBlockElement: newDiv });
	 */
	removeBlock(
		blockElement: Node,
		{
			selectedFormats,
			newBlockElement,
			shouldDelete,
			skipHistory,
		}?: {
			selectedFormats?: Array<Node>;
			newBlockElement?: Node;
			shouldDelete?: boolean;
			skipHistory?: boolean;
		},
	): {
		cc: Node;
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
		removeArray: Array<Node> | null;
	};
	/**
	 * @description Indent more the selected lines.
	 * - margin size : `store.get('indentSize')`
	 */
	indent(): void;
	/**
	 * @description Indent less the selected lines.
	 * - margin size - `store.get('indentSize')`
	 */
	outdent(): void;
	/**
	 * @description Check if the container and offset values are the edges of the `line`
	 * @param {Node} node The node of the selection object. (range.startContainer..)
	 * @param {number} offset The offset of the selection object. (selection.getRange().startOffset...)
	 * @param {"front"|"end"} dir Select check point - `front`: Front edge, `end`: End edge, `undefined`: Both edge.
	 * @returns {node is HTMLElement}
	 */
	isEdgeLine(node: Node, offset: number, dir: 'front' | 'end'): node is HTMLElement;
	/**
	 * @description It is judged whether it is a node related to the text style.
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 * @example
	 * editor.$.format.isTextStyleNode('STRONG'); // true
	 * editor.$.format.isTextStyleNode('P'); // false
	 */
	isTextStyleNode(element: Node | string): element is HTMLElement;
	/**
	 * @description It is judged whether it is the `line` element.
	 * - (P, DIV, H[1-6], PRE, LI | class=`__se__format__line_xxx`)
	 * - `line` element also contain `brLine` element
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 * @example
	 * editor.$.format.isLine(document.createElement('p')); // true
	 * editor.$.format.isLine('SPAN'); // false
	 */
	isLine(element: Node | string): element is HTMLElement;
	/**
	 * @description It is judged whether it is the only `line` element.
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isNormalLine(element: Node | string): element is HTMLElement;
	/**
	 * @description It is judged whether it is the `brLine` element.
	 * - (PRE | class=`__se__format__br_line_xxx`)
	 * - `brLine` elements is included in the `line` element.
	 * - `brLine` elements's line break is `BR` tag.
	 * ※ Entering the Enter key in the space on the last line ends `brLine` and appends `line`.
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 * @example
	 * editor.$.format.isBrLine(document.createElement('pre')); // true
	 */
	isBrLine(element: Node | string): element is HTMLElement;
	/**
	 * @description It is judged whether it is the `block` element.
	 * - (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class=`__se__format__block_xxx`)
	 * - `block` is wrap the `line` and `component`
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 * @example
	 * editor.$.format.isBlock(document.createElement('blockquote')); // true
	 * editor.$.format.isBlock(document.createElement('ul')); // true
	 */
	isBlock(element: Node | string): element is HTMLElement;
	/**
	 * @description It is judged whether it is the `closureBlock` element.
	 * - (TH, TD | class=`__se__format__block_closure_xxx`)
	 * - `closureBlock` elements is included in the `block`.
	 * - `closureBlock` element is wrap the `line` and `component`
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isClosureBlock(element: Node | string): element is HTMLElement;
	/**
	 * @description It is judged whether it is the `closureBrLine` element.
	 * - (class=`__se__format__br_line__closure_xxx`)
	 * - `closureBrLine` elements is included in the `brLine`.
	 * - `closureBrLine` elements's line break is `BR` tag.
	 * - ※ You cannot exit this format with the Enter key or Backspace key.
	 * - ※ Use it only in special cases. ([ex] format of table cells)
	 * @param {Node|string} element The node to check
	 * @returns {element is HTMLElement}
	 */
	isClosureBrLine(element: Node | string): element is HTMLElement;
	/**
	 * @description Returns a `line` array from selected range.
	 * @param {?(current: Node) => boolean} [validation] The validation function. (Replaces the default validation `format.isLine(current)`)
	 * @returns {Array<HTMLElement>}
	 * @example
	 * const selectedLines = editor.$.format.getLines();
	 */
	getLines(validation?: ((current: Node) => boolean) | null): Array<HTMLElement>;
	/**
	 * @description Get lines and components from the selected range. (P, DIV, H[1-6], OL, UL, TABLE..)
	 * - If some of the component are included in the selection, get the entire that component.
	 * @param {boolean} removeDuplicate If `true`, if there is a parent and child tag among the selected elements, the child tag is excluded.
	 * @returns {Array<HTMLElement>}
	 */
	getLinesAndComponents(removeDuplicate: boolean): Array<HTMLElement>;
	/**
	 * @internal
	 * @description Nodes without text
	 * @param {Node|string} element Element to check
	 * @returns {boolean}
	 */
	_isNotTextNode(element: Node | string): boolean;
	/**
	 * @internal
	 * @description A function that distinguishes areas where `selection` should not be placed
	 * @param {Node} element Element
	 * @returns {boolean}
	 */
	_isExcludeSelectionElement(element: Node): boolean;
	/**
	 * @internal
	 * @description Reset the line break format.
	 * @param {"line"|"br"} breakFormat `options.get('defaultLineBreakFormat')`
	 * @returns {boolean}
	 */
	__resetBrLineBreak(breakFormat: 'line' | 'br'): boolean;
	#private;
}
