/**
 * @deprecated
 */

const fs = require('fs');
const { glob } = require('glob');

const filePath = ['types/core/class/*.d.ts', 'types/core/event/eventManager.d.ts'];

async function updateConstructorThis() {
	try {
		const files = await glob(filePath, { ignore: [] });
		if (files.length === 0) {
			console.warn('⚠️  remove-this-params: No files found');
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

		console.log('✨ remove-this-params:');
	} catch (error) {
		console.error('❌ remove-this-params: Error:', error);
	}
}

updateConstructorThis();
