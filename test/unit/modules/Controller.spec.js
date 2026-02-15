/**
 * @fileoverview Unit tests for modules/Controller.js
 */

import Controller from '../../../src/modules/contract/Controller.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

/**
 * Create a real DOM element for testing
 */
function createMockElement() {
    const element = document.createElement('div');
    element.style.visibility = '';
    element.style.display = '';
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.zIndex = '';
    return element;
}

describe('Modules - Controller', () => {
    let mockInst;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        // Use createMockEditor for the $ deps bag pattern
        const kernel = createMockEditor();
        mockEditor = kernel;

        // Override with custom mocks as needed
        mockEditor.$ = {
            ...kernel.$,
            ui: {
                showController: jest.fn(),
                hideController: jest.fn(),
                setControllerOnDisabledButtons: jest.fn(),
                onControllerContext: jest.fn(),
                offControllerContext: jest.fn(),
                _visibleControllers: jest.fn(),
                opendControllers: [],
                currentControllerName: ''
            },
            selection: {
                getRangeElement: jest.fn(),
                isRange: jest.fn().mockReturnValue(false),
                ...kernel.$.selection
            },
            offset: {
                setRangePosition: jest.fn().mockReturnValue(true),
                setAbsPosition: jest.fn().mockReturnValue({ top: 0, left: 0 }),
                ...kernel.$.offset
            }
        };
        mockEditor.isBalloon = false;
        mockEditor.isSubBalloon = false;

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testController',
                name: 'TestController'
            }
        };
    });

    describe('Constructor', () => {
        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackController' }
            };
            const element = createMockElement();

            const controller = new Controller(instWithoutKey, mockEditor.$, element, {});
            expect(controller.kind).toBe('FallbackController');
        });
    });

    describe('Basic functionality', () => {
        let controller;

        beforeEach(() => {
            const element = createMockElement();
            controller = new Controller(mockInst, mockEditor.$, element, {});
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

        beforeEach(() => {
            const element = createMockElement();
            element.style.visibility = 'visible';
            element.style.display = 'block';
            controller = new Controller(mockInst, mockEditor.$, element, {});
        });

        it('should set display to none', () => {
            controller.hide();
            expect(controller.form.style.display).toBe('none');
        });
    });

    describe('close method', () => {
        let controller;

        beforeEach(() => {
            const element = createMockElement();
            element.style.visibility = 'visible';
            element.style.display = 'block';

            mockEditor.$.ui.opendControllers = [];
            mockEditor.$.ui.currentControllerName = 'testController';
            mockEditor.effectNode = null;
            mockEditor._preventBlur = true;
            mockEditor._controllerTargetContext = null;
            mockEditor.status = { onSelected: true };

            controller = new Controller(mockInst, mockEditor.$, element, {});
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
        it('should handle position parameter', () => {
            const element = createMockElement();
            const controller = new Controller(mockInst, mockEditor.$, element, { position: 'top' });
            expect(controller.position).toBe('top');
        });

        it('should default to bottom position', () => {
            const element = createMockElement();
            const controller = new Controller(mockInst, mockEditor.$, element, {});
            expect(controller.position).toBe('bottom');
        });
    });

    describe('open method', () => {
        let controller;
        let mockTarget;

        beforeEach(() => {
            const element = createMockElement();
            mockTarget = document.createElement('div');
            // Mock getBoundingClientRect
            Object.defineProperty(mockTarget, 'getBoundingClientRect', {
                value: jest.fn().mockReturnValue({
                    top: 100,
                    left: 50,
                    bottom: 150,
                    right: 150,
                    width: 100,
                    height: 50
                })
            });

            mockEditor.$.ui.opendControllers = [];
            mockEditor.$.ui.currentControllerName = '';
            mockEditor.effectNode = null;
            mockEditor._controllerTargetContext = null;

            controller = new Controller(mockInst, mockEditor.$, element, {});
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
            const positionTarget = document.createElement('div');
            Object.defineProperty(positionTarget, 'getBoundingClientRect', {
                value: jest.fn().mockReturnValue({
                    top: 200,
                    left: 100,
                    bottom: 250,
                    right: 200,
                    width: 100,
                    height: 50
                })
            });

            controller.open(mockTarget, positionTarget, {});
            expect(controller.currentPositionTarget).toBe(positionTarget);
        });
    });

    describe('show method', () => {
        let controller;

        beforeEach(() => {
            const element = createMockElement();
            controller = new Controller(mockInst, mockEditor.$, element, {});
        });

        it('should not throw when called', () => {
            expect(() => {
                controller.show();
            }).not.toThrow();
        });
    });

    describe('bringToTop method', () => {
        let controller;

        beforeEach(() => {
            const element = createMockElement();
            element.style.zIndex = '10';
            controller = new Controller(mockInst, mockEditor.$, element, {});
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
        let mockTarget;

        beforeEach(() => {
            const element = createMockElement();
            mockTarget = document.createElement('div');
            Object.defineProperty(mockTarget, 'getBoundingClientRect', {
                value: jest.fn().mockReturnValue({
                    top: 100,
                    left: 50,
                    bottom: 150,
                    right: 150,
                    width: 100,
                    height: 50
                })
            });

            controller = new Controller(mockInst, mockEditor.$, element, {});
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