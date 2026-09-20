/**
 * @fileoverview Regression: table move handles must survive the pointer crossing from a
 * cell onto a handle strip — including while the figure is x-scrolled.
 *
 * Root cause guarded here: `select()` adds `se-component-selected` in a deferred
 * setTimeout. A mousemove processed before that timer fired made `hoverSelect` read
 * "not selected" and churn through a full deselect/re-select — `componentDeselect` reset
 * the table plugin's state and hid the move handles. With the pointer already on the
 * handle strip (outside the wysiwyg) no further mousemove arrived to re-show them, so
 * the handles vanished exactly when the user reached for them. The race window depends
 * on main-thread load (scroll listeners widen it), which made it intermittent and worse
 * with x-scrolled figures.
 */
const { test, expect } = require('@playwright/test');

async function setup(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });

	await page.evaluate(() => {
		const row = (p) =>
			`<tr>${Array.from({ length: 8 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		window.editor_root.$.html.set(
			`<p>before</p><table><tbody>${row('a')}${row('b')}${row('c')}</tbody></table><p>after</p>`,
		);
	});
	await page.waitForTimeout(200);
}

test('hover-select does not churn while the deferred selected-class is pending', async ({ page }) => {
	await setup(page);

	// Two synchronous hoverSelect calls — the 2nd lands inside the deferred-class window,
	// which is exactly what a fast mousemove does. It must NOT trigger a deselect cycle.
	const churn = await page.evaluate(() => {
		const $ = window.editor_root.$;
		const plugin = $.plugins.table;
		let deselects = 0;
		const orig = plugin.componentDeselect.bind(plugin);
		plugin.componentDeselect = (...args) => {
			deselects++;
			return orig(...args);
		};

		const td = document.querySelector('.se-wrapper-wysiwyg td');
		$.component.hoverSelect(td);
		$.component.hoverSelect(td);

		plugin.componentDeselect = orig;
		return deselects;
	});

	expect(churn).toBe(0);
});

test('hover restores a stripped selected-class without churning (post-resize state)', async ({ page }) => {
	await setup(page);

	// The resize guide removes `se-component-selected` mid-drag while the component stays
	// the current selection. The next hover must restore the class — not skip it (handles
	// would never reappear), and not churn through deselect/re-select either.
	const res = await page.evaluate(() => {
		const $ = window.editor_root.$;
		const plugin = $.plugins.table;
		let deselects = 0;
		const orig = plugin.componentDeselect.bind(plugin);
		plugin.componentDeselect = (...args) => {
			deselects++;
			return orig(...args);
		};

		const td = document.querySelector('.se-wrapper-wysiwyg td');
		$.component.hoverSelect(td);
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		figure.classList.remove('se-component-selected'); // what the resize guide does
		$.component.hoverSelect(td);

		plugin.componentDeselect = orig;
		return { deselects, selected: figure.classList.contains('se-component-selected') };
	});

	expect(res.deselects).toBe(0);
	expect(res.selected).toBe(true);
});

test('overshooting the column strip onto a pre above recovers within the grace window', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => {
		const row = (p) => `<tr>${Array.from({ length: 4 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		window.editor_root.$.html.set(`<pre>code\ncode2</pre><table><tbody>${row('a')}${row('b')}</tbody></table><p>after</p>`);
	});
	await page.waitForTimeout(200);

	const g = await page.evaluate(() => {
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		figure.scrollIntoView({ block: 'center' });
		const t = figure.querySelector('table');
		const r = t.rows[0].cells[1].getBoundingClientRect();
		return { x: Math.round((r.left + r.right) / 2), cellY: Math.round((r.top + r.bottom) / 2), tableTop: t.getBoundingClientRect().top };
	});

	// hover a cell → handles appear
	await page.mouse.move(g.x + 20, g.cellY + 5);
	await page.mouse.move(g.x, g.cellY, { steps: 4 });
	await page.waitForTimeout(250);

	// cross up through the strip and OVERSHOOT a few px onto the pre — this used to
	// hover-deselect and hide the handles for good
	for (let y = Math.round(g.tableTop + 6); y >= Math.round(g.tableTop - 36); y -= 3) {
		await page.mouse.move(g.x, y);
		await page.waitForTimeout(15);
	}
	// come back down onto the strip within the grace window
	await page.mouse.move(g.x, Math.round(g.tableTop - 12), { steps: 2 });
	await page.waitForTimeout(60);

	const after = await page.evaluate(() => ({
		colHandle: document.querySelector('.se-table-move-handle-column')?.style.display,
	}));
	expect(after.colHandle).toBe('block');
});

test('handles survive crossing onto the row strip in an x-scrolled figure', async ({ page }) => {
	await setup(page);

	// Make the figure a real x-scroll container, scrolled to the end.
	const geo = await page.evaluate(() => {
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		figure.style.width = '300px';
		for (const td of figure.querySelectorAll('td')) td.style.minWidth = '90px';
		figure.scrollIntoView({ block: 'center' });
		figure.scrollLeft = figure.scrollWidth;
		const fr = figure.getBoundingClientRect();
		const rb = figure.querySelector('table').rows[1].getBoundingClientRect();
		return { figLeft: fr.left, rowBMid: (rb.top + rb.bottom) / 2, scrollLeft: figure.scrollLeft };
	});
	expect(geo.scrollLeft).toBeGreaterThan(0);

	const y = Math.round(geo.rowBMid);

	// hover a visible cell so the handles appear
	await page.mouse.move(Math.round(geo.figLeft + 120), y);
	await page.mouse.move(Math.round(geo.figLeft + 60), y, { steps: 6 });
	await page.waitForTimeout(250);

	// cross left onto the row strip
	for (let x = Math.round(geo.figLeft + 58); x >= Math.round(geo.figLeft - 16); x -= 2) {
		await page.mouse.move(x, y);
		await page.waitForTimeout(20);
	}

	const after = await page.evaluate(() => {
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		return {
			selected: figure.classList.contains('se-component-selected'),
			rowHandle: document.querySelector('.se-table-move-handle-row')?.style.display,
		};
	});

	expect(after.selected).toBe(true);
	expect(after.rowHandle).toBe('block');
});
