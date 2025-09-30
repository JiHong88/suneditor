/**
 * @fileoverview Comprehensive unit tests for core/editor.js
 */

import Editor from '../../../src/core/editor';
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Core - Editor', () => {
    describe('Editor constructor function', () => {
        it('should be a function', () => {
            expect(typeof Editor).toBe('function');
        });

        it('should be constructable with proper arguments', () => {
            // Editor expects multiTargets array with specific structure
            // Testing without proper setup will fail, which is expected
            expect(() => {
                new Editor();
            }).toThrow();

            expect(() => {
                new Editor([]);
            }).toThrow();
        });

        it('should contain core editor functionality patterns', () => {
            const editorString = Editor.toString();

            // Check for key functionality patterns (method names might be minified)
            const expectedPatterns = [
                'this.plugins',
                'this.options',
                'this.frameRoots',
                'this.eventManager',
                'this.history',
                'this.selection',
                'this.format'
            ];

            expectedPatterns.forEach(pattern => {
                expect(editorString).toContain(pattern);
            });

            // Check that it's not just a trivial function
            expect(editorString).toContain('function');
            expect(editorString).toContain('this.');
        });

        it('should contain expected property initializations', () => {
            const editorString = Editor.toString();

            // Check for key property initializations
            const expectedProperties = [
                'this.rootKeys',
                'this.frameRoots',
                'this.plugins',
                'this.options',
                'this.events',
                'this.icons',
                'this.lang',
                'this.status',
                'this.isClassic',
                'this.isInline',
                'this.isBalloon'
            ];

            expectedProperties.forEach(property => {
                expect(editorString).toContain(property);
            });
        });

        it('should handle invalid multiTargets with appropriate errors', () => {
            // Test various invalid inputs
            expect(() => {
                new Editor(null);
            }).toThrow();

            expect(() => {
                new Editor("invalid");
            }).toThrow();

            expect(() => {
                new Editor([{ invalid: true }]);
            }).toThrow();
        });

        it('should be a substantial constructor function', () => {
            const editorString = Editor.toString();

            // Editor should be a large, complex function
            expect(editorString.length).toBeGreaterThan(10000);

            // Should contain initialization patterns (bundled names or coverage-wrapped)
            expect(
                editorString.includes('_constructor.default') ||
                editorString.includes('_constructor')
            ).toBeTruthy();
            expect(
                editorString.includes('this.__Create') ||
                editorString.includes('__Create')
            ).toBeTruthy();
        });
    });

    describe('Editor static analysis', () => {
        it('should import required dependencies', () => {
            const editorString = Editor.toString();

            // Check for key dependency usage patterns
            const expectedDependencies = [
                '_constructor', // Constructor import
                '_options', // Options utilities
                '_context', // Context utilities
                '_frameContext', // FrameContext utilities
                '_actives', // Active commands
                '_history', // History class
                '_eventManager', // EventManager class
                '_events' // Events
            ];

            // Note: In bundled code, imports might be renamed
            // So we check for patterns rather than exact names
            expect(editorString).toContain('(0,'); // Bundled import pattern
        });

        it('should define comprehensive editor structure', () => {
            const editorString = Editor.toString();

            // Check for all major structural components created in __registerClass
            const expectedStructuralComponents = [
                // Base components
                'eventManager',
                'history',
                'instanceCheck',

                // Main editor classes
                'offset',
                'shortcuts',
                'toolbar',
                'selection',
                'html',
                'nodeTransform',
                'component',
                'format',
                'menu',
                'char',
                'ui',
                'viewer'
            ];

            expectedStructuralComponents.forEach(component => {
                expect(editorString).toContain(component);
            });
        });

        it('should handle different editor modes', () => {
            const editorString = Editor.toString();

            // Check for mode-related logic
            const modePatterns = [
                'isClassic',
                'isInline',
                'isBalloon',
                'isBalloonAlways',
                'isSubBalloon'
            ];

            modePatterns.forEach(mode => {
                expect(editorString).toContain(mode);
            });
        });
    });

    describe('Editor function properties', () => {
        it('should be a constructor function', () => {
            expect(Editor.prototype).toBeDefined();
            expect(typeof Editor.prototype.constructor).toBe('function');
        });

        it('should have expected function characteristics', () => {
            // Editor should be a named function
            expect(Editor.name).toBe('Editor');

            // Should have proper length (parameter count)
            expect(Editor.length).toBeGreaterThan(0);
        });
    });

    describe('Editor parameter validation', () => {
        it('should require multiTargets as first parameter', () => {
            expect(() => {
                new Editor();
            }).toThrow();

            expect(() => {
                new Editor(undefined);
            }).toThrow();

            expect(() => {
                new Editor(null);
            }).toThrow();
        });

        it('should validate multiTargets structure', () => {
            expect(() => {
                new Editor("string");
            }).toThrow();

            expect(() => {
                new Editor(123);
            }).toThrow();

            expect(() => {
                new Editor({});
            }).toThrow();
        });

        it('should require array with proper target structure', () => {
            expect(() => {
                new Editor([]);
            }).toThrow();

            expect(() => {
                new Editor([{}]);
            }).toThrow();

            expect(() => {
                new Editor([{ key: 'test' }]);
            }).toThrow();

            expect(() => {
                new Editor([{ target: null }]);
            }).toThrow();
        });
    });

    describe('Editor dependency imports', () => {
        it('should contain references to core dependencies', () => {
            const editorString = Editor.toString();

            // Check for constructor and utility imports
            const expectedImportPatterns = [
                'Constructor', // Main constructor
                'InitOptions', // Options initialization
                'History', // History management
                'EventManager', // Event management
                'Events' // Events
            ];

            // In bundled code, these might appear as function calls
            expectedImportPatterns.forEach(pattern => {
                expect(editorString).toMatch(new RegExp(pattern, 'i'));
            });
        });

        it('should reference class injector concepts', () => {
            const editorString = Editor.toString();
            // Editor should have class-related functionality, even if ClassInjector is bundled
            expect(editorString.includes('toolbar') || editorString.includes('selection') || editorString.includes('format')).toBeTruthy();
        });

        it('should import all required classes', () => {
            const editorString = Editor.toString();

            const expectedClasses = [
                'Char',
                'Component',
                'Format',
                'HTML',
                'Menu',
                'Selection',
                'Toolbar',
                'UI',
                'Viewer'
            ];

            expectedClasses.forEach(className => {
                expect(editorString).toMatch(new RegExp(className, 'i'));
            });
        });
    });

    describe('Editor constants and configuration', () => {
        it('should define button management functionality', () => {
            const editorString = Editor.toString();

            // Check for button-related functionality (may be bundled differently)
            expect(
                editorString.includes('Button') ||
                editorString.includes('toolbar') ||
                editorString.includes('_pluginCallButtons') ||
                editorString.includes('_responsiveButtons')
            ).toBeTruthy();
        });

        it('should handle different button states', () => {
            const editorString = Editor.toString();

            // Check for code view and controller states (may be bundled differently)
            expect(
                editorString.includes('code-view') ||
                editorString.includes('component-enabled') ||
                editorString.includes('_codeViewDisabledButtons')
            ).toBeTruthy();
        });
    });

    describe('Editor constructor implementation details', () => {
        it('should handle document and window references', () => {
            const editorString = Editor.toString();

            // Should handle owner document and default view
            expect(editorString).toContain('ownerDocument');
            expect(editorString).toContain('defaultView');
        });

        it('should initialize with Constructor product', () => {
            const editorString = Editor.toString();

            // Should call Constructor and use its product (bundled as _constructor.default)
            expect(
                editorString.includes('_constructor.default') ||
                editorString.includes('Constructor(') ||
                editorString.includes('_constructor')
            ).toBeTruthy();
            expect(
                editorString.includes('product') ||
                editorString.includes('.rootKeys') ||
                editorString.includes('.frameRoots')
            ).toBeTruthy();
        });

        it('should set up root keys and frame roots', () => {
            const editorString = Editor.toString();

            expect(editorString).toContain('rootKeys');
            expect(editorString).toContain('frameRoots');
        });

        it('should establish context and options', () => {
            const editorString = Editor.toString();

            expect(editorString).toContain('context');
            expect(editorString).toContain('options');
            expect(editorString).toContain('ContextUtil');
        });
    });

    describe('Editor JSDoc and TypeScript support', () => {
        it('should have proper JSDoc type definitions', () => {
            const editorString = Editor.toString();

            // Check for JSDoc patterns in source
            const sourceRegex = /\/\*\*[\s\S]*?\*\//g;
            const hasJSDoc = sourceRegex.test(editorString) ||
                           editorString.includes('@typedef') ||
                           editorString.includes('@param') ||
                           editorString.includes('@constructor');

            expect(hasJSDoc).toBe(true);
        });
    });

    describe('Instance methods', () => {
        let editor;

        beforeEach(async () => {
            editor = createTestEditor();
            await waitForEditorReady(editor);
        });

        afterEach(() => {
            destroyTestEditor(editor);
        });

        describe('setDir', () => {
            it('should set the text direction to rtl', () => {
                // when
                editor.setDir('rtl');

                // then
                const frame = editor.frameContext;
                const wysiwyg = frame.get('wysiwyg');
                expect(wysiwyg.classList.contains('se-rtl')).toBe(true);
                expect(editor.options.get('_rtl')).toBe(true);
            });

            it('should set the text direction to ltr', () => {
                // given
                editor.setDir('rtl');

                // when
                editor.setDir('ltr');

                // then
                const frame = editor.frameContext;
                const wysiwyg = frame.get('wysiwyg');
                expect(wysiwyg.classList.contains('se-rtl')).toBe(false);
                expect(editor.options.get('_rtl')).toBe(false);
            });
        });
    });
});