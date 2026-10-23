const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const cli = path.join(root, 'node_modules/dependency-cruiser/bin/dependency-cruise.mjs');

// Run the real checker on a resolved graph, not just regexes from its configuration.
function cruise(from, to) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'suneditor-architecture-'));
	try {
		for (const file of [from, to]) fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
		const relative = path.posix.relative(path.posix.dirname(from), to);
		fs.writeFileSync(
			path.join(directory, from),
			`import '${relative.startsWith('.') ? relative : `./${relative}`}';`,
		);
		fs.writeFileSync(path.join(directory, to), 'export const value = 1;');
		const result = spawnSync(
			process.execPath,
			[cli, '--config', path.join(root, '.dependency-cruiser.js'), '--output-type', 'json', 'src'],
			{
				cwd: directory,
				encoding: 'utf8',
				timeout: 15000,
			},
		);
		assert.ifError(result.error);
		assert.ok([0, 1].includes(result.status), result.stderr);
		const report = JSON.parse(result.stdout);
		assert.ok(
			report.modules.every((module) => module.dependencies.every((dependency) => !dependency.couldNotResolve)),
			'fixture imports must resolve',
		);
		assert.equal(report.summary.totalCruised, 2);
		return report.summary.violations.map((violation) => violation.rule.name);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

const forbidden = [
	[
		'L3 sibling services',
		'src/core/logic/dom/html.js',
		'src/core/logic/dom/selection.js',
		'logic-no-service-imports',
	],
	[
		'an owner importing an unrelated service',
		'src/core/logic/shell/ui.js',
		'src/core/logic/dom/html.js',
		'logic-no-service-imports-shell-ui',
	],
	[
		'a helper importing its owner',
		'src/core/logic/panel/blockResolver.js',
		'src/core/logic/panel/blockHandle.js',
		'logic-no-service-imports',
	],
	[
		'root plugin to root plugin',
		'src/plugins/command/alpha.js',
		'src/plugins/command/beta.js',
		'plugins-cannot-import-other-plugins',
	],
	[
		'directory plugin to root plugin',
		'src/plugins/modal/alpha/index.js',
		'src/plugins/command/beta.js',
		'plugins-cannot-import-other-plugins',
	],
	[
		'root plugin to directory plugin',
		'src/plugins/command/alpha.js',
		'src/plugins/modal/beta/index.js',
		'plugins-cannot-import-other-plugins',
	],
	[
		'same name in a different family',
		'src/plugins/command/alpha/index.js',
		'src/plugins/modal/alpha/index.js',
		'plugins-cannot-import-other-plugins',
	],
	['plugin barrel bypass', 'src/plugins/modal/alpha/index.js', 'src/plugins/index.js', 'plugins-no-barrel-internal'],
	[
		'plugin directly importing a service',
		'src/plugins/command/alpha.js',
		'src/core/logic/dom/html.js',
		'plugins-no-import-logic',
	],
	[
		'module directly importing core',
		'src/modules/ui/Example.js',
		'src/core/logic/dom/html.js',
		'modules-no-import-core',
	],
	['helper importing a higher layer', 'src/helper/example.js', 'src/modules/ui/Example.js', 'helpers-are-leaf'],
];
for (const [name, from, to, rule] of forbidden) {
	test(`rejects ${name}`, () => assert.ok(cruise(from, to).includes(rule), `expected ${rule}`));
}

const allowed = [
	['owned command executor', 'src/core/logic/shell/commandDispatcher.js', 'src/core/logic/shell/_commandExecutor.js'],
	['owned block handle', 'src/core/logic/shell/ui.js', 'src/core/logic/panel/blockHandle.js'],
	['existing command constant edge', 'src/core/logic/shell/ui.js', 'src/core/logic/shell/commandDispatcher.js'],
	['owned block resolver', 'src/core/logic/panel/blockHandle.js', 'src/core/logic/panel/blockResolver.js'],
	['plugin internal service', 'src/plugins/modal/alpha/index.js', 'src/plugins/modal/alpha/services/upload.js'],
	['root plugin internal service', 'src/plugins/modal/alpha.js', 'src/plugins/modal/alpha/services/upload.js'],
	['public plugin barrel', 'src/plugins/index.js', 'src/plugins/modal/alpha/index.js'],
	['shared module use', 'src/plugins/modal/alpha/index.js', 'src/modules/contract/Modal.js'],
	['shared helper use', 'src/core/logic/dom/html.js', 'src/helper/example.js'],
];
for (const [name, from, to] of allowed) {
	test(`allows ${name}`, () => assert.deepEqual(cruise(from, to), []));
}
