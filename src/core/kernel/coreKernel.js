// L1: kernel
import Store from './store';

// L2: config
import ContextProvider from '../config/contextProvider';
import OptionProvider from '../config/optionProvider';
import InstanceCheck from '../config/instanceCheck';
import EventManager from '../config/eventManager';

// L3: logic/dom
import Offset from '../logic/dom/offset';
import Selection_ from '../logic/dom/selection';
import Format from '../logic/dom/format';
import Inline from '../logic/dom/inline';
import ListFormat from '../logic/dom/listFormat';
import HTML from '../logic/dom/html';
import NodeTransform from '../logic/dom/nodeTransform';
import Char from '../logic/dom/char';

// L3: logic/shell
import Shortcuts from '../logic/shell/shortcuts';
import Component from '../logic/shell/component';
import PluginManager from '../logic/shell/pluginManager';
import FocusManager from '../logic/shell/focusManager';
import UI from '../logic/shell/ui';
import CommandDispatcher from '../logic/shell/commandDispatcher';
import History from '../logic/shell/history';

// L3: logic/panel
import Toolbar from '../logic/panel/toolbar';
import Menu from '../logic/panel/menu';
import Viewer from '../logic/panel/viewer';

// L4: event
import EventOrchestrator from '../event/eventOrchestrator';

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
 */

/**
 * @description Core dependency container for the editor.
 * - Stores and retrieves config/logic/plugin instances
 * - Orchestrates dependency injection across layers
 * - Initialization order: L1 Store -> L2 Config ($ Phase 1) -> L3 Logic ($ Phase 2) -> L4 Event
 */
class CoreKernel {
	#config = new Map();
	#logic = new Map();

	/** @type {Deps} */
	$ = null;

	/**
	 * @param {SunEditor.Instance} facade - Editor instance (Public API)
	 * @param {Object} config - Initial configuration
	 * @param {ProductType} config.product  - The initial product object.
	 * @param {SunEditor.InitOptions} config.options  - The initial options.
	 */
	constructor(facade, config) {
		const { product, options } = config;

		// L1: Store
		this.store = new Store(product);

		/** @type {Deps} */
		this.$ = /** @type {*} */ ({ facade, store: this.store });

		// L2: Config
		this.#registerConfig(product, options);

		// $ Phase 1: Config deps (available to Logic constructors via kernel.$)
		this.#buildConfigDeps();

		// L3: Logic (dom, shell, ui)
		this.#registerLogic(product);

		// $ Phase 2: Add Logic deps
		this.#assignLogicDeps();

		//----------------------------------------------

		// Initialize Logic modules that need EventManager reference
		this.#initLogic();

		// Event orchestrator
		this._eventOrchestrator = new EventOrchestrator(this);
	}

	/**
	 * @description L2: Register config instances.
	 * @param {ProductType} product  - The initial product object.
	 * @param {SunEditor.InitOptions} options  - The initial options.
	 */
	#registerConfig(product, options) {
		const contextProvider = new ContextProvider(product);
		const optionProvider = new OptionProvider(this, product, options);

