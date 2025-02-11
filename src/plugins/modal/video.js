import EditorInjector from '../../editorInjector';
import { Modal, Figure, FileManager } from '../../modules';
import { domUtils, numbers, env, converter } from '../../helper';
import { CreateTooltipInner } from '../../core/section/constructor';
const { NO_EVENT } = env;

/**
 * @typedef {import('../../core/editor').default} EditorInstance
 */

/**
 * @typedef {import('../../core/base/events').VideoInfo} VideoInfo
 */

/**
 * @typedef {import('../../core/section/context').FrameContext} FrameContext
 */

/**
 * @class
 * @description Video plugin.
 * - This plugin provides video embedding functionality within the editor.
 * - It also supports embedding from popular video services
 * @param {EditorInstance} editor - The root editor instance
 * @param {Object} pluginOptions
 * @param {boolean=} [pluginOptions.canResize=true] - Whether the video element can be resized.
 * @param {boolean=} [pluginOptions.showHeightInput=true] - Whether to display the height input field.
 * @param {string=} [pluginOptions.defaultWidth] - The default width of the video element. If a number is provided, "px" will be appended.
 * @param {string=} [pluginOptions.defaultHeight] - The default height of the video element. If a number is provided, "px" will be appended.
 * @param {boolean=} [pluginOptions.percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @param {boolean=} [pluginOptions.createFileInput=false] - Whether to create a file input element for video uploads.
 * @param {boolean=} [pluginOptions.createUrlInput=true] - Whether to create a URL input element for video embedding.
 * @param {string=} [pluginOptions.uploadUrl] - The URL endpoint for video file uploads.
 * @param {Object.<string, string>=} [pluginOptions.uploadHeaders] - Additional headers to include in the video upload request.
 * @param {number=} [pluginOptions.uploadSizeLimit] - The total upload size limit for videos in bytes.
 * @param {number=} [pluginOptions.uploadSingleSizeLimit] - The single file upload size limit for videos in bytes.
 * @param {boolean=} [pluginOptions.allowMultiple=false] - Whether multiple video uploads are allowed.
 * @param {string=} [pluginOptions.acceptedFormats="video/*"] - Accepted file formats for video uploads.
 * @param {number=} [pluginOptions.defaultRatio=0.5625] - The default aspect ratio for the video (e.g., 16:9 is 0.5625).
 * @param {boolean=} [pluginOptions.showRatioOption=true] - Whether to display the ratio option in the modal.
 * @param {Array=} [pluginOptions.ratioOptions] - Custom ratio options for video resizing.
 * @param {Object.<string, string>=} [pluginOptions.videoTagAttributes] - Additional attributes to set on the video tag.
 * @param {Object.<string, string>=} [pluginOptions.iframeTagAttributes] - Additional attributes to set on the iframe tag.
 * @param {string=} [pluginOptions.query_youtube=""] - Additional query parameters for YouTube embedding.
 * @param {string=} [pluginOptions.query_vimeo=""] - Additional query parameters for Vimeo embedding.
 * @param {Object.<string, {pattern: RegExp, action: (url: string) => string, tag: string}>=} [pluginOptions.embedQuery] - Custom query objects for additional embedding services.
 * @param {Array.<RegExp|string>=} [pluginOptions.urlPatterns] - Additional URL patterns for video embedding.
 * @param {Array.<string>=} [pluginOptions.extensions] - Additional file extensions to be recognized for video uploads.
 * @returns {Video}
 */
