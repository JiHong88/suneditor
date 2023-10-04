import { domUtils, numbers } from '../helper';

const SIZE = 250;
const MIDDLE = SIZE / 2;
const LIGHTNESS_CONT_VALUE = 50;
const CLOSE_TO_CENTER_THRESHOLD = 3;
const FIXED_DEC = 10;
const SATURATION = 1;

let LIGHTNESS = 0;
let isWheelragging = false;
let isBarDragging = false;
let wheelX = SIZE / 2;
let wheelY = SIZE / 2;

function CreateSliderCtx() {
	const offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.width = SIZE;
	offscreenCanvas.height = SIZE;

	const html = `
	<div class="se-hue-slider-container">
      <canvas class="se-hue-wheel" width="${SIZE}" height="${SIZE}"></canvas>
      <div class="se-hue-wheel-pointer"></div>
    </div>
    <div class="se-hue-gradient-container">
      <canvas class="se-hue-gradient" width="${SIZE}" height="28"></canvas>
      <div class="se-hue-gradient-pointer"></div>
    </div>
    <div class="se-hue-final-hex" style="width:240px; height: 30px; margin-top: 20px;"></div>
	`;

	const slider = domUtils.createElement('DIV', { class: 'se-hue-slider' }, html);
	const wheel = slider.querySelector('.se-hue-wheel');
	const gradientBar = slider.querySelector('.se-hue-gradient');

	return {
		slider,
		offscreenCanvas,
		offscreenCtx: offscreenCanvas.getContext('2d'),
		wheel,
		wheelCtx: wheel.getContext('2d'),
		wheelPointer: slider.querySelector('.se-hue-wheel-pointer'),
		gradientBar,
		gradientPointer: slider.querySelector('.se-hue-gradient-pointer'),
		gradientRadius: numbers.get(getComputedStyle(gradientBar).borderRadius),
		currentColor: slider.querySelector('.se-hue-final-hex')
	};
}

/**
 * @description Create a Hue slider. (only create one at a time)
 * @param {{form: Element}} params {form: Element}
 */
const HueSlider = function (editor, params) {
	this.eventManager = editor.eventManager;

	// members
	this.form = params.form;
	this.__globalMouseMove = null;
	this.__globalMouseUp = null;
};

HueSlider.prototype = {
	open() {
		this.form.appendChild(slider);
		this.__globalMouseMove = this.eventManager.addEvent(document, 'mousemove', (event) => {
			if (isWheelragging) {
				this.updatePointer_wheel(event.clientX, event.clientY);
			} else if (isBarDragging) {
				this.updatePointer_bar(event.clientX);
			}
		});
		this.__globalMouseUp = this.eventManager.addEvent(document, 'mouseup', () => {
			isWheelragging = false;
			isBarDragging = false;
		});
		drawColorWheel();
	},

	close() {
		isWheelragging = false;
		isBarDragging = false;
		if (this.__globalMouseMove) this.__globalMouseMove = this.eventManager.removeGlobalEvent(this.__globalMouseMove);
		if (this.__globalMouseUp) this.__globalMouseUp = this.eventManager.removeGlobalEvent(this.__globalMouseUp);
	},

	constructor: HueSlider
};

// init
const { slider, offscreenCanvas, offscreenCtx, wheel, wheelCtx, wheelPointer, gradientBar, gradientPointer, gradientRadius, currentColor } = CreateSliderCtx();

function updatePointer_wheel(x, y) {
	const rect = wheel.getBoundingClientRect();
	x = x - rect.left - radius;
	y = y - rect.top - radius;

	const angle = (Math.atan2(y, x) * 180) / Math.PI;
	const distance = Math.min(Math.sqrt(x * x + y * y), radius);

	const posX = radius + distance * Math.cos((angle * Math.PI) / 180);
	const posY = radius + distance * Math.sin((angle * Math.PI) / 180);

	wheelPointer.style.left = `${posX}px`;
	wheelPointer.style.top = `${posY}px`;

	wheelPickedColor(posX, posY);
	getFinalColor();
}

function updatePointer_bar(x) {
	const rect = gradientBar.getBoundingClientRect();
	let posX = x - rect.left;
	posX = Math.max(gradientRadius, Math.min(posX, rect.width - gradientRadius));

	gradientPointer.style.left = `${posX}px`;

	selectGradientColor(x);
	getFinalColor();
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

function getFinalColor() {
	return getWheelColor(wheelCtx);
}

function getWheelColor(wheelCtx) {
	const pixel = wheelCtx.getImageData(wheelX, wheelY, 1, 1).data;
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

	const tolerance = gradientRadius;

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

			let dynamicLightness = LIGHTNESS_CONT_VALUE + ((MIDDLE - distance) / MIDDLE) * 50;

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

	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
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

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
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

function hexToRgb(hex) {
	const bigint = parseInt(hex.slice(1), 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return { r, g, b };
}

function roundNumber(num) {
	const factor = Math.pow(10, FIXED_DEC);
	return Math.round(num * factor) / factor;
}

wheel.addEventListener('mousedown', (event) => {
	isWheelragging = true;
	isBarDragging = false;
	updatePointer_wheel(event.clientX, event.clientY);
});

gradientBar.addEventListener('mousedown', (event) => {
	isBarDragging = true;
	isWheelragging = false;
	updatePointer_bar(event.clientX);
});

// create
drawColorWheelToContext(offscreenCtx);

export default HueSlider;
