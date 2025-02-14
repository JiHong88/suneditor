import { domUtils, env } from '../helper';
import Controller from './Controller';

const { isMobile } = env;

const SIZE = 240;
const BAR_H = 28;
const MIDDLE = SIZE / 2;
const LIGHTNESS_CONT_VALUE = 50;
const CLOSE_TO_CENTER_THRESHOLD = 3;
const FIXED_DEC = 10;
const SATURATION = 1;
const GRADIENT_RADIUS = 14;
const DEFAULT_COLOR_VALUE = { hex: '#FFFFFF', r: 255, g: 255, b: 255, h: 0, s: 1, l: 1 };

let LIGHTNESS = 0;
let isWheelragging = false;
let isBarDragging = false;
let wheelX = SIZE / 2;
let wheelY = SIZE / 2;
let finalColor = DEFAULT_COLOR_VALUE;
let ctx;

function CreateSliderCtx() {
	const offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.width = SIZE;
	offscreenCanvas.height = SIZE;

	const html = /*html*/ `
	<div class="se-hue-slider-container" style="width: ${SIZE}px; height: ${SIZE}px;">
      <canvas class="se-hue-wheel" width="${SIZE}" height="${SIZE}"></canvas>
      <div class="se-hue-wheel-pointer"></div>
    </div>
    <div class="se-hue-gradient-container">
      <canvas class="se-hue-gradient" width="${SIZE}" height="${BAR_H}"></canvas>
      <div class="se-hue-gradient-pointer"></div>
    </div>
    <div class="se-hue-final-hex" style="width:${SIZE}px; height: ${BAR_H}px;">
		<div style="flex: 3; line-height: 1.5;">${DEFAULT_COLOR_VALUE.hex}</div>
		<div style="flex: 1; height: 100%; border: 1px solid #fff; outline: 1px solid #000;"></div>
	</div>
	`;

	const slider = domUtils.createElement('DIV', { class: 'se-hue-slider' }, html);
	const wheelCanvas = /** @type {HTMLCanvasElement} */ (slider.querySelector('.se-hue-wheel'));
	const gradientBarCanvas = slider.querySelector('.se-hue-gradient');
	const currentColors = slider.querySelector('.se-hue-final-hex').children;

	return {
		slider,
		offscreenCanvas,
		offscreenCtx: offscreenCanvas.getContext('2d'),
		wheel: wheelCanvas,
		wheelCtx: wheelCanvas.getContext('2d'),
		wheelPointer: slider.querySelector('.se-hue-wheel-pointer'),
		gradientBar: gradientBarCanvas,
		gradientPointer: slider.querySelector('.se-hue-gradient-pointer'),
		fanalColorHex: currentColors[0],
		fanalColorBackground: currentColors[1]
	};
}

/**
 * @typedef {import('../modules/Controller').ControllerParams} ControllerParams
 */

/**
 * @typedef {Object} HueSliderColor
 * @property {string} hex - HEX color
 * @property {number} r - Red color value
 * @property {number} g - Green color value
 * @property {number} b - Blue color value
 * @property {number} h - Hue color value
 * @property {number} s - Saturation color value
 * @property {number} l - Lightness color value
 */

/**
 * @typedef {Object} HueSliderParams
 * @property {Element} form The form element to attach the hue slider.
 * @property {boolean} isNewForm Whether to create a new form element.
 * @property {ControllerParams} controllerOptions Controller options
 */

/**
 * @constructor
 * @description Create a Hue slider. (only create one at a time)
 * - When you call the .attach() method, the hue slider is appended to the form element.
 * It must be called every time it is used.
 * @param {*} inst The instance object that called the constructor.
 * @param {HueSliderParams=} [params={}] Hue slider options
 * @param {string} className The class name of the hue slider.
 */
