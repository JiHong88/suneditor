
// ─── Mocks ───────────────────────────────────────────────────────────────────
// jest.mock factories are hoisted before any variable declarations, so we
// create the symbol INSIDE the factory and retrieve it via the import below.
jest.mock('../../../../../../src/helper', () => {
    const NO_EVENT = Symbol('NO_EVENT');
    return { env: { NO_EVENT } };
});

// Mock image.constants so FORMAT_TYPE.INLINE is predictable
jest.mock('../../../../../../src/plugins/modal/image/shared/image.constants', () => ({
    FORMAT_TYPE: {
        BLOCK: 'block',
        INLINE: 'inline',
    },
}));

import ImageUploadService from '../../../../../../src/plugins/modal/image/services/image.upload';
import { env } from '../../../../../../src/helper';

// The actual NO_EVENT symbol comes from the mocked module
const NO_EVENT = env.NO_EVENT;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a default mockMain with all dependencies in place.
 * Individual tests may override specific sub-properties after calling this.
 */
function buildMockMain(overrides = {}) {
    const mockFileManager = {
        upload: jest.fn(),
        setFileData: jest.fn(),
    };

    const mockUi = {
        hideLoading: jest.fn(),
        alertOpen: jest.fn(),
    };

    const mockEventManager = {
        triggerEvent: jest.fn().mockResolvedValue(NO_EVENT),
    };

    const mockComponent = {
        select: jest.fn(),
    };

    const mockSizeService = {
        setInputSize: jest.fn(),
    };

    const mockMain = {
        pluginOptions: {
            uploadUrl: 'http://localhost/upload',
            uploadHeaders: { Authorization: 'token' },
            canResize: true,
        },
        fileManager: mockFileManager,
        modal: { isUpdate: false },
        create: jest.fn(),
        createInline: jest.fn(),
        setState: jest.fn(),
        constructor: { key: 'image' },
        as: 'block',
        sizeService: mockSizeService,
        ...overrides,
    };

    // `$` is the kernel – expose ui, eventManager, component through it
    mockMain.$ = {
        ui: mockUi,
        eventManager: mockEventManager,
        component: mockComponent,
    };

    // Convenience references so tests can reach nested mocks easily
    mockMain.__ui = mockUi;
    mockMain.__eventManager = mockEventManager;
    mockMain.__component = mockComponent;
    mockMain.__fileManager = mockFileManager;
    mockMain.__sizeService = mockSizeService;

    return mockMain;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('ImageUploadService', () => {
    let service;
    let mockMain;

    beforeEach(() => {
        mockMain = buildMockMain();
        service = new ImageUploadService(mockMain);
    });

    // ── serverUpload ──────────────────────────────────────────────────────────

    describe('serverUpload', () => {
        it('returns early when info.files is falsy', () => {
            service.serverUpload({});
            expect(mockMain.__fileManager.upload).not.toHaveBeenCalled();
        });

        it('calls fileManager.upload when uploadUrl is a non-empty string', () => {
            const info = { files: [{ name: 'test.png' }] };
            service.serverUpload(info);

            expect(mockMain.__fileManager.upload).toHaveBeenCalledWith(
                'http://localhost/upload',
                { Authorization: 'token' },
                info.files,
                expect.any(Function),
                expect.any(Function)
            );
        });

        it('falls back to base64 when uploadUrl is an empty string', () => {
            const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,abc' };
            global.FileReader = jest.fn(() => mockReader);

            mockMain.pluginOptions.uploadUrl = '';
            const info = {
                files: [{ name: 'a.png' }],
                element: null,
                anchor: null,
                inputWidth: '300px',
                inputHeight: '200px',
                align: 'center',
                alt: 'alt',
            };

            service.serverUpload(info);

            expect(global.FileReader).toHaveBeenCalled();
            expect(mockReader.readAsDataURL).toHaveBeenCalledWith(info.files[0]);
        });

        it('falls back to base64 when uploadUrl is not a string', () => {
            const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,xyz' };
            global.FileReader = jest.fn(() => mockReader);

            mockMain.pluginOptions.uploadUrl = null;
            const info = {
                files: [{ name: 'b.png' }],
                element: null,
                anchor: null,
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'left',
                alt: '',
            };

            service.serverUpload(info);

            expect(global.FileReader).toHaveBeenCalled();
        });
    });

    // ── urlUpload ─────────────────────────────────────────────────────────────

    describe('urlUpload', () => {
        it('calls produce (create) when not updating', () => {
            mockMain.modal.isUpdate = false;
            const info = {
                url: 'http://example.com/img.png',
                files: null,
                alt: 'alt text',
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'left',
                anchor: undefined,
            };

            service.urlUpload(info);

            expect(mockMain.setState).toHaveBeenCalledWith('produceIndex', 0);
            expect(mockMain.create).toHaveBeenCalledWith(
                info.url, undefined, info.inputWidth, info.inputHeight, info.align, null, info.alt, true
            );
        });

        it('calls createInline when main.as is inline and not updating', () => {
            mockMain.modal.isUpdate = false;
            mockMain.as = 'inline';
            const info = {
                url: 'http://example.com/img.png',
                files: null,
                alt: 'alt',
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'left',
                anchor: undefined,
            };

            service.urlUpload(info);

            expect(mockMain.createInline).toHaveBeenCalledWith(
                info.url, undefined, info.inputWidth, info.inputHeight, null, info.alt, true
            );
        });

        it('updates existing image src when isUpdate is true', () => {
            mockMain.modal.isUpdate = true;
            const element = { src: '' };
            const info = {
                url: 'http://example.com/new.png',
                element,
                files: { name: 'new.png', size: 100 },
            };

            service.urlUpload(info);

            expect(element.src).toBe(info.url);
            expect(mockMain.__fileManager.setFileData).toHaveBeenCalledWith(element, info.files);
            expect(mockMain.__component.select).toHaveBeenCalledWith(element, 'image');
        });
    });

    // ── #UploadCallBack ───────────────────────────────────────────────────────

    describe('#UploadCallBack (via serverUpload callback)', () => {
        let successCb;
        let errorCb;
        let info;

        beforeEach(() => {
            info = {
                files: [{ name: 'test.png' }],
                isUpdate: false,
                anchor: null,
                inputWidth: '300px',
                inputHeight: '200px',
                align: 'center',
                alt: 'alt',
                element: null,
            };

            service.serverUpload(info);

            // Extract the callbacks passed to fileManager.upload
            [, , , successCb, errorCb] = mockMain.__fileManager.upload.mock.calls[0];
        });

        it('calls #register when triggerEvent returns NO_EVENT and response has no errorMessage', async () => {
            mockMain.__eventManager.triggerEvent.mockResolvedValue(NO_EVENT);

            const xmlHttp = {
                responseText: JSON.stringify({
                    result: [{ name: 'test.png', size: 1024, url: 'http://cdn.example.com/test.png' }],
                }),
            };

            await successCb(xmlHttp);

            expect(mockMain.setState).toHaveBeenCalledWith('produceIndex', 0);
            expect(mockMain.create).toHaveBeenCalled();
        });

        it('calls #error when triggerEvent returns NO_EVENT and response has errorMessage', async () => {
            mockMain.__eventManager.triggerEvent.mockResolvedValue(NO_EVENT);

            const xmlHttp = {
                responseText: JSON.stringify({ errorMessage: 'Upload failed' }),
            };

            await successCb(xmlHttp);

            expect(mockMain.__ui.alertOpen).toHaveBeenCalledWith('Upload failed', 'error');
        });

        it('does NOT call #register or #error when triggerEvent returns non-NO_EVENT', async () => {
            // triggerEvent returns something other than NO_EVENT → callback exits early
            mockMain.__eventManager.triggerEvent.mockResolvedValue('handled');

            const xmlHttp = {
                responseText: JSON.stringify({
                    result: [{ name: 'test.png', size: 1024, url: 'http://cdn.example.com/test.png' }],
                }),
            };

            await successCb(xmlHttp);

            expect(mockMain.setState).not.toHaveBeenCalledWith('produceIndex', 0);
            expect(mockMain.create).not.toHaveBeenCalled();
        });
    });

    // ── #register ─────────────────────────────────────────────────────────────

    describe('#register (via #UploadCallBack)', () => {
        async function callRegister(infoOverrides, resultItems) {
            const info = {
                files: [{ name: 'a.png' }],
                isUpdate: false,
                anchor: null,
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'none',
                alt: '',
                element: null,
                ...infoOverrides,
            };

            service.serverUpload(info);
            const [, , , successCb] = mockMain.__fileManager.upload.mock.calls[0];

            mockMain.__eventManager.triggerEvent.mockResolvedValue(NO_EVENT);

            const xmlHttp = {
                responseText: JSON.stringify({ result: resultItems }),
            };
            await successCb(xmlHttp);
        }

        it('calls #produce for each result when isUpdate=false (single file)', async () => {
            await callRegister({ isUpdate: false }, [
                { name: 'img.png', size: 100, url: 'http://cdn/img.png' },
            ]);
            expect(mockMain.create).toHaveBeenCalledTimes(1);
            expect(mockMain.create).toHaveBeenCalledWith(
                'http://cdn/img.png', null, '100px', '100px', 'none',
                { name: 'img.png', size: 100 }, '', true
            );
        });

        it('passes isLast=true only for the last item in multi-file result', async () => {
            await callRegister({ isUpdate: false }, [
                { name: 'a.png', size: 10, url: 'http://cdn/a.png' },
                { name: 'b.png', size: 20, url: 'http://cdn/b.png' },
            ]);
            expect(mockMain.create).toHaveBeenCalledTimes(2);

            const calls = mockMain.create.mock.calls;
            // 1st call – isLast should be false (i === 0, len === 2)
            expect(calls[0][calls[0].length - 1]).toBe(false);
            // 2nd call – isLast should be true  (i === 1, len === 2)
            expect(calls[1][calls[1].length - 1]).toBe(true);
        });

        it('calls #updateSrc and breaks on first item when isUpdate=true', async () => {
            const element = { src: '' };
            await callRegister(
                { isUpdate: true, element },
                [
                    { name: 'new.png', size: 50, url: 'http://cdn/new.png' },
                    { name: 'extra.png', size: 99, url: 'http://cdn/extra.png' },
                ]
            );

            expect(element.src).toBe('http://cdn/new.png');
            expect(mockMain.__fileManager.setFileData).toHaveBeenCalledTimes(1);
            // second item must NOT be processed
            expect(mockMain.create).not.toHaveBeenCalled();
        });

        it('calls createInline via #produce when main.as is inline', async () => {
            mockMain.as = 'inline';
            await callRegister({ isUpdate: false }, [
                { name: 'img.png', size: 100, url: 'http://cdn/img.png' },
            ]);
            expect(mockMain.createInline).toHaveBeenCalledTimes(1);
            expect(mockMain.create).not.toHaveBeenCalled();
        });
    });

    // ── #error ────────────────────────────────────────────────────────────────

    describe('#error (via #UploadCallBack)', () => {
        async function triggerError(triggerReturn, errorResponse) {
            const info = { files: [{ name: 'f.png' }] };
            service.serverUpload(info);
            const [, , , successCb] = mockMain.__fileManager.upload.mock.calls[0];

            mockMain.__eventManager.triggerEvent.mockResolvedValue(triggerReturn);

            const xmlHttp = {
                responseText: JSON.stringify(errorResponse),
            };
            await successCb(xmlHttp);
        }

        it('uses errorMessage from response when triggerEvent returns NO_EVENT', async () => {
            await triggerError(NO_EVENT, { errorMessage: 'Server error' });
            expect(mockMain.__ui.alertOpen).toHaveBeenCalledWith('Server error', 'error');
        });

        it('uses custom message from triggerEvent when it returns a truthy string', async () => {
            // For #error to be called we need to reach it directly.
            // We invoke the error callback (5th arg of fileManager.upload) directly.
            const info = { files: [{ name: 'f.png' }] };
            service.serverUpload(info);
            const [, , , , errorCb] = mockMain.__fileManager.upload.mock.calls[0];

            // triggerEvent returns a custom message string
            mockMain.__eventManager.triggerEvent.mockResolvedValue('Custom error message');

            await errorCb({ errorMessage: 'Original error' });

            // When message is truthy non-NO_EVENT: err = message
            expect(mockMain.__ui.alertOpen).toHaveBeenCalledWith('Custom error message', 'error');
        });

        it('falls back to response.errorMessage when triggerEvent returns falsy (empty string)', async () => {
            const info = { files: [{ name: 'f.png' }] };
            service.serverUpload(info);
            const [, , , , errorCb] = mockMain.__fileManager.upload.mock.calls[0];

            // triggerEvent returns '' (falsy, not NO_EVENT) → err = response.errorMessage
            mockMain.__eventManager.triggerEvent.mockResolvedValue('');

            await errorCb({ errorMessage: 'Fallback error' });

            expect(mockMain.__ui.alertOpen).toHaveBeenCalledWith('Fallback error', 'error');
        });
    });

    // ── #setBase64 ────────────────────────────────────────────────────────────

    describe('#setBase64 (via serverUpload with no uploadUrl)', () => {
        beforeEach(() => {
            mockMain.pluginOptions.uploadUrl = '';
        });

        it('hides loading and warns when files is empty and modal.isUpdate is false', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            service.serverUpload({
                files: [],
                element: null,
                anchor: null,
                inputWidth: '0',
                inputHeight: '0',
                align: 'none',
                alt: '',
                isUpdate: false,
            });

            expect(mockMain.__ui.hideLoading).toHaveBeenCalled();
            expect(warnSpy).toHaveBeenCalledWith(
                '[SUNEDITOR.image.base64.fail] cause : No applicable files'
            );

            warnSpy.mockRestore();
        });

        it('processes one file when modal.isUpdate is true (filesLen = 1)', () => {
            mockMain.modal.isUpdate = true;

            const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,A' };
            global.FileReader = jest.fn(() => mockReader);

            const info = {
                files: [{ name: 'img.png', size: 10 }, { name: 'img2.png', size: 20 }],
                element: { src: '' },
                anchor: null,
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'none',
                alt: '',
                isUpdate: true,
            };

            service.serverUpload(info);

            // Only one FileReader should be created even though there are 2 files
            expect(global.FileReader).toHaveBeenCalledTimes(1);
            expect(mockReader.readAsDataURL).toHaveBeenCalledWith(info.files[0]);
        });

        it('calls setInputSize when canResize is true', () => {
            const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,B' };
            global.FileReader = jest.fn(() => mockReader);

            service.serverUpload({
                files: [{ name: 'x.png', size: 5 }],
                element: null,
                anchor: null,
                inputWidth: '200px',
                inputHeight: '100px',
                align: 'center',
                alt: '',
                isUpdate: false,
            });

            expect(mockMain.__sizeService.setInputSize).toHaveBeenCalledWith('200px', '100px');
        });

        it('does NOT call setInputSize when canResize is false', () => {
            mockMain.pluginOptions.canResize = false;
            // Re-create service so constructor reads updated canResize
            service = new ImageUploadService(mockMain);

            const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,C' };
            global.FileReader = jest.fn(() => mockReader);

            service.serverUpload({
                files: [{ name: 'y.png', size: 7 }],
                element: null,
                anchor: null,
                inputWidth: '200px',
                inputHeight: '100px',
                align: 'center',
                alt: '',
                isUpdate: false,
            });

            expect(mockMain.__sizeService.setInputSize).not.toHaveBeenCalled();
        });

        it('onload fires: hides loading and calls #onRenderBase64 (update=false)', () => {
            let capturedOnload;
            const mockReader = {
                result: 'data:image/png;base64,DATA',
                readAsDataURL: jest.fn(),
                set onload(fn) { capturedOnload = fn; },
            };
            global.FileReader = jest.fn(() => mockReader);

            const info = {
                files: [{ name: 'z.png', size: 8 }],
                element: null,
                anchor: null,
                inputWidth: '50px',
                inputHeight: '50px',
                align: 'none',
                alt: 'z',
                isUpdate: false,
            };

            service.serverUpload(info);

            // Simulate the FileReader.onload firing
            capturedOnload();

            expect(mockMain.__ui.hideLoading).toHaveBeenCalled();
            // #onRenderBase64 → #produce → create (as='block')
            expect(mockMain.create).toHaveBeenCalledWith(
                'data:image/png;base64,DATA',
                null, '50px', '50px', 'none',
                { name: 'z.png', size: 8 },
                'z',
                true  // isLast (only one file)
            );
        });

        it('onload fires: calls #updateSrc when update=true', () => {
            let capturedOnload;
            const mockReader = {
                result: 'data:image/png;base64,UPDATED',
                readAsDataURL: jest.fn(),
                set onload(fn) { capturedOnload = fn; },
            };
            global.FileReader = jest.fn(() => mockReader);

            const element = { src: '' };
            mockMain.modal.isUpdate = true;

            const info = {
                files: [{ name: 'u.png', size: 3 }],
                element,
                anchor: null,
                inputWidth: '80px',
                inputHeight: '80px',
                align: 'left',
                alt: '',
                isUpdate: true,
            };

            service.serverUpload(info);
            capturedOnload();

            expect(element.src).toBe('data:image/png;base64,UPDATED');
            expect(mockMain.__fileManager.setFileData).toHaveBeenCalledWith(
                element,
                { name: 'u.png', size: 3 }
            );
        });

        it('multiple files: onload defers until all readers complete', () => {
            const readers = [];
            const onloads = [];

            global.FileReader = jest.fn(() => {
                const r = {
                    result: `data:image/png;base64,FILE${readers.length}`,
                    readAsDataURL: jest.fn(),
                    set onload(fn) { onloads.push(fn); },
                };
                readers.push(r);
                return r;
            });

            mockMain.pluginOptions.canResize = false;
            service = new ImageUploadService(mockMain);

            const info = {
                files: [
                    { name: 'a.png', size: 1 },
                    { name: 'b.png', size: 2 },
                ],
                element: null,
                anchor: null,
                inputWidth: '10px',
                inputHeight: '10px',
                align: 'none',
                alt: '',
                isUpdate: false,
            };

            service.serverUpload(info);

            // Fire first onload – hideLoading must NOT be called yet
            onloads[0]();
            expect(mockMain.__ui.hideLoading).not.toHaveBeenCalled();
            expect(mockMain.create).not.toHaveBeenCalled();

            // Fire second onload – now everything should complete
            onloads[1]();
            expect(mockMain.__ui.hideLoading).toHaveBeenCalledTimes(1);
            expect(mockMain.create).toHaveBeenCalledTimes(2);
        });

        it('throws wrapped Error when FileReader constructor throws', () => {
            global.FileReader = jest.fn(() => {
                throw new Error('FileReader not available');
            });

            mockMain.__ui.hideLoading = jest.fn();

            expect(() => {
                service.serverUpload({
                    files: [{ name: 'err.png', size: 1 }],
                    element: null,
                    anchor: null,
                    inputWidth: '10px',
                    inputHeight: '10px',
                    align: 'none',
                    alt: '',
                    isUpdate: false,
                });
            }).toThrow('[SUNEDITOR.plugins.image._setBase64.fail]');

            expect(mockMain.__ui.hideLoading).toHaveBeenCalled();
        });
    });

    // ── #onRenderBase64 ───────────────────────────────────────────────────────

    describe('#onRenderBase64 (via setBase64 onload)', () => {
        beforeEach(() => {
            mockMain.pluginOptions.uploadUrl = '';
        });

        it('calls #produce (create) for each item when update=false', () => {
            const readers = [];
            const onloads = [];

            global.FileReader = jest.fn(() => {
                const idx = readers.length;
                const r = {
                    get result() { return `data:image/png;base64,IMG${idx}`; },
                    readAsDataURL: jest.fn(),
                    set onload(fn) { onloads.push(fn); },
                };
                readers.push(r);
                return r;
            });

            mockMain.pluginOptions.canResize = false;
            service = new ImageUploadService(mockMain);

            const files = [
                { name: 'p.png', size: 10 },
                { name: 'q.png', size: 20 },
            ];

            service.serverUpload({
                files,
                element: null,
                anchor: 'anchor-node',
                inputWidth: '300px',
                inputHeight: '200px',
                align: 'right',
                alt: 'alt',
                isUpdate: false,
            });

            onloads[0]();
            onloads[1]();

            // Both files should be produced
            expect(mockMain.create).toHaveBeenCalledTimes(2);
        });

        it('calls #updateSrc for each item when update=true', () => {
            let capturedOnload;
            const element = { src: '' };
            const mockReader = {
                result: 'data:image/png;base64,UPD',
                readAsDataURL: jest.fn(),
                set onload(fn) { capturedOnload = fn; },
            };
            global.FileReader = jest.fn(() => mockReader);
            mockMain.modal.isUpdate = true;

            service.serverUpload({
                files: [{ name: 'upd.png', size: 5 }],
                element,
                anchor: null,
                inputWidth: '100px',
                inputHeight: '100px',
                align: 'none',
                alt: '',
                isUpdate: true,
            });

            capturedOnload();

            expect(element.src).toBe('data:image/png;base64,UPD');
            expect(mockMain.__fileManager.setFileData).toHaveBeenCalled();
        });
    });
});
