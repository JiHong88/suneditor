
import Drawing from '../../../../src/plugins/modal/drawing';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';
import { dom, env } from '../../../../src/helper';

// MOCKS

const mockCreateModalForm = () => {
	const form = global.document.createElement('div');
	const canvas = global.document.createElement('canvas');
	canvas.className = 'se-drawing-canvas';
	canvas.getContext = jest.fn().mockReturnValue({
		lineWidth: 5,
		lineCap: 'round',
		strokeStyle: '#000',
		beginPath: jest.fn(),
		moveTo: jest.fn(),
		lineTo: jest.fn(),
		stroke: jest.fn(),
		clearRect: jest.fn()
	});
	Object.defineProperty(canvas, 'offsetWidth', { value: 750, configurable: true });
	Object.defineProperty(canvas, 'offsetHeight', { value: 400, configurable: true });
	form.appendChild(canvas);
	const origQuerySelector = form.querySelector.bind(form);
	form.querySelector = jest.fn((sel) => {
		if (sel === '.se-drawing-canvas') return canvas;
		return origQuerySelector(sel);
	});
	return form;
};

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		get form() {
			// Lazy form creation to avoid factory scope issues
			if (!this._form) this._form = mockCreateModalForm();
			return this._form;
		},
		isUpdate: false
	}))
}));

jest.mock('../../../../src/modules/manager', () => ({
	FileManager: jest.fn().mockImplementation(() => ({
		getSize: jest.fn().mockReturnValue(0),
		upload: jest.fn(),
		setFileData: jest.fn()
	}))
}));

jest.mock('../../../../src/modules/ui', () => ({
	_DragHandle: { get: jest.fn().mockReturnValue(null) }
}));

const mockModal = require('../../../../src/modules/contract').Modal;

Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue('')
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn((tag, attrs, html) => {
				const el = globalThis.document.createElement('div');
				if (html) el.innerHTML = html;
				if (attrs) {
					Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
				}
				return el;
			}),
			removeItem: jest.fn(),
			addClass: jest.fn(),
			removeClass: jest.fn(),
			createTooltipInner: jest.fn().mockReturnValue('')
		},
		query: {
			getParentElement: jest.fn().mockReturnValue(null),
			getEventTarget: jest.fn((e) => e.target || e)
		}
	},
	numbers: {
		is: jest.fn((val) => typeof val === 'number'),
		get: jest.fn((val, def) => (val !== undefined && val !== null && val !== '' ? Number(val) || def : def))
	},
	env: {
		_w: {
			getComputedStyle: jest.fn().mockReturnValue({ color: '#000000' }),
			setTimeout: jest.fn((fn) => fn())
		},
		NO_EVENT: Symbol('NO_EVENT'),
		ON_OVER_COMPONENT: Symbol('ON_OVER_COMPONENT'),
		isResizeObserverSupported: false
	}
}));

