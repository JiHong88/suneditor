/**
 * @fileoverview Unit tests for modules/Controller.js
 */

import Controller from '../../../src/modules/Controller.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.carrierWrapper = {
            appendChild: jest.fn()
        };
        this.eventManager = {
            addEvent: jest.fn(),
            removeGlobalEvent: jest.fn(),
            addGlobalEvent: jest.fn()
        };
        this.selection = editor.selection;
        this.offset = editor.offset;
    });
});

// Mock canvas and document methods
const mockCanvasContext = {
    createLinearGradient: jest.fn().mockReturnValue({
        addColorStop: jest.fn()
    }),
    fillRect: jest.fn(),
    fillStyle: jest.fn(),
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    globalAlpha: 1,
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    getImageData: jest.fn().mockReturnValue({ data: [255, 0, 0, 255] })
};

global.document.createElement = jest.fn().mockImplementation((tagName) => {
    if (tagName === 'canvas') {
        return {
            width: 0,
            height: 0,
            getContext: jest.fn().mockReturnValue(mockCanvasContext)
        };
    }
    return {
        querySelector: jest.fn().mockReturnValue({
            children: [{}, {}],
            querySelector: jest.fn().mockReturnValue({
                children: [{}, {}]
            })
        }),
        appendChild: jest.fn(),
        children: [{}, {}]
    };
});

jest.mock('../../../src/helper', () => ({
    dom: {
        check: { isElement: jest.fn().mockReturnValue(true) },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            createElement: jest.fn().mockImplementation((tagName, attrs, html) => {
                const mockCanvasContext = {
                    createLinearGradient: jest.fn().mockReturnValue({
                        addColorStop: jest.fn()
                    }),
                    fillRect: jest.fn(),
                    fillStyle: jest.fn(),
                    clearRect: jest.fn(),
                    drawImage: jest.fn(),
                    globalAlpha: 1,
                    beginPath: jest.fn(),
                    arc: jest.fn(),
                    fill: jest.fn(),
                    getImageData: jest.fn().mockReturnValue({ data: [255, 0, 0, 255] })
                };

                const mockCanvas = {
                    width: 0,
                    height: 0,
                    getContext: jest.fn().mockReturnValue(mockCanvasContext)
                };

                const elem = {
                    querySelector: jest.fn().mockImplementation((selector) => {
                        if (selector.includes('canvas') || selector.includes('.se-hue-wheel') || selector.includes('.se-hue-gradient')) {
                            return mockCanvas;
                        }
                        return {
                            children: [{}, {}],
                            querySelector: jest.fn().mockReturnValue({
                                children: [{}, {}]
                            })
                        };
                    }),
                    appendChild: jest.fn(),
                    children: [{}, {}],
                    className: attrs?.class || ''
                };
                if (html) elem.innerHTML = html;
                return elem;
            })
        }
    },
    env: { _w: {}, isTouchDevice: false }
}));

describe('Modules - Controller', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            ui: { showController: jest.fn(), hideController: jest.fn() },
            selection: {
                getRangeElement: jest.fn(),
                isRange: jest.fn().mockReturnValue(false)
            },
            triggerEvent: jest.fn(),
            offset: {
                setRangePosition: jest.fn().mockReturnValue(true)
            }
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testController',
                name: 'TestController'
            }
        };
    });

    describe('Constructor', () => {
        const createMockElement = () => ({
            style: {
                visibility: '',
                display: '',
                position: '',
                left: '',
                top: '',
                zIndex: ''
            },
            appendChild: jest.fn(),
            removeAttribute: jest.fn(),
            setAttribute: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            },
            getBoundingClientRect: jest.fn().mockReturnValue({
                width: 100,
                height: 50,
                top: 0,
                left: 0,
                right: 100,
                bottom: 50
            })
        });

        it('should create Controller instance', () => {
            const mockElement = createMockElement();
            const controller = new Controller(mockInst, mockElement, {});

            expect(controller).toBeInstanceOf(Controller);
            expect(controller.inst).toBe(mockInst);
            expect(controller.kind).toBe('testController');
        });

        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackController' }
            };
            const mockElement = createMockElement();

            const controller = new Controller(instWithoutKey, mockElement, {});
            expect(controller.kind).toBe('FallbackController');
        });
    });

    describe('Basic functionality', () => {
        let controller;
        let mockElement;

        beforeEach(() => {
            mockElement = {
                style: {
                    visibility: '',
                    display: '',
                    position: '',
                    left: '',
                    top: '',
                    zIndex: ''
                },
                appendChild: jest.fn(),
                removeAttribute: jest.fn(),
                setAttribute: jest.fn(),
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    contains: jest.fn()
                },
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 100,
                    height: 50,
                    top: 0,
                    left: 0,
                    right: 100,
                    bottom: 50
                })
            };
            controller = new Controller(mockInst, mockElement, {});
        });

        it('should have access to editor components', () => {
            expect(controller.editor).toBe(mockEditor);
            expect(controller.ui).toBe(mockEditor.ui);
            expect(controller.selection).toBe(mockEditor.selection);
        });

        it('should handle controller operations', () => {
            expect(() => {
                controller.show();
            }).not.toThrow();
        });
    });
});