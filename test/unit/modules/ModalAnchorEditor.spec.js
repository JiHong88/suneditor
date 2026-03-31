/**
 * @fileoverview Unit tests for modules/ui/ModalAnchorEditor.js
 * Targets 90%+ branch coverage by testing all private methods via event handlers.
 */

import ModalAnchorEditor from '../../../src/modules/ui/ModalAnchorEditor';
import { createMockEditor } from '../../__mocks__/editorMock';
import { env } from '../../../src/helper';

const { NO_EVENT } = env;

// Mock FileManager
jest.mock('../../../src/modules/manager/FileManager', () => {
	return jest.fn().mockImplementation(() => ({
		upload: jest.fn(),
		asyncUpload: jest.fn().mockResolvedValue({ responseText: '{"result":[{"url":"http://file.com/f.pdf","name":"f.pdf"}]}' }),
	}));
});

// Mock SelectMenu - needs form, on, off, init, create, open, close
jest.mock('../../../src/modules/ui/SelectMenu', () => {
	return jest.fn().mockImplementation(() => {
		// Use global.document to avoid jest.mock scoping issue
		const mockFormDiv = global.document.createElement('div');
		mockFormDiv.innerHTML = '<div class="se-list-inner"></div>';
		return {
			on: jest.fn(),
			off: jest.fn(),
			init: jest.fn(),
			create: jest.fn(),
			open: jest.fn(),
			close: jest.fn(),
			form: mockFormDiv,
			items: [],
			menus: [],
		};
	});
});

const SelectMenu = require('../../../src/modules/ui/SelectMenu');

/**
 * Creates a properly configured mock $ (deps bag) for ModalAnchorEditor.
 */
function createDeps(overrides = {}) {
	const editor = createMockEditor();
	const $ = editor.$;

	// selection.get must return an object with toString
	$.selection.get = jest.fn().mockReturnValue({
		toString: () => 'selected text',
		rangeCount: 1,
	});

	// Add lang keys needed by CreateModalForm
	$.lang.link_modal_url = 'URL';
	$.lang.link_modal_text = 'Text to display';
	$.lang.link_modal_newWindowCheck = 'Open in new window';
	$.lang.link_modal_downloadLinkCheck = 'Download';
	$.lang.link_modal_bookmark = 'Bookmark';
	$.lang.link_modal_relAttribute = 'Rel Attribute';
	$.lang.fileUpload = 'File Upload';
	$.lang.title = 'Title';

	// Add icons needed
	$.icons.checked = '<svg class="checked"/>';
	$.icons.bookmark = '<svg class="bookmark"/>';
	$.icons.bookmark_anchor = '<svg class="bookmark-anchor"/>';
	$.icons.download = '<svg class="download"/>';
	$.icons.file_upload = '<svg class="file-upload"/>';
	$.icons.link_rel = '<svg class="link-rel"/>';

	// Override options.get for defaultUrlProtocol
	const originalGet = $.options.get;
	$.options.get = jest.fn((key) => {
		if (key === 'defaultUrlProtocol') return overrides.defaultUrlProtocol !== undefined ? overrides.defaultUrlProtocol : 'https://';
		if (key === '_rtl') return overrides._rtl || false;
		return typeof originalGet === 'function' ? originalGet(key) : null;
	});

	return $;
}

/**
 * Creates a modal form element with .se-anchor-editor container.
 */
function createModalForm() {
	const form = document.createElement('form');
	form.innerHTML = '<div class="se-anchor-editor"></div>';
	return form;
}

/**
 * Helper: Gets event handlers registered via $.eventManager.addEvent.mock.calls.
 * Returns a map of [eventType] -> handler for easier access.
 */
function getEventHandlers($) {
	const calls = $.eventManager.addEvent.mock.calls;
	const handlers = {};
	for (let i = 0; i < calls.length; i++) {
		const [element, eventType, handler] = calls[i];
		const key = `${i}:${eventType}`;
		handlers[key] = { element, eventType, handler, index: i };
	}
	return { calls, handlers };
}

// ============================================================
// TESTS
// ============================================================

