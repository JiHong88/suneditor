import EditorInjector from '../../editorInjector';
import { Modal } from '../../modules';
import { domUtils, env } from '../../helper';
import { CreatTooltipInner } from '../../core/section/constructor';

const { _w, isMobile } = env;

const Drawing = function (editor, pluginOptions) {
	// plugin basic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.drawing;
	this.icon = 'drawing';
	this.pluginOptions = {
		outputFormat: pluginOptions.outputFormat || 'dataurl', // dataurl, svg
		useFormatType: pluginOptions.useFormatType ?? false,
		defaultFormatType: ['block', 'inline'].includes(pluginOptions.defaultFormatType) ? pluginOptions.defaultFormatType : 'block',
		keepFormatType: pluginOptions.keepFormatType ?? false,
		lineWidth: pluginOptions.lineWidth || 5,
		lineReconnect: !!pluginOptions.lineReconnect,
		lineCap: ['butt', 'round', 'square'].includes(pluginOptions.lineCap) ? pluginOptions.lineCap : 'round',
		lineColor: pluginOptions.lineColor || '',
		formSize: {
			width: '750px',
			height: '50vh',
			maxWidth: '',
			maxHeight: '',
			minWidth: '150px',
			minHeight: '100px',
			...pluginOptions.formSize
		},
		canResize: pluginOptions.canResize ?? true,
		maintainRatio: pluginOptions.maintainRatio ?? true
	};

	// exception
	if (!this.plugins.image) {
		console.warn('[SUNEDITOR.plugins.drawing.warn] The drawing plugin must need either "image" plugin. Please add the "image" plugin.');
	} else if (this.pluginOptions.outputFormat === 'svg' && !this.plugins.image.pluginOptions.uploadUrl) {
		console.warn('[SUNEDITOR.plugins.drawing.warn] The drawing plugin must need the "image" plugin with the "uploadUrl" option. Please add the "image" plugin with the "uploadUrl" option.');
	}

	// create HTML
	const modalEl = CreateHTML_modal(this);

	// modules
	this.modal = new Modal(this, modalEl);

	// members
	this.as = this.pluginOptions.defaultFormatType;
	if (this.pluginOptions.useFormatType) {
		this.asBlock = modalEl.querySelector('[data-command="asBlock"]');
		this.asInline = modalEl.querySelector('[data-command="asInline"]');
		this.eventManager.addEvent([this.asBlock, this.asInline], 'click', OnClickAsButton.bind(this));
	}

	this.canvas = null;
	this.ctx = null;
	this.isDrawing = false;
	this.points = [];
	this.paths = [];
	this.resizeObserver = null;
	this.__events = {
		mousedown: isMobile ? OnCanvasTouchStart.bind(this) : OnCanvasMouseDown.bind(this),
		mousemove: isMobile ? OnCanvasTouchMove.bind(this) : OnCanvasMouseMove.bind(this),
		mouseup: OnCanvasMouseUp.bind(this),
		mouseleave: OnCanvasMouseLeave.bind(this),
		mouseenter: OnCanvasMouseEnter.bind(this)
	};
	this.__eventsRegister = {
		mousedown: null,
		mousemove: null,
		mouseup: null,
		mouseleave: null,
		mouseenter: null
	};
	this.__eventNameMap = {
		mousedown: isMobile ? 'touchstart' : 'mousedown',
		mousemove: isMobile ? 'touchmove' : 'mousemove',
		mouseup: isMobile ? 'touchend' : 'mouseup',
		mouseleave: 'mouseleave',
		mouseenter: 'mouseenter'
	};

	// init
	this.eventManager.addEvent(modalEl.querySelector('[data-command="remove"]'), 'click', OnRemove.bind(this));
};

