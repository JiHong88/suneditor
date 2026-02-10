/**
 * @fileoverview Unit tests for core/config/context.js
 */

import { CreateContext } from '../../../../src/core/config/context';
// ContextUtil moved to contextProvider service

describe('Core Config - Context', () => {
    let mockDOM;

    beforeEach(() => {
        // Create mock DOM structure for testing
        mockDOM = {
            toolbar: document.createElement('div'),
            toolbarContainer: document.createElement('div'),
            menuTray: document.createElement('div'),
            subbar: document.createElement('div'),
            statusbarContainer: document.createElement('div')
        };

        // Setup toolbar structure
        mockDOM.toolbar.innerHTML = '<div class="se-btn-tray"></div><div class="se-arrow"></div>';

        // Setup toolbar container structure
        mockDOM.toolbarContainer.innerHTML = `
            <div class="sun-editor"></div>
            <div class="se-toolbar-sticky-dummy"></div>
        `;

        // Setup subbar structure
        const subbarWrapper = document.createElement('div');
        const subbarContainer = document.createElement('div');
        subbarContainer.appendChild(mockDOM.subbar);
        subbarWrapper.appendChild(subbarContainer);
        document.body.appendChild(subbarWrapper);

        mockDOM.subbar.innerHTML = '<div class="se-btn-tray"></div><div class="se-arrow"></div>';

        // Setup statusbar container structure
        mockDOM.statusbarContainer.innerHTML = '<div class="sun-editor"></div>';
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
    });

    describe('CreateContext function', () => {
        it('should create context with basic toolbar and menuTray', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                null,
                mockDOM.menuTray,
                null,
                null
            );

            expect(context instanceof Map).toBe(true);
            expect(context.get('menuTray')).toBe(mockDOM.menuTray);
            expect(context.get('toolbar_main')).toBe(mockDOM.toolbar);
            expect(context.get('toolbar_buttonTray')).toBe(mockDOM.toolbar.querySelector('.se-btn-tray'));
            expect(context.get('toolbar_arrow')).toBe(mockDOM.toolbar.querySelector('.se-arrow'));
        });

        it('should include toolbar container elements when provided', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                mockDOM.toolbarContainer,
                mockDOM.menuTray,
                null,
                null
            );

            expect(context.get('toolbar_wrapper')).toBe(mockDOM.toolbarContainer.querySelector('.sun-editor'));
            expect(context.get('_stickyDummy')).toBe(mockDOM.toolbarContainer.querySelector('.se-toolbar-sticky-dummy'));
        });

        it('should include sub-toolbar elements when provided', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                mockDOM.toolbarContainer,
                mockDOM.menuTray,
                mockDOM.subbar,
                null
            );

            expect(context.get('toolbar_sub_main')).toBe(mockDOM.subbar);
            expect(context.get('toolbar_sub_buttonTray')).toBe(mockDOM.subbar.querySelector('.se-btn-tray'));
            expect(context.get('toolbar_sub_arrow')).toBe(mockDOM.subbar.querySelector('.se-arrow'));
            expect(context.get('toolbar_sub_wrapper')).toBe(mockDOM.subbar.parentElement.parentElement);
        });

        it('should include statusbar elements when provided', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                mockDOM.toolbarContainer,
                mockDOM.menuTray,
                null,
                mockDOM.statusbarContainer
            );

            expect(context.get('statusbar_wrapper')).toBe(mockDOM.statusbarContainer.querySelector('.sun-editor'));
        });

        it('should handle all parameters provided', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                mockDOM.toolbarContainer,
                mockDOM.menuTray,
                mockDOM.subbar,
                mockDOM.statusbarContainer
            );

            // Check all main elements
            expect(context.get('menuTray')).toBe(mockDOM.menuTray);
            expect(context.get('toolbar_main')).toBe(mockDOM.toolbar);
            expect(context.get('toolbar_buttonTray')).toBe(mockDOM.toolbar.querySelector('.se-btn-tray'));
            expect(context.get('toolbar_arrow')).toBe(mockDOM.toolbar.querySelector('.se-arrow'));

            // Check container elements
            expect(context.get('toolbar_wrapper')).toBe(mockDOM.toolbarContainer.querySelector('.sun-editor'));
            expect(context.get('_stickyDummy')).toBe(mockDOM.toolbarContainer.querySelector('.se-toolbar-sticky-dummy'));

            // Check sub-toolbar elements
            expect(context.get('toolbar_sub_main')).toBe(mockDOM.subbar);
            expect(context.get('toolbar_sub_buttonTray')).toBe(mockDOM.subbar.querySelector('.se-btn-tray'));
            expect(context.get('toolbar_sub_arrow')).toBe(mockDOM.subbar.querySelector('.se-arrow'));
            expect(context.get('toolbar_sub_wrapper')).toBe(mockDOM.subbar.parentElement.parentElement);

            // Check statusbar elements
            expect(context.get('statusbar_wrapper')).toBe(mockDOM.statusbarContainer.querySelector('.sun-editor'));
        });

        it('should handle missing sub-elements gracefully', () => {
            // Create toolbar without expected child elements
            const emptyToolbar = document.createElement('div');
            const context = CreateContext(
                emptyToolbar,
                null,
                mockDOM.menuTray,
                null,
                null
            );

            expect(context.get('toolbar_main')).toBe(emptyToolbar);
            expect(context.get('toolbar_buttonTray')).toBeNull();
            expect(context.get('toolbar_arrow')).toBeNull();
        });

        it('should handle null parameters correctly', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                null,
                mockDOM.menuTray,
                null,
                null
            );

            // Should not have container-dependent elements
            expect(context.has('toolbar_wrapper')).toBe(false);
            expect(context.has('_stickyDummy')).toBe(false);
            expect(context.has('toolbar_sub_main')).toBe(false);
            expect(context.has('statusbar_wrapper')).toBe(false);
        });
    });

    // Note: ContextUtil and Integration tests have been moved to
    // test/unit/core/config/contextProvider.spec.js
});