function Video(editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.video;
	this.icon = 'video';

	// define plugin options
	this.pluginOptions = {
		canResize: pluginOptions.canResize === undefined ? true : pluginOptions.canResize,
		showHeightInput: pluginOptions.showHeightInput === undefined ? true : !!pluginOptions.showHeightInput,
		defaultWidth: !pluginOptions.defaultWidth || !numbers.get(pluginOptions.defaultWidth, 0) ? '' : numbers.is(pluginOptions.defaultWidth) ? pluginOptions.defaultWidth + 'px' : pluginOptions.defaultWidth,
		defaultHeight: !pluginOptions.defaultHeight || !numbers.get(pluginOptions.defaultHeight, 0) ? '' : numbers.is(pluginOptions.defaultHeight) ? pluginOptions.defaultHeight + 'px' : pluginOptions.defaultHeight,
		percentageOnlySize: !!pluginOptions.percentageOnlySize,
		createFileInput: !!pluginOptions.createFileInput,
		createUrlInput: pluginOptions.createUrlInput === undefined || !pluginOptions.createFileInput ? true : pluginOptions.createUrlInput,
		uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
		uploadHeaders: pluginOptions.uploadHeaders || null,
		uploadSizeLimit: /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null,
		uploadSingleSizeLimit: /\d+/.test(pluginOptions.uploadSingleSizeLimit) ? numbers.get(pluginOptions.uploadSingleSizeLimit, 0) : null,
		allowMultiple: !!pluginOptions.allowMultiple,
		acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'video/*' : pluginOptions.acceptedFormats.trim() || 'video/*',
		defaultRatio: numbers.get(pluginOptions.defaultRatio, 4) || 0.5625,
		showRatioOption: pluginOptions.showRatioOption === undefined ? true : !!pluginOptions.showRatioOption,
		ratioOptions: !pluginOptions.ratioOptions ? null : pluginOptions.ratioOptions,
		videoTagAttributes: pluginOptions.videoTagAttributes || null,
		iframeTagAttributes: pluginOptions.iframeTagAttributes || null,
		query_youtube: pluginOptions.query_youtube || '',
		query_vimeo: pluginOptions.query_vimeo || ''
	};

	// create HTML
	const sizeUnit = this.pluginOptions.percentageOnlySize ? '%' : 'px';
	const modalEl = CreateHTML_modal(editor, this.pluginOptions);
	const figureControls = pluginOptions.controls || !this.pluginOptions.canResize ? [['align', 'revert', 'edit', 'remove']] : [['resize_auto,75,50', 'edit', 'align', 'revert', 'remove']];

	// show align
	if (!figureControls.some((subArray) => subArray.includes('align'))) modalEl.querySelector('.se-figure-align').style.display = 'none';

	// modules
	const defaultRatio = this.pluginOptions.defaultRatio * 100 + '%';
	this.modal = new Modal(this, modalEl);
	this.figure = new Figure(this, figureControls, { sizeUnit: sizeUnit, autoRatio: { current: defaultRatio, default: defaultRatio } });
	this.fileManager = new FileManager(this, {
		query: 'iframe, video',
		loadHandler: this.events.onVideoLoad,
		eventHandler: this.events.onVideoAction
	});

	// members
	this.fileModalWrapper = modalEl.querySelector('.se-flex-input-wrapper');
	this.videoInputFile = modalEl.querySelector('.__se__file_input');
	this.videoUrlFile = modalEl.querySelector('.se-input-url');
	this.focusElement = this.videoUrlFile || this.videoInputFile;
	this.previewSrc = modalEl.querySelector('.se-link-preview');
	this._linkValue = '';
	this._align = 'none';
	this._frameRatio = defaultRatio;
	this._defaultRatio = defaultRatio;
	this._defaultSizeX = '100%';
	this._defaultSizeY = this.pluginOptions.defaultRatio * 100 + '%';
	this.sizeUnit = sizeUnit;
	this.proportion = {};
	this.frameRatioOption = {};
	this.inputX = {};
	this.inputY = {};
	this._element = null;
	this._cover = null;
	this._container = null;
	this._ratio = { w: 1, h: 1 };
	this._origin_w = this.pluginOptions.defaultWidth === '100%' ? '' : this.pluginOptions.defaultWidth;
	this._origin_h = this.pluginOptions.defaultHeight === defaultRatio ? '' : this.pluginOptions.defaultHeight;
	this._resizing = this.pluginOptions.canResize;
	this._onlyPercentage = this.pluginOptions.percentageOnlySize;
	this._nonResizing = !this._resizing || !this.pluginOptions.showHeightInput || this._onlyPercentage;
	this.query = {
		youtube: {
			pattern: /youtu\.?be/i,
			action: (url) => {
				url = this.convertUrlYoutube(url);
				return converter.addUrlQuery(url, this.pluginOptions.query_youtube);
			},
			tag: 'iframe'
		},
		vimeo: {
			pattern: /vimeo\.com/i,
			action: (url) => {
				url = this.convertUrlVimeo(url);
				return converter.addUrlQuery(url, this.pluginOptions.query_vimeo);
			},
			tag: 'iframe'
		},
		...pluginOptions.embedQuery
	};

	const urlPatterns = [];
	for (const key in this.query) {
		urlPatterns.push(this.query[key].pattern);
	}
	this.extensions = ['.mp4', '.avi', '.mov', '.webm', '.flv', '.mkv', '.m4v', '.ogv'].concat(this.pluginOptions.extensions || []);
	this.urlPatterns = urlPatterns
		.concat([
			/youtu\.?be/,
			/vimeo\.com\//,
			/dailymotion\.com\/video\//,
			/facebook\.com\/.+\/videos\//,
			/facebook\.com\/watch\/\?v=/,
			/twitter\.com\/.+\/status\//,
			/twitch\.tv\/videos\//,
			/twitch\.tv\/[^/]+$/,
			/tiktok\.com\/@[^/]+\/video\//,
			/instagram\.com\/p\//,
			/instagram\.com\/tv\//,
			/instagram\.com\/reel\//,
			/linkedin\.com\/posts\//,
			/\.(wistia\.com|wi\.st)\/(medias|embed)\//,
			/loom\.com\/share\//
		])
		.concat(this.pluginOptions.urlPatterns || []);

	const galleryButton = modalEl.querySelector('.__se__gallery');
	if (galleryButton) this.eventManager.addEvent(galleryButton, 'click', OpenGallery.bind(this));

	// init
	if (this.videoInputFile) this.eventManager.addEvent(modalEl.querySelector('.se-file-remove'), 'click', RemoveSelectedFiles.bind(this));
	if (this.videoUrlFile) this.eventManager.addEvent(this.videoUrlFile, 'input', OnLinkPreview.bind(this));
	if (this.videoInputFile && this.videoUrlFile) this.eventManager.addEvent(this.videoInputFile, 'change', OnfileInputChange.bind(this));

	if (this._resizing) {
		this.proportion = modalEl.querySelector('._se_check_proportion');
		this.frameRatioOption = modalEl.querySelector('.se-modal-ratio');
		this.inputX = modalEl.querySelector('._se_size_x');
		this.inputY = modalEl.querySelector('._se_size_y');
		this.inputX.value = this.pluginOptions.defaultWidth;
		this.inputY.value = this.pluginOptions.defaultHeight;

		const ratioChange = OnChangeRatio.bind(this);
		this.eventManager.addEvent(this.inputX, 'keyup', OnInputSize.bind(this, 'x'));
		this.eventManager.addEvent(this.inputY, 'keyup', OnInputSize.bind(this, 'y'));
		this.eventManager.addEvent(this.inputX, 'change', ratioChange);
		this.eventManager.addEvent(this.inputY, 'change', ratioChange);
		this.eventManager.addEvent(this.proportion, 'change', ratioChange);
		this.eventManager.addEvent(this.frameRatioOption, 'change', SetRatio.bind(this));
		this.eventManager.addEvent(modalEl.querySelector('.se-modal-btn-revert'), 'click', OnClickRevert.bind(this));
	}
}

