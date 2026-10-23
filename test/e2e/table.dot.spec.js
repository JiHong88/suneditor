/**
 * @fileoverview Table dot launchers (`cellControllerPosition` / `tableControllerPosition` = `'dot'`).
 *
 * The controllers opened from a dot are the dots' child popups: any click elsewhere (another cell,
 * the same cell) or a second click on the dot closes them like a normal popup, while the table stays
 * selected. A closed popup must stay closed through scrolls — the core re-shows a merely hidden
 * controller on every scroll — and the dots must follow inner scrolls, iframe mode included.
 */
const { test, expect } = require('@playwright/test');

/** Creates a both-dot table editor (the defaults) with an inner-scrolling, fixed-height wysiwyg. */
async function make(page, { iframe = false } = {}) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate((iframe) => {
		const Table = window.editor_root.$.plugins.table.constructor;
		const el = document.createElement('div');
		document.body.prepend(el);
		window.__dotEditor = window.suneditor.create(el, {
			plugins: [Table],
			buttonList: [['table']],
			iframe,
			height: '320px',
		});
	}, iframe);
	await page.waitForTimeout(600);
	await page.evaluate(() => {
		const row = (p) => `<tr>${Array.from({ length: 4 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		const filler = Array.from({ length: 30 }, (_, i) => `<p>line ${i}</p>`).join('');
		window.__dotEditor.$.html.set(
			`${filler}<table><tbody>${row('a')}${row('b')}${row('c')}</tbody></table>${filler}`,
		);
		window.__dotEditor.$.frameContext.get('topArea').scrollIntoView({ block: 'start' });
	});
	await page.waitForTimeout(200);
	const top = await page.evaluate(
		() => window.__dotEditor.$.frameContext.get('wysiwyg').querySelector('table').getBoundingClientRect().top,
	);
	await scrollBy(page, Math.round(top - 100));
	await page.waitForTimeout(200);
}

/** Scrolls the editor's inner area (the wysiwyg div, or the iframe's window). */
const scrollBy = (page, dy) =>
	page.evaluate((dy) => {
		const fc = window.__dotEditor.$.frameContext;
		const frame = fc.get('wysiwygFrame');
		if (/^iframe$/i.test(frame.nodeName)) frame.contentWindow.scrollBy(0, dy);
		else fc.get('wysiwyg').scrollTop += dy;
	}, dy);

/** Page coords of a cell's center (iframe-local rects shifted by the frame). */
const cellPoint = (page, r, c) =>
	page.evaluate(
		({ r, c }) => {
			const fc = window.__dotEditor.$.frameContext;
			const frame = fc.get('wysiwygFrame');
			const off = /^iframe$/i.test(frame.nodeName) ? frame.getBoundingClientRect() : { left: 0, top: 0 };
			const b = fc.get('wysiwyg').querySelector('table').rows[r].cells[c].getBoundingClientRect();
			return {
				x: Math.round(off.left + (b.left + b.right) / 2),
				y: Math.round(off.top + (b.top + b.bottom) / 2),
			};
		},
		{ r, c },
	);

const dotPoint = (page, selector) =>
	page.evaluate((selector) => {
		const dot = window.__dotEditor.$.frameContext.get('wrapper').querySelector(selector);
		const b = dot.getBoundingClientRect();
		return {
			x: Math.round((b.left + b.right) / 2),
			y: Math.round((b.top + b.bottom) / 2),
			shown: dot.style.display === 'block',
		};
	}, selector);

const CELL_DOT = '.se-table-dot-cell';
const TABLE_DOT = '.se-table-dot-table';

/** Controllers' open/visible state and the table selection. */
const state = (page) =>
	page.evaluate(() => {
		const t = window.__dotEditor.$.plugins.table;
		const s = (c) => ({ open: c.isOpen, shown: c.form.style.display === 'block' });
		return {
			table: s(t.controller_table),
			cell: s(t.controller_cell),
			selected: !!window.__dotEditor.$.frameContext.get('wysiwyg').querySelector('figure.se-component-selected'),
		};
	});

const CLOSED = { open: false, shown: false };

async function clickCell(page, r, c) {
	const p = await cellPoint(page, r, c);
	// the click must land on the cell itself, not on a popup covering it
	const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('td, iframe')?.nodeName, p);
	expect(['TD', 'IFRAME']).toContain(hit);
	await page.mouse.click(p.x, p.y);
	await page.waitForTimeout(300);
}

async function clickDot(page, selector) {
	const d = await dotPoint(page, selector);
	expect(d.shown).toBe(true);
	await page.mouse.click(d.x, d.y);
	await page.waitForTimeout(300);
}

for (const iframe of [false, true]) {
	test(`the cell dot follows an inner scroll (${iframe ? 'iframe' : 'div'})`, async ({ page }) => {
		await make(page, { iframe });
		await clickCell(page, 1, 1);

		const before = await dotPoint(page, CELL_DOT);
		const cellBefore = await cellPoint(page, 1, 1);
		await scrollBy(page, 40);
		await page.waitForTimeout(250);
		const after = await dotPoint(page, CELL_DOT);
		const cellAfter = await cellPoint(page, 1, 1);

		expect(cellBefore.y - cellAfter.y).toBe(40);
		expect(after.shown).toBe(true);
		expect(Math.abs(before.y - after.y - 40)).toBeLessThan(2);
	});
}

test('clicking another cell closes the table popup and keeps the table selected', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, TABLE_DOT);
	expect((await state(page)).table).toEqual({ open: true, shown: true });

	await clickCell(page, 2, 2);
	const s = await state(page);
	expect(s.table).toEqual(CLOSED);
	expect(s.selected).toBe(true);
	expect((await dotPoint(page, TABLE_DOT)).shown).toBe(true);
});

test('clicking the same cell closes the table popup too', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, TABLE_DOT);
	await clickCell(page, 1, 1);

	const s = await state(page);
	expect(s.table).toEqual(CLOSED);
	expect(s.selected).toBe(true);
});

test('clicking another cell closes the cell popup; it stays closed through a scroll', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, CELL_DOT);
	expect((await state(page)).cell).toEqual({ open: true, shown: true });

	await clickCell(page, 0, 0); // above the popup, which opens below the dot
	expect((await state(page)).cell).toEqual(CLOSED);

	await scrollBy(page, 30);
	await page.waitForTimeout(300);
	const s = await state(page);
	expect(s.cell).toEqual(CLOSED);
	expect(s.selected).toBe(true);
});

test('a second dot click closes the popup; it stays closed through a scroll', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, TABLE_DOT);
	await clickDot(page, TABLE_DOT);
	expect((await state(page)).table).toEqual(CLOSED);

	await scrollBy(page, 30);
	await page.waitForTimeout(300);
	const s = await state(page);
	expect(s.table).toEqual(CLOSED);
	expect(s.selected).toBe(true);
});

test('typing closes the cell popup; it stays closed through a scroll', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, CELL_DOT);
	await page.keyboard.type('x');
	await page.waitForTimeout(200);

	await scrollBy(page, 30);
	await page.waitForTimeout(300);
	expect((await state(page)).cell).toEqual(CLOSED);
});

test('Escape closes one level: first the dot popup (the selection stays), then the table selection', async ({
	page,
}) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, TABLE_DOT);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);

	let s = await state(page);
	expect(s.table).toEqual(CLOSED);
	expect(s.selected).toBe(true);
	expect((await dotPoint(page, TABLE_DOT)).shown).toBe(true);

	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	s = await state(page);
	expect(s.selected).toBe(false);
	expect((await dotPoint(page, TABLE_DOT)).shown).toBe(false);
});

test('a cell click keeps the table dot; only the cell UI moves to the new cell', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	const cellDotBefore = await dotPoint(page, CELL_DOT);

	const p = await cellPoint(page, 2, 2);
	await page.mouse.move(p.x, p.y);
	await page.mouse.down();
	await page.waitForTimeout(100);
	const during = { table: await dotPoint(page, TABLE_DOT), cell: await dotPoint(page, CELL_DOT) };
	await page.mouse.up();
	await page.waitForTimeout(300);

	expect(during.table.shown).toBe(true); // like the table controller in the 'table' mode
	expect(during.cell.shown).toBe(false);
	const cellDotAfter = await dotPoint(page, CELL_DOT);
	expect(cellDotAfter.shown).toBe(true);
	expect(cellDotAfter.y).toBeGreaterThan(cellDotBefore.y); // moved down to row 2
});

for (const iframe of [false, true]) {
	test(`the dots move with the wysiwyg scroll in the same tick (${iframe ? 'iframe' : 'div'})`, async ({ page }) => {
		await make(page, { iframe });
		await clickCell(page, 1, 1);

		const r = await page.evaluate(
			() =>
				new Promise((resolve) => {
					const fc = window.__dotEditor.$.frameContext;
					const frame = fc.get('wysiwygFrame');
					const isIframe = /^iframe$/i.test(frame.nodeName);
					const dot = fc.get('wrapper').querySelector('.se-table-dot-cell');
					const cell = fc.get('wysiwyg').querySelector('table').rows[1].cells[1];
					// the frame offset is constant, so the dot-to-cell gap is comparable in iframe mode too
					const gap = () => dot.getBoundingClientRect().top - cell.getBoundingClientRect().top;
					const before = gap();
					const scroller = isIframe ? frame.contentWindow : fc.get('wysiwyg');
					// registered after the core's listener: runs right after it, before any animation frame
					scroller.addEventListener('scroll', () => resolve({ before, during: gap() }), { once: true });
					if (isIframe) frame.contentWindow.scrollBy(0, 40);
					else scroller.scrollTop += 40;
				}),
		);

		expect(Math.abs(r.during - r.before)).toBeLessThan(1);
	});
}

test('a drag-handle hover hides the dots with the other controllers', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);

	const drag = await page.evaluate(() => {
		const handle = window.__dotEditor.$.frameContext.get('wrapper').querySelector('.se-drag-handle');
		const b = handle.getBoundingClientRect();
		return {
			shown: handle.style.display === 'block' && b.width > 0,
			x: Math.round(b.left + b.width / 2),
			y: Math.round(b.top + b.height / 2),
		};
	});
	expect(drag.shown).toBe(true);

	const visibility = () =>
		page.evaluate(() => {
			const w = window.__dotEditor.$.frameContext.get('wrapper');
			return [
				w.querySelector('.se-table-dot-cell').style.visibility,
				w.querySelector('.se-table-dot-table').style.visibility,
			];
		});

	await page.mouse.move(drag.x, drag.y);
	await page.waitForTimeout(150);
	expect(await visibility()).toEqual(['hidden', 'hidden']);

	const away = await cellPoint(page, 2, 2);
	await page.mouse.move(away.x, away.y, { steps: 4 });
	await page.waitForTimeout(150);
	expect(await visibility()).toEqual(['', '']);
});

/** Page coords inside the last paragraph (outside the table). */
const outsidePoint = (page) =>
	page.evaluate(() => {
		const fc = window.__dotEditor.$.frameContext;
		const frame = fc.get('wysiwygFrame');
		const off = /^iframe$/i.test(frame.nodeName) ? frame.getBoundingClientRect() : { left: 0, top: 0 };
		const p = [...fc.get('wysiwyg').querySelectorAll('p')].find((el) => {
			const r = el.getBoundingClientRect();
			return r.top > 0 && r.bottom < 300 && !el.closest('table');
		});
		const r = p.getBoundingClientRect();
		return { x: Math.round(off.left + r.left + 20), y: Math.round(off.top + (r.top + r.bottom) / 2) };
	});

test('after a dot popup opened and closed, a click elsewhere still deselects the table', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, TABLE_DOT);
	await clickDot(page, TABLE_DOT); // closes the popup — the selection stays
	expect((await state(page)).selected).toBe(true);

	const o = await outsidePoint(page);
	await page.mouse.click(o.x, o.y);
	await page.waitForTimeout(300);
	expect((await state(page)).selected).toBe(false);
});

test('with a dot popup open, one click elsewhere closes it and deselects the table', async ({ page }) => {
	await make(page);
	await clickCell(page, 1, 1);
	await clickDot(page, CELL_DOT);
	expect((await state(page)).cell.open).toBe(true);

	const o = await outsidePoint(page);
	await page.mouse.click(o.x, o.y);
	await page.waitForTimeout(300);
	const s = await state(page);
	expect(s.cell).toEqual(CLOSED);
	expect(s.selected).toBe(false);
});
