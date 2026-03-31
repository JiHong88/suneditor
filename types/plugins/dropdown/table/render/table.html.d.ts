import type {} from '../../../../typedef';
/**
 * @description Creates the initial HTML structure for the table plugin.
 * @returns {HTMLDivElement}
 */
export function CreateHTML(): HTMLDivElement;
/**
 * @description Creates the table controller HTML.
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @returns {HTMLDivElement}
 */
export function CreateHTML_controller_table({ lang, icons }: SunEditor.Deps): HTMLDivElement;
/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {boolean} cellControllerTop - Whether to position cell controller on top
 * @returns {{ html: HTMLElement, splitButton: HTMLButtonElement, columnButton: HTMLButtonElement, rowButton: HTMLButtonElement, mergeButton: HTMLButtonElement, unmergeButton: HTMLButtonElement }}
 */
export function CreateHTML_controller_cell(
	{ lang, icons }: SunEditor.Deps,
	cellControllerTop: boolean,
): {
	html: HTMLElement;
	splitButton: HTMLButtonElement;
	columnButton: HTMLButtonElement;
	rowButton: HTMLButtonElement;
	mergeButton: HTMLButtonElement;
	unmergeButton: HTMLButtonElement;
};
/**
 * @typedef {Object} TableCtrlProps
 * @property {HTMLElement} html
 * @property {HTMLElement} controller_props_title
 * @property {HTMLButtonElement} borderButton
 * @property {HTMLButtonElement} borderFormatButton
 * @property {HTMLElement} cell_alignment
 * @property {HTMLElement} cell_alignment_vertical
 * @property {HTMLElement} cell_alignment_table_text
 * @property {HTMLButtonElement} border_style
 * @property {HTMLInputElement} border_color
 * @property {HTMLInputElement} border_width
 * @property {HTMLInputElement} back_color
 * @property {HTMLInputElement} font_color
 * @property {HTMLButtonElement} palette_border_button
 * @property {HTMLButtonElement} font_bold
 * @property {HTMLButtonElement} font_underline
 * @property {HTMLButtonElement} font_italic
 * @property {HTMLButtonElement} font_strike
 *
 * @param {SunEditor.Deps} $ - Kernel deps
 * @returns {TableCtrlProps}
 */
export function CreateHTML_controller_properties({ lang, icons, options }: SunEditor.Deps): TableCtrlProps;
export type TableCtrlProps = {
	html: HTMLElement;
	controller_props_title: HTMLElement;
	borderButton: HTMLButtonElement;
	borderFormatButton: HTMLButtonElement;
	cell_alignment: HTMLElement;
	cell_alignment_vertical: HTMLElement;
	cell_alignment_table_text: HTMLElement;
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
