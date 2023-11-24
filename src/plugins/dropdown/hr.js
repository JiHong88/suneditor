import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const HR = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.horizontalLine;
	this.icon = 'horizontal_line';

	// create HTML
	const HRMenus = CreateHTML(editor, pluginOptions.items);

	// members
	this.list = HRMenus.querySelectorAll('button');

	// init
	this.menu.initDropdownTarget(HR, HRMenus);
};

HR.key = 'hr';
HR.type = 'dropdown';
HR.className = '';
HR.component = (node) => (/^hr$/i.test(node?.nodeName) ? HR.key : '');
HR.prototype = {
	/**
	 * @override component
	 * @description Called when a container is selected.
	 * @param {Element} element Target element
	 */
	select(element) {
		domUtils.addClass(element, 'on');
	},

	/**
	 * @override component
	 * @description Called when a container is deselected.
	 * @param {Element} element Target element
	 */
	deselect(element) {
		domUtils.removeClass(element, 'on');
	},

	destroy(element) {
		if (!element) return;

		const focusEl = element.previousElementSibling || element.nextElementSibling;
		domUtils.removeItem(element);

		// focus
		this.editor.focusEdge(focusEl);
		this.history.push(false);
	},

	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action(target) {
		const hr = target.firstElementChild.cloneNode(false);
		this.editor.focus();
		this.component.insert(hr, false, false);
		this.menu.dropdownOff();

		const line = this.format.addLine(hr);
		this.selection.setRange(line, 1, line, 1);
	},

	constructor: HR
};

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
