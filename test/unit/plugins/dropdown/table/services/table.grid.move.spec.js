/**
 * @fileoverview Row/column move menu state — the disabled affordance and its refresh.
 * Uses the real band math and menu markup; only SelectMenu is stubbed.
 */
import TableGridService from '../../../../../../src/plugins/dropdown/table/services/table.grid';
import TableReorderService from '../../../../../../src/plugins/dropdown/table/services/table.reorder';

const captured = { column: null, row: null };

jest.mock('../../../../../../src/modules/ui', () => ({
	SelectMenu: jest.fn().mockImplementation(() => ({
		on(_ref, selectMethod) {
			this.selectMethod = selectMethod;
		},
		create(items, menus) {
			this.items = items;
			// mirror SelectMenu: each supplied node becomes an `li.se-select-item`
			this.menus = Array.from(menus).map((node) => {
				const li = globalThis.document.createElement('li');
				li.className = 'se-select-item';
				li.appendChild(node);
				return li;
			});
		},
		open: jest.fn(),
		close: jest.fn(),
	})),
}));

function buildTable(rowCount, colCount) {
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');
	for (let r = 0; r < rowCount; r++) {
		const tr = document.createElement('tr');
		for (let c = 0; c < colCount; c++) {
			const td = document.createElement('td');
			td.textContent = `r${r}c${c}`;
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	document.body.appendChild(table);
	return table;
}

function setup(rowCount = 3, colCount = 3) {
	const table = buildTable(rowCount, colCount);
	const main = {
		_element: table,
		state: { tdElement: null },
		$: { lang: {}, icons: {} },
		historyPush: jest.fn(),
	};
	main.reorderService = new TableReorderService(main);

	const grid = new TableGridService(main, {
		columnButton: document.createElement('button'),
		rowButton: document.createElement('button'),
		openCellMenuFunc: jest.fn(),
		closeCellMenuFunc: jest.fn(),
	});

	captured.column = grid.selectMenu_column;
	captured.row = grid.selectMenu_row;

	/** Point the service at the cell at (r, c). */
	const focus = (r, c) => (main.state.tdElement = table.rows[r].cells[c]);

	return { table, main, grid, focus };
}

const disabled = (menu, i) => menu.menus[i].classList.contains('se-select-disabled');
const MOVE_BACK = 2; // move-up / move-left
const MOVE_FWD = 3; // move-down / move-right

describe('TableGridService - move menu state', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		jest.clearAllMocks();
	});

	it('disables the direction that has nothing to move over', () => {
		const { grid, focus } = setup();

		focus(0, 0); // top row
		grid.openRowMenu();
		expect(disabled(captured.row, MOVE_BACK)).toBe(true);
		expect(disabled(captured.row, MOVE_FWD)).toBe(false);

		focus(2, 0); // bottom row
		grid.openRowMenu();
		expect(disabled(captured.row, MOVE_BACK)).toBe(false);
		expect(disabled(captured.row, MOVE_FWD)).toBe(true);

		focus(1, 0); // middle row
		grid.openRowMenu();
		expect(disabled(captured.row, MOVE_BACK)).toBe(false);
		expect(disabled(captured.row, MOVE_FWD)).toBe(false);
	});

	it('refreshes after a move — the menu stays open, so a stale state would mislead the next click', () => {
		const { grid, focus, table } = setup();

		focus(1, 0);
		grid.openRowMenu();
		expect(disabled(captured.row, MOVE_FWD)).toBe(false);

		// step the row down to the last position, without reopening the menu
		captured.row.selectMethod('move-down');

		expect(table.rows[2].cells[0].textContent).toBe('r1c0');
		// now at the bottom: forwards must have become disabled and backwards enabled
		expect(disabled(captured.row, MOVE_FWD)).toBe(true);
		expect(disabled(captured.row, MOVE_BACK)).toBe(false);
	});

	it('never hides a row, so the item positions stay put across clicks', () => {
		const { grid, focus } = setup();
		const displays = () => captured.row.menus.map((li) => li.style.display);

		focus(0, 0);
		grid.openRowMenu();
		const before = displays();
		captured.row.selectMethod('move-down');

		expect(displays()).toEqual(before);
		expect(displays()[MOVE_BACK]).not.toBe('none');
		expect(displays()[MOVE_FWD]).not.toBe('none');
	});

	it('applies the same rule to columns', () => {
		const { grid, focus } = setup();

		focus(0, 0);
		grid.openColumnMenu();
		expect(disabled(captured.column, MOVE_BACK)).toBe(true);
		expect(disabled(captured.column, MOVE_FWD)).toBe(false);

		captured.column.selectMethod('move-right');
		expect(disabled(captured.column, MOVE_BACK)).toBe(false);
	});
});
