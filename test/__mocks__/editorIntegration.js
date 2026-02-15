/**
 * @fileoverview Real Editor integration helpers for testing
 * Creates actual Editor instances with minimal configuration for testing
 */

import Editor from '../../src/core/editor';

/**
 * Creates a minimal DOM structure for editor testing
 */
function createTestDOM() {
	// Create a minimal target element
	const target = document.createElement('textarea');
	target.value = 'Initial test content';
	target.id = 'test-editor';

	// Add to document body for proper testing
	document.body.appendChild(target);

	// Mock JSDOM-specific issues
	if (typeof window !== 'undefined') {
		// Mock visualViewport for JSDOM
		if (!window.visualViewport) {
			window.visualViewport = {
				height: 800,
				width: 1200,
				addEventListener: () => {},
				removeEventListener: () => {}
			};
		}

		// Mock getComputedStyle for elements that don't exist yet
		const originalGetComputedStyle = window.getComputedStyle;
		window.getComputedStyle = function(element, pseudoElement) {
			if (!element || !element.nodeType) {
				return {
					scrollMargin: '0px',
					paddingBottom: '0px',
					getPropertyValue: () => '0px'
				};
			}
			try {
				return originalGetComputedStyle.call(this, element, pseudoElement);
			} catch (e) {
				return {
					scrollMargin: '0px',
					paddingBottom: '0px',
					getPropertyValue: () => '0px'
				};
			}
		};

		// Mock Selection API if not available
		if (!window.getSelection) {
			window.getSelection = () => ({
				rangeCount: 0,
				getRangeAt: () => document.createRange(),
				addRange: () => {},
				removeAllRanges: () => {},
				toString: () => ''
			});
		}

		// Mock DragEvent for JSDOM
		if (!window.DragEvent) {
			window.DragEvent = class DragEvent extends Event {
				constructor(type, eventInitDict = {}) {
					super(type, eventInitDict);
					this.dataTransfer = eventInitDict.dataTransfer || {
						types: [],
						files: [],
						items: [],
						dropEffect: 'none',
						effectAllowed: 'all',
						getData: () => '',
						setData: () => {},
						clearData: () => {}
					};
					this.clientX = eventInitDict.clientX || 0;
					this.clientY = eventInitDict.clientY || 0;
					this.screenX = eventInitDict.screenX || 0;
					this.screenY = eventInitDict.screenY || 0;
					this.altKey = eventInitDict.altKey || false;
					this.ctrlKey = eventInitDict.ctrlKey || false;
					this.metaKey = eventInitDict.metaKey || false;
					this.shiftKey = eventInitDict.shiftKey || false;
				}
			};
		}

		// Mock File constructor if not available
		if (!window.File) {
			window.File = class File extends Blob {
				constructor(fileBits, fileName, options = {}) {
					super(fileBits, options);
					this.name = fileName;
					this.lastModified = options.lastModified || Date.now();
					this.webkitRelativePath = '';
				}
			};
		}

		// Mock TextEncoder and TextDecoder for char.getByteLength() tests
		if (!window.TextEncoder) {
			// Use Node.js util.TextEncoder if available
			const util = require('util');
			window.TextEncoder = util.TextEncoder;
			window.TextDecoder = util.TextDecoder;
		}

		// Mock querySelectorAll to return proper NodeList-like objects
		const originalQuerySelectorAll = document.querySelectorAll;
		document.querySelectorAll = function(selector) {
			try {
				const result = originalQuerySelectorAll.call(this, selector);
				// Ensure all elements in the result have addEventListener
				for (let i = 0; i < result.length; i++) {
					if (result[i] && typeof result[i].addEventListener !== 'function') {
						result[i].addEventListener = () => {};
						result[i].removeEventListener = () => {};
					}
				}
				return result;
			} catch (e) {
				// Return empty NodeList-like object
				return {
					length: 0,
					item: () => null,
					forEach: () => {},
					[Symbol.iterator]: function* () {}
				};
			}
		};
	}

	return { target };
}

/**
 * Creates a real Editor instance with minimal options for testing
 */
