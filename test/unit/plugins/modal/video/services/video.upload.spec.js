
// Mock helper FIRST before any imports to control NO_EVENT
jest.mock('../../../../../../src/helper', () => {
    const NO_EVENT = Symbol('NO_EVENT');
    return {
        env: {
            NO_EVENT
        }
    };
});

import VideoUploadService from '../../../../../../src/plugins/modal/video/services/video.upload';
import { env } from '../../../../../../src/helper';
const { NO_EVENT } = env;

describe('VideoUploadService', () => {
    let service;
    let mockMain;
    let mockFileManager;
    let mockUi;
    let mockEventManager;

    beforeEach(() => {
        mockFileManager = {
            upload: jest.fn(),
            getSize: jest.fn().mockReturnValue(0)
        };

        mockUi = {
            alertOpen: jest.fn()
        };

        mockEventManager = {
            triggerEvent: jest.fn()
        };

        mockMain = {
            pluginOptions: {
                uploadUrl: 'http://localhost/upload',
                uploadHeaders: { 'Authorization': 'token' }
            },
            fileManager: mockFileManager,
            ui: mockUi,
            eventManager: mockEventManager,
            createVideoTag: jest.fn().mockReturnValue({
                cloneNode: jest.fn().mockReturnValue({ tagName: 'VIDEO' })
            }),
            create: jest.fn()
        };

        // Make mockMain act as its own kernel ($) for dependency injection
        mockMain.$ = mockMain;

        service = new VideoUploadService(mockMain);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ---------------------------------------------------------------------------
    // serverUpload
    // ---------------------------------------------------------------------------
    describe('serverUpload', () => {
        it('should call fileManager.upload with correct parameters when uploadUrl is valid', () => {
            const info = { files: [] };
            const files = ['file1'];
            service.serverUpload(info, files);

            expect(mockFileManager.upload).toHaveBeenCalledWith(
                'http://localhost/upload',
                { 'Authorization': 'token' },
                files,
                expect.any(Function), // #UploadCallBack
                expect.any(Function)  // #error
            );
        });

        it('should return early without calling fileManager.upload if files is null', () => {
            service.serverUpload({}, null);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });

        it('should return early without calling fileManager.upload if files is undefined', () => {
            service.serverUpload({}, undefined);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });

        it('should NOT call fileManager.upload if uploadUrl is null', () => {
            mockMain.pluginOptions.uploadUrl = null;
            service.serverUpload({}, ['file1']);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });

        it('should NOT call fileManager.upload if uploadUrl is an empty string', () => {
            mockMain.pluginOptions.uploadUrl = '';
            service.serverUpload({}, ['file1']);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });

        it('should NOT call fileManager.upload if uploadUrl is a number (not a string)', () => {
            mockMain.pluginOptions.uploadUrl = 42;
            service.serverUpload({}, ['file1']);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------------------
    // Helpers to capture private callbacks after a serverUpload call
    // ---------------------------------------------------------------------------
    function triggerServerUpload(info = {}) {
        service.serverUpload(info, ['file1']);
        const calls = mockFileManager.upload.mock.calls[0];
        const uploadCallBack = calls[3]; // #UploadCallBack bound with info
        const errorCb = calls[4];        // #error
        return { uploadCallBack, errorCb };
    }

    // ---------------------------------------------------------------------------
    // #UploadCallBack
    // ---------------------------------------------------------------------------
    describe('#UploadCallBack (captured via fileManager.upload mock)', () => {
        it('should call #register when triggerEvent returns NO_EVENT and response has no errorMessage', async () => {
            const mockClonedTag = { tagName: 'VIDEO' };
            mockMain.createVideoTag.mockReturnValue({
                cloneNode: jest.fn().mockReturnValue(mockClonedTag)
            });
            mockEventManager.triggerEvent.mockResolvedValue(NO_EVENT);

            const info = {
                isUpdate: false,
                inputWidth: '400px',
                inputHeight: '300px',
                align: 'center'
            };
            const { uploadCallBack } = triggerServerUpload(info);

            const xmlHttp = {
                responseText: JSON.stringify({
                    result: [{ url: 'http://example.com/video.mp4', name: 'video.mp4', size: 1024 }]
                })
            };

            await uploadCallBack(xmlHttp);

            expect(mockEventManager.triggerEvent).toHaveBeenCalledWith('videoUploadHandler', { xmlHttp, info });
            expect(mockMain.createVideoTag).toHaveBeenCalled();
            expect(mockMain.create).toHaveBeenCalledWith(
                mockClonedTag,
                'http://example.com/video.mp4',
                '400px',
                '300px',
                'center',
                false,
                { name: 'video.mp4', size: 1024 },
                true // last item
            );
        });

        it('should call #error when triggerEvent returns NO_EVENT and response has errorMessage', async () => {
            mockEventManager.triggerEvent
                .mockResolvedValueOnce(NO_EVENT)   // videoUploadHandler
                .mockResolvedValueOnce(NO_EVENT);  // onVideoUploadError

            const { uploadCallBack } = triggerServerUpload();

            const xmlHttp = {
                responseText: JSON.stringify({ errorMessage: 'Upload failed' })
            };

            await uploadCallBack(xmlHttp);

            expect(mockUi.alertOpen).toHaveBeenCalledWith('Upload failed', 'error');
        });

        it('should NOT call #register or #error when triggerEvent does NOT return NO_EVENT (handler overridden)', async () => {
            // triggerEvent returns something other than NO_EVENT — handler was consumed
            mockEventManager.triggerEvent.mockResolvedValue('custom-result');

            const { uploadCallBack } = triggerServerUpload();

            const xmlHttp = {
                responseText: JSON.stringify({
                    result: [{ url: 'http://example.com/video.mp4', name: 'video.mp4', size: 512 }]
                })
            };

            await uploadCallBack(xmlHttp);

            // create should NOT be called because the branch was skipped
            expect(mockMain.create).not.toHaveBeenCalled();
            expect(mockUi.alertOpen).not.toHaveBeenCalled();
        });
    });

    // ---------------------------------------------------------------------------
    // #error
    // ---------------------------------------------------------------------------
    describe('#error (captured via fileManager.upload mock)', () => {
        it('should use response.errorMessage when triggerEvent returns NO_EVENT', async () => {
            mockEventManager.triggerEvent.mockResolvedValue(NO_EVENT);

            const { errorCb } = triggerServerUpload();
            const response = { errorMessage: 'Server error' };

            await errorCb(response);

            expect(mockEventManager.triggerEvent).toHaveBeenCalledWith('onVideoUploadError', { error: response });
            expect(mockUi.alertOpen).toHaveBeenCalledWith('Server error', 'error');
        });

        it('should use the custom message string when triggerEvent returns a non-NO_EVENT truthy string', async () => {
            mockEventManager.triggerEvent.mockResolvedValue('Custom error message');

            const { errorCb } = triggerServerUpload();
            const response = { errorMessage: 'Server error' };

            await errorCb(response);

            expect(mockUi.alertOpen).toHaveBeenCalledWith('Custom error message', 'error');
        });

        it('should fallback to response.errorMessage when triggerEvent returns a falsy value (null)', async () => {
            mockEventManager.triggerEvent.mockResolvedValue(null);

            const { errorCb } = triggerServerUpload();
            const response = { errorMessage: 'Fallback error' };

            await errorCb(response);

            expect(mockUi.alertOpen).toHaveBeenCalledWith('Fallback error', 'error');
        });

        it('should fallback to response.errorMessage when triggerEvent returns empty string (falsy)', async () => {
            mockEventManager.triggerEvent.mockResolvedValue('');

            const { errorCb } = triggerServerUpload();
            const response = { errorMessage: 'Fallback from empty' };

            await errorCb(response);

            expect(mockUi.alertOpen).toHaveBeenCalledWith('Fallback from empty', 'error');
        });
    });

    // ---------------------------------------------------------------------------
    // #register (via #UploadCallBack with NO_EVENT and no errorMessage)
    // ---------------------------------------------------------------------------
    describe('#register (via #UploadCallBack)', () => {
        beforeEach(() => {
            // Always return NO_EVENT so the register path is entered
            mockEventManager.triggerEvent.mockResolvedValue(NO_EVENT);
        });

        it('should call create once for a single file result', async () => {
            const mockClonedTag = { tagName: 'VIDEO' };
            mockMain.createVideoTag.mockReturnValue({
                cloneNode: jest.fn().mockReturnValue(mockClonedTag)
            });

            const info = {
                isUpdate: false,
                inputWidth: '640px',
                inputHeight: '480px',
                align: 'left'
            };
            const { uploadCallBack } = triggerServerUpload(info);

            const response = {
                result: [{ url: 'http://cdn.example.com/a.mp4', name: 'a.mp4', size: 2048 }]
            };

            await uploadCallBack({ responseText: JSON.stringify(response) });

            expect(mockMain.createVideoTag).toHaveBeenCalledTimes(1);
            expect(mockMain.create).toHaveBeenCalledTimes(1);
            expect(mockMain.create).toHaveBeenCalledWith(
                mockClonedTag,
                'http://cdn.example.com/a.mp4',
                '640px',
                '480px',
                'left',
                false,
                { name: 'a.mp4', size: 2048 },
                true // i === len - 1
            );
        });

        it('should call create multiple times for multiple file results, marking last with true', async () => {
            const clonedTags = [{ id: 'tag1' }, { id: 'tag2' }, { id: 'tag3' }];
            let cloneCallCount = 0;
            mockMain.createVideoTag.mockReturnValue({
                cloneNode: jest.fn().mockImplementation(() => clonedTags[cloneCallCount++])
            });

            const info = {
                isUpdate: false,
                inputWidth: '800px',
                inputHeight: '600px',
                align: 'right'
            };
            const { uploadCallBack } = triggerServerUpload(info);

            const response = {
                result: [
                    { url: 'http://cdn.example.com/a.mp4', name: 'a.mp4', size: 100 },
                    { url: 'http://cdn.example.com/b.mp4', name: 'b.mp4', size: 200 },
                    { url: 'http://cdn.example.com/c.mp4', name: 'c.mp4', size: 300 }
                ]
            };

            await uploadCallBack({ responseText: JSON.stringify(response) });

            expect(mockMain.create).toHaveBeenCalledTimes(3);

            // First two items: isLast = false
            expect(mockMain.create).toHaveBeenNthCalledWith(1,
                clonedTags[0], 'http://cdn.example.com/a.mp4', '800px', '600px', 'right', false,
                { name: 'a.mp4', size: 100 }, false
            );
            expect(mockMain.create).toHaveBeenNthCalledWith(2,
                clonedTags[1], 'http://cdn.example.com/b.mp4', '800px', '600px', 'right', false,
                { name: 'b.mp4', size: 200 }, false
            );
            // Last item: isLast = true
            expect(mockMain.create).toHaveBeenNthCalledWith(3,
                clonedTags[2], 'http://cdn.example.com/c.mp4', '800px', '600px', 'right', false,
                { name: 'c.mp4', size: 300 }, true
            );
        });

        it('should use info.element as ctag (not cloneNode) when isUpdate=true', async () => {
            const existingElement = { tagName: 'IFRAME', src: '' };

            const info = {
                isUpdate: true,
                element: existingElement,
                inputWidth: '100%',
                inputHeight: 'auto',
                align: 'none'
            };
            const { uploadCallBack } = triggerServerUpload(info);

            const response = {
                result: [{ url: 'http://cdn.example.com/updated.mp4', name: 'updated.mp4', size: 512 }]
            };

            await uploadCallBack({ responseText: JSON.stringify(response) });

            expect(mockMain.create).toHaveBeenCalledWith(
                existingElement, // should use info.element, not cloneNode
                'http://cdn.example.com/updated.mp4',
                '100%',
                'auto',
                'none',
                true,
                { name: 'updated.mp4', size: 512 },
                true
            );
            // cloneNode should NOT have been called because isUpdate=true
            const videoTagMock = mockMain.createVideoTag.mock.results[0]?.value;
            if (videoTagMock) {
                expect(videoTagMock.cloneNode).not.toHaveBeenCalled();
            }
        });
    });
});
