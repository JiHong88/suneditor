/**
 * @fileoverview Unit tests for editorInjector/index.js
 */

import EditorInjector from '../../../src/editorInjector/index.js';
import CoreInjector from '../../../src/editorInjector/_core.js';
import ClassInjector from '../../../src/editorInjector/_classes.js';

describe('EditorInjector - index.js', () => {
    let mockEditor;

    beforeEach(() => {
        // Create a comprehensive mock editor with all required properties
        mockEditor = {
            // Core properties
            eventManager: { mock: 'eventManager' },
            instanceCheck: { mock: 'instanceCheck' },
            history: { mock: 'history' },
            events: { mock: 'events' },
            triggerEvent: jest.fn(),
            carrierWrapper: document.createElement('div'),
            plugins: { mock: 'plugins' },
            status: { mock: 'status' },
            frameContext: { mock: 'frameContext' },
            frameOptions: { mock: 'frameOptions' },
            context: { mock: 'context' },
            options: { mock: 'options' },
            icons: { mock: 'icons' },
            lang: { mock: 'lang' },
            frameRoots: new Map(),
            _w: window,
            _d: document,

            // Class properties
            toolbar: { mock: 'toolbar' },
            subToolbar: { mock: 'subToolbar' },
            char: { mock: 'char' },
            component: { mock: 'component' },
            format: { mock: 'format' },
            html: { mock: 'html' },
            menu: { mock: 'menu' },
            nodeTransform: { mock: 'nodeTransform' },
            offset: { mock: 'offset' },
            selection: { mock: 'selection' },
            shortcuts: { mock: 'shortcuts' },
            uiManager: { mock: 'ui' },
            viewer: { mock: 'viewer' }
        };
    });

    describe('EditorInjector constructor', () => {
        it('should call CoreInjector and ClassInjector', () => {
            // Spy on the injector functions
            const coreInjectorSpy = jest.spyOn(CoreInjector, 'call');
            const classInjectorSpy = jest.spyOn(ClassInjector, 'call');

            const injector = new EditorInjector(mockEditor);

            expect(coreInjectorSpy).toHaveBeenCalledWith(injector, mockEditor);
            expect(classInjectorSpy).toHaveBeenCalledWith(injector, mockEditor);

            coreInjectorSpy.mockRestore();
            classInjectorSpy.mockRestore();
        });

        it('should handle editor without subToolbar', () => {
            const editorWithoutSubToolbar = { ...mockEditor };
            delete editorWithoutSubToolbar.subToolbar;

            const injector = new EditorInjector(editorWithoutSubToolbar);
            expect(injector.subToolbar).toBeNull();
        });
    });

    describe('EditorInjector integration', () => {
        it('should work with minimal editor object', () => {
            const minimalEditor = {
                frameContext: { mock: 'frameContext' },
                frameOptions: { mock: 'frameOptions' },
                eventManager: null,
                instanceCheck: null,
                history: null,
                events: null,
                triggerEvent: null,
                carrierWrapper: null,
                plugins: null,
                status: null,
                context: null,
                options: null,
                icons: null,
                lang: null,
                frameRoots: null,
                _w: null,
                _d: null,
                toolbar: null,
                char: null,
                component: null,
                format: null,
                html: null,
                menu: null,
                nodeTransform: null,
                offset: null,
                selection: null,
                shortcuts: null,
                ui: null,
                viewer: null
            };

            const injector = new EditorInjector(minimalEditor);
            expect(injector.frameContext).toBe(minimalEditor.frameContext);
            expect(injector.frameOptions).toBe(minimalEditor.frameOptions);
        });

        it('should handle edge cases gracefully', () => {
            const edgeEditor = {
                ...mockEditor,
                frameContext: null,
                frameOptions: undefined
            };

            expect(() => {
                new EditorInjector(edgeEditor);
            }).not.toThrow();
        });
    });
});