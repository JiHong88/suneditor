import EditorInjector from '../../editorInjector';
import { Modal, Figure, FileManager } from '../../modules';
import { domUtils, numbers, env } from '../../helper';
const { NO_EVENT } = env;

const YOUTUBE_EMBED = '//www.youtube.com/embed/';
const VIMEO_EMBED = 'https://player.vimeo.com/video/';

const Video = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.video;
	this.icon = 'video';

	// define plugin options
	this.pluginOptions = {
		canResize: pluginOptions.canResize === undefined ? true : pluginOptions.canResize,
		showHeightInput: pluginOptions.showHeightInput === undefined ? true : !!pluginOptions.showHeightInput,
		defaultWidth:
			!pluginOptions.defaultWidth || !numbers.get(pluginOptions.defaultWidth, 0)
				? ''
				: numbers.is(pluginOptions.defaultWidth)
				? pluginOptions.defaultWidth + 'px'
				: pluginOptions.defaultWidth,
		defaultHeight:
			!pluginOptions.defaultHeight || !numbers.get(pluginOptions.defaultHeight, 0)
				? ''
				: numbers.is(pluginOptions.defaultHeight)
				? pluginOptions.defaultHeight + 'px'
				: pluginOptions.defaultHeight,
		percentageOnlySize: !!pluginOptions.percentageOnlySize,
		createFileInput: !!pluginOptions.createFileInput,
		createUrlInput: pluginOptions.createUrlInput === undefined || !pluginOptions.createFileInput ? true : pluginOptions.createUrlInput,
		uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
		uploadHeaders: pluginOptions.uploadHeaders || null,
		uploadSizeLimit: /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null,
		allowMultiple: !!pluginOptions.allowMultiple,
		acceptedFormats:
			typeof pluginOptions.acceptedFormats !== 'string' || pluginOptions.acceptedFormats.trim() === '*' ? 'video/*' : pluginOptions.acceptedFormats.trim() || 'video/*',
		defaultRatio: numbers.get(pluginOptions.defaultRatio, 4) || 0.5625,
		showRatioOption: pluginOptions.showRatioOption === undefined ? true : !!pluginOptions.showRatioOption,
		ratioOptions: !pluginOptions.ratioOptions ? null : pluginOptions.ratioOptions,
		videoTagAttributes: pluginOptions.videoTagAttributes || null,
		iframeTagAttributes: pluginOptions.iframeTagAttributes || null
	};

	// create HTML
	const sizeUnit = this.pluginOptions.percentageOnlySize ? '%' : 'px';
	const modalEl = CreateHTML_modal(editor, this.pluginOptions);
	const showAlign = (pluginOptions.showAlignRadio === undefined ? true : !!pluginOptions.showAlignRadio) ? 'align' : '';
	const figureControls =
		pluginOptions.controls || !this.pluginOptions.canResize
			? [['mirror_h', 'mirror_v', showAlign, 'revert', 'edit', 'remove']]
			: [
					['resize_auto,75,50', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v'],
					['edit', showAlign, 'revert', 'remove']
			  ];

	// show align
	if (showAlign) modalEl.querySelector('.se-figure-align').style.display = 'none';

	// modules
	const defaultRatio = this.pluginOptions.defaultRatio * 100 + '%';
	this.modal = new Modal(this, modalEl);
	this.figure = new Figure(this, figureControls, { sizeUnit: sizeUnit, autoRatio: { current: defaultRatio, default: defaultRatio } });
	this.fileManager = new FileManager(this, {
		tagNames: ['iframe', 'video'],
		loadHandler: this.events.onVideoLoad,
		eventHandler: this.events.onVideoAction,
		checkHandler: FileCheckHandler.bind(this),
		figure: this.figure
	});

	// members
	this.videoInputFile = modalEl.querySelector('._se_video_file');
	this.videoUrlFile = modalEl.querySelector('.se-input-url');
	this.focusElement = this.videoUrlFile || this.videoInputFile;
	this.previewSrc = modalEl.querySelector('.se-link-preview');
	this._linkValue = '';
	this._align = 'none';
	this._youtubeQuery = (pluginOptions.youtubeQueryString || '').replace('?', '');
	this._videoRatio = defaultRatio;
	this._defaultRatio = defaultRatio;
	this._defaultSizeX = '100%';
	this._defaultSizeY = this.pluginOptions.defaultRatio * 100 + '%';
	this.sizeUnit = sizeUnit;
	this.proportion = {};
	this.videoRatioOption = {};
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

	// init
	if (this.videoInputFile) modalEl.querySelector('.se-file-remove').addEventListener('click', RemoveSelectedFiles.bind(this));
	if (this.videoUrlFile) this.videoUrlFile.addEventListener('input', OnLinkPreview.bind(this));
	if (this.videoInputFile && this.videoUrlFile) this.videoInputFile.addEventListener('change', OnfileInputChange.bind(this));

	if (this._resizing) {
		this.proportion = modalEl.querySelector('._se_video_check_proportion');
		this.videoRatioOption = modalEl.querySelector('.se-video-ratio');
		this.inputX = modalEl.querySelector('._se_video_size_x');
		this.inputY = modalEl.querySelector('._se_video_size_y');
		this.inputX.value = this.pluginOptions.defaultWidth;
		this.inputY.value = this.pluginOptions.defaultHeight;

		const ratioChange = OnChangeRatio.bind(this);
		this.inputX.addEventListener('keyup', OnInputSize.bind(this, 'x'));
		this.inputY.addEventListener('keyup', OnInputSize.bind(this, 'y'));
		this.inputX.addEventListener('change', ratioChange);
		this.inputY.addEventListener('change', ratioChange);
		this.proportion.addEventListener('change', ratioChange);
		this.videoRatioOption.addEventListener('change', SetVideoRatio.bind(this));
		modalEl.querySelector('.se-modal-btn-revert').addEventListener('click', OnClickRevert.bind(this));
	}
};

