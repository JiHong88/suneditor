/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import HTML from '../../../../../src/core/logic/dom/html';

/**
 * Regression: the consistency check lifts a line found inside a non-block wrapper out of it, but
 * used to insert every lifted line straight BEFORE the wrapper while block siblings (lists,
 * tables) stayed inside — reordering the document. A Google Docs paste wraps the whole clipboard
 * in one inline tag (`<b id="docs-internal-guid-...">`), so text|list|text|list came out as
 * text|text|list|list. The wrapper is now split at the lifted line's position instead.
 *
 * The mock's `format.isLine`/`format.isBlock` return fixed values, so this suite overrides them
 * production-like.
 */
const FORMAT_LINE = /^(P|DIV|H[1-6]|LI|DT|DD|PRE)$/i;
const FORMAT_BLOCK = /^(UL|OL|BLOCKQUOTE|TABLE|FIGCAPTION|DETAILS)$/i;

function createHtml() {
	const kernel = createMockEditor();
	kernel.$.format.isLine = (n) => FORMAT_LINE.test(typeof n === 'string' ? n : n?.nodeName);
	kernel.$.format.isBlock = (n) => FORMAT_BLOCK.test(typeof n === 'string' ? n : n?.nodeName);
	kernel.$.frameContext.set(
		'wwComputedStyle',
		new Proxy({}, { get: () => '__none__' }),
	);
	return new HTML(kernel);
}

const clean = (html, str) => str.clean(html, { forceFormat: false, whitelist: null, blacklist: null });

describe('Core Logic - HTML - wrong-position lift keeps document order', () => {
	let html;
	beforeEach(() => {
		html = createHtml();
	});

	it('keeps text/list interleaving when the whole clipboard is wrapped in an inline tag (docs paste)', () => {
		const out = clean('<b><p>t1</p><ul><li>i1</li></ul><p>t2</p><ul><li>i2</li></ul></b>', html);
		// the mock pipeline adds text-tag conversion / empty-line artifacts around the wrappers,
		// so only the interleaving order and list integrity are asserted
		const order = [out.indexOf('t1'), out.indexOf('i1'), out.indexOf('t2'), out.indexOf('i2')];
		expect(Math.min(...order)).toBeGreaterThanOrEqual(0);
		expect(order).toEqual([...order].sort((a, b) => a - b));
	});

	it('splits an inline wrapper around a lifted line instead of moving the line above it', () => {
		// (the mock's trailing line-format pass wraps the split inline halves in lines)
		expect(clean('<span>aa<p>line</p>bb</span>', html)).toBe('<p>aa</p><p>line</p><p>bb</p>');
	});

	it('drops the wrapper when the lifted line was its only child', () => {
		expect(clean('<b><p>line</p></b>', html)).toBe('<p>line</p>');
	});

	it('lifts multiple lines out of one wrapper in order', () => {
		expect(clean('<b><p>1</p><p>2</p></b>', html)).toBe('<p>1</p><p>2</p>');
	});

	it('removes a split-off wrapper piece that holds only whitespace', () => {
		expect(clean('<span><p>line</p> </span>', html)).toBe('<p>line</p>');
	});
});
