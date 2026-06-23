/**
 * @fileoverview Regression: pressing Enter on a bare empty line (BR-only) with a
 * NATIVELY placed caret (real click/arrow) must move the caret to the new line.
 *
 * Root cause guarded here: `resetRangeToTextNode` used to expand the empty-line caret
 * into a phantom non-collapsed selection over an inserted zero-width space, which routed
 * the Enter rule into `breakWithSelection` — inserting the new line ABOVE and leaving the
 * caret on the original line. These cases only reproduce with a native caret (a real
 * click/arrow key); a programmatic `setRange` normalizes the range and hides the bug, so
 * this must be an e2e test driving trusted keyboard input.
 */
const { test, expect } = require('@playwright/test');

async function setContent(page, html) {
	await page.evaluate((h) => window.editor_root.$.html.set(h), html);
	await page.waitForTimeout(80);
}

// Click natively on a target line (by index, or the 2nd <li>) to place the caret there.
async function clickLine(page, kind) {
	const pos = await page.evaluate((k) => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const el = k === 'liEmpty' ? ww.querySelectorAll('li')[1] : ww.children[+k];
		const r = el.getBoundingClientRect();
		return { x: Math.round(r.left + Math.min(8, r.width / 2)), y: Math.round(r.top + r.height / 2) };
	}, kind);
	await page.mouse.click(pos.x, pos.y);
	await page.waitForTimeout(30);
}

// Tag the current caret's format line, and hook setRange to record the enter effect.
async function markOriginAndHook(page) {
	await page.evaluate(() => {
		const $ = window.editor_root.$;
		const origin = $.format.getLine(document.getSelection().getRangeAt(0).startContainer, null);
		if (origin) origin.setAttribute('data-test-origin', '1');

		window.__effect = null;
		const sel = $.selection;
		const orig = sel.setRange.bind(sel);
		sel.setRange = function (sc, so, ec, eo) {
			const m = new Error().stack.match(/enter\.\w+\.\w+/);
			if (m) window.__effect = m[0];
			return orig(sc, so, ec, eo);
		};
	});
}

// After Enter: where did the caret land relative to the original line? (scroll-independent)
async function caretMovement(page) {
	return await page.evaluate(() => {
		const $ = window.editor_root.$;
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const origin = ww.querySelector('[data-test-origin="1"]');
		const caretLine = $.format.getLine(document.getSelection().getRangeAt(0).startContainer, null);
		const rel = origin && caretLine ? origin.compareDocumentPosition(caretLine) : 0;
		return {
			html: ww.innerHTML,
			lineCount: ww.children.length,
			effect: window.__effect,
			caretOnOrigin: caretLine === origin,
			caretFollowsOrigin: !!(rel & Node.DOCUMENT_POSITION_FOLLOWING),
		};
	});
}

async function pressEnter(page) {
	await page.keyboard.press('Enter');
	await page.waitForTimeout(80);
}

test.describe('Enter on empty line — caret must move to the new line', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	});

	test('single empty paragraph -> new line below, caret moves down', async ({ page }) => {
		await setContent(page, '<p><br></p>');
		await clickLine(page, '0');
		await markOriginAndHook(page);
		await pressEnter(page);
		const m = await caretMovement(page);

		expect(m.lineCount).toBe(2);
		expect(m.effect).toBe('enter.format.breakAtEdge');
		expect(m.caretOnOrigin).toBe(false);
		expect(m.caretFollowsOrigin).toBe(true);
	});

	test('empty paragraph between two lines -> caret moves down', async ({ page }) => {
		await setContent(page, '<p>AAA</p><p><br></p><p>BBB</p>');
		await clickLine(page, '1');
		await markOriginAndHook(page);
		await pressEnter(page);
		const m = await caretMovement(page);

		expect(m.lineCount).toBe(4);
		expect(m.effect).toBe('enter.format.breakAtEdge');
		expect(m.caretOnOrigin).toBe(false);
		expect(m.caretFollowsOrigin).toBe(true);
	});

	test('trailing empty paragraph -> caret moves down', async ({ page }) => {
		await setContent(page, '<p>AAA</p><p><br></p>');
		await clickLine(page, '1');
		await markOriginAndHook(page);
		await pressEnter(page);
		const m = await caretMovement(page);

		expect(m.lineCount).toBe(3);
		expect(m.effect).toBe('enter.format.breakAtEdge');
		expect(m.caretOnOrigin).toBe(false);
		expect(m.caretFollowsOrigin).toBe(true);
	});

	test('empty list item -> exits the list, caret on the new line', async ({ page }) => {
		await setContent(page, '<ul><li>AAA</li><li><br></li></ul>');
		await clickLine(page, 'liEmpty');
		await markOriginAndHook(page);
		await pressEnter(page);
		const m = await caretMovement(page);

		expect(m.effect).toBe('enter.format.exitEmpty');
		// exitEmpty consumes the empty <li>; the list shrinks and a default line is added.
		expect(m.html).toBe('<ul><li>AAA</li></ul><p><br></p>');
		// caret must be in the new line outside the list (the wysiwyg's last child)
		const caretInExitedLine = await page.evaluate(() => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			const caretLine = window.editor_root.$.format.getLine(document.getSelection().getRangeAt(0).startContainer, null);
			return caretLine === ww.lastElementChild && caretLine.nodeName === 'P';
		});
		expect(caretInExitedLine).toBe(true);
	});

	test('empty heading -> default (non-heading) line after, caret moves down', async ({ page }) => {
		await setContent(page, '<h2><br></h2>');
		await clickLine(page, '0');
		await markOriginAndHook(page);
		await pressEnter(page);
		const m = await caretMovement(page);

		expect(m.lineCount).toBe(2);
		expect(m.effect).toBe('enter.line.addDefault');
		const secondTag = await page.evaluate(() => document.querySelector('.se-wrapper-wysiwyg').children[1].nodeName);
		expect(secondTag).toBe('P');
		expect(m.caretOnOrigin).toBe(false);
		expect(m.caretFollowsOrigin).toBe(true);
	});

	test('sanity: splitting a text line still moves caret to the new line', async ({ page }) => {
		await setContent(page, '<p>ABCD</p>');
		// text-split (breakAtCursor) does not depend on native vs programmatic placement
		// (the empty-line phantom is specific to resetRangeToTextNode), so place caret directly.
		await page.evaluate(() => {
			const t = document.querySelector('.se-wrapper-wysiwyg p').firstChild;
			window.editor_root.$.selection.setRange(t, 2, t, 2);
		});
		await page.waitForTimeout(20);
		await markOriginAndHook(page);
		await pressEnter(page);
		const m = await caretMovement(page);

		expect(m.lineCount).toBe(2);
		expect(m.effect).toBe('enter.format.breakAtCursor');
		expect(m.caretOnOrigin).toBe(false);
		expect(m.caretFollowsOrigin).toBe(true);
	});
});

