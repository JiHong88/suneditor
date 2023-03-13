import EditorDependency from '../../dependency';
import { Modal, Figure, FileManager, ModalAnchorEditor } from '../../modules';
import { domUtils, numbers } from '../../helper';

const Image_ = function (editor, target) {
	// plugin bisic properties
	EditorDependency.call(this, editor);
	this.target = target;
	this.title = this.lang.image;
	this.icon = this.icons.image;

	// create HTML
	const options = this.options;
	const modalEl = CreateHTML_modal(editor);
	const figureControls = options.get('imageControls');

	// controls
	let showAlign = false;
	for (let i = 0; i < figureControls.length; i++) {
		if (!figureControls[i]) break;
		for (let j = 0; j < figureControls[i].length; j++) {
			this._rotation = /rotate/.test(figureControls[i][j]);
			showAlign = /align/.test(figureControls[i][j]);
		}
	}
	if (showAlign) modalEl.querySelector('.se-figure-align').style.display = 'none';

	// modules
	this.anchor = new ModalAnchorEditor(this, modalEl);
	this.modal = new Modal(this, modalEl);
	this.figure = new Figure(this, figureControls, { sizeUnit: options.get('_imageSizeUnit') });
	this.fileManager = new FileManager(this, { tagNames: ['img'], eventHandler: this.events.onImageUpload, checkHandler: FileCheckHandler.bind(this), figure: this.figure });

	// members
	this.imgInputFile = modalEl.querySelector('._se_image_file');
	this.imgUrlFile = modalEl.querySelector('._se_image_url');
	this.focusElement = this.imgInputFile || this.imgUrlFile;
	this.altText = modalEl.querySelector('._se_image_alt');
	this.captionCheckEl = modalEl.querySelector('._se_image_check_caption');
	this.previewSrc = modalEl.querySelector('._se_tab_content_image .se-link-preview');
	this.sizeUnit = options.get('_imageSizeUnit');
	this.proportion = {};
	this.inputX = {};
	this.inputY = {};
	this._linkElement = null;
	this._linkValue = '';
	this._align = 'none';
	this._svgDefaultSize = '30%';
	this._base64RenderIndex = 0;
	this._element = null;
	this._cover = null;
	this._container = null;
	this._caption = null;
	this._ratio = { w: 1, h: 1 };
	this._origin_w = options.get('imageWidth') === 'auto' ? '' : options.get('imageWidth');
	this._origin_h = options.get('imageHeight') === 'auto' ? '' : options.get('imageHeight');
	this._resizing = options.get('imageResizing');
	this._onlyPercentage = options.get('imageSizeOnlyPercentage');
	this._nonResizing = !this._resizing || !options.get('imageHeightShow') || this._onlyPercentage;

	// init
	modalEl.querySelector('.se-modal-tabs').addEventListener('click', this._openTab.bind(this));
	if (this.imgInputFile) modalEl.querySelector('.se-file-remove').addEventListener('click', RemoveSelectedFiles.bind(this));
	if (this.imgUrlFile) this.imgUrlFile.addEventListener('input', OnLinkPreview.bind(this));
	if (this.imgInputFile && this.imgUrlFile) this.imgInputFile.addEventListener('change', OnfileInputChange.bind(this));

	const imageGalleryButton = modalEl.querySelector('.__se__gallery');
	if (imageGalleryButton) imageGalleryButton.addEventListener('click', OpenGallery.bind(this));

	if (this._resizing) {
		this.proportion = modalEl.querySelector('._se_image_check_proportion');
		this.inputX = modalEl.querySelector('._se_image_size_x');
		this.inputY = modalEl.querySelector('._se_image_size_y');
		this.inputX.value = options.get('imageWidth');
		this.inputY.value = options.get('imageHeight');

		const ratioChange = OnChangeRatio.bind(this);
		this.eventManager.addEvent(this.inputX, 'keyup', OnInputSize.bind(this, 'x'));
		this.eventManager.addEvent(this.inputY, 'keyup', OnInputSize.bind(this, 'y'));
		this.eventManager.addEvent(this.inputX, 'change', ratioChange);
		this.eventManager.addEvent(this.inputY, 'change', ratioChange);
		this.eventManager.addEvent(this.proportion, 'change', ratioChange);
		this.eventManager.addEvent(modalEl.querySelector('.se-modal-btn-revert'), 'click', OnClickRevert.bind(this));
	}
};

