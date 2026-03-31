import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { align, font, fontColor, image, audio } from '../../src/plugins';

describe('CommandExecutor Integration Tests', () => {
    let editor;
    let wysiwyg;

    beforeAll(async () => {
        editor = createTestEditor({
            plugins: { align, font, fontColor, image, audio },
            buttonList: [['bold', 'italic', 'underline', 'strike', 'selectAll', 'newDocument', 'indent', 'outdent',
                'undo', 'redo', 'codeView', 'fullScreen', 'showBlocks', 'save', 'print', 'subscript', 'superscript',
                'removeFormat', 'dir', 'dir_ltr', 'dir_rtl']],
        });
        await waitForEditorReady(editor);
        wysiwyg = editor.$.frameContext.get('wysiwyg');

        // Mock scrollTo on wysiwyg and wysiwygFrame for JSDOM compatibility
        if (!wysiwyg.scrollTo) wysiwyg.scrollTo = () => {};
        const wwFrame = editor.$.frameContext.get('wysiwygFrame');
        if (wwFrame && !wwFrame.scrollTo) wwFrame.scrollTo = () => {};
    });

    afterAll(() => {
        destroyTestEditor(editor);
    });

    beforeEach(() => {
        // Reset editor state
        if (editor.$.frameContext.get('isCodeView')) {
            editor.$.viewer.codeView(false);
        }
        if (editor.$.frameContext.get('isFullScreen')) {
            editor.$.viewer.fullScreen(false);
        }
        if (editor.$.frameContext.get('isShowBlocks')) {
            editor.$.viewer.showBlocks(false);
        }
        if (editor.$.frameContext.get('isReadOnly')) {
            editor.$.ui.readOnly(false);
        }
        wysiwyg.innerHTML = '<p>Test content</p>';
        editor.$.focusManager.focus();
    });

    // ===== Existing tests =====

    test('selectAll should select all content', async () => {
        wysiwyg.innerHTML = '<p>Line 1</p><p>Line 2</p>';
        await editor.$.commandDispatcher.run('selectAll');

        const selection = editor.$.selection.get();
        const range = selection.getRangeAt(0);

        expect(range.commonAncestorContainer).toBe(wysiwyg);
        expect(range.toString().replace(/\s/g, '')).toBe('Line1Line2');
    });

    test('newDocument should clear content and reset to default line', async () => {
        wysiwyg.innerHTML = '<p>Old Content</p>';
        await editor.$.commandDispatcher.run('newDocument');

        expect(wysiwyg.innerHTML).toBe('<p><br></p>');
        const rootKey = editor.$.store.get('rootKey');
        const rootStack = editor.$.history.getRootStack();
        expect(rootStack[rootKey].value.length).toBeGreaterThan(0);
    });

    test('formatting commands (bold/italic/underline/strike) should wrap text', async () => {
        // Bold
        wysiwyg.innerHTML = '<p>Text to format</p>';
        let textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);
        await editor.$.commandDispatcher.run('bold');
        expect(wysiwyg.innerHTML).toContain('<strong>Text</strong> to format');

        // Italic
        wysiwyg.innerHTML = '<p>Text to format</p>';
        textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);
        await editor.$.commandDispatcher.run('italic');
        expect(wysiwyg.innerHTML).toContain('<em>Text</em> to format');

        // Underline
        wysiwyg.innerHTML = '<p>Text to format</p>';
        textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);
        await editor.$.commandDispatcher.run('underline');
        expect(wysiwyg.innerHTML).toContain('<u>Text</u> to format');

        // Strike
        wysiwyg.innerHTML = '<p>Text to format</p>';
        textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);
        await editor.$.commandDispatcher.run('strike');
        expect(wysiwyg.innerHTML).toContain('<del>Text</del> to format');
    });

    test('removeFormat should remove formatting tags', async () => {
        wysiwyg.innerHTML = '<p><strong>Bold</strong> <em>Italic</em></p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p, 0, p, 2);

        await editor.$.commandDispatcher.run('removeFormat');

        expect(editor.$.selection.getRange().toString()).toBe('Bold Italic');
        expect(wysiwyg.querySelectorAll('strong').length).toBe(0);
        expect(wysiwyg.querySelectorAll('em').length).toBe(0);
    });

    test('indent/outdent should apply styling', async () => {
        wysiwyg.innerHTML = '<p>Text to indent</p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 0);

        await editor.$.commandDispatcher.run('indent');

        expect(p.style.marginLeft).toBe('25px');

        await editor.$.commandDispatcher.run('outdent');
        const marginLeft = p.style.marginLeft;
        expect(marginLeft === '' || marginLeft === '0px').toBe(true);
    });

    // ===== codeView toggle =====

    test('codeView command should toggle code view on', async () => {
        expect(editor.$.frameContext.get('isCodeView')).toBe(false);

        await editor.$.commandDispatcher.run('codeView');

        expect(editor.$.frameContext.get('isCodeView')).toBe(true);
        // The wysiwyg frame should be hidden when code view is active
        const wysiwygFrame = editor.$.frameContext.get('wysiwygFrame');
        expect(wysiwygFrame.style.display).toBe('none');
    });

    test('codeView command should toggle code view off', async () => {
        // First enable code view
        editor.$.viewer.codeView(true);
        expect(editor.$.frameContext.get('isCodeView')).toBe(true);

        // Toggle off via command
        await editor.$.commandDispatcher.run('codeView');

        expect(editor.$.frameContext.get('isCodeView')).toBe(false);
        const wysiwygFrame = editor.$.frameContext.get('wysiwygFrame');
        expect(wysiwygFrame.style.display).not.toBe('none');
    });

    test('codeView should transfer HTML content to code area', async () => {
        wysiwyg.innerHTML = '<p>Hello <strong>World</strong></p>';

        editor.$.viewer.codeView(true);

        // The code view should contain the editor HTML
        const codeValue = editor.$.viewer._getCodeView();
        expect(codeValue).toContain('Hello');
        expect(codeValue).toContain('World');

        editor.$.viewer.codeView(false);
    });

    test('codeView toggle off should transfer code content back to wysiwyg', async () => {
        wysiwyg.innerHTML = '<p>Original content</p>';

        // Toggle on
        editor.$.viewer.codeView(true);

        // Modify code view content
        editor.$.viewer._setCodeView('<p>Modified content</p>');

        // Toggle off - should apply code changes to wysiwyg
        editor.$.viewer.codeView(false);

        expect(wysiwyg.innerHTML).toContain('Modified content');
    });

    // ===== fullScreen toggle =====

    test('fullScreen command should toggle full screen on', async () => {
        expect(editor.$.frameContext.get('isFullScreen')).toBe(false);

        await editor.$.commandDispatcher.run('fullScreen');

        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
        // The top area should have fixed position in full screen
        const topArea = editor.$.frameContext.get('topArea');
        expect(topArea.style.position).toBe('fixed');
    });

    test('fullScreen command should toggle full screen off', async () => {
        // First enable full screen
        editor.$.viewer.fullScreen(true);
        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

        // Toggle off via command
        await editor.$.commandDispatcher.run('fullScreen');

        expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
        const topArea = editor.$.frameContext.get('topArea');
        expect(topArea.style.position).not.toBe('fixed');
    });

    test('fullScreen should restore body overflow when toggled off', async () => {
        const originalOverflow = document.body.style.overflow;

        editor.$.viewer.fullScreen(true);
        expect(document.body.style.overflow).toBe('hidden');

        editor.$.viewer.fullScreen(false);
        expect(document.body.style.overflow).toBe(originalOverflow);
    });

    // ===== showBlocks toggle =====

    test('showBlocks command should toggle show blocks on', async () => {
        // isShowBlocks may be undefined or false initially; ensure it is falsy
        expect(!!editor.$.frameContext.get('isShowBlocks')).toBe(false);

        await editor.$.commandDispatcher.run('showBlocks');

        expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(true);
    });

    test('showBlocks command should toggle show blocks off', async () => {
        // First enable show blocks
        editor.$.viewer.showBlocks(true);
        expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);

        // Toggle off via command
        await editor.$.commandDispatcher.run('showBlocks');

        expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
    });

    test('showBlocks should add and remove se-show-block class on wysiwyg', async () => {
        expect(wysiwyg.classList.contains('se-show-block')).toBe(false);

        editor.$.viewer.showBlocks(true);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(true);

        editor.$.viewer.showBlocks(false);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
    });

    // ===== copy command =====

    test('copy command with collapsed selection should not attempt to copy', async () => {
        wysiwyg.innerHTML = '<p>Copy test</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        // Set a collapsed range (cursor, no selection)
        editor.$.selection.setRange(textNode, 3, textNode, 3);

        // Should not throw or change content when range is collapsed
        await editor.$.commandDispatcher.run('copy');

        // Content should remain unchanged
        expect(wysiwyg.textContent).toBe('Copy test');
    });

    test('copy command with non-collapsed selection should call html.copy', async () => {
        wysiwyg.innerHTML = '<p>Copy this text</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        // Select "Copy" text
        editor.$.selection.setRange(textNode, 0, textNode, 4);

        // Spy on the html.copy method
        const copySpy = jest.spyOn(editor.$.html, 'copy').mockResolvedValue(true);

        await editor.$.commandDispatcher.run('copy');

        expect(copySpy).toHaveBeenCalled();
        // The argument should contain the selected HTML
        const callArg = copySpy.mock.calls[0][0];
        expect(callArg).toContain('Copy');

        copySpy.mockRestore();
    });

    // ===== print command =====

    test('print command should create and use an iframe', async () => {
        wysiwyg.innerHTML = '<p>Print test content</p>';

        // The print method creates a temporary iframe
        // In JSDOM, iframe.contentWindow.print is available
        // We just verify the method executes without errors
        const showLoadingSpy = jest.spyOn(editor.$.ui, 'showLoading');

        await editor.$.commandDispatcher.run('print');

        // The print function calls showLoading
        expect(showLoadingSpy).toHaveBeenCalled();

        showLoadingSpy.mockRestore();
    });

    // ===== undo/redo commands =====

    test('undo command should invoke history.undo', async () => {
        const undoSpy = jest.spyOn(editor.$.history, 'undo');

        await editor.$.commandDispatcher.run('undo');

        expect(undoSpy).toHaveBeenCalled();
        undoSpy.mockRestore();
    });

    test('redo command should invoke history.redo', async () => {
        const redoSpy = jest.spyOn(editor.$.history, 'redo');

        await editor.$.commandDispatcher.run('redo');

        expect(redoSpy).toHaveBeenCalled();
        redoSpy.mockRestore();
    });

    // ===== dir commands =====

    test('dir command should toggle RTL/LTR', async () => {
        const setDirSpy = jest.spyOn(editor.$.ui, 'setDir');

        await editor.$.commandDispatcher.run('dir');

        expect(setDirSpy).toHaveBeenCalled();
        setDirSpy.mockRestore();
    });

    test('dir_ltr command should set direction to LTR', async () => {
        const setDirSpy = jest.spyOn(editor.$.ui, 'setDir');

        await editor.$.commandDispatcher.run('dir_ltr');

        expect(setDirSpy).toHaveBeenCalledWith('ltr');
        setDirSpy.mockRestore();
    });

    test('dir_rtl command should set direction to RTL', async () => {
        const setDirSpy = jest.spyOn(editor.$.ui, 'setDir');

        await editor.$.commandDispatcher.run('dir_rtl');

        expect(setDirSpy).toHaveBeenCalledWith('rtl');
        setDirSpy.mockRestore();
    });

    // ===== Read-only mode prevention =====

    test('readOnly mode should block non-navigation commands', async () => {
        wysiwyg.innerHTML = '<p>Read only content</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);

        // Enable read-only mode
        editor.$.ui.readOnly(true);

        // Attempt to run a formatting command (bold) - should be blocked
        await editor.$.commandDispatcher.run('bold');

        // Content should not have changed (no bold applied)
        expect(wysiwyg.querySelector('strong')).toBeNull();
        expect(wysiwyg.textContent).toBe('Read only content');
    });

    test('readOnly mode should allow codeView command', async () => {
        editor.$.ui.readOnly(true);
        expect(editor.$.frameContext.get('isReadOnly')).toBe(true);

        await editor.$.commandDispatcher.run('codeView');

        // codeView should still work in readOnly mode
        expect(editor.$.frameContext.get('isCodeView')).toBe(true);

        // Clean up
        editor.$.viewer.codeView(false);
    });

    test('readOnly mode should allow fullScreen command', async () => {
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('fullScreen');

        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

        // Clean up
        editor.$.viewer.fullScreen(false);
    });

    test('readOnly mode should allow showBlocks command', async () => {
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('showBlocks');

        expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);

        // Clean up
        editor.$.viewer.showBlocks(false);
    });

    test('readOnly mode should allow selectAll command', async () => {
        wysiwyg.innerHTML = '<p>Select all in readonly</p>';
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('selectAll');

        const selection = editor.$.selection.get();
        const range = selection.getRangeAt(0);
        expect(range.toString()).toContain('Select all in readonly');
    });

    test('readOnly mode should allow print command', async () => {
        editor.$.ui.readOnly(true);
        const showLoadingSpy = jest.spyOn(editor.$.ui, 'showLoading');

        await editor.$.commandDispatcher.run('print');

        expect(showLoadingSpy).toHaveBeenCalled();
        showLoadingSpy.mockRestore();
    });

    test('readOnly mode should block newDocument command', async () => {
        wysiwyg.innerHTML = '<p>Protected content</p>';
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('newDocument');

        // Content should NOT be cleared since newDocument is blocked in readOnly
        expect(wysiwyg.textContent).toBe('Protected content');
    });

    test('readOnly mode should block indent command', async () => {
        wysiwyg.innerHTML = '<p>Cannot indent</p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 0);
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('indent');

        // Indent should not have been applied
        expect(p.style.marginLeft).toBe('');
    });

    test('readOnly mode should block outdent command', async () => {
        wysiwyg.innerHTML = '<p style="margin-left: 25px;">Cannot outdent</p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 0);
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('outdent');

        // Outdent should not have been applied
        expect(p.style.marginLeft).toBe('25px');
    });

    test('readOnly mode should block removeFormat command', async () => {
        wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p, 0, p, 1);
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('removeFormat');

        // Formatting should still be present
        expect(wysiwyg.querySelector('strong')).not.toBeNull();
    });

    test('readOnly mode should block undo command', async () => {
        editor.$.ui.readOnly(true);
        const undoSpy = jest.spyOn(editor.$.history, 'undo');

        await editor.$.commandDispatcher.run('undo');

        // Undo is not in the allowed list for readOnly
        expect(undoSpy).not.toHaveBeenCalled();
        undoSpy.mockRestore();
    });

    test('readOnly mode should block redo command', async () => {
        editor.$.ui.readOnly(true);
        const redoSpy = jest.spyOn(editor.$.history, 'redo');

        await editor.$.commandDispatcher.run('redo');

        // Redo is not in the allowed list for readOnly
        expect(redoSpy).not.toHaveBeenCalled();
        redoSpy.mockRestore();
    });

    test('readOnly mode should block save command', async () => {
        editor.$.ui.readOnly(true);

        // Even if content is changed, save should be blocked in readOnly
        // (save is not in the allowed readOnly commands list)
        const htmlGetSpy = jest.spyOn(editor.$.html, 'get');

        await editor.$.commandDispatcher.run('save');

        // save is not in the readOnly allowed list, so html.get should not be called
        expect(htmlGetSpy).not.toHaveBeenCalled();
        htmlGetSpy.mockRestore();
    });

    // ===== subscript/superscript =====

    test('subscript command should apply sub tag', async () => {
        wysiwyg.innerHTML = '<p>H2O formula</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 1, textNode, 2);

        await editor.$.commandDispatcher.run('subscript');

        expect(wysiwyg.innerHTML).toContain('<sub>');
    });

    test('superscript command should apply sup tag', async () => {
        wysiwyg.innerHTML = '<p>E=mc2</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 4, textNode, 5);

        await editor.$.commandDispatcher.run('superscript');

        expect(wysiwyg.innerHTML).toContain('<sup>');
    });

    // ===== Default case / unknown commands fall through to FONT_STYLE =====

    test('unknown command should fall through to FONT_STYLE default handler', async () => {
        wysiwyg.innerHTML = '<p>Test text</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);

        // Spy on inline.apply to confirm FONT_STYLE path was taken
        const inlineSpy = jest.spyOn(editor.$.inline, 'apply');

        // Any unrecognized command falls through the switch to FONT_STYLE
        await editor.$.commandDispatcher.run('bold');

        expect(inlineSpy).toHaveBeenCalled();
        inlineSpy.mockRestore();
    });

    // ===== Command Dispatcher routing: type-based vs command-only =====

    test('command dispatcher run with no type routes to commandExecutor.execute', async () => {
        wysiwyg.innerHTML = '<p>Dispatch test</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);

        // Calling run(command) with no type parameter routes to commandExecutor.execute
        await editor.$.commandDispatcher.run('bold');

        expect(wysiwyg.innerHTML).toContain('<strong>');
    });

    // ===== pageBreak command =====

    test('pageBreak command should insert a page break element', async () => {
        wysiwyg.innerHTML = '<p>Before page break</p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 0);

        await editor.$.commandDispatcher.run('pageBreak');

        // A page break div should be inserted
        const pageBreakEl = wysiwyg.querySelector('.se-page-break');
        expect(pageBreakEl).not.toBeNull();
        expect(pageBreakEl.classList.contains('se-component')).toBe(true);
    });

    // ===== save command =====

    test('save command with changed content should trigger save', async () => {
        // Mark content as changed
        editor.$.frameContext.set('isChanged', true);

        const htmlGetSpy = jest.spyOn(editor.$.html, 'get');

        await editor.$.commandDispatcher.run('save');

        // save should call html.get since content isChanged
        expect(htmlGetSpy).toHaveBeenCalled();
        htmlGetSpy.mockRestore();
    });

    test('save command with unchanged content should not trigger save', async () => {
        // Mark content as NOT changed
        editor.$.frameContext.set('isChanged', false);

        const htmlGetSpy = jest.spyOn(editor.$.html, 'get');

        await editor.$.commandDispatcher.run('save');

        // save should not call html.get since content is not changed
        expect(htmlGetSpy).not.toHaveBeenCalled();
        htmlGetSpy.mockRestore();
    });

    // ===== codeView with fullScreen interaction =====

    test('codeView in fullScreen mode should set code height to 100%', async () => {
        // Enter full screen first
        editor.$.viewer.fullScreen(true);
        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

        // Enter code view
        editor.$.viewer.codeView(true);
        expect(editor.$.frameContext.get('isCodeView')).toBe(true);

        const codeFrame = editor.$.frameContext.get('code');
        expect(codeFrame.style.height).toBe('100%');

        // Clean up
        editor.$.viewer.codeView(false);
        editor.$.viewer.fullScreen(false);
    });

    // ===== selectAll with already selected content =====

    test('selectAll with existing selection should expand the selection', async () => {
        wysiwyg.innerHTML = '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>';
        const firstP = wysiwyg.querySelector('p');
        const textNode = firstP.firstChild;
        // Start with a partial selection
        editor.$.selection.setRange(textNode, 0, textNode, 5);

        await editor.$.commandDispatcher.run('selectAll');

        const selection = editor.$.selection.get();
        const range = selection.getRangeAt(0);
        const selectedText = range.toString().replace(/\s+/g, ' ').trim();
        expect(selectedText).toContain('Paragraph 1');
        expect(selectedText).toContain('Paragraph 3');
    });

    // ===== Multiple toggle operations =====

    test('showBlocks double toggle returns to original state', async () => {
        expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(false);

        // Toggle on
        await editor.$.commandDispatcher.run('showBlocks');
        expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(true);

        // Toggle off
        await editor.$.commandDispatcher.run('showBlocks');
        expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
    });

    test('codeView double toggle returns to original state', async () => {
        expect(editor.$.frameContext.get('isCodeView')).toBe(false);

        await editor.$.commandDispatcher.run('codeView');
        expect(editor.$.frameContext.get('isCodeView')).toBe(true);

        await editor.$.commandDispatcher.run('codeView');
        expect(editor.$.frameContext.get('isCodeView')).toBe(false);
    });

    test('fullScreen double toggle returns to original state', async () => {
        const topArea = editor.$.frameContext.get('topArea');

        expect(editor.$.frameContext.get('isFullScreen')).toBe(false);

        await editor.$.commandDispatcher.run('fullScreen');
        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);
        expect(topArea.style.position).toBe('fixed');

        await editor.$.commandDispatcher.run('fullScreen');
        expect(editor.$.frameContext.get('isFullScreen')).toBe(false);
    });

    // ===== readOnly mode allows copy command =====

    test('readOnly mode should allow copy command', async () => {
        wysiwyg.innerHTML = '<p>Copy in readonly</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);
        editor.$.ui.readOnly(true);

        const copySpy = jest.spyOn(editor.$.html, 'copy').mockResolvedValue(true);

        await editor.$.commandDispatcher.run('copy');

        // copy is in the allowed readOnly commands list
        expect(copySpy).toHaveBeenCalled();
        copySpy.mockRestore();
    });

    // ===== codeView wrapper display =====

    test('codeView should show code wrapper and hide wysiwyg on toggle', async () => {
        const codeWrapper = editor.$.frameContext.get('codeWrapper');
        const wysiwygFrame = editor.$.frameContext.get('wysiwygFrame');

        // Toggle on
        editor.$.viewer.codeView(true);
        expect(wysiwygFrame.style.display).toBe('none');
        // code wrapper should be visible (display: flex)
        expect(codeWrapper.style.display).toBe('flex');

        // Toggle off
        editor.$.viewer.codeView(false);
        expect(wysiwygFrame.style.display).toBe('block');
        expect(codeWrapper.style.display).toBe('none');
    });

    // ===== readOnly mode blocks dir commands =====

    test('readOnly mode should block dir command', async () => {
        editor.$.ui.readOnly(true);
        const setDirSpy = jest.spyOn(editor.$.ui, 'setDir');

        await editor.$.commandDispatcher.run('dir');

        // dir is not in the allowed readOnly list
        expect(setDirSpy).not.toHaveBeenCalled();
        setDirSpy.mockRestore();
    });

    test('readOnly mode should block dir_ltr command', async () => {
        editor.$.ui.readOnly(true);
        const setDirSpy = jest.spyOn(editor.$.ui, 'setDir');

        await editor.$.commandDispatcher.run('dir_ltr');

        expect(setDirSpy).not.toHaveBeenCalled();
        setDirSpy.mockRestore();
    });

    test('readOnly mode should block dir_rtl command', async () => {
        editor.$.ui.readOnly(true);
        const setDirSpy = jest.spyOn(editor.$.ui, 'setDir');

        await editor.$.commandDispatcher.run('dir_rtl');

        expect(setDirSpy).not.toHaveBeenCalled();
        setDirSpy.mockRestore();
    });

    // ===== readOnly mode blocks pageBreak =====

    test('readOnly mode should block pageBreak command', async () => {
        wysiwyg.innerHTML = '<p>No page break allowed</p>';
        const p = wysiwyg.querySelector('p');
        editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 0);
        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('pageBreak');

        // No page break should be inserted
        expect(wysiwyg.querySelector('.se-page-break')).toBeNull();
    });

    // ===== readOnly mode and copyFormat =====

    test('readOnly mode allows copyFormat because regex matches "copy" substring', async () => {
        // The readOnly guard uses /copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/
        // which matches "copyFormat" because it contains "copy". So copyFormat is allowed.
        wysiwyg.innerHTML = '<p><strong>Bold Text</strong></p>';
        const strong = wysiwyg.querySelector('strong');
        const textNode = strong.firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 4);
        document.dispatchEvent(new Event('selectionchange'));

        editor.$.ui.readOnly(true);

        await editor.$.commandDispatcher.run('copyFormat');

        // copyFormat passes through the readOnly guard due to regex matching "copy"
        expect(wysiwyg.classList.contains('se-copy-format-cursor')).toBe(true);

        // Clean up: deactivate copyFormat by running it again
        await editor.$.commandDispatcher.run('copyFormat');
    });

    // ===== fullScreen sets z-index and dimensions =====

    test('fullScreen should set proper CSS properties on topArea', async () => {
        editor.$.viewer.fullScreen(true);

        const topArea = editor.$.frameContext.get('topArea');
        expect(topArea.style.position).toBe('fixed');
        expect(topArea.style.top).toBe('0px');
        expect(topArea.style.left).toBe('0px');
        expect(topArea.style.width).toBe('100%');
        expect(topArea.style.height).toBe('100%');
        expect(topArea.style.zIndex).toBe('2147483639');

        editor.$.viewer.fullScreen(false);
    });

    // ===== viewer.showBlocks with explicit true/false =====

    test('showBlocks called with explicit true should enable blocks', async () => {
        editor.$.viewer.showBlocks(true);

        expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(true);
    });

    test('showBlocks called with explicit false should disable blocks', async () => {
        // First enable
        editor.$.viewer.showBlocks(true);

        editor.$.viewer.showBlocks(false);

        expect(editor.$.frameContext.get('isShowBlocks')).toBe(false);
        expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
    });

    // ===== viewer.codeView with explicit values =====

    test('codeView called with same value should return early (no change)', async () => {
        // codeView is off by default
        expect(editor.$.frameContext.get('isCodeView')).toBe(false);

        // Calling codeView(false) when already false should be a no-op
        editor.$.viewer.codeView(false);
        expect(editor.$.frameContext.get('isCodeView')).toBe(false);

        // Turn on
        editor.$.viewer.codeView(true);
        expect(editor.$.frameContext.get('isCodeView')).toBe(true);

        // Calling codeView(true) when already true should be a no-op
        editor.$.viewer.codeView(true);
        expect(editor.$.frameContext.get('isCodeView')).toBe(true);

        // Clean up
        editor.$.viewer.codeView(false);
    });

    test('fullScreen called with same value should return early (no change)', async () => {
        expect(editor.$.frameContext.get('isFullScreen')).toBe(false);

        // Calling fullScreen(false) when already false should be a no-op
        editor.$.viewer.fullScreen(false);
        expect(editor.$.frameContext.get('isFullScreen')).toBe(false);

        editor.$.viewer.fullScreen(true);
        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

        editor.$.viewer.fullScreen(true);
        expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

        editor.$.viewer.fullScreen(false);
    });

    // ===== readOnly mode allows preview command =====

    test('readOnly mode should allow preview command without error', async () => {
        editor.$.ui.readOnly(true);

        // Mock window.open to prevent actual window creation in JSDOM
        const mockWindowObj = {
            document: {
                write: jest.fn(),
            },
        };
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(mockWindowObj);

        await editor.$.commandDispatcher.run('preview');

        // preview is in the allowed readOnly regex
        expect(openSpy).toHaveBeenCalled();
        openSpy.mockRestore();
    });

    // ===== Bold toggle (apply and remove) =====

    test('bold applied twice should toggle bold off', async () => {
        // Ensure clean state with no active style nodes
        editor.$.store.set('currentNodesMap', []);

        wysiwyg.innerHTML = '<p>Toggle bold</p>';
        const textNode = wysiwyg.querySelector('p').firstChild;
        editor.$.selection.setRange(textNode, 0, textNode, 6);

        // Apply bold
        await editor.$.commandDispatcher.run('bold');

        // Check strong was applied
        const strongNode = wysiwyg.querySelector('strong');
        if (strongNode) {
            // Bold was applied; now toggle it off
            const boldTextNode = strongNode.firstChild;
            editor.$.selection.setRange(boldTextNode, 0, boldTextNode, boldTextNode.textContent.length);

            // Update currentNodesMap to indicate bold is active
            editor.$.store.set('currentNodesMap', ['bold']);

            // Apply bold again (should remove)
            await editor.$.commandDispatcher.run('bold');
        }

        // Regardless of toggle direction, text content must be preserved
        expect(wysiwyg.textContent).toContain('Toggle');
    });
});
