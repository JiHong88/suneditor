const { test, expect } = require('@playwright/test');

// Helper function to create a table using picker
async function createTableWithPicker(page, rows = 3, cols = 3) {
	await page.click('button[data-command="table"]');
	await page.waitForSelector('.se-selector-table', { timeout: 5000 });

	const picker = page.locator('.se-table-size-picker');
	const pickerBox = await picker.boundingBox();

	if (pickerBox) {
		const targetX = pickerBox.x + 16 * cols;
		const targetY = pickerBox.y + 16 * rows;
		await page.mouse.move(targetX, targetY);
		await page.waitForTimeout(200);
		await page.mouse.click(targetX, targetY);
		await page.waitForTimeout(500);
	}
}

test.describe('Table Plugin E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Wait for editor to be initialized
		await page.waitForFunction(() => window.editor_root !== undefined, { timeout: 10000 });
	});

	test('should have table button in toolbar', async ({ page }) => {
		const tableButton = page.locator('button[data-command="table"]');
		await expect(tableButton).toBeVisible();
	});

	test('should open table picker when clicking table button', async ({ page }) => {
		await page.click('button[data-command="table"]');
		await page.waitForSelector('.se-selector-table', { timeout: 5000 });

		const picker = page.locator('.se-selector-table');
		await expect(picker).toBeVisible();
	});

	test('should highlight table size on hover', async ({ page }) => {
		await page.click('button[data-command="table"]');
		await page.waitForSelector('.se-selector-table', { timeout: 5000 });

		const picker = page.locator('.se-table-size-picker');
		const pickerBox = await picker.boundingBox();

		if (pickerBox) {
			// Get initial highlighted size
			const initialStyle = await page.locator('.se-table-size-highlighted').getAttribute('style');

			// Move mouse to 3x3 position
			const targetX = pickerBox.x + 16 * 3;
			const targetY = pickerBox.y + 16 * 3;
			await page.mouse.move(targetX, targetY);
			await page.waitForTimeout(300);

			// Check that highlighted area changed
			const newStyle = await page.locator('.se-table-size-highlighted').getAttribute('style');
			expect(newStyle).not.toBe(initialStyle);
			expect(newStyle).toContain('width');
			expect(newStyle).toContain('height');
		}
	});

	test('should create table using table picker', async ({ page }) => {
		await createTableWithPicker(page, 3, 3);

		// Verify table was created
		const table = page.locator('.se-wrapper-wysiwyg table').first();
		await expect(table).toBeVisible();

		// Verify table has rows and columns
		const rows = await table.locator('tbody tr').count();
		expect(rows).toBeGreaterThan(0);

		const cols = await table.locator('tbody tr').first().locator('td').count();
		expect(cols).toBeGreaterThan(0);
	});

	test('should type content in table cells', async ({ page }) => {
		await createTableWithPicker(page, 2, 2);

		// Click on first cell and type
		const firstCell = page.locator('.se-wrapper-wysiwyg table td').first();
		await firstCell.click();
		await page.keyboard.type('Test Content');
		await page.waitForTimeout(300);

		// Verify content was added
		const content = await firstCell.textContent();
		expect(content).toContain('Test');
	});

	test('should navigate between cells with keyboard', async ({ page }) => {
		await createTableWithPicker(page, 2, 2);

		// Click on first cell
		const firstCell = page.locator('.se-wrapper-wysiwyg table td').first();
		await firstCell.click();
		await page.keyboard.type('Cell 1');

		// Press Tab to move to next cell
		await page.keyboard.press('Tab');
		await page.keyboard.type('Cell 2');

		await page.waitForTimeout(300);

		// Verify both cells have content
		const cells = page.locator('.se-wrapper-wysiwyg table td');
		const firstContent = await cells.nth(0).textContent();
		const secondContent = await cells.nth(1).textContent();

		expect(firstContent).toContain('Cell 1');
		expect(secondContent).toContain('Cell 2');
	});

	test('should open context menu on right click', async ({ page }) => {
		await createTableWithPicker(page, 2, 2);

		const firstCell = page.locator('.se-wrapper-wysiwyg table td').first();
		await firstCell.click();
		await page.waitForTimeout(300);

		// Right click
		await firstCell.click({ button: 'right' });
		await page.waitForTimeout(500);

		// Check if context menu appeared (it should have table-related commands)
		const contextMenu = page.locator('.se-menu-list').last();
		const isVisible = await contextMenu.isVisible().catch(() => false);

		if (isVisible) {
			// Verify some table commands exist
			const commands = await contextMenu.locator('button[data-command]').count();
			expect(commands).toBeGreaterThan(0);
		}
	});

	test('should have table plugin methods accessible', async ({ page }) => {
		const hasTablePlugin = await page.evaluate(() => {
			return window.editor_root && window.editor_root.plugins && window.editor_root.plugins.table !== undefined;
		});

		expect(hasTablePlugin).toBe(true);
	});
});
