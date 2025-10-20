import type {} from '../typedef';
export default Figure;
export type FigureParams = {
	/**
	 * Size unit
	 */
	sizeUnit?: string;
	/**
	 * Auto ratio { current: '00%', default: '00%' }
	 */
	autoRatio?: {
		current: string;
		default: string;
	};
};
export type FigureInfo = {
	/**
	 * Target element (img, iframe, video, audio, table, etc.)
	 */
	target: HTMLElement;
	/**
	 * Container element (div.se-component|span.se-component.se-inline-component)
	 */
	container: HTMLElement;
	/**
	 * Cover element (FIGURE|null)
	 */
	cover: HTMLElement | null;
	/**
	 * Inline cover element (span.se-inline-component)
	 */
	inlineCover: HTMLElement | null;
	/**
	 * Caption element (FIGCAPTION)
	 */
	caption: HTMLElement | null;
	/**
	 * Whether to rotate vertically
	 */
	isVertical: boolean;
};
export type FigureTargetInfo = {
	/**
	 * Container element (div.se-component|span.se-component.se-inline-component)
	 */
	container: HTMLElement;
	/**
	 * Cover element (FIGURE|null)
	 */
	cover?: (HTMLElement | null) | undefined;
	/**
	 * Caption element (FIGCAPTION)
	 */
	caption?: (HTMLElement | null) | undefined;
	/**
	 * - Alignment of the element.
	 */
	align?: string;
	/**
	 * - The aspect ratio of the element.
	 */
	ratio?: {
		w: number;
		h: number;
	};
	/**
	 * Whether to rotate vertically
	 */
	isVertical: boolean;
	/**
	 * - Width of the element.
	 */
	w?: string | number;
	/**
	 * - Height of the element.
	 */
	h?: string | number;
	/**
	 * - Top position.
	 */
	t?: number;
	/**
	 * - Left position.
	 */
	l?: number;
	/**
	 * - Width, can be a number or 'auto'.
	 */
	width: string | number;
	/**
	 * - Height, can be a number or 'auto'.
	 */
	height: string | number;
	/**
	 * - Original width from `naturalWidth` or `offsetWidth`.
	 */
	originWidth?: number;
	/**
	 * - Original height from `naturalHeight` or `offsetHeight`.
	 */
	originHeight?: number;
};
/**
 * "mirror". "rotate", "caption", "revert", "edit", "copy", "remove", "as", "resize_auto,[number]"
 */
export type FigureControls = Array<
	Array<
		| string
		| {
				action: (element: Node, value: string, target: Node) => void;
				command: string;
				value: string;
				title: string;
				icon: string;
		  }
	>
>;
/**
 * @typedef {Object} FigureParams
 * @property {string} [sizeUnit="px"] Size unit
 * @property {{ current: string, default: string }} [autoRatio=null] Auto ratio { current: '00%', default: '00%' }
 */
/**
 * @typedef {Object} FigureInfo
 * @property {HTMLElement} target Target element (img, iframe, video, audio, table, etc.)
 * @property {HTMLElement} container Container element (div.se-component|span.se-component.se-inline-component)
 * @property {?HTMLElement} cover Cover element (FIGURE|null)
 * @property {?HTMLElement} inlineCover Inline cover element (span.se-inline-component)
 * @property {?HTMLElement} caption Caption element (FIGCAPTION)
 * @property {boolean} isVertical Whether to rotate vertically
 */
/**
 * @typedef {Object} FigureTargetInfo
 * @property {HTMLElement} container Container element (div.se-component|span.se-component.se-inline-component)
 * @property {?HTMLElement=} cover Cover element (FIGURE|null)
 * @property {?HTMLElement=} caption Caption element (FIGCAPTION)
 * @property {string} [align] - Alignment of the element.
 * @property {{w:number, h:number}} [ratio] - The aspect ratio of the element.
 * @property {boolean} isVertical Whether to rotate vertically
 * @property {string|number} [w] - Width of the element.
 * @property {string|number} [h] - Height of the element.
 * @property {number} [t] - Top position.
 * @property {number} [l] - Left position.
 * @property {string|number} width - Width, can be a number or 'auto'.
 * @property {string|number} height - Height, can be a number or 'auto'.
 * @property {number} [originWidth] - Original width from `naturalWidth` or `offsetWidth`.
 * @property {number} [originHeight] - Original height from `naturalHeight` or `offsetHeight`.
 */
