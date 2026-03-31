
import Audio_ from '../../../../src/plugins/modal/audio';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';
import { dom, env } from '../../../../src/helper';

// MOCKS

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockReturnValue({ value: '', files: [], src: '' })
		},
		isUpdate: false
	})),
	Controller: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn()
	})),
	Figure: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		retainFigureFormat: jest.fn()
	}))
}));

jest.mock('../../../../src/modules/manager', () => ({
	FileManager: jest.fn().mockImplementation(() => ({
		getSize: jest.fn().mockReturnValue(0),
		upload: jest.fn(),
		setFileData: jest.fn()
	}))
}));

jest.mock('../../../../src/modules/ui', () => ({
	_DragHandle: { get: jest.fn().mockReturnValue(null) }
}));

const mockModal = require('../../../../src/modules/contract').Modal;
const mockFigure = require('../../../../src/modules/contract').Figure;

Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue('')
});

Object.assign(mockFigure, {
	GetContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {}, querySelector: jest.fn(), previousElementSibling: null, nextElementSibling: null, parentNode: { childNodes: { length: 0 } } },
		cover: { nodeType: 1 },
		align: 'center'
	}),
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {}, querySelector: jest.fn() },
		cover: { nodeType: 1, appendChild: jest.fn() }
	})
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn((tag, attrs) => {
				const el = {
					nodeName: tag,
					style: {},
					setAttribute: jest.fn(),
					getAttribute: jest.fn(),
					appendChild: jest.fn(),
					cloneNode: jest.fn().mockReturnValue({
						nodeName: tag,
						setAttribute: jest.fn(),
						getAttribute: jest.fn(),
						style: {}
					}),
					querySelector: jest.fn().mockReturnValue(null),
					src: '',
					controls: false
				};
				return el;
			}),
			removeItem: jest.fn(),
			createTooltipInner: jest.fn().mockReturnValue('')
		},
		query: {
			getParentElement: jest.fn().mockReturnValue(null),
			getEventTarget: jest.fn((e) => e.target || e)
		}
	},
	numbers: {
		is: jest.fn((val) => typeof val === 'number'),
		get: jest.fn((val, def) => (val !== undefined && val !== null && val !== '' ? Number(val) || def : def))
	},
	env: {
		NO_EVENT: Symbol('NO_EVENT'),
		ON_OVER_COMPONENT: Symbol('ON_OVER_COMPONENT')
	}
}));

