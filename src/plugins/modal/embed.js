import EditorInjector from '../../editorInjector';
import { Modal, Figure } from '../../modules';
import { domUtils, numbers, env } from '../../helper';
const { NO_EVENT, _w } = env;

const Embed = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.embed;
	this.icon = 'embed';

	// define plugin options
	this.pluginOptions = {
		canResize: pluginOptions.canResize === undefined ? true : pluginOptions.canResize,
		showHeightInput: pluginOptions.showHeightInput === undefined ? true : !!pluginOptions.showHeightInput,
		defaultWidth: !pluginOptions.defaultWidth || !numbers.get(pluginOptions.defaultWidth, 0) ? '' : numbers.is(pluginOptions.defaultWidth) ? pluginOptions.defaultWidth + 'px' : pluginOptions.defaultWidth,
		defaultHeight: !pluginOptions.defaultHeight || !numbers.get(pluginOptions.defaultHeight, 0) ? '' : numbers.is(pluginOptions.defaultHeight) ? pluginOptions.defaultHeight + 'px' : pluginOptions.defaultHeight,
		percentageOnlySize: !!pluginOptions.percentageOnlySize,
		uploadUrl: typeof pluginOptions.uploadUrl === 'string' ? pluginOptions.uploadUrl : null,
		uploadHeaders: pluginOptions.uploadHeaders || null,
		uploadSizeLimit: /\d+/.test(pluginOptions.uploadSizeLimit) ? numbers.get(pluginOptions.uploadSizeLimit, 0) : null,
		uploadSingleSizeLimit: /\d+/.test(pluginOptions.uploadSingleSizeLimit) ? numbers.get(pluginOptions.uploadSingleSizeLimit, 0) : null,
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
	this.modal = new Modal(this, modalEl);
	this.figure = new Figure(this, figureControls, { sizeUnit: sizeUnit });

	// members
	this.fileModalWrapper = modalEl.querySelector('.se-flex-input-wrapper');
	this.embedInput = modalEl.querySelector('.se-input-url');
	this.focusElement = this.embedInput;
	this.previewSrc = modalEl.querySelector('.se-link-preview');
	this._linkValue = '';
	this._align = 'none';
	this.sizeUnit = sizeUnit;
	this.proportion = {};
	this.inputX = {};
	this.inputY = {};
	this._element = null;
	this._cover = null;
	this._container = null;
	this._ratio = { w: 1, h: 1 };
	this._origin_w = this.pluginOptions.defaultWidth === 'auto' ? '' : this.pluginOptions.defaultWidth;
	this._origin_h = this.pluginOptions.defaultHeight === 'auto' ? '' : this.pluginOptions.defaultHeight;
	this._resizing = this.pluginOptions.canResize;
	this._onlyPercentage = this.pluginOptions.percentageOnlySize;
	this._nonResizing = !this._resizing || !this.pluginOptions.showHeightInput || this._onlyPercentage;
	this.query = {
		facebook: {
			pattern: /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com)\/(.+)/i,
			action: (url) => {
				return `https://www.facebook.com/plugins/post.php?href=${_w.encodeURIComponent(url)}&show_text=true&width=500`;
			},
			tag: 'iframe'
		},
		twitter: {
			pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com)\/(.+)\/status\/(.+)/i,
			action: (url) => {
				return `https://platform.twitter.com/embed/Tweet.html?url=${_w.encodeURIComponent(url)}`;
			},
			tag: 'iframe'
		},
		instagram: {
			pattern: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com)\/p\/(.+)/i,
			action: (url) => {
				const postId = url.match(this.query.instagram.pattern)[1];
				return `https://www.instagram.com/p/${postId}/embed`;
			},
			tag: 'iframe'
		},
		linkedin: {
			pattern: /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com)\/(.+)\/(.+)/i,
			action: (url) => {
				return `https://www.linkedin.com/embed/feed/update/${_w.encodeURIComponent(url.split('/').pop())}`;
			},
			tag: 'iframe'
		},
		pinterest: {
			pattern: /(?:https?:\/\/)?(?:www\.)?(?:pinterest\.com)\/pin\/(.+)/i,
			action: (url) => {
				const pinId = url.match(this.query.pinterest.pattern)[1];
				return `https://assets.pinterest.com/ext/embed.html?id=${pinId}`;
			},
			tag: 'iframe'
		},
		spotify: {
			pattern: /(?:https?:\/\/)?(?:open\.)?(?:spotify\.com)\/(track|album|playlist|show|episode)\/(.+)/i,
			action: (url) => {
				const match = url.match(this.query.spotify.pattern);
				const type = match[1];
				const id = match[2];
				return `https://open.spotify.com/embed/${type}/${id}`;
			},
			tag: 'iframe'
		},
		codepen: {
			pattern: /(?:https?:\/\/)?(?:www\.)?(?:codepen\.io)\/(.+)\/pen\/(.+)/i,
			action: (url) => {
				const [, user, penId] = url.match(this.query.codepen.pattern);
				return `https://codepen.io/${user}/embed/${penId}`;
			},
			tag: 'iframe'
		},
		...pluginOptions.embedQuery
	};

	const urlPatterns = [];
	for (const key in this.query) {
		urlPatterns.push(this.query[key].pattern);
	}
	this.urlPatterns = urlPatterns.concat(pluginOptions.urlPatterns || []);

	// init
	this.eventManager.addEvent(this.embedInput, 'input', OnLinkPreview.bind(this));

	if (this._resizing) {
		this.proportion = modalEl.querySelector('._se_check_proportion');
		this.inputX = modalEl.querySelector('._se_size_x');
		this.inputY = modalEl.querySelector('._se_size_y');
		this.inputX.value = this.pluginOptions.defaultWidth;
		this.inputY.value = this.pluginOptions.defaultHeight;

		this.eventManager.addEvent(this.inputX, 'keyup', OnInputSize.bind(this, 'x'));
		this.eventManager.addEvent(this.inputY, 'keyup', OnInputSize.bind(this, 'y'));
		this.eventManager.addEvent(modalEl.querySelector('.se-modal-btn-revert'), 'click', OnClickRevert.bind(this));
	}
};

