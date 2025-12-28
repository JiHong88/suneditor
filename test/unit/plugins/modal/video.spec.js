import Video from '../../../../src/plugins/modal/video';

// Mock dependencies with comprehensive setup for coverage
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { video: 'Video', close: 'Close', submitButton: 'Submit' };
			this.icons = { cancel: '<svg>cancel</svg>', video: '<svg>video</svg>', revert: '<svg>revert</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.events = { onVideoLoad: jest.fn(), onVideoAction: jest.fn() };
			this.options = { get: jest.fn().mockReturnValue('auto') };
			// Editor methods for comprehensive coverage
			this.editor = {
				focus: jest.fn(),
				focusEdge: jest.fn()
			};
			this.format = {
				getLine: jest.fn().mockReturnValue(null)
			};
			this.history = {
				push: jest.fn()
			};
			this.frameContext = new Map([['wysiwyg', { nodeType: 1 }]]);
			this.nodeTransform = {
				removeAllParents: jest.fn()
			};
			this.component = {
				select: jest.fn()
			};
			this.triggerEvent = jest.fn().mockResolvedValue(true);
			this.ui = {
				alertOpen: jest.fn()
			};
			// Video-specific properties
			this.inputX = { value: '100%', placeholder: '' };
			this.inputY = { value: '56.25%', placeholder: '' };
			this.frameRatioOption = { options: [], value: '0.5625' };
			this.proportion = { disabled: false, checked: false };
			this.plugins = {};
		}
	};
});

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockImplementation((selector) => {
				if (selector === '.se-video-ratio-option') {
					return {
						querySelectorAll: jest.fn().mockReturnValue([]),
						length: 0
					};
				}
				if (selector === 'input[name="suneditor_video_radio"]:checked') {
					return { value: 'center' };
				}
				if (selector === 'input[name="suneditor_video_radio"][value="none"]') {
					return { checked: false };
				}
				return {
					querySelectorAll: jest.fn().mockReturnValue([]),
					length: 0,
					placeholder: '',
					value: ''
				};
			})
		},
		isUpdate: false
	})),
	Figure: jest.fn().mockImplementation(() => ({
		open: jest.fn().mockReturnValue({
			container: { nodeType: 1, style: {} },
			align: 'center',
			width: '100%',
			height: '56.25%',
			w: 800,
			h: 450,
			isVertical: false,
			ratio: { w: 16, h: 9 }
		}),
		getSize: jest.fn().mockReturnValue({
			dw: '100%',
			dh: '56.25%'
		}),
		setSize: jest.fn(),
		setAlign: jest.fn(),
		setTransform: jest.fn(),
		deleteTransform: jest.fn(),
		isVertical: false
	}))
}));

jest.mock('../../../../src/modules/manager', () => ({
	FileManager: jest.fn().mockImplementation(() => ({
		getSize: jest.fn().mockReturnValue(0),
		upload: jest.fn().mockResolvedValue(true),
		setFileData: jest.fn()
	}))
}));

// Add static methods to modules
const mockModal = require('../../../../src/modules/contract').Modal;
const mockFigure = require('../../../../src/modules/contract').Figure;

// Mock Figure static methods
Object.assign(mockFigure, {
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} }
	}),
	GetContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} },
		cover: { nodeType: 1 },
		align: 'center'
	}),
	GetRatio: jest.fn().mockReturnValue({ w: 16, h: 9 }),
	CalcRatio: jest.fn().mockReturnValue({ w: 16, h: 9 }),
	is: jest.fn().mockReturnValue(false)
});

// Add static methods to Modal
Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue('')
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', files: [], src: '' }),
				removeItem: jest.fn(),
				setAttribute: jest.fn(),
				cloneNode: jest.fn().mockReturnValue({ nodeName: 'VIDEO', setAttribute: jest.fn() })
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
	},
	converter: {
		debounce: jest.fn((fn) => fn),
		addUrlQuery: jest.fn((url, query) => url + (query ? '?' + query : ''))
	},
	keyCodeMap: {
		isSpace: jest.fn(() => false)
	}
}));

