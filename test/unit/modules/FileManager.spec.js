/**
 * @fileoverview Unit tests for modules/FileManager.js
 */

import FileManager from '../../../src/modules/FileManager.js';

// Mock CoreInjector
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

// Mock ApiManager
jest.mock('../../../src/modules/ApiManager.js', () => {
    return jest.fn().mockImplementation(() => ({
        call: jest.fn(),
        asyncCall: jest.fn().mockResolvedValue({ status: 200 })
    }));
});

describe('Modules - FileManager', () => {
    let mockInst;
    let mockEditor;
    let mockUI;
    let mockFrameContext;
    let mockWysiwyg;

    beforeEach(() => {
        jest.clearAllMocks();

        mockWysiwyg = {
            querySelectorAll: jest.fn().mockReturnValue([])
        };

        mockFrameContext = new Map([
            ['wysiwyg', mockWysiwyg]
        ]);

        mockUI = {
            showLoading: jest.fn(),
            hideLoading: jest.fn()
        };

        mockEditor = {
            ui: mockUI,
            frameContext: mockFrameContext,
            component: {
                resetFileIndex: jest.fn()
            },
            _componentsInfoInit: false,
            _componentsInfoReset: false,
            triggerEvent: jest.fn()
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testPlugin',
                name: 'TestPlugin'
            }
        };
    });

    describe('Constructor', () => {
        it('should create FileManager instance with required properties', () => {
            const params = {
                query: 'img[data-se-file]',
                loadHandler: jest.fn(),
                eventHandler: jest.fn()
            };

            const fileManager = new FileManager(mockInst, params);

            expect(fileManager.ui).toBe(mockUI);
            expect(fileManager.kind).toBe('testPlugin');
            expect(fileManager.inst).toBe(mockInst);
            expect(fileManager.component).toBe(mockEditor.component);
            expect(fileManager.query).toBe('img[data-se-file]');
            expect(fileManager.loadHandler).toBe(params.loadHandler);
            expect(fileManager.eventHandler).toBe(params.eventHandler);
            expect(fileManager.infoList).toEqual([]);
            expect(fileManager.infoIndex).toBe(0);
            expect(fileManager.uploadFileLength).toBe(0);
            expect(mockInst.__fileManagement).toBe(fileManager);
        });

        it('should use constructor name as fallback for kind', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: {
                    name: 'FallbackName'
                }
            };

            const fileManager = new FileManager(instWithoutKey, { query: 'img' });
            expect(fileManager.kind).toBe('FallbackName');
        });
    });

    describe('upload method', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, { query: 'img' });
        });

        it('should handle FileList data', () => {
            const mockFiles = [
                new File(['content1'], 'file1.txt', { type: 'text/plain' }),
                new File(['content2'], 'file2.txt', { type: 'text/plain' })
            ];

            const uploadUrl = 'https://upload.example.com';
            const uploadHeader = { 'Authorization': 'Bearer token' };
            const callBack = jest.fn();
            const errorCallBack = jest.fn();

            fileManager.upload(uploadUrl, uploadHeader, mockFiles, callBack, errorCallBack);

            expect(mockUI.showLoading).toHaveBeenCalled();
            expect(fileManager.uploadFileLength).toBe(2);
            expect(fileManager.apiManager.call).toHaveBeenCalledWith({
                method: 'POST',
                url: uploadUrl,
                headers: uploadHeader,
                data: expect.any(FormData),
                callBack: callBack,
                errorCallBack: errorCallBack
            });
        });

        it('should handle FormData object', () => {
            const formData = new FormData();
            formData.append('file', new File(['content'], 'test.txt'));

            const data = {
                formData: formData,
                size: 1
            };

            fileManager.upload('https://upload.example.com', null, data);

            expect(fileManager.uploadFileLength).toBe(1);
            expect(fileManager.apiManager.call).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://upload.example.com',
                headers: null,
                data: formData,
                callBack: undefined,
                errorCallBack: undefined
            });
        });
    });

    describe('asyncUpload method', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, { query: 'img' });
        });

        it('should return promise and handle FileList', async () => {
            const mockFiles = [new File(['content'], 'test.txt', { type: 'text/plain' })];
            const uploadUrl = 'https://upload.example.com';
            const uploadHeader = { 'Content-Type': 'multipart/form-data' };

            const result = await fileManager.asyncUpload(uploadUrl, uploadHeader, mockFiles);

            expect(mockUI.showLoading).toHaveBeenCalled();
            expect(fileManager.uploadFileLength).toBe(1);
            expect(fileManager.apiManager.asyncCall).toHaveBeenCalledWith({
                method: 'POST',
                url: uploadUrl,
                headers: uploadHeader,
                data: expect.any(FormData)
            });
            expect(result.status).toBe(200);
        });

        it('should handle FormData object in async upload', async () => {
            const formData = new FormData();
            const data = { formData, size: 3 };

            await fileManager.asyncUpload('https://example.com', null, data);

            expect(fileManager.uploadFileLength).toBe(3);
            expect(fileManager.apiManager.asyncCall).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://example.com',
                headers: null,
                data: formData
            });
        });
    });

    describe('setFileData method', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, { query: 'img' });
        });

        it('should set file attributes on element', () => {
            const mockElement = {
                setAttribute: jest.fn()
            };

            fileManager.setFileData(mockElement, {
                name: 'test.jpg',
                size: 1024
            });

            expect(mockElement.setAttribute).toHaveBeenCalledWith('data-se-file-name', 'test.jpg');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('data-se-file-size', '1024');
        });

        it('should return early if element is null', () => {
            expect(() => {
                fileManager.setFileData(null, { name: 'test.jpg', size: 1024 });
            }).not.toThrow();
        });

        it('should return early if element is undefined', () => {
            expect(() => {
                fileManager.setFileData(undefined, { name: 'test.jpg', size: 1024 });
            }).not.toThrow();
        });
    });

    describe('getSize method', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, { query: 'img' });
        });

        it('should return 0 for empty info list', () => {
            expect(fileManager.getSize()).toBe(0);
        });

        it('should calculate total size from info list', () => {
            fileManager.infoList = [
                { size: 1024 },
                { size: 2048 },
                { size: 512 }
            ];

            expect(fileManager.getSize()).toBe(3584);
        });

        it('should handle string sizes by converting to numbers', () => {
            fileManager.infoList = [
                { size: '1024' },
                { size: '2048' }
            ];

            expect(fileManager.getSize()).toBe(3072);
        });

        it('should handle mixed number and string sizes', () => {
            fileManager.infoList = [
                { size: 1024 },
                { size: '512' },
                { size: 256 }
            ];

            expect(fileManager.getSize()).toBe(1792);
        });
    });

    describe('_checkInfo method', () => {
        let fileManager;
        let mockTags;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, {
                query: 'img[data-se-file]',
                loadHandler: jest.fn(),
                eventHandler: jest.fn()
            });

            mockTags = [
                {
                    getAttribute: jest.fn().mockReturnValue('1'),
                    removeAttribute: jest.fn(),
                    remove: jest.fn()
                },
                {
                    getAttribute: jest.fn().mockReturnValue('2'),
                    removeAttribute: jest.fn(),
                    remove: jest.fn()
                }
            ];

            mockWysiwyg.querySelectorAll.mockReturnValue(mockTags);
        });

        it('should handle loaded state with matching tags and info', () => {
            fileManager.infoList = [
                { index: 1, src: 'image1.jpg', name: 'image1.jpg', size: 1024 },
                { index: 2, src: 'image2.jpg', name: 'image2.jpg', size: 2048 }
            ];

            fileManager._checkInfo(true);

            expect(mockWysiwyg.querySelectorAll).toHaveBeenCalledWith('img[data-se-file]');
            expect(fileManager.loadHandler).toHaveBeenCalledWith(fileManager.infoList);
        });

        it('should handle orphaned tags by resetting attributes', () => {
            fileManager.infoList = [
                { index: 1 }
            ];

            // Mock tag with index 3 (orphaned)
            mockTags[1].getAttribute.mockReturnValue('3');

            fileManager._checkInfo(false);

            expect(mockTags[1].removeAttribute).toHaveBeenCalledWith('data-se-index');
        });

        it('should handle components info reset', () => {
            mockEditor._componentsInfoReset = true;
            fileManager.infoList = [
                { index: 1 }
            ];

            fileManager._checkInfo(false);

            expect(mockEditor._componentsInfoReset).toBe(true);
        });
    });

    describe('_resetInfo method', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, {
                query: 'img',
                eventHandler: jest.fn()
            });
        });

        it('should call eventHandler for each file in infoList', () => {
            fileManager.infoList = [
                { index: 1, src: 'test1.jpg' },
                { index: 2, src: 'test2.jpg' }
            ];

            fileManager._resetInfo();

            expect(fileManager.eventHandler).toHaveBeenCalledTimes(2);
        });

        it('should reset infoList and infoIndex', () => {
            fileManager.infoList = [{ index: 1 }];
            fileManager.infoIndex = 5;

            fileManager._resetInfo();

            expect(fileManager.infoList).toEqual([]);
            expect(fileManager.infoIndex).toBe(0);
        });
    });

    describe('Error handling and edge cases', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, { query: 'img' });
        });

        it('should handle empty query selector results', () => {
            mockWysiwyg.querySelectorAll.mockReturnValue([]);

            expect(() => {
                fileManager._checkInfo(true);
            }).not.toThrow();
        });

        it('should handle missing loadHandler gracefully', () => {
            const fileManagerWithoutHandler = new FileManager(mockInst, { query: 'img' });
            fileManagerWithoutHandler.infoList = [{ index: 1 }];

            expect(() => {
                fileManagerWithoutHandler._checkInfo(true);
            }).not.toThrow();
        });

        it('should handle missing eventHandler gracefully', () => {
            const fileManagerWithoutHandler = new FileManager(mockInst, { query: 'img' });
            fileManagerWithoutHandler.infoList = [{ index: 1 }];

            expect(() => {
                fileManagerWithoutHandler._resetInfo();
            }).not.toThrow();
        });
    });

});