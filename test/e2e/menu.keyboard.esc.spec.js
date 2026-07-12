const { test, expect } = require('@playwright/test');

async function setup(page, html) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate((h) => window.editor_root.$.html.set(h), html || '<p>alpha</p><p>bravo</p>');
	await page.waitForTimeout(200);
}
async function openBlockMenu(page) {
	await page.locator('.se-wrapper-wysiwyg p').first().hover();
	await page.waitForTimeout(150);
	await page.locator('.se-block-handle-drag').first().click();
	await page.waitForTimeout(250);
}
const blockMenu = (page) => page.evaluate(() => {
	const m = document.querySelector('.se-block-action-menu');
	return { visible: !!m && !!m.offsetParent, submenuOpen: !!document.querySelector('.se-block-action-menu .se-submenu-open') };
});
const slashMenu = (page) => page.evaluate(() => {
	const m = document.querySelector('.se-slash-command-menu');
	return {
		visible: !!m && !!m.offsetParent,
		submenuOpen: !!document.querySelector('.se-slash-command-menu .se-submenu-open'),
		ctrlOpen: window.editor_root.$.plugins.slashCommand.controller.isOpen,
	};
});

test('ISSUE 1: space with no keyboard cursor does NOT close the block menu', async ({ page }) => {
	await setup(page);
	await openBlockMenu(page);
	expect((await blockMenu(page)).visible).toBe(true);
	await page.keyboard.press('Space');
	await page.waitForTimeout(150);
	expect((await blockMenu(page)).visible).toBe(true); // stays open
});

test('ISSUE 2: ESC on an open slash submenu closes only the submenu', async ({ page }) => {
	await setup(page, '<p><br></p>');
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(100);
	await page.keyboard.type('/align');
	await page.waitForTimeout(350);
	await page.keyboard.press('ArrowRight'); // open submenu of the focused row
	await page.waitForTimeout(250);
	const before = await slashMenu(page);
	expect(before.submenuOpen).toBe(true);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	const after = await slashMenu(page);
	expect(after.visible).toBe(true); // whole menu stays open
	expect(after.submenuOpen).toBe(false); // only submenu closed
});

test('ISSUE 3: slash H1 converts the line and placeholder is H1-sized', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => window.editor_root.$.html.set('<p><br></p>'));
	await page.waitForTimeout(150);
	await page.locator('.se-wrapper-wysiwyg').click();
	await page.waitForTimeout(100);
	await page.keyboard.type('/head');
	await page.waitForTimeout(350);
	await page.keyboard.press('Enter'); // select the "Heading 1" item
	await page.waitForTimeout(250);
	// place caret in the (now empty) h1 line and let the placeholder mark it
	await page.evaluate(() => {
		const h1 = document.querySelector('.se-wrapper-wysiwyg h1');
		if (h1) window.editor_root.$.selection.setRange(h1, 0, h1, 0);
		window.editor_root.$.store.set('hasFocus', true);
		window.editor_root.$.ui._updatePlaceholder(window.editor_root.$.frameContext);
	});
	await page.waitForTimeout(120);
	const r = await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const h1 = ww.querySelector('h1');
		const marked = ww.querySelector('.se-placeholder-line');
		return {
			html: ww.innerHTML,
			hasH1: !!h1,
			nestedP: h1 ? !!h1.querySelector('p') : null,
			markedTag: marked ? marked.tagName : null,
			beforeFs: marked ? getComputedStyle(marked, '::before').fontSize : null,
			h1Fs: h1 ? getComputedStyle(h1).fontSize : null,
		};
	});
	expect(r.hasH1).toBe(true);
	expect(r.nestedP).toBe(false); // converted, not wrapped
	expect(r.markedTag).toBe('H1'); // placeholder marker on the H1 itself
	expect(r.beforeFs).toBe(r.h1Fs); // placeholder sized to the H1 line
});
