/**
 * @fileoverview Unit tests for core/services/contextManager.js
 */

import ContextManager from '../../../../src/core/services/contextManager';

describe('ContextManager', () => {
	let contextManager;
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

		contextManager = new ContextManager(mockEditor, mockProduct);
	});

	describe('constructor', () => {
		it('should create a ContextManager instance', () => {
			expect(contextManager).toBeInstanceOf(ContextManager);
		});

		it('should have context, frameContext, and frameRoots getters', () => {
			expect(contextManager.context).toBeDefined();
			expect(contextManager.frameContext).toBeDefined();
			expect(contextManager.frameRoots).toBeDefined();
		});
	});

	describe('context (ContextMap)', () => {
		it('should get DOM elements correctly', () => {
			expect(contextManager.context.get('menuTray')).toBe(mockDOM.menuTray);
			expect(contextManager.context.get('toolbar_main')).toBe(mockDOM.toolbar);
			expect(contextManager.context.get('toolbar_sub_main')).toBe(mockDOM.subbar);
			expect(contextManager.context.get('nonexistent')).toBeUndefined();
		});

		it('should set DOM elements correctly', () => {
			const newElement = document.createElement('div');
			contextManager.context.set('customElement', newElement);
			expect(contextManager.context.get('customElement')).toBe(newElement);
		});

		it('should check existence correctly', () => {
			expect(contextManager.context.has('menuTray')).toBe(true);
			expect(contextManager.context.has('toolbar_main')).toBe(true);
			expect(contextManager.context.has('nonexistent')).toBe(false);
		});

		it('should delete elements correctly', () => {
			expect(contextManager.context.has('menuTray')).toBe(true);
			contextManager.context.delete('menuTray');
			expect(contextManager.context.has('menuTray')).toBe(false);
			expect(contextManager.context.get('menuTray')).toBeUndefined();
		});

		it('should get all elements as object', () => {
			const all = contextManager.context.getAll();
			expect(typeof all).toBe('object');
			expect(all.menuTray).toBe(mockDOM.menuTray);
			expect(all.toolbar_main).toBe(mockDOM.toolbar);
			expect(all.toolbar_sub_main).toBe(mockDOM.subbar);
		});

		it('should clear all elements', () => {
			expect(contextManager.context.has('menuTray')).toBe(true);
			contextManager.context.clear();
			expect(contextManager.context.getAll()).toEqual({});
			expect(contextManager.context.has('menuTray')).toBe(false);
		});

		it('should handle DOM element replacement', () => {
			const originalToolbar = contextManager.context.get('toolbar_main');
			const newToolbar = document.createElement('div');

			contextManager.context.set('toolbar_main', newToolbar);
			expect(contextManager.context.get('toolbar_main')).toBe(newToolbar);
			expect(contextManager.context.get('toolbar_main')).not.toBe(originalToolbar);
		});

		it('should maintain reference integrity', () => {
			const menuTray = contextManager.context.get('menuTray');
			const menuTray2 = contextManager.context.get('menuTray');
			expect(menuTray).toBe(menuTray2);
			expect(menuTray).toBe(mockDOM.menuTray);
		});

		it('should return size correctly', () => {
			expect(contextManager.context.size()).toBe(3);
			contextManager.context.set('newKey', document.createElement('div'));
			expect(contextManager.context.size()).toBe(4);
		});
	});

	describe('frameContext (FrameContextMap)', () => {
		beforeEach(() => {
			// Initialize frameContext with some values
			contextManager.frameContext.set('wysiwyg', mockDOM.wysiwyg);
			contextManager.frameContext.set('wrapper', mockDOM.wrapper);
			contextManager.frameContext.set('topArea', mockDOM.topArea);
		});

		it('should get values correctly', () => {
			expect(contextManager.frameContext.get('wysiwyg')).toBe(mockDOM.wysiwyg);
			expect(contextManager.frameContext.get('wrapper')).toBe(mockDOM.wrapper);
			expect(contextManager.frameContext.get('topArea')).toBe(mockDOM.topArea);
			expect(contextManager.frameContext.get('nonexistent')).toBeUndefined();
		});

		it('should set values correctly', () => {
			const newElement = document.createElement('div');
			contextManager.frameContext.set('customFrame', newElement);
			expect(contextManager.frameContext.get('customFrame')).toBe(newElement);
		});

		it('should check existence correctly', () => {
			expect(contextManager.frameContext.has('wysiwyg')).toBe(true);
			expect(contextManager.frameContext.has('wrapper')).toBe(true);
			expect(contextManager.frameContext.has('nonexistent')).toBe(false);
		});

		it('should delete elements correctly', () => {
			expect(contextManager.frameContext.has('wysiwyg')).toBe(true);
			contextManager.frameContext.delete('wysiwyg');
			expect(contextManager.frameContext.has('wysiwyg')).toBe(false);
		});

		it('should get all values as object', () => {
			const all = contextManager.frameContext.getAll();
			expect(typeof all).toBe('object');
			expect(all.wysiwyg).toBe(mockDOM.wysiwyg);
			expect(all.wrapper).toBe(mockDOM.wrapper);
		});

		it('should reset with new map', () => {
			const newFrameContext = new Map([
				['newElement', document.createElement('div')]
			]);
			contextManager.frameContext.reset(newFrameContext);

			expect(contextManager.frameContext.has('newElement')).toBe(true);
			expect(contextManager.frameContext.has('wysiwyg')).toBe(false);
		});

		it('should clear all elements', () => {
			expect(contextManager.frameContext.has('wysiwyg')).toBe(true);
			contextManager.frameContext.clear();
			expect(contextManager.frameContext.getAll()).toEqual({});
		});

		it('should return size correctly', () => {
			expect(contextManager.frameContext.size()).toBe(3);
			contextManager.frameContext.set('newKey', document.createElement('div'));
			expect(contextManager.frameContext.size()).toBe(4);
		});
	});

	describe('frameRoots', () => {
		it('should return the frameRoots map', () => {
			expect(contextManager.frameRoots).toBeInstanceOf(Map);
			expect(contextManager.frameRoots.has('main')).toBe(true);
		});
	});

	describe('applyToRoots', () => {
		it('should iterate over all frame roots', () => {
			const callback = jest.fn();
			contextManager.applyToRoots(callback);
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should pass frame context to callback', () => {
			let receivedContext = null;
			contextManager.applyToRoots((fc) => {
				receivedContext = fc;
			});
			expect(receivedContext).toBeInstanceOf(Map);
			expect(receivedContext.has('topArea')).toBe(true);
		});
	});

	describe('reset', () => {
		it('should reset frameContext with new map', () => {
			const newMap = new Map([['testKey', 'testValue']]);
			contextManager.reset(newMap);
			expect(contextManager.frameContext.get('testKey')).toBe('testValue');
		});
	});

	describe('Integration tests', () => {
		it('should work with context and frameContext independently', () => {
			// Set context
			const contextElement = document.createElement('div');
			contextManager.context.set('testContext', contextElement);

			// Set frameContext
			const frameElement = document.createElement('div');
			contextManager.frameContext.set('testFrame', frameElement);

			expect(contextManager.context.get('testContext')).toBe(contextElement);
			expect(contextManager.frameContext.get('testFrame')).toBe(frameElement);

			// Should not interfere with each other
			expect(contextManager.context.has('testFrame')).toBe(false);
			expect(contextManager.frameContext.has('testContext')).toBe(false);
		});

		it('should handle dynamic context updates', () => {
			// Initially should not have certain elements
			expect(contextManager.context.has('dynamicElement')).toBe(false);

			// Add elements dynamically
			const dynamicElement = document.createElement('div');
			contextManager.context.set('dynamicElement', dynamicElement);

			expect(contextManager.context.get('dynamicElement')).toBe(dynamicElement);
		});
	});
});
