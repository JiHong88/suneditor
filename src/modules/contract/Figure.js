import CoreInjector from '../../editorInjector/_core';
import Controller from './Controller';
import SelectMenu from '../ui/SelectMenu';
import { _DragHandle } from '../ui/_DragHandle';
import { dom, numbers, env, converter, keyCodeMap } from '../../helper';

const { _w, ON_OVER_COMPONENT } = env;
const DIRECTION_CURSOR_MAP = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize', lw: 'ew-resize', th: 'ns-resize', rw: 'ew-resize', bh: 'ns-resize' };
const DIR_DIAGONAL = 'tl|bl|tr|br';
const DIR_W = 'lw|rw';
let __resizing_p_wh = false;
let __resizing_p_ow = false;
let __resizing_cw = 0;
let __resizing_sw = 0;

/**
 * Figure information object
 * @typedef {Object} FigureInfo
 * @property {HTMLElement} target - Target element (img, iframe, video, audio, table, etc.)
 * @property {HTMLElement} container - Container element (div.se-component|span.se-component.se-inline-component)
 * @property {?HTMLElement} cover - Cover element (FIGURE|null)
 * @property {?HTMLElement} inlineCover - Inline cover element (span.se-inline-component)
 * @property {?HTMLElement} caption - Caption element (FIGCAPTION)
 * @property {boolean} isVertical - Whether to rotate vertically
 */

/**
 * Figure target information object (for resize/align operations)
 * @typedef {Object} FigureTargetInfo
 * @property {HTMLElement} container - Container element (div.se-component|span.se-component.se-inline-component)
 * @property {?HTMLElement} [cover] - Cover element (FIGURE|null)
 * @property {?HTMLElement} [caption] - Caption element (FIGCAPTION)
 * @property {string} [align] - Alignment of the element.
 * @property {{w:number, h:number}} [ratio] - The aspect ratio of the element.
 * @property {boolean} isVertical - Whether to rotate vertically
 * @property {string|number} [w] - Width of the element.
 * @property {string|number} [h] - Height of the element.
 * @property {number} [t] - Top position.
 * @property {number} [l] - Left position.
 * @property {string|number} width - Width, can be a number or 'auto'.
 * @property {string|number} height - Height, can be a number or 'auto'.
 * @property {number} [originWidth] - Original width from `naturalWidth` or `offsetWidth`.
 * @property {number} [originHeight] - Original height from `naturalHeight` or `offsetHeight`.
 */

/**
 * Figure control button type
 * @typedef {"mirror_h" | "mirror_v" | "rotate_l" | "rotate_r" | "caption" | "revert" | "edit" | "copy" | "remove" | "as" | "align" | "onalign" | "onresize"} FigureControlButton
 */

/**
 * Figure control resize value type (auto, or percentage numbers)
 * @typedef {`resize_auto,${number}` | `resize_auto,${number},${number}` | `resize_auto,${number},${number},${number}` | `resize_auto,${number},${number},${number},${number}`} FigureControlResize
 */

/**
 * Figure control custom action object
 * @typedef {{
 *   action: (element: Node, value: string, target: Node) => void,
 *   command: string,
 *   value: string,
 *   title: string,
 *   icon: string
 * }} ControlCustomAction
 */

/**
 * Figure controls configuration
 * 2D array of control buttons for the figure component toolbar
 *
 * **Available control buttons**:
 * - `"mirror_h"`: Mirror horizontally
 * - `"mirror_v"`: Mirror vertically
 * - `"rotate_l"`: Rotate left (-90°)
 * - `"rotate_r"`: Rotate right (90°)
 * - `"caption"`: Toggle caption (FIGCAPTION)
 * - `"revert"`: Revert to original size
 * - `"edit"`: Open edit modal
 * - `"copy"`: Copy component
 * - `"remove"`: Remove component
 * - `"as"`: Format type (block/inline) - requires `useFormatType` option
 * - `"align"`: Alignment (none/left/center/right)
 * - `"onalign"`: Alignment button (opens alignment menu)
 * - `"onresize"`: Resize button (opens resize menu)
 * - `"resize_auto,50,75,100"`: Auto-resize with percentage values (e.g., "resize_auto,100,75,50")
 * - Custom action object with action, command, value, title, icon
 *
 * @example
 * // Basic controls
 * [['mirror_h', 'mirror_v', 'align', 'caption', 'edit', 'copy', 'remove']]
 *
 * @example
 * // Multi-row controls with resize options
 * [
 *   ['as', 'resize_auto,100,75,50', 'rotate_l', 'rotate_r', 'mirror_h', 'mirror_v'],
 *   ['edit', 'align', 'caption', 'revert', 'copy', 'remove']
 * ]
 *
 * @typedef {Array<Array<FigureControlButton | FigureControlResize | ControlCustomAction | string>>} FigureControls
 */

// -------------------------------------------------------------------------------------------------------------------------

/**
 * @typedef {Object} FigureParams
 * @property {string} [sizeUnit="px"] Size unit
 * @property {{ current: string, default: string }} [autoRatio=null] Auto ratio { current: '00%', default: '00%' }
 */

/**
 * @class
 * @description Figure module class for handling resizable/alignable components (images, videos, iframes, etc.)
 * @see EditorComponent for `inst._element` requirement
 */
class Figure extends CoreInjector {
	#offContainer;
	#containerResizingESC;

