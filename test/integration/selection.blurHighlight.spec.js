/**
 * @fileoverview Integration tests for the blur selection highlight
 * (selection stays painted via the CSS Custom Highlight API while focus is outside the editor)
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

const NAME = 'se-selection-blur';

// jsdom has no CSS Custom Highlight API
class MockHighlight extends Set {
	priority = 0;
}

describe('Selection - blur highlight', () => {
	let editor;
	let wysiwyg;
	let registry;
	let origCSS;
	let origHighlight;

	const blur = () => wysiwyg.dispatchEvent(new FocusEvent('blur'));
	const focus = () => wysiwyg.dispatchEvent(new FocusEvent('focus'));
	const painted = () => [...(registry.get(NAME) || [])];
	const select = (html = '<p>Hello world</p>', start = 0, end = 5) => {
		wysiwyg.innerHTML = html;
		const text = wysiwyg.querySelector('p').firstChild;
		editor.$.selection.setRange(text, start, text, end);
		return text;
	};

	beforeEach(async () => {
		origCSS = window.CSS;
		origHighlight = window.Highlight;
		registry = new Map();
		// jsdom has no window.CSS; keep `supports` falsy so the toolbar behaves as before
		window.CSS = { supports: () => false, highlights: registry };
		window.Highlight = MockHighlight;
		jest.spyOn(document, 'hasFocus').mockReturnValue(true);

		editor = createTestEditor();
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		window.CSS = origCSS;
		window.Highlight = origHighlight;
		jest.restoreAllMocks();
	});

	it('should paint a clone of the remembered range on blur', () => {
		select();
		const before = editor.$.html.get();
		blur();

		const ranges = painted();
		expect(ranges).toHaveLength(1);
		expect(ranges[0].toString()).toBe('Hello');
		expect(ranges[0]).not.toBe(editor.$.store.get('_range'));
		expect(registry.get(NAME).priority).toBe(-1);
		// no DOM side effects
		expect(editor.$.html.get()).toBe(before);
	});

	it('should inject the ::highlight style only once per document', () => {
		const count = () =>
			[...document.querySelectorAll('style')].filter((s) => s.textContent.includes(`::highlight(${NAME})`))
				.length;
		select();
		blur();
		focus();
		blur();
		expect(count()).toBe(1);
	});

	it('should paint even when blur is prevented (dropdown, controller, toolbar input)', () => {
		select();
		editor.$.store.set('_preventBlur', true);
		blur();
		expect(painted()).toHaveLength(1);
		editor.$.store.set('_preventBlur', false);
	});

	it('should clear when focus returns to the editor', () => {
		select();
		blur();
		focus();
		expect(registry.has(NAME)).toBe(false);
	});

	it('should clear on programmatic focus (__iframeFocus) too', () => {
		select();
		blur();
		editor.$.selection.__iframeFocus = true;
		focus();
		editor.$.selection.__iframeFocus = false;
		expect(registry.has(NAME)).toBe(false);
	});

	it('should not paint a collapsed range (caret)', () => {
		select('<p>Hello</p>', 2, 2);
		blur();
		expect(registry.has(NAME)).toBe(false);
	});

	it('should not paint when a component is being selected', () => {
		select();
		editor.$.component.__selectionSelected = true;
		blur();
		editor.$.component.__selectionSelected = false;
		expect(registry.has(NAME)).toBe(false);
	});

	it('should not paint in iframe mode (native inactive selection stays visible)', () => {
		select();
		const frameOptions = editor.$.frameContext.get('options');
		frameOptions.set('iframe', true);
		blur();
		frameOptions.set('iframe', false);
		expect(registry.has(NAME)).toBe(false);
	});

	it('should not paint when the window itself lost focus', () => {
		document.hasFocus.mockReturnValue(false);
		select();
		blur();
		expect(registry.has(NAME)).toBe(false);
	});

	it('should repaint when _range changes without moving focus', () => {
		const text = select();
		blur();
		const next = document.createRange();
		next.setStart(text, 6);
		next.setEnd(text, 11);
		editor.$.store.set('_range', next);
		const ranges = painted();
		expect(ranges).toHaveLength(1);
		expect(ranges[0].toString()).toBe('world');
	});

	it('should clear when _range changes while the editor has DOM focus', () => {
		const text = select();
		blur();
		jest.spyOn(document, 'activeElement', 'get').mockReturnValue(wysiwyg);
		const next = document.createRange();
		next.setStart(text, 6);
		next.setEnd(text, 11);
		editor.$.store.set('_range', next);
		expect(registry.has(NAME)).toBe(false);
	});

	it('should not paint while a component is selected', () => {
		select();
		const prev = editor.$.component.isSelected;
		editor.$.component.isSelected = true;
		blur();
		editor.$.component.isSelected = prev;
		expect(registry.has(NAME)).toBe(false);
	});

	it('should not paint a multi-cell table selection (it has its own overlay)', () => {
		select('<p>Hello world</p><table><tbody><tr><td class="se-selected-table-cell">a</td></tr></tbody></table>');
		blur();
		expect(registry.has(NAME)).toBe(false);
	});

	it('should re-inject the style when it was removed from the document', () => {
		const styles = () =>
			[...document.querySelectorAll('style')].filter((s) => s.textContent.includes(`::highlight(${NAME})`));
		select();
		blur();
		styles().forEach((s) => s.remove());
		focus();
		blur();
		expect(styles()).toHaveLength(1);
	});

	it('should clear when the range is removed (code view, setContents)', () => {
		select();
		blur();
		editor.$.selection.removeRange();
		expect(registry.has(NAME)).toBe(false);
		// the subscription is released: a later range change does not paint again
		const text = wysiwyg.querySelector('p').firstChild;
		editor.$.selection.setRange(text, 0, text, 5);
		expect(registry.has(NAME)).toBe(false);
	});

	it('should clear on readOnly and disable', () => {
		select();
		blur();
		editor.$.ui.readOnly(true);
		expect(registry.has(NAME)).toBe(false);
		editor.$.ui.readOnly(false);

		select();
		blur();
		editor.$.ui.disable();
		expect(registry.has(NAME)).toBe(false);
	});

	it('should keep other editors ranges in the shared highlight', () => {
		select();
		blur();
		const other = new Range();
		registry.get(NAME).add(other);

		focus();
		expect(painted()).toEqual([other]);
	});

	it('should clear on destroy', () => {
		select();
		blur();
		destroyTestEditor(editor);
		editor = null;
		expect(registry.has(NAME)).toBe(false);
	});

	it('should do nothing when the Highlight API is unsupported', () => {
		window.Highlight = undefined;
		select();
		expect(() => blur()).not.toThrow();
		expect(registry.has(NAME)).toBe(false);
	});
});
