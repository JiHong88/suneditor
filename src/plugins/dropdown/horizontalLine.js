import EditorDependency from '../../dependency';
import { domUtils } from '../../helper';

const HorizontalLine = function (editor, target) {
	// plugin bisic properties
	EditorDependency.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.horizontalLine;
	this.icon = this.icons.horizontal_line;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.currentHR = null;

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

HorizontalLine.key = 'horizontalLine';
HorizontalLine.type = 'dropdown';
HorizontalLine.className = '';
HorizontalLine.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (element && /HR/i.test(element.nodeName)) {
			domUtils.addClass(element, 'on');
			this.currentHR = element;
			return true;
		} else {
			domUtils.removeClass(this.currentHR, 'on');
			this.currentHR = null;
		}

		return false;
	},

	/**
	 * @override core
	 * @param {Element} referNode HR element
	 */
	action: function (referNode) {
		this.editor.focus();
		const oNode = this.component.insert(referNode.cloneNode(false), false, false, false);
		if (oNode) {
			this.selection.setRange(oNode, 0, oNode, 0);
			this.menu.dropdownOff();
			if (this.currentHR) domUtils.removeItem(this.currentHR);
		}
	},

	constructor: HorizontalLine
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	this.action(target.firstElementChild);
}

function CreateHTML(editor) {
	const lang = editor.lang;
	const items = editor.options.hrItems || [
		{ name: lang.toolbar.hr_solid, class: '__se__solid' },
		{ name: lang.toolbar.hr_dashed, class: '__se__dashed' },
		{ name: lang.toolbar.hr_dotted, class: '__se__dotted' }
	];

	let list = '';
	for (let i = 0, len = items.length; i < len; i++) {
		list +=
			'<li>' +
			'<button type="button" class="se-btn-list" data-command="horizontalLine" data-value="' +
			items[i].class +
			'" title="' +
			items[i].name +
			'" aria-label="' +
			items[i].name +
			'">' +
			'<hr' +
			(items[i].class ? ' class="' + items[i].class + '"' : '') +
			(items[i].style ? ' style="' + items[i].style + '"' : '') +
			'/>' +
			'</button>' +
			'</li>';
	}

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-line' }, '<div class="se-list-inner">' + '<ul class="se-list-basic">' + list + '</ul>' + '</div>');
}

export default HorizontalLine;
