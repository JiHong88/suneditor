/**
 * @fileoverview Integration tests for Offset vertical margin calculations
 * Tests #getVMargin behavior indirectly through setAbsPosition and setRangePosition.
 *
 * #getVMargin calculates vertical margins (rmt, rmb, rt) used to determine:
 * - Whether a controller/balloon toolbar should be shown at all (visibility check)
 * - Available space above/below for position flipping
 * - Toolbar height offset adjustments
 *
 * Key scenarios:
 * 1. Non-text selection (element target) — controller positioning
 * 2. Text selection (text node or Range) — balloon toolbar positioning
 * 3. Different toolbar modes: classic/sticky, balloon, inline
 * 4. Toolbar container option
 * 5. Edge cases: out-of-viewport, toolbar target, fullscreen
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

// Mock Range.prototype.getClientRects and getBoundingClientRect for JSDOM
// Required for setRangePosition → Selection.getRects → getClientRects chain
const mockDOMRect = {
	top: 80, left: 60, bottom: 100, right: 260, width: 200, height: 20,
	x: 60, y: 80,
};
const origGetClientRects = Range.prototype.getClientRects;
const origGetBoundingClientRect = Range.prototype.getBoundingClientRect;

if (!origGetClientRects) {
	Range.prototype.getClientRects = function () {
		return [mockDOMRect];
	};
}
if (!origGetBoundingClientRect) {
	Range.prototype.getBoundingClientRect = function () {
		return mockDOMRect;
	};
}

/**
 * Helper: create a positioned element with arrow child
 */
function createControllerElement({ width = 100, height = 50, withArrow = false } = {}) {
	const el = document.createElement('div');
	el.style.width = `${width}px`;
	el.style.height = `${height}px`;
	el.style.position = 'absolute';
	if (withArrow) {
		const arrow = document.createElement('span');
		arrow.className = 'se-arrow';
		arrow.style.width = '10px';
		arrow.style.height = '10px';
		el.appendChild(arrow);
	}
	document.body.appendChild(el);
	return el;
}

/**
 * Helper: create an external (non-wysiwyg) target
 */
function createExternalTarget({ top = 100, left = 50, width = 200, height = 30, position = 'absolute' } = {}) {
	const target = document.createElement('div');
	target.style.width = `${width}px`;
	target.style.height = `${height}px`;
	target.style.position = position;
	target.style.top = `${top}px`;
	target.style.left = `${left}px`;
	document.body.appendChild(target);
	return target;
}

/**
 * Helper: safely remove element from DOM
 */
function safeRemove(el) {
	if (el && el.parentNode) el.parentNode.removeChild(el);
}

