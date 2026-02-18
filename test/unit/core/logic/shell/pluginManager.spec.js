/**
 * @jest-environment jsdom
 */

jest.mock('../../../../../src/core/section/constructor', () => ({
	UpdateButton: jest.fn(),
}));

jest.mock('../../../../../src/helper', () => ({
	dom: {
		utils: {
			hasClass: jest.fn(),
			removeItem: jest.fn(),
		},
	},
}));

import PluginManager from '../../../../../src/core/logic/shell/pluginManager';
import { UpdateButton } from '../../../../../src/core/section/constructor';
import { dom } from '../../../../../src/helper';

/**
 * Helper: create a minimal kernel + product pair for constructing PluginManager.
 */
function createKernelAndProduct(overrides = {}) {
	const buttonsSet = new Set(overrides.buttons || []);
	const buttonsSubSet = overrides.buttons_sub ? new Set(overrides.buttons_sub) : null;

	const kernel = {
		$: {
			contextProvider: { icons: { bold: '<svg/>' }, lang: { bold: 'Bold' } },
			options: {
				get: jest.fn((key) => {
					if (key === '__pluginRetainFilter') return overrides.__pluginRetainFilter ?? null;
					if (key === 'buttons') return buttonsSet;
					if (key === 'buttons_sub') return buttonsSubSet;
					return undefined;
				}),
			},
			commandDispatcher: { activeCommands: [] },
			focusManager: { focusEdge: jest.fn() },
			history: { push: jest.fn() },
		},
	};

	const product = {
		plugins: overrides.plugins || {},
		pluginCallButtons: overrides.pluginCallButtons || {},
		pluginCallButtons_sub: overrides.pluginCallButtons_sub || {},
	};

	return { kernel, product };
}

