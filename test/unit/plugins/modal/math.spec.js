import Math from '../../../../src/plugins/modal/math';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor(editor) {
			this.editor = editor;
			this.lang = editor.lang || {
				math: 'Math',
				math_modal_title: 'Math',
				close: 'Close',
				submitButton: 'Submit',
				math_modal_inputLabel: 'Input',
				math_modal_fontSizeLabel: 'Font Size',
				math_modal_previewLabel: 'Preview',
				edit: 'Edit',
				copy: 'Copy',
				remove: 'Remove'
			};
			this.icons = editor.icons || {
				cancel: '<svg>cancel</svg>',
				edit: '<svg>edit</svg>',
				copy: '<svg>copy</svg>',
				delete: '<svg>delete</svg>'
			};
			this.eventManager = editor.eventManager || {
				addEvent: jest.fn((target, event, handler) => ({ target, event, handler }))
			};
			this.options = editor.options || {
				get: jest.fn().mockReturnValue({ katex: null, mathjax: null })
			};
			this.frameOptions = editor.frameOptions || {
				get: jest.fn().mockReturnValue(false)
			};
			this.format = editor.format || {
				getLines: jest.fn().mockReturnValue([{ nodeName: 'P' }])
			};
			this.component = editor.component || {
				insert: jest.fn(),
				select: jest.fn(),
				get: jest.fn().mockReturnValue({ target: {}, pluginName: 'math' })
			};
			this.selection = editor.selection || {
				getNearRange: jest.fn().mockReturnValue({
					container: { nodeType: 3 },
					offset: 0
				}),
				setRange: jest.fn()
			};
			this.history = editor.history || {
				push: jest.fn()
			};
			this.html = editor.html || {
				copy: jest.fn().mockResolvedValue(true)
			};
			this.editor = editor.editor || {
				focus: jest.fn()
			};
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Modal: jest.fn().mockImplementation((plugin, modalEl) => ({
		open: jest.fn(),
		close: jest.fn(),
		form: modalEl,
		isUpdate: false
	})),
	Controller: jest.fn().mockImplementation((plugin, controllerEl) => ({
		open: jest.fn(),
		close: jest.fn(),
		currentTarget: null
	}))
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockImplementation((tag, attrs, html) => {
				const el = {
					tagName: tag.toUpperCase(),
					className: attrs && attrs.class ? attrs.class : '',
					style: attrs && attrs.style ? attrs.style : {},
					innerHTML: html || '',
					setAttribute: jest.fn(),
					querySelector: jest.fn((selector) => {
						if (selector === '.se-math-exp') {
							return {
								tagName: 'TEXTAREA',
								value: '',
								style: {},
								focus: jest.fn(),
								className: ''
							};
						} else if (selector === '.se-math-preview') {
							return {
								tagName: 'PRE',
								innerHTML: '',
								style: {},
								querySelector: jest.fn((s) => {
									// Default math element for modalAction tests
									if (s === '.se-math, .katex' || s === '.se-math' || s === '.katex') {
										return {
											tagName: 'SPAN',
											className: 'se-math katex',
											setAttribute: jest.fn(),
											style: {},
											innerHTML: ''
										};
									}
									return null;
								})
							};
						} else if (selector === '.se-math-size') {
							return {
								tagName: 'SELECT',
								value: '1em'
							};
						} else if (selector === 'input[name="suneditor_embed_radio"]') {
							return { checked: false };
						}
						return null;
					}),
					querySelectorAll: jest.fn(),
					replaceWith: jest.fn()
				};
				return el;
			}),
			hasClass: jest.fn().mockReturnValue(false),
			removeClass: jest.fn(),
			addClass: jest.fn(),
			removeItem: jest.fn()
		},
		check: {
			isComponentContainer: jest.fn().mockReturnValue(false)
		},
		query: {
			getParentElement: jest.fn().mockReturnValue({ replaceWith: jest.fn() }),
			getEventTarget: jest.fn((e) => e.target || e)
		}
	},
	env: {
		_w: {
			setTimeout: jest.fn((fn) => fn())
		},
		_d: {
			createRange: jest.fn().mockReturnValue({
				createContextualFragment: jest.fn().mockReturnValue({
					querySelector: jest.fn().mockReturnValue({
						innerHTML: '<span class="katex"></span>'
					})
				})
			})
		},
		KATEX_WEBSITE: 'https://katex.org',
		MATHJAX_WEBSITE: 'https://www.mathjax.org'
	},
	converter: {
		entityToHTML: jest.fn((str) => str),
		htmlToEntity: jest.fn((str) => str)
	}
}));

