module.exports = {
	// Test environment
	testEnvironment: 'jsdom',

	// Test file patterns
	testMatch: [
		'<rootDir>/test/unit/**/*.spec.js'
	],

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

	// Module resolution
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},

	// Transform files using Babel
	transform: {
		'^.+\\.js$': 'babel-jest'
	},

	// Collect coverage information
	collectCoverageFrom: [
		'src/**/*.js',
		'!src/**/*.spec.js'
	],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	},

	// Verbose output
	verbose: true
};