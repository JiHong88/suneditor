/**
 * @fileoverview Blur selection highlight — a non-collapsed selection stays painted (CSS Custom Highlight API,
 * `se-selection-blur`) while focus is outside the editor, and the paint never leaks into the content.
 *
 * - Link modal: shown while the modal input has focus, cleared when the modal closes (Esc / close button).
 * - Toolbar input (fontSize): shown while the input has focus, cleared once the size is applied.
 * - External page input: shown while it has focus, cleared when the editor is clicked again.
 * - A collapsed caret is never painted.
 * - Entering code view while painted clears it (`_range` is reset).
 */
const { test, expect } = require('@playwright/test');

const HL = 'se-selection-blur';

/**
 * Replaces the dev editor with a small one: link modal, fontSize toolbar input, code view, plus a page input.
 * @param {import('@playwright/test').Page} page
 */
async function make(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined && window.suneditor, { timeout: 15000 });
	await page.evaluate(async () => {
		const all = window.editor_root.$.plugins;
		const plugins = ['link', 'fontSize'].map((k) => all[k].constructor);
		window.editor_root.destroy();
		document.body.innerHTML = '<input id="ext" type="text" style="margin:20px"><div id="e"></div>';
		window.__bEditor = window.suneditor.create('#e', {
			plugins,
			buttonList: [['link', 'fontSize', 'codeView']],
		});
		await new Promise((r) => setTimeout(r, 400));
		window.__bEditor.$.html.set('<p>hello world</p><p>second line</p>');
		await new Promise((r) => setTimeout(r, 200));
	});
}

/** Click into the first line, then select `[start, end)` of its text node (setRange also stores `_range`). */
async function select(page, start, end) {
	await page.locator('.se-wrapper-wysiwyg p').first().click();
	await page.waitForTimeout(150);
	await page.evaluate(
		({ start, end }) => {
			const t = window.__bEditor.$.frameContext.get('wysiwyg').querySelector('p').firstChild;
			window.__bEditor.$.selection.setRange(t, start, t, end);
		},
		{ start, end },
	);
	await page.waitForTimeout(150);
}

/** Painted ranges' text, or `null` when the highlight is not registered. */
const painted = (page) =>
	page.evaluate((name) => {
		const h = CSS.highlights.get(name);
		return h ? [...h].map((r) => r.toString()) : null;
	}, HL);

const html = (page) => page.evaluate(() => window.__bEditor.$.frameContext.get('wysiwyg').innerHTML);

test.describe('selection blur highlight', () => {
	test.beforeEach(async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Custom Highlight API + native focus flow verified on chromium');
		await make(page);
		expect(await page.evaluate(() => !!(window.CSS?.highlights && window.Highlight))).toBe(true);
	});

	test('link modal: painted while the modal has focus, cleared on Esc and on the close button', async ({ page }) => {
		await select(page, 0, 5);
		const before = await html(page);
		expect(await painted(page)).toBeNull();

		await page.locator('.se-toolbar [data-command="link"]').click();
		await page.waitForTimeout(250);
		const modalInput = page.locator('.se-modal-show input[type="text"]').first();
		await expect(modalInput).toBeFocused();

		expect(await painted(page)).toEqual(['hello']);
		expect(await html(page)).toBe(before); // the paint is not in the DOM
		expect(await page.evaluate(() => window.__bEditor.$.html.get())).not.toContain(HL);

		await page.keyboard.press('Escape');
		await page.waitForTimeout(250);
		expect(await page.locator('.se-modal-show').count()).toBe(0);
		expect(await painted(page)).toBeNull();
		expect(await html(page)).toBe(before);

		// same again, closing with the modal's close button
		await select(page, 6, 11);
		await page.locator('.se-toolbar [data-command="link"]').click();
		await page.waitForTimeout(250);
		expect(await painted(page)).toEqual(['world']);
		await page.locator('.se-modal-show [data-command="close"]').click();
		await page.waitForTimeout(250);
		expect(await page.locator('.se-modal-show').count()).toBe(0);
		expect(await painted(page)).toBeNull();
	});

	test('fontSize toolbar input: painted while typing in it, cleared after the size is applied', async ({ page }) => {
		await select(page, 0, 5);

		const input = page.locator('.se-toolbar input.__se__font_size');
		await input.click();
		await page.waitForTimeout(200);
		await expect(input).toBeFocused();
		expect(await painted(page)).toEqual(['hello']);

		// ArrowUp applies a size step and keeps the input focused: the changed range is repainted, not dropped
		await page.keyboard.press('ArrowUp');
		await page.waitForTimeout(200);
		await expect(input).toBeFocused();
		expect(
			await page.evaluate(
				() => !!window.__bEditor.$.frameContext.get('wysiwyg').querySelector('span[style*="font-size"]'),
			),
		).toBe(true);
		expect(await painted(page)).toEqual(['hello']);

		// Enter applies the typed size and hands focus back to the editor, which clears the paint
		await input.fill('30');
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);
		const r = await page.evaluate(() => {
			const ww = window.__bEditor.$.frameContext.get('wysiwyg');
			const span = ww.querySelector('span[style*="font-size"]');
			return {
				text: span?.textContent,
				size: span?.style.fontSize,
				focused: ww.contains(document.activeElement),
			};
		});
		expect(r).toEqual({ text: 'hello', size: '30px', focused: true });
		expect(await painted(page)).toBeNull();
	});

	test('external page input: painted while it has focus, cleared on clicking back into the editor', async ({
		page,
	}) => {
		await select(page, 0, 11);
		const before = await html(page);

		await page.locator('#ext').click();
		await page.waitForTimeout(200);
		await expect(page.locator('#ext')).toBeFocused();
		expect(await painted(page)).toEqual(['hello world']);
		expect(await html(page)).toBe(before);

		await page.locator('.se-wrapper-wysiwyg p').nth(1).click();
		await page.waitForTimeout(200);
		expect(await painted(page)).toBeNull();
	});

	test('collapsed caret: nothing is painted on blur', async ({ page }) => {
		await select(page, 3, 3);
		await page.locator('#ext').click();
		await page.waitForTimeout(200);
		await expect(page.locator('#ext')).toBeFocused();
		expect(await painted(page)).toBeNull();
	});

	test('code view: entering it while painted clears the highlight', async ({ page }) => {
		await select(page, 0, 5);
		await page.locator('#ext').click();
		await page.waitForTimeout(200);
		expect(await painted(page)).toEqual(['hello']);

		await page.evaluate(() => window.__bEditor.$.viewer.codeView(true));
		await page.waitForTimeout(200);
		expect(await page.evaluate(() => window.__bEditor.$.frameContext.get('isCodeView'))).toBe(true);
		expect(await painted(page)).toBeNull();

		// leaving code view does not resurrect it
		await page.evaluate(() => window.__bEditor.$.viewer.codeView(false));
		await page.waitForTimeout(200);
		expect(await painted(page)).toBeNull();
	});

	test('code view toolbar button while painted clears it', async ({ page }) => {
		await select(page, 0, 5);
		await page.locator('#ext').click();
		await page.waitForTimeout(200);
		expect(await painted(page)).toEqual(['hello']);

		await page.locator('.se-toolbar [data-command="codeView"]').click();
		await page.waitForTimeout(250);
		expect(await page.evaluate(() => window.__bEditor.$.frameContext.get('isCodeView'))).toBe(true);
		expect(await painted(page)).toBeNull();
	});
});
