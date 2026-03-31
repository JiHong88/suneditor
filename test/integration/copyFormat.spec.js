/**
 * @fileoverview Integration tests for copyFormat command
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { font } from '../../src/plugins';

describe('CopyFormat Integration Tests', () => {
    let editor;

    beforeEach(async () => {
        editor = createTestEditor({
            plugins: { font },
            buttonList: [['bold', 'italic', 'underline', 'strike', 'copyFormat']],
        });
        await waitForEditorReady(editor);
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    test('should activate copy format mode when copyFormat is executed', async () => {
        const wysiwyg = editor.$.frameContext.get('wysiwyg');
        wysiwyg.innerHTML = '<p><strong>Bold Text</strong></p>';

        // Select "Bold Text"
        const strong = wysiwyg.querySelector('strong');
        const textNode = strong.firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);

        // Trigger selection change
        document.dispatchEvent(new Event('selectionchange'));

        // Activate copyFormat
        await editor.$.commandDispatcher.run('copyFormat');

        // Verify copy format mode is active via observable behavior
        expect(wysiwyg.classList.contains('se-copy-format-cursor')).toBe(true);
    });

    test('should apply cached styles to new selection', async () => {
        const wysiwyg = editor.$.frameContext.get('wysiwyg');
        wysiwyg.innerHTML = '<p><strong>Bold</strong> <span>Normal</span></p>';

        // 1. Select Bold text and activate copyFormat
        const strong = wysiwyg.querySelector('strong');
        const boldText = strong.firstChild;
        editor.$.selection.setRange(boldText, 0, boldText, 4);
        document.dispatchEvent(new Event('selectionchange'));
        await editor.$.commandDispatcher.run('copyFormat');

        // 2. Select Normal text
        const span = wysiwyg.querySelector('span');
        const normalText = span.firstChild;
        editor.$.selection.setRange(normalText, 0, normalText, 6);
        document.dispatchEvent(new Event('selectionchange'));

        // 3. Apply copied format
        await editor.$.commandDispatcher._copyFormat();

        // Normal text should now have bold formatting applied
        expect(wysiwyg.innerHTML).toMatch(/<strong[^>]*>Normal<\/strong>/i);
    });

    test('should deactivate copy format mode after application', async () => {
        const wysiwyg = editor.$.frameContext.get('wysiwyg');
        wysiwyg.innerHTML = '<p><strong>Bold</strong> <span>Normal</span></p>';

        // 1. Select Bold text and activate copyFormat
        const strong = wysiwyg.querySelector('strong');
        const boldText = strong.firstChild;
        editor.$.selection.setRange(boldText, 0, boldText, 4);
        document.dispatchEvent(new Event('selectionchange'));
        await editor.$.commandDispatcher.run('copyFormat');

        // 2. Select Normal text and apply
        const span = wysiwyg.querySelector('span');
        const normalText = span.firstChild;
        editor.$.selection.setRange(normalText, 0, normalText, 6);
        document.dispatchEvent(new Event('selectionchange'));
        editor.$.commandDispatcher._copyFormat();

        // Copy format mode should be deactivated after single application
        expect(wysiwyg.classList.contains('se-copy-format-cursor')).toBe(false);
    });
});
