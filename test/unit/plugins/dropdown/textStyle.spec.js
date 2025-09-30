/**
 * @fileoverview Unit tests for plugins/dropdown/textStyle.js
 */

import TextStyle from '../../../../src/plugins/dropdown/textStyle.js';

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
                                if (attr === 'data-command') return 'code';
                                if (attr === 'data-value') return '.__se__t-code';
                                return null;
                            }),
                            firstElementChild: {
                                tagName: 'CODE',
                                nodeName: 'CODE',
                                style: { cssText: '' },
                                classList: ['__se__t-code'],
                                cloneNode: jest.fn().mockReturnValue({
                                    tagName: 'CODE',
                                    nodeName: 'CODE'
                                })
                            }
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockImplementation((attr) => {
                                if (attr === 'data-command') return 'span';
                                if (attr === 'data-value') return '.__se__t-shadow';
                                return null;
                            }),
                            firstElementChild: {
                                tagName: 'SPAN',
                                nodeName: 'SPAN',
                                style: { cssText: '' },
                                classList: ['__se__t-shadow'],
                                cloneNode: jest.fn().mockReturnValue({
                                    tagName: 'SPAN',
                                    nodeName: 'SPAN'
                                })
                            }
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
            hasClass: jest.fn(),
            cloneNode: jest.fn()
        }
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
        this.component = editor.component;
        this.menu = editor.menu;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - TextStyle', () => {
    let mockEditor;
    let textStyle;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                textStyle: 'Text Style',
                menu_code: 'Code',
                menu_shadow: 'Shadow'
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
            component: {
                is: jest.fn().mockReturnValue(false)
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
                { name: 'Custom Code', class: '__se__t-custom-code', tag: 'code' },
                { name: 'Custom Shadow', class: '__se__t-custom-shadow', tag: 'span' }
            ]
        };

        textStyle = new TextStyle(mockEditor, pluginOptions);
    });

    describe('Static properties', () => {
        it('should have correct static properties', () => {
            expect(TextStyle.key).toBe('textStyle');
            expect(TextStyle.type).toBe('dropdown');
            expect(TextStyle.className).toBe('');
        });
    });

    describe('Constructor', () => {
        it('should create TextStyle instance with required properties', () => {
            expect(textStyle).toBeInstanceOf(TextStyle);
            expect(textStyle.title).toBe('Text Style');
            expect(textStyle.icon).toBe('text_style');
            expect(textStyle.styleList).toBeDefined();
        });

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer se-list-format' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(TextStyle, expect.any(Object));
        });

        it('should initialize style list from menu', () => {
            expect(textStyle.styleList).toHaveLength(2);
        });

        it('should use default styles when none provided', () => {
            const defaultTextStyle = new TextStyle(mockEditor, {});
            expect(defaultTextStyle.styleList).toBeDefined();
        });
    });

    describe('on method', () => {
        let mockNode;

        beforeEach(() => {
            mockNode = {
                nodeName: 'CODE',
                className: '__se__t-code',
                parentNode: {
                    nodeName: 'P',
                    parentNode: null
                }
            };

            textStyle.styleList = [
                {
                    getAttribute: jest.fn().mockImplementation((attr) => {
                        if (attr === 'data-command') return 'code';
                        if (attr === 'data-value') return '.__se__t-code';
                        return null;
                    })
                },
                {
                    getAttribute: jest.fn().mockImplementation((attr) => {
                        if (attr === 'data-command') return 'span';
                        if (attr === 'data-value') return '.__se__t-shadow';
                        return null;
                    })
                }
            ];
        });

        it('should activate matching text style button', () => {
            mockEditor.selection.getNode.mockReturnValue(mockNode);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockImplementation((node, className) =>
                node === mockNode && className === '__se__t-code'
            );

            textStyle.on();

            expect(dom.utils.addClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });

        it('should deactivate all buttons when no matching style', () => {
            const plainNode = { nodeName: 'SPAN', parentNode: null };
            mockEditor.selection.getNode.mockReturnValue(plainNode);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            textStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });

        it('should handle multiple classes in data-value', () => {
            textStyle.styleList[0].getAttribute.mockImplementation((attr) => {
                if (attr === 'data-command') return 'span';
                if (attr === 'data-value') return '.__se__t-code,.__se__t-custom';
                return null;
            });

            const multiClassNode = {
                nodeName: 'SPAN',
                className: '__se__t-code __se__t-custom',
                parentNode: null
            };
            mockEditor.selection.getNode.mockReturnValue(multiClassNode);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockImplementation((node, className) =>
                node === multiClassNode && (className === '__se__t-code' || className === '__se__t-custom')
            );

            textStyle.on();

            expect(dom.utils.addClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
        });

        it('should handle style properties in data-value', () => {
            const styledNode = {
                nodeName: 'SPAN',
                style: { fontWeight: 'bold' },
                parentNode: null
            };

            textStyle.styleList[0].getAttribute.mockImplementation((attr) => {
                if (attr === 'data-command') return 'span';
                if (attr === 'data-value') return 'fontWeight';
                return null;
            });

            mockEditor.selection.getNode.mockReturnValue(styledNode);
            const { dom } = require('../../../../src/helper');

            textStyle.on();

            expect(dom.utils.addClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
        });

        it('should stop at line elements', () => {
            const lineNode = { nodeName: 'P' };
            mockEditor.format.isLine.mockReturnValue(true);
            mockEditor.selection.getNode.mockReturnValue(lineNode);
            const { dom } = require('../../../../src/helper');

            textStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });

        it('should stop at component elements', () => {
            const componentNode = { nodeName: 'DIV', className: 'se-component' };
            mockEditor.component.is.mockReturnValue(true);
            mockEditor.selection.getNode.mockReturnValue(componentNode);
            const { dom } = require('../../../../src/helper');

            textStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });

        it('should traverse up parent nodes', () => {
            const childNode = {
                nodeName: 'SPAN',
                parentNode: {
                    nodeName: 'CODE',
                    className: '__se__t-code',
                    parentNode: { nodeName: 'P', parentNode: null }
                }
            };

            mockEditor.selection.getNode.mockReturnValue(childNode);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockImplementation((node, className) =>
                node.nodeName === 'CODE' && className === '__se__t-code'
            );

            textStyle.on();

            expect(dom.utils.addClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
        });

        it('should handle empty style list gracefully', () => {
            textStyle.styleList = [];

            expect(() => {
                textStyle.on();
            }).not.toThrow();
        });

        it('should handle null selection node', () => {
            mockEditor.selection.getNode.mockReturnValue(null);

            expect(() => {
                textStyle.on();
            }).not.toThrow();
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                firstElementChild: {
                    style: { cssText: 'color: red; font-weight: bold;' },
                    classList: ['__se__t-custom', 'highlight'],
                    cloneNode: jest.fn().mockReturnValue({
                        tagName: 'SPAN',
                        nodeName: 'SPAN'
                    }),
                    nodeName: 'SPAN'
                }
            };
        });

        it('should apply text style when not active', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            textStyle.action(mockTarget);

            expect(mockTarget.firstElementChild.cloneNode).toHaveBeenCalledWith(false);
            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    stylesToModify: ['color', '.__se__t-custom', '.highlight'],
                    nodesToRemove: null,
                    strictRemove: true
                }
            );
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should remove text style when active', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(true);

            textStyle.action(mockTarget);

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                null,
                {
                    stylesToModify: ['color', '.__se__t-custom', '.highlight'],
                    nodesToRemove: ['SPAN'],
                    strictRemove: true
                }
            );
        });

        it('should handle element with no classes', () => {
            mockTarget.firstElementChild.classList = [];
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            textStyle.action(mockTarget);

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    stylesToModify: ['color'],
                    nodesToRemove: null,
                    strictRemove: true
                }
            );
        });

        it('should handle element with no inline styles', () => {
            mockTarget.firstElementChild.style.cssText = '';
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            textStyle.action(mockTarget);

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    stylesToModify: ['.__se__t-custom', '.highlight'],
                    nodesToRemove: null,
                    strictRemove: true
                }
            );
        });

        it('should handle complex cssText patterns', () => {
            mockTarget.firstElementChild.style.cssText = 'font-family: Arial, sans-serif; line-height: 1.5; margin: 0;';
            mockTarget.firstElementChild.classList = [];
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            textStyle.action(mockTarget);

            expect(mockEditor.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    stylesToModify: ['font-family'],
                    nodesToRemove: null,
                    strictRemove: true
                }
            );
        });

        it('should handle empty firstElementChild gracefully', () => {
            mockTarget.firstElementChild = null;

            expect(() => {
                textStyle.action(mockTarget);
            }).toThrow();
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with custom items', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('data-command="code"');
            expect(createCallArgs[2]).toContain('data-command="span"');
            expect(createCallArgs[2]).toContain('Custom Code');
            expect(createCallArgs[2]).toContain('Custom Shadow');
        });

        it('should include default text styles when no items provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultTextStyle = new TextStyle(mockEditor, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="code"');
            expect(createCallArgs[2]).toContain('data-command="span"');
            expect(createCallArgs[2]).toContain('Code');
            expect(createCallArgs[2]).toContain('Shadow');
        });

        it('should handle string items from default list', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const stringTextStyle = new TextStyle(mockEditor, {
                items: ['code', 'shadow']
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="code"');
            expect(createCallArgs[2]).toContain('data-command="span"');
            expect(createCallArgs[2]).toContain('__se__t-code');
            expect(createCallArgs[2]).toContain('__se__t-shadow');
        });

        it('should skip invalid string items', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const invalidTextStyle = new TextStyle(mockEditor, {
                items: ['code', 'invalid-style', 'shadow']
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="code"');
            expect(createCallArgs[2]).toContain('data-command="span"');
            expect(createCallArgs[2]).not.toContain('invalid-style');
        });

        it('should handle items with multiple classes', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const multiClassTextStyle = new TextStyle(mockEditor, {
                items: [
                    { name: 'Multi Class', class: '__se__t-multi __se__t-class', tag: 'span' }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-value=".__se__t-multi,.__se__t-class"');
        });

        it('should default to span tag when none provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultTagTextStyle = new TextStyle(mockEditor, {
                items: [
                    { name: 'No Tag', class: '__se__t-no-tag' }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-format'
            );

            expect(createCallArgs[2]).toContain('data-command="span"');
            expect(createCallArgs[2]).toContain('<span class="__se__t-no-tag">');
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', () => {
            const mockTarget = {
                firstElementChild: {
                    style: { cssText: '' },
                    classList: [],
                    cloneNode: jest.fn().mockReturnValue({}),
                    nodeName: 'SPAN'
                }
            };

            expect(() => {
                textStyle.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.inline.apply).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            expect(() => {
                textStyle.on();
            }).not.toThrow();

            expect(mockEditor.selection.getNode).toHaveBeenCalled();
        });

        it('should work with component detection', () => {
            const mockComponent = { nodeName: 'DIV', className: 'se-component' };
            mockEditor.component.is.mockReturnValue(true);
            mockEditor.selection.getNode.mockReturnValue(mockComponent);

            expect(() => {
                textStyle.on();
            }).not.toThrow();

            expect(mockEditor.component.is).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            mockEditor.format = undefined;

            expect(() => {
                new TextStyle(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing style list gracefully', () => {
            textStyle.styleList = [];

            expect(() => {
                textStyle.on();
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                textStyle.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new TextStyle(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle empty items array', () => {
            expect(() => {
                new TextStyle(mockEditor, { items: [] });
            }).not.toThrow();
        });

        it('should handle items with missing properties', () => {
            const incompleteItems = [
                { name: 'Test' }, // Missing class - causes error
                { class: '__se__t-test' } // Missing name
            ];

            // Items missing required class property will cause an error during HTML creation
            expect(() => {
                new TextStyle(mockEditor, { items: incompleteItems });
            }).toThrow();
        });

        it('should handle null selection gracefully', () => {
            mockEditor.selection.getNode.mockReturnValue(null);
            textStyle.styleList = [{
                getAttribute: jest.fn().mockReturnValue('')
            }];

            expect(() => {
                textStyle.on();
            }).not.toThrow();
        });
    });
});
