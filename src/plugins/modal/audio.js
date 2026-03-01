import { PluginModal } from '../../interfaces';
import { Modal, Controller, Figure } from '../../modules/contract';
import { FileManager } from '../../modules/manager';
import { _DragHandle } from '../../modules/ui';
import { dom, numbers, env } from '../../helper';
const { NO_EVENT, ON_OVER_COMPONENT } = env;

/**
 * @typedef {Object} AudioPluginOptions
 * @property {string} [defaultWidth="300px"] - The default width of the `AUDIO` tag (e.g., `"300px"`).
 * @property {string} [defaultHeight="150px"] - The default height of the `AUDIO` tag (e.g., `"150px"`).
 * @property {boolean} [createFileInput] - Whether to create a file input element.
 * @property {boolean} [createUrlInput] - Whether to create a URL input element (default is `true` if file input is not created).
 * @property {string} [uploadUrl] - The URL to which files will be uploaded.
 * @property {Object<string, string>} [uploadHeaders] - Headers to include in the file upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file size limit in bytes.
 * @property {boolean} [allowMultiple] - Whether to allow multiple file uploads.
 * @property {string} [acceptedFormats="audio/*"] - Accepted file formats (default is `"audio/*"`).
 * @property {Object<string, string>} [audioTagAttributes] - Additional attributes to set on the `AUDIO` tag.
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: `options.get('componentInsertBehavior')`]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */

/**
 * @class
 * @description Audio modal plugin.
 */
class Audio_ extends PluginModal {
	static key = 'audio';
	static className = '';

	/**
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return /^AUDIO$/i.test(node?.nodeName) ? node : null;
	}

	#defaultWidth;
	#defaultHeight;
	#urlValue = '';
	#element = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} editor - The core kernel
	 * @param {AudioPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin basic properties
		super(editor);
		this.title = this.$.lang.audio;
		this.icon = 'audio';

		// define plugin options
		this.pluginOptions = {
			defaultWidth: !pluginOptions.defaultWidth ? '' : numbers.is(pluginOptions.defaultWidth) ? pluginOptions.defaultWidth + 'px' : pluginOptions.defaultWidth,
			defaultHeight: !pluginOptions.defaultHeight ? '' : numbers.is(pluginOptions.defaultHeight) ? pluginOptions.defaultHeight + 'px' : pluginOptions.defaultHeight,
			createFileInput: !!pluginOptions.createFileInput,
			createUrlInput: pluginOptions.createUrlInput === undefined || !pluginOptions.createFileInput ? true : pluginOptions.createUrlInput,
			uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
			uploadHeaders: pluginOptions.uploadHeaders || null,
			uploadSizeLimit: numbers.get(pluginOptions.uploadSizeLimit, 0),
			uploadSingleSizeLimit: numbers.get(pluginOptions.uploadSingleSizeLimit, 0),
			allowMultiple: !!pluginOptions.allowMultiple,
			acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'audio/*' : pluginOptions.acceptedFormats.trim() || 'audio/*',
			audioTagAttributes: pluginOptions.audioTagAttributes || null,
			insertBehavior: pluginOptions.insertBehavior,
		};

		// create HTML
		const modalEl = CreateHTML_modal(this.$, this.pluginOptions);
		const controllerEl = CreateHTML_controller(this.$);

		// modules
		this.modal = new Modal(this, this.$, modalEl);
		this.controller = new Controller(this, this.$, controllerEl, { position: 'bottom', disabled: true });
		this.fileManager = new FileManager(this, this.$, {
			query: 'audio',
			loadEventName: 'onAudioLoad',
			actionEventName: 'onAudioAction',
		});

		// members
		this.figure = new Figure(this, this.$, null, {});

		/** @type {HTMLElement} */
		this.fileModalWrapper = modalEl.querySelector('.se-flex-input-wrapper');
		/** @type {HTMLInputElement} */
		this.audioInputFile = modalEl.querySelector('.__se__file_input');
		/** @type {HTMLInputElement} */
		this.audioUrlFile = modalEl.querySelector('.se-input-url');
		/** @type {HTMLElement} */
		this.preview = modalEl.querySelector('.se-link-preview');

		/** @type {HTMLAudioElement} */
		this.#defaultWidth = this.pluginOptions.defaultWidth;
		this.#defaultHeight = this.pluginOptions.defaultHeight;

