import { PluginModal } from '../../interfaces';
import { Modal } from '../../modules/contract';
import { dom, env } from '../../helper';

const { _w } = env;

/**
 * @typedef {Object} DrawingPluginOptions
 * @property {string} [outputFormat="dataurl"] - The output format of the drawing. Options: `"dataurl"`, `"svg"`.
 * @property {boolean} [useFormatType=false] - Whether to enable format type selection (`block` vs `inline`).
 * @property {string} [defaultFormatType="block"] - The default format type, either `"block"` or `"inline"`.
 * @property {boolean} [keepFormatType=false] - Whether to maintain the chosen format type after drawing.
 * @property {number} [lineWidth=5] - The width of the drawing line.
 * @property {boolean} [lineReconnect=false] - Whether to reconnect lines when drawing.
 * @property {CanvasLineCap} [lineCap="round"] - The style of the line cap (`"butt"`, `"round"`, or `"square"`).
 * @property {string} [lineColor=""] - The color of the drawing line.
 * @property {boolean} [canResize=true] - Whether the modal form can be resized.
 * @property {boolean} [maintainRatio=true] - Whether to maintain the aspect ratio when resizing.
 * @property {Object} [formSize={}] - The size configuration for the drawing modal form.
 * @property {string} [formSize.width="750px"] - The width of the modal form.
 * @property {string} [formSize.height="50vh"] - The height of the modal form.
 * @property {string} [formSize.maxWidth=""] - The maximum width of the modal form.
 * @property {string} [formSize.maxHeight=""] - The maximum height of the modal form.
 * @property {string} [formSize.minWidth="150px"] - The minimum width of the modal form.
 * @property {string} [formSize.minHeight="100px"] - The minimum height of the modal form.
 */

/**
 * @class
 * @description Drawing modal plugin.
 */
class Drawing extends PluginModal {
	static key = 'drawing';
	static className = '';

