/**
 * @fileoverview Integration tests for Viewer (codeView, fullScreen, showBlocks)
 * Tests src/core/logic/panel/viewer.js through real editor instance
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('Viewer Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['codeView', 'fullScreen', 'showBlocks']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('codeView', () => {
		it('should toggle code view on', () => {
			editor.$.viewer.codeView(true);
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);
		});

		it('should toggle code view off', () => {
			editor.$.viewer.codeView(true);
			editor.$.viewer.codeView(false);
			expect(editor.$.frameContext.get('isCodeView')).toBe(false);
		});

		it('should toggle code view with undefined (toggle)', () => {
			editor.$.viewer.codeView();
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);
			editor.$.viewer.codeView();
			expect(editor.$.frameContext.get('isCodeView')).toBe(false);
		});

		it('should not re-toggle when same value is passed', () => {
			editor.$.viewer.codeView(true);
			// Calling again with true should be no-op
			editor.$.viewer.codeView(true);
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);
		});

		it('should hide wysiwyg frame when code view is on', () => {
			editor.$.viewer.codeView(true);
			const wysiwygFrame = editor.$.frameContext.get('wysiwygFrame');
			expect(wysiwygFrame.style.display).toBe('none');
		});

		it('should show code wrapper when code view is on', () => {
			editor.$.viewer.codeView(true);
			const codeWrapper = editor.$.frameContext.get('codeWrapper');
			expect(codeWrapper.style.display).not.toBe('none');
		});

		it('should add se-code-view-status class to wrapper when on', () => {
			editor.$.viewer.codeView(true);
			const wrapper = editor.$.frameContext.get('wrapper');
			expect(wrapper.classList.contains('se-code-view-status')).toBe(true);
		});

		it('should remove se-code-view-status class from wrapper when off', () => {
			editor.$.viewer.codeView(true);
			editor.$.viewer.codeView(false);
			const wrapper = editor.$.frameContext.get('wrapper');
			expect(wrapper.classList.contains('se-code-view-status')).toBe(false);
		});

		it('should show wysiwyg and hide code when code view turns off', () => {
			editor.$.viewer.codeView(true);
			editor.$.viewer.codeView(false);
			const wysiwygFrame = editor.$.frameContext.get('wysiwygFrame');
			expect(wysiwygFrame.style.display).toBe('block');
		});
	});

	describe('fullScreen', () => {
		it('should toggle full screen on', () => {
			editor.$.viewer.fullScreen(true);
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
		});

		it('should toggle full screen off', () => {
			editor.$.viewer.fullScreen(true);
			editor.$.viewer.fullScreen(false);
			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should toggle with undefined', () => {
			editor.$.viewer.fullScreen();
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
			editor.$.viewer.fullScreen();
			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should not re-toggle when same value is passed', () => {
			editor.$.viewer.fullScreen(false);
			expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
		});

		it('should set position fixed on topArea when full screen on', () => {
			editor.$.viewer.fullScreen(true);
			const topArea = editor.$.frameContext.get('topArea');
			expect(topArea.style.position).toBe('fixed');
		});

		it('should restore topArea styles when full screen off', () => {
			const topArea = editor.$.frameContext.get('topArea');
			const originalCss = topArea.style.cssText;
			editor.$.viewer.fullScreen(true);
			editor.$.viewer.fullScreen(false);
			expect(topArea.style.position).not.toBe('fixed');
		});

		it('should set body overflow to hidden when full screen', () => {
			editor.$.viewer.fullScreen(true);
			expect(document.body.style.overflow).toBe('hidden');
		});

		it('should restore body overflow when exiting full screen', () => {
			const originalOverflow = document.body.style.overflow;
			editor.$.viewer.fullScreen(true);
			editor.$.viewer.fullScreen(false);
			expect(document.body.style.overflow).toBe(originalOverflow);
		});
	});

	describe('showBlocks', () => {
		it('should toggle show blocks on', () => {
			editor.$.viewer.showBlocks(true);
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
		});

		it('should toggle show blocks off', () => {
			editor.$.viewer.showBlocks(true);
			editor.$.viewer.showBlocks(false);
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
		});

		it('should toggle with undefined', () => {
			editor.$.viewer.showBlocks();
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
			editor.$.viewer.showBlocks();
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
		});

		it('should add se-show-block class to wysiwyg when on', () => {
			editor.$.viewer.showBlocks(true);
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			expect(wysiwyg.classList.contains('se-show-block')).toBe(true);
		});

		it('should remove se-show-block class from wysiwyg when off', () => {
			editor.$.viewer.showBlocks(true);
			editor.$.viewer.showBlocks(false);
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
		});
	});

	describe('combined operations', () => {
		it('should handle code view inside full screen', () => {
			editor.$.viewer.fullScreen(true);
			editor.$.viewer.codeView(true);
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);

			// Code area should have 100% height in full screen
			const codeFrame = editor.$.frameContext.get('code');
			if (codeFrame) {
				expect(codeFrame.style.height).toBe('100%');
			}
		});

		it('should handle exiting code view while in full screen', () => {
			editor.$.viewer.fullScreen(true);
			editor.$.viewer.codeView(true);
			editor.$.viewer.codeView(false);
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
			expect(editor.$.frameContext.get('isCodeView')).toBe(false);
		});

		it('should handle show blocks with other modes', () => {
			editor.$.viewer.showBlocks(true);
			editor.$.viewer.fullScreen(true);
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
		});
	});
});
