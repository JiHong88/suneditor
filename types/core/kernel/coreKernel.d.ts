import type {} from '../../typedef';
export default CoreKernel;
export type ProductType = import('../section/constructor').ConstructorReturnType;
export type Deps = {
	/**
	 * - Editor facade (public API)
	 */
	facade: SunEditor.Instance;
	/**
	 * - L1: Central state store
	 */
	store: SunEditor.Store;
	/**
	 * - L2: Context provider
	 */
	contextProvider: import('../config/contextProvider').default;
	/**
	 * - L2: Option provider
	 */
	optionProvider: import('../config/optionProvider').default;
	/**
	 * - L2: Instance type checker
	 */
	instanceCheck: import('../config/instanceCheck').default;
	/**
	 * - L2: Event manager (public API)
	 */
	eventManager: import('../config/eventManager').default;
	/**
	 * - Frame root elements map
	 */
	frameRoots: Map<string, SunEditor.FrameContext>;
	/**
	 * - Editor context
	 */
	context: SunEditor.Context;
	/**
	 * - Editor options
	 */
	options: SunEditor.Options;
	/**
	 * - Icon set
	 */
	icons: any;
	/**
	 * - Language strings
	 */
	lang: any;
	/**
	 * - Current frame context
	 */
	frameContext: SunEditor.FrameContext;
	/**
	 * - Current frame options
	 */
	frameOptions: SunEditor.FrameOptions;
	/**
	 * - L3: Offset calculator
	 */
	offset: import('../logic/dom/offset').default;
	/**
	 * - L3: Selection handler
	 */
	selection: import('../logic/dom/selection').default;
	/**
	 * - L3: Block formatting
	 */
	format: import('../logic/dom/format').default;
	/**
	 * - L3: Inline styling
	 */
	inline: import('../logic/dom/inline').default;
	/**
	 * - L3: List operations
	 */
	listFormat: import('../logic/dom/listFormat').default;
	/**
	 * - L3: HTML processing
	 */
	html: import('../logic/dom/html').default;
	/**
	 * - L3: Node transformation
	 */
	nodeTransform: import('../logic/dom/nodeTransform').default;
	/**
	 * - L3: Character counting
	 */
	char: import('../logic/dom/char').default;
	/**
	 * - L3: Component lifecycle
	 */
	component: import('../logic/shell/component').default;
	/**
	 * - L3: Focus management
	 */
	focusManager: import('../logic/shell/focusManager').default;
	/**
	 * - L3: Plugin registry
	 */
	pluginManager: import('../logic/shell/pluginManager').default;
	/**
	 * - Plugin instances map
	 */
	plugins: {
		[x: string]: any;
	};
	/**
	 * - L3: UI state management
	 */
	ui: import('../logic/shell/ui').default;
	/**
	 * - L3: Command routing
	 */
	commandDispatcher: import('../logic/shell/commandDispatcher').default;
	/**
	 * - L3: Undo/Redo stack
	 */
	history: ReturnType<typeof History>;
	/**
	 * - L3: Shortcut mapping
	 */
	shortcuts: import('../logic/shell/shortcuts').default;
	/**
	 * - L3: Toolbar renderer
	 */
	toolbar: import('../logic/panel/toolbar').default;
	/**
	 * - L3: Sub-toolbar renderer
	 */
	subToolbar: import('../logic/panel/toolbar').default;
	/**
	 * - L3: Menu renderer
	 */
	menu: import('../logic/panel/menu').default;
	/**
	 * - L3: View mode handler
	 */
	viewer: import('../logic/panel/viewer').default;
	/**
	 * - L3: Finder handler
	 */
	finder: import('../logic/panel/finder').default;
};
/**
 * @typedef {import('../section/constructor').ConstructorReturnType} ProductType
 */
