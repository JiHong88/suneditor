import { PluginModal } from '../../interfaces';
import { Modal, Figure } from '../../modules/contracts';
import { FileManager, ModalAnchorEditor } from '../../modules/utils';
import { dom, numbers, env, keyCodeMap } from '../../helper';
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
 * @property {string} [defaultFormatType="block"] - The default image format type ("block" or "inline").
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
 * @class
 * @description Image plugin.
 * - This plugin provides image insertion functionality within the editor, supporting both file upload and URL input.
 */
class Image_ extends PluginModal {
	static key = 'image';
	static className = '';
	/**
	 * @this {Image_}
	 * @param {Element} node - The node to check.
	 * @returns {Element|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		const compNode = dom.check.isFigure(node) || (/^span$/i.test(node.nodeName) && dom.check.isComponentContainer(node)) ? node.firstElementChild : node;
		return /^IMG$/i.test(compNode?.nodeName) ? compNode : dom.check.isAnchor(compNode) && /^IMG$/i.test(compNode?.firstElementChild?.nodeName) ? compNode?.firstElementChild : null;
	}

	#origin_w;
	#origin_h;
	#resizing;
	#onlyPercentage;
	#nonResizing;

	#produceIndex = 0;
	#linkElement = null;
	#linkValue = '';
	#align = 'none';
	#svgDefaultSize = '30%';
	#element = null;
	#cover = null;
	#container = null;
	#caption = null;
	#ratio = { w: 0, h: 0 };

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ImagePluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.image;
		this.icon = 'image';

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
			uploadSizeLimit: numbers.get(pluginOptions.uploadSizeLimit, 0),
			uploadSingleSizeLimit: numbers.get(pluginOptions.uploadSingleSizeLimit, 0),
			allowMultiple: !!pluginOptions.allowMultiple,
			acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'image/*' : pluginOptions.acceptedFormats.trim() || 'image/*',
			useFormatType: pluginOptions.useFormatType ?? true,
			defaultFormatType: ['block', 'inline'].includes(pluginOptions.defaultFormatType) ? pluginOptions.defaultFormatType : 'block',
			keepFormatType: pluginOptions.keepFormatType ?? false,
			insertBehavior: pluginOptions.insertBehavior,
		};

		// create HTML
		const sizeUnit = this.pluginOptions.percentageOnlySize ? '%' : 'px';
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
		this.anchor = new ModalAnchorEditor(this, modalEl.html, {
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
		this.fileModalWrapper = modalEl.fileModalWrapper;
		this.imgInputFile = modalEl.imgInputFile;
		this.imgUrlFile = modalEl.imgUrlFile;
		this.focusElement = this.imgInputFile || this.imgUrlFile;
		this.altText = modalEl.altText;
		this.captionCheckEl = modalEl.captionCheckEl;
		this.captionEl = this.captionCheckEl?.parentElement;
		this.previewSrc = modalEl.previewSrc;
		this.sizeUnit = sizeUnit;
		this.as = 'block';
		this.proportion = null;
		this.inputX = null;
		this.inputY = null;
		this._base64RenderIndex = 0;

		this.#origin_w = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
		this.#origin_h = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
		this.#resizing = this.pluginOptions.canResize;
		this.#onlyPercentage = this.pluginOptions.percentageOnlySize;
		this.#nonResizing = !this.#resizing || !this.pluginOptions.showHeightInput || this.#onlyPercentage;

		// init
		this.eventManager.addEvent(modalEl.tabs, 'click', this.#OpenTab.bind(this));
		if (this.imgInputFile) this.eventManager.addEvent(modalEl.fileRemoveBtn, 'click', this.#RemoveSelectedFiles.bind(this));
		if (this.imgUrlFile) this.eventManager.addEvent(this.imgUrlFile, 'input', this.#OnLinkPreview.bind(this));
		if (this.imgInputFile && this.imgUrlFile) this.eventManager.addEvent(this.imgInputFile, 'change', this.#OnfileInputChange.bind(this));

		const galleryButton = modalEl.galleryButton;
		if (galleryButton) this.eventManager.addEvent(galleryButton, 'click', this.#OpenGallery.bind(this));

		if (this.#resizing) {
			this.proportion = modalEl.proportion;
			this.inputX = modalEl.inputX;
			this.inputY = modalEl.inputY;
			this.inputX.value = this.pluginOptions.defaultWidth;
			this.inputY.value = this.pluginOptions.defaultHeight;

			const ratioChange = this.#OnChangeRatio.bind(this);
			this.eventManager.addEvent(this.inputX, 'keyup', this.#OnInputSize.bind(this, 'x'));
			this.eventManager.addEvent(this.inputY, 'keyup', this.#OnInputSize.bind(this, 'y'));
			this.eventManager.addEvent(this.inputX, 'change', ratioChange);
			this.eventManager.addEvent(this.inputY, 'change', ratioChange);
			this.eventManager.addEvent(this.proportion, 'change', ratioChange);
			this.eventManager.addEvent(modalEl.revertBtn, 'click', this.#OnClickRevert.bind(this));
		}

		if (this.pluginOptions.useFormatType) {
			this.as = this.pluginOptions.defaultFormatType;
			this.asBlock = modalEl.asBlock;
			this.asInline = modalEl.asInline;
			this.eventManager.addEvent([this.asBlock, this.asInline], 'click', this.#OnClickAsButton.bind(this));
		}
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.#produceIndex = 0;
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
			if (this.#resizing) {
				this.inputX.value = this.#origin_w = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
				this.inputY.value = this.#origin_h = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
			}
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
			this.#fixTagStructure(this.inputX?.value, this.inputY?.value);
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
		this.#ratio = {
			w: 0,
			h: 0,
		};
		this.#OpenTab('init');

		if (this.#resizing) {
			this.inputX.value = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
			this.proportion.checked = true;
		}

		if (this.pluginOptions.useFormatType) {
			this.#activeAsInline((this.pluginOptions.keepFormatType ? this.as : this.pluginOptions.defaultFormatType) === 'inline');
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
		const slngleSizeLimit = this.pluginOptions.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			if (!/image/i.test(f.type)) continue;

			s = f.size;
			if (slngleSizeLimit > 0 && s > slngleSizeLimit) {
				const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
				const message = await this.triggerEvent('onImageUploadError', {
					error: err,
					limitSize: slngleSizeLimit,
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
			uploadCallback(infos, infos.files);
		}.bind(this, this.#serverUpload.bind(this), imgInfo);

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
		}.bind(this, this.#urlUpload.bind(this), imgInfo);

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
		this.#applySize(width, height);

		// align
		this.figure.setAlign(oImg, align);

		this.fileManager.setFileData(oImg, file);

		this.#produceIndex++;
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
		this.#applySize(width, height);

		this.fileManager.setFileData(oImg, file);

		this.#produceIndex++;
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

		this.#origin_w = String(figureInfo.originWidth || figureInfo.w || '');
		this.#origin_h = String(figureInfo.originHeight || figureInfo.h || '');
		this.altText.value = this.#element.alt;

		if (this.imgUrlFile) this.#linkValue = this.previewSrc.textContent = this.imgUrlFile.value = this.#element.src;

		/** @type {HTMLInputElement} */
		const activeAlign = this.modal.form.querySelector('input[name="suneditor_image_radio"][value="' + this.#align + '"]') || this.modal.form.querySelector('input[name="suneditor_image_radio"][value="none"]');
		activeAlign.checked = true;
		this.captionCheckEl.checked = !!this.#caption;

		const { dw, dh } = this.figure.getSize(target);

		if (!this.#resizing) return { w: dw, h: dh };

		this.inputX.value = dw === 'auto' ? '' : dw;
		this.inputY.value = dh === 'auto' ? '' : dh;

		const percentageRotation = this.#onlyPercentage && this.figure.isVertical;
		this.proportion.checked = true;
		this.inputX.disabled = percentageRotation ? true : false;
		this.inputY.disabled = percentageRotation ? true : false;
		this.proportion.disabled = percentageRotation ? true : false;

		this.#ratio = this.proportion.checked
			? figureInfo.ratio
			: {
					w: 0,
					h: 0,
				};

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
		return {
			element: this.#element,
			anchor: this.anchor.create(true),
			inputWidth: this.inputX?.value || '',
			inputHeight: this.inputY?.value || '',
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
			this.as = 'inline';
			// buttns
			if (this.alignForm) this.alignForm.style.display = 'none';
			// caption
			if (this.captionEl) this.captionEl.style.display = 'none';
		} else {
			dom.utils.addClass(this.asBlock, 'on');
			dom.utils.removeClass(this.asInline, 'on');
			this.as = 'block';
			// buttns
			if (this.alignForm) this.alignForm.style.display = '';
			// caption
			if (this.captionEl) this.captionEl.style.display = '';
		}
	}

	/**
	 * @description Updates the selected image size, alt text, and caption.
	 * @param {string} width - New image width.
	 * @param {string} height - New image height.
	 */
	#fixTagStructure(width, height) {
		width ||= this.inputX?.value || 'auto';
		height ||= this.inputY?.value || 'auto';

		let imageEl = this.#element;

		// as (block | inline)
		if ((this.as === 'block' && !this.#cover) || (this.as === 'inline' && this.#cover)) {
			imageEl = this.figure.convertAsFormat(imageEl, this.as);
		}

		// --- update image ---
		const cover = this.#cover;
		const container = this.#container === this.#cover ? null : this.#container;

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
			this.#applySize(width, height);
		}

		// transform
		if (modifiedCaption || (!this.#onlyPercentage && changeSize)) {
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
		width ||= this.inputX?.value || 'auto';
		height ||= this.inputY?.value || 'auto';

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
		this.#applySize(width, height);

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
		if (modifiedCaption || !this.#onlyPercentage) {
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
	 * @description Creates a new image component based on provided parameters.
	 * @param {string} src - The image source URL.
	 * @param {?Node} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {{name: string, size: number}} file - File metadata.
	 * @param {string} alt - Alternative text.
	 * @param {boolean} isLast - Indicates if this is the last image in a batch (for scroll and insert behavior).
	 */
	#produce(src, anchor, width, height, align, file, alt, isLast) {
		if (this.as !== 'inline') {
			this.create(src, anchor, width, height, align, file, alt, isLast);
		} else {
			this.createInline(src, anchor, width, height, file, alt, isLast);
		}
	}

	/**
	 * @description Applies the specified width and height to the image.
	 * @param {string} w - Image width.
	 * @param {string} h - Image height.
	 */
	#applySize(w, h) {
		w ||= this.inputX?.value || this.pluginOptions.defaultWidth;
		h ||= this.inputY?.value || this.pluginOptions.defaultHeight;

		if (this.#onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w)) w += '%';
		}
		this.figure.setSize(w, h);
	}

	/**
	 * @description Updates the image source URL.
	 * @param {string} src - The new image source.
	 * @param {HTMLImageElement} element - The image element.
	 * @param {{ name: string, size: number }} file - File metadata.
	 */
	#updateSrc(src, element, file) {
		element.src = src;
		this.fileManager.setFileData(element, file);
		this.component.select(element, Image_.key);
	}

	/**
	 * @description Registers the uploaded image and inserts it into the editor.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image info.
	 * @param {Object<string, *>} response - Server response data.
	 */
	#register(info, response) {
		this.#produceIndex = 0;
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file; i < len; i++) {
			file = {
				name: fileList[i].name,
				size: fileList[i].size,
			};
			if (info.isUpdate) {
				this.#updateSrc(fileList[i].url, info.element, file);
				break;
			} else {
				this.#produce(fileList[i].url, info.anchor, info.inputWidth, info.inputHeight, info.align, file, info.alt, i === len - 1);
			}
		}
	}

	/**
	 * @description Uploads the image to the server.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image upload info.
	 * @param {FileList} files - List of image files.
	 */
	#serverUpload(info, files) {
		if (!files) return;

		// server upload
		const imageUploadUrl = this.pluginOptions.uploadUrl;
		if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
			this.fileManager.upload(imageUploadUrl, this.pluginOptions.uploadHeaders, files, this.#UploadCallBack.bind(this, info), this.#error.bind(this));
		} else {
			this.#setBase64(files, info.anchor, info.inputWidth, info.inputHeight, info.align, info.alt, info.isUpdate);
		}
	}

	/**
	 * @description Handles image upload via URL.
	 * @param {*} info - Image information.
	 */
	#urlUpload(info) {
		this.#produceIndex = 0;
		const infoUrl = info.url;

		if (this.modal.isUpdate) this.#updateSrc(infoUrl, info.element, info.files);
		else this.#produce(infoUrl, info.anchor, info.inputWidth, info.inputHeight, info.align, info.files, info.alt, true);
	}

	/**
	 * @description Converts an image file to Base64 and inserts it into the editor.
	 * @param {FileList|File[]} files - List of image files.
	 * @param {?Node} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {string} alt - Alternative text.
	 * @param {boolean} isUpdate - Whether the image is being updated.
	 * @throws {Error} Throws error if base64 conversion fails.
	 */
	#setBase64(files, anchor, width, height, align, alt, isUpdate) {
		try {
			const filesLen = this.modal.isUpdate ? 1 : files.length;

			if (filesLen === 0) {
				this.ui.hideLoading();
				console.warn('[SUNEDITOR.image.base64.fail] cause : No applicable files');
				return;
			}

			this._base64RenderIndex = filesLen;
			const filesStack = new Array(filesLen);

			if (this.#resizing) {
				this.inputX.value = width;
				this.inputY.value = height;
			}

			for (let i = 0, renderFunc = this.#onRenderBase64.bind(this), reader, file; i < filesLen; i++) {
				reader = new FileReader();
				file = files[i];

				reader.onload = function (loadCallback, on_reader, update, updateElement, on_file, index) {
					filesStack[index] = {
						result: on_reader.result,
						file: on_file,
					};

					if (--this._base64RenderIndex === 0) {
						loadCallback(update, filesStack, updateElement, anchor, width, height, align, alt);
						this.ui.hideLoading();
					}
				}.bind(this, renderFunc, reader, isUpdate, this.#element, file, i);

				reader.readAsDataURL(file);
			}
		} catch (error) {
			this.ui.hideLoading();
			throw Error(`[SUNEDITOR.plugins.image._setBase64.fail] ${error.message}`);
		}
	}

	/**
	 * @description Inserts an image using a Base64-encoded string.
	 * @param {boolean} update - Whether the image is being updated.
	 * @param {Array<{result: string, file: { name: string, size: number }}>} filesStack - Stack of Base64-encoded files.
	 * - result: Image url or Base64-encoded string
	 * - file: File metadata ({ name: string, size: number })
	 * @param {HTMLImageElement} updateElement - The image element being updated.
	 * @param {?HTMLAnchorElement} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {string} alt - Alternative text.
	 */
	#onRenderBase64(update, filesStack, updateElement, anchor, width, height, align, alt) {
		this.#produceIndex = 0;

		for (let i = 0, len = filesStack.length; i < len; i++) {
			if (update) {
				this.#updateSrc(filesStack[i].result, updateElement, filesStack[i].file);
			} else {
				this.#produce(filesStack[i].result, anchor, width, height, align, filesStack[i].file, alt, i === len - 1);
			}
		}
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
	 * @description Handles errors during image upload and displays appropriate messages.
	 * @param {Object<string, *>} response - The error response from the server.
	 * @returns {Promise<void>}
	 */
	async #error(response) {
		const message = await this.triggerEvent('onImageUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.ui.alertOpen(err, 'error');
		console.error('[SUNEDITOR.plugin.image.error]', err);
	}

	/**
	 * @description Handles the callback function for image upload completion.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image information.
	 * @param {XMLHttpRequest} xmlHttp - The XMLHttpRequest object.
	 */
	async #UploadCallBack(info, xmlHttp) {
		if ((await this.triggerEvent('imageUploadHandler', { xmlHttp, info })) === NO_EVENT) {
			const response = JSON.parse(xmlHttp.responseText);
			if (response.errorMessage) {
				this.#error(response);
			} else {
				this.#register(info, response);
			}
		}
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

	#OnInputSize(xy, e) {
		if (keyCodeMap.isSpace(e.code)) {
			e.preventDefault();
			return;
		}

		if (xy === 'x' && this.#onlyPercentage && e.target.value > 100) {
			e.target.value = 100;
		} else if (this.proportion.checked) {
			const ratioSize = Figure.CalcRatio(this.inputX.value, this.inputY.value, this.sizeUnit, this.#ratio);
			if (xy === 'x') {
				this.inputY.value = String(ratioSize.h);
			} else {
				this.inputX.value = String(ratioSize.w);
			}
		}
	}

	#OnChangeRatio() {
		this.#ratio = this.proportion.checked ? Figure.GetRatio(this.inputX.value, this.inputY.value, this.sizeUnit) : { w: 0, h: 0 };
	}

	#OnClickRevert() {
		if (this.#onlyPercentage) {
			this.inputX.value = Number(this.#origin_w) > 100 ? '100' : this.#origin_w;
		} else {
			this.inputX.value = this.#origin_w;
			this.inputY.value = this.#origin_h;
		}
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
		this.#produceIndex--;
		delete oImg.onload;

		// svg exception handling
		if (oImg.offsetWidth === 0) this.#applySize(_svgDefaultSize, '');

		if (this.#produceIndex === 0) {
			this.component.applyInsertBehavior(container, null, this.pluginOptions.insertBehavior || this.options.get('componentInsertBehavior'));

			this.editor._iframeAutoHeight(this.frameContext);
			this.history.push(false);
		}
	}
}

