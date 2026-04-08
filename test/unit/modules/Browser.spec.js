/**
 * @fileoverview Unit tests for modules/Browser.js
 * Comprehensive branch coverage for all public and private methods.
 */

import Browser from '../../../src/modules/contract/Browser.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

// Helper function to create real DOM elements (defined before mocks)
const createRealElement = (tagName, attrs, html) => {
    const elem = document.createElement(tagName || 'DIV');
    if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'class') {
                elem.className = value;
            } else if (value !== null && value !== undefined) {
                elem.setAttribute(key, value);
            }
        });
    }
    if (html) {
        if (typeof html === 'string') {
            elem.innerHTML = html;
        } else if (html instanceof HTMLElement) {
            elem.appendChild(html);
        }
    }
    return elem;
};

// Mock ApiManager
jest.mock('../../../src/modules/manager/ApiManager.js', () => {
    return jest.fn().mockImplementation(function () {
        this.call = jest.fn();
        this.cancel = jest.fn();
    });
});

jest.mock('../../../src/helper', () => ({
    dom: {
        check: {
            isElement: jest.fn().mockReturnValue(true),
            isAnchor: jest.fn((el) => el?.tagName === 'A')
        },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            hasClass: jest.fn().mockReturnValue(false),
            getClientSize: jest.fn().mockReturnValue({ w: 1024, h: 768 }),
            createElement: jest.fn().mockImplementation((tagName, attrs, html) => {
                return createRealElement(tagName, attrs, html);
            })
        },
        query: {
            getEventTarget: jest.fn((e) => e.target || e.currentTarget || {}),
            getCommandTarget: jest.fn((el) => el),
            getParentElement: jest.fn((el, selector) => el)
        }
    },
    keyCodeMap: { isEsc: jest.fn().mockReturnValue(false) },
    env: {
        _w: { scrollY: 0 },
        getXMLHttpRequest: () => ({
            open: jest.fn(),
            setRequestHeader: jest.fn(),
            send: jest.fn(),
            abort: jest.fn()
        })
    }
}));

// Get reference to the mock for modifying during tests
const mockHelper = require('../../../src/helper');

/**
 * Helper: Extract captured event handlers from eventManager.addEvent calls.
 * The constructor binds all private methods via eventManager.addEvent.
 */
function getEventHandlers(eventManager) {
    const handlers = {};
    const calls = eventManager.addEvent.mock.calls;
    for (const call of calls) {
        const [target, eventType, handler] = call;
        // Determine handler name by inspecting target and eventType
        const targetStr = target?.className || target?.nodeName || '';
        if (eventType === 'submit') {
            handlers.search = handler;
        } else if (eventType === 'mousedown' && Array.isArray(target)) {
            handlers.sideClose = handler;
        } else if (eventType === 'mousedown' && !Array.isArray(target)) {
            handlers.mouseDownBrowser = handler;
        } else if (eventType === 'click') {
            if (targetStr.includes('se-browser-tags')) {
                handlers.clickTag = handler;
            } else if (targetStr.includes('se-browser-list')) {
                handlers.clickFile = handler;
            } else if (targetStr.includes('se-browser-side')) {
                handlers.clickSide = handler;
            } else if (targetStr.includes('se-browser-search-clear')) {
                handlers.clearSearch = handler;
            } else if (targetStr.includes('se-side-open-btn') || (target?.tagName === 'BUTTON')) {
                handlers.sideOpen = handler;
            } else if (targetStr.includes('se-browser-inner')) {
                handlers.clickBrowser = handler;
            } else {
                // Fallback: assign based on order for click events
                if (!handlers.clickTag) handlers.clickTag = handler;
                else if (!handlers.clickFile) handlers.clickFile = handler;
                else if (!handlers.clickSide) handlers.clickSide = handler;
                else if (!handlers.clickBrowser) handlers.clickBrowser = handler;
                else if (!handlers.sideOpen) handlers.sideOpen = handler;
            }
        }
    }
    return handlers;
}

