/**
 * @fileoverview Unit tests for plugins/dropdown/template.js
 */

import Template from '../../../../src/plugins/dropdown/template.js';

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
            insertHTML: jest.fn()
        }
    }
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.html = editor.html;
        this.menu = editor.menu;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Dropdown - Template', () => {
    let mockEditor;
    let template;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                template: 'Template'
            },
            html: {
                insert: jest.fn()
            },
            menu: {
                initDropdownTarget: jest.fn(),
                dropdownOff: jest.fn()
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        const pluginOptions = {
            items: [
                { name: 'Template 1', html: '<div class="template-1"><h2>Template 1</h2><p>Content 1</p></div>' },
                { name: 'Template 2', html: '<div class="template-2"><h2>Template 2</h2><p>Content 2</p></div>' },
                { name: 'Template 3', html: '<div class="template-3"><h2>Template 3</h2><p>Content 3</p></div>' }
            ]
        };

        template = new Template(mockEditor, pluginOptions);
    });

    describe('Static properties', () => {
        it('should have correct static properties', () => {
            expect(Template.key).toBe('template');
            expect(Template.type).toBe('dropdown');
            expect(Template.className).toBe('');
        });
    });

    describe('Constructor', () => {
        it('should create Template instance with required properties', () => {
            expect(template).toBeInstanceOf(Template);
            expect(template.title).toBe('Template');
            expect(template.icon).toBe('template');
            expect(template.selectedIndex).toBe(-1);
            expect(template.items).toHaveLength(3);
        });

        it('should initialize dropdown menu', () => {
            expect(mockEditor.menu.initDropdownTarget).toHaveBeenCalledWith(Template, expect.any(Object));
        });

        it('should create template items with correct structure', () => {
            expect(template.items).toBeDefined();
            expect(template.items).toHaveLength(3);
            expect(template.items[0]).toEqual({ name: 'Template 1', html: '<div class="template-1"><h2>Template 1</h2><p>Content 1</p></div>' });
        });

        it('should initialize selectedIndex to -1', () => {
            expect(template.selectedIndex).toBe(-1);
        });
    });

    describe('action method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = {
                getAttribute: jest.fn().mockReturnValue('1')
            };
        });

        it('should insert HTML content from selected template item', () => {
            template.action(mockTarget);

            expect(mockTarget.getAttribute).toHaveBeenCalledWith('data-value');
            expect(mockEditor.html.insert).toHaveBeenCalledWith(
                '<div class="template-2"><h2>Template 2</h2><p>Content 2</p></div>',
                { selectInserted: false, skipCharCount: false, skipCleaning: false }
            );
            expect(template.selectedIndex).toBe(1);
            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle first template item (index 0)', () => {
            mockTarget.getAttribute.mockReturnValue('0');

            template.action(mockTarget);

            expect(mockEditor.html.insert).toHaveBeenCalledWith(
                '<div class="template-1"><h2>Template 1</h2><p>Content 1</p></div>',
                { selectInserted: false, skipCharCount: false, skipCleaning: false }
            );
            expect(template.selectedIndex).toBe(0);
        });

        it('should handle last template item (index 2)', () => {
            mockTarget.getAttribute.mockReturnValue('2');

            template.action(mockTarget);

            expect(mockEditor.html.insert).toHaveBeenCalledWith(
                '<div class="template-3"><h2>Template 3</h2><p>Content 3</p></div>',
                { selectInserted: false, skipCharCount: false, skipCleaning: false }
            );
            expect(template.selectedIndex).toBe(2);
        });

        it('should throw error when template item has no html property', () => {
            template.items[1] = { name: 'Template 2' }; // missing html property
            mockTarget.getAttribute.mockReturnValue('1');

            expect(() => {
                template.action(mockTarget);
            }).toThrow('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');

            expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
        });

        it('should handle invalid index gracefully', () => {
            mockTarget.getAttribute.mockReturnValue('99');

            expect(() => {
                template.action(mockTarget);
            }).toThrow();
        });
    });

    describe('CreateHTML function', () => {
        it('should create dropdown menu structure with template items', () => {
            const { dom } = require('../../../../src/helper');

            expect(dom.utils.createElement).toHaveBeenCalledWith(
                'DIV',
                { class: 'se-list-layer' },
                expect.stringContaining('se-dropdown se-list-inner')
            );
        });

        it('should warn when no template items provided', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            new Template(mockEditor, { items: [] });

            expect(consoleSpy).toHaveBeenCalledWith('[SUNEDITOR.plugins.template.warn] To use the "template" plugin, please define the "templates" option.');

            consoleSpy.mockRestore();
        });
    });

    describe('Template selection tracking', () => {
        it('should track selected template index correctly', () => {
            const mockTargets = [
                { getAttribute: jest.fn().mockReturnValue('0') },
                { getAttribute: jest.fn().mockReturnValue('1') },
                { getAttribute: jest.fn().mockReturnValue('2') }
            ];

            // Test selecting different templates
            template.action(mockTargets[0]);
            expect(template.selectedIndex).toBe(0);

            template.action(mockTargets[2]);
            expect(template.selectedIndex).toBe(2);

            template.action(mockTargets[1]);
            expect(template.selectedIndex).toBe(1);
        });

        it('should maintain selectedIndex state between instances', () => {
            const mockTarget = { getAttribute: jest.fn().mockReturnValue('0') };

            template.action(mockTarget);
            expect(template.selectedIndex).toBe(0);

            // Create new instance to verify state independence
            const newTemplate = new Template(mockEditor, {
                items: [{ name: 'Test', html: '<div>Test</div>' }]
            });
            expect(newTemplate.selectedIndex).toBe(-1);
        });
    });

    describe('Integration', () => {
        it('should work with editor html module', () => {
            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('0')
            };

            expect(() => {
                template.action(mockTarget);
            }).not.toThrow();

            expect(mockEditor.html.insert).toHaveBeenCalledWith(
                '<div class="template-1"><h2>Template 1</h2><p>Content 1</p></div>',
                { selectInserted: false, skipCharCount: false, skipCleaning: false }
            );
        });

        it('should handle different template HTML structures', () => {
            const mockTargets = [
                { getAttribute: jest.fn().mockReturnValue('0') },
                { getAttribute: jest.fn().mockReturnValue('1') },
                { getAttribute: jest.fn().mockReturnValue('2') }
            ];

            mockTargets.forEach((target, index) => {
                template.action(target);
                expect(template.selectedIndex).toBe(index);
                expect(mockEditor.html.insert).toHaveBeenCalledWith(
                    template.items[index].html,
                    { selectInserted: false, skipCharCount: false, skipCleaning: false }
                );
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
                template.action(mockTarget);
            }).not.toThrow();
        });

        it('should handle missing items array', () => {
            template.items = undefined;

            const mockTarget = {
                getAttribute: jest.fn().mockReturnValue('0')
            };

            expect(() => {
                template.action(mockTarget);
            }).toThrow();
        });

        it('should handle missing editor dependencies gracefully', () => {
            const incompleteEditor = {
                lang: { template: 'Template' }
            };

            expect(() => {
                new Template(incompleteEditor, { items: [] });
            }).toThrow();
        });
    });
});