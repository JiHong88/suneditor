#!/usr/bin/env node

/**
 * Generate TypeScript declaration files for CSS imports
 */

const fs = require('fs');
const path = require('path');

const typesDir = path.join(__dirname, '../../types/assets');
const cssFiles = [
	{ module: 'suneditor/css', file: 'suneditor.css.d.ts' },
	{ module: 'suneditor/css/contents', file: 'suneditor-contents.css.d.ts' },
];

// Ensure directory exists
if (!fs.existsSync(typesDir)) {
	fs.mkdirSync(typesDir, { recursive: true });
}

// Generate declaration files
cssFiles.forEach(({ module, file }) => {
	const content = `declare module '${module}';\n`;
	const filePath = path.join(typesDir, file);
	fs.writeFileSync(filePath, content, 'utf8');
	console.log(`✅ Generated: ${file}`);
});

console.log('✨ CSS type declarations generated successfully');
