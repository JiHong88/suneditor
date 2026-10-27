/**
 * @fileoverview Integration tests for Viewer (codeView, fullScreen, showBlocks)
 * Tests src/core/logic/panel/viewer.js through real editor instance
 */

import { markdown } from '../../src/helper';

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

describe('Viewer Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['codeView', 'markdownView', 'fullScreen', 'showBlocks']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('markdownView', () => {
		it.each([
			'Read the **Rules**. Then set `title` (max 100).\n\n- Set `title` (max 100).\n- Use **bold** here.\n\n5. Fifth step.\n6. Sixth step.\n',
			'0. Zero\n1. One\n\nParagraph.\n\n3. Three\n4. Four\n',
		])('preserves text and list starts across three view toggles: %s', (md) => {
			editor.$.html.set(markdown.markdownToHtml(md));
			for (let i = 0; i < 3; i++) {
				editor.$.viewer.markdownView(true);
				expect(editor.$.frameContext.get('markdown').value).toBe(md);
				editor.$.viewer.markdownView(false);
			}
		});

		it.each([
			'<ol start="-2"><li>First</li><li>Next</li></ol>',
			'<ul><li>Parent<ol start="-2"><li>Nested</li></ol></li></ul>',
		])('preserves negative list starts across view toggles: %s', (html) => {
			editor.$.html.set(html);
			const expected = editor.$.frameContext.get('wysiwyg').innerHTML;
			for (let i = 0; i < 3; i++) {
				editor.$.viewer.markdownView(true);
				editor.$.viewer.markdownView(false);
				expect(editor.$.frameContext.get('wysiwyg').innerHTML).toBe(expected);
			}
		});

		it('still honors an explicit start attribute blacklist', async () => {
			const filteredEditor = createTestEditor({ attributeBlacklist: { ol: 'start' } });
			try {
				await waitForEditorReady(filteredEditor);
				filteredEditor.$.html.set('<ol start="5"><li>Item</li></ol>');
				expect(filteredEditor.$.frameContext.get('wysiwyg').querySelector('ol').hasAttribute('start')).toBe(false);
			} finally {
				destroyTestEditor(filteredEditor);
			}
		});
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

		it('should add se-source-view-status class to wrapper when on', () => {
			editor.$.viewer.codeView(true);
			const wrapper = editor.$.frameContext.get('wrapper');
			expect(wrapper.classList.contains('se-source-view-status')).toBe(true);
		});

		it('should remove se-source-view-status class from wrapper when off', () => {
			editor.$.viewer.codeView(true);
			editor.$.viewer.codeView(false);
			const wrapper = editor.$.frameContext.get('wrapper');
			expect(wrapper.classList.contains('se-source-view-status')).toBe(false);
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
