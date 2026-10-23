/**
 * @fileoverview Table / cell properties — border defaults.
 *
 * - A target without its own border opens with width `2` and the editing text color prefilled.
 * - A border picked with the defaults shows on every edge, for any style: `2` beats the 1px default grid in border-collapse.
 */
const { test, expect } = require('@playwright/test');

async function make(page) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 15000 });
	await page.evaluate(() => {
		const { table } = window.editor_root.$.plugins;
		const el = document.createElement('div');
		document.body.prepend(el);
		window.__bEditor = window.suneditor.create(el, {
			plugins: [table.constructor],
			buttonList: [['table']],
			table: { tableControllerPosition: 'table', cellControllerPosition: 'table' },
			height: 'auto',
		});
	});
	await page.waitForTimeout(600);
	await page.evaluate(() => {
		const row = (p) => `<tr>${Array.from({ length: 3 }, (_, i) => `<td><div>${p}${i}</div></td>`).join('')}</tr>`;
		window.__bEditor.$.html.set(
			`<p>before</p><table><tbody>${row('a')}${row('b')}${row('c')}</tbody></table><p>after</p>`,
		);
		window.__bEditor.$.frameContext.get('topArea').scrollIntoView({ block: 'start' });
	});
	await page.waitForTimeout(300);
}

async function clickIn(page, getEl) {
	const p = await page.evaluate((src) => {
		const el = new Function('$', `return ${src}`)(window.__bEditor.$);
		const b = el.getBoundingClientRect();
		return { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) };
	}, getEl);
	await page.mouse.click(p.x, p.y);
	await page.waitForTimeout(300);
}

/** Opens the props on the middle cell — `type`: 'Cell' | 'Table' */
async function openProps(page, type) {
	await clickIn(page, `$.frameContext.get('wysiwyg').querySelectorAll('td')[4]`);
	const ctrl = type === 'Cell' ? 'controller_cell' : 'controller_table';
	await page.waitForFunction((c) => window.__bEditor.$.plugins.table[c].isOpen, ctrl, { timeout: 3000 });
	await clickIn(page, `$.plugins.table.${ctrl}.form.querySelector('[data-command="open${type}Properties"]')`);
	await page.waitForFunction(() => window.__bEditor.$.plugins.table.styleService.controller_props.isOpen, null, {
		timeout: 3000,
	});
}

const inputs = (page) =>
	page.evaluate(() => {
		const { propTargets } = window.__bEditor.$.plugins.table.styleService;
		const textColor = getComputedStyle(window.__bEditor.$.frameContext.get('wysiwyg')).color;
		return {
			width: propTargets.border_width.value,
			color: propTargets.border_color.value,
			style: propTargets.border_style.textContent,
			textColor,
		};
	});

async function pickStyleAndSubmit(page, style) {
	await clickIn(
		page,
		`$.plugins.table.styleService.controller_props.form.querySelector('[data-command="props_onborder_style"]')`,
	);
	await clickIn(
		page,
		`[...$.plugins.table.styleService.selectMenu_props_border.form.querySelectorAll('li')].find((li) => li.textContent.trim() === '${style}')`,
	);
	await clickIn(
		page,
		`$.plugins.table.styleService.controller_props.form.querySelector('[data-command="props_submit"]')`,
	);
}

/**
 * Which edges of a cell paint a dark line — reads screenshot pixels, since the computed width
 * is the specified one, not what border-collapse resolved.
 * @returns {Promise<{top: boolean, right: boolean, bottom: boolean, left: boolean}>}
 */
