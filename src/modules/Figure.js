'use strict';

import EditorInterface from '../interface/editor';
import { Controller, SelectMenu } from '../modules';
import { domUtils, numbers } from '../helper';

const DIRECTION_CURSOR_MAP = {
	tl: 'nw-resize',
	tr: 'ne-resize',
	bl: 'sw-resize',
	br: 'se-resize',
	lw: 'w-resize',
	th: 'n-resize',
	rw: 'e-resize',
	bh: 's-resize'
};

const Figure = function (inst, controls, params) {
	EditorInterface.call(this, inst.editor);

	// create HTML
	const resizeDot = (this.resizeDot = CreateHTML_resizeDot());
	this.resizeBorder = resizeDot.querySelector('.se-resize-dot');
	this.context.element.editorArea.appendChild(resizeDot);
	const controllerEl = CreateHTML_controller(inst.editor, controls || []);
	const alignMenus = CreateAlign(this);
	this.alignButton = controllerEl.querySelector('[data-command="onalign"]');

	// modules
	this.controller = new Controller(this, controllerEl, 'bottom', inst.constructor.name);
	this.selectMenu_align = new SelectMenu(this, false, 'bottom-center');
	this.selectMenu_align.on(this.alignButton, SetMenuAlign.bind(this), { class: 'se-resizing-align-list' });
	this.selectMenu_align.create(alignMenus.items, alignMenus.html);
	this.resizeDisplay = resizeDot.querySelector('.se-resize-display');
	this.resizeHandles = resizeDot.querySelectorAll('.se-resize-dot > span');

	// members
	this.kind = inst.constructor.name;
	this.inst = inst;
	this.isMedia = !!params.isMedia;
	this.sizeUnit = params.sizeUnit || 'px';
	this.isVertical = false;
	this.percentageButtons = controllerEl.querySelectorAll('[data-command="resize_percent"]');
	this.captionButton = controllerEl.querySelector('[data-command="caption"]');
	this._element = null;
	this._cover = null;
	this._container = null;
	this._caption = null;
	this.align = 'none';
	this._element_w = 0;
	this._element_h = 0;
	this._element_l = 0;
	this._element_t = 0;
	this._resize_w = 0;
	this._resize_h = 0;
	this._resizeClientX = 0;
	this._resizeClientY = 0;
	this._resize_direction = '';
	this._floatClassRegExp = '__se__float\\-[a-z]+';
	this._alignIcons = {
		none: this.icons.align_justify,
		left: this.icons.align_left,
		right: this.icons.align_right,
		center: this.icons.align_center
	};
	this.__paddingSize = numbers.get(this._w.getComputedStyle(this.context.element.wysiwyg).paddingLeft) || 16;
	this.__offContainer = OffFigureContainer.bind(this);
	this.__containerResizing = ContainerResizing.bind(this);
	this.__containerResizingOff = ContainerResizingOff.bind(this);
	this.__onContainerEvent = null;
	this.__offContainerEvent = null;
	this.__fileManagerInfo = false;

	// init
	this.eventManager.addEvent(this.alignButton, 'click', OnClick_alignButton.bind(this));
	const resizeEvent = OnResizeContainer.bind(this);
	for (let i = 0, len = this.resizeHandles.length; i < len; i++) {
		this.eventManager.addEvent(this.resizeHandles[i], 'mousedown', resizeEvent);
	}
};

/**
 * @description Create a container for the resizing component and insert the element.
 * @param {Element} element Target element
 * @param {string} className Class name of container (fixed: se-component)
 * @returns {object} {container, cover, caption}
 */
Figure.CreateContainer = function (element, className) {
	domUtils.createElement('DIV', { class: 'se-component ' + className, contenteditable: false }, domUtils.createElement('FIGURE', null, element));
	return Figure.GetContainer(element);
};

/**
 * @description Return HTML string of caption(FIGCAPTION) element
 * @param {Element} cover Cover element(FIGURE). "CreateContainer().cover"
 * @returns {Element} caption element
 */
