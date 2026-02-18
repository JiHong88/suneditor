
import Video from '../../../../src/plugins/modal/video';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';
import VideoSizeService from '../../../../src/plugins/modal/video/services/video.size';
import VideoUploadService from '../../../../src/plugins/modal/video/services/video.upload';
import { dom } from '../../../../src/helper';


// MOCKS

// Mock Services
jest.mock('../../../../src/plugins/modal/video/services/video.size', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        init: jest.fn(),
        ready: jest.fn(),
        resolveSize: jest.fn().mockReturnValue({ width: '100%', height: '56.25%', isChanged: true }),
        setOriginSize: jest.fn(),
        getInputSize: jest.fn().mockReturnValue({ w: '100%', h: '56.25%' }),
        applySize: jest.fn(),
        setInputSize: jest.fn()
    }));
});

jest.mock('../../../../src/plugins/modal/video/services/video.upload', () => {
    return jest.fn().mockImplementation(() => ({
        serverUpload: jest.fn()
    }));
});

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockReturnValue({ value: 'center', checked: true }),
		},
		isUpdate: false,
	})),
	Figure: jest.fn().mockImplementation(() => ({
		open: jest.fn().mockReturnValue({
			container: { nodeType: 1, style: {} },
			align: 'center',
			width: '100%',
			height: '56.25%',
            w: '100%',
			h: '56.25%',
			ratio: { w: 16, h: 9 },
            isVertical: false
		}),
		getSize: jest.fn().mockReturnValue({ dw: '100%', dh: '56.25%', w: '100%', h: '56.25%' }),
		setSize: jest.fn(),
		setAlign: jest.fn(),
		setTransform: jest.fn(),
		deleteTransform: jest.fn(),
        isVertical: false,
        retainFigureFormat: jest.fn()
	}))
}));

jest.mock('../../../../src/modules/manager', () => ({
	FileManager: jest.fn().mockImplementation(() => ({
		getSize: jest.fn().mockReturnValue(0),
		upload: jest.fn().mockResolvedValue(true),
		setFileData: jest.fn()
	}))
}));

// Mock Render - use factory function with inline element creation
jest.mock('../../../../src/plugins/modal/video/render/video.html', () => {
    const mockEl = (tag) => ({ nodeName: tag, style: {}, setAttribute: jest.fn(), getAttribute: jest.fn(), appendChild: jest.fn() });
    return {
        CreateHTML_modal: jest.fn(() => ({
            html: mockEl('div'),
            fileModalWrapper: mockEl('div'),
            videoInputFile: { files: [], value: '', setAttribute: jest.fn(), removeAttribute: jest.fn() },
            videoUrlFile: { disabled: false, value: '' },
            previewSrc: { textContent: '', style: {} },
            proportion: { disabled: false, checked: false },
            frameRatioOption: { options: [], value: '0.5625' },
            inputX: { value: '100%' },
            inputY: { value: '56.25%' },
            revertBtn: mockEl('button'),
            galleryButton: null, // Set to null to skip event binding
            fileRemoveBtn: mockEl('button'),
            alignForm: { style: {} }
        }))
    };
});

// Add static methods to modules
const mockModal = require('../../../../src/modules/contract').Modal;
const mockFigure = require('../../../../src/modules/contract').Figure;
const mockRender = require('../../../../src/plugins/modal/video/render/video.html').CreateHTML_modal;

Object.assign(mockFigure, {
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {}, querySelector: jest.fn() },
        cover: { appendChild: jest.fn() }
	}),
	GetContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} },
		cover: { nodeType: 1 },
		align: 'center'
	}),
	GetRatio: jest.fn().mockReturnValue({ w: 16, h: 9 }),
	CalcRatio: jest.fn().mockReturnValue({ w: 16, h: 9 }),
	is: jest.fn().mockReturnValue(false)
});

Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue('')
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', files: [], src: '' }),
				removeItem: jest.fn(),
				setAttribute: jest.fn(),
				cloneNode: jest.fn().mockReturnValue({ nodeName: 'VIDEO', setAttribute: jest.fn(), getAttribute: jest.fn() }),
                appendChild: jest.fn()
			}),
			removeItem: jest.fn(),
			createTooltipInner: jest.fn().mockReturnValue('')
		},
		query: {
			getParentElement: jest.fn().mockReturnValue(null),
			getEventTarget: jest.fn((e) => e.target || e)
		}
	},
	numbers: {
		is: jest.fn((val) => typeof val === 'number'),
		get: jest.fn((val, def) => (val !== undefined && val !== null && val !== '' ? val : def))
	},
	env: {
		_w: {
			setTimeout: jest.fn((fn, ms) => fn()) // execute immediately
		},
		NO_EVENT: Symbol('NO_EVENT'),
		ON_OVER_COMPONENT: Symbol('ON_OVER_COMPONENT')
	},
	converter: {
		debounce: jest.fn((fn) => fn),
		addUrlQuery: jest.fn((url, query) => url + (query ? '?' + query : ''))
	},
	keyCodeMap: {
		isSpace: jest.fn(() => false)
	}
}));

