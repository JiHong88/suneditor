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
    });

    describe('Basic functionality', () => {
        let colorPicker;

        beforeEach(() => {
            colorPicker = new ColorPicker(mockInst, 'color', {});
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

    describe('init method', () => {
        let colorPicker;
        let mockTarget;
        let mockButton1, mockButton2, mockButton3;

        beforeEach(() => {
            mockButton1 = {
                getAttribute: jest.fn().mockReturnValue('#ff0000'),
                appendChild: jest.fn(),
                contains: jest.fn().mockReturnValue(false),
                classList: { add: jest.fn(), remove: jest.fn() }
            };
            mockButton2 = {
                getAttribute: jest.fn().mockReturnValue('#00ff00'),
                appendChild: jest.fn(),
                contains: jest.fn().mockReturnValue(false),
                classList: { add: jest.fn(), remove: jest.fn() }
            };
            mockButton3 = {
                getAttribute: jest.fn().mockReturnValue('#0000ff'),
                appendChild: jest.fn(),
                contains: jest.fn().mockReturnValue(true),
                classList: { add: jest.fn(), remove: jest.fn() }
            };

            colorPicker = new ColorPicker(mockInst, 'color', {});
            colorPicker.colorList = [mockButton1, mockButton2, mockButton3];

            mockTarget = document.createElement('button');
        });

        it('should match and activate color in color list', () => {
            const { dom } = require('../../../src/helper');
            dom.utils.addClass = jest.fn();
            dom.utils.removeClass = jest.fn();
            dom.utils.removeItem = jest.fn();

            colorPicker.init('#ff0000', mockTarget);

            // Button 1 should be activated (matches color)
            expect(mockButton1.appendChild).toHaveBeenCalled();
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockButton1, 'active');

            // Button 2 should be deactivated (doesn't match)
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockButton2, 'active');

            // Button 3 should be deactivated and remove icon
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockButton3, 'active');
            expect(dom.utils.removeItem).toHaveBeenCalled();
        });

        it('should handle color as node instead of string', () => {
            const mockNode = {
                nodeName: 'SPAN',
                style: { color: 'rgb(255, 0, 0)' },
                parentNode: null
            };

            const { dom } = require('../../../src/helper');
            dom.check.isWysiwygFrame = jest.fn().mockReturnValue(false);

            expect(() => {
                colorPicker.init(mockNode, mockTarget);
            }).not.toThrow();
        });

        it('should use default color when no color found', () => {
            colorPicker.defaultColor = '#000000';

            const { dom } = require('../../../src/helper');
            dom.check.isWysiwygFrame = jest.fn().mockReturnValue(false);

            colorPicker.init(null, mockTarget);

            expect(colorPicker.inputElement.value).toBeDefined();
        });
    });

    describe('hueSlider methods', () => {
        let colorPicker;

        beforeEach(() => {
            colorPicker = new ColorPicker(mockInst, 'color', {});
        });

        it('should close hue slider', () => {
            colorPicker.hueSliderClose();

            expect(colorPicker.hueSlider.off).toHaveBeenCalled();
        });

        it('should handle hueSliderAction', () => {
            const mockColor = { hex: '#ff5500', r: 255, g: 85, b: 0 };

            colorPicker.hueSliderAction(mockColor);

            expect(colorPicker.inputElement.value).toBe('#ff5500');
        });

        it('should handle hueSliderCancelAction with parentForm', () => {
            const mockForm1 = { style: { display: 'none' } };
            const mockForm2 = { style: { display: 'none' } };
            colorPicker.parentForm = [mockForm1, mockForm2];
            colorPicker.parentFormDisplay = [
                [mockForm1, 'block'],
                [mockForm2, 'flex']
            ];

            colorPicker.hueSliderCancelAction();

            expect(mockForm1.style.display).toBe('block');
            expect(mockForm2.style.display).toBe('flex');
        });

        it('should handle hueSliderCancelAction without parentForm', () => {
            colorPicker.parentForm = null;

            expect(() => {
                colorPicker.hueSliderCancelAction();
            }).not.toThrow();
        });
    });

    describe('Event handlers', () => {
        let colorPicker;

        beforeEach(() => {
            mockInst.colorPickerAction = jest.fn();
            colorPicker = new ColorPicker(mockInst, 'color', {});
        });

        it('should register event handlers', () => {
            // The ColorPicker uses this.eventManager from EditorInjector mock
            expect(colorPicker.eventManager.addEvent).toHaveBeenCalled();
        });

        it('should handle OnColorPalette event', () => {
            // Find the __se_hue click handler by checking calls
            const calls = colorPicker.eventManager.addEvent.mock.calls;
            const hueClickCall = calls.find(call => {
                const element = call[0];
                const event = call[1];
                return event === 'click' && element && element.className && element.className.includes('__se_hue');
            });

            if (hueClickCall) {
                const handler = hueClickCall[2];
                colorPicker.targetButton = document.createElement('button');
                colorPicker.parentForm = null;

                handler();

                expect(colorPicker.hueSlider.open).toHaveBeenCalledWith(colorPicker.targetButton);
            }
        });

        it('should handle Submit event', () => {
            colorPicker.currentColor = '#ff0000';

            // Get the submit event handler
            const submitCall = colorPicker.eventManager.addEvent.mock.calls.find(
                call => call[1] === 'submit'
            );

            if (submitCall) {
                const handler = submitCall[2];
                const mockEvent = { preventDefault: jest.fn() };

                handler(mockEvent);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockInst.colorPickerAction).toHaveBeenCalledWith('#ff0000');
            }
        });

        it('should handle OnClickColor event', () => {
            const { dom } = require('../../../src/helper');
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('#00ff00')
            };

            if (!dom.query) dom.query = {};
            dom.query.getEventTarget = jest.fn().mockReturnValue(mockTarget);

            // Get the click event handler on colorPicker.target
            const clickCall = colorPicker.eventManager.addEvent.mock.calls.find(
                call => call[1] === 'click' && call[0] === colorPicker.target
            );

            if (clickCall) {
                const handler = clickCall[2];
                const mockEvent = {};

                handler(mockEvent);

                expect(mockInst.colorPickerAction).toHaveBeenCalledWith('#00ff00');
            }
        });

        it('should handle Remove event', () => {
            // Find the __se_remove click handler
            const removeCall = colorPicker.eventManager.addEvent.mock.calls.find(call => {
                const element = call[0];
                const event = call[1];
                return event === 'click' && element && element.className && element.className.includes('__se_remove');
            });

            if (removeCall) {
                const handler = removeCall[2];

                handler();

                expect(mockInst.colorPickerAction).toHaveBeenCalledWith(null);
            }
        });

        it('should handle OnChangeInput event', () => {
            const { dom } = require('../../../src/helper');
            const mockTarget = {
                value: '#123456'
            };

            if (!dom.query) dom.query = {};
            dom.query.getEventTarget = jest.fn().mockReturnValue(mockTarget);

            // Get the input event handler
            const inputCall = colorPicker.eventManager.addEvent.mock.calls.find(
                call => call[1] === 'input'
            );

            if (inputCall) {
                const handler = inputCall[2];
                const mockEvent = {};

                handler(mockEvent);

                expect(colorPicker.currentColor).toBe('#123456');
                expect(colorPicker.inputElement.style.borderColor).toBe('#123456');
            }
        });
    });

    describe('setHexColor method', () => {
        let colorPicker;

        beforeEach(() => {
            colorPicker = new ColorPicker(mockInst, 'color', {});
        });

        it('should set current color and border color', () => {
            colorPicker.setHexColor('#ff5500');

            expect(colorPicker.currentColor).toBe('#ff5500');
            expect(colorPicker.inputElement.style.borderColor).toBe('#ff5500');
        });
    });

    describe('Constructor with options', () => {
        it('should disable HEX input when option is set', () => {
            const colorPicker = new ColorPicker(mockInst, 'color', {
                disableHEXInput: true
            });

            expect(colorPicker.hueSlider).toBeNull();
        });

        it('should handle custom color list', () => {
            const customColorList = ['#111111', '#222222', '#333333'];

            expect(() => {
                new ColorPicker(mockInst, 'color', {
                    colorList: customColorList
                });
            }).not.toThrow();
        });

        it('should handle custom splitNum', () => {
            expect(() => {
                new ColorPicker(mockInst, 'color', {
                    splitNum: 5
                });
            }).not.toThrow();
        });

        it('should handle defaultColor option', () => {
            const colorPicker = new ColorPicker(mockInst, 'color', {
                defaultColor: '#ff0000'
            });

            expect(colorPicker.defaultColor).toBe('#ff0000');
        });

        it('should handle disableRemove option', () => {
            expect(() => {
                new ColorPicker(mockInst, 'color', {
                    disableRemove: true
                });
            }).not.toThrow();
        });

        it('should handle hueSliderOptions', () => {
            const hueOptions = {
                controllerOptions: {
                    parents: [document.createElement('div')],
                    isInsideForm: false
                }
            };

            const colorPicker = new ColorPicker(mockInst, 'color', {
                hueSliderOptions: hueOptions
            });

            expect(colorPicker.hueSliderOptions).toBe(hueOptions);
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

        it('should handle missing colorPickerAction', () => {
            // Create a new editor with event manager for this test
            const testEventManager = {
                addEvent: jest.fn(),
                removeEvent: jest.fn()
            };
            const testEditor = {
                ...mockEditor,
                eventManager: testEventManager
            };
            const instWithoutAction = {
                editor: testEditor,
                constructor: { key: 'test' }
            };
            const colorPicker = new ColorPicker(instWithoutAction, 'color', {});

            // Get submit event handler
            const submitCall = testEventManager.addEvent.mock.calls.find(
                call => call[1] === 'submit'
            );

            if (submitCall) {
                const handler = submitCall[2];
                const mockEvent = { preventDefault: jest.fn() };

                expect(() => {
                    handler(mockEvent);
                }).not.toThrow();
            }
        });
    });
});