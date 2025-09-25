/**
 * @fileoverview Unit tests for core/config/context.js
 */

import { CreateContext, ContextUtil } from '../../../../src/core/config/context';

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

    describe('ContextUtil function', () => {
        let mockEditor;
        let contextUtil;

        beforeEach(() => {
            const contextMap = CreateContext(
                mockDOM.toolbar,
                mockDOM.toolbarContainer,
                mockDOM.menuTray,
                mockDOM.subbar,
                mockDOM.statusbarContainer
            );

            mockEditor = {
                __context: contextMap
            };

            contextUtil = ContextUtil(mockEditor);
        });

        it('should create utility with proper methods', () => {
            expect(typeof contextUtil.get).toBe('function');
            expect(typeof contextUtil.set).toBe('function');
            expect(typeof contextUtil.has).toBe('function');
            expect(typeof contextUtil.delete).toBe('function');
            expect(typeof contextUtil.getAll).toBe('function');
            expect(typeof contextUtil.clear).toBe('function');
        });

        it('should get DOM elements correctly', () => {
            expect(contextUtil.get('menuTray')).toBe(mockDOM.menuTray);
            expect(contextUtil.get('toolbar_main')).toBe(mockDOM.toolbar);
            expect(contextUtil.get('toolbar_sub_main')).toBe(mockDOM.subbar);
            expect(contextUtil.get('nonexistent')).toBeUndefined();
        });

        it('should set DOM elements correctly', () => {
            const newElement = document.createElement('div');
            contextUtil.set('customElement', newElement);
            expect(contextUtil.get('customElement')).toBe(newElement);
        });

        it('should check existence correctly', () => {
            expect(contextUtil.has('menuTray')).toBe(true);
            expect(contextUtil.has('toolbar_main')).toBe(true);
            expect(contextUtil.has('nonexistent')).toBe(false);
        });

        it('should delete elements correctly', () => {
            expect(contextUtil.has('menuTray')).toBe(true);
            contextUtil.delete('menuTray');
            expect(contextUtil.has('menuTray')).toBe(false);
            expect(contextUtil.get('menuTray')).toBeUndefined();
        });

        it('should get all elements as object', () => {
            const all = contextUtil.getAll();
            expect(typeof all).toBe('object');
            expect(all.menuTray).toBe(mockDOM.menuTray);
            expect(all.toolbar_main).toBe(mockDOM.toolbar);
            expect(all.toolbar_sub_main).toBe(mockDOM.subbar);
        });

        it('should clear all elements', () => {
            expect(contextUtil.has('menuTray')).toBe(true);
            contextUtil.clear();
            expect(contextUtil.getAll()).toEqual({});
            expect(contextUtil.has('menuTray')).toBe(false);
        });

        it('should handle DOM element replacement', () => {
            const originalToolbar = contextUtil.get('toolbar_main');
            const newToolbar = document.createElement('div');

            contextUtil.set('toolbar_main', newToolbar);
            expect(contextUtil.get('toolbar_main')).toBe(newToolbar);
            expect(contextUtil.get('toolbar_main')).not.toBe(originalToolbar);
        });

        it('should maintain reference integrity', () => {
            const menuTray = contextUtil.get('menuTray');
            const menuTray2 = contextUtil.get('menuTray');
            expect(menuTray).toBe(menuTray2);
            expect(menuTray).toBe(mockDOM.menuTray);
        });
    });

    describe('Integration tests', () => {
        it('should work end-to-end from CreateContext to ContextUtil', () => {
            // Create context
            const context = CreateContext(
                mockDOM.toolbar,
                mockDOM.toolbarContainer,
                mockDOM.menuTray,
                mockDOM.subbar,
                mockDOM.statusbarContainer
            );

            // Create editor with context
            const mockEditor = { __context: context };
            const util = ContextUtil(mockEditor);

            // Test full workflow
            expect(util.get('menuTray')).toBe(mockDOM.menuTray);

            // Add new element
            const newElement = document.createElement('div');
            util.set('testElement', newElement);
            expect(util.get('testElement')).toBe(newElement);

            // Verify original elements still exist
            expect(util.has('toolbar_main')).toBe(true);
            expect(util.has('toolbar_sub_main')).toBe(true);

            // Test deletion
            util.delete('testElement');
            expect(util.has('testElement')).toBe(false);
        });

        it('should handle dynamic context updates', () => {
            const context = CreateContext(
                mockDOM.toolbar,
                null, // No container initially
                mockDOM.menuTray,
                null, // No subbar initially
                null  // No statusbar initially
            );

            const mockEditor = { __context: context };
            const util = ContextUtil(mockEditor);

            // Initially should not have container elements
            expect(util.has('toolbar_wrapper')).toBe(false);
            expect(util.has('toolbar_sub_main')).toBe(false);

            // Add elements dynamically
            const toolbarWrapper = document.createElement('div');
            const subToolbar = document.createElement('div');

            util.set('toolbar_wrapper', toolbarWrapper);
            util.set('toolbar_sub_main', subToolbar);

            expect(util.get('toolbar_wrapper')).toBe(toolbarWrapper);
            expect(util.get('toolbar_sub_main')).toBe(subToolbar);
        });
    });
});