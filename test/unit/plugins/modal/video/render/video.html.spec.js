import { CreateHTML_modal } from '../../../../../../src/plugins/modal/video/render/video.html';

// Mock dependencies
jest.mock('../../../../../../src/modules/contract', () => ({
    Modal: {
        CreateFileInput: jest.fn().mockReturnValue(`
            <div class="se-modal-form-files">
                <div class="se-flex-input-wrapper">
                    <input class="se-input-form __se__file_input" type="file" />
                </div>
                <button type="button" class="se-btn se-file-remove"></button>
            </div>
        `)
    }
}));

jest.mock('../../../../../../src/helper', () => ({
    dom: {
        utils: {
            createTooltipInner: jest.fn(text => `<span>${text}</span>`),
            createElement: jest.fn()
        }
    }
}));

describe('CreateHTML_modal', () => {
    let mockEditor;
    let mockPluginOptions;

    beforeEach(() => {
        const { dom } = require('../../../../../../src/helper');
        dom.utils.createElement.mockImplementation((tag, attrs, html) => {
            const el = document.createElement(tag || 'div');
            // Apply attributes if provided
            if (attrs && typeof attrs === 'object') {
                Object.entries(attrs).forEach(([key, value]) => {
                    if (key === 'class') el.className = value;
                    else el.setAttribute(key, value);
                });
            }
            // Check if html is provided
            if (html) {
                el.innerHTML = html;
            }
            return el;
        });

        mockEditor = {
            lang: {
                close: 'Close',
                video_modal_title: 'Video',
                video_modal_file: 'File',
                video_modal_url: 'URL',
                videoGallery: 'Gallery',
                width: 'Width',
                height: 'Height',
                ratio: 'Ratio',
                revert: 'Revert',
                proportion: 'Proportion',
                basic: 'Basic',
                left: 'Left',
                center: 'Center',
                right: 'Right',
                submitButton: 'Submit'
            },
            icons: {
                cancel: 'x',
                video_gallery: 'gallery',
                revert: 'undo'
            },
            plugins: {
                videoGallery: true
            }
        };

        mockPluginOptions = {
            createFileInput: true,
            createUrlInput: true,
            canResize: true,
            showHeightInput: true,
            showRatioOption: true,
            defaultRatio: 0.5625,
            ratioOptions: [{ name: '16:9', value: 0.5625 }],
            percentageOnlySize: false
        };
    });

    it('should create all elements with full options', () => {
        const result = CreateHTML_modal(mockEditor, mockPluginOptions);

        expect(result.html).toBeDefined();
        expect(result.videoInputFile).not.toBeNull();
        expect(result.videoUrlFile).not.toBeNull();
        expect(result.inputX).not.toBeNull();
        expect(result.inputY).not.toBeNull();
        expect(result.frameRatioOption).not.toBeNull();
    });

    it('should hide resize inputs when canResize is false', () => {
        mockPluginOptions.canResize = false;
        const result = CreateHTML_modal(mockEditor, mockPluginOptions);

        expect(result.inputX).toBeNull();
        expect(result.inputY).toBeNull();
    });

    it('should hide file input when createFileInput is false', () => {
        mockPluginOptions.createFileInput = false;
        const result = CreateHTML_modal(mockEditor, mockPluginOptions);

        expect(result.videoInputFile).toBeNull();
    });

    it('should hide gallery button when plugin is missing', () => {
        mockEditor.plugins.videoGallery = false;
        const result = CreateHTML_modal(mockEditor, mockPluginOptions);

        expect(result.galleryButton).toBeNull();
    });

    it('should handle percentageOnlySize option', () => {
        mockPluginOptions.percentageOnlySize = true;
        const result = CreateHTML_modal(mockEditor, mockPluginOptions);

        expect(result.inputX.getAttribute('type')).toBe('number');
        expect(result.inputX.getAttribute('max')).toBe('100');
    });
});
