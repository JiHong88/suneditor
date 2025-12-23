import { dom } from '../../../../helper';
import { _DragHandle } from '../../../../modules/utils';

import { BORDER_FORMATS } from '../shared/table.constants';

export function CreateHTML() {
	const html = /*html*/ `
	<div class="se-table-size">
		<div class="se-table-size-picker se-controller-table-picker"></div>
		<div class="se-table-size-highlighted"></div>
		<div class="se-table-size-unhighlighted"></div>
	</div>
	<div class="se-table-size-display">1 x 1</div>`;

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-selector-table' }, html);
}

export function CreateHTML_controller_table({ lang, icons }) {
	const html = /*html*/ `
	<div class="se-arrow se-arrow-down se-visible-hidden"></div>
	<div class="se-btn-group">
		<button type="button" data-command="openTableProperties" class="se-btn se-tooltip">
			${icons.table_properties}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.tableProperties}</span>
			</span>
		</button>
		<button type="button" data-command="layout" class="se-btn se-tooltip _se_table_fixed_column">
			${icons.fixed_column_width}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.fixedColumnWidth}</span>
			</span>
		</button>
		<button type="button" data-command="header" class="se-btn se-tooltip _se_table_header">
			${icons.table_header}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.tableHeader}</span>
			</span>
		</button>
		<button type="button" data-command="caption" class="se-btn se-tooltip _se_table_caption">
			${icons.caption}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.caption}</span>
			</span>
		</button>
		<button type="button" data-command="resize" class="se-btn se-tooltip _se_table_resize">
			${icons.reduction}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.minSize}</span>
			</span>
		</button>
		<button type="button" data-command="copy" class="se-btn se-tooltip">
			${icons.copy}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.copy}</span>
			</span>
		</button>
		<button type="button" data-command="remove" class="se-btn se-tooltip">
			${icons.delete}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.remove}</span>
			</span>
		</button>
	</div>`;

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-table' }, html);
}

/**
 * @param {SunEditor.Core} editor
 * @returns {{ html: HTMLElement, splitButton: HTMLButtonElement, columnButton: HTMLButtonElement, rowButton: HTMLButtonElement, mergeButton: HTMLButtonElement, unmergeButton: HTMLButtonElement }}
 */
export function CreateHTML_controller_cell({ lang, icons }, cellControllerTop) {
	const html = /*html*/ `
	<div class="se-arrow se-arrow-${cellControllerTop ? 'down se-visible-hidden' : 'up'}"></div>
    <div class="se-btn-group">
		<button type="button" data-command="openCellProperties" class="se-btn se-tooltip">
			${icons.cell_properties}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${lang.cellProperties}</span>
			</span>
		</button>
        <button type="button" data-command="oncolumn" class="se-btn se-tooltip">
            ${icons.table_column}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.column}</span>
            </span>
        </button>
        <button type="button" data-command="onrow" class="se-btn se-tooltip">
            ${icons.table_row}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.row}</span>
            </span>
        </button>
        <button type="button" data-command="merge" class="se-btn se-tooltip" style="display: none;">
            ${icons.merge_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.mergeCells}</span>
            </span>
        </button>
        <button type="button" data-command="onsplit" class="se-btn se-tooltip">
            ${icons.split_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.splitCells}</span>
            </span>
        </button>
		<button type="button" data-command="unmerge" class="se-btn se-tooltip">
            ${icons.unmerge_cell}
            <span class="se-tooltip-inner">
                <span class="se-tooltip-text">${lang.unmergeCells}</span>
            </span>
        </button>
    </div>`;

	const content = dom.utils.createElement('DIV', { class: 'se-controller se-controller-table-cell' }, html);

	return {
		html: content,
		splitButton: content.querySelector('[data-command="onsplit"]'),
		columnButton: content.querySelector('[data-command="oncolumn"]'),
		rowButton: content.querySelector('[data-command="onrow"]'),
		mergeButton: content.querySelector('[data-command="merge"]'),
		unmergeButton: content.querySelector('[data-command="unmerge"]'),
	};
}

/**
 * @typedef {Object} TableCtrlProps
 * @property {HTMLElement} html
 * @property {HTMLElement} controller_props_title
 * @property {HTMLButtonElement} borderButton
 * @property {HTMLButtonElement} borderFormatButton
 * @property {HTMLElement} cell_alignment
 * @property {HTMLElement} cell_alignment_vertical
 * @property {HTMLElement} cell_alignment_table_text
 * @property {HTMLButtonElement} border_style
 * @property {HTMLInputElement} border_color
 * @property {HTMLInputElement} border_width
 * @property {HTMLInputElement} back_color
 * @property {HTMLInputElement} font_color
 * @property {HTMLButtonElement} palette_border_button
 * @property {HTMLButtonElement} font_bold
 * @property {HTMLButtonElement} font_underline
 * @property {HTMLButtonElement} font_italic
 * @property {HTMLButtonElement} font_strike
 *
 * @param {SunEditor.Core} editor - Editor instance
 * @returns {TableCtrlProps}
 */
