const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const targetPath = path.join(__dirname, '../types/core/config/options.d.ts');
const original = fs.readFileSync(targetPath, 'utf-8');

/**
 * Find all plugin option types from plugin files
 * @returns {Array<{name: string, typeName: string, path: string}>}
 */
function findPluginOptions() {
	const files = globSync('types/plugins/**/*.d.ts', { cwd: path.join(__dirname, '..') });
	const plugins = new Map(); // Use Map to deduplicate by plugin name

	for (const file of files) {
		const fullPath = path.join(__dirname, '..', file);
		const content = fs.readFileSync(fullPath, 'utf-8');
		const match = content.match(/export type (\w+)PluginOptions\s*=/);

		if (match) {
			const typeName = match[1] + 'PluginOptions';
			// Convert PascalCase to camelCase for plugin name
			let pluginName = match[1].charAt(0).toLowerCase() + match[1].slice(1);

			// Handle special cases
			if (pluginName.length <= 3) pluginName = pluginName.toLowerCase(); // e.g., 'hR' stays 'hr'

			// Get relative path from options.d.ts to plugin file
			const relativePath = path.relative(path.dirname(targetPath), fullPath.replace(/\.d\.ts$/, ''));

			// Deduplicate: prefer non-index paths (e.g., table.d.ts over table/index.d.ts)
			if (!plugins.has(pluginName) || !relativePath.includes('/index')) {
				plugins.set(pluginName, {
					name: pluginName,
					typeName: typeName,
					path: relativePath.split(path.sep).join('/')
				});
			}
		}
	}

	return Array.from(plugins.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Find all plugin options
const pluginOptions = findPluginOptions();

// Generate import statements
const imports = pluginOptions.map((p) => `import type { ${p.typeName} } from '${p.path}';`).join('\n');

// Generate specific plugin type mappings
const pluginMappings = pluginOptions.map((p) => `    ${p.name}?: ${p.typeName};`).join('\n');

// Add index signature to EditorBaseOptions for dynamic plugin options
// Strategy: Find "allowedExtraTags?" and inject plugin-specific types + index signature after its closing };
const replaced = original.replace(/(allowedExtraTags\?:\s*\{[\s\S]*?\n\s*\};)(\n};)/, (match, allowedExtraTags, typeClosing) => {
	// Check if plugin options already exist
	if (match.includes('image?:') || match.includes('[pluginName: string]:')) {
		return match;
	}

	// Add specific plugin options and index signature
	const pluginSection = `\n    /**\n     * === Plugin-Specific Options ===\n     * Each plugin can have its own configuration options.\n     */\n${pluginMappings}\n    /**\n     * - Index signature: Allows any other plugin name with custom options.\n     */\n    [pluginName: string]: any;`;

	return allowedExtraTags + pluginSection + typeClosing;
});

// Inject imports at the top of the file (after typedef import)
// Strategy: Find the typedef import or the first line after imports, then add our imports
let withImports = replaced;

// Find where to insert imports
const typedefImportMatch = replaced.match(/(import type \{\} from ['"]\.\.\/\.\.\/typedef['"];?\n)/);

if (typedefImportMatch) {
	// Insert after typedef import
	withImports = replaced.replace(/(import type \{\} from ['"]\.\.\/\.\.\/typedef['"];?\n)/, `$1${imports}\n`);
} else {
	// No typedef import yet, insert at the beginning
	withImports = imports + '\n' + replaced;
}

fs.writeFileSync(targetPath, withImports, 'utf-8');

console.log(`[inject-plugin-index-signature] ✓ Added ${pluginOptions.length} plugin option types + index signature`);