/**
 * @typedef {Object} Deps
 * @property {SunEditor.Instance} facade - Editor facade (public API)
 * @property {SunEditor.Store} store - L1: Central state store
 *
 * @property {import('../config/contextProvider').default} contextProvider - L2: Context provider
 * @property {import('../config/optionProvider').default} optionProvider - L2: Option provider
 * @property {import('../config/instanceCheck').default} instanceCheck - L2: Instance type checker
 * @property {import('../config/eventManager').default} eventManager - L2: Event manager (public API)
 *
 * @property {Map<string, SunEditor.FrameContext>} frameRoots - Frame root elements map
 * @property {SunEditor.Context} context - Editor context
 * @property {SunEditor.Options} options - Editor options
 * @property {Object} icons - Icon set
 * @property {Object} lang - Language strings
 * @property {SunEditor.FrameContext} frameContext - Current frame context
 * @property {SunEditor.FrameOptions} frameOptions - Current frame options
 *
 * @property {import('../logic/dom/offset').default} offset - L3: Offset calculator
 * @property {import('../logic/dom/selection').default} selection - L3: Selection handler
 * @property {import('../logic/dom/format').default} format - L3: Block formatting
 * @property {import('../logic/dom/inline').default} inline - L3: Inline styling
 * @property {import('../logic/dom/listFormat').default} listFormat - L3: List operations
 * @property {import('../logic/dom/html').default} html - L3: HTML processing
 * @property {import('../logic/dom/nodeTransform').default} nodeTransform - L3: Node transformation
 * @property {import('../logic/dom/char').default} char - L3: Character counting
 *
 * @property {import('../logic/shell/component').default} component - L3: Component lifecycle
 * @property {import('../logic/shell/focusManager').default} focusManager - L3: Focus management
 * @property {import('../logic/shell/pluginManager').default} pluginManager - L3: Plugin registry
 * @property {Object<string, Object>} plugins - Plugin instances map
 * @property {import('../logic/shell/ui').default} ui - L3: UI state management
 * @property {import('../logic/shell/commandDispatcher').default} commandDispatcher - L3: Command routing
 * @property {ReturnType<import('../logic/shell/history').default>} history - L3: Undo/Redo stack
 * @property {import('../logic/shell/shortcuts').default} shortcuts - L3: Shortcut mapping
 *
 * @property {import('../logic/panel/toolbar').default} toolbar - L3: Toolbar renderer
 * @property {import('../logic/panel/toolbar').default} subToolbar - L3: Sub-toolbar renderer
 * @property {import('../logic/panel/menu').default} menu - L3: Menu renderer
 * @property {import('../logic/panel/viewer').default} viewer - L3: View mode handler
 * @property {import('../logic/panel/finder').default} finder - L3: Finder handler
 */
/**
 * @description Core dependency container for the editor.
 * - Stores and retrieves config/logic/plugin instances.
 * - Orchestrates dependency injection across layers.
 * - Initialization order: L1 Store -> L2 Config (`$` Phase 1) -> L3 Logic (`$` Phase 2) -> L4 Event.
 */
declare class CoreKernel {
	/**
	 * @param {SunEditor.Instance} facade - Editor instance (Public API)
	 * @param {Object} config - Initial configuration
	 * @param {ProductType} config.product  - The initial product object.
	 * @param {SunEditor.InitOptions} config.options  - The initial options.
	 */
	constructor(
		facade: SunEditor.Instance,
		config: {
			product: ProductType;
			options: SunEditor.InitOptions;
		},
	);
	/** @type {Deps} */
	$: Deps;
	store: Store;
	_eventOrchestrator: EventOrchestrator;
	/**
	 * @description Destroy the kernel and release all resources.
	 * Teardown order (reverse of init): plugins -> logic -> event -> config -> store
	 * Uses error aggregation to ensure all modules are cleaned up even if some fail.
	 */
	_destroy(): void;
	facade: any;
	#private;
}
import EventOrchestrator from '../event/eventOrchestrator';
import History from '../logic/shell/history';
import Store from './store';
