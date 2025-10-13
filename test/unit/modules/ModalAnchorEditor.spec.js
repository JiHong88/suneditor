/**
 * @fileoverview Unit tests for modules/ModalAnchorEditor.js
 */

import ModalAnchorEditor from '../../../src/modules/ModalAnchorEditor.js';

// Mock SelectMenu
jest.mock('../../../src/modules/SelectMenu.js', () => {
    return jest.fn().mockImplementation(function() {
        this.on = jest.fn();
        this.create = jest.fn();
        this.open = jest.fn();
        this.close = jest.fn();
        this.form = {
            querySelectorAll: jest.fn().mockReturnValue([])
        };
    });
});

// Mock FileManager
jest.mock('../../../src/modules/FileManager.js', () => {
    return jest.fn().mockImplementation(function() {
        this.asyncUpload = jest.fn().mockResolvedValue({ responseText: JSON.stringify({ result: [{ url: 'http://test.com/file.pdf', name: 'file.pdf' }] }) });
    });
});

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor ? editor.frameContext : new Map();
        this.triggerEvent = (editor && editor.triggerEvent) || jest.fn().mockResolvedValue(undefined);
        this.lang = (editor && editor.lang) || {};
        this.icons = (editor && editor.icons) || {};
        this.eventManager = {
            addEvent: jest.fn(),
            removeEvent: jest.fn()
        };
        this.events = {
            onFileLoad: jest.fn(),
            onFileAction: jest.fn()
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
            isAnchor: jest.fn().mockReturnValue(false)
        },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            createTooltipInner: jest.fn().mockReturnValue('<span>tooltip</span>'),
            createElement: jest.fn().mockImplementation((tag, attrs, innerHTML) => {
                const el = global.document.createElement(tag || 'div');
                if (attrs) {
                    Object.keys(attrs).forEach(attr => {
                        el.setAttribute(attr, attrs[attr]);
                    });
                }
                if (innerHTML) {
                    el.innerHTML = innerHTML;
                }
                return el;
            })
        },
        query: {
            getListChildren: jest.fn().mockReturnValue([]),
            getEventTarget: jest.fn((e) => e.target || e.currentTarget)
        }
    },
    env: {
        _w: {
            location: {
                origin: 'http://localhost',
                pathname: '/',
                href: 'http://localhost/'
            }
        },
        NO_EVENT: '__NO_EVENT__'
    },
    keyCodeMap: { isEsc: jest.fn().mockReturnValue(false) },
    numbers: {
        get: jest.fn((val, def) => val || def)
    },
    unicode: {
        escapeStringRegexp: jest.fn((str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    }
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
                alertOpen: jest.fn()
            },
            selection: {
                getRangeElement: jest.fn(),
                get: jest.fn().mockReturnValue({
                    toString: () => 'selected text'
                })
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
                link_modal_relAttribute: 'REL'
            },
            options: {
                get: jest.fn().mockReturnValue('https://')
            },
            icons: {
                bookmark: '🔖',
                file_upload: '📁',
                download: '⬇️',
                link_rel: '🔗',
                checked: '✓',
                bookmark_anchor: '⚓'
            }
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testAnchor',
                name: 'TestAnchor'
            }
        };
    });

    describe('Constructor', () => {
        it('should create ModalAnchorEditor instance', () => {
            const mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
            const modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});

            expect(modalAnchor).toBeInstanceOf(ModalAnchorEditor);
            expect(modalAnchor.inst).toBe(mockInst);
            expect(modalAnchor.kink).toBe('testAnchor');
        });

        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackAnchor' }
            };
            const mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';

            const modalAnchor = new ModalAnchorEditor(instWithoutKey, mockModalForm, {});
            expect(modalAnchor.kink).toBe('FallbackAnchor');
        });
    });

    describe('Basic functionality', () => {
        let modalAnchor;
        let mockModalForm;

        beforeEach(() => {
            mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});
        });

        it('should have access to editor components', () => {
            expect(modalAnchor.editor).toBe(mockEditor);
            expect(modalAnchor.ui).toBe(mockEditor.ui);
            expect(modalAnchor.selection).toBe(mockEditor.selection);
        });

        it('should initialize with default values', () => {
            expect(modalAnchor.kink).toBe('testAnchor');
            expect(modalAnchor.inst).toBe(mockInst);
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
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});
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
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});
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
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, { openNewWindow: true });
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
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});

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
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});
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
            const modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, { openNewWindow: true });

            expect(modalAnchor.openNewWindow).toBe(true);
        });

        it('should handle relList parameter', () => {
            const mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
            const modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {
                relList: ['nofollow', 'noreferrer']
            });

            expect(modalAnchor.relList).toEqual(['nofollow', 'noreferrer']);
        });

        it('should handle defaultRel parameter', () => {
            const mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
            const modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {
                defaultRel: { default: 'nofollow' }
            });

            expect(modalAnchor.defaultRel).toEqual({ default: 'nofollow' });
        });

        it('should handle noAutoPrefix parameter', () => {
            const mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
            const modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, { noAutoPrefix: true });

            expect(modalAnchor.noAutoPrefix).toBe(true);
        });
    });

    describe('Download functionality', () => {
        let modalAnchor;

        beforeEach(() => {
            const mockModalForm = document.createElement('form');
            mockModalForm.innerHTML = '<div class="se-anchor-editor"></div>';
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});
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
            modalAnchor = new ModalAnchorEditor(mockInst, mockModalForm, {});
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
});