Video.key = 'video';
Video.type = 'modal';
Video.className = '';
Video.component = function (node) {
	if (/^(VIDEO)$/i.test(node?.nodeName)) {
		return node;
	} else if (/^(IFRAME)$/i.test(node?.nodeName)) {
		return this.checkContentType(node.src) ? node : null;
	}
	return null;
};
Video.prototype = {
	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a "Modal" module's is opened.
	 */
	open() {
		this.modal.open();
	},

	/**
	 * @editorMethod Modules.Controller(Figure)
	 * @description Executes the method that is called when a target component is edited.
	 * @param {Element} target Target element
	 */
	edit() {
		this.modal.open();
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description Executes the method that is called when a plugin's modal is opened.
	 * @param {boolean} isUpdate "Indicates whether the modal is for editing an existing component (true) or registering a new one (false)."
	 */
	on(isUpdate) {
		if (!isUpdate) {
			this.inputX.value = this._origin_w = this.pluginOptions.defaultWidth === this._defaultSizeX ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this._origin_h = this.pluginOptions.defaultHeight === this._defaultSizeY ? '' : this.pluginOptions.defaultHeight;
			this.proportion.disabled = true;
			if (this.videoInputFile && this.pluginOptions.allowMultiple) this.videoInputFile.setAttribute('multiple', 'multiple');
		} else {
			if (this.videoInputFile && this.pluginOptions.allowMultiple) this.videoInputFile.removeAttribute('multiple');
		}

		if (this._resizing) {
			this._setRatioSelect(this._origin_h || this._defaultRatio);
		}
	},

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "paste" or "drop".
	 * @param {Object} params { frameContext, event, file }
	 * @param {FrameContext} params.frameContext Frame context
	 * @param {Event} params.event Event object
	 * @param {File} params.file File object
	 * @returns {boolean} - If return false, the file upload will be canceled
	 */
	onPastAndDrop({ file }) {
		if (!/^video/.test(file.type)) return;

		this.submitFile([file]);
		this.editor.focus();

		return false;
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called when a form within a modal window is "submit".
	 * @returns {Promise<boolean>} Success / failure
	 */
	async modalAction() {
		this._align = this.modal.form.querySelector('input[name="suneditor_video_radio"]:checked').value;

		let result = false;
		if (this.videoInputFile && this.videoInputFile.files.length > 0) {
			result = await this.submitFile(this.videoInputFile.files);
		} else if (this.videoUrlFile && this._linkValue.length > 0) {
			result = await this.submitURL(this._linkValue);
		}

		if (result) this._w.setTimeout(this.component.select.bind(this.component, this._element, 'video'), 0);

		return result;
	},

	/**
	 * @editorMethod Editor.core
	 * @description This method is used to validate and preserve the format of the component within the editor.
	 * - It ensures that the structure and attributes of the element are maintained and secure.
	 * - The method checks if the element is already wrapped in a valid container and updates its attributes if necessary.
	 * - If the element isn't properly contained, a new container is created to retain the format.
	 * @returns {Object} The format retention object containing the query and method to process the element.
	 * @returns {string} query - The selector query to identify the relevant elements (in this case, 'audio').
	 * @returns {(element: Element) => void} method - The function to execute on the element to validate and preserve its format.
	 * - The function takes the element as an argument, checks if it is contained correctly, and applies necessary adjustments.
	 */
	retainFormat() {
		return {
			query: 'iframe, video',
			method: async (element) => {
				if (/^(iframe)$/i.test(element?.nodeName)) {
					if (!this.checkContentType(element.src)) return;
				}

				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && figureInfo.cover) return;

				this._ready(element);
				const line = this.format.getLine(element);
				if (line) this._align = line.style.textAlign || line.style.float;

				this._update(element);
			}
		};
	},

	/**
	 * @editorMethod Modules.Modal
	 * @description This function is called before the modal window is opened, but before it is closed.
	 */
	init() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		if (this.videoInputFile) this.videoInputFile.value = '';
		if (this.videoUrlFile) this._linkValue = this.previewSrc.textContent = this.videoUrlFile.value = '';
		if (this.videoInputFile && this.videoUrlFile) {
			this.videoUrlFile.removeAttribute('disabled');
			this.previewSrc.style.textDecoration = '';
		}

		this.modal.form.querySelector('input[name="suneditor_video_radio"][value="none"]').checked = true;
		this._ratio = { w: 1, h: 1 };
		this._nonResizing = false;

		if (this._resizing) {
			this.inputX.value = this.pluginOptions.defaultWidth === this._defaultSizeX ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this.pluginOptions.defaultHeight === this._defaultSizeY ? '' : this.pluginOptions.defaultHeight;
			this.proportion.checked = false;
			this.proportion.disabled = true;
			this._setRatioSelect(this._defaultRatio);
		}
	},

	/**
	 * @editorMethod Modules.Component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {Element} target Target component element
	 */
	select(target) {
		this._ready(target);
	},

	/**
	 * @private
	 * @description Prepares the component for selection.
	 * - Ensures that the controller is properly positioned and initialized.
	 * - Prevents duplicate event handling if the component is already selected.
	 * @param {Element} target - The selected element.
	 */
	_ready(target) {
		if (!target) return;
		const figureInfo = this.figure.open(target, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: false });

		this._element = target;
		this._cover = figureInfo.cover;
		this._container = figureInfo.container;
		this._align = figureInfo.align;
		target.style.float = '';

		this._origin_w = figureInfo.width || figureInfo.originWidth || figureInfo.w || '';
		this._origin_h = figureInfo.height || figureInfo.originHeight || figureInfo.h || '';

		let w = figureInfo.width || figureInfo.w || this._origin_w || '';
		const h = figureInfo.height || figureInfo.h || this._origin_h || '';

		if (this.videoUrlFile) this._linkValue = this.previewSrc.textContent = this.videoUrlFile.value = this._element.src || (this._element.querySelector('source') || '').src || '';
		(this.modal.form.querySelector('input[name="suneditor_video_radio"][value="' + this._align + '"]') || this.modal.form.querySelector('input[name="suneditor_video_radio"][value="none"]')).checked = true;

		if (!this._resizing) return;

		const percentageRotation = this._onlyPercentage && this.figure.isVertical;
		if (this._onlyPercentage) {
			w = numbers.get(w, 2);
			if (w > 100) w = 100;
		}
		this.inputX.value = w === 'auto' ? '' : w;

		if (!this._onlyPercentage) {
			const infoH = percentageRotation ? '' : figureInfo.height;
			this.inputY.value = infoH === 'auto' ? '' : infoH;
		}

		if (!this._setRatioSelect(h)) this.inputY.value = this._onlyPercentage ? numbers.get(h, 2) : h;

		this.proportion.checked = true;
		this.inputX.disabled = percentageRotation ? true : false;
		this.inputY.disabled = percentageRotation ? true : false;
		this.proportion.disabled = percentageRotation ? true : false;

		this._ratio = this.proportion.checked ? figureInfo.ratio : { w: 1, h: 1 };
	},

	/**
	 * @editorMethod Editor.Component
	 * @description Method to delete a component of a plugin, called by the "FileManager", "Controller" module.
	 * @param {Element} target Target element
	 * @returns {Promise<void>}
	 */
	async destroy(element) {
		const targetEl = element || this._element;
		const container = domUtils.getParentElement(targetEl, Figure.__is) || targetEl;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		const emptyDiv = container.parentNode;

		const message = await this.triggerEvent('onVideoDeleteBefore', { element: targetEl, container, align: this._align, url: this._linkValue });
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

	/**
	 * @description Checks if the given URL matches any of the defined URL patterns.
	 * @param {string} url - The URL to check.
	 * @returns {boolean} True if the URL matches a known pattern; otherwise, false.
	 */
	checkContentType(url) {
		url = url?.toLowerCase() || '';
		if (this.extensions.some((ext) => url.endsWith(ext)) || this.urlPatterns.some((pattern) => pattern.test(url))) {
			return true;
		}

		return false;
	},

	/**
	 * @description Finds and processes the URL for video by matching it against known service patterns.
	 * @param {string} url - The original URL.
	 * @returns {{origin: string, url: string, tag: string}|null} An object containing the original URL, the processed URL, and the tag type (e.g., 'iframe'),
	 * or null if no matching pattern is found.
	 */
	findProcessUrl(url) {
		const query = this.query;
		for (const key in query) {
			const service = query[key];
			if (service.pattern.test(url)) {
				return {
					origin: url,
					url: service.action(url),
					tag: service.tag
				};
			}
		}

		return null;
	},

	/**
	 * @description Converts a YouTube URL into an embeddable URL.
	 * - If the URL does not start with "http", it prepends "https://". It also replaces "watch?v=" with the embed path.
	 * @param {string} url - The original YouTube URL.
	 * @returns {string} The converted YouTube embed URL.
	 */
	convertUrlYoutube(url) {
		if (!/^http/.test(url)) url = 'https://' + url;
		url = url.replace('watch?v=', '');
		if (!/^\/\/.+\/embed\//.test(url)) {
			url = url.replace(url.match(/\/\/.+\//)[0], '//www.youtube.com/embed/').replace('&', '?&');
		}
		return url;
	},

	/**
	 * @description Converts a Vimeo URL into an embeddable URL.
	 * - Removes any trailing slash and extracts the video ID from the URL.
	 * @param {string} url - The original Vimeo URL.
	 * @returns {string} The converted Vimeo embed URL.
	 */
	convertUrlVimeo(url) {
		if (url.endsWith('/')) {
			url = url.slice(0, -1);
		}
		url = 'https://player.vimeo.com/video/' + url.slice(url.lastIndexOf('/') + 1);
		return url;
	},

	/**
	 * @description Adds query parameters to a URL.
	 * - If the URL already contains a query string, the provided query is appended with an "&".
	 * @param {string} url - The original URL.
	 * @param {string} query - The query string to append.
	 * @returns {string} The URL with the appended query parameters.
	 */
	addQuery(url, query) {
		if (query.length > 0) {
			if (/\?/.test(url)) {
				const splitUrl = url.split('?');
				url = splitUrl[0] + '?' + query + '&' + splitUrl[1];
			} else {
				url += '?' + query;
			}
		}
		return url;
	},

	/**
	 * @description Creates or updates a video embed component.
	 * - When updating, it replaces the existing element if necessary and applies the new source, size, and alignment.
	 * - When creating, it wraps the provided element in a figure container.
	 * @param {HTMLIFrameElement|HTMLVideoElement} oFrame - The existing video element (for update) or a newly created one.
	 * @param {string} src - The source URL for the video.
	 * @param {string} width - The desired width for the video element.
	 * @param {string} height - The desired height for the video element.
	 * @param {string} align - The alignment to apply to the video element (e.g., 'left', 'center', 'right').
	 * @param {boolean} isUpdate - Indicates whether this is an update to an existing component (true) or a new creation (false).
	 * @param {{name: string, size: number}} file - File metadata associated with the video
	 */
	create(oFrame, src, width, height, align, isUpdate, file) {
		let cover = null;
		let container = null;

		/** update */
		if (isUpdate) {
			oFrame = this._element;
			if (oFrame.src !== src) {
				const processUrl = this.findProcessUrl(src);
				if (/^iframe$/i.test(processUrl?.tag) && !/^iframe$/i.test(oFrame.nodeName)) {
					const newTag = this.createIframeTag();
					newTag.src = src;
					oFrame.parentNode.replaceChild(newTag, oFrame);
					this._element = oFrame = newTag;
				} else if (/^video$/i.test(processUrl?.tag) && !/^video$/i.test(oFrame.nodeName)) {
					const newTag = this.createVideoTag();
					newTag.src = src;
					oFrame.parentNode.replaceChild(newTag, oFrame);
					this._element = oFrame = newTag;
				} else {
					oFrame.src = src;
				}
			}
			container = this._container;
			cover = domUtils.getParentElement(oFrame, 'FIGURE');
		} else {
			/** create */
			oFrame.src = src;
			this._element = oFrame;
			const figure = Figure.CreateContainer(oFrame, 'se-video-container');
			cover = figure.cover;
			container = figure.container;
		}

		/** rendering */
		this._element = oFrame;
		this._cover = cover;
		this._container = container;
		this.figure.open(oFrame, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: true });

		width = width || this._defaultSizeX;
		height = height || this._frameRatio;
		const size = this.figure.getSize(oFrame);
		const inputUpdate = size.w !== width || size.h !== height;
		const changeSize = !isUpdate || inputUpdate;

		// set size
		if (changeSize) {
			this._applySize(width, height);
		}

		// align
		this.figure.setAlign(oFrame, align);

		// select figure
		// oFrame.onload = OnloadVideo.bind(this, oFrame);

		this.fileManager.setFileData(oFrame, file);

		if (!isUpdate) {
			this.component.insert(container, { skipCharCount: false, skipSelection: true, skipHistory: false });
			if (!this.options.get('componentAutoSelect')) {
				const line = this.format.addLine(container, null);
				if (line) this.selection.setRange(line, 0, line, 0);
			}
			return;
		}

		if (this._resizing && changeSize && this.figure.isVertical) this.figure.setTransform(oFrame, width, height, 0);
		this.history.push(false);
	},

	/**
	 * @description Creates a new iframe element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes for embedding.
	 * @param {Object.<string, string>} [props] - An optional object containing properties to assign to the iframe.
	 * @returns {HTMLIFrameElement} The newly created iframe element.
	 */
	createIframeTag(props) {
		const iframeTag = domUtils.createElement('IFRAME');
		if (props) {
			for (const key in props) {
				iframeTag[key] = props[key];
			}
		}
		this._setIframeAttrs(iframeTag);
		return iframeTag;
	},

	/**
	 * @description Creates a new video element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes.
	 * @param {Object.<string, string>} [props] - An optional object containing properties to assign to the video element.
	 * @returns {HTMLVideoElement} The newly created video element.
	 */
	createVideoTag(props) {
		const videoTag = domUtils.createElement('VIDEO');
		if (props) {
			for (const key in props) {
				videoTag[key] = props[key];
			}
		}
		this._setTagAttrs(videoTag);
		return videoTag;
	},

	/**
	 * @private
	 * @description Sets the size of the video element.
	 * @param {string} w - The width of the video.
	 * @param {string} h - The height of the video.
	 */
	_applySize(w, h) {
		if (!w) w = this.inputX.value || this.pluginOptions.defaultWidth;
		if (!h) h = this.inputY.value || this.pluginOptions.defaultHeight;
		if (this._onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w)) w += '%';
		}
		this.figure.setSize(w, h);
	},

	/**
	 * @private
	 * @description Retrieves video information including size and alignment.
	 * @returns {VideoInfo} Video information object.
	 */
	_getInfo() {
		return {
			inputWidth: this.inputX.value,
			inputHeight: this.inputY.value,
			align: this._align,
			isUpdate: this.modal.isUpdate,
			element: this._element
		};
	},

	/**
	 * @description Create an "video" component using the provided files.
	 * @param {Array.<File>} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitFile(fileList) {
		if (fileList.length === 0) return;

		let fileSize = 0;
		const files = [];
		const slngleSizeLimit = this.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			if (!/video/i.test(f.type)) continue;

			s = f.size;
			if (slngleSizeLimit && slngleSizeLimit > s) {
				const err = '[SUNEDITOR.videoUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
				const message = await this.triggerEvent('onVideoUploadError', {
					error: err,
					limitSize: slngleSizeLimit,
					uploadSize: s,
					file: f
				});

				this.ui.noticeOpen(message === NO_EVENT ? err : message || err);

				return false;
			}

			files.push(f);
			fileSize += s;
		}

		const limitSize = this.pluginOptions.uploadSizeLimit;
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.videoUpload.fail] Size of uploadable total videos: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onVideoUploadError', { error: err, limitSize, currentSize, uploadSize: fileSize });

			this.ui.noticeOpen(message === NO_EVENT ? err : message || err);

			return false;
		}

		const videoInfo = {
			url: null,
			files,
			...this._getInfo()
		};

		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			this._serverUpload(infos, infos.files);
		}.bind(this, videoInfo);

		const result = await this.triggerEvent('onVideoUploadBefore', {
			info: videoInfo,
			handler
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);
	},

	/**
	 * @description Create an "video" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitURL(url) {
		if (!url) url = this._linkValue;
		if (!url) return false;

		/** iframe source */
		if (/^<iframe.*\/iframe>$/.test(url)) {
			const oIframe = new DOMParser().parseFromString(url, 'text/html').querySelector('iframe');
			url = oIframe.src;
			if (url.length === 0) return false;
		}

		const processUrl = this.findProcessUrl(url);
		if (processUrl) {
			url = processUrl.url;
		}

		const file = { name: url.split('/').pop(), size: 0 };
		const videoInfo = { url, files: file, ...this._getInfo(), process: processUrl };

		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			this.create(this[/^iframe$/i.test(infos.process?.tag) ? 'createIframeTag' : 'createVideoTag'](), infos.url, infos.inputWidth, infos.inputHeight, infos.align, infos.isUpdate, infos.files);
		}.bind(this, videoInfo);

		const result = await this.triggerEvent('onVideoUploadBefore', {
			info: videoInfo,
			handler
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	},

	/**
	 * @private
	 * @description Updates the video component within the editor.
	 * @param {HTMLIFrameElement|HTMLVideoElement} oFrame - The video element to update.
	 */
	_update(oFrame) {
		if (!oFrame) return;

		if (/^video$/i.test(oFrame.nodeName)) {
			this._setTagAttrs(oFrame);
		} else if (/^iframe$/i.test(oFrame.nodeName)) {
			this._setIframeAttrs(oFrame);
		}

		let existElement = this.format.isBlock(oFrame.parentNode) || domUtils.isWysiwygFrame(oFrame.parentNode) ? oFrame : this.format.getLine(oFrame) || oFrame;

		const prevFrame = oFrame;
		oFrame = oFrame.cloneNode(true);
		const figure = Figure.CreateContainer(oFrame, 'se-video-container');
		const container = figure.container;

		const figcaption = existElement.querySelector('figcaption');
		let caption = null;
		if (figcaption) {
			caption = domUtils.createElement('DIV');
			caption.innerHTML = figcaption.innerHTML;
			domUtils.removeItem(figcaption);
		}

		// size
		this.figure.open(oFrame, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: true });
		const size = (oFrame.getAttribute('data-se-size') || ',').split(',');
		this._applySize(size[0] || prevFrame.style.width || prevFrame.width || '', size[1] || prevFrame.style.height || prevFrame.height || '');

		// align
		const format = this.format.getLine(prevFrame);
		if (format) this._align = format.style.textAlign || format.style.float;
		this.figure.setAlign(oFrame, this._align);

		if (domUtils.getParentElement(prevFrame, domUtils.isExcludeFormat)) {
			prevFrame.parentNode.replaceChild(container, prevFrame);
		} else if (domUtils.isListCell(existElement)) {
			const refer = domUtils.getParentElement(prevFrame, (current) => current.parentNode === existElement);
			existElement.insertBefore(container, refer);
			domUtils.removeItem(prevFrame);
			this.nodeTransform.removeEmptyNode(refer, null, true);
		} else if (this.format.isLineOnly(existElement)) {
			const refer = domUtils.getParentElement(prevFrame, (current) => current.parentNode === existElement);
			existElement = this.nodeTransform.split(existElement, refer);
			existElement.parentNode.insertBefore(container, existElement);
			domUtils.removeItem(prevFrame);
			this.nodeTransform.removeEmptyNode(existElement, null, true);
		} else {
			existElement.parentNode.replaceChild(container, existElement);
		}

		if (caption) existElement.parentNode.insertBefore(caption, container.nextElementSibling);

		return oFrame;
	},

	/**
	 * @private
	 * @description Registers the uploaded video in the editor.
	 * @param {VideoInfo} info - Video information object.
	 * @param {Object.<string, *>} response - Server response containing video data.
	 */
	_register(info, response) {
		const fileList = response.result;
		const videoTag = this.createVideoTag();

		for (let i = 0, len = fileList.length; i < len; i++) {
			this.create(info.isUpdate ? info.element : videoTag.cloneNode(false), fileList[i].url, info.inputWidth, info.inputHeight, info.align, info.isUpdate, {
				name: fileList[i].name,
				size: fileList[i].size
			});
		}
	},

	/**
	 * @private
	 * @description Uploads a video to the server using an external upload handler.
	 * @param {VideoInfo} info - Video information object.
	 * @param {Array.<File>} files - The video files to upload.
	 */
	_serverUpload(info, files) {
		if (!files) return;

		const videoUploadUrl = this.pluginOptions.uploadUrl;
		if (typeof videoUploadUrl === 'string' && videoUploadUrl.length > 0) {
			this.fileManager.upload(videoUploadUrl, this.pluginOptions.uploadHeaders, files, UploadCallBack.bind(this, info), this._error.bind(this));
		}
	},

	/**
	 * @private
	 * @description Sets attributes for the video tag.
	 * @param {Element} element - The video element.
	 */
	_setTagAttrs(element) {
		element.setAttribute('controls', true);

		const attrs = this.pluginOptions.videoTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	},

	/**
	 * @private
	 * @description Sets attributes for the iframe tag.
	 * @param {Element} element - The iframe element.
	 */
	_setIframeAttrs(element) {
		element.frameBorder = '0';
		element.allowFullscreen = true;

		const attrs = this.pluginOptions.iframeTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	},

	/**
	 * @private
	 * @description Selects a ratio option in the ratio dropdown.
	 * @param {string} value - The selected ratio value.
	 * @returns {boolean} Returns true if a ratio was selected.
	 */
	_setRatioSelect(value) {
		let ratioSelected = false;
		const ratioOption = this.frameRatioOption.options;

		if (/%$/.test(value) || this._onlyPercentage) value = numbers.get(value, 2) / 100 + '';
		else if (!numbers.is(value) || value * 1 >= 1) value = '';

		this.inputY.placeholder = '';
		for (let i = 0, len = ratioOption.length; i < len; i++) {
			if (ratioOption[i].value === value) {
				ratioSelected = ratioOption[i].selected = true;
				this.inputY.placeholder = !value ? '' : value * 100 + '%';
			} else ratioOption[i].selected = false;
		}

		return ratioSelected;
	},

	/**
	 * @private
	 * @description Handles video upload errors.
	 * @param {Object.<string, *>} response - The error response object.
	 * @returns {Promise<void>}
	 */
	async _error(response) {
		const message = await this.triggerEvent('onVideoUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.ui.noticeOpen(err);
		console.error('[SUNEDITOR.plugin.video.error]', message);
	},

	constructor: Video
};

