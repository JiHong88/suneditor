const { test, expect } = require('@playwright/test');

for (const iframe of [false, true]) {
	for (const event of ['focus', 'blur']) {
		test(`destroy cancels inline toolbar ${event} work (iframe: ${iframe})`, async ({ page }) => {
			const errors = [];
			page.on('pageerror', (error) => errors.push(error.message));
			await page.goto('/');
			await page.waitForFunction(() => window.editor_root && window.suneditor);
			await page.evaluate(async ({ iframe, event }) => {
				window.editor_root.destroy();
				document.body.innerHTML = '<div id="lifecycle"></div>';
				const editor = window.suneditor.create('#lifecycle', {
					mode: 'inline', buttonList: [['bold']], iframe, iframe_cssFileName: [], value: '<p>text</p>',
				});
				await new Promise((resolve) => setTimeout(resolve, 400));
				const root = editor.$.frameContext.get('wysiwyg');
				root.focus();
				if (event === 'blur') {
					await new Promise((resolve) => setTimeout(resolve, 0));
					root.blur();
				}
				editor.destroy();
				await new Promise((resolve) => setTimeout(resolve, 50));
			}, { iframe, event });
			expect(errors).toEqual([]);
		});
	}
	for (const action of ['deselect', 'destroy']) {
		test(`pending component selection is cancelled on ${action} (iframe: ${iframe})`, async ({ page }) => {
			const errors = [];
			page.on('pageerror', (error) => errors.push(error.message));
			await page.goto('/');
			await page.waitForFunction(() => window.editor_root && window.suneditor);
			const result = await page.evaluate(async ({ iframe, action }) => {
				const HR = window.editor_root.$.plugins.hr.constructor;
				window.editor_root.destroy();
				document.body.innerHTML = '<div id="lifecycle"></div>';
				const editor = window.suneditor.create('#lifecycle', {
					plugins: [HR], buttonList: [['hr']], iframe, iframe_cssFileName: [],
				});
				await new Promise((resolve) => setTimeout(resolve, 400));
				const $ = editor.$;
				$.html.set('<p>before</p><hr><p>after</p>');
				await new Promise((resolve) => setTimeout(resolve, 100));
				const target = $.frameContext.get('wysiwyg').querySelector('hr');
				const manager = $.eventManager;
				const original = manager.addGlobalEvent;
				let registrations = 0;
				manager.addGlobalEvent = function (...args) {
					registrations++;
					return original.apply(this, args);
				};
				try {
					$.component.select(target, 'hr');
					const selected = $.component.isSelected;
					if (action === 'destroy') editor.destroy();
					else $.component.deselect();
					registrations = 0;
					await new Promise((resolve) => setTimeout(resolve, 50));
					return { selected, registrations, selectedClass: target.classList.contains('se-component-selected') };
				} finally {
					manager.addGlobalEvent = original;
					if (action !== 'destroy') editor.destroy();
				}
			}, { iframe, action });
			expect(result).toEqual({ selected: true, registrations: 0, selectedClass: false });
			expect(errors).toEqual([]);
		});
	}
}
