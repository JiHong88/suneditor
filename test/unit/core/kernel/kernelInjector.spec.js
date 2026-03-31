/**
 * @fileoverview Unit tests for core/kernel/kernelInjector.js
 */

import KernelInjector from '../../../../src/core/kernel/kernelInjector';

describe('KernelInjector', () => {
	let kernelInjector;
	let mockKernel;
	let mockDeps;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock deps object
		mockDeps = {
			facade: { html: { get: jest.fn() } },
			store: { get: jest.fn() },
			contextProvider: {},
			optionProvider: {},
			instanceCheck: {},
			eventManager: {},
			frameRoots: new Map(),
			context: new Map(),
			options: new Map(),
			frameContext: new Map(),
			frameOptions: new Map(),
			offset: {},
			selection: {},
			format: {},
			inline: {},
			listFormat: {},
			html: {},
			nodeTransform: {},
			char: {},
			component: {},
			focusManager: {},
			pluginManager: {},
			plugins: {},
			ui: {},
			commandDispatcher: {},
			history: {},
			shortcuts: {},
			toolbar: {},
			subToolbar: {},
			menu: {},
			viewer: {},
		};

		// Create mock kernel
		mockKernel = {
			$: mockDeps,
			store: { get: jest.fn() },
		};

		// Create KernelInjector instance
		kernelInjector = new KernelInjector(mockKernel);
	});

	describe('constructor', () => {
		it('should create a KernelInjector instance', () => {
			expect(kernelInjector).toBeInstanceOf(KernelInjector);
		});

		it('should assign $ from kernel', () => {
			expect(kernelInjector.$).toBe(mockDeps);
		});

		it('should assign $ to the kernel.$', () => {
			expect(kernelInjector.$).toBe(mockKernel.$);
		});
	});

	describe('$ property (deps access)', () => {
		it('should provide access to facade', () => {
			expect(kernelInjector.$.facade).toBeDefined();
			expect(kernelInjector.$.facade).toBe(mockDeps.facade);
		});

		it('should provide access to store', () => {
			expect(kernelInjector.$.store).toBeDefined();
			expect(kernelInjector.$.store).toBe(mockDeps.store);
		});

		it('should provide access to config providers', () => {
			expect(kernelInjector.$.contextProvider).toBeDefined();
			expect(kernelInjector.$.optionProvider).toBeDefined();
			expect(kernelInjector.$.instanceCheck).toBeDefined();
			expect(kernelInjector.$.eventManager).toBeDefined();
		});

		it('should provide access to context maps', () => {
			expect(kernelInjector.$.frameRoots).toBeDefined();
			expect(kernelInjector.$.context).toBeDefined();
			expect(kernelInjector.$.options).toBeDefined();
			expect(kernelInjector.$.frameContext).toBeDefined();
			expect(kernelInjector.$.frameOptions).toBeDefined();
		});

		it('should provide access to DOM logic classes', () => {
			expect(kernelInjector.$.offset).toBeDefined();
			expect(kernelInjector.$.selection).toBeDefined();
			expect(kernelInjector.$.format).toBeDefined();
			expect(kernelInjector.$.inline).toBeDefined();
			expect(kernelInjector.$.listFormat).toBeDefined();
			expect(kernelInjector.$.html).toBeDefined();
			expect(kernelInjector.$.nodeTransform).toBeDefined();
			expect(kernelInjector.$.char).toBeDefined();
		});

		it('should provide access to shell logic classes', () => {
			expect(kernelInjector.$.component).toBeDefined();
			expect(kernelInjector.$.focusManager).toBeDefined();
			expect(kernelInjector.$.pluginManager).toBeDefined();
			expect(kernelInjector.$.plugins).toBeDefined();
			expect(kernelInjector.$.ui).toBeDefined();
			expect(kernelInjector.$.commandDispatcher).toBeDefined();
			expect(kernelInjector.$.history).toBeDefined();
			expect(kernelInjector.$.shortcuts).toBeDefined();
		});

		it('should provide access to panel logic classes', () => {
			expect(kernelInjector.$.toolbar).toBeDefined();
			expect(kernelInjector.$.subToolbar).toBeDefined();
			expect(kernelInjector.$.menu).toBeDefined();
			expect(kernelInjector.$.viewer).toBeDefined();
		});
	});

	describe('dependency injection pattern', () => {
		it('should be used as a base class for plugins', () => {
			class TestPlugin extends KernelInjector {
				doSomething() {
					return this.$.html;
				}
			}

			const plugin = new TestPlugin(mockKernel);
			expect(plugin.doSomething()).toBe(mockDeps.html);
		});

		it('should be used as a base class for modules', () => {
			class TestModule extends KernelInjector {
				getSelection() {
					return this.$.selection;
				}
			}

			const module = new TestModule(mockKernel);
			expect(module.getSelection()).toBe(mockDeps.selection);
		});

		it('should maintain shared $ reference across instances', () => {
			const plugin1 = new KernelInjector(mockKernel);
			const plugin2 = new KernelInjector(mockKernel);

			expect(plugin1.$).toBe(plugin2.$);
		});
	});

	describe('access pattern', () => {
		it('should support this.$ in derived classes', () => {
			class TestConsumer extends KernelInjector {
				getFormat() {
					return this.$.format;
				}

				getSelection() {
					return this.$.selection;
				}

				getHistory() {
					return this.$.history;
				}
			}

			const consumer = new TestConsumer(mockKernel);
			expect(consumer.getFormat()).toBe(mockDeps.format);
			expect(consumer.getSelection()).toBe(mockDeps.selection);
			expect(consumer.getHistory()).toBe(mockDeps.history);
		});

		it('should allow method calls through $', () => {
			mockDeps.selection.get = jest.fn(() => null);
			mockDeps.html.set = jest.fn();

			kernelInjector.$.selection.get();
			kernelInjector.$.html.set('content');

			expect(mockDeps.selection.get).toHaveBeenCalled();
			expect(mockDeps.html.set).toHaveBeenCalled();
		});
	});

	describe('no circular references', () => {
		it('should avoid circular references', () => {
			// $ should not contain references to the injector itself
			expect(kernelInjector.$ !== kernelInjector).toBe(true);
		});

		it('should provide kernel only through $', () => {
			// The kernel is not directly accessible, only through $
			expect(kernelInjector.kernel).toBeUndefined();
		});
	});

	describe('caching behavior', () => {
		it('should use same $ reference for all accesses', () => {
			const firstAccess = kernelInjector.$;
			const secondAccess = kernelInjector.$;

			expect(firstAccess).toBe(secondAccess);
		});

		it('should preserve $ reference when accessed multiple times', () => {
			const reference1 = kernelInjector.$.format;
			const reference2 = kernelInjector.$.format;

			expect(reference1).toBe(reference2);
		});
	});

	describe('extensibility', () => {
		it('should allow subclasses to extend KernelInjector', () => {
			class CustomConsumer extends KernelInjector {
				constructor(kernel) {
					super(kernel);
					this.customProp = 'custom';
				}

				customMethod() {
					return this.$.eventManager;
				}
			}

			const custom = new CustomConsumer(mockKernel);
			expect(custom.customProp).toBe('custom');
			expect(custom.customMethod()).toBe(mockDeps.eventManager);
		});

		it('should maintain $ even in complex inheritance chains', () => {
			class BaseClass extends KernelInjector {}

			class DerivedClass extends BaseClass {
				getDeps() {
					return this.$;
				}
			}

			const derived = new DerivedClass(mockKernel);
			expect(derived.getDeps()).toBe(mockDeps);
		});
	});

	describe('type compatibility', () => {
		it('should be assignable to Kernel type', () => {
			const injector = new KernelInjector(mockKernel);
			expect(injector instanceof KernelInjector).toBe(true);
		});

		it('should support duck typing for $ access', () => {
			const injector = new KernelInjector(mockKernel);
			const hasDollarSign = '$' in injector;
			expect(hasDollarSign).toBe(true);
		});
	});

	describe('minimal design', () => {
		it('should only have $ property', () => {
			const keys = Object.getOwnPropertyNames(kernelInjector);
			expect(keys).toContain('$');
			// No other instance properties should be added
			expect(keys.length).toBe(1);
		});

		it('should be lightweight for performance', () => {
			const injector1 = new KernelInjector(mockKernel);
			const injector2 = new KernelInjector(mockKernel);

			// Both share the same $ reference
			expect(injector1.$ === injector2.$).toBe(true);
		});
	});
});
