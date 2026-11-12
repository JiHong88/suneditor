
import { CreateHTML_modal } from '../../../../../../src/plugins/modal/image/render/image.html';

// Mock dependencies
jest.mock('../../../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn(),
			createTooltipInner: jest.fn().mockReturnValue('<span class="tooltip">tooltip</span>')
		}
	}
}));

jest.mock('../../../../../../src/modules/contract', () => ({
	Modal: {
		CreateFileInput: jest.fn().mockReturnValue('<input type="file" class="__se__file_input" />')
	}
}));

import { Modal } from '../../../../../../src/modules/contract';
import { dom } from '../../../../../../src/helper';

describe('CreateHTML_modal', () => {
    let mockLang;
    let mockIcons;
    let mockPlugins;
    let mockOptions;

    beforeEach(() => {
        dom.utils.createElement.mockImplementation((tag, attrs, content) => {
            const el = document.createElement(tag);
            if (attrs && attrs.class) el.className = attrs.class;
            if (content) el.innerHTML = content;
            return el;
        });
        mockLang = {
            image_modal_file: 'File',
            image_modal_url: 'URL',
            width: 'Width',
            height: 'Height',
            proportion: 'Proportion',
            revert: 'Revert',
            image_modal_title: 'Image',
            image: 'Image',
            link: 'Link',
            image_modal_altText: 'Alt Text',
            caption: 'Caption',
            basic: 'Basic',
            left: 'Left',
            center: 'Center',
            right: 'Right',
            submitButton: 'Submit',
            imageGallery: 'Gallery',
            blockStyle: 'Block',
            inlineStyle: 'Inline'
        };
        mockIcons = {
            image_gallery: '<svg>gallery</svg>',
            revert: '<svg>revert</svg>',
            cancel: '<svg>cancel</svg>',
            as_block: '<svg>block</svg>',
            as_inline: '<svg>inline</svg>'
        };
        mockPlugins = {};
        mockOptions = {
            createFileInput: true,
            createUrlInput: true,
            canResize: true,
            showHeightInput: true,
            useFormatType: true
        };
        
        Modal.CreateFileInput.mockClear();
    });

    it('should create modal HTML with all options enabled', () => {
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);

        expect(result.html).toBeDefined();
        // Check for file input (via mock)
        expect(Modal.CreateFileInput).toHaveBeenCalled();
        // Check for specific elements existence
        expect(result.imgInputFile).not.toBeNull(); // It might be null in JSDOM if not rendered by innerHTML properly?
        // Note: document.createElement behavior in jest (jsdom) parses innerHTML.
        // So querySelector should work if the structure matches.
        
        expect(result.imgUrlFile).toBeTruthy();
        expect(result.inputX).toBeTruthy();
        expect(result.asBlock).toBeTruthy();
    });

    it('should not render file input if createFileInput is false', () => {
        mockOptions.createFileInput = false;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        
        expect(Modal.CreateFileInput).not.toHaveBeenCalled();
        expect(result.imgInputFile).toBeNull();
    });

    it('should not render url input if createUrlInput is false', () => {
        mockOptions.createUrlInput = false;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        
        expect(result.imgUrlFile).toBeNull();
    });

    it('should not render resize controls if canResize is false', () => {
        mockOptions.canResize = false;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        
        expect(result.inputX).toBeNull();
        expect(result.inputY).toBeNull();
    });

    it('should show the height controls by default', () => {
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        const hidden = [...result.html.querySelectorAll('._se_tab_content_image [style]')];

        expect(result.inputY.style.display).toBe('');
        expect(hidden).toHaveLength(0);
    });

    it('should hide the height input, its label, the "x" separator and the proportion check if showHeightInput is false (#1729)', () => {
        mockOptions.showHeightInput = false;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        const isHidden = (el) => el.style.display === 'none' && el.style.getPropertyPriority('display') === 'important';

        expect(isHidden(result.inputY)).toBe(true);
        expect(isHidden(result.html.querySelector('.se-modal-size-text .size-h'))).toBe(true);
        expect(isHidden(result.html.querySelector('label.se-modal-size-x:not(.se-modal-size-text *)'))).toBe(true);
        expect(isHidden(result.proportion.parentElement)).toBe(true);
        // width stays
        expect(result.inputX.style.display).toBe('');
        expect(result.html.querySelector('.size-w').style.display).toBe('');
    });

    it('should render a 1-100 width number input with "%" and hide the height controls if percentageOnlySize is true', () => {
        mockOptions.percentageOnlySize = true;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        const isHidden = (el) => el.style.display === 'none' && el.style.getPropertyPriority('display') === 'important';
        const separator = result.html.querySelector('label.se-modal-size-x:not(.se-modal-size-text *)');

        expect(result.inputX.type).toBe('number');
        expect(result.inputX.min).toBe('1');
        expect(result.inputX.max).toBe('100');
        expect(separator.textContent).toBe('%');
        expect(isHidden(separator)).toBe(false);
        expect(isHidden(result.inputY)).toBe(true);
        expect(isHidden(result.html.querySelector('.se-modal-size-text .size-h'))).toBe(true);
        expect(isHidden(result.proportion.parentElement)).toBe(true);
    });

    it('should render a text width input with "x" if percentageOnlySize is false', () => {
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);

        expect(result.inputX.type).toBe('text');
        expect(result.html.querySelector('label.se-modal-size-x:not(.se-modal-size-text *)').textContent).toBe('x');
    });

    it('should not render format type controls if useFormatType is false', () => {
        mockOptions.useFormatType = false;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        
        expect(result.asBlock).toBeNull();
        expect(result.asInline).toBeNull();
    });

    it('should render gallery button if imageGallery plugin is present', () => {
        mockPlugins.imageGallery = true;
        const result = CreateHTML_modal({ lang: mockLang, icons: mockIcons, plugins: mockPlugins }, mockOptions);
        
        expect(result.galleryButton).toBeTruthy();
    });
});
