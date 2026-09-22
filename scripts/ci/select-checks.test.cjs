const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { selectChecks, changedFiles } = require('./select-checks.cjs');

const all = { checks: true, coverage: true, browser: true, install: true };
const cases = [
	['source JS', ['src/core/logic/dom/offset.js'], ['checks', 'coverage', 'browser']],
	['JS asset', ['src/assets/icons/defaultIcons.js'], ['checks', 'coverage', 'browser']],
	['unit test', ['test/unit/core/config/eventManager.spec.js'], ['coverage']],
	['integration test', ['test/integration/memory.destroy.spec.js'], ['coverage']],
	['shared mock', ['test/__mocks__/editorIntegration.js'], ['coverage']],
	['Jest setup', ['test/setup.js'], ['coverage']],
	['Jest config', ['jest.config.js'], ['coverage']],
	['Babel config', ['babel.config.js'], ['coverage', 'browser']],
	['dependency rule', ['.dependency-cruiser.js'], ['checks']],
	['architecture test', ['scripts/check/architecture.test.cjs'], ['checks']],
	['export checker', ['scripts/check/check-exports-sync.cjs'], ['checks']],
	['type export formatter', ['scripts/ts-build/format-index.cjs'], ['checks']],
	['CDN exports', ['webpack/cdn-builder.js'], ['checks']],
	['harness checker', ['scripts/check/check-harness.cjs'], []],
	['translation script', ['scripts/check/langs-sync.cjs'], []],
	['other generator', ['scripts/ts-build/gen-options-dts.cjs'], []],
	['release script', ['scripts/release-archive.sh'], []],
	['editor CSS', ['src/assets/suneditor.css'], ['browser']],
	['theme CSS', ['src/themes/dark.css'], ['browser']],
	['browser case', ['test/browser/geometry.spec.js'], ['browser']],
	['performance budget', ['test/browser/performance-budgets.json'], ['browser']],
	['browser config', ['playwright.contracts.config.js'], ['browser']],
	['browser webpack', ['webpack/browser-tests.js'], ['browser']],
	['shared webpack', ['webpack/_common.js'], ['browser']],
	['developer webpack', ['webpack/dev.js'], []],
	['native E2E', ['test/e2e/table.spec.js'], []],
	['native E2E config', ['playwright.config.js'], []],
	['developer demo', ['test/dev/se_test.js'], []],
	['generated types', ['types/index.d.ts'], ['checks']],
	['TS config', ['tsconfig.json'], ['checks']],
	['ESLint config', ['eslint.config.mjs'], ['checks']],
	['Prettier config', ['.prettierrc'], ['checks']],
	['package', ['package.json'], ['checks', 'coverage', 'browser']],
	['lockfile', ['package-lock.json'], ['checks', 'coverage', 'browser']],
	['npm config', ['.npmrc'], ['checks', 'coverage', 'browser']],
	['Markdown anywhere', ['GUIDE.md', 'src/README.md', 'test/browser/README.md', 'scripts/ci/README.md'], []],
	['HTML documentation', ['docs/index.html', 'guide/example.html'], []],
	['agent rules', ['.agents/rules/performance.md'], []],
	['agent settings', ['.claude/settings.json'], []],
	['Codex hooks', ['.codex/hooks.json'], []],
	['Codex hook implementation', ['scripts/hooks/codex-post-tool-use.cjs'], []],
	['Codex hook tests', ['scripts/hooks/codex-post-tool-use.test.cjs'], []],
	['license', ['LICENSE.txt'], []],
	[
		'repository metadata',
		[
			'.gitignore',
			'.gitattributes',
			'.editorconfig',
			'.barrelsby.json',
			'repomix.config.json',
			'jsconfig.json',
			'codecov.yml',
		],
		[],
	],
	[
		'issue automation',
		['.github/workflows/issue-manager.yml', '.github/scripts/manage-issues.js', '.github/FUNDING.yml'],
		[],
	],
	['CI workflow', ['.github/workflows/test-coverage.yml'], ['checks', 'coverage', 'browser']],
	['CI selector', ['scripts/ci/select-checks.cjs'], ['checks', 'coverage', 'browser']],
	['CI selector test', ['scripts/ci/select-checks.test.cjs'], ['checks', 'coverage', 'browser']],
	['mixed docs and source', ['GUIDE.md', 'src/core/editor.js'], ['checks', 'coverage', 'browser']],
	['mixed CSS and Jest', ['src/assets/suneditor.css', 'test/setup.js'], ['coverage', 'browser']],
	['unknown path', ['new-runtime-entry.js'], ['coverage']],
	['no changed files', [], []],
];
for (const [name, files, expected] of cases) {
	test(`selects the required steps for ${name}`, () => {
		assert.deepEqual(selectChecks(files), {
			checks: expected.includes('checks'),
			coverage: expected.includes('coverage'),
			browser: expected.includes('browser'),
			install: expected.length > 0,
		});
	});
}

