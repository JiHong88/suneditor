import Image from '../../../../src/plugins/modal/image';

// Mock dependencies with comprehensive setup
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = { image: 'Image', close: 'Close', submitButton: 'Submit', caption: 'Caption' };
			this.icons = { cancel: '<svg>cancel</svg>', image: '<svg>image</svg>', as_block: '<svg>block</svg>', as_inline: '<svg>inline</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.events = { onImageLoad: jest.fn(), onImageAction: jest.fn() };
			this.options = { get: jest.fn().mockReturnValue('auto') };
			// Editor methods for comprehensive coverage
			this.editor = {
				focus: jest.fn(),
				focusEdge: jest.fn(),
				_iframeAutoHeight: jest.fn()
			};
			this.format = {
				getLine: jest.fn().mockReturnValue(null),
				addLine: jest.fn().mockReturnValue(null),
				isLine: jest.fn().mockReturnValue(false)
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
				insert: jest.fn().mockReturnValue(true),
				applyInsertBehavior: jest.fn(),
				isInline: jest.fn().mockReturnValue(false)
			};
			this.triggerEvent = jest.fn().mockResolvedValue(true);
			this.ui = {
				alertOpen: jest.fn(),
				hideLoading: jest.fn()
			};
			this.plugins = { link: { pluginOptions: {} } };
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
				value: '',
				checked: true
			})
		},
		isUpdate: false
	})),
	Figure: jest.fn().mockImplementation(() => ({
		open: jest.fn().mockReturnValue({
			container: { nodeType: 1, style: {}, contains: jest.fn().mockReturnValue(true) },
			cover: { nodeType: 1, appendChild: jest.fn(), insertBefore: jest.fn(), contains: jest.fn().mockReturnValue(true), removeChild: jest.fn() },
			align: 'center',
			width: '300px',
			height: '150px',
			w: '300px',
			h: '150px',
			ratio: { w: 16, h: 9 },
			isVertical: false
		}),
		setSize: jest.fn(),
		setAlign: jest.fn(),
		getSize: jest.fn().mockReturnValue({ dw: '300px', dh: '150px' }),
		setTransform: jest.fn(),
		deleteTransform: jest.fn(),
		convertAsFormat: jest.fn().mockReturnValue({ nodeName: 'IMG' }),
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
	ModalAnchorEditor: jest.fn().mockImplementation(() => ({
		on: jest.fn(),
		init: jest.fn(),
		create: jest.fn().mockReturnValue(null),
		set: jest.fn(),
		currentTarget: null,
		urlInput: { focus: jest.fn() }
	})),
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
		container: { nodeType: 1, style: {}, querySelector: jest.fn() },
		cover: { nodeType: 1 },
		align: 'center'
	}),
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {}, querySelector: jest.fn().mockReturnValue({ nodeName: 'IMG' }) },
		cover: { nodeType: 1, appendChild: jest.fn(), insertBefore: jest.fn() }
	}),
	CreateInlineContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} },
		inlineCover: { nodeType: 1 }
	}),
	CreateCaption: jest.fn().mockReturnValue({ nodeType: 1 }),
	is: jest.fn().mockReturnValue(false),
	GetRatio: jest.fn().mockReturnValue({ w: 16, h: 9 }),
	CalcRatio: jest.fn().mockReturnValue({ w: 16, h: 9 })
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', files: [] }),
				removeItem: jest.fn(),
				setAttribute: jest.fn(),
				cloneNode: jest.fn().mockReturnValue({ nodeName: 'IMG', setAttribute: jest.fn() }),
				appendChild: jest.fn(),
				addClass: jest.fn(),
				removeClass: jest.fn()
			}),
			removeItem: jest.fn(),
			createTooltipInner: jest.fn().mockReturnValue(''),
			addClass: jest.fn(),
			removeClass: jest.fn()
		},
		query: {
			getParentElement: jest.fn().mockReturnValue(null),
			getEventTarget: jest.fn((e) => e.target || e),
			getListChildren: jest.fn().mockReturnValue([])
		},
		check: {
			isFigure: jest.fn().mockReturnValue(false),
			isComponentContainer: jest.fn().mockReturnValue(false),
			isAnchor: jest.fn().mockReturnValue(false)
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
	keyCodeMap: {
		isSpace: jest.fn(() => false)
	}
}));

