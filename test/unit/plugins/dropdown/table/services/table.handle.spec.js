/**
 * @fileoverview Row/column move handles — hover visibility, band sizing, drag & drop routing.
 */
import TableHandleService from '../../../../../../src/plugins/dropdown/table/services/table.handle.js';
import TableReorderService from '../../../../../../src/plugins/dropdown/table/services/table.reorder.js';
import { InvalidateTableCache } from '../../../../../../src/plugins/dropdown/table/shared/table.utils.js';

const ROW_H = 20;
const COL_W = 30;

/** Cell spec: 'name' | ['name', colSpan, rowSpan] */
function makeTable(rows) {
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');
	for (const cells of rows) {
		const tr = document.createElement('tr');
		for (const c of cells) {
			const [name, cs = 1, rs = 1] = Array.isArray(c) ? c : [c];
			const td = document.createElement('td');
			td.textContent = name;
			if (cs > 1) td.colSpan = cs;
			if (rs > 1) td.rowSpan = rs;
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	InvalidateTableCache(table);
	return table;
}

/** jsdom has no layout — stamp client rects/offsets from the logical grid. */
function stampLayout(table) {
	const rows = table.rows;
	Object.defineProperty(table, 'offsetWidth', { value: rows[0].cells.length * COL_W, configurable: true });
	Object.defineProperty(table, 'offsetHeight', { value: rows.length * ROW_H, configurable: true });
	table.getBoundingClientRect = () => ({
		top: 0,
		left: 0,
		right: rows[0].cells.length * COL_W,
		bottom: rows.length * ROW_H,
	});

	// rects are computed from the CURRENT DOM position, so they stay correct after a move
	for (let r = 0; r < rows.length; r++) {
		const row = rows[r];
		Object.defineProperty(row, 'offsetHeight', { value: ROW_H, configurable: true });
		row.getBoundingClientRect = () => ({ top: row.rowIndex * ROW_H, bottom: (row.rowIndex + 1) * ROW_H });

		for (const cell of row.cells) {
			const width = cell.colSpan * COL_W;
			Object.defineProperty(cell, 'offsetWidth', { value: width, configurable: true });
			cell.getBoundingClientRect = () => {
				const parent = cell.parentElement;
				let left = 0;
				for (const sibling of parent.cells) {
					if (sibling === cell) break;
					left += sibling.colSpan * COL_W;
				}
				const top = parent.rowIndex * ROW_H;
				return { top, left, right: left + width };
			};
		}
	}
}

const grid = (table) => Array.from(table.rows).map((r) => Array.from(r.cells).map((c) => c.textContent));

function makeHarness(table, { selected = true, rtl = false, iframe = null } = {}) {
	const wrapper = document.createElement('div');
	const figure = document.createElement('figure');
	if (selected) figure.className = 'se-component-selected';
	figure.appendChild(table);
	wrapper.appendChild(figure);
	document.body.appendChild(wrapper);

	// iframe mode: the wysiwyg frame is an <iframe> whose inner coords are shifted by its rect
	let frameEl = wrapper;
	if (iframe) {
		frameEl = document.createElement('iframe');
		frameEl.getBoundingClientRect = () => ({ left: iframe.left, top: iframe.top });
	}

	const globalListeners = [];
	const $ = {
		lang: { moveRow: 'Move row', moveColumn: 'Move column' },
		contextProvider: { applyToRoots: (fn) => fn({ get: () => wrapper }) },
		frameContext: { get: (key) => (key === 'wysiwygFrame' ? frameEl : wrapper) },
		eventManager: {
			addEvent: (el, type, fn, opts) => el.addEventListener(type, fn, opts),
			addGlobalEvent: (type, fn) => {
				document.addEventListener(type, fn);
				globalListeners.push(type);
				return { type, fn };
			},
			removeGlobalEvent: (ev) => {
				document.removeEventListener(ev.type, ev.fn);
				return null;
			},
		},
		offset: {
			getLocal: (el) => {
				const rect = el.getBoundingClientRect();
				return { top: rect.top, left: rect.left };
			},
		},
		ui: { enableBackWrapper: jest.fn(), disableBackWrapper: jest.fn() },
		options: { get: (key) => (key === '_rtl' ? rtl : false) },
	};

	const main = {
		$,
		historyPush: jest.fn(),
		_editorEnable: jest.fn(),
		setState: jest.fn(),
		controller_table: { isOpen: false },
		controller_cell: { isOpen: false },
		resizeService: { offResizeGuide: jest.fn() },
		selectionService: {
			selectCells: jest.fn((cells) => ({ fixedCell: cells[0], selectedCell: cells[cells.length - 1] })),
			deleteStyleSelectedCells: jest.fn(),
		},
	};
	main.reorderService = new TableReorderService(main);

	const svc = new TableHandleService(main);
	const rowHandle = wrapper.querySelector('.se-table-move-handle-row');
	const columnHandle = wrapper.querySelector('.se-table-move-handle-column');
	return { svc, main, wrapper, figure, rowHandle, columnHandle };
}

const mouse = (type, opts) => new MouseEvent(type, { bubbles: true, ...opts });

afterEach(() => {
	document.body.innerHTML = '';
});

describe('TableHandleService', () => {
	describe('refresh', () => {
		it('hides while a controller is open (full selection mode)', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			expect(rowHandle.style.display).toBe('block');

			main.controller_cell.isOpen = true;
			svc.refresh(table.rows[0].cells[0]);
			expect(rowHandle.style.display).toBe('none');
		});

		it('stays hidden while the table is not (hover-)selected', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, rowHandle, columnHandle } = makeHarness(table, { selected: false });

			svc.refresh(table.rows[0].cells[0]);

			expect(rowHandle.style.display).not.toBe('block');
			expect(columnHandle.style.display).not.toBe('block');
		});

		it('spans the full visible edge, with the grip over the hovered row/column', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, rowHandle, columnHandle } = makeHarness(table);

			svc.refresh(table.rows[1].cells[1]);

			// row strip covers the whole left edge; the grip marks row 1
			expect(rowHandle.style.display).toBe('block');
			expect(rowHandle.style.top).toBe('0px');
			expect(rowHandle.style.height).toBe(`${ROW_H * 3}px`);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H}px`);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-size')).toBe(`${ROW_H}px`);

			// column strip covers the whole top edge plus the corner; the grip marks column 1
			expect(columnHandle.style.display).toBe('block');
			expect(columnHandle.style.left).toBe('-24px');
			expect(columnHandle.style.width).toBe(`${COL_W * 2 + 24}px`);
			expect(columnHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${COL_W + 24}px`);
			expect(columnHandle.style.getPropertyValue('--se-table-grip-size')).toBe(`${COL_W}px`);
		});

		it('widens the grip to the whole merged band', () => {
			// b1 spans rows 1-2 — the row band of row 1 is {1,2}
			const table = makeTable([['a1', 'a2'], [['b1', 1, 2], 'b2'], ['c2']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[1].cells[0]);

			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H}px`);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-size')).toBe(`${ROW_H * 2}px`);
		});

		it('slides the grip to the band under the pointer as it moves along the strip', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe('0px');

			// pointer over row 2's stretch of the strip (y 40-60)
			rowHandle.dispatchEvent(mouse('mousemove', { clientX: -5, clientY: 45 }));
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H * 2}px`);

			// grabbing there drags row 2 — drop it at the very top
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: -5, clientY: 45 }));
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 2 }));
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['c1', 'c2'], ['a1', 'a2'], ['b1', 'b2']]);
		});

		it('ignores non-cell targets without hiding the current handles', () => {
			const table = makeTable([['a1'], ['b1']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			svc.refresh(null);

			expect(rowHandle.style.display).toBe('block');
		});

		it('maps outer client coords to frame coords in iframe mode', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table, { iframe: { left: 100, top: 50 } });

			svc.refresh(table.rows[0].cells[0]);

			// outer y = inner 45 (row 2) + iframe top 50
			rowHandle.dispatchEvent(mouse('mousemove', { clientX: 95, clientY: 95 }));
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H * 2}px`);

			// drag row 2 to the top with outer coords
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 95, clientY: 95 }));
			document.dispatchEvent(mouse('mousemove', { clientX: 100, clientY: 52 }));
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['c1', 'c2'], ['a1', 'a2'], ['b1', 'b2']]);
		});

		it('puts the strips on the right-side gutter in RTL', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, rowHandle, columnHandle } = makeHarness(table, { rtl: true });

			svc.refresh(table.rows[0].cells[0]);

			// row strip on the RIGHT edge of the table (width 60)
			expect(rowHandle.style.display).toBe('block');
			expect(rowHandle.style.left).toBe(`${COL_W * 2}px`);

			// column strip extends over the right corner instead of the left one
			expect(columnHandle.style.left).toBe('0px');
			expect(columnHandle.style.width).toBe(`${COL_W * 2 + 24}px`);
		});

		it('clamps the row handle to the visible figure edge when the table is scrolled out', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			// figure scrolled 50px right: the table's left edge sits off-screen
			table.getBoundingClientRect = () => ({ top: 0, left: -50 });
			const { svc, figure, rowHandle } = makeHarness(table);
			figure.getBoundingClientRect = () => ({ top: 0, left: 0 });
			Object.defineProperty(figure, 'clientWidth', { value: 40, configurable: true });

			svc.refresh(table.rows[0].cells[0]);

			// hugs the figure's visible left edge (0), not the table's real edge (-50)
			expect(rowHandle.style.left).toBe('-24px');
		});

		it('repositions the visible handles after the figure scrolls', async () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, figure, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[1].cells[0]);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H}px`);

			// the figure scrolls up by 5px — every row rect shifts
			table.rows[1].getBoundingClientRect = () => ({ top: ROW_H - 5, bottom: ROW_H * 2 - 5 });
			figure.dispatchEvent(new Event('scroll'));
			await new Promise((resolve) => requestAnimationFrame(resolve));

			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H - 5}px`);
		});
	});

	describe('grace hide on reset', () => {
		const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

		it('keeps the handles through a reset until the grace window passes', async () => {
			const table = makeTable([['a1'], ['b1']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			svc.init(); // e.g. core hover-deselect from a 1px overshoot onto the line above

			expect(rowHandle.style.display).toBe('block');
			await wait(320);
			expect(rowHandle.style.display).toBe('none');
		});

		it('cancels the pending hide when the pointer comes back onto a strip', async () => {
			const table = makeTable([['a1'], ['b1']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			svc.init();
			rowHandle.dispatchEvent(mouse('mousemove', { clientX: -5, clientY: 5 }));

			await wait(320);
			expect(rowHandle.style.display).toBe('block');
		});
	});

	describe('pinned handles survive pointer-driven hides', () => {
		const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

		function pin(svc, table, rowHandle) {
			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));
			document.dispatchEvent(mouse('mouseup'));
			expect(rowHandle.classList.contains('active')).toBe(true);
		}

		it('ignores hideOnLeave and hideOutside while pinned', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);
			pin(svc, table, rowHandle);

			svc.hideOnLeave({ relatedTarget: document.body, clientX: 500, clientY: 500 });
			svc.hideOutside(document.body, { clientX: 500, clientY: 500 });

			expect(rowHandle.style.display).toBe('block');
			expect(rowHandle.classList.contains('active')).toBe(true);
		});

		it('ignores the grace hide from a reset while pinned', async () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);
			pin(svc, table, rowHandle);

			svc.init(); // core hover-deselect reset
			await wait(320);

			expect(rowHandle.style.display).toBe('block');
			expect(rowHandle.classList.contains('active')).toBe(true);
		});

		it('re-applies the pinned band selection after a reset wiped it', async () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);
			pin(svc, table, rowHandle);
			main.selectionService.selectCells.mockClear();

			svc.init(); // core deselect strips the selection classes in its own timeout
			await wait(10);

			const selected = main.selectionService.selectCells.mock.calls.at(-1)[0].map((c) => c.textContent);
			expect(selected).toEqual(['a1', 'a2']);
			expect(main.setState).toHaveBeenCalledWith('selectedCells', expect.any(Array));
		});

		it('releases the pin on Escape, like the other controllers', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, main, rowHandle, columnHandle } = makeHarness(table);
			pin(svc, table, rowHandle);
			expect(columnHandle.style.display).toBe('none');

			document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

			expect(rowHandle.classList.contains('active')).toBe(false);
			expect(main.selectionService.deleteStyleSelectedCells).toHaveBeenCalled();
			expect(main.setState).toHaveBeenCalledWith('selectedCells', null);
			expect(columnHandle.style.display).toBe('block'); // hover mode restored

			// listener is gone — a second Escape is a no-op
			main.selectionService.deleteStyleSelectedCells.mockClear();
			document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
			expect(main.selectionService.deleteStyleSelectedCells).not.toHaveBeenCalled();
		});

		it('clears the pinned band selection when an explicit hide() unpins (cell/outside click)', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);
			pin(svc, table, rowHandle);
			main.setState.mockClear();

			svc.hide(); // what a wysiwyg mousedown does

			expect(rowHandle.classList.contains('active')).toBe(false);
			expect(main.selectionService.deleteStyleSelectedCells).toHaveBeenCalled();
			expect(main.setState).toHaveBeenCalledWith('selectedCells', null);
			expect(main.setState).toHaveBeenCalledWith('fixedCell', null);
		});

		it('does not touch the selection when hide() runs unpinned', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, main } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]); // shown, not pinned
			svc.hide();

			expect(main.selectionService.deleteStyleSelectedCells).not.toHaveBeenCalled();
		});

		it('still hides on an explicit hide() and once the table is gone', async () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, rowHandle, figure } = makeHarness(table);
			pin(svc, table, rowHandle);

			figure.remove(); // table deleted — the pin no longer holds
			svc.init();
			await wait(320);
			expect(rowHandle.style.display).toBe('none');
			expect(rowHandle.classList.contains('active')).toBe(false);
		});
	});

	describe('hideOnLeave', () => {
		it('survives the pointer being captured by other floating UI over the strips', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);
			svc.refresh(table.rows[0].cells[0]);

			// a line-breaker-style element (not a handle) caught the mouseleave on the top strip
			const breaker = document.createElement('div');
			svc.hideOnLeave({ relatedTarget: breaker, clientX: 10, clientY: -10 });
			expect(rowHandle.style.display).toBe('block');

			// straddling the table edge (bottom half of the breaker is inside the table)
			svc.hideOnLeave({ relatedTarget: breaker, clientX: 10, clientY: 5 });
			expect(rowHandle.style.display).toBe('block');

			// genuinely leaving — far from the table and its strips
			svc.hideOnLeave({ relatedTarget: breaker, clientX: 300, clientY: 300 });
			expect(rowHandle.style.display).toBe('none');
		});
	});

	describe('hideOutside', () => {
		it('keeps the handles while the pointer is still inside the same figure', () => {
			const table = makeTable([['a1'], ['b1']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			svc.hideOutside(table); // hovering the table border, not a cell

			expect(rowHandle.style.display).toBe('block');
		});

		it('hides the handles once the pointer leaves the figure', () => {
			const table = makeTable([['a1'], ['b1']]);
			stampLayout(table);
			const { svc, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			svc.hideOutside(document.body);

			expect(rowHandle.style.display).toBe('none');
		});
	});

	describe('drag & drop', () => {
		it('drops the row band past the band under the pointer', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));
			// pointer near the boundary after row 2 (y = 60)
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 55 }));
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['b1', 'b2'], ['c1', 'c2'], ['a1', 'a2']]);
			expect(main.historyPush).toHaveBeenCalledTimes(1);
			expect(main.$.ui.disableBackWrapper).toHaveBeenCalled();
			expect(svc.isMoving()).toBe(false);
		});

		it('drops the column band past the band under the pointer', () => {
			const table = makeTable([['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']]);
			stampLayout(table);
			const { svc, main, wrapper, columnHandle } = makeHarness(table);
			const target = wrapper.querySelector('.se-table-move-band-target');

			svc.refresh(table.rows[0].cells[2]);
			columnHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 75, clientY: 0 }));
			// pointer over column 0 — that single band highlights, whole
			document.dispatchEvent(mouse('mousemove', { clientX: 4, clientY: 0 }));
			expect(target.style.display).toBe('block');
			expect(target.style.left).toBe('0px');
			expect(target.style.width).toBe(`${COL_W}px`);
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['a3', 'a1', 'a2'], ['b3', 'b1', 'b2']]);
			expect(main.historyPush).toHaveBeenCalledTimes(1);
		});

		it('has no drop target while the pointer stays inside the grabbed band', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, main, wrapper, rowHandle } = makeHarness(table);
			const source = wrapper.querySelector('.se-table-move-band-source');
			const target = wrapper.querySelector('.se-table-move-band-target');

			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));

			// grabbed, not yet dragged out of the band — source shown, no target yet
			expect(source.style.display).toBe('block');
			expect(target.style.display).not.toBe('block');

			// still inside the band (rows 0: y 0-20)
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 18 }));
			expect(target.style.display).not.toBe('block');

			document.dispatchEvent(mouse('mouseup'));
			expect(grid(table)).toEqual([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			expect(main.historyPush).not.toHaveBeenCalled();
			expect(source.style.display).toBe('none');
		});

		it('shows the displaced-band overlay once the pointer crosses the band edge', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, wrapper, rowHandle } = makeHarness(table);
			const target = wrapper.querySelector('.se-table-move-band-target');

			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));
			// crossed below the band (band [0,20]) onto row 1
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 30 }));

			// exactly row 1's band highlights — not a growing range
			expect(target.style.display).toBe('block');
			expect(target.style.top).toBe(`${ROW_H}px`);
			expect(target.style.height).toBe(`${ROW_H}px`);

			// moving on to row 2: the highlight moves with the pointer, row 1 reverts
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 50 }));
			expect(target.style.top).toBe(`${ROW_H * 2}px`);
			expect(target.style.height).toBe(`${ROW_H}px`);

			// back onto row 1 before dropping
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 30 }));
			expect(target.style.top).toBe(`${ROW_H}px`);
			expect(target.style.height).toBe(`${ROW_H}px`);

			document.dispatchEvent(mouse('mouseup'));
			expect(grid(table)).toEqual([['b1', 'b2'], ['a1', 'a2'], ['c1', 'c2']]);
		});

		it('selects the pressed band on a plain handle click (no drag)', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, main, rowHandle, columnHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			// press on row 1's stretch of the strip and release without moving
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 25 }));
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			expect(main.historyPush).not.toHaveBeenCalled();
			const selected = main.selectionService.selectCells.mock.calls[0][0].map((c) => c.textContent);
			expect(selected).toEqual(['b1', 'b2']);
			expect(main.setState).toHaveBeenCalledWith('selectedCells', expect.any(Array));

			// the strips stay visible and the pressed handle turns active (pinned)
			expect(rowHandle.style.display).toBe('block');
			expect(rowHandle.classList.contains('active')).toBe(true);

			// pinned: the grip ignores pointer travel along the strip and cell hovers
			rowHandle.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 45 }));
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H}px`);
			svc.refresh(table.rows[2].cells[0]);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H}px`);
			expect(rowHandle.classList.contains('active')).toBe(true);

			// ...and the sibling column strip is hidden while the row is pinned
			expect(columnHandle.style.display).toBe('none');
			svc.refresh(table.rows[2].cells[1]); // hovering another column
			expect(columnHandle.style.display).toBe('none');

			// clicking the pinned band again releases it, clears the selection, restores the sibling
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 25 }));
			document.dispatchEvent(mouse('mouseup'));
			expect(rowHandle.classList.contains('active')).toBe(false);
			expect(main.selectionService.deleteStyleSelectedCells).toHaveBeenCalled();
			expect(main.setState).toHaveBeenCalledWith('selectedCells', null);
			expect(columnHandle.style.display).toBe('block');
		});

		it('selects the moved band at its new position after the drop', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));
			document.dispatchEvent(mouse('mousemove', { clientX: 0, clientY: 55 }));
			document.dispatchEvent(mouse('mouseup'));

			// row a moved to the bottom — its cells at the NEW position get selected
			expect(grid(table)).toEqual([['b1', 'b2'], ['c1', 'c2'], ['a1', 'a2']]);
			const selected = main.selectionService.selectCells.mock.calls.at(-1)[0].map((c) => c.textContent);
			expect(selected).toEqual(['a1', 'a2']);
			expect(main.setState).toHaveBeenCalledWith('selectedCells', expect.any(Array));

			// strips stay up, active on the pressed handle, grip follows the moved band
			expect(rowHandle.style.display).toBe('block');
			expect(rowHandle.classList.contains('active')).toBe(true);
			expect(rowHandle.style.getPropertyValue('--se-table-grip-start')).toBe(`${ROW_H * 2}px`);
		});

		it('selects the moved column band after the drop', () => {
			const table = makeTable([['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']]);
			stampLayout(table);
			const { svc, main, columnHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[2]);
			columnHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 75, clientY: 0 }));
			document.dispatchEvent(mouse('mousemove', { clientX: 4, clientY: 0 }));
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['a3', 'a1', 'a2'], ['b3', 'b1', 'b2']]);
			const selected = main.selectionService.selectCells.mock.calls.at(-1)[0].map((c) => c.textContent);
			expect(selected).toEqual(['a3', 'b3']);
		});

		it('cancels on Escape without touching the table or history', () => {
			const table = makeTable([['a1'], ['b1']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));
			document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
			document.dispatchEvent(mouse('mouseup'));

			expect(grid(table)).toEqual([['a1'], ['b1']]);
			expect(main.historyPush).not.toHaveBeenCalled();
			expect(svc.isMoving()).toBe(false);
		});

		it('does not start a drag when there is nowhere to drop', () => {
			const table = makeTable([['a1', 'a2']]);
			stampLayout(table);
			const { svc, main, rowHandle } = makeHarness(table);

			svc.refresh(table.rows[0].cells[0]);
			rowHandle.dispatchEvent(mouse('mousedown', { button: 0, clientX: 0, clientY: 5 }));

			expect(svc.isMoving()).toBe(false);
			expect(main._editorEnable).not.toHaveBeenCalled();
		});
	});
});
