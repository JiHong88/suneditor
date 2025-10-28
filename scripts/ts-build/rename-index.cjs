const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../../types/index.ts');
const targetPath = path.join(__dirname, '../../types/index.d.ts');

// copy index.ts to index.d.ts
fs.copyFile(sourcePath, targetPath, (copyErr) => {
	if (copyErr) {
		console.error('❌ rename-index: Copy error:', copyErr);
		return;
	}

	// delete index.ts
	fs.unlink(sourcePath, (unlinkErr) => {
		if (unlinkErr) {
			console.error('❌ rename-index: Delete error:', unlinkErr);
			return;
		}
	});
});

console.log('✨ rename-index:');
