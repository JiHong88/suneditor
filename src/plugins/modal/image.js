import EditorInjector from '../../editorInjector';
import { Modal, Figure, FileManager, ModalAnchorEditor } from '../../modules';
import { domUtils, numbers, env } from '../../helper';
const { NO_EVENT } = env;

const Image_ = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.image;
	this.icon = 'image';

	// define plugin options
	this.pluginOptions = {
		canResize: pluginOptions.canResize === undefined ? true : pluginOptions.canResize,
		showHeightInput: pluginOptions.showHeightInput === undefined ? true : !!pluginOptions.showHeightInput,
		defaultWidth: !pluginOptions.defaultWidth ? 'auto' : numbers.is(pluginOptions.defaultWidth) ? pluginOptions.defaultWidth + 'px' : pluginOptions.defaultWidth,
		defaultHeight: !pluginOptions.defaultHeight ? 'auto' : numbers.is(pluginOptions.defaultHeight) ? pluginOptions.defaultHeight + 'px' : pluginOptions.defaultHeight,
		percentageOnlySize: !!pluginOptions.percentageOnlySize,
		createFileInput: pluginOptions.createFileInput === undefined ? true : pluginOptions.createFileInput,
		createUrlInput: pluginOptions.createUrlInput === undefined || !pluginOptions.createFileInput ? true : pluginOptions.createUrlInput,
		uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
		uploadHeaders: pluginOptions.uploadHeaders || null,
		uploadSizeLimit: /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null,
		uploadSingleSizeLimit: /\d+/.test(pluginOptions.uploadSingleSizeLimit) ? numbers.get(pluginOptions.uploadSingleSizeLimit, 0) : null,
		allowMultiple: !!pluginOptions.allowMultiple,
		acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'image/*' : pluginOptions.acceptedFormats.trim() || 'image/*'
	};

	// create HTML
	const sizeUnit = this.pluginOptions.percentageOnlySize ? '%' : 'px';
	const modalEl = CreateHTML_modal(editor, this.pluginOptions);
	const figureControls =
		pluginOptions.controls || !this.pluginOptions.canResize
			? [['mirror_h', 'mirror_v', 'align', 'caption', 'revert', 'edit', 'remove']]
			: [
					['resize_auto,100,75,50', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v'],
					['edit', 'align', 'caption', 'revert', 'remove']
			  ];

	// show align
	if (!figureControls.some((subArray) => subArray.includes('align'))) modalEl.querySelector('.se-figure-align').style.display = 'none';

	// modules
	const Link = this.plugins.link ? this.plugins.link.pluginOptions : {};
	this.anchor = new ModalAnchorEditor(this, modalEl, {
		textToDisplay: false,
		title: true,
		openNewWindow: Link.openNewWindow,
		relList: Link.relList,
		defaultRel: Link.defaultRel,
		noAutoPrefix: Link.noAutoPrefix,
		enableFileUpload: pluginOptions.linkEnableFileUpload
	});
	this.modal = new Modal(this, modalEl);
	this.figure = new Figure(this, figureControls, {
		sizeUnit: sizeUnit
	});
	this.fileManager = new FileManager(this, {
		tagNames: ['img'],
		loadHandler: this.events.onImageLoad,
		eventHandler: this.events.onImageAction,
		checkHandler: FileCheckHandler.bind(this),
		figure: this.figure
	});

	// members
	this.imgInputFile = modalEl.querySelector('._se_image_file');
	this.imgUrlFile = modalEl.querySelector('._se_image_url');
	this.focusElement = this.imgInputFile || this.imgUrlFile;
	this.altText = modalEl.querySelector('._se_image_alt');
	this.captionCheckEl = modalEl.querySelector('._se_image_check_caption');
	this.previewSrc = modalEl.querySelector('._se_tab_content_image .se-link-preview');
	this.sizeUnit = sizeUnit;
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
	this._ratio = {
		w: 1,
		h: 1
	};
	this._origin_w = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
	this._origin_h = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
	this._resizing = this.pluginOptions.canResize;
	this._onlyPercentage = this.pluginOptions.percentageOnlySize;
	this._nonResizing = !this._resizing || !this.pluginOptions.showHeightInput || this._onlyPercentage;

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
		this.inputX.value = this.pluginOptions.defaultWidth;
		this.inputY.value = this.pluginOptions.defaultHeight;

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
Image_.component = function (node) {
	node = domUtils.isFigure(node) ? node.firstElementChild : node;
	return /^IMG$/i.test(node?.nodeName) ? node : domUtils.isAnchor(node) && /^IMG$/i.test(node?.firstElementChild?.nodeName) ? node?.firstElementChild : null;
};
Image_.className = '';
Image_.prototype = {
	/**
	 * @override type = "modal"
	 */
	open() {
		this.modal.open();
	},

	/**
	 * @override Figure
	 */
	edit() {
		this.modal.open();
	},

	/**
	 * @override modal
	 * @param {boolean} isUpdate open state is update
	 */
	on(isUpdate) {
		if (!isUpdate) {
			this.inputX.value = this._origin_w = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this._origin_h = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
			if (this.imgInputFile && this.pluginOptions.allowMultiple) this.imgInputFile.setAttribute('multiple', 'multiple');
		} else {
			if (this.imgInputFile && this.pluginOptions.allowMultiple) this.imgInputFile.removeAttribute('multiple');
		}

		this.anchor.on(isUpdate);
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	async modalAction() {
		this._align = this.modal.form.querySelector('input[name="suneditor_image_radio"]:checked').value;

		if (this.modal.isUpdate) {
			this._update(this.inputX.value, this.inputY.value);
			this.history.push(false);
		}

		if (this.imgInputFile && this.imgInputFile.files.length > 0) {
			return await this._submitFile(this.imgInputFile.files);
		} else if (this.imgUrlFile && this._linkValue.length > 0) {
			return await this._submitURL(this._linkValue);
		}

		return false;
	},

	/**
	 * @override modal
	 */
	init() {
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
		this._ratio = {
			w: 1,
			h: 1
		};
		this._openTab('init');

		if (this._resizing) {
			this.inputX.value = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
			this.proportion.checked = true;
		}

		this.anchor.init();
	},

	/**
	 * @override component, fileManager
	 * @description Called when a container is selected.
	 * @param {Element} element Target element
	 */
	select(element) {
		this.ready(element);
	},

	/**
	 * @override fileManager, figure
	 */
	ready(target) {
		if (!target) return;
		const figureInfo = this.figure.open(target, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: false });
		this.anchor.set(domUtils.isAnchor(target.parentNode) ? target.parentNode : null);

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

		this.proportion.checked = true;
		this.inputX.disabled = percentageRotation ? true : false;
		this.inputY.disabled = percentageRotation ? true : false;
		this.proportion.disabled = percentageRotation ? true : false;

		this._ratio = this.proportion.checked
			? figureInfo.ratio
			: {
					w: 1,
					h: 1
			  };
	},

	/**
	 * @override fileManager
	 */
	async destroy(element) {
		const targetEl = element || this._element;
		const container = domUtils.getParentElement(targetEl, Figure.__is) || targetEl;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		const emptyDiv = container.parentNode;

		const message = await this.triggerEvent('onImageDeleteBefore', { target: targetEl, container, align: this._align, alt: this.altText.value, url: this._linkValue });
		if (message === false) return;

		domUtils.removeItem(container);
		this.init();

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

	_getInfo() {
		return {
			element: this._element,
			anchor: this.anchor.create(true),
			inputWidth: this.inputX.value,
			inputHeight: this.inputY.value,
			align: this._align,
			isUpdate: this.modal.isUpdate,
			alt: this.altText.value
		};
	},

	async _submitFile(fileList) {
		if (fileList.length === 0) return false;

		let fileSize = 0;
		const files = [];
		const slngleSizeLimit = this.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, s; i < len; i++) {
			if (/image/i.test(fileList[i].type)) {
				s = fileList[i].size;
				if (slngleSizeLimit && slngleSizeLimit > s) {
					const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
					const message = await this.triggerEvent('onImageUploadError', {
						error: err,
						limitSize: slngleSizeLimit,
						uploadSize: s,
						isSingle: true
					});

					this.notice.open(message === NO_EVENT ? err : message || err);

					return false;
				}

				files.push(fileList[i]);
				fileSize += s;
			}
		}

		const limitSize = this.pluginOptions.uploadSizeLimit;
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable total images: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onImageUploadError', {
				error: err,
				limitSize,
				currentSize,
				uploadSize: fileSize
			});

			this.notice.open(message === NO_EVENT ? err : message || err);

			return false;
		}

		const imgInfo = { files, ...this._getInfo() };
		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			this._serverUpload(infos, infos.files);
		}.bind(this, imgInfo);

		const result = await this.triggerEvent('onImageUploadBefore', {
			...imgInfo,
			handler
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);
	},

	async _submitURL(url) {
		if (!url) url = this._linkValue;
		if (!url) return false;

		const file = { name: url.split('/').pop(), size: 0 };
		const imgInfo = {
			url,
			files: file,
			...this._getInfo()
		};

		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			const infoUrl = infos.url;
			if (this.modal.isUpdate) this._updateSrc(infoUrl, infos.element, infos.files);
			else this.create(infoUrl, infos.anchor, infos.inputWidth, infos.inputHeight, infos.align, infos.files, infos.alt);
		}.bind(this, imgInfo);

		const result = await this.triggerEvent('onImageUploadBefore', {
			...imgInfo,
			handler
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	},

	_update(width, height) {
		if (!width) width = this.inputX.value || 'auto';
		if (!height) height = this.inputY.value || 'auto';

		let imageEl = this._element;
		const cover = this._cover;
		const container = this._container === this._cover ? null : this._container;

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
		let isNewAnchor = false;
		const anchor = this.anchor.create(true);
		if (anchor) {
			if (this._linkElement !== anchor || !container.contains(anchor)) {
				this._linkElement = anchor.cloneNode(false);
				cover.insertBefore(this._setAnchor(imageEl, this._linkElement), this._caption);
				isNewAnchor = true;
			}
		} else if (this._linkElement !== null) {
			if (cover.contains(this._linkElement)) {
				const newEl = imageEl.cloneNode(true);
				cover.removeChild(this._linkElement);
				cover.insertBefore(newEl, this._caption);
				imageEl = newEl;
			}
		}

		// size
		if (this._resizing && changeSize) {
			this.applySize(width, height);
		}

		if (isNewAnchor) {
			domUtils.removeItem(anchor);
		}

		// transform
		if (modifiedCaption || (!this._onlyPercentage && changeSize)) {
			if (/\d+/.test(imageEl.style.height) || (this.figure.isVertical && this.captionCheckEl.checked)) {
				if (/auto|%$/.test(width) || /auto|%$/.test(height)) {
					this.figure.deleteTransform(imageEl);
				} else {
					this.figure.setTransform(imageEl, width, height, 0);
				}
			}
		}

		// align
		this.figure.setAlign(imageEl, this._align);

		// select
		imageEl.onload = () => {
			this.select(imageEl);
		};
	},

	_fileCheck(width, height) {
		if (!width) width = this.inputX.value || 'auto';
		if (!height) height = this.inputY.value || 'auto';

		let imageEl = this._element;
		let cover = this._cover;
		let container = this._container === this._cover ? null : this._container;
		let isNewContainer = false;

		if (!cover || !container) {
			isNewContainer = true;
			imageEl = this._element.cloneNode(true);
			const figureInfo = Figure.CreateContainer(imageEl, 'se-image-container');
			cover = figureInfo.cover;
			container = figureInfo.container;
			this.figure.open(imageEl, { nonResizing: true, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: true });
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
			if (!this._caption || isNewContainer) {
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
		let isNewAnchor = null;
		const anchor = this.anchor.create(true);
		if (anchor) {
			if (this._linkElement !== anchor || (isNewContainer && !container.contains(anchor))) {
				this._linkElement = anchor.cloneNode(false);
				cover.insertBefore(this._setAnchor(imageEl, this._linkElement), this._caption);
				isNewAnchor = this._element;
			}
		} else if (this._linkElement !== null) {
			if (cover.contains(this._linkElement)) {
				const newEl = imageEl.cloneNode(true);
				cover.removeChild(this._linkElement);
				cover.insertBefore(newEl, this._caption);
				imageEl = newEl;
			}
		}

		let existElement = null;
		if (isNewContainer) {
			imageEl = this._element;
			existElement = this.format.isBlock(imageEl.parentNode) || domUtils.isWysiwygFrame(imageEl.parentNode) ? imageEl : domUtils.isAnchor(imageEl.parentNode) ? imageEl.parentNode : this.format.getLine(imageEl) || imageEl;

			if (domUtils.getParentElement(this._element, domUtils.isExcludeFormat)) {
				existElement = isNewAnchor ? anchor : this._element;
				existElement.parentNode.replaceChild(container, existElement);
			} else if (domUtils.isListCell(existElement)) {
				const refer = domUtils.getParentElement(imageEl, function (current) {
					return current.parentNode === existElement;
				});
				existElement.insertBefore(container, refer);
				domUtils.removeItem(imageEl);
				this.nodeTransform.removeEmptyNode(refer, null, true);
			} else if (this.format.isLine(existElement)) {
				const refer = domUtils.getParentElement(imageEl, function (current) {
					return current.parentNode === existElement;
				});
				existElement = this.nodeTransform.split(existElement, refer);
				existElement.parentNode.insertBefore(container, existElement);
				domUtils.removeItem(imageEl);
				this.nodeTransform.removeEmptyNode(existElement, null, true);
			} else {
				if (this.format.isLine(existElement.parentNode)) {
					const formats = existElement.parentNode;
					formats.parentNode.insertBefore(container, existElement.previousSibling ? formats.nextElementSibling : formats);
					if (
						this.fileManager.__updateTags.map(function (current) {
							return existElement.contains(current);
						}).length === 0
					)
						domUtils.removeItem(existElement);
				} else {
					existElement = domUtils.isFigure(existElement.parentNode) ? existElement.parentNode : existElement;
					existElement.parentNode.replaceChild(container, existElement);
				}
			}

			this._element = imageEl = container.querySelector('img');
			this._cover = cover;
			this._container = container;
		}

		// size
		if (this._resizing && changeSize) {
			this.applySize(width, height);
		}

		if (isNewAnchor) {
			if (!isNewContainer) {
				domUtils.removeItem(anchor);
			} else {
				domUtils.removeItem(isNewAnchor);
				if (
					domUtils.getListChildren(anchor, function (current) {
						return /IMG/i.test(current.tagName);
					}).length === 0
				) {
					domUtils.removeItem(anchor);
				}
			}
		}

		// transform
		if (modifiedCaption || (!this._onlyPercentage && changeSize)) {
			if (/\d+/.test(imageEl.style.height) || (this.figure.isVertical && this.captionCheckEl.checked)) {
				if (/auto|%$/.test(width) || /auto|%$/.test(height)) {
					this.figure.deleteTransform(imageEl);
				} else {
					this.figure.setTransform(imageEl, width, height, 0);
				}
			}
		}

		// align
		this.figure.setAlign(imageEl, this._align);
	},

	_openTab(e) {
		const modalForm = this.modal.form;
		const targetElement = e === 'init' ? modalForm.querySelector('._se_tab_link') : e.target;

		if (!/^BUTTON$/i.test(targetElement.tagName)) {
			return false;
		}

		// Declare all variables
		const tabName = targetElement.getAttribute('data-tab-link');
		let i;

		// Get all elements with class="tabcontent" and hide them
		const tabContent = modalForm.getElementsByClassName('_se_tab_content');
		for (i = 0; i < tabContent.length; i++) {
			tabContent[i].style.display = 'none';
		}

		// Get all elements with class="tablinks" and remove the class "active"
		const tabLinks = modalForm.getElementsByClassName('_se_tab_link');
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

	applySize(w, h) {
		if (!w) w = this.inputX.value || this.pluginOptions.defaultWidth;
		if (!h) h = this.inputY.value || this.pluginOptions.defaultHeight;
		if (this._onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w)) w += '%';
		}
		this.figure.setSize(w, h, null);
	},

	create(src, anchor, width, height, align, file, alt) {
		const oImg = domUtils.createElement('IMG');
		oImg.src = src;
		oImg.alt = alt;
		anchor = this._setAnchor(oImg, anchor ? anchor.cloneNode(false) : null);

		const figureInfo = Figure.CreateContainer(anchor, 'se-image-container');
		const cover = figureInfo.cover;
		const container = figureInfo.container;

		// caption
		if (this.captionCheckEl.checked) {
			this._caption = Figure.CreateCaption(cover, this.lang.caption);
		}

		this._element = oImg;
		this._cover = cover;
		this._container = container;
		this.figure.open(oImg, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: true });

		// set size
		this.applySize(width, height);

		// align
		this.figure.setAlign(oImg, align);

		this.fileManager.setFileData(oImg, file);

		oImg.onload = OnloadImg.bind(this, oImg, this._svgDefaultSize, container);
		this.component.insert(container, false, true);
	},

	_updateSrc(src, element, file) {
		element.src = src;
		this.fileManager.setFileData(element, file);
		this.component.select(element, Image_.key, false);
	},

	_register(info, response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file; i < len; i++) {
			file = {
				name: fileList[i].name,
				size: fileList[i].size
			};
			if (info.isUpdate) {
				this._updateSrc(fileList[i].url, info.element, file);
				break;
			} else {
				this.create(fileList[i].url, info.anchor, info.inputWidth, info.inputHeight, info.align, file, info.alt);
			}
		}
	},

	_serverUpload(info, files) {
		if (!files) return;

		// server upload
		const imageUploadUrl = this.pluginOptions.uploadUrl;
		if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
			this.fileManager.upload(imageUploadUrl, this.pluginOptions.uploadHeaders, files, UploadCallBack.bind(this, info), this._error.bind(this));
		} else {
			this._setBase64(files, info.anchor, info.inputWidth, info.inputHeight, info.align, info.alt, info.isUpdate);
		}
	},

	_setBase64(files, anchor, width, height, align, alt, isUpdate) {
		try {
			const filesLen = this.modal.isUpdate ? 1 : files.length;

			if (filesLen === 0) {
				this.editor.hideLoading();
				console.warn('[SUNEDITOR.image.base64.fail] cause : No applicable files');
				return;
			}

			this._base64RenderIndex = filesLen;
			const filesStack = [filesLen];
			this.inputX.value = width;
			this.inputY.value = height;

			for (let i = 0, reader, file; i < filesLen; i++) {
				reader = new FileReader();
				file = files[i];

				reader.onload = function (on_reader, update, updateElement, on_file, index) {
					filesStack[index] = {
						result: on_reader.result,
						file: on_file
					};

					if (--this._base64RenderIndex === 0) {
						this._onRenderBase64(update, filesStack, updateElement, anchor, width, height, align, alt);
						this.editor.hideLoading();
					}
				}.bind(this, reader, isUpdate, this._element, file, i);

				reader.readAsDataURL(file);
			}
		} catch (error) {
			this.editor.hideLoading();
			throw Error(`[SUNEDITOR.plugins.image._setBase64.fail] ${error.message}`);
		}
	},

	_onRenderBase64(update, filesStack, updateElement, anchor, width, height, align, alt) {
		for (let i = 0, len = filesStack.length; i < len; i++) {
			if (update) {
				this._updateSrc(filesStack[i].result, updateElement, filesStack[i].file);
			} else {
				this.create(filesStack[i].result, anchor, width, height, align, filesStack[i].file, alt);
			}
		}
	},

	_setAnchor(imgTag, anchor) {
		if (anchor) {
			anchor.appendChild(imgTag);
			return anchor;
		}

		return imgTag;
	},

	async _error(response) {
		const message = await this.triggerEvent('onImageUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.image.error]', err);
	},

	constructor: Image_
};

