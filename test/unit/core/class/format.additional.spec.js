/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Format - Additional Coverage', () => {
    let editor;
    let format;

    beforeEach(async () => {
        editor = createTestEditor();
        await waitForEditorReady(editor);
        format = editor.format;
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    describe('documentType integration', () => {
        it('should call documentType reHeader when available', () => {
            // Mock documentType
            const mockDocumentType = { reHeader: jest.fn(), _destroy: jest.fn() };
            editor.frameContext.set('documentType_use_header', true);
            editor.frameContext.set('documentType', mockDocumentType);

            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';
            const p = wysiwyg.firstChild;

            // This should trigger line 72: documentType.reHeader()
            format.setLine(p, 'h1');

            expect(mockDocumentType.reHeader).toHaveBeenCalled();
        });
    });

    describe('Edge cases for better coverage', () => {
        it('should handle setLine with complex structures', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<div><p>test 1</p><p>test 2</p></div>';

            const div = wysiwyg.firstChild;
            const p1 = div.firstChild;
            const p2 = div.lastChild;

            // Select both paragraphs
            const range = editor.selection.getRange();
            range.setStart(p1.firstChild, 0);
            range.setEnd(p2.firstChild, 6);
            editor.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);

            expect(() => {
                format.setLine(p1, 'h2');
            }).not.toThrow();
        });

        it('should handle setBrLine with PRE element', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<pre>test content</pre>';
            const pre = wysiwyg.firstChild;

            expect(() => {
                format.setBrLine(pre, 'code');
            }).not.toThrow();
        });

        it('should handle addLine with table cell context', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<table><tr><td>cell content</td></tr></table>';
            const td = wysiwyg.querySelector('td');

            const result = format.addLine(td);
            expect(result).toBeTruthy();
        });

        it('should handle getBlock with complex nesting', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<blockquote><div><p>nested content</p></div></blockquote>';
            const p = wysiwyg.querySelector('p');

            const block = format.getBlock(p);
            expect(block).toBeTruthy();
        });

        it('should handle isEdgeLine at different positions', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test content here</p>';
            const p = wysiwyg.firstChild;
            const textNode = p.firstChild;

            // Test front edge
            const frontEdge = format.isEdgeLine(textNode, 0, 'front');
            expect(typeof frontEdge).toBe('boolean');

            // Test end edge
            const endEdge = format.isEdgeLine(textNode, textNode.textContent.length, 'end');
            expect(typeof endEdge).toBe('boolean');
        });

        it('should handle getLinesAndComponents with various options', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>line 1</p><figure class="se-component">component</figure><p>line 2</p>';

            // Select all content
            const range = editor.selection.getRange();
            range.selectNodeContents(wysiwyg);
            editor.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);

            const result = format.getLinesAndComponents(true, false);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle private method _lineWork', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p><p>test2</p>';

            const lines = [wysiwyg.firstChild, wysiwyg.lastChild];

            expect(() => {
                const result = format._lineWork(lines, false, 'p');
                expect(typeof result).toBe('object');
            }).not.toThrow();
        });

        it('should handle __resetBrLineBreak method', () => {
            expect(() => {
                format.__resetBrLineBreak('br');
                expect(format._brLineBreak).toBe(true);

                format.__resetBrLineBreak('p');
                expect(format._brLineBreak).toBe(false);
            }).not.toThrow();
        });
    });

    describe('Error handling', () => {
        it('should handle null validation functions gracefully', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';
            const p = wysiwyg.firstChild;

            const result = format.getLine(p, null);
            expect(result).toBeTruthy();
        });

        it('should handle empty selection ranges', () => {
            // Clear selection
            editor.selection.setRange(null, 0, null, 0);

            const lines = format.getLines();
            expect(Array.isArray(lines)).toBe(true);
        });
    });
});