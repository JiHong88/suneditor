import type {} from '../../typedef';
export default Controller;
/**
 * Controller information object
 */
export type ControllerInfo = {
	/**
	 * - The controller instance
	 */
	inst: any;
	/**
	 * - The controller position ("bottom"|"top")
	 */
	position?: string;
	/**
	 * - The controller element
	 */
	form?: HTMLElement;
	/**
	 * - The controller target element
	 */
	target?: HTMLElement | Range;
	/**
	 * - If the controller is not in the "carrierWrapper", set it to true.
	 */
	notInCarrier?: boolean;
	/**
	 * - If the target is a Range, set it to true.
	 */
	isRangeTarget?: boolean;
	/**
	 * - If the controller is fixed and should not be closed, set it to true.
	 */
	fixed?: boolean;
};
export type ControllerParams = {
	/**
	 * Controller position
	 */
	position?: 'top' | 'bottom';
	/**
	 * If the controller is in the WYSIWYG area, set it to true.
	 */
	isWWTarget?: boolean;
	/**
	 * Method to be called when the controller is closed.
	 */
	initMethod?: () => void;
	/**
	 * If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled.
	 */
	disabled?: boolean;
	/**
	 * The parent "controller" instance array when "controller" is opened nested.
	 */
	parents?: Array<Controller | HTMLElement>;
	/**
	 * If true, the parent element is hidden when the controller is opened.
	 */
	parentsHide?: boolean;
	/**
	 * The related sibling controller element that this controller is positioned relative to.
	 * - e.g.) table plugin :: 118
	 */
	sibling?: HTMLElement;
	/**
	 * If true, This sibling controller is the main controller.
	 * - You must specify this option, if use "sibling"
	 */
	siblingMain?: boolean;
	/**
	 * If the controller is inside a form, set it to true.
	 */
	isInsideForm?: boolean;
	/**
	 * If the controller is outside a form, set it to true.
	 */
	isOutsideForm?: boolean;
};
/**
 * Controller information object
 * @typedef {Object} ControllerInfo
 * @property {*} inst - The controller instance
 * @property {string} [position="bottom"] - The controller position ("bottom"|"top")
 * @property {HTMLElement} [form=null] - The controller element
 * @property {HTMLElement|Range} [target=null] - The controller target element
 * @property {boolean} [notInCarrier=false] - If the controller is not in the "carrierWrapper", set it to true.
 * @property {boolean} [isRangeTarget=false] - If the target is a Range, set it to true.
 * @property {boolean} [fixed=false] - If the controller is fixed and should not be closed, set it to true.
 */
/**
 * @typedef {Object} ControllerParams
 * @property {"top"|"bottom"} [position="bottom"] Controller position
 * @property {boolean} [isWWTarget=true] If the controller is in the WYSIWYG area, set it to true.
 * @property {() => void} [initMethod=null] Method to be called when the controller is closed.
 * @property {boolean} [disabled=false] If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled.
 * @property {Array<Controller|HTMLElement>} [parents=[]] The parent "controller" instance array when "controller" is opened nested.
 * @property {boolean} [parentsHide=false] If true, the parent element is hidden when the controller is opened.
 * @property {HTMLElement} [sibling=null] The related sibling controller element that this controller is positioned relative to.
 * - e.g.) table plugin :: 118
 * @property {boolean} [siblingMain=false] If true, This sibling controller is the main controller.
 * - You must specify this option, if use "sibling"
 * @property {boolean} [isInsideForm=false] If the controller is inside a form, set it to true.
 * @property {boolean} [isOutsideForm=false] If the controller is outside a form, set it to true.
 */
/**
 * @class
 * @description Controller module class that handles the UI and interaction logic for a specific editor controller element.
 */
declare class Controller extends CoreInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {Node} element Controller element
	 * @param {ControllerParams} params Controller options
	 * @param {?string} [_name] An optional name for the controller key.
	 */
	constructor(inst: any, element: Node, params: ControllerParams, _name?: string | null);
	toolbar: import('../../core/class/toolbar').default;
	subToolbar: import('../../core/class/toolbar').default;
	component: import('../../core/class/component').default;
	ui: import('../../core/class/ui').default;
	selection: import('../../core/class/selection').default;
	offset: import('../../core/class/offset').default;
	kind: any;
	inst: any;
	form: HTMLFormElement;
	isOpen: boolean;
	currentTarget: HTMLElement;
	currentPositionTarget: Node | Range;
	isWWTarget: boolean;
	position: 'bottom' | 'top';
	disabled: boolean;
	parents: (HTMLElement | Controller)[];
	parentsForm: any[];
	parentsHide: boolean;
	sibling: HTMLElement;
	siblingMain: boolean;
	isInsideForm: boolean;
	isOutsideForm: boolean;
	toTop: boolean;
	/** @type {{left?: number, top?: number, addOfffset?: {left?: number, top?: number}}} */
	__offset: {
		left?: number;
		top?: number;
		addOfffset?: {
			left?: number;
			top?: number;
		};
	};
	/**
	 * @description Open a modal plugin
	 * @param {Node|Range} target Target element
	 * @param {Node} [positionTarget] Position target element
	 * @param {Object} [params={}] params
	 * @param {boolean} [params.isWWTarget] If the controller is in the WYSIWYG area, set it to true.
	 * @param {() => void} [params.initMethod] Method to be called when the controller is closed.
	 * @param {boolean} [params.disabled] If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled. (default: this.disabled)
	 * @param {{left?: number, top?: number}} [params.addOffset] Additional offset values
	 */
	open(
		target: Node | Range,
		positionTarget?: Node,
		{
			isWWTarget,
			initMethod,
			disabled,
			addOffset,
		}?: {
			isWWTarget?: boolean;
			initMethod?: () => void;
			disabled?: boolean;
			addOffset?: {
				left?: number;
				top?: number;
			};
		},
	): void;
	/**
	 * @description Close a modal plugin
	 * - The plugin's "init" method is called.
	 * @param {boolean} [force] If true, parent controllers are forcibly closed.
	 */
	close(force?: boolean): void;
	/**
	 * @description Hide controller
	 */
	hide(): void;
	/**
	 * @description Show controller
	 */
	show(): void;
	/**
	 * @description Sets whether the element (form) should be brought to the top based on z-index.
	 * @param {boolean} value - true: '2147483646', false: '2147483645'.
	 */
	bringToTop(value: boolean): void;
	/**
	 * @description Reset controller position
	 * @param {Node} [target]
	 */
	resetPosition(target?: Node): void;
	/**
	 * @description Reposition controller on scroll event
	 * @param {boolean} isWWScroll Indicates if the scroll event is from the wysiwyg area
	 */
	_scrollReposition(isWWScroll: boolean): void;
	#private;
}
import CoreInjector from '../../editorInjector/_core';
