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

test('clicking a handle opens the row menu on the grip', async ({ page }) => {
	await setup(page);

	const g = await page.evaluate(() => {
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		figure.scrollIntoView({ block: 'center' });
		const r = figure.querySelector('table').rows[1].cells[0].getBoundingClientRect();
		return { x: Math.round((r.left + r.right) / 2), y: Math.round((r.top + r.bottom) / 2) };
	});

	// hover to show the handles, then click the row handle
	await page.mouse.move(g.x + 20, g.y + 5);
	await page.mouse.move(g.x, g.y, { steps: 4 });
	await page.waitForTimeout(300);
	const handleRect = await page.evaluate(() => {
		const r = document.querySelector('.se-table-move-handle-row').getBoundingClientRect();
		return { left: r.left };
	});
	await page.mouse.click(Math.round(handleRect.left + 10), g.y);
	await page.waitForTimeout(300);

	const state = await page.evaluate(() => {
		const menu = window.editor_root.$.plugins.table.gridService.selectMenu_row_handle;
		const rect = menu.form.getBoundingClientRect();
		const anchor = document.querySelector('.se-table-move-handle-row .se-table-move-grip').getBoundingClientRect();
		return {
			isOpen: menu.isOpen,
			visible: getComputedStyle(menu.form).display === 'block' && rect.width > 0,
			nearAnchor: Math.abs(rect.top - anchor.bottom) < 40,
			selected: document.querySelectorAll('.se-selected-table-cell').length,
		};
	});

	expect(state.isOpen).toBe(true);
	expect(state.visible).toBe(true);
	expect(state.nearAnchor).toBe(true);
	expect(state.selected).toBeGreaterThan(0); // the band stays selected under the open menu

	// pick "Cell properties" — the props controller must open on the cell, and the menu closes
	const propsItem = await page.evaluate(() => {
		const menu = window.editor_root.$.plugins.table.gridService.selectMenu_row_handle;
		const r = menu.menus[0].getBoundingClientRect();
		return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
	});
	await page.mouse.click(propsItem.x, propsItem.y);
	await page.waitForTimeout(300);

	const props = await page.evaluate(() => {
		const table = window.editor_root.$.plugins.table;
		const form = table.styleService.controller_props.form;
		const rect = form.getBoundingClientRect();
		const anchorRect = document.querySelector('.se-table-move-handle-row .se-table-move-grip').getBoundingClientRect();
		return {
			visible: form.style.display === 'block' && rect.width > 0,
			nearHandle: Math.abs(rect.top - anchorRect.bottom) < 60 && Math.abs(rect.left - anchorRect.left) < 300,
			menuClosed: !table.gridService.selectMenu_row_handle.isOpen,
		};
	});
	expect(props.visible).toBe(true);
	expect(props.nearHandle).toBe(true);
	expect(props.menuClosed).toBe(true);
});

