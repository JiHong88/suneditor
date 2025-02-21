import EditorInjector from '../../editorInjector';
import { Modal, Controller, FileManager, Figure, _DragHandle } from '../../modules';
import { domUtils, numbers, env } from '../../helper';
import { CreateTooltipInner } from '../../core/section/constructor';
const { NO_EVENT, ON_OVER_COMPONENT } = env;

/**
 * @typedef {import('../../core/base/events').AudioInfo} AudioInfo
 */

/**
 * @typedef {Object} AudioPluginOptions
 * @property {string} [defaultWidth="300px"] - The default width of the audio tag (e.g., "300px").
 * @property {string} [defaultHeight="150px"] - The default height of the audio tag (e.g., "150px").
 * @property {boolean} [createFileInput] - Whether to create a file input element.
 * @property {boolean} [createUrlInput] - Whether to create a URL input element (default is true if file input is not created).
 * @property {string} [uploadUrl] - The URL to which files will be uploaded.
 * @property {Object<string, string>} [uploadHeaders] - Headers to include in the file upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file size limit in bytes.
 * @property {boolean} [allowMultiple] - Whether to allow multiple file uploads.
 * @property {string} [acceptedFormats="audio/*"] - Accepted file formats (default is "audio/*").
 * @property {Object<string, string>} [audioTagAttributes] - Additional attributes to set on the audio tag.
 */

/**
 * @class
 * @description Audio modal plugin.
 */
