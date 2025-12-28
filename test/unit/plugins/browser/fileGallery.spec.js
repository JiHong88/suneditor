/**
 * @fileoverview Unit tests for plugins/browser/fileGallery.js
 */

import FileGallery from '../../../../src/plugins/browser/fileGallery.js';

// Mock Browser module
const mockBrowser = {
    open: jest.fn(),
    close: jest.fn()
};

jest.mock('../../../../src/modules/contract', () => ({
    Browser: jest.fn().mockImplementation(() => mockBrowser)
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.plugins = editor.plugins;
        this.icons = editor.icons;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Browser - FileGallery', () => {
    let mockEditor;
    let fileGallery;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                fileGallery: 'File Gallery'
            },
            icons: {
                file_thumbnail: '📁'
            },
            plugins: {
                fileUpload: {
                    create: jest.fn()
                }
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        const pluginOptions = {
            data: [
                { url: '/file1.pdf', name: 'file1.pdf' },
                { url: '/file2.docx', name: 'file2.docx' }
            ],
            url: '/api/files',
            headers: { 'Authorization': 'Bearer token' },
            thumbnail: '/default-file-thumbnail.jpg'
        };

        fileGallery = new FileGallery(mockEditor, pluginOptions);
    });

    describe('Constructor', () => {
        it('should create FileGallery instance with required properties', () => {
            expect(fileGallery).toBeInstanceOf(FileGallery);
            expect(fileGallery.title).toBe('File Gallery');
            expect(fileGallery.icon).toBe('file_gallery');
            expect(fileGallery.browser).toBeDefined();
            expect(fileGallery.onSelectfunction).toBeNull();
        });

        it('should initialize with plugin options', () => {
            const pluginOptions = {
                data: [{ url: '/test.pdf', name: 'test.pdf' }],
                url: '/custom/api',
                headers: { 'Custom-Header': 'value' }
            };

            const gallery = new FileGallery(mockEditor, pluginOptions);
            expect(gallery).toBeInstanceOf(FileGallery);
        });

        it('should handle string thumbnail', () => {
            const pluginOptions = {
                thumbnail: '/custom-thumbnail.jpg'
            };

            new FileGallery(mockEditor, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail).toBeInstanceOf(Function);
            expect(browserOptions.thumbnail()).toBe('/custom-thumbnail.jpg');
        });

        it('should handle function thumbnail', () => {
            const thumbnailFn = jest.fn().mockReturnValue('/dynamic-thumbnail.jpg');
            const pluginOptions = {
                thumbnail: thumbnailFn
            };

            new FileGallery(mockEditor, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail).toBe(thumbnailFn);
        });

        it('should use default icon thumbnail when no thumbnail provided', () => {
            new FileGallery(mockEditor, {});

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail()).toBe('📁');
        });
    });

    describe('Public methods', () => {
        describe('open', () => {
            it('should open browser without onSelectfunction', () => {
                fileGallery.open();

                expect(fileGallery.onSelectfunction).toBeUndefined();
                expect(mockBrowser.open).toHaveBeenCalled();
            });

            it('should open browser with custom onSelectfunction', () => {
                const customHandler = jest.fn();
                fileGallery.open(customHandler);

                expect(fileGallery.onSelectfunction).toBe(customHandler);
                expect(mockBrowser.open).toHaveBeenCalled();
            });
        });

        describe('close', () => {
            it('should close browser and reset onSelectfunction', () => {
                const customHandler = jest.fn();
                fileGallery.open(customHandler);

                expect(fileGallery.onSelectfunction).toBe(customHandler);

                fileGallery.close();

                expect(fileGallery.onSelectfunction).toBeNull();
                expect(mockBrowser.close).toHaveBeenCalled();
            });
        });
    });

    describe('Item selection handling', () => {
        describe('with custom onSelectfunction', () => {
            it('should call custom handler when item is selected', () => {
                const customHandler = jest.fn();
                const mockTarget = {
                    getAttribute: jest.fn()
                };

                fileGallery.open(customHandler);

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(customHandler).toHaveBeenCalledWith(mockTarget);
                expect(mockEditor.plugins.fileUpload.create).not.toHaveBeenCalled();
            });
        });

        describe('without custom onSelectfunction', () => {
            it('should use default file upload creation', () => {
                const mockTarget = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-name') return 'test-file.pdf';
                        if (attr === 'data-command') return '/path/to/file.pdf';
                        return '';
                    })
                };

                fileGallery.open();

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.fileUpload.create).toHaveBeenCalledWith(
                    '/path/to/file.pdf',
                    { name: 'test-file.pdf', size: 0 },
                    true
                );
            });

            it('should handle null data attributes', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue(null)
                };

                fileGallery.open();

                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.fileUpload.create).toHaveBeenCalledWith(
                    null,
                    { name: null, size: 0 },
                    true
                );
            });
        });
    });

    describe('Browser integration', () => {
        it('should create Browser with correct options', () => {
            const { Browser } = require('../../../../src/modules/contract');
            const constructorCall = Browser.mock.calls[0];

            expect(constructorCall[0]).toBe(fileGallery); // instance
            expect(constructorCall[1]).toMatchObject({
                title: 'File Gallery',
                columnSize: 4,
                className: 'se-file-gallery'
            });
            expect(constructorCall[1].selectorHandler).toBeInstanceOf(Function);
            expect(constructorCall[1].thumbnail).toBeInstanceOf(Function);
        });

        it('should pass plugin options to Browser', () => {
            const pluginOptions = {
                data: [{ url: '/test.pdf' }],
                url: '/api/test',
                headers: { 'Test-Header': 'test' }
            };

            new FileGallery(mockEditor, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const lastCall = Browser.mock.calls[Browser.mock.calls.length - 1];
            const browserOptions = lastCall[1];

            expect(browserOptions.data).toEqual(pluginOptions.data);
            expect(browserOptions.url).toBe(pluginOptions.url);
            expect(browserOptions.headers).toEqual(pluginOptions.headers);
        });
    });

    describe('Error handling', () => {
        it('should handle missing plugin options gracefully', () => {
            expect(() => {
                new FileGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing fileUpload plugin gracefully', () => {
            mockEditor.plugins.fileUpload = undefined;

            expect(() => {
                new FileGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle item selection with missing fileUpload plugin', () => {
            mockEditor.plugins.fileUpload = undefined;
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('/test.pdf')
            };

            fileGallery.open();

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[0][1];
            const selectorHandler = browserOptions.selectorHandler;

            expect(() => {
                selectorHandler(mockTarget);
            }).toThrow();
        });
    });
});