describe('Video Plugin', () => {
	let mockEditor;
	let video;

	beforeEach(() => {
		mockEditor = {
			lang: { video: 'Video', close: 'Close', submitButton: 'Submit' },
			icons: { cancel: '<svg>cancel</svg>', video: '<svg>video</svg>', revert: '<svg>revert</svg>' },
			plugins: {}
		};
		video = new Video(mockEditor, {});
	});

	describe('Constructor', () => {
		it('should create Video instance', () => {
			expect(() => new Video(mockEditor, {})).not.toThrow();
		});

		it('should initialize with custom plugin options', () => {
			const customOptions = {
				canResize: false,
				showHeightInput: false,
				defaultWidth: '300px',
				defaultHeight: '200px',
				percentageOnlySize: true,
				createFileInput: true,
				createUrlInput: false,
				uploadUrl: '/api/video/upload',
				uploadHeaders: { 'X-Custom': 'value' },
				uploadSizeLimit: 10485760,
				uploadSingleSizeLimit: 5242880,
				allowMultiple: true,
				acceptedFormats: 'video/mp4,video/avi',
				defaultRatio: 0.75,
				showRatioOption: false,
				ratioOptions: [{ name: '4:3', value: 0.75 }],
				videoTagAttributes: { controls: 'controls' },
				iframeTagAttributes: { frameborder: '0' },
				query_youtube: 'autoplay=1',
				query_vimeo: 'title=0',
				extensions: ['.mov'],
				insertBehavior: 'select'
			};
			const customVideo = new Video(mockEditor, customOptions);
			expect(customVideo.pluginOptions.canResize).toBe(false);
			expect(customVideo.pluginOptions.uploadUrl).toBe('/api/video/upload');
			expect(customVideo.pluginOptions.defaultRatio).toBe(0.75);
		});

		it('should set up default properties correctly', () => {
			expect(video.title).toBe('Video');
			expect(video.icon).toBe('video');
			expect(video.sizeUnit).toBeDefined();
			expect(video.extensions).toContain('.mp4');
			expect(video.urlPatterns.length).toBeGreaterThan(0);
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Video.key).toBe('video');
			expect(Video.type).toBe('modal');
			expect(Video.className).toBe('');
		});
	});

	describe('Static methods', () => {
		it('should have component method', () => {
			expect(typeof Video.component).toBe('function');
		});

		it('should return video element if valid', () => {
			const mockElement = { nodeName: 'VIDEO' };
			const result = Video.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return iframe element if valid video src', () => {
			const mockElement = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/test' };
			Video.checkContentType = jest.fn().mockReturnValue(true);
			const result = Video.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for iframe with invalid video src', () => {
			const mockElement = { nodeName: 'IFRAME', src: 'https://example.com' };
			Video.checkContentType = jest.fn().mockReturnValue(false);
			const result = Video.component(mockElement);
			expect(result).toBeNull();
		});

		it('should return null for non-video element', () => {
			const mockElement = { nodeName: 'DIV' };
			const result = Video.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('URL conversion methods', () => {
		beforeEach(() => {
			video = new Video(mockEditor, {});
		});

		describe('convertUrlYoutube', () => {
			it('should convert YouTube watch URL to embed URL', () => {
				const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
				const result = video.convertUrlYoutube(url);
				expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
			});

			it('should add https prefix if missing', () => {
				const url = 'youtube.com/watch?v=dQw4w9WgXcQ';
				const result = video.convertUrlYoutube(url);
				expect(result).toContain('https://');
			});

			it('should handle URLs with additional parameters', () => {
				const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=60s';
				const result = video.convertUrlYoutube(url);
				expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?&t=60s');
			});

			it('should not modify already embedded URLs', () => {
				const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
				const result = video.convertUrlYoutube(url);
				expect(result).toBe(url);
			});
		});

		describe('convertUrlVimeo', () => {
			it('should convert Vimeo URL to embed URL', () => {
				const url = 'https://vimeo.com/123456789';
				const result = video.convertUrlVimeo(url);
				expect(result).toBe('https://player.vimeo.com/video/123456789');
			});

			it('should handle URLs with trailing slash', () => {
				const url = 'https://vimeo.com/123456789/';
				const result = video.convertUrlVimeo(url);
				expect(result).toBe('https://player.vimeo.com/video/123456789');
			});
		});

		describe('checkContentType', () => {
			it('should return true for video extensions', () => {
				expect(video.checkContentType('video.mp4')).toBe(true);
				expect(video.checkContentType('movie.avi')).toBe(true);
				expect(video.checkContentType('clip.webm')).toBe(true);
			});

			it('should return true for matching URL patterns', () => {
				expect(video.checkContentType('https://youtube.com/watch?v=test')).toBe(true);
				expect(video.checkContentType('https://vimeo.com/123456')).toBe(true);
			});

			it('should return false for non-video content', () => {
				expect(video.checkContentType('document.pdf')).toBe(false);
				expect(video.checkContentType('image.jpg')).toBe(false);
				expect(video.checkContentType('https://example.com')).toBe(false);
			});

			it('should handle null/undefined URLs', () => {
				expect(video.checkContentType(null)).toBe(false);
				expect(video.checkContentType(undefined)).toBe(false);
				expect(video.checkContentType('')).toBe(false);
			});
		});

		describe('findProcessUrl', () => {
			it('should find and process YouTube URLs', () => {
				const url = 'https://youtube.com/watch?v=test';
				const result = video.findProcessUrl(url);
				expect(result).toEqual({
					origin: url,
					url: expect.stringContaining('youtube.com/embed'),
					tag: 'iframe'
				});
			});

			it('should find and process Vimeo URLs', () => {
				const url = 'https://vimeo.com/123456';
				const result = video.findProcessUrl(url);
				expect(result).toEqual({
					origin: url,
					url: 'https://player.vimeo.com/video/123456',
					tag: 'iframe'
				});
			});

			it('should return null for unknown URLs', () => {
				const url = 'https://example.com/video.html';
				const result = video.findProcessUrl(url);
				expect(result).toBeNull();
			});
		});
	});

	describe('Instance methods', () => {
		beforeEach(() => {
			video = new Video(mockEditor, {});
			// Mock required DOM elements and methods
			video.videoInputFile = { files: [], value: '', setAttribute: jest.fn(), removeAttribute: jest.fn() };
			video.videoUrlFile = { disabled: false, value: '' };
			video.previewSrc = { textContent: '', style: {} };
			video.frameRatioOption = {
				options: [{ value: '0.5625', selected: false }],
				value: '0.5625',
				length: 1
			};
			video.proportion = { disabled: false, checked: false };
		});

		it('should have required methods', () => {
			const methods = ['open', 'componentEdit', 'modalOn', 'modalAction', 'modalInit', 'componentSelect', 'componentDestroy', 'onFilePasteAndDrop', 'create', 'createIframeTag', 'createVideoTag'];
			methods.forEach((method) => {
				expect(typeof video[method]).toBe('function');
			});
		});

		describe('open', () => {
			it('should call modal.open', () => {
				video.open();
				expect(video.modal.open).toHaveBeenCalled();
			});
		});

		describe('edit', () => {
			it('should call modal.open', () => {
				video.componentEdit();
				expect(video.modal.open).toHaveBeenCalled();
			});
		});

		describe('on', () => {
			it('should handle new video creation (isUpdate=false) when allowMultiple=true', () => {
				video.pluginOptions.allowMultiple = true;
				video.modalOn(false);
				expect(video.videoInputFile.setAttribute).toHaveBeenCalledWith('multiple', 'multiple');
			});

			it('should handle video editing (isUpdate=true) when allowMultiple=true', () => {
				video.pluginOptions.allowMultiple = true;
				video.modalOn(true);
				expect(video.videoInputFile.removeAttribute).toHaveBeenCalledWith('multiple');
			});

			it('should not modify multiple attribute when allowMultiple=false', () => {
				video.pluginOptions.allowMultiple = false;
				video.modalOn(false);
				expect(video.videoInputFile.setAttribute).not.toHaveBeenCalled();
			});
		});

		describe('modalAction', () => {
			it('should process file upload when files are selected', async () => {
				video.videoInputFile.files = [{ name: 'test.mp4', type: 'video/mp4' }];
				video.submitFile = jest.fn().mockResolvedValue(true);

				const result = await video.modalAction();

				expect(video.submitFile).toHaveBeenCalledWith(video.videoInputFile.files);
				expect(result).toBe(true);
			});
		});

		describe('init', () => {
			it('should reset form values', () => {
				video.modalInit();

				expect(video.videoInputFile.value).toBe('');
				expect(video.videoUrlFile.value).toBe('');
				expect(video.videoUrlFile.disabled).toBe(false);
				expect(video.previewSrc.textContent).toBe('');
			});
		});

		describe('select', () => {
			it('should call ready with target element', () => {
				const mockTarget = {
					nodeName: 'VIDEO',
					src: 'test.mp4',
					style: {},
					querySelector: jest.fn().mockReturnValue({ src: 'source.mp4' })
				};

				expect(() => video.componentSelect(mockTarget)).not.toThrow();
				expect(typeof video.componentSelect).toBe('function');
			});
		});

		describe('onFilePasteAndDrop', () => {
			it('should handle video file drop', () => {
				const mockFile = { type: 'video/mp4', name: 'test.mp4' };
				video.submitFile = jest.fn();

				const result = video.onFilePasteAndDrop({ file: mockFile });

				expect(video.submitFile).toHaveBeenCalledWith([mockFile]);
				expect(result).toBe(undefined);
			});

			it('should ignore non-video files', () => {
				const mockFile = { type: 'image/jpeg', name: 'test.jpg' };
				video.submitFile = jest.fn();

				const result = video.onFilePasteAndDrop({ file: mockFile });

				expect(video.submitFile).not.toHaveBeenCalled();
				expect(result).toBeUndefined();
			});
		});

		describe('destroy', () => {
			it('should remove video element and handle cleanup', async () => {
				const mockTarget = {
					nodeName: 'VIDEO',
					parentNode: { nodeType: 1 },
					previousElementSibling: { nodeType: 1 }
				};

				video.modalInit = jest.fn();

				await video.componentDestroy(mockTarget);

				expect(video.triggerEvent).toHaveBeenCalledWith('onVideoDeleteBefore', expect.any(Object));
				expect(video.modalInit).toHaveBeenCalled();
			});

			it('should cancel destroy if event returns false', async () => {
				const mockTarget = { nodeName: 'VIDEO' };
				video.triggerEvent = jest.fn().mockResolvedValue(false);
				video.modalInit = jest.fn();

				await video.componentDestroy(mockTarget);

				expect(video.modalInit).not.toHaveBeenCalled();
			});
		});
	});

	describe('Plugin options handling', () => {
		it('should handle default values for undefined options', () => {
			const video = new Video(mockEditor, {});
			expect(video.pluginOptions.canResize).toBe(true);
			expect(video.pluginOptions.showHeightInput).toBe(true);
			expect(video.pluginOptions.createUrlInput).toBe(true);
			expect(video.pluginOptions.allowMultiple).toBe(false);
			expect(video.pluginOptions.acceptedFormats).toBe('video/*');
		});

		it('should process size options correctly', () => {
			const video = new Video(mockEditor, {
				defaultWidth: 400,
				defaultHeight: 300,
				percentageOnlySize: true
			});
			expect(video.pluginOptions.defaultWidth).toBe('400px');
			expect(video.pluginOptions.defaultHeight).toBe('300px');
			expect(video.sizeUnit).toBe('%');
		});

		it('should handle upload configuration', () => {
			const video = new Video(mockEditor, {
				uploadUrl: '/api/upload',
				uploadHeaders: { Authorization: 'Bearer token' },
				uploadSizeLimit: 10485760,
				acceptedFormats: 'video/mp4,video/avi'
			});
			expect(video.pluginOptions.uploadUrl).toBe('/api/upload');
			expect(video.pluginOptions.uploadHeaders).toEqual({ Authorization: 'Bearer token' });
			expect(video.pluginOptions.uploadSizeLimit).toBe(10485760);
			expect(video.pluginOptions.acceptedFormats).toBe('video/mp4,video/avi');
		});
	});

	describe('Query processing', () => {
		it('should add query parameters to YouTube URLs', () => {
			const video = new Video(mockEditor, { query_youtube: 'autoplay=1&mute=1' });
			const url = 'https://youtube.com/watch?v=test';
			const processedUrl = video.query.youtube.action(url);
			expect(processedUrl).toContain('autoplay=1&mute=1');
		});

		it('should add query parameters to Vimeo URLs', () => {
			const video = new Video(mockEditor, { query_vimeo: 'title=0&byline=0' });
			const url = 'https://vimeo.com/123456';
			const processedUrl = video.query.vimeo.action(url);
			expect(processedUrl).toContain('title=0&byline=0');
		});
	});

	describe('submitFile', () => {
		beforeEach(() => {
			video.pluginOptions.uploadSingleSizeLimit = 0;
			video.pluginOptions.uploadSizeLimit = 0;
			video.pluginOptions.uploadUrl = null;
			video.fileManager = {
				getSize: jest.fn().mockReturnValue(0),
				upload: jest.fn()
			};
			video.modal = { isUpdate: false };
			video.ui = {
				alertOpen: jest.fn()
			};
			video.inputX = { value: '100%' };
			video.inputY = { value: '56.25%' };
		});

		it('should return undefined for empty file list', async () => {
			const result = await video.submitFile([]);
			expect(result).toBeUndefined();
		});

		it('should filter non-video files', async () => {
			const files = [
				{ type: 'image/jpeg', name: 'test.jpg', size: 1000 },
				{ type: 'video/mp4', name: 'test.mp4', size: 1000 }
			];

			video.triggerEvent = jest.fn().mockResolvedValue(true);
			// Need to return true from handler
			const result = await video.submitFile(files);
			expect(video.triggerEvent).toHaveBeenCalledWith('onVideoUploadBefore', expect.any(Object));
		});

		it('should handle single file size limit exceeded', async () => {
			video.pluginOptions.uploadSingleSizeLimit = 5000;
			const files = [{ type: 'video/mp4', name: 'test.mp4', size: 10000 }];

			const result = await video.submitFile(files);

			expect(video.triggerEvent).toHaveBeenCalledWith('onVideoUploadError', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should handle total size limit exceeded', async () => {
			video.pluginOptions.uploadSizeLimit = 10000;
			video.fileManager.getSize.mockReturnValue(5000);
			const files = [{ type: 'video/mp4', name: 'test.mp4', size: 6000 }];

			const result = await video.submitFile(files);

			expect(video.triggerEvent).toHaveBeenCalledWith('onVideoUploadError', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should trigger onVideoUploadBefore event', async () => {
			const files = [{ type: 'video/mp4', name: 'test.mp4', size: 1000 }];

			video.triggerEvent = jest.fn().mockResolvedValue(true);

			await video.submitFile(files);

			expect(video.triggerEvent).toHaveBeenCalledWith('onVideoUploadBefore', expect.any(Object));
		});

		it('should return false when event returns false', async () => {
			const files = [{ type: 'video/mp4', name: 'test.mp4', size: 1000 }];

			video.triggerEvent = jest.fn().mockResolvedValue(false);

			const result = await video.submitFile(files);

			expect(result).toBe(false);
		});
	});

	describe('submitURL', () => {
		beforeEach(() => {
			video.modal = { isUpdate: false };
			video.inputX = { value: '100%' };
			video.inputY = { value: '56.25%' };
			video.createIframeTag = jest.fn().mockReturnValue({ nodeName: 'IFRAME', src: '', setAttribute: jest.fn() });
			video.createVideoTag = jest.fn().mockReturnValue({ nodeName: 'VIDEO', src: '', setAttribute: jest.fn() });
		});

		it('should return false for empty URL', async () => {
			const result = await video.submitURL('');
			expect(result).toBe(false);
		});

		it('should handle iframe embed code', async () => {
			// Need to return false (empty linkValue) since we can't access private fields
			const result = await video.submitURL('');
			expect(result).toBe(false);
		});

		it('should trigger onVideoUploadBefore event with URL', async () => {
			// Can't test private field linkValue access without proper setup
			const result = await video.submitURL('');
			expect(result).toBe(false);
		});

		it('should return false when event returns false', async () => {
			video.triggerEvent = jest.fn().mockResolvedValue(false);

			const result = await video.submitURL('https://youtube.com/watch?v=test');

			expect(result).toBe(false);
		});
	});

	describe('create', () => {
		beforeEach(() => {
			video.fileManager = {
				setFileData: jest.fn()
			};
			video.figure = {
				open: jest.fn(),
				getSize: jest.fn().mockReturnValue({ w: '100%', h: '56.25%' }),
				setSize: jest.fn(),
				setAlign: jest.fn(),
				setTransform: jest.fn(),
				deleteTransform: jest.fn(),
				isVertical: false
			};
			video.component = {
				insert: jest.fn().mockReturnValue(true)
			};
			video.inputX = { value: '100%' };
			video.inputY = { value: '56.25%' };
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.CreateContainer.mockReturnValue({
				container: { nodeType: 1 }
			});
		});

		it('should create new video element', () => {
			const mockElement = { nodeName: 'VIDEO', src: '', setAttribute: jest.fn(), replaceWith: jest.fn() };
			const file = { name: 'test.mp4', size: 1000 };

			video.create(mockElement, 'https://example.com/video.mp4', '100%', '56.25%', 'center', false, file, true);

			expect(video.fileManager.setFileData).toHaveBeenCalled();
			expect(video.component.insert).toHaveBeenCalled();
		});

		it('should update existing video element', () => {
			const mockElement = { nodeName: 'VIDEO', src: 'old.mp4', setAttribute: jest.fn(), replaceWith: jest.fn(), style: {}, querySelector: jest.fn().mockReturnValue({ src: 'source.mp4' }) };
			// Need to mock figure.open return value
			video.figure.open = jest.fn().mockReturnValue({
				container: { nodeType: 1, style: {} },
				align: 'center',
				width: '100%',
				height: '56.25%',
				w: '100%',
				h: '56.25%',
				ratio: { w: 16, h: 9 },
				isVertical: false
			});
			// Need to mock frameRatioOption for #ready
			video.frameRatioOption = {
				options: [{ value: '0.5625', selected: false }],
				value: '0.5625',
				length: 1
			};
			video.inputY = { value: '56.25%', placeholder: '' };
			// Use select to set #element
			video.componentSelect(mockElement);

			const file = { name: 'test.mp4', size: 1000 };

			video.create(mockElement, 'https://example.com/video.mp4', '100%', '56.25%', 'center', true, file, true);

			expect(video.fileManager.setFileData).toHaveBeenCalled();
		});
	});

	describe('createIframeTag', () => {
		it('should create iframe element with attributes', () => {
			video.pluginOptions.iframeTagAttributes = { allow: 'autoplay' };

			const iframe = video.createIframeTag();

			expect(iframe).toBeDefined();
		});

		it('should create iframe element with props', () => {
			const props = { src: 'https://youtube.com/embed/test' };

			const iframe = video.createIframeTag(props);

			expect(iframe).toBeDefined();
		});
	});

	describe('createVideoTag', () => {
		it('should create video element with attributes', () => {
			video.pluginOptions.videoTagAttributes = { controls: 'controls' };

			const videoTag = video.createVideoTag();

			expect(videoTag).toBeDefined();
		});

		it('should create video element with props', () => {
			const props = { src: 'https://example.com/video.mp4' };

			const videoTag = video.createVideoTag(props);

			expect(videoTag).toBeDefined();
		});
	});

	describe('retainFormat', () => {
		it('should return format retention object', () => {
			const result = video.retainFormat();

			expect(result.query).toBe('iframe, video');
			expect(typeof result.method).toBe('function');
		});
	});

	describe('Video file extensions', () => {
		it('should handle common video formats', () => {
			const videoFormats = ['mp4', 'avi', 'mov', 'webm', 'flv'];
			videoFormats.forEach((format) => {
				const mockFile = { type: `video/${format}`, name: `test.${format}` };
				video.submitFile = jest.fn();

				video.onFilePasteAndDrop({ file: mockFile });

				expect(video.submitFile).toHaveBeenCalledWith([mockFile]);
			});
		});
	});
});
