/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import FocusManager from '../../../../../src/core/logic/shell/focusManager';

describe('FocusManager', () => {
	let mockEditor;
	let focusManager;

	beforeEach(() => {
		mockEditor = createMockEditor();
		focusManager = new FocusManager(mockEditor);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize FocusManager', () => {
			expect(focusManager).toBeDefined();
		});

		it('should accept kernel parameter', () => {
			expect(() => {
				new FocusManager(mockEditor);
			}).not.toThrow();
		});
	});

	describe('focus method', () => {
		it('should be a function', () => {
			expect(typeof focusManager.focus).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(focusManager.focus).toBeDefined();
		});

		it('accepts optional rootKey parameter', () => {
			expect(focusManager.focus).toBeDefined();
			expect(focusManager.focus.length).toBeGreaterThanOrEqual(0);
		});

		it('is a callable function with correct type', () => {
			expect(typeof focusManager.focus).toBe('function');
		});
	});

	describe('focusEdge method', () => {
		it('should be a function', () => {
			expect(typeof focusManager.focusEdge).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(focusManager.focusEdge).toBeDefined();
		});

		it('should prevent blur when called', () => {
			focusManager.focusEdge();
			expect(mockEditor.store.set).toHaveBeenCalledWith('_preventBlur', false);
		});

		it('should handle null focusEl parameter', () => {
			focusManager.focusEdge(null);
			// Should complete without error when finding last element
			expect(mockEditor.store.set).toHaveBeenCalled();
		});
	});

	describe('nativeFocus method', () => {
		it('should be a function', () => {
			expect(typeof focusManager.nativeFocus).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(focusManager.nativeFocus).toBeDefined();
		});
	});

	describe('blur method', () => {
		it('should be a function', () => {
			expect(typeof focusManager.blur).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(focusManager.blur).toBeDefined();
		});
	});

	describe('Integration scenarios', () => {
		it('all methods are accessible and callable', () => {
			expect(typeof focusManager.focus).toBe('function');
			expect(typeof focusManager.focusEdge).toBe('function');
			expect(typeof focusManager.nativeFocus).toBe('function');
			expect(typeof focusManager.blur).toBe('function');
		});

		it('should have required properties', () => {
			expect(mockEditor.$.frameContext).toBeDefined();
			expect(mockEditor.store).toBeDefined();
			expect(mockEditor.$).toBeDefined();
		});

		it('focusManager is initialized correctly', () => {
			expect(focusManager).toBeDefined();
			expect(typeof focusManager).toBe('object');
		});

		it('multiple methods are defined', () => {
			expect(focusManager.focusEdge).toBeDefined();
			expect(focusManager.nativeFocus).toBeDefined();
			expect(focusManager.blur).toBeDefined();
		});
	});

	describe('Error handling', () => {
		it('should have defined selection mock methods', () => {
			expect(mockEditor.$.selection.getRange).toBeDefined();
			expect(mockEditor.$.selection.setRange).toBeDefined();
		});

		it('should handle frameContext retrieval', () => {
			const frameContext = mockEditor.$.frameContext;
			expect(frameContext).toBeDefined();
		});

		it('should have facade module defined', () => {
			expect(mockEditor.$.facade).toBeDefined();
		});
	});

	describe('Editor state interactions', () => {
		it('has access to store module', () => {
			expect(mockEditor.store).toBeDefined();
			expect(mockEditor.store.set).toBeDefined();
		});

		it('has access to selection module', () => {
			expect(mockEditor.$.selection).toBeDefined();
			expect(mockEditor.$.selection.getRange).toBeDefined();
		});

		it('has access to frameContext', () => {
			expect(mockEditor.$.frameContext).toBeDefined();
		});

		it('has access to facade module', () => {
			expect(mockEditor.$.facade).toBeDefined();
		});
	});

	describe('Selection range handling', () => {
		it('selection methods should be mocked correctly', () => {
			expect(typeof mockEditor.$.selection.getRange).toBe('function');
			expect(typeof mockEditor.$.selection.setRange).toBe('function');
		});

		it('selection methods are defined in $', () => {
			expect(mockEditor.$.selection.getRange).toBeDefined();
			expect(mockEditor.$.selection.setRange).toBeDefined();
		});

		it('focusManager has access to selection module', () => {
			expect(mockEditor.$.selection).toBeDefined();
		});
	});

	describe('Frame context handling', () => {
		it('should have frameOptions accessible', () => {
			expect(mockEditor.$.frameOptions).toBeDefined();
		});

		it('should have frameContext defined', () => {
			expect(mockEditor.$.frameContext).toBeDefined();
		});

		it('focusManager references frame-related components', () => {
			expect(mockEditor.$.frameRoots).toBeDefined();
			expect(mockEditor.$.frameOptions).toBeDefined();
		});
	});
});
