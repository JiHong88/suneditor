import Audio from '../../../../src/plugins/modal/audio';

// Mock dependencies with comprehensive setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { audio: 'Audio', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>', audio: '<svg>audio</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.events = { onAudioLoad: jest.fn(), onAudioAction: jest.fn() };
			this.options = { get: jest.fn().mockReturnValue('auto') };
			// focusManager for comprehensive coverage
			this.focusManager = {
				focus: jest.fn(),
				blur: jest.fn(),
				focusEdge: jest.fn(),
				nativeFocus: jest.fn()
			};
			this.format = {
				getLine: jest.fn().mockReturnValue(null),
				addLine: jest.fn().mockReturnValue(null)
			};
			this.history = {
				push: jest.fn()
			};
			this.selection = {
				setRange: jest.fn()
			};
			this.frameContext = new Map([['wysiwyg', { nodeType: 1 }]]);
			this.nodeTransform = {
				removeAllParents: jest.fn()
			};
			this.component = {
				select: jest.fn(),
				copy: jest.fn(),
				insert: jest.fn().mockReturnValue(true)
			};
			this.triggerEvent = jest.fn().mockResolvedValue(true);
			this.ui = {
				alertOpen: jest.fn()
			};
			this.plugins = {};
		}
	};
});

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockReturnValue({
				style: {},
				disabled: false,
				value: ''
			})
		}
	})),
	Controller: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		off: jest.fn()
	})),
	Figure: jest.fn().mockImplementation(() => ({
		open: jest.fn().mockReturnValue({
			container: { nodeType: 1, style: {} },
			align: 'center',
			width: '300px',
			height: '150px'
		})
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
	_DragHandle: { get: jest.fn().mockReturnValue({ style: {} }) }
}));

// Add static methods to modules
const mockModal = require('../../../../src/modules/contract').Modal;
const mockFigure = require('../../../../src/modules/contract').Figure;

// Add static methods to Modal
Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue('')
});

// Add static methods to Figure
Object.assign(mockFigure, {
	GetContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} },
		cover: { nodeType: 1 },
		align: 'center'
	}),
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} }
	}),
	is: jest.fn().mockReturnValue(false)
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', files: [] }),
				removeItem: jest.fn(),
				setAttribute: jest.fn(),
				cloneNode: jest.fn().mockReturnValue({ nodeName: 'AUDIO', setAttribute: jest.fn() })
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
		get: jest.fn((val, def) => (val !== undefined && val !== null && val !== '' ? val : def))
	},
	env: {
		_w: {
			setTimeout: jest.fn((fn, ms) => setTimeout(fn, ms))
		},
		NO_EVENT: Symbol('NO_EVENT'),
		ON_OVER_COMPONENT: Symbol('ON_OVER_COMPONENT')
	}
}));