		const galleryButton = modalEl.querySelector('.__se__gallery');
		if (galleryButton) this.$.eventManager.addEvent(galleryButton, 'click', this.#OpenGallery.bind(this));

		// init
		if (this.audioInputFile) {
			this.$.eventManager.addEvent(modalEl.querySelector('.se-modal-files-edge-button'), 'click', this.#RemoveSelectedFiles.bind(this, this.audioUrlFile, this.preview));
			if (this.audioUrlFile) {
				this.$.eventManager.addEvent(this.audioInputFile, 'change', this.#FileInputChange.bind(this));
			}
		}
		if (this.audioUrlFile) {
			this.$.eventManager.addEvent(this.audioUrlFile, 'input', this.#OnLinkPreview.bind(this));
		}
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.modal.open();
	}

	/**
	 * @hook Editor.core
	 * @type {SunEditor.Hook.Core.RetainFormat}
	 */
	retainFormat() {
		return {
			query: 'audio',
			method: (element) => {
				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && figureInfo.cover) return;

				this.#setTagAttrs(element);
				const figure = Figure.CreateContainer(element.cloneNode(true), 'se-flex-component');
				this.figure.retainFigureFormat(figure.container, element, null, this.fileManager);
			},
		};
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnFilePasteAndDrop}
	 */
	onFilePasteAndDrop({ file }) {
		if (!/^audio/.test(file.type)) return;

		this.submitFile([file]);
		this.$.focusManager.focus();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.On}
	 */
	modalOn(isUpdate) {
		if (!isUpdate) {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.setAttribute('multiple', 'multiple');
		} else if (this.#element) {
			this.#urlValue = this.preview.textContent = this.audioUrlFile.value = this.#element.src;
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
		} else {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
		}
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		if (this.audioInputFile && this.audioInputFile?.files.length > 0) {
			return await this.submitFile(this.audioInputFile.files);
		} else if (this.audioUrlFile && this.#urlValue.length > 0) {
			return await this.submitURL(this.#urlValue);
		}
		return false;
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Init}
	 */
	modalInit() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		if (this.audioInputFile) this.audioInputFile.value = '';
		if (this.audioUrlFile) this.#urlValue = this.preview.textContent = this.audioUrlFile.value = '';
		if (this.audioInputFile && this.audioUrlFile) {
			this.audioUrlFile.disabled = false;
			this.preview.style.textDecoration = '';
		}
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		switch (target.getAttribute('data-command')) {
			case 'update':
				if (this.audioUrlFile) this.#urlValue = this.preview.textContent = this.audioUrlFile.value = this.#element.src;
				this.open();
				break;
			case 'copy': {
				const figure = Figure.GetContainer(this.#element);
				this.$.component.copy(figure.container);
				break;
			}
			case 'delete':
				this.componentDestroy(null);
				break;
		}
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, infoOnly: false });
		this.#ready(target);
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	async componentDestroy(target) {
		const element = target || this.#element;
		const figure = Figure.GetContainer(element);
		const container = figure.container || element;
		const focusEl = container.previousElementSibling || container.nextElementSibling;

		const message = await this.$.eventManager.triggerEvent('onAudioDeleteBefore', { element: element, container: figure, url: element.getAttribute('src') });
		if (message === false) return;

		const emptyDiv = container.parentNode;
		dom.utils.removeItem(container);
		this.modalInit();
		this.controller.close();

		if (emptyDiv !== this.$.frameContext.get('wysiwyg')) {
			this.$.nodeTransform.removeAllParents(
				emptyDiv,
				function (current) {
					return current.childNodes.length === 0;
				},
				null,
			);
		}

		// focus
		this.$.focusManager.focusEdge(focusEl);
		this.$.history.push(false);
	}

	/**
	 * @description Create an `audio` component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return `false`, the file upload will be canceled
	 */
	async submitFile(fileList) {
		if (fileList.length === 0) return false;

		let fileSize = 0;
		const files = [];
		const singleSizeLimit = this.pluginOptions.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			if (!/audio/i.test(f.type)) continue;

			s = f.size;
			if (singleSizeLimit > 0 && s > singleSizeLimit) {
				const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable single file: ' + singleSizeLimit / 1000 + 'KB';
				const message = await this.$.eventManager.triggerEvent('onAudioUploadError', {
					error: err,
					limitSize: singleSizeLimit,
					uploadSize: s,
					file: f,
				});

				this.$.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

				return false;
			}

			files.push(f);
			fileSize += s;
		}

		const limitSize = this.pluginOptions.uploadSizeLimit;
		if (limitSize > 0 && fileSize + this.fileManager.getSize() > limitSize) {
			const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable total audios: ' + limitSize / 1000 + 'KB';
			const message = await this.$.eventManager.triggerEvent('onAudioUploadError', { error: err, limitSize, currentSize: this.fileManager.getSize(), uploadSize: fileSize });

			this.$.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

			return false;
		}

		const audioInfo = {
			files,
			isUpdate: this.modal.isUpdate,
			element: this.#element,
		};

		const handler = function (uploadCallback, newInfos, infos) {
			infos = newInfos || infos;
			uploadCallback(infos, infos.files);
		}.bind(this, this.#serverUpload.bind(this), audioInfo);

		const result = await this.$.eventManager.triggerEvent('onAudioUploadBefore', {
			info: audioInfo,
			handler,
		});

		if (typeof result === 'undefined') return true;
		if (!result) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	}

	/**
	 * @description Create an `audio` component using the provided url.
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
			element: this.#createAudioTag(),
		};

		const handler = function (uploadCallback, newInfos, infos) {
			infos = newInfos || infos;
			uploadCallback(infos.element, infos.url, infos.files, infos.isUpdate, true);
		}.bind(this, this.create.bind(this), audioInfo);

		const result = await this.$.eventManager.triggerEvent('onAudioUploadBefore', {
			info: audioInfo,
			handler,
		});

		if (typeof result === 'undefined') return true;
		if (!result) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	}

	/**
	 * @description Creates or updates an `audio` component within the editor.
	 * - If `isUpdate` is `true`, updates the existing element's `src`.
	 * - Otherwise, inserts a new `audio` component with the given file.
	 * @param {HTMLAudioElement} element - The target `AUDIO` element.
	 * @param {string} src - The source URL of the audio file.
	 * @param {{name: string, size: number}} file - The file metadata (name, size).
	 * @param {boolean} isUpdate - Whether to update an existing element.
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(element, src, file, isUpdate, isLast) {
		// create new tag
		if (!isUpdate) {
			this.fileManager.setFileData(element, file);
			element.src = src;
			const figure = Figure.CreateContainer(element, 'se-flex-component');
			if (!this.$.component.insert(figure.container, { scrollTo: isLast ? true : false, insertBehavior: isLast ? this.pluginOptions.insertBehavior : 'line' })) {
				if (isLast) this.$.focusManager.focus();
				return;
			}
			if (!this.$.options.get('componentInsertBehavior')) {
				const line = this.$.format.addLine(figure.container, null);
				if (line) this.$.selection.setRange(line, 0, line, 0);
			}
		} else {
			if (this.#element) element = this.#element;
			this.fileManager.setFileData(element, file);
			if (element && element.src !== src) {
				element.src = src;
				this.$.component.select(element, Audio_.key);
			} else {
				this.$.component.select(element, Audio_.key);
				return;
			}
		}

		if (isUpdate) this.$.history.push(false);
	}

	/**
	 * @description Prepares the component for selection.
	 * - Ensures that the controller is properly positioned and initialized.
	 * - Prevents duplicate event handling if the component is already selected.
	 * @param {HTMLElement} target - The selected element.
	 */
	#ready(target) {
		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) return;
		this.#element = /** @type {HTMLAudioElement} */ (target);
		this.controller.open(target, null, { isWWTarget: false, addOffset: null });
	}