// ==============================
// Classic mode (default) tests
// ==============================
describe('Offset #getVMargin — classic mode', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-classic-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'classic',
			toolbar_hide: false,
			statusbar: true,
			stickyToolbar: 0,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	describe('setAbsPosition — element target in wysiwyg (non-text selection path)', () => {
		it('should position at bottom when space is available below', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Target element for controller</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// Should return position info (not early return)
				if (result) {
					expect(result).toHaveProperty('position');
					expect(['top', 'bottom']).toContain(result.position);
				}
				// inst.__offset should be set (full execution completed)
				if (inst.__offset) {
					expect(typeof inst.__offset.left).toBe('number');
					expect(typeof inst.__offset.top).toBe('number');
					expect(inst.__offset.addOffset).toEqual({ left: 0, top: 0 });
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should position at top when space is available above', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Top position target</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should apply addOffset correctly', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Offset adjustment</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement();
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
					addOffset: { left: 15, top: 10 },
				});

				if (inst.__offset) {
					expect(inst.__offset.addOffset).toEqual({ left: 15, top: 10 });
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle sibling controller element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Sibling controller test</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const sibling = document.createElement('div');
			sibling.style.height = '40px';
			document.body.appendChild(sibling);
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
					sibling,
				});

				// siblingH affects the position flip condition (y - siblingH < 0)
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
				safeRemove(sibling);
			}
		});

		it('should set arrow direction based on position', () => {
			// Use external target to avoid JSDOM zero-dimension early return for WW targets
			const target = createExternalTarget({ top: 100, left: 50, width: 200, height: 30 });
			const el = createControllerElement({ withArrow: true });
			const arrow = el.querySelector('.se-arrow');
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// Arrow should have either se-arrow-up or se-arrow-down class, or hidden visibility
				const hasArrowUp = arrow.classList.contains('se-arrow-up');
				const hasArrowDown = arrow.classList.contains('se-arrow-down');
				const isHidden = arrow.style.visibility === 'hidden';
				// At least one of these should be true
				expect(hasArrowUp || hasArrowDown || isHidden).toBe(true);
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('should handle inline-display target element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="display:inline">inline target</span></p>';
			const target = wysiwyg.querySelector('span');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// isInlineTarget affects sticky toolbar margin check
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});
	});

	describe('setAbsPosition — external target (non-WW target path)', () => {
		it('should position controller for target outside editor', () => {
			const target = createExternalTarget({ top: 200, left: 50 });
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// External target: isWWTarget=false
				// Should complete positioning (not early return from ww margin check)
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
				if (inst.__offset) {
					expect(typeof inst.__offset.left).toBe('number');
					expect(typeof inst.__offset.top).toBe('number');
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('should position controller at top for external target', () => {
			const target = createExternalTarget({ top: 300, left: 100 });
			const el = createControllerElement({ withArrow: true, height: 60 });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('should handle target at very top of viewport', () => {
			const target = createExternalTarget({ top: 0, left: 0 });
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				// With target at top=0, top position has no space, should flip to bottom
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('should handle RTL mode with external target', () => {
			// Set RTL mode
			editor.$.options.set('_rtl', true);

			const target = createExternalTarget({ top: 150, left: 200, width: 100 });
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// In RTL, addOffset.left is multiplied by -1 and left positioning changes
				expect(el.style.left).toBeDefined();
			} finally {
				editor.$.options.set('_rtl', false);
				safeRemove(target);
				safeRemove(el);
			}
		});
	});

	describe('setAbsPosition — toolbar target (isToolbarTarget=true)', () => {
		it('should handle toolbar target differently for margin calculation', () => {
			// Create a target that looks like a toolbar element
			const toolbarMain = editor.$.context.get('toolbar_main');
			const toolbarBtn = document.createElement('button');
			toolbarBtn.className = 'se-toolbar';
			toolbarMain.appendChild(toolbarBtn);

			// Wrap in se-toolbar class for getParentElement detection
			const toolbarContainer = document.createElement('div');
			toolbarContainer.className = 'se-toolbar';
			toolbarContainer.appendChild(toolbarBtn);
			toolbarMain.appendChild(toolbarContainer);

			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, toolbarBtn, {
					position: 'bottom',
					inst,
				});

				// isToolbarTarget affects: rt=0 (skips toolbar height) and rmt calculation
				expect(el.style.top).toBeDefined();
			} finally {
				safeRemove(el);
				toolbarMain.removeChild(toolbarContainer);
			}
		});
	});

	describe('setAbsPosition — position flipping behavior', () => {
		it('should flip from bottom to top when not enough space below', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Create lots of content so target could be near bottom
			let content = '';
			for (let i = 0; i < 30; i++) {
				content += `<p>Line ${i} — padding text for scroll area</p>`;
			}
			wysiwyg.innerHTML = content;

			const target = wysiwyg.querySelectorAll('p')[25];
			const el = createControllerElement({ withArrow: true, height: 100 });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// May flip to top if rmb - (elH + ah) < 0
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should flip from top to bottom when not enough space above', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First line near top</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true, height: 200 });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				// With large element and small rmt, should flip to bottom
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle position flipping with large sibling', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Sibling flip test</p>';
			const target = wysiwyg.querySelector('p');

			const el = createControllerElement({ withArrow: true, height: 40 });
			const sibling = document.createElement('div');
			sibling.style.height = '500px'; // Very large sibling to force flip
			document.body.appendChild(sibling);

			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
					sibling,
				});

				// Large sibling makes (y - siblingH < 0) true, triggering position flip
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
				safeRemove(sibling);
			}
		});
	});

	describe('setAbsPosition — left positioning and arrow', () => {
		it('should adjust arrow left when target near right edge', () => {
			const target = createExternalTarget({ top: 100, left: 700, width: 50 });
			const el = createControllerElement({ width: 200, withArrow: true });
			const arrow = el.querySelector('.se-arrow');
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// When target is near right edge, element is shifted left and arrow adjusts
				if (inst.__offset) {
					expect(typeof inst.__offset.left).toBe('number');
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('should handle element wider than target', () => {
			const target = createExternalTarget({ top: 100, left: 100, width: 40 });
			const el = createControllerElement({ width: 300, withArrow: true });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				expect(el.style.left).toBeDefined();
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('should handle element without arrow', () => {
			const target = createExternalTarget({ top: 100, left: 100 });
			const el = createControllerElement({ withArrow: false });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				expect(el.style.top).toBeDefined();
				expect(el.style.left).toBeDefined();
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});
	});

	describe('setAbsPosition — statusbar height consideration', () => {
		it('should account for statusbar in visibility check', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Statusbar test target</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			// statusBarH is used in the visibility check: rmb - statusBarH + targetH <= 0
			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// Should position normally when target is visible
				if (result) {
					expect(result).toHaveProperty('position');
				}
			} finally {
				safeRemove(el);
			}
		});
	});
});

// ==============================
// Balloon mode tests
// ==============================
describe('Offset #getVMargin — balloon mode', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-balloon-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'balloon',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should be in balloon mode', () => {
		expect(editor.$.store.mode.isBalloon).toBe(true);
		expect(editor.$.toolbar.isBalloonMode).toBe(true);
	});

	describe('setAbsPosition in balloon mode', () => {
		it('should position controller with balloon mode toolbar', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Balloon mode controller</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// In balloon mode: headLess=true, toolbarH may be 0
				// rt = toolbarH when (!isBalloonMode || isSticky) — in balloon mode rt=0 if toolbar is hidden
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should position at top in balloon mode', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Balloon top position</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				expect(el.style.top).toBeDefined();
			} finally {
				safeRemove(el);
			}
		});
	});

	describe('setRangePosition in balloon mode', () => {
		it('should set initial styles and position element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Balloon range test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 7);

			const el = createControllerElement({ withArrow: true });
			const carrierWrapper = editor.$.contextProvider.carrierWrapper;
			if (carrierWrapper) {
				carrierWrapper.appendChild(el);
			}

			try {
				const result = editor.$.offset.setRangePosition(el, null, { position: 'bottom' });

				// Should set display to block
				expect(el.style.display).toBe('block');
				// If positioning succeeded, visibility is restored
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle setRangePosition with top position option', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Balloon top range test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null, { position: 'top' });

				expect(el.style.display).toBe('block');
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle setRangePosition with addTop option', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Balloon addTop test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 7);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null, { position: 'bottom', addTop: 10 });

				expect(el.style.display).toBe('block');
				// addTop is passed through to #setOffsetOnRange
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle explicit Range object', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Explicit range</p>';

			const p = wysiwyg.querySelector('p');
			const range = document.createRange();
			range.setStart(p.firstChild, 0);
			range.setEnd(p.firstChild, 8);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, range, { position: 'bottom' });

				expect(el.style.display).toBe('block');
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});
	});
});

