/**
 * @fileoverview Integration tests for Selection module
 * Tests src/core/logic/dom/selection.js through real editor instance
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('Selection Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold', 'italic']],
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('selection module', () => {
		it('should have selection module', () => {
			expect(editor.$.selection).toBeDefined();
		});

		it('should have setRange method', () => {
			expect(typeof editor.$.selection.setRange).toBe('function');
		});

		it('should have get method', () => {
			expect(typeof editor.$.selection.get).toBe('function');
		});

		it('should have getNode method', () => {
			expect(typeof editor.$.selection.getNode).toBe('function');
		});
	});

	describe('setRange', () => {
		it('should set range on text node', () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			const sel = editor.$.selection.get();
			if (sel && sel.rangeCount > 0) {
				const range = sel.getRangeAt(0);
				expect(range.startContainer).toBe(textNode);
				expect(range.startOffset).toBe(0);
			}
		});

		it('should handle collapsed range', () => {
			wysiwyg.innerHTML = '<p>Test</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 2, textNode, 2);

			const sel = editor.$.selection.get();
			if (sel && sel.rangeCount > 0) {
				const range = sel.getRangeAt(0);
				expect(range.collapsed).toBe(true);
			}
		});

		it('should span across multiple nodes', () => {
			wysiwyg.innerHTML = '<p>Hello <strong>World</strong></p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			const strongText = wysiwyg.querySelector('strong').firstChild;
			editor.$.selection.setRange(textNode, 0, strongText, 5);

			const sel = editor.$.selection.get();
			if (sel && sel.rangeCount > 0) {
				const range = sel.getRangeAt(0);
				expect(range.collapsed).toBe(false);
			}
		});
	});

	describe('getNode', () => {
		it('should return node from selection', () => {
			wysiwyg.innerHTML = '<p>Hello</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			const node = editor.$.selection.getNode();
			expect(node).toBeTruthy();
		});
	});

	describe('getRange', () => {
		it('should return range after setRange', () => {
			wysiwyg.innerHTML = '<p>Range test</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 5);

			const range = editor.$.selection.getRange();
			expect(range).toBeTruthy();
			expect(range.startContainer).toBe(textNode);
			expect(range.endOffset).toBe(5);
		});

		it('should return collapsed range for cursor position', () => {
			wysiwyg.innerHTML = '<p>Cursor</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(textNode, 3, textNode, 3);

			const range = editor.$.selection.getRange();
			expect(range.collapsed).toBe(true);
			expect(range.startOffset).toBe(3);
		});
	});

	describe('getRange from nested content', () => {
		it('should track range through nested inline elements', () => {
			wysiwyg.innerHTML = '<p><em><strong>Bold italic</strong></em></p>';
			const textNode = wysiwyg.querySelector('strong').firstChild;
			editor.$.selection.setRange(textNode, 0, textNode, 4);

			const range = editor.$.selection.getRange();
			expect(range.startContainer).toBe(textNode);
			expect(range.endOffset).toBe(4);
			expect(range.collapsed).toBe(false);
		});
	});
});
