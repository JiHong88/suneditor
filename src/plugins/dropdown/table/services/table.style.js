import { dom, numbers, converter, env } from '../../../../helper';
import { SelectMenu } from '../../../../modules/ui';

import * as Constants from '../shared/table.constants';
import { CreateBorderMenu, CreateBorderFormatMenu } from '../render/table.menu';
import { CreateHTML_controller_properties } from '../render/table.html';
import { ColorPicker, Controller } from '../../../../modules/contract';
import { CreateCellsString, InvalidateTableCache } from '../shared/table.utils';

const { _w } = env;

export class TableStyleService {
	#main;
	#state;

	/**
	 * @constructor
	 * @param {import('../index').default} main Table index
	 * @param {Object} options - Options
	 * @param {import('../index').TablePluginOptions} options.pluginOptions - Plugin options
	 * @param {HTMLElement} options.controller_table - Controller table element
	 */
	constructor(main, { pluginOptions, controller_table }) {
		this.#main = main;
		this.#state = main.state;
		this.editor = main.editor;

		this.sliderType = '';
		/** @type {HTMLButtonElement} */
		this.resizeButton = controller_table.querySelector('._se_table_resize');
		/** @type {HTMLSpanElement} */
		this.resizeText = controller_table.querySelector('._se_table_resize > span > span');
		/** @type {HTMLButtonElement} */
		this.columnFixedButton = controller_table.querySelector('._se_table_fixed_column');
		/** @type {HTMLButtonElement} */
		this.headerButton = controller_table.querySelector('._se_table_header');
		/** @type {HTMLButtonElement} */
		this.captionButton = controller_table.querySelector('._se_table_caption');

		// props
		const controller_props = CreateHTML_controller_properties(this.#main.editor);
		const propsTargets = [this.#main.controller_table, this.#main.controller_cell];
		this.controller_props = new Controller(this, controller_props.html, { position: 'bottom', parents: propsTargets, isInsideForm: true });
		this.controller_props_title = controller_props.controller_props_title;

		// color picker
		const colorForm = dom.utils.createElement('DIV', { class: 'se-controller se-list-layer' }, null);
		this.controller_colorPicker = new Controller(this, colorForm, {
			position: 'bottom',
			parents: [this.controller_props].concat(propsTargets),
			isInsideForm: true,
			isWWTarget: false,
			initMethod: () => {
				this.colorPicker.hueSlider.close();
				dom.utils.removeClass(this.controller_colorPicker.currentTarget, 'on');
			},
		});

		this.colorPicker = new ColorPicker(this, '', {
			form: colorForm,
			colorList: pluginOptions.colorList || Constants.DEFAULT_COLOR_LIST,
			splitNum: 5,
			disableRemove: true,
			hueSliderOptions: { controllerOptions: { isOutsideForm: true, parents: [this.controller_colorPicker], parentsHide: true } },
		});

		// members - SelectMenu - properties - border style
		const borderMenu = CreateBorderMenu();
		const borderButton = controller_props.borderButton;
		this.selectMenu_props_border = new SelectMenu(main.editor, { checkList: false, position: 'bottom-center' });
		this.selectMenu_props_border.on(borderButton, this.#OnPropsBorderEdit.bind(this));
		this.selectMenu_props_border.create(borderMenu.items, borderMenu.menus);

		// members - SelectMenu - properties - border format
		const borderFormatMenu = CreateBorderFormatMenu(this.#main.lang, this.#main.icons, []);
		const borderFormatButton = controller_props.borderFormatButton;
		this.selectMenu_props_border_format = new SelectMenu(main.editor, { checkList: false, position: 'bottom-left', dir: 'ltr', splitNum: 5 });
		this.selectMenu_props_border_format.on(borderFormatButton, this.#OnPropsBorderFormatEdit.bind(this, 'all'));
		this.selectMenu_props_border_format.create(borderFormatMenu.items, borderFormatMenu.menus);

		const borderFormatMenu_oneCell = CreateBorderFormatMenu(this.#main.lang, this.#main.icons, Constants.BORDER_FORMAT_INSIDE);
		this.selectMenu_props_border_format_oneCell = new SelectMenu(main.editor, { checkList: false, position: 'bottom-left', dir: 'ltr', splitNum: 6 });
		this.selectMenu_props_border_format_oneCell.on(borderFormatButton, this.#OnPropsBorderFormatEdit.bind(this, 'outside'));
		this.selectMenu_props_border_format_oneCell.create(borderFormatMenu_oneCell.items, borderFormatMenu_oneCell.menus);

		// memberts - elements..
		this.maxText = this.#main.lang.maxSize;
		this.minText = this.#main.lang.minSize;
		this.propTargets = {
			cell_alignment: controller_props.cell_alignment,
			cell_alignment_vertical: controller_props.cell_alignment_vertical,
			cell_alignment_table_text: controller_props.cell_alignment_table_text,
			border_format: borderFormatButton,
			border_style: controller_props.border_style,
			border_color: controller_props.border_color,
			border_width: controller_props.border_width,
			back_color: controller_props.back_color,
			font_color: controller_props.font_color,
			palette_border_button: controller_props.palette_border_button,
			font_bold: controller_props.font_bold,
			font_underline: controller_props.font_underline,
			font_italic: controller_props.font_italic,
			font_strike: controller_props.font_strike,
		};
		this._propsCache = [];
		this._currentFontStyles = [];
		this._propsAlignCache = '';
		this._propsVerticalAlignCache = '';
		this._typeCache = '';
	}

	get #selectionService() {
		return this.#main.selectionService;
	}

	/**
	 * @hook Modules.ColorPicker
	 * @type {SunEditor.Hook.ColorPicker.Action}
	 */
	colorPickerAction(color) {
		this.applyColorPicker(color);
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		const value = target.getAttribute('data-value');

		switch (command) {
			case 'props_onborder_format':
				this.openBorderFormatMenu();
				break;
			case 'props_onborder_style':
				this.openBorderStyleMenu();
				break;
			case 'props_onpalette':
				this.openColorPalette(target, value);
				break;
			case 'props_font_style':
				this.toggleFontStyle(value);
				break;
			case 'props_submit':
				this.submitProps(target);
				break;
			case 'props_align':
				this.setAlignProps(target.getAttribute('data-value'));
				break;
			case 'props_align_vertical':
				this.setVerticalAlignProps(target.getAttribute('data-value'));
				break;
		}
	}

	/**
	 * @description Opens the table properties dialog.
	 * @param {HTMLElement} target - The target element (usually the table).
	 */
	openTableProps(target) {
		if (this.controller_props.currentTarget === target && this.controller_props.form?.style.display === 'block') {
			this.controller_props.close();
		} else {
			this.controller_props_title.textContent = this.#main.lang.tableProperties;
			this.#setCtrlProps('table');
			this.controller_props.open(target, this.#main.controller_table.form, { isWWTarget: false, initMethod: null, addOffset: null });
		}
	}

	/**
	 * @description Opens the cell properties dialog.
	 * @param {HTMLElement} target - The target element (usually the table cell).
	 */
	openCellProps(target) {
		if (this.controller_props.currentTarget === target && this.controller_props.form?.style.display === 'block') {
			this.controller_props.close();
		} else {
			this.controller_props_title.textContent = this.#main.lang.cellProperties;
			this.#setCtrlProps('cell');
			this.controller_props.open(target, this.#main.controller_cell.form, { isWWTarget: false, initMethod: null, addOffset: null });
		}
	}

	/**
	 * @description Opens the border format menu.
	 */
	openBorderFormatMenu() {
		if (this._propsCache.length === 1) {
			this.selectMenu_props_border_format_oneCell.open();
		} else {
			this.selectMenu_props_border_format.open();
		}
	}

	/**
	 * @description Opens the border style menu.
	 */
	openBorderStyleMenu() {
		this.selectMenu_props_border.open();
	}

	/**
	 * @description Handles color selection from the color palette.
	 * @param {Node} button The button triggering the color palette.
	 * @param {string} type The type of color selection.
	 */
	openColorPalette(button, type) {
		const { back_color, font_color, border_color } = this.propTargets;
		const color = type === 'border' ? border_color : type === 'back' ? back_color : font_color;

		if (this.controller_colorPicker.isOpen && type === this.sliderType) {
			this.controller_colorPicker.close();
		} else {
			this.sliderType = type;
			dom.utils.addClass(button, 'on');
			this.colorPicker.init(color?.value || '', button);
			this.controller_colorPicker.open(button, null, { isWWTarget: false, initMethod: null, addOffset: null });
		}
	}

	/**
	 * @description Toggles the font style.
	 * @param {string} value - The style to toggle ("bold"|"underline"|"italic"|"strike").
	 */
	toggleFontStyle(value) {
		dom.utils.toggleClass(this.propTargets[`font_${value}`], 'on');
	}

	/**
	 * @description Toggles the visibility of the table header (`<thead>`). If the header is present, it is removed; if absent, it is added.
	 */
	toggleHeader() {
		const btn = this.headerButton;
		const active = dom.utils.hasClass(btn, 'active');
		const table = this.#main._element;
		InvalidateTableCache(table);

		if (!active) {
			const header = dom.utils.createElement('THEAD');
			header.innerHTML = '<tr>' + CreateCellsString('th', this.#state.logical_cellCnt) + '</tr>';
			table.insertBefore(header, table.querySelector('tbody'));
		} else {
			dom.utils.removeItem(table.querySelector('thead'));
		}

		dom.utils.toggleClass(btn, 'active');

		if (/TH/i.test(this.#state.tdElement.nodeName)) {
			this.#main._closeController();
		} else {
			this.#main._setCellControllerPosition(this.#state.tdElement, false);
		}
	}

	/**
	 * @description Toggles the visibility of the table caption (`<caption>`). If the caption is present, it is removed; if absent, it is added.
	 */
	toggleCaption() {
		const btn = this.captionButton;
		const active = dom.utils.hasClass(btn, 'active');
		const table = this.#main._element;

		if (!active) {
			const caption = dom.utils.createElement('CAPTION', { class: `se-table-caption-${this.#main.captionPosition}` });
			caption.innerHTML = '<div><br></div>';
			table.insertBefore(caption, table.firstElementChild);
		} else {
			dom.utils.removeItem(table.querySelector('caption'));
		}

		dom.utils.toggleClass(btn, 'active');
		this.#main._setCellControllerPosition(this.#state.tdElement, false);
	}

	/**
	 * @description Resets the header button state.
	 * @param {HTMLTableElement} table - The table element.
	 */
	resetHeaderButton(table) {
		if (table.querySelector('thead')) dom.utils.addClass(this.headerButton, 'active');
		else dom.utils.removeClass(this.headerButton, 'active');
	}

	/**
	 * @description Resets the caption button state.
	 * @param {HTMLTableElement} table - The table element.
	 */
	resetCaptionButton(table) {
		if (table.querySelector('caption')) dom.utils.addClass(this.captionButton, 'active');
		else dom.utils.removeClass(this.captionButton, 'active');
	}

	/**
	 * @description Resets the alignment properties for table cells.
	 */
	resetPropsAlign() {
		const { cell_alignment } = this.propTargets;
		const left = cell_alignment.querySelector('[data-value="left"]');
		const right = cell_alignment.querySelector('[data-value="right"]');
		const l_parent = left.parentElement;
		const r_parent = right.parentElement;
		l_parent.appendChild(right);
		r_parent.appendChild(left);
	}

	/**
	 * @description Reverts the properties to their previous state.
	 */
	revertProps() {
		const propsCache = this._propsCache;
		for (let i = 0, len = propsCache.length; i < len; i++) {
			propsCache[i][0].style.cssText = propsCache[i][1];
		}
		// alignment
		this.#setAlignProps(this.propTargets.cell_alignment, this._propsAlignCache, true);
		this.#setAlignProps(this.propTargets.cell_alignment_vertical, this._propsVerticalAlignCache, true);
		if (dom.check.isTable(propsCache[0][0]) && this.#state.figureElement) {
			this.#state.figureElement.style.float = this._propsAlignCache;
		}
	}

	/**
	 * @description Applies the color from the color picker.
	 * @param {any} color - The color string or object.
	 */
	applyColorPicker(color) {
		const target = this.propTargets[`${this.sliderType}_color`];
		target.style.borderColor = target.value = color;
		this.controller_colorPicker.close();
	}

	/**
	 * @description Sets the alignment properties.
	 * @param {string} value - The alignment value.
	 */
	setAlignProps(value) {
		this.#setAlignProps(this.propTargets.cell_alignment, value, false);
	}

	/**
	 * @description Sets the vertical alignment properties.
	 * @param {string} value - The vertical alignment value.
	 */
	setVerticalAlignProps(value) {
		this.#setAlignProps(this.propTargets.cell_alignment_vertical, value, false);
	}

	/**
	 * @description Updates table layout styles.
	 * @param {string} styles - Styles to update.
	 * @param {boolean} isMaxWidth - Whether the table is set to maximum width.
	 * @param {boolean} isFixedColumn - Whether the table has fixed column width.
	 * @param {boolean} ondisplay - Whether to update display.
	 */
	setTableLayout(styles, isMaxWidth, isFixedColumn, ondisplay) {
		if (styles.includes('width')) {
			const targets = this.#state.figureElement;
			if (!targets) return;

			let sizeIcon, text;
			if (!isMaxWidth) {
				sizeIcon = this.#main.icons.expansion;
				text = this.maxText;
				if (!ondisplay) targets.style.width = 'max-content';
			} else {
				sizeIcon = this.#main.icons.reduction;
				text = this.minText;
				if (!ondisplay) targets.style.width = '100%';
			}

			dom.utils.changeElement(this.resizeButton.firstElementChild, sizeIcon);
			dom.utils.changeTxt(this.resizeText, text);
		}

		if (styles.includes('column')) {
			if (!isFixedColumn) {
				dom.utils.removeClass(this.#main._element, 'se-table-layout-fixed');
				dom.utils.addClass(this.#main._element, 'se-table-layout-auto');
				dom.utils.removeClass(this.columnFixedButton, 'active');
			} else {
				dom.utils.removeClass(this.#main._element, 'se-table-layout-auto');
				dom.utils.addClass(this.#main._element, 'se-table-layout-fixed');
				dom.utils.addClass(this.columnFixedButton, 'active');
			}
		}
	}

	/**
	 * @description Applies properties to table cells.
	 * @param {HTMLButtonElement} target The target element.
	 */
	submitProps(target) {
		try {
			target.disabled = true;

			const isTable = this.#main.controller_table.form.contains(this.controller_props.currentTarget);
			const targets = isTable ? [this.#main._element] : this.#state.selectedCells;
			const tr = /** @type {HTMLTableCellElement} */ (targets[0]);
			const trStyles = _w.getComputedStyle(tr);
			const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical } = this.propTargets;

			const borderFormat = border_format.getAttribute('se-border-format') || '';
			const hasFormat = borderFormat !== 'all';
			const borderStyle = (border_style.textContent === 'none' ? '' : border_style.textContent) || '';
			const isNoneFormat = borderFormat === 'none' || !borderStyle;

			const cellAlignment = cell_alignment.getAttribute('se-cell-align') || '';
			const cellAlignmentVertical = cell_alignment_vertical.getAttribute('se-cell-align') || '';
			const borderColor = isNoneFormat ? '' : border_color.value.trim() || trStyles.borderColor;
			let borderWidth = isNoneFormat ? '' : border_width.value.trim() || trStyles.borderWidth;
			borderWidth = borderWidth + (numbers.is(borderWidth) ? Constants.DEFAULT_BORDER_UNIT : '');
			const backColor = back_color.value.trim();
			const fontColor = font_color.value.trim();
			const hasBorder = hasFormat && !isNoneFormat && borderWidth;
			const borderCss = `${borderWidth} ${borderStyle} ${borderColor}`;
			const cells = {
				left: [],
				top: [],
				right: [],
				bottom: [],
				middle: [],
				all: null,
			};

			if (!isTable) {
				const trRow = /** @type {HTMLTableRowElement} */ (tr.parentElement);
				// --- target cells roof
				let { rs, re, cs, ce } = this.#state.ref || {
					rs: trRow.rowIndex || 0,
					re: trRow.rowIndex || 0,
					cs: tr.cellIndex || 0,
					ce: tr.cellIndex || 0,
				};
				const mergeInfo = new Array(re - rs + 1).fill(0).map(() => new Array(ce - cs + 1).fill(0));
				const cellStartIndex = cs;
				re -= rs;
				rs -= rs;
				ce -= cs;
				cs -= cs;
				let prevRow = /** @type {HTMLElement} */ (trRow);
				for (let i = 0, cellCnt = 0, len = targets.length, e, es, rowIndex = 0, cellIndex, colspan, rowspan; i < len; i++, cellCnt++) {
					e = /** @type {HTMLTableCellElement} */ (targets[i]);
					colspan = e.colSpan;
					rowspan = e.rowSpan;
					cellIndex = e.cellIndex - cellStartIndex;

					if (prevRow !== e.parentElement) {
						rowIndex++;
						cellCnt = 0;
						prevRow = e.parentElement;
					}

					let c = 0;
					while (c <= cellIndex) {
						cellIndex += mergeInfo[rowIndex][c] || 0;
						c++;
					}

					try {
						if (rowspan > 1) {
							const rowspanNum = rowspan - 1;
							for (let r = rowIndex; r <= rowIndex + rowspanNum; r++) {
								mergeInfo[r][cellIndex] += colspan - (rowIndex === r ? 1 : 0);
							}
						} else if (colspan > 1) {
							mergeInfo[rowIndex][cellIndex] += colspan - 1;
						}
					} catch {
						// ignore error
					}

					const isBottom = rowIndex + rowspan - 1 === re;
					if (rowIndex === rs) cells.top.push(e);
					if (rowIndex === re || isBottom) cells.bottom.push(e);
					if (cellIndex === cs) cells.left.push(e);
					if (cellIndex === ce || cellIndex + colspan - 1 === ce) cells.right.push(e);
					if (!isBottom && rowIndex !== rs && rowIndex !== re && cellIndex !== cs && cellIndex !== ce) cells.middle.push(e);

					// --- set styles
					es = e.style;
					// alignment
					es.textAlign = cellAlignment;
					es.verticalAlign = cellAlignmentVertical;
					// back
					es.backgroundColor = backColor;
					// font
					es.color = fontColor;
					// font style
					this.#setFontStyle(es);
					// border
					if (hasBorder) continue;
					// border - all || none
					if (isNoneFormat) {
						es.border = es.borderLeft = es.borderTop = es.borderRight = es.borderBottom = '';
					} else {
						es.border = borderCss;
					}
				}

				if (cells.middle.length === 0) {
					cells.middle = targets;
				}
			} else {
				// -- table styles
				const es = tr.style;
				// alignment
				if (this.#state.figureElement) {
					this.#state.figureElement.style.float = cellAlignment;
					this.#state.figureElement.style.verticalAlign = cellAlignmentVertical;
				}
				// back
				es.backgroundColor = backColor;
				// font
				es.color = fontColor;
				// font style
				this.#setFontStyle(es);
				// border
				if (!hasBorder) {
					// border - all || none
					if (isNoneFormat) {
						es.border = es.borderLeft = es.borderTop = es.borderRight = es.borderBottom = '';
					} else {
						es.border = borderCss;
					}
				}

				cells.left = cells.top = cells.right = cells.bottom = targets;
			}

			cells.all = targets;

			// border format
			if (hasBorder) {
				this.#setBorderStyles(cells, borderFormat, borderCss);
			}

			this.#main.historyPush();

			// set cells style
			this.controller_props.close();
			if (this.#state.tdElement) {
				this.#selectionService.recallStyleSelectedCells();
				this.#main.setCellInfo(this.#state.tdElement, true);
				dom.utils.addClass(this.#state.tdElement, 'se-selected-cell-focus');
			}
		} catch (err) {
			console.warn('[SUNEDITOR.plugins.table.setProps.error]', err);
		} finally {
			target.disabled = false;
		}
	}

	/**
	 * @description Closes the properties dialog.
	 */
	closeProps() {
		this.controller_props.close();
		this.controller_colorPicker.close();
	}

	/**
	 * @description Updates control properties.
	 * @param {string} type The type of control property.
	 */
	#setCtrlProps(type) {
		this._typeCache = type;
		const isTable = type === 'table';
		const targets = isTable ? [this.#main._element] : this.#state.selectedCells;
		if (!targets?.[0]) return;

		const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, cell_alignment_table_text, font_bold, font_underline, font_italic, font_strike } = this.propTargets;
		const { border, backgroundColor, color, textAlign, verticalAlign, fontWeight, textDecoration, fontStyle } = _w.getComputedStyle(targets[0]);
		const cellBorder = this.#getBorderStyle(border);

		/** @type {HTMLElement} */ (cell_alignment.querySelector('[data-value="justify"]')).style.display = isTable ? 'none' : '';
		cell_alignment_table_text.style.display = isTable ? '' : 'none';
		if (isTable) cell_alignment_vertical.style.display = 'none';
		else cell_alignment_vertical.style.display = '';

		let b_color = converter.rgb2hex(cellBorder.c),
			b_style = cellBorder.s,
			b_width = cellBorder.w,
			backColor = converter.rgb2hex(backgroundColor),
			fontColor = converter.rgb2hex(color),
			bold = /.+/.test(fontWeight),
			underline = /underline/i.test(textDecoration),
			strike = /line-through/i.test(textDecoration),
			italic = /italic/i.test(fontStyle),
			align = isTable ? this.#state.figureElement?.style.float : textAlign,
			align_v = verticalAlign;
		this._propsCache = [];

		const tempColorStyles = _w.getComputedStyle(this.#main.eventManager.__focusTemp);
		for (let i = 0, t, isBreak; (t = targets[i]); i++) {
			// eslint-disable-next-line no-shadow
			const { cssText, border, backgroundColor, color, textAlign, verticalAlign, fontWeight, textDecoration, fontStyle } = t.style;
			this._propsCache.push([t, cssText]);
			if (isBreak) continue;

			const { c, s, w } = this.#getBorderStyle(border);

			// colors
			let hexBackColor = backgroundColor;
			let hexColor = color;
			if (hexBackColor) {
				this.#main.eventManager.__focusTemp.style.backgroundColor = hexBackColor;
				hexBackColor = tempColorStyles.backgroundColor;
			}
			if (hexColor) {
				this.#main.eventManager.__focusTemp.style.color = hexColor;
				hexColor = tempColorStyles.color;
			}

			if (b_color && cellBorder.c !== c) b_color = '';
			if (b_style && cellBorder.s !== s) b_style = '';
			if (b_width && cellBorder.w !== w) b_width = '';
			if (backColor !== converter.rgb2hex(hexBackColor)) backColor = '';
			if (fontColor !== converter.rgb2hex(hexColor)) fontColor = '';
			if (align !== (isTable ? this.#state.figureElement?.style.float : textAlign)) align = '';
			if (align_v && align_v !== verticalAlign) align_v = '';
			if (bold && bold !== /.+/.test(fontWeight)) bold = false;
			if (underline && underline !== /underline/i.test(textDecoration)) underline = false;
			if (strike && strike !== /line-through/i.test(textDecoration)) strike = false;
			if (italic && italic !== /italic/i.test(fontStyle)) italic = false;
			if (!b_color || !b_style || !b_width || !backColor || !fontColor) {
				isBreak = true;
			}
		}

		// border - format
		border_format.firstElementChild.innerHTML = this.#main.icons[Constants.BORDER_FORMATS[targets.length === 1 ? 'outside' : 'all']];
		border_format.setAttribute('se-border-format', 'all');
		dom.utils.removeClass(border_format, 'active');

		// border - styles
		b_style ||= Constants.BORDER_LIST[0];
		border_style.textContent = b_style;
		border_color.style.borderColor = border_color.value = b_color;
		border_width.value = b_width;
		this.#disableBorderProps(b_style === Constants.BORDER_LIST[0]);

		// back, font color
		back_color.value = back_color.style.borderColor = backColor;
		font_color.value = font_color.style.borderColor = fontColor;

		// font style
		if (bold) dom.utils.addClass(font_bold, 'on');
		if (underline) dom.utils.addClass(font_underline, 'on');
		if (strike) dom.utils.addClass(font_strike, 'on');
		if (italic) dom.utils.addClass(font_italic, 'on');

		// align
		this.#setAlignProps(cell_alignment, (this._propsAlignCache = align), true);
		this.#setAlignProps(cell_alignment_vertical, (this._propsVerticalAlignCache = align_v), true);
	}

	/**
	 * @description Sets font styles.
	 * @param {CSSStyleDeclaration} styles The style object to modify.
	 */
	#setFontStyle(styles) {
		const { font_bold, font_italic, font_strike, font_underline } = this.propTargets;
		styles.fontWeight = dom.utils.hasClass(font_bold, 'on') ? 'bold' : '';
		styles.fontStyle = dom.utils.hasClass(font_italic, 'on') ? 'italic' : '';
		styles.textDecoration = ((dom.utils.hasClass(font_strike, 'on') ? 'line-through ' : '') + (dom.utils.hasClass(font_underline, 'on') ? 'underline' : '')).trim();
	}

	/**
	 * @description Gets the border style.
	 * @param {string} borderStyle The border style string.
	 * @returns {{w: string, s: string, c: string}} The parsed border style object.
	 * - w: The border width.
	 * - s: The border style.
	 * - c: The border color.
	 */
	#getBorderStyle(borderStyle) {
		const parts = borderStyle.split(/\s(?![^()]*\))/);
		let w = '',
			s = '',
			c = '';

		if (parts.length === 3) {
			w = parts[0];
			s = parts[1];
			c = parts[2];
		} else if (parts.length === 2) {
			if (/\d/.test(parts[0])) {
				w = parts[0];
				s = parts[1];
			} else {
				s = parts[0];
				c = parts[1];
			}
		} else if (parts.length === 1) {
			if (/\d/.test(parts[0])) {
				w = parts[0];
			} else {
				s = parts[0];
			}
		}

		return { w, s, c: converter.rgb2hex(c) };
	}

	/**
	 * @description Sets border format and styles.
	 * @param {{left: Node[], top: Node[], right: Node[], bottom: Node[], all: Node[]}} cells The table cells categorized by border positions.
	 * @param {string} borderKey Border style ("all"|"inside"|"horizon"|"vertical"|"outside"|"left"|"top"|"right"|"bottom")
	 * @param {string} s The border style value.
	 */
	#setBorderStyles(cells, borderKey, s) {
		const { left, top, right, bottom, all } = cells;
		switch (borderKey) {
			case 'inside':
				if (all.length === 1) return;
				dom.utils.setStyle(
					all.filter((c) => !bottom.includes(c)),
					Constants.BORDER_NS.b,
					s,
				);
				dom.utils.setStyle(
					all.filter((c) => !right.includes(c)),
					Constants.BORDER_NS.r,
					s,
				);
				break;
			case 'horizon':
				if (all.length === 1) return;
				dom.utils.setStyle(
					all.filter((c) => !bottom.includes(c)),
					Constants.BORDER_NS.b,
					s,
				);
				break;
			case 'vertical':
				if (all.length === 1) return;
				dom.utils.setStyle(
					all.filter((c) => !right.includes(c)),
					Constants.BORDER_NS.r,
					s,
				);
				break;
			case 'outside':
				dom.utils.setStyle(left, Constants.BORDER_NS.l, s);
				dom.utils.setStyle(top, Constants.BORDER_NS.t, s);
				dom.utils.setStyle(right, Constants.BORDER_NS.r, s);
				dom.utils.setStyle(bottom, Constants.BORDER_NS.b, s);
				break;
			case 'left':
				dom.utils.setStyle(left, Constants.BORDER_NS.l, s);
				break;
			case 'top':
				dom.utils.setStyle(top, Constants.BORDER_NS.t, s);
				break;
			case 'right':
				dom.utils.setStyle(right, Constants.BORDER_NS.r, s);
				break;
			case 'bottom':
				dom.utils.setStyle(bottom, Constants.BORDER_NS.b, s);
				break;
		}
	}

	/**
	 * @description Disables or enables border properties.
	 * @param {boolean} disabled Whether to disable or enable border properties.
	 */
	#disableBorderProps(disabled) {
		const { border_color, border_width, palette_border_button } = this.propTargets;
		if (disabled) {
			border_color.disabled = true;
			border_width.disabled = true;
			palette_border_button.disabled = true;
			border_width.disabled = true;
		} else {
			border_color.disabled = false;
			border_width.disabled = false;
			palette_border_button.disabled = false;
			border_width.disabled = false;
		}
	}

	/**
	 * @description Sets text alignment properties.
	 * @param {Element} el The element to apply alignment to.
	 * @param {string} align The alignment value.
	 * @param {boolean} reset Whether to reset the alignment.
	 */
	#setAlignProps(el, align, reset) {
		dom.utils.removeClass(el.querySelectorAll('button'), 'on');

		if (!reset && el.getAttribute('se-cell-align') === align) {
			el.setAttribute('se-cell-align', '');
			return;
		}

		dom.utils.addClass(el.querySelector(`[data-value="${align}"]`), 'on');
		el.setAttribute('se-cell-align', align);
	}

	/**
	 * @description Handles border style changes in table properties.
	 * @param {string} command The border style command.
	 */
	#OnPropsBorderEdit(command) {
		this.propTargets.border_style.textContent = command;
		this.#disableBorderProps(command === Constants.BORDER_LIST[0]);
		this.selectMenu_props_border.close();
	}

	/**
	 * @description Handles border format changes in table properties.
	 * @param {string} defaultCommand The default border format command.
	 * @param {string} command The new border format command.
	 */
	#OnPropsBorderFormatEdit(defaultCommand, command) {
		const { border_format } = this.propTargets;

		border_format.setAttribute('se-border-format', command);
		border_format.firstElementChild.innerHTML = this.#main.icons[Constants.BORDER_FORMATS[command]];
		if (command !== defaultCommand) dom.utils.addClass(border_format, 'active');
		else dom.utils.removeClass(border_format, 'active');

		this.selectMenu_props_border_format.close();
		this.selectMenu_props_border_format_oneCell.close();
	}

	/**
	 * @description Initialize the style service (resets properties).
	 */
	init() {
		const { border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike } = this.propTargets;
		dom.utils.removeClass([border_format, border_color, border_style, border_width, back_color, font_color, cell_alignment, cell_alignment_vertical, font_bold, font_underline, font_italic, font_strike], 'on');
	}
}

export default TableStyleService;
