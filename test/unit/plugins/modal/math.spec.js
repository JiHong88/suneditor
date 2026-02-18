import Math from '../../../../src/plugins/modal/math';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock dependencies

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation((plugin, $, modalEl) => ({
		open: jest.fn(),
		close: jest.fn(),
		form: modalEl,
		isUpdate: false
	})),
	Controller: jest.fn().mockImplementation((plugin, $, controllerEl) => ({
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

global.console = { ...console, warn: jest.fn(), error: jest.fn() };

describe('Math Plugin', () => {
	let kernel;
	let math;

	beforeEach(() => {
		jest.clearAllMocks();

		kernel = createMockEditor();
	});

	describe('Static properties', () => {
		it('should have correct static properties', async () => {
			expect(Math.key).toBe('math');
			expect(Math.type).toBe('modal');
			expect(Math.className).toBe('');
		});
	});

	describe('Static component method', () => {
		it('should return element if valid math component', async () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = { tagName: 'SPAN' };
			dom.utils.hasClass.mockReturnValue(true);
			dom.check.isComponentContainer.mockReturnValue(true);

			const result = Math.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for invalid element', async () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = { tagName: 'DIV' };
			dom.utils.hasClass.mockReturnValue(false);

			const result = Math.component(mockElement);
			expect(result).toBeNull();
		});

		it('should return null if not component container', async () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = { tagName: 'SPAN' };
			dom.utils.hasClass.mockReturnValue(true);
			dom.check.isComponentContainer.mockReturnValue(false);

			const result = Math.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Constructor', () => {
		it('should warn when neither KaTeX nor MathJax is available', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {}; // no katex, no mathjax
				}
				return null;
			});

			math = new Math(kernel, {});

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.plugins.math.warn]')
			);
			expect(math.katex).toBeNull();
			expect(math.mathjax).toBeNull();
		});

		it('should set formSize.height to minHeight when autoHeight is true', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, { autoHeight: true });

			expect(math.pluginOptions.autoHeight).toBe(true);
			expect(math.pluginOptions.formSize.height).toBe(math.pluginOptions.formSize.minHeight);
		});

		it('should register font size change event handler', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, {});

			// Find the 'change' event registration
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const changeCall = addEventCalls.find(call => call[1] === 'change');

			expect(changeCall).toBeDefined();
			expect(changeCall[0]).toBe(math.fontSizeElement); // target is fontSizeElement

			// Execute the change handler
			const changeHandler = changeCall[2];
			changeHandler({ target: { value: '2em' } });

			// The handler binds to previewElement.style, setting fontSize
			expect(math.previewElement.style.fontSize).toBe('2em');
		});

		it('should register onPaste callback when provided', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});

			const onPasteFn = jest.fn();
			math = new Math(kernel, { onPaste: onPasteFn });

			expect(math.pluginOptions.onPaste).toBe(onPasteFn);

			// Should have registered a paste event
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const pasteCall = addEventCalls.find(call => call[1] === 'paste');
			expect(pasteCall).toBeDefined();
		});

		it('should not register onPaste callback when not a function', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, { onPaste: 'not-a-function' });

			expect(math.pluginOptions.onPaste).toBeNull();

			// Should NOT have registered a paste event
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const pasteCall = addEventCalls.find(call => call[1] === 'paste');
			expect(pasteCall).toBeUndefined();
		});

		it('should register input event handler on textArea', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, {});

			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const inputCall = addEventCalls.find(call => call[1] === 'input');
			expect(inputCall).toBeDefined();
			expect(inputCall[0]).toBe(math.textArea);
		});

		it('should use custom formSize options', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, {
				formSize: {
					width: '600px',
					height: '20em'
				}
			});

			expect(math.pluginOptions.formSize.width).toBe('600px');
			expect(math.pluginOptions.formSize.height).toBe('20em');
		});
	});

	describe('open method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should call modal.open()', () => {
			math.open();
			expect(math.modal.open).toHaveBeenCalled();
		});
	});

	describe('on method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should initialize when not updating', async () => {
			math.textArea.value = 'old value';
			math.previewElement.innerHTML = 'old preview';

			math.modalOn(false);

			expect(math.isUpdateState).toBe(false);
			expect(math.textArea.value).toBe('');
			expect(math.previewElement.innerHTML).toBe('');
		});

		it('should populate fields when updating', async () => {
			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '2em';
					return null;
				})
			};

			math.modalOn(true);

			expect(math.isUpdateState).toBe(true);
			expect(math.textArea.value).toBe('x^2');
			expect(math.fontSizeElement.value).toBe('2em');
		});

		it('should use default font size when no type attribute', async () => {
			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'y=mx+b';
					return null;
				})
			};

			math.modalOn(true);

			expect(math.fontSizeElement.value).toBe('1em');
		});
	});

	describe('modalAction method', () => {
		let domMock;

		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">rendered</span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
			domMock = require('../../../../src/helper').dom;
		});

		it('should return false when textarea is empty', async () => {
			math.textArea.value = '   ';

			const result = await math.modalAction();

			expect(result).toBe(false);
			expect(math.textArea.focus).toHaveBeenCalled();
		});

		it('should return false when textarea has error class', async () => {
			math.textArea.value = 'x^2';
			domMock.utils.hasClass.mockImplementation((el, cls) => {
				if (el === math.textArea && cls === 'se-error') return true;
				return false;
			});

			const result = await math.modalAction();

			expect(result).toBe(false);
			expect(math.textArea.focus).toHaveBeenCalled();

			// Reset
			domMock.utils.hasClass.mockReturnValue(false);
		});

		it('should return false when no math element in preview', async () => {
			math.textArea.value = 'x^2';
			domMock.utils.hasClass.mockReturnValue(false);

			// Make querySelector return null for math element
			math.previewElement.querySelector = jest.fn().mockReturnValue(null);

			const result = await math.modalAction();

			expect(result).toBe(false);
		});

		it('should insert component when not in update state with single format', async () => {
			math.textArea.value = 'x^2';
			math.isUpdateState = false;
			domMock.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math katex',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);

			// Single format line
			kernel.$.format.getLines.mockReturnValue([document.createElement('p')]);

			const result = await math.modalAction();

			expect(result).toBe(true);
			expect(mockMathEl.setAttribute).toHaveBeenCalledWith('contenteditable', 'false');
			expect(mockMathEl.setAttribute).toHaveBeenCalledWith('data-se-value', expect.any(String));
			expect(mockMathEl.setAttribute).toHaveBeenCalledWith('data-se-type', '1em');
			expect(domMock.utils.addClass).toHaveBeenCalledWith(mockMathEl, 'se-component|se-inline-component|se-disable-pointer|se-math');
			expect(domMock.utils.addClass).toHaveBeenCalledWith(mockMathEl, 'katex');
			expect(kernel.$.component.insert).toHaveBeenCalledWith(mockMathEl, { insertBehavior: 'none', scrollTo: false });
		});

		it('should wrap in format element when selectedFormats.length > 1', async () => {
			math.textArea.value = 'x^2';
			math.isUpdateState = false;
			domMock.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math katex',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);

			// createElement mock for wrapping
			domMock.utils.createElement.mockReturnValueOnce(document.createElement('p'));

			// Multiple format lines
			const p1 = document.createElement('p');
			const p2 = document.createElement('p');
			kernel.$.format.getLines.mockReturnValue([p1, p2]);

			const result = await math.modalAction();

			expect(result).toBe(true);
			expect(domMock.utils.createElement).toHaveBeenCalledWith(p1.nodeName, null, mockMathEl);
			expect(kernel.$.component.insert).toHaveBeenCalled();
		});

		it('should replace existing component when in update state', async () => {
			math.textArea.value = 'x^2';
			math.isUpdateState = true;
			domMock.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math katex',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);

			const mockContainerEl = { replaceWith: jest.fn() };
			domMock.query.getParentElement.mockReturnValue(mockContainerEl);

			math.controller.currentTarget = document.createElement('span');

			const mockCompInfo = { target: mockMathEl, pluginName: 'math' };
			kernel.$.component.get.mockReturnValue(mockCompInfo);

			const result = await math.modalAction();

			expect(result).toBe(true);
			expect(mockContainerEl.replaceWith).toHaveBeenCalledWith(mockMathEl);
			expect(kernel.$.component.get).toHaveBeenCalledWith(mockMathEl);
			expect(kernel.$.component.select).toHaveBeenCalledWith(mockMathEl, 'math');
		});

		it('should handle MathJax class names when mathjax is active', async () => {
			// Create a new instance with MathJax
			const mjMockDoc = {
				convert: jest.fn().mockReturnValue({ outerHTML: '<span class="MathJax">rendered</span>' }),
				clear: jest.fn(),
				updateDocument: jest.fn()
			};

			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: {
							browserAdaptor: jest.fn(),
							RegisterHTMLHandler: jest.fn(),
							TeX: jest.fn(),
							CHTML: jest.fn(),
							src: {
								document: jest.fn().mockReturnValue(mjMockDoc)
							}
						}
					};
				}
				return null;
			});
			kernel.$.frameOptions.get = jest.fn().mockReturnValue(false);

			const mjMath = new Math(kernel, {});
			mjMath.textArea.value = 'x^2';
			mjMath.isUpdateState = false;
			domMock.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			mjMath.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);
			kernel.$.format.getLines.mockReturnValue([document.createElement('p')]);

			const result = await mjMath.modalAction();

			expect(result).toBe(true);
			// For MathJax, should removeClass 'katex' but not addClass 'katex'
			expect(domMock.utils.removeClass).toHaveBeenCalledWith(mockMathEl, 'katex');
			// MathJax re-render should be called
			expect(mjMockDoc.clear).toHaveBeenCalled();
			expect(mjMockDoc.updateDocument).toHaveBeenCalled();
		});

		it('should navigate to near range after insert when available', async () => {
			math.textArea.value = 'x^2';
			math.isUpdateState = false;
			domMock.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math katex',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);
			kernel.$.format.getLines.mockReturnValue([document.createElement('p')]);

			const nearRange = { container: document.createElement('p'), offset: 1 };
			kernel.$.selection.getNearRange.mockReturnValue(nearRange);

			await math.modalAction();

			expect(kernel.$.selection.setRange).toHaveBeenCalledWith(
				nearRange.container, nearRange.offset, nearRange.container, nearRange.offset
			);
		});

		it('should select component when getNearRange returns null', async () => {
			math.textArea.value = 'x^2';
			math.isUpdateState = false;
			domMock.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math katex',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);
			kernel.$.format.getLines.mockReturnValue([document.createElement('p')]);

			kernel.$.selection.getNearRange.mockReturnValue(null);

			await math.modalAction();

			expect(kernel.$.component.select).toHaveBeenCalledWith(mockMathEl, 'math');
		});
	});

	describe('init method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should clear textArea, preview, and remove error class', () => {
			const { dom } = require('../../../../src/helper');
			math.textArea.value = 'some value';
			math.previewElement.innerHTML = 'some preview';

			math.modalInit();

			expect(math.textArea.value).toBe('');
			expect(math.previewElement.innerHTML).toBe('');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(math.textArea, 'se-error');
		});
	});

	describe('componentSelect method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should open controller when element has math class and value', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					return null;
				})
			};
			dom.utils.hasClass.mockReturnValue(true);

			math.componentSelect(mockTarget);

			expect(math.controller.open).toHaveBeenCalledWith(
				mockTarget, null, { isWWTarget: false, initMethod: null, addOffset: null }
			);
		});

		it('should not open controller when hasClass returns false', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue('x^2')
			};
			dom.utils.hasClass.mockReturnValue(false);

			math.componentSelect(mockTarget);

			expect(math.controller.open).not.toHaveBeenCalled();
		});

		it('should not open controller when getValue returns null', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue(null)
			};
			dom.utils.hasClass.mockReturnValue(true);

			math.componentSelect(mockTarget);

			expect(math.controller.open).not.toHaveBeenCalled();
		});
	});

	describe('close method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should set element to null on controllerClose', () => {
			// Set up element via componentSelect
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					return null;
				})
			};
			dom.utils.hasClass.mockReturnValue(true);
			math.componentSelect(mockTarget);

			// Now close
			math.controllerClose();

			// The private #element field is set to null - we can verify behavior
			// by trying to copy after close (it should early return since element is null)
		});
	});

	describe('controllerAction method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should open modal for update command', async () => {
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
			math.componentSelect(mockElement);

			await math.controllerAction(mockTarget);

			// Copy is async so we need to wait
			await new Promise(resolve => setTimeout(resolve, 0));
			expect(kernel.$.html.copy).toHaveBeenCalled();
		});

		it('should destroy element for delete command', async () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue('delete')
			};
			math.controller.currentTarget = document.createElement('span');

			math.controllerAction(mockTarget);

			expect(dom.utils.removeItem).toHaveBeenCalled();
			expect(math.controller.close).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});
	});

	describe('destroy method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should remove target and close controller on componentDestroy', async () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = document.createElement('span');

			await math.componentDestroy(mockTarget);

			expect(dom.utils.removeItem).toHaveBeenCalledWith(mockTarget);
			expect(math.controller.close).toHaveBeenCalled();
			expect(kernel.$.focusManager.focus).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});
	});

	describe('retainFormat method', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">test</span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should return query and method', async () => {
			const result = math.retainFormat();

			expect(result.query).toBe('.se-math, .katex, .MathJax');
			expect(typeof result.method).toBe('function');
		});

		it('should process element with valid value', async () => {
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

		it('should skip element without value', async () => {
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue(null)
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			expect(mockElement.getAttribute).toHaveBeenCalled();
		});

		it('should skip when no katex or mathjax', async () => {
			math.katex = null;
			math.mathjax = null;

			const mockElement = {
				getAttribute: jest.fn()
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			expect(mockElement.getAttribute).not.toHaveBeenCalled();
		});

		it('should addClass katex when katex is set', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('x^2'),
				setAttribute: jest.fn(),
				innerHTML: ''
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			// Verify 'katex' class is added (line 161/163)
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockElement, 'katex');
		});

		it('should call renderMathJax when mathjax is set', () => {
			const { dom } = require('../../../../src/helper');

			// Set up mathjax on the instance
			const mjMockDoc = {
				convert: jest.fn().mockReturnValue({ outerHTML: '<span class="MathJax">rendered</span>' }),
				clear: jest.fn(),
				updateDocument: jest.fn()
			};
			math.katex = null;
			math.mathjax = mjMockDoc;

			const mockElement = {
				getAttribute: jest.fn().mockReturnValue('x^2'),
				setAttribute: jest.fn(),
				innerHTML: ''
			};

			const retainFormat = math.retainFormat();
			retainFormat.method(mockElement);

			// Should call removeClass katex since katex is null (line 163)
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockElement, 'katex');
			// Should call renderMathJax (line 167)
			expect(mjMockDoc.clear).toHaveBeenCalled();
			expect(mjMockDoc.updateDocument).toHaveBeenCalled();
		});
	});

	describe('Math rendering with KaTeX', () => {
		it('should render math using KaTeX renderer on modalOn with update', () => {
			const renderToString = jest.fn().mockReturnValue('<span class="katex">x^2</span>');
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});

			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};

			math.modalOn(true);

			// The renderer should have been called via modalOn update path
			expect(renderToString).toHaveBeenCalledWith('x^2', { throwOnError: true, displayMode: true });
		});

		it('should handle KaTeX error and set error class', () => {
			const { dom } = require('../../../../src/helper');
			const renderToString = jest.fn().mockImplementation(() => {
				throw new Error('KaTeX parse error');
			});
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});

			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'invalid\\math{';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};

			math.modalOn(true);

			// Should have set error class on textArea
			expect(dom.utils.addClass).toHaveBeenCalledWith(math.textArea, 'se-error');
			expect(console.warn).toHaveBeenCalledWith(
				'[SUNEDITOR.math.error] ',
				'KaTeX parse error'
			);
		});
	});

	describe('Math rendering with MathJax', () => {
		let mjMockDoc;

		beforeEach(() => {
			mjMockDoc = {
				convert: jest.fn().mockReturnValue({ outerHTML: '<span class="MathJax">rendered</span>' }),
				clear: jest.fn(),
				updateDocument: jest.fn()
			};

			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: {
							browserAdaptor: jest.fn(),
							RegisterHTMLHandler: jest.fn(),
							TeX: jest.fn(),
							CHTML: jest.fn(),
							src: {
								document: jest.fn().mockReturnValue(mjMockDoc)
							}
						}
					};
				}
				return null;
			});
			kernel.$.frameOptions.get = jest.fn().mockReturnValue(false);
		});

		it('should render math using MathJax on modalOn with update', () => {
			math = new Math(kernel, {});

			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};

			math.modalOn(true);

			expect(mjMockDoc.convert).toHaveBeenCalledWith('x^2');
		});

		it('should handle MathJax error (mjx-merror in result)', () => {
			const { dom } = require('../../../../src/helper');
			mjMockDoc.convert.mockReturnValue({ outerHTML: '<mjx-merror>error</mjx-merror>' });

			math = new Math(kernel, {});

			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'invalid';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};

			math.modalOn(true);

			// Should have set error class
			expect(dom.utils.addClass).toHaveBeenCalledWith(math.textArea, 'se-error');
			// Result should contain error wrapper
			expect(math.previewElement.innerHTML).toContain('se-math-error');
		});

		it('should wrap MathJax result in se-math span', () => {
			math = new Math(kernel, {});

			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};

			math.modalOn(true);

			expect(math.previewElement.innerHTML).toContain('se-math');
		});
	});

	describe('Renderer with no library', () => {
		it('should show MATH_LIB_NOT_FOUND error when no library set', () => {
			const { dom } = require('../../../../src/helper');

			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});

			// Now remove both libraries to trigger no-lib path
			math.katex = null;
			math.mathjax = null;

			// Trigger renderer via modalOn update path
			math.controller.currentTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '1em';
					return null;
				})
			};

			math.modalOn(true);

			expect(dom.utils.addClass).toHaveBeenCalledWith(math.textArea, 'se-error');
			expect(math.previewElement.innerHTML).toContain('se-math-error');
			expect(math.previewElement.innerHTML).toContain('404 Not found');
		});
	});

	describe('Font size handling', () => {
		it('should update preview font size via change handler', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});

			// Get the change handler from addEvent calls
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const changeCall = addEventCalls.find(call => call[1] === 'change');
			const changeHandler = changeCall[2];

			// Simulate font size change
			changeHandler({ target: { value: '2.5em' } });
			expect(math.previewElement.style.fontSize).toBe('2.5em');

			changeHandler({ target: { value: '1.5em' } });
			expect(math.previewElement.style.fontSize).toBe('1.5em');
		});
	});

	describe('RenderMathExp (input handler)', () => {
		it('should render math expression on input', () => {
			const renderToString = jest.fn().mockReturnValue('<span class="katex">result</span>');
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});

			// Get the input handler
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const inputCall = addEventCalls.find(call => call[1] === 'input');
			const renderMathExp = inputCall[2];

			const { dom } = require('../../../../src/helper');
			dom.query.getEventTarget.mockReturnValue({ value: 'a^2+b^2=c^2', style: {} });

			renderMathExp({ target: { value: 'a^2+b^2=c^2', style: {} } });

			expect(renderToString).toHaveBeenCalled();
		});

		it('should adjust textarea height when autoHeight is true', () => {
			const renderToString = jest.fn().mockReturnValue('<span class="katex">result</span>');
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, { autoHeight: true });

			// Get the input handler
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const inputCall = addEventCalls.find(call => call[1] === 'input');
			const renderMathExp = inputCall[2];

			const { dom } = require('../../../../src/helper');
			const mockTarget = { value: 'a^2', style: {}, scrollHeight: 100 };
			dom.query.getEventTarget.mockReturnValue(mockTarget);

			renderMathExp({ target: mockTarget });

			// Should set height to '5px' first, then scrollHeight + 5 + 'px'
			expect(mockTarget.style.height).toBe('105px');
		});

		it('should call renderMathJax when mathjax is active on input', () => {
			const mjMockDoc = {
				convert: jest.fn().mockReturnValue({ outerHTML: '<span class="MathJax">rendered</span>' }),
				clear: jest.fn(),
				updateDocument: jest.fn()
			};

			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: {
							browserAdaptor: jest.fn(),
							RegisterHTMLHandler: jest.fn(),
							TeX: jest.fn(),
							CHTML: jest.fn(),
							src: {
								document: jest.fn().mockReturnValue(mjMockDoc)
							}
						}
					};
				}
				return null;
			});
			kernel.$.frameOptions.get = jest.fn().mockReturnValue(false);

			math = new Math(kernel, {});

			// Get the input handler
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const inputCall = addEventCalls.find(call => call[1] === 'input');
			const renderMathExp = inputCall[2];

			const { dom } = require('../../../../src/helper');
			dom.query.getEventTarget.mockReturnValue({ value: 'x^2', style: {} });

			renderMathExp({ target: { value: 'x^2', style: {} } });

			// MathJax should be re-rendered
			expect(mjMockDoc.clear).toHaveBeenCalled();
			expect(mjMockDoc.updateDocument).toHaveBeenCalled();
		});
	});

	describe('Clipboard copy', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should copy text and apply copy effect', async () => {
			const { dom, env } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'E=mc^2';
					return null;
				})
			};

			dom.utils.hasClass.mockReturnValue(true);
			math.componentSelect(mockElement);

			const copyTarget = {
				getAttribute: jest.fn().mockReturnValue('copy')
			};

			await math.controllerAction(copyTarget);
			await new Promise(resolve => setTimeout(resolve, 0));

			expect(kernel.$.html.copy).toHaveBeenCalledWith('E=mc^2');
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockElement, 'se-copy');
			// setTimeout should remove 'se-copy' class
			expect(env._w.setTimeout).toHaveBeenCalled();
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockElement, 'se-copy');
		});

		it('should early return when no clipboard API', async () => {
			const origClipboard = navigator.clipboard;
			Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true, writable: true });

			const { dom } = require('../../../../src/helper');
			const mockElement = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					return null;
				})
			};

			dom.utils.hasClass.mockReturnValue(true);
			math.componentSelect(mockElement);

			const copyTarget = {
				getAttribute: jest.fn().mockReturnValue('copy')
			};

			await math.controllerAction(copyTarget);
			await new Promise(resolve => setTimeout(resolve, 0));

			expect(kernel.$.html.copy).not.toHaveBeenCalled();

			// Restore clipboard
			Object.defineProperty(navigator, 'clipboard', { value: origClipboard, configurable: true, writable: true });
		});

		it('should early return when element is null', async () => {
			// Don't select any element (element is null by default)
			const copyTarget = {
				getAttribute: jest.fn().mockReturnValue('copy')
			};

			await math.controllerAction(copyTarget);
			await new Promise(resolve => setTimeout(resolve, 0));

			expect(kernel.$.html.copy).not.toHaveBeenCalled();
		});

		it('should handle copy error', async () => {
			const { dom } = require('../../../../src/helper');
			kernel.$.html.copy.mockRejectedValueOnce(new Error('Copy failed'));

			const mockElement = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					return null;
				})
			};

			dom.utils.hasClass.mockReturnValue(true);
			math.componentSelect(mockElement);

			const copyTarget = {
				getAttribute: jest.fn().mockReturnValue('copy')
			};

			await math.controllerAction(copyTarget);
			await new Promise(resolve => setTimeout(resolve, 10));

			expect(console.error).toHaveBeenCalledWith(
				'[SUNEDITOR.math.copy.fail]',
				expect.any(Error)
			);
		});
	});

	describe('CheckKatex', () => {
		it('should return null when katex option not set', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {}; // no katex
				}
				return null;
			});
			// Need mathjax too to avoid double-null warning path being sole test
			// But we want to test katex returning null specifically
			// Just set both null
			math = new Math(kernel, {});

			expect(math.katex).toBeNull();
		});

		it('should warn when katex.src is missing', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: { /* no src */ }
					};
				}
				return null;
			});

			math = new Math(kernel, {});

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.math.katex.fail]')
			);
			expect(math.katex).toBeNull();
		});

		it('should merge katex options with defaults', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn() },
							options: { displayMode: true, macros: { '\\RR': '\\mathbb{R}' } }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, {});

			expect(math.katex).not.toBeNull();
			expect(math.katex.options.throwOnError).toBe(false);
			expect(math.katex.options.displayMode).toBe(true);
			expect(math.katex.options.macros).toEqual({ '\\RR': '\\mathbb{R}' });
		});
	});

	describe('CheckMathJax', () => {
		it('should return null when mathjax option not set', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {}; // no mathjax
				}
				return null;
			});

			math = new Math(kernel, {});

			expect(math.mathjax).toBeNull();
		});

		it('should warn when iframe option is set', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: {
							browserAdaptor: jest.fn(),
							RegisterHTMLHandler: jest.fn(),
							TeX: jest.fn(),
							CHTML: jest.fn(),
							src: {
								document: jest.fn().mockReturnValue({
									convert: jest.fn().mockReturnValue({ outerHTML: '<span>test</span>' }),
									clear: jest.fn(),
									updateDocument: jest.fn()
								})
							}
						}
					};
				}
				return null;
			});

			// Set iframe option to true
			kernel.$.frameOptions.get = jest.fn((key) => {
				if (key === 'iframe') return true;
				return null;
			});

			math = new Math(kernel, {});

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.math.mathjax.fail] The MathJax option is not supported in the iframe')
			);
		});

		it('should create MathJax document successfully', () => {
			const mjMockDoc = {
				convert: jest.fn().mockReturnValue({ outerHTML: '<span>test</span>' }),
				clear: jest.fn(),
				updateDocument: jest.fn()
			};

			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: {
							browserAdaptor: jest.fn(),
							RegisterHTMLHandler: jest.fn(),
							TeX: jest.fn(),
							CHTML: jest.fn(),
							src: {
								document: jest.fn().mockReturnValue(mjMockDoc)
							}
						}
					};
				}
				return null;
			});
			kernel.$.frameOptions.get = jest.fn().mockReturnValue(false);

			math = new Math(kernel, {});

			expect(math.mathjax).not.toBeNull();
			expect(math.mathjax).toBe(mjMockDoc);
		});

		it('should handle MathJax initialization error', () => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						mathjax: {
							browserAdaptor: jest.fn().mockImplementation(() => {
								throw new Error('MathJax init error');
							}),
							RegisterHTMLHandler: jest.fn(),
							TeX: jest.fn(),
							CHTML: jest.fn(),
							src: {
								document: jest.fn()
							}
						}
					};
				}
				return null;
			});
			kernel.$.frameOptions.get = jest.fn().mockReturnValue(false);

			math = new Math(kernel, {});

			expect(math.mathjax).toBeNull();
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.math.mathjax.fail] The MathJax option is set incorrectly'),
				expect.any(Error)
			);
		});
	});

	describe('getValue/getType helper functions (v2 migration)', () => {
		beforeEach(() => {
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex"></span>') }
						}
					};
				}
				return null;
			});
			math = new Math(kernel, {});
		});

		it('should return data-se-value when present', () => {
			const mockTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return '2em';
					return null;
				})
			};

			math.controller.currentTarget = mockTarget;
			math.modalOn(true);

			expect(math.textArea.value).toBe('x^2');
		});

		it('should migrate data-exp to data-se-value (v2 migration)', () => {
			const mockTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return null;
					if (attr === 'data-exp') return 'y=mx+b';
					return null;
				}),
				removeAttribute: jest.fn(),
				setAttribute: jest.fn()
			};

			math.controller.currentTarget = mockTarget;
			math.modalOn(true);

			// Should migrate the attribute
			expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-exp');
			expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-se-value', 'y=mx+b');
			expect(math.textArea.value).toBe('y=mx+b');
		});

		it('should return null when neither data-se-value nor data-exp exists', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue(null)
			};

			// componentSelect should not open controller when getValue returns null
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass.mockReturnValue(true);

			math.componentSelect(mockTarget);

			// getValue returns null, so controller should not be opened
			expect(math.controller.open).not.toHaveBeenCalled();
		});

		it('should migrate data-font-size to data-se-type (v2 migration)', () => {
			const mockTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					if (attr === 'data-se-type') return null;
					if (attr === 'data-font-size') return '1.5em';
					return null;
				}),
				removeAttribute: jest.fn(),
				setAttribute: jest.fn()
			};

			math.controller.currentTarget = mockTarget;
			math.modalOn(true);

			expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-font-size');
			expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-se-type', '1.5em');
			expect(math.fontSizeElement.value).toBe('1.5em');
		});

		it('should return null for getType when neither data-se-type nor data-font-size exists', () => {
			const mockTarget = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					return null; // no type attrs
				})
			};

			math.controller.currentTarget = mockTarget;
			math.modalOn(true);

			// getType returns null, so it falls back to '1em'
			expect(math.fontSizeElement.value).toBe('1em');
		});
	});

	describe('Integration scenarios', () => {
		it('should handle full lifecycle: construct -> open -> modalOn -> modalAction -> close', async () => {
			const { dom } = require('../../../../src/helper');
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">x^2</span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, {});

			// open
			math.open();
			expect(math.modal.open).toHaveBeenCalled();

			// modalOn (new)
			math.modalOn(false);
			expect(math.textArea.value).toBe('');
			expect(math.isUpdateState).toBe(false);

			// Set value and submit
			math.textArea.value = 'x^2';
			dom.utils.hasClass.mockReturnValue(false);

			const mockMathEl = {
				tagName: 'SPAN',
				className: 'se-math katex',
				setAttribute: jest.fn(),
				style: {},
				innerHTML: 'rendered'
			};
			math.previewElement.querySelector = jest.fn().mockReturnValue(mockMathEl);
			kernel.$.format.getLines.mockReturnValue([document.createElement('p')]);
			kernel.$.selection.getNearRange.mockReturnValue({ container: document.createTextNode(''), offset: 0 });

			const result = await math.modalAction();
			expect(result).toBe(true);
		});

		it('should handle componentSelect then controllerAction update flow', () => {
			const { dom } = require('../../../../src/helper');
			kernel.$.options.get = jest.fn((key) => {
				if (key === 'externalLibs') {
					return {
						katex: {
							src: { renderToString: jest.fn().mockReturnValue('<span class="katex">x^2</span>') }
						}
					};
				}
				return null;
			});

			math = new Math(kernel, {});

			// Select a math component
			const mockElement = {
				getAttribute: jest.fn((attr) => {
					if (attr === 'data-se-value') return 'x^2';
					return null;
				})
			};
			dom.utils.hasClass.mockReturnValue(true);
			math.componentSelect(mockElement);

			expect(math.controller.open).toHaveBeenCalled();

			// Click update
			const updateBtn = { getAttribute: jest.fn().mockReturnValue('update') };
			math.controllerAction(updateBtn);
			expect(math.modal.open).toHaveBeenCalled();
		});
	});
});
