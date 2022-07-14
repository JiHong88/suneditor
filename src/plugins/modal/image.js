'use strict';

import EditorInterface from '../../interface/editor';
import { Modal, Figure, FileManager, AnchorModalEditor } from '../../modules';
import { domUtils, numbers } from '../../helper';

const image = function (editor, target) {
	// plugin bisic properties
	EditorInterface.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.image;
	this.icon = this.icons.image;

	// create HTML
	const options = this.options;
	const modalEl = CreateHTML_modal(editor);

	// modules
	this.anchor = new AnchorModalEditor(this, modalEl);
	this.modal = new Modal(this, modalEl);
	this.fileManager = new FileManager(this, { tagNames: ['img'], eventHandler: this.events.onImageUpload, checkHandler: FileCheckHandler.bind(this), isActiveSizeModule: null });
	this.figure = new Figure(this);

	// members
	this.imgInputFile = modalEl.querySelector('._se_image_file');
	this.imgUrlFile = modalEl.querySelector('._se_image_url');
	this.focusElement = this.imgInputFile || this.imgUrlFile;
	this.altText = modalEl.querySelector('._se_image_alt');
	this.captionCheckEl = modalEl.querySelector('._se_image_check_caption');
	this.previewSrc = modalEl.querySelector('._se_tab_content_image .se-link-preview');
	this.sizeUnit = options._imageSizeUnit;
	this._linkElement = '';
	this._altText = '';
	this._align = 'none';
	this._floatClassRegExp = '__se__float\\-[a-z]+';
	this._v_src = { _linkValue: '' };
	this._svgDefaultSize = '30%';
	this._base64RenderIndex = 0;
	this._element = null;
	this._cover = null;
	this._container = null;

	// @override resizing properties
	this._element_w = 1;
	this._element_h = 1;
	this._element_l = 0;
	this._element_t = 0;
	this._defaultSizeX = 'auto';
	this._defaultSizeY = 'auto';
	this._origin_w = options.imageWidth === 'auto' ? '' : options.imageWidth;
	this._origin_h = options.imageHeight === 'auto' ? '' : options.imageHeight;
	this._resizing = options.imageResizing;
	this._resizeDotHide = !options.imageHeightShow;
	this._rotation = options.imageRotation;
	this._alignHide = !options.imageAlignShow;
	this._onlyPercentage = options.imageSizeOnlyPercentage;
	this._proportionChecked = true;
	this._ratio = false;
	this._ratioX = 1;
	this._ratioY = 1;
	this._captionShow = true;
	this._captionChecked = false;
	this._caption = null;
	this.captionCheckEl = null;
	this.proportion = {};
	this.inputX = {};
	this.inputY = {};

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
		this.inputX.value = options.imageWidth;
		this.inputY.value = options.imageHeight;

		this.inputX.addEventListener('keyup', this.setInputSize.bind(core, 'x'));
		this.inputY.addEventListener('keyup', this.setInputSize.bind(core, 'y'));

		this.inputX.addEventListener('change', this.setRatio.bind(core));
		this.inputY.addEventListener('change', this.setRatio.bind(core));
		this.proportion.addEventListener('change', this.setRatio.bind(core));

		modalEl.querySelector('.se-modal-btn-revert').addEventListener('click', this.sizeRevert.bind(core));
	}
};

