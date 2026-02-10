import { PluginModal } from '../../interfaces';
import { Modal, Controller } from '../../modules/contract';
import { ModalAnchorEditor } from '../../modules/ui';
import { dom, numbers } from '../../helper';

/**
 * @typedef {Object} LinkOptions
 * @property {string} [uploadUrl] - The URL endpoint for file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers for file upload requests.
 * @property {number} [uploadSizeLimit] - The total file upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {string} [acceptedFormats] - Accepted file formats for link uploads.
 */

/**
 * @typedef {Omit<LinkOptions & import('../../modules/ui/ModalAnchorEditor').ModalAnchorEditorParams, ''>} LinkPluginOptions
 */

/**
 * @class
 * @description Link plugin.
 * - This plugin provides link insertion and editing functionality within the editor.
 * - It also supports file uploads if an upload URL is provided.
 */
class Link extends PluginModal {
	static key = 'link';
	static className = 'se-icon-flip-rtl';

	#controllerATarget;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {LinkPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.$.lang.link;
		this.icon = 'link';

		// define plugin options
		pluginOptions.textToDisplay = true;
		pluginOptions.title = true;

		// create HTML
		const modalEl = CreateHTML_modal(this.$);
		const controllerEl = CreateHTML_controller(this.$);

		// members
		const uploadUrl = typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null;
		this.target = null;
		this.isUpdateState = false;
		this.pluginOptions = {
			...pluginOptions,
			uploadUrl,
			uploadHeaders: pluginOptions.uploadHeaders || null,
			uploadSizeLimit: numbers.get(pluginOptions.uploadSizeLimit, 0),
			uploadSingleSizeLimit: numbers.get(pluginOptions.uploadSingleSizeLimit, 0),
			acceptedFormats: typeof pluginOptions.acceptedFormats === 'string' ? pluginOptions.acceptedFormats.trim() : null,
			enableFileUpload: !!uploadUrl,
		};

		// modules
		this.anchor = new ModalAnchorEditor(this.$, modalEl, this.pluginOptions);
		this.modal = new Modal(this, this.$, modalEl);
		this.controller = new Controller(this, this.$, controllerEl, { position: 'bottom', disabled: false });

		this.#controllerATarget = this.controller.form.querySelector('a');
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
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
			this.target = element;

			return true;
		}

		this.controller.close();

		return false;
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.modal.open();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.On}
	 */
	modalOn(isUpdate) {
		this.isUpdateState = isUpdate;
		this.anchor.on(isUpdate);
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		const oA = this.anchor.create(false);
		if (oA === null) return false;

		if (!this.isUpdateState) {
			const selectedFormats = this.$.format.getLines();
			if (selectedFormats.length > 1) {
				if (!this.$.html.insertNode(dom.utils.createElement(selectedFormats[0].nodeName, null, oA), { afterNode: null, skipCharCount: false })) return true;
			} else {
				if (!this.$.html.insertNode(oA, { afterNode: null, skipCharCount: false })) return true;
			}

			this.$.selection.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
		} else {
			// set range
			const textNode = this.controller.currentTarget.childNodes[0];
			this.$.selection.setRange(textNode, 0, textNode, textNode.textContent.length);
		}

		this.$.history.push(false);
		return true;
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Init}
	 */
	modalInit() {
		this.controller.close();
		this.anchor.init();
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');

		if (/update/.test(command)) {
			this.modal.open();
		} else if (/copy/.test(command)) {
			this.$.html.copy(this.target);
		} else if (/unlink/.test(command)) {
			const sc = dom.query.getEdgeChild(
				this.controller.currentTarget,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				false,
			);
			const ec = dom.query.getEdgeChild(
				this.controller.currentTarget,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				true,
			);
			this.$.selection.setRange(sc, 0, ec, ec.textContent.length);
			this.$.inline.apply(null, { stylesToModify: null, nodesToRemove: ['A'], strictRemove: false });
		} else {
			/** delete */
			dom.utils.removeItem(this.controller.currentTarget);
			this.controller.currentTarget = null;
			this.$.focusManager.focus();
			this.$.history.push(false);
		}
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Close}
	 */
	controllerClose() {
		dom.utils.removeClass(this.controller.currentTarget, 'on');
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @returns {HTMLElement}
 */
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

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @returns {HTMLElement}
 */
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
			<button type="button" data-command="copy" tabindex="-1" class="se-btn se-tooltip">
				${icons.copy}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.copy}</span>
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
