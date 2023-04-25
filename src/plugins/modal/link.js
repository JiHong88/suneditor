import EditorInjector from '../../editorInjector';
import { Modal, Controller, ModalAnchorEditor } from '../../modules';
import { domUtils } from '../../helper';

const Link = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.link;
	this.icon = 'link';

	// define plugin options
	pluginOptions.textToDisplay = true;
	pluginOptions.title = true;
	
	// create HTML
	const modalEl = CreateHTML_modal(editor);
	const controllerEl = CreateHTML_controller(editor);
	
	// modules
	this.anchor = new ModalAnchorEditor(this, modalEl, pluginOptions);
	this.modal = new Modal(this, modalEl);
	this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true });
	
	// members
	this.pluginOptions = pluginOptions;
	this.isUpdateState = false;
};

Link.key = 'link';
Link.type = 'modal';
Link.className = 'se-icon-flip-rtl';
Link.prototype = {
	/**
	 * @override core
	 */
	active: function (element) {
		if (element && domUtils.isAnchor(element)) {
			const tempLink = this.controller.form.querySelector('a');
			tempLink.href = element.href;
			tempLink.title = element.textContent;
			tempLink.textContent = element.textContent;

			domUtils.addClass(element, 'on');

			this.anchor.set(element);
			this.controller.open(element);

			return true;
		}

		return false;
	},

	/**
	 * @override type = "modal"
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
		this.anchor.on(isUpdate);
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	modalAction: function () {
		const oA = this.anchor.create(false);
		if (oA === null) return false;

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();
			if (selectedFormats.length > 1) {
				if (!this.html.insertNode(domUtils.createElement(selectedFormats[0].nodeName, null, oA), null, false)) return true;
			} else {
				if (!this.html.insertNode(oA, null, false)) return true;
			}

			this.selection.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
		} else {
			// set range
			const textNode = this.controller.currentTarget.childNodes[0];
			this.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
		}

		return true;
	},

	/**
	 * @override modal
	 */
	init: function () {
		this.controller.close();
		this.anchor.init();
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
		} else if (/unlink/.test(command)) {
			const sc = domUtils.getEdgeChild(
				this.controller.currentTarget,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false
			);
			const ec = domUtils.getEdgeChild(
				this.controller.currentTarget,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				true
			);
			this.selection.setRange(sc, 0, ec, ec.textContent.length);
			this.format.applyTextStyle(null, null, ['A'], false);
		} else {
			/** delete */
			domUtils.removeItem(this.controller.currentTarget);
			this.controller.currentTarget = null;
			this.editor.focus();
			this.history.push(false);
		}
	},

	/**
	 * @override controller
	 */
	reset: function () {
		domUtils.removeClass(this.controller.currentTarget, 'on');
	},

	constructor: Link
};

function CreateHTML_modal(editor) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html =
		'<form>' +
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close" title="' +
		lang.close +
		'" aria-label="' +
		lang.close +
		'">' +
		icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.link_modal_title +
		'</span>' +
		'</div>' +
		'<div class="se-anchor-editor"></div>' +
		'<div class="se-modal-footer">' +
		'<button type="submit" class="se-btn-primary" title="' +
		lang.submitButton +
		'" aria-label="' +
		lang.submitButton +
		'"><span>' +
		lang.submitButton +
		'</span></button>' +
		'</div>' +
		'</form>';

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
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
		lang.edit +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="unlink" tabindex="-1" class="se-btn se-tooltip se-icon-flip-rtl">' +
		icons.unlink +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.unlink +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">' +
		icons.delete +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.remove +
		'</span></span>' +
		'</button>' +
		'</div>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default Link;
