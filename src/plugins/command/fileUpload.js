import { PluginCommand } from '../../interfaces';
import { dom, env, numbers } from '../../helper';
import { Controller, Figure } from '../../modules/contract';
import { FileManager } from '../../modules/manager';

const { NO_EVENT } = env;

/**
 * @typedef FileUploadPluginOptions
 * @property {string} uploadUrl - Server request URL for file upload
 * @property {Object<string, string>} [uploadHeaders] - Server request headers
 * @property {number} [uploadSizeLimit] - Total upload size limit in bytes
 * @property {number} [uploadSingleSizeLimit] - Single file size limit in bytes
 * @property {boolean} [allowMultiple=false] - Allow multiple file uploads
 * @property {string} [acceptedFormats="*"] - Accepted file formats (e.g., 'image/*, .pdf')
 * @property {string} [as="box"] - Specify the default form of the file component as `box` or `link`
 * @property {Array<string>} [controls] - Additional controls to be added to the figure
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: `options.get('componentInsertBehavior')`]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */

/**
 * @class
 * @description File upload plugin
 */
class FileUpload extends PluginCommand {
	static key = 'fileUpload';
	static className = '';
	static options = { eventIndex: 10000 };

	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return dom.check.isAnchor(node) && node.hasAttribute('data-se-file-download') ? node : null;
	}

	#acceptedCheck;
	#element = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {FileUploadPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.$.lang.fileUpload;
		this.icon = 'file_upload';

		if (!pluginOptions.uploadUrl) console.warn('[SUNEDITOR.fileUpload.warn] "fileUpload" plugin must be have "uploadUrl" option.');

		// members
		this.uploadUrl = pluginOptions.uploadUrl;
		this.uploadHeaders = pluginOptions.uploadHeaders;
		this.uploadSizeLimit = numbers.get(pluginOptions.uploadSizeLimit, 0);
		this.uploadSingleSizeLimit = numbers.get(pluginOptions.uploadSingleSizeLimit, 0);
		this.allowMultiple = !!pluginOptions.allowMultiple;
		this.acceptedFormats = typeof pluginOptions.acceptedFormats !== 'string' ? '*' : pluginOptions.acceptedFormats.trim() || '*';
		this.as = pluginOptions.as || 'box';
		this.insertBehavior = pluginOptions.insertBehavior;
		this.input = dom.utils.createElement('input', { type: 'file', accept: this.acceptedFormats });
		if (this.allowMultiple) {
			this.input.setAttribute('multiple', 'multiple');
		}

		this.#acceptedCheck = this.acceptedFormats.split(', ');

		// figure
		const customItems = {
			'custom-download': {
				command: 'download',
				title: this.$.lang.download,
				icon: 'download',
				action: (target) => {
					const url = target.getAttribute('href');
					if (url) dom.utils.createElement('A', { href: url }, null).click();
				},
			},
			'custom-as': {
				command: 'as',
				value: 'link', // 'block' or 'link'
				title: this.$.lang.asLink,
				icon: 'reduction',
				action: (target, value) => {
					this.convertFormat(target, value);
				},
			},
		};

		const figureControls = (pluginOptions.controls || [['custom-as', 'align', 'edit', 'custom-download', 'copy', 'remove']]).map((subArray) => subArray.map((item) => (item.startsWith('custom-') ? customItems[item] : item)));
		this.figure = new Figure(this, this.$, figureControls, {});

		// file manager
		this.fileManager = new FileManager(this, this.$, {
			query: 'a[download][data-se-file-download]',
			loadEventName: 'onFileLoad',
			actionEventName: 'onFileAction',
		});

		// controller
		if (/\bedit\b/.test(JSON.stringify(figureControls))) {
			const controllerEl = CreateHTML_controller(this.$);
			this.controller = new Controller(this, this.$, controllerEl, { position: 'bottom', disabled: true }, FileUpload.key);
			this.editInput = controllerEl.querySelector('input');
		}

		// init
		this.$.eventManager.addEvent(this.input, 'change', this.#OnChangeFile.bind(this));
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	action() {
		this.$.store.set('_preventBlur', true);
		this.input.click();
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnFilePasteAndDrop}
	 */
	onFilePasteAndDrop({ file }) {
		const fileType = file.type;
		if (
			!this.#acceptedCheck.some((format) => {
				if (format.startsWith('*')) return true;
				if (format.startsWith(fileType)) return true;
			})
		) {
			return;
		}

		this.submitFile([file]);
		this.$.focusManager.focus();
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		if (command === 'edit') {
			if (this.editInput.value.trim().length === 0) return;
			this.#element.textContent = this.editInput.value;
		}

		this.controller.close();
		this.$.component.select(this.#element, FileUpload.key);
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		this.#element = target;

		const asBtn = this.figure.controller.form.querySelector('[data-command="__c__as"]');
		if (!asBtn) return;

		if (dom.check.isFigure(target.parentElement)) {
			asBtn.innerHTML = this.$.icons.reduction + dom.utils.createTooltipInner(this.$.lang.asLink);
			asBtn.setAttribute('data-value', 'link');
			this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, infoOnly: false });
		} else {
			asBtn.innerHTML = this.$.icons.expansion + dom.utils.createTooltipInner(this.$.lang.asBlock);
			asBtn.setAttribute('data-value', 'box');
			this.figure.controllerOpen(target, { isWWTarget: true });
			return true;
		}
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Edit}
	 */
	componentEdit(target) {
		this.editInput.value = target.textContent;
		this.figure.controllerHide();
		this.controller.open(target, null, { isWWTarget: !dom.check.isFigure(target.parentElement), initMethod: null, addOffset: null });
		this.editInput.focus();
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	async componentDestroy(target) {
		if (!target) return;

		const figure = Figure.GetContainer(target);
		const containerTarget = dom.query.getParentElement(target, '.se-component') || target;

		const message = await this.$.eventManager.triggerEvent('onFileDeleteBefore', { element: figure.target, container: figure, url: figure.target.getAttribute('href') });
		if (message === false) return;

		const isInlineComp = this.$.component.isInline(containerTarget);
		const focusEl = isInlineComp ? containerTarget.previousSibling || containerTarget.nextSibling : containerTarget.previousElementSibling || containerTarget.nextElementSibling;
		dom.utils.removeItem(containerTarget);
		this.$.ui.offCurrentController();

		this.$.focusManager.focusEdge(focusEl);
		this.$.history.push(false);
	}

	/**
	 * @description Create a `file` component using the provided files.
	 * @param {File[]|FileList} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitFile(fileList) {
		if (fileList.length === 0) return;

		let fileSize = 0;
		const files = [];
		const slngleSizeLimit = this.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			s = f.size;
			if (slngleSizeLimit > 0 && s > slngleSizeLimit) {
				const err = '[SUNEDITOR.fileUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
				const message = await this.$.eventManager.triggerEvent('onFileUploadError', {
					error: err,
					limitSize: slngleSizeLimit,
					uploadSize: s,
					file: f,
				});

				this.$.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

				return false;
			}

			files.push(f);
			fileSize += s;
		}

		const limitSize = this.uploadSizeLimit;
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.fileUpload.fail] Size of uploadable total files: ' + limitSize / 1000 + 'KB';
			const message = await this.$.eventManager.triggerEvent('onFileUploadError', {
				error: err,
				limitSize,
				currentSize,
				uploadSize: fileSize,
			});

			this.$.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

			return false;
		}

		const fileInfo = {
			url: this.uploadUrl,
			uploadHeaders: this.uploadHeaders,
			files,
		};

		const handler = async function (uploadCallback, infos, newInfos) {
			infos = newInfos || infos;
			const xmlHttp = await this.fileManager.asyncUpload(infos.url, infos.uploadHeaders, infos.files);
			uploadCallback(xmlHttp);
		}.bind(this, this.#uploadCallBack.bind(this), fileInfo);

		const result = await this.$.eventManager.triggerEvent('onFileUploadBefore', {
			info: fileInfo,
			handler,
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);
	}

	/**
	 * @description Convert format to `link` or `block`
	 * @param {HTMLElement} target Target element
	 * @param {string} value `link` or `block`
	 */
	convertFormat(target, value) {
		if (value === 'link') {
			this.figure.close();
			const { container } = Figure.GetContainer(target);
			const next = container.nextElementSibling;
			const parent = container.parentElement;

			target.removeAttribute('data-se-non-focus');
			target.setAttribute('contenteditable', 'false');
			dom.utils.addClass(target, 'se-component|se-inline-component');

			const line = dom.utils.createElement(this.$.options.get('defaultLine'), null, target);
			parent.insertBefore(line, next);
			dom.utils.removeItem(container);
		} else {
			// block
			this.$.selection.setRange(target, 0, target, 1);
			const r = this.$.html.remove();
			const s = this.$.nodeTransform.split(r.container, r.offset, 0);

			if (s?.previousElementSibling && dom.check.isZeroWidth(s.previousElementSibling)) {
				dom.utils.removeItem(s.previousElementSibling);
			}

			target.setAttribute('data-se-non-focus', 'true');
			target.removeAttribute('contenteditable');
			dom.utils.removeClass(target, 'se-component|se-component-selected|se-inline-component');

			const figure = Figure.CreateContainer(target, 'se-file-figure se-flex-component');
			(s || r.container).parentElement.insertBefore(figure.container, s);
		}

		this.$.history.push(false);
		this.$.component.select(target, FileUpload.key);
	}

	/**
	 * @description Create file element
	 * @param {string} url File URL
	 * @param {File|{name: string, size: number}} file File object
	 * @param {boolean} isLast Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(url, file, isLast) {
		const name = file.name || url;
		const a = dom.utils.createElement(
			'A',
			{
				href: url,
				title: name,
				download: name,
				'data-se-file-download': '',
				contenteditable: 'false',
				'data-se-non-focus': 'true',
				'data-se-non-link': 'true',
			},
			name,
		);

		this.fileManager.setFileData(a, file);

		if (this.as === 'link') {
			a.className = 'se-component se-inline-component';
			this.$.component.insert(a, { scrollTo: isLast ? true : false, insertBehavior: isLast ? this.insertBehavior : null });
			return;
		}

		const figure = Figure.CreateContainer(a);
		dom.utils.addClass(figure.container, 'se-file-figure|se-flex-component');

		if (!this.$.component.insert(figure.container, { scrollTo: isLast ? true : false, insertBehavior: isLast ? this.insertBehavior : null })) {
			this.$.focusManager.focus();
			return;
		}

		if (!isLast) return;

		if (!this.$.options.get('componentInsertBehavior')) {
			const line = this.$.format.addLine(figure.container, null);
			if (line) this.$.selection.setRange(line, 0, line, 0);
		} else {
			this.$.component.select(a, FileUpload.key);
		}
	}

	/**
	 * @description Processes the server response after file upload.
	 * - Registers the uploaded files in the editor.
	 * @param {Object<string, *>} response - The response object from the server.
	 */
	#register(response) {
		response.result.forEach((file, i, a) => {
			this.create(
				file.url,
				{
					name: file.name,
					size: file.size,
				},
				i === a.length - 1,
			);
		});
	}

	/**
	 * @description Handles file upload errors.
	 * - Displays an error message if the upload fails.
	 * @param {Object<string, *>} response - The error response from the server.
	 * @returns {Promise<void>}
	 */
	async #error(response) {
		const message = await this.$.eventManager.triggerEvent('onFileUploadError', { error: response });
		if (message === false) return;
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.$.ui.alertOpen(err, 'error');
		console.error('[SUNEDITOR.plugin.fileUpload.error]', err);
	}

	/**
	 * @description Handles the file upload completion callback.
	 * - Parses the response and registers the uploaded file.
	 * @param {XMLHttpRequest} xmlHttp - The completed XHR request.
	 */
	#uploadCallBack(xmlHttp) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this.#error(response);
		} else {
			this.#register(response);
		}
	}

	/**
	 * @description Handles the change event when a file is selected.
	 * - Triggers the file upload process.
	 * @param {InputEvent} e - The change event object.
	 */
	async #OnChangeFile(e) {
		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		await this.submitFile(eventTarget.files);
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @returns {HTMLElement}
 */
function CreateHTML_controller({ lang, icons }) {
	const html = /*html*/ `
		<div class="se-arrow se-arrow-up"></div>
		<form>
			<div class="se-btn-group se-form-group">
				<input type="text" />
				<button type="submit" data-command="edit" class="se-btn se-tooltip se-btn-success">
					${icons.checked}
					<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang.save}</span></span>
				</button>
				<button type="button" data-command="cancel" class="se-btn se-tooltip se-btn-danger">
					${icons.cancel}
					<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang.cancel}</span></span>
				</button>
			</div>
		</form>
		`;

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-simple-input' }, html);
}

export default FileUpload;
