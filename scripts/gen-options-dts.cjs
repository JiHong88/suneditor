const fs = require('fs');
const path = require('path');
const { DEFAULTS } = require('../src/core/section/options.js');

const targetPath = path.join(__dirname, '../types/core/section/options.d.ts');
const original = fs.readFileSync(targetPath, 'utf-8');

function toTSValue(val) {
	if (typeof val === 'string') return JSON.stringify(val);
	if (Array.isArray(val)) {
		return `[${val.map(toTSValue).join(', ')}]`;
	}
	if (typeof val === 'object') {
		const entries = Object.entries(val).map(([k, v]) => `${JSON.stringify(k)}: ${toTSValue(v)}`);
		return `{ ${entries.join(', ')} }`;
	}
	return String(val);
}

let newBody = 'export namespace DEFAULTS {\n';
for (const [k, v] of Object.entries(DEFAULTS)) {
	newBody += `  let ${k}: ${toTSValue(v)};\n`;
}
newBody += '}';

const replaced = original.replace(/export namespace DEFAULTS\s*{[\s\S]*?}(?=\s*export\s)/, newBody);

fs.writeFileSync(targetPath, replaced, 'utf-8');

// eslint-disable-next-line no-console
console.log('[gen-options-dts]');
