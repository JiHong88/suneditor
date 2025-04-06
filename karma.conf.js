// Karma configuration
// Generated on Sun May 28 2023 00:10:08 GMT+0900 (대한민국 표준시)

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: ['./test/unit/*.spec.js'],

		// list of files / patterns to exclude
		exclude: [],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
		preprocessors: {
			'./test/**/*.spec.js': ['webpack']
		},

		webpack: {
			mode: 'development'
		},
		plugins: ['karma-jasmine', 'karma-webpack', 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-opera-launcher', 'karma-safari-launcher'],

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
		reporters: ['progress'],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
		// browsers: ['Chrome', 'Firefox', 'Safari', 'Opera', 'IE'],
		browsers: ['Chrome'],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser instances should be started simultaneously
		concurrency: Infinity
	});
};
