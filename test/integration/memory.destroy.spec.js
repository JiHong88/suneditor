/**
 * @fileoverview Memory leak tests for editor destroy() function
 * Verifies that destroy() properly breaks circular references and releases memory
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import { _getClassInjectorKeys } from '../../src/editorInjector/_classes';

describe('Editor destroy() memory management', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'memory-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['undo', 'redo', 'bold', 'italic']],
			width: '100%',
			height: 'auto'
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	});

	describe('Circular reference breaking', () => {
		it('should nullify editor reference in all ClassInjector instances after destroy', () => {
			// Get keys directly from ClassInjector
			const classInjectorKeys = _getClassInjectorKeys();

			// Collect references before destroy
			const classInstances = {};
			for (const key of classInjectorKeys) {
				classInstances[key] = editor[key];
			}

			// Verify all instances have editor reference before destroy
			for (const key of classInjectorKeys) {
				const instance = classInstances[key];
				if (instance) {
					expect(instance.editor).toBeTruthy();
				}
			}

			// Destroy the editor
			editor.destroy();

			// Verify editor reference is nullified in all instances
			for (const key of classInjectorKeys) {
				const instance = classInstances[key];
				if (instance) {
					expect(instance.editor).toBeNull();
				}
			}

			// Verify editor's references are also null
			for (const key of classInjectorKeys) {
				expect(editor[key]).toBeNull();
			}
		});

		it('should nullify editor reference in plugins after destroy', () => {
			// If there are plugins, verify they are cleaned up
			const plugins = editor.plugins;
			const pluginKeys = Object.keys(plugins || {});

			editor.destroy();

			// After destroy, plugins should have editor = null
			for (const key of pluginKeys) {
				if (plugins[key]) {
					expect(plugins[key].editor).toBeNull();
				}
			}
		});

		it('should clear Map objects after destroy', () => {
			// Get references to Map objects before destroy
			const allCommandButtons = editor.allCommandButtons;
			const subAllCommandButtons = editor.subAllCommandButtons;
			const shortcutsKeyMap = editor.shortcutsKeyMap;
			const commandTargets = editor.commandTargets;

			// Verify Maps have some state before destroy (may be empty in test env)
			expect(allCommandButtons).toBeInstanceOf(Map);
			expect(subAllCommandButtons).toBeInstanceOf(Map);
			expect(shortcutsKeyMap).toBeInstanceOf(Map);
			expect(commandTargets).toBeInstanceOf(Map);

			editor.destroy();

			// Verify Maps are cleared after destroy
			expect(allCommandButtons.size).toBe(0);
			expect(subAllCommandButtons.size).toBe(0);
			expect(shortcutsKeyMap.size).toBe(0);
			expect(commandTargets.size).toBe(0);
		});

		it('should nullify events object after destroy', () => {
			// Verify events exist before destroy
			expect(editor.events).toBeTruthy();

			editor.destroy();

			// Verify events are nullified after destroy
			expect(editor.events).toBeNull();
		});

		it('should nullify plugins object after destroy', () => {
			editor.destroy();

			expect(editor.plugins).toBeNull();
		});

		it('should nullify internal arrays and objects after destroy', () => {
			editor.destroy();

			// Arrays should be nullified
			expect(editor._controllerOnDisabledButtons).toBeNull();
			expect(editor._codeViewDisabledButtons).toBeNull();
			expect(editor.opendControllers).toBeNull();
			expect(editor._componentManager).toBeNull();

			// Objects should be nullified
			expect(editor._fileManager).toBeNull();
			expect(editor._originOptions).toBeNull();
			expect(editor.activeCommands).toBeNull();
			expect(editor.rootKeys).toBeNull();
		});
	});

	describe('WeakRef GC eligibility', () => {
		it('should allow class instances to be GC eligible after destroy', () => {
			// This test verifies the pattern for GC eligibility
			// Note: We can't force GC in Jest, but we can verify the references are broken

			// Store WeakRef to an internal object
			const menuRef = new WeakRef(editor.menu);
			const formatRef = new WeakRef(editor.format);

			// Before destroy, deref should return the object
			expect(menuRef.deref()).toBeTruthy();
			expect(formatRef.deref()).toBeTruthy();

			// Destroy and nullify our reference
			editor.destroy();
			editor = null;

			// After destroy, the objects may still exist (not GC'd yet)
			// but the circular references are broken
			// In a real browser with GC, these would eventually become undefined
			// For now, we just verify the pattern is correct
			const menuInstance = menuRef.deref();
			const formatInstance = formatRef.deref();

			// If instances still exist, their editor ref should be null
			if (menuInstance) {
				expect(menuInstance.editor).toBeNull();
			}
			if (formatInstance) {
				expect(formatInstance.editor).toBeNull();
			}
		});
	});

	describe('DOM cleanup', () => {
		it('should remove DOM elements after destroy', () => {
			// Get references to DOM elements before destroy
			const topArea = editor.frameContext.get('topArea');
			const hasTopAreaBefore = topArea && topArea.parentNode;

			editor.destroy();

			// After destroy, topArea should be removed from DOM
			if (hasTopAreaBefore) {
				expect(topArea.parentNode).toBeNull();
			}
		});

		it('should clear context Maps after destroy', () => {
			const context = editor.context;
			const options = editor.options;
			const frameRoots = editor.frameRoots;

			// Verify Maps exist before destroy
			expect(context).toBeTruthy();
			expect(options).toBeTruthy();
			expect(frameRoots).toBeTruthy();

			// Check if they are real Maps with size property
			const contextIsMap = context instanceof Map || typeof context.size === 'number';
			const optionsIsMap = options instanceof Map || typeof options.size === 'number';
			const frameRootsIsMap = frameRoots instanceof Map || typeof frameRoots.size === 'number';

			editor.destroy();

			// Verify Maps are cleared after destroy
			if (contextIsMap) {
				expect(context.size).toBe(0);
			}
			if (optionsIsMap) {
				expect(options.size).toBe(0);
			}
			if (frameRootsIsMap) {
				expect(frameRoots.size).toBe(0);
			}
		});
	});

	describe('History cleanup', () => {
		it('should destroy history after editor destroy', () => {
			const history = editor.history;
			const destroySpy = jest.spyOn(history, 'destroy');

			editor.destroy();

			expect(destroySpy).toHaveBeenCalled();
			expect(editor.history).toBeNull();
		});
	});

	describe('Event listener cleanup', () => {
		it('should remove all event listeners after destroy', () => {
			const eventManager = editor.eventManager;
			const removeAllEventsSpy = jest.spyOn(eventManager, '_removeAllEvents');

			editor.destroy();

			expect(removeAllEventsSpy).toHaveBeenCalled();
		});
	});

	describe('Multiple editor instances', () => {
		it('should not affect other editor instances when one is destroyed', async () => {
			// Create a second editor
			const container2 = document.createElement('div');
			container2.id = 'memory-test-container-2';
			document.body.appendChild(container2);

			const editor2 = createTestEditor({
				element: container2,
				buttonList: [['bold']],
			});
			await waitForEditorReady(editor2);

			// Destroy first editor
			editor.destroy();

			// Second editor should still work
			expect(editor2.eventManager).toBeTruthy();
			expect(editor2.selection).toBeTruthy();
			expect(editor2.format).toBeTruthy();

			// Cleanup second editor
			destroyTestEditor(editor2);
			if (container2.parentNode) {
				container2.parentNode.removeChild(container2);
			}
		});
	});

	describe('Repeated create/destroy cycles', () => {
		it('should handle multiple create/destroy cycles without memory accumulation', async () => {
			// First destroy the initial editor
			editor.destroy();

			// Track DOM elements count
			const initialDomCount = document.body.querySelectorAll('*').length;

			// Create and destroy editors multiple times
			for (let i = 0; i < 3; i++) {
				const tempContainer = document.createElement('div');
				tempContainer.id = `cycle-test-${i}`;
				document.body.appendChild(tempContainer);

				const tempEditor = createTestEditor({
					element: tempContainer,
					buttonList: [['bold']],
				});
				await waitForEditorReady(tempEditor);

				// Verify editor works
				expect(tempEditor.selection).toBeTruthy();

				// Destroy
				destroyTestEditor(tempEditor);
				if (tempContainer.parentNode) {
					tempContainer.parentNode.removeChild(tempContainer);
				}
			}

			// DOM element count should be similar to initial (allowing some variance for test artifacts)
			const finalDomCount = document.body.querySelectorAll('*').length;
			expect(finalDomCount).toBeLessThanOrEqual(initialDomCount + 10);
		});
	});
});
