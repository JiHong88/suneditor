import EditorInjector from '../../editorInjector';
import { Modal, Controller, FileManager, Figure, _DragHandle } from '../../modules';
import { domUtils, numbers, env } from '../../helper';
const { NO_EVENT, ON_OVER_COMPONENT } = env;

const Audio_ = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
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

	// init
	if (this.audioInputFile) {
		this.eventManager.addEvent(modalEl.querySelector('.se-modal-files-edge-button'), 'click', RemoveSelectedFiles.bind(this.audioInputFile, this.audioUrlFile, this.preview));
		if (this.audioUrlFile) {
			this.eventManager.addEvent(this.audioInputFile, 'change', FileInputChange.bind(this));
		}
	}
	if (this.audioUrlFile) {
		this.eventManager.addEvent(this.audioUrlFile, 'input', OnLinkPreview.bind(this));
	}
};

Audio_.key = 'audio';
Audio_.type = 'modal';
Audio_.className = '';
Audio_.component = function (node) {
	return /^AUDIO$/i.test(node?.nodeName) ? node : null;
};
Audio_.prototype = {
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
		if (!isUpdate) {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.setAttribute('multiple', 'multiple');
		} else if (this._element) {
			this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
		} else {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
		}
	},

	/**
	 * @description On paste or drop
	 * @param {*} params { frameContext, event, file }
	 */
	onPastAndDrop({ file }) {
		if (!/^audio/.test(file.type)) return;

		this.submitFile([file]);
		this.editor.focus();

		return false;
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	modalAction() {
		if (this.audioInputFile && this.audioInputFile?.files.length > 0) {
			return this.submitFile(this.audioInputFile.files);
		} else if (this.audioUrlFile && this.urlValue.length > 0) {
			return this.submitURL(this.urlValue);
		}
		return false;
	},

	/**
	 * @override modal
	 */
	init() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		if (this.audioInputFile) this.audioInputFile.value = '';
		if (this.audioUrlFile) this.urlValue = this.preview.textContent = this.audioUrlFile.value = '';
		if (this.audioInputFile && this.audioUrlFile) {
			this.audioUrlFile.removeAttribute('disabled');
			this.preview.style.textDecoration = '';
		}
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction(target) {
		if (/update/.test(target.getAttribute('data-command'))) {
			if (this.audioUrlFile) this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			this.open();
		} else {
			this.destroy();
		}
	},

	/**
	 * @override core
	 */
	retainFormat() {
		return {
			query: 'audio',
			method: (element) => {
				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && figureInfo.cover) return;

				this._setTagAttrs(element);
				const figure = Figure.CreateContainer(element.cloneNode(true), 'se-flex-component');
				this.figure.retainFigureFormat(figure.container, element, null);
			}
		};
	},

	/**
	 * @override component, fileManager
	 * @description Called when a container is selected.
	 * @param {Element} element Target element
	 */
	select(element) {
		this.figure.open(element, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, __fileManagerInfo: false });
		this.ready(element);
	},

	/**
	 * @override fileManager
	 */
	ready(target) {
		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) return;
		this._element = target;
		this.controller.open(target, null, { isWWTarget: false, addOffset: null });
	},

	/**
	 * @override fileManager
	 */
	async destroy(element) {
		element = element || this._element;
		const figure = Figure.GetContainer(element);
		const container = figure.container || element;
		const focusEl = container.previousElementSibling || container.nextElementSibling;

		const message = await this.triggerEvent('onAudioDeleteBefore', { target: element, container: figure, url: element.getAttribute('src') });
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
	},

	_register(info, response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file, oAudio; i < len; i++) {
			if (info.isUpdate) oAudio = info.element;
			else oAudio = this._createAudioTag();

			file = { name: fileList[i].name, size: fileList[i].size };
			this._createComp(oAudio, fileList[i].url, file, info.isUpdate);
		}
	},

	async submitFile(fileList) {
		if (fileList.length === 0) return false;

		let fileSize = 0;
		const files = [];
		const slngleSizeLimit = this.uploadSingleSizeLimit;
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

				this.notice.open(message === NO_EVENT ? err : message || err);

				return false;
			}

			files.push(f);
			fileSize += s;
		}

		const limitSize = this.pluginOptions.uploadSizeLimit;
		if (limitSize > 0 && fileSize + this.fileManager.getSize() > limitSize) {
			const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable total audios: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onAudioUploadError', { error: err, limitSize, currentSize: this.fileManager.getSize(), uploadSize: fileSize });

			this.notice.open(message === NO_EVENT ? err : message || err);

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
			...audioInfo,
			handler
		});

		if (typeof result === 'undefined') return true;
		if (!result) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	},

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
			...audioInfo,
			handler
		});

		if (typeof result === 'undefined') return true;
		if (!result) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	},

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
	},

	_createAudioTag() {
		const w = this.defaultWidth;
		const h = this.defaultHeight;
		const oAudio = domUtils.createElement('AUDIO', { style: (w ? 'width:' + w + '; ' : '') + (h ? 'height:' + h + ';' : '') });
		this._setTagAttrs(oAudio);
		return oAudio;
	},

	_setTagAttrs(element) {
		element.setAttribute('controls', true);

		const attrs = this.pluginOptions.audioTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	},

	_serverUpload(info, files) {
		if (!files) return;

		const uploadFiles = this.modal.isUpdate ? [files[0]] : files;
		this.fileManager.upload(this.pluginOptions.uploadUrl, this.pluginOptions.uploadHeaders, uploadFiles, UploadCallBack.bind(this, info), this._error.bind(this));
	},

	async _error(response) {
		const message = await this.triggerEvent('onAudioUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.audio.error]', err);
	},

	constructor: Audio_
};

async function UploadCallBack(info, xmlHttp) {
	if ((await this.triggerEvent('audioUploadHandler', { xmlHttp, info })) === NO_EVENT) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response);
		} else {
			this._register(info, response);
		}
	}
}

function OnLinkPreview(e) {
	const value = e.target.value.trim();
	this.urlValue = this.preview.textContent = !value
		? ''
		: this.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
		? this.options.get('defaultUrlProtocol') + value
		: !value.includes('://')
		? '/' + value
		: value;
}

// Disable url input when uploading files
function RemoveSelectedFiles(urlInput, preview) {
	this.value = '';
	if (urlInput) {
		urlInput.removeAttribute('disabled');
		preview.style.textDecoration = '';
	}

	// inputFile check
	Modal.OnChangeFile(this.fileModalWrapper, []);
}

// Disable url input when uploading files
function FileInputChange({ target }) {
	if (!this.audioInputFile.value) {
		this.audioUrlFile.removeAttribute('disabled');
		this.preview.style.textDecoration = '';
	} else {
		this.audioUrlFile.setAttribute('disabled', true);
		this.preview.style.textDecoration = 'line-through';
	}

	// inputFile check
	Modal.OnChangeFile(this.fileModalWrapper, target.files);
}

function CreateHTML_modal({ lang, icons }, pluginOptions) {
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
            <input class="se-input-form se-input-url" data-focus type="text" />
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
