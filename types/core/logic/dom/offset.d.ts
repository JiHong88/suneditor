import type {} from '../../../typedef';
export default Offset;
/**
 * Bounding rectangle information of the selection range.
 */
export type RectsInfo = {
	/**
	 * - The left position of the selection.
	 */
	left: number;
	/**
	 * - The right position of the selection.
	 */
	right: number;
	/**
	 * - The top position of the selection.
	 */
	top: number;
	/**
	 * - The bottom position of the selection.
	 */
	bottom: number;
	/**
	 * - Whether the selection contains text.
	 */
	noText?: boolean;
	/**
	 * - The width of the selection.
	 */
	width?: number;
	/**
	 * - The height of the selection.
	 */
	height?: number;
};
export type OffsetInfo = {
	/**
	 * - The top position of the node relative to the entire document, including iframe offsets.
	 */
	top: number;
	/**
	 * - The left position of the node relative to the entire document, including iframe offsets.
	 */
	left: number;
};
export type OffsetLocalInfo = {
	/**
	 * - The top position of the node relative to the WYSIWYG editor.
	 */
	top: number;
	/**
	 * - The left position of the node relative to the WYSIWYG editor.
	 */
	left: number;
	/**
	 * - The right position of the node relative to the WYSIWYG editor.
	 */
	right: number;
	/**
	 * - The horizontal scroll offset inside the WYSIWYG editor.
	 */
	scrollX: number;
	/**
	 * - The vertical scroll offset inside the WYSIWYG editor.
	 */
	scrollY: number;
	/**
	 * - The vertical scroll height inside the WYSIWYG editor.
	 */
	scrollH: number;
};
export type OffsetGlobalInfo = {
	/**
	 * - The top position of the element relative to the entire document.
	 */
	top: number;
	/**
	 * - The left position of the element relative to the entire document.
	 */
	left: number;
	/**
	 * - The top position within the current viewport, without taking scrolling into account.
	 */
	fixedTop: number;
	/**
	 * - The left position within the current viewport, without taking scrolling into account.
	 */
	fixedLeft: number;
	/**
	 * - The total width of the element, including its content, padding, and border.
	 */
	width: number;
	/**
	 * - The total height of the element, including its content, padding, and border.
	 */
	height: number;
};
export type OffsetGlobalScrollInfo = {
	/**
	 * - Total top scroll distance
	 */
	top: number;
	/**
	 * - Total left scroll distance
	 */
	left: number;
	/**
	 * - Total width including scrollable area
	 */
	width: number;
	/**
	 * - Total height including scrollable area
	 */
	height: number;
	/**
	 * - Horizontal offset from the top reference element
	 */
	x: number;
	/**
	 * - Vertical offset from the top reference element
	 */
	y: number;
	/**
	 * - Element or window used as the vertical scroll reference
	 */
	ohOffsetEl: HTMLElement | Window | null;
	/**
	 * - Element or window used as the horizontal scroll reference
	 */
	owOffsetEl: HTMLElement | Window | null;
	/**
	 * - Height of the vertical scrollable area (clientHeight)
	 */
	oh: number;
	/**
	 * - Width of the horizontal scrollable area (clientWidth)
	 */
	ow: number;
	/**
	 * - Indicates if the vertical scroll reference is the editor area
	 */
	heightEditorRefer: boolean;
	/**
	 * - Indicates if the horizontal scroll reference is the editor area
	 */
	widthEditorRefer: boolean;
	/**
	 * - Top position of the height offset element relative to the viewport
	 */
	ts: number;
	/**
	 * - Left position of the width offset element relative to the viewport
	 */
	ls: number;
};
export type OffsetWWScrollInfo = {
	/**
	 * - The top scroll offset inside the WYSIWYG editor.
	 */
	top: number;
	/**
	 * - The left scroll offset inside the WYSIWYG editor.
	 */
	left: number;
	/**
	 * - The total width of the WYSIWYG editor's scrollable area.
	 */
	width: number;
	/**
	 * - The total height of the WYSIWYG editor's scrollable area.
	 */
	height: number;
	/**
	 * - The sum of `top` and `height`, representing the bottom-most scrollable position.
	 */
	bottom: number;
};
/**
 * @typedef {Object} RectsInfo Bounding rectangle information of the selection range.
 * @property {number} rects.left - The left position of the selection.
 * @property {number} rects.right - The right position of the selection.
 * @property {number} rects.top - The top position of the selection.
 * @property {number} rects.bottom - The bottom position of the selection.
 * @property {boolean} [rects.noText] - Whether the selection contains text.
 * @property {number} [rects.width] - The width of the selection.
 * @property {number} [rects.height] - The height of the selection.
 */
