/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import HTML from '../../../../../src/core/logic/dom/html';

/**
 * Regression: a `li` without a list parent (top-level paste fragment, or lifted out of a wrong
 * parent by the consistency check) used to survive clean() as a bare line — `li` is a formatLine,
 * so it was treated like a `p` and invalid HTML leaked into the content. clean() now wraps each
 * run of sibling orphan cells in a UL (mirroring the wrongList normalization, which wraps
 * non-cells inside a list in a LI).
 *
 * The mock's `format.isLine`/`format.isBlock` return fixed values, which would make the
 * consistency check lift `li` out of a real `ul` — so this suite overrides them production-like.
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

describe('Core Logic - HTML - orphan list cell normalization', () => {
	let html;
	beforeEach(() => {
		html = createHtml();
	});

	it('wraps a single top-level orphan li in a ul', () => {
		expect(clean('<li>aa</li>', html)).toBe('<ul><li>aa</li></ul>');
	});

	it('groups a run of sibling orphan cells into one ul', () => {
		expect(clean('<li>a</li><li>b</li><li>c</li>', html)).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
	});

	it('keeps surrounding lines outside the ul', () => {
		expect(clean('<p>x</p><li>a</li><li>b</li><p>y</p>', html)).toBe(
			'<p>x</p><ul><li>a</li><li>b</li></ul><p>y</p>',
		);
	});

	it('wraps separated runs in separate uls', () => {
		expect(clean('<li>a</li><p>x</p><li>b</li>', html)).toBe('<ul><li>a</li></ul><p>x</p><ul><li>b</li></ul>');
	});

	it('leaves a valid ul/li structure untouched', () => {
		expect(clean('<ul><li>aa</li></ul>', html)).toBe('<ul><li>aa</li></ul>');
	});

	it('leaves a valid ol/li structure untouched (no ul rewrap)', () => {
		expect(clean('<ol><li>aa</li></ol>', html)).toBe('<ol><li>aa</li></ol>');
	});

	it('still unwraps a li nested in a non-list parent (pre-existing wrongTags handling)', () => {
		expect(clean('<div><li>aa</li></div>', html)).toBe('<div>aa</div>');
	});
});
