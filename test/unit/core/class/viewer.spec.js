import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import Viewer from '../../../../src/core/class/viewer';
import { dom } from '../../../../src/helper';

describe('Viewer', () => {
    let editor;
    let viewer;
    let context;
    let wysiwyg, code, codeWrapper, toolbar;

    beforeEach(async () => {
        editor = await createTestEditor({
            mode: 'classic',
            value: '<p>init</p>'
        });
        viewer = editor.viewer;
        // Initialize basic mock elements if missing in frameContext (mocked editor might be minimal)
        // Check what verifyEditorReady does - it creates mock elements.
        
        await waitForEditorReady(editor);
        
        wysiwyg = editor.frameContext.get('wysiwyg');
        // Test editor mock might not create code/codeWrapper by default unless specific options
        // We might need to manually ensure they exist if the mock doesn't create them.
        
        if (!editor.frameContext.get('code')) {
            const codeEl = document.createElement('textarea');
            codeEl.className = 'se-wrapper-code';
            editor.frameContext.set('code', codeEl);
        }
        
        if (!editor.frameContext.get('codeWrapper')) {
             const cw = document.createElement('div');
             cw.className = 'se-code-wrapper';
             cw.style.display = 'none'; // hidden by default
             editor.frameContext.set('codeWrapper', cw);
        }
        
        if (!editor.frameContext.get('topArea')) {
             const top = document.createElement('div');
             editor.frameContext.set('topArea', top);
        }

        code = editor.frameContext.get('code');
        codeWrapper = editor.frameContext.get('codeWrapper');
        // toolbar_main is usually in context, not frameContext, but let's check viewer.js usage
        // viewer.js: const toolbar = this.context.get('toolbar_main');
        toolbar = editor.context.get('toolbar_main');
        
        // Ensure wysiwygFrame exists
        if (!editor.frameContext.get('wysiwygFrame')) {
             const wf = document.createElement('div');
             editor.frameContext.set('wysiwygFrame', wf);
        }
    });

    afterEach(() => {
        destroyTestEditor(editor);
        document.body.innerHTML = '';
        document.body.style.overflow = ''; // Reset global state
        jest.restoreAllMocks();
    });

    describe('codeView', () => {
        it('should toggle code view on', () => {
             expect(editor.frameContext.get('isCodeView')).toBe(false);
             
             viewer.codeView(true);
             
             expect(editor.frameContext.get('isCodeView')).toBe(true);
             expect(codeWrapper.style.display).toBe('flex');
             expect(wysiwyg.style.display).toBe('none');
             expect(code.value).toContain('<p>init</p>');
        });

        it('should toggle code view off', () => {
             viewer.codeView(true);
             // Modify code
             code.value = '<p>changed</p>';
             
             viewer.codeView(false);
             
             expect(editor.frameContext.get('isCodeView')).toBe(false);
             expect(codeWrapper.style.display).toBe('none');
             expect(wysiwyg.style.display).toBe('block');
             // Should sync back to wysiwyg
             expect(wysiwyg.innerHTML).toContain('changed');
        });
    });

    describe('fullScreen', () => {
         it('should toggle full screen on', () => {
              expect(editor.frameContext.get('isFullScreen')).toBe(false);
              
              const topArea = editor.frameContext.get('topArea');
              
              viewer.fullScreen(true);
              
              expect(editor.frameContext.get('isFullScreen')).toBe(true);
              expect(topArea.style.position).toBe('fixed');
              expect(topArea.style.top).toBe('0px');
              expect(document.body.style.overflow).toBe('hidden');
         });
         
         it('should toggle full screen off', () => {
              viewer.fullScreen(true);
              viewer.fullScreen(false);
              
              expect(editor.frameContext.get('isFullScreen')).toBe(false);
              expect(document.body.style.overflow).not.toBe('hidden');
         });
    });

    describe('showBlocks', () => {
         it('should toggle show blocks', () => {
              viewer.showBlocks(true);
              expect(editor.frameContext.get('isShowBlocks')).toBe(true);
              expect(wysiwyg.classList.contains('se-show-block')).toBe(true);
              
              viewer.showBlocks(false);
              expect(editor.frameContext.get('isShowBlocks')).toBe(false);
              expect(wysiwyg.classList.contains('se-show-block')).toBe(false);
         });
    });

    describe('print', () => {
         it('should call window print logic', (done) => {
              // Mock window.open not needed for print, but print creates an iframe
              // We need to spy on the iframe's contentWindow.print or check executions
              
              // print uses setTimeout 1000ms ?? Let's check source code again.
              // It creates an iframe, appends strict, waits 1000ms (or less?) then prints.
              // Actually source: setTimeout(() => { ... }, 1000);
              
              // We should probably rely on existing logic but we can mock setTimeout to speed up
              jest.useFakeTimers();
              
              // Mock creating element to capture the iframe
              const originalCreateElement = document.createElement;
              let printIframe;
              jest.spyOn(dom.utils, 'createElement').mockImplementation((tag, options) => {
                  const el = originalCreateElement.call(document, tag);
                  if (tag === 'IFRAME') {
                       printIframe = el;
                       // Mock contentWindow.print
                       Object.defineProperty(el, 'contentWindow', {
                           value: {
                               print: jest.fn(),
                               document: {
                                   write: jest.fn(),
                                   execCommand: jest.fn(),
                                   head: { innerHTML: '', querySelector: jest.fn() },
                                   body: { innerHTML: '', setAttribute: jest.fn() }
                               }
                           },
                           writable: true
                       });
                       // Mock dom.query.getIframeDocument helper if needed, or rely on it returning contentWindow.document
                  }
                  return el;
              });

              viewer.print();
              
              expect(dom.utils.createElement).toHaveBeenCalledWith('IFRAME', expect.anything());
              
              jest.runAllTimers();
              
              if (printIframe && printIframe.contentWindow) {
                   expect(printIframe.contentWindow.print).toHaveBeenCalled();
              }
              
              jest.useRealTimers();
              done();
         });
    });

    describe('preview', () => {
         it('should open preview window', () => {
              // Mock window.open
              const mockWindow = {
                  document: {
                      write: jest.fn(),
                      close: jest.fn()
                  },
                  focus: jest.fn()
              };
              global.open = jest.fn().mockReturnValue(mockWindow);
              // Editor options default 'previewTemplate' is null, so it uses html.get()
              
              viewer.preview();
              
              expect(global.open).toHaveBeenCalled();
              expect(mockWindow.document.write).toHaveBeenCalled();
              expect(mockWindow.document.write).toHaveBeenCalledWith(expect.stringContaining('<!DOCTYPE html>'));
         });
    });
});
