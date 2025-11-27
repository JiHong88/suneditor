/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Component', () => {
    let editor;
    let component;

    beforeEach(async () => {
        editor = createTestEditor();
        await waitForEditorReady(editor);
        component = editor.component;
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    describe('Constructor', () => {
        it('should initialize Component with default properties', () => {
            expect(component.info).toBeNull();
            expect(component.isSelected).toBe(false);
            expect(component.currentTarget).toBeNull();
            expect(component.currentPlugin).toBeNull();
        });

        it('should have required methods', () => {
            expect(typeof component.get).toBe('function');
            expect(typeof component.select).toBe('function');
            expect(typeof component.insert).toBe('function');
            expect(typeof component.deselect).toBe('function');
            expect(typeof component.is).toBe('function');
        });
    });

    describe('get method', () => {
        it('should return null for non-component elements', () => {
            const div = document.createElement('div');
            const result = component.get(div);
            expect(result).toBeNull();
        });

        it('should handle null input', () => {
            const result = component.get(null);
            expect(result).toBeNull();
        });

        it('should handle undefined input', () => {
            const result = component.get(undefined);
            expect(result).toBeNull();
        });
    });

    describe('select method', () => {
        it('should handle basic component selection', () => {
            const element = document.createElement('figure');
            element.className = 'se-component';

            expect(() => {
                component.select(element, 'image');
            }).not.toThrow();
        });

        it('should handle null element', () => {
            expect(() => {
                component.select(null, 'image');
            }).not.toThrow();
        });
    });

    describe('deselect method', () => {
        it('should have deselect method available', () => {
            expect(typeof component.deselect).toBe('function');
        });
    });

    describe('hoverSelect method', () => {
        it('should have hoverSelect method available', () => {
            expect(typeof component.hoverSelect).toBe('function');
        });

        it('should handle null element', () => {
            expect(() => {
                component.hoverSelect(null);
            }).not.toThrow();
        });

        it('should handle non-component element', () => {
            const div = document.createElement('div');
            expect(() => {
                component.hoverSelect(div);
            }).not.toThrow();
        });

        it('should handle figure element', () => {
            const figure = document.createElement('figure');
            figure.className = 'se-component';
            expect(() => {
                component.hoverSelect(figure);
            }).not.toThrow();
        });
    });

    describe('is method', () => {
        it('should check if element is component', () => {
            const element = document.createElement('figure');
            element.className = 'se-component';

            const result = component.is(element);
            expect(typeof result).toBe('boolean');
        });

        it('should handle null element', () => {
            const result = component.is(null);
            expect(result).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty wysiwyg content', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '';

            expect(() => {
                component.select(null, 'test');
            }).not.toThrow();
        });

        it('should handle multiple component operations', () => {
            expect(() => {
                component.select(null, 'test');
                component.get(null);
                component.is(null);
            }).not.toThrow();
        });
    });

    describe('State management', () => {
        it('should maintain consistent state during operations', () => {
            // Initial state
            expect(component.isSelected).toBe(false);
            expect(component.currentTarget).toBeNull();

            // State should be maintained
            expect(component.isSelected).toBe(false);
            expect(component.currentTarget).toBeNull();
        });

        it('should handle info property correctly', () => {
            expect(component.info).toBeNull();

            // Info should remain null for basic operations
            expect(component.info).toBeNull();
        });

        it('should handle isInline and isBasic methods', () => {
            const element = document.createElement('span');

            expect(() => {
                component.isInline(element);
                component.isBasic(element);
            }).not.toThrow();
        });
    });

    describe('insert method', () => {
        it('should have insert method available', () => {
            expect(typeof component.insert).toBe('function');
        });

        it('should return null in readonly mode', () => {
            editor.frameContext.set('isReadOnly', true);
            const element = document.createElement('div');
            const result = component.insert(element);
            expect(result).toBeNull();
            editor.frameContext.set('isReadOnly', false);
        });

        it('should handle insert with skipHistory option', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';
            editor.selection.setRange(wysiwyg.firstChild, 0, wysiwyg.firstChild, 0);

            const hr = document.createElement('hr');
            expect(() => {
                component.insert(hr, { skipHistory: true });
            }).not.toThrow();
        });

        it('should handle insert with scrollTo false', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';
            editor.selection.setRange(wysiwyg.firstChild, 0, wysiwyg.firstChild, 0);

            const hr = document.createElement('hr');
            expect(() => {
                component.insert(hr, { scrollTo: false });
            }).not.toThrow();
        });
    });

    describe('applyInsertBehavior method', () => {
        it('should have applyInsertBehavior method available', () => {
            expect(typeof component.applyInsertBehavior).toBe('function');
        });

        it('should handle none behavior', () => {
            const div = document.createElement('div');
            expect(() => {
                component.applyInsertBehavior(div, null, 'none');
            }).not.toThrow();
        });
    });

    describe('copy method', () => {
        it('should have copy method available', () => {
            expect(typeof component.copy).toBe('function');
        });
    });

    describe('deselect method', () => {
        it('should have deselect method', () => {
            expect(typeof component.deselect).toBe('function');
        });
    });

    describe('__globalEvents', () => {
        it('should have __globalEvents object', () => {
            expect(component.__globalEvents).toBeDefined();
            expect(typeof component.__globalEvents.copy).toBe('function');
            expect(typeof component.__globalEvents.cut).toBe('function');
            expect(typeof component.__globalEvents.keydown).toBe('function');
            expect(typeof component.__globalEvents.mousedown).toBe('function');
        });
    });

    describe('currentPluginName property', () => {
        it('should have currentPluginName property', () => {
            expect(component.currentPluginName).toBe('');
        });
    });

    describe('is method detailed', () => {
        it('should return true for se-component class', () => {
            const element = document.createElement('div');
            element.className = 'se-component';
            expect(component.is(element)).toBe(true);
        });

        it('should return false for regular div', () => {
            const element = document.createElement('div');
            expect(component.is(element)).toBe(false);
        });

        it('should handle HR element', () => {
            const hr = document.createElement('hr');
            const result = component.is(hr);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('isInline method', () => {
        it('should have isInline method', () => {
            expect(typeof component.isInline).toBe('function');
        });

        it('should return boolean for element', () => {
            const element = document.createElement('span');
            const result = component.isInline(element);
            expect(typeof result).toBe('boolean');
        });

        it('should handle se-inline-component class', () => {
            const element = document.createElement('span');
            element.className = 'se-inline-component';
            const result = component.isInline(element);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('isBasic method', () => {
        it('should have isBasic method', () => {
            expect(typeof component.isBasic).toBe('function');
        });

        it('should return boolean for element', () => {
            const element = document.createElement('div');
            const result = component.isBasic(element);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('private methods existence', () => {
        it('should have __addGlobalEvent method', () => {
            expect(typeof component.__addGlobalEvent).toBe('function');
        });

        it('should have __removeGlobalEvent method', () => {
            expect(typeof component.__removeGlobalEvent).toBe('function');
        });

        it('should have __deselect method', () => {
            expect(typeof component.__deselect).toBe('function');
        });

        it('should have _removeDragEvent method', () => {
            expect(typeof component._removeDragEvent).toBe('function');
        });
    });
});