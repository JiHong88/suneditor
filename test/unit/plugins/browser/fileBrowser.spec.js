/**
 * @fileoverview Unit tests for plugins/browser/fileBrowser.js
 */

import FileBrowser from '../../../../src/plugins/browser/fileBrowser.js';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock Browser module
const mockBrowser = {
    open: jest.fn(),
    close: jest.fn()
};

jest.mock('../../../../src/modules/contract', () => ({
    Browser: jest.fn().mockImplementation(() => mockBrowser)
}));

describe('Plugins - Browser - FileBrowser', () => {
    let kernel;
    let fileBrowser;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();

        const pluginOptions = {
            data: [
                { url: '/file1.pdf', name: 'file1.pdf', type: 'file' },
                { url: '/image1.jpg', name: 'image1.jpg', type: 'image' }
            ],
            url: '/api/files',
            headers: { 'Authorization': 'Bearer token' },
            props: ['custom-prop']
        };

        fileBrowser = new FileBrowser(kernel, pluginOptions);
    });

    describe('Constructor', () => {
        it('should create FileBrowser instance with required properties', () => {
            expect(fileBrowser).toBeInstanceOf(FileBrowser);
            expect(fileBrowser.title).toBe('File Browser');
            expect(fileBrowser.icon).toBe('file_browser');
            expect(fileBrowser.browser).toBeDefined();
            expect(fileBrowser.onSelectfunction).toBeNull();
        });

        it('should initialize with plugin options', () => {
            const pluginOptions = {
                data: [{ url: '/test.pdf', name: 'test.pdf', type: 'file' }],
                url: '/custom/api',
                headers: { 'Custom-Header': 'value' }
            };

            const browser = new FileBrowser(kernel, pluginOptions);
            expect(browser).toBeInstanceOf(FileBrowser);
        });

        it('should handle thumbnail function', () => {
            const thumbnailFn = jest.fn();
            const pluginOptions = {
                thumbnail: thumbnailFn
            };

            new FileBrowser(kernel, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][2];

            expect(browserOptions.thumbnail).toBe(thumbnailFn);
        });

        it('should use default thumbnail mapping when no thumbnail function provided', () => {
            new FileBrowser(kernel, {});

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][2];

            // Test thumbnail mapping
            expect(browserOptions.thumbnail({ type: 'video' })).toBe('🎥');
            expect(browserOptions.thumbnail({ type: 'audio' })).toBe('🎵');
            expect(browserOptions.thumbnail({ type: 'file' })).toBe('📁');
            expect(browserOptions.thumbnail({ type: 'unknown' })).toBe('📁');
        });

        it('should merge props with frame prop', () => {
            const pluginOptions = {
                props: ['custom1', 'custom2']
            };

            new FileBrowser(kernel, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][2];

            expect(browserOptions.props).toEqual(expect.arrayContaining(['custom1', 'custom2', 'frame']));
        });

        it('should handle empty props', () => {
            new FileBrowser(kernel, {});

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][2];

            expect(browserOptions.props).toEqual(['frame']);
        });
    });

    describe('Public methods', () => {
        describe('open', () => {
            it('should open browser without onSelectfunction', () => {
                fileBrowser.open();

                expect(fileBrowser.onSelectfunction).toBeUndefined();
                expect(mockBrowser.open).toHaveBeenCalled();
            });

            it('should open browser with custom onSelectfunction', () => {
                const customHandler = jest.fn();
                fileBrowser.open(customHandler);

                expect(fileBrowser.onSelectfunction).toBe(customHandler);
                expect(mockBrowser.open).toHaveBeenCalled();
            });
        });

        describe('close', () => {
            it('should close browser and reset onSelectfunction', () => {
                const customHandler = jest.fn();
                fileBrowser.open(customHandler);

                expect(fileBrowser.onSelectfunction).toBe(customHandler);

                fileBrowser.close();

                expect(fileBrowser.onSelectfunction).toBeNull();
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

                fileBrowser.open(customHandler);

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[2];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(customHandler).toHaveBeenCalledWith(mockTarget);
                expect(kernel.plugins.imageGallery.browser.selectorHandler).not.toHaveBeenCalled();
            });
        });

        describe('without custom onSelectfunction', () => {
            let selectorHandler;

            beforeEach(() => {
                fileBrowser.open();
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[2];
                selectorHandler = browserOptions.selectorHandler;
            });

            it('should delegate to imageGallery for image type', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue('image')
                };

                selectorHandler(mockTarget);

                expect(kernel.plugins.imageGallery.browser.selectorHandler).toHaveBeenCalledWith(mockTarget);
            });

            it('should delegate to videoGallery for video type', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue('video')
                };

                selectorHandler(mockTarget);

                expect(kernel.plugins.videoGallery.browser.selectorHandler).toHaveBeenCalledWith(mockTarget);
            });

            it('should delegate to audioGallery for audio type', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue('audio')
                };

                selectorHandler(mockTarget);

                expect(kernel.plugins.audioGallery.browser.selectorHandler).toHaveBeenCalledWith(mockTarget);
            });

            it('should delegate to fileGallery for file type', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue('file')
                };

                selectorHandler(mockTarget);

                expect(kernel.plugins.fileGallery.browser.selectorHandler).toHaveBeenCalledWith(mockTarget);
            });

            it('should handle unknown type gracefully', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue('unknown')
                };

                expect(() => {
                    selectorHandler(mockTarget);
                }).not.toThrow();

                // No handler should be called for unknown types
                expect(kernel.plugins.imageGallery.browser.selectorHandler).not.toHaveBeenCalled();
                expect(kernel.plugins.videoGallery.browser.selectorHandler).not.toHaveBeenCalled();
                expect(kernel.plugins.audioGallery.browser.selectorHandler).not.toHaveBeenCalled();
                expect(kernel.plugins.fileGallery.browser.selectorHandler).not.toHaveBeenCalled();
            });

            it('should handle null type', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue(null)
                };

                expect(() => {
                    selectorHandler(mockTarget);
                }).not.toThrow();
            });
        });
    });

    describe('Browser integration', () => {
        it('should create Browser with correct options', () => {
            const { Browser } = require('../../../../src/modules/contract');
            const constructorCall = Browser.mock.calls[0];

            expect(constructorCall[0]).toBe(fileBrowser); // instance
            expect(constructorCall[2]).toMatchObject({
                title: 'File Browser',
                columnSize: 4,
                className: 'se-file-browser'
            });
            expect(constructorCall[2].selectorHandler).toBeInstanceOf(Function);
            expect(constructorCall[2].thumbnail).toBeInstanceOf(Function);
            expect(constructorCall[2].props).toEqual(expect.arrayContaining(['frame']));
        });

        it('should pass plugin options to Browser', () => {
            const pluginOptions = {
                data: [{ url: '/test.pdf', type: 'file' }],
                url: '/api/test',
                headers: { 'Test-Header': 'test' }
            };

            new FileBrowser(kernel, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const lastCall = Browser.mock.calls[Browser.mock.calls.length - 1];
            const browserOptions = lastCall[2];

            expect(browserOptions.data).toEqual(pluginOptions.data);
            expect(browserOptions.url).toBe(pluginOptions.url);
            expect(browserOptions.headers).toEqual(pluginOptions.headers);
        });
    });

    describe('Error handling', () => {
        it('should handle missing plugin options gracefully', () => {
            expect(() => {
                new FileBrowser(kernel, {});
            }).not.toThrow();
        });

        it('should handle missing gallery plugins gracefully', () => {
            kernel.plugins = {};

            expect(() => {
                new FileBrowser(kernel, {});
            }).not.toThrow();
        });

        it('should handle item selection with missing gallery plugins', () => {
            kernel.plugins = {};
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('image')
            };

            fileBrowser.open();

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[0][2];
            const selectorHandler = browserOptions.selectorHandler;

            // Missing plugins should not cause errors, just do nothing
            expect(() => {
                selectorHandler(mockTarget);
            }).not.toThrow();
        });
    });
});