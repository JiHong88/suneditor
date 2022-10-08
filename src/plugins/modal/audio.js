import EditorInterface from '../../interface/editor';
import { Modal, Controller, FileManager, Figure } from '../../modules';
import { domUtils } from '../../helper';

const audio = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.audio;
	this.icon = this.icons.audio;

	// create HTML
	const modalEl = CreateHTML_modal(editor);
	const controllerEl = CreateHTML_controller(editor);

	// modules
	this.modal = new Modal(this, modalEl);
	this.controller = new Controller(this, controllerEl, 'bottom');
	this.fileManager = new FileManager(this, { tagNames: ['audio'], eventHandler: this.events.onAudioUpload, checkHandler: FileCheckHandler.bind(this), figure: null });

	// members
	this.audioInputFile = modalEl.querySelector('._se_audio_files');
	this.audioUrlFile = modalEl.querySelector('.se-input-url');
	this.preview = modalEl.querySelector('.se-link-preview');
	this._origin_w = this.options.audioWidth;
	this._origin_h = this.options.audioHeight;
	this.urlValue = '';
	this._element = null;

	// init
	if (this.audioInputFile) {
		modalEl.querySelector('.se-modal-files-edge-button').addEventListener('click', RemoveSelectedFiles.bind(this.audioInputFile, this.audioUrlFile, this.preview));
		if (this.audioUrlFile) {
			this.audioInputFile.addEventListener('change', FileInputChange.bind(this));
		}
	}
	if (this.audioUrlFile) {
		this.audioUrlFile.addEventListener('input', OnLinkPreview.bind(this));
	}
};

