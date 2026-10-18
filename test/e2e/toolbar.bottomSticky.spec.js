const { test, expect } = require('@playwright/test');

// Bottom toolbar on the JS sticky engine (`position: 'fixed'`): while stuck it sits `top` px above the
// viewport bottom, and it must hand over to its natural slot without jumping or sinking below that line.
// The only time it may go lower is the clamp near the editor's top edge (it keeps `minHeight` of content above it).
async function sweep(page, mode, top) {
	await page.goto('/');
	await page.waitForFunction(() => window.editor_root !== undefined && window.suneditor, { timeout: 15000 });
	return page.evaluate(
		async ({ mode, top }) => {
			window.editor_root.destroy();
			document.body.innerHTML =
				'<div style="height:1000px"></div><textarea id="t"></textarea><div style="height:1500px"></div>';
			const ed = window.suneditor.create('#t', {
				mode,
				toolbar_sticky: { top, position: 'fixed' },
				height: '500px',
				buttonList: [['bold', 'italic', 'underline']],
				value: '<p>a</p>'.repeat(80),
			});
			await new Promise((r) => setTimeout(r, 300));
			if (mode.startsWith('inline')) {
				ed.$.frameContext.get('wysiwyg').focus();
				await new Promise((r) => setTimeout(r, 200));
			}

			const tb = ed.$.context.get('toolbar_main');
			const topArea = ed.$.frameContext.get('topArea');
			const minH = ed.$.frameContext.get('_minHeight');
			const vh = innerHeight;
			const bad = [];
			let stuck = false;
			let prev = null;
			for (let y = 0; y <= 1400; y += 4) {
				window.scrollTo(0, y);
				window.dispatchEvent(new Event('scroll'));
				await new Promise((r) => requestAnimationFrame(r));
				const r = tb.getBoundingClientRect();
				const st = tb.classList.contains('se-toolbar-sticky');
				stuck ||= st;
				const clamped = st && Math.abs(r.top - (topArea.getBoundingClientRect().top + minH)) <= 2;
				if (!clamped && r.top < vh && r.bottom > vh - top + 1) bad.push(`y${y}: bottom ${Math.round(r.bottom)}`);
				if (prev !== null && Math.abs(r.bottom - prev) > 6) bad.push(`y${y}: jump ${Math.round(prev)}->${Math.round(r.bottom)}`);
				prev = r.bottom;
			}
			return { stuck, bad };
		},
		{ mode, top },
	);
}

for (const mode of ['classic:bottom', 'inline:bottom']) {
	for (const top of [50, 0]) {
		test(`${mode} sticky top=${top}: no jump, never below the sticky line`, async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			const { stuck, bad } = await sweep(page, mode, top);
			expect(stuck).toBe(true);
			expect(bad).toEqual([]);
		});
	}
}