function HueSlider(inst, params, className) {
	if (!params) params = {};

	this.editor = inst.editor;
	this.eventManager = inst.eventManager;
	this.inst = inst;

	// members
	this.form = params.form;
	this.ctx = {
		wheelX: wheelX,
		wheelY: wheelY,
		lightness: LIGHTNESS,
		wheelPointerX: '50%',
		wheelPointerY: '50%',
		gradientPointerX: 'calc(100% - 14px)',
		color: DEFAULT_COLOR_VALUE
	};
	this.isOpen = false;
	this.controlle = null;
	this.__globalMouseDown = null;
	this.__globalMouseMove = null;
	this.__globalMouseUp = null;

	// init default controller
	if (!params.isNewForm) {
		const hueController = CreateHTML_basicControllerForm(inst.editor, className);
		this.form = hueController.querySelector('.se-hue');
		this.controller = new Controller(this, hueController, { position: 'top', isWWTarget: false, ...params.controllerOptions });

		// buttons
		this.eventManager.addEvent(hueController.querySelector('.se-btn-success'), 'click', () => {
			inst.hueSliderAction(this.get());
			this.close();
		});
		this.eventManager.addEvent(hueController.querySelector('.se-btn-danger'), 'click', () => {
			this.close();
		});
	}
}

HueSlider.prototype = {
	/**
	 * @description Get the current color information.
	 * @returns {HueSliderColor} color information
	 */
	get() {
		return finalColor;
	},

	/**
	 * @description Open the hue slider.
	 * @param {Element} target The element to attach the hue slider.
	 */
	open(target) {
		this.attach();
		this.controller.open(target, null, { isWWTarget: false, initMethod: null, addOffset: null });
	},

	/**
	 * @description Reset information and close the hue slider.
	 */
	off() {
		this.ctx = {
			gradientPointerX: gradientPointer.style.left,
			wheelPointerX: wheelPointer.style.left,
			wheelPointerY: wheelPointer.style.top,
			wheelX: wheelX,
			wheelY: wheelY,
			lightness: LIGHTNESS,
			color: ctx?.color || getWheelColor(wheelCtx)
		};

		this.controller.close();
		this.init();
	},

	/**
	 * @description Close the hue slider. (include off method)
	 * - Call the instance's hueSliderCancelAction method.
	 */
	close() {
		this.off();
		this.inst.hueSliderCancelAction();
	},

	/**
	 * @description Attach the hue slider to the form element.
	 * @param {Element} form The element to attach the hue slider.
	 */
	attach(form) {
		// drow
		this.init();
		(form || this.form).appendChild(slider);
		ctx = this.ctx;
		if (ctx) {
			wheelX = ctx.wheelX;
			wheelY = ctx.wheelY;
			LIGHTNESS = ctx.lightness;
			wheelPointer.style.left = ctx.wheelPointerX;
			wheelPointer.style.top = ctx.wheelPointerY;
			gradientPointer.style.left = ctx.gradientPointerX;
			setHex(ctx.color.hex);

			drawColorWheel();
			createGradientBar(getDefaultColor());
		}

		// event
		const downEvent = { name: 'mousedown', func: OnMousedown };
		const moveEvent = { name: 'mousemove', func: OnMousemove, option: true };
		const upEvent = {
			name: 'mouseup',
			func: () => {
				isWheelragging = false;
				isBarDragging = false;
			}
		};

		if (isMobile) {
			// mobile name
			downEvent.name = 'touchstart';
			moveEvent.name = 'touchmove';
			upEvent.name = 'touchend';
			// mobile func
			downEvent.func = OnTouchstart;
			moveEvent.func = OnTouchmove;
		}

		this.__globalMouseDown = this.eventManager.addGlobalEvent(downEvent.name, downEvent.func, { passive: false, useCapture: true });
		this.__globalMouseMove = this.eventManager.addGlobalEvent(moveEvent.name, moveEvent.func, true);
		this.__globalMouseUp = this.eventManager.addGlobalEvent(upEvent.name, upEvent.func, true);
		this.isOpen = true;
	},

	/**
	 * @description Initialize the hue slider information.
	 */
	init() {
		this.isOpen = false;
		isWheelragging = false;
		isBarDragging = false;
		if (this.__globalMouseDown) this.__globalMouseDown = this.eventManager.removeGlobalEvent(this.__globalMouseDown);
		if (this.__globalMouseMove) this.__globalMouseMove = this.eventManager.removeGlobalEvent(this.__globalMouseMove);
		if (this.__globalMouseUp) this.__globalMouseUp = this.eventManager.removeGlobalEvent(this.__globalMouseUp);
	},

	constructor: HueSlider
};

