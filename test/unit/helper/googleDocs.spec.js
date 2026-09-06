/**
 * @jest-environment jsdom
 */

import { isGoogleDocs, cleanHTML } from '../../../src/helper/googleDocs';

describe('Helper - googleDocs', () => {
	describe('isGoogleDocs', () => {
		it('detects the docs-internal-guid wrapper id', () => {
			expect(isGoogleDocs('<b id="docs-internal-guid-abc-123" style="font-weight:normal"><p>x</p></b>')).toBe(true);
			expect(isGoogleDocs("<span id='docs-internal-guid-abc'>x</span>")).toBe(true);
		});

		it('does not match ordinary content', () => {
			expect(isGoogleDocs('<b><p>x</p></b>')).toBe(false);
			expect(isGoogleDocs('<p id="my-guid">x</p>')).toBe(false);
		});
	});

	describe('cleanHTML', () => {
		it('unwraps the b wrapper, keeping children in order', () => {
			const out = cleanHTML(
				'<b id="docs-internal-guid-abc" style="font-weight:normal"><p>t1</p><ul><li>i1</li></ul><p>t2</p><ul><li>i2</li></ul></b>',
			);
			expect(out).toBe('<p>t1</p><ul><li>i1</li></ul><p>t2</p><ul><li>i2</li></ul>');
		});

		it('unwraps a span wrapper', () => {
			expect(cleanHTML('<span id="docs-internal-guid-abc"><p>x</p></span>')).toBe('<p>x</p>');
		});

		it('keeps real bold tags inside the wrapper', () => {
			const out = cleanHTML('<b id="docs-internal-guid-abc"><p><b>bold</b> plain</p></b>');
			expect(out).toBe('<p><b>bold</b> plain</p>');
		});

		it('returns html without a wrapper unchanged', () => {
			expect(cleanHTML('<p>x</p>')).toBe('<p>x</p>');
		});
	});
});
