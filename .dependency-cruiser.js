// Exact, existing ownership edges; these are not exemptions for an entire service.
// ui -> commandDispatcher imports COMMAND_BUTTONS, not a service instance.
const logicOwnedImports = [
	['shell/commandDispatcher', ['shell/_commandExecutor']],
	['shell/ui', ['panel/blockHandle', 'shell/commandDispatcher']],
	['panel/blockHandle', ['panel/blockResolver']],
];
const logicFile = (name) => `^src/core/logic/${name}\\.js$`;
const pluginPath = '^src/plugins/(command|dropdown|modal|browser|field|input|popup)/([^/.]+)(?:/|\\.(?:js|ts)$)';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		// 다른 플러그인 import 금지 (같은 플러그인 내부 서브모듈은 허용)
		{
			name: 'plugins-cannot-import-other-plugins',
			severity: 'error',
			from: { path: pluginPath },
			to: {
				path: pluginPath,
				pathNot: '^src/plugins/$1/$2(?:/|\\.(?:js|ts)$)',
			},
		},
		// A plugin must not bypass isolation through the public barrel.
		{
			name: 'plugins-no-barrel-internal',
			severity: 'error',
			from: { path: pluginPath },
			to: { path: '^src/plugins/index\\.(js|ts)$' },
		},
		{
			name: 'plugins-no-import-logic',
			comment: 'Access core services through injected $, not direct imports.',
			severity: 'error',
			from: { path: '^src/plugins/' },
			to: { path: '^src/core/logic/' },
		},
		{
			name: 'logic-no-service-imports',
			severity: 'error',
			from: { path: '^src/core/logic/', pathNot: logicOwnedImports.map(([owner]) => logicFile(owner)) },
			to: { path: '^src/core/logic/' },
		},
		...logicOwnedImports.map(([owner, owned]) => ({
			name: `logic-no-service-imports-${owner.replace('/', '-')}`,
			severity: 'error',
			from: { path: logicFile(owner) },
			to: { path: '^src/core/logic/', pathNot: owned.map(logicFile) },
		})),
		// helper
		{
			name: 'helpers-are-leaf',
			severity: 'error',
			from: { path: '^src/helper/' },
			to: { pathNot: '^src/helper/' },
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
