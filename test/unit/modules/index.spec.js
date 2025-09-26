/**
 * @fileoverview Unit tests for modules/index.js
 */

import {
    _DragHandle,
    ApiManager,
    ColorPicker,
    Controller,
    Browser,
    FileManager,
    HueSlider,
    Figure,
    Modal,
    ModalAnchorEditor,
    SelectMenu
} from '../../../src/modules/index.js';

import defaultExport from '../../../src/modules/index.js';

describe('Modules - index.js', () => {
    describe('Named exports', () => {
        it('should export _DragHandle', () => {
            expect(_DragHandle).toBeDefined();
            expect(_DragHandle).toBeInstanceOf(Map);
        });

        it('should export ApiManager', () => {
            expect(ApiManager).toBeDefined();
            expect(typeof ApiManager).toBe('function');
        });

        it('should export ColorPicker', () => {
            expect(ColorPicker).toBeDefined();
            expect(typeof ColorPicker).toBe('function');
        });

        it('should export Controller', () => {
            expect(Controller).toBeDefined();
            expect(typeof Controller).toBe('function');
        });

        it('should export Browser', () => {
            expect(Browser).toBeDefined();
            expect(typeof Browser).toBe('function');
        });

        it('should export FileManager', () => {
            expect(FileManager).toBeDefined();
            expect(typeof FileManager).toBe('function');
        });

        it('should export HueSlider', () => {
            expect(HueSlider).toBeDefined();
            expect(typeof HueSlider).toBe('function');
        });

        it('should export Figure', () => {
            expect(Figure).toBeDefined();
            expect(typeof Figure).toBe('function');
        });

        it('should export Modal', () => {
            expect(Modal).toBeDefined();
            expect(typeof Modal).toBe('function');
        });

        it('should export ModalAnchorEditor', () => {
            expect(ModalAnchorEditor).toBeDefined();
            expect(typeof ModalAnchorEditor).toBe('function');
        });

        it('should export SelectMenu', () => {
            expect(SelectMenu).toBeDefined();
            expect(typeof SelectMenu).toBe('function');
        });
    });

    describe('Default export', () => {
        it('should export default object with all modules', () => {
            expect(defaultExport).toBeDefined();
            expect(typeof defaultExport).toBe('object');
        });

        it('should have all expected properties in default export', () => {
            const expectedModules = [
                '_DragHandle',
                'ApiManager',
                'ColorPicker',
                'Controller',
                'Browser',
                'FileManager',
                'HueSlider',
                'Figure',
                'Modal',
                'ModalAnchorEditor',
                'SelectMenu'
            ];

            expectedModules.forEach(moduleName => {
                expect(defaultExport).toHaveProperty(moduleName);
                expect(defaultExport[moduleName]).toBeDefined();
            });
        });

        it('should have same references between named and default exports', () => {
            expect(defaultExport._DragHandle).toBe(_DragHandle);
            expect(defaultExport.ApiManager).toBe(ApiManager);
            expect(defaultExport.ColorPicker).toBe(ColorPicker);
            expect(defaultExport.Controller).toBe(Controller);
            expect(defaultExport.Browser).toBe(Browser);
            expect(defaultExport.FileManager).toBe(FileManager);
            expect(defaultExport.HueSlider).toBe(HueSlider);
            expect(defaultExport.Figure).toBe(Figure);
            expect(defaultExport.Modal).toBe(Modal);
            expect(defaultExport.ModalAnchorEditor).toBe(ModalAnchorEditor);
            expect(defaultExport.SelectMenu).toBe(SelectMenu);
        });
    });

    describe('Module integrity', () => {
        it('should export exactly 11 modules', () => {
            expect(Object.keys(defaultExport)).toHaveLength(11);
        });

        it('should not export any undefined modules', () => {
            Object.values(defaultExport).forEach(moduleExport => {
                expect(moduleExport).toBeDefined();
                expect(moduleExport).not.toBeNull();
            });
        });

        it('should maintain consistent export structure', () => {
            // Verify that the export structure matches the expected pattern
            const namedExports = {
                _DragHandle,
                ApiManager,
                ColorPicker,
                Controller,
                Browser,
                FileManager,
                HueSlider,
                Figure,
                Modal,
                ModalAnchorEditor,
                SelectMenu
            };

            // Check that all named exports exist in default export
            Object.keys(namedExports).forEach(key => {
                expect(defaultExport[key]).toBe(namedExports[key]);
            });
        });
    });
});