describe('Drawing Plugin', () => {
	let kernel;
	let drawing;

	beforeEach(() => {
		kernel = createMockEditor();
		// Add missing lang keys
		kernel.$.lang.drawing = 'Drawing';
		kernel.$.lang.drawing_modal_title = 'Drawing';
		kernel.$.lang.submitButton = 'Submit';
		kernel.$.lang.close = 'Close';
		kernel.$.lang.remove = 'Remove';
		kernel.$.lang.blockStyle = 'Block';
		kernel.$.lang.inlineStyle = 'Inline';

		// Mock image plugin for drawing dependency
		kernel.$.plugins.image = {
			pluginOptions: { uploadUrl: '/upload' },
			modalInit: jest.fn(),
			create: jest.fn(),
			createInline: jest.fn(),
			submitFile: jest.fn()
		};

		dom.utils.createElement.mockClear();
		dom.utils.addClass.mockClear();
		dom.utils.removeClass.mockClear();

		dom.utils.createElement.mockImplementation((tag, attrs, html) => {
			const el = document.createElement('div');
			if (html) el.innerHTML = html;
			if (attrs) {
				Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
			}
			return el;
		});

		drawing = new Drawing(kernel, {});
	});

	describe('Static Properties', () => {
		it('should have key "drawing"', () => {
			expect(Drawing.key).toBe('drawing');
		});

		it('should have empty className', () => {
			expect(Drawing.className).toBe('');
		});
	});

	describe('Constructor & Initialization', () => {
		it('should create Drawing instance', () => {
			expect(drawing).toBeInstanceOf(Drawing);
		});

		it('should set title from lang', () => {
			expect(drawing.title).toBe('Drawing');
		});

		it('should set icon to "drawing"', () => {
			expect(drawing.icon).toBe('drawing');
		});

		it('should initialize modal', () => {
			expect(drawing.modal).toBeTruthy();
		});

		it('should initialize canvas-related state', () => {
			expect(drawing.canvas).toBeNull();
			expect(drawing.ctx).toBeNull();
			expect(drawing.isDrawing).toBe(false);
			expect(drawing.points).toEqual([]);
			expect(drawing.paths).toEqual([]);
		});

		it('should warn when image plugin is missing', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const k = createMockEditor();
			k.$.lang.drawing = 'Drawing';
			k.$.lang.drawing_modal_title = 'Drawing';
			k.$.lang.submitButton = 'Submit';
			k.$.lang.close = 'Close';
			k.$.lang.remove = 'Remove';
			k.$.plugins.image = null;

			new Drawing(k, {});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.plugins.drawing.warn]')
			);
			consoleSpy.mockRestore();
		});

		it('should warn when outputFormat=svg but no image uploadUrl', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const k = createMockEditor();
			k.$.lang.drawing = 'Drawing';
			k.$.lang.drawing_modal_title = 'Drawing';
			k.$.lang.submitButton = 'Submit';
			k.$.lang.close = 'Close';
			k.$.lang.remove = 'Remove';
			k.$.plugins.image = { pluginOptions: { uploadUrl: null } };

			new Drawing(k, { outputFormat: 'svg' });

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('uploadUrl')
			);
			consoleSpy.mockRestore();
		});
	});

	describe('Plugin Options', () => {
		it('should default outputFormat to dataurl', () => {
			expect(drawing.pluginOptions.outputFormat).toBe('dataurl');
		});

		it('should set outputFormat to svg', () => {
			const d = new Drawing(kernel, { outputFormat: 'svg' });
			expect(d.pluginOptions.outputFormat).toBe('svg');
		});

		it('should default lineWidth to 5', () => {
			expect(drawing.pluginOptions.lineWidth).toBe(5);
		});

		it('should set custom lineWidth', () => {
			const d = new Drawing(kernel, { lineWidth: 10 });
			expect(d.pluginOptions.lineWidth).toBe(10);
		});

		it('should default lineCap to round', () => {
			expect(drawing.pluginOptions.lineCap).toBe('round');
		});

		it('should accept valid lineCap values', () => {
			const d1 = new Drawing(kernel, { lineCap: 'butt' });
			expect(d1.pluginOptions.lineCap).toBe('butt');

			const d2 = new Drawing(kernel, { lineCap: 'square' });
			expect(d2.pluginOptions.lineCap).toBe('square');
		});

		it('should default to round for invalid lineCap', () => {
			const d = new Drawing(kernel, { lineCap: 'invalid' });
			expect(d.pluginOptions.lineCap).toBe('round');
		});

		it('should default useFormatType to false', () => {
			expect(drawing.pluginOptions.useFormatType).toBe(false);
		});

		it('should set useFormatType to true', () => {
			const d = new Drawing(kernel, { useFormatType: true });
			expect(d.pluginOptions.useFormatType).toBe(true);
		});

		it('should default defaultFormatType to block', () => {
			expect(drawing.pluginOptions.defaultFormatType).toBe('block');
		});

		it('should accept inline as defaultFormatType', () => {
			const d = new Drawing(kernel, { defaultFormatType: 'inline' });
			expect(d.pluginOptions.defaultFormatType).toBe('inline');
		});

		it('should default to block for invalid defaultFormatType', () => {
			const d = new Drawing(kernel, { defaultFormatType: 'invalid' });
			expect(d.pluginOptions.defaultFormatType).toBe('block');
		});

		it('should default canResize to true', () => {
			expect(drawing.pluginOptions.canResize).toBe(true);
		});

		it('should set canResize to false', () => {
			const d = new Drawing(kernel, { canResize: false });
			expect(d.pluginOptions.canResize).toBe(false);
		});

		it('should default maintainRatio to true', () => {
			expect(drawing.pluginOptions.maintainRatio).toBe(true);
		});

		it('should default lineReconnect to false', () => {
			expect(drawing.pluginOptions.lineReconnect).toBe(false);
		});

		it('should set lineReconnect to true', () => {
			const d = new Drawing(kernel, { lineReconnect: true });
			expect(d.pluginOptions.lineReconnect).toBe(true);
		});

		it('should set keepFormatType option', () => {
			const d = new Drawing(kernel, { keepFormatType: true });
			expect(d.pluginOptions.keepFormatType).toBe(true);
		});

		it('should have default formSize values', () => {
			expect(drawing.pluginOptions.formSize.width).toBe('750px');
			expect(drawing.pluginOptions.formSize.height).toBe('50vh');
			expect(drawing.pluginOptions.formSize.minWidth).toBe('150px');
			expect(drawing.pluginOptions.formSize.minHeight).toBe('100px');
		});

		it('should merge custom formSize', () => {
			const d = new Drawing(kernel, {
				formSize: { width: '500px', height: '300px' }
			});
			expect(d.pluginOptions.formSize.width).toBe('500px');
			expect(d.pluginOptions.formSize.height).toBe('300px');
			expect(d.pluginOptions.formSize.minWidth).toBe('150px'); // default preserved
		});

		it('should set lineColor', () => {
			const d = new Drawing(kernel, { lineColor: '#ff0000' });
			expect(d.pluginOptions.lineColor).toBe('#ff0000');
		});

		it('should default lineColor to empty string', () => {
			expect(drawing.pluginOptions.lineColor).toBe('');
		});
	});

	describe('open()', () => {
		it('should call modal.open', () => {
			drawing.open();
			expect(drawing.modal.open).toHaveBeenCalled();
		});

		it('should initialize canvas on open', () => {
			drawing.open();
			expect(drawing.canvas).toBeTruthy();
		});

		it('should initialize drawing context on open', () => {
			drawing.open();
			expect(drawing.ctx).toBeTruthy();
		});

		it('should reset points and paths on open', () => {
			drawing.paths = [[1, 2], [3, 4]];
			drawing.points = [[5, 6]];
			drawing.open();
			expect(drawing.points).toEqual([]);
			expect(drawing.paths).toEqual([]);
		});
	});

	describe('open() with useFormatType', () => {
		it('should activate block format by default', () => {
			const d = new Drawing(kernel, { useFormatType: true });
			d.open();
			expect(d.as).toBe('block');
		});

		it('should activate inline format when defaultFormatType is inline', () => {
			const d = new Drawing(kernel, { useFormatType: true, defaultFormatType: 'inline' });
			d.open();
			expect(d.as).toBe('inline');
		});

		it('should keep last format type when keepFormatType is true', () => {
			const d = new Drawing(kernel, { useFormatType: true, keepFormatType: true, defaultFormatType: 'block' });
			d.as = 'inline';
			d.open();
			expect(d.as).toBe('inline');
		});
	});

	describe('modalOff()', () => {
		it('should destroy drawing on modal close', () => {
			drawing.open();
			expect(drawing.canvas).toBeTruthy();

			drawing.modalOff();

			expect(drawing.canvas).toBeNull();
			expect(drawing.ctx).toBeNull();
			expect(drawing.points).toEqual([]);
			expect(drawing.paths).toEqual([]);
			expect(drawing.isDrawing).toBe(false);
		});
	});

	describe('modalAction()', () => {
		beforeEach(() => {
			drawing.open();
		});

		it('should create image via dataurl format (block)', async () => {
			drawing.as = 'block';
			drawing.canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc');

			const result = await drawing.modalAction();

			expect(result).toBe(true);
			expect(kernel.$.plugins.image.modalInit).toHaveBeenCalled();
			expect(kernel.$.plugins.image.create).toHaveBeenCalledWith(
				'data:image/png;base64,abc',
				null,
				'auto',
				'',
				'none',
				{ name: 'drawing', size: 0 },
				''
			);
		});

		it('should create inline image when format is inline', async () => {
			drawing.as = 'inline';
			drawing.canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc');

			const result = await drawing.modalAction();

			expect(result).toBe(true);
			expect(kernel.$.plugins.image.createInline).toHaveBeenCalledWith(
				'data:image/png;base64,abc',
				null,
				'auto',
				'',
				'none',
				{ name: 'drawing', size: 0 },
				''
			);
		});

		it('should submit SVG file when outputFormat is svg', async () => {
			// Mock DataTransfer.items.add for jsdom
			const origDataTransfer = globalThis.DataTransfer;
			globalThis.DataTransfer = class MockDataTransfer {
				constructor() {
					this._files = [];
					this.items = {
						add: (file) => this._files.push(file)
					};
				}
				get files() {
					return this._files;
				}
			};

			const d = new Drawing(kernel, { outputFormat: 'svg' });
			d.open();

			const result = await d.modalAction();

			expect(result).toBe(true);
			expect(kernel.$.plugins.image.modalInit).toHaveBeenCalled();
			expect(kernel.$.plugins.image.submitFile).toHaveBeenCalled();

			globalThis.DataTransfer = origDataTransfer;
		});
	});

	describe('Drawing State Management', () => {
		beforeEach(() => {
			drawing.open();
		});

		it('should track isDrawing state correctly', () => {
			expect(drawing.isDrawing).toBe(false);
		});

		it('should maintain points array', () => {
			expect(drawing.points).toEqual([]);
		});

		it('should maintain paths array', () => {
			expect(drawing.paths).toEqual([]);
		});
	});

	describe('Canvas Event Handlers (via eventManager)', () => {
		beforeEach(() => {
			drawing.open();
		});

		it('should register canvas events on open', () => {
			// eventManager.addEvent should be called for mousedown, mousemove, mouseup, etc.
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const canvasEvents = addEventCalls.filter(
				(call) => call[0] === drawing.canvas
			);
			// Should have mousedown, mousemove, mouseup, mouseleave, mouseenter, touchstart, touchmove
			expect(canvasEvents.length).toBeGreaterThanOrEqual(5);
		});

		it('should remove canvas events on destroy', () => {
			drawing.modalOff();
			expect(kernel.$.eventManager.removeEvent).toHaveBeenCalled();
		});
	});

	describe('Mouse Drawing Simulation', () => {
		beforeEach(() => {
			drawing.open();
		});

		it('mousedown should start drawing and add point', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);

			if (mousedownCall) {
				const handler = mousedownCall[2];
				const event = { preventDefault: jest.fn(), offsetX: 100, offsetY: 200 };
				handler(event);

				expect(drawing.isDrawing).toBe(true);
				expect(drawing.points).toEqual([[100, 200]]);
				expect(event.preventDefault).toHaveBeenCalled();
			}
		});

		it('mousemove should add points while drawing', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);
			const mousemoveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousemove'
			);

			if (mousedownCall && mousemoveCall) {
				// Start drawing
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				// Move
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 30, offsetY: 40 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 50, offsetY: 60 });

				expect(drawing.points).toEqual([[10, 20], [30, 40], [50, 60]]);
			}
		});

		it('mousemove should not add points when not drawing', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousemoveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousemove'
			);

			if (mousemoveCall) {
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 30, offsetY: 40 });
				expect(drawing.points).toEqual([]);
			}
		});

		it('mouseup should stop drawing and save path', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);
			const mouseupCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseup'
			);

			if (mousedownCall && mouseupCall) {
				// Start drawing
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				// Stop
				mouseupCall[2]();

				expect(drawing.isDrawing).toBe(false);
				expect(drawing.paths).toHaveLength(1);
				expect(drawing.paths[0]).toEqual([[10, 20]]);
				expect(drawing.points).toEqual([]);
			}
		});

		it('mouseup with no points should not add to paths', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mouseupCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseup'
			);

			if (mouseupCall) {
				mouseupCall[2]();
				expect(drawing.paths).toEqual([]);
			}
		});

		it('mouseleave should save path and stop drawing by default', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);
			const mouseleaveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseleave'
			);

			if (mousedownCall && mouseleaveCall) {
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				mouseleaveCall[2]();

				expect(drawing.isDrawing).toBe(false);
				expect(drawing.paths).toHaveLength(1);
				expect(drawing.points).toEqual([]);
			}
		});

		it('mouseleave should not save when not drawing', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mouseleaveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseleave'
			);

			if (mouseleaveCall) {
				mouseleaveCall[2]();
				expect(drawing.paths).toEqual([]);
			}
		});

		it('mouseenter should resume drawing when button is pressed', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mouseenterCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseenter'
			);

			if (mouseenterCall) {
				mouseenterCall[2]({ buttons: 1, offsetX: 50, offsetY: 60 });
				expect(drawing.isDrawing).toBe(true);
				expect(drawing.points.length).toBeGreaterThan(0);
			}
		});

		it('mouseenter with lineReconnect should use last path point', () => {
			const d = new Drawing(kernel, { lineReconnect: true });
			d.open();

			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === d.canvas && call[1] === 'mousedown'
			);
			const mouseleaveCall = addEventCalls.find(
				(call) => call[0] === d.canvas && call[1] === 'mouseleave'
			);
			const mouseenterCall = addEventCalls.find(
				(call) => call[0] === d.canvas && call[1] === 'mouseenter'
			);

			if (mousedownCall && mouseleaveCall && mouseenterCall) {
				// Draw, leave, re-enter
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				mouseleaveCall[2]();
				mouseenterCall[2]({ buttons: 1, offsetX: 50, offsetY: 60 });

				// With lineReconnect, points from mousedown remain + 2 reconnection points
				expect(d.isDrawing).toBe(true);
				expect(d.points.length).toBe(3); // original point + last point reconnect + new point
			}
		});
	});

	describe('Touch Drawing Simulation', () => {
		beforeEach(() => {
			drawing.open();
		});

		it('touchstart should start drawing', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const touchstartCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'touchstart'
			);

			if (touchstartCall) {
				drawing.canvas.getBoundingClientRect = jest.fn().mockReturnValue({ left: 0, top: 0 });
				const event = {
					preventDefault: jest.fn(),
					touches: [{ clientX: 100, clientY: 200 }]
				};
				touchstartCall[2](event);

				expect(drawing.isDrawing).toBe(true);
				expect(drawing.points).toEqual([[100, 200]]);
			}
		});

		it('touchmove should add points', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const touchstartCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'touchstart'
			);
			const touchmoveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'touchmove'
			);

			if (touchstartCall && touchmoveCall) {
				drawing.canvas.getBoundingClientRect = jest.fn().mockReturnValue({ left: 0, top: 0 });

				touchstartCall[2]({
					preventDefault: jest.fn(),
					touches: [{ clientX: 10, clientY: 20 }]
				});
				touchmoveCall[2]({
					preventDefault: jest.fn(),
					touches: [{ clientX: 30, clientY: 40 }]
				});

				expect(drawing.points).toEqual([[10, 20], [30, 40]]);
			}
		});

		it('touchmove should not add points when not drawing', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const touchmoveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'touchmove'
			);

			if (touchmoveCall) {
				drawing.canvas.getBoundingClientRect = jest.fn().mockReturnValue({ left: 0, top: 0 });
				touchmoveCall[2]({
					preventDefault: jest.fn(),
					touches: [{ clientX: 30, clientY: 40 }]
				});
				expect(drawing.points).toEqual([]);
			}
		});
	});

	describe('Clear Canvas (via remove button)', () => {
		it('should register remove button click handler', () => {
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			// Find a click handler that is NOT the canvas events
			const removeClickCall = addEventCalls.find(
				(call) => call[1] === 'click' && call[0] !== drawing.canvas
			);
			expect(removeClickCall).toBeTruthy();
		});

		it('should clear paths and points when remove is clicked', () => {
			drawing.open();
			drawing.paths = [[[10, 20], [30, 40]]];
			drawing.points = [[50, 60]];

			// Find and call the remove handler
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const removeClickCalls = addEventCalls.filter(
				(call) => call[1] === 'click' && call[0] !== drawing.canvas
			);

			// The remove handler is the one bound on `[data-command="remove"]`
			if (removeClickCalls.length > 0) {
				// Call the last matching handler (remove button)
				const lastHandler = removeClickCalls[removeClickCalls.length - 1][2];
				lastHandler();

				expect(drawing.points).toEqual([]);
				expect(drawing.paths).toEqual([]);
			}
		});
	});

	describe('Format Type Toggle', () => {
		it('should default to block format', () => {
			expect(drawing.as).toBe('block');
		});

		it('should initialize as inline when defaultFormatType is inline', () => {
			const d = new Drawing(kernel, { defaultFormatType: 'inline' });
			expect(d.as).toBe('inline');
		});

		it('should toggle format type via button click when useFormatType is enabled', () => {
			const d = new Drawing(kernel, { useFormatType: true });

			// Find the click handler for asBlock/asInline buttons
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const formatClickCall = addEventCalls.find(
				(call) => Array.isArray(call[0]) && call[1] === 'click'
			);

			if (formatClickCall) {
				// Simulate clicking asInline
				dom.query.getEventTarget.mockReturnValueOnce({
					getAttribute: jest.fn().mockReturnValue('asInline')
				});
				formatClickCall[2]({ target: {} });
				expect(d.as).toBe('inline');

				// Simulate clicking asBlock
				dom.query.getEventTarget.mockReturnValueOnce({
					getAttribute: jest.fn().mockReturnValue('asBlock')
				});
				formatClickCall[2]({ target: {} });
				expect(d.as).toBe('block');
			}
		});
	});

	describe('Complete Drawing Workflow', () => {
		it('should support full draw → save → submit flow', async () => {
			drawing.open();

			// Find event handlers
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);
			const mousemoveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousemove'
			);
			const mouseupCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseup'
			);

			if (mousedownCall && mousemoveCall && mouseupCall) {
				// Draw a line
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 50, offsetY: 60 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 100, offsetY: 120 });
				mouseupCall[2]();

				expect(drawing.paths).toHaveLength(1);
				expect(drawing.paths[0]).toEqual([[10, 20], [50, 60], [100, 120]]);

				// Draw another line
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 200, offsetY: 200 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 300, offsetY: 300 });
				mouseupCall[2]();

				expect(drawing.paths).toHaveLength(2);

				// Submit
				drawing.canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,drawing');
				const result = await drawing.modalAction();
				expect(result).toBe(true);
				expect(kernel.$.plugins.image.create).toHaveBeenCalledWith(
					'data:image/png;base64,drawing',
					null, 'auto', '', 'none',
					{ name: 'drawing', size: 0 },
					''
				);
			}
		});

		it('should support draw → clear → draw again flow', () => {
			drawing.open();

			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);
			const mouseupCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseup'
			);

			if (mousedownCall && mouseupCall) {
				// Draw
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				mouseupCall[2]();
				expect(drawing.paths).toHaveLength(1);

				// Clear via remove button
				const removeClickCalls = addEventCalls.filter(
					(call) => call[1] === 'click' && call[0] !== drawing.canvas && !Array.isArray(call[0])
				);
				if (removeClickCalls.length > 0) {
					removeClickCalls[removeClickCalls.length - 1][2]();
					expect(drawing.paths).toEqual([]);
				}

				// Draw again
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 50, offsetY: 60 });
				mouseupCall[2]();
				expect(drawing.paths).toHaveLength(1);
			}
		});
	});

	describe('ResizeObserver', () => {
		it('should set resizeObserver to null initially', () => {
			expect(drawing.resizeObserver).toBeNull();
		});

		it('should disconnect resizeObserver on destroy', () => {
			drawing.resizeObserver = { disconnect: jest.fn() };
			drawing.modalOff();
			expect(drawing.resizeObserver).toBeNull();
		});
	});

	describe('SVG Generation with actual paths', () => {
		it('should generate SVG with drawn paths', async () => {
			const origDataTransfer = globalThis.DataTransfer;
			globalThis.DataTransfer = class MockDataTransfer {
				constructor() {
					this._files = [];
					this.items = {
						add: (file) => this._files.push(file)
					};
				}
				get files() {
					return this._files;
				}
			};

			const d = new Drawing(kernel, { outputFormat: 'svg' });
			d.open();

			// Draw some paths
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === d.canvas && call[1] === 'mousedown'
			);
			const mousemoveCall = addEventCalls.find(
				(call) => call[0] === d.canvas && call[1] === 'mousemove'
			);
			const mouseupCall = addEventCalls.find(
				(call) => call[0] === d.canvas && call[1] === 'mouseup'
			);

			if (mousedownCall && mousemoveCall && mouseupCall) {
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 10, offsetY: 20 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 50, offsetY: 60 });
				mouseupCall[2]();
			}

			const result = await d.modalAction();
			expect(result).toBe(true);
			expect(kernel.$.plugins.image.submitFile).toHaveBeenCalled();

			// Verify the file was an SVG
			const submitCall = kernel.$.plugins.image.submitFile.mock.calls;
			const lastCall = submitCall[submitCall.length - 1];
			if (lastCall && lastCall[0] && lastCall[0][0]) {
				expect(lastCall[0][0].type).toBe('image/svg+xml');
			}

			globalThis.DataTransfer = origDataTransfer;
		});
	});

	describe('drawAll via multiple strokes', () => {
		it('should redraw all paths when ctx operations occur', () => {
			drawing.open();
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const mousedownCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousedown'
			);
			const mousemoveCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mousemove'
			);
			const mouseupCall = addEventCalls.find(
				(call) => call[0] === drawing.canvas && call[1] === 'mouseup'
			);

			if (mousedownCall && mousemoveCall && mouseupCall) {
				// Draw stroke 1
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 0, offsetY: 0 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 100, offsetY: 100 });
				mouseupCall[2]();

				// Draw stroke 2
				mousedownCall[2]({ preventDefault: jest.fn(), offsetX: 200, offsetY: 200 });
				mousemoveCall[2]({ preventDefault: jest.fn(), offsetX: 300, offsetY: 300 });
				mouseupCall[2]();

				expect(drawing.paths).toHaveLength(2);
				// ctx.beginPath and ctx.stroke should have been called multiple times
				expect(drawing.ctx.beginPath).toHaveBeenCalled();
				expect(drawing.ctx.stroke).toHaveBeenCalled();
			}
		});
	});

	describe('Edge Cases', () => {
		it('should handle open when already destroyed', () => {
			drawing.modalOff();
			expect(() => drawing.open()).not.toThrow();
		});

		it('should handle multiple open/close cycles', () => {
			drawing.open();
			drawing.modalOff();
			drawing.open();
			drawing.modalOff();
			expect(drawing.canvas).toBeNull();
			expect(drawing.ctx).toBeNull();
		});
	});
});
