const { test, expect } = require('@playwright/test');

for (const iframe of [false, true]) {
	for (const direction of ['ltr', 'rtl']) {
		test(`${iframe ? 'iframe' : 'DIV'} × ${direction}: coordinates, scrolling and direction switch`, async ({
			page,
		}) => {
			const errors = [];
			page.on('pageerror', (error) => errors.push(error.message));
			await page.goto('/');
			await page.evaluate(
				async ({ iframe, direction }) => {
					await window.createBrowserEditor({
						iframe,
						textDirection: direction,
						value: '<p>line</p>'.repeat(6) + '<p>Anchor text</p>' + '<p>line</p>'.repeat(30),
					});
					window.scrollTo(90, 180);
				},
				{ iframe, direction },
			);

			// Exercise both scroll sources with real layout, then reverse direction and restore it.
			for (const [index, dir] of [direction, direction === 'ltr' ? 'rtl' : 'ltr', direction].entries()) {
				await page.evaluate(
					({ dir, index }) => {
						const editor = window.browserEditor;
						editor.resetOptions({ textDirection: dir });
						const fc = editor.$.frameContext;
						const scroll = fc.get('eventWysiwyg');
						if (scroll === fc.get('_ww')) scroll.scrollTo(0, 100 + index * 12);
						else scroll.scrollTop = 100 + index * 12;
					},
					{ dir, index },
				);
				await page.evaluate(
					() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
				);

				const result = await page.evaluate(() => {
					const $ = window.browserEditor.$;
					const fc = $.frameContext;
					const target = fc.get('wysiwyg').querySelectorAll('p')[6];
					const iframeRect = $.frameOptions.get('iframe')
						? fc.get('wysiwygFrame').getBoundingClientRect()
						: { left: 0, top: 0 };
					const raw = target.getBoundingClientRect();
					// Independent oracle: native target rect + frame viewport translation, each exactly once.
					const expected = { left: raw.left + iframeRect.left, top: raw.top + iframeRect.top };
					const global = $.offset.getGlobal(target);
					const range = fc.get('_wd').createRange();
					range.selectNodeContents(target);
					const rawRange = range.getBoundingClientRect();
					const selection = $.selection.getRects(range, 'start').rects;

					const popup = document.createElement('div');
					popup.style.cssText = 'position:absolute;width:120px;height:30px;';
					document.body.appendChild(popup);
					const placed = $.offset.setAbsPosition(popup, target, {
						isWWTarget: true,
						position: 'bottom',
						inst: {},
					});
					const popupRect = popup.getBoundingClientRect();
					const targetRight = raw.right + iframeRect.left;
					const placementError = $.options.get('_rtl')
						? popupRect.right - targetRight
						: popupRect.left - expected.left;
					popup.remove();
					return {
						globalError: [
							global.fixedLeft - expected.left,
							global.fixedTop - expected.top,
							global.left - expected.left - window.scrollX,
							global.top - expected.top - window.scrollY,
						],
						selectionError: [
							selection.left - rawRange.left - iframeRect.left,
							selection.top - rawRange.top - iframeRect.top,
						],
						placementError,
						placed: Boolean(placed),
						dir: $.options.get('_rtl') ? 'rtl' : 'ltr',
						scroll: $.offset.getWWScroll().top,
						hostScroll: [window.scrollX, window.scrollY],
					};
				});
				expect(result.dir).toBe(dir);
				expect(result.scroll).toBeGreaterThan(0);
				expect(result.hostScroll).toEqual([90, 180]);
				for (const delta of [...result.globalError, ...result.selectionError])
					expect(Math.abs(delta)).toBeLessThan(1);
				expect(result.placed).toBe(true);
				expect(Math.abs(result.placementError)).toBeLessThan(2);
			}
			// A narrow target at either viewport edge must keep the entire popup visible.
			for (const side of ['left', 'right']) {
				const edge = await page.evaluate((side) => {
					const $ = window.browserEditor.$;
					const target = $.frameContext.get('wysiwyg').querySelectorAll('p')[6];
					target.style.width = '32px';
					const host = document.getElementById('host');
					host.style.transform = '';
					const left = $.offset.getGlobal(target).fixedLeft;
					const viewportWidth = document.documentElement.clientWidth;
					const desiredLeft = side === 'left' ? 2 : viewportWidth - 34;
					host.style.transform = `translateX(${desiredLeft - left}px)`;
					const popup = document.createElement('div');
					popup.style.cssText = 'position:absolute;width:120px;height:30px;';
					document.body.appendChild(popup);
					const placed = $.offset.setAbsPosition(popup, target, {
						isWWTarget: true,
						position: 'bottom',
						inst: {},
					});
					const rect = popup.getBoundingClientRect();
					const result = { placed: Boolean(placed), left: rect.left, right: rect.right, viewportWidth };
					popup.remove();
					return result;
				}, side);
				expect(edge.placed).toBe(true);
				expect(edge.left).toBeGreaterThanOrEqual(0);
				expect(edge.right).toBeLessThanOrEqual(edge.viewportWidth);
			}
			expect(errors).toEqual([]);
		});
	}
}
