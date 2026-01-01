import { PluginModal } from '../../../interfaces';
import { Modal, Figure } from '../../../modules/contract';
import { FileManager } from '../../../modules/manager';
import { ModalAnchorEditor } from '../../../modules/ui';
import { dom, numbers, env } from '../../../helper';

import { DEFAULT_ACCEPTED_FORMATS, DEFAULT_SVG_SIZE, FORMAT_TYPE, SIZE_UNIT } from './shared/image.constants';
import { CreateHTML_modal } from './render/image.html';
import ImageSizeService from './services/image.size';
import ImageUploadService from './services/image.upload';

const { NO_EVENT } = env;

/**
 * @typedef {Object} ImagePluginOptions
 * @property {boolean} [canResize=true] - Whether the image element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth="auto"] - The default width of the image. If a number is provided, "px" will be appended.
 * @property {string} [defaultHeight="auto"] - The default height of the image. If a number is provided, "px" will be appended.
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {boolean} [createFileInput=true] - Whether to create a file input element for image uploads.
 * @property {boolean} [createUrlInput=true] - Whether to create a URL input element for image insertion.
 * @property {string} [uploadUrl] - The URL endpoint for image file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers to include in the file upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit in bytes.
 * @property {boolean} [allowMultiple=false] - Whether multiple image uploads are allowed.
 * @property {string} [acceptedFormats="image/*"] - The accepted file formats for image uploads.
 * @property {boolean} [useFormatType=true] - Whether to enable format type selection (block or inline).
 * @property {'block'|'inline'} [defaultFormatType="block"] - The default image format type ("block" or "inline").
 * @property {boolean} [keepFormatType=false] - Whether to retain the chosen format type after image insertion.
 * @property {boolean} [linkEnableFileUpload] - Whether to enable file uploads for linked images.
 * @property {SunEditor.Module.Figure.Controls} [controls] - Figure controls.
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
 * - For block components: executes behavior based on `selectMode`:
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */

/**
 * @typedef {Object} ImageState
 * @property {string} sizeUnit - Size unit ('px' or '%')
 * @property {boolean} onlyPercentage - Whether only percentage sizing is allowed
 * @property {number} produceIndex - Image production index for batch operations
 */

/**
 * @class
 * @description Image plugin.
 * - This plugin provides image insertion functionality within the editor, supporting both file upload and URL input.
 */
class Image_ extends PluginModal {
	static key = 'image';
	static className = '';

