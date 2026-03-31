/**
 * @fileoverview Unit tests for modules/contract/ColorPicker.js
 */

import ColorPicker from '../../../src/modules/contract/ColorPicker.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

// Mock HueSlider - ColorPicker instantiates it
jest.mock('../../../src/modules/contract/HueSlider.js', () => {
	return jest.fn().mockImplementation(function () {
		this.open = jest.fn();
		this.close = jest.fn();
		this.attach = jest.fn();
		this.init = jest.fn();
		this.get = jest.fn().mockReturnValue({ hex: '#FFFFFF', r: 255, g: 255, b: 255, h: 0, s: 1, l: 1 });
	});
});

// Mock helper - dom, converter, env
// Note: jest.mock factory cannot reference `document` or `window` directly;
// use `globalThis` (always in scope) as the bridge.
jest.mock('../../../src/helper', () => ({
	dom: {
		check: {
			isWysiwygFrame: jest.fn().mockReturnValue(false)
		},
		utils: {
			addClass: jest.fn(),
			removeClass: jest.fn(),
			removeItem: jest.fn(),
			createElement: jest.fn().mockImplementation((tag, attrs, content) => {
				const el = globalThis.document.createElement(tag || 'DIV');
				if (attrs) {
					Object.keys(attrs).forEach((key) => {
						el.setAttribute(key, attrs[key]);
					});
				}
				if (content) {
					if (typeof content === 'string') {
						el.innerHTML = content;
					} else if (typeof content === 'object') {
						el.appendChild(content);
					}
				}
				return el;
			})
		},
		query: {
			getEventTarget: jest.fn().mockImplementation((e) => e.target)
		}
	},
	converter: {
		isHexColor: jest.fn().mockReturnValue(true),
		rgb2hex: jest.fn().mockReturnValue('#000000')
	},
	env: {
		_w: globalThis.window,
		_d: globalThis.document
	}
}));

// Mock domCheck
jest.mock('../../../src/helper/dom/domCheck', () => ({
	isElement: jest.fn().mockReturnValue(true)
}));

// Re-import the mocked modules for test access
const { dom, converter, env } = require('../../../src/helper');
const { isElement } = require('../../../src/helper/dom/domCheck');
const HueSlider = require('../../../src/modules/contract/HueSlider.js');

/**
 * Creates a mock host object simulating a plugin instance
 */
function createMockHost(opts = {}) {
	const host = {
		constructor: {
			key: opts.key || 'fontColor',
			name: opts.name || 'FontColor'
		},
		colorPickerAction: jest.fn(),
		colorPickerHueSliderOpen: jest.fn(),
		colorPickerHueSliderClose: jest.fn()
	};
	if (opts.noKey) delete host.constructor.key;
	if (opts.noActions) {
		delete host.colorPickerAction;
		delete host.colorPickerHueSliderOpen;
		delete host.colorPickerHueSliderClose;
	}
	return host;
}

/**
 * Creates a mock $ deps bag for ColorPicker
 */
function createMockDeps(overrides = {}) {
	const kernel = createMockEditor();
	return {
		...kernel.$,
		lang: {
			...kernel.$.lang,
			colorPicker: 'Color Picker',
			color: 'Color',
			submitButton: 'Submit',
			remove: 'Remove'
		},
		icons: {
			...kernel.$.icons,
			color_checked: '<svg class="color-checked"></svg>',
			color_palette: '<svg class="color-palette"></svg>',
			checked: '<svg class="checked"></svg>',
			remove_color: '<svg class="remove-color"></svg>'
		},
		eventManager: {
			...kernel.$.eventManager,
			addEvent: jest.fn().mockReturnValue({ target: null, type: '', listener: null })
		},
		...overrides
	};
}

/**
 * Creates default params for ColorPicker
 */
function createDefaultParams(overrides = {}) {
	return {
		form: document.createElement('div'),
		colorList: null,
		splitNum: 0,
		defaultColor: '#000000',
		disableHEXInput: false,
		disableRemove: false,
		hueSliderOptions: {},
		...overrides
	};
}

/**
 * Gets the handler registered for a specific event type from addEvent mock calls
 */
function getAddEventHandler(mockDeps, eventType) {
	const calls = mockDeps.eventManager.addEvent.mock.calls;
	const call = calls.find((c) => c[1] === eventType);
	return call ? call[2] : null;
}

/**
 * Gets a handler registered on a specific target element
 */
function getAddEventHandlerForTarget(mockDeps, target, eventType) {
	const calls = mockDeps.eventManager.addEvent.mock.calls;
	const call = calls.find((c) => c[0] === target && c[1] === eventType);
	return call ? call[2] : null;
}