audio.type = 'modal';
audio.className = '';
audio.prototype = {
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
		if (!isUpdate) {
			if (this.audioInputFile && this.options.audioMultipleFile) this.audioInputFile.setAttribute('multiple', 'multiple');
		} else if (this._element) {
			this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			if (this.audioInputFile && this.options.audioMultipleFile) this.audioInputFile.removeAttribute('multiple');
		} else {
			if (this.audioInputFile && this.options.audioMultipleFile) this.audioInputFile.removeAttribute('multiple');
		}
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	modalAction: function () {
		if (this.audioInputFile && this.audioInputFile.files.length > 0) {
			return this._submitFile(this.audioInputFile.files);
		} else if (this.audioUrlFile && this.urlValue.length > 0) {
			return this._submitURL(this.urlValue);
		}
		return true;
	},

	/**
	 * @override modal
	 */
	init: function () {
		if (this.audioInputFile) this.audioInputFile.value = '';
		if (this.audioUrlFile) this.urlValue = this.preview.textContent = this.audioUrlFile.value = '';
		if (this.audioInputFile && this.audioUrlFile) {
			this.audioUrlFile.removeAttribute('disabled');
			this.preview.style.textDecoration = '';
		}
		this._element = null;
		this.controller.close();
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction: function (target) {
		if (/update/.test(target.getAttribute('data-command'))) {
			if (this.audioUrlFile) this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			this.open();
		} else {
			this.destroy();
		}
	},

	/**
	 * @override controller
	 */
	reset: function () {
		if (!this._element) return;
		domUtils.removeClass(this._element, 'active');
		domUtils.removeClass(this._element.parentElement, 'se-figure-selected');
	},

	/**
	 * @override editor.component, fileManager
	 * @description It is called from core.component.select
	 * @param {Element} element Target element
	 */
	select: function (element) {
		this.ready(element);
	},

	/**
	 * @override fileManager
	 */
	ready: function (target) {
		domUtils.addClass(target, 'active');
		domUtils.addClass(target.parentElement, 'se-figure-selected');
		this.controller.open(target);
		this._element = target;
	},

	/**
	 * @override fileManager
	 */
	destroy: function (element) {
		element = element || this._element;
		const figure = Figure.GetContainer(element);
		const container = figure.container || element;
		const focusEl = container.previousElementSibling || container.nextElementSibling;

		const emptyDiv = container.parentNode;
		domUtils.removeItem(container);
		this.init();

		if (emptyDiv !== this.context.element.wysiwyg) {
			domUtils.removeAllParents(
				emptyDiv,
				function (current) {
					return current.childNodes.length === 0;
				},
				null
			);
		}

		// focus
		this.editor.focusEdge(focusEl);

		// history stack
		this.history.push(false);
	},

	_submitFile: function (fileList) {
		if (fileList.length === 0) return false;

		let fileSize = 0;
		let files = [];
		for (let i = 0, len = fileList.length; i < len; i++) {
			if (/audio/i.test(fileList[i].type)) {
				files.push(fileList[i]);
				fileSize += fileList[i].size;
			}
		}

		const limitSize = this.options.audioUploadSizeLimit;
		if (limitSize > 0 && fileSize + this.fileManager.getSize() > limitSize) {
			const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable total audios: ' + limitSize / 1000 + 'KB';
			if (typeof this.events.onAudioUploadError !== 'function' || this.events.onAudioUploadError(err, { limitSize: limitSize, currentSize: this.fileManager.getSize(), uploadSize: fileSize })) {
				this.notice.open(err);
			}
			return false;
		}

		const info = {
			isUpdate: this.modal.isUpdate,
			element: this._element
		};

		if (typeof this.events.onAudioUploadBefore === 'function') {
			const result = this.events.onAudioUploadBefore(
				files,
				info,
				function (data) {
					if (data && this._w.Array.isArray(data.result)) {
						this._register(info, data);
					} else {
						this._serverUpload(info, data);
					}
				}.bind(this)
			);

			if (typeof result === 'undefined') return;
			if (!result) return false;
			if (typeof result === 'object' && result.length > 0) files = result;
		}

		this._serverUpload(info, files);
	},

	_register: function (info, response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file, oAudio; i < len; i++) {
			if (info.isUpdate) oAudio = info.element;
			else oAudio = this._createAudioTag();

			file = { name: fileList[i].name, size: fileList[i].size };
			this._createComp(oAudio, fileList[i].url, file, info.isUpdate);
		}
	},

	_submitURL: function (src) {
		if (src.length === 0) return false;
		this._createComp(this._createAudioTag(), src, null, this.modal.isUpdate);
		return true;
	},

	_createComp: function (element, src, file, isUpdate) {
		// create new tag
		if (!isUpdate) {
			element.src = src;
			const figure = Figure.CreateContainer(element);
			if (!this.component.insert(figure.container, false, false, !this.options.mediaAutoSelect)) {
				this.editor.focus();
				return;
			}
			if (!this.options.mediaAutoSelect) {
				const line = this.format.addLine(figure.container, null);
				if (line) this.selection.setRange(line, 0, line, 0);
			}
		} else {
			if (this._element) element = this._element;
			if (element && element.src !== src) {
				element.src = src;
				this.component.select(element, 'audio');
			} else {
				this.component.select(element, 'audio');
				return;
			}
		}

		this.fileManager.setInfo(element, file);
		if (isUpdate) this.history.push(false);
	},

	_createAudioTag: function () {
		const w = this._origin_w;
		const h = this._origin_h;
		const oAudio = domUtils.createElement('AUDIO', { style: (w ? 'width:' + w + '; ' : '') + (h ? 'height:' + h + ';' : '') });
		this._setTagAttrs(oAudio);
		return oAudio;
	},

	_setTagAttrs: function (element) {
		element.setAttribute('controls', true);

		const attrs = this.options.audioTagAttrs;
		if (!attrs) return;

		for (let key in attrs) {
			if (!attrs.hasOwnProperty(key)) continue;
			element.setAttribute(key, attrs[key]);
		}
	},

	_serverUpload: function (info, files) {
		if (!files) return;
		if (typeof files === 'string') {
			this._error(files, null);
			return true;
		}

		const uploadFiles = this.modal.isUpdate ? [files[0]] : files;
		this.fileManager.upload(this.options.audioUploadUrl, this.options.audioUploadHeader, uploadFiles, UploadCallBack.bind(this, info), this.events.onAudioUploadError);
	},

	_error: function (message, response) {
		if (typeof this.events.onAudioUploadError !== 'function' || this.events.onAudioUploadError(message, response)) {
			this.notice.open(message);
			console.warn('[SUNEDITOR.plugin.audio.exception] response: ' + message);
		}
	},

	constructor: audio
};

