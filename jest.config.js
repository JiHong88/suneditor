module.exports = {
	// Test environment
	testEnvironment: 'jsdom',

	// Test file patterns
	testMatch: ['<rootDir>/test/unit/**/*.spec.js', '<rootDir>/test/unit/**/*.integration.spec.js', '<rootDir>/test/integration/**/*.spec.js'],

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

	moduleDirectories: ['node_modules', '<rootDir>'],

	// Module resolution
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},

	// Transform files using Babel
	transform: {
		'^.+\\.js$': 'babel-jest',
	},

	// Ignore
	coveragePathIgnorePatterns: ['<rootDir>/src/assets/icons/defaultIcons.js', '<rootDir>/src/langs/.*\\.js$', '<rootDir>/src/hooks/.*\\.js$', '<rootDir>/src/interfaces/.*\\.js$'],

	// Collect coverage information
	collectCoverageFrom: ['src/**/*.js', '!src/assets/icons/defaultIcons.js', '!src/langs/*.js', '!src/hooks/*.js', '!src/interfaces/*.js', '!src/plugins/index.js', '!src/events.js', '!src/typedef.js'],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			statements: 75,
			branches: 65,
			functions: 85,
			lines: 75,
		},
	},

	projects: [
		{
			displayName: 'unit',
			testMatch: ['<rootDir>/test/unit/**/*.spec.js', '<rootDir>/test/unit/**/*.integration.spec.js'],
			testEnvironment: 'jsdom',
		},
		{
			displayName: 'integration',
			testMatch: ['<rootDir>/test/integration/**/*.spec.js'],
			testEnvironment: 'jsdom',
		},
	],

	// Verbose output
	verbose: true,
};
