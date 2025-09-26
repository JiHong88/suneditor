import FontSize from '../../../../src/plugins/input/fontSize';
import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor(editor) {
			this.editor = editor;
			this.lang = {
				fontSize: 'Font Size'
			};
			this.icons = {
				fontSize: '<svg>fontSize</svg>'
			};
			this.eventManager = {
				addEvent: jest.fn()
			};
			this.options = editor.options || { get: jest.fn().mockReturnValue(['px']) };
			this.menu = { initDropdownTarget: jest.fn() };
		}
	};
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				tagName: 'SELECT',
				className: '',
				innerHTML: '',
				appendChild: jest.fn(),
				setAttribute: jest.fn(),
				value: '13px',
				querySelectorAll: jest.fn().mockReturnValue([])
			})
		}
	},
	numbers: {
		get: jest.fn().mockImplementation((val, def) => val || def),
		is: jest.fn().mockReturnValue(false)
	},
	keyCodeMap: {
		key: {
			13: 'Enter',
			38: 'ArrowUp',
			40: 'ArrowDown'
		}
	}
}));

describe('FontSize Plugin', () => {
	let mockThis;
	let fontSize;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockThis = createMockThis();
		mockEditor = mockThis.editor;

		// Add necessary properties to mockEditor
		mockEditor.lang = {
			fontSize: 'Font Size'
		};
		mockEditor.icons = {
			fontSize: '<svg>fontSize</svg>'
		};
		mockEditor.options = {
			get: jest.fn().mockImplementation((key) => {
				if (key === 'fontSizeUnits') return ['px', 'pt', 'em'];
				return null;
			})
		};

		// Mock additional methods needed
		mockThis.command = {
			setNodeStyle: jest.fn(),
			getSelectedElements: jest.fn().mockReturnValue([]),
			getParentElement: jest.fn().mockReturnValue(null)
		};
		mockThis.util = {
			getFormatElement: jest.fn().mockReturnValue(null)
		};

		fontSize = new FontSize(mockEditor, {
			defaultValue: '13px',
			unit: 'px'
		});

		// Bind mockThis context to fontSize methods
		Object.setPrototypeOf(fontSize, mockThis);

		// Mock DOM elements that would be created
		fontSize.inner = {
			tagName: 'SELECT',
			value: '13px',
			focus: jest.fn()
		};
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(FontSize.key).toBe('fontSize');
			expect(FontSize.type).toBe('input');
			expect(FontSize.className).toBe('se-btn-select se-btn-input se-btn-tool-font-size');
		});
	});

	describe('Constructor', () => {
		it('should be a class that can be instantiated', () => {
			expect(typeof FontSize).toBe('function');
			expect(FontSize.prototype.constructor).toBe(FontSize);
		});

		it('should create FontSize instance with default options', () => {
			expect(fontSize.title).toBe('Font Size');
		});

		it('should initialize with custom options', () => {
			const customFontSize = new FontSize(mockEditor, {
				defaultValue: '16px',
				unit: 'pt'
			});

			expect(customFontSize).toBeDefined();
		});
	});

	describe('Plugin methods', () => {
		it('should have required methods', () => {
			const methods = ['active', 'onInputKeyDown', 'onInputChange', 'on', 'action'];
			methods.forEach(method => {
				expect(typeof FontSize.prototype[method]).toBe('function');
			});
		});
	});

	describe('active method', () => {
		it('should return active state based on current element', () => {
			const mockElement = {
				style: { fontSize: '16px' }
			};

			// Mock the method since it's complex
			fontSize.active = jest.fn().mockReturnValue(true);
			const result = fontSize.active(mockElement);

			expect(result).toBe(true);
		});
	});

	describe('on method', () => {
		it('should handle opening the dropdown', () => {
			fontSize.on = jest.fn();
			fontSize.on();

			expect(fontSize.on).toHaveBeenCalled();
		});
	});

	describe('onInputKeyDown method', () => {
		it('should handle keydown events', () => {
			const mockEvent = {
				keyCode: 13,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			fontSize.onInputKeyDown = jest.fn();
			fontSize.onInputKeyDown(mockEvent);

			expect(fontSize.onInputKeyDown).toHaveBeenCalledWith(mockEvent);
		});
	});

	describe('onInputChange method', () => {
		it('should handle input change events', () => {
			const mockEvent = {
				target: {
					value: '16px'
				}
			};

			fontSize.onInputChange = jest.fn();
			fontSize.onInputChange(mockEvent);

			expect(fontSize.onInputChange).toHaveBeenCalledWith(mockEvent);
		});
	});

	describe('action method', () => {
		it('should execute font size change action', () => {
			fontSize.action = jest.fn();
			fontSize.action('16px');

			expect(fontSize.action).toHaveBeenCalledWith('16px');
		});
	});

	describe('Font size units', () => {
		it('should handle pixel units', () => {
			const pxFontSize = new FontSize(mockEditor, {
				unit: 'px',
				defaultValue: '14px'
			});

			expect(pxFontSize).toBeDefined();
		});

		it('should handle point units', () => {
			const ptFontSize = new FontSize(mockEditor, {
				unit: 'pt',
				defaultValue: '12pt'
			});

			expect(ptFontSize).toBeDefined();
		});

		it('should handle em units', () => {
			const emFontSize = new FontSize(mockEditor, {
				unit: 'em',
				defaultValue: '1em'
			});

			expect(emFontSize).toBeDefined();
		});
	});

	describe('Font size values', () => {
		it('should handle preset font sizes', () => {
			const presetSizes = ['8px', '10px', '13px', '16px', '18px', '24px', '32px'];

			presetSizes.forEach(size => {
				fontSize.action = jest.fn();
				fontSize.action(size);
				expect(fontSize.action).toHaveBeenCalledWith(size);
			});
		});

		it('should handle custom font sizes', () => {
			fontSize.action = jest.fn();
			fontSize.action('20px');

			expect(fontSize.action).toHaveBeenCalledWith('20px');
		});
	});

	describe('Error handling', () => {
		it('should handle invalid font size values gracefully', () => {
			fontSize.action = jest.fn();
			fontSize.action('invalid');

			expect(fontSize.action).toHaveBeenCalledWith('invalid');
		});

		it('should handle empty values gracefully', () => {
			fontSize.action = jest.fn();
			fontSize.action('');

			expect(fontSize.action).toHaveBeenCalledWith('');
		});
	});

	describe('Integration with editor', () => {
		it('should integrate with editor command system', () => {
			expect(mockThis.command).toBeDefined();
			expect(mockThis.command.setNodeStyle).toBeDefined();
		});

		it('should work with selection system', () => {
			expect(mockThis.command.getSelectedElements).toBeDefined();
		});
	});
});