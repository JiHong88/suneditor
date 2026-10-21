/**
 * @fileoverview Keydown — the editor's `preventDefault()` runs before the `onKeyDown` hooks are awaited.
 *
 * - With an async `onKeyDown` hook (one that waits on a timer), a prevent issued after the `await` came too late:
 *   the browser ran its native Delete, then the editor ran its own on top — an empty line took the next one with it.
 * - A hook that returns `false` skips the editor's edit; the key the editor took over is still prevented.
 */
const { test, expect } = require('@playwright/test');

/** @param {'none'|'async'|'cancel'} hook */
async function make(page, hook) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined && window.suneditor, { timeout: 15000 });
	await page.evaluate(async (hook) => {
		window.editor_root.destroy();
		document.body.innerHTML = '<div id="e"></div>';
		const events = {};
		if (hook === 'async') events.onKeyDown = async () => new Promise((r) => setTimeout(r, 0));
		if (hook === 'cancel') events.onKeyDown = async () => new Promise((r) => setTimeout(() => r(false), 0));
		window.editor_root = window.suneditor.create('#e', { events });
		await new Promise((r) => setTimeout(r, 400));
	}, hook);
}

async function deleteOnEmptyLine(page) {
	await page.evaluate(async () => {
		window.editor_root.$.html.set('<p>AAA</p><p>​<br></p><p>BBB</p>');
		await new Promise((r) => setTimeout(r, 80));
		const zws = document.querySelector('.se-wrapper-wysiwyg').children[1].firstChild;
		window.editor_root.$.selection.setRange(zws, 1, zws, 1);
	});
	await page.waitForTimeout(20);
	await page.keyboard.press('Delete');
	await page.waitForTimeout(100);
	return page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').innerHTML.replace(/​/g, ''));
}

for (const hook of ['none', 'async']) {
	test(`Delete on an empty line removes only that line (onKeyDown: ${hook})`, async ({ page }) => {
		await make(page, hook);
		expect(await deleteOnEmptyLine(page)).toBe('<p>AAA</p><p>BBB</p>');
	});
}

test('a cancelling async onKeyDown skips the edit and the native one alike', async ({ page }) => {
	await make(page, 'cancel');
	expect(await deleteOnEmptyLine(page)).toBe('<p>AAA</p><p><br></p><p>BBB</p>');
});