describe('Audio Plugin', () => {
	let kernel;
	let audio;

	beforeEach(() => {
		kernel = createMockEditor();
		// Add missing lang keys for audio
		kernel.$.lang.audio = 'Audio';
		kernel.$.lang.audio_modal_title = 'Insert Audio';
		kernel.$.lang.audio_modal_file = 'Select from files';
		kernel.$.lang.audio_modal_url = 'Audio URL';
		kernel.$.lang.submitButton = 'Submit';
		kernel.$.lang.close = 'Close';
		kernel.$.lang.edit = 'Edit';
		kernel.$.lang.copy = 'Copy';
		kernel.$.lang.remove = 'Remove';
		kernel.$.lang.audioGallery = 'Audio Gallery';

		// Reset mocks
		dom.utils.createElement.mockClear();
		mockModal.OnChangeFile.mockClear();
		mockFigure.GetContainer.mockClear();
		mockFigure.CreateContainer.mockClear();

		// Make createElement return proper elements for modal and controller
		dom.utils.createElement.mockImplementation((tag, attrs, html) => {
			const el = document.createElement('div');
			if (html) el.innerHTML = html;
			if (attrs) {
				Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
			}
			// Ensure query selectors return useful elements
			return el;
		});

		audio = new Audio_(kernel, {
			defaultWidth: '300px',
			defaultHeight: '50px',
			createUrlInput: true,
			createFileInput: false
		});
	});

	describe('Static Properties', () => {
		it('should have key "audio"', () => {
			expect(Audio_.key).toBe('audio');
		});

		it('should have empty className', () => {
			expect(Audio_.className).toBe('');
		});
	});

	describe('Static component()', () => {
		it('should identify AUDIO nodes', () => {
			const audioNode = { nodeName: 'AUDIO' };
			expect(Audio_.component(audioNode)).toBe(audioNode);
		});

		it('should identify audio nodes case-insensitively', () => {
			const audioNode = { nodeName: 'audio' };
			expect(Audio_.component(audioNode)).toBe(audioNode);
		});

		it('should return null for non-audio nodes', () => {
			expect(Audio_.component({ nodeName: 'VIDEO' })).toBeNull();
			expect(Audio_.component({ nodeName: 'IMG' })).toBeNull();
			expect(Audio_.component({ nodeName: 'DIV' })).toBeNull();
		});

		it('should return null for null/undefined', () => {
			expect(Audio_.component(null)).toBeNull();
			expect(Audio_.component(undefined)).toBeNull();
		});
	});

	describe('Constructor & Initialization', () => {
		it('should create Audio_ instance', () => {
			expect(audio).toBeInstanceOf(Audio_);
		});

		it('should set title from lang', () => {
			expect(audio.title).toBe('Audio');
		});

		it('should set icon to "audio"', () => {
			expect(audio.icon).toBe('audio');
		});

		it('should initialize modal, controller, fileManager, figure', () => {
			expect(audio.modal).toBeTruthy();
			expect(audio.controller).toBeTruthy();
			expect(audio.fileManager).toBeTruthy();
			expect(audio.figure).toBeTruthy();
		});
	});

	describe('Plugin Options', () => {
		it('should store defaultWidth as string with px', () => {
			expect(audio.pluginOptions.defaultWidth).toBe('300px');
		});

		it('should store defaultHeight as string with px', () => {
			expect(audio.pluginOptions.defaultHeight).toBe('50px');
		});

		it('should append px for numeric defaultWidth', () => {
			const a = new Audio_(kernel, { defaultWidth: 400 });
			expect(a.pluginOptions.defaultWidth).toBe('400px');
		});

		it('should use empty string for falsy defaultWidth', () => {
			const a = new Audio_(kernel, {});
			expect(a.pluginOptions.defaultWidth).toBe('');
		});

		it('should default createUrlInput to true when createFileInput is false', () => {
			const a = new Audio_(kernel, { createFileInput: false });
			expect(a.pluginOptions.createUrlInput).toBe(true);
		});

		it('should respect explicit createUrlInput false when file input is enabled', () => {
			const a = new Audio_(kernel, { createFileInput: true, createUrlInput: false });
			expect(a.pluginOptions.createUrlInput).toBe(false);
		});

		it('should set uploadUrl from string', () => {
			const a = new Audio_(kernel, { uploadUrl: '/api/upload' });
			expect(a.pluginOptions.uploadUrl).toBe('/api/upload');
		});

		it('should set uploadUrl to null for non-string', () => {
			const a = new Audio_(kernel, { uploadUrl: 123 });
			expect(a.pluginOptions.uploadUrl).toBeNull();
		});

		it('should set default acceptedFormats to audio/*', () => {
			const a = new Audio_(kernel, {});
			expect(a.pluginOptions.acceptedFormats).toBe('audio/*');
		});

		it('should use audio/* for wildcard acceptedFormats', () => {
			const a = new Audio_(kernel, { acceptedFormats: '*' });
			expect(a.pluginOptions.acceptedFormats).toBe('audio/*');
		});

		it('should use custom acceptedFormats', () => {
			const a = new Audio_(kernel, { acceptedFormats: 'audio/mp3,audio/wav' });
			expect(a.pluginOptions.acceptedFormats).toBe('audio/mp3,audio/wav');
		});

		it('should handle audioTagAttributes', () => {
			const attrs = { preload: 'auto', crossorigin: 'anonymous' };
			const a = new Audio_(kernel, { audioTagAttributes: attrs });
			expect(a.pluginOptions.audioTagAttributes).toEqual(attrs);
		});

		it('should handle uploadHeaders', () => {
			const headers = { 'Authorization': 'Bearer token' };
			const a = new Audio_(kernel, { uploadHeaders: headers });
			expect(a.pluginOptions.uploadHeaders).toEqual(headers);
		});

		it('should handle upload size limits', () => {
			const a = new Audio_(kernel, {
				uploadSizeLimit: 10000,
				uploadSingleSizeLimit: 5000
			});
			expect(a.pluginOptions.uploadSizeLimit).toBe(10000);
			expect(a.pluginOptions.uploadSingleSizeLimit).toBe(5000);
		});

		it('should set allowMultiple option', () => {
			const a = new Audio_(kernel, { allowMultiple: true });
			expect(a.pluginOptions.allowMultiple).toBe(true);
		});
	});

	describe('open()', () => {
		it('should call modal.open', () => {
			audio.open();
			expect(audio.modal.open).toHaveBeenCalled();
		});
	});

	describe('retainFormat()', () => {
		it('should return query and method for audio elements', () => {
			const result = audio.retainFormat();
			expect(result).toHaveProperty('query', 'audio');
			expect(result).toHaveProperty('method');
			expect(typeof result.method).toBe('function');
		});

		it('should skip element with existing figure container', () => {
			const result = audio.retainFormat();
			mockFigure.GetContainer.mockReturnValueOnce({
				container: { nodeType: 1 },
				cover: { nodeType: 1 }
			});

			const audioEl = { nodeName: 'AUDIO', setAttribute: jest.fn(), getAttribute: jest.fn() };
			result.method(audioEl);
			// Should return early, not call CreateContainer
			expect(mockFigure.CreateContainer).not.toHaveBeenCalled();
		});

		it('should create figure container for audio without existing container', () => {
			const result = audio.retainFormat();
			mockFigure.GetContainer.mockReturnValueOnce(null);

			const audioEl = {
				nodeName: 'AUDIO',
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				cloneNode: jest.fn().mockReturnValue({
					nodeName: 'AUDIO',
					setAttribute: jest.fn(),
					getAttribute: jest.fn()
				})
			};
			result.method(audioEl);

			expect(mockFigure.CreateContainer).toHaveBeenCalled();
		});
	});

	describe('onFilePasteAndDrop()', () => {
		it('should call submitFile for audio files', () => {
			const submitFileSpy = jest.spyOn(audio, 'submitFile').mockResolvedValue(true);
			const audioFile = { type: 'audio/mp3', name: 'test.mp3' };

			audio.onFilePasteAndDrop({ file: audioFile });

			expect(submitFileSpy).toHaveBeenCalledWith([audioFile]);
			expect(kernel.$.focusManager.focus).toHaveBeenCalled();
			submitFileSpy.mockRestore();
		});

		it('should ignore non-audio files', () => {
			const submitFileSpy = jest.spyOn(audio, 'submitFile');
			const imageFile = { type: 'image/png', name: 'test.png' };

			audio.onFilePasteAndDrop({ file: imageFile });

			expect(submitFileSpy).not.toHaveBeenCalled();
			submitFileSpy.mockRestore();
		});

		it('should ignore video files', () => {
			const submitFileSpy = jest.spyOn(audio, 'submitFile');
			const videoFile = { type: 'video/mp4', name: 'test.mp4' };

			audio.onFilePasteAndDrop({ file: videoFile });

			expect(submitFileSpy).not.toHaveBeenCalled();
			submitFileSpy.mockRestore();
		});
	});

	describe('modalOn()', () => {
		it('should set multiple attribute when creating new and allowMultiple is true', () => {
			const a = new Audio_(kernel, { allowMultiple: true, createFileInput: true });
			if (a.audioInputFile) {
				a.modalOn(false);
				expect(a.audioInputFile.setAttribute).toHaveBeenCalledWith('multiple', 'multiple');
			}
		});

		it('should remove multiple attribute when updating and allowMultiple is true', () => {
			const a = new Audio_(kernel, { allowMultiple: true, createFileInput: true });
			if (a.audioInputFile) {
				a.modalOn(true);
				expect(a.audioInputFile.removeAttribute).toHaveBeenCalledWith('multiple');
			}
		});
	});

	describe('modalAction()', () => {
		it('should return false when no file or URL provided', async () => {
			// No file input files, and empty urlValue
			const result = await audio.modalAction();
			expect(result).toBe(false);
		});
	});

	describe('modalInit()', () => {
		it('should reset form state', () => {
			audio.modalInit();
			expect(mockModal.OnChangeFile).toHaveBeenCalled();
		});

		it('should clear URL input', () => {
			if (audio.audioUrlFile) {
				audio.audioUrlFile.value = 'https://example.com/audio.mp3';
				audio.modalInit();
				expect(audio.audioUrlFile.value).toBe('');
			}
		});
	});

	describe('controllerAction()', () => {
		let existingEl;

		beforeEach(() => {
			existingEl = document.createElement('audio');
			existingEl.src = 'https://example.com/audio.mp3';
			audio.componentSelect(existingEl);
		});

		it('should open modal on update command', () => {
			const target = { getAttribute: jest.fn().mockReturnValue('update') };
			const openSpy = jest.spyOn(audio, 'open');
			audio.controllerAction(target);
			expect(openSpy).toHaveBeenCalled();
			openSpy.mockRestore();
		});

		it('should copy component on copy command', () => {
			const target = { getAttribute: jest.fn().mockReturnValue('copy') };
			audio.controllerAction(target);
			expect(kernel.$.component.copy).toHaveBeenCalled();
		});

		it('should call componentDestroy on delete command', () => {
			const target = { getAttribute: jest.fn().mockReturnValue('delete') };
			const destroySpy = jest.spyOn(audio, 'componentDestroy').mockResolvedValue(undefined);
			audio.controllerAction(target);
			expect(destroySpy).toHaveBeenCalledWith(null);
			destroySpy.mockRestore();
		});
	});

	describe('componentSelect()', () => {
		it('should call figure.open with correct options', () => {
			const target = document.createElement('audio');
			audio.componentSelect(target);

			expect(audio.figure.open).toHaveBeenCalledWith(
				target,
				expect.objectContaining({
					nonResizing: true,
					nonSizeInfo: true,
					nonBorder: true,
					figureTarget: true,
					infoOnly: false
				})
			);
		});

		it('should open controller', () => {
			const target = document.createElement('audio');
			audio.componentSelect(target);

			expect(audio.controller.open).toHaveBeenCalledWith(
				target,
				null,
				expect.objectContaining({ isWWTarget: false, addOffset: null })
			);
		});
	});

	describe('componentDestroy()', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = document.createElement('audio');
			mockTarget.src = 'https://example.com/audio.mp3';

			const mockContainer = document.createElement('div');
			const mockParent = document.createElement('div');
			mockParent.appendChild(mockContainer);

			mockFigure.GetContainer.mockReturnValue({
				container: mockContainer,
				cover: { nodeType: 1 }
			});
		});

		it('should complete destroy flow when event does not return false', async () => {
			audio.componentSelect(mockTarget);
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

			await audio.componentDestroy(mockTarget);

			expect(kernel.$.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onAudioDeleteBefore',
				expect.objectContaining({ element: mockTarget })
			);
			expect(kernel.$.focusManager.focusEdge).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should return early when event returns false', async () => {
			kernel.$.history.push.mockClear();
			audio.componentSelect(mockTarget);
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(false);

			await audio.componentDestroy(mockTarget);

			expect(kernel.$.history.push).not.toHaveBeenCalled();
		});
	});

	describe('submitFile()', () => {
		it('should return false for empty file list', async () => {
			const result = await audio.submitFile([]);
			expect(result).toBe(false);
		});

		it('should skip non-audio files', async () => {
			const files = [
				{ name: 'image.jpg', type: 'image/jpeg', size: 1000 }
			];
			// No valid audio files → fileSize stays 0, files array empty
			// triggerEvent is called with the empty files
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
			const result = await audio.submitFile(files);
			expect(result).toBe(true);
		});

		it('should process audio files', async () => {
			const files = [
				{ name: 'song.mp3', type: 'audio/mp3', size: 1000 }
			];
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
			const result = await audio.submitFile(files);
			expect(result).toBe(true);
		});

		it('should reject single file exceeding singleSizeLimit', async () => {
			const a = new Audio_(kernel, { uploadSingleSizeLimit: 5000 });
			const files = [{ name: 'large.mp3', type: 'audio/mp3', size: 10000 }];

			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
			const result = await a.submitFile(files);
			expect(result).toBe(false);
			expect(kernel.$.ui.alertOpen).toHaveBeenCalled();
		});

		it('should use custom error message from onAudioUploadError when single size exceeded', async () => {
			const a = new Audio_(kernel, { uploadSingleSizeLimit: 5000 });
			const files = [{ name: 'large.mp3', type: 'audio/mp3', size: 10000 }];

			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce('Custom error');
			const result = await a.submitFile(files);
			expect(result).toBe(false);
			expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith('Custom error', 'error');
		});

		it('should use default error when onAudioUploadError returns NO_EVENT', async () => {
			const a = new Audio_(kernel, { uploadSingleSizeLimit: 5000 });
			const files = [{ name: 'large.mp3', type: 'audio/mp3', size: 10000 }];

			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);
			const result = await a.submitFile(files);
			expect(result).toBe(false);
			expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.audioUpload.fail]'),
				'error'
			);
		});

		it('should reject when total files exceed uploadSizeLimit', async () => {
			const a = new Audio_(kernel, { uploadSizeLimit: 2000 });
			const files = [
				{ name: 's1.mp3', type: 'audio/mp3', size: 1500 },
				{ name: 's2.mp3', type: 'audio/mp3', size: 1500 }
			];

			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
			const result = await a.submitFile(files);
			expect(result).toBe(false);
			expect(kernel.$.ui.alertOpen).toHaveBeenCalled();
		});

		it('should use NO_EVENT default error for total upload size', async () => {
			const a = new Audio_(kernel, { uploadSizeLimit: 2000 });
			const files = [
				{ name: 's1.mp3', type: 'audio/mp3', size: 1500 },
				{ name: 's2.mp3', type: 'audio/mp3', size: 1500 }
			];

			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);
			const result = await a.submitFile(files);
			expect(result).toBe(false);
			expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('[SUNEDITOR.audioUpload.fail]'),
				'error'
			);
		});

		it('should return false when onAudioUploadBefore returns false', async () => {
			const files = [{ name: 'song.mp3', type: 'audio/mp3', size: 1000 }];
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(false);
			const result = await audio.submitFile(files);
			expect(result).toBe(false);
		});

		it('should call handler when onAudioUploadBefore returns true', async () => {
			const files = [{ name: 'song.mp3', type: 'audio/mp3', size: 1000 }];
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(true);
			const result = await audio.submitFile(files);
			expect(result).toBe(true);
		});

		it('should call handler when onAudioUploadBefore returns NO_EVENT', async () => {
			const files = [{ name: 'song.mp3', type: 'audio/mp3', size: 1000 }];
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);
			const result = await audio.submitFile(files);
			expect(result).toBe(true);
		});

		it('should call handler with custom info object', async () => {
			const files = [{ name: 'song.mp3', type: 'audio/mp3', size: 1000 }];
			const customInfo = { files, isUpdate: false };
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(customInfo);
			const result = await audio.submitFile(files);
			expect(result).toBe(true);
		});
	});

	describe('submitURL()', () => {
		it('should return false for empty URL', async () => {
			const result = await audio.submitURL('');
			expect(result).toBe(false);
		});

		it('should process valid URL', async () => {
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
			const result = await audio.submitURL('https://example.com/audio.mp3');
			expect(result).toBe(true);
		});

		it('should return false when onAudioUploadBefore returns false', async () => {
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(false);
			const result = await audio.submitURL('https://example.com/audio.mp3');
			expect(result).toBe(false);
		});

		it('should call handler when event returns true', async () => {
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(true);
			const result = await audio.submitURL('https://example.com/audio.mp3');
			expect(result).toBe(true);
		});

		it('should call handler when event returns NO_EVENT', async () => {
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);
			const result = await audio.submitURL('https://example.com/audio.mp3');
			expect(result).toBe(true);
		});

		it('should call handler with object when event returns object', async () => {
			const customResult = { url: 'custom-url', files: { name: 'test', size: 0 } };
			kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(customResult);
			const result = await audio.submitURL('https://example.com/audio.mp3');
			expect(result).toBe(true);
		});
	});

	describe('create()', () => {
		let mockAudioEl;

		beforeEach(() => {
			mockAudioEl = document.createElement('audio');
			mockAudioEl.src = '';
			kernel.$.component.insert.mockReturnValue(true);
		});

		it('should create new audio component when isUpdate is false', () => {
			audio.create(mockAudioEl, 'https://example.com/audio.mp3', { name: 'audio.mp3', size: 1000 }, false, true);

			expect(mockFigure.CreateContainer).toHaveBeenCalledWith(mockAudioEl, 'se-flex-component');
			expect(audio.fileManager.setFileData).toHaveBeenCalled();
			expect(kernel.$.component.insert).toHaveBeenCalled();
		});

		it('should set src on element', () => {
			audio.create(mockAudioEl, 'https://example.com/audio.mp3', { name: 'audio.mp3', size: 1000 }, false, true);
			expect(mockAudioEl.src).toContain('audio.mp3');
		});

		it('should call component.insert with scrollTo=true when isLast=true', () => {
			audio.create(mockAudioEl, 'https://example.com/audio.mp3', { name: 'audio.mp3', size: 1000 }, false, true);

			expect(kernel.$.component.insert).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ scrollTo: true })
			);
		});

		it('should call component.insert with scrollTo=false when isLast=false', () => {
			audio.create(mockAudioEl, 'https://example.com/audio.mp3', { name: 'audio.mp3', size: 1000 }, false, false);

			expect(kernel.$.component.insert).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ scrollTo: false, insertBehavior: 'line' })
			);
		});

		it('should update existing element src when isUpdate is true', () => {
			// First select an element to set internal #element
			const existingEl = document.createElement('audio');
			existingEl.src = 'https://example.com/old.mp3';
			audio.componentSelect(existingEl);

			audio.create(mockAudioEl, 'https://example.com/new.mp3', { name: 'new.mp3', size: 1000 }, true, true);

			expect(existingEl.src).toContain('new.mp3');
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should call component.select when updating with same src', () => {
			const existingEl = document.createElement('audio');
			existingEl.src = 'https://example.com/same.mp3';
			audio.componentSelect(existingEl);

			audio.create(mockAudioEl, 'https://example.com/same.mp3', { name: 'same.mp3', size: 1000 }, true, true);

			expect(kernel.$.component.select).toHaveBeenCalled();
		});
	});

	describe('modalOn() with element set', () => {
		it('should set URL and preview when updating with existing element', () => {
			const existingEl = document.createElement('audio');
			existingEl.src = 'https://example.com/existing.mp3';
			audio.componentSelect(existingEl);

			audio.modalOn(true);

			if (audio.audioUrlFile) {
				expect(audio.audioUrlFile.value).toBe('https://example.com/existing.mp3');
			}
		});

		it('should handle update without element', () => {
			// Don't set an element, just call modalOn with isUpdate=true
			// This hits the else branch (line 167-168)
			expect(() => audio.modalOn(true)).not.toThrow();
		});
	});

	describe('modalAction() with file input', () => {
		it('should call submitFile when file input has files', async () => {
			const a = new Audio_(kernel, { createFileInput: true, createUrlInput: true });
			if (a.audioInputFile) {
				Object.defineProperty(a.audioInputFile, 'files', {
					value: [{ name: 'test.mp3', type: 'audio/mp3', size: 1000 }],
					writable: true
				});
				const submitSpy = jest.spyOn(a, 'submitFile').mockResolvedValue(true);
				const result = await a.modalAction();
				expect(submitSpy).toHaveBeenCalled();
				submitSpy.mockRestore();
			}
		});
	});

	describe('Audio with file input constructor', () => {
		it('should bind events when both inputs exist', () => {
			const a = new Audio_(kernel, { createFileInput: true, createUrlInput: true });
			// Constructor should have registered events via eventManager
			expect(kernel.$.eventManager.addEvent).toHaveBeenCalled();
		});
	});

	describe('#OnLinkPreview (via event handler)', () => {
		let inputHandler;

		beforeEach(() => {
			dom.query.getEventTarget.mockReset();
			dom.query.getEventTarget.mockImplementation((e) => e.target || e);

			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const found = addEventCalls.find(
				(call) => call[0] === audio.audioUrlFile && call[1] === 'input'
			);
			inputHandler = found ? found[2] : null;
		});

		it('should set preview for URL with protocol', () => {
			if (!inputHandler) return;

			kernel.$.options.get = jest.fn(() => undefined);
			inputHandler({ target: { value: 'https://example.com/audio.mp3' } });

			if (audio.preview) {
				expect(audio.preview.textContent).toBe('https://example.com/audio.mp3');
			}
		});

		it('should set empty preview for empty value', () => {
			if (!inputHandler) return;

			inputHandler({ target: { value: '' } });
			if (audio.preview) {
				expect(audio.preview.textContent).toBe('');
			}
		});

		it('should add defaultUrlProtocol when URL has no protocol', () => {
			if (!inputHandler) return;

			kernel.$.options.get = jest.fn((key) => {
				if (key === 'defaultUrlProtocol') return 'https://';
				return undefined;
			});
			inputHandler({ target: { value: 'example.com/audio.mp3' } });

			if (audio.preview) {
				expect(audio.preview.textContent).toBe('https://example.com/audio.mp3');
			}
		});
	});
});