Drawing.key = 'drawing';
Drawing.type = 'modal';
Drawing.className = '';
Drawing.prototype = {
	/**
	 * @override type = "modal"
	 */
	open() {
		if (this.pluginOptions.useFormatType) {
			this._activeAsInline((this.pluginOptions.keepFormatType ? this.as : this.pluginOptions.defaultFormatType) === 'inline');
		}
		this.modal.open();
		this._initDrawing();
	},

	/**
	 * @override modal
	 */
	off() {
		this._destroyDrawing();
	},

	/**
	 * @override modal
	 * @returns {string}
	 */
	modalAction() {
		if (this.pluginOptions.outputFormat === 'svg') {
			const files = this._getSVGFileList();
			this.plugins.image.init();
			this.plugins.image.submitFile(files);
		} else {
			// dataurl | svg
			const data = this.canvas.toDataURL();
			const file = { name: 'drawing', size: 0 };
			this.plugins.image.init();
			if (this.as !== 'inline') {
				this.plugins.image.create(data, null, 'auto', '', 'none', file, '');
			} else {
				this.plugins.image.createInline(data, null, 'auto', '', 'none', file, '');
			}
		}

		return true;
	},

	_initDrawing() {
		const canvas = (this.canvas = this.modal.form.querySelector('.se-drawing-canvas'));
		this.ctx = canvas.getContext('2d');
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		this.points = [];
		this.paths = [];

		this._setCtx();

		this.__eventsRegister.mousedown = this.eventManager.addEvent(canvas, this.__eventNameMap.mousedown, this.__events.mousedown, { passive: false, useCapture: true });
		this.__eventsRegister.mousemove = this.eventManager.addEvent(canvas, this.__eventNameMap.mousemove, this.__events.mousemove, true);
		this.__eventsRegister.mouseup = this.eventManager.addEvent(canvas, this.__eventNameMap.mouseup, this.__events.mouseup, true);
		this.__eventsRegister.mouseleave = this.eventManager.addEvent(canvas, this.__eventNameMap.mouseleave, this.__events.mouseleave);
		this.__eventsRegister.mouseenter = this.eventManager.addEvent(canvas, this.__eventNameMap.mouseenter, this.__events.mouseenter);

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		this.resizeObserver = new ResizeObserver(() => {
			const prevWidth = canvas.width;
			const prevHeight = canvas.height;
			const newWidth = canvas.offsetWidth;
			const newHeight = canvas.offsetHeight;
			canvas.width = newWidth;
			canvas.height = newHeight;
			if (prevWidth !== canvas.width || prevHeight !== canvas.height) {
				if (this.pluginOptions.maintainRatio) this._adjustPathsToNewDimensions(prevWidth, prevHeight, newWidth, newHeight);
				this._drawAll();
			}
		});

		this.resizeObserver.observe(canvas);
	},

	_destroyDrawing() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if (this.canvas) {
			this.eventManager.removeEvent(this.__eventsRegister.mousedown);
			this.eventManager.removeEvent(this.__eventsRegister.mousemove);
			this.eventManager.removeEvent(this.__eventsRegister.mouseup);
			this.eventManager.removeEvent(this.__eventsRegister.mouseleave);
			this.eventManager.removeEvent(this.__eventsRegister.mouseenter);
		}

		this.canvas = null;
		this.ctx = null;
		this.points = [];
		this.paths = [];
		this.isDrawing = false;
	},

	_setCtx() {
		this.ctx.lineWidth = this.pluginOptions.lineWidth;
		this.ctx.lineCap = this.pluginOptions.lineCap;
		this.ctx.lineColor = this.pluginOptions.lineColor || _w.getComputedStyle(this.carrierWrapper).color;
	},

	_draw() {
		this._setCtx();
		this.ctx.beginPath();
		this.points.forEach(([x, y], i) => {
			if (i === 0) {
				this.ctx.moveTo(x, y);
			} else {
				this.ctx.lineTo(x, y);
			}
		});
		this.ctx.stroke();
	},

	_drawAll() {
		this._setCtx();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.paths.forEach((path) => {
			this.points = path;
			this._draw();
		});
		this.points = [];
	},

	_adjustPathsToNewDimensions(prevWidth, prevHeight, newWidth, newHeight) {
		const xRatio = newWidth / prevWidth;
		const yRatio = newHeight / prevHeight;

		this.paths = this.paths.map((path) => path.map(([x, y]) => [x * xRatio, y * yRatio]));
	},

	_clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.points = [];
		this.paths = [];
	},

	_getSVG() {
		const svgNS = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('width', this.canvas.width);
		svg.setAttribute('height', this.canvas.height);
		svg.setAttribute('viewBox', `0 0 ${this.canvas.width} ${this.canvas.height}`);
		svg.setAttribute('xmlns', svgNS);

		this.paths.forEach((path) => {
			const pathData = path.reduce((acc, [x, y], i) => {
				return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
			}, '');
			const svgPath = document.createElementNS(svgNS, 'path');
			svgPath.setAttribute('d', pathData);
			svgPath.setAttribute('fill', 'none');
			svgPath.setAttribute('stroke', this.ctx.strokeStyle);
			svgPath.setAttribute('stroke-width', this.ctx.lineWidth);
			svg.appendChild(svgPath);
		});

		return svg;
	},

	_getSVGFileList() {
		const svgElement = this._getSVG();
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(svgElement);
		const blob = new Blob([svgString], { type: 'image/svg+xml' });
		const file = new File([blob], 'drawing.svg', { type: 'image/svg+xml' });

		// Creating a FileList
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(file);

		return dataTransfer.files;
	},

	_getCanvasTouchPointer(e) {
		const { touches } = e;
		const rect = this.canvas.getBoundingClientRect();
		const x = touches[0].clientX - rect.left;
		const y = touches[0].clientY - rect.top;
		return { x, y };
	},

	_activeAsInline(isInline) {
		if (isInline) {
			domUtils.addClass(this.asInline, 'on');
			domUtils.removeClass(this.asBlock, 'on');
			this.as = 'inline';
		} else {
			domUtils.addClass(this.asBlock, 'on');
			domUtils.removeClass(this.asInline, 'on');
			this.as = 'block';
		}
	},

	constructor: Drawing
};

