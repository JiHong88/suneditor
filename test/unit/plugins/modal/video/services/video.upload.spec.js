
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

        // Make mockMain act as its own kernel for dependency injection
        mockMain.$ = mockMain;

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

});