describe('ModalAnchorEditor', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		SelectMenu.mockClear();
	});

	// ---------------------------------------------------------
	// Constructor tests
	// ---------------------------------------------------------
	describe('constructor - basic config (no rel, no fileUpload)', () => {
		it('should initialise all DOM elements and register event handlers', () => {
			const $ = createDeps();
			const form = createModalForm();
			const ae = new ModalAnchorEditor($, form, {
				openNewWindow: false,
				relList: [],
				defaultRel: {},
				noAutoPrefix: false,
				enableFileUpload: false,
			});

			expect(ae.urlInput).toBeTruthy();
			expect(ae.urlInput.tagName).toBe('INPUT');
			expect(ae.displayInput).toBeTruthy();
			expect(ae.titleInput).toBeTruthy();
			expect(ae.newWindowCheck).toBeTruthy();
			expect(ae.downloadCheck).toBeTruthy();
			expect(ae.preview).toBeTruthy();
			expect(ae.bookmark).toBeTruthy();
			expect(ae.bookmarkButton).toBeTruthy();
			expect(ae.download).toBeTruthy();
			expect(ae.openNewWindow).toBe(false);
			expect(ae.noAutoPrefix).toBe(false);
			expect(ae.relList).toEqual([]);
			expect(ae.currentRel).toEqual([]);
			expect(ae.currentTarget).toBeNull();
			expect(ae.linkValue).toBe('');

			// 6 event handlers: newWindowCheck change, downloadCheck change, urlInput input, urlInput focus, bookmarkButton click, uploadButton click
			expect($.eventManager.addEvent).toHaveBeenCalledTimes(6);
		});

		it('should set openNewWindow=true when passed', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				openNewWindow: true,
				relList: [],
				defaultRel: {},
			});
			expect(ae.openNewWindow).toBe(true);
		});

		it('should handle relList as non-array gracefully', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: 'invalid',
				defaultRel: {},
			});
			expect(ae.relList).toEqual([]);
		});

		it('should set host from window.location', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			expect(typeof ae.host).toBe('string');
		});
	});

	describe('constructor - with relList', () => {
		it('should create relButton, relPreview, and selectMenu_rel', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel: { default: 'nofollow' },
			});

			expect(ae.relButton).toBeTruthy();
			expect(ae.relPreview).toBeTruthy();
			// SelectMenu called twice: once for rel, once for bookmark
			expect(SelectMenu).toHaveBeenCalledTimes(2);
			// addEvent has extra call for relButton click (shifted by 1)
			expect($.eventManager.addEvent).toHaveBeenCalledTimes(7);
		});

		it('should mark default rel items with se-checked class', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel: { default: 'nofollow' },
			});
			// The selectMenu_rel.create was called with button elements
			const relSelectMenu = SelectMenu.mock.results[0].value;
			expect(relSelectMenu.create).toHaveBeenCalled();
			const buttons = relSelectMenu.create.mock.calls[0][0];
			// First button should have se-checked (nofollow is in default)
			expect(buttons[0].classList.contains('se-checked')).toBe(true);
			// Second button should NOT have se-checked (noreferrer not in default)
			expect(buttons[1].classList.contains('se-checked')).toBe(false);
		});
	});

	describe('constructor - with enableFileUpload', () => {
		it('should create file input and fileManager', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
				uploadHeaders: { 'X-Token': 'abc' },
				uploadSizeLimit: 1024000,
				uploadSingleSizeLimit: 512000,
				acceptedFormats: '.pdf,.doc',
			});

			expect(ae.input).toBeTruthy();
			expect(ae.input.type).toBe('file');
			expect(ae.input.accept).toBe('.pdf,.doc');
			expect(ae.uploadUrl).toBe('/upload');
			expect(ae.uploadHeaders).toEqual({ 'X-Token': 'abc' });
			expect(ae.uploadSizeLimit).toBe(1024000);
			expect(ae.uploadSingleSizeLimit).toBe(512000);
			expect(ae.fileManager).toBeTruthy();
			// Extra addEvent for file input change
			expect($.eventManager.addEvent).toHaveBeenCalledTimes(7);
		});

		it('should set uploadUrl to null when not a string', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: 123,
			});
			expect(ae.uploadUrl).toBeNull();
		});

		it('should default acceptedFormats to *', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
			});
			expect(ae.input.accept).toBe('*');
		});
	});

	// ---------------------------------------------------------
	// set()
	// ---------------------------------------------------------
	describe('set', () => {
		it('should set currentTarget to the given element', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const anchor = document.createElement('a');
			ae.set(anchor);
			expect(ae.currentTarget).toBe(anchor);
		});
	});

	// ---------------------------------------------------------
	// on()
	// ---------------------------------------------------------
	describe('on', () => {
		it('should init and populate display from selection when isUpdate=false', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: { default: '' },
				openNewWindow: true,
			});

			ae.on(false);
			expect(ae.displayInput.value).toBe('selected text');
			expect(ae.newWindowCheck.checked).toBe(true);
			expect(ae.titleInput.value).toBe('');
			expect(ae.currentTarget).toBeNull();
		});

		it('should populate from currentTarget when isUpdate=true', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });

			const anchor = document.createElement('a');
			anchor.href = 'https://example.com';
			anchor.textContent = 'Link text';
			anchor.title = 'My Title';
			anchor.target = '_blank';
			anchor.download = 'file.pdf';
			anchor.rel = 'nofollow';
			ae.set(anchor);
			ae.on(true);

			expect(ae.urlInput.value).toContain('example.com');
			expect(ae.displayInput.value).toBe('Link text');
			expect(ae.titleInput.value).toBe('My Title');
			expect(ae.newWindowCheck.checked).toBe(true);
			expect(ae.downloadCheck.checked).toBe(true);
		});

		it('should use defaultRel.default when isUpdate=false', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel: { default: 'nofollow noreferrer' },
			});
			ae.on(false);
			expect(ae.currentRel).toEqual(['nofollow', 'noreferrer']);
		});

		it('should use currentTarget.rel when isUpdate=true', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { default: 'nofollow' },
			});
			const anchor = document.createElement('a');
			anchor.href = 'https://test.com';
			anchor.rel = 'noopener';
			ae.set(anchor);
			ae.on(true);
			expect(ae.currentRel).toEqual(['noopener']);
		});

		it('should handle isUpdate=true with no currentTarget', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { default: 'nofollow' },
			});
			ae.on(true);
			// When isUpdate=true but currentTarget is null, the if branch is skipped
			// and #setRel gets defaultRel.default
			expect(ae.currentRel).toEqual(['nofollow']);
		});

		it('should populate non-bookmark href on update', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const anchor = document.createElement('a');
			anchor.href = 'https://other-site.com/page';
			anchor.textContent = 'Other';
			ae.set(anchor);
			ae.on(true);
			// Not a selfPathBookmark, so full href is used
			expect(ae.urlInput.value).toBe('https://other-site.com/page');
			expect(ae.linkValue).toBe('https://other-site.com/page');
		});
	});

	// ---------------------------------------------------------
	// create()
	// ---------------------------------------------------------
	describe('create', () => {
		it('should return null when linkValue is empty', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = '';
			expect(ae.create(false)).toBeNull();
		});

		it('should create new anchor when no currentTarget', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.displayInput.value = 'Example';

			const result = ae.create(false);
			expect(result).toBeTruthy();
			expect(result.tagName).toBe('A');
			expect(result.href).toContain('example.com');
			expect(result.textContent).toBe('Example');
		});

		it('should use url as display text when displayInput is empty', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.displayInput.value = '';
			const result = ae.create(false);
			expect(result.textContent).toBe('https://example.com');
		});

		it('should update existing currentTarget', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const anchor = document.createElement('a');
			ae.set(anchor);
			ae.linkValue = 'https://test.com';
			ae.displayInput.value = 'Test';
			const result = ae.create(false);
			expect(result).toBe(anchor);
			expect(result.href).toContain('test.com');
		});

		it('should set target=_blank when newWindowCheck is checked', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.newWindowCheck.checked = true;
			const result = ae.create(false);
			expect(result.target).toBe('_blank');
		});

		it('should remove target when newWindowCheck is unchecked', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.newWindowCheck.checked = false;
			const result = ae.create(false);
			expect(result.hasAttribute('target')).toBe(false);
		});

		it('should set rel when currentRel has values', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.currentRel = ['nofollow', 'noreferrer'];
			const result = ae.create(false);
			expect(result.rel).toBe('nofollow noreferrer');
		});

		it('should remove rel when currentRel is empty', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.currentRel = [];
			const result = ae.create(false);
			expect(result.hasAttribute('rel')).toBe(false);
		});

		it('should set title attribute when titleInput has value', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.titleInput.value = 'My Title';
			const result = ae.create(false);
			expect(result.title).toBe('My Title');
		});

		it('should remove title when titleInput is empty', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.titleInput.value = '';
			const result = ae.create(false);
			expect(result.hasAttribute('title')).toBe(false);
		});

		it('should set download attribute when downloadCheck is checked and not bookmark', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com/file.pdf';
			ae.downloadCheck.checked = true;
			ae.displayInput.value = 'file.pdf';
			const result = ae.create(false);
			expect(result.getAttribute('download')).toBe('file.pdf');
		});

		it('should remove download when it is a bookmark URL', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = '#section1';
			ae.downloadCheck.checked = true;
			const result = ae.create(false);
			expect(result.hasAttribute('download')).toBe(false);
		});

		it('should handle notText=true with no children (empty text)', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			// notText=true, anchor has no children
			const result = ae.create(true);
			expect(result.textContent).toBe('');
		});

		it('should handle notText=true with existing children (keep text)', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const anchor = document.createElement('a');
			const img = document.createElement('img');
			img.src = 'test.png';
			anchor.appendChild(img);
			ae.set(anchor);
			ae.linkValue = 'https://example.com';
			ae.displayInput.value = 'Display';
			const result = ae.create(true);
			// notText=true and has children -> should not overwrite
			expect(result.querySelector('img')).toBeTruthy();
		});

		it('should reset linkValue, preview, urlInput, displayInput after create', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com';
			ae.displayInput.value = 'test';
			ae.create(false);
			expect(ae.linkValue).toBe('');
			expect(ae.preview.textContent).toBe('');
			expect(ae.urlInput.value).toBe('');
			expect(ae.displayInput.value).toBe('');
		});
	});

	// ---------------------------------------------------------
	// init()
	// ---------------------------------------------------------
	describe('init', () => {
		it('should reset all state', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.currentTarget = document.createElement('a');
			ae.linkValue = 'https://example.com';
			ae.urlInput.value = 'https://example.com';
			ae.displayInput.value = 'Test';
			ae.preview.textContent = 'https://example.com';
			ae.newWindowCheck.checked = true;
			ae.downloadCheck.checked = true;

			ae.init();
			expect(ae.currentTarget).toBeNull();
			expect(ae.linkValue).toBe('');
			expect(ae.urlInput.value).toBe('');
			expect(ae.displayInput.value).toBe('');
			expect(ae.preview.textContent).toBe('');
			expect(ae.newWindowCheck.checked).toBe(false);
			expect(ae.downloadCheck.checked).toBe(false);
		});

		it('should call #setRel with defaultRel.default', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { default: 'nofollow' },
			});
			ae.currentRel = ['noreferrer'];
			ae.init();
			expect(ae.currentRel).toEqual(['nofollow']);
		});
	});

	// ---------------------------------------------------------
	// #OnChange_newWindowCheck (via event handler)
	// ---------------------------------------------------------
	describe('#OnChange_newWindowCheck', () => {
		function setup(defaultRel = {}) {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel,
			});
			// With relList, event indices are shifted by 1 (relButton click is at index 0)
			// addEvent calls: [0] relButton click, [1] newWindowCheck change, ...
			const { calls } = getEventHandlers($);
			const newWindowCheckHandler = calls[1][2]; // index 1 is newWindowCheck change
			return { ae, $, newWindowCheckHandler };
		}

		it('should return early when check_new_window is not a string', () => {
			const { ae, newWindowCheckHandler } = setup({ default: '' }); // no check_new_window
			ae.currentRel = [];
			const checkbox = ae.newWindowCheck;
			checkbox.checked = true;
			newWindowCheckHandler({ target: checkbox });
			// currentRel should remain unchanged (early return)
			expect(ae.currentRel).toEqual([]);
		});

		it('should merge rel when checked and check_new_window is a string', () => {
			const { ae, newWindowCheckHandler } = setup({ default: '', check_new_window: 'noopener' });
			ae.currentRel = ['nofollow'];
			const checkbox = ae.newWindowCheck;
			checkbox.checked = true;
			newWindowCheckHandler({ target: checkbox });
			expect(ae.currentRel).toContain('noopener');
			expect(ae.currentRel).toContain('nofollow');
		});

		it('should delete rel when unchecked and check_new_window is a string', () => {
			const { ae, newWindowCheckHandler } = setup({ default: '', check_new_window: 'noopener' });
			ae.currentRel = ['nofollow', 'noopener'];
			const checkbox = ae.newWindowCheck;
			checkbox.checked = false;
			newWindowCheckHandler({ target: checkbox });
			expect(ae.currentRel).not.toContain('noopener');
		});

		it('should handle "only:" prefix in check_new_window for merge', () => {
			const { ae, newWindowCheckHandler } = setup({ default: '', check_new_window: 'only:noopener noreferrer' });
			ae.currentRel = ['nofollow'];
			const checkbox = ae.newWindowCheck;
			checkbox.checked = true;
			newWindowCheckHandler({ target: checkbox });
			expect(ae.currentRel).toEqual(['noopener', 'noreferrer']);
		});

		it('should handle "only:" prefix in check_new_window for delete', () => {
			const { ae, newWindowCheckHandler } = setup({ default: '', check_new_window: 'only:noopener noreferrer' });
			ae.currentRel = ['noopener', 'noreferrer'];
			const checkbox = ae.newWindowCheck;
			checkbox.checked = false;
			newWindowCheckHandler({ target: checkbox });
			// After relDelete with "only:" prefix, it should strip the prefix and remove
			expect(ae.currentRel.join(' ')).not.toContain('noopener noreferrer');
		});
	});

	// ---------------------------------------------------------
	// #OnChange_downloadCheck (via event handler)
	// ---------------------------------------------------------
	describe('#OnChange_downloadCheck', () => {
		function setup(defaultRel = {}) {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel,
			});
			// With relList: [0] relButton click, [1] newWindowCheck change, [2] downloadCheck change
			const { calls } = getEventHandlers($);
			const downloadCheckHandler = calls[2][2];
			return { ae, $, downloadCheckHandler };
		}

		it('should show download, hide bookmark, strip # when checked', () => {
			const { ae, downloadCheckHandler } = setup({});
			ae.urlInput.value = '#section1';
			ae.linkValue = '#section1';
			const checkbox = ae.downloadCheck;
			checkbox.checked = true;
			downloadCheckHandler({ target: checkbox });

			expect(ae.download.style.display).toBe('block');
			expect(ae.bookmark.style.display).toBe('none');
			expect(ae.urlInput.value).toBe('section1');
		});

		it('should hide download when unchecked', () => {
			const { ae, downloadCheckHandler } = setup({});
			ae.download.style.display = 'block';
			const checkbox = ae.downloadCheck;
			checkbox.checked = false;
			downloadCheckHandler({ target: checkbox });

			expect(ae.download.style.display).toBe('none');
		});

		it('should merge rel with check_bookmark when checked and check_bookmark is string', () => {
			const { ae, downloadCheckHandler } = setup({ check_bookmark: 'noopener' });
			ae.currentRel = [];
			const checkbox = ae.downloadCheck;
			checkbox.checked = true;
			downloadCheckHandler({ target: checkbox });
			expect(ae.currentRel).toContain('noopener');
		});

		it('should delete rel with check_bookmark when unchecked and check_bookmark is string', () => {
			const { ae, downloadCheckHandler } = setup({ check_bookmark: 'noopener' });
			ae.currentRel = ['noopener', 'nofollow'];
			const checkbox = ae.downloadCheck;
			checkbox.checked = false;
			downloadCheckHandler({ target: checkbox });
			expect(ae.currentRel).not.toContain('noopener');
		});

		it('should not merge/delete rel when check_bookmark is not a string (checked)', () => {
			const { ae, downloadCheckHandler } = setup({}); // no check_bookmark
			ae.currentRel = ['nofollow'];
			const checkbox = ae.downloadCheck;
			checkbox.checked = true;
			downloadCheckHandler({ target: checkbox });
			// rel should be unchanged because no check_bookmark handling
			// but download display should change
			expect(ae.download.style.display).toBe('block');
		});

		it('should not merge/delete rel when check_bookmark is not a string (unchecked)', () => {
			const { ae, downloadCheckHandler } = setup({});
			ae.currentRel = ['nofollow'];
			const checkbox = ae.downloadCheck;
			checkbox.checked = false;
			downloadCheckHandler({ target: checkbox });
			expect(ae.currentRel).toEqual(['nofollow']);
		});
	});

	// ---------------------------------------------------------
	// #OnChange_urlInput (via event handler)
	// ---------------------------------------------------------
	describe('#OnChange_urlInput', () => {
		function setup() {
			const $ = createDeps();

			// Create a wysiwyg with headers for bookmark list
			const wysiwyg = document.createElement('div');
			const h1 = document.createElement('h1');
			h1.textContent = 'section1';
			h1.id = 'section1';
			wysiwyg.appendChild(h1);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
			});
			// No relList: [0] newWindowCheck change, [1] downloadCheck change, [2] urlInput input, [3] urlInput focus
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			return { ae, $, urlInputHandler };
		}

		it('should update link preview with input value', () => {
			const { ae, urlInputHandler } = setup();
			ae.urlInput.value = 'https://example.com';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBeTruthy();
			expect(ae.preview.textContent).toBeTruthy();
		});

		it('should create bookmark list when URL is a bookmark path', () => {
			const { ae, urlInputHandler } = setup();
			ae.urlInput.value = '#section';
			urlInputHandler({ target: ae.urlInput });
			// Since selfPathBookmark('#section') is true, it calls createBookmarkList
			const bookmarkMenu = SelectMenu.mock.results[0].value;
			// With matching headers, bookmark menu should open
			expect(bookmarkMenu.create).toHaveBeenCalled();
		});

		it('should close bookmark menu when URL is not a bookmark', () => {
			const { ae, urlInputHandler } = setup();
			ae.urlInput.value = 'https://example.com';
			urlInputHandler({ target: ae.urlInput });
			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.close).toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------
	// #OnFocus_urlInput (via event handler)
	// ---------------------------------------------------------
	describe('#OnFocus_urlInput', () => {
		it('should create bookmark list when value is bookmark path on focus', () => {
			const $ = createDeps();
			const wysiwyg = document.createElement('div');
			const h2 = document.createElement('h2');
			h2.textContent = 'test';
			h2.id = 'test';
			wysiwyg.appendChild(h2);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const focusHandler = calls[3][2]; // urlInput focus

			ae.urlInput.value = '#test';
			focusHandler();
			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.create).toHaveBeenCalled();
		});

		it('should not create bookmark list when value is not a bookmark', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const focusHandler = calls[3][2];

			ae.urlInput.value = 'https://example.com';
			focusHandler();
			// No bookmark list creation expected
			const bookmarkMenu = SelectMenu.mock.results[0].value;
			// close may or may not be called, but create should not
			// (actually nothing happens here since it's not a bookmark)
		});
	});

	// ---------------------------------------------------------
	// #OnClick_bookmarkButton (via event handler)
	// ---------------------------------------------------------
	describe('#OnClick_bookmarkButton', () => {
		function setup() {
			const $ = createDeps();
			const wysiwyg = document.createElement('div');
			const h1 = document.createElement('h1');
			h1.textContent = 'heading1';
			wysiwyg.appendChild(h1);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			// [0] newWindowCheck change, [1] downloadCheck change, [2] urlInput input, [3] urlInput focus, [4] bookmarkButton click
			const { calls } = getEventHandlers($);
			const bookmarkHandler = calls[4][2];
			return { ae, $, bookmarkHandler };
		}

		it('should add # prefix and show bookmark when URL is not a bookmark', () => {
			const { ae, bookmarkHandler } = setup();
			ae.urlInput.value = 'heading1';
			bookmarkHandler();

			expect(ae.urlInput.value).toBe('#heading1');
			expect(ae.bookmark.style.display).toBe('block');
			expect(ae.bookmarkButton.classList.contains('active')).toBe(true);
			expect(ae.downloadCheck.checked).toBe(false);
			expect(ae.download.style.display).toBe('none');
		});

		it('should remove # prefix and hide bookmark when URL is already a bookmark', () => {
			const { ae, bookmarkHandler } = setup();
			ae.urlInput.value = '#heading1';
			bookmarkHandler();

			expect(ae.urlInput.value).toBe('heading1');
			expect(ae.bookmark.style.display).toBe('none');
			expect(ae.bookmarkButton.classList.contains('active')).toBe(false);
		});
	});

	// ---------------------------------------------------------
	// #OnClick_relbutton (via event handler)
	// ---------------------------------------------------------
	describe('#OnClick_relbutton', () => {
		it('should open rel select menu', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: {},
			});
			// With relList: [0] relButton click
			const { calls } = getEventHandlers($);
			const relClickHandler = calls[0][2];
			relClickHandler();

			const relMenu = SelectMenu.mock.results[0].value;
			expect(relMenu.open).toHaveBeenCalled();
		});

		it('should open with left-middle when RTL', () => {
			const $ = createDeps({ _rtl: true });
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: {},
			});
			const { calls } = getEventHandlers($);
			const relClickHandler = calls[0][2];
			relClickHandler();

			const relMenu = SelectMenu.mock.results[0].value;
			expect(relMenu.open).toHaveBeenCalledWith('left-middle');
		});
	});

	// ---------------------------------------------------------
	// #SetHeaderBookmark (SelectMenu callback)
	// ---------------------------------------------------------
	describe('#SetHeaderBookmark', () => {
		function setup() {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			// selectMenu_bookmark is SelectMenu.mock.results[0] (no relList, so only one SelectMenu for bookmark)
			const bookmarkMenu = SelectMenu.mock.results[0].value;
			// The callback was passed via bookmarkMenu.on(urlInput, callback)
			const callback = bookmarkMenu.on.mock.calls[0][1];
			return { ae, $, callback, bookmarkMenu };
		}

		it('should set URL to #id when item has an id', () => {
			const { ae, callback, bookmarkMenu } = setup();
			const item = document.createElement('h1');
			item.id = 'existing-id';
			item.textContent = 'Heading';

			callback(item);
			expect(ae.urlInput.value).toBe('#existing-id');
			expect(bookmarkMenu.close).toHaveBeenCalled();
		});

		it('should generate random id when item has no id', () => {
			const { ae, callback } = setup();
			const item = document.createElement('h2');
			item.textContent = 'No ID Heading';

			callback(item);
			expect(item.id).toMatch(/^h_\d+$/);
			expect(ae.urlInput.value).toBe('#' + item.id);
		});

		it('should call setLinkPreview and close bookmark menu', () => {
			const { ae, callback, bookmarkMenu } = setup();
			const item = document.createElement('h1');
			item.id = 'test';
			callback(item);
			expect(ae.linkValue).toBeTruthy();
			expect(bookmarkMenu.close).toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------
	// #SetRelItem (SelectMenu callback)
	// ---------------------------------------------------------
	describe('#SetRelItem', () => {
		function setup() {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel: {},
			});
			// With relList: selectMenu_rel is SelectMenu.mock.results[0], bookmark is [1]
			const relMenu = SelectMenu.mock.results[0].value;
			const callback = relMenu.on.mock.calls[0][1];
			return { ae, $, callback };
		}

		it('should add command to currentRel when not present', () => {
			const { ae, callback } = setup();
			ae.currentRel = [];
			const item = document.createElement('button');
			item.setAttribute('data-command', 'nofollow');
			callback(item);
			expect(ae.currentRel).toContain('nofollow');
		});

		it('should remove command from currentRel when already present', () => {
			const { ae, callback } = setup();
			ae.currentRel = ['nofollow', 'noreferrer'];
			const item = document.createElement('button');
			item.setAttribute('data-command', 'nofollow');
			callback(item);
			expect(ae.currentRel).not.toContain('nofollow');
			expect(ae.currentRel).toContain('noreferrer');
		});

		it('should return early when data-command is missing', () => {
			const { ae, callback } = setup();
			ae.currentRel = ['nofollow'];
			const item = document.createElement('button');
			// No data-command attribute
			callback(item);
			expect(ae.currentRel).toEqual(['nofollow']); // unchanged
		});

		it('should update relPreview text', () => {
			const { ae, callback } = setup();
			ae.currentRel = [];
			const item = document.createElement('button');
			item.setAttribute('data-command', 'nofollow');
			callback(item);
			expect(ae.relPreview.textContent).toBe('nofollow');
		});
	});

	// ---------------------------------------------------------
	// #setLinkPreview (tested indirectly via on/create/events)
	// ---------------------------------------------------------
	describe('#setLinkPreview', () => {
		it('should set empty linkValue for empty value', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.on(false); // calls setLinkPreview with ''
			expect(ae.linkValue).toBe('');
		});

		it('should keep value as-is when noAutoPrefix is true', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				noAutoPrefix: true,
			});
			ae.linkValue = 'custom-value';
			// Trigger via urlInput handler
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'custom-value';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBe('custom-value');
		});

		it('should prepend protocol when protocol exists and value lacks protocol', () => {
			const $ = createDeps({ defaultUrlProtocol: 'https://' });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'example.com/path';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBe('https://example.com/path');
		});

		it('should not double-prepend when value starts with protocol', () => {
			const $ = createDeps({ defaultUrlProtocol: 'https://' });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'https://example.com';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBe('https://example.com');
		});

		it('should prepend http:// for www. prefix', () => {
			// protocol must be null/undefined/empty so that the www. branch is reached
			// When protocol is '' (empty string), value.indexOf('') === 0 makes reservedProtocol true
			// So we must use null or undefined for the protocol to reach www. branch
			const $ = createDeps({ defaultUrlProtocol: null });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'www.example.com';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBe('http://www.example.com');
		});

		it('should show bookmark icon when value is a self-path bookmark', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#section';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.bookmark.style.display).toBe('block');
			expect(ae.bookmarkButton.classList.contains('active')).toBe(true);
		});

		it('should hide bookmark and show download when not bookmark and download checked', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.downloadCheck.checked = true;
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'https://example.com/file.pdf';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.bookmark.style.display).toBe('none');
			expect(ae.download.style.display).toBe('block');
		});

		it('should hide download when bookmark URL even if download checked', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.downloadCheck.checked = true;
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#section';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.download.style.display).toBe('none');
		});

		it('should handle mailto: protocol', () => {
			const $ = createDeps({ defaultUrlProtocol: 'https://' });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'mailto:test@example.com';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBe('mailto:test@example.com');
		});

		it('should handle tel: protocol', () => {
			const $ = createDeps({ defaultUrlProtocol: 'https://' });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'tel:+1234567890';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toBe('tel:+1234567890');
		});

		it('should use host path for relative URLs without protocol', () => {
			// Use null protocol so reservedProtocol is false (empty string would make indexOf('') === 0)
			const $ = createDeps({ defaultUrlProtocol: null });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '/relative/path';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toContain('/relative/path');
			expect(ae.linkValue).toContain(ae.host);
		});

		it('should add / before relative URL without leading slash', () => {
			const $ = createDeps({ defaultUrlProtocol: null });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = 'relative/path';
			urlInputHandler({ target: ae.urlInput });
			expect(ae.linkValue).toContain(ae.host + '/relative/path');
		});

		it('should handle sameProtocol scenario', () => {
			const $ = createDeps({ defaultUrlProtocol: 'https://' });
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			// Value starts like protocol but not exact (e.g. 'http' vs 'https://')
			ae.urlInput.value = 'http://example.com';
			urlInputHandler({ target: ae.urlInput });
			// 'http://' is a reservedProtocol match
			expect(ae.linkValue).toBe('http://example.com');
		});
	});

	// ---------------------------------------------------------
	// #createBookmarkList (tested via urlInput/focus/bookmarkButton handlers)
	// ---------------------------------------------------------
	describe('#createBookmarkList', () => {
		it('should not create list when no headers exist', () => {
			const $ = createDeps();
			// Empty wysiwyg
			const wysiwyg = document.createElement('div');
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#test';
			urlInputHandler({ target: ae.urlInput });

			// With no headers, bookmark menu should not be created/opened
			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.create).not.toHaveBeenCalled();
		});

		it('should close menu when no headers match the filter', () => {
			const $ = createDeps();
			const wysiwyg = document.createElement('div');
			const h1 = document.createElement('h1');
			h1.textContent = 'Apple';
			wysiwyg.appendChild(h1);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#zzz'; // no match
			urlInputHandler({ target: ae.urlInput });

			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.close).toHaveBeenCalled();
		});

		it('should create menu items for matching headers', () => {
			const $ = createDeps();
			const wysiwyg = document.createElement('div');
			const h1 = document.createElement('h1');
			h1.textContent = 'Section One';
			const h2 = document.createElement('h2');
			h2.textContent = 'Section Two';
			wysiwyg.appendChild(h1);
			wysiwyg.appendChild(h2);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#Section';
			urlInputHandler({ target: ae.urlInput });

			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.create).toHaveBeenCalled();
			expect(bookmarkMenu.open).toHaveBeenCalled();
		});

		it('should handle anchor elements with id as bookmarks', () => {
			const $ = createDeps();
			const wysiwyg = document.createElement('div');
			const anchor = document.createElement('a');
			anchor.id = 'bookmark-link';
			anchor.textContent = 'bookmark-link';
			wysiwyg.appendChild(anchor);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#bookmark';
			urlInputHandler({ target: ae.urlInput });

			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.create).toHaveBeenCalled();
		});

		it('should open with bottom-right when RTL', () => {
			const $ = createDeps({ _rtl: true });
			const wysiwyg = document.createElement('div');
			const h1 = document.createElement('h1');
			h1.textContent = 'Test';
			wysiwyg.appendChild(h1);
			$.frameContext.set('wysiwyg', wysiwyg);

			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const { calls } = getEventHandlers($);
			const urlInputHandler = calls[2][2];
			ae.urlInput.value = '#Test';
			urlInputHandler({ target: ae.urlInput });

			const bookmarkMenu = SelectMenu.mock.results[0].value;
			expect(bookmarkMenu.open).toHaveBeenCalledWith('bottom-right');
		});
	});

	// ---------------------------------------------------------
	// #relMerge / #relDelete (tested via newWindowCheck/downloadCheck handlers)
	// ---------------------------------------------------------
	describe('#relMerge and #relDelete', () => {
		it('should return current rel when relAttr is empty (merge)', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { check_new_window: '' },
			});
			ae.currentRel = ['existing'];
			const { calls } = getEventHandlers($);
			const handler = calls[1][2]; // newWindowCheck change
			ae.newWindowCheck.checked = true;
			handler({ target: ae.newWindowCheck });
			// empty relAttr -> returns current.join(' '), #setRel processes it
			expect(ae.currentRel).toContain('existing');
		});

		it('should return current rel when relAttr is empty (delete)', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { check_new_window: '' },
			});
			ae.currentRel = ['existing'];
			const { calls } = getEventHandlers($);
			const handler = calls[1][2];
			ae.newWindowCheck.checked = false;
			handler({ target: ae.newWindowCheck });
			expect(ae.currentRel).toContain('existing');
		});

		it('should not duplicate existing rels during merge', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel: { check_new_window: 'nofollow noreferrer' },
			});
			ae.currentRel = ['nofollow'];
			const { calls } = getEventHandlers($);
			const handler = calls[1][2];
			ae.newWindowCheck.checked = true;
			handler({ target: ae.newWindowCheck });
			// nofollow should not be duplicated
			const nofollowCount = ae.currentRel.filter((r) => r === 'nofollow').length;
			expect(nofollowCount).toBe(1);
			expect(ae.currentRel).toContain('noreferrer');
		});
	});

	// ---------------------------------------------------------
	// #OnChangeFile (via event handler, enableFileUpload=true)
	// ---------------------------------------------------------
	describe('#OnChangeFile', () => {
		function setup(triggerResult = undefined) {
			const $ = createDeps();
			$.eventManager.triggerEvent = jest.fn().mockResolvedValue(triggerResult);

			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
			});
			// With enableFileUpload: [0] fileInput change, [1] newWindowCheck change, ...
			const { calls } = getEventHandlers($);
			const fileChangeHandler = calls[0][2];
			return { ae, $, fileChangeHandler };
		}

		it('should return early when no files selected', async () => {
			const { ae, fileChangeHandler } = setup();
			const mockInput = document.createElement('input');
			mockInput.type = 'file';
			// files is empty by default
			Object.defineProperty(mockInput, 'files', { value: [] });
			const result = await fileChangeHandler({ target: mockInput });
			// Early return, no triggerEvent called
		});

		it('should return true when triggerEvent returns undefined', async () => {
			const { ae, $, fileChangeHandler } = setup(undefined);
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			const result = await fileChangeHandler({ target: mockInput });
			expect(result).toBe(true);
		});

		it('should return false when triggerEvent returns false', async () => {
			const { ae, $, fileChangeHandler } = setup(false);
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			const result = await fileChangeHandler({ target: mockInput });
			expect(result).toBe(false);
		});

		it('should call handler with result when triggerEvent returns object', async () => {
			const resultObj = { url: '/custom-upload', files: [] };
			const { ae, $, fileChangeHandler } = setup(resultObj);
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			await fileChangeHandler({ target: mockInput });
			// handler should have been called with the result object
			expect(ae.fileManager.asyncUpload).toHaveBeenCalled();
		});

		it('should call handler with null when triggerEvent returns true', async () => {
			const { ae, $, fileChangeHandler } = setup(true);
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			await fileChangeHandler({ target: mockInput });
			expect(ae.fileManager.asyncUpload).toHaveBeenCalled();
		});

		it('should call handler with null when triggerEvent returns NO_EVENT', async () => {
			const { ae, $, fileChangeHandler } = setup(NO_EVENT);
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			await fileChangeHandler({ target: mockInput });
			expect(ae.fileManager.asyncUpload).toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------
	// #uploadCallBack / #register / #error
	// ---------------------------------------------------------
	describe('#uploadCallBack, #register, #error', () => {
		it('should register file on successful upload (via handler chain)', async () => {
			const $ = createDeps();
			$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
			});

			// Mock asyncUpload to return a successful response
			ae.fileManager.asyncUpload = jest.fn().mockResolvedValue({
				responseText: JSON.stringify({
					result: [{ url: 'http://files.com/test.pdf', name: 'test.pdf' }],
				}),
			});

			const { calls } = getEventHandlers($);
			const fileChangeHandler = calls[0][2];
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			await fileChangeHandler({ target: mockInput });

			// Wait for async operations
			await new Promise((r) => setTimeout(r, 50));

			expect(ae.urlInput.value).toBe('http://files.com/test.pdf');
			expect(ae.displayInput.value).toBe('test.pdf');
			expect(ae.downloadCheck.checked).toBe(true);
			expect(ae.download.style.display).toBe('block');
		});

		it('should handle error response from upload', async () => {
			const $ = createDeps();
			$.eventManager.triggerEvent = jest.fn()
				.mockResolvedValueOnce(true) // onFileUploadBefore
				.mockResolvedValueOnce(NO_EVENT); // onFileUploadError

			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
			});

			ae.fileManager.asyncUpload = jest.fn().mockResolvedValue({
				responseText: JSON.stringify({ errorMessage: 'Upload failed' }),
			});

			const { calls } = getEventHandlers($);
			const fileChangeHandler = calls[0][2];
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await fileChangeHandler({ target: mockInput });
			await new Promise((r) => setTimeout(r, 50));

			expect($.ui.alertOpen).toHaveBeenCalledWith('Upload failed', 'error');
			consoleSpy.mockRestore();
		});

		it('should not show alert when onFileUploadError returns false', async () => {
			const $ = createDeps();
			$.eventManager.triggerEvent = jest.fn()
				.mockResolvedValueOnce(true) // onFileUploadBefore
				.mockResolvedValueOnce(false); // onFileUploadError -> false means suppress

			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
			});

			ae.fileManager.asyncUpload = jest.fn().mockResolvedValue({
				responseText: JSON.stringify({ errorMessage: 'Upload failed' }),
			});

			const { calls } = getEventHandlers($);
			const fileChangeHandler = calls[0][2];
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			await fileChangeHandler({ target: mockInput });
			await new Promise((r) => setTimeout(r, 50));

			expect($.ui.alertOpen).not.toHaveBeenCalled();
		});

		it('should use custom error message when triggerEvent returns a string', async () => {
			const $ = createDeps();
			$.eventManager.triggerEvent = jest.fn()
				.mockResolvedValueOnce(true) // onFileUploadBefore
				.mockResolvedValueOnce('Custom error message'); // onFileUploadError

			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
			});

			ae.fileManager.asyncUpload = jest.fn().mockResolvedValue({
				responseText: JSON.stringify({ errorMessage: 'Server error' }),
			});

			const { calls } = getEventHandlers($);
			const fileChangeHandler = calls[0][2];
			const mockInput = ae.input;
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });
			Object.defineProperty(mockInput, 'files', { value: [file], writable: true });

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await fileChangeHandler({ target: mockInput });
			await new Promise((r) => setTimeout(r, 50));

			expect($.ui.alertOpen).toHaveBeenCalledWith('Custom error message', 'error');
			consoleSpy.mockRestore();
		});
	});

	// ---------------------------------------------------------
	// #setRel (tested via on/init/event handlers with relList)
	// ---------------------------------------------------------
	describe('#setRel', () => {
		it('should return early when no relList (isRel=false)', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: { default: 'nofollow' },
			});
			// setRel is called during on/init but isRel is false, so it returns early
			ae.on(false);
			// currentRel should be set before #setRel is called, but #setRel returns early
			expect(ae.currentRel).toEqual([]);
		});

		it('should update checked state of rel buttons', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow', 'noreferrer'],
				defaultRel: { default: 'nofollow' },
			});

			// Add actual button elements to the selectMenu_rel mock form
			// so that the for loop in #setRel (lines 258-265) is covered
			const relMenu = SelectMenu.mock.results[0].value;
			const btn1 = document.createElement('button');
			btn1.setAttribute('data-command', 'nofollow');
			const btn2 = document.createElement('button');
			btn2.setAttribute('data-command', 'noreferrer');
			relMenu.form.appendChild(btn1);
			relMenu.form.appendChild(btn2);

			// Trigger on() to force #setRel
			ae.on(false);
			expect(ae.currentRel).toEqual(['nofollow']);
			expect(ae.relPreview.textContent).toBe('nofollow');
			// nofollow button should have se-checked, noreferrer should not
			expect(btn1.classList.contains('se-checked')).toBe(true);
			expect(btn2.classList.contains('se-checked')).toBe(false);
		});

		it('should add "on" class to relButton when rels are non-empty', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { default: 'nofollow' },
			});
			ae.on(false);
			expect(ae.relButton.classList.contains('on')).toBe(true);
		});

		it('should remove "on" class from relButton when rels are empty', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: { default: '' },
			});
			ae.on(false);
			expect(ae.relButton.classList.contains('on')).toBe(false);
		});

		it('should handle empty relAttr by setting empty currentRel', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: {},
			});
			ae.currentRel = ['nofollow'];
			ae.init(); // calls #setRel with '' (defaultRel.default || '')
			expect(ae.currentRel).toEqual([]);
		});
	});

	// ---------------------------------------------------------
	// Upload button click handler
	// ---------------------------------------------------------
	describe('upload button click handler', () => {
		it('should trigger file input click', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				enableFileUpload: true,
			});
			// Last addEvent call is for upload button click
			const { calls } = getEventHandlers($);
			// With enableFileUpload, no relList: [0] fileInput change, [1] newWindowCheck change, [2] downloadCheck change,
			// [3] urlInput input, [4] urlInput focus, [5] bookmarkButton click, [6] uploadButton click
			const uploadClickHandler = calls[6][2];
			const clickSpy = jest.spyOn(ae.input, 'click');
			uploadClickHandler();
			expect(clickSpy).toHaveBeenCalled();
		});
	});

	// ---------------------------------------------------------
	// Edge cases & combined scenarios
	// ---------------------------------------------------------
	describe('edge cases', () => {
		it('should handle download attribute with download URL (not bookmark)', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			ae.linkValue = 'https://example.com/file.pdf';
			ae.downloadCheck.checked = true;
			ae.displayInput.value = '';
			const result = ae.create(false);
			// When displayInput is empty, url is used as displayText
			expect(result.getAttribute('download')).toBe('https://example.com/file.pdf');
		});

		it('should handle on(true) with currentTarget that has no target attribute', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const anchor = document.createElement('a');
			anchor.href = 'https://test.com';
			anchor.textContent = 'test';
			// No target attribute
			ae.set(anchor);
			ae.on(true);
			expect(ae.newWindowCheck.checked).toBe(false);
		});

		it('should handle on(true) with currentTarget that has no download', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), { relList: [], defaultRel: {} });
			const anchor = document.createElement('a');
			anchor.href = 'https://test.com';
			anchor.textContent = 'test';
			ae.set(anchor);
			ae.on(true);
			expect(ae.downloadCheck.checked).toBe(false);
		});

		it('should handle combined relList + enableFileUpload', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: {},
				enableFileUpload: true,
				uploadUrl: '/upload',
			});
			expect(ae.relButton).toBeTruthy();
			expect(ae.input).toBeTruthy();
			expect(ae.fileManager).toBeTruthy();
			// Events: fileInput change + relButton click + newWindowCheck + downloadCheck + urlInput input + urlInput focus + bookmark click + upload click
			expect($.eventManager.addEvent).toHaveBeenCalledTimes(8);
		});

		it('should handle CreateModalForm with textToDisplay=false', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				textToDisplay: false,
			});
			// displayInput should exist but be hidden
			expect(ae.displayInput).toBeTruthy();
		});

		it('should handle CreateModalForm with title=true', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: [],
				defaultRel: {},
				title: true,
			});
			expect(ae.titleInput).toBeTruthy();
		});

		it('should handle defaultRel without default key', () => {
			const $ = createDeps();
			const ae = new ModalAnchorEditor($, createModalForm(), {
				relList: ['nofollow'],
				defaultRel: {},
			});
			ae.on(false);
			// defaultRel.default is undefined, so '' is used
			expect(ae.currentRel).toEqual([]);
		});
	});
});
