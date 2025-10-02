module.exports = {
	// Test environment
	testEnvironment: 'jsdom',

	// Test file patterns
	testMatch: ['<rootDir>/test/unit/**/*.spec.js', '<rootDir>/test/unit/**/*.integration.spec.js', '<rootDir>/test/integration/**/*.spec.js', '<rootDir>/test/e2e/**/*.spec.js'],

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

	moduleDirectories: ['node_modules', '<rootDir>'],

	// Module resolution
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},

	// Transform files using Babel
	transform: {
		'^.+\\.js$': 'babel-jest'
	},

	// Ignore
	coveragePathIgnorePatterns: ['<rootDir>/src/assets/icons/defaultIcons.js', '<rootDir>/src/langs/.*\\.js$'],

	// Collect coverage information
	collectCoverageFrom: ['src/**/*.js', '!src/assets/icons/defaultIcons.js', '!src/langs/*.js', '!src/plugins/index.js', '!src/events.js', '!src/typedef.js'],

	// Coverage thresholds (temporarily reduced for development)
	coverageThreshold: {
		global: {
			statements: 85,
			branches: 75,
			functions: 80,
			lines: 85
		}
	},

	projects: [
		{
			displayName: 'unit',
			testMatch: ['<rootDir>/test/unit/**/*.spec.js', '<rootDir>/test/unit/**/*.integration.spec.js'],
			testEnvironment: 'jsdom'
		},
		{
			displayName: 'integration',
			testMatch: ['<rootDir>/test/integration/**/*.spec.js'],
			testEnvironment: 'jsdom'
		},
		{
			displayName: 'e2e',
			testMatch: ['<rootDir>/test/e2e/**/*.spec.js'],
			testEnvironment: 'jsdom'
		}
	],

	// Verbose output
	verbose: true
};
