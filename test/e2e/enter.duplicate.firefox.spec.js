/**
 * @fileoverview Firefox regression: pressing Enter must insert exactly ONE new line.
 *
 * `OnKeyDown_wysiwyg` is async (it awaits the user/plugin onKeyDown events), so deferring
 * `preventDefault` to the Enter reducer let the browser fire `beforeinput(insertParagraph)`
 * first — inserting a paragraph on top of SunEditor's own Enter handling (a duplicate line, and
 * on a fully empty editing host, a cloned wysiwyg container). This reproduces reliably on
 * WebKit/Gecko (iPadOS Safari, Firefox) and intermittently on Chrome. The fix calls
 * `preventDefault` synchronously in keydown for a plain Enter that SunEditor handles.
 *
 * Driven with native keyboard input (page.keyboard) because the bug is about native vs scripted
 * event timing; a programmatic range hides it.
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

function lineCount(page) {
	return page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length);
}

function wysiwygContainerCount(page) {
	return page.evaluate(() => document.querySelectorAll('.se-wrapper .se-wrapper-wysiwyg').length);
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
});

test('Enter on an empty editor inserts exactly one line per press (no duplicate)', async ({ page }) => {
	await setContent(page, '<p><br></p>');
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(40);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	expect(await lineCount(page)).toBe(2);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	expect(await lineCount(page)).toBe(3);

	// the wysiwyg container itself must never be cloned as a sibling
	expect(await wysiwygContainerCount(page)).toBe(1);
});

test('Enter on an empty line between content inserts exactly one line', async ({ page }) => {
	await setContent(page, '<p>Hello</p><p><br></p><p>World</p>');
	// focus the editor, then place the caret on the empty middle line. The duplication bug is about
	// native-Enter vs async-handler timing (the keydown is real), so it reproduces regardless of how
	// the caret was placed — a programmatic caret keeps the test stable under headless Firefox.
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(40);
	await page.evaluate(() => {
		const mid = document.querySelectorAll('.se-wrapper-wysiwyg > p')[1];
		window.editor_root.$.selection.setRange(mid, 0, mid, 0);
	});
	await page.waitForTimeout(40);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	expect(await lineCount(page)).toBe(4);
	expect(await wysiwygContainerCount(page)).toBe(1);
});

test('Enter on a completely empty editing host never clones the wysiwyg container', async ({ page }) => {
	// Degenerate state from the bug report: the wysiwyg has no line child and the caret is on the
	// editing host itself. Native insertParagraph (run because preventDefault was late) cloned the
	// whole wysiwyg container as a sibling. The fix blocks native and materializes a real line.
	await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		ww.innerHTML = '';
		ww.focus();
		window.editor_root.$.selection.setRange(ww, 0, ww, 0);
	});
	await page.waitForTimeout(60);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	expect(await wysiwygContainerCount(page)).toBe(1); // the container must never be cloned
	expect(await lineCount(page)).toBe(2); // a real line was materialized, not a container clone

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	expect(await wysiwygContainerCount(page)).toBe(1);
	expect(await lineCount(page)).toBe(3);
});

test('Enter on a text line still splits into exactly two lines', async ({ page }) => {
	await setContent(page, '<p>ABCD</p>');
	// place a native caret in the middle of ABCD via double-click + arrow is unreliable; click then Home+Right*2
	await page.locator('.se-wrapper-wysiwyg > p').click();
	await page.keyboard.press('Home');
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(40);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
	expect(await lineCount(page)).toBe(2);
	expect(await wysiwygContainerCount(page)).toBe(1);
});