Image_.key = 'image';
Image_.type = 'modal';
Image_.className = '';
Image_.prototype = {
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
			this.inputX.value = this._origin_w = this.options.get('imageWidth') === 'auto' ? '' : this.options.get('imageWidth');
			this.inputY.value = this._origin_h = this.options.get('imageHeight') === 'auto' ? '' : this.options.get('imageHeight');
			if (this.imgInputFile && this.options.get('imageMultipleFile')) this.imgInputFile.setAttribute('multiple', 'multiple');
		} else {
			if (this.imgInputFile && this.options.get('imageMultipleFile')) this.imgInputFile.removeAttribute('multiple');
		}

		this.anchor.on(isUpdate);
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	modalAction: function () {
		this._align = this.modal.form.querySelector('input[name="suneditor_image_radio"]:checked').value;

		if (this.modal.isUpdate) {
			this._update(this.inputX.value, this.inputY.value);
		}

		if (this.imgInputFile && this.imgInputFile.files.length > 0) {
			return this._submitFile(this.imgInputFile.files);
		} else if (this.imgUrlFile && this._linkValue.length > 0) {
			return this._submitURL(this._linkValue);
		}

		return false;
	},

	/**
	 * @override modal
	 */
	init: function () {
		if (this.imgInputFile) this.imgInputFile.value = '';
		if (this.imgUrlFile) this._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = '';
		if (this.imgInputFile && this.imgUrlFile) {
			this.imgUrlFile.removeAttribute('disabled');
			this.previewSrc.style.textDecoration = '';
		}

		this.altText.value = '';
		this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]').checked = true;
		this.captionCheckEl.checked = false;
		this._element = null;
		this._ratio = { w: 1, h: 1 };
		this._openTab('init');

		if (this._resizing) {
			this.inputX.value = this.options.get('imageWidth') === 'auto' ? '' : this.options.get('imageWidth');
			this.inputY.value = this.options.get('imageHeight') === 'auto' ? '' : this.options.get('imageHeight');
			this.proportion.checked = true;
		}

		this.anchor.init();
	},

	/**
	 * @override fileManager, figure
	 * @description Called when a container is selected.
	 * @param {Element} element Target element
	 */
	select: function (element) {
		this.ready(element);
	},

	/**
	 * @override fileManager, figure
	 */
	ready: function (target) {
		if (!target) return;
		const figureInfo = this.figure.open(target, this._nonResizing);
		this.anchor.set(/^A$/i.test(target.parentNode.nodeName) ? target.parentNode : null);

		this._linkElement = this.anchor.currentTarget;
		this._element = target;
		this._cover = figureInfo.cover;
		this._container = figureInfo.container;
		this._caption = figureInfo.caption;
		this._align = figureInfo.align;
		target.style.float = '';

		this._origin_w = figureInfo.originWidth || figureInfo.w || '';
		this._origin_h = figureInfo.originHeight || figureInfo.h || '';
		this.altText.value = this._element.alt;

		if (this.imgUrlFile) this._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = this._element.src;

		(this.modal.form.querySelector('input[name="suneditor_image_radio"][value="' + this._align + '"]') || this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]')).checked = true;
		this.captionCheckEl.checked = !!this._caption;

		if (!this._resizing) return;

		const percentageRotation = this._onlyPercentage && this.figure.isVertical;
		let w = percentageRotation ? '' : figureInfo.width;
		if (this._onlyPercentage) {
			w = numbers.get(w, 2);
			if (w > 100) w = 100;
		}
		this.inputX.value = w === 'auto' ? '' : w;

		if (!this._onlyPercentage) {
			const h = percentageRotation ? '' : figureInfo.height;
			this.inputY.value = h === 'auto' ? '' : h;
		}

		this.proportion.checked = target.getAttribute('data-se-proportion') !== 'false';
		this.inputX.disabled = percentageRotation ? true : false;
		this.inputY.disabled = percentageRotation ? true : false;
		this.proportion.disabled = percentageRotation ? true : false;

		this._ratio = this.proportion.checked ? figureInfo.ratio : { w: 1, h: 1 };
	},

	/**
	 * @override fileManager
	 */
	destroy: function (element) {
		const targetEl = element || this._element;
		const container = domUtils.getParentElement(targetEl, this.component.is) || targetEl;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		const emptyDiv = container.parentNode;

		domUtils.removeItem(container);
		this.init();

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
			if (/image/i.test(fileList[i].type)) {
				files.push(fileList[i]);
				fileSize += fileList[i].size;
			}
		}

		const limitSize = this.options.get('imageUploadSizeLimit');
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable total images: ' + limitSize / 1000 + 'KB';
			if (typeof this.events.onImageUploadError !== 'function' || this.events.onImageUploadError(err, { limitSize: limitSize, currentSize: currentSize, uploadSize: fileSize })) {
				this.notice.open(err);
			}
			return false;
		}

		const info = {
			element: this._element,
			anchor: this.anchor.create(true),
			inputWidth: this.inputX.value,
			inputHeight: this.inputY.value,
			align: this._align,
			isUpdate: this.modal.isUpdate,
			alt: this.altText.value
		};

		if (typeof this.events.onImageUploadBefore === 'function') {
			const result = this.events.onImageUploadBefore(
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

			if (result === undefined) return true;
			if (result === false) return false;
			if (this._w.Array.isArray(result) && result.length > 0) files = result;
		}

		this._serverUpload(info, files);
	},

	_submitURL: function (url) {
		if (!url) url = this._linkValue;
		if (!url) return false;

		const file = { name: url.split('/').pop(), size: 0 };
		if (this.modal.isUpdate) this._updateSrc(url, this._element, file);
		else this.create(url, this.anchor.create(true), this.inputX.value, this.inputY.value, this._align, file, this.altText.value);

		return true;
	},

	_update: function (width, height) {
		if (!width) width = this.inputX.value || 'auto';
		if (!height) height = this.inputY.value || 'auto';

		let imageEl = this._element;
		let cover = this._cover;
		let container = this._container;
		let isNewContainer = false;

		if (cover === null || container === null) {
			isNewContainer = true;
			imageEl = this._element.cloneNode(true);
			const figureInfo = Figure.CreateContainer(imageEl, 'se-image-container');
			cover = figureInfo.cover;
			container = figureInfo.container;
		}

		// check size
		let changeSize;
		const x = numbers.is(width) ? width + this.sizeUnit : width;
		const y = numbers.is(height) ? height + this.sizeUnit : height;
		if (/%$/.test(imageEl.style.width)) {
			changeSize = x !== container.style.width || y !== container.style.height;
		} else {
			changeSize = x !== imageEl.style.width || y !== imageEl.style.height;
		}

		// alt
		imageEl.alt = this.altText.value;

		// caption
		let modifiedCaption = false;
		if (this.captionCheckEl.checked) {
			if (!this._caption) {
				this._caption = Figure.CreateCaption(cover, this.lang.caption);
				modifiedCaption = true;
			}
		} else {
			if (this._caption) {
				domUtils.removeItem(this._caption);
				this._caption = null;
				modifiedCaption = true;
			}
		}

		// link
		const anchor = this.anchor.create(true);
		if (anchor) {
			if (this._linkElement !== anchor) {
				this._linkElement = anchor.cloneNode(false);
				cover.insertBefore(this._setAnchor(imageEl, this._linkElement), this._caption);
				domUtils.removeItem(anchor);
			} else {
				this._linkElement.setAttribute('data-se-image-link', 'image');
			}
		} else if (this._linkElement !== null) {
			imageEl.setAttribute('data-se-image-link', '');
			if (cover.contains(this._linkElement)) {
				const newEl = imageEl.cloneNode(true);
				cover.removeChild(this._linkElement);
				cover.insertBefore(newEl, this._caption);
				imageEl = newEl;
			}
		}

		if (isNewContainer) {
			imageEl = this._element;
			let existElement = this.format.isBlock(imageEl.parentNode) || domUtils.isWysiwygFrame(imageEl.parentNode) ? imageEl : /^A$/i.test(imageEl.parentNode.nodeName) ? imageEl.parentNode : this.format.getLine(imageEl) || imageEl;

			if (domUtils.isListCell(existElement)) {
				const refer = domUtils.getParentElement(imageEl, function (current) {
					return current.parentNode === existElement;
				});
				existElement.insertBefore(container, refer);
				domUtils.removeItem(imageEl);
				this.node.removeEmptyNode(refer, null);
			} else if (this.format.isLine(existElement)) {
				const refer = domUtils.getParentElement(imageEl, function (current) {
					return current.parentNode === existElement;
				});
				existElement = this.node.split(existElement, refer);
				existElement.parentNode.insertBefore(container, existElement);
				domUtils.removeItem(imageEl);
				this.node.removeEmptyNode(existElement, null);
				if (existElement.children.length === 0) existElement.innerHTML = this.node.removeWhiteSpace(existElement.innerHTML);
			} else {
				if (this.format.isLine(existElement.parentNode)) {
					const formats = existElement.parentNode;
					formats.parentNode.insertBefore(container, existElement.previousSibling ? formats.nextElementSibling : formats);
					domUtils.removeItem(existElement);
				} else {
					existElement.parentNode.replaceChild(container, existElement);
				}
			}

			this._element = imageEl = container.querySelector('img');
			this._cover = cover;
			this._container = container;
		}

		// size
		if (this._resizing) {
			imageEl.setAttribute('data-se-proportion', !!this.proportion.checked);
			if (changeSize) {
				this.applySize(width, height);
			}
		}

		// transform
		if (modifiedCaption || (!this._onlyPercentage && changeSize)) {
			if (/\d+/.test(imageEl.style.height) || (this.figure.isVertical && this.captionCheckEl.checked)) {
				if (/auto|%$/.test(width) || /auto|%$/.test(height)) {
					this.figure.deleteTransform(imageEl);
				} else {
					this.figure.setTransform(imageEl, width, height);
				}
			}
		}

		// align
		this.figure.setAlign(imageEl, this._align);
	},

	_openTab: function (e) {
		const modalForm = this.modal.form;
		const targetElement = e === 'init' ? modalForm.querySelector('._se_tab_link') : e.target;

		if (!/^BUTTON$/i.test(targetElement.tagName)) {
			return false;
		}

		// Declare all variables
		const tabName = targetElement.getAttribute('data-tab-link');
		let i, tabContent, tabLinks;

		// Get all elements with class="tabcontent" and hide them
		tabContent = modalForm.getElementsByClassName('_se_tab_content');
		for (i = 0; i < tabContent.length; i++) {
			tabContent[i].style.display = 'none';
		}

		// Get all elements with class="tablinks" and remove the class "active"
		tabLinks = modalForm.getElementsByClassName('_se_tab_link');
		for (i = 0; i < tabLinks.length; i++) {
			domUtils.removeClass(tabLinks[i], 'active');
		}

		// Show the current tab, and add an "active" class to the button that opened the tab
		modalForm.querySelector('._se_tab_content_' + tabName).style.display = 'block';
		domUtils.addClass(targetElement, 'active');

		// focus
		if (e !== 'init') {
			if (tabName === 'image') {
				this.focusElement.focus();
			} else if (tabName === 'url') {
				this.anchor.urlInput.focus();
			}
		}

		return false;
	},

	applySize: function (w, h) {
		if (!w) w = this.inputX.value || this.options.get('imageWidth');
		if (!h) h = this.inputY.value || this.options.get('imageHeight');
		if (this._onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w)) w += '%';
		}
		this.figure.setSize(w, h, null);
	},

	create: function (src, anchor, width, height, align, file, alt) {
		let oImg = domUtils.createElement('IMG');
		oImg.src = src;
		oImg.alt = alt;
		oImg.setAttribute('data-se-rotate', '0');
		anchor = this._setAnchor(oImg, anchor ? anchor.cloneNode(false) : null);

		if (this._resizing) {
			oImg.setAttribute('data-se-proportion', !!this.proportion.checked);
		}

		const figureInfo = Figure.CreateContainer(anchor, 'se-image-container');
		const cover = figureInfo.cover;
		const container = figureInfo.container;

		// caption
		if (this.captionCheckEl.checked) {
			this._caption = this._caption = Figure.CreateCaption(cover, this.lang.caption);
			this._caption.setAttribute('contenteditable', false);
		}

		this._element = oImg;
		this._cover = cover;
		this._container = container;
		this.figure.open(oImg, this._nonResizing, true);

		// set size
		this.applySize(width, height);

		// align
		this.figure.setAlign(oImg, align);

		oImg.onload = OnloadImg.bind(this, oImg, this._svgDefaultSize, container);
		if (this.component.insert(container, true, false, true)) this.fileManager.setInfo(oImg, file);
	},

	_updateSrc: function (src, element, file) {
		element.src = src;
		this._w.setTimeout(this.fileManager.setInfo.bind(this.fileManager, element, file));
		this.init();
		this.component.select(element, 'image');
	},

	_register: function (info, response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file; i < len; i++) {
			file = { name: fileList[i].name, size: fileList[i].size };
			if (info.isUpdate) {
				this._updateSrc(fileList[i].url, info.element, file);
				break;
			} else {
				this.create(fileList[i].url, info.anchor, info.inputWidth, info.inputHeight, info.align, file, info.alt);
			}
		}
	},

	_serverUpload: function (info, files) {
		if (!files) return;
		if (typeof files === 'string') {
			this._error(files, null);
			return;
		}

		// server upload
		const imageUploadUrl = this.options.get('imageUploadUrl');
		if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
			this.fileManager.upload(imageUploadUrl, this.options.get('imageUploadHeader'), files, UploadCallBack.bind(this, info), this.events.onImageUploadError);
		} else {
			this._setBase64(files, info.anchor, info.inputWidth, info.inputHeight, info.align, info.alt, info.isUpdate);
		}
	},

	_setBase64: function (files, anchor, width, height, align, alt, isUpdate) {
		try {
			const filesLen = this.modal.isUpdate ? 1 : files.length;
			this._base64RenderIndex = filesLen;
			const wFileReader = this._w.FileReader;
			const filesStack = [filesLen];
			this.inputX.value = width;
			this.inputY.value = height;

			for (let i = 0, reader, file; i < filesLen; i++) {
				reader = new wFileReader();
				file = files[i];

				reader.onload = function (reader, update, updateElement, file, index) {
					filesStack[index] = { result: reader.result, file: file };

					if (--this._base64RenderIndex === 0) {
						this._onRenderBase64(update, filesStack, updateElement, anchor, width, height, align, alt);
						this.editor._closeLoading();
					}
				}.bind(this, reader, isUpdate, this._element, file, i);

				reader.readAsDataURL(file);
			}
		} catch (error) {
			this.editor._closeLoading();
			throw Error('[SUNEDITOR.plugins.image._setBase64.fail] ' + error.message);
		}
	},

	_onRenderBase64: function (update, filesStack, updateElement, anchor, width, height, align, alt) {
		for (let i = 0, len = filesStack.length; i < len; i++) {
			if (update) {
				this._element.setAttribute('data-se-file-name', filesStack[i].file.name);
				this._element.setAttribute('data-se-file-size', filesStack[i].file.size);
				this._updateSrc(filesStack[i].result, updateElement, filesStack[i].file);
			} else {
				this.create(filesStack[i].result, anchor, width, height, align, filesStack[i].file, alt);
			}
		}
	},

	_setAnchor: function (imgTag, anchor) {
		if (anchor) {
			anchor.setAttribute('data-se-image-link', 'image');
			imgTag.setAttribute('data-se-image-link', anchor.href);
			anchor.appendChild(imgTag);
			return anchor;
		}

		return imgTag;
	},

	_error: function (message, response) {
		if (typeof this.events.onImageUploadError !== 'function' || this.events.onImageUploadError(message, response)) {
			this.notice.open(message);
			throw Error('[SUNEDITOR.plugin.image.error] response: ' + message);
		}
	},

	constructor: Image_
};

