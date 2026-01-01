import TableStyleService from '../../../../../../src/plugins/dropdown/table/services/table.style';

jest.mock('../../../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn(() => ({ style: {}, appendChild: jest.fn(), innerHTML: '' })),
			changeElement: jest.fn(),
			changeTxt: jest.fn(),
			removeClass: jest.fn(),
			addClass: jest.fn(),
			toggleClass: jest.fn(),
			removeItem: jest.fn(),
			setStyle: jest.fn((el, property, value) => {
				const elements = Array.isArray(el) ? el : [el];
				elements.forEach((e) => {
					if (e && e.style) {
						e.style[property] = value;
					}
				});
			}),
			getStyle: jest.fn((el, property) => {
				const { env } = require('../../../../../../src/helper');
				const style = env._w.getComputedStyle(el);
				return style ? style[property] : '';
			}),
			hasClass: jest.fn((el, cls) => el.classList?.contains(cls) || false),
		},
		check: {
			isTable: jest.fn(),
		},
	},
	numbers: {
		is: jest.fn((val) => !isNaN(parseFloat(val)) && isFinite(val)),
		get: jest.fn((val) => parseFloat(val) || 0),
	},
	converter: {
		rgb2hex: jest.fn((c) => c),
	},
	env: {
		_w: {
			getComputedStyle: jest.fn().mockReturnValue({
				border: '',
				padding: '',
				margin: '',
			}),
		},
	},
}));

jest.mock('../../../../../../src/modules/ui', () => ({
	SelectMenu: jest.fn().mockImplementation(() => ({
		on: jest.fn(),
		create: jest.fn(),
		open: jest.fn(),
		close: jest.fn(),
	})),
}));

jest.mock('../../../../../../src/modules/contract', () => ({
	ColorPicker: jest.fn().mockImplementation(() => ({
		init: jest.fn(),
		hueSlider: { close: jest.fn() },
	})),
	Controller: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		html: { style: {} },
		controller_props_title: { textContent: '' },
		isOpen: false, // Default mock value
	})),
}));

jest.mock('../../../../../../src/plugins/dropdown/table/render/table.menu', () => ({
	CreateBorderMenu: jest.fn().mockReturnValue({ items: [], menus: [] }),
	CreateBorderFormatMenu: jest.fn().mockReturnValue({ items: [], menus: [] }),
}));

jest.mock('../../../../../../src/plugins/dropdown/table/render/table.html', () => ({
	CreateHTML_controller_properties: jest.fn().mockReturnValue({
		html: { style: {} },
		controller_props_title: { textContent: '' },
		borderButton: { style: {}, textContent: '' },
		borderFormatButton: { style: {}, textContent: '', firstElementChild: { innerHTML: '' }, setAttribute: jest.fn(), getAttribute: jest.fn().mockReturnValue('all'), disabled: false },
		cell_alignment: { style: {}, querySelector: jest.fn().mockReturnValue({ style: {} }), querySelectorAll: jest.fn().mockReturnValue([]), getAttribute: jest.fn(), setAttribute: jest.fn() },
		cell_alignment_vertical: { style: {}, querySelector: jest.fn().mockReturnValue({ style: {} }), querySelectorAll: jest.fn().mockReturnValue([]), getAttribute: jest.fn(), setAttribute: jest.fn() },
		cell_alignment_table_text: { style: {} },
		border_style: { textContent: '' },
		border_color: { value: '', style: {} },
		border_width: { value: '', style: {} },
		back_color: { value: '', style: {} },
		font_color: { value: '', style: {} },
		palette_border_button: { disabled: false },
		font_bold: { style: {} },
		font_underline: { style: {} },
		font_italic: { style: {} },
		font_strike: { style: {} },
	}),
}));

jest.mock('../../../../../../src/plugins/dropdown/table/shared/table.utils', () => ({
	CreateCellsString: jest.fn().mockReturnValue('<td></td>'),
	InvalidateTableCache: jest.fn(),
}));

