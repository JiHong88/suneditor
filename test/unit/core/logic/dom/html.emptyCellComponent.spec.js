/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../../__mocks__/editorIntegration';
import { PluginCommand } from '../../../../../src/interfaces';
import { table, hr } from '../../../../../src/plugins';

/**
 * Regression (#1721): `html.get()` replaces each table cell whose only line is empty with `<br>`.
 * A custom component (or an `hr`) has no text and no media tag, so `isEmptyLine()` took it for an
 * empty line and the cell (component included) was cleared — also when the component carries no
 * `se-component` class and is recognized only by its plugin's `static component()`.
 */
jest.setTimeout(30000);

class MyWidget extends PluginCommand {
	static key = 'myWidget';
	static component(node) {
		return node?.nodeName === 'MY-WIDGET' ? node : null;
	}

	constructor(kernel) {
		super(kernel);
		this.title = 'Widget';
		this.icon = 'widget';
	}

	action() {}
}

const cellTable = (cell) => `<table><tbody><tr><td>${cell}</td></tr></tbody></table>`;
// the table plugin wraps the table in a figure and adds a colgroup — compare the cell content only
const getCell = (editor) => /<td>(.*?)<\/td>/.exec(editor.$.html.get())?.[1];

describe('Core Logic - HTML - component as the only content of a table cell', () => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		editor = createTestEditor({
			plugins: [table, hr, MyWidget],
			buttonList: [['table', 'hr', 'myWidget']],
			elementWhitelist: 'my-widget',
		});
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it.each([
		['a block component', '<my-widget class="se-component"></my-widget>'],
		[
			'an inline component in the line',
			'<div><my-widget class="se-component se-inline-component"></my-widget></div>',
		],
		['a block component without the se-component class', '<my-widget></my-widget>'],
		['an inline component without the se-component class', '<div><my-widget></my-widget></div>'],
		['an hr', '<hr>'],
		['an hr in the line', '<div><hr></div>'],
	])('keeps %s that is the only content of a cell', (_, cell) => {
		editor.$.html.set(cellTable(cell));
		expect(getCell(editor)).toBe(cell);
	});

	it('still clears a cell whose only line is empty', () => {
		editor.$.html.set(cellTable('<div><br></div>'));
		expect(getCell(editor)).toBe('<br>');
	});
});
