/**
 * @fileoverview Unit tests for editorInjector/_classes.js
 */

import ClassInjector from '../../../src/editorInjector/_classes.js';

describe('EditorInjector - _classes.js', () => {
    let mockEditor;
    let mockContext;

    beforeEach(() => {
        // Create mock editor with all class properties
        mockEditor = {
            toolbar: {
                type: 'toolbar',
                buttons: ['bold', 'italic', 'underline'],
                create: jest.fn()
            },
            subToolbar: {
                type: 'subToolbar',
                isActive: true,
                show: jest.fn(),
                hide: jest.fn()
            },
            char: {
                type: 'char',
                count: 100,
                maxLength: 1000
            },
            component: {
                type: 'component',
                active: null,
                create: jest.fn()
            },
            format: {
                type: 'format',
                applyFormat: jest.fn(),
                removeFormat: jest.fn()
            },
            html: {
                type: 'html',
                get: jest.fn(),
                set: jest.fn()
            },
            menu: {
                type: 'menu',
                open: jest.fn(),
                close: jest.fn()
            },
            nodeTransform: {
                type: 'nodeTransform',
                transform: jest.fn()
            },
            offset: {
                type: 'offset',
                getNodeOffset: jest.fn(),
                setOffset: jest.fn()
            },
            selection: {
                type: 'selection',
                getRange: jest.fn(),
                setRange: jest.fn()
            },
            shortcuts: {
                type: 'shortcuts',
                register: jest.fn(),
                trigger: jest.fn()
            },
            ui: {
                type: 'ui',
                showDialog: jest.fn(),
                hideDialog: jest.fn()
            },
            viewer: {
                type: 'viewer',
                isPreview: false,
                show: jest.fn()
            }
        };

        mockContext = {};
    });

    describe('ClassInjector function', () => {
        it('should be a function', () => {
            expect(typeof ClassInjector).toBe('function');
        });

        it('should be callable with call method', () => {
            expect(() => {
                ClassInjector.call(mockContext, mockEditor);
            }).not.toThrow();
        });
    });

    describe('Class property injection', () => {
        beforeEach(() => {
            ClassInjector.call(mockContext, mockEditor);
        });

        it('should inject toolbar correctly', () => {
            expect(mockContext.toolbar).toBe(mockEditor.toolbar);
            expect(mockContext.toolbar.type).toBe('toolbar');
            expect(mockContext.toolbar.buttons).toEqual(['bold', 'italic', 'underline']);
            expect(typeof mockContext.toolbar.create).toBe('function');
        });

        it('should inject subToolbar correctly when it exists', () => {
            expect(mockContext.subToolbar).toBe(mockEditor.subToolbar);
            expect(mockContext.subToolbar.type).toBe('subToolbar');
            expect(mockContext.subToolbar.isActive).toBe(true);
        });

        it('should inject char correctly', () => {
            expect(mockContext.char).toBe(mockEditor.char);
            expect(mockContext.char.type).toBe('char');
            expect(mockContext.char.count).toBe(100);
        });

        it('should inject component correctly', () => {
            expect(mockContext.component).toBe(mockEditor.component);
            expect(mockContext.component.type).toBe('component');
            expect(typeof mockContext.component.create).toBe('function');
        });

        it('should inject format correctly', () => {
            expect(mockContext.format).toBe(mockEditor.format);
            expect(mockContext.format.type).toBe('format');
            expect(typeof mockContext.format.applyFormat).toBe('function');
        });

        it('should inject html correctly', () => {
            expect(mockContext.html).toBe(mockEditor.html);
            expect(mockContext.html.type).toBe('html');
            expect(typeof mockContext.html.get).toBe('function');
        });

        it('should inject menu correctly', () => {
            expect(mockContext.menu).toBe(mockEditor.menu);
            expect(mockContext.menu.type).toBe('menu');
            expect(typeof mockContext.menu.open).toBe('function');
        });

        it('should inject nodeTransform correctly', () => {
            expect(mockContext.nodeTransform).toBe(mockEditor.nodeTransform);
            expect(mockContext.nodeTransform.type).toBe('nodeTransform');
            expect(typeof mockContext.nodeTransform.transform).toBe('function');
        });

        it('should inject offset correctly', () => {
            expect(mockContext.offset).toBe(mockEditor.offset);
            expect(mockContext.offset.type).toBe('offset');
            expect(typeof mockContext.offset.getNodeOffset).toBe('function');
        });

        it('should inject selection correctly', () => {
            expect(mockContext.selection).toBe(mockEditor.selection);
            expect(mockContext.selection.type).toBe('selection');
            expect(typeof mockContext.selection.getRange).toBe('function');
        });

        it('should inject shortcuts correctly', () => {
            expect(mockContext.shortcuts).toBe(mockEditor.shortcuts);
            expect(mockContext.shortcuts.type).toBe('shortcuts');
            expect(typeof mockContext.shortcuts.register).toBe('function');
        });

        it('should inject ui correctly', () => {
            expect(mockContext.ui).toBe(mockEditor.ui);
            expect(mockContext.ui.type).toBe('ui');
            expect(typeof mockContext.ui.showDialog).toBe('function');
        });

        it('should inject viewer correctly', () => {
            expect(mockContext.viewer).toBe(mockEditor.viewer);
            expect(mockContext.viewer.type).toBe('viewer');
            expect(mockContext.viewer.isPreview).toBe(false);
        });
    });

    describe('SubToolbar handling', () => {
        it('should set subToolbar to null when editor.subToolbar is undefined', () => {
            const editorWithoutSubToolbar = { ...mockEditor };
            delete editorWithoutSubToolbar.subToolbar;

            ClassInjector.call(mockContext, editorWithoutSubToolbar);

            expect(mockContext.subToolbar).toBeNull();
        });

        it('should set subToolbar to null when editor.subToolbar is null', () => {
            const editorWithNullSubToolbar = {
                ...mockEditor,
                subToolbar: null
            };

            ClassInjector.call(mockContext, editorWithNullSubToolbar);

            expect(mockContext.subToolbar).toBeNull();
        });

        it('should set subToolbar to null when editor.subToolbar is false', () => {
            const editorWithFalseSubToolbar = {
                ...mockEditor,
                subToolbar: false
            };

            ClassInjector.call(mockContext, editorWithFalseSubToolbar);

            expect(mockContext.subToolbar).toBeNull();
        });

        it('should assign subToolbar when it exists and is truthy', () => {
            ClassInjector.call(mockContext, mockEditor);

            expect(mockContext.subToolbar).toBe(mockEditor.subToolbar);
            expect(mockContext.subToolbar).not.toBeNull();
        });

        it('should handle empty object as subToolbar', () => {
            const editorWithEmptySubToolbar = {
                ...mockEditor,
                subToolbar: {}
            };

            ClassInjector.call(mockContext, editorWithEmptySubToolbar);

            expect(mockContext.subToolbar).toBe(editorWithEmptySubToolbar.subToolbar);
            expect(mockContext.subToolbar).toEqual({});
        });
    });

    describe('Property reference integrity', () => {
        it('should maintain object references, not create copies', () => {
            ClassInjector.call(mockContext, mockEditor);

            // Modify original object
            mockEditor.toolbar.newButton = 'link';

            // Should be reflected in injected reference
            expect(mockContext.toolbar.newButton).toBe('link');
        });

        it('should handle function calls on injected properties', () => {
            ClassInjector.call(mockContext, mockEditor);

            mockContext.toolbar.create('testButton');
            mockContext.ui.showDialog('testDialog');

            expect(mockEditor.toolbar.create).toHaveBeenCalledWith('testButton');
            expect(mockEditor.ui.showDialog).toHaveBeenCalledWith('testDialog');
        });

        it('should work with null/undefined class properties', () => {
            const editorWithNulls = {
                ...mockEditor,
                toolbar: null,
                char: undefined,
                format: null
            };

            expect(() => {
                ClassInjector.call(mockContext, editorWithNulls);
            }).not.toThrow();

            expect(mockContext.toolbar).toBeNull();
            expect(mockContext.char).toBeUndefined();
            expect(mockContext.format).toBeNull();
        });
    });

    describe('All class properties injection', () => {
        it('should inject all expected class properties', () => {
            ClassInjector.call(mockContext, mockEditor);

            const expectedClasses = [
                'toolbar',
                'subToolbar',
                'char',
                'component',
                'format',
                'html',
                'menu',
                'nodeTransform',
                'offset',
                'selection',
                'shortcuts',
                'ui',
                'viewer'
            ];

            expectedClasses.forEach(className => {
                expect(mockContext).toHaveProperty(className);
            });
        });

        it('should maintain correct types for all properties', () => {
            ClassInjector.call(mockContext, mockEditor);

            expect(typeof mockContext.toolbar).toBe('object');
            expect(typeof mockContext.char).toBe('object');
            expect(typeof mockContext.component).toBe('object');
            expect(typeof mockContext.format).toBe('object');
            expect(typeof mockContext.html).toBe('object');
            expect(typeof mockContext.menu).toBe('object');
            expect(typeof mockContext.nodeTransform).toBe('object');
            expect(typeof mockContext.offset).toBe('object');
            expect(typeof mockContext.selection).toBe('object');
            expect(typeof mockContext.shortcuts).toBe('object');
            expect(typeof mockContext.ui).toBe('object');
            expect(typeof mockContext.viewer).toBe('object');
        });
    });

    describe('JSDoc and annotations', () => {
        it('should have proper JSDoc comments', () => {
            const sourceString = ClassInjector.toString();

            expect(sourceString).toContain('@description');
            expect(sourceString).toContain('@type');
            expect(sourceString).toContain('__se__EditorCore');
        });

        it('should document all class properties', () => {
            const sourceString = ClassInjector.toString();

            const documentedClasses = [
                'Toolbar',
                'Char',
                'Component',
                'Format',
                'HTML',
                'Menu',
                'Selection',
                'UI',
                'Viewer'
            ];

            documentedClasses.forEach(className => {
                expect(sourceString).toContain(className);
            });
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle completely empty editor object', () => {
            const emptyEditor = {};

            expect(() => {
                ClassInjector.call(mockContext, emptyEditor);
            }).not.toThrow();

            expect(mockContext.toolbar).toBeUndefined();
            expect(mockContext.subToolbar).toBeNull();
        });

        it('should handle editor with minimal properties', () => {
            const minimalEditor = {
                toolbar: { basic: true },
                char: { count: 0 }
            };

            ClassInjector.call(mockContext, minimalEditor);

            expect(mockContext.toolbar).toBe(minimalEditor.toolbar);
            expect(mockContext.char).toBe(minimalEditor.char);
            expect(mockContext.subToolbar).toBeNull();
        });
    });
});