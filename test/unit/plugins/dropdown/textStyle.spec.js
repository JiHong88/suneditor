/**
 * @fileoverview Unit tests for plugins/dropdown/textStyle.js
 */

import TextStyle from '../../../../src/plugins/dropdown/textStyle.js';
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

describe('Plugins - Dropdown - TextStyle', () => {
    let kernel;
    let textStyle;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
        kernel.$.menu.initDropdownTarget = jest.fn().mockImplementation(() => {
            const { dom } = require('../../../../src/helper');
            return dom.utils.createElement('DIV', {}, '');
        });
        kernel.$.lang.textStyle = 'Text Style';
        kernel.$.lang.menu_code = 'Code';
        kernel.$.lang.menu_underline = 'Underline';
        kernel.$.lang.menu_strikethrough = 'Strikethrough';

        pluginOptions = {
            items: [
                { name: 'Custom Code', class: '__se__t-custom-code', tag: 'code' },
                { name: 'Custom Shadow', class: '__se__t-custom-shadow', tag: 'span' }
            ]
        };

        textStyle = new TextStyle(kernel, pluginOptions);
    });


    describe('Constructor', () => {

        it('should initialize dropdown menu with items and options', () => {
            expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(TextStyle, expect.any(Array), expect.any(Object));
        });

        it('should initialize style list from menu', () => {
            expect(textStyle.styleList).toHaveLength(2);
        });

        it('should use default styles when none provided', () => {
            const defaultTextStyle = new TextStyle(kernel, {});
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


        it('should deactivate all buttons when no matching style', () => {
            const plainNode = { nodeName: 'SPAN', parentNode: null };
            kernel.$.selection.getNode.mockReturnValue(plainNode);
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(false);

            textStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });



        it('should stop at line elements', () => {
            const lineNode = { nodeName: 'P' };
            kernel.$.format.isLine.mockReturnValue(true);
            kernel.$.selection.getNode.mockReturnValue(lineNode);
            const { dom } = require('../../../../src/helper');

            textStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });

        it('should stop at component elements', () => {
            const componentNode = { nodeName: 'DIV', className: 'se-component' };
            kernel.component.is.mockReturnValue(true);
            kernel.$.selection.getNode.mockReturnValue(componentNode);
            const { dom } = require('../../../../src/helper');

            textStyle.on();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(textStyle.styleList[1], 'active');
        });


        it('should handle empty style list gracefully', () => {
            textStyle.styleList = [];

            expect(() => {
                textStyle.on();
            }).not.toThrow();
        });

        it('should handle null selection node', () => {
            kernel.$.selection.getNode.mockReturnValue(null);

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
            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    stylesToModify: ['color', '.__se__t-custom', '.highlight'],
                    nodesToRemove: null,
                    strictRemove: true
                }
            );
            expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should remove text style when active', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.hasClass.mockReturnValue(true);

            textStyle.action(mockTarget);

            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
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

            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
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

            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
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

            expect(kernel.$.inline.apply).toHaveBeenCalledWith(
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

    describe('CreateItems function', () => {
        it('should pass correct items to initDropdownTarget', () => {
            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items).toBeInstanceOf(Array);
            expect(items.length).toBe(2);

            const commands = items.map(item => item.command);
            expect(commands).toContain('code');
            expect(commands).toContain('span');

            const titles = items.map(item => item.title);
            expect(titles).toContain('Custom Code');
            expect(titles).toContain('Custom Shadow');
        });

        it('should handle string items from default list', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const stringTextStyle = new TextStyle(kernel, {
                items: ['code', 'shadow']
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];
            const commands = items.map(item => item.command);

            expect(commands).toContain('code');
            expect(commands).toContain('span');

            const htmls = items.map(item => item.innerHTML);
            expect(htmls.some(h => h.includes('__se__t-code'))).toBe(true);
            expect(htmls.some(h => h.includes('__se__t-shadow'))).toBe(true);
        });

        it('should skip invalid string items', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const invalidTextStyle = new TextStyle(kernel, {
                items: ['code', 'invalid-style', 'shadow']
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];
            const commands = items.map(item => item.command);

            expect(commands).toContain('code');
            expect(commands).toContain('span');
            expect(items.every(item => !item.innerHTML.includes('invalid-style'))).toBe(true);
        });

        it('should handle items with multiple classes', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const multiClassTextStyle = new TextStyle(kernel, {
                items: [
                    { name: 'Multi Class', class: '__se__t-multi __se__t-class', tag: 'span' }
                ]
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items).toHaveLength(1);
            expect(items[0].value).toContain('.__se__t-multi');
            expect(items[0].value).toContain('.__se__t-class');
        });

        it('should default to span tag when none provided', () => {
            kernel.$.menu.initDropdownTarget.mockClear();

            const defaultTagTextStyle = new TextStyle(kernel, {
                items: [
                    { name: 'No Tag', class: '__se__t-no-tag' }
                ]
            });

            const items = kernel.$.menu.initDropdownTarget.mock.calls[0][1];

            expect(items).toHaveLength(1);
            expect(items[0].command).toBe('span');
            expect(items[0].innerHTML).toContain('__se__t-no-tag');
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

            expect(kernel.$.inline.apply).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            expect(() => {
                textStyle.on();
            }).not.toThrow();

            expect(kernel.$.selection.getNode).toHaveBeenCalled();
        });

    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            kernel.$.format = undefined;

            expect(() => {
                new TextStyle(kernel, {});
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
                new TextStyle(kernel, {});
            }).not.toThrow();
        });

        it('should handle empty items array', () => {
            expect(() => {
                new TextStyle(kernel, { items: [] });
            }).not.toThrow();
        });

        it('should handle items with missing properties', () => {
            const incompleteItems = [
                { name: 'Test' }, // Missing class - causes error
                { class: '__se__t-test' } // Missing name
            ];

            // Items missing required class property will cause an error during HTML creation
            expect(() => {
                new TextStyle(kernel, { items: incompleteItems });
            }).toThrow();
        });

        it('should handle null selection gracefully', () => {
            kernel.$.selection.getNode.mockReturnValue(null);
            textStyle.styleList = [{
                getAttribute: jest.fn().mockReturnValue('')
            }];

            expect(() => {
                textStyle.on();
            }).not.toThrow();
        });
    });
});
