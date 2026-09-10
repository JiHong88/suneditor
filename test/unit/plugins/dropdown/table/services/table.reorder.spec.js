/**
 * @fileoverview Row/column reorder — band moves, merge safety, cache/history discipline.
 */
import TableReorderService from '../../../../../../src/plugins/dropdown/table/services/table.reorder.js';
import { InvalidateTableCache, GetLogicalCellIndex } from '../../../../../../src/plugins/dropdown/table/shared/table.utils.js';

/** Cell spec: 'name' | ['name', colSpan, rowSpan] */
function makeTable(rows, { colgroup = false } = {}) {
	const table = document.createElement('table');
	if (colgroup) {
		const cg = document.createElement('colgroup');
		const width = rows[0].reduce((n, c) => n + (Array.isArray(c) ? c[1] || 1 : 1), 0);
		for (let i = 0; i < width; i++) {
			const col = document.createElement('col');
			col.style.width = `${i}%`;
			cg.appendChild(col);
		}
		table.appendChild(cg);
	}
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

const grid = (table) =>
	Array.from(table.rows).map((r) => Array.from(r.cells).map((c) => c.textContent));

function makeService() {
	const historyPush = jest.fn();
	const svc = new TableReorderService({ historyPush, $: {} });
	return { svc, historyPush };
}

describe('TableReorderService', () => {
	describe('rows — plain grid', () => {
		let table, svc, historyPush;
		beforeEach(() => {
			table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			({ svc, historyPush } = makeService());
		});

		it('moves a row down', () => {
			// move row 0 to the boundary after row 1
			expect(svc.move(table, { start: 0, end: 0 }, 2, true)).toBe(true);
			expect(grid(table)).toEqual([['b1', 'b2'], ['a1', 'a2'], ['c1', 'c2']]);
		});

		it('moves a row up', () => {
			expect(svc.move(table, { start: 2, end: 2 }, 0, true)).toBe(true);
			expect(grid(table)).toEqual([['c1', 'c2'], ['a1', 'a2'], ['b1', 'b2']]);
		});

		it('pushes exactly one history entry per move', () => {
			svc.move(table, { start: 0, end: 0 }, 2, true);
			expect(historyPush).toHaveBeenCalledTimes(1);
		});

		it('refuses a no-op drop and leaves history untouched', () => {
			// boundary 0 is where the band already starts, 1 is right after it
			expect(svc.move(table, { start: 0, end: 0 }, 0, true)).toBe(false);
			expect(svc.move(table, { start: 0, end: 0 }, 1, true)).toBe(false);
			expect(historyPush).not.toHaveBeenCalled();
			expect(grid(table)).toEqual([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
		});
	});

	describe('rows — merged region moves as one block', () => {
		let table, svc;
		beforeEach(() => {
			// rows 1-2 tied together by a rowSpan in the first column
			table = makeTable([['a1', 'a2'], [['b1', 1, 2], 'b2'], ['c2'], ['d1', 'd2']]);
			({ svc } = makeService());
		});

		it('carries both rows of the merge and keeps the rowSpan intact', () => {
			expect(svc.move(table, { start: 1, end: 2 }, 0, true)).toBe(true);
			expect(grid(table)).toEqual([['b1', 'b2'], ['c2'], ['a1', 'a2'], ['d1', 'd2']]);
			expect(table.rows[0].cells[0].rowSpan).toBe(2);
		});

		it('rejects a drop that would tear the merge apart', () => {
			// boundary 2 sits between the two merged rows
			expect(svc.move(table, { start: 0, end: 0 }, 2, true)).toBe(false);
			expect(grid(table)).toEqual([['a1', 'a2'], ['b1', 'b2'], ['c2'], ['d1', 'd2']]);
		});

		it('reports the merged band for every row it covers', () => {
			expect(svc.getBand(table, 1, true)).toEqual({ start: 1, end: 2 });
			expect(svc.getBand(table, 2, true)).toEqual({ start: 1, end: 2 });
		});

		it('offers only boundaries outside the dragged band', () => {
			expect(svc.getDropTargets(table, { start: 1, end: 2 }, true)).toEqual([0, 4]);
		});
	});

	describe('columns', () => {
		it('moves a column across every row', () => {
			const table = makeTable([['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']]);
			const { svc } = makeService();

			expect(svc.move(table, { start: 0, end: 0 }, 3, false)).toBe(true);
			expect(grid(table)).toEqual([['a2', 'a3', 'a1'], ['b2', 'b3', 'b1']]);
		});

		it('carries the matching <col> so widths follow the column', () => {
			const table = makeTable([['a1', 'a2', 'a3'], ['b1', 'b2', 'b3']], { colgroup: true });
			const { svc } = makeService();
			const widths = () => Array.from(table.querySelectorAll('col')).map((c) => c.style.width);
			expect(widths()).toEqual(['0%', '1%', '2%']);

			svc.move(table, { start: 0, end: 0 }, 3, false);
			expect(widths()).toEqual(['1%', '2%', '0%']);
		});

		it('moves a colSpan block whole and keeps the span', () => {
			// row0: [A spans cols 0-1][B]   row1: [c1][c2][c3]
			const table = makeTable([[['A', 2], 'B'], ['c1', 'c2', 'c3']]);
			const { svc } = makeService();

			expect(svc.move(table, { start: 0, end: 1 }, 3, false)).toBe(true);
			expect(grid(table)).toEqual([['B', 'A'], ['c3', 'c1', 'c2']]);
			expect(table.rows[0].cells[1].colSpan).toBe(2);
		});

		it('skips rows that have no cell in the band (covered by a rowSpan)', () => {
			// 'b1' spans rows 0-1, so row 1 has no cell in logical column 0
			const table = makeTable([[['b1', 1, 2], 'a2', 'a3'], ['c2', 'c3']]);
			const { svc } = makeService();

			expect(svc.move(table, { start: 0, end: 0 }, 3, false)).toBe(true);
			expect(grid(table)).toEqual([['a2', 'a3', 'b1'], ['c2', 'c3']]);
			expect(table.rows[0].cells[2].rowSpan).toBe(2);
		});
	});

	describe('cache discipline', () => {
		it('a move invalidates the logical-index cache', () => {
			const table = makeTable([['a1', 'a2'], ['b1', 'b2'], ['c1', 'c2']]);
			const { svc } = makeService();

			// prime the cache, then move the row that occupies index 0
			expect(GetLogicalCellIndex(table, 0, 0)).toBe(0);
			svc.move(table, { start: 2, end: 2 }, 0, true);

			// stale cache would still describe the old row order; the grid must agree with the DOM
			expect(grid(table)[0]).toEqual(['c1', 'c2']);
			expect(GetLogicalCellIndex(table, 0, 1)).toBe(1);
		});
	});
});
