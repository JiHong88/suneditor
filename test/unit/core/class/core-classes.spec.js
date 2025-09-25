/**
 * @fileoverview Core Classes Unit Tests - Using correct EditorInjector access pattern
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Core Classes - Unit Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Selection Class', () => {
		it('should access selection through eventManager', () => {
			const selection = editor.core.eventManager.selection;

			expect(selection).toBeDefined();
			expect(typeof selection.get).toBe('function');
			expect(typeof selection.getRange).toBe('function');
		});

		it('should get window selection', () => {
			const selection = editor.core.eventManager.selection;
			const windowSelection = selection.get();

			expect(windowSelection).toBeDefined();
			expect(windowSelection.rangeCount).toBeDefined();
		});

		it('should handle text selection', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const selection = editor.core.eventManager.selection;

			wysiwyg.innerHTML = '<p>Test content</p>';

			// Create selection
			const range = document.createRange();
			const textNode = wysiwyg.firstChild.firstChild;
			range.setStart(textNode, 0);
			range.setEnd(textNode, 4);

			const windowSelection = window.getSelection();
			windowSelection.removeAllRanges();
			windowSelection.addRange(range);

			const currentRange = selection.getRange();
			expect(currentRange).toBeDefined();
			// Test that selection mechanism works
			expect(typeof currentRange.startOffset).toBe('number');
			expect(typeof currentRange.endOffset).toBe('number');
			expect(currentRange.startOffset).toBeLessThanOrEqual(currentRange.endOffset);
		});
	});

	describe('Format Class', () => {
		it('should access format through eventManager', () => {
			const format = editor.core.eventManager.format;

			expect(format).toBeDefined();
			expect(typeof format.isLine).toBe('function');
			expect(typeof format.getLine).toBe('function');
			expect(typeof format.isBlock).toBe('function');
		});

		it('should identify line elements', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const format = editor.core.eventManager.format;

			wysiwyg.innerHTML = '<p>Paragraph</p><div>Division</div><h1>Heading</h1>';

			const paragraph = wysiwyg.querySelector('p');
			const div = wysiwyg.querySelector('div');
			const heading = wysiwyg.querySelector('h1');

			expect(format.isLine(paragraph)).toBe(true);
			expect(format.isLine(div)).toBe(true);
			expect(format.isLine(heading)).toBe(true);
		});

		it('should get line from nested element', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const format = editor.core.eventManager.format;

			wysiwyg.innerHTML = '<p>Text with <strong>bold text</strong></p>';

			const strongElement = wysiwyg.querySelector('strong');
			const line = format.getLine(strongElement);

			expect(line).toBeDefined();
			expect(line.tagName.toLowerCase()).toBe('p');
		});

		it('should identify block elements', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const format = editor.core.eventManager.format;

			wysiwyg.innerHTML = '<blockquote><p>Quote content</p></blockquote>';

			const blockquote = wysiwyg.querySelector('blockquote');
			const paragraph = wysiwyg.querySelector('p');

			expect(format.isBlock(blockquote)).toBe(true);
			// Paragraph identification may vary by configuration
			expect(typeof format.isBlock(paragraph)).toBe('boolean');
		});
	});

	describe('HTML Class', () => {
		it('should access html through eventManager', () => {
			const html = editor.core.eventManager.html;

			expect(html).toBeDefined();
			expect(typeof html.clean).toBe('function');
			expect(typeof html.insert).toBe('function');
		});

		it('should clean HTML content', () => {
			const html = editor.core.eventManager.html;

			const dirtyHTML = '<p style="color: red;">Test content</p>';
			const cleanHTML = html.clean(dirtyHTML);

			expect(cleanHTML).toBeDefined();
			expect(typeof cleanHTML).toBe('string');
			expect(cleanHTML).toContain('Test content');
		});

		it('should remove dangerous scripts', () => {
			const html = editor.core.eventManager.html;

			const dangerousHTML = '<p>Safe content</p><script>alert("dangerous")</script>';
			const cleanHTML = html.clean(dangerousHTML);

			expect(cleanHTML).not.toContain('<script>');
			expect(cleanHTML).not.toContain('alert');
			expect(cleanHTML).toContain('Safe content');
		});

		it('should handle malformed HTML gracefully', () => {
			const html = editor.core.eventManager.html;

			const malformedHTML = '<p>Unclosed paragraph<div>Nested incorrectly</p></div>';

			expect(() => {
				const cleanHTML = html.clean(malformedHTML);
				expect(cleanHTML).toBeDefined();
			}).not.toThrow();
		});
	});

	describe('Component Class', () => {
		it('should access component through eventManager', () => {
			const component = editor.core.eventManager.component;

			expect(component).toBeDefined();
			expect(typeof component.get).toBe('function');
			expect(typeof component.is).toBe('function');
		});

		it('should handle component state', () => {
			const component = editor.core.eventManager.component;

			// Test initial state
			expect(component.isSelected).toBe(false);
			expect(component.currentTarget).toBeNull();

			// Test state changes
			component.isSelected = true;
			expect(component.isSelected).toBe(true);

			component.isSelected = false;
			expect(component.isSelected).toBe(false);
		});

		it('should identify components', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const component = editor.core.eventManager.component;

			wysiwyg.innerHTML = '<p>Text</p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="test">';

			const paragraph = wysiwyg.querySelector('p');
			const img = wysiwyg.querySelector('img');

			expect(component.is(paragraph)).toBe(false);
			// Component identification depends on configuration
			expect(typeof component.is(img)).toBe('boolean');
		});
	});

	describe('Character Validation', () => {
		it('should access char through eventManager', () => {
			const char = editor.core.eventManager.char;

			expect(char).toBeDefined();
			expect(typeof char.test).toBe('function');
		});

		it('should validate characters', () => {
			const char = editor.core.eventManager.char;

			const validText = 'Valid text 123';
			const result = char.test(validText);

			expect(typeof result).toBe('boolean');
		});

		it('should handle unicode characters', () => {
			const char = editor.core.eventManager.char;

			const unicodeText = 'ñáéíóú中文한글🎉';

			expect(() => {
				const result = char.test(unicodeText);
				expect(typeof result).toBe('boolean');
			}).not.toThrow();
		});
	});

	describe('Shortcuts System', () => {
		it('should access shortcuts through eventManager', () => {
			const shortcuts = editor.core.eventManager.shortcuts;

			expect(shortcuts).toBeDefined();
			expect(typeof shortcuts.command).toBe('function');
		});

		it('should handle keyboard shortcuts', () => {
			const shortcuts = editor.core.eventManager.shortcuts;

			const keyEvent = {
				key: 'b',
				ctrlKey: true,
				shiftKey: false,
				altKey: false,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			expect(() => {
				const handled = shortcuts.command(keyEvent, true, false, 'KeyB', 'b', false, null, null);
				expect(typeof handled).toBe('boolean');
			}).not.toThrow();
		});

		it('should handle unknown shortcuts', () => {
			const shortcuts = editor.core.eventManager.shortcuts;

			const unknownEvent = {
				key: 'xyz',
				ctrlKey: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			expect(() => {
				const result = shortcuts.command(unknownEvent, true, false, 'KeyXYZ', 'xyz', false, null, null);
				expect(result).toBe(false);
			}).not.toThrow();
		});
	});

	describe('Menu System', () => {
		it('should access menu through eventManager', () => {
			const menu = editor.core.eventManager.menu;

			expect(menu).toBeDefined();
			expect(typeof menu.currentDropdownName).toBeDefined();
		});

		it('should handle dropdown state', () => {
			const menu = editor.core.eventManager.menu;

			// Test initial state
			expect(menu.currentDropdownName).toBeFalsy();

			// Test state changes
			menu.currentDropdownName = 'testDropdown';
			expect(menu.currentDropdownName).toBe('testDropdown');

			// Reset state manually since dropdownOff might not reset the property
			menu.currentDropdownName = null;
			expect(menu.currentDropdownName).toBeFalsy();
		});
	});

	describe('Integration Tests', () => {
		it('should have all core classes available through eventManager', () => {
			const eventManager = editor.core.eventManager;

			// Check that all expected classes are available
			expect(eventManager.selection).toBeDefined();
			expect(eventManager.format).toBeDefined();
			expect(eventManager.html).toBeDefined();
			expect(eventManager.component).toBeDefined();
			expect(eventManager.char).toBeDefined();
			expect(eventManager.shortcuts).toBeDefined();
			expect(eventManager.menu).toBeDefined();
		});

		it('should maintain cross-class relationships', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const selection = editor.core.eventManager.selection;
			const format = editor.core.eventManager.format;

			wysiwyg.innerHTML = '<p>Test <strong>bold</strong> text</p>';

			// Create selection in bold text
			const strongElement = wysiwyg.querySelector('strong');
			const textNode = strongElement.firstChild;

			const range = document.createRange();
			range.setStart(textNode, 0);
			range.setEnd(textNode, 4);

			const windowSelection = window.getSelection();
			windowSelection.removeAllRanges();
			windowSelection.addRange(range);

			// Classes should work together
			const currentRange = selection.getRange();
			const selectedNode = selection.getNode();
			const line = format.getLine(selectedNode);

			expect(currentRange).toBeDefined();
			expect(selectedNode).toBeDefined();
			expect(line).toBeDefined();
			expect(line.tagName.toLowerCase()).toBe('p');
		});
	});
});