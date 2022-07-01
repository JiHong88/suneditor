'use strict';

import EditorInterface from '../../interface/editor';
import { Modal, Controller } from '../../modules';
import { domUtils, env, converter, unicode } from '../../helper';

const math = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.math;
	this.icon = this.icons.math;

	// create HTML
	const modalEl = CreateHTML_modal(editor, this);
	const controllerEl = CreateHTML_controller(editor);

	// members
	this.modal = new Modal(this, modalEl);
	this.controller = new Controller(this, controllerEl, 'bottom');
	this.focusElement = modalEl.querySelector('.se-math-exp');
	this.previewElement = modalEl.querySelector('.se-math-preview');
	this.fontSizeElement = modalEl.querySelector('.se-math-size');
	this.isUpdateState = false;

	// init
	this.previewElement.style.fontSize = this.defaultFontSize;
	this.eventManager.addEvent(this.focusElement, env.isIE ? 'textinput' : 'input', RenderMathExp.bind(this));
	this.eventManager.addEvent(
		this.fontSizeElement,
		'change',
		function (e) {
			this.fontSize = e.target.value;
		}.bind(this.previewElement.style)
	);
};

math.type = 'modal';
math.className = '';
math.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (element && element.getAttribute('data-exp')) {
			this.selection.setRange(element, 0, element, 1);
			this.controller.open(element);
			return true;
		}

		return false;
	},

	/**
	 * @override core
	 */
	managedElement: function () {
		return {
			className: 'katex',
			method: function (element) {
				if (!element.getAttribute('data-exp') || !this.options.katex) return;
				const dom = this._d.createRange().createContextualFragment(this._renderer(converter.entityToHTML(element.getAttribute('data-exp'))));
				element.innerHTML = dom.querySelector('.katex').innerHTML;
			}.bind(this)
		};
	},

	/**
	 * @override modal
	 */
	open: function () {
		this.modal.open();
	},

	/**
	 * @override modal
	 * @param {boolean} isUpdate open state is update
	 */
	on: function (isUpdate) {
		this.isUpdateState = isUpdate;
		if (!isUpdate) {
			this.init();
		} else if (this.controller.currentTarget) {
			const exp = converter.entityToHTML(this.controller.currentTarget.getAttribute('data-exp'));
			const fontSize = this.controller.currentTarget.getAttribute('data-font-size') || '1em';
			this.focusElement.value = exp;
			this.fontSizeElement.value = fontSize;
			this.previewElement.innerHTML = this._renderer(exp);
			this.previewElement.style.fontSize = fontSize;
		}
	},

	/**
	 * @override modal
	 */
	init: function () {
		this.controller.close();
		this.focusElement.value = '';
		this.previewElement.innerHTML = '';
	},

	/**
	 * @Override modal
	 */
	modalAction: function (e) {
		try {
			if (this.focusElement.value.trim().length === 0) return false;

			const mathExp = this.focusElement.value;
			const katexEl = this.previewElement.querySelector('.katex');

			if (!katexEl) return false;
			katexEl.className = '__se__katex ' + katexEl.className;
			katexEl.setAttribute('contenteditable', false);
			katexEl.setAttribute('data-exp', converter.htmlToEntity(mathExp));
			katexEl.setAttribute('data-font-size', this.fontSizeElement.value);
			katexEl.style.fontSize = this.fontSizeElement.value;

			if (!this.isUpdateState) {
				const selectedFormats = this.format.getLines();

				if (selectedFormats.length > 1) {
					const oFormat = domUtils.createElement(selectedFormats[0].nodeName, null, katexEl);
					if (!this.html.insertNode(oFormat, null, false)) return false;
				} else {
					if (!this.html.insertNode(katexEl, null, false)) return false;
				}

				const empty = domUtils.createTextNode(unicode.zeroWidthSpace);
				katexEl.parentNode.insertBefore(empty, katexEl.nextSibling);
				this.selection.setRange(katexEl, 0, katexEl, 1);
			} else {
				const containerEl = domUtils.getParentElement(this.controller.currentTarget, '.katex');
				containerEl.parentNode.replaceChild(katexEl, containerEl);
				this.selection.setRange(katexEl, 0, katexEl, 1);
			}

			return true;
		} catch (e) {
			return false;
		}
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction: function (target) {
		const command = target.getAttribute('data-command');

		if (/update/.test(command)) {
			this.modal.open();
		} else {
			/** delete */
			domUtils.removeItem(this.controller.currentTarget);
			this.controller.close();
			this.editor.focus();

			// history stack
			this.history.push(false);
		}
	},

	_renderer: function (exp) {
		const katex = this.options.katex;
		return katex.src.renderToString(exp, { throwOnError: true, displayMode: true });
	},

	constructor: math
};

function RenderMathExp(e) {
	this.previewElement.innerHTML = this._renderer(e.target.value);
}

function CreateHTML_modal(editor, math) {
	const lang = editor.lang;
	const fontSize = editor.options.mathFontSize;
	let defaultFontSize = fontSize[0].value;

	let html =
		'<form>' +
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close" title="' +
		lang.modalBox.close +
		'" aria-label="' +
		lang.modalBox.close +
		'">' +
		editor.icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.modalBox.mathBox.title +
		'</span>' +
		'</div>' +
		'<div class="se-modal-body">' +
		'<div class="se-modal-form">' +
		'<label>' +
		lang.modalBox.mathBox.inputLabel +
		' (<a href="https://katex.org/docs/supported.html" target="_blank">KaTeX</a>)</label>' +
		'<textarea class="se-input-form se-math-exp" type="text" data-focus></textarea>' +
		'</div>' +
		'<div class="se-modal-form">' +
		'<label>' +
		lang.modalBox.mathBox.fontSizeLabel +
		'</label>' +
		'<select class="se-input-select se-math-size">';
	for (let i = 0, len = fontSize.length, f; i < len; i++) {
		f = fontSize[i];
		if (f.default) defaultFontSize = f.value;
		html += '<option value="' + f.value + '"' + (f.default ? ' selected' : '') + '>' + f.text + '</option>';
	}
	html +=
		'</select>' +
		'</div>' +
		'<div class="se-modal-form">' +
		'<label>' +
		lang.modalBox.mathBox.previewLabel +
		'</label>' +
		'<p class="se-math-preview"></p>' +
		'</div>' +
		'</div>' +
		'<div class="se-modal-footer">' +
		'<button type="submit" class="se-btn-primary" title="' +
		lang.modalBox.submitButton +
		'" aria-label="' +
		lang.modalBox.submitButton +
		'"><span>' +
		lang.modalBox.submitButton +
		'</span></button>' +
		'</div>' +
		'</form>';

	math.defaultFontSize = defaultFontSize;
	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

function CreateHTML_controller(core) {
	const lang = core.lang;
	const html =
		'<div class="se-arrow se-arrow-up"></div>' +
		'<div class="link-content">' +
		'<div class="se-btn-group">' +
		'<button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">' +
		core.icons.edit +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.edit +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">' +
		core.icons.delete +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.remove +
		'</span></span>' +
		'</button>' +
		'</div>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default math;
