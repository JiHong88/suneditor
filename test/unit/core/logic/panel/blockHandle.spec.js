/**
 * @fileoverview Unit tests for blockHandle.js
 */

import BlockHandle from '../../../../../src/core/logic/panel/blockHandle.js';

// Mock helper modules
jest.mock('../../../../../src/helper', () => ({
	dom: {
		check: {
			isElement: jest.fn().mockReturnValue(true),
			isInputElement: jest.fn().mockReturnValue(false),
			isWysiwygFrame: jest.fn().mockReturnValue(false)
		},
		utils: {
			addClass: jest.fn(),
			removeClass: jest.fn(),
			hasClass: jest.fn().mockReturnValue(false),
			createElement: jest.fn().mockImplementation((tag, attrs, innerHTML) => {
				const el = global.document.createElement(tag || 'div');
				if (attrs) Object.keys(attrs).forEach((attr) => el.setAttribute(attr, attrs[attr]));
				if (innerHTML) el.innerHTML = innerHTML;
				return el;
			}),
			getClientSize: jest.fn().mockReturnValue({ w: 1024, h: 768 }),
			copyTagAttributes: jest.fn()
		},
		query: {
			getEventTarget: jest.fn((e) => e.target),
			getParentElement: jest.fn((el) => el.parentElement),
			getListChildren: jest.fn().mockReturnValue([])
		}
	},
	env: { _w: { requestAnimationFrame: jest.fn((cb) => { cb(); return 1; }), cancelAnimationFrame: jest.fn(), setTimeout: jest.fn((cb) => { cb(); return 1; }), clearTimeout: jest.fn(), innerWidth: 1024, innerHeight: 768, getComputedStyle: jest.fn(() => ({ marginLeft: '0px', paddingLeft: '0px', marginRight: '0px', paddingRight: '0px', fontSize: '16px', getPropertyValue: () => '' })), scrollX: 0, scrollY: 0 }, _d: { documentElement: {} } }
}));

// Mock resolveBlock — blockHandle imports it directly from `./blockResolver`
jest.mock('../../../../../src/core/logic/panel/blockResolver', () => ({
	resolveBlock: jest.fn()
}));

// Mock SelectMenu — block handle's action menu is lazily built on drag click;
// we don't need its real implementation, just a minimal stub for the drag-click flow.
jest.mock('../../../../../src/modules/ui/SelectMenu.js', () => {
	return jest.fn().mockImplementation(() => ({
		isOpen: false,
		form: globalThis.document.createElement('div'),
		items: [],
		menus: [],
		on: jest.fn(),
		create: jest.fn(),
		open: jest.fn(),
		close: jest.fn()
	}));
});

import { resolveBlock } from '../../../../../src/core/logic/panel/blockResolver';

function createMockDeps() {
	return {
		format: {
			getLine: jest.fn(),
			getBlock: jest.fn(),
			isLine: jest.fn(),
			isBlock: jest.fn(),
			isBrLine: jest.fn().mockReturnValue(false),
			getLines: jest.fn().mockReturnValue([]),
			addLine: jest.fn().mockReturnValue(document.createElement('p')),
			addLineAfter: jest.fn().mockImplementation((el) => {
				const newEl = document.createElement(el?.nodeName === 'LI' ? 'LI' : 'P');
				newEl.innerHTML = '<br>';
				if (el?.parentNode) el.parentNode.insertBefore(newEl, el.nextElementSibling);
				return newEl;
			})
		},
		selection: {
			setRange: jest.fn(),
			getRange: jest.fn().mockReturnValue(null)
		},
		history: {
			push: jest.fn()
		},
		frameContext: (() => {
			const cache = {};
			return {
				get: jest.fn((key) => {
					if (!cache[key]) {
						const el = document.createElement('div');
						el.getBoundingClientRect = () => ({ top: 0, left: 0, right: 1024, bottom: 768, width: 1024, height: 768 });
						cache[key] = el;
					}
					return cache[key];
				})
			};
		})(),
		options: {
			get: jest.fn().mockImplementation((key) => {
				if (key === 'defaultLine') return 'P';
				if (key === '_rtl') return false;
				return false;
			})
		},
		frameOptions: {
			get: jest.fn().mockImplementation((key) => {
				if (key === 'innerWidth') return '';
				return false;
			})
		},
		plugins: {},
		menu: { targetMap: {} },
		icons: {},
		lang: {},
		ui: { selectMenuOn: false },
		offset: { getGlobal: jest.fn().mockReturnValue({ top: 100, left: 0, height: 24, width: 24 }) },
		store: { set: jest.fn() },
		contextProvider: { carrierWrapper: document.createElement('div') },
		eventManager: {
			addEvent: jest.fn((target, type, handler, useCapture) => {
				target?.addEventListener?.(type, handler, useCapture);
				return { target, type, handler, useCapture };
			}),
			removeEvent: jest.fn((info) => {
				info?.target?.removeEventListener?.(info.type, info.handler, info.useCapture);
			}),
			applyTagEffect: jest.fn()
		},
		commandDispatcher: {
			registerTargets: jest.fn(),
			unregisterTargets: jest.fn()
		}
	};
}

