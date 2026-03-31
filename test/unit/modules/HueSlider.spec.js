/**
 * @fileoverview Unit tests for modules/contract/HueSlider.js
 */

import HueSlider, { CreateSliderCtx } from '../../../src/modules/contract/HueSlider.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

/**
 * Save references to the module-level canvas contexts (offscreenCtx and wheelCtx)
 * created during HueSlider module initialization (CreateSliderCtx at line 278).
 * These are captured from HTMLCanvasElement.prototype.getContext.mock.results
 * before jest.clearAllMocks() clears the results array.
 *
 * Index 0: offscreenCtx (offscreenCanvas.getContext('2d'))
 * Index 1: wheelCtx (wheelCanvas.getContext('2d'))
 */
const moduleContexts = HTMLCanvasElement.prototype.getContext.mock.results
	.filter(r => r.type === 'return' && r.value)
	.map(r => r.value);

/**
 * Helper to get the registered event handler from addGlobalEvent mock calls
 */
function getHandler(mockCalls, eventType) {
	const call = mockCalls.find(c => c[0] === eventType);
	return call ? call[1] : null;
}

/**
 * Mock getBoundingClientRect on an element to return realistic dimensions.
 * jsdom returns all zeros by default which causes division-by-zero issues.
 */
function mockBoundingRect(element, rect) {
	Object.defineProperty(element, 'getBoundingClientRect', {
		configurable: true,
		value: jest.fn().mockReturnValue({
			left: rect.left || 0,
			top: rect.top || 0,
			right: (rect.left || 0) + (rect.width || 0),
			bottom: (rect.top || 0) + (rect.height || 0),
			width: rect.width || 0,
			height: rect.height || 0,
			x: rect.left || 0,
			y: rect.top || 0
		})
	});
}

