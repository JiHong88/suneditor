import type {} from '../../../../typedef';
/**
 * @description Creates the split menu items.
 * @param {Object} lang - Language object.
 * @returns {{items: string[], menus: NodeListOf<Element>}}
 */
export function CreateSplitMenu(lang: any): {
	items: string[];
	menus: NodeListOf<Element>;
};
/**
 * @description Creates the column menu items.
 * @param {Object} lang - Language object.
 * @param {Object} icons - Icons object.
 * @returns {{items: string[], menus: NodeListOf<Element>}}
 */
export function CreateColumnMenu(
	lang: any,
	icons: any,
): {
	items: string[];
	menus: NodeListOf<Element>;
};
/**
 * @description Creates the row menu items.
 * @param {Object} lang - Language object.
 * @param {Object} icons - Icons object.
 * @returns {{items: string[], menus: NodeListOf<Element>}}
 */
export function CreateRowMenu(
	lang: any,
	icons: any,
): {
	items: string[];
	menus: NodeListOf<Element>;
};
/**
 * @description Creates the border style menu items.
 * @returns {{items: string[], menus: NodeListOf<Element>}}
 */
export function CreateBorderMenu(): {
	items: string[];
	menus: NodeListOf<Element>;
};
/**
 * @description Creates the border format menu items.
 * @param {Object} langs - Language object.
 * @param {Object} icons - Icons object.
 * @param {string[]} indideFormats - Formats to exclude.
 * @returns {{items: string[], menus: NodeListOf<Element>}}
 */
export function CreateBorderFormatMenu(
	langs: any,
	icons: any,
	indideFormats: string[],
): {
	items: string[];
	menus: NodeListOf<Element>;
};