export function createTestEditor(customOptions = {}) {
	const { target } = createTestDOM();

	// Minimal options to prevent external dependencies and complex UI
	const defaultOptions = {
		plugins: [], // No plugins to avoid complex dependencies
		width: '100%',
		height: '200px',
		minHeight: '100px',
		showPathLabel: false,
		popupDisplay: 'local', // Use local instead of full for faster init
		resizingBar: false,
		charCounter: false,
		maxCharCount: null,
		tabDisable: false,
		buttonList: [], // Minimal toolbar for faster init
		formats: ['p'], // Minimal formats
		colorList: [], // Minimal colors
		// Disable features that might cause issues in testing
		videoResizing: false,
		imageResizing: false,
		stickyToolbar: false,
		iframe: false,
		// Disable auto height to prevent iframe-related DOM operations
		height: 'auto',
		minHeight: null,
		maxHeight: null,
		codeMirror: false,
		katex: false,
		mathJax: false,
		// Performance optimizations for testing
		historyStackDelayTime: 0,
		callBackSave: null,
		// Disable animations and transitions
		__internal: {
			disableAnimations: true
		},
		// Additional performance optimizations for testing
		statusbar: false, // Disable statusbar for faster init
		toolbar_hide: true, // Hide toolbar initially for faster init
		mode: 'classic', // Use classic mode for simpler initialization
		...customOptions
	};

	try {
		// Create multiTargets format that Editor expects
		const multiTargets = [{ key: null, target }];

		// Create the actual editor
		const editor = new Editor(multiTargets, defaultOptions);

		// Store reference to target for cleanup
		editor._testTarget = target;

		return editor;
	} catch (error) {
		// Clean up on failure
		if (target && target.parentNode) {
			target.parentNode.removeChild(target);
		}
		throw new Error(`Failed to create test editor: ${error.message}\n${error.stack}`);
	}
}

/**
 * Waits for the editor to be fully initialized.
 * In the new architecture, Editor exposes deps via editor.$ (the KernelInjector $ deps bag).
 */
export function waitForEditorReady(editor, timeout = 15000) {
	return new Promise((resolve, reject) => {
		const start = Date.now();

		function check() {
			try {
				// In the new architecture, Editor stores everything under editor.$
				const has$ = editor && editor.$;
				const hasContext = has$ && editor.$.context && typeof editor.$.context.get === 'function';
				const hasFrameContext = has$ && editor.$.frameContext;
				const hasWysiwyg = hasFrameContext && editor.$.frameContext.get('wysiwyg');
				const hasStore = has$ && editor.$.store;
				const isInitFinished = hasStore && editor.$.store._editorInitFinished;

				if (has$ && hasContext && isInitFinished) {
					// Editor is initialized. Wait a tick for setTimeout(0) callbacks in #editorInit
					setTimeout(() => resolve(editor), 100);
					return;
				}

				if (Date.now() - start > timeout) {
					reject(new Error(
						`Editor initialization timeout after ${timeout}ms. State: has$=${!!has$}, ` +
						`hasContext=${!!hasContext}, hasFrameContext=${!!hasFrameContext}, ` +
						`hasWysiwyg=${!!hasWysiwyg}, isInitFinished=${!!isInitFinished}`
					));
				} else {
					setTimeout(check, 50);
				}
			} catch (error) {
				reject(new Error(`Error checking editor readiness: ${error?.message || 'Unknown error'}`));
			}
		}

		check();
	});
}

/**
 * Cleans up a test editor instance
 */
export function destroyTestEditor(editor) {
	if (editor && typeof editor.destroy === 'function') {
		editor.destroy();
	}

	// Clean up DOM
	if (editor && editor._testTarget && editor._testTarget.parentNode) {
		editor._testTarget.parentNode.removeChild(editor._testTarget);
	}
}

/**
 * Creates a test editor and automatically cleans up after test
 */
export function withTestEditor(testFn, options = {}) {
	return () => {
		const editor = createTestEditor(options);

		try {
			return testFn(editor);
		} finally {
			destroyTestEditor(editor);
		}
	};
}

/**
 * Creates a test editor for async tests and cleans up
 */
export function withTestEditorAsync(testFn, options = {}) {
	return async () => {
		const editor = createTestEditor(options);

		try {
			return await testFn(editor);
		} finally {
			destroyTestEditor(editor);
		}
	};
}


export default {
	createTestEditor,
	destroyTestEditor,
	withTestEditor,
	withTestEditorAsync,
	waitForEditorReady
};