	/**
	 * @param {Element} node - The node to check.
	 * @returns {Element|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		const compNode = dom.check.isFigure(node) || (/^span$/i.test(node.nodeName) && dom.check.isComponentContainer(node)) ? node.firstElementChild : node;
		return /^IMG$/i.test(compNode?.nodeName) ? compNode : dom.check.isAnchor(compNode) && /^IMG$/i.test(compNode?.firstElementChild?.nodeName) ? compNode?.firstElementChild : null;
	}

	#resizing;
	#nonResizing;

	#linkElement = null;
	#linkValue = '';
	#align = 'none';
	#svgDefaultSize = DEFAULT_SVG_SIZE;
	#element = null;
	#cover = null;
	#container = null;
	#caption = null;

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ImagePluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin basic properties
		super(editor);
		this.title = this.lang.image;
		this.icon = 'image';

		this.pluginOptions = {
			canResize: pluginOptions.canResize === undefined ? true : pluginOptions.canResize,
			showHeightInput: pluginOptions.showHeightInput === undefined ? true : !!pluginOptions.showHeightInput,
			defaultWidth: !pluginOptions.defaultWidth ? 'auto' : numbers.is(pluginOptions.defaultWidth) ? pluginOptions.defaultWidth + SIZE_UNIT.PIXEL : pluginOptions.defaultWidth,
			defaultHeight: !pluginOptions.defaultHeight ? 'auto' : numbers.is(pluginOptions.defaultHeight) ? pluginOptions.defaultHeight + SIZE_UNIT.PIXEL : pluginOptions.defaultHeight,
			percentageOnlySize: !!pluginOptions.percentageOnlySize,
			createFileInput: pluginOptions.createFileInput === undefined ? true : pluginOptions.createFileInput,
			createUrlInput: pluginOptions.createUrlInput === undefined || !pluginOptions.createFileInput ? true : pluginOptions.createUrlInput,
			uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
			uploadHeaders: pluginOptions.uploadHeaders || null,
			uploadSizeLimit: numbers.get(pluginOptions.uploadSizeLimit, 0),
			uploadSingleSizeLimit: numbers.get(pluginOptions.uploadSingleSizeLimit, 0),
			allowMultiple: !!pluginOptions.allowMultiple,
			acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? DEFAULT_ACCEPTED_FORMATS : pluginOptions.acceptedFormats.trim() || DEFAULT_ACCEPTED_FORMATS,
			useFormatType: pluginOptions.useFormatType ?? true,
			defaultFormatType: [FORMAT_TYPE.BLOCK, FORMAT_TYPE.INLINE].includes(pluginOptions.defaultFormatType) ? pluginOptions.defaultFormatType : FORMAT_TYPE.BLOCK,
			keepFormatType: pluginOptions.keepFormatType ?? false,
			insertBehavior: pluginOptions.insertBehavior,
		};

		// create HTML
		const sizeUnit = this.pluginOptions.percentageOnlySize ? SIZE_UNIT.PERCENTAGE : SIZE_UNIT.PIXEL;
		const modalEl = CreateHTML_modal(editor, this.pluginOptions);
		const ctrlAs = this.pluginOptions.useFormatType ? 'as' : '';
		const figureControls =
			pluginOptions.controls ||
			(!this.pluginOptions.canResize
				? [[ctrlAs, 'mirror_h', 'mirror_v', 'align', 'caption', 'edit', 'revert', 'copy', 'remove']]
				: [
						[ctrlAs, 'resize_auto,100,75,50', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v'],
						['edit', 'align', 'caption', 'revert', 'copy', 'remove'],
					]);

		// show align
		this.alignForm = modalEl.alignForm;
		if (!figureControls.some((subArray) => subArray.includes('align'))) this.alignForm.style.display = 'none';

		// modules
		const Link = this.plugins.link ? this.plugins.link.pluginOptions : {};
		this.anchor = new ModalAnchorEditor(this.editor, modalEl.html, {
			...Link,
			textToDisplay: false,
			title: true,
		});

		this.modal = new Modal(this, modalEl.html);

		this.figure = new Figure(this, figureControls, {
			sizeUnit: sizeUnit,
		});

		this.fileManager = new FileManager(this, {
			query: 'img',
			loadEventName: 'onImageLoad',
			actionEventName: 'onImageAction',
		});

		// members
		/** @type {ImageState} */
		this.state = {
			sizeUnit: sizeUnit,
			onlyPercentage: this.pluginOptions.percentageOnlySize,
			produceIndex: 0,
		};

		this.fileModalWrapper = modalEl.fileModalWrapper;
		this.imgInputFile = modalEl.imgInputFile;
		this.imgUrlFile = modalEl.imgUrlFile;
		this.focusElement = this.imgInputFile || this.imgUrlFile;
		this.altText = modalEl.altText;
		this.captionCheckEl = modalEl.captionCheckEl;
		this.captionEl = this.captionCheckEl?.parentElement;
		this.previewSrc = modalEl.previewSrc;

		this.as = FORMAT_TYPE.BLOCK;
		this.#resizing = this.pluginOptions.canResize;
		this.#nonResizing = !this.#resizing || !this.pluginOptions.showHeightInput || this.pluginOptions.percentageOnlySize;

		this.sizeService = new ImageSizeService(this, modalEl);
		this.uploadService = new ImageUploadService(this);