export function CreateHTML_controller_properties({ lang, icons, options }) {
	const alignItems = options.get('_rtl') ? ['right', 'center', 'left', 'justify'] : ['left', 'center', 'right', 'justify'];
	let alignHtml = '';
	for (let i = 0, item, text; i < alignItems.length; i++) {
		item = alignItems[i];
		text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		alignHtml += /*html*/ `
		<button type="button" class="se-btn se-tooltip" data-command="props_align" data-value="${item}" title="${text}" aria-label="${text}">
			${icons['align_' + item]}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${text}</span>
			</span>
		</button>`;
	}

	// vertical align html
	const verticalAligns = ['top', 'middle', 'bottom'];
	let verticalAlignHtml = '';
	for (let i = 0, item, text; i < verticalAligns.length; i++) {
		item = verticalAligns[i];
		text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		verticalAlignHtml += /*html*/ `
		<button type="button" class="se-btn se-tooltip" data-command="props_align_vertical" data-value="${item}" title="${text}" aria-label="${text}">
			${icons['align_' + item]}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${text}</span>
			</span>
		</button>`;
	}

	const html = /*html*/ `
		<div class="se-controller-content">
			<div class="se-controller-header">
				<button type="button" data-command="close_props" class="se-btn se-close-btn close" title="${lang.close}" aria-label="${lang.close}">${icons.cancel}</button>
				<span class="se-controller-title">${lang.tableProperties}</span>
			</div>
			<div class="se-controller-body">

				<span>${lang.border}</span>
				<div class="se-form-group se-form-w0">
					<button type="button" data-command="props_onborder_format" class="se-btn se-tooltip">
						${icons[BORDER_FORMATS.all]}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.border}</span>
						</span>
					</button>
					<button type="button" data-command="props_onborder_style" class="se-btn se-btn-select se-tooltip se-border-style">
						<span class="se-txt"></span>
						${icons.arrow_down}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.border}</span>
						</span>
					</button>
					<input type="text" class="se-color-input __se_border_color" placeholder="${lang.color}" />
					<button type="button" data-command="props_onpalette" data-value="border" class="se-btn se-tooltip">
						${icons.color_palette}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.colorPicker}</span>
						</span>
					</button>
					<input type="text" class="se-input-control __se__border_size" placeholder="${lang.width}" />
				</div>

				<span>${lang.color}</span>
				<div class="se-form-group se-form-w0">
					<button type="button" data-command="props_onpalette" data-value="font" class="se-btn se-tooltip">
						${icons.font_color}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.fontColor}</span>
						</span>
					</button>
					<input type="text" class="se-color-input __se_font_color" placeholder="${lang.fontColor}" />
					<button type="button" data-command="props_onpalette" data-value="back" class="se-btn se-tooltip">
						${icons.background_color}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.backgroundColor}</span>
						</span>
					</button>
					<input type="text" class="se-color-input __se_back_color" placeholder="${lang.backgroundColor}" />
				</div>

				<span>${lang.font}</span>
				<div class="se-form-group se-form-w0">
					<button type="button" data-command="props_font_style" data-value="bold" class="se-btn se-tooltip">
						${icons.bold}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.bold}</span>
						</span>
					</button>
					<button type="button" data-command="props_font_style" data-value="underline" class="se-btn se-tooltip">
						${icons.underline}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.underline}</span>
						</span>
					</button>
					<button type="button" data-command="props_font_style" data-value="italic" class="se-btn se-tooltip">
						${icons.italic}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.italic}</span>
						</span>
					</button>
					<button type="button" data-command="props_font_style" data-value="strike" class="se-btn se-tooltip">
						${icons.strike}
						<span class="se-tooltip-inner">
							<span class="se-tooltip-text">${lang.strike}</span>
						</span>
					</button>
				</div>

				<div class="se-table-props-align">
					<span>${lang.align} <span class="__se__a_table_t">( ${lang.table} )</span></span>
					<div class="se-form-group se-form-w0 se-list-inner">
						<div class="__se__a_h">
							${alignHtml}
						</div>
						<div class="__se__a_v">
							${verticalAlignHtml}
						</div>
					</div>
				</div>
			</div>
			<div class="se-form-group se-form-w0 se-form-flex-btn">
				<button type="button" class="se-btn se-btn-success" data-command="props_submit" title="${lang.submitButton}" aria-label="${lang.submitButton}">${icons.checked}</button>
				<button type="button" class="se-btn se-btn-danger" data-command="revert" title="${lang.revert}" aria-label="${lang.revert}">${icons.revert}</button>
			</div>
		</div>`;

	const content = dom.utils.createElement('DIV', { class: 'se-controller se-table-props' }, html);

	return {
		html: content,
		controller_props_title: content.querySelector('.se-controller-title'),
		borderButton: content.querySelector('[data-command="props_onborder_style"]'),
		borderFormatButton: content.querySelector('[data-command="props_onborder_format"]'),
		cell_alignment: content.querySelector('.se-table-props-align .__se__a_h'),
		cell_alignment_vertical: content.querySelector('.se-table-props-align .__se__a_v'),
		cell_alignment_table_text: content.querySelector('.se-table-props-align .__se__a_table_t'),
		border_style: content.querySelector('[data-command="props_onborder_style"] .se-txt'),
		border_color: content.querySelector('.__se_border_color'),
		border_width: content.querySelector('.__se__border_size'),
		back_color: content.querySelector('.__se_back_color'),
		font_color: content.querySelector('.__se_font_color'),
		palette_border_button: content.querySelector('[data-command="props_onpalette"][data-value="border"]'),
		font_bold: content.querySelector('[data-command="props_font_style"][data-value="bold"]'),
		font_underline: content.querySelector('[data-command="props_font_style"][data-value="underline"]'),
		font_italic: content.querySelector('[data-command="props_font_style"][data-value="italic"]'),
		font_strike: content.querySelector('[data-command="props_font_style"][data-value="strike"]'),
	};
}
