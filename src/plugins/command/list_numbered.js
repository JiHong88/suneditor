import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const DEFAULT_TYPE = 'decimal';

const List_numbered = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.numberedList;
	this.icon = 'list_numbered';
	this.afterButton = domUtils.createElement(
		'button',
		{ class: 'se-btn se-tooltip se-sub-arrow-btn', 'data-command': List_numbered.key+'_n', 'data-type': 'dropdown' },
		`${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.numberedList}</span></span>`
	);

	// create HTML
	const menu = CreateHTML();

	// members
	this.listItems = menu.querySelectorAll('li button ol');

	// init
	this.menu.initDropdownTarget({ key: List_numbered.key, type: 'dropdown' }, menu);
};

List_numbered.key = 'list_numbered';
List_numbered.type = 'command';
List_numbered.className = 'se-icon-flip-rtl';
List_numbered.prototype = {
	/**
	 * @override core
	 */
	active(element, target) {
		if (domUtils.isListCell(element) && /^OL$/i.test(element.parentElement.nodeName)) {
			domUtils.addClass(target, 'active');
			return true;
		}

		domUtils.removeClass(target, 'active');
		return false;
	},

	/**
	 * @override dropdown
	 */
	on() {
		const list = this.listItems;
		const el = this.format.getBlock(this.selection.getNode());
		const type = el?.style ? el.style.listStyleType || DEFAULT_TYPE : '';

		for (let i = 0, len = list.length, l; i < len; i++) {
			l = list[i];
			if (type === l.style.listStyleType) {
				domUtils.addClass(l.parentElement, 'active');
			} else {
				domUtils.removeClass(l.parentElement, 'active');
			}
		}
	},

	/**
	 * @override core
	 * @param {Element|null} target Target command button
	 */
	action(target) {
		const el = this.format.getBlock(this.selection.getNode());
		const type = target?.querySelector('ol')?.style.listStyleType || '';

		if (domUtils.isList(el) && type) {
			el.style.listStyleType = type;
		} else {
			const range = this.format.applyList(`ol:${type}`, null, false);
			if (range) this.selection.setRange(range.sc, range.so, range.ec, range.eo);
		}

		this.menu.dropdownOff();
		this.editor.focus();
		this.history.push(false);
	},

	constructor: List_numbered
};

function CreateHTML() {
	const html = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic se-list-horizontal se-list-carrier">
			${_CreateLI(['decimal', 'upper-roman', 'lower-roman'])}
		</ul>
		<ul class="se-list-basic se-list-horizontal se-list-carrier">
		${_CreateLI(['lower-latin', 'upper-latin', 'lower-greek'])}
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, html);
}

function _CreateLI(types) {
	return types
		.map((v) => {
			return /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list se-icon-flip-rtl" data-command="${v}" title="${v}" aria-label="${v}">
					<ol style="list-style-type: ${v};">
						<li></li><li></li><li></li>
					</ol>
				</button>
			</li>
		`;
		})
		.join('');
}

export default List_numbered;
