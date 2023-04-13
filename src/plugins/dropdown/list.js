import EditorInjector from '../../injector';
import { domUtils } from '../../helper';

const List = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.list;
	this.icon = 'list_number';

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.listItems = menu.querySelectorAll('li button');
	this.icons = {
		bullets: editor.icons.list_bullets,
		number: editor.icons.list_number
	};

	// init
	this.menu.initDropdownTarget(List, menu);
};

List.key = 'list';
List.type = 'dropdown';
List.className = '';
List.prototype = {
	/**
	 * @override core
	 */
	active: function (element, target) {
		const icon = target.firstElementChild;

		if (domUtils.isList(element)) {
			const nodeName = /^OL$/i.test(element.nodeName) ? 'numbered' : 'bullet';
			target.setAttribute('data-focus', nodeName);
			domUtils.addClass(target, 'active');

			if (/UL/i.test(nodeName)) {
				domUtils.changeElement(icon, this.icons.bullets);
			} else {
				domUtils.changeElement(icon, this.icons.number);
			}

			return true;
		} else {
			target.removeAttribute('data-focus');
			domUtils.changeElement(icon, this.icons.number);
			domUtils.removeClass(target, 'active');
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function (target) {
		const currentList = target.getAttribute('data-focus') || '';
		const list = this.listItems;
		for (let i = 0, len = list.length; i < len; i++) {
			if (currentList === list[i].getAttribute('data-command')) {
				domUtils.addClass(list[i], 'active');
			} else {
				domUtils.removeClass(list[i], 'active');
			}
		}
	},

	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action: function (target) {
		const command = target.getAttribute('data-command');
		const type = target.getAttribute('data-value') || '';
		const range = this.format.applyList(command + ':' + type, null, false);
		if (range) this.selection.setRange(range.sc, range.so, range.ec, range.eo);

		this.menu.dropdownOff();
		this.history.push(false);
	},

	constructor: List
};

function CreateHTML(editor) {
	const lang = editor.lang;
	const html =
		'<div class="se-list-inner">' +
		'<ul class="se-list-basic">' +
		'<li><button type="button" class="se-btn-list se-tooltip" data-command="numbered" title="' +
		lang.orderList +
		'" aria-label="' +
		lang.orderList +
		'">' +
		editor.icons.list_number +
		'</button></li>' +
		'<li><button type="button" class="se-btn-list se-tooltip" data-command="bullet" title="' +
		lang.unorderList +
		'" aria-label="' +
		lang.unorderList +
		'">' +
		editor.icons.list_bullets +
		'</button></li>' +
		'</ul>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, html);
}

export default List;
