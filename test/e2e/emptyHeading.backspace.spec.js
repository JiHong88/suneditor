/**
 * @fileoverview Regression guard for the Backspace/Delete range-normalization change.
 *
 * Backspace/Delete now run `_normalizeEditRange` (previously Enter-only). A review raised the
 * concern that normalizing an empty non-default line (e.g. an empty <h1>) could inject a
 * zero-width Text node and break the "empty heading -> default line (P)" conversion that
 * `backspaceFormatMaintain` performs. These tests exercise the real-browser path with the caret
 * reported on the LINE element itself (the scenario jsdom cannot reproduce).
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

// caret on the line element itself (line-container scenario), else its ZWS text node
async function caretOnLine(page, idx) {
	await page.evaluate((i) => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const line = ww.children[i];
		window.editor_root.$.selection.setRange(line, 0, line, 0);
	}, idx);
	await page.waitForTimeout(20);
}

async function firstLine(page) {
	return await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const el = ww.children[0];
		return { tag: el?.nodeName, html: ww.innerHTML.replace(/​/g, '[ZWS]'), lines: ww.children.length };
	});
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
});

test('Backspace in an empty heading converts it to the default line (P)', async ({ page }) => {
	await setContent(page, '<h1><br></h1>');
	await caretOnLine(page, 0);
	await page.keyboard.press('Backspace');
	await page.waitForTimeout(60);

	const s = await firstLine(page);
	expect(s.tag).toBe('P'); // heading demoted to default line
	expect(s.lines).toBe(1);
});

test('Backspace in an empty styled default line strips its attributes', async ({ page }) => {
	await setContent(page, '<p style="color:red;" class="foo"><br></p>');
	await caretOnLine(page, 0);
	await page.keyboard.press('Backspace');
	await page.waitForTimeout(60);

	const attrs = await page.evaluate(() => {
		const el = document.querySelector('.se-wrapper-wysiwyg').children[0];
		return { tag: el.nodeName, style: el.getAttribute('style'), cls: el.getAttribute('class') };
	});
	expect(attrs.tag).toBe('P');
	expect(attrs.style).toBeFalsy();
	// User classes are stripped. The editor may add its internal `se-placeholder-line` marker to the
	// now-empty focused line — that is expected and not a user attribute.
	expect((attrs.cls || '').includes('foo')).toBe(false);
});

test('Delete in an empty only-line leaves no stray zero-width character', async ({ page }) => {
	await setContent(page, '<h1><br></h1>');
	await caretOnLine(page, 0);
	await page.keyboard.press('Delete');
	await page.waitForTimeout(60);

	const html = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').innerHTML);
	// Delete on the last empty line is a no-op; it must not leave an injected ZWS behind
	expect(html.includes('​')).toBe(false);
});
