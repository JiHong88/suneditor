/**
 * @fileoverview Unit tests for core/services/optionManager.js
 */

import OptionManager from '../../../../src/core/services/optionManager';

describe('OptionManager', () => {
	let optionManager;
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
			events: {}
		};

		mockProduct = {
			options: new Map([
				['plugins', []],
				['buttonList', ['bold', 'italic']],
				['strictMode', true]
			])
		};

		mockOptions = {};

		optionManager = new OptionManager(mockEditor, mockProduct, mockOptions);
	});

	describe('constructor', () => {
		it('should create an OptionManager instance', () => {
			expect(optionManager).toBeInstanceOf(OptionManager);
		});

		it('should have options and frameOptions getters', () => {
			expect(optionManager.options).toBeDefined();
			expect(optionManager.frameOptions).toBeDefined();
		});
	});

	describe('options (BaseOptionsMap)', () => {
		it('should get values correctly', () => {
			expect(optionManager.options.get('plugins')).toEqual([]);
			expect(optionManager.options.get('buttonList')).toEqual(['bold', 'italic']);
			expect(optionManager.options.get('strictMode')).toBe(true);
			expect(optionManager.options.get('nonexistent')).toBeUndefined();
		});

		it('should set values correctly', () => {
			optionManager.options.set('theme', 'custom');
			expect(optionManager.options.get('theme')).toBe('custom');
		});

		it('should check existence correctly', () => {
			expect(optionManager.options.has('plugins')).toBe(true);
			expect(optionManager.options.has('buttonList')).toBe(true);
			expect(optionManager.options.has('nonexistent')).toBe(false);
		});

		it('should get all values as object', () => {
			const all = optionManager.options.getAll();
			expect(all).toEqual({
				plugins: [],
				buttonList: ['bold', 'italic'],
				strictMode: true
			});
		});

		it('should set many values at once', () => {
			optionManager.options.setMany({
				mode: 'balloon',
				lang: 'ko',
				shortcuts: { 'ctrl+b': 'bold' }
			});

			expect(optionManager.options.get('mode')).toBe('balloon');
			expect(optionManager.options.get('lang')).toBe('ko');
			expect(optionManager.options.get('shortcuts')).toEqual({ 'ctrl+b': 'bold' });
		});

		it('should reset with new map', () => {
			const newMap = new Map([
				['elementWhitelist', 'p|div'],
				['textDirection', 'rtl']
			]);
			optionManager.options.reset(newMap);

			expect(optionManager.options.get('elementWhitelist')).toBe('p|div');
			expect(optionManager.options.get('textDirection')).toBe('rtl');
			expect(optionManager.options.get('plugins')).toBeUndefined();
		});

		it('should clear all values', () => {
			optionManager.options.clear();
			expect(optionManager.options.getAll()).toEqual({});
			expect(optionManager.options.has('plugins')).toBe(false);
		});

		it('should handle complex data types', () => {
			const complexData = {
				array: [1, 2, 3],
				object: { a: 1, b: 2 },
				function: () => 'test',
				null: null,
				undefined: undefined
			};

			optionManager.options.setMany(complexData);

			expect(optionManager.options.get('array')).toEqual([1, 2, 3]);
			expect(optionManager.options.get('object')).toEqual({ a: 1, b: 2 });
			expect(typeof optionManager.options.get('function')).toBe('function');
			expect(optionManager.options.get('null')).toBeNull();
			expect(optionManager.options.get('undefined')).toBeUndefined();
		});

		it('should return size correctly', () => {
			expect(optionManager.options.size()).toBe(3);
			optionManager.options.set('newKey', 'value');
			expect(optionManager.options.size()).toBe(4);
		});
	});

	describe('frameOptions (FrameOptionsMap)', () => {
		beforeEach(() => {
			// Initialize with some frame options
			optionManager.frameOptions.set('width', '100%');
			optionManager.frameOptions.set('height', '300px');
			optionManager.frameOptions.set('iframe', false);
		});

		it('should get values correctly', () => {
			expect(optionManager.frameOptions.get('width')).toBe('100%');
			expect(optionManager.frameOptions.get('height')).toBe('300px');
			expect(optionManager.frameOptions.get('iframe')).toBe(false);
			expect(optionManager.frameOptions.get('nonexistent')).toBeUndefined();
		});

		it('should set values correctly', () => {
			optionManager.frameOptions.set('maxWidth', '800px');
			expect(optionManager.frameOptions.get('maxWidth')).toBe('800px');
		});

		it('should check existence correctly', () => {
			expect(optionManager.frameOptions.has('width')).toBe(true);
			expect(optionManager.frameOptions.has('height')).toBe(true);
			expect(optionManager.frameOptions.has('nonexistent')).toBe(false);
		});

		it('should get all values as object', () => {
			const all = optionManager.frameOptions.getAll();
			expect(all).toEqual({
				width: '100%',
				height: '300px',
				iframe: false
			});
		});

		it('should set many values at once', () => {
			optionManager.frameOptions.setMany({
				minWidth: '200px',
				maxHeight: '500px',
				statusbar: true
			});

			expect(optionManager.frameOptions.get('minWidth')).toBe('200px');
			expect(optionManager.frameOptions.get('maxHeight')).toBe('500px');
			expect(optionManager.frameOptions.get('statusbar')).toBe(true);
		});

		it('should reset with new map', () => {
			const newMap = new Map([
				['theme', 'dark'],
				['mode', 'inline']
			]);
			optionManager.frameOptions.reset(newMap);

			expect(optionManager.frameOptions.get('theme')).toBe('dark');
			expect(optionManager.frameOptions.get('mode')).toBe('inline');
			expect(optionManager.frameOptions.get('width')).toBeUndefined();
		});

		it('should clear all values', () => {
			optionManager.frameOptions.clear();
			expect(optionManager.frameOptions.getAll()).toEqual({});
			expect(optionManager.frameOptions.has('width')).toBe(false);
		});

		it('should return size correctly', () => {
			expect(optionManager.frameOptions.size()).toBe(3);
			optionManager.frameOptions.set('newKey', 'value');
			expect(optionManager.frameOptions.size()).toBe(4);
		});
	});

	describe('Integration tests', () => {
		it('should work with both options and frameOptions independently', () => {
			// Set base options
			optionManager.options.set('theme', 'dark');
			// Set frame options
			optionManager.frameOptions.set('width', '100%');

			expect(optionManager.options.get('theme')).toBe('dark');
			expect(optionManager.frameOptions.get('width')).toBe('100%');

			// Should not interfere with each other
			expect(optionManager.options.has('width')).toBe(false);
			expect(optionManager.frameOptions.has('theme')).toBe(false);
		});
	});

	describe('destroy', () => {
		it('should clear all options on destroy', () => {
			optionManager.options.set('key1', 'value1');
			optionManager.frameOptions.set('key2', 'value2');

			optionManager.destroy();

			expect(optionManager.options.size()).toBe(0);
			expect(optionManager.frameOptions.size()).toBe(0);
		});
	});
});
