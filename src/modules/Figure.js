'use strict';

import EditorInterface from '../interface/editor';
import { Controller, SelectMenu } from '../modules';
import { domUtils, numbers } from '../helper';

const Figure = function (inst, controls, params) {
	EditorInterface.call(this, inst.editor);

	// create HTML
	const resizeDot = (this.resizeContainer = CreateHTML_resizeDot());
	this.context.element.relative.appendChild(resizeDot);
	const controllerEl = CreateHTML_controller(inst.editor, controls || []);
	const alignButton = controllerEl.querySelector('[data-command="onalign"]');

	// modules
	this.controller = new Controller(this, controllerEl, 'bottom');
	this.selectMenu_align = new SelectMenu(this, false, 'bottom-center');
	this.selectMenu_align.on(alignButton, SetMenuAlign.bind(this), { class: 'se-resizing-align-list' });
	this.selectMenu_align.create(CreateAlign(this));
	this.resizeDiv = resizeDot.querySelector('.se-modal-resize');
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
	this._align = 'none';
	this._element_w = 1;
	this._element_h = 1;
	this._element_l = 0;
	this._element_t = 0;
	this._floatClassRegExp = '__se__float\\-[a-z]+';
	this._ratio = false;
	this._ratioX = 1;
	this._ratioY = 1;
	this.__containerGlobalEvent = null;
	this.__offContainer = OffFigureContainer.bind(this);
	this.__fileManagerInfo = false;

	// init
	this.eventManager.addEvent(alignButton, 'click', OnClick_alignButton.bind(this));
	const resizeEvent = OnMouseDown_resizingDot.bind(this);
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
Figure.CreateCaption = function (cover) {
	const caption = domUtils.createElement('FIGCAPTION', { contenteditable: true }, '<div>' + this.lang.modalBox.caption + '</div>');
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
 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
 * @param {Node} element Target element
 * @returns {boolean}
 * @private
 */
Figure.__isComponent = function (element) {
	return element && (/se-component/.test(element.className) || /^(TABLE|HR)$/.test(element.nodeName));
};

Figure.prototype = {
	open: function (target) {
		const figureInfo = Figure.GetContainer(target);
		this._container = figureInfo.container;
		this._cover = figureInfo.cover;
		this._caption = figureInfo.caption;
		this._element = target;
		this._align = target.style.float || target.getAttribute('data-align') || 'none';
		this.isVertical = /^(90|270)$/.test(Math.abs(target.getAttribute('data-rotate')).toString());

		const offset = this.offset.get(target);
		const w = this.isVertical ? target.offsetHeight : target.offsetWidth;
		const h = this.isVertical ? target.offsetWidth : target.offsetHeight;
		const t = offset.top;
		const l = offset.left - this.context.element.wysiwygFrame.scrollLeft;
		const targetInfo = {
			container: figureInfo.container,
			cover: figureInfo.cover,
			caption: figureInfo.caption,
			align: this._align,
			w: w,
			h: h,
			t: t,
			l: l
		};

		if (this.__fileManagerInfo) return targetInfo;

		this.resizeContainer.style.top = t + 'px';
		this.resizeContainer.style.left = l + 'px';
		this.resizeContainer.style.width = w + 'px';
		this.resizeContainer.style.height = h + 'px';
		this.resizeDiv.style.top = '0px';
		this.resizeDiv.style.left = '0px';
		this.resizeDiv.style.width = w + 'px';
		this.resizeDiv.style.height = h + 'px';

		this.editor.openControllers.push({ position: 'none', form: this.resizeContainer, target: target, inst: this, _offset: { left: l + this.context.element.eventWysiwyg.scrollX, top: t + this.context.element.eventWysiwyg.scrollY } });

		const size = this.getSize(target);
		domUtils.changeTxt(this.resizeDisplay, this.lang.modalBox[this._align === 'none' ? 'basic' : this._align] + ' (' + (size.w || 'auto') + ', ' + (size.h || 'auto') + ')');

		// @todo
		// const contextPlugin = this.context[plugin];
		// const resizeDotShow = contextPlugin._resizing && !contextPlugin._resizeDotHide && !contextPlugin._onlyPercentage ? 'flex' : 'none';
		// for (let i = 0, len = this.resizeHandles.length; i < len; i++) {
		// 	this.resizeHandles[i].style.display = resizeDotShow;
		// }

		// percentage active
		const pButtons = this.percentageButtons;
		const value = /%$/.test(target.style.width) && /%$/.test(figureInfo.container.style.width) ? numbers.get(figureInfo.container.style.width, 0) / 100 + '' : '';
		for (let i = 0, len = pButtons.length; i < len; i++) {
			if (pButtons[i].getAttribute('data-value') === value) {
				domUtils.addClass(pButtons[i], 'active');
			} else {
				domUtils.removeClass(pButtons[i], 'active');
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

		this.resizeContainer.style.display = 'block';
		this.controller.open(this.resizeContainer);
		domUtils.setDisabled(true, this.editor.resizingDisabledButtons);
		this.editor._antiBlur = true;
		this.editor.blur();
		this.__containerGlobalEvent = this.eventManager.addGlobalEvent('mousedown', this.__offContainer, false);

		// set members
		const originSize = (target.getAttribute('data-origin-size') || '').split(',');
		this._origin_w = originSize[0] || target.naturalWidth;
		this._origin_h = originSize[1] || target.naturalHeight;
		this._element_w = this._resize_w = w;
		this._element_h = this._resize_h = h;
		this._element_l = l;
		this._element_t = t;

		return targetInfo;
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

	setSize: function (w, h, notResetPercentage, direction) {
		const onlyW = /^(rw|lw)$/.test(direction);
		const onlyH = /^(th|bh)$/.test(direction);

		if (!onlyH) {
			this._element.style.width = numbers.is(w) ? w + this.sizeUnit : w;
			this.deletePercent();
		}
		if (!onlyW) {
			this._element.style.height = numbers.is(h) ? h + this.sizeUnit : /%$/.test(h) ? '' : h;
		}

		if (this._align === 'center') this.setAlign(this._element, this._align);
		if (!notResetPercentage) this._element.removeAttribute('data-percentage');

		// save current size
		this._module_saveCurrentSize();
	},

	/**
	 * @description Set "auto" size
	 */
	setAutoSize: function () {
		this.deleteTransform();
		this.deletePercent();

		this._element.style.maxWidth = '';
		this._element.style.width = '';
		this._element.style.height = '';
		this._cover.style.width = '';
		this._cover.style.height = '';

		this.setAlign(this._element, this._align);
		this._element.setAttribute('data-percentage', 'auto,auto');

		// save current size
		this._module_saveCurrentSize();
	},

	setPercent: function (w, h) {
		h = !!h && !/%$/.test(h) && !numbers.get(h, 0) ? (numbers.is(h) ? h + '%' : h) : numbers.is(h) ? h + this.sizeUnit : h || '';
		const heightPercentage = /%$/.test(h);

		this._container.style.width = numbers.is(w) ? w + '%' : w;
		this._container.style.height = '';
		this._cover.style.width = '100%';
		this._cover.style.height = !heightPercentage ? '' : h;
		this._element.style.width = '100%';
		this._element.style.height = heightPercentage ? '' : h;
		this._element.style.maxWidth = '';

		if (this._align === 'center') this.setAlign(this._element, this._align);

		this._element.setAttribute('data-percentage', w + ',' + h);
		this._setCaptionPosition(this._element);

		// save current size
		this._module_saveCurrentSize();
	},

	deletePercent: function () {
		this._cover.style.width = '';
		this._cover.style.height = '';
		this._container.style.width = '';
		this._container.style.height = '';

		domUtils.removeClass(this._container, this._floatClassRegExp);
		domUtils.addClass(this._container, '__se__float-' + this._align);

		if (this._align === 'center') this.setAlign(this._element, this._align);
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

		this.setSize(size[0] ? size[0] : 'auto', size[1] ? size[1] : '', true);
	},

	/**
	 * @description Set the transform style (rotation) of the element.
	 * @param {Element} element Target element
	 * @param {Number|null} width Element's width size
	 * @param {Number|null} height Element's height size
	 */
	setTransform: function (element, width, height) {
		let percentage = element.getAttribute('data-percentage');
		const isVertical = this.isVertical;
		const deg = element.getAttribute('data-rotate') * 1;
		let transOrigin = '';

		if (percentage && !isVertical) {
			percentage = percentage.split(',');
			if (percentage[0] === 'auto' && percentage[1] === 'auto') {
				this.setAutoSize();
			} else {
				this.setPercent(percentage[0], percentage[1]);
			}
		} else {
			const figureInfo = Figure.GetContainer(element);
			const offsetW = width || element.offsetWidth;
			const offsetH = height || element.offsetHeight;
			const w = (isVertical ? offsetH : offsetW) + 'px';
			const h = (isVertical ? offsetW : offsetH) + 'px';

			this.deletePercent();
			this.setSize(offsetW + 'px', offsetH + 'px', true);

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
	},

	/**
	 * @description Save the size data (element.setAttribute("data-size"))
	 * Used at the "setSize" method
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 */
	_module_saveCurrentSize: function () {
		const size = this.getSize(this._element);
		this._element.setAttribute('data-size', size.x + ',' + size.y);
		// if (!!contextPlugin._videoRatio) contextPlugin._videoRatio = size.y; @todo
	},

	/**
	 * @description The position of the caption is set automatically.
	 * @param {Element} element Target element (not caption element)
	 * @private
	 */
	_setCaptionPosition: function (element) {
		const figcaption = domUtils.getEdgeChild(domUtils.getParentElement(element, 'FIGURE'), 'FIGCAPTION');
		if (figcaption) {
			figcaption.style.marginTop = (this.isVertical ? element.offsetWidth - element.offsetHeight : 0) + 'px';
		}
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

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction: function (target) {
		const command = target.getAttribute('data-command');
		const value = target.getAttribute('data-value');
		const element = this._element;

		switch (command) {
			case 'auto':
				this.deleteTransform();
				this.setAutoSize();
				break;
			case 'resize_percent':
				let percentY = this.getSize(element);
				if (this.isVertical) {
					const percentage = element.getAttribute('data-percentage');
					if (percentage) percentY = percentage.split(',')[1];
				}

				this.deleteTransform();
				this.setPercent(value * 100, numbers.get(percentY, 0) === null || !/%$/.test(percentY) ? '' : percentY);
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
			case 'align':
				currentModule.setAlign.call(this, value, null, null, null);
				break;
			case 'caption':
				currentModule.update_image.call(this, false, false, false);
				if (caption) {
					const captionText = domUtils.getEdgeChild(currentContext._caption, function (current) {
						return current.nodeType === 3;
					});

					if (!captionText) {
						currentContext._caption.focus();
					} else {
						this.setRange(captionText, 0, captionText, captionText.textContent.length);
					}

					this.editor._offCurrentController();
				} else {
					this.component.select(element, this.kind);
					currentModule.openModify.call(this, true);
				}

				break;
			case 'revert':
				currentModule.setOriginSize.call(this);
				break;
		}

		if (!/^edit|remove$/.test(command)) this.inst.figureAction(element, command, value);
		if (!/^edit|remove|caption$/.test(command)) this.component.select(element, this.kind);

		// history stack
		this.history.push(false);
	},

	constructor: Figure
};

const resizing = {
	/**
     * @description Constructor
     * Require context properties when resizing module
        inputX: Element,
        inputY: Element,
        _defaultSizeX: 'auto',
        _defaultSizeY: 'auto',
        _origin_w: core.options.imageWidth === 'auto' ? '' : core.options.imageWidth,
        _origin_h: core.options.imageHeight === 'auto' ? '' : core.options.imageHeight,
        _proportionChecked: true,
        // -- select function --
        _resizing: core.options.imageResizing,
        _resizeDotHide: !core.options.imageHeightShow,
        _rotation: core.options.imageRotation,
        _onlyPercentage: core.options.imageSizeOnlyPercentage,
        _ratio: false,
        _ratioX: 1,
        _ratioY: 1
     * @param {Object} core Core object 
     */
	add: function (core) {
		const icons = core.icons;
		const context = core.context;
		context.resizing = {
			_resizeClientX: 0,
			_resizeClientY: 0,
			_resize_plugin: '',
			_resize_w: 0,
			_resize_h: 0,
			_origin_w: 0,
			_origin_h: 0,
			isVertical: false,
			_resize_direction: '',
			_move_path: null,
			_isChange: false,
			alignIcons: {
				basic: icons.align_justify,
				left: icons.align_left,
				right: icons.align_right,
				center: icons.align_center
			}
		};

		/** resize controller, button */

		context.resizing.alignMenu = controllerEl.querySelector('.se-resizing-align-list');
		context.resizing.alignMenuList = context.resizing.alignMenu.querySelectorAll('button');

		context.resizing.autoSizeButton = controllerEl.querySelector('[data-command="auto"]');
	},

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
	},

	/**
	 * @description It is called in "setInputSize" (input tag keyupEvent),
	 * checks the value entered in the input tag,
	 * calculates the ratio, and sets the calculated value in the input tag of the opposite size.
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 * @param {string} xy 'x': width, 'y': height
	 */
	_module_setInputSize: function (contextPlugin, xy) {
		if (contextPlugin._onlyPercentage) {
			if (xy === 'x' && contextPlugin.inputX.value > 100) contextPlugin.inputX.value = 100;
			return;
		}

		if (contextPlugin.proportion.checked && contextPlugin._ratio && /\d/.test(contextPlugin.inputX.value) && /\d/.test(contextPlugin.inputY.value)) {
			const xUnit = contextPlugin.inputX.value.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;
			const yUnit = contextPlugin.inputY.value.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;

			if (xUnit !== yUnit) return;

			const dec = xUnit === '%' ? 2 : 0;

			if (xy === 'x') {
				contextPlugin.inputY.value = numbers.get(contextPlugin._ratioY * numbers.get(contextPlugin.inputX.value, dec), dec) + yUnit;
			} else {
				contextPlugin.inputX.value = numbers.get(contextPlugin._ratioX * numbers.get(contextPlugin.inputY.value, dec), dec) + xUnit;
			}
		}
	},

	/**
	 * @description It is called in "setRatio" (input and proportionCheck tags changeEvent),
	 * checks the value of the input tag, calculates the ratio, and resets it in the input tag.
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 */
	_module_setRatio: function (contextPlugin) {
		const xValue = contextPlugin.inputX.value;
		const yValue = contextPlugin.inputY.value;

		if (contextPlugin.proportion.checked && /\d+/.test(xValue) && /\d+/.test(yValue)) {
			const xUnit = xValue.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;
			const yUnit = yValue.replace(/\d+|\./g, '') || contextPlugin.sizeUnit;

			if (xUnit !== yUnit) {
				contextPlugin._ratio = false;
			} else if (!contextPlugin._ratio) {
				const x = numbers.get(xValue, 0);
				const y = numbers.get(yValue, 0);

				contextPlugin._ratio = true;
				contextPlugin._ratioX = x / y;
				contextPlugin._ratioY = y / x;
			}
		} else {
			contextPlugin._ratio = false;
		}
	},

	/**
	 * @description Revert size of element to origin size (plugin._origin_w, plugin._origin_h)
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 * @private
	 */
	_module_sizeRevert: function (contextPlugin) {
		if (contextPlugin._onlyPercentage) {
			contextPlugin.inputX.value = contextPlugin._origin_w > 100 ? 100 : contextPlugin._origin_w;
		} else {
			contextPlugin.inputX.value = contextPlugin._origin_w;
			contextPlugin.inputY.value = contextPlugin._origin_h;
		}
	},

	/**
	 * @description Mouse move event after call resize handles
	 * The size of the module's "div" is adjusted according to the mouse move event.
	 * @param {Object} contextResizing "core.context.resizing" object (binding argument)
	 * @param {string} direction Direction ("tl", "tr", "bl", "br", "lw", "th", "rw", "bh") (binding argument)
	 * @param {Object} plugin "core.context[currentPlugin]" object (binding argument)
	 * @param {MouseEvent} e Event object
	 */
	resizing_element: function (contextResizing, direction, plugin, e) {
		const clientX = e.clientX;
		const clientY = e.clientY;

		let resultW = plugin._element_w;
		let resultH = plugin._element_h;

		const w = plugin._element_w + (/r/.test(direction) ? clientX - contextResizing._resizeClientX : contextResizing._resizeClientX - clientX);
		const h = plugin._element_h + (/b/.test(direction) ? clientY - contextResizing._resizeClientY : contextResizing._resizeClientY - clientY);
		const wh = (plugin._element_h / plugin._element_w) * w;

		if (/t/.test(direction)) contextResizing.resizeDiv.style.top = plugin._element_h - (/h/.test(direction) ? h : wh) + 'px';
		if (/l/.test(direction)) contextResizing.resizeDiv.style.left = plugin._element_w - w + 'px';

		if (/r|l/.test(direction)) {
			contextResizing.resizeDiv.style.width = w + 'px';
			resultW = w;
		}

		if (/^(t|b)[^h]$/.test(direction)) {
			contextResizing.resizeDiv.style.height = wh + 'px';
			resultH = wh;
		} else if (/^(t|b)h$/.test(direction)) {
			contextResizing.resizeDiv.style.height = h + 'px';
			resultH = h;
		}

		contextResizing._resize_w = resultW;
		contextResizing._resize_h = resultH;
		domUtils.changeTxt(contextResizing.resizeDisplay, this._w.Math.round(resultW) + ' x ' + this._w.Math.round(resultH));
		contextResizing._isChange = true;
	},

	/**
	 * @description Resize the element to the size of the "div" adjusted in the "resizing_element" method.
	 * @param {string} direction Direction ("tl", "tr", "bl", "br", "lw", "th", "rw", "bh")
	 */
	cancel_controller_resize: function (direction) {
		const isVertical = this.context.resizing.isVertical;
		this.editor._offCurrentController();
		this.context.element.resizeBackground.style.display = 'none';

		let w = this._w.Math.round(isVertical ? this.context.resizing._resize_h : this.context.resizing._resize_w);
		let h = this._w.Math.round(isVertical ? this.context.resizing._resize_w : this.context.resizing._resize_h);

		if (!isVertical && !/%$/.test(w)) {
			const padding = 16;
			const limit = this.context.element.wysiwygFrame.clientWidth - padding * 2 - 2;

			if (numbers.get(w, 0) > limit) {
				h = this._w.Math.round((h / w) * limit);
				w = limit;
			}
		}

		const pluginName = this.context.resizing._resize_plugin;
		this.plugins[pluginName].setSize.call(this, w, h, false, direction);
		if (isVertical) this.plugins.resizing.setTransform.call(this, this.context[this.context.resizing._resize_plugin]._element, w, h);

		this.component.select(this.context[pluginName]._element, this.kind);
	}
};

function SetMenuAlign(item) {
	this.setAlign(this._element, item.getAttribute('data-command'));
	this.component.select(this._element, this.kind);
}

function OnMouseDown_resizingDot(e) {
	e.stopPropagation();
	e.preventDefault();

	const direction = (this._resize_direction = e.target.classList[0]);
	this._resizeClientX = e.clientX;
	this._resizeClientY = e.clientY;
	this.context.element.resizeBackground.style.display = 'block';
	this.resizeDiv.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';

	const closureFunc_bind = function closureFunc(e) {
		if (e.type === 'keydown' && e.keyCode !== 27) return;

		const change = this._isChange;
		this._isChange = false;

		this.eventManager.removeGlobalEvent('mousemove', resizing_element_bind);
		this.eventManager.removeGlobalEvent('mouseup', closureFunc_bind);
		this.eventManager.removeGlobalEvent('keydown', closureFunc_bind);

		if (e.type === 'keydown') {
			this.editor._offCurrentController();
			this.context.element.resizeBackground.style.display = 'none';
			this.plugins[this.context.resizing._resize_plugin].init.call(this);
		} else {
			// element resize
			this.plugins.resizing.cancel_controller_resize.call(this, direction);
			// history stack
			if (change) this.history.push(false);
		}
	}.bind(this);

	const resizing_element_bind = this.plugins.resizing.resizing_element.bind(this, this, direction, this.context[this._resize_plugin]);
	this.eventManager.addGlobalEvent('mousemove', resizing_element_bind);
	this.eventManager.addGlobalEvent('mouseup', closureFunc_bind);
	this.eventManager.addGlobalEvent('keydown', closureFunc_bind);
}

function CreateAlign(editor) {
	const icons = [editor.icons.align_justify, editor.icons.align_left, editor.icons.align_center, editor.icons.align_right];
	const langs = [editor.lang.modalBox.basic, editor.lang.modalBox.left, editor.lang.modalBox.center, editor.lang.modalBox.right];
	const commands = ['none', 'left', 'center', 'right'];
	const v = [];
	for (let i = 0; i < commands.length; i++) {
		v.push('<button type="button" class="se-btn-list se-tooltip" data-command="' + commands[i] + '">' + icons[i] + '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + langs[i] + '</span></span>' + '</button>');
	}

	return v;
}

function OffFigureContainer() {
	this.__containerGlobalEvent = this.eventManager.removeGlobalEvent(this.__containerGlobalEvent);
	domUtils.setDisabled(false, this.editor.resizingDisabledButtons);
	this.resizeContainer.style.display = 'none';
}

function OnClick_alignButton() {
	this.selectMenu_align.open();
}

function CreateHTML_resizeDot() {
	const html =
		'<div class="se-modal-resize"></div>' +
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
		'<button type="button" data-command="delete" class="se-btn se-tooltip">' +
		icons.delete +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.remove +
		'</span></span>' +
		'</button>' +
		'</div>';

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-resizing' }, html);
}

export default Figure;
