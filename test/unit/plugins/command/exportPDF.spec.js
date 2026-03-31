/**
 * @fileoverview Unit tests for plugins/command/exportPDF.js
 */

import ExportPDF from '../../../../src/plugins/command/exportPDF.js';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock ApiManager module
const mockApiManager = {
    asyncCall: jest.fn()
};

jest.mock('../../../../src/modules/manager', () => ({
    ApiManager: jest.fn().mockImplementation(() => mockApiManager)
}));

// Mock helper
jest.mock('../../../../src/helper', () => ({
    dom: {
        utils: {
            createElement: jest.fn().mockImplementation((tag, attrs, content) => {
                const element = {
                    tagName: tag.toUpperCase(),
                    className: attrs?.class || '',
                    innerHTML: content || '',
                    outerHTML: `<${tag.toLowerCase()}>${content || ''}</${tag.toLowerCase()}>`,
                    style: {},
                    getAttribute: jest.fn(),
                    setAttribute: jest.fn(),
                    click: jest.fn()
                };
                if (attrs) {
                    Object.keys(attrs).forEach(key => {
                        if (key === 'class') element.className = attrs[key];
                        else if (key === 'style') element.style = attrs[key];
                        else element.setAttribute(key, attrs[key]);
                    });
                }
                return element;
            }),
            applyInlineStylesAll: jest.fn().mockReturnValue({
                style: {
                    padding: '10px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '10px',
                    paddingRight: '10px'
                },
                outerHTML: '<div>styled content</div>'
            }),
            removeItem: jest.fn()
        }
    },
    env: {
        _w: {
            getComputedStyle: jest.fn().mockReturnValue({ padding: '10px' }),
            setTimeout: jest.fn().mockImplementation((fn) => fn()),
            URL: {
                createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
                revokeObjectURL: jest.fn()
            }
        },
        _d: {
            body: {
                appendChild: jest.fn()
            }
        }
    }
}));

// Mock global objects
global.Blob = jest.fn().mockImplementation((data, options) => ({
    data,
    type: options?.type || 'application/octet-stream'
}));

global.URL = {
    createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
    revokeObjectURL: jest.fn()
};

