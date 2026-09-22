const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { checkEdit } = require('./codex-post-tool-use.cjs');

const source = path.join(__dirname, 'codex-post-tool-use.cjs');
const optionsFile = 'src/core/schema/options.js';
const backspaceFile = 'src/core/event/rules/keydown.rule.backspace.js';
const deleteFile = 'src/core/event/rules/keydown.rule.delete.js';

function fixture(t, files = []) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suneditor-hook-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	for (const file of files) {
		fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
		fs.writeFileSync(path.join(root, file), '');
	}
	return root;
}

function event(cwd, body) {
	return {
		hook_event_name: 'PostToolUse',
		tool_name: 'apply_patch',
		cwd,
		tool_input: { command: `*** Begin Patch\n${body}\n*** End Patch` },
	};
}

test('checks all changed JS files once, ignoring patch content that resembles headers', (t) => {
	const root = fixture(t, ['src/one.js', 'src/nested/two.js', optionsFile]);
	const calls = [];
	const output = checkEdit(
		event(
			root,
			[
				'*** Update File: src/one.js',
				'@@',
				'-old',
				'+new',
				`+*** Update File: ${optionsFile}`,
				` *** Update File: ${optionsFile}`,
				'*** Add File: src/nested/two.js',
				'+new',
				'*** Update File: ./src/one.js',
				'@@',
				'-new',
				'+newer',
			].join('\n'),
		),
		{
			root,
			runLint: (files) => {
				calls.push(files);
				return { status: 0 };
			},
		},
	);
	assert.equal(output, null);
	assert.deepEqual(calls, [['src/one.js', 'src/nested/two.js']]);
});

test('resolves relative paths from the event cwd and also accepts absolute paths', (t) => {
	const root = fixture(t, ['src/core/one.js', 'src/two.js']);
	const calls = [];
	checkEdit(
		event(
			path.join(root, 'src/core'),
			`*** Update File: ./one.js\n*** Update File: ${path.join(root, 'src/two.js')}`,
		),
		{
			root,
			runLint: (files) => {
				calls.push(files);
				return { status: 0 };
			},
		},
	);
	assert.deepEqual(calls, [['src/core/one.js', 'src/two.js']]);
});

test('lints move destinations and additions, excluding deleted and old paths', (t) => {
	const root = fixture(t, ['src/old.js', 'src/new.js', 'src/deleted.js', 'src/added.js']);
	const calls = [];
	checkEdit(
		event(
			root,
			'*** Update File: src/old.js\n*** Move to: src/new.js\n@@\n-old\n+new\n' +
				'*** Delete File: src/deleted.js\n*** Add File: src/added.js\n+new',
		),
		{
			root,
			runLint: (files) => {
				calls.push(files);
				return { status: 0 };
			},
		},
	);
	assert.deepEqual(calls, [['src/new.js', 'src/added.js']]);
});

test('skips non-source, non-JS, missing, directory and outside-repository paths', (t) => {
	const root = fixture(t, ['README.md', 'test/helper.js', 'src/one.css']);
	fs.mkdirSync(path.join(root, 'src/directory.js'));
	assert.equal(
		checkEdit(
			event(
				root,
				[
					'*** Update File: README.md',
					'*** Update File: test/helper.js',
					'*** Update File: src/one.css',
					'*** Update File: src/missing.js',
					'*** Update File: src/directory.js',
					'*** Update File: ../outside/src/other.js',
					'*** Update File: src/../../outside.js',
				].join('\n'),
			),
			{ root, runLint: () => assert.fail('ESLint must not run') },
		),
		null,
	);
});

test('adds both checklists once without blocking a successful edit', (t) => {
	const root = fixture(t, [optionsFile, backspaceFile, deleteFile]);
	const output = checkEdit(
		event(root, [optionsFile, backspaceFile, deleteFile].map((file) => `*** Update File: ${file}`).join('\n')),
		{ root, runLint: () => ({ status: 0 }) },
	);
	assert.equal(output.decision, undefined);
	assert.equal(output.hookSpecificOutput.hookEventName, 'PostToolUse');
	const text = output.hookSpecificOutput.additionalContext;
	assert.match(text, /options-changes\.md/);
	assert.match(text, /OptionProvider\.reset/);
	assert.match(text, /OPTION_FRAME_FIXED_FLAG/);
	assert.match(text, /npm run ts-build/);
	assert.equal(text.match(/keydown-edge-decisions\.md/g).length, 1);
});

for (const file of [backspaceFile, deleteFile]) {
	test(`reminds about the mirrored rules when only ${path.basename(file)} changes`, (t) => {
		const root = fixture(t, [file]);
		const output = checkEdit(event(root, `*** Update File: ${file}`), { root, runLint: () => ({ status: 0 }) });
		assert.match(output.hookSpecificOutput.additionalContext, /all four directions/);
		assert.equal(output.decision, undefined);
	});
}

