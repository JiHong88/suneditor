/**
 * @jest-environment jsdom
 * @fileoverview Security advisory regressions for insertion paths that do not go through `html.clean()`.
 *
 * Sanitizer bypasses (`html.clean`) live in `test/unit/core/logic/dom/html.xssCorpus.spec.js`.
 * The cases here reach the DOM another way — a plugin appending parsed nodes, or UI code
 * writing server/content text into `innerHTML` — so they are checked on the resulting DOM.
 * Every `it` name carries the advisory ID it reproduces.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import { embed, fileUpload, image, imageGallery, link } from '../../src/plugins';

jest.setTimeout(60000);

/**
 * Returns script-capable nodes/attributes under `root`.
 * @param {Element} root
 * @returns {string[]}
 */
function findScriptable(root) {
	const found = [];
	for (const el of root.querySelectorAll('*')) {
		const tag = el.localName.toLowerCase();
		if (tag === 'script') found.push('<script>');
		if (tag === 'iframe' && el.hasAttribute('srcdoc')) found.push('iframe[srcdoc]');
		for (const { name } of Array.from(el.attributes)) {
			if (/^on/i.test(name)) found.push(`${tag}[${name.toLowerCase()}]`);
		}
	}
	return found;
}

/**
 * Same check on serialized HTML (editor output).
 * @param {string} html
 * @returns {string[]}
 */
function findScriptableInHTML(html) {
	const div = document.createElement('div');
	div.innerHTML = html;
	return findScriptable(div);
}

// Deselect first and let the controller's deferred `controlActive` reset run before destroy —
// destroying with a selected component leaves that timer touching a destroyed store.
async function teardown(editor) {
	editor.$.component.deselect();
	await new Promise((r) => setTimeout(r, 0));
	destroyTestEditor(editor);
}

function placeCaret(editor) {
	editor.$.html.set('<p>x</p>');
	const p = editor.$.frameContext.get('wysiwyg').querySelector('p');
	editor.$.selection.setRange(p.firstChild, 1, p.firstChild, 1);
}