class Audio_ extends EditorInjector {
	static key = 'audio';
	static type = 'modal';
	static className = '';
	/**
	 * @this {Audio_}
	 * @param {Node} node - The node to check.
	 * @returns {Node|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return /^AUDIO$/i.test(node?.nodeName) ? node : null;
	}

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {AudioPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.audio;
		this.icon = 'audio';

		// define plugin options
		this.pluginOptions = {
			defaultWidth: !pluginOptions.defaultWidth ? '' : numbers.is(pluginOptions.defaultWidth) ? pluginOptions.defaultWidth + 'px' : pluginOptions.defaultWidth,
			defaultHeight: !pluginOptions.defaultHeight ? '' : numbers.is(pluginOptions.defaultHeight) ? pluginOptions.defaultHeight + 'px' : pluginOptions.defaultHeight,
			createFileInput: !!pluginOptions.createFileInput,
			createUrlInput: pluginOptions.createUrlInput === undefined || !pluginOptions.createFileInput ? true : pluginOptions.createUrlInput,
			uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
			uploadHeaders: pluginOptions.uploadHeaders || null,
			uploadSizeLimit: /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null,
			uploadSingleSizeLimit: /\d+/.test(pluginOptions.uploadSingleSizeLimit) ? numbers.get(pluginOptions.uploadSingleSizeLimit, 0) : null,
			allowMultiple: !!pluginOptions.allowMultiple,
			acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'audio/*' : pluginOptions.acceptedFormats.trim() || 'audio/*',
			audioTagAttributes: pluginOptions.audioTagAttributes || null
		};

		// create HTML
		const modalEl = CreateHTML_modal(editor, this.pluginOptions);
		const controllerEl = CreateHTML_controller(editor);

		// modules
		this.modal = new Modal(this, modalEl);
		this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true });
		this.fileManager = new FileManager(this, {
			query: 'audio',
			loadHandler: this.events.onAudioLoad,
			eventHandler: this.events.onAudioAction
		});

		// members
		this.figure = new Figure(this, null, {});
		this.fileModalWrapper = modalEl.querySelector('.se-flex-input-wrapper');
		this.audioInputFile = modalEl.querySelector('.__se__file_input');
		this.audioUrlFile = modalEl.querySelector('.se-input-url');
		this.preview = modalEl.querySelector('.se-link-preview');
		this.defaultWidth = this.pluginOptions.defaultWidth;
		this.defaultHeight = this.pluginOptions.defaultHeight;
		this.urlValue = '';
		this._element = null;

		const galleryButton = modalEl.querySelector('.__se__gallery');
		if (galleryButton) this.eventManager.addEvent(galleryButton, 'click', this.#OpenGallery.bind(this));

		// init
		if (this.audioInputFile) {
			this.eventManager.addEvent(modalEl.querySelector('.se-modal-files-edge-button'), 'click', this.#RemoveSelectedFiles.bind(this, this.audioUrlFile, this.preview));
			if (this.audioUrlFile) {
				this.eventManager.addEvent(this.audioInputFile, 'change', this.#FileInputChange.bind(this));
			}
		}
		if (this.audioUrlFile) {
			this.eventManager.addEvent(this.audioUrlFile, 'input', this.#OnLinkPreview.bind(this));
		}
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
		if (!isUpdate) {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.setAttribute('multiple', 'multiple');
		} else if (this._element) {
			this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
		} else {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
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
		if (!/^audio/.test(file.type)) return;

		this.submitFile([file]);
		this.editor.focus();

		return false;
	}

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>} Success or failure
	 */
	async modalAction() {
		if (this.audioInputFile && this.audioInputFile?.files.length > 0) {
			return await this.submitFile(this.audioInputFile.files);
		} else if (this.audioUrlFile && this.urlValue.length > 0) {
			return await this.submitURL(this.urlValue);
		}
		return false;
	}

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		if (this.audioInputFile) this.audioInputFile.value = '';
		if (this.audioUrlFile) this.urlValue = this.preview.textContent = this.audioUrlFile.value = '';
		if (this.audioInputFile && this.audioUrlFile) {
			this.audioUrlFile.disabled = false;
			this.preview.style.textDecoration = '';
		}
	}

	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {Node} target Target button element
	 */
	controllerAction(target) {
		if (/update/.test(target.getAttribute('data-command'))) {
			if (this.audioUrlFile) this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			this.open();
		} else {
			this.destroy();
		}
	}

	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {{query: string, method: (element: Node) => void}} The format retention object containing the query and method to process the element.
	 * - query: The selector query to identify the relevant elements (in this case, 'audio').
	 * - method:The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat() {
		return {
			query: 'audio',
			method: (element) => {
				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && figureInfo.cover) return;

				this._setTagAttrs(element);
				const figure = Figure.CreateContainer(element.cloneNode(true), 'se-flex-component');
				this.figure.retainFigureFormat(figure.container, element, null, this.fileManager);
			}
		};
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target) {
		this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, __fileManagerInfo: false });
		this._ready(target);
	}

	/**
	 * @private
	 * @description Prepares the component for selection.
	 * - Ensures that the controller is properly positioned and initialized.
	 * - Prevents duplicate event handling if the component is already selected.
	 * @param {Node} target - The selected element.
	 */
	_ready(target) {
		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) return;
		this._element = target;
		this.controller.open(target, null, { isWWTarget: false, addOffset: null });
	}

	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {Node=} target Target element, if null current selected element
	 * @returns {Promise<void>}
	 */
	async destroy(target) {
		const element = target || this._element;
		const figure = Figure.GetContainer(element);
		const container = figure.container || element;
		const focusEl = container.previousElementSibling || container.nextElementSibling;

		const message = await this.triggerEvent('onAudioDeleteBefore', { element: element, container: figure, url: element.getAttribute('src') });
		if (message === false) return;

		const emptyDiv = container.parentNode;
		domUtils.removeItem(container);
		this.init();
		this.controller.close();

		if (emptyDiv !== this.editor.frameContext.get('wysiwyg')) {
			this.nodeTransform.removeAllParents(
				emptyDiv,
				function (current) {
					return current.childNodes.length === 0;
				},
				null
			);
		}

		// focus
		this.editor.focusEdge(focusEl);
		this.history.push(false);
	}

	/**
	 * @private
	 * @description Registers uploaded audio files and creates the corresponding audio elements.
	 * - Iterates through the uploaded files and inserts them into the editor.
	 * @param {AudioInfo} info - Upload metadata, including `isUpdate` flag and `element`.
	 * @param {Object<string, *>} response - Server response containing uploaded file details.
	 */
	_register(info, response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file, oAudio; i < len; i++) {
			if (info.isUpdate) oAudio = info.element;
			else oAudio = this._createAudioTag();

			file = { name: fileList[i].name, size: fileList[i].size };
			this._createComp(oAudio, fileList[i].url, file, info.isUpdate);
		}
	}

	/**
	 * @description Create an "audio" component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitFile(fileList) {
		if (fileList.length === 0) return false;

		let fileSize = 0;
		const files = [];
		const slngleSizeLimit = this.pluginOptions.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			if (!/audio/i.test(f.type)) continue;

			s = f.size;
			if (slngleSizeLimit && slngleSizeLimit > s) {
				const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
				const message = await this.triggerEvent('onAudioUploadError', {
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

		const limitSize = this.pluginOptions.uploadSizeLimit;
		if (limitSize > 0 && fileSize + this.fileManager.getSize() > limitSize) {
			const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable total audios: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onAudioUploadError', { error: err, limitSize, currentSize: this.fileManager.getSize(), uploadSize: fileSize });

			this.ui.noticeOpen(message === NO_EVENT ? err : message || err);

			return false;
		}

		const audioInfo = {
			files,
			isUpdate: this.modal.isUpdate,
			element: this._element
		};

		const handler = function (newInfos, infos) {
			infos = newInfos || infos;
			this._serverUpload(infos, infos.files);
		}.bind(this, audioInfo);

		const result = await this.triggerEvent('onAudioUploadBefore', {
			info: audioInfo,
			handler
		});

		if (typeof result === 'undefined') return true;
		if (!result) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	}

	/**
	 * @description Create an "audio" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>}
	 */
	async submitURL(url) {
		if (url.length === 0) return false;

		const file = { name: url.split('/').pop(), size: 0 };
		const audioInfo = {
			url,
			files: file,
			isUpdate: this.modal.isUpdate,
			element: this._createAudioTag()
		};

		const handler = function (newInfos, infos) {
			infos = newInfos || infos;
			this._createComp(infos.element, infos.url, infos.files, infos.isUpdate);
		}.bind(this, audioInfo);

		const result = await this.triggerEvent('onAudioUploadBefore', {
			info: audioInfo,
			handler
		});

		if (typeof result === 'undefined') return true;
		if (!result) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	}

	/**
	 * @private
	 * @description Creates or updates an audio component within the editor.
	 * - If `isUpdate` is `true`, updates the existing element's `src`.
	 * - Otherwise, inserts a new audio component with the given file.
	 * @param {Node} element - The target audio element.
	 * @param {string} src - The source URL of the audio file.
	 * @param {{name: string, size: number}} file - The file metadata (name, size).
	 * @param {boolean} isUpdate - Whether to update an existing element.
	 */
	_createComp(element, src, file, isUpdate) {
		// create new tag
		if (!isUpdate) {
			this.fileManager.setFileData(element, file);
			element.src = src;
			const figure = Figure.CreateContainer(element, 'se-flex-component');
			if (!this.component.insert(figure.container, { skipCharCount: false, skipSelection: !this.options.get('componentAutoSelect'), skipHistory: false })) {
				this.editor.focus();
				return;
			}
			if (!this.options.get('componentAutoSelect')) {
				const line = this.format.addLine(figure.container, null);
				if (line) this.selection.setRange(line, 0, line, 0);
			}
		} else {
			if (this._element) element = this._element;
			this.fileManager.setFileData(element, file);
			if (element && element.src !== src) {
				element.src = src;
				this.component.select(element, Audio_.key, false);
			} else {
				this.component.select(element, Audio_.key, false);
				return;
			}
		}

		if (isUpdate) this.history.push(false);
	}

	/**
	 * @private
	 * @description Creates a new `<audio>` element with default attributes.
	 * - Applies width, height, and additional attributes from plugin options.
	 * @returns {HTMLElement} - The newly created `<audio>` element.
	 */
	_createAudioTag() {
		const w = this.defaultWidth;
		const h = this.defaultHeight;
		const oAudio = domUtils.createElement('AUDIO', { style: (w ? 'width:' + w + '; ' : '') + (h ? 'height:' + h + ';' : '') });
		this._setTagAttrs(oAudio);
		return oAudio;
	}

	/**
	 * @private
	 * @description Sets attributes on an audio element based on plugin options.
	 * - Adds the `controls` attribute and applies any custom attributes.
	 * @param {Node} element - The `<audio>` element to modify.
	 */
	_setTagAttrs(element) {
		element.setAttribute('controls', 'true');

		const attrs = this.pluginOptions.audioTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	}

	/**
	 * @private
	 * @description Uploads audio files to the server.
	 * - Sends a request to the configured upload URL and processes the response.
	 * @param {AudioInfo} info - Upload metadata, including `files` and `isUpdate`.
	 * @param {FileList|File[]} files - The files to be uploaded.
	 */
	_serverUpload(info, files) {
		if (!files) return;

		const uploadFiles = this.modal.isUpdate ? [files[0]] : files;
		this.fileManager.upload(this.pluginOptions.uploadUrl, this.pluginOptions.uploadHeaders, uploadFiles, this.#UploadCallBack.bind(this, info), this._error.bind(this));
	}

	/**
	 * @private
	 * @description Handles errors that occur during the audio upload process.
	 * - Triggers the `onAudioUploadError` event to allow custom handling of errors.
	 * - Displays an error message in the editor's UI.
	 * - Logs the error to the console for debugging.
	 * @param {Object<string, *>} response - The error response object from the server or upload process.
	 * @returns {Promise<void>}
	 */
	async _error(response) {
		const message = await this.triggerEvent('onAudioUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.ui.noticeOpen(err);
		console.error('[SUNEDITOR.plugin.audio.error]', err);
	}

	/**
	 * @description Handles the server response after a file upload.
	 * - If the upload is successful, registers the uploaded audio.
	 * - If an error occurs, triggers an error event.
	 * @param {AudioInfo} info - Upload metadata.
	 * @param {XMLHttpRequest} xmlHttp - The completed XHR request.
	 */
	async #UploadCallBack(info, xmlHttp) {
		if ((await this.triggerEvent('audioUploadHandler', { xmlHttp, info })) === NO_EVENT) {
			const response = JSON.parse(xmlHttp.responseText);
			if (response.errorMessage) {
				this._error(response);
			} else {
				this._register(info, response);
			}
		}
	}

	/**
	 * @description Updates the preview text for the entered audio URL.
	 * - Formats the URL correctly based on the editor’s settings.
	 * @param {InputEvent} e - The input event triggered when the user types a URL.
	 */
	#OnLinkPreview(e) {
		const value = domUtils.getEventTarget(e).value.trim();
		this.urlValue = this.preview.textContent = !value
			? ''
			: this.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
			? this.options.get('defaultUrlProtocol') + value
			: !value.includes('://')
			? '/' + value
			: value;
	}

	/**
	 * @description Opens the audio gallery plugin, if available.
	 * - Calls a function to populate the URL input with the selected audio file.
	 */
	#OpenGallery() {
		this.plugins.audioGallery.open(this.#SetUrlInput.bind(this));
	}

	/**
	 * @param {Node} target - The target element.
	 */
	#SetUrlInput(target) {
		this.urlValue = this.preview.textContent = this.audioUrlFile.value = target.getAttribute('data-command') || target.src;
		this.audioUrlFile.focus();
	}

	/**
	 * @description Clears the selected file input and re-enables the URL input.
	 * - Ensures that only one input method (file or URL) is used at a time.
	 * @param {Node} urlInput - The URL input field.
	 * @param {Node} preview - The preview text element.
	 */
	#RemoveSelectedFiles(urlInput, preview) {
		this.audioInputFile.value = '';
		if (urlInput) {
			urlInput.disabled = false;
			preview.style.textDecoration = '';
		}

		// inputFile check
		Modal.OnChangeFile(this.fileModalWrapper, []);
	}

	/**
	 * @param {InputEvent} e - Event object
	 */
	#FileInputChange(e) {
		const target = domUtils.getEventTarget(e);
		if (!this.audioInputFile.value) {
			this.audioUrlFile.disabled = false;
			this.preview.style.textDecoration = '';
		} else {
			this.audioUrlFile.disabled = true;
			this.preview.style.textDecoration = 'line-through';
		}

		// inputFile check
		Modal.OnChangeFile(this.fileModalWrapper, target.files);
	}
}

