/**
 * @fileoverview Unit tests for modules/manager/FileManager.js
 */

import FileManager from '../../../src/modules/manager/FileManager';

// Mock ApiManager
jest.mock('../../../src/modules/manager/ApiManager', () => {
	return jest.fn().mockImplementation(() => ({
		call: jest.fn(),
		asyncCall: jest.fn().mockResolvedValue({}),
		cancel: jest.fn(),
	}));
});

describe('FileManager', () => {
	let fileManager;
	let mockInst;
	let mock$;

	beforeEach(() => {
		jest.clearAllMocks();

		const mockWysiwyg = document.createElement('div');

		mock$ = {
			ui: {
				showLoading: jest.fn(),
				hideLoading: jest.fn(),
			},
			frameContext: new Map([['wysiwyg', mockWysiwyg]]),
			eventManager: {
				triggerEvent: jest.fn(),
				addEvent: jest.fn(),
			},
			component: {
				get: jest.fn(),
				select: jest.fn(),
			},
			store: {
				_editorInitFinished: true,
			},
		};

		mockInst = {
			constructor: { key: 'image', name: 'Image' },
			componentDestroy: jest.fn(),
			componentSelect: jest.fn(),
		};

		fileManager = new FileManager(mockInst, mock$, {
			query: 'img',
			loadEventName: 'onImageLoad',
			actionEventName: 'onImageAction',
		});
	});

	describe('constructor', () => {
		it('should set kind from constructor.key', () => {
			expect(fileManager.kind).toBe('image');
		});

		it('should use constructor.name as fallback when key is missing', () => {
			const instNoKey = {
				constructor: { name: 'Video' },
			};
			const fm = new FileManager(instNoKey, mock$, {
				query: 'video',
				loadEventName: 'onVideoLoad',
				actionEventName: 'onVideoAction',
			});
			expect(fm.kind).toBe('Video');
		});

		it('should initialize empty infoList', () => {
			expect(fileManager.infoList).toEqual([]);
		});

		it('should initialize infoIndex to 0', () => {
			expect(fileManager.infoIndex).toBe(0);
		});

		it('should initialize uploadFileLength to 0', () => {
			expect(fileManager.uploadFileLength).toBe(0);
		});

		it('should store inst reference', () => {
			expect(fileManager.inst).toBe(mockInst);
		});

		it('should store query', () => {
			expect(fileManager.query).toBe('img');
		});

		it('should store event names', () => {
			expect(fileManager.loadEventName).toBe('onImageLoad');
			expect(fileManager.actionEventName).toBe('onImageAction');
		});

		it('should attach __fileManagement to inst', () => {
			expect(mockInst.__fileManagement).toBe(fileManager);
		});
	});

	describe('upload', () => {
		it('should show loading when uploading', () => {
			const files = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
			fileManager.upload('/upload', null, files, jest.fn(), jest.fn());
			expect(mock$.ui.showLoading).toHaveBeenCalled();
		});

		it('should create FormData from FileList-like array', () => {
			const files = [
				new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
				new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
			];
			fileManager.upload('/upload', null, files, jest.fn(), jest.fn());
			expect(fileManager.uploadFileLength).toBe(2);
		});

		it('should use provided FormData when data has formData property', () => {
			const formData = new FormData();
			formData.append('file-0', new File(['test'], 'test.jpg'));
			const data = { formData, size: 3 };
			fileManager.upload('/upload', null, data, jest.fn(), jest.fn());
			expect(fileManager.uploadFileLength).toBe(3);
		});

		it('should call apiManager.call with correct params', () => {
			const files = [new File(['test'], 'test.jpg')];
			const cb = jest.fn();
			const errCb = jest.fn();
			fileManager.upload('/upload', { 'X-Token': 'abc' }, files, cb, errCb);
			expect(fileManager.apiManager.call).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: '/upload',
					headers: { 'X-Token': 'abc' },
				})
			);
		});
	});

	describe('asyncUpload', () => {
		it('should show loading when uploading', async () => {
			const files = [new File(['test'], 'test.jpg')];
			await fileManager.asyncUpload('/upload', null, files);
			expect(mock$.ui.showLoading).toHaveBeenCalled();
		});

		it('should set uploadFileLength from files', async () => {
			const files = [new File(['a'], 'a.jpg'), new File(['b'], 'b.jpg')];
			await fileManager.asyncUpload('/upload', null, files);
			expect(fileManager.uploadFileLength).toBe(2);
		});

		it('should use FormData from data object', async () => {
			const formData = new FormData();
			const data = { formData, size: 5 };
			await fileManager.asyncUpload('/upload', null, data);
			expect(fileManager.uploadFileLength).toBe(5);
		});
	});

	describe('setFileData', () => {
		it('should set data-se-file-name attribute', () => {
			const img = document.createElement('img');
			fileManager.setFileData(img, { name: 'test.jpg', size: 1024 });
			expect(img.getAttribute('data-se-file-name')).toBe('test.jpg');
		});

		it('should set data-se-file-size attribute', () => {
			const img = document.createElement('img');
			fileManager.setFileData(img, { name: 'test.jpg', size: 1024 });
			expect(img.getAttribute('data-se-file-size')).toBe('1024');
		});

		it('should handle null element gracefully', () => {
			expect(() => {
				fileManager.setFileData(null, { name: 'test.jpg', size: 100 });
			}).not.toThrow();
		});
	});

	describe('getSize', () => {
		it('should return 0 when infoList is empty', () => {
			expect(fileManager.getSize()).toBe(0);
		});

		it('should return sum of all file sizes', () => {
			fileManager.infoList = [
				{ size: 1000, index: 0 },
				{ size: 2000, index: 1 },
				{ size: 500, index: 2 },
			];
			expect(fileManager.getSize()).toBe(3500);
		});

		it('should handle string sizes by coercion', () => {
			fileManager.infoList = [{ size: '100', index: 0 }, { size: '200', index: 1 }];
			expect(fileManager.getSize()).toBe(300);
		});
	});

	describe('_resetInfo', () => {
		it('should clear infoList', () => {
			fileManager.infoList = [{ index: 0, size: 100 }, { index: 1, size: 200 }];
			fileManager._resetInfo();
			expect(fileManager.infoList).toEqual([]);
		});

		it('should reset infoIndex to 0', () => {
			fileManager.infoIndex = 5;
			fileManager.infoList = [{ index: 4, size: 100 }];
			fileManager._resetInfo();
			expect(fileManager.infoIndex).toBe(0);
		});

		it('should trigger action events for each file being deleted', () => {
			fileManager.infoList = [{ index: 0, size: 100 }, { index: 1, size: 200 }];
			fileManager._resetInfo();
			// Should fire actionEvent for each item + onFileManagerAction for each
			expect(mock$.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onImageAction',
				expect.objectContaining({ state: 'delete' })
			);
			expect(mock$.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onFileManagerAction',
				expect.objectContaining({ state: 'delete', pluginName: 'image' })
			);
		});

		it('should trigger events for all items', () => {
			fileManager.infoList = [
				{ index: 0, size: 100 },
				{ index: 1, size: 200 },
				{ index: 2, size: 300 },
			];
			fileManager._resetInfo();
			// 3 items * 2 events each = 6 calls
			expect(mock$.eventManager.triggerEvent).toHaveBeenCalledTimes(6);
		});
	});

	describe('_checkInfo', () => {
		it('should handle empty wysiwyg (no matching tags)', () => {
			const wysiwyg = mock$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';
			fileManager.infoList = [];
			expect(() => fileManager._checkInfo(false)).not.toThrow();
		});

		it('should fire load event when loaded is true', () => {
			const wysiwyg = mock$.frameContext.get('wysiwyg');
			const img = document.createElement('img');
			img.src = 'test.jpg';
			wysiwyg.appendChild(img);
			fileManager.infoList = [];
			fileManager._checkInfo(true);
			expect(mock$.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onImageLoad',
				expect.objectContaining({ infoList: expect.any(Array) })
			);
		});

		it('should detect removed files and trigger delete event', () => {
			const wysiwyg = mock$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';
			fileManager.infoList = [{ index: 0, size: 100, src: 'test.jpg' }];
			fileManager._checkInfo(false);
			expect(mock$.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onImageAction',
				expect.objectContaining({ state: 'delete', index: 0 })
			);
		});

		it('should pass when tag count matches infoList and all src match', () => {
			const wysiwyg = mock$.frameContext.get('wysiwyg');
			const img = document.createElement('img');
			img.src = 'test.jpg';
			img.setAttribute('data-se-index', '0');
			wysiwyg.appendChild(img);
			fileManager.infoList = [{ index: 0, size: 100, src: 'test.jpg' }];
			fileManager._checkInfo(false);
			// Should not trigger any delete events since match
			const deleteCalls = mock$.eventManager.triggerEvent.mock.calls.filter(
				(call) => call[1]?.state === 'delete'
			);
			expect(deleteCalls.length).toBe(0);
		});
	});

	describe('__updateTags', () => {
		it('should initialize as empty array', () => {
			expect(fileManager.__updateTags).toEqual([]);
		});
	});
});
