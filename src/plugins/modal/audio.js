import EditorInjector from '../../editorInjector';
import { Modal, Controller, FileManager, Figure } from '../../modules';
import { domUtils, numbers } from '../../helper';

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
		allowMultiple: !!pluginOptions.allowMultiple,
		acceptedFormats:
			typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'audio/*' : pluginOptions.acceptedFormats.trim() || 'audio/*',
		audioTagAttributes: pluginOptions.audioTagAttributes || null
	};

	// create HTML
	const modalEl = CreateHTML_modal(editor, this.pluginOptions);
	const controllerEl = CreateHTML_controller(editor);

	// modules
	this.modal = new Modal(this, modalEl);
	this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true });
	this.fileManager = new FileManager(this, {
		tagNames: ['audio'],
		eventHandler: typeof this.events.onAudioUpload !== 'function' ? this.events.onAudioUpload : null,
		checkHandler: FileCheckHandler.bind(this),
		figure: null
	});

	// members
	this.audioInputFile = modalEl.querySelector('._se_audio_files');
	this.audioUrlFile = modalEl.querySelector('.se-input-url');
	this.preview = modalEl.querySelector('.se-link-preview');
	this.defaultWidth = this.pluginOptions.defaultWidth;
	this.defaultHeight = this.pluginOptions.defaultHeight;
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

Audio_.key = 'audio';
Audio_.type = 'modal';
Audio_.className = '';
Audio_.prototype = {
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
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.setAttribute('multiple', 'multiple');
		} else if (this._element) {
			this.urlValue = this.preview.textContent = this.audioUrlFile.value = this._element.src;
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
		} else {
			if (this.audioInputFile && this.pluginOptions.allowMultiple) this.audioInputFile.removeAttribute('multiple');
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
		return false;
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
		this._element = target;
		this.controller.open(target, null, UnSelect.bind(null, target));
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
		this.controller.close();

		if (emptyDiv !== this.editor.frameContext.get('wysiwyg')) {
			this.node.removeAllParents(
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

		const limitSize = this.pluginOptions.uploadSizeLimit;
		if (limitSize > 0 && fileSize + this.fileManager.getSize() > limitSize) {
			const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable total audios: ' + limitSize / 1000 + 'KB';
			if (
				typeof this.events.onAudioUploadError !== 'function' ||
				this.events.onAudioUploadError(err, { limitSize: limitSize, currentSize: this.fileManager.getSize(), uploadSize: fileSize })
			) {
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
			if (!this.component.insert(figure.container, false, !this.options.get('mediaAutoSelect'))) {
				this.editor.focus();
				return;
			}
			if (!this.options.get('mediaAutoSelect')) {
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
		const w = this.defaultWidth;
		const h = this.defaultHeight;
		const oAudio = domUtils.createElement('AUDIO', { style: (w ? 'width:' + w + '; ' : '') + (h ? 'height:' + h + ';' : '') });
		this._setTagAttrs(oAudio);
		return oAudio;
	},

	_setTagAttrs: function (element) {
		element.setAttribute('controls', true);

		const attrs = this.pluginOptions.audioTagAttributes;
		if (!attrs) return;

		for (let key in attrs) {
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
		this.fileManager.upload(this.pluginOptions.uploadUrl, this.pluginOptions.uploadHeaders, uploadFiles, UploadCallBack.bind(this, info), this.events.onAudioUploadError);
	},

	_error: function (message, response) {
		if (typeof this.events.onAudioUploadError !== 'function' || this.events.onAudioUploadError(message, response)) {
			this.notice.open(message);
			console.warn('[SUNEDITOR.plugin.audio.exception] response: ' + message);
		}
	},

	constructor: Audio_
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
		if (domUtils.getParentElement(prevElement, domUtils.isExcludeFormat)) {
			prevElement.parentNode.replaceChild(figure.container, prevElement);
		} else if (domUtils.isListCell(existElement)) {
			const refer = domUtils.getParentElement(prevElement, function (current) {
				return current.parentNode === existElement;
			});
			existElement.insertBefore(figure.container, refer);
			domUtils.removeItem(prevElement);
			this.node.removeEmptyNode(refer, null, true);
		} else if (this.format.isLine(existElement)) {
			const refer = domUtils.getParentElement(prevElement, function (current) {
				return current.parentNode === existElement;
			});
			existElement = this.node.split(existElement, refer);
			existElement.parentNode.insertBefore(figure.container, existElement);
			domUtils.removeItem(prevElement);
			this.node.removeEmptyNode(existElement, null, true);
		} else {
			existElement.parentNode.replaceChild(figure.container, existElement);
		}
	} catch (error) {
		console.warn('[SUNEDITOR.audio.error] Maybe the audio tag is nested.', error);
	}

	return element;
}

function UnSelect(target) {
	if (target) {
		domUtils.removeClass(target, 'active');
		domUtils.removeClass(target.parentElement, 'se-figure-selected');
	}
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
	this.urlValue = this.preview.textContent = !value
		? ''
		: this.options.get('defaultUrlProtocol') && value.indexOf('://') === -1 && value.indexOf('#') !== 0
		? this.options.get('defaultUrlProtocol') + value
		: value.indexOf('://') === -1
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

function CreateHTML_modal(editor, pluginOptions) {
	const lang = editor.lang;
	let html =
		'<form method="post" enctype="multipart/form-data">' +
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close" title="' +
		lang.close +
		'" aria-label="' +
		lang.close +
		'">' +
		editor.icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.audio_modal_title +
		'</span>' +
		'</div>' +
		'<div class="se-modal-body">';

	if (pluginOptions.createFileInput) {
		html +=
			'' +
			'<div class="se-modal-form">' +
			'<label>' +
			lang.audio_modal_file +
			'</label>' +
			'<div class="se-modal-form-files">' +
			'<input class="se-input-form _se_audio_files" data-focus type="file" accept="' +
			pluginOptions.acceptedFormats +
			'"' +
			(pluginOptions.allowMultiple ? ' multiple="multiple"' : '') +
			'/>' +
			'<button type="button" data-command="filesRemove" class="se-btn se-modal-files-edge-button se-file-remove" title="' +
			lang.remove +
			'" aria-label="' +
			lang.remove +
			'">' +
			editor.icons.cancel +
			'</button>' +
			'</div>' +
			'</div>';
	}

	if (pluginOptions.createUrlInput) {
		html +=
			'' +
			'<div class="se-modal-form">' +
			'<label>' +
			lang.audio_modal_url +
			'</label>' +
			'<input class="se-input-form se-input-url" data-focus type="text" />' +
			'<pre class="se-link-preview"></pre>' +
			'</div>';
	}

	html +=
		'' +
		'</div>' +
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
		'<div class="link-content">' +
		'<div class="se-btn-group">' +
		'<button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">' +
		icons.edit +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.edit +
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

	return domUtils.createElement('DIV', { class: 'se-controller' }, html);
}

export default Audio_;
