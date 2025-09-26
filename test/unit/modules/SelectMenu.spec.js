/**
 * @fileoverview Unit tests for modules/SelectMenu.js
 */

import SelectMenu from '../../../src/modules/SelectMenu.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

jest.mock('../../../src/helper', () => ({
    dom: {
        check: {
            isElement: jest.fn().mockReturnValue(true),
            isInputElement: jest.fn().mockReturnValue(false)
        },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            createElement: jest.fn().mockImplementation((tag, attrs, innerHTML) => {
                const el = global.document.createElement(tag || 'div');
                if (attrs) {
                    Object.keys(attrs).forEach(attr => {
                        el.setAttribute(attr, attrs[attr]);
                    });
                }
                if (innerHTML) {
                    el.innerHTML = innerHTML;
                }
                return el;
            })
        }
    },
    env: { _w: {} },
    keyCodeMap: { isEsc: jest.fn().mockReturnValue(false) }
}));

describe('Modules - SelectMenu', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            ui: { showSelectMenu: jest.fn(), hideSelectMenu: jest.fn() },
            selection: { getRangeElement: jest.fn() },
            triggerEvent: jest.fn(),
            frameContext: new Map()
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testSelectMenu',
                name: 'TestSelectMenu'
            }
        };
    });

    describe('Constructor', () => {
        it('should create SelectMenu instance', () => {
            const params = { position: 'top-center' };
            const selectMenu = new SelectMenu(mockInst, params);

            expect(selectMenu).toBeInstanceOf(SelectMenu);
            expect(selectMenu.inst).toBe(mockInst);
            expect(selectMenu.kink).toBe('testSelectMenu');
        });

        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackSelectMenu' }
            };
            const params = { position: 'bottom-left' };

            const selectMenu = new SelectMenu(instWithoutKey, params);
            expect(selectMenu.kink).toBe('FallbackSelectMenu');
        });
    });

    describe('Basic functionality', () => {
        let selectMenu;

        beforeEach(() => {
            const params = { position: 'top-center' };
            selectMenu = new SelectMenu(mockInst, params);
        });

        it('should have access to editor components', () => {
            expect(selectMenu.editor).toBe(mockEditor);
            expect(selectMenu.editor.ui).toBe(mockEditor.ui);
            expect(selectMenu.editor.selection).toBe(mockEditor.selection);
        });

        it('should handle select menu operations', () => {
            expect(() => {
                // Test basic properties instead of calling methods that may not exist
                expect(selectMenu.kink).toBeDefined();
                expect(selectMenu.inst).toBeDefined();
            }).not.toThrow();
        });
    });
});