function FileCheckHandler(element) {
	this.ready(element);
	this._fileCheck(this._origin_w, this._origin_h);
	return element;
}

async function UploadCallBack(info, xmlHttp) {
	if ((await this.triggerEvent('imageUploadHandler', { xmlHttp, info })) === NO_EVENT) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response);
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
	this._ratio = this.proportion.checked
		? Figure.GetRatio(this.inputX.value, this.inputY.value, this.sizeUnit)
		: {
				w: 1,
				h: 1
		  };
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
	this._linkValue = this.previewSrc.textContent = !value
		? ''
		: this.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
		? this.options.get('defaultUrlProtocol') + value
		: !value.includes('://')
		? '/' + value
		: value;
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
	this.altText.value = target.getAttribute('data-value') || target.alt;
	this._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = target.getAttribute('data-command') || target.src;
	this.imgUrlFile.focus();
}

function OnloadImg(oImg, _svgDefaultSize, container) {
	// svg exception handling
	if (oImg.offsetWidth === 0) this.applySize(_svgDefaultSize, '');
	if (this.options.get('mediaAutoSelect')) {
		this.component.select(oImg, Image_.key, false);
	} else {
		const line = this.format.addLine(container, null);
		if (line) this.setRange(line, 0, line, 0);
	}

	delete oImg.onload;
}

