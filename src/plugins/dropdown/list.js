import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @class
 * @description List Plugin (`OL`, `UL`)
 */
class List extends PluginDropdown {
	static key = 'list';
	static className = 'se-icon-flip-rtl';

	#listItems;
	#listIcons;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.list;
		this.icon = 'list_numbered';

		// create HTML
		const menu = CreateHTML(this.$);

		// members
		this.#listItems = menu.querySelectorAll('li button');
		this.#listIcons = {
			bulleted: this.$.icons.list_bulleted,
			numbered: this.$.icons.list_numbered,
		};

		// init
		this.$.menu.initDropdownTarget(List, menu);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		const icon = target.firstElementChild;

		if (dom.check.isList(element)) {
			const nodeName = element.nodeName.toLowerCase();
			target.setAttribute('data-focus', nodeName);
			dom.utils.addClass(target, 'active');

			if (/^ul$/.test(nodeName)) {
				dom.utils.changeElement(icon, this.#listIcons.bulleted);
			} else {
				dom.utils.changeElement(icon, this.#listIcons.numbered);
			}

			return true;
		}

		target.removeAttribute('data-focus');
		dom.utils.changeElement(icon, this.#listIcons.numbered);
		dom.utils.removeClass(target, 'active');

		return false;
	}

	/**
	 * @override
	 * @type {PluginDropdown['on']}
	 */
	on(target) {
		const currentList = target.getAttribute('data-focus') || '';
		const list = this.#listItems;
		for (let i = 0, len = list.length; i < len; i++) {
			if (currentList === list[i].getAttribute('data-command')) {
				dom.utils.addClass(list[i], 'active');
			} else {
				dom.utils.removeClass(list[i], 'active');
			}
		}
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const command = target.getAttribute('data-command');
		const type = target.getAttribute('data-value') || '';
		const range = this.$.listFormat.apply(`${command}:${type}`, null, false);
		if (range) this.$.selection.setRange(range.sc, range.so, range.ec, range.eo);

		this.$.menu.dropdownOff();
		this.$.history.push(false);
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @returns {HTMLElement}
 */
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

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, html);
}

export default List;
