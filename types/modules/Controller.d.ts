export default Controller;
export type ControllerInfo = {
	/**
	 * The controller instance
	 */
	inst: any;
	/**
	 * The controller position ("bottom"|"top")
	 */
	position?: string;
	/**
	 * The controller element
	 */
	form?: HTMLElement;
	/**
	 * The controller target element
	 */
	target?: HTMLElement | Range;
	/**
	 * If the controller is not in the "carrierWrapper", set it to true.
	 */
	notInCarrier?: boolean;
	/**
	 * If the target is a Range, set it to true.
	 */
	isRangeTarget?: boolean;
	/**
	 * If the controller is fixed and should not be closed, set it to true.
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
	isWWTarget?: boolean | undefined;
	/**
	 * Method to be called when the controller is closed.
	 */
	initMethod?: (() => void) | undefined;
	/**
	 * If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled.
	 */
	disabled?: boolean | undefined;
	/**
	 * The parent "controller" array when "controller" is opened nested.
	 */
	parents?: Array<HTMLElement> | undefined;
	/**
	 * If true, the parent element is hidden when the controller is opened.
	 */
	parentsHide?: boolean | undefined;
	/**
	 * If the controller is inside a form, set it to true.
	 */
	isInsideForm?: boolean | undefined;
	/**
	 * If the controller is outside a form, set it to true.
	 */
	isOutsideForm?: boolean | undefined;
};
/**
 * @typedef {Object} ControllerInfo
 * @property {*} inst The controller instance
 * @property {string} [position="bottom"] The controller position ("bottom"|"top")
 * @property {HTMLElement} [form=null] The controller element
 * @property {HTMLElement|Range} [target=null] The controller target element
 * @property {boolean} [notInCarrier=false] If the controller is not in the "carrierWrapper", set it to true.
 * @property {boolean} [isRangeTarget=false] If the target is a Range, set it to true.
 * @property {boolean} [fixed=false] If the controller is fixed and should not be closed, set it to true.
 */
/**
 * @typedef {Object} ControllerParams
 * @property {"top"|"bottom"} [position="bottom"] Controller position
 * @property {boolean=} [isWWTarget=true] If the controller is in the WYSIWYG area, set it to true.
 * @property {() => void=} [initMethod=null] Method to be called when the controller is closed.
 * @property {boolean=} [disabled=false] If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled.
 * @property {Array<HTMLElement>=} [parents=[]] The parent "controller" array when "controller" is opened nested.
 * @property {boolean=} [parentsHide=false] If true, the parent element is hidden when the controller is opened.
 * @property {boolean=} [isInsideForm=false] If the controller is inside a form, set it to true.
 * @property {boolean=} [isOutsideForm=false] If the controller is outside a form, set it to true.
 */
/**
 * @class
 * @description Controller module class that handles the UI and interaction logic for a specific editor controller element.
 */
declare class Controller extends EditorInjector {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {Node} element Controller element
	 * @param {ControllerParams} params Controller options
	 * @param {?string=} _name An optional name for the controller key.
	 */
	constructor(inst: any, element: Node, params: ControllerParams, _name?: (string | null) | undefined);
	kind: any;
	inst: any;
	form: HTMLFormElement;
	isOpen: boolean;
	currentTarget: Node;
	currentPositionTarget: Range | Node;
	isWWTarget: boolean;
	position: 'top' | 'bottom';
	disabled: boolean;
	parents: HTMLElement[];
	parentsHide: boolean;
	isInsideForm: boolean;
	isOutsideForm: boolean;
	_initMethod: () => void;
	__globalEventHandlers: {
		keydown: any;
		mousedown: any;
	};
	_bindClose_key: any;
	_bindClose_mouse: any;
	/** @type {{left?: number, top?: number, addOfffset?: {left?: number, top?: number}}} */
	__offset: {
		left?: number;
		top?: number;
		addOfffset?: {
			left?: number;
			top?: number;
		};
	};
	__addOffset: {
		left: number;
		top: number;
	};
	__shadowRootEventForm: HTMLFormElement;
	__shadowRootEventListener: (e: any) => any;
	/**
	 * @description Open a modal plugin
	 * @param {Node|Range} target Target element
	 * @param {Node} [positionTarget] Position target element
	 * @param {Object} [params={}] params
	 * @param {boolean=} params.isWWTarget If the controller is in the WYSIWYG area, set it to true.
	 * @param {() => void=} params.initMethod Method to be called when the controller is closed.
	 * @param {boolean=} params.disabled If true, When the "controller" is opened, buttons without the "se-component-enabled" class are disabled. (default: this.disabled)
	 * @param {{left?: number, top?: number}=} params.addOffset Additional offset values
	 */
	open(
		target: Node | Range,
		positionTarget?: Node,
		{
			isWWTarget,
			initMethod,
			disabled,
			addOffset
		}?: {
			isWWTarget?: boolean | undefined;
			initMethod?: (() => void) | undefined;
			disabled?: boolean | undefined;
			addOffset?:
				| {
						left?: number;
						top?: number;
				  }
				| undefined;
		}
	): void;
	/**
	 * @description Close a modal plugin
	 * - The plugin's "init" method is called.
	 * @param {boolean=} force If true, parent controllers are forcibly closed.
	 */
	close(force?: boolean | undefined): void;
	/**
	 * @description Hide controller
	 */
	hide(): void;
	/**
	 * @description Show controller
	 */
	show(): void;
	/**
	 * @description Reset controller position
	 * @param {Node=} target
	 */
	resetPosition(target?: Node | undefined): void;
	/**
	 * @private
	 * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
	 * @param {HTMLFormElement} form Controller element
	 * @param {Node|Range} target Controller target element
	 * @param {boolean} isRangeTarget If the target is a Range, set it to true.
	 */
	private _controllerOn;
	/**
	 * @private
	 * @description Hide controller at editor area (link button, image resize button..)
	 */
	private _controllerOff;
	/**
	 * @private
	 * @description Specify the position of the controller.
	 * @param {HTMLElement} controller Controller element.
	 * @param {Node|Range} refer Element or Range that is the basis of the controller's position.
	 * @param {?boolean=} reload Maintain z-index when repositioning
	 */
	private _setControllerPosition;
	/**
	 * @private
	 * @description Adds global event listeners.
	 * - When the controller is opened
	 */
	private __addGlobalEvent;
	/**
	 * @private
	 * @description Removes global event listeners.
	 * - When the ESC key is pressed, the controller is closed.
	 */
	private __removeGlobalEvent;
	/**
	 * @private
	 * @description Checks if the controller is fixed and should not be closed.
	 * @returns {boolean} True if the controller is fixed.
	 */
	private _checkFixed;
	/**
	 * @private
	 * @description Checks if the given target is within a form or controller.
	 * @param {Node} target The target element.
	 * @returns {boolean} True if the target is inside a form or controller.
	 */
	private _checkForm;
	#private;
}
import EditorInjector from '../editorInjector';
