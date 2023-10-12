import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';

const Font = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.font;
	this.icon = '<span class="txt">' + this.lang.font + '</span>' + this.icons.arrow_down;

	// create HTML
	const fontList = pluginOptions.items || ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'];
	const menu = CreateHTML(editor, fontList);

	// members
	this.currentFont = '';
	this.fontList = menu.querySelectorAll('ul li button');
	this.fontArray = fontList;

	// init
	this.menu.initDropdownTarget(Font, menu);
};

Font.key = 'font';
Font.type = 'dropdown';
Font.className = 'se-btn-select se-btn-tool-font';
Font.prototype = {
	/**
	 * @override core
	 */
	active(element, target) {
		const targetText = target.querySelector('.txt');
		const tooltip = target.parentNode.querySelector('.se-tooltip-text');

		if (!element) {
			const font = this.status.hasFocus ? this.editor.frameContext.get('wwComputedStyle').fontFamily : this.lang.font;
			domUtils.changeTxt(targetText, font);
			domUtils.changeTxt(tooltip, this.status.hasFocus ? this.lang.font + (font ? ' (' + font + ')' : '') : font);
		} else if (element?.style.fontFamily.length > 0) {
			const selectFont = element.style.fontFamily.replace(/["']/g, '');
			domUtils.changeTxt(targetText, selectFont);
			domUtils.changeTxt(tooltip, this.lang.font + ' (' + selectFont + ')');
			return true;
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on(target) {
		const fontList = this.fontList;
		const currentFont = target.querySelector('.txt').textContent;

		if (currentFont !== this.currentFont) {
			for (let i = 0, len = fontList.length; i < len; i++) {
				if (currentFont === fontList[i].getAttribute('data-command')) {
					domUtils.addClass(fontList[i], 'active');
				} else {
					domUtils.removeClass(fontList[i], 'active');
				}
			}

			this.currentFont = currentFont;
		}
	},

	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action(target) {
		const value = target.getAttribute('data-command');
		if (value) {
			const newNode = domUtils.createElement('SPAN', { style: 'font-family: ' + value + ';' });
			this.format.applyTextStyle(newNode, ['font-family'], null, null);
		} else {
			this.format.applyTextStyle(null, ['font-family'], ['span'], true);
		}

		this.menu.dropdownOff();
	},

	constructor: Font
};

function CreateHTML({ lang }, fontList) {
	let list = `
	<div class="se-list-inner">
		<ul class="se-list-basic">
			<li>
				<button type="button" class="se-btn se-btn-list default_value" title="${lang.default}" aria-label="${lang.default}">(${lang.default})</button>
			</li>`;

	for (let i = 0, len = fontList.length, font, text; i < len; i++) {
		font = fontList[i];
		text = font.split(',')[0];
		list += `
			<li>
				<button type="button" class="se-btn se-btn-list" data-command="${font}" data-txt="${text}" title="${text}" aria-label="${text}" style="font-family:${font};">${text}</button>
			</li>`;
	}
	list += `
		</ul>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-font-family' }, list);
}

export default Font;