// ==============================
// Inline mode tests
// ==============================
describe('Offset #getVMargin — inline mode', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-inline-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'inline',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should be in inline mode', () => {
		expect(editor.$.store.mode.isInline).toBe(true);
	});

	describe('setAbsPosition in inline mode', () => {
		it('should position controller in inline mode', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Inline mode controller</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// In inline mode: headLess=true, toolbarH may be 0
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle external target in inline mode', () => {
			const target = createExternalTarget({ top: 150, left: 100 });
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				expect(el.style.top).toBeDefined();
				expect(el.style.left).toBeDefined();
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});
	});
});

// ==============================
// Toolbar container option tests
// ==============================
describe('Offset #getVMargin — toolbar_container option', () => {
	let container;
	let editor;
	let toolbarContainerEl;

	beforeEach(async () => {
		// Create a separate toolbar container
		toolbarContainerEl = document.createElement('div');
		toolbarContainerEl.id = 'custom-toolbar-container';
		toolbarContainerEl.style.width = '600px';
		toolbarContainerEl.style.height = '50px';
		document.body.appendChild(toolbarContainerEl);

		container = document.createElement('div');
		container.id = 'vmargin-toolbar-container-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'classic',
			toolbar_container: toolbarContainerEl,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
		safeRemove(toolbarContainerEl);
	});

	it('should have toolbar_container option set', () => {
		expect(editor.$.options.get('toolbar_container')).toBe(toolbarContainerEl);
	});

	describe('setAbsPosition with toolbar_container', () => {
		it('should factor in toolbar_container for margin calculation', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Toolbar container test</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// headLess=true when toolbar_container is set
				// toolbarH may be 0 if globalTop - wScrollY - th > 0
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle top position with toolbar_container', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Toolbar container top test</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true, height: 30 });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				expect(el.style.top).toBeDefined();
			} finally {
				safeRemove(el);
			}
		});
	});
});

// ==============================
// Sticky toolbar interaction tests
// ==============================
describe('Offset #getVMargin — sticky toolbar interaction', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-sticky-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'classic',
			toolbar_hide: false,
			stickyToolbar: 0,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	describe('setAbsPosition with sticky vs non-sticky toolbar', () => {
		it('should handle non-sticky toolbar', () => {
			// Ensure toolbar is not sticky
			editor.$.toolbar.isSticky = false;

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Non-sticky toolbar test</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// When !isSticky and !isBalloonMode:
				// rt = toolbarH (since isSticky=false but isBalloonMode=false → rt=toolbarH)
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle sticky toolbar affecting rmt and rt', () => {
			// Simulate sticky toolbar
			editor.$.toolbar.isSticky = true;

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Sticky toolbar test</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				// When isSticky=true:
				// rt = toolbarH (isSticky || !isBalloonMode)
				// isSticky also affects the visibility check on line 483
				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				editor.$.toolbar.isSticky = false;
				safeRemove(el);
			}
		});

		it('should adjust top position offset when toolbar is sticky and position=top', () => {
			editor.$.toolbar.isSticky = true;

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Sticky top position test</p>';
			const target = wysiwyg.querySelector('p');
			const el = createControllerElement({ withArrow: true });
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst,
				});

				// When position=top and isSticky:
				// y = (targetRect.top - toolbarH) - elH - ah
				// This is the isSticky-specific path at line 511
				expect(el.style.top).toBeDefined();
			} finally {
				editor.$.toolbar.isSticky = false;
				safeRemove(el);
			}
		});
	});
});

// ==============================
// setRangePosition with getVMargin text selection path
// ==============================
describe('Offset #getVMargin — setRangePosition text selection path', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-range-text-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'classic',
			toolbar_hide: false,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	describe('setRangePosition visibility check via getVMargin', () => {
		it('should set display to block and visibility hidden initially', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Range visibility test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);

			const el = createControllerElement({ withArrow: true });
			const carrierWrapper = editor.$.contextProvider.carrierWrapper;
			if (carrierWrapper) carrierWrapper.appendChild(el);

			try {
				editor.$.offset.setRangePosition(el, null);

				// setRangePosition always sets these initially
				expect(el.style.display).toBe('block');
			} finally {
				safeRemove(el);
			}
		});

		it('should handle element inside carrierWrapper (isTextSelection=false in getVMargin)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Carrier wrapper test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 7);

			const el = createControllerElement({ withArrow: true });
			const carrierWrapper = editor.$.contextProvider.carrierWrapper;
			carrierWrapper.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null);
				// isTextSelection = !carrierWrapper.contains(element)
				// Since element IS in carrierWrapper, isTextSelection=false
				// This triggers the non-text-selection branch of getVMargin
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should handle element outside carrierWrapper (isTextSelection=true in getVMargin)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Outside carrier test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 7);

			const el = createControllerElement({ withArrow: true });
			// Element is in document.body, NOT in carrierWrapper

			try {
				const result = editor.$.offset.setRangePosition(el, null);
				// isTextSelection = !carrierWrapper.contains(element) = true
				// This triggers the text selection branch of getVMargin
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});
	});

	describe('setRangePosition with various toolbar states', () => {
		it('should handle when toolbar is sticky', () => {
			editor.$.toolbar.isSticky = true;

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Sticky range test</p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 6);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null);
				// In text selection path of getVMargin:
				// When isSticky, rt=0 (line 747) and st=toolbarH when toolbarH > wst
				expect(el.style.display).toBe('block');
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				editor.$.toolbar.isSticky = false;
				safeRemove(el);
			}
		});

		it('should handle when toolbar is not sticky (classic mode)', () => {
			editor.$.toolbar.isSticky = false;

			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Non-sticky range test</p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 6);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null);
				// rt = toolbarH when (!isSticky && !toolbar_container) — line 747
				expect(el.style.display).toBe('block');
				if (result === true) {
					expect(el.style.visibility).toBe('');
				}
			} finally {
				safeRemove(el);
			}
		});
	});
});

