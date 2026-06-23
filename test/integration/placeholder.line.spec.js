/**
 * @fileoverview Integration tests for the Notion-style per-line placeholder (`placeholder_line`).
 * Tests the show/hide + priority logic in UIManager._updatePlaceholder / #updateLinePlaceholder.
 *
 * Pixel positioning depends on real layout (verified in the browser); JSDOM has none, so these
 * tests cover the behavior that does not need layout: which placeholder is visible, and when.
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

function setCaret(node, offset) {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

async function makeEditor(options) {
	const editor = createTestEditor({ buttonList: [], ...options });
	await waitForEditorReady(editor);
	return editor;
}

const display = (el) => el.style.display;

describe('placeholder_line (per-line placeholder)', () => {
	let editor;
	let fc;
	let wysiwyg;
	let main;
	let line;

	beforeEach(async () => {
		editor = await makeEditor({ placeholder: 'Empty editor', placeholder_line: "Type '/' for commands" });
		fc = editor.$.frameContext;
		wysiwyg = fc.get('wysiwyg');
		main = fc.get('placeholder');
		line = fc.get('placeholder_line');
	});

	afterEach(() => destroyTestEditor(editor));

	/** Drop the caret into `selector`'s line, set focus state, and run the placeholder update. */
	function focusLine(selector, { focused = true, offset = 0 } = {}) {
		const target = wysiwyg.querySelector(selector);
		setCaret(target, offset);
		editor.$.store.set('hasFocus', focused);
		editor.$.selection.init();
		editor.$.ui._updatePlaceholder(fc);
	}

	it('creates the line placeholder element with the configured text', () => {
		expect(line).toBeTruthy();
		expect(line.classList.contains('se-placeholder-line')).toBe(true);
		expect(line.textContent).toBe("Type '/' for commands");
	});

	it('shows the line placeholder on a focused empty line, hiding the empty-editor one', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p');
		expect(display(line)).toBe('block');
		expect(display(main)).toBe('none'); // line placeholder takes priority
	});

	it('falls back to the empty-editor placeholder when the editor is blurred', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p', { focused: false });
		expect(display(line)).toBe('none');
		expect(display(main)).toBe('block');
	});

	it('hides both placeholders when the caret sits on a non-empty line', () => {
		wysiwyg.innerHTML = '<p>hello</p>';
		focusLine('p', { offset: 1 });
		expect(display(line)).toBe('none');
		expect(display(main)).toBe('none');
	});

	it('shows the line placeholder on an empty line in the middle of content', () => {
		wysiwyg.innerHTML = '<p>first</p><p><br></p><p>third</p>';
		focusLine('p:nth-child(2)');
		expect(display(line)).toBe('block');
		expect(display(main)).toBe('none'); // editor is not empty, so only the line placeholder shows
	});

	it('treats a line as empty by content, not markup (br vs text)', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p');
		expect(display(line)).toBe('block');

		wysiwyg.innerHTML = '<p>x</p>';
		focusLine('p', { offset: 1 });
		expect(display(line)).toBe('none');
	});

	it('never shows the line placeholder while it is in code view', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		fc.set('isCodeView', true);
		focusLine('p');
		expect(display(line)).toBe('none');
		expect(display(main)).toBe('none');
		fc.set('isCodeView', false);
	});

	it('reflects placeholder_line text changes from resetOptions', () => {
		editor.resetOptions({ placeholder_line: 'New hint' });
		expect(fc.get('placeholder_line').textContent).toBe('New hint');
	});

	describe('rtl', () => {
		beforeEach(async () => {
			destroyTestEditor(editor);
			editor = await makeEditor({
				placeholder: 'Empty editor',
				placeholder_line: 'Type here',
				textDirection: 'rtl',
			});
			fc = editor.$.frameContext;
			wysiwyg = fc.get('wysiwyg');
			main = fc.get('placeholder');
			line = fc.get('placeholder_line');
		});

		it('positions the line placeholder from the right without error', () => {
			expect(editor.$.options.get('_rtl')).toBe(true);
			wysiwyg.innerHTML = '<p><br></p>';
			focusLine('p');
			// The RTL branch anchors via `right`/`margin-right` (the LTR-only branch had a null-ref bug).
			expect(display(line)).toBe('block');
			expect(line.style.right).not.toBe('');
			expect(line.style.left).toBe('auto');
		});
	});

	describe('when placeholder_line is not configured', () => {
		beforeEach(async () => {
			destroyTestEditor(editor);
			editor = await makeEditor({ placeholder: 'Empty editor' });
			fc = editor.$.frameContext;
			wysiwyg = fc.get('wysiwyg');
			main = fc.get('placeholder');
			line = fc.get('placeholder_line');
		});

		it('keeps the line placeholder hidden and uses only the empty-editor placeholder', () => {
			wysiwyg.innerHTML = '<p><br></p>';
			focusLine('p');
			expect(display(line)).toBe('none');
			expect(display(main)).toBe('block'); // focused empty line, but no line placeholder configured
		});
	});
});
