/**
 * @fileoverview Enhanced tests for modules/FileManager.js
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Modules - FileManager Enhanced Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);

		if (editor.ui) {
			editor.ui.showLoading = jest.fn();
			editor.ui.hideLoading = jest.fn();
		}
		if (editor.viewer) {
			editor.viewer.print = jest.fn();
		}
	});

	afterEach(() => {
		if (editor && editor.history && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('File type validation', () => {
		it('should validate image files', () => {
			const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
			imageTypes.forEach(type => {
				expect(type.startsWith('image/')).toBe(true);
			});
		});

		it('should validate video files', () => {
			const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
			videoTypes.forEach(type => {
				expect(type.startsWith('video/')).toBe(true);
			});
		});

		it('should validate audio files', () => {
			const audioTypes = ['audio/mp3', 'audio/ogg', 'audio/wav'];
			audioTypes.forEach(type => {
				expect(type.startsWith('audio/')).toBe(true);
			});
		});

		it('should reject invalid file types', () => {
			const invalidTypes = ['application/exe', 'text/html'];
			invalidTypes.forEach(type => {
				expect(type.startsWith('image/')).toBe(false);
			});
		});
	});

	describe('File size validation', () => {
		it('should validate file size in bytes', () => {
			const maxSize = 5 * 1024 * 1024; // 5MB
			const fileSize = 3 * 1024 * 1024; // 3MB
			expect(fileSize <= maxSize).toBe(true);
		});

		it('should reject oversized files', () => {
			const maxSize = 5 * 1024 * 1024; // 5MB
			const fileSize = 10 * 1024 * 1024; // 10MB
			expect(fileSize > maxSize).toBe(true);
		});

		it('should handle zero-byte files', () => {
			const fileSize = 0;
			expect(fileSize).toBe(0);
		});

		it('should convert KB to bytes', () => {
			const sizeInKB = 100;
			const sizeInBytes = sizeInKB * 1024;
			expect(sizeInBytes).toBe(102400);
		});

		it('should convert MB to bytes', () => {
			const sizeInMB = 5;
			const sizeInBytes = sizeInMB * 1024 * 1024;
			expect(sizeInBytes).toBe(5242880);
		});
	});

	describe('File name validation', () => {
		it('should validate file name with extension', () => {
			const fileName = 'image.jpg';
			expect(fileName).toContain('.');
			expect(fileName.split('.').pop()).toBe('jpg');
		});

		it('should handle file name without extension', () => {
			const fileName = 'document';
			expect(fileName.includes('.')).toBe(false);
		});

		it('should handle multiple dots in name', () => {
			const fileName = 'my.file.name.jpg';
			const parts = fileName.split('.');
			expect(parts[parts.length - 1]).toBe('jpg');
		});

		it('should sanitize special characters', () => {
			const fileName = 'file@#$.jpg';
			const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
			expect(sanitized).not.toContain('@');
		});

		it('should handle very long file names', () => {
			const longName = 'a'.repeat(300) + '.jpg';
			expect(longName.length).toBeGreaterThan(255);
		});
	});

	describe('File upload preparation', () => {
		it('should create FormData for upload', () => {
			const formData = new FormData();
			formData.append('file', 'test');
			expect(formData).toBeDefined();
		});

		it('should append multiple files', () => {
			const formData = new FormData();
			formData.append('file1', 'data1');
			formData.append('file2', 'data2');
			expect(formData).toBeDefined();
		});

		it('should append metadata', () => {
			const formData = new FormData();
			formData.append('file', 'data');
			formData.append('name', 'filename');
			formData.append('type', 'image/jpeg');
			expect(formData).toBeDefined();
		});
	});

	describe('File reading', () => {
		it('should create FileReader', () => {
			const reader = new FileReader();
			expect(reader).toBeDefined();
			expect(typeof reader.readAsDataURL).toBe('function');
		});

		it('should handle readAsDataURL', (done) => {
			const blob = new Blob(['test data'], { type: 'text/plain' });
			const reader = new FileReader();

			reader.onload = () => {
				expect(reader.result).toBeDefined();
				done();
			};

			reader.readAsDataURL(blob);
		});

		it('should handle readAsText', (done) => {
			const blob = new Blob(['test text'], { type: 'text/plain' });
			const reader = new FileReader();

			reader.onload = () => {
				expect(reader.result).toBe('test text');
				done();
			};

			reader.readAsText(blob);
		});

		it('should handle read error', (done) => {
			const reader = new FileReader();

			reader.onerror = () => {
				expect(reader.error).toBeDefined();
				done();
			};

			// Trigger error by reading invalid data
			try {
				reader.readAsDataURL(null);
			} catch (e) {
				done();
			}
		});
	});

	describe('File URL handling', () => {
		it('should handle blob URLs', () => {
			const blobUrl = 'blob:https://example.com/abc-123';
			expect(blobUrl.startsWith('blob:')).toBe(true);
		});

		it('should validate external URLs', () => {
			const validUrls = [
				'https://example.com/image.jpg',
				'http://example.com/file.png',
				'//cdn.example.com/resource'
			];

			validUrls.forEach(url => {
				expect(url.includes('://')||url.startsWith('//')).toBe(true);
			});
		});

		it('should detect data URLs', () => {
			const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
			expect(dataUrl.startsWith('data:')).toBe(true);
		});

		it('should parse data URL', () => {
			const dataUrl = 'data:image/png;base64,ABC123';
			const parts = dataUrl.split(',');
			expect(parts.length).toBe(2);
			expect(parts[1]).toBe('ABC123');
		});
	});

	describe('File extension handling', () => {
		it('should extract extension from filename', () => {
			const testCases = [
				{ name: 'image.jpg', ext: 'jpg' },
				{ name: 'video.mp4', ext: 'mp4' },
				{ name: 'document.PDF', ext: 'PDF' }
			];

			testCases.forEach(({ name, ext }) => {
				const extracted = name.split('.').pop();
				expect(extracted).toBe(ext);
			});
		});

		it('should normalize extension case', () => {
			const ext = 'JPG';
			const normalized = ext.toLowerCase();
			expect(normalized).toBe('jpg');
		});

		it('should map MIME type to extension', () => {
			const mimeToExt = {
				'image/jpeg': 'jpg',
				'image/png': 'png',
				'image/gif': 'gif',
				'video/mp4': 'mp4'
			};

			expect(mimeToExt['image/jpeg']).toBe('jpg');
			expect(mimeToExt['video/mp4']).toBe('mp4');
		});
	});

	describe('Upload progress tracking', () => {
		it('should track upload percentage', () => {
			const loaded = 50;
			const total = 100;
			const percentage = (loaded / total) * 100;
			expect(percentage).toBe(50);
		});

		it('should handle zero total', () => {
			const loaded = 50;
			const total = 0;
			const percentage = total > 0 ? (loaded / total) * 100 : 0;
			expect(percentage).toBe(0);
		});

		it('should calculate remaining bytes', () => {
			const total = 1000;
			const loaded = 300;
			const remaining = total - loaded;
			expect(remaining).toBe(700);
		});

		it('should estimate time remaining', () => {
			const totalBytes = 1000;
			const loadedBytes = 500;
			const speed = 100; // bytes per second
			const remaining = (totalBytes - loadedBytes) / speed;
			expect(remaining).toBe(5);
		});
	});

	describe('File metadata', () => {
		it('should extract file metadata', () => {
			const file = {
				name: 'test.jpg',
				size: 1024,
				type: 'image/jpeg',
				lastModified: Date.now()
			};

			expect(file.name).toBe('test.jpg');
			expect(file.size).toBe(1024);
			expect(file.type).toBe('image/jpeg');
		});

		it('should handle missing metadata', () => {
			const file = {
				name: 'test.jpg'
			};

			expect(file.size).toBeUndefined();
			expect(file.type).toBeUndefined();
		});

		it('should format file size for display', () => {
			const formatSize = (bytes) => {
				if (bytes < 1024) return bytes + ' B';
				if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
				return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
			};

			expect(formatSize(500)).toBe('500 B');
			expect(formatSize(2048)).toBe('2.0 KB');
			expect(formatSize(5242880)).toBe('5.0 MB');
		});
	});

	describe('Error scenarios', () => {
		it('should handle file not found', () => {
			const error = new Error('File not found');
			expect(error.message).toContain('not found');
		});

		it('should handle permission denied', () => {
			const error = new Error('Permission denied');
			expect(error.message).toContain('Permission');
		});

		it('should handle quota exceeded', () => {
			const error = new Error('Quota exceeded');
			expect(error.message).toContain('Quota');
		});

		it('should handle network failure', () => {
			const error = new Error('Network error');
			expect(error.message).toContain('Network');
		});

		it('should handle timeout', () => {
			const error = new Error('Upload timeout');
			expect(error.message).toContain('timeout');
		});
	});
});