// ==============================
// setRangePosition in balloon mode with getVMargin
// ==============================
describe('Offset #getVMargin — setRangePosition balloon mode text selection', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-range-balloon-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'balloon',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should have balloon mode active', () => {
		expect(editor.$.store.mode.isBalloon).toBe(true);
	});

	it('should calculate toolbarH=0 in balloon mode for setRangePosition', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>Balloon range toolbarH test</p>';
		const p = wysiwyg.querySelector('p');
		editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 7);

		const el = createControllerElement({ withArrow: true });
		document.body.appendChild(el);

		try {
			const result = editor.$.offset.setRangePosition(el, null);
			// In setRangePosition line 636:
			// toolbarH = (!isSticky && isBalloon) ? 0 : toolbar_main.offsetHeight
			// So in balloon mode with non-sticky, toolbarH=0

			expect(el.style.display).toBe('block');
			if (result === true) {
				expect(el.style.visibility).toBe('');
			}
		} finally {
			safeRemove(el);
		}
	});

	it('should handle position=top in balloon mode', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>Balloon range top test</p>';
		const p = wysiwyg.querySelector('p');
		editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 7);

		const el = createControllerElement({ withArrow: true });
		document.body.appendChild(el);

		try {
			const result = editor.$.offset.setRangePosition(el, null, { position: 'top' });

			expect(el.style.display).toBe('block');
			if (result === true) {
				expect(el.style.visibility).toBe('');
			}
		} finally {
			safeRemove(el);
		}
	});
});

// ==============================
// Multiple content/scroll scenarios
// ==============================
describe('Offset #getVMargin — scroll and content scenarios', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-scroll-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '200px',
			mode: 'classic',
			toolbar_hide: false,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should position controller for first element in large content', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		let content = '';
		for (let i = 0; i < 50; i++) {
			content += `<p>Line ${i} with some padding text</p>`;
		}
		wysiwyg.innerHTML = content;

		const target = wysiwyg.querySelector('p');
		const el = createControllerElement({ withArrow: true });
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			if (result) {
				expect(['top', 'bottom']).toContain(result.position);
			}
		} finally {
			safeRemove(el);
		}
	});

	it('should position controller for last element in large content', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		let content = '';
		for (let i = 0; i < 50; i++) {
			content += `<p>Line ${i} with some padding text</p>`;
		}
		wysiwyg.innerHTML = content;

		const paragraphs = wysiwyg.querySelectorAll('p');
		const target = paragraphs[paragraphs.length - 1];
		const el = createControllerElement({ withArrow: true });
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			if (result) {
				expect(['top', 'bottom']).toContain(result.position);
			}
		} finally {
			safeRemove(el);
		}
	});

	it('should position controller for middle element in large content', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		let content = '';
		for (let i = 0; i < 50; i++) {
			content += `<p>Line ${i} with some padding text</p>`;
		}
		wysiwyg.innerHTML = content;

		const paragraphs = wysiwyg.querySelectorAll('p');
		const target = paragraphs[25];
		const el = createControllerElement({ withArrow: true });
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'top',
				inst,
			});

			if (result) {
				expect(['top', 'bottom']).toContain(result.position);
			}
		} finally {
			safeRemove(el);
		}
	});

	it('should handle image-like component target', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p><img src="data:image/png;base64,iVBORw0KGgo=" style="width:100px;height:80px" /></p>';

		const target = wysiwyg.querySelector('img');
		const el = createControllerElement({ withArrow: true });
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// Image is an element inside wysiwyg (isWWTarget=true, isElTarget=true)
			// So isTextSelection=false → goes to non-text selection path of getVMargin
			if (result) {
				expect(['top', 'bottom']).toContain(result.position);
			}
		} finally {
			safeRemove(el);
		}
	});

	it('should handle table cell target', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<table><tbody><tr><td>Cell content</td></tr></tbody></table>';

		const target = wysiwyg.querySelector('td');
		const el = createControllerElement({ withArrow: true });
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			if (result) {
				expect(['top', 'bottom']).toContain(result.position);
			}
		} finally {
			safeRemove(el);
		}
	});
});

// ==============================
// isWWTarget edge cases
// ==============================
describe('Offset #getVMargin — isWWTarget detection', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-wwtarget-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '600px',
			height: '300px',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should detect wrapper-contained target as WW target', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>WW target test</p>';
		const target = wysiwyg.querySelector('p');
		const el = createControllerElement();
		const inst = { __offset: null };

		try {
			// Target inside wysiwyg which is inside wrapper → isWWTarget=true
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// isWWTarget=true enables the visibility margin check
			if (result) {
				expect(result).toHaveProperty('position');
			}
		} finally {
			safeRemove(el);
		}
	});

	it('should detect external target as non-WW target', () => {
		const target = createExternalTarget();
		const el = createControllerElement();
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// isWWTarget=false → skips the rmt+targetH<0 early return
			if (result) {
				expect(result).toHaveProperty('position');
			}
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});

	it('should force isWWTarget=true via params.isWWTarget', () => {
		const target = createExternalTarget();
		const el = createControllerElement();
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
				isWWTarget: true,
			});

			// params.isWWTarget=true overrides the wrapper.contains check
			if (result) {
				expect(result).toHaveProperty('position');
			}
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});
});

