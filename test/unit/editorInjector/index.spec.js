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
            ui: { mock: 'ui' },
            viewer: { mock: 'viewer' }
        };
    });

    describe('EditorInjector constructor', () => {
        it('should be a function', () => {
            expect(typeof EditorInjector).toBe('function');
        });

        it('should create an instance when called with new', () => {
            const injector = new EditorInjector(mockEditor);
            expect(injector).toBeInstanceOf(EditorInjector);
        });

        it('should inject all core properties from CoreInjector', () => {
            const injector = new EditorInjector(mockEditor);

            // Core properties
            expect(injector.editor).toBe(mockEditor);
            expect(injector.eventManager).toBe(mockEditor.eventManager);
            expect(injector.instanceCheck).toBe(mockEditor.instanceCheck);
            expect(injector.history).toBe(mockEditor.history);
            expect(injector.events).toBe(mockEditor.events);
            expect(injector.triggerEvent).toBe(mockEditor.triggerEvent);
            expect(injector.carrierWrapper).toBe(mockEditor.carrierWrapper);
            expect(injector.plugins).toBe(mockEditor.plugins);
            expect(injector.status).toBe(mockEditor.status);
            expect(injector.frameContext).toBe(mockEditor.frameContext);
            expect(injector.frameOptions).toBe(mockEditor.frameOptions);
            expect(injector.context).toBe(mockEditor.context);
            expect(injector.options).toBe(mockEditor.options);
            expect(injector.icons).toBe(mockEditor.icons);
            expect(injector.lang).toBe(mockEditor.lang);
            expect(injector.frameRoots).toBe(mockEditor.frameRoots);
            expect(injector._w).toBe(mockEditor._w);
            expect(injector._d).toBe(mockEditor._d);
        });

        it('should inject all class properties from ClassInjector', () => {
            const injector = new EditorInjector(mockEditor);

            // Class properties
            expect(injector.toolbar).toBe(mockEditor.toolbar);
            expect(injector.subToolbar).toBe(mockEditor.subToolbar);
            expect(injector.char).toBe(mockEditor.char);
            expect(injector.component).toBe(mockEditor.component);
            expect(injector.format).toBe(mockEditor.format);
            expect(injector.html).toBe(mockEditor.html);
            expect(injector.menu).toBe(mockEditor.menu);
            expect(injector.nodeTransform).toBe(mockEditor.nodeTransform);
            expect(injector.offset).toBe(mockEditor.offset);
            expect(injector.selection).toBe(mockEditor.selection);
            expect(injector.shortcuts).toBe(mockEditor.shortcuts);
            expect(injector.ui).toBe(mockEditor.ui);
            expect(injector.viewer).toBe(mockEditor.viewer);
        });

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

        it('should maintain property types correctly', () => {
            const injector = new EditorInjector(mockEditor);

            // Check that functions remain functions
            expect(typeof injector.triggerEvent).toBe('function');

            // Check that objects remain objects
            expect(typeof injector.frameRoots).toBe('object');
            expect(injector.frameRoots).toBeInstanceOf(Map);

            // Check DOM elements
            expect(injector.carrierWrapper).toBeInstanceOf(HTMLElement);
            expect(injector._w).toBe(window);
            expect(injector._d).toBe(document);
        });
    });

    describe('EditorInjector property declarations', () => {
        it('should have proper JSDoc type annotations in source', () => {
            const sourceString = EditorInjector.toString();

            // Check for key type annotations
            expect(sourceString).toContain('@type');
            expect(sourceString).toContain('__se__EditorCore');
        });

        it('should declare all expected properties', () => {
            const injector = new EditorInjector(mockEditor);

            const expectedProperties = [
                // Core properties
                'editor', 'eventManager', 'instanceCheck', 'history', 'events',
                'triggerEvent', 'carrierWrapper', 'plugins', 'status', 'frameContext',
                'frameOptions', 'context', 'options', 'icons', 'lang', 'frameRoots', '_w', '_d',

                // Class properties
                'toolbar', 'subToolbar', 'char', 'component', 'format', 'html',
                'menu', 'nodeTransform', 'offset', 'selection', 'shortcuts', 'ui', 'viewer'
            ];

            expectedProperties.forEach(prop => {
                expect(injector).toHaveProperty(prop);
            });
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