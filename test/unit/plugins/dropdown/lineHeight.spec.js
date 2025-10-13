/**
 * @fileoverview Unit tests for plugins/dropdown/lineHeight.js
 */

import LineHeight from '../../../../src/plugins/dropdown/lineHeight.js';

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
                            getAttribute: jest.fn().mockReturnValue('1em'),
                            textContent: '1'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('1.2em'),
                            textContent: '1.2'
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('1.7em'),
                            textContent: '1.7'
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
            removeClass: jest.fn()
        }
    }
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.selection = editor.selection;
        this.format = editor.format;
        this.history = editor.history;
        this.menu = editor.menu;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - LineHeight', () => {
    let mockEditor;
    let lineHeight;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                lineHeight: 'Line Height',
                default: 'Default'
            },
            selection: {
                getNode: jest.fn().mockReturnValue(document.createElement('p'))
            },
            format: {
                isLine: jest.fn().mockReturnValue(true),
                getLine: jest.fn().mockReturnValue({
                    style: { lineHeight: '1.2em' }
                }),
                getLines: jest.fn().mockReturnValue([
                    { style: { lineHeight: '' } },
                    { style: { lineHeight: '' } }
                ])
            },
            history: {
                push: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            effectNode: null,
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        pluginOptions = {
            items: [
                { text: '1', value: '1em' },
                { text: '1.5', value: '1.5em' },
                { text: '2', value: '2em' }
            ]
        };

        lineHeight = new LineHeight(mockEditor, pluginOptions);
    });


    describe('Constructor', () => {

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(LineHeight, expect.any(Object));
        });

        it('should initialize size list from menu', () => {
            expect(lineHeight.sizeList).toHaveLength(4);
        });

        it('should use default items when none provided', () => {
            const defaultLineHeight = new LineHeight(mockEditor, {});
            expect(defaultLineHeight.sizeList).toBeDefined();
        });
    });

    describe('active method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = { className: '' };
        });

        it('should return true and add active class when element is line with lineHeight', () => {
            const mockElement = {
                style: { lineHeight: '1.5em' }
            };
            mockEditor.format.isLine.mockReturnValue(true);

            const result = lineHeight.active(mockElement, mockTarget);

            expect(result).toBe(true);
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should return false and remove active class when element has no lineHeight', () => {
            const mockElement = {
                style: { lineHeight: '' }
            };
            mockEditor.format.isLine.mockReturnValue(true);

            const result = lineHeight.active(mockElement, mockTarget);

            expect(result).toBe(false);
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.addClass).not.toHaveBeenCalled();
        });

        it('should return false when element is not a line element', () => {
            const mockElement = {
                style: { lineHeight: '2em' }
            };
            mockEditor.format.isLine.mockReturnValue(false);

            const result = lineHeight.active(mockElement, mockTarget);

            expect(result).toBe(false);
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should handle null element', () => {
            mockEditor.format.isLine.mockReturnValue(false);

            const result = lineHeight.active(null, mockTarget);

            expect(result).toBe(false);
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should check lineHeight length properly', () => {
            const mockElement = {
                style: { lineHeight: '0' }
            };
            mockEditor.format.isLine.mockReturnValue(true);

            const result = lineHeight.active(mockElement, mockTarget);

            expect(result).toBe(true);
        });
    });

    describe('on method', () => {
        beforeEach(() => {
            lineHeight.sizeList = [
                { getAttribute: jest.fn().mockReturnValue('') },
                { getAttribute: jest.fn().mockReturnValue('1em') },
                { getAttribute: jest.fn().mockReturnValue('1.5em') },
                { getAttribute: jest.fn().mockReturnValue('2em') }
            ];
        });

        it('should activate matching line height button', () => {
            mockEditor.format.getLine.mockReturnValue({
                style: { lineHeight: '1.5em' }
            });

            lineHeight.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(lineHeight.sizeList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(lineHeight.sizeList[1], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(lineHeight.sizeList[2], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(lineHeight.sizeList[3], 'active');
            expect(lineHeight.currentSize).toBe('1.5em');
        });

        it('should activate default button when no line height', () => {
            mockEditor.format.getLine.mockReturnValue({
                style: { lineHeight: '' }
            });

            lineHeight.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(lineHeight.sizeList[0], 'active');
            expect(lineHeight.currentSize).toBe('');
        });

        it('should handle null format element', () => {
            mockEditor.format.getLine.mockReturnValue(null);

            lineHeight.on();

            expect(lineHeight.currentSize).toBe('');
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(lineHeight.sizeList[0], 'active');
        });

        it('should not update if current size is same', () => {
            lineHeight.currentSize = '1.5em';
            mockEditor.format.getLine.mockReturnValue({
                style: { lineHeight: '1.5em' }
            });

            lineHeight.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).not.toHaveBeenCalled();
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should convert numeric lineHeight to string', () => {
            mockEditor.format.getLine.mockReturnValue({
                style: { lineHeight: 1.5 }
            });

            lineHeight.on();

            expect(lineHeight.currentSize).toBe('1.5');
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
                { style: { lineHeight: '' } },
                { style: { lineHeight: '1em' } }
            ];

            mockEditor.format.getLines.mockReturnValue(mockFormats);
        });

        it('should set line height for all selected lines', () => {
            mockTarget.getAttribute.mockReturnValue('1.5em');

            lineHeight.action(mockTarget);

            expect(mockFormats[0].style.lineHeight).toBe('1.5em');
            expect(mockFormats[1].style.lineHeight).toBe('1.5em');
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
            expect(mockEditor.effectNode).toBeNull();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should set empty line height for default', () => {
            mockTarget.getAttribute.mockReturnValue('');

            lineHeight.action(mockTarget);

            expect(mockFormats[0].style.lineHeight).toBe('');
            expect(mockFormats[1].style.lineHeight).toBe('');
        });

        it('should handle null data-command attribute', () => {
            mockTarget.getAttribute.mockReturnValue(null);

            lineHeight.action(mockTarget);

            expect(mockFormats[0].style.lineHeight).toBe('');
            expect(mockFormats[1].style.lineHeight).toBe('');
        });

        it('should handle empty lines array', () => {
            mockEditor.format.getLines.mockReturnValue([]);

            expect(() => {
                lineHeight.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should apply to multiple line formats', () => {
            const manyFormats = [
                { style: { lineHeight: '' } },
                { style: { lineHeight: '' } },
                { style: { lineHeight: '' } }
            ];
            mockEditor.format.getLines.mockReturnValue(manyFormats);
            mockTarget.getAttribute.mockReturnValue('2em');

            lineHeight.action(mockTarget);

            manyFormats.forEach(format => {
                expect(format.style.lineHeight).toBe('2em');
            });
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with default and custom items', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('default_value');
            expect(createCallArgs[2]).toContain('(Default)');
            expect(createCallArgs[2]).toContain('data-command="1em"');
            expect(createCallArgs[2]).toContain('data-command="1.5em"');
            expect(createCallArgs[2]).toContain('data-command="2em"');
        });

        it('should include default line heights when no items provided', () => {
            // Clear previous calls first
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultLineHeight = new LineHeight(mockEditor, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer'
            );

            expect(createCallArgs[2]).toContain('data-command="1em"');
            expect(createCallArgs[2]).toContain('data-command="1.2em"');
            expect(createCallArgs[2]).toContain('data-command="1.7em"');
            expect(createCallArgs[2]).toContain('data-command="2em"');
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('1.5em')
            };

            expect(() => {
                lineHeight.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.format.getLines).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            expect(() => {
                lineHeight.on();
            }).not.toThrow();

            expect(mockEditor.selection.getNode).toHaveBeenCalled();
        });

        it('should work with line detection', () => {
            const mockElement = {
                style: { lineHeight: '2em' }
            };
            const mockTarget = { className: '' };

            expect(() => {
                lineHeight.active(mockElement, mockTarget);
            }).not.toThrow();

            expect(mockEditor.format.isLine).toHaveBeenCalledWith(mockElement);
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            mockEditor.format = undefined;

            expect(() => {
                new LineHeight(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing size list gracefully', () => {
            lineHeight.sizeList = [];

            expect(() => {
                lineHeight.on();
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                lineHeight.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new LineHeight(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle null items in options', () => {
            expect(() => {
                new LineHeight(mockEditor, { items: null });
            }).not.toThrow();
        });
    });
});