// init
const { slider, offscreenCanvas, offscreenCtx, wheel, wheelCtx, wheelPointer, gradientBar, gradientPointer, fanalColorHex, fanalColorBackground } = CreateSliderCtx();

// mobile
function OnTouchstart(event) {
	const { target, touches } = event;
	const clientX = touches[0].clientX;
	const clientY = touches[0].clientY;

	if (target === wheel) {
		event.preventDefault();
		isBarDragging = false;
		isWheelragging = true;
		updatePointer_wheel(clientX, clientY);
	} else if (target === gradientBar) {
		event.preventDefault();
		isBarDragging = true;
		isWheelragging = false;
		updatePointer_bar(clientX);
	}
}

function OnTouchmove(event) {
	event.preventDefault();

	const { touches } = event;
	const clientX = touches[0].clientX;
	const clientY = touches[0].clientY;

	if (isWheelragging) {
		updatePointer_wheel(clientX, clientY);
	} else if (isBarDragging) {
		updatePointer_bar(clientX);
	}
}

// pc
function OnMousedown({ target, clientX, clientY }) {
	if (target === wheel) {
		isBarDragging = false;
		isWheelragging = true;
		updatePointer_wheel(clientX, clientY);
	} else if (target === gradientBar) {
		isBarDragging = true;
		isWheelragging = false;
		updatePointer_bar(clientX);
	}
}

function OnMousemove({ clientX, clientY }) {
	if (isWheelragging) {
		updatePointer_wheel(clientX, clientY);
	} else if (isBarDragging) {
		updatePointer_bar(clientX);
	}
}

function updatePointer_wheel(x, y) {
	const rect = wheel.getBoundingClientRect();
	x = x - rect.left - MIDDLE;
	y = y - rect.top - MIDDLE;

	const angle = (Math.atan2(y, x) * 180) / Math.PI;
	const distance = Math.min(Math.sqrt(x * x + y * y), MIDDLE);

	const posX = MIDDLE + distance * Math.cos((angle * Math.PI) / 180);
	const posY = MIDDLE + distance * Math.sin((angle * Math.PI) / 180);

	wheelPointer.style.left = `${posX}px`;
	wheelPointer.style.top = `${posY}px`;

	wheelPickedColor(posX, posY);
	setFinalColor();
}

function updatePointer_bar(x) {
	const rect = gradientBar.getBoundingClientRect();
	let posX = x - rect.left;
	posX = Math.max(GRADIENT_RADIUS, Math.min(posX, rect.width - GRADIENT_RADIUS));

	gradientPointer.style.left = `${posX}px`;

	selectGradientColor(x);
	setFinalColor();
}

function wheelPickedColor(posX, posY) {
	wheelX = posX;
	wheelY = posY;
	createGradientBar(getDefaultColor());
}

function createGradientBar(color) {
	const gradientBarCtx = gradientBar.getContext('2d');
	const gradient = gradientBarCtx.createLinearGradient(0, 0, gradientBar.width, 0);

	gradient.addColorStop(0, 'black'); // 왼쪽은 검은색
	gradient.addColorStop(1, color.hex); // 오른쪽은 선택한 색상

	gradientBarCtx.fillStyle = gradient;
	gradientBarCtx.fillRect(0, 0, gradientBar.width, gradientBar.height);
}

function getDefaultColor() {
	return getWheelColor(offscreenCtx);
}

function setFinalColor() {
	ctx.color = finalColor = getWheelColor(wheelCtx);
	setHex(finalColor.hex);
}

function setHex(hex) {
	fanalColorBackground.style.backgroundColor = fanalColorHex.textContent = hex;
}

function getWheelColor(wCtx) {
	const pixel = wCtx.getImageData(wheelX, wheelY, 1, 1).data;
	// eslint-disable-next-line prefer-const
	let [h, s, l] = rgbToHsl(pixel);

	// Calculate distance from the center of the wheel
	const dx = wheelX - MIDDLE;
	const dy = wheelY - MIDDLE;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance < CLOSE_TO_CENTER_THRESHOLD) {
		l = 1 - LIGHTNESS;
	}

	if (l > 1) l = 1;
	if (l < 0) l = 0;

	// Adjust lightness based on LIGHTNESS value
	const { r, g, b } = hslToRgb([h, s, l]);

	// Convert RGB to HEX
	const hex = `#${rgbToHex({ r, g, b })}`;

	return {
		hex,
		r,
		g,
		b,
		h,
		s,
		l: roundNumber(l)
	};
}