/**
 * @private
 * @description Handles the callback function for video upload completion.
 * @param {VideoInfo} info - Video information.
 * @param {XMLHttpRequest} xmlHttp - The XMLHttpRequest object.
 */
async function UploadCallBack(info, xmlHttp) {
	if ((await this.triggerEvent('videoUploadHandler', { xmlHttp, info })) === NO_EVENT) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response);
		} else {
			this._register(info, response);
		}
	}
}

/**
 * @private
 * @description Removes selected files from the file input.
 */
function RemoveSelectedFiles() {
	this.videoInputFile.value = '';
	if (this.videoUrlFile) {
		this.videoUrlFile.removeAttribute('disabled');
		this.previewSrc.style.textDecoration = '';
	}

	// inputFile check
	Modal.OnChangeFile(this.fileModalWrapper, []);
}

/**
 * @private
 * @description Handles link preview input changes.
 * @param {Event} e - The input event.
 */
function OnLinkPreview(e) {
	const value = e.target.value.trim();
	if (/^<iframe.*\/iframe>$/.test(value)) {
		this._linkValue = value;
		this.previewSrc.textContent = '<IFrame :src=".."></IFrame>';
	} else {
		this._linkValue = this.previewSrc.textContent = !value
			? ''
			: this.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
			? this.options.get('defaultUrlProtocol') + value
			: !value.includes('://')
			? '/' + value
			: value;
	}
}