Embed.key = 'embed';
Embed.type = 'modal';
Embed.className = '';
Embed.component = function (node) {
	let src = '';
	if (/^IFRAME$/i.test(node?.nodeName)) src = node.src;
	if (/^DIV$/i.test(node?.nodeName) && /^IFRAME$/i.test(node.firstElementChild?.nodeName)) src = node.firstElementChild.src;

	if (src) {
		return this.checkContentType(src) ? node : null;
	}
	return null;
};
Embed.prototype = {
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
			this.proportion.disabled = true;
		}
	},

	/**
	 * @override modal
	 * @returns {boolean | undefined}
	 */
	async modalAction() {
		this._align = this.modal.form.querySelector('input[name="suneditor_embed_radio"]:checked').value;

		let result = false;
		if (this._linkValue.length > 0) {
			result = await this.submitSRC(this._linkValue);
		}

		if (result) this._w.setTimeout(this.component.select.bind(this.component, this._element, 'video'), 0);

		return result;
	},

	/**
	 * @override core
	 */
	retainFormat() {
		return {
			query: 'iframe',
			method: async (element) => {
				if (!this.checkContentType(element.src)) return;

				const figureInfo = Figure.GetContainer(element);
				if (figureInfo && figureInfo.container && figureInfo.cover) return;

				this.ready(element);
				const line = this.format.getLine(element);
				if (line) this._align = line.style.textAlign || line.style.float;

				this._update(element);
			}
		};
	},

	/**
	 * @override modal
	 */
	init() {
		Modal.OnChangeFile(this.fileModalWrapper, []);
		this._linkValue = this.previewSrc.textContent = this.embedInput.value = '';

		this.modal.form.querySelector('input[name="suneditor_embed_radio"][value="none"]').checked = true;
		this._ratio = { w: 1, h: 1 };
		this._nonResizing = false;

		if (this._resizing) {
			this.inputX.value = this.pluginOptions.defaultWidth === this._defaultSizeX ? '' : this.pluginOptions.defaultWidth;
			this.inputY.value = this.pluginOptions.defaultHeight === this._defaultSizeY ? '' : this.pluginOptions.defaultHeight;
			this.proportion.checked = false;
			this.proportion.disabled = true;
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
		const figureInfo = this.figure.open(target, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: false });

		this._element = target;
		this._cover = figureInfo.cover;
		this._container = figureInfo.container;
		this._caption = figureInfo.caption;
		this._align = figureInfo.align;
		target.style.float = '';

		this._origin_w = figureInfo.originWidth || figureInfo.w || '';
		this._origin_h = figureInfo.originHeight || figureInfo.h || '';

		(this.modal.form.querySelector('input[name="suneditor_embed_radio"][value="' + this._align + '"]') || this.modal.form.querySelector('input[name="suneditor_embed_radio"][value="none"]')).checked = true;

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
	 * @override component, fileManager
	 */
	async destroy(element) {
		const targetEl = element || this._element;
		const container = domUtils.getParentElement(targetEl, Figure.__is) || targetEl;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		const emptyDiv = container.parentNode;

		const message = await this.triggerEvent('onVideoDeleteBefore', { target: targetEl, container, align: this._align, url: this._linkValue });
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

	checkContentType(url) {
		url = url?.toLowerCase() || '';
		if (this.urlPatterns.some((pattern) => pattern.test(url))) {
			return true;
		}

		return false;
	},

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

	applySize(w, h) {
		if (!w) w = this.inputX.value || this.pluginOptions.defaultWidth;
		if (!h) h = this.inputY.value || this.pluginOptions.defaultHeight;
		if (this._onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w)) w += '%';
		}
		this.figure.setSize(w, h);
	},

	create(process, src, width, height, align, isUpdate) {
		let oFrame = null;
		let cover = null;
		let container = null;
		let scriptTag = null;

		/** update */
		if (isUpdate) {
			oFrame = this._element;
			if (oFrame.src !== src) {
				const processUrl = this.findProcessUrl(src);
				if (/^iframe$/i.test(processUrl?.tag) && !/^iframe$/i.test(oFrame.nodeName)) {
					const newTag = this.createIframeTag();
					newTag.src = src;
					oFrame.parentNode.replaceChild(newTag, oFrame);
					oFrame = newTag;
				} else if (/^blockquote$/i.test(processUrl?.tag) && !/^blockquote$/i.test(oFrame.nodeName)) {
					const newTag = this.createEmbedTag();
					newTag.src = src;
					oFrame.parentNode.replaceChild(newTag, oFrame);
					oFrame = newTag;
				} else {
					oFrame.src = src;
				}
			}
			container = this._container;
			cover = domUtils.getParentElement(oFrame, 'FIGURE');
		} else {
			/** create */
			if (process) {
				oFrame = this.createIframeTag();
				oFrame.src = src;
				const figure = Figure.CreateContainer(oFrame, 'se-embed-container');
				cover = figure.cover;
				container = figure.container;
			} else {
				oFrame = src[0];
				const figure = Figure.CreateContainer(oFrame, 'se-embed-container');
				cover = figure.cover;
				container = figure.container;
				let index = 0;
				while (src[index]) {
					if (/^script$/i.test(src[index].nodeName)) {
						scriptTag = domUtils.createElement('script', { src: src[index].src, async: true }, null);
						index++;
						continue;
					}
					cover.appendChild(src[index]);
				}
			}
		}

		/** rendering */
		this._element = oFrame;
		this._cover = cover;
		this._container = container;
		this.figure.open(oFrame, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: true });

		width = width || this._defaultSizeX;
		height = height || this._defaultSizeY;
		const size = this.figure.getSize(oFrame);
		const inputUpdate = size.w !== width || size.h !== height;
		const changeSize = !isUpdate || inputUpdate;

		// set size
		if (changeSize) {
			this.applySize(width, height);
		}

		// align
		this.figure.setAlign(oFrame, align);

		if (!isUpdate) {
			this.component.insert(container, { skipCharCount: false, skipSelection: true, skipHistory: true });

			if (scriptTag) {
				try {
					this.history.pause();

					scriptTag.onload = () => {
						domUtils.removeItem(scriptTag);
						scriptTag = null;
					};
					cover.appendChild(scriptTag);

					const observer = new MutationObserver((mutations) => {
						for (const mutation of mutations) {
							if (mutation.type === 'childList') {
								if (!oFrame.parentElement) {
									this.history.resume();
									this.history.push(false);
									observer.disconnect();
									break;
								}
							}
						}
					});

					observer.observe(this.editor.frameContext.get('wysiwyg'), {
						subtree: true,
						childList: true
					});
				} catch (e) {
					this.history.resume();
					console.warn('[SUNEDITOR] Embed tag script load error.', e);
				}
			}

			if (!this.options.get('componentAutoSelect')) {
				const line = this.format.addLine(container, null);
				if (line) this.selection.setRange(line, 0, line, 0);
			}
			return;
		}

		if (this._resizing && changeSize && this.figure.isVertical) this.figure.setTransform(oFrame, width, height, 0);
		if (!scriptTag) this.history.push(false);
	},

	createIframeTag() {
		const iframeTag = domUtils.createElement('IFRAME');
		this._setIframeAttrs(iframeTag);
		return iframeTag;
	},

	createEmbedTag() {},

	_getInfo() {
		return {
			inputWidth: this.inputX.value,
			inputHeight: this.inputY.value,
			align: this._align,
			isUpdate: this.modal.isUpdate,
			element: this._element
		};
	},

	async submitSRC(src) {
		if (!src) src = this._linkValue;
		if (!src) return false;

		let embedInfo = null;
		if (/^<iframe\s|^<blockquote\s/i.test(src)) {
			const embedDOM = new DOMParser().parseFromString(src, 'text/html').body.children;
			if (embedDOM.length === 0) return false;
			embedInfo = { children: embedDOM, ...this._getInfo(), process: null };
		} else {
			const processUrl = this.findProcessUrl(src);
			if (!processUrl) return false;
			src = processUrl.url;
			embedInfo = { url: src, ...this._getInfo(), process: processUrl };
		}

		const handler = function (infos, newInfos) {
			infos = newInfos || infos;
			this.create(infos.process, infos.process ? infos.url : infos.children, infos.inputWidth, infos.inputHeight, infos.align, infos.isUpdate);
		}.bind(this, embedInfo);

		const result = await this.triggerEvent('onEmbedInputBefore', {
			...embedInfo,
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

		this._setIframeAttrs(oFrame);

		let existElement = this.format.isBlock(oFrame.parentNode) || domUtils.isWysiwygFrame(oFrame.parentNode) ? oFrame : this.format.getLine(oFrame) || oFrame;

		const prevFrame = oFrame;
		oFrame = oFrame.cloneNode(true);
		const figure = Figure.CreateContainer(oFrame, 'se-embed-container');
		const container = figure.container;

		// size
		this.figure.open(oFrame, { nonResizing: this._nonResizing, nonSizeInfo: false, nonBorder: false, figureTarget: false, __fileManagerInfo: true });
		const size = (oFrame.getAttribute('data-se-size') || ',').split(',');
		this.applySize(size[0] || prevFrame.style.width || prevFrame.width || '', size[1] || prevFrame.style.height || prevFrame.height || '');

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

		return oFrame;
	},

	_setIframeAttrs(element) {
		element.frameBorder = '0';
		element.allowFullscreen = true;

		const attrs = this.pluginOptions.iframeTagAttributes;
		if (!attrs) return;

		for (const key in attrs) {
			element.setAttribute(key, attrs[key]);
		}
	},

	constructor: Embed
};

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

function OnClickRevert() {
	if (this._onlyPercentage) {
		this.inputX.value = this._origin_w > 100 ? 100 : this._origin_w;
	} else {
		this.inputX.value = this._origin_w;
		this.inputY.value = this._origin_h;
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

	if (xy === 'y') {
		this._setRatioSelect(e.target.value || this._defaultRatio);
	}
}

function CreateHTML_modal({ lang, icons }, pluginOptions) {
	let html = /*html*/ `
	<form method="post" enctype="multipart/form-data">
		<div class="se-modal-header">
			<button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
			${icons.cancel}
			</button>
			<span class="se-modal-title">${lang.embed_modal_title}</span>
		</div>
		<div class="se-modal-body">
			<div class='se-modal-form'>
				<label>${lang.embed_modal_source}</label>
				<input class='se-input-form se-input-url' type='text' data-focus />
				<pre class='se-link-preview'></pre>
			</div>`;
	if (pluginOptions.canResize) {
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
				<input class="se-input-control _se_size_x" placeholder="auto"${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}/>
				<label class="se-modal-size-x"${onlyWidthDisplay}>${onlyPercentage ? '%' : 'x'}</label>
				<input class="se-input-control _se_size_y" placeholder="auto"
				${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}${heightDisplay}/>
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
				<label><input type="radio" name="suneditor_embed_radio" class="se-modal-btn-radio" value="none" checked>${lang.basic}</label>
				<label><input type="radio" name="suneditor_embed_radio" class="se-modal-btn-radio" value="left">${lang.left}</label>
				<label><input type="radio" name="suneditor_embed_radio" class="se-modal-btn-radio" value="center">${lang.center}</label>
				<label><input type="radio" name="suneditor_embed_radio" class="se-modal-btn-radio" value="right">${lang.right}</label>
			</div>
			<button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}"><span>${lang.submitButton}</span></button>
		</div>
	</form>`;

	return domUtils.createElement('DIV', { class: 'se-modal-content' }, html);
}

export default Embed;