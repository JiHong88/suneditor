'use strict';

import EditorInterface from '../../interface/editor';
import { Modal, Figure, FileManager, ModalAnchorEditor } from '../../modules';
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
	const imageControls = options.imageControls;

	// image controls
	let showAlign = false;
	for (let i = 0; i < imageControls.length; i++) {
		if (!imageControls[i]) break;
		for (let j = 0; j < imageControls[i].length; j++) {
			this._rotation = /rotate/.test(imageControls[i][j]);
			showAlign = /align/.test(imageControls[i][j]);
		}
	}
	if (!showAlign) modalEl.querySelector('._se_image_align').style.display = 'none';

	// modules
	this.anchor = new ModalAnchorEditor(this, modalEl);
	this.modal = new Modal(this, modalEl);
	this.fileManager = new FileManager(this, { tagNames: ['img'], eventHandler: this.events.onImageUpload, checkHandler: FileCheckHandler.bind(this), figure: null });
	this.figure = new Figure(this, true, imageControls);

	// members
	this.imgInputFile = modalEl.querySelector('._se_image_file');
	this.imgUrlFile = modalEl.querySelector('._se_image_url');
	this.focusElement = this.imgInputFile || this.imgUrlFile;
	this.altText = modalEl.querySelector('._se_image_alt');
	this.captionCheckEl = modalEl.querySelector('._se_image_check_caption');
	this.previewSrc = modalEl.querySelector('._se_tab_content_image .se-link-preview');
	this.sizeUnit = options._imageSizeUnit;
	this.proportion = {};
	this.inputX = {};
	this.inputY = {};
	this._linkElement = null;
	this._linkValue = '';
	this._align = 'none';
	this._floatClassRegExp = '__se__float\\-[a-z]+';
	this._svgDefaultSize = '30%';
	this._base64RenderIndex = 0;
	this._element = null;
	this._cover = null;
	this._container = null;
	this._resizing = options.imageResizing;

	// @override resizing properties
	
	this._defaultSizeX = 'auto';
	this._defaultSizeY = 'auto';
	this._origin_w = options.imageWidth === 'auto' ? '' : options.imageWidth;
	this._origin_h = options.imageHeight === 'auto' ? '' : options.imageHeight;
	this._resizeDotHide = !options.imageHeightShow;
	this._onlyPercentage = options.imageSizeOnlyPercentage;
	this._proportionChecked = true;
	
	this._captionChecked = false;
	this._caption = null;

	

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
	 * @returns {boolean | undefined}
	 */
	modalAction: function () {
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
		} else if (this.imgUrlFile && this._linkValue.length > 0) {
			result = this._submitURL(this._linkValue);
		}

		return result;
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
		this._openTab('init');

		if (this._resizing) {
			this.inputX.value = this.options.imageWidth === this._defaultSizeX ? '' : this.options.imageWidth;
			this.inputY.value = this.options.imageHeight === this._defaultSizeY ? '' : this.options.imageHeight;
			this.proportion.checked = true;
		}

		this.anchor.init();
	},

	/**
	 * @override fileManager
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

		const figureInfo = this.figure.open(element);
		this.anchor.set(/^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null);
		
		this._linkElement = this.anchor.currentTarget;
		this._element = element;
		this._cover = figureInfo.cover;
		this._container = figureInfo.container;
		this._caption = figureInfo.caption;
		this._align = element.style.float || element.getAttribute('data-align') || 'none';
		element.style.float = '';

		this._origin_w = figureInfo.w || element.style.width || element.width || '';
		this._origin_h = figureInfo.h || element.style.height || element.height || '';
		this.altText.value = this._element.alt;

		if (this.imgUrlFile) this._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = this._element.src;

		(this.modal.form.querySelector('input[name="suneditor_image_radio"][value="' + this._align + '"]') || this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]')).checked = true;
		this._align = this.modal.form.querySelector('input[name="suneditor_image_radio"]:checked').value;
		this._captionChecked = this.captionCheckEl.checked = !!this._caption;

		if (this._resizing) {
			this.plugins.resizing._module_setModifyInputSize.call(this);
		}
	},

	/**
	 * @override fileManager
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

	/**
	 * @override figure
	 * @param {Element} target Target element
	 * @param {string} command Command
	 * @param {{w: number, h: number}|number|("none|"left"|"center"|"right")|boolean} value Command value
	 */
	figureAction: function (target, command, value) {
		switch (command) {
			case 'edit':
				this.ready(target);
				this.open();
				break;
			case 'remove':
				this.destroy();
				break;
			case 'align':
				this.figure.setAlign(target, value);
				break;
			case 'resize':
				// value = {w, h}
				break;
			case 'resize_percent':
				// value = 100
				break;
			case 'auto':
				break;
			case 'revert':
				break;
			case 'rotate':
				break;
			case 'mirror':
				break;
			case 'caption':
				this._captionChecked = value;
				break;
		}
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

		try {
			const file = { name: url.split('/').pop(), size: 0 };
			if (this.modal.isUpdate) this._updateSrc(url, this._element, file);
			else this._createComp(url, this.anchor.create(true), this.inputX.value, this.inputY.value, this._align, file, this.altText.value);
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

		if (cover === null || container === null) {
			isNewContainer = true;
			imageEl = this._element.cloneNode(true);
			const figureInfo = Figure.CreateContainer(imageEl, 'se-image-container');
			cover = figureInfo.cover;
			container = figureInfo.container;
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
		imageEl.alt = this.altText.value;

		// caption
		let modifiedCaption = false;
		if (this._captionChecked) {
			if (!this._caption) {
				this._caption = this.component.createMediaCaption.call(cover);
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
			imageEl.setAttribute('data-image-link', '');
			if (cover.contains(this._linkElement)) {
				const newEl = imageEl.cloneNode(true);
				cover.removeChild(this._linkElement);
				cover.insertBefore(newEl, this._caption);
				imageEl = newEl;
			}
		}

		if (isNewContainer) {
			let existElement = this.format.isBlock(imageEl.parentNode) || domUtils.isWysiwygFrame(imageEl.parentNode) ? imageEl : /^A$/i.test(imageEl.parentNode.nodeName) ? imageEl.parentNode : this.format.getLine(imageEl) || imageEl;

			if (domUtils.isListCell(existElement)) {
				const refer = domUtils.getParentElement(imageEl, function (current) {
					return current.parentNode === existElement;
				});
				existElement.insertBefore(container, refer);
				domUtils.removeItem(imageEl);
				this.node.removeEmptyNode(refer, null);
			} else if (domUtils.isFormatElement(existElement)) {
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

			imageEl = container.querySelector('img');

			this._element = imageEl;
			this._cover = cover;
			this._container = container;
		}

		// transform
		if (modifiedCaption || (!this._onlyPercentage && changeSize)) {
			if (!init && (/\d+/.test(imageEl.style.height) || (this.figure.isVertical && this._captionChecked))) {
				if (/%$/.test(this.inputX.value) || /%$/.test(this.inputY.value)) {
					//@todo this.plugins.resizing.resetTransform.call(this, imageEl);
				} else {
					//@todo this.plugins.resizing.setTransformSize.call(this, imageEl, numbers.get(this.inputX.value, 0), numbers.get(this.inputY.value, 0));
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
		this.figure.setAlign(imageEl, this._align);

		// set imagesInfo
		if (init) {
			this.fileManager.setInfo(imageEl, null);
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
			this.setPercentSize.call(this, w, h);
			return true;
		} else if ((!w || w === 'auto') && (!h || h === 'auto')) {
			this.setAutoSize.call(this);
		} else {
			this.setSize.call(this, w, h, false);
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
		// this.context.resizing._resize_plugin = 'image';

		let oImg = domUtils.createElement('IMG');
		oImg.src = src;
		oImg.alt = alt;
		oImg.setAttribute('data-rotate', '0');
		anchor = this._setAnchor(oImg, anchor);

		if (this._resizing) {
			oImg.setAttribute('data-proportion', this._proportionChecked);
		}

		const figureInfo = Figure.CreateContainer(anchor, 'se-image-container');
		const cover = figureInfo.cover;
		const container = figureInfo.container;

		// caption
		if (this._captionChecked) {
			this._caption = this.component.createMediaCaption.call(cover);
			this._caption.setAttribute('contenteditable', false);
		}

		this._element = oImg;
		this._cover = cover;
		this._container = container;

		// set size
		this._applySize(width, height);

		// align
		this.figure.setAlign(oImg, align);

		oImg.onload = OnloadImg.bind(this, oImg, this._svgDefaultSize, container);
		if (this.component.insert(container, true, false, true)) this.fileManager.setInfo(oImg, file);
		// this.context.resizing._resize_plugin = '';
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
	 * @override resizing, @inst
	 */
	setSize: function (w, h, notResetPercentage, direction) {
		const onlyW = /^(rw|lw)$/.test(direction);
		const onlyH = /^(th|bh)$/.test(direction);

		if (!onlyH) {
			this._element.style.width = numbers.is(w) ? w + this.sizeUnit : w;
			this.cancelPercentAttr.call(this);
		}
		if (!onlyW) {
			this._element.style.height = numbers.is(h) ? h + this.sizeUnit : /%$/.test(h) ? '' : h;
		}

		if (this._align === 'center') this.figure.setAlign(this._element, this._align);
		if (!notResetPercentage) this._element.removeAttribute('data-percentage');

		// save current size
		// this.plugins.resizing._module_saveCurrentSize.call(this, this);@todo
	},

	/**
	 * @override resizing @inst
	 */
	setAutoSize: function () {
		this.plugins.resizing.resetTransform.call(this, this._element);
		this.cancelPercentAttr.call(this);

		this._element.style.maxWidth = '';
		this._element.style.width = '';
		this._element.style.height = '';
		this._cover.style.width = '';
		this._cover.style.height = '';

		this.figure.setAlign(this._element, this._align);
		this._element.setAttribute('data-percentage', 'auto,auto');

		// save current size
		// this.plugins.resizing._module_saveCurrentSize.call(this, this);@todo
	},

	/**
	 * @override resizing @inst
	 */
	setPercentSize: function (w, h) {
		h = !!h && !/%$/.test(h) && !numbers.get(h, 0) ? (numbers.is(h) ? h + '%' : h) : numbers.is(h) ? h + this.sizeUnit : h || '';
		const heightPercentage = /%$/.test(h);

		this._container.style.width = numbers.is(w) ? w + '%' : w;
		this._container.style.height = '';
		this._cover.style.width = '100%';
		this._cover.style.height = !heightPercentage ? '' : h;
		this._element.style.width = '100%';
		this._element.style.height = heightPercentage ? '' : h;
		this._element.style.maxWidth = '';

		if (this._align === 'center') this.figure.setAlign(this._element, this._align);

		this._element.setAttribute('data-percentage', w + ',' + h);
		// this.plugins.resizing.setCaptionPosition.call(this, this._element);@todo

		// save current size
		// this.plugins.resizing._module_saveCurrentSize.call(this, this);@todo
	},

	/**
	 * @override resizing @inst
	 */
	cancelPercentAttr: function () {
		this._cover.style.width = '';
		this._cover.style.height = '';
		this._container.style.width = '';
		this._container.style.height = '';

		domUtils.removeClass(this._container, this._floatClassRegExp);
		domUtils.addClass(this._container, '__se__float-' + this._align);

		if (this._align === 'center') this.figure.setAlign(this._element, this._align);
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
	setOriginSize: function () {
		const contextImage = this.context.image;
		contextImage._element.removeAttribute('data-percentage');

		this.plugins.resizing.resetTransform.call(this, contextImage._element);
		this.cancelPercentAttr.call(this);

		const originSize = (contextImage._element.getAttribute('data-origin') || '').split(',');
		const w = originSize[0];
		const h = originSize[1];

		if (originSize) {
			if (contextImage._onlyPercentage || (/%$/.test(w) && (/%$/.test(h) || !/\d/.test(h)))) {
				this.setPercentSize.call(this, w, h);
			} else {
				this.setSize.call(this, w, h);
			}

			// save current size
			this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
		}
	}
};

function FileCheckHandler(element) {
	this.ready(element);
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
	this._linkValue = this.textContent = !value ? '' : this.options.linkProtocol && value.indexOf('://') === -1 && value.indexOf('#') !== 0 ? this.options.linkProtocol + value : value.indexOf('://') === -1 ? '/' + value : value;
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
	thisGallery.open(_setUrlInput.bind(this));
}

function _setUrlInput(target) {
	this.altText.value = target.alt;
	this._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = target.src;
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

function CreateHTML_modal(editor, align) {
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
		'<div class="se-anchor-editor _se_tab_content _se_tab_content_url" style="display: none"></div>' +
		'<div class="se-modal-footer">' +
		'<div class="_se_image_align">' +
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
