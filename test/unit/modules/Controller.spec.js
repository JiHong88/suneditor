/**
 * @fileoverview Unit tests for modules/Controller.js
 */

import Controller from '../../../src/modules/contracts/Controller.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext || new Map([
            ['lineBreaker_t', { style: { display: '' } }],
            ['lineBreaker_b', { style: { display: '' } }],
            ['topArea', {}]
        ]);
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.carrierWrapper = {
            appendChild: jest.fn(),
            contains: jest.fn().mockReturnValue(true)
        };
        this.eventManager = {
            addEvent: jest.fn(),
            removeGlobalEvent: jest.fn(),
            addGlobalEvent: jest.fn()
        };
        this.component = {
            __removeGlobalEvent: jest.fn(),
            deselect: jest.fn()
        };
        this.ui = editor.ui;
        this.selection = editor.selection;
        this.offset = editor.offset;
        this.status = editor.status;
        this.instanceCheck = {
            isRange: jest.fn().mockReturnValue(false)
        };
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
    env: { _w: { setTimeout: (fn) => fn() }, isTouchDevice: false }
}));

describe('Modules - Controller', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            ui: {
                showController: jest.fn(),
                hideController: jest.fn(),
                setControllerOnDisabledButtons: jest.fn()
            },
            selection: {
                getRangeElement: jest.fn(),
                isRange: jest.fn().mockReturnValue(false)
            },
            triggerEvent: jest.fn(),
            offset: {
                setRangePosition: jest.fn().mockReturnValue(true),
                setAbsPosition: jest.fn().mockReturnValue({ top: 0, left: 0 })
            },
            status: {
                hasFocus: true
            },
            component: {
                __removeGlobalEvent: jest.fn(),
                deselect: jest.fn()
            },
            toolbar: {
                hide: jest.fn()
            },
            subToolbar: {
                hide: jest.fn()
            },
            isBalloon: false,
            isSubBalloon: false
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

        it('should handle controller operations', () => {
            expect(() => {
                controller.show();
            }).not.toThrow();
        });

        it('should initialize as closed', () => {
            expect(controller.isOpen).toBe(false);
        });
    });

    describe('hide method', () => {
        let controller;
        let mockElement;

        beforeEach(() => {
            mockElement = {
                style: {
                    visibility: 'visible',
                    display: 'block',
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

        it('should set display to none', () => {
            controller.hide();
            expect(controller.form.style.display).toBe('none');
        });
    });

    describe('close method', () => {
        let controller;
        let mockElement;

        beforeEach(() => {
            mockElement = {
                style: {
                    visibility: 'visible',
                    display: 'block',
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
            mockEditor.opendControllers = [];
            mockEditor.currentControllerName = 'testController';
            mockEditor.effectNode = null;
            mockEditor._preventBlur = true;
            mockEditor._controllerTargetContext = null;
            mockEditor.status = { onSelected: true };

            controller = new Controller(mockInst, mockElement, {});
            controller.isOpen = true;
        });

        it('should set isOpen to false', () => {
            controller.close();
            expect(controller.isOpen).toBe(false);
        });

        it('should set display to none', () => {
            controller.close();
            expect(controller.form.style.display).toBe('none');
        });

        it('should not close if already closed', () => {
            controller.isOpen = false;
            const displayBefore = controller.form.style.display;
            controller.close();
            expect(controller.form.style.display).toBe(displayBefore);
        });
    });

    describe('Parameters', () => {
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
        });

        it('should handle position parameter', () => {
            const controller = new Controller(mockInst, mockElement, { position: 'top' });
            expect(controller.position).toBe('top');
        });

        it('should default to bottom position', () => {
            const controller = new Controller(mockInst, mockElement, {});
            expect(controller.position).toBe('bottom');
        });
    });

    describe('open method', () => {
        let controller;
        let mockElement;
        let mockTarget;

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

            mockTarget = {
                getBoundingClientRect: jest.fn().mockReturnValue({
                    top: 100,
                    left: 50,
                    bottom: 150,
                    right: 150,
                    width: 100,
                    height: 50
                })
            };

            mockEditor.opendControllers = [];
            mockEditor.currentControllerName = '';
            mockEditor.effectNode = null;
            mockEditor._controllerTargetContext = null;

            controller = new Controller(mockInst, mockElement, {});
        });

        it('should not throw when opening with target', () => {
            expect(() => {
                controller.open(mockTarget, mockTarget, {});
            }).not.toThrow();
        });

        it('should set currentPositionTarget', () => {
            controller.open(mockTarget, mockTarget, {});
            expect(controller.currentPositionTarget).toBe(mockTarget);
        });

        it('should not throw with disabled parameter', () => {
            expect(() => {
                controller.open(mockTarget, mockTarget, { disabled: true });
            }).not.toThrow();
        });

        it('should handle isWWTarget parameter', () => {
            controller.open(mockTarget, mockTarget, { isWWTarget: false });
            expect(controller.isWWTarget).toBe(false);
        });

        it('should not throw with addOffset parameter', () => {
            expect(() => {
                controller.open(mockTarget, mockTarget, { addOffset: { left: 10, top: 20 } });
            }).not.toThrow();
        });

        it('should use different position target', () => {
            const positionTarget = {
                getBoundingClientRect: jest.fn().mockReturnValue({
                    top: 200,
                    left: 100,
                    bottom: 250,
                    right: 200,
                    width: 100,
                    height: 50
                })
            };

            controller.open(mockTarget, positionTarget, {});
            expect(controller.currentPositionTarget).toBe(positionTarget);
        });
    });

    describe('show method', () => {
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

        it('should not throw when called', () => {
            expect(() => {
                controller.show();
            }).not.toThrow();
        });
    });

    describe('bringToTop method', () => {
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
                    zIndex: '10'
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

        it('should set toTop to true when passed truthy value', () => {
            controller.bringToTop(true);
            expect(controller.toTop).toBe(true);
        });

        it('should set toTop to false when passed falsy value', () => {
            controller.bringToTop(false);
            expect(controller.toTop).toBe(false);
        });

        it('should update zIndex style', () => {
            const initialZIndex = controller.form.style.zIndex;
            controller.bringToTop(true);
            expect(controller.form.style.zIndex).not.toBe(initialZIndex);
        });
    });

    describe('resetPosition method', () => {
        let controller;
        let mockElement;
        let mockTarget;

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

            mockTarget = {
                getBoundingClientRect: jest.fn().mockReturnValue({
                    top: 100,
                    left: 50,
                    bottom: 150,
                    right: 150,
                    width: 100,
                    height: 50
                })
            };

            controller = new Controller(mockInst, mockElement, {});
            controller.currentPositionTarget = mockTarget;
        });

        it('should not throw when called with target', () => {
            expect(() => {
                controller.resetPosition(mockTarget);
            }).not.toThrow();
        });

        it('should not throw when called without target', () => {
            expect(() => {
                controller.resetPosition();
            }).not.toThrow();
        });
    });
});