// Mock navigator.clipboard
Object.assign(navigator, {
	clipboard: {
		writeText: jest.fn().mockResolvedValue(true)
	}
});

global.DOMParser = jest.fn().mockImplementation(() => ({
	parseFromString: jest.fn().mockReturnValue({
		body: { children: [] }
	})
}));

global.console = { ...console, warn: jest.fn() };

describe('Math Plugin', () => {
	let mockEditor;
	let math;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			lang: {
				math: 'Math',
				math_modal_title: 'Math Expression',
				close: 'Close',
				submitButton: 'Submit',
				math_modal_inputLabel: 'Math Input',
				math_modal_fontSizeLabel: 'Font Size',
				math_modal_previewLabel: 'Preview',
				edit: 'Edit',
				copy: 'Copy',
				remove: 'Remove'
			},
			icons: {
				cancel: '<svg>cancel</svg>',
				edit: '<svg>edit</svg>',
				copy: '<svg>copy</svg>',
				delete: '<svg>delete</svg>'
			},
			options: {
				get: jest.fn((key) => {
					if (key === 'externalLibs') {
						return { katex: null, mathjax: null };
					}
					return null;
				})
			},
			frameOptions: {
				get: jest.fn().mockReturnValue(false)
			},
			format: {
				getLines: jest.fn().mockReturnValue([{ nodeName: 'P' }])
			},
			component: {
				insert: jest.fn(),
				select: jest.fn(),
				get: jest.fn().mockReturnValue({ target: {}, pluginName: 'math' })
			},
			selection: {
				getNearRange: jest.fn().mockReturnValue({
					container: { nodeType: 3 },
					offset: 0
				}),
				setRange: jest.fn()
			},
			history: {
				push: jest.fn()
			},
			html: {
				copy: jest.fn().mockResolvedValue(true)
			},
			editor: {
				focus: jest.fn()
			}
		};
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Math.key).toBe('math');
			expect(Math.type).toBe('modal');
			expect(Math.className).toBe('');
		});
	});

	describe('Static component method', () => {
		it('should return element if valid math component', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = { tagName: 'SPAN' };
			dom.utils.hasClass.mockReturnValue(true);
			dom.check.isComponentContainer.mockReturnValue(true);

			const result = Math.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for invalid element', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = { tagName: 'DIV' };
			dom.utils.hasClass.mockReturnValue(false);

			const result = Math.component(mockElement);
			expect(result).toBeNull();
		});

		it('should return null if not component container', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = { tagName: 'SPAN' };
			dom.utils.hasClass.mockReturnValue(true);
			dom.check.isComponentContainer.mockReturnValue(false);

			const result = Math.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Constructor', () => {
		it('should create Math instance without external library', () => {
			math = new Math(mockEditor, {});

			expect(math.title).toBe('Math');
			expect(math.icon).toBe('math');
			expect(math.katex).toBeNull();
			expect(math.mathjax).toBeNull();
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('must need either "KaTeX" or "MathJax"')
			);
		});

		it('should create Math instance with KaTeX', () => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn() },
							options: { throwOnError: false }
						}
					};
				}
				return null;
			});

			math = new Math(mockEditor, {});

			expect(math.katex).toBeDefined();
			expect(math.katex.src.renderToString).toBeDefined();
		});

		it('should warn if KaTeX is set incorrectly', () => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return { katex: {} }; // No src property
				}
				return null;
			});

			math = new Math(mockEditor, {});

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('katex option is set incorrectly')
			);
		});

		it('should create Math instance with custom options', () => {
			math = new Math(mockEditor, {
				canResize: false,
				autoHeight: true,
				fontSizeList: [
					{ text: '3', value: '3em', default: true }
				],
				formSize: {
					width: '600px',
					height: '200px'
				}
			});

			expect(math.pluginOptions.canResize).toBe(false);
			expect(math.pluginOptions.autoHeight).toBe(true);
			expect(math.pluginOptions.fontSizeList).toHaveLength(1);
			expect(math.pluginOptions.formSize.width).toBe('600px');
		});

		it('should set height to minHeight when autoHeight is true', () => {
			math = new Math(mockEditor, {
				autoHeight: true,
				formSize: {
					minHeight: '50px'
				}
			});

			expect(math.pluginOptions.formSize.height).toBe('50px');
		});

		it('should initialize with onPaste callback', () => {
			const onPaste = jest.fn();
			math = new Math(mockEditor, { onPaste });

			expect(math.pluginOptions.onPaste).toBe(onPaste);
		});
	});

	describe('open method', () => {
		beforeEach(() => {
			math = new Math(mockEditor, {});
		});

		it('should open modal', () => {
			math.open();
			expect(math.modal.open).toHaveBeenCalled();
		});
	});

	describe('on method', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should initialize when not updating', () => {
			math.textArea.value = 'old value';
			math.previewElement.innerHTML = 'old preview';

			math.on(false);

			expect(math.isUpdateState).toBe(false);
			expect(math.textArea.value).toBe('');
			expect(math.previewElement.innerHTML).toBe('');
		});

		it('should populate fields when updating', () => {
			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '2em';
					return null;
				})
			};

			math.on(true);

			expect(math.isUpdateState).toBe(true);
			expect(math.textArea.value).toBe('x^2');
			expect(math.fontSizeElement.value).toBe('2em');
		});

		it('should use default font size when no type attribute', () => {
			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'y=mx+b';
					return null;
				})
			};

			math.on(true);

			expect(math.fontSizeElement.value).toBe('1em');
		});
	});

	describe('modalAction method', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">rendered</span>') }
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should return false if textarea is empty', () => {
			math.textArea.value = '';

			const result = math.modalAction();

			expect(result).toBe(false);
			expect(math.textArea.focus).toHaveBeenCalled();
		});

		it('should return false if textarea has error class', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'x^2';
			dom.utils.hasClass.mockReturnValue(true);

			const result = math.modalAction();

			expect(result).toBe(false);
		});

		it('should return false if preview has no math element', () => {
			math.textArea.value = 'x^2';
			math.previewElement.querySelector = jest.fn().mockReturnValue(null);

			const result = math.modalAction();

			expect(result).toBe(false);
		});

		it('should insert new math component successfully', () => {
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(false); // Ensure no error class

			math.textArea.value = 'x^2 + y^2 = r^2';
			math.fontSizeElement.value = '1.5em';
			math.isUpdateState = false;

			const mockMathEl = {
				setAttribute: jest.fn(),
				style: {}
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);

			const result = math.modalAction();

			expect(result).toBe(true);
			expect(mockMathEl.setAttribute).toHaveBeenCalledWith('contenteditable', 'false');
			expect(mockMathEl.setAttribute).toHaveBeenCalledWith('data-se-value', 'x^2 + y^2 = r^2');
			expect(mockMathEl.setAttribute).toHaveBeenCalledWith('data-se-type', '1.5em');
			expect(mockEditor.component.insert).toHaveBeenCalled();
		});

		it('should handle multiple selected lines', () => {
			mockEditor.format.getLines.mockReturnValue([
				{ nodeName: 'P' },
				{ nodeName: 'P' }
			]);
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(false); // Ensure no error class

			math.textArea.value = 'a^2';
			math.isUpdateState = false;

			const mockMathEl = {
				setAttribute: jest.fn(),
				style: {}
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);

			const result = math.modalAction();

			expect(result).toBe(true);
			expect(dom.utils.createElement).toHaveBeenCalledWith('P', null, mockMathEl);
		});

		it('should update existing math component', () => {
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(false); // Ensure no error class

			math.textArea.value = 'new expression';
			math.isUpdateState = true;
			math.controller.currentTarget = {
				replaceWith: jest.fn()
			};

			const mockMathEl = {
				setAttribute: jest.fn(),
				style: {}
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);
			dom.query.getParentElement.mockReturnValue({
				replaceWith: jest.fn()
			});

			const result = math.modalAction();

			expect(result).toBe(true);
			expect(dom.query.getParentElement).toHaveBeenCalled();
		});
	});

	describe('init method', () => {
		beforeEach(() => {
			math = new Math(mockEditor, {});
		});

		it('should reset all fields', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'test';
			math.previewElement.innerHTML = '<span>test</span>';

			math.init();

			expect(math.textArea.value).toBe('');
			expect(math.previewElement.innerHTML).toBe('');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(math.textArea, 'se-error');
		});
	});

	describe('select method', () => {
		beforeEach(() => {
			math = new Math(mockEditor, {});
		});

		it('should open controller for valid math element', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('x^2')
			};
			dom.utils.hasClass.mockReturnValue(true);

			math.select(mockElement);

			expect(math.controller.open).toHaveBeenCalledWith(mockElement, null, {
				isWWTarget: false,
				initMethod: null,
				addOffset: null
			});
		});

		it('should not open controller if no value', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue(null)
			};
			dom.utils.hasClass.mockReturnValue(true);

			math.select(mockElement);

			expect(math.controller.open).not.toHaveBeenCalled();
		});
	});

	describe('close method', () => {
		beforeEach(() => {
			math = new Math(mockEditor, {});
		});

		it('should clear element reference', () => {
			math.close();
			// Element is private, we can only test that the method doesn't throw
			expect(() => math.close()).not.toThrow();
		});
	});

	describe('controllerAction method', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should open modal for update command', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue('update')
			};

			math.controllerAction(mockTarget);

			expect(math.modal.open).toHaveBeenCalled();
		});

		it('should copy text for copy command', async () => {
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue('copy')
			};
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('x=y')
			};
			// Set private element through select
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(true);
			math.select(mockElement);

			await math.controllerAction(mockTarget);

			// Copy is async so we need to wait
			await new Promise(resolve => setTimeout(resolve, 0));
			expect(mockEditor.html.copy).toHaveBeenCalled();
		});

		it('should destroy element for delete command', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue('delete')
			};
			math.controller.currentTarget = document.createElement('span');

			math.controllerAction(mockTarget);

			expect(dom.utils.removeItem).toHaveBeenCalled();
			expect(math.controller.close).toHaveBeenCalled();
			expect(mockEditor.history.push).toHaveBeenCalledWith(false);
		});
	});

	describe('destroy method', () => {
		beforeEach(() => {
			math = new Math(mockEditor, {});
		});

		it('should remove element and clean up', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = document.createElement('span');

			math.destroy(mockTarget);

			expect(dom.utils.removeItem).toHaveBeenCalledWith(mockTarget);
			expect(math.controller.close).toHaveBeenCalled();
			expect(mockEditor.editor.focus).toHaveBeenCalled();
			expect(mockEditor.history.push).toHaveBeenCalledWith(false);
		});
	});

	describe('retainFormat method', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">test</span>') }
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should return query and method', () => {
			const result = math.retainFormat();

			expect(result.query).toBe('.se-math, .katex, .MathJax');
			expect(typeof result.method).toBe('function');
		});

		it('should process element with valid value', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('x^2'),
				setAttribute: jest.fn(),
				innerHTML: ''
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			expect(mockElement.setAttribute).toHaveBeenCalledWith('contenteditable', 'false');
			expect(dom.utils.addClass).toHaveBeenCalled();
		});

		it('should skip element without value', () => {
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue(null)
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			expect(mockElement.getAttribute).toHaveBeenCalled();
		});

		it('should skip when no katex or mathjax', () => {
			math.katex = null;
			math.mathjax = null;

			const mockElement = {
				getAttribute: jest.fn()
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			expect(mockElement.getAttribute).not.toHaveBeenCalled();
		});
	});

	describe('Math rendering with KaTeX', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: {
								renderToString: jest.fn((exp) => {
									if (exp.includes('invalid')) {
										throw new Error('KaTeX parse error');
									}
									return `<span class="katex">${exp}</span>`;
								})
							}
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should render valid expression', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'x^2';

			// Simulate input event
			const inputHandler = math.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'input'
			)[2];

			inputHandler({ target: math.textArea });

			expect(math.previewElement.innerHTML).toContain('x^2');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(math.textArea, 'se-error');
		});

		it('should handle rendering error', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'invalid\\syntax';

			const inputHandler = math.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'input'
			)[2];

			inputHandler({ target: math.textArea });

			expect(dom.utils.addClass).toHaveBeenCalledWith(math.textArea, 'se-error');
			expect(math.previewElement.innerHTML).toContain('error');
		});

		it('should handle autoHeight adjustment', () => {
			math = new Math(mockEditor, { autoHeight: true });
			math.textArea.style = { height: '' };
			math.textArea.scrollHeight = 100;
			math.textArea.value = 'x^2';

			const inputHandler = math.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'input'
			)[2];

			inputHandler({ target: math.textArea });

			expect(math.textArea.style.height).toBe('105px');
		});
	});

	describe('Math rendering with MathJax', () => {
		beforeEach(() => {
			const mathjaxMock = {
				browserAdaptor: jest.fn(),
				RegisterHTMLHandler: jest.fn(),
				TeX: jest.fn(),
				CHTML: jest.fn(),
				convert: jest.fn((exp) => ({
					outerHTML: exp.includes('error') ? '<mjx-merror>error</mjx-merror>' : `<mjx-math>${exp}</mjx-math>`
				})),
				clear: jest.fn(),
				updateDocument: jest.fn(),
				src: {
					document: jest.fn(function() {
						// Return the mathjax object itself so convert, clear, updateDocument are available
						return mathjaxMock;
					})
				}
			};

			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: mathjaxMock
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should render valid MathJax expression', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'x^2';

			const inputHandler = math.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'input'
			)[2];

			inputHandler({ target: math.textArea });

			expect(math.previewElement.innerHTML).toContain('x^2');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(math.textArea, 'se-error');
		});

		it('should handle MathJax error', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'error expression';

			const inputHandler = math.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'input'
			)[2];

			inputHandler({ target: math.textArea });

			expect(dom.utils.addClass).toHaveBeenCalledWith(math.textArea, 'se-error');
		});
	});

	describe('Font size handling', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should update preview font size on change', () => {
			math.fontSizeElement.value = '2em';

			const changeHandler = math.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'change' && call[0] === math.fontSizeElement
			)[2];

			changeHandler({ target: math.fontSizeElement });

			expect(math.previewElement.style.fontSize).toBe('2em');
		});
	});

	describe('Clipboard copy', () => {
		beforeEach(() => {
			math = new Math(mockEditor, {});
		});

		it('should copy to clipboard successfully', async () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('x^2 + y^2')
			};

			dom.utils.hasClass.mockReturnValue(true);
			math.select(mockElement);

			const copyButton = { getAttribute: jest.fn().mockReturnValue('copy') };
			await math.controllerAction(copyButton);

			await new Promise(resolve => setTimeout(resolve, 50));

			expect(mockEditor.html.copy).toHaveBeenCalled();
		});

		it('should handle copy failure gracefully', async () => {
			mockEditor.html.copy = jest.fn().mockRejectedValue(new Error('Copy failed'));

			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('test')
			};

			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(true);
			math.select(mockElement);

			const copyButton = { getAttribute: jest.fn().mockReturnValue('copy') };

			// controllerAction is not async, but the copy inside it is
			expect(() => math.controllerAction(copyButton)).not.toThrow();

			// Wait for the async copy operation to complete
			await new Promise(resolve => setTimeout(resolve, 50));
		});
	});

	describe('Integration scenarios', () => {
		beforeEach(() => {
			mockEditor.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">x^2</span>') }
						}
					};
				}
				return null;
			});
			math = new Math(mockEditor, {});
		});

		it('should handle complete create flow', () => {
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(false); // Ensure no error class

			// Open modal
			math.open();
			expect(math.modal.open).toHaveBeenCalled();

			// Set as new (not update)
			math.on(false);
			expect(math.isUpdateState).toBe(false);

			// Enter expression
			math.textArea.value = 'x^2 + 2x + 1';
			const mockMathEl = {
				setAttribute: jest.fn(),
				style: {}
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);

			// Submit
			const result = math.modalAction();
			expect(result).toBe(true);
			expect(mockEditor.component.insert).toHaveBeenCalled();
		});

		it('should handle complete update flow', () => {
			const { dom } = require('../../../../src/helper');

			// Select existing math element
			const existingElement = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'old expression';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};
			dom.utils.hasClass.mockReturnValueOnce(true); // For select check
			math.select(existingElement);

			// Open for edit
			math.controller.currentTarget = existingElement;
			math.on(true);
			expect(math.isUpdateState).toBe(true);
			expect(math.textArea.value).toBe('old expression');

			// Update expression - ensure no error class for modalAction
			dom.utils.hasClass.mockReturnValue(false);
			math.textArea.value = 'new expression';
			const mockMathEl = {
				setAttribute: jest.fn(),
				style: {}
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);
			dom.query.getParentElement.mockReturnValue({
				replaceWith: jest.fn()
			});

			// Submit
			const result = math.modalAction();
			expect(result).toBe(true);
		});
	});
});
