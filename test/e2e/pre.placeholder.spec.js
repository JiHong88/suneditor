const { test, expect } = require('@playwright/test');

test('placeholder aligns with text for p / h1 / pre', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.resetOptions({ placeholder_line: 'Type here' }));
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p><h1><br></h1><pre><br></pre>'));
	await page.waitForTimeout(150);
	await page.evaluate(() => {
		for (const el of document.querySelectorAll('.se-wrapper-wysiwyg p, .se-wrapper-wysiwyg h1, .se-wrapper-wysiwyg pre')) {
			el.classList.add('se-placeholder-line');
			el.setAttribute('data-se-placeholder-line', 'Type here');
		}
	});
	await page.waitForTimeout(100);

	// For each marked line, the ::before must sit at the content box (respecting padding), not above it.
	const r = await page.evaluate(() => {
		const out = {};
		for (const tag of ['p', 'h1', 'pre']) {
			const el = document.querySelector('.se-wrapper-wysiwyg ' + tag);
			const cs = getComputedStyle(el);
			const csB = getComputedStyle(el, '::before');
			out[tag] = { pad: cs.padding, beforeInsetTop: csB.top, beforePad: csB.padding, beforeBoxSizing: csB.boxSizing };
		}
		return out;
	});
	// ::before inherits the line's padding (so text lands on the content box)
	expect(r.pre.beforePad).toBe('8px');
	expect(r.pre.beforeBoxSizing).toBe('border-box');

});
