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

			// Test internal event handlers
			const keydownHandler = editor.eventManager.addGlobalEvent.mock.calls[0][1];
			const mousedownHandler = editor.eventManager.addGlobalEvent.mock.calls[1][1];

			// Keydown ESC
			keydownHandler({ code: 'Escape' });
			expect(editor.eventManager.removeGlobalEvent).toHaveBeenCalled();

			// Reset for mousedown test
			actives.COPY_FORMAT(editor, button);
			
			// Mousedown outside
			mousedownHandler({ target: document.body });
			expect(editor.eventManager.removeGlobalEvent).toHaveBeenCalled();
			
			// Mousedown inside (should not remove)
			editor.eventManager.removeGlobalEvent.mockClear();
			mousedownHandler({ target: button });
			expect(editor.eventManager.removeGlobalEvent).not.toHaveBeenCalled();
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
				endContainer: wysiwyg.firstChild,
				endOffset: 0
			});

			actives.SELECT_ALL(editor);

			expect(editor.toolbar._showBalloon).toHaveBeenCalled();
			expect(editor.selection.setRange).toHaveBeenCalled();
		});

        it('should handle component at edges in select all', () => {
             wysiwyg.innerHTML = '<div class="se-component"></div>';
             editor.selection.getRange.mockReturnValue({
                  collapsed: true,
                  commonAncestorContainer: wysiwyg
             });
             editor.component.get = jest.fn().mockReturnValue({ container: wysiwyg.firstChild });
             
             actives.SELECT_ALL(editor);
             
             expect(editor.selection.setRange).toHaveBeenCalled();
             // Should have inserted BR
             expect(wysiwyg.innerHTML).toContain('<br>');
        });
	});

	describe('SAVE', () => {
		it('should save if check changed is true', async () => {
			editor.frameContext.set('isChanged', true);
			const origin = document.createElement('textarea');
			editor.frameContext.set('originElement', origin);

			// Mock history safely
			const originalGetRootStack = editor.history.getRootStack;
            // Ensure status.rootKey matches the key in the returned object
			editor.status.rootKey = '0'; 
			editor.history.getRootStack = jest.fn().mockReturnValue({ '0': { index: 1 } });

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

        it('should handle non-textarea origin element', async () => {
             editor.frameContext.set('isChanged', true);
             const origin = document.createElement('div');
             editor.frameContext.set('originElement', origin);
             editor.html.get = jest.fn().mockReturnValue('<p>saved div</p>');
             jest.spyOn(editor, 'triggerEvent').mockResolvedValue(env.NO_EVENT);
             
             editor.status.rootKey = '0';
             editor.history.getRootStack = jest.fn().mockReturnValue({ '0': { index: 1 } });
             
             await actives.SAVE(editor);
             
             expect(origin.innerHTML).toBe('<p>saved div</p>');
        });

        it('should cancel save if onSave event returns false', async () => {
             editor.frameContext.set('isChanged', true);
             jest.spyOn(editor, 'triggerEvent').mockResolvedValue(false);
             
             await actives.SAVE(editor);
             
             expect(editor.frameContext.get('isChanged')).toBe(true);
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

        it('should swap sub/sup if already active', () => {
            jest.spyOn(editor.options, 'get').mockImplementation((key) => {
				if (key === 'convertTextTags') return {};
				if (key === '_defaultTagCommand') return {};
				if (key === '_styleCommandMap') return {};
				return null;
			});
            
            // Mock inline.apply to avoid real execution which fails
            editor.inline.apply = jest.fn();
            editor.focus = jest.fn();
            
            // Test sub -> sup
            editor.status.currentNodesMap = ['superscript'];
            actives.FONT_STYLE(editor, 'sub');
            // The function checks /^sub$/i vs 'superscript' and sets nodeName to 'sup' (logic seems a bit odd - logic says if sub is requested but superscript is active, use sup? Ah, likely to toggle or replace)
            // Code: if (sub && nodesMap.includes('superscript')) nodeName = 'sup';
            
            // We verify call args
            // The logic: if u ask for sub, but u have sup active, it changes target to 'sup' (logic: unapply sup, or switch?)
            // Actually editor.inline.apply called with stylesToModify and nodesToRemove
            // If it changes nodeName to sup, it probably intends to toggle sup off or switch to sup context? 
            // Wait, logic: if (sub && has(superscript)) nodeName = sup;
            // then inline.apply(..., { nodesToRemove: [nodeName] })
            // So if I ask for sub, and I have sup, it removes sup. AND presumably applies sub?
            // Actually inline.apply first arg is "el". 
            // const el = nodesMap.includes(...) ? null : createElement(nodeName)
            // If I ask 'sub', nodeName='sub'. has 'superscript'. nodeName becomes 'sup'.
            // el = nodesMap.includes(sup) ? null : createElement('sup') -> if has sup, el is null.
            // nodesToRemove = ['sup'].
            // So it removes sup. It doesn't seem to apply sub in that specific branch?
            // Let's just verify it calls with nodeName 'sup'
            
            expect(editor.inline.apply).toHaveBeenCalledWith(
                expect.anything(), 
                expect.objectContaining({ nodesToRemove: ['sup'] })
            );
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
			rtlBtn.appendChild(document.createElement('span')); // icon
			rtlBtn.appendChild(tooltip2);

			editor.commandTargets.set('dir_ltr', ltrBtn);
			editor.commandTargets.set('dir_rtl', rtlBtn);
			editor.shortcutsKeyMap.clear();

            if (!editor.reverseKeys.forEach) {
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