/**
 * @typedef {Object} OffsetInfo
 * @property {number} top - The top position of the node relative to the entire document, including iframe offsets.
 * @property {number} left - The left position of the node relative to the entire document, including iframe offsets.
 */
/**
 * @typedef {Object} OffsetLocalInfo
 * @property {number} top - The top position of the node relative to the WYSIWYG editor.
 * @property {number} left - The left position of the node relative to the WYSIWYG editor.
 * @property {number} right - The right position of the node relative to the WYSIWYG editor.
 * @property {number} scrollX - The horizontal scroll offset inside the WYSIWYG editor.
 * @property {number} scrollY - The vertical scroll offset inside the WYSIWYG editor.
 * @property {number} scrollH - The vertical scroll height inside the WYSIWYG editor.
 */
/**
 * @typedef {Object} OffsetGlobalInfo
 * @property {number} top - The top position of the element relative to the entire document.
 * @property {number} left - The left position of the element relative to the entire document.
 * @property {number} fixedTop - The top position within the current viewport, without taking scrolling into account.
 * @property {number} fixedLeft - The left position within the current viewport, without taking scrolling into account.
 * @property {number} width - The total width of the element, including its content, padding, and border.
 * @property {number} height - The total height of the element, including its content, padding, and border.
 */
/**
 * @typedef {Object} OffsetGlobalScrollInfo
 * @property {number} top - Total top scroll distance
 * @property {number} left - Total left scroll distance
 * @property {number} width - Total width including scrollable area
 * @property {number} height - Total height including scrollable area
 * @property {number} x - Horizontal offset from the top reference element
 * @property {number} y - Vertical offset from the top reference element
 * @property {HTMLElement|Window|null} ohOffsetEl - Element or window used as the vertical scroll reference
 * @property {HTMLElement|Window|null} owOffsetEl - Element or window used as the horizontal scroll reference
 * @property {number} oh - Height of the vertical scrollable area (clientHeight)
 * @property {number} ow - Width of the horizontal scrollable area (clientWidth)
 * @property {boolean} heightEditorRefer - Indicates if the vertical scroll reference is the editor area
 * @property {boolean} widthEditorRefer - Indicates if the horizontal scroll reference is the editor area
 * @property {number} ts - Top position of the height offset element relative to the viewport
 * @property {number} ls - Left position of the width offset element relative to the viewport
 */
/**
 * @typedef {Object} OffsetWWScrollInfo
 * @property {number} top - The top scroll offset inside the WYSIWYG editor.
 * @property {number} left - The left scroll offset inside the WYSIWYG editor.
 * @property {number} width - The total width of the WYSIWYG editor's scrollable area.
 * @property {number} height - The total height of the WYSIWYG editor's scrollable area.
 * @property {number} bottom - The sum of `top` and `height`, representing the bottom-most scrollable position.
 */
/**
 * @description Offset class, get the position of the element
 */
