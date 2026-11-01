/**
 * @fileoverview Integration tests for moving a dragged selection inside the editor
 * Tests src/core/event/handlers/handler_ww_dragDrop.js (OnDrop_wysiwyg) through a real editor and the real `html.remove()`.
 *
 * - A drop inside the dragged selection is a no-op.
 * - A moved selection lands where it was dropped, before or after itself and on any line: also when the removal
 *   rewrote or took out the text node under the drop point, or the selection spans more than one line.
 * - A drop point given as an element position lands at the text position it stands for; between two blocks,
 *   that is the start of the next block.
 * - A drop point inside a component (block or inline) lands beside it, on the side the pointer is over, and never
 *   inside it; with no text there, in a new line.
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

/**
 * Drags the current selection from inside the editor and drops it at (`sc`, `so`).
 * jsdom has no `caretPositionFromPoint`, so the resolved drop point is given directly.
 */
async function dropAt(editor, wysiwyg, sc, so, pointer = {}) {
	jest.spyOn(editor.$.selection, 'getDragEventLocationRange').mockReturnValue({ sc, so, ec: sc, eo: so });
	const text = editor.$.selection.getRange().toString();

	wysiwyg.firstElementChild.dispatchEvent(new Event('dragstart', { bubbles: true }));
	const drop = Object.assign(new Event('drop', { bubbles: true, cancelable: true }), pointer);
	drop.dataTransfer = {
		types: ['text/plain'],
		files: [],
		items: [],
		getData: (type) => (type === 'text/plain' ? text : ''),
	};
	wysiwyg.dispatchEvent(drop);
	await new Promise((r) => setTimeout(r, 50));
	return drop;
}

