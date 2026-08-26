/**
 * @fileoverview Regression tests for `html.clean` emitting empty, caret-less lines.
 *
 * An inline wrapper carrying line-level content (`<span>x<blockquote>q</blockquote></span>`) used to be
 * buried inside a default line by `#editFormat`. Re-parsing that string tore the line apart and left
 * `<p></p>` behind — a dead node with no `<br>`, so the caret can never land in it.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('html.clean - no empty caret-less lines', () => {
	let editor;
	let container;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'w-html-empty-line-container';
		document.body.appendChild(container);

		editor = createTestEditor({ element: container, buttonList: [['bold']] });
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') destroyTestEditor(editor);
		if (container && container.parentNode) document.body.removeChild(container);
	});

	/** @returns {{ dead: number, root: HTMLElement }} */
	const clean = (html) => {
		const root = document.createElement('div');
		root.innerHTML = editor.$.html.clean(html, { forceFormat: true });
		return { dead: Array.from(root.querySelectorAll('p')).filter((p) => !p.firstChild).length, root };
	};

	it.each([
		['inline wrapper around a block', '<span>x<blockquote>q</blockquote></span>'],
		['inline wrapper holding only a block', '<span><blockquote>q</blockquote></span>'],
		['inline wrapper around two blocks', '<span><blockquote>a</blockquote><blockquote>b</blockquote></span>'],
		['blocks separated by whitespace', '<span>\n  <blockquote>a</blockquote>\n  <blockquote>b</blockquote>\n</span>'],
		['inline wrapper around a list', '<span>x<ul><li>a</li></ul></span>'],
		['style tag wrapper around a block', '<b>x<blockquote>q</blockquote></b>'],
		['em wrapper around a block', '<em>x<blockquote>q</blockquote></em>'],
	])('emits no empty line for %s', (_name, input) => {
		expect(clean(input).dead).toBe(0);
	});

	it('keeps the inline text and the block content', () => {
		const { root } = clean('<span>x<blockquote>q</blockquote></span>');

		expect(root.textContent).toContain('x');
		expect(root.querySelector('blockquote')?.textContent).toContain('q');
	});

	it('preserves the style tag on both sides of the split', () => {
		const { root } = clean('<b>x<blockquote>q</blockquote></b>');

		expect(root.querySelectorAll('strong, b').length).toBeGreaterThanOrEqual(2);
	});

	it('still wraps plain inline content in a single line', () => {
		const { root, dead } = clean('<span>just text</span>');

		expect(dead).toBe(0);
		expect(root.querySelectorAll('p')).toHaveLength(1);
		expect(root.querySelector('p').textContent).toBe('just text');
	});

	it('leaves an intentionally empty line (with <br>) alone', () => {
		const { root } = clean('<p><br></p><p>text</p>');

		expect(root.querySelectorAll('p')).toHaveLength(2);
		expect(root.querySelector('p').innerHTML).toBe('<br>');
	});
});
