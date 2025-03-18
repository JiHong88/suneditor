import fs from 'fs';
import { glob } from 'glob';

const filePath = ['types/core/class/*.d.ts', 'types/core/base/eventManager.d.ts'];

async function updateConstructorThis() {
	try {
		const files = await glob(filePath, { ignore: [] });
		if (files.length === 0) {
			console.warn('remove-this-param files 0');
			return;
		}

		for (const file of files) {
			const content = await fs.promises.readFile(file, 'utf8');
			const updatedContent = content.replace(/\bconstructor\b\((?:\n|\s)*(this:\s*.+('|")>,)/, (match, params) => {
				if (params.trim().startsWith('this:')) {
					return match.replace(params, '');
				}

				return match;
			});

			if (updatedContent !== content) {
				await fs.promises.writeFile(file, updatedContent, 'utf8');
			}
		}
		// eslint-disable-next-line no-console
		console.log('[remove-this-params]');
	} catch (error) {
		console.error('remove-this-param error:', error);
	}
}

updateConstructorThis();
