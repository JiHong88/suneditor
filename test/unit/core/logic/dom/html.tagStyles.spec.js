/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import HTML from '../../../../../src/core/logic/dom/html';

/**
 * Regression: a tag with an explicit `tagStyles` entry that is also a line element (e.g. `li`)
 * must inherit the `@line` category styles on top of its own — the explicit entry must not
 * shadow the category, or editing `@line` silently stops applying to that tag and previously
 * allowed styles (text-align, margin, line-height) get stripped on a clean() round-trip.
 *
 * The mock's default `__defaultAttributeWhitelist` allows `style` outright, which would hide the
 * bug, so this suite overrides options with the production-shaped whitelist / tagStyles.
 */
const TAG_STYLES = {
	'@text': 'font-family|font-size|color|background-color|width|height',
	'@line': 'text-align|margin|margin-left|margin-right|line-height',
	'@component': 'width|height|min-width',
	li: 'font-weight|font-style',
	blockquote: 'padding',
};
const ATTR_WHITELIST =
	'contenteditable|target|href|title|download|rel|src|alt|class|type|colspan|rowspan|width|height';
const FORMAT_LINE = /^(P|H[1-6]|LI|TH|TD|DETAILS)$/i;

function createHtml() {
	const kernel = createMockEditor();
	kernel.$.options.set('tagStyles', TAG_STYLES);
	kernel.$.options.set('__defaultAttributeWhitelist', ATTR_WHITELIST);
	// The mock lacks the options the tag-consistency pass needs (it warns and can drop list items),
	// and only the attr/style filters are under test here — so run clean() with just those.
	kernel.$.options.set('strictMode', {
		tagFilter: false,
		formatFilter: false,
		classFilter: false,
		textStyleTagFilter: false,
		attrFilter: true,
		styleFilter: true,
	});
	kernel.$.format.isLine = (n) => FORMAT_LINE.test(typeof n === 'string' ? n : n?.nodeName);
	// wwComputedStyle is compared against inline values in #cleanStyle; return a value the inline
	// styles never equal so they are kept.
	kernel.$.frameContext.set(
		'wwComputedStyle',
		new Proxy({}, { get: () => '__none__' }),
	);
	return new HTML(kernel);
}

const clean = (html, str) => str.clean(html, { forceFormat: false, whitelist: null, blacklist: null });

describe('Core Logic - HTML - tagStyles category inheritance', () => {
	let html;
	beforeEach(() => {
		html = createHtml();
	});

	it('keeps the explicit entry styles on li', () => {
		const out = clean('<ul><li style="font-weight: bold;">x</li></ul>', html);
		expect(out).toMatch(/font-weight:\s*bold/);
	});

	it('also keeps @line styles on li (explicit entry merged with the category)', () => {
		const out = clean('<ul><li style="text-align: center; line-height: 2;">x</li></ul>', html);
		expect(out).toMatch(/text-align:\s*center/);
		expect(out).toMatch(/line-height:\s*2/);
	});

	it('keeps explicit and @line styles together on li', () => {
		const out = clean('<ul><li style="font-weight: bold; text-align: right;">x</li></ul>', html);
		expect(out).toMatch(/font-weight:\s*bold/);
		expect(out).toMatch(/text-align:\s*right/);
	});

	it('still strips styles allowed by neither the entry nor @line', () => {
		const out = clean('<ul><li style="position: fixed; float: left;">x</li></ul>', html);
		expect(out).not.toMatch(/position/);
		expect(out).not.toMatch(/float/);
	});

	it('does not leak @line styles onto an explicit non-line tag (blockquote)', () => {
		const out = clean('<blockquote style="text-align: center; padding: 10px;">x</blockquote>', html);
		expect(out).not.toMatch(/text-align/);
		expect(out).toMatch(/padding:\s*10px/);
	});

	it('a line tag without an explicit entry still uses @line only', () => {
		const out = clean('<p style="text-align: center; font-weight: bold;">x</p>', html);
		expect(out).toMatch(/text-align:\s*center/);
		expect(out).not.toMatch(/font-weight/);
	});
});
