/**
 * @fileoverview Unit tests for plugins/dropdown/list.js
 */

import List from '../../../../src/plugins/dropdown/list.js';

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
                                if (attr === 'data-command') return 'ol';
                                return null;
                            })
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockImplementation((attr) => {
                                if (attr === 'data-command') return 'ul';
                                return null;
                            })
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
            changeElement: jest.fn()
        },
        check: {
            isList: jest.fn()
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
        this.listFormat = editor.listFormat;
        this.history = editor.history;
        this.menu = editor.menu;
        this.frameContext = editor.frameContext;
        this.focusManager = editor.focusManager;
		this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - List', () => {
    let mockEditor;
    let list;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                list: 'List',
                numberedList: 'Numbered List',
                bulletedList: 'Bulleted List'
            },
            icons: {
                list_numbered: '<svg>numbered</svg>',
                list_bulleted: '<svg>bulleted</svg>'
            },
            selection: {
                setRange: jest.fn()
            },
            format: {
            },
            listFormat: {
                apply: jest.fn().mockReturnValue({
                    sc: 'start', so: 0, ec: 'end', eo: 1
                })
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

        list = new List(mockEditor);
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
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(List, expect.any(Object));
        });

        it('should initialize list items from menu', () => {
            expect(list.listItems).toHaveLength(2);
        });

        it('should store icons for bulleted and numbered lists', () => {
            expect(list.icons.bulleted).toBe('<svg>bulleted</svg>');
            expect(list.icons.numbered).toBe('<svg>numbered</svg>');
        });
    });

    describe('active method', () => {
        let mockTarget;
        let mockIcon;

        beforeEach(() => {
            mockIcon = { tagName: 'SVG' };
            mockTarget = {
                firstElementChild: mockIcon,
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };
        });

        it('should return true and set active state for UL list', () => {
            const mockElement = { nodeName: 'UL' };
            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(true);

            const result = list.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-focus', 'ul');
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockIcon, list.icons.bulleted);
        });

        it('should return true and set active state for OL list', () => {
            const mockElement = { nodeName: 'OL' };
            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(true);

            const result = list.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-focus', 'ol');
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockIcon, list.icons.numbered);
        });

        it('should handle case insensitive node names', () => {
            const mockElement = { nodeName: 'ul' };
            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(true);

            const result = list.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(mockTarget.setAttribute).toHaveBeenCalledWith('data-focus', 'ul');
            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockIcon, list.icons.bulleted);
        });

        it('should return false and remove active state for non-list elements', () => {
            const mockElement = { nodeName: 'P' };
            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(false);

            const result = list.active(mockElement, mockTarget);

            expect(result).toBe(false);
            expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
            expect(dom.utils.changeElement).toHaveBeenCalledWith(mockIcon, list.icons.number);
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should handle null element', () => {
            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(false);

            const result = list.active(null, mockTarget);

            expect(result).toBe(false);
            expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
        });

        it('should handle undefined element', () => {
            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(false);

            const result = list.active(undefined, mockTarget);

            expect(result).toBe(false);
            expect(mockTarget.removeAttribute).toHaveBeenCalledWith('data-focus');
        });
    });

    describe('on method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn()
            };
        });

        it('should activate current list type button', () => {
            mockTarget.getAttribute.mockReturnValue('ol');
            const { dom } = require('../../../../src/helper');

            list.on(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(list.listItems[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(list.listItems[1], 'active');
        });

        it('should activate bulleted list button when focus is ul', () => {
            mockTarget.getAttribute.mockReturnValue('ul');
            const { dom } = require('../../../../src/helper');

            list.on(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(list.listItems[0], 'active');
            expect(dom.utils.addClass).toHaveBeenCalledWith(list.listItems[1], 'active');
        });

        it('should deactivate all buttons when no focus', () => {
            mockTarget.getAttribute.mockReturnValue('');
            const { dom } = require('../../../../src/helper');

            list.on(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(list.listItems[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(list.listItems[1], 'active');
        });

        it('should handle null focus attribute', () => {
            mockTarget.getAttribute.mockReturnValue(null);
            const { dom } = require('../../../../src/helper');

            expect(() => {
                list.on(mockTarget);
            }).not.toThrow();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(list.listItems[0], 'active');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(list.listItems[1], 'active');
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn()
            };
        });

        it('should apply numbered list', () => {
            mockTarget.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-command') return 'ol';
                if (attr === 'data-value') return 'decimal';
                return null;
            });

            list.action(mockTarget);

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ol:decimal', null, false);
            expect(mockEditor.selection.setRange).toHaveBeenCalledWith('start', 0, 'end', 1);
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should apply bulleted list', () => {
            mockTarget.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-command') return 'ul';
                if (attr === 'data-value') return 'disc';
                return null;
            });

            list.action(mockTarget);

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ul:disc', null, false);
            expect(mockEditor.selection.setRange).toHaveBeenCalledWith('start', 0, 'end', 1);
        });

        it('should handle empty data-value', () => {
            mockTarget.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-command') return 'ol';
                if (attr === 'data-value') return null;
                return null;
            });

            list.action(mockTarget);

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ol:', null, false);
        });

        it('should handle null range from apply', () => {
            mockTarget.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-command') return 'ul';
                return null;
            });
            mockEditor.listFormat.apply.mockReturnValue(null);

            list.action(mockTarget);

            expect(mockEditor.selection.setRange).not.toHaveBeenCalled();
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should handle missing target attributes', () => {
            mockTarget.getAttribute.mockReturnValue(null);

            expect(() => {
                list.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('null:', null, false);
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with numbered and bulleted list options', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('data-command="ol"');
            expect(createCallArgs[2]).toContain('data-command="ul"');
            expect(createCallArgs[2]).toContain('Numbered List');
            expect(createCallArgs[2]).toContain('Bulleted List');
        });

        it('should include editor icons in the menu', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer'
            );

            expect(createCallArgs[2]).toContain('<svg>numbered</svg>');
            expect(createCallArgs[2]).toContain('<svg>bulleted</svg>');
        });
    });

    describe('Integration', () => {
        it('should work with editor format module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'data-command') return 'ol';
                    return '';
                })
            };

            expect(() => {
                list.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.listFormat.apply).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockImplementation((attr) => {
                    if (attr === 'data-command') return 'ul';
                    return '';
                })
            };

            list.action(mockTarget);

            expect(mockEditor.selection.setRange).toHaveBeenCalled();
        });

        it('should work with list detection', () => {
            const mockElement = { nodeName: 'UL' };
            const mockTarget = {
                firstElementChild: {},
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(true);

            expect(() => {
                list.active(mockElement, mockTarget);
            }).not.toThrow();

            expect(dom.check.isList).toHaveBeenCalledWith(mockElement);
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            mockEditor.format = undefined;

            expect(() => {
                new List(mockEditor);
            }).not.toThrow();
        });

        it('should handle missing list items gracefully', () => {
            list.listItems = [];

            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('ol')
            };

            expect(() => {
                list.on(mockTarget);
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                list.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing icons gracefully', () => {
            const incompleteEditor = {
                ...mockEditor,
                icons: {}
            };

            expect(() => {
                new List(incompleteEditor);
            }).not.toThrow();
        });
    });
});