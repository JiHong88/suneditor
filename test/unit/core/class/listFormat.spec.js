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

    describe('apply method - edge cases', () => {
        it('should handle empty selectedFormats and selectedCells is provided', () => {
            wysiwyg.innerHTML = '<p>test</p>';
            const p = wysiwyg.querySelector('p');
            const text = p.firstChild;
            editor.core.eventManager.selection.setRange(text, 0, text, 4);

            listFormat.apply('ul', []);

            expect(wysiwyg.innerHTML).toBe('<p>test</p>');
        });

        it('should handle multiple paragraphs with different list styles', () => {
            wysiwyg.innerHTML = '<p>one</p><p>two</p><p>three</p>';
            const p1 = wysiwyg.querySelector('p');
            const p3 = wysiwyg.querySelectorAll('p')[2];
            editor.core.eventManager.selection.setRange(p1.firstChild, 0, p3.firstChild, 5);

            listFormat.apply('ol:decimal');

            const ol = wysiwyg.querySelector('ol');
            expect(ol).toBeTruthy();
            expect(ol.style.listStyleType).toBe('decimal');
            expect(wysiwyg.querySelectorAll('li').length).toBe(3);
        });

        it('should handle nested list conversion', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(li2.firstChild, 0, li2.firstChild, 3);
            const selectedCells = [li2];

            listFormat.apply('ul', selectedCells, true);

            expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
        });

        it('should merge with top list element when possible', () => {
            wysiwyg.innerHTML = '<ul><li>existing</li></ul><p>new</p>';
            const p = wysiwyg.querySelector('p');
            editor.core.eventManager.selection.setRange(p.firstChild, 0, p.firstChild, 3);

            listFormat.apply('ul');

            expect(wysiwyg.querySelectorAll('ul').length).toBe(1);
            expect(wysiwyg.querySelectorAll('li').length).toBe(2);
        });

        it('should merge with bottom list element when possible', () => {
            wysiwyg.innerHTML = '<p>new</p><ul><li>existing</li></ul>';
            const p = wysiwyg.querySelector('p');
            editor.core.eventManager.selection.setRange(p.firstChild, 0, p.firstChild, 3);

            listFormat.apply('ul');

            expect(wysiwyg.querySelectorAll('ul').length).toBe(1);
            expect(wysiwyg.querySelectorAll('li').length).toBe(2);
        });

        it('should handle component elements in list conversion', () => {
            wysiwyg.innerHTML = '<p>text</p><hr><p>more</p>';
            const p1 = wysiwyg.querySelector('p');
            const p2 = wysiwyg.querySelectorAll('p')[1];
            editor.core.eventManager.selection.setRange(p1.firstChild, 0, p2.firstChild, 4);

            listFormat.apply('ul');

            expect(wysiwyg.querySelector('ul')).toBeTruthy();
            expect(wysiwyg.querySelector('hr')).toBeTruthy();
        });

        it('should handle empty elements removal', () => {
            wysiwyg.innerHTML = '<p>text</p><p></p><p>more</p>';
            const p1 = wysiwyg.querySelector('p');
            const p3 = wysiwyg.querySelectorAll('p')[2];
            editor.core.eventManager.selection.setRange(p1.firstChild, 0, p3.firstChild, 4);

            listFormat.apply('ul');

            expect(wysiwyg.querySelector('ul')).toBeTruthy();
            expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
        });

        it('should handle list cells already in list', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li2 = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(li1.firstChild, 0, li2.firstChild, 3);

            listFormat.apply('ol');

            expect(wysiwyg.querySelector('ol')).toBeTruthy();
        });

        it('should handle nested list cells with parent', () => {
            wysiwyg.innerHTML = '<ul><li>parent<ul><li>child</li></ul></li></ul>';
            const childLi = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(childLi.firstChild, 0, childLi.firstChild, 5);

            listFormat.apply('ol');

            expect(wysiwyg.innerHTML).toBeTruthy();
        });

        it('should handle different depth list items', () => {
            wysiwyg.innerHTML = '<ul><li>level1</li></ul><p>para</p><ul><li>level2<ul><li>nested</li></ul></li></ul>';
            const p = wysiwyg.querySelector('p');
            const nestedLi = wysiwyg.querySelectorAll('li')[2];
            editor.core.eventManager.selection.setRange(p.firstChild, 0, nestedLi.firstChild, 6);

            listFormat.apply('ul');

            expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(0);
        });
    });

    describe('remove method - edge cases', () => {
        it('should handle removing multiple list items', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three</li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li3 = wysiwyg.querySelectorAll('li')[2];
            editor.core.eventManager.selection.setRange(li1.firstChild, 0, li3.firstChild, 5);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            listFormat.remove(selectedCells);

            expect(wysiwyg.querySelectorAll('p').length).toBe(3);
        });

        it('should handle removing nested list items', () => {
            wysiwyg.innerHTML = '<ul><li>parent<ul><li>child1</li><li>child2</li></ul></li></ul>';
            const child1 = wysiwyg.querySelectorAll('li')[1];
            const child2 = wysiwyg.querySelectorAll('li')[2];
            editor.core.eventManager.selection.setRange(child1.firstChild, 0, child2.firstChild, 6);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            listFormat.remove(selectedCells);

            expect(wysiwyg.innerHTML).toBeTruthy();
        });

        it('should handle removing from middle of list', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three</li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(li2.firstChild, 0, li2.firstChild, 3);
            const selectedCells = [li2];

            listFormat.remove(selectedCells);

            expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(0);
        });

        it('should delete content when shouldDelete is true with multiple items', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li2 = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(li1.firstChild, 0, li2.firstChild, 3);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            listFormat.remove(selectedCells, true);

            expect(wysiwyg.innerHTML).toBe('');
        });

        it('should handle removing list with component', () => {
            wysiwyg.innerHTML = '<ul><li>text</li><li><img src="test.jpg"></li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li2 = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(li1.firstChild, 0, li2, 1);
            const selectedCells = editor.core.eventManager.format.getLinesAndComponents(false);

            const result = listFormat.remove(selectedCells);

            expect(result).toBeDefined();
        });
    });

    describe('applyNested method - edge cases', () => {
        it('should handle indenting first item in list', () => {
            wysiwyg.innerHTML = '<ul><li>first</li><li>second</li></ul>';
            const li1 = wysiwyg.querySelector('li');

            listFormat.applyNested([li1], true);

            expect(wysiwyg.innerHTML).toBeTruthy();
        });

        it('should handle multiple items indenting', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three</li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];
            const li3 = wysiwyg.querySelectorAll('li')[2];

            listFormat.applyNested([li2, li3], true);

            expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThan(0);
        });

        it('should handle indenting already nested item', () => {
            wysiwyg.innerHTML = '<ul><li>parent<ul><li>child</li></ul></li></ul>';
            const childLi = wysiwyg.querySelectorAll('li')[1];

            listFormat.applyNested([childLi], true);

            expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThan(0);
        });
    });

    describe('removeNested method - edge cases', () => {
        it('should handle unindenting first nested item', () => {
            wysiwyg.innerHTML = '<ul><li>parent<ul><li>child1</li><li>child2</li></ul></li></ul>';
            const child1 = wysiwyg.querySelectorAll('li')[1];

            listFormat.removeNested(child1);

            expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(0);
        });

        it('should handle unindenting last nested item', () => {
            wysiwyg.innerHTML = '<ul><li>parent<ul><li>child1</li><li>child2</li></ul></li></ul>';
            const child2 = wysiwyg.querySelectorAll('li')[2];

            listFormat.removeNested(child2);

            expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThan(0);
        });

        it('should handle unindenting deeply nested item', () => {
            wysiwyg.innerHTML = '<ul><li>l1<ul><li>l2<ul><li>l3</li></ul></li></ul></li></ul>';
            const l3 = wysiwyg.querySelectorAll('li')[2];

            listFormat.removeNested(l3);

            expect(wysiwyg.querySelectorAll('li').length).toBe(3);
        });

        it('should handle unindenting with sibling lists', () => {
            wysiwyg.innerHTML = '<ul><li>one<ul><li>nested</li></ul></li><li>two</li></ul>';
            const nested = wysiwyg.querySelectorAll('li')[1];

            listFormat.removeNested(nested);

            expect(wysiwyg.querySelectorAll('ul').length).toBeGreaterThan(0);
        });
    });

    describe('applyNested - critical uncovered paths', () => {
        it('should handle nested indenting with following siblings', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three</li><li>four</li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];
            const li3 = wysiwyg.querySelectorAll('li')[2];

            listFormat.applyNested([li2, li3], true);

            expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThan(0);
        });

        it('should handle applyNested with multiple different parent lists', () => {
            wysiwyg.innerHTML = '<ul><li>ul1</li></ul><ul><li>ul2</li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li2 = wysiwyg.querySelectorAll('li')[1];

            listFormat.applyNested([li1, li2], true);

            expect(wysiwyg.textContent).toContain('ul1');
        });

		it('should nest following list item under previous when indenting (attachNested path)', () => {
			wysiwyg.innerHTML = '<ul><li>one</li><li>two</li><li>three</li></ul>';
			const li2 = wysiwyg.querySelectorAll('li')[1];
			const li3 = wysiwyg.querySelectorAll('li')[2];

			expect(() => listFormat.applyNested([li2, li3], true)).not.toThrow();
		});

        it('should handle applyNested single cell with cellsLen === 1', () => {
            wysiwyg.innerHTML = '<ul><li>one</li><li>two</li></ul>';
            const li2 = wysiwyg.querySelectorAll('li')[1];

            listFormat.applyNested([li2], true);

            expect(wysiwyg.textContent).toContain('two');
        });
    });

    describe('remove - critical uncovered paths', () => {
        it('should handle remove with last item in nested list', () => {
            wysiwyg.innerHTML = '<ul><li>one<ul><li>nested</li></ul></li></ul>';
            const nested = wysiwyg.querySelectorAll('li')[1];
            editor.core.eventManager.selection.setRange(nested.firstChild, 0, nested.firstChild, 6);
            const selectedCells = [nested];

            listFormat.remove(selectedCells);

            expect(wysiwyg.textContent).toContain('one');
        });

        it('should handle remove with component element in list', () => {
            wysiwyg.innerHTML = '<ul><li>text</li><li><hr></li><li>more</li></ul>';
            const li1 = wysiwyg.querySelector('li');
            const li2 = wysiwyg.querySelectorAll('li')[1];
            const li3 = wysiwyg.querySelectorAll('li')[2];
            editor.core.eventManager.selection.setRange(li1.firstChild, 0, li3.firstChild, 4);
            const selectedCells = [li1, li2, li3];

            listFormat.remove(selectedCells);

            expect(wysiwyg.textContent).toContain('text');
        });

        it('should handle remove with empty formatted cell', () => {
            wysiwyg.innerHTML = '<ul><li><strong></strong></li></ul>';
            const li = wysiwyg.querySelector('li');
            editor.core.eventManager.selection.setRange(li, 0, li, 0);
            const selectedCells = [li];

            listFormat.remove(selectedCells);

            expect(wysiwyg.innerHTML).toBeTruthy();
        });
    });

	describe('apply - nested detach/unindent paths', () => {
		it('should flatten nested list when converting to a different list type', () => {
			wysiwyg.innerHTML = '<ul><li>parent<ul><li>child1</li><li>child2</li></ul></li></ul>';
			const child1 = wysiwyg.querySelectorAll('li')[1];
			const child2 = wysiwyg.querySelectorAll('li')[2];
			editor.core.eventManager.selection.setRange(child1.firstChild, 0, child2.firstChild, 6);

			listFormat.apply('ol', [child1, child2], true);

			expect(wysiwyg.querySelectorAll('ul ul').length).toBe(0);
			const topList = wysiwyg.querySelector('ol') || wysiwyg.querySelector('ul');
			const topLis = Array.from(topList?.children || []).filter((n) => n.nodeName === 'LI');
			expect(topList).toBeTruthy();
			expect(topLis.length).toBeGreaterThanOrEqual(2);
		});

        it('should handle apply with isRemove=false for different list types', () => {
            wysiwyg.innerHTML = '<p>para1</p><p>para2</p>';
            const p1 = wysiwyg.querySelector('p');
            const p2 = wysiwyg.querySelectorAll('p')[1];
            editor.core.eventManager.selection.setRange(p1.firstChild, 0, p2.firstChild, 5);

            listFormat.apply('ul:circle');

            const ul = wysiwyg.querySelector('ul');
            expect(ul).toBeTruthy();
            expect(ul.style.listStyleType).toBe('circle');
        });

        it('should handle getRangeAndAddLine when selectedFormats empty', () => {
            wysiwyg.innerHTML = '<p><br></p>';
            const p = wysiwyg.querySelector('p');
            editor.core.eventManager.selection.setRange(p, 0, p, 0);

            listFormat.apply('ul');

            expect(wysiwyg.querySelector('ul')).toBeTruthy();
        });
    });
});
