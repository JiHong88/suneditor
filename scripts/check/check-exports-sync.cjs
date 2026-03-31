/**
 * @fileoverview Validates that suneditor.js, cdn-builder.js, and format-index.cjs export the same modules.
 *
 * cdn-builder.js intentionally excludes `langs` (loaded separately for CDN size).
 * All other exports must match across the three files.
 *
 * Run: npm run check:exports
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');

const files = {
	suneditor: path.join(ROOT, 'src/suneditor.js'),
	cdnBuilder: path.join(ROOT, 'webpack/cdn-builder.js'),
	formatIndex: path.join(ROOT, 'scripts/ts-build/format-index.cjs'),
};

// Modules that are intentionally excluded from specific files
const KNOWN_EXCLUSIONS = {
	cdnBuilder: ['langs'], // CDN excludes langs for size
};

/**
 * Parse named exports from suneditor.js
 * Looks for: export { plugins, modules, helper, langs, interfaces };
 */
function parseSuneditor(content) {
	const match = content.match(/export\s*\{([^}]+)\}/);
	if (!match) return [];
	return match[1].split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Parse window.SUNEDITOR properties from cdn-builder.js
 * Looks for: value: { ...suneditor, plugins, modules, helper, interfaces }
 */
function parseCdnBuilder(content) {
	const match = content.match(/value:\s*\{([^}]+)\}/s);
	if (!match) return [];
	// Split by newline first to strip comments, then extract identifiers
	return match[1]
		.split('\n')
		.map((line) => line.replace(/\/\/.*$/, '').trim()) // strip comments
		.join(',')
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s && !s.startsWith('...'))
		.map((s) => s.split(':')[0].trim())
		.filter(Boolean);
}

/**
 * Parse exports from format-index.cjs generated output
 * Looks for: defaultExportModules array and other export patterns
 */
function parseFormatIndex(content) {
	const exports = [];

	// defaultExportModules = ['helper', 'langs', 'plugins']
	const defaultMatch = content.match(/defaultExportModules\s*=\s*\[([^\]]+)\]/);
	if (defaultMatch) {
		defaultMatch[1].split(',').forEach((s) => {
			const name = s.trim().replace(/['"]/g, '');
			if (name) exports.push(name);
		});
	}

	// export { interfaces } — but not "export { default }" (that's the main factory, not a named module)
	const namedExports = content.match(/export\s*\{\s*(\w+)\s*\}/g) || [];
	namedExports.forEach((m) => {
		const name = m.match(/\{\s*(\w+)\s*\}/);
		if (name && name[1] !== 'default') exports.push(name[1]);
	});

	// export namespace modules
	const nsMatch = content.match(/export\s+namespace\s+(\w+)/g) || [];
	nsMatch.forEach((m) => {
		const name = m.match(/namespace\s+(\w+)/);
		if (name) exports.push(name[1]);
	});

	return exports;
}

// --- Main ---

let hasError = false;

// Read files
const contents = {};
for (const [key, filePath] of Object.entries(files)) {
	if (!fs.existsSync(filePath)) {
		console.error(`\x1b[31m✗\x1b[0m File not found: ${filePath}`);
		process.exit(1);
	}
	contents[key] = fs.readFileSync(filePath, 'utf8');
}

// Parse exports
const exports_ = {
	suneditor: parseSuneditor(contents.suneditor),
	cdnBuilder: parseCdnBuilder(contents.cdnBuilder),
	formatIndex: parseFormatIndex(contents.formatIndex),
};

// suneditor.js is the source of truth
const source = new Set(exports_.suneditor);

// Check each target
const targets = {
	cdnBuilder: { label: 'cdn-builder.js', file: 'webpack/cdn-builder.js' },
	formatIndex: { label: 'format-index.cjs', file: 'scripts/ts-build/format-index.cjs' },
};

for (const [key, { label, file }] of Object.entries(targets)) {
	const target = new Set(exports_[key]);
	const exclusions = new Set(KNOWN_EXCLUSIONS[key] || []);

	// Check for missing exports (in source but not in target)
	const missing = [...source].filter((e) => !target.has(e) && !exclusions.has(e));
	if (missing.length) {
		console.error(`\x1b[31m✗\x1b[0m ${label} is missing exports: ${missing.join(', ')}`);
		console.error(`  Update: ${file}`);
		hasError = true;
	}

	// Check for extra exports (in target but not in source)
	const extra = [...target].filter((e) => !source.has(e));
	if (extra.length) {
		console.error(`\x1b[31m✗\x1b[0m ${label} has extra exports not in suneditor.js: ${extra.join(', ')}`);
		console.error(`  Update: ${file}`);
		hasError = true;
	}
}

if (hasError) {
	console.error('\n\x1b[31m✗ Export sync check failed.\x1b[0m');
	console.error('  The three files must export the same modules:');
	console.error('  - src/suneditor.js (source of truth)');
	console.error('  - webpack/cdn-builder.js (excludes: langs)');
	console.error('  - scripts/ts-build/format-index.cjs');
	process.exit(1);
} else {
	console.log(`\x1b[32m✓\x1b[0m Export sync OK — suneditor.js exports: [${exports_.suneditor.join(', ')}]`);
	console.log(`  cdn-builder.js: OK (excludes: langs)`);
	console.log(`  format-index.cjs: OK`);
}