	/**
	 * @description Registers uploaded audio files and creates the corresponding audio elements.
	 * - Iterates through the uploaded files and inserts them into the editor.
	 * @param {SunEditor.EventParams.AudioInfo} info - Upload metadata, including `isUpdate` flag and `element`.
	 * @param {Object<string, *>} response - Server response containing uploaded file details.
	 */
	#register(info, response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file, oAudio; i < len; i++) {
			if (info.isUpdate) oAudio = info.element;
			else oAudio = this.#createAudioTag();

			file = { name: fileList[i].name, size: fileList[i].size };
			this.create(oAudio, fileList[i].url, file, info.isUpdate, i === len - 1);
		}
	}

	/**
	 * @description Creates a new `AUDIO` element with default attributes.
	 * - Applies width, height, and additional attributes from plugin options.
	 * @returns {HTMLAudioElement} - The newly created `AUDIO` element.
	 */
	#createAudioTag() {
		const w = this.#defaultWidth;
		const h = this.#defaultHeight;
		/** @type {HTMLAudioElement} */
		const oAudio = dom.utils.createElement('AUDIO', { style: (w ? 'width:' + w + '; ' : '') + (h ? 'height:' + h + ';' : '') });
		this.#setTagAttrs(oAudio);
		return oAudio;
	}

	/**
	 * @description Sets attributes on an `AUDIO` element based on plugin options.
	 * - Adds the `controls` attribute and applies any custom attributes.
	 * @param {HTMLElement} element - The `AUDIO` element to modify.
	 */
	#setTagAttrs(element) {
		element.setAttribute('controls', 'true');

		const attrs = this.pluginOptions.audioTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	}

	/**
	 * @description Uploads audio files to the server.
	 * - Sends a request to the configured upload URL and processes the response.
	 * @param {SunEditor.EventParams.AudioInfo} info - Upload metadata, including `files` and `isUpdate`.
	 * @param {FileList|File[]} files - The files to be uploaded.
	 */
	#serverUpload(info, files) {
		if (!files) return;

		const uploadFiles = this.modal.isUpdate ? [files[0]] : files;
		this.fileManager.upload(this.pluginOptions.uploadUrl, this.pluginOptions.uploadHeaders, uploadFiles, this.#UploadCallBack.bind(this, info), this.#error.bind(this));
	}

	/**
	 * @description Handles errors that occur during the audio upload process.
	 * - Triggers the `onAudioUploadError` event to allow custom handling of errors.
	 * - Displays an error message in the editor's UI.
	 * - Logs the error to the console for debugging.
	 * @param {Object<string, *>} response - The error response object from the server or upload process.
	 * @returns {Promise<void>}
	 */
	async #error(response) {
		const message = await this.$.eventManager.triggerEvent('onAudioUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.$.ui.alertOpen(err, 'error');
		console.error('[SUNEDITOR.plugin.audio.error]', err);
	}

	/**
	 * @description Handles the server response after a file upload.
	 * - If the upload is successful, registers the uploaded audio.
	 * - If an error occurs, triggers an error event.
	 * @param {SunEditor.EventParams.AudioInfo} info - Upload metadata.
	 * @param {XMLHttpRequest} xmlHttp - The completed XHR request.
	 */
	async #UploadCallBack(info, xmlHttp) {
		if ((await this.$.eventManager.triggerEvent('audioUploadHandler', { xmlHttp, info })) === NO_EVENT) {
			const response = JSON.parse(xmlHttp.responseText);
			if (response.errorMessage) {
				this.#error(response);
			} else {
				this.#register(info, response);
			}
		}
	}

	/**
	 * @description Updates the preview text for the entered audio URL.
	 * - Formats the URL correctly based on the editor’s settings.
	 * @param {InputEvent} e - The input event triggered when the user types a URL.
	 */
	#OnLinkPreview(e) {
		/** @type {HTMLInputElement} */
		const target = dom.query.getEventTarget(e);
		const value = target.value.trim();
		this.#urlValue = this.preview.textContent = !value
			? ''
			: this.$.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
				? this.$.options.get('defaultUrlProtocol') + value
				: !value.includes('://')
					? '/' + value
					: value;
	}

	/**
	 * @description Opens the audio gallery plugin, if available.
	 * - Calls a function to populate the URL input with the selected audio file.
	 */
	#OpenGallery() {
		this.$.plugins.audioGallery.open(this.#SetUrlInput.bind(this));
	}

	/**
	 * @param {HTMLInputElement} target - The target element.
	 */
	#SetUrlInput(target) {
		this.#urlValue = this.preview.textContent = this.audioUrlFile.value = target.getAttribute('data-command') || target.src;
		this.audioUrlFile.focus();
	}

	/**
	 * @description Clears the selected file input and re-enables the URL input.
	 * - Ensures that only one input method (file or URL) is used at a time.
	 * @param {HTMLInputElement} urlInput - The URL input field.
	 * @param {HTMLElement} preview - The preview text element.
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
		/** @type {HTMLInputElement} */
		const target = dom.query.getEventTarget(e);
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

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {import('./audio').AudioPluginOptions} pluginOptions - Audio plugin options
 * @returns {HTMLElement}
 */
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
							${dom.utils.createTooltipInner(lang.audioGallery)}
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
            <button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">
                ${icons.delete}
                <span class="se-tooltip-inner">
                    <span class="se-tooltip-text">${lang.remove}</span>
                </span>
            </button>
        </div>
    </div>`;

	return dom.utils.createElement('DIV', { class: 'se-controller' }, html);
}

export default Audio_;
