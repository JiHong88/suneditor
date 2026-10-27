/**
 * @fileoverview Block handle action menu: the built-in custom items (`p`, `h1`-`h6`, `heading`,
 * `ul`, `ol`, `list`, `blockquote`, `pre`) and the default menu.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import Blockquote from '../../src/plugins/command/blockquote';

describe('BlockHandle - action menu built-in custom items', () => {
	let editor;

	beforeEach(() => {
		// The handle takes its block in an animation frame
		jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			cb(0);
			return 1;
		});
	});

	async function create(blockHandle, plugins = []) {
		editor = createTestEditor({ blockHandle, plugins });
		await waitForEditorReady(editor);
	}

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		editor = null;
		jest.restoreAllMocks();
	});

	/** Puts `html` in the editor and opens the action menu on its first line. */
	function openMenu(html = '<p>text</p>') {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = html;
		const line = wysiwyg.firstElementChild;
		editor.$.selection.setRange(line.firstChild, 0, line.firstChild, 0);
		editor.$.ui.blockHandle.positionForTarget(line);
		editor.$.frameContext.get('blockHandleDrag').click();
		return wysiwyg;
	}

	const menuForm = () => document.querySelector('.se-block-action-menu');
	const rowLabels = () =>
		[...menuForm().querySelectorAll('li[data-index]')].map((li) => li.textContent.trim());

	/** Clicks the row labelled `label`, then (for a submenu) its child labelled `childLabel`. */
	function pick(label, childLabel) {
		const row = [...menuForm().querySelectorAll('li[data-index]')].find((li) => li.textContent.trim() === label);
		row.click();
		if (!childLabel) return;
		const index = row.getAttribute('data-index');
		const child = [...document.querySelectorAll(`[data-parent-index="${index}"][data-child-index]`)].find(
			(li) => li.textContent.trim() === childLabel,
		);
		child.click();
	}

	it('opens the documented default menu when `menu` is not given', async () => {
		await create({});
		openMenu();

		expect(editor.$.ui.selectMenuOn).toBe(true);
		expect(rowLabels()).toEqual(['Paragraph', 'Header', 'List', 'Quote', 'Code']);
	});

	it('shows no menu for an empty array', async () => {
		await create({ menu: [] });
		openMenu();

		expect(menuForm()).toBeNull();
	});

	it.each([
		['h2', 'Header2', '<h2>text</h2>'],
		['pre', 'Code', '<pre>text</pre>'],
		['p', 'Paragraph', '<p>text</p>'],
	])('applies the "%s" key', async (key, label, expected) => {
		await create({ menu: [key] });
		const wysiwyg = openMenu(key === 'p' ? '<h3>text</h3>' : '<p>text</p>');
		pick(label);

		expect(wysiwyg.innerHTML).toBe(expected);
	});

	it('applies a heading from the "heading" submenu', async () => {
		await create({ menu: ['heading'] });
		const wysiwyg = openMenu();
		pick('Header', 'Header3');

		expect(wysiwyg.innerHTML).toBe('<h3>text</h3>');
	});

	it('makes a list from the "list" submenu and pushes history', async () => {
		await create({ menu: ['list'] });
		const wysiwyg = openMenu();
		const push = jest.spyOn(editor.$.history, 'push');
		pick('List', 'Bulleted list');

		expect(wysiwyg.querySelector('ul > li')?.textContent).toBe('text');
		expect(wysiwyg.children).toHaveLength(1);
		expect(push).toHaveBeenCalledWith(false);
	});

	it('toggles a blockquote', async () => {
		await create({ menu: ['blockquote'] });
		const wysiwyg = openMenu();
		pick('Quote');
		expect(wysiwyg.querySelector('blockquote > p')?.textContent).toBe('text');

		const line = wysiwyg.querySelector('p');
		editor.$.selection.setRange(line.firstChild, 0, line.firstChild, 0);
		editor.$.ui.blockHandle.positionForTarget(line);
		editor.$.frameContext.get('blockHandleDrag').click();
		pick('Quote');
		expect(wysiwyg.querySelector('blockquote')).toBeNull();
		expect(wysiwyg.querySelector('p')?.textContent).toBe('text');
	});

	it('uses a registered plugin of the same name instead of the built-in key', async () => {
		await create({ menu: ['blockquote'] }, [Blockquote]);
		openMenu();
		const action = jest.spyOn(editor.$.plugins.blockquote, 'action');
		menuForm().querySelector('li[data-index="0"]').click();

		expect(action).toHaveBeenCalled();
	});
});
