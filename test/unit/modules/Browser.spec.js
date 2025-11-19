/**
 * @fileoverview Unit tests for modules/Browser.js
 */

import Browser from '../../../src/modules/contracts/Browser.js';

// Mock ApiManager
jest.mock('../../../src/modules/utils/ApiManager.js', () => {
    return jest.fn().mockImplementation(function() {
        this.call = jest.fn();
        this.cancel = jest.fn();
    });
});

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.lang = editor.lang;
        this.icons = editor.icons;
        this.ui = editor.ui;
        this.offset = editor.offset || {
            getGlobal: jest.fn().mockReturnValue({ top: 100 })
        };
        this.carrierWrapper = {
            appendChild: jest.fn()
        };
        this.eventManager = {
            addEvent: jest.fn(),
            addGlobalEvent: jest.fn(() => 'event-id'),
            removeGlobalEvent: jest.fn()
        };
        this.options = new Map([['_rtl', false]]);
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
                const elem = {
                    tagName: tagName || 'DIV',
                    appendChild: jest.fn(),
                    insertBefore: jest.fn(),
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === 'form.se-browser-search-form') {
                            return {
                                querySelector: jest.fn().mockReturnValue({
                                    value: ''
                                })
                            };
                        }
                        if (selector === '.se-side-open-btn') {
                            return { style: { display: '' }, click: jest.fn() };
                        }
                        if (selector === '.se-browser-main') {
                            return {};
                        }
                        if (selector === '.se-browser-side') {
                            return {
                                appendChild: jest.fn(),
                                innerHTML: '',
                                querySelectorAll: jest.fn().mockReturnValue([])
                            };
                        }
                        if (selector.startsWith('[data-command=')) {
                            return {
                                click: jest.fn(),
                                parentElement: {
                                    previousElementSibling: {
                                        querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
                                    }
                                }
                            };
                        }
                        return {
                            children: [{}, {}],
                            style: { display: '' },
                            innerHTML: '',
                            textContent: '',
                            querySelector: jest.fn().mockReturnValue({
                                children: [{}, {}],
                                style: { display: '' }
                            })
                        };
                    }),
                    querySelectorAll: jest.fn().mockReturnValue([]),
                    className: attrs?.class || '',
                    innerHTML: html || '',
                    textContent: '',
                    style: { display: '', maxHeight: '' },
                    firstElementChild: {},
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-command') return '';
                        return attrs?.[attr] || '';
                    })
                };
                return elem;
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

        mockEditor = {
            ui: { showBrowser: jest.fn(), hideBrowser: jest.fn() },
            triggerEvent: jest.fn(),
            offset: {
                getGlobal: jest.fn().mockReturnValue({ top: 100 })
            },
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
                side_menu_folder: '📂',
                side_menu_item: '📄'
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
            const browser = new Browser(mockInst, {
                title: 'Custom Title',
                selectorHandler: jest.fn()
            });
            expect(browser.title).toBe('Custom Title');
        });

        it('should accept listClass parameter', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                listClass: 'custom-list',
                selectorHandler: jest.fn()
            });
            expect(browser.listClass).toBe('custom-list');
        });

        it('should default listClass to se-preview-list', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.listClass).toBe('se-preview-list');
        });

        it('should accept url parameter', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                url: 'https://example.com/api/files',
                selectorHandler: jest.fn()
            });
            expect(browser.url).toBe('https://example.com/api/files');
        });

        it('should accept headers parameter', () => {
            const headers = { 'Authorization': 'Bearer token' };
            const browser = new Browser(mockInst, {
                title: 'Test',
                headers: headers,
                selectorHandler: jest.fn()
            });
            expect(browser.urlHeader).toBe(headers);
        });

        it('should accept searchUrl parameter', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                searchUrl: 'https://example.com/api/search',
                selectorHandler: jest.fn()
            });
            expect(browser.searchUrl).toBe('https://example.com/api/search');
        });

        it('should accept useSearch parameter', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                useSearch: false,
                selectorHandler: jest.fn()
            });
            expect(browser.useSearch).toBe(false);
        });

        it('should default useSearch to true', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.useSearch).toBe(true);
        });

        it('should accept columnSize parameter', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                columnSize: 6,
                selectorHandler: jest.fn()
            });
            expect(browser.columnSize).toBe(6);
        });

        it('should default columnSize to 4', () => {
            const browser = new Browser(mockInst, {
                title: 'Test',
                selectorHandler: jest.fn()
            });
            expect(browser.columnSize).toBe(4);
        });

        it('should accept data parameter', () => {
            const data = [{ src: 'test.jpg', name: 'Test' }];
            const browser = new Browser(mockInst, {
                title: 'Test',
                data: data,
                selectorHandler: jest.fn()
            });
            expect(browser.directData).toBe(data);
        });

        it('should accept className parameter', () => {
            const browser = new Browser(mockInst, {
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
            browser = new Browser(mockInst, {
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
            expect(browser.editor.opendBrowser).toBe(browser);
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
            browser = new Browser(mockInst, {
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
            browser.editor.opendBrowser = browser;
            browser.close();
            expect(browser.editor.opendBrowser).toBeNull();
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
            browser = new Browser(mockInst, {
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
            browser = new Browser(mockInst, {
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
            browser = new Browser(mockInst, {
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
            const browser = new Browser(mockInst, {
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

            const browser = new Browser(mockInst, {
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
            browser = new Browser(mockInst, {
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
            browser = new Browser(mockInst, {
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
            browser = new Browser(mockInst, {
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
            const browser1Col = new Browser(mockInst, {
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

            const browser = new Browser(mockInst, {
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

            const browser = new Browser(mockInst, {
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
            const browser = new Browser(mockInst, {
                title: 'Test',
                props: ['customProp1', 'customProp2'],
                selectorHandler: jest.fn()
            });

            expect(browser.drawItemHandler).toBeDefined();
        });
    });

    describe('Event handlers', () => {
        let browser;

        beforeEach(() => {
            browser = new Browser(mockInst, {
                title: 'Test Browser',
                selectorHandler: jest.fn()
            });
        });

        describe('Search form submission', () => {
            it('should call search when form is submitted', () => {
                const searchSpy = jest.spyOn(browser, 'search');

                // Find the search form submit handler
                const submitHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[1] === 'submit')?.[2];

                expect(submitHandler).toBeDefined();

                // Simulate form submission
                const mockEvent = {
                    preventDefault: jest.fn(),
                    currentTarget: {
                        querySelector: jest.fn().mockReturnValue({
                            value: 'test search'
                        })
                    }
                };

                submitHandler.call(browser, mockEvent);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(searchSpy).toHaveBeenCalledWith('test search');
            });
        });

        describe('Global ESC key handler', () => {
            it('should close browser on ESC key', () => {
                const closeSpy = jest.spyOn(browser, 'close');
                const mockKeyCodeMap = require('../../../src/helper').keyCodeMap;

                browser.open();

                // Find the global keydown handler
                const keydownHandler = browser.eventManager.addGlobalEvent.mock.calls
                    .find(call => call[0] === 'keydown')?.[1];

                expect(keydownHandler).toBeDefined();

                // Simulate ESC key
                mockKeyCodeMap.isEsc.mockReturnValueOnce(true);
                keydownHandler({ code: 'Escape' });

                expect(closeSpy).toHaveBeenCalled();
            });

            it('should not close on non-ESC keys', () => {
                const closeSpy = jest.spyOn(browser, 'close');
                const mockKeyCodeMap = require('../../../src/helper').keyCodeMap;

                browser.open();

                const keydownHandler = browser.eventManager.addGlobalEvent.mock.calls
                    .find(call => call[0] === 'keydown')?.[1];

                // Simulate non-ESC key
                mockKeyCodeMap.isEsc.mockReturnValueOnce(false);
                keydownHandler({ code: 'KeyA' });

                expect(closeSpy).not.toHaveBeenCalled();
            });
        });

        describe('Browser click handlers', () => {
            it('should close browser when close button is clicked', () => {
                const closeSpy = jest.spyOn(browser, 'close');

                // Find the browser click handler
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[1] === 'click' && call[0] !== browser.tagArea && call[0] !== browser.list && call[0] !== browser.side)?.[2];

                expect(clickHandler).toBeDefined();

                const mockEvent = {
                    stopPropagation: jest.fn(),
                    target: {
                        getAttribute: jest.fn().mockReturnValue('close')
                    }
                };

                const mockQuery = require('../../../src/helper').dom.query;
                mockQuery.getEventTarget.mockReturnValueOnce(mockEvent.target);

                clickHandler.call(browser, mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect(closeSpy).toHaveBeenCalled();
            });

            it('should close browser when clicking on background', () => {
                const closeSpy = jest.spyOn(browser, 'close');

                // Find mousedown handler
                const mousedownHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[1] === 'mousedown' && call[0] !== browser.header)?.[2];

                // Find click handler
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[1] === 'click' && call[0] !== browser.tagArea && call[0] !== browser.list && call[0] !== browser.side)?.[2];

                const mockTarget = {
                    className: 'se-browser-inner',
                    getAttribute: jest.fn().mockReturnValue(null)
                };

                const mockQuery = require('../../../src/helper').dom.query;

                // Simulate mousedown on background
                mockQuery.getEventTarget.mockReturnValueOnce(mockTarget);
                mousedownHandler.call(browser, { target: mockTarget });

                // Then click
                mockQuery.getEventTarget.mockReturnValueOnce(mockTarget);
                clickHandler.call(browser, {
                    stopPropagation: jest.fn(),
                    target: mockTarget
                });

                expect(closeSpy).toHaveBeenCalled();
            });
        });

        describe('File selection', () => {
            it('should call selectorHandler when file is clicked', () => {
                const mockSelectorHandler = jest.fn();
                browser.selectorHandler = mockSelectorHandler;
                const closeSpy = jest.spyOn(browser, 'close');

                // Find the list click handler
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.list && call[1] === 'click')?.[2];

                expect(clickHandler).toBeDefined();

                const mockTarget = { id: 'file1' };
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn(),
                    target: mockTarget
                };

                const mockQuery = require('../../../src/helper').dom.query;
                mockQuery.getEventTarget.mockReturnValueOnce(mockTarget);
                mockQuery.getCommandTarget.mockReturnValueOnce(mockTarget);

                clickHandler.call(browser, mockEvent);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect(closeSpy).toHaveBeenCalled();
                expect(mockSelectorHandler).toHaveBeenCalledWith(mockTarget);
            });

            it('should not call selectorHandler when clicking list itself', () => {
                const mockSelectorHandler = jest.fn();
                browser.selectorHandler = mockSelectorHandler;

                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.list && call[1] === 'click')?.[2];

                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn(),
                    target: browser.list
                };

                const mockQuery = require('../../../src/helper').dom.query;
                mockQuery.getEventTarget.mockReturnValueOnce(browser.list);

                clickHandler.call(browser, mockEvent);

                expect(mockSelectorHandler).not.toHaveBeenCalled();
            });

            it('should not call selectorHandler when no command target', () => {
                const mockSelectorHandler = jest.fn();
                browser.selectorHandler = mockSelectorHandler;

                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.list && call[1] === 'click')?.[2];

                const mockTarget = { id: 'file1' };
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn(),
                    target: mockTarget
                };

                const mockQuery = require('../../../src/helper').dom.query;
                mockQuery.getEventTarget.mockReturnValueOnce(mockTarget);
                mockQuery.getCommandTarget.mockReturnValueOnce(null);

                clickHandler.call(browser, mockEvent);

                expect(mockSelectorHandler).not.toHaveBeenCalled();
            });
        });

        describe('Tag filtering', () => {
            it('should toggle tag selection when tag is clicked', () => {
                browser.items = [
                    { src: 'img1.jpg', name: 'Image 1', tag: ['nature'] },
                    { src: 'img2.jpg', name: 'Image 2', tag: ['city'] }
                ];

                // Setup tagArea with a mock tag element
                browser.tagArea.querySelector = jest.fn().mockReturnValue({
                    querySelector: jest.fn().mockReturnValue({})
                });

                // Find the tag click handler
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.tagArea && call[1] === 'click')?.[2];

                expect(clickHandler).toBeDefined();

                const mockTag = {
                    tagName: 'A',
                    textContent: 'nature'
                };

                const mockEvent = {
                    target: mockTag
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockTag);
                mockDom.check.isAnchor.mockReturnValueOnce(true);
                browser.tagArea.querySelector = jest.fn().mockReturnValue(mockTag);

                clickHandler.call(browser, mockEvent);

                expect(browser.selectedTags).toContain('nature');
                expect(mockDom.utils.addClass).toHaveBeenCalled();
            });

            it('should deselect tag when clicked again', () => {
                browser.items = [
                    { src: 'img1.jpg', name: 'Image 1', tag: ['nature'] }
                ];
                browser.selectedTags = ['nature'];

                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.tagArea && call[1] === 'click')?.[2];

                const mockTag = {
                    tagName: 'A',
                    textContent: 'nature'
                };

                const mockEvent = {
                    target: mockTag
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockTag);
                mockDom.check.isAnchor.mockReturnValueOnce(true);
                browser.tagArea.querySelector = jest.fn().mockReturnValue(mockTag);

                clickHandler.call(browser, mockEvent);

                expect(browser.selectedTags).not.toContain('nature');
                expect(mockDom.utils.removeClass).toHaveBeenCalled();
            });

            it('should not process non-anchor clicks', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.tagArea && call[1] === 'click')?.[2];

                const mockEvent = {
                    target: { tagName: 'DIV', textContent: 'not a tag' }
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockEvent.target);
                mockDom.check.isAnchor.mockReturnValueOnce(false);

                const initialTags = [...browser.selectedTags];
                clickHandler.call(browser, mockEvent);

                expect(browser.selectedTags).toEqual(initialTags);
            });
        });

        describe('Side menu navigation', () => {
            it('should toggle folder expansion when button is clicked', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.side && call[1] === 'click')?.[2];

                expect(clickHandler).toBeDefined();

                const mockButton = {
                    nodeName: 'BUTTON',
                    innerHTML: '▶',
                    parentElement: {
                        parentElement: {
                            querySelector: jest.fn().mockReturnValue({
                                classList: {
                                    contains: jest.fn().mockReturnValue(true)
                                }
                            })
                        }
                    }
                };

                const mockEvent = {
                    target: mockButton,
                    stopPropagation: jest.fn()
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockButton);

                const childContainer = mockButton.parentElement.parentElement.querySelector('.se-menu-child');
                mockDom.utils.hasClass.mockReturnValueOnce(true);

                clickHandler.call(browser, mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect(mockDom.utils.removeClass).toHaveBeenCalled();
            });

            it('should collapse folder when button is clicked again', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.side && call[1] === 'click')?.[2];

                const mockButton = {
                    nodeName: 'BUTTON',
                    innerHTML: '▼',
                    parentElement: {
                        parentElement: {
                            querySelector: jest.fn().mockReturnValue({
                                classList: {
                                    contains: jest.fn().mockReturnValue(false)
                                }
                            })
                        }
                    }
                };

                const mockEvent = {
                    target: mockButton,
                    stopPropagation: jest.fn()
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockButton);

                const childContainer = mockButton.parentElement.parentElement.querySelector('.se-menu-child');
                mockDom.utils.hasClass.mockReturnValueOnce(false);

                clickHandler.call(browser, mockEvent);

                expect(mockDom.utils.addClass).toHaveBeenCalled();
            });

            it('should load folder data when folder item is clicked', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.side && call[1] === 'click')?.[2];

                browser.data = {
                    'folder1': [
                        { src: 'img1.jpg', name: 'Image 1', type: 'image' }
                    ]
                };

                browser.tagArea = {
                    innerHTML: ''
                };

                browser.side.querySelectorAll = jest.fn().mockReturnValue([
                    { classList: { remove: jest.fn() } }
                ]);

                const mockFolderItem = {
                    nodeName: 'DIV',
                    getAttribute: jest.fn().mockReturnValue('folder1')
                };

                const mockEvent = {
                    target: mockFolderItem,
                    stopPropagation: jest.fn()
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockFolderItem);
                mockDom.query.getCommandTarget.mockReturnValueOnce(mockFolderItem);
                mockDom.utils.hasClass.mockReturnValueOnce(false); // not active
                mockDom.query.getParentElement.mockReturnValueOnce(mockFolderItem);

                clickHandler.call(browser, mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect(mockDom.utils.removeClass).toHaveBeenCalled();
                expect(mockDom.utils.addClass).toHaveBeenCalled();
            });

            it('should not load data if folder is already active', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.side && call[1] === 'click')?.[2];

                const mockFolderItem = {
                    nodeName: 'DIV',
                    getAttribute: jest.fn().mockReturnValue('folder1')
                };

                const mockEvent = {
                    target: mockFolderItem,
                    stopPropagation: jest.fn()
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockFolderItem);
                mockDom.query.getCommandTarget.mockReturnValueOnce(mockFolderItem);
                mockDom.utils.hasClass.mockReturnValueOnce(true); // already active

                const initialData = browser.data;
                clickHandler.call(browser, mockEvent);

                expect(browser.data).toBe(initialData);
            });

            it('should load folder data from URL when data is string', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.side && call[1] === 'click')?.[2];

                browser.data = {
                    'folder1': 'https://api.example.com/folder1'
                };

                browser.urlHeader = { Authorization: 'Bearer token' };

                browser.tagArea = {
                    innerHTML: ''
                };

                browser.side.querySelectorAll = jest.fn().mockReturnValue([]);

                const mockFolderItem = {
                    nodeName: 'DIV',
                    getAttribute: jest.fn().mockReturnValue('folder1')
                };

                const mockEvent = {
                    target: mockFolderItem,
                    stopPropagation: jest.fn()
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockFolderItem);
                mockDom.query.getCommandTarget.mockReturnValueOnce(mockFolderItem);
                mockDom.utils.hasClass.mockReturnValueOnce(false);
                mockDom.query.getParentElement.mockReturnValueOnce(mockFolderItem);

                clickHandler.call(browser, mockEvent);

                expect(browser.apiManager.call).toHaveBeenCalled();
            });
        });

        describe('Side menu open/close', () => {
            it('should open side menu when button is clicked', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.sideOpenBtn && call[1] === 'click')?.[2];

                expect(clickHandler).toBeDefined();

                const mockButton = {
                    classList: {
                        contains: jest.fn().mockReturnValue(false)
                    }
                };

                const mockEvent = {
                    target: mockButton
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockButton);
                mockDom.utils.hasClass.mockReturnValueOnce(false);

                clickHandler.call(browser, mockEvent);

                expect(mockDom.utils.addClass).toHaveBeenCalledWith(browser.side, 'se-side-show');
                expect(mockDom.utils.addClass).toHaveBeenCalledWith(mockButton, 'active');
            });

            it('should close side menu when button is clicked again', () => {
                const clickHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => call[0] === browser.sideOpenBtn && call[1] === 'click')?.[2];

                const mockButton = {
                    classList: {
                        contains: jest.fn().mockReturnValue(true)
                    }
                };

                const mockEvent = {
                    target: mockButton
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.query.getEventTarget.mockReturnValueOnce(mockButton);
                mockDom.utils.hasClass.mockReturnValueOnce(true);

                clickHandler.call(browser, mockEvent);

                expect(mockDom.utils.removeClass).toHaveBeenCalledWith(browser.side, 'se-side-show');
                expect(mockDom.utils.removeClass).toHaveBeenCalledWith(mockButton, 'active');
            });

            it('should close side menu when clicking outside', () => {
                // Find the mousedown handler - it's registered to an array of elements
                const mousedownHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => {
                        return call[1] === 'mousedown' &&
                               Array.isArray(call[0]) &&
                               call[0].includes(browser.header);
                    })?.[2];

                expect(mousedownHandler).toBeDefined();

                const mockEvent = {
                    target: browser.header
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.utils.hasClass.mockReturnValueOnce(true);

                mousedownHandler.call(browser, mockEvent);

                expect(mockDom.utils.removeClass).toHaveBeenCalledWith(browser.side, 'se-side-show');
                expect(mockDom.utils.removeClass).toHaveBeenCalledWith(browser.sideOpenBtn, 'active');
            });

            it('should not close side menu when clicking sideOpenBtn', () => {
                const mousedownHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => {
                        return call[1] === 'mousedown' &&
                               Array.isArray(call[0]) &&
                               call[0].includes(browser.header);
                    })?.[2];

                const mockEvent = {
                    target: browser.sideOpenBtn
                };

                const mockDom = require('../../../src/helper').dom;

                const removeClassSpy = jest.spyOn(mockDom.utils, 'removeClass');
                removeClassSpy.mockClear();

                mousedownHandler.call(browser, mockEvent);

                // removeClass should not be called when target is sideOpenBtn
                expect(removeClassSpy).not.toHaveBeenCalled();
            });

            it('should not close side menu when it is not active', () => {
                const mousedownHandler = browser.eventManager.addEvent.mock.calls
                    .find(call => {
                        return call[1] === 'mousedown' &&
                               Array.isArray(call[0]) &&
                               call[0].includes(browser.header);
                    })?.[2];

                const mockEvent = {
                    target: browser.header
                };

                const mockDom = require('../../../src/helper').dom;
                mockDom.utils.hasClass.mockReturnValueOnce(false);

                const removeClassSpy = jest.spyOn(mockDom.utils, 'removeClass');
                removeClassSpy.mockClear();

                mousedownHandler.call(browser, mockEvent);

                // removeClass should not be called when side menu is not active
                expect(removeClassSpy).not.toHaveBeenCalled();
            });
        });
    });
});