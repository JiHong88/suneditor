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
	});

	describe('context (ContextMap)', () => {
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
	});


	describe('reset', () => {
		it('should reset frameContext with new map', () => {
			const newMap = new Map([['testKey', 'testValue']]);
			contextProvider.reset(newMap);
			expect(contextProvider.frameContext.get('testKey')).toBe('testValue');
		});
	});

});
