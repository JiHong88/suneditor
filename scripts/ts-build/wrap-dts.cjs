const fs = require('fs');
const { join } = require('path');

const typedefPath = join(__dirname, '../../types/typedef.d.ts');
const eventsPath = join(__dirname, '../../types/events.d.ts');

/**
 * Process typedef.d.ts
 */
function processTypedef() {
	const content = fs.readFileSync(typedefPath, 'utf8');
	const hasNamespace = content.includes('declare namespace SunEditor');

	if (hasNamespace) {
		// Content already has namespace declaration from JSDoc, just wrap in declare global
		// Remove "declare" keyword and add indentation for global block
		const indentContent = content
			.replace(/declare namespace SunEditor/g, 'namespace SunEditor')
			.split('\n')
			.map((line) => (line.trim() ? `\t${line}` : line))
			.join('\n');

		const wrappedContent = `import type {} from './events';\nexport {};\n\ndeclare global {\n${indentContent}\n}\n\nexport type { SunEditor };\n`;
		fs.writeFileSync(typedefPath, wrappedContent, 'utf8');
		console.log('✨ wrap-dts: Wrapped existing SunEditor namespace in global');
	} else {
		// No namespace yet, create one
		const indentContent = content
			.split('\n')
			.map((line) => (line.trim() ? `\t\t${line}` : line))
			.join('\n');

		const wrappedContent = `import type {} from './events';\nexport {};\n\ndeclare global {\n\tnamespace SunEditor {\n${indentContent}\n\t}\n}\n\nexport type { SunEditor };\n`;
		fs.writeFileSync(typedefPath, wrappedContent, 'utf8');
		console.log('✨ wrap-dts: Created SunEditor namespace and wrapped in global');
	}
}

processTypedef();
