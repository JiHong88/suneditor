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
 * @typedef {Object} InitOptionsReturnType
 * @property {BaseOptionsMap_constructor} o - Processed base options (Map containing {@link AllBaseOptions_constructor} keys)
 * @property {Object<string, string>} i - Icon set
 * @property {Object<string, string>} l - Language pack
 * @property {string|null} v - Initial editor value
 * @property {Array<string[]|string>} buttons - Toolbar button list (arrays for groups, strings for single buttons)
 * @property {Array<string[]|string>|null} subButtons - Sub-toolbar button list
 * @property {Element|null} statusbarContainer - Container element for status bar (if specified)
 * @property {Map<string|null, FrameOptionsMap_constructor>} frameMap - Map of frame-specific options (frame key => {@link FrameOptionsMap})
 */
/**
 * @description Initialize options
 * @param {EditorInitOptions_constructor} options Configuration options for the editor.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions_constructor}>} editorTargets Target textarea
 * @param {Object<string, *>} plugins Plugins object
 * @returns {InitOptionsReturnType} Initialized options and configuration
 */
export function InitOptions(
	options: EditorInitOptions_constructor,
	editorTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions_constructor;
	}>,
	plugins: {
		[x: string]: any;
	}
): InitOptionsReturnType;
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
export type EditorFrameOptions_constructor = import('../config/options').EditorFrameOptions;
export type EditorInitOptions_constructor = import('../config/options').EditorInitOptions;
export type AllBaseOptions_constructor = import('../config/options').AllBaseOptions;
export type BaseOptionsMap_constructor = import('../config/options').BaseOptionsMap;
export type FrameOptionsMap_constructor = import('../config/options').FrameOptionsMap;
export type ConstructorReturnType = {
	/**
	 * - Editor context object
	 */
	context: __se__Context;
	/**
	 * - Carrier wrapper element
	 */
	carrierWrapper: HTMLElement;
	/**
	 * - Processed editor options (Map)
	 */
	options: __se__BaseOptions;
	/**
	 * - Loaded plugins
	 */
	plugins: {
		[x: string]: any;
	};
	/**
	 * - Icon set
	 */
	icons: {
		[x: string]: string;
	};
	/**
	 * - Language pack
	 */
	lang: {
		[x: string]: string;
	};
	/**
	 * - Initial editor value
	 */
	value: string | null;
	/**
	 * - Root frame ID
	 */
	rootId: string | null;
	/**
	 * - Array of frame keys
	 */
	rootKeys: Array<string | null>;
	/**
	 * - Map of frame contexts
	 */
	frameRoots: Map<string | null, ReturnType<typeof CreateFrameContext>>;
	/**
	 * - Plugin toolbar buttons
	 */
	pluginCallButtons: {
		[x: string]: HTMLElement[];
	};
	/**
	 * - Responsive toolbar buttons
	 */
	responsiveButtons: Array<HTMLElement>;
	/**
	 * - Sub-toolbar plugin buttons
	 */
	pluginCallButtons_sub:
		| {
				[x: string]: Array<HTMLElement>;
		  }
		| [];
	/**
	 * - Sub-toolbar responsive buttons
	 */
	responsiveButtons_sub: Array<HTMLElement>;
};
export type InitOptionsReturnType = {
	/**
	 * - Processed base options (Map containing {@link AllBaseOptions_constructor} keys)
	 */
	o: BaseOptionsMap_constructor;
	/**
	 * - Icon set
	 */
	i: {
		[x: string]: string;
	};
	/**
	 * - Language pack
	 */
	l: {
		[x: string]: string;
	};
	/**
	 * - Initial editor value
	 */
	v: string | null;
	/**
	 * - Toolbar button list (arrays for groups, strings for single buttons)
	 */
	buttons: Array<string[] | string>;
	/**
	 * - Sub-toolbar button list
	 */
	subButtons: Array<string[] | string> | null;
	/**
	 * - Container element for status bar (if specified)
	 */
	statusbarContainer: Element | null;
	/**
	 * - Map of frame-specific options (frame key => {@link FrameOptionsMap})
	 */
	frameMap: Map<string | null, FrameOptionsMap_constructor>;
};
/**
 * @typedef {import('../config/options').EditorFrameOptions} EditorFrameOptions_constructor
 */
/**
 * @typedef {import('../config/options').EditorInitOptions} EditorInitOptions_constructor
 */
/**
 * @typedef {import('../config/options').AllBaseOptions} AllBaseOptions_constructor
 */
/**
 * @typedef {import('../config/options').BaseOptionsMap} BaseOptionsMap_constructor
 */
/**
 * @typedef {import('../config/options').FrameOptionsMap} FrameOptionsMap_constructor
 */
/**
 * @typedef {Object} ConstructorReturnType
 * @property {__se__Context} context - Editor context object
 * @property {HTMLElement} carrierWrapper - Carrier wrapper element
 * @property {__se__BaseOptions} options - Processed editor options (Map)
 * @property {Object<string, *>} plugins - Loaded plugins
 * @property {Object<string, string>} icons - Icon set
 * @property {Object<string, string>} lang - Language pack
 * @property {string|null} value - Initial editor value
 * @property {string|null} rootId - Root frame ID
 * @property {Array<string|null>} rootKeys - Array of frame keys
 * @property {Map<string|null, ReturnType<import('../config/frameContext').CreateFrameContext>>} frameRoots - Map of frame contexts
 * @property {Object<string, Array<HTMLElement>>} pluginCallButtons - Plugin toolbar buttons
 * @property {Array<HTMLElement>} responsiveButtons - Responsive toolbar buttons
 * @property {Object<string, Array<HTMLElement>>|[]} pluginCallButtons_sub - Sub-toolbar plugin buttons
 * @property {Array<HTMLElement>} responsiveButtons_sub - Sub-toolbar responsive buttons
 */
/**
 * @description Creates a new SunEditor instance with specified options.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions_constructor}>} editorTargets - Target element or multi-root object.
 * @param {EditorInitOptions_constructor} options - Configuration options for the editor.
 * @returns {ConstructorReturnType} - SunEditor instance with context, options, and DOM elements.
 */
declare function Constructor(
	editorTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions_constructor;
	}>,
	options: EditorInitOptions_constructor
): ConstructorReturnType;
import { CreateFrameContext } from '../config/frameContext';
