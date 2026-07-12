/**
 * @fileoverview Unit tests for plugins/dropdown/list.js
 */

import List from '../../../../src/plugins/dropdown/list.js';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock helper
jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockImplementation((tag, attrs, content) => {
				const element = {
					tagName: tag.toUpperCase(),
					className: attrs?.class || '',
					innerHTML: content || '',
					style: {},
					querySelectorAll: jest.fn().mockReturnValue([
						{
							tagName: 'BUTTON',
							getAttribute: jest.fn().mockImplementation((attr) => {
								if (attr === 'data-command') return 'ol';
								return null;
							}),
						},
						{
							tagName: 'BUTTON',
							getAttribute: jest.fn().mockImplementation((attr) => {
								if (attr === 'data-command') return 'ul';
								return null;
							}),
						},
					]),
					getAttribute: jest.fn(),
					setAttribute: jest.fn(),
				};
				if (attrs) {
					Object.keys(attrs).forEach((key) => {
						if (key === 'class') element.className = attrs[key];
						else element.setAttribute(key, attrs[key]);
					});
				}
				return element;
			}),
			addClass: jest.fn(),
			removeClass: jest.fn(),
			changeElement: jest.fn(),
		},
		check: {
			isList: jest.fn(),
		},
	},
}));

describe('Plugins - Dropdown - List', () => {
	let kernel;
	let list;

	beforeEach(() => {
		jest.clearAllMocks();

		kernel = createMockEditor();
		kernel.$.menu.initDropdownTarget = jest.fn().mockImplementation(() => {
			const { dom } = require('../../../../src/helper');
			return dom.utils.createElement('DIV', {}, '');
		});
		kernel.$.lang.list = 'List';
		kernel.$.lang.numberedList = 'Numbered List';
		kernel.$.lang.bulletedList = 'Bulleted List';

		list = new List(kernel);
	});

	describe('Constructor', () => {
		it('should initialize dropdown menu with items', () => {
			expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(List, expect.any(Array));
		});
	});

	describe('active method', () => {
		let mockTarget;
		let mockIcon;

		beforeEach(() => {
			mockIcon = { tagName: 'SVG' };
			mockTarget = {
				firstElementChild: mockIcon,
				setAttribute: jest.fn(),
				removeAttribute: jest.fn(),
			};
		});

		it('should handle null element', () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isList.mockReturnValue(false);

			const result = list.active(null, mockTarget);

			expect(result).toBe(false);
			expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
		});

		it('should handle undefined element', () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isList.mockReturnValue(false);

			const result = list.active(undefined, mockTarget);

			expect(result).toBe(false);
			expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
		});
	});

	describe('action method', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = {
				getAttribute: jest.fn(),
			};
		});

		it('should apply numbered list', () => {
			mockTarget.getAttribute.mockImplementation((attr) => {
				if (attr === 'data-command') return 'ol';
				if (attr === 'data-value') return 'decimal';
				return null;
			});

			list.action(mockTarget);

			expect(kernel.listFormat.apply).toHaveBeenCalledWith('ol:decimal', null, false);
			expect(kernel.$.selection.setRange).toHaveBeenCalled();
			expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should apply bulleted list', () => {
			mockTarget.getAttribute.mockImplementation((attr) => {
				if (attr === 'data-command') return 'ul';
				if (attr === 'data-value') return 'disc';
				return null;
			});

			list.action(mockTarget);

			expect(kernel.listFormat.apply).toHaveBeenCalledWith('ul:disc', null, false);
			expect(kernel.$.selection.setRange).toHaveBeenCalled();
		});

		it('should handle empty data-value', () => {
			mockTarget.getAttribute.mockImplementation((attr) => {
				if (attr === 'data-command') return 'ol';
				if (attr === 'data-value') return null;
				return null;
			});

			list.action(mockTarget);

			expect(kernel.listFormat.apply).toHaveBeenCalledWith('ol:', null, false);
		});

		it('should handle null range from apply', () => {
			mockTarget.getAttribute.mockImplementation((attr) => {
				if (attr === 'data-command') return 'ul';
				return null;
			});
			kernel.listFormat.apply.mockReturnValue(null);

			list.action(mockTarget);

			expect(kernel.$.selection.setRange).not.toHaveBeenCalled();
			expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should handle missing target attributes', () => {
			mockTarget.getAttribute.mockReturnValue(null);

			expect(() => {
				list.action(mockTarget);
			}).not.toThrow();

			expect(kernel.listFormat.apply).toHaveBeenCalledWith('null:', null, false);
		});
	});

	describe('CreateItems function', () => {
		it('should pass correct items to initDropdownTarget', () => {
			const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

			expect(items).toBeInstanceOf(Array);
			expect(items.length).toBe(2);

			const commands = items.map(item => item.command);
			expect(commands).toContain('ol');
			expect(commands).toContain('ul');

			const titles = items.map(item => item.title);
			expect(titles).toContain('Numbered List');
			expect(titles).toContain('Bulleted List');
		});

		it('should include editor icons in the items', () => {
			const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

			const htmls = items.map(item => item.innerHTML);
			expect(htmls.some(h => h.includes('<svg>numbered</svg>'))).toBe(true);
			expect(htmls.some(h => h.includes('<svg>bulleted</svg>'))).toBe(true);
		});
	});

	describe('Integration', () => {
		it('should work with editor format module', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return 'ol';
					return '';
				}),
			};

			expect(() => {
				list.action(mockTarget);
			}).not.toThrow();

			expect(kernel.listFormat.apply).toHaveBeenCalled();
		});

		it('should work with editor selection module', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockImplementation((attr) => {
					if (attr === 'data-command') return 'ul';
					return '';
				}),
			};

			list.action(mockTarget);

			expect(kernel.$.selection.setRange).toHaveBeenCalled();
		});

		it('should work with list detection', () => {
			const mockElement = { nodeName: 'UL' };
			const mockTarget = {
				firstElementChild: {},
				setAttribute: jest.fn(),
				removeAttribute: jest.fn(),
			};

			const { dom } = require('../../../../src/helper');
			dom.check.isList.mockReturnValue(true);

			expect(() => {
				list.active(mockElement, mockTarget);
			}).not.toThrow();

			expect(dom.check.isList).toHaveBeenCalledWith(mockElement);
		});
	});

	describe('Error handling', () => {
		it('should handle missing editor modules gracefully', () => {
			kernel.$.format = undefined;

			expect(() => {
				new List(kernel);
			}).not.toThrow();
		});

		it('should handle missing list items gracefully', () => {
			const mockTarget = {
				getAttribute: jest.fn().mockReturnValue('ol'),
			};

			expect(() => {
				list.on(mockTarget);
			}).not.toThrow();
		});

		it('should handle malformed target in action method', () => {
			const mockTarget = {};

			expect(() => {
				list.action(mockTarget);
			}).toThrow();
		});

		it('should handle missing icons gracefully', () => {
			const incompleteEditor = {
				...kernel,
				icons: {},
			};

			expect(() => {
				new List(incompleteEditor);
			}).not.toThrow();
		});
	});
});
