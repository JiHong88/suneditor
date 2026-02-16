module.exports = {
	// Test environment
	testEnvironment: 'jsdom',
	workerIdleMemoryLimit: '2GB',

	// Test file patterns
	testMatch: ['<rootDir>/test/unit/**/*.spec.js', '<rootDir>/test/integration/**/*.spec.js'],

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

	moduleDirectories: ['node_modules', '<rootDir>'],

	// Module resolution
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},

	// Transform files using Babel (Jest-specific config)
	transform: {
		'^.+\\.js$': [
			'babel-jest',
			{
				presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
				plugins: ['@babel/plugin-transform-class-properties', '@babel/plugin-transform-private-methods'],
			},
		],
	},

	// Ignore
	coveragePathIgnorePatterns: ['<rootDir>/src/assets/icons/defaultIcons.js', '<rootDir>/src/langs/.*\\.js$', '<rootDir>/src/hooks/.*\\.js$', '<rootDir>/src/interfaces/.*\\.js$'],

	// Collect coverage information
	collectCoverageFrom: ['src/**/*.js', '!src/assets/icons/defaultIcons.js', '!src/langs/*.js', '!src/hooks/*.js', '!src/interfaces/*.js', '!src/plugins/index.js', '!src/events.js', '!src/typedef.js'],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			statements: 70,
			branches: 60,
			functions: 80,
			lines: 70,
		},
	},

	// Verbose output
	verbose: false,
};
