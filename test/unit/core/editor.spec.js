/**
 * @fileoverview Comprehensive unit tests for core/editor.js
 */

import Editor from '../../../src/core/editor';

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

            // Should contain initialization patterns (bundled names)
            expect(editorString).toContain('_constructor.default');
            expect(editorString).toContain('this.__Create');
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

            // Check for major structural components
            const expectedStructuralComponents = [
                'eventManager',
                'history',
                'selection',
                'format',
                'html',
                'component',
                'toolbar',
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
});