		// init
		this.eventManager.addEvent(modalEl.tabs, 'click', this.#OpenTab.bind(this));
		if (this.imgInputFile) this.eventManager.addEvent(modalEl.fileRemoveBtn, 'click', this.#RemoveSelectedFiles.bind(this));
		if (this.imgUrlFile) this.eventManager.addEvent(this.imgUrlFile, 'input', this.#OnLinkPreview.bind(this));
		if (this.imgInputFile && this.imgUrlFile) this.eventManager.addEvent(this.imgInputFile, 'change', this.#OnfileInputChange.bind(this));

		const galleryButton = modalEl.galleryButton;
		if (galleryButton) this.eventManager.addEvent(galleryButton, 'click', this.#OpenGallery.bind(this));

		if (this.pluginOptions.useFormatType) {
			this.as = this.pluginOptions.defaultFormatType;
			this.asBlock = modalEl.asBlock;
			this.asInline = modalEl.asInline;
			this.eventManager.addEvent([this.asBlock, this.asInline], 'click', this.#OnClickAsButton.bind(this));
		}
	}

	/**
	 * @template {keyof ImageState} K
	 * @param {K} key
	 * @param {ImageState[K]} value
	 */
	setState(key, value) {
		this.state[key] = value;
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.state.produceIndex = 0;
		this.modal.open();
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.RetainFormat}
	 */
	retainFormat() {
		return {
			query: 'img',
			/** @param {HTMLImageElement} element */
			method: (element) => {
				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && (figureInfo.cover || figureInfo.inlineCover)) return;

				const { w, h } = this.#ready(element, true);
				this.#fileCheck(w, h);
			},
		};
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnFilePasteAndDrop}
	 */
	onFilePasteAndDrop({ file }) {
		if (!/^image/.test(file.type)) return;

		this.submitFile([file]);
		this.editor.focus();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.On}
	 */
	modalOn(isUpdate) {
		if (!isUpdate) {
			this.sizeService.on();
			if (this.imgInputFile && this.pluginOptions.allowMultiple) this.imgInputFile.setAttribute('multiple', 'multiple');
		} else {
			if (this.imgInputFile && this.pluginOptions.allowMultiple) this.imgInputFile.removeAttribute('multiple');
		}

		this.anchor.on(isUpdate);
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		this.#align = /** @type {HTMLInputElement} */ (this.modal.form.querySelector('input[name="suneditor_image_radio"]:checked')).value;

		if (this.modal.isUpdate) {
			this.#fixTagStructure();
			this.history.push(false);
		}

		if (this.imgInputFile && this.imgInputFile.files.length > 0) {
			return await this.submitFile(this.imgInputFile.files);
		} else if (this.imgUrlFile && this.#linkValue.length > 0) {
			return await this.submitURL(this.#linkValue);
		}

		return false;
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Init}
	 */
	modalInit() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		if (this.imgInputFile) this.imgInputFile.value = '';
		if (this.imgUrlFile) this.#linkValue = this.previewSrc.textContent = this.imgUrlFile.value = '';
		if (this.imgInputFile && this.imgUrlFile) {
			this.imgUrlFile.disabled = false;
			this.previewSrc.style.textDecoration = '';
		}

		this.altText.value = '';
		/** @type {HTMLInputElement} */ (this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]')).checked = true;
		this.captionCheckEl.checked = false;
		this.#element = null;
		this.#OpenTab('init');

		this.sizeService.init();

		if (this.pluginOptions.useFormatType) {
			this.#activeAsInline((this.pluginOptions.keepFormatType ? this.as : this.pluginOptions.defaultFormatType) === FORMAT_TYPE.INLINE);
		}

		this.anchor.init();
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		this.#ready(target);
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Edit}
	 */
	componentEdit() {
		this.modal.open();
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	async componentDestroy(target) {
		const targetEl = target || this.#element;
		const container = dom.query.getParentElement(targetEl, Figure.is) || targetEl;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		const emptyDiv = container.parentNode;

		const message = await this.triggerEvent('onImageDeleteBefore', { element: targetEl, container, align: this.#align, alt: this.altText.value, url: this.#linkValue });
		if (message === false) return;

		dom.utils.removeItem(container);
		this.modalInit();

		if (emptyDiv !== this.frameContext.get('wysiwyg')) {
			this.nodeTransform.removeAllParents(
				emptyDiv,
				function (current) {
					return current.childNodes.length === 0;
				},
				null,
			);
		}

		// focus
		this.editor.focusEdge(focusEl);
		this.history.push(false);
	}

	/**
	 * @description Create an "image" component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitFile(fileList) {
		if (fileList.length === 0) return false;

		let fileSize = 0;
		const files = [];
		const singleSizeLimit = this.pluginOptions.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			if (!/image/i.test(f.type)) continue;

			s = f.size;
			if (singleSizeLimit > 0 && s > singleSizeLimit) {
				const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable single file: ' + singleSizeLimit / 1000 + 'KB';
				const message = await this.triggerEvent('onImageUploadError', {
					error: err,
					limitSize: singleSizeLimit,
					uploadSize: s,
					file: f,
				});

				this.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

				return false;
			}

			files.push(f);
			fileSize += s;
		}

		const limitSize = this.pluginOptions.uploadSizeLimit;
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable total images: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onImageUploadError', {
				error: err,
				limitSize,
				currentSize,
				uploadSize: fileSize,
			});

			this.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

			return false;
		}

		const imgInfo = { files, ...this.#getInfo() };
		const handler = function (uploadCallback, infos, newInfos) {
			infos = newInfos || infos;
			uploadCallback(infos);
		}.bind(this, this.uploadService.serverUpload.bind(this.uploadService), imgInfo);

		const result = await this.triggerEvent('onImageUploadBefore', {
			info: imgInfo,
			handler,
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);
	}

	/**
	 * @description Create an "image" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitURL(url) {
		if (!(url ||= this.#linkValue)) return false;

		const file = { name: url.split('/').pop(), size: 0 };
		const imgInfo = {
			url,
			files: file,
			...this.#getInfo(),
		};

		const handler = function (uploadCallback, infos, newInfos) {
			infos = newInfos || infos;
			uploadCallback(infos);
		}.bind(this, this.uploadService.urlUpload.bind(this.uploadService), imgInfo);

		const result = await this.triggerEvent('onImageUploadBefore', {
			info: imgInfo,
			handler,
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	}

	/**
	 * @description Creates a new image component, wraps it in a figure container with an optional anchor,
	 * - applies size and alignment settings, and inserts it into the editor.
	 * @param {string} src - The URL of the image to be inserted.
	 * @param {?Node} anchor - An optional anchor element to wrap the image. If provided, a clone is used.
	 * @param {string} width - The width value to be applied to the image.
	 * @param {string} height - The height value to be applied to the image.
	 * @param {string} align - The alignment setting for the image (e.g., 'left', 'center', 'right').
	 * @param {{name: string, size: number}} file - File metadata associated with the image
	 * @param {string} alt - The alternative text for the image.
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(src, anchor, width, height, align, file, alt, isLast) {
		/** @type {HTMLImageElement} */
		const oImg = dom.utils.createElement('IMG');
		oImg.src = src;
		oImg.alt = alt;
		anchor = this.#setAnchor(oImg, anchor ? anchor.cloneNode(false) : null);

		const figureInfo = Figure.CreateContainer(anchor, 'se-image-container');
		const cover = figureInfo.cover;
		const container = figureInfo.container;

		// caption
		if (this.captionCheckEl.checked) {
			this.#caption = Figure.CreateCaption(cover, this.lang.caption);
		}

		this.#element = oImg;
		this.#cover = cover;
		this.#container = container;
		this.figure.open(oImg, { nonResizing: this.#nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly: true });

		// set size
		this.sizeService.applySize(width, height);

		// align
		this.figure.setAlign(oImg, align);

		this.fileManager.setFileData(oImg, file);

		this.setState('produceIndex', this.state.produceIndex + 1);
		oImg.onload = this.#OnloadImg.bind(this, oImg, this.#svgDefaultSize, container);
		this.component.insert(container, { scrollTo: isLast ? true : false, insertBehavior: isLast ? null : 'line' });
	}

	/**
	 * @description Creates a new inline image component, wraps it in an inline figure container with an optional anchor,
	 * - applies size settings, and inserts it into the editor.
	 * @param {string} src - The URL of the image to be inserted.
	 * @param {?Node} anchor - An optional anchor element to wrap the image. If provided, a clone is used.
	 * @param {string} width - The width value to be applied to the image.
	 * @param {string} height - The height value to be applied to the image.
	 * @param {{name: string, size: number}} file - File metadata associated with the image
	 * @param {string} alt - The alternative text for the image.
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	createInline(src, anchor, width, height, file, alt, isLast) {
		/** @type {HTMLImageElement} */
		const oImg = dom.utils.createElement('IMG');
		oImg.src = src;
		oImg.alt = alt;
		anchor = this.#setAnchor(oImg, anchor ? anchor.cloneNode(false) : null);

		const figureInfo = Figure.CreateInlineContainer(anchor, 'se-image-container');
		const container = figureInfo.container;

		this.#element = oImg;
		this.#container = container;
		this.figure.open(oImg, { nonResizing: this.#nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly: true });

		// set size
		this.sizeService.applySize(width, height);

		this.fileManager.setFileData(oImg, file);

		this.setState('produceIndex', this.state.produceIndex + 1);
		oImg.onload = this.#OnloadImg.bind(this, oImg, this.#svgDefaultSize, container);
		this.component.insert(container, { scrollTo: isLast ? true : false, insertBehavior: isLast ? null : 'line' });
	}

	/**
	 * @description Prepares the component for selection.
	 * - Ensures that the controller is properly positioned and initialized.
	 * - Prevents duplicate event handling if the component is already selected.
	 * @param {HTMLElement} target - The selected element.
	 * @param {boolean} [infoOnly=false] - If true, only retrieves information without opening the controller.
	 * @returns {{w: string, h: string}} - The width and height of the component.
	 */
	#ready(target, infoOnly = false) {
		if (!target) return;
		const figureInfo = this.figure.open(target, { nonResizing: this.#nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly });
		this.anchor.set(dom.check.isAnchor(target.parentNode) ? target.parentNode : null);

		this.#linkElement = this.anchor.currentTarget;
		this.#element = target;
		this.#cover = figureInfo.cover;
		this.#container = figureInfo.container;
		this.#caption = figureInfo.caption;
		this.#align = figureInfo.align;
		target.style.float = '';

		this.sizeService.setOriginSize(String(figureInfo.originWidth || figureInfo.w || ''), String(figureInfo.originHeight || figureInfo.h || ''));
		this.altText.value = this.#element.alt;

		if (this.imgUrlFile) this.#linkValue = this.previewSrc.textContent = this.imgUrlFile.value = this.#element.src;

		/** @type {HTMLInputElement} */
		const activeAlign = this.modal.form.querySelector('input[name="suneditor_image_radio"][value="' + this.#align + '"]') || this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]');
		activeAlign.checked = true;
		this.captionCheckEl.checked = !!this.#caption;

		const { dw, dh } = this.figure.getSize(target);

		if (!this.#resizing) return { w: dw, h: dh };

		this.sizeService.ready(figureInfo, dw, dh);

		if (this.pluginOptions.useFormatType) {
			this.#activeAsInline(this.component.isInline(figureInfo.container));
		}

		return { w: dw, h: dh };
	}

	/**
	 * @description Retrieves the current image information.
	 * @returns {*} - The image data.
	 */
	#getInfo() {
		const { w, h } = this.sizeService.getInputSize();
		return {
			element: this.#element,
			anchor: this.anchor.create(true),
			inputWidth: w,
			inputHeight: h,
			align: this.#align,
			isUpdate: this.modal.isUpdate,
			alt: this.altText.value,
		};
	}

	/**
	 * @description Toggles between block and inline image format.
	 * @param {boolean} isInline - Whether the image should be inline.
	 */
	#activeAsInline(isInline) {
		if (isInline) {
			dom.utils.addClass(this.asInline, 'on');
			dom.utils.removeClass(this.asBlock, 'on');
			this.as = FORMAT_TYPE.INLINE;
			// buttns
			if (this.alignForm) this.alignForm.style.display = 'none';
			// caption
			if (this.captionEl) this.captionEl.style.display = 'none';
		} else {
			dom.utils.addClass(this.asBlock, 'on');
			dom.utils.removeClass(this.asInline, 'on');
			this.as = FORMAT_TYPE.BLOCK;
			// buttns
			if (this.alignForm) this.alignForm.style.display = '';
			// caption
			if (this.captionEl) this.captionEl.style.display = '';
		}
	}

	/**
	 * @description Updates the selected image size, alt text, and caption.
	 */
	#fixTagStructure() {
		const { w, h } = this.sizeService.getInputSize();
		const width = w || 'auto';
		const height = h || 'auto';

		let imageEl = this.#element;

		// as (block | inline)
		if ((this.as === FORMAT_TYPE.BLOCK && !this.#cover) || (this.as === FORMAT_TYPE.INLINE && this.#cover)) {
			imageEl = this.figure.convertAsFormat(imageEl, this.as);
		}

		// --- update image ---
		const cover = this.#cover;
		const container = this.#container === this.#cover ? null : this.#container;

		// check size
		let changeSize;
		const x = numbers.is(width) ? width + this.state.sizeUnit : width;
		const y = numbers.is(height) ? height + this.state.sizeUnit : height;
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
			if (!this.#caption) {
				this.#caption = Figure.CreateCaption(cover, this.lang.caption);
				modifiedCaption = true;
			}
		} else {
			if (this.#caption) {
				dom.utils.removeItem(this.#caption);
				this.#caption = null;
				modifiedCaption = true;
			}
		}

		// link
		let isNewAnchor = false;
		const anchor = this.anchor.create(true);
		if (anchor) {
			if (this.#linkElement !== anchor || !container.contains(anchor)) {
				this.#linkElement = anchor.cloneNode(false);
				cover.insertBefore(this.#setAnchor(imageEl, this.#linkElement), this.#caption);
				isNewAnchor = true;
			}
		} else if (this.#linkElement !== null) {
			if (cover.contains(this.#linkElement)) {
				const newEl = imageEl.cloneNode(true);
				cover.removeChild(this.#linkElement);
				cover.insertBefore(newEl, this.#caption);
				imageEl = newEl;
			}
		}

		if (isNewAnchor) {
			dom.utils.removeItem(anchor);
		}

		// size
		if (this.#resizing && changeSize) {
			this.sizeService.applySize(width, height);
		}

		// transform
		if (modifiedCaption || (!this.state.onlyPercentage && changeSize)) {
			if (/\d+/.test(imageEl.style.height) || (this.figure.isVertical && this.captionCheckEl.checked)) {
				if (/auto|%$/.test(width) || /auto|%$/.test(height)) {
					this.figure.deleteTransform(imageEl);
				} else if (!this.#resizing || !changeSize || !this.figure.isVertical) {
					this.figure.setTransform(imageEl, width, height, 0);
				}
			}
		}

		// align
		this.figure.setAlign(imageEl, this.#align);

		// select
		imageEl.onload = () => {
			this.componentSelect(imageEl);
		};
	}

	/**
	 * @description Validates the image size and applies necessary transformations.
	 * @param {string} width - The width of the image.
	 * @param {string} height - The height of the image.
	 */
	#fileCheck(width, height) {
		const { w, h } = this.sizeService.getInputSize();
		width ||= w || 'auto';
		height ||= h || 'auto';

		let imageEl = this.#element;
		let cover = this.#cover;
		let inlineCover = null;
		let container = this.#container === this.#cover ? null : this.#container;
		let isNewContainer = false;

		if (!cover || !container) {
			isNewContainer = true;
			imageEl = this.#element.cloneNode(true);
			const figureInfo =
				this.pluginOptions.useFormatType && width !== 'auto' && (/^span$/i.test(this.#element.parentElement?.nodeName) || this.format.isLine(this.#element.parentElement))
					? Figure.CreateInlineContainer(imageEl, 'se-image-container')
					: Figure.CreateContainer(imageEl, 'se-image-container');
			cover = figureInfo.cover;
			container = figureInfo.container;
			inlineCover = figureInfo.inlineCover;
			this.figure.open(imageEl, { nonResizing: true, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly: true });
		}

		// alt
		imageEl.alt = this.altText.value;

		// caption
		let modifiedCaption = false;
		if (!inlineCover) {
			if (this.captionCheckEl.checked) {
				if (!this.#caption || isNewContainer) {
					this.#caption = Figure.CreateCaption(cover, this.lang.caption);
					modifiedCaption = true;
				}
			} else {
				if (this.#caption) {
					dom.utils.removeItem(this.#caption);
					this.#caption = null;
					modifiedCaption = true;
				}
			}
		}

		// link
		let isNewAnchor = null;
		const anchor = this.anchor.create(true);
		if (anchor) {
			if (this.#linkElement !== anchor || (isNewContainer && !container.contains(anchor))) {
				this.#linkElement = anchor.cloneNode(false);
				cover.insertBefore(this.#setAnchor(imageEl, this.#linkElement), this.#caption);
				isNewAnchor = this.#element;
			}
		} else if (this.#linkElement !== null) {
			if (cover.contains(this.#linkElement)) {
				const newEl = imageEl.cloneNode(true);
				cover.removeChild(this.#linkElement);
				cover.insertBefore(newEl, this.#caption);
				imageEl = newEl;
			}
		}

		if (isNewContainer) {
			imageEl = this.#element;
			this.figure.retainFigureFormat(container, this.#element, isNewAnchor ? anchor : null, this.fileManager);
			this.#element = imageEl = container.querySelector('img');
			this.#cover = cover;
			this.#container = container;
		}

		// size
		imageEl.style.width = '';
		imageEl.style.height = '';
		imageEl.removeAttribute('width');
		imageEl.removeAttribute('height');
		this.sizeService.applySize(width, height);

		if (isNewAnchor) {
			if (!isNewContainer) {
				dom.utils.removeItem(anchor);
			} else {
				dom.utils.removeItem(isNewAnchor);
				if (dom.query.getListChildren(anchor, (current) => /IMG/i.test(current.tagName), null).length === 0) {
					dom.utils.removeItem(anchor);
				}
			}
		}

		// transform
		if (modifiedCaption || !this.state.onlyPercentage) {
			if (/\d+/.test(imageEl.style.height) || (this.figure.isVertical && this.captionCheckEl.checked)) {
				if (/auto|%$/.test(width) || /auto|%$/.test(height)) {
					this.figure.deleteTransform(imageEl);
				} else {
					this.figure.setTransform(imageEl, width, height, 0);
				}
			}
		}

		// align
		this.figure.setAlign(imageEl, this.#align);
	}

	/**
	 * @description Wraps an image element with an anchor if provided.
	 * @param {Node} imgTag - The image element to be wrapped.
	 * @param {?Node} anchor - The anchor element to wrap around the image. If null, returns the image itself.
	 * @returns {Node} - The wrapped image inside the anchor or the original image element.
	 */
	#setAnchor(imgTag, anchor) {
		if (anchor) {
			anchor.appendChild(imgTag);
			return anchor;
		}

		return imgTag;
	}

	/**
	 * @description Opens a specific tab inside the modal.
	 * @param {MouseEvent|string} e - The event object or tab name.
	 * @returns {boolean} - Whether the tab was successfully opened.
	 */
	#OpenTab(e) {
		const modalForm = this.modal.form;
		const targetElement = typeof e === 'string' ? modalForm.querySelector('._se_tab_link') : dom.query.getEventTarget(e);

		if (!/^BUTTON$/i.test(targetElement.tagName)) {
			return false;
		}

		// Declare all variables
		const tabName = targetElement.getAttribute('data-tab-link');
		let i;

		// Get all elements with class="tabcontent" and hide them
		const tabContent = /** @type {HTMLCollectionOf<HTMLElement>}*/ (modalForm.getElementsByClassName('_se_tab_content'));
		for (i = 0; i < tabContent.length; i++) {
			tabContent[i].style.display = 'none';
		}

		// Get all elements with class="tablinks" and remove the class "active"
		const tabLinks = modalForm.getElementsByClassName('_se_tab_link');
		for (i = 0; i < tabLinks.length; i++) {
			dom.utils.removeClass(tabLinks[i], 'active');
		}

		// Show the current tab, and add an "active" class to the button that opened the tab
		/** @type {HTMLElement}*/ (modalForm.querySelector('._se_tab_content_' + tabName)).style.display = 'block';
		dom.utils.addClass(targetElement, 'active');

		// focus
		if (e !== 'init') {
			if (tabName === 'image') {
				this.focusElement.focus();
			} else if (tabName === 'url') {
				this.anchor.urlInput.focus();
			}
		}

		return false;
	}

	#RemoveSelectedFiles() {
		this.imgInputFile.value = '';
		if (this.imgUrlFile) {
			this.imgUrlFile.disabled = false;
			this.previewSrc.style.textDecoration = '';
		}

		// inputFile check
		Modal.OnChangeFile(this.fileModalWrapper, []);
	}

	#OnClickAsButton({ target }) {
		this.#activeAsInline(target.getAttribute('data-command') === 'asInline');
	}

	#OnLinkPreview(e) {
		const value = e.target.value.trim();
		this.#linkValue = this.previewSrc.textContent = !value
			? ''
			: this.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
				? this.options.get('defaultUrlProtocol') + value
				: !value.includes('://')
					? '/' + value
					: value;
	}

	#OnfileInputChange({ target }) {
		if (!this.imgInputFile.value) {
			this.imgUrlFile.disabled = false;
			this.previewSrc.style.textDecoration = '';
		} else {
			this.imgUrlFile.disabled = true;
			this.previewSrc.style.textDecoration = 'line-through';
		}

		// inputFile check
		Modal.OnChangeFile(this.fileModalWrapper, target.files);
	}

	#OpenGallery() {
		this.plugins.imageGallery.open(this.#SetUrlInput.bind(this));
	}

	#SetUrlInput(target) {
		this.altText.value = target.getAttribute('data-value') || target.alt;
		this.#linkValue = this.previewSrc.textContent = this.imgUrlFile.value = target.getAttribute('data-command') || target.src;
		this.imgUrlFile.focus();
	}

	#OnloadImg(oImg, _svgDefaultSize, container) {
		this.setState('produceIndex', this.state.produceIndex - 1);
		delete oImg.onload;

		// svg exception handling
		if (oImg.offsetWidth === 0) this.sizeService.applySize(_svgDefaultSize, '');

		if (this.state.produceIndex === 0) {
			this.component.applyInsertBehavior(container, null, this.pluginOptions.insertBehavior || this.options.get('componentInsertBehavior'));

			this.editor._iframeAutoHeight(this.frameContext);
			this.history.push(false);
		}
	}
}

export default Image_;
