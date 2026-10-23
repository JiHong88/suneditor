const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const commonInputs = new Set(['package.json', 'package-lock.json', '.npmrc']);
const checkInputs = new Set([
	'eslint.config.mjs',
	'.prettierrc',
	'tsconfig.json',
	'.dependency-cruiser.js',
	'scripts/check/architecture.test.cjs',
	'scripts/check/check-exports-sync.cjs',
	'scripts/ts-build/format-index.cjs',
	'webpack/cdn-builder.js',
]);
const browserInputs = new Set([
	'playwright.contracts.config.js',
	'webpack/browser-tests.js',
	'webpack/_common.js',
	'babel.config.js',
]);
const coverageIgnoredDirectories = [
	'docs/',
	'guide/',
	'prompts/',
	'.agents/',
	'.claude/',
	'.codex/',
	'.github/ISSUE_TEMPLATE/',
	'.github/scripts/',
	'scripts/',
	'webpack/',
	'src/themes/',
	'types/',
	'test/dev/',
	'test/e2e/',
	'test/browser/',
];
const coverageIgnoredFiles = new Set([
	'.github/FUNDING.yml',
	'.barrelsby.json',
	'.dependency-cruiser.js',
	'.editorconfig',
	'.gitattributes',
	'.gitignore',
	'.prettierrc',
	'codecov.yml',
	'eslint.config.mjs',
	'tsconfig.json',
	'jsconfig.json',
	'repomix.config.json',
	'playwright.config.js',
	'playwright.contracts.config.js',
	'LICENSE.txt',
]);

/** Null means an unavailable comparison or an explicit full run. Unknown paths still run coverage. */
function selectChecks(files) {
	const result = { checks: false, coverage: false, browser: false, install: false };
	files = files?.filter((file) => !file.endsWith('.md')) ?? null;
	if (
		files === null ||
		files.some((file) => file === '.github/workflows/test-coverage.yml' || file.startsWith('scripts/ci/'))
	) {
		return { checks: true, coverage: true, browser: true, install: true };
	}
	for (const file of files) {
		const common = commonInputs.has(file);
		result.checks ||= common || /^src\/.*\.js$/.test(file) || file.startsWith('types/') || checkInputs.has(file);
		result.browser ||=
			common || file.startsWith('src/') || file.startsWith('test/browser/') || browserInputs.has(file);
		result.coverage ||= !(
			/\.(md|css)$/.test(file) ||
			coverageIgnoredFiles.has(file) ||
			coverageIgnoredDirectories.some((directory) => file.startsWith(directory)) ||
			/^\.github\/workflows\/.*-manager\.yml$/.test(file)
		);
	}
	result.install = result.checks || result.coverage || result.browser;
	return result;
}

const isCommit = (value) => typeof value === 'string' && /^[a-f\d]{40}$/i.test(value) && !/^0+$/.test(value);
const git = (args) =>
	execFileSync('git', args, {
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 32 * 1024 * 1024,
		stdio: ['ignore', 'pipe', 'pipe'],
	});

function changedFiles(eventName, event, runGit = git) {
	if (eventName === 'workflow_dispatch') return { files: null, reason: 'Manual full run' };
	let base;
	let head;
	if (eventName === 'pull_request') {
		base = event.pull_request?.base?.sha;
		head = event.pull_request?.head?.sha;
	} else if (eventName === 'push') {
		base = event.before;
		head = event.after;
	} else {
		return { files: null, reason: 'Unknown event: run every check' };
	}
	if (!isCommit(base) || !isCommit(head)) return { files: null, reason: 'No valid comparison: run every check' };
	try {
		// PRs include all commits since divergence; pushes include the whole before/after change.
		if (eventName === 'pull_request') base = runGit(['merge-base', base, head]).trim();
		if (!isCommit(base)) throw new Error('Invalid merge base');
		// No rename detection: include both removed and added paths, including directory moves.
		const output = runGit(['diff', '--name-only', '--no-renames', '-z', base, head, '--']);
		return {
			files: output.split('\0').filter(Boolean),
			reason: eventName === 'pull_request' ? 'PR merge-base to head' : 'Push before to after',
		};
	} catch {
		// E.g. an unreachable pre-force-push commit. Never turn missing history into a green skip.
		return { files: null, reason: 'Git comparison unavailable: run every check' };
	}
}

function main() {
	let changes;
	try {
		const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
		changes = changedFiles(process.env.GITHUB_EVENT_NAME, event);
	} catch {
		changes = { files: null, reason: 'Event payload unavailable: run every check' };
	}
	const selected = selectChecks(changes.files);
	if (process.env.GITHUB_OUTPUT) {
		fs.appendFileSync(
			process.env.GITHUB_OUTPUT,
			Object.entries(selected)
				.map(([key, value]) => `${key}=${value}\n`)
				.join(''),
		);
	}
	if (process.env.GITHUB_STEP_SUMMARY) {
		fs.appendFileSync(
			process.env.GITHUB_STEP_SUMMARY,
			[
				'### CI selection',
				'',
				changes.reason,
				`Changed paths: ${changes.files === null ? 'unknown / full run' : changes.files.length}`,
				'',
				'| Step | Selected |',
				'| --- | --- |',
				'| Harness and CI routing tests | always |',
				...Object.entries(selected).map(([key, value]) => `| ${key} | ${value} |`),
				'',
			].join('\n'),
		);
	}
	console.log(JSON.stringify({ ...changes, files: changes.files?.length ?? null, selected }));
}

if (require.main === module) main();
module.exports = { selectChecks, changedFiles };
