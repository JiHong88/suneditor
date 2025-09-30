import ListFormat from '../../../../src/core/class/listFormat.js';
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Core - ListFormat', () => {
    let editor;
    let listFormat;
    let wysiwyg;

    beforeEach(async () => {
        editor = createTestEditor();
        await waitForEditorReady(editor);
        listFormat = editor.core.eventManager.listFormat;
        wysiwyg = editor.context.get('wysiwyg');
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    describe('apply method', () => {
        it('should convert a paragraph to an unordered list', () => {
            // given
            wysiwyg.innerHTML = '<p>test</p>';
            const p = wysiwyg.querySelector('p');
            const text = p.firstChild;
            editor.core.eventManager.selection.setRange(text, 0, text, 4);

            // when
            listFormat.apply('ul');

            // then
            expect(wysiwyg.innerHTML).toBe('<ul style=\"list-style-type: \"><li>test</li></ul>');
        });

        it('should convert a paragraph to an ordered list', () => {
            // given
            wysiwyg.innerHTML = '<p>test</p>';
            const p = wysiwyg.querySelector('p');
            const text = p.firstChild;
            editor.core.eventManager.selection.setRange(text, 0, text, 4);

            // when
            listFormat.apply('ol');

            // then
            expect(wysiwyg.innerHTML).toBe('<ol style=\"list-style-type: \"><li>test</li></ol>');
        });

        it('should convert a paragraph to an unordered list with circle style', () => {
            // given
            wysiwyg.innerHTML = '<p>test</p>';
            const p = wysiwyg.querySelector('p');
            const text = p.firstChild;
            editor.core.eventManager.selection.setRange(text, 0, text, 4);

            // when
            listFormat.apply('ul:circle');

            // then
            expect(wysiwyg.innerHTML).toBe('<ul style=\"list-style-type: circle\"><li>test</li></ul>');
        });

        it('should convert multiple paragraphs to a list', () => {
            // given
            wysiwyg.innerHTML = '<p>line 1</p><p>line 2</p>';
            const p1 = wysiwyg.querySelector('p');
            const p2 = wysiwyg.querySelectorAll('p')[1];
            const text1 = p1.firstChild;
            const text2 = p2.firstChild;
            editor.core.eventManager.selection.setRange(text1, 0, text2, 6);

            // when
            listFormat.apply('ul');

            // then
            expect(wysiwyg.innerHTML).toBe('<ul style=\"list-style-type: \"><li>line 1</li><li>line 2</li></ul>');
        });

        it('should create a list in an empty editor', () => {
            // given
            wysiwyg.innerHTML = '<p><br></p>';
            const br = wysiwyg.querySelector('br');
            editor.core.eventManager.selection.setRange(br.parentElement, 0, br.parentElement, 0);

            // when
            listFormat.apply('ul');

            // then
            expect(wysiwyg.innerHTML).toBe('<ul style=\"list-style-type: \"><li>\u200b<br></li></ul>');
        });
    });

    describe('remove method', () => {
        it('should convert a list back to a paragraph', () => {
            // given
            wysiwyg.innerHTML = '<ul><li>test</li></ul>';
            const li = wysiwyg.querySelector('li');
            const text = li.firstChild;
            editor.core.eventManager.selection.setRange(text, 0, text, 4);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            // when
            listFormat.remove(selectedCells);

            // then
            expect(wysiwyg.innerHTML).toBe('<p>test</p>');
        });

        it('should convert a list with multiple items to paragraphs', () => {
            // given
            wysiwyg.innerHTML = '<ul><li>line 1</li><li>line 2</li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li2 = wysiwyg.querySelectorAll('li')[1];
            const text1 = li1.firstChild;
            const text2 = li2.firstChild;
            editor.core.eventManager.selection.setRange(text1, 0, text2, 6);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            // when
            listFormat.remove(selectedCells);

            // then
            expect(wysiwyg.innerHTML).toBe('<p>line 1</p><p>line 2</p>');
        });

        it('should delete the list item when shouldDelete is true', () => {
            // given
            wysiwyg.innerHTML = '<ul><li>test</li></ul>';
            const li = wysiwyg.querySelector('li');
            const text = li.firstChild;
            editor.core.eventManager.selection.setRange(text, 0, text, 4);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            // when
            listFormat.remove(selectedCells, true);

            // then
            expect(wysiwyg.innerHTML).toBe('');
        });
    });

    describe('applyNested method', () => {
        it('should indent a list item', () => {
            // given
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];
            const selectedCells = [li2];

            // when
            listFormat.applyNested(selectedCells, true);

            // then
            expect(wysiwyg.innerHTML).toBe('<ul><li>one</li></ul><p>two</p>');
        });
    });

    describe('removeNested method', () => {
        it('should unindent a nested list item', () => {
            // given
            wysiwyg.innerHTML = '<ul><li>one<ul><li>two</li></ul></li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];

            // when
            listFormat.removeNested(li2);

            // then
            expect(wysiwyg.innerHTML).toBe('<ul><li>one</li></ul><ul><li>two</li></ul>');
        });
    });
});