function CreateHTML_modal({ lang, icons, pluginOptions }) {
	const { width, height, maxWidth, maxHeight, minWidth, minHeight } = pluginOptions.formSize;
	const html = /*html*/ `
    <form>
        <div class="se-modal-header">
            <button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
                ${icons.cancel}
            </button>
            <span class="se-modal-title">${lang.drawing_modal_title}</span>
        </div>
        <div class="se-modal-body" style="width: ${width}; height: ${height}; min-width: ${minWidth}; min-height: ${minHeight};">
            <canvas class="se-drawing-canvas" style="width: 100%; height: 100%;"></canvas>
			${pluginOptions.canResize ? '<div class="se-modal-resize-handle-w"></div><div class="se-modal-resize-handle-h"></div><div class="se-modal-resize-handle-c"></div>' : ''}
		</div>
		<div class="se-modal-body-bottom">
			<div class="se-modal-form">
				<div class="se-modal-flex-form">
					${
						pluginOptions.useFormatType
							? /*html*/ `
							<div class="se-modal-flex-group">
								<button type="button" class="se-btn se-tooltip" data-command="asBlock" aria-label="${lang.blockStyle}">
									${icons.as_block}
									${CreatTooltipInner(lang.blockStyle)}
								</button>
								<button type="button" class="se-btn se-tooltip" data-command="asInline" aria-label="${lang.inlineStyle}">
									${icons.as_inline}
									${CreatTooltipInner(lang.inlineStyle)}
								</button>
							</div>`
							: ''
					}
					<div class="se-modal-flex-group">
						<button type="button" class="se-btn se-tooltip" data-command="remove" aria-label="${lang.remove}">
							${icons.eraser}
							${CreatTooltipInner(lang.remove)}
						</button>
					</div>
				</div>
			</div>
		</div>
        <div class="se-modal-footer">
            <button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}">
                <span>${lang.submitButton}</span>
            </button>
        </div>
    </form>`;

	return domUtils.createElement(
		'DIV',
		{
			class: 'se-modal-content se-modal-responsive',
			style: `max-width: ${maxWidth}; max-height: ${maxHeight};`
		},
		html
	);
}

// canvas events
function OnCanvasMouseDown(e) {
	e.preventDefault();
	this.isDrawing = true;
	this.points.push([e.offsetX, e.offsetY]);
	this._draw();
}

function OnCanvasMouseMove(e) {
	e.preventDefault();
	if (!this.isDrawing) return;
	this.points.push([e.offsetX, e.offsetY]);
	this._draw();
}

function OnCanvasTouchStart(e) {
	e.preventDefault();
	const { x, y } = this._getCanvasTouchPointer(e);
	this.isDrawing = true;
	this.points.push([x, y]);
	this._draw();
}

function OnCanvasTouchMove(e) {
	e.preventDefault();
	const { x, y } = this._getCanvasTouchPointer(e);
	if (!this.isDrawing) return;
	this.points.push([x, y]);
	this._draw();
}

function OnCanvasMouseUp() {
	this.isDrawing = false;
	if (this.points.length > 0) {
		this.paths.push([...this.points]);
		this.points = [];
	}
}

function OnCanvasMouseLeave() {
	if (this.isDrawing) {
		this.paths.push([...this.points]);
		if (!this.pluginOptions.lineReconnect) {
			this.points = [];
			this.isDrawing = false;
		}
	}
}

function OnCanvasMouseEnter(e) {
	if (e.buttons === 1) {
		this.isDrawing = true;
		if (!this.pluginOptions.lineReconnect) {
			this.points.push([e.offsetX, e.offsetY]);
		} else {
			const lastPath = this.paths[this.paths.length - 1];
			const lastPoint = lastPath[lastPath.length - 1];
			this.points.push([lastPoint[0], lastPoint[1]]);
			this.points.push([e.offsetX, e.offsetY]);
		}
		this._draw();
	}
}

// button events
function OnRemove() {
	this._clearCanvas();
}

function OnClickAsButton({ target }) {
	this._activeAsInline(target.getAttribute('data-command') === 'asInline');
}

export default Drawing;
