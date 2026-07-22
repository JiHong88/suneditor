/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import HTML from '../../../../../src/core/logic/dom/html';

/**
 * Regression: percentage sizing of media components (image/video/audio/iframe) is stored on the
 * component container (`div`/`span.se-component`) as an inline `width`/`height`/`min-width` style
 * (see `Figure._setPercentSize`). A `clean()` round-trip (code view toggle, setValue, paste) must
 * NOT strip it — otherwise the component resets to full width (100%).
 *
 * The mock's default `__defaultAttributeWhitelist` allows `style` outright, which would hide the bug,
 * so this suite overrides options with the production-shaped whitelist / tagStyles.
 */
const TAG_STYLES = {
	'@text': 'font-family|font-size|color|background-color|width|height',
	'@line': 'text-align|margin|margin-left|margin-right|line-height',
	'@component': 'width|height|min-width',
	figure: 'display|width|height|padding|padding-bottom',
	'img|video|iframe':
		'transform|transform-origin|width|min-width|max-width|height|min-height|max-height|float|margin|margin-top',
};
const ATTR_WHITELIST =
	'contenteditable|target|href|title|download|rel|src|alt|class|type|colspan|rowspan|width|height';
const ELEMENT_WHITELIST = 'p|div|br|span|a|blockquote|pre|hr|figure|figcaption|img|video|iframe|audio';
const FORMAT_LINE = /^(P|H[1-6]|LI|TH|TD|DETAILS)$/i;

function createHtml() {
	const kernel = createMockEditor();
	kernel.$.options.set('tagStyles', TAG_STYLES);
	kernel.$.options.set('__defaultAttributeWhitelist', ATTR_WHITELIST);
	kernel.$.options.set('_editorElementWhitelist', ELEMENT_WHITELIST);
	kernel.$.format.isLine = (n) => FORMAT_LINE.test(typeof n === 'string' ? n : n?.nodeName);
	// wwComputedStyle is compared against inline values in #cleanStyle; the editor is px-wide, so a
	// percentage never matches and is therefore kept.
	kernel.$.frameContext.set(
		'wwComputedStyle',
		new Proxy({ width: '780px' }, { get: (t, p) => (p in t ? t[p] : '') }),
	);
	return new HTML(kernel);
}

const clean = (html, str) => str.clean(html, { forceFormat: false, whitelist: null, blacklist: null });

describe('Core Logic - HTML - component container sizing', () => {
	let html;
	beforeEach(() => {
		html = createHtml();
	});

	it('keeps width/min-width on a block component container', () => {
		const out = clean(
			'<div class="se-component se-image-container" style="width: 15%; min-width: 100%;"><figure></figure></div>',
			html,
		);
		expect(out).toMatch(/width:\s*15%/);
		expect(out).toMatch(/min-width:\s*100%/);
	});

	it('keeps width/min-width on an inline component container', () => {
		const out = clean(
			'<span class="se-component se-inline-component" style="width: 30%; min-width: 100%;"><img src="x"></span>',
			html,
		);
		expect(out).toMatch(/width:\s*30%/);
		expect(out).toMatch(/min-width:\s*100%/);
	});

	it('still strips width from a plain (non-component) div', () => {
		const out = clean('<div style="width: 15%;">x</div>', html);
		expect(out).not.toMatch(/width:\s*15%/);
	});

	it('does not treat a look-alike class (se-component-x) as a component', () => {
		const out = clean('<div class="se-component-x" style="width: 15%;">x</div>', html);
		expect(out).not.toMatch(/width:\s*15%/);
	});

	it('preserves only sizing styles on a component container (drops position)', () => {
		const out = clean('<div class="se-component" style="width: 15%; position: fixed;">x</div>', html);
		expect(out).toMatch(/width:\s*15%/);
		expect(out).not.toMatch(/position/);
	});
});
