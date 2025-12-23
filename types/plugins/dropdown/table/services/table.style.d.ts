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
	openTableProps(target: any): void;
	openCellProps(target: any): void;
	openBorderFormatMenu(): void;
	openBorderStyleMenu(): void;
	/**
	 * @description Handles color selection from the color palette.
	 * @param {Node} button The button triggering the color palette.
	 * @param {string} type The type of color selection.
	 */
	openColorPalette(button: Node, type: string): void;
	toggleFontStyle(value: any): void;
	/**
	 * @description Toggles the visibility of the table header (`<thead>`). If the header is present, it is removed; if absent, it is added.
	 */
	toggleHeader(): void;
	/**
	 * @description Toggles the visibility of the table caption (`<caption>`). If the caption is present, it is removed; if absent, it is added.
	 */
	toggleCaption(): void;
	resetHeaderButton(table: any): void;
	resetCaptionButton(table: any): void;
	/**
	 * @description Resets the alignment properties for table cells.
	 */
	resetPropsAlign(): void;
	revertProps(): void;
	applyColorPicker(color: any): void;
	setAlignProps(value: any): void;
	setVerticalAlignProps(value: any): void;
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
	closeProps(): void;
	init(): void;
	#private;
}
export default TableStyleService;
import { Controller } from '../../../../modules/contracts';
import { ColorPicker } from '../../../../modules/contracts';
import { SelectMenu } from '../../../../modules/utils';
