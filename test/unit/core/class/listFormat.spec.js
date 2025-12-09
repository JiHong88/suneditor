/**
 * @fileoverview Unit tests for ListFormat.js
 */
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('ListFormat Coverage', () => {
    let editor;
    let listFormat;
    let wysiwyg;

    beforeEach(async () => {
        editor = createTestEditor();
        await waitForEditorReady(editor);
        listFormat = editor.listFormat;
        wysiwyg = editor.frameContext.get('wysiwyg');
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    describe('apply method', () => {
        it('should convert paragraphs to list items', () => {
            wysiwyg.innerHTML = '<p>Item 1</p><p>Item 2</p>';
            const p1 = wysiwyg.children[0];
            const p2 = wysiwyg.children[1];
            
            // Select both P
            editor.selection.setRange(p1.firstChild, 0, p2.firstChild, 6);
            
            // Apply UL
            listFormat.apply('ul');
            
            const ul = wysiwyg.querySelector('ul');
            expect(ul).toBeTruthy();
            expect(ul.children.length).toBe(2);
        });

        it('should toggle list off if already same list', () => {
             wysiwyg.innerHTML = '<ul><li>Item 1</li></ul>';
             const li = wysiwyg.querySelector('li');
             
             editor.selection.setRange(li.firstChild, 0, li.firstChild, 6);
             
             // Apply UL again -> should revert to P
             listFormat.apply('ul');
             
             expect(wysiwyg.querySelector('p')).toBeTruthy();
             expect(wysiwyg.querySelector('ul')).toBeFalsy();
        });
        
        it('should change list type', () => {
             wysiwyg.innerHTML = '<ul><li>Item 1</li></ul>';
             const li = wysiwyg.querySelector('li');
             editor.selection.setRange(li.firstChild, 0, li.firstChild, 6);
             
             listFormat.apply('ol');
             
             expect(wysiwyg.querySelector('ol')).toBeTruthy();
        });
    });

    describe('applyNested (Indent)', () => {
        it('should indent list item (create nested list)', () => {
             wysiwyg.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';
             const listItems = wysiwyg.querySelectorAll('li');
             // Item 1 is at index 0, Item 2 is at index 1
             const li2 = listItems[1];
             
             editor.selection.setRange(li2.firstChild, 0, li2.firstChild, 6);
             
             // Indent
             listFormat.applyNested([li2], false);
             
             // Expected: <ul><li>Item 1<ul><li>Item 2</li></ul></li></ul>
             const nestedUl = wysiwyg.querySelector('ul ul');
             expect(nestedUl).toBeTruthy();
             expect(nestedUl.contains(li2)).toBe(true); // check if li2 is inside (Wait, logic might create new LI)
             expect(nestedUl.textContent).toContain('Item 2');
        });

        it('should merge with previous nested list (trigger attachNested)', () => {
             // <ul><li>1<ul><li>1.1</li></ul></li><li>2</li></ul>
             wysiwyg.innerHTML = '<ul><li>1<ul><li>1.1</li></ul></li><li>2</li></ul>';
             // Flattened: 0='1', 1='1.1', 2='2'
             const li2 = wysiwyg.querySelectorAll('li')[2]; // li for "2"
             // Wait, querySelectorAll gives flattened list?
             // li[0] = 1, li[1] = 1.1, li[2] = 2.
             
             editor.selection.setRange(li2.firstChild, 0, li2.firstChild, 1);
             
             // Indent "2" -> should become 1.2
             listFormat.applyNested([li2], false);
             
             // Check merge
             const nestedUl = wysiwyg.querySelector('ul ul');
             expect(nestedUl.children.length).toBe(2); // 1.1 and 2
        });
    });

    describe('removeNested (Outdent)', () => {
         it('should outdent nested list item', () => {
             wysiwyg.innerHTML = '<ul><li>1<ul><li>1.1</li></ul></li></ul>';
             const liInner = wysiwyg.querySelector('ul ul li');
             
             editor.selection.setRange(liInner.firstChild, 0, liInner.firstChild, 3);
             
             // Outdent
             listFormat.applyNested([liInner], false); // nested=false means outdent
             // Or call removeNested directly if exposed? public API is applyNested typically uses removeNested internally?
             // Wait, applyNested calls removeNested if nested is false.
             
             expect(wysiwyg.querySelectorAll('ul > li').length).toBe(2);
         });
    });
});
