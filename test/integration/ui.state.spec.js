/**
 * @fileoverview Integration tests for UI state management (ui.js)
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('UI State Management', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold', 'italic', 'codeView', 'fullScreen']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('readOnly mode', () => {
		it('should set read-only state on frameContext', () => {
			editor.$.ui.readOnly(true);
			expect(editor.$.frameContext.get('isReadOnly')).toBe(true);
		});

		it('should unset read-only state', () => {
			editor.$.ui.readOnly(true);
			editor.$.ui.readOnly(false);
			expect(editor.$.frameContext.get('isReadOnly')).toBe(false);
		});
	});

	describe('disable/enable', () => {
		it('should disable editor', () => {
			editor.$.ui.disable();
			expect(editor.$.frameContext.get('isDisabled')).toBe(true);
		});

		it('should enable editor after disable', () => {
			editor.$.ui.disable();
			editor.$.ui.enable();
			expect(editor.$.frameContext.get('isDisabled')).toBe(false);
		});

		it('should set contenteditable false when disabled', () => {
			editor.$.ui.disable();
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			expect(wysiwyg.getAttribute('contenteditable')).toBe('false');
		});

		it('should restore contenteditable when enabled', () => {
			editor.$.ui.disable();
			editor.$.ui.enable();
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			expect(wysiwyg.getAttribute('contenteditable')).toBe('true');
		});
	});

	describe('show/hide', () => {
		it('should hide editor', () => {
			editor.$.ui.hide();
			const topArea = editor.$.frameContext.get('topArea');
			expect(topArea.style.display).toBe('none');
		});

		it('should show editor after hiding', () => {
			editor.$.ui.hide();
			editor.$.ui.show();
			const topArea = editor.$.frameContext.get('topArea');
			expect(topArea.style.display).not.toBe('none');
		});
	});

	describe('setDir', () => {
		it('should set RTL direction', () => {
			editor.$.ui.setDir('rtl');
			expect(editor.$.options.get('_rtl')).toBe(true);
		});

		it('should set LTR direction', () => {
			editor.$.ui.setDir('rtl');
			editor.$.ui.setDir('ltr');
			expect(editor.$.options.get('_rtl')).toBe(false);
		});

		it('should add se-rtl class to wysiwyg when RTL', () => {
			editor.$.ui.setDir('rtl');
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			expect(wysiwyg.classList.contains('se-rtl')).toBe(true);
		});

		it('should remove se-rtl class when LTR', () => {
			editor.$.ui.setDir('rtl');
			editor.$.ui.setDir('ltr');
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			expect(wysiwyg.classList.contains('se-rtl')).toBe(false);
		});
	});

	describe('setTheme', () => {
		it('should set theme class on top area', () => {
			editor.$.ui.setTheme('dark');
			const topArea = editor.$.frameContext.get('topArea');
			expect(topArea.classList.contains('se-theme-dark')).toBe(true);
		});

		it('should replace previous theme class', () => {
			editor.$.ui.setTheme('dark');
			editor.$.ui.setTheme('light');
			const topArea = editor.$.frameContext.get('topArea');
			expect(topArea.classList.contains('se-theme-dark')).toBe(false);
			expect(topArea.classList.contains('se-theme-light')).toBe(true);
		});

		it('should remove theme when setting empty string', () => {
			editor.$.ui.setTheme('dark');
			editor.$.ui.setTheme('');
			const topArea = editor.$.frameContext.get('topArea');
			expect(topArea.classList.contains('se-theme-dark')).toBe(false);
		});
	});

	describe('loading indicator', () => {
		it('should show loading overlay', () => {
			editor.$.ui.showLoading();
			const loading = editor.$.frameContext.get('loading');
			if (loading) {
				expect(loading.style.display).toBe('block');
			}
		});

		it('should hide loading overlay', () => {
			editor.$.ui.showLoading();
			editor.$.ui.hideLoading();
			const loading = editor.$.frameContext.get('loading');
			if (loading) {
				expect(loading.style.display).toBe('none');
			}
		});
	});

	describe('setEditorStyle', () => {
		it('should apply style string to editor', () => {
			editor.$.ui.setEditorStyle('height: 500px;');
			const wysiwygFrame = editor.$.frameContext.get('wysiwygFrame');
			// The style gets parsed and applied via converter._setDefaultOptionStyle
			expect(wysiwygFrame.style.cssText).toBeTruthy();
		});
	});
});
