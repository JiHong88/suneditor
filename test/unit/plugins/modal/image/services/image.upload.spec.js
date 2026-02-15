
import ImageUploadService from '../../../../../../src/plugins/modal/image/services/image.upload';

// Mock helper including env
jest.mock('../../../../../../src/helper', () => {
    const NO_EVENT = Symbol('NO_EVENT');
    return {
        env: {
            NO_EVENT
        }
    };
});

import { env } from '../../../../../../src/helper';
const { NO_EVENT } = env;

describe('ImageUploadService', () => {
    let service;
    let mockMain;
    let mockFileManager;
    let mockUi;

    beforeEach(() => {
        mockFileManager = {
            upload: jest.fn(),
            setFileData: jest.fn()
        };

        mockUi = {
            hideLoading: jest.fn(),
            alertOpen: jest.fn()
        };

        mockMain = {
            pluginOptions: {
                uploadUrl: 'http://localhost/upload',
                uploadHeaders: { 'Authorization': 'token' },
                canResize: true
            },
            fileManager: mockFileManager,
            uiManager: mockUi,
            state: {},
            modal: {
                isUpdate: false
            },
            create: jest.fn(),
            createInline: jest.fn(),
            component: {
                select: jest.fn()
            },
            setState: jest.fn(),
            triggerEvent: jest.fn().mockResolvedValue(NO_EVENT),
            constructor: {
                key: 'image'
            },
            as: 'block', // Default for tests
            resizing: true,
            sizeService: {
                setInputSize: jest.fn()
            }
        };

        // Make mockMain act as its own kernel for dependency injection
        mockMain.$ = mockMain;

        service = new ImageUploadService(mockMain);
    });

    describe('serverUpload', () => {
        it('should return early if info.files is missing', () => {
            service.serverUpload({});
            expect(mockFileManager.upload).not.toHaveBeenCalled();
        });

        it('should call fileManager.upload if uploadUrl is present', () => {
            const info = { files: [{ name: 'test.png' }] };
            service.serverUpload(info);
            
            expect(mockFileManager.upload).toHaveBeenCalledWith(
                'http://localhost/upload',
                { 'Authorization': 'token' },
                info.files,
                expect.any(Function),
                expect.any(Function)
            );
        });

        it('should fallback to base64 processing if uploadUrl is empty', () => {
             // Mock FileReader
             const mockReader = {
                readAsDataURL: jest.fn(),
                result: 'data:image/png;base64,test'
            };
            window.FileReader = jest.fn(() => mockReader);

            mockMain.pluginOptions.uploadUrl = '';
            const info = { 
                files: [{ name: 'test.png' }],
                element: null,
                anchor: null,
                inputWidth: '300px',
                inputHeight: '200px',
                align: 'center',
                alt: 'test'
            };

            service.serverUpload(info);
            // Verify base64 logic triggered (FileReader usage)
            expect(window.FileReader).toHaveBeenCalled();
            expect(mockReader.readAsDataURL).toHaveBeenCalledWith(info.files[0]);
        });
    });

    describe('urlUpload', () => {
        it('should create new image (produce) when not updating', () => {
            mockMain.modal.isUpdate = false;
            const info = {
                url: 'http://example.com/image.png',
                files: null,
                alt: 'alt text',
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'left'
            };

            service.urlUpload(info);

            expect(mockMain.setState).toHaveBeenCalledWith('produceIndex', 0);
            expect(mockMain.create).toHaveBeenCalledWith(
                info.url, undefined, info.inputWidth, info.inputHeight, info.align, null, info.alt, true
            );
        });

        it('should create inline image when main.as is inline', () => {
            mockMain.modal.isUpdate = false;
            mockMain.as = 'inline'; // FORMAT_TYPE.INLINE
            const info = {
                url: 'http://example.com/image.png',
                files: null,
                alt: 'alt text',
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'left'
            };

            service.urlUpload(info);

            expect(mockMain.createInline).toHaveBeenCalledWith(
                info.url, undefined, info.inputWidth, info.inputHeight, null, info.alt, true
            );
        });

        it('should update existing image source when updating', () => {
            mockMain.modal.isUpdate = true;
            const element = { src: '' };
            const info = {
                url: 'http://example.com/new.png',
                element: element,
                files: { name: 'new.png', size: 100 }
            };

            service.urlUpload(info);

            expect(element.src).toBe(info.url);
            expect(mockFileManager.setFileData).toHaveBeenCalledWith(element, info.files);
            expect(mockMain.component.select).toHaveBeenCalled();
        });
    });

});
