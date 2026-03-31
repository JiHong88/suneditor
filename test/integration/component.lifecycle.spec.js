/**
 * @fileoverview Integration tests for component lifecycle (component.js)
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { image } from '../../src/plugins';

describe('Component Lifecycle', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { image },
			buttonList: [['image']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('is()', () => {
		it('should return true for FIGURE elements', () => {
			const figure = document.createElement('figure');
			expect(editor.$.component.is(figure)).toBe(true);
		});

		it('should return false for null', () => {
			expect(editor.$.component.is(null)).toBe(false);
		});

		it('should return false for regular elements', () => {
			const p = document.createElement('p');
			expect(editor.$.component.is(p)).toBe(false);
		});

		it('should return true for component containers', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			expect(editor.$.component.is(div)).toBe(true);
		});
	});

	describe('isInline()', () => {
		it('should return false for null', () => {
			expect(editor.$.component.isInline(null)).toBe(false);
		});

		it('should return true for inline component containers', () => {
			const div = document.createElement('div');
			div.className = 'se-inline-component';
			expect(editor.$.component.isInline(div)).toBe(true);
		});

		it('should return false for regular elements', () => {
			const p = document.createElement('p');
			expect(editor.$.component.isInline(p)).toBe(false);
		});
	});

	describe('isBasic()', () => {
		it('should return true for non-inline components', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			expect(editor.$.component.isBasic(div)).toBe(true);
		});

		it('should return false for inline components', () => {
			const div = document.createElement('div');
			div.className = 'se-component se-inline-component';
			expect(editor.$.component.isInline(div)).toBe(true);
		});
	});

	describe('get()', () => {
		it('should return null for null element', () => {
			expect(editor.$.component.get(null)).toBeNull();
		});

		it('should return null for non-component element', () => {
			const p = document.createElement('p');
			expect(editor.$.component.get(p)).toBeNull();
		});
	});

	describe('insert()', () => {
		it('should return null in read-only mode', () => {
			editor.$.frameContext.set('isReadOnly', true);
			const element = document.createElement('div');

			const result = editor.$.component.insert(element);

			expect(result).toBeNull();
			editor.$.frameContext.set('isReadOnly', false);
		});

		it('should return null when char check fails', () => {
			jest.spyOn(editor.$.char, 'check').mockReturnValue(false);
			const element = document.createElement('div');

			const result = editor.$.component.insert(element);

			expect(result).toBeNull();
			editor.$.char.check.mockRestore();
		});
	});

	describe('deselect()', () => {
		it('should reset selection state', () => {
			editor.$.component.isSelected = true;
			editor.$.component.currentTarget = document.createElement('div');
			editor.$.component.currentPlugin = {};
			editor.$.component.currentPluginName = 'test';

			editor.$.component.__deselect();

			expect(editor.$.component.isSelected).toBe(false);
			expect(editor.$.component.currentTarget).toBeNull();
			expect(editor.$.component.currentPlugin).toBeNull();
			expect(editor.$.component.currentPluginName).toBe('');
		});
	});

	describe('select() / deselect() state lifecycle', () => {
		it('should have initial isSelected as false', () => {
			expect(editor.$.component.isSelected).toBe(false);
		});

		it('should have initial currentTarget as null', () => {
			expect(editor.$.component.currentTarget).toBeNull();
		});
	});
});
