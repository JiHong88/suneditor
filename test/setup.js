// Global test setup for Jest
// This file runs before each test file

// Mock browser APIs that might be missing in jsdom
global.ResizeObserver = class ResizeObserver {
	constructor(callback) {
		this.callback = callback;
	}
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock XMLHttpRequest if needed
global.XMLHttpRequest =
	global.XMLHttpRequest ||
	class XMLHttpRequest {
		constructor() {
			this.readyState = 0;
			this.status = 0;
			this.statusText = '';
			this.responseText = '';
			this.response = '';
		}
		open() {}
		send() {}
		setRequestHeader() {}
		abort() {}
	};

// Mock Canvas getContext for HueSlider
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
	if (contextType === '2d') {
		return {
			fillStyle: '',
			strokeStyle: '',
			lineWidth: 1,
			clearRect: jest.fn(),
			fillRect: jest.fn(),
			strokeRect: jest.fn(),
			beginPath: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn(),
			arc: jest.fn(),
			closePath: jest.fn(),
			fill: jest.fn(),
			stroke: jest.fn(),
			createLinearGradient: jest.fn(() => ({
				addColorStop: jest.fn()
			})),
			createRadialGradient: jest.fn(() => ({
				addColorStop: jest.fn()
			})),
			getImageData: jest.fn(() => ({
				data: new Uint8ClampedArray(4),
				width: 1,
				height: 1
			})),
			putImageData: jest.fn(),
			drawImage: jest.fn(),
			canvas: {
				width: 300,
				height: 150
			}
		};
	}
	return null;
});

// Mock window.open
window.open = jest.fn();

// Mock visualViewport
if (!('visualViewport' in window)) {
	Object.defineProperty(window, 'visualViewport', {
		configurable: true,
		value: {
			width: 1200,
			height: 800,
			scale: 1,
			offsetTop: 0,
			offsetLeft: 0,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			_listeners: {},
			dispatchEvent(ev) {
				const list = this._listeners?.[ev.type] || [];
				list.forEach((fn) => fn(ev));
			}
		}
	});
}

// Mock ClipboardEvent for Jest environment
if (typeof jest !== 'undefined') {
	global.ClipboardEvent = class ClipboardEvent extends Event {
		constructor(type, options = {}) {
			super(type, options);
			this.clipboardData = options.clipboardData || {
				getData: jest.fn(() => ''),
				setData: jest.fn(),
				clearData: jest.fn(),
				files: [],
				items: [],
				types: []
			};
		}
	};

	// Also add to window for browser compatibility
	if (typeof window !== 'undefined') {
		window.ClipboardEvent = global.ClipboardEvent;
	}
}

// Ensure DataTransfer is also available
if (typeof global.DataTransfer === 'undefined' && typeof jest !== 'undefined') {
	global.DataTransfer = class DataTransfer {
		constructor() {
			this.dropEffect = 'none';
			this.effectAllowed = 'all';
			this.files = [];
			this.items = [];
			this.types = [];
		}

		getData(format) { return ''; }
		setData(format, data) {}
		clearData(format) {}
	};

	if (typeof window !== 'undefined') {
		window.DataTransfer = global.DataTransfer;
	}
}

// Add TextEncoder and TextDecoder polyfills for jsdom environment
// These are needed for char.getByteLength() tests
if (typeof global.TextEncoder === 'undefined') {
	const util = require('util');
	global.TextEncoder = util.TextEncoder;
	global.TextDecoder = util.TextDecoder;

	if (typeof window !== 'undefined') {
		window.TextEncoder = global.TextEncoder;
		window.TextDecoder = global.TextDecoder;
	}
}
