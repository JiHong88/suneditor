/**
 * @fileoverview Integration tests for the SlashCommand plugin
 * Tests src/plugins/field/slashCommand.js through a real editor.
 *
 * `controller.isOpen` is the public signal for the menu's open/close decision; the rendered
 * `.se-slash-command-menu .se-select-item` rows reflect what passed the filter.
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { slashCommand } from '../../src/plugins';

// JSDOM has no layout — stub the rects the menu/controller read while positioning.
const mockRect = { top: 100, left: 100, bottom: 120, right: 200, width: 100, height: 20, x: 100, y: 100 };
if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => [mockRect];
if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => mockRect;

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

function setCursor(node, offset) {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

const ITEMS = () => [
	{ key: 'h1', title: 'Heading 1', keywords: ['header', 'title'], action: jest.fn() },
	{ key: 'h2', title: 'Heading 2', action: jest.fn() },
	{ key: 'quote', title: 'Quote', action: jest.fn() },
];

async function makeEditor(slashOptions) {
	const editor = createTestEditor({
		plugins: { slashCommand },
		buttonList: [],
		slashCommand: { items: ITEMS(), delayTime: 0, ...slashOptions },
	});
	await waitForEditorReady(editor);
	return editor;
}

describe('SlashCommand plugin', () => {
	let editor;
	let wysiwyg;
	let sc;

	beforeEach(async () => {
		editor = await makeEditor();
		wysiwyg = editor.$.frameContext.get('wysiwyg');
		sc = editor.$.plugins.slashCommand;
		editor.$.store.set('hasFocus', true);
	});

	// Let queued callbacks (controller close, deferred frame sync) flush before teardown so a
	// stray timer can't fire against a destroyed store.
	afterEach(async () => {
		await tick();
		destroyTestEditor(editor);
	});

	/** Put `html` in the editor, drop the caret at `caretOffset` (default: end of first line), run onInput. */
	async function input(html, caretOffset) {
		wysiwyg.innerHTML = html;
		const textNode = wysiwyg.querySelector('p').firstChild;
		setCursor(textNode, caretOffset == null ? textNode.textContent.length : caretOffset);
		sc.onInput();
		await tick();
	}

	const rowCount = () => document.querySelectorAll('.se-slash-command-menu .se-select-item').length;

	describe('registration', () => {
		it('registers the plugin and its controller', () => {
			expect(sc).toBeTruthy();
			expect(sc.controller).toBeTruthy();
			expect(slashCommand.key).toBe('slashCommand');
		});
	});

	describe('trigger detection', () => {
		it('opens on a bare "/" at the start of a line', async () => {
			await input('<p>/</p>');
			expect(sc.controller.isOpen).toBe(true);
		});

		it('opens and filters by the typed query', async () => {
			await input('<p>/quote</p>');
			expect(sc.controller.isOpen).toBe(true);
			expect(rowCount()).toBe(1); // only "Quote"
		});

		it('matches against keywords, not just the title', async () => {
			await input('<p>/title</p>');
			expect(rowCount()).toBe(1); // "Heading 1" via its "title" keyword
		});

		it('shows every item for a bare "/"', async () => {
			await input('<p>/</p>');
			expect(rowCount()).toBe(3);
		});

		it('does not open without the trigger char', async () => {
			await input('<p>hello</p>');
			expect(sc.controller.isOpen).toBe(false);
		});

		it('closes when the query contains whitespace', async () => {
			await input('<p>/head ing</p>');
			expect(sc.controller.isOpen).toBe(false);
		});

		it('closes the menu when the selection is lost', async () => {
			await input('<p>/quote</p>');
			expect(sc.controller.isOpen).toBe(true);
			window.getSelection().removeAllRanges();
			sc.onInput();
			await tick();
			expect(sc.controller.isOpen).toBe(false);
		});

		it('does not open when "/" directly follows a non-space char', async () => {
			await input('<p>path/to</p>', 5); // caret right after the "/"
			expect(sc.controller.isOpen).toBe(false);
		});

		it('opens when "/" is preceded by whitespace', async () => {
			await input('<p>go /he</p>');
			expect(sc.controller.isOpen).toBe(true);
		});
	});

	describe('empty-match handling', () => {
		it('closes when nothing matches and no emptyMessage is configured', async () => {
			await input('<p>/zzzzz</p>');
			expect(sc.controller.isOpen).toBe(false);
		});

		it('shows the empty row when nothing matches and emptyMessage is set', async () => {
			destroyTestEditor(editor);
			editor = await makeEditor({ emptyMessage: 'No results' });
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			sc = editor.$.plugins.slashCommand;
			editor.$.store.set('hasFocus', true);

			await input('<p>/zzzzz</p>');
			expect(document.querySelector('.se-slash-empty')?.textContent).toBe('No results');
		});
	});

	describe('limitSize', () => {
		it('caps the number of rendered rows', async () => {
			destroyTestEditor(editor);
			editor = await makeEditor({ limitSize: 2 });
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			sc = editor.$.plugins.slashCommand;
			editor.$.store.set('hasFocus', true);

			await input('<p>/</p>');
			expect(rowCount()).toBe(2);
		});
	});

	describe('custom trigger char', () => {
		it('uses a configured trigger char instead of "/"', async () => {
			destroyTestEditor(editor);
			editor = await makeEditor({ triggerChar: ':' });
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			sc = editor.$.plugins.slashCommand;
			editor.$.store.set('hasFocus', true);

			await input('<p>/head</p>'); // "/" is no longer the trigger
			expect(sc.controller.isOpen).toBe(false);

			await input('<p>:head</p>');
			expect(sc.controller.isOpen).toBe(true);
		});
	});

	describe('dispatch', () => {
		it('removes the trigger text and runs the item action on select', async () => {
			const items = ITEMS();
			destroyTestEditor(editor);
			editor = createTestEditor({
				plugins: { slashCommand },
				buttonList: [],
				slashCommand: { items, delayTime: 0 },
			});
			await waitForEditorReady(editor);
			wysiwyg = editor.$.frameContext.get('wysiwyg');
			sc = editor.$.plugins.slashCommand;
			editor.$.store.set('hasFocus', true);

			await input('<p>/head</p>');
			const row = document.querySelector('.se-slash-command-menu .se-select-item');
			expect(row).toBeTruthy();
			row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await tick();

			// "Heading 1" action fired and the "/head" trigger text is gone.
			expect(items[0].action).toHaveBeenCalledTimes(1);
			expect(wysiwyg.textContent).not.toContain('/head');
		});
	});
});