describe('TableStyleService', () => {
	let styleService;
	let main;
	let mainState;

	beforeEach(() => {
		jest.clearAllMocks();

		mainState = {
			tdElement: document.createElement('td'),
			selectedCells: [],
			logical_cellCnt: 1,
			figureElement: document.createElement('figure'),
		};

		main = {
			state: mainState,
			editor: {},
			lang: {
				maxSize: 'Max',
				minSize: 'Min',
				tableProperties: 'Table Properties',
				cellProperties: 'Cell Properties',
			},
			icons: {},
			controller_table: {
				form: document.createElement('div'),
				querySelector: jest.fn().mockReturnValue(document.createElement('button')),
			},
			controller_cell: {
				form: document.createElement('div'),
			},
			selectionService: {
				recallStyleSelectedCells: jest.fn(),
			},
			setCellInfo: jest.fn(),
			_setCellControllerPosition: jest.fn(),
			_closeController: jest.fn(),
			historyPush: jest.fn(),
			eventManager: {
				__focusTemp: document.createElement('div'),
			},
		};

		// Override mock implementation
		const { dom } = require('../../../../../../src/helper');
		dom.utils.createElement.mockImplementation((tag) => document.createElement(tag));

		// Mock querySelector for resize buttons within controller_table as per constructor
		const mockBtn = document.createElement('button');
		const mockSpan = document.createElement('span');
		const mockSpanInner = document.createElement('span');
		mockSpan.appendChild(mockSpanInner);

		main.controller_table.querySelector.mockImplementation((sel) => {
			if (sel.includes('span')) return mockSpan;
			return mockBtn;
		});

		// Constructor options
		const options = {
			pluginOptions: {},
			controller_table: main.controller_table,
		};

		styleService = new TableStyleService(main, options);
	});

	describe('controllerAction', () => {
		it('should handle property commands', () => {
			const commands = [
				{ cmd: 'props_onborder_format', method: 'openBorderFormatMenu' },
				{ cmd: 'props_onborder_style', method: 'openBorderStyleMenu' },
				{ cmd: 'props_onpalette', method: 'openColorPalette', args: ['target', 'value'] },
				{ cmd: 'props_font_style', method: 'toggleFontStyle', args: ['value'] },
				{ cmd: 'props_submit', method: 'submitProps', args: ['target'] },
				{ cmd: 'props_align', method: 'setAlignProps', args: ['value'] },
				{ cmd: 'props_align_vertical', method: 'setVerticalAlignProps', args: ['value'] },
			];

			styleService.openBorderFormatMenu = jest.fn();
			styleService.openBorderStyleMenu = jest.fn();
			styleService.openColorPalette = jest.fn();
			styleService.toggleFontStyle = jest.fn();
			styleService.submitProps = jest.fn();
			styleService.setAlignProps = jest.fn();
			styleService.setVerticalAlignProps = jest.fn();

			commands.forEach(({ cmd, method }) => {
				const target = document.createElement('button');
				target.setAttribute('data-command', cmd);
				target.setAttribute('data-value', 'value');

				styleService.controllerAction(target);
				expect(styleService[method]).toHaveBeenCalled();
			});
		});
	});
	describe('openTableProps', () => {
		it('should open table properties controller', () => {
			styleService.openTableProps(document.createElement('button'));
			expect(styleService.controller_props.open).toHaveBeenCalled();
		});

		it('should set control properties from table style', () => {
			const table = document.createElement('table');
			table.style.border = '1px solid black';
			table.style.backgroundColor = 'red';
			main._element = table;

			// Mock getComputedStyle for table via helper env
			const { env } = require('../../../../../../src/helper');
			env._w.getComputedStyle.mockReturnValue({
				border: '1px solid black',
				backgroundColor: 'rgb(255, 0, 0)',
				color: 'rgb(0, 0, 0)',
				textAlign: 'left',
				verticalAlign: 'middle',
				fontWeight: 'normal',
				textDecoration: 'none',
				fontStyle: 'normal',
			});

			styleService.openTableProps(document.createElement('button'));

			expect(styleService.propTargets.back_color.value).toBe('rgb(255, 0, 0)');
			expect(styleService.propTargets.border_style.textContent).toBe('solid');
		});
	});

	describe('toggleHeader', () => {
		it('should toggle table header', () => {
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');
			table.appendChild(tbody);
			main._element = table;

			styleService.toggleHeader();

			const { dom } = require('../../../../../../src/helper');
			expect(dom.utils.createElement).toHaveBeenCalledWith('THEAD');
		});
	});

	describe('openCellProps', () => {
		it('should open cell properties controller', () => {
			styleService.openCellProps(document.createElement('button'));
			expect(styleService.controller_props.open).toHaveBeenCalled();
			expect(styleService.controller_props_title.textContent).toBe('Cell Properties');
		});
	});

	describe('openBorderFormatMenu', () => {
		it('should open appropriate menu based on selection', () => {
			// Case 1: Multiple cells (default cache is empty or > 1)
			styleService._propsCache = [1, 2];
			styleService.openBorderFormatMenu();
			expect(styleService.selectMenu_props_border_format.open).toHaveBeenCalled();

			// Case 2: Single cell
			styleService._propsCache = [1];
			styleService.openBorderFormatMenu();
			expect(styleService.selectMenu_props_border_format_oneCell.open).toHaveBeenCalled();
		});
	});

	describe('openColorPalette', () => {
		it('should open color palette', () => {
			const btn = document.createElement('button');
			styleService.openColorPalette(btn, 'font');
			expect(styleService.controller_colorPicker.open).toHaveBeenCalled();
			expect(styleService.sliderType).toBe('font');
		});

		it('should close color palette if already open with same type', () => {
			const btn = document.createElement('button');
			styleService.controller_colorPicker.isOpen = true;
			styleService.sliderType = 'font';

			styleService.openColorPalette(btn, 'font');
			expect(styleService.controller_colorPicker.close).toHaveBeenCalled();
		});
	});

	describe('toggleCaption', () => {
		it('should toggle table caption', () => {
			const table = document.createElement('table');
			main._element = table;
			const btn = (styleService.captionButton = document.createElement('button'));

			// Toggle On
			styleService.toggleCaption();
			const { dom } = require('../../../../../../src/helper');
			expect(dom.utils.createElement).toHaveBeenCalledWith('CAPTION', expect.any(Object));

			// Toggle Off (mock active class)
			dom.utils.hasClass.mockReturnValue(true);
			styleService.toggleCaption();
			expect(dom.utils.removeItem).toHaveBeenCalled();
		});
	});

	describe('setTableLayout', () => {
		it('should update table layout', () => {
			const styles = 'width';
			mainState.figureElement = { style: { width: '' } };

			// max width
			styleService.setTableLayout(styles, true, false, false);
			expect(mainState.figureElement.style.width).toBe('100%');

			// not max width
			styleService.setTableLayout(styles, false, false, false);
			expect(mainState.figureElement.style.width).toBe('max-content');
		});
	});

	describe('submitProps', () => {
		it('should submit properties and apply styles to selected cells', () => {
			const cell = document.createElement('td');
			cell.style.cssText = 'color: red;';
			const row = document.createElement('tr');
			const tbody = document.createElement('tbody');
			const table = document.createElement('table');
			row.appendChild(cell);
			tbody.appendChild(row);
			table.appendChild(tbody);

			styleService.controller_props.currentTarget = document.createElement('button');

			mainState.selectedCells = [cell];

			styleService.propTargets.font_color.value = '#000000';
			styleService.propTargets.back_color.value = '#ffffff';
			styleService.propTargets.border_style.textContent = 'solid';
			styleService.propTargets.border_width.value = '1';
			styleService.propTargets.border_color.value = '#000000';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			expect(cell.style.color).toBe('rgb(0, 0, 0)');
			expect(cell.style.backgroundColor).toBe('rgb(255, 255, 255)');
			expect(main.historyPush).toHaveBeenCalled();
			expect(styleService.controller_props.close).toHaveBeenCalled();
		});

		it('should apply styles to table', () => {
			const table = document.createElement('table');
			main._element = table;

			const form = main.controller_table.form;
			const currentTarget = document.createElement('div');
			form.appendChild(currentTarget);
			styleService.controller_props.currentTarget = currentTarget;

			styleService.propTargets.back_color.value = '#eeeeee';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			expect(table.style.backgroundColor).toBe('rgb(238, 238, 238)');
		});

		it('should handle merged cells', () => {
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');
			const r1 = document.createElement('tr');
			const r2 = document.createElement('tr');

			const c1 = document.createElement('td');
			c1.rowSpan = 2;
			c1.innerHTML = 'Merged';

			const c2 = document.createElement('td');
			c2.innerHTML = 'Normal';

			const c3 = document.createElement('td');

			r1.appendChild(c1);
			r1.appendChild(c2);
			r2.appendChild(c3);

			tbody.appendChild(r1);
			tbody.appendChild(r2);
			table.appendChild(tbody);

			mainState.selectedCells = [c1, c2, c3];
			mainState.ref = { rs: 0, re: 1, cs: 0, ce: 1 };

			styleService.controller_props.currentTarget = document.createElement('button');

			styleService.propTargets.back_color.value = '#aaaaaa';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			expect(c1.style.backgroundColor).toBe('rgb(170, 170, 170)');
			expect(c2.style.backgroundColor).toBe('rgb(170, 170, 170)');
			expect(c3.style.backgroundColor).toBe('rgb(170, 170, 170)');
		});

		it('should handle complex border styles', () => {
			const c1 = document.createElement('td');
			const c2 = document.createElement('td');
			const c3 = document.createElement('td');
			const c4 = document.createElement('td');

			// 2x2 grid
			const r1 = document.createElement('tr');
			r1.append(c1, c2);
			const r2 = document.createElement('tr');
			r2.append(c3, c4);
			const tbody = document.createElement('tbody');
			tbody.append(r1, r2);
			const table = document.createElement('table');
			table.append(tbody);

			mainState.selectedCells = [c1, c2, c3, c4];
			mainState.ref = { rs: 0, re: 1, cs: 0, ce: 1 };

			styleService.controller_props.currentTarget = document.createElement('button');

			// Fix mock for border_format.getAttribute since default mock always returns 'all'
			let currentFormat = 'outside';
			styleService.propTargets.border_format.getAttribute = jest.fn(() => currentFormat);
			styleService.propTargets.border_format.setAttribute = jest.fn((k, v) => {
				if (k === 'se-border-format') currentFormat = v;
			});

			// Set outside border only
			styleService.propTargets.border_format.setAttribute('se-border-format', 'outside');
			styleService.propTargets.border_style.textContent = 'dotted';
			styleService.propTargets.border_width.value = '2';
			styleService.propTargets.border_color.value = '#0000ff';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			// Top-Left (c1): Top, Left should be set. Right, Bottom should NOT be set (internal).
			// Actually, c1 is top-left.
			// c1 is left (yes), top (yes). right (no), bottom (no).

			// Helper to check border style calls?
			// We can check actual style

			// c1 style
			expect(c1.style.borderTop).toContain('2px dotted');
			expect(c1.style.borderLeft).toContain('2px dotted');
			// invalid or empty check might depend on JSDOM implementation of 'borderRight' when not set
			expect(c1.style.borderRight).toBe('');
			expect(c1.style.borderBottom).toBe('');

			// c4 (Bottom-Right): Bottom, Right should be set.
			expect(c4.style.borderBottom).toContain('2px dotted');
			expect(c4.style.borderRight).toContain('2px dotted');
			expect(c4.style.borderTop).toBe('');
			expect(c4.style.borderLeft).toBe('');
		});
	});

	describe('Public Methods', () => {
		it('should reset header button', () => {
			const table = document.createElement('table');
			table.appendChild(document.createElement('thead'));

			styleService.resetHeaderButton(table);
			const { dom } = require('../../../../../../src/helper');
			expect(dom.utils.addClass).toHaveBeenCalledWith(styleService.headerButton, 'active');

			table.innerHTML = '';
			styleService.resetHeaderButton(table);
			expect(dom.utils.removeClass).toHaveBeenCalledWith(styleService.headerButton, 'active');
		});

		it('should reset caption button', () => {
			const table = document.createElement('table');
			table.appendChild(document.createElement('caption'));

			styleService.resetCaptionButton(table);
			const { dom } = require('../../../../../../src/helper');
			expect(dom.utils.addClass).toHaveBeenCalledWith(styleService.captionButton, 'active');

			table.innerHTML = '';
			styleService.resetCaptionButton(table);
			expect(dom.utils.removeClass).toHaveBeenCalledWith(styleService.captionButton, 'active');
		});

		it('should reset align props', () => {
			const leftBtn = document.createElement('button');
			leftBtn.setAttribute('data-value', 'left');
			const rightBtn = document.createElement('button');
			rightBtn.setAttribute('data-value', 'right');

			const l_parent = document.createElement('div');
			l_parent.appendChild(leftBtn);
			const r_parent = document.createElement('div');
			r_parent.appendChild(rightBtn);

			styleService.propTargets.cell_alignment = {
				querySelector: (sel) => {
					if (sel === '[data-value="left"]') return leftBtn;
					if (sel === '[data-value="right"]') return rightBtn;
				},
			};

			styleService.resetPropsAlign();

			expect(l_parent.contains(rightBtn)).toBe(true);
			expect(r_parent.contains(leftBtn)).toBe(true);
		});

		it('should revert props', () => {
			const el = document.createElement('td');
			el.style.color = 'red';
			styleService._propsCache = [
				[el, 'color: blue;'],
				[el, 'color: green;'],
			];

			const { dom } = require('../../../../../../src/helper');
			dom.check.isTable.mockReturnValue(false);

			styleService.revertProps();

			expect(el.style.cssText).toBe('color: green;');
		});

		it('should init', () => {
			styleService.init();
			const { dom } = require('../../../../../../src/helper');
			expect(dom.utils.removeClass).toHaveBeenCalled();
		});
	});

	describe('SelectMenu Callbacks', () => {
		it('should handle OnPropsBorderEdit', () => {
			const { SelectMenu } = require('../../../../../../src/modules/ui');
			const selectMenuInstances = SelectMenu.mock.results.map((r) => r.value);
			const borderMenu = selectMenuInstances[0];
			const callback = borderMenu.on.mock.calls[0][1];

			callback('solid');

			expect(styleService.propTargets.border_style.textContent).toBe('solid');
			expect(borderMenu.close).toHaveBeenCalled();
		});

		it('should handle OnPropsBorderFormatEdit', () => {
			const { SelectMenu } = require('../../../../../../src/modules/ui');
			const selectMenuInstances = SelectMenu.mock.results.map((r) => r.value);
			const borderFormatMenu = selectMenuInstances[1];
			const callback = borderFormatMenu.on.mock.calls[0][1];

			callback('outside');

			expect(styleService.propTargets.border_format.setAttribute).toHaveBeenCalledWith('se-border-format', 'outside');
			expect(borderFormatMenu.close).toHaveBeenCalled();
		});
	});

	describe('Function Coverage', () => {
		it('should toggle font style', () => {
			const { dom } = require('../../../../../../src/helper');

			styleService.toggleFontStyle('bold');
			expect(dom.utils.toggleClass).toHaveBeenCalledWith(expect.anything(), 'on');

			styleService.toggleFontStyle('italic');
			expect(dom.utils.toggleClass).toHaveBeenCalledWith(expect.anything(), 'on');
		});

		it('should toggle header', () => {
			const table = document.createElement('table');
			// Mock main._element
			main._element = table;
			mainState.logical_cellCnt = 2;

			// Helper mock setup for createElement if needed
			const { dom } = require('../../../../../../src/helper');
			dom.utils.createElement.mockImplementation((tag) => document.createElement(tag));

			// Case 1: Add header
			dom.utils.hasClass.mockReturnValue(false); // Button not active
			styleService.toggleHeader();
			expect(table.querySelector('thead')).not.toBeNull();
			expect(dom.utils.toggleClass).toHaveBeenCalledWith(styleService.headerButton, 'active');

			// Case 2: Remove header
			dom.utils.hasClass.mockReturnValue(true); // Button active
			styleService.toggleHeader();
			expect(dom.utils.removeItem).toHaveBeenCalled();
		});

		it('should toggle caption', () => {
			const table = document.createElement('table');
			main._element = table;
			const { dom } = require('../../../../../../src/helper');
			dom.utils.createElement.mockImplementation((tag) => document.createElement(tag));

			dom.utils.hasClass.mockReturnValue(false);
			styleService.toggleCaption();
			expect(table.querySelector('caption')).not.toBeNull();
			expect(dom.utils.toggleClass).toHaveBeenCalledWith(styleService.captionButton, 'active');

			dom.utils.hasClass.mockReturnValue(true);
			styleService.toggleCaption();
			expect(dom.utils.removeItem).toHaveBeenCalled();
		});

		it('should set align props', () => {
			const { dom } = require('../../../../../../src/helper');
			// Mock querySelector for setCtrlProps/setAlignProps
			const btn = document.createElement('button');
			btn.setAttribute('data-value', 'left');
			const parent = document.createElement('div');
			parent.appendChild(btn);

			styleService.propTargets.cell_alignment.querySelector.mockReturnValue(btn);
			styleService.propTargets.cell_alignment.querySelectorAll.mockReturnValue([btn]);

			styleService.setAlignProps('center');

			expect(dom.utils.removeClass).toHaveBeenCalled();
		});

		it('should apply color picker', () => {
			// openColorPalette takes type as 'back' or 'font' usually?
			// In table.style.js: openColorPalette(button, type) -> this.sliderType = type;
			// applyColorPicker(color) -> target = this.propTargets[`${this.sliderType}_color`];
			// So type should be 'back' (-> back_color) or 'font' (-> font_color).
			styleService.openColorPalette(document.createElement('button'), 'back');
			styleService.applyColorPicker('#abcdef');
			expect(styleService.propTargets.back_color.value).toBe('#abcdef');
		});

		it('should close props', () => {
			styleService.closeProps();
			expect(styleService.controller_props.close).toHaveBeenCalled();
		});
	});

	describe('Controller initMethod callback', () => {
		it('should close hueSlider and remove "on" class', () => {
			const { dom } = require('../../../../../../src/helper');

			// Access the Controller mock to get the initMethod option
			const { Controller } = require('../../../../../../src/modules/contract');
			const controllerCalls = Controller.mock.calls;

			// Find the colorPicker controller call (the one with initMethod)
			const colorPickerCall = controllerCalls.find((call) => call[2]?.initMethod);
			if (colorPickerCall) {
				const initMethod = colorPickerCall[2].initMethod;
				styleService.controller_colorPicker.currentTarget = document.createElement('button');

				initMethod();

				expect(styleService.colorPicker.hueSlider.close).toHaveBeenCalled();
				expect(dom.utils.removeClass).toHaveBeenCalledWith(styleService.controller_colorPicker.currentTarget, 'on');
			}
		});
	});

	describe('colorPickerAction hook', () => {
		it('should call applyColorPicker with color', () => {
			styleService.applyColorPicker = jest.fn();
			styleService.colorPickerAction('#ff0000');
			expect(styleService.applyColorPicker).toHaveBeenCalledWith('#ff0000');
		});
	});

	describe('controllerAction return early', () => {
		it('should return early when no command', () => {
			const target = document.createElement('button');
			// No data-command attribute
			const result = styleService.controllerAction(target);
			expect(result).toBeUndefined();
		});
	});

	describe('openTableProps - close when already open', () => {
		it('should close controller when same target and visible', () => {
			const target = document.createElement('button');

			styleService.controller_props.currentTarget = target;
			styleService.controller_props.form = { style: { display: 'block' } };

			styleService.openTableProps(target);

			expect(styleService.controller_props.close).toHaveBeenCalled();
		});
	});

	describe('openCellProps - close when already open', () => {
		it('should close controller when same target and visible', () => {
			const target = document.createElement('button');

			styleService.controller_props.currentTarget = target;
			styleService.controller_props.form = { style: { display: 'block' } };

			styleService.openCellProps(target);

			expect(styleService.controller_props.close).toHaveBeenCalled();
		});
	});

	describe('openBorderStyleMenu', () => {
		it('should open border style menu', () => {
			styleService.openBorderStyleMenu();
			expect(styleService.selectMenu_props_border.open).toHaveBeenCalled();
		});
	});

	describe('toggleHeader - close controller when TH element', () => {
		it('should close controller when current element is TH', () => {
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');
			table.appendChild(tbody);
			main._element = table;

			// Create a TH element (nodeName is automatically 'TH')
			mainState.tdElement = document.createElement('th');

			const { dom } = require('../../../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(true); // Button is active, remove header

			styleService.toggleHeader();

			expect(main._closeController).toHaveBeenCalled();
		});
	});

	describe('revertProps with table element', () => {
		it('should revert figure element float when isTable', () => {
			const table = document.createElement('table');
			const figureElement = document.createElement('figure');
			figureElement.style.float = 'right';

			mainState.figureElement = figureElement;

			styleService._propsCache = [[table, 'background: red;']];
			styleService._propsAlignCache = 'left';
			styleService._propsVerticalAlignCache = 'middle';

			const { dom } = require('../../../../../../src/helper');
			dom.check.isTable.mockReturnValue(true);

			styleService.revertProps();

			expect(figureElement.style.float).toBe('left');
		});
	});

	describe('setVerticalAlignProps', () => {
		it('should set vertical alignment', () => {
			const { dom } = require('../../../../../../src/helper');
			const btn = document.createElement('button');
			btn.setAttribute('data-value', 'top');

			styleService.propTargets.cell_alignment_vertical.querySelector.mockReturnValue(btn);
			styleService.propTargets.cell_alignment_vertical.querySelectorAll.mockReturnValue([btn]);

			styleService.setVerticalAlignProps('top');

			expect(dom.utils.removeClass).toHaveBeenCalled();
		});
	});

	describe('setTableLayout - column styles', () => {
		it('should handle column fixed styles', () => {
			const { dom } = require('../../../../../../src/helper');
			const table = document.createElement('table');
			main._element = table;

			// Test fixed column
			styleService.setTableLayout('column', false, true, false);

			expect(dom.utils.removeClass).toHaveBeenCalledWith(table, 'se-table-layout-auto');
			expect(dom.utils.addClass).toHaveBeenCalledWith(table, 'se-table-layout-fixed');

			// Test auto column
			styleService.setTableLayout('column', false, false, false);

			expect(dom.utils.removeClass).toHaveBeenCalledWith(table, 'se-table-layout-fixed');
			expect(dom.utils.addClass).toHaveBeenCalledWith(table, 'se-table-layout-auto');
		});
	});

	describe('setTableLayout - return early when no figureElement', () => {
		it('should return early when figureElement is null', () => {
			mainState.figureElement = null;

			// Should not throw
			expect(() => styleService.setTableLayout('width', true, false, false)).not.toThrow();
		});
	});

	describe('submitProps with border formats', () => {
		it('should handle "inside" border format', () => {
			const c1 = document.createElement('td');
			const c2 = document.createElement('td');
			const c3 = document.createElement('td');
			const c4 = document.createElement('td');

			const r1 = document.createElement('tr');
			r1.append(c1, c2);
			const r2 = document.createElement('tr');
			r2.append(c3, c4);
			const tbody = document.createElement('tbody');
			tbody.append(r1, r2);
			const table = document.createElement('table');
			table.append(tbody);

			mainState.selectedCells = [c1, c2, c3, c4];
			mainState.ref = { rs: 0, re: 1, cs: 0, ce: 1 };

			styleService.controller_props.currentTarget = document.createElement('button');

			let currentFormat = 'inside';
			styleService.propTargets.border_format.getAttribute = jest.fn(() => currentFormat);
			styleService.propTargets.border_style.textContent = 'solid';
			styleService.propTargets.border_width.value = '1';
			styleService.propTargets.border_color.value = '#000000';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			// Inside border: c1 and c3 should have right border, c1 and c2 should have bottom border
			expect(c1.style.borderRight).toContain('1px solid');
			expect(c1.style.borderBottom).toContain('1px solid');
		});

		it('should handle "horizon" border format', () => {
			const c1 = document.createElement('td');
			const c2 = document.createElement('td');

			const r1 = document.createElement('tr');
			r1.append(c1);
			const r2 = document.createElement('tr');
			r2.append(c2);
			const tbody = document.createElement('tbody');
			tbody.append(r1, r2);
			const table = document.createElement('table');
			table.append(tbody);

			mainState.selectedCells = [c1, c2];
			mainState.ref = { rs: 0, re: 1, cs: 0, ce: 0 };

			styleService.controller_props.currentTarget = document.createElement('button');

			styleService.propTargets.border_format.getAttribute = jest.fn(() => 'horizon');
			styleService.propTargets.border_style.textContent = 'dashed';
			styleService.propTargets.border_width.value = '2';
			styleService.propTargets.border_color.value = '#ff0000';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			// c1 is not bottom, so it should have bottom border
			expect(c1.style.borderBottom).toContain('2px dashed');
		});

		it('should handle "vertical" border format', () => {
			const c1 = document.createElement('td');
			const c2 = document.createElement('td');

			const r1 = document.createElement('tr');
			r1.append(c1, c2);
			const tbody = document.createElement('tbody');
			tbody.append(r1);
			const table = document.createElement('table');
			table.append(tbody);

			mainState.selectedCells = [c1, c2];
			mainState.ref = { rs: 0, re: 0, cs: 0, ce: 1 };

			styleService.controller_props.currentTarget = document.createElement('button');

			styleService.propTargets.border_format.getAttribute = jest.fn(() => 'vertical');
			styleService.propTargets.border_style.textContent = 'solid';
			styleService.propTargets.border_width.value = '1';
			styleService.propTargets.border_color.value = '#00ff00';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			// c1 is not right, so it should have right border
			expect(c1.style.borderRight).toContain('1px solid');
		});

		it('should handle individual border formats (left, top, right, bottom)', () => {
			const cell = document.createElement('td');
			const row = document.createElement('tr');
			row.appendChild(cell);
			const tbody = document.createElement('tbody');
			tbody.appendChild(row);
			const table = document.createElement('table');
			table.appendChild(tbody);

			mainState.selectedCells = [cell];
			mainState.ref = { rs: 0, re: 0, cs: 0, ce: 0 };

			styleService.controller_props.currentTarget = document.createElement('button');

			const formats = ['left', 'top', 'right', 'bottom'];

			for (const format of formats) {
				cell.style.cssText = '';
				styleService.propTargets.border_format.getAttribute = jest.fn(() => format);
				styleService.propTargets.border_style.textContent = 'solid';
				styleService.propTargets.border_width.value = '1';
				styleService.propTargets.border_color.value = '#000000';

				const targetBtn = document.createElement('button');
				styleService.submitProps(targetBtn);

				const borderProp = `border${format.charAt(0).toUpperCase() + format.slice(1)}`;
				expect(cell.style[borderProp]).toContain('1px solid');
			}
		});
	});

	describe('submitProps with "none" border format', () => {
		it('should clear all borders when border format is none', () => {
			const cell = document.createElement('td');
			cell.style.border = '1px solid black';
			const row = document.createElement('tr');
			row.appendChild(cell);
			const tbody = document.createElement('tbody');
			tbody.appendChild(row);
			const table = document.createElement('table');
			table.appendChild(tbody);

			mainState.selectedCells = [cell];
			mainState.ref = { rs: 0, re: 0, cs: 0, ce: 0 };

			styleService.controller_props.currentTarget = document.createElement('button');

			styleService.propTargets.border_format.getAttribute = jest.fn(() => 'none');
			styleService.propTargets.border_style.textContent = 'none';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			expect(cell.style.border).toBe('');
		});
	});

	describe('submitProps with colspan cells', () => {
		it('should handle cells with colspan', () => {
			const c1 = document.createElement('td');
			c1.colSpan = 2;
			const c2 = document.createElement('td');

			const r1 = document.createElement('tr');
			r1.append(c1);
			const r2 = document.createElement('tr');
			r2.append(document.createElement('td'), c2);
			const tbody = document.createElement('tbody');
			tbody.append(r1, r2);
			const table = document.createElement('table');
			table.append(tbody);

			mainState.selectedCells = [c1, c2];
			mainState.ref = { rs: 0, re: 1, cs: 0, ce: 1 };

			styleService.controller_props.currentTarget = document.createElement('button');
			styleService.propTargets.back_color.value = '#cccccc';

			const targetBtn = document.createElement('button');
			styleService.submitProps(targetBtn);

			expect(c1.style.backgroundColor).toBe('rgb(204, 204, 204)');
		});
	});

	describe('#getBorderStyle parsing', () => {
		it('should parse border style correctly for different formats', () => {
			// This tests the private method indirectly through setCtrlProps
			const table = document.createElement('table');
			table.style.border = '2px dashed rgb(255, 0, 0)';
			main._element = table;

			const { env } = require('../../../../../../src/helper');
			env._w.getComputedStyle.mockReturnValue({
				border: '2px dashed rgb(255, 0, 0)',
				backgroundColor: 'transparent',
				color: 'black',
				textAlign: 'left',
				verticalAlign: 'middle',
				fontWeight: 'normal',
				textDecoration: 'none',
				fontStyle: 'normal',
			});

			styleService.openTableProps(document.createElement('button'));

			expect(styleService.propTargets.border_style.textContent).toBe('dashed');
			expect(styleService.propTargets.border_width.value).toBe('2px');
		});
	});

	describe('#setAlignProps toggle behavior', () => {
		it('should toggle off alignment when clicking same value', () => {
			const btn = document.createElement('button');
			btn.setAttribute('data-value', 'center');
			const parent = document.createElement('div');
			parent.appendChild(btn);

			// Mock current alignment
			styleService.propTargets.cell_alignment.getAttribute = jest.fn(() => 'center');
			styleService.propTargets.cell_alignment.setAttribute = jest.fn();
			styleService.propTargets.cell_alignment.querySelector = jest.fn().mockReturnValue(btn);
			styleService.propTargets.cell_alignment.querySelectorAll = jest.fn().mockReturnValue([btn]);

			styleService.setAlignProps('center');

			// Should set to empty string (toggle off)
			expect(styleService.propTargets.cell_alignment.setAttribute).toHaveBeenCalledWith('se-cell-align', '');
		});
	});
});
