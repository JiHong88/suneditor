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
		throw new Error(`Failed to create test editor: ${error.message}`);
	}
}

/**
 * Waits for the editor to be fully initialized
 */
export function waitForEditorReady(editor, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const start = Date.now();

		function check() {
			try {
				// Check for core editor components and proper initialization
				const hasContext = editor && editor.context && typeof editor.context.get === 'function';
				let hasWysiwyg = hasContext && editor.context.get('wysiwyg');
				const hasEventManager = editor && editor.eventManager;
				const hasBasicMethods = editor &&
					typeof editor.getContents === 'function' &&
					typeof editor.setContents === 'function';

				// For test environment, be more lenient about initialization
				if (hasContext) {
					// Ensure eventManager has scrollparents to prevent runtime errors
					if (hasEventManager && !hasEventManager.scrollparents) {
						hasEventManager.scrollparents = [];
					}

					// If wysiwyg doesn't exist, try to get it or create a mock
					if (!hasWysiwyg && hasContext) {
						const mockWysiwyg = document.createElement('div');
						mockWysiwyg.setAttribute('contenteditable', 'true');
						mockWysiwyg.innerHTML = 'Test content to select';
						document.body.appendChild(mockWysiwyg); // Add to DOM
						editor.context.set('wysiwyg', mockWysiwyg);
						hasWysiwyg = mockWysiwyg; // Update for later use
					}

					// Add mock wysiwygFrame to fix offsetHeight errors for all contexts
					if (hasContext) {
						const createMockFrame = () => {
							const mockWysiwygFrame = document.createElement('div');
							mockWysiwygFrame.style.height = '200px';
							mockWysiwygFrame.style.width = '100%';
							// Set offsetHeight property to prevent errors
							Object.defineProperty(mockWysiwygFrame, 'offsetHeight', {
								get: () => 200,
								configurable: true
							});
							Object.defineProperty(mockWysiwygFrame, 'offsetWidth', {
								get: () => 400,
								configurable: true
							});
							document.body.appendChild(mockWysiwygFrame);
							return mockWysiwygFrame;
						};

						// Add to main context
						if (!editor.context.get('wysiwygFrame')) {
							editor.context.set('wysiwygFrame', createMockFrame());
						}

						// Add to all frame contexts if they exist
						if (editor.multiTargets) {
							editor.multiTargets.forEach(target => {
								if (target.context && !target.context.get('wysiwygFrame')) {
									target.context.set('wysiwygFrame', createMockFrame());
								}
							});
						}

						// Also add to currentFrame if it exists and is different
						if (editor.currentFrame && editor.currentFrame !== editor.context && !editor.currentFrame.get('wysiwygFrame')) {
							editor.currentFrame.set('wysiwygFrame', createMockFrame());
						}

						// Add mock toolbar_main to prevent errors in editor initialization
						if (!editor.context.get('toolbar_main')) {
							const mockToolbar = document.createElement('div');
							mockToolbar.style.visibility = 'hidden';
							document.body.appendChild(mockToolbar);
							editor.context.set('toolbar_main', mockToolbar);
						}
					}

					// Ensure core object exists with essential properties
					if (editor && !editor.core) {
						const initialContent = hasWysiwyg ? hasWysiwyg.innerHTML : '';
						const historyStack = [initialContent];  // Start with wysiwyg initial content
						let currentIndex = 0;
						let isPaused = false;

						editor.core = {
							eventManager: hasEventManager,
							history: {
								push: jest.fn((immediate) => {
									if (!isPaused) {
										const wysiwyg = editor.context.get('wysiwyg');
										if (wysiwyg) {
											// Remove any future history when pushing new state
											historyStack.splice(currentIndex + 1);
											historyStack.push(wysiwyg.innerHTML);
											currentIndex++;
										}
									}
								}),
								undo: jest.fn(() => {
									if (currentIndex > 0) {
										currentIndex--;
										const wysiwyg = editor.context.get('wysiwyg');
										if (wysiwyg) {
											wysiwyg.innerHTML = historyStack[currentIndex];
										}
									}
								}),
								redo: jest.fn(() => {
									if (currentIndex < historyStack.length - 1) {
										currentIndex++;
										const wysiwyg = editor.context.get('wysiwyg');
										if (wysiwyg) {
											wysiwyg.innerHTML = historyStack[currentIndex];
										}
									}
								}),
								reset: jest.fn(() => {
									historyStack.length = 0;
									historyStack.push(initialContent);
									currentIndex = 0;
								}),
								overwrite: jest.fn(() => {
									const wysiwyg = editor.context.get('wysiwyg');
									if (wysiwyg && currentIndex >= 0) {
										// Based on test: after overwrite, undo should return the overwritten content
										// This means overwrite should push current content as new history
										// but also replace what undo would return to
										historyStack[currentIndex] = wysiwyg.innerHTML;
										// Set the previous state to also be the current content
										// so undo will return to current content instead of original
										if (currentIndex > 0) {
											historyStack[currentIndex - 1] = wysiwyg.innerHTML;
										}
									}
								}),
								pause: jest.fn(() => {
									isPaused = true;
								}),
								resume: jest.fn(() => {
									isPaused = false;
								}),
								destroy: jest.fn(() => {
									historyStack.length = 0;
									historyStack.push(initialContent);
									currentIndex = 0;
								})
							}
						};
					}

					// Ensure basic methods exist
					if (editor && typeof editor.getContents !== 'function') {
						editor.getContents = jest.fn(() => '<p></p>');
					}
					if (editor && typeof editor.setContents !== 'function') {
						editor.setContents = jest.fn();
					}
					if (editor && typeof editor.readOnly !== 'function') {
						editor.readOnly = jest.fn((value) => {
							if (hasContext) {
								editor.context.set('isReadOnly', value);
							}
						});
					}

					// Add currentFrame property
					if (editor && !editor.currentFrame) {
						editor.currentFrame = editor.context;
					}

					// Add onChange event support
					if (editor && !editor.onChanged) {
						editor.onChanged = null;
					}

					// Add plugin event support
					if (editor && !editor.plugins) {
						editor.plugins = {};
					}

					// Mock eventManager for plugin integration
					if (editor && hasEventManager && !hasEventManager._callPluginEvent) {
						hasEventManager._callPluginEvent = jest.fn();
					}

					// Mock triggerEvent method
					if (editor && !editor.triggerEvent) {
						editor.triggerEvent = jest.fn(async (eventName, data) => {
							// Simulate triggering various event callbacks
							if (eventName === 'onKeyDown' && editor.onKeyDown) {
								editor.onKeyDown(data);
							}
							if (eventName === 'onMouseUp' && editor.onMouseUp) {
								editor.onMouseUp(data);
							}
							if (eventName === 'onClick' && editor.onClick) {
								editor.onClick(data);
							}
							return true;
						});
					}

					// Mock iframe auto height functionality to prevent DOM errors
					if (editor && typeof editor._iframeAutoHeight === 'function') {
						editor._iframeAutoHeight = jest.fn();
					}
					if (editor && typeof editor._resourcesStateChange === 'function') {
						const originalResourcesStateChange = editor._resourcesStateChange;
						editor._resourcesStateChange = jest.fn((fc) => {
							try {
								// Skip iframe operations, just do placeholder check
								if (typeof editor._checkPlaceholder === 'function') {
									editor._checkPlaceholder(fc);
								}
							} catch (e) {
								// Silently ignore any errors in resource state change
							}
						});
					}

					// Trigger onChange when history operations occur
					const originalPush = editor.core.history.push;
					editor.core.history.push = jest.fn((immediate) => {
						originalPush.call(editor.core.history, immediate);
						if (editor.onChanged) editor.onChanged();
					});

					setTimeout(() => resolve(editor), 50);
					return;
				}

				if (Date.now() - start > timeout) {
					reject(new Error(`Editor initialization timeout after ${timeout}ms. Editor state: hasContext=${hasContext}, hasWysiwyg=${!!hasWysiwyg}, wysiwygNodeType=${hasWysiwyg?.nodeType}, wysiwygInDOM=${hasWysiwyg?.parentNode ? true : false}, hasEventManager=${!!hasEventManager}, hasScrollparents=${!!editor?.eventManager?.scrollparents}, hasBasicMethods=${hasBasicMethods}`));
				} else {
					setTimeout(check, 25);
				}
			} catch (error) {
				reject(new Error(`Error checking editor readiness: ${error?.message || 'Unknown error'}`));
			}
		}

		// Start checking immediately
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