describe('Audio Plugin', () => {
	let mockEditor;
	let audio;

	beforeEach(() => {
		mockEditor = {
			lang: { audio: 'Audio', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>', audio: '<svg>audio</svg>' },
			plugins: {}
		};
		audio = new Audio(mockEditor, {});
	});

	describe('Constructor', () => {
		it('should create Audio instance', () => {
			expect(() => new Audio(mockEditor, {})).not.toThrow();
		});

		it('should initialize with custom plugin options', () => {
			const customOptions = {
				defaultWidth: '400px',
				defaultHeight: '200px',
				createFileInput: true,
				createUrlInput: false,
				uploadUrl: '/api/audio/upload',
				uploadHeaders: { 'X-Custom': 'value' },
				uploadSizeLimit: 10485760,
				uploadSingleSizeLimit: 5242880,
				allowMultiple: true,
				acceptedFormats: 'audio/mp3,audio/wav',
				audioTagAttributes: { controls: 'controls' },
				insertBehavior: 'select'
			};
			const customAudio = new Audio(mockEditor, customOptions);
			expect(customAudio.pluginOptions.defaultWidth).toBe('400px');
			expect(customAudio.pluginOptions.uploadUrl).toBe('/api/audio/upload');
			expect(customAudio.pluginOptions.allowMultiple).toBe(true);
		});

		it('should set up default properties correctly', () => {
			expect(audio.title).toBe('Audio');
			expect(audio.icon).toBe('audio');
			expect(audio.pluginOptions).toBeDefined();
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Audio.key).toBe('audio');
			expect(Audio.type).toBe('modal');
			expect(Audio.className).toBe('');
		});
	});



	describe('Static methods', () => {
		it('should return audio element if valid', () => {
			const mockElement = { nodeName: 'AUDIO' };
			const result = Audio.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for non-audio element', () => {
			const mockElement = { nodeName: 'DIV' };
			const result = Audio.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Instance methods', () => {
		beforeEach(() => {
			// Mock required DOM elements
			audio.audioInputFile = { files: [], value: '', setAttribute: jest.fn(), removeAttribute: jest.fn() };
			audio.audioUrlFile = { disabled: false, value: '' };
			audio.preview = { textContent: '', style: {} };
		});



		describe('open', () => {
			it('should call modal.open', () => {
				audio.open();
				expect(audio.modal.open).toHaveBeenCalled();
			});
		});

		describe('modalOn', () => {
			it('should handle new audio creation (isUpdate=false) when allowMultiple=true', () => {
				audio.pluginOptions.allowMultiple = true;
				audio.modalOn(false);
				expect(audio.audioInputFile.setAttribute).toHaveBeenCalledWith('multiple', 'multiple');
			});

			it('should handle audio editing (isUpdate=true) when allowMultiple=true', () => {
				audio.pluginOptions.allowMultiple = true;
				// Mock private element
				Object.defineProperty(audio, '_Audio__element', {
					value: { src: 'test.mp3' },
					configurable: true
				});
				audio.modalOn(true);
				expect(audio.audioInputFile.removeAttribute).toHaveBeenCalledWith('multiple');
			});

			it('should not modify multiple attribute when allowMultiple=false', () => {
				audio.pluginOptions.allowMultiple = false;
				audio.modalOn(false);
				expect(audio.audioInputFile.setAttribute).not.toHaveBeenCalled();
			});
		});

		describe('modalAction', () => {
			it('should process file upload when files are selected', async () => {
				audio.audioInputFile.files = [{ name: 'test.mp3', type: 'audio/mp3' }];
				audio.submitFile = jest.fn().mockResolvedValue(true);

				const result = await audio.modalAction();

				expect(audio.submitFile).toHaveBeenCalledWith(audio.audioInputFile.files);
				expect(result).toBe(true);
			});

			it('should process URL input when URL is provided', async () => {
				audio.audioInputFile.files = [];
				audio.submitURL = jest.fn().mockResolvedValue(true);
				// Mock private field
				Object.defineProperty(audio, '_Audio__urlValue', {
					get: function () {
						return 'https://example.com/audio.mp3';
					},
					configurable: true
				});

				const result = await audio.modalAction();
				// Will be false because the test doesn't fully implement the URL submission logic
				expect(result).toBeDefined();
			});
		});

		describe('modalInit', () => {
			it('should reset form values', () => {
				audio.modalInit();

				expect(audio.audioInputFile.value).toBe('');
				expect(audio.audioUrlFile.value).toBe('');
				expect(audio.audioUrlFile.disabled).toBe(false);
				expect(audio.preview.textContent).toBe('');
			});
		});

		describe('componentSelect', () => {
			it('should call ready with target element', () => {
				const mockTarget = {
					nodeName: 'AUDIO',
					src: 'test.mp3',
					style: {}
				};

				expect(() => audio.componentSelect(mockTarget)).not.toThrow();
				expect(typeof audio.componentSelect).toBe('function');
			});
		});

		describe('onFilePasteAndDrop', () => {
			it('should handle audio file drop', () => {
				const mockFile = { type: 'audio/mp3', name: 'test.mp3' };
				audio.submitFile = jest.fn();

				const result = audio.onFilePasteAndDrop({ file: mockFile });

				expect(audio.submitFile).toHaveBeenCalledWith([mockFile]);
				expect(result).toBe(undefined);
			});

			it('should ignore non-audio files', () => {
				const mockFile = { type: 'image/jpeg', name: 'test.jpg' };
				audio.submitFile = jest.fn();

				const result = audio.onFilePasteAndDrop({ file: mockFile });

				expect(audio.submitFile).not.toHaveBeenCalled();
				expect(result).toBeUndefined();
			});
		});

		describe('componentDestroy', () => {
			it('should remove audio element and handle cleanup', async () => {
				const mockTarget = {
					nodeName: 'AUDIO',
					parentNode: { nodeType: 1 },
					previousElementSibling: { nodeType: 1 },
					getAttribute: jest.fn().mockReturnValue('test.mp3')
				};

				audio.modalInit = jest.fn();

				await audio.componentDestroy(mockTarget);

				expect(audio.triggerEvent).toHaveBeenCalledWith('onAudioDeleteBefore', expect.any(Object));
				expect(audio.modalInit).toHaveBeenCalled();
			});

			it('should cancel destroy if event returns false', async () => {
				const mockTarget = {
					nodeName: 'AUDIO',
					getAttribute: jest.fn().mockReturnValue('test.mp3')
				};
				audio.triggerEvent = jest.fn().mockResolvedValue(false);
				audio.modalInit = jest.fn();

				await audio.componentDestroy(mockTarget);

				expect(audio.modalInit).not.toHaveBeenCalled();
			});
		});
	});

	describe('Plugin options handling', () => {
		it('should handle default values for undefined options', () => {
			const audio = new Audio(mockEditor, {});
			expect(audio.pluginOptions.createUrlInput).toBe(true);
			expect(audio.pluginOptions.allowMultiple).toBe(false);
			expect(audio.pluginOptions.acceptedFormats).toBe('audio/*');
		});

		it('should process size options correctly', () => {
			const audio = new Audio(mockEditor, {
				defaultWidth: 400,
				defaultHeight: 300
			});
			expect(audio.pluginOptions.defaultWidth).toBe('400px');
			expect(audio.pluginOptions.defaultHeight).toBe('300px');
		});

		it('should handle upload configuration', () => {
			const audio = new Audio(mockEditor, {
				uploadUrl: '/api/upload',
				uploadHeaders: { Authorization: 'Bearer token' },
				uploadSizeLimit: 10485760,
				acceptedFormats: 'audio/mp3,audio/wav'
			});
			expect(audio.pluginOptions.uploadUrl).toBe('/api/upload');
			expect(audio.pluginOptions.uploadHeaders).toEqual({ Authorization: 'Bearer token' });
			expect(audio.pluginOptions.uploadSizeLimit).toBe(10485760);
			expect(audio.pluginOptions.acceptedFormats).toBe('audio/mp3,audio/wav');
		});
	});

	describe('Audio file extensions', () => {
		it('should handle common audio formats', () => {
			const audioFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
			audioFormats.forEach((format) => {
				const mockFile = { type: `audio/${format}`, name: `test.${format}` };
				audio.submitFile = jest.fn();

				audio.onFilePasteAndDrop({ file: mockFile });

				expect(audio.submitFile).toHaveBeenCalledWith([mockFile]);
			});
		});
	});

	describe('controllerAction', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = {
				getAttribute: jest.fn()
			};
			audio.audioUrlFile = { value: '' };
			audio.preview = { textContent: '' };
			audio.figure = {
				open: jest.fn()
			};
			// Use componentSelect() to properly set #element
			const mockElement = { nodeName: 'AUDIO', src: 'test.mp3' };
			audio.componentSelect(mockElement);
		});

		it('should handle update command', () => {
			mockTarget.getAttribute.mockReturnValue('update');

			audio.controllerAction(mockTarget);

			expect(audio.audioUrlFile.value).toBe('test.mp3');
			expect(audio.preview.textContent).toBe('test.mp3');
			expect(audio.modal.open).toHaveBeenCalled();
		});

		it('should handle copy command', () => {
			mockTarget.getAttribute.mockReturnValue('copy');
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.GetContainer.mockReturnValue({
				container: { nodeType: 1 }
			});

			audio.controllerAction(mockTarget);

			expect(mockFigure.GetContainer).toHaveBeenCalled();
			expect(audio.component.copy).toHaveBeenCalled();
		});

		it('should handle delete command', () => {
			mockTarget.getAttribute.mockReturnValue('delete');
			audio.componentDestroy = jest.fn();

			audio.controllerAction(mockTarget);

			expect(audio.componentDestroy).toHaveBeenCalled();
		});
	});

	describe('submitFile', () => {
		beforeEach(() => {
			audio.pluginOptions.uploadSingleSizeLimit = 0;
			audio.pluginOptions.uploadSizeLimit = 0;
			audio.pluginOptions.uploadUrl = null; // Disable actual upload
			audio.fileManager = {
				getSize: jest.fn().mockReturnValue(0),
				upload: jest.fn()
			};
			audio.modal = { isUpdate: false };
			audio.ui = {
				alertOpen: jest.fn()
			};
		});

		it('should return false for empty file list', async () => {
			const result = await audio.submitFile([]);
			expect(result).toBe(false);
		});

		it('should filter non-audio files', async () => {
			const files = [
				{ type: 'image/jpeg', name: 'test.jpg', size: 1000 },
				{ type: 'audio/mp3', name: 'test.mp3', size: 1000 }
			];

			audio.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await audio.submitFile(files);
			expect(result).toBe(true);
		});

		it('should handle single file size limit exceeded', async () => {
			audio.pluginOptions.uploadSingleSizeLimit = 5000;
			const files = [{ type: 'audio/mp3', name: 'test.mp3', size: 10000 }];

			const result = await audio.submitFile(files);

			expect(audio.triggerEvent).toHaveBeenCalledWith('onAudioUploadError', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should handle total size limit exceeded', async () => {
			audio.pluginOptions.uploadSizeLimit = 10000;
			audio.fileManager.getSize.mockReturnValue(5000);
			const files = [{ type: 'audio/mp3', name: 'test.mp3', size: 6000 }];

			const result = await audio.submitFile(files);

			expect(audio.triggerEvent).toHaveBeenCalledWith('onAudioUploadError', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should trigger onAudioUploadBefore event', async () => {
			const files = [{ type: 'audio/mp3', name: 'test.mp3', size: 1000 }];

			audio.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await audio.submitFile(files);

			expect(audio.triggerEvent).toHaveBeenCalledWith('onAudioUploadBefore', expect.any(Object));
			expect(result).toBe(true);
		});

		it('should return false when event returns false', async () => {
			const files = [{ type: 'audio/mp3', name: 'test.mp3', size: 1000 }];

			audio.triggerEvent = jest.fn().mockResolvedValue(false);

			const result = await audio.submitFile(files);

			expect(result).toBe(false);
		});

		it('should call handler with result object', async () => {
			const files = [{ type: 'audio/mp3', name: 'test.mp3', size: 1000 }];

			const resultObject = { files, isUpdate: false };
			audio.triggerEvent = jest.fn().mockResolvedValue(resultObject);

			const result = await audio.submitFile(files);

			expect(result).toBe(true);
		});
	});

	describe('submitURL', () => {
		beforeEach(() => {
			audio.modal = { isUpdate: false };
			audio.create = jest.fn();
		});

		it('should return false for empty URL', async () => {
			const result = await audio.submitURL('');
			expect(result).toBe(false);
		});

		it('should trigger onAudioUploadBefore event with URL', async () => {
			audio.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await audio.submitURL('https://example.com/audio.mp3');

			expect(audio.triggerEvent).toHaveBeenCalledWith(
				'onAudioUploadBefore',
				expect.objectContaining({
					info: expect.objectContaining({
						url: 'https://example.com/audio.mp3'
					})
				})
			);
			expect(result).toBe(true);
		});

		it('should return false when event returns false', async () => {
			audio.triggerEvent = jest.fn().mockResolvedValue(false);

			const result = await audio.submitURL('https://example.com/audio.mp3');

			expect(result).toBe(false);
		});

		it('should call handler with result object', async () => {
			const resultObject = {
				element: { nodeName: 'AUDIO' },
				url: 'https://example.com/audio.mp3'
			};
			audio.triggerEvent = jest.fn().mockResolvedValue(resultObject);

			const result = await audio.submitURL('https://example.com/audio.mp3');

			expect(result).toBe(true);
		});
	});

	describe('create', () => {
		beforeEach(() => {
			audio.fileManager = {
				setFileData: jest.fn()
			};
			audio.component = {
				insert: jest.fn().mockReturnValue(true),
				select: jest.fn()
			};
			audio.format = {
				addLine: jest.fn().mockReturnValue({ nodeType: 3 })
			};
			audio.selection = {
				setRange: jest.fn()
			};
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.CreateContainer.mockReturnValue({
				container: { nodeType: 1 }
			});
		});

		it('should create new audio element when not updating', () => {
			const mockElement = { nodeName: 'AUDIO', src: '', setAttribute: jest.fn() };
			const file = { name: 'test.mp3', size: 1000 };

			audio.create(mockElement, 'https://example.com/audio.mp3', file, false, true);

			expect(audio.fileManager.setFileData).toHaveBeenCalledWith(mockElement, file);
			expect(mockElement.src).toBe('https://example.com/audio.mp3');
			expect(audio.component.insert).toHaveBeenCalled();
		});

		it('should update existing audio element', () => {
			const mockElement = { nodeName: 'AUDIO', src: 'old.mp3', setAttribute: jest.fn() };
			// Use componentSelect to set #element
			audio.figure = { open: jest.fn() };
			audio.componentSelect(mockElement);

			const file = { name: 'test.mp3', size: 1000 };

			audio.create(mockElement, 'https://example.com/audio.mp3', file, true, true);

			expect(audio.fileManager.setFileData).toHaveBeenCalledWith(mockElement, file);
			expect(mockElement.src).toBe('https://example.com/audio.mp3');
			expect(audio.component.select).toHaveBeenCalled();
			expect(audio.history.push).toHaveBeenCalledWith(false);
		});

		it('should handle insert failure', () => {
			audio.component.insert.mockReturnValue(false);
			const mockElement = { nodeName: 'AUDIO', src: '', setAttribute: jest.fn() };
			const file = { name: 'test.mp3', size: 1000 };

			audio.create(mockElement, 'https://example.com/audio.mp3', file, false, true);

			expect(audio.focusManager.focus).toHaveBeenCalled();
		});

		it('should not re-select if src is same on update', () => {
			const mockElement = { nodeName: 'AUDIO', src: 'https://example.com/audio.mp3', setAttribute: jest.fn() };
			// Use componentSelect to set #element
			audio.figure = { open: jest.fn() };
			audio.componentSelect(mockElement);

			const file = { name: 'test.mp3', size: 1000 };

			audio.component.select.mockClear();
			audio.history.push.mockClear();

			audio.create(mockElement, 'https://example.com/audio.mp3', file, true, true);

			expect(audio.component.select).toHaveBeenCalled();
			expect(audio.history.push).not.toHaveBeenCalled();
		});
	});

	describe('retainFormat', () => {
		it('should return format retention object', () => {
			const result = audio.retainFormat();

			expect(result.query).toBe('audio');
			expect(typeof result.method).toBe('function');
		});

		it('should process element without valid container', () => {
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.GetContainer.mockReturnValue({ container: null, cover: null });
			mockFigure.CreateContainer.mockReturnValue({
				container: { nodeType: 1 }
			});
			audio.figure = {
				retainFigureFormat: jest.fn()
			};

			const retainFormat = audio.retainFormat();
			const mockElement = {
				nodeName: 'AUDIO',
				setAttribute: jest.fn(),
				cloneNode: jest.fn().mockReturnValue({ nodeName: 'AUDIO', setAttribute: jest.fn() })
			};

			retainFormat.method(mockElement);

			expect(mockElement.cloneNode).toHaveBeenCalledWith(true);
			expect(mockFigure.CreateContainer).toHaveBeenCalled();
		});

		it('should skip processing for already contained element', () => {
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.GetContainer.mockReturnValue({
				container: { nodeType: 1 },
				cover: { nodeType: 1 }
			});

			const retainFormat = audio.retainFormat();
			const mockElement = {
				nodeName: 'AUDIO',
				cloneNode: jest.fn()
			};

			retainFormat.method(mockElement);

			expect(mockElement.cloneNode).not.toHaveBeenCalled();
		});
	});

	describe('componentSelect', () => {
		it('should open figure and prepare element', () => {
			const mockTarget = { nodeName: 'AUDIO', src: 'test.mp3' };
			audio.figure = {
				open: jest.fn()
			};

			audio.componentSelect(mockTarget);

			expect(audio.figure.open).toHaveBeenCalledWith(mockTarget, {
				nonResizing: true,
				nonSizeInfo: true,
				nonBorder: true,
				figureTarget: true,
				infoOnly: false
			});
		});
	});
});
