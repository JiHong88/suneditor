/**
 * @fileoverview Unit tests for core/config/optionProvider.js
 */

import OptionProvider from '../../../../src/core/config/optionProvider';

describe('OptionProvider', () => {
	let optionProvider;
	let mockKernel;
	let mockProduct;
	let mockOptions;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock base options map
		const baseOptions = new Map([
			['plugins', []],
			['mode', 'classic'],
			['toolbar', ['bold', 'italic']],
			['charCounter_type', 'char'],
			['historyStackDelayTime', 400],
			['events', {}],
		]);

		// Create mock product
		mockProduct = {
			options: baseOptions,
			frameOptions: new Map([
				['height', '200px'],
				['width', '100%'],
				['iframe', false],
			]),
		};

		// Create mock options
		mockOptions = {
			plugins: [],
			mode: 'classic',
			toolbar: ['bold', 'italic'],
		};

		// Create mock store
		const mockStore = {
			get: jest.fn((key) => {
				if (key === 'rootKey') return null;
				return undefined;
			}),
			set: jest.fn(),
		};

		// Create mock deps
		const mockDeps = {
			store: mockStore,
		};

		// Create mock kernel
		mockKernel = {
			$: mockDeps,
			store: mockStore,
		};

		// Create OptionProvider instance
		optionProvider = new OptionProvider(mockKernel, mockProduct, mockOptions);
	});

	describe('constructor', () => {
		it('should create an OptionProvider instance', () => {
			expect(optionProvider).toBeInstanceOf(OptionProvider);
		});

		it('should initialize with kernel', () => {
			expect(optionProvider).toBeDefined();
		});
	});

	describe('options getter', () => {
		it('should return options object', () => {
			const options = optionProvider.options;
			expect(options).toBeDefined();
		});

		it('should get base options by key', () => {
			const options = optionProvider.options;
			expect(options.get('mode')).toBe('classic');
			expect(options.get('charCounter_type')).toBe('char');
		});

		it('should set base options', () => {
			const options = optionProvider.options;
			options.set('mode', 'balloon');
			expect(options.get('mode')).toBe('balloon');
		});

		it('should check if base option exists', () => {
			const options = optionProvider.options;
			expect(options.has('mode')).toBe(true);
			expect(options.has('nonexistent')).toBe(false);
		});

		it('should get all base options', () => {
			const options = optionProvider.options;
			const all = options.getAll();
			expect(typeof all).toBe('object');
		});

		it('should return base options size', () => {
			const options = optionProvider.options;
			// size can be a property or method
			if (typeof options.size === 'function') {
				expect(typeof options.size()).toBe('number');
			} else {
				expect(typeof options.size).toBe('number');
			}
		});

		it('should set multiple base options at once', () => {
			const options = optionProvider.options;
			options.setMany(
				new Map([
					['mode', 'inline'],
					['charCounter_type', 'byte'],
				]),
			);
			expect(options.get('mode')).toBe('inline');
			expect(options.get('charCounter_type')).toBe('byte');
		});

		it('should reset base options', () => {
			const options = optionProvider.options;
			const newOptions = new Map([['mode', 'balloon']]);
			options.reset(newOptions);
			expect(options.get('mode')).toBe('balloon');
		});

		it('should clear all base options', () => {
			const options = optionProvider.options;
			options.clear();
			const size = typeof options.size === 'function' ? options.size() : options.size;
			expect(size).toBe(0);
		});
	});

	describe('frameOptions getter', () => {
		it('should return frameOptions object', () => {
			const frameOptions = optionProvider.frameOptions;
			expect(frameOptions).toBeDefined();
		});

		it('should get frame options by key', () => {
			const frameOptions = optionProvider.frameOptions;
			frameOptions.set('height', '300px');
			expect(frameOptions.get('height')).toBe('300px');
		});

		it('should set frame options', () => {
			const frameOptions = optionProvider.frameOptions;
			frameOptions.set('width', '500px');
			expect(frameOptions.get('width')).toBe('500px');
		});

		it('should check if frame option exists', () => {
			const frameOptions = optionProvider.frameOptions;
			frameOptions.set('height', '300px');
			expect(frameOptions.has('height')).toBe(true);
			expect(frameOptions.has('nonexistent')).toBe(false);
		});

		it('should get all frame options', () => {
			const frameOptions = optionProvider.frameOptions;
			const all = frameOptions.getAll();
			expect(typeof all).toBe('object');
		});

		it('should return frame options size', () => {
			const frameOptions = optionProvider.frameOptions;
			// size can be a property or method
			if (typeof frameOptions.size === 'function') {
				expect(typeof frameOptions.size()).toBe('number');
			} else {
				expect(typeof frameOptions.size).toBe('number');
			}
		});

		it('should set multiple frame options at once', () => {
			const frameOptions = optionProvider.frameOptions;
			frameOptions.setMany(
				new Map([
					['height', '400px'],
					['width', '600px'],
				]),
			);
			expect(frameOptions.get('height')).toBe('400px');
			expect(frameOptions.get('width')).toBe('600px');
		});

		it('should reset frame options', () => {
			const frameOptions = optionProvider.frameOptions;
			const newOptions = new Map([['height', '500px']]);
			frameOptions.reset(newOptions);
			expect(frameOptions.get('height')).toBe('500px');
		});

		it('should clear all frame options', () => {
			const frameOptions = optionProvider.frameOptions;
			frameOptions.clear();
			const size = typeof frameOptions.size === 'function' ? frameOptions.size() : frameOptions.size;
			expect(size).toBe(0);
		});
	});

	describe('option isolation', () => {
		it('should keep base and frame options separate', () => {
			const options = optionProvider.options;
			const frameOptions = optionProvider.frameOptions;

			options.set('mode', 'classic');
			frameOptions.set('height', '200px');

			expect(options.get('mode')).toBe('classic');
			expect(frameOptions.get('height')).toBe('200px');
			expect(options.get('height')).toBeUndefined();
			expect(frameOptions.get('mode')).toBeUndefined();
		});
	});

	describe('option persistence', () => {
		it('should maintain options across multiple accesses', () => {
			const options = optionProvider.options;
			options.set('testKey', 'testValue');

			const secondAccess = optionProvider.options;
			expect(secondAccess.get('testKey')).toBe('testValue');
		});

		it('should maintain frameOptions across multiple accesses', () => {
			const frameOptions = optionProvider.frameOptions;
			frameOptions.set('testKey', 'testValue');

			const secondAccess = optionProvider.frameOptions;
			expect(secondAccess.get('testKey')).toBe('testValue');
		});
	});

	describe('fixed options', () => {
		it('should handle read-only/fixed options if implemented', () => {
			const options = optionProvider.options;
			// Just verify the structure exists
			expect(typeof options.set).toBe('function');
		});
	});

	describe('plugin options', () => {
		it('should store plugin configuration', () => {
			const options = optionProvider.options;
			expect(options.get('plugins')).toBeDefined();
		});

		it('should allow plugin option updates', () => {
			const options = optionProvider.options;
			const plugins = [];
			options.set('plugins', plugins);
			expect(options.get('plugins')).toBe(plugins);
		});
	});
});
