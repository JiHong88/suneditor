/**
 * @fileoverview Unit tests for plugins/dropdown/blockStyle.js
 */

import BlockStyle from '../../../../src/plugins/dropdown/blockStyle.js';
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
                            getAttribute: jest.fn().mockImplementation((attr) => {
                                if (attr === 'data-command') return 'line';
                                if (attr === 'data-value') return 'p';
                                if (attr === 'data-class') return '';
                                return null;
                            }),
                            title: 'Paragraph'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockImplementation((attr) => {
                                if (attr === 'data-command') return 'line';
                                if (attr === 'data-value') return 'h1';
                                if (attr === 'data-class') return '';
                                return null;
                            }),
                            title: 'Header 1'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockImplementation((attr) => {
                                if (attr === 'data-command') return 'block';
                                if (attr === 'data-value') return 'blockquote';
                                if (attr === 'data-class') return '';
                                return null;
                            }),
                            title: 'Blockquote'
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
            changeTxt: jest.fn()
        }
    }
}));

describe('Plugins - Dropdown - blockStyle', () => {
    let kernel;
    let blockStyle;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
        kernel.$.lang.formats = 'Formats';
        kernel.$.lang.tag_p = 'Paragraph';
        kernel.$.lang.tag_h = 'Header';
        kernel.$.lang.tag_blockquote = 'Blockquote';
        kernel.$.lang.tag_pre = 'Code';

        pluginOptions = {
            items: ['p', 'h1', 'h2', 'blockquote', 'pre']
        };

        blockStyle = new BlockStyle(kernel, pluginOptions);
    });

    describe('Constructor', () => {
        it('should create BlockStyle instance with required properties', () => {
            expect(blockStyle).toBeInstanceOf(BlockStyle);
            expect(blockStyle.title).toBe('Formats');
            expect(blockStyle.inner).toContain('<span class="se-txt">Formats</span>');
            expect(blockStyle.inner).toContain('<svg');
            expect(blockStyle.formatList).toBeDefined();
            expect(blockStyle.currentFormat).toBe('');
        });

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper/index.js');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer se-list-format' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(BlockStyle, expect.any(Object));
        });

        it('should initialize format list from menu', () => {
            expect(blockStyle.formatList).toHaveLength(3);
        });

        it('should use default formats when none provided', () => {
            const defaultFormatBlock = new BlockStyle(kernel, {});
            expect(defaultFormatBlock.formatList).toBeDefined();
        });

        it('should use default formats when items is empty', () => {
            const emptyFormatBlock = new BlockStyle(kernel, { items: [] });
            expect(emptyFormatBlock.formatList).toBeDefined();
        });
    });

    describe('active method', () => {
        let mockTarget;
        let mockTargetText;

        beforeEach(() => {
            mockTargetText = {
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };
            mockTarget = {
                querySelector: jest.fn().mockReturnValue(mockTargetText)
            };
        });

        it('should set default format title when no element provided', () => {
            const { dom } = require('../../../../src/helper/index.js');

            const result = blockStyle.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Formats');
            expect(result).toBe(false);
        });

        it('should return false when element is not a line element', () => {
            const mockElement = document.createElement('span');
            kernel.$.format.isLine.mockReturnValue(false);

            const result = blockStyle.active(mockElement, mockTarget);

            expect(result).toBe(false);
        });

        it('should return true and set format title when element matches format', () => {
            const mockElement = {
                nodeName: 'P',
                className: ''
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper/index.js');

            const result = blockStyle.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Paragraph');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-value', 'p');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-class', '');
            expect(result).toBe(true);
        });

        it('should handle element with format class', () => {
            const mockElement = {
                nodeName: 'DIV',
                className: 'some-class __se__format__custom another-class'
            };
            kernel.$.format.isLine.mockReturnValue(true);

            blockStyle.formatList = [{
                getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'data-value') return 'div';
                    if (attr === 'data-class') return '__se__format__custom';
                    return null;
                }),
                title: 'Custom Div'
            }];

            const { dom } = require('../../../../src/helper/index.js');

            const result = blockStyle.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Custom Div');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-value', 'div');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-class', '__se__format__custom');
            expect(result).toBe(true);
        });

        it('should handle element without matching format', () => {
            const mockElement = {
                nodeName: 'SPAN',
                className: ''
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper/index.js');

            const result = blockStyle.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Formats');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-value', 'span');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-class', '');
            expect(result).toBe(true);
        });

        it('should handle header elements', () => {
            const mockElement = {
                nodeName: 'H1',
                className: ''
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper/index.js');

            const result = blockStyle.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Header 1');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-value', 'h1');
            expect(result).toBe(true);
        });

        it('should handle blockquote elements', () => {
            const mockElement = {
                nodeName: 'BLOCKQUOTE',
                className: ''
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper/index.js');

            const result = blockStyle.active(mockElement, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(mockTargetText, 'Blockquote');
            expect(mockTargetText.setAttribute).toHaveBeenCalledWith('data-value', 'blockquote');
            expect(result).toBe(true);
        });

        it('should handle element with no class attribute', () => {
            const mockElement = {
                nodeName: 'P',
                className: undefined // No className property
            };
            kernel.$.format.isLine.mockReturnValue(true);
            const { dom } = require('../../../../src/helper/index.js');

            // This will throw because className.match is called on undefined
            expect(() => {
                blockStyle.active(mockElement, mockTarget);
            }).toThrow();
        });

        it('should handle missing querySelector result', () => {
            mockTarget.querySelector.mockReturnValue(null);
            const { dom } = require('../../../../src/helper/index.js');

            // Will call changeTxt with null target, should not throw
            const result = blockStyle.active(null, mockTarget);

            expect(dom.utils.changeTxt).toHaveBeenCalledWith(null, 'Formats');
            expect(result).toBe(false);
        });
    });

    describe('on method', () => {
        let mockTarget;
        let mockTargetText;

        beforeEach(() => {
            mockTargetText = {
                getAttribute: jest.fn()
            };
            mockTarget = {
                querySelector: jest.fn().mockReturnValue(mockTargetText)
            };

            blockStyle.formatList = [
                {
                    getAttribute: jest.fn().mockImplementation((attr) => {
                        if (attr === 'data-value') return 'p';
                        if (attr === 'data-class') return '';
                        return null;
                    })
                },
                {
                    getAttribute: jest.fn().mockImplementation((attr) => {
                        if (attr === 'data-value') return 'h1';
                        if (attr === 'data-class') return '';
                        return null;
                    })
                },
                {
                    getAttribute: jest.fn().mockImplementation((attr) => {
                        if (attr === 'data-value') return 'blockquote';
                        if (attr === 'data-class') return '';
                        return null;
                    })
                }
            ];
        });

        it('should activate matching format button', () => {
            mockTargetText.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-value') return 'h1';
                if (attr === 'data-class') return '';
                return null;
            });
            blockStyle.currentFormat = 'different'; // Force update
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.on(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(blockStyle.formatList[0], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(blockStyle.formatList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(blockStyle.formatList[2], 'active');
            expect(blockStyle.currentFormat).toBe('h1');
        });

        it('should handle format with class', () => {
            mockTargetText.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-value') return 'div';
                if (attr === 'data-class') return '__se__format__custom';
                return null;
            });
            blockStyle.currentFormat = 'different'; // Force update

            blockStyle.formatList[0].getAttribute.mockImplementation((attr) => {
                if (attr === 'data-value') return 'div';
                if (attr === 'data-class') return '__se__format__custom';
                return null;
            });

            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.on(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(blockStyle.formatList[0], 'active');
            expect(blockStyle.currentFormat).toBe('div__se__format__custom');
        });

        it('should not update when current format is same', () => {
            mockTargetText.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-value') return 'p';
                if (attr === 'data-class') return '';
                return null;
            });
            blockStyle.currentFormat = 'p'; // Same as current
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.on(mockTarget);

            expect(dom.utils.addClass).not.toHaveBeenCalled();
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should handle null data attributes', () => {
            mockTargetText.getAttribute.mockReturnValue(null);
            blockStyle.currentFormat = 'different'; // Force update
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.on(mockTarget);

            expect(blockStyle.currentFormat).toBe('');
        });

        it('should handle empty format list', () => {
            blockStyle.formatList = [];
            mockTargetText.getAttribute.mockReturnValue('p');

            expect(() => {
                blockStyle.on(mockTarget);
            }).not.toThrow();
        });

        it('should handle missing querySelector result', () => {
            mockTarget.querySelector.mockReturnValue(null);

            expect(() => {
                blockStyle.on(mockTarget);
            }).toThrow();
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn(),
                firstElementChild: { tagName: 'P' }
            };
        });

        it('should apply block format when command is "block"', () => {
            mockTarget.getAttribute.mockReturnValue('block');

            blockStyle.action(mockTarget);

            expect(kernel.$.format.applyBlock).toHaveBeenCalledWith(mockTarget.firstElementChild);
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should set br-line format when command is "br-line"', () => {
            mockTarget.getAttribute.mockReturnValue('br-line');

            blockStyle.action(mockTarget);

            expect(kernel.$.format.setBrLine).toHaveBeenCalledWith(mockTarget.firstElementChild);
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should set line format when command is "line"', () => {
            mockTarget.getAttribute.mockReturnValue('line');

            blockStyle.action(mockTarget);

            expect(kernel.$.format.setLine).toHaveBeenCalledWith(mockTarget.firstElementChild);
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should set line format for unknown commands', () => {
            mockTarget.getAttribute.mockReturnValue('unknown');

            blockStyle.action(mockTarget);

            expect(kernel.$.format.setLine).toHaveBeenCalledWith(mockTarget.firstElementChild);
        });

        it('should handle null data-command', () => {
            mockTarget.getAttribute.mockReturnValue(null);

            blockStyle.action(mockTarget);

            expect(kernel.$.format.setLine).toHaveBeenCalledWith(mockTarget.firstElementChild);
        });

        it('should handle missing firstElementChild', () => {
            mockTarget.firstElementChild = null;
            mockTarget.getAttribute.mockReturnValue('line');

            blockStyle.action(mockTarget);

            expect(kernel.$.format.setLine).toHaveBeenCalledWith(null);
        });
    });

    describe('applyHeaderByShortcut method', () => {
        it('should create and apply H1 header', () => {
            const mockParams = { keyCode: 'ctrl+shift+1' }; // Key code ending with '1'
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.applyHeaderByShortcut(mockParams);

            expect(dom.utils.createElement).toHaveBeenCalledWith('H1');
            expect(kernel.$.format.setLine).toHaveBeenCalled();
        });

        it('should create and apply H2 header', () => {
            const mockParams = { keyCode: 'ctrl+shift+2' }; // Key code ending with '2'
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.applyHeaderByShortcut(mockParams);

            expect(dom.utils.createElement).toHaveBeenCalledWith('H2');
        });

        it('should create and apply H6 header', () => {
            const mockParams = { keyCode: 'ctrl+shift+6' }; // Key code ending with '6'
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.applyHeaderByShortcut(mockParams);

            expect(dom.utils.createElement).toHaveBeenCalledWith('H6');
        });

        it('should handle complex key codes', () => {
            const mockParams = { keyCode: 'ctrl+shift+3' }; // Contains '3' at the end
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.applyHeaderByShortcut(mockParams);

            expect(dom.utils.createElement).toHaveBeenCalledWith('H3');
        });

        it('should handle key code without number', () => {
            const mockParams = { keyCode: 'ctrl+shift+a' }; // No number
            const { dom } = require('../../../../src/helper/index.js');

            blockStyle.applyHeaderByShortcut(mockParams);

            expect(dom.utils.createElement).toHaveBeenCalledWith('Hundefined'); // No number found
        });

        it('should handle null keyCode', () => {
            const mockParams = { keyCode: null };

            expect(() => {
                blockStyle.applyHeaderByShortcut(mockParams);
            }).toThrow();
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with custom items', () => {
            const { dom } = require('../../../../src/helper/index.js');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('data-command="line"');
            expect(createCallArgs[2]).toContain('data-value="p"');
            expect(createCallArgs[2]).toContain('data-value="h1"');
            expect(createCallArgs[2]).toContain('data-value="h2"');
            expect(createCallArgs[2]).toContain('data-command="block"');
            expect(createCallArgs[2]).toContain('data-value="blockquote"');
            expect(createCallArgs[2]).toContain('data-command="br-line"');
            expect(createCallArgs[2]).toContain('data-value="pre"');
        });

        it('should include default formats when no items provided', () => {
            const { dom } = require('../../../../src/helper/index.js');
            dom.utils.createElement.mockClear();

            const defaultFormatBlock = new BlockStyle(kernel, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-value="p"');
            expect(createCallArgs[2]).toContain('data-value="blockquote"');
            expect(createCallArgs[2]).toContain('data-value="pre"');
            expect(createCallArgs[2]).toContain('data-value="h1"');
            expect(createCallArgs[2]).toContain('data-value="h2"');
            expect(createCallArgs[2]).toContain('data-value="h3"');
            expect(createCallArgs[2]).toContain('data-value="h4"');
            expect(createCallArgs[2]).toContain('data-value="h5"');
            expect(createCallArgs[2]).toContain('data-value="h6"');
        });

        it('should handle custom format objects', () => {
            const { dom } = require('../../../../src/helper/index.js');
            dom.utils.createElement.mockClear();

            const customFormatBlock = new BlockStyle(kernel, {
                items: [
                    {
                        tag: 'DIV',
                        name: 'Custom Div',
                        class: '__se__format__custom',
                        command: 'block'
                    }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="block"');
            expect(createCallArgs[2]).toContain('data-value="div"');
            expect(createCallArgs[2]).toContain('data-class="__se__format__custom"');
            expect(createCallArgs[2]).toContain('Custom Div');
            expect(createCallArgs[2]).toContain('class="__se__format__custom"');
        });

        it('should handle format objects without name', () => {
            const { dom } = require('../../../../src/helper/index.js');
            dom.utils.createElement.mockClear();

            const noNameFormatBlock = new BlockStyle(kernel, {
                items: [
                    {
                        tag: 'SPAN',
                        command: 'line'
                    }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('span'); // Uses tagName as name
        });

        it('should handle format objects without class', () => {
            const { dom } = require('../../../../src/helper/index.js');
            dom.utils.createElement.mockClear();

            const noClassFormatBlock = new BlockStyle(kernel, {
                items: [
                    {
                        tag: 'SPAN',
                        name: 'Span Element',
                        command: 'line'
                        // No class property - becomes undefined
                    }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-class="undefined"'); // undefined becomes string
            // The HTML element will not have a class attribute because className is undefined
        });

        it('should handle all header types', () => {
            const { dom } = require('../../../../src/helper/index.js');
            dom.utils.createElement.mockClear();

            const headerFormatBlock = new BlockStyle(kernel, {
                items: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('Header1');
            expect(createCallArgs[2]).toContain('Header2');
            expect(createCallArgs[2]).toContain('Header3');
            expect(createCallArgs[2]).toContain('Header4');
            expect(createCallArgs[2]).toContain('Header5');
            expect(createCallArgs[2]).toContain('Header6');
        });

        it('should handle mixed string and object formats', () => {
            const { dom } = require('../../../../src/helper/index.js');
            dom.utils.createElement.mockClear();

            const mixedFormatBlock = new BlockStyle(kernel, {
                items: [
                    'p',
                    { tag: 'DIV', name: 'Custom Div', command: 'line' },
                    'h1'
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-value="p"');
            expect(createCallArgs[2]).toContain('data-value="div"');
            expect(createCallArgs[2]).toContain('data-value="h1"');
            expect(createCallArgs[2]).toContain('Custom Div');
        });

    });

    describe('Integration', () => {
        it('should work with editor format module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('line'),
                firstElementChild: { tagName: 'P' }
            };

            expect(() => {
                blockStyle.action(mockTarget);
            }).not.toThrow();

            expect(kernel.$.format.setLine).toHaveBeenCalled();
        });

        it('should work with line detection', () => {
            const mockElement = { nodeName: 'P', className: '' };
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({
                    setAttribute: jest.fn()
                })
            };

            kernel.$.format.isLine.mockReturnValue(true);

            expect(() => {
                blockStyle.active(mockElement, mockTarget);
            }).not.toThrow();

            expect(kernel.$.format.isLine).toHaveBeenCalledWith(mockElement);
        });

        it('should work with shortcut functionality', () => {
            const mockParams = { keyCode: '49' };

            expect(() => {
                blockStyle.applyHeaderByShortcut(mockParams);
            }).not.toThrow();

            expect(kernel.$.format.setLine).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            kernel.$.format = undefined;

            expect(() => {
                new BlockStyle(kernel, {});
            }).not.toThrow();
        });

        it('should handle missing format list gracefully', () => {
            blockStyle.formatList = [];
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({
                    getAttribute: jest.fn().mockReturnValue('')
                })
            };

            expect(() => {
                blockStyle.on(mockTarget);
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                blockStyle.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new BlockStyle(kernel, {});
            }).not.toThrow();
        });

        it('should handle null plugin options', () => {
            expect(() => {
                new BlockStyle(kernel, null);
            }).toThrow();
        });

        it('should handle invalid format objects', () => {
            const invalidItems = [
                {}, // Missing required properties - will throw
                { tag: 'DIV' } // Missing command - will still work
            ];

            expect(() => {
                new BlockStyle(kernel, { items: invalidItems });
            }).toThrow(); // Will throw when trying to access undefined.toLowerCase
        });
    });
});