/**
 * @fileoverview Unit tests for plugins/browser/audioGallery.js
 */

import AudioGallery from '../../../../src/plugins/browser/audioGallery.js';

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
        this.focusManager = editor.focusManager;
		this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Browser - AudioGallery', () => {
    let mockEditor;
    let audioGallery;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                audioGallery: 'Audio Gallery'
            },
            icons: {
                audio_thumbnail: '🎵'
            },
            plugins: {
                audio: {
                    modalInit: jest.fn(),
                    submitURL: jest.fn()
                }
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        const pluginOptions = {
            data: [
                { url: '/audio1.mp3', name: 'audio1.mp3' },
                { url: '/audio2.mp3', name: 'audio2.mp3' }
            ],
            url: '/api/audios',
            headers: { 'Authorization': 'Bearer token' },
            thumbnail: '/default-audio-thumbnail.jpg'
        };

        audioGallery = new AudioGallery(mockEditor, pluginOptions);
    });

    describe('Constructor', () => {
        it('should create AudioGallery instance with required properties', () => {
            expect(audioGallery).toBeInstanceOf(AudioGallery);
            expect(audioGallery.title).toBe('Audio Gallery');
            expect(audioGallery.icon).toBe('audio_gallery');
            expect(audioGallery.browser).toBeDefined();
            expect(audioGallery.onSelectfunction).toBeNull();
        });

        it('should initialize with plugin options', () => {
            const pluginOptions = {
                data: [{ url: '/test.mp3', name: 'test.mp3' }],
                url: '/custom/api',
                headers: { 'Custom-Header': 'value' }
            };

            const gallery = new AudioGallery(mockEditor, pluginOptions);
            expect(gallery).toBeInstanceOf(AudioGallery);
        });

        it('should handle string thumbnail', () => {
            const pluginOptions = {
                thumbnail: '/custom-thumbnail.jpg'
            };

            new AudioGallery(mockEditor, pluginOptions);

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

            new AudioGallery(mockEditor, pluginOptions);

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail).toBe(thumbnailFn);
        });

        it('should use default icon thumbnail when no thumbnail provided', () => {
            new AudioGallery(mockEditor, {});

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[Browser.mock.calls.length - 1][1];

            expect(browserOptions.thumbnail()).toBe('🎵');
        });
    });

    describe('Public methods', () => {
        describe('open', () => {
            it('should open browser without onSelectfunction', () => {
                audioGallery.open();

                expect(audioGallery.onSelectfunction).toBeUndefined();
                expect(mockBrowser.open).toHaveBeenCalled();
            });

            it('should open browser with custom onSelectfunction', () => {
                const customHandler = jest.fn();
                audioGallery.open(customHandler);

                expect(audioGallery.onSelectfunction).toBe(customHandler);
                expect(mockBrowser.open).toHaveBeenCalled();
            });
        });

        describe('close', () => {
            it('should close browser and reset onSelectfunction', () => {
                const customHandler = jest.fn();
                audioGallery.open(customHandler);

                expect(audioGallery.onSelectfunction).toBe(customHandler);

                audioGallery.close();

                expect(audioGallery.onSelectfunction).toBeNull();
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
                    alt: 'Test audio'
                };

                audioGallery.open(customHandler);

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(customHandler).toHaveBeenCalledWith(mockTarget);
                expect(mockEditor.plugins.audio.modalInit).not.toHaveBeenCalled();
                expect(mockEditor.plugins.audio.submitURL).not.toHaveBeenCalled();
            });
        });

        describe('without custom onSelectfunction', () => {
            it('should use default audio creation', () => {
                const mockTarget = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-command') return '/path/to/audio.mp3';
                        return '';
                    })
                };

                audioGallery.open();

                // Get the selectorHandler from Browser constructor
                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.audio.modalInit).toHaveBeenCalled();
                expect(mockEditor.plugins.audio.submitURL).toHaveBeenCalledWith('/path/to/audio.mp3');
            });

            it('should handle null data-command attribute', () => {
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue(null)
                };

                audioGallery.open();

                const browserConstructorCall = require('../../../../src/modules/contract').Browser.mock.calls[0];
                const browserOptions = browserConstructorCall[1];
                const selectorHandler = browserOptions.selectorHandler;

                selectorHandler(mockTarget);

                expect(mockEditor.plugins.audio.modalInit).toHaveBeenCalled();
                expect(mockEditor.plugins.audio.submitURL).toHaveBeenCalledWith(null);
            });
        });
    });

    describe('Browser integration', () => {
        it('should create Browser with correct options', () => {
            const { Browser } = require('../../../../src/modules/contract');
            const constructorCall = Browser.mock.calls[0];

            expect(constructorCall[0]).toBe(audioGallery); // instance
            expect(constructorCall[1]).toMatchObject({
                title: 'Audio Gallery',
                columnSize: 4,
                className: 'se-audio-gallery'
            });
            expect(constructorCall[1].selectorHandler).toBeInstanceOf(Function);
            expect(constructorCall[1].thumbnail).toBeInstanceOf(Function);
        });

        it('should pass plugin options to Browser', () => {
            const pluginOptions = {
                data: [{ url: '/test.mp3' }],
                url: '/api/test',
                headers: { 'Test-Header': 'test' }
            };

            new AudioGallery(mockEditor, pluginOptions);

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
                new AudioGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing audio plugin gracefully', () => {
            mockEditor.plugins.audio = undefined;

            expect(() => {
                new AudioGallery(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle item selection with missing audio plugin', () => {
            mockEditor.plugins.audio = undefined;
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('/test.mp3')
            };

            audioGallery.open();

            const { Browser } = require('../../../../src/modules/contract');
            const browserOptions = Browser.mock.calls[0][1];
            const selectorHandler = browserOptions.selectorHandler;

            expect(() => {
                selectorHandler(mockTarget);
            }).toThrow();
        });
    });
});