function FileCheckHandler(element) {
	this._setTagAttrs(element);

	// find component element
	let existElement = this.format.isBlock(element.parentNode) || domUtils.isWysiwygFrame(element.parentNode) ? element : this.format.getLine(element) || element;

	// clone element
	const prevElement = element;
	this._element = element = element.cloneNode(false);
	const figure = Figure.CreateContainer(element);

	try {
		if (domUtils.isListCell(existElement)) {
			const refer = domUtils.getParentElement(prevElement, function (current) {
				return current.parentNode === existElement;
			});
			existElement.insertBefore(figure.container, refer);
			domUtils.removeItem(prevElement);
			domUtils.removeEmptyNode(refer, null);
		} else if (this.format.isLine(existElement)) {
			const refer = domUtils.getParentElement(prevElement, function (current) {
				return current.parentNode === existElement;
			});
			existElement = this.node.split(existElement, refer);
			existElement.parentNode.insertBefore(figure.container, existElement);
			domUtils.removeItem(prevElement);
			domUtils.removeEmptyNode(existElement, null);
			if (existElement.children.length === 0) existElement.innerHTML = this.node.removeWhiteSpace(existElement.innerHTML);
		} else {
			existElement.parentNode.replaceChild(figure.container, existElement);
		}
	} catch (error) {
		console.warn('[SUNEDITOR.audio.error] Maybe the audio tag is nested.', error);
	}

	return element;
}

function UploadCallBack(info, xmlHttp) {
	if (typeof this.events.audioUploadHandler === 'function') {
		this.events.audioUploadHandler(xmlHttp, info);
	} else {
		const response = this._w.JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response.errorMessage, response);
		} else {
			this._register(info, response);
		}
	}
}

function OnLinkPreview(e) {
	const value = e.target.value.trim();
	this.urlValue = this.preview.textContent = !value ? '' : this.options.linkProtocol && value.indexOf('://') === -1 && value.indexOf('#') !== 0 ? this.options.linkProtocol + value : value.indexOf('://') === -1 ? '/' + value : value;
}

// Disable url input when uploading files
function RemoveSelectedFiles(urlInput, preview) {
	this.value = '';
	if (urlInput) {
		urlInput.removeAttribute('disabled');
		preview.style.textDecoration = '';
	}
}

// Disable url input when uploading files
function FileInputChange() {
	if (!this.audioInputFile.value) {
		this.audioUrlFile.removeAttribute('disabled');
		this.preview.style.textDecoration = '';
	} else {
		this.audioUrlFile.setAttribute('disabled', true);
		this.preview.style.textDecoration = 'line-through';
	}
}

function CreateHTML_modal(editor) {
	const option = editor.options;
	const lang = editor.lang;
	let html =
		'<form method="post" enctype="multipart/form-data">' +
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close" title="' +
		lang.modalBox.close +
		'" aria-label="' +
		lang.modalBox.close +
		'">' +
		editor.icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.modalBox.audioBox.title +
		'</span>' +
		'</div>' +
		'<div class="se-modal-body">';

	if (option.audioFileInput) {
		html +=
			'' +
			'<div class="se-modal-form">' +
			'<label>' +
			lang.modalBox.audioBox.file +
			'</label>' +
			'<div class="se-modal-form-files">' +
			'<input class="se-input-form _se_audio_files" data-focus type="file" accept="' +
			option.audioAccept +
			'"' +
			(option.audioMultipleFile ? ' multiple="multiple"' : '') +
			'/>' +
			'<button type="button" data-command="filesRemove" class="se-btn se-modal-files-edge-button se-file-remove" title="' +
			lang.controller.remove +
			'" aria-label="' +
			lang.controller.remove +
			'">' +
			editor.icons.cancel +
			'</button>' +
			'</div>' +
			'</div>';
	}

	if (option.audioUrlInput) {
		html += '' + '<div class="se-modal-form">' + '<label>' + lang.modalBox.audioBox.url + '</label>' + '<input class="se-input-form se-input-url" data-focus type="text" />' + '<pre class="se-link-preview"></pre>' + '</div>';
	}

	html += '' + '</div>' + '<div class="se-modal-footer">' + '<button type="submit" class="se-btn-primary" title="' + lang.modalBox.submitButton + '" aria-label="' + lang.modalBox.submitButton + '"><span>' + lang.modalBox.submitButton + '</span></button>' + '</div>' + '</form>';

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

function CreateHTML_controller(editor) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html =
		'<div class="se-arrow se-arrow-up"></div>' +
		'<div class="link-content">' +
		'<div class="se-btn-group">' +
		'<button type="button" data-command="update" tabindex="-1" class="se-tooltip">' +
		icons.edit +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.edit +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="delete" tabindex="-1" class="se-tooltip">' +
		icons.delete +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.remove +
		'</span></span>' +
		'</button>' +
		'</div>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller' }, html);
}

export default audio;
