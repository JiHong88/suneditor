'use strict';

import EditorInterface from '../interface/editor';
import { Controller, SelectMenu } from '../modules';
import { domUtils, numbers } from '../helper';

const Figure = function (inst, controls) {
	EditorInterface.call(this, inst.editor);

	// create HTML
	const resizeDot = (this.resizeContainer = CreateHTML_resizeDot());
	const controllerEl = CreateHTML_controller(inst.editor, controls || []);

	// modules
	this.controller = new Controller(this, controllerEl, 'bottom');
	this.selectMenu_align = new SelectMenu(this, false, 'bottom-center');
	this.selectMenu_align.on(controllerEl.querySelector('._se_resizing_align_button'), SetMenuAlign.bind(this));
	this.selectMenu_align.create(CreateAlign(this));
	this.resizeDiv = resizeDot.querySelector('.se-modal-resize');
	this.resizeDisplay = resizeDot.querySelector('.se-resize-display');
	this.resizeHandles = resizeDot.querySelectorAll('.se-resize-dot > span');

	// members
	this.kind = inst.constructor;
	this.inst = inst;
	this.isVertical = false;
	this._element = null;
	this._floatClassRegExp = '__se__float\\-[a-z]+';

	// init
	this.context.element.relative.appendChild(resizeDot);
	this.eventManager.addEvent(this.resizeHandles, 'mousedown', OnMouseDown_resizingDot.bind(this));
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
	const cover = domUtils.getParentElement(element, 'FIGURE');
	return {
		container: domUtils.getParentElement(element, Figure.__isComponent),
		cover: cover,
		caption: cover ? domUtils.getEdgeChild(cover, 'FIGCAPTION') : null
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
		const contextPlugin = this.context[plugin];

		this.isVertical = /^(90|270)$/.test(Math.abs(target.getAttribute('data-rotate')).toString());
		const figure = Figure.GetContainer(target);
		const container = figure.container;
		const cover = figure.cover;
		const offset = this.offset.get(target);
		const w = this.isVertical ? target.offsetHeight : target.offsetWidth;
		const h = this.isVertical ? target.offsetWidth : target.offsetHeight;
		const t = offset.top;
		const l = offset.left - this.context.element.wysiwygFrame.scrollLeft;

		this.resizeContainer.style.top = t + 'px';
		this.resizeContainer.style.left = l + 'px';
		this.resizeContainer.style.width = w + 'px';
		this.resizeContainer.style.height = h + 'px';

		this.resizeDiv.style.top = '0px';
		this.resizeDiv.style.left = '0px';
		this.resizeDiv.style.width = w + 'px';
		this.resizeDiv.style.height = h + 'px';

		// text
		const displayX = this.plugins.resizing._module_getSizeX.call(this, contextPlugin, target, cover, container) || 'auto';
		const displayY = contextPlugin._onlyPercentage && plugin === 'image' ? '' : ', ' + (this.plugins.resizing._module_getSizeY.call(this, contextPlugin, target, cover, container) || 'auto');
		const align = target.getAttribute('data-align') || 'none';
		domUtils.changeTxt(this.resizeDisplay, this.lang.modalBox[align === 'none' ? 'basic' : align] + ' (' + displayX + displayY + ')');

		// resizing display
		this.resizeButtonGroup.style.display = contextPlugin._resizing ? '' : 'none';
		const resizeDotShow = contextPlugin._resizing && !contextPlugin._resizeDotHide && !contextPlugin._onlyPercentage ? 'flex' : 'none';
		const resizeHandles = this.resizeHandles;
		for (let i = 0, len = resizeHandles.length; i < len; i++) {
			resizeHandles[i].style.display = resizeDotShow;
		}

		if (contextPlugin._resizing) {
			const rotations = this.rotationButtons;
			rotations[0].style.display = rotations[1].style.display = contextPlugin._rotation ? '' : 'none';
		}

		// percentage active
		const pButtons = this.percentageButtons;
		const value = /%$/.test(target.style.width) && /%$/.test(container.style.width) ? numbers.get(container.style.width, 0) / 100 + '' : '';
		for (let i = 0, len = pButtons.length; i < len; i++) {
			if (pButtons[i].getAttribute('data-value') === value) {
				domUtils.addClass(pButtons[i], 'active');
			} else {
				domUtils.removeClass(pButtons[i], 'active');
			}
		}

		// caption display, active
		if (!contextPlugin._captionShow) {
			this.captionButton.style.display = 'none';
		} else {
			this.captionButton.style.display = '';
			if (domUtils.getEdgeChild(target.parentNode, 'figcaption')) {
				domUtils.addClass(this.captionButton, 'active');
				contextPlugin._captionChecked = true;
			} else {
				domUtils.removeClass(this.captionButton, 'active');
				contextPlugin._captionChecked = false;
			}
		}

		this.resizeContainer.style.display = 'block';

		const addOffset = { left: 0, top: 50 };
		if (this.options.iframe) {
			addOffset.left -= this.context.element.wysiwygFrame.parentElement.offsetLeft;
			addOffset.top -= this.context.element.wysiwygFrame.parentElement.offsetTop;
		}

		this.controller.open(this.resizeContainer);
		domUtils.setDisabled(true, this.resizingDisabledButtons);

		this._resize_w = w;
		this._resize_h = h;

		const originSize = (target.getAttribute('data-origin-size') || '').split(',');
		this._origin_w = originSize[0] || target.naturalWidth;
		this._origin_h = originSize[1] || target.naturalHeight;

		return {
			w: w,
			h: h,
			t: t,
			l: l
		};
	},

	/**
	 * @description Gets the width size
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 * @param {Element} element Target element
	 * @param {Element} cover Cover element (FIGURE)
	 * @param {Element} container Container element (DIV.se-component)
	 * @returns {string}
	 */
	_module_getSizeX: function (contextPlugin, element, cover, container) {
		if (!element) element = contextPlugin._element;
		if (!cover) cover = contextPlugin._cover;
		if (!container) container = contextPlugin._container;

		if (!element) return '';

		return !/%$/.test(element.style.width) ? element.style.width : ((container && numbers.get(container.style.width, 2)) || 100) + '%';
	},

	/**
	 * @description Gets the height size
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 * @param {Element} element Target element
	 * @param {Element} cover Cover element (FIGURE)
	 * @param {Element} container Container element (DIV.se-component)
	 * @returns {string}
	 */
	_module_getSizeY: function (contextPlugin, element, cover, container) {
		if (!element) element = contextPlugin._element;
		if (!cover) cover = contextPlugin._cover;
		if (!container) container = contextPlugin._container;

		if (!container || !cover) return (element && element.style.height) || '';

		return numbers.get(cover.style.paddingBottom, 0) > 0 && !this.context.resizing.isVertical ? cover.style.height : !/%$/.test(element.style.height) || !/%$/.test(element.style.width) ? element.style.height : ((container && numbers.get(container.style.height, 2)) || 100) + '%';
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
			cover.style.width = this.figure.isVertical ? target.style.height || target.offsetHeight : !target.style.width || target.style.width === 'auto' ? '' : target.style.width || '100%';
		}

		if (!domUtils.hasClass(container, '__se__float-' + align)) {
			domUtils.removeClass(container, this._floatClassRegExp);
			domUtils.addClass(container, '__se__float-' + align);
		}

		target.setAttribute('data-align', align);
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction: function (target) {
		const command = target.getAttribute('data-command');
		this.inst.figureAction(target, command, target.getAttribute('data-value'));
		if (!/edit|remove/.test(command)) this.component.select(this._element);

		if (typeof this.plugins.resizing._closeAlignMenu === 'function') {
			this.plugins.resizing._closeAlignMenu();
			if (command === 'onalign') return;
		}

		switch (command) {
			case 'auto':
				this.plugins.resizing.resetTransform.call(this, contextEl);
				currentModule.setAutoSize.call(this);
				this.component.select(this._element);
				break;
			case 'resize_percent':
				let percentY = this.plugins.resizing._module_getSizeY.call(this, currentContext);
				if (this.context.resizing.isVertical) {
					const percentage = contextEl.getAttribute('data-percentage');
					if (percentage) percentY = percentage.split(',')[1];
				}

				this.plugins.resizing.resetTransform.call(this, contextEl);
				currentModule.setPercentSize.call(this, value * 100, numbers.get(percentY, 0) === null || !/%$/.test(percentY) ? '' : percentY);
				this.component.select(this._element);
				break;
			case 'mirror':
				const r = contextEl.getAttribute('data-rotate') || '0';
				let x = contextEl.getAttribute('data-rotateX') || '';
				let y = contextEl.getAttribute('data-rotateY') || '';

				if ((value === 'h' && !this.context.resizing.isVertical) || (value === 'v' && this.context.resizing.isVertical)) {
					y = y ? '' : '180';
				} else {
					x = x ? '' : '180';
				}

				contextEl.setAttribute('data-rotateX', x);
				contextEl.setAttribute('data-rotateY', y);

				this.plugins.resizing._setTransForm(contextEl, r, x, y);
				break;
			case 'rotate':
				const contextResizing = this.context.resizing;
				const slope = contextEl.getAttribute('data-rotate') * 1 + value * 1;
				const deg = this._w.Math.abs(slope) >= 360 ? 0 : slope;

				contextEl.setAttribute('data-rotate', deg);
				contextResizing.isVertical = /^(90|270)$/.test(this._w.Math.abs(deg).toString());
				this.plugins.resizing.setTransformSize.call(this, contextEl, null, null);

				this.component.select(this._element);
				break;
			case 'onalign':
				this.plugins.resizing.openAlignMenu.call(this);
				return;
			case 'align':
				currentModule.setAlign.call(this, value, null, null, null);
				this.component.select(this._element);
				break;
			case 'caption':
				const caption = !currentContext._captionChecked;
				currentModule.openModify.call(this, true);
				currentContext._captionChecked = currentContext.captionCheckEl.checked = caption;

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
					this.component.select(this._element);
					currentModule.openModify.call(this, true);
				}

				break;
			case 'revert':
				currentModule.setOriginSize.call(this);
				this.component.select(this._element);
				break;
		}

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
        _container: null,
        _cover: null,
        _element: null,
        _element_w: 1,
        _element_h: 1,
        _element_l: 0,
        _element_t: 0,
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
        _captionShow: true,
        // -- when used caption (_captionShow: true) --
        _caption: null,
        _captionChecked: false,
        captionCheckEl: null,
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

		context.resizing.resizeButton = controllerEl;

		context.resizing.resizeButtonGroup = controllerEl.querySelector('._se_resizing_btn_group');
		context.resizing.rotationButtons = controllerEl.querySelectorAll('._se_resizing_btn_group ._se_rotation');
		context.resizing.percentageButtons = controllerEl.querySelectorAll('._se_resizing_btn_group ._se_percentage');

		context.resizing.alignMenu = controllerEl.querySelector('.se-resizing-align-list');
		context.resizing.alignMenuList = context.resizing.alignMenu.querySelectorAll('button');

		context.resizing.alignButton = controllerEl.querySelector('._se_resizing_align_button');
		context.resizing.autoSizeButton = controllerEl.querySelector('._se_resizing_btn_group ._se_auto_size');
		context.resizing.captionButton = controllerEl.querySelector('._se_resizing_caption_button');
	},

	/**
	 * @description Called at the "openModify" to put the size of the current target into the size input element.
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 * @param {Object} pluginObj Plugin object
	 */
	_module_setModifyInputSize: function (contextPlugin, pluginObj) {
		const percentageRotation = contextPlugin._onlyPercentage && this.context.resizing.isVertical;
		contextPlugin.proportion.checked = contextPlugin._proportionChecked = contextPlugin._element.getAttribute('data-proportion') !== 'false';

		let x = percentageRotation ? '' : this.plugins.resizing._module_getSizeX.call(this, contextPlugin);
		if (x === contextPlugin._defaultSizeX) x = '';
		if (contextPlugin._onlyPercentage) x = numbers.get(x, 2);
		contextPlugin.inputX.value = x;
		pluginObj.setInputSize.call(this, 'x');

		if (!contextPlugin._onlyPercentage) {
			let y = percentageRotation ? '' : this.plugins.resizing._module_getSizeY.call(this, contextPlugin);
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
	 * @description Save the size data (element.setAttribute("data-size"))
	 * Used at the "setSize" method
	 * @param {Object} contextPlugin context object of plugin (core.context[plugin])
	 */
	_module_saveCurrentSize: function (contextPlugin) {
		const x = this.plugins.resizing._module_getSizeX.call(this, contextPlugin);
		const y = this.plugins.resizing._module_getSizeY.call(this, contextPlugin);
		contextPlugin._element.setAttribute('data-size', x + ',' + y);
		if (!!contextPlugin._videoRatio) contextPlugin._videoRatio = y;
	},

	_closeAlignMenu: null,

	/**
	 * @description Open align dropdown of module
	 */
	openAlignMenu: function () {
		const alignButton = this.context.resizing.alignButton;
		domUtils.addClass(alignButton, 'on');
		this.context.resizing.alignMenu.style.top = alignButton.offsetTop + alignButton.offsetHeight + 'px';
		this.context.resizing.alignMenu.style.left = alignButton.offsetLeft - alignButton.offsetWidth / 2 + 'px';
		this.context.resizing.alignMenu.style.display = 'block';

		this.plugins.resizing._closeAlignMenu = function () {
			domUtils.removeClass(this.context.resizing.alignButton, 'on');
			this.context.resizing.alignMenu.style.display = 'none';
			this.eventManager.removeGlobalEvent('click', this.plugins.resizing._closeAlignMenu);
			this.plugins.resizing._closeAlignMenu = null;
		}.bind(this);

		this.eventManager.addGlobalEvent('click', this.plugins.resizing._closeAlignMenu);
	},

	/**
	 * @description Initialize the transform style (rotation) of the element.
	 * @param {Element} element Target element
	 */
	resetTransform: function (element) {
		const size = (element.getAttribute('data-size') || element.getAttribute('data-origin') || '').split(',');
		this.context.resizing.isVertical = false;

		element.style.maxWidth = '';
		element.style.transform = '';
		element.style.transformOrigin = '';
		element.setAttribute('data-rotate', '');
		element.setAttribute('data-rotateX', '');
		element.setAttribute('data-rotateY', '');

		this.plugins[this.context.resizing._resize_plugin].setSize.call(this, size[0] ? size[0] : 'auto', size[1] ? size[1] : '', true);
	},

	/**
	 * @description Set the transform style (rotation) of the element.
	 * @param {Element} element Target element
	 * @param {Number|null} width Element's width size
	 * @param {Number|null} height Element's height size
	 */
	setTransformSize: function (element, width, height) {
		let percentage = element.getAttribute('data-percentage');
		const isVertical = this.context.resizing.isVertical;
		const deg = element.getAttribute('data-rotate') * 1;
		let transOrigin = '';

		if (percentage && !isVertical) {
			percentage = percentage.split(',');
			if (percentage[0] === 'auto' && percentage[1] === 'auto') {
				this.plugins[this.context.resizing._resize_plugin].setAutoSize.call(this);
			} else {
				this.plugins[this.context.resizing._resize_plugin].setPercentSize.call(this, percentage[0], percentage[1]);
			}
		} else {
			const cover = domUtils.getParentElement(element, 'FIGURE');

			const offsetW = width || element.offsetWidth;
			const offsetH = height || element.offsetHeight;
			const w = (isVertical ? offsetH : offsetW) + 'px';
			const h = (isVertical ? offsetW : offsetH) + 'px';

			this.plugins[this.context.resizing._resize_plugin].cancelPercentAttr.call(this);
			this.plugins[this.context.resizing._resize_plugin].setSize.call(this, offsetW + 'px', offsetH + 'px', true);

			cover.style.width = w;
			cover.style.height = !!this.context[this.context.resizing._resize_plugin]._caption ? '' : h;

			if (isVertical) {
				let transW = offsetW / 2 + 'px ' + offsetW / 2 + 'px 0';
				let transH = offsetH / 2 + 'px ' + offsetH / 2 + 'px 0';
				transOrigin = deg === 90 || deg === -270 ? transH : transW;
			}
		}

		element.style.transformOrigin = transOrigin;
		this.plugins.resizing._setTransForm(element, deg.toString(), element.getAttribute('data-rotateX') || '', element.getAttribute('data-rotateY') || '');

		if (isVertical) element.style.maxWidth = 'none';
		else element.style.maxWidth = '';

		this.plugins.resizing.setCaptionPosition.call(this, element);
	},

	_setTransForm: function (element, r, x, y) {
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
	 * @description The position of the caption is set automatically.
	 * @param {Element} element Target element (not caption element)
	 */
	setCaptionPosition: function (element) {
		const figcaption = domUtils.getEdgeChild(domUtils.getParentElement(element, 'FIGURE'), 'FIGCAPTION');
		if (figcaption) {
			figcaption.style.marginTop = (this.context.resizing.isVertical ? element.offsetWidth - element.offsetHeight : 0) + 'px';
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
		if (isVertical) this.plugins.resizing.setTransformSize.call(this, this.context[this.context.resizing._resize_plugin]._element, w, h);

		this.component.select(this.context[pluginName]._element, pluginName);
	}
};

function SetMenuAlign(item) {
	this.setAlign(this._element, item.getAttribute('data-command'));
	this.component.select(this._element);
}

function OnMouseDown_resizingDot(e) {
	e.stopPropagation();
	e.preventDefault();

	const direction = (this._resize_direction = e.target.classList[0]);
	this._resizeClientX = e.clientX;
	this._resizeClientY = e.clientY;
	this.context.element.resizeBackground.style.display = 'block';
	this.resizeButton.style.display = 'none';
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
		'<div class="se-btn-group _se_resizing_btn_group">' +
		'<button type="button" data-command="resize_percent" data-value="1" class="se-tooltip _se_percentage">' +
		'<span>100%</span>' +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.resize100 +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="resize_percent" data-value="0.75" class="se-tooltip _se_percentage">' +
		'<span>75%</span>' +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.resize75 +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="resize_percent" data-value="0.5" class="se-tooltip _se_percentage">' +
		'<span>50%</span>' +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.resize50 +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="auto" class="se-btn se-tooltip _se_auto_size">' +
		icons.auto_size +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.autoSize +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="rotate" data-value="-90" class="se-btn se-tooltip _se_rotation">' +
		icons.rotate_left +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.controller.rotateLeft +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="rotate" data-value="90" class="se-btn se-tooltip _se_rotation">' +
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
		'<button type="button" data-command="onalign" class="se-btn se-tooltip _se_resizing_align_button">' +
		icons.align_justify +
		'<span class="se-tooltip-inner"><span class="se-tooltip-text">' +
		lang.toolbar.align +
		'</span></span>' +
		'</button>' +
		'<button type="button" data-command="caption" class="se-btn se-tooltip _se_resizing_caption_button">' +
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