/**
 * @typedef {Object} ModalReturns_image
 * @property {HTMLElement} html
 * @property {HTMLElement} alignForm
 * @property {HTMLElement} fileModalWrapper
 * @property {HTMLInputElement} imgInputFile
 * @property {HTMLInputElement} imgUrlFile
 * @property {HTMLInputElement} altText
 * @property {HTMLInputElement} captionCheckEl
 * @property {HTMLElement} previewSrc
 * @property {HTMLElement} tabs
 * @property {HTMLButtonElement} galleryButton
 * @property {HTMLInputElement} proportion
 * @property {HTMLInputElement} inputX
 * @property {HTMLInputElement} inputY
 * @property {HTMLButtonElement} revertBtn
 * @property {HTMLButtonElement} asBlock
 * @property {HTMLButtonElement} asInline
 * @property {HTMLButtonElement} fileRemoveBtn
 *
 * @param {SunEditor.Core} editor
 * @param {*} pluginOptions
 * @returns {ModalReturns_image}
 */
function CreateHTML_modal({ lang, icons, plugins }, pluginOptions) {
	const createFileInputHtml = !pluginOptions.createFileInput
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<label>${lang.image_modal_file}</label>
			${Modal.CreateFileInput({ icons, lang }, pluginOptions)}
		</div>`;

	const createUrlInputHtml = !pluginOptions.createUrlInput
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<label>${lang.image_modal_url}</label>
			<div class="se-modal-form-files">
				<input class="se-input-form se-input-url" data-focus type="text" />
				${
					plugins.imageGallery
						? `<button type="button" class="se-btn se-tooltip se-modal-files-edge-button __se__gallery" aria-label="${lang.imageGallery}">
							${icons.image_gallery}
							${dom.utils.createTooltipInner(lang.imageGallery)}
							</button>`
						: ''
				}
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
			<input class="se-input-control _se_size_x" placeholder="auto" type="text" />
			<label class="se-modal-size-x">x</label>
			<input type="text" class="se-input-control _se_size_y" placeholder="auto" />
			<label><input type="checkbox" class="se-modal-btn-check _se_check_proportion" checked/>&nbsp;${lang.proportion}</label>
			<button type="button" aria-label="${lang.revert}" class="se-btn se-tooltip se-modal-btn-revert">
				${icons.revert}
				${dom.utils.createTooltipInner(lang.revert)}
			</button>
		</div>`;

	const useFormatTypeHtml = !pluginOptions.useFormatType
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<div class="se-modal-flex-form">
				<button type="button" data-command="asBlock" class="se-btn se-tooltip" aria-label="${lang.inlineStyle}">
					${icons.as_block}
					${dom.utils.createTooltipInner(lang.blockStyle)}
				</button>
				<button type="button" data-command="asInline" class="se-btn se-tooltip" aria-label="${lang.inlineStyle}">
					${icons.as_inline}
					${dom.utils.createTooltipInner(lang.inlineStyle)}
				</button>
			</div>
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
					${useFormatTypeHtml}
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

	const content = dom.utils.createElement('DIV', { class: 'se-modal-content' }, html);

	return {
		html: content,
		alignForm: content.querySelector('.se-figure-align'),
		fileModalWrapper: content.querySelector('.se-flex-input-wrapper'),
		imgInputFile: content.querySelector('.__se__file_input'),
		imgUrlFile: content.querySelector('.se-input-url'),
		altText: content.querySelector('._se_image_alt'),
		captionCheckEl: content.querySelector('._se_image_check_caption'),
		previewSrc: content.querySelector('._se_tab_content_image .se-link-preview'),
		tabs: content.querySelector('.se-modal-tabs'),
		galleryButton: content.querySelector('.__se__gallery'),
		proportion: content.querySelector('._se_check_proportion'),
		inputX: content.querySelector('._se_size_x'),
		inputY: content.querySelector('._se_size_y'),
		revertBtn: content.querySelector('.se-modal-btn-revert'),
		asBlock: content.querySelector('[data-command="asBlock"]'),
		asInline: content.querySelector('[data-command="asInline"]'),
		fileRemoveBtn: content.querySelector('.se-file-remove'),
	};
}

export default Image_;
