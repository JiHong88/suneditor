/**
 * @fileoverview Tests for `SlashCommand#open` — the programmatic entry point that shows the command
 * menu with no trigger character typed. Lets host UI (e.g. the block handle's plus button) reuse the
 * same menu without faking a `/` keystroke.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import SlashCommand from '../../src/plugins/field/slashCommand';

describe('SlashCommand#open', () => {
	let editor;
	let container;
	let plugin;

	beforeEach(async () => {
		// jsdom has no layout; the controller positions itself off the caret range's client rects.
		const rect = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };
		Range.prototype.getClientRects = () => [rect];
		Range.prototype.getBoundingClientRect = () => rect;

		container = document.createElement('div');
		container.id = 'w-slash-open-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			plugins: { slashCommand: SlashCommand },
			buttonList: [['bold']],
			slashCommand: { items: ['bold', 'italic'], delayTime: 0 },
		});
		await waitForEditorReady(editor);

		plugin = editor.$.plugins.slashCommand;
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') destroyTestEditor(editor);
		if (container && container.parentNode) document.body.removeChild(container);
	});

	/** @returns {HTMLElement} the first (empty) line */
	const emptyLine = () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p><br></p>';
		return wysiwyg.querySelector('p');
	};

	it('opens the menu with the full item list', () => {
		expect(plugin.open(emptyLine())).toBe(true);
		expect(editor.$.ui.selectMenuOn).toBe(true);
	});

	it('reports failure without an anchor', () => {
		expect(plugin.open(null)).toBe(false);
		expect(editor.$.ui.selectMenuOn).toBe(false);
	});

	it('selecting an item does not delete surrounding text', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>keep me</p>';
		const line = wysiwyg.querySelector('p');

		plugin.open(line);
		editor.$.frameContext
			.get('_ww')
			.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));

		expect(wysiwyg.textContent).toContain('keep me');
	});

	it('dismissing leaves the line untouched', () => {
		const line = emptyLine();
		plugin.open(line);

		editor.$.frameContext
			.get('_ww')
			.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }));

		expect(editor.$.ui.selectMenuOn).toBe(false);
		expect(line.innerHTML).toBe('<br>');
	});
});