describe('Security advisories: Embed raw HTML is appended without sanitizing', () => {
	// GHSA-wxhr-f7jg-wphq, GHSA-pcgm-hc6r-r56x, GHSA-95mq-p6hf-j783
	// `#create` appends every non-script parsed node (and the iframe itself) as-is.
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({
			defaultLine: 'p',
			plugins: { embed },
			buttonList: [['embed']],
			// GHSA-wxhr's PoC uses a YouTube iframe; YouTube is not a default embed pattern
			embed: {
				urlPatterns: [/^https:\/\/www\.youtube\.com\/embed\//i],
				scriptSrcWhitelist: ['https://platform.twitter.com/'],
			},
		});
		await waitForEditorReady(editor);
	});

	afterAll(async () => {
		await teardown(editor);
		jest.restoreAllMocks();
	});

	beforeEach(() => placeCaret(editor));

	const CASES = [
		[
			'GHSA-wxhr-f7jg-wphq iframe onload',
			'<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" onload="alert(document.cookie)"></iframe>',
		],
		[
			'GHSA-wxhr-f7jg-wphq iframe + img onerror sibling',
			'<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe><img src=x onerror="alert(document.cookie)"></iframe>',
		],
		[
			'GHSA-pcgm-hc6r-r56x twitter iframe + img onerror sibling',
			'<iframe src="https://platform.twitter.com/embed/Tweet.html"></iframe><img src=x onerror="alert(document.domain)"></iframe>',
		],
		[
			'GHSA-pcgm-hc6r-r56x twitter iframe onload',
			'<iframe src="https://platform.twitter.com/embed/Tweet.html" onload="alert(document.domain)"></iframe>',
		],
		[
			'GHSA-95mq-p6hf-j783 instagram iframe srcdoc',
			'<iframe src="https://www.instagram.com/p/abc123/" srcdoc="<svg/onload=window.__EMBED_PWNED=1>"></iframe>',
		],
		[
			'embed variant: blockquote with handler',
			'<blockquote class="twitter-tweet" onmouseover="alert(1)"><a href="https://twitter.com/x/status/1">x</a></blockquote>',
		],
		[
			'embed variant: handler nested in blockquote',
			'<blockquote class="twitter-tweet"><a href="https://twitter.com/x/status/1">x</a><svg onload="alert(1)"></svg><img src=x onerror="alert(1)"></blockquote>',
		],
	];

	it.each(CASES)('%s', async (_label, payload) => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		await editor.$.plugins.embed.submitSRC(payload);
		expect(findScriptable(wysiwyg)).toEqual([]);
		expect(findScriptableInHTML(editor.$.html.get())).toEqual([]);
	});

	it('embed variant: javascript URL nested in blockquote', async () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		await editor.$.plugins.embed.submitSRC(
			'<blockquote class="twitter-tweet"><a href="javascript:alert(1)">x</a><a href="https://twitter.com/x/status/1">y</a></blockquote>',
		);
		expect(wysiwyg.querySelector('a[href^="javascript"]')).toBeNull();
	});

	it('keeps a legitimate raw iframe embed', async () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		await editor.$.plugins.embed.submitSRC(
			'<iframe src="https://platform.twitter.com/embed/Tweet.html" width="550" height="400" frameborder="0" allowfullscreen></iframe>',
		);
		const iframe = wysiwyg.querySelector('.se-embed-container figure > iframe');
		expect(iframe?.getAttribute('src')).toBe('https://platform.twitter.com/embed/Tweet.html');
		expect(iframe.hasAttribute('allowfullscreen')).toBe(true);
	});

	it('keeps a legitimate raw blockquote embed and its whitelisted script', async () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		await editor.$.plugins.embed.submitSRC(
			'<blockquote class="twitter-tweet"><p>Hello <a href="https://t.co/abc">pic</a></p><a href="https://twitter.com/x/status/1">Jan 1</a></blockquote>' +
				'<script async src="https://platform.twitter.com/widgets.js"></script>',
		);
		const figure = wysiwyg.querySelector('.se-embed-container figure');
		expect(figure.querySelector(':scope > blockquote a[href="https://twitter.com/x/status/1"]')).not.toBeNull();
		expect(figure.querySelector('script[src="https://platform.twitter.com/widgets.js"]')).not.toBeNull();
	});
});

describe('Security advisories: FileUpload writes the file name into innerHTML', () => {
	// GHSA-2w4v-r3v4-f5h4 — `create()` passes `file.name` as `createElement`'s `inner` (innerHTML).
	// The fileGallery `#SetItem` path calls the same `create()` with the browser item's `data-name`.
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({
			defaultLine: 'p',
			plugins: { fileUpload },
			buttonList: [['fileUpload']],
			fileUpload: { uploadUrl: '/upload' },
		});
		await waitForEditorReady(editor);
	});

	afterAll(async () => {
		await teardown(editor);
		jest.restoreAllMocks();
	});

	beforeEach(() => placeCaret(editor));

	it.each([
		['GHSA-2w4v-r3v4-f5h4 server-returned name', '<img src=x onerror=alert(1)>'],
		['GHSA-2w4v-r3v4-f5h4 name with extension', '<img src=x onerror=alert(document.cookie)>.pdf'],
	])('%s', (_label, name) => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		editor.$.plugins.fileUpload.create('https://example.com/file.pdf', { name, size: 1234 }, true);
		expect(findScriptable(wysiwyg)).toEqual([]);
		// the name is shown as text, not parsed
		expect(wysiwyg.textContent).toContain(name);
	});
});