function FileCheckHandler(element) {
	this.ready(element);
	const line = this.format.getLine(element);
	if (line) this._align = line.style.textAlign || line.style.float;

	this._update(this._origin_w, this._origin_h);

	return element;
}

function UploadCallBack(info, xmlHttp) {
	if (typeof this.events.imageUploadHandler === 'function') {
		this.events.imageUploadHandler(xmlHttp, info);
	} else {
		const response = this._w.JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response.errorMessage, response);
		} else {
			this._register(info, response);
		}
	}
}

function RemoveSelectedFiles() {
	this.imgInputFile.value = '';
	if (this.imgUrlFile) {
		this.imgUrlFile.removeAttribute('disabled');
		this.previewSrc.style.textDecoration = '';
	}
}

function OnInputSize(xy, e) {
	if (e.keyCode === 32) {
		e.preventDefault();
		return;
	}

	if (xy === 'x' && this._onlyPercentage && e.target.value > 100) {
		e.target.value = 100;
	} else if (this.proportion.checked) {
		const ratioSize = Figure.CalcRatio(this.inputX.value, this.inputY.value, this.sizeUnit, this._ratio);
		if (xy === 'x') {
			this.inputY.value = ratioSize.h;
		} else {
			this.inputX.value = ratioSize.w;
		}
	}
}

