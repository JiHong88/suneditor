export default Editor;
export type EditorInitOptions_editor = import('./config/options').EditorInitOptions;
export type EditorFrameOptions_editor = import('./config/options').EditorFrameOptions;
export type ControllerInfo_editor = import('../modules/Controller').ControllerInfo;
/**
 * @typedef {import('./config/options').EditorInitOptions} EditorInitOptions_editor
 */
/**
 * @typedef {import('./config/options').EditorFrameOptions} EditorFrameOptions_editor
 */
/**
 * @typedef {import('../modules/Controller').ControllerInfo} ControllerInfo_editor
 */
/**
 * @constructor
 * @description SunEditor constructor function.
 * @param {Array<{target: Element, key: *, options: EditorFrameOptions_editor}>} multiTargets Target element
 * @param {EditorInitOptions_editor} options options
 */
declare function Editor(
	multiTargets: Array<{
		target: Element;
		key: any;
		options: EditorFrameOptions_editor;
	}>,
	options: EditorInitOptions_editor
): void;
declare class Editor {
	/**
	 * @typedef {import('./config/options').EditorInitOptions} EditorInitOptions_editor
	 */
	/**
	 * @typedef {import('./config/options').EditorFrameOptions} EditorFrameOptions_editor
	 */
	/**
	 * @typedef {import('../modules/Controller').ControllerInfo} ControllerInfo_editor
	 */
	/**
	 * @constructor
	 * @description SunEditor constructor function.
	 * @param {Array<{target: Element, key: *, options: EditorFrameOptions_editor}>} multiTargets Target element
	 * @param {EditorInitOptions_editor} options options
	 */
	constructor(
		multiTargets: Array<{
			target: Element;
			key: any;
			options: EditorFrameOptions_editor;
		}>,
		options: EditorInitOptions_editor
	);
	/**
	 * @description Frame root key array
	 * @type {Array<*>}
	 */
	rootKeys: Array<any>;
	/**
	 * @description Frame root map
	 * @type {Map<*, __se__FrameContext>}
	 */
	frameRoots: Map<any, __se__FrameContext>;
	/**
	 * @description Document object
	 * @type {Document}
	 */
	_d: Document;
	/**
	 * @description Window object
	 * @type {Window}
	 */
	_w: Window;
	/**
	 * @description Controllers carrier
	 * @type {HTMLElement}
	 */
	carrierWrapper: HTMLElement;
	/**
	 * @description Editor context object
	 * @type {__se__Context}
	 */
	__context: __se__Context;
	/**
	 * @description Utility object that manages the editor's runtime context.
	 * Provides methods to get, set, and inspect internal context.
	 * @type {ContextUtil}
	 */
	context: ContextUtil;
	/**
	 * @description Current focusing [frame] context
	 * @type {import('./config/frameContext').FrameContextMap}
	 */
	__frameContext: import('./config/frameContext').FrameContextMap;
	/**
	 * @description Utility object that manages the editor's runtime [frame] context.
	 * Provides methods to get, set, and inspect internal context.
	 * @type {FrameContextUtil}
	 */
	frameContext: FrameContextUtil;
	/**
	 * @description Current focusing [frame] context options
	 * @type {__se__FrameOptions}
	 */
	__frameOptions: __se__FrameOptions;
	/**
	 * @description Utility object that manages the editor's runtime [frame] options.
	 * Provides methods to get, set, and inspect internal [frame] options.
	 * @type {FrameOptionsUtil}
	 */
	frameOptions: FrameOptionsUtil;
	/**
	 * @description Editor row options
	 * @type {Map<string, *>}
	 */
	__options: Map<string, any>;
	/**
	 * @description Utility object that manages the editor's runtime options.
	 * Provides methods to get, set, and inspect internal editor options.
	 * @type {BaseOptionsUtil}
	 */
	options: BaseOptionsUtil;
	/**
	 * @description Plugins
	 * @type {Object<string, *>}
	 */
	plugins: {
		[x: string]: any;
	};
	/**
	 * @description Events object, call by triggerEvent function
	 * @type {Object<string, *>}
	 */
	events: {
		[x: string]: any;
	};
	/**
	 * @description Call the event function by injecting self: this.
	 * @type {(eventName: string, ...args: *) => Promise<*>}
	 */
	triggerEvent: (eventName: string, ...args: any) => Promise<any>;
	/**
	 * @description Default icons object
	 * @type {Object<string, string>}
	 */
	icons: {
		[x: string]: string;
	};
	/**
	 * @description loaded language
	 * @type {Object<string, *>}
	 */
	lang: {
		[x: string]: any;
	};
	/**
	 * @description Variables used internally in editor operation
	 * @type {__se__EditorStatus}
	 */
	status: __se__EditorStatus;
	/**
	 * @description Is classic mode?
	 * @type {boolean}
	 */
	isClassic: boolean;
	/**
	 * @description Is inline mode?
	 * @type {boolean}
	 */
	isInline: boolean;
	/**
	 * @description Is balloon|balloon-always mode?
	 * @type {boolean}
	 */
	isBalloon: boolean;
	/**
	 * @description Is balloon-always mode?
	 * @type {boolean}
	 */
	isBalloonAlways: boolean;
	/**
	 * @description Is subToolbar balloon|balloon-always mode?
	 * @type {boolean}
	 */
	isSubBalloon: boolean;
	/**
	 * @description Is subToolbar balloon-always mode?
	 * @type {boolean}
	 */
	isSubBalloonAlways: boolean;
	/**
	 * @description All command buttons map
	 * @type {Map<string, HTMLElement>}
	 */
	allCommandButtons: Map<string, HTMLElement>;
	/**
	 * @description All command buttons map
	 * @type {Map<string, HTMLElement>}
	 */
	subAllCommandButtons: Map<string, HTMLElement>;
	/**
	 * @description Shoutcuts key map
	 * @type {Map<string, *>}
	 */
	shortcutsKeyMap: Map<string, any>;
	/**
	 * @description Shoutcuts reverse key array
	 * - An array of key codes generated with the reverseButtons option, used to reverse the action for a specific key combination.
	 * @type {Set<string>}
	 */
	reverseKeys: Set<string>;
	/**
	 * @description A map with the plugin's buttons having an "active" method and the default command buttons with an "active" action.
	 * - Each button is contained in an array.
	 * @type {Map<string, Array<HTMLButtonElement>>}
	 */
	commandTargets: Map<string, Array<HTMLButtonElement>>;
	/**
	 * @description Plugins array with "active" method.
	 * - "activeCommands" runs the "add" method when creating the editor.
	 * @type {Array<string>}
	 */
	activeCommands: Array<string>;
	/**
	 * @description The selection node (selection.getNode()) to which the effect was last applied
	 * @type {Node|null}
	 */
	effectNode: Node | null;
	/**
	 * @description Currently open "Modal" instance
	 * @type {*}
	 */
	opendModal: any;
	/**
	 * @description Currently open "Controller" info array
	 * @type {Array<ControllerInfo_editor>}
	 */
	opendControllers: Array<ControllerInfo_editor>;
	/**
	 * @description Currently open "Controller" caller plugin name
	 */
	currentControllerName: string;
	/**
	 * @description Currently open "Browser" instance
	 * @type {*}
	 */
	opendBrowser: any;
	/**
	 * @description Whether "SelectMenu" is open
	 * @type {boolean}
	 */
	selectMenuOn: boolean;
	/** @description History class instance @type {ReturnType<typeof import('./base/history').default>} */
	history: ReturnType<typeof import('./base/history').default>;
	/** @description EventManager class instance @type {import('./base/eventManager').default} */
	eventManager: import('./base/eventManager').default;
	/** @description iframe-safe instanceof check utility class @type {import('./util/instanceCheck').default} */
	instanceCheck: import('./util/instanceCheck').default;
	/** @description Toolbar class instance @type {import('./class/toolbar').default} */
	toolbar: import('./class/toolbar').default;
	/** @description Sub-Toolbar class instance @type {import('./class/toolbar').default|null} */
	subToolbar: import('./class/toolbar').default | null;
	/** @description Char class instance @type {import('./class/char').default} */
	char: import('./class/char').default;
	/** @description Component class instance @type {import('./class/component').default} */
	component: import('./class/component').default;
	/** @description Format class instance @type {import('./class/format').default} */
	format: import('./class/format').default;
	/** @description HTML class instance @type {import('./class/html').default} */
	html: import('./class/html').default;
	/** @description Inline format class instance @type {import('./class/inline').default} */
	inline: import('./class/inline').default;
	/** @description Menu class instance @type {import('./class/menu').default} */
	menu: import('./class/menu').default;
	/** @description NodeTransform class instance @type {import('./class/nodeTransform').default} */
	nodeTransform: import('./class/nodeTransform').default;
	/** @description Offset class instance @type {import('./class/offset').default} */
	offset: import('./class/offset').default;
	/** @description Selection class instance @type {import('./class/selection').default} */
	selection: import('./class/selection').default;
	/** @description Shortcuts class instance @type {import('./class/shortcuts').default} */
	shortcuts: import('./class/shortcuts').default;
	/** @description UI class instance @type {import('./class/ui').default} */
	ui: import('./class/ui').default;
	/** @description Viewer class instance @type {import('./class/viewer').default} */
	viewer: import('./class/viewer').default;
	/**
	 * @description Line breaker (top)
	 * @type {HTMLElement}
	 */
	_lineBreaker_t: HTMLElement;
	/**
	 * @description Line breaker (bottom)
	 * @type {HTMLElement}
	 */
	_lineBreaker_b: HTMLElement;
	/**
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot & { getSelection?: () => Selection }} - Chromium-based browsers (Chrome, Edge, etc.) has a getSelection method on the ShadowRoot
	 */
	_shadowRoot: ShadowRoot & {
		getSelection?: () => Selection;
	};
	/**
	 * @description Plugin call event map
	 * @type {Map<string, Array<((...args: *) => *) & { index: number }>>}
	 */
	_onPluginEvents: Map<
		string,
		Array<
			((...args: any) => any) & {
				index: number;
			}
		>
	>;
	/**
	 * @description Copy format info
	 * - eventManager.__cacheStyleNodes copied
	 * @type {Array<Node>|null}
	 */
	_onCopyFormatInfo: Array<Node> | null;
	/**
	 * @description Copy format init method
	 * @type {(...args: *) => *|null}
	 */
	_onCopyFormatInitMethod: (...args: any) => any | null;
	/**
	 * @description Controller target's frame div (editor.frameContext.get('topArea'))
	 * @type {HTMLElement|null}
	 */
	_controllerTargetContext: HTMLElement | null;
	/**
	 * @description List of buttons that are disabled when "controller" is opened
	 * @type {Array<HTMLButtonElement|HTMLInputElement>}
	 */
	_controllerOnDisabledButtons: Array<HTMLButtonElement | HTMLInputElement>;
	/**
	 * @description List of buttons that are disabled when "codeView" mode opened
	 * @type {Array<HTMLButtonElement|HTMLInputElement>}
	 */
	_codeViewDisabledButtons: Array<HTMLButtonElement | HTMLInputElement>;
	/**
	 * @description List of buttons to run plugins in the toolbar
	 * @type {Array<HTMLElement>}
	 */
	_pluginCallButtons: Array<HTMLElement>;
	/**
	 * @description List of buttons to run plugins in the Sub-Toolbar
	 * @type {Array<HTMLElement>}
	 */
	_pluginCallButtons_sub: Array<HTMLElement>;
	/**
	 * @description Responsive Toolbar Button Structure array
	 * @type {Array<*>}
	 */
	_responsiveButtons: Array<any>;
	/**
	 * @description Responsive Sub-Toolbar Button Structure array
	 * @type {Array<*>}
	 */
	_responsiveButtons_sub: Array<any>;
	/**
	 * @description Variable that controls the "blur" event in the editor of inline or balloon mode when the focus is moved to dropdown
	 * @type {boolean}
	 */
	_notHideToolbar: boolean;
	/**
	 * @description Variables for controlling blur events
	 * @type {boolean}
	 */
	_preventBlur: boolean;
	/**
	 * @description Variables for controlling focus events
	 * @type {boolean}
	 */
	_preventFocus: boolean;
	/**
	 * @description Variables for controlling selection change events
	 */
	_preventSelection: boolean;
	/**
	 * @description If true, initialize all indexes of image, video information
	 * @type {boolean}
	 */
	_componentsInfoInit: boolean;
	/**
	 * @description If true, reset all indexes of image, video information
	 * @type {boolean}
	 */
	_componentsInfoReset: boolean;
	/**
	 * @description plugin retainFormat info Map()
	 * @type {Map<string, { key: string, method: (...args: *) => * }>}
	 */
	_MELInfo: Map<
		string,
		{
			key: string;
			method: (...args: any) => any;
		}
	>;
	/**
	 * @description Properties for managing files in the "FileManager" module
	 * @type {Array<*>}
	 */
	_fileInfoPluginsCheck: Array<any>;
	/**
	 * @description Properties for managing files in the "FileManager" module
	 * @type {Array<*>}
	 */
	_fileInfoPluginsReset: Array<any>;
	/**
	 * @description Variables for file component management
	 * @type {Object<string, *>}
	 */
	_fileManager: {
		[x: string]: any;
	};
	/**
	 * @description Variables for managing the components
	 * @type {Array<*>}
	 */
	_componentManager: Array<any>;
	/**
	 * @description Current Figure container.
	 * @type {HTMLElement|null}
	 */
	_figureContainer: HTMLElement | null;
	/**
	 * @description Origin options
	 * @type {EditorInitOptions_editor}
	 */
	_originOptions: EditorInitOptions_editor;
	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * - If the plugin is added call callBack function.
	 * @param {string} pluginName The name of the plugin to call
	 * @param {?Array<HTMLElement>} targets Plugin target button (This is not necessary if you have a button list when creating the editor)
	 * @param {?Object<string, *>} pluginOptions Plugin's options
	 */
	registerPlugin(
		pluginName: string,
		targets: Array<HTMLElement> | null,
		pluginOptions: {
			[x: string]: any;
		} | null
	): void;
	/**
	 * @description Run plugin calls and basic commands.
	 * @param {string} command Command string
	 * @param {string} type Display type string ('command', 'dropdown', 'modal', 'container')
	 * @param {?Node=} button The element of command button
	 */
	run(command: string, type: string, button?: (Node | null) | undefined): void;
	/**
	 * @description Execute default command of command button
	 * - (selectAll, codeView, fullScreen, indent, outdent, undo, redo, removeFormat, print, preview, showBlocks, save, bold, underline, italic, strike, subscript, superscript, copy, cut, paste)
	 * @param {string} command Property of command button (data-value)
	 * @param {?Node=} button Command button
	 * @returns {Promise<void>}
	 */
	commandHandler(command: string, button?: (Node | null) | undefined): Promise<void>;
	/**
	 * @description Execute "editor.run" with command button.
	 * @param {Node} target Command target
	 */
	runFromTarget(target: Node): void;
	/**
	 * @description It is executed by inserting the button of commandTargets as the argument value of the "f" function.
	 * - "func" is called as long as the button array's length.
	 * @param {string} cmd data-command
	 * @param {(...args: *) => *} func Function.
	 */
	applyCommandTargets(cmd: string, func: (...args: any) => any): void;
	/**
	 * @description Execute a function by traversing all root targets.
	 * @param {(...args: *) => *} f Function
	 */
	applyFrameRoots(f: (...args: any) => any): void;
	/**
	 * @description Checks if the content of the editor is empty.
	 * - Display criteria for "placeholder".
	 * @param {?__se__FrameContext=} fc Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc?: (__se__FrameContext | null) | undefined): boolean;
	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param {string} dir "rtl" or "ltr"
	 */
	setDir(dir: string): void;
	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {EditorInitOptions_editor} newOptions Options
	 */
	resetOptions(newOptions: EditorInitOptions_editor): void;
	/**
	 * @description Change the current root index.
	 * @param {*} rootKey
	 */
	changeFrameContext(rootKey: any): void;
	/**
	 * @description javascript execCommand
	 * @param {string} command javascript execCommand function property
	 * @param {boolean=} showDefaultUI javascript execCommand function property
	 * @param {string=} value javascript execCommand function property
	 */
	execCommand(command: string, showDefaultUI?: boolean | undefined, value?: string | undefined): void;
	/**
	 * @description Focus to wysiwyg area
	 * @param {*} rootKey Root index
	 */
	focus(rootKey: any): void;
	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * - If "focusEdge" is null, then selected last element
	 * @param {?Node=} focusEl Focus element
	 */
	focusEdge(focusEl?: (Node | null) | undefined): void;
	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur(): void;
	/**
	 * @description Destroy the suneditor
	 */
	destroy(): any;
	/** ----- private methods ----------------------------------------------------------------------------------------------------------------------------- */
	/**
	 * @private
	 * @description Set frameContext, frameOptions
	 * @param {__se__FrameContext} rt Root target[key] FrameContext
	 */
	_setFrameInfo(rt: __se__FrameContext): void;
	/**
	 * @private
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	_nativeFocus(): void;
	/**
	 * @private
	 * @description Check the components such as image and video and modify them according to the format.
	 * @param {boolean} loaded If true, the component is loaded.
	 */
	_checkComponents(loaded: boolean): void;
	/**
	 * @private
	 * @description Initialize the information of the components.
	 */
	_resetComponents(): void;
	/**
	 * @private
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {__se__FrameContext} e frameContext
	 * @param {string} value initial html string
	 */
	_initWysiwygArea(e: __se__FrameContext, value: string): void;
	/**
	 * @private
	 * @description Called when there are changes to tags in the wysiwyg region.
	 * @param {__se__FrameContext} fc - Frame context object
	 */
	_resourcesStateChange(fc: __se__FrameContext): void;
	/**
	 * @private
	 * @description Modify the height value of the iframe when the height of the iframe is automatic.
	 * @param {__se__FrameContext|FrameContextUtil} fc - Frame context object
	 */
	_iframeAutoHeight(fc: __se__FrameContext | FrameContextUtil): void;
	/**
	 * @private
	 * @description Call the "onResizeEditor" event
	 * @param {__se__FrameContext|FrameContextUtil} fc - Frame context object
	 * @param {number} h - Height value
	 * @param {ResizeObserverEntry} resizeObserverEntry - ResizeObserverEntry object
	 */
	__callResizeFunction(fc: __se__FrameContext | FrameContextUtil, h: number, resizeObserverEntry: ResizeObserverEntry): void;
	/**
	 * @private
	 * @description Set display property when there is placeholder.
	 * @param {?__se__FrameContext=} fc - Frame context object, If null fc is this.frameContext
	 */
	_checkPlaceholder(fc?: (__se__FrameContext | null) | undefined): void;
	/**
	 * @private
	 * @description Initializ editor
	 * @param {EditorInitOptions_editor} options Options
	 */
	__editorInit(options: EditorInitOptions_editor): void;
	/**
	 * @private
	 * @description Initializ core variable
	 * @param {EditorInitOptions_editor} options Options
	 */
	__init(options: EditorInitOptions_editor): void;
	/**
	 * @private
	 * @description Caching basic buttons to use
	 * @param {string} mode 'all' | 'main' | 'sub'
	 */
	__cachingButtons(mode: string): void;
	/**
	 * @private
	 * @description Set the disabled button list
	 * - this._codeViewDisabledButtons, this._controllerOnDisabledButtons
	 */
	__setDisabledButtons(): void;
	/**
	 * @private
	 * @description Save the current buttons
	 * @param {Map<string, Element>} cmdButtons Command button map
	 * @param {Element} tray Button tray
	 */
	__saveCommandButtons(cmdButtons: Map<string, Element>, tray: Element): void;
	/**
	 * @private
	 * @description Caches custom(starts with "_") shortcut keys for commands.
	 */
	__cachingShortcuts(): void;
	/**
	 * @private
	 * @description Sets command target elements.
	 * @param {string} cmd - The command identifier.
	 * @param {HTMLButtonElement} target - The associated command button.
	 */
	__setCommandTargets(cmd: string, target: HTMLButtonElement): void;
	/**
	 * @private
	 * @description Configures the document properties of an iframe editor.
	 * @param {HTMLIFrameElement} frame - The editor iframe.
	 * @param {Map<string, *>} originOptions - The original options.
	 * @param {__se__FrameOptions} targetOptions - The new options.
	 */
	__setIframeDocument(frame: HTMLIFrameElement, originOptions: Map<string, any>, targetOptions: __se__FrameOptions): void;
	/**
	 * @private
	 * @description Set the FrameContext parameters and options
	 * @param {__se__FrameContext} e - Frame context object
	 */
	__setEditorParams(e: __se__FrameContext): void;
	/**
	 * @private
	 * @description Registers and initializes editor classes.
	 */
	__registerClass(): void;
	/**
	 * @private
	 * @description Creates the editor instance and initializes components.
	 * @param {EditorInitOptions_editor} originOptions - The initial editor options.
	 * @returns {Promise<void>}
	 */
	__Create(originOptions: EditorInitOptions_editor): Promise<void>;
	Constructor: typeof Editor;
}
import { ContextUtil } from './config/context';
import { FrameContextUtil } from './config/frameContext';
import { FrameOptionsUtil } from './config/options';
import { BaseOptionsUtil } from './config/options';
