import EditorInjector from '../../editorInjector';
import { Modal, Controller, ModalAnchorEditor } from '../../modules';
import { dom, numbers } from '../../helper';

/**
 * @typedef {import('../../modules/ModalAnchorEditor').ModalAnchorEditorParams} ModalAnchorEditorParams
 */

/**
 * @typedef {Object} LinkOptions
 * @property {string} [uploadUrl] - The URL endpoint for file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers for file upload requests.
 * @property {number} [uploadSizeLimit] - The total file upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {string} [acceptedFormats] - Accepted file formats for link uploads.
 */

/**
 * @typedef {Omit<LinkOptions & ModalAnchorEditorParams, ''>} LinkPluginOptions
 */

/**
 * @class
 * @description Link plugin.
 * - This plugin provides link insertion and editing functionality within the editor.
 * - It also supports file uploads if an upload URL is provided.
 */
class Link extends EditorInjector {
	static key = 'link';
	static type = 'modal';
	static className = 'se-icon-flip-rtl';

	#controllerATarget;

	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 * @param {LinkPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
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
			uploadSizeLimit: numbers.get(pluginOptions.uploadSizeLimit, 0),
			uploadSingleSizeLimit: numbers.get(pluginOptions.uploadSingleSizeLimit, 0),
			acceptedFormats: typeof pluginOptions.acceptedFormats === 'string' ? pluginOptions.acceptedFormats.trim() : null,
			enableFileUpload: !!uploadUrl
		};

		// modules
		this.anchor = new ModalAnchorEditor(this, modalEl, this.pluginOptions);
		this.modal = new Modal(this, modalEl);
		this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: false });

		this.#controllerATarget = this.controller.form.querySelector('a');
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @returns {boolean} - Whether the plugin is active
	 * - If it returns "undefined", it will no longer be called in this scope.
	 */
	active(element) {
		if (dom.check.isAnchor(element) && !element.hasAttribute('data-se-non-link')) {
			const a = this.#controllerATarget;
			const href = element.getAttribute('href');
			a.href = href;
			a.textContent = a.title = element.textContent;
			a.target = href?.startsWith('#') ? element.target : '_blank';

			dom.utils.addClass(element, 'on');

			this.anchor.set(element);
			this.controller.open(element, null, { isWWTarget: false, initMethod: null, addOffset: null });

			return true;
		}

		this.controller.close();

		return false;
	}

	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a "Modal" module's is opened.
	 */
	open() {
		this.modal.open();
	}

	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate "Indicates whether the modal is for editing an existing component (true) or registering a new one (false)."
	 */
	on(isUpdate) {
		this.isUpdateState = isUpdate;
		this.anchor.on(isUpdate);
	}

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {boolean} Success or failure
	 */
	modalAction() {
		const oA = this.anchor.create(false);
		if (oA === null) return false;

		if (!this.isUpdateState) {
			const selectedFormats = this.format.getLines();
			if (selectedFormats.length > 1) {
				if (!this.html.insertNode(dom.utils.createElement(selectedFormats[0].nodeName, null, oA), { afterNode: null, skipCharCount: false })) return true;
			} else {
				if (!this.html.insertNode(oA, { afterNode: null, skipCharCount: false })) return true;
			}

			this.selection.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
		} else {
			// set range
			const textNode = this.controller.currentTarget.childNodes[0];
			this.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
		}

		this.history.push(false);
		return true;
	}

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init() {
		this.controller.close();
		this.anchor.init();
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Target button element
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');

		if (/update/.test(command)) {
			this.modal.open();
		} else if (/unlink/.test(command)) {
			const sc = dom.query.getEdgeChild(
				this.controller.currentTarget,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false
			);
			const ec = dom.query.getEdgeChild(
				this.controller.currentTarget,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				true
			);
			this.selection.setRange(sc, 0, ec, ec.textContent.length);
			this.inline.apply(null, { stylesToModify: null, nodesToRemove: ['A'], strictRemove: false });
		} else {
			/** delete */
			dom.utils.removeItem(this.controller.currentTarget);
			this.controller.currentTarget = null;
			this.editor.focus();
			this.history.push(false);
		}
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description This function is called before the "controller" before it is closed.
	 */
	close() {
		dom.utils.removeClass(this.controller.currentTarget, 'on');
	}
}

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

	return dom.utils.createElement('DIV', { class: 'se-modal-content' }, html);
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

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default Link;
