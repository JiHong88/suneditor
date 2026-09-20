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

	for (let r = 0; r < rows.length; r++) {
		const row = rows[r];
		const top = r * ROW_H;
		Object.defineProperty(row, 'offsetHeight', { value: ROW_H, configurable: true });
		row.getBoundingClientRect = () => ({ top, bottom: top + ROW_H });

		let x = 0;
		for (const cell of row.cells) {
			const left = x;
			const width = cell.colSpan * COL_W;
			Object.defineProperty(cell, 'offsetWidth', { value: width, configurable: true });
			cell.getBoundingClientRect = () => ({ top, left, right: left + width });
			x += width;
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
		resizeService: { offResizeGuide: jest.fn() },
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
