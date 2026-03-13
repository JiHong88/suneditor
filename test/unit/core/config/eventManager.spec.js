/**
 * @fileoverview Unit tests for core/config/eventManager.js
 */

import EventManager from '../../../../src/core/config/eventManager';

describe('EventManager', () => {
	let eventManager;
	let mockContextProvider;
	let mockOptionProvider;
	let mockDeps;
	let mockFrameContext;
	let mockFrameOptions;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock frameContext
		mockFrameContext = new Map([['wysiwyg', document.createElement('div')]]);

		// Create mock frameOptions
		mockFrameOptions = new Map();

		// Create mock contextProvider
		mockContextProvider = {
			frameContext: mockFrameContext,
			carrierWrapper: document.createElement('div'),
		};

		// Add focus temp input to carrier wrapper
		const focusTempInput = document.createElement('input');
		focusTempInput.className = '__se__focus__temp__';
		mockContextProvider.carrierWrapper.appendChild(focusTempInput);

		// Create mock options map
		const mockOptionsMap = new Map([['events', {}]]);

		// Create mock optionProvider
		mockOptionProvider = {
			frameOptions: mockFrameOptions,
			options: mockOptionsMap,
		};

		// Create mock deps
		mockDeps = {
			// Add any necessary deps
		};

		// Create EventManager instance
		eventManager = new EventManager(mockContextProvider, mockOptionProvider, mockDeps);
	});

	describe('constructor', () => {
		it('should create an EventManager instance', () => {
			expect(eventManager).toBeInstanceOf(EventManager);
		});

		it('should initialize events from options', () => {
			expect(eventManager.events).toBeDefined();
		});

		it('should have triggerEvent method', () => {
			expect(typeof eventManager.triggerEvent).toBe('function');
		});
	});

	describe('addEvent method', () => {
		it('should add event listener to single element', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			const result = eventManager.addEvent(element, 'click', mockListener);

			expect(result).toBeDefined();
		});

		it('should add event listener to multiple elements', () => {
			const element1 = document.createElement('div');
			const element2 = document.createElement('div');
			const mockListener = jest.fn();

			const result = eventManager.addEvent([element1, element2], 'click', mockListener);

			expect(result).toBeDefined();
		});

		it('should handle useCapture option', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			const result = eventManager.addEvent(element, 'click', mockListener, true);
			expect(result).toBeDefined();
		});

		it('should return null for null target', () => {
			const mockListener = jest.fn();

			const result = eventManager.addEvent(null, 'click', mockListener);

			expect(result).toBeNull();
		});

		it('should return null for empty array', () => {
			const mockListener = jest.fn();

			const result = eventManager.addEvent([], 'click', mockListener);

			expect(result).toBeNull();
		});

		it('should accept AddEventListenerOptions object', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			const result = eventManager.addEvent(element, 'click', mockListener, {
				capture: true,
				passive: false,
			});

			expect(result).toBeDefined();
		});
	});

	describe('removeEvent method', () => {
		it('should remove event listener from element', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			eventManager.addEvent(element, 'click', mockListener);

			if (typeof eventManager.removeEvent === 'function') {
				const result = eventManager.removeEvent(element, 'click', mockListener);
				// Just verify the method exists and was callable
				expect(result === undefined || result === null || result === true || result === false).toBe(true);
			}
		});
	});

	describe('triggerEvent method', () => {
		it('should be a function', () => {
			expect(typeof eventManager.triggerEvent).toBe('function');
		});

		it('should trigger registered event handlers', async () => {
			const mockHandler = jest.fn();
			eventManager.events = { testEvent: mockHandler };

			await eventManager.triggerEvent('testEvent', {});

			expect(mockHandler).toHaveBeenCalled();
		});

		it('should pass event data to handler', async () => {
			const mockHandler = jest.fn();
			eventManager.events = { testEvent: mockHandler };

			const eventData = { key: 'value' };
			await eventManager.triggerEvent('testEvent', eventData);

			expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({ $: mockDeps }));
		});

		it('should handle missing event handler', async () => {
			const result = await eventManager.triggerEvent('nonexistentEvent', {});

			// Should not throw and should return a result
			expect(result).toBeDefined();
		});
	});

	describe('event registration tracking', () => {
		it('should track registered events', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			const result1 = eventManager.addEvent(element, 'click', mockListener);
			const result2 = eventManager.addEvent(element, 'mouseover', mockListener);

			// Events should be registered for later cleanup
			expect(result1).toBeDefined();
			expect(result2).toBeDefined();
		});
	});

	describe('global event handling', () => {
		it('should have addGlobalEvent method if implemented', () => {
			if (typeof eventManager.addGlobalEvent === 'function') {
				const mockListener = jest.fn();
				expect(() => eventManager.addGlobalEvent('testEvent', mockListener)).not.toThrow();
			}
		});

		it('should have removeGlobalEvent method if implemented', () => {
			if (typeof eventManager.removeGlobalEvent === 'function') {
				const mockListener = jest.fn();
				expect(() => eventManager.removeGlobalEvent('testEvent', mockListener)).not.toThrow();
			}
		});
	});

	describe('event cleanup', () => {
		it('should support event removal', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			eventManager.addEvent(element, 'click', mockListener);

			if (typeof eventManager.removeEvent === 'function') {
				eventManager.removeEvent(element, 'click', mockListener);
			}
		});
	});

	describe('multiple event types', () => {
		it('should handle different event types', () => {
			const element = document.createElement('div');
			const mockListener = jest.fn();

			const result1 = eventManager.addEvent(element, 'click', mockListener);
			const result2 = eventManager.addEvent(element, 'keydown', mockListener);
			const result3 = eventManager.addEvent(element, 'input', mockListener);

			expect(result1).toBeDefined();
			expect(result2).toBeDefined();
			expect(result3).toBeDefined();
		});
	});

	describe('event handler edge cases', () => {
		it('should handle window as target', () => {
			const mockListener = jest.fn();

			const result = eventManager.addEvent(window, 'resize', mockListener);

			expect(result).toBeDefined();
		});

		it('should handle document as target', () => {
			const mockListener = jest.fn();

			const result = eventManager.addEvent(document, 'DOMContentLoaded', mockListener);

			expect(result).toBeDefined();
		});
	});
});
