import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import * as actives from '../../../../src/core/base/actives';
import { dom, env } from '../../../../src/helper';

describe('actives', () => {
    let editor;
    let context;
    let wysiwyg, toolbar_main;

    beforeEach(async () => {
        editor = await createTestEditor({
            value: '<p>test</p>'
        });
        await waitForEditorReady(editor);
        context = editor.context;
        wysiwyg = editor.frameContext.get('wysiwyg');
        toolbar_main = editor.context.get('toolbar_main');
        
        // Ensure element access
        if (!editor.frameContext.get('wysiwyg')) {
             editor.frameContext.set('wysiwyg', document.createElement('div'));
        }
        wysiwyg = editor.frameContext.get('wysiwyg');

        // Mock selection
        editor.selection = {
             getRange: jest.fn().mockReturnValue({
                  collapsed: true,
                  commonAncestorContainer: wysiwyg,
                  startContainer: wysiwyg,
                  startOffset: 0,
                  endContainer: wysiwyg,
                  endOffset: 0
             }),
             getNode: jest.fn().mockReturnValue(wysiwyg),
             setRange: jest.fn()
        };
        
        // Mock toolbar
        editor.toolbar = {
             _showBalloon: jest.fn(),
             hide: jest.fn()
        };
        
        // Mock ui
        editor.ui = {
             offCurrentController: jest.fn(),
             showLoading: jest.fn(),
             hideLoading: jest.fn()
        }; 
        
        // Mock menu
        editor.menu = {
             containerOff: jest.fn(),
             dropdownOff: jest.fn()
        };
    });

    afterEach(() => {
        destroyTestEditor(editor);
        jest.restoreAllMocks();
    });

    describe('COPY_FORMAT', () => {
         it('should activate copy format mode', () => {
              const button = document.createElement('button');
              // Preserve existing eventManager methods like _removeAllEvents used by destroy
              editor.eventManager = {
                  ...editor.eventManager,
                  __cacheStyleNodes: ['mock-style'],
                  addGlobalEvent: jest.fn(),
                  removeGlobalEvent: jest.fn(),
                  _removeAllEvents: jest.fn() // Ensure it exists if we overwrite
              };
              
              actives.COPY_FORMAT(editor, button);
              
              expect(editor._onCopyFormatInfo).toEqual(['mock-style']);
              expect(editor.eventManager.addGlobalEvent).toHaveBeenCalledTimes(2); // keydown, mousedown
              expect(button.classList.contains('on')).toBe(true);
              expect(typeof editor._onCopyFormatInitMethod).toBe('function');
              
              // cleanup called by second click or internally
              // Call init method to test remove
              editor._onCopyFormatInitMethod();
              
              expect(editor.eventManager.removeGlobalEvent).toHaveBeenCalled();
              expect(editor._onCopyFormatInfo).toBeNull();
         });
    });

    describe('SELECT_ALL', () => {
        it('should select all content', () => {
             // Mock findFirstAndLast internal logic by creating structure
             wysiwyg.innerHTML = '<p>first</p><p>last</p>';
             
             editor.selection.getRange.mockReturnValue({
                  collapsed: true,
                  commonAncestorContainer: wysiwyg,
                  startContainer: wysiwyg.firstChild,
                  startOffset: 0,
             });

             actives.SELECT_ALL(editor);
             
             expect(editor.toolbar._showBalloon).toHaveBeenCalled();
             expect(editor.selection.setRange).toHaveBeenCalled();
        });
    });

    describe('SAVE', () => {
         it('should save if check changed is true', async () => {
              editor.frameContext.set('isChanged', true);
              const origin = document.createElement('textarea');
              editor.frameContext.set('originElement', origin);
              
              // Mock history safely
              const originalGetRootStack = editor.history.getRootStack;
              editor.history.getRootStack = jest.fn().mockReturnValue({0: {index: 1}});
              
              // Mock status
              editor.status.rootKey = 0;
              
              // Mock html get
              editor.html.get = jest.fn().mockReturnValue('<p>saved</p>');
              
              // triggerEvent should return NO_EVENT to proceed with internal save logic
              const triggerSpy = jest.spyOn(editor, 'triggerEvent').mockResolvedValue(env.NO_EVENT);
              
              await actives.SAVE(editor);
              
              expect(editor.frameContext.get('isChanged')).toBe(false);
              expect(origin.value).toBe('<p>saved</p>');
              
              // Cleanup mock
              editor.history.getRootStack = originalGetRootStack;
         });
         
         it('should not save if isChanged is false', async () => {
              editor.frameContext.set('isChanged', false);
              const result = await actives.SAVE(editor);
              expect(result).toBeUndefined(); 
         });
    });

    describe('FONT_STYLE', () => {
         it('should apply font style', () => {
              // Mock options.get via spy
              jest.spyOn(editor.options, 'get').mockImplementation((key) => {
                   if (key === 'convertTextTags') return {};
                   if (key === '_defaultTagCommand') return {};
                   if (key === '_styleCommandMap') return {};
                   return null;
              });

              editor.status.currentNodesMap = [];
              editor.inline.apply = jest.fn();
              editor.focus = jest.fn();

              actives.FONT_STYLE(editor, 'bold');

              expect(editor.inline.apply).toHaveBeenCalled();
         });
    });
    
    describe('PAGE_BREAK', () => {
         it('should insert page break', () => {
              editor.component.insert = jest.fn();
              editor.format.addLine = jest.fn().mockReturnValue(document.createElement('p'));
              // Mock history.push spy
              jest.spyOn(editor.history, 'push').mockImplementation(() => {});
              
              // Mock options.get to handle multiple keys and cleanup
              jest.spyOn(editor.options, 'get').mockImplementation((key) => {
                   if (key === 'defaultLine') return 'p';
                   return null; // Return null for others like codeMirror6Editor
              });
              
              actives.PAGE_BREAK(editor);
              
              expect(editor.component.insert).toHaveBeenCalled();
              expect(editor.history.push).toHaveBeenCalled();
         });
    });

    describe('DIR_BTN_ACTIVE', () => {
         it('should toggle direction buttons', () => {
              // Be careful not to overwrite objects needed for destroy
              editor.icons = { dir_ltr: 'Left', dir_rtl: 'Right' };
              
              // Mock DOM elements
              const ltrBtn = document.createElement('button');
              const tooltip = document.createElement('span');
              tooltip.className = 'se-tooltip-text';
              ltrBtn.appendChild(document.createElement('span')); // icon
              ltrBtn.appendChild(tooltip);
              
              const rtlBtn = document.createElement('button');
              const tooltip2 = document.createElement('span');
              tooltip2.className = 'se-tooltip-text';
              rtlBtn.appendChild(document.createElement('span'));
              rtlBtn.appendChild(tooltip2);

              editor.commandTargets.set('dir_ltr', ltrBtn);
              editor.commandTargets.set('dir_rtl', rtlBtn);
              editor.shortcutsKeyMap.clear(); // just clear calling native map method
              // editor.reverseKeys is likely an array in tests but Map in src? 
              // The test failure said "this.reverseKeys.clear is not a function".
              // So in the previous test code "editor.reverseKeys = []" overwrote it.
              // We should just use existing reverseKeys or ensure we don't overwrite if it's used by destroy.
              // Actually destroy calls reverseKeys.clear(). So it must be a Map or Set.
              // Check definition in editor.js.
              
              // For DIR_BTN_ACTIVE to work, it iterates editor.reverseKeys.
              // If it's a Map in source, we should treat it as such.
              // Let's assume it's a Map.
              if (!editor.reverseKeys.forEach) {
                  // If it was overwritten or doesn't exist
                  editor.reverseKeys = new Map();
              }

              editor.lang = { dir_ltr: 'LTR', dir_rtl: 'RTL' };
              
              // Mock applyCommandTargets
              editor.applyCommandTargets = jest.fn((name, cb) => {
                   cb(ltrBtn);
                   cb(rtlBtn);
              });

              actives.DIR_BTN_ACTIVE(editor, true); // RTL
              
              expect(editor.commandTargets.get('dir_rtl').classList.contains('active')).toBe(true);
              expect(editor.commandTargets.get('dir_ltr').classList.contains('active')).toBe(false);
              
              actives.DIR_BTN_ACTIVE(editor, false); // LTR
              expect(editor.commandTargets.get('dir_ltr').classList.contains('active')).toBe(true);
         });
    });
});
