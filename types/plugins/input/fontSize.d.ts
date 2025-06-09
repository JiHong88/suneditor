export default FontSize;
/**
 * @class
 * @description FontSize Plugin
 * - This plugin enables users to modify the font size of selected text within the editor.
 * - It supports various measurement units (e.g., 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%') and
 * - provides multiple interfaces: dropdown menus, direct input, and optional increment/decrement buttons.
 */
declare class FontSize extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions - Configuration options for the FontSize plugin.
	 * @param {string=} [pluginOptions.sizeUnit='px'] - The unit for the font size.
	 * - Accepted values include: 'px', 'pt', 'em', 'rem', 'vw', 'vh', '%' or 'text'.
	 * - If 'text' is used, a text-based font size list is applied.
	 * @param {boolean=} [pluginOptions.showDefaultSizeLabel=true] - Determines whether the default size label is displayed in the dropdown menu.
	 * @param {boolean=} [pluginOptions.showIncDecControls=false] - When true, displays increase and decrease buttons for font size adjustments.
	 * @param {boolean=} [pluginOptions.disableInput=true] - When true, disables the direct font size input box.
	 * @param {Object<string, {default: number, inc: number, min: number, max: number, list: Array<number>}>} [pluginOptions.unitMap={}] - Optional object to override or extend the default unit mapping for font sizes.
	 */
	constructor(
		editor: __se__EditorCore,
		pluginOptions: {
			sizeUnit?: string | undefined;
			showDefaultSizeLabel?: boolean | undefined;
			showIncDecControls?: boolean | undefined;
			disableInput?: boolean | undefined;
			unitMap?: {
				[x: string]: {
					default: number;
					inc: number;
					min: number;
					max: number;
					list: Array<number>;
				};
			};
		}
	);
	unitMap: {
		text: {
			default: string;
			list: {
				title: string;
				size: string;
			}[];
		};
		px: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		pt: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		em: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		rem: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		vw: {
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		vh: {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
		'%': {
			default: number;
			inc: number;
			min: number;
			max: number;
			list: number[];
		};
	};
	sizeUnit: any;
	title: any;
	inner: string | boolean;
	beforeItem: HTMLElement;
	afterItem: HTMLElement;
	replaceButton: HTMLElement;
	currentSize: string;
	sizeList: NodeListOf<Element>;
	hasInputFocus: boolean;
	isInputActive: boolean;
	_disableInput: boolean;
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element?: (HTMLElement | null) | undefined, target?: (HTMLElement | null) | undefined): boolean;
	/**
	 * @editorMethod Editor.Toolbar
	 * @description Executes the event function of toolbar's input tag - "keydown".
	 * @param {Object} params
	 * @param {HTMLElement} params.target Input element
	 * @param {KeyboardEvent} params.event Event object
	 */
	onInputKeyDown({ target, event }: { target: HTMLElement; event: KeyboardEvent }): void;
	/**
	 * @editorMethod Editor.Toolbar
	 * @description Executes the event function of toolbar's input tag - "change".
	 * @param {__se__PluginToolbarInputChangeEventInfo} params
	 */
	onInputChange({ target, value: changeValue, event }: __se__PluginToolbarInputChangeEventInfo): void;
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target: HTMLElement): void;
	/**
	 * @private
	 * @description Retrieves the default font size of the editor.
	 * @returns {string} - The computed font size from the editor.
	 */
	private _getDefaultSize;
	/**
	 * @private
	 * @description Extracts the font size and unit from the given element or input value.
	 * @param {string|Element} target - The target input or element.
	 * @returns {{ unit: string, value: number|string }} - An object containing:
	 * - `unit` (string): The detected font size unit.
	 * - `value` (number|string): The numeric font size value or text-based size.
	 */
	private _getSize;
	/**
	 * @private
	 * @description Sets the font size in the toolbar input field or button label.
	 * @param {HTMLElement} target - The target element in the toolbar.
	 * @param {string|number} value - The font size value.
	 * @returns {string|number} - The applied font size.
	 */
	private _setSize;
}
import EditorInjector from '../../editorInjector';
