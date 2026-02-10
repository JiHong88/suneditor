import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} LineHeightPluginOptions
 * @property {Array<{text: string, value: string}>} [items] - Line height list
 */

/**
 * @class
 * @description Line height Plugin
 */
class LineHeight extends PluginDropdown {
	static key = 'lineHeight';
	static className = '';

	#defaultValue;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {LineHeightPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.$.lang.lineHeight;
		this.icon = 'line_height';

		// create HTML
		const menu = CreateHTML(this.$, pluginOptions.items);

		// members
		this.sizeList = menu.querySelectorAll('li button');
		this.currentSize = null;

		this.#defaultValue = /** @type {HTMLSpanElement} */ (menu.querySelector('.se-sub-list span'));

		// init
		this.$.menu.initDropdownTarget(LineHeight, menu);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		if (this.$.format.isLine(element) && element.style.lineHeight.length > 0) {
			dom.utils.addClass(target, 'active');
			return true;
		}

		dom.utils.removeClass(target, 'active');
		return false;
	}

	/**
	 * @override
	 * @type {PluginDropdown['on']}
	 */
	on() {
		const format = this.$.format.getLine(this.$.selection.getNode());
		const currentSize = !format ? '' : format.style.lineHeight + '';

		if (currentSize !== this.currentSize) {
			let found = false;
			const sizeList = this.sizeList;
			for (let i = 0, len = sizeList.length; i < len; i++) {
				if (currentSize === sizeList[i].getAttribute('data-command')) {
					dom.utils.addClass(sizeList[i], 'active');
					found = true;
				} else {
					dom.utils.removeClass(sizeList[i], 'active');
				}
			}

			this.currentSize = currentSize;

			if (!found) {
				this.#defaultValue.textContent = currentSize;
				this.#defaultValue.style.display = 'block';
			} else {
				this.#defaultValue.style.display = 'none';
			}
		}
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const value = target.getAttribute('data-command') || '';
		const formats = this.$.format.getLines();

		for (let i = 0, len = formats.length; i < len; i++) {
			formats[i].style.lineHeight = value;
		}

		this.$.menu.dropdownOff();

		this.$.store.set('_lastSelectionNode', null);
		this.$.history.push(false);
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {Array<{text: string, value: string}>} [items] - Line height items
 * @returns {HTMLElement}
 */
function CreateHTML({ lang }, items) {
	const sizeList = items || [
		{ text: '1', value: '1em' },
		{ text: '1.2', value: '1.2em' },
		{ text: '1.7', value: '1.7em' },
		{ text: '2', value: '2em' },
	];

	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">
			<li>
				<button type="button" class="se-btn se-btn-list default_value" data-command="" title="${lang.default}" aria-label="${lang.default}">
					${lang.default}
				</button>
			</li>
			<li class="se-btn-list se-sub-list"><span></span></li>`;

	for (let i = 0, len = sizeList.length, size; i < len; i++) {
		size = sizeList[i];
		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="${size.value}" title="${size.text}" aria-label="${size.text}">
					${size.text}
				</button>
			</li>`;
	}

	list += /*html*/ `
		</ul>
	</div>`;

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, list);
}

export default LineHeight;
