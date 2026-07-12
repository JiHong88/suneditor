/**
 * @fileoverview Regression: pressing Enter inside a tall PRE (brLine) when the editor is embedded in a
 * SCROLL CONTAINER must keep the caret visible — the container should scroll to the new caret row.
 *
 * Root cause guarded here: on Enter, the scroll target was the whole PRE block element (`el`), and the
 * range passed to scrollTo was the pre-Enter snapshot.
 *   - In the `hasScrollParents` path, `el.scrollIntoView({block:'nearest'})` with a tall PRE that already
 *     fills the container is a no-op, so the container never followed the new caret (caret left below the fold).
 *   - The pre-Enter snapshot also pointed at the OLD caret row (already visible), hiding the need to scroll.
 * The fix scrolls the *live* post-Enter caret rect into view across scroll parents. Both parts are required:
 * scroll-container embedding only reproduces under real layout, so this is an e2e test.
 */
const { test, expect } = require('@playwright/test');

// Build a scroll container with an embedded editor whose PRE is far taller than the container, place a
// native caret on a mid PRE row near the container's bottom edge, and return that row's click point.
async function setupEmbeddedPre(page) {
	return page.evaluate(async () => {
		const box = document.createElement('div');
		box.id = 'scrollbox';
		box.style.cssText = 'height:400px; overflow:auto; border:1px solid #ccc;';
		const target = document.createElement('div');
		box.appendChild(target);
		document.body.insertBefore(box, document.body.firstChild);

		const rows = Array.from({ length: 120 }, (_, i) => `pre line ${i}`).join('<br>');
		const ed = window.suneditor.create(target, { value: `<pre>${rows}</pre>`, height: 'auto' });
		window.__ed = ed;
		await new Promise((r) => setTimeout(r, 150));

		const pre = box.querySelector('.se-wrapper-wysiwyg pre');
		const texts = [...pre.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
		const mid = texts[Math.floor(texts.length / 2)];

		const rowRect = () => {
			const rng = document.createRange();
			rng.selectNode(mid);
			return rng.getBoundingClientRect();
		};
		// scroll the container so the caret row sits ~20px above the container's bottom edge
		box.scrollBy(0, rowRect().top - (box.getBoundingClientRect().bottom - 20));
		await new Promise((r) => setTimeout(r, 30));

		const rr = rowRect();
		return { x: Math.round(rr.left + 6), y: Math.round(rr.top + 2) };
	});
}

function measure(page) {
	return page.evaluate(() => {
		const ed = window.__ed;
		const box = document.getElementById('scrollbox');
		const range = ed.$.selection.getRange();
		const cr = range.getBoundingClientRect();
		const br = box.getBoundingClientRect();
		return {
			scrollTop: box.scrollTop,
			caretInView: cr.top >= br.top && cr.top <= br.bottom,
			inPre: ed.$.format.getLine(range.startContainer, null)?.nodeName === 'PRE',
		};
	});
}

test('Enter mid-PRE in a scroll container keeps the caret visible', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => !!window.suneditor);

	const click = await setupEmbeddedPre(page);
	await page.mouse.click(click.x, click.y);
	await page.waitForTimeout(40);

	const before = await measure(page);
	expect(before.inPre).toBe(true); // sanity: native caret really is inside the PRE
	expect(before.caretInView).toBe(true);

	await page.keyboard.press('Enter');
	await page.waitForTimeout(150);

	const after = await measure(page);
	// The container must scroll to follow the new caret row — caret stays visible (the bug left it below the fold).
	expect(after.scrollTop).toBeGreaterThan(before.scrollTop);
	// ...by roughly one line, never a whole-block jump.
	expect(after.scrollTop - before.scrollTop).toBeLessThan(80);
	expect(after.caretInView).toBe(true);
});
