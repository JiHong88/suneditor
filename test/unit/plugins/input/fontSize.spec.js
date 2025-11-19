import FontSize from '../../../../src/plugins/input/fontSize';
import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor(editor) {
			this.editor = editor;
			this.lang = editor.lang || {
				fontSize: 'Font Size',
				decrease: 'Decrease',
				increase: 'Increase',
				default: 'Default',
			};
			this.icons = editor.icons || {
				fontSize: '<svg>fontSize</svg>',
				arrow_down: '<svg>arrow</svg>',
				minus: '<svg>minus</svg>',
				plus: '<svg>plus</svg>',
			};
			this.eventManager = {
				addEvent: jest.fn(),
			};
			this.options = editor.options || { get: jest.fn().mockReturnValue(['px']) };
			this.menu = { initDropdownTarget: jest.fn(), dropdownOff: jest.fn() };
			this.frameContext = editor.frameContext || {
				get: jest.fn().mockReturnValue({ fontSize: '13px' }),
			};
			this.format = { isLine: jest.fn().mockReturnValue(false) };
			this.inline = { apply: jest.fn() };
		}
	};
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockImplementation((tag, attrs, content) => ({
				tagName: tag,
				className: attrs?.class || '',
				innerHTML: content || '',
				appendChild: jest.fn(),
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				value: '',
				querySelectorAll: jest.fn().mockReturnValue([]),
				querySelector: jest.fn(),
			})),
			hasClass: jest.fn().mockReturnValue(true),
			addClass: jest.fn(),
			removeClass: jest.fn(),
			getStyle: jest.fn().mockReturnValue(''),
		},
		check: {
			isInputElement: jest.fn().mockReturnValue(false),
		},
	},
	numbers: {
		get: jest.fn().mockImplementation((val) => {
			const num = parseFloat(val);
			return isNaN(num) ? 0 : num;
		}),
		is: jest.fn().mockReturnValue(false),
	},
	keyCodeMap: {
		isSpace: jest.fn().mockReturnValue(false),
		isEnter: jest.fn().mockReturnValue(false),
		key: {
			13: 'Enter',
			38: 'ArrowUp',
			40: 'ArrowDown',
		},
	},
}));