test.describe('Enter with a selection (breakWithSelection) — caret must land on the lower line', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	});

	// selection-split is deterministic, so the caret can be placed programmatically here.
	async function selectAndEnter(page, html, sel) {
		await page.evaluate((h) => window.editor_root.$.html.set(h), html);
		await page.waitForTimeout(60);
		await page.evaluate((s) => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			const node = (i) => ww.children[i].firstChild;
			window.editor_root.$.selection.setRange(node(s.sl), s.so, node(s.el), s.eo);
		}, sel);
		await page.evaluate(() => {
			const s = window.editor_root.$.selection;
			window.__effect = null;
			const orig = s.setRange.bind(s);
			s.setRange = function (sc, so, ec, eo) {
				const m = new Error().stack.match(/enter\.\w+\.\w+/);
				if (m) window.__effect = m[0];
				return orig(sc, so, ec, eo);
			};
		});
		await page.keyboard.press('Enter');
		await page.waitForTimeout(80);
		return await page.evaluate(() => {
			const ww = document.querySelector('.se-wrapper-wysiwyg');
			const r = document.getSelection().getRangeAt(0);
			let t = r.startContainer;
			while (t && t.parentNode !== ww) t = t.parentNode;
			return {
				html: ww.innerHTML,
				lineCount: ww.children.length,
				caretLineIndex: Array.prototype.indexOf.call(ww.children, t),
				effect: window.__effect,
			};
		});
	}

	test('whole single line selected -> caret on the lower line', async ({ page }) => {
		const r = await selectAndEnter(page, '<p>ABCD</p>', { sl: 0, so: 0, el: 0, eo: 4 });
		expect(r.effect).toBe('enter.format.breakWithSelection');
		expect(r.lineCount).toBe(2);
		expect(r.caretLineIndex).toBe(1);
	});

	test('whole multi-line selection -> caret on the lower line', async ({ page }) => {
		const r = await selectAndEnter(page, '<p>AAA</p><p>BBB</p><p>CCC</p>', { sl: 0, so: 0, el: 2, eo: 3 });
		expect(r.effect).toBe('enter.format.breakWithSelection');
		expect(r.lineCount).toBe(2);
		expect(r.caretLineIndex).toBe(1);
	});

	test('mid-line partial selection -> split, caret on the lower line', async ({ page }) => {
		const r = await selectAndEnter(page, '<p>ABCDEF</p>', { sl: 0, so: 2, el: 0, eo: 4 });
		expect(r.effect).toBe('enter.format.breakWithSelection');
		expect(r.html).toBe('<p>AB</p><p>EF</p>');
		expect(r.caretLineIndex).toBe(1);
	});

	test('cross-line partial selection -> caret on the lower line', async ({ page }) => {
		const r = await selectAndEnter(page, '<p>ABCD</p><p>EFGH</p>', { sl: 0, so: 2, el: 1, eo: 2 });
		expect(r.effect).toBe('enter.format.breakWithSelection');
		expect(r.html).toBe('<p>AB</p><p>GH</p>');
		expect(r.caretLineIndex).toBe(1);
	});
});
