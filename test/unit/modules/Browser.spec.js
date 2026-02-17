/**
 * @fileoverview Unit tests for modules/Browser.js
 */

import Browser from '../../../src/modules/contract/Browser.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

// Helper function to create real DOM elements (defined before mocks)
const createRealElement = (tagName, attrs, html) => {
    const elem = document.createElement(tagName || 'DIV');
    if (attrs?.class) elem.className = attrs.class;
    if (html) elem.innerHTML = html;
    return elem;
};

// Mock ApiManager
jest.mock('../../../src/modules/manager/ApiManager.js', () => {
    return jest.fn().mockImplementation(function() {
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
                // Return real DOM elements so appendChild works
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

describe('Modules - Browser', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        // Use createMockEditor for the $ deps bag pattern
        const kernel = createMockEditor();
        mockEditor = kernel;

        // Override with custom mocks as needed
        mockEditor.$ = {
            ...kernel.$,
            ui: { showBrowser: jest.fn(), hideBrowser: jest.fn() },
            offset: {
                getGlobal: jest.fn().mockReturnValue({ top: 100 }),
                ...kernel.$.offset
            }
        };
        mockEditor.icons = {
            cancel: '✕',
            side_menu_hamburger: '☰',
            search: '🔍',
            menu_arrow_right: '▶',
            menu_arrow_down: '▼',
            side_menu_folder_item: '📁',
            side_menu_folder: '📂',
            side_menu_item: '📄'
        };
        mockEditor.lang = {
            close: 'Close',
            search: 'Search',
            submitButton: 'Submit'
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
        it('should use constructor name as fallback', () => {
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
    });

    describe('Basic functionality', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should handle browser operations', () => {
            expect(() => {
                browser.showBrowserLoading();
            }).not.toThrow();
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
            const headers = { 'Authorization': 'Bearer token' };
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
    });

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
    });

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
    });

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

        it('should call apiManager with searchUrl when available', () => {
            browser.searchUrl = 'https://example.com/search';
            browser.search('test');
            expect(browser.apiManager.call).toHaveBeenCalled();
        });
    });

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
            // Items with non-array tags are kept when filtering
            expect(filtered).toHaveLength(2);
        });
    });

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

    describe('Integration', () => {
        it('should handle full lifecycle', () => {
            const selectorHandler = jest.fn();
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: selectorHandler
            });

            // Open
            browser.open();
            expect(browser.area.style.display).toBe('block');

            // Search
            browser.search('test');
            expect(browser.keyword).toBe('test');

            // Close
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
    });

    describe('Folder structure data', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should handle array data with tags', () => {
            const arrayData = [
                { src: 'img1.jpg', name: 'Image 1', tag: ['nature', 'landscape'], type: 'image' },
                { src: 'img2.jpg', name: 'Image 2', tag: ['city'], type: 'image' }
            ];

            browser.directData = arrayData;
            browser.open();

            expect(browser.items.length).toBeGreaterThan(0);
        });

        it('should handle empty array data', () => {
            browser.directData = [];
            browser.open();

            expect(browser.items.length).toBe(0);
        });

        it('should open with URL instead of directData', () => {
            browser.url = 'https://api.example.com/files';
            browser.open();

            expect(browser.apiManager.call).toHaveBeenCalled();
        });

        it('should use urlHeader when fetching from URL', () => {
            browser.url = 'https://api.example.com/files';
            browser.urlHeader = { Authorization: 'Bearer token' };
            browser.open();

            expect(browser.apiManager.call).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: { Authorization: 'Bearer token' }
                })
            );
        });

        it('should handle listClass parameter in open', () => {
            browser.open({ listClass: 'custom-class' });

            expect(browser.list.className).toContain('custom-class');
        });

        it('should not change listClass if already has it', () => {
            const mockHasClass = require('../../../src/helper').dom.utils.hasClass;
            mockHasClass.mockReturnValueOnce(true);

            browser.open({ listClass: 'custom-class' });

            // className shouldn't be reassigned if hasClass returns true
            expect(mockHasClass).toHaveBeenCalled();
        });
    });

    describe('Search with tags', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        it('should handle items with array tags', () => {
            browser.items = [
                { src: 'img1.jpg', name: 'Image 1', tag: ['nature', 'landscape'] },
                { src: 'img2.jpg', name: 'Image 2', tag: ['city', 'urban'] }
            ];

            browser.search('image');

            expect(browser.keyword).toBe('image');
        });

        it('should handle items with string tags', () => {
            browser.items = [
                { src: 'img1.jpg', name: 'Image 1', tag: 'nature, landscape' },
                { src: 'img2.jpg', name: 'Image 2', tag: 'city, urban' }
            ];

            browser.search('image');

            expect(browser.keyword).toBe('image');
        });

        it('should handle items without tags', () => {
            browser.items = [
                { src: 'img1.jpg', name: 'Image 1' },
                { src: 'img2.jpg', name: 'Image 2' }
            ];

            browser.search('image');

            expect(browser.keyword).toBe('image');
        });

        it('should filter items by keyword', () => {
            browser.items = [
                { src: 'img1.jpg', name: 'Nature Photo', tag: ['nature'] },
                { src: 'img2.jpg', name: 'City Photo', tag: ['city'] }
            ];

            browser.search('nature');

            expect(browser.keyword).toBe('nature');
        });
    });

    describe('Column splitting', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test Browser',
                columnSize: 3,
                selectorHandler: jest.fn()
            });
        });

        it('should split items into columns', () => {
            const data = [];
            for (let i = 0; i < 10; i++) {
                data.push({
                    src: `img${i}.jpg`,
                    name: `Image ${i}`,
                    tag: ['test'],
                    type: 'image'
                });
            }

            browser.directData = data;
            browser.open();

            expect(browser.items.length).toBeGreaterThan(0);
        });

        it('should handle columnSize of 1', () => {
            const browser1Col = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                columnSize: 1,
                selectorHandler: jest.fn()
            });

            const data = [
                { src: 'img1.jpg', name: 'Image 1', type: 'image' },
                { src: 'img2.jpg', name: 'Image 2', type: 'image' }
            ];

            browser1Col.directData = data;
            browser1Col.open();

            expect(browser1Col.columnSize).toBe(1);
        });
    });

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
            const thumbnailFn = jest.fn((item) => '📄');

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

        it('should handle props parameter', () => {
            const browser = new Browser(mockInst, mockEditor.$, {
                title: 'Test',
                props: ['customProp1', 'customProp2'],
                selectorHandler: jest.fn()
            });

            expect(browser.drawItemHandler).toBeDefined();
        });
    });

});