test('a menu move keeps the pin and the grip follows immediately', async ({ page }) => {
	await setup(page);

	const g = await page.evaluate(() => {
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		figure.scrollIntoView({ block: 'center' });
		const r = figure.querySelector('table').rows[0].cells[0].getBoundingClientRect();
		return { x: Math.round((r.left + r.right) / 2), y: Math.round((r.top + r.bottom) / 2) };
	});

	// pin row 0
	await page.mouse.move(g.x + 20, g.y + 5);
	await page.mouse.move(g.x, g.y, { steps: 4 });
	await page.waitForTimeout(300);
	const hLeft = await page.evaluate(
		() => document.querySelector('.se-table-move-handle-row').getBoundingClientRect().left,
	);
	await page.mouse.click(Math.round(hLeft + 10), g.y);
	await page.waitForTimeout(300);

	// menu: "Move row down"
	const item = await page.evaluate(() => {
		const menu = window.editor_root.$.plugins.table.gridService.selectMenu_row_handle;
		const idx = menu.items.indexOf('move-down');
		const r = menu.menus[idx].getBoundingClientRect();
		return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
	});
	await page.mouse.click(item.x, item.y);
	await page.waitForTimeout(300);

	const after = await page.evaluate(() => {
		const rowHandle = document.querySelector('.se-table-move-handle-row');
		const firstRowText = document.querySelector('.se-wrapper-wysiwyg table').rows[0].cells[0].textContent;
		return {
			active: rowHandle.classList.contains('active'),
			display: rowHandle.style.display,
			gripStart: rowHandle.style.getPropertyValue('--se-table-grip-start'),
			firstRowText,
			selected: document.querySelectorAll('.se-selected-table-cell').length,
		};
	});

	expect(after.firstRowText).toBe('b0'); // row a moved down
	expect(after.active).toBe(true);
	expect(after.display).toBe('block');
	expect(parseFloat(after.gripStart)).toBeGreaterThan(0); // grip followed to row 1
	expect(after.selected).toBeGreaterThan(0);
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

test('the pinned handle menu follows an inner wysiwyg scroll and hides while its grip is off-screen', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });

	// a table between long filler, inside a fixed-height (inner-scrolling) wysiwyg
	const scrollable = await page.evaluate(() => {
		const row = (p) => `<tr>${Array.from({ length: 4 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		const filler = Array.from({ length: 30 }, (_, i) => `<p>line ${i}</p>`).join('');
		window.editor_root.$.html.set(`${filler}<table><tbody>${row('a')}${row('b')}${row('c')}</tbody></table>${filler}`);
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		ww.style.height = '320px';
		ww.style.overflowY = 'auto';
		ww.scrollIntoView({ block: 'center' });
		const figure = ww.querySelector('figure');
		ww.scrollTop += figure.getBoundingClientRect().top - ww.getBoundingClientRect().top - 100;
		return ww.scrollHeight > ww.clientHeight;
	});
	expect(scrollable).toBe(true);
	await page.waitForTimeout(200);

	const g = await page.evaluate(() => {
		const r = document.querySelector('.se-wrapper-wysiwyg table').rows[1].cells[0].getBoundingClientRect();
		return { x: Math.round((r.left + r.right) / 2), y: Math.round((r.top + r.bottom) / 2) };
	});
	await page.mouse.move(g.x + 20, g.y + 5);
	await page.mouse.move(g.x, g.y, { steps: 4 });
	await page.waitForTimeout(300);
	const hLeft = await page.evaluate(
		() => document.querySelector('.se-table-move-handle-row').getBoundingClientRect().left,
	);
	await page.mouse.click(Math.round(hLeft + 10), g.y);
	await page.waitForTimeout(300);

	const read = () =>
		page.evaluate(() => {
			const menu = window.editor_root.$.plugins.table.gridService.selectMenu_row_handle;
			const m = menu.form.getBoundingClientRect();
			const grip = document.querySelector('.se-table-move-handle-row .se-table-move-grip').getBoundingClientRect();
			return {
				isOpen: menu.isOpen,
				shown: m.width > 0 && m.height > 0,
				menuTop: m.top,
				gripBottom: grip.bottom,
				pinned: document.querySelector('.se-table-move-handle-row').classList.contains('active'),
			};
		});

	const before = await read();
	expect(before.isOpen).toBe(true);
	expect(before.shown).toBe(true);
	expect(Math.abs(before.menuTop - before.gripBottom)).toBeLessThan(6);

	// scroll the wysiwyg a little — the pin and the menu stay, and the menu keeps to the grip
	await page.evaluate(() => (document.querySelector('.se-wrapper-wysiwyg').scrollTop += 40));
	await page.waitForTimeout(250);
	const moved = await read();
	expect(moved.pinned).toBe(true);
	expect(moved.isOpen).toBe(true);
	expect(moved.shown).toBe(true);
	expect(before.gripBottom - moved.gripBottom).toBeGreaterThan(30); // the grip really moved
	expect(Math.abs(moved.menuTop - moved.gripBottom)).toBeLessThan(6);

	// scroll the band out of the editor's view — the menu hides but stays open
	const shownTop = await page.evaluate(() => {
		const ww = document.querySelector('.se-wrapper-wysiwyg');
		const top = ww.scrollTop;
		ww.scrollTop += 1200;
		return top;
	});
	await page.waitForTimeout(250);
	const away = await read();
	expect(away.isOpen).toBe(true);
	expect(away.shown).toBe(false);

	// and comes back on the grip when scrolled back — to the recorded spot: `+= 1200` clamps at the
	// bottom, so `-= 1200` would land lower, with the grip at the view's edge
	await page.evaluate((top) => (document.querySelector('.se-wrapper-wysiwyg').scrollTop = top), shownTop);
	await page.waitForTimeout(250);
	const back = await read();
	expect(back.isOpen).toBe(true);
	expect(back.shown).toBe(true);
	expect(Math.abs(back.menuTop - back.gripBottom)).toBeLessThan(6);
});

for (const iframe of [false, true]) {
	test(`a pinned strip and its menu move with the wysiwyg scroll in the same tick (${iframe ? 'iframe' : 'div'})`, async ({ page }) => {
		await page.goto('/');
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
		await page.evaluate((iframe) => {
			const Table = window.editor_root.$.plugins.table.constructor;
			const el = document.createElement('div');
			document.body.prepend(el);
			window.__pinEditor = window.suneditor.create(el, { plugins: [Table], buttonList: [['table']], iframe, height: '320px' });
		}, iframe);
		await page.waitForTimeout(600);
		await page.evaluate(() => {
			const row = (p) => `<tr>${Array.from({ length: 4 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
			const filler = Array.from({ length: 30 }, (_, i) => `<p>line ${i}</p>`).join('');
			window.__pinEditor.$.html.set(`${filler}<table><tbody>${row('a')}${row('b')}${row('c')}</tbody></table>${filler}`);
			window.__pinEditor.$.frameContext.get('topArea').scrollIntoView({ block: 'start' });
		});
		await page.waitForTimeout(200);
		await page.evaluate(() => {
			const fc = window.__pinEditor.$.frameContext;
			const frame = fc.get('wysiwygFrame');
			const top = fc.get('wysiwyg').querySelector('table').getBoundingClientRect().top;
			if (/^iframe$/i.test(frame.nodeName)) frame.contentWindow.scrollBy(0, Math.round(top - 100));
			else fc.get('wysiwyg').scrollTop += Math.round(top - 100);
		});
		await page.waitForTimeout(200);

		const cell = await page.evaluate(() => {
			const fc = window.__pinEditor.$.frameContext;
			const frame = fc.get('wysiwygFrame');
			const off = /^iframe$/i.test(frame.nodeName) ? frame.getBoundingClientRect() : { left: 0, top: 0 };
			const b = fc.get('wysiwyg').querySelector('table').rows[1].cells[1].getBoundingClientRect();
			return { x: Math.round(off.left + (b.left + b.right) / 2), y: Math.round(off.top + (b.top + b.bottom) / 2) };
		});
		await page.mouse.click(cell.x, cell.y); // click-select: the strips show
		await page.mouse.move(cell.x + 5, cell.y, { steps: 3 });
		await page.waitForTimeout(300);
		const h = await page.evaluate(() => {
			const r = window.__pinEditor.$.frameContext.get('wrapper').querySelector('.se-table-move-handle-row').getBoundingClientRect();
			return { x: Math.round((r.left + r.right) / 2), shown: r.width > 0 };
		});
		expect(h.shown).toBe(true);
		await page.mouse.click(h.x, cell.y); // pin + menu
		await page.waitForTimeout(300);

		const r = await page.evaluate(
			() =>
				new Promise((resolve) => {
					const $ = window.__pinEditor.$;
					const fc = $.frameContext;
					const frame = fc.get('wysiwygFrame');
					const isIframe = /^iframe$/i.test(frame.nodeName);
					const strip = fc.get('wrapper').querySelector('.se-table-move-handle-row');
					const grip = strip.querySelector('.se-table-move-grip');
					const menu = $.plugins.table.gridService.selectMenu_row_handle.form;
					const row = fc.get('wysiwyg').querySelector('table').rows[1];
					const read = () => ({
						strip: grip.getBoundingClientRect().top - row.getBoundingClientRect().top,
						menu: menu.getBoundingClientRect().top - grip.getBoundingClientRect().bottom,
					});
					const before = read();
					const scroller = isIframe ? frame.contentWindow : fc.get('wysiwyg');
					scroller.addEventListener('scroll', () => resolve({ before, during: read(), open: menu.getBoundingClientRect().width > 0 }), { once: true });
					if (isIframe) frame.contentWindow.scrollBy(0, 40);
					else scroller.scrollTop += 40;
				}),
		);

		expect(r.open).toBe(true);
		expect(Math.abs(r.during.strip - r.before.strip)).toBeLessThan(1);
		expect(Math.abs(r.during.menu - r.before.menu)).toBeLessThan(1);
	});
}

test('a table hover-selected and then used through the pin menu deselects on a click elsewhere', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => {
		const Table = window.editor_root.$.plugins.table.constructor;
		const el = document.createElement('div');
		document.body.prepend(el);
		window.__hoverEditor = window.suneditor.create(el, { plugins: [Table], buttonList: [['table']], height: '420px' });
	});
	await page.waitForTimeout(600);
	await page.evaluate(() => {
		const row = (p) => `<tr>${Array.from({ length: 4 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		window.__hoverEditor.$.html.set(`<p>before text</p><table><tbody>${row('a')}${row('b')}</tbody></table><p>after text here</p><p>more</p>`);
		window.__hoverEditor.$.frameContext.get('topArea').scrollIntoView({ block: 'start' });
	});
	await page.waitForTimeout(300);

	const selected = () =>
		page.evaluate(() => !!window.__hoverEditor.$.frameContext.get('wysiwyg').querySelector('figure.se-component-selected'));
	const c = await page.evaluate(() => {
		const r = window.__hoverEditor.$.frameContext.get('wysiwyg').querySelector('table').rows[1].cells[1].getBoundingClientRect();
		return { x: Math.round((r.left + r.right) / 2), y: Math.round((r.top + r.bottom) / 2) };
	});

	// hover only (no click), then pin through the row handle and dismiss the menu
	await page.mouse.move(c.x + 20, c.y + 5);
	await page.mouse.move(c.x, c.y, { steps: 5 });
	await page.waitForTimeout(300);
	const h = await page.evaluate(() => {
		const r = window.__hoverEditor.$.frameContext.get('wrapper').querySelector('.se-table-move-handle-row').getBoundingClientRect();
		return { x: Math.round((r.left + r.right) / 2) };
	});
	await page.mouse.click(h.x, c.y);
	await page.waitForTimeout(300);
	expect(await page.evaluate(() => window.__hoverEditor.$.plugins.table.gridService.selectMenu_row_handle.isOpen)).toBe(true);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);

	const p = await page.evaluate(() => {
		const r = window.__hoverEditor.$.frameContext.get('wysiwyg').querySelector('p:last-child').getBoundingClientRect();
		return { x: Math.round(r.left + 20), y: Math.round((r.top + r.bottom) / 2) };
	});
	await page.mouse.click(p.x, p.y);
	await page.waitForTimeout(400);
	expect(await selected()).toBe(false);
});

test('a drag move leaves a plain cell range selection — no pin, cell dot shown, handles follow the hover', async ({ page }) => {
	await setup(page);

	const g = await page.evaluate(() => {
		const figure = document.querySelector('.se-wrapper-wysiwyg figure');
		figure.scrollIntoView({ block: 'center' });
		const rows = figure.querySelector('table').rows;
		const mid = (r) => ({ x: Math.round((r.left + r.right) / 2), y: Math.round((r.top + r.bottom) / 2) });
		return { r0: mid(rows[0].cells[0].getBoundingClientRect()), r2: mid(rows[2].cells[0].getBoundingClientRect()) };
	});

	// hover row 0, then drag its handle onto row 2
	await page.mouse.move(g.r0.x + 20, g.r0.y + 5);
	await page.mouse.move(g.r0.x, g.r0.y, { steps: 4 });
	await page.waitForTimeout(300);
	const hx = await page.evaluate(() =>
		Math.round(document.querySelector('.se-table-move-handle-row').getBoundingClientRect().left + 10),
	);
	await page.mouse.move(hx, g.r0.y);
	await page.mouse.down();
	await page.mouse.move(hx, g.r2.y, { steps: 6 });
	await page.mouse.up();
	await page.waitForTimeout(300);

	const after = await page.evaluate(() => {
		const table = document.querySelector('.se-wrapper-wysiwyg table');
		const plugin = window.editor_root.$.plugins.table;
		const cellDot = plugin.dotService.cellDot;
		return {
			lastRowText: table.rows[2].cells[0].textContent,
			active: !!document.querySelector('.se-table-move-handle-row.active, .se-table-move-handle-column.active'),
			pinned: plugin.handleService.isPinned(),
			selectedInMovedRow: table.rows[2].querySelectorAll('.se-selected-table-cell').length,
			cellDotShown: !!cellDot && cellDot.isOpen && cellDot.form.style.display === 'block',
			menuOpen: plugin.gridService.selectMenu_row_handle.isOpen,
			gripStart: parseFloat(
				document.querySelector('.se-table-move-handle-row').style.getPropertyValue('--se-table-grip-start'),
			),
		};
	});

	expect(after.lastRowText).toBe('a0'); // row a moved to the bottom
	expect(after.active).toBe(false);
	expect(after.pinned).toBe(false);
	expect(after.selectedInMovedRow).toBeGreaterThan(0); // the moved band stays selected
	expect(after.cellDotShown).toBe(true); // like a cell range selection
	expect(after.menuOpen).toBe(false);

	// the handles follow the hover again: hovering row 0 moves the grip up from the moved (last) row
	await page.mouse.move(g.r0.x + 20, g.r0.y + 5, { steps: 4 });
	await page.mouse.move(g.r0.x, g.r0.y, { steps: 4 });
	await page.waitForTimeout(200);
	const gripStart = await page.evaluate(() =>
		parseFloat(document.querySelector('.se-table-move-handle-row').style.getPropertyValue('--se-table-grip-start')),
	);
	expect(gripStart).toBeLessThan(after.gripStart);
});
