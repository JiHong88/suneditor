/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import EditorInterface from '../../interface/editor';
import Modal from '../../class/modal';
import AnchorModalEditor from '../../class/anchorModalEditor';
import { domUtils } from '../../helper';

const link = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.link;
	this.icon = this.icons.link;

	// create HTML
	const modalEl = CreateHTML_modal(editor);
	const controllerEl = CreateHTML_controller(editor);

	// members
	this.anchor = new AnchorModalEditor(this, modalEl);
	this.modal = new Modal(this, modalEl);
	this.linkController = controllerEl;
	this.isUpdateState = false;

	// add controller
	this.context.element.relative.appendChild(controllerEl);

	// init
	this.eventManager.addEvent(modalEl.querySelector('form'), 'submit', OnSubmit.bind(this));
	this.eventManager.addEvent(controllerEl, 'click', OnClickController.bind(this));
};

link.type = 'modal';
link.className = '';
link.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (!element) {
			if (this.menu.hasController(this.linkController)) {
				this.menu.controllerOff();
			}
		} else if (domUtils.isAnchor(element) && element.getAttribute('data-image-link') === null) {
			if (!this.menu.hasController(this.linkController)) {
				this.callController(element);
			}
			return true;
		}

		return false;
	},

	/**
	 * @Override modal
	 */
	open: function () {
		this.modal.open();
	},

	/**
	 * @Override modal
	 * @param {boolean} isUpdate open state is update
	 */
	on: function (isUpdate) {
		this.isUpdateState = isUpdate;
		this.anchor.on(isUpdate);
	},

	/**
	 * @Override modal
	 */
	init: function () {
		this.linkController.style.display = 'none';
		this.anchor.init();
	},

	callController: function (selectedEl) {
		this.editLink = this.anchor.linkAnchor = selectedEl;
		const linkController = this.linkController;
		const link = linkController.querySelector('a');

		link.href = selectedEl.href;
		link.title = selectedEl.textContent;
		link.textContent = selectedEl.textContent;

		domUtils.addClass(selectedEl, 'on');
		this.menu.setControllerPosition(linkController, selectedEl, 'bottom', { left: 0, top: 0 });
		this.menu.controllerOn(linkController, selectedEl, 'link', domUtils.removeClass.bind(null, this.anchor.linkAnchor, 'on'));
	},

	constructor: link
};

function OnSubmit(e) {
	this.editor.openLoading();

	e.preventDefault();
	e.stopPropagation();

	try {
		const oA = this.anchor.create(false);
		if (oA === null) return;

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();
			if (selectedFormats.length > 1) {
				if (!this.html.insertNode(domUtils.createElement(selectedFormats[0].nodeName, null, oA), null, true)) return;
			} else {
				if (!this.html.insertNode(oA, null, true)) return;
			}

			this.selection.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
		} else {
			// set range
			const textNode = this.anchor.linkAnchor.childNodes[0];
			this.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
		}
	} finally {
		this.modal.close();
		this.editor.closeLoading();
		// history stack
		this.history.push(false);
	}

	return false;
}

function OnClickController(e) {
	e.stopPropagation();

	const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
	if (!command) return;

	e.preventDefault();

	if (/update/.test(command)) {
		this.modal.open();
	} else if (/unlink/.test(command)) {
		const sc = domUtils.getEdgeChild(
			this.anchor.linkAnchor,
			function (current) {
				return current.childNodes.length === 0 || current.nodeType === 3;
			},
			false
		);
		const ec = domUtils.getEdgeChild(
			this.anchor.linkAnchor,
			function (current) {
				return current.childNodes.length === 0 || current.nodeType === 3;
			},
			true
		);
		this.selection.setRange(sc, 0, ec, ec.textContent.length);
		this.format.applyTextStyle(null, null, ['A'], false);
	} else {
		/** delete */
		domUtils.removeItem(this.anchor.linkAnchor);
		this.anchor.linkAnchor = null;
		this.editor.focus();

		// history stack
		this.history.push(false);
	}

	this.menu.controllerOff();
}

function CreateHTML_modal(editor) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html =
		'' +
		'<form>' +
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close" title="' +
		lang.modalBox.close +
		'" aria-label="' +
		lang.modalBox.close +
		'">' +
		icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.modalBox.linkBox.title +
		'</span>' +
		'</div>' +
		'<div class="se-anchor-editor"></div>' +
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

	return domUtils.createElement('DIV', { class: 'se-modal-content', style: 'display: none;' }, html);
}

function CreateHTML_controller(editor) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html =
		'<div class="se-arrow se-arrow-up"></div>' +
		'<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>' +
		'<div class="se-btn-group">' +
		'<button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">' +
		icons.edit +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.edit +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="unlink" tabindex="-1" class="se-btn se-tooltip">' +
		icons.unlink +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.unlink +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">' +
		icons.delete +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.remove +
		'</span></span>' +
		'</button>' +
		'</div>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default link;