/**
 * @private
 * @description Opens the video gallery.
 */
function OpenGallery() {
	this.plugins.videoGallery.open(_setUrlInput.bind(this));
}

/**
 * @private
 * @description Sets the URL input value when selecting from the gallery.
 * @param {Element} target - The selected video element.
 */
function _setUrlInput(target) {
	this._linkValue = this.previewSrc.textContent = this.videoUrlFile.value = target.getAttribute('data-command') || target.src;
	this.videoUrlFile.focus();
}

function OnfileInputChange({ target }) {
	if (!this.videoInputFile.value) {
		this.videoUrlFile.removeAttribute('disabled');
		this.previewSrc.style.textDecoration = '';
	} else {
		this.videoUrlFile.setAttribute('disabled', true);
		this.previewSrc.style.textDecoration = 'line-through';
	}

	// inputFile check
	Modal.OnChangeFile(this.fileModalWrapper, target.files);
}

function OnClickRevert() {
	if (this._onlyPercentage) {
		this.inputX.value = this._origin_w > 100 ? 100 : this._origin_w;
	} else {
		this.inputX.value = this._origin_w;
		this.inputY.value = this._origin_h;
	}
}

function SetRatio(e) {
	const value = e.target.options[e.target.selectedIndex].value;
	this._defaultSizeY = this.figure.autoRatio.current = this._frameRatio = !value ? this._defaultSizeY : value * 100 + '%';
	this.inputY.placeholder = !value ? '' : value * 100 + '%';
	this.inputY.value = '';
}

