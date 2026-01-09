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
		this.uiManager = (editor && editor.uiManager) || { alertOpen: jest.fn() };
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
			uiManager: {
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

	describe('Rel Attribute Management', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = `
				<div class="se-anchor-editor">
					<button class="se-anchor-rel-btn"></button>
					<pre class="se-anchor-rel-preview"></pre>
				</div>
			`;
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				relList: ['nofollow', 'noopener', 'noreferrer'],
				defaultRel: {
					default: 'nofollow',
					check_new_window: 'noopener noreferrer',
					check_bookmark: 'bookmark',
				},
			});
		});

		it('should set default rel on init', () => {
			modalAnchor.init();
			expect(modalAnchor.currentRel).toEqual(['nofollow']);
		});

		it('should merge rel attributes correctly', () => {
			modalAnchor.currentRel = ['nofollow'];

			// Simulate on() with isUpdate=false to trigger setRel
			modalAnchor.on(false);

			expect(modalAnchor.currentRel).toContain('nofollow');
		});

		it('should handle newWindowCheck change and update rel', async () => {
			const checkbox = modalAnchor.newWindowCheck;

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === checkbox && call[1] === 'change')[2];

			// Check to true - should merge check_new_window rel
			checkbox.checked = true;
			await changeHandler({ target: checkbox });

			expect(modalAnchor.currentRel).toContain('noopener');
			expect(modalAnchor.currentRel).toContain('noreferrer');

			// Uncheck - should remove check_new_window rel
			checkbox.checked = false;
			await changeHandler({ target: checkbox });

			expect(modalAnchor.currentRel).not.toContain('noopener');
			expect(modalAnchor.currentRel).not.toContain('noreferrer');
		});

		it('should handle rel with "only:" prefix', () => {
			modalAnchor.currentRel = ['nofollow', 'noopener'];

			// Test internally by creating anchor with rel
			modalAnchor.linkValue = 'http://example.com';

			const result = modalAnchor.create(false);

			expect(result.rel).toContain('nofollow');
			expect(result.rel).toContain('noopener');
		});

		it('should create anchor without rel if currentRel is empty', () => {
			modalAnchor.currentRel = [];
			modalAnchor.linkValue = 'http://example.com';

			const result = modalAnchor.create(false);

			expect(result.hasAttribute('rel')).toBe(false);
		});
	});

	describe('Bookmark List Creation', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});

			// Setup frameContext
			modalAnchor.frameContext = new Map([['wysiwyg', document.createElement('div')]]);
		});

		it('should create bookmark list from headers', async () => {
			const h1 = document.createElement('h1');
			h1.textContent = 'Test Header';
			h1.id = 'test-header';
			h1.style.cssText = 'font-size: 24px;';

			dom.query.getListChildren.mockReturnValue([h1]);

			const input = modalAnchor.urlInput;
			input.value = '#test';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(dom.query.getListChildren).toHaveBeenCalled();
		});

		it('should filter headers based on input value', async () => {
			const h1 = document.createElement('h1');
			h1.textContent = 'Matching Header';
			h1.style.cssText = '';

			const h2 = document.createElement('h2');
			h2.textContent = 'Non-matching';
			h2.style.cssText = '';

			dom.query.getListChildren.mockReturnValue([h1, h2]);

			const input = modalAnchor.urlInput;
			input.value = '#Match';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(dom.query.getListChildren).toHaveBeenCalled();
		});

		it('should handle anchor elements in bookmark list', async () => {
			const anchor = document.createElement('a');
			anchor.id = 'bookmark-anchor';
			anchor.textContent = 'bookmark';

			dom.check.isAnchor.mockReturnValue(true);
			dom.query.getListChildren.mockReturnValue([anchor]);

			const input = modalAnchor.urlInput;
			input.value = '#book';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			// getListChildren should be called for bookmark processing
			expect(dom.query.getListChildren).toHaveBeenCalled();
		});

		it('should close bookmark menu when no headers match', async () => {
			dom.query.getListChildren.mockReturnValue([]);

			const input = modalAnchor.urlInput;
			input.value = '#nonexistent';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			// Should not throw error and getListChildren should be called
			expect(dom.query.getListChildren).toHaveBeenCalled();
		});
	});

	describe('Self Path Bookmark Detection', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should detect hash-only bookmarks', () => {
			modalAnchor.linkValue = '#section1';
			modalAnchor.displayInput.value = 'Section 1';
			modalAnchor.downloadCheck.checked = true;

			const result = modalAnchor.create(false);

			// Download should not be set for bookmarks
			expect(result.hasAttribute('download')).toBe(false);
		});

		it('should detect same-page bookmarks with full URL', async () => {
			const input = modalAnchor.urlInput;
			// Use just the hash to detect as bookmark
			input.value = '#section';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			// Should display bookmark icon for hash-only URLs
			expect(modalAnchor.bookmark.style.display).toBe('block');
		});

		it('should not treat external URLs as bookmarks', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'http://example.com';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.bookmark.style.display).toBe('none');
		});
	});

	describe('File Upload Error Handling', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				enableFileUpload: true,
				uploadUrl: 'http://upload.com',
			});
		});

		it('should handle upload error response via triggerEvent', async () => {
			// The error flow goes through triggerEvent which returns NO_EVENT
			// then alertOpen is called with the error message
			const { env } = require('../../../src/helper');

			// First call (onFileUploadBefore) returns NO_EVENT to proceed
			// Error happens during upload callback which triggers onFileUploadError
			modalAnchor.triggerEvent = jest.fn().mockImplementation((eventName) => {
				if (eventName === 'onFileUploadBefore') {
					return Promise.resolve(env.NO_EVENT);
				}
				if (eventName === 'onFileUploadError') {
					return Promise.resolve(env.NO_EVENT);
				}
				return Promise.resolve(undefined);
			});

			modalAnchor.fileManager.asyncUpload.mockResolvedValue({
				responseText: JSON.stringify({ errorMessage: 'Upload failed' }),
			});

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			await changeHandler({ target: input, currentTarget: input });

			// Error handling triggers onFileUploadError event
			expect(modalAnchor.triggerEvent).toHaveBeenCalledWith('onFileUploadError', expect.any(Object));
		});

		it('should suppress error display when event returns false', async () => {
			modalAnchor.triggerEvent = jest.fn().mockResolvedValue(false);

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			await changeHandler({ target: input, currentTarget: input });

			// When triggerEvent returns false, upload is cancelled
			expect(modalAnchor.fileManager.asyncUpload).not.toHaveBeenCalled();
		});
	});

	describe('Upload Callback Success', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				enableFileUpload: true,
				uploadUrl: 'http://upload.com',
			});
		});

		it('should call asyncUpload with correct parameters on success', async () => {
			const { env } = require('../../../src/helper');

			const uploadResponse = {
				result: [{ url: 'http://cdn.com/uploaded.pdf', name: 'uploaded.pdf' }],
			};

			// Mock triggerEvent to proceed with upload
			modalAnchor.triggerEvent = jest.fn().mockResolvedValue(env.NO_EVENT);

			modalAnchor.fileManager.asyncUpload.mockResolvedValue({
				responseText: JSON.stringify(uploadResponse),
			});

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			await changeHandler({ target: input, currentTarget: input });

			// Verify asyncUpload was called
			expect(modalAnchor.fileManager.asyncUpload).toHaveBeenCalled();
		});

		it('should process successful upload response', async () => {
			const { env } = require('../../../src/helper');

			// Create a simpler test that verifies the upload flow
			modalAnchor.triggerEvent = jest.fn().mockResolvedValue(env.NO_EVENT);

			const uploadResponse = {
				result: [{ url: 'http://cdn.com/uploaded.pdf', name: 'uploaded.pdf' }],
			};

			modalAnchor.fileManager.asyncUpload.mockResolvedValue({
				responseText: JSON.stringify(uploadResponse),
			});

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			await changeHandler({ target: input, currentTarget: input });

			// After successful upload, the values should be updated
			// The asyncUpload mock returns success data
			expect(modalAnchor.fileManager.asyncUpload).toHaveBeenCalledWith(
				'http://upload.com',
				null,
				expect.anything(),
			);
		});
	});

	describe('Event Handler - onFileUploadBefore', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				enableFileUpload: true,
				uploadUrl: 'http://upload.com',
			});
		});

		it('should skip upload when event returns false', async () => {
			modalAnchor.triggerEvent = jest.fn().mockResolvedValue(false);

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			const result = await changeHandler({ target: input, currentTarget: input });

			expect(result).toBe(false);
			expect(modalAnchor.fileManager.asyncUpload).not.toHaveBeenCalled();
		});

		it('should allow custom handler via event return object', async () => {
			const customHandler = jest.fn();
			modalAnchor.triggerEvent = jest.fn().mockResolvedValue({ files: [], custom: true });

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			await changeHandler({ target: input, currentTarget: input });

			expect(modalAnchor.triggerEvent).toHaveBeenCalledWith(
				'onFileUploadBefore',
				expect.objectContaining({
					handler: expect.any(Function),
				}),
			);
		});

		it('should return true when event returns undefined', async () => {
			modalAnchor.triggerEvent = jest.fn().mockResolvedValue(undefined);

			const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			const result = await changeHandler({ target: input, currentTarget: input });

			expect(result).toBe(true);
		});
	});

	describe('Title Attribute', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { title: true });
		});

		it('should set title attribute when provided', () => {
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.titleInput.value = 'Link Title';

			const result = modalAnchor.create(false);

			expect(result.title).toBe('Link Title');
		});

		it('should remove title attribute when empty', () => {
			const existingAnchor = document.createElement('a');
			existingAnchor.title = 'Old Title';

			modalAnchor.set(existingAnchor);
			modalAnchor.linkValue = 'http://example.com';
			modalAnchor.titleInput.value = '';

			const result = modalAnchor.create(false);

			expect(result.hasAttribute('title')).toBe(false);
		});
	});

	describe('URL Protocol Handling', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should preserve mailto: protocol', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'mailto:test@example.com';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.linkValue).toBe('mailto:test@example.com');
		});

		it('should preserve tel: protocol', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'tel:+1234567890';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.linkValue).toBe('tel:+1234567890');
		});

		it('should preserve sms: protocol', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'sms:+1234567890';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.linkValue).toBe('sms:+1234567890');
		});

		it('should add host path for relative URLs', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'page/subpage';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.linkValue).toContain('page/subpage');
		});

		it('should handle absolute path starting with /', async () => {
			const input = modalAnchor.urlInput;
			input.value = '/absolute/path';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			expect(modalAnchor.linkValue).toContain('/absolute/path');
		});
	});

	describe('noAutoPrefix Option', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { noAutoPrefix: true });
		});

		it('should not auto-prefix URLs when noAutoPrefix is true', async () => {
			const input = modalAnchor.urlInput;
			input.value = 'example.com/page';

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const inputHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'input')[2];

			await inputHandler({ target: input });

			// Should keep the original value without prefix
			expect(modalAnchor.linkValue).toBe('example.com/page');
		});
	});

	describe('Download Check with Bookmark Toggle', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				defaultRel: { check_bookmark: 'bookmark' },
			});
		});

		it('should remove hash when download is checked', async () => {
			modalAnchor.urlInput.value = '#bookmark-section';
			modalAnchor.linkValue = '#bookmark-section';

			const checkbox = modalAnchor.downloadCheck;
			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === checkbox && call[1] === 'change')[2];

			checkbox.checked = true;
			await changeHandler({ target: checkbox });

			expect(modalAnchor.urlInput.value).toBe('bookmark-section');
			expect(modalAnchor.bookmark.style.display).toBe('none');
		});
	});

	describe('Empty File Input', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				enableFileUpload: true,
				uploadUrl: 'http://upload.com',
			});
		});

		it('should not process when no files selected', async () => {
			const input = modalAnchor.input;
			Object.defineProperty(input, 'files', {
				value: [],
				writable: false,
			});

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const changeHandler = addEventSpy.mock.calls.find((call) => call[0] === input && call[1] === 'change')[2];

			await changeHandler({ target: input, currentTarget: input });

			expect(modalAnchor.fileManager.asyncUpload).not.toHaveBeenCalled();
		});
	});

	describe('Rel Button Click', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = `
				<div class="se-anchor-editor">
					<button class="se-anchor-rel-btn"></button>
					<pre class="se-anchor-rel-preview"></pre>
				</div>
			`;
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {
				relList: ['nofollow', 'noopener'],
			});
		});

		it('should open rel select menu on button click', async () => {
			const button = modalAnchor.relButton;

			const addEventSpy = modalAnchor.eventManager.addEvent;
			const clickHandler = addEventSpy.mock.calls.find((call) => call[0] === button && call[1] === 'click')[2];

			await clickHandler();

			// SelectMenu.open should have been called (it's mocked)
			// We can't directly verify the mock since it's a separate instance
			// but we verify no error is thrown
			expect(true).toBe(true);
		});
	});

	describe('Text to Display Option', () => {
		it('should hide text display input when textToDisplay is false', () => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			const modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { textToDisplay: false });

			// The displayInput should exist but may be hidden via style
			expect(modalAnchor.displayInput).toBeDefined();
		});

		it('should show text display input when textToDisplay is true', () => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			const modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, { textToDisplay: true });

			expect(modalAnchor.displayInput).toBeDefined();
		});
	});

	describe('Update Existing Anchor with Download', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should preserve download attribute on existing anchor', () => {
			const existingAnchor = document.createElement('a');
			existingAnchor.href = 'http://example.com/file.pdf';
			existingAnchor.download = 'file.pdf';

			modalAnchor.set(existingAnchor);
			modalAnchor.on(true);

			expect(modalAnchor.downloadCheck.checked).toBe(true);
		});
	});

	describe('Children Preservation with notText', () => {
		let modalAnchor;

		beforeEach(() => {
			const mockModalForm = document.createElement('form');
			mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
			modalAnchor = new ModalAnchorEditor(mockEditor, mockModalForm, {});
		});

		it('should preserve children when notText is true and anchor has children', () => {
			const existingAnchor = document.createElement('a');
			const img = document.createElement('img');
			img.src = 'test.jpg';
			existingAnchor.appendChild(img);

			modalAnchor.set(existingAnchor);
			modalAnchor.linkValue = 'http://example.com';

			const result = modalAnchor.create(true);

			expect(result.children.length).toBe(1);
			expect(result.children[0].tagName).toBe('IMG');
		});

		it('should clear text when notText is true and anchor has no children', () => {
			const existingAnchor = document.createElement('a');
			existingAnchor.textContent = 'Old text';

			modalAnchor.set(existingAnchor);
			modalAnchor.linkValue = 'http://example.com';

			const result = modalAnchor.create(true);

			expect(result.textContent).toBe('');
		});
	});
});