const base = 'a'.repeat(40);
const head = 'b'.repeat(40);
const ancestor = 'c'.repeat(40);
test('PR comparison uses the merge base, retaining earlier PR changes and both sides of moves', () => {
	const calls = [];
	const result = changedFiles(
		'pull_request',
		{ pull_request: { base: { sha: base }, head: { sha: head } } },
		(args) => {
			calls.push(args);
			return calls.length === 1 ? `${ancestor}\n` : 'src/removed.js\0docs/moved.js\0src/odd\nname.js\0';
		},
	);
	assert.deepEqual(calls, [
		['merge-base', base, head],
		['diff', '--name-only', '--no-renames', '-z', ancestor, head, '--'],
	]);
	assert.deepEqual(result.files, ['src/removed.js', 'docs/moved.js', 'src/odd\nname.js']);
	assert.deepEqual(selectChecks(result.files), all);
});

test('push compares the entire before/after change rather than only the last commit', () => {
	const result = changedFiles('push', { before: base, after: head }, (args) => {
		assert.deepEqual(args, ['diff', '--name-only', '--no-renames', '-z', base, head, '--']);
		return 'src/assets/suneditor.css\0';
	});
	assert.deepEqual(selectChecks(result.files), { checks: false, coverage: false, browser: true, install: true });
});

for (const [name, event, payload] of [
	['manual run', 'workflow_dispatch', {}],
	['new branch', 'push', { before: '0'.repeat(40), after: head }],
	['missing PR metadata', 'pull_request', {}],
	['malformed SHA', 'push', { before: '--some-option', after: head }],
	['unknown event', 'unknown', {}],
]) {
	test(`${name} runs all checks without passing invalid refs to git`, () => {
		const result = changedFiles(event, payload, () => assert.fail('git must not be called'));
		assert.deepEqual(selectChecks(result.files), all);
	});
}

test('unreachable push history runs all checks', () => {
	const result = changedFiles('push', { before: base, after: head }, () => {
		throw new Error('missing commit');
	});
	assert.deepEqual(selectChecks(result.files), all);
});

test('missing PR merge base runs all checks', () => {
	const result = changedFiles(
		'pull_request',
		{ pull_request: { base: { sha: base }, head: { sha: head } } },
		() => '',
	);
	assert.deepEqual(selectChecks(result.files), all);
});

test('CLI reads a real Git comparison and emits boolean GitHub outputs before npm install', () => {
	const root = path.resolve(__dirname, '../..');
	const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'suneditor-ci-'));
	try {
		const event = path.join(temporary, 'event.json');
		const output = path.join(temporary, 'output');
		const summary = path.join(temporary, 'summary');
		fs.writeFileSync(event, JSON.stringify({ before: commit, after: commit }));
		const stdout = execFileSync(process.execPath, [path.join(__dirname, 'select-checks.cjs')], {
			cwd: root,
			encoding: 'utf8',
			env: {
				...process.env,
				GITHUB_EVENT_NAME: 'push',
				GITHUB_EVENT_PATH: event,
				GITHUB_OUTPUT: output,
				GITHUB_STEP_SUMMARY: summary,
			},
		});
		assert.deepEqual(JSON.parse(stdout).selected, selectChecks([]));
		assert.equal(fs.readFileSync(output, 'utf8'), 'checks=false\ncoverage=false\nbrowser=false\ninstall=false\n');
		assert.match(fs.readFileSync(summary, 'utf8'), /Changed paths: 0/);
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});
