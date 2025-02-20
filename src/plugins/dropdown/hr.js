import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @typedef {import('../../core/class/shortcuts').ShortcutInfo} ShortcutInfo
 */

/**
 * @class
 * @description HR Plugin
 */
class HR extends EditorInjector {
	static key = 'hr';
	static type = 'dropdown';
	static className = '';
	static component(node) {
		return /^hr$/i.test(node?.nodeName) ? node : null;
	}

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<{name: string, class: string}>} pluginOptions.items - HR list
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.horizontalLine;
		this.icon = 'horizontal_line';

		// create HTML
		const HRMenus = CreateHTML(editor, pluginOptions.items);

		// members
		this.list = HRMenus.querySelectorAll('button');

		// init
		this.menu.initDropdownTarget(HR, HRMenus);
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target) {
		domUtils.addClass(target, 'on');
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Called when a container is deselected.
	 * @param {HTMLElement} element Target element
	 */
	deselect(element) {
		domUtils.removeClass(element, 'on');
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {HTMLElement} target Target element
	 */
	destroy(target) {
		if (!target) return;

		const focusEl = target.previousElementSibling || target.nextElementSibling;
		domUtils.removeItem(target);

		// focus
		this.editor.focusEdge(focusEl);
		this.history.push(false);
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const hr = this.submit(target.firstElementChild.className);
		const line = this.format.addLine(hr);
		this.selection.setRange(line, 1, line, 1);
		this.menu.dropdownOff();
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes methods called by shortcut keys.
	 * @param {Object} params - Information of the "shortcut" plugin
	 * @param {Range} params.range - Range object
	 * @param {Element} params.line - The line element of the current range
	 * @param {ShortcutInfo} params.info - Information of the shortcut
	 * @param {Event} params.event - Key event object
	 * @param {number} params.keyCode - Key code
	 * @param {EditorCore} params.editor - The root editor instance
	 */
	shortcut({ line, range }) {
		const newLine = this.nodeTransform.split(range.endContainer, range.endOffset, 0);
		this.submit('__se__solid');
		domUtils.removeItem(line);
		this.selection.setRange(newLine, 0, newLine, 0);
	}

	/**
	 * @description Add a hr element
	 * @param {string} className HR class name
	 */
	submit(className) {
		const hr = domUtils.createElement('hr', { class: className });
		this.editor.focus();
		this.component.insert(hr, { skipCharCount: false, skipSelection: true, skipHistory: false });
		return hr;
	}
}

function CreateHTML({ lang }, HRItems) {
	const items = HRItems || [
		{
			name: lang.hr_solid,
			class: '__se__solid'
		},
		{
			name: lang.hr_dashed,
			class: '__se__dashed'
		},
		{
			name: lang.hr_dotted,
			class: '__se__dotted'
		}
	];

	let list = '';
	for (let i = 0, len = items.length; i < len; i++) {
		list += /*html*/ `
		<li>
			<button type="button" class="se-btn se-btn-list" data-command="hr" title="${items[i].name}" aria-label="${items[i].name}">
				<hr${items[i].class ? ` class="${items[i].class}"` : ''}${items[i].style ? ` style="${items[i].style}"` : ''}/>
			</button>
		</li>`;
	}

	return domUtils.createElement(
		'DIV',
		{
			class: 'se-dropdown se-list-layer se-list-line'
		},
		/*html*/ `
		<div class="se-list-inner">
			<ul class="se-list-basic">${list}</ul>
		</div>`
	);
}

export default HR;
