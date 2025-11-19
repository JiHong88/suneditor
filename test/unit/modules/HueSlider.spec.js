/**
 * @fileoverview Unit tests for modules/HueSlider.js
 */

// Setup canvas mocks before any imports
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
	clearRect: jest.fn(),
	fillRect: jest.fn(),
	drawImage: jest.fn(),
	beginPath: jest.fn(),
	arc: jest.fn(),
	fill: jest.fn(),
	createLinearGradient: jest.fn(() => ({
		addColorStop: jest.fn()
	})),
	getImageData: jest.fn(() => ({
		data: [255, 255, 255, 255]
	})),
	fillStyle: '',
	globalAlpha: 1
}));

HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
	left: 0,
	top: 0,
	width: 240,
	height: 240
}));

// Mock CoreInjector
jest.mock('../../../src/editorInjector/_core.js', () => {
	return jest.fn().mockImplementation(function(editor) {
		this.editor = editor;
		this.frameContext = editor ? editor.frameContext : new Map();
		this.triggerEvent = (editor && editor.triggerEvent) || jest.fn();
		this.eventManager = (editor && editor.eventManager) || {
			addEvent: jest.fn(),
			addGlobalEvent: jest.fn(() => 'event-id'),
			removeGlobalEvent: jest.fn()
		};
	});
});

// Mock Controller
jest.mock('../../../src/modules/contracts/Controller.js', () => {
	return jest.fn().mockImplementation(function(inst, form, options) {
		this.open = jest.fn();
		this.close = jest.fn();
		this.position = options?.position || 'bottom';
	});
});

// Mock helper
jest.mock('../../../src/helper', () => {
	// Create mock canvas element
	const createMockCanvas = () => ({
		width: 240,
		height: 240,
		getContext: jest.fn(() => ({
			clearRect: jest.fn(),
			fillRect: jest.fn(),
			drawImage: jest.fn(),
			beginPath: jest.fn(),
			arc: jest.fn(),
			fill: jest.fn(),
			createLinearGradient: jest.fn(() => ({
				addColorStop: jest.fn()
			})),
			getImageData: jest.fn(() => ({
				data: [255, 255, 255, 255]
			})),
			fillStyle: '',
			globalAlpha: 1
		})),
		getBoundingClientRect: jest.fn(() => ({
			left: 0,
			top: 0,
			width: 240,
			height: 240
		})),
		style: {}
	});

	// Create mock pointer element
	const createMockPointer = () => ({
		style: {
			left: '',
			top: ''
		}
	});

	// Create mock final hex container with children
	const createMockFinalHex = () => ({
		children: [
			{ textContent: '#FFFFFF', style: {} }, // fanalColorHex
			{ style: { backgroundColor: '' } } // fanalColorBackground
		]
	});

	return {
		dom: {
			utils: {
				createElement: jest.fn(() => {
					const mockWheel = createMockCanvas();
					const mockGradient = createMockCanvas();
					const mockWheelPointer = createMockPointer();
					const mockGradientPointer = createMockPointer();
					const mockFinalHex = createMockFinalHex();

					const mockElement = {
						appendChild: jest.fn(),
						querySelector: jest.fn((selector) => {
							if (selector === '.se-hue-wheel') return mockWheel;
							if (selector === '.se-hue-gradient') return mockGradient;
							if (selector === '.se-hue-wheel-pointer') return mockWheelPointer;
							if (selector === '.se-hue-gradient-pointer') return mockGradientPointer;
							if (selector === '.se-hue-final-hex') return mockFinalHex;
							if (selector === '.se-hue') return mockElement;
							if (selector === '.se-btn-success') return { addEventListener: jest.fn() };
							if (selector === '.se-btn-danger') return { addEventListener: jest.fn() };
							return mockElement;
						}),
						querySelectorAll: jest.fn(() => []),
						className: '',
						innerHTML: '',
						children: [],
						style: {}
					};
					return mockElement;
				})
			}
		},
		env: {
			_w: {},
			isTouchDevice: false,
			isMobile: false
		}
	};
});

import HueSlider, { CreateSliderCtx } from '../../../src/modules/contracts/HueSlider.js';

