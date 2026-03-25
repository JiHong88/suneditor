/**
 * @jest-environment jsdom
 */

/**
 * @fileoverview Numerical verification tests for Selection.scrollTo.
 *
 * These tests mock layout values (getBoundingClientRect, offsetWidth/Height,
 * scrollTop, etc.) to verify that scrollTo correctly calculates scroll
 * positions, especially for deeply nested elements like nested lists.
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Selection from '../../../../../src/core/logic/dom/selection';

/*============================================================================
 * Layout Constants
 *============================================================================*/
const LAYOUT = {
	wwFrame: {
		rect: { top: 100, left: 20, right: 820, bottom: 500, width: 800, height: 400 },
		offsetWidth: 800,
		offsetHeight: 400,
		scrollTop: 0,
	},
	toolbar: { offsetHeight: 40 },
	viewportHeight: 768,
	scrollY: 0,
};

/*============================================================================
 * Helpers
 *============================================================================*/
function mockRect(el, rect) {
	el.getBoundingClientRect = jest.fn(() => ({
		top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom,
		width: rect.width ?? (rect.right - rect.left),
		height: rect.height ?? (rect.bottom - rect.top),
		x: rect.left, y: rect.top,
	}));
}

function mockSize(el, w, h) {
	Object.defineProperty(el, 'offsetWidth', { value: w, configurable: true, writable: true });
	Object.defineProperty(el, 'offsetHeight', { value: h, configurable: true, writable: true });
}

function setProp(el, key, value) {
	Object.defineProperty(el, key, { value, configurable: true, writable: true });
}

/*============================================================================
 * Tests
 *============================================================================*/