test('preserves checklist feedback when an owning file is moved or deleted', (t) => {
	const root = fixture(t);
	const output = checkEdit(
		event(
			root,
			`*** Update File: ${optionsFile}\n*** Move to: docs/old-options.txt\n*** Delete File: ${backspaceFile}`,
		),
		{
			root,
			runLint: () => assert.fail('No remaining JS files'),
		},
	);
	assert.match(output.hookSpecificOutput.additionalContext, /options-changes\.md/);
	assert.match(output.hookSpecificOutput.additionalContext, /keydown-edge-decisions\.md/);
});

test('reports lint failure while retaining the applicable checklist', (t) => {
	const root = fixture(t, [optionsFile]);
	const output = checkEdit(event(root, `*** Update File: ${optionsFile}`), {
		root,
		runLint: () => ({ status: 1, stdout: 'Parsing error: bad token', stderr: 'diagnostic' }),
	});
	assert.equal(output.decision, 'block');
	assert.match(output.reason, /Parsing error: bad token/);
	assert.match(output.reason, /diagnostic/);
	assert.match(output.hookSpecificOutput.additionalContext, /options-changes\.md/);
});

test('reports timeout or process failure rather than silently passing', (t) => {
	const root = fixture(t, ['src/one.js']);
	const output = checkEdit(event(root, '*** Update File: src/one.js'), {
		root,
		runLint: () => ({ status: null, error: new Error('ETIMEDOUT'), signal: 'SIGTERM' }),
	});
	assert.equal(output.decision, 'block');
	assert.match(output.reason, /ETIMEDOUT/);
	assert.match(output.reason, /SIGTERM/);
});

test('ignores other tools/events and rejects a missing command instead of reading file_path', () => {
	assert.equal(checkEdit({ hook_event_name: 'PreToolUse', tool_name: 'apply_patch' }), null);
	assert.equal(checkEdit({ hook_event_name: 'PostToolUse', tool_name: 'Bash' }), null);
	assert.throws(
		() =>
			checkEdit({
				hook_event_name: 'PostToolUse',
				tool_name: 'apply_patch',
				tool_input: { file_path: optionsFile },
			}),
		/tool_input\.command/,
	);
	const malformed = event(__dirname, '');
	malformed.tool_input.command = 'bad';
	assert.throws(() => checkEdit(malformed), /Unrecognized apply_patch/);
});

test('accepts CRLF patches and falls back to the repository cwd when absent', (t) => {
	const root = fixture(t, ['src/one.js']);
	const input = event(undefined, '*** Update File: src/one.js');
	input.tool_input.command = input.tool_input.command.replaceAll('\n', '\r\n');
	const calls = [];
	checkEdit(input, {
		root,
		runLint: (files) => {
			calls.push(files);
			return { status: 0 };
		},
	});
	assert.deepEqual(calls, [['src/one.js']]);
});

test('CLI reports malformed JSON as hook feedback', () => {
	const result = spawnSync(process.execPath, [source], { input: '{', encoding: 'utf8' });
	assert.equal(result.status, 0);
	assert.equal(JSON.parse(result.stdout).decision, 'block');
	assert.match(JSON.parse(result.stdout).reason, /Codex edit checks failed/);
});

test('CLI batches literal filenames through installed ESLint without invoking a shell', (t) => {
	const files = ['src/name with spaces.js', 'src/$(touch should-not-exist).js', optionsFile];
	const root = fixture(t, [...files, 'scripts/hooks/codex-post-tool-use.cjs', 'node_modules/eslint/bin/eslint.js']);
	fs.copyFileSync(source, path.join(root, 'scripts/hooks/codex-post-tool-use.cjs'));
	fs.writeFileSync(
		path.join(root, 'node_modules/eslint/bin/eslint.js'),
		[
			'const fs = require("node:fs");',
			'fs.writeFileSync("lint-call.json", JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }));',
			'console.log("fixture lint diagnostic");',
			'process.exitCode = 1;',
		].join('\n'),
	);
	const result = spawnSync(process.execPath, [path.join(root, 'scripts/hooks/codex-post-tool-use.cjs')], {
		cwd: path.join(root, 'src'),
		encoding: 'utf8',
		input: JSON.stringify(event(root, files.map((file) => `*** Update File: ${file}`).join('\n'))),
	});
	assert.equal(result.status, 0);
	const output = JSON.parse(result.stdout);
	assert.equal(output.decision, 'block');
	assert.match(output.reason, /fixture lint diagnostic/);
	assert.match(output.hookSpecificOutput.additionalContext, /options-changes\.md/);
	const call = JSON.parse(fs.readFileSync(path.join(root, 'lint-call.json'), 'utf8'));
	assert.deepEqual(call.args, ['--', ...files]);
	assert.equal(fs.realpathSync(call.cwd), fs.realpathSync(root));
	assert.equal(fs.existsSync(path.join(root, 'should-not-exist')), false);
});