function OnChangeRatio() {
	this._ratio = this.proportion.checked ? Figure.GetRatio(this.inputX.value, this.inputY.value, this.sizeUnit) : { w: 1, h: 1 };
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

	if (xy === 'y') {
		this._setRatioSelect(e.target.value || this._defaultRatio);
	}
}

function CreateHTML_modal({ lang, icons, plugins }, pluginOptions) {
	let html = /*html*/ `
	<form method="post" enctype="multipart/form-data">
		<div class="se-modal-header">
			<button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
			${icons.cancel}
			</button>
			<span class="se-modal-title">${lang.video_modal_title}</span>
		</div>
		<div class="se-modal-body">`;

	if (pluginOptions.createFileInput) {
		html += /*html*/ `
			<div class="se-modal-form">
				<label>${lang.video_modal_file}</label>
				${Modal.CreateFileInput({ lang, icons }, pluginOptions)}
			</div>`;
	}

	if (pluginOptions.createUrlInput) {
		html += /*html*/ `
			<div class="se-modal-form">
				<label>${lang.video_modal_url}</label>
				<div class="se-modal-form-files">
					<input class="se-input-form se-input-url" type="text" data-focus />
					${
						plugins.videoGallery
							? `<button type="button" class="se-btn se-tooltip se-modal-files-edge-button __se__gallery" aria-label="${lang.videoGallery}">
								${icons.video_gallery}
								${CreateTooltipInner(lang.videoGallery)}
								</button>`
							: ''
					}
				</div>
				<pre class="se-link-preview"></pre>
			</div>`;
	}

	if (pluginOptions.canResize) {
		const ratioList = pluginOptions.ratioOptions || [
			{ name: '16:9', value: 0.5625 },
			{ name: '4:3', value: 0.75 },
			{ name: '21:9', value: 0.4285 },
			{ name: '9:16', value: 1.78 }
		];
		const ratio = pluginOptions.defaultRatio;
		const onlyPercentage = pluginOptions.percentageOnlySize;
		const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
		const heightDisplay = !pluginOptions.showHeightInput ? ' style="display: none !important;"' : '';
		const ratioDisplay = !pluginOptions.showRatioOption ? ' style="display: none !important;"' : '';
		const onlyWidthDisplay = !onlyPercentage && !pluginOptions.showHeightInput && !pluginOptions.showRatioOption ? ' style="display: none !important;"' : '';
		html += /*html*/ `
			<div class="se-modal-form">
				<div class="se-modal-size-text">
					<label class="size-w">${lang.width}</label>
					<label class="se-modal-size-x">&nbsp;</label>
					<label class="size-h"${heightDisplay}>${lang.height}</label>
					<label class="size-h"${ratioDisplay}>(${lang.ratio})</label>
				</div>
				<input class="se-input-control _se_size_x" placeholder="100%"${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}/>
				<label class="se-modal-size-x"${onlyWidthDisplay}>${onlyPercentage ? '%' : 'x'}</label>
				<input class="se-input-control _se_size_y" placeholder="${pluginOptions.defaultRatio * 100}%"
				${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}${heightDisplay}/>
				<select class="se-input-select se-modal-ratio" title="${lang.ratio}" aria-label="${lang.ratio}"${ratioDisplay}>
					${!heightDisplay ? '<option value=""> - </option>' : ''} 
					${ratioList.map((ratioOption) => `<option value="${ratioOption.value}"${ratio.toString() === ratioOption.value.toString() ? ' selected' : ''}>${ratioOption.name}</option>`).join('')}
				</select>
				<button type="button" title="${lang.revert}" aria-label="${lang.revert}" class="se-btn se-modal-btn-revert">${icons.revert}</button>
			</div>
			<div class="se-modal-form se-modal-form-footer"${onlyPercentDisplay}${onlyWidthDisplay}>
				<label>
					<input type="checkbox" class="se-modal-btn-check _se_check_proportion" />&nbsp;
					<span>${lang.proportion}</span>
				</label>
			</div>`;
	}

	html += /*html*/ `
		</div>
		<div class="se-modal-footer">
			<div class="se-figure-align">
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="none" checked>${lang.basic}</label>
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="left">${lang.left}</label>
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="center">${lang.center}</label>
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="right">${lang.right}</label>
			</div>
			<button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}"><span>${lang.submitButton}</span></button>
		</div>
	</form>`;

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

export default Video;
