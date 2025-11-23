/**
 * @fileoverview Converts interface definitions in .d.ts files:
 * 1. Converts "class" to "interface" for contracts.d.ts (plugin.d.ts remains class)
 * 2. Converts @optional JSDoc methods to optional methods with "?"
 *
 * Input (in .js):
 * ```javascript
 * export class ModuleModal {
 *   / ** @optional * /
 *   modalOn() {}
 * }
 * ```
 *
 * Output (in .d.ts):
 * ```typescript
 * export interface ModuleModal {
 *   modalOn?(): void;
 * }
 * ```
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Files to process - all interfaces/*.d.ts files
const interfaceFiles = ['types/interfaces/*.d.ts'];

/**
 * Reads the original .js source file and extracts member names marked with @optional
 * @param {string} dtsFilePath - Path to the .d.ts file
 * @returns {Promise<Set<string>>} - Set of member names marked as optional
 */
async function getOptionalMembers(dtsFilePath) {
	// Convert .d.ts path to .js path
	const jsFilePath = dtsFilePath.replace('types/', 'src/').replace('.d.ts', '.js');

	const optionalMembers = new Set();

	try {
		const content = await fs.promises.readFile(jsFilePath, 'utf8');

		// Match JSDoc comment followed by method/property definition
		// Captures: full JSDoc, method name
		const memberRegex = /(\/\*\*[\s\S]*?\*\/)\s*(?:async\s+)?(\w+)\s*[(\s;]/g;

		let match;
		while ((match = memberRegex.exec(content)) !== null) {
			const jsdoc = match[1];
			const memberName = match[2];

			// Check for @optional
			if (/@optional/.test(jsdoc)) {
				optionalMembers.add(memberName);
			}
		}
	} catch {
		// Source file doesn't exist (e.g., index.d.ts) - skip silently
	}

	return optionalMembers;
}

/**
 * Converts class members to optional in .d.ts content
 * @param {string} content - The .d.ts file content
 * @param {Set<string>} optionalMembers - Set of member names to make optional
 * @returns {string} - Updated content with optional members
 */
function makeMethodsOptional(content, optionalMembers) {
	if (optionalMembers.size === 0) {
		return content;
	}

	// Create a pattern that matches method declarations: methodName( or methodName<
	// Also matches property declarations: memberName:
	const memberPattern = new RegExp(`^(\\s+)(${[...optionalMembers].join('|')})(\\s*[(<:])`, 'gm');

	return content.replace(memberPattern, (match, indent, memberName, suffix) => {
		// Add ? after member name to make it optional
		return `${indent}${memberName}?${suffix}`;
	});
}

/**
 * Converts "class" to "interface" in .d.ts content
 * NOTE: Only converts contracts.d.ts - plugin.d.ts must remain as class (for extends)
 * @param {string} content - The .d.ts file content
 * @param {string} filePath - The file path being processed
 * @returns {string} - Updated content with interface instead of class
 */
function convertClassToInterface(content, filePath) {
	// Only convert contracts.d.ts
	// plugin.d.ts must remain as class because plugins extend these classes
	if (!filePath.includes('contracts')) {
		return content;
	}

	// Convert "export class ClassName" to "export interface ClassName"
	content = content.replace(/^export class (\w+)/gm, 'export interface $1');

	// Convert "declare class ClassName" to "declare interface ClassName"
	content = content.replace(/^declare class (\w+)/gm, 'declare interface $1');

	return content;
}

async function processInterfaces() {
	try {
		const files = await glob(interfaceFiles, { ignore: [] });

		if (files.length === 0) {
			console.warn('⚠️  interfaces-convert: No files found');
			return;
		}

		let modifiedCount = 0;
		const changes = [];

		for (const file of files) {
			const optionalMembers = await getOptionalMembers(file);
			let content = await fs.promises.readFile(file, 'utf8');
			const originalContent = content;
			const fileChanges = [];

			// 1. Convert class to interface (only contracts.d.ts)
			const afterClassConvert = convertClassToInterface(content, file);
			if (afterClassConvert !== content) {
				fileChanges.push('class→interface');
				content = afterClassConvert;
			}

			// 2. Make @optional methods optional
			if (optionalMembers.size > 0) {
				const afterOptional = makeMethodsOptional(content, optionalMembers);
				if (afterOptional !== content) {
					fileChanges.push(`${optionalMembers.size} optional`);
					content = afterOptional;
				}
			}

			if (content !== originalContent) {
				await fs.promises.writeFile(file, content, 'utf8');
				modifiedCount++;
				changes.push(`   - ${path.basename(file)}: ${fileChanges.join(', ')}`);
			}
		}

		if (modifiedCount > 0) {
			console.log(changes.join('\n'));
			console.log(`✨ interfaces-convert: ${modifiedCount} file(s) updated`);
		} else {
			console.log('✨ interfaces-convert: No changes needed');
		}
	} catch (error) {
		console.error('❌ interfaces-convert: Error:', error);
	}
}

processInterfaces();
