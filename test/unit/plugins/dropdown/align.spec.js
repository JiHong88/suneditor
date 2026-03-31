/**
 * @fileoverview Unit tests for plugins/dropdown/align.js
 */

import Align from '../../../../src/plugins/dropdown/align.js';
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
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector === 'ul') {
                            return {
                                querySelectorAll: jest.fn().mockReturnValue([
                                    {
                                        tagName: 'BUTTON',
                                        getAttribute: jest.fn().mockReturnValue('left')
                                    },
                                    {
                                        tagName: 'BUTTON',
                                        getAttribute: jest.fn().mockReturnValue('center')
                                    },
                                    {
                                        tagName: 'BUTTON',
                                        getAttribute: jest.fn().mockReturnValue('right')
                                    },
                                    {
                                        tagName: 'BUTTON',
                                        getAttribute: jest.fn().mockReturnValue('justify')
                                    }
                                ]),
                                querySelector: jest.fn().mockImplementation((sel) => {
                                    if (sel === '[data-command="left"]') {
                                        return { parentElement: { appendChild: jest.fn() } };
                                    } else if (sel === '[data-command="right"]') {
                                        return { parentElement: { appendChild: jest.fn() } };
                                    }
                                    return null;
                                })
                            };
                        }
                        return null;
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
            changeElement: jest.fn(),
            setStyle: jest.fn()
        }
    }
}));

