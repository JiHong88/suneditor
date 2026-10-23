/**
 * @fileoverview Row/column move menu state — the disabled affordance and its refresh.
 * Uses the real band math and menu markup; only SelectMenu is stubbed.
 */
import TableGridService from '../../../../../../src/plugins/dropdown/table/services/table.grid';
import TableReorderService from '../../../../../../src/plugins/dropdown/table/services/table.reorder';

const captured = { column: null, row: null };

jest.mock('../../../../../../src/modules/contract', () => ({
	Controller: jest.fn().mockImplementation((host, $, form) => ({ open: jest.fn(), close: jest.fn(), isOpen: false, form })),
}));

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
		setRefer: jest.fn(),
		isOpen: false,
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
		$: { lang: {}, icons: {}, contextProvider: { carrierWrapper: document.createElement('div') } },
		historyPush: jest.fn(),
		handleService: { repinFromSelection: jest.fn(), rowStrip: { strip: 'row' }, columnStrip: { strip: 'column' } },
		styleService: { openCellProps: jest.fn() },
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
const MOVE_BACK = 2; // move-up / move-left (controller menus carry no cell-context items)
const MOVE_FWD = 3; // move-down / move-right

describe('TableGridService - handle menu host', () => {
	const { Controller } = require('../../../../../../src/modules/contract');
	/** The row/column menu hosts of the last `setup()` (created row first). */
	const hosts = () => ({ row: Controller.mock.results.at(-2).value, column: Controller.mock.results.at(-1).value });

	/** A grip band box with a fixed width. */
	const makeGrip = (width) => {
		const grip = document.createElement('div');
		Object.defineProperty(grip, 'offsetWidth', { value: width });
		return grip;
	};

	it("hosts each handle menu in a controller that is its strip's child popup (closing never deselects)", () => {
		const { main } = setup();
		const [rowCall, columnCall] = Controller.mock.calls.slice(-2);
		expect(rowCall[3].parents).toEqual([main.handleService.rowStrip]);
		expect(columnCall[3].parents).toEqual([main.handleService.columnStrip]);
		expect(rowCall[3].position).toBe('bottom');
	});

	it('opens the host on the grip, centered, before the menu', () => {
		const { grid, focus } = setup();
		focus(1, 1);
		const { row } = hosts();
		const grip = makeGrip(24);

		grid.openRowMenuForHandle(grip);

		expect(row.open).toHaveBeenCalledWith(grip, null, expect.objectContaining({ addOffset: { left: 12 } }));
		expect(grid.selectMenu_row_handle.open).toHaveBeenCalled();
		expect(row.open.mock.invocationCallOrder[0]).toBeLessThan(
			grid.selectMenu_row_handle.open.mock.invocationCallOrder[0],
		);
	});

	it('closeMenus closes the open menu and both hosts', () => {
		const { grid } = setup();
		const { row, column } = hosts();
		grid.selectMenu_column_handle.isOpen = true;

		grid.closeMenus();

		expect(grid.selectMenu_column_handle.close).toHaveBeenCalled();
		expect(row.close).toHaveBeenCalled();
		expect(column.close).toHaveBeenCalled();
	});

	it('opens cell properties on the grip the menu was opened from', () => {
		const { grid, main, focus } = setup();
		focus(1, 1);
		const grip = makeGrip(30);
		grid.openColumnMenuForHandle(grip);

		grid.selectMenu_column_handle.isOpen = true;
		grid.selectMenu_column_handle.selectMethod('cell-properties');

		expect(main.styleService.openCellProps).toHaveBeenCalledWith(grip, { selfTarget: true });
	});
});

describe('TableGridService - move menu state', () => {
	it('dismisses the handle menus and re-aims the pin when a handle-menu action runs', () => {
		const { grid, main, focus } = setup();
		focus(1, 1);

		grid.selectMenu_row_handle.isOpen = true;
		grid.selectMenu_row.selectMethod('move-up'); // shared handler

		expect(grid.selectMenu_row_handle.close).toHaveBeenCalled();
		expect(main.handleService.repinFromSelection).toHaveBeenCalled();
	});

	it('leaves the handles alone for controller-menu actions', () => {
		const { grid, main, focus } = setup();
		focus(1, 1);

		grid.selectMenu_row.selectMethod('move-up'); // no handle menu open

		expect(main.handleService.repinFromSelection).not.toHaveBeenCalled();
	});

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
