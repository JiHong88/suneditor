import EditorInjector from '../../editorInjector';
import { CreateTooltipInner } from '../../core/section/constructor';
import { domUtils, env, numbers } from '../../helper';
import { FileManager, Figure, Controller } from '../../modules';

const { NO_EVENT } = env;

/**
 * @class
 * @description File upload plugin
 */
class FileUpload extends EditorInjector {
	static key = 'fileUpload';
	static type = 'command';
	static className = '';
	static options = { eventIndex: 10000 };
	/**
	 * @this {FileUpload}
	 * @param {Node} node - The node to check.
	 * @returns {Node|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return domUtils.isAnchor(node) && node.hasAttribute('data-se-file-download') ? node : null;
	}

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions - plugin options
	 * @param {string} pluginOptions.uploadUrl - server request url
	 * @param {Object<string, string>=} pluginOptions.uploadHeaders - server request headers
	 * @param {string=} pluginOptions.uploadSizeLimit - upload size limit
	 * @param {string=} pluginOptions.uploadSingleSizeLimit - upload single size limit
	 * @param {boolean=} pluginOptions.allowMultiple - allow multiple files
	 * @param {string=} pluginOptions.acceptedFormats - accepted formats
	 * @param {string=} pluginOptions.as - Whether to use the 'Box' or 'Link' conversion button
	 * @param {Array<string>} pluginOptions.controls - Additional controls to be added to the figure
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.fileUpload;
		this.icon = 'file_upload';

		if (!pluginOptions.uploadUrl) console.warn('[SUNEDITOR.fileUpload.warn] "fileUpload" plugin must be have "uploadUrl" option.');

		// members
		this.uploadUrl = pluginOptions.uploadUrl;
		this.uploadHeaders = pluginOptions.uploadHeaders;
		this.uploadSizeLimit = /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null;
		this.uploadSingleSizeLimit = /\d+/.test(pluginOptions.uploadSingleSizeLimit) ? numbers.get(pluginOptions.uploadSingleSizeLimit, 0) : null;
		this.allowMultiple = !!pluginOptions.allowMultiple;
		this.acceptedFormats = typeof pluginOptions.acceptedFormats !== 'string' ? '*' : pluginOptions.acceptedFormats.trim() || '*';
		this._acceptedCheck = this.acceptedFormats.split(', ');
		this.as = pluginOptions.as || 'box';
		this.input = domUtils.createElement('input', { type: 'file', accept: this.acceptedFormats });
		if (this.allowMultiple) {
			this.input.setAttribute('multiple', 'multiple');
		}
		this._element = null;

		// figure
		const customItems = {
			'custom-download': {
				command: 'download',
				title: this.lang.download,
				icon: 'download',
				action: (target) => {
					const url = target.getAttribute('href');
					if (url) domUtils.createElement('A', { href: url }, null).click();
				}
			},
			'custom-as': {
				command: 'as',
				value: 'link', // 'block' or 'link'
				title: this.lang.asLink,
				icon: 'reduction',
				action: (target, value) => {
					this.convertFormat(target, value);
				}
			}
		};

		const figureControls = (pluginOptions.controls || [['custom-as', 'edit', 'align', 'remove', 'custom-download']]).map((subArray) => subArray.map((item) => (item.startsWith('custom-') ? customItems[item] : item)));
		this.figure = new Figure(this, figureControls, {});

		// file manager
		this.fileManager = new FileManager(this, {
			query: 'a[download][data-se-file-download]',
			loadHandler: this.events.onFileLoad,
			eventHandler: this.events.onFileAction
		});

		// controller
		if (/\bedit\b/.test(JSON.stringify(figureControls))) {
			const controllerEl = CreateHTML_controller(this);
			this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true }, FileUpload.key);
			this.editInput = controllerEl.querySelector('input');
		}

		// init
		this.eventManager.addEvent(this.input, 'change', this.#OnChangeFile.bind(this));
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - It is executed by clicking a toolbar "command" button or calling an API.
	 */
	action() {
		this.editor._preventBlur = true;
		this.input.click();
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target) {
		this._element = target;
		const asBtn = this.figure.controller.form.querySelector('[data-command="__c__as"]');
		if (domUtils.isFigure(target.parentElement)) {
			asBtn.innerHTML = this.icons.reduction + CreateTooltipInner(this.lang.asLink);
			asBtn.setAttribute('data-value', 'link');
			this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, __fileManagerInfo: false });
		} else {
			asBtn.innerHTML = this.icons.expansion + CreateTooltipInner(this.lang.asBlock);
			asBtn.setAttribute('data-value', 'box');
			this.figure.controllerOpen(target, { isWWTarget: true });
			return true;
		}
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "paste" or "drop".
	 * @param {Object} params { frameContext, event, file }
	 * @param {FrameContext} params.frameContext Frame context
	 * @param {ClipboardEvent} params.event Event object
	 * @param {File} params.file File object
	 * @returns {boolean} - If return false, the file upload will be canceled
	 */
	onPastAndDrop({ file }) {
		const fileType = file.type;
		if (
			!this._acceptedCheck.some((format) => {
				if (format.startsWith('*')) return true;
				if (format.startsWith(fileType)) return true;
			})
		) {
			return;
		}

		this.submitFile([file]);
		this.editor.focus();

		return false;
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a target component is edited.
	 * @param {HTMLElement|Text} target Target element
	 */
	edit(target) {
		this.editInput.value = target.textContent;
		this.figure.controllerHide();
		this.controller.open(target, null, { isWWTarget: !domUtils.isFigure(target.parentElement), initMethod: null, addOffset: null });
		this.editInput.focus();
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLElement} target Target button element
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		if (command === 'edit') {
			if (this.editInput.value.trim().length === 0) return;
			this._element.textContent = this.editInput.value;
		}

		this.controller.close();
		this.component.select(this._element, FileUpload.key, false);
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {Node} target Target element
	 * @returns {Promise<void>}
	 */
	async destroy(target) {
		if (!target) return;

		const figure = Figure.GetContainer(target);
		const containerTarget = domUtils.getParentElement(target, '.se-component') || target;

		const message = await this.triggerEvent('onFileDeleteBefore', { element: figure.target, container: figure, url: figure.target.getAttribute('href') });
		if (message === false) return;

		const isInlineComp = this.component.isInline(containerTarget);
		const focusEl = isInlineComp ? containerTarget.previousSibling || containerTarget.nextSibling : containerTarget.previousElementSibling || containerTarget.nextElementSibling;
		domUtils.removeItem(containerTarget);
		this.ui._offCurrentController();

		this.editor.focusEdge(focusEl);
		this.history.push(false);
	}

	/**
	 * @description Create an "file" component using the provided files.
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
			if (slngleSizeLimit && slngleSizeLimit > s) {
				const err = '[SUNEDITOR.fileUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
				const message = await this.triggerEvent('onFileUploadError', {
					error: err,
					limitSize: slngleSizeLimit,
					uploadSize: s,
					file: f
				});

				this.ui.noticeOpen(message === NO_EVENT ? err : message || err);

				return false;
			}

			files.push(f);
			fileSize += s;
		}

		const limitSize = this.uploadSizeLimit;
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.fileUpload.fail] Size of uploadable total files: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onFileUploadError', {
				error: err,
				limitSize,
				currentSize,
				uploadSize: fileSize
			});

			this.ui.noticeOpen(message === NO_EVENT ? err : message || err);

			return false;
		}

		const fileInfo = {
			url: this.uploadUrl,
			uploadHeaders: this.uploadHeaders,
			files
		};

		const handler = async function (uploadCallback, infos, newInfos) {
			infos = newInfos || infos;
			const xmlHttp = await this.fileManager.asyncUpload(infos.url, infos.uploadHeaders, infos.files);
			uploadCallback(xmlHttp);
		}.bind(this, this.#_uploadCallBack.bind(this), fileInfo);

		const result = await this.triggerEvent('onFileUploadBefore', {
			info: fileInfo,
			handler
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);
	}

	/**
	 * @description Convert format to link or block
	 * @param {HTMLElement} target Target element
	 * @param {string} value 'link' or 'block'
	 */
	convertFormat(target, value) {
		if (value === 'link') {
			this.figure.close();
			const { container } = Figure.GetContainer(target);
			const next = container.nextElementSibling;
			const parent = container.parentElement;

			target.removeAttribute('data-se-non-focus');
			target.setAttribute('contenteditable', 'false');
			domUtils.addClass(target, 'se-component|se-inline-component');

			const line = domUtils.createElement(this.options.get('defaultLine'), null, target);
			parent.insertBefore(line, next);
			domUtils.removeItem(container);
		} else {
			// block
			this.selection.setRange(target, 0, target, 1);
			const r = this.html.remove();
			const s = this.nodeTransform.split(r.container, r.offset, 0);

			if (s?.previousElementSibling && domUtils.isZeroWidth(s.previousElementSibling)) {
				domUtils.removeItem(s.previousElementSibling);
			}

			target.setAttribute('data-se-non-focus', 'true');
			target.removeAttribute('contenteditable');
			domUtils.removeClass(target, 'se-component|se-component-selected|se-inline-component');

			const figure = Figure.CreateContainer(target, 'se-file-figure se-flex-component');
			(s || r.container).parentElement.insertBefore(figure.container, s);
		}

		this.history.push(false);
		this.component.select(target, FileUpload.key, false);
	}

	/**
	 * @description Create file element
	 * @param {string} url File URL
	 * @param {File|{name: string, size: number}} file File object
	 * @param {boolean} isLast Is last file
	 */
	create(url, file, isLast) {
		const name = file.name || url;
		const a = domUtils.createElement(
			'A',
			{
				href: url,
				title: name,
				download: name,
				'data-se-file-download': '',
				contenteditable: 'false',
				'data-se-non-focus': 'true',
				'data-se-non-link': 'true'
			},
			name
		);

		this.fileManager.setFileData(a, file);

		if (this.as === 'link') {
			a.className = 'se-component se-inline-component';
			this.component.insert(a, { skipCharCount: false, skipSelection: false, skipHistory: false });
			return;
		}

		const figure = Figure.CreateContainer(a);
		domUtils.addClass(figure.container, 'se-file-figure|se-flex-component');

		if (!this.component.insert(figure.container, { skipCharCount: false, skipSelection: isLast ? !this.options.get('componentAutoSelect') : true, skipHistory: false })) {
			this.editor.focus();
			return;
		}

		if (!isLast) return;

		if (!this.options.get('componentAutoSelect')) {
			const line = this.format.addLine(figure.container, null);
			if (line) this.selection.setRange(line, 0, line, 0);
		} else {
			this.component.select(a, FileUpload.key, false);
		}
	}

	/**
	 * @private
	 * @description Processes the server response after file upload.
	 * - Registers the uploaded files in the editor.
	 * @param {Object<string, *>} response - The response object from the server.
	 */
	_register(response) {
		response.result.forEach((file, i, a) => {
			this.create(
				file.url,
				{
					name: file.name,
					size: file.size
				},
				i === a.length - 1
			);
		});
	}

	/**
	 * @private
	 * @description Handles file upload errors.
	 * - Displays an error message if the upload fails.
	 * @param {Object<string, *>} response - The error response from the server.
	 * @returns {Promise<void>}
	 */
	async _error(response) {
		const message = await this.triggerEvent('onFileUploadError', { error: response });
		if (message === false) return;
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.ui.noticeOpen(err);
		console.error('[SUNEDITOR.plugin.fileUpload.error]', err);
	}

	/**
	 * @description Handles the file upload completion callback.
	 * - Parses the response and registers the uploaded file.
	 * @param {XMLHttpRequest} xmlHttp - The completed XHR request.
	 */
	#_uploadCallBack(xmlHttp) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response);
		} else {
			this._register(response);
		}
	}

	/**
	 * @description Handles the change event when a file is selected.
	 * - Triggers the file upload process.
	 * @param {InputEvent} e - The change event object.
	 */
	async #OnChangeFile(e) {
		const eventTarget = domUtils.getEventTarget(e);
		await this.submitFile(eventTarget.files);
	}
}

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

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-simple-input' }, html);
}

export default FileUpload;