Video.key = 'video';
Video.type = 'modal';
Video.className = '';
Video.component = (node) => {
	return /^(VIDEO|IFRAME)$/i.test(node?.nodeName)
		? node
		: /^figure$/i.test(node?.nodeName) && /^(VIDEO|IFRAME)$/i.test(node?.firstElementChild?.nodeName)
		? node.firstElementChild
		: null;
};
Video.prototype = {
	/**
	 * @override type = "modal"
	 */
	open() {
		this.modal.open();
	},

	/**
	 * @override modal
	 * @param {boolean} isUpdate open state is update
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
			this._setVideoRatioSelect(this._origin_h || this._defaultRatio);
		}
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	async modalAction() {
		this._align = this.modal.form.querySelector('input[name="suneditor_video_radio"]:checked').value;

		let result = false;
		if (this.videoInputFile && this.videoInputFile.files.length > 0) {
			result = await this._submitFile(this.videoInputFile.files);
		} else if (this.videoUrlFile && this._linkValue.length > 0) {
			result = await this._submitURL(this._linkValue);
		}

		if (result) this._w.setTimeout(this.component.select.bind(this.component, this._element, 'video'));

		return result;
	},

	/**
	 * @override modal
	 */
	init() {
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
			this._setVideoRatioSelect(this._defaultRatio);
		}
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
	 * @param {Element} target Target element
	 */
	ready(target) {
		if (!target) return;
		const figureInfo = this.figure.open(target, this._nonResizing, false);

		this._element = target;
		this._cover = figureInfo.cover;
		this._container = figureInfo.container;
		this._align = figureInfo.align;
		target.style.float = '';

		this._origin_w = figureInfo.width || figureInfo.originWidth || figureInfo.w || '';
		this._origin_h = figureInfo.height || figureInfo.originHeight || figureInfo.h || '';

		let w = figureInfo.width || figureInfo.w || this._origin_w || '';
		let h = figureInfo.height || figureInfo.h || this._origin_h || '';

		if (this.videoUrlFile)
			this._linkValue = this.previewSrc.textContent = this.videoUrlFile.value = this._element.src || (this._element.querySelector('source') || '').src || '';
		(
			this.modal.form.querySelector('input[name="suneditor_video_radio"][value="' + this._align + '"]') ||
			this.modal.form.querySelector('input[name="suneditor_video_radio"][value="none"]')
		).checked = true;

		if (!this._resizing) return;

		const percentageRotation = this._onlyPercentage && this.figure.isVertical;
		if (this._onlyPercentage) {
			w = numbers.get(w, 2);
			if (w > 100) w = 100;
		}
		this.inputX.value = w === 'auto' ? '' : w;

		if (!this._onlyPercentage) {
			const h = percentageRotation ? '' : figureInfo.height;
			this.inputY.value = h === 'auto' ? '' : h;
		}

		if (!this._setVideoRatioSelect(h)) this.inputY.value = this._onlyPercentage ? numbers.get(h, 2) : h;

		this.proportion.checked = true;
		this.inputX.disabled = percentageRotation ? true : false;
		this.inputY.disabled = percentageRotation ? true : false;
		this.proportion.disabled = percentageRotation ? true : false;

		this._ratio = this.proportion.checked ? figureInfo.ratio : { w: 1, h: 1 };
	},

	/**
	 * @override fileManager
	 */
	destroy(element) {
		const targetEl = element || this._element;
		const container = domUtils.getParentElement(targetEl, Figure.__is) || targetEl;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		const emptyDiv = container.parentNode;

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

	applySize(w, h) {
		if (!w) w = this.inputX.value || this.pluginOptions.defaultWidth;
		if (!h) h = this.inputY.value || this.pluginOptions.defaultHeight;
		if (this._onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w)) w += '%';
		}
		this.figure.setSize(w, h);
	},

	create(oFrame, src, width, height, align, isUpdate, file) {
		let cover = null;
		let container = null;

		/** update */
		if (isUpdate) {
			oFrame = this._element;
			if (oFrame.src !== src) {
				const isYoutube = /youtu\.?be/.test(src);
				const isVimeo = /vimeo\.com/.test(src);
				if ((isYoutube || isVimeo) && !/^iframe$/i.test(oFrame.nodeName)) {
					const newTag = this._createVideoTag();
					newTag.src = src;
					oFrame.parentNode.replaceChild(newTag, oFrame);
					this._element = oFrame = newTag;
				} else if (!isYoutube && !isVimeo && !/^videoo$/i.test(oFrame.nodeName)) {
					const newTag = this._createVideoTag();
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
		this.figure.open(oFrame, this._nonResizing, true);

		width = width || this._defaultSizeX;
		height = height || this._videoRatio;
		const size = this.figure.getSize(oFrame);
		const inputUpdate = size.w !== width || size.h !== height;
		const changeSize = !isUpdate || inputUpdate;

		// set size
		if (changeSize) {
			this.applySize(width, height);
		}

		// align
		this.figure.setAlign(oFrame, align);

		// select figure
		// oFrame.onload = OnloadVideo.bind(this, oFrame);

		this.fileManager.setFileData(oFrame, file);

		if (!isUpdate) {
			this.component.insert(container, false, true);
			if (!this.options.get('mediaAutoSelect')) {
				const line = this.format.addLine(container, null);
				if (line) this.selection.setRange(line, 0, line, 0);
			}
			return;
		}

		if (this._resizing && changeSize && this.figure.isVertical) this.figure.setTransform(oFrame, width, height, 0);
		this.history.push(false);
	},

	_getInfo() {
		return {
			inputWidth: this.inputX.value,
			inputHeight: this.inputY.value,
			align: this._align,
			isUpdate: this.modal.isUpdate,
			element: this._element
		};
	},

	async _submitFile(fileList) {
		if (fileList.length === 0) return;

		let fileSize = 0;
		let files = [];
		for (let i = 0, len = fileList.length; i < len; i++) {
			if (/video/i.test(fileList[i].type)) {
				files.push(fileList[i]);
				fileSize += fileList[i].size;
			}
		}

		const limitSize = this.pluginOptions.uploadSizeLimit;
		const currentSize = this.fileManager.getSize();
		if (limitSize > 0 && fileSize + currentSize > limitSize) {
			const err = '[SUNEDITOR.video.submitFile.fail] Size of uploadable total videos: ' + limitSize / 1000 + 'KB';
			const message = await this.triggerEvent('onVideoUploadError', { error: err, limitSize, currentSize, uploadSize: fileSize });

			this.notice.open(message === NO_EVENT ? err : message || err);

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
			...videoInfo,
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

		/** iframe source */
		if (/^<iframe.*\/iframe>$/.test(url)) {
			const oIframe = new DOMParser().parseFromString(url, 'text/html').querySelector('iframe');
			url = oIframe.src;
			if (url.length === 0) return false;
		}

		/** youtube */
		if (/youtu\.?be/.test(url)) {
			if (!/^http/.test(url)) url = 'https://' + url;
			url = url.replace('watch?v=', '');
			if (!/^\/\/.+\/embed\//.test(url)) {
				url = url.replace(url.match(/\/\/.+\//)[0], YOUTUBE_EMBED).replace('&', '?&');
			}

			if (this._youtubeQuery.length > 0) {
				if (/\?/.test(url)) {
					const splitUrl = url.split('?');
					url = splitUrl[0] + '?' + this._youtubeQuery + '&' + splitUrl[1];
				} else {
					url += '?' + this._youtubeQuery;
				}
			}
		} else if (/vimeo\.com/.test(url)) {
			if (url.endsWith('/')) {
				url = url.slice(0, -1);
			}
			url = VIMEO_EMBED + url.slice(url.lastIndexOf('/') + 1);
		}

		const file = { name: url.split('/').pop(), size: 0 };
		const videoInfo = { url, files: file, ...this._getInfo() };

		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			const url = infos.url;
			this.create(
				this[!/embed|iframe|player|\/e\/|\.php|\.html?/.test(url) && !/vimeo\.com/.test(url) ? '_createVideoTag' : '_createVideoTag'](),
				url,
				infos.inputWidth,
				infos.inputHeight,
				infos.align,
				infos.isUpdate,
				infos.files
			);
		}.bind(this, videoInfo);

		const result = await this.triggerEvent('onVideoUploadBefore', {
			...videoInfo,
			handler
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (result !== null && typeof result === 'object') handler(result);

		if (result === true || result === NO_EVENT) handler(null);

		return true;
	},

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
		this.figure.open(oFrame, this._nonResizing, true);
		const size = (oFrame.getAttribute('data-se-size') || ',').split(',');
		this.applySize(size[0] || prevFrame.style.width || prevFrame.width || '', size[1] || prevFrame.style.height || prevFrame.height || '');

		// align
		const format = this.format.getLine(prevFrame);
		if (format) this._align = format.style.textAlign || format.style.float;
		this.figure.setAlign(oFrame, this._align);

		if (domUtils.getParentElement(prevFrame, domUtils.isExcludeFormat)) {
			prevFrame.parentNode.replaceChild(container, prevFrame);
		} else if (domUtils.isListCell(existElement)) {
			const refer = domUtils.getParentElement(prevFrame, function (current) {
				return current.parentNode === existElement;
			});
			existElement.insertBefore(container, refer);
			domUtils.removeItem(prevFrame);
			this.nodeTransform.removeEmptyNode(refer, null, true);
		} else if (this.format.isLine(existElement)) {
			const refer = domUtils.getParentElement(prevFrame, function (current) {
				return current.parentNode === existElement;
			});
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

	_register(info, response) {
		const fileList = response.result;
		const videoTag = this._createVideoTag();

		for (let i = 0, len = fileList.length; i < len; i++) {
			this.create(info.isUpdate ? info.element : videoTag.cloneNode(false), fileList[i].url, info.inputWidth, info.inputHeight, info.align, info.isUpdate, {
				name: fileList[i].name,
				size: fileList[i].size
			});
		}
	},

	_serverUpload(info, files) {
		if (!files) return;

		const videoUploadUrl = this.pluginOptions.uploadUrl;
		if (typeof videoUploadUrl === 'string' && videoUploadUrl.length > 0) {
			this.fileManager.upload(videoUploadUrl, this.pluginOptions.uploadHeaders, files, UploadCallBack.bind(this, info), this._error.bind(this));
		}
	},

	_setTagAttrs(element) {
		element.setAttribute('controls', true);

		const attrs = this.pluginOptions.videoTagAttributes;
		if (!attrs) return;

		for (let key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	},

	_setIframeAttrs(element) {
		element.frameBorder = '0';
		element.allowFullscreen = true;

		const attrs = this.pluginOptions.iframeTagAttributes;
		if (!attrs) return;

		for (let key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	},

	_createVideoTag() {
		const iframeTag = domUtils.createElement('IFRAME');
		this._setIframeAttrs(iframeTag);
		return iframeTag;
	},

	_setVideoRatioSelect(value) {
		let ratioSelected = false;
		const ratioOption = this.videoRatioOption.options;

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

	async _error(response) {
		const message = await this.triggerEvent('onVideoUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.video.error]', message);
	},

	constructor: Video
};

function FileCheckHandler(element) {
	this.ready(element);
	const line = this.format.getLine(element);
	if (line) this._align = line.style.textAlign || line.style.float;

	return this._update(element) || element;
}

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

function RemoveSelectedFiles() {
	this.videoInputFile.value = '';
	if (this.videoUrlFile) {
		this.videoUrlFile.removeAttribute('disabled');
		this.previewSrc.style.textDecoration = '';
	}
}

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

function OnfileInputChange() {
	if (!this.videoInputFile.value) {
		this.videoUrlFile.removeAttribute('disabled');
		this.previewSrc.style.textDecoration = '';
	} else {
		this.videoUrlFile.setAttribute('disabled', true);
		this.previewSrc.style.textDecoration = 'line-through';
	}
}

function OnClickRevert() {
	if (this._onlyPercentage) {
		this.inputX.value = this._origin_w > 100 ? 100 : this._origin_w;
	} else {
		this.inputX.value = this._origin_w;
		this.inputY.value = this._origin_h;
	}
}

function SetVideoRatio(e) {
	const value = e.target.options[e.target.selectedIndex].value;
	this._defaultSizeY = this.figure.autoRatio.current = this._videoRatio = !value ? this._defaultSizeY : value * 100 + '%';
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
		this._setVideoRatioSelect(e.target.value || this._defaultRatio);
	}
}

function CreateHTML_modal({ lang, icons }, pluginOptions) {
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
				<div class="se-modal-form-files">
					<input class="se-input-form _se_video_file" type="file" data-focus accept="${pluginOptions.acceptedFormats}"${pluginOptions.allowMultiple ? ' multiple="multiple"' : ''}/>
					<button type="button" data-command="filesRemove" class="se-btn se-modal-files-edge-button se-file-remove" title="${lang.remove}" aria-label="${lang.remove}">
						${icons.cancel}
					</button>
				</div>
			</div>`;
	}

	if (pluginOptions.createUrlInput) {
		html += /*html*/ `
			<div class="se-modal-form">
				<label>${lang.video_modal_url}</label>
				<input class="se-input-form se-input-url" type="text" data-focus />
				<pre class="se-link-preview"></pre>
			</div>`;
	}

	if (pluginOptions.canResize) {
		const ratioList = pluginOptions.ratioOptions || [
			{ name: '16:9', value: 0.5625 },
			{ name: '4:3', value: 0.75 },
			{ name: '21:9', value: 0.4285 }
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
				<input class="se-input-control _se_video_size_x" placeholder="100%"${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}/>
				<label class="se-modal-size-x"${onlyWidthDisplay}>${onlyPercentage ? '%' : 'x'}</label>
				<input class="se-input-control _se_video_size_y" placeholder="${pluginOptions.defaultRatio * 100}%"
				${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}${heightDisplay}/>
				<select class="se-input-select se-video-ratio" title="${lang.ratio}" aria-label="${lang.ratio}"${ratioDisplay}>
					${!heightDisplay ? '<option value=""> - </option>' : ''} 
					${ratioList
						.map(
							(ratioOption) =>
								`<option value="${ratioOption.value}"${ratio.toString() === ratioOption.value.toString() ? ' selected' : ''}>${ratioOption.name}</option>`
						)
						.join('')}
				</select>
				<button type="button" title="${lang.revert}" aria-label="${lang.revert}" class="se-btn se-modal-btn-revert">${icons.revert}</button>
			</div>
			<div class="se-modal-form se-modal-form-footer"${onlyPercentDisplay}${onlyWidthDisplay}>
				<label>
					<input type="checkbox" class="se-modal-btn-check _se_video_check_proportion" />&nbsp;
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
