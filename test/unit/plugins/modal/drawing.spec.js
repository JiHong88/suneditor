import Drawing from '../../../../src/plugins/modal/drawing';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor(editor) {
			this.editor = editor;
			this.lang = editor.lang || {
				drawing: 'Drawing',
				drawing_modal_title: 'Drawing',
				close: 'Close',
				submitButton: 'Submit',
				remove: 'Remove',
				blockStyle: 'Block',
				inlineStyle: 'Inline'
			};
			this.icons = editor.icons || {
				cancel: '<svg>cancel</svg>',
				as_block: '<svg>block</svg>',
				as_inline: '<svg>inline</svg>',
				eraser: '<svg>eraser</svg>'
			};
			this.plugins = editor.plugins || {};
			this.carrierWrapper = {
				style: { color: '#000000' }
			};
			this.eventManager = {
				addEvent: jest.fn((target, event, handler, options) => {
					return { target, event, handler, options };
				}),
				removeEvent: jest.fn()
			};
		}
	};
});

jest.mock('../../../../src/modules/contracts', () => ({
	Modal: jest.fn().mockImplementation((plugin, modalEl) => {
		// Setup proper querySelector support for modal
		if (!modalEl.querySelector) {
			modalEl.querySelector = jest.fn((selector) => {
				if (selector === '[data-command="asBlock"]') {
					return { tagName: 'BUTTON', getAttribute: jest.fn().mockReturnValue('asBlock') };
				} else if (selector === '[data-command="asInline"]') {
					return { tagName: 'BUTTON', getAttribute: jest.fn().mockReturnValue('asInline') };
				} else if (selector === '[data-command="remove"]') {
					return { tagName: 'BUTTON', getAttribute: jest.fn().mockReturnValue('remove') };
				} else if (selector === '.se-drawing-canvas') {
					return null; // Will be set by individual tests
				}
				return null;
			});
		}

		return {
			open: jest.fn(),
			close: jest.fn(),
			form: modalEl
		};
	})
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockImplementation((tag, attrs, html) => {
				const el = {
					tagName: tag.toUpperCase(),
					className: attrs && attrs.class ? attrs.class : '',
					innerHTML: html || '',
					setAttribute: jest.fn(),
					querySelector: jest.fn((selector) => {
						// Return appropriate mock elements for common selectors
						if (selector === '[data-command="asBlock"]') {
							return { tagName: 'BUTTON', getAttribute: jest.fn((attr) => attr === 'data-command' ? 'asBlock' : null) };
						} else if (selector === '[data-command="asInline"]') {
							return { tagName: 'BUTTON', getAttribute: jest.fn((attr) => attr === 'data-command' ? 'asInline' : null) };
						} else if (selector === '[data-command="remove"]') {
							return { tagName: 'BUTTON', getAttribute: jest.fn((attr) => attr === 'data-command' ? 'remove' : null) };
						} else if (selector === '.se-drawing-canvas') {
							return null; // Will be set by individual tests
						}
						return null;
					}),
					querySelectorAll: jest.fn()
				};
				return el;
			}),
			createTooltipInner: jest.fn().mockReturnValue('<span class="se-tooltip-inner"></span>'),
			addClass: jest.fn(),
			removeClass: jest.fn()
		},
		query: {
			getEventTarget: jest.fn((e) => e.target)
		}
	},
	env: {
		_w: {
			getComputedStyle: jest.fn().mockReturnValue({ color: '#000000' })
		},
		isResizeObserverSupported: false // Default to false for simpler testing
	}
}));

// Mock global objects
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
	observe: jest.fn(),
	disconnect: jest.fn(),
	unobserve: jest.fn()
}));

global.XMLSerializer = jest.fn().mockImplementation(() => ({
	serializeToString: jest.fn().mockReturnValue('<svg></svg>')
}));

global.DataTransfer = jest.fn().mockImplementation(() => {
	const items = [];
	return {
		items: {
			add: jest.fn((file) => items.push(file))
		},
		files: items
	};
});

global.console = { ...console, warn: jest.fn() };

