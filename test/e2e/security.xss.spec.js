/**
 * @fileoverview Security advisory PoCs in a real browser.
 *
 * jsdom and browsers serialize `<`/`>` inside attribute values differently, which changes how the
 * string-level sanitizer stages see a payload — so the advisory PoCs are also executed here.
 * Every payload's handler increments `window.__xss` (or `parent.__xss` from a srcdoc document);
 * the page loads the content, clicks/hovers every element, and the counter must stay 0.
 */
const { test, expect } = require('@playwright/test');

const SANITIZER_CASES = [
	[
		'GHSA-q867-q2hw-f8gp placeholder srcdoc svg',
		'<span data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;<svg/onload=parent.__xss++&gt;&quot;}">x</span>',
	],
	[
		'GHSA-8rr9-72mx-m49h placeholder srcdoc json-escaped script',
		'<div data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;\\u003cscript\\u003eparent.__xss++\\u003c/script\\u003e&quot;}">x</div>',
	],
	[
		'GHSA-3qm5-8p2w-5q9j placeholder srcdoc entity script',
		'<div data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;&lt;script&gt;parent.__xss++&lt;/script&gt;&quot;}">x</div>',
	],
	[
		'GHSA-692m-4688-45wp placeholder srcdoc single-quoted json',
		`<p>x</p><div data-se-iframe-holder="1" data-se-iframe-holder-attrs='{"srcdoc":"&lt;script&gt;parent.__xss++&lt;/script&gt;"}'>y</div>`,
	],
	['GHSA-6pm3-2q9w-2926 ns tag digit name', '<a:1 onclick="window.__xss++">click me</a:1>'],
	['GHSA-692m-4688-45wp ns tag alnum', '<p><a:1b src="/x" onclick="window.__xss++">click</a:1b></p>'],
	['GHSA-692m-4688-45wp ns tag text-style branch', '<p><b:1c src="/x" onmouseover="window.__xss++">hover</b:1c></p>'],
	['GHSA-v4jx-8pj6-w4w8 &colon; entity', '<a href="javascript&colon;window.__xss++">Click me</a>'],
	['entity variant: numeric without semicolon', '<a href="javascript&#58window.__xss++">x</a>'],
	['javascript: href', '<a href="javascript:window.__xss++">x</a>'],
	['iframe srcdoc', '<iframe srcdoc="&lt;script&gt;parent.__xss++&lt;/script&gt;"></iframe>'],
];

const EMBED_CASES = [
	[
		'GHSA-wxhr-f7jg-wphq iframe onload',
		'<iframe src="https://platform.twitter.com/embed/Tweet.html" onload="window.__xss++"></iframe>',
	],
	[
		'GHSA-pcgm-hc6r-r56x iframe + img onerror sibling',
		'<iframe src="https://platform.twitter.com/embed/Tweet.html"></iframe><img src=x onerror="window.__xss++"></iframe>',
	],
	[
		'GHSA-95mq-p6hf-j783 iframe srcdoc',
		'<iframe src="https://www.instagram.com/p/abc123/" srcdoc="<svg/onload=parent.__xss++>"></iframe>',
	],
];

/**
 * @param {import('@playwright/test').Page} page
 * @param {object} options
 */
async function make(page, options) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined && window.suneditor, { timeout: 15000 });
	await page.evaluate(async (options) => {
		const embed = window.editor_root.$.plugins.embed.constructor;
		window.editor_root.destroy();
		document.body.innerHTML = '<div id="e"></div>';
		window.__xss = 0;
		window.__sEditor = window.suneditor.create('#e', { plugins: [embed], buttonList: [['embed']], ...options });
		await new Promise((r) => setTimeout(r, 300));
	}, options);
}

/**
 * Clicks/hovers every element in the editing area, waits for loads, and returns the counter
 * plus any script-capable markup left in the DOM.
 * @param {import('@playwright/test').Page} page
 */
async function trigger(page) {
	return page.evaluate(async () => {
		const ww = window.__sEditor.$.frameContext.get('wysiwyg');
		await new Promise((r) => setTimeout(r, 500));
		for (const el of ww.querySelectorAll('*')) {
			for (const type of ['mouseover', 'click']) el.dispatchEvent(new MouseEvent(type, { bubbles: true }));
		}
		for (const a of ww.querySelectorAll('a[href]')) {
			if (/^\s*javascript:/i.test(a.getAttribute('href'))) a.click();
		}
		await new Promise((r) => setTimeout(r, 300));

		const left = [];
		for (const el of ww.querySelectorAll('*')) {
			if (el.localName === 'iframe' && el.hasAttribute('srcdoc')) left.push('iframe[srcdoc]');
			for (const { name, value } of Array.from(el.attributes)) {
				if (/^on/i.test(name)) left.push(`${el.localName}[${name}]`);
				if (name === 'href' && /^\s*javascript:/i.test(value)) left.push(`${el.localName}[href=${value}]`);
			}
		}
		return { xss: window.__xss, left };
	});
}

test('harness control: unsanitized payloads are detected', async ({ page }) => {
	await make(page, {});
	await page.evaluate(() => {
		window.__sEditor.$.frameContext.get('wysiwyg').innerHTML =
			'<p><a:1b onclick="window.__xss++">click</a:1b></p><iframe srcdoc="<script>parent.__xss++</script>"></iframe>';
	});
	const result = await trigger(page);
	expect(result.xss).toBe(2);
	expect(result.left).toEqual(['a:1b[onclick]', 'iframe[srcdoc]']);
});

test.describe('Security advisories: sanitizer PoCs (html.set)', () => {
	for (const [label, payload] of SANITIZER_CASES) {
		for (const [mode, options] of [
			['default', {}],
			['autoStyleify off', { autoStyleify: [] }],
			['styleFilter off', { strictMode: { styleFilter: false } }],
			['attrFilter + styleFilter off', { strictMode: { attrFilter: false, styleFilter: false } }],
		]) {
			test(`${label} — ${mode}`, async ({ page }) => {
				await make(page, options);
				await page.evaluate((html) => window.__sEditor.$.html.set(html), payload);
				expect(await trigger(page)).toEqual({ xss: 0, left: [] });
			});
		}
	}
});

test.describe('Security advisories: Embed raw HTML PoCs (submitSRC)', () => {
	for (const [label, payload] of EMBED_CASES) {
		test(label, async ({ page }) => {
			await make(page, {});
			await page.evaluate(async (html) => {
				const ed = window.__sEditor;
				ed.$.html.set('<p>x</p>');
				const p = ed.$.frameContext.get('wysiwyg').querySelector('p');
				ed.$.selection.setRange(p.firstChild, 1, p.firstChild, 1);
				await ed.$.plugins.embed.submitSRC(html);
			}, payload);
			expect(await trigger(page)).toEqual({ xss: 0, left: [] });
		});
	}
});
