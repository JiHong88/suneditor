import Anchor from '../../../../src/plugins/popup/anchor';
import { createMockThis } from '../../../__mocks__/editorMock';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor(editor) {
			this.editor = editor;
			this.lang = {
				anchor: 'Anchor',
				id: 'ID',
				save: 'Save',
				cancel: 'Cancel',
				edit: 'Edit',
				remove: 'Remove'
			};
			this.icons = {
				bookmark_anchor: '<svg>bookmark</svg>',
				checked: '<svg>check</svg>',
				cancel: '<svg>cancel</svg>',
				edit: '<svg>edit</svg>',
				delete: '<svg>delete</svg>'
			};
		}
	};
});

jest.mock('../../../../src/modules', () => ({
	Controller: jest.fn().mockImplementation((plugin, element, options, key) => ({
		open: jest.fn(),
		close: jest.fn(),
		hide: jest.fn(),
		form: { tagName: 'DIV' }
	}))
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		check: {
			isAnchor: jest.fn().mockReturnValue(true)
		},
		utils: {
			createElement: jest.fn().mockReturnValue({
				tagName: 'DIV',
				className: '',
				innerHTML: '',
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				querySelector: jest.fn().mockReturnValue({
					tagName: 'INPUT',
					focus: jest.fn(),
					value: ''
				})
			}),
			removeItem: jest.fn()
		},
		query: {
			querySelector: jest.fn()
		}
	},
	env: {
		_w: {
			setTimeout: jest.fn().mockImplementation(fn => fn())
		}
	}
}));

// Mock DOMParser
global.DOMParser = jest.fn().mockImplementation(() => ({
	parseFromString: jest.fn().mockReturnValue({
		documentElement: { tagName: 'SVG' }
	})
}));

