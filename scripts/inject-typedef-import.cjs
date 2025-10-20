const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const typesDir = path.join(__dirname, '../types');

/**
 * Calculate relative path from source file to typedef.d.ts
 * @param {string} filePath - Path to the .d.ts file
 * @returns {string} - Relative import path
 */
function getTypedefImportPath(filePath) {
	const dir = path.dirname(filePath);
	const relativePath = path.relative(dir, path.join(typesDir, 'typedef'));
	// Convert Windows paths to Unix-style for imports
	return relativePath.split(path.sep).join('/');
}

/**
 * Check if file already has typedef import
 * @param {string} content - File content
 * @returns {boolean}
 */
function hasTypedefImport(content) {
	return /import\s+type\s*\{\s*\}\s*from\s+['"].*typedef['"];?/.test(content);
}

async function injectTypedefImport() {
	try {
		// Find all .d.ts files except typedef.d.ts itself and index.d.ts files in root
		const files = await glob('types/**/*.d.ts', {
			ignore: ['types/typedef.d.ts', 'types/index.d.ts']
		});

		if (files.length === 0) {
			console.warn('inject-typedef-import: No files found');
			return;
		}

		let updatedCount = 0;

		for (const file of files) {
			const content = await fs.promises.readFile(file, 'utf8');

			// Skip if already has typedef import
			if (hasTypedefImport(content)) {
				continue;
			}

			// Calculate the correct import path
			const importPath = getTypedefImportPath(file);
			const importStatement = `import type {} from '${importPath}';\n`;

			// Add import at the beginning of the file
			const updatedContent = importStatement + content;

			await fs.promises.writeFile(file, updatedContent, 'utf8');
			updatedCount++;
		}

		console.log(`[inject-typedef-import] Updated ${updatedCount} files`);
	} catch (error) {
		console.error('inject-typedef-import error:', error);
		process.exit(1);
	}
}

injectTypedefImport();
