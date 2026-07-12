/**
 * @fileoverview e2e for the per-line placeholder (::before-based). Verifies the two things JSDOM
 * cannot: (1) the hint renders via ::before with the line's alignment, and (2) it scrolls WITH the
 * content (the original bug: a separately-positioned element stayed put on scroll).
 */
const { test, expect } = require('@playwright/test');

async function setup(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

test.describe('per-line placeholder (::before)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
		// make sure the line placeholder text is configured for editor_root
		await page.evaluate(() => window.editor_root.resetOptions({ placeholder_line: 'Type / for commands' }));
	});

	test('renders the hint via ::before, mirroring the line alignment', async ({ page }) => {
		await setup(page, '<p style="text-align:center"><br></p>');
		await page.locator('.se-wrapper-wysiwyg').first().click();
		await page.waitForTimeout(80);

		const r = await page.evaluate(() => {
			const line = document.querySelector('.se-wrapper-wysiwyg p');
			const cs = getComputedStyle(line, '::before');
			return {
				marked: line.classList.contains('se-placeholder-line'),
				content: cs.content,
				align: cs.textAlign,
			};
		});
		expect(r.marked).toBe(true);
		expect(r.content).toContain('Type / for commands');
		expect(r.align).toBe('center');
	});

	test('scrolls WITH the content (regression: hint must follow the line on scroll)', async ({ page }) => {
		// tall content with a trailing empty line, inside a fixed-height scrollable wysiwyg
		const lines = Array.from({ length: 40 }, (_, i) => `<p>line ${i}</p>`).join('');
		await setup(page, lines + '<p><br></p>');
		await page.evaluate(() => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			ww.style.height = '200px';
			ww.style.overflowY = 'auto';
		});

		// focus the trailing empty line
		await page.evaluate(() => {
			const ps = document.querySelectorAll('.se-wrapper-wysiwyg p');
			const empty = ps[ps.length - 1];
			window.editor_root.$.selection.setRange(empty, 0, empty, 0);
			window.editor_root.$.store.set('hasFocus', true);
			window.editor_root.$.ui._updatePlaceholder(window.editor_root.$.frameContext);
		});
		await page.waitForTimeout(50);

		const before = await page.evaluate(() => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			const marked = ww.querySelector('.se-placeholder-line');
			return { top: Math.round(marked.getBoundingClientRect().top), scrollTop: ww.scrollTop };
		});

		// scroll the wysiwyg up by 120px
		await page.evaluate(() => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			ww.scrollTop = ww.scrollTop - 120 < 0 ? 0 : ww.scrollTop - 120;
		});
		await page.waitForTimeout(50);

		const after = await page.evaluate(() => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			const marked = ww.querySelector('.se-placeholder-line');
			return { top: Math.round(marked.getBoundingClientRect().top), scrollTop: ww.scrollTop, stillMarked: !!marked };
		});

		// the marked line moved on screen by the scroll delta — i.e. the ::before hint tracks it,
		// instead of staying at a fixed screen position (the old bug).
		expect(after.stillMarked).toBe(true);
		const scrollDelta = before.scrollTop - after.scrollTop; // positive = scrolled up
		const screenDelta = after.top - before.top;
		expect(Math.abs(screenDelta - scrollDelta)).toBeLessThan(4);
	});

	test('does not leak the marker into getContents', async ({ page }) => {
		await setup(page, '<p><br></p>');
		await page.locator('.se-wrapper-wysiwyg').first().click();
		await page.waitForTimeout(60);
		const out = await page.evaluate(() => {
			const live = document.querySelector('.se-wrapper-wysiwyg').innerHTML;
			const got = window.editor_root.getContents ? window.editor_root.getContents() : window.editor_root.$.html.get();
			return { live, got: typeof got === 'string' ? got : JSON.stringify(got) };
		});
		expect(out.live).toContain('se-placeholder-line'); // live DOM has it
		expect(out.got).not.toContain('se-placeholder-line'); // export does not
	});
});
