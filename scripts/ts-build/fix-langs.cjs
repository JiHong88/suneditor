const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const filesPath = 'types/langs/*.d.ts';
const ignorePath = ['types/langs/_Lang.d.ts', 'types/langs/index.d.ts'];
const TYPE_FILE = 'types/langs/_Lang.d.ts';
const BASE_LANG_FILE = 'src/langs/en.js';

/**
 * Extract lang object from en.js source file
 */
function extractLangKeys() {
	try {
		const content = fs.readFileSync(BASE_LANG_FILE, 'utf8');
		const langMatch = content.match(/const\s+lang\s*=\s*\{([\s\S]*?)\n\t\}/);

		if (!langMatch) {
			throw new Error('Could not find lang object in en.js');
		}

		const langBody = langMatch[1];
		const keyMatches = [...langBody.matchAll(/^\s*(\w+):/gm)];

		return keyMatches.map((match) => match[1]);
	} catch (error) {
		console.error('Error extracting lang keys:', error);
		throw error;
	}
}

/**
 * Create or update _Lang.d.ts file based on en.js
 */
function updateTypeDef() {
	try {
		const keyOrder = extractLangKeys();

		// Check if _Lang.d.ts exists
		if (!fs.existsSync(TYPE_FILE)) {
			// Create new _Lang.d.ts file
			const typeContent = `export type _Lang = {\n${keyOrder.map((k) => `\t${k}: string;`).join('\n')}\n};\n`;
			fs.writeFileSync(TYPE_FILE, typeContent, 'utf8');
			console.log('✨ fix-langs: Created _Lang.d.ts');
			return;
		}

		// Update existing _Lang.d.ts file
		let typeFile = fs.readFileSync(TYPE_FILE, 'utf8');
		const existingKeys = new Set((typeFile.match(/\b(\w+): string;/g) || []).map((k) => k.split(':')[0]));
		const toInsert = keyOrder.filter((k) => !existingKeys.has(k)).map((k) => `\t${k}: string;`);

		if (toInsert.length === 0) {
			console.log('✅ fix-langs: _Lang.d.ts is up to date');
			return;
		}

		typeFile = typeFile.replace(/(export\s+type\s+_Lang\s*=\s*\{)([\s\S]*?)(\n?};?)/, (_match, p1, body, p3) => {
			const existingLines = body.trimEnd().split('\n').filter(Boolean);
			const existingLineMap = new Map(existingLines.map((line) => [line.trim().split(':')[0], line]));
			const sorted = keyOrder.map((k) => existingLineMap.get(k) || `\t${k}: string;`);
			return `${p1}\n${sorted.join('\n')}\n${p3}`;
		});

		fs.writeFileSync(TYPE_FILE, typeFile, 'utf8');
		console.log(`✨ fix-langs: Updated _Lang.d.ts (${toInsert.length} new keys)`);
	} catch (error) {
		console.error('Error updating _Lang.d.ts:', error);
		throw error;
	}
}

async function updateLangFiles() {
	try {
		// First, ensure _Lang.d.ts exists and is up to date
		updateTypeDef();

		const files = await glob(filesPath, { ignore: ignorePath });

		if (files.length === 0) {
			console.warn('⚠️  fix-langs: No lang files found');
			return;
		}

		for (const file of files) {
			const baseName = path.basename(file, path.extname(file)).slice(0, -2);
			if (baseName === '_Lang' || baseName === 'index') {
				continue;
			}

			const newContent = `import { _Lang } from './_Lang';
declare const ${baseName}: _Lang;
export default ${baseName};
`;
			await fs.promises.writeFile(file, newContent, 'utf8');
		}

		console.log('✅ fix-langs: Completed');
	} catch (error) {
		console.error('❌ fix-langs: Error:', error);
	}
}

updateLangFiles();