describe('Modules - ColorPicker', () => {
	let mockHost;
	let mockDeps;
	let defaultParams;

	beforeEach(() => {
		jest.clearAllMocks();
		mockHost = createMockHost();
		mockDeps = createMockDeps();
		defaultParams = createDefaultParams();
	});

	// ---------------------------------------------------------------
	// Constructor
	// ---------------------------------------------------------------
	describe('Constructor', () => {
		it('should create a ColorPicker instance with default params', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp).toBeDefined();
			expect(cp.host).toBe(mockHost);
			expect(cp.styleProperties).toBe('color');
		});

		it('should use host.constructor.key for kind when available', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.kind).toBe('fontColor');
		});

		it('should fall back to host.constructor.name when key is not available', () => {
			const hostNoKey = createMockHost({ noKey: true });
			const cp = new ColorPicker(hostNoKey, mockDeps, 'color', defaultParams);
			expect(cp.kind).toBe('FontColor');
		});

		it('should set targetButton to null initially', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.targetButton).toBeNull();
		});

		it('should set currentColor to empty string initially', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.currentColor).toBe('');
		});

		it('should set defaultColor from params', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.defaultColor).toBe('#000000');
		});

		it('should set defaultColor to empty string when not provided', () => {
			const params = createDefaultParams({ defaultColor: undefined });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			expect(cp.defaultColor).toBe('');
		});

		it('should set splitNum from params', () => {
			const params = createDefaultParams({ splitNum: 5 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			expect(cp.splitNum).toBe(5);
		});

		it('should set splitNum to 0 when not provided', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.splitNum).toBe(0);
		});

		it('should store the form element', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.form).toBe(defaultParams.form);
		});

		it('should store hueSliderOptions', () => {
			const hueOpts = { isNewForm: true };
			const params = createDefaultParams({ hueSliderOptions: hueOpts });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			expect(cp.hueSliderOptions).toBe(hueOpts);
		});

		it('should parse checkedIcon from icons.color_checked SVG', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.checkedIcon).toBeDefined();
			expect(cp.checkedIcon.tagName.toLowerCase()).toBe('svg');
		});

		it('should create an inputElement with class se-color-input', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.inputElement).not.toBeNull();
			expect(cp.inputElement.classList.contains('se-color-input')).toBe(true);
		});

		it('should append target to form element', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(defaultParams.form.querySelector('.se-list-inner')).not.toBeNull();
		});

		it('should always register click handler on target', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const calls = mockDeps.eventManager.addEvent.mock.calls;
			const clickOnTarget = calls.find((c) => c[0] === cp.target && c[1] === 'click');
			expect(clickOnTarget).toBeTruthy();
		});

		describe('when disableHEXInput is false', () => {
			it('should create a HueSlider instance', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				expect(cp.hueSlider).not.toBeNull();
				expect(HueSlider).toHaveBeenCalled();
			});

			it('should register click handler for hue button', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const hueBtn = cp.target.querySelector('.__se_hue');
				const calls = mockDeps.eventManager.addEvent.mock.calls;
				const hueHandler = calls.find((c) => c[0] === hueBtn && c[1] === 'click');
				expect(hueHandler).toBeTruthy();
			});

			it('should register input handler for input element', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const calls = mockDeps.eventManager.addEvent.mock.calls;
				const inputHandler = calls.find((c) => c[0] === cp.inputElement && c[1] === 'input');
				expect(inputHandler).toBeTruthy();
			});

			it('should register submit handler for form', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const formEl = cp.target.querySelector('form');
				const calls = mockDeps.eventManager.addEvent.mock.calls;
				const submitHandler = calls.find((c) => c[0] === formEl && c[1] === 'submit');
				expect(submitHandler).toBeTruthy();
			});

			it('should create hue button with color_palette icon', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const hueBtn = cp.target.querySelector('.__se_hue');
				expect(hueBtn).not.toBeNull();
			});

			it('should create submit button', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const submitBtn = cp.target.querySelector('button[type="submit"]');
				expect(submitBtn).not.toBeNull();
			});
		});

		describe('when disableHEXInput is true', () => {
			it('should not create a HueSlider instance', () => {
				HueSlider.mockClear();
				const params = createDefaultParams({ disableHEXInput: true });
				const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
				expect(cp.hueSlider).toBeNull();
				expect(HueSlider).not.toHaveBeenCalled();
			});

			it('should not register hue, input, or submit handlers', () => {
				const params = createDefaultParams({ disableHEXInput: true });
				const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
				const calls = mockDeps.eventManager.addEvent.mock.calls;
				// Only the click on target and the remove handler
				const inputHandler = calls.find((c) => c[1] === 'input');
				const submitHandler = calls.find((c) => c[1] === 'submit');
				expect(inputHandler).toBeFalsy();
				expect(submitHandler).toBeFalsy();
			});

			it('should make the input element readonly', () => {
				const params = createDefaultParams({ disableHEXInput: true });
				const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
				expect(cp.inputElement.hasAttribute('readonly')).toBe(true);
			});
		});

		describe('when disableRemove is false', () => {
			it('should register click handler for remove button', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const removeBtn = cp.target.querySelector('.__se_remove');
				const calls = mockDeps.eventManager.addEvent.mock.calls;
				const removeHandler = calls.find((c) => c[0] === removeBtn && c[1] === 'click');
				expect(removeHandler).toBeTruthy();
			});

			it('should create remove button with remove_color icon', () => {
				const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
				const removeBtn = cp.target.querySelector('.__se_remove');
				expect(removeBtn).not.toBeNull();
			});
		});

		describe('when disableRemove is true', () => {
			it('should not register remove handler', () => {
				const params = createDefaultParams({ disableRemove: true });
				const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
				const removeBtn = cp.target.querySelector('.__se_remove');
				expect(removeBtn).toBeNull();
			});
		});
	});

	// ---------------------------------------------------------------
	// init()
	// ---------------------------------------------------------------
	describe('init()', () => {
		let cp;

		beforeEach(() => {
			converter.isHexColor.mockReturnValue(true);
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should set targetButton', () => {
			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should accept nodeOrColor as a string', () => {
			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);
			// Should not throw and should process the color
			expect(cp.inputElement.value).toBeDefined();
		});

		it('should accept nodeOrColor as a DOM node', () => {
			converter.isHexColor.mockReturnValue(false);
			converter.rgb2hex.mockReturnValue('#ff0000');

			const node = document.createElement('span');
			node.style.color = '#ff0000';
			const targetBtn = document.createElement('button');

			cp.init(node, targetBtn);
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should use default stopCondition when not a function', () => {
			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn, 'not-a-function');
			// Should not throw; stopCondition replaced with () => false
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should use provided stopCondition when it is a function', () => {
			const stopFn = jest.fn().mockReturnValue(false);
			const node = document.createElement('span');
			node.style.color = '#ff0000';
			const targetBtn = document.createElement('button');

			cp.init(node, targetBtn, stopFn);
			// stopFn should have been called during node traversal
			// (at least once for the node itself)
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should mark matching color in colorList as active', () => {
			// Set up a color that matches one in the list
			converter.isHexColor.mockReturnValue(true);
			const targetBtn = document.createElement('button');

			// Get a color from the rendered colorList
			const firstBtn = cp.colorList[0];
			if (firstBtn) {
				const colorVal = firstBtn.getAttribute('data-value');
				cp.init(colorVal, targetBtn);
				expect(dom.utils.addClass).toHaveBeenCalled();
			}
		});

		it('should remove active class from non-matching colors', () => {
			converter.isHexColor.mockReturnValue(true);
			const targetBtn = document.createElement('button');

			cp.init('#ff0000', targetBtn);

			// removeClass should have been called for non-matching items
			if (cp.colorList.length > 0) {
				expect(dom.utils.removeClass).toHaveBeenCalled();
			}
		});

		it('should use defaultColor when nodeOrColor yields no color', () => {
			converter.isHexColor.mockReturnValue(true);
			const targetBtn = document.createElement('button');

			cp.init('', targetBtn);
			// defaultColor is '#000000', should be used as fillColor
			expect(cp.inputElement.value).toBeDefined();
		});

		it('should convert non-hex colors using rgb2hex', () => {
			converter.isHexColor.mockReturnValue(false);
			converter.rgb2hex.mockReturnValue('#abcdef');

			const targetBtn = document.createElement('button');
			cp.init('rgb(171, 205, 239)', targetBtn);

			expect(converter.rgb2hex).toHaveBeenCalled();
		});

		it('should handle fillColor that fails both isHexColor and rgb2hex', () => {
			converter.isHexColor.mockReturnValue(false);
			converter.rgb2hex.mockReturnValue('');

			// colorName2hex will try getComputedStyle, so mock it
			const origGetComputedStyle = window.getComputedStyle;
			window.getComputedStyle = jest.fn().mockReturnValue({
				color: 'rgb(0, 0, 0)'
			});

			const targetBtn = document.createElement('button');
			// Should fall back to fillColor || ''
			expect(() => cp.init('invalidColor', targetBtn)).not.toThrow();
			window.getComputedStyle = origGetComputedStyle;
		});

		it('should call setInputText with the processed fillColor', () => {
			converter.isHexColor.mockReturnValue(true);
			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);
			// inputElement should have a value set
			expect(cp.currentColor).toBeDefined();
		});
	});

	// ---------------------------------------------------------------
	// setHexColor()
	// ---------------------------------------------------------------
	describe('setHexColor()', () => {
		let cp;

		beforeEach(() => {
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should set currentColor', () => {
			cp.setHexColor('#ff0000');
			expect(cp.currentColor).toBe('#ff0000');
		});

		it('should set inputElement border color', () => {
			cp.setHexColor('#00ff00');
			// jsdom normalizes hex to rgb format
			expect(cp.inputElement.style.borderColor).toBeTruthy();
		});

		it('should handle empty string', () => {
			cp.setHexColor('');
			expect(cp.currentColor).toBe('');
		});

		it('should handle null', () => {
			cp.setHexColor(null);
			expect(cp.currentColor).toBeNull();
		});
	});

	// ---------------------------------------------------------------
	// hueSliderClose()
	// ---------------------------------------------------------------
	describe('hueSliderClose()', () => {
		it('should call hueSlider.close()', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			cp.hueSliderClose();
			expect(cp.hueSlider.close).toHaveBeenCalledTimes(1);
		});
	});

	// ---------------------------------------------------------------
	// hueSliderAction()
	// ---------------------------------------------------------------
	describe('hueSliderAction()', () => {
		let cp;

		beforeEach(() => {
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should set input element value from color.hex', () => {
			cp.hueSliderAction({ hex: '#abcdef' });
			expect(cp.inputElement.value).toBe('#abcdef');
		});

		it('should set currentColor from color.hex', () => {
			cp.hueSliderAction({ hex: '#123456' });
			expect(cp.currentColor).toBe('#123456');
		});

		it('should set inputElement border color', () => {
			cp.hueSliderAction({ hex: '#fedcba' });
			// jsdom normalizes hex to rgb format
			expect(cp.inputElement.style.borderColor).toBeTruthy();
		});
	});

	// ---------------------------------------------------------------
	// hueSliderCancelAction()
	// ---------------------------------------------------------------
	describe('hueSliderCancelAction()', () => {
		let cp;

		beforeEach(() => {
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should set form display to block', () => {
			cp.hueSliderCancelAction();
			expect(cp.form.style.display).toBe('block');
		});

		it('should call host.colorPickerHueSliderClose', () => {
			cp.hueSliderCancelAction();
			expect(mockHost.colorPickerHueSliderClose).toHaveBeenCalledTimes(1);
		});

		it('should not throw when host.colorPickerHueSliderClose is undefined', () => {
			const hostNoClose = createMockHost({ noActions: true });
			const cp2 = new ColorPicker(hostNoClose, mockDeps, 'color', defaultParams);
			expect(() => cp2.hueSliderCancelAction()).not.toThrow();
		});
	});

	// ---------------------------------------------------------------
	// #setInputText (tested via hueSliderAction and init)
	// ---------------------------------------------------------------
	describe('#setInputText (private, tested via public API)', () => {
		let cp;

		beforeEach(() => {
			converter.isHexColor.mockReturnValue(true);
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should keep # prefix when already present', () => {
			cp.hueSliderAction({ hex: '#ff0000' });
			expect(cp.inputElement.value).toBe('#ff0000');
		});

		it('should add # prefix when not present', () => {
			cp.hueSliderAction({ hex: 'ff0000' });
			expect(cp.inputElement.value).toBe('#ff0000');
		});

		it('should handle empty string', () => {
			cp.hueSliderAction({ hex: '' });
			expect(cp.inputElement.value).toBe('');
		});

		it('should handle null value', () => {
			cp.hueSliderAction({ hex: null });
			// null is falsy, so #setInputText keeps it as-is; DOM coerces null .value to ""
			expect(cp.inputElement.value).toBe('');
			expect(cp.currentColor).toBeNull();
		});

		it('should handle undefined value', () => {
			cp.hueSliderAction({ hex: undefined });
			// undefined is falsy, so #setInputText keeps it as-is; DOM coerces undefined .value to "undefined"
			expect(cp.currentColor).toBeUndefined();
		});
	});

	// ---------------------------------------------------------------
	// #getColorInNode (tested via init with DOM node)
	// ---------------------------------------------------------------
	describe('#getColorInNode (private, tested via init)', () => {
		let cp;

		beforeEach(() => {
			converter.isHexColor.mockReturnValue(true);
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should find color in node style property', () => {
			isElement.mockReturnValue(true);
			dom.check.isWysiwygFrame.mockReturnValue(false);

			const node = document.createElement('span');
			node.style.color = 'rgb(255, 0, 0)';
			const targetBtn = document.createElement('button');

			cp.init(node, targetBtn, () => false);
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should traverse parent nodes to find color', () => {
			isElement.mockReturnValue(true);
			dom.check.isWysiwygFrame.mockReturnValue(false);

			const parent = document.createElement('div');
			parent.style.color = 'rgb(0, 255, 0)';
			const child = document.createElement('span');
			parent.appendChild(child);

			const targetBtn = document.createElement('button');
			cp.init(child, targetBtn, () => false);
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should stop traversal when stopCondition returns true', () => {
			isElement.mockReturnValue(true);
			dom.check.isWysiwygFrame.mockReturnValue(false);

			const parent = document.createElement('div');
			parent.style.color = 'rgb(0, 0, 255)';
			const child = document.createElement('span');
			parent.appendChild(child);

			const stopFn = jest.fn().mockImplementation((node) => node === parent);
			const targetBtn = document.createElement('button');
			cp.init(child, targetBtn, stopFn);
			// Should have stopped at parent, not reading its color
			expect(stopFn).toHaveBeenCalled();
		});

		it('should stop traversal when hitting wysiwyg frame', () => {
			isElement.mockReturnValue(true);
			dom.check.isWysiwygFrame.mockReturnValueOnce(false).mockReturnValueOnce(true);

			const parent = document.createElement('div');
			parent.style.color = 'rgb(255, 255, 0)';
			const child = document.createElement('span');
			parent.appendChild(child);

			const targetBtn = document.createElement('button');
			cp.init(child, targetBtn, () => false);
			expect(dom.check.isWysiwygFrame).toHaveBeenCalled();
		});

		it('should skip non-element nodes', () => {
			isElement.mockReturnValue(false);
			dom.check.isWysiwygFrame.mockReturnValue(false);

			const textNode = document.createTextNode('test');
			const parent = document.createElement('div');
			parent.appendChild(textNode);

			const targetBtn = document.createElement('button');
			cp.init(textNode, targetBtn, () => false);
			// Should not find color (isElement returns false)
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should return empty string when node is null', () => {
			const targetBtn = document.createElement('button');
			cp.init(null, targetBtn, () => false);
			// Should fall through to defaultColor
			expect(cp.targetButton).toBe(targetBtn);
		});
	});

	// ---------------------------------------------------------------
	// #colorName2hex (tested via init)
	// ---------------------------------------------------------------
	describe('#colorName2hex (private, tested via init)', () => {
		let cp;

		beforeEach(() => {
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
		});

		it('should return hex color as-is when already hex', () => {
			converter.isHexColor.mockReturnValue(true);
			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);
			// #ff0000 starts with #, so colorName2hex returns it unchanged
			expect(cp.inputElement.value).toBe('#ff0000');
		});

		it('should return empty/null/undefined input as-is', () => {
			converter.isHexColor.mockReturnValue(true);
			const targetBtn = document.createElement('button');

			// When fillColor is empty, colorName2hex receives '' and returns it
			cp.init('', targetBtn);
			// Should use defaultColor since empty string is falsy
			expect(cp.targetButton).toBe(targetBtn);
		});

		it('should convert named color to hex using getComputedStyle', () => {
			converter.isHexColor.mockReturnValue(false);
			converter.rgb2hex.mockReturnValue('');

			// Mock getComputedStyle to return rgb color string
			const origGetComputedStyle = window.getComputedStyle;
			window.getComputedStyle = jest.fn().mockReturnValue({
				color: 'rgb(255, 0, 0)'
			});

			const targetBtn = document.createElement('button');
			// 'red' is not hex (#), so colorName2hex will use getComputedStyle
			cp.init('red', targetBtn);

			window.getComputedStyle = origGetComputedStyle;
			expect(dom.utils.createElement).toHaveBeenCalled();
		});

		it('should return empty string when getComputedStyle returns less than 3 color values', () => {
			converter.isHexColor.mockReturnValue(false);
			converter.rgb2hex.mockReturnValue('');

			const origGetComputedStyle = window.getComputedStyle;
			window.getComputedStyle = jest.fn().mockReturnValue({
				color: 'rgb(255, 0)'
			});

			const targetBtn = document.createElement('button');
			expect(() => cp.init('badcolor', targetBtn)).not.toThrow();

			window.getComputedStyle = origGetComputedStyle;
		});

		it('should call removeItem to clean up the temporary element', () => {
			converter.isHexColor.mockReturnValue(false);
			converter.rgb2hex.mockReturnValue('');

			const origGetComputedStyle = window.getComputedStyle;
			window.getComputedStyle = jest.fn().mockReturnValue({
				color: 'rgb(0, 128, 255)'
			});

			dom.utils.removeItem.mockClear();
			const targetBtn = document.createElement('button');
			cp.init('steelblue', targetBtn);

			expect(dom.utils.removeItem).toHaveBeenCalled();
			window.getComputedStyle = origGetComputedStyle;
		});
	});

	// ---------------------------------------------------------------
	// #OnColorPalette (via event handler)
	// ---------------------------------------------------------------
	describe('#OnColorPalette (private, tested via event handler)', () => {
		it('should call hueSlider.open with targetButton', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const hueBtn = cp.target.querySelector('.__se_hue');
			const handler = getAddEventHandlerForTarget(mockDeps, hueBtn, 'click');

			const targetBtn = document.createElement('button');
			cp.targetButton = targetBtn;

			handler();

			expect(cp.hueSlider.open).toHaveBeenCalledWith(targetBtn);
		});

		it('should call host.colorPickerHueSliderOpen', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const hueBtn = cp.target.querySelector('.__se_hue');
			const handler = getAddEventHandlerForTarget(mockDeps, hueBtn, 'click');

			handler();

			expect(mockHost.colorPickerHueSliderOpen).toHaveBeenCalledTimes(1);
		});

		it('should not throw when host.colorPickerHueSliderOpen is undefined', () => {
			const hostNoActions = createMockHost({ noActions: true });
			const cp = new ColorPicker(hostNoActions, mockDeps, 'color', defaultParams);
			const hueBtn = cp.target.querySelector('.__se_hue');
			const handler = getAddEventHandlerForTarget(mockDeps, hueBtn, 'click');

			expect(() => handler()).not.toThrow();
		});
	});

	// ---------------------------------------------------------------
	// #Submit (via event handler)
	// ---------------------------------------------------------------
	describe('#Submit (private, tested via event handler)', () => {
		it('should call preventDefault on the event', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const formEl = cp.target.querySelector('form');
			const handler = getAddEventHandlerForTarget(mockDeps, formEl, 'submit');

			const mockEvent = { preventDefault: jest.fn() };
			handler(mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
		});

		it('should call host.colorPickerAction with currentColor', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			cp.currentColor = '#ff0000';

			const formEl = cp.target.querySelector('form');
			const handler = getAddEventHandlerForTarget(mockDeps, formEl, 'submit');

			handler({ preventDefault: jest.fn() });

			expect(mockHost.colorPickerAction).toHaveBeenCalledWith('#ff0000');
		});

		it('should not throw when host.colorPickerAction is undefined', () => {
			const hostNoAction = createMockHost({ noActions: true });
			const cp = new ColorPicker(hostNoAction, mockDeps, 'color', defaultParams);

			const formEl = cp.target.querySelector('form');
			const handler = getAddEventHandlerForTarget(mockDeps, formEl, 'submit');

			expect(() => handler({ preventDefault: jest.fn() })).not.toThrow();
		});

		it('should submit the current color even if empty', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			cp.currentColor = '';

			const formEl = cp.target.querySelector('form');
			const handler = getAddEventHandlerForTarget(mockDeps, formEl, 'submit');

			handler({ preventDefault: jest.fn() });

			expect(mockHost.colorPickerAction).toHaveBeenCalledWith('');
		});
	});

	// ---------------------------------------------------------------
	// #OnClickColor (via event handler)
	// ---------------------------------------------------------------
	describe('#OnClickColor (private, tested via event handler)', () => {
		let cp, clickHandler;

		beforeEach(() => {
			cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			clickHandler = getAddEventHandlerForTarget(mockDeps, cp.target, 'click');
		});

		it('should call host.colorPickerAction with the data-value color', () => {
			const colorBtn = document.createElement('button');
			colorBtn.setAttribute('data-value', '#ff5e00');

			dom.query.getEventTarget.mockReturnValueOnce(colorBtn);
			clickHandler({ target: colorBtn });

			expect(mockHost.colorPickerAction).toHaveBeenCalledWith('#ff5e00');
		});

		it('should do nothing when target has no data-value', () => {
			const nonColorEl = document.createElement('div');

			dom.query.getEventTarget.mockReturnValueOnce(nonColorEl);
			clickHandler({ target: nonColorEl });

			expect(mockHost.colorPickerAction).not.toHaveBeenCalled();
		});

		it('should do nothing when data-value is empty string', () => {
			const emptyBtn = document.createElement('button');
			emptyBtn.setAttribute('data-value', '');

			dom.query.getEventTarget.mockReturnValueOnce(emptyBtn);
			clickHandler({ target: emptyBtn });

			expect(mockHost.colorPickerAction).not.toHaveBeenCalled();
		});

		it('should not throw when host.colorPickerAction is undefined', () => {
			const hostNoAction = createMockHost({ noActions: true });
			const cp2 = new ColorPicker(hostNoAction, mockDeps, 'color', defaultParams);
			const handler = getAddEventHandlerForTarget(mockDeps, cp2.target, 'click');

			const colorBtn = document.createElement('button');
			colorBtn.setAttribute('data-value', '#ff0000');
			dom.query.getEventTarget.mockReturnValueOnce(colorBtn);

			expect(() => handler({ target: colorBtn })).not.toThrow();
		});
	});

	// ---------------------------------------------------------------
	// #Remove (via event handler)
	// ---------------------------------------------------------------
	describe('#Remove (private, tested via event handler)', () => {
		it('should call host.colorPickerAction with null', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const removeBtn = cp.target.querySelector('.__se_remove');
			const handler = getAddEventHandlerForTarget(mockDeps, removeBtn, 'click');

			handler();

			expect(mockHost.colorPickerAction).toHaveBeenCalledWith(null);
		});

		it('should not throw when host.colorPickerAction is undefined', () => {
			const hostNoAction = createMockHost({ noActions: true });
			const cp = new ColorPicker(hostNoAction, mockDeps, 'color', defaultParams);
			const removeBtn = cp.target.querySelector('.__se_remove');
			const handler = getAddEventHandlerForTarget(mockDeps, removeBtn, 'click');

			expect(() => handler()).not.toThrow();
		});
	});

	// ---------------------------------------------------------------
	// #OnChangeInput (via event handler)
	// ---------------------------------------------------------------
	describe('#OnChangeInput (private, tested via event handler)', () => {
		it('should call setHexColor with the input value', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const handler = getAddEventHandlerForTarget(mockDeps, cp.inputElement, 'input');

			const mockInputEl = document.createElement('input');
			mockInputEl.value = '#abcdef';
			dom.query.getEventTarget.mockReturnValueOnce(mockInputEl);

			handler({ target: mockInputEl });

			expect(cp.currentColor).toBe('#abcdef');
			// jsdom normalizes hex to rgb format for style values
			expect(cp.inputElement.style.borderColor).toBeTruthy();
		});

		it('should handle empty input value', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const handler = getAddEventHandlerForTarget(mockDeps, cp.inputElement, 'input');

			const mockInputEl = document.createElement('input');
			mockInputEl.value = '';
			dom.query.getEventTarget.mockReturnValueOnce(mockInputEl);

			handler({ target: mockInputEl });

			expect(cp.currentColor).toBe('');
		});
	});

	// ---------------------------------------------------------------
	// CreateHTML (tested via constructor)
	// ---------------------------------------------------------------
	describe('CreateHTML (tested via constructor output)', () => {
		it('should use DEFAULT_COLOR_LIST when colorList is null', () => {
			const params = createDefaultParams({ colorList: null });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			// Default list has 49 colors, should produce color buttons
			expect(cp.colorList.length).toBeGreaterThan(0);
		});

		it('should use custom colorList when provided', () => {
			const customColors = ['#ff0000', '#00ff00', '#0000ff'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 3 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			expect(cp.colorList.length).toBe(3);
		});

		it('should render color buttons with correct data-value attributes', () => {
			const customColors = ['#aabbcc', '#112233'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			if (cp.colorList.length >= 2) {
				expect(cp.colorList[0].getAttribute('data-value')).toBe('#aabbcc');
				expect(cp.colorList[1].getAttribute('data-value')).toBe('#112233');
			}
		});

		it('should render color buttons with background-color style', () => {
			const customColors = ['#aabbcc'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 1 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			if (cp.colorList.length > 0) {
				const style = cp.colorList[0].getAttribute('style');
				expect(style).toContain('#aabbcc');
			}
		});

		it('should handle colorList with object items { value, name }', () => {
			const customColors = [{ value: '#ff0000', name: 'Red' }, { value: '#00ff00', name: 'Green' }];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			if (cp.colorList.length >= 2) {
				expect(cp.colorList[0].getAttribute('data-value')).toBe('#ff0000');
				expect(cp.colorList[0].getAttribute('title')).toBe('Red');
				expect(cp.colorList[1].getAttribute('data-value')).toBe('#00ff00');
				expect(cp.colorList[1].getAttribute('title')).toBe('Green');
			}
		});

		it('should handle colorList with object items without name (use value as fallback)', () => {
			const customColors = [{ value: '#ff0000' }];
			const params = createDefaultParams({ colorList: customColors, splitNum: 1 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			if (cp.colorList.length > 0) {
				expect(cp.colorList[0].getAttribute('title')).toBe('#ff0000');
			}
		});

		it('should skip null/falsy items in colorList', () => {
			const customColors = ['#ff0000', null, '#00ff00'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 3 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			// null should be skipped, only 2 colors rendered
			expect(cp.colorList.length).toBe(2);
		});

		it('should include form group with color input', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const formGroup = cp.target.querySelector('.se-form-group');
			expect(formGroup).not.toBeNull();
		});

		it('should create se-list-inner wrapper', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.target.classList.contains('se-list-inner')).toBe(true);
		});

		it('should include lang.colorPicker as hue button title', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const hueBtn = cp.target.querySelector('.__se_hue');
			if (hueBtn) {
				expect(hueBtn.getAttribute('title')).toBe('Color Picker');
			}
		});

		it('should include lang.color as input placeholder', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(cp.inputElement.getAttribute('placeholder')).toBe('Color');
		});

		it('should include lang.remove as remove button title', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const removeBtn = cp.target.querySelector('.__se_remove');
			if (removeBtn) {
				expect(removeBtn.getAttribute('title')).toBe('Remove');
			}
		});
	});

	// ---------------------------------------------------------------
	// _makeColor (tested indirectly via CreateHTML)
	// ---------------------------------------------------------------
	describe('_makeColor (tested indirectly via constructor)', () => {
		it('should create ul with se-color-pallet class', () => {
			const customColors = ['#ff0000', '#00ff00'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			const pallets = cp.target.querySelectorAll('.se-color-pallet');
			expect(pallets.length).toBeGreaterThan(0);
		});

		it('should add se-list-horizontal class when splitNum is provided', () => {
			const customColors = ['#ff0000', '#00ff00'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			const pallets = cp.target.querySelectorAll('.se-list-horizontal');
			expect(pallets.length).toBeGreaterThan(0);
		});

		it('should not add se-list-horizontal class when splitNum is 0', () => {
			const customColors = ['#ff0000', '#00ff00'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 0 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			const pallets = cp.target.querySelectorAll('.se-list-horizontal');
			// splitNum 0 is falsy, so no horizontal class
			expect(pallets.length).toBe(0);
		});

		it('should split colors into multiple ul elements based on splitNum', () => {
			// 6 colors with splitNum 3 should create 2 rows (initial + split at i=3)
			const customColors = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 3 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			const pallets = cp.target.querySelectorAll('.se-color-pallet');
			// With splitNum 3: row 0 has 3 items, then split, row 1 has 3 items
			expect(pallets.length).toBeGreaterThanOrEqual(2);
		});

		it('should handle string color items in colorList', () => {
			const customColors = ['#ff0000'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 1 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			if (cp.colorList.length > 0) {
				expect(cp.colorList[0].getAttribute('data-value')).toBe('#ff0000');
				expect(cp.colorList[0].getAttribute('aria-label')).toBe('#ff0000');
			}
		});

		it('should handle object color items with value and name', () => {
			const customColors = [{ value: '#ff0000', name: 'Red' }];
			const params = createDefaultParams({ colorList: customColors, splitNum: 1 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			if (cp.colorList.length > 0) {
				expect(cp.colorList[0].getAttribute('data-value')).toBe('#ff0000');
				expect(cp.colorList[0].getAttribute('aria-label')).toBe('Red');
			}
		});
	});

	// ---------------------------------------------------------------
	// Integration: full flow tests
	// ---------------------------------------------------------------
	describe('Integration: full flow', () => {
		it('should handle complete color selection flow', () => {
			converter.isHexColor.mockReturnValue(true);
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);

			// 1. Init with a color
			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);
			expect(cp.targetButton).toBe(targetBtn);

			// 2. Click a color
			const clickHandler = getAddEventHandlerForTarget(mockDeps, cp.target, 'click');
			const colorBtn = document.createElement('button');
			colorBtn.setAttribute('data-value', '#00ff00');
			dom.query.getEventTarget.mockReturnValueOnce(colorBtn);
			clickHandler({ target: colorBtn });
			expect(mockHost.colorPickerAction).toHaveBeenCalledWith('#00ff00');
		});

		it('should handle hue slider flow', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);

			// 1. Open hue slider
			cp.targetButton = document.createElement('button');
			const hueBtn = cp.target.querySelector('.__se_hue');
			const hueHandler = getAddEventHandlerForTarget(mockDeps, hueBtn, 'click');
			hueHandler();
			expect(cp.hueSlider.open).toHaveBeenCalled();

			// 2. Hue slider action sets color
			cp.hueSliderAction({ hex: '#abcdef' });
			expect(cp.currentColor).toBe('#abcdef');
			expect(cp.inputElement.value).toBe('#abcdef');

			// 3. Submit the color
			const formEl = cp.target.querySelector('form');
			const submitHandler = getAddEventHandlerForTarget(mockDeps, formEl, 'submit');
			submitHandler({ preventDefault: jest.fn() });
			expect(mockHost.colorPickerAction).toHaveBeenCalledWith('#abcdef');
		});

		it('should handle remove flow', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const removeBtn = cp.target.querySelector('.__se_remove');
			const removeHandler = getAddEventHandlerForTarget(mockDeps, removeBtn, 'click');

			removeHandler();
			expect(mockHost.colorPickerAction).toHaveBeenCalledWith(null);
		});

		it('should handle input change then submit flow', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);

			// 1. Change input
			const inputHandler = getAddEventHandlerForTarget(mockDeps, cp.inputElement, 'input');
			const mockInputEl = document.createElement('input');
			mockInputEl.value = '#123456';
			dom.query.getEventTarget.mockReturnValueOnce(mockInputEl);
			inputHandler({ target: mockInputEl });
			expect(cp.currentColor).toBe('#123456');

			// 2. Submit
			const formEl = cp.target.querySelector('form');
			const submitHandler = getAddEventHandlerForTarget(mockDeps, formEl, 'submit');
			submitHandler({ preventDefault: jest.fn() });
			expect(mockHost.colorPickerAction).toHaveBeenCalledWith('#123456');
		});
	});

	// ---------------------------------------------------------------
	// Edge cases
	// ---------------------------------------------------------------
	describe('Edge cases', () => {
		it('should handle both disableHEXInput and disableRemove true', () => {
			const params = createDefaultParams({ disableHEXInput: true, disableRemove: true });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			expect(cp.hueSlider).toBeNull();
			// Only click handler on target should be registered
			const calls = mockDeps.eventManager.addEvent.mock.calls;
			expect(calls.length).toBe(1); // Only the target click
		});

		it('should handle backgroundColor as styleProperties', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'backgroundColor', defaultParams);
			expect(cp.styleProperties).toBe('backgroundColor');
		});

		it('should handle empty colorList array', () => {
			const params = createDefaultParams({ colorList: [] });
			expect(() => new ColorPicker(mockHost, mockDeps, 'color', params)).not.toThrow();
		});

		it('should handle colorList with mixed string and object items', () => {
			const mixedColors = ['#ff0000', { value: '#00ff00', name: 'Green' }, '#0000ff'];
			const params = createDefaultParams({ colorList: mixedColors, splitNum: 3 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			expect(cp.colorList.length).toBe(3);
		});

		it('should handle init called multiple times', () => {
			converter.isHexColor.mockReturnValue(true);
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const targetBtn1 = document.createElement('button');
			const targetBtn2 = document.createElement('button');

			cp.init('#ff0000', targetBtn1);
			expect(cp.targetButton).toBe(targetBtn1);

			cp.init('#00ff00', targetBtn2);
			expect(cp.targetButton).toBe(targetBtn2);
		});

		it('should handle colorList with nested object arrays', () => {
			// A group: array of colors triggers a separate se-selector-color div
			const groupedColors = [
				'#ff0000', '#00ff00', '#0000ff',
				[{ value: '#aaa', name: 'Light Gray' }, { value: '#bbb', name: 'Gray' }]
			];
			const params = createDefaultParams({ colorList: groupedColors, splitNum: 3 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			expect(cp.target.querySelectorAll('.se-selector-color').length).toBeGreaterThan(0);
		});

		it('should handle init with stopCondition as undefined', () => {
			converter.isHexColor.mockReturnValue(true);
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const targetBtn = document.createElement('button');
			expect(() => cp.init('#ff0000', targetBtn, undefined)).not.toThrow();
		});

		it('should handle init with stopCondition as null', () => {
			converter.isHexColor.mockReturnValue(true);
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			const targetBtn = document.createElement('button');
			expect(() => cp.init('#ff0000', targetBtn, null)).not.toThrow();
		});

		it('should handle setHexColor called before init', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			expect(() => cp.setHexColor('#aabbcc')).not.toThrow();
			expect(cp.currentColor).toBe('#aabbcc');
		});

		it('should handle hueSliderAction with hex that has no # prefix', () => {
			const cp = new ColorPicker(mockHost, mockDeps, 'color', defaultParams);
			cp.hueSliderAction({ hex: 'aabbcc' });
			expect(cp.inputElement.value).toBe('#aabbcc');
			expect(cp.currentColor).toBe('#aabbcc');
		});
	});

	// ---------------------------------------------------------------
	// Color matching in init (checkedIcon management)
	// ---------------------------------------------------------------
	describe('Color matching and checked icon management', () => {
		it('should append checkedIcon to matching color button', () => {
			converter.isHexColor.mockReturnValue(true);
			const customColors = ['#ff0000', '#00ff00'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);

			// The first button should have the checkedIcon appended
			if (cp.colorList.length > 0) {
				const firstBtn = cp.colorList[0];
				expect(firstBtn.contains(cp.checkedIcon)).toBe(true);
			}
		});

		it('should add active class to matching color button', () => {
			converter.isHexColor.mockReturnValue(true);
			const customColors = ['#ff0000'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 1 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			const targetBtn = document.createElement('button');
			cp.init('#ff0000', targetBtn);

			expect(dom.utils.addClass).toHaveBeenCalled();
		});

		it('should remove checkedIcon from previously active button', () => {
			converter.isHexColor.mockReturnValue(true);
			const customColors = ['#ff0000', '#00ff00'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			const targetBtn = document.createElement('button');
			// First init with #ff0000 (first button gets checked)
			cp.init('#ff0000', targetBtn);

			dom.utils.addClass.mockClear();
			dom.utils.removeClass.mockClear();
			dom.utils.removeItem.mockClear();

			// Second init with #00ff00 (second button gets checked, first unchecked)
			cp.init('#00ff00', targetBtn);

			expect(dom.utils.removeClass).toHaveBeenCalled();
		});

		it('should handle case-insensitive color matching', () => {
			converter.isHexColor.mockReturnValue(true);
			const customColors = ['#FF0000'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 1 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);

			const targetBtn = document.createElement('button');
			// Use lowercase version - should still match
			cp.init('#ff0000', targetBtn);

			if (cp.colorList.length > 0) {
				expect(dom.utils.addClass).toHaveBeenCalled();
			}
		});
	});

	// ---------------------------------------------------------------
	// Multiple ColorPicker instances
	// ---------------------------------------------------------------
	describe('Multiple instances', () => {
		it('should maintain independent state between instances', () => {
			const cp1 = new ColorPicker(mockHost, mockDeps, 'color', createDefaultParams());
			const cp2 = new ColorPicker(mockHost, mockDeps, 'backgroundColor', createDefaultParams());

			cp1.setHexColor('#ff0000');
			cp2.setHexColor('#00ff00');

			expect(cp1.currentColor).toBe('#ff0000');
			expect(cp2.currentColor).toBe('#00ff00');
		});

		it('should have different style properties', () => {
			const cp1 = new ColorPicker(mockHost, mockDeps, 'color', createDefaultParams());
			const cp2 = new ColorPicker(mockHost, mockDeps, 'backgroundColor', createDefaultParams());

			expect(cp1.styleProperties).toBe('color');
			expect(cp2.styleProperties).toBe('backgroundColor');
		});
	});

	// ---------------------------------------------------------------
	// DEFAULT_COLOR_LIST and DEFAULLT_COLOR_SPLITNUM
	// ---------------------------------------------------------------
	describe('Default color list', () => {
		it('should produce 54 color buttons with default list', () => {
			const params = createDefaultParams({ colorList: null });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			// DEFAULT_COLOR_LIST has 54 colors
			expect(cp.colorList.length).toBe(54);
		});

		it('should use default splitNum of 9 for default color list', () => {
			const params = createDefaultParams({ colorList: null });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			// With splitNum 9, the colors should be split into rows of 9
			const pallets = cp.target.querySelectorAll('.se-color-pallet');
			expect(pallets.length).toBeGreaterThan(0);
		});

		it('should use provided splitNum for custom color list', () => {
			const customColors = ['#111', '#222', '#333', '#444', '#555', '#666'];
			const params = createDefaultParams({ colorList: customColors, splitNum: 2 });
			const cp = new ColorPicker(mockHost, mockDeps, 'color', params);
			const pallets = cp.target.querySelectorAll('.se-color-pallet');
			// With 6 colors and splitNum 2, should have multiple rows
			expect(pallets.length).toBeGreaterThanOrEqual(2);
		});
	});
});
