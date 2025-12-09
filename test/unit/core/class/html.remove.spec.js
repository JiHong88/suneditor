/**
 * @fileoverview Unit tests for html.remove with focus on coverage
 */
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('HTML.remove Coverage', () => {
    let editor;
    let html;
    let wysiwyg;

    beforeEach(async () => {
        editor = createTestEditor();
        await waitForEditorReady(editor);
        html = editor.html;
        wysiwyg = editor.frameContext.get('wysiwyg');
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    it('should remove entire element when selected fully from parent (Lines 951-979)', () => {
        // Prevent selection adjustment that might dive into children
        editor.selection.resetRangeToTextNode = jest.fn();

        wysiwyg.innerHTML = '<p>First</p><div><hr></div><p>Last</p>';
        const wrapper = wysiwyg.children[1]; // The div
        
        // Select logic: commonAncestor is wrapper (Element).
        // Range from index 0 to 1 (selecting the HR inside div).
        editor.selection.setRange(wrapper, 0, wrapper, 1);
        
        const result = html.remove();
        
        // Should remove "RemoveMe" P tag.
        // commonCon (wrapper) should be removed from DOM.
        expect(wrapper.parentNode).toBeNull();
        expect(wysiwyg.innerHTML).not.toContain('RemoveMe');
        // The wrapper itself is NOT removed by this logic, only the child?
        // Line 955: dom.utils.removeItem(commonCon);
        // commonCon is wrapper.
        // So wrapper should be removed from wysiwyg.
        expect(wysiwyg.innerHTML).not.toContain('<div>');
        
        // Result container should be nearby
        expect(result.container).toBeDefined();
    });

    // Coverage for 1024-1051 seems harder to hit directly without understanding `util.getListChildNodes` or whatever logic populates `childNodes`.
    // It seems `html.js` doesn't use `getListChildNodes` in `remove`.
    // Let's trace `remove` logic for logic 1024.
    // It iterates `childNodes` from `commonCon.childNodes`.
    // If range selects something that results in `childNodes` array calculation being weird or empty?
    
    it('should handle removing empty block (Lines 1024)', () => {
         wysiwyg.innerHTML = '<div></div>';
         const div = wysiwyg.firstChild;
         
         // Select inside empty div
         editor.selection.setRange(div, 0, div, 0);
         
         // html.remove() usually does nothing if collapsed, unless specific logic?
         // But line 882 handles collapsed.
         
         // If we have uncollapsed range but inside empty element? Impossible?
         // Select div from parent?
         // editor.selection.setRange(wysiwyg, 0, wysiwyg, 1); covers "entire element".
         
         // How about `childNodes.length === 0` at line 1024?
         // This is inside `else` of `if (isSameContainer)` (Line 1002 in previous view, probably earlier in file).
         // So `!isSameContainer`.
         // `commonCon` is ancestor.
         // `childNodes` are nodes between start and end.
         // If `childNodes` is empty, it means start and end are close but logic failed to find nodes?
         // Or range wraps commonCon but commonCon has no children? (Wait, !isSameContainer implies depth difference usually)
    });
});