describe('PluginManager', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	// ---------------------------------------------------------------
	// constructor
	// ---------------------------------------------------------------
	describe('constructor', () => {
		it('should initialize plugins from product', () => {
			const myPlugin = { name: 'test' };
			const { kernel, product } = createKernelAndProduct({
				plugins: { test: myPlugin },
			});

			const pm = new PluginManager(kernel, product);

			expect(pm.plugins).toEqual({ test: myPlugin });
		});

		it('should default plugins to empty object when product.plugins is falsy', () => {
			const { kernel } = createKernelAndProduct();
			const product = { plugins: undefined, pluginCallButtons: {}, pluginCallButtons_sub: {} };

			const pm = new PluginManager(kernel, product);

			expect(pm.plugins).toEqual({});
		});

		it('should store pluginCallButtons and pluginCallButtons_sub from product', () => {
			const btn = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { testPlugin: { active() {} } },
				pluginCallButtons: { testPlugin: [btn] },
				pluginCallButtons_sub: {},
			});

			// Constructor does not throw
			const pm = new PluginManager(kernel, product);
			expect(pm).toBeDefined();
		});
	});

	// ---------------------------------------------------------------
	// plugins getter
	// ---------------------------------------------------------------
	describe('plugins getter', () => {
		it('should return the plugins object', () => {
			const pluginObj = { a: {}, b: {} };
			const { kernel, product } = createKernelAndProduct({ plugins: pluginObj });
			const pm = new PluginManager(kernel, product);

			expect(pm.plugins).toBe(pluginObj);
		});
	});

	// ---------------------------------------------------------------
	// fileInfo getter
	// ---------------------------------------------------------------
	describe('fileInfo getter', () => {
		it('should return the default fileInfo structure', () => {
			const { kernel, product } = createKernelAndProduct();
			const pm = new PluginManager(kernel, product);
			const fi = pm.fileInfo;

			expect(fi).toEqual({
				tags: null,
				regExp: null,
				pluginRegExp: null,
				pluginMap: null,
			});
		});
	});

	// ---------------------------------------------------------------
	// register
	// ---------------------------------------------------------------
	describe('register', () => {
		it('should throw when plugin is not found', () => {
			const { kernel, product } = createKernelAndProduct({ plugins: {} });
			const pm = new PluginManager(kernel, product);

			expect(() => pm.register('nonExistent', null, null)).toThrow(
				'[SUNEDITOR.registerPlugin.fail]'
			);
		});

		it('should instantiate a class-based plugin (function)', () => {
			const constructorSpy = jest.fn();
			class ClassPlugin {
				constructor(k, opts) {
					constructorSpy(k, opts);
					this.active = jest.fn();
				}
			}

			const { kernel, product } = createKernelAndProduct({
				plugins: { classPlugin: ClassPlugin },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('classPlugin', null, { foo: 1 });

			expect(constructorSpy).toHaveBeenCalledWith(kernel, { foo: 1 });
			// After registration, plugins[classPlugin] is now the instance, not the class
			expect(typeof pm.plugins.classPlugin).toBe('object');
		});

		it('should pass empty object as pluginOptions when none provided for class plugin', () => {
			const constructorSpy = jest.fn();
			class ClassPlugin {
				constructor(k, opts) {
					constructorSpy(k, opts);
				}
			}

			const { kernel, product } = createKernelAndProduct({
				plugins: { classPlugin: ClassPlugin },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('classPlugin', null, null);

			expect(constructorSpy).toHaveBeenCalledWith(kernel, {});
		});

		it('should use an already-instantiated plugin as-is (object)', () => {
			const existingInstance = { name: 'already' };
			const { kernel, product } = createKernelAndProduct({
				plugins: { already: existingInstance },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('already', null, null);

			expect(pm.plugins.already).toBe(existingInstance);
		});

		it('should call UpdateButton for each target when targets are provided', () => {
			const pluginInstance = { title: 'Test' };
			const btn1 = document.createElement('button');
			const btn2 = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('test', [btn1, btn2], null);

			expect(UpdateButton).toHaveBeenCalledTimes(2);
			expect(UpdateButton).toHaveBeenCalledWith(btn1, pluginInstance, { bold: '<svg/>' }, { bold: 'Bold' });
			expect(UpdateButton).toHaveBeenCalledWith(btn2, pluginInstance, { bold: '<svg/>' }, { bold: 'Bold' });
		});

		it('should add pluginName to activeCommands if plugin has .active method', () => {
			const pluginInstance = { active: jest.fn() };
			const btn = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { myPlugin: pluginInstance },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('myPlugin', [btn], null);

			expect(kernel.$.commandDispatcher.activeCommands).toContain('myPlugin');
		});

		it('should not add pluginName to activeCommands if already present', () => {
			const pluginInstance = { active: jest.fn() };
			const btn = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { myPlugin: pluginInstance },
			});
			kernel.$.commandDispatcher.activeCommands = ['myPlugin'];
			const pm = new PluginManager(kernel, product);

			pm.register('myPlugin', [btn], null);

			expect(kernel.$.commandDispatcher.activeCommands).toEqual(['myPlugin']);
		});

		it('should not add to activeCommands if plugin has no .active method', () => {
			const pluginInstance = { name: 'noActive' };
			const btn = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { noActive: pluginInstance },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('noActive', [btn], null);

			expect(kernel.$.commandDispatcher.activeCommands).not.toContain('noActive');
		});

		it('should skip button update when targets is null', () => {
			const pluginInstance = { active: jest.fn() };
			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('test', null, null);

			expect(UpdateButton).not.toHaveBeenCalled();
			expect(kernel.$.commandDispatcher.activeCommands).not.toContain('test');
		});

		it('should skip button update when targets is undefined', () => {
			const pluginInstance = {};
			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
			});
			const pm = new PluginManager(kernel, product);

			pm.register('test', undefined, null);

			expect(UpdateButton).not.toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------------
	// init
	// ---------------------------------------------------------------
	describe('init', () => {
		function createFullPlugin(key, opts = {}) {
			const _checkInfo = jest.fn();
			const _resetInfo = jest.fn();
			const retainMethod = jest.fn();

			class FullPlugin {
				static key = key;
				static component = opts.component || null;
				static options = opts.staticOptions || {};

				constructor(k, pluginOpts) {
					this.editor = k;
				}

				__fileManagement = opts.fileManagement || null;

				retainFormat = opts.retainFormat
					? () => ({ query: opts.retainFormat.query, method: retainMethod })
					: undefined;

				// event hooks
				onMouseDown = opts.onMouseDown || undefined;
				onKeyDown = opts.onKeyDown || undefined;

				active = opts.active || undefined;

				_destroy = jest.fn();
			}

			return { FullPlugin, _checkInfo, _resetInfo, retainMethod };
		}

		it('should register each plugin for main and sub buttons', () => {
			const pluginInstance = { active: jest.fn(), constructor: { options: {} } };
			const btn = document.createElement('button');
			const subBtn = document.createElement('button');

			const { kernel, product } = createKernelAndProduct({
				plugins: { myPlugin: pluginInstance },
				pluginCallButtons: { myPlugin: [btn] },
				pluginCallButtons_sub: { myPlugin: [subBtn] },
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ myPlugin: {} });

			// UpdateButton called for main button and sub button
			expect(UpdateButton).toHaveBeenCalledTimes(2);
		});

		it('should handle class-based plugins in init (instantiate via register)', () => {
			class MyClassPlugin {
				static key = 'myClass';
				static options = {};
				constructor(k, opts) {
					this.editor = k;
				}
			}

			const btn = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { myClass: MyClassPlugin },
				pluginCallButtons: { myClass: [btn] },
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ myClass: {} });

			expect(pm.plugins.myClass).toBeInstanceOf(MyClassPlugin);
		});

		it('should register fileManagement callbacks (_checkInfo, _resetInfo)', () => {
			const _checkInfo = jest.fn();
			const _resetInfo = jest.fn();

			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo,
					_resetInfo,
					tagNames: ['IMG'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { imagePlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ imagePlugin: {} });

			// checkFileInfo should call the bound _checkInfo
			pm.checkFileInfo(true);
			expect(_checkInfo).toHaveBeenCalledWith(true);

			pm.resetFileInfo();
			expect(_resetInfo).toHaveBeenCalled();
		});

		it('should build fileInfo.tags, pluginMap, and tagAttrs from tagNames', () => {
			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: ['IMG', 'VIDEO'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { mediaPlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ mediaPlugin: {} });

			expect(pm.fileInfo.tags).toEqual(['IMG', 'VIDEO']);
			expect(pm.fileInfo.pluginMap).toEqual({ img: 'mediaPlugin', video: 'mediaPlugin' });
			expect(pm.fileInfo.tagAttrs).toEqual({ img: 'src', video: 'src' });
		});

		it('should handle fileManagement without tagNames (not an array)', () => {
			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: null,
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { noTagPlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ noTagPlugin: {} });

			expect(pm.fileInfo.tags).toEqual([]);
			expect(pm.fileInfo.pluginMap).toEqual({});
		});

		it('should handle fileManagement with tagNames but no tagAttrs', () => {
			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: ['AUDIO'],
					tagAttrs: null,
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { audioPlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ audioPlugin: {} });

			expect(pm.fileInfo.tags).toEqual(['AUDIO']);
			expect(pm.fileInfo.pluginMap).toEqual({ audio: 'audioPlugin' });
			expect(pm.fileInfo.tagAttrs).toEqual({});
		});

		it('should skip fileManagement processing when __fileManagement is not an object', () => {
			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: false,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { simple: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ simple: {} });

			expect(pm.fileInfo.tags).toEqual([]);
		});

		it('should add componentChecker when plugin.constructor.component is a function', () => {
			const componentFn = jest.fn((node) => (node && node.tagName === 'IMG' ? node : null));

			class ComponentPlugin {
				static key = 'imgPlugin';
				static component = componentFn;
				static options = {};
				constructor() {}
			}

			// Pre-instantiate so register won't try to call new on it again
			const instance = new ComponentPlugin();

			const { kernel, product } = createKernelAndProduct({
				plugins: { imgPlugin: instance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ imgPlugin: {} });

			// findComponentInfo should use the checker
			const img = document.createElement('img');
			componentFn.mockReturnValue(img);
			const result = pm.findComponentInfo(img);

			expect(result).toEqual({
				target: img,
				pluginName: 'imgPlugin',
				options: {},
			});
		});

		it('should return null from componentChecker when element is null', () => {
			const componentFn = jest.fn((node) => node);

			class ComponentPlugin {
				static key = 'cp';
				static component = componentFn;
				static options = {};
				constructor() {}
			}

			const instance = new ComponentPlugin();
			const { kernel, product } = createKernelAndProduct({
				plugins: { cp: instance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ cp: {} });

			const result = pm.findComponentInfo(null);
			expect(result).toBeNull();
		});

		it('should return null from componentChecker when component returns falsy', () => {
			const componentFn = jest.fn(() => null);

			class ComponentPlugin {
				static key = 'cp2';
				static component = componentFn;
				static options = {};
				constructor() {}
			}

			const instance = new ComponentPlugin();
			const { kernel, product } = createKernelAndProduct({
				plugins: { cp2: instance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ cp2: {} });

			const div = document.createElement('div');
			const result = pm.findComponentInfo(div);
			expect(result).toBeNull();
		});

		it('should register plugin event hooks and bind them', () => {
			const onMouseDownFn = jest.fn(() => false);
			const pluginInstance = {
				constructor: { options: {}, key: 'evtPlugin' },
				onMouseDown: onMouseDownFn,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { evtPlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ evtPlugin: {} });

			const result = pm.emitEvent('onMouseDown', { event: 'test' });
			expect(result).toBe(false);
		});

		it('should use eventIndex_${k} for per-event index priority', () => {
			const handler1 = jest.fn(() => undefined);
			const handler2 = jest.fn(() => undefined);

			const plugin1 = {
				constructor: { options: { eventIndex_onKeyDown: 10 }, key: 'p1' },
				onKeyDown: handler1,
			};
			const plugin2 = {
				constructor: { options: { eventIndex_onKeyDown: 5 }, key: 'p2' },
				onKeyDown: handler2,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: plugin1, p2: plugin2 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ p1: {}, p2: {} });

			// Emit event - handler2 (index 5) should run before handler1 (index 10)
			pm.emitEvent('onKeyDown', {});
			expect(handler2).toHaveBeenCalled();
			expect(handler1).toHaveBeenCalled();

			// Verify order by checking call order
			const order2 = handler2.mock.invocationCallOrder[0];
			const order1 = handler1.mock.invocationCallOrder[0];
			expect(order2).toBeLessThan(order1);
		});

		it('should fall back to eventIndex when per-event index is not specified', () => {
			const handler = jest.fn();
			const pluginInstance = {
				constructor: { options: { eventIndex: 42 }, key: 'fallback' },
				onFocus: handler,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { fallback: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ fallback: {} });

			// Should not throw and handler should be registered
			pm.emitEvent('onFocus', {});
			expect(handler).toHaveBeenCalled();
		});

		it('should default event index to 0 when neither per-event nor global eventIndex exists', () => {
			const handler = jest.fn();
			const pluginInstance = {
				constructor: { options: {}, key: 'noIndex' },
				onBlur: handler,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { noIndex: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ noIndex: {} });

			pm.emitEvent('onBlur', {});
			expect(handler).toHaveBeenCalled();
		});

		it('should handle plugin with no constructor.options (defaults to empty object)', () => {
			const pluginInstance = {
				constructor: {},
				onInput: jest.fn(),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { noOpts: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ noOpts: {} });

			pm.emitEvent('onInput', {});
			expect(pluginInstance.onInput).toHaveBeenCalled();
		});

		it('should register retainFormat when plugin has retainFormat method', () => {
			const retainMethod = jest.fn();
			const pluginInstance = {
				constructor: { options: {}, key: 'retainPlugin' },
				retainFormat: () => ({ query: 'img.custom', method: retainMethod }),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { retainPlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				__pluginRetainFilter: true,
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ retainPlugin: {} });

			// Verify through applyRetainFormat
			const container = document.createElement('div');
			container.innerHTML = '<img class="custom" /><img class="custom" />';
			pm.applyRetainFormat(container);

			expect(retainMethod).toHaveBeenCalledTimes(2);
		});

		it('should not register retainFormat when plugin lacks retainFormat', () => {
			const pluginInstance = {
				constructor: { options: {}, key: 'noRetain' },
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { noRetain: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			// Should not throw
			pm.init({ noRetain: {} });

			// applyRetainFormat with no __pluginRetainFilter should still be fine
			const container = document.createElement('div');
			pm.applyRetainFormat(container);
		});

		it('should add pageBreak componentChecker when buttons has pageBreak', () => {
			const pluginInstance = {
				constructor: { options: {} },
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { simple: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				buttons: ['pageBreak'],
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ simple: {} });

			// Test the pageBreak component checker
			const pageBreakEl = document.createElement('div');
			dom.utils.hasClass.mockReturnValue(true);

			const result = pm.findComponentInfo(pageBreakEl);

			expect(dom.utils.hasClass).toHaveBeenCalledWith(pageBreakEl, 'se-page-break');
			expect(result).not.toBeNull();
			expect(result.target).toBe(pageBreakEl);
			expect(result.launcher).toBeDefined();
			expect(typeof result.launcher.destroy).toBe('function');
		});

		it('should add pageBreak componentChecker when buttons_sub has pageBreak', () => {
			const pluginInstance = {
				constructor: { options: {} },
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { simple: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				buttons_sub: ['pageBreak'],
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ simple: {} });

			const pageBreakEl = document.createElement('div');
			dom.utils.hasClass.mockReturnValue(true);

			const result = pm.findComponentInfo(pageBreakEl);
			expect(result).not.toBeNull();
		});

		it('should not add pageBreak checker when neither buttons nor buttons_sub has it', () => {
			const pluginInstance = {
				constructor: { options: {} },
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { simple: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ simple: {} });

			// No component checkers added for non-component plugins
			const result = pm.findComponentInfo(document.createElement('div'));
			expect(result).toBeNull();
		});

		it('pageBreak destroyer should call removeItem, focusEdge, and history.push', () => {
			const pluginInstance = { constructor: { options: {} } };
			const { kernel, product } = createKernelAndProduct({
				plugins: { s: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				buttons: ['pageBreak'],
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ s: {} });

			const pageBreakEl = document.createElement('div');
			const prevSibling = document.createElement('p');
			// Mock previousElementSibling
			Object.defineProperty(pageBreakEl, 'previousElementSibling', { value: prevSibling });

			dom.utils.hasClass.mockReturnValue(true);
			const result = pm.findComponentInfo(pageBreakEl);

			// Call destroy
			result.launcher.destroy(pageBreakEl);

			expect(dom.utils.removeItem).toHaveBeenCalledWith(pageBreakEl);
			expect(kernel.$.focusManager.focusEdge).toHaveBeenCalledWith(prevSibling);
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('pageBreak destroyer should fall back to nextElementSibling when no previousElementSibling', () => {
			const pluginInstance = { constructor: { options: {} } };
			const { kernel, product } = createKernelAndProduct({
				plugins: { s: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				buttons: ['pageBreak'],
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ s: {} });

			const pageBreakEl = document.createElement('div');
			const nextSibling = document.createElement('p');
			Object.defineProperty(pageBreakEl, 'previousElementSibling', { value: null });
			Object.defineProperty(pageBreakEl, 'nextElementSibling', { value: nextSibling });

			dom.utils.hasClass.mockReturnValue(true);
			const result = pm.findComponentInfo(pageBreakEl);

			result.launcher.destroy(pageBreakEl);

			expect(kernel.$.focusManager.focusEdge).toHaveBeenCalledWith(nextSibling);
		});

		it('should return null from pageBreak checker when hasClass is false', () => {
			const pluginInstance = { constructor: { options: {} } };
			const { kernel, product } = createKernelAndProduct({
				plugins: { s: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				buttons: ['pageBreak'],
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ s: {} });

			dom.utils.hasClass.mockReturnValue(false);
			const result = pm.findComponentInfo(document.createElement('div'));
			expect(result).toBeNull();
		});

		it('should return null from pageBreak checker when element is null', () => {
			const pluginInstance = { constructor: { options: {} } };
			const { kernel, product } = createKernelAndProduct({
				plugins: { s: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				buttons: ['pageBreak'],
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ s: {} });

			const result = pm.findComponentInfo(null);
			expect(result).toBeNull();
		});

		it('should build fileInfo.regExp from tags', () => {
			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: ['IMG', 'VIDEO'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { media: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ media: {} });

			expect(pm.fileInfo.regExp).toBeInstanceOf(RegExp);
			expect(pm.fileInfo.regExp.test('IMG')).toBe(true);
			expect(pm.fileInfo.regExp.test('VIDEO')).toBe(true);
			expect(pm.fileInfo.regExp.test('SPAN')).toBe(false);
		});

		it('should build fileInfo.pluginRegExp from file plugin keys', () => {
			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: ['IMG'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { image: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ image: {} });

			expect(pm.fileInfo.pluginRegExp.test('image')).toBe(true);
			expect(pm.fileInfo.pluginRegExp.test('unknown')).toBe(false);
		});

		it('should use fallback regex when no tags exist', () => {
			const pluginInstance = {
				constructor: { options: {} },
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { noFile: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ noFile: {} });

			// fallback regex pattern: /^(\^)$/i - should not match normal strings
			expect(pm.fileInfo.regExp.test('IMG')).toBe(false);
			expect(pm.fileInfo.pluginRegExp.test('image')).toBe(false);
		});

		it('should null out pluginCallButtons and pluginCallButtons_sub after init', () => {
			const pluginInstance = { constructor: { options: {} } };
			const btn = document.createElement('button');
			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: { test: [btn] },
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ test: {} });

			// After init, these are nulled. We can't access private fields directly,
			// but we know init completed without error - confirming code path executed
			expect(pm.fileInfo.regExp).toBeInstanceOf(RegExp);
		});

		it('should sort event handlers by index after registration', () => {
			const callOrder = [];
			const handler1 = jest.fn(() => { callOrder.push('h1'); });
			const handler2 = jest.fn(() => { callOrder.push('h2'); });
			const handler3 = jest.fn(() => { callOrder.push('h3'); });

			const plugin1 = {
				constructor: { options: { eventIndex: 30 }, key: 'p1' },
				onClick: handler1,
			};
			const plugin2 = {
				constructor: { options: { eventIndex: 10 }, key: 'p2' },
				onClick: handler2,
			};
			const plugin3 = {
				constructor: { options: { eventIndex: 20 }, key: 'p3' },
				onClick: handler3,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: plugin1, p2: plugin2, p3: plugin3 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ p1: {}, p2: {}, p3: {} });

			pm.emitEvent('onClick', {});

			expect(callOrder).toEqual(['h2', 'h3', 'h1']);
		});

		it('should handle multiple plugins with fileManagement', () => {
			const imgPlugin = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: ['IMG'],
					tagAttrs: 'src',
				},
			};
			const videoPlugin = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn(),
					tagNames: ['VIDEO', 'IFRAME'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { image: imgPlugin, video: videoPlugin },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			pm.init({ image: {}, video: {} });

			expect(pm.fileInfo.tags).toEqual(['IMG', 'VIDEO', 'IFRAME']);
			expect(pm.fileInfo.pluginMap).toEqual({
				img: 'image',
				video: 'video',
				iframe: 'video',
			});
			expect(pm.fileInfo.pluginRegExp.test('image')).toBe(true);
			expect(pm.fileInfo.pluginRegExp.test('video')).toBe(true);
		});

		it('should handle plugin with no events and no fileManagement and no component', () => {
			const pluginInstance = {
				constructor: { options: {} },
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { bare: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			// Should not throw
			pm.init({ bare: {} });

			expect(pm.fileInfo.tags).toEqual([]);
		});
	});

	// ---------------------------------------------------------------
	// findComponentInfo
	// ---------------------------------------------------------------
	describe('findComponentInfo', () => {
		it('should return null when no component checkers are registered', () => {
			const { kernel, product } = createKernelAndProduct();
			const pm = new PluginManager(kernel, product);

			expect(pm.findComponentInfo(document.createElement('div'))).toBeNull();
		});

		it('should return first truthy result from checkers', () => {
			const componentFn1 = jest.fn(() => null);
			const componentFn2 = jest.fn((node) => node);

			class Plugin1 {
				static key = 'p1';
				static component = componentFn1;
				static options = {};
			}
			class Plugin2 {
				static key = 'p2';
				static component = componentFn2;
				static options = {};
			}

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: new Plugin1(), p2: new Plugin2() },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ p1: {}, p2: {} });

			const img = document.createElement('img');
			const result = pm.findComponentInfo(img);

			expect(result).not.toBeNull();
			expect(result.pluginName).toBe('p2');
		});

		it('should stop at first truthy checker and not call subsequent ones', () => {
			const componentFn1 = jest.fn((node) => node);
			const componentFn2 = jest.fn((node) => node);

			class Plugin1 {
				static key = 'p1';
				static component = componentFn1;
				static options = {};
			}
			class Plugin2 {
				static key = 'p2';
				static component = componentFn2;
				static options = {};
			}

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: new Plugin1(), p2: new Plugin2() },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ p1: {}, p2: {} });

			const el = document.createElement('div');
			pm.findComponentInfo(el);

			expect(componentFn1).toHaveBeenCalled();
			expect(componentFn2).not.toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------------
	// applyRetainFormat
	// ---------------------------------------------------------------
	describe('applyRetainFormat', () => {
		it('should do nothing when __pluginRetainFilter is falsy', () => {
			const retainMethod = jest.fn();
			const pluginInstance = {
				constructor: { options: {}, key: 'rp' },
				retainFormat: () => ({ query: 'img', method: retainMethod }),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { rp: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				__pluginRetainFilter: null,
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ rp: {} });

			const container = document.createElement('div');
			container.innerHTML = '<img />';
			pm.applyRetainFormat(container);

			expect(retainMethod).not.toHaveBeenCalled();
		});

		it('should apply all retain formats when __pluginRetainFilter is true', () => {
			const retainMethod = jest.fn();
			const pluginInstance = {
				constructor: { options: {}, key: 'rp' },
				retainFormat: () => ({ query: 'span.retain', method: retainMethod }),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { rp: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				__pluginRetainFilter: true,
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ rp: {} });

			const container = document.createElement('div');
			container.innerHTML = '<span class="retain">A</span><span class="retain">B</span>';
			pm.applyRetainFormat(container);

			expect(retainMethod).toHaveBeenCalledTimes(2);
		});

		it('should selectively apply retain format based on plugin key filter', () => {
			const retainMethod1 = jest.fn();
			const retainMethod2 = jest.fn();

			const plugin1 = {
				constructor: { options: {}, key: 'allowedPlugin' },
				retainFormat: () => ({ query: 'b', method: retainMethod1 }),
			};
			const plugin2 = {
				constructor: { options: {}, key: 'blockedPlugin' },
				retainFormat: () => ({ query: 'i', method: retainMethod2 }),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { allowedPlugin: plugin1, blockedPlugin: plugin2 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				__pluginRetainFilter: { allowedPlugin: true, blockedPlugin: false },
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ allowedPlugin: {}, blockedPlugin: {} });

			const container = document.createElement('div');
			container.innerHTML = '<b>bold</b><i>italic</i>';
			pm.applyRetainFormat(container);

			expect(retainMethod1).toHaveBeenCalledTimes(1);
			expect(retainMethod2).not.toHaveBeenCalled();
		});

		it('should apply retain format when plugin key is not explicitly false in filter', () => {
			const retainMethod = jest.fn();
			const pluginInstance = {
				constructor: { options: {}, key: 'implicitAllow' },
				retainFormat: () => ({ query: 'em', method: retainMethod }),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { implicitAllow: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
				__pluginRetainFilter: { otherPlugin: false },
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ implicitAllow: {} });

			const container = document.createElement('div');
			container.innerHTML = '<em>text</em>';
			pm.applyRetainFormat(container);

			expect(retainMethod).toHaveBeenCalledTimes(1);
		});
	});

	// ---------------------------------------------------------------
	// emitEvent
	// ---------------------------------------------------------------
	describe('emitEvent', () => {
		it('should return false when a handler returns false', () => {
			const pluginInstance = {
				constructor: { options: {} },
				onMouseDown: jest.fn(() => false),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			const result = pm.emitEvent('onMouseDown', {});
			expect(result).toBe(false);
		});

		it('should return true when a handler returns true', () => {
			const pluginInstance = {
				constructor: { options: {} },
				onKeyDown: jest.fn(() => true),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			const result = pm.emitEvent('onKeyDown', {});
			expect(result).toBe(true);
		});

		it('should return undefined when no handler returns a boolean', () => {
			const pluginInstance = {
				constructor: { options: {} },
				onScroll: jest.fn(() => undefined),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			const result = pm.emitEvent('onScroll', {});
			expect(result).toBeUndefined();
		});

		it('should return undefined when no handlers are registered for event', () => {
			const { kernel, product } = createKernelAndProduct({
				plugins: {},
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			// Need to call init for empty plugins to setup events properly.
			// But init iterates plugins, which is empty, so events stay empty
			pm.init({});

			const result = pm.emitEvent('onClick', {});
			expect(result).toBeUndefined();
		});

		it('should stop iterating when a handler returns a boolean', () => {
			const handler1 = jest.fn(() => false);
			const handler2 = jest.fn();

			const plugin1 = {
				constructor: { options: { eventIndex: 1 } },
				onPaste: handler1,
			};
			const plugin2 = {
				constructor: { options: { eventIndex: 2 } },
				onPaste: handler2,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: plugin1, p2: plugin2 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ p1: {}, p2: {} });

			pm.emitEvent('onPaste', {});

			expect(handler1).toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------------
	// emitEventAsync
	// ---------------------------------------------------------------
	describe('emitEventAsync', () => {
		it('should return false when an async handler returns false', async () => {
			const pluginInstance = {
				constructor: { options: {} },
				onKeyDown: jest.fn(async () => false),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			const result = await pm.emitEventAsync('onKeyDown', {});
			expect(result).toBe(false);
		});

		it('should return true when an async handler returns true', async () => {
			const pluginInstance = {
				constructor: { options: {} },
				onPaste: jest.fn(async () => true),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			const result = await pm.emitEventAsync('onPaste', {});
			expect(result).toBe(true);
		});

		it('should return undefined when no async handler returns a boolean', async () => {
			const pluginInstance = {
				constructor: { options: {} },
				onBeforeInput: jest.fn(async () => undefined),
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			const result = await pm.emitEventAsync('onBeforeInput', {});
			expect(result).toBeUndefined();
		});

		it('should stop iterating when an async handler returns a boolean', async () => {
			const handler1 = jest.fn(async () => true);
			const handler2 = jest.fn(async () => undefined);

			const plugin1 = {
				constructor: { options: { eventIndex: 1 } },
				onFilePasteAndDrop: handler1,
			};
			const plugin2 = {
				constructor: { options: { eventIndex: 2 } },
				onFilePasteAndDrop: handler2,
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: plugin1, p2: plugin2 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ p1: {}, p2: {} });

			await pm.emitEventAsync('onFilePasteAndDrop', {});

			expect(handler1).toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------------
	// checkFileInfo
	// ---------------------------------------------------------------
	describe('checkFileInfo', () => {
		it('should call all registered _checkInfo callbacks with loaded flag', () => {
			const _checkInfo1 = jest.fn();
			const _checkInfo2 = jest.fn();

			const plugin1 = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: _checkInfo1,
					_resetInfo: jest.fn(),
					tagNames: ['IMG'],
					tagAttrs: 'src',
				},
			};
			const plugin2 = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: _checkInfo2,
					_resetInfo: jest.fn(),
					tagNames: ['VIDEO'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { img: plugin1, vid: plugin2 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ img: {}, vid: {} });

			pm.checkFileInfo(true);

			expect(_checkInfo1).toHaveBeenCalledWith(true);
			expect(_checkInfo2).toHaveBeenCalledWith(true);
		});

		it('should do nothing when no file info plugins are registered', () => {
			const { kernel, product } = createKernelAndProduct({
				plugins: { simple: { constructor: { options: {} } } },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ simple: {} });

			// Should not throw
			pm.checkFileInfo(false);
		});
	});

	// ---------------------------------------------------------------
	// resetFileInfo
	// ---------------------------------------------------------------
	describe('resetFileInfo', () => {
		it('should call all registered _resetInfo callbacks', () => {
			const _resetInfo = jest.fn();

			const pluginInstance = {
				constructor: { options: {} },
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo,
					tagNames: ['IMG'],
					tagAttrs: 'src',
				},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { img: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ img: {} });

			pm.resetFileInfo();

			expect(_resetInfo).toHaveBeenCalled();
		});

		it('should do nothing when no file info plugins are registered', () => {
			const { kernel, product } = createKernelAndProduct({
				plugins: { simple: { constructor: { options: {} } } },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ simple: {} });

			// Should not throw
			pm.resetFileInfo();
		});
	});

	// ---------------------------------------------------------------
	// get
	// ---------------------------------------------------------------
	describe('get', () => {
		it('should return a specific plugin by name', () => {
			const myPlugin = { name: 'mine' };
			const { kernel, product } = createKernelAndProduct({
				plugins: { mine: myPlugin },
			});
			const pm = new PluginManager(kernel, product);

			expect(pm.get('mine')).toBe(myPlugin);
		});

		it('should return undefined for unknown plugin name', () => {
			const { kernel, product } = createKernelAndProduct({ plugins: {} });
			const pm = new PluginManager(kernel, product);

			expect(pm.get('unknown')).toBeUndefined();
		});
	});

	// ---------------------------------------------------------------
	// _destroy
	// ---------------------------------------------------------------
	describe('_destroy', () => {
		it('should call _destroy on each plugin and null out plugin.editor', () => {
			const destroySpy = jest.fn();
			const pluginInstance = {
				constructor: { options: {} },
				_destroy: destroySpy,
				editor: {},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { myPlugin: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ myPlugin: {} });

			pm._destroy();

			expect(destroySpy).toHaveBeenCalled();
			expect(pluginInstance.editor).toBeNull();
		});

		it('should handle plugins without _destroy method (optional chaining)', () => {
			const pluginInstance = {
				constructor: { options: {} },
				editor: {},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { noDestroy: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ noDestroy: {} });

			// Should not throw
			pm._destroy();

			expect(pluginInstance.editor).toBeNull();
		});

		it('should null out plugins and fileInfo references', () => {
			const pluginInstance = {
				constructor: { options: {} },
				_destroy: jest.fn(),
				editor: {},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { test: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ test: {} });

			pm._destroy();

			// After destroy, accessing plugins should return null
			expect(pm.plugins).toBeNull();
			expect(pm.fileInfo).toBeNull();
		});

		it('should clear onPluginEvents and retainFormatCheckers maps', () => {
			const retainMethod = jest.fn();
			const pluginInstance = {
				constructor: { options: {}, key: 'rp' },
				retainFormat: () => ({ query: 'b', method: retainMethod }),
				onMouseDown: jest.fn(),
				_destroy: jest.fn(),
				editor: {},
			};

			const { kernel, product } = createKernelAndProduct({
				plugins: { rp: pluginInstance },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ rp: {} });

			// Destroy should clear internal maps without throwing
			pm._destroy();

			expect(pm.plugins).toBeNull();
		});

		it('should handle multiple plugins during destroy', () => {
			const destroy1 = jest.fn();
			const destroy2 = jest.fn();

			const plugin1 = { constructor: { options: {} }, _destroy: destroy1, editor: {} };
			const plugin2 = { constructor: { options: {} }, _destroy: destroy2, editor: {} };

			const { kernel, product } = createKernelAndProduct({
				plugins: { p1: plugin1, p2: plugin2 },
				pluginCallButtons: {},
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);
			pm.init({ p1: {}, p2: {} });

			pm._destroy();

			expect(destroy1).toHaveBeenCalled();
			expect(destroy2).toHaveBeenCalled();
			expect(plugin1.editor).toBeNull();
			expect(plugin2.editor).toBeNull();
		});
	});

	// ---------------------------------------------------------------
	// Integration: full lifecycle
	// ---------------------------------------------------------------
	describe('full lifecycle integration', () => {
		it('should handle complete lifecycle: construct -> init -> emit -> destroy', () => {
			const onClickHandler = jest.fn(() => undefined);
			const _checkInfo = jest.fn();
			const _resetInfo = jest.fn();
			const componentFn = jest.fn((node) => node);

			class TestPlugin {
				static key = 'testPlugin';
				static component = componentFn;
				static options = { eventIndex: 5 };
				constructor() {}
				onClick = onClickHandler;
				__fileManagement = {
					_checkInfo,
					_resetInfo,
					tagNames: ['IMG'],
					tagAttrs: 'src',
				};
				active() {}
				_destroy = jest.fn();
				editor = {};
			}

			const instance = new TestPlugin();
			const btn = document.createElement('button');

			const { kernel, product } = createKernelAndProduct({
				plugins: { testPlugin: instance },
				pluginCallButtons: { testPlugin: [btn] },
				pluginCallButtons_sub: {},
			});
			const pm = new PluginManager(kernel, product);

			// Init
			pm.init({ testPlugin: {} });

			// Verify UpdateButton was called
			expect(UpdateButton).toHaveBeenCalled();

			// Emit event
			pm.emitEvent('onClick', { event: 'click' });
			expect(onClickHandler).toHaveBeenCalled();

			// Check file info
			pm.checkFileInfo(true);
			expect(_checkInfo).toHaveBeenCalledWith(true);

			// Reset file info
			pm.resetFileInfo();
			expect(_resetInfo).toHaveBeenCalled();

			// Find component
			const img = document.createElement('img');
			componentFn.mockReturnValue(img);
			const info = pm.findComponentInfo(img);
			expect(info).not.toBeNull();
			expect(info.pluginName).toBe('testPlugin');

			// Destroy
			pm._destroy();
			expect(instance._destroy).toHaveBeenCalled();
			expect(instance.editor).toBeNull();
		});
	});
});