	#events;
	#eventsRegister;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {DrawingPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		// plugin basic properties
		super(kernel);
		this.title = this.$.lang.drawing;
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
				...pluginOptions.formSize,
			},
			canResize: pluginOptions.canResize ?? true,
			maintainRatio: pluginOptions.maintainRatio ?? true,
		};

		// exception
		if (!this.$.plugins.image) {
			console.warn('[SUNEDITOR.plugins.drawing.warn] The drawing plugin must need either "image" plugin. Please add the "image" plugin.');
		} else if (this.pluginOptions.outputFormat === 'svg' && !this.$.plugins.image.pluginOptions.uploadUrl) {
			console.warn('[SUNEDITOR.plugins.drawing.warn] The drawing plugin must need the "image" plugin with the "uploadUrl" option. Please add the "image" plugin with the "uploadUrl" option.');
		}

		// create HTML
		const modalEl = CreateHTML_modal(this.$, this.pluginOptions);

		// modules
		this.modal = new Modal(this, this.$, modalEl);

		// members
		this.as = this.pluginOptions.defaultFormatType;
		if (this.pluginOptions.useFormatType) {
			this.asBlock = modalEl.querySelector('[data-command="asBlock"]');
			this.asInline = modalEl.querySelector('[data-command="asInline"]');
			this.$.eventManager.addEvent([this.asBlock, this.asInline], 'click', this.#OnClickAsButton.bind(this));
		}

		/**
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = null;
		this.ctx = null;
		this.isDrawing = false;
		this.points = [];
		this.paths = [];
		this.resizeObserver = null;

		this.#events = {
			touchstart: this.#OnCanvasTouchStart.bind(this),
			touchmove: this.#OnCanvasTouchMove.bind(this),
			mousedown: this.#OnCanvasMouseDown.bind(this),
			mousemove: this.#OnCanvasMouseMove.bind(this),
			mouseup: this.#OnCanvasMouseUp.bind(this),
			mouseleave: this.#OnCanvasMouseLeave.bind(this),
			mouseenter: this.#OnCanvasMouseEnter.bind(this),
		};
		this.#eventsRegister = {
			touchstart: null,
			touchmove: null,
			mousedown: null,
			mousemove: null,
			mouseup: null,
			mouseleave: null,
			mouseenter: null,
		};

		// init
		this.$.eventManager.addEvent(modalEl.querySelector('[data-command="remove"]'), 'click', this.#OnRemove.bind(this));
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		if (this.pluginOptions.useFormatType) {
			this.#activeAsInline((this.pluginOptions.keepFormatType ? this.as : this.pluginOptions.defaultFormatType) === 'inline');
		}
		this.modal.open();
		this.#initDrawing();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Off}
	 */
	modalOff() {
		this.#destroyDrawing();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		if (this.pluginOptions.outputFormat === 'svg') {
			const files = this.#getSVGFileList();
			this.$.plugins.image.modalInit();
			this.$.plugins.image.submitFile(files);
		} else {
			// dataurl | svg
			const data = this.canvas.toDataURL();
			const file = { name: 'drawing', size: 0 };
			this.$.plugins.image.modalInit();
			if (this.as !== 'inline') {
				this.$.plugins.image.create(data, null, 'auto', '', 'none', file, '');
			} else {
				this.$.plugins.image.createInline(data, null, 'auto', '', 'none', file, '');
			}
		}

		return true;
	}

	/**
	 * @description Initializes the drawing canvas, sets up event listeners, and configures resize handling.
	 */
	#initDrawing() {
		const canvas = (this.canvas = this.modal.form.querySelector('.se-drawing-canvas'));
		this.ctx = canvas.getContext('2d');
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		this.points = [];
		this.paths = [];

		this.#setCtx();

		this.#eventsRegister.touchstart = this.$.eventManager.addEvent(canvas, 'touchstart', this.#events.touchstart, { passive: false, capture: true });
		this.#eventsRegister.touchmove = this.$.eventManager.addEvent(canvas, 'touchmove', this.#events.touchmove, true);
		this.#eventsRegister.mousedown = this.$.eventManager.addEvent(canvas, 'mousedown', this.#events.mousedown, { passive: false, capture: true });
		this.#eventsRegister.mousemove = this.$.eventManager.addEvent(canvas, 'mousemove', this.#events.mousemove, true);
		this.#eventsRegister.mouseup = this.$.eventManager.addEvent(canvas, 'mouseup', this.#events.mouseup, true);
		this.#eventsRegister.mouseleave = this.$.eventManager.addEvent(canvas, 'mouseleave', this.#events.mouseleave);
		this.#eventsRegister.mouseenter = this.$.eventManager.addEvent(canvas, 'mouseenter', this.#events.mouseenter);

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if (env.isResizeObserverSupported) {
			this.resizeObserver = new ResizeObserver(() => {
				const prevWidth = canvas.width;
				const prevHeight = canvas.height;
				const newWidth = canvas.offsetWidth;
				const newHeight = canvas.offsetHeight;
				canvas.width = newWidth;
				canvas.height = newHeight;
				if (prevWidth !== canvas.width || prevHeight !== canvas.height) {
					if (this.pluginOptions.maintainRatio) this.#adjustPathsToNewDimensions(prevWidth, prevHeight, newWidth, newHeight);
					this.#drawAll();
				}
			});

			this.resizeObserver.observe(canvas);
		}
	}

	/**
	 * @description Destroys the drawing canvas, removes event listeners, and clears stored drawing data.
	 */
	#destroyDrawing() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if (this.canvas) {
			this.$.eventManager.removeEvent(this.#eventsRegister.mousedown);
			this.$.eventManager.removeEvent(this.#eventsRegister.mousemove);
			this.$.eventManager.removeEvent(this.#eventsRegister.mouseup);
			this.$.eventManager.removeEvent(this.#eventsRegister.mouseleave);
			this.$.eventManager.removeEvent(this.#eventsRegister.mouseenter);
		}

		this.canvas = null;
		this.ctx = null;
		this.points = [];
		this.paths = [];
		this.isDrawing = false;
	}

	/**
	 * @description Configures the drawing context (canvas settings like line width, color, etc.).
	 */
	#setCtx() {
		this.ctx.lineWidth = this.pluginOptions.lineWidth;
		this.ctx.lineCap = this.pluginOptions.lineCap;
		this.ctx.strokeStyle = this.pluginOptions.lineColor || _w.getComputedStyle(this.$.contextProvider.carrierWrapper).color;
	}

	/**
	 * @description Draws the current stroke based on collected points.
	 */
	#draw() {
		this.#setCtx();
		this.ctx.beginPath();
		this.points.forEach(([x, y], i) => {
			if (i === 0) {
				this.ctx.moveTo(x, y);
			} else {
				this.ctx.lineTo(x, y);
			}
		});
		this.ctx.stroke();
	}

	/**
	 * @description Redraws all stored paths onto the canvas.
	 */
	#drawAll() {
		this.#setCtx();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.paths.forEach((path) => {
			this.points = path;
			this.#draw();
		});
		this.points = [];
	}

	/**
	 * @description Adjusts all stored paths to fit new canvas dimensions after a resize event.
	 * @param {number} prevWidth - The previous width of the canvas.
	 * @param {number} prevHeight - The previous height of the canvas.
	 * @param {number} newWidth - The new width of the canvas.
	 * @param {number} newHeight - The new height of the canvas.
	 */
	#adjustPathsToNewDimensions(prevWidth, prevHeight, newWidth, newHeight) {
		const xRatio = newWidth / prevWidth;
		const yRatio = newHeight / prevHeight;

		this.paths = this.paths.map((path) => path.map(([x, y]) => [x * xRatio, y * yRatio]));
	}

	/**
	 * @description Clears the canvas and resets stored drawing paths.
	 */
	#clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.points = [];
		this.paths = [];
	}

	/**
	 * @description Generates an SVG representation of the drawn content.
	 * @returns {*} The generated SVG element.
	 */
	#getSVG() {
		const svgNS = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('width', this.canvas.width + '');
		svg.setAttribute('height', this.canvas.height + '');
		svg.setAttribute('viewBox', `0 0 ${this.canvas.width} ${this.canvas.height}`);
		svg.setAttribute('xmlns', svgNS);

		this.paths.forEach((path) => {
			const pathData = path.reduce((acc, [x, y], i) => {
				return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
			}, '');
			const svgPath = document.createElementNS(svgNS, 'path');
			svgPath.setAttribute('d', pathData);
			svgPath.setAttribute('fill', 'none');
			svgPath.setAttribute('stroke', String(this.ctx.strokeStyle));
			svgPath.setAttribute('stroke-width', this.ctx.lineWidth + '');
			svg.appendChild(svgPath);
		});

		return svg;
	}

	/**
	 * @description Converts the SVG element into a downloadable file.
	 * @returns {FileList} A FileList containing the generated SVG file.
	 */
	#getSVGFileList() {
		const svgElement = this.#getSVG();
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(svgElement);
		const blob = new Blob([svgString], { type: 'image/svg+xml' });
		const file = new File([blob], 'drawing.svg', { type: 'image/svg+xml' });

		// Creating a FileList
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(file);

		return dataTransfer.files;
	}

	/**
	 * @description Retrieves touch coordinates relative to the canvas.
	 * @param {TouchEvent} e - The touch event.
	 * @returns {{x: number, y: number}} An object containing the x and y coordinates.
	 */
	#getCanvasTouchPointer(e) {
		const { touches } = e;
		const rect = this.canvas.getBoundingClientRect();
		const x = touches[0].clientX - rect.left;
		const y = touches[0].clientY - rect.top;
		return { x, y };
	}

	/**
	 * @description Activates either block or inline format mode for inserted drawings.
	 * @param {boolean} isInline - Whether the drawing should be inserted as an inline element.
	 */
	#activeAsInline(isInline) {
		if (isInline) {
			dom.utils.addClass(this.asInline, 'on');
			dom.utils.removeClass(this.asBlock, 'on');
			this.as = 'inline';
		} else {
			dom.utils.addClass(this.asBlock, 'on');
			dom.utils.removeClass(this.asInline, 'on');
			this.as = 'block';
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnCanvasMouseDown(e) {
		e.preventDefault();
		this.isDrawing = true;
		this.points.push([e.offsetX, e.offsetY]);
		this.#draw();
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnCanvasMouseMove(e) {
		e.preventDefault();
		if (!this.isDrawing) return;
		this.points.push([e.offsetX, e.offsetY]);
		this.#draw();
	}

	/**
	 * @param {TouchEvent} e - Event object
	 */
	#OnCanvasTouchStart(e) {
		e.preventDefault();
		const { x, y } = this.#getCanvasTouchPointer(e);
		this.isDrawing = true;
		this.points.push([x, y]);
		this.#draw();
	}

	/**
	 * @param {TouchEvent} e - Event object
	 */
	#OnCanvasTouchMove(e) {
		e.preventDefault();
		const { x, y } = this.#getCanvasTouchPointer(e);
		if (!this.isDrawing) return;
		this.points.push([x, y]);
		this.#draw();
	}

	#OnCanvasMouseUp() {
		this.isDrawing = false;
		if (this.points.length > 0) {
			this.paths.push([...this.points]);
			this.points = [];
		}
	}

	#OnCanvasMouseLeave() {
		if (this.isDrawing) {
			this.paths.push([...this.points]);
			if (!this.pluginOptions.lineReconnect) {
				this.points = [];
				this.isDrawing = false;
			}
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnCanvasMouseEnter(e) {
		if (e.buttons === 1) {
			this.isDrawing = true;
			if (!this.pluginOptions.lineReconnect) {
				this.points.push([e.offsetX, e.offsetY]);
			} else {
				const lastPath = this.paths.at(-1);
				const lastPoint = lastPath.at(-1);
				this.points.push([lastPoint[0], lastPoint[1]]);
				this.points.push([e.offsetX, e.offsetY]);
			}
			this.#draw();
		}
	}

	#OnRemove() {
		this.#clearCanvas();
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClickAsButton(e) {
		this.#activeAsInline(dom.query.getEventTarget(e).getAttribute('data-command') === 'asInline');
	}
}

/**
 * @param {SunEditor.Deps} $ - Kernel dependencies
 * @param {DrawingPluginOptions} pluginOptions - Drawing plugin options
 * @returns {HTMLElement}
 */
function CreateHTML_modal({ lang, icons }, pluginOptions) {
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
									${dom.utils.createTooltipInner(lang.blockStyle)}
								</button>
								<button type="button" class="se-btn se-tooltip" data-command="asInline" aria-label="${lang.inlineStyle}">
									${icons.as_inline}
									${dom.utils.createTooltipInner(lang.inlineStyle)}
								</button>
							</div>`
							: ''
					}
					<div class="se-modal-flex-group">
						<button type="button" class="se-btn se-tooltip" data-command="remove" aria-label="${lang.remove}">
							${icons.eraser}
							${dom.utils.createTooltipInner(lang.remove)}
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

	return dom.utils.createElement(
		'DIV',
		{
			class: 'se-modal-content se-modal-responsive',
			style: `max-width: ${maxWidth}; max-height: ${maxHeight};`,
		},
		html,
	);
}

export default Drawing;