	#width = '';
	#height = '';
	#resize_w = 0;
	#resize_h = 0;
	#element_w = 0;
	#element_h = 0;
	#floatClassStr = '__se__float-none|__se__float-left|__se__float-center|__se__float-right';
	#preventSizechange = false;
	#revertSize = { w: '', h: '' };
	#onResizeESCEvent = null;

	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {FigureControls} controls Controller button array
	 * @param {FigureParams} params Figure options
	 */
	constructor(inst, controls, params) {
		super(inst.editor);
		this.kind = inst.constructor.key || inst.constructor.name;
		this._alignIcons = {
			none: this.icons.format_float_none,
			left: this.icons.format_float_left,
			right: this.icons.format_float_right,
			center: this.icons.format_float_center,
		};

		// modules
		/** @type {Object<string, *>} */
		this._action = {};

		const controllerEl = CreateHTML_controller(this, controls || []);
		this.controller = controllerEl ? new Controller(this, controllerEl, { position: 'bottom', disabled: true }, this.kind) : null;

		if (controllerEl) {
			// align selectmenu
			this.alignButton = controllerEl.querySelector('[data-command="onalign"]');
			const alignMenus = CreateAlign(this, this.alignButton);
			if (alignMenus) {
				this.selectMenu_align = new SelectMenu(this.editor, { checkList: false, position: 'bottom-center' });
				this.selectMenu_align.on(this.alignButton, this.#SetMenuAlign.bind(this), { class: 'se-figure-select-list' });
				this.selectMenu_align.create(alignMenus.items, alignMenus.html);
			}
			// as [block, inline] selectmenu
			this.asButton = controllerEl.querySelector('[data-command="onas"]');
			const asMenus = CreateAs(this, this.asButton);
			if (asMenus) {
				this.selectMenu_as = new SelectMenu(this.editor, { checkList: false, position: 'bottom-center' });
				this.selectMenu_as.on(this.asButton, this.#SetMenuAs.bind(this), { class: 'se-figure-select-list' });
				this.selectMenu_as.create(asMenus.items, asMenus.html);
			}
			// resize selectmenu
			this.resizeButton = controllerEl.querySelector('[data-command="onresize"]');
			const resizeMenus = CreateResize(this, this.resizeButton);
			if (resizeMenus) {
				this.selectMenu_resize = new SelectMenu(this.editor, { checkList: false, position: 'bottom-left', dir: 'ltr' });
				this.selectMenu_resize.on(this.resizeButton, this.#SetResize.bind(this));
				this.selectMenu_resize.create(resizeMenus.items, resizeMenus.html);
			}
		}

		// members
		this.inst = inst;
		this.sizeUnit = params.sizeUnit || 'px';
		this.autoRatio = params.autoRatio;
		this.isVertical = false;
		this.percentageButtons = controllerEl?.querySelectorAll('[data-command="resize_percent"]') || [];
		this.captionButton = controllerEl?.querySelector('[data-command="caption"]');
		this.align = 'none';
		this.as = 'block';
		/** @type {{left?: number, top?: number}} */
		this.__offset = {};
		this._element = null;
		this._cover = null;
		this._inlineCover = null;
		this._container = null;
		this._caption = null;
		this._resizeClientX = 0;
		this._resizeClientY = 0;
		this._resize_direction = '';
		this.__containerResizingOff = this.#ContainerResizingOff.bind(this);
		this.__containerResizing = this.#ContainerResizing.bind(this);
		this.__onContainerEvent = null;
		this.__offContainerEvent = null;

		this.#offContainer = this.#OffFigureContainer.bind(this);
		this.#containerResizingESC = this.#ContainerResizingESC.bind(this);

		// init
		this.eventManager.addEvent(this.alignButton, 'click', this.#OnClick_alignButton.bind(this));
		this.eventManager.addEvent(this.asButton, 'click', this.#OnClick_asButton.bind(this));
		this.eventManager.addEvent(this.resizeButton, 'click', this.#OnClick_resizeButton.bind(this));
		this.contextManager.applyToRoots((e) => {
			if (!e.get('wrapper').querySelector('.se-controller.se-resizing-container')) {
				// resizing
				const main = CreateHTML_resizeDot();
				const handles = main.querySelectorAll('.se-resize-dot > span');
				e.set('_figure', {
					main: main,
					border: main.querySelector('.se-resize-dot'),
					display: main.querySelector('.se-resize-display'),
					handles: handles,
				});
				e.get('wrapper').appendChild(main);
				this.eventManager.addEvent(handles, 'mousedown', this.#OnResizeContainer.bind(this));
			}
		});
	}

	/**
	 * @description Create a container for the resizing component and insert the element.
	 * @param {Node} element Target element
	 * @param {string} [className] Class name of container (fixed: se-component)
	 * @returns {FigureInfo} {target, container, cover, inlineCover, caption}
	 */
	static CreateContainer(element, className) {
		dom.utils.createElement('DIV', { class: 'se-component' + (className ? ' ' + className : '') }, dom.utils.createElement('FIGURE', null, element));
		return Figure.GetContainer(element);
	}

	/**
	 * @description Create a container for the inline resizing component and insert the element.
	 * @param {Node} element Target element
	 * @param {string} [className] Class name of container (fixed: se-component se-inline-component)
	 * @returns {FigureInfo} {target, container, cover, inlineCover, caption}
	 */
	static CreateInlineContainer(element, className) {
		dom.utils.createElement('SPAN', { class: 'se-component se-inline-component' + (className ? ' ' + className : '') }, element);
		return Figure.GetContainer(element);
	}

	/**
	 * @description Return HTML string of caption(FIGCAPTION) element
	 * @param {Node} cover Cover element(FIGURE). "CreateContainer().cover"
	 * @returns {HTMLElement} caption element
	 */
	static CreateCaption(cover, text) {
		const caption = dom.utils.createElement('FIGCAPTION', null, '<div>' + text + '</div>');
		cover.appendChild(caption);
		return caption;
	}

	/**
	 * @description Get the element's container(.se-component) info.
	 * @param {Node} element Target element
	 * @returns {FigureInfo} {target, container, cover, inlineCover, caption}
	 */
	static GetContainer(element) {
		const cover = dom.query.getParentElement(element, 'FIGURE', 2);
		const inlineCover = dom.query.getParentElement(element, 'SPAN', 2);
		const anyCover = cover || inlineCover;
		const target = dom.query.getParentElement(element, (current) => current.parentElement === anyCover, 0) || /** @type {HTMLElement} */ (element);

		return {
			target,
			container: dom.query.getParentElement(target, Figure.is, 3) || cover,
			cover: cover,
			inlineCover: dom.utils.hasClass(inlineCover, 'se-inline-component') ? /** @type {HTMLElement} */ (inlineCover) : null,
			caption: dom.query.getEdgeChild(target.parentElement, 'FIGCAPTION', false),
			isVertical: IsVertical(target),
		};
	}

	/**
	 * @description Ratio calculation
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 * @param {?string} [defaultSizeUnit="px"] Default size unit (default: "px")
	 * @return {{w: number, h: number}}
	 */
	static GetRatio(w, h, defaultSizeUnit) {
		let rw = 0,
			rh = 0;
		if (/\d+/.test(w + '') && /\d+/.test(h + '')) {
			const xUnit = (!numbers.is(w) && String(w).replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
			const yUnit = (!numbers.is(h) && String(h).replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
			if (xUnit === yUnit) {
				const w_number = numbers.get(w, 4);
				const h_number = numbers.get(h, 4);
				rw = w_number / h_number;
				rh = h_number / w_number;
			}
		}

		return {
			w: numbers.get(rw, 4),
			h: numbers.get(rh, 4),
		};
	}

	/**
	 * @description Ratio calculation
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 * @param {string} defaultSizeUnit Default size unit (default: "px")
	 * @param {?{w: number, h: number}} [ratio] Ratio size (Figure.GetRatio)
	 * @return {{w: string|number, h: string|number}}
	 */
	static CalcRatio(w, h, defaultSizeUnit, ratio) {
		if (ratio?.w && ratio?.h && /\d+/.test(w + '') && /\d+/.test(h + '')) {
			const xUnit = (!numbers.is(w) && String(w).replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
			const yUnit = (!numbers.is(h) && String(h).replace(/\d+|\./g, '')) || defaultSizeUnit || 'px';
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
			h: h,
		};
	}

	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element Target element
	 * @returns {boolean}
	 */
	static is(element) {
		return dom.check.isComponentContainer(element) || /^(HR)$/.test(element?.nodeName);
	}

	get #component() {
		return this.editor.component;
	}

	get #offset() {
		return this.editor.offset;
	}

	get #selection() {
		return this.editor.selection;
	}

	get #html() {
		return this.editor.html;
	}

	get #format() {
		return this.editor.format;
	}

	get #nodeTransform() {
		return this.editor.nodeTransform;
	}

	/**
	 * @description Close the figure's controller
	 */
	close() {
		this.editor._preventBlur = false;
		dom.utils.removeClass(this._cover, 'se-figure-selected');
		this.#component.__removeDragEvent();
		this.#removeGlobalEvents();
		this.controller?.close();
	}

	/**
	 * @description Open the figure's controller
	 * @param {Node} targetNode Target element
	 * @param {Object} params params
	 * @param {boolean} [params.nonResizing=false] Do not display the resizing button
	 * @param {boolean} [params.nonSizeInfo=false] Do not display the size information
	 * @param {boolean} [params.nonBorder=false] Do not display the selected style line
	 * @param {boolean} [params.figureTarget=false] If true, the target is a figure element
	 * @param {boolean} [params.infoOnly=false] If true, returns only the figure target info without opening the controller
	 * @returns {FigureTargetInfo|undefined} figure target info
	 */
	open(targetNode, { nonResizing, nonSizeInfo, nonBorder, figureTarget, infoOnly }) {
		if (!targetNode) {
			console.warn('[SUNEDITOR.modules.Figure.open] The "targetNode" is null.');
			return;
		}

		if (_DragHandle.get('__overInfo') === ON_OVER_COMPONENT) {
			nonBorder = true;
		}

		const figureInfo = Figure.GetContainer(targetNode);
		const target = figureInfo.target;
		let exceptionFormat = false;
		if (!figureInfo.container) {
			if (!this.options.get('strictMode').formatFilter) {
				figureInfo.container = target;
				figureInfo.cover = target;
				exceptionFormat = true;
			} else {
				return {
					container: null,
					cover: null,
					width: target.style.width || /** @type {HTMLImageElement} */ (target).width || '',
					height: target.style.height || /** @type {HTMLImageElement} */ (target).height || '',
					isVertical: this.isVertical,
				};
			}
		}

		_DragHandle.set('__figureInst', this);

		this.#setFigureInfo(figureInfo);

		const sizeTarget = /** @type {HTMLElement} */ (figureTarget ? this._cover || this._container || target : target);
		const w = sizeTarget.offsetWidth || null;
		const h = sizeTarget.offsetHeight || null;
		const { top, left, scrollX, scrollY } = this.#offset.getLocal(sizeTarget);

		const dataSize = (target.getAttribute('data-se-size') || '').split(',');

		let rw = numbers.get(target.style.width, 2) || w;
		let rh = numbers.get(target.style.height, 2) || h;
		if (this.isVertical) [rw, rh] = [rh, rw];
		const ratio = Figure.GetRatio(rw, rh, this.sizeUnit);

		const targetInfo = {
			container: figureInfo.container,
			cover: figureInfo.cover,
			caption: figureInfo.caption,
			align: this.align,
			ratio: ratio,
			isVertical: this.isVertical,
			w: w || '',
			h: h || '',
			t: top,
			l: left,
			width: dataSize[0] || 'auto',
			height: dataSize[1] || 'auto',
			originWidth: /** @type {HTMLImageElement} */ (target).naturalWidth || target.offsetWidth,
			originHeight: /** @type {HTMLImageElement} */ (target).naturalHeight || target.offsetHeight,
		};

		this.#width = targetInfo.width;
		this.#height = targetInfo.height;
		if (infoOnly) return targetInfo;

		const _figure = this.frameContext.get('_figure');
		this.uiManager.setFigureContainer(_figure.main);
		this.uiManager.opendControllers = this.uiManager.opendControllers.filter((c) => c.form !== _figure.main);

		_figure.main.style.top = top + 'px';
		_figure.main.style.left = left + 'px';
		_figure.main.style.width = (this.isVertical ? h : w) + 'px';
		_figure.main.style.height = (this.isVertical ? w : h) + 'px';
		_figure.border.style.top = '0px';
		_figure.border.style.left = '0px';
		_figure.border.style.width = (this.isVertical ? h : w) + 'px';
		_figure.border.style.height = (this.isVertical ? w : h) + 'px';

		this.__offset = { left: left + scrollX, top: top + scrollY };

		this.uiManager.opendControllers.push({
			position: 'none',
			form: _figure.main,
			target: sizeTarget,
			inst: this,
			notInCarrier: true,
		});

		// percentage active
		const value = /%$/.test(target.style.width) && /%$/.test(figureInfo.container.style.width) ? numbers.get(figureInfo.container.style.width, 0) / 100 + '' : '';
		for (let i = 0, len = this.percentageButtons.length; i < len; i++) {
			if (this.percentageButtons[i].getAttribute('data-value') === value) {
				dom.utils.addClass(this.percentageButtons[i], 'active');
			} else {
				dom.utils.removeClass(this.percentageButtons[i], 'active');
			}
		}

		// caption active
		if (this.captionButton) {
			if (figureInfo.caption) {
				dom.utils.addClass(this.captionButton, 'active');
			} else {
				dom.utils.removeClass(this.captionButton, 'active');
			}
		}

		_figure.display.style.display = nonSizeInfo || this._inlineCover ? 'none' : '';
		_figure.border.style.display = nonBorder ? 'none' : '';
		_figure.main.style.display = 'block';

		if (_DragHandle.get('__overInfo') !== ON_OVER_COMPONENT) {
			// resize handles
			const displayType = nonResizing ? 'none' : 'flex';
			const resizeHandles = _figure.handles;
			for (let i = 0, len = resizeHandles.length; i < len; i++) {
				resizeHandles[i].style.display = displayType;
			}

			if (this.controller) {
				// size display
				const size = this.getSize(target);
				dom.utils.changeTxt(_figure.display, this.lang[this.align === 'none' ? 'basic' : this.align] + ' (' + size.dw + ', ' + size.dh + ')');

				// align button
				this.#setAlignIcon();
				// as button
				this.#setAsIcon();
				this.uiManager._visibleControllers(true, true);

				// rotate, aption, align, onresize - display;
				const transformButtons = this.controller.form.querySelectorAll(
					'[data-command="rotate"][data-value="90"], [data-command="rotate"][data-value="-90"], [data-command="caption"], [data-command="onalign"], [data-command="onresize"]',
				);
				const display = this._inlineCover || exceptionFormat ? 'none' : '';
				transformButtons?.forEach((button) => {
					/** @type {HTMLButtonElement} */ (button).style.display = display;
				});
				// onas
				const onas = this.controller.form.querySelector('[data-command="onas"]');
				if (onas) {
					/** @type {HTMLButtonElement} */ (onas).style.display = exceptionFormat ? 'none' : '';
				}
			}

			// selecte
			dom.utils.removeClass(this._cover, 'se-figure-over-selected');
			this.controller?.open(_figure.main, null, { initMethod: this.#offContainer, isWWTarget: false, addOffset: null });
			_w.setTimeout(() => _DragHandle.set('__overInfo', false), 0);
		} else {
			dom.utils.addClass(this._cover, 'se-figure-over-selected');
		}

		// set members
		dom.utils.addClass(this._cover, 'se-figure-selected');
		this.#element_w = this.#resize_w = w;
		this.#element_h = this.#resize_h = h;

		// drag
		if (!this._inlineCover && (_DragHandle.get('__overInfo') !== ON_OVER_COMPONENT || dom.utils.hasClass(figureInfo.container, 'se-input-component'))) {
			this.#setDragEvent(_figure.main);
		}

		return targetInfo;
	}

	/**
	 * @description Hide the controller
	 */
	controllerHide() {
		this.controller?.hide();
	}

	/**
	 * @description Hide the controller
	 */
	controllerShow() {
		this.controller?.show();
	}

	/**
	 * @description Open the figure's controller
	 * @param {Node} target Target element
	 * @param {Object} [params={}] params
	 * @param {boolean} [params.isWWTarget] If the controller is in the WYSIWYG area, set it to true.
	 * @param {() => void} [params.initMethod] Method to be called when the controller is closed.
	 * @param {boolean} [params.disabled] If true, the controller is disabled.
	 * @param {{left: number, top: number}} [params.addOffset] Additional offset values
	 */
	controllerOpen(target, params) {
		this._element = /** @type {HTMLElement}  */ (target);
		this.controller?.open(target, null, params);
	}

	/**
	 * @description Set the element's container size
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 */
	setFigureSize(w, h) {
		if (/%$/.test(w + '')) {
			this._setPercentSize(w, h);
		} else if ((!w || w === 'auto') && (!h || h === 'auto')) {
			if (this.autoRatio) this._setPercentSize(100, this.autoRatio.default || this.autoRatio.current);
			else this._setAutoSize();
		} else {
			this._applySize(w, h, '');
		}
	}

	/**
	 * @description Set the element's container size from plugins input value
	 * @param {string|number} w Width size
	 * @param {string|number} h Height size
	 */
	setSize(w, h) {
		const v = this.isVertical;
		if (v) [w, h] = [h, w];
		this.setFigureSize(w, h);
		if (v) this.setTransform(this._element, w, h, 0);
	}

	/**
	 * @description Gets the Figure size
	 * @param {?Node} [targetNode] Target element, default is the current element
	 * @returns {{w: string, h: string, dw: string, dh: string}}
	 */
	getSize(targetNode) {
		targetNode ||= this._element;

		const v = IsVertical(targetNode);
		let w = '';
		let h = '';
		let dw = '';
		let dh = '';

		if (!targetNode) return { w, h, dw, dh };

		const figure = Figure.GetContainer(targetNode);
		const target = figure.target;
		if (!figure.container) {
			// exceptionFormat
			if (!this.options.get('strictMode').formatFilter) {
				w = target.style.width || 'auto';
				h = target.style.height || 'auto';
			} else {
				w = '';
				h = target.style.height;
			}
		} else {
			w = !/%$/.test(target.style.width) ? target.style.width : ((figure.container && numbers.get(figure.container.style.width, 2)) || 100) + '%';
			h = figure.inlineCover
				? figure.inlineCover.style.height || /** @type {HTMLElement} */ (targetNode).style.height || String(/** @type {HTMLImageElement} */ (targetNode).height || '')
				: numbers.get(figure.cover?.style.paddingBottom, 0) > 0 && !v
					? figure.cover?.style.height
					: !/%$/.test(target.style.height) || !/%$/.test(target.style.width)
						? target.style.height
						: ((figure.container && numbers.get(figure.container.style.height, 2)) || 100) + '%';

			w ||= 'auto';
			h ||= 'auto';
		}

		dw = v ? h : w;
		dh = v ? w : h;

		return {
			w,
			h,
			dw,
			dh,
		};
	}

	/**
	 * @description Align the container.
	 * @param {?Node} targetNode Target element
	 * @param {string} align "none"|"left"|"center"|"right"
	 */
	setAlign(targetNode, align) {
		targetNode ||= this._element;
		this.align = align ||= 'none';

		const figure = Figure.GetContainer(targetNode);
		if (!figure.cover) return;

		const target = figure.target;
		const container = figure.container;
		const cover = figure.cover;
		if (/%$/.test(target.style.width) && align === 'center' && !this.#component.isInline(container)) {
			container.style.minWidth = '100%';
			cover.style.width = container.style.width;
		} else {
			container.style.minWidth = '';
			cover.style.width = this.isVertical ? target.style.height || target.offsetHeight + 'px' : !target.style.width || target.style.width === 'auto' ? '' : target.style.width || '100%';
		}

		if (!dom.utils.hasClass(container, '__se__float-' + align)) {
			dom.utils.removeClass(container, this.#floatClassStr);
			dom.utils.addClass(container, '__se__float-' + align);
		}

		if (this.autoRatio) {
			const { w, h } = this.getSize(this._element);
			this.__setCoverPaddingBottom(w, h);
		}

		this.#setAlignIcon();
	}

	/**
	 * @description As style[block, inline] the component
	 * @param {?Node} targetNode Target element
	 * @param {"block"|"inline"} formatStyle Format style
	 * @returns {HTMLElement} New target element after conversion
	 */
	convertAsFormat(targetNode, formatStyle) {
		targetNode ||= this._element;
		this.as = formatStyle || 'block';
		const { container, inlineCover, target } = Figure.GetContainer(targetNode);
		const { w, h } = this.getSize(target);

		const newTarget = /** @type {HTMLElement} */ (target.cloneNode(false));
		newTarget.style.width = '';
		newTarget.style.height = '';
		newTarget.removeAttribute('width');
		newTarget.removeAttribute('height');

		switch (formatStyle) {
			case 'inline': {
				if (inlineCover) break;
				this.#component.deselect();

				const next = container.nextElementSibling;
				const parent = container.parentElement;

				const figure = Figure.CreateInlineContainer(newTarget);
				dom.utils.addClass(
					figure.container,
					container.className
						.split(' ')
						.filter((v) => v !== 'se-figure-selected' && v !== 'se-component-selected')
						.join('|'),
				);

				this.#asFormatChange(figure, w, h);

				const line = dom.utils.createElement(this.options.get('defaultLine'), null, figure.container);
				parent.insertBefore(line, next);
				dom.utils.removeItem(container);

				break;
			}
			case 'block': {
				if (!inlineCover) break;
				this.#component.deselect();

				this.#selection.setRange(container, 0, container, 1);
				const r = this.#html.remove();
				const s = this.#nodeTransform.split(r.container, r.offset, 0);

				if (s?.previousElementSibling && dom.check.isZeroWidth(s.previousElementSibling)) {
					dom.utils.removeItem(s.previousElementSibling);
				}

				const figure = Figure.CreateContainer(newTarget);
				dom.utils.addClass(
					figure.container,
					container.className
						.split(' ')
						.filter((v) => v !== 'se-inline-component' && v !== 'se-figure-selected' && v !== 'se-component-selected')
						.join('|'),
				);

				this.#asFormatChange(figure, w, h);

				(s || r.container).parentElement.insertBefore(figure.container, s);

				break;
			}
		}

		return newTarget;
	}

	/**
	 * @hook Module.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		const value = target.getAttribute('data-value');
		const type = target.getAttribute('data-type');
		const element = this._element;
		if (/^on.+/.test(command) || type === 'selectMenu') return;

		switch (command) {
			case 'mirror': {
				const info = GetRotateValue(element);
				let x = info.x;
				let y = info.y;

				if ((value === 'h' && !this.isVertical) || (value === 'v' && this.isVertical)) {
					y = y ? '' : '180';
				} else {
					x = x ? '' : '180';
				}

				this._setRotate(element, info.r, x, y);
				break;
			}
			case 'rotate': {
				this.setTransform(element, null, null, Number(value));
				break;
			}
			case 'caption': {
				if (!this._caption) {
					const caption = Figure.CreateCaption(this._cover, this.lang.caption);
					const captionText = dom.query.getEdgeChild(caption, (current) => current.nodeType === 3, false);

					if (!captionText) {
						caption.focus();
					} else {
						this.#selection.setRange(captionText, 0, captionText, captionText.textContent.length);
					}

					this._caption = caption;
					this.controller.close();
				} else {
					dom.utils.removeItem(this._caption);
					_w.setTimeout(this.#component.select.bind(this.#component, element, this.kind), 0);
					this._caption = null;
				}

				if (/\d+/.test(element.style.height) || (this.isVertical && this._caption)) {
					if (/%$/.test(element.style.width) || /auto/.test(element.style.height)) {
						this.deleteTransform();
					} else {
						this.setTransform(element, element.style.width, element.style.height, 0);
					}
				}
				break;
			}
			case 'revert': {
				this._setRevert();
				break;
			}
			case 'edit': {
				this.inst.componentEdit(element);
				break;
			}
			case 'copy': {
				this.#component.copy(this._container);
				break;
			}
			case 'remove': {
				this.inst.componentDestroy(element);
				this.controller.close();
				break;
			}
		}

		if (/^__c__/.test(command)) {
			this._action[command](element, value, target);
			return;
		}

		if (command === 'edit') return;

		this.history.push(false);
		if (!/^remove|caption$/.test(command)) {
			this.#component.select(element, this.kind);
		}
	}

	/**
	 * @description Inspect the figure component format and change it to the correct format.
	 * @param {Node} container - The container element of the figure component.
	 * @param {Node} originEl - The original element of the figure component.
	 * @param {Node} anchorCover - The anchor cover element of the figure component.
	 * @param {import('../manager/FileManager').default} [fileManagerInst=null] - FileManager module instance, if used.
	 */
	retainFigureFormat(container, originEl, anchorCover, fileManagerInst) {
		const isInline = this.#component.isInline(container);
		const originParent = originEl.parentNode;
		let existElement = this.#format.isBlock(originParent) || dom.check.isWysiwygFrame(originParent) ? originEl : Figure.GetContainer(originEl)?.container || originParent || originEl;

		if (dom.query.getParentElement(originEl, dom.check.isExcludeFormat)) {
			existElement = anchorCover && anchorCover !== originEl ? anchorCover : originEl;
			existElement.parentNode.replaceChild(container, existElement);
		} else if (isInline && this.#format.isLine(existElement)) {
			const refer = isInline && /^SPAN$/i.test(originEl.parentElement.nodeName) ? originEl.parentElement : originEl;
			refer.parentElement.replaceChild(container, refer);
		} else if (dom.check.isListCell(existElement)) {
			const refer = dom.query.getParentElement(originEl, (current) => current.parentNode === existElement);
			existElement.insertBefore(container, refer);
			dom.utils.removeItem(originEl);
			this.#nodeTransform.removeEmptyNode(refer, null, true);
		} else if (this.#format.isLine(existElement)) {
			const refer = dom.query.getParentElement(originEl, (current) => current.parentNode === existElement);
			existElement = this.#nodeTransform.split(existElement, refer);
			existElement.parentNode.insertBefore(container, existElement);
			dom.utils.removeItem(originEl);
			this.#nodeTransform.removeEmptyNode(existElement, null, true);
		} else {
			if (this.#format.isLine(existElement.parentNode)) {
				const formats = existElement.parentNode;
				formats.parentNode.insertBefore(container, existElement.previousSibling ? formats.nextElementSibling : formats);
				if (fileManagerInst?.__updateTags.map((current) => existElement.contains(current)).length === 0) dom.utils.removeItem(existElement);
				else if (dom.check.isZeroWidth(existElement)) dom.utils.removeItem(existElement);
			} else {
				existElement = dom.check.isFigure(existElement.parentNode) ? dom.query.getParentElement(existElement.parentNode, Figure.is) : existElement;
				existElement.parentNode.replaceChild(container, existElement);
			}
		}
	}

	/**
	 * @description Initialize the transform style (rotation) of the element.
	 * @param {?Node} [node] Target element, default is the current element
	 */
	deleteTransform(node) {
		node ||= this._element;

		const element = /** @type {HTMLElement} */ (node);
		const size = (element.getAttribute('data-se-size') || '').split(',');
		this.isVertical = false;

		element.style.maxWidth = '';
		element.style.transform = '';
		element.style.transformOrigin = '';

		this.#deleteCaptionPosition(element);
		this._applySize(size[0] || 'auto', size[1] || '', '');
	}

	/**
	 * @description Set the transform style (rotation) of the element.
	 * @param {Node} node Target element
	 * @param {?string|number} width Element's width size
	 * @param {?string|number} height Element's height size
	 * @param {?number} deg rotate value
	 */
	setTransform(node, width, height, deg) {
		try {
			this.#preventSizechange = true;
			const info = GetRotateValue(node);
			const slope = info.r + (deg || 0) * 1;
			deg = Math.abs(slope) >= 360 ? 0 : slope;
			const isVertical = (this.isVertical = IsVertical(deg));

			width = numbers.get(width, 0);
			height = numbers.get(height, 0);

			const element = /** @type {HTMLElement} */ (node);
			const dataSize = (element.getAttribute('data-se-size') || 'auto,auto').split(',');
			if (isVertical) this._setRotate(element, deg, info.x, info.y);

			let transOrigin = '';
			if (/auto|%$/.test(dataSize[0]) && !isVertical) {
				if (dataSize[0] === 'auto' && dataSize[1] === 'auto') {
					this._setAutoSize();
				} else {
					this._setPercentSize(dataSize[0], dataSize[1]);
				}
			} else {
				const figureInfo = Figure.GetContainer(element);
				const cover = figureInfo.cover || figureInfo.inlineCover;
				const offsetW = width || element.offsetWidth;
				const offsetH = height || element.offsetHeight;
				const w = (isVertical ? offsetH : offsetW) + 'px';
				const h = (isVertical ? offsetW : offsetH) + 'px';

				this.#deletePercentSize();
				this._applySize(offsetW + 'px', offsetH + 'px', '');

				if (cover) {
					cover.style.width = w;
					cover.style.height = figureInfo.caption || figureInfo.inlineCover ? '' : h;
				}

				if (isVertical) {
					const transW = offsetW / 2 + 'px ' + offsetW / 2 + 'px 0';
					const transH = offsetH / 2 + 'px ' + offsetH / 2 + 'px 0';
					transOrigin = deg === 90 || deg === -270 ? transH : transW;
				}
			}

			element.style.transformOrigin = transOrigin;
			if (!isVertical) this._setRotate(element, deg, info.x, info.y);

			if (isVertical) element.style.maxWidth = 'none';
			else element.style.maxWidth = '';

			this.#setCaptionPosition(element);
		} finally {
			this.#preventSizechange = false;
		}
	}

	/**
	 * @internal
	 * @description Displays or hides the resize handles of the figure component.
	 * @param {boolean} display Whether to display resize handles.
	 */
	_displayResizeHandles(display) {
		const type = !display ? 'none' : 'flex';
		if (this.controller) this.controller.form.style.display = type;

		const _figure = this.frameContext.get('_figure');
		const resizeHandles = _figure.handles;
		for (let i = 0, len = resizeHandles.length; i < len; i++) {
			resizeHandles[i].style.display = type;
		}

		if (type === 'none') {
			dom.utils.addClass(_figure.main, 'se-resize-ing');
			this.#onResizeESCEvent = this.eventManager.addGlobalEvent('keydown', this.#containerResizingESC);
		} else {
			dom.utils.removeClass(_figure.main, 'se-resize-ing');
		}
	}

	/**
	 * @description Handles format conversion (block/inline) for the figure component and applies size changes.
	 * @param {FigureInfo} figureinfo {target, container, cover, inlineCover, caption}
	 * @param {string|number} w Width value.
	 * @param {string|number} h Height value.
	 */
	#asFormatChange(figureinfo, w, h) {
		const kind = this.kind;
		figureinfo.target.onload = () => this.#component.select(figureinfo.target, kind);

		this.#setFigureInfo(figureinfo);

		if (figureinfo.inlineCover) {
			this.setAlign(figureinfo.target, 'none');
			this.deleteTransform();
		}

		this.setFigureSize(w, h);
	}

	/**
	 * @description Sets figure component properties such as cover, container, caption, and alignment.
	 * @param {FigureInfo} figureInfo - {target, container, cover, inlineCover, caption, isVertical}
	 */
	#setFigureInfo(figureInfo) {
		this._inlineCover = figureInfo.inlineCover;
		this._cover = figureInfo.cover || this._inlineCover;
		this._container = figureInfo.container;
		this._caption = figureInfo.caption;
		this._element = figureInfo.target;
		this.align = (this._container.className.match(/(?:^|\s)__se__float-(none|left|center|right)(?:$|\s)/) || [])[1] || figureInfo.target.style.float || 'none';
		this.as = this._inlineCover ? 'inline' : 'block';
		this.isVertical = IsVertical(figureInfo.target);
	}

	/**
	 * @internal
	 * @description Applies rotation transformation to the target element.
	 * @param {HTMLElement} element Target element.
	 * @param {number} r Rotation degree.
	 * @param {number} x X-axis rotation value.
	 * @param {number} y Y-axis rotation value.
	 */
	_setRotate(element, r, x, y) {
		let width = (element.offsetWidth - element.offsetHeight) * (/^-/.test(r + '') ? 1 : -1);
		let translate = '';

		if (/[1-9]/.test(r + '') && (x || y)) {
			translate = x ? 'Y' : 'X';

			switch (r + '') {
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
	}

	/**
	 * @internal
	 * @description Applies size adjustments to the figure element.
	 * @param {string|number} w Width value.
	 * @param {string|number} h Height value.
	 * @param {string} direction Resize direction.
	 */
	_applySize(w, h, direction) {
		const onlyW = /^(rw|lw)$/.test(direction) && /\d+/.test(this._element.style.height);
		const onlyH = /^(th|bh)$/.test(direction) && /\d+/.test(this._element.style.width);
		h = /** @type {string} */ (h || (this.autoRatio ? this.autoRatio.current || this.autoRatio.default : h));
		w = /** @type {string} */ (numbers.is(w) ? w + this.sizeUnit : w);

		if (!/%$/.test(w) && !/%$/.test(h) && !onlyW && !onlyH) this.#deletePercentSize();

		const sizeTarget = this._cover || this._element;

		if (this.autoRatio && this._cover) this._cover.style.width = w;
		if (!onlyH) {
			sizeTarget.style.width = this._element.style.width = w;
		}
		if (!onlyW) {
			h = numbers.is(h) ? h + this.sizeUnit : h;
			sizeTarget.style.height = this._element.style.height = this.autoRatio && !this.isVertical ? '100%' : h;
			if (this.autoRatio && this._cover) {
				this._cover.style.height = h;
				this.__setCoverPaddingBottom(w, h);
			}
		}

		if (this.align === 'center') this.setAlign(this._element, this.align);

		// save current size
		this.#saveCurrentSize();
	}

	/**
	 * @internal
	 * @description Sets padding-bottom for cover elements based on width and height.
	 * @param {string} w Width value.
	 * @param {string} h Height value.
	 */
	__setCoverPaddingBottom(w, h) {
		if (this._inlineCover === this._cover) return;

		if (this.isVertical) {
			[w, h] = [h, w];
		}

		this._cover.style.height = h;
		if (/%$/.test(w) && this.align === 'center') {
			this._cover.style.paddingBottom = !/%$/.test(h) ? h : numbers.get((numbers.get(h, 2) / 100) * numbers.get(w, 2), 2) + '%';
		} else {
			this._cover.style.paddingBottom = h;
		}
	}

	/**
	 * @internal
	 * @description Sets the figure element to its auto size.
	 */
	_setAutoSize() {
		if (this._caption) this._caption.style.marginTop = '';
		this.deleteTransform();
		this.#deletePercentSize();

		if (this.autoRatio) {
			this._setPercentSize('100%', this.autoRatio.current || this.autoRatio.default);
		} else {
			this._element.style.maxWidth = '';
			this._element.style.width = '';
			this._element.style.height = '';
			if (this._cover) {
				this._cover.style.width = '';
				this._cover.style.height = '';
			}
		}

		this.setAlign(this._element, this.align);

		// save current size
		this.#saveCurrentSize();
	}

	/**
	 * @internal
	 * @description Sets the figure element's size in percentage.
	 * @param {string|number} w Width percentage.
	 * @param {string|number} h Height percentage.
	 */
	_setPercentSize(w, h) {
		h ||= this.autoRatio ? (/%$/.test(this.autoRatio.current) ? this.autoRatio.current : this.autoRatio.default) : h;
		h = h && !/%$/.test(h + '') && !numbers.get(h, 0) ? (numbers.is(h) ? h + '%' : h) : numbers.is(h) ? h + this.sizeUnit : h || (this.autoRatio ? this.autoRatio.default : '');

		const heightPercentage = /%$/.test(h + '');
		this._container.style.width = String(numbers.is(w) ? w + '%' : w);
		this._container.style.height = '';

		// exceptionFormat
		if (this._element === this._cover && !this.options.get('strictMode').formatFilter) {
			this.#saveCurrentSize();
			return;
		}

		if (this._inlineCover !== this._cover && this._cover) {
			this._cover.style.width = '100%';
			this._cover.style.height = String(h);
		}

		this._element.style.width = '100%';
		this._element.style.maxWidth = '';
		this._element.style.height = String(this.autoRatio ? '100%' : heightPercentage ? '' : h);

		if (this.align === 'center') this.setAlign(this._element, this.align);
		if (this.autoRatio) {
			this.__setCoverPaddingBottom(String(w), String(h));
		}

		this.#setCaptionPosition(this._element);

		// save current size
		this.#saveCurrentSize();
	}

	/**
	 * @description Deletes percentage-based sizing from the figure element.
	 */
	#deletePercentSize() {
		if (this._cover) {
			this._cover.style.width = '';
			this._cover.style.height = '';
		}

		this._container.style.width = '';
		this._container.style.height = '';

		dom.utils.removeClass(this._container, this.#floatClassStr);
		dom.utils.addClass(this._container, '__se__float-' + this.align);

		if (this.align === 'center') this.setAlign(this._element, this.align);
	}

	/**
	 * @internal
	 * @description Reverts the figure element to its previously saved size.
	 */
	_setRevert() {
		this.setFigureSize(this.#revertSize.w, this.#revertSize.h);
	}

	/**
	 * @description Updates the figure's alignment icon.
	 */
	#setAlignIcon() {
		if (!this.alignButton) return;
		dom.utils.changeElement(this.alignButton.firstElementChild, this._alignIcons[this.align]);
	}

	/**
	 * @description Updates the figure's block/inline format icon.
	 */
	#setAsIcon() {
		if (!this.asButton) return;
		dom.utils.changeElement(this.asButton.firstElementChild, this.icons[`as_${this.as}`]);
	}

	/**
	 * @description Saves the current size of the figure component.
	 */
	#saveCurrentSize() {
		if (this.#preventSizechange) return;

		const dataSize = (this._element.getAttribute('data-se-size') || ',').split(',');
		this.#revertSize.w = dataSize[0];
		this.#revertSize.h = dataSize[1];

		const size = this.getSize(this._element);
		// add too width, height attribute
		this._element.setAttribute('width', size.w.replace('px', ''));
		this._element.setAttribute('height', size.h.replace('px', ''));
		this._element.setAttribute('data-se-size', size.w + ',' + size.h);
		if (this.autoRatio) {
			this.autoRatio.current = /%$/.test(size.h) ? size.h : '';
		}
	}

	/**
	 * @description Adjusts the position of the caption within the figure.
	 * @param {HTMLElement} element Target element.
	 */
	#setCaptionPosition(element) {
		const figcaption = /** @type {HTMLElement} */ (dom.query.getEdgeChild(dom.query.getParentElement(element, 'FIGURE'), 'FIGCAPTION', false));
		if (figcaption) {
			figcaption.style.marginTop = (this.isVertical && !this.autoRatio ? element.offsetWidth - element.offsetHeight : 0) + 'px';
			if (this.isVertical && this.autoRatio) {
				element.style.marginTop = figcaption.offsetHeight + 'px';
			} else {
				element.style.marginTop = '';
			}
		}
	}

	/**
	 * @description Removes the margin top property from the figure caption.
	 * @param {HTMLElement} element Target element.
	 */
	#deleteCaptionPosition(element) {
		const figcaption = /** @type {HTMLElement} */ (dom.query.getEdgeChild(dom.query.getParentElement(element, 'FIGURE'), 'FIGCAPTION', false));
		if (figcaption) {
			figcaption.style.marginTop = '';
		}
	}

	/**
	 * @description Removes the resize event listeners.
	 */
	#offResizeEvent() {
		this.#component.__removeDragEvent();
		this.#removeGlobalEvents();

		this._displayResizeHandles(true);
		this.uiManager.offCurrentController();
		this.uiManager.disableBackWrapper();
	}

	/**
	 * @description Removes global event listeners related to resizing.
	 */
	#removeGlobalEvents() {
		this.eventManager.removeGlobalEvent(this.__onContainerEvent);
		this.eventManager.removeGlobalEvent(this.__offContainerEvent);
		this.eventManager.removeGlobalEvent(this.#onResizeESCEvent);
	}

	/**
	 * @description Sets up drag event handling for the figure component.
	 * @param {Node} figureMain The main figure container element.
	 */
	#setDragEvent(figureMain) {
		const dragHandle = /** @type {HTMLElement} */ (this.frameContext.get('wrapper').querySelector('.se-drag-handle'));
		dom.utils.removeClass(dragHandle, 'se-drag-handle-full');

		dragHandle.style.opacity = '';
		dragHandle.style.width = '';
		dragHandle.style.height = '';

		_DragHandle.set('__dragHandler', dragHandle);
		_DragHandle.set('__dragContainer', this._container);
		_DragHandle.set('__dragCover', this._cover);
		_DragHandle.set('__dragMove', this.#OnScrollDragHandler.bind(this, dragHandle, figureMain));

		_DragHandle.get('__dragMove')();

		dragHandle.style.display = 'block';
	}

	/**
	 * @param {HTMLElement} dragHandle Drag handle element
	 * @param {HTMLElement} figureMain Figure container element
	 */
	#OnScrollDragHandler(dragHandle, figureMain) {
		dragHandle.style.display = 'block';
		dragHandle.style.left = figureMain.offsetLeft + (this.options.get('_rtl') ? dragHandle.offsetWidth : figureMain.offsetWidth - dragHandle.offsetWidth * 1.5) + 'px';
		dragHandle.style.top = figureMain.offsetTop - dragHandle.offsetHeight + 0.5 + 'px';
	}

	/**
	 * @param {MouseEvent} e Event object
	 */
	#OnResizeContainer(e) {
		e.stopPropagation();
		e.preventDefault();

		const inst = _DragHandle.get('__figureInst');
		if (!inst) return;

		const eventTarget = dom.query.getEventTarget(e);
		const direction = (inst._resize_direction = eventTarget.classList[0]);
		inst._resizeClientX = e.clientX;
		inst._resizeClientY = e.clientY;
		inst.frameContext.get('_figure').main.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';
		this.uiManager.enableBackWrapper(DIRECTION_CURSOR_MAP[direction]);

		const { w, h, dw, dh } = this.getSize(inst._element);
		__resizing_p_wh = __resizing_p_ow = false;
		__resizing_cw = __resizing_sw = 0;
		if (!this.isVertical) {
			const pw = !w || /auto|%$/.test(w);
			const ph = !h || /auto|%$/.test(h);
			if (DIR_DIAGONAL.includes(direction) && pw && ph) {
				__resizing_p_wh = true;
			} else if (DIR_W.includes(direction) && pw) {
				__resizing_p_ow = true;
			}

			if (__resizing_p_wh || __resizing_p_ow) {
				const sizeTarget = inst._cover || inst._element;
				__resizing_sw = sizeTarget.offsetWidth;
				__resizing_cw = converter.getWidthInPercentage(sizeTarget, this.frameContext.get('wysiwygFrame')) / 100;
			}
		}

		inst.__onContainerEvent = inst.eventManager.addGlobalEvent('mousemove', inst.__containerResizing);
		inst.__offContainerEvent = inst.eventManager.addGlobalEvent('mouseup', inst.__containerResizingOff);
		inst._displayResizeHandles(false);

		const _display = this.frameContext.get('_figure').display;
		_display.style.display = 'block';
		dom.utils.changeTxt(_display, dw + ' * ' + dh);
	}

	/**
	 * @description Handles the resizing of the figure container.
	 * @param {MouseEvent} e Mouse event.
	 */
	#ContainerResizing(e) {
		const direction = this._resize_direction;
		const clientX = e.clientX;
		const clientY = e.clientY;
		const v = this.isVertical;

		let resultW = v ? this.#element_h : this.#element_w;
		let resultH = v ? this.#element_w : this.#element_h;

		const w = resultW + (/r/.test(direction) ? clientX - this._resizeClientX : this._resizeClientX - clientX);
		const h = resultH + (/b/.test(direction) ? clientY - this._resizeClientY : this._resizeClientY - clientY);
		const wh = (resultH / resultW) * w;
		const resizeBorder = this.frameContext.get('_figure').border;

		if (/t/.test(direction)) resizeBorder.style.top = resultH - (/h/.test(direction) ? h : wh) + 'px';
		if (/l/.test(direction)) resizeBorder.style.left = resultW - w + 'px';

		if (/r|l/.test(direction)) {
			resizeBorder.style.width = w + 'px';
			resultW = w;
		}

		if (/^(t|b)[^h]$/.test(direction)) {
			resizeBorder.style.height = wh + 'px';
			resultH = wh;
		} else if (/^(t|b)h$/.test(direction)) {
			resizeBorder.style.height = h + 'px';
			resultH = h;
		}

		const resize_w = /** @type {number} */ (!v && /h$/.test(direction) ? this.#width : Math.round(resultW));
		const resize_h = /** @type {number} */ (!v && /w$/.test(direction) ? this.#height : Math.round(resultH));
		const rw = __resizing_cw ? (resize_w / __resizing_sw) * __resizing_cw * 100 : resize_w;
		dom.utils.changeTxt(this.frameContext.get('_figure').display, __resizing_cw ? numbers.get(rw > 100 ? 100 : rw, 2).toFixed(2) + '%' : rw + ' * ' + resize_h);

		this.#resize_w = resize_w;
		this.#resize_h = resize_h;
	}

	/**
	 * @description Finalizes the resizing process of the figure container.
	 */
	#ContainerResizingOff() {
		this.#offResizeEvent();

		// set size
		let w = this.isVertical ? this.#resize_h : this.#resize_w;
		let h = this.isVertical ? this.#resize_w : this.#resize_h;
		w = Math.round(w) || w;
		h = Math.round(h) || h;

		if (!this.isVertical && !/%$/.test(w + '')) {
			const limit =
				this.frameContext.get('wysiwygFrame').clientWidth -
				numbers.get(this.frameContext.get('wwComputedStyle').getPropertyValue('padding-left')) +
				numbers.get(this.frameContext.get('wwComputedStyle').getPropertyValue('padding-right')) -
				2;
			if (numbers.get(w, 0) > limit) {
				h = Math.round((h / w) * limit);
				w = limit;
			}
		}

		if (__resizing_p_wh || __resizing_p_ow) {
			const sizeTarget = this._cover || this._element;
			w = (w / sizeTarget.offsetWidth) * __resizing_cw * 100;
			const wp = numbers.get(w > 100 ? 100 : w, 2) + '%';
			this._setPercentSize(wp, __resizing_p_ow ? this.getSize(this._element).h : '');
		} else {
			this._applySize(w, h, this._resize_direction);
			if (this.isVertical) this.setTransform(this._element, w, h, 0);
		}

		this.history.push(false);
		this.#component.select(this._element, this.kind);
	}

	/**
	 * @description Cancels the resizing process when the escape key is pressed.
	 * @param {KeyboardEvent} e Keyboard event.
	 */
	#ContainerResizingESC(e) {
		if (!keyCodeMap.isEsc(e.code)) return;
		this.#offResizeEvent();
		this.#component.select(this._element, this.kind);
	}

