/**
 * @fileoverview Unit tests for plugins/command/list_bulleted.js
 */

import List_bulleted from '../../../../src/plugins/command/list_bulleted.js';

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
                        { style: { listStyleType: 'disc' }, parentElement: { className: '' } },
                        { style: { listStyleType: 'circle' }, parentElement: { className: '' } },
                        { style: { listStyleType: 'square' }, parentElement: { className: '' } }
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
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Command - List_bulleted', () => {
    let mockEditor;
    let listBulleted;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                bulletedList: 'Bulleted List'
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
            focus: jest.fn(),
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        listBulleted = new List_bulleted(mockEditor);
    });

    describe('Static properties', () => {
        it('should have correct static properties', () => {
            expect(List_bulleted.key).toBe('list_bulleted');
            expect(List_bulleted.type).toBe('command');
            expect(List_bulleted.className).toBe('se-icon-flip-rtl');
        });
    });

    describe('Constructor', () => {
        it('should create List_bulleted instance with required properties', () => {
            expect(listBulleted).toBeInstanceOf(List_bulleted);
            expect(listBulleted.title).toBe('Bulleted List');
            expect(listBulleted.icon).toBe('list_bulleted');
            expect(listBulleted.afterItem).toBeDefined();
            expect(listBulleted.listItems).toBeDefined();
        });

        it('should create afterItem button with correct attributes', () => {
            const afterItem = listBulleted.afterItem;

            expect(afterItem.tagName).toBe('BUTTON');
            expect(afterItem.className).toContain('se-btn');
            expect(afterItem.className).toContain('se-tooltip');
            expect(afterItem.className).toContain('se-sub-arrow-btn');
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(
                { key: 'list_bulleted', type: 'dropdown' },
                expect.any(Object)
            );
        });

        it('should create list items from dropdown menu', () => {
            expect(listBulleted.listItems).toHaveLength(3);
        });
    });

    describe('active method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = { className: '' };
        });

        it('should return true and add active class for UL list cell', () => {
            const mockElement = {
                parentElement: { nodeName: 'UL' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(true);

            const result = listBulleted.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should return true for UL list cell (case insensitive)', () => {
            const mockElement = {
                parentElement: { nodeName: 'ul' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(true);

            const result = listBulleted.active(mockElement, mockTarget);

            expect(result).toBe(true);
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should return false for OL list cell', () => {
            const mockElement = {
                parentElement: { nodeName: 'OL' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(true);

            const result = listBulleted.active(mockElement, mockTarget);

            expect(result).toBe(false);
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should return false for non-list cell', () => {
            const mockElement = {
                parentElement: { nodeName: 'UL' }
            };

            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(false);

            const result = listBulleted.active(mockElement, mockTarget);

            expect(result).toBe(false);
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should handle null element', () => {
            const { dom } = require('../../../../src/helper');
            dom.check.isListCell.mockReturnValue(false);

            const result = listBulleted.active(null, mockTarget);

            expect(result).toBe(false);
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });
    });

    describe('on method', () => {
        beforeEach(() => {
            // Mock listItems
            listBulleted.listItems = [
                { style: { listStyleType: 'disc' }, parentElement: { className: '' } },
                { style: { listStyleType: 'circle' }, parentElement: { className: '' } },
                { style: { listStyleType: 'square' }, parentElement: { className: '' } }
            ];
        });

        it('should activate current list type', () => {
            const mockBlock = {
                style: { listStyleType: 'circle' }
            };
            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            listBulleted.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(
                listBulleted.listItems[1].parentElement,
                'active'
            );
            expect(dom.utils.removeClass).toHaveBeenCalledTimes(2); // other items
        });

        it('should use default type when no style', () => {
            const mockBlock = { style: {} };
            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            listBulleted.on();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(
                listBulleted.listItems[0].parentElement,
                'active'
            );
        });

        it('should handle null block', () => {
            mockEditor.format.getBlock.mockReturnValue(null);

            expect(() => {
                listBulleted.on();
            }).not.toThrow();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledTimes(3); // all items deactivated
        });
    });

    describe('action method', () => {
        it('should change list style type for existing list', () => {
            const mockBlock = { style: { listStyleType: 'disc' } };
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({
                    style: { listStyleType: 'circle' }
                })
            };

            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(true);

            listBulleted.action(mockTarget);

            expect(mockBlock.style.listStyleType).toBe('circle');
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should call submit for non-list elements', () => {
            const mockBlock = { tagName: 'P' };
            const mockTarget = {
                querySelector: jest.fn().mockReturnValue({
                    style: { listStyleType: 'disc' }
                })
            };

            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            const { dom } = require('../../../../src/helper');
            dom.check.isList.mockReturnValue(false);

            jest.spyOn(listBulleted, 'submit').mockImplementation();

            listBulleted.action(mockTarget);

            expect(listBulleted.submit).toHaveBeenCalledWith('disc');
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle missing target', () => {
            expect(() => {
                listBulleted.action(null);
            }).not.toThrow();

            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });
    });

    describe('shortcut method', () => {
        it('should handle text container shortcut', () => {
            const mockStartContainer = {
                substringData: jest.fn(),
                textContent: '* hello world'
            };
            const mockRange = { startContainer: mockStartContainer };
            const mockInfo = { key: '* ' };

            const { dom } = require('../../../../src/helper');
            dom.check.isText.mockReturnValue(true);

            jest.spyOn(listBulleted, 'submit').mockImplementation();

            listBulleted.shortcut({ range: mockRange, info: mockInfo });

            expect(mockStartContainer.substringData).toHaveBeenCalledWith(2, 12); // key.length, textContent.length - key.length
            expect(listBulleted.submit).toHaveBeenCalled();
        });

        it('should handle non-text container', () => {
            const mockRange = { startContainer: { nodeName: 'DIV' } };
            const mockInfo = { key: '* ' };

            const { dom } = require('../../../../src/helper');
            dom.check.isText.mockReturnValue(false);

            jest.spyOn(listBulleted, 'submit').mockImplementation();

            listBulleted.shortcut({ range: mockRange, info: mockInfo });

            expect(listBulleted.submit).toHaveBeenCalled();
        });
    });

    describe('submit method', () => {
        it('should apply list with type and update selection', () => {
            const mockRange = { sc: 'start', so: 0, ec: 'end', eo: 1 };
            mockEditor.listFormat.apply.mockReturnValue(mockRange);

            listBulleted.submit('circle');

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ul:circle', null, false);
            expect(mockEditor.selection.setRange).toHaveBeenCalledWith('start', 0, 'end', 1);
            expect(mockEditor.focus).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should apply list without type', () => {
            const mockRange = { sc: 'start', so: 0, ec: 'end', eo: 1 };
            mockEditor.listFormat.apply.mockReturnValue(mockRange);

            listBulleted.submit();

            expect(mockEditor.listFormat.apply).toHaveBeenCalledWith('ul:', null, false);
        });

        it('should handle null range from apply', () => {
            mockEditor.listFormat.apply.mockReturnValue(null);

            listBulleted.submit('disc');

            expect(mockEditor.selection.setRange).not.toHaveBeenCalled();
            expect(mockEditor.focus).toHaveBeenCalled();
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');

            // Check that createElement was called for dropdown creation
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer' },
                expect.stringContaining('se-list-inner')
            );
        });
    });

    describe('Integration', () => {
        it('should work with all editor modules', () => {
            const mockNode = document.createElement('li');
            const mockBlock = { style: { listStyleType: 'disc' } };

            mockEditor.selection.getNode.mockReturnValue(mockNode);
            mockEditor.format.getBlock.mockReturnValue(mockBlock);

            expect(() => {
                listBulleted.on();
            }).not.toThrow();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules', () => {
            mockEditor.format = undefined;

            expect(() => {
                listBulleted.action({});
            }).toThrow();
        });

        it('should handle malformed dropdown elements', () => {
            listBulleted.listItems = [];

            expect(() => {
                listBulleted.on();
            }).not.toThrow();
        });
    });
});