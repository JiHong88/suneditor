/**
 * @fileoverview The font size +/- buttons must keep stepping from the applied size.
 * Re-styling the same span keeps the same selection node, so the toolbar state must not be skipped as "unchanged".
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { fontSize } from '../../src/plugins';

describe('FontSize plugin - inc/dec controls', () => {
	let editor;

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		editor = null;
	});

	it('steps the size on every click and keeps the toolbar input in sync', async () => {
		editor = createTestEditor({
			plugins: { fontSize },
			buttonList: [['fontSize']],
			fontSize: { showIncDecControls: true, showDefaultSizeLabel: true },
		});
		await waitForEditorReady(editor);

		const plugin = editor.$.plugins.fontSize;
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		editor.$.store.set('hasFocus', true);
		editor.$.html.set('<p>Hello <span style="font-size: 16px;">world</span> text</p>');
		const text = wysiwyg.querySelector('span').firstChild;
		editor.$.selection.setRange(text, 0, text, 5);

		const input = plugin.afterItem.parentElement.querySelector('.__se__font_size');
		const click = async (dir) => {
			await plugin.action(dir === 'inc' ? plugin.afterItem : plugin.beforeItem);
			editor.$.eventManager.applyTagEffect(); // what the selectionchange after the edit does
		};

		editor.$.eventManager.applyTagEffect();
		expect(input.value).toBe('16px');

		await click('inc');
		await click('inc');
		await click('inc');
		expect(wysiwyg.querySelector('span').style.fontSize).toBe('19px');
		expect(input.value).toBe('19px');

		await click('dec');
		expect(wysiwyg.querySelector('span').style.fontSize).toBe('18px');
		expect(input.value).toBe('18px');
	});
});
