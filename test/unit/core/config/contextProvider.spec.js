/**
 * @fileoverview Unit tests for core/config/contextProvider.js
 */

import ContextProvider from '../../../../src/core/config/contextProvider';

describe('ContextProvider', () => {
	let contextProvider;
	let mockProduct;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock DOM elements
		const mockDOM = {
			toolbar: document.createElement('div'),
			toolbar_buttonTray: document.createElement('div'),
			toolbar_arrow: document.createElement('div'),
			menuTray: document.createElement('div'),
			subbar: document.createElement('div'),
			toolbar_sub_buttonTray: document.createElement('div'),
			toolbar_sub_arrow: document.createElement('div'),
			statusbar: document.createElement('div'),
		};

		// Create context map with DOM elements
		const contextMap = new Map([
			['toolbar_main', mockDOM.toolbar],
			['toolbar_buttonTray', mockDOM.toolbar_buttonTray],
			['toolbar_arrow', mockDOM.toolbar_arrow],
			['menuTray', mockDOM.menuTray],
			['toolbar_sub_main', mockDOM.subbar],
			['toolbar_sub_buttonTray', mockDOM.toolbar_sub_buttonTray],
			['toolbar_sub_arrow', mockDOM.toolbar_sub_arrow],
			['statusbar', mockDOM.statusbar],
		]);

		// Create frameContext map (will be created/managed by ContextProvider internally)
		// We just need an empty wrapper for the constructor

		// Create frame roots map
		const frameRoots = new Map([]);

		// Create mock product
		mockProduct = {
			context: contextMap,
			frameRoots: frameRoots,
			rootKeys: [null],
			carrierWrapper: document.createElement('div'),
			icons: { bold: '<svg></svg>' },
			lang: { lang_code: 'en' },
		};

		// Create ContextProvider instance
		contextProvider = new ContextProvider(mockProduct);
	});

	describe('constructor', () => {
		it('should create a ContextProvider instance', () => {
			expect(contextProvider).toBeInstanceOf(ContextProvider);
		});

		it('should set root keys from product', () => {
			expect(contextProvider.rootKeys).toEqual([null]);
		});

		it('should set carrier wrapper from product', () => {
			expect(contextProvider.carrierWrapper).toBeDefined();
		});

		it('should set icons from product', () => {
			expect(contextProvider.icons).toBeDefined();
			expect(contextProvider.icons.bold).toBe('<svg></svg>');
		});

		it('should set lang from product', () => {
			expect(contextProvider.lang).toBeDefined();
			expect(contextProvider.lang.lang_code).toBe('en');
		});
	});

	describe('context getter', () => {
		it('should return context object', () => {
			const context = contextProvider.context;
			expect(context).toBeDefined();
		});

		it('should get DOM elements from context', () => {
			const context = contextProvider.context;
			expect(context.get('toolbar_main')).toBeDefined();
		});

		it('should set DOM elements in context', () => {
			const context = contextProvider.context;
			const newElement = document.createElement('div');
			context.set('newKey', newElement);
			expect(context.get('newKey')).toBe(newElement);
		});

		it('should check if keys exist in context', () => {
			const context = contextProvider.context;
			expect(context.has('toolbar_main')).toBe(true);
			expect(context.has('nonexistent')).toBe(false);
		});

		it('should delete elements from context', () => {
			const context = contextProvider.context;
			context.delete('toolbar_main');
			expect(context.has('toolbar_main')).toBe(false);
		});

		it('should return context size', () => {
			const context = contextProvider.context;
			expect(typeof context.size).toBe('number');
			expect(context.size).toBeGreaterThan(0);
		});

		it('should clear all elements from context', () => {
			const context = contextProvider.context;
			context.clear();
			expect(context.size).toBe(0);
		});

		it('should get all context elements as object', () => {
			const context = contextProvider.context;
			const all = context.getAll();
			expect(typeof all).toBe('object');
		});
	});

	describe('frameContext getter', () => {
		it('should return frameContext object', () => {
			const frameContext = contextProvider.frameContext;
			expect(frameContext).toBeDefined();
		});

		it('should get values from frameContext', () => {
			const frameContext = contextProvider.frameContext;
			frameContext.set('testKey', 'testValue');
			expect(frameContext.get('testKey')).toBe('testValue');
		});

		it('should check if keys exist in frameContext', () => {
			const frameContext = contextProvider.frameContext;
			frameContext.set('testKey', 'testValue');
			expect(frameContext.has('testKey')).toBe(true);
			expect(frameContext.has('nonexistent')).toBe(false);
		});

		it('should delete elements from frameContext', () => {
			const frameContext = contextProvider.frameContext;
			frameContext.set('testKey', 'testValue');
			frameContext.delete('testKey');
			expect(frameContext.has('testKey')).toBe(false);
		});

		it('should return frameContext size', () => {
			const frameContext = contextProvider.frameContext;
			expect(typeof frameContext.size).toBe('number');
		});

		it('should reset frameContext with new Map', () => {
			const frameContext = contextProvider.frameContext;
			const newMap = new Map([['key1', 'value1']]);
			frameContext.reset(newMap);
			expect(frameContext.get('key1')).toBe('value1');
		});
	});

	describe('frameRoots getter', () => {
		it('should return frameRoots map', () => {
			const frameRoots = contextProvider.frameRoots;
			expect(frameRoots).toBeDefined();
			expect(frameRoots instanceof Map).toBe(true);
		});

		it('should support adding frame contexts', () => {
			const frameRoots = contextProvider.frameRoots;
			const newFrameContext = new Map([['key', 'value']]);
			frameRoots.set('test-frame', newFrameContext);
			expect(frameRoots.has('test-frame')).toBe(true);
		});

		it('should get frameContext from frameRoots when set', () => {
			const frameRoots = contextProvider.frameRoots;
			const testContext = new Map([['wysiwyg', document.createElement('div')]]);
			frameRoots.set('test-key', testContext);
			const frameContext = frameRoots.get('test-key');
			expect(frameContext).toBeDefined();
			expect(frameContext instanceof Map).toBe(true);
		});
	});

	describe('changeFrameContext', () => {
		it('should have changeFrameContext method if defined', () => {
			if (typeof contextProvider.changeFrameContext === 'function') {
				expect(() => contextProvider.changeFrameContext(null)).not.toThrow();
			}
		});
	});

	describe('multi-frame support', () => {
		it('should support multiple frame contexts', () => {
			const newFrameContext = new Map([['key', 'value']]);
			const frameRoots = contextProvider.frameRoots;
			frameRoots.set('frame1', newFrameContext);

			expect(frameRoots.has('frame1')).toBe(true);
			expect(frameRoots.get('frame1')).toBe(newFrameContext);
		});

		it('should maintain separate frame contexts', () => {
			const frameContext1 = new Map([['data1', 'value1']]);
			const frameContext2 = new Map([['data2', 'value2']]);

			const frameRoots = contextProvider.frameRoots;
			frameRoots.set('frame1', frameContext1);
			frameRoots.set('frame2', frameContext2);

			expect(frameRoots.get('frame1').get('data1')).toBe('value1');
			expect(frameRoots.get('frame2').get('data2')).toBe('value2');
		});
	});
});
