
// Mock helper FIRST before import
jest.mock('../../../../../../src/helper', () => {
    return {
        env: {
            NO_EVENT: 'NO_EVENT'
        }
    };
});

import VideoUploadService from '../../../../../../src/plugins/modal/video/services/video.upload';

describe('VideoUploadService', () => {
    // ... rest of the test file
    let service;
    let mockMain;
    let mockFileManager;
    let mockUi;

    beforeEach(() => {
        mockFileManager = {
            upload: jest.fn(),
            getSize: jest.fn().mockReturnValue(0)
        };

        mockUi = {
            alertOpen: jest.fn()
        };

        mockMain = {
            pluginOptions: {
                uploadUrl: 'http://localhost/upload',
                uploadHeaders: { 'Authorization': 'token' }
            },
            fileManager: mockFileManager,
            uiManager: mockUi,
            triggerEvent: jest.fn().mockResolvedValue('NO_EVENT'), // Simulate env.NO_EVENT value
            createVideoTag: jest.fn().mockReturnValue({ cloneNode: jest.fn().mockReturnValue({}) }),
            create: jest.fn()
        };

        service = new VideoUploadService(mockMain);
    });

    describe('serverUpload', () => {
        it('should call fileManager.upload with correct parameters', () => {
            const info = { files: [] };
            const files = ['file1'];
            service.serverUpload(info, files);

            expect(mockFileManager.upload).toHaveBeenCalledWith(
                'http://localhost/upload',
                { 'Authorization': 'token' },
                files,
                expect.any(Function), // Success callback
                expect.any(Function)  // Error callback
            );
        });

        it('should do nothing if files are missing', () => {
            service.serverUpload({}, null);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });

        it('should do nothing if uploadUrl is invalid', () => {
            mockMain.pluginOptions.uploadUrl = null;
            service.serverUpload({}, ['file1']);
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });
    });

    describe('Callback Handling (UploadCallBack)', () => {
        let uploadCallback;
        let errorCallback;

        beforeEach(() => {
            // Capture callbacks passed to upload
            mockFileManager.upload.mockImplementation((url, header, files, cb, err) => {
                uploadCallback = cb; // This is actually bound #UploadCallBack
                errorCallback = err; // This is actually bound #error
            });
        });

        it('should handle successful upload and register videos', async () => {
            const info = { 
                files: [], 
                isUpdate: false, 
                inputWidth: '100%', 
                inputHeight: '56.25%', 
                align: 'center' 
            };
            const response = {
                result: [
                    { url: 'http://video1.mp4', name: 'video1.mp4', size: 1024 },
                    { url: 'http://video2.mp4', name: 'video2.mp4', size: 2048 }
                ]
            };
            const mockXhr = {
                responseText: JSON.stringify(response)
            };

            // 1. Trigger upload to capture callbacks
            service.serverUpload(info, ['file']);
            
            // 2. Simulate Success Callback execution
            // The bound #UploadCallBack checks triggerEvent('videoUploadHandler') result
            // If it returns NO_EVENT (mocked default), it proceeds.
            await uploadCallback(mockXhr);

            // 3. Verify Registration
            expect(mockMain.create).toHaveBeenCalledTimes(2);
            expect(mockMain.create).toHaveBeenCalledWith(
                expect.anything(),
                'http://video1.mp4',
                '100%',
                '56.25%',
                'center',
                false,
                expect.objectContaining({ name: 'video1.mp4' }),
                false // isLast
            );
        });

        it('should handle server error response in success callback', async () => {
            const response = { errorMessage: 'Server Error' };
            const mockXhr = {
                responseText: JSON.stringify(response)
            };

            service.serverUpload({}, ['file']);
            await uploadCallback(mockXhr);

            expect(mockUi.alertOpen).toHaveBeenCalledWith('Server Error', 'error');
            expect(mockMain.create).not.toHaveBeenCalled();
        });

        it('should handle error callback from fileManager (#error)', async () => {
            const errorResponse = { errorMessage: 'Network Error' };
            
            service.serverUpload({}, ['file']);
            // The bound #error callback calls triggerEvent('onVideoUploadError')
            await errorCallback(errorResponse);

            expect(mockUi.alertOpen).toHaveBeenCalledWith('Network Error', 'error');
        });
        
        it('should respect custom error message from event handler', async () => {
             const errorResponse = { errorMessage: 'Network Error' };
             mockMain.triggerEvent.mockResolvedValue('Custom Error Message'); // Override for this test
             
             service.serverUpload({}, ['file']);
             await errorCallback(errorResponse);
 
             expect(mockUi.alertOpen).toHaveBeenCalledWith('Custom Error Message', 'error');
        });
    });
});