describe('Selection - scrollTo', () => {
	let kernel, selection, wysiwyg, wwFrame, scrollToSpy;

	beforeEach(() => {
		kernel = createMockEditor();
		const fc = kernel.$.frameContext;
		wysiwyg = fc.get('wysiwyg');
		wwFrame = fc.get('wysiwygFrame');

		// Mock toolbar
		const toolbarMain = document.createElement('div');
		mockSize(toolbarMain, 800, LAYOUT.toolbar.offsetHeight);
		kernel.$.context.get = jest.fn((key) => {
			if (key === 'toolbar_main') return toolbarMain;
			return document.createElement('div');
		});

		// Mock toolbar.isSticky
		kernel.$.toolbar.isSticky = false;

		// Mock store
		kernel.store.get = jest.fn((key) => {
			if (key === 'isScrollable') return () => true; // not auto-height
			if (key === 'currentViewportHeight') return LAYOUT.viewportHeight;
			return undefined;
		});

		// Mock offset.getGlobal — editor fully visible in viewport
		kernel.$.offset.getGlobal = jest.fn(() => ({
			top: LAYOUT.wwFrame.rect.top,
			left: LAYOUT.wwFrame.rect.left,
			fixedTop: LAYOUT.wwFrame.rect.top,
			fixedLeft: LAYOUT.wwFrame.rect.left,
			width: LAYOUT.wwFrame.offsetWidth,
			height: LAYOUT.wwFrame.offsetHeight,
		}));

		// Mock wwFrame layout
		mockRect(wwFrame, LAYOUT.wwFrame.rect);
		mockSize(wwFrame, LAYOUT.wwFrame.offsetWidth, LAYOUT.wwFrame.offsetHeight);
		setProp(wwFrame, 'scrollTop', 0);
		wwFrame.scrollTo = jest.fn();
		scrollToSpy = wwFrame.scrollTo;

		// Mock window
		Object.defineProperty(window, 'scrollY', { value: LAYOUT.scrollY, configurable: true, writable: true });
		window.scrollTo = jest.fn();

		// Ensure wysiwyg is in document
		if (!document.body.contains(wysiwyg)) {
			document.body.appendChild(wwFrame);
			wwFrame.appendChild(wysiwyg);
		}

		// Create Selection instance
		selection = new Selection(kernel);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	/**
	 * Build a nested list structure inside wysiwyg:
	 * <ul><li>top<ul><li>mid<ul><li>deep</li></ul></li></ul></li></ul>
	 * Returns the deepest text node.
	 */
	function buildNestedList() {
		wysiwyg.innerHTML = `
			<ul><li>top
				<ul><li>mid
					<ul><li>deep target text</li></ul>
				</li></ul>
			</li></ul>`;
		// Find the deepest <li>
		const allLi = wysiwyg.querySelectorAll('li');
		const deepLi = allLi[allLi.length - 1];
		return { deepLi, textNode: deepLi.firstChild };
	}

	function createRangeForNode(textNode) {
		const range = document.createRange();
		range.setStart(textNode, 0);
		range.setEnd(textNode, textNode.textContent.length);
		return range;
	}

	describe('nested list scroll position', () => {
		it('should scroll down to a nested list item below the visible area', () => {
			const { deepLi, textNode } = buildNestedList();

			// Element is below visible area: top=450 relative to frame top=100 → innerTop=350
			// viewHeight=400, so 350 + PADDING(40) > 400 → needs scroll down
			mockRect(deepLi, { top: 550, left: 40, right: 200, bottom: 570 });
			mockSize(deepLi, 160, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			expect(scrollToSpy).toHaveBeenCalled();
			const scrollArg = scrollToSpy.mock.calls[0][0];
			expect(scrollArg.top).toBeGreaterThan(0); // scroll down
		});

		it('should scroll up to a nested list item above the visible area', () => {
			const { deepLi, textNode } = buildNestedList();
			setProp(wwFrame, 'scrollTop', 300);

			// Element is above the frame: frame top=100, el top=80 → innerTop = -20
			mockRect(deepLi, { top: 80, left: 40, right: 200, bottom: 100 });
			mockSize(deepLi, 160, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			expect(scrollToSpy).toHaveBeenCalled();
			const scrollArg = scrollToSpy.mock.calls[0][0];
			expect(scrollArg.top).toBeLessThan(300); // scroll up from current 300
		});

		it('should not scroll when nested list item is already visible', () => {
			const { deepLi, textNode } = buildNestedList();

			// Element is in the middle of the frame: frame top=100, el top=300 → innerTop=200
			// viewHeight=400, PADDING=40: 200 - 40 > 0 && 200 + 40 <= 400 → visible
			mockRect(deepLi, { top: 300, left: 40, right: 200, bottom: 320 });
			mockSize(deepLi, 160, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			expect(scrollToSpy).not.toHaveBeenCalled();
		});
	});

	describe('outer li with nested children (offsetHeight mismatch)', () => {
		/**
		 * Build a nested list and return the OUTER <li> and its text node.
		 * The outer <li> has a large offsetHeight (includes nested sub-lists),
		 * but the actual text line is only ~20px tall.
		 */
		function buildOuterNestedList() {
			wysiwyg.innerHTML = `<ul><li>outer text<ul><li>inner1</li><li>inner2</li><li>inner3</li></ul></li></ul>`;
			const outerLi = wysiwyg.querySelector('li');
			// outerLi.firstChild is the "outer text" text node
			return { outerLi, textNode: outerLi.firstChild };
		}

		it('should use range rect height, not el.offsetHeight for scroll calculation', () => {
			const { outerLi, textNode } = buildOuterNestedList();

			// Outer <li> has large offsetHeight (entire nested structure)
			mockSize(outerLi, 780, 200);
			// But the outer <li> top is at the right place
			mockRect(outerLi, { top: 80, left: 20, right: 800, bottom: 280 });

			const range = createRangeForNode(textNode);
			// Mock range rect — actual text line is 20px tall
			range.getBoundingClientRect = jest.fn(() => ({
				top: 80, left: 20, right: 200, bottom: 100,
				width: 180, height: 20, x: 20, y: 80,
			}));

			setProp(wwFrame, 'scrollTop', 300);
			selection.scrollTo(range);

			expect(scrollToSpy).toHaveBeenCalled();
			const scrollArg = scrollToSpy.mock.calls[0][0];

			// With elH=20 (range height): newScrollTop = 300 + (-20 - (0 + 20)) = 260
			// With elH=200 (wrong el.offsetHeight): newScrollTop = 300 + (-20 - (0 + 200)) = 80
			// The correct scroll should be closer to 260, not 80
			expect(scrollArg.top).toBeGreaterThan(200);
		});

		it('should not overshoot when scrolling up to outer li text', () => {
			const { outerLi, textNode } = buildOuterNestedList();

			mockSize(outerLi, 780, 300); // large height from nested children
			mockRect(outerLi, { top: 60, left: 20, right: 800, bottom: 360 });

			const range = createRangeForNode(textNode);
			range.getBoundingClientRect = jest.fn(() => ({
				top: 60, left: 20, right: 200, bottom: 80,
				width: 180, height: 20, x: 20, y: 60,
			}));

			setProp(wwFrame, 'scrollTop', 500);
			selection.scrollTo(range);

			expect(scrollToSpy).toHaveBeenCalled();
			const scrollArg = scrollToSpy.mock.calls[0][0];

			// Should scroll to show the text line (top=60), not overshoot
			// With correct elH=20: 500 + (-40 - (0 + 20)) = 440
			// With wrong elH=300: 500 + (-40 - (0 + 300)) = 160 ← huge overshoot
			expect(scrollArg.top).toBeGreaterThan(400);
		});
	});

	describe('coordinate system consistency', () => {
		it('should use editor-frame-relative coordinates, not viewport-relative', () => {
			const { deepLi, textNode } = buildNestedList();

			// Frame is at viewport top=100
			// Element is at viewport top=200 → frame-relative = 100
			// If code incorrectly uses viewport-relative (200), it would miscalculate
			mockRect(deepLi, { top: 200, left: 40, right: 200, bottom: 220 });
			mockSize(deepLi, 160, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			// innerTop = 200 - 100 = 100, which is within view → no scroll
			expect(scrollToSpy).not.toHaveBeenCalled();
		});

		it('should calculate correctly when editor frame is not at viewport top', () => {
			const { deepLi, textNode } = buildNestedList();

			// Frame is far down the page at viewport top=400
			mockRect(wwFrame, { top: 400, left: 20, right: 820, bottom: 800, width: 800, height: 400 });

			// Element at viewport 850 → frame-relative = 450, exceeds viewHeight(400)
			mockRect(deepLi, { top: 850, left: 40, right: 200, bottom: 870 });
			mockSize(deepLi, 160, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			// innerTop = 850 - 400 = 450 > viewHeight(400) → needs scroll down
			expect(scrollToSpy).toHaveBeenCalled();
			const scrollArg = scrollToSpy.mock.calls[0][0];
			expect(scrollArg.top).toBeGreaterThan(0);
		});
	});

	describe('simple element scroll', () => {
		it('should scroll to a paragraph below visible area', () => {
			wysiwyg.innerHTML = '<p>line1</p><p>line2</p><p>target</p>';
			const targetP = wysiwyg.querySelectorAll('p')[2];
			const textNode = targetP.firstChild;

			// Below visible area
			mockRect(targetP, { top: 600, left: 20, right: 800, bottom: 620 });
			mockSize(targetP, 780, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			expect(scrollToSpy).toHaveBeenCalled();
		});

		it('should handle node input (not just Range)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.querySelector('p');

			mockRect(p, { top: 600, left: 20, right: 800, bottom: 620 });
			mockSize(p, 780, 20);

			selection.scrollTo(p);

			expect(scrollToSpy).toHaveBeenCalled();
		});
	});

	describe('edge cases', () => {
		it('should handle null ref gracefully', () => {
			expect(() => selection.scrollTo(null)).not.toThrow();
			expect(scrollToSpy).not.toHaveBeenCalled();
		});

		it('should handle element at exact boundary', () => {
			const { deepLi, textNode } = buildNestedList();

			// Element exactly at bottom boundary: innerTop = 400 - 100 = 300
			// viewHeight = 400, PADDING = 40: 300 + 40 = 340 <= 400 → visible
			mockRect(deepLi, { top: 400, left: 40, right: 200, bottom: 420 });
			mockSize(deepLi, 160, 20);

			const range = createRangeForNode(textNode);
			selection.scrollTo(range);

			expect(scrollToSpy).not.toHaveBeenCalled();
		});
	});
});
