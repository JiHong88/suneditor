const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const filesPath = 'types/langs/*.d.ts';
const ignorePath = ['types/langs/_Lang.d.ts', 'types/langs/index.d.ts'];

async function updateLangFiles() {
	try {
		const files = await glob(filesPath, { ignore: ignorePath });

		if (files.length === 0) {
			console.warn('fix-langs - not found.');
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

		console.log('[fix-langs]');
	} catch (error) {
		console.error('fix-langs - error:', error);
	}
}

updateLangFiles();
