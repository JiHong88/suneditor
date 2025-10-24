const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const typesDir = path.join(__dirname, '../../types');

/**
 * Calculate relative path from source file to typedef.d.ts
 * @param {string} filePath - Path to the .d.ts file
 * @returns {string} - Relative import path
 */
function getTypedefImportPath(filePath) {
	const dir = path.dirname(filePath);
	const relativePath = path.relative(dir, path.join(typesDir, 'typedef'));
	// Convert Windows paths to Unix-style for imports
	let importPath = relativePath.split(path.sep).join('/');
	// Ensure same-directory imports have './' prefix
	if (!importPath.startsWith('.')) {
		importPath = './' + importPath;
	}
	return importPath;
}

/**
 * Check if file already has correct typedef import
 * @param {string} content - File content
 * @param {string} expectedPath - Expected import path
 * @returns {boolean}
 */
function hasCorrectTypedefImport(content, expectedPath) {
	const escapedPath = expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(`import\\s+type\\s*\\{\\s*\\}\\s*from\\s+['"]${escapedPath}['"];?`);
	return regex.test(content);
}

/**
 * Remove any existing typedef import (correct or incorrect)
 * @param {string} content - File content
 * @returns {string} - Content without typedef import
 */
function removeTypedefImport(content) {
	return content.replace(/import\s+type\s*\{\s*\}\s*from\s+['"].*typedef['"];?\n?/g, '');
}

async function injectTypedefImport() {
	try {
		// Find all .d.ts files except typedef.d.ts itself and index.d.ts files in root
		const files = await glob('types/**/*.d.ts', {
			ignore: ['types/typedef.d.ts', 'types/index.d.ts', 'types/langs/*.d.ts', 'types/assets/**/*.d.ts']
		});

		if (files.length === 0) {
			console.warn('inject-typedef-import: No files found');
			return;
		}

		let updatedCount = 0;

		for (const file of files) {
			const content = await fs.promises.readFile(file, 'utf8');

			// Calculate the correct import path
			const importPath = getTypedefImportPath(file);

			// Skip if already has correct typedef import
			if (hasCorrectTypedefImport(content, importPath)) {
				continue;
			}

			// Remove any existing (incorrect) typedef import
			const cleanedContent = removeTypedefImport(content);

			// Find existing imports to preserve them
			const existingImports = [];
			const importRegex = /^import\s+type\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?\s*$/gm;
			let importMatch;
			while ((importMatch = importRegex.exec(cleanedContent)) !== null) {
				existingImports.push(importMatch[0]);
			}

			// Remove all imports from content
			const contentWithoutImports = cleanedContent.replace(importRegex, '').replace(/^\s*\n/gm, '');

			// Add typedef import + existing imports at the beginning
			const importStatement = `import type {} from '${importPath}';\n`;
			const allImports = existingImports.length > 0 ? importStatement + existingImports.join('\n') + '\n' : importStatement;
			const updatedContent = allImports + contentWithoutImports;

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