describe('Modules - HueSlider', () => {
	let mockInst;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			lang: {
				submitButton: 'Submit',
				close: 'Close'
			},
			icons: {
				checked: '<svg>check</svg>',
				cancel: '<svg>cancel</svg>'
			},
			eventManager: {
				addEvent: jest.fn(),
				addGlobalEvent: jest.fn(() => 'event-id'),
				removeGlobalEvent: jest.fn()
			}
		};

		mockInst = {
			editor: mockEditor,
			form: document.createElement('div'), // HueSlider needs form element for Controller
			hueSliderAction: jest.fn(),
			hueSliderCancelAction: jest.fn()
		};
	});

	describe('CreateSliderCtx function', () => {
		it('should create slider context without throwing', () => {
			expect(() => {
				CreateSliderCtx();
			}).not.toThrow();
		});

		it('should return an object with all required properties', () => {
			const result = CreateSliderCtx();

			expect(result).toBeDefined();
			expect(typeof result).toBe('object');
			expect(result).toHaveProperty('slider');
			expect(result).toHaveProperty('offscreenCanvas');
			expect(result).toHaveProperty('offscreenCtx');
			expect(result).toHaveProperty('wheel');
			expect(result).toHaveProperty('wheelCtx');
			expect(result).toHaveProperty('wheelPointer');
			expect(result).toHaveProperty('gradientBar');
			expect(result).toHaveProperty('gradientPointer');
			expect(result).toHaveProperty('fanalColorHex');
			expect(result).toHaveProperty('fanalColorBackground');
		});

		it('should create canvas elements', () => {
			const result = CreateSliderCtx();

			expect(result.offscreenCanvas).toBeInstanceOf(HTMLCanvasElement);
			expect(result.wheel).toBeDefined();
			expect(result.gradientBar).toBeDefined();
		});

		it('should initialize canvas contexts', () => {
			const result = CreateSliderCtx();

			expect(result.offscreenCtx).toBeDefined();
			expect(result.wheelCtx).toBeDefined();
		});
	});

	describe('HueSlider Class', () => {
		it('should initialize with default state', () => {
			const hueSlider = new HueSlider(mockInst);

			expect(hueSlider.isOpen).toBe(false);
			expect(hueSlider.ctx).toBeDefined();
			expect(hueSlider.ctx.color).toBeDefined();
			expect(hueSlider.ctx.color.hex).toBe('#FFFFFF');
		});

		it('should not create controller when isNewForm is true', () => {
			const hueSlider = new HueSlider(mockInst, { isNewForm: true });

			// When isNewForm, controller is not created
			expect(hueSlider.controller).toBeUndefined();
		});

		it('should create default controller when not isNewForm', () => {
			const hueSlider = new HueSlider(mockInst, {});

			expect(hueSlider.controller).toBeDefined();
			expect(mockEditor.eventManager.addEvent).toHaveBeenCalled();
		});

		it('should accept controllerOptions parameter', () => {
			const hueSlider = new HueSlider(mockInst, { controllerOptions: { position: 'top' } });

			expect(hueSlider.controller).toBeDefined();
			expect(hueSlider.controller.position).toBe('top');
		});

		it('should accept className parameter', () => {
			const className = 'custom-class';
			expect(() => {
				new HueSlider(mockInst, {}, className);
			}).not.toThrow();
		});
	});

	describe('get method', () => {
		it('should return color information', () => {
			const hueSlider = new HueSlider(mockInst);
			const color = hueSlider.get();

			expect(color).toBeDefined();
			expect(typeof color).toBe('object');
			expect(color).toHaveProperty('hex');
			expect(color).toHaveProperty('r');
			expect(color).toHaveProperty('g');
			expect(color).toHaveProperty('b');
			expect(color).toHaveProperty('h');
			expect(color).toHaveProperty('s');
			expect(color).toHaveProperty('l');
		});

		it('should return default color initially', () => {
			const hueSlider = new HueSlider(mockInst);
			const color = hueSlider.get();

			expect(color.hex).toBe('#FFFFFF');
			expect(color.r).toBe(255);
			expect(color.g).toBe(255);
			expect(color.b).toBe(255);
		});
	});


	describe('close method', () => {
		it('should call off and hueSliderCancelAction', () => {
			const hueSlider = new HueSlider(mockInst);

			hueSlider.close();

			expect(mockInst.hueSliderCancelAction).toHaveBeenCalled();
			expect(hueSlider.isOpen).toBe(false);
		});
	});

	describe('off method', () => {
		it('should close controller and reset state', () => {
			const hueSlider = new HueSlider(mockInst);

			hueSlider.off();

			expect(hueSlider.controller.close).toHaveBeenCalled();
			expect(hueSlider.isOpen).toBe(false);
		});

		it('should save current context', () => {
			const hueSlider = new HueSlider(mockInst);

			hueSlider.off();

			expect(hueSlider.ctx).toBeDefined();
			expect(hueSlider.ctx.color).toBeDefined();
		});
	});

	describe('init method', () => {
		it('should reset state flags', () => {
			const hueSlider = new HueSlider(mockInst);

			hueSlider.init();

			expect(hueSlider.isOpen).toBe(false);
		});

	});



	describe('Controller integration', () => {
		it('should setup success button handler', () => {
			new HueSlider(mockInst);

			const successButtonCall = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'click'
			);

			expect(successButtonCall).toBeDefined();
		});

		it('should call hueSliderAction when success button clicked', () => {
			new HueSlider(mockInst);

			const successButtonCall = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'click'
			);

			if (successButtonCall) {
				const handler = successButtonCall[2];
				handler();

				expect(mockInst.hueSliderAction).toHaveBeenCalled();
			}
		});

		it('should setup cancel button handler', () => {
			new HueSlider(mockInst);

			const cancelButtonCalls = mockEditor.eventManager.addEvent.mock.calls.filter(
				call => call[1] === 'click'
			);

			expect(cancelButtonCalls.length).toBeGreaterThan(0);
		});
	});

	describe('Context persistence', () => {
		it('should maintain context across off calls', () => {
			const hueSlider = new HueSlider(mockInst);
			const initialCtx = hueSlider.ctx;

			hueSlider.off();

			expect(hueSlider.ctx).toBeDefined();
			expect(hueSlider.ctx.color).toBeDefined();
		});

	});

	describe('Edge cases', () => {

		it('should handle multiple init calls', () => {
			const hueSlider = new HueSlider(mockInst);

			expect(() => {
				hueSlider.init();
				hueSlider.init();
			}).not.toThrow();
		});

		it('should handle close without open', () => {
			const hueSlider = new HueSlider(mockInst);

			expect(() => {
				hueSlider.close();
			}).not.toThrow();
		});

		it('should handle off without attach', () => {
			const hueSlider = new HueSlider(mockInst);

			expect(() => {
				hueSlider.off();
			}).not.toThrow();
		});
	});

});