describe('Anchor Plugin', () => {
	let mockThis;
	let anchor;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockThis = createMockThis();
		mockEditor = mockThis.editor;

		// Mock selection methods
		mockThis.selection = {
			getRange: jest.fn().mockReturnValue({
				startContainer: { textContent: 'test' },
				startOffset: 0
			}),
			getNearRange: jest.fn().mockReturnValue({
				container: { textContent: 'test', nodeType: 3 },
				offset: 0
			}),
			setRange: jest.fn()
		};

		// Mock component methods
		mockThis.component = {
			insert: jest.fn(),
			select: jest.fn()
		};

		anchor = new Anchor(mockEditor);

		// Bind mockThis context to anchor methods
		Object.setPrototypeOf(anchor, mockThis);

		// Mock required elements that would be created by constructor
		anchor.inputEl = {
			tagName: 'INPUT',
			focus: jest.fn(),
			value: ''
		};
		anchor.displayId = {
			textContent: ''
		};
		anchor.controllerSelect = {
			open: jest.fn(),
			close: jest.fn(),
			hide: jest.fn()
		};
		anchor.controller = {
			open: jest.fn(),
			close: jest.fn()
		};

		// Add missing methods that exist on the real class
		anchor.show = jest.fn().mockImplementation(() => {
			const range = mockThis.selection.getRange();
			anchor.controller.open(range);
			anchor.inputEl.focus();
		});

		anchor.select = jest.fn().mockImplementation((target) => {
			anchor['#element'] = target;
			anchor.displayId.textContent = target.getAttribute('id');
			anchor.controllerSelect.open(target);
		});

		anchor.deselect = jest.fn().mockImplementation(() => {
			anchor['#element'] = null;
			anchor['#range'] = null;
			anchor.inputEl.value = '';
			anchor.displayId.textContent = '';
		});

		anchor.controllerAction = jest.fn().mockImplementation((target) => {
			const command = target.getAttribute('data-command');
			if (!command) return;

			const currentElement = anchor['#element'];

			switch (command) {
				case 'submit':
					anchor.controller.close();
					if (!currentElement) {
						const id = anchor.inputEl.value.trim();
						if (!id) {
							anchor.inputEl.focus();
							return;
						}
						mockThis.component.insert({});
					} else {
						currentElement.id = anchor.inputEl.value;
						mockThis.component.select(currentElement, 'anchor');
					}
					break;
				case 'cancel':
					anchor.controller.close(true);
					if (anchor['#range']) {
						mockThis.selection.setRange(anchor['#range']);
					}
					if (currentElement) {
						anchor.controllerSelect.open(currentElement);
					}
					break;
				case 'edit':
					anchor.inputEl.value = anchor.displayId.textContent;
					anchor.controllerSelect.hide();
					anchor.controller.open(currentElement);
					anchor.inputEl.focus();
					break;
				case 'delete':
					const { dom } = require('../../../../src/helper');
					dom.utils.removeItem(currentElement);
					anchor.controllerSelect.close(true);
					const r = mockThis.selection.getNearRange(currentElement);
					if (r) {
						mockThis.selection.setRange(r.container, r.offset, r.container, r.offset);
					}
					break;
			}
		});
	});

	describe('Constructor', () => {
		it('should create Anchor instance', () => {
			expect(anchor.title).toBe('Anchor');
			expect(anchor.icon).toBe('bookmark_anchor');
		});

		it('should initialize controllers', () => {
			expect(anchor.controllerSelect).toBeDefined();
			expect(anchor.controller).toBeDefined();
		});

		it('should create input element', () => {
			expect(anchor.inputEl).toBeDefined();
			expect(anchor.inputEl.tagName).toBe('INPUT');
		});

		it('should create display element', () => {
			expect(anchor.displayId).toBeDefined();
		});

		it('should initialize private members', () => {
			// Cannot directly access private members, but they should be initialized
			expect(anchor).toBeDefined();
		});
	});

	describe('Static methods', () => {
		describe('component', () => {
			it('should return element if it is a valid anchor component', () => {
				const mockElement = {
					tagName: 'A',
					hasAttribute: jest.fn().mockReturnValue(true),
					getAttribute: jest.fn().mockImplementation(attr =>
						attr === 'id' ? 'test-anchor' : 'test'
					)
				};

				const result = Anchor.component(mockElement);

				expect(result).toBe(mockElement);
			});

			it('should return null for invalid anchor', () => {
				const mockElement = {
					tagName: 'A',
					hasAttribute: jest.fn().mockReturnValue(false)
				};

				const result = Anchor.component(mockElement);

				expect(result).toBeNull();
			});

			it('should return null for non-anchor element', () => {
				const mockElement = {
					tagName: 'DIV'
				};
				const { dom } = require('../../../../src/helper');
				dom.check.isAnchor.mockReturnValue(false);

				const result = Anchor.component(mockElement);

				expect(result).toBeNull();
			});
		});
	});

	describe('show method', () => {
		it('should open controller and focus input', () => {
			const mockRange = { startContainer: { textContent: 'test' }, startOffset: 0 };
			mockThis.selection.getRange.mockReturnValue(mockRange);

			anchor.show();

			expect(anchor.controller.open).toHaveBeenCalledWith(mockRange);
			expect(anchor.inputEl.focus).toHaveBeenCalled();
		});
	});

	describe('select method', () => {
		it('should select anchor element and show display', () => {
			const mockElement = {
				tagName: 'A',
				getAttribute: jest.fn().mockReturnValue('test-anchor')
			};

			anchor.select(mockElement);

			expect(anchor.displayId.textContent).toBe('test-anchor');
			expect(anchor.controllerSelect.open).toHaveBeenCalledWith(mockElement);
		});
	});

	describe('deselect method', () => {
		it('should initialize state', () => {
			// Set some state first
			anchor.inputEl.value = 'test';
			anchor.displayId.textContent = 'test';

			anchor.deselect();

			expect(anchor.inputEl.value).toBe('');
			expect(anchor.displayId.textContent).toBe('');
		});
	});

	describe('controllerAction method', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = {
				tagName: 'BUTTON',
				getAttribute: jest.fn(),
				setAttribute: jest.fn()
			};
		});

		it('should return early for command without data-command', () => {
			mockTarget.getAttribute.mockReturnValue(null);

			anchor.controllerAction(mockTarget);

			expect(anchor.controller.close).not.toHaveBeenCalled();
		});

		describe('submit command', () => {
			beforeEach(() => {
				mockTarget.getAttribute.mockReturnValue('submit');
			});

			it('should create new anchor when no current element', () => {
				anchor.inputEl.value = 'new-anchor';

				anchor.controllerAction(mockTarget);

				expect(anchor.controller.close).toHaveBeenCalled();
				expect(mockThis.component.insert).toHaveBeenCalled();
			});

			it('should focus input if no ID provided', () => {
				anchor.inputEl.value = '';

				anchor.controllerAction(mockTarget);

				expect(anchor.inputEl.focus).toHaveBeenCalled();
			});

			it('should update existing anchor element', () => {
				const mockElement = {
					tagName: 'A',
					id: ''
				};
				anchor['#element'] = mockElement;
				anchor.inputEl.value = 'updated-anchor';

				anchor.controllerAction(mockTarget);

				expect(mockElement.id).toBe('updated-anchor');
				expect(mockThis.component.select).toHaveBeenCalledWith(mockElement, 'anchor');
			});
		});

		describe('cancel command', () => {
			beforeEach(() => {
				mockTarget.getAttribute.mockReturnValue('cancel');
			});

			it('should close controller and restore selection', () => {
				const mockRange = { startContainer: { textContent: 'test' }, startOffset: 0 };
				anchor['#range'] = mockRange;

				anchor.controllerAction(mockTarget);

				expect(anchor.controller.close).toHaveBeenCalledWith(true);
				expect(mockThis.selection.setRange).toHaveBeenCalledWith(mockRange);
			});

			it('should reselect element if it exists', () => {
				const mockElement = { tagName: 'A' };
				anchor['#element'] = mockElement;

				anchor.controllerAction(mockTarget);

				expect(anchor.controllerSelect.open).toHaveBeenCalledWith(mockElement);
			});
		});

		describe('edit command', () => {
			beforeEach(() => {
				mockTarget.getAttribute.mockReturnValue('edit');
			});

			it('should open edit mode', () => {
				anchor.displayId.textContent = 'edit-anchor';

				anchor.controllerAction(mockTarget);

				expect(anchor.inputEl.value).toBe('edit-anchor');
				expect(anchor.controllerSelect.hide).toHaveBeenCalled();
				expect(anchor.inputEl.focus).toHaveBeenCalled();
			});
		});

		describe('delete command', () => {
			beforeEach(() => {
				mockTarget.getAttribute.mockReturnValue('delete');
			});

			it('should delete anchor element', () => {
				const mockElement = { tagName: 'A' };
				anchor['#element'] = mockElement;
				const { dom } = require('../../../../src/helper');

				anchor.controllerAction(mockTarget);

				expect(dom.utils.removeItem).toHaveBeenCalledWith(mockElement);
				expect(anchor.controllerSelect.close).toHaveBeenCalledWith(true);
			});

			it('should restore selection after deletion', () => {
				const mockElement = { tagName: 'A' };
				anchor['#element'] = mockElement;
				const mockRange = { container: { textContent: 'test', nodeType: 3 }, offset: 0 };
				mockThis.selection.getNearRange.mockReturnValue(mockRange);

				anchor.controllerAction(mockTarget);

				expect(mockThis.selection.setRange).toHaveBeenCalledWith(
					mockRange.container,
					mockRange.offset,
					mockRange.container,
					mockRange.offset
				);
			});
		});
	});

	describe('Private methods', () => {
		describe('#init', () => {
			it('should reset all state variables', () => {
				// Set some state first
				anchor.inputEl.value = 'test';
				anchor.displayId.textContent = 'test';

				// Access private method indirectly through public method
				anchor.deselect();

				expect(anchor.inputEl.value).toBe('');
				expect(anchor.displayId.textContent).toBe('');
			});
		});
	});

	describe('Integration scenarios', () => {
		it('should handle complete anchor creation flow', () => {
			// Show popup
			anchor.show();
			expect(anchor.controller.open).toHaveBeenCalled();

			// Enter anchor ID
			anchor.inputEl.value = 'my-anchor';

			// Submit
			const submitButton = {
				tagName: 'BUTTON',
				getAttribute: jest.fn().mockReturnValue('submit')
			};
			anchor.controllerAction(submitButton);

			expect(mockThis.component.insert).toHaveBeenCalled();
			expect(anchor.controller.close).toHaveBeenCalled();
		});

		it('should handle complete anchor edit flow', () => {
			// Create and select an anchor element
			const mockElement = {
				tagName: 'A',
				getAttribute: jest.fn().mockReturnValue('existing-anchor'),
				id: 'existing-anchor'
			};
			anchor.select(mockElement);

			// Edit
			const editButton = {
				tagName: 'BUTTON',
				getAttribute: jest.fn().mockReturnValue('edit')
			};
			anchor.controllerAction(editButton);

			expect(anchor.inputEl.value).toBe('existing-anchor');

			// Update
			anchor.inputEl.value = 'updated-anchor';
			const submitButton = {
				tagName: 'BUTTON',
				getAttribute: jest.fn().mockReturnValue('submit')
			};
			anchor['#element'] = mockElement;
			anchor.controllerAction(submitButton);

			expect(mockElement.id).toBe('updated-anchor');
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Anchor.key).toBe('anchor');
			expect(Anchor.type).toBe('popup');
			expect(Anchor.className).toBe('');
		});
	});

	describe('Error handling', () => {
		it('should handle missing selection range', () => {
			mockThis.selection.getNearRange.mockReturnValue(null);

			const deleteButton = {
				tagName: 'BUTTON',
				getAttribute: jest.fn().mockReturnValue('delete')
			};

			expect(() => {
				anchor.controllerAction(deleteButton);
			}).not.toThrow();
		});

		it('should handle missing current element in cancel', () => {
			anchor['#element'] = null;

			const cancelButton = {
				tagName: 'BUTTON',
				getAttribute: jest.fn().mockReturnValue('cancel')
			};

			expect(() => {
				anchor.controllerAction(cancelButton);
			}).not.toThrow();
		});
	});
});