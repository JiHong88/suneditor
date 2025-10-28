import EditorInjector from '../../editorInjector';
import { dom } from '../../helper';

/**
 * @typedef {Object} BlockStylePluginOptions
 * @property {Array<"p"|"div"|"blockquote"|"pre"|"h1"|"h2"|"h3"|"h4"|"h5"|"h6"|string>} [items] - Format list
 */

/**
 * @class
 * @description BlockStyle Plugin (P, BLOCKQUOTE, PRE, H1, H2...)
 */
class BlockStyle extends EditorInjector {
	static key = 'blockStyle';
	static type = 'dropdown';
	static className = 'se-btn-select se-btn-tool-format';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {BlockStylePluginOptions} pluginOptions - Plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.formats;
		this.inner = '<span class="se-txt">' + this.lang.formats + '</span>' + this.icons.arrow_down;

		// create HTML
		const menu = CreateHTML(editor, pluginOptions.items);

		// members
		this.formatList = menu.querySelectorAll('li button');
		this.currentFormat = '';

		// init
		this.menu.initDropdownTarget(BlockStyle, menu);
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement} [element] - Node element where the cursor is currently located
	 * @param {?HTMLElement} [target] - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element, target) {
		let formatTitle = this.lang.formats;
		const targetText = target.querySelector('.se-txt');

		if (!element) {
			dom.utils.changeTxt(targetText, formatTitle);
		} else if (this.format.isLine(element)) {
			const formatList = this.formatList;
			const nodeName = element.nodeName.toLowerCase();
			const className = (element.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim();

			for (let i = 0, len = formatList.length, f; i < len; i++) {
				f = /** @type {HTMLButtonElement} */ (formatList[i]);
				if (nodeName === f.getAttribute('data-value') && className === f.getAttribute('data-class')) {
					formatTitle = f.title;
					break;
				}
			}

			dom.utils.changeTxt(targetText, formatTitle);
			targetText.setAttribute('data-value', nodeName);
			targetText.setAttribute('data-class', className);

			return true;
		}

		return false;
	}

	/**
	 * @editorMethod Modules.Dropdown
	 * @description Executes the method that is called when a plugin's dropdown menu is opened.
	 * @param {HTMLElement} target Line element at the current cursor position
	 */
	on(target) {
		const formatList = this.formatList;
		const targetText = target.querySelector('.se-txt');
		const currentFormat = (targetText.getAttribute('data-value') || '') + (targetText.getAttribute('data-class') || '');

		if (currentFormat !== this.currentFormat) {
			for (let i = 0, len = formatList.length, f; i < len; i++) {
				f = formatList[i];
				if (currentFormat === f.getAttribute('data-value') + f.getAttribute('data-class')) {
					dom.utils.addClass(f, 'active');
				} else {
					dom.utils.removeClass(f, 'active');
				}
			}

			this.currentFormat = currentFormat;
		}
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - Called when an item in the "dropdown" menu is clicked.
	 * @param {HTMLElement} target - The plugin's toolbar button element
	 */
	action(target) {
		// "line"|"br-line"|"block"
		const command = target.getAttribute('data-command');
		const tag = target.firstElementChild;
		if (command === 'block') {
			this.format.applyBlock(tag);
		} else if (command === 'br-line') {
			this.format.setBrLine(tag);
		} else {
			this.format.setLine(tag);
		}

		this.menu.dropdownOff();
	}

	/**
	 * @description Create a header tag, call by "shortcut" class
	 * - (e.g. shortcuts._h1: ['c+s+49+$~blockStyle.applyHeaderByShortcut', ''])
	 * @param {SunEditor.Plugin.ShortcutInfo} params - Information of the "shortcut" plugin
	 */
	applyHeaderByShortcut({ keyCode }) {
		const headerNum = keyCode.match(/\d+$/)?.[0];
		const tag = dom.utils.createElement(`H${headerNum}`);
		this.format.setLine(tag);
	}
}

function CreateHTML({ lang }, items) {
	const defaultFormats = ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	const formatList = !items || items.length === 0 ? defaultFormats : items;

	let list = /*html*/ `
	<div class="se-list-inner">
		<ul class="se-list-basic">`;

	for (let i = 0, len = formatList.length, format, tagName, command, name, h, attrs, className; i < len; i++) {
		format = formatList[i];

		if (typeof format === 'string' && defaultFormats.includes(format)) {
			tagName = format.toLowerCase();
			command = tagName === 'blockquote' ? 'block' : tagName === 'pre' ? 'br-line' : 'line';
			h = /^h/.test(tagName) ? tagName.match(/\d+/)[0] : '';
			name = lang['tag_' + (h ? 'h' : tagName)] + h;
			className = '';
			attrs = '';
		} else {
			tagName = format.tag.toLowerCase();
			command = format.command;
			name = format.name || tagName;
			className = format.class;
			attrs = className ? ' class="' + className + '"' : '';
		}

		list += /*html*/ `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="${command}" data-value="${tagName}" data-class="${className}" title="${name}" aria-label="${name}">
					<${tagName}${attrs}>${name}</${tagName}>
				</button>
			</li>`;
	}
	list += /*html*/ `
		</ul>
	</div>`;

	return dom.utils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default BlockStyle;
