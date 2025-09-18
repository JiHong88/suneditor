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
global.XMLHttpRequest = global.XMLHttpRequest || class XMLHttpRequest {
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

// Add any other global mocks or setup here