		this.#config.set('contextProvider', contextProvider);
		this.#config.set('optionProvider', optionProvider);
		this.#config.set('instanceCheck', new InstanceCheck(contextProvider.frameContext));
		this.#config.set('eventManager', new EventManager(contextProvider, optionProvider, this.$));
	}

	/**
	 * @description $ Phase 1: Build dependency bag with config entries only.
	 * Logic constructors can access kernel.$ for configs.
	 */
	#buildConfigDeps() {
		const contextProvider = this.#config.get('contextProvider');
		const optionProvider = this.#config.get('optionProvider');

		Object.assign(this.$, {
			// L2: Config
			contextProvider,
			optionProvider,
			instanceCheck: this.#config.get('instanceCheck'),
			eventManager: this.#config.get('eventManager'),

			// L2: Config - Convenience accessors
			frameRoots: contextProvider.frameRoots,
			context: contextProvider.context,
			options: optionProvider.options,
			icons: contextProvider.icons,
			lang: contextProvider.lang,
			frameContext: contextProvider.frameContext,
			frameOptions: optionProvider.frameOptions,
		});
	}

	/**
	 * @description L3: Register logic instances (dom, shell, ui).
	 * @param {ProductType} product  - The initial product object.
	 */
	#registerLogic(product) {
		// dom
		this.#logic.set('offset', new Offset(this));
		this.#logic.set('selection', new Selection_(this));
		this.#logic.set('html', new HTML(this));
		this.#logic.set('nodeTransform', new NodeTransform(this));
		this.#logic.set('format', new Format(this));
		this.#logic.set('inline', new Inline(this));
		this.#logic.set('listFormat', new ListFormat(this));
		this.#logic.set('char', new Char(this));

		// shell
		this.#logic.set('shortcuts', new Shortcuts(this));
		this.#logic.set('component', new Component(this));
		this.#logic.set('pluginManager', new PluginManager(this, product));
		this.#logic.set('focusManager', new FocusManager(this));
		this.#logic.set('ui', new UI(this));
		this.#logic.set('commandDispatcher', new CommandDispatcher(this));

		// ui
		this.#logic.set(
			'toolbar',
			new Toolbar(this, {
				keyName: 'toolbar',
				balloon: this.store.mode.isBalloon,
				balloonAlways: this.store.mode.isBalloonAlways,
				inline: this.store.mode.isInline,
				res: product.responsiveButtons,
			}),
		);
		if (this.$.options.has('_subMode')) {
			this.#logic.set(
				'subToolbar',
				new Toolbar(this, {
					keyName: 'toolbar_sub',
					balloon: this.store.mode.isSubBalloon,
					balloonAlways: this.store.mode.isSubBalloonAlways,
					inline: false,
					res: product.responsiveButtons_sub,
				}),
			);
		}
		this.#logic.set('menu', new Menu(this));
		this.#logic.set('viewer', new Viewer(this));

		// history (last — closure captures all L3 modules above)
		this.#logic.set('history', History(this));
	}

	/**
	 * @description Initialize Logic modules that need EventManager reference.
	 * Called after EventManager is created.
	 */
	#initLogic() {
		for (const [, instance] of this.#logic) {
			if (typeof instance?._init === 'function') {
				instance._init();
			}
		}
	}

	/**
	 * @description $ Phase 2: Add logic entries to existing $ object.
	 * Called after all logic instances are registered and initialized.
	 */
	#assignLogicDeps() {
		const pluginManager = this.#logic.get('pluginManager');

		Object.assign(this.$, {
			// L3: Logic (dom)
			offset: this.#logic.get('offset'),
			selection: this.#logic.get('selection'),
			format: this.#logic.get('format'),
			inline: this.#logic.get('inline'),
			listFormat: this.#logic.get('listFormat'),
			html: this.#logic.get('html'),
			nodeTransform: this.#logic.get('nodeTransform'),
			char: this.#logic.get('char'),

			// L3: Logic (shell)
			component: this.#logic.get('component'),
			focusManager: this.#logic.get('focusManager'),
			pluginManager,
			plugins: pluginManager.plugins,
			ui: this.#logic.get('ui'),
			commandDispatcher: this.#logic.get('commandDispatcher'),
			history: this.#logic.get('history'),
			shortcuts: this.#logic.get('shortcuts'),

			// L3: Logic (ui)
			toolbar: this.#logic.get('toolbar'),
			subToolbar: this.#logic.get('subToolbar'),
			menu: this.#logic.get('menu'),
			viewer: this.#logic.get('viewer'),
		});
	}

	/**
	 * @description Destroy the kernel and release all resources.
	 * Teardown order (reverse of init): plugins -> logic -> event -> config -> store
	 */
	_destroy() {
		for (const [, instance] of this.#logic) {
			instance?._destroy?.();
		}
		this.#logic.clear();

		this._eventOrchestrator._removeAllEvents();
		this._eventOrchestrator = null;

		for (const [, instance] of this.#config) {
			instance?._destroy?.();
		}
		this.#config.clear();

		this.$ = null;
		this.store._destroy();
		this.store = null;
		this.facade = null;
	}
}

export default CoreKernel;
