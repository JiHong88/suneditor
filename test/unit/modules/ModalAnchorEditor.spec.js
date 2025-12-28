/**
 * @fileoverview Unit tests for modules/ModalAnchorEditor.js
 */

import ModalAnchorEditor from '../../../src/modules/ui/ModalAnchorEditor.js';
import { dom } from '../../../src/helper';

// Mock SelectMenu
jest.mock('../../../src/modules/ui/SelectMenu.js', () => {
	return jest.fn().mockImplementation(function () {
		this.on = jest.fn();
		this.create = jest.fn();
		this.open = jest.fn();
		this.close = jest.fn();
		this.form = {
			querySelectorAll: jest.fn().mockReturnValue([]),
		};
	});
});

// Mock FileManager
jest.mock('../../../src/modules/manager/FileManager.js', () => {
	return jest.fn().mockImplementation(function () {
		this.asyncUpload = jest.fn().mockResolvedValue({ responseText: JSON.stringify({ result: [{ url: 'http://test.com/file.pdf', name: 'file.pdf' }] }) });
	});
});

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
	return jest.fn().mockImplementation(function (editor) {
		this.editor = editor;
		this.frameContext = editor ? editor.frameContext : new Map();
		this.triggerEvent = (editor && editor.triggerEvent) || jest.fn().mockResolvedValue(undefined);
		this.lang = (editor && editor.lang) || {};
		this.icons = (editor && editor.icons) || {};
		this.eventManager = {
			addEvent: jest.fn(),
			removeEvent: jest.fn(),
		};
		this.events = {
			onFileLoad: jest.fn(),
			onFileAction: jest.fn(),
		};
		this.ui = (editor && editor.ui) || { alertOpen: jest.fn() };
		this.selection = (editor && editor.selection) || { get: jest.fn().mockReturnValue({ toString: () => 'selected text' }) };
		this.options = (editor && editor.options) || { get: jest.fn().mockReturnValue('https://') };
	});
});

