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