	/**
	 * @param { "none"|"left"|"center"|"right"} value align value
	 */
	#SetMenuAlign(value) {
		this.setAlign(this._element, value);
		this.selectMenu_align.close();
		this.#component.select(this._element, this.kind);
	}

	/**
	 * @param {"block"|"inline"} value Format style
	 */
	#SetMenuAs(value) {
		this.convertAsFormat(this._element, value);
		this.selectMenu_as.close();
	}

	/**
	 * @param {"auto"|number} value Resize value
	 */
	#SetResize(value) {
		if (value === 'auto') {
			this.deleteTransform();
			this._setAutoSize();
		} else {
			let dataY = this.getSize(this._element).h;
			if (this.isVertical) {
				const dataSize = (this._element.getAttribute('data-se-size') || ',').split(',');
				if (dataSize[1]) dataY = dataSize[1];
			}

			this.deleteTransform();
			this._setPercentSize(value * 1, numbers.get(dataY, 0) === null || !/%$/.test(dataY) ? '' : dataY);
		}

		this.selectMenu_resize.close();
		this.#component.select(this._element, this.kind);
	}

	#OffFigureContainer() {
		const _figure = this.frameContext.get('_figure');
		_figure.main.style.display = 'none';
		this.uiManager.setFigureContainer(null);
		this.uiManager.opendControllers = this.uiManager.opendControllers.filter((c) => c.form !== _figure.main);
	}

	#OnClick_alignButton() {
		this.selectMenu_align.open('', '[data-command="' + this.align + '"]');
	}

	#OnClick_asButton() {
		this.selectMenu_as.open('', '[data-command="' + this.as + '"]');
	}

	#OnClick_resizeButton() {
		const size = this.getSize(this._element);
		const w = size.w;
		const h = size.h;
		let command = '';
		if (this.autoRatio) {
			if (h === this.autoRatio.default && /%$/.test(w)) {
				const nw = numbers.get(w);
				if (nw === 100) command = 'auto';
				else command = 'resize_percent' + nw;
			}
		} else if (h === 'auto') {
			if (w === 'auto') {
				command = 'auto';
			} else if (/%$/.test(w)) {
				command = 'resize_percent' + numbers.get(w);
			}
		}

		this.selectMenu_resize.open('', '[data-command="' + command + '"]');
	}
}

