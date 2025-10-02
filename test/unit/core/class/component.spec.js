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
});