Figure.CreateCaption = function (cover, text) {
	const caption = domUtils.createElement('FIGCAPTION', { contenteditable: true }, '<div>' + text + '</div>');
	cover.appendChild(caption);
	return caption;
};

/**
 * @description Get the element's container(.se-component) info.
 * @param {Element} element Target element
 * @returns {object} {container, cover, caption}
 */
Figure.GetContainer = function (element) {
	return {
		container: domUtils.getParentElement(element, Figure.__isComponent),
		cover: domUtils.getParentElement(element, 'FIGURE'),
		caption: domUtils.getEdgeChild(element.parentElement, 'FIGCAPTION')
	};
};

/**
 * @description Ratio calculation
 * @param {string|number} w Width size
 * @param {string|number} h Height size
 * @param {defaultSizeUnit|undefined|null} defaultSizeUnit Default size unit (default: "px")
 * @return {{w: number, h: number}}
 */
Figure.GetRatio = function (w, h, defaultSizeUnit) {
	let rw = 1,
		rh = 1;
	if (/\d+/.test(w) && /\d+/.test(h)) {
		const xUnit = (!numbers.is(w) && w.replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
		const yUnit = (!numbers.is(h) && h.replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
		if (xUnit === yUnit) {
			const w_number = numbers.get(w, 0);
			const h_number = numbers.get(h, 0);
			rw = w_number / h_number;
			rh = h_number / w_number;
		}
	}

	return {
		w: rh,
		h: rw
	};
};

/**
 * @description Ratio calculation
 * @param {string|number} w Width size
 * @param {string|number} h Height size
 * @param {defaultSizeUnit|undefined|null} defaultSizeUnit Default size unit (default: "px")
 * @param {{w: number, h: number}} ratio Ratio size (Figure.GetRatio)
 * @return {{w: string|number, h: string|number}}
 */
Figure.CalcRatio = function (w, h, defaultSizeUnit, ratio) {
	if (/\d+/.test(w) && /\d+/.test(h)) {
		const xUnit = (!numbers.is(w) && w.replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
		const yUnit = (!numbers.is(h) && h.replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
		if (xUnit === yUnit) {
			const dec = xUnit === '%' ? 2 : 0;
			const ow = w;
			const oh = h;
			h = numbers.get(ratio.h * numbers.get(ow, dec), dec) + yUnit;
			w = numbers.get(ratio.w * numbers.get(oh, dec), dec) + xUnit;
		}
	}

	return {
		w: w,
		h: h
	};
};

/**
 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
 * @param {Node} element Target element
 * @returns {boolean}
 * @private
 */
Figure.__isComponent = function (element) {
	return element && (/se-component/.test(element.className) || /^(TABLE|HR)$/.test(element.nodeName));
};

Figure.prototype = {
	open: function (target, nonResizing, __fileManagerInfo) {
		const figureInfo = Figure.GetContainer(target);
		this._container = figureInfo.container;
		this._cover = figureInfo.cover;
		this._caption = figureInfo.caption;
		this._element = target;
		this.align = target.style.float || target.getAttribute('data-align') || 'none';
		this.isVertical = /^(90|270)$/.test(Math.abs(target.getAttribute('data-rotate')).toString());

		const offset = this.offset.get(target);
		const w = (this.isVertical ? target.offsetHeight : target.offsetWidth) - 1;
		const h = (this.isVertical ? target.offsetWidth : target.offsetHeight) - 1;
		const t = offset.top;
		const l = offset.left - this.context.element.wysiwygFrame.scrollLeft;

		const ratio = Figure.GetRatio(w, h, this.sizeUnit);
		const originSize = (target.getAttribute('data-origin') || '').split(',');
		const dataSize = (target.getAttribute('data-size') || '').split(',');
		const targetInfo = {
			container: figureInfo.container,
			cover: figureInfo.cover,
			caption: figureInfo.caption,
			align: this.align,
			ratio: ratio,
			w: w,
			h: h,
			t: t,
			l: l,
			width: dataSize[0] || 'auto',
			height: dataSize[1] || 'auto',
			originWidth: originSize[0] || target.naturalWidth || target.offsetWidth,
			originHeight: originSize[1] || target.naturalHeight || target.offsetHeight
		};

		if (__fileManagerInfo || this.__fileManagerInfo) return targetInfo;

		this.editor._figureContainer = this.resizeDot;
		this.resizeDot.style.top = t + 'px';
		this.resizeDot.style.left = l + 'px';
		this.resizeDot.style.width = w + 'px';
		this.resizeDot.style.height = h + 'px';
		this.resizeBorder.style.top = '0px';
		this.resizeBorder.style.left = '0px';
		this.resizeBorder.style.width = w + 'px';
		this.resizeBorder.style.height = h + 'px';

		this.editor.openControllers.push({
			position: 'none',
			form: this.resizeDot,
			target: target,
			inst: this,
			_offset: { left: l + (this.context.element.eventWysiwyg.scrollX || this.context.element.eventWysiwyg.scrollLeft || 0), top: t + (this.context.element.eventWysiwyg.scrollY || this.context.element.eventWysiwyg.scrollTop || 0) }
		});

		const size = this.getSize(target);
		domUtils.changeTxt(this.resizeDisplay, this.lang.modalBox[this.align === 'none' ? 'basic' : this.align] + ' (' + (size.w || 'auto') + ', ' + (size.h || 'auto') + ')');
		this._displayResizeHandles(!nonResizing);

		// percentage active
		const value = /%$/.test(target.style.width) && /%$/.test(figureInfo.container.style.width) ? numbers.get(figureInfo.container.style.width, 0) / 100 + '' : '';
		for (let i = 0, len = this.percentageButtons.length; i < len; i++) {
			if (this.percentageButtons[i].getAttribute('data-value') === value) {
				domUtils.addClass(this.percentageButtons[i], 'active');
			} else {
				domUtils.removeClass(this.percentageButtons[i], 'active');
			}
		}

		// caption active
		if (this.captionButton) {
			if (figureInfo.caption) {
				domUtils.addClass(this.captionButton, 'active');
			} else {
				domUtils.removeClass(this.captionButton, 'active');
			}
		}

		this.resizeDot.style.display = 'block';
		this.controller.open(this.resizeDot, null, this.__offContainer);
		domUtils.setDisabled(true, this.editor.resizingDisabledButtons);

		// set members
		this._element_w = this._resize_w = w;
		this._element_h = this._resize_h = h;
		this._element_l = l;
		this._element_t = t;

		// align button
		this._setAlignIcon();

		return targetInfo;
	},

	setSize: function (w, h) {
		if (/%$/.test(w)) {
			this._setPercentSize(w, h);
		} else if ((!w || w === 'auto') && (!h || h === 'auto')) {
			this._setAutoSize();
		} else {
			this._applySize(w, h, false);
		}
	},

	/**
	 * @description Gets the Figure size
	 * @param {Element|null} target
	 * @returns {{w: string, h: string}}
	 */
	getSize: function (target) {
		if (!target) target = this._element;
		if (!target) return { w: '', h: '' };

		const figure = Figure.GetContainer(target);
		if (!figure.container || !figure.cover)
			return {
				w: '',
				h: target.style.height
			};
		return {
			w: !/%$/.test(target.style.width) ? target.style.width : ((figure.container && numbers.get(figure.container.style.width, 2)) || 100) + '%',
			h: numbers.get(figure.cover.style.paddingBottom, 0) > 0 && !this.isVertical ? figure.cover.style.height : !/%$/.test(target.style.height) || !/%$/.test(target.style.width) ? target.style.height : ((figure.container && numbers.get(figure.container.style.height, 2)) || 100) + '%'
		};
	},

	/**
	 * @description Align the container.
	 * @param {Element|null} target Target element
	 * @param {"none"|"left"|"center"|"right"} align
	 */
	setAlign: function (target, align) {
		if (!target) target = this._element;

		const figure = Figure.GetContainer(target);
		const cover = figure.cover;
		const container = figure.container;

		if (align && align !== 'none') {
			cover.style.margin = 'auto';
		} else {
			cover.style.margin = '0';
		}

		if (/%$/.test(target.style.width) && align === 'center') {
			container.style.minWidth = '100%';
			cover.style.width = container.style.width;
		} else {
			container.style.minWidth = '';
			cover.style.width = this.isVertical ? target.style.height || target.offsetHeight : !target.style.width || target.style.width === 'auto' ? '' : target.style.width || '100%';
		}

		if (!domUtils.hasClass(container, '__se__float-' + align)) {
			domUtils.removeClass(container, this._floatClassRegExp);
			domUtils.addClass(container, '__se__float-' + align);
		}

		target.setAttribute('data-align', align);
		this._setAlignIcon();
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction: function (target) {
		const command = target.getAttribute('data-command');
		const value = target.getAttribute('data-value');
		const element = this._element;
		if (command === 'onalign') return;

		switch (command) {
			case 'auto':
				this.deleteTransform();
				this._setAutoSize();
				break;
			case 'resize_percent':
				let percentY = this.getSize(element);
				if (this.isVertical) {
					const percentage = element.getAttribute('data-percentage');
					if (percentage) percentY = percentage.split(',')[1];
				}

				this.deleteTransform();
				this._setPercentSize(value * 100, numbers.get(percentY, 0) === null || !/%$/.test(percentY) ? '' : percentY);
				break;
			case 'mirror':
				const r = element.getAttribute('data-rotate') || '0';
				let x = element.getAttribute('data-rotateX') || '';
				let y = element.getAttribute('data-rotateY') || '';

				if ((value === 'h' && !this.isVertical) || (value === 'v' && this.isVertical)) {
					y = y ? '' : '180';
				} else {
					x = x ? '' : '180';
				}

				element.setAttribute('data-rotateX', x);
				element.setAttribute('data-rotateY', y);

				this._setRotate(element, r, x, y);
				break;
			case 'rotate':
				const slope = element.getAttribute('data-rotate') * 1 + value * 1;
				const deg = this._w.Math.abs(slope) >= 360 ? 0 : slope;

				element.setAttribute('data-rotate', deg);
				this.isVertical = /^(90|270)$/.test(this._w.Math.abs(deg).toString());

				this.setTransform(element, null, null);
				break;
			case 'caption':
				if (!this._caption) {
					const caption = Figure.CreateCaption(this._cover, this.lang.modalBox.caption);
					const captionText = domUtils.getEdgeChild(caption, function (current) {
						return current.nodeType === 3;
					});

					if (!captionText) {
						caption.focus();
					} else {
						this.selection.setRange(captionText, 0, captionText, captionText.textContent.length);
					}

					this.controller.close();
				} else {
					domUtils.removeItem(this._caption);
					this.component.select(element, this.kind);
				}

				this._caption = !this._caption;
				if (/\d+/.test(element.style.height) || (this.isVertical && this._caption)) {
					if (/%$/.test(element.style.width) || /auto/.test(element.style.height)) {
						this.deleteTransform();
					} else {
						this.setTransform(element, element.style.width, element.style.height);
					}
				}
				break;
			case 'revert':
				this._setOriginSize();
				break;
			case 'edit':
				this.inst.open();
				break;
			case 'remove':
				this.inst.destroy();
				this.controller.close();
				break;
		}

		if (!/^edit|remove|caption$/.test(command)) {
			this.component.select(element, this.kind);
		}

		// history stack
		this.history.push(false);
	},

	/**
	 * @description Initialize the transform style (rotation) of the element.
	 * @param {Element|null} element Target element
	 */
	deleteTransform: function (element) {
		if (!element) element = this._element;

		const size = (element.getAttribute('data-size') || element.getAttribute('data-origin') || '').split(',');
		this.isVertical = false;

		element.style.maxWidth = '';
		element.style.transform = '';
		element.style.transformOrigin = '';
		element.setAttribute('data-rotate', '');
		element.setAttribute('data-rotateX', '');
		element.setAttribute('data-rotateY', '');

		this._deleteCaptionPosition(element);
		this._applySize(numbers.get(size[0]) || 'auto', numbers.get(size[1]) || '', true);
	},

	/**
	 * @description Set the transform style (rotation) of the element.
	 * @param {Element} element Target element
	 * @param {Number|null} width Element's width size
	 * @param {Number|null} height Element's height size
	 */
	setTransform: function (element, width, height) {
		width = numbers.get(width, 0);
		height = numbers.get(height, 0);
		let percentage = element.getAttribute('data-percentage');
		const isVertical = this.isVertical;
		const deg = element.getAttribute('data-rotate') * 1;
		let transOrigin = '';

		if (percentage && !isVertical) {
			percentage = percentage.split(',');
			if (percentage[0] === 'auto' && percentage[1] === 'auto') {
				this._setAutoSize();
			} else {
				this._setPercentSize(percentage[0], percentage[1]);
			}
		} else {
			const figureInfo = Figure.GetContainer(element);
			const offsetW = width || element.offsetWidth;
			const offsetH = height || element.offsetHeight;
			const w = (isVertical ? offsetH : offsetW) + 'px';
			const h = (isVertical ? offsetW : offsetH) + 'px';

			this._deletePercentSize();
			this._applySize(offsetW + 'px', offsetH + 'px', true);

			figureInfo.cover.style.width = w;
			figureInfo.cover.style.height = figureInfo.caption ? '' : h;

			if (isVertical) {
				let transW = offsetW / 2 + 'px ' + offsetW / 2 + 'px 0';
				let transH = offsetH / 2 + 'px ' + offsetH / 2 + 'px 0';
				transOrigin = deg === 90 || deg === -270 ? transH : transW;
			}
		}

		element.style.transformOrigin = transOrigin;
		this._setRotate(element, deg.toString(), element.getAttribute('data-rotateX') || '', element.getAttribute('data-rotateY') || '');

		if (isVertical) element.style.maxWidth = 'none';
		else element.style.maxWidth = '';

		this._setCaptionPosition(element);
	},

	_setRotate: function (element, r, x, y) {
		let width = (element.offsetWidth - element.offsetHeight) * (/-/.test(r) ? 1 : -1);
		let translate = '';

		if (/[1-9]/.test(r) && (x || y)) {
			translate = x ? 'Y' : 'X';

			switch (r) {
				case '90':
					translate = x && y ? 'X' : y ? translate : '';
					break;
				case '270':
					width *= -1;
					translate = x && y ? 'Y' : x ? translate : '';
					break;
				case '-90':
					translate = x && y ? 'Y' : x ? translate : '';
					break;
				case '-270':
					width *= -1;
					translate = x && y ? 'X' : y ? translate : '';
					break;
				default:
					translate = '';
			}
		}

		if (r % 180 === 0) {
			element.style.maxWidth = '';
		}

		element.style.transform = 'rotate(' + r + 'deg)' + (x ? ' rotateX(' + x + 'deg)' : '') + (y ? ' rotateY(' + y + 'deg)' : '') + (translate ? ' translate' + translate + '(' + width + 'px)' : '');
	},

	_applySize: function (w, h, notResetPercentage, direction) {
		const onlyW = /^(rw|lw)$/.test(direction);
		const onlyH = /^(th|bh)$/.test(direction);

		if (!onlyH) {
			this._element.style.width = numbers.is(w) ? w + this.sizeUnit : w;
			this._deletePercentSize();
		}
		if (!onlyW) {
			this._element.style.height = numbers.is(h) ? h + this.sizeUnit : /%$/.test(h) ? '' : h;
		}

		if (this.align === 'center') this.setAlign(this._element, this.align);
		if (!notResetPercentage) this._element.removeAttribute('data-percentage');

		// save current size
		this._saveCurrentSize();
	},

	_setAutoSize: function () {
		this.deleteTransform();
		this._deletePercentSize();

		this._element.style.maxWidth = '';
		this._element.style.width = '';
		this._element.style.height = '';
		this._cover.style.width = '';
		this._cover.style.height = '';

		this.setAlign(this._element, this.align);
		this._element.setAttribute('data-percentage', 'auto,auto');

		// save current size
		this._saveCurrentSize();
	},

	_setPercentSize: function (w, h) {
		h = !!h && !/%$/.test(h) && !numbers.get(h, 0) ? (numbers.is(h) ? h + '%' : h) : numbers.is(h) ? h + this.sizeUnit : h || '';
		const heightPercentage = /%$/.test(h);

		this._container.style.width = numbers.is(w) ? w + '%' : w;
		this._container.style.height = '';
		this._cover.style.width = '100%';
		this._cover.style.height = !heightPercentage ? '' : h;
		this._element.style.width = '100%';
		this._element.style.height = heightPercentage ? '' : h;
		this._element.style.maxWidth = '';

		if (this.align === 'center') this.setAlign(this._element, this.align);

		this._element.setAttribute('data-percentage', w + ',' + h);
		this._setCaptionPosition(this._element);

		// save current size
		this._saveCurrentSize();
	},

	_deletePercentSize: function () {
		this._cover.style.width = '';
		this._cover.style.height = '';
		this._container.style.width = '';
		this._container.style.height = '';

		domUtils.removeClass(this._container, this._floatClassRegExp);
		domUtils.addClass(this._container, '__se__float-' + this.align);

		if (this.align === 'center') this.setAlign(this._element, this.align);
	},

	_setOriginSize: function () {
		this._element.removeAttribute('data-percentage');

		this.deleteTransform();
		this._deletePercentSize();

		const originSize = (this._element.getAttribute('data-origin') || '').split(',');
		const w = originSize[0];
		const h = originSize[1];

		if (originSize) {
			if (/%$/.test(w) && (/%$/.test(h) || !/\d/.test(h))) {
				this._setPercentSize(w, h);
			} else {
				this._applySize(w, h);
			}

			// save current size
			this._saveCurrentSize();
		}
	},

	_setAlignIcon: function () {
		if (!this.alignButton) return;
		domUtils.changeElement(this.alignButton.firstElementChild, this._alignIcons[this.align]);
	},

	_saveCurrentSize: function () {
		const size = this.getSize(this._element);
		this._element.setAttribute('data-size', (numbers.get(size.w) || 'auto') + ',' + (numbers.get(size.h) || 'auto'));
		// if (!!contextPlugin._videoRatio) contextPlugin._videoRatio = size.y; @todo
	},

	_setCaptionPosition: function (element) {
		const figcaption = domUtils.getEdgeChild(domUtils.getParentElement(element, 'FIGURE'), 'FIGCAPTION');
		if (figcaption) {
			figcaption.style.marginTop = (this.isVertical ? element.offsetWidth - element.offsetHeight : 0) + 'px';
		}
	},

	_deleteCaptionPosition: function (element) {
		const figcaption = domUtils.getEdgeChild(domUtils.getParentElement(element, 'FIGURE'), 'FIGCAPTION');
		if (figcaption) {
			figcaption.style.marginTop = '';
		}
	},

	_displayResizeHandles: function (display) {
		display = !display ? 'none' : 'flex';
		this.controller.form.style.display = display;

		for (let i = 0, len = this.resizeHandles.length; i < len; i++) {
			this.resizeHandles[i].style.display = display;
		}

		if (display === 'none') {
			domUtils.addClass(this.resizeDot, 'se-resize-ing');
		} else {
			domUtils.removeClass(this.resizeDot, 'se-resize-ing');
		}
	},

	constructor: Figure
};

const resizing = {
	/**
	 * @description Called at the "openModify" to put the size of the current target into the size input element.
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 * @param {Object} pluginObj Plugin object
	 */
	_module_setModifyInputSize: function (contextPlugin, pluginObj) {
		const percentageRotation = contextPlugin._onlyPercentage && this.context.resizing.isVertical;
		contextPlugin.proportion.checked = contextPlugin._proportionChecked = contextPlugin._element.getAttribute('data-proportion') !== 'false';

		const size = this.getSize(this._element);
		let x = percentageRotation ? '' : size.w;
		if (x === contextPlugin._defaultSizeX) x = '';
		if (contextPlugin._onlyPercentage) x = numbers.get(x, 2);
		contextPlugin.inputX.value = x;
		pluginObj.setInputSize.call(this, 'x');

		if (!contextPlugin._onlyPercentage) {
			let y = percentageRotation ? '' : size.h;
			if (y === contextPlugin._defaultSizeY) y = '';
			if (contextPlugin._onlyPercentage) y = numbers.get(y, 2);
			contextPlugin.inputY.value = y;
		}

		contextPlugin.inputX.disabled = percentageRotation ? true : false;
		contextPlugin.inputY.disabled = percentageRotation ? true : false;
		contextPlugin.proportion.disabled = percentageRotation ? true : false;

		pluginObj.setRatio.call(this);
	}
};

function OnCopy(e) {
	const info = this.editor.currentFileComponentInfo;
	if (info && !env.isIE) {
		this._setClipboardComponent(e, info, clipboardData);
		// copy effect
		domUtils.addClass(info.component, 'se-component-copy');
		_w.setTimeout(function () {
			domUtils.removeClass(info.component, 'se-component-copy');
		}, 150);
	}
}

function OnResizeContainer(e) {
	e.stopPropagation();
	e.preventDefault();

	const direction = (this._resize_direction = e.target.classList[0]);
	this._resizeClientX = e.clientX;
	this._resizeClientY = e.clientY;
	this.resizeDot.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';
	this.context.element.resizeBackground.style.cursor = DIRECTION_CURSOR_MAP[direction];
	this.context.element.resizeBackground.style.display = 'block';

	this.__onContainerEvent = this.eventManager.addGlobalEvent('mousemove', this.__containerResizing);
	this.__offContainerEvent = this.eventManager.addGlobalEvent('mouseup', this.__containerResizingOff);
	this._displayResizeHandles(false);
}

function ContainerResizing(e) {
	const direction = this._resize_direction;
	const clientX = e.clientX;
	const clientY = e.clientY;

	let resultW = this._element_w;
	let resultH = this._element_h;

	let w = this._element_w + (/r/.test(direction) ? clientX - this._resizeClientX : this._resizeClientX - clientX);
	let h = this._element_h + (/b/.test(direction) ? clientY - this._resizeClientY : this._resizeClientY - clientY);
	const wh = (this._element_h / this._element_w) * w;

	if (/t/.test(direction)) this.resizeBorder.style.top = this._element_h - (/h/.test(direction) ? h : wh) + 'px';
	if (/l/.test(direction)) this.resizeBorder.style.left = this._element_w - w + 'px';

	if (/r|l/.test(direction)) {
		this.resizeBorder.style.width = w + 'px';
		resultW = w;
	}

	if (/^(t|b)[^h]$/.test(direction)) {
		this.resizeBorder.style.height = wh + 'px';
		resultH = wh;
	} else if (/^(t|b)h$/.test(direction)) {
		this.resizeBorder.style.height = h + 'px';
		resultH = h;
	}

	this._resize_w = resultW;
	this._resize_h = resultH;
	domUtils.changeTxt(this.resizeDisplay, this._w.Math.round(resultW) + ' x ' + this._w.Math.round(resultH));
}

function ContainerResizingOff() {
	this.eventManager.removeGlobalEvent(this.__onContainerEvent);
	this.eventManager.removeGlobalEvent(this.__offContainerEvent);

	this._displayResizeHandles(true);
	this.editor.offCurrentController();
	this.context.element.resizeBackground.style.display = 'none';
	this.context.element.resizeBackground.style.cursor = 'default';

	// set size
	let w = this._w.Math.round(this.isVertical ? this._resize_h : this._resize_w);
	let h = this._w.Math.round(this.isVertical ? this._resize_w : this._resize_h);

	if (!this.isVertical && !/%$/.test(w)) {
		const limit = this.context.element.wysiwygFrame.clientWidth - this.__paddingSize * 2 - 2;
		if (numbers.get(w, 0) > limit) {
			h = this._w.Math.round((h / w) * limit);
			w = limit;
		}
	}

	this._applySize(w, h, false, this._resize_direction);
	if (this.isVertical) this.setTransform(this._element, w, h);

	this.component.select(this._element, this.kind);

	// history stack
	this.history.push(false);
}

function SetMenuAlign(item) {
	this.setAlign(this._element, item);
	this.selectMenu_align.close();
	this.component.select(this._element, this.kind);
}

function CreateAlign(editor) {
	const icons = [editor.icons.align_justify, editor.icons.align_left, editor.icons.align_center, editor.icons.align_right];
	const langs = [editor.lang.modalBox.basic, editor.lang.modalBox.left, editor.lang.modalBox.center, editor.lang.modalBox.right];
	const commands = ['none', 'left', 'center', 'right'];
	const html = [];
	const items = [];
	for (let i = 0; i < commands.length; i++) {
		html.push('<button type="button" class="se-btn-list se-tooltip" data-command="' + commands[i] + '">' + icons[i] + '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + langs[i] + '</span></span>' + '</button>');
		items.push(commands[i]);
	}

	return { html: html, items: items };
}

function OffFigureContainer() {
	domUtils.setDisabled(false, this.editor.resizingDisabledButtons);
	this.resizeDot.style.display = 'none';
	this.editor._figureContainer = null;
	this.inst.init();
}

function OnClick_alignButton() {
	this.selectMenu_align.open('', '[data-command="' + this.align + '"]');
}

function CreateHTML_resizeDot() {
	const html =
		'<div class="se-resize-dot">' +
		'<span class="tl"></span>' +
		'<span class="tr"></span>' +
		'<span class="bl"></span>' +
		'<span class="br"></span>' +
		'<span class="lw"></span>' +
		'<span class="th"></span>' +
		'<span class="rw"></span>' +
		'<span class="bh"></span>' +
		'<div class="se-resize-display"></div>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller se-resizing-container', style: 'display: none;' }, html);
}

function CreateHTML_controller(editor, controls) {
	const lang = editor.lang;
	const icons = editor.icons;
	const html =
		'<div class="se-arrow se-arrow-up"></div>' +
		'<div class="se-btn-group">' +
		'<button type="button" data-command="resize_percent" data-value="1" class="se-tooltip">' +
		'<span>100%</span>' +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.resize100 +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="resize_percent" data-value="0.75" class="se-tooltip">' +
		'<span>75%</span>' +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.resize75 +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="resize_percent" data-value="0.5" class="se-tooltip">' +
		'<span>50%</span>' +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.resize50 +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="auto" class="se-btn se-tooltip">' +
		icons.auto_size +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.autoSize +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="rotate" data-value="-90" class="se-btn se-tooltip">' +
		icons.rotate_left +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.rotateLeft +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="rotate" data-value="90" class="se-btn se-tooltip">' +
		icons.rotate_right +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.rotateRight +
		'</span></span>' +
		'</button>' +
		'</div>' +
		'<div class="se-btn-group" style="padding-top: 0;">' +
		'<button type="button" data-command="mirror" data-value="h" class="se-btn se-tooltip">' +
		icons.mirror_horizontal +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.mirrorHorizontal +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="mirror" data-value="v" class="se-btn se-tooltip">' +
		icons.mirror_vertical +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.mirrorVertical +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="onalign" class="se-btn se-tooltip">' +
		icons.align_justify +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.toolbar.align +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="caption" class="se-btn se-tooltip">' +
		icons.caption +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.modalBox.caption +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="revert" class="se-btn se-tooltip">' +
		icons.revert +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.modalBox.revertButton +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="edit" class="se-btn se-tooltip">' +
		icons.modify +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.edit +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="remove" class="se-btn se-tooltip">' +
		icons.delete +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.remove +
		'</span></span>' +
		'</button>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-resizing' }, html);
}

export default Figure;