function OnChangeRatio() {
	this._ratio = this.proportion.checked ? Figure.GetRatio(this.inputX.value, this.inputY.value, this.sizeUnit) : { w: 1, h: 1 };
}

function OnClickRevert() {
	if (this._onlyPercentage) {
		this.inputX.value = this._origin_w > 100 ? 100 : this._origin_w;
	} else {
		this.inputX.value = this._origin_w;
		this.inputY.value = this._origin_h;
	}
}

function OnLinkPreview(e) {
	const value = e.target.value.trim();
	this._linkValue = this.previewSrc.textContent = !value ? '' : this.options.get('linkProtocol') && value.indexOf('://') === -1 && value.indexOf('#') !== 0 ? this.options.get('linkProtocol') + value : value.indexOf('://') === -1 ? '/' + value : value;
}

function OnfileInputChange() {
	if (!this.imgInputFile.value) {
		this.imgUrlFile.removeAttribute('disabled');
		this.previewSrc.style.textDecoration = '';
	} else {
		this.imgUrlFile.setAttribute('disabled', true);
		this.previewSrc.style.textDecoration = 'line-through';
	}
}

function OpenGallery() {
	this.gallery.open(_setUrlInput.bind(this));
}

function _setUrlInput(target) {
	this.altText.value = target.alt;
	this._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = target.src;
	this.imgUrlFile.focus();
}