/**
 * @param {Node} element Target element
 * @returns {{ r: *, x: *, y: * }} Rotation value
 */
function GetRotateValue(element) {
	const transform = /** @type {HTMLElement} */ (element).style.transform;
	if (!transform) return { r: 0, x: '', y: '' };
	return {
		r: Number((transform.match(/rotate\(([-0-9]+)deg\)/) || [])[1] || 0),
		x: (transform.match(/rotateX\(([-0-9]+)deg\)/) || [])[1] || '',
		y: (transform.match(/rotateY\(([-0-9]+)deg\)/) || [])[1] || '',
	};
}

/**
 * @param {Node|number} elementOrDeg Target element
 * @returns {boolean} Whether to rotate vertically
 */
function IsVertical(elementOrDeg) {
	return /^(90|270)$/.test(Math.abs(numbers.is(elementOrDeg) ? elementOrDeg : GetRotateValue(/** @type{Node} */ (elementOrDeg)).r).toString());
}

function CreateAlign(inst, button) {
	if (!button) return null;

	const icons = [inst._alignIcons.none, inst._alignIcons.left, inst._alignIcons.center, inst._alignIcons.right];
	const langs = [inst.lang.basic, inst.lang.left, inst.lang.center, inst.lang.right];
	const commands = ['none', 'left', 'center', 'right'];
	const html = [];
	const items = [];
	for (let i = 0; i < commands.length; i++) {
		html.push(/*html*/ `
		<button type="button" class="se-btn-list se-tooltip" data-command="${commands[i]}" data-type="selectMenu" >
			${icons[i]}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${langs[i]}</span>
			</span>
		</button>`);
		items.push(commands[i]);
	}

	return { html: html, items: items };
}

