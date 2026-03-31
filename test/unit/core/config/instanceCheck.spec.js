/**
 * @fileoverview Unit tests for core/config/instanceCheck.js
 */

import InstanceCheck from '../../../../src/core/config/instanceCheck';

describe('InstanceCheck', () => {
	let instanceCheck;
	let mockFrameContext;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock frameContext with window reference
		mockFrameContext = new Map([
			['_ww', window],
			['_wd', document],
		]);

		// Create InstanceCheck instance
		instanceCheck = new InstanceCheck(mockFrameContext);
	});

	describe('constructor', () => {
		it('should create an InstanceCheck instance', () => {
			expect(instanceCheck).toBeInstanceOf(InstanceCheck);
		});
	});

	describe('isNode method', () => {
		it('should return true for DOM nodes', () => {
			const element = document.createElement('div');
			expect(instanceCheck.isNode(element)).toBe(true);
		});

		it('should return true for text nodes', () => {
			const textNode = document.createTextNode('text');
			expect(instanceCheck.isNode(textNode)).toBe(true);
		});

		it('should return true for comment nodes', () => {
			const commentNode = document.createComment('comment');
			expect(instanceCheck.isNode(commentNode)).toBe(true);
		});

		it('should return false for non-node objects', () => {
			expect(instanceCheck.isNode({})).toBe(false);
			expect(instanceCheck.isNode('string')).toBe(false);
			expect(instanceCheck.isNode(123)).toBe(false);
			expect(instanceCheck.isNode(null)).toBe(false);
			expect(instanceCheck.isNode(undefined)).toBe(false);
		});

		it('should handle objects with nodeType property', () => {
			const nodeTypedObject = { nodeType: 1 };
			expect(instanceCheck.isNode(nodeTypedObject)).toBe(true);
		});
	});

	describe('isElement method', () => {
		it('should return true for DOM elements', () => {
			const element = document.createElement('div');
			expect(instanceCheck.isElement(element)).toBe(true);
		});

		it('should return true for various element types', () => {
			expect(instanceCheck.isElement(document.createElement('p'))).toBe(true);
			expect(instanceCheck.isElement(document.createElement('span'))).toBe(true);
			expect(instanceCheck.isElement(document.createElement('img'))).toBe(true);
		});

		it('should return false for text nodes', () => {
			const textNode = document.createTextNode('text');
			expect(instanceCheck.isElement(textNode)).toBe(false);
		});

		it('should return false for comment nodes', () => {
			const commentNode = document.createComment('comment');
			expect(instanceCheck.isElement(commentNode)).toBe(false);
		});

		it('should return false for non-element objects', () => {
			expect(instanceCheck.isElement({})).toBe(false);
			expect(instanceCheck.isElement('string')).toBe(false);
			expect(instanceCheck.isElement(123)).toBe(false);
			expect(instanceCheck.isElement(null)).toBe(false);
			expect(instanceCheck.isElement(undefined)).toBe(false);
		});

		it('should handle objects with nodeType === 1', () => {
			const elementTypedObject = { nodeType: 1 };
			expect(instanceCheck.isElement(elementTypedObject)).toBe(true);
		});

		it('should return false for objects with wrong nodeType', () => {
			expect(instanceCheck.isElement({ nodeType: 3 })).toBe(false);
			expect(instanceCheck.isElement({ nodeType: 8 })).toBe(false);
		});
	});

	describe('isRange method', () => {
		it('should return true for Range objects', () => {
			const range = document.createRange();
			expect(instanceCheck.isRange(range)).toBe(true);
		});

		it('should return false for non-Range objects', () => {
			expect(instanceCheck.isRange({})).toBe(false);
			expect(instanceCheck.isRange('string')).toBe(false);
			expect(instanceCheck.isRange(123)).toBe(false);
			expect(instanceCheck.isRange(null)).toBe(false);
			expect(instanceCheck.isRange(undefined)).toBe(false);
		});

		it('should handle objects with Range constructor name', () => {
			const rangeTypedObject = {
				constructor: { name: 'Range' },
			};
			expect(instanceCheck.isRange(rangeTypedObject)).toBe(true);
		});

		it('should handle DOM elements', () => {
			const element = document.createElement('div');
			expect(instanceCheck.isRange(element)).toBe(false);
		});
	});

	describe('isSelection method', () => {
		it('should return true for Selection objects', () => {
			const selection = window.getSelection();
			expect(instanceCheck.isSelection(selection)).toBe(true);
		});

		it('should return false for non-Selection objects', () => {
			expect(instanceCheck.isSelection({})).toBe(false);
			expect(instanceCheck.isSelection('string')).toBe(false);
			expect(instanceCheck.isSelection(123)).toBe(false);
			expect(instanceCheck.isSelection(null)).toBe(false);
			expect(instanceCheck.isSelection(undefined)).toBe(false);
		});

		it('should handle objects with Selection constructor name', () => {
			const selectionTypedObject = {
				constructor: { name: 'Selection' },
			};
			expect(instanceCheck.isSelection(selectionTypedObject)).toBe(true);
		});

		it('should handle Range objects', () => {
			const range = document.createRange();
			expect(instanceCheck.isSelection(range)).toBe(false);
		});
	});

	describe('cross-frame compatibility', () => {
		it('should validate nodes from same context', () => {
			const element = document.createElement('div');
			expect(instanceCheck.isNode(element)).toBe(true);
			expect(instanceCheck.isElement(element)).toBe(true);
		});

		it('should use nodeType for compatibility', () => {
			// This tests the fallback mechanism
			const nodeWithType = { nodeType: 1 };
			expect(instanceCheck.isElement(nodeWithType)).toBe(true);
		});

		it('should use constructor.name for compatibility', () => {
			// This tests the fallback mechanism
			const objectWithConstructor = {
				constructor: { name: 'Range' },
			};
			expect(instanceCheck.isRange(objectWithConstructor)).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle null values gracefully', () => {
			expect(instanceCheck.isNode(null)).toBe(false);
			expect(instanceCheck.isElement(null)).toBe(false);
			expect(instanceCheck.isRange(null)).toBe(false);
			expect(instanceCheck.isSelection(null)).toBe(false);
		});

		it('should handle undefined values gracefully', () => {
			expect(instanceCheck.isNode(undefined)).toBe(false);
			expect(instanceCheck.isElement(undefined)).toBe(false);
			expect(instanceCheck.isRange(undefined)).toBe(false);
			expect(instanceCheck.isSelection(undefined)).toBe(false);
		});

		it('should handle objects with missing properties', () => {
			const incompleteObject = {};
			expect(instanceCheck.isNode(incompleteObject)).toBe(false);
			expect(instanceCheck.isElement(incompleteObject)).toBe(false);
		});
	});
});
