/**
 * @fileoverview Unit tests for plugins/dropdown/paragraphStyle.js
 */

import ParagraphStyle from '../../../../src/plugins/dropdown/paragraphStyle.js';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock helper
jest.mock('../../../../src/helper', () => ({
    dom: {
        utils: {
            createElement: jest.fn().mockImplementation((tag, attrs, content) => {
                const element = {
                    tagName: tag.toUpperCase(),
                    className: attrs?.class || '',
                    innerHTML: content || '',
                    style: {},
                    querySelectorAll: jest.fn().mockReturnValue([
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('__se__p-spaced'),
                            textContent: 'Spaced'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('__se__p-bordered'),
                            textContent: 'Bordered'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('__se__p-neon'),
                            textContent: 'Neon'
                        }
                    ]),
                    getAttribute: jest.fn(),
                    setAttribute: jest.fn()
                };
                if (attrs) {
                    Object.keys(attrs).forEach(key => {
                        if (key === 'class') element.className = attrs[key];
                        else element.setAttribute(key, attrs[key]);
                    });
                }
                return element;
            }),
            addClass: jest.fn(),
            removeClass: jest.fn(),
            toggleClass: jest.fn(),
            hasClass: jest.fn()
        }
    }
}));

describe('Plugins - Dropdown - ParagraphStyle', () => {
    let kernel;
    let paragraphStyle;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
        kernel.$.lang.paragraphStyle = 'Paragraph Style';
        kernel.$.lang.menu_spaced = 'Spaced';
        kernel.$.lang.menu_bordered = 'Bordered';
        kernel.$.lang.menu_neon = 'Neon';

        const { dom } = require('../../../../src/helper');
        kernel.$.menu.initDropdownTarget = jest.fn().mockImplementation(() => dom.utils.createElement('DIV', {}, ''));

        pluginOptions = {
            items: [
                { name: 'Custom Spaced', class: '__se__p-custom-spaced', _class: 'custom-btn' },
                { name: 'Custom Bordered', class: '__se__p-custom-bordered', _class: '' }
            ]
        };

        paragraphStyle = new ParagraphStyle(kernel, pluginOptions);
    });


    describe('Constructor', () => {

        it('should create dropdown menu via initDropdownTarget', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(
                ParagraphStyle,
                expect.any(Array),
                expect.objectContaining({ className: 'se-list-format' })
            );
        });

        it('should initialize dropdown menu', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(ParagraphStyle, expect.any(Array), expect.any(Object));
        });

        it('should initialize class list from menu', () => {
            expect(paragraphStyle.classList).toHaveLength(3);
        });

        it('should use default items when none provided', () => {
            const defaultParagraphStyle = new ParagraphStyle(kernel, {});
            expect(defaultParagraphStyle.classList).toBeDefined();
        });
    });

    describe('on method', () => {
        beforeEach(() => {
            paragraphStyle.classList = [
                { getAttribute: jest.fn().mockReturnValue('__se__p-spaced') },
                { getAttribute: jest.fn().mockReturnValue('__se__p-bordered') },
                { getAttribute: jest.fn().mockReturnValue('__se__p-neon') }
            ];
        });

        it('should activate matching paragraph style button', () => {
            const mockFormat = { className: '__se__p-spaced' };
            kernel.$.format.getLine.mockReturnValue(mockFormat);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockImplementation((el, className) =>
                el === mockFormat && className === '__se__p-spaced'
            );

            paragraphStyle.on();

            expect(dom.utils.addClass).toHaveBeenCalledWith(paragraphStyle.classList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[2], 'active');
        });

        it('should deactivate all buttons when no matching style', () => {
            const mockFormat = { className: '' };
            kernel.$.format.getLine.mockReturnValue(mockFormat);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            paragraphStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[2], 'active');
        });

        it('should handle multiple matching classes', () => {
            const mockFormat = { className: '__se__p-bordered __se__p-neon' };
            kernel.$.format.getLine.mockReturnValue(mockFormat);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockImplementation((el, className) =>
                el === mockFormat && (className === '__se__p-bordered' || className === '__se__p-neon')
            );

            paragraphStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[0], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(paragraphStyle.classList[1], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(paragraphStyle.classList[2], 'active');
        });

        it('should handle null format element', () => {
            kernel.$.format.getLine.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            expect(() => {
                paragraphStyle.on();
            }).not.toThrow();

            expect(dom.utils.removeClass).toHaveBeenCalledTimes(3);
        });
    });

    describe('action method', () => {
        let mockTarget;
        let mockFormats;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn().mockReturnValue('__se__p-spaced')
            };

            mockFormats = [
                { className: '' },
                { className: '__se__p-bordered' }
            ];

            kernel.$.format.getLines.mockReturnValue(mockFormats);
        });

        it('should toggle class on selected formats when not active', () => {
            const { dom } = require('../../../../src/helper');

            paragraphStyle.action(mockTarget);

            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[0], '__se__p-spaced');
            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[1], '__se__p-spaced');
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
            expect(kernel.$.history.push).toHaveBeenCalledWith(false);
        });

        it('should toggle class on selected formats when active', () => {
            const { dom } = require('../../../../src/helper');

            paragraphStyle.action(mockTarget);

            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[0], '__se__p-spaced');
            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[1], '__se__p-spaced');
        });

        it('should handle empty lines array by adding new line', () => {
            kernel.$.format.getLines.mockReturnValueOnce([]).mockReturnValueOnce(mockFormats);
            const { dom } = require('../../../../src/helper');

            paragraphStyle.action(mockTarget);

            expect(kernel.$.selection.getRangeAndAddLine).toHaveBeenCalled();
            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[0], '__se__p-spaced');
        });

        it('should return early if no formats after adding line', () => {
            kernel.$.format.getLines.mockReturnValue([]);

            paragraphStyle.action(mockTarget);

            expect(kernel.$.selection.getRangeAndAddLine).toHaveBeenCalled();
            expect(kernel.$.menu.dropdownOff).not.toHaveBeenCalled();
        });

        it('should handle null data-command attribute', () => {
            mockTarget.getAttribute.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');

            paragraphStyle.action(mockTarget);

            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[0], null);
            expect(dom.utils.toggleClass).toHaveBeenCalledWith(mockFormats[1], null);
        });

        it('should apply to multiple formats', () => {
            const manyFormats = [
                { className: '' },
                { className: '' },
                { className: '__se__p-bordered' }
            ];
            kernel.$.format.getLines.mockReturnValue(manyFormats);
            const { dom } = require('../../../../src/helper');

            paragraphStyle.action(mockTarget);

            manyFormats.forEach(format => {
                expect(dom.utils.toggleClass).toHaveBeenCalledWith(format, '__se__p-spaced');
            });
        });
    });

    describe('CreateItems function', () => {
        it('should pass correct items to initDropdownTarget for custom items', () => {
            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items).toHaveLength(2);
            expect(items[0]).toMatchObject({ command: '__se__p-custom-spaced', title: 'Custom Spaced' });
            expect(items[1]).toMatchObject({ command: '__se__p-custom-bordered', title: 'Custom Bordered' });
        });

        it('should pass default paragraph style items when no items provided', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const defaultParagraphStyle = new ParagraphStyle(kernel, {});

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items.find(i => i.command === '__se__p-spaced')).toBeDefined();
            expect(items.find(i => i.command === '__se__p-bordered')).toBeDefined();
            expect(items.find(i => i.command === '__se__p-neon')).toBeDefined();
            expect(items.find(i => i.title === 'Spaced')).toBeDefined();
            expect(items.find(i => i.title === 'Bordered')).toBeDefined();
            expect(items.find(i => i.title === 'Neon')).toBeDefined();
        });

        it('should handle string items from default list', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const stringParagraphStyle = new ParagraphStyle(kernel, {
                items: ['spaced', 'neon']
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items.find(i => i.command === '__se__p-spaced')).toBeDefined();
            expect(items.find(i => i.command === '__se__p-neon')).toBeDefined();
            expect(items.find(i => i.command === '__se__p-bordered')).toBeUndefined();
        });

        it('should skip invalid string items', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const invalidParagraphStyle = new ParagraphStyle(kernel, {
                items: ['spaced', 'invalid-style', 'neon']
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items.find(i => i.command === '__se__p-spaced')).toBeDefined();
            expect(items.find(i => i.command === '__se__p-neon')).toBeDefined();
            expect(items).toHaveLength(2); // invalid-style is skipped
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('__se__p-spaced')
            };

            expect(() => {
                paragraphStyle.action(mockTarget);
            }).not.toThrow();

            expect(kernel.$.format.getLines).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            expect(() => {
                paragraphStyle.on();
            }).not.toThrow();

            expect(kernel.$.selection.getNode).toHaveBeenCalled();
        });

        it('should work with class detection', () => {
            const mockFormat = { className: '__se__p-spaced' };
            kernel.$.format.getLine.mockReturnValue(mockFormat);
            const { dom } = require('../../../../src/helper');

            paragraphStyle.on();

            expect(dom.utils.hasClass).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            kernel.$.format = undefined;

            expect(() => {
                new ParagraphStyle(kernel, {});
            }).not.toThrow();
        });

        it('should handle missing class list gracefully', () => {
            paragraphStyle.classList = [];

            expect(() => {
                paragraphStyle.on();
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                paragraphStyle.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new ParagraphStyle(kernel, {});
            }).not.toThrow();
        });

        it('should handle empty items array', () => {
            expect(() => {
                new ParagraphStyle(kernel, { items: [] });
            }).not.toThrow();
        });

        it('should handle items with missing properties', () => {
            const incompleteItems = [
                { name: 'Test' }, // missing class
                { class: '__se__p-test' } // missing name
            ];

            expect(() => {
                new ParagraphStyle(kernel, { items: incompleteItems });
            }).not.toThrow();
        });
    });
});