function CreateAs(inst, button) {
	if (!button) return null;

	const icons = [inst.icons.as_block, inst.icons.as_inline];
	const langs = [inst.lang.asBlock, inst.lang.asInline];
	const commands = ['block', 'inline'];
	const html = [];
	const items = [];
	for (let i = 0; i < commands.length; i++) {
		html.push(/*html*/ `
		<button type="button" class="se-btn-list se-tooltip" data-command="${commands[i]}" data-type="selectMenu" >
			${icons[i]}
			<span class="se-tooltip-inner">
				<span class="se-tooltip-text">${langs[i]}</span>
			</span>
		</button>`);
		items.push(commands[i]);
	}

	return { html: html, items: items };
}

function CreateResize(editor, button) {
	if (!button) return null;

	const items = button.getAttribute('data-value').split(',');
	const html = [];
	for (let i = 0, n, c, v, l; i < items.length; i++) {
		v = items[i];
		n = numbers.is(v);
		c = n ? 'resize_percent' + v : 'auto';
		l = n ? v + '%' : editor.lang.autoSize;
		html.push('<button type="button" class="se-btn-list" data-command="' + c + '" data-value="' + v + '"><span>' + l + '</span></button>');
	}

	return { html: html, items: items };
}

function CreateHTML_resizeDot() {
	const html = /*html*/ `
		<div class="se-resize-dot">
			<span class="tl"></span>
			<span class="tr"></span>
			<span class="bl"></span>
			<span class="br"></span>
			<span class="lw"></span>
			<span class="th"></span>
			<span class="rw"></span>
			<span class="bh"></span>
			<div class="se-resize-display"></div>
		</div>`;

	return dom.utils.createElement('DIV', { class: 'se-controller se-resizing-container', style: 'display: none;' }, html);
}