image.type = 'modal';
image.className = '';
image.prototype = {
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
			this.inputX.value = this._origin_w = this.options.imageWidth === this._defaultSizeX ? '' : this.options.imageWidth;
			this.inputY.value = this._origin_h = this.options.imageHeight === this._defaultSizeY ? '' : this.options.imageHeight;
			if (this.imgInputFile && this.options.imageMultipleFile) this.imgInputFile.setAttribute('multiple', 'multiple');
		} else {
			if (this.imgInputFile && this.options.imageMultipleFile) this.imgInputFile.removeAttribute('multiple');
		}
		this.anchor.on(isUpdate);
	},

	/**
	 * @override modal
	 */
	modalAction: function () {
		this._altText = this.altText.value;
		this._align = this.modal.form.querySelector('input[name="suneditor_image_radio"]:checked').value;
		this._captionChecked = this.captionCheckEl.checked;
		if (this._resizing) this._proportionChecked = this.proportion.checked;
		
		if (this.modal.isUpdate) {
			this._update(false, true, false);
			return true;
		}
		
		let result;
		if (this.imgInputFile && this.imgInputFile.files.length > 0) {
			result = this._submitFile(this.imgInputFile.files);
		} else if (this.imgUrlFile && this._v_src._linkValue.length > 0) {
			result = this._submitURL(this._v_src._linkValue);
		}

		return result;
	},

	/**
	 * @override modal
	 */
	init: function () {
		if (this.imgInputFile) this.imgInputFile.value = '';
		if (this.imgUrlFile) this._v_src._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = '';
		if (this.imgInputFile && this.imgUrlFile) {
			this.imgUrlFile.removeAttribute('disabled');
			this.previewSrc.style.textDecoration = '';
		}

		this.altText.value = '';
		this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]').checked = true;
		this.captionCheckEl.checked = false;
		this._element = null;
		this._openTab('init');

		if (this._resizing) {
			this.inputX.value = this.options.imageWidth === this._defaultSizeX ? '' : this.options.imageWidth;
			this.inputY.value = this.options.imageHeight === this._defaultSizeY ? '' : this.options.imageHeight;
			this.proportion.checked = true;
			this._ratio = false;
			this._ratioX = 1;
			this._ratioY = 1;
		}

		this.anchor.init();
	},

	/**
	 * @override core, fileManager, resizing
	 * @description It is called from core.mediaContainer.select
	 * @param {Element} element Target element
	 */
	select: function (element) {
		this.ready(element);
	},

	/**
	 * @override fileManager
	 */
	ready: function (element) {
		if (!element) return;
		const size = false;//@todo this.plugins.resizing.call_controller_resize.call(this, element, 'image');
		this.anchor.set(/^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null);

		this._linkElement = this.anchor.currentTarget;
		this._element = element;
		this._cover = domUtils.getParentElement(element, 'FIGURE');
		this._container = domUtils.getParentElement(element, this.component.is);
		this._caption = domUtils.getEdgeChild(this._cover, 'FIGCAPTION');
		this._align = element.style.float || element.getAttribute('data-align') || 'none';
		element.style.float = '';

		if (size) {
			this._element_w = size.w;
			this._element_h = size.h;
			this._element_t = size.t;
			this._element_l = size.l;
		}

		let userSize = element.getAttribute('data-size') || element.getAttribute('data-origin');
		let w, h;
		if (userSize) {
			userSize = userSize.split(',');
			w = userSize[0];
			h = userSize[1];
		} else if (size) {
			w = size.w;
			h = size.h;
		}

		this._origin_w = w || element.style.width || element.width || '';
		this._origin_h = h || element.style.height || element.height || '';
	},

	/**
	 * @override fileManager, figure
	 */
	destroy: function (element) {
		const imageEl = element || this._element;
		const imageContainer = domUtils.getParentElement(imageEl, this.component.is) || imageEl;
		const focusEl = imageContainer.previousElementSibling || imageContainer.nextElementSibling;

		const emptyDiv = imageContainer.parentNode;
		domUtils.removeItem(imageContainer);
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
			if (/image/i.test(fileList[i].type)) {
				files.push(fileList[i]);
				fileSize += fileList[i].size;
			}
		}

		const limitSize = this.options.imageUploadSizeLimit;
		if (limitSize > 0 && fileSize + this.fileManager.getSize() > limitSize) {
			const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable total images: ' + limitSize / 1000 + 'KB';
			if (typeof this.events.onImageUploadError !== 'function' || this.events.onImageUploadError(err, { limitSize: limitSize, currentSize: infoSize, uploadSize: fileSize })) {
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
			alt: this._altText
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
		if (!url) url = this.context.image._v_src._linkValue;
		if (!url) return false;

		try {
			const file = { name: url.split('/').pop(), size: 0 };
			if (this.context.modal.isUpdate) this._updateSrc(url, this._element, file);
			else this._createComp(url, this.anchor.create(true), this.inputX.value, this.inputY.value, this._align, file, this._altText);
		} catch (error) {
			console.warn('[SUNEDITOR.image.URLRendering.fail] ' + error.message);
			return true;
		}
		
		return true;
	},

	_update: function (init, openController, notHistoryPush) {
		let imageEl = this._element;
		let cover = this._cover;
		let container = this._container;
		let isNewContainer = false;

		if (cover === null) {
			isNewContainer = true;
			imageEl = this._element.cloneNode(true);
			cover = this.component.createMediaCover.call(this, imageEl);
		}

		if (container === null) {
			cover = cover.cloneNode(true);
			imageEl = cover.querySelector('img');
			isNewContainer = true;
			container = this.component.createMediaContainer.call(this, cover, 'se-image-container');
		} else if (isNewContainer) {
			container.innerHTML = '';
			container.appendChild(cover);
			this._cover = cover;
			this._element = imageEl;
			isNewContainer = false;
		}

		// check size
		let changeSize;
		const x = numbers.is(this.inputX.value) ? this.inputX.value + this.sizeUnit : this.inputX.value;
		const y = numbers.is(this.inputY.value) ? this.inputY.value + this.sizeUnit : this.inputY.value;
		if (/%$/.test(imageEl.style.width)) {
			changeSize = x !== container.style.width || y !== container.style.height;
		} else {
			changeSize = x !== imageEl.style.width || y !== imageEl.style.height;
		}

		// alt
		imageEl.alt = this._altText;

		// caption
		let modifiedCaption = false;
		if (this._captionChecked) {
			if (!this._caption) {
				this._caption = this.component.createMediaCaption.call(this);
				cover.appendChild(this._caption);
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
				this._linkElement.setAttribute('data-image-link', 'image');
			}
		} else if (this._linkElement !== null) {
			const imageElement = imageEl;
			imageElement.setAttribute('data-image-link', '');
			if (cover.contains(this._linkElement)) {
				const newEl = imageElement.cloneNode(true);
				cover.removeChild(this._linkElement);
				cover.insertBefore(newEl, this._caption);
				this._element = imageEl = newEl;
			}
		}

		if (isNewContainer) {
			let existElement =
				this.format.isBlock(this._element.parentNode) || domUtils.isWysiwygFrame(this._element.parentNode)
					? this._element
					: /^A$/i.test(this._element.parentNode.nodeName)
					? this._element.parentNode
					: this.format.getLine(this._element) || this._element;

			if (domUtils.isListCell(existElement)) {
				const refer = domUtils.getParentElement(this._element, function (current) {
					return current.parentNode === existElement;
				});
				existElement.insertBefore(container, refer);
				domUtils.removeItem(this._element);
				this.node.removeEmptyNode(refer, null);
			} else if (domUtils.isFormatElement(existElement)) {
				const refer = domUtils.getParentElement(this._element, function (current) {
					return current.parentNode === existElement;
				});
				existElement = this.node.split(existElement, refer);
				existElement.parentNode.insertBefore(container, existElement);
				domUtils.removeItem(this._element);
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

			imageEl = container.querySelector('img');

			this._element = imageEl;
			this._cover = cover;
			this._container = container;
		}

		// transform
		if (modifiedCaption || (!this._onlyPercentage && changeSize)) {
			if (!init && (/\d+/.test(imageEl.style.height) || (this.context.resizing._rotateVertical && this._captionChecked))) {
				if (/%$/.test(this.inputX.value) || /%$/.test(this.inputY.value)) {
					this.plugins.resizing.resetTransform.call(this, imageEl);
				} else {
					this.plugins.resizing.setTransformSize.call(this, imageEl, numbers.get(this.inputX.value, 0), numbers.get(this.inputY.value, 0));
				}
			}
		}

		// size
		if (this._resizing) {
			imageEl.setAttribute('data-proportion', this._proportionChecked);
			if (changeSize) {
				this._applySize(null, null);
			}
		}

		// align
		this.plugins.image.setAlign.call(this, null, imageEl, null, null);

		// set imagesInfo
		if (init) {
			this.plugins.fileManager.setInfo.call(imageEl, null);
		}

		if (openController) {
			this.component.select(imageEl, 'image');
		}

		// history stack
		if (!notHistoryPush) this.history.push(false);
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

	_applySize: function (w, h) {
		if (!w) w = this.inputX.value || this.options.imageWidth;
		if (!h) h = this.inputY.value || this.options.imageHeight;

		if ((this._onlyPercentage && !!w) || /%$/.test(w)) {
			this.plugins.image.setPercentSize.call(this, w, h);
			return true;
		} else if ((!w || w === 'auto') && (!h || h === 'auto')) {
			this.plugins.image.setAutoSize.call(this);
		} else {
			this.plugins.image.setSize.call(this, w, h, false);
		}

		return false;
	},

	_updateSrc: function (src, element, file) {
		element.src = src;
		this._w.setTimeout(this.fileManager.setInfo.bind(this.fileManager, element, file));
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
				this._createComp(fileList[i].url, info.anchor, info.inputWidth, info.inputHeight, info.align, file, info.alt);
			}
		}

		this.closeLoading();
	},

	_serverUpload: function (info, files) {
		if (!files) return;
		if (typeof files === 'string') {
			this._error(files, null);
			return;
		}

		// server upload
		const imageUploadUrl = this.options.imageUploadUrl;
		if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
			this.fileManager.upload(imageUploadUrl, this.options.imageUploadHeader, files, UploadCallBack.bind(this, info), this.events.onImageUploadError);
		} else {
			this._setBase64(this, files, info.anchor, info.inputWidth, info.inputHeight, info.align, info.alt, info.isUpdate);
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
						this.editor.closeLoading();
					}
				}.bind(this, reader, isUpdate, this._element, file, i);

				reader.readAsDataURL(file);
			}
		} catch (error) {
			this.editor.closeLoading();
			throw Error('[SUNEDITOR.plugins.image._setBase64.fail] ' + error.message);
		}
	},

	_onRenderBase64: function (update, filesStack, updateElement, anchor, width, height, align, alt) {
		for (let i = 0, len = filesStack.length; i < len; i++) {
			if (update) {
				this._element.setAttribute('data-file-name', filesStack[i].file.name);
				this._element.setAttribute('data-file-size', filesStack[i].file.size);
				this._updateSrc(filesStack[i].result, updateElement, filesStack[i].file);
			} else {
				this._createComp(filesStack[i].result, anchor, width, height, align, filesStack[i].file, alt);
			}
		}
	},

	_createComp: function (src, anchor, width, height, align, file, alt) {
		this.context.resizing._resize_plugin = 'image';

		let oImg = domUtils.createElement('IMG');
		oImg.src = src;
		oImg.alt = alt;
		oImg.setAttribute('data-rotate', '0');
		anchor = this._setAnchor(oImg, anchor);

		if (this._resizing) {
			oImg.setAttribute('data-proportion', this._proportionChecked);
		}

		const cover = this.component.createMediaCover.call(this, anchor);
		const container = this.component.createMediaContainer.call(this, cover, 'se-image-container');

		// caption
		if (this._captionChecked) {
			this._caption = this.component.createMediaCaption.call(this);
			this._caption.setAttribute('contenteditable', false);
			cover.appendChild(this._caption);
		}

		this._element = oImg;
		this._cover = cover;
		this._container = container;

		// set size
		this._applySize(width, height);

		// align
		this.setAlign.call(this, align, oImg, cover, container);

		oImg.onload = OnloadImg.bind(this, oImg, this._svgDefaultSize, container);
		if (this.component.insert(container, true, false, true)) this.plugins.fileManager.setInfo.call(oImg, file);
		this.context.resizing._resize_plugin = '';
	},

	_setAnchor: function (imgTag, anchor) {
		if (anchor) {
			anchor.setAttribute('data-image-link', 'image');
			imgTag.setAttribute('data-image-link', anchor.href);
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

	constructor: image
};

var a = {
	/**
	 * @Required @override fileManager, resizing
	 */
	openModify: function (notOpen) {
		const contextImage = this.context.image;
		if (contextImage.imgUrlFile) {
			contextImage._v_src._linkValue = contextImage.previewSrc.textContent = contextImage.imgUrlFile.value = contextImage._element.src;
		}
		contextImage._altText = contextImage.altText.value = contextImage._element.alt;
		(contextImage.modal.form.querySelector('input[name="suneditor_image_radio"][value="' + contextImage._align + '"]') || contextImage.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]')).checked = true;
		contextImage._align = contextImage.modal.form.querySelector('input[name="suneditor_image_radio"]:checked').value;
		contextImage._captionChecked = contextImage.captionCheckEl.checked = !!contextImage._caption;

		if (contextImage._resizing) {
			this.plugins.resizing._module_setModifyInputSize.call(this, contextImage, this.plugins.image);
		}

		if (!notOpen) this.plugins.modal.open.call(this, 'image', true);
	},

	///////////
	/**
	 * @override resizing
	 * @param {string} xy 'x': width, 'y': height
	 * @param {KeyboardEvent} e Event object
	 */
	setInputSize: function (xy, e) {
		if (e && e.keyCode === 32) {
			e.preventDefault();
			return;
		}

		this.plugins.resizing._module_setInputSize.call(this, this.context.image, xy);
	},

	/**
	 * @override resizing
	 */
	setRatio: function () {
		this.plugins.resizing._module_setRatio.call(this, this.context.image);
	},

	/**
	 * @override resizing
	 */
	sizeRevert: function () {
		this.plugins.resizing._module_sizeRevert.call(this, this.context.image);
	},

	/**
	 * @override resizing
	 */
	setSize: function (w, h, notResetPercentage, direction) {
		const contextImage = this.context.image;
		const onlyW = /^(rw|lw)$/.test(direction);
		const onlyH = /^(th|bh)$/.test(direction);

		if (!onlyH) {
			contextImage._element.style.width = numbers.is(w) ? w + contextImage.sizeUnit : w;
			this.plugins.image.cancelPercentAttr.call(this);
		}
		if (!onlyW) {
			contextImage._element.style.height = numbers.is(h) ? h + contextImage.sizeUnit : /%$/.test(h) ? '' : h;
		}

		if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);
		if (!notResetPercentage) contextImage._element.removeAttribute('data-percentage');

		// save current size
		this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
	},

	/**
	 * @override resizing
	 */
	setAutoSize: function () {
		const contextImage = this.context.image;

		this.plugins.resizing.resetTransform.call(this, contextImage._element);
		this.plugins.image.cancelPercentAttr.call(this);

		contextImage._element.style.maxWidth = '';
		contextImage._element.style.width = '';
		contextImage._element.style.height = '';
		contextImage._cover.style.width = '';
		contextImage._cover.style.height = '';

		this.plugins.image.setAlign.call(this, null, null, null, null);
		contextImage._element.setAttribute('data-percentage', 'auto,auto');

		// save current size
		this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
	},

	/**
	 * @override resizing
	 */
	setOriginSize: function () {
		const contextImage = this.context.image;
		contextImage._element.removeAttribute('data-percentage');

		this.plugins.resizing.resetTransform.call(this, contextImage._element);
		this.plugins.image.cancelPercentAttr.call(this);

		const originSize = (contextImage._element.getAttribute('data-origin') || '').split(',');
		const w = originSize[0];
		const h = originSize[1];

		if (originSize) {
			if (contextImage._onlyPercentage || (/%$/.test(w) && (/%$/.test(h) || !/\d/.test(h)))) {
				this.plugins.image.setPercentSize.call(this, w, h);
			} else {
				this.plugins.image.setSize.call(this, w, h);
			}

			// save current size
			this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
		}
	},

	/**
	 * @override resizing
	 */
	setPercentSize: function (w, h) {
		const contextImage = this.context.image;
		h = !!h && !/%$/.test(h) && !numbers.get(h, 0) ? (numbers.is(h) ? h + '%' : h) : numbers.is(h) ? h + contextImage.sizeUnit : h || '';
		const heightPercentage = /%$/.test(h);

		contextImage._container.style.width = numbers.is(w) ? w + '%' : w;
		contextImage._container.style.height = '';
		contextImage._cover.style.width = '100%';
		contextImage._cover.style.height = !heightPercentage ? '' : h;
		contextImage._element.style.width = '100%';
		contextImage._element.style.height = heightPercentage ? '' : h;
		contextImage._element.style.maxWidth = '';

		if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);

		contextImage._element.setAttribute('data-percentage', w + ',' + h);
		this.plugins.resizing.setCaptionPosition.call(this, contextImage._element);

		// save current size
		this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
	},

	/**
	 * @override resizing
	 */
	cancelPercentAttr: function () {
		const contextImage = this.context.image;

		contextImage._cover.style.width = '';
		contextImage._cover.style.height = '';
		contextImage._container.style.width = '';
		contextImage._container.style.height = '';

		domUtils.removeClass(contextImage._container, this.context.image._floatClassRegExp);
		domUtils.addClass(contextImage._container, '__se__float-' + contextImage._align);

		if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);
	},

	/**
	 * @override resizing
	 */
	setAlign: function (align, element, cover, container) {
		const contextImage = this.context.image;

		if (!align) align = contextImage._align;
		if (!element) element = contextImage._element;
		if (!cover) cover = contextImage._cover;
		if (!container) container = contextImage._container;

		if (align && align !== 'none') {
			cover.style.margin = 'auto';
		} else {
			cover.style.margin = '0';
		}

		if (/%$/.test(element.style.width) && align === 'center') {
			container.style.minWidth = '100%';
			cover.style.width = container.style.width;
		} else {
			container.style.minWidth = '';
			cover.style.width = this.context.resizing._rotateVertical ? element.style.height || element.offsetHeight : !element.style.width || element.style.width === 'auto' ? '' : element.style.width || '100%';
		}

		if (!domUtils.hasClass(container, '__se__float-' + align)) {
			domUtils.removeClass(container, contextImage._floatClassRegExp);
			domUtils.addClass(container, '__se__float-' + align);
		}

		element.setAttribute('data-align', align);
	}
};

