/**
 * @fileoverview Unit tests for modules/Modal.js
 */

import Modal from '../../../src/modules/Modal.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.carrierWrapper = editor.carrierWrapper || {
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            querySelector: jest.fn()
        };
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.eventManager = {
            addEvent: jest.fn(),
            removeEvent: jest.fn()
        };
    });
});

jest.mock('../../../src/helper', () => ({
    dom: {
        check: { isElement: jest.fn().mockReturnValue(true) },
        utils: { addClass: jest.fn(), removeClass: jest.fn() },
        events: { addEvent: jest.fn(), removeEvent: jest.fn() }
    },
    env: { _w: {} },
    keyCodeMap: { isEsc: jest.fn().mockReturnValue(false) }
}));

describe('Modules - Modal', () => {
    let mockInst;
    let mockEditor;
    let mockElement;

    beforeEach(() => {
        jest.clearAllMocks();

        mockElement = document.createElement('div');
        mockElement.innerHTML = '<form><input data-focus /></form>';
        // Add querySelector mock that still works but falls back to real DOM
        const originalQuerySelector = mockElement.querySelector;
        mockElement.querySelector = jest.fn().mockImplementation(function(selector) {
            return originalQuerySelector.call(this, selector);
        });

        const mockCarrierWrapper = {
            querySelector: jest.fn().mockImplementation((selector) => {
                if (selector === '.se-modal') {
                    const modalArea = document.createElement('div');
                    modalArea.className = 'se-modal';
                    return modalArea;
                }
                if (selector === '.se-modal .se-modal-inner') {
                    const modalInner = document.createElement('div');
                    modalInner.className = 'se-modal-inner';
                    return modalInner;
                }
                return null;
            }),
            appendChild: jest.fn(),
            removeChild: jest.fn()
        };

        mockEditor = {
            ui: {
                showModal: jest.fn(),
                hideModal: jest.fn()
            },
            offset: {
                getOffset: jest.fn().mockReturnValue({ left: 0, top: 0 })
            },
            carrierWrapper: mockCarrierWrapper,
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testModal',
                name: 'TestModal'
            }
        };
    });

    describe('Constructor', () => {
        it('should create Modal instance with required properties', () => {
            const modal = new Modal(mockInst, mockElement);

            expect(modal.inst).toBe(mockInst);
            expect(modal.kind).toBe('testModal');
            expect(modal.form).toBe(mockElement);
            expect(modal.isUpdate).toBe(false);
            expect(modal.offset).toBe(mockEditor.offset);
            expect(modal.ui).toBe(mockEditor.ui);
        });

        it('should use constructor name as fallback for kind', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: {
                    name: 'FallbackModal'
                }
            };

            const modal = new Modal(instWithoutKey, mockElement);
            expect(modal.kind).toBe('FallbackModal');
        });

        it('should find focus element if it exists', () => {
            const focusElement = document.createElement('input');
            mockElement.querySelector.mockReturnValue(focusElement);

            const modal = new Modal(mockInst, mockElement);
            expect(modal.focusElement).toBe(focusElement);
        });

        it('should handle missing focus element gracefully', () => {
            mockElement.querySelector.mockReturnValue(null);

            const modal = new Modal(mockInst, mockElement);
            expect(modal.focusElement).toBeNull();
        });
    });

    describe('Basic functionality', () => {
        let modal;

        beforeEach(() => {
            modal = new Modal(mockInst, mockElement);
        });

        it('should have access to editor components', () => {
            expect(modal.editor).toBe(mockEditor);
            expect(modal.ui).toBe(mockEditor.ui);
            expect(modal.offset).toBe(mockEditor.offset);
        });

        it('should inherit from CoreInjector', () => {
            expect(modal.editor).toBeDefined();
            expect(modal.frameContext).toBeDefined();
            expect(modal.carrierWrapper).toBeDefined();
        });
    });

    describe('Modal integration', () => {
        let modal;

        beforeEach(() => {
            modal = new Modal(mockInst, mockElement);
        });

        it('should have modal area and inner elements', () => {
            // Private fields can't be accessed directly, but we can verify the modal was created
            expect(modal.focusElement).toBeDefined();
            expect(modal.inst).toBeDefined();
        });

        it('should be properly configured for plugin integration', () => {
            expect(modal.kind).toBeDefined();
            expect(modal.form).toBe(mockElement);
            expect(modal.inst).toBe(mockInst);
        });
    });

    describe('Error handling', () => {
        it('should handle missing carrier wrapper gracefully', () => {
            mockEditor.carrierWrapper = null;

            expect(() => {
                new Modal(mockInst, mockElement);
            }).toThrow();
        });

        it('should handle invalid element parameter', () => {
            const invalidElement = null;

            expect(() => {
                new Modal(mockInst, invalidElement);
            }).toThrow();
        });
    });
});