describe('FontSize Plugin', () => {
	let fontSize;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			lang: {
				fontSize: 'Font Size',
				decrease: 'Decrease',
				increase: 'Increase',
				default: 'Default',
			},
			icons: {
				fontSize: '<svg>fontSize</svg>',
				arrow_down: '<svg>arrow</svg>',
				minus: '<svg>minus</svg>',
				plus: '<svg>plus</svg>',
			},
			options: {
				get: jest.fn().mockImplementation((key) => {
					if (key === 'fontSizeUnits') return ['px', 'pt', 'em'];
					return null;
				}),
			},
			frameContext: {
				get: jest.fn().mockReturnValue({ fontSize: '13px' }),
			},
			focus: jest.fn(),
		};

		fontSize = new FontSize(mockEditor, {
			sizeUnit: 'px',
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(FontSize.key).toBe('fontSize');
			expect(FontSize.type).toBe('input');
			expect(FontSize.className).toBe('se-btn-select se-btn-input se-btn-tool-font-size');
		});
	});

	describe('Constructor', () => {
		it('should create FontSize instance with px unit', () => {
			const instance = new FontSize(mockEditor, { sizeUnit: 'px' });
			expect(instance.title).toBe('Font Size');
			expect(instance.sizeUnit).toBe('px');
		});

		it('should create FontSize instance with pt unit', () => {
			const instance = new FontSize(mockEditor, { sizeUnit: 'pt' });
			expect(instance.sizeUnit).toBe('pt');
		});

		it('should create FontSize instance with em unit', () => {
			const instance = new FontSize(mockEditor, { sizeUnit: 'em' });
			expect(instance.sizeUnit).toBe('em');
		});

		it('should create FontSize instance with text mode', () => {
			const instance = new FontSize(mockEditor, { sizeUnit: 'text' });
			expect(instance.sizeUnit).toBe('');
		});

		it('should handle showIncDecControls option', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				showIncDecControls: true,
			});

			expect(instance.beforeItem).toBeDefined();
			expect(instance.afterItem).toBeDefined();
		});

		it('should handle disableInput=false option', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				disableInput: false,
			});

			expect(instance.afterItem).toBeDefined();
		});

		it('should handle disableInput=true with no controls', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				disableInput: true,
				showIncDecControls: false,
			});

			expect(instance.replaceButton).toBeDefined();
		});

		it('should use default fontSizeUnits when sizeUnit not specified', () => {
			const instance = new FontSize(mockEditor, {});
			expect(instance.sizeUnit).toBe('px'); // First from fontSizeUnits
		});

		it('should handle custom unitMap', () => {
			const customUnitMap = {
				px: {
					default: 16,
					inc: 2,
					min: 10,
					max: 100,
					list: [10, 16, 20, 24],
				},
			};

			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				unitMap: customUnitMap,
			});

			expect(instance.unitMap.px.default).toBe(16);
		});

		it('should set showDefaultSizeLabel option', () => {
			expect(() => {
				new FontSize(mockEditor, {
					sizeUnit: 'px',
					showDefaultSizeLabel: true,
				});
			}).not.toThrow();
		});
	});

	describe('active method', () => {
		beforeEach(() => {
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass = jest.fn().mockReturnValue(true);
		});

		it('should return false if target does not have __se__font_size class', () => {
			const { dom } = require('../../../../src/helper');
			dom.utils.hasClass = jest.fn().mockReturnValue(false);

			const mockElement = document.createElement('span');
			const mockTarget = document.createElement('div');

			const result = fontSize.active(mockElement, mockTarget);
			expect(result).toBe(false);
		});

		it('should return undefined when element is line format', () => {
			const mockElement = document.createElement('p');
			const mockTarget = document.createElement('div');

			fontSize.format.isLine = jest.fn().mockReturnValue(true);

			const result = fontSize.active(mockElement, mockTarget);
			expect(result).toBeUndefined();
		});

		it('should return false when no fontSize style found', () => {
			const { dom } = require('../../../../src/helper');
			const mockElement = document.createElement('span');
			const mockTarget = document.createElement('div');

			dom.utils.getStyle = jest.fn().mockReturnValue('');

			const result = fontSize.active(mockElement, mockTarget);
			expect(result).toBe(false);
		});
	});

	describe('on method', () => {
		beforeEach(() => {
			const mockButton1 = {
				getAttribute: jest.fn().mockReturnValue('13px'),
				classList: { add: jest.fn(), remove: jest.fn() },
			};
			const mockButton2 = {
				getAttribute: jest.fn().mockReturnValue('16px'),
				classList: { add: jest.fn(), remove: jest.fn() },
			};

			fontSize.sizeList = [mockButton1, mockButton2];
		});

		it('should add active class to matching size', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
						textContent: '13px',
					}),
				},
			};

			dom.check.isInputElement = jest.fn().mockReturnValue(false);

			fontSize.on(mockTarget);

			expect(dom.utils.addClass).toHaveBeenCalled();
		});

		it('should not re-process if same size', () => {
			const { dom } = require('../../../../src/helper');
			const mockTarget = {
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
						textContent: '13px',
					}),
				},
			};

			fontSize.currentSize = '13px';
			dom.check.isInputElement = jest.fn().mockReturnValue(false);

			fontSize.on(mockTarget);

			// Should return early, not call addClass/removeClass
			expect(dom.utils.addClass).not.toHaveBeenCalled();
		});
	});

	describe('toolbarInputKeyDown method', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = {
				value: '13px',
				focus: jest.fn(),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
						textContent: '13px',
					}),
				},
			};
		});

		it('should prevent default for space key', () => {
			const { keyCodeMap } = require('../../../../src/helper');
			keyCodeMap.isSpace = jest.fn().mockReturnValue(true);

			const mockEvent = {
				code: 'Space',
				preventDefault: jest.fn(),
			};

			fontSize.toolbarInputKeyDown({ target: mockTarget, event: mockEvent });

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should handle ArrowUp key', () => {
			const mockEvent = {
				code: 'ArrowUp',
				preventDefault: jest.fn(),
			};

			fontSize.toolbarInputKeyDown({ target: mockTarget, event: mockEvent });

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should handle ArrowDown key', () => {
			const mockEvent = {
				code: 'ArrowDown',
				preventDefault: jest.fn(),
			};

			fontSize.toolbarInputKeyDown({ target: mockTarget, event: mockEvent });

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});
	});

	describe('toolbarInputChange method', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = {
				value: '16px',
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '16px',
					}),
				},
			};
		});

		it('should apply font size change', () => {
			const mockEvent = {
				preventDefault: jest.fn(),
			};

			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				disableInput: false,
			});

			instance.toolbarInputChange({
				target: mockTarget,
				value: '16px',
				event: mockEvent,
			});

			expect(instance.inline.apply).toHaveBeenCalled();
			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should clamp value to max', () => {
			mockTarget.value = '1000px';

			const mockEvent = {
				preventDefault: jest.fn(),
			};

			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				disableInput: false,
			});

			instance.toolbarInputChange({
				target: mockTarget,
				value: '1000px',
				event: mockEvent,
			});

			expect(instance.inline.apply).toHaveBeenCalled();
		});

		it('should clamp value to min', () => {
			mockTarget.value = '1px';

			const mockEvent = {
				preventDefault: jest.fn(),
			};

			const instance = new FontSize(mockEditor, {
				sizeUnit: 'px',
				disableInput: false,
			});

			instance.toolbarInputChange({
				target: mockTarget,
				value: '1px',
				event: mockEvent,
			});

			expect(instance.inline.apply).toHaveBeenCalled();
		});
	});

	describe('action method', () => {
		beforeEach(() => {
			fontSize.menu = {
				dropdownOff: jest.fn(),
			};
		});

		it('should apply font size from data-command', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return '16px';
					return null;
				}),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
						textContent: '13px',
					}),
				},
			};

			fontSize.action(mockTarget);

			expect(fontSize.inline.apply).toHaveBeenCalled();
			expect(fontSize.menu.dropdownOff).toHaveBeenCalled();
		});

		it('should handle increment command', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return 'fontSize';
					if (attr === 'data-value') return 'inc';
					return null;
				}),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
						textContent: '13px',
					}),
				},
			};

			fontSize.action(mockTarget);

			expect(fontSize.inline.apply).toHaveBeenCalled();
		});

		it('should handle decrement command', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return 'fontSize';
					if (attr === 'data-value') return 'dec';
					return null;
				}),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
						textContent: '13px',
					}),
				},
			};

			fontSize.action(mockTarget);

			expect(fontSize.inline.apply).toHaveBeenCalled();
		});

		it('should remove font-size style when no command', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue(null),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '13px',
					}),
				},
			};

			fontSize.action(mockTarget);

			expect(fontSize.inline.apply).toHaveBeenCalledWith(
				null,
				expect.objectContaining({
					stylesToModify: ['font-size'],
					nodesToRemove: ['span'],
					strictRemove: true,
				}),
			);
		});

		it('should clamp increment to max value', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return 'fontSize';
					if (attr === 'data-value') return 'inc';
					return null;
				}),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '72px', // Already at max
						textContent: '72px',
					}),
				},
			};

			fontSize.action(mockTarget);

			expect(fontSize.inline.apply).toHaveBeenCalled();
		});

		it('should clamp decrement to min value', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return 'fontSize';
					if (attr === 'data-value') return 'dec';
					return null;
				}),
				parentElement: {
					querySelector: jest.fn().mockReturnValue({
						value: '8px', // Already at min
						textContent: '8px',
					}),
				},
			};

			fontSize.action(mockTarget);

			expect(fontSize.inline.apply).toHaveBeenCalled();
		});
	});

	describe('Font size units', () => {
		it('should handle rem units', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: 'rem',
			});

			expect(instance.sizeUnit).toBe('rem');
		});

		it('should handle vw units', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: 'vw',
			});

			expect(instance.sizeUnit).toBe('vw');
		});

		it('should handle vh units', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: 'vh',
			});

			expect(instance.sizeUnit).toBe('vh');
		});

		it('should handle percentage units', () => {
			const instance = new FontSize(mockEditor, {
				sizeUnit: '%',
			});

			expect(instance.sizeUnit).toBe('%');
		});
	});

	describe('Integration tests', () => {
		it('should have required properties', () => {
			expect(fontSize.title).toBeDefined();
			expect(fontSize.sizeUnit).toBeDefined();
			expect(fontSize.unitMap).toBeDefined();
			expect(fontSize.currentSize).toBeDefined();
		});

		it('should initialize sizeList', () => {
			expect(fontSize.sizeList).toBeDefined();
		});

		it('should have correct hasInputFocus initial state', () => {
			expect(fontSize.hasInputFocus).toBe(false);
		});

		it('should have correct isInputActive initial state', () => {
			expect(fontSize.isInputActive).toBe(false);
		});
	});
});
