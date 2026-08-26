/**
 * @fileoverview Regression tests for picking a dropdown-free plugin (table, fontColor, ...) out of the
 * slash command menu with the keyboard.
 *
 * The mouse works because `CommandMenu#onMenuMouseMove` opens the flyout on hover, while the menu is
 * still on screen. The keyboard has no hover equivalent: Enter reaches `SlashCommand#onSelectItem`,
 * which closed the menu *before* dispatching — so the flyout lost its anchor and the plugin's dropdown
 * was stranded outside the toolbar's menu tray.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import SlashCommand from '../../src/plugins/field/slashCommand';
import Table from '../../src/plugins/dropdown/table/index';

describe('SlashCommand - keyboard selection of a dropdown-free plugin', () => {
	let editor;
	let container;
	let plugin;

	beforeEach(async () => {
		// jsdom has no layout; the controller positions itself off the caret range's client rects.
		const rect = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };
		Range.prototype.getClientRects = () => [rect];
		Range.prototype.getBoundingClientRect = () => rect;

		container = document.createElement('div');
		container.id = 'w-slash-keyboard-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			plugins: { slashCommand: SlashCommand, table: Table },
			buttonList: [['table']],
			slashCommand: { items: ['table'], delayTime: 0 },
		});
		await waitForEditorReady(editor);

		plugin = editor.$.plugins.slashCommand;
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') destroyTestEditor(editor);
		if (container && container.parentNode) document.body.removeChild(container);
	});

	/** Types the trigger into the first line and runs the (debounced) input inspection synchronously. */
	const openMenu = () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		wysiwyg.innerHTML = '<p>/</p>';
		const textNode = wysiwyg.querySelector('p').firstChild;
		editor.$.selection.setRange(textNode, 1, textNode, 1);

		// bypass the debounce wrapper installed in the constructor
		SlashCommand.prototype.onInput.call(plugin);
	};

	/** Presses a key on whatever the SelectMenu bound its keyboard navigation to. */
	const press = (code) =>
		editor.$.frameContext
			.get('_ww')
			.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true, cancelable: true }));

	it('opens the menu for the trigger character', () => {
		openMenu();
		expect(editor.$.ui.selectMenuOn).toBe(true);
	});

	it('keeps the menu open on Enter so the flyout has an anchor', () => {
		openMenu();
		press('Enter');

		expect(editor.$.ui.selectMenuOn).toBe(true);
	});

	it('moves the table picker into the menu', () => {
		openMenu();
		press('Enter');

		const tableDropdown = editor.$.menu.targetMap.table;
		expect(tableDropdown).toBeTruthy();
		expect(tableDropdown.closest('.se-slash-command-menu')).not.toBeNull();
	});

	it.each(['ArrowLeft', 'ArrowRight'])('leaves the flyout on %s without closing the menu', (code) => {
		const tableDropdown = editor.$.menu.targetMap.table;
		const menuTray = tableDropdown.parentNode;

		openMenu();
		press('Enter');
		press(code);

		// back to the row, flyout gone, menu still up. Both directions close, so RTL needs no mirroring.
		expect(editor.$.ui.selectMenuOn).toBe(true);
		expect(tableDropdown.parentNode).toBe(menuTray);
	});

	it.each(['ArrowLeft', 'ArrowRight'])('opens the flyout on %s', (code) => {
		const tableDropdown = editor.$.menu.targetMap.table;
		const menuTray = tableDropdown.parentNode;

		openMenu();
		press(code);

		// a horizontal arrow toggles the row's sub-panel, so it opens as well as closes
		expect(tableDropdown.parentNode).not.toBe(menuTray);
		expect(tableDropdown.closest('.se-slash-command-menu')).not.toBeNull();
		expect(editor.$.ui.selectMenuOn).toBe(true);
	});

	it('does not leave the flyout open behind a moved cursor', () => {
		const tableDropdown = editor.$.menu.targetMap.table;
		const menuTray = tableDropdown.parentNode;

		openMenu();
		press('Enter');
		press('ArrowDown');

		expect(tableDropdown.parentNode).toBe(menuTray);
	});

	it('returns the toolbar dropdown to the menu tray on dismiss', () => {
		const tableDropdown = editor.$.menu.targetMap.table;
		const menuTray = tableDropdown.parentNode;

		openMenu();
		press('Enter');
		press('Escape');

		expect(tableDropdown.parentNode).toBe(menuTray);
	});
});
