/**
 * @description Create shortcuts desc span.
 * @param {string} command Command string
 * @param {Array<string>} values options.shortcuts[command]
 * @param {Element|null} button Command button element
 * @param {Map<string, *>} keyMap Map to store shortcut key info
 * @param {Array} rc "_reverseCommandArray" option
 * @param {Set} reverseKeys Reverse key array
 */
export function CreateShortcuts(command: string, button: Element | null, values: Array<string>, keyMap: Map<string, any>, rc: any[], reverseKeys: Set<any>): void;
/**
 * @description Initialize options
 * @param {EditorInitOptions} options Configuration options for the editor.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions}>} editorTargets Target textarea
 * @param {Object<string, *>} plugins Plugins object
 * @returns {{o: Map<string, *>, i: Object<string, string>, l: Object<string, string>, v: string, buttons: Array<string[]|string>, subButtons: Array<string[]|string>, statusbarContainer: Element|null, frameMap: Map<*, *>}}
 * - o: options
 * - i: icons
 * - l: lang
 * - v: value
 * - buttons: Toolbar button list
 * - subButtons: Sub-Toolbar button list
 * - statusbarContainer: statusbar container
 * - frameMap: converted options map
 */
export function InitOptions(
	options: EditorInitOptions,
	editorTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions;
	}>,
	plugins: {
		[x: string]: any;
	}
): {
	o: Map<string, any>;
	i: {
		[x: string]: string;
	};
	l: {
		[x: string]: string;
	};
	v: string;
	buttons: Array<string[] | string>;
	subButtons: Array<string[] | string>;
	statusbarContainer: Element | null;
	frameMap: Map<any, any>;
};
/**
 * @description Create a context object for the editor frame.
 * @param {Map<string, *>} targetOptions - editor.frameOptions
 * @param {HTMLElement} statusbar - statusbar element
 * @returns {{statusbar: HTMLElement, navigation: HTMLElement, charWrapper: HTMLElement, charCounter: HTMLElement}}
 */
export function CreateStatusbar(
	targetOptions: Map<string, any>,
	statusbar: HTMLElement
): {
	statusbar: HTMLElement;
	navigation: HTMLElement;
	charWrapper: HTMLElement;
	charCounter: HTMLElement;
};
/**
 * @description Update a button state, attributes, and icons
 * @param {HTMLElement|null} element Button element
 * @param {Object<string, *>} plugin Plugin
 * @param {Object<string, string>} icons Icons
 * @param {Object<string, string>} lang lang
 */
export function UpdateButton(
	element: HTMLElement | null,
	plugin: {
		[x: string]: any;
	},
	icons: {
		[x: string]: string;
	},
	lang: {
		[x: string]: string;
	}
): void;
/**
 * @description Create editor HTML
 * @param {Array} buttonList option.buttonList
 * @param {?Object<string, *>} plugins Plugins
 * @param {Map<string, *>} options options
 * @param {Object<string, string>} icons icons
 * @param {Object<string, string>} lang lang
 * @param {boolean} isUpdate Is update
 * @returns {{element: HTMLElement, pluginCallButtons: Object<string, Array<HTMLElement>>, responsiveButtons: Array<HTMLElement>, buttonTray: HTMLElement, updateButtons: Array<{button: HTMLElement, plugin: *, key: string}>}}}
 */
export function CreateToolBar(
	buttonList: any[],
	plugins: {
		[x: string]: any;
	} | null,
	options: Map<string, any>,
	icons: {
		[x: string]: string;
	},
	lang: {
		[x: string]: string;
	},
	isUpdate: boolean
): {
	element: HTMLElement;
	pluginCallButtons: {
		[x: string]: Array<HTMLElement>;
	};
	responsiveButtons: Array<HTMLElement>;
	buttonTray: HTMLElement;
	updateButtons: Array<{
		button: HTMLElement;
		plugin: any;
		key: string;
	}>;
};
export default Constructor;
export type EditorFrameOptions = import('./options').EditorFrameOptions;
export type EditorInitOptions = import('./options').EditorInitOptions;
/**
 * @typedef {import('./options').EditorFrameOptions} EditorFrameOptions
 */
/**
 * @typedef {import('./options').EditorInitOptions} EditorInitOptions
 */
/**
 * @description Creates a new SunEditor instance with specified options.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions}>} editorTargets - Target element or multi-root object.
 * @param {EditorInitOptions} options - Configuration options for the editor.
 * @returns {Object<string, *>} - SunEditor instance with context, options, and DOM elements.
 */
declare function Constructor(
	editorTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions;
	}>,
	options: EditorInitOptions
): {
	[x: string]: any;
};
