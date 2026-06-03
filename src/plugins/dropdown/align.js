import { PluginDropdown } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @typedef {Object} AlignPluginOptions
 * @property {Array.<"right"|"center"|"left"|"justify">} [items] - Align items
 */

/**
 * @class
 * @description Align plugin
 */
class Align extends PluginDropdown {
	static key = 'align';
	static className = '';

	/**
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {AlignPluginOptions} pluginOptions - Plugin options
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);
		this.title = this.$.lang.align;
		this.icon = this.$.options.get('_rtl') ? 'align_right' : 'align_left';

		// members
		this.defaultDir = '';
		this.alignIcons = {
			justify: this.$.icons.align_justify,
			left: this.$.icons.align_left,
			right: this.$.icons.align_right,
			center: this.$.icons.align_center,
		};

		// create menu from items
		const menu = this.$.menu.initDropdownTarget(Align, CreateItems(this.$, pluginOptions.items), {
			className: 'se-list-align',
		});
		this._itemMenu = menu.querySelector('ul');
		this.alignList = menu.querySelectorAll('li button');
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		const targetChild = target.firstElementChild;

		if (!element) {
			dom.utils.changeElement(targetChild, this.alignIcons[this.defaultDir]);
			target.removeAttribute('data-focus');
		} else if (this.$.format.isLine(element)) {
			const textAlign = element.style.textAlign;
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
	 * @override
	 * @type {PluginDropdown['on']}
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
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const value = target.getAttribute('data-command');
		if (!value) return;

		const defaultDir = this.defaultDir;
		const selectedFormsts = this.$.format.getLines();
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			dom.utils.setStyle(selectedFormsts[i], 'textAlign', value === defaultDir ? '' : value);
		}

		this.$.store.set('_lastSelectionNode', null);
		this.$.menu.dropdownOff();
		this.$.focusManager.focus();
		this.$.history.push(false);
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.SetDir}
	 */
	setDir() {
		const _dir = this.#findDefaultDir();
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
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.Init}
	 */
	init() {
		this.defaultDir = this.#findDefaultDir();
	}

	#findDefaultDir() {
		const align = this.$.frameContext.get('wwComputedStyle').getPropertyValue('text-align');
		const valid = ['left', 'center', 'right', 'justify'];
		return valid.includes(align) ? align : this.$.options.get('_rtl') ? 'right' : 'left';
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {string[]} [items] - Align items list
 * @returns {Array<import('../../core/logic/panel/menu').DropdownItem>}
 */
function CreateItems({ lang, icons, options }, items) {
	const alignItems = Array.isArray(items)
		? items
		: options.get('_rtl')
			? ['right', 'center', 'left', 'justify']
			: ['left', 'center', 'right', 'justify'];
	return alignItems.map((item) => {
		const text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		return {
			command: item,
			title: text,
			innerHTML: `<span class="se-list-icon">${icons['align_' + item]}</span>${text}`,
		};
	});
}

export default Align;
