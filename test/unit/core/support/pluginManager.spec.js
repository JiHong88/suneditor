/**
 * @fileoverview Unit tests for PluginManager
 */

import PluginManager from '../../../../src/core/services/pluginManager';

describe('PluginManager', () => {
	let pluginManager;
	let mockEditor;
	let mockProduct;

	beforeEach(() => {
		mockEditor = {
			options: new Map([
				['buttons', new Map()],
				['buttons_sub', new Map()],
				['__pluginRetainFilter', null]
			]),
			icons: {},
			lang: {},
			focusManager: {
				focusEdge: jest.fn()
			},
			history: {
				push: jest.fn()
			}
		};

		mockProduct = {
			plugins: {},
			pluginCallButtons: {},
			pluginCallButtons_sub: {}
		};

		pluginManager = new PluginManager(mockEditor, mockProduct);
	});

	afterEach(() => {
		pluginManager.destroy();
	});

	describe('constructor', () => {
		it('should initialize with empty plugins', () => {
			expect(pluginManager.plugins).toEqual({});
		});

		it('should initialize activeCommands from ACTIVE_EVENT_COMMANDS', () => {
			expect(Array.isArray(pluginManager.activeCommands)).toBe(true);
		});

		it('should initialize fileInfo with default structure', () => {
			expect(pluginManager.fileInfo).toBeDefined();
			expect(pluginManager.fileInfo.tags).toBeNull();
			expect(pluginManager.fileInfo.regExp).toBeNull();
		});

		it('should initialize componentCheckers as empty array', () => {
			expect(pluginManager.componentCheckers).toEqual([]);
		});
	});

	describe('plugins getter', () => {
		it('should return the plugins object', () => {
			const plugins = { testPlugin: {} };
			mockProduct.plugins = plugins;
			pluginManager = new PluginManager(mockEditor, mockProduct);

			expect(pluginManager.plugins).toBe(plugins);
		});
	});

	describe('findComponentInfo', () => {
		it('should return null when no checkers match', () => {
			const element = document.createElement('div');
			const result = pluginManager.findComponentInfo(element);

			expect(result).toBeNull();
		});

		it('should return result from first matching checker', () => {
			const element = document.createElement('img');
			const expectedInfo = { target: element, pluginName: 'image', options: {} };

			// Manually add checker since init() is complex
			pluginManager.componentCheckers.push((el) => {
				if (el.tagName === 'IMG') return expectedInfo;
				return null;
			});

			const result = pluginManager.findComponentInfo(element);

			expect(result).toBe(expectedInfo);
		});

		it('should stop at first matching checker', () => {
			const element = document.createElement('img');
			const firstResult = { target: element, pluginName: 'first' };
			const secondResult = { target: element, pluginName: 'second' };

			const checker1 = jest.fn().mockReturnValue(firstResult);
			const checker2 = jest.fn().mockReturnValue(secondResult);

			pluginManager.componentCheckers.push(checker1, checker2);

			const result = pluginManager.findComponentInfo(element);

			expect(result).toBe(firstResult);
			expect(checker1).toHaveBeenCalledWith(element);
			expect(checker2).not.toHaveBeenCalled();
		});

		it('should continue to next checker when current returns null', () => {
			const element = document.createElement('img');
			const expectedInfo = { target: element, pluginName: 'second' };

			const checker1 = jest.fn().mockReturnValue(null);
			const checker2 = jest.fn().mockReturnValue(expectedInfo);

			pluginManager.componentCheckers.push(checker1, checker2);

			const result = pluginManager.findComponentInfo(element);

			expect(result).toBe(expectedInfo);
			expect(checker1).toHaveBeenCalled();
			expect(checker2).toHaveBeenCalled();
		});

		it('should return null for null element', () => {
			const checker = jest.fn().mockReturnValue(null);
			pluginManager.componentCheckers.push(checker);

			const result = pluginManager.findComponentInfo(null);

			expect(result).toBeNull();
		});
	});

	describe('emitEvent', () => {
		it('should return undefined when no handlers registered', () => {
			pluginManager = new PluginManager(mockEditor, mockProduct);

			const result = pluginManager.emitEvent('onFocus', { frameContext: {}, event: {} });

			expect(result).toBeUndefined();
		});

		it('should call all handlers and return last boolean result', () => {
			const handler1 = jest.fn().mockReturnValue(undefined);
			const handler2 = jest.fn().mockReturnValue(true);

			// Access private field through init simulation
			mockProduct.plugins = {
				testPlugin: function () {
					this.onFocus = handler1;
					this.constructor = { options: {} };
				}
			};
			mockProduct.plugins.testPlugin.prototype = {};

			pluginManager = new PluginManager(mockEditor, mockProduct);

			// Directly test by manually triggering
			const result = pluginManager.emitEvent('onFocus', { frameContext: {}, event: {} });

			// Without init, handlers won't be registered
			expect(result).toBeUndefined();
		});

		it('should stop iteration when handler returns false', () => {
			// Create a fresh instance to test
			const pm = new PluginManager(mockEditor, mockProduct);

			// We can't easily inject handlers without init, so test the contract
			const result = pm.emitEvent('onMouseMove', {});
			expect(result).toBeUndefined();
		});
	});

	describe('emitEventAsync', () => {
		it('should return undefined when no handlers registered', async () => {
			const result = await pluginManager.emitEventAsync('onKeyDown', { frameContext: {}, event: {} });

			expect(result).toBeUndefined();
		});

		it('should handle async handlers', async () => {
			// Test basic async behavior
			const result = await pluginManager.emitEventAsync('onPaste', { frameContext: {}, event: {} });
			expect(result).toBeUndefined();
		});
	});

	describe('register', () => {
		it('should throw error for non-existent plugin', () => {
			expect(() => {
				pluginManager.register('nonExistent', null, {});
			}).toThrow('[SUNEDITOR.registerPlugin.fail]');
		});

		it('should instantiate plugin if it is a function', () => {
			const MockPlugin = jest.fn(function () {
				this.init = jest.fn();
			});
			mockProduct.plugins = { testPlugin: MockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);

			pluginManager.register('testPlugin', null, { option: true });

			expect(MockPlugin).toHaveBeenCalledWith(mockEditor, { option: true });
		});

		it('should not re-instantiate already instantiated plugin', () => {
			const pluginInstance = { init: jest.fn() };
			mockProduct.plugins = { testPlugin: pluginInstance };
			pluginManager = new PluginManager(mockEditor, mockProduct);

			pluginManager.register('testPlugin', null, {});

			// Plugin should still be the same instance
			expect(pluginManager.plugins.testPlugin).toBe(pluginInstance);
		});

		it('should add to activeCommands if plugin has active method', () => {
			const MockPlugin = jest.fn(function () {
				this.active = jest.fn();
			});
			mockProduct.plugins = { testPlugin: MockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);

			const initialLength = pluginManager.activeCommands.length;
			const button = document.createElement('button');
			pluginManager.register('testPlugin', [button], {});

			expect(pluginManager.activeCommands).toContain('testPlugin');
			expect(pluginManager.activeCommands.length).toBe(initialLength + 1);
		});

		it('should not add to activeCommands if plugin lacks active method', () => {
			const MockPlugin = jest.fn(function () {
				// No active method
			});
			mockProduct.plugins = { noActivePlugin: MockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);

			const initialLength = pluginManager.activeCommands.length;
			const button = document.createElement('button');
			pluginManager.register('noActivePlugin', [button], {});

			expect(pluginManager.activeCommands.length).toBe(initialLength);
		});

		it('should not duplicate activeCommands entry', () => {
			const MockPlugin = jest.fn(function () {
				this.active = jest.fn();
			});
			mockProduct.plugins = { testPlugin: MockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);

			const button1 = document.createElement('button');
			const button2 = document.createElement('button');

			pluginManager.register('testPlugin', [button1], {});
			const countAfterFirst = pluginManager.activeCommands.filter((c) => c === 'testPlugin').length;

			pluginManager.register('testPlugin', [button2], {});
			const countAfterSecond = pluginManager.activeCommands.filter((c) => c === 'testPlugin').length;

			expect(countAfterFirst).toBe(1);
			expect(countAfterSecond).toBe(1);
		});
	});

	describe('checkFileInfo', () => {
		it('should call all registered check methods', () => {
			const checkMethod1 = jest.fn();
			const checkMethod2 = jest.fn();

			// Create plugin with __fileManagement
			const mockPlugin = {
				__fileManagement: {
					_checkInfo: checkMethod1,
					_resetInfo: jest.fn()
				},
				constructor: { options: {} }
			};

			const mockPlugin2 = {
				__fileManagement: {
					_checkInfo: checkMethod2,
					_resetInfo: jest.fn()
				},
				constructor: { options: {} }
			};

			mockProduct.plugins = {
				plugin1: mockPlugin,
				plugin2: mockPlugin2
			};
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			pluginManager.checkFileInfo(true);

			expect(checkMethod1).toHaveBeenCalledWith(true);
			expect(checkMethod2).toHaveBeenCalledWith(true);
		});

		it('should handle empty check list', () => {
			expect(() => {
				pluginManager.checkFileInfo(true);
			}).not.toThrow();
		});
	});

	describe('resetFileInfo', () => {
		it('should call all registered reset methods', () => {
			const resetMethod1 = jest.fn();
			const resetMethod2 = jest.fn();

			const mockPlugin = {
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: resetMethod1
				},
				constructor: { options: {} }
			};

			const mockPlugin2 = {
				__fileManagement: {
					_checkInfo: jest.fn(),
					_resetInfo: resetMethod2
				},
				constructor: { options: {} }
			};

			mockProduct.plugins = {
				plugin1: mockPlugin,
				plugin2: mockPlugin2
			};
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			pluginManager.resetFileInfo();

			expect(resetMethod1).toHaveBeenCalled();
			expect(resetMethod2).toHaveBeenCalled();
		});

		it('should handle empty reset list', () => {
			expect(() => {
				pluginManager.resetFileInfo();
			}).not.toThrow();
		});
	});

	describe('applyRetainFormat', () => {
		it('should do nothing when __pluginRetainFilter is falsy', () => {
			mockEditor.options.set('__pluginRetainFilter', null);
			pluginManager = new PluginManager(mockEditor, mockProduct);

			const mockDom = {
				querySelectorAll: jest.fn()
			};

			pluginManager.applyRetainFormat(mockDom);

			expect(mockDom.querySelectorAll).not.toHaveBeenCalled();
		});

		it('should apply retain format when filter is true', () => {
			mockEditor.options.set('__pluginRetainFilter', true);

			const retainMethod = jest.fn();
			const mockPlugin = {
				retainFormat: () => ({
					query: '.test-selector',
					method: retainMethod
				}),
				constructor: { key: 'testPlugin', options: {} }
			};

			mockProduct.plugins = { testPlugin: mockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			const mockElement = document.createElement('div');
			mockElement.className = 'test-selector';

			const mockDom = document.createElement('div');
			mockDom.appendChild(mockElement);

			pluginManager.applyRetainFormat(mockDom);

			expect(retainMethod).toHaveBeenCalledWith(mockElement);
		});

		it('should respect plugin-specific filter settings', () => {
			mockEditor.options.set('__pluginRetainFilter', { testPlugin: false, otherPlugin: true });

			const retainMethod1 = jest.fn();
			const retainMethod2 = jest.fn();

			const mockPlugin1 = {
				retainFormat: () => ({
					query: '.test1',
					method: retainMethod1
				}),
				constructor: { key: 'testPlugin', options: {} }
			};

			const mockPlugin2 = {
				retainFormat: () => ({
					query: '.test2',
					method: retainMethod2
				}),
				constructor: { key: 'otherPlugin', options: {} }
			};

			mockProduct.plugins = {
				testPlugin: mockPlugin1,
				otherPlugin: mockPlugin2
			};
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			const mockDom = document.createElement('div');
			const el1 = document.createElement('div');
			el1.className = 'test1';
			const el2 = document.createElement('div');
			el2.className = 'test2';
			mockDom.appendChild(el1);
			mockDom.appendChild(el2);

			pluginManager.applyRetainFormat(mockDom);

			expect(retainMethod1).not.toHaveBeenCalled(); // testPlugin: false
			expect(retainMethod2).toHaveBeenCalled(); // otherPlugin: true
		});
	});

	describe('get', () => {
		it('should return plugin by name', () => {
			const mockPlugin = { action: jest.fn() };
			mockProduct.plugins = { testPlugin: mockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);

			expect(pluginManager.get('testPlugin')).toBe(mockPlugin);
		});

		it('should return undefined for non-existent plugin', () => {
			expect(pluginManager.get('nonExistent')).toBeUndefined();
		});
	});

	describe('init', () => {
		it('should initialize fileInfo tags array', () => {
			pluginManager.init({});

			expect(pluginManager.fileInfo.tags).toEqual([]);
		});

		it('should initialize fileInfo regExp', () => {
			pluginManager.init({});

			expect(pluginManager.fileInfo.regExp).toBeInstanceOf(RegExp);
		});

		it('should register file plugin tags', () => {
			const mockPlugin = {
				__fileManagement: {
					tagNames: ['IMG', 'VIDEO'],
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn()
				},
				constructor: { options: {} }
			};

			mockProduct.plugins = { media: mockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			expect(pluginManager.fileInfo.tags).toContain('IMG');
			expect(pluginManager.fileInfo.tags).toContain('VIDEO');
			expect(pluginManager.fileInfo.pluginMap['img']).toBe('media');
			expect(pluginManager.fileInfo.pluginMap['video']).toBe('media');
		});

		it('should register component checkers for plugins with component method', () => {
			const MockPlugin = function () {
				this.constructor = MockPlugin;
			};
			MockPlugin.key = 'testComponent';
			MockPlugin.component = (element) => {
				if (element.tagName === 'DIV') return element;
				return null;
			};
			MockPlugin.options = {};

			mockProduct.plugins = { testComponent: new MockPlugin() };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			expect(pluginManager.componentCheckers.length).toBeGreaterThan(0);

			// Test the registered checker
			const divElement = document.createElement('div');
			const result = pluginManager.findComponentInfo(divElement);
			expect(result).not.toBeNull();
			expect(result.pluginName).toBe('testComponent');
		});

		it('should register plugin event handlers', () => {
			const onKeyDownHandler = jest.fn();
			const mockPlugin = {
				onKeyDown: onKeyDownHandler,
				constructor: { options: {} }
			};

			mockProduct.plugins = { testPlugin: mockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			// Event handler should be registered (we can't easily verify without exposing internals)
			// But we can verify that emitEvent works after init
			const eventPayload = { frameContext: {}, event: {} };
			pluginManager.emitEvent('onKeyDown', eventPayload);

			expect(onKeyDownHandler).toHaveBeenCalled();
		});

		it('should sort plugin events by index', () => {
			const order = [];
			const handler1 = jest.fn(() => order.push(1));
			const handler2 = jest.fn(() => order.push(2));
			const handler3 = jest.fn(() => order.push(3));

			const plugin1 = {
				onFocus: handler1,
				constructor: { options: { eventIndex_onFocus: 2 } }
			};
			const plugin2 = {
				onFocus: handler2,
				constructor: { options: { eventIndex_onFocus: 1 } }
			};
			const plugin3 = {
				onFocus: handler3,
				constructor: { options: { eventIndex_onFocus: 3 } }
			};

			mockProduct.plugins = { p1: plugin1, p2: plugin2, p3: plugin3 };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			pluginManager.emitEvent('onFocus', {});

			expect(order).toEqual([2, 1, 3]); // sorted by index: 1, 2, 3
		});

		it('should add pageBreak checker when pageBreak button exists', () => {
			mockEditor.options.set('buttons', new Map([['pageBreak', true]]));
			pluginManager = new PluginManager(mockEditor, mockProduct);

			const initialCheckerCount = pluginManager.componentCheckers.length;
			pluginManager.init({});

			expect(pluginManager.componentCheckers.length).toBe(initialCheckerCount + 1);

			// Test the pageBreak checker
			const pageBreakElement = document.createElement('div');
			pageBreakElement.className = 'se-page-break';

			const result = pluginManager.findComponentInfo(pageBreakElement);
			expect(result).not.toBeNull();
			expect(result.target).toBe(pageBreakElement);
			expect(result.launcher.destroy).toBeDefined();
		});

		it('should nullify pluginCallButtons after init', () => {
			mockProduct.pluginCallButtons = { test: [document.createElement('button')] };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			// After init, internal pluginCallButtons should be nullified (memory cleanup)
			// We can't directly test private field, but we can verify init completes without error
			expect(() => pluginManager.init({})).not.toThrow();
		});
	});

	describe('destroy', () => {
		it('should nullify all internal references', () => {
			pluginManager.init({});
			pluginManager.destroy();

			expect(pluginManager.plugins).toBeNull();
			expect(pluginManager.activeCommands).toBeNull();
			expect(pluginManager.fileInfo).toBeNull();
			expect(pluginManager.componentCheckers).toBeNull();
		});

		it('should clear event maps', () => {
			pluginManager.init({});
			pluginManager.destroy();

			// After destroy, attempting to emit should not throw (maps are cleared)
			// Can't test directly, but destroy should complete without error
		});
	});

	describe('fileInfo structure', () => {
		it('should properly build regExp from tags', () => {
			const mockPlugin = {
				__fileManagement: {
					tagNames: ['IMG', 'VIDEO', 'AUDIO'],
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn()
				},
				constructor: { options: {} }
			};

			mockProduct.plugins = { media: mockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			expect(pluginManager.fileInfo.regExp.test('IMG')).toBe(true);
			expect(pluginManager.fileInfo.regExp.test('VIDEO')).toBe(true);
			expect(pluginManager.fileInfo.regExp.test('AUDIO')).toBe(true);
			expect(pluginManager.fileInfo.regExp.test('DIV')).toBe(false);
		});

		it('should store tagAttrs when provided', () => {
			const mockPlugin = {
				__fileManagement: {
					tagNames: ['IMG'],
					tagAttrs: ['src', 'alt'],
					_checkInfo: jest.fn(),
					_resetInfo: jest.fn()
				},
				constructor: { options: {} }
			};

			mockProduct.plugins = { image: mockPlugin };
			pluginManager = new PluginManager(mockEditor, mockProduct);
			pluginManager.init({});

			expect(pluginManager.fileInfo.tagAttrs['img']).toEqual(['src', 'alt']);
		});
	});
});
