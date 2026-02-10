/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		// 다른 플러그인 import 금지 (같은 플러그인 내부 서브모듈은 허용)
		{
			name: 'plugins-cannot-import-other-plugins',
			severity: 'error',
			from: { path: '^src/plugins/(command|dropdown|modal|browser|field|input|popup)/([^/]+)/.*' },
			to: {
				path: '^src/plugins/(command|dropdown|modal|browser|field|input|popup)/([^/]+)/.*',
				pathNot: [
					// 같은 플러그인 내부는 허용
					'^src/plugins/$1/$2/.*',
				],
			},
		},
		// 플러그인 루트 파일은 index만 import 가능
		{
			name: 'plugins-root-only-import-index',
			severity: 'error',
			from: { path: '^src/plugins/(command|dropdown|modal|browser|field|input|popup)/[^/]+\\.(js|ts)$' },
			to: {
				path: '^src/plugins/',
				pathNot: '^src/plugins/index\\.(js|ts)$',
			},
		},
		// helper
		{
			name: 'helpers-are-leaf',
			severity: 'error',
			from: { path: '^src/helper' },
			to: { pathNot: '^(src/helper)' },
		},
		// plugins
		{
			name: 'modules-no-import-plugins',
			severity: 'error',
			from: { path: '^src/modules' },
			to: { path: '^src/plugins' },
		},
		// modules
		{
			name: 'modules-no-import-core',
			comment: 'modules receive deps via injection ($), must not import core directly',
			severity: 'error',
			from: { path: '^src/modules' },
			to: {
				path: '^src/core',
			},
		},
		{
			name: 'modules-no-barrel-internal',
			severity: 'error',
			from: { path: '^src/modules/(?!index\\.(js|ts)$).*' },
			to: { path: '^src/modules/index\\.(js|ts)$' },
		},
		{
			name: 'no-cycles',
			severity: 'error',
			from: {},
			to: { circular: true },
		},
	],
	options: {
		tsPreCompilationDeps: false,
		doNotFollow: { path: 'node_modules' },
		exclude: {
			path: '(/test/|/dist/|/types/)',
		},
		reporterOptions: { dot: { collapsePattern: 'node_modules/.*' } },
	},
};
