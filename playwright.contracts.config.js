const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
	testDir: './test/browser',
	testMatch: '**/*.spec.js',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 1 : 2,
	reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
	use: {
		baseURL: 'http://127.0.0.1:8089',
		viewport: { width: 1280, height: 900 },
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
	],
	webServer: {
		command: 'npm run dev:browser-tests',
		url: 'http://127.0.0.1:8089',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
