/**
 * @fileoverview Unit tests for plugins/dropdown/fontColor.js
 */

import FontColor from '../../../../src/plugins/dropdown/fontColor.js';

// Mock HueSlider module to prevent canvas initialization errors
jest.mock('../../../../src/modules/contracts/HueSlider.js', () => {
    return jest.fn().mockImplementation(() => ({}));
});

// Mock ColorPicker module
const mockColorPicker = {
    target: {
        tagName: 'DIV',
        className: 'se-color-picker'
    },
    init: jest.fn(),
    hueSliderClose: jest.fn()
};

jest.mock('../../../../src/modules/contracts/ColorPicker.js', () => {
    return jest.fn().mockImplementation((plugin, type, options) => {
        mockColorPicker.plugin = plugin;
        mockColorPicker.type = type;
        mockColorPicker.options = options;
        return mockColorPicker;
    });
});

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
                    appendChild: jest.fn(),
                    querySelector: jest.fn().mockReturnValue({
                        style: { color: '' }
                    }),
                    getAttribute: jest.fn(),
                    setAttribute: jest.fn()
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
            getStyle: jest.fn()
        }
    },
    env: {
        isTouchDevice: false,
        _w: global.window || {},
        ON_OVER_COMPONENT: 'data-se-on-over-component'
    }
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.selection = editor.selection;
        this.format = editor.format;
        this.inline = editor.inline;
        this.menu = editor.menu;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - FontColor', () => {
    let mockEditor;
    let fontColor;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                fontColor: 'Font Color'
            },
            selection: {
                getNode: jest.fn().mockReturnValue(document.createElement('span'))
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
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        pluginOptions = {
            items: ['#ff0000', '#00ff00', '#0000ff'],
            splitNum: 6,
            disableHEXInput: false
        };

        fontColor = new FontColor(mockEditor, pluginOptions);
    });


    describe('Constructor', () => {

        it('should initialize ColorPicker with correct options', () => {
            const MockColorPicker = require('../../../../src/modules/contracts/ColorPicker.js');

            expect(MockColorPicker).toHaveBeenCalledWith(fontColor, 'color', {
                form: expect.any(Object), // Added in commit 9f43ca04
                colorList: pluginOptions.items,
                splitNum: pluginOptions.splitNum,
                disableHEXInput: pluginOptions.disableHEXInput,
                hueSliderOptions: { controllerOptions: { isOutsideForm: true } }
            });
        });

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith('DIV', { class: 'se-dropdown se-list-layer' }, null);
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(FontColor, expect.any(Object));
        });

        it('should pass menu as form to ColorPicker', () => {
            const MockColorPicker = require('../../../../src/modules/contracts/ColorPicker.js');
            const { dom } = require('../../../../src/helper');

            const callArgs = MockColorPicker.mock.calls[MockColorPicker.mock.calls.length - 1];
            const passedOptions = callArgs[2];

            // form should be the menu element created
            expect(passedOptions.form).toBeDefined();
            expect(passedOptions.form.className).toBe('se-dropdown se-list-layer');
        });
    });

    describe('active method', () => {
        let mockTarget;
        let mockColorHelper;

        beforeEach(() => {
            mockColorHelper = { style: { color: '' } };
            mockTarget = {
                querySelector: jest.fn().mockReturnValue(mockColorHelper)
            };
        });

        it('should return undefined when color helper not found', () => {
            mockTarget.querySelector.mockReturnValue(null);

            const result = fontColor.active(null, mockTarget);

            expect(result).toBeUndefined();
        });

        it('should set empty color when no element provided', () => {
            const result = fontColor.active(null, mockTarget);

            expect(mockColorHelper.style.color).toBe('');
            expect(result).toBe(false);
        });

        it('should return undefined for line elements', () => {
            const mockElement = document.createElement('div');
            mockEditor.format.isLine.mockReturnValue(true);

            const result = fontColor.active(mockElement, mockTarget);

            expect(result).toBeUndefined();
        });

        it('should return true and set color when element has font color', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            dom.utils.getStyle.mockReturnValue('#00ff00');

            const result = fontColor.active(mockElement, mockTarget);

            expect(dom.utils.getStyle).toHaveBeenCalledWith(mockElement, 'color');
            expect(mockColorHelper.style.color).toBe('#00ff00');
            expect(result).toBe(true);
        });

        it('should return false when element has no font color', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            dom.utils.getStyle.mockReturnValue('');

            const result = fontColor.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should handle elements without color style gracefully', () => {
            const mockElement = document.createElement('span');
            const { dom } = require('../../../../src/helper');
            dom.utils.getStyle.mockReturnValue(null);

            const result = fontColor.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should query for correct color helper selector', () => {
            const mockElement = document.createElement('span');

            fontColor.active(mockElement, mockTarget);

            expect(mockTarget.querySelector).toHaveBeenCalledWith('.se-svg-color-helper');
        });
    });

    describe('on method', () => {
        it('should initialize color picker with current node', () => {
            const mockTarget = document.createElement('div');
            const mockNode = document.createElement('span');
            mockEditor.selection.getNode.mockReturnValue(mockNode);

            fontColor.on(mockTarget);

            expect(fontColor.colorPicker.init).toHaveBeenCalledWith(
                mockNode,
                mockTarget,
                expect.any(Function)
            );
        });

        it('should pass isLine checker function to color picker', () => {
            const mockTarget = document.createElement('div');

            fontColor.on(mockTarget);

            const isLineChecker = fontColor.colorPicker.init.mock.calls[0][2];
            const mockElement = document.createElement('p');

            mockEditor.format.isLine.mockReturnValue(true);
            expect(isLineChecker(mockElement)).toBe(true);
            expect(mockEditor.format.isLine).toHaveBeenCalledWith(mockElement);
        });
    });

    describe('off method', () => {
        it('should close hue slider', () => {
            fontColor.off();

            expect(fontColor.colorPicker.hueSliderClose).toHaveBeenCalled();
        });
    });

    describe('colorPickerAction method', () => {
        beforeEach(() => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();
        });

        it('should apply font color when color provided', () => {
            const color = '#00ff00';
            const { dom } = require('../../../../src/helper');

            fontColor.colorPickerAction(color);

            expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                style: 'color: #00ff00;'
            });
            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                { stylesToModify: ['color'], nodesToRemove: null, strictRemove: null }
            );
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should remove font color when no color provided', () => {
            fontColor.colorPickerAction('');

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                null,
                { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true }
            );
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should remove font color when null color provided', () => {
            fontColor.colorPickerAction(null);

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                null,
                { stylesToModify: ['color'], nodesToRemove: ['span'], strictRemove: true }
            );
        });

        it('should handle various color formats', () => {
            const colors = ['#0000ff', 'rgb(0, 0, 255)', 'blue', 'hsl(240, 100%, 50%)'];
            const { dom } = require('../../../../src/helper');

            colors.forEach(color => {
                fontColor.colorPickerAction(color);
                expect(dom.utils.createElement).toHaveBeenCalledWith('SPAN', {
                    style: `color: ${color};`
                });
            });
        });
    });

    describe('Integration', () => {
        it('should work with ColorPicker module', () => {
            expect(fontColor.colorPicker).toBeDefined();
            expect(fontColor.colorPicker.type).toBe('color');
            expect(fontColor.colorPicker.plugin).toBe(fontColor);
        });

        it('should handle ColorPicker options correctly', () => {
            const customOptions = {
                items: [{ value: '#654321', name: 'Custom Brown' }],
                splitNum: 10,
                disableHEXInput: true
            };

            const customFontColor = new FontColor(mockEditor, customOptions);

            expect(customFontColor.colorPicker.options.colorList).toEqual(customOptions.items);
            expect(customFontColor.colorPicker.options.splitNum).toBe(10);
            expect(customFontColor.colorPicker.options.disableHEXInput).toBe(true);
        });

        it('should work with editor format module', () => {
            const mockElement = document.createElement('span');
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({ style: {} })
            };

            mockEditor.format.isLine.mockReturnValue(false);

            expect(() => {
                fontColor.active(mockElement, mockTarget);
            }).not.toThrow();
        });
    });

    describe('Error handling', () => {
        it('should handle missing ColorPicker gracefully', () => {
            fontColor.colorPicker = null;

            expect(() => {
                fontColor.off();
            }).toThrow();
        });

        it('should handle missing editor format module', () => {
            mockEditor.format = undefined;

            expect(() => {
                new FontColor(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle empty plugin options', () => {
            expect(() => {
                new FontColor(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle malformed target in active method', () => {
            const mockTarget = {};

            expect(() => {
                fontColor.active(document.createElement('span'), mockTarget);
            }).toThrow();
        });
    });
});
