import type {} from '../typedef';
export default Editor;
/**
 * @description SunEditor class.
 */
declare class Editor {
	/**
	 * @constructor
	 * @description SunEditor constructor function.
	 * @param {Array<{target: Element, key: *, options: SunEditor.InitFrameOptions}>} multiTargets Target element
	 * @param {SunEditor.InitOptions} options options
	 */
	constructor(
		multiTargets: Array<{
			target: Element;
			key: any;
			options: SunEditor.InitFrameOptions;
		}>,
		options: SunEditor.InitOptions,
	);
	/**
	 * @description Frame root key array
	 * @type {Array<*>}
	 */
	rootKeys: Array<any>;
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
	 * @description Events object, call by triggerEvent function
	 * @type {SunEditor.Event.Handlers}
	 */
	events: SunEditor.Event.Handlers;
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
	 * @type {SunEditor.Status}
	 */
	status: SunEditor.Status;
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
	 * @description The selection node (selection.getNode()) to which the effect was last applied
	 * @type {?Node}
	 */
	effectNode: Node | null;
	/** @description Context manager class @type {import('./services/contextManager').default} */
	contextManager: import('./services/contextManager').default;
	/** @description Context option manager class @type {import('./services/optionManager').default} */
	optionManager: import('./services/optionManager').default;
	/** @description iframe-safe instanceof check utility class @type {import('./services/instanceCheck').default} */
	instanceCheck: import('./services/instanceCheck').default;
	/** @description Plugin Manager */
	pluginManager: PluginManager;
	/** @description Focus Manager */
	focusManager: FocusManager;
	/** @description UI manager class instance @type {import('./services/uiManager').default} */
	uiManager: import('./services/uiManager').default;
	/** @description Command Dispatcher */
	commandDispatcher: CommandDispatcher;
	/** @description History class instance @type {ReturnType<typeof import('./services/history').default>} */
	history: ReturnType<typeof import('./services/history').default>;
	/** @description EventManager class instance @type {import('./event/eventManager').default} */
	eventManager: import('./event/eventManager').default;
	/** @description Toolbar class instance @type {import('./class/toolbar').default} */
	toolbar: import('./class/toolbar').default;
	/** @description Sub-Toolbar class instance @type {?import('./class/toolbar').default} */
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
	/** @description List format class instance @type {import('./class/listFormat').default} */
	listFormat: import('./class/listFormat').default;
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
	/** @description Viewer class instance @type {import('./class/viewer').default} */
	viewer: import('./class/viewer').default;
	/**
	 * @description Closest ShadowRoot to editor if found
	 * @type {ShadowRoot & { getSelection?: () => Selection }} - Chromium-based browsers (Chrome, Edge, etc.) has a getSelection method on the ShadowRoot
	 */
	shadowRoot: ShadowRoot & {
		getSelection?: () => Selection;
	};
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
	 * @internal
	 * @description Copy format info
	 * - eventManager.__cacheStyleNodes copied
	 * @type {?Array<Node>}
	 */
	_onCopyFormatInfo: Array<Node> | null;
	/**
	 * @internal
	 * @description Copy format init method
	 * @type {?(...args: *) => *}
	 */
	_onCopyFormatInitMethod: ((...args: any) => any) | null;
	/**
	 * @internal
	 * @description If true, initialize all indexes of image, video information
	 * @type {boolean}
	 */
	_componentsInfoInit: boolean;
	/**
	 * @internal
	 * @description If true, reset all indexes of image, video information
	 * @type {boolean}
	 */
	_componentsInfoReset: boolean;
	/**
	 * @description Context
	 * @type {Map<*, SunEditor.FrameContext>}
	 */
	get frameRoots(): Map<any, SunEditor.FrameContext>;
	/**
	 * @description Context
	 * @type {SunEditor.Context}
	 */
	get context(): SunEditor.Context;
	/**
	 * @description Options
	 * @type {SunEditor.Options}
	 */
	get options(): SunEditor.Options;
	/**
	 * @description Frame context
	 * @type {SunEditor.FrameContext}
	 */
	get frameContext(): SunEditor.FrameContext;
	/**
	 * @description Frame options
	 * @type {SunEditor.FrameOptions}
	 */
	get frameOptions(): SunEditor.FrameOptions;
	/**
	 * @description Plugins
	 * @type {Object<string, *>}
	 */
	get plugins(): {
		[x: string]: any;
	};
	/**
	 * @description Plugins array with "active" method.
	 * - "activeCommands" runs the "add" method when creating the editor.
	 * @type {Array<string>}
	 */
	get activeCommands(): Array<string>;
	/**
	 * @description Checks if the content of the editor is empty.
	 * - Display criteria for "placeholder".
	 * @param {?SunEditor.FrameContext} [fc] Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc?: SunEditor.FrameContext | null): boolean;
	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	resetOptions(newOptions: SunEditor.InitOptions): void;
	/**
	 * @description Change the current root index.
	 * @param {*} rootKey Root frame key.
	 */
	changeFrameContext(rootKey: any): void;
	/**
	 * @description Destroy the suneditor
	 */
	destroy(): any;
	#private;
}
import CommandDispatcher from './services/commandDispatcher';
import FocusManager from './services/focusManager';
import PluginManager from './services/pluginManager';
