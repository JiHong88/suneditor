import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

/**
 * @constructor
 * @description Text style Plugin, Applies a tag that specifies text styles to a selection.
 * @param {object} editor editor core object
 * @param {object} pluginOptions
 * @param {Array.<{name: string, html: string}>} pluginOptions.items - Template list
 */
const TextStyle = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.textStyle;
	this.icon = 'text_style';

	// create HTML
	const menu = CreateHTML(editor, pluginOptions.items);

	// members
	this.styleList = menu.querySelectorAll('li button');

	// init
	this.menu.initDropdownTarget(TextStyle, menu);
};

TextStyle.key = 'textStyle';
TextStyle.type = 'dropdown';
TextStyle.className = '';
TextStyle.prototype = {
	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 */
	on() {
		const styleButtonList = this.styleList;
		const selectionNode = this.selection.getNode();

		for (let i = 0, len = styleButtonList.length, btn, data, active; i < len; i++) {
			btn = styleButtonList[i];
			data = btn.getAttribute('data-value').split(',');

			for (let v = 0, node, value; v < data.length; v++) {
				node = selectionNode;
				active = false;

				while (node && !this.format.isLine(node) && !this.component.is(node)) {
					if (node.nodeName.toLowerCase() === btn.getAttribute('data-command').toLowerCase()) {
						value = data[v];
						if (/^\./.test(value) ? domUtils.hasClass(node, value.replace(/^\./, '')) : node.style[value]) {
							active = true;
							break;
						}
					}
					node = node.parentNode;
				}

				if (!active) break;
			}

			active ? domUtils.addClass(btn, 'active') : domUtils.removeClass(btn, 'active');
		}
	},

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * Called when an item in the "dropdown" menu is clicked.
	 * @param {?Element} target - The plugin's toolbar button element
	 */
	action(target) {
		const tempElement = target.firstElementChild;
		const checkStyles = tempElement.style.cssText.replace(/:.+(;|$)/g, ',').split(',');
		checkStyles.pop();

		const classes = tempElement.classList;
		for (let i = 0, len = classes.length; i < len; i++) {
			checkStyles.push('.' + classes[i]);
		}

		const newNode = domUtils.hasClass(target, 'active') ? null : tempElement.cloneNode(false);
		const removeNodes = newNode ? null : [tempElement.nodeName];
		this.format.applyInlineElement(newNode, { stylesToModify: checkStyles, nodesToRemove: removeNodes, strictRemove: true });

		this.menu.dropdownOff();
	},

	constructor: TextStyle
};

function CreateHTML({ lang }, items) {
	const defaultList = {
		code: {
			name: lang.menu_code,
			class: '__se__t-code',
			tag: 'code'
		},
		shadow: {
			name: lang.menu_shadow,
			class: '__se__t-shadow',
			tag: 'span'
		}
	};
	const styleList = items || Object.keys(defaultList);

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = styleList.length, t, tag, name, attrs, command, value; i < len; i++) {
		t = styleList[i];
		attrs = '';
		value = '';
		command = [];

		if (typeof t === 'string') {
			const cssText = defaultList[t.toLowerCase()];
			if (!cssText) continue;
			t = cssText;
		}

		name = t.name;
		tag = t.tag || 'span';

		attrs += ` class="${t.class}"`;
		value += `.${t.class.trim().replace(/\s+/g, ',.')}`;
		command.push('class');

		value = value.replace(/,$/, '');

		list += `
		<li>
			<button 
				type="button" 
				class="se-btn se-btn-list" 
				data-command="${tag}" 
				data-value="${value}" 
				title="${name}" 
				aria-label="${name}"
			>
				<${tag}${attrs}>${name}</${tag}>
			</button>
		</li>`;
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default TextStyle;