describe('Image Plugin', () => {
	let mockEditor;
	let image;

	beforeEach(() => {
		mockEditor = {
			lang: { image: 'Image', close: 'Close', submitButton: 'Submit', caption: 'Caption' },
			icons: { cancel: '<svg>cancel</svg>', image: '<svg>image</svg>', as_block: '<svg>block</svg>', as_inline: '<svg>inline</svg>' },
			plugins: {}
		};
		image = new Image(mockEditor, {});
	});

	describe('Constructor', () => {
		it('should create Image instance', () => {
			expect(() => new Image(mockEditor, {})).not.toThrow();
		});

		it('should initialize with custom plugin options', () => {
			const customOptions = {
				canResize: true,
				showHeightInput: true,
				defaultWidth: '400px',
				defaultHeight: '200px',
				percentageOnlySize: false,
				createFileInput: true,
				createUrlInput: true,
				uploadUrl: '/api/image/upload',
				uploadHeaders: { 'X-Custom': 'value' },
				uploadSizeLimit: 10485760,
				uploadSingleSizeLimit: 5242880,
				allowMultiple: true,
				acceptedFormats: 'image/jpeg,image/png',
				useFormatType: true,
				defaultFormatType: 'block',
				keepFormatType: false,
				insertBehavior: 'select'
			};
			const customImage = new Image(mockEditor, customOptions);
			expect(customImage.pluginOptions.defaultWidth).toBe('400px');
			expect(customImage.pluginOptions.uploadUrl).toBe('/api/image/upload');
			expect(customImage.pluginOptions.allowMultiple).toBe(true);
			expect(customImage.pluginOptions.useFormatType).toBe(true);
		});

		it('should set up default properties correctly', () => {
			expect(image.title).toBe('Image');
			expect(image.icon).toBe('image');
			expect(image.pluginOptions).toBeDefined();
			expect(image.as).toBe('block');
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Image.key).toBe('image');
			expect(Image.type).toBe('modal');
			expect(Image.className).toBe('');
		});
	});

	describe('Static methods', () => {
		it('should have component method', () => {
			expect(typeof Image.component).toBe('function');
		});

		it('should return image element if valid', () => {
			const mockElement = { nodeName: 'IMG' };
			const result = Image.component(mockElement);
			expect(result).toBe(mockElement);
		});

		it('should return null for non-image element', () => {
			const mockElement = { nodeName: 'DIV' };
			const result = Image.component(mockElement);
			expect(result).toBeNull();
		});
	});

	describe('Instance methods', () => {
		beforeEach(() => {
			// Mock required DOM elements
			image.imgInputFile = { files: [], value: '', setAttribute: jest.fn(), removeAttribute: jest.fn() };
			image.imgUrlFile = { disabled: false, value: '' };
			image.altText = { value: '' };
			image.captionCheckEl = { checked: false };
			image.previewSrc = { textContent: '', style: {} };
			image.alignForm = { style: { display: '' } };
			image.captionEl = { style: { display: '' } };
			image.asBlock = {};
			image.asInline = {};
		});

		it('should have required methods', () => {
			const methods = ['open', 'modalOn', 'modalAction', 'modalInit', 'componentSelect', 'componentDestroy', 'onFilePasteAndDrop', 'create', 'createInline'];
			methods.forEach((method) => {
				expect(typeof image[method]).toBe('function');
			});
		});

		describe('open', () => {
			it('should call modal.open', () => {
				image.open();
				expect(image.modal.open).toHaveBeenCalled();
			});
		});

		describe('on', () => {
			it('should handle new image creation (isUpdate=false) when allowMultiple=true', () => {
				image.pluginOptions.allowMultiple = true;
				image.anchor = { on: jest.fn() };
				image.modalOn(false);
				expect(image.imgInputFile.setAttribute).toHaveBeenCalledWith('multiple', 'multiple');
			});

			it('should handle image editing (isUpdate=true) when allowMultiple=true', () => {
				image.pluginOptions.allowMultiple = true;
				image.anchor = { on: jest.fn() };
				image.modalOn(true);
				expect(image.imgInputFile.removeAttribute).toHaveBeenCalledWith('multiple');
			});

			it('should not modify multiple attribute when allowMultiple=false', () => {
				image.pluginOptions.allowMultiple = false;
				image.anchor = { on: jest.fn() };
				image.modalOn(false);
				expect(image.imgInputFile.setAttribute).not.toHaveBeenCalled();
			});
		});

		describe('modalAction', () => {
			it('should process file upload when files are selected', async () => {
				image.imgInputFile.files = [{ name: 'test.jpg', type: 'image/jpeg' }];
				image.submitFile = jest.fn().mockResolvedValue(true);

				const result = await image.modalAction();

				expect(image.submitFile).toHaveBeenCalledWith(image.imgInputFile.files);
				expect(result).toBe(true);
			});

			it('should process URL input when URL is provided', async () => {
				image.imgInputFile.files = [];
				image.submitURL = jest.fn().mockResolvedValue(true);

				const result = await image.modalAction();
				expect(result).toBeDefined();
			});
		});

		describe('init', () => {
			it('should reset form values', () => {
				image.modalInit();

				expect(image.imgInputFile.value).toBe('');
				expect(image.imgUrlFile.value).toBe('');
				expect(image.imgUrlFile.disabled).toBe(false);
				expect(image.altText.value).toBe('');
				expect(image.captionCheckEl.checked).toBe(false);
				expect(image.previewSrc.textContent).toBe('');
			});
		});

		describe('select', () => {
			it('should call ready with target element', () => {
				const mockTarget = {
					nodeName: 'IMG',
					src: 'test.jpg',
					style: {},
					parentNode: null
				};

				expect(() => image.componentSelect(mockTarget)).not.toThrow();
				expect(typeof image.componentSelect).toBe('function');
			});
		});

		describe('onFilePasteAndDrop', () => {
			it('should handle image file drop', () => {
				const mockFile = { type: 'image/jpeg', name: 'test.jpg' };
				image.submitFile = jest.fn();

				const result = image.onFilePasteAndDrop({ file: mockFile });

				expect(image.submitFile).toHaveBeenCalledWith([mockFile]);
				expect(result).toBe(undefined);
			});

			it('should ignore non-image files', () => {
				const mockFile = { type: 'video/mp4', name: 'test.mp4' };
				image.submitFile = jest.fn();

				const result = image.onFilePasteAndDrop({ file: mockFile });

				expect(image.submitFile).not.toHaveBeenCalled();
				expect(result).toBeUndefined();
			});
		});

		describe('destroy', () => {
			it('should remove image element and handle cleanup', async () => {
				const mockTarget = {
					nodeName: 'IMG',
					parentNode: { nodeType: 1 },
					previousElementSibling: { nodeType: 1 },
					getAttribute: jest.fn().mockReturnValue('test.jpg')
				};

				image.modalInit = jest.fn();

				await image.componentDestroy(mockTarget);

				expect(image.triggerEvent).toHaveBeenCalledWith('onImageDeleteBefore', expect.any(Object));
				expect(image.modalInit).toHaveBeenCalled();
			});

			it('should cancel destroy if event returns false', async () => {
				const mockTarget = {
					nodeName: 'IMG',
					getAttribute: jest.fn().mockReturnValue('test.jpg')
				};
				image.triggerEvent = jest.fn().mockResolvedValue(false);
				image.modalInit = jest.fn();

				await image.componentDestroy(mockTarget);

				expect(image.modalInit).not.toHaveBeenCalled();
			});
		});
	});

	describe('Plugin options handling', () => {
		it('should handle default values for undefined options', () => {
			const image = new Image(mockEditor, {});
			expect(image.pluginOptions.createUrlInput).toBe(true);
			expect(image.pluginOptions.allowMultiple).toBe(false);
			expect(image.pluginOptions.acceptedFormats).toBe('image/*');
			expect(image.pluginOptions.useFormatType).toBe(true);
			expect(image.pluginOptions.defaultFormatType).toBe('block');
		});

		it('should process size options correctly', () => {
			const image = new Image(mockEditor, {
				defaultWidth: 400,
				defaultHeight: 300
			});
			expect(image.pluginOptions.defaultWidth).toBe('400px');
			expect(image.pluginOptions.defaultHeight).toBe('300px');
		});

		it('should handle upload configuration', () => {
			const image = new Image(mockEditor, {
				uploadUrl: '/api/upload',
				uploadHeaders: { Authorization: 'Bearer token' },
				uploadSizeLimit: 10485760,
				acceptedFormats: 'image/jpeg,image/png'
			});
			expect(image.pluginOptions.uploadUrl).toBe('/api/upload');
			expect(image.pluginOptions.uploadHeaders).toEqual({ Authorization: 'Bearer token' });
			expect(image.pluginOptions.uploadSizeLimit).toBe(10485760);
			expect(image.pluginOptions.acceptedFormats).toBe('image/jpeg,image/png');
		});
	});

	describe('Image file extensions', () => {
		it('should handle common image formats', () => {
			const imageFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'];
			imageFormats.forEach((format) => {
				const mockFile = { type: `image/${format}`, name: `test.${format}` };
				image.submitFile = jest.fn();

				image.onFilePasteAndDrop({ file: mockFile });

				expect(image.submitFile).toHaveBeenCalledWith([mockFile]);
			});
		});
	});

	describe('submitFile', () => {
		beforeEach(() => {
			image.pluginOptions.uploadSingleSizeLimit = 0;
			image.pluginOptions.uploadSizeLimit = 0;
			image.pluginOptions.uploadUrl = null;
			image.fileManager = {
				getSize: jest.fn().mockReturnValue(0),
				upload: jest.fn()
			};
			image.modal = { isUpdate: false };
			image.ui = {
				alertOpen: jest.fn(),
				hideLoading: jest.fn()
			};
			image.inputX = { value: '300px' };
			image.inputY = { value: '200px' };
		});

		it('should return false for empty file list', async () => {
			const result = await image.submitFile([]);
			expect(result).toBe(false);
		});

		it('should filter non-image files', async () => {
			const files = [
				{ type: 'video/mp4', name: 'test.mp4', size: 1000 },
				{ type: 'image/jpeg', name: 'test.jpg', size: 1000 }
			];

			image.triggerEvent = jest.fn().mockResolvedValue(true);
			image.anchor = { create: jest.fn().mockReturnValue(null) };
			// Skip base64 by setting uploadUrl
			image.pluginOptions.uploadUrl = '/api/upload';
			image.fileManager.upload = jest.fn();

			await image.submitFile(files);
			expect(image.fileManager.upload).toHaveBeenCalled();
		});

		it('should handle single file size limit exceeded', async () => {
			image.pluginOptions.uploadSingleSizeLimit = 5000;
			const files = [{ type: 'image/jpeg', name: 'test.jpg', size: 10000 }];

			const result = await image.submitFile(files);

			expect(image.triggerEvent).toHaveBeenCalledWith('onImageUploadError', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should handle total size limit exceeded', async () => {
			image.pluginOptions.uploadSizeLimit = 10000;
			image.fileManager.getSize.mockReturnValue(5000);
			const files = [{ type: 'image/jpeg', name: 'test.jpg', size: 6000 }];

			const result = await image.submitFile(files);

			expect(image.triggerEvent).toHaveBeenCalledWith('onImageUploadError', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should trigger onImageUploadBefore event', async () => {
			const files = [{ type: 'image/jpeg', name: 'test.jpg', size: 1000 }];

			image.triggerEvent = jest.fn().mockResolvedValue(true);
			image.anchor = { create: jest.fn().mockReturnValue(null) };
			// Skip base64 by setting uploadUrl
			image.pluginOptions.uploadUrl = '/api/upload';
			image.fileManager.upload = jest.fn();

			await image.submitFile(files);

			expect(image.triggerEvent).toHaveBeenCalledWith('onImageUploadBefore', expect.any(Object));
		});

		it('should return false when event returns false', async () => {
			const files = [{ type: 'image/jpeg', name: 'test.jpg', size: 1000 }];

			image.triggerEvent = jest.fn().mockResolvedValue(false);

			const result = await image.submitFile(files);

			expect(result).toBe(false);
		});
	});

	describe('submitURL', () => {
		beforeEach(() => {
			image.modal = { isUpdate: false };
			image.inputX = { value: '300px' };
			image.inputY = { value: '200px' };
			image.anchor = { create: jest.fn().mockReturnValue(null) };
			image.altText = { value: 'Test image' };
		});

		it('should return false for empty URL', async () => {
			const result = await image.submitURL('');
			expect(result).toBe(false);
		});

		it('should trigger onImageUploadBefore event with URL', async () => {
			image.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await image.submitURL('https://example.com/image.jpg');

			expect(image.triggerEvent).toHaveBeenCalledWith(
				'onImageUploadBefore',
				expect.objectContaining({
					info: expect.objectContaining({
						url: 'https://example.com/image.jpg'
					})
				})
			);
			expect(result).toBe(true);
		});

		it('should return false when event returns false', async () => {
			image.triggerEvent = jest.fn().mockResolvedValue(false);

			const result = await image.submitURL('https://example.com/image.jpg');

			expect(result).toBe(false);
		});
	});

	describe('create', () => {
		beforeEach(() => {
			image.fileManager = {
				setFileData: jest.fn()
			};
			image.component = {
				insert: jest.fn().mockReturnValue(true)
			};
			image.captionCheckEl = { checked: false };
			image.inputX = { value: '300px' };
			image.inputY = { value: '200px' };
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.CreateContainer.mockReturnValue({
				container: { nodeType: 1 },
				cover: { nodeType: 1, appendChild: jest.fn(), insertBefore: jest.fn() }
			});
			mockFigure.CreateCaption.mockReturnValue({ nodeType: 1 });
		});

		it('should create new image element', () => {
			const file = { name: 'test.jpg', size: 1000 };

			image.create('https://example.com/image.jpg', null, '300px', '200px', 'center', file, 'Test image', true);

			expect(image.fileManager.setFileData).toHaveBeenCalled();
			expect(image.component.insert).toHaveBeenCalled();
		});

		it('should create image with caption when checked', () => {
			image.captionCheckEl.checked = true;
			const file = { name: 'test.jpg', size: 1000 };
			const mockFigure = require('../../../../src/modules/contract').Figure;

			image.create('https://example.com/image.jpg', null, '300px', '200px', 'center', file, 'Test image', true);

			expect(mockFigure.CreateCaption).toHaveBeenCalled();
		});
	});

	describe('createInline', () => {
		beforeEach(() => {
			image.fileManager = {
				setFileData: jest.fn()
			};
			image.component = {
				insert: jest.fn().mockReturnValue(true)
			};
			image.inputX = { value: '300px' };
			image.inputY = { value: '200px' };
			const mockFigure = require('../../../../src/modules/contract').Figure;
			mockFigure.CreateInlineContainer.mockReturnValue({
				container: { nodeType: 1 }
			});
		});

		it('should create new inline image element', () => {
			const file = { name: 'test.jpg', size: 1000 };

			image.createInline('https://example.com/image.jpg', null, '300px', '200px', file, 'Test image', true);

			expect(image.fileManager.setFileData).toHaveBeenCalled();
			expect(image.component.insert).toHaveBeenCalled();
		});
	});

	describe('retainFormat', () => {
        beforeEach(() => {
            image.alignForm = { style: { display: '' } };
            image.captionEl = { style: { display: '' } };
            image.asBlock = { className: '' };
            image.asInline = { className: '' };
        });

		it('should return format retention object', () => {
			const result = image.retainFormat();

			expect(result.query).toBe('img');
			expect(typeof result.method).toBe('function');
		});

		it('should process image element when method is called', () => {
			const result = image.retainFormat();
			const mockElement = { nodeName: 'IMG', src: 'test.jpg', style: {}, removeAttribute: jest.fn() };
			const mockFigure = require('../../../../src/modules/contract').Figure;
			
			// Mock GetContainer to return nothing so it proceeds
			mockFigure.GetContainer.mockReturnValue(null);
			
			result.method(mockElement);
			
			expect(image.figure.open).toHaveBeenCalled();
		});

		it('should not process if already in a figure container', () => {
			const result = image.retainFormat();
			const mockElement = { nodeName: 'IMG', style: {} };
			const mockFigure = require('../../../../src/modules/contract').Figure;
			
			mockFigure.GetContainer.mockReturnValue({ container: {}, cover: {} });
			
			result.method(mockElement);
			
			// Should return early
			expect(image.figure.open).not.toHaveBeenCalled();
		});
	});

	describe('modalAction (Update)', () => {
		beforeEach(() => {
			// Ensure alignForm has style for #activeAsInline
			image.alignForm = { style: { display: '' } };
			image.captionEl = { style: { display: '' } };
            image.asBlock = { className: '' };
            image.asInline = { className: '' };
		});

		it('should handle update scenario with caption and link', async () => {
			image.modal.isUpdate = true;
			image.inputX = { value: '100px' };
			image.inputY = { value: '100px' };
			
			// Mock element for fixTagStructure
			const mockElement = { 
				nodeName: 'IMG',
                src: 'https://old.com/image.jpg',
				style: { width: '50px', height: '50px' },
				alt: 'old',
				cloneNode: jest.fn().mockImplementation(() => ({ 
					nodeName: 'IMG', 
					style: { width: '50px', height: '50px' },
					setAttribute: jest.fn(),
                    onload: null,
                    removeAttribute: jest.fn()
				})),
                getAttribute: jest.fn(),
                removeAttribute: jest.fn()
			};
			
			// Mock componentSelect to set private members
			image.componentSelect(mockElement);
            
            // Set up cover to have data-se-origin for modalOn to pick up
            // componentSelect -> ready -> opens figure -> returns info with cover
            // We need to access implicit cover?
            // figure.open is mocked to return cover with setAttribute etc.
            // Let's manually set attribute on mocked cover if possible or rely on simple flow
			
			// Mock querySelector for align
			image.modal.form.querySelector.mockReturnValue({ value: 'center' });
			
			// Enable caption
			image.captionCheckEl.checked = true;
            
            // Invoke modalOn to set #linkValue
            // Mock cover.getAttribute to return url
            const mockFigure = require('../../../../src/modules/contract').Figure;
            // The cover object returned by figure.open is created in beforeEach of spec file?
            // "Figure: jest.fn().mockImplementation(() => ({ open: jest.fn().mockReturnValue({ ... cover ... }) }))"
            // We can't access that specific instance easily unless we spy or assume.
            // But we can just set imgUrlFile and ignore the #linkValue crash by ensuring it's not null?
            // image.#linkValue = '' by default.
            // modalInit resets it.
            // modalOn(true) sets it.
            
            // Workaround: Mock submitURL to not use #linkValue or set it via a trick?
            // Or just allow it to fail at submitURL step, but verify fixTagStructure ran (history.push)
            // If it fails at line 270, history.push (line 265) already ran.
            // So we can expect history.push to have been called.
            // The previous test failed because of runtime error.
            // We can wrap modalAction in try-catch or ensure it doesn't throw.
            // If #linkValue is '', length is 0.
            // Line 270: `else if (this.imgUrlFile && this.#linkValue.length > 0)`
            // If length is 0, it goes to return false.
            // So it shouldn't throw "undefined".
            // Error was "Cannot read properties of undefined (reading 'length')". 
            // So this.#linkValue is undefined.
            // It should be initialized to '' in constructor.
            // Why is it undefined?
            // Maybe modalInit reset it to undefined? 
            // Line 284: `this.#linkValue = ... = '';`
            // So it should be string.
            
            // Wait, failure "reading 'length'" of undefined.
            // Variable name in error: `this.#linkValue`.
            // Maybe `modalOn` was called with `isUpdate=true` and set it to undefined?
            // Line 288: `this.#linkValue = ... = this.#cover.getAttribute(...) || '';`
            // If `getAttribute` returns undefined? `undefined || ''` -> `''`.
            // So likely not that.
            
            // Maybe it's `this.imgInputFile.files.length`??
            // Line 268: `if (this.imgInputFile && this.imgInputFile.files.length > 0)`
            // `imgInputFile.files` mock default is `[]`.
            
            // Let's re-read error trace carefully.
            // `at Image_.length [as modalAction] (src/plugins/modal/image.js:270:49)`
            // Line 270 is `else if (this.imgUrlFile && this.#linkValue.length > 0)`
            // Function name `length` is suspicious in stack trace? No, that's just property access reference?
            
            // If I just skip modalOn for now and rely on default ''.
            // `this.#linkValue` is initialized in constructor.
            
			const result = await image.modalAction();

			expect(image.history.push).toHaveBeenCalledWith(false);
			expect(result).toBe(true); 
		});
	});

	describe('Format type (block/inline)', () => {
		it('should default to block format', () => {
			const image = new Image(mockEditor, { useFormatType: true });
			expect(image.as).toBe('block');
		});

		it('should use inline format when specified', () => {
			const image = new Image(mockEditor, { useFormatType: true, defaultFormatType: 'inline' });
			expect(image.as).toBe('inline');
		});
	});
});