/**
 * @typedef {Array<Array<
 *   string |
 *   {
 *     action: (element: Node, value: string, target: Node) => void,
 *     command: string,
 *     value: string,
 *     title: string,
 *     icon: string
 *   }
 * >>} FigureControls
 * "mirror". "rotate", "caption", "revert", "edit", "copy", "remove", "as", "resize_auto,[number]"
 */
/**
 * @class
 * @description Controller module class
 */
declare class Figure extends CoreInjector {
	/**
	 * @description Create a container for the resizing component and insert the element.
	 * @param {Node} element Target element
	 * @param {string=} className Class name of container (fixed: se-component)
	 * @returns {FigureInfo} {target, container, cover, inlineCover, caption}
	 */
	static CreateContainer(element: Node, className?: string | undefined): FigureInfo;
	/**
	 * @description Create a container for the inline resizing component and insert the element.
	 * @param {Node} element Target element
	 * @param {string} [className] Class name of container (fixed: se-component se-inline-component)
	 * @returns {FigureInfo} {target, container, cover, inlineCover, caption}
	 */
	static CreateInlineContainer(element: Node, className?: string): FigureInfo;
	/**
	 * @description Return HTML string of caption(FIGCAPTION) element
	 * @param {Node} cover Cover element(FIGURE). "CreateContainer().cover"
	 * @returns {HTMLElement} caption element
	 */
	static CreateCaption(cover: Node, text: any): HTMLElement;
	/**
	 * @description Get the element's container(.se-component) info.
	 * @param {Node} element Target element
	 * @returns {FigureInfo} {target, container, cover, inlineCover, caption}
	 */
	static GetContainer(element: Node): FigureInfo;
	/**
	 * @description Ratio calculation
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 * @param {?string=} [defaultSizeUnit="px"] Default size unit (default: "px")
	 * @return {{w: number, h: number}}
	 */
	static GetRatio(
		w: string | number,
		h: string | number,
		defaultSizeUnit?: (string | null) | undefined
	): {
		w: number;
		h: number;
	};
	/**
	 * @description Ratio calculation
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 * @param {string} defaultSizeUnit Default size unit (default: "px")
	 * @param {?{w: number, h: number}=} ratio Ratio size (Figure.GetRatio)
	 * @return {{w: string|number, h: string|number}}
	 */
	static CalcRatio(
		w: string | number,
		h: string | number,
		defaultSizeUnit: string,
		ratio?:
			| ({
					w: number;
					h: number;
			  } | null)
			| undefined
	): {
		w: string | number;
		h: string | number;
	};
	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element Target element
	 * @returns {boolean}
	 */
	static is(element: Node): boolean;
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {FigureControls} controls Controller button array
	 * @param {FigureParams} params Figure options
	 */
	constructor(inst: any, controls: FigureControls, params: FigureParams);
	kind: any;
	_alignIcons: {
		none: string;
		left: string;
		right: string;
		center: string;
	};
	component: import('../core/class/component').default;
	ui: import('../core/class/ui').default;
	offset: import('../core/class/offset').default;
	selection: import('../core/class/selection').default;
	html: import('../core/class/html').default;
	format: import('../core/class/format').default;
	nodeTransform: import('../core/class/nodeTransform').default;
	/** @type {Object<string, *>} */
	_action: {
		[x: string]: any;
	};
	controller: Controller;
	alignButton: Element;
	selectMenu_align: SelectMenu;
	asButton: Element;
	selectMenu_as: SelectMenu;
	resizeButton: Element;
	selectMenu_resize: SelectMenu;
	inst: any;
	sizeUnit: string;
	autoRatio: {
		current: string;
		default: string;
	};
	isVertical: boolean;
	percentageButtons: NodeListOf<Element>;
	captionButton: Element;
	align: string;
	as: string;
	/** @type {{left?: number, top?: number}} */
	__offset: {
		left?: number;
		top?: number;
	};
	_element: HTMLElement;
	_cover: HTMLElement;
	_inlineCover: HTMLElement;
	_container: HTMLElement;
	_caption: any;
	_resizeClientX: number;
	_resizeClientY: number;
	_resize_direction: string;
	__containerResizingOff: any;
	__containerResizing: any;
	__onContainerEvent: any;
	__offContainerEvent: any;
	/**
	 * @description Close the figure's controller
	 */
	close(): void;
	/**
	 * @description Open the figure's controller
	 * @param {Node} targetNode Target element
	 * @param {Object} params params
	 * @param {boolean} [params.nonResizing=false] Do not display the resizing button
	 * @param {boolean} [params.nonSizeInfo=false] Do not display the size information
	 * @param {boolean} [params.nonBorder=false] Do not display the selected style line
	 * @param {boolean} [params.figureTarget=false] If true, the target is a figure element
	 * @param {boolean} [params.infoOnly=false] If true, returns only the figure target info without opening the controller
	 * @returns {FigureTargetInfo|undefined} figure target info
	 */
	open(
		targetNode: Node,
		{
			nonResizing,
			nonSizeInfo,
			nonBorder,
			figureTarget,
			infoOnly
		}: {
			nonResizing?: boolean;
			nonSizeInfo?: boolean;
			nonBorder?: boolean;
			figureTarget?: boolean;
			infoOnly?: boolean;
		}
	): FigureTargetInfo | undefined;
	/**
	 * @description Hide the controller
	 */
	controllerHide(): void;
	/**
	 * @description Hide the controller
	 */
	controllerShow(): void;
	/**
	 * @description Open the figure's controller
	 * @param {Node} target Target element
	 * @param {Object} [params={}] params
	 * @param {boolean=} params.isWWTarget If the controller is in the WYSIWYG area, set it to true.
	 * @param {() => void=} params.initMethod Method to be called when the controller is closed.
	 * @param {boolean=} params.disabled If true, the controller is disabled.
	 * @param {{left: number, top: number}=} params.addOffset Additional offset values
	 */
	controllerOpen(
		target: Node,
		params?: {
			isWWTarget?: boolean | undefined;
			initMethod?: (() => void) | undefined;
			disabled?: boolean | undefined;
			addOffset?:
				| {
						left: number;
						top: number;
				  }
				| undefined;
		}
	): void;
	/**
	 * @description Set the element's container size
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 */
	setFigureSize(w: string | number, h: string | number): void;
	/**
	 * @description Set the element's container size from plugins input value
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 */
	setSize(w: string | number, h: string | number): void;
	/**
	 * @description Gets the Figure size
	 * @param {?Node=} targetNode Target element, default is the current element
	 * @returns {{w: string, h: string, dw: string, dh: string}}
	 */
	getSize(targetNode?: (Node | null) | undefined): {
		w: string;
		h: string;
		dw: string;
		dh: string;
	};
	/**
	 * @description Align the container.
	 * @param {?Node} targetNode Target element
	 * @param {string} align "none"|"left"|"center"|"right"
	 */
	setAlign(targetNode: Node | null, align: string): void;
	/**
	 * @description As style[block, inline] the component
	 * @param {?Node} targetNode Target element
	 * @param {"block"|"inline"} formatStyle Format style
	 * @returns {HTMLElement} New target element after conversion
	 */
	convertAsFormat(targetNode: Node | null, formatStyle: 'block' | 'inline'): HTMLElement;
	/**
	 * @description Controller button action
	 * @param {HTMLButtonElement} target Target button element
	 * @returns
	 */
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @description Inspect the figure component format and change it to the correct format.
	 * @param {Node} container - The container element of the figure component.
	 * @param {Node} originEl - The original element of the figure component.
	 * @param {Node} anchorCover - The anchor cover element of the figure component.
	 * @param {import('./FileManager').default} [fileManagerInst=null] - FileManager module instance, if used.
	 */
	retainFigureFormat(container: Node, originEl: Node, anchorCover: Node, fileManagerInst?: import('./FileManager').default): void;
	/**
	 * @description Initialize the transform style (rotation) of the element.
	 * @param {?Node=} node Target element, default is the current element
	 */
	deleteTransform(node?: (Node | null) | undefined): void;
	/**
	 * @description Set the transform style (rotation) of the element.
	 * @param {Node} node Target element
	 * @param {?string|number} width Element's width size
	 * @param {?string|number} height Element's height size
	 * @param {?number} deg rotate value
	 */
	setTransform(node: Node, width: (string | number) | null, height: (string | number) | null, deg: number | null): void;
	/**
	 * @private
	 * @description Displays or hides the resize handles of the figure component.
	 * @param {boolean} display Whether to display resize handles.
	 */
	private _displayResizeHandles;
	/**
	 * @private
	 * @description Handles format conversion (block/inline) for the figure component and applies size changes.
	 * @param {FigureInfo} figureinfo {target, container, cover, inlineCover, caption}
	 * @param {string|number} w Width value.
	 * @param {string|number} h Height value.
	 */
	private _asFormatChange;
	/**
	 * @private
	 * @description Sets figure component properties such as cover, container, caption, and alignment.
	 * @param {FigureInfo} figureInfo - {target, container, cover, inlineCover, caption, isVertical}
	 */
	private _setFigureInfo;
	/**
	 * @private
	 * @description Applies rotation transformation to the target element.
	 * @param {HTMLElement} element Target element.
	 * @param {number} r Rotation degree.
	 * @param {number} x X-axis rotation value.
	 * @param {number} y Y-axis rotation value.
	 */
	private _setRotate;
	/**
	 * @private
	 * @description Applies size adjustments to the figure element.
	 * @param {string|number} w Width value.
	 * @param {string|number} h Height value.
	 * @param {string} direction Resize direction.
	 */
	private _applySize;
	/**
	 * @private
	 * @description Sets padding-bottom for cover elements based on width and height.
	 * @param {string} w Width value.
	 * @param {string} h Height value.
	 */
	private __setCoverPaddingBottom;
	/**
	 * @private
	 * @description Sets the figure element to its auto size.
	 */
	private _setAutoSize;
	/**
	 * @private
	 * @description Sets the figure element's size in percentage.
	 * @param {string|number} w Width percentage.
	 * @param {string|number} h Height percentage.
	 */
	private _setPercentSize;
	/**
	 * @private
	 * @description Deletes percentage-based sizing from the figure element.
	 */
	private _deletePercentSize;
	/**
	 * @private
	 * @description Reverts the figure element to its previously saved size.
	 */
	private _setRevert;
	/**
	 * @private
	 * @description Updates the figure's alignment icon.
	 */
	private _setAlignIcon;
	/**
	 * @private
	 * @description Updates the figure's block/inline format icon.
	 */
	private _setAsIcon;
	/**
	 * @private
	 * @description Saves the current size of the figure component.
	 */
	private _saveCurrentSize;
	/**
	 * @private
	 * @description Adjusts the position of the caption within the figure.
	 * @param {HTMLElement} element Target element.
	 */
	private _setCaptionPosition;
	/**
	 * @private
	 * @description Removes the margin top property from the figure caption.
	 * @param {HTMLElement} element Target element.
	 */
	private _deleteCaptionPosition;
	/**
	 * @private
	 * @description Removes the resize event listeners.
	 */
	private _offResizeEvent;
	/**
	 * @private
	 * @description Sets up drag event handling for the figure component.
	 * @param {Node} figureMain The main figure container element.
	 */
	private _setDragEvent;
	#private;
}
import CoreInjector from '../editorInjector/_core';
import Controller from './Controller';
import SelectMenu from './SelectMenu';