function OnloadImg(oImg, _svgDefaultSize, container) {
	// svg exception handling
	if (oImg.offsetWidth === 0) this.applySize(_svgDefaultSize, '');
	if (this.options.get('mediaAutoSelect')) {
		this.init();
		this.component.select(oImg, 'image');
	} else {
		const line = this.format.addLine(container, null);
		if (line) this.setRange(line, 0, line, 0);
	}
}

function CreateHTML_modal(editor) {
	const options = editor.options;
	const lang = editor.lang;
	let html =
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close close" title="' +
		lang.close +
		'" aria-label="' +
		lang.close +
		'">' +
		editor.icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.image_modal_title +
		'</span>' +
		'</div>' +
		'<div class="se-modal-tabs">' +
		'<button type="button" class="_se_tab_link active" data-tab-link="image">' +
		lang.image +
		'</button>' +
		'<button type="button" class="_se_tab_link" data-tab-link="url">' +
		lang.link +
		'</button>' +
		'</div>' +
		'<form method="post" enctype="multipart/form-data">' +
		'<div class="_se_tab_content _se_tab_content_image">' +
		'<div class="se-modal-body"><div style="border-bottom: 1px dashed #ccc;">';

	if (options.get('imageFileInput')) {
		html +=
			'<div class="se-modal-form">' +
			'<label>' +
			lang.image_modal_file +
			'</label>' +
			'<div class="se-modal-form-files">' +
			'<input class="se-input-form _se_image_file" data-focus type="file" accept="' +
			options.get('imageAccept') +
			'"' +
			(options.get('imageMultipleFile') ? ' multiple="multiple"' : '') +
			'/>' +
			'<button type="button" class="se-btn se-modal-files-edge-button se-file-remove" title="' +
			lang.remove +
			'" aria-label="' +
			lang.remove +
			'">' +
			editor.icons.cancel +
			'</button>' +
			'</div>' +
			'</div>';
	}

	if (options.get('imageUrlInput')) {
		html +=
			'<div class="se-modal-form">' +
			'<label>' +
			lang.image_modal_url +
			'</label>' +
			'<div class="se-modal-form-files">' +
			'<input class="se-input-form se-input-url _se_image_url" data-focus type="text" />' +
			(options.get('imageGalleryUrl') && editor.plugins.imageGallery ? '<button type="button" class="se-btn se-modal-files-edge-button __se__gallery" title="' + lang.imageGallery + '" aria-label="' + lang.imageGallery + '">' + editor.icons.image_gallery + '</button>' : '') +
			'</div>' +
			'<pre class="se-link-preview"></pre>' +
			'</div>';
	}

	html += '</div>' + '<div class="se-modal-form">' + '<label>' + lang.image_modal_altText + '</label><input class="se-input-form _se_image_alt" type="text" />' + '</div>';

	if (options.get('imageResizing')) {
		const onlyPercentage = options.get('imageSizeOnlyPercentage');
		const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
		const heightDisplay = !options.get('imageHeightShow') ? ' style="display: none !important;"' : '';
		html += '<div class="se-modal-form">';
		if (onlyPercentage || !options.get('imageHeightShow')) {
			html += '<div class="se-modal-size-text">' + '<label class="size-w">' + lang.size + '</label>' + '</div>';
		} else {
			html += '<div class="se-modal-size-text">' + '<label class="size-w">' + lang.width + '</label>' + '<label class="se-modal-size-x">&nbsp;</label>' + '<label class="size-h">' + lang.height + '</label>' + '</div>';
		}
		html +=
			'<input class="se-input-control _se_image_size_x" placeholder="auto"' +
			(onlyPercentage ? ' type="number" min="1"' : 'type="text"') +
			(onlyPercentage ? ' max="100"' : '') +
			' />' +
			'<label class="se-modal-size-x"' +
			heightDisplay +
			'>' +
			(onlyPercentage ? '%' : 'x') +
			'</label>' +
			'<input type="text" class="se-input-control _se_image_size_y" placeholder="auto"' +
			onlyPercentDisplay +
			(onlyPercentage ? ' max="100"' : '') +
			heightDisplay +
			'/>' +
			'<label' +
			onlyPercentDisplay +
			heightDisplay +
			'><input type="checkbox" class="se-modal-btn-check _se_image_check_proportion" checked/>&nbsp;' +
			lang.proportion +
			'</label>' +
			'<button type="button" title="' +
			lang.revertButton +
			'" aria-label="' +
			lang.revertButton +
			'" class="se-btn se-modal-btn-revert">' +
			editor.icons.revert +
			'</button>' +
			'</div>';
	}

	html +=
		'<div class="se-modal-form se-modal-form-footer">' +
		'<label><input type="checkbox" class="se-modal-btn-check _se_image_check_caption" />&nbsp;' +
		lang.caption +
		'</label>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="se-anchor-editor _se_tab_content _se_tab_content_url" style="display: none"></div>' +
		'<div class="se-modal-footer">' +
		'<div class="se-figure-align">' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="none" checked>' +
		lang.basic +
		'</label>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="left">' +
		lang.left +
		'</label>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="center">' +
		lang.center +
		'</label>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="right">' +
		lang.right +
		'</label>' +
		'</div>' +
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

export default Image_;
