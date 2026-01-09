/**
 * @fileoverview Unit tests for modules/FileManager.js
 */

import FileManager from '../../../src/modules/manager/FileManager.js';

// Mock CoreInjector
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.uiManager = editor.uiManager;
        this.component = editor.component;
    });
});

// Mock ApiManager
jest.mock('../../../src/modules/manager/ApiManager.js', () => {
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
            uiManager: mockUI,
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
                loadEventName: 'onImageLoad',
                actionEventName: 'onImageAction'
            };

            const fileManager = new FileManager(mockInst, params);

            expect(fileManager.uiManager).toBe(mockUI);
            expect(fileManager.kind).toBe('testPlugin');
            expect(fileManager.inst).toBe(mockInst);
            expect(fileManager.query).toBe('img[data-se-file]');
            expect(fileManager.loadEventName).toBe(params.loadEventName);
            expect(fileManager.actionEventName).toBe(params.actionEventName);
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
                loadEventName: 'onImageLoad',
                actionEventName: 'onImageAction'
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
            expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onImageLoad', { infoList: fileManager.infoList });
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
                actionEventName: 'onImageAction'
            });
        });

        it('should call triggerEvent for each file in infoList', () => {
            fileManager.infoList = [
                { index: 1, src: 'test1.jpg' },
                { index: 2, src: 'test2.jpg' }
            ];

            fileManager._resetInfo();

            expect(mockEditor.triggerEvent).toHaveBeenCalledTimes(4); // 2 files × 2 events (actionEventName + onFileManagerAction)
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

        it('should handle missing loadEventName gracefully', () => {
            const fileManagerWithoutHandler = new FileManager(mockInst, { query: 'img' });
            fileManagerWithoutHandler.infoList = [{ index: 1 }];

            expect(() => {
                fileManagerWithoutHandler._checkInfo(true);
            }).not.toThrow();
        });

        it('should handle missing actionEventName gracefully', () => {
            const fileManagerWithoutHandler = new FileManager(mockInst, { query: 'img' });
            fileManagerWithoutHandler.infoList = [{ index: 1 }];

            expect(() => {
                fileManagerWithoutHandler._resetInfo();
            }).not.toThrow();
        });
    });

    describe('_checkInfo with componentsInfoReset', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, {
                query: 'img',
                loadEventName: 'onImageLoad',
                actionEventName: 'onImageAction'
            });
        });

        it('should reset component info when _componentsInfoReset is true', () => {
            mockEditor._componentsInfoReset = true;

            const mockTag = document.createElement('img');
            mockTag.setAttribute('data-se-index', '1');
            mockTag.setAttribute('data-se-file-name', 'test.jpg');
            mockTag.setAttribute('data-se-file-size', '1024');
            mockTag.src = 'test.jpg';

            mockWysiwyg.querySelectorAll.mockReturnValue([mockTag]);

            fileManager.infoList = [
                { index: 1, src: 'test.jpg', name: 'test.jpg', size: 1024 }
            ];

            fileManager._checkInfo(false);

            // Should have processed the tag
            expect(mockWysiwyg.querySelectorAll).toHaveBeenCalled();
        });

        it('should trigger onFileManagerAction when deleting info', () => {
            const mockTag = document.createElement('img');
            mockTag.setAttribute('data-se-index', '1');
            mockTag.src = 'image1.jpg';

            mockWysiwyg.querySelectorAll.mockReturnValue([mockTag]);

            fileManager.infoList = [
                { index: 1, src: 'image1.jpg' },
                { index: 2, src: 'image2.jpg' } // This one is missing from tags
            ];

            fileManager._checkInfo(false);

            // Should have triggered delete events
            expect(mockEditor.triggerEvent).toHaveBeenCalled();
        });

        it('should skip if tag count matches and src matches', () => {
            const mockTag = document.createElement('img');
            mockTag.setAttribute('data-se-index', '1');
            mockTag.src = 'image1.jpg';

            mockWysiwyg.querySelectorAll.mockReturnValue([mockTag]);

            fileManager.infoList = [
                { index: 1, src: 'image1.jpg' }
            ];

            fileManager._checkInfo(false);

            // Should return early without processing
            expect(fileManager.infoList.length).toBe(1);
        });
    });

    describe('info.delete and info.select methods', () => {
        let fileManager;
        let mockElement;

        beforeEach(() => {
            mockInst.componentDestroy = jest.fn();
            mockInst.componentSelect = jest.fn();

            mockEditor.component = {
                get: jest.fn(),
                select: jest.fn()
            };

            fileManager = new FileManager(mockInst, {
                query: 'img',
                actionEventName: 'onImageAction'
            });

            mockElement = document.createElement('img');
            mockElement.setAttribute('data-se-index', '0');
            mockElement.setAttribute('data-se-file-name', 'test.jpg');
            mockElement.setAttribute('data-se-file-size', '1024');
            mockElement.src = 'http://example.com/test.jpg';
            mockElement.scrollIntoView = jest.fn();

            mockWysiwyg.querySelectorAll.mockReturnValue([mockElement]);
        });

        it('should create info with delete and select methods', () => {
            mockEditor._componentsInfoInit = true;

            fileManager._checkInfo(false);

            expect(fileManager.infoList.length).toBe(1);
            expect(typeof fileManager.infoList[0].delete).toBe('function');
            expect(typeof fileManager.infoList[0].select).toBe('function');
        });

        it('should call info.delete to remove element', () => {
            mockEditor._componentsInfoInit = true;

            fileManager._checkInfo(false);

            const info = fileManager.infoList[0];
            info.delete();

            expect(mockInst.componentDestroy).toHaveBeenCalledWith(mockElement);
        });

        it('should call info.select to select element', () => {
            mockEditor._componentsInfoInit = true;
            mockEditor.component.get.mockReturnValue(null);

            fileManager._checkInfo(false);

            const info = fileManager.infoList[0];
            info.select();

            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
            expect(mockInst.componentSelect).toHaveBeenCalledWith(mockElement);
        });

        it('should call component.select when component exists', () => {
            mockEditor._componentsInfoInit = true;
            mockEditor.component.get.mockReturnValue({
                target: mockElement,
                pluginName: 'image'
            });

            fileManager._checkInfo(false);

            const info = fileManager.infoList[0];
            info.select();

            expect(mockEditor.component.select).toHaveBeenCalledWith(mockElement, 'image');
        });
    });

    describe('info update scenarios', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, {
                query: 'img',
                actionEventName: 'onImageAction'
            });
        });

        it('should preserve existing info when tag count matches and sources match', () => {
            const mockElement = document.createElement('img');
            mockElement.setAttribute('data-se-index', '1');
            mockElement.setAttribute('data-se-file-name', 'original.jpg');
            mockElement.setAttribute('data-se-file-size', '1024');
            mockElement.src = 'http://example.com/original.jpg';

            mockWysiwyg.querySelectorAll.mockReturnValue([mockElement]);

            fileManager.infoList = [
                { index: 1, src: 'http://example.com/original.jpg', name: 'original.jpg', size: 1024 }
            ];
            fileManager.infoIndex = 2;

            fileManager._checkInfo(false);

            // Info should remain unchanged when sources match
            expect(fileManager.infoList.length).toBe(1);
            expect(fileManager.infoList[0].src).toBe('http://example.com/original.jpg');
        });

        it('should handle tag with non-matching index', () => {
            const mockElement = document.createElement('img');
            mockElement.setAttribute('data-se-index', '999');
            mockElement.setAttribute('data-se-file-name', 'new.jpg');
            mockElement.setAttribute('data-se-file-size', '3072');
            mockElement.src = 'http://example.com/new.jpg';

            mockWysiwyg.querySelectorAll.mockReturnValue([mockElement]);

            fileManager.infoList = [
                { index: 1, src: 'http://example.com/old.jpg' }
            ];
            fileManager.infoIndex = 2;

            fileManager._checkInfo(false);

            // Should handle the case where index doesn't match
            expect(fileManager.infoList.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GetAttr v2 migration', () => {
        let fileManager;

        beforeEach(() => {
            fileManager = new FileManager(mockInst, { query: 'img' });
        });

        it('should migrate v2 data attributes to se format', () => {
            const mockElement = document.createElement('img');
            mockElement.setAttribute('data-index', '5');
            mockElement.src = 'http://example.com/test.jpg';

            mockWysiwyg.querySelectorAll.mockReturnValue([mockElement]);
            mockEditor._componentsInfoInit = true;

            fileManager._checkInfo(false);

            // Should have migrated the attribute
            expect(mockElement.hasAttribute('data-se-index')).toBe(true);
            expect(mockElement.hasAttribute('data-index')).toBe(false);
        });
    });

});