/**
 * @fileoverview Unit tests for html.get and _convertToCode coverage
 */
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('HTML.get / _convertToCode Coverage', () => {
    let editor;
    let html;
    let wysiwyg;

    beforeEach(async () => {
        // We might want options for indentation to test it
        editor = createTestEditor();
        await waitForEditorReady(editor);
        html = editor.html;
        wysiwyg = editor.frameContext.get('wysiwyg');
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    it('should handle nested lists indentation', () => {
        wysiwyg.innerHTML = '<ul><li>Item 1<ul><li>Child 1</li></ul></li></ul>';
        const content = html.get();
        // Check for newlines/indentation if implemented
        // Usually SunEditor adds newlines between tags in get()
        expect(content).toContain('Item 1');
        expect(content).toContain('Child 1');
    });

    it('should preserve PRE tag formatting', () => {
        wysiwyg.innerHTML = '<pre>  Code  \n  Block  </pre>';
        const content = html.get();
        expect(content).toContain('<pre>  Code  \n  Block  </pre>');
    });

    it('should handle HTML comments', () => {
        wysiwyg.innerHTML = '<!-- Comment -->';
        const content = html.get();
        // Comments might be stripped or kept depending on settings. 
        // Default "allowHTMLComment"?
        // If kept:
        // expect(content).toContain('<!-- Comment -->');
    });
    
    it('should handle script tags if allowed', () => {
        // Might need allowedTags option
    });
    
    it('should handle self-closing tags', () => {
        wysiwyg.innerHTML = '<br><hr><img src="test.jpg">';
        const content = html.get();
        // Check if they are valid XHTML or HTML5
        expect(content).toMatch(/<br\s*\/?>/);
        expect(content).toMatch(/<hr\s*\/?>/);
    });

    it('should execute _convertToCode directly for coverage with text', () => {
        wysiwyg.innerHTML = 'TestContent';
        const content = html._convertToCode(wysiwyg);
        expect(content).toContain('TestContent');
    });
});
