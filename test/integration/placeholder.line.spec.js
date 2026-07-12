/**
 * @fileoverview Integration tests for the Notion-style per-line placeholder (`placeholder_line`).
 * Tests the marker-toggle + priority logic in UIManager._updatePlaceholder / #updateLinePlaceholder.
 *
 * The placeholder is rendered via a CSS `::before` on the focused empty line, toggled by the
 * `se-placeholder-line` class + `data-se-placeholder-line` attribute. JSDOM has no layout/pseudo
 * rendering, so these tests cover the marker logic (which line is marked, and when); the visual
 * result (alignment, scroll-following) is verified in the browser e2e suite.
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

	beforeEach(async () => {
		editor = await makeEditor({ placeholder: 'Empty editor', placeholder_line: "Type '/' for commands" });
		fc = editor.$.frameContext;
		wysiwyg = fc.get('wysiwyg');
		main = fc.get('placeholder');
	});

	afterEach(() => destroyTestEditor(editor));

	/** The line currently carrying the placeholder marker, or null. */
	const markedLine = () => wysiwyg.querySelector('.se-placeholder-line');
	const markedText = () => {
		const el = markedLine();
		return el ? el.getAttribute('data-se-placeholder-line') : null;
	};

	/** Drop the caret into `selector`'s line, set focus state, and run the placeholder update. */
	function focusLine(selector, { focused = true, offset = 0 } = {}) {
		const target = wysiwyg.querySelector(selector);
		setCaret(target, offset);
		editor.$.store.set('hasFocus', focused);
		editor.$.selection.init();
		editor.$.ui._updatePlaceholder(fc);
	}

	it('stores the configured text in frameContext and creates no placeholder element', () => {
		expect(fc.get('placeholder_line')).toBe("Type '/' for commands");
		// no dedicated DOM element — rendering is via ::before on the marked line
		expect(markedLine()).toBeNull();
	});

	it('marks a focused empty line, hiding the empty-editor placeholder', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p');
		expect(markedLine()).toBe(wysiwyg.querySelector('p'));
		expect(markedText()).toBe("Type '/' for commands");
		expect(display(main)).toBe('none'); // line placeholder takes priority
	});

	it('clears the marker when blurred and falls back to the empty-editor placeholder', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p', { focused: false });
		expect(markedLine()).toBeNull();
		expect(display(main)).toBe('block');
	});

	it('does not mark a non-empty line', () => {
		wysiwyg.innerHTML = '<p>hello</p>';
		focusLine('p', { offset: 1 });
		expect(markedLine()).toBeNull();
		expect(display(main)).toBe('none');
	});

	it('marks an empty line in the middle of content', () => {
		wysiwyg.innerHTML = '<p>first</p><p><br></p><p>third</p>';
		focusLine('p:nth-child(2)');
		expect(markedLine()).toBe(wysiwyg.querySelector('p:nth-child(2)'));
		expect(display(main)).toBe('none'); // editor is not empty, so only the line placeholder shows
	});

	it('moves the marker to the new line as the caret moves', () => {
		wysiwyg.innerHTML = '<p><br></p><p><br></p>';
		focusLine('p:nth-child(1)');
		expect(markedLine()).toBe(wysiwyg.querySelector('p:nth-child(1)'));
		focusLine('p:nth-child(2)');
		// only one line is ever marked
		expect(wysiwyg.querySelectorAll('.se-placeholder-line').length).toBe(1);
		expect(markedLine()).toBe(wysiwyg.querySelector('p:nth-child(2)'));
	});

	it('treats a line as empty by content, not markup (br vs text)', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p');
		expect(markedLine()).toBeTruthy();

		wysiwyg.innerHTML = '<p>x</p>';
		focusLine('p', { offset: 1 });
		expect(markedLine()).toBeNull();
	});

	it('never marks a line while in code view', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		fc.set('isCodeView', true);
		focusLine('p');
		expect(markedLine()).toBeNull();
		expect(display(main)).toBe('none');
		fc.set('isCodeView', false);
	});

	it('reflects placeholder_line text changes from resetOptions', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p');
		expect(markedText()).toBe("Type '/' for commands");
		editor.resetOptions({ placeholder_line: 'New hint' });
		expect(fc.get('placeholder_line')).toBe('New hint');
		// the already-marked line picks up the new text
		expect(markedText()).toBe('New hint');
	});

	it('does NOT leak the marker into html.get() output', () => {
		wysiwyg.innerHTML = '<p><br></p>';
		focusLine('p');
		// live DOM carries the marker...
		expect(markedLine()).toBeTruthy();
		// ...but the serialized output must not
		const out = editor.$.html.get();
		const html = typeof out === 'string' ? out : Object.values(out).join('');
		expect(html).not.toContain('se-placeholder-line');
		expect(html).not.toContain('data-se-placeholder-line');
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
		});

		it('marks the empty line in RTL without error (alignment handled by CSS inherit)', () => {
			expect(editor.$.options.get('_rtl')).toBe(true);
			wysiwyg.innerHTML = '<p><br></p>';
			focusLine('p');
			expect(markedLine()).toBe(wysiwyg.querySelector('p'));
			expect(markedText()).toBe('Type here');
		});
	});

	describe('when placeholder_line is not configured', () => {
		beforeEach(async () => {
			destroyTestEditor(editor);
			editor = await makeEditor({ placeholder: 'Empty editor' });
			fc = editor.$.frameContext;
			wysiwyg = fc.get('wysiwyg');
			main = fc.get('placeholder');
		});

		it('marks nothing and uses only the empty-editor placeholder', () => {
			expect(fc.get('placeholder_line')).toBeUndefined();
			wysiwyg.innerHTML = '<p><br></p>';
			focusLine('p');
			expect(markedLine()).toBeNull();
			expect(display(main)).toBe('block'); // focused empty line, but no line placeholder configured
		});
	});
});