describe('Security advisories: Browser default renderer interpolates item data into innerHTML', () => {
	// GHSA-pwf4-x78x-9937 — `DrawItems` (and `#highlightKeyword`) build HTML from server item fields.
	const ITEMS = [
		{ src: 'https://example.com/a.jpg', name: '<img src=x onerror=alert(document.cookie)>' },
		{ src: 'https://example.com/b.jpg', name: 'b.jpg', alt: '"><img src=x onerror=alert(2)>' },
		{ src: 'https://example.com/c.jpg"><img src=x onerror=alert(3)>', name: 'c.jpg' },
		{ src: 'https://example.com/d.jpg', name: 'd.jpg', thumbnail: '"><img src=x onerror=alert(4)>' },
		{ src: 'https://example.com/e.jpg', name: 'e.jpg', type: '"><img src=x onerror=alert(5)>' },
		{ src: 'https://example.com/f.jpg', name: 'f.jpg', tag: '<img src=x onerror=alert(6)>' },
	];
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({
			defaultLine: 'p',
			plugins: { image, imageGallery },
			buttonList: [['image', 'imageGallery']],
			imageGallery: { data: ITEMS },
		});
		await waitForEditorReady(editor);
	});

	afterAll(async () => {
		await teardown(editor);
		jest.restoreAllMocks();
	});

	afterEach(() => editor.$.plugins.imageGallery.browser.close());

	it('GHSA-pwf4-x78x-9937 item fields (name, alt, src, thumbnail, type, tag)', () => {
		const browser = editor.$.plugins.imageGallery.browser;
		browser.open();
		expect(findScriptable(browser.list)).toEqual([]);
		expect(findScriptable(browser.tagArea)).toEqual([]);
	});

	it('GHSA-pwf4-x78x-9937 #highlightKeyword textContent -> innerHTML (mXSS)', () => {
		const browser = editor.$.plugins.imageGallery.browser;
		browser.directData = [{ src: 'https://example.com/m.jpg', name: 'test&lt;img src=x onerror=alert(1)&gt;' }];
		browser.keyword = 'test';
		browser.open();
		expect(findScriptable(browser.list)).toEqual([]);
		browser.keyword = '';
		browser.directData = ITEMS;
	});
});

describe('Security advisories: link bookmark list writes heading textContent into innerHTML', () => {
	// GHSA-5pp5-5qrp-vq56 — `ModalAnchorEditor.#createBookmarkList` → `SelectMenu.create` (innerHTML).
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({
			defaultLine: 'p',
			plugins: { link },
			buttonList: [['link']],
		});
		await waitForEditorReady(editor);
	});

	afterAll(async () => {
		await teardown(editor);
		jest.restoreAllMocks();
	});

	it.each([
		[
			'GHSA-5pp5-5qrp-vq56 heading text',
			'<h1>&lt;img src=x onerror=alert(document.domain)&gt;</h1><p>Normal content</p>',
		],
		['bookmark variant: anchor id', '<p><a id="x&quot;&gt;&lt;img src=x onerror=alert(1)&gt;">x</a></p>'],
	])('%s', (_label, content) => {
		editor.$.html.set(content);
		const anchor = editor.$.plugins.link.anchor;
		anchor.urlInput.value = '#';
		anchor.urlInput.dispatchEvent(new Event('input', { bubbles: true }));
		expect(findScriptable(anchor.urlInput.parentElement)).toEqual([]);
	});
});

describe('Security advisories: document header panel writes heading textContent into innerHTML', () => {
	// GHSA-h9pq-57qf-vvfh — `DocumentType` constructor builds the header list from `h.textContent` (innerHTML).
	// Header text is decoded by the DOM, so an entity-encoded `<img onerror>` becomes markup on init.
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({
			defaultLine: 'p',
			type: 'document:header',
			value: '<h1>&lt;img src=x onerror=alert(document.cookie)&gt;</h1><h2>a&quot; onmouseover=&quot;alert(1)</h2><p>Normal content</p>',
		});
		await waitForEditorReady(editor);
	});

	afterAll(async () => {
		await teardown(editor);
		jest.restoreAllMocks();
	});

	it('GHSA-h9pq-57qf-vvfh header text and title on init', () => {
		const panel = editor.$.frameContext.get('documentTypeInner');
		expect(panel).toBeTruthy();
		expect(panel.querySelectorAll('.se-doc-item').length).toBe(2);
		expect(findScriptable(panel)).toEqual([]);
	});
});
