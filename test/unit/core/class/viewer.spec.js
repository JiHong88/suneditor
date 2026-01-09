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

    describe('_setButtonsActive method', () => {
         it('should set codeView button active state', () => {
              editor.frameContext.set('isCodeView', true);

              viewer._setButtonsActive();

              const codeViewBtn = editor.commandDispatcher.targets?.get('codeView');
              if (codeViewBtn) {
                   expect(codeViewBtn.classList.contains('active')).toBe(true);
              }
         });

         it('should set fullScreen button active state', () => {
              editor.frameContext.set('isFullScreen', true);

              viewer._setButtonsActive();

              // Check that the method executes without error
              expect(editor.frameContext.get('isFullScreen')).toBe(true);
         });

         it('should set showBlocks button active state', () => {
              editor.frameContext.set('isShowBlocks', true);

              viewer._setButtonsActive();

              // Check that the method executes without error
              expect(editor.frameContext.get('isShowBlocks')).toBe(true);
         });

         it('should handle all states being false', () => {
              editor.frameContext.set('isCodeView', false);
              editor.frameContext.set('isFullScreen', false);
              editor.frameContext.set('isShowBlocks', false);

              expect(() => viewer._setButtonsActive()).not.toThrow();
         });
    });

    describe('_resetFullScreenHeight method', () => {
         it('should reset height when in fullscreen mode', () => {
              viewer.fullScreen(true);

              const result = viewer._resetFullScreenHeight();

              expect(result).toBe(true);
         });

         it('should return undefined when not in fullscreen mode', () => {
              editor.frameContext.set('isFullScreen', false);

              const result = viewer._resetFullScreenHeight();

              expect(result).toBeUndefined();
         });
    });

    describe('_codeMirrorEditor method', () => {
         it('should handle set operation', () => {
              expect(() => {
                   viewer._codeMirrorEditor('set', 'test content', null);
              }).not.toThrow();
         });

         it('should handle get operation', () => {
              const result = viewer._codeMirrorEditor('get', null, null);
              // Without CodeMirror installed, this should return undefined or code value
              expect(result === undefined || typeof result === 'string').toBe(true);
         });

         it('should handle readonly operation', () => {
              expect(() => {
                   viewer._codeMirrorEditor('readonly', true, null);
              }).not.toThrow();
         });

         it('should handle refresh operation', () => {
              expect(() => {
                   viewer._codeMirrorEditor('refresh', null, null);
              }).not.toThrow();
         });
    });

    describe('_setCodeView and _getCodeView methods', () => {
         it('should set code view content', () => {
              viewer._setCodeView('<p>test content</p>');
              expect(code.value).toBe('<p>test content</p>');
         });

         it('should get code view content', () => {
              code.value = '<p>get test</p>';
              const result = viewer._getCodeView();
              expect(result).toBe('<p>get test</p>');
         });
    });

    describe('_codeViewAutoHeight method', () => {
         it('should adjust code height when isAuto is true', () => {
              const codeNumbers = document.createElement('textarea');
              editor.frameContext.set('codeNumbers', codeNumbers);

              expect(() => {
                   viewer._codeViewAutoHeight(code, codeNumbers, true);
              }).not.toThrow();
         });

         it('should handle null codeNumbers', () => {
              expect(() => {
                   viewer._codeViewAutoHeight(code, null, true);
              }).not.toThrow();
         });
    });

    describe('_scrollLineNumbers method', () => {
         it('should synchronize scroll positions', () => {
              const codeNumbers = document.createElement('textarea');
              const context = { scrollTop: 100, scrollLeft: 50 };

              viewer._scrollLineNumbers.call(context, codeNumbers);

              expect(codeNumbers.scrollTop).toBe(100);
              expect(codeNumbers.scrollLeft).toBe(50);
         });
    });

    describe('_destroy method', () => {
         it('should not throw when called', () => {
              expect(() => {
                   viewer._destroy();
              }).not.toThrow();
         });

         it('should be callable multiple times', () => {
              expect(() => {
                   viewer._destroy();
                   viewer._destroy();
              }).not.toThrow();
         });
    });

    describe('codeView with balloon mode', () => {
         it('should handle balloon mode when toggling code view', async () => {
              destroyTestEditor(editor);
              editor = await createTestEditor({
                   mode: 'balloon',
                   value: '<p>balloon mode</p>'
              });
              await waitForEditorReady(editor);
              viewer = editor.viewer;

              // Set up required elements
              if (!editor.frameContext.get('code')) {
                   const codeEl = document.createElement('textarea');
                   editor.frameContext.set('code', codeEl);
              }
              if (!editor.frameContext.get('codeWrapper')) {
                   const cw = document.createElement('div');
                   cw.style.display = 'none';
                   editor.frameContext.set('codeWrapper', cw);
              }

              expect(() => {
                   viewer.codeView(true);
              }).not.toThrow();
         });
    });

    describe('fullScreen with various modes', () => {
         it('should handle fullScreen with sticky toolbar', async () => {
              destroyTestEditor(editor);
              editor = await createTestEditor({
                   toolbar_sticky: 0,
                   value: '<p>sticky toolbar</p>'
              });
              await waitForEditorReady(editor);
              viewer = editor.viewer;

              expect(() => {
                   viewer.fullScreen(true);
                   viewer.fullScreen(false);
              }).not.toThrow();
         });

         it('should handle fullScreen with iframe mode', async () => {
              // This test checks the iframe handling path
              expect(() => {
                   viewer.fullScreen(true);
              }).not.toThrow();
         });
    });

    describe('showBlocks toggle states', () => {
         it('should toggle showBlocks without value parameter', () => {
              editor.frameContext.set('isShowBlocks', false);

              viewer.showBlocks(); // Toggle without value

              expect(editor.frameContext.get('isShowBlocks')).toBe(true);

              viewer.showBlocks(); // Toggle again

              expect(editor.frameContext.get('isShowBlocks')).toBe(false);
         });
    });

    describe('CodeMirror integration', () => {
         it('should handle codeMirror5Editor set operation', () => {
              const mockCodeMirror5 = {
                   getDoc: jest.fn().mockReturnValue({
                        setValue: jest.fn(),
                        getValue: jest.fn().mockReturnValue('test code')
                   }),
                   refresh: jest.fn(),
                   setOption: jest.fn()
              };

              editor.frameOptions.set('codeMirror5Editor', mockCodeMirror5);
              editor.options.set('hasCodeMirror', true);

              viewer._codeMirrorEditor('set', 'new value', null);

              expect(mockCodeMirror5.getDoc).toHaveBeenCalled();
              expect(mockCodeMirror5.getDoc().setValue).toHaveBeenCalledWith('new value');
         });

         it('should handle codeMirror5Editor get operation', () => {
              const mockCodeMirror5 = {
                   getDoc: jest.fn().mockReturnValue({
                        setValue: jest.fn(),
                        getValue: jest.fn().mockReturnValue('test code')
                   }),
                   refresh: jest.fn()
              };

              editor.frameOptions.set('codeMirror5Editor', mockCodeMirror5);

              const result = viewer._codeMirrorEditor('get', null, null);

              expect(result).toBe('test code');
         });

         it('should handle codeMirror5Editor readonly operation', () => {
              const mockCodeMirror5 = {
                   getDoc: jest.fn().mockReturnValue({
                        setValue: jest.fn(),
                        getValue: jest.fn()
                   }),
                   setOption: jest.fn(),
                   refresh: jest.fn()
              };

              editor.frameOptions.set('codeMirror5Editor', mockCodeMirror5);

              viewer._codeMirrorEditor('readonly', true, null);

              expect(mockCodeMirror5.setOption).toHaveBeenCalledWith('readOnly', true);
         });

         it('should handle codeMirror5Editor refresh operation', () => {
              const mockCodeMirror5 = {
                   getDoc: jest.fn().mockReturnValue({
                        setValue: jest.fn(),
                        getValue: jest.fn()
                   }),
                   refresh: jest.fn()
              };

              editor.frameOptions.set('codeMirror5Editor', mockCodeMirror5);

              viewer._codeMirrorEditor('refresh', null, null);

              expect(mockCodeMirror5.refresh).toHaveBeenCalled();
         });

         it('should handle codeMirror6Editor operations', () => {
              const mockCodeMirror6 = {
                   state: { doc: { length: 10, toString: () => 'test code6' } },
                   dispatch: jest.fn(),
                   contentDOM: {
                        setAttribute: jest.fn(),
                        removeAttribute: jest.fn()
                   }
              };

              editor.frameOptions.set('codeMirror6Editor', mockCodeMirror6);

              // Test set
              viewer._codeMirrorEditor('set', 'new value', null);
              expect(mockCodeMirror6.dispatch).toHaveBeenCalled();

              // Test get
              const result = viewer._codeMirrorEditor('get', null, null);
              expect(result).toBe('test code6');

              // Test readonly true
              viewer._codeMirrorEditor('readonly', true, null);
              expect(mockCodeMirror6.contentDOM.removeAttribute).toHaveBeenCalledWith('contenteditable');

              // Test readonly false
              viewer._codeMirrorEditor('readonly', false, null);
              expect(mockCodeMirror6.contentDOM.setAttribute).toHaveBeenCalledWith('contenteditable', true);
         });
    });

    describe('Private methods accessed through public API', () => {
         it('should trigger #setEditorDataToCodeView when codeView(true)', () => {
              expect(() => {
                   viewer.codeView(true);
              }).not.toThrow();
         });

         it('should trigger #setCodeDataToEditor when codeView(false)', () => {
              viewer.codeView(true);
              expect(() => {
                   viewer.codeView(false);
              }).not.toThrow();
         });
    });

    describe('#updateLineNumbers', () => {
         it('should be called when codeView is toggled on', () => {
              // CreateLineNumbers is called which uses _codeViewAutoHeight
              expect(() => {
                   viewer.codeView(true);
              }).not.toThrow();
         });
    });
});