async function darkEdges(page, selector, index = 0) {
	const box = await page.evaluate(
		({ selector, index }) => {
			const el = window.__bEditor.$.frameContext.get('wysiwyg').querySelectorAll(selector)[index];
			const r = el.getBoundingClientRect();
			return { x: r.left, y: r.top, w: r.width, h: r.height };
		},
		{ selector, index },
	);
	// 21px along the edge, 5px across — long enough to catch a dash of a dashed/dotted line
	const along = (cx, cy, horizontal) =>
		horizontal
			? { x: Math.round(cx) - 10, y: Math.round(cy) - 2, width: 21, height: 5 }
			: { x: Math.round(cx) - 2, y: Math.round(cy) - 10, width: 5, height: 21 };
	const clips = {
		top: along(box.x + box.w / 2, box.y, true),
		right: along(box.x + box.w, box.y + box.h / 2, false),
		bottom: along(box.x + box.w / 2, box.y + box.h, true),
		left: along(box.x, box.y + box.h / 2, false),
	};
	const out = {};
	for (const [edge, clip] of Object.entries(clips)) {
		const png = (await page.screenshot({ clip })).toString('base64');
		out[edge] = await page.evaluate(async (data) => {
			const img = new Image();
			img.src = `data:image/png;base64,${data}`;
			await img.decode();
			const c = document.createElement('canvas');
			c.width = img.width;
			c.height = img.height;
			const ctx = c.getContext('2d');
			ctx.drawImage(img, 0, 0);
			const px = ctx.getImageData(0, 0, c.width, c.height).data;
			for (let i = 0; i < px.length; i += 4) {
				if (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2] < 128) return true;
			}
			return false;
		}, png);
	}
	return out;
}

const deselect = (page) => clickIn(page, `$.frameContext.get('wysiwyg').lastElementChild`);

const toRgb = (hex) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

test('cell props: prefilled 2 and the text color; the border shows on every edge', async ({ page }) => {
	await make(page);
	await openProps(page, 'Cell');

	const v = await inputs(page);
	expect(v.style).toBe('none');
	expect(v.width).toBe('2');
	expect(toRgb(v.color)).toBe(v.textColor);

	await pickStyleAndSubmit(page, 'solid');

	const inline = await page.evaluate(
		() => window.__bEditor.$.frameContext.get('wysiwyg').querySelectorAll('td')[4].style.border,
	);
	expect(inline).toBe(`2px solid ${v.textColor}`);

	await deselect(page);
	expect(await darkEdges(page, 'td', 4)).toEqual({ top: true, right: true, bottom: true, left: true });
});

test('control: a 1px cell border loses its top and left edges to the default grid', async ({ page }) => {
	await make(page);
	await page.evaluate(() => {
		const $ = window.__bEditor.$;
		const color = getComputedStyle($.frameContext.get('wysiwyg')).color;
		$.frameContext.get('wysiwyg').querySelectorAll('td')[4].style.border = `1px solid ${color}`;
	});

	expect(await darkEdges(page, 'td', 4)).toEqual({ top: false, right: true, bottom: true, left: false });
});

test('table props: prefilled 2 and the text color; a dashed border shows on every edge', async ({ page }) => {
	await make(page);
	await openProps(page, 'Table');

	const v = await inputs(page);
	expect(v.width).toBe('2');
	expect(toRgb(v.color)).toBe(v.textColor);

	await pickStyleAndSubmit(page, 'dashed');

	const inline = await page.evaluate(
		() => window.__bEditor.$.frameContext.get('wysiwyg').querySelector('table').style.border,
	);
	expect(inline).toBe(`2px dashed ${v.textColor}`);

	await deselect(page);
	expect(await darkEdges(page, 'table')).toEqual({ top: true, right: true, bottom: true, left: true });
});

test('control: a 1px dashed table border is hidden by the default grid', async ({ page }) => {
	await make(page);
	await page.evaluate(() => {
		const $ = window.__bEditor.$;
		const color = getComputedStyle($.frameContext.get('wysiwyg')).color;
		$.frameContext.get('wysiwyg').querySelector('table').style.border = `1px dashed ${color}`;
	});

	expect(await darkEdges(page, 'table')).toEqual({ top: false, right: false, bottom: false, left: false });
});

test('a cell with its own border keeps it in the props', async ({ page }) => {
	await make(page);
	await page.evaluate(() => {
		window.__bEditor.$.frameContext.get('wysiwyg').querySelectorAll('td')[4].style.border =
			'3px dashed rgb(255, 0, 0)';
	});
	await openProps(page, 'Cell');

	const v = await inputs(page);
	expect(v.style).toBe('dashed');
	expect(v.width).toBe('3px');
	expect(v.color).toBe('#ff0000');
});