function CreateHTML_modal({ lang, icons, plugins }, pluginOptions) {
	const createFileInputHtml = !pluginOptions.createFileInput
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<label>${lang.image_modal_file}</label>
			<div class="se-modal-form-files">
				<input class="se-input-form _se_image_file" data-focus type="file" accept="${pluginOptions.acceptedFormats}"${pluginOptions.allowMultiple ? ' multiple="multiple"' : ''}/>
				<button type="button" class="se-btn se-modal-files-edge-button se-file-remove" title="${lang.remove}" aria-label="${lang.remove}">${icons.cancel}</button>
			</div>
		</div>`;

	const createUrlInputHtml = !pluginOptions.createUrlInput
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<label>${lang.image_modal_url}</label>
			<div class="se-modal-form-files">
				<input class="se-input-form se-input-url _se_image_url" data-focus type="text" />
				${plugins.imageGallery ? `<button type="button" class="se-btn se-modal-files-edge-button __se__gallery" title="${lang.imageGallery}" aria-label="${lang.imageGallery}">${icons.image_gallery}</button>` : ''}
			</div>
			<pre class="se-link-preview"></pre>
		</div>`;

	const canResizeHtml = !pluginOptions.canResize
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<div class="se-modal-size-text">
				<label class="size-w">${lang.width}</label>
				<label class="se-modal-size-x">&nbsp;</label>
				<label class="size-h">${lang.height}</label>
			</div>
			<input class="se-input-control _se_image_size_x" placeholder="auto" type="text" />
			<label class="se-modal-size-x">x</label>
			<input type="text" class="se-input-control _se_image_size_y" placeholder="auto" />
			<label><input type="checkbox" class="se-modal-btn-check _se_image_check_proportion" checked/>&nbsp;${lang.proportion}</label>
			<button type="button" title="${lang.revert}" aria-label="${lang.revert}" class="se-btn se-modal-btn-revert">${icons.revert}</button>
		</div>`;

	const html = /*html*/ `
		<div class="se-modal-header">
			<button type="button" data-command="close" class="se-btn se-close-btn close" title="${lang.close}" aria-label="${lang.close}">${icons.cancel}</button>
			<span class="se-modal-title">${lang.image_modal_title}</span>
		</div>
		<div class="se-modal-tabs">
			<button type="button" class="_se_tab_link active" data-tab-link="image">${lang.image}</button>
			<button type="button" class="_se_tab_link" data-tab-link="url">${lang.link}</button>
		</div>
		<form method="post" enctype="multipart/form-data">
			<div class="_se_tab_content _se_tab_content_image">
				<div class="se-modal-body">
					${createFileInputHtml}
					${createUrlInputHtml}
					<div style="border-bottom: 1px dashed #ccc;"></div>
					<div class="se-modal-form">
						<label>${lang.image_modal_altText}</label><input class="se-input-form _se_image_alt" type="text" />
					</div>
					${canResizeHtml}
					<div class="se-modal-form se-modal-form-footer">
						<label><input type="checkbox" class="se-modal-btn-check _se_image_check_caption" />&nbsp;${lang.caption}</label>
					</div>
				</div>
			</div>
			<div class="se-anchor-editor _se_tab_content _se_tab_content_url" style="display: none;">
			</div>
			<div class="se-modal-footer">
				<div class="se-figure-align">
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="none" checked>${lang.basic}</label>
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="left">${lang.left}</label>
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="center">${lang.center}</label>
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="right">${lang.right}</label>
				</div>
				<button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}"><span>${lang.submitButton}</span></button>
			</div>
		</form>`;

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

export default Image_;
