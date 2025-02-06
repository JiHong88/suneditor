import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @class
 * @description Line height Plugin
 * @param {object} editor - The root editor instance
 * @param {object} pluginOptions
 * @param {Array.<{text: string, value: number}>} pluginOptions.items - Line height list
 */
function LineHeight(editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.lineHeight;
	this.icon = 'line_height';

	// create HTML
	const menu = CreateHTML(editor, pluginOptions.items);

	// members
	this.sizeList = menu.querySelectorAll('li button');
	this.currentSize = -1;

	// init
	this.menu.initDropdownTarget(LineHeight, menu);
}

LineHeight.key = 'lineHeight';
LineHeight.type = 'dropdown';
LineHeight.className = '';
LineHeight.prototype = {
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?Element} element - Node element where the cursor is currently located
	 * @param {?Element} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 */
	active(element, target) {
		if (element?.style?.lineHeight.length > 0) {
			domUtils.addClass(target, 'active');
			return true;
		}

		domUtils.removeClass(target, 'active');
		return false;
	},

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 */
	on() {
		const format = this.format.getLine(this.selection.getNode());
		const currentSize = !format ? '' : format.style.lineHeight + '';

		if (currentSize !== this.currentSize) {
			const sizeList = this.sizeList;
			for (let i = 0, len = sizeList.length; i < len; i++) {
				if (currentSize === sizeList[i].getAttribute('data-command')) {
					domUtils.addClass(sizeList[i], 'active');
				} else {
					domUtils.removeClass(sizeList[i], 'active');
				}
			}

			this.currentSize = currentSize;
		}
	},

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const value = target.getAttribute('data-command') || '';
		const formats = this.format.getLines();

		for (let i = 0, len = formats.length; i < len; i++) {
			formats[i].style.lineHeight = value;
		}

		this.menu.dropdownOff();

		this.editor.effectNode = null;
		this.history.push(false);
	},

	constructor: LineHeight
};

function CreateHTML({ lang }, items) {
	const sizeList = items || [
		{ text: '1', value: '1em' },
		{ text: '1.2', value: '1.2em' },
		{ text: '1.7', value: '1.7em' },
		{ text: '2', value: '2em' }
	];

	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">
			<li>
				<button type="button" class="se-btn se-btn-list default_value" data-command="" title="${lang.default}" aria-label="${lang.default}">
					(${lang.default})
				</button>
			</li>`;

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

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer' }, list);
}

export default LineHeight;
