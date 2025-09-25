/**
 * @fileoverview Unit tests for editorInjector/_core.js
 */

import CoreInjector from '../../../src/editorInjector/_core.js';

describe('EditorInjector - _core.js', () => {
    let mockEditor;
    let mockContext;

    beforeEach(() => {
        // Create mock editor with all core properties
        mockEditor = {
            eventManager: { type: 'eventManager', test: true },
            instanceCheck: { type: 'instanceCheck', test: true },
            history: { type: 'history', test: true },
            events: { type: 'events', test: true },
            triggerEvent: jest.fn().mockName('triggerEvent'),
            carrierWrapper: document.createElement('div'),
            plugins: { type: 'plugins', list: ['plugin1', 'plugin2'] },
            status: {
                isReadOnly: false,
                isDisabled: false,
                isFocused: true
            },
            frameContext: { type: 'frameContext', test: true },
            frameOptions: { type: 'frameOptions', test: true },
            context: { type: 'context', test: true },
            options: {
                mode: 'classic',
                lang: 'en',
                plugins: ['font', 'list']
            },
            icons: {
                bold: '<svg>bold</svg>',
                italic: '<svg>italic</svg>'
            },
            lang: {
                toolbar: { bold: 'Bold', italic: 'Italic' },
                dialogBox: { ok: 'OK', cancel: 'Cancel' }
            },
            frameRoots: new Map([
                ['root1', { element: 'mock1' }],
                ['root2', { element: 'mock2' }]
            ]),
            _w: window,
            _d: document
        };

        mockContext = {};
    });

    describe('CoreInjector function', () => {
        it('should be a function', () => {
            expect(typeof CoreInjector).toBe('function');
        });

        it('should be callable with call method', () => {
            expect(() => {
                CoreInjector.call(mockContext, mockEditor);
            }).not.toThrow();
        });

        it('should inject root editor reference', () => {
            CoreInjector.call(mockContext, mockEditor);

            expect(mockContext.editor).toBe(mockEditor);
            expect(mockContext.editor).toEqual(mockEditor);
        });
    });

    describe('Base property injection', () => {
        beforeEach(() => {
            CoreInjector.call(mockContext, mockEditor);
        });

        it('should inject eventManager correctly', () => {
            expect(mockContext.eventManager).toBe(mockEditor.eventManager);
            expect(mockContext.eventManager.type).toBe('eventManager');
            expect(mockContext.eventManager.test).toBe(true);
        });

        it('should inject instanceCheck correctly', () => {
            expect(mockContext.instanceCheck).toBe(mockEditor.instanceCheck);
            expect(mockContext.instanceCheck.type).toBe('instanceCheck');
        });

        it('should inject history correctly', () => {
            expect(mockContext.history).toBe(mockEditor.history);
            expect(mockContext.history.type).toBe('history');
        });

        it('should inject events correctly', () => {
            expect(mockContext.events).toBe(mockEditor.events);
            expect(mockContext.events.type).toBe('events');
        });

        it('should inject triggerEvent function correctly', () => {
            expect(mockContext.triggerEvent).toBe(mockEditor.triggerEvent);
            expect(typeof mockContext.triggerEvent).toBe('function');
            expect(mockContext.triggerEvent).toHaveBeenCalledTimes(0);
        });

        it('should inject carrierWrapper DOM element correctly', () => {
            expect(mockContext.carrierWrapper).toBe(mockEditor.carrierWrapper);
            expect(mockContext.carrierWrapper).toBeInstanceOf(HTMLElement);
            expect(mockContext.carrierWrapper.tagName).toBe('DIV');
        });
    });

    describe('Environment variables injection', () => {
        beforeEach(() => {
            CoreInjector.call(mockContext, mockEditor);
        });

        it('should inject plugins correctly', () => {
            expect(mockContext.plugins).toBe(mockEditor.plugins);
            expect(mockContext.plugins.type).toBe('plugins');
            expect(mockContext.plugins.list).toEqual(['plugin1', 'plugin2']);
        });

        it('should inject status correctly', () => {
            expect(mockContext.status).toBe(mockEditor.status);
            expect(mockContext.status.isReadOnly).toBe(false);
            expect(mockContext.status.isFocused).toBe(true);
        });

        it('should inject frameContext correctly', () => {
            expect(mockContext.frameContext).toBe(mockEditor.frameContext);
            expect(mockContext.frameContext.type).toBe('frameContext');
        });

        it('should inject frameOptions correctly', () => {
            expect(mockContext.frameOptions).toBe(mockEditor.frameOptions);
            expect(mockContext.frameOptions.type).toBe('frameOptions');
        });

        it('should inject context correctly', () => {
            expect(mockContext.context).toBe(mockEditor.context);
            expect(mockContext.context.type).toBe('context');
        });

        it('should inject options correctly', () => {
            expect(mockContext.options).toBe(mockEditor.options);
            expect(mockContext.options.mode).toBe('classic');
            expect(mockContext.options.plugins).toEqual(['font', 'list']);
        });

        it('should inject icons correctly', () => {
            expect(mockContext.icons).toBe(mockEditor.icons);
            expect(mockContext.icons.bold).toBe('<svg>bold</svg>');
            expect(mockContext.icons.italic).toBe('<svg>italic</svg>');
        });

        it('should inject lang correctly', () => {
            expect(mockContext.lang).toBe(mockEditor.lang);
            expect(mockContext.lang.toolbar.bold).toBe('Bold');
            expect(mockContext.lang.dialogBox.ok).toBe('OK');
        });

        it('should inject frameRoots Map correctly', () => {
            expect(mockContext.frameRoots).toBe(mockEditor.frameRoots);
            expect(mockContext.frameRoots).toBeInstanceOf(Map);
            expect(mockContext.frameRoots.size).toBe(2);
            expect(mockContext.frameRoots.get('root1')).toEqual({ element: 'mock1' });
        });
    });

    describe('Window and document injection', () => {
        beforeEach(() => {
            CoreInjector.call(mockContext, mockEditor);
        });

        it('should inject window object correctly', () => {
            expect(mockContext._w).toBe(mockEditor._w);
            expect(mockContext._w).toBe(window);
            expect(typeof mockContext._w).toBe('object');
        });

        it('should inject document object correctly', () => {
            expect(mockContext._d).toBe(mockEditor._d);
            expect(mockContext._d).toBe(document);
            expect(typeof mockContext._d).toBe('object');
        });
    });

    describe('Property reference integrity', () => {
        it('should maintain object references, not create copies', () => {
            CoreInjector.call(mockContext, mockEditor);

            // Modify original object
            mockEditor.status.newProperty = 'test';

            // Should be reflected in injected reference
            expect(mockContext.status.newProperty).toBe('test');
        });

        it('should handle null/undefined properties gracefully', () => {
            const editorWithNulls = {
                ...mockEditor,
                eventManager: null,
                history: undefined,
                plugins: null
            };

            expect(() => {
                CoreInjector.call(mockContext, editorWithNulls);
            }).not.toThrow();

            expect(mockContext.eventManager).toBeNull();
            expect(mockContext.history).toBeUndefined();
            expect(mockContext.plugins).toBeNull();
        });

        it('should work with empty objects', () => {
            const emptyEditor = {
                eventManager: {},
                instanceCheck: {},
                history: {},
                events: {},
                triggerEvent: () => {},
                carrierWrapper: document.createElement('span'),
                plugins: {},
                status: {},
                frameContext: {},
                frameOptions: {},
                context: {},
                options: {},
                icons: {},
                lang: {},
                frameRoots: new Map(),
                _w: window,
                _d: document
            };

            CoreInjector.call(mockContext, emptyEditor);

            expect(mockContext.plugins).toEqual({});
            expect(mockContext.frameRoots.size).toBe(0);
        });
    });

    describe('JSDoc type annotations', () => {
        it('should have comprehensive JSDoc comments', () => {
            const sourceString = CoreInjector.toString();

            // Check for JSDoc patterns
            expect(sourceString).toContain('@description');
            expect(sourceString).toContain('@type');
            expect(sourceString).toContain('__se__EditorCore');
        });

        it('should document all major properties', () => {
            const sourceString = CoreInjector.toString();

            const documentedProperties = [
                'editor',
                'eventManager',
                'history',
                'plugins',
                'status',
                'options',
                'icons',
                'lang'
            ];

            documentedProperties.forEach(prop => {
                expect(sourceString).toContain(prop);
            });
        });
    });
});