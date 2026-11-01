/**
 * @fileoverview Integration tests for the blockquote text shortcut (`>` + Space at the start of a line)
 * Exercises: plugins/command/blockquote.js (shortcut), core/section/constructor.js (default shortcuts), core/logic/shell/shortcuts.js
 *
 * jsdom keydown events are untrusted, so the keydown handler ignores them: these tests call `shortcuts.command()` the way
 * the handler does (the text before the caret as the keyword). The real keystroke path is covered by `test/e2e/blockquote.shortcut.spec.js`.
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { blockquote } from '../../src/plugins';

describe('Blockquote text shortcut', () => {
	let editor;
	let wysiwyg;

	async function create(options = {}) {
		editor = createTestEditor({ plugins: { blockquote }, buttonList: [['blockquote']], ...options });
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	}

	/** Sets the content, puts the caret at `offset` in the first text of `selector`, and presses Space there. */
	function spaceAt(html, selector, offset) {
		wysiwyg.innerHTML = html;
		const text = wysiwyg.querySelector(selector).firstChild;
		editor.$.selection.setRange(text, offset, text, offset);
		const range = editor.$.selection.getRange();
		const line = editor.$.format.getLine(text, null);
		const keyword = text.substringData(0, offset);
		return editor.$.shortcuts.command({ key: ' ' }, false, false, 'Space', keyword, true, line, range);
	}

	afterEach(() => {
		destroyTestEditor(editor);
	});

	it('should register ">" + Space as a default shortcut', async () => {
		await create();

		expect(editor.$.shortcuts.keyMap.get('>')).toEqual(
			expect.objectContaining({ command: 'blockquote', plugin: 'blockquote', method: 'shortcut', space: true }),
		);
	});

	it.each([
		['an empty line', '<p>&gt;</p>', '<blockquote><p>\u200B<br></p></blockquote>'], // without the `<br>` the line collapses to zero height; the toolbar button leaves the same
		['a line with text after the caret', '<p>&gt;abc</p>', '<blockquote><p>abc</p></blockquote>'],
	])('should turn %s into a blockquote and remove the ">"', async (_, html, expected) => {
		await create();

		expect(spaceAt(html, 'p', 1)).toBe(true);
		expect(wysiwyg.innerHTML).toBe(expected);
	});

	it('should nest a blockquote, not lift the line out, when it runs inside one', async () => {
		await create();

		expect(spaceAt('<blockquote><p>x</p><p>&gt;abc</p></blockquote>', 'p:last-child', 1)).toBe(true);
		expect(wysiwyg.innerHTML).toBe('<blockquote><p>x</p><blockquote><p>abc</p></blockquote></blockquote>');
	});

	it('should be undone in one step', async () => {
		await create();
		wysiwyg.innerHTML = '<p>&gt;abc</p>';
		editor.$.history.push(false);

		spaceAt('<p>&gt;abc</p>', 'p', 1);
		editor.$.history.undo();

		expect(wysiwyg.querySelector('blockquote')).toBeNull();
	});

	it('should not run when the keyword before the caret is not ">"', async () => {
		await create();

		expect(spaceAt('<p>a&gt;</p>', 'p', 2)).toBe(false);
		expect(wysiwyg.innerHTML).toBe('<p>a&gt;</p>');
	});

	it('should not register when the shortcut is turned off in the options', async () => {
		await create({ shortcuts: { blockquote: undefined } });

		expect(editor.$.shortcuts.keyMap.has('>')).toBe(false);
	});
});
