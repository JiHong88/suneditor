/**
 * @fileoverview Unit tests for modules/Browser.js
 */

import Browser from '../../../src/modules/Browser.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.lang = editor.lang;
        this.icons = editor.icons;
        this.ui = editor.ui;
        this.carrierWrapper = {
            appendChild: jest.fn()
        };
        this.eventManager = {
            addEvent: jest.fn()
        };
    });
});

jest.mock('../../../src/helper', () => ({
    dom: {
        check: { isElement: jest.fn().mockReturnValue(true) },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            createElement: jest.fn().mockReturnValue({
                appendChild: jest.fn(),
                querySelector: jest.fn().mockImplementation(() => ({
                    children: [{}, {}],
                    querySelector: jest.fn().mockReturnValue({
                        children: [{}, {}]
                    }),
                    style: {
                        display: ''
                    }
                })),
                className: '',
                style: {}
            })
        }
    },
    keyCodeMap: { isEsc: jest.fn().mockReturnValue(false) },
    env: {
        _w: {},
        getXMLHttpRequest: () => ({
            open: jest.fn(),
            setRequestHeader: jest.fn(),
            send: jest.fn(),
            abort: jest.fn()
        })
    }
}));

describe('Modules - Browser', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            ui: { showBrowser: jest.fn(), hideBrowser: jest.fn() },
            triggerEvent: jest.fn(),
            lang: {
                close: 'Close',
                search: 'Search',
                submitButton: 'Submit'
            },
            icons: {
                cancel: '✕',
                side_menu_hamburger: '☰',
                search: '🔍',
                menu_arrow_right: '▶',
                menu_arrow_down: '▼',
                side_menu_folder_item: '📁',
                side_menu_folder: '📂'
            }
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testBrowser',
                name: 'TestBrowser'
            }
        };
    });

    describe('Constructor', () => {
        it('should create Browser instance', () => {
            const browser = new Browser(mockInst, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });

            expect(browser).toBeInstanceOf(Browser);
            expect(browser.inst).toBe(mockInst);
            expect(browser.kind).toBe('testBrowser');
        });

        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackBrowser' }
            };

            const browser = new Browser(instWithoutKey, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            expect(browser.kind).toBe('FallbackBrowser');
        });
    });

    describe('Basic functionality', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should have access to editor components', () => {
            expect(browser.editor).toBe(mockEditor);
            expect(browser.ui).toBe(mockEditor.ui);
        });

        it('should handle browser operations', () => {
            expect(() => {
                browser.showBrowserLoading();
            }).not.toThrow();
        });
    });
});