// Helper to create mock canvas
function createMockCanvas(options = {}) {
	return {
		tagName: 'CANVAS',
		getContext: jest.fn().mockReturnValue({
			lineWidth: 5,
			lineCap: 'round',
			strokeStyle: '#000000',
			clearRect: jest.fn(),
			beginPath: jest.fn(),
			stroke: jest.fn(),
			moveTo: jest.fn(),
			lineTo: jest.fn()
		}),
		offsetWidth: options.offsetWidth || 600,
		offsetHeight: options.offsetHeight || 400,
		width: options.width || 600,
		height: options.height || 400,
		getBoundingClientRect: jest.fn().mockReturnValue({
			left: 0,
			top: 0,
			width: options.width || 600,
			height: options.height || 400
		}),
		toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test'),
		...options
	};
}

describe('Drawing Plugin', () => {
	let mockEditor;
	let drawing;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			lang: {
				drawing: 'Drawing',
				drawing_modal_title: 'Drawing Modal',
				close: 'Close',
				submitButton: 'Submit',
				remove: 'Remove',
				blockStyle: 'Block',
				inlineStyle: 'Inline'
			},
			icons: {
				cancel: '<svg>cancel</svg>',
				as_block: '<svg>block</svg>',
				as_inline: '<svg>inline</svg>',
				eraser: '<svg>eraser</svg>'
			},
			plugins: {
				image: {
					pluginOptions: { uploadUrl: 'http://example.com/upload' },
					init: jest.fn(),
					submitFile: jest.fn(),
					create: jest.fn(),
					createInline: jest.fn()
				}
			}
		};
	});

	describe('Static properties', () => {
		it('should have correct static properties', async () => {
			expect(Drawing.key).toBe('drawing');
			expect(Drawing.type).toBe('modal');
			expect(Drawing.className).toBe('');
		});
	});

	describe('Constructor', () => {
		it('should create Drawing instance with default options', async () => {
			drawing = new Drawing(mockEditor, {});

			expect(drawing.title).toBe('Drawing');
			expect(drawing.icon).toBe('drawing');
			expect(drawing.pluginOptions.outputFormat).toBe('dataurl');
			expect(drawing.pluginOptions.lineWidth).toBe(5);
			expect(drawing.pluginOptions.lineCap).toBe('round');
			expect(drawing.pluginOptions.canResize).toBe(true);
			expect(drawing.pluginOptions.maintainRatio).toBe(true);
		});

		it('should create Drawing instance with custom options', async () => {
			drawing = new Drawing(mockEditor, {
				outputFormat: 'svg',
				useFormatType: true,
				defaultFormatType: 'inline',
				keepFormatType: true,
				lineWidth: 10,
				lineReconnect: true,
				lineCap: 'butt',
				lineColor: '#ff0000',
				canResize: false,
				maintainRatio: false,
				formSize: {
					width: '600px',
					height: '400px'
				}
			});

			expect(drawing.pluginOptions.outputFormat).toBe('svg');
			expect(drawing.pluginOptions.useFormatType).toBe(true);
			expect(drawing.pluginOptions.defaultFormatType).toBe('inline');
			expect(drawing.pluginOptions.keepFormatType).toBe(true);
			expect(drawing.pluginOptions.lineWidth).toBe(10);
			expect(drawing.pluginOptions.lineReconnect).toBe(true);
			expect(drawing.pluginOptions.lineCap).toBe('butt');
			expect(drawing.pluginOptions.lineColor).toBe('#ff0000');
			expect(drawing.pluginOptions.canResize).toBe(false);
			expect(drawing.pluginOptions.maintainRatio).toBe(false);
			expect(drawing.pluginOptions.formSize.width).toBe('600px');
			expect(drawing.pluginOptions.formSize.height).toBe('400px');
		});

		it('should normalize invalid lineCap to "round"', async () => {
			drawing = new Drawing(mockEditor, { lineCap: 'invalid' });
			expect(drawing.pluginOptions.lineCap).toBe('round');
		});

		it('should normalize invalid defaultFormatType to "block"', async () => {
			drawing = new Drawing(mockEditor, { defaultFormatType: 'invalid' });
			expect(drawing.pluginOptions.defaultFormatType).toBe('block');
		});

		it('should warn if image plugin is not available', async () => {
			const editorNoImage = { ...mockEditor, plugins: {} };
			drawing = new Drawing(editorNoImage, {});

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('The drawing plugin must need either "image" plugin')
			);
		});

		it('should warn if SVG output is used without uploadUrl', async () => {
			const editorNoUpload = {
				...mockEditor,
				plugins: {
					image: {
						pluginOptions: {}
					}
				}
			};
			drawing = new Drawing(editorNoUpload, { outputFormat: 'svg' });

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('must need the "image" plugin with the "uploadUrl" option')
			);
		});

		it('should initialize modal', async () => {
			drawing = new Drawing(mockEditor, {});
			expect(drawing.modal).toBeDefined();
		});

		it('should initialize drawing state', async () => {
			drawing = new Drawing(mockEditor, {});
			expect(drawing.canvas).toBeNull();
			expect(drawing.ctx).toBeNull();
			expect(drawing.isDrawing).toBe(false);
			expect(drawing.points).toEqual([]);
			expect(drawing.paths).toEqual([]);
			expect(drawing.resizeObserver).toBeNull();
		});

		it('should setup format type buttons when useFormatType is true', async () => {
			drawing = new Drawing(mockEditor, { useFormatType: true });
			// asBlock and asInline should be populated by querySelector in constructor
			expect(drawing.asBlock).toBeTruthy();
			expect(drawing.asInline).toBeTruthy();
		});
	});

	describe('open method', () => {
		beforeEach(() => {
			drawing = new Drawing(mockEditor, {});
		});

		it('should open modal and initialize drawing', async () => {
			// Mock canvas element
			const mockCanvas = createMockCanvas();

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);

			drawing.open();

			expect(drawing.modal.open).toHaveBeenCalled();
			expect(drawing.canvas).toBe(mockCanvas);
			expect(drawing.ctx).toBeDefined();
			expect(drawing.canvas.width).toBe(600);
			expect(drawing.canvas.height).toBe(400);
		});

		it('should use default format type when opening', async () => {
			const { dom } = require('../../../../src/helper');
			drawing = new Drawing(mockEditor, { useFormatType: true, defaultFormatType: 'block' });

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);

			drawing.open();

			expect(dom.utils.addClass).toHaveBeenCalled();
		});

		it('should keep format type when keepFormatType is true', async () => {
			drawing = new Drawing(mockEditor, { useFormatType: true, keepFormatType: true, defaultFormatType: 'inline' });
			drawing.as = 'inline';

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);

			drawing.open();

			expect(drawing.as).toBe('inline');
		});
	});

	describe('off method', () => {
		beforeEach(() => {
			drawing = new Drawing(mockEditor, {});

			// Setup canvas
			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.getBoundingClientRect = jest.fn().mockReturnValue({
				left: 0,
				top: 0,
				width: 600,
				height: 400
			});

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();
		});

		it('should destroy drawing and clean up', async () => {
			drawing.modalOff();

			expect(drawing.canvas).toBeNull();
			expect(drawing.ctx).toBeNull();
			expect(drawing.points).toEqual([]);
			expect(drawing.paths).toEqual([]);
			expect(drawing.isDrawing).toBe(false);
		});

		it('should remove event listeners', async () => {
			const mockEventManager = drawing.eventManager;
			drawing.modalOff();

			expect(mockEventManager.removeEvent).toHaveBeenCalled();
		});

		it('should disconnect ResizeObserver if exists', async () => {
			const { env } = require('../../../../src/helper');
			env.isResizeObserverSupported = true;

			drawing = new Drawing(mockEditor, {});
			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);

			drawing.open();

			const mockObserver = drawing.resizeObserver;
			drawing.modalOff();

			if (mockObserver) {
				expect(mockObserver.disconnect).toHaveBeenCalled();
			}
			expect(drawing.resizeObserver).toBeNull();

			env.isResizeObserverSupported = false;
		});
	});

	describe('modalAction method', () => {
		beforeEach(() => {
			drawing = new Drawing(mockEditor, {});

			// Setup canvas
			const mockCanvas = createMockCanvas();
			mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();
		});

		it('should create dataurl image as block by default', async () => {
			const result = await drawing.modalAction();

			expect(mockEditor.plugins.image.init).toHaveBeenCalled();
			expect(mockEditor.plugins.image.create).toHaveBeenCalledWith(
				'data:image/png;base64,test',
				null,
				'auto',
				'',
				'none',
				{ name: 'drawing', size: 0 },
				''
			);
			expect(result).toBe(true);
		});

		it('should create dataurl image as inline when as is "inline"', async () => {
			drawing.as = 'inline';
			const result = await drawing.modalAction();

			expect(mockEditor.plugins.image.init).toHaveBeenCalled();
			expect(mockEditor.plugins.image.createInline).toHaveBeenCalledWith(
				'data:image/png;base64,test',
				null,
				'auto',
				'',
				'none',
				{ name: 'drawing', size: 0 },
				''
			);
			expect(result).toBe(true);
		});

		it('should submit SVG file when outputFormat is svg', async () => {
			drawing = new Drawing(mockEditor, { outputFormat: 'svg' });

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();

			// Add some paths
			drawing.paths = [[[10, 10], [20, 20], [30, 30]]];

			const result = await drawing.modalAction();

			expect(mockEditor.plugins.image.init).toHaveBeenCalled();
			expect(mockEditor.plugins.image.submitFile).toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});

	describe('Canvas drawing operations', () => {
		beforeEach(() => {
			drawing = new Drawing(mockEditor, {});

			// Setup canvas
			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;
			mockCanvas.getBoundingClientRect = jest.fn().mockReturnValue({
				left: 0,
				top: 0,
				width: 600,
				height: 400
			});

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();
		});

		it('should handle mousedown event', async () => {
			const mouseEvent = {
				preventDefault: jest.fn(),
				offsetX: 100,
				offsetY: 150
			};

			// Simulate mousedown
			const mousedownHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown'
			)[2];
			mousedownHandler(mouseEvent);

			expect(mouseEvent.preventDefault).toHaveBeenCalled();
			expect(drawing.isDrawing).toBe(true);
			expect(drawing.points).toContainEqual([100, 150]);
		});

		it('should handle mousemove event while drawing', async () => {
			drawing.isDrawing = true;
			drawing.points = [[50, 50]];

			const mouseEvent = {
				preventDefault: jest.fn(),
				offsetX: 100,
				offsetY: 150
			};

			// Simulate mousemove
			const mousemoveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousemove'
			)[2];
			mousemoveHandler(mouseEvent);

			expect(mouseEvent.preventDefault).toHaveBeenCalled();
			expect(drawing.points.length).toBeGreaterThan(1);
			expect(drawing.points).toContainEqual([100, 150]);
		});

		it('should not draw on mousemove when not drawing', async () => {
			drawing.isDrawing = false;
			const initialLength = drawing.points.length;

			const mouseEvent = {
				preventDefault: jest.fn(),
				offsetX: 100,
				offsetY: 150
			};

			// Simulate mousemove
			const mousemoveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousemove'
			)[2];
			mousemoveHandler(mouseEvent);

			expect(drawing.points.length).toBe(initialLength);
		});

		it('should handle mouseup event', async () => {
			drawing.isDrawing = true;
			drawing.points = [[50, 50], [100, 100]];

			// Simulate mouseup
			const mouseupHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mouseup'
			)[2];
			mouseupHandler();

			expect(drawing.isDrawing).toBe(false);
			expect(drawing.paths.length).toBe(1);
			expect(drawing.points).toEqual([]);
		});

		it('should handle mouseleave event without lineReconnect', async () => {
			drawing.isDrawing = true;
			drawing.points = [[50, 50], [100, 100]];

			// Simulate mouseleave
			const mouseleaveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mouseleave'
			)[2];
			mouseleaveHandler();

			expect(drawing.isDrawing).toBe(false);
			expect(drawing.paths.length).toBe(1);
			expect(drawing.points).toEqual([]);
		});

		it('should handle mouseleave event with lineReconnect', async () => {
			drawing = new Drawing(mockEditor, { lineReconnect: true });

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;
			mockCanvas.getBoundingClientRect = jest.fn().mockReturnValue({
				left: 0,
				top: 0,
				width: 600,
				height: 400
			});

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();

			drawing.isDrawing = true;
			drawing.points = [[50, 50], [100, 100]];

			// Simulate mouseleave
			const mouseleaveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mouseleave'
			)[2];
			mouseleaveHandler();

			expect(drawing.isDrawing).toBe(true); // Still drawing with lineReconnect
			expect(drawing.paths.length).toBe(1);
		});

		it('should handle mouseenter event without lineReconnect', async () => {
			drawing.paths = [[[50, 50], [100, 100]]];

			const mouseEvent = {
				buttons: 1,
				offsetX: 150,
				offsetY: 200
			};

			// Simulate mouseenter
			const mouseenterHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mouseenter'
			)[2];
			mouseenterHandler(mouseEvent);

			expect(drawing.isDrawing).toBe(true);
			expect(drawing.points).toContainEqual([150, 200]);
		});

		it('should handle mouseenter event with lineReconnect', async () => {
			drawing = new Drawing(mockEditor, { lineReconnect: true });

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;
			mockCanvas.getBoundingClientRect = jest.fn().mockReturnValue({
				left: 0,
				top: 0,
				width: 600,
				height: 400
			});

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();

			drawing.paths = [[[50, 50], [100, 100]]];

			const mouseEvent = {
				buttons: 1,
				offsetX: 150,
				offsetY: 200
			};

			// Simulate mouseenter
			const mouseenterHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mouseenter'
			)[2];
			mouseenterHandler(mouseEvent);

			expect(drawing.isDrawing).toBe(true);
			expect(drawing.points.length).toBeGreaterThan(0);
		});

		it('should handle touchstart event', async () => {
			const touchEvent = {
				preventDefault: jest.fn(),
				touches: [{ clientX: 100, clientY: 150 }]
			};

			// Simulate touchstart
			const touchstartHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'touchstart'
			)[2];
			touchstartHandler(touchEvent);

			expect(touchEvent.preventDefault).toHaveBeenCalled();
			expect(drawing.isDrawing).toBe(true);
		});

		it('should handle touchmove event while drawing', async () => {
			drawing.isDrawing = true;
			drawing.points = [[50, 50]];

			const touchEvent = {
				preventDefault: jest.fn(),
				touches: [{ clientX: 100, clientY: 150 }]
			};

			// Simulate touchmove
			const touchmoveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'touchmove'
			)[2];
			touchmoveHandler(touchEvent);

			expect(touchEvent.preventDefault).toHaveBeenCalled();
			expect(drawing.points.length).toBeGreaterThan(1);
		});

		it('should not draw on touchmove when not drawing', async () => {
			drawing.isDrawing = false;
			const initialLength = drawing.points.length;

			const touchEvent = {
				preventDefault: jest.fn(),
				touches: [{ clientX: 100, clientY: 150 }]
			};

			// Simulate touchmove
			const touchmoveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'touchmove'
			)[2];
			touchmoveHandler(touchEvent);

			expect(drawing.points.length).toBe(initialLength);
		});
	});

	describe('Clear canvas', () => {
		beforeEach(() => {
			drawing = new Drawing(mockEditor, {});

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();
		});

		it('should clear canvas on remove button click', async () => {
			drawing.points = [[10, 10], [20, 20]];
			drawing.paths = [[[30, 30], [40, 40]]];

			// Find and trigger remove button click
			const removeHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[0] && call[0].getAttribute && call[0].getAttribute('data-command') === 'remove'
			)[2];

			removeHandler();

			expect(drawing.ctx.clearRect).toHaveBeenCalledWith(0, 0, 600, 400);
			expect(drawing.points).toEqual([]);
			expect(drawing.paths).toEqual([]);
		});
	});

	describe('Format type switching', () => {
		beforeEach(() => {
			drawing = new Drawing(mockEditor, { useFormatType: true });

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
		});

		it('should switch to inline format', async () => {
			const { dom } = require('../../../../src/helper');

			const mockEvent = {
				target: {
					getAttribute: jest.fn().mockReturnValue('asInline')
				}
			};

			// Find and trigger format button click
			const formatHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[0] && Array.isArray(call[0]) && call[1] === 'click'
			);

			if (formatHandler) {
				formatHandler[2](mockEvent);
				expect(drawing.as).toBe('inline');
			}
		});

		it('should switch to block format', async () => {
			const { dom } = require('../../../../src/helper');
			drawing.as = 'inline';

			const mockEvent = {
				target: {
					getAttribute: jest.fn().mockReturnValue('asBlock')
				}
			};

			// Find and trigger format button click
			const formatHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[0] && Array.isArray(call[0]) && call[1] === 'click'
			);

			if (formatHandler) {
				formatHandler[2](mockEvent);
				expect(drawing.as).toBe('block');
			}
		});
	});

	describe('ResizeObserver integration', () => {
		it('should setup ResizeObserver when supported', async () => {
			const { env } = require('../../../../src/helper');
			env.isResizeObserverSupported = true;

			drawing = new Drawing(mockEditor, { maintainRatio: true });

			const mockCanvas = createMockCanvas();
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();

			expect(ResizeObserver).toHaveBeenCalled();
			expect(drawing.resizeObserver).toBeDefined();

			env.isResizeObserverSupported = false;
		});

		it('should adjust paths on resize with maintainRatio', async () => {
			const { env } = require('../../../../src/helper');
			env.isResizeObserverSupported = true;

			drawing = new Drawing(mockEditor, { maintainRatio: true });

			const mockCanvas = createMockCanvas();
			const mockCtx = {
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			};
			mockCanvas.getContext = jest.fn().mockReturnValue(mockCtx);
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();

			// Add some paths
			drawing.paths = [[[100, 100], [200, 200]]];

			// Simulate resize
			mockCanvas.offsetWidth = 800;
			mockCanvas.offsetHeight = 600;

			const resizeCallback = ResizeObserver.mock.calls[ResizeObserver.mock.calls.length - 1][0];
			resizeCallback();

			expect(mockCtx.clearRect).toHaveBeenCalled();

			env.isResizeObserverSupported = false;
		});

		it('should not adjust paths on resize without maintainRatio', async () => {
			const { env } = require('../../../../src/helper');
			env.isResizeObserverSupported = true;

			drawing = new Drawing(mockEditor, { maintainRatio: false });

			const mockCanvas = createMockCanvas();
			const mockCtx = {
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			};
			mockCanvas.getContext = jest.fn().mockReturnValue(mockCtx);
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);
			drawing.open();

			drawing.paths = [[[100, 100], [200, 200]]];
			const originalPath = drawing.paths[0][0];

			// Simulate resize
			mockCanvas.offsetWidth = 800;
			mockCanvas.offsetHeight = 600;

			const resizeCallback = ResizeObserver.mock.calls[ResizeObserver.mock.calls.length - 1][0];
			resizeCallback();

			// Paths should not be adjusted
			expect(drawing.paths[0][0]).toEqual(originalPath);

			env.isResizeObserverSupported = false;
		});

		it('should disconnect existing ResizeObserver when opening again', async () => {
			const { env } = require('../../../../src/helper');
			env.isResizeObserverSupported = true;

			drawing = new Drawing(mockEditor, {});

			const mockCanvas = createMockCanvas();
			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);

			// Open first time
			drawing.open();
			const firstObserver = drawing.resizeObserver;
			expect(firstObserver).toBeDefined();

			// Open second time without closing
			drawing.open();

			// First observer should have been disconnected
			expect(firstObserver.disconnect).toHaveBeenCalled();
			// New observer should be created
			expect(drawing.resizeObserver).toBeDefined();

			env.isResizeObserverSupported = false;
		});
	});

	describe('Integration scenarios', () => {
		it('should handle complete drawing flow', async () => {
			drawing = new Drawing(mockEditor, {});

			const mockCanvas = createMockCanvas();
			mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
			mockCanvas.getContext = jest.fn().mockReturnValue({
				lineWidth: 5,
				lineCap: 'round',
				strokeStyle: '#000000',
				clearRect: jest.fn(),
				beginPath: jest.fn(),
				stroke: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn()
			});
			mockCanvas.offsetWidth = 600;
			mockCanvas.offsetHeight = 400;
			mockCanvas.width = 600;
			mockCanvas.height = 400;
			mockCanvas.getBoundingClientRect = jest.fn().mockReturnValue({
				left: 0,
				top: 0,
				width: 600,
				height: 400
			});

			drawing.modal.form.querySelector = jest.fn().mockReturnValue(mockCanvas);

			// Open drawing
			drawing.open();
			expect(drawing.modal.open).toHaveBeenCalled();
			expect(drawing.canvas).toBe(mockCanvas);

			// Draw some strokes
			const mousedownHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown'
			)[2];
			const mousemoveHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousemove'
			)[2];
			const mouseupHandler = drawing.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mouseup'
			)[2];

			mousedownHandler({ preventDefault: jest.fn(), offsetX: 10, offsetY: 10 });
			mousemoveHandler({ preventDefault: jest.fn(), offsetX: 20, offsetY: 20 });
			mousemoveHandler({ preventDefault: jest.fn(), offsetX: 30, offsetY: 30 });
			mouseupHandler();

			expect(drawing.paths.length).toBe(1);

			// Submit
			const result = await drawing.modalAction();
			expect(result).toBe(true);
			expect(mockEditor.plugins.image.create).toHaveBeenCalled();

			// Close
			drawing.modalOff();
			expect(drawing.canvas).toBeNull();
		});
	});
});
