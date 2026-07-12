/**
 * @fileoverview Firefox regression: backspace/delete on an empty line.
 *
 * In Firefox, native backspace/delete do nothing while the caret sits on a `<br>`, so an empty
 * line created by Enter could not be removed. The editor now (1) places the caret on a zero-width
 * Text node before the `<br>` and (2) handles backspace/delete on an empty line deterministically
 * in the reducer rules (preventDefault + explicit merge), so the line is removed in ONE press
 * regardless of native behavior. These tests run under Firefox to guard that platform specifically.
 *
 * Caret placement is programmatic: the deterministic rule fires on `isEmptyLine` regardless of how
 * the caret was placed, and headless Firefox does not reliably focus on a synthesized mouse click.
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

// place a collapsed caret inside an empty line (on its ZWS text node, else the line itself)
async function caretInEmptyLine(page, idx) {
	await page.evaluate((i) => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const line = ww.children[i];
		const $ = window.editor_root.$;
		const first = line.firstChild;
		if (first && first.nodeType === 3) $.selection.setRange(first, 1, first, 1);
		else $.selection.setRange(line, 0, line, 0);
	}, idx);
	await page.waitForTimeout(20);
}

async function state(page) {
	return await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		return { lines: ww.children.length, text: ww.textContent.replace(/​/g, '') };
	});
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
});

test('Backspace on an empty line merges into the previous line in ONE press', async ({ page }) => {
	await setContent(page, '<p>AAA</p><p>​<br></p>');
	await caretInEmptyLine(page, 1);
	await page.keyboard.press('Backspace');
	await page.waitForTimeout(60);

	const s = await state(page);
	expect(s.lines).toBe(1);
	expect(s.text).toBe('AAA');
});

test('Delete on an empty line pulls the next line up in ONE press', async ({ page }) => {
	await setContent(page, '<p>AAA</p><p>​<br></p><p>BBB</p>');
	await caretInEmptyLine(page, 1);
	await page.keyboard.press('Delete');
	await page.waitForTimeout(60);

	const s = await state(page);
	expect(s.lines).toBe(2);
	expect(s.text).toBe('AAABBB');
});

test('Backspace on an empty line between two lines merges into the previous line', async ({ page }) => {
	await setContent(page, '<p>AAA</p><p>​<br></p><p>BBB</p>');
	await caretInEmptyLine(page, 1);
	await page.keyboard.press('Backspace');
	await page.waitForTimeout(60);

	const s = await state(page);
	expect(s.lines).toBe(2);
	expect(s.text).toBe('AAABBB');
});

test('Backspace on an empty line after a PRE removes it and moves the caret into the PRE', async ({ page }) => {
	// Exiting a PRE with Enter leaves an empty normal line whose previous sibling is the PRE (a brLine).
	// Native backspace there is dead on the <br> caret in Firefox, so it must take the deterministic path.
	await setContent(page, '<pre>code line 1<br>code line 2</pre><p>​<br></p>');
	await caretInEmptyLine(page, 1);
	await page.keyboard.press('Backspace');
	await page.waitForTimeout(60);

	const s = await state(page);
	expect(s.lines).toBe(1);
	expect(s.text).toBe('code line 1code line 2');

	const inPre = await page.evaluate(() => {
		const r = document.getSelection().getRangeAt(0);
		return window.editor_root.$.format.getLine(r.startContainer, null)?.nodeName === 'PRE';
	});
	expect(inPre).toBe(true); // caret landed at the end of the PRE
});

test('Delete on an empty row INSIDE a PRE pulls the next row up in one press', async ({ page }) => {
	await setContent(page, '<pre>AAAA<br><br>BBBB</pre>');
	await page.evaluate(() => {
		const br2 = document.querySelector('.se-wrapper-wysiwyg pre').querySelectorAll('br')[1];
		window.editor_root.$.selection.setRange(br2, 0, br2, 0);
	});
	await page.waitForTimeout(20);
	await page.keyboard.press('Delete');
	await page.waitForTimeout(60);

	const pre = await page.evaluate(() => {
		const p = document.querySelector('.se-wrapper-wysiwyg pre');
		return { brCount: p.querySelectorAll('br').length, text: p.textContent.replace(/​/g, '') };
	});
	expect(pre.brCount).toBe(1);
	expect(pre.text).toBe('AAAABBBB');
});

test('Delete on an empty line before a PRE removes it and moves the caret into the PRE', async ({ page }) => {
	await setContent(page, '<p>​<br></p><pre>code line 1<br>code line 2</pre>');
	await caretInEmptyLine(page, 0);
	await page.keyboard.press('Delete');
	await page.waitForTimeout(60);

	const s = await state(page);
	expect(s.lines).toBe(1);
	expect(s.text).toBe('code line 1code line 2');

	const inPre = await page.evaluate(() => {
		const r = document.getSelection().getRangeAt(0);
		return window.editor_root.$.format.getLine(r.startContainer, null)?.nodeName === 'PRE';
	});
	expect(inPre).toBe(true); // caret landed at the start of the PRE
});

async function component(page) {
	return await page.evaluate(() => {
		const c = window.editor_root.$.component;
		return {
			selected: !!c.isSelected,
			target: c.currentTarget ? c.currentTarget.nodeName : null,
			hasTable: !!document.querySelector('.se-wrapper-wysiwyg table'),
		};
	});
}

test('Delete on an empty line whose next line is a component selects it (no merge)', async ({ page }) => {
	await setContent(page, '<p>AAA</p><p>​<br></p><table><tbody><tr><td>x</td></tr></tbody></table>');
	await caretInEmptyLine(page, 1);
	await page.keyboard.press('Delete');
	await page.waitForTimeout(60);

	const c = await component(page);
	expect(c.selected).toBe(true);
	expect(c.target).toBe('TABLE');
	expect(c.hasTable).toBe(true);
});

test('Backspace on an empty line whose previous line is a component selects it (no merge)', async ({ page }) => {
	await setContent(page, '<table><tbody><tr><td>x</td></tr></tbody></table><p>​<br></p>');
	const last = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children.length - 1);
	await caretInEmptyLine(page, last);
	await page.keyboard.press('Backspace');
	await page.waitForTimeout(60);

	const c = await component(page);
	expect(c.selected).toBe(true);
	expect(c.target).toBe('TABLE');
	expect(c.hasTable).toBe(true);
});
