import type {} from '../../../../typedef';
export class TableStyleService {
	/**
	 * @constructor
	 * @param {import('../index').default} main Table index
	 * @param {Object} options - Options
	 * @param {import('../index').TablePluginOptions} options.pluginOptions - Plugin options
	 * @param {HTMLElement} options.controller_table - Controller table element
	 */
	constructor(
		main: import('../index').default,
		{
			pluginOptions,
			controller_table,
		}: {
			pluginOptions: import('../index').TablePluginOptions;
			controller_table: HTMLElement;
		},
	);
	editor: import('../../../../core/editor').default;
	sliderType: string;
	/** @type {HTMLButtonElement} */
	resizeButton: HTMLButtonElement;
	/** @type {HTMLSpanElement} */
	resizeText: HTMLSpanElement;
	/** @type {HTMLButtonElement} */
	columnFixedButton: HTMLButtonElement;
	/** @type {HTMLButtonElement} */
	headerButton: HTMLButtonElement;
	/** @type {HTMLButtonElement} */
	captionButton: HTMLButtonElement;
	controller_props: Controller;
	controller_props_title: HTMLElement;
	controller_colorPicker: Controller;
	colorPicker: ColorPicker;
	selectMenu_props_border: SelectMenu;
	selectMenu_props_border_format: SelectMenu;
	selectMenu_props_border_format_oneCell: SelectMenu;
	maxText: any;
	minText: any;
	propTargets: {
		cell_alignment: HTMLElement;
		cell_alignment_vertical: HTMLElement;
		cell_alignment_table_text: HTMLElement;
		border_format: HTMLButtonElement;
		border_style: HTMLButtonElement;
		border_color: HTMLInputElement;
		border_width: HTMLInputElement;
		back_color: HTMLInputElement;
		font_color: HTMLInputElement;
		palette_border_button: HTMLButtonElement;
		font_bold: HTMLButtonElement;
		font_underline: HTMLButtonElement;
		font_italic: HTMLButtonElement;
		font_strike: HTMLButtonElement;
	};
	_propsCache: any[];
	_currentFontStyles: any[];
	_propsAlignCache: string;
	_propsVerticalAlignCache: string;
	_typeCache: string;
	colorPickerAction(color: SunEditor.Module.HueSlider.Color): void;
	controllerAction(target: HTMLButtonElement): void;
	/**
	 * @description Opens the table properties dialog.
	 * @param {HTMLElement} target - The target element (usually the table).
	 */
	openTableProps(target: HTMLElement): void;
	/**
	 * @description Opens the cell properties dialog.
	 * @param {HTMLElement} target - The target element (usually the table cell).
	 */
	openCellProps(target: HTMLElement): void;
	/**
	 * @description Opens the border format menu.
	 */
	openBorderFormatMenu(): void;
	/**
	 * @description Opens the border style menu.
	 */
	openBorderStyleMenu(): void;
	/**
	 * @description Handles color selection from the color palette.
	 * @param {Node} button The button triggering the color palette.
	 * @param {string} type The type of color selection.
	 */
	openColorPalette(button: Node, type: string): void;
	/**
	 * @description Toggles the font style.
	 * @param {string} value - The style to toggle ("bold"|"underline"|"italic"|"strike").
	 */
	toggleFontStyle(value: string): void;
	/**
	 * @description Toggles the visibility of the table header (`<thead>`). If the header is present, it is removed; if absent, it is added.
	 */
	toggleHeader(): void;
	/**
	 * @description Toggles the visibility of the table caption (`<caption>`). If the caption is present, it is removed; if absent, it is added.
	 */
	toggleCaption(): void;
	/**
	 * @description Resets the header button state.
	 * @param {HTMLTableElement} table - The table element.
	 */
	resetHeaderButton(table: HTMLTableElement): void;
	/**
	 * @description Resets the caption button state.
	 * @param {HTMLTableElement} table - The table element.
	 */
	resetCaptionButton(table: HTMLTableElement): void;
	/**
	 * @description Resets the alignment properties for table cells.
	 */
	resetPropsAlign(): void;
	/**
	 * @description Reverts the properties to their previous state.
	 */
	revertProps(): void;
	/**
	 * @description Applies the color from the color picker.
	 * @param {any} color - The color string or object.
	 */
	applyColorPicker(color: any): void;
	/**
	 * @description Sets the alignment properties.
	 * @param {string} value - The alignment value.
	 */
	setAlignProps(value: string): void;
	/**
	 * @description Sets the vertical alignment properties.
	 * @param {string} value - The vertical alignment value.
	 */
	setVerticalAlignProps(value: string): void;
	/**
	 * @description Updates table layout styles.
	 * @param {string} styles - Styles to update.
	 * @param {boolean} isMaxWidth - Whether the table is set to maximum width.
	 * @param {boolean} isFixedColumn - Whether the table has fixed column width.
	 * @param {boolean} ondisplay - Whether to update display.
	 */
	setTableLayout(styles: string, isMaxWidth: boolean, isFixedColumn: boolean, ondisplay: boolean): void;
	/**
	 * @description Applies properties to table cells.
	 * @param {HTMLButtonElement} target The target element.
	 */
	submitProps(target: HTMLButtonElement): void;
	/**
	 * @description Closes the properties dialog.
	 */
	closeProps(): void;
	/**
	 * @description Initialize the style service (resets properties).
	 */
	init(): void;
	#private;
}
export default TableStyleService;
import { Controller } from '../../../../modules/contract';
import { ColorPicker } from '../../../../modules/contract';
import { SelectMenu } from '../../../../modules/ui';
