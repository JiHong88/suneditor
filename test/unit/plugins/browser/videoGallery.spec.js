/**
 * @fileoverview Unit tests for plugins/browser/videoGallery.js
 */

import VideoGallery from '../../../../src/plugins/browser/videoGallery.js';

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

describe('Plugins - Browser - VideoGallery', () => {
    let mockEditor;
    let videoGallery;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                videoGallery: 'Video Gallery'
            },
            icons: {
                video_thumbnail: '🎥'
            },
            plugins: {
                video: {
                    pluginOptions: {
                        defaultWidth: '560px',
                        defaultHeight: '315px'
                    },
                    modalInit: jest.fn(),
                    create: jest.fn(),
                    findProcessUrl: jest.fn().mockReturnValue({ url: 'processed-url' }),
                    createIframeTag: jest.fn().mockReturnValue('<iframe></iframe>'),
                    createVideoTag: jest.fn().mockReturnValue('<video></video>')
                }
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        const pluginOptions = {
            data: [
                { url: '/video1.mp4', name: 'video1.mp4' },
                { url: '/video2.mp4', name: 'video2.mp4' }
            ],
            url: '/api/videos',
            headers: { 'Authorization': 'Bearer token' },
            thumbnail: '/default-thumbnail.jpg'
        };

        videoGallery = new VideoGallery(mockEditor, pluginOptions);
    });

    describe('Constructor', () => {
        it('should create VideoGallery instance with required properties', () => {
            expect(videoGallery).toBeInstanceOf(VideoGallery);
            expect(videoGallery.title).toBe('Video Gallery');
            expect(videoGallery.icon).toBe('video_gallery');
            expect(videoGallery.browser).toBeDefined();
            expect(videoGallery.onSelectfunction).toBeNull();
        });

        it('should initialize with plugin options', () => {
            const pluginOptions = {
                data: [{ url: '/test.mp4', name: 'test.mp4' }],
                url: '/custom/api',
                headers: { 'Custom-Header': 'value' }
            };

            const gallery = new VideoGallery(mockEditor, pluginOptions);
            expect(gallery).toBeInstanceOf(VideoGallery);
        });

        it('should set default dimensions from video plugin options', () => {
            expect(videoGallery.width).toBe('560px');
            expect(videoGallery.height).toBe('315px');
        });

        it('should handle auto dimensions', () => {
            mockEditor.plugins.video.pluginOptions.defaultWidth = 'auto';
            mockEditor.plugins.video.pluginOptions.defaultHeight = 'auto';

            const gallery = new VideoGallery(mockEditor, {});
            expect(gallery.width).toBe('');
            expect(gallery.height).toBe('');
        });

        it('should handle string thumbnail', () => {
            const pluginOptions = {
                thumbnail: '/custom-thumbnail.jpg'
            };

            new VideoGallery(mockEditor, pluginOptions);

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

            new VideoGallery(mockEditor, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail).toBe(thumbnailFn);
        });

        it('should use default icon thumbnail when no thumbnail provided', () => {
            new VideoGallery(mockEditor, {});

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail()).toBe('🎥');
        });
    });

    describe('Public methods', () => {
        describe('open', () => {
            it('should open browser without onSelectfunction', () => {
                videoGallery.open();

                expect(videoGallery.onSelectfunction).toBeUndefined();
                expect(mockBrowser.open).toHaveBeenCalled();
            });

            it('should open browser with custom onSelectfunction', () => {
                const customHandler = jest.fn();
                videoGallery.open(customHandler);

                expect(videoGallery.onSelectfunction).toBe(customHandler);
                expect(mockBrowser.open).toHaveBeenCalled();
            });
        });

        describe('close', () => {
            it('should close browser and reset onSelectfunction', () => {
                const customHandler = jest.fn();
                videoGallery.open(customHandler);

                expect(videoGallery.onSelectfunction).toBe(customHandler);

                videoGallery.close();

                expect(videoGallery.onSelectfunction).toBeNull();
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
                    alt: 'Test video'
                };

                videoGallery.open(customHandler);

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(customHandler).toHaveBeenCalledWith(mockTarget);
                expect(mockEditor.plugins.video.modalInit).not.toHaveBeenCalled();
            });
        });

        describe('without custom onSelectfunction', () => {
            it('should use default video creation with processed URL', () => {
                const mockTarget = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-name') return 'test-video.mp4';
                        if (attr === 'data-command') return '/path/to/video.mp4';
                        if (attr === 'data-frame') return 'video';
                        if (attr === 'data-thumbnail') return '/thumb.jpg';
                        return '';
                    })
                };

                videoGallery.open();

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.video.findProcessUrl).toHaveBeenCalledWith('/path/to/video.mp4');
                expect(mockEditor.plugins.video.modalInit).toHaveBeenCalled();
                expect(mockEditor.plugins.video.createVideoTag).toHaveBeenCalledWith({ poster: '/thumb.jpg' });
                expect(mockEditor.plugins.video.create).toHaveBeenCalledWith(
                    '<video></video>',
                    'processed-url',
                    null,
                    '560px',
                    '315px',
                    false,
                    { name: 'test-video.mp4', size: 0 },
                    true
                );
            });

            it('should use iframe tag for iframe frame type', () => {
                const mockTarget = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-name') return 'test-video.mp4';
                        if (attr === 'data-command') return '/path/to/video.mp4';
                        if (attr === 'data-frame') return 'iframe';
                        if (attr === 'data-thumbnail') return '/thumb.jpg';
                        return '';
                    })
                };

                videoGallery.open();

                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.video.createIframeTag).toHaveBeenCalledWith({ poster: '/thumb.jpg' });
                expect(mockEditor.plugins.video.create).toHaveBeenCalledWith(
                    '<iframe></iframe>',
                    'processed-url',
                    null,
                    '560px',
                    '315px',
                    false,
                    { name: 'test-video.mp4', size: 0 },
                    true
                );
            });

            it('should handle URL without processing when findProcessUrl returns null', () => {
                mockEditor.plugins.video.findProcessUrl.mockReturnValue(null);

                const mockTarget = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-name') return 'test-video.mp4';
                        if (attr === 'data-command') return '/original-url.mp4';
                        if (attr === 'data-frame') return 'video';
                        if (attr === 'data-thumbnail') return '/thumb.jpg';
                        return '';
                    })
                };

                videoGallery.open();

                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.video.create).toHaveBeenCalledWith(
                    '<video></video>',
                    '/original-url.mp4',
                    null,
                    '560px',
                    '315px',
                    false,
                    { name: 'test-video.mp4', size: 0 },
                    true
                );
            });
        });
    });

    describe('Browser integration', () => {
        it('should create Browser with correct options', () => {
            const { Browser } = require('../../../../src/modules/contract');
            const constructorCall = Browser.mock.calls[0];

            expect(constructorCall[0]).toBe(videoGallery); // instance
            expect(constructorCall[1]).toMatchObject({
                title: 'Video Gallery',
                columnSize: 4,
                className: 'se-video-gallery',
                props: ['frame']
            });
            expect(constructorCall[1].selectorHandler).toBeInstanceOf(Function);
            expect(constructorCall[1].thumbnail).toBeInstanceOf(Function);
        });

        it('should pass plugin options to Browser', () => {
            const pluginOptions = {
                data: [{ url: '/test.mp4' }],
                url: '/api/test',
                headers: { 'Test-Header': 'test' }
            };

            new VideoGallery(mockEditor, pluginOptions);

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
                new VideoGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing video plugin gracefully', () => {
            mockEditor.plugins.video = {
                pluginOptions: {
                    defaultWidth: 'auto',
                    defaultHeight: 'auto'
                }
            };

            expect(() => {
                new VideoGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle item selection with missing data attributes', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue(null)
            };

            videoGallery.open();

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[0][1];
            const selectorHandler = browserOptions.selectorHandler;

            expect(() => {
                selectorHandler(mockTarget);
            }).not.toThrow();
        });
    });
});