function createHandleElements() {
	const area = document.createElement('div');
	area.classList.add('se-block-handle-area');
	const handle = document.createElement('div');
	handle.classList.add('se-block-handle');
	const plus = document.createElement('div');
	plus.classList.add('se-block-handle-plus');
	const drag = document.createElement('div');
	drag.classList.add('se-block-handle-drag');
	area.appendChild(handle);
	handle.appendChild(plus);
	handle.appendChild(drag);
	return { area, handle, plus, drag };
}

describe('BlockHandle', () => {
	let $, els, blockHandle;

	beforeEach(() => {
		$ = createMockDeps();
		els = createHandleElements();
		resolveBlock.mockReset();
	});

	afterEach(() => {
		blockHandle?.destroy();
		blockHandle = null;
	});

	describe('constructor', () => {
		it('creates instance and binds click listeners', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			expect(blockHandle).toBeDefined();
		});

		it('creates action menu when menuConfig provided', () => {
			$.plugins.testCmd = { constructor: { type: 'command', icon: 'bold', title: 'Bold' } };
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, ['testCmd']);
			expect(blockHandle).toBeDefined();
		});
	});

	describe('positionForTarget', () => {
		it('calls resolveBlock and shows handle for valid block', () => {
			const p = document.createElement('p');
			document.body.appendChild(p); // isConnected = true
			const mockRect = { top: 100, left: 0, bottom: 120, right: 400, width: 400, height: 20 };
			p.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0 });

			resolveBlock.mockReturnValue({
				element: p,
				type: 'p',
				depth: 0,
				parent: null,
				siblings: { prev: null, next: null },
				rect: mockRect
			});

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p);

			expect(resolveBlock).toHaveBeenCalled();
			expect(els.handle.style.display).toBe('flex');
			expect(els.handle.style.top).toBe('100px'); // blockRect.top + scrollY (handle lives in carrierWrapper)
		});

		it('hides handle when resolveBlock returns null', () => {
			resolveBlock.mockReturnValue(null);

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			els.handle.style.display = 'flex';
			blockHandle.positionForTarget(document.createElement('div'));

			expect(els.handle.style.display).toBe('none');
		});

		it('skips repositioning for same block', () => {
			const p = document.createElement('p');
			document.body.appendChild(p);
			const mockRect = { top: 100, left: 0, bottom: 120, right: 400, width: 400, height: 20 };
			p.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0 });

			resolveBlock.mockReturnValue({
				element: p, type: 'p', depth: 0, parent: null,
				siblings: { prev: null, next: null }, rect: mockRect
			});

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);

			blockHandle.positionForTarget(p);
			const callCount = p.getBoundingClientRect.mock.calls.length;

			// Second call with same element — should skip
			blockHandle.positionForTarget(p);
			expect(p.getBoundingClientRect.mock.calls.length).toBe(callCount);
		});
	});

	describe('hide', () => {
		it('hides handle when relatedTarget is outside area', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			els.handle.style.display = 'flex';

			blockHandle.hide({ relatedTarget: document.createElement('div') });
			expect(els.handle.style.display).toBe('none');
		});

		it('does not hide when relatedTarget is inside handle area', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			els.handle.style.display = 'flex';

			blockHandle.hide({ relatedTarget: els.plus });
			expect(els.handle.style.display).toBe('flex');
		});
	});

	describe('syncScroll', () => {
		it('repositions when block is visible', () => {
			const p = document.createElement('p');
			document.body.appendChild(p);
			const mockRect = { top: 120, left: 0, bottom: 140, right: 400, width: 400, height: 20 };
			p.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0 });

			resolveBlock.mockReturnValue({
				element: p, type: 'p', depth: 0, parent: null,
				siblings: { prev: null, next: null }, rect: mockRect
			});

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p);

			// Simulate scroll — block moved
			p.getBoundingClientRect.mockReturnValue({ top: 80, left: 0, bottom: 100, right: 400, width: 400, height: 20 });
			blockHandle.syncScroll();

			expect(els.handle.style.top).toBe('80px'); // blockRect.top + scrollY (handle lives in carrierWrapper)
		});

		it('does nothing when no current block', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			// Should not throw
			blockHandle.syncScroll();
		});
	});

	describe('plus button', () => {
		it('inserts new line after current block', () => {
			const container = document.createElement('div');
			const p = document.createElement('p');
			p.innerHTML = 'hello';
			container.appendChild(p);
			document.body.appendChild(container);
			const mockRect = { top: 100, left: 0, bottom: 120, right: 400, width: 400, height: 20 };
			p.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0 });

			resolveBlock.mockReturnValue({
				element: p, type: 'p', depth: 0, parent: null,
				siblings: { prev: null, next: null }, rect: mockRect
			});

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p);

			// Click plus
			els.plus.click();

			// New P should be inserted after the current P
			expect(p.nextElementSibling).not.toBeNull();
			expect(p.nextElementSibling.nodeName).toBe('P');
			expect($.history.push).toHaveBeenCalledWith(false);
		});

		it('inserts default line after heading', () => {
			const container = document.createElement('div');
			const h2 = document.createElement('h2');
			h2.innerHTML = 'Title';
			container.appendChild(h2);
			document.body.appendChild(container);
			const mockRect = { top: 100, left: 0, bottom: 120, right: 400, width: 400, height: 20 };
			h2.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0 });

			resolveBlock.mockReturnValue({
				element: h2, type: 'heading', depth: 0, parent: null,
				siblings: { prev: null, next: null }, rect: mockRect
			});

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(h2);

			els.plus.click();

			// Should be default line P, not H2
			expect(h2.nextElementSibling.nodeName).toBe('P');
		});
	});

	describe('destroy', () => {
		it('cleans up without errors', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			expect(() => blockHandle.destroy()).not.toThrow();
			blockHandle = null; // prevent afterEach double-destroy
		});

		it('handles destroyed state gracefully in positionForTarget', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.destroy();

			// Should not throw after destroy
			expect(() => blockHandle.positionForTarget(document.createElement('p'))).not.toThrow();
			blockHandle = null;
		});
	});

	// ─── Helpers for range-aware tests ────────────────────────────────────────
	// Build a 3-paragraph container (p1, p2, p3) attached to the document, with
	// stable getBoundingClientRect mocks so `positionForTarget` can place the handle.
	function setupThreeBlocks() {
		const container = document.createElement('div');
		const p1 = document.createElement('p'); p1.textContent = 'one';
		const p2 = document.createElement('p'); p2.textContent = 'two';
		const p3 = document.createElement('p'); p3.textContent = 'three';
		container.appendChild(p1); container.appendChild(p2); container.appendChild(p3);
		document.body.appendChild(container);
		const rect = { top: 100, left: 0, bottom: 120, right: 400, width: 400, height: 20 };
		[p1, p2, p3].forEach((p) => { p.getBoundingClientRect = jest.fn().mockReturnValue(rect); });
		els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0 });
		resolveBlock.mockImplementation((target) => ({
			element: target, type: 'p', depth: 0, parent: null,
			siblings: { prev: null, next: null }, rect
		}));
		return { container, p1, p2, p3 };
	}

	describe('#getSelectionLinesContaining (multi-line hover detection)', () => {
		let helperMock;
		beforeEach(() => {
			// re-import to get the live mock object
			helperMock = require('../../../../../src/helper');
			helperMock.dom.utils.addClass.mockClear();
		});

		it('applies hover to single block when range is collapsed', () => {
			const { p1 } = setupThreeBlocks();
			$.selection.getRange.mockReturnValue({ collapsed: true, startContainer: p1, endContainer: p1 });

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p1);

			// only currentBlock should be highlighted
			const hoverCalls = helperMock.dom.utils.addClass.mock.calls.filter((c) => c[1] === 'se-block-hover');
			expect(hoverCalls.length).toBe(1);
			expect(hoverCalls[0][0]).toBe(p1);
		});

		it('applies hover to single block when start/end are same line', () => {
			const { p1 } = setupThreeBlocks();
			$.selection.getRange.mockReturnValue({ collapsed: false, startContainer: p1.firstChild, endContainer: p1.firstChild });
			$.format.getLine.mockReturnValue(p1);

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p1);

			const hoverCalls = helperMock.dom.utils.addClass.mock.calls.filter((c) => c[1] === 'se-block-hover');
			expect(hoverCalls.length).toBe(1);
			expect(hoverCalls[0][0]).toBe(p1);
		});

		it('applies hover to ALL lines when multi-line selection contains current block', () => {
			const { p1, p2, p3 } = setupThreeBlocks();
			$.selection.getRange.mockReturnValue({
				collapsed: false,
				startContainer: p1.firstChild, endContainer: p3.firstChild,
				commonAncestorContainer: p1.parentNode
			});
			$.format.getLine.mockImplementation((node) => {
				if (p1.contains(node)) return p1;
				if (p2.contains(node)) return p2;
				if (p3.contains(node)) return p3;
				return null;
			});
			$.format.isLine.mockImplementation((n) => n === p1 || n === p2 || n === p3);
			helperMock.dom.query.getListChildren.mockReturnValue([p1, p2, p3]);

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p2); // hover handle over middle block

			const hoverTargets = helperMock.dom.utils.addClass.mock.calls
				.filter((c) => c[1] === 'se-block-hover')
				.map((c) => c[0]);
			expect(hoverTargets).toEqual(expect.arrayContaining([p1, p2, p3]));
			expect(hoverTargets.length).toBe(3);
		});

		it('falls back to single-block hover when current block is OUTSIDE the selection range', () => {
			const { p1, p2, p3 } = setupThreeBlocks();
			// Range covers p1..p2 only; user hovers handle over p3 (outside range)
			$.selection.getRange.mockReturnValue({
				collapsed: false,
				startContainer: p1.firstChild, endContainer: p2.firstChild,
				commonAncestorContainer: p1.parentNode
			});
			$.format.getLine.mockImplementation((node) => (p1.contains(node) ? p1 : p2.contains(node) ? p2 : p3));
			helperMock.dom.query.getListChildren.mockReturnValue([p1, p2]); // p3 not in collected lines

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p3);

			const hoverTargets = helperMock.dom.utils.addClass.mock.calls
				.filter((c) => c[1] === 'se-block-hover')
				.map((c) => c[0]);
			expect(hoverTargets).toEqual([p3]);
		});
	});

	describe('#expandRangeToFullLines (action menu open)', () => {
		let helperMock;
		beforeEach(() => {
			helperMock = require('../../../../../src/helper');
			$.plugins.testCmd = { constructor: { type: 'command', icon: 'bold', title: 'Bold' } };
		});

		it('selects entire current block when no multi-line range exists', () => {
			const { p2 } = setupThreeBlocks();
			$.selection.getRange.mockReturnValue({ collapsed: true, startContainer: p2, endContainer: p2 });

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, ['testCmd']);
			blockHandle.positionForTarget(p2);
			$.selection.setRange.mockClear();
			els.drag.click();

			expect($.selection.setRange).toHaveBeenCalledWith(p2, 0, p2, p2.childNodes.length);
		});

		it('extends first/last lines to full bounds when multi-line range contains current block', () => {
			const { p1, p2, p3 } = setupThreeBlocks();
			$.selection.getRange.mockReturnValue({
				collapsed: false,
				startContainer: p1.firstChild, endContainer: p3.firstChild,
				commonAncestorContainer: p1.parentNode
			});
			$.format.getLine.mockImplementation((node) => (p1.contains(node) ? p1 : p2.contains(node) ? p2 : p3));
			helperMock.dom.query.getListChildren.mockReturnValue([p1, p2, p3]);

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, ['testCmd']);
			blockHandle.positionForTarget(p2);
			$.selection.setRange.mockClear();
			els.drag.click();

			// First arg should be p1 with offset 0, last arg p3 with offset = childNodes.length
			expect($.selection.setRange).toHaveBeenCalledWith(p1, 0, p3, p3.childNodes.length);
		});

		it('selects only the clicked block when current block is outside an existing range', () => {
			const { p1, p2, p3 } = setupThreeBlocks();
			// Range covers p1..p2; user clicks handle on p3 (outside)
			$.selection.getRange.mockReturnValue({
				collapsed: false,
				startContainer: p1.firstChild, endContainer: p2.firstChild,
				commonAncestorContainer: p1.parentNode
			});
			$.format.getLine.mockImplementation((node) => (p1.contains(node) ? p1 : p2.contains(node) ? p2 : p3));
			helperMock.dom.query.getListChildren.mockReturnValue([p1, p2]);

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, ['testCmd']);
			blockHandle.positionForTarget(p3);
			$.selection.setRange.mockClear();
			els.drag.click();

			expect($.selection.setRange).toHaveBeenCalledWith(p3, 0, p3, p3.childNodes.length);
		});
	});

	describe('hideNow', () => {
		it('hides handle immediately and clears current block', () => {
			const { p1 } = setupThreeBlocks();

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p1);
			expect(els.handle.style.display).toBe('flex');

			blockHandle.hideNow();
			expect(els.handle.style.display).toBe('none');

			// After hideNow the handle should treat the next target as a fresh first appearance
			// (no sticky lock-in to a previous block).
			expect(() => blockHandle.hideNow()).not.toThrow();
		});
	});

	describe('plus button no-op', () => {
		it('does nothing when there is no current block', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);

			els.plus.click();
			expect($.format.addLineAfter).not.toHaveBeenCalled();
			expect($.selection.setRange).not.toHaveBeenCalled();
			expect($.history.push).not.toHaveBeenCalled();
		});
	});

	describe('RTL positioning', () => {
		it('sets style.right (not style.left) when _rtl is true', () => {
			const { p1 } = setupThreeBlocks();
			$.options.get.mockImplementation((key) => key === '_rtl' ? true : key === 'defaultLine' ? 'P' : false);
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0, right: 60 });

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p1);

			expect(els.handle.style.right).not.toBe('');
			expect(els.handle.style.left).toBe('');
		});
	});

	describe('keydown in wysiwyg clears hover lines', () => {
		it('removes se-block-hover from current block on keydown', () => {
			const helperMock = require('../../../../../src/helper');
			const { p1 } = setupThreeBlocks();

			// frameContext.get('eventWysiwyg') returns a (cached) element — capture it so
			// we can dispatch a keydown that hits the wrapper key handler.
			const eventWysiwyg = $.frameContext.get('eventWysiwyg');

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p1);
			helperMock.dom.utils.removeClass.mockClear();

			eventWysiwyg.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

			const removeCalls = helperMock.dom.utils.removeClass.mock.calls.filter((c) => c[1] === 'se-block-hover');
			expect(removeCalls.length).toBeGreaterThan(0);
		});
	});

	describe('innerWidth centering compensation', () => {
		it('shifts handle left by the extra centering padding when innerWidth is set', () => {
			const { p1 } = setupThreeBlocks();
			els.area.getBoundingClientRect = jest.fn().mockReturnValue({ top: 50, left: 0, right: 60 });

			// frameOptions.innerWidth truthy triggers `_resolveLengthPx` path
			$.frameOptions.get.mockImplementation((key) => key === 'innerWidth' ? '740px' : false);

			// Mock the computed style returned by `_w.getComputedStyle` for the wysiwyg.
			// `paddingLeft` (40) exceeds `--se-edit-inner-padding` (16) → centeringExtra = 24px.
			const helperMock = require('../../../../../src/helper');
			helperMock.env._w.getComputedStyle = jest.fn(() => ({
				marginLeft: '0px',
				paddingLeft: '40px',
				marginRight: '0px',
				paddingRight: '40px',
				fontSize: '16px',
				getPropertyValue: () => '16px',
			}));

			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.positionForTarget(p1);

			// Without innerWidth, style.left would be areaRect.left + scrollX = 0px.
			// With centeringExtra of 24px applied, it should be 24px (or greater).
			const leftPx = parseInt(els.handle.style.left, 10) || 0;
			expect(leftPx).toBeGreaterThan(0);
		});
	});

	describe('destroy cleanup', () => {
		it('drops the carrierWrapper handle and disables dragBtn', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			expect(els.drag.draggable).toBe(true);
			expect(els.handle.parentNode).toBe($.contextProvider.carrierWrapper);

			blockHandle.destroy();
			expect(els.drag.draggable).toBe(false);
			expect(els.handle.parentNode).toBe(null);

			blockHandle = null; // prevent afterEach double-destroy
		});

		it('positionForTarget is a no-op after destroy', () => {
			blockHandle = new BlockHandle($, els.area, els.handle, els.plus, els.drag, null);
			blockHandle.destroy();
			resolveBlock.mockClear();

			blockHandle.positionForTarget(document.createElement('p'));
			expect(resolveBlock).not.toHaveBeenCalled();
			blockHandle = null;
		});
	});
});
