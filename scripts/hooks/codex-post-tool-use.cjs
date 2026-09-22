const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '../..');

// Keep symlinked cwd/absolute paths comparable, including files just deleted by the patch.
function canonicalPath(filename) {
	try {
		return fs.realpathSync(filename);
	} catch (error) {
		const parent = path.dirname(filename);
		if (!['ENOENT', 'ENOTDIR'].includes(error.code) || parent === filename) throw error;
		return path.join(canonicalPath(parent), path.basename(filename));
	}
}

// Patch content lines have a leading space, + or -; only unprefixed headers name files.
function changedFiles(command, cwd, root) {
	if (typeof command !== 'string') throw new Error('Expected apply_patch input in tool_input.command.');
	const lines = command.trim().split(/\r?\n/);
	if (lines[0] !== '*** Begin Patch' || lines.at(-1) !== '*** End Patch') {
		throw new Error('Unrecognized apply_patch input; changed files could not be checked.');
	}
	const changes = new Map();
	let updated = null;
	for (const line of lines) {
		const match = line.match(/^\*\*\* (Add File|Update File|Delete File|Move to): (.+)$/);
		if (!match) continue;
		const [, operation, filename] = match;
		const relative = path
			.relative(root, canonicalPath(path.resolve(cwd, filename)))
			.split(path.sep)
			.join('/');
		if (operation === 'Move to') {
			if (updated === null) throw new Error('Move target without an updated file.');
			changes.set(updated, false);
		}
		changes.set(relative, operation !== 'Delete File');
		updated = operation === 'Update File' ? relative : null;
	}
	return [...changes].filter(([file]) => /^src\/.+\.js$/.test(file));
}

function lintFiles(files, root) {
	// Use the installed ESLint directly: no shell interpolation, package download or autofix.
	return spawnSync(process.execPath, [path.join(root, 'node_modules/eslint/bin/eslint.js'), '--', ...files], {
		cwd: root,
		encoding: 'utf8',
		timeout: 25000,
		maxBuffer: 1024 * 1024,
	});
}

function checkEdit(event, { root = repositoryRoot, runLint = lintFiles } = {}) {
	if (event?.hook_event_name !== 'PostToolUse' || event.tool_name !== 'apply_patch') return null;
	root = fs.realpathSync(root);
	const changes = changedFiles(event.tool_input?.command, fs.realpathSync(event.cwd || root), root);
	const touched = new Set(changes.map(([file]) => file));
	const reminders = [];
	if (touched.has('src/core/schema/options.js')) {
		reminders.push(
			'Option schema changed — read .agents/rules/options-changes.md. For added, renamed or changed options, ' +
				'verify OptionProvider.reset(), the global OPTION_FIXED_FLAG or per-frame OPTION_FRAME_FIXED_FLAG, ' +
				'and the matching typedef @property; then run npm run ts-build.',
		);
	}
	if (
		touched.has('src/core/event/rules/keydown.rule.backspace.js') ||
		touched.has('src/core/event/rules/keydown.rule.delete.js')
	) {
		reminders.push(
			'Backspace/Delete rule changed — read .agents/rules/keydown-edge-decisions.md. ' +
				'Use format.isEdgeLine / getAdjacentLine for edge decisions, not local siblings. ' +
				'Fail open when no DOM/caret/selection effect is possible, except the documented boundary no-ops. ' +
				'Keep the front/end rules mirrored and verify all four directions.',
		);
	}
	const output = {};
	if (reminders.length) {
		output.hookSpecificOutput = { hookEventName: 'PostToolUse', additionalContext: reminders.join('\n\n') };
	}
	const files = changes
		.filter(([file, present]) => present && fs.statSync(path.join(root, file), { throwIfNoEntry: false })?.isFile())
		.map(([file]) => file);
	if (files.length) {
		const result = runLint(files, root);
		if (result.error || result.status !== 0) {
			output.decision = 'block';
			output.reason = `ESLint failed for ${files.join(', ')}:\n${
				[result.error?.message, result.stdout, result.stderr, result.signal && `Terminated by ${result.signal}`]
					.filter(Boolean)
					.join('\n') || `Exit status: ${result.status}`
			}`;
		}
	}
	return Object.keys(output).length ? output : null;
}

if (require.main === module) {
	try {
		const output = checkEdit(JSON.parse(fs.readFileSync(0, 'utf8')));
		if (output) process.stdout.write(`${JSON.stringify(output)}\n`);
	} catch (error) {
		// PostToolUse cannot roll back the edit. Report failures as model-visible hook feedback.
		process.stdout.write(
			JSON.stringify({ decision: 'block', reason: `Codex edit checks failed: ${error.message}` }) + '\n',
		);
	}
}

module.exports = { checkEdit };
