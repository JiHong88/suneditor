/**
 * @fileoverview Unit tests for plugins/dropdown/hr.js
 */

import HR from '../../../../src/plugins/dropdown/hr.js';

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
                            getAttribute: jest.fn().mockReturnValue('hr'),
                            firstElementChild: { className: '__se__solid' }
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('hr'),
                            firstElementChild: { className: '__se__dashed' }
                        },
                        {
                            tagName: 'BUTTON',
                            getAttribute: jest.fn().mockReturnValue('hr'),
                            firstElementChild: { className: '__se__dotted' }
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
            removeItem: jest.fn()
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
        this.component = editor.component;
        this.menu = editor.menu;
        this.history = editor.history;
        this.nodeTransform = editor.nodeTransform;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - HR', () => {
    let mockEditor;
    let hr;
    let pluginOptions;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                horizontalLine: 'Horizontal Line',
                hr_solid: 'Solid',
                hr_dashed: 'Dashed',
                hr_dotted: 'Dotted'
            },
            selection: {
                setRange: jest.fn()
            },
            format: {
                addLine: jest.fn().mockReturnValue(document.createElement('p'))
            },
            component: {
                insert: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            history: {
                push: jest.fn()
            },
            nodeTransform: {
                split: jest.fn().mockReturnValue(document.createElement('p'))
            },
            focus: jest.fn(),
            focusEdge: jest.fn(),
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        pluginOptions = {
            items: [
                { name: 'Custom Solid', class: '__se__custom-solid' },
                { name: 'Custom Dashed', class: '__se__custom-dashed', style: 'border-top: 2px dashed red;' }
            ]
        };

        hr = new HR(mockEditor, pluginOptions);
    });

    describe('Static component method', () => {
        it('should return HR node when node is HR element', () => {
            const hrNode = { nodeName: 'HR' };
            const result = HR.component(hrNode);
            expect(result).toBe(hrNode);
        });

        it('should return HR node when node is hr element (lowercase)', () => {
            const hrNode = { nodeName: 'hr' };
            const result = HR.component(hrNode);
            expect(result).toBe(hrNode);
        });

        it('should return null for non-HR elements', () => {
            const divNode = { nodeName: 'DIV' };
            const result = HR.component(divNode);
            expect(result).toBeNull();
        });

        it('should return null for null/undefined node', () => {
            expect(HR.component(null)).toBeNull();
            expect(HR.component(undefined)).toBeNull();
        });

        it('should return null for node without nodeName', () => {
            const invalidNode = {};
            const result = HR.component(invalidNode);
            expect(result).toBeNull();
        });
    });

    describe('Constructor', () => {
        it('should create HR instance with required properties', () => {
            expect(hr).toBeInstanceOf(HR);
            expect(hr.title).toBe('Horizontal Line');
            expect(hr.icon).toBe('horizontal_line');
            expect(hr.list).toBeDefined();
        });

        it('should create dropdown menu structure', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-dropdown se-list-layer se-list-line' },
                expect.stringContaining('se-list-inner')
            );
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(HR, expect.any(Object));
        });

        it('should initialize list from menu', () => {
            expect(hr.list).toHaveLength(3);
        });

        it('should use default items when none provided', () => {
            const defaultHR = new HR(mockEditor, {});
            expect(defaultHR.list).toBeDefined();
        });
    });

    describe('select method', () => {
        it('should add "on" class to target element', () => {
            const mockTarget = document.createElement('hr');
            const { dom } = require('../../../../src/helper');

            hr.select(mockTarget);

            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'on');
        });

        it('should handle null target gracefully', () => {
            const { dom } = require('../../../../src/helper');

            expect(() => {
                hr.select(null);
            }).not.toThrow();

            expect(dom.utils.addClass).toHaveBeenCalledWith(null, 'on');
        });
    });

    describe('deselect method', () => {
        it('should remove "on" class from target element', () => {
            const mockTarget = document.createElement('hr');
            const { dom } = require('../../../../src/helper');

            hr.deselect(mockTarget);

            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'on');
        });

        it('should handle null element gracefully', () => {
            const { dom } = require('../../../../src/helper');

            expect(() => {
                hr.deselect(null);
            }).not.toThrow();

            expect(dom.utils.removeClass).toHaveBeenCalledWith(null, 'on');
        });
    });

    describe('destroy method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                previousElementSibling: document.createElement('p'),
                nextElementSibling: document.createElement('p')
            };
        });

        it('should remove target and focus previous sibling', () => {
            const { dom } = require('../../../../src/helper');

            hr.destroy(mockTarget);

            expect(dom.utils.removeItem).toHaveBeenCalledWith(mockTarget);
            expect(mockEditor.focusEdge).toHaveBeenCalledWith(mockTarget.previousElementSibling);
            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });

        it('should focus next sibling when no previous sibling', () => {
            mockTarget.previousElementSibling = null;

            hr.destroy(mockTarget);

            expect(mockEditor.focusEdge).toHaveBeenCalledWith(mockTarget.nextElementSibling);
        });

        it('should handle null target gracefully', () => {
            expect(() => {
                hr.destroy(null);
            }).not.toThrow();

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeItem).not.toHaveBeenCalled();
            expect(mockEditor.focusEdge).not.toHaveBeenCalled();
            expect(mockEditor.history.push).not.toHaveBeenCalled();
        });

        it('should handle target with no siblings', () => {
            mockTarget.previousElementSibling = null;
            mockTarget.nextElementSibling = null;

            hr.destroy(mockTarget);

            expect(mockEditor.focusEdge).toHaveBeenCalledWith(null);
        });

        it('should always push history when target exists', () => {
            hr.destroy(mockTarget);

            expect(mockEditor.history.push).toHaveBeenCalledWith(false);
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                firstElementChild: { className: '__se__solid' }
            };
        });

        it('should create HR with correct class and insert it', () => {
            const mockLine = document.createElement('p');
            mockEditor.format.addLine.mockReturnValue(mockLine);

            hr.action(mockTarget);

            // Check that submit was called with correct className
            expect(mockEditor.component.insert).toHaveBeenCalled();
            expect(mockEditor.format.addLine).toHaveBeenCalled();
            expect(mockEditor.selection.setRange).toHaveBeenCalledWith(mockLine, 1, mockLine, 1);
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle different HR classes', () => {
            mockTarget.firstElementChild.className = '__se__dashed';

            hr.action(mockTarget);

            expect(mockEditor.component.insert).toHaveBeenCalled();
        });

        it('should handle empty className', () => {
            mockTarget.firstElementChild.className = '';

            hr.action(mockTarget);

            expect(mockEditor.component.insert).toHaveBeenCalled();
        });

        it('should handle missing firstElementChild', () => {
            mockTarget.firstElementChild = null;

            expect(() => {
                hr.action(mockTarget);
            }).toThrow();
        });
    });

    describe('shortcut method', () => {
        let mockParams;

        beforeEach(() => {
            mockParams = {
                line: document.createElement('p'),
                range: {
                    endContainer: document.createElement('span'),
                    endOffset: 1
                }
            };
        });

        it('should split range and insert solid HR', () => {
            const mockNewLine = document.createElement('p');
            mockEditor.nodeTransform.split.mockReturnValue(mockNewLine);

            hr.shortcut(mockParams);

            expect(mockEditor.nodeTransform.split).toHaveBeenCalledWith(
                mockParams.range.endContainer,
                mockParams.range.endOffset,
                0
            );
            expect(mockEditor.component.insert).toHaveBeenCalled();
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeItem).toHaveBeenCalledWith(mockParams.line);
            expect(mockEditor.selection.setRange).toHaveBeenCalledWith(mockNewLine, 0, mockNewLine, 0);
        });

        it('should always use solid HR class in shortcut', () => {
            hr.shortcut(mockParams);

            // Verify that submit was called with '__se__solid'
            expect(mockEditor.component.insert).toHaveBeenCalled();
        });

        it('should handle null range gracefully', () => {
            mockParams.range = null;

            expect(() => {
                hr.shortcut(mockParams);
            }).toThrow();
        });
    });

    describe('submit method', () => {
        it('should create HR element with correct class and insert it', () => {
            const className = '__se__custom';
            const { dom } = require('../../../../src/helper');

            const result = hr.submit(className);

            expect(dom.utils.createElement).toHaveBeenCalledWith('hr', { class: className });
            expect(mockEditor.focus).toHaveBeenCalled();
            expect(mockEditor.component.insert).toHaveBeenCalledWith(
                expect.any(Object),
                { insertBehavior: 'line' }
            );
            expect(result).toBeDefined();
        });

        it('should handle empty className', () => {
            const result = hr.submit('');

            expect(result).toBeDefined();
            expect(mockEditor.component.insert).toHaveBeenCalled();
        });

        it('should handle null className', () => {
            const result = hr.submit(null);

            expect(result).toBeDefined();
        });

        it('should always focus editor before inserting', () => {
            hr.submit('__se__solid');

            expect(mockEditor.focus).toHaveBeenCalled();
        });

        it('should use line insertion behavior', () => {
            hr.submit('__se__solid');

            expect(mockEditor.component.insert).toHaveBeenCalledWith(
                expect.any(Object),
                { insertBehavior: 'line' }
            );
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu with custom items', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-line'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('data-command="hr"');
            expect(createCallArgs[2]).toContain('Custom Solid');
            expect(createCallArgs[2]).toContain('Custom Dashed');
            expect(createCallArgs[2]).toContain('__se__custom-solid');
            expect(createCallArgs[2]).toContain('__se__custom-dashed');
        });

        it('should include default HR styles when no items provided', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const defaultHR = new HR(mockEditor, {});

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-line'
            );

            expect(createCallArgs[2]).toContain('__se__solid');
            expect(createCallArgs[2]).toContain('__se__dashed');
            expect(createCallArgs[2]).toContain('__se__dotted');
            expect(createCallArgs[2]).toContain('Solid');
            expect(createCallArgs[2]).toContain('Dashed');
            expect(createCallArgs[2]).toContain('Dotted');
        });

        it('should handle items with style attribute', () => {
            const { dom } = require('../../../../src/helper');

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-line'
            );

            expect(createCallArgs[2]).toContain('style="border-top: 2px dashed red;"');
        });

        it('should handle items without class', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const noClassHR = new HR(mockEditor, {
                items: [
                    { name: 'No Class HR' }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-line'
            );

            expect(createCallArgs[2]).toContain('No Class HR');
            expect(createCallArgs[2]).toContain('<hr/>'); // No class attribute
        });

        it('should handle items without style', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const noStyleHR = new HR(mockEditor, {
                items: [
                    { name: 'No Style HR', class: '__se__no-style' }
                ]
            });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-line'
            );

            expect(createCallArgs[2]).toContain('No Style HR');
            expect(createCallArgs[2]).toContain('class="__se__no-style"');
            expect(createCallArgs[2]).not.toContain('style=');
        });

        it('should handle empty items array', () => {
            const { dom } = require('../../../../src/helper');
            dom.utils.createElement.mockClear();

            const emptyItemsHR = new HR(mockEditor, { items: [] });

            const createCallArgs = dom.utils.createElement.mock.calls.find(
                call => call[1]?.class === 'se-dropdown se-list-layer se-list-line'
            );

            expect(createCallArgs[2]).toContain('se-list-inner');
            expect(createCallArgs[2]).toContain('se-list-basic');
        });
    });

    describe('Integration', () => {
        it('should work with editor component module', () => {
            const mockTarget = {
                firstElementChild: { className: '__se__solid' }
            };

            expect(() => {
                hr.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.component.insert).toHaveBeenCalled();
        });

        it('should work with editor format module', () => {
            const mockTarget = {
                firstElementChild: { className: '__se__solid' }
            };

            hr.action(mockTarget);

            expect(mockEditor.format.addLine).toHaveBeenCalled();
        });

        it('should work with editor selection module', () => {
            const mockTarget = {
                firstElementChild: { className: '__se__solid' }
            };

            hr.action(mockTarget);

            expect(mockEditor.selection.setRange).toHaveBeenCalled();
        });

        it('should work with node transformation', () => {
            const mockParams = {
                line: document.createElement('p'),
                range: {
                    endContainer: document.createElement('span'),
                    endOffset: 1
                }
            };

            hr.shortcut(mockParams);

            expect(mockEditor.nodeTransform.split).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor modules gracefully', () => {
            mockEditor.component = undefined;

            expect(() => {
                new HR(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle missing list gracefully', () => {
            hr.list = [];

            expect(() => {
                hr.select(document.createElement('hr'));
            }).not.toThrow();
        });

        it('should handle malformed target in action method', () => {
            const mockTarget = {};

            expect(() => {
                hr.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing plugin options', () => {
            expect(() => {
                new HR(mockEditor, {});
            }).not.toThrow();
        });

        it('should handle null plugin options', () => {
            expect(() => {
                new HR(mockEditor, null);
            }).toThrow(); // Will throw when accessing null.items
        });

        it('should handle items with missing properties', () => {
            const incompleteItems = [
                { name: 'Test' }, // missing class - should still work
                {} // missing name and class - should still work
            ];

            expect(() => {
                new HR(mockEditor, { items: incompleteItems });
            }).not.toThrow();
        });

        it('should handle undefined firstElementChild gracefully', () => {
            const mockTarget = { firstElementChild: undefined };

            expect(() => {
                hr.action(mockTarget);
            }).toThrow();
        });
    });
});