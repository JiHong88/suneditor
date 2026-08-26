const { test, expect } = require('@playwright/test');

/**
 * Opening a slash-command sub-panel (a native submenu, or a dropdown-free plugin's flyout) with the
 * keyboard, then pressing any other key, used to tear the whole menu down.
 *
 * `ui.selectMenuOn` was one boolean shared by every `SelectMenu` instance, so the last writer won:
 * the dev page also loads `autocomplete`, whose own menu closes on every keystroke, which flipped the
 * flag off while the slash menu was still open. With the flag off, `OnKeyDown_wysiwyg` no longer
 * deferred to the menu and called `menu.dropdownOff()` on each keydown — and the flyout's dropdown-off
 * subscription reads that as "the plugin committed", so it closed the flyout *and* the menu.
 */

const state = (page) =>
	page.evaluate(() => {
		const menu = document.querySelector('.se-slash-command-menu');
		return {
			visible: !!menu && !!menu.offsetParent,
			subOpen: !!document.querySelector('.se-slash-command-menu .se-submenu-open'),
			selectMenuOn: window.editor_root.$.ui.selectMenuOn,
			tableInMenu: !!window.editor_root.$.menu.targetMap.table.closest('.se-slash-command-menu'),
		};
	});

async function openSlashMenu(page, query) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p>'));
	await page.waitForTimeout(150);
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(100);
	await page.keyboard.type(query);
	await page.waitForTimeout(350);
}

test('the menu owns the keyboard while it is open', async ({ page }) => {
	await openSlashMenu(page, '/table');

	// the shared flag must still report the slash menu, not the last menu that happened to close
	expect((await state(page)).selectMenuOn).toBe(true);
});

for (const [kind, query] of [
	['submenu', '/align'],
	['dropdown-free flyout', '/table'],
]) {
	test(`Enter opens the ${kind} and the menu stays open`, async ({ page }) => {
		await openSlashMenu(page, query);
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);

		const opened = await state(page);
		expect(opened.subOpen).toBe(true);
		expect(opened.visible).toBe(true);
	});

	test(`a horizontal arrow opens the ${kind}`, async ({ page }) => {
		await openSlashMenu(page, query);
		await page.keyboard.press('ArrowRight');
		await page.waitForTimeout(300);

		const opened = await state(page);
		expect(opened.subOpen).toBe(true);
		expect(opened.visible).toBe(true);
	});

	test(`a horizontal arrow toggles the ${kind} shut again`, async ({ page }) => {
		await openSlashMenu(page, query);
		await page.keyboard.press('ArrowLeft'); // open
		await page.waitForTimeout(300);
		expect((await state(page)).subOpen).toBe(true);

		await page.keyboard.press('ArrowLeft'); // close — either direction does both
		await page.waitForTimeout(300);

		const after = await state(page);
		expect(after.subOpen).toBe(false);
		expect(after.visible).toBe(true);
	});

	test(`a horizontal arrow after Enter closes only the ${kind}`, async ({ page }) => {
		await openSlashMenu(page, query);
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);
		await page.keyboard.press('ArrowLeft');
		await page.waitForTimeout(300);

		const after = await state(page);
		expect(after.visible).toBe(true); // the menu itself is untouched
		expect(after.subOpen).toBe(false); // back on the trigger row
	});
}

test('ArrowDown inside a submenu navigates it instead of closing the menu', async ({ page }) => {
	await openSlashMenu(page, '/align');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(300);
	await page.keyboard.press('ArrowDown');
	await page.waitForTimeout(300);

	// a native submenu owns the vertical axis; the flyout does not (see the test below)
	const after = await state(page);
	expect(after.visible).toBe(true);
	expect(after.subOpen).toBe(true);
});

test('ArrowDown with the flyout open moves the cursor and takes the flyout with it', async ({ page }) => {
	await openSlashMenu(page, '/table');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(300);
	await page.keyboard.press('ArrowDown');
	await page.waitForTimeout(300);

	const after = await state(page);
	expect(after.visible).toBe(true);
	expect(after.subOpen).toBe(false);
});

test('the table picker returns to the toolbar menu tray, not to the menu', async ({ page }) => {
	await openSlashMenu(page, '/table');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(300);
	expect((await state(page)).tableInMenu).toBe(true);

	await page.keyboard.press('ArrowDown');
	await page.waitForTimeout(300);
	expect((await state(page)).tableInMenu).toBe(false);
});

test('repeated picks toggle the flyout without spending the anchor twice', async ({ page }) => {
	const errors = [];
	page.on('pageerror', (e) => errors.push(String(e)));
	await openSlashMenu(page, '/table');

	// the first pick deletes the "/table" text, so the cached anchor is spent — re-running the removal
	// threw `can't access property "substringData", sc is null` out of `html.remove()`
	for (let i = 0; i < 4; i++) {
		await page.keyboard.press('Enter');
		await page.waitForTimeout(250);
		const s = await state(page);
		expect(s.visible).toBe(true);
		expect(s.subOpen).toBe(i % 2 === 0); // odd press opens, even press toggles back off
	}

	expect(errors).toEqual([]);
});

test('picking a row whose flyout is already open closes the flyout, not the menu', async ({ page }) => {
	await openSlashMenu(page, '/table');
	await page.locator('.se-slash-command-menu li[data-index="0"]').hover(); // hover opens the flyout
	await page.waitForTimeout(250);
	expect((await state(page)).subOpen).toBe(true);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(300);

	const after = await state(page);
	expect(after.subOpen).toBe(false);
	expect(after.visible).toBe(true);
});

test('Space is left to the document — it types a space and ends the query', async ({ page }) => {
	// An IME (Firefox/macOS + Hangul) makes `preventDefault()` on keydown a no-op and the composition
	// insertion is not cancelable, so a Space the menu claimed still typed a space and closed the menu
	// a debounce later. The menu no longer claims it: Space is plain text everywhere, as it always was
	// once a space ends the slash query.
	await openSlashMenu(page, '/align');
	await page.keyboard.press('Space');
	await page.waitForTimeout(400);

	const after = await state(page);
	expect(after.subOpen).toBe(false); // no sub-panel opened
	expect(after.visible).toBe(false); // the space ended the query, as typing a space always has
	const text = await page.evaluate(() => window.editor_root.$.frameContext.get('wysiwyg').textContent);
	expect(text.replace(/\u00A0/g, ' ')).toBe('/align ');
});
