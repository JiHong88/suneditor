module.exports = {
	// Test environment
	testEnvironment: 'jsdom',

	// Test file patterns
	testMatch: ['<rootDir>/test/unit/**/*.spec.js'],

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

	moduleDirectories: ['node_modules', '<rootDir>'],

	// Module resolution
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^../../../../src/helper/env$': '<rootDir>/test/__mocks__/mock_env.js'
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
			testMatch: ['<rootDir>/test/unit/**/*.spec.js'],
			testEnvironment: 'jsdom'
		},
		{
			displayName: 'integration',
			testMatch: ['<rootDir>/test/integration/**/*.spec.js'],
			testEnvironment: 'jsdom'
		}
	],

	// Verbose output
	verbose: true
};
