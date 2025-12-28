import { PluginModal } from '../../interfaces';
import { Modal, Figure } from '../../modules/contract';
import { FileManager } from '../../modules/manager';
import { dom, numbers, env, converter, keyCodeMap } from '../../helper';
const { _w, NO_EVENT } = env;

/**
 * @typedef {Object} VideoPluginOptions
 * @property {boolean} [canResize=true] - Whether the video element can be resized.
 * @property {boolean} [showHeightInput=true] - Whether to display the height input field.
 * @property {string} [defaultWidth] - The default width of the video element. If a number is provided, "px" will be appended.
 * @property {string} [defaultHeight] - The default height of the video element. If a number is provided, "px" will be appended.
 * @property {boolean} [percentageOnlySize=false] - Whether to allow only percentage-based sizing.
 * @property {boolean} [createFileInput=false] - Whether to create a file input element for video uploads.
 * @property {boolean} [createUrlInput=true] - Whether to create a URL input element for video embedding.
 * @property {string} [uploadUrl] - The URL endpoint for video file uploads.
 * @property {Object<string, string>} [uploadHeaders] - Additional headers to include in the video upload request.
 * @property {number} [uploadSizeLimit] - The total upload size limit for videos in bytes.
 * @property {number} [uploadSingleSizeLimit] - The single file upload size limit for videos in bytes.
 * @property {boolean} [allowMultiple=false] - Whether multiple video uploads are allowed.
 * @property {string} [acceptedFormats="video/*"] - Accepted file formats for video uploads.
 * @property {number} [defaultRatio=0.5625] - The default aspect ratio for the video (e.g., 16:9 is 0.5625).
 * @property {boolean} [showRatioOption=true] - Whether to display the ratio option in the modal.
 * @property {Array} [ratioOptions] - Custom ratio options for video resizing.
 * @property {Object<string, string>} [videoTagAttributes] - Additional attributes to set on the video tag.
 * @property {Object<string, string>} [iframeTagAttributes] - Additional attributes to set on the iframe tag.
 * @property {string} [query_youtube=""] - Additional query parameters for YouTube embedding.
 * @property {string} [query_vimeo=""] - Additional query parameters for Vimeo embedding.
 * @property {Object<string, {pattern: RegExp, action: (url: string) => string, tag: string}>} [embedQuery] - Custom query objects for additional embedding services.
 * @property {Array<RegExp>} [urlPatterns] - Additional URL patterns for video embedding.
 * @property {Array<string>} [extensions] - Additional file extensions to be recognized for video uploads.
 * @property {SunEditor.Module.Figure.Controls} [controls] - Figure controls.
 * @property {SunEditor.ComponentInsertType} [insertBehavior] - Component insertion behavior for selection and cursor placement. [default: options.get('componentInsertBehavior')]
 * - `auto`: Move cursor to the next line if possible, otherwise select the component.
 * - `select`: Always select the inserted component.
 * - `line`: Move cursor to the next line if possible, or create a new line and move there.
 * - `none`: Do nothing.
 */

/**
 * @class
 * @description Video plugin.
 * - This plugin provides video embedding functionality within the editor.
 * - It also supports embedding from popular video services
 */