function CreateHTML_modal({ lang, icons, plugins }, pluginOptions) {
	let html = /*html*/ `
    <form method="post" enctype="multipart/form-data">
        <div class="se-modal-header">
            <button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
                ${icons.cancel}
            </button>
            <span class="se-modal-title">${lang.audio_modal_title}</span>
        </div>
        <div class="se-modal-body">`;
	if (pluginOptions.createFileInput) {
		html += /*html*/ `
        <div class="se-modal-form">
            <label>${lang.audio_modal_file}</label>
            ${Modal.CreateFileInput({ lang, icons }, pluginOptions)}
        </div>`;
	}
	if (pluginOptions.createUrlInput) {
		html += /*html*/ `
        <div class="se-modal-form">
            <label>${lang.audio_modal_url}</label>
			<div class="se-modal-form-files">
				<input class="se-input-form se-input-url" data-focus type="text" />
				${
					plugins.audioGallery
						? `<button type="button" class="se-btn se-tooltip se-modal-files-edge-button __se__gallery" aria-label="${lang.audioGallery}">
							${icons.audio_gallery}
							${CreateTooltipInner(lang.audioGallery)}
							</button>`
						: ''
				}
			</div>
            <pre class="se-link-preview"></pre>
        </div>`;
	}
	html += /*html*/ `
        </div>
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
        <div class="se-btn-group">
            <button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">
                ${icons.edit}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.edit}</span>
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

	return domUtils.createElement('DIV', { class: 'se-controller' }, html);
}

export default Audio_;
