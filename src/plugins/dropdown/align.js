import EditorInjector from '../../injector';
import { domUtils } from '../../helper';

const Align = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.align;
	this.icon = this.options.get('_rtl') ? 'align_right' : 'align_left';

	// create HTML
	const menu = CreateHTML(editor, !editor.options.get('_rtl'));
	const commandArea = (this._itemMenu = menu.querySelector('ul'));

	// members
	this.defaultDir = editor.options.get('_rtl') ? 'right' : 'left';
	this.alignIcons = {
		justify: editor.icons.align_justify,
		left: editor.icons.align_left,
		right: editor.icons.align_right,
		center: editor.icons.align_center
	};
	this.alignList = commandArea.querySelectorAll('li button');

	// init
	this.menu.initDropdownTarget(Align, menu);
};

Align.key = 'align';
Align.type = 'dropdown';
Align.className = '';
Align.prototype = {
	/**
	 * @override core
	 * @param {Node} element Selection node.
	 * @param {Element} target Target button.
	 * @returns {boolean}
	 */
	active: function (element, target) {
		const targetChild = target.firstElementChild;

		if (!element) {
			domUtils.changeElement(targetChild, this.alignIcons[this.defaultDir]);
			target.removeAttribute('data-focus');
		} else if (this.format.isLine(element)) {
			const textAlign = element.style.textAlign;
			if (textAlign) {
				domUtils.changeElement(targetChild, this.alignIcons[textAlign] || this.alignIcons[this.defaultDir]);
				target.setAttribute('data-focus', textAlign);
				return true;
			}
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function (target) {
		const currentAlign = target.getAttribute('data-focus') || this.defaultDir;
		if (!currentAlign) return;

		const alignList = this.alignList;
		for (let i = 0, len = alignList.length; i < len; i++) {
			if (currentAlign === alignList[i].getAttribute('data-command')) {
				domUtils.addClass(alignList[i], 'active');
			} else {
				domUtils.removeClass(alignList[i], 'active');
			}
		}
	},

	/**
	 * @override core
	 * @param {"rtl"|"ltr"} dir Direction
	 */
	setDir: function (dir) {
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
	},

	/**
	 * @override core
	 * @param {Element} target Target command button
	 * @returns
	 */
	action: function (target) {
		const value = target.getAttribute('data-command');
		if (!value) return;

		const defaultDir = this.defaultDir;
		const selectedFormsts = this.format.getLines();
		for (let i = 0, len = selectedFormsts.length; i < len; i++) {
			domUtils.setStyle(selectedFormsts[i], 'textAlign', value === defaultDir ? '' : value);
		}

		this.editor.effectNode = null;
		this.menu.dropdownOff();
		this.editor.focus();
		this.history.push(false);
	},

	constructor: Align
};

function CreateHTML(core) {
	const lang = core.lang;
	const icons = core.icons;
	const alignItems = core.options.get('alignItems');

	let html = '';
	for (let i = 0, item, text; i < alignItems.length; i++) {
		item = alignItems[i];
		text = lang['align' + item.charAt(0).toUpperCase() + item.slice(1)];
		html += '<li>' + '<button type="button" class="se-btn se-btn-list" data-command="' + item + '" title="' + text + '" aria-label="' + text + '">' + '<span class="se-list-icon">' + icons['align_' + item] + '</span>' + text + '</button>' + '</li>';
	}

	return domUtils.createElement(
		'div',
		{
			class: 'se-dropdown se-list-layer se-list-align'
		},
		'<div class="se-list-inner">' + '<ul class="se-list-basic">' + html + '</ul>' + '</div>'
	);
}

export default Align;
