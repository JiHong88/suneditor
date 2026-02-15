/**
 * @fileoverview Unit tests for editor run and plugin registration logic
 */
import Editor from '../../../src/core/editor';
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';
import { dom } from '../../../src/helper';

describe('Editor Run & Plugin Logic', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);

		// Mock UI methods to avoid rendering issues
		editor.$.ui.showLoading = jest.fn();
		editor.$.ui.hideLoading = jest.fn();
		editor.$.ui.showToast = jest.fn();

		// Mock menu methods for run dispatching
		editor.$.menu.dropdownOn = jest.fn();
		editor.$.menu.dropdownOff = jest.fn();
		editor.$.menu.containerOn = jest.fn();
		editor.$.menu.containerOff = jest.fn();

		// Mock viewer
		editor.$.viewer._resetFullScreenHeight = jest.fn();
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('registerPlugin', () => {
		it('should throw error if plugin is not found or invalid format', () => {
			// Mock console.error
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			// We use a try-catch block to ensure we don't pollute the editor instance permanently with bad state if possible,
			// although the error happens before assignment in some cases.
			// editor.registerPlugin checks `this.plugins[pluginName]`.
			// IF we set it to null, it throws.
			editor.$.plugins['nonExistent'] = null;

			expect(() => {
				editor.registerPlugin('nonExistent', [], {});
			}).toThrow();

			// Cleanup for afterEach destroy
			delete editor.$.plugins['nonExistent'];
			consoleSpy.mockRestore();
		});

		it('should register a valid plugin with targets', () => {
			const pluginName = 'testPlugin';
			const mockPluginClass = jest.fn(function (e) {
				this.active = jest.fn();
				// Add _destroy to avoid warnings during cleanup
				this._destroy = jest.fn();
			});
			editor.$.plugins[pluginName] = mockPluginClass;

			const buttons = [document.createElement('button')];
			editor.$.pluginManager.register(pluginName, buttons, { option: true });

			expect(mockPluginClass).toHaveBeenCalled();
		});
	});

	describe('run method complex types', () => {
		it('should handle "more" type command (Sub Toolbar)', () => {
			const button = document.createElement('button');
			const toolbar = document.createElement('div');
			toolbar.className = 'se-toolbar se-toolbar-sub';
			toolbar.appendChild(button);

			const layer = document.createElement('div');
			layer.className = 'moreCommand';
			toolbar.appendChild(layer);

			// Mock subToolbar events
			editor.$.subToolbar = {
				currentMoreLayerActiveButton: null,
				_moreLayerOn: jest.fn(),
				_showBalloon: jest.fn(),
				_showInline: jest.fn(),
				_moreLayerOff: jest.fn(),
			};

			// Mock dom utilities to ensure path is taken
			const getParentSpy = jest.spyOn(dom.query, 'getParentElement').mockReturnValue(toolbar);
			const hasClassSpy = jest.spyOn(dom.utils, 'hasClass').mockReturnValue(true); // Is sub toolbar

			editor.$.commandDispatcher.run('moreCommand', 'more', button);

			expect(editor.$.subToolbar._moreLayerOn).toHaveBeenCalled();
			expect(editor.$.viewer._resetFullScreenHeight).toHaveBeenCalled();

			getParentSpy.mockRestore();
			hasClassSpy.mockRestore();
		});

		it('should toggle off "more" layer if button matches active', () => {
			const button = document.createElement('button');
			const toolbar = document.createElement('div');
			toolbar.className = 'se-toolbar';

			editor.$.toolbar = {
				currentMoreLayerActiveButton: button,
				_moreLayerOn: jest.fn(),
				_showBalloon: jest.fn(),
				_showInline: jest.fn(),
				_moreLayerOff: jest.fn(),
			};

			const getParentSpy = jest.spyOn(dom.query, 'getParentElement').mockReturnValue(toolbar);
			const hasClassSpy = jest.spyOn(dom.utils, 'hasClass').mockReturnValue(false); // Not sub toolbar

			editor.$.commandDispatcher.run('moreCommand', 'more', button);

			expect(editor.$.toolbar._moreLayerOff).toHaveBeenCalled();

			getParentSpy.mockRestore();
			hasClassSpy.mockRestore();
		});

		// ... other tests ...

		it('should perform cleanup when type is "dropdown" but button matches active', () => {
			// Scenario: Droppown button clicked again -> should toggle off (cleanup)
			const button = document.createElement('button');
			editor.$.menu.currentDropdownActiveButton = button;
			editor.$.menu.targetMap = { testDropdown: {} };

			editor.$.commandDispatcher.run('testDropdown', 'dropdown', button);

			// It skips the main block `if (/dropdown/ ... && button !== current)`
			// And falls through to cleanup
			expect(editor.$.menu.dropdownOff).toHaveBeenCalled();
		});
	});

	describe('runFromTarget', () => {
		it('should execute run from command button target', () => {
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');
			button.setAttribute('data-type', 'command');

			// Mock run to verify propagation without execution
			const runSpy = jest.spyOn(editor.$.commandDispatcher, 'run').mockImplementation(() => {});
			jest.spyOn(dom.query, 'getCommandTarget').mockReturnValue(button);

			editor.$.commandDispatcher.runFromTarget(button);

			expect(runSpy).toHaveBeenCalledWith('bold', 'command', button);
			runSpy.mockRestore();
		});

		it('should return if target is input', () => {
			const input = document.createElement('input');
			jest.spyOn(dom.check, 'isInputElement').mockReturnValue(true);
			jest.spyOn(editor.$.commandDispatcher, 'run');

			editor.$.commandDispatcher.runFromTarget(input);

			expect(editor.$.commandDispatcher.run).not.toHaveBeenCalled();
		});

		it('should return if button is disabled', () => {
			const button = document.createElement('button');
			button.disabled = true;
			button.setAttribute('data-command', 'bold');

			jest.spyOn(dom.query, 'getCommandTarget').mockReturnValue(button);
			jest.spyOn(editor.$.commandDispatcher, 'run');

			editor.$.commandDispatcher.runFromTarget(button);

			expect(editor.$.commandDispatcher.run).not.toHaveBeenCalled();
		});
	});

	describe('setDir propagation', () => {
		it('should propagate setDir to plugins', () => {
			const mockPlugin = { setDir: jest.fn() };
			editor.$.plugins['test'] = mockPlugin;

			// options._rtl starts false
			editor.$.ui.setDir('rtl');

			expect(mockPlugin.setDir).toHaveBeenCalledWith('rtl');
		});
	});

	// We can add specific isEmpty edge cases here too if needed
	describe('isEmpty detailed', () => {
		it('should return true if content is just a newline and disallowed tags are empty', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';
			wysiwyg.textContent = ''; // simulate zero width

			// Mock innerText checking (since jsdom innerText is simplistic)
			Object.defineProperty(wysiwyg, 'textContent', { value: '' });
			Object.defineProperty(wysiwyg, 'innerText', { value: '\n' });

			// allowedEmptyTags default?
			editor.$.options.set('allowedEmptyTags', 'iframe, object');

			expect(editor.isEmpty()).toBe(true);
		});
	});
});
