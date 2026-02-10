/**
 * @fileoverview Unit tests for core/config/contextProvider.js
 */

import ContextProvider from '../../../../src/core/config/contextProvider';

describe('ContextProvider', () => {
	let contextProvider;
	let mockEditor;
	let mockProduct;
	let mockDOM;

	beforeEach(() => {
		// Create mock DOM structure for testing
		mockDOM = {
			toolbar: document.createElement('div'),
			toolbarContainer: document.createElement('div'),
			menuTray: document.createElement('div'),
			subbar: document.createElement('div'),
			statusbarContainer: document.createElement('div'),
			topArea: document.createElement('div'),
			wrapper: document.createElement('div'),
			wysiwyg: document.createElement('div'),
			wysiwygFrame: document.createElement('div')
		};

		mockDOM.toolbar.innerHTML = '<div class="se-btn-tray"></div><div class="se-arrow"></div>';
		mockDOM.subbar.innerHTML = '<div class="se-btn-tray"></div><div class="se-arrow"></div>';

		mockEditor = {
			_w: window,
			_d: document,
			shadowRoot: null
		};

		const contextMap = new Map([
			['menuTray', mockDOM.menuTray],
			['toolbar_main', mockDOM.toolbar],
			['toolbar_sub_main', mockDOM.subbar]
		]);

		const frameContext = new Map([
			['topArea', mockDOM.topArea],
			['wrapper', mockDOM.wrapper],
			['wysiwyg', mockDOM.wysiwyg],
			['wysiwygFrame', mockDOM.wysiwygFrame],
			['options', new Map([['iframe', false], ['editableFrameAttributes', {}]])]
		]);

		const frameRoots = new Map([['main', frameContext]]);

		mockProduct = {
			context: contextMap,
			frameRoots: frameRoots
		};

		contextProvider = new ContextProvider(mockEditor, mockProduct);
	});

	describe('constructor', () => {
		it('should create a ContextProvider instance', () => {
			expect(contextProvider).toBeInstanceOf(ContextProvider);
		});

		it('should have context, frameContext, and frameRoots getters', () => {
			expect(contextProvider.context).toBeDefined();
			expect(contextProvider.frameContext).toBeDefined();
			expect(contextProvider.frameRoots).toBeDefined();
		});
	});

	describe('context (ContextMap)', () => {
		it('should get DOM elements correctly', () => {
			expect(contextProvider.context.get('menuTray')).toBe(mockDOM.menuTray);
			expect(contextProvider.context.get('toolbar_main')).toBe(mockDOM.toolbar);
			expect(contextProvider.context.get('toolbar_sub_main')).toBe(mockDOM.subbar);
			expect(contextProvider.context.get('nonexistent')).toBeUndefined();
		});

		it('should set DOM elements correctly', () => {
			const newElement = document.createElement('div');
			contextProvider.context.set('customElement', newElement);
			expect(contextProvider.context.get('customElement')).toBe(newElement);
		});

		it('should check existence correctly', () => {
			expect(contextProvider.context.has('menuTray')).toBe(true);
			expect(contextProvider.context.has('toolbar_main')).toBe(true);
			expect(contextProvider.context.has('nonexistent')).toBe(false);
		});

		it('should delete elements correctly', () => {
			expect(contextProvider.context.has('menuTray')).toBe(true);
			contextProvider.context.delete('menuTray');
			expect(contextProvider.context.has('menuTray')).toBe(false);
			expect(contextProvider.context.get('menuTray')).toBeUndefined();
		});

		it('should get all elements as object', () => {
			const all = contextProvider.context.getAll();
			expect(typeof all).toBe('object');
			expect(all.menuTray).toBe(mockDOM.menuTray);
			expect(all.toolbar_main).toBe(mockDOM.toolbar);
			expect(all.toolbar_sub_main).toBe(mockDOM.subbar);
		});

		it('should clear all elements', () => {
			expect(contextProvider.context.has('menuTray')).toBe(true);
			contextProvider.context.clear();
			expect(contextProvider.context.getAll()).toEqual({});
			expect(contextProvider.context.has('menuTray')).toBe(false);
		});

		it('should handle DOM element replacement', () => {
			const originalToolbar = contextProvider.context.get('toolbar_main');
			const newToolbar = document.createElement('div');

			contextProvider.context.set('toolbar_main', newToolbar);
			expect(contextProvider.context.get('toolbar_main')).toBe(newToolbar);
			expect(contextProvider.context.get('toolbar_main')).not.toBe(originalToolbar);
		});

		it('should maintain reference integrity', () => {
			const menuTray = contextProvider.context.get('menuTray');
			const menuTray2 = contextProvider.context.get('menuTray');
			expect(menuTray).toBe(menuTray2);
			expect(menuTray).toBe(mockDOM.menuTray);
		});

		it('should return size correctly', () => {
			expect(contextProvider.context.size()).toBe(3);
			contextProvider.context.set('newKey', document.createElement('div'));
			expect(contextProvider.context.size()).toBe(4);
		});
	});

	describe('frameContext (FrameContextMap)', () => {
		beforeEach(() => {
			// Initialize frameContext with some values
			contextProvider.frameContext.set('wysiwyg', mockDOM.wysiwyg);
			contextProvider.frameContext.set('wrapper', mockDOM.wrapper);
			contextProvider.frameContext.set('topArea', mockDOM.topArea);
		});

		it('should get values correctly', () => {
			expect(contextProvider.frameContext.get('wysiwyg')).toBe(mockDOM.wysiwyg);
			expect(contextProvider.frameContext.get('wrapper')).toBe(mockDOM.wrapper);
			expect(contextProvider.frameContext.get('topArea')).toBe(mockDOM.topArea);
			expect(contextProvider.frameContext.get('nonexistent')).toBeUndefined();
		});

		it('should set values correctly', () => {
			const newElement = document.createElement('div');
			contextProvider.frameContext.set('customFrame', newElement);
			expect(contextProvider.frameContext.get('customFrame')).toBe(newElement);
		});

		it('should check existence correctly', () => {
			expect(contextProvider.frameContext.has('wysiwyg')).toBe(true);
			expect(contextProvider.frameContext.has('wrapper')).toBe(true);
			expect(contextProvider.frameContext.has('nonexistent')).toBe(false);
		});

		it('should delete elements correctly', () => {
			expect(contextProvider.frameContext.has('wysiwyg')).toBe(true);
			contextProvider.frameContext.delete('wysiwyg');
			expect(contextProvider.frameContext.has('wysiwyg')).toBe(false);
		});

		it('should get all values as object', () => {
			const all = contextProvider.frameContext.getAll();
			expect(typeof all).toBe('object');
			expect(all.wysiwyg).toBe(mockDOM.wysiwyg);
			expect(all.wrapper).toBe(mockDOM.wrapper);
		});

		it('should reset with new map', () => {
			const newFrameContext = new Map([
				['newElement', document.createElement('div')]
			]);
			contextProvider.frameContext.reset(newFrameContext);

			expect(contextProvider.frameContext.has('newElement')).toBe(true);
			expect(contextProvider.frameContext.has('wysiwyg')).toBe(false);
		});

		it('should clear all elements', () => {
			expect(contextProvider.frameContext.has('wysiwyg')).toBe(true);
			contextProvider.frameContext.clear();
			expect(contextProvider.frameContext.getAll()).toEqual({});
		});

		it('should return size correctly', () => {
			expect(contextProvider.frameContext.size()).toBe(3);
			contextProvider.frameContext.set('newKey', document.createElement('div'));
			expect(contextProvider.frameContext.size()).toBe(4);
		});
	});

	describe('frameRoots', () => {
		it('should return the frameRoots map', () => {
			expect(contextProvider.frameRoots).toBeInstanceOf(Map);
			expect(contextProvider.frameRoots.has('main')).toBe(true);
		});
	});

	describe('applyToRoots', () => {
		it('should iterate over all frame roots', () => {
			const callback = jest.fn();
			contextProvider.applyToRoots(callback);
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should pass frame context to callback', () => {
			let receivedContext = null;
			contextProvider.applyToRoots((fc) => {
				receivedContext = fc;
			});
			expect(receivedContext).toBeInstanceOf(Map);
			expect(receivedContext.has('topArea')).toBe(true);
		});
	});

	describe('reset', () => {
		it('should reset frameContext with new map', () => {
			const newMap = new Map([['testKey', 'testValue']]);
			contextProvider.reset(newMap);
			expect(contextProvider.frameContext.get('testKey')).toBe('testValue');
		});
	});

	describe('Integration tests', () => {
		it('should work with context and frameContext independently', () => {
			// Set context
			const contextElement = document.createElement('div');
			contextProvider.context.set('testContext', contextElement);

			// Set frameContext
			const frameElement = document.createElement('div');
			contextProvider.frameContext.set('testFrame', frameElement);

			expect(contextProvider.context.get('testContext')).toBe(contextElement);
			expect(contextProvider.frameContext.get('testFrame')).toBe(frameElement);

			// Should not interfere with each other
			expect(contextProvider.context.has('testFrame')).toBe(false);
			expect(contextProvider.frameContext.has('testContext')).toBe(false);
		});

		it('should handle dynamic context updates', () => {
			// Initially should not have certain elements
			expect(contextProvider.context.has('dynamicElement')).toBe(false);

			// Add elements dynamically
			const dynamicElement = document.createElement('div');
			contextProvider.context.set('dynamicElement', dynamicElement);

			expect(contextProvider.context.get('dynamicElement')).toBe(dynamicElement);
		});
	});
});