declare class Offset {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Gets the position just outside the argument's internal editor (wysiwygFrame).
	 * @param {Node} node Target node.
	 * @returns {OffsetInfo} Position relative to the editor frame.
	 */
	get(node: Node): OffsetInfo;
	/**
	 * @description Gets the position inside the internal editor of the argument.
	 * @param {Node} node Target node.
	 * @returns {OffsetLocalInfo} Position relative to the WYSIWYG editor.
	 */
	getLocal(node: Node): OffsetLocalInfo;
	/**
	 * @description Returns the position of the argument relative to the global document.
	 * This is a refactored version using getBoundingClientRect for better performance and accuracy.
	 * @param {?Node} [node] Target element.
	 * @returns {OffsetGlobalInfo} Global position and scroll values.
	 */
	getGlobal(node?: Node | null): OffsetGlobalInfo;
	/**
	 * @deprecated
	 * @description Gets the current editor-relative scroll offset.
	 * @param {?Node} [node] Target element.
	 * @returns {OffsetGlobalScrollInfo} Global scroll information.
	 */
	getGlobalScroll(node?: Node | null): OffsetGlobalScrollInfo;
	/**
	 * @description Get the scroll info of the WYSIWYG area.
	 * @returns {OffsetWWScrollInfo} Scroll information within the editor.
	 */
	getWWScroll(): OffsetWWScrollInfo;
	/**
	 * @description Sets the relative position of an element
	 * @param {HTMLElement} element Element to position
	 * @param {HTMLElement} e_container Element's root container
	 * @param {HTMLElement} target Target element to position against
	 * @param {HTMLElement} t_container Target's root container
	 * @param {Object} [opts] Options
	 * @param {boolean} [opts.preferUp=false] Open upward by default (for bottom toolbar)
	 */
	setRelPosition(
		element: HTMLElement,
		e_container: HTMLElement,
		target: HTMLElement,
		t_container: HTMLElement,
		{
			preferUp,
		}?: {
			preferUp?: boolean;
		},
	): void;
	/**
	 * @description Sets the absolute position of an element
	 * @param {HTMLElement} element Element to position
	 * @param {HTMLElement} target Target element
	 * @param {Object} params Position parameters
	 * @param {boolean} [params.isWWTarget=false] Whether the target is within the editor's WYSIWYG area
	 * @param {{left:number, right:number, top:number}} [params.addOffset={left:0, right:0, top:0}] Additional offset
	 * @param {"bottom"|"top"} [params.position="bottom"] Position ('bottom'|'top')
	 * @param {*} params.inst Instance object of caller
	 * @param {HTMLElement} [params.sibling=null] The sibling controller element
	 * @returns {{position: "top" | "bottom"} | undefined} Success -> {position: current position}
	 * @example
	 * const result = editor.$.offset.setAbsPosition(controller, targetElement, {
	 *   position: 'bottom', inst: this, addOffset: { left: 0, right: 0, top: 0 }
	 * });
	 */
	setAbsPosition(
		element: HTMLElement,
		target: HTMLElement,
		params: {
			isWWTarget?: boolean;
			addOffset?: {
				left: number;
				right: number;
				top: number;
			};
			position?: 'bottom' | 'top';
			inst: any;
			sibling?: HTMLElement;
		},
	):
		| {
				position: 'top' | 'bottom';
		  }
		| undefined;
	/**
	 * @description Sets the position of an element relative to a range
	 * @param {HTMLElement} element Element to position
	 * @param {?Range} range Range to position against.
	 * - if `null`, the current selection range is used
	 * @param {Object} [options={}] Position options
	 * @param {"bottom"|"top"} [options.position="bottom"] Position ('bottom'|'top')
	 * @param {number} [options.addTop=0] Additional top offset
	 * @returns {boolean} Success / Failure
	 * @example
	 * const success = editor.$.offset.setRangePosition(toolbar, null, { position: 'bottom', addTop: 0 });
	 * if (!success) toolbar.style.display = 'none';
	 */
	setRangePosition(
		element: HTMLElement,
		range: Range | null,
		{
			position,
			addTop,
		}?: {
			position?: 'bottom' | 'top';
			addTop?: number;
		},
	): boolean;
	#private;
}
