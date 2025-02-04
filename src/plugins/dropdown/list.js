import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description List Plugin (OL, UL)
 * @param {object} editor editor core object
 */
const List = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.list;
	this.icon = 'list_numbered';

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.listItems = menu.querySelectorAll('li button');
	this.icons = {
		bulleted: editor.icons.list_bulleted,
		numbered: editor.icons.list_numbered
	};

	// init
	this.menu.initDropdownTarget(List, menu);
};

List.key = 'list';
List.type = 'dropdown';
List.className = 'se-icon-flip-rtl';
List.prototype = {
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?Element} element - Node element where the cursor is currently located
	 * @param {?Element} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 */
	active(element, target) {
		const icon = target.firstElementChild;

		if (domUtils.isList(element)) {
			const nodeName = element.nodeName.toLowerCase();
			target.setAttribute('data-focus', nodeName);
			domUtils.addClass(target, 'active');

			if (/^ul$/.test(nodeName)) {
				domUtils.changeElement(icon, this.icons.bulleted);
			} else {
				domUtils.changeElement(icon, this.icons.numbered);
			}

			return true;
		}

		target.removeAttribute('data-focus');
		domUtils.changeElement(icon, this.icons.number);
		domUtils.removeClass(target, 'active');

		return false;
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {Element} target Line element at the current cursor position
	 */
	on(target) {
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
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const command = target.getAttribute('data-command');
		const type = target.getAttribute('data-value') || '';
		const range = this.format.applyList(`${command}:${type}`, null, false);
		if (range) this.selection.setRange(range.sc, range.so, range.ec, range.eo);

		this.menu.dropdownOff();
		this.history.push(false);
	},

	constructor: List
};

function CreateHTML({ lang, icons }) {
	const html = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">
			<li>
				<button type="button" class="se-btn se-btn-list se-tooltip se-icon-flip-rtl" data-command="ol" title="${lang.numberedList}" aria-label="${lang.numberedList}">
					${icons.list_numbered}
				</button>
			</li>
			<li>
				<button type="button" class="se-btn se-btn-list se-tooltip se-icon-flip-rtl" data-command="ul" title="${lang.bulletedList}" aria-label="${lang.bulletedList}">
					${icons.list_bulleted}
				</button>
			</li>
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, html);
}

export default List;
