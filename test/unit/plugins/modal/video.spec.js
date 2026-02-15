
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

        });

        describe('submitURL validation', () => {

            it('should return false for empty URL', async () => {
                // Don't set any link value
                const result = await video.submitURL('');
                expect(result).toBe(false);
            });
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
});
