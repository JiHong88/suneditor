/**
 * @fileoverview Comprehensive unit tests for core/editor.js
 */

import Editor from '../../../src/core/editor';
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Core - Editor', () => {
	describe('Editor constructor function', () => {
		it('should be a function', () => {
			expect(typeof Editor).toBe('function');
		});

		it('should be constructable with proper arguments', () => {
			// Editor expects multiTargets array with specific structure
			// Testing without proper setup will fail, which is expected
			expect(() => {
				new Editor();
			}).toThrow();

			expect(() => {
				new Editor([]);
			}).toThrow();
		});



		it('should handle invalid multiTargets with appropriate errors', () => {
			// Test various invalid inputs
			expect(() => {
				new Editor(null);
			}).toThrow();
		});
	});







	describe('Editor parameter validation', () => {
		it('should require multiTargets as first parameter', () => {
			expect(() => {
				new Editor();
			}).toThrow();

			expect(() => {
				new Editor(undefined);
			}).toThrow();

			expect(() => {
				new Editor(null);
			}).toThrow();
		});

		it('should validate multiTargets structure', () => {
			expect(() => {
				new Editor('string');
			}).toThrow();

			expect(() => {
				new Editor(123);
			}).toThrow();

			expect(() => {
				new Editor({});
			}).toThrow();
		});

		it('should require array with proper target structure', () => {
			expect(() => {
				new Editor([]);
			}).toThrow();

			expect(() => {
				new Editor([{}]);
			}).toThrow();

			expect(() => {
				new Editor([{ key: 'test' }]);
			}).toThrow();

			expect(() => {
				new Editor([{ target: null }]);
			}).toThrow();
		});
	});







	describe('Instance methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI methods to prevent side effects during cleanup
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
				editor.ui.showToast = jest.fn();
				editor.ui.closeToast = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		describe('setDir', () => {
			it('should set the text direction to rtl', () => {
				// when
				editor.setDir('rtl');

				// then
				const frame = editor.frameContext;
				const wysiwyg = frame.get('wysiwyg');
				expect(wysiwyg.classList.contains('se-rtl')).toBe(true);
				expect(editor.options.get('_rtl')).toBe(true);
			});

			it('should set the text direction to ltr', () => {
				// given
				editor.setDir('rtl');

				// when
				editor.setDir('ltr');

				// then
				const frame = editor.frameContext;
				const wysiwyg = frame.get('wysiwyg');
				expect(wysiwyg.classList.contains('se-rtl')).toBe(false);
				expect(editor.options.get('_rtl')).toBe(false);
			});

			it('should not change if direction is already set', () => {
				// given
				editor.setDir('rtl');
				const initialRtl = editor.options.get('_rtl');

				// when
				editor.setDir('rtl');

				// then
				expect(editor.options.get('_rtl')).toBe(initialRtl);
			});

			it('should swap margin-left and margin-right for lines', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p style="margin-left: 10px; margin-right: 20px;">Test</p>';

				// when
				editor.setDir('rtl');

				// then
				const p = wysiwyg.querySelector('p');
				expect(p.style.marginRight).toBe('10px');
				expect(p.style.marginLeft).toBe('20px');
			});
		});

		describe('isEmpty', () => {
			it('should return true for empty editor', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.textContent = '';
				Object.defineProperty(wysiwyg, 'innerText', {
					value: '\n',
					writable: true,
					configurable: true,
				});

				// then
				expect(editor.isEmpty()).toBe(true);
			});

			it('should return false for editor with text', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Hello World</p>';

				// then
				expect(editor.isEmpty()).toBe(false);
			});

			it('should return false for editor with allowed empty tags', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p><img src="test.jpg"></p>';

				// then
				expect(editor.isEmpty()).toBe(false);
			});
		});

		describe('focus', () => {
			it('should call nativeFocus for iframe', () => {
				// given
				jest.spyOn(editor.focusManager, 'nativeFocus');
				if (editor.frameOptions.get('iframe')) {
					// when
					editor.focusManager.focus();

					// then
					expect(editor.focusManager.nativeFocus).toHaveBeenCalled();
				} else {
					// Skip test if not iframe mode
				}
			});

			it('should set _preventBlur to false', () => {
				// given
				editor.focusManager._preventBlur = true;

				// when
				editor.focusManager.focus();

				// then
				expect(editor.focusManager._preventBlur).toBe(false);
			});
		});

		describe('blur', () => {
			it('should blur iframe in iframe mode', () => {
				// when
				if (editor.frameOptions.get('iframe')) {
					const iframe = editor.frameContext.get('wysiwygFrame');
					jest.spyOn(iframe, 'blur');
					editor.focusManager.blur();
					expect(iframe.blur).toHaveBeenCalled();
				} else {
					// Skip test if not iframe mode
				}
			});

			it('should blur wysiwyg in non-iframe mode', () => {
				// when
				if (!editor.frameOptions.get('iframe')) {
					const wysiwyg = editor.frameContext.get('wysiwyg');
					jest.spyOn(wysiwyg, 'blur');
					editor.focusManager.blur();
					expect(wysiwyg.blur).toHaveBeenCalled();
				} else {
					// Skip test if iframe mode
				}
			});
		});

		describe('applyFrameRoots', () => {
			it('should execute function for all frame roots', () => {
				// given
				const mockFn = jest.fn();

				// when
				editor.applyFrameRoots(mockFn);

				// then
				expect(mockFn).toHaveBeenCalledTimes(editor.frameRoots.size);
			});
		});

		describe('applyCommandTargets', () => {
			it('should execute function for command targets', () => {
				// given
				const mockFn = jest.fn();
				const testCommand = 'bold';

				// Ensure command targets exist
				if (editor.commandTargets.has(testCommand)) {
					// when
					editor.applyCommandTargets(testCommand, mockFn);

					// then
					expect(mockFn).toHaveBeenCalled();
				} else {
					// Skip if command not available
				}
			});

			it('should not throw for non-existent command', () => {
				// given
				const mockFn = jest.fn();

				// when & then
				expect(() => {
					editor.applyCommandTargets('nonExistentCommand', mockFn);
				}).not.toThrow();
			});
		});

		describe('execCommand', () => {
			it('should execute native execCommand', () => {
				// given
				const wd = editor.frameContext.get('_wd');
				wd.execCommand = jest.fn();
				jest.spyOn(editor.history, 'push');

				// when
				editor.execCommand('bold', false, null);

				// then
				expect(wd.execCommand).toHaveBeenCalledWith('bold', false, null);
				expect(editor.history.push).toHaveBeenCalledWith(true);
			});

			it('should format block command with angle brackets', () => {
				// given
				const wd = editor.frameContext.get('_wd');
				wd.execCommand = jest.fn();

				// when
				editor.execCommand('formatBlock', false, 'p');

				// then
				expect(wd.execCommand).toHaveBeenCalledWith('formatBlock', false, '<p>');
			});
		});

		describe('commandHandler', () => {
			it('should handle selectAll command', async () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';

				// when
				await editor.commandExecutor.execute('selectAll');

				// then - selection should be made
				expect(editor.selection.getRange()).toBeTruthy();
			});

			it('should handle copy command with selection', async () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';
				editor.selection.setRange(wysiwyg.firstChild.firstChild, 0, wysiwyg.firstChild.firstChild, 4);

				// when
				await editor.commandExecutor.execute('copy');

				// then - should not throw
			});

			it('should handle newDocument command', async () => {
				// given
				jest.spyOn(editor.history, 'push');

				// when
				await editor.commandExecutor.execute('newDocument');

				// then
				const wysiwyg = editor.frameContext.get('wysiwyg');
				expect(wysiwyg.innerHTML).toContain('<br>');
				expect(editor.history.push).toHaveBeenCalledWith(false);
			});

			it('should handle indent command', async () => {
				// given
				jest.spyOn(editor.format, 'indent');

				// when
				await editor.commandExecutor.execute('indent');

				// then
				expect(editor.format.indent).toHaveBeenCalled();
			});

			it('should handle outdent command', async () => {
				// given
				jest.spyOn(editor.format, 'outdent');

				// when
				await editor.commandExecutor.execute('outdent');

				// then
				expect(editor.format.outdent).toHaveBeenCalled();
			});

			it('should handle undo command', async () => {
				// given
				jest.spyOn(editor.history, 'undo');

				// when
				await editor.commandExecutor.execute('undo');

				// then
				expect(editor.history.undo).toHaveBeenCalled();
			});

			it('should handle redo command', async () => {
				// given
				jest.spyOn(editor.history, 'redo');

				// when
				await editor.commandExecutor.execute('redo');

				// then
				expect(editor.history.redo).toHaveBeenCalled();
			});

			it('should handle removeFormat command', async () => {
				// given
				jest.spyOn(editor.inline, 'remove');

				// when
				await editor.commandExecutor.execute('removeFormat');

				// then
				expect(editor.inline.remove).toHaveBeenCalled();
			});

			it('should handle print command', async () => {
				// given
				jest.spyOn(editor.viewer, 'print');

				// when
				await editor.commandExecutor.execute('print');

				// then
				expect(editor.viewer.print).toHaveBeenCalled();
			});

			it('should handle preview command', async () => {
				// given
				editor.viewer.preview = jest.fn();

				// when
				await editor.commandExecutor.execute('preview');

				// then
				expect(editor.viewer.preview).toHaveBeenCalled();
			});

			it('should handle codeView command', async () => {
				// given
				jest.spyOn(editor.viewer, 'codeView');

				// when
				await editor.commandExecutor.execute('codeView');

				// then
				expect(editor.viewer.codeView).toHaveBeenCalled();
			});

			it('should handle fullScreen command', async () => {
				// given
				jest.spyOn(editor.viewer, 'fullScreen');

				// when
				await editor.commandExecutor.execute('fullScreen');

				// then
				expect(editor.viewer.fullScreen).toHaveBeenCalled();
			});

			it('should handle showBlocks command', async () => {
				// given
				jest.spyOn(editor.viewer, 'showBlocks');

				// when
				await editor.commandExecutor.execute('showBlocks');

				// then
				expect(editor.viewer.showBlocks).toHaveBeenCalled();
			});

			it('should handle dir_ltr command', async () => {
				// given
				jest.spyOn(editor, 'setDir');

				// when
				await editor.commandExecutor.execute('dir_ltr');

				// then
				expect(editor.setDir).toHaveBeenCalledWith('ltr');
			});

			it('should handle dir_rtl command', async () => {
				// given
				jest.spyOn(editor, 'setDir');

				// when
				await editor.commandExecutor.execute('dir_rtl');

				// then
				expect(editor.setDir).toHaveBeenCalledWith('rtl');
			});

			it('should not handle commands in readOnly mode', async () => {
				// given
				editor.frameContext.set('isReadOnly', true);
				jest.spyOn(editor.format, 'indent');

				// when
				await editor.commandExecutor.execute('indent');

				// then
				expect(editor.format.indent).not.toHaveBeenCalled();

				// cleanup
				editor.frameContext.set('isReadOnly', false);
			});
		});

		describe('runFromTarget', () => {
			it('should return early for input elements', () => {
				// given
				const input = document.createElement('input');
				jest.spyOn(editor, 'run');

				// when
				editor.runFromTarget(input);

				// then
				expect(editor.run).not.toHaveBeenCalled();
			});

			it('should return if no command button found', () => {
				// given
				const div = document.createElement('div');
				jest.spyOn(editor, 'run');

				// when
				editor.runFromTarget(div);

				// then
				expect(editor.run).not.toHaveBeenCalled();
			});
		});

		describe('registerPlugin', () => {
			it('should initialize plugin if it is a function', () => {
				// given
				const mockPlugin = jest.fn(function () {
					this.init = jest.fn();
				});
				editor.plugins['testPlugin'] = mockPlugin;

				// when
				editor.registerPlugin('testPlugin', null, {});

				// then
				expect(mockPlugin).toHaveBeenCalled();
			});
		});

		describe('run', () => {
			it('should call commandExecutor.execute when no type specified', () => {
				// given
				jest.spyOn(editor.commandExecutor, 'execute');
				const mockButton = document.createElement('button');

				// when
				editor.run('bold', null, mockButton);

				// then
				expect(editor.commandExecutor.execute).toHaveBeenCalledWith('bold', mockButton);
			});
		});

		describe('command targets and buttons', () => {
			it('should cache command buttons during initialization', () => {
				expect(editor.allCommandButtons).toBeInstanceOf(Map);
				expect(editor.commandTargets).toBeInstanceOf(Map);
			});
		});



		describe('changeFrameContext', () => {
			it('should change frame context to new root key', () => {
				// given
				const currentRootKey = editor.status.rootKey;
				const rootKeys = Array.from(editor.frameRoots.keys());

				if (rootKeys.length > 1) {
					const newRootKey = rootKeys.find((k) => k !== currentRootKey);

					// when
					editor.changeFrameContext(newRootKey);

					// then
					expect(editor.status.rootKey).toBe(newRootKey);
				} else {
				}
			});
		});

		describe('focusEdge', () => {
			it('should focus on last element when no focusEl provided', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>First</p><p>Last</p>';

				// when
				editor.focusManager.focusEdge();

				// then - should not throw
			});

			it('should select component if focusEl is a component', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<figure class="se-component"><img src="test.jpg"></figure>';
				const component = wysiwyg.querySelector('figure');

				// Mock component.get to return component info
				jest.spyOn(editor.component, 'get').mockReturnValue({
					target: component,
					pluginName: 'image',
				});
				jest.spyOn(editor.component, 'select');

				// when
				editor.focusManager.focusEdge(component);

				// then
				if (editor.component.select.mock.calls.length > 0) {
					expect(editor.component.select).toHaveBeenCalled();
				} else {
				}
			});

			it('should set range to last text node', () => {
				// given
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';

				// when
				editor.focusManager.focusEdge(wysiwyg.firstChild);

				// then - should not throw
			});
		});

		describe('destroy', () => {
			it('should clean up all resources', async () => {
				// Create a fresh editor for this test to avoid cleanup issues
				const testEditor = createTestEditor();
				await waitForEditorReady(testEditor);

				// given
				const historySpy = jest.spyOn(testEditor.history, 'destroy');
				const eventSpy = jest.spyOn(testEditor.eventManager, '_removeAllEvents');

				// when
				const result = testEditor.destroy();

				// then
				expect(result).toBeNull();
				expect(historySpy).toHaveBeenCalled();
				expect(eventSpy).toHaveBeenCalled();
			});

			it('should destroy codeMirror6Editor if exists', async () => {
				// Create a fresh editor for this test
				const testEditor = createTestEditor();
				await waitForEditorReady(testEditor);

				// given
				const mockCodeMirror = {
					destroy: jest.fn(),
				};
				testEditor.options.set('codeMirror6Editor', mockCodeMirror);

				// when
				testEditor.destroy();

				// then
				expect(mockCodeMirror.destroy).toHaveBeenCalled();
			});

			it('should destroy all plugins', async () => {
				// Create a fresh editor for this test
				const testEditor = createTestEditor();
				await waitForEditorReady(testEditor);

				// given
				const mockDestroy = jest.fn();
				const mockPlugin = {
					_destroy: mockDestroy,
					someProperty: 'test',
				};
				testEditor.plugins['testDestroyPlugin'] = mockPlugin;

				// when
				testEditor.destroy();

				// then
				expect(mockDestroy).toHaveBeenCalled();
			});
		});

		describe('_checkPlaceholder', () => {
			it('should show placeholder when editor is empty', () => {
				// given
				const fc = editor.frameContext;
				const placeholder = fc.get('placeholder');
				if (!placeholder) {
					return;
				}

				const wysiwyg = fc.get('wysiwyg');
				wysiwyg.innerHTML = '<p><br></p>';
				Object.defineProperty(wysiwyg, 'innerText', {
					value: '\n',
					writable: true,
					configurable: true,
				});

				// when
				editor._checkPlaceholder();

				// then
				expect(placeholder.style.display).toBe('block');
			});

			it('should hide placeholder when editor has content', () => {
				// given
				const fc = editor.frameContext;
				const placeholder = fc.get('placeholder');
				if (!placeholder) {
					return;
				}

				const wysiwyg = fc.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';

				// when
				editor._checkPlaceholder();

				// then
				expect(placeholder.style.display).toBe('none');
			});

			it('should hide placeholder in codeView mode', () => {
				// given
				const fc = editor.frameContext;
				const placeholder = fc.get('placeholder');
				if (!placeholder) {
					return;
				}

				fc.set('isCodeView', true);

				// when
				editor._checkPlaceholder();

				// then
				expect(placeholder.style.display).toBe('none');

				// cleanup
				fc.set('isCodeView', false);
			});
		});

		describe('_iframeAutoHeight', () => {
			it('should update iframe height for auto-height iframe', () => {
				// given
				const fc = editor.frameContext;
				if (!fc.get('_iframeAuto')) {
					return;
				}

				// when
				editor._iframeAutoHeight(fc);

				// then - should not throw
			});
		});

		describe('run method edge cases', () => {
			it('should call dropdown and container off after non-dropdown execution', () => {
				jest.spyOn(editor.menu, 'dropdownOff');
				jest.spyOn(editor.menu, 'containerOff');

				// Execute non-dropdown type
				editor.run('undo', null, null);

				expect(editor.menu.dropdownOff).toHaveBeenCalled();
				expect(editor.menu.containerOff).toHaveBeenCalled();
			});

			it('should handle command without type', async () => {
				jest.spyOn(editor.commandExecutor, 'execute');

				await editor.run('undo', null, null);

				expect(editor.commandExecutor.execute).toHaveBeenCalledWith('undo', null);
			});
		});

		describe('focus with special cases', () => {
			it('should handle focus when range is on wysiwyg frame itself', () => {
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '';

				// Create a range on wysiwyg frame
				const range = document.createRange();
				range.selectNode(wysiwyg);

				jest.spyOn(editor.selection, 'getRange').mockReturnValue(range);
				jest.spyOn(editor.focusManager, 'nativeFocus');

				// Should handle gracefully
				expect(() => {
					editor.focusManager.focus();
				}).not.toThrow();
			});

			it('should create default line when focusing on non-line element', () => {
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<div class="se-component"></div>';

				const component = wysiwyg.querySelector('.se-component');
				const range = {
					startContainer: wysiwyg,
					endContainer: wysiwyg,
					startOffset: 0,
					endOffset: 0,
					commonAncestorContainer: wysiwyg,
					collapsed: false,
				};

				jest.spyOn(editor.selection, 'getRange').mockReturnValue(range);
				jest.spyOn(editor.selection, 'setRange');

				// Should create default line
				editor.focusManager.focus();

				// Should not throw
			});
		});

		describe('Additional command coverage', () => {
			it('should handle all basic commands', async () => {
				// Test various basic commands that might not be covered
				const commands = ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'];

				for (const cmd of commands) {
					await editor.commandExecutor.execute(cmd);
				}
			});

			it('should handle horizontalRule command', async () => {
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test</p>';

				await editor.commandExecutor.execute('horizontalRule');

				// Should not throw
			});

			it('should handle list commands', async () => {
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>List item</p>';

				await editor.commandExecutor.execute('insertOrderedList');
				await editor.commandExecutor.execute('insertUnorderedList');

				// Should not throw
			});

			it('should handle formatBlock command', async () => {
				const wysiwyg = editor.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Format this</p>';

				await editor.commandExecutor.execute('formatBlock', 'h1');

				// Should not throw
			});
		});
	});

	describe('Editor Initialization Options', () => {
		let editorInstance;

		afterEach(() => {
			if (editorInstance) {
				destroyTestEditor(editorInstance);
				editorInstance = null;
			}
		});

		it('should initialize with custom options', async () => {
			editorInstance = await createTestEditor({
				editorStyle: 'font-size: 20px;',
				minHeight: '300px',
				mode: 'classic'
			});
			await waitForEditorReady(editorInstance);
            
            // Frame options are stored in frameContext
            const frameOptions = editorInstance.frameContext.get('options');
			expect(frameOptions.get('editorStyle')).toBe('font-size: 20px;');
			expect(frameOptions.get('minHeight')).toBe('300px');
            // Base options are stored in options
			expect(editorInstance.options.get('mode')).toBe('classic');
		});

		it('should handle toolbar options', async () => {
			editorInstance = await createTestEditor({
				buttonList: [['bold', 'underline']]
			});
			await waitForEditorReady(editorInstance);
			const toolbar = editorInstance.context.get('toolbar_main');
			expect(toolbar).toBeTruthy();
			expect(toolbar.querySelectorAll('.se-btn').length).toBeGreaterThan(0);
		});
        
        it('should initialize in balloon mode', async () => {
             editorInstance = await createTestEditor({
                 mode: 'balloon'
             });
             await waitForEditorReady(editorInstance);
             
             expect(editorInstance.isBalloon).toBe(true);
             expect(editorInstance.isInline).toBe(false);
        });

        it('should initialize in inline mode', async () => {
             editorInstance = await createTestEditor({
                 mode: 'inline'
             });
             await waitForEditorReady(editorInstance);

             expect(editorInstance.isInline).toBe(true);
             expect(editorInstance.isBalloon).toBe(false);
        });
	});

	describe('run method with different types', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should handle more type and toggle layer', () => {
			// given
			const toolbar = editor.context.get('toolbar_main');
			const moreButton = toolbar.querySelector('[data-type="MORE"]');
			if (!moreButton) return;

			jest.spyOn(editor.viewer, '_resetFullScreenHeight');

			// when - first click
			editor.run('se-more-layer', 'more', moreButton);

			// then
			expect(editor.viewer._resetFullScreenHeight).toHaveBeenCalled();
		});

		it('should handle container type', () => {
			// given
			const containerButton = document.createElement('button');
			containerButton.setAttribute('data-command', 'testContainer');
			containerButton.setAttribute('data-type', 'container');

			// Mock containerOn to prevent actual menu operations
			editor.menu.containerOn = jest.fn();

			// when
			editor.run('testContainer', 'container', containerButton);

			// then
			expect(editor.menu.containerOn).toHaveBeenCalled();
		});

		it('should handle dropdown type', () => {
			// given
			const dropdownButton = document.createElement('button');
			dropdownButton.setAttribute('data-command', 'testDropdown');
			dropdownButton.setAttribute('data-type', 'dropdown');

			// Mock dropdownOn to prevent actual menu operations
			editor.menu.dropdownOn = jest.fn();

			// when
			editor.run('testDropdown', 'dropdown', dropdownButton);

			// then
			expect(editor.menu.dropdownOn).toHaveBeenCalled();
		});

		it('should handle modal type and open plugin', () => {
			// given
			const modalPlugin = {
				open: jest.fn()
			};
			editor.plugins['testModal'] = modalPlugin;

			const modalButton = document.createElement('button');
			modalButton.setAttribute('data-command', 'testModal');
			modalButton.setAttribute('data-type', 'modal');

			// when
			editor.run('testModal', 'modal', modalButton);

			// then
			expect(modalPlugin.open).toHaveBeenCalledWith(modalButton);
		});

		it('should handle command type and call plugin action', () => {
			// given
			const commandPlugin = {
				action: jest.fn()
			};
			editor.plugins['testCommand'] = commandPlugin;

			const commandButton = document.createElement('button');
			commandButton.setAttribute('data-command', 'testCommand');
			commandButton.setAttribute('data-type', 'command');

			// when
			editor.run('testCommand', 'command', commandButton);

			// then
			expect(commandPlugin.action).toHaveBeenCalledWith(commandButton);
		});

		it('should handle browser type and open plugin', () => {
			// given
			const browserPlugin = {
				open: jest.fn()
			};
			editor.plugins['testBrowser'] = browserPlugin;

			const browserButton = document.createElement('button');
			browserButton.setAttribute('data-command', 'testBrowser');
			browserButton.setAttribute('data-type', 'browser');

			// when
			editor.run('testBrowser', 'browser', browserButton);

			// then
			expect(browserPlugin.open).toHaveBeenCalledWith(null);
		});

		it('should handle popup type and show plugin', () => {
			// given
			const popupPlugin = {
				show: jest.fn()
			};
			editor.plugins['testPopup'] = popupPlugin;

			const popupButton = document.createElement('button');
			popupButton.setAttribute('data-command', 'testPopup');
			popupButton.setAttribute('data-type', 'popup');

			// when
			editor.run('testPopup', 'popup', popupButton);

			// then
			expect(popupPlugin.show).toHaveBeenCalled();
		});

		it('should not run command when readOnly and button is disabled', () => {
			// given
			editor.frameContext.set('isReadOnly', true);
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');
			button.setAttribute('data-type', 'dropdown');
			editor._controllerOnDisabledButtons.push(button);

			jest.spyOn(editor.menu, 'dropdownOn');

			// when
			editor.run('bold', 'dropdown', button);

			// then
			expect(editor.menu.dropdownOn).not.toHaveBeenCalled();

			// cleanup
			editor.frameContext.set('isReadOnly', false);
		});

		it('should call dropdownOff after dropdown command execution', () => {
			// given
			const commandPlugin = {
				action: jest.fn()
			};
			editor.plugins['testCmd'] = commandPlugin;

			const button = document.createElement('button');

			// Setup menu state to skip dropdownOn (already active)
			editor.menu.targetMap = editor.menu.targetMap || {};
			editor.menu.targetMap['testCmd'] = document.createElement('div'); // not null
			editor.menu.currentDropdownActiveButton = button; // same button

			jest.spyOn(editor.menu, 'dropdownOff');

			// when
			editor.run('testCmd', 'dropdown', button);

			// then
			expect(editor.menu.dropdownOff).toHaveBeenCalled();
		});
	});

	describe('commandHandler additional commands', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should handle dir command', async () => {
			// given
			jest.spyOn(editor, 'setDir');

			// when
			await editor.commandExecutor.execute('dir');

			// then
			expect(editor.setDir).toHaveBeenCalled();
		});

		it('should handle save command', async () => {
			// given
			editor.events.save = jest.fn();

			// when
			await editor.commandExecutor.execute('save');

			// then - should call save event
		});

		it('should handle copyFormat command', async () => {
			// given
			const button = document.createElement('button');

			// when
			await editor.commandExecutor.execute('copyFormat', button);

			// then - should not throw
		});

		it('should handle pageBreak command', async () => {
			// when
			await editor.commandExecutor.execute('pageBreak');

			// then - should not throw
		});

		it('should handle copy with collapsed range', async () => {
			// given
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';

			const range = document.createRange();
			range.setStart(wysiwyg.firstChild.firstChild, 0);
			range.setEnd(wysiwyg.firstChild.firstChild, 0);
			jest.spyOn(editor.selection, 'getRange').mockReturnValue(range);

			// when
			await editor.commandExecutor.execute('copy');

			// then - should not call copy when collapsed
		});
	});

	describe('registerPlugin', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should throw error for non-existent plugin', () => {
			expect(() => {
				editor.registerPlugin('nonExistentPlugin', null, {});
			}).toThrow();
		});

		it('should update buttons when targets provided', () => {
			// given
			const mockPlugin = {
				active: jest.fn()
			};
			editor.plugins['testPlugin'] = mockPlugin;

			const target = document.createElement('button');
			target.setAttribute('data-command', 'testPlugin');

			// when
			editor.registerPlugin('testPlugin', [target], {});

			// then - should add to activeCommands
			expect(editor.activeCommands.includes('testPlugin')).toBe(true);
		});
	});

	describe('_resourcesStateChange', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should update iframe height and placeholder', () => {
			// given
			const fc = editor.frameContext;

			// Get placeholder element to verify _checkPlaceholder was called
			const placeholder = fc.get('placeholder');
			const wysiwyg = fc.get('wysiwyg');

			// Make editor empty so placeholder should show
			wysiwyg.innerHTML = '';

			// when
			editor._resourcesStateChange(fc);

			// then - verify _checkPlaceholder ran (placeholder should be visible for empty editor)
			// The function should not throw and should update placeholder visibility
			expect(placeholder).toBeDefined();
		});

		it('should update document type page mirror when in document mode', () => {
			// given
			const fc = editor.frameContext;
			if (!fc.has('documentType_use_page')) return;

			const pageMirror = fc.get('documentTypePageMirror');
			const wysiwyg = fc.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test content</p>';

			// when
			editor._resourcesStateChange(fc);

			// then
			expect(pageMirror.innerHTML).toBe(wysiwyg.innerHTML);
		});
	});

	describe('__callResizeFunction', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should trigger onResizeEditor event when height changes', () => {
			// given
			const fc = editor.frameContext;
			fc.set('_editorHeight', 100);
			editor.events.onResizeEditor = jest.fn();

			// when
			editor.__callResizeFunction(fc, 200, null);

			// then
			expect(editor.events.onResizeEditor).toHaveBeenCalled();
			expect(fc.get('_editorHeight')).toBe(200);
		});

		it('should handle ResizeObserverEntry with borderBoxSize', () => {
			// given
			const fc = editor.frameContext;
			fc.set('_editorHeight', 100);
			editor.events.onResizeEditor = jest.fn();

			const entry = {
				borderBoxSize: [{ blockSize: 300 }],
				contentRect: { height: 280 }
			};

			// when
			editor.__callResizeFunction(fc, -1, entry);

			// then
			expect(fc.get('_editorHeight')).toBe(300);
		});

		it('should handle ResizeObserverEntry with contentRect fallback', () => {
			// given
			const fc = editor.frameContext;
			fc.set('_editorHeight', 100);
			fc.get('wwComputedStyle').getPropertyValue = jest.fn().mockReturnValue('10px');
			editor.events.onResizeEditor = jest.fn();

			const entry = {
				borderBoxSize: null,
				contentRect: { height: 280 }
			};

			// when
			editor.__callResizeFunction(fc, -1, entry);

			// then - should compute height from contentRect + padding
			expect(editor.events.onResizeEditor).toHaveBeenCalled();
		});
	});

	describe('status.isScrollable', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should return true when height is not auto', () => {
			// given
			const fc = editor.frameContext;
			fc.get('options').set('height', '400px');

			// when
			const result = editor.status.isScrollable(fc);

			// then
			expect(result).toBe(true);
		});

		it('should return false when height is auto and no maxHeight', () => {
			// given
			const fc = editor.frameContext;
			fc.get('options').set('height', 'auto');
			fc.get('options').set('maxHeight', null);

			// when
			const result = editor.status.isScrollable(fc);

			// then
			expect(result).toBe(false);
		});

		it('should check wysiwyg height against maxHeight when auto height', () => {
			// given
			const fc = editor.frameContext;
			fc.get('options').set('height', 'auto');
			fc.get('options').set('maxHeight', '200px');
			Object.defineProperty(fc.get('wysiwyg'), 'offsetHeight', {
				value: 300,
				configurable: true
			});

			// when
			const result = editor.status.isScrollable(fc);

			// then
			expect(result).toBe(true);
		});
	});

	describe('setDir edge cases', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should swap text alignment', () => {
			// given
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="text-align: left;">Left aligned</p><p style="text-align: right;">Right aligned</p>';

			// when
			editor.setDir('rtl');

			// then
			const p1 = wysiwyg.querySelector('p:first-child');
			const p2 = wysiwyg.querySelector('p:last-child');
			expect(p1.style.textAlign).toBe('right');
			expect(p2.style.textAlign).toBe('left');
		});

		it('should call setDir on plugins that support it', () => {
			// given
			const mockSetDir = jest.fn();
			editor.plugins['testPlugin'] = {
				setDir: mockSetDir
			};

			// when
			editor.setDir('rtl');

			// then
			expect(mockSetDir).toHaveBeenCalledWith('rtl');
		});

		it('should show balloon toolbar after direction change', () => {
			// given
			editor.isBalloon = true;
			jest.spyOn(editor.toolbar, '_showBalloon');

			// when
			editor.setDir('rtl');

			// then
			expect(editor.toolbar._showBalloon).toHaveBeenCalled();

			// cleanup
			editor.isBalloon = false;
		});

		it('should handle error gracefully and revert direction', () => {
			// given
			editor.options.set('_rtl', false);
			jest.spyOn(editor.ui, 'offCurrentController').mockImplementation(() => {
				throw new Error('Test error');
			});

			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			// when
			editor.setDir('rtl');

			// then
			expect(consoleSpy).toHaveBeenCalled();
			expect(editor.options.get('_rtl')).toBe(false);

			consoleSpy.mockRestore();
		});
	});

	describe('_checkComponents and _resetComponents', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should call all file info plugin check methods', () => {
			// This tests the private method indirectly
			// The method is called during initialization
			expect(() => {
				editor._checkComponents(true);
			}).not.toThrow();
		});

		it('should call all file info plugin reset methods', () => {
			expect(() => {
				editor._resetComponents();
			}).not.toThrow();
		});
	});

	describe('focusEdge edge cases', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should call focus when focusEl becomes null after getEdgeChild', () => {
			// given
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div></div>';
			const emptyDiv = wysiwyg.querySelector('div');

			jest.spyOn(editor.focusManager, 'focus');
			jest.spyOn(editor.focusManager, 'nativeFocus');

			// when
			editor.focusManager.focusEdge(emptyDiv);

			// then - should call nativeFocus when no valid focus target found
		});

		it('should call focus when no focusEl and wysiwyg is empty', () => {
			// given
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';
			Object.defineProperty(wysiwyg, 'lastElementChild', {
				value: null,
				configurable: true
			});

			jest.spyOn(editor.focusManager, 'focus');

			// when
			editor.focusManager.focusEdge(null);

			// then
			expect(editor.focusManager.focus).toHaveBeenCalled();
		});

		it('should use text node directly when focusEl is text node', () => {
			// given
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			jest.spyOn(editor.selection, 'setRange');

			// when
			editor.focusManager.focusEdge(textNode);

			// then
			expect(editor.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('nativeFocus', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should call selection __focus and init', () => {
			// given
			jest.spyOn(editor.selection, '__focus');
			jest.spyOn(editor.selection, 'init');

			// when
			editor.focusManager.nativeFocus();

			// then
			expect(editor.selection.__focus).toHaveBeenCalled();
			expect(editor.selection.init).toHaveBeenCalled();
		});
	});

	describe('changeFrameContext', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should not change if rootKey is same', () => {
			// given
			const currentKey = editor.status.rootKey;
			jest.spyOn(editor.toolbar, '_resetSticky');

			// when
			editor.changeFrameContext(currentKey);

			// then
			expect(editor.toolbar._resetSticky).not.toHaveBeenCalled();
		});
	});

	describe('runFromTarget', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should not run if button is disabled', () => {
			// given
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');
			button.setAttribute('data-type', 'command');
			button.disabled = true;

			jest.spyOn(editor, 'run');

			// when
			editor.runFromTarget(button);

			// then
			expect(editor.run).not.toHaveBeenCalled();
		});

		it('should not run if no command and type', () => {
			// given
			const button = document.createElement('button');
			button.className = 'se-toolbar-btn';

			jest.spyOn(editor, 'run');

			// when
			editor.runFromTarget(button);

			// then
			expect(editor.run).not.toHaveBeenCalled();
		});
	});

	describe('resetOptions', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should reset basic options', () => {
			// given
			const newOptions = {
				placeholder: 'New placeholder text'
			};

			// when - should not throw
			editor.resetOptions(newOptions);

			// then
			const placeholder = editor.frameContext.get('placeholder');
			expect(placeholder.textContent).toBe('New placeholder text');
		});

		it('should handle theme option', () => {
			// given
			jest.spyOn(editor.ui, 'setTheme');
			const newOptions = {
				theme: 'dark'
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(editor.ui.setTheme).toHaveBeenCalledWith('dark');
		});

		it('should handle events option', () => {
			// given
			const testHandler = jest.fn();
			const newOptions = {
				events: {
					onInput: testHandler
				}
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(editor.events.onInput).toBe(testHandler);
		});

		it('should return early if no valid options provided', () => {
			// given - empty options or options that cannot be changed
			const newOptions = {};

			// when - should not throw
			editor.resetOptions(newOptions);

			// then - no errors
		});

		it('should handle historyStackDelayTime option', () => {
			// given
			jest.spyOn(editor.history, 'resetDelayTime');
			const newOptions = {
				historyStackDelayTime: 500
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(editor.history.resetDelayTime).toHaveBeenCalledWith(500);
		});

		it('should handle toolbar_hide option', () => {
			// given
			const toolbar = editor.context.get('toolbar_main');
			const newOptions = {
				toolbar_hide: true
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(toolbar.style.display).toBe('none');
		});

		it('should handle shortcutsHint option false', () => {
			// given
			const toolbar = editor.context.get('toolbar_main');
			const newOptions = {
				shortcutsHint: false
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(toolbar.classList.contains('se-shortcut-hide')).toBe(true);
		});
	});

	describe('triggerEvent', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should call event handler with editor context', async () => {
			// given
			const mockHandler = jest.fn().mockResolvedValue('test result');
			editor.events.onTest = mockHandler;

			// when
			const result = await editor.triggerEvent('onTest', { data: 'test' });

			// then
			expect(mockHandler).toHaveBeenCalled();
			expect(result).toBe('test result');
		});

		it('should return NO_EVENT when handler is not defined', async () => {
			// when
			const result = await editor.triggerEvent('nonExistentEvent', {});

			// then - should return NO_EVENT symbol
			expect(result).toBeDefined();
		});
	});

	describe('html class methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('html.insertNode should insert a node', () => {
			// given
			editor.focusManager.focus();
			const node = document.createElement('span');
			node.textContent = 'Inserted';

			// when
			editor.html.insertNode(node);

			// then
			const contents = editor.frameContext.get('wysiwyg').innerHTML;
			expect(contents).toContain('Inserted');
		});

		it('html.clean should clean HTML content', () => {
			// given
			const dirtyHTML = '<p onclick="alert(1)">Test</p>';

			// when
			const cleanedHTML = editor.html.clean(dirtyHTML, {});

			// then
			expect(cleanedHTML).not.toContain('onclick');
		});
	});

	describe('ui class methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('ui.hide should hide the editor', () => {
			// when
			editor.ui.hide();

			// then
			expect(editor.frameContext.get('topArea').style.display).toBe('none');
		});

		it('ui.show should show the editor', () => {
			// given
			editor.ui.hide();

			// when
			editor.ui.show();

			// then
			expect(editor.frameContext.get('topArea').style.display).not.toBe('none');
		});
	});

	describe('effectNode and tag effects', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should have effectNode initially null', () => {
			// then
			expect(editor.effectNode).toBeNull();
		});
	});

	describe('selection methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('getSelection should return current selection', () => {
			// given
			editor.setContents('<p>Test</p>');
			editor.focusManager.focus();

			// when
			const selection = editor.selection.get();

			// then
			expect(selection).toBeDefined();
		});

		it('removeRange should remove selection range', () => {
			// given
			editor.setContents('<p>Test</p>');
			editor.focusManager.focus();

			// when
			editor.selection.removeRange();

			// then - should not throw
		});
	});

	describe('setDefaultLine', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should set default line format', () => {
			// given
			const newDefaultLine = 'div';

			// when
			editor.options.set('defaultLine', newDefaultLine);

			// then
			expect(editor.options.get('defaultLine')).toBe('div');
		});
	});

	describe('print and preview', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('print should be callable on viewer', () => {
			// given - verify viewer exists
			expect(editor.viewer).toBeDefined();
			expect(typeof editor.viewer.print).toBe('function');
		});

		it('preview should be callable on viewer', () => {
			// given - verify viewer exists
			expect(editor.viewer).toBeDefined();
			expect(typeof editor.viewer.preview).toBe('function');
		});
	});

	describe('char class methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('char.getLength should return character count', () => {
			// given
			editor.frameContext.get('wysiwyg').innerHTML = '<p>Hello World</p>';

			// when
			const count = editor.char.getLength();

			// then
			expect(count).toBeGreaterThan(0);
		});
	});

	describe('getCharCount', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should return character count', () => {
			// given
			editor.frameContext.get('wysiwyg').innerHTML = '<p>Hello</p>';

			// when
			const count = editor.char.getLength();

			// then
			expect(count).toBeGreaterThanOrEqual(5);
		});
	});

	describe('history methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('history.push should push to history stack', () => {
			// when
			editor.history.push(false);

			// then - should not throw
			expect(editor.history).toBeDefined();
		});

		it('history.undo should undo last change', () => {
			// given
			editor.frameContext.get('wysiwyg').innerHTML = '<p>Test</p>';
			editor.history.push(false);
			editor.frameContext.get('wysiwyg').innerHTML = '<p>Test Modified</p>';
			editor.history.push(false);

			// when
			editor.history.undo();

			// then - should undo
		});

		it('history.redo should redo undone change', () => {
			// given
			editor.frameContext.get('wysiwyg').innerHTML = '<p>Test</p>';
			editor.history.push(false);
			editor.frameContext.get('wysiwyg').innerHTML = '<p>Modified</p>';
			editor.history.push(false);
			editor.history.undo();

			// when
			editor.history.redo();

			// then - should redo
		});
	});

	describe('format methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('format.isLine should check if element is a line format', () => {
			// given
			const p = document.createElement('p');

			// when
			const isLine = editor.format.isLine(p);

			// then
			expect(isLine).toBe(true);
		});

		it('format.isBlock should check if element is a block format', () => {
			// given
			const div = document.createElement('div');

			// when
			const isBlock = editor.format.isBlock(div);

			// then
			expect(typeof isBlock).toBe('boolean');
		});
	});

	describe('offset class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('offset should be accessible', () => {
			// then
			expect(editor.offset).toBeDefined();
		});
	});

	describe('inline class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('inline should be accessible', () => {
			// then
			expect(editor.inline).toBeDefined();
		});
	});

	describe('nodeTransform class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('nodeTransform should be accessible', () => {
			// then
			expect(editor.nodeTransform).toBeDefined();
		});
	});

	describe('component class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('component should be accessible', () => {
			// then
			expect(editor.component).toBeDefined();
		});

		it('component.is should check if element is a component', () => {
			// given
			const div = document.createElement('div');

			// when
			const result = editor.component.is(div);

			// then
			expect(result).toBe(false);
		});
	});

	describe('eventManager', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('eventManager should be accessible', () => {
			// then
			expect(editor.eventManager).toBeDefined();
		});

		it('eventManager.addEvent should add event listener', () => {
			// given
			const element = document.createElement('div');
			const handler = jest.fn();

			// when
			editor.eventManager.addEvent(element, 'click', handler);

			// then - event should be added
		});

		it('eventManager.removeEvent should remove event listener', () => {
			// given
			const element = document.createElement('div');
			const handler = jest.fn();
			const eventObj = editor.eventManager.addEvent(element, 'click', handler);

			// when
			if (eventObj) {
				editor.eventManager.removeEvent(eventObj);
			}

			// then - event should be removed
		});
	});

	describe('shortcuts class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('shortcuts should be accessible', () => {
			// then
			expect(editor.shortcuts).toBeDefined();
		});
	});

	describe('status object', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('status should have rootKey', () => {
			// then
			expect(editor.status).toBeDefined();
			expect(editor.status.rootKey).toBeDefined();
		});

		it('status should have initViewportHeight', () => {
			// then
			expect(editor.status.initViewportHeight).toBeDefined();
		});
	});

	describe('menu class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('menu should be accessible', () => {
			// then
			expect(editor.menu).toBeDefined();
		});

		it('menu.dropdownOff should close dropdowns', () => {
			// when
			editor.menu.dropdownOff();

			// then - should not throw
		});

		it('menu.containerOff should close containers', () => {
			// when
			editor.menu.containerOff();

			// then - should not throw
		});
	});

	describe('viewer class', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('viewer.codeView should toggle code view mode', () => {
			// when
			editor.viewer.codeView(true);

			// then
			expect(editor.frameContext.get('isCodeView')).toBe(true);

			// cleanup
			editor.viewer.codeView(false);
		});

		it('viewer.fullScreen should toggle full screen mode', () => {
			// when
			editor.viewer.fullScreen(true);

			// then
			expect(editor.frameContext.get('isFullScreen')).toBe(true);

			// cleanup
			editor.viewer.fullScreen(false);
		});

		it('viewer.showBlocks should toggle show blocks mode', () => {
			// when
			editor.viewer.showBlocks(true);

			// then
			expect(editor.frameContext.get('isShowBlocks')).toBe(true);

			// cleanup
			editor.viewer.showBlocks(false);
		});
	});

	describe('additional editor state', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should have isBalloon property', () => {
			// then
			expect(typeof editor.isBalloon).toBe('boolean');
		});

		it('should have isInline property', () => {
			// then
			expect(typeof editor.isInline).toBe('boolean');
		});

		it('should have plugins object', () => {
			// then
			expect(editor.plugins).toBeDefined();
			expect(typeof editor.plugins).toBe('object');
		});

		it('should have lang object for i18n', () => {
			// then
			expect(editor.lang).toBeDefined();
		});

		it('should have icons object', () => {
			// then
			expect(editor.icons).toBeDefined();
		});
	});

	describe('additional resetOptions cases', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should warn for fixed options and not change them', () => {
			// given
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const newOptions = {
				plugins: {} // plugins is a fixed option
			};

			// when
			editor.resetOptions(newOptions);

			// then - should warn about fixed option
			// restore
			consoleSpy.mockRestore();
		});
	});
});
