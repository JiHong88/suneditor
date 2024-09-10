import EditorInjector from '../../editorInjector';
import { Modal, Controller, ModalAnchorEditor } from '../../modules';
import { domUtils, numbers } from '../../helper';

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

	// members
	const uploadUrl = typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null;
	this.isUpdateState = false;
	this.pluginOptions = {
		...pluginOptions,
		uploadUrl,
		uploadHeaders: pluginOptions.uploadHeaders || null,
		uploadSizeLimit: /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null,
		uploadSingleSizeLimit: /\d+/.test(pluginOptions.uploadSingleSizeLimit) ? numbers.get(pluginOptions.uploadSingleSizeLimit, 0) : null,
		acceptedFormats: typeof pluginOptions.acceptedFormats === 'string' ? pluginOptions.acceptedFormats.trim() : null,
		enableFileUpload: !!uploadUrl
	};

	// modules
	this.anchor = new ModalAnchorEditor(this, modalEl, this.pluginOptions);
	this.modal = new Modal(this, modalEl);
	this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: false });
};

Link.key = 'link';
Link.type = 'modal';
Link.className = 'se-icon-flip-rtl';
Link.prototype = {
	/**
	 * @override core
	 */
	active(element) {
		if (domUtils.isAnchor(element) && !element.hasAttribute('data-se-non-link')) {
			const tempLink = this.controller.form.querySelector('a');
			tempLink.href = element.href;
			tempLink.title = element.textContent;
			tempLink.textContent = element.textContent;

			domUtils.addClass(element, 'on');

			this.anchor.set(element);
			this.controller.open(element, null, { isWWTarget: false, initMethod: null, addOffset: null });

			return true;
		}

		this.controller.close();

		return false;
	},

	/**
	 * @override type = "modal"
	 */
	open() {
		this.modal.open();
	},

	/**
	 * @override modal
	 * @param {boolean} isUpdate open state is update
	 */
	on(isUpdate) {
		this.isUpdateState = isUpdate;
		this.anchor.on(isUpdate);
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	modalAction() {
		const oA = this.anchor.create(false);
		if (oA === null) return false;

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();
			if (selectedFormats.length > 1) {
				if (!this.html.insertNode(domUtils.createElement(selectedFormats[0].nodeName, null, oA), { afterNode: null, skipCharCount: false })) return true;
			} else {
				if (!this.html.insertNode(oA, { afterNode: null, skipCharCount: false })) return true;
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
	init() {
		this.controller.close();
		this.anchor.init();
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction(target) {
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
			this.format.applyInlineElement(null, { stylesToModify: null, nodesToRemove: ['A'], strictRemove: false });
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
	close() {
		domUtils.removeClass(this.controller.currentTarget, 'on');
	},

	constructor: Link
};

function CreateHTML_modal({ lang, icons }) {
	const html = /*html*/ `
	<form>
		<div class="se-modal-header">
			<button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
				${icons.cancel}
			</button>
			<span class="se-modal-title">${lang.link_modal_title}</span>
		</div>
		<div class="se-anchor-editor"></div>
		<div class="se-modal-footer">
			<button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}">
				<span>${lang.submitButton}</span>
			</button>
		</div>
	</form>`;

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

function CreateHTML_controller({ lang, icons }) {
	const html = /*html*/ `
	<div class="se-arrow se-arrow-up"></div>
	<div class="link-content">
		<span><a target="_blank" href=""></a>&nbsp;</span>
		<div class="se-btn-group">
			<button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">
				${icons.edit}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.edit}</span>
				</span>
			</button>
			<button type="button" data-command="unlink" tabindex="-1" class="se-btn se-tooltip se-icon-flip-rtl">
				${icons.unlink}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.unlink}</span>
				</span>
			</button>
			<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">
				${icons.delete}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.remove}</span>
				</span>
			</button>
		</div>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default Link;
