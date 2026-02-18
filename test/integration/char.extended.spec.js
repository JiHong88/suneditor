/**
 * @fileoverview Integration tests for char counting and validation
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('Char Extended Tests', () => {
	let editor;
	let wysiwyg;

	describe('with char counter enabled', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				charCounter: true,
				maxCharCount: 50,
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should count characters in content', () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const length = editor.$.char.getLength('Hello World');
			expect(length).toBe(11);
		});

		it('should count current editor content when no argument', () => {
			wysiwyg.innerHTML = '<p>Test</p>';
			const length = editor.$.char.getLength();
			expect(length).toBeGreaterThan(0);
		});

		it('should return true for check when within limit', () => {
			wysiwyg.innerHTML = '<p>Short</p>';
			expect(editor.$.char.check('test')).toBe(true);
		});

		it('should return false for check when exceeding limit', () => {
			const maxCharCount = editor.$.frameOptions.get('charCounter_max');
			if (maxCharCount) {
				wysiwyg.innerHTML = '<p>' + 'x'.repeat(maxCharCount) + '</p>';
				expect(editor.$.char.check('a')).toBe(false);
			}
		});

		it('should return true for test when within limit', () => {
			wysiwyg.innerHTML = '<p>Short</p>';
			expect(editor.$.char.test('a', false)).toBe(true);
		});

		it('should calculate byte length for ASCII text', () => {
			const length = editor.$.char.getByteLength('Hello');
			expect(length).toBe(5);
		});

		it('should calculate byte length for multibyte characters', () => {
			const length = editor.$.char.getByteLength('한글');
			expect(length).toBe(6); // Korean characters are 3 bytes each in UTF-8
		});

		it('should return 0 for empty/null byte length', () => {
			expect(editor.$.char.getByteLength('')).toBe(0);
			expect(editor.$.char.getByteLength(null)).toBe(0);
		});

		it('should display char count', () => {
			jest.useFakeTimers();
			wysiwyg.innerHTML = '<p>Hello</p>';
			editor.$.char.display();
			jest.advanceTimersByTime(10);
			jest.useRealTimers();
			// No error thrown - display works
		});
	});

	describe('with byte counter type', () => {
		let byteEditor;

		beforeEach(async () => {
			byteEditor = createTestEditor({
				charCounter: true,
				maxCharCount: 100,
				charCounterType: 'byte',
			});
			await waitForEditorReady(byteEditor);
		});

		afterEach(() => {
			destroyTestEditor(byteEditor);
		});

		it('should count bytes for ASCII text', () => {
			const length = byteEditor.$.char.getByteLength('test');
			expect(length).toBe(4);
		});

		it('should count bytes for multibyte text', () => {
			const length = byteEditor.$.char.getByteLength('日本語');
			expect(length).toBe(9); // 3 bytes per CJK character
		});
	});

	describe('without char counter', () => {
		let noCounterEditor;

		beforeEach(async () => {
			noCounterEditor = createTestEditor({
				charCounter: false,
			});
			await waitForEditorReady(noCounterEditor);
		});

		afterEach(() => {
			destroyTestEditor(noCounterEditor);
		});

		it('should always pass check when no max count', () => {
			expect(noCounterEditor.$.char.check('any text')).toBe(true);
		});

		it('should always pass test when no max count', () => {
			expect(noCounterEditor.$.char.test('any text', false)).toBe(true);
		});
	});
});
