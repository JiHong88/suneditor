/**
 * @fileoverview Unit tests for plugins/browser/imageGallery.js
 */

import ImageGallery from '../../../../src/plugins/browser/imageGallery.js';

// Mock Browser module
const mockBrowser = {
    open: jest.fn(),
    close: jest.fn()
};

jest.mock('../../../../src/modules', () => ({
    Browser: jest.fn().mockImplementation(() => mockBrowser)
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.plugins = editor.plugins;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Browser - ImageGallery', () => {
    let mockEditor;
    let imageGallery;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                imageGallery: 'Image Gallery'
            },
            plugins: {
                image: {
                    pluginOptions: {
                        defaultWidth: '100%',
                        defaultHeight: 'auto'
                    },
                    init: jest.fn(),
                    create: jest.fn()
                }
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        const pluginOptions = {
            data: [
                { url: '/image1.jpg', name: 'image1.jpg' },
                { url: '/image2.jpg', name: 'image2.jpg' }
            ],
            url: '/api/images',
            headers: { 'Authorization': 'Bearer token' }
        };

        imageGallery = new ImageGallery(mockEditor, pluginOptions);
    });

    describe('Static properties', () => {
        it('should have correct static properties', () => {
            expect(ImageGallery.key).toBe('imageGallery');
            expect(ImageGallery.type).toBe('browser');
            expect(ImageGallery.className).toBe('');
        });
    });

    describe('Constructor', () => {
        it('should create ImageGallery instance with required properties', () => {
            expect(imageGallery).toBeInstanceOf(ImageGallery);
            expect(imageGallery.title).toBe('Image Gallery');
            expect(imageGallery.icon).toBe('image_gallery');
            expect(imageGallery.browser).toBeDefined();
            expect(imageGallery.onSelectfunction).toBeNull();
        });

        it('should initialize with plugin options', () => {
            const pluginOptions = {
                data: [{ url: '/test.jpg', name: 'test.jpg' }],
                url: '/custom/api',
                headers: { 'Custom-Header': 'value' }
            };

            const gallery = new ImageGallery(mockEditor, pluginOptions);
            expect(gallery).toBeInstanceOf(ImageGallery);
        });

        it('should set default dimensions from image plugin options', () => {
            expect(imageGallery.width).toBe('100%');
            expect(imageGallery.height).toBe('');
        });

        it('should handle auto dimensions', () => {
            mockEditor.plugins.image.pluginOptions.defaultWidth = 'auto';
            mockEditor.plugins.image.pluginOptions.defaultHeight = 'auto';

            const gallery = new ImageGallery(mockEditor, {});
            expect(gallery.width).toBe('');
            expect(gallery.height).toBe('');
        });
    });

    describe('Public methods', () => {
        describe('open', () => {
            it('should open browser without onSelectfunction', () => {
                imageGallery.open();

                expect(imageGallery.onSelectfunction).toBeUndefined();
                expect(mockBrowser.open).toHaveBeenCalled();
            });

            it('should open browser with custom onSelectfunction', () => {
                const customHandler = jest.fn();
                imageGallery.open(customHandler);

                expect(imageGallery.onSelectfunction).toBe(customHandler);
                expect(mockBrowser.open).toHaveBeenCalled();
            });
        });

        describe('close', () => {
            it('should close browser and reset onSelectfunction', () => {
                const customHandler = jest.fn();
                imageGallery.open(customHandler);

                expect(imageGallery.onSelectfunction).toBe(customHandler);

                imageGallery.close();

                expect(imageGallery.onSelectfunction).toBeNull();
                expect(mockBrowser.close).toHaveBeenCalled();
            });
        });
    });

    describe('Item selection handling', () => {
        describe('with custom onSelectfunction', () => {
            it('should call custom handler when item is selected', () => {
                const customHandler = jest.fn();
                const mockTarget = {
                    getAttribute: jest.fn(),
                    alt: 'Test image'
                };

                imageGallery.open(customHandler);

                // Simulate item selection by calling the internal handler
                // We need to access the private method indirectly
                const browserConstructorCall = require('../../../../src/modules').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(customHandler).toHaveBeenCalledWith(mockTarget);
                expect(mockEditor.plugins.image.init).not.toHaveBeenCalled();
            });
        });

        describe('without custom onSelectfunction', () => {
            it('should use default image creation when no custom handler', () => {
                const mockTarget = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-name') return 'test-image.jpg';
                        if (attr === 'data-command') return '/path/to/image.jpg';
                        return '';
                    }),
                    alt: 'Test image'
                };

                imageGallery.open();

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.image.init).toHaveBeenCalled();
                expect(mockEditor.plugins.image.create).toHaveBeenCalledWith(
                    '/path/to/image.jpg',
                    null,
                    '100%',
                    '',
                    'none',
                    { name: 'test-image.jpg', size: 0 },
                    'Test image',
                    true
                );
            });
        });
    });

    describe('Browser integration', () => {
        it('should create Browser with correct options', () => {
            const { Browser } = require('../../../../src/modules');
            const constructorCall = Browser.mock.calls[0];

            expect(constructorCall[0]).toBe(imageGallery); // instance
            expect(constructorCall[1]).toMatchObject({
                title: 'Image Gallery',
                columnSize: 4,
                className: 'se-image-gallery'
            });
            expect(constructorCall[1].selectorHandler).toBeInstanceOf(Function);
        });

        it('should pass plugin options to Browser', () => {
            const pluginOptions = {
                data: [{ url: '/test.jpg' }],
                url: '/api/test',
                headers: { 'Test-Header': 'test' }
            };

            new ImageGallery(mockEditor, pluginOptions);

            const { Browser } = require('../../../../src/modules');
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
                new ImageGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing image plugin gracefully', () => {
            mockEditor.plugins.image = {
                pluginOptions: {
                    defaultWidth: 'auto',
                    defaultHeight: 'auto'
                }
            };

            expect(() => {
                new ImageGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle item selection with missing data attributes', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue(null),
                alt: 'Test image'
            };

            imageGallery.open();

            const { Browser } = require('../../../../src/modules');
            const browserOptions = Browser.mock.calls[0][1];
            const selectorHandler = browserOptions.selectorHandler;

            expect(() => {
                selectorHandler(mockTarget);
            }).not.toThrow();

            expect(mockEditor.plugins.image.create).toHaveBeenCalledWith(
                null, null, '100%', '', 'none',
                { name: null, size: 0 }, 'Test image', true
            );
        });
    });
});