function GET_CONTROLLER_BUTTONS(group) {
	const g = group.split('_');
	const command = g[0];
	const value = g[1];
	let c, v, l, t, i;

	switch (command) {
		case 'resize':
			c = 'onresize';
			v = value;
			l = 'resize';
			i = 'resize';
			break;
		case 'auto':
			c = 'auto';
			l = 'autoSize';
			i = 'auto_size';
			break;
		case 'rotate':
			c = 'rotate';
			v = value === 'l' ? -90 : value === 'r' ? 90 : numbers.get(value);
			l = v < 0 ? 'rotateLeft' : 'rotateRight';
			i = v < 0 ? 'rotate_left' : 'rotate_right';
			break;
		case 'mirror':
			c = 'mirror';
			v = value;
			l = value === 'h' ? 'mirrorHorizontal' : 'mirrorVertical';
			i = value === 'h' ? 'mirror_horizontal' : 'mirror_vertical';
			break;
		case 'align':
			c = 'onalign';
			l = 'align';
			i = 'align_justify';
			break;
		case 'caption':
			c = 'caption';
			l = 'caption';
			i = 'caption';
			break;
		case 'revert':
			c = 'revert';
			l = 'revert';
			i = 'revert';
			break;
		case 'edit':
			c = 'edit';
			l = 'edit';
			i = 'edit';
			break;
		case 'as':
			c = 'onas';
			l = 'blockStyle';
			i = 'as_block';
			break;
		case 'copy':
			c = 'copy';
			l = 'copy';
			i = 'copy';
			break;
		case 'remove':
			c = 'remove';
			l = 'remove';
			i = 'delete';
			break;
	}

	if (!c) return null;

	return {
		c: c,
		v: v,
		l: l,
		t: t,
		i: i,
	};
}

function CreateHTML_controller(inst, controls) {
	let html = null;

	if (controls?.length > 0) {
		const { lang, icons } = inst;
		html = '<div class="se-arrow se-arrow-up"></div>';
		for (let i = 0, group; i < controls.length; i++) {
			group = controls[i];
			html += '<div class="se-btn-group">';
			for (let j = 0, len = group.length, m; j < len; j++) {
				m = group[j];

				if (typeof m?.action === 'function') {
					const g = m;
					m = {
						c: `__c__${g.command}`,
						v: g.value || '',
						l: g.title,
						i: g.icon,
					};
					inst._action[m.c] = g.action;
				} else {
					m = GET_CONTROLLER_BUTTONS(m);
					if (!m) continue;
				}

				html += /*html*/ `
					<button type="button" data-command="${m.c}" data-value="${m.v}" class="se-btn se-tooltip">
						${icons[m.i] || m.i}
						<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang[m.l] || m.l}</span></span>
					</button>`;
			}
			html += '</div>';
		}
	}

	if (!html) return null;

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-resizing' }, html);
}

export default Figure;
