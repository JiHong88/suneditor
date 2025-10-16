/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		// No reverse di
		{
			name: 'plugins-cannot-import-plugins-except-index',
			severity: 'error',
			from: { path: '^src/plugins/(?!index\\.(js|ts)$).*' },
			to: { path: '^src/plugins' }
		},
		// helper
		{
			name: 'helpers-are-leaf',
			severity: 'error',
			from: { path: '^src/helper' },
			to: { pathNot: '^(src/helper)' }
		},
		// plugins
		{
			name: 'modules-no-import-plugins',
			severity: 'error',
			from: { path: '^src/modules' },
			to: { path: '^src/plugins' }
		},
		// modules
		{
			name: 'modules-use-coreinjector-only',
			comment: 'modules → core/*, editorInjector/_core 허용. classes/index 금지',
			severity: 'error',
			from: { path: '^src/modules' },
			to: {
				path: '^src/editorInjector/(index|_classes)\\.js'
			}
		},
		{
			name: 'modules-no-barrel-internal',
			severity: 'error',
			from: { path: '^src/modules/(?!index\\.(js|ts)$).*' },
			to: { path: '^src/modules/index\\.(js|ts)$' }
		},
		{
			name: 'no-cycles',
			severity: 'error',
			from: {},
			to: { circular: true }
		}
	],
	options: {
		tsPreCompilationDeps: false,
		doNotFollow: { path: 'node_modules' },
		exclude: {
			path: '(/test/|/dist/|/types/)'
		},
		reporterOptions: { dot: { collapsePattern: 'node_modules/.*' } }
	}
};
