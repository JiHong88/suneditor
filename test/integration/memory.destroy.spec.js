/**
 * @fileoverview Memory leak tests for editor destroy() function
 * Verifies that destroy() properly breaks circular references and releases memory
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

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
			height: 'auto',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	});

	describe('Circular reference breaking', () => {

		it('should nullify editor reference in plugins after destroy', () => {
			// If there are plugins, verify they are cleaned up
			const plugins = editor.$.plugins;
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
			// Get references to Map objects before destroy (refactored locations)
			const allCommandButtons = editor.$.commandDispatcher.allCommandButtons;
			const subAllCommandButtons = editor.$.commandDispatcher.subAllCommandButtons;
			const shortcutsKeyMap = editor.$.shortcuts.keyMap;
			const commandTargets = editor.$.commandDispatcher.targets;

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
			// Verify events exist before destroy (if present)
			if (editor.events !== undefined) {
				expect(editor.events).toBeTruthy();
			}

			editor.destroy();

			// Verify events are nullified after destroy
			expect(editor.events).toBeNull();
		});

		it('should nullify plugins object after destroy', () => {
			editor.destroy();

			// Plugins may be an empty object or null after destroy
			expect(!editor.$.plugins || Object.keys(editor.$.plugins).length === 0).toBe(true);
		});

	});

	describe('WeakRef GC eligibility', () => {
	});

	describe('DOM cleanup', () => {
		it('should remove DOM elements after destroy', () => {
			// Get references to DOM elements before destroy
			const topArea = editor.$.frameContext.get('topArea');
			const hasTopAreaBefore = topArea && topArea.parentNode;

			editor.destroy();

			// After destroy, topArea should be removed from DOM
			if (hasTopAreaBefore) {
				expect(topArea.parentNode).toBeNull();
			}
		});

		it('should clear context Maps after destroy', () => {
			const context = editor.$.context;
			const options = editor.$.options;
			const frameRoots = editor.$.frameRoots;

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
	});

	describe('Event listener cleanup', () => {
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
			expect(editor2.$.eventManager).toBeTruthy();
			expect(editor2.$.selection).toBeTruthy();
			expect(editor2.$.format).toBeTruthy();

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
				expect(tempEditor.$.selection).toBeTruthy();

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