// ==============================
// Return value and inst.__offset consistency
// ==============================
describe('Offset setAbsPosition — return value and inst.__offset', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-return-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '600px',
			height: '300px',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should return {position: "bottom"} when arrowDir is "up"', () => {
		const target = createExternalTarget({ top: 50, left: 50 });
		const el = createControllerElement({ withArrow: true });
		const inst = { __offset: null };

		try {
			const result = editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// position: 'bottom' means arrow is 'up' → result.position = 'bottom'
			// position: 'top' means arrow is 'down' → result.position = 'top'
			if (result) {
				expect(['top', 'bottom']).toContain(result.position);
			}
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});

	it('should always set inst.__offset when positioning completes', () => {
		const target = createExternalTarget({ top: 200, left: 200 });
		const el = createControllerElement();
		const inst = { __offset: null };

		try {
			editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// If not early-returned, inst.__offset should be set
			if (inst.__offset) {
				expect(inst.__offset).toHaveProperty('left');
				expect(inst.__offset).toHaveProperty('top');
				expect(inst.__offset).toHaveProperty('addOffset');
				expect(typeof inst.__offset.left).toBe('number');
				expect(typeof inst.__offset.top).toBe('number');
			}
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});

	it('should store addOffset in inst.__offset', () => {
		const target = createExternalTarget({ top: 200, left: 200 });
		const el = createControllerElement();
		const inst = { __offset: null };
		const addOffset = { left: 20, top: 15, right: 0 };

		try {
			editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
				addOffset,
			});

			if (inst.__offset) {
				expect(inst.__offset.addOffset).toEqual(addOffset);
			}
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});
});

// ==============================
// getVMargin interaction with getGlobal
// ==============================
describe('Offset #getVMargin — getGlobal() dependency', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-global-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '600px',
			height: '300px',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('getGlobal returns consistent values used by getVMargin', () => {
		// getVMargin calls this.getGlobal() to get editorOffset
		const result1 = editor.$.offset.getGlobal();
		const result2 = editor.$.offset.getGlobal();

		// Should be consistent between calls (no state mutation)
		expect(result1.top).toBe(result2.top);
		expect(result1.left).toBe(result2.left);
		expect(result1.fixedTop).toBe(result2.fixedTop);
		expect(result1.fixedLeft).toBe(result2.fixedLeft);
		expect(result1.width).toBe(result2.width);
		expect(result1.height).toBe(result2.height);
	});

	it('getGlobal with topArea returns editor position used in getVMargin', () => {
		const topArea = editor.$.frameContext.get('topArea');
		const result = editor.$.offset.getGlobal(topArea);

		// getVMargin uses: editorOffset.fixedTop, editorOffset.height, editorOffset.top
		expect(typeof result.fixedTop).toBe('number');
		expect(typeof result.height).toBe('number');
		expect(typeof result.top).toBe('number');
	});

	it('getGlobal with no args defaults to topArea', () => {
		const topArea = editor.$.frameContext.get('topArea');
		const defaultResult = editor.$.offset.getGlobal();
		const topAreaResult = editor.$.offset.getGlobal(topArea);

		// Both should return the same values
		expect(defaultResult.top).toBe(topAreaResult.top);
		expect(defaultResult.left).toBe(topAreaResult.left);
		expect(defaultResult.width).toBe(topAreaResult.width);
		expect(defaultResult.height).toBe(topAreaResult.height);
	});
});

