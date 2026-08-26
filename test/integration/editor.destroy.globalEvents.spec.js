/**
 * @fileoverview Regression tests for global (`window`) listeners outliving `destroy()`.
 *
 * `addEvent` registrations were tracked and torn down, `addGlobalEvent` ones were not. A module that
 * owns a global listener removes it on close, but one that never closes — an open menu or controller
 * when `destroy()` runs — left the listener attached. It then kept firing against a destroyed editor
 * and threw on the dead store (`Cannot read properties of null (reading '...')`).
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('editor.destroy - global event teardown', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		container.id = 'w-destroy-global-container';
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (container && container.parentNode) document.body.removeChild(container);
	});

	it('removes global listeners that were never explicitly unregistered', async () => {
		const editor = createTestEditor({ element: container, buttonList: [['bold']] });
		await waitForEditorReady(editor);

		const listener = jest.fn();
		editor.$.eventManager.addGlobalEvent('keydown', listener, false);

		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));
		expect(listener).toHaveBeenCalledTimes(1);

		destroyTestEditor(editor);

		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('keeps explicit removeGlobalEvent working', async () => {
		const editor = createTestEditor({ element: container, buttonList: [['bold']] });
		await waitForEditorReady(editor);

		const listener = jest.fn();
		const info = editor.$.eventManager.addGlobalEvent('keydown', listener, false);
		editor.$.eventManager.removeGlobalEvent(info);

		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));
		expect(listener).not.toHaveBeenCalled();

		destroyTestEditor(editor);
	});

	it('does not disturb a second editor', async () => {
		const first = createTestEditor({ element: container, buttonList: [['bold']] });
		await waitForEditorReady(first);

		const firstListener = jest.fn();
		first.$.eventManager.addGlobalEvent('keydown', firstListener, false);
		destroyTestEditor(first);

		const secondContainer = document.createElement('div');
		document.body.appendChild(secondContainer);
		const second = createTestEditor({ element: secondContainer, buttonList: [['bold']] });
		await waitForEditorReady(second);

		const secondListener = jest.fn();
		second.$.eventManager.addGlobalEvent('keydown', secondListener, false);

		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));

		expect(firstListener).not.toHaveBeenCalled();
		expect(secondListener).toHaveBeenCalledTimes(1);

		destroyTestEditor(second);
		document.body.removeChild(secondContainer);
	});
});