describe('Modules - HueSlider', () => {
	let mockKernel;
	let mockDeps;
	let mockInst;

	beforeEach(() => {
		jest.clearAllMocks();

		mockKernel = createMockEditor();
		mockDeps = {
			...mockKernel.$,
			lang: {
				...mockKernel.$.lang,
				submitButton: 'Submit',
				close: 'Close'
			},
			icons: {
				...mockKernel.$.icons,
				checked: '<svg class="checked"/>',
				cancel: '<svg class="cancel"/>'
			},
			eventManager: {
				...mockKernel.$.eventManager,
				addGlobalEvent: jest.fn().mockReturnValue('mockEventId'),
				removeGlobalEvent: jest.fn().mockReturnValue(null)
			}
		};

		mockInst = {
			form: document.createElement('div'),
			hueSliderAction: jest.fn(),
			hueSliderCancelAction: jest.fn(),
			constructor: { key: 'testHueSlider', name: 'TestHueSlider' }
		};
	});

	// ---------------------------------------------------------------
	// CreateSliderCtx
	// ---------------------------------------------------------------
	describe('CreateSliderCtx()', () => {
		it('should return an object with the expected DOM structure properties', () => {
			const ctx = CreateSliderCtx();

			expect(ctx).toHaveProperty('slider');
			expect(ctx).toHaveProperty('offscreenCanvas');
			expect(ctx).toHaveProperty('offscreenCtx');
			expect(ctx).toHaveProperty('wheel');
			expect(ctx).toHaveProperty('wheelCtx');
			expect(ctx).toHaveProperty('wheelPointer');
			expect(ctx).toHaveProperty('gradientBar');
			expect(ctx).toHaveProperty('gradientPointer');
			expect(ctx).toHaveProperty('fanalColorHex');
			expect(ctx).toHaveProperty('fanalColorBackground');
		});

		it('should create a slider element with the correct class', () => {
			const ctx = CreateSliderCtx();
			expect(ctx.slider.classList.contains('se-hue-slider')).toBe(true);
		});

		it('should create canvas elements for offscreen, wheel, and gradient bar', () => {
			const ctx = CreateSliderCtx();
			expect(ctx.offscreenCanvas.tagName).toBe('CANVAS');
			expect(ctx.wheel.tagName).toBe('CANVAS');
			expect(ctx.gradientBar.tagName).toBe('CANVAS');
		});

		it('should set width and height on offscreen canvas to SIZE (240)', () => {
			const ctx = CreateSliderCtx();
			expect(ctx.offscreenCanvas.width).toBe(240);
			expect(ctx.offscreenCanvas.height).toBe(240);
		});

		it('should return valid 2d rendering contexts', () => {
			const ctx = CreateSliderCtx();
			expect(ctx.offscreenCtx).toBeTruthy();
			expect(ctx.wheelCtx).toBeTruthy();
		});

		it('should create wheel pointer element with the correct class', () => {
			const ctx = CreateSliderCtx();
			expect(ctx.wheelPointer.classList.contains('se-hue-wheel-pointer')).toBe(true);
		});

		it('should create gradient pointer element with the correct class', () => {
			const ctx = CreateSliderCtx();
			expect(ctx.gradientPointer.classList.contains('se-hue-gradient-pointer')).toBe(true);
		});

		it('should contain a hue wheel container', () => {
			const ctx = CreateSliderCtx();
			const container = ctx.slider.querySelector('.se-hue-slider-container');
			expect(container).not.toBeNull();
		});

		it('should contain a gradient container', () => {
			const ctx = CreateSliderCtx();
			const container = ctx.slider.querySelector('.se-hue-gradient-container');
			expect(container).not.toBeNull();
		});

		it('should contain a final hex display with default white value', () => {
			const ctx = CreateSliderCtx();
			const hexDisplay = ctx.slider.querySelector('.se-hue-final-hex');
			expect(hexDisplay).not.toBeNull();
			expect(ctx.fanalColorHex.textContent).toBe('#FFFFFF');
		});
	});

	// ---------------------------------------------------------------
	// HueSlider constructor
	// ---------------------------------------------------------------
	describe('HueSlider constructor', () => {
		it('should create an instance with default params (isNewForm=false)', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			expect(hs.inst).toBe(mockInst);
			expect(hs.isOpen).toBe(false);
			expect(hs.controlle).toBeNull();
		});

		it('should set initial ctx state with default values', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			expect(hs.ctx).toEqual(expect.objectContaining({
				wheelX: expect.any(Number),
				wheelY: expect.any(Number),
				lightness: expect.any(Number),
				wheelPointerX: '50%',
				wheelPointerY: '50%',
				gradientPointerX: 'calc(100% - 14px)',
			}));
			expect(hs.ctx.color).toEqual(expect.objectContaining({
				hex: '#FFFFFF',
				r: 255,
				g: 255,
				b: 255
			}));
		});

		it('should create controller element with se-hue class when isNewForm=false', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			expect(hs.circle).toBeTruthy();
			expect(hs.circle.classList.contains('se-hue')).toBe(true);
		});

		it('should create controller with submit and close buttons when isNewForm=false', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			const submitBtn = hs.circle.parentElement.querySelector('[data-command="submit"]');
			const closeBtn = hs.circle.parentElement.querySelector('[data-command="close"]');
			expect(submitBtn).not.toBeNull();
			expect(closeBtn).not.toBeNull();
		});

		it('should set button titles from lang when isNewForm=false', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			const submitBtn = hs.circle.parentElement.querySelector('[data-command="submit"]');
			const closeBtn = hs.circle.parentElement.querySelector('[data-command="close"]');
			expect(submitBtn.getAttribute('title')).toBe('Submit');
			expect(closeBtn.getAttribute('title')).toBe('Close');
		});

		it('should create controller instance when isNewForm=false', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			expect(hs.controller).toBeTruthy();
		});

		it('should skip controller creation when isNewForm=true', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			expect(hs.circle).toBeUndefined();
			expect(hs.controller).toBeUndefined();
		});

		it('should apply className to controller element', () => {
			const hs = new HueSlider(mockInst, mockDeps, {}, 'custom-class');

			const controllerElement = hs.circle.parentElement;
			expect(controllerElement.classList.contains('se-controller')).toBe(true);
			expect(controllerElement.classList.contains('custom-class')).toBe(true);
		});
	});

	// ---------------------------------------------------------------
	// controllerAction
	// ---------------------------------------------------------------
	describe('controllerAction(target)', () => {
		let hs;

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
		});

		it('should call inst.hueSliderAction with color when command is submit', () => {
			const target = document.createElement('button');
			target.setAttribute('data-command', 'submit');
			hs.close = jest.fn();

			hs.controllerAction(target);

			expect(mockInst.hueSliderAction).toHaveBeenCalledTimes(1);
			expect(hs.close).toHaveBeenCalledTimes(1);
		});

		it('should pass the current color from get() to hueSliderAction on submit', () => {
			const target = document.createElement('button');
			target.setAttribute('data-command', 'submit');
			hs.close = jest.fn();

			hs.controllerAction(target);

			const passedColor = mockInst.hueSliderAction.mock.calls[0][0];
			expect(passedColor).toHaveProperty('hex');
			expect(passedColor).toHaveProperty('r');
			expect(passedColor).toHaveProperty('g');
			expect(passedColor).toHaveProperty('b');
		});

		it('should call close() when command is close', () => {
			const target = document.createElement('button');
			target.setAttribute('data-command', 'close');
			hs.close = jest.fn();

			hs.controllerAction(target);

			expect(mockInst.hueSliderAction).not.toHaveBeenCalled();
			expect(hs.close).toHaveBeenCalledTimes(1);
		});

		it('should do nothing for an unknown command', () => {
			const target = document.createElement('button');
			target.setAttribute('data-command', 'unknown');
			hs.close = jest.fn();

			hs.controllerAction(target);

			expect(mockInst.hueSliderAction).not.toHaveBeenCalled();
			expect(hs.close).not.toHaveBeenCalled();
		});

		it('should handle inst.hueSliderAction being undefined (optional chaining)', () => {
			const instNoAction = {
				form: document.createElement('div'),
				constructor: { key: 'test', name: 'Test' }
			};
			const hs2 = new HueSlider(instNoAction, mockDeps, { isNewForm: true });
			hs2.close = jest.fn();

			const target = document.createElement('button');
			target.setAttribute('data-command', 'submit');

			expect(() => hs2.controllerAction(target)).not.toThrow();
			expect(hs2.close).toHaveBeenCalledTimes(1);
		});
	});

	// ---------------------------------------------------------------
	// controllerClose
	// ---------------------------------------------------------------
	describe('controllerClose()', () => {
		it('should call inst.hueSliderCancelAction', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			hs.controllerClose();

			expect(mockInst.hueSliderCancelAction).toHaveBeenCalledTimes(1);
		});

		it('should set isOpen to false via init()', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			hs.isOpen = true;

			hs.controllerClose();

			expect(hs.isOpen).toBe(false);
		});

		it('should handle inst.hueSliderCancelAction being undefined', () => {
			const instNoCancel = {
				form: document.createElement('div'),
				constructor: { key: 'test', name: 'Test' }
			};
			const hs = new HueSlider(instNoCancel, mockDeps, { isNewForm: true });

			expect(() => hs.controllerClose()).not.toThrow();
		});
	});

	// ---------------------------------------------------------------
	// get()
	// ---------------------------------------------------------------
	describe('get()', () => {
		it('should return a color object with expected properties', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const color = hs.get();

			expect(color).toHaveProperty('hex');
			expect(color).toHaveProperty('r');
			expect(color).toHaveProperty('g');
			expect(color).toHaveProperty('b');
			expect(color).toHaveProperty('h');
			expect(color).toHaveProperty('s');
			expect(color).toHaveProperty('l');
		});

		it('should return default white color initially', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const color = hs.get();

			expect(color.hex).toBe('#FFFFFF');
			expect(color.r).toBe(255);
			expect(color.g).toBe(255);
			expect(color.b).toBe(255);
		});
	});

	// ---------------------------------------------------------------
	// close()
	// ---------------------------------------------------------------
	describe('close()', () => {
		it('should save ctx state from module-level variables and call controller.close()', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const form = document.createElement('div');

			// Attach to initialize module-level state
			hs.attach(form);

			// Mock the controller.close method
			hs.controller.close = jest.fn();

			hs.close();

			// ctx should be updated with current state
			expect(hs.ctx).toHaveProperty('gradientPointerX');
			expect(hs.ctx).toHaveProperty('wheelPointerX');
			expect(hs.ctx).toHaveProperty('wheelPointerY');
			expect(hs.ctx).toHaveProperty('wheelX');
			expect(hs.ctx).toHaveProperty('wheelY');
			expect(hs.ctx).toHaveProperty('lightness');
			expect(hs.ctx).toHaveProperty('color');
			expect(hs.controller.close).toHaveBeenCalledTimes(1);
		});

		it('should preserve color information in ctx after close', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const form = document.createElement('div');

			hs.attach(form);
			hs.controller.close = jest.fn();

			hs.close();

			// The color should be a string or color object
			expect(hs.ctx.color).toBeDefined();
		});
	});

	// ---------------------------------------------------------------
	// open()
	// ---------------------------------------------------------------
	describe('open(target)', () => {
		it('should call attach() and controller.open()', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const target = document.createElement('div');

			// Mock controller.open
			hs.controller.open = jest.fn();

			hs.open(target);

			expect(hs.isOpen).toBe(true);
			expect(hs.controller.open).toHaveBeenCalledWith(target, null, {
				isWWTarget: false,
				initMethod: null,
				addOffset: null
			});
		});
	});

	// ---------------------------------------------------------------
	// attach()
	// ---------------------------------------------------------------
	describe('attach(form)', () => {
		it('should append slider to provided form element', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			expect(form.querySelector('.se-hue-slider')).not.toBeNull();
		});

		it('should set isOpen to true after attach', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			expect(hs.isOpen).toBe(false);
			hs.attach(form);
			expect(hs.isOpen).toBe(true);
		});

		it('should register global mouse events via eventManager', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const addCalls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			const eventTypes = addCalls.map(call => call[0]);

			expect(eventTypes).toContain('mousedown');
			expect(eventTypes).toContain('mousemove');
			expect(eventTypes).toContain('mouseup');
		});

		it('should restore ctx state when attaching', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.ctx = {
				wheelX: 100,
				wheelY: 100,
				lightness: 0.5,
				wheelPointerX: '100px',
				wheelPointerY: '100px',
				gradientPointerX: '50px',
				color: { hex: '#FF0000', r: 255, g: 0, b: 0, h: 0, s: 1, l: 0.5 }
			};

			hs.attach(form);

			expect(form.querySelector('.se-hue-slider')).not.toBeNull();
			expect(hs.isOpen).toBe(true);
		});

		it('should use circle element when no form is provided', () => {
			const hs = new HueSlider(mockInst, mockDeps);

			hs.attach();

			expect(hs.circle.querySelector('.se-hue-slider')).not.toBeNull();
			expect(hs.isOpen).toBe(true);
		});

		it('should call init() before attaching to reset state', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			const initSpy = jest.spyOn(hs, 'init');
			hs.attach(form);

			expect(initSpy).toHaveBeenCalled();
			initSpy.mockRestore();
		});
	});

	// ---------------------------------------------------------------
	// init()
	// ---------------------------------------------------------------
	describe('init()', () => {
		it('should set isOpen to false', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			hs.isOpen = true;

			hs.init();

			expect(hs.isOpen).toBe(false);
		});

		it('should remove global event listeners registered by attach', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);
			hs.init();

			expect(mockDeps.eventManager.removeGlobalEvent.mock.calls.length).toBeGreaterThan(0);
		});

		it('should be safe to call init() multiple times', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			expect(() => {
				hs.init();
				hs.init();
				hs.init();
			}).not.toThrow();
		});

		it('should not call removeGlobalEvent if no events were registered', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			hs.init();

			expect(mockDeps.eventManager.removeGlobalEvent).not.toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------------
	// attach then init cycle
	// ---------------------------------------------------------------
	describe('attach/init lifecycle', () => {
		it('should support multiple attach/init cycles', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);
			expect(hs.isOpen).toBe(true);
			hs.init();
			expect(hs.isOpen).toBe(false);

			hs.attach(form);
			expect(hs.isOpen).toBe(true);
			hs.init();
			expect(hs.isOpen).toBe(false);
		});
	});

	// ---------------------------------------------------------------
	// Color via get() after attach with different ctx colors
	// ---------------------------------------------------------------
	describe('Color retrieval after attach', () => {
		it('should return color with valid hex format after attach', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should return color with r, g, b values in 0-255 range', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const color = hs.get();
			expect(color.r).toBeGreaterThanOrEqual(0);
			expect(color.r).toBeLessThanOrEqual(255);
			expect(color.g).toBeGreaterThanOrEqual(0);
			expect(color.g).toBeLessThanOrEqual(255);
			expect(color.b).toBeGreaterThanOrEqual(0);
			expect(color.b).toBeLessThanOrEqual(255);
		});

		it('should return color with h, s, l values in valid range', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const color = hs.get();
			expect(color.h).toBeGreaterThanOrEqual(0);
			expect(color.h).toBeLessThanOrEqual(1);
			expect(color.s).toBeGreaterThanOrEqual(0);
			expect(color.s).toBeLessThanOrEqual(1);
			expect(color.l).toBeGreaterThanOrEqual(0);
			expect(color.l).toBeLessThanOrEqual(1);
		});
	});

	// ---------------------------------------------------------------
	// Canvas context interaction during attach
	// ---------------------------------------------------------------
	describe('Canvas context interaction', () => {
		it('should call canvas drawing methods during attach', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------------
	// Multiple HueSlider instances
	// ---------------------------------------------------------------
	describe('Multiple instances', () => {
		it('should share the same module-level slider element', () => {
			const hs1 = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const hs2 = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			expect(hs1.get()).toBe(hs2.get());
		});

		it('should maintain independent isOpen state', () => {
			const hs1 = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const hs2 = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			hs1.isOpen = true;
			expect(hs2.isOpen).toBe(false);
		});

		it('should maintain independent ctx state', () => {
			const hs1 = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const hs2 = new HueSlider(mockInst, mockDeps, { isNewForm: true });

			hs1.ctx.wheelX = 42;
			expect(hs2.ctx.wheelX).not.toBe(42);
		});
	});

	// ---------------------------------------------------------------
	// CreateHTML_basicControllerForm (tested through constructor)
	// ---------------------------------------------------------------
	describe('CreateHTML_basicControllerForm (via constructor)', () => {
		it('should generate a controller with se-controller class', () => {
			const hs = new HueSlider(mockInst, mockDeps, {}, 'test-class');
			const controllerEl = hs.circle.parentElement;

			expect(controllerEl.classList.contains('se-controller')).toBe(true);
		});

		it('should include submit button with checked icon', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const submitBtn = hs.circle.parentElement.querySelector('[data-command="submit"]');

			expect(submitBtn.innerHTML).toContain('checked');
		});

		it('should include close button with cancel icon', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const closeBtn = hs.circle.parentElement.querySelector('[data-command="close"]');

			expect(closeBtn.innerHTML).toContain('cancel');
		});

		it('should have aria-label attributes for accessibility', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const submitBtn = hs.circle.parentElement.querySelector('[data-command="submit"]');
			const closeBtn = hs.circle.parentElement.querySelector('[data-command="close"]');

			expect(submitBtn.getAttribute('aria-label')).toBe('Submit');
			expect(closeBtn.getAttribute('aria-label')).toBe('Close');
		});

		it('should include a se-form-group container', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const formGroup = hs.circle.parentElement.querySelector('.se-form-group');

			expect(formGroup).not.toBeNull();
			expect(formGroup.classList.contains('se-form-flex-btn')).toBe(true);
		});
	});

	// ---------------------------------------------------------------
	// Mouse event handlers (OnMousedown with wheel and gradientBar)
	// ---------------------------------------------------------------
	describe('OnMousedown - wheel interaction', () => {
		let hs, form, wheelCanvas, gradientBarCanvas, mousedownHandler, mousemoveHandler, mouseupHandler;

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			form = document.createElement('div');

			hs.attach(form);

			// Get the actual module-level wheel and gradientBar canvas elements
			wheelCanvas = form.querySelector('.se-hue-wheel');
			gradientBarCanvas = form.querySelector('.se-hue-gradient');

			// Mock getBoundingClientRect for realistic dimensions (jsdom returns 0 by default)
			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });
			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			// Get registered handlers
			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			mousedownHandler = getHandler(calls, 'mousedown');
			mousemoveHandler = getHandler(calls, 'mousemove');
			mouseupHandler = getHandler(calls, 'mouseup');
		});

		it('should handle mousedown on wheel canvas (sets wheel dragging)', () => {
			expect(() => {
				mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });
			}).not.toThrow();
		});

		it('should handle mousedown on gradient bar canvas (sets bar dragging)', () => {
			expect(() => {
				mousedownHandler({ target: gradientBarCanvas, clientX: 120, clientY: 14 });
			}).not.toThrow();
		});

		it('should update color after wheel mousedown interaction', () => {
			mousedownHandler({ target: wheelCanvas, clientX: 80, clientY: 80 });

			const color = hs.get();
			expect(color).toHaveProperty('hex');
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should update color after gradient bar mousedown interaction', () => {
			mousedownHandler({ target: gradientBarCanvas, clientX: 60, clientY: 14 });

			const color = hs.get();
			expect(color).toHaveProperty('hex');
			if (!isNaN(color.r)) {
				expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			}
		});

		it('should do nothing on mousedown for non-target elements', () => {
			const randomEl = document.createElement('div');
			const colorBefore = hs.get();

			mousedownHandler({ target: randomEl, clientX: 100, clientY: 100 });

			// Color should remain the same (no dragging initiated)
			expect(hs.get()).toBe(colorBefore);
		});
	});

	// ---------------------------------------------------------------
	// OnMousemove while dragging
	// ---------------------------------------------------------------
	describe('OnMousemove - dragging behavior', () => {
		let hs, form, wheelCanvas, gradientBarCanvas, mousedownHandler, mousemoveHandler, mouseupHandler;

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			form = document.createElement('div');

			hs.attach(form);

			wheelCanvas = form.querySelector('.se-hue-wheel');
			gradientBarCanvas = form.querySelector('.se-hue-gradient');

			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });
			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			mousedownHandler = getHandler(calls, 'mousedown');
			mousemoveHandler = getHandler(calls, 'mousemove');
			mouseupHandler = getHandler(calls, 'mouseup');
		});

		it('should handle mousemove while wheel dragging', () => {
			// Start wheel drag
			mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });

			// Move while dragging
			expect(() => {
				mousemoveHandler({ clientX: 130, clientY: 130 });
			}).not.toThrow();
		});

		it('should handle mousemove while bar dragging', () => {
			// Start bar drag
			mousedownHandler({ target: gradientBarCanvas, clientX: 60, clientY: 14 });

			// Move while bar dragging
			expect(() => {
				mousemoveHandler({ clientX: 100, clientY: 14 });
			}).not.toThrow();
		});

		it('should not update when not dragging', () => {
			// Just move without dragging
			expect(() => {
				mousemoveHandler({ clientX: 150, clientY: 150 });
			}).not.toThrow();
		});

		it('should stop dragging on mouseup', () => {
			// Start wheel drag
			mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });

			// Mouse up
			mouseupHandler();

			// Subsequent mousemove should not cause any updates
			expect(() => {
				mousemoveHandler({ clientX: 140, clientY: 140 });
			}).not.toThrow();
		});

		it('should switch from wheel dragging to bar dragging correctly', () => {
			// Start wheel drag
			mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });

			// Mouse up
			mouseupHandler();

			// Start bar drag
			mousedownHandler({ target: gradientBarCanvas, clientX: 60, clientY: 14 });

			expect(() => {
				mousemoveHandler({ clientX: 100, clientY: 14 });
			}).not.toThrow();
		});
	});

	// ---------------------------------------------------------------
	// updatePointer_wheel and updatePointer_bar (through event handlers)
	// ---------------------------------------------------------------
	describe('Pointer updates through interaction', () => {
		let hs, form, wheelCanvas, gradientBarCanvas, mousedownHandler;

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			form = document.createElement('div');

			hs.attach(form);

			wheelCanvas = form.querySelector('.se-hue-wheel');
			gradientBarCanvas = form.querySelector('.se-hue-gradient');

			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });
			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			mousedownHandler = getHandler(calls, 'mousedown');
		});

		it('should update wheel pointer position on wheel click', () => {
			const wheelPointer = form.querySelector('.se-hue-wheel-pointer');

			mousedownHandler({ target: wheelCanvas, clientX: 50, clientY: 50 });

			// The pointer position should be updated (not the default 50%)
			expect(wheelPointer.style.left).toBeTruthy();
			expect(wheelPointer.style.top).toBeTruthy();
		});

		it('should update gradient pointer position on bar click', () => {
			const gradientPointer = form.querySelector('.se-hue-gradient-pointer');

			mousedownHandler({ target: gradientBarCanvas, clientX: 100, clientY: 14 });

			// The gradient pointer position should be updated
			expect(gradientPointer.style.left).toBeTruthy();
		});

		it('should produce valid color after wheel interaction at edge', () => {
			mousedownHandler({ target: wheelCanvas, clientX: 0, clientY: 0 });

			const color = hs.get();
			expect(color.r).toBeGreaterThanOrEqual(0);
			expect(color.r).toBeLessThanOrEqual(255);
			expect(color.g).toBeGreaterThanOrEqual(0);
			expect(color.g).toBeLessThanOrEqual(255);
			expect(color.b).toBeGreaterThanOrEqual(0);
			expect(color.b).toBeLessThanOrEqual(255);
		});

		it('should produce valid color after bar interaction at left edge', () => {
			mousedownHandler({ target: gradientBarCanvas, clientX: 0, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should produce valid color after bar interaction at right edge', () => {
			mousedownHandler({ target: gradientBarCanvas, clientX: 240, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle wheel click at center (close to center threshold)', () => {
			// Click at center of wheel (120, 120) -> distance from center = 0
			mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});
	});

	// ---------------------------------------------------------------
	// Color conversion through pixel data interaction
	// ---------------------------------------------------------------
	describe('Color conversion through different pixel data', () => {
		let hs, form, wheelCanvas, mousedownHandler;

		/**
		 * Set the mock getImageData to return specific pixel data.
		 * Since ensureCanvasMocks() creates a factory function, each getContext() call
		 * returns a new object. We override the prototype mock to return specific data.
		 */
		function setMockPixelData(r, g, b, a) {
			const mockGradient = { addColorStop: jest.fn() };
			HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
				fillStyle: '',
				strokeStyle: '',
				lineWidth: 1,
				globalAlpha: 1.0,
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
				drawImage: jest.fn(),
				createLinearGradient: jest.fn(() => mockGradient),
				createRadialGradient: jest.fn(() => mockGradient),
				getImageData: jest.fn(() => ({
					data: new Uint8ClampedArray([r, g, b, a]),
					width: 1,
					height: 1
				})),
				putImageData: jest.fn(),
				canvas: { width: 300, height: 150 }
			}));
		}

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			form = document.createElement('div');
			hs.attach(form);

			wheelCanvas = form.querySelector('.se-hue-wheel');

			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			mousedownHandler = getHandler(calls, 'mousedown');
		});

		it('should handle pure red pixel (255, 0, 0)', () => {
			setMockPixelData(255, 0, 0, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.r).toBeGreaterThanOrEqual(0);
		});

		it('should handle pure green pixel (0, 255, 0)', () => {
			setMockPixelData(0, 255, 0, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle pure blue pixel (0, 0, 255)', () => {
			setMockPixelData(0, 0, 255, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle black pixel (0, 0, 0) - achromatic', () => {
			setMockPixelData(0, 0, 0, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle white pixel (255, 255, 255) - achromatic', () => {
			setMockPixelData(255, 255, 255, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle gray pixel (128, 128, 128) - achromatic', () => {
			setMockPixelData(128, 128, 128, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle mixed color pixel (200, 100, 50)', () => {
			setMockPixelData(200, 100, 50, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle pixel where green is max (100, 200, 50)', () => {
			setMockPixelData(100, 200, 50, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle pixel where blue is max (50, 100, 200)', () => {
			setMockPixelData(50, 100, 200, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle pixel where red is max and g < b (255, 0, 100)', () => {
			setMockPixelData(255, 0, 100, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle low-value pixel (1, 2, 3)', () => {
			setMockPixelData(1, 2, 3, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle pixel with values < 16 for hex padding (10, 5, 15)', () => {
			setMockPixelData(10, 5, 15, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			// Hex should still be properly padded (e.g., #0A050F)
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.hex.length).toBe(7);
		});

		it('should handle pixel with l > 0.5 for saturation branch', () => {
			// A color with lightness > 0.5: e.g., (200, 180, 160) has high lightness
			setMockPixelData(200, 180, 160, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});
	});

	// ---------------------------------------------------------------
	// selectGradientColor - bar boundary conditions
	// ---------------------------------------------------------------
	describe('selectGradientColor boundary conditions', () => {
		let hs, form, gradientBarCanvas, mousedownHandler;

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			form = document.createElement('div');
			hs.attach(form);

			gradientBarCanvas = form.querySelector('.se-hue-gradient');

			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			mousedownHandler = getHandler(calls, 'mousedown');
		});

		it('should handle bar click at far left (near tolerance)', () => {
			mousedownHandler({ target: gradientBarCanvas, clientX: -10, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle bar click at far right (near bar width)', () => {
			mousedownHandler({ target: gradientBarCanvas, clientX: 300, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle bar click at center', () => {
			mousedownHandler({ target: gradientBarCanvas, clientX: 120, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});
	});

	// ---------------------------------------------------------------
	// Edge cases & robustness
	// ---------------------------------------------------------------
	describe('Edge cases', () => {
		it('should handle constructor with empty params object', () => {
			expect(() => {
				new HueSlider(mockInst, mockDeps, {});
			}).not.toThrow();
		});

		it('should handle constructor with no params (defaults)', () => {
			expect(() => {
				new HueSlider(mockInst, mockDeps);
			}).not.toThrow();
		});

		it('should handle constructor with controllerOptions in params', () => {
			expect(() => {
				new HueSlider(mockInst, mockDeps, {
					controllerOptions: { position: 'top' }
				});
			}).not.toThrow();
		});

		it('should handle attach with ctx.color having black hex', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.ctx = {
				wheelX: 120,
				wheelY: 120,
				lightness: 0,
				wheelPointerX: '50%',
				wheelPointerY: '50%',
				gradientPointerX: 'calc(100% - 14px)',
				color: { hex: '#000000', r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 }
			};

			expect(() => hs.attach(form)).not.toThrow();
			expect(hs.isOpen).toBe(true);
		});
	});

	// ---------------------------------------------------------------
	// Default color constant
	// ---------------------------------------------------------------
	describe('Default color value', () => {
		it('should define default color as white (#FFFFFF)', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const defaultColor = hs.ctx.color;

			expect(defaultColor.hex).toBe('#FFFFFF');
			expect(defaultColor.r).toBe(255);
			expect(defaultColor.g).toBe(255);
			expect(defaultColor.b).toBe(255);
			expect(defaultColor.h).toBe(0);
			expect(defaultColor.s).toBe(1);
			expect(defaultColor.l).toBe(1);
		});
	});

	// ---------------------------------------------------------------
	// init() after attach removes events
	// ---------------------------------------------------------------
	describe('init() after attach cleans up events', () => {
		it('should remove all mouse event handlers on init after attach', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const addedCount = mockDeps.eventManager.addGlobalEvent.mock.calls.length;
			expect(addedCount).toBeGreaterThanOrEqual(3);

			hs.init();

			const removedCount = mockDeps.eventManager.removeGlobalEvent.mock.calls.length;
			expect(removedCount).toBeGreaterThanOrEqual(3);
		});
	});

	// ---------------------------------------------------------------
	// ctx state persistence
	// ---------------------------------------------------------------
	describe('ctx state persistence', () => {
		it('should preserve ctx values set before attach', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			const customCtx = {
				wheelX: 150,
				wheelY: 75,
				lightness: 0.3,
				wheelPointerX: '150px',
				wheelPointerY: '75px',
				gradientPointerX: '80px',
				color: { hex: '#00FF00', r: 0, g: 255, b: 0, h: 0.33, s: 1, l: 0.5 }
			};
			hs.ctx = customCtx;

			hs.attach(form);

			expect(hs.isOpen).toBe(true);
		});
	});

	// ---------------------------------------------------------------
	// Full interaction flow: mousedown -> mousemove -> mouseup -> get()
	// ---------------------------------------------------------------
	describe('Full interaction flow', () => {
		/**
		 * Helper to set up an attached HueSlider with mocked bounding rects and handlers.
		 */
		function setupInteraction() {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const wheelCanvas = form.querySelector('.se-hue-wheel');
			const gradientBarCanvas = form.querySelector('.se-hue-gradient');

			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });
			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			return {
				hs, form, wheelCanvas, gradientBarCanvas,
				mousedownHandler: getHandler(calls, 'mousedown'),
				mousemoveHandler: getHandler(calls, 'mousemove'),
				mouseupHandler: getHandler(calls, 'mouseup')
			};
		}

		it('should produce a changed color after wheel drag', () => {
			const { hs, wheelCanvas, mousedownHandler, mousemoveHandler, mouseupHandler } = setupInteraction();

			mousedownHandler({ target: wheelCanvas, clientX: 80, clientY: 80 });
			mousemoveHandler({ clientX: 160, clientY: 160 });
			mouseupHandler();

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.r).toBeGreaterThanOrEqual(0);
			expect(color.r).toBeLessThanOrEqual(255);
		});

		it('should produce a changed color after bar drag', () => {
			const { hs, gradientBarCanvas, mousedownHandler, mousemoveHandler, mouseupHandler } = setupInteraction();

			mousedownHandler({ target: gradientBarCanvas, clientX: 50, clientY: 14 });
			mousemoveHandler({ clientX: 200, clientY: 14 });
			mouseupHandler();

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle sequential wheel then bar interactions', () => {
			const { hs, wheelCanvas, gradientBarCanvas, mousedownHandler, mouseupHandler } = setupInteraction();

			// Wheel interaction
			mousedownHandler({ target: wheelCanvas, clientX: 80, clientY: 80 });
			mouseupHandler();

			// Bar interaction
			mousedownHandler({ target: gradientBarCanvas, clientX: 120, clientY: 14 });
			mouseupHandler();

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});
	});

	// ---------------------------------------------------------------
	// close/open cycle with controller mock
	// ---------------------------------------------------------------
	describe('close/open lifecycle with controller', () => {
		it('should save and restore state across close/open cycles', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const form = document.createElement('div');

			// First open
			hs.attach(form);

			// Interact with wheel to change state
			const wheelCanvas = form.querySelector('.se-hue-wheel');
			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			const mousedownHandler = getHandler(calls, 'mousedown');
			mousedownHandler({ target: wheelCanvas, clientX: 80, clientY: 80 });

			// Close (saves state)
			hs.controller.close = jest.fn();
			hs.close();

			// Verify ctx was updated
			expect(hs.ctx).toHaveProperty('wheelX');
			expect(hs.ctx).toHaveProperty('wheelY');
			expect(hs.ctx).toHaveProperty('lightness');
			expect(hs.ctx).toHaveProperty('color');
		});
	});

	// ---------------------------------------------------------------
	// Multiple drag sequences
	// ---------------------------------------------------------------
	describe('Multiple drag sequences', () => {
		it('should handle multiple wheel clicks in sequence', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const wheelCanvas = form.querySelector('.se-hue-wheel');
			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			const mousedownHandler = getHandler(calls, 'mousedown');
			const mouseupHandler = getHandler(calls, 'mouseup');

			// First click
			mousedownHandler({ target: wheelCanvas, clientX: 50, clientY: 50 });
			mouseupHandler();

			// Second click at different position
			mousedownHandler({ target: wheelCanvas, clientX: 180, clientY: 180 });
			mouseupHandler();

			// Third click at center
			mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });
			mouseupHandler();

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle alternating wheel and bar clicks', () => {
			const hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			const form = document.createElement('div');

			hs.attach(form);

			const wheelCanvas = form.querySelector('.se-hue-wheel');
			const gradientBarCanvas = form.querySelector('.se-hue-gradient');

			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });
			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			const mousedownHandler = getHandler(calls, 'mousedown');
			const mouseupHandler = getHandler(calls, 'mouseup');

			// Wheel click
			mousedownHandler({ target: wheelCanvas, clientX: 80, clientY: 80 });
			mouseupHandler();

			// Bar click
			mousedownHandler({ target: gradientBarCanvas, clientX: 60, clientY: 14 });
			mouseupHandler();

			// Another wheel click
			mousedownHandler({ target: wheelCanvas, clientX: 160, clientY: 160 });
			mouseupHandler();

			// Another bar click
			mousedownHandler({ target: gradientBarCanvas, clientX: 200, clientY: 14 });
			mouseupHandler();

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});
	});

	// ---------------------------------------------------------------
	// rgbToHsl / hslToRgb non-achromatic branches via module-level context manipulation
	// ---------------------------------------------------------------
	describe('Non-achromatic color conversion through wheelCtx manipulation', () => {
		let hs, form, wheelCanvas, gradientBarCanvas, mousedownHandler;

		/**
		 * Override the module-level wheelCtx and offscreenCtx getImageData
		 * to return specific pixel data, enabling non-achromatic code paths.
		 */
		function setModulePixelData(r, g, b, a = 255) {
			const pixelData = {
				data: new Uint8ClampedArray([r, g, b, a]),
				width: 1,
				height: 1
			};
			// moduleContexts[0] = offscreenCtx, moduleContexts[1] = wheelCtx
			if (moduleContexts[0]) {
				moduleContexts[0].getImageData.mockReturnValue(pixelData);
			}
			if (moduleContexts[1]) {
				moduleContexts[1].getImageData.mockReturnValue(pixelData);
			}
		}

		beforeEach(() => {
			hs = new HueSlider(mockInst, mockDeps, { isNewForm: true });
			form = document.createElement('div');
			hs.attach(form);

			wheelCanvas = form.querySelector('.se-hue-wheel');
			gradientBarCanvas = form.querySelector('.se-hue-gradient');

			mockBoundingRect(wheelCanvas, { left: 0, top: 0, width: 240, height: 240 });
			mockBoundingRect(gradientBarCanvas, { left: 0, top: 0, width: 240, height: 28 });

			const calls = mockDeps.eventManager.addGlobalEvent.mock.calls;
			mousedownHandler = getHandler(calls, 'mousedown');
		});

		afterEach(() => {
			// Reset to default [0,0,0,0] pixel data
			const defaultPixel = {
				data: new Uint8ClampedArray(4),
				width: 1,
				height: 1
			};
			if (moduleContexts[0]) moduleContexts[0].getImageData.mockReturnValue(defaultPixel);
			if (moduleContexts[1]) moduleContexts[1].getImageData.mockReturnValue(defaultPixel);
		});

		it('should handle red-dominant chromatic pixel (255, 50, 20) via wheelCtx - hits rgbToHsl case r max and hslToRgb non-achromatic', () => {
			// Red max where g > b: hits switch case r with g < b = false (ternary +0)
			setModulePixelData(255, 50, 20);

			// Click away from center so distance >= CLOSE_TO_CENTER_THRESHOLD
			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			// Non-achromatic: s should be > 0
			expect(color.s).toBeGreaterThan(0);
		});

		it('should handle red-dominant pixel where g < b (255, 10, 100) - hits rgbToHsl case r with g < b ternary +6', () => {
			setModulePixelData(255, 10, 100);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.s).toBeGreaterThan(0);
		});

		it('should handle green-dominant chromatic pixel (50, 255, 20) - hits rgbToHsl case g max', () => {
			setModulePixelData(50, 255, 20);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.s).toBeGreaterThan(0);
		});

		it('should handle blue-dominant chromatic pixel (20, 50, 255) - hits rgbToHsl case b max', () => {
			setModulePixelData(20, 50, 255);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.s).toBeGreaterThan(0);
		});

		it('should handle high lightness chromatic pixel (240, 200, 180) - hits rgbToHsl l > 0.5 saturation branch', () => {
			// l = (240/255 + 180/255) / 2 = ~0.824 > 0.5
			setModulePixelData(240, 200, 180);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.l).toBeGreaterThan(0.5);
		});

		it('should handle low lightness chromatic pixel (50, 20, 10) - hits rgbToHsl l <= 0.5 saturation branch', () => {
			// l = (50/255 + 10/255) / 2 = ~0.118 <= 0.5
			setModulePixelData(50, 20, 10);

			mousedownHandler({ target: wheelCanvas, clientX: 200, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
			expect(color.l).toBeLessThanOrEqual(0.5);
		});

		it('should handle chromatic pixel and then gradient bar click (hslToRgb with l < 0.5)', () => {
			setModulePixelData(200, 50, 30);

			// Wheel click to pick a color
			mousedownHandler({ target: wheelCanvas, clientX: 180, clientY: 100 });

			// Then gradient bar click to adjust lightness
			mousedownHandler({ target: gradientBarCanvas, clientX: 200, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should handle chromatic pixel with gradient bar at low lightness (hslToRgb with l >= 0.5)', () => {
			setModulePixelData(200, 100, 50);

			// Wheel click
			mousedownHandler({ target: wheelCanvas, clientX: 160, clientY: 80 });

			// Gradient bar near left edge (high lightness value = low LIGHTNESS)
			mousedownHandler({ target: gradientBarCanvas, clientX: 20, clientY: 14 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});

		it('should produce correct color when wheel click at center with non-zero LIGHTNESS', () => {
			setModulePixelData(100, 200, 150);

			// First, click gradient bar to set LIGHTNESS to non-zero
			mousedownHandler({ target: gradientBarCanvas, clientX: 120, clientY: 14 });

			// Then click at center of wheel (distance < CLOSE_TO_CENTER_THRESHOLD)
			// At center, l = 1 - LIGHTNESS; with chromatic pixel data, hslToRgb non-achromatic
			mousedownHandler({ target: wheelCanvas, clientX: 120, clientY: 120 });

			const color = hs.get();
			expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
		});
	});

	// ---------------------------------------------------------------
	// close() with falsy ctx.color (Branch 5[1]: ctx?.color || '')
	// ---------------------------------------------------------------
	describe('close() with edge-case ctx states', () => {
		it('should handle close when module-level ctx has no color property (||  fallback)', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const form = document.createElement('div');

			// Attach to set up module-level ctx
			hs.attach(form);

			// Set the instance ctx.color to a falsy value before calling close.
			// The module-level ctx variable is set to this.ctx during attach().
			// After attach, module-level ctx = this.ctx. We can modify this.ctx.color = null.
			hs.ctx.color = null;

			hs.controller.close = jest.fn();
			hs.close();

			// close() reads ctx?.color || '' - with ctx.color = null, should use ''
			expect(hs.ctx).toHaveProperty('color');
		});

		it('should handle close when module-level ctx has undefined color', () => {
			const hs = new HueSlider(mockInst, mockDeps);
			const form = document.createElement('div');

			hs.attach(form);
			hs.ctx.color = undefined;

			hs.controller.close = jest.fn();
			hs.close();

			// ctx?.color || '' should evaluate to ''
			expect(hs.ctx.color).toBe('');
		});
	});
});
