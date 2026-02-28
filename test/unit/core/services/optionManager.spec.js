/**
 * @fileoverview Unit tests for core/config/optionProvider.js
 */

import OptionProvider from '../../../../src/core/config/optionProvider';

describe('OptionProvider', () => {
	let optionProvider;
	let mockEditor;
	let mockProduct;
	let mockOptions;

	beforeEach(() => {
		mockEditor = {
			frameRoots: new Map(),
			plugins: {},
			context: { get: jest.fn() },
			eventManager: { __addStatusbarEvent: jest.fn() },
			history: { resetDelayTime: jest.fn() },
			format: { __resetBrLineBreak: jest.fn() },
			html: { __resetAutoStyleify: jest.fn() },
			char: { display: jest.fn() },
			uiManager: { setTheme: jest.fn(), setDir: jest.fn(), setEditorStyle: jest.fn() },
			viewer: { codeView: jest.fn(), showBlocks: jest.fn() },
			events: {},
		};

		mockProduct = {
			options: new Map([
				['plugins', []],
				['buttonList', ['bold', 'italic']],
				['strictMode', true],
			]),
		};

		mockOptions = {};

		optionProvider = new OptionProvider(mockEditor, mockProduct, mockOptions);
	});

	describe('constructor', () => {
		it('should create an OptionProvider instance', () => {
			expect(optionProvider).toBeInstanceOf(OptionProvider);
		});

		it('should have options and frameOptions getters', () => {
			expect(optionProvider.options).toBeDefined();
			expect(optionProvider.frameOptions).toBeDefined();
		});
	});

	describe('options (BaseOptionsMap)', () => {
		it('should get values correctly', () => {
			expect(optionProvider.options.get('plugins')).toEqual([]);
			expect(optionProvider.options.get('buttonList')).toEqual(['bold', 'italic']);
			expect(optionProvider.options.get('strictMode')).toBe(true);
			expect(optionProvider.options.get('nonexistent')).toBeUndefined();
		});

		it('should set values correctly', () => {
			optionProvider.options.set('theme', 'custom');
			expect(optionProvider.options.get('theme')).toBe('custom');
		});

		it('should check existence correctly', () => {
			expect(optionProvider.options.has('plugins')).toBe(true);
			expect(optionProvider.options.has('buttonList')).toBe(true);
			expect(optionProvider.options.has('nonexistent')).toBe(false);
		});

		it('should get all values as object', () => {
			const all = optionProvider.options.getAll();
			expect(all).toEqual({
				plugins: [],
				buttonList: ['bold', 'italic'],
				strictMode: true,
			});
		});

		it('should set many values at once', () => {
			optionProvider.options.setMany(
				new Map([
					['mode', 'balloon'],
					['lang', 'ko'],
					['shortcuts', { 'ctrl+b': 'bold' }],
				]),
			);

			expect(optionProvider.options.get('mode')).toBe('balloon');
			expect(optionProvider.options.get('lang')).toBe('ko');
			expect(optionProvider.options.get('shortcuts')).toEqual({ 'ctrl+b': 'bold' });
		});

		it('should reset with new map', () => {
			const newMap = new Map([
				['elementWhitelist', 'p|div'],
				['textDirection', 'rtl'],
			]);
			optionProvider.options.reset(newMap);

			expect(optionProvider.options.get('elementWhitelist')).toBe('p|div');
			expect(optionProvider.options.get('textDirection')).toBe('rtl');
			expect(optionProvider.options.get('plugins')).toBeUndefined();
		});

		it('should clear all values', () => {
			optionProvider.options.clear();
			expect(optionProvider.options.getAll()).toEqual({});
			expect(optionProvider.options.has('plugins')).toBe(false);
		});

		it('should handle complex data types', () => {
			const complexData = new Map([
				['array', [1, 2, 3]],
				['object', { a: 1, b: 2 }],
				['function', () => 'test'],
				['null', null],
				['undefined', undefined],
			]);

			optionProvider.options.setMany(complexData);

			expect(optionProvider.options.get('array')).toEqual([1, 2, 3]);
			expect(optionProvider.options.get('object')).toEqual({ a: 1, b: 2 });
			expect(typeof optionProvider.options.get('function')).toBe('function');
			expect(optionProvider.options.get('null')).toBeNull();
			expect(optionProvider.options.get('undefined')).toBeUndefined();
		});

		it('should return size correctly', () => {
			expect(optionProvider.options.size()).toBe(3);
			optionProvider.options.set('newKey', 'value');
			expect(optionProvider.options.size()).toBe(4);
		});
	});

	describe('frameOptions (FrameOptionsMap)', () => {
		beforeEach(() => {
			// Initialize with some frame options
			optionProvider.frameOptions.set('width', '100%');
			optionProvider.frameOptions.set('height', '300px');
			optionProvider.frameOptions.set('iframe', false);
		});

		it('should get values correctly', () => {
			expect(optionProvider.frameOptions.get('width')).toBe('100%');
			expect(optionProvider.frameOptions.get('height')).toBe('300px');
			expect(optionProvider.frameOptions.get('iframe')).toBe(false);
			expect(optionProvider.frameOptions.get('nonexistent')).toBeUndefined();
		});

		it('should set values correctly', () => {
			optionProvider.frameOptions.set('maxWidth', '800px');
			expect(optionProvider.frameOptions.get('maxWidth')).toBe('800px');
		});

		it('should check existence correctly', () => {
			expect(optionProvider.frameOptions.has('width')).toBe(true);
			expect(optionProvider.frameOptions.has('height')).toBe(true);
			expect(optionProvider.frameOptions.has('nonexistent')).toBe(false);
		});

		it('should get all values as object', () => {
			const all = optionProvider.frameOptions.getAll();
			expect(all).toEqual({
				width: '100%',
				height: '300px',
				iframe: false,
			});
		});

		it('should set many values at once', () => {
			optionProvider.frameOptions.setMany(
				new Map([
					['minWidth', '200px'],
					['maxHeight', '500px'],
					['statusbar', true],
				]),
			);

			expect(optionProvider.frameOptions.get('minWidth')).toBe('200px');
			expect(optionProvider.frameOptions.get('maxHeight')).toBe('500px');
			expect(optionProvider.frameOptions.get('statusbar')).toBe(true);
		});

		it('should reset with new map', () => {
			const newMap = new Map([
				['theme', 'dark'],
				['mode', 'inline'],
			]);
			optionProvider.frameOptions.reset(newMap);

			expect(optionProvider.frameOptions.get('theme')).toBe('dark');
			expect(optionProvider.frameOptions.get('mode')).toBe('inline');
			expect(optionProvider.frameOptions.get('width')).toBeUndefined();
		});

		it('should clear all values', () => {
			optionProvider.frameOptions.clear();
			expect(optionProvider.frameOptions.getAll()).toEqual({});
			expect(optionProvider.frameOptions.has('width')).toBe(false);
		});

		it('should return size correctly', () => {
			expect(optionProvider.frameOptions.size()).toBe(3);
			optionProvider.frameOptions.set('newKey', 'value');
			expect(optionProvider.frameOptions.size()).toBe(4);
		});
	});

	describe('Integration tests', () => {
		it('should work with both options and frameOptions independently', () => {
			// Set base options
			optionProvider.options.set('theme', 'dark');
			// Set frame options
			optionProvider.frameOptions.set('width', '100%');

			expect(optionProvider.options.get('theme')).toBe('dark');
			expect(optionProvider.frameOptions.get('width')).toBe('100%');

			// Should not interfere with each other
			expect(optionProvider.options.has('width')).toBe(false);
			expect(optionProvider.frameOptions.has('theme')).toBe(false);
		});
	});
});
