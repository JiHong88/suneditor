/**
 * @fileoverview Cut lines / bands — the merge-aware unit a row/column reorder moves.
 */
import { GetCutLines, GetBand, InvalidateTableCache } from '../../../../../../src/plugins/dropdown/table/shared/table.utils.js';

/** Build a table from a compact spec: each row is a list of `[colSpan, rowSpan]` or `1`. */
function makeTable(rows) {
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');
	for (const cells of rows) {
		const tr = document.createElement('tr');
		for (const c of cells) {
			const td = document.createElement('td');
			const [cs, rs] = Array.isArray(c) ? c : [1, 1];
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

describe('table.utils - GetCutLines / GetBand', () => {
	describe('plain grid (no merges)', () => {
		const t = makeTable([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);

		it('every row boundary is cuttable', () => {
			expect(GetCutLines(t, true)).toEqual([0, 1, 2, 3]);
		});

		it('every column boundary is cuttable', () => {
			expect(GetCutLines(t, false)).toEqual([0, 1, 2, 3]);
		});

		it('each band is a single row', () => {
			expect(GetBand(t, 0, true)).toEqual({ start: 0, end: 0 });
			expect(GetBand(t, 2, true)).toEqual({ start: 2, end: 2 });
		});
	});

	describe('rowspan region', () => {
		// row0: [A(rs=3)][B][C]   row1: [B][C]   row2: [B][C]
		const t = makeTable([[[1, 3], 1, 1], [1, 1], [1, 1]]);

		it('boundaries inside the merged rows are not cuttable', () => {
			expect(GetCutLines(t, true)).toEqual([0, 3]);
		});

		it('every row of the merge reports the same band', () => {
			expect(GetBand(t, 0, true)).toEqual({ start: 0, end: 2 });
			expect(GetBand(t, 1, true)).toEqual({ start: 0, end: 2 });
			expect(GetBand(t, 2, true)).toEqual({ start: 0, end: 2 });
		});

		it('columns stay independent of a rowspan', () => {
			expect(GetCutLines(t, false)).toEqual([0, 1, 2, 3]);
		});
	});

	describe('colspan region', () => {
		// row0: [A(cs=2)][B]   row1: [1][2][3]
		const t = makeTable([[[2, 1], 1], [1, 1, 1]]);

		it('the boundary inside the colspan is not cuttable', () => {
			expect(GetCutLines(t, false)).toEqual([0, 2, 3]);
		});

		it('both covered columns report the merged band', () => {
			expect(GetBand(t, 0, false)).toEqual({ start: 0, end: 1 });
			expect(GetBand(t, 1, false)).toEqual({ start: 0, end: 1 });
			expect(GetBand(t, 2, false)).toEqual({ start: 2, end: 2 });
		});
	});

	describe('merge in the middle', () => {
		// rows 1-2 merged in the first column
		const t = makeTable([[1, 1], [[1, 2], 1], [1], [1, 1]]);

		it('splits the table into three bands', () => {
			expect(GetCutLines(t, true)).toEqual([0, 1, 3, 4]);
			expect(GetBand(t, 0, true)).toEqual({ start: 0, end: 0 });
			expect(GetBand(t, 1, true)).toEqual({ start: 1, end: 2 });
			expect(GetBand(t, 2, true)).toEqual({ start: 1, end: 2 });
			expect(GetBand(t, 3, true)).toEqual({ start: 3, end: 3 });
		});
	});

	describe('edge cases', () => {
		it('a null table yields no cut lines', () => {
			expect(GetCutLines(null, true)).toEqual([]);
		});

		it('a single-row table is one band with both outer boundaries', () => {
			const t = makeTable([[1, 1]]);
			expect(GetCutLines(t, true)).toEqual([0, 1]);
			expect(GetBand(t, 0, true)).toEqual({ start: 0, end: 0 });
		});

		it('a fully merged table cannot be cut anywhere inside', () => {
			// one cell covering the whole 2x2 grid
			const t = makeTable([[[2, 2]], []]);
			expect(GetCutLines(t, true)).toEqual([0, 2]);
			expect(GetCutLines(t, false)).toEqual([0, 2]);
			expect(GetBand(t, 1, true)).toEqual({ start: 0, end: 1 });
		});
	});
});