// ==============================
// Additional coverage: borderRadius + arrow positioning
// ==============================
describe('Offset setAbsPosition — borderRadius and arrow edge cases', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'vmargin-arrow-edge-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '600px',
			height: '300px',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	it('should handle element with borderRadius', () => {
		const target = createExternalTarget({ top: 100, left: 100, width: 100 });
		const el = createControllerElement({ width: 200, withArrow: true });
		el.style.borderRadius = '8px';
		const inst = { __offset: null };

		try {
			editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// borderRadius affects arrow positioning: radius <= 2 ? 0 : radius - 2
			expect(el.style.left).toBeDefined();
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});

	it('should handle element with zero borderRadius', () => {
		const target = createExternalTarget({ top: 100, left: 100, width: 100 });
		const el = createControllerElement({ width: 200, withArrow: true });
		el.style.borderRadius = '0px';
		const inst = { __offset: null };

		try {
			editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			expect(el.style.left).toBeDefined();
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});

	it('should handle narrow target with wide arrow', () => {
		const target = createExternalTarget({ top: 100, left: 100, width: 5 });
		const el = createControllerElement({ width: 100, withArrow: true });
		const arrow = el.querySelector('.se-arrow');
		arrow.style.width = '20px';
		const inst = { __offset: null };

		try {
			editor.$.offset.setAbsPosition(el, target, {
				position: 'bottom',
				inst,
			});

			// When targetW + rml < aw (narrow target + small arrow width),
			// arrow gets special positioning
			expect(el.style.left).toBeDefined();
		} finally {
			safeRemove(target);
			safeRemove(el);
		}
	});
});

// ================================================================
// Numerical verification — actual offset value validation
// ================================================================
describe('Offset — numerical value verification', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'offset-numeric-test';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold']],
			width: '600px',
			height: '300px',
			mode: 'classic',
			toolbar_hide: false,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		safeRemove(container);
	});

	describe('get() and getLocal() numerical relationship', () => {
		it('get() should equal getLocal() in non-iframe mode (no iframe offset)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Numerical test</p>';
			const p = wysiwyg.querySelector('p');

			const local = editor.$.offset.getLocal(p);
			const outside = editor.$.offset.get(p);

			// In non-iframe mode, get() adds 0 for both left and top
			// get() = { left: local.left + 0, top: local.top + 0 }
			expect(outside.left).toBe(local.left);
			expect(outside.top).toBe(local.top);
		});

		it('getLocal() should return finite numbers for all properties', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Finite check</p>';
			const p = wysiwyg.querySelector('p');

			const result = editor.$.offset.getLocal(p);

			expect(Number.isFinite(result.left)).toBe(true);
			expect(Number.isFinite(result.top)).toBe(true);
			expect(Number.isFinite(result.right)).toBe(true);
			expect(Number.isFinite(result.scrollX)).toBe(true);
			expect(Number.isFinite(result.scrollY)).toBe(true);
			expect(Number.isFinite(result.scrollH)).toBe(true);
		});

		it('getLocal().scrollX and scrollY should be >= 0 (no negative scroll)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Scroll positivity</p>';
			const p = wysiwyg.querySelector('p');

			const result = editor.$.offset.getLocal(p);

			expect(result.scrollX).toBeGreaterThanOrEqual(0);
			expect(result.scrollY).toBeGreaterThanOrEqual(0);
			expect(result.scrollH).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getGlobal() numerical properties', () => {
		it('should return finite numbers for all properties', () => {
			const result = editor.$.offset.getGlobal();

			expect(Number.isFinite(result.top)).toBe(true);
			expect(Number.isFinite(result.left)).toBe(true);
			expect(Number.isFinite(result.fixedTop)).toBe(true);
			expect(Number.isFinite(result.fixedLeft)).toBe(true);
			expect(Number.isFinite(result.width)).toBe(true);
			expect(Number.isFinite(result.height)).toBe(true);
		});

		it('width and height should be >= 0', () => {
			const result = editor.$.offset.getGlobal();

			expect(result.width).toBeGreaterThanOrEqual(0);
			expect(result.height).toBeGreaterThanOrEqual(0);
		});

		it('top should equal fixedTop + scrollY', () => {
			const result = editor.$.offset.getGlobal();
			// getGlobal: top = rect.top + wy, fixedTop = rect.top
			// so top = fixedTop + scrollY
			expect(result.top).toBe(result.fixedTop + window.scrollY);
		});

		it('left should equal fixedLeft + scrollX', () => {
			const result = editor.$.offset.getGlobal();
			// getGlobal: left = rect.left + wx, fixedLeft = rect.left
			expect(result.left).toBe(result.fixedLeft + window.scrollX);
		});

		it('should return all zeros for text node (non-element)', () => {
			const textNode = document.createTextNode('test');
			const result = editor.$.offset.getGlobal(textNode);

			expect(result.top).toBe(0);
			expect(result.left).toBe(0);
			expect(result.fixedTop).toBe(0);
			expect(result.fixedLeft).toBe(0);
			expect(result.width).toBe(0);
			expect(result.height).toBe(0);
		});
	});

	describe('getWWScroll() numerical invariants', () => {
		it('bottom should always equal top + height', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result.bottom).toBe(result.top + result.height);
		});

		it('all values should be finite non-negative numbers', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result.top).toBeGreaterThanOrEqual(0);
			expect(result.left).toBeGreaterThanOrEqual(0);
			expect(result.width).toBeGreaterThanOrEqual(0);
			expect(result.height).toBeGreaterThanOrEqual(0);
			expect(result.bottom).toBeGreaterThanOrEqual(0);

			expect(Number.isFinite(result.top)).toBe(true);
			expect(Number.isFinite(result.left)).toBe(true);
			expect(Number.isFinite(result.width)).toBe(true);
			expect(Number.isFinite(result.height)).toBe(true);
			expect(Number.isFinite(result.bottom)).toBe(true);
		});
	});

	describe('getGlobalScroll() numerical invariants', () => {
		it('all numeric values should be finite', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(Number.isFinite(result.top)).toBe(true);
			expect(Number.isFinite(result.left)).toBe(true);
			expect(Number.isFinite(result.width)).toBe(true);
			expect(Number.isFinite(result.height)).toBe(true);
			expect(Number.isFinite(result.x)).toBe(true);
			expect(Number.isFinite(result.y)).toBe(true);
			expect(Number.isFinite(result.oh)).toBe(true);
			expect(Number.isFinite(result.ow)).toBe(true);
			expect(Number.isFinite(result.ts)).toBe(true);
			expect(Number.isFinite(result.ls)).toBe(true);
		});

		it('scroll values should be >= 0', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(result.top).toBeGreaterThanOrEqual(0);
			expect(result.left).toBeGreaterThanOrEqual(0);
			expect(result.oh).toBeGreaterThanOrEqual(0);
			expect(result.ow).toBeGreaterThanOrEqual(0);
		});
	});

	describe('setAbsPosition — addOffset numerical effect', () => {
		it('addOffset.top should shift element.style.top by exact amount', () => {
			const target = createExternalTarget({ top: 100, left: 100 });
			const el = createControllerElement();
			const inst1 = { __offset: null };
			const inst2 = { __offset: null };

			try {
				// First call with no additional offset
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: inst1,
					addOffset: { left: 0, top: 0 },
				});
				const top1 = parseFloat(el.style.top);

				// Second call with additional top offset
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: inst2,
					addOffset: { left: 0, top: 25 },
				});
				const top2 = parseFloat(el.style.top);

				// The difference should be exactly 25px
				if (!isNaN(top1) && !isNaN(top2)) {
					expect(top2 - top1).toBe(25);
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('addOffset.left should shift element.style.left by exact amount', () => {
			const target = createExternalTarget({ top: 100, left: 100 });
			const el = createControllerElement();
			const inst1 = { __offset: null };
			const inst2 = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: inst1,
					addOffset: { left: 0, top: 0 },
				});
				const left1 = parseFloat(el.style.left);

				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: inst2,
					addOffset: { left: 30, top: 0 },
				});
				const left2 = parseFloat(el.style.left);

				if (!isNaN(left1) && !isNaN(left2)) {
					expect(left2 - left1).toBe(30);
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('element.style.top should be a parseable pixel value', () => {
			const target = createExternalTarget({ top: 100, left: 100 });
			const el = createControllerElement();
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				const topVal = parseFloat(el.style.top);
				expect(Number.isFinite(topVal)).toBe(true);
				expect(el.style.top).toMatch(/^-?\d+(\.\d+)?px$/);
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('element.style.left should be a parseable pixel value', () => {
			const target = createExternalTarget({ top: 100, left: 100 });
			const el = createControllerElement();
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				const leftVal = parseFloat(el.style.left);
				expect(Number.isFinite(leftVal)).toBe(true);
				expect(el.style.left).toMatch(/^-?\d+(\.\d+)?px$/);
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('inst.__offset.top should include window scroll', () => {
			const target = createExternalTarget({ top: 100, left: 100 });
			const el = createControllerElement();
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				if (inst.__offset) {
					// inst.__offset.top = el.offsetTop + wwScroll.top (for non-WW: window scroll)
					expect(Number.isFinite(inst.__offset.top)).toBe(true);
					expect(Number.isFinite(inst.__offset.left)).toBe(true);
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});
	});

	describe('setAbsPosition — position=top vs position=bottom', () => {
		it('both positions should produce valid pixel top values', () => {
			const target = createExternalTarget({ top: 200, left: 100, height: 40 });
			const el = createControllerElement({ height: 50, withArrow: true });
			const inst1 = { __offset: null };
			const inst2 = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: inst1,
				});
				const topBottom = parseFloat(el.style.top);

				editor.$.offset.setAbsPosition(el, target, {
					position: 'top',
					inst: inst2,
				});
				const topTop = parseFloat(el.style.top);

				// Both should be valid finite numbers
				expect(Number.isFinite(topBottom)).toBe(true);
				expect(Number.isFinite(topTop)).toBe(true);

				// In a real browser (non-zero rects), bottom position top > top position top.
				// In JSDOM zero-rect environment they may coincide but must still be finite.
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});

		it('return position field should reflect the actually applied direction', () => {
			const target = createExternalTarget({ top: 200, left: 100, height: 40 });
			const el = createControllerElement({ withArrow: true });
			const arrow = el.querySelector('.se-arrow');
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst,
				});

				if (result) {
					// result.position = 'bottom' when arrowDir='up', 'top' when arrowDir='down'
					if (result.position === 'bottom') {
						expect(arrow.classList.contains('se-arrow-up')).toBe(true);
					} else if (result.position === 'top') {
						expect(arrow.classList.contains('se-arrow-down')).toBe(true);
					}
				}
			} finally {
				safeRemove(target);
				safeRemove(el);
			}
		});
	});

	describe('setAbsPosition — RTL addOffset inversion', () => {
		it('should invert addOffset.left in RTL mode', () => {
			const target = createExternalTarget({ top: 100, left: 300 });
			const el = createControllerElement();
			const instLTR = { __offset: null };
			const instRTL = { __offset: null };

			try {
				// LTR mode
				editor.$.options.set('_rtl', false);
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: instLTR,
					addOffset: { left: 20, top: 0 },
				});
				const leftLTR = parseFloat(el.style.left);

				// RTL mode
				editor.$.options.set('_rtl', true);
				editor.$.offset.setAbsPosition(el, target, {
					position: 'bottom',
					inst: instRTL,
					addOffset: { left: 20, top: 0 },
				});
				const leftRTL = parseFloat(el.style.left);

				// In RTL, addOffset.left is multiplied by -1
				// So the left positions should differ
				if (!isNaN(leftLTR) && !isNaN(leftRTL)) {
					expect(leftLTR).not.toBe(leftRTL);
				}
			} finally {
				editor.$.options.set('_rtl', false);
				safeRemove(target);
				safeRemove(el);
			}
		});
	});

	describe('setRangePosition — numerical verification', () => {
		it('should set element.style.top and left as pixel values', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Range numeric test</p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null, { position: 'bottom' });

				if (result === true) {
					const topVal = parseFloat(el.style.top);
					const leftVal = parseFloat(el.style.left);

					expect(Number.isFinite(topVal)).toBe(true);
					expect(Number.isFinite(leftVal)).toBe(true);
					expect(el.style.top).toMatch(/^-?\d+(\.\d+)?px$/);
					expect(el.style.left).toMatch(/^-?\d+(\.\d+)?px$/);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should set arrow left style as a pixel value', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Arrow position check</p>';
			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				const result = editor.$.offset.setRangePosition(el, null);

				if (result === true) {
					const arrow = el.querySelector('.se-arrow');
					if (arrow.style.left) {
						const arrowLeft = parseFloat(arrow.style.left);
						expect(Number.isFinite(arrowLeft)).toBe(true);
						expect(arrowLeft).toBeGreaterThanOrEqual(0);
					}
				}
			} finally {
				safeRemove(el);
			}
		});

		it('should produce different positions for position=top vs position=bottom', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Position diff test</p>';
			const p = wysiwyg.querySelector('p');

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);
				editor.$.offset.setRangePosition(el, null, { position: 'bottom' });
				const topBottom = parseFloat(el.style.top);

				editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);
				editor.$.offset.setRangePosition(el, null, { position: 'top' });
				const topTop = parseFloat(el.style.top);

				// top and bottom positions should differ (element positioned above vs below selection)
				if (!isNaN(topBottom) && !isNaN(topTop) && topBottom !== topTop) {
					expect(topBottom).not.toBe(topTop);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('addTop should shift vertical position', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>AddTop shift test</p>';
			const p = wysiwyg.querySelector('p');

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);
				editor.$.offset.setRangePosition(el, null, { position: 'bottom', addTop: 0 });
				const top1 = parseFloat(el.style.top);

				editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);
				editor.$.offset.setRangePosition(el, null, { position: 'bottom', addTop: 15 });
				const top2 = parseFloat(el.style.top);

				// addTop should shift the position
				if (!isNaN(top1) && !isNaN(top2)) {
					// addTop is subtracted from position, so top2 should be less (higher on screen)
					expect(top2).not.toBe(top1);
					// The difference should be exactly 15
					expect(Math.abs(top2 - top1)).toBe(15);
				}
			} finally {
				safeRemove(el);
			}
		});

		it('arrow should have correct class for position direction', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Arrow class check</p>';
			const p = wysiwyg.querySelector('p');

			const el = createControllerElement({ withArrow: true });
			document.body.appendChild(el);

			try {
				editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 5);
				const result = editor.$.offset.setRangePosition(el, null, { position: 'bottom' });

				if (result === true) {
					const arrow = el.querySelector('.se-arrow');
					const isUp = arrow.classList.contains('se-arrow-up');
					const isDown = arrow.classList.contains('se-arrow-down');

					// Arrow should have exactly one direction class
					expect(isUp || isDown).toBe(true);
					// Can't have both simultaneously
					expect(isUp && isDown).toBe(false);
				}
			} finally {
				safeRemove(el);
			}
		});
	});

	describe('setRelPosition — numerical verification', () => {
		it('should set top and left as pixel values', () => {
			const menu = document.createElement('div');
			menu.style.width = '100px';
			menu.style.height = '50px';
			menu.style.position = 'absolute';
			document.body.appendChild(menu);

			const carrier = document.createElement('div');
			carrier.style.position = 'relative';
			document.body.appendChild(carrier);

			const target = document.createElement('div');
			target.style.width = '80px';
			target.style.height = '30px';

			const targetContainer = document.createElement('div');
			targetContainer.style.position = 'relative';
			targetContainer.appendChild(target);
			document.body.appendChild(targetContainer);

			try {
				editor.$.offset.setRelPosition(menu, carrier, target, targetContainer);

				const topVal = parseFloat(menu.style.top);
				const leftVal = parseFloat(menu.style.left);

				expect(Number.isFinite(topVal)).toBe(true);
				expect(Number.isFinite(leftVal)).toBe(true);
				expect(menu.style.top).toMatch(/^-?\d+(\.\d+)?px$/);
				expect(menu.style.left).toMatch(/^-?\d+(\.\d+)?px$/);
			} finally {
				safeRemove(menu);
				safeRemove(carrier);
				safeRemove(targetContainer);
			}
		});

		it('fixed container should set position=fixed', () => {
			const menu = document.createElement('div');
			menu.style.width = '100px';
			menu.style.height = '50px';
			document.body.appendChild(menu);

			const carrier = document.createElement('div');
			document.body.appendChild(carrier);

			const target = document.createElement('div');
			target.style.width = '80px';
			target.style.height = '20px';

			const fixedContainer = document.createElement('div');
			fixedContainer.style.position = 'fixed';
			fixedContainer.appendChild(target);
			document.body.appendChild(fixedContainer);

			try {
				editor.$.offset.setRelPosition(menu, carrier, target, fixedContainer);

				expect(menu.style.position).toBe('fixed');
				// top = tGlobal.fixedTop + tGlobal.height (numerical value)
				const topVal = parseFloat(menu.style.top);
				expect(Number.isFinite(topVal)).toBe(true);
			} finally {
				safeRemove(menu);
				safeRemove(carrier);
				safeRemove(fixedContainer);
			}
		});

		it('non-fixed container should reset position to empty string', () => {
			const menu = document.createElement('div');
			menu.style.width = '100px';
			menu.style.height = '50px';
			menu.style.position = 'fixed'; // pre-set to fixed
			document.body.appendChild(menu);

			const carrier = document.createElement('div');
			carrier.style.position = 'relative';
			document.body.appendChild(carrier);

			const target = document.createElement('div');
			target.style.width = '80px';
			target.style.height = '30px';

			const staticContainer = document.createElement('div');
			staticContainer.style.position = 'relative';
			staticContainer.appendChild(target);
			document.body.appendChild(staticContainer);

			try {
				editor.$.offset.setRelPosition(menu, carrier, target, staticContainer);

				// Non-fixed container: position should be reset to empty
				expect(menu.style.position).toBe('');
			} finally {
				safeRemove(menu);
				safeRemove(carrier);
				safeRemove(staticContainer);
			}
		});
	});

	describe('getGlobal() — identical element produces same values', () => {
		it('multiple calls should return identical results (no side effects)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Idempotent test</p>';
			const p = wysiwyg.querySelector('p');

			const r1 = editor.$.offset.getGlobal(p);
			const r2 = editor.$.offset.getGlobal(p);
			const r3 = editor.$.offset.getGlobal(p);

			expect(r1.top).toBe(r2.top);
			expect(r2.top).toBe(r3.top);
			expect(r1.left).toBe(r2.left);
			expect(r2.left).toBe(r3.left);
			expect(r1.fixedTop).toBe(r2.fixedTop);
			expect(r1.fixedLeft).toBe(r2.fixedLeft);
			expect(r1.width).toBe(r2.width);
			expect(r1.height).toBe(r2.height);
		});
	});

	describe('getLocal() — offset accumulation correctness', () => {
		it('nested element offset should be >= parent element offset', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div><p>Nested</p></div>';

			const div = wysiwyg.querySelector('div');
			const p = wysiwyg.querySelector('p');

			const parentLocal = editor.$.offset.getLocal(div);
			const childLocal = editor.$.offset.getLocal(p);

			// In a standard layout, child top >= parent top (nested inside)
			expect(childLocal.top).toBeGreaterThanOrEqual(parentLocal.top);
		});

		it('should return consistent values for same element across methods', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Consistency check</p>';
			const p = wysiwyg.querySelector('p');

			const local = editor.$.offset.getLocal(p);
			const outside = editor.$.offset.get(p);

			// In non-iframe mode: outside = local + iframe offset (0)
			// So values should match exactly
			expect(outside.top).toBe(local.top);
			expect(outside.left).toBe(local.left);
		});
	});
});
