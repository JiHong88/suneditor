/**
 * @fileoverview Unit tests for plugins/dropdown/font.js
 */

import Font from '../../../../src/plugins/dropdown/font.js';

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

// Mock EditorInjector
jest.mock('../../../../src/editorInjector', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.icons = editor.icons;
        this.status = editor.status;
        this.format = editor.format;
        this.inline = editor.inline;
        this.menu = editor.menu;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - Font', () => {
    let mockEditor;
    let font;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                font: 'Font',
                default: 'Default'
            },
            icons: {
                arrow_down: '▼'
            },
            status: {
                hasFocus: true
            },
            format: {
                isLine: jest.fn().mockReturnValue(false)
            },
            inline: {
                apply: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            frameContext: new Map([
                ['wwComputedStyle', { fontFamily: 'Arial' }]
            ]),
            triggerEvent: jest.fn().mockResolvedValue(true)
        };

        pluginOptions = {
            items: ['Arial', 'Georgia', 'Times New Roman']
        };

        font = new Font(mockEditor, pluginOptions);
    });


    describe('Constructor', () => {

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer se-list-font-family' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(Font, expect.any(Object));
        });

        it('should initialize font list from menu', () => {
            expect(font.fontList).toHaveLength(3);
        });

        it('should use default fonts when none provided', () => {
            const defaultFont = new Font(mockEditor, {});
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
            mockEditor.status.hasFocus = true;
            const { dom } = require('../../../../src/helper');

            const result = font.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Arial');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTooltip, 'Font (Arial)');
            expect(result).toBe(false);
        });

        it('should update text when no element provided and no focus', () => {
            mockEditor.status.hasFocus = false;
            const { dom } = require('../../../../src/helper');

            font.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Font');
            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTooltip, 'Font');
        });

        it('should return undefined for line elements', () => {
            const mockElement = document.createElement('p');
            mockEditor.format.isLine.mockReturnValue(true);

            const result = font.active(mockElement, mockTarget);

            expect(result).toBeUndefined();
        });

        it('should return true and update text when element has fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
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
            dom.utils.getStyle.mockReturnValue('');

            const result = font.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should handle null fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            dom.utils.getStyle.mockReturnValue(null);

            const result = font.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should strip quotes from fontFamily', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            dom.utils.getStyle.mockReturnValue("'Times New Roman', serif");

            font.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Times New Roman, serif');
        });

        it('should handle empty computed style', () => {
            mockEditor.frameContext.set('wwComputedStyle', { fontFamily: '' });
            mockEditor.status.hasFocus = true;
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
            const { dom } = require('../../../../src/helper');

            await font.action(mockTarget);

            expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onFontActionBefore', { value: 'Arial' });
            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'font-family: Arial;'
            });
            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                { stylesToModify: ['font-family'], nodesToRemove: null, strictRemove: null }
            );
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
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

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                null,
                { stylesToModify: ['font-family'], nodesToRemove: ['span'], strictRemove: true }
            );
        });

        it('should return early when onFontActionBefore returns false', async () => {
            mockTarget.getAttribute.mockReturnValue('Arial');
            mockEditor.triggerEvent.mockResolvedValue(false);
            const { dom } = require('../../../../src/helper');

            // Clear previous createElement calls
            dom.utils.createElement.mockClear();

            await font.action(mockTarget);

            expect(dom.utils.createElement).not.toHaveBeenCalled();
            expect(mockEditor.inline.apply).not.toHaveBeenCalled();
            expect(mockEditor.menu.dropdownOff).not.toHaveBeenCalled();
        });

        it('should handle null data-command attribute', async () => {
            mockTarget.getAttribute.mockReturnValue(null);

            await font.action(mockTarget);

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
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

    describe('CreateHTML function', () => {
        it('should create dropdown menu with custom fonts', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-font-family'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('default_value');
            expect(createCallArgs[2]).toContain('(Default)');
            expect(createCallArgs[2]).toContain('data-command="Arial"');
            expect(createCallArgs[2]).toContain('data-command="Georgia"');
            expect(createCallArgs[2]).toContain('data-command="Times New Roman"');
        });

        it('should include default fonts when no items provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultFont = new Font(mockEditor, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-font-family'
            );

            expect(createCallArgs[2]).toContain('data-command="Arial"');
            expect(createCallArgs[2]).toContain('data-command="Comic Sans MS"');
            expect(createCallArgs[2]).toContain('data-command="Courier New"');
            expect(createCallArgs[2]).toContain('data-command="Verdana"');
        });

        it('should handle font names with commas in CreateHTML', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            new Font(mockEditor, {
                items: ['Arial, sans-serif', 'Times New Roman, serif']
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-font-family'
            );

            expect(createCallArgs[2]).toContain('data-command="Arial, sans-serif"');
            expect(createCallArgs[2]).toContain('data-txt="Arial"'); // First part before comma
            expect(createCallArgs[2]).toContain('>Arial</button>'); // Display text
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', async () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('Arial')
            };

            await font.action(mockTarget);

            expect(mockEditor.inline.apply).toHaveBeenCalled();
        });

        it('should work with editor triggerEvent', async () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('Arial')
            };

            await font.action(mockTarget);

            expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onFontActionBefore', { value: 'Arial' });
        });

        it('should work with frameContext for computed styles', () => {
            mockEditor.frameContext.set('wwComputedStyle', { fontFamily: 'Georgia' });
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
            mockEditor.format = undefined;

            expect(() => {
                new Font(mockEditor, {});
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
                new Font(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing frameContext', () => {
            mockEditor.frameContext = new Map();
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