describe('Drag and drop: moving a selection inside the editor', () => {
	let container;
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		container = document.createElement('div');
		document.body.appendChild(container);
		editor = createTestEditor({ element: container, buttonList: [['bold']] });
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		jest.restoreAllMocks();
		destroyTestEditor(editor);
		container.remove();
	});

	/** Sets the content and the dragged selection; `pick` returns [sc, so, ec, eo, dropNode, dropOffset]. */
	function setup(html, pick) {
		wysiwyg.innerHTML = html;
		const [sc, so, ec, eo, dc, doff] = pick(wysiwyg);
		editor.$.selection.setRange(sc, so, ec, eo);
		return [dc, doff];
	}

	it('should leave the content as is when the selection is dropped onto itself', async () => {
		const [dc, doff] = setup('<p>Hello World foo</p>', (w) => {
			const t = w.querySelector('p').firstChild;
			return [t, 0, t, 5, t, 2];
		});

		const drop = await dropAt(editor, wysiwyg, dc, doff);

		expect(drop.defaultPrevented).toBe(true);
		expect(wysiwyg.innerHTML).toBe('<p>Hello World foo</p>');
	});

	it.each([
		[
			'a drop before the selection in the same text',
			'<p>Hello World foo</p>',
			(w) => {
				const t = w.querySelector('p').firstChild;
				return [t, 6, t, 11, t, 2]; // "World" → "He|llo"
			},
			'<p>HeWorldllo  foo</p>',
		],
		[
			'a drop after the selection in the text the removal rewrote',
			'<p>Hello World foo</p>',
			(w) => {
				const t = w.querySelector('p').firstChild;
				return [t, 0, t, 5, t, 13]; // "Hello" → "Hello World f|oo"
			},
			'<p> World fHellooo</p>',
		],
		[
			'a drop at the line start before a selection that ends at the line end',
			'<p>Say <strong>bold</strong> words</p>',
			(w) => {
				const p = w.querySelector('p');
				return [p.querySelector('strong').firstChild, 0, p.lastChild, p.lastChild.length, p.firstChild, 0];
			},
			'<p>bold wordsSay </p>',
		],
		[
			'a drop after a selection that starts at the line start',
			'<p>Hello <strong>bold</strong> tail end</p>',
			(w) => {
				const p = w.querySelector('p');
				return [p.firstChild, 0, p.querySelector('strong').firstChild, 2, p.lastChild, 4]; // → " tai|l end"
			},
			'<p><strong>ld</strong> taiHello bol end</p>',
		],
		[
			'a drop after a two-line selection, in the line that holds its end',
			'<p>Hello there</p><p>second line here</p>',
			(w) => {
				const [p1, p2] = w.querySelectorAll('p');
				return [p1.firstChild, 6, p2.firstChild, 6, p2.firstChild, 11]; // → "second line| here"
			},
			'<p>Hello </p><p> linetheresecond here</p>',
		],
		[
			'a drop before a two-line selection, in the line that holds its start',
			'<p>Hello there</p><p>second line here</p>',
			(w) => {
				const [p1, p2] = w.querySelectorAll('p');
				return [p1.firstChild, 6, p2.firstChild, 6, p1.firstChild, 2]; // → "He|llo"
			},
			'<p>Hetheresecondllo </p><p> line here</p>',
		],
		[
			'a drop after a two-line selection whose first line is removed',
			'<p>Hello there</p><p>second line here</p>',
			(w) => {
				const [p1, p2] = w.querySelectorAll('p');
				return [p1.firstChild, 0, p2.firstChild, 6, p2.firstChild, 11];
			},
			'<p> lineHello theresecond here</p>',
		],
		[
			'a drop after a two-line selection that ends with a whole bold word',
			'<p>Hello there</p><p><strong>second</strong> line here</p>',
			(w) => {
				const [p1, p2] = w.querySelectorAll('p');
				return [p1.firstChild, 6, p2.querySelector('strong').firstChild, 6, p2.lastChild, 5]; // → " line| here"
			},
			'<p>Hello </p><p><strong></strong> linetheresecond here</p>',
		],
		[
			'a drop at the end of a text right before a bold word',
			'<p>abc<strong>XY</strong>def</p>',
			(w) => {
				const t = w.querySelector('p').firstChild;
				return [t, 0, t, 1, t, 3]; // "a" → "abc|<strong>"
			},
			'<p>bca<strong>XY</strong>def</p>',
		],
		[
			'a drop given as an element point before a bold word',
			'<p>abc<strong>XY</strong>def</p>',
			(w) => {
				const p = w.querySelector('p');
				return [p.firstChild, 0, p.firstChild, 1, p, 1];
			},
			'<p>bca<strong>XY</strong>def</p>',
		],
		[
			'a drop given as an element point before a line break',
			'<p>abc<br>def</p>',
			(w) => {
				const p = w.querySelector('p');
				return [p.firstChild, 0, p.firstChild, 1, p, 1];
			},
			'<p>bca<br>def</p>',
		],
		[
			'a drop at the end of a bold word followed by plain text',
			'<p>ab<strong>cd</strong>ef</p>',
			(w) => {
				const p = w.querySelector('p');
				return [p.firstChild, 0, p.firstChild, 1, p.querySelector('strong').firstChild, 2];
			},
			'<p>b<strong>cda</strong>ef</p>',
		],
		[
			'a drop at the left edge of a selection whose bold wrapper the removal takes out',
			'<p>ab<strong>cd</strong>ef</p>',
			(w) => {
				const p = w.querySelector('p');
				const strong = p.querySelector('strong');
				return [strong.firstChild, 0, p.lastChild, 1, strong, 0];
			},
			'<p>abcdef</p>',
		],
		[
			'a drop between two whitespace characters the removal leaves',
			'<p><strong>Hello</strong> world&nbsp;&nbsp;<em>end</em></p>',
			(w) => {
				const p = w.querySelector('p');
				return [p.querySelector('strong').firstChild, 2, p.childNodes[1], 6, p.childNodes[1], 7];
			},
			'<p><strong>He</strong>&nbsp;llo world&nbsp;<em>end</em></p>',
		],
		[
			'a drop between lines given as a root point after a multi-line selection',
			'<p>one</p><p>two</p><p>three</p><p>four</p>',
			(w) => {
				const ps = w.querySelectorAll('p');
				return [ps[0].firstChild, 1, ps[2].firstChild, 2, w, 3];
			},
			'<p>o</p><p>ree</p><p>netwothfour</p>',
		],
		[
			'a drop given as a root point between a list and a paragraph',
			'<p>abc</p><ul><li>x</li></ul><p>def</p>',
			(w) => {
				const t = w.firstChild.firstChild;
				return [t, 0, t, 1, w, 2];
			},
			'<p>bc</p><ul><li>x</li></ul><p>adef</p>',
		],
		[
			'a drop given as a root point between a blockquote and a paragraph',
			'<blockquote><p>q</p></blockquote><p>abc</p><p>def</p>',
			(w) => {
				const t = w.lastChild.firstChild;
				return [t, 0, t, 1, w, 1];
			},
			'<blockquote><p>q</p></blockquote><p>dabc</p><p>ef</p>',
		],
		[
			'a drop given as a cell point between two paragraphs of the cell',
			'<p>xy</p><table><tbody><tr><td><p>ab</p><p>cd</p></td></tr></tbody></table>',
			(w) => {
				const t = w.firstChild.firstChild;
				return [t, 0, t, 1, w.querySelector('td'), 1];
			},
			'<p>y</p><table><tbody><tr><td><p>ab</p><p>xcd</p></td></tr></tbody></table>',
		],
	])('should insert %s where it was dropped', async (_, html, pick, expected) => {
		const [dc, doff] = setup(html, pick);

		await dropAt(editor, wysiwyg, dc, doff);

		expect(wysiwyg.innerHTML).toBe(expected);
	});

	// jsdom lays out nothing: every rect is 0, so a negative pointer is over the first half and a positive one the second
	it.each([
		[
			'the top half of a block component: the end of the line before it',
			'<p>Hello World foo</p><div class="se-component se-image-container"><figure><img src="x.png"></figure></div><p>end</p>',
			{ clientY: -1 },
			'<p>Hello  fooWorld</p><div class="se-component se-image-container"><figure><img src="x.png"></figure></div><p>end</p>',
		],
		[
			'the bottom half of a block component: the start of the line after it',
			'<p>Hello World foo</p><div class="se-component se-image-container"><figure><img src="x.png"></figure></div><p>end</p>',
			{ clientY: 1 },
			'<p>Hello  foo</p><div class="se-component se-image-container"><figure><img src="x.png"></figure></div><p>Worldend</p>',
		],
		[
			'the bottom half of the last block component: a new line after it',
			'<p>Hello World foo</p><div class="se-component se-image-container"><figure><img src="x.png"></figure></div>',
			{ clientY: 1 },
			'<p>Hello  foo</p><div class="se-component se-image-container"><figure><img src="x.png"></figure></div><p>World<br></p>',
		],
		[
			'the start half of an inline component: right before it',
			'<p>Hello World foo <span class="se-component se-inline-component"><img src="x.png"></span> bar</p>',
			{ clientX: -1 },
			'<p>Hello  foo World<span class="se-component se-inline-component"><img src="x.png"></span> bar</p>',
		],
		[
			'the end half of an inline component: right after it',
			'<p>Hello World foo <span class="se-component se-inline-component"><img src="x.png"></span> bar</p>',
			{ clientX: 1 },
			'<p>Hello  foo <span class="se-component se-inline-component"><img src="x.png"></span>World bar</p>',
		],
	])('should drop on %s', async (_, html, pointer, expected) => {
		const [dc, doff] = setup(html, (w) => {
			const t = w.querySelector('p').firstChild;
			const comp = w.querySelector('.se-component');
			return [t, 6, t, 11, comp, comp.childNodes.length]; // "World" → inside the component, after its content
		});

		await dropAt(editor, wysiwyg, dc, doff, pointer);

		expect(wysiwyg.innerHTML).toBe(expected);
	});

	it('should keep a drop point in a table cell, an editable line inside a component', async () => {
		const [dc, doff] = setup(
			'<p>xy</p><figure class="se-flex-component se-input-component"><table><tbody><tr><td><div>cell</div></td></tr></tbody></table></figure>',
			(w) => {
				const t = w.firstChild.firstChild;
				return [t, 0, t, 1, w.querySelector('td div').firstChild, 2];
			},
		);

		await dropAt(editor, wysiwyg, dc, doff, { clientY: -1 });

		expect(wysiwyg.querySelector('td').innerHTML).toBe('<div>cexll</div>');
	});

	it('should keep its side of an inline component when the drop lands right before it', async () => {
		const [dc, doff] = setup(
			'<p>abc<span class="se-component se-inline-component" contenteditable="false">X</span>def</p>',
			(w) => {
				const t = w.querySelector('p').firstChild;
				return [t, 0, t, 1, t, 3]; // "a" → "abc|[X]"
			},
		);

		await dropAt(editor, wysiwyg, dc, doff);

		const p = wysiwyg.querySelector('p');
		expect(p.textContent).toBe('bcaXdef');
		expect(p.querySelector('[contenteditable="false"]').textContent).toBe('X');
	});
});