describe('Plugins - Dropdown - Align', () => {
    let kernel;
    let align;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
        kernel.$.lang.align = 'Align';
        kernel.$.lang.alignLeft = 'Left';
        kernel.$.lang.alignCenter = 'Center';
        kernel.$.lang.alignRight = 'Right';
        kernel.$.lang.alignJustify = 'Justify';
        kernel.$.icons.align_left = '<svg>left</svg>';
        kernel.$.icons.align_center = '<svg>center</svg>';
        kernel.$.icons.align_right = '<svg>right</svg>';
        kernel.$.icons.align_justify = '<svg>justify</svg>';
        kernel.$.options.get = jest.fn().mockImplementation((key) => {
            if (key === '_rtl') return false;
            return null;
        });
        kernel.$.selection.getNode.mockReturnValue(document.createElement('p'));
        kernel.$.format.isLine.mockReturnValue(true);
        kernel.$.format.getLines.mockReturnValue([
            { style: {} },
            { style: {} }
        ]);
        kernel.$.menu.initDropdownTarget = jest.fn();
        kernel.$.frameContext.set('wwComputedStyle', {
            getPropertyValue: jest.fn().mockReturnValue('left')
        });

        pluginOptions = {
            items: ['left', 'center', 'right', 'justify']
        };

        align = new Align(kernel, pluginOptions);
        align.init(); // Call init to set defaultDir
    });

    describe('Constructor', () => {
        it('should create Align instance with required properties', () => {
            expect(align).toBeInstanceOf(Align);
            expect(align.title).toBe('Align');
            expect(align.icon).toBe('align_left'); // LTR default
            expect(align.defaultDir).toBe('left');
            expect(align.alignIcons).toBeDefined();
            expect(align.alignList).toBeDefined();
        });

        it('should use RTL icon when editor is RTL', () => {
            kernel.$.options.get.mockImplementation((key) => {
                if (key === '_rtl') return true;
                return null;
            });
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('right');

            const rtlAlign = new Align(kernel, pluginOptions);
            rtlAlign.init();
            expect(rtlAlign.icon).toBe('align_right');
            expect(rtlAlign.defaultDir).toBe('right');
        });

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'div',
                { class: 'se-dropdown se-list-layer se-list-align' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(Align, expect.any(Object));
        });

        it('should initialize align list from menu', () => {
            expect(align.alignList).toHaveLength(4);
        });

        it('should setup align icons correctly', () => {
            expect(align.alignIcons.left).toBe('<svg>left</svg>');
            expect(align.alignIcons.center).toBe('<svg>center</svg>');
            expect(align.alignIcons.right).toBe('<svg>right</svg>');
            expect(align.alignIcons.justify).toBe('<svg>justify</svg>');
        });

        it('should use default items when none provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultAlign = new Align(kernel, {});
            expect(defaultAlign.alignList).toBeDefined();
        });
    });

    describe('active method', () => {
        let mockTarget;
        let mockTargetChild;

        beforeEach(() => {
            mockTargetChild = { tagName: 'SPAN' };
            mockTarget = {
                firstElementChild: mockTargetChild,
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };
        });

        it('should set default icon when no element provided', () => {
            const { dom } = require('../../../../src/helper');

            const result = align.active(null, mockTarget);

            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockTargetChild, '<svg>left</svg>');
            expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
            expect(result).toBe(false);
        });

        it('should return undefined when element is not a line element', () => {
            const mockElement = document.createElement('span');
            kernel.$.format.isLine.mockReturnValue(false);

            const result = align.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should return true and set focus when element has textAlign', () => {
            const mockElement = {
                style: { textAlign: 'center' }
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper');

            const result = align.active(mockElement, mockTarget);

            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockTargetChild, '<svg>center</svg>');
            expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-focus', 'center');
            expect(result).toBe(true);
        });

        it('should use default icon for unknown textAlign value', () => {
            const mockElement = {
                style: { textAlign: 'unknown-align' }
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper');

            const result = align.active(mockElement, mockTarget);

            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockTargetChild, '<svg>left</svg>');
            expect(result).toBe(true);
        });

        it('should return undefined when element has no textAlign', () => {
            const mockElement = {
                style: { textAlign: '' }
            };
            kernel.$.format.isLine.mockReturnValue(true);

            const result = align.active(mockElement, mockTarget);

            expect(result).toBeUndefined();
        });

        it('should handle RTL default direction', () => {
            align.defaultDir = 'right';
            const { dom } = require('../../../../src/helper');

            align.active(null, mockTarget);

            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockTargetChild, '<svg>right</svg>');
        });

        it('should handle various text alignment values', () => {
            const alignments = ['left', 'center', 'right', 'justify'];
            const { dom } = require('../../../../src/helper');

            alignments.forEach(alignment => {
                const mockElement = {
                    style: { textAlign: alignment }
                };
                kernel.$.format.isLine.mockReturnValue(true);

                const result = align.active(mockElement, mockTarget);

                expect(dom.utils.changeElement).toHaveBeenCalledWith(mockTargetChild, `<svg>${alignment}</svg>`);
                expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-focus', alignment);
                expect(result).toBe(true);
            });
        });
    });

    describe('on method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn()
            };

            align.alignList = [
                { getAttribute: jest.fn().mockReturnValue('left') },
                { getAttribute: jest.fn().mockReturnValue('center') },
                { getAttribute: jest.fn().mockReturnValue('right') },
                { getAttribute: jest.fn().mockReturnValue('justify') }
            ];
        });

        it('should activate matching align button', () => {
            mockTarget.getAttribute.mockReturnValue('center');
            const { dom } = require('../../../../src/helper');

            align.on(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[0], 'active'); // left
            expect(dom.utils.addClass).toHaveBeenCalledWith(align.alignList[1], 'active'); // center
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[2], 'active'); // right
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[3], 'active'); // justify
        });

        it('should activate default direction when no data-focus', () => {
            mockTarget.getAttribute.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');

            align.on(mockTarget);

            // Should activate left (default direction)
            expect(dom.utils.addClass).toHaveBeenCalledWith(align.alignList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[2], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[3], 'active');
        });

        it('should handle RTL default direction', () => {
            align.defaultDir = 'right';
            mockTarget.getAttribute.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');

            align.on(mockTarget);

            // Should activate right (RTL default direction)
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[1], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(align.alignList[2], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(align.alignList[3], 'active');
        });

        it('should handle empty current align gracefully', () => {
            mockTarget.getAttribute.mockReturnValue('');
            const { dom } = require('../../../../src/helper');

            align.on(mockTarget);

            // Should activate left (default direction)
            expect(dom.utils.addClass).toHaveBeenCalledWith(align.alignList[0], 'active');
        });

        it('should handle unknown align value gracefully', () => {
            mockTarget.getAttribute.mockReturnValue('unknown');
            align.alignList[0].getAttribute.mockReturnValue('unknown'); // First item matches
            const { dom } = require('../../../../src/helper');

            align.on(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(align.alignList[0], 'active');
        });

        it('should handle empty align list gracefully', () => {
            align.alignList = [];
            mockTarget.getAttribute.mockReturnValue('center');

            expect(() => {
                align.on(mockTarget);
            }).not.toThrow();
        });
    });

    describe('setDir method', () => {
        beforeEach(() => {
            align._itemMenu = {
                querySelector: jest.fn().mockImplementation((selector) => {
                    if (selector === '[data-command="left"]') {
                        return { parentElement: { appendChild: jest.fn() } };
                    } else if (selector === '[data-command="right"]') {
                        return { parentElement: { appendChild: jest.fn() } };
                    }
                    return null;
                })
            };
        });

        it('should change default direction from ltr to rtl', () => {
            expect(align.defaultDir).toBe('left');

            // Change computed style to rtl
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('right');
            align.setDir();

            expect(align.defaultDir).toBe('right');
        });

        it('should change default direction from rtl to ltr', () => {
            // Set to rtl first
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('right');
            align.setDir();
            expect(align.defaultDir).toBe('right');

            // Change back to ltr
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('left');
            align.setDir();

            expect(align.defaultDir).toBe('left');
        });

        it('should not change when direction is already set', () => {
            const originalDir = align.defaultDir;

            // Call setDir with same direction
            align.setDir();

            expect(align.defaultDir).toBe(originalDir);
        });

        it('should swap left and right buttons when changing direction', () => {
            const leftBtn = { parentElement: { appendChild: jest.fn() } };
            const rightBtn = { parentElement: { appendChild: jest.fn() } };

            align._itemMenu.querySelector.mockImplementation((selector) => {
                if (selector === '[data-command="left"]') return leftBtn;
                if (selector === '[data-command="right"]') return rightBtn;
                return null;
            });

            // Change to rtl
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('right');
            align.setDir();

            expect(leftBtn.parentElement.appendChild).toHaveBeenCalledWith(rightBtn);
            expect(rightBtn.parentElement.appendChild).toHaveBeenCalledWith(leftBtn);
        });

        it('should handle missing left or right buttons gracefully', () => {
            align._itemMenu.querySelector.mockReturnValue(null);

            // Change to rtl
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('right');
            expect(() => {
                align.setDir();
            }).not.toThrow();
        });
    });

    describe('action method', () => {
        let mockTarget;
        let mockFormats;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn()
            };

            mockFormats = [
                { style: {} },
                { style: {} }
            ];

            kernel.$.format.getLines.mockReturnValue(mockFormats);
        });

        it('should set text alignment for all selected lines', () => {
            mockTarget.getAttribute.mockReturnValue('center');
            const { dom } = require('../../../../src/helper');

            align.action(mockTarget);

            expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[0], 'textAlign', 'center');
            expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[1], 'textAlign', 'center');
            expect(kernel.effectNode).toBeNull();
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
            expect(kernel.$.focusManager.focus).toHaveBeenCalled();
            expect(kernel.$.history.push).toHaveBeenCalledWith(false);
        });

        it('should clear text alignment when setting to default direction', () => {
            mockTarget.getAttribute.mockReturnValue('left'); // Default direction
            const { dom } = require('../../../../src/helper');

            align.action(mockTarget);

            expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[0], 'textAlign', '');
            expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[1], 'textAlign', '');
        });

        it('should handle RTL default direction', () => {
            align.defaultDir = 'right';
            mockTarget.getAttribute.mockReturnValue('right'); // RTL default direction
            const { dom } = require('../../../../src/helper');

            align.action(mockTarget);

            expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[0], 'textAlign', '');
            expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[1], 'textAlign', '');
        });

        it('should return early when no data-command value', () => {
            mockTarget.getAttribute.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');

            align.action(mockTarget);

            expect(dom.utils.setStyle).not.toHaveBeenCalled();
            expect(kernel.$.menu.dropdownOff).not.toHaveBeenCalled();
        });

        it('should return early when data-command is empty', () => {
            mockTarget.getAttribute.mockReturnValue('');
            const { dom } = require('../../../../src/helper');

            align.action(mockTarget);

            expect(dom.utils.setStyle).not.toHaveBeenCalled();
        });

        it('should handle empty formats array', () => {
            kernel.$.format.getLines.mockReturnValue([]);
            mockTarget.getAttribute.mockReturnValue('center');

            expect(() => {
                align.action(mockTarget);
            }).not.toThrow();

            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle all alignment values', () => {
            const alignments = ['left', 'center', 'right', 'justify'];
            const { dom } = require('../../../../src/helper');

            alignments.forEach(alignment => {
                jest.clearAllMocks();
                mockTarget.getAttribute.mockReturnValue(alignment);

                align.action(mockTarget);

                const expectedValue = alignment === align.defaultDir ? '' : alignment;
                expect(dom.utils.setStyle).toHaveBeenCalledWith(mockFormats[0], 'textAlign', expectedValue);
            });
        });

    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with custom items', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-align'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('data-command="left"');
            expect(createCallArgs[2]).toContain('data-command="center"');
            expect(createCallArgs[2]).toContain('data-command="right"');
            expect(createCallArgs[2]).toContain('data-command="justify"');
            expect(createCallArgs[2]).toContain('Left');
            expect(createCallArgs[2]).toContain('Center');
            expect(createCallArgs[2]).toContain('Right');
            expect(createCallArgs[2]).toContain('Justify');
        });

        it('should include default align items when none provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultAlign = new Align(kernel, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-align'
            );

            expect(createCallArgs[2]).toContain('data-command="left"');
            expect(createCallArgs[2]).toContain('data-command="center"');
            expect(createCallArgs[2]).toContain('data-command="right"');
            expect(createCallArgs[2]).toContain('data-command="justify"');
        });

        it('should use RTL order when editor is RTL', () => {
            kernel.$.options.get.mockImplementation((key) => {
                if (key === '_rtl') return true;
                return null;
            });
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const rtlAlign = new Align(kernel, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-align'
            );

            // RTL order: right, center, left, justify
            const content = createCallArgs[2];
            const rightIndex = content.indexOf('data-command="right"');
            const leftIndex = content.indexOf('data-command="left"');
            expect(rightIndex).toBeLessThan(leftIndex);
        });

        it('should include align icons in menu items', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-align'
            );

            expect(createCallArgs[2]).toContain('<svg>left</svg>');
            expect(createCallArgs[2]).toContain('<svg>center</svg>');
            expect(createCallArgs[2]).toContain('<svg>right</svg>');
            expect(createCallArgs[2]).toContain('<svg>justify</svg>');
        });

        it('should handle partial item lists', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const partialAlign = new Align(kernel, { items: ['left', 'center'] });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-align'
            );

            expect(createCallArgs[2]).toContain('data-command="left"');
            expect(createCallArgs[2]).toContain('data-command="center"');
            expect(createCallArgs[2]).not.toContain('data-command="right"');
            expect(createCallArgs[2]).not.toContain('data-command="justify"');
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('center')
            };

            expect(() => {
                align.action(mockTarget);
            }).not.toThrow();

            expect(kernel.$.format.getLines).toHaveBeenCalled();
        });

        it('should work with line detection', () => {
            const mockElement = { style: { textAlign: 'center' } };
            const mockTarget = {
                firstElementChild: {},
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };

            kernel.$.format.isLine.mockReturnValue(true);

            expect(() => {
                align.active(mockElement, mockTarget);
            }).not.toThrow();

            expect(kernel.$.format.isLine).toHaveBeenCalledWith(mockElement);
        });

        it('should work with RTL/LTR direction changes', () => {
            expect(() => {
                align.setDir('rtl');
                align.setDir('ltr');
            }).not.toThrow();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            kernel.$.format = undefined;

            expect(() => {
                new Align(kernel, {});
            }).not.toThrow();
        });

        it('should handle missing align list gracefully', () => {
            align.alignList = [];
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('center')
            };

            expect(() => {
                align.on(mockTarget);
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                align.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new Align(kernel, {});
            }).not.toThrow();
        });

        it('should handle null plugin options', () => {
            expect(() => {
                new Align(kernel, null);
            }).toThrow();
        });

        it('should handle missing icons gracefully', () => {
            const incompleteKernel = createMockEditor();
            incompleteKernel.$.icons = {};

            expect(() => {
                new Align(incompleteKernel, {});
            }).not.toThrow();
        });

        it('should handle missing _itemMenu in setDir', () => {
            align._itemMenu = null;

            // Change to rtl to trigger button swapping
            kernel.$.frameContext.get('wwComputedStyle').getPropertyValue.mockReturnValue('right');

            // Should not throw even with null _itemMenu
            expect(() => {
                align.setDir();
            }).toThrow();
        });

        it('should handle null firstElementChild in active method', () => {
            const mockTarget = {
                firstElementChild: null,
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };
            const { dom } = require('../../../../src/helper');

            // Should call changeElement even with null firstElementChild (will pass null to changeElement)
            expect(() => {
                align.active(null, mockTarget);
            }).not.toThrow();

            expect(dom.utils.changeElement).toHaveBeenCalledWith(null, '<svg>left</svg>');
            expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
        });
    });
});