function selectGradientColor(x) {
	const boundingRect = gradientBar.getBoundingClientRect();
	let posX = x - boundingRect.left;

	if (posX < 0) posX = 0;
	if (posX > boundingRect.width) posX = boundingRect.width;

	const tolerance = GRADIENT_RADIUS;

	// If a click occurs near the end, the value is corrected all the way to the end.
	if (posX >= gradientBar.width - tolerance) {
		posX = gradientBar.width;
	} else if (posX <= tolerance) {
		posX = 0;
	}

	const normalizedLightness = 1 - posX / boundingRect.width; // 1 ~ 0
	LIGHTNESS = normalizedLightness; // 0 ~ 1

	drawColorWheel();
}

function drawColorWheel() {
	// init main canvas
	wheelCtx.clearRect(0, 0, SIZE, SIZE);

	// copy offscreen to main canvas
	wheelCtx.drawImage(offscreenCanvas, 0, 0);

	// drow dark wheel
	drawWheelGradient();
}

function drawWheelGradient() {
	wheelCtx.globalAlpha = LIGHTNESS; // 0: white, 1: black
	wheelCtx.fillStyle = 'black';
	wheelCtx.beginPath();
	wheelCtx.arc(MIDDLE, MIDDLE, MIDDLE, 0, 2 * Math.PI);
	wheelCtx.fill();
	wheelCtx.globalAlpha = 1.0;
}

function drawColorWheelToContext(context) {
	if (!context) throw new Error('Context not found.');

	const fixedSaturation = SATURATION * 100;

	for (let h = 0; h <= 360; h += 0.5) {
		for (let distance = 0; distance <= MIDDLE; distance += 1) {
			context.beginPath();

			const dynamicLightness = LIGHTNESS_CONT_VALUE + ((MIDDLE - distance) / MIDDLE) * 50;

			context.fillStyle = `hsl(${h}, ${fixedSaturation}%, ${dynamicLightness}%)`;

			const posX = MIDDLE + Math.cos(degreeToRadian(h)) * distance;
			const posY = MIDDLE - Math.sin(degreeToRadian(h)) * distance;

			context.arc(posX, posY, 1.5, 0, 2 * Math.PI);
			context.fill();
		}
	}
}

function degreeToRadian(deg) {
	return (deg * Math.PI) / 180;
}

function rgbToHsl([r, g, b]) {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h, s;
	const l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return [roundNumber(h), roundNumber(s), roundNumber(l)];
}

function hslToRgb([h, s, l]) {
	let r, g, b;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

function rgbToHex({ r, g, b }) {
	let hexR = Math.floor(r).toString(16);
	if (r < 16) hexR = `0${hexR}`;
	let hexG = Math.floor(g).toString(16);
	if (g < 16) hexG = `0${hexG}`;
	let hexB = Math.floor(b).toString(16);
	if (b < 16) hexB = `0${hexB}`;
	return `${hexR}${hexG}${hexB}`.toUpperCase();
}

function roundNumber(num) {
	const factor = Math.pow(10, FIXED_DEC);
	return Math.round(num * factor) / factor;
}

// create
drawColorWheelToContext(offscreenCtx);
drawColorWheel();

function CreateHTML_basicControllerForm({ lang, icons }, className) {
	const hueController = domUtils.createElement(
		'DIV',
		{ class: `se-controller ${className}` },
		/*html*/ `
		<div class="se-hue"></div>
		<div class="se-form-group se-form-w0 se-form-flex-btn">
			<button type="button" class="se-btn se-btn-success" title="${lang.submitButton}" aria-label="${lang.submitButton}">${icons.checked}</button>
			<button type="button" class="se-btn se-btn-danger" title="${lang.close}" aria-label="${lang.close}">${icons.cancel}</button>
		</div>
	`
	);

	return hueController;
}

export default HueSlider;
