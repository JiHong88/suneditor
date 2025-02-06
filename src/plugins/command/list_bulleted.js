import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const DEFAULT_TYPE = 'disc';

/**
 * @typedef {import('../../core/class/shortcuts').ShortcutInfo} ShortcutInfo
 */

/**
 * @class
 * @description List bulleted plugin, Several types of lists are provided.
 * @param {object} editor - The root editor instance
 */
function List_bulleted(editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.bulletedList;
	this.icon = 'list_bulleted';
	this.afterItem = domUtils.createElement(
		'button',
		{ class: 'se-btn se-tooltip se-sub-arrow-btn', 'data-command': List_bulleted.key, 'data-type': 'dropdown' },
		`${this.icons.arrow_down}<span class="se-tooltip-inner"><span class="se-tooltip-text">${this.lang.bulletedList}</span></span>`
	);

	// create HTML
	const menu = CreateHTML();

	// members
	this.listItems = menu.querySelectorAll('li button ul');

	// init
	this.menu.initDropdownTarget({ key: List_bulleted.key, type: 'dropdown' }, menu);
}

List_bulleted.key = 'list_bulleted';
List_bulleted.type = 'command';
List_bulleted.className = 'se-icon-flip-rtl';
List_bulleted.prototype = {
	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?Element} element - Node element where the cursor is currently located
	 * @param {?Element} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
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
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
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
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const el = this.format.getBlock(this.selection.getNode());
		const type = target?.querySelector('ul')?.style.listStyleType;

		if (domUtils.isList(el) && type) {
			el.style.listStyleType = type;
		} else {
			this.submit(type);
		}

		this.menu.dropdownOff();
	},

	/**
	 * @editorMethod Editor.core
	 * @description Executes methods called by shortcut keys.
	 * @param {object} params - Information of the "shortcut" plugin
	 * @param {Range} params.range - Range object
	 * @param {Element} params.line - The line element of the current range
	 * @param {ShortcutInfo} params.info - Information of the shortcut
	 * @param {Event} params.event - Key event object
	 * @param {number} params.keyCode - Key code
	 * @param {object} params.editor - The root editor instance
	 */
	shortcut({ range, info }) {
		const { startContainer } = range;
		if (startContainer.nodeType === 3) {
			const newText = startContainer.substringData(info.key.length, startContainer.textContent.length - 1);
			startContainer.textContent = newText;
		}
		this.submit();
	},

	/**
	 * @description Add a bulleted list
	 * @param {string} type List type
	 */
	submit(type) {
		const range = this.format.applyList(`ul:${type || ''}`, null, false);
		if (range) this.selection.setRange(range.sc, range.so, range.ec, range.eo);
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