jest.mock('../../../src/helper', () => ({
	dom: {
		check: {
			isElement: jest.fn().mockReturnValue(true),
			isInputElement: jest.fn().mockReturnValue(false),
			isAnchor: jest.fn().mockReturnValue(false),
		},
		utils: {
			addClass: jest.fn(),
			removeClass: jest.fn(),
			createTooltipInner: jest.fn().mockReturnValue('<span>tooltip</span>'),
			createElement: jest.fn().mockImplementation((tag, attrs, innerHTML) => {
				const el = global.document.createElement(tag || 'div');
				if (attrs) {
					Object.keys(attrs).forEach((attr) => {
						el.setAttribute(attr, attrs[attr]);
					});
				}
				if (innerHTML) {
					el.innerHTML = innerHTML;
				}
				return el;
			}),
		},
		query: {
			getListChildren: jest.fn().mockReturnValue([]),
			getEventTarget: jest.fn((e) => e.target || e.currentTarget),
		},
	},
	env: {
		_w: {
			location: {
				origin: 'http://localhost',
				pathname: '/',
				href: 'http://localhost/',
			},
		},
		NO_EVENT: '__NO_EVENT__',
	},
	keyCodeMap: { isEsc: jest.fn().mockReturnValue(false) },
	numbers: {
		get: jest.fn((val, def) => val || def),
	},
	unicode: {
		escapeStringRegexp: jest.fn((str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
	},
}));

describe('Modules - ModalAnchorEditor', () => {
	let mockInst;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			ui: {
				showModalAnchor: jest.fn(),
				hideModalAnchor: jest.fn(),
				alertOpen: jest.fn(),
			},
			selection: {
				getRangeElement: jest.fn(),
				get: jest.fn().mockReturnValue({
					toString: () => 'selected text',
				}),
			},
			triggerEvent: jest.fn().mockResolvedValue(undefined),
			frameContext: new Map(),
			lang: {
				link_modal_url: 'URL',
				link_modal_text: 'Text',
				link_modal_new_tab: 'New Tab',
				link_modal_bookmark: 'Bookmark',
				fileUpload: 'File Upload',
				link_modal_downloadLinkCheck: 'Download',
				link_modal_newWindowCheck: 'New Window',
				title: 'Title',
				link_modal_relAttribute: 'REL',
			},
			options: {
				get: jest.fn().mockReturnValue('https://'),
			},
			icons: {
				bookmark: '🔖',
				file_upload: '📁',
				download: '⬇️',
				link_rel: '🔗',
				checked: '✓',
				bookmark_anchor: '⚓',
			},
		};

		mockInst = {
			editor: mockEditor,
			constructor: {
				key: 'testAnchor',
				name: 'TestAnchor',
			},
		};
	});

	describe('Basic functionality', () => {
		let modalAnchor;
		let mockModalForm;

		beforeEach(() => {
			mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should initialize with default values', () => {
			expect(modalAnchor.host).toBe('http://localhost');
			expect(modalAnchor.currentRel).toEqual([]);
			expect(modalAnchor.linkValue).toBe('');
			expect(modalAnchor.currentTarget).toBeNull();
		});

		it('should have all required DOM elements', () => {
			expect(modalAnchor.urlInput).toBeDefined();
			expect(modalAnchor.displayInput).toBeDefined();
			expect(modalAnchor.titleInput).toBeDefined();
			expect(modalAnchor.newWindowCheck).toBeDefined();
			expect(modalAnchor.downloadCheck).toBeDefined();
			expect(modalAnchor.preview).toBeDefined();
		});
	});

	describe('set method', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should set currentTarget', () => {
			const mockAnchor = document.createElement('a');
			mockAnchor.href = 'http://example.com';

			modalAnchor.set(mockAnchor);

			expect(modalAnchor.currentTarget).toBe(mockAnchor);
		});
	});

	describe('init method', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should reset to initial state', () => {
			// Set some values first
			modalAnchor.currentTarget = document.createElement('a');
			modalAnchor.linkValue = 'http://test.com';
			modalAnchor.urlInput.value = 'http://test.com';
			modalAnchor.displayInput.value = 'Test Link';
			modalAnchor.newWindowCheck.checked = true;
			modalAnchor.downloadCheck.checked = true;

			// Call init
			modalAnchor.init();

			// Check reset
			expect(modalAnchor.currentTarget).toBeNull();
			expect(modalAnchor.linkValue).toBe('');
			expect(modalAnchor.urlInput.value).toBe('');
			expect(modalAnchor.displayInput.value).toBe('');
			expect(modalAnchor.preview.textContent).toBe('');
			expect(modalAnchor.newWindowCheck.checked).toBe(false);
			expect(modalAnchor.downloadCheck.checked).toBe(false);
		});
	});

	describe('on method - Create new link', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { openNewWindow: true });
		});

		it('should populate form for new link', () => {
			modalAnchor.on(false);

			expect(modalAnchor.displayInput.value).toBe('selected text');
			expect(modalAnchor.newWindowCheck.checked).toBe(true);
			expect(modalAnchor.titleInput.value).toBe('');
		});
	});

	describe('on method - Update existing link', () => {
		let modalAnchor;
		let mockAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});

			mockAnchor = document.createElement('a');
			mockAnchor.href = 'http://example.com';
			mockAnchor.textContent = 'Example Link';
			mockAnchor.title = 'Example Title';
			mockAnchor.target = '_blank';
			mockAnchor.rel = 'nofollow';

			modalAnchor.set(mockAnchor);
		});

		it('should populate form with existing anchor data', () => {
			modalAnchor.on(true);

			expect(modalAnchor.urlInput.value.replace(/\/$/, '')).toBe('http://example.com');
			expect(modalAnchor.displayInput.value).toBe('Example Link');
			expect(modalAnchor.titleInput.value).toBe('Example Title');
			expect(modalAnchor.newWindowCheck.checked).toBe(true);
		});
	});

	describe('create method', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should return null if linkValue is empty', () => {
			modalAnchor.linkValue = '';
			const result = modalAnchor.create(false);

			expect(result).toBeNull();
		});

		it('should create new anchor element', () => {
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.displayInput.value = 'Example Link';
			modalAnchor.titleInput.value = 'Example Title';
			modalAnchor.newWindowCheck.checked = true;

			const result = modalAnchor.create(false);

			expect(result).toBeDefined();
			expect(result.tagName).toBe('A');
			expect(result.href.replace(/\/$/, '')).toBe('http://example.com');
			expect(result.textContent).toBe('Example Link');
			expect(result.title).toBe('Example Title');
			expect(result.target).toBe('_blank');
		});

		it('should update existing anchor element', () => {
			const existingAnchor = document.createElement('a');
			existingAnchor.href = 'http://old.com';
			existingAnchor.textContent = 'Old Link';

			modalAnchor.set(existingAnchor);
			modalAnchor.linkValue = 'http://new.com';
			modalAnchor.displayInput.value = 'New Link';

			const result = modalAnchor.create(false);

			expect(result).toBe(existingAnchor);
			expect(result.href.replace(/\/$/, '')).toBe('http://new.com');
			expect(result.textContent).toBe('New Link');
		});

		it('should use linkValue as display text if displayInput is empty', () => {
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.displayInput.value = '';

			const result = modalAnchor.create(false);

			expect(result.textContent).toBe('http://example.com');
		});

		it('should not set text content when notText is true', () => {
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.displayInput.value = 'Example Link';

			const result = modalAnchor.create(true);

			expect(result.href.replace(/\/$/, '')).toBe('http://example.com');
			expect(result.textContent).toBe('');
		});

		it('should reset form after creating anchor', () => {
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.displayInput.value = 'Example Link';
			modalAnchor.urlInput.value = 'http://example.com';
			modalAnchor.preview.textContent = 'http://example.com';

			modalAnchor.create(false);

			expect(modalAnchor.linkValue).toBe('');
			expect(modalAnchor.displayInput.value).toBe('');
			expect(modalAnchor.urlInput.value).toBe('');
			expect(modalAnchor.preview.textContent).toBe('');
		});
	});

	describe('Parameters', () => {
		it('should handle openNewWindow parameter', () => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			const modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { openNewWindow: true });

			expect(modalAnchor.openNewWindow).toBe(true);
		});

		it('should handle relList parameter', () => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			const modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				relList: ['nofollow', 'noreferrer'],
			});

			expect(modalAnchor.relList).toEqual(['nofollow', 'noreferrer']);
		});

		it('should handle defaultRel parameter', () => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			const modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				defaultRel: { default: 'nofollow' },
			});

			expect(modalAnchor.defaultRel).toEqual({ default: 'nofollow' });
		});

		it('should handle noAutoPrefix parameter', () => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			const modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { noAutoPrefix: true });

			expect(modalAnchor.noAutoPrefix).toBe(true);
		});
	});

	describe('Download functionality', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should set download attribute when checked', () => {
			modalAnchor.linkValue = 'http://example.com/file.pdf';
			modalAnchor.displayInput.value = 'Download PDF';
			modalAnchor.downloadCheck.checked = true;

			const result = modalAnchor.create(false);

			expect(result.download).toBe('Download PDF');
		});

		it('should not set download attribute for bookmarks', () => {
			modalAnchor.linkValue = '#section1';
			modalAnchor.displayInput.value = 'Go to Section 1';
			modalAnchor.downloadCheck.checked = true;

			const result = modalAnchor.create(false);

			expect(result.hasAttribute('download')).toBe(false);
		});
	});

	describe('Target attribute', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should set target to _blank when newWindowCheck is checked', () => {
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.newWindowCheck.checked = true;

			const result = modalAnchor.create(false);

			expect(result.href.replace(/\/$/, '')).toBe('http://example.com');
			expect(result.target).toBe('_blank');
		});

		it('should remove target attribute when newWindowCheck is unchecked', () => {
			const existingAnchor = document.createElement('a');
			existingAnchor.target = '_blank';

			modalAnchor.set(existingAnchor);
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.newWindowCheck.checked = false;

			const result = modalAnchor.create(false);

			expect(result.hasAttribute('target')).toBe(false);
		});
	});
	describe('File Upload', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"><input type="file" class="se-input-file"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { enableFileUpload: true, uploadUrl: 'http://upload.com' });
		});

		it('should handle file selection', async () => {
			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

			// Get the input element created in constructor
			const input = modalAnchor.input;
			// Define files property on input
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			// Find the change event handler registered via eventManager
			// eventManager.addEvent(this.input, 'change', handler)
			// Access eventManager via modalAnchor (inherited from CoreInjector)
			const addEventSpy = modalAnchor.eventManager.addEvent;

			expect(addEventSpy).toHaveBeenCalledWith(input, 'change', expect.any(Function));

			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			// Spy on triggerEvent
			const triggerSpy = jest.spyOn(mockInst.editor, 'triggerEvent');

			// Simulate Event
			const mockEvent = {
				target: input,
				currentTarget: input,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			};

			// Call handler
			await changeHandler(mockEvent);

			expect(triggerSpy).toHaveBeenCalledWith(
				'onFileUploadBefore',
				expect.objectContaining({
					info: expect.objectContaining({
						files: expect.any(Array),
					}),
				}),
			);
		});
	});

	describe('Bookmark Logic', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = `
                <div class="se-anchor-editor">
                    <input class="se-input-form se-input-url" />
                    <button class="se-btn se-tooltip se-modal-files-edge-button _se_bookmark_button"></button>
                    <div class="se-anchor-preview-form">
                        <span class="se-svg se-anchor-preview-icon _se_anchor_bookmark_icon" style="display:none;"></span>
                        <span class="se-svg se-anchor-preview-icon _se_anchor_download_icon" style="display:none;"></span>
                        <pre class="se-link-preview"></pre>
                    </div>
                </div>
            `;

			// Re-instantiate to attach events
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should toggle bookmark button active state', async () => {
			// Mock elements
			const button = modalAnchor.bookmarkButton;
			const urlInput = modalAnchor.urlInput;

			// Setup dom helper mock for getListChildren if needed (called inside bookmark logic)
			// But valid toggle logic calls createBookmarkList
			dom.query.getListChildren.mockReturnValue([{ nodeName: 'H1', textContent: 'Header 1', id: 'h1', style: {} }]);
			// Also need check.isAnchor
			dom.check.isAnchor.mockReturnValue(false);

			// Get handler
			const addEventSpy = modalAnchor.eventManager.addEvent;
			const clickHandler = addEventSpy.mock.calls.find((call) => call[0] === button && call[1] === 'click')[2];

			urlInput.value = ''; // Not a bookmark

			await clickHandler();

			// Should switch to bookmark mode -> value starts with #
			expect(urlInput.value).toBe('#');
			// expect(modalAnchor.bookmarkButton.classList.contains('active')).toBe(true); // Fails because dom.utils.addClass is mocked
			expect(dom.utils.addClass).toHaveBeenCalledWith(modalAnchor.bookmarkButton, 'active');

			// Click again -> switch back
			await clickHandler();
			expect(urlInput.value).toBe('');
			// expect(modalAnchor.bookmarkButton.classList.contains('active')).toBe(false);
			expect(dom.utils.removeClass).toHaveBeenCalledWith(modalAnchor.bookmarkButton, 'active');
		});
	});

	describe('Rel Attribute Logic', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = `
                <div class="se-anchor-editor">
                    <button class="se-anchor-rel-btn"></button>
                    <div class="se-anchor-rel-preview"></div>
                </div>
            `;
			// Need to mock SelectMenu to capture the callback
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				relList: ['nofollow', 'noopener', 'noreferrer'],
			});
		});

		it('should initialize rel list', () => {
			expect(modalAnchor.relList).toEqual(['nofollow', 'noopener', 'noreferrer']);
		});
	});

	describe('Link Preview and Event Handlers', () => {
		let modalAnchor;
		let mockModalForm;

		beforeEach(() => {
			mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = `
                <div class="se-anchor-editor">
                    <input class="se-input-form se-input-url se-input-url" />
                    <input class="se-input-form _se_display_text" />
                    <input class="se-modal-btn-check _se_anchor_download" type="checkbox" />
                    <button class="_se_bookmark_button"></button>
                    <div class="se-anchor-preview-form">
                        <span class="_se_anchor_bookmark_icon" style="display:none;"></span>
                        <span class="_se_anchor_download_icon" style="display:none;"></span>
                        <pre class="se-link-preview"></pre>
                    </div>
                </div>
            `;
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should update preview on url input change', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'http://google.com';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			// Find 'input' event handler
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.preview.textContent).toBe('http://google.com');
		});

		it('should auto-prefix http if missing protocol', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'www.google.com';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			// The logic adds protocol if starting with www and default protocol is set (mocked to https://)
			expect(modalAnchor.preview.textContent).toBe('https://www.google.com');
		});

		it('should handle download checkbox change', async () => {
			const checkbox = modalAnchor.downloadCheck;
			const urlInput = modalAnchor.urlInput;
			urlInput.value = 'http://test.com/file.zip';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === checkbox && call[1] === 'change')[2];

			checkbox.checked = true;
			await changeHandler({ target: checkbox });

			expect(modalAnchor.download.style.display).toBe('block');

			checkbox.checked = false;
			await changeHandler({ target: checkbox });

			expect(modalAnchor.download.style.display).toBe('none');
		});

		it('should trigger list creation on focus if valid bookmark', async () => {
			const input = modalAnchor.urlInput;
			input.value = '#header1';

			// Mock selfPathBookmark to return true (logic depends on mockEnv or url)
			// The method logic: return path.indexOf('#') === 0 ...
			// So '#header1' returns true.

			// Should call _createBookmarkList
			// Which uses dom.query.getListChildren
			dom.query.getListChildren.mockReturnValue([]);

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const focusHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'focus')[2];

			await focusHandler();

			expect(dom.query.getListChildren).toHaveBeenCalled();
		});
	});
});
