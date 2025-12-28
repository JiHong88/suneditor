import { dom } from '../../../../helper';
import { _DragHandle } from '../../../../modules/ui';
import { BORDER_LIST, BORDER_FORMATS } from '../shared/table.constants';

export function CreateSplitMenu(lang) {
	const menus = dom.utils.createElement(
		'DIV',
		null,
		/*html*/ `
		<div title="${lang.verticalSplit}" aria-label="${lang.verticalSplit}">
			${lang.verticalSplit}
		</div>
		<div title="${lang.horizontalSplit}" aria-label="${lang.horizontalSplit}">
			${lang.horizontalSplit}
		</div>`,
	);

	return { items: ['vertical', 'horizontal'], menus: menus.querySelectorAll('div') };
}

export function CreateColumnMenu(lang, icons) {
	const menus = dom.utils.createElement(
		'DIV',
		null,
		/*html*/ `
		<div title="${lang.insertColumnBefore}" aria-label="${lang.insertColumnBefore}">
			<span class="se-list-icon">${icons.insert_column_left}</span><span class="se-txt">${lang.insertColumnBefore}</span>
		</div>
		<div title="${lang.insertColumnAfter}" aria-label="${lang.insertColumnAfter}">
			<span class="se-list-icon">${icons.insert_column_right}</span><span class="se-txt">${lang.insertColumnAfter}</span>
		</div>
		<div title="${lang.deleteColumn}" aria-label="${lang.deleteColumn}">
			<span class="se-list-icon">${icons.delete_column}</span><span class="se-txt">${lang.deleteColumn}</span>
		</div>`,
	);

	return { items: ['insert-left', 'insert-right', 'delete'], menus: menus.querySelectorAll('div') };
}

export function CreateRowMenu(lang, icons) {
	const menus = dom.utils.createElement(
		'DIV',
		null,
		/*html*/ `
		<div title="${lang.insertRowAbove}" aria-label="${lang.insertRowAbove}">
			<span class="se-list-icon">${icons.insert_row_above}</span><span class="se-txt">${lang.insertRowAbove}</span>
		</div>
		<div title="${lang.insertRowBelow}" aria-label="${lang.insertRowBelow}">
			<span class="se-list-icon">${icons.insert_row_below}</span><span class="se-txt">${lang.insertRowBelow}</span>
		</div>
		<div title="${lang.deleteRow}" aria-label="${lang.deleteRow}">
			<span class="se-list-icon">${icons.delete_row}</span><span class="se-txt">${lang.deleteRow}</span>
		</div>`,
	);

	return { items: ['insert-above', 'insert-below', 'delete'], menus: menus.querySelectorAll('div') };
}

export function CreateBorderMenu() {
	let html = '';

	for (let i = 0, len = BORDER_LIST.length, s; i < len; i++) {
		s = BORDER_LIST[i];
		html += /*html*/ `
		<div title="${s}" aria-label="${s}" style="padding: 0 12px;">
			<span class="se-txt">${s}</span>
		</div>`;
	}

	const menus = dom.utils.createElement('DIV', null, html);
	return { items: BORDER_LIST, menus: menus.querySelectorAll('div') };
}

export function CreateBorderFormatMenu(langs, icons, indideFormats) {
	const items = [];
	let html = '';

	for (const k in BORDER_FORMATS) {
		if (indideFormats.includes(k)) continue;
		const s = BORDER_FORMATS[k];
		items.push(k);
		html += /*html*/ `
			<button type="button" class="se-btn se-tooltip">
				${icons[s]}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${langs[s]}</span>
				</span>
			</button>`;
	}

	const menus = dom.utils.createElement('DIV', null, html);
	return { items, menus: menus.querySelectorAll('button') };
}
