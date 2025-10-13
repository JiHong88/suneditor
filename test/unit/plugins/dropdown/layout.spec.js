/**
 * @fileoverview Unit tests for plugins/dropdown/layout.js
 */

import Layout from '../../../../src/plugins/dropdown/layout.js';

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
                    getAttribute: jest.fn(),
                    setAttribute: jest.fn(),
                    querySelectorAll: jest.fn().mockReturnValue([
                        { className: 'se-layout-item', getAttribute: jest.fn().mockReturnValue('layout1') },
                        { className: 'se-layout-item', getAttribute: jest.fn().mockReturnValue('layout2') },
                        { className: 'se-layout-item', getAttribute: jest.fn().mockReturnValue('layout3') }
                    ])
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
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - Layout', () => {
    let mockEditor;
    let layout;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                layout: 'Layout'
            },
            html: {
                set: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            frameContext: new Map([
                ['wysiwygFrame', {
                    innerHTML: '<p>Test content</p>',
                    style: {}
                }]
            ]),
            triggerEvent: jest.fn()
        };

        const pluginOptions = {
            items: [
                { name: 'Layout 1', html: '<div class="layout-1"><p>Layout 1 content</p></div>' },
                { name: 'Layout 2', html: '<div class="layout-2"><p>Layout 2 content</p></div>' },
                { name: 'Layout 3', html: '<div class="layout-3"><p>Layout 3 content</p></div>' }
            ]
        };

        layout = new Layout(mockEditor, pluginOptions);
    });


    describe('Constructor', () => {

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(Layout, expect.any(Object));
        });

        it('should create layout items with correct structure', () => {
            expect(layout.items).toBeDefined();
            expect(layout.items).toHaveLength(3);
            expect(layout.items[0]).toEqual({ name: 'Layout 1', html: '<div class="layout-1"><p>Layout 1 content</p></div>' });
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn().mockReturnValue('1')
            };
        });

        it('should set HTML content from selected layout item', () => {
            layout.action(mockTarget);

            expect(mockTarget.getAttribute).toHaveBeenCalledWith('data-value');
            expect(mockEditor.html.set).toHaveBeenCalledWith('<div class="layout-2"><p>Layout 2 content</p></div>');
            expect(layout.selectedIndex).toBe(1);
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle first layout item (index 0)', () => {
            mockTarget.getAttribute.mockReturnValue('0');

            layout.action(mockTarget);

            expect(mockEditor.html.set).toHaveBeenCalledWith('<div class="layout-1"><p>Layout 1 content</p></div>');
            expect(layout.selectedIndex).toBe(0);
        });

        it('should handle last layout item (index 2)', () => {
            mockTarget.getAttribute.mockReturnValue('2');

            layout.action(mockTarget);

            expect(mockEditor.html.set).toHaveBeenCalledWith('<div class="layout-3"><p>Layout 3 content</p></div>');
            expect(layout.selectedIndex).toBe(2);
        });

        it('should throw error when layout item has no html property', () => {
            layout.items[1] = { name: 'Layout 2' }; // missing html property
            mockTarget.getAttribute.mockReturnValue('1');

            expect(() => {
                layout.action(mockTarget);
            }).toThrow('[SUNEDITOR.layout.fail] cause : "layouts[i].html not found"');

            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle invalid index gracefully', () => {
            mockTarget.getAttribute.mockReturnValue('99');

            expect(() => {
                layout.action(mockTarget);
            }).toThrow();
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu structure with layout items', () => {
            const { dom } = require('../../../../src/helper');

            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-list-layer' },
                expect.stringContaining('se-dropdown se-list-inner')
            );
        });

        it('should warn when no layout items provided', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            new Layout(mockEditor, { items: [] });

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.layout.warn] To use the "layout" plugin, please define the "layouts" option.');

            consoleSpy.mockRestore();
        });
    });

    describe('Integration', () => {
        it('should work with editor html module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('0')
            };

            expect(() => {
                layout.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.html.set).toHaveBeenCalledWith('<div class="layout-1"><p>Layout 1 content</p></div>');
        });

        it('should handle different layout templates', () => {
            const mockTargets = [
                { getAttribute: jest.fn().mockReturnValue('0') },
                { getAttribute: jest.fn().mockReturnValue('1') },
                { getAttribute: jest.fn().mockReturnValue('2') }
            ];

            mockTargets.forEach((target, index) => {
                layout.action(target);
                expect(layout.selectedIndex).toBe(index);
                expect(mockEditor.html.set).toHaveBeenCalledWith(layout.items[index].html);
            });
        });
    });

    describe('Error handling', () => {
        it('should handle missing editor html module', () => {
            mockEditor.html = undefined;

            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('0')
            };

            expect(() => {
                layout.action(mockTarget);
            }).not.toThrow();
        });

        it('should handle missing items array', () => {
            layout.items = undefined;

            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('0')
            };

            expect(() => {
                layout.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing editor dependencies gracefully', () => {
            const incompleteEditor = {
                lang: { layout: 'Layout' }
            };

            expect(() => {
                new Layout(incompleteEditor, { items: [] });
            }).toThrow();
        });
    });
});