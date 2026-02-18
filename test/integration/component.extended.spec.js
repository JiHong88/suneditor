/**
 * @fileoverview Extended integration tests for Component module
 * Tests src/core/logic/shell/component.js with real editor
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('Component Extended Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold']],
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('component module API', () => {
		it('should have component module', () => {
			expect(editor.$.component).toBeDefined();
		});

		it('should have is method', () => {
			expect(typeof editor.$.component.is).toBe('function');
		});

		it('should have isInline method', () => {
			expect(typeof editor.$.component.isInline).toBe('function');
		});

		it('should have get method', () => {
			expect(typeof editor.$.component.get).toBe('function');
		});

		it('should have select method', () => {
			expect(typeof editor.$.component.select).toBe('function');
		});

		it('should have deselect method', () => {
			expect(typeof editor.$.component.deselect).toBe('function');
		});

		it('should have insert method', () => {
			expect(typeof editor.$.component.insert).toBe('function');
		});

		it('should have copy method', () => {
			expect(typeof editor.$.component.copy).toBe('function');
		});
	});

	describe('is() with non-component elements', () => {
		it('should return false for regular paragraph', () => {
			const p = document.createElement('p');
			expect(editor.$.component.is(p)).toBe(false);
		});

		it('should return false for text node', () => {
			const text = document.createTextNode('hello');
			expect(editor.$.component.is(text)).toBe(false);
		});

		it('should return false for null', () => {
			expect(editor.$.component.is(null)).toBe(false);
		});

		it('should return true for figure', () => {
			const figure = document.createElement('figure');
			expect(editor.$.component.is(figure)).toBe(true);
		});
	});

	describe('isInline()', () => {
		it('should return false for non-component element', () => {
			const span = document.createElement('span');
			expect(editor.$.component.isInline(span)).toBe(false);
		});
	});

	describe('get()', () => {
		it('should return null for non-component element', () => {
			const p = document.createElement('p');
			expect(editor.$.component.get(p)).toBeNull();
		});

		it('should return null for null input', () => {
			expect(editor.$.component.get(null)).toBeNull();
		});
	});
});
