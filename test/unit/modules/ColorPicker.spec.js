/**
 * @fileoverview Unit tests for modules/ColorPicker.js
 */

import ColorPicker from '../../../src/modules/ColorPicker.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor ? editor.frameContext : new Map();
        this.triggerEvent = (editor && editor.triggerEvent) || jest.fn();
        this.icons = (editor && editor.icons) || {};
        this.lang = (editor && editor.lang) || {};
        this.ui = (editor && editor.ui) || {};
        this.eventManager = {
            addEvent: jest.fn(),
            removeEvent: jest.fn()
        };
        this._w = {
            getComputedStyle: jest.fn().mockReturnValue({
                color: 'rgb(255, 0, 0)'
            })
        };
        this._d = {
            body: {
                appendChild: jest.fn().mockImplementation((el) => el),
                removeChild: jest.fn()
            }
        };
    });
});

jest.mock('../../../src/helper', () => ({
    dom: {
        check: { isElement: jest.fn().mockReturnValue(true) },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            removeItem: jest.fn(),
            createElement: jest.fn().mockReturnValue({
                style: {},
                appendChild: jest.fn(),
                querySelector: jest.fn().mockImplementation(() => ({
                    children: [{}, {}],
                    querySelector: jest.fn().mockReturnValue({
                        children: [{}, {}]
                    }),
                    style: {
                        display: ''
                    }
                })),
                querySelectorAll: jest.fn().mockReturnValue([]),
                classList: {
                    add: jest.fn(),
                    remove: jest.fn()
                }
            })
        },
        create: { element: jest.fn().mockReturnValue({
            style: {},
            appendChild: jest.fn(),
            querySelector: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        }) }
    },
    converter: {
        hex2rgb: jest.fn().mockReturnValue([255, 0, 0]),
        rgb2hex: jest.fn().mockReturnValue('#ff0000'),
        isHexColor: jest.fn().mockReturnValue(true)
    }
}));

jest.mock('../../../src/modules', () => ({
    HueSlider: jest.fn().mockImplementation(function() {
        this.get = jest.fn().mockReturnValue({ hex: '#ff0000', r: 255, g: 0, b: 0 });
        this.open = jest.fn();
        this.close = jest.fn();
        this.attach = jest.fn();
        this.off = jest.fn();
    })
}));

describe('Modules - ColorPicker', () => {
    let mockInst;
    let mockEditor;
    let mockElement;

    beforeEach(() => {
        jest.clearAllMocks();

        mockElement = {
            querySelectorAll: jest.fn().mockReturnValue([]),
            appendChild: jest.fn(),
            style: {},
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        };

        mockEditor = {
            ui: {
                showColorPicker: jest.fn(),
                hideColorPicker: jest.fn()
            },
            triggerEvent: jest.fn(),
            frameContext: new Map(),
            lang: {
                colorPicker: 'Color Picker',
                color: 'Color',
                submitButton: 'Submit',
                remove: 'Remove'
            },
            icons: {
                color_palette: '🎨',
                checked: '✓',
                remove_color: '✗',
                color_checked: '<svg><circle></circle></svg>'
            }
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testColorPicker',
                name: 'TestColorPicker'
            }
        };
    });

    describe('Constructor', () => {
        it('should create ColorPicker instance', () => {
            const colorPicker = new ColorPicker(mockInst, 'color', {});

            expect(colorPicker).toBeInstanceOf(ColorPicker);
            expect(colorPicker.inst).toBe(mockInst);
            expect(colorPicker.kind).toBe('testColorPicker');
        });

        it('should use constructor name as fallback for kind', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: {
                    name: 'FallbackColorPicker'
                }
            };

            const colorPicker = new ColorPicker(instWithoutKey, 'color', {});
            expect(colorPicker.kind).toBe('FallbackColorPicker');
        });

        it('should inherit from CoreInjector', () => {
            const colorPicker = new ColorPicker(mockInst, 'color', {});

            expect(colorPicker.editor).toBe(mockEditor);
            expect(colorPicker.frameContext).toBeDefined();
        });
    });

    describe('Basic functionality', () => {
        let colorPicker;

        beforeEach(() => {
            colorPicker = new ColorPicker(mockInst, 'color', {});
        });

        it('should have access to editor components', () => {
            expect(colorPicker.editor).toBe(mockEditor);
            expect(colorPicker.ui).toBe(mockEditor.ui);
        });

        it('should initialize with default color list', () => {
            expect(colorPicker.colorList).toBeDefined();
            expect(Array.isArray(colorPicker.colorList)).toBe(true);
        });

        it('should have color picker UI elements', () => {
            expect(colorPicker.target).toBeDefined();
            expect(colorPicker.inputElement).toBeDefined();
        });
    });

    describe('Color operations', () => {
        let colorPicker;

        beforeEach(() => {
            colorPicker = new ColorPicker(mockInst, 'color', {});
        });

        it('should handle color validation', () => {
            expect(() => {
                colorPicker.init('#ff0000');
            }).not.toThrow();
        });

        it('should handle invalid color input gracefully', () => {
            expect(() => {
                colorPicker.init('invalid-color');
            }).not.toThrow();
        });
    });

    describe('Integration with HueSlider', () => {
        let colorPicker;

        beforeEach(() => {
            colorPicker = new ColorPicker(mockInst, 'color', {});
        });

        it('should have hue slider components', () => {
            expect(colorPicker.hueSlider).toBeDefined();
            // opacitySlider doesn't exist in ColorPicker, removing this expectation
        });

        it('should handle slider interactions', () => {
            expect(() => {
                colorPicker.init('#ff0000', null);
                colorPicker.setHexColor('#00ff00');
            }).not.toThrow();
        });
    });

    describe('Error handling', () => {
        it('should handle missing element parameter', () => {
            expect(() => {
                new ColorPicker(mockInst, 'color', {});
            }).not.toThrow();
        });

        it('should handle missing editor gracefully', () => {
            const instWithoutEditor = {
                constructor: { key: 'test' }
            };

            expect(() => {
                new ColorPicker(instWithoutEditor, 'color', {});
            }).toThrow();
        });
    });
});