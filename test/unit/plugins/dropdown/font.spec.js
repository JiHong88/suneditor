/**
 * @fileoverview Unit tests for plugins/dropdown/font.js
 */

import Font from '../../../../src/plugins/dropdown/font.js';
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
                            getAttribute: jest.fn().mockReturnValue(''),
                            textContent: '(Default)'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('Arial'),
                            textContent: 'Arial'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('Georgia'),
                            textContent: 'Georgia'
                        }
                    ]),
                    querySelector: jest.fn().mockReturnValue({
                        tagName: 'SPAN',
                        textContent: '',
                        style: { display: 'none' }
                    }),
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
            changeTxt: jest.fn(),
            getStyle: jest.fn()
        }
    }
}));

describe('Plugins - Dropdown - Font', () => {
    let kernel;
    let font;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
        kernel.$.lang.default = 'Default';
        kernel.$.frameContext.set('wwComputedStyle', { fontFamily: 'Arial' });

        const { dom } = require('../../../../src/helper');
        kernel.$.menu.initDropdownTarget = jest.fn().mockImplementation(() => dom.utils.createElement('DIV', {}, ''));

        pluginOptions = {
            items: ['Arial', 'Georgia', 'Times New Roman']
        };

        font = new Font(kernel, pluginOptions);
    });


    describe('Constructor', () => {

        it('should create dropdown menu via initDropdownTarget', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(
                Font,
                expect.any(Array),
                expect.objectContaining({ className: 'se-list-font-family' })
            );
        });

        it('should initialize dropdown menu', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(Font, expect.any(Array), expect.any(Object));
        });

        it('should initialize font list from menu', () => {
            expect(font.fontList).toHaveLength(3);
        });

        it('should use default fonts when none provided', () => {
            const defaultFont = new Font(kernel, {});
            expect(defaultFont.fontArray).toEqual(['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana']);
        });
    });

    describe('active method', () => {
        let mockTarget;
        let mockTargetText;
        let mockTooltip;

        beforeEach(() => {
            mockTargetText = { textContent: 'Font' };
            mockTooltip = { textContent: '' };
            mockTarget = {
                querySelector: jest.fn().mockReturnValue(mockTargetText),
                parentNode: {
                    querySelector: jest.fn().mockReturnValue(mockTooltip)
                }
            };
        });

        it('should update text and tooltip when no element provided and has focus', () => {
            kernel.$.store.set('hasFocus', true);
            kernel.$.frameContext.set('wwComputedStyle', { fontFamily: 'Arial' });
            const { dom } = require('../../../../src/helper');

            const result = font.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Arial');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTooltip, 'Font (Arial)');
            expect(result).toBe(false);
        });

        it('should update text when no element provided and no focus', () => {
            kernel.$.store.set('hasFocus', false);
            const { dom } = require('../../../../src/helper');

            font.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Font');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTooltip, 'Font');
        });

        it('should return undefined for line elements', () => {
            const mockElement = document.createElement('p');
            kernel.$.format.isLine.mockReturnValue(true);

            const result = font.active(mockElement, mockTarget);

            expect(result).toBeUndefined();
        });

        it('should return true and update text when element has fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            kernel.$.format.isLine.mockReturnValue(false);
            dom.utils.getStyle.mockReturnValue('"Georgia", serif');

            const result = font.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(dom.utils.getStyle).toHaveBeenCalledWith(mockElement, 'fontFamily');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Georgia, serif');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTooltip, 'Font (Georgia, serif)');
        });

        it('should return false when element has no fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            kernel.$.format.isLine.mockReturnValue(false);
            dom.utils.getStyle.mockReturnValue('');

            const result = font.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should handle null fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            kernel.$.format.isLine.mockReturnValue(false);
            dom.utils.getStyle.mockReturnValue(null);

            const result = font.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should strip quotes from fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            kernel.$.format.isLine.mockReturnValue(false);
            dom.utils.getStyle.mockReturnValue("'Times New Roman', serif");

            font.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Times New Roman, serif');
        });

        it('should handle empty computed style', () => {
            kernel.$.store.set('hasFocus', true);
            kernel.$.frameContext.set('wwComputedStyle', { fontFamily: '' });
            const { dom } = require('../../../../src/helper');

            font.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, '');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTooltip, 'Font');
        });
    });

    describe('on method', () => {
        let mockTarget;
        let mockTargetText;

        beforeEach(() => {
            mockTargetText = { textContent: 'Arial' };
            mockTarget = {
                querySelector: jest.fn().mockReturnValue(mockTargetText)
            };

            font.fontList = [
                { getAttribute: jest.fn().mockReturnValue('') },
                { getAttribute: jest.fn().mockReturnValue('Arial') },
                { getAttribute: jest.fn().mockReturnValue('Georgia') }
            ];
        });

        it('should activate matching font button', () => {
            const { dom } = require('../../../../src/helper');

            font.on(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(font.fontList[0], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(font.fontList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(font.fontList[2], 'active');
            expect(font.currentFont).toBe('Arial');
        });

        it('should handle fonts with quotes in data-command', () => {
            font.fontList[1].getAttribute.mockReturnValue('"Arial"');
            mockTargetText.textContent = 'Arial';
            const { dom } = require('../../../../src/helper');

            font.on(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(font.fontList[1], 'active');
        });

        it('should not update if current font is same', () => {
            font.currentFont = 'Arial';
            const { dom } = require('../../../../src/helper');

            font.on(mockTarget);

            expect(dom.utils.addClass).not.toHaveBeenCalled();
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should activate default button when no font selected', () => {
            // The current font should be empty string to match empty data-command of default button
            mockTargetText.textContent = '';
            font.currentFont = 'different-font'; // Ensure update occurs

            // Reset fontList mocks to match expected behavior
            font.fontList = [
                { getAttribute: jest.fn().mockReturnValue('') },  // Default button with empty data-command
                { getAttribute: jest.fn().mockReturnValue('Arial') },
                { getAttribute: jest.fn().mockReturnValue('Georgia') }
            ];

            const { dom } = require('../../../../src/helper');

            font.on(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(font.fontList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(font.fontList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(font.fontList[2], 'active');
        });

        it('should handle font names with spaces', () => {
            mockTargetText.textContent = 'Times New Roman';
            font.fontList[2].getAttribute.mockReturnValue('"Times New Roman"');
            const { dom } = require('../../../../src/helper');

            font.on(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(font.fontList[2], 'active');
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn()
            };
        });

        it('should apply font family when value provided', async () => {
            mockTarget.getAttribute.mockReturnValue('Arial');
            kernel.$.eventManager.triggerEvent.mockResolvedValue(undefined);
            const { dom } = require('../../../../src/helper');

            await font.action(mockTarget);

            expect(kernel.$.eventManager.triggerEvent).toHaveBeenCalledWith('onFontActionBefore', { value: 'Arial' });
            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'font-family: Arial;'
            });
            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                { stylesToModify: ['font-family'], nodesToRemove: null, strictRemove: null }
            );
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should wrap font name with quotes if contains spaces or special chars', async () => {
            mockTarget.getAttribute.mockReturnValue('Times New Roman');
            const { dom } = require('../../../../src/helper');

            await font.action(mockTarget);

            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'font-family: "Times New Roman";'
            });
        });

        it('should not wrap font name with quotes if already quoted', async () => {
            mockTarget.getAttribute.mockReturnValue('"Times New Roman"');
            const { dom } = require('../../../../src/helper');

            await font.action(mockTarget);

            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'font-family: "Times New Roman";'
            });
        });

        it('should remove font family when no value provided', async () => {
            mockTarget.getAttribute.mockReturnValue('');

            await font.action(mockTarget);

            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
                null,
                { stylesToModify: ['font-family'], nodesToRemove: ['span'], strictRemove: true }
            );
        });

        it('should return early when onFontActionBefore returns false', async () => {
            mockTarget.getAttribute.mockReturnValue('Arial');
            kernel.$.eventManager.triggerEvent.mockResolvedValue(false);
            const { dom } = require('../../../../src/helper');

            // Clear previous createElement calls
            dom.utils.createElement.mockClear();

            await font.action(mockTarget);

            expect(dom.utils.createElement).not.toHaveBeenCalled();
            expect(kernel.$.inline.apply).not.toHaveBeenCalled();
            expect(kernel.$.menu.dropdownOff).not.toHaveBeenCalled();
        });

        it('should handle null data-command attribute', async () => {
            mockTarget.getAttribute.mockReturnValue(null);

            await font.action(mockTarget);

            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
                null,
                { stylesToModify: ['font-family'], nodesToRemove: ['span'], strictRemove: true }
            );
        });

        it('should handle font names with numbers and special characters', async () => {
            mockTarget.getAttribute.mockReturnValue('Font-123 Bold!');
            const { dom } = require('../../../../src/helper');

            await font.action(mockTarget);

            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'font-family: "Font-123 Bold!";'
            });
        });

        it('should not wrap simple font names', async () => {
            mockTarget.getAttribute.mockReturnValue('Arial');
            const { dom } = require('../../../../src/helper');

            await font.action(mockTarget);

            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'font-family: Arial;'
            });
        });
    });

    describe('CreateItems function', () => {
        it('should pass correct items to initDropdownTarget for custom fonts', () => {
            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items).toHaveLength(3);
            expect(items[0]).toMatchObject({ command: 'Arial', title: 'Arial', innerHTML: 'Arial' });
            expect(items[1]).toMatchObject({ command: 'Georgia', title: 'Georgia', innerHTML: 'Georgia' });
            expect(items[2]).toMatchObject({ command: 'Times New Roman', title: 'Times New Roman', innerHTML: 'Times New Roman' });
        });

        it('should pass default font items when no items provided', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const defaultFont = new Font(kernel, {});

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items.find(i => i.command === 'Arial')).toBeDefined();
            expect(items.find(i => i.command === 'Comic Sans MS')).toBeDefined();
            expect(items.find(i => i.command === 'Courier New')).toBeDefined();
            expect(items.find(i => i.command === 'Verdana')).toBeDefined();
        });

        it('should handle font names with commas in CreateItems', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            new Font(kernel, {
                items: ['Arial, sans-serif', 'Times New Roman, serif']
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items[0]).toMatchObject({ command: 'Arial, sans-serif', title: 'Arial', innerHTML: 'Arial' });
            expect(items[1]).toMatchObject({ command: 'Times New Roman, serif', title: 'Times New Roman', innerHTML: 'Times New Roman' });
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', async () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('Arial')
            };

            await font.action(mockTarget);

            expect(kernel.$.inline.apply).toHaveBeenCalled();
        });

        it('should work with editor triggerEvent', async () => {
            kernel.$.eventManager.triggerEvent.mockResolvedValue(undefined);
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('Arial')
            };

            await font.action(mockTarget);

            expect(kernel.$.eventManager.triggerEvent).toHaveBeenCalledWith('onFontActionBefore', { value: 'Arial' });
        });

        it('should work with frameContext for computed styles', () => {
            kernel.$.store.set('hasFocus', true);
            kernel.$.frameContext.set('wwComputedStyle', { fontFamily: 'Georgia' });
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({ textContent: '' }),
                parentNode: { querySelector: jest.fn().mockReturnValue({ textContent: '' }) }
            };

            font.active(null, mockTarget);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(expect.anything(), 'Georgia');
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            kernel.$.format = undefined;

            expect(() => {
                new Font(kernel, {});
            }).not.toThrow();
        });

        it('should handle missing font list gracefully', () => {
            font.fontList = [];

            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({ textContent: 'Arial' })
            };

            expect(() => {
                font.on(mockTarget);
            }).not.toThrow();
        });

        it('should handle malformed target in action method', async () => {
            const mockTarget = {};

            await expect(font.action(mockTarget)).rejects.toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new Font(kernel, {});
            }).not.toThrow();
        });

        it('should handle missing frameContext', () => {
            kernel.$.frameContext = new Map();
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({ textContent: '' }),
                parentNode: { querySelector: jest.fn().mockReturnValue({ textContent: '' }) }
            };

            expect(() => {
                font.active(null, mockTarget);
            }).not.toThrow();
        });

        it('should handle missing querySelector results', () => {
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue(null),
                parentNode: { querySelector: jest.fn().mockReturnValue(null) }
            };

            // When querySelector returns null, active method should return false without throwing
            expect(() => {
                font.active(null, mockTarget);
            }).not.toThrow();

            const result = font.active(null, mockTarget);
            expect(result).toBe(false);
        });
    });
});
