const { test, expect } = require('@playwright/test');
const { measureEditorWork } = require('./measure-work');
const budgets = require('./performance-budgets.json');

for (const iframe of [false, true]) {
	for (const withAlign of [false, true]) {
		test(`@performance ${iframe ? 'iframe' : 'DIV'}: selection and offsets, align ${withAlign ? 'enabled' : 'disabled'}`, async ({
			page,
			browser,
		}, testInfo) => {
			const fixtures = [];
			const errors = [];
			page.on('pageerror', (error) => errors.push(error.message));
			for (const paragraphs of budgets.paragraphCounts) {
				await page.goto('/');
				await page.evaluate(
					async ({ iframe, withAlign, paragraphs }) => {
						await window.createBrowserEditor({
							iframe,
							withAlign,
							value:
								'<blockquote><p style="text-align:center"><strong><em>nested text</em></strong></p>' +
								'<p style="text-align:right">second line</p></blockquote>' +
								'<p>plain text</p>'.repeat(paragraphs - 2),
						});
					},
					{ iframe, withAlign, paragraphs },
				);
				await page.evaluate(
					() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
				);
				fixtures.push(await page.evaluate(measureEditorWork, budgets));
			}
			const evidence = {
				budgetVersion: budgets.version,
				browser: browser.version(),
				project: testInfo.project.name,
				platform: process.platform,
				architecture: process.arch,
				node: process.version,
				iframe,
				withAlign,
				samples: budgets.samples,
				operationsPerSample: budgets.operationsPerSample,
				fixtures: fixtures.map((fixture) => {
					for (const key of ['selection', 'cachedSelection', 'offset']) {
						const sorted = [...fixture[key].millisecondsPerOperation].sort((a, b) => a - b);
						fixture[key].medianMs = sorted[Math.floor(sorted.length / 2)];
						fixture[key].p95Ms = sorted[Math.ceil(sorted.length * 0.95) - 1];
					}
					return fixture;
				}),
			};
			await testInfo.attach('performance-samples', {
				body: JSON.stringify(evidence, null, 2),
				contentType: 'application/json',
			});
			for (const [index, fixture] of fixtures.entries()) {
				expect(fixture.paragraphCount).toBe(budgets.paragraphCounts[index]);
				expect(fixture.probe).toMatchObject({
					rootQueries: 1,
					rootSerializations: 2,
					rootWalkers: 1,
					rectReads: 1,
				});
				expect(fixture.selectionResult).toEqual({ correctNode: true, align: withAlign ? 'right' : null });
				for (const key of ['selection', 'cachedSelection', 'offset']) {
					const { counts, operations } = fixture[key];
					expect(operations).toBe(budgets.samples * budgets.operationsPerSample);
					expect(counts).toMatchObject({
						rootQueries: 0,
						rootSerializations: 0,
						rootWalkers: 0,
						historyPushes: 0,
					});
					if (key !== 'selection' || !withAlign) expect(counts.activeCalls).toBe(0);
				}
				const { counts, operations } = fixture.selection;
				if (withAlign) expect(counts.activeCalls).toBeGreaterThan(0);
				expect(counts.activeCalls / operations).toBeLessThanOrEqual(
					budgets.selection.maxActiveCallsPerOperation,
				);
				expect(counts.rectReads / operations).toBeLessThanOrEqual(budgets.selection.maxRectReadsPerOperation);
				expect(fixture.cachedSelection.counts.rectReads).toBe(0);
				expect(fixture.offset.counts.rectReads).toBeGreaterThan(0);
				expect(fixture.offset.counts.rectReads / fixture.offset.operations).toBeLessThanOrEqual(
					budgets.offset.maxRectReadsPerOperation[iframe ? 'iframe' : 'div'],
				);
			}
			for (const key of ['selection', 'cachedSelection', 'offset']) {
				for (const metric of Object.keys(fixtures[0][key].counts)) {
					expect(
						fixtures[1][key].counts[metric],
						`${key}.${metric} must not grow with document size`,
					).toBeLessThanOrEqual(fixtures[0][key].counts[metric] * budgets.maxLargeDocumentCountGrowth);
				}
			}
			expect(errors).toEqual([]);
		});
	}
}
