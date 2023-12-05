import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const DEFAULT_TYPE = 'disc';

const List_bulleted = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.bulletedList;
	this.icon = 'list_bulleted';
	this.sideButton = domUtils.createElement(
		'button',
		{ class: 'se-btn se-tooltip se', 'data-command': List_bulleted.key, 'data-type': 'dropdown' },
		`${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.bulletedList}</span></span>`
	);

	// create HTML
	const menu = CreateHTML();

	// members
	this.listItems = menu.querySelectorAll('li button ul');

	// init
	this.menu.initDropdownTarget({ key: List_bulleted.key, type: 'dropdown' }, menu);
};

List_bulleted.key = 'list_bulleted';
List_bulleted.type = 'command';
List_bulleted.className = 'se-icon-flip-rtl';
List_bulleted.prototype = {
	/**
	 * @override core
	 */
	active(element, target) {
		if (domUtils.isListCell(element) && /^UL$/i.test(element.parentElement.nodeName)) {
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
		const type = target?.querySelector('ul').style.listStyleType || '';

		if (domUtils.isList(el) && type) {
			el.style.listStyleType = type;
		} else {
			const range = this.format.applyList(`ul:${type}`, null, false);
			if (range) this.selection.setRange(range.sc, range.so, range.ec, range.eo);
		}

		this.menu.dropdownOff();
		this.editor.focus();
		this.history.push(false);
	},

	constructor: List_bulleted
};

function CreateHTML() {
	const html = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic se-list-horizontal se-list-carrier">
			${_CreateLI(['disc', 'circle', 'square'])}
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
					<ul style="list-style-type: ${v};">
						<li></li><li></li><li></li>
					</ul>
				</button>
			</li>
		`;
		})
		.join('');
}

export default List_bulleted;
