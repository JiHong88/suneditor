const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const scripts = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts;
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const markdownFiles = (directory) =>
	fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
		const file = `${directory}/${entry.name}`;
		return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith('.md') ? [file] : [];
	});
const files = [
	'AGENTS.md',
	'CLAUDE.md',
	'GEMINI.md',
	'GUIDE.md',
	'ARCHITECTURE.md',
	'guide/testing.md',
	...markdownFiles('.agents/rules'),
	...markdownFiles('.agents/skills'),
	...markdownFiles('prompts'),
];

// The harness uses inline Markdown links and ATX headings. Ignore fenced example headings.
function anchors(text) {
	const result = new Set();
	const duplicates = new Map();
	let fence = null;
	for (const line of text.split('\n')) {
		const marker = line.match(/^\s*(`{3,}|~{3,})/);
		if (marker) {
			if (!fence) fence = marker[1];
			else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
			continue;
		}
		if (fence) continue;
		const heading = line.match(/^#{1,6}\s+(.+?)(?:\s+#+)?$/);
		if (!heading) continue;
		const slug = heading[1]
			.toLowerCase()
			.replace(/[^\p{Letter}\p{Number}_\s-]/gu, '')
			.replace(/\s/g, '-');
		const count = duplicates.get(slug) || 0;
		duplicates.set(slug, count + 1);
		result.add(count ? `${slug}-${count}` : slug);
	}
	return result;
}

for (const file of files) {
	const text = read(file);
	// Code spans/fences can contain literal Markdown templates, not navigable links.
	const prose = text.replace(/(`+|~{3,})[\s\S]*?\1/g, '');
	for (const match of prose.matchAll(/\[[^\]\n]+\]\(([^\s)]+)\)/g)) {
		const destination = match[1];
		if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) continue;
		const [relative, anchor] = destination.split('#');
		const target = relative
			? path.resolve(root, path.dirname(file), decodeURIComponent(relative))
			: path.join(root, file);
		if (!fs.existsSync(target)) failures.push(`${file}: missing link target ${destination}`);
		else if (
			anchor &&
			target.endsWith('.md') &&
			!anchors(fs.readFileSync(target, 'utf8')).has(decodeURIComponent(anchor))
		) {
			failures.push(`${file}: missing heading ${destination}`);
		}
	}
	for (const [, command] of text.matchAll(/\bnpm run ([a-z][\w:-]*)/g)) {
		if (!Object.hasOwn(scripts, command)) failures.push(`${file}: unknown npm script ${command}`);
	}
	if (file.endsWith('/SKILL.md')) {
		const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
		const name = frontmatter?.[1].match(/^name:\s*([\w-]+)\s*$/m)?.[1];
		const description = frontmatter?.[1].match(/^description:\s*(\S[^\n]*)$/m)?.[1];
		if (name !== path.basename(path.dirname(file)) || !description)
			failures.push(`${file}: missing or inconsistent skill name/description`);
	}
}

for (const alias of ['CLAUDE.md', 'GEMINI.md']) {
	if (!read(alias).includes('[AGENTS.md](./AGENTS.md)')) failures.push(`${alias}: must link to shared AGENTS.md`);
}
// Every rule is either always-on (@import) or on-demand (markdown link) in CLAUDE.md — no orphans.
const claudeText = read('CLAUDE.md');
const claudeImports = [...claudeText.matchAll(/^@(.+)$/gm)].map((match) => match[1].trim());
const claudeLinks = [...claudeText.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => match[1].trim());
const claudeCovered = new Set([...claudeImports, ...claudeLinks]);
const rules = markdownFiles('.agents/rules').sort();
for (const rule of rules) {
	if (!claudeCovered.has(rule)) failures.push(`CLAUDE.md: rule ${rule} is neither @imported (always-on) nor linked (on-demand)`);
}
for (const imported of claudeImports) {
	if (!rules.includes(imported)) failures.push(`CLAUDE.md: @import points to missing rule ${imported}`);
}
const skillAlias = path.join(root, '.claude/skills');
if (!fs.existsSync(skillAlias) || fs.realpathSync(skillAlias) !== fs.realpathSync(path.join(root, '.agents/skills'))) {
	failures.push('.claude/skills: must point to .agents/skills');
}

if (failures.length) {
	console.error(failures.join('\n'));
	process.exitCode = 1;
} else {
	console.log(
		`Harness OK: ${files.length} Markdown files, ${rules.length} shared rules, links/anchors, npm scripts, skill metadata and aliases.`,
	);
}
