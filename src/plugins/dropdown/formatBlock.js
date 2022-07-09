'use strict';

import EditorInterface from '../../interface/editor';
import { domUtils } from '../../helper';

const formatBlock = function (editor, target) {
	EditorInterface.call(this, editor);
	// plugin basic properties
	this.target = target;
	this.title = this.lang.toolbar.formats;
	this.icon = '<span class="txt">' + this.lang.toolbar.formats + '</span>' + this.icons.arrow_down;

	// create HTML
	const menu = CreateHTML(editor);

	// members
	this.targetText = null;
	this.targetTooltip = null;
	this.formatList = menu.querySelectorAll('li button');
	this.currentFormat = '';

	// init
	this.menu.initTarget(target, menu);
	this.eventManager.addEvent(menu.querySelector('ul'), 'click', OnClickMenu.bind(this));
};

formatBlock.type = 'dropdown';
formatBlock.className = 'se-btn-select se-btn-tool-format';
formatBlock.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		let formatTitle = this.lang.toolbar.formats;
		const target = this.targetText;

		if (!element) {
			domUtils.changeTxt(target, formatTitle);
		} else if (this.format.isLine(element)) {
			const formatList = this.formatList;
			const nodeName = element.nodeName.toLowerCase();
			const className = (element.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim();

			for (let i = 0, len = formatList.length, f; i < len; i++) {
				f = formatList[i];
				if (nodeName === f.getAttribute('data-value') && className === f.getAttribute('data-class')) {
					formatTitle = f.title;
					break;
				}
			}

			domUtils.changeTxt(target, formatTitle);
			target.setAttribute('data-value', nodeName);
			target.setAttribute('data-class', className);

			return true;
		}

		return false;
	},

	/**
	 * @override dropdown
	 */
	on: function () {
		const formatList = this.formatList;
		const target = this.targetText;
		const currentFormat = (target.getAttribute('data-value') || '') + (target.getAttribute('data-class') || '');

		if (currentFormat !== this.currentFormat) {
			for (let i = 0, len = formatList.length, f; i < len; i++) {
				f = formatList[i];
				if (currentFormat === f.getAttribute('data-value') + f.getAttribute('data-class')) {
					domUtils.addClass(f, 'active');
				} else {
					domUtils.removeClass(f, 'active');
				}
			}

			this.currentFormat = currentFormat;
		}
	},

	/**
	 * @override core
	 * @param {"line"|"br-line"|"block"} command Format block command
	 * @param {Element} tag Command element
	 */
	action: function (command, value, tag, className) {
		// blockquote
		if (command === 'block') {
			const rangeElement = tag.cloneNode(false);
			this.format.applyBlock(rangeElement);
		}
		// free, replace
		else {
			let range = this.selection.getRange();
			let selectedFormsts = this.format.getLinesAndComponents(false);

			if (selectedFormsts.length === 0) {
				range = this.selection.getRangeAndAddLine(range, null);
				selectedFormsts = this.format.getLinesAndComponents(false);
				if (selectedFormsts.length === 0) return;
			}

			const startOffset = range.startOffset;
			const endOffset = range.endOffset;

			let first = selectedFormsts[0];
			let last = selectedFormsts[selectedFormsts.length - 1];
			const firstPath = domUtils.getNodePath(range.startContainer, first, null, null);
			const lastPath = domUtils.getNodePath(range.endContainer, last, null, null);

			// remove selected list
			const rlist = this.format.removeList(selectedFormsts, false);
			if (rlist.sc) first = rlist.sc;
			if (rlist.ec) last = rlist.ec;

			// change format tag
			this.selection.setRange(domUtils.getNodeFromPath(firstPath, first), startOffset, domUtils.getNodeFromPath(lastPath, last), endOffset);
			const modifiedFormsts = this.format.getLinesAndComponents(false);

			// free format
			if (command === 'br-line') {
				const len = modifiedFormsts.length - 1;
				let parentNode = modifiedFormsts[len].parentNode;
				let freeElement = tag.cloneNode(false);
				const focusElement = freeElement;

				for (let i = len, f, html, before, next, inner, isComp, first = true; i >= 0; i--) {
					f = modifiedFormsts[i];
					if (f === (!modifiedFormsts[i + 1] ? null : modifiedFormsts[i + 1].parentNode)) continue;

					isComp = this.component.is(f);
					html = isComp ? '' : f.innerHTML.replace(/(?!>)\s+(?=<)|\n/g, ' ');
					before = domUtils.getParentElement(f, function (current) {
						return current.parentNode === parentNode;
					});

					if (parentNode !== f.parentNode || isComp) {
						if (domUtils.isFormatElement(parentNode)) {
							parentNode.parentNode.insertBefore(freeElement, parentNode.nextSibling);
							parentNode = parentNode.parentNode;
						} else {
							parentNode.insertBefore(freeElement, before ? before.nextSibling : null);
							parentNode = f.parentNode;
						}

						next = freeElement.nextSibling;
						if (next && freeElement.nodeName === next.nodeName && domUtils.isSameAttributes(freeElement, next)) {
							freeElement.innerHTML += '<BR>' + next.innerHTML;
							domUtils.removeItem(next);
						}

						freeElement = tag.cloneNode(false);
						first = true;
					}

					inner = freeElement.innerHTML;
					freeElement.innerHTML = (first || !html || !inner || /<br>$/i.test(html) ? html : html + '<BR>') + inner;

					if (i === 0) {
						parentNode.insertBefore(freeElement, f);
						next = f.nextSibling;
						if (next && freeElement.nodeName === next.nodeName && domUtils.isSameAttributes(freeElement, next)) {
							freeElement.innerHTML += '<BR>' + next.innerHTML;
							domUtils.removeItem(next);
						}

						const prev = freeElement.previousSibling;
						if (prev && freeElement.nodeName === prev.nodeName && domUtils.isSameAttributes(freeElement, prev)) {
							prev.innerHTML += '<BR>' + freeElement.innerHTML;
							domUtils.removeItem(freeElement);
						}
					}

					if (!isComp) domUtils.removeItem(f);
					if (!!html) first = false;
				}

				this.selection.setRange(focusElement, 0, focusElement, 0);
			}
			// line
			else {
				for (let i = 0, len = modifiedFormsts.length, node, newFormat; i < len; i++) {
					node = modifiedFormsts[i];

					if ((node.nodeName.toLowerCase() !== value.toLowerCase() || (node.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim() !== className) && !this.component.is(node)) {
						newFormat = tag.cloneNode(false);
						domUtils.copyFormatAttributes(newFormat, node);
						newFormat.innerHTML = node.innerHTML;

						node.parentNode.replaceChild(newFormat, node);
					}

					if (i === 0) first = newFormat || node;
					if (i === len - 1) last = newFormat || node;
					newFormat = null;
				}

				this.selection.setRange(domUtils.getNodeFromPath(firstPath, first), startOffset, domUtils.getNodeFromPath(lastPath, last), endOffset);
			}

			// history stack
			this.history.push(false);
		}

		this.menu.dropdownOff();
	},

	/**
	 * @override core
	 */
	init: function () {
		this.targetText = this.target.querySelector('.txt');
		this.targetTooltip = this.target.parentNode.querySelector('.se-tooltip-text');
	},

	constructor: formatBlock
};

function OnClickMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	const target = domUtils.getCommandTarget(e.target);
	if (!target) return;

	this.action(target.getAttribute('data-command'), target.getAttribute('data-value'), target.firstChild, target.getAttribute('data-class'));
}

function CreateHTML(editor) {
	const option = editor.options;
	const lang_toolbar = editor.lang.toolbar;
	const defaultFormats = ['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	const formatList = !option.formats || option.formats.length === 0 ? defaultFormats : option.formats;

	let list = '<div class="se-list-inner"><ul class="se-list-basic">';
	for (let i = 0, len = formatList.length, format, tagName, command, name, h, attrs, className; i < len; i++) {
		format = formatList[i];

		if (typeof format === 'string' && defaultFormats.indexOf(format) > -1) {
			tagName = format.toLowerCase();
			command = tagName === 'blockquote' ? 'block' : tagName === 'pre' ? 'br-line' : 'line';
			h = /^h/.test(tagName) ? tagName.match(/\d+/)[0] : '';
			name = lang_toolbar['tag_' + (h ? 'h' : tagName)] + h;
			className = '';
			attrs = '';
		} else {
			tagName = format.tag.toLowerCase();
			command = format.command;
			name = format.name || tagName;
			className = format.class;
			attrs = className ? ' class="' + className + '"' : '';
		}

		list += '<li>' + '<button type="button" class="se-btn-list" data-command="' + command + '" data-value="' + tagName + '" data-class="' + className + '" title="' + name + '" aria-label="' + name + '">' + '<' + tagName + attrs + '>' + name + '</' + tagName + '>' + '</button></li>';
	}
	list += '</ul></div>';

	return domUtils.createElement('DIV', { class: 'se-dropdown se-list-layer se-list-format' }, list);
}

export default formatBlock;