class Video extends PluginModal {
	static key = 'video';
	static className = '';
	/**
	 * @this {Video}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		if (/^(VIDEO)$/i.test(node?.nodeName)) {
			return node;
		} else if (/^(IFRAME)$/i.test(node?.nodeName)) {
			return this.checkContentType(/** @type {HTMLIFrameElement} */ (node).src) ? node : null;
		}
		return null;
	}

	#frameRatio;
	#defaultRatio;
	#defaultSizeX;
	#defaultSizeY;
	#origin_w;
	#origin_h;
	#resizing;
	#onlyPercentage;
	#nonResizing;

	#linkValue = '';
	#align = 'none';
	#element = null;
	#container = null;
	#ratio = { w: 0, h: 0 };
	#initRatioValue = null;

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {VideoPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
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
			uploadSizeLimit: numbers.get(pluginOptions.uploadSizeLimit, 0),
			uploadSingleSizeLimit: numbers.get(pluginOptions.uploadSingleSizeLimit, 0),
			allowMultiple: !!pluginOptions.allowMultiple,
			acceptedFormats: typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'video/*' : pluginOptions.acceptedFormats.trim() || 'video/*',
			defaultRatio: numbers.get(pluginOptions.defaultRatio, 4) || 0.5625,
			showRatioOption: pluginOptions.showRatioOption === undefined ? true : !!pluginOptions.showRatioOption,
			ratioOptions: !pluginOptions.ratioOptions ? null : pluginOptions.ratioOptions,
			videoTagAttributes: pluginOptions.videoTagAttributes || null,
			iframeTagAttributes: pluginOptions.iframeTagAttributes || null,
			query_youtube: pluginOptions.query_youtube || '',
			query_vimeo: pluginOptions.query_vimeo || '',
			insertBehavior: pluginOptions.insertBehavior,
		};

		// create HTML
		const sizeUnit = this.pluginOptions.percentageOnlySize ? '%' : 'px';
		const modalEl = CreateHTML_modal(editor, this.pluginOptions);
		const figureControls = pluginOptions.controls || (!this.pluginOptions.canResize ? [['align', 'edit', 'copy', 'remove']] : [['resize_auto,75,50', 'align', 'edit', 'revert', 'copy', 'remove']]);

		// show align
		if (!figureControls.some((subArray) => subArray.includes('align'))) modalEl.alignForm.style.display = 'none';

		// modules
		const defaultRatio = this.pluginOptions.defaultRatio * 100 + '%';
		this.modal = new Modal(this, modalEl.html);
		this.figure = new Figure(this, figureControls, { sizeUnit: sizeUnit, autoRatio: { current: defaultRatio, default: defaultRatio } });
		this.fileManager = new FileManager(this, {
			query: 'iframe, video',
			loadEventName: 'onVideoLoad',
			actionEventName: 'onVideoAction',
		});

		// members
		this.fileModalWrapper = modalEl.fileModalWrapper;
		this.videoInputFile = modalEl.videoInputFile;
		this.videoUrlFile = modalEl.videoUrlFile;
		this.focusElement = this.videoUrlFile || this.videoInputFile;
		this.previewSrc = modalEl.previewSrc;
		this.sizeUnit = sizeUnit;
		this.proportion = null;
		this.frameRatioOption = null;
		this.inputX = null;
		this.inputY = null;

		this.#frameRatio = defaultRatio;
		this.#defaultRatio = defaultRatio;
		this.#defaultSizeX = '100%';
		this.#defaultSizeY = this.pluginOptions.defaultRatio * 100 + '%';

		this.#origin_w = this.pluginOptions.defaultWidth === '100%' ? '' : this.pluginOptions.defaultWidth;
		this.#origin_h = this.pluginOptions.defaultHeight === defaultRatio ? '' : this.pluginOptions.defaultHeight;
		this.#resizing = this.pluginOptions.canResize;
		this.#onlyPercentage = this.pluginOptions.percentageOnlySize;
		this.#nonResizing = !this.#resizing || !this.pluginOptions.showHeightInput || this.#onlyPercentage;

		this.query = {
			youtube: {
				pattern: /youtu\.?be/i,
				action: (url) => {
					url = this.convertUrlYoutube(url);
					return converter.addUrlQuery(url, this.pluginOptions.query_youtube);
				},
				tag: 'iframe',
			},
			vimeo: {
				pattern: /vimeo\.com/i,
				action: (url) => {
					url = this.convertUrlVimeo(url);
					return converter.addUrlQuery(url, this.pluginOptions.query_vimeo);
				},
				tag: 'iframe',
			},
			...pluginOptions.embedQuery,
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
				/loom\.com\/share\//,
			])
			.concat(pluginOptions.urlPatterns || []);

		const galleryButton = modalEl.galleryButton;
		if (galleryButton) this.eventManager.addEvent(galleryButton, 'click', this.#OpenGallery.bind(this));

		// init
		if (this.videoInputFile) this.eventManager.addEvent(modalEl.fileRemoveBtn, 'click', this.#RemoveSelectedFiles.bind(this));
		if (this.videoUrlFile) this.eventManager.addEvent(this.videoUrlFile, 'input', this.#OnLinkPreview.bind(this));
		if (this.videoInputFile && this.videoUrlFile) this.eventManager.addEvent(this.videoInputFile, 'change', this.#OnfileInputChange.bind(this));

		if (this.#resizing) {
			this.proportion = modalEl.proportion;
			this.frameRatioOption = modalEl.frameRatioOption;
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
			this.eventManager.addEvent(this.frameRatioOption, 'change', this.#SetRatio.bind(this));
			this.eventManager.addEvent(modalEl.revertBtn, 'click', this.#OnClickRevert.bind(this));
		}
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.modal.open();
	}

	/**
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.RetainFormat}
	 */
	retainFormat() {
		return {
			query: 'iframe, video',
			/** @param {HTMLIFrameElement|HTMLVideoElement} element */
			method: async (element) => {
				if (/^(iframe)$/i.test(element?.nodeName)) {
					if (!this.checkContentType(element.src)) return;
				}

				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && figureInfo.cover) return;

				this.#ready(element, true);
				const line = this.format.getLine(element);
				if (line) this.#align = line.style.textAlign || line.style.float;

				this.#fixTagStructure(element);
			},
		};
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnFilePasteAndDrop}
	 */
	onFilePasteAndDrop({ file }) {
		if (!/^video/.test(file.type)) return;

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
				this.inputX.value = this.#origin_w = this.pluginOptions.defaultWidth === this.#defaultSizeX ? '' : this.pluginOptions.defaultWidth;
				this.inputY.value = this.#origin_h = this.pluginOptions.defaultHeight === this.#defaultSizeY ? '' : this.pluginOptions.defaultHeight;
				this.proportion.disabled = true;
			}
			if (this.videoInputFile && this.pluginOptions.allowMultiple) this.videoInputFile.setAttribute('multiple', 'multiple');
		} else {
			if (this.videoInputFile && this.pluginOptions.allowMultiple) this.videoInputFile.removeAttribute('multiple');
		}

		if (this.#resizing) {
			this.#setRatioSelect(this.figure.isVertical ? '' : this.#origin_h || this.#defaultRatio);
			this.#initRatioValue = this.frameRatioOption?.value;
		}
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		this.#align = /** @type {HTMLInputElement} */ (this.modal.form.querySelector('input[name="suneditor_video_radio"]:checked')).value;

		let result = false;
		if (this.videoInputFile && this.videoInputFile.files.length > 0) {
			result = await this.submitFile(this.videoInputFile.files);
		} else if (this.videoUrlFile && this.#linkValue.length > 0) {
			result = await this.submitURL(this.#linkValue);
		}

		if (result) _w.setTimeout(this.component.select.bind(this.component, this.#element, Video.key), 0);

		return result;
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Init}
	 */
	modalInit() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		if (this.videoInputFile) this.videoInputFile.value = '';
		if (this.videoUrlFile) this.#linkValue = this.previewSrc.textContent = this.videoUrlFile.value = '';
		if (this.videoInputFile && this.videoUrlFile) {
			this.videoUrlFile.disabled = false;
			this.previewSrc.style.textDecoration = '';
		}

		/** @type {HTMLInputElement} */ (this.modal.form.querySelector('input[name="suneditor_video_radio"][value="none"]')).checked = true;
		this.#ratio = { w: 0, h: 0 };
		this.#nonResizing = false;

		if (this.#resizing) {
			this.inputX.value = this.pluginOptions.defaultWidth === this.#defaultSizeX ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this.pluginOptions.defaultHeight === this.#defaultSizeY ? '' : this.pluginOptions.defaultHeight;
			this.proportion.checked = false;
			this.proportion.disabled = true;
			this.#setRatioSelect(this.#defaultRatio);
		}
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 * @param {HTMLIFrameElement|HTMLVideoElement} target
	 */
	componentSelect(target) {
		this.#ready(target);
	}

	/**
	 * @hook Component
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

		const message = await this.triggerEvent('onVideoDeleteBefore', { element: targetEl, container, align: this.#align, url: this.#linkValue });
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
	}

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
					tag: service.tag,
				};
			}
		}

		return null;
	}

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
	}

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
	}

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
	}

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
	 * @param {boolean} isLast - Indicates whether this is the last file in the batch (used for scroll and insert actions).
	 */
	create(oFrame, src, width, height, align, isUpdate, file, isLast) {
		let container = null;

		/** update */
		if (isUpdate) {
			oFrame = this.#element;
			if (oFrame.src !== src) {
				const processUrl = this.findProcessUrl(src);
				if (/^iframe$/i.test(processUrl?.tag) && !/^iframe$/i.test(oFrame.nodeName)) {
					const newTag = this.createIframeTag();
					newTag.src = src;
					oFrame.replaceWith(newTag);
					this.#element = oFrame = newTag;
				} else if (/^video$/i.test(processUrl?.tag) && !/^video$/i.test(oFrame.nodeName)) {
					const newTag = this.createVideoTag();
					newTag.src = src;
					oFrame.replaceWith(newTag);
					this.#element = oFrame = newTag;
				} else {
					oFrame.src = src;
				}
			}
			container = this.#container;
		} else {
			/** create */
			oFrame.src = src;
			this.#element = oFrame;
			const figure = Figure.CreateContainer(oFrame, 'se-video-container');
			container = figure.container;
		}

		/** rendering */
		this.#element = oFrame;
		this.#container = container;
		this.figure.open(oFrame, { nonResizing: this.#nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly: true });

		width ||= this.#defaultSizeX;
		height ||= this.#frameRatio;

		const size = this.figure.getSize(oFrame);
		const inputUpdate = size.w !== width || size.h !== height;
		const changeSize = !isUpdate || inputUpdate;

		// set size
		if (changeSize) {
			if (this.#initRatioValue !== this.frameRatioOption?.value) this.figure.deleteTransform();
			this.#applySize(width, height);
		}

		// align
		this.figure.setAlign(oFrame, align);

		// select figure
		// oFrame.onload = OnloadVideo.bind(this, oFrame);
		this.fileManager.setFileData(oFrame, file);

		if (!isUpdate) {
			this.component.insert(container, { scrollTo: isLast ? true : false, insertBehavior: isLast ? this.pluginOptions.insertBehavior : 'line' });
			return;
		}

		if (!this.#resizing || !changeSize || !this.figure.isVertical) this.figure.setTransform(oFrame, width, height, 0);
		this.history.push(false);
	}

	/**
	 * @description Creates a new iframe element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes for embedding.
	 * @param {Object<string, string>} [props] - An optional object containing properties to assign to the iframe.
	 * @returns {HTMLIFrameElement} The newly created iframe element.
	 */
	createIframeTag(props) {
		/** @type {HTMLIFrameElement} */
		const iframeTag = dom.utils.createElement('IFRAME');
		if (props) {
			for (const key in props) {
				iframeTag[key] = props[key];
			}
		}
		this.#setIframeAttrs(iframeTag);
		return iframeTag;
	}

	/**
	 * @description Creates a new video element for video embedding.
	 * - Applies any additional properties provided and sets the necessary attributes.
	 * @param {Object<string, string>} [props] - An optional object containing properties to assign to the video element.
	 * @returns {HTMLVideoElement} The newly created video element.
	 */
	createVideoTag(props) {
		/** @type {HTMLVideoElement} */
		const videoTag = dom.utils.createElement('VIDEO');
		if (props) {
			for (const key in props) {
				videoTag[key] = props[key];
			}
		}
		this.#setTagAttrs(videoTag);
		return videoTag;
	}

	/**
	 * @description Create an "video" component using the provided files.
	 * @param {FileList|File[]} fileList File object list
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitFile(fileList) {
		if (fileList.length === 0) return;

		let fileSize = 0;
		const files = [];
		const slngleSizeLimit = this.pluginOptions.uploadSingleSizeLimit;
		for (let i = 0, len = fileList.length, f, s; i < len; i++) {
			f = fileList[i];
			if (!/video/i.test(f.type)) continue;

			s = f.size;
			if (slngleSizeLimit > 0 && s > slngleSizeLimit) {
				const err = '[SUNEDITOR.videoUpload.fail] Size of uploadable single file: ' + slngleSizeLimit / 1000 + 'KB';
				const message = await this.triggerEvent('onVideoUploadError', {
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
			const err = '[SUNEDITOR.videoUpload.fail] Size of uploadable total videos: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onVideoUploadError', { error: err, limitSize, currentSize, uploadSize: fileSize });

			this.ui.alertOpen(message === NO_EVENT ? err : message || err, 'error');

			return false;
		}

		const videoInfo = {
			url: null,
			files,
			...this.#getInfo(),
		};

		const handler = function (uploadCallback, infos, newInfos) {
			infos = newInfos || infos;
			uploadCallback(infos, infos.files);
		}.bind(this, this.#serverUpload.bind(this), videoInfo);

		const result = await this.triggerEvent('onVideoUploadBefore', {
			info: videoInfo,
			handler,
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);
	}

	/**
	 * @description Create an "video" component using the provided url.
	 * @param {string} url File url
	 * @returns {Promise<boolean>} If return false, the file upload will be canceled
	 */
	async submitURL(url) {
		if (!(url = this.#linkValue)) return false;

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
		const videoInfo = { url, files: file, ...this.#getInfo(), process: processUrl };

		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			this.create(this[/^iframe$/i.test(infos.process?.tag) ? 'createIframeTag' : 'createVideoTag'](), infos.url, infos.inputWidth, infos.inputHeight, infos.align, infos.isUpdate, infos.files, true);
		}.bind(this, videoInfo);

		const result = await this.triggerEvent('onVideoUploadBefore', {
			info: videoInfo,
			handler,
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	}

	/**
	 * @description Prepares the component for selection.
	 * - Ensures that the controller is properly positioned and initialized.
	 * - Prevents duplicate event handling if the component is already selected.
	 * @param {HTMLIFrameElement|HTMLVideoElement} target - The selected element.
	 * @param {boolean} [infoOnly=false] - If true, only retrieves information without opening the controller.
	 */
	#ready(target, infoOnly = false) {
		if (!target) return;
		const figureInfo = this.figure.open(target, { nonResizing: this.#nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly });

		this.#element = target;
		this.#container = figureInfo.container;
		this.#align = figureInfo.align;
		target.style.float = '';

		this.#origin_w = String(figureInfo.width || figureInfo.originWidth || figureInfo.w || '');
		this.#origin_h = String(figureInfo.height || figureInfo.originHeight || figureInfo.h || '');

		const h = figureInfo.height || figureInfo.h || this.#origin_h || '';

		if (this.videoUrlFile) this.#linkValue = this.previewSrc.textContent = this.videoUrlFile.value = this.#element.src || this.#element.querySelector('source')?.src || '';

		/** @type {HTMLInputElement} */
		const activeAlgin = this.modal.form.querySelector('input[name="suneditor_video_radio"][value="' + this.#align + '"]') || this.modal.form.querySelector('input[name="suneditor_video_radio"][value="none"]');
		activeAlgin.checked = true;

		if (!this.#resizing) return;

		const percentageRotation = this.#onlyPercentage && this.figure.isVertical;
		const { dw, dh } = this.figure.getSize(target);
		this.inputX.value = dw === 'auto' ? '' : dw;
		this.inputY.value = dh === 'auto' ? '' : dh;

		if (!this.#setRatioSelect(h)) this.inputY.value = String(this.#onlyPercentage ? numbers.get(h, 2) : h);

		this.proportion.checked = true;
		this.inputX.disabled = percentageRotation ? true : false;
		this.inputY.disabled = percentageRotation ? true : false;
		this.proportion.disabled = percentageRotation ? true : false;

		if (figureInfo.isVertical) {
			this.proportion.checked = false;
		}

		this.#ratio = this.proportion.checked ? figureInfo.ratio : { w: 0, h: 0 };
	}

	/**
	 * @description Sets the size of the video element.
	 * @param {string|number} w - The width of the video.
	 * @param {string|number} h - The height of the video.
	 */
	#applySize(w, h) {
		w ||= this.inputX?.value || this.pluginOptions.defaultWidth;
		h ||= this.inputY?.value || this.pluginOptions.defaultHeight;

		if (this.#onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w + '')) w += '%';
		}
		this.figure.setSize(w, h);
	}

	/**
	 * @description Retrieves video information including size and alignment.
	 * @returns {*} Video information object.
	 */
	#getInfo() {
		return {
			inputWidth: this.inputX?.value || '',
			inputHeight: this.inputY?.value || '',
			align: this.#align,
			isUpdate: this.modal.isUpdate,
			element: this.#element,
		};
	}

	/**
	 * @description Updates the video component within the editor.
	 * @param {HTMLIFrameElement|HTMLVideoElement} oFrame - The video element to update.
	 */
	#fixTagStructure(oFrame) {
		if (!oFrame) return;

		const isVideoTag = /^video$/i.test(oFrame.nodeName);
		if (isVideoTag) {
			this.#setTagAttrs(/** @type {HTMLVideoElement} */ (oFrame));
		} else if (/^iframe$/i.test(oFrame.nodeName)) {
			this.#setIframeAttrs(/** @type {HTMLIFrameElement} */ (oFrame));
		}

		const prevFrame = oFrame;
		const cloneFrame = /** @type {HTMLIFrameElement|HTMLVideoElement} */ (oFrame.cloneNode(true));
		const figure = Figure.CreateContainer(cloneFrame, 'se-video-container');
		const container = figure.container;

		const figcaption = Figure.GetContainer(prevFrame)?.container?.querySelector('figcaption');
		let caption = null;
		if (figcaption) {
			caption = dom.utils.createElement('figcaption');
			caption.innerHTML = figcaption.innerHTML;
			dom.utils.removeItem(figcaption);
			figure.cover.appendChild(caption);
		}

		// size
		this.figure.open(cloneFrame, { nonResizing: this.#nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, infoOnly: true });
		const size = (cloneFrame.getAttribute('data-se-size') || ',').split(',');

		const width = size[0] || prevFrame.width || '';
		const height = size[1] || prevFrame.height || this.#defaultRatio || '';
		this.#applySize(width, height);

		// align
		const format = this.format.getLine(prevFrame);
		if (format) this.#align = format.style.textAlign || format.style.float;
		this.figure.setAlign(cloneFrame, this.#align);

		this.figure.retainFigureFormat(container, this.#element, null, this.fileManager);

		return cloneFrame;
	}

	/**
	 * @description Registers the uploaded video in the editor.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information object.
	 * @param {Object<string, *>} response - Server response containing video data.
	 */
	#register(info, response) {
		const fileList = response.result;
		const videoTag = this.createVideoTag();

		for (let i = 0, len = fileList.length; i < len; i++) {
			const ctag = info.isUpdate ? info.element : /** @type {HTMLIFrameElement|HTMLVideoElement} */ (videoTag.cloneNode(false));
			this.create(
				ctag,
				fileList[i].url,
				info.inputWidth,
				info.inputHeight,
				info.align,
				info.isUpdate,
				{
					name: fileList[i].name,
					size: fileList[i].size,
				},
				i === len - 1,
			);
		}
	}

	/**
	 * @description Uploads a video to the server using an external upload handler.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information object.
	 * @param {FileList} files - The video files to upload.
	 */
	#serverUpload(info, files) {
		if (!files) return;

		const videoUploadUrl = this.pluginOptions.uploadUrl;
		if (typeof videoUploadUrl === 'string' && videoUploadUrl.length > 0) {
			this.fileManager.upload(videoUploadUrl, this.pluginOptions.uploadHeaders, files, this.#UploadCallBack.bind(this, info), this.#error.bind(this));
		}
	}

	/**
	 * @description Sets attributes for the video tag.
	 * @param {HTMLVideoElement} element - The video element.
	 */
	#setTagAttrs(element) {
		element.setAttribute('controls', 'true');

		const attrs = this.pluginOptions.videoTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	}

	/**
	 * @description Sets attributes for the iframe tag.
	 * @param {HTMLIFrameElement} element - The iframe element.
	 */
	#setIframeAttrs(element) {
		element.frameBorder = '0';
		element.allowFullscreen = true;

		const attrs = this.pluginOptions.iframeTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	}

	/**
	 * @description Selects a ratio option in the ratio dropdown.
	 * @param {string|number} value - The selected ratio value.
	 * @returns {boolean} Returns true if a ratio was selected.
	 */
	#setRatioSelect(value) {
		if (!this.frameRatioOption) return;

		let ratioSelected = false;
		const ratioOption = this.frameRatioOption.options;

		if (/%$/.test(value + '') || this.#onlyPercentage) value = numbers.get(value, 2) / 100 + '';
		else if (!numbers.is(value) || Number(value) >= 1) value = '';

		this.inputY.placeholder = '';
		for (let i = 0, len = ratioOption.length; i < len; i++) {
			if (ratioOption[i].value === value) {
				ratioSelected = ratioOption[i].selected = true;
				this.inputY.placeholder = !value ? '' : Number(value) * 100 + '%';
			} else {
				ratioOption[i].selected = false;
			}
		}

		return ratioSelected;
	}

	/**
	 * @description Handles video upload errors.
	 * @param {Object<string, *>} response - The error response object.
	 * @returns {Promise<void>}
	 */
	async #error(response) {
		const message = await this.triggerEvent('onVideoUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.ui.alertOpen(err, 'error');
		console.error('[SUNEDITOR.plugin.video.error]', message);
	}

	/**
	 * @description Handles the callback function for video upload completion.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information.
	 * @param {XMLHttpRequest} xmlHttp - The XMLHttpRequest object.
	 */
	async #UploadCallBack(info, xmlHttp) {
		if ((await this.triggerEvent('videoUploadHandler', { xmlHttp, info })) === NO_EVENT) {
			const response = JSON.parse(xmlHttp.responseText);
			if (response.errorMessage) {
				this.#error(response);
			} else {
				this.#register(info, response);
			}
		}
	}

	/**
	 * @description Removes selected files from the file input.
	 */
	#RemoveSelectedFiles() {
		this.videoInputFile.value = '';
		if (this.videoUrlFile) {
			this.videoUrlFile.disabled = false;
			this.previewSrc.style.textDecoration = '';
		}

		// inputFile check
		Modal.OnChangeFile(this.fileModalWrapper, []);
	}

	/**
	 * @description Handles link preview input changes.
	 * @param {InputEvent} e - Event object
	 */
	#OnLinkPreview(e) {
		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		const value = eventTarget.value.trim();
		if (/^<iframe.*\/iframe>$/.test(value)) {
			this.#linkValue = value;
			this.previewSrc.textContent = '<IFrame :src=".."></IFrame>';
		} else {
			this.#linkValue = this.previewSrc.textContent = !value
				? ''
				: this.options.get('defaultUrlProtocol') && !value.includes('://') && value.indexOf('#') !== 0
					? this.options.get('defaultUrlProtocol') + value
					: !value.includes('://')
						? '/' + value
						: value;
		}
	}

	/**
	 * @description Opens the video gallery.
	 */
	#OpenGallery() {
		this.plugins.videoGallery.open(this.#SetUrlInput.bind(this));
	}

	/**
	 * @description Sets the URL input value when selecting from the gallery.
	 * @param {HTMLInputElement} target - The selected video element.
	 */
	#SetUrlInput(target) {
		this.#linkValue = this.previewSrc.textContent = this.videoUrlFile.value = target.getAttribute('data-command') || target.src;
		this.videoUrlFile.focus();
	}

	/**
	 * @param {InputEvent} e - Event object
	 */
	#OnfileInputChange(e) {
		if (!this.videoInputFile.value) {
			this.videoUrlFile.disabled = false;
			this.previewSrc.style.textDecoration = '';
		} else {
			this.videoUrlFile.disabled = true;
			this.previewSrc.style.textDecoration = 'line-through';
		}

		// inputFile check
		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		Modal.OnChangeFile(this.fileModalWrapper, eventTarget.files);
	}

	#OnClickRevert() {
		if (this.#onlyPercentage) {
			this.inputX.value = Number(this.#origin_w) > 100 ? '100' : this.#origin_w;
		} else {
			this.inputX.value = this.#origin_w;
			this.inputY.value = this.#origin_h;
		}
	}

	/**
	 * @param {InputEvent} e - Event object
	 */
	#SetRatio(e) {
		/** @type {HTMLSelectElement} */
		const eventTarget = dom.query.getEventTarget(e);
		const value = eventTarget.options[eventTarget.selectedIndex].value;
		this.#defaultSizeY = this.figure.autoRatio.current = this.#frameRatio = !value ? this.#defaultSizeY : Number(value) * 100 + '%';
		this.inputY.placeholder = !value ? '' : Number(value) * 100 + '%';
		this.inputY.value = '';
	}

	#OnChangeRatio() {
		this.#ratio = this.proportion.checked ? Figure.GetRatio(this.inputX.value, this.inputY.value, this.sizeUnit) : { w: 0, h: 0 };
	}

	/**
	 * @param {"x"|"y"} xy - x or y
	 * @param {KeyboardEvent} e - Event object
	 */
	#OnInputSize(xy, e) {
		if (keyCodeMap.isSpace(e.code)) {
			e.preventDefault();
			return;
		}

		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		if (xy === 'x' && this.#onlyPercentage && Number(eventTarget.value) > 100) {
			eventTarget.value = '100';
		} else if (this.proportion.checked && !this.frameRatioOption?.value) {
			const ratioSize = Figure.CalcRatio(this.inputX.value, this.inputY.value, this.sizeUnit, this.#ratio);
			if (xy === 'x') {
				this.inputY.value = String(ratioSize.h);
			} else {
				this.inputX.value = String(ratioSize.w);
			}
		}

		if (xy === 'y') {
			this.#setRatioSelect(eventTarget.value || this.#defaultRatio);
		}
	}
}

/**
 * @typedef {object} ModalReturns_video
 * @property {HTMLElement} html
 * @property {HTMLElement} alignForm
 * @property {HTMLElement} fileModalWrapper
 * @property {HTMLInputElement} videoInputFile
 * @property {HTMLInputElement} videoUrlFile
 * @property {HTMLElement} previewSrc
 * @property {HTMLButtonElement} galleryButton
 * @property {HTMLInputElement} proportion
 * @property {HTMLSelectElement} frameRatioOption
 * @property {HTMLInputElement} inputX
 * @property {HTMLInputElement} inputY
 * @property {HTMLButtonElement} revertBtn
 * @property {HTMLButtonElement} fileRemoveBtn
 *
 * @param {SunEditor.Core} editor
 * @param {*} pluginOptions
 * @returns {ModalReturns_video}
 */
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
								${dom.utils.createTooltipInner(lang.videoGallery)}
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
			{ name: '9:16', value: 1.78 },
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

	const content = dom.utils.createElement('DIV', { class: 'se-modal-content' }, html);

	return {
		html: content,
		alignForm: content.querySelector('.se-figure-align'),
		fileModalWrapper: content.querySelector('.se-flex-input-wrapper'),
		videoInputFile: content.querySelector('.__se__file_input'),
		videoUrlFile: content.querySelector('.se-input-url'),
		previewSrc: content.querySelector('.se-link-preview'),
		galleryButton: content.querySelector('.__se__gallery'),
		proportion: content.querySelector('._se_check_proportion'),
		frameRatioOption: content.querySelector('.se-modal-ratio'),
		inputX: content.querySelector('._se_size_x'),
		inputY: content.querySelector('._se_size_y'),
		revertBtn: content.querySelector('.se-modal-btn-revert'),
		fileRemoveBtn: content.querySelector('.se-file-remove'),
	};
}

export default Video;
