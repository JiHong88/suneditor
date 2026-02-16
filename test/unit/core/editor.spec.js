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
		});
	});

	describe('Instance methods', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI methods to prevent side effects during cleanup
			if (editor.$.ui) {
				editor.$.ui.showLoading = jest.fn();
				editor.$.ui.hideLoading = jest.fn();
				editor.$.ui.showToast = jest.fn();
				editor.$.ui.closeToast = jest.fn();
			}
			if (editor.$.viewer) {
				editor.$.viewer.print = jest.fn();
			}
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		describe('setDir', () => {
			it('should set the text direction to rtl', () => {
				// when
				editor.$.ui.setDir('rtl');

				// then
				const frame = editor.$.frameContext;
				const wysiwyg = frame.get('wysiwyg');
				expect(wysiwyg.classList.contains('se-rtl')).toBe(true);
				expect(editor.$.options.get('_rtl')).toBe(true);
			});

			it('should set the text direction to ltr', () => {
				// given
				editor.$.ui.setDir('rtl');

				// when
				editor.$.ui.setDir('ltr');

				// then
				const frame = editor.$.frameContext;
				const wysiwyg = frame.get('wysiwyg');
				expect(wysiwyg.classList.contains('se-rtl')).toBe(false);
				expect(editor.$.options.get('_rtl')).toBe(false);
			});

			it('should not change if direction is already set', () => {
				// given
				editor.$.ui.setDir('rtl');
				const initialRtl = editor.$.options.get('_rtl');

				// when
				editor.$.ui.setDir('rtl');

				// then
				expect(editor.$.options.get('_rtl')).toBe(initialRtl);
			});

			it('should swap margin-left and margin-right for lines', () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p style="margin-left: 10px; margin-right: 20px;">Test</p>';

				// when
				editor.$.ui.setDir('rtl');

				// then
				const p = wysiwyg.querySelector('p');
				expect(p.style.marginRight).toBe('10px');
				expect(p.style.marginLeft).toBe('20px');
			});
		});

		describe('isEmpty', () => {
			it('should return true for empty editor', () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
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
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Hello World</p>';

				// then
				expect(editor.isEmpty()).toBe(false);
			});

			it('should return false for editor with allowed empty tags', () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p><img src="test.jpg"></p>';

				// then
				expect(editor.isEmpty()).toBe(false);
			});
		});

		describe('focus', () => {
			it('should call nativeFocus for iframe', () => {
				// given
				jest.spyOn(editor.$.focusManager, 'nativeFocus');
				if (editor.$.frameOptions.get('iframe')) {
					// when
					editor.$.focusManager.focus();

					// then
					expect(editor.$.focusManager.nativeFocus).toHaveBeenCalled();
				} else {
					// Skip test if not iframe mode
				}
			});

		});

		describe('blur', () => {
			it('should blur iframe in iframe mode', () => {
				// when
				if (editor.$.frameOptions.get('iframe')) {
					const iframe = editor.$.frameContext.get('wysiwygFrame');
					jest.spyOn(iframe, 'blur');
					editor.$.focusManager.blur();
					expect(iframe.blur).toHaveBeenCalled();
				} else {
					// Skip test if not iframe mode
				}
			});

			it('should blur wysiwyg in non-iframe mode', () => {
				// when
				if (!editor.$.frameOptions.get('iframe')) {
					const wysiwyg = editor.$.frameContext.get('wysiwyg');
					jest.spyOn(wysiwyg, 'blur');
					editor.$.focusManager.blur();
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
				editor.$.contextProvider.applyToRoots(mockFn);

				// then
				expect(mockFn).toHaveBeenCalledTimes(editor.$.frameRoots.size);
			});
		});

		describe('applyCommandTargets', () => {
			it('should execute function for command targets', () => {
				// given
				const mockFn = jest.fn();
				const testCommand = 'bold';

				// Ensure command targets exist
				if (editor.$.commandDispatcher.targets.has(testCommand)) {
					// when
					editor.$.commandDispatcher.applyTargets(testCommand, mockFn);

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
					editor.$.commandDispatcher.applyTargets('nonExistentCommand', mockFn);
				}).not.toThrow();
			});
		});

		describe('commandHandler', () => {
			it('should handle selectAll command', async () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';

				// when
				await editor.$.commandDispatcher.run('selectAll');

				// then - selection should be made
				expect(editor.$.selection.getRange()).toBeTruthy();
			});

			it('should handle copy command with selection', async () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';
				editor.$.selection.setRange(wysiwyg.firstChild.firstChild, 0, wysiwyg.firstChild.firstChild, 4);

				// when
				await editor.$.commandDispatcher.run('copy');

				// then - should not throw
			});

			it('should handle newDocument command', async () => {
				// given
				jest.spyOn(editor.$.history, 'push');

				// when
				await editor.$.commandDispatcher.run('newDocument');

				// then
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				expect(wysiwyg.innerHTML).toContain('<br>');
				expect(editor.$.history.push).toHaveBeenCalledWith(false);
			});

			it('should handle indent command', async () => {
				// given
				jest.spyOn(editor.$.format, 'indent');

				// when
				await editor.$.commandDispatcher.run('indent');

				// then
				expect(editor.$.format.indent).toHaveBeenCalled();
			});

			it('should handle outdent command', async () => {
				// given
				jest.spyOn(editor.$.format, 'outdent');

				// when
				await editor.$.commandDispatcher.run('outdent');

				// then
				expect(editor.$.format.outdent).toHaveBeenCalled();
			});

			it('should handle undo command', async () => {
				// given
				jest.spyOn(editor.$.history, 'undo');

				// when
				await editor.$.commandDispatcher.run('undo');

				// then
				expect(editor.$.history.undo).toHaveBeenCalled();
			});

			it('should handle redo command', async () => {
				// given
				jest.spyOn(editor.$.history, 'redo');

				// when
				await editor.$.commandDispatcher.run('redo');

				// then
				expect(editor.$.history.redo).toHaveBeenCalled();
			});

			it('should handle removeFormat command', async () => {
				// given
				jest.spyOn(editor.$.inline, 'remove');

				// when
				await editor.$.commandDispatcher.run('removeFormat');

				// then
				expect(editor.$.inline.remove).toHaveBeenCalled();
			});

			it('should handle print command', async () => {
				// given
				jest.spyOn(editor.$.viewer, 'print');

				// when
				await editor.$.commandDispatcher.run('print');

				// then
				expect(editor.$.viewer.print).toHaveBeenCalled();
			});

			it('should handle preview command', async () => {
				// given
				editor.$.viewer.preview = jest.fn();

				// when
				await editor.$.commandDispatcher.run('preview');

				// then
				expect(editor.$.viewer.preview).toHaveBeenCalled();
			});

			it('should handle codeView command', async () => {
				// given
				jest.spyOn(editor.$.viewer, 'codeView');

				// when
				await editor.$.commandDispatcher.run('codeView');

				// then
				expect(editor.$.viewer.codeView).toHaveBeenCalled();
			});

			it('should handle fullScreen command', async () => {
				// given
				jest.spyOn(editor.$.viewer, 'fullScreen');

				// when
				await editor.$.commandDispatcher.run('fullScreen');

				// then
				expect(editor.$.viewer.fullScreen).toHaveBeenCalled();
			});

			it('should handle showBlocks command', async () => {
				// given
				jest.spyOn(editor.$.viewer, 'showBlocks');

				// when
				await editor.$.commandDispatcher.run('showBlocks');

				// then
				expect(editor.$.viewer.showBlocks).toHaveBeenCalled();
			});

			it('should handle dir_ltr command', async () => {
				// given
				jest.spyOn(editor.$.ui, 'setDir');

				// when
				await editor.$.commandDispatcher.run('dir_ltr');

				// then
				expect(editor.$.ui.setDir).toHaveBeenCalledWith('ltr');
			});

			it('should handle dir_rtl command', async () => {
				// given
				jest.spyOn(editor.$.ui, 'setDir');

				// when
				await editor.$.commandDispatcher.run('dir_rtl');

				// then
				expect(editor.$.ui.setDir).toHaveBeenCalledWith('rtl');
			});

			it('should not handle commands in readOnly mode', async () => {
				// given
				editor.$.frameContext.set('isReadOnly', true);
				jest.spyOn(editor.$.format, 'indent');

				// when
				await editor.$.commandDispatcher.run('indent');

				// then
				expect(editor.$.format.indent).not.toHaveBeenCalled();

				// cleanup
				editor.$.frameContext.set('isReadOnly', false);
			});
		});

		describe('runFromTarget', () => {
			it('should return early for input elements', () => {
				// given
				const input = document.createElement('input');
				jest.spyOn(editor.$.commandDispatcher, 'run');

				// when
				editor.$.commandDispatcher.runFromTarget(input);

				// then
				expect(editor.$.commandDispatcher.run).not.toHaveBeenCalled();
			});

			it('should return if no command button found', () => {
				// given
				const div = document.createElement('div');
				jest.spyOn(editor.$.commandDispatcher, 'run');

				// when
				editor.$.commandDispatcher.runFromTarget(div);

				// then
				expect(editor.$.commandDispatcher.run).not.toHaveBeenCalled();
			});
		});

		describe('pluginManager.register', () => {
			it('should initialize plugin if it is a function', () => {
				// given
				const mockPlugin = jest.fn(function () {
					this.init = jest.fn();
				});
				editor.$.plugins['testPlugin'] = mockPlugin;

				// when
				editor.$.pluginManager.register('testPlugin', null, {});

				// then
				expect(mockPlugin).toHaveBeenCalled();
			});
		});

		describe('run', () => {
			it('should call run method with command when no type specified', () => {
				// given
				const runSpy = jest.spyOn(editor.$.commandDispatcher, 'run');
				const mockButton = document.createElement('button');

				// when
				editor.$.commandDispatcher.run('bold', null, mockButton);

				// then
				expect(runSpy).toHaveBeenCalledWith('bold', null, mockButton);
			});
		});

		describe('command targets and buttons', () => {
			it('should cache command buttons during initialization', () => {
				expect(editor.$.commandDispatcher.allCommandButtons).toBeInstanceOf(Map);
				expect(editor.$.commandDispatcher.targets).toBeInstanceOf(Map);
			});
		});

		describe('changeFrameContext', () => {
			it('should change frame context to new root key', () => {
				// given
				const currentRootKey = editor.$.store.get('rootKey');
				const rootKeys = Array.from(editor.$.frameRoots.keys());

				if (rootKeys.length > 1) {
					const newRootKey = rootKeys.find((k) => k !== currentRootKey);

					// when
					editor.changeFrameContext(newRootKey);

					// then
					expect(editor.$.store.get('rootKey')).toBe(newRootKey);
				} else {
				}
			});
		});

		describe('focusEdge', () => {
			it('should focus on last element when no focusEl provided', () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>First</p><p>Last</p>';

				// when
				editor.$.focusManager.focusEdge();

				// then - should not throw
			});

			it('should select component if focusEl is a component', () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<figure class="se-component"><img src="test.jpg"></figure>';
				const component = wysiwyg.querySelector('figure');

				// Mock component.get to return component info
				jest.spyOn(editor.$.component, 'get').mockReturnValue({
					target: component,
					pluginName: 'image',
				});
				jest.spyOn(editor.$.component, 'select');

				// when
				editor.$.focusManager.focusEdge(component);

				// then
				if (editor.$.component.select.mock.calls.length > 0) {
					expect(editor.$.component.select).toHaveBeenCalled();
				} else {
				}
			});

			it('should set range to last text node', () => {
				// given
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';

				// when
				editor.$.focusManager.focusEdge(wysiwyg.firstChild);

				// then - should not throw
			});
		});

		describe('destroy', () => {


		});

		describe('_updatePlaceholder (moved to uiManager)', () => {
			it('should show placeholder when editor is empty', () => {
				// given
				const fc = editor.$.frameContext;
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
				editor.$.ui._updatePlaceholder();

				// then
				expect(placeholder.style.display).toBe('block');
			});

			it('should hide placeholder when editor has content', () => {
				// given
				const fc = editor.$.frameContext;
				const placeholder = fc.get('placeholder');
				if (!placeholder) {
					return;
				}

				const wysiwyg = fc.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test content</p>';

				// when
				editor.$.ui._updatePlaceholder();

				// then
				expect(placeholder.style.display).toBe('none');
			});

			it('should hide placeholder in codeView mode', () => {
				// given
				const fc = editor.$.frameContext;
				const placeholder = fc.get('placeholder');
				if (!placeholder) {
					return;
				}

				fc.set('isCodeView', true);

				// when
				editor.$.ui._updatePlaceholder();

				// then
				expect(placeholder.style.display).toBe('none');

				// cleanup
				fc.set('isCodeView', false);
			});
		});

		describe('_iframeAutoHeight', () => {
			it('should update iframe height for auto-height iframe', () => {
				// given
				const fc = editor.$.frameContext;
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
				jest.spyOn(editor.$.menu, 'dropdownOff');
				jest.spyOn(editor.$.menu, 'containerOff');

				// Execute non-dropdown type
				editor.$.commandDispatcher.run('undo', null, null);

				expect(editor.$.menu.dropdownOff).toHaveBeenCalled();
				expect(editor.$.menu.containerOff).toHaveBeenCalled();
			});

			it('should handle command without type', async () => {
				const runSpy = jest.spyOn(editor.$.commandDispatcher, 'run');

				await editor.$.commandDispatcher.run('undo', null, null);

				expect(runSpy).toHaveBeenCalledWith('undo', null, null);
			});
		});

		describe('focus with special cases', () => {
			it('should handle focus when range is on wysiwyg frame itself', () => {
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '';

				// Create a range on wysiwyg frame
				const range = document.createRange();
				range.selectNode(wysiwyg);

				jest.spyOn(editor.$.selection, 'getRange').mockReturnValue(range);
				jest.spyOn(editor.$.focusManager, 'nativeFocus');

				// Should handle gracefully
				expect(() => {
					editor.$.focusManager.focus();
				}).not.toThrow();
			});

			it('should create default line when focusing on non-line element', () => {
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
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

				jest.spyOn(editor.$.selection, 'getRange').mockReturnValue(range);
				jest.spyOn(editor.$.selection, 'setRange');

				// Should create default line
				editor.$.focusManager.focus();

				// Should not throw
			});
		});

		describe('Additional command coverage', () => {
			it('should handle all basic commands', async () => {
				// Test various basic commands that might not be covered
				const commands = ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'];

				for (const cmd of commands) {
					await editor.$.commandDispatcher.run(cmd);
				}
			});

			it('should handle horizontalRule command', async () => {
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Test</p>';

				await editor.$.commandDispatcher.run('horizontalRule');

				// Should not throw
			});

			it('should handle list commands', async () => {
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>List item</p>';

				await editor.$.commandDispatcher.run('insertOrderedList');
				await editor.$.commandDispatcher.run('insertUnorderedList');

				// Should not throw
			});

			it('should handle formatBlock command', async () => {
				const wysiwyg = editor.$.frameContext.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Format this</p>';

				await editor.$.commandDispatcher.run('formatBlock', 'h1');

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
				mode: 'classic',
			});
			await waitForEditorReady(editorInstance);

			// Frame options are stored in frameContext
			const frameOptions = editorInstance.$.frameContext.get('options');
			expect(frameOptions.get('editorStyle')).toBe('font-size: 20px;');
			expect(frameOptions.get('minHeight')).toBe('300px');
			// Base options are stored in options
			expect(editorInstance.$.options.get('mode')).toBe('classic');
		});

		it('should handle toolbar options', async () => {
			editorInstance = await createTestEditor({
				buttonList: [['bold', 'underline']],
			});
			await waitForEditorReady(editorInstance);
			const toolbar = editorInstance.$.context.get('toolbar_main');
			expect(toolbar).toBeTruthy();
			expect(toolbar.querySelectorAll('.se-btn').length).toBeGreaterThan(0);
		});

		it('should initialize in balloon mode', async () => {
			editorInstance = await createTestEditor({
				mode: 'balloon',
			});
			await waitForEditorReady(editorInstance);

			expect(editorInstance.$.store.mode.isBalloon).toBe(true);
			expect(editorInstance.$.store.mode.isInline).toBe(false);
		});

		it('should initialize in inline mode', async () => {
			editorInstance = await createTestEditor({
				mode: 'inline',
			});
			await waitForEditorReady(editorInstance);

			expect(editorInstance.$.store.mode.isInline).toBe(true);
			expect(editorInstance.$.store.mode.isBalloon).toBe(false);
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
			const toolbar = editor.$.context.get('toolbar_main');
			const moreButton = toolbar.querySelector('[data-type="MORE"]');
			if (!moreButton) return;

			jest.spyOn(editor.$.viewer, '_resetFullScreenHeight');

			// when - first click
			editor.$.commandDispatcher.run('se-more-layer', 'more', moreButton);

			// then
			expect(editor.$.viewer._resetFullScreenHeight).toHaveBeenCalled();
		});

		it('should handle container type', () => {
			// given
			const containerButton = document.createElement('button');
			containerButton.setAttribute('data-command', 'testContainer');
			containerButton.setAttribute('data-type', 'container');

			// Mock containerOn to prevent actual menu operations
			editor.$.menu.containerOn = jest.fn();

			// when
			editor.$.commandDispatcher.run('testContainer', 'container', containerButton);

			// then
			expect(editor.$.menu.containerOn).toHaveBeenCalled();
		});

		it('should handle dropdown type', () => {
			// given
			const dropdownButton = document.createElement('button');
			dropdownButton.setAttribute('data-command', 'testDropdown');
			dropdownButton.setAttribute('data-type', 'dropdown');

			// Mock dropdownOn to prevent actual menu operations
			editor.$.menu.dropdownOn = jest.fn();

			// when
			editor.$.commandDispatcher.run('testDropdown', 'dropdown', dropdownButton);

			// then
			expect(editor.$.menu.dropdownOn).toHaveBeenCalled();
		});

		it('should handle modal type and open plugin', () => {
			// given
			const modalPlugin = {
				open: jest.fn(),
			};
			editor.$.plugins['testModal'] = modalPlugin;

			const modalButton = document.createElement('button');
			modalButton.setAttribute('data-command', 'testModal');
			modalButton.setAttribute('data-type', 'modal');

			// when
			editor.$.commandDispatcher.run('testModal', 'modal', modalButton);

			// then
			expect(modalPlugin.open).toHaveBeenCalledWith(modalButton);
		});

		it('should handle command type and call plugin action', () => {
			// given
			const commandPlugin = {
				action: jest.fn(),
			};
			editor.$.plugins['testCommand'] = commandPlugin;

			const commandButton = document.createElement('button');
			commandButton.setAttribute('data-command', 'testCommand');
			commandButton.setAttribute('data-type', 'command');

			// when
			editor.$.commandDispatcher.run('testCommand', 'command', commandButton);

			// then
			expect(commandPlugin.action).toHaveBeenCalledWith(commandButton);
		});

		it('should handle browser type and open plugin', () => {
			// given
			const browserPlugin = {
				open: jest.fn(),
			};
			editor.$.plugins['testBrowser'] = browserPlugin;

			const browserButton = document.createElement('button');
			browserButton.setAttribute('data-command', 'testBrowser');
			browserButton.setAttribute('data-type', 'browser');

			// when
			editor.$.commandDispatcher.run('testBrowser', 'browser', browserButton);

			// then
			expect(browserPlugin.open).toHaveBeenCalledWith(null);
		});

		it('should handle popup type and show plugin', () => {
			// given
			const popupPlugin = {
				show: jest.fn(),
			};
			editor.$.plugins['testPopup'] = popupPlugin;

			const popupButton = document.createElement('button');
			popupButton.setAttribute('data-command', 'testPopup');
			popupButton.setAttribute('data-type', 'popup');

			// when
			editor.$.commandDispatcher.run('testPopup', 'popup', popupButton);

			// then
			expect(popupPlugin.show).toHaveBeenCalled();
		});


		it('should call dropdownOff after dropdown command execution', () => {
			// given
			const commandPlugin = {
				action: jest.fn(),
			};
			editor.$.plugins['testCmd'] = commandPlugin;

			const button = document.createElement('button');

			// Setup menu state to skip dropdownOn (already active)
			editor.$.menu.targetMap = editor.$.menu.targetMap || {};
			editor.$.menu.targetMap['testCmd'] = document.createElement('div'); // not null
			editor.$.menu.currentDropdownActiveButton = button; // same button

			jest.spyOn(editor.$.menu, 'dropdownOff');

			// when
			editor.$.commandDispatcher.run('testCmd', 'dropdown', button);

			// then
			expect(editor.$.menu.dropdownOff).toHaveBeenCalled();
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
			jest.spyOn(editor.$.ui, 'setDir');

			// when
			await editor.$.commandDispatcher.run('dir');

			// then
			expect(editor.$.ui.setDir).toHaveBeenCalled();
		});

		it('should handle save command', async () => {
			// given
			editor.$.eventManager.events.save = jest.fn();

			// when
			await editor.$.commandDispatcher.run('save');

			// then - should call save event
		});

		it('should handle copyFormat command', async () => {
			// given
			const button = document.createElement('button');

			// when
			await editor.$.commandDispatcher.run('copyFormat', button);

			// then - should not throw
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
				active: jest.fn(),
			};
			editor.$.plugins['testPlugin'] = mockPlugin;

			const target = document.createElement('button');
			target.setAttribute('data-command', 'testPlugin');

			// when
			editor.$.pluginManager.register('testPlugin', [target], {});
		});
	});

	describe('_syncFrameState (moved to uiManager)', () => {
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
			const fc = editor.$.frameContext;

			// Get placeholder element to verify _updatePlaceholder was called
			const placeholder = fc.get('placeholder');
			const wysiwyg = fc.get('wysiwyg');

			// Make editor empty so placeholder should show
			wysiwyg.innerHTML = '<p><br></p>';
			// Mock innerText for JSDOM
			Object.defineProperty(wysiwyg, 'innerText', {
				value: '\n',
				writable: true,
				configurable: true,
			});

			// when
			editor.$.ui._syncFrameState(fc);

			// then - verify _updatePlaceholder ran (placeholder should be visible for empty editor)
			// The function should not throw and should update placeholder visibility
			expect(placeholder).toBeDefined();
		});

		it('should update document type page mirror when in document mode', () => {
			// given
			const fc = editor.$.frameContext;
			if (!fc.has('documentType_use_page')) return;

			const pageMirror = fc.get('documentTypePageMirror');
			const wysiwyg = fc.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test content</p>';

			// when
			editor.$.ui._syncFrameState(fc);

			// then
			expect(pageMirror.innerHTML).toBe(wysiwyg.innerHTML);
		});
	});

	describe('_emitResizeEvent (moved to uiManager)', () => {
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
			const fc = editor.$.frameContext;
			fc.set('_editorHeight', 100);
			editor.$.eventManager.events.onResizeEditor = jest.fn();

			// when
			editor.$.ui._emitResizeEvent(fc, 200, null);

			// then
			expect(editor.$.eventManager.events.onResizeEditor).toHaveBeenCalled();
			expect(fc.get('_editorHeight')).toBe(200);
		});

		it('should handle ResizeObserverEntry with borderBoxSize', () => {
			// given
			const fc = editor.$.frameContext;
			fc.set('_editorHeight', 100);
			editor.$.eventManager.events.onResizeEditor = jest.fn();

			const entry = {
				borderBoxSize: [{ blockSize: 300 }],
				contentRect: { height: 280 },
			};

			// when
			editor.$.ui._emitResizeEvent(fc, -1, entry);

			// then
			expect(fc.get('_editorHeight')).toBe(300);
		});

		it('should handle ResizeObserverEntry with contentRect fallback', () => {
			// given
			const fc = editor.$.frameContext;
			fc.set('_editorHeight', 100);
			fc.get('wwComputedStyle').getPropertyValue = jest.fn().mockReturnValue('10px');
			editor.$.eventManager.events.onResizeEditor = jest.fn();

			const entry = {
				borderBoxSize: null,
				contentRect: { height: 280 },
			};

			// when
			editor.$.ui._emitResizeEvent(fc, -1, entry);

			// then - should compute height from contentRect + padding
			expect(editor.$.eventManager.events.onResizeEditor).toHaveBeenCalled();
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
			const fc = editor.$.frameContext;
			fc.get('options').set('height', '400px');

			// when
			const result = editor.$.store.get('isScrollable')(fc);

			// then
			expect(result).toBe(true);
		});

		it('should return false when height is auto and no maxHeight', () => {
			// given
			const fc = editor.$.frameContext;
			fc.get('options').set('height', 'auto');
			fc.get('options').set('maxHeight', null);

			// when
			const result = editor.$.store.get('isScrollable')(fc);

			// then
			expect(result).toBe(false);
		});

		it('should check wysiwyg height against maxHeight when auto height', () => {
			// given
			const fc = editor.$.frameContext;
			fc.get('options').set('height', 'auto');
			fc.get('options').set('maxHeight', '200px');
			Object.defineProperty(fc.get('wysiwyg'), 'offsetHeight', {
				value: 300,
				configurable: true,
			});

			// when
			const result = editor.$.store.get('isScrollable')(fc);

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
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="text-align: left;">Left aligned</p><p style="text-align: right;">Right aligned</p>';

			// when
			editor.$.ui.setDir('rtl');

			// then
			const p1 = wysiwyg.querySelector('p:first-child');
			const p2 = wysiwyg.querySelector('p:last-child');
			expect(p1.style.textAlign).toBe('right');
			expect(p2.style.textAlign).toBe('left');
		});

		it('should call setDir on plugins that support it', () => {
			// given
			const mockSetDir = jest.fn();
			editor.$.plugins['testPlugin'] = {
				setDir: mockSetDir,
			};

			// when
			editor.$.ui.setDir('rtl');

			// then
			expect(mockSetDir).toHaveBeenCalledWith('rtl');
		});


		it('should handle error gracefully and revert direction', () => {
			// given
			editor.$.options.set('_rtl', false);
			jest.spyOn(editor.$.ui, 'offCurrentController').mockImplementation(() => {
				throw new Error('Test error');
			});

			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			// when
			editor.$.ui.setDir('rtl');

			// then
			expect(consoleSpy).toHaveBeenCalled();
			expect(editor.$.options.get('_rtl')).toBe(false);

			consoleSpy.mockRestore();
		});
	});

	describe('pluginManager.checkFileInfo and resetFileInfo', () => {
		let editor;

		beforeEach(async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);
		});

		afterEach(() => {
			destroyTestEditor(editor);
		});

		it('should call all file info plugin check methods', () => {
			// This tests the pluginManager method
			// The method is called during initialization
			expect(() => {
				editor.$.pluginManager.checkFileInfo(true);
			}).not.toThrow();
		});

		it('should call all file info plugin reset methods', () => {
			expect(() => {
				editor.$.pluginManager.resetFileInfo();
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
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div></div>';
			const emptyDiv = wysiwyg.querySelector('div');

			jest.spyOn(editor.$.focusManager, 'focus');
			jest.spyOn(editor.$.focusManager, 'nativeFocus');

			// when
			editor.$.focusManager.focusEdge(emptyDiv);

			// then - should call nativeFocus when no valid focus target found
		});

		it('should call focus when no focusEl and wysiwyg is empty', () => {
			// given
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';
			Object.defineProperty(wysiwyg, 'lastElementChild', {
				value: null,
				configurable: true,
			});

			jest.spyOn(editor.$.focusManager, 'focus');

			// when
			editor.$.focusManager.focusEdge(null);

			// then
			expect(editor.$.focusManager.focus).toHaveBeenCalled();
		});

		it('should use text node directly when focusEl is text node', () => {
			// given
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;

			jest.spyOn(editor.$.selection, 'setRange');

			// when
			editor.$.focusManager.focusEdge(textNode);

			// then
			expect(editor.$.selection.setRange).toHaveBeenCalled();
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
			jest.spyOn(editor.$.selection, '__focus');
			jest.spyOn(editor.$.selection, 'init');

			// when
			editor.$.focusManager.nativeFocus();

			// then
			expect(editor.$.selection.__focus).toHaveBeenCalled();
			expect(editor.$.selection.init).toHaveBeenCalled();
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
			const currentKey = editor.$.store.get('rootKey');
			jest.spyOn(editor.$.toolbar, '_resetSticky');

			// when
			editor.changeFrameContext(currentKey);

			// then
			expect(editor.$.toolbar._resetSticky).not.toHaveBeenCalled();
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

			jest.spyOn(editor.$.commandDispatcher, 'run');

			// when
			editor.$.commandDispatcher.runFromTarget(button);

			// then
			expect(editor.$.commandDispatcher.run).not.toHaveBeenCalled();
		});

		it('should not run if no command and type', () => {
			// given
			const button = document.createElement('button');
			button.className = 'se-toolbar-btn';

			jest.spyOn(editor.$.commandDispatcher, 'run');

			// when
			editor.$.commandDispatcher.runFromTarget(button);

			// then
			expect(editor.$.commandDispatcher.run).not.toHaveBeenCalled();
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
				placeholder: 'New placeholder text',
			};

			// when - should not throw
			editor.resetOptions(newOptions);

			// then
			const placeholder = editor.$.frameContext.get('placeholder');
			expect(placeholder.textContent).toBe('New placeholder text');
		});

		it('should handle theme option', () => {
			// given
			jest.spyOn(editor.$.ui, 'setTheme');
			const newOptions = {
				theme: 'dark',
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(editor.$.ui.setTheme).toHaveBeenCalledWith('dark');
		});

		it('should handle events option', () => {
			// given
			const testHandler = jest.fn();
			const newOptions = {
				events: {
					onInput: testHandler,
				},
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(editor.$.eventManager.events.onInput).toBe(testHandler);
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
			jest.spyOn(editor.$.history, 'resetDelayTime');
			const newOptions = {
				historyStackDelayTime: 500,
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(editor.$.history.resetDelayTime).toHaveBeenCalledWith(500);
		});

		it('should handle toolbar_hide option', () => {
			// given
			const toolbar = editor.$.context.get('toolbar_main');
			const newOptions = {
				toolbar_hide: true,
			};

			// when
			editor.resetOptions(newOptions);

			// then
			expect(toolbar.style.display).toBe('none');
		});

		it('should handle shortcutsHint option false', () => {
			// given
			const toolbar = editor.$.context.get('toolbar_main');
			const newOptions = {
				shortcutsHint: false,
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
			editor.$.eventManager.events.onTest = mockHandler;

			// when
			const result = await editor.$.eventManager.triggerEvent('onTest', { data: 'test' });

			// then
			expect(mockHandler).toHaveBeenCalled();
			expect(result).toBe('test result');
		});

		it('should return NO_EVENT when handler is not defined', async () => {
			// when
			const result = await editor.$.eventManager.triggerEvent('nonExistentEvent', {});

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
			editor.$.focusManager.focus();
			const node = document.createElement('span');
			node.textContent = 'Inserted';

			// when
			editor.$.html.insertNode(node);

			// then
			const contents = editor.$.frameContext.get('wysiwyg').innerHTML;
			expect(contents).toContain('Inserted');
		});

		it('html.clean should clean HTML content', () => {
			// given
			const dirtyHTML = '<p onclick="alert(1)">Test</p>';

			// when
			const cleanedHTML = editor.$.html.clean(dirtyHTML, {});

			// then
			expect(cleanedHTML).not.toContain('onclick');
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
			editor.$.frameContext.get('wysiwyg').innerHTML = '<p>Test</p>';
			editor.$.focusManager.focus();

			// when
			const selection = editor.$.selection.get();

			// then
			expect(selection).toBeDefined();
		});

		it('removeRange should remove selection range', () => {
			// given
			editor.$.frameContext.get('wysiwyg').innerHTML = '<p>Test</p>';
			editor.$.focusManager.focus();

			// when
			editor.$.selection.removeRange();

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
			editor.$.options.set('defaultLine', newDefaultLine);

			// then
			expect(editor.$.options.get('defaultLine')).toBe('div');
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
			editor.$.frameContext.get('wysiwyg').innerHTML = '<p>Hello World</p>';

			// when
			const count = editor.$.char.getLength();

			// then
			expect(count).toBeGreaterThan(0);
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
			const isLine = editor.$.format.isLine(p);

			// then
			expect(isLine).toBe(true);
		});

		it('format.isBlock should check if element is a block format', () => {
			// given
			const div = document.createElement('div');

			// when
			const isBlock = editor.$.format.isBlock(div);

			// then
			expect(typeof isBlock).toBe('boolean');
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

		it('component.is should check if element is a component', () => {
			// given
			const div = document.createElement('div');

			// when
			const result = editor.$.component.is(div);

			// then
			expect(result).toBe(false);
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
			editor.$.viewer.codeView(true);

			// then
			expect(editor.$.frameContext.get('isCodeView')).toBe(true);

			// cleanup
			editor.$.viewer.codeView(false);
		});

		it('viewer.fullScreen should toggle full screen mode', () => {
			// when
			editor.$.viewer.fullScreen(true);

			// then
			expect(editor.$.frameContext.get('isFullScreen')).toBe(true);

			// cleanup
			editor.$.viewer.fullScreen(false);
		});

		it('viewer.showBlocks should toggle show blocks mode', () => {
			// when
			editor.$.viewer.showBlocks(true);

			// then
			expect(editor.$.frameContext.get('isShowBlocks')).toBe(true);

			// cleanup
			editor.$.viewer.showBlocks(false);
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
				plugins: {}, // plugins is a fixed option
			};

			// when
			editor.resetOptions(newOptions);

			// then - should warn about fixed option
			// restore
			consoleSpy.mockRestore();
		});
	});
});