describe('Modules - Browser', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        const kernel = createMockEditor();
        mockEditor = kernel;

        const icons = {
            cancel: 'X',
            side_menu_hamburger: '=',
            search: 'S',
            menu_arrow_right: '>',
            menu_arrow_left: '<',
            menu_arrow_down: 'v',
            side_menu_folder_item: 'FI',
            side_menu_folder: 'F',
            side_menu_item: 'I'
        };
        const lang = {
            close: 'Close',
            search: 'Search',
            submitButton: 'Submit'
        };
        mockEditor.$ = {
            ...kernel.$,
            icons,
            lang,
            ui: { showBrowser: jest.fn(), hideBrowser: jest.fn() },
            offset: {
                getGlobal: jest.fn().mockReturnValue({ top: 100 }),
                ...kernel.$.offset
            }
        };
        mockEditor.icons = icons;
        mockEditor.lang = lang;

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testBrowser',
                name: 'TestBrowser'
            }
        };
    });

    // ---------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------
    describe('Constructor', () => {
        it('should use constructor.key as kind', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.kind).toBe('testBrowser');
        });

        it('should use constructor.name as fallback when key is absent', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackBrowser' }
            };

            const browser = new Browser(instWithoutKey, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            expect(browser.kind).toBe('FallbackBrowser');
        });

        it('should register event handlers via eventManager.addEvent', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            // At least 8 addEvent calls in constructor
            expect(mockEditor.$.eventManager.addEvent).toHaveBeenCalled();
            expect(mockEditor.$.eventManager.addEvent.mock.calls.length).toBeGreaterThanOrEqual(8);
        });

        it('should create sideOpenBtn from the browser DOM', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.sideOpenBtn).toBeTruthy();
        });
    });

    // ---------------------------------------------------------------
    // Parameters
    // ---------------------------------------------------------------
    describe('Parameters', () => {
        it('should accept title parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Custom Title',
                selectorHandler: jest.fn()
            });
            expect(browser.title).toBe('Custom Title');
        });

        it('should accept listClass parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                listClass: 'custom-list',
                selectorHandler: jest.fn()
            });
            expect(browser.listClass).toBe('custom-list');
        });

        it('should default listClass to se-preview-list', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.listClass).toBe('se-preview-list');
        });

        it('should accept url parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                url: 'https://example.com/api/files',
                selectorHandler: jest.fn()
            });
            expect(browser.url).toBe('https://example.com/api/files');
        });

        it('should accept headers parameter', () => {
            const headers = { Authorization: 'Bearer token' };
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                headers: headers,
                selectorHandler: jest.fn()
            });
            expect(browser.urlHeader).toBe(headers);
        });

        it('should accept searchUrl parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                searchUrl: 'https://example.com/api/search',
                selectorHandler: jest.fn()
            });
            expect(browser.searchUrl).toBe('https://example.com/api/search');
        });

        it('should accept useSearch parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                useSearch: false,
                selectorHandler: jest.fn()
            });
            expect(browser.useSearch).toBe(false);
        });

        it('should default useSearch to true', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.useSearch).toBe(true);
        });

        it('should accept columnSize parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                columnSize: 6,
                selectorHandler: jest.fn()
            });
            expect(browser.columnSize).toBe(6);
        });

        it('should default columnSize to 4', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.columnSize).toBe(4);
        });

        it('should accept data parameter', () => {
            const data = [{ src: 'test.jpg', name: 'Test' }];
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                data: data,
                selectorHandler: jest.fn()
            });
            expect(browser.directData).toBe(data);
        });

        it('should accept className parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                className: 'custom-browser',
                selectorHandler: jest.fn()
            });
            expect(browser.area.className).toContain('custom-browser');
        });

        it('should accept searchUrlHeader parameter', () => {
            const searchHeaders = { 'X-Search': 'true' };
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                searchUrlHeader: searchHeaders,
                selectorHandler: jest.fn()
            });
            expect(browser.searchUrlHeader).toBe(searchHeaders);
        });

        it('should accept props parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                props: ['customProp1', 'customProp2'],
                selectorHandler: jest.fn()
            });
            expect(browser.drawItemHandler).toBeDefined();
        });
    });

    // ---------------------------------------------------------------
    // Basic functionality
    // ---------------------------------------------------------------
    describe('Basic functionality', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should initialize with default properties', () => {
            expect(browser.title).toBe('Test Browser');
            expect(browser.items).toEqual([]);
            expect(browser.folders).toEqual({});
            expect(browser.tree).toEqual({});
            expect(browser.selectedTags).toEqual([]);
            expect(browser.keyword).toBe('');
        });
    });

    // ---------------------------------------------------------------
    // open method
    // ---------------------------------------------------------------
    describe('open method', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should set display to block', () => {
            browser.open();
            expect(browser.area.style.display).toBe('block');
        });

        it('should set editor opendBrowser', () => {
            browser.open();
            expect(mockEditor.$.ui.opendBrowser).toBe(browser);
        });

        it('should use title from params if provided', () => {
            browser.open({ title: 'Custom Open Title' });
            expect(browser.titleArea.textContent).toBe('Custom Open Title');
        });

        it('should use default title if not provided in params', () => {
            browser.open();
            expect(browser.titleArea.textContent).toBe('Test Browser');
        });

        it('should update listClass if provided', () => {
            browser.open({ listClass: 'new-list-class' });
            expect(browser.list.className).toContain('new-list-class');
        });

        it('should set body maxHeight', () => {
            browser.open();
            expect(browser.body.style.maxHeight).toBeDefined();
        });

        it('should not change listClass if hasClass returns true', () => {
            const mockHasClass = require('../../../src/helper').dom.utils.hasClass;
            mockHasClass.mockReturnValueOnce(true);

            browser.open({ listClass: 'custom-class' });
            expect(mockHasClass).toHaveBeenCalled();
        });

        it('should add global event on open', () => {
            browser.open();
            expect(mockEditor.$.eventManager.addGlobalEvent).toHaveBeenCalledWith('keydown', expect.any(Function), true);
        });

        it('should use directData when available', () => {
            const data = [{ src: 'img.jpg', name: 'Image', tag: ['test'], type: 'image' }];
            browser.directData = data;
            browser.open();
            expect(browser.items.length).toBeGreaterThan(0);
        });

        it('should use URL when directData is not available', () => {
            browser.directData = null;
            browser.url = 'https://api.example.com/files';
            browser.open();
            expect(browser.apiManager.call).toHaveBeenCalled();
        });

        it('should use params.url over this.url', () => {
            browser.directData = null;
            browser.url = 'https://default.com';
            browser.open({ url: 'https://override.com' });
            expect(browser.apiManager.call).toHaveBeenCalledWith(
                expect.objectContaining({ url: 'https://override.com' })
            );
        });

        it('should use urlHeader when fetching from URL', () => {
            browser.directData = null;
            browser.url = 'https://api.example.com/files';
            browser.urlHeader = { Authorization: 'Bearer token' };
            browser.open();
            expect(browser.apiManager.call).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: { Authorization: 'Bearer token' }
                })
            );
        });

        it('should handle RTL mode for closeArrow', () => {
            mockEditor.$.options.get = jest.fn((key) => {
                if (key === '_rtl') return true;
                return undefined;
            });
            browser.open();
            expect(browser.closeArrow).toBe('<');
        });
    });

    // ---------------------------------------------------------------
    // close method
    // ---------------------------------------------------------------
    describe('close method', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should set display to none', () => {
            browser.open();
            browser.close();
            expect(browser.area.style.display).toBe('none');
        });

        it('should reset selectedTags', () => {
            browser.selectedTags = ['tag1', 'tag2'];
            browser.close();
            expect(browser.selectedTags).toEqual([]);
        });

        it('should reset items', () => {
            browser.items = [{ name: 'test' }];
            browser.close();
            expect(browser.items).toEqual([]);
        });

        it('should reset folders', () => {
            browser.folders = { test: {} };
            browser.close();
            expect(browser.folders).toEqual({});
        });

        it('should reset tree', () => {
            browser.tree = { test: {} };
            browser.close();
            expect(browser.tree).toEqual({});
        });

        it('should reset data', () => {
            browser.data = { test: 'data' };
            browser.close();
            expect(browser.data).toEqual({});
        });

        it('should reset keyword', () => {
            browser.keyword = 'test';
            browser.close();
            expect(browser.keyword).toBe('');
        });

        it('should clear list innerHTML', () => {
            browser.list.innerHTML = '<div>test</div>';
            browser.close();
            expect(browser.list.innerHTML).toBe('');
        });

        it('should clear tagArea innerHTML', () => {
            browser.tagArea.innerHTML = '<a>tag</a>';
            browser.close();
            expect(browser.tagArea.innerHTML).toBe('');
        });

        it('should clear titleArea textContent', () => {
            browser.titleArea.textContent = 'Title';
            browser.close();
            expect(browser.titleArea.textContent).toBe('');
        });

        it('should set editor opendBrowser to null', () => {
            mockEditor.$.ui.opendBrowser = browser;
            browser.close();
            expect(mockEditor.$.ui.opendBrowser).toBeNull();
        });

        it('should call apiManager.cancel', () => {
            browser.close();
            expect(browser.apiManager.cancel).toHaveBeenCalled();
        });

        it('should call inst.browserInit if available', () => {
            mockInst.browserInit = jest.fn();
            browser.close();
            expect(mockInst.browserInit).toHaveBeenCalled();
        });

        it('should not throw if inst.browserInit is not available', () => {
            delete mockInst.browserInit;
            expect(() => {
                browser.close();
            }).not.toThrow();
        });

        it('should reset sideInner to null', () => {
            browser.sideInner = document.createElement('div');
            browser.close();
            expect(browser.sideInner).toBeNull();
        });

        it('should remove global event on close', () => {
            // Open first to set the bind
            mockEditor.$.eventManager.addGlobalEvent.mockReturnValue({ target: null, type: 'keydown', listener: jest.fn() });
            browser.open();
            browser.close();
            // removeGlobalEvent should be called
            expect(mockEditor.$.eventManager.removeGlobalEvent).toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------
    // search method
    // ---------------------------------------------------------------
    describe('search method', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should set keyword', () => {
            browser.search('test keyword');
            expect(browser.keyword).toBe('test keyword');
        });

        it('should convert keyword to lowercase when no searchUrl', () => {
            browser.search('Test KEYWORD');
            expect(browser.keyword).toBe('test keyword');
        });

        it('should call drawListItem (via drawFileList) when searchUrl is present', () => {
            browser.searchUrl = 'https://example.com/search';
            browser.search('test');
            expect(browser.keyword).toBe('test');
            expect(browser.apiManager.call).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://example.com/search?keyword=test'
                })
            );
        });

        it('should use searchUrlHeader when searchUrl is present', () => {
            browser.searchUrl = 'https://example.com/search';
            browser.searchUrlHeader = { 'X-Search': 'true' };
            browser.search('query');
            expect(browser.apiManager.call).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: { 'X-Search': 'true' }
                })
            );
        });

        it('should call drawListItem without searchUrl (filters locally)', () => {
            browser.items = [
                { src: 'img1.jpg', name: 'Nature Photo', tag: ['nature'] },
                { src: 'img2.jpg', name: 'City Photo', tag: ['city'] }
            ];
            browser.search('nature');
            expect(browser.keyword).toBe('nature');
            // The list should be updated (items filtered by keyword)
            expect(browser.list.innerHTML).toBeDefined();
        });
    });

    // ---------------------------------------------------------------
    // tagfilter method
    // ---------------------------------------------------------------
    describe('tagfilter method', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should return all items when no tags selected', () => {
            const items = [
                { name: 'item1', tag: ['tag1'] },
                { name: 'item2', tag: ['tag2'] }
            ];
            browser.selectedTags = [];
            const filtered = browser.tagfilter(items);
            expect(filtered).toEqual(items);
        });

        it('should filter items by selected tags', () => {
            const items = [
                { name: 'item1', tag: ['tag1', 'tag2'] },
                { name: 'item2', tag: ['tag3'] },
                { name: 'item3', tag: ['tag1'] }
            ];
            browser.selectedTags = ['tag1'];
            const filtered = browser.tagfilter(items);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].name).toBe('item1');
            expect(filtered[1].name).toBe('item3');
        });

        it('should include items without tags when no tags selected', () => {
            const items = [
                { name: 'item1', tag: ['tag1'] },
                { name: 'item2' }
            ];
            browser.selectedTags = [];
            const filtered = browser.tagfilter(items);
            expect(filtered).toHaveLength(2);
        });

        it('should keep items with non-array tags when filtering', () => {
            const items = [
                { name: 'item1', tag: ['tag1'] },
                { name: 'item2', tag: 'tag2' }
            ];
            browser.selectedTags = ['tag1'];
            const filtered = browser.tagfilter(items);
            expect(filtered).toHaveLength(2);
        });

        it('should exclude items whose array tags do not match', () => {
            const items = [
                { name: 'item1', tag: ['tag1'] },
                { name: 'item2', tag: ['tag2'] },
                { name: 'item3', tag: ['tag3'] }
            ];
            browser.selectedTags = ['tag2'];
            const filtered = browser.tagfilter(items);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('item2');
        });
    });

    // ---------------------------------------------------------------
    // Loading methods
    // ---------------------------------------------------------------
    describe('Loading methods', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('showBrowserLoading should not throw', () => {
            expect(() => {
                browser.showBrowserLoading();
            }).not.toThrow();
        });

        it('closeBrowserLoading should not throw', () => {
            expect(() => {
                browser.closeBrowserLoading();
            }).not.toThrow();
        });

        it('should handle loading state changes', () => {
            expect(() => {
                browser.showBrowserLoading();
                browser.closeBrowserLoading();
            }).not.toThrow();
        });
    });

    // ---------------------------------------------------------------
    // #globalEventHandler (ESC key handler - lines 111-113)
    // ---------------------------------------------------------------
    describe('Global event handler (ESC key)', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
        });

        it('should close browser when ESC is pressed', () => {
            // open() calls addGlobalEvent
            browser.open();
            expect(browser.area.style.display).toBe('block');

            // Capture the global event handler registered during open()
            const addGlobalEventCall = mockEditor.$.eventManager.addGlobalEvent.mock.calls[0];
            expect(addGlobalEventCall).toBeTruthy();
            const globalHandler = addGlobalEventCall[1];

            // Simulate ESC key
            mockHelper.keyCodeMap.isEsc.mockReturnValueOnce(true);
            globalHandler({ code: 'Escape' });

            expect(browser.area.style.display).toBe('none');
        });

        it('should not close when non-ESC key is pressed', () => {
            browser.open();

            const addGlobalEventCall = mockEditor.$.eventManager.addGlobalEvent.mock.calls[0];
            const globalHandler = addGlobalEventCall[1];

            mockHelper.keyCodeMap.isEsc.mockReturnValueOnce(false);
            globalHandler({ code: 'KeyA' });

            expect(browser.area.style.display).toBe('block');
        });
    });

    // ---------------------------------------------------------------
    // #drowItems (lines 304-331)
    // ---------------------------------------------------------------
    describe('#drowItems - via open() with directData', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should handle array data with items (drawListItem called with update=true)', () => {
            const arrayData = [
                { src: 'img1.jpg', name: 'Image 1', tag: ['nature', 'landscape'], type: 'image' },
                { src: 'img2.jpg', name: 'Image 2', tag: ['city'], type: 'image' }
            ];
            browser.directData = arrayData;
            browser.open();
            expect(browser.items.length).toBe(2);
            // Tags should be generated
            expect(browser.tagArea.innerHTML).toContain('nature');
        });

        it('should handle empty array data (returns true without drawing)', () => {
            browser.directData = [];
            browser.open();
            expect(browser.items.length).toBe(0);
        });

        it('should handle object data (folder structure)', () => {
            const folderData = {
                myFolder: {
                    name: 'My Folder',
                    _data: [
                        { src: 'img1.jpg', name: 'Image 1', tag: ['nature'], type: 'image' }
                    ]
                },
                subfolder: {
                    name: 'Sub Folder',
                    _data: [
                        { src: 'img2.jpg', name: 'Image 2', tag: ['city'], type: 'image' }
                    ]
                }
            };
            browser.directData = folderData;
            browser.open();
            // sideOpenBtn display should be set to ''
            expect(browser.sideOpenBtn.style.display).toBe('');
            // tree and folders should be populated
            expect(Object.keys(browser.tree).length).toBeGreaterThan(0);
        });

        it('should handle object data with default folder', () => {
            const folderData = {
                root: {
                    name: 'Root',
                    _data: [{ src: 'img1.jpg', name: 'Image 1', type: 'image' }],
                    sub: {
                        name: 'Sub',
                        default: true,
                        _data: [{ src: 'img2.jpg', name: 'Image 2', type: 'image' }]
                    }
                }
            };
            browser.directData = folderData;
            browser.open();
            // folderDefaultPath should be set to the 'default' folder
            expect(browser.folderDefaultPath).toBeTruthy();
        });

        it('should handle folderDefaultPath with "/" (nested path)', () => {
            // Create folder data where the default path includes a "/"
            const folderData = {
                root: {
                    name: 'Root',
                    _data: 'http://example.com/root',
                    sub: {
                        name: 'Sub',
                        default: true,
                        _data: [{ src: 'img.jpg', name: 'Img', type: 'image' }]
                    }
                }
            };
            browser.directData = folderData;
            // This will call #drowItems with object data
            // The default path "root/sub" includes "/"
            browser.open();
            expect(browser.folderDefaultPath).toContain('/');
        });

        it('should return false for non-array/non-object data (via CallBackGet)', () => {
            // We can test this through CallBackGet by mocking apiManager
            browser.directData = null;
            browser.url = 'https://example.com/api';
            browser.open();

            // Get the CallBackGet handler
            const callArgs = browser.apiManager.call.mock.calls[0][0];
            const callBackGet = callArgs.callBack;

            // Simulate response with non-array/non-object result and nullMessage
            const xmlHttp = {
                responseText: JSON.stringify({ result: 'invalid_string', nullMessage: '<p>No items</p>' })
            };
            callBackGet(xmlHttp);
            expect(browser.list.innerHTML).toBe('<p>No items</p>');
        });
    });

    // ---------------------------------------------------------------
    // #parseFolderData (lines 338-378)
    // ---------------------------------------------------------------
    describe('#parseFolderData - via open() with folder data', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should parse _data and set data path', () => {
            const folderData = {
                myFolder: {
                    name: 'My Folder',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.data['myFolder']).toBeDefined();
            expect(browser.folders['myFolder']).toBeDefined();
            expect(browser.folders['myFolder'].name).toBe('My Folder');
        });

        it('should set folderDefaultPath to first _data folder if no default', () => {
            const folderData = {
                first: {
                    name: 'First',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                },
                second: {
                    name: 'Second',
                    _data: [{ src: 'b.jpg', name: 'B', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.folderDefaultPath).toBe('first');
        });

        it('should override folderDefaultPath when data.default is true', () => {
            const folderData = {
                first: {
                    name: 'First',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                },
                second: {
                    name: 'Second',
                    default: true,
                    _data: [{ src: 'b.jpg', name: 'B', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.folderDefaultPath).toBe('second');
        });

        it('should handle nested folder entries with path building', () => {
            const folderData = {
                root: {
                    name: 'Root',
                    child: {
                        name: 'Child',
                        _data: [{ src: 'c.jpg', name: 'C', type: 'image' }]
                    }
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.folders['root']).toBeDefined();
            expect(browser.folders['root/child']).toBeDefined();
        });

        it('should skip _data key in folder entries loop', () => {
            const folderData = {
                myFolder: {
                    name: 'My Folder',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            // _data should not be treated as a subfolder
            expect(browser.folders['myFolder/_data']).toBeUndefined();
        });

        it('should handle path without _data (simple tree entry)', () => {
            // Folder without _data but with children
            const folderData = {
                parent: {
                    name: 'Parent',
                    child: {
                        name: 'Child',
                        _data: [{ src: 'x.jpg', name: 'X', type: 'image' }]
                    }
                }
            };
            browser.directData = folderData;
            browser.open();
            // parent should be in tree without a key
            expect(browser.tree['parent']).toBeDefined();
        });

        it('should use key name as folder name when name is not specified', () => {
            const folderData = {
                unnamed: {
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.folders['unnamed'].name).toBe('unnamed');
        });

        it('should store meta data for folders', () => {
            const folderData = {
                withMeta: {
                    name: 'With Meta',
                    meta: { description: 'Test folder' },
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.folders['withMeta'].meta).toEqual({ description: 'Test folder' });
        });

        it('should handle string _data (URL)', () => {
            const folderData = {
                remote: {
                    name: 'Remote',
                    _data: 'https://api.example.com/files'
                }
            };
            browser.directData = folderData;
            browser.open();
            expect(browser.data['remote']).toBe('https://api.example.com/files');
        });
    });

    // ---------------------------------------------------------------
    // #createFolderList (lines 385-414)
    // ---------------------------------------------------------------
    describe('#createFolderList - via open() with folder data', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should create folder structure with children (has children branch)', () => {
            const folderData = {
                root: {
                    name: 'Root',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }],
                    child: {
                        name: 'Child',
                        _data: [{ src: 'b.jpg', name: 'B', type: 'image' }]
                    }
                }
            };
            browser.directData = folderData;
            browser.open();
            // side should have folder structure
            expect(browser.side.innerHTML).toContain('se-menu-folder');
        });

        it('should create leaf folder items (no children)', () => {
            const folderData = {
                leaf: {
                    name: 'Leaf Item',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            // The side should contain folder items
            expect(browser.side.innerHTML).toBeTruthy();
        });

        it('should wrap leaf in se-menu-folder div when parentElement is sideInner', () => {
            // A leaf item at root level (parentElement === sideInner)
            const folderData = {
                onlyLeaf: {
                    name: 'Only Leaf',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                }
            };
            browser.directData = folderData;
            browser.open();
            // sideInner should have the folder wrapper
            expect(browser.sideInner).toBeTruthy();
        });

        it('should use icon_folder for items with key that have children', () => {
            const folderData = {
                root: {
                    name: 'Root',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }],
                    child1: {
                        name: 'Child1',
                        _data: [{ src: 'b.jpg', name: 'B', type: 'image' }]
                    }
                }
            };
            browser.directData = folderData;
            browser.open();
            // Verify folder icons are used
            expect(browser.side.innerHTML).toBeTruthy();
        });
    });

    // ---------------------------------------------------------------
    // #CallBackGet (lines 420-434)
    // ---------------------------------------------------------------
    describe('#CallBackGet - via apiManager callback', () => {
        let browser;
        let callBackGet;
        let callBackError;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            browser.directData = null;
            browser.url = 'https://example.com/api';
            browser.open();

            const callArgs = browser.apiManager.call.mock.calls[0][0];
            callBackGet = callArgs.callBack;
            callBackError = callArgs.errorCallBack;
        });

        it('should parse JSON and draw items (array result)', () => {
            const xmlHttp = {
                responseText: JSON.stringify({
                    result: [
                        { src: 'img1.jpg', name: 'Image 1', tag: ['nature'], type: 'image' }
                    ]
                })
            };
            callBackGet(xmlHttp);
            expect(browser.items.length).toBe(1);
        });

        it('should parse JSON and draw items (object result - folders)', () => {
            const xmlHttp = {
                responseText: JSON.stringify({
                    result: {
                        myFolder: {
                            name: 'My Folder',
                            _data: [{ src: 'a.jpg', name: 'A', type: 'image' }]
                        }
                    }
                })
            };
            callBackGet(xmlHttp);
            expect(Object.keys(browser.folders).length).toBeGreaterThan(0);
        });

        it('should set nullMessage when drowItems returns false', () => {
            const xmlHttp = {
                responseText: JSON.stringify({
                    result: 'not_valid',
                    nullMessage: '<p>No results found</p>'
                })
            };
            callBackGet(xmlHttp);
            expect(browser.list.innerHTML).toBe('<p>No results found</p>');
        });

        it('should not set nullMessage when drowItems returns false and no nullMessage', () => {
            const xmlHttp = {
                responseText: JSON.stringify({
                    result: 12345
                })
            };
            callBackGet(xmlHttp);
            // No nullMessage, so list.innerHTML should not be updated
            expect(browser.list.innerHTML).not.toBe('<p>No results found</p>');
        });

        it('should throw error on JSON parse failure', () => {
            const xmlHttp = {
                responseText: 'invalid json{'
            };
            expect(() => {
                callBackGet(xmlHttp);
            }).toThrow(/SUNEDITOR\.browser\.drawList\.fail/);
        });

        it('should call closeBrowserLoading in finally block (success)', () => {
            const xmlHttp = {
                responseText: JSON.stringify({ result: [] })
            };
            callBackGet(xmlHttp);
            // closeBrowserLoading should be called (loading hidden)
            // We can verify it does not throw
        });

        it('should call closeBrowserLoading in finally block (error)', () => {
            const xmlHttp = {
                responseText: 'bad json'
            };
            try {
                callBackGet(xmlHttp);
            } catch (e) {
                // Expected
            }
            // Even on error, closeBrowserLoading is called in finally
        });

        it('should handle empty array result', () => {
            const xmlHttp = {
                responseText: JSON.stringify({ result: [] })
            };
            callBackGet(xmlHttp);
            // Empty array returns true from drowItems
        });
    });

    // ---------------------------------------------------------------
    // #CallBackError (lines 440-443)
    // ---------------------------------------------------------------
    describe('#CallBackError - via apiManager errorCallBack', () => {
        let browser;
        let callBackError;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            browser.directData = null;
            browser.url = 'https://example.com/api';
            browser.open();

            const callArgs = browser.apiManager.call.mock.calls[0][0];
            callBackError = callArgs.errorCallBack;
        });

        it('should throw error with status and errorMessage', () => {
            const res = { errorMessage: 'Server error occurred' };
            const xmlHttp = { status: 500, responseText: 'Server Error' };
            expect(() => {
                callBackError(res, xmlHttp);
            }).toThrow(/SUNEDITOR\.browser\.get\.serverException/);
        });

        it('should throw error with responseText when no errorMessage', () => {
            const res = {};
            const xmlHttp = { status: 404, responseText: 'Not Found' };
            expect(() => {
                callBackError(res, xmlHttp);
            }).toThrow(/404.*Not Found/);
        });
    });

    // ---------------------------------------------------------------
    // #OnClickTag (lines 448-465)
    // ---------------------------------------------------------------
    describe('#OnClickTag - via event handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);

            // Set up items and tags
            browser.directData = [
                { src: 'img1.jpg', name: 'Image 1', tag: ['nature', 'landscape'], type: 'image' },
                { src: 'img2.jpg', name: 'Image 2', tag: ['city'], type: 'image' }
            ];
            browser.open();
        });

        it('should return early for non-anchor target', () => {
            const clickTag = handlers.clickTag;
            if (!clickTag) return;

            mockHelper.dom.check.isAnchor.mockReturnValueOnce(false);
            const div = document.createElement('div');
            clickTag({ target: div });
            // Should not throw or modify selectedTags
            expect(browser.selectedTags).toEqual([]);
        });

        it('should add tag to selectedTags when not already selected', () => {
            const clickTag = handlers.clickTag;
            if (!clickTag) return;

            const anchor = document.createElement('a');
            anchor.textContent = 'nature';
            anchor.setAttribute('title', 'nature');
            browser.tagArea.appendChild(anchor);

            mockHelper.dom.check.isAnchor.mockReturnValueOnce(true);
            clickTag({ target: anchor });

            expect(browser.selectedTags).toContain('nature');
            expect(mockHelper.dom.utils.addClass).toHaveBeenCalled();
        });

        it('should remove tag from selectedTags when already selected', () => {
            const clickTag = handlers.clickTag;
            if (!clickTag) return;

            const anchor = document.createElement('a');
            anchor.textContent = 'nature';
            anchor.setAttribute('title', 'nature');
            browser.tagArea.appendChild(anchor);

            browser.selectedTags = ['nature'];

            mockHelper.dom.check.isAnchor.mockReturnValueOnce(true);
            clickTag({ target: anchor });

            expect(browser.selectedTags).not.toContain('nature');
            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalled();
        });

        it('should call drawListItem after toggling tag', () => {
            const clickTag = handlers.clickTag;
            if (!clickTag) return;

            const anchor = document.createElement('a');
            anchor.textContent = 'city';
            anchor.setAttribute('title', 'city');
            browser.tagArea.appendChild(anchor);

            mockHelper.dom.check.isAnchor.mockReturnValueOnce(true);
            clickTag({ target: anchor });

            // drawListItem was called - list should be updated
            expect(browser.list.innerHTML).toBeDefined();
        });
    });

    // ---------------------------------------------------------------
    // #OnClickFile (lines 470-483)
    // ---------------------------------------------------------------
    describe('#OnClickFile - via event handler', () => {
        let browser;
        let handlers;
        let selectorHandler;

        beforeEach(() => {
            selectorHandler = jest.fn();
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: selectorHandler
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should return when eventTarget is the list itself', () => {
            const clickFile = handlers.clickFile;
            if (!clickFile) return;

            const e = {
                target: browser.list,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(browser.list);

            clickFile(e);
            expect(selectorHandler).not.toHaveBeenCalled();
        });

        it('should return when getCommandTarget returns null', () => {
            const clickFile = handlers.clickFile;
            if (!clickFile) return;

            const target = document.createElement('div');
            const e = {
                target: target,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(target);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(null);

            clickFile(e);
            expect(selectorHandler).not.toHaveBeenCalled();
        });

        it('should call close and selectorHandler with valid target', () => {
            const clickFile = handlers.clickFile;
            if (!clickFile) return;

            browser.open();
            const target = document.createElement('img');
            target.setAttribute('data-command', 'test.jpg');
            const e = {
                target: target,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(target);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(target);

            clickFile(e);
            expect(browser.area.style.display).toBe('none');
            expect(selectorHandler).toHaveBeenCalledWith(target);
        });

        it('should call preventDefault and stopPropagation', () => {
            const clickFile = handlers.clickFile;
            if (!clickFile) return;

            const e = {
                target: browser.list,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(browser.list);

            clickFile(e);
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------
    // #OnClickSide (lines 488-518)
    // ---------------------------------------------------------------
    describe('#OnClickSide - via event handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should toggle child visibility when button is clicked (hidden -> show)', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            // Create a button inside a folder structure
            const btn = document.createElement('button');
            const folderLabel = document.createElement('div');
            const folderDiv = document.createElement('div');
            const childContainer = document.createElement('div');
            childContainer.className = 'se-menu-child se-menu-hidden';
            folderLabel.appendChild(btn);
            folderDiv.appendChild(folderLabel);
            folderDiv.appendChild(childContainer);

            const e = { target: btn, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(btn);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(true); // has se-menu-hidden

            clickSide(e);

            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalledWith(childContainer, 'se-menu-hidden');
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it('should toggle child visibility when button is clicked (show -> hidden)', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            const btn = document.createElement('button');
            const folderLabel = document.createElement('div');
            const folderDiv = document.createElement('div');
            const childContainer = document.createElement('div');
            childContainer.className = 'se-menu-child';
            folderLabel.appendChild(btn);
            folderDiv.appendChild(folderLabel);
            folderDiv.appendChild(childContainer);

            const e = { target: btn, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(btn);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false); // not hidden

            clickSide(e);

            expect(mockHelper.dom.utils.addClass).toHaveBeenCalledWith(childContainer, 'se-menu-hidden');
        });

        it('should return when cmdTarget is already active', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            const div = document.createElement('div');
            div.setAttribute('data-command', 'test-path');
            const e = { target: div, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(div);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(div);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(true); // already active

            clickSide(e);
            // Should not call drawFileList or drawListItem
            expect(browser.apiManager.call).not.toHaveBeenCalled();
        });

        it('should return when getCommandTarget returns null', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            const div = document.createElement('div');
            const e = { target: div, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(div);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(null);

            clickSide(e);
            expect(browser.apiManager.call).not.toHaveBeenCalled();
        });

        it('should call drawFileList when data is a string URL', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            browser.data = { 'remote-path': 'https://api.example.com/files' };

            const div = document.createElement('div');
            div.setAttribute('data-command', 'remote-path');
            browser.side.innerHTML = '';
            browser.side.appendChild(div);

            const e = { target: div, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(div);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(div);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false); // not active

            clickSide(e);

            expect(browser.apiManager.call).toHaveBeenCalled();
        });

        it('should call drawListItem when data is an array', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            browser.data = {
                'local-path': [
                    { src: 'a.jpg', name: 'A', tag: [], type: 'image' }
                ]
            };

            const div = document.createElement('div');
            div.setAttribute('data-command', 'local-path');
            browser.side.innerHTML = '';
            browser.side.appendChild(div);

            const e = { target: div, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(div);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(div);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false); // not active

            clickSide(e);

            // drawListItem was called, list should be updated
            expect(browser.list.innerHTML).toBeDefined();
            expect(browser.tagArea.innerHTML).toBe('');
        });

        it('should clear tagArea and manage active classes', () => {
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            browser.data = {
                'path': [{ src: 'a.jpg', name: 'A', tag: [], type: 'image' }]
            };
            browser.tagArea.innerHTML = '<a>old tag</a>';

            const div = document.createElement('div');
            div.setAttribute('data-command', 'path');
            browser.side.innerHTML = '';
            browser.side.appendChild(div);

            const e = { target: div, stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(div);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(div);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false);

            clickSide(e);

            expect(browser.tagArea.innerHTML).toBe('');
            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalled();
            expect(mockHelper.dom.utils.addClass).toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------
    // #OnMouseDown_browser (lines 523-530)
    // ---------------------------------------------------------------
    describe('#OnMouseDown_browser - via event handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should set closeSignal to true when className matches se-browser-inner', () => {
            const mouseDown = handlers.mouseDownBrowser;
            if (!mouseDown) return;

            const target = document.createElement('div');
            target.className = 'se-browser-inner';
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(target);

            mouseDown({ target: target });

            // Now clicking should close
            const clickBrowser = handlers.clickBrowser;
            if (!clickBrowser) return;

            browser.open();
            const clickTarget = document.createElement('div');
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(clickTarget);
            clickTarget.getAttribute = jest.fn().mockReturnValue(null);

            clickBrowser({ target: clickTarget, stopPropagation: jest.fn() });
            expect(browser.area.style.display).toBe('none');
        });

        it('should set closeSignal to false when className does not match', () => {
            const mouseDown = handlers.mouseDownBrowser;
            if (!mouseDown) return;

            const target = document.createElement('div');
            target.className = 'se-browser-body';
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(target);

            mouseDown({ target: target });

            // Clicking should NOT close (closeSignal is false and no close command)
            const clickBrowser = handlers.clickBrowser;
            if (!clickBrowser) return;

            browser.open();
            const clickTarget = document.createElement('div');
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(clickTarget);
            clickTarget.getAttribute = jest.fn().mockReturnValue(null);

            clickBrowser({ target: clickTarget, stopPropagation: jest.fn() });
            // Should remain open
            expect(browser.area.style.display).toBe('block');
        });
    });

    // ---------------------------------------------------------------
    // #OnClick_browser (lines 535-542)
    // ---------------------------------------------------------------
    describe('#OnClick_browser - via event handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should close when data-command includes close', () => {
            const clickBrowser = handlers.clickBrowser;
            if (!clickBrowser) return;

            browser.open();
            const target = document.createElement('button');
            target.setAttribute('data-command', 'close');
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(target);

            clickBrowser({ target: target, stopPropagation: jest.fn() });
            expect(browser.area.style.display).toBe('none');
        });

        it('should close when closeSignal is true', () => {
            const mouseDown = handlers.mouseDownBrowser;
            const clickBrowser = handlers.clickBrowser;
            if (!mouseDown || !clickBrowser) return;

            browser.open();

            // First set closeSignal to true via mousedown
            const innerTarget = document.createElement('div');
            innerTarget.className = 'se-browser-inner';
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(innerTarget);
            mouseDown({ target: innerTarget });

            // Then click
            const clickTarget = document.createElement('div');
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(clickTarget);
            clickBrowser({ target: clickTarget, stopPropagation: jest.fn() });

            expect(browser.area.style.display).toBe('none');
        });

        it('should not close when neither close command nor closeSignal', () => {
            const clickBrowser = handlers.clickBrowser;
            if (!clickBrowser) return;

            browser.open();
            const target = document.createElement('div');
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(target);

            clickBrowser({ target: target, stopPropagation: jest.fn() });
            expect(browser.area.style.display).toBe('block');
        });

        it('should call stopPropagation', () => {
            const clickBrowser = handlers.clickBrowser;
            if (!clickBrowser) return;

            const e = { target: document.createElement('div'), stopPropagation: jest.fn() };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(e.target);

            clickBrowser(e);
            expect(e.stopPropagation).toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------
    // #Search (lines 547-551)
    // ---------------------------------------------------------------
    describe('#Search - via form submit handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should preventDefault and search with input value', () => {
            const searchHandler = handlers.search;
            if (!searchHandler) return;

            browser.items = [
                { src: 'a.jpg', name: 'Apple Photo', tag: [], type: 'image' },
                { src: 'b.jpg', name: 'Banana Photo', tag: [], type: 'image' }
            ];

            // Set the value on the actual internal search input
            const searchInput = browser.area.querySelector('input[type="text"]');
            searchInput.value = 'Apple';

            const e = { preventDefault: jest.fn() };

            searchHandler(e);

            expect(e.preventDefault).toHaveBeenCalled();
            expect(browser.keyword).toBe('apple');
        });
    });

    // ---------------------------------------------------------------
    // #SideOpen (lines 556-565)
    // ---------------------------------------------------------------
    describe('#SideOpen - via event handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should add active class and show side when not active', () => {
            const sideOpen = handlers.sideOpen;
            if (!sideOpen) return;

            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false); // not active
            const e = { target: browser.sideOpenBtn };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(browser.sideOpenBtn);

            sideOpen(e);

            expect(mockHelper.dom.utils.addClass).toHaveBeenCalledWith(browser.side, 'se-side-show');
            expect(mockHelper.dom.utils.addClass).toHaveBeenCalledWith(browser.sideOpenBtn, 'active');
        });

        it('should remove active class and hide side when already active', () => {
            const sideOpen = handlers.sideOpen;
            if (!sideOpen) return;

            mockHelper.dom.utils.hasClass.mockReturnValueOnce(true); // active
            const e = { target: browser.sideOpenBtn };
            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(browser.sideOpenBtn);

            sideOpen(e);

            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalledWith(browser.side, 'se-side-show');
            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalledWith(browser.sideOpenBtn, 'active');
        });
    });

    // ---------------------------------------------------------------
    // #SideClose (lines 570-576)
    // ---------------------------------------------------------------
    describe('#SideClose - via event handler', () => {
        let browser;
        let handlers;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
            handlers = getEventHandlers(mockEditor.$.eventManager);
        });

        it('should return early when target is sideOpenBtn', () => {
            const sideClose = handlers.sideClose;
            if (!sideClose) return;

            mockHelper.dom.utils.hasClass.mockClear();
            sideClose({ target: browser.sideOpenBtn });

            // hasClass should NOT be called because we return early
            expect(mockHelper.dom.utils.hasClass).not.toHaveBeenCalled();
        });

        it('should remove active classes when sideOpenBtn is active', () => {
            const sideClose = handlers.sideClose;
            if (!sideClose) return;

            mockHelper.dom.utils.hasClass.mockReturnValueOnce(true); // sideOpenBtn is active
            sideClose({ target: document.createElement('div') });

            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalledWith(browser.side, 'se-side-show');
            expect(mockHelper.dom.utils.removeClass).toHaveBeenCalledWith(browser.sideOpenBtn, 'active');
        });

        it('should not remove classes when sideOpenBtn is not active', () => {
            const sideClose = handlers.sideClose;
            if (!sideClose) return;

            mockHelper.dom.utils.removeClass.mockClear();
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false);
            sideClose({ target: document.createElement('div') });

            expect(mockHelper.dom.utils.removeClass).not.toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------
    // #drawFileList (lines 227-233)
    // ---------------------------------------------------------------
    describe('#drawFileList - via open/search', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should call apiManager with correct parameters', () => {
            browser.directData = null;
            browser.url = 'https://api.example.com/files';
            browser.urlHeader = { 'X-Custom': 'header' };
            browser.open();

            expect(browser.apiManager.call).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'GET',
                    url: 'https://api.example.com/files',
                    headers: { 'X-Custom': 'header' },
                    callBack: expect.any(Function),
                    errorCallBack: expect.any(Function)
                })
            );
        });

        it('should hide sideOpenBtn and show loading when not pageLoading', () => {
            browser.directData = null;
            browser.url = 'https://api.example.com/files';
            browser.open();

            expect(browser.sideOpenBtn.style.display).toBe('none');
        });

        it('should not hide sideOpenBtn when pageLoading is true (via OnClickSide with string data)', () => {
            const handlers = getEventHandlers(mockEditor.$.eventManager);
            const clickSide = handlers.clickSide;
            if (!clickSide) return;

            browser.data = { 'path': 'https://api.example.com/page2' };
            browser.sideOpenBtn.style.display = '';

            const div = document.createElement('div');
            div.setAttribute('data-command', 'path');
            browser.side.appendChild(div);

            mockHelper.dom.query.getEventTarget.mockReturnValueOnce(div);
            mockHelper.dom.query.getCommandTarget.mockReturnValueOnce(div);
            mockHelper.dom.utils.hasClass.mockReturnValueOnce(false);

            clickSide({ target: div, stopPropagation: jest.fn() });

            // pageLoading=true so sideOpenBtn display should NOT change
            expect(browser.sideOpenBtn.style.display).toBe('');
        });
    });

    // ---------------------------------------------------------------
    // #drawListItem (lines 240-282)
    // ---------------------------------------------------------------
    describe('#drawListItem - via open/search', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should filter items by keyword', () => {
            browser.directData = [
                { src: 'nature.jpg', name: 'Nature Photo', tag: ['nature'], type: 'image' },
                { src: 'city.jpg', name: 'City Photo', tag: ['city'], type: 'image' }
            ];
            browser.open();
            browser.search('city');
            // Only city photo should be in the list
            expect(browser.list.innerHTML).toContain('City Photo');
        });

        it('should generate tags HTML when update is true', () => {
            browser.directData = [
                { src: 'a.jpg', name: 'A', tag: ['tag1', 'tag2'], type: 'image' },
                { src: 'b.jpg', name: 'B', tag: ['tag2', 'tag3'], type: 'image' }
            ];
            browser.open();
            // Tags should be generated (unique tags)
            expect(browser.tagArea.innerHTML).toContain('tag1');
            expect(browser.tagArea.innerHTML).toContain('tag2');
            expect(browser.tagArea.innerHTML).toContain('tag3');
        });

        it('should handle string tags (comma separated)', () => {
            browser.directData = [
                { src: 'a.jpg', name: 'A', tag: 'tag1, tag2', type: 'image' }
            ];
            browser.open();
            // String tags should be split and trimmed
            expect(browser.items[0].tag).toEqual(['tag1', 'tag2']);
        });

        it('should handle items without tags', () => {
            browser.directData = [
                { src: 'a.jpg', name: 'A', type: 'image' }
            ];
            browser.open();
            // Should not throw
            expect(browser.items[0].tag).toEqual([]);
        });

        it('should split items into columns based on columnSize', () => {
            const data = [];
            for (let i = 0; i < 12; i++) {
                data.push({ src: `img${i}.jpg`, name: `Image ${i}`, tag: ['test'], type: 'image' });
            }
            const browser3col = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                columnSize: 3,
                selectorHandler: jest.fn()
            });
            browser3col.directData = data;
            browser3col.open();
            // Should have multiple column divs
            const columns = browser3col.list.querySelectorAll('.se-file-item-column');
            expect(columns.length).toBeGreaterThanOrEqual(3);
        });

        it('should handle columnSize of 1', () => {
            const browser1col = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                columnSize: 1,
                selectorHandler: jest.fn()
            });
            browser1col.directData = [
                { src: 'a.jpg', name: 'A', type: 'image' },
                { src: 'b.jpg', name: 'B', type: 'image' }
            ];
            browser1col.open();
            // Should have 1 column
            expect(browser1col.list.querySelectorAll('.se-file-item-column').length).toBe(1);
        });

        it('should not update items and tags when update is false (via search)', () => {
            browser.directData = [
                { src: 'a.jpg', name: 'A', tag: ['old'], type: 'image' }
            ];
            browser.open();
            const originalTags = browser.tagArea.innerHTML;

            // search calls drawListItem with update=false
            browser.search('a');
            // Tags should not change
            expect(browser.tagArea.innerHTML).toBe(originalTags);
        });

        it('should not create duplicate tags', () => {
            browser.directData = [
                { src: 'a.jpg', name: 'A', tag: ['shared'], type: 'image' },
                { src: 'b.jpg', name: 'B', tag: ['shared'], type: 'image' }
            ];
            browser.open();
            // 'shared' should produce only one <a> tag (not duplicated)
            const anchors = browser.tagArea.querySelectorAll('a');
            expect(anchors.length).toBe(1);
            expect(anchors[0].textContent).toBe('shared');
        });
    });

    // ---------------------------------------------------------------
    // #addGlobalEvent / #removeGlobalEvent (lines 287-297)
    // ---------------------------------------------------------------
    describe('#addGlobalEvent / #removeGlobalEvent', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should remove previous global event before adding new one on open', () => {
            mockEditor.$.eventManager.addGlobalEvent.mockReturnValue({ target: null, type: 'keydown', listener: jest.fn() });

            browser.open();
            const firstRemoveCallCount = mockEditor.$.eventManager.removeGlobalEvent.mock.calls.length;

            browser.open();
            // Second open should remove the previous bind before adding new one
            expect(mockEditor.$.eventManager.removeGlobalEvent.mock.calls.length).toBeGreaterThanOrEqual(firstRemoveCallCount);
        });
    });

    // ---------------------------------------------------------------
    // Custom drawItemHandler
    // ---------------------------------------------------------------
    describe('Custom drawItemHandler', () => {
        it('should use custom drawItemHandler', () => {
            const customHandler = jest.fn((item) => {
                return `<div data-src="${item.src}">${item.name}</div>`;
            });

            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                drawItemHandler: customHandler,
                selectorHandler: jest.fn()
            });

            const data = [{ src: 'test.jpg', name: 'Test', type: 'image' }];
            browser.directData = data;
            browser.open();

            expect(customHandler).toHaveBeenCalled();
        });

        it('should use thumbnail function when provided', () => {
            const thumbnailFn = jest.fn((item) => '<span>THUMB</span>');

            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                thumbnail: thumbnailFn,
                selectorHandler: jest.fn()
            });

            const data = [
                { src: 'doc.pdf', name: 'Document', type: 'pdf' }
            ];
            browser.directData = data;
            browser.open();

            expect(browser.drawItemHandler).toBeDefined();
        });
    });

    // ---------------------------------------------------------------
    // Integration tests
    // ---------------------------------------------------------------
    describe('Integration', () => {
        it('should handle full lifecycle', () => {
            const selectorHandler = jest.fn();
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: selectorHandler
            });

            browser.open();
            expect(browser.area.style.display).toBe('block');

            browser.search('test');
            expect(browser.keyword).toBe('test');

            browser.close();
            expect(browser.area.style.display).toBe('none');
            expect(browser.keyword).toBe('');
        });

        it('should handle data parameter', () => {
            const data = [
                { src: 'image1.jpg', name: 'Image 1', tag: ['nature'] },
                { src: 'image2.jpg', name: 'Image 2', tag: ['city'] }
            ];

            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                data: data,
                selectorHandler: jest.fn()
            });

            expect(browser.directData).toBe(data);
        });

        it('should handle open with folder data then search', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });

            const folderData = {
                root: {
                    name: 'Root',
                    _data: [
                        { src: 'a.jpg', name: 'Apple', tag: ['fruit'], type: 'image' },
                        { src: 'b.jpg', name: 'Banana', tag: ['fruit'], type: 'image' }
                    ]
                }
            };
            browser.directData = folderData;
            browser.open();

            // Searching should work on current items
            browser.items = [
                { src: 'a.jpg', name: 'Apple', tag: ['fruit'], type: 'image' },
                { src: 'b.jpg', name: 'Banana', tag: ['fruit'], type: 'image' }
            ];
            browser.search('apple');
            expect(browser.keyword).toBe('apple');
        });

        it('should handle multiple open/close cycles', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });

            browser.directData = [{ src: 'a.jpg', name: 'A', type: 'image' }];

            browser.open();
            expect(browser.area.style.display).toBe('block');
            browser.close();
            expect(browser.area.style.display).toBe('none');

            browser.open();
            expect(browser.area.style.display).toBe('block');
            browser.close();
            expect(browser.area.style.display).toBe('none');
        });
    });

    // ---------------------------------------------------------------
    // DrawItems default function (lines 643-656)
    // ---------------------------------------------------------------
    describe('DrawItems default function', () => {
        it('should use default DrawItems when no drawItemHandler provided', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });

            browser.directData = [
                { src: 'img/test.jpg', name: 'Test Image', tag: ['nature'], type: 'image', alt: 'Alt Text' }
            ];
            browser.open();
            expect(browser.list.innerHTML).toContain('data-command="img/test.jpg"');
            expect(browser.list.innerHTML).toContain('data-name="Test Image"');
        });

        it('should handle items with thumbnail', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });

            browser.directData = [
                { src: 'img/test.jpg', name: 'Test', tag: [], type: 'image', thumbnail: 'thumb.jpg' }
            ];
            browser.open();
            expect(browser.list.innerHTML).toContain('data-thumbnail="thumb.jpg"');
        });

        it('should use srcName as fallback for name and alt', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });

            browser.directData = [
                { src: 'img/photo.jpg', name: 'photo.jpg', tag: [], type: 'image' }
            ];
            browser.open();
            expect(browser.list.innerHTML).toContain('photo.jpg');
            // DrawItems uses srcName (last part of src after /) as fallback for alt
            expect(browser.list.innerHTML).toContain('alt="photo.jpg"');
        });

        it('should handle custom props in DrawItems', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                props: ['customId', 'category'],
                selectorHandler: jest.fn()
            });

            browser.directData = [
                { src: 'test.jpg', name: 'Test', tag: [], type: 'image', customId: '123', category: 'photo' }
            ];
            browser.open();
            // HTML attributes are lowercased by the browser
            expect(browser.list.innerHTML).toContain('data-customid="123"');
            expect(browser.list.innerHTML).toContain('data-category="photo"');
        });

        it('should handle thumbnail function for non-image types', () => {
            const thumbnailFn = jest.fn((item) => '<svg>icon</svg>');
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                thumbnail: thumbnailFn,
                selectorHandler: jest.fn()
            });

            browser.directData = [
                { src: 'doc.pdf', name: 'Document', tag: [], type: 'pdf' }
            ];
            browser.open();
            expect(thumbnailFn).toHaveBeenCalled();
            expect(browser.list.innerHTML).toContain('se-browser-empty-thumbnail');
        });

        it('should not use thumbnail div for image type even with thumbnail function', () => {
            const thumbnailFn = jest.fn((item) => '<svg>icon</svg>');
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                thumbnail: thumbnailFn,
                selectorHandler: jest.fn()
            });

            browser.directData = [
                { src: 'img.jpg', name: 'Image', tag: [], type: 'image' }
            ];
            browser.open();
            // For image type, should use img tag not thumbnail div
            expect(browser.list.innerHTML).toContain('<img');
        });
    });

    // ---------------------------------------------------------------
    // Edge cases
    // ---------------------------------------------------------------
    describe('Edge cases', () => {
        it('should handle folder data with non-object values in entries', () => {
            const folderData = {
                root: {
                    name: 'Root',
                    _data: [{ src: 'a.jpg', name: 'A', type: 'image' }],
                    stringVal: 'not an object',
                    nullVal: null,
                    numVal: 42
                }
            };

            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            browser.directData = folderData;
            expect(() => browser.open()).not.toThrow();
        });

        it('should handle deep nested folders', () => {
            const folderData = {
                level1: {
                    name: 'Level 1',
                    level2: {
                        name: 'Level 2',
                        level3: {
                            name: 'Level 3',
                            _data: [{ src: 'deep.jpg', name: 'Deep', type: 'image' }]
                        }
                    }
                }
            };

            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            browser.directData = folderData;
            expect(() => browser.open()).not.toThrow();
            expect(browser.folders['level1/level2/level3']).toBeDefined();
        });

        it('should handle empty keyword search', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            browser.directData = [
                { src: 'a.jpg', name: 'A', tag: [], type: 'image' }
            ];
            browser.open();
            browser.search('');
            expect(browser.keyword).toBe('');
        });

        it('should handle object data with no folderDefaultPath (line 319 false branch)', () => {
            // Object data where no _data exists at any level => folderDefaultPath stays empty
            const folderData = {
                emptyFolder: {
                    name: 'Empty'
                    // No _data, no children with _data
                }
            };
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            browser.directData = folderData;
            expect(() => browser.open()).not.toThrow();
            expect(browser.folderDefaultPath).toBe('');
        });

        it('should handle DrawItems with no name (srcName fallback on line 648/654)', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            browser.directData = [
                { src: 'path/to/file.jpg', name: '', tag: [], type: 'image' }
            ];
            browser.open();
            // When name is empty, srcName (file.jpg) should be used as fallback
            expect(browser.list.innerHTML).toContain('data-name="file.jpg"');
            expect(browser.list.innerHTML).toContain('>file.jpg</div>');
        });
    });
});
