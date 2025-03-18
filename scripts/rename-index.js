import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '../types/index.ts');
const targetPath = path.join(__dirname, '../types/index.d.ts');

// copy index.ts to index.d.ts
fs.copyFile(sourcePath, targetPath, (copyErr) => {
	if (copyErr) {
		console.error('copy index error:', copyErr);
		return;
	}

	// delete index.ts
	fs.unlink(sourcePath, (unlinkErr) => {
		if (unlinkErr) {
			console.error('delete index error:', unlinkErr);
			return;
		}
	});
});
// eslint-disable-next-line no-console
console.log('[rename-index]');