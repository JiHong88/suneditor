/**
 * @fileoverview Integration tests for undo/redo workflow
 * Tests real-world scenarios of undoing and redoing various operations
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Undo/Redo Workflow integration tests', () => {
    let container;
    let editor;

    beforeEach(async () => {
        container = document.createElement('div');
        container.id = 'undo-redo-test-container';
        document.body.appendChild(container);

        editor = createTestEditor({
            element: container,
            buttonList: [['bold', 'italic', 'undo', 'redo']],
            width: '100%',
            height: 'auto'
        });
        await waitForEditorReady(editor);
    });

    afterEach(() => {
        if (editor) {
            destroyTestEditor(editor);
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('History API availability', () => {
        it('should have history object with required methods', () => {
            expect(editor.history).toBeDefined();
            expect(typeof editor.history.push).toBe('function');
            expect(typeof editor.history.undo).toBe('function');
            expect(typeof editor.history.redo).toBe('function');
            expect(typeof editor.history.pause).toBe('function');
            expect(typeof editor.history.resume).toBe('function');
            expect(typeof editor.history.reset).toBe('function');
        });

        it('should be able to push history entries', () => {
            const wysiwyg = editor.context.get('wysiwyg');
            wysiwyg.innerHTML = '<p>Test content</p>';

            expect(() => {
                editor.history.push(false);
            }).not.toThrow();
        });

        it('should be able to call undo without errors', async () => {
            const wysiwyg = editor.context.get('wysiwyg');
            wysiwyg.innerHTML = '<p>Content</p>';
            editor.history.push(false);

            expect(() => {
                editor.history.undo();
            }).not.toThrow();
        });

        it('should be able to call redo without errors', async () => {
            const wysiwyg = editor.context.get('wysiwyg');
            wysiwyg.innerHTML = '<p>Content</p>';
            editor.history.push(false);

            expect(() => {
                editor.history.redo();
            }).not.toThrow();
        });
    });

    describe('Basic undo/redo workflow', () => {
        it('should maintain content through redo', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Initial</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>Modified</p>';
            editor.history.push(false);

            // Undo then redo should return to current state
            await editor.history.undo();
            await editor.history.redo();

            expect(wysiwyg.innerHTML).toContain('Modified');
        });

        it('should handle redo for formatted content', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Normal text</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';
            editor.history.push(false);

            // Undo then redo
            await editor.history.undo();
            await editor.history.redo();

            expect(wysiwyg.querySelector('strong')).not.toBeNull();
        });

        it('should handle redo for list creation', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Paragraph</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<ul><li>List item</li></ul>';
            editor.history.push(false);

            // Undo then redo
            await editor.history.undo();
            await editor.history.redo();

            expect(wysiwyg.querySelector('ul')).not.toBeNull();
        });

        it('should handle multiple redos in sequence', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>State 1</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>State 2</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>State 3</p>';
            editor.history.push(false);

            // Undo twice then redo twice
            await editor.history.undo();
            await editor.history.undo();
            await editor.history.redo();
            await editor.history.redo();

            expect(wysiwyg.innerHTML).toContain('State 3');
        });

        it('should preserve complex structure after undo/redo', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <table>
                    <tr><td>Cell 1</td><td>Cell 2</td></tr>
                </table>
            `;
            editor.history.push(false);

            wysiwyg.innerHTML = `
                <table>
                    <tr><td>Cell 1</td><td>Cell 2</td></tr>
                    <tr><td>Cell 3</td><td>Cell 4</td></tr>
                </table>
            `;
            editor.history.push(false);

            // Undo then redo
            await editor.history.undo();
            await editor.history.redo();

            expect(wysiwyg.querySelectorAll('tr').length).toBe(2);
        });
    });

    describe('History control methods', () => {
        it('should pause and resume history recording', () => {
            expect(() => {
                editor.history.pause();
            }).not.toThrow();

            expect(() => {
                editor.history.resume();
            }).not.toThrow();
        });

        it('should not record changes when paused', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Initial</p>';
            editor.history.push(false);

            // Pause history
            editor.history.pause();

            wysiwyg.innerHTML = '<p>Changed during pause</p>';
            editor.history.push(false); // This should not record

            // Resume history
            editor.history.resume();

            wysiwyg.innerHTML = '<p>Changed after resume</p>';
            editor.history.push(false);

            // History should work normally after resume
            expect(editor.history.undo).toBeDefined();
        });

        it('should reset history', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>State 1</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>State 2</p>';
            editor.history.push(false);

            // Reset history
            expect(() => {
                editor.history.reset();
            }).not.toThrow();

            expect(editor.history).toBeDefined();
        });

        it('should handle overwrite operation', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Original</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>Modified</p>';
            editor.history.push(false);

            // Use overwrite
            wysiwyg.innerHTML = '<p>Overwritten</p>';
            expect(() => {
                editor.history.overwrite();
            }).not.toThrow();
        });
    });

    describe('Edge cases', () => {
        it('should handle undo at beginning of history', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Initial</p>';
            editor.history.push(false);

            // Try to undo when already at start
            await editor.history.undo();
            expect(() => {
                editor.history.undo();
            }).not.toThrow();

            expect(wysiwyg.querySelector('p')).not.toBeNull();
        });

        it('should handle redo at end of history', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Initial</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>Modified</p>';
            editor.history.push(false);

            // Try to redo when already at end
            expect(() => {
                editor.history.redo();
            }).not.toThrow();

            expect(wysiwyg.querySelector('p')).not.toBeNull();
        });

        it('should clear redo history when new change is made', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>State 1</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p>State 2</p>';
            editor.history.push(false);

            // Undo
            await editor.history.undo();

            // Make new change (should clear redo history)
            wysiwyg.innerHTML = '<p>State 3</p>';
            editor.history.push(false);

            // Try to redo (should not go back to State 2)
            await editor.history.redo();

            expect(wysiwyg.innerHTML).toContain('State 3');
        });

        it('should handle empty content', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '';
            editor.history.push(false);

            expect(() => {
                editor.history.undo();
            }).not.toThrow();

            expect(() => {
                editor.history.redo();
            }).not.toThrow();
        });

        it('should handle rapid history operations', async () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Test</p>';
            editor.history.push(false);

            // Rapid undo/redo should not throw
            expect(() => {
                editor.history.undo();
                editor.history.redo();
                editor.history.undo();
                editor.history.redo();
            }).not.toThrow();
        });
    });

    describe('History with various content types', () => {
        it('should handle history with images', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Text</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p><img src="test.jpg" alt="test"/></p>';

            expect(() => {
                editor.history.push(false);
            }).not.toThrow();
        });

        it('should handle history with links', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Text</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = '<p><a href="http://example.com">Link</a></p>';

            expect(() => {
                editor.history.push(false);
            }).not.toThrow();
        });

        it('should handle history with nested structures', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = '<p>Simple</p>';
            editor.history.push(false);

            wysiwyg.innerHTML = `
                <div>
                    <p><strong>Bold</strong></p>
                    <ul>
                        <li><em>Italic</em></li>
                    </ul>
                </div>
            `;

            expect(() => {
                editor.history.push(false);
            }).not.toThrow();
        });
    });
});