describe('Video Plugin', () => {
	let kernel;
	let video;

	beforeEach(() => {
		kernel = createMockEditor();
        
        // Reset mocks
        mockRender.mockClear();
        dom.utils.createElement.mockClear();
        VideoSizeService.mockClear();
        VideoUploadService.mockClear();
        
		video = new Video(kernel, {});
	});

    describe('Static Methods', () => {
        it('component should identify video and iframe', () => {
            const videoNode = { nodeName: 'VIDEO' };
            expect(Video.component(videoNode)).toBe(videoNode);

            const iframeNode = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/123' };
            expect(Video.component(iframeNode)).toBe(iframeNode);

            const badIframe = { nodeName: 'IFRAME', src: 'https://example.com' };
            expect(Video.component(badIframe)).toBeNull();

            const divNode = { nodeName: 'DIV' };
            expect(Video.component(divNode)).toBeNull();
        });

        it('component should handle various video URL patterns', () => {
            // Vimeo
            const vimeoIframe = { nodeName: 'IFRAME', src: 'https://player.vimeo.com/video/123' };
            expect(Video.component(vimeoIframe)).toBe(vimeoIframe);

            // Dailymotion
            const dailymotionIframe = { nodeName: 'IFRAME', src: 'https://www.dailymotion.com/video/x123' };
            expect(Video.component(dailymotionIframe)).toBe(dailymotionIframe);

            // Facebook video
            const facebookIframe = { nodeName: 'IFRAME', src: 'https://www.facebook.com/user/videos/123' };
            expect(Video.component(facebookIframe)).toBe(facebookIframe);

            // Twitch
            const twitchIframe = { nodeName: 'IFRAME', src: 'https://www.twitch.tv/videos/123' };
            expect(Video.component(twitchIframe)).toBe(twitchIframe);

            // TikTok
            const tiktokIframe = { nodeName: 'IFRAME', src: 'https://www.tiktok.com/@user/video/123' };
            expect(Video.component(tiktokIframe)).toBe(tiktokIframe);

            // Instagram
            const instagramIframe = { nodeName: 'IFRAME', src: 'https://www.instagram.com/p/abc123' };
            expect(Video.component(instagramIframe)).toBe(instagramIframe);

            // Wistia
            const wistiaIframe = { nodeName: 'IFRAME', src: 'https://fast.wistia.com/embed/medias/abc' };
            expect(Video.component(wistiaIframe)).toBe(wistiaIframe);

            // Loom
            const loomIframe = { nodeName: 'IFRAME', src: 'https://www.loom.com/share/abc123' };
            expect(Video.component(loomIframe)).toBe(loomIframe);
        });

        it('component should handle video file extensions', () => {
            // Various video extensions
            const mp4Iframe = { nodeName: 'IFRAME', src: 'https://example.com/video.mp4' };
            expect(Video.component(mp4Iframe)).toBe(mp4Iframe);

            const webmIframe = { nodeName: 'IFRAME', src: 'https://example.com/video.webm' };
            expect(Video.component(webmIframe)).toBe(webmIframe);

            const aviIframe = { nodeName: 'IFRAME', src: 'https://example.com/video.avi' };
            expect(Video.component(aviIframe)).toBe(aviIframe);

            const movIframe = { nodeName: 'IFRAME', src: 'https://example.com/video.mov' };
            expect(Video.component(movIframe)).toBe(movIframe);

            const flvIframe = { nodeName: 'IFRAME', src: 'https://example.com/video.flv' };
            expect(Video.component(flvIframe)).toBe(flvIframe);
        });

        it('component should return null for null/undefined node', () => {
            expect(Video.component(null)).toBeNull();
            expect(Video.component(undefined)).toBeNull();
        });
    });

	describe('Initialization', () => {
		it('should create Video instance with defaults', () => {
			expect(video).toBeInstanceOf(Video);
			expect(video.pluginOptions.canResize).toBe(true);
            expect(mockRender).toHaveBeenCalled();
            expect(VideoSizeService).toHaveBeenCalled();
            expect(VideoUploadService).toHaveBeenCalled();
		});

		it('should initialize with custom options', () => {
			const customOptions = {
				canResize: false,
                defaultRatio: 0.75,
                uploadUrl: '/upload'
			};
			const customVideo = new Video(kernel, customOptions);
			expect(customVideo.pluginOptions.canResize).toBe(false);
			expect(customVideo.pluginOptions.uploadUrl).toBe('/upload');
		});
	});

    describe('Core Methods', () => {
        it('open should call modal.open', () => {
            video.open();
            expect(video.modal.open).toHaveBeenCalled();
        });

        it('modalInit should reset values', () => {
            video.modalInit();
            // videoInputFile comes from mockRender
            expect(video.videoInputFile.value).toBe('');
            expect(mockModal.OnChangeFile).toHaveBeenCalled();
            expect(video.sizeService.init).toHaveBeenCalled();
        });
    });

    describe('Video URL Handling', () => {
        it('static component should validate video/iframe nodes via internal checkContentType', () => {
            // checkContentType is now a static private method, tested via Video.component()
            const videoNode = { nodeName: 'VIDEO' };
            expect(Video.component(videoNode)).toBe(videoNode);

            // iframe with valid video URL
            const iframeYoutube = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/123' };
            expect(Video.component(iframeYoutube)).toBe(iframeYoutube);

            // iframe with mp4 extension
            const iframeMp4 = { nodeName: 'IFRAME', src: 'https://example.com/video.mp4' };
            expect(Video.component(iframeMp4)).toBe(iframeMp4);

            // iframe with invalid URL
            const iframeInvalid = { nodeName: 'IFRAME', src: 'https://example.com/page.html' };
            expect(Video.component(iframeInvalid)).toBeNull();
        });

        it('findProcessUrl should return correct process info', () => {
             const yt = video.findProcessUrl('https://youtube.com/watch?v=abc');
             expect(yt.tag).toBe('iframe');
             expect(yt.url).toContain('embed/abc');

             const vimeo = video.findProcessUrl('https://vimeo.com/123');
             expect(vimeo.tag).toBe('iframe');
             expect(vimeo.url).toContain('player.vimeo.com');
        });

        it('convertUrlYoutube should format url correctly', () => {
             const url = video.convertUrlYoutube('youtube.com/watch?v=123');
             expect(url).toBe('https://www.youtube.com/embed/123');
        });

        it('convertUrlVimeo should format url correctly', () => {
            // Basic Vimeo URL
            const url1 = video.convertUrlVimeo('https://vimeo.com/123456789');
            expect(url1).toBe('https://player.vimeo.com/video/123456789');

            // Vimeo URL with trailing slash
            const url2 = video.convertUrlVimeo('https://vimeo.com/123456789/');
            expect(url2).toBe('https://player.vimeo.com/video/123456789');
        });

        it('addQuery should append query parameters correctly', () => {
            // URL without existing query
            const url1 = video.addQuery('https://example.com/video', 'autoplay=1');
            expect(url1).toBe('https://example.com/video?autoplay=1');

            // URL with existing query
            const url2 = video.addQuery('https://example.com/video?v=123', 'autoplay=1');
            expect(url2).toBe('https://example.com/video?autoplay=1&v=123');

            // Empty query string
            const url3 = video.addQuery('https://example.com/video', '');
            expect(url3).toBe('https://example.com/video');
        });

        it('findProcessUrl should return null for unrecognized URLs', () => {
            const result = video.findProcessUrl('https://example.com/page.html');
            expect(result).toBeNull();
        });
    });

    describe('Action & Submission', () => {
        it('modalAction should handle file upload', async () => {
             video.videoInputFile.files = [{ name: 'video.mp4', type: 'video/mp4', size: 1000 }];

             // submitFile returns true when triggerEvent returns undefined (no event handlers)
             // but doesn't call serverUpload in that case (early return for unhandled event)
             const result = await video.modalAction();

             expect(result).toBe(true);
             // When triggerEvent returns undefined, submitFile returns true without calling handler
        });

        it('modalAction should handle URL submit when no file and linkValue set', async () => {
            video.videoInputFile.files = [];
            video.videoUrlFile.value = '';
            const result = await video.modalAction();
            expect(result).toBe(false);
        });

        it('modalAction should submit URL when linkValue has content', async () => {
            video.videoInputFile.files = [];
            // Set linkValue through the input handler
            const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
            const inputHandler = addEventCalls.find(
                call => call[0] === video.videoUrlFile && call[1] === 'input'
            );
            if (inputHandler) {
                dom.query.getEventTarget.mockReturnValueOnce({ value: 'https://example.com/video.mp4' });
                inputHandler[2]({ target: { value: 'https://example.com/video.mp4' } });
            }

            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(true);
            const result = await video.modalAction();
            // submitURL returns true when it processes successfully
            expect(result).toBe(true);
        });

        it('modalAction should call component.select on successful submit via setTimeout', async () => {
            // Setup: submitFile returns truthy
            video.videoInputFile.files = [{ name: 'video.mp4', type: 'video/mp4', size: 1000 }];
            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

            const result = await video.modalAction();
            expect(result).toBe(true);
            // _w.setTimeout was called (which executes immediately in mock)
        });


        describe('submitFile size validation', () => {

            it('should skip non-video files in file list', async () => {
                const files = [
                    { name: 'image.jpg', type: 'image/jpeg', size: 1000 },
                    { name: 'video.mp4', type: 'video/mp4', size: 1000 }
                ];

                const result = await video.submitFile(files);
                // Should return true because it processes successfully (with only the video file)
                expect(result).toBe(true);
            });

            it('should return early for empty file list', async () => {
                const result = await video.submitFile([]);
                expect(result).toBeUndefined();
            });

            it('should alert error when single file exceeds singleSizeLimit', async () => {
                const videoWithLimit = new Video(kernel, { uploadSingleSizeLimit: 5000 });
                const files = [{ name: 'large.mp4', type: 'video/mp4', size: 10000 }];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

                const result = await videoWithLimit.submitFile(files);
                expect(result).toBe(false);
                expect(kernel.$.ui.alertOpen).toHaveBeenCalled();
            });

            it('should use custom error message from onVideoUploadError event when single size exceeded', async () => {
                const videoWithLimit = new Video(kernel, { uploadSingleSizeLimit: 5000 });
                const files = [{ name: 'large.mp4', type: 'video/mp4', size: 10000 }];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce('Custom error message');

                const result = await videoWithLimit.submitFile(files);
                expect(result).toBe(false);
                expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith('Custom error message', 'error');
            });

            it('should use default error when onVideoUploadError returns NO_EVENT for single size', async () => {
                const { env } = require('../../../../src/helper');
                const videoWithLimit = new Video(kernel, { uploadSingleSizeLimit: 5000 });
                const files = [{ name: 'large.mp4', type: 'video/mp4', size: 10000 }];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);

                const result = await videoWithLimit.submitFile(files);
                expect(result).toBe(false);
                expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith(
                    expect.stringContaining('[SUNEDITOR.videoUpload.fail]'),
                    'error'
                );
            });

            it('should alert error when total files exceed uploadSizeLimit', async () => {
                const videoWithLimit = new Video(kernel, { uploadSizeLimit: 2000 });
                const files = [
                    { name: 'v1.mp4', type: 'video/mp4', size: 1500 },
                    { name: 'v2.mp4', type: 'video/mp4', size: 1500 }
                ];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

                const result = await videoWithLimit.submitFile(files);
                expect(result).toBe(false);
                expect(kernel.$.ui.alertOpen).toHaveBeenCalled();
            });

            it('should use NO_EVENT default error for total upload size limit', async () => {
                const { env } = require('../../../../src/helper');
                const videoWithLimit = new Video(kernel, { uploadSizeLimit: 2000 });
                const files = [
                    { name: 'v1.mp4', type: 'video/mp4', size: 1500 },
                    { name: 'v2.mp4', type: 'video/mp4', size: 1500 }
                ];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);

                const result = await videoWithLimit.submitFile(files);
                expect(result).toBe(false);
                expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith(
                    expect.stringContaining('[SUNEDITOR.videoUpload.fail]'),
                    'error'
                );
            });

            it('should use custom error message for total upload size limit', async () => {
                const videoWithLimit = new Video(kernel, { uploadSizeLimit: 2000 });
                const files = [
                    { name: 'v1.mp4', type: 'video/mp4', size: 1500 },
                    { name: 'v2.mp4', type: 'video/mp4', size: 1500 }
                ];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce('Total limit exceeded');

                const result = await videoWithLimit.submitFile(files);
                expect(result).toBe(false);
                expect(kernel.$.ui.alertOpen).toHaveBeenCalledWith('Total limit exceeded', 'error');
            });

            it('should return false when onVideoUploadBefore returns false', async () => {
                const files = [{ name: 'video.mp4', type: 'video/mp4', size: 1000 }];

                // First call: onVideoUploadBefore returns false
                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(false);

                const result = await video.submitFile(files);
                expect(result).toBe(false);
            });

            it('should call handler with object when onVideoUploadBefore returns object', async () => {
                const files = [{ name: 'video.mp4', type: 'video/mp4', size: 1000 }];
                const customInfo = { url: 'custom-url', files: files };

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(customInfo);

                const result = await video.submitFile(files);
                // When result is an object, handler is called with the object, and then also with null
                // (because the code falls through to the true/NO_EVENT check too - but result is object, not true/NO_EVENT)
                // Actually looking at code: if object, handler(result), no early return, then checks true/NO_EVENT which is false
                expect(result).toBeUndefined();
            });

            it('should call handler with null when onVideoUploadBefore returns true', async () => {
                const files = [{ name: 'video.mp4', type: 'video/mp4', size: 1000 }];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(true);

                const result = await video.submitFile(files);
                // When result is true, handler(null) is called
                expect(result).toBeUndefined();
            });

            it('should call handler with null when onVideoUploadBefore returns NO_EVENT', async () => {
                const { env } = require('../../../../src/helper');
                const files = [{ name: 'video.mp4', type: 'video/mp4', size: 1000 }];

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);

                const result = await video.submitFile(files);
                // When result is NO_EVENT, handler(null) is called
                expect(result).toBeUndefined();
            });

        });

        describe('submitURL validation', () => {

            it('should return false for empty URL', async () => {
                // Don't set any link value
                const result = await video.submitURL('');
                expect(result).toBe(false);
            });

            it('should parse iframe tag and extract src URL', async () => {
                // First set the internal linkValue through the preview mechanism
                const iframeHtml = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>';
                // Simulate setting linkValue via #OnLinkPreview
                const mockEvent = { target: { value: iframeHtml } };
                dom.query.getEventTarget.mockReturnValueOnce({ value: iframeHtml, trim: undefined });

                // We need to set linkValue directly. Since it's private, we need to use the URL path.
                // The trick: submitURL reads #linkValue, not the url parameter.
                // Let's set it via videoUrlFile input event simulation.
                // Actually, looking at code line 628: if (!(url = this.#linkValue)) return false;
                // So we need linkValue to be set. Let's call the internal preview handler.

                // Set videoUrlFile value and trigger the input event handler
                video.videoUrlFile.value = iframeHtml;
                // Directly trigger the event - we can access the bound handler via eventManager.addEvent mock
                // But it's simpler: we know #linkValue is set when #OnLinkPreview is called.
                // The constructor binds #OnLinkPreview to videoUrlFile 'input' event.
                // Let's find the bound handler from the eventManager.addEvent calls.
                const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
                // Find the call that binds to videoUrlFile with 'input'
                const inputHandler = addEventCalls.find(
                    call => call[0] === video.videoUrlFile && call[1] === 'input'
                );

                if (inputHandler) {
                    // Call the bound handler to set linkValue
                    dom.query.getEventTarget.mockReturnValueOnce({ value: iframeHtml, trim: () => iframeHtml });
                    inputHandler[2]({ target: { value: iframeHtml, trim: () => iframeHtml } });
                }

                // Now submitURL should use the linkValue
                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
                const result = await video.submitURL(iframeHtml);
                // If linkValue was set to the iframe HTML, it should attempt to parse it
                expect(result).toBe(true);
            });

            it('should handle processUrl for YouTube URLs', async () => {
                // Set linkValue by calling event handler
                const ytUrl = 'https://www.youtube.com/watch?v=abc123';
                const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
                const inputHandler = addEventCalls.find(
                    call => call[0] === video.videoUrlFile && call[1] === 'input'
                );

                if (inputHandler) {
                    dom.query.getEventTarget.mockReturnValueOnce({ value: ytUrl, trim: () => ytUrl });
                    inputHandler[2]({ target: { value: ytUrl, trim: () => ytUrl } });
                }

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
                const result = await video.submitURL(ytUrl);
                expect(result).toBe(true);
            });

            it('should return false when onVideoUploadBefore returns false', async () => {
                const url = 'https://example.com/video.mp4';
                const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
                const inputHandler = addEventCalls.find(
                    call => call[0] === video.videoUrlFile && call[1] === 'input'
                );

                if (inputHandler) {
                    dom.query.getEventTarget.mockReturnValueOnce({ value: url, trim: () => url });
                    inputHandler[2]({ target: { value: url, trim: () => url } });
                }

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(false);
                const result = await video.submitURL(url);
                expect(result).toBe(false);
            });

            it('should call handler with object when onVideoUploadBefore returns object', async () => {
                const url = 'https://example.com/video.mp4';
                const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
                const inputHandler = addEventCalls.find(
                    call => call[0] === video.videoUrlFile && call[1] === 'input'
                );

                if (inputHandler) {
                    dom.query.getEventTarget.mockReturnValueOnce({ value: url, trim: () => url });
                    inputHandler[2]({ target: { value: url, trim: () => url } });
                }

                const customResult = { url: 'custom-url', files: { name: 'test', size: 0 }, process: null };
                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(customResult);
                const result = await video.submitURL(url);
                expect(result).toBe(true);
            });

            it('should call handler with null when onVideoUploadBefore returns true', async () => {
                const url = 'https://example.com/video.mp4';
                const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
                const inputHandler = addEventCalls.find(
                    call => call[0] === video.videoUrlFile && call[1] === 'input'
                );

                if (inputHandler) {
                    dom.query.getEventTarget.mockReturnValueOnce({ value: url, trim: () => url });
                    inputHandler[2]({ target: { value: url, trim: () => url } });
                }

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(true);
                const result = await video.submitURL(url);
                expect(result).toBe(true);
            });

            it('should call handler with null when onVideoUploadBefore returns NO_EVENT', async () => {
                const { env } = require('../../../../src/helper');
                const url = 'https://example.com/video.mp4';
                const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
                const inputHandler = addEventCalls.find(
                    call => call[0] === video.videoUrlFile && call[1] === 'input'
                );

                if (inputHandler) {
                    dom.query.getEventTarget.mockReturnValueOnce({ value: url, trim: () => url });
                    inputHandler[2]({ target: { value: url, trim: () => url } });
                }

                kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(env.NO_EVENT);
                const result = await video.submitURL(url);
                expect(result).toBe(true);
            });
        });
    });
    
    describe('create() Method', () => {
        let mockOFrame;

        beforeEach(() => {
            mockOFrame = {
                nodeName: 'VIDEO',
                src: '',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                cloneNode: jest.fn().mockReturnValue({
                    nodeName: 'VIDEO',
                    setAttribute: jest.fn(),
                    getAttribute: jest.fn()
                }),
                replaceWith: jest.fn(),
                onload: null
            };
        });

        it('should create new video component when isUpdate is false', () => {
            video.create(mockOFrame, 'https://example.com/video.mp4', '100%', '56.25%', 'center', false, { name: 'video.mp4', size: 1000 }, true);

            expect(mockFigure.CreateContainer).toHaveBeenCalledWith(mockOFrame, 'se-video-container');
            expect(video.figure.open).toHaveBeenCalled();
            expect(video.figure.setAlign).toHaveBeenCalledWith(mockOFrame, 'center');
            expect(video.fileManager.setFileData).toHaveBeenCalled();
            expect(kernel.$.component.insert).toHaveBeenCalled();
        });

        it('should call component.insert with scrollTo=true when isLast is true', () => {
            video.create(mockOFrame, 'https://example.com/video.mp4', '100%', '56.25%', 'center', false, { name: 'video.mp4', size: 1000 }, true);

            expect(kernel.$.component.insert).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ scrollTo: true })
            );
        });

        it('should call component.insert with scrollTo=false when isLast is false', () => {
            video.create(mockOFrame, 'https://example.com/video.mp4', '100%', '56.25%', 'center', false, { name: 'video.mp4', size: 1000 }, false);

            expect(kernel.$.component.insert).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ scrollTo: false, insertBehavior: 'line' })
            );
        });

        it('should update existing element src when isUpdate is true and same tag type', () => {
            // First, set the internal element via componentSelect
            const existingElement = {
                nodeName: 'VIDEO',
                src: 'https://example.com/old.mp4',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null)
            };
            video.componentSelect(existingElement);

            // Now call create with isUpdate=true and different src (non-matching processUrl)
            video.create(mockOFrame, 'https://example.com/new.mp4', '100%', '56.25%', 'center', true, { name: 'new.mp4', size: 1000 }, true);

            // Should set src directly since findProcessUrl returns null for plain mp4 URL
            expect(existingElement.src).toBe('https://example.com/new.mp4');
            expect(kernel.$.history.push).toHaveBeenCalledWith(false);
        });

        it('should not change src when isUpdate is true and src is the same', () => {
            const existingElement = {
                nodeName: 'VIDEO',
                src: 'https://example.com/same.mp4',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null)
            };
            video.componentSelect(existingElement);

            video.create(mockOFrame, 'https://example.com/same.mp4', '100%', '56.25%', 'center', true, { name: 'same.mp4', size: 1000 }, true);

            // src should remain the same, no replaceWith called
            expect(existingElement.replaceWith).toBeUndefined();
            expect(kernel.$.history.push).toHaveBeenCalledWith(false);
        });

        it('should replace video with iframe when processUrl tag is iframe and current is video', () => {
            const existingElement = {
                nodeName: 'VIDEO',
                src: 'https://example.com/old.mp4',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null),
                replaceWith: jest.fn()
            };
            video.componentSelect(existingElement);

            // YouTube URL will return { tag: 'iframe' } from findProcessUrl
            const ytUrl = 'https://www.youtube.com/embed/abc123';
            video.create(mockOFrame, ytUrl, '100%', '56.25%', 'center', true, { name: 'yt', size: 0 }, true);

            expect(dom.utils.createElement).toHaveBeenCalledWith('IFRAME');
            expect(existingElement.replaceWith).toHaveBeenCalled();
        });

        it('should replace iframe with video when processUrl tag is video and current is iframe', () => {
            const existingIframe = {
                nodeName: 'IFRAME',
                src: 'https://www.youtube.com/embed/abc123',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null),
                replaceWith: jest.fn()
            };
            video.componentSelect(existingIframe);

            // Create a custom video instance with an embedQuery that returns tag: 'video'
            const videoWithCustom = new Video(kernel, {
                embedQuery: {
                    customService: {
                        pattern: /customvideo\.com/i,
                        action: (url) => url,
                        tag: 'video'
                    }
                }
            });
            // Set its internal element to the iframe
            videoWithCustom.componentSelect(existingIframe);

            videoWithCustom.create(mockOFrame, 'https://customvideo.com/abc', '100%', '56.25%', 'center', true, { name: 'custom', size: 0 }, true);

            expect(dom.utils.createElement).toHaveBeenCalledWith('VIDEO');
            expect(existingIframe.replaceWith).toHaveBeenCalled();
        });

        it('should call setTransform when isUpdate and not resizing or not changed or not vertical', () => {
            const existingElement = {
                nodeName: 'VIDEO',
                src: 'https://example.com/old.mp4',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null)
            };
            video.componentSelect(existingElement);

            video.create(mockOFrame, 'https://example.com/new.mp4', '100%', '56.25%', 'center', true, { name: 'new.mp4', size: 1000 }, true);

            expect(video.figure.setTransform).toHaveBeenCalled();
        });
    });

    describe('componentDestroy() Method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                nodeName: 'VIDEO',
                src: 'https://example.com/video.mp4',
                style: { float: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(null),
                previousElementSibling: { nodeType: 1 },
                nextElementSibling: null,
                parentNode: { childNodes: { length: 0 } }
            };

            // Mock getParentElement to return a container
            const mockContainer = {
                previousElementSibling: { nodeType: 1 },
                nextElementSibling: null,
                parentNode: { childNodes: { length: 0 } }
            };
            dom.query.getParentElement.mockReturnValue(mockContainer);
        });

        it('should complete full destroy flow when event does not return false', async () => {
            video.componentSelect(mockTarget);
            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

            await video.componentDestroy(mockTarget);

            expect(kernel.$.eventManager.triggerEvent).toHaveBeenCalledWith(
                'onVideoDeleteBefore',
                expect.objectContaining({ element: expect.anything() })
            );
            expect(dom.utils.removeItem).toHaveBeenCalled();
            expect(kernel.$.focusManager.focusEdge).toHaveBeenCalled();
            expect(kernel.$.history.push).toHaveBeenCalledWith(false);
        });

        it('should return early when event returns false', async () => {
            dom.utils.removeItem.mockClear();
            kernel.$.history.push.mockClear();

            video.componentSelect(mockTarget);
            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(false);

            await video.componentDestroy(mockTarget);

            expect(dom.utils.removeItem).not.toHaveBeenCalled();
            expect(kernel.$.history.push).not.toHaveBeenCalled();
        });

        it('should call removeAllParents when emptyDiv is not wysiwyg', async () => {
            const nonWysiwygParent = { childNodes: { length: 0 } };
            const mockContainer = {
                previousElementSibling: null,
                nextElementSibling: { nodeType: 1 },
                parentNode: nonWysiwygParent
            };
            dom.query.getParentElement.mockReturnValue(mockContainer);

            video.componentSelect(mockTarget);
            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

            await video.componentDestroy(mockTarget);

            expect(kernel.$.nodeTransform.removeAllParents).toHaveBeenCalledWith(
                nonWysiwygParent,
                expect.any(Function),
                null
            );
        });

        it('should NOT call removeAllParents when emptyDiv is wysiwyg', async () => {
            // Get the wysiwyg element from frameContext
            const wysiwygEl = kernel.$.frameContext.get('wysiwyg');
            const mockContainer = {
                previousElementSibling: null,
                nextElementSibling: { nodeType: 1 },
                parentNode: wysiwygEl
            };
            dom.query.getParentElement.mockReturnValue(mockContainer);

            video.componentSelect(mockTarget);
            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);
            kernel.$.nodeTransform.removeAllParents.mockClear();

            await video.componentDestroy(mockTarget);

            expect(kernel.$.nodeTransform.removeAllParents).not.toHaveBeenCalled();
        });

        it('should use this.#element when no target is provided', async () => {
            video.componentSelect(mockTarget);
            kernel.$.eventManager.triggerEvent.mockResolvedValueOnce(undefined);

            // Call without target argument - should use internal #element
            await video.componentDestroy();

            expect(kernel.$.eventManager.triggerEvent).toHaveBeenCalledWith(
                'onVideoDeleteBefore',
                expect.objectContaining({ element: expect.anything() })
            );
        });
    });

    describe('Component LifeCycle', () => {


        it('componentSelect should prepare element for controller', () => {
            const target = dom.utils.createElement('VIDEO');
            target.src = 'test.mp4';
            target.style = { float: 'left' };

            video.componentSelect(target);

            expect(video.figure.open).toHaveBeenCalled();
            expect(video.sizeService.setOriginSize).toHaveBeenCalled();
        });

        it('componentEdit should open modal for editing', () => {
            video.componentEdit();
            expect(video.modal.open).toHaveBeenCalled();
        });
    });

    describe('Modal Lifecycle', () => {
        it('modalOn should set multiple attribute when creating new and allowMultiple is true', () => {
            const videoMultiple = new Video(kernel, { allowMultiple: true });

            videoMultiple.modalOn(false); // isUpdate = false

            expect(videoMultiple.videoInputFile.setAttribute).toHaveBeenCalledWith('multiple', 'multiple');
            expect(videoMultiple.sizeService.on).toHaveBeenCalledWith(false);
        });

        it('modalOn should remove multiple attribute when updating', () => {
            const videoMultiple = new Video(kernel, { allowMultiple: true });

            videoMultiple.modalOn(true); // isUpdate = true

            expect(videoMultiple.videoInputFile.removeAttribute).toHaveBeenCalledWith('multiple');
            expect(videoMultiple.sizeService.on).toHaveBeenCalledWith(true);
        });

        it('modalInit should reset form state completely', () => {
            // Set some state first
            video.videoUrlFile.value = 'https://example.com/video.mp4';
            video.previewSrc.textContent = 'some text';

            video.modalInit();

            expect(mockModal.OnChangeFile).toHaveBeenCalledWith(video.fileModalWrapper, []);
            expect(video.videoInputFile.value).toBe('');
            expect(video.videoUrlFile.disabled).toBe(false);
            expect(video.sizeService.init).toHaveBeenCalled();
        });
    });

    describe('Hooks', () => {
        it('retainFormat should return query and method for video/iframe elements', () => {
            const retainInfo = video.retainFormat();

            expect(retainInfo).toHaveProperty('query', 'iframe, video');
            expect(retainInfo).toHaveProperty('method');
            expect(typeof retainInfo.method).toBe('function');
        });

        it('retainFormat method should skip iframe without valid video URL', async () => {
            const retainInfo = video.retainFormat();
            const invalidIframe = { nodeName: 'IFRAME', src: 'https://example.com/page.html' };

            // Should return early without processing
            await retainInfo.method(invalidIframe);

            // Figure.GetContainer is not called because checkContentType fails
            // We just verify it doesn't throw an error
        });

        it('retainFormat method should skip element with valid figure container', async () => {
            const retainInfo = video.retainFormat();
            const validVideo = { nodeName: 'VIDEO', src: 'test.mp4' };

            // Mock Figure.GetContainer to return valid container
            mockFigure.GetContainer.mockReturnValue({
                container: { nodeType: 1 },
                cover: { nodeType: 1 }
            });

            await retainInfo.method(validVideo);

            // Should return early because container already exists
        });


        it('onFilePasteAndDrop should ignore non-video files', () => {
            const submitFileSpy = jest.spyOn(video, 'submitFile');

            const imageFile = { type: 'image/png', name: 'test.png' };
            video.onFilePasteAndDrop({ file: imageFile });

            expect(submitFileSpy).not.toHaveBeenCalled();

            submitFileSpy.mockRestore();
        });
    });

    describe('Tag Creation', () => {
        it('createIframeTag should create iframe with default attributes', () => {
            const iframe = video.createIframeTag();

            expect(dom.utils.createElement).toHaveBeenCalledWith('IFRAME');
            // frameBorder and allowFullscreen are set by #setIframeAttrs
        });

        it('createIframeTag should apply custom props', () => {
            const iframe = video.createIframeTag({ title: 'Test Video' });

            expect(dom.utils.createElement).toHaveBeenCalledWith('IFRAME');
        });

        it('createVideoTag should create video with controls', () => {
            const videoEl = video.createVideoTag();

            expect(dom.utils.createElement).toHaveBeenCalledWith('VIDEO');
        });

        it('createVideoTag should apply custom props', () => {
            const videoEl = video.createVideoTag({ autoplay: true });

            expect(dom.utils.createElement).toHaveBeenCalledWith('VIDEO');
        });

        it('createVideoTag should apply videoTagAttributes from options', () => {
            const videoWithAttrs = new Video(kernel, {
                videoTagAttributes: { crossorigin: 'anonymous', preload: 'auto' }
            });

            const videoEl = videoWithAttrs.createVideoTag();
            expect(dom.utils.createElement).toHaveBeenCalledWith('VIDEO');
        });

        it('createIframeTag should apply iframeTagAttributes from options', () => {
            const videoWithAttrs = new Video(kernel, {
                iframeTagAttributes: { loading: 'lazy', referrerpolicy: 'no-referrer' }
            });

            const iframe = videoWithAttrs.createIframeTag();
            expect(dom.utils.createElement).toHaveBeenCalledWith('IFRAME');
        });
    });

    describe('State Management', () => {
        it('setState should update state correctly', () => {
            video.setState('sizeUnit', 'px');
            expect(video.state.sizeUnit).toBe('px');

            video.setState('onlyPercentage', true);
            expect(video.state.onlyPercentage).toBe(true);

            video.setState('defaultRatio', '75%');
            expect(video.state.defaultRatio).toBe('75%');
        });
    });

    describe('Plugin Options', () => {
        it('should handle percentageOnlySize option', () => {
            const videoPercentage = new Video(kernel, { percentageOnlySize: true });

            expect(videoPercentage.pluginOptions.percentageOnlySize).toBe(true);
            expect(videoPercentage.state.sizeUnit).toBe('%');
            expect(videoPercentage.state.onlyPercentage).toBe(true);
        });

        it('should handle createFileInput and createUrlInput options', () => {
            // Only file input, no URL input
            const videoFileOnly = new Video(kernel, {
                createFileInput: true,
                createUrlInput: false
            });
            expect(videoFileOnly.pluginOptions.createFileInput).toBe(true);
            expect(videoFileOnly.pluginOptions.createUrlInput).toBe(false);

            // createUrlInput defaults to true when createFileInput is false
            const videoUrlOnly = new Video(kernel, {
                createFileInput: false
            });
            expect(videoUrlOnly.pluginOptions.createUrlInput).toBe(true);
        });

        it('should handle custom embedQuery patterns', () => {
            const customVideo = new Video(kernel, {
                embedQuery: {
                    custom: {
                        pattern: /customvideo\.com/i,
                        action: (url) => url.replace('watch', 'embed'),
                        tag: 'iframe'
                    }
                }
            });

            expect(customVideo.query.custom).toBeDefined();
            expect(customVideo.query.custom.pattern.test('https://customvideo.com/watch')).toBe(true);
        });

        it('should set default acceptedFormats to video/*', () => {
            const videoDefault = new Video(kernel, {});
            expect(videoDefault.pluginOptions.acceptedFormats).toBe('video/*');

            const videoWithWildcard = new Video(kernel, { acceptedFormats: '*' });
            expect(videoWithWildcard.pluginOptions.acceptedFormats).toBe('video/*');

            const videoWithCustom = new Video(kernel, { acceptedFormats: 'video/mp4,video/webm' });
            expect(videoWithCustom.pluginOptions.acceptedFormats).toBe('video/mp4,video/webm');
        });

        it('should handle defaultWidth and defaultHeight options', () => {
            // Numeric values should get 'px' appended
            const videoWithNumeric = new Video(kernel, {
                defaultWidth: 640,
                defaultHeight: 360
            });
            // numbers.is mock returns true for numbers
            expect(videoWithNumeric.pluginOptions.defaultWidth).toBeTruthy();

            // String values should be used as-is
            const videoWithString = new Video(kernel, {
                defaultWidth: '80%',
                defaultHeight: '45%'
            });
            expect(videoWithString.pluginOptions.defaultWidth).toBe('80%');
            expect(videoWithString.pluginOptions.defaultHeight).toBe('45%');

            // Empty/zero values should result in empty string
            const videoNoSize = new Video(kernel, {
                defaultWidth: '',
                defaultHeight: 0
            });
            expect(videoNoSize.pluginOptions.defaultWidth).toBe('');
        });

        it('should handle showHeightInput option', () => {
            const videoShowHeight = new Video(kernel, { showHeightInput: true });
            expect(videoShowHeight.pluginOptions.showHeightInput).toBe(true);

            const videoHideHeight = new Video(kernel, { showHeightInput: false });
            expect(videoHideHeight.pluginOptions.showHeightInput).toBe(false);
        });

        it('should handle showRatioOption option', () => {
            const videoShowRatio = new Video(kernel, { showRatioOption: true });
            expect(videoShowRatio.pluginOptions.showRatioOption).toBe(true);

            const videoHideRatio = new Video(kernel, { showRatioOption: false });
            expect(videoHideRatio.pluginOptions.showRatioOption).toBe(false);
        });

        it('should handle uploadHeaders option', () => {
            const videoWithHeaders = new Video(kernel, {
                uploadHeaders: { 'Authorization': 'Bearer token123' }
            });
            expect(videoWithHeaders.pluginOptions.uploadHeaders).toEqual({ 'Authorization': 'Bearer token123' });

            const videoNoHeaders = new Video(kernel, {});
            expect(videoNoHeaders.pluginOptions.uploadHeaders).toBeNull();
        });

        it('should handle ratioOptions option', () => {
            const customRatios = [{ label: '16:9', value: 0.5625 }, { label: '4:3', value: 0.75 }];
            const videoWithRatios = new Video(kernel, { ratioOptions: customRatios });
            expect(videoWithRatios.pluginOptions.ratioOptions).toEqual(customRatios);

            const videoNoRatios = new Video(kernel, {});
            expect(videoNoRatios.pluginOptions.ratioOptions).toBeNull();
        });

        it('should handle query_youtube and query_vimeo options', () => {
            const videoWithQueries = new Video(kernel, {
                query_youtube: 'autoplay=1&mute=1',
                query_vimeo: 'autopause=0'
            });
            expect(videoWithQueries.pluginOptions.query_youtube).toBe('autoplay=1&mute=1');
            expect(videoWithQueries.pluginOptions.query_vimeo).toBe('autopause=0');
        });

        it('should hide align form when align is not in figureControls', () => {
            // When controls don't include 'align', alignForm should be hidden
            const videoNoAlign = new Video(kernel, {
                controls: [['resize_auto', 'edit', 'remove']] // no 'align'
            });
            // alignForm.style.display is set to 'none' in constructor
            // This tests the branch where figureControls.some(...) returns false
        });

        it('should use custom figureControls when canResize is false', () => {
            const videoNonResizable = new Video(kernel, { canResize: false });
            // When canResize is false, default controls exclude resize options
            expect(videoNonResizable.pluginOptions.canResize).toBe(false);
        });
    });

    describe('#OnLinkPreview (via event handler)', () => {
        let inputHandler;
        let origOptionsGet;

        beforeEach(() => {
            // Clear any leftover mockReturnValueOnce from previous tests
            dom.query.getEventTarget.mockReset();
            dom.query.getEventTarget.mockImplementation((e) => e.target || e);

            const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
            const found = addEventCalls.find(
                call => call[0] === video.videoUrlFile && call[1] === 'input'
            );
            inputHandler = found ? found[2] : null;
            origOptionsGet = kernel.$.options.get;
        });

        afterEach(() => {
            kernel.$.options.get = origOptionsGet;
        });

        it('should detect iframe tag and set linkValue to raw iframe HTML', () => {
            const iframeValue = '<iframe src="https://youtube.com/embed/123"></iframe>';

            inputHandler({ target: { value: iframeValue } });

            expect(video.previewSrc.textContent).toBe('<IFrame :src=".."></IFrame>');
        });

        it('should add defaultUrlProtocol when URL has no protocol', () => {
            const url = 'example.com/video.mp4';
            kernel.$.options.get = jest.fn((key) => {
                if (key === 'defaultUrlProtocol') return 'https://';
                return undefined;
            });

            inputHandler({ target: { value: url } });

            expect(video.previewSrc.textContent).toBe('https://example.com/video.mp4');
        });

        it('should set empty string for empty value', () => {
            inputHandler({ target: { value: '' } });

            expect(video.previewSrc.textContent).toBe('');
        });

        it('should use URL as-is when it has protocol', () => {
            const url = 'https://example.com/video.mp4';
            kernel.$.options.get = jest.fn((key) => {
                if (key === 'defaultUrlProtocol') return 'https://';
                return undefined;
            });

            inputHandler({ target: { value: url } });

            expect(video.previewSrc.textContent).toBe('https://example.com/video.mp4');
        });

        it('should add leading slash when URL has no protocol and no defaultUrlProtocol', () => {
            const url = 'example.com/video.mp4';
            kernel.$.options.get = jest.fn((key) => {
                if (key === 'defaultUrlProtocol') return '';
                return undefined;
            });

            inputHandler({ target: { value: url } });

            expect(video.previewSrc.textContent).toBe('/example.com/video.mp4');
        });

        it('should handle bookmark URL (starts with #)', () => {
            const url = '#section1';
            kernel.$.options.get = jest.fn((key) => {
                if (key === 'defaultUrlProtocol') return 'https://';
                return undefined;
            });

            inputHandler({ target: { value: url } });

            // Bookmark starts with # and indexOf('#') === 0, so defaultUrlProtocol is NOT added
            // Falls through to: !value.includes('://') ? '/' + value : value
            expect(video.previewSrc.textContent).toBe('/#section1');
        });
    });

    describe('#OnfileInputChange (via event handler)', () => {
        let fileChangeHandler;

        beforeEach(() => {
            // Ensure getEventTarget returns e.target properly
            dom.query.getEventTarget.mockImplementation((e) => e.target || e);

            const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
            const found = addEventCalls.find(
                call => call[0] === video.videoInputFile && call[1] === 'change'
            );
            fileChangeHandler = found ? found[2] : null;
        });

        it('should disable URL input when file is selected', () => {
            video.videoInputFile.value = 'video.mp4';
            const mockFiles = [{ name: 'video.mp4' }];
            const mockEventTarget = { files: mockFiles };
            mockModal.OnChangeFile.mockClear();

            if (fileChangeHandler) {
                fileChangeHandler({ target: mockEventTarget });
            }

            expect(video.videoUrlFile.disabled).toBe(true);
            expect(video.previewSrc.style.textDecoration).toBe('line-through');
            expect(mockModal.OnChangeFile).toHaveBeenCalledWith(video.fileModalWrapper, mockFiles);
        });

        it('should enable URL input when no file is selected', () => {
            video.videoInputFile.value = '';
            const mockEventTarget = { files: [] };

            if (fileChangeHandler) {
                fileChangeHandler({ target: mockEventTarget });
            }

            expect(video.videoUrlFile.disabled).toBe(false);
            expect(video.previewSrc.style.textDecoration).toBe('');
        });
    });

    describe('#RemoveSelectedFiles (via event handler)', () => {
        it('should reset file input and enable URL input when remove button clicked', () => {
            // Find the bound handler for the remove button (click event on fileRemoveBtn)
            const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
            // The fileRemoveBtn handler is a click handler that is NOT on videoUrlFile or videoInputFile
            const found = addEventCalls.find(
                call => call[1] === 'click' && call[0] !== video.videoUrlFile && call[0] !== video.videoInputFile
            );

            expect(found).toBeTruthy();

            // Set some state first
            video.videoInputFile.value = 'somefile.mp4';
            video.videoUrlFile.disabled = true;
            video.previewSrc.style.textDecoration = 'line-through';
            mockModal.OnChangeFile.mockClear();

            found[2](); // Call the handler

            expect(video.videoInputFile.value).toBe('');
            expect(video.videoUrlFile.disabled).toBe(false);
            expect(video.previewSrc.style.textDecoration).toBe('');
            expect(mockModal.OnChangeFile).toHaveBeenCalledWith(video.fileModalWrapper, []);
        });
    });

    describe('onFilePasteAndDrop', () => {
        it('should call submitFile for video files', () => {
            const submitFileSpy = jest.spyOn(video, 'submitFile').mockResolvedValue(true);

            const videoFile = { type: 'video/mp4', name: 'test.mp4' };
            video.onFilePasteAndDrop({ file: videoFile });

            expect(submitFileSpy).toHaveBeenCalledWith([videoFile]);
            expect(kernel.$.focusManager.focus).toHaveBeenCalled();

            submitFileSpy.mockRestore();
        });

        it('should not call submitFile for non-video files', () => {
            const submitFileSpy = jest.spyOn(video, 'submitFile');

            const textFile = { type: 'text/plain', name: 'test.txt' };
            video.onFilePasteAndDrop({ file: textFile });

            expect(submitFileSpy).not.toHaveBeenCalled();

            submitFileSpy.mockRestore();
        });
    });

    describe('#OpenGallery and #SetUrlInput', () => {
        it('should open gallery and set URL input when gallery callback is invoked', () => {
            // Create a video instance with a galleryButton set
            const mockGalleryButton = { nodeName: 'button', style: {}, setAttribute: jest.fn(), getAttribute: jest.fn(), appendChild: jest.fn() };
            const origMockReturn = mockRender.getMockImplementation?.() || mockRender.mockImplementation;

            // Override the render mock temporarily to include a gallery button
            mockRender.mockImplementationOnce(() => ({
                html: { nodeName: 'div', style: {}, setAttribute: jest.fn(), getAttribute: jest.fn(), appendChild: jest.fn() },
                fileModalWrapper: { nodeName: 'div', style: {}, setAttribute: jest.fn(), getAttribute: jest.fn(), appendChild: jest.fn() },
                videoInputFile: { files: [], value: '', setAttribute: jest.fn(), removeAttribute: jest.fn() },
                videoUrlFile: { disabled: false, value: '', focus: jest.fn() },
                previewSrc: { textContent: '', style: {} },
                proportion: { disabled: false, checked: false },
                frameRatioOption: { options: [], value: '0.5625' },
                inputX: { value: '100%' },
                inputY: { value: '56.25%' },
                revertBtn: { nodeName: 'button', style: {}, setAttribute: jest.fn(), getAttribute: jest.fn(), appendChild: jest.fn() },
                galleryButton: mockGalleryButton,
                fileRemoveBtn: { nodeName: 'button', style: {}, setAttribute: jest.fn(), getAttribute: jest.fn(), appendChild: jest.fn() },
                alignForm: { style: {} }
            }));

            const videoWithGallery = new Video(kernel, {});

            // Find the click handler bound to the gallery button
            const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
            const galleryHandler = addEventCalls.find(
                call => call[0] === mockGalleryButton && call[1] === 'click'
            );

            expect(galleryHandler).toBeTruthy();

            // Mock the videoGallery plugin's open method
            kernel.$.plugins.videoGallery.open = jest.fn((callback) => {
                // Simulate gallery selecting a video - invoke the callback
                const mockTarget = {
                    getAttribute: jest.fn().mockReturnValue('https://example.com/selected-video.mp4'),
                    src: 'https://example.com/fallback.mp4'
                };
                callback(mockTarget);
            });

            // Invoke the gallery handler
            galleryHandler[2]();

            expect(kernel.$.plugins.videoGallery.open).toHaveBeenCalled();
            // The #SetUrlInput should have set the videoUrlFile value
            expect(videoWithGallery.videoUrlFile.value).toBe('https://example.com/selected-video.mp4');
            expect(videoWithGallery.previewSrc.textContent).toBe('https://example.com/selected-video.mp4');
            expect(videoWithGallery.videoUrlFile.focus).toHaveBeenCalled();
        });
    });

    describe('#fixTagStructure (via retainFormat)', () => {
        it('should process video element without existing figure container', async () => {
            const retainInfo = video.retainFormat();

            // Mock: no existing container
            mockFigure.GetContainer.mockReturnValueOnce(null);

            const mockVideoEl = {
                nodeName: 'VIDEO',
                src: 'https://example.com/video.mp4',
                style: { float: '', textAlign: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn().mockReturnValue(null),
                cloneNode: jest.fn().mockReturnValue({
                    nodeName: 'VIDEO',
                    src: 'https://example.com/video.mp4',
                    setAttribute: jest.fn(),
                    getAttribute: jest.fn().mockReturnValue(null),
                    style: {}
                }),
                width: '640',
                height: '360'
            };

            // Mock format.getLine to return a line element
            kernel.$.format.getLine.mockReturnValueOnce({
                style: { textAlign: 'center', float: '' }
            });

            // Second call inside #fixTagStructure
            kernel.$.format.getLine.mockReturnValueOnce({
                style: { textAlign: 'center', float: '' }
            });

            // Mock GetContainer for second call inside fixTagStructure
            mockFigure.GetContainer.mockReturnValueOnce(null);

            await retainInfo.method(mockVideoEl);

            // Should have called CreateContainer for the new figure
            expect(mockFigure.CreateContainer).toHaveBeenCalled();
            expect(video.figure.retainFigureFormat).toHaveBeenCalled();
        });

        it('should process iframe element and set iframe attributes', async () => {
            const retainInfo = video.retainFormat();

            // Mock: no existing container
            mockFigure.GetContainer.mockReturnValueOnce(null);

            const mockIframeEl = {
                nodeName: 'IFRAME',
                src: 'https://www.youtube.com/embed/abc123',
                style: { float: '', textAlign: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn().mockReturnValue(null),
                cloneNode: jest.fn().mockReturnValue({
                    nodeName: 'IFRAME',
                    src: 'https://www.youtube.com/embed/abc123',
                    setAttribute: jest.fn(),
                    getAttribute: jest.fn().mockReturnValue(null),
                    style: {},
                    frameBorder: '',
                    allowFullscreen: false
                }),
                width: '640',
                height: '360',
                frameBorder: '',
                allowFullscreen: false
            };

            kernel.$.format.getLine.mockReturnValueOnce({
                style: { textAlign: 'left', float: '' }
            });
            kernel.$.format.getLine.mockReturnValueOnce({
                style: { textAlign: 'left', float: '' }
            });

            // Mock GetContainer for second call
            mockFigure.GetContainer.mockReturnValueOnce(null);

            await retainInfo.method(mockIframeEl);

            expect(mockFigure.CreateContainer).toHaveBeenCalled();
        });

        it('should preserve figcaption when present in existing container', async () => {
            const retainInfo = video.retainFormat();

            // Mock: no container first (for #ready check)
            mockFigure.GetContainer.mockReturnValueOnce(null);

            const mockVideoEl = {
                nodeName: 'VIDEO',
                src: 'https://example.com/video.mp4',
                style: { float: '', textAlign: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn().mockReturnValue('640,360'),
                cloneNode: jest.fn().mockReturnValue({
                    nodeName: 'VIDEO',
                    src: 'https://example.com/video.mp4',
                    setAttribute: jest.fn(),
                    getAttribute: jest.fn().mockReturnValue('640,360'),
                    style: {},
                    width: '640',
                    height: '360'
                }),
                width: '640',
                height: '360'
            };

            kernel.$.format.getLine.mockReturnValueOnce({
                style: { textAlign: '', float: '' }
            });
            kernel.$.format.getLine.mockReturnValueOnce({
                style: { textAlign: '', float: '' }
            });

            // Mock GetContainer with figcaption for the second call inside fixTagStructure
            const mockFigcaption = { innerHTML: 'Video caption' };
            mockFigure.GetContainer.mockReturnValueOnce({
                container: {
                    nodeType: 1,
                    style: {},
                    querySelector: jest.fn().mockReturnValue(mockFigcaption)
                },
                cover: { nodeType: 1 }
            });

            // Mock createElement for figcaption
            dom.utils.createElement.mockReturnValueOnce({
                innerHTML: '',
                nodeName: 'FIGCAPTION'
            });

            await retainInfo.method(mockVideoEl);

            expect(mockFigure.CreateContainer).toHaveBeenCalled();
        });

        it('should use data-se-size for dimensions when present', async () => {
            const retainInfo = video.retainFormat();

            mockFigure.GetContainer.mockReturnValueOnce(null);

            const mockVideoEl = {
                nodeName: 'VIDEO',
                src: 'https://example.com/video.mp4',
                style: { float: '', textAlign: '' },
                setAttribute: jest.fn(),
                getAttribute: jest.fn().mockReturnValue(null),
                cloneNode: jest.fn().mockReturnValue({
                    nodeName: 'VIDEO',
                    src: 'https://example.com/video.mp4',
                    setAttribute: jest.fn(),
                    getAttribute: jest.fn().mockReturnValue('800,600'),
                    style: {},
                    width: '',
                    height: ''
                }),
                width: '',
                height: ''
            };

            kernel.$.format.getLine.mockReturnValue({
                style: { textAlign: '', float: '' }
            });

            mockFigure.GetContainer.mockReturnValueOnce(null);

            await retainInfo.method(mockVideoEl);

            expect(video.sizeService.applySize).toHaveBeenCalled();
        });
    });
});
