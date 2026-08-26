/**
 * @fileoverview `ui.selectMenuOn` has to answer "is *any* SelectMenu open", across every instance.
 *
 * It used to be a plain boolean written by each `SelectMenu.open()` / `.close()`, so the last writer
 * won. Two field plugins on the same input stream is enough to break it: `autocomplete` closes its own
 * (never-opened) menu on every keystroke, which cleared the flag while `slashCommand`'s menu was still
 * on screen. `OnKeyDown_wysiwyg` then stopped deferring to the menu and called `menu.dropdownOff()` per
 * keydown, and a dropdown-free flyout reads dropdown-off as "the plugin committed" — so the sub-panel
 * and the whole menu came down on the next keypress.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import SlashCommand from '../../src/plugins/field/slashCommand';
import Autocomplete from '../../src/plugins/field/autocomplete';

describe('ui.selectMenuOn - one flag, many SelectMenu instances', () => {
	let editor;
	let container;

	beforeEach(async () => {
		// jsdom has no layout; the controller positions itself off the caret range's client rects.
		const rect = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };
		Range.prototype.getClientRects = () => [rect];
		Range.prototype.getBoundingClientRect = () => rect;

		container = document.createElement('div');
		container.id = 'w-selectmenu-openstate';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			plugins: { slashCommand: SlashCommand, autocomplete: Autocomplete },
			buttonList: [[]],
			slashCommand: { items: [{ key: 'h1', title: 'Heading 1', action: () => {} }], delayTime: 0 },
			autocomplete: {
				delayTime: 0,
				searchStartLength: 0,
				triggers: { '@': { apiUrl: '', useCache: false } },
			},
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') destroyTestEditor(editor);
		if (container && container.parentNode) document.body.removeChild(container);
	});

	/** Types the trigger into the first line and runs the (debounced) input inspection synchronously. */
	const openSlashMenu = () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>/</p>';
		const textNode = wysiwyg.querySelector('p').firstChild;
		editor.$.selection.setRange(textNode, 1, textNode, 1);
		SlashCommand.prototype.onInput.call(editor.$.plugins.slashCommand);
	};

	it('reports the open menu', () => {
		expect(editor.$.ui.selectMenuOn).toBe(false);
		openSlashMenu();
		expect(editor.$.ui.selectMenuOn).toBe(true);
	});

	it('stays on when another plugin closes its own menu', async () => {
		openSlashMenu();

		// autocomplete closes its (unopened) menu on every input — this must not clear the flag
		await Autocomplete.prototype.onInput.call(editor.$.plugins.autocomplete);

		expect(editor.$.ui.selectMenuOn).toBe(true);
	});

	it('goes off once the open menu itself closes', () => {
		openSlashMenu();

		// the trigger is gone, so the next input inspection dismisses the menu
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>plain</p>';
		const textNode = wysiwyg.querySelector('p').firstChild;
		editor.$.selection.setRange(textNode, 5, textNode, 5);
		SlashCommand.prototype.onInput.call(editor.$.plugins.slashCommand);

		expect(editor.$.ui.selectMenuOn).toBe(false);
	});
});
