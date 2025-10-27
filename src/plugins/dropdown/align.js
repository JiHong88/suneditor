import EditorInjector from '../../editorInjector';
import { dom } from '../../helper';

/**
 * @typedef {Object} AlignPluginOptions
 * @property {Array.<"right"|"center"|"left"|"justify">} [items] - Align items
 */

/**
 * @class
 * @description Align plugin
 */
class Align extends EditorInjector {
	static key = 'align';
	static type = 'dropdown';
	static className = '';

	/**
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {AlignPluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		this.title = this.lang.align;
		this.icon = this.options.get('_rtl') ? 'align_right' : 'align_left';

		// create HTML
		const menu = CreateHTML(editor, pluginOptions.items);
		const commandArea = (this._itemMenu = menu.querySelector('ul'));

		// members
		this.defaultDir = editor.options.get('_rtl') ? 'right' : 'left';
		this.alignIcons = {
			justify: editor.icons.align_justify,
			left: editor.icons.align_left,
			right: editor.icons.align_right,
			center: editor.icons.align_center,
		};
		this.alignList = commandArea.querySelectorAll('li button');

		// init
		this.menu.initDropdownTarget(Align, menu);
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element, target) {
		const targetChild = target.firstElementChild;

		if (!element) {
			dom.utils.changeElement(targetChild, this.alignIcons[this.defaultDir]);
			target.removeAttribute('data-focus');
		} else if (this.format.isLine(element)) {
			const textAlign = /** @type {HTMLElement} */ (element).style.textAlign;
			if (textAlign) {
				dom.utils.changeElement(targetChild, this.alignIcons[textAlign] || this.alignIcons[this.defaultDir]);
				target.setAttribute('data-focus', textAlign);
				return true;
			}
			return undefined;
		}

		return false;
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target) {
		const currentAlign = target.getAttribute('data-focus') || this.defaultDir;
		if (!currentAlign) return;

		const alignList = this.alignList;
		for (let i = 0, len = alignList.length; i < len; i++) {
			if (currentAlign === alignList[i].getAttribute('data-command')) {
				dom.utils.addClass(alignList[i], 'active');
			} else {
				dom.utils.removeClass(alignList[i], 'active');
			}
		}
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the method called when the rtl, ltr mode changes. ("editor.setDir")
	 * @param {string} dir Direction ("rtl" or "ltr")
	 */
	setDir(dir) {
		const _dir = dir === 'rtl' ? 'right' : 'left';
		if (this.defaultDir === _dir) return;

		this.defaultDir = _dir;
		const leftBtn = this._itemMenu.querySelector('[data-command="left"]');
		const rightBtn = this._itemMenu.querySelector('[data-command="right"]');
		if (leftBtn && rightBtn) {
			const lp = leftBtn.parentElement;
			const rp = rightBtn.parentElement;
			lp.appendChild(rightBtn);
			rp.appendChild(leftBtn);
		}
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target) {
		const value = target.getAttribute('data-command');
		if (!value) return;

		const defaultDir = this.defaultDir;
		const selectedFormsts = this.format.getLines();
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			dom.utils.setStyle(selectedFormsts[i], 'textAlign', value === defaultDir ? '' : value);
		}

		this.editor.effectNode = null;
		this.menu.dropdownOff();
		this.editor.focus();
		this.history.push(false);
	}
}

function CreateHTML({ lang, icons, options }, items) {
	const alignItems = Array.isArray(items) ? items : options.get('_rtl') ? ['right', 'center', 'left', 'justify'] : ['left', 'center', 'right', 'justify'];

	let html = '';
	for (let i = 0, item, text; i < alignItems.length; i++) {
		item = alignItems[i];
		text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		html += /*html*/ `
		<li>
			<button type="button" class="se-btn se-btn-list" data-command="${item}" title="${text}" aria-label="${text}">
				<span class="se-list-icon">${icons['align_' + item]}</span>${text}
			</button>
		</li>`;
	}

	return dom.utils.createElement(
		'div',
		{
			class: 'se-dropdown se-list-layer se-list-align',
		},
		/*html*/ `
		<div class="se-list-inner">
			<ul class="se-list-basic">${html}</ul>
		</div>`,
	);
}

export default Align;
