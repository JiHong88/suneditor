const { test, expect } = require('@playwright/test');

// RTL is a presentation concern: `.se-btn-tray { direction: rtl }` mirrors the module groups and
// `.se-rtl .se-menu-list li { float: right }` mirrors the buttons inside each group. The DOM must
// therefore stay in the order the config declares - reversing it in JS mirrored the groups twice.
// Two paths used to reorder it: `InitOptions` at create time, and `ui.setDir` at runtime.
const BUTTON_LIST = [['undo', 'redo'], '|', ['bold', 'italic'], '/', ['strike', 'subscript']];
const FLAT = ['undo', 'redo', 'bold', 'italic', 'strike', 'subscript'];

async function buildToolbar(page, dir) {
	return page.evaluate(
		({ buttonList, dir }) => {
			const host = document.createElement('div');
			host.id = 'rtl_order_' + dir;
			document.body.appendChild(host);
			window.suneditor.create(host, {
				buttonList: JSON.parse(JSON.stringify(buttonList)),
				textDirection: dir,
			});

			const trays = document.querySelectorAll('.se-btn-tray');
			const tray = trays[trays.length - 1];
			const buttons = Array.from(tray.querySelectorAll('button[data-command]'));
			const rtl = dir === 'rtl';

			return {
				// document order
				dom: buttons.map((b) => b.getAttribute('data-command')),
				// rendered order as a reader of that direction sees it: row by row, then along the flow
				reading: buttons
					.map((b) => {
						const r = b.getBoundingClientRect();
						return { c: b.getAttribute('data-command'), row: Math.round(r.top), x: r.left };
					})
					.sort((a, b) => a.row - b.row || (rtl ? b.x - a.x : a.x - b.x))
					.map((o) => o.c),
				groups: Array.from(tray.querySelectorAll('.se-btn-module')).map((m) =>
					Array.from(m.querySelectorAll('button[data-command]')).map((b) => b.getAttribute('data-command')),
				),
			};
		},
		{ buttonList: BUTTON_LIST, dir },
	);
}

test('RTL keeps the toolbar DOM in config order and mirrors it with CSS only', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.suneditor !== undefined, { timeout: 20000 });

	const ltr = await buildToolbar(page, 'ltr');
	const rtl = await buildToolbar(page, 'rtl');

	// the document is never reordered by direction
	expect(ltr.dom).toEqual(FLAT);
	expect(rtl.dom).toEqual(FLAT);
	expect(rtl.groups).toEqual([
		['undo', 'redo'],
		['bold', 'italic'],
		['strike', 'subscript'],
	]);

	// and both directions read in the order the config declares
	expect(ltr.reading).toEqual(FLAT);
	expect(rtl.reading).toEqual(FLAT);
});

test('switching direction at runtime does not reorder the toolbar either', async ({ page }) => {
	await page.goto('/');
	await page.waitForFunction(() => window.suneditor !== undefined, { timeout: 20000 });

	const read = () =>
		page.evaluate(() => {
			const trays = document.querySelectorAll('.se-btn-tray');
			const tray = trays[trays.length - 1];
			return Array.from(tray.querySelectorAll('button[data-command]')).map((b) => b.getAttribute('data-command'));
		});

	await page.evaluate((buttonList) => {
		const host = document.createElement('div');
		host.id = 'rtl_runtime';
		document.body.appendChild(host);
		window.__ed = window.suneditor.create(host, { buttonList: JSON.parse(JSON.stringify(buttonList)) });
	}, BUTTON_LIST);

	expect(await read()).toEqual(FLAT);

	// `setDir` reordered the tray children on every call, so a round trip left it scrambled
	await page.evaluate(() => window.__ed.resetOptions({ textDirection: 'rtl' }));
	await page.waitForTimeout(300);
	expect(await read()).toEqual(FLAT);

	await page.evaluate(() => window.__ed.resetOptions({ textDirection: 'ltr' }));
	await page.waitForTimeout(300);
	expect(await read()).toEqual(FLAT);
});
