/**
 * @fileoverview Unit tests for plugins/command/list_numbered.js
 */

import List_numbered from '../../../../src/plugins/command/list_numbered.js';

// Mock helper
jest.mock('../../../../src/helper', () => ({
    dom: {
        utils: {
            createElement: jest.fn().mockImplementation((tag, attrs, content) => {
                const element = {
                    tagName: tag.toUpperCase(),
                    className: attrs?.class || '',
                    innerHTML: content || '',
                    getAttribute: jest.fn(),
                    setAttribute: jest.fn(),
                    querySelectorAll: jest.fn().mockReturnValue([
                        { style: { listStyleType: 'decimal' }, parentElement: { className: '' } },
                        { style: { listStyleType: 'lower-alpha' }, parentElement: { className: '' } },
                        { style: { listStyleType: 'upper-alpha' }, parentElement: { className: '' } },
                        { style: { listStyleType: 'lower-roman' }, parentElement: { className: '' } },
                        { style: { listStyleType: 'upper-roman' }, parentElement: { className: '' } }
                    ]),
                    style: {}
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
        },
        check: {
            isListCell: jest.fn(),
            isList: jest.fn(),
            isText: jest.fn()
        }
    }
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.icons = editor.icons;
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

describe('Plugins - Command - List_numbered', () => {
    let mockEditor;
    let listNumbered;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                numberedList: 'Numbered List'
            },
            icons: {
                arrow_down: '▼'
            },
            selection: {
                getNode: jest.fn(),
                setRange: jest.fn()
            },
            format: {
                getBlock: jest.fn(),
            },
            listFormat: {
                apply: jest.fn()
            },
            history: {
                push: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            focusManager: { focus: jest.fn(), blur: jest.fn(), focusEdge: jest.fn(), nativeFocus: jest.fn() },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        listNumbered = new List_numbered(mockEditor);
    });


    describe('Constructor', () => {

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(
                { key: 'list_numbered', type: 'dropdown' },
                expect.any(Object)
            );
        });

        it('should create list items from dropdown menu', () => {
            expect(listNumbered.listItems).toHaveLength(5);
        });
    });

    describe('active method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = { className: '' };
        });

        it('should return true and add active class for OL list cell', () => {
            const mockElement = {
                parentElement: { nodeName: 'OL' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(true);

            const result = listNumbered.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should return true for OL list cell (case insensitive)', () => {
            const mockElement = {
                parentElement: { nodeName: 'ol' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(true);

            const result = listNumbered.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should return false for UL list cell', () => {
            const mockElement = {
                parentElement: { nodeName: 'UL' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(true);

            const result = listNumbered.active(mockElement, mockTarget);

            expect(result).toBe(false);
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should return false for non-list cell', () => {
            const mockElement = {
                parentElement: { nodeName: 'OL' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(false);

            const result = listNumbered.active(mockElement, mockTarget);

            expect(result).toBe(false);
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });
    });

    describe('on method', () => {
        beforeEach(() => {
            listNumbered.listItems = [
                { style: { listStyleType: 'decimal' }, parentElement: { className: '' } },
                { style: { listStyleType: 'lower-alpha' }, parentElement: { className: '' } },
                { style: { listStyleType: 'upper-alpha' }, parentElement: { className: '' } }
            ];
        });

        it('should activate current list type', () => {
            const mockBlock = {
                style: { listStyleType: 'lower-alpha' }
            };
            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            listNumbered.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(
                listNumbered.listItems[1].parentElement,
                'active'
            );
        });

        it('should use default type when no style', () => {
            const mockBlock = { style: {} };
            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            listNumbered.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(
                listNumbered.listItems[0].parentElement,
                'active'
            );
        });
    });

    describe('action method', () => {
        it('should change list style type for existing list', () => {
            const mockBlock = { style: { listStyleType: 'decimal' } };
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({
                    style: { listStyleType: 'upper-roman' }
                })
            };

            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(true);

            listNumbered.action(mockTarget);

            expect(mockBlock.style.listStyleType).toBe('upper-roman');
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should call submit for non-list elements', () => {
            const mockBlock = { tagName: 'P' };
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({
                    style: { listStyleType: 'decimal' }
                })
            };

            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(false);

            jest.spyOn(listNumbered, 'submit').mockImplementation();

            listNumbered.action(mockTarget);

            expect(listNumbered.submit).toHaveBeenCalledWith('decimal');
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });
    });

    describe('shortcut method', () => {
        it('should handle text container shortcut', () => {
            const mockStartContainer = {
                substringData: jest.fn(),
                textContent: '1. hello world'
            };
            const mockRange = { startContainer: mockStartContainer };
            const mockInfo = { key: '1. ' };

            const { dom } = require('../../../../src/helper');
            dom.check.isText.mockReturnValue(true);

            jest.spyOn(listNumbered, 'submit').mockImplementation();

            listNumbered.shortcut({ range: mockRange, info: mockInfo });

            expect(mockStartContainer.substringData).toHaveBeenCalledWith(3, 13);
            expect(listNumbered.submit).toHaveBeenCalled();
        });
    });

    describe('submit method', () => {
        it('should apply numbered list with type', () => {
            const mockRange = { sc: 'start', so: 0, ec: 'end', eo: 1 };
            mockEditor.listFormat.apply.mockReturnValue(mockRange);

            listNumbered.submit('upper-alpha');

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ol:upper-alpha', null, false);
            expect(mockEditor.selection.setRange).toHaveBeenCalledWith('start', 0, 'end', 1);
            expect(mockEditor.focusManager.focus).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should apply numbered list without type', () => {
            const mockRange = { sc: 'start', so: 0, ec: 'end', eo: 1 };
            mockEditor.listFormat.apply.mockReturnValue(mockRange);

            listNumbered.submit();

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ol:', null, false);
        });

        it('should handle null range from apply', () => {
            mockEditor.listFormat.apply.mockReturnValue(null);

            listNumbered.submit('decimal');

            expect(mockEditor.selection.setRange).not.toHaveBeenCalled();
            expect(mockEditor.focusManager.focus).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });
    });

    describe('Integration', () => {
        it('should work with all editor modules', () => {
            const mockNode = document.createElement('li');
            const mockBlock = { style: { listStyleType: 'decimal' } };

            mockEditor.selection.getNode.mockReturnValue(mockNode);
            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            expect(() => {
                listNumbered.on();
            }).not.toThrow();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            mockEditor.format = undefined;

            expect(() => {
                listNumbered.action({});
            }).toThrow();
        });
    });
});