describe('Plugins - Command - ExportPDF', () => {
    let kernel;
    let exportPDF;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
    });


    describe('Constructor', () => {

        it('should use default fileName when not provided', () => {
            const pluginOptions = {
                apiUrl: '/api/export-pdf'
            };

            exportPDF = new ExportPDF(kernel, pluginOptions);

            expect(exportPDF.fileName).toBe('suneditor-pdf');
        });

        it('should warn and not create apiManager when apiUrl is missing', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const pluginOptions = {};

            exportPDF = new ExportPDF(kernel, pluginOptions);

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.exportPDF.error] Requires exportPDF."apiUrl" options.');
            expect(exportPDF.apiManager).toBeUndefined();

            consoleSpy.mockRestore();
        });

        it('should create ApiManager with correct options', () => {
            const pluginOptions = {
                apiUrl: '/api/export-pdf'
            };

            exportPDF = new ExportPDF(kernel, pluginOptions);

            const { ApiManager } = require('../../../../src/modules/manager');
            expect(ApiManager).toHaveBeenCalledWith(
                exportPDF,
                expect.any(Object), // this.$
                {
                    method: 'POST',
                    url: '/api/export-pdf',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob'
                }
            );
        });
    });

    describe('action method', () => {
        beforeEach(() => {
            const pluginOptions = {
                apiUrl: '/api/export-pdf',
                fileName: 'test-file'
            };
            exportPDF = new ExportPDF(kernel, pluginOptions);
        });

        it('should warn and return early when apiUrl is missing', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            exportPDF.apiUrl = null;

            await exportPDF.action();

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.exportPDF.error] Requires exportPDF."apiUrl" options.');
            expect(kernel.uiManager.showLoading).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should create temporary element and process PDF export', async () => {
            mockApiManager.asyncCall.mockResolvedValue({
                status: 200,
                response: new ArrayBuffer(8),
                getResponseHeader: jest.fn().mockReturnValue('attachment; filename="test.pdf"')
            });

            const { dom } = require('../../../../src/helper');
            await exportPDF.action();

            expect(kernel.uiManager.showLoading).toHaveBeenCalled();
            expect(dom.utils.createElement).toHaveBeenCalledWith('div',
                { class: 'se-wysiwyg-frame' },
                expect.any(String)
            );
            expect(dom.utils.applyInlineStylesAll).toHaveBeenCalled();
            expect(kernel.uiManager.hideLoading).toHaveBeenCalled();
        });

        it('should handle triggerEvent onExportPDFBefore returning false', async () => {
            kernel.$.eventManager.triggerEvent.mockResolvedValue(false);

            await exportPDF.action();

            expect(kernel.$.eventManager.triggerEvent).toHaveBeenCalledWith('onExportPDFBefore', expect.any(Object));
            expect(mockApiManager.asyncCall).not.toHaveBeenCalled();
        });

        it('should handle documentTypePageMirror frame context', async () => {
            kernel.$.frameContext.set('documentTypePageMirror', {
                className: 'se-page-mirror',
                innerHTML: '<div>Page content</div>'
            });

            mockApiManager.asyncCall.mockResolvedValue({
                status: 200,
                response: new ArrayBuffer(8),
                getResponseHeader: jest.fn().mockReturnValue('attachment; filename="test.pdf"')
            });

            const { dom } = require('../../../../src/helper');
            await exportPDF.action();

            expect(dom.utils.createElement).toHaveBeenCalledWith('div',
                { class: 'se-page-mirror' },
                '<div>Page content</div>'
            );
        });

        it('should handle server error response', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockApiManager.asyncCall.mockResolvedValue({
                status: 500,
                responseText: JSON.stringify({ errorMessage: 'Server error' })
            });

            await exportPDF.action();

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.exportPDF.error]', expect.stringContaining('Server error'));
            consoleSpy.mockRestore();
        });

        it('should handle exception during processing', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockImplementation(() => {
                throw new Error('DOM error');
            });

            await exportPDF.action();

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.exportPDF.error]', 'DOM error');
            expect(kernel.uiManager.hideLoading).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should clean up temporary element in finally block', async () => {
            mockApiManager.asyncCall.mockRejectedValue(new Error('Network error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const { dom } = require('../../../../src/helper');
            await exportPDF.action();

            expect(dom.utils.removeItem).toHaveBeenCalled();
            expect(kernel.uiManager.hideLoading).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('PDF download functionality', () => {
        beforeEach(() => {
            const pluginOptions = {
                apiUrl: '/api/export-pdf',
                fileName: 'test-download'
            };
            exportPDF = new ExportPDF(kernel, pluginOptions);
        });

        it('should create and trigger download link', async () => {
            const mockResponse = new ArrayBuffer(8);
            mockApiManager.asyncCall.mockResolvedValue({
                status: 200,
                response: mockResponse,
                getResponseHeader: jest.fn().mockReturnValue('attachment; filename="downloaded.pdf"')
            });

            const { dom, env } = require('../../../../src/helper');
            const mockAnchor = { click: jest.fn() };
            dom.utils.createElement.mockImplementation((tag, attrs) => {
                if (tag === 'A' && attrs.download) {
                    return mockAnchor;
                }
                return {
                    tagName: tag.toUpperCase(),
                    className: '',
                    innerHTML: '',
                    outerHTML: `<${tag.toLowerCase()}></${tag.toLowerCase()}>`,
                    style: {}
                };
            });

            await exportPDF.action();

            expect(global.Blob).toHaveBeenCalledWith([mockResponse], { type: 'application/pdf' });
            expect(env._d.body.appendChild).toHaveBeenCalledWith(mockAnchor);
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it('should use fallback filename when Content-Disposition is missing', async () => {
            mockApiManager.asyncCall.mockResolvedValue({
                status: 200,
                response: new ArrayBuffer(8),
                getResponseHeader: jest.fn().mockReturnValue('')
            });

            const { dom } = require('../../../../src/helper');
            let downloadAttr = '';
            dom.utils.createElement.mockImplementation((tag, attrs) => {
                if (tag === 'A' && attrs.download) {
                    downloadAttr = attrs.download;
                    return { click: jest.fn() };
                }
                return {
                    tagName: tag.toUpperCase(),
                    className: '',
                    innerHTML: '',
                    outerHTML: `<${tag.toLowerCase()}></${tag.toLowerCase()}>`,
                    style: {}
                };
            });

            await exportPDF.action();

            expect(downloadAttr).toBe('test-download.pdf');
        });

        it('should handle non-200 status without responseText', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockApiManager.asyncCall.mockResolvedValue({
                status: 500,
                responseText: ''
            });

            await exportPDF.action();

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.exportPDF.error]', expect.stringContaining('undefined'));
            consoleSpy.mockRestore();
        });
    });

    describe('Error handling', () => {
        beforeEach(() => {
            const pluginOptions = {
                apiUrl: '/api/export-pdf'
            };
            exportPDF = new ExportPDF(kernel, pluginOptions);
        });

        it('should handle missing frameContext gracefully', async () => {
            kernel.$.frameContext = new Map();
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await exportPDF.action();

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should handle apiManager call failure', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockApiManager.asyncCall.mockRejectedValue(new Error('API call failed'));

            await exportPDF.action();

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.exportPDF.error]', 'API call failed');
            expect(kernel.uiManager.hideLoading).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Integration', () => {
        it('should work with all required editor modules', () => {
            const pluginOptions = {
                apiUrl: '/api/export-pdf'
            };

            expect(() => {
                new ExportPDF(kernel, pluginOptions);
            }).not.toThrow();
        });

        it('should handle missing editor properties gracefully', () => {
            const incompleteEditor = createMockEditor();
            const pluginOptions = {
                apiUrl: '/api/export-pdf'
            };

            expect(() => {
                new ExportPDF(incompleteEditor, pluginOptions);
            }).not.toThrow();
        });
    });
});