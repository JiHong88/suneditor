/**
 * @fileoverview Unit tests for plugins/dropdown/paragraphStyle.js
 */

import ParagraphStyle from '../../../../src/plugins/dropdown/paragraphStyle.js';

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
            hasClass: jest.fn()
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

describe('Plugins - Dropdown - ParagraphStyle', () => {
    let mockEditor;
    let paragraphStyle;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                paragraphStyle: 'Paragraph Style',
                menu_spaced: 'Spaced',
                menu_bordered: 'Bordered',
                menu_neon: 'Neon'
            },
            selection: {
                getNode: jest.fn().mockReturnValue(document.createElement('p')),
                getRange: jest.fn().mockReturnValue({ startContainer: {}, endContainer: {} }),
                getRangeAndAddLine: jest.fn()
            },
            format: {
                getLine: jest.fn().mockReturnValue({
                    className: '__se__p-spaced'
                }),
                getLines: jest.fn().mockReturnValue([
                    { className: '' },
                    { className: '__se__p-bordered' }
                ])
            },
            history: {
                push: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        pluginOptions = {
            items: [
                { name: 'Custom Spaced', class: '__se__p-custom-spaced', _class: 'custom-btn' },
                { name: 'Custom Bordered', class: '__se__p-custom-bordered', _class: '' }
            ]
        };

        paragraphStyle = new ParagraphStyle(mockEditor, pluginOptions);
    });


    describe('Constructor', () => {

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer se-list-format' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(ParagraphStyle, expect.any(Object));
        });

        it('should initialize class list from menu', () => {
            expect(paragraphStyle.classList).toHaveLength(3);
        });

        it('should use default items when none provided', () => {
            const defaultParagraphStyle = new ParagraphStyle(mockEditor, {});
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
            mockEditor.format.getLine.mockReturnValue(mockFormat);
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
            mockEditor.format.getLine.mockReturnValue(mockFormat);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            paragraphStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[1], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(paragraphStyle.classList[2], 'active');
        });

        it('should handle multiple matching classes', () => {
            const mockFormat = { className: '__se__p-bordered __se__p-neon' };
            mockEditor.format.getLine.mockReturnValue(mockFormat);
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
            mockEditor.format.getLine.mockReturnValue(null);
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

            mockEditor.format.getLines.mockReturnValue(mockFormats);
        });

        it('should add class to selected formats when not active', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            paragraphStyle.action(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(mockFormats[0], '__se__p-spaced');
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockFormats[1], '__se__p-spaced');
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should remove class from selected formats when active', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(true);

            paragraphStyle.action(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockFormats[0], '__se__p-spaced');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockFormats[1], '__se__p-spaced');
        });

        it('should handle empty lines array by adding new line', () => {
            mockEditor.format.getLines.mockReturnValueOnce([]).mockReturnValueOnce(mockFormats);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            paragraphStyle.action(mockTarget);

            expect(mockEditor.selection.getRangeAndAddLine).toHaveBeenCalled();
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockFormats[0], '__se__p-spaced');
        });

        it('should return early if no formats after adding line', () => {
            mockEditor.format.getLines.mockReturnValue([]);

            paragraphStyle.action(mockTarget);

            expect(mockEditor.selection.getRangeAndAddLine).toHaveBeenCalled();
            expect(mockEditor.menu.dropdownOff).not.toHaveBeenCalled();
        });

        it('should handle null data-command attribute', () => {
            mockTarget.getAttribute.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            paragraphStyle.action(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(mockFormats[0], null);
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockFormats[1], null);
        });

        it('should apply to multiple formats', () => {
            const manyFormats = [
                { className: '' },
                { className: '' },
                { className: '__se__p-bordered' }
            ];
            mockEditor.format.getLines.mockReturnValue(manyFormats);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            paragraphStyle.action(mockTarget);

            manyFormats.forEach(format => {
                expect(dom.utils.addClass).toHaveBeenCalledWith(format, '__se__p-spaced');
            });
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with custom items', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('data-command="__se__p-custom-spaced"');
            expect(createCallArgs[2]).toContain('Custom Spaced');
            expect(createCallArgs[2]).toContain('data-command="__se__p-custom-bordered"');
            expect(createCallArgs[2]).toContain('Custom Bordered');
        });

        it('should include default paragraph styles when no items provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultParagraphStyle = new ParagraphStyle(mockEditor, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="__se__p-spaced"');
            expect(createCallArgs[2]).toContain('data-command="__se__p-bordered"');
            expect(createCallArgs[2]).toContain('data-command="__se__p-neon"');
            expect(createCallArgs[2]).toContain('Spaced');
            expect(createCallArgs[2]).toContain('Bordered');
            expect(createCallArgs[2]).toContain('Neon');
        });

        it('should handle string items from default list', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const stringParagraphStyle = new ParagraphStyle(mockEditor, {
                items: ['spaced', 'neon']
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="__se__p-spaced"');
            expect(createCallArgs[2]).toContain('data-command="__se__p-neon"');
            expect(createCallArgs[2]).not.toContain('data-command="__se__p-bordered"');
        });

        it('should skip invalid string items', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const invalidParagraphStyle = new ParagraphStyle(mockEditor, {
                items: ['spaced', 'invalid-style', 'neon']
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="__se__p-spaced"');
            expect(createCallArgs[2]).toContain('data-command="__se__p-neon"');
            expect(createCallArgs[2]).not.toContain('invalid-style');
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

            expect(mockEditor.format.getLines).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            expect(() => {
                paragraphStyle.on();
            }).not.toThrow();

            expect(mockEditor.selection.getNode).toHaveBeenCalled();
        });

        it('should work with class detection', () => {
            const mockFormat = { className: '__se__p-spaced' };
            mockEditor.format.getLine.mockReturnValue(mockFormat);
            const { dom } = require('../../../../src/helper');

            paragraphStyle.on();

            expect(dom.utils.hasClass).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            mockEditor.format = undefined;

            expect(() => {
                new ParagraphStyle(mockEditor, {});
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
                new ParagraphStyle(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle empty items array', () => {
            expect(() => {
                new ParagraphStyle(mockEditor, { items: [] });
            }).not.toThrow();
        });

        it('should handle items with missing properties', () => {
            const incompleteItems = [
                { name: 'Test' }, // missing class
                { class: '__se__p-test' } // missing name
            ];

            expect(() => {
                new ParagraphStyle(mockEditor, { items: incompleteItems });
            }).not.toThrow();
        });
    });
});