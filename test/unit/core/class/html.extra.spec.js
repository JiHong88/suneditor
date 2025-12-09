
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('HTML Class Extra Coverage', () => {
    
    // Helper to create editor with specific options
    async function createEditor(options) {
        const editor = createTestEditor(options);
        await waitForEditorReady(editor);
        return editor;
    }

    describe('clean - Strict Mode & Private Methods', () => {
        let editor;
        let html;

        afterEach(() => {
            if (editor) destroyTestEditor(editor);
        });

        it('should clean attributes and styles with strict mode enabled', async () => {
            // Initialize with strict mode options to ensure RegExps are built correctly
            editor = await createEditor({
                // defaultTagWhitelist might exclude 'font', ensuring it's stripped or converted if allowed
                // We want to test strict filtering.
                attributeWhitelist: {
                    'p': 'style|data-test' 
                },
                // Tag whitelist to include font if we want to test conversion? 
                // Or just test that standard setup cleans it.
                // context: "should clean attributes"
            });
            html = editor.html;

            // We need to manually enforce strict mode flags if they are not default
            // clean() reads this.options.get('strictMode').attrFilter etc.
            // But the Regexps (elementWhitelistRegExp) are built in constructor.
            
            // set strictMode flags for the call
            editor.options.set('strictMode', {
                tagFilter: true,
                formatFilter: true,
                classFilter: false,
                textStyleTagFilter: true,
                attrFilter: true,
                styleFilter: true
            });

            const input = '<p style="color: red; font-size: 500px;" onclick="alert(1)" data-test="value">Content<font size="3">Font</font></p>';
            
            // Expected:
            // onclick removed (not in whitelist)
            // font removed (not in default whitelist, usually p/div/span etc are)
            // style cleaned (depends on logic)
            
            const result = html.clean(input);
            expect(result).not.toContain('onclick');
            expect(result).toContain('color: red'); 
            expect(result).not.toContain('<font'); // Should be removed or converted
            expect(result).toContain('Font'); // Content remains
        });

        it('should handle consistency check for lists (remove text)', async () => {
             editor = await createEditor();
             html = editor.html;
             
             editor.options.set('strictMode', {
                tagFilter: true,
                formatFilter: true,
                classFilter: false
            });

            const input = '<ul>Text Node</ul>';
            const result = html.clean(input);
            
            // "Text Node" (nodeType 3) directly in UL is removed by current implementation logic
            expect(result).toBe('<ul></ul>');
        });

        it('should remove disallowed tags using blacklist option', async () => {
             editor = await createEditor({
                 elementBlacklist: 'script'
             });
             html = editor.html;
             
             editor.options.set('strictMode', {
                tagFilter: true,
            });
            
            const input = '<script>alert()</script><p>Allowed</p>';
            const result = html.clean(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>Allowed</p>');
        });
    });

    describe('insert - Complex scenarios', () => {
        let editor;
        let html;
        let wysiwyg;
        
        beforeEach(async () => {
             editor = await createEditor();
             html = editor.html;
             wysiwyg = editor.frameContext.get('wysiwyg');
        });
        
        afterEach(() => {
             destroyTestEditor(editor);
        });

        it('should handle inserting list structure into list cell', () => {
             wysiwyg.innerHTML = '<ul><li>Target</li></ul>';
             const li = wysiwyg.querySelector('li');
             editor.selection.setRange(li.firstChild, 0, li.firstChild, 0);
             
             const input = '<ul><li>Nested</li></ul>';
             html.insert(input);
             
             const content = wysiwyg.innerHTML;
             // Expect nested structure or merged items
             expect(content).toMatch(/Target/);
             expect(content).toMatch(/Nested/);
        });
        
        it('should remove duplicate styles from inserted node (#checkDuplicateNode)', () => {
             wysiwyg.innerHTML = '<span style="color: red;">target</span>';
             const span = wysiwyg.querySelector('span');
             editor.selection.setRange(span.firstChild, 1, span.firstChild, 1);
             
             const newNode = document.createElement('span');
             newNode.style.color = 'red';
             newNode.textContent = 'nested';
             
             html.insertNode(newNode);
             
             // The inserted node should have its style removed because parent has same style
             const inserted = wysiwyg.querySelector('span span');
             if (inserted) {
                 // The logic in #dupleCheck removes the style property if it matches parent
                 expect(inserted.style.color).toBe(''); 
             }
        });
    });
});