function FileCheckHandler(element) {
	this.ready.call(this, element, null);
	this.openModify.call(this, true);
	// get size
	this.inputX.value = this._origin_w;
	this.inputY.value = this._origin_h;
	// get align
	const line = this.format.getLine(element);
	if (line) this._align = line.style.textAlign || line.style.float;

	this._update(true, false, true);
	this.init();

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

function OnLinkPreview(e) {
	const value = e.target.value.trim();
	this._v_src._linkValue = this.textContent = !value ? '' : this.options.linkProtocol && value.indexOf('://') === -1 && value.indexOf('#') !== 0 ? this.options.linkProtocol + value : value.indexOf('://') === -1 ? '/' + value : value;
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
	this.plugins.imageGallery.open(_setUrlInput.bind(this));
}

function _setUrlInput(target) {
	this.altText.value = target.alt;
	this._v_src._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = target.src;
	this.imgUrlFile.focus();
}

function OnloadImg(oImg, _svgDefaultSize, container) {
	// svg exception handling
	if (oImg.offsetWidth === 0) this._applySize(_svgDefaultSize, '');
	if (this.options.mediaAutoSelect) {
		this.component.select(oImg, 'image');
	} else {
		const line = this.format.addLine(container, null);
		if (line) this.setRange(line, 0, line, 0);
	}
}

function CreateHTML_modal(editor) {
	const option = editor.options;
	const lang = editor.lang;
	let html =
		'<div class="se-modal-header">' +
		'<button type="button" data-command="close" class="se-btn se-modal-close" class="close" title="' +
		lang.modalBox.close +
		'" aria-label="' +
		lang.modalBox.close +
		'">' +
		editor.icons.cancel +
		'</button>' +
		'<span class="se-modal-title">' +
		lang.modalBox.imageBox.title +
		'</span>' +
		'</div>' +
		'<div class="se-modal-tabs">' +
		'<button type="button" class="_se_tab_link active" data-tab-link="image">' +
		lang.toolbar.image +
		'</button>' +
		'<button type="button" class="_se_tab_link" data-tab-link="url">' +
		lang.toolbar.link +
		'</button>' +
		'</div>' +
		'<form method="post" enctype="multipart/form-data">' +
		'<div class="_se_tab_content _se_tab_content_image">' +
		'<div class="se-modal-body"><div style="border-bottom: 1px dashed #ccc;">';

	if (option.imageFileInput) {
		html +=
			'' +
			'<div class="se-modal-form">' +
			'<label>' +
			lang.modalBox.imageBox.file +
			'</label>' +
			'<div class="se-modal-form-files">' +
			'<input class="se-input-form _se_image_file" data-focus type="file" accept="' +
			option.imageAccept +
			'"' +
			(option.imageMultipleFile ? ' multiple="multiple"' : '') +
			'/>' +
			'<button type="button" class="se-btn se-modal-files-edge-button se-file-remove" title="' +
			lang.controller.remove +
			'" aria-label="' +
			lang.controller.remove +
			'">' +
			editor.icons.cancel +
			'</button>' +
			'</div>' +
			'</div>';
	}

	if (option.imageUrlInput) {
		html +=
			'' +
			'<div class="se-modal-form">' +
			'<label>' +
			lang.modalBox.imageBox.url +
			'</label>' +
			'<div class="se-modal-form-files">' +
			'<input class="se-input-form se-input-url _se_image_url" data-focus type="text" />' +
			(option.imageGalleryUrl && editor.plugins.imageGallery ? '<button type="button" class="se-btn se-modal-files-edge-button __se__gallery" title="' + lang.toolbar.imageGallery + '" aria-label="' + lang.toolbar.imageGallery + '">' + editor.icons.image_gallery + '</button>' : '') +
			'</div>' +
			'<pre class="se-link-preview"></pre>' +
			'</div>';
	}

	html += '</div>' + '<div class="se-modal-form">' + '<label>' + lang.modalBox.imageBox.altText + '</label><input class="se-input-form _se_image_alt" type="text" />' + '</div>';

	if (option.imageResizing) {
		const onlyPercentage = option.imageSizeOnlyPercentage;
		const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
		const heightDisplay = !option.imageHeightShow ? ' style="display: none !important;"' : '';
		html += '<div class="se-modal-form">';
		if (onlyPercentage || !option.imageHeightShow) {
			html += '' + '<div class="se-modal-size-text">' + '<label class="size-w">' + lang.modalBox.size + '</label>' + '</div>';
		} else {
			html += '' + '<div class="se-modal-size-text">' + '<label class="size-w">' + lang.modalBox.width + '</label>' + '<label class="se-modal-size-x">&nbsp;</label>' + '<label class="size-h">' + lang.modalBox.height + '</label>' + '</div>';
		}
		html +=
			'' +
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
			lang.modalBox.proportion +
			'</label>' +
			'<button type="button" title="' +
			lang.modalBox.revertButton +
			'" aria-label="' +
			lang.modalBox.revertButton +
			'" class="se-btn se-modal-btn-revert" style="float: right;">' +
			editor.icons.revert +
			'</button>' +
			'</div>';
	}

	html +=
		'' +
		'<div class="se-modal-form se-modal-form-footer">' +
		'<label><input type="checkbox" class="se-modal-btn-check _se_image_check_caption" />&nbsp;' +
		lang.modalBox.caption +
		'</label>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="se-anchor-editor _se_tab_content" style="display: none"></div>' +
		'<div class="se-modal-footer">' +
		'<div' +
		(option.imageAlignShow ? '' : ' style="display: none"') +
		'>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="none" checked>' +
		lang.modalBox.basic +
		'</label>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="left">' +
		lang.modalBox.left +
		'</label>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="center">' +
		lang.modalBox.center +
		'</label>' +
		'<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="right">' +
		lang.modalBox.right +
		'</label>' +
		'</div>' +
		'<button type="submit" class="se-btn-primary" title="' +
		lang.modalBox.submitButton +
		'" aria-label="' +
		lang.modalBox.submitButton +
		'"><span>' +
		lang.modalBox.submitButton +
		'</span></button>' +
		'</div>' +
		'</form>';

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

export default image;
