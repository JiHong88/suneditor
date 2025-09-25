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

	// Collect coverage information
	collectCoverageFrom: ['src/**/*.js', '!src/**/*.spec.js'],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
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
