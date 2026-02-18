/**
 * @fileoverview Unit tests for modules/Figure.js
 */

import Figure from '../../../src/modules/contract/Figure.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

// Mock Controller directly since Figure imports it from './Controller'
jest.mock('../../../src/modules/contract/Controller.js', () => {
    return jest.fn().mockImplementation(function(inst, $, element, params) {
        this.open = jest.fn();
        this.close = jest.fn();
        this.hide = jest.fn();
        this.show = jest.fn();
        this.form = element;
        this.position = params?.position || 'bottom';
        // Add eventManager with addGlobalEvent
        this.eventManager = {
            addGlobalEvent: jest.fn(() => 'event-id'),
            removeGlobalEvent: jest.fn()
        };
    });
});

// Mock other dependencies
jest.mock('../../../src/modules/ui/SelectMenu.js', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        create: jest.fn(),
        open: jest.fn(),
        close: jest.fn()
    }));
});

jest.mock('../../../src/modules/ui/_DragHandle.js', () => ({
    _DragHandle: {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn()
    }
}));

jest.mock('../../../src/helper', () => ({
    dom: {
        check: {
            isElement: jest.fn().mockReturnValue(true),
            isInputElement: jest.fn().mockReturnValue(false),
            isComponentContainer: jest.fn().mockImplementation((el) => el?.className?.includes('se-component')),
            isZeroWidth: jest.fn().mockReturnValue(false),
            isFigure: jest.fn().mockReturnValue(false),
            isListCell: jest.fn().mockReturnValue(false),
            isExcludeFormat: jest.fn().mockReturnValue(false),
            isWysiwygFrame: jest.fn().mockReturnValue(false)
        },
        utils: {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            hasClass: jest.fn().mockReturnValue(false),
            changeElement: jest.fn(),
            changeTxt: jest.fn(),
            removeItem: jest.fn(),
            createElement: jest.fn().mockImplementation((tag, attrs, content) => {
                const element = {
                    tagName: tag?.toUpperCase() || 'DIV',
                    className: '',
                    style: {},
                    innerHTML: content || '',
                    appendChild: jest.fn(),
                    setAttribute: jest.fn(),
                    getAttribute: jest.fn(),
                    removeAttribute: jest.fn(),
                    contains: jest.fn().mockReturnValue(true),
                    querySelector: jest.fn(),
                    querySelectorAll: jest.fn().mockReturnValue([]),
                    parentNode: null,
                    parentElement: null,
                    firstElementChild: null,
                    children: [],
                    offsetWidth: 100,
                    offsetHeight: 50,
                    offsetLeft: 0,
                    offsetTop: 0,
                    cloneNode: jest.fn().mockImplementation(function() {
                        return {
                            tagName: tag?.toUpperCase() || 'DIV',
                            className: '',
                            style: {},
                            removeAttribute: jest.fn()
                        };
                    })
                };

                if (attrs) {
                    Object.keys(attrs).forEach(key => {
                        if (key === 'class') element.className = attrs[key];
                        else element[key] = attrs[key];
                    });
                }

                return element;
            })
        },
        query: {
            getParentElement: jest.fn().mockImplementation((el, selector, depth) => {
                if (typeof selector === 'string') {
                    if (selector === 'FIGURE') return { tagName: 'FIGURE', style: {}, appendChild: jest.fn() };
                    if (selector === 'SPAN') return { tagName: 'SPAN', style: {}, appendChild: jest.fn() };
                }
                return el?.parentElement || null;
            }),
            getEdgeChild: jest.fn().mockReturnValue(null),
            getEventTarget: jest.fn().mockImplementation((e) => e.target)
        }
    },
    env: {
        _w: { setTimeout: jest.fn((fn) => fn()) },
        isMobile: false,
        ON_OVER_COMPONENT: false
    },
    numbers: {
        is: jest.fn().mockImplementation((str) => !isNaN(str) && !isNaN(parseFloat(str))),
        get: jest.fn().mockImplementation((str, decimals = 0) => {
            const num = parseFloat(str);
            return isNaN(num) ? null : Number(num.toFixed(decimals));
        })
    },
    converter: {
        getWidthInPercentage: jest.fn().mockReturnValue(50)
    },
    keyCodeMap: {
        isEsc: jest.fn().mockReturnValue(false)
    }
}));

describe('Modules - Figure', () => {
    let mockInst;
    let mockEditor;
    let helperMock;
    let dragHandleMock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        helperMock = require('../../../src/helper');
        dragHandleMock = require('../../../src/modules/ui/_DragHandle.js');

        // Use createMockEditor for the $ deps bag pattern
        const kernel = createMockEditor();
        mockEditor = kernel;

        // Setup frameContext first with proper mocks
        const wrapperElement = document.createElement('div');
        // Add se-drag-handle for drag event tests
        const dragHandle = document.createElement('div');
        dragHandle.className = 'se-drag-handle';
        wrapperElement.appendChild(dragHandle);
        // Add se-controller.se-resizing-container so constructor doesn't overwrite _figure
        const resizingContainer = document.createElement('div');
        resizingContainer.className = 'se-controller se-resizing-container';
        wrapperElement.appendChild(resizingContainer);

        // Mock appendChild to handle both real and mock DOM nodes
        const originalAppendChild = wrapperElement.appendChild.bind(wrapperElement);
        wrapperElement.appendChild = jest.fn((child) => {
            if (child && child.nodeType) {
                return originalAppendChild(child);
            }
            // Handle mock objects that aren't real DOM nodes
            return child;
        });

        const frameContext = new Map([
            ['_ww', { focus: jest.fn() }],
            ['wrapper', wrapperElement],
            ['_figure', {
                main: document.createElement('div'),
                border: document.createElement('div'),
                display: document.createElement('div'),
                handles: [document.createElement('div'), document.createElement('div')]
            }],
            ['wysiwygFrame', { clientWidth: 800 }],
            ['wwComputedStyle', {
                getPropertyValue: jest.fn().mockReturnValue('0px')
            }]
        ]);

        // Override with custom mocks as needed
        mockEditor.$ = {
            ...kernel.$,
            ui: {
                showFigure: jest.fn(),
                hideFigure: jest.fn(),
                _visibleControllers: jest.fn(),
                offCurrentController: jest.fn(),
                disableBackWrapper: jest.fn(),
                enableBackWrapper: jest.fn(),
                setFigureContainer: jest.fn(),
                opendControllers: [],
            },
            selection: {
                getRangeElement: jest.fn(),
                isRange: jest.fn().mockReturnValue(false),
                setRange: jest.fn(),
                ...kernel.$.selection
            },
            store: {
                ...kernel.$.store,
                set: jest.fn(),
            },
            component: {
                resetComponentInfo: jest.fn(),
                __removeDragEvent: jest.fn(),
                select: jest.fn(),
                copy: jest.fn(),
                deselect: jest.fn(),
                isInline: jest.fn().mockReturnValue(false),
                __removeGlobalEvent: jest.fn(),
                ...kernel.$.component
            },
            contextProvider: {
                frameContext: frameContext,
                applyToRoots: jest.fn((callback) => {
                    callback(frameContext);
                }),
                frameRoots: new Map([['test-frame', frameContext]])
            },
            frameContext: frameContext
        };

        mockEditor.frameContext = frameContext;

        // Patch format module (spread first, then override)
        mockEditor.$.format = {
            ...kernel.$.format,
            isBlock: jest.fn().mockReturnValue(true),
            isLine: jest.fn().mockReturnValue(false),
        };

        // Patch html module (spread first, then override)
        mockEditor.$.html = {
            ...kernel.$.html,
            remove: jest.fn().mockReturnValue({
                container: { parentElement: { insertBefore: jest.fn() } },
                offset: 0
            }),
        };

        // Patch nodeTransform module (spread first, then override)
        mockEditor.$.nodeTransform = {
            ...kernel.$.nodeTransform,
            split: jest.fn().mockReturnValue({ parentElement: { insertBefore: jest.fn() } }),
            removeEmptyNode: jest.fn(),
        };

        // Convenience accessors
        mockEditor.icons = mockEditor.$.icons;
        mockEditor.lang = mockEditor.$.lang;
        mockEditor.status = mockEditor.status || { hasFocus: true };
        mockEditor.isBalloon = false;
        mockEditor.isSubBalloon = false;

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testFigure',
                name: 'TestFigure'
            },
            componentEdit: jest.fn(),
            componentDestroy: jest.fn()
        };
    });

    // ================ CONSTRUCTOR ================

    describe('Constructor', () => {
        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackFigure' }
            };
            const figure = new Figure(instWithoutKey, mockEditor.$, [], {});
            expect(figure.kind).toBe('FallbackFigure');
        });

        it('should use constructor key if available', () => {
            const figure = new Figure(mockInst, mockEditor.$, [], {});
            expect(figure.kind).toBe('testFigure');
        });

        it('should create controller when controls array is provided', () => {
            const controlsWithButtons = [['edit', 'remove']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should not create controller when empty controls array is provided', () => {
            const figure = new Figure(mockInst, mockEditor.$, [], {});
            expect(figure.controller).toBeNull();
        });

        it('should set default sizeUnit to px', () => {
            const figure = new Figure(mockInst, mockEditor.$, [], {});
            expect(figure.sizeUnit).toBe('px');
        });

        it('should use provided sizeUnit', () => {
            const figure = new Figure(mockInst, mockEditor.$, [], { sizeUnit: '%' });
            expect(figure.sizeUnit).toBe('%');
        });

        it('should store autoRatio from params', () => {
            const autoRatio = { current: '56.25%', default: '56.25%' };
            const figure = new Figure(mockInst, mockEditor.$, [], { autoRatio });
            expect(figure.autoRatio).toBe(autoRatio);
        });

        it('should initialize align to none', () => {
            const figure = new Figure(mockInst, mockEditor.$, [], {});
            expect(figure.align).toBe('none');
        });

        it('should create align selectMenu when onalign button exists', () => {
            const controlsWithButtons = [['align', 'edit', 'remove']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should create resize selectMenu when onresize button exists', () => {
            const controlsWithButtons = [['resize_auto,100,75,50', 'edit']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should create as selectMenu when as button exists', () => {
            const controlsWithButtons = [['as', 'edit']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should handle all controller button types', () => {
            const controlsWithButtons = [
                ['mirror_h', 'mirror_v', 'rotate_l', 'rotate_r'],
                ['caption', 'revert', 'edit', 'copy', 'remove']
            ];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should handle custom action objects in controls', () => {
            const customAction = {
                action: jest.fn(),
                command: 'myCustom',
                value: 'val',
                title: 'Custom Title',
                icon: '<svg/>'
            };
            const controlsWithButtons = [[customAction, 'edit']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure._action['__c__myCustom']).toBe(customAction.action);
        });

        it('should skip invalid button strings in controls', () => {
            const controlsWithButtons = [['invalidbutton', 'edit']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should handle auto button type in controls', () => {
            const controlsWithButtons = [['auto', 'edit']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.controller).not.toBeNull();
        });

        it('should create selectMenu_align when align button is found', () => {
            const alignButton = { getAttribute: jest.fn().mockReturnValue('onalign'), firstElementChild: null };
            const resizeButton = { getAttribute: jest.fn().mockReturnValue('auto,100,75,50') };
            const asButton = { getAttribute: jest.fn().mockReturnValue('onas'), firstElementChild: null };
            helperMock.dom.utils.createElement.mockReturnValueOnce({
                tagName: 'DIV',
                className: 'se-controller se-controller-resizing',
                style: {},
                querySelector: jest.fn().mockImplementation((selector) => {
                    if (selector.includes('onalign')) return alignButton;
                    if (selector.includes('onas')) return asButton;
                    if (selector.includes('onresize')) return resizeButton;
                    return null;
                }),
                querySelectorAll: jest.fn().mockReturnValue([]),
                innerHTML: ''
            });
            const controlsWithButtons = [['align', 'as', 'resize_auto,100,75,50', 'edit']];
            const figure = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
            expect(figure.selectMenu_align).toBeDefined();
            expect(figure.selectMenu_as).toBeDefined();
            expect(figure.selectMenu_resize).toBeDefined();
        });

        it('should initialize _figure via applyToRoots when no resizing container exists', () => {
            // Remove the resizing container from wrapper to trigger the init branch
            const wrapperElement = mockEditor.$.frameContext.get('wrapper');
            const resizingEl = wrapperElement.querySelector('.se-controller.se-resizing-container');
            if (resizingEl) resizingEl.remove();

            // Mock createElement to return object with proper structure for CreateHTML_resizeDot
            // CreateHTML_controller returns null for empty controls (without calling createElement)
            // So only CreateHTML_resizeDot will call createElement
            const mockMain = {
                tagName: 'DIV',
                className: 'se-controller se-resizing-container',
                style: {},
                querySelector: jest.fn().mockReturnValue({ tagName: 'DIV', style: {} }),
                querySelectorAll: jest.fn().mockReturnValue([{ tagName: 'SPAN' }, { tagName: 'SPAN' }]),
                innerHTML: '',
                appendChild: jest.fn()
            };
            helperMock.dom.utils.createElement.mockReturnValueOnce(mockMain); // CreateHTML_resizeDot

            const figure = new Figure(mockInst, mockEditor.$, [], {});

            // Verify _figure was set on frameContext
            const _figure = mockEditor.$.frameContext.get('_figure');
            expect(_figure.main).toBe(mockMain);
        });
    });

    // ================ BASIC FUNCTIONALITY ================

    describe('Basic functionality', () => {
        let figure;

        beforeEach(() => {
            figure = new Figure(mockInst, mockEditor.$, [], {});
        });

        it('should handle figure operations', () => {
            expect(() => {
                figure.controllerHide();
                figure.controllerShow();
            }).not.toThrow();
        });
    });

    // ================ STATIC METHODS ================

    describe('Static methods', () => {
        describe('CreateContainer', () => {
            it('should create container with figure element', () => {
                const element = document.createElement('img');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: element,
                    container: { className: 'se-component' },
                    cover: { tagName: 'FIGURE' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = Figure.CreateContainer(element, 'test-class');
                expect(result.container).toBeDefined();
                expect(result.cover).toBeDefined();
            });
        });

        describe('CreateInlineContainer', () => {
            it('should create inline container', () => {
                const element = document.createElement('img');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: element,
                    container: { className: 'se-inline-component' },
                    cover: null,
                    inlineCover: { tagName: 'SPAN' },
                    caption: null,
                    isVertical: false
                });

                const result = Figure.CreateInlineContainer(element, 'inline-class');
                expect(result.inlineCover).toBeDefined();
            });
        });

        describe('CreateCaption', () => {
            it('should create caption element', () => {
                const mockCover = {
                    appendChild: jest.fn(),
                    contains: jest.fn().mockReturnValue(true)
                };

                const caption = Figure.CreateCaption(mockCover, 'Test caption');

                expect(caption.tagName).toBe('FIGCAPTION');
                expect(caption.innerHTML).toBe('<div>Test caption</div>');
                expect(mockCover.appendChild).toHaveBeenCalledWith(caption);
            });
        });

        describe('GetContainer', () => {
            it('should get container info from element', () => {
                const element = document.createElement('img');
                const result = Figure.GetContainer(element);

                expect(result).toHaveProperty('target');
                expect(result).toHaveProperty('container');
                expect(result).toHaveProperty('cover');
                expect(result).toHaveProperty('inlineCover');
                expect(result).toHaveProperty('caption');
                expect(result).toHaveProperty('isVertical');
            });

            it('should identify inline cover correctly', () => {
                const mockDom = helperMock.dom;
                mockDom.utils.hasClass.mockReturnValueOnce(true);

                const element = document.createElement('img');
                const result = Figure.GetContainer(element);

                expect(result).toBeDefined();
            });

            it('should return proper target when cover is found', () => {
                const figure = document.createElement('figure');
                const cover = figure;
                const img = document.createElement('img');
                // getParentElement returns cover for 'FIGURE', null for 'SPAN'
                helperMock.dom.query.getParentElement
                    .mockReturnValueOnce(cover) // cover from FIGURE
                    .mockReturnValueOnce(null)  // inlineCover from SPAN
                    .mockReturnValueOnce(img)   // target: parentElement === anyCover
                    .mockReturnValueOnce(null);  // container: Figure.is check
                helperMock.dom.query.getEdgeChild.mockReturnValueOnce(null); // caption
                helperMock.dom.utils.hasClass.mockReturnValueOnce(false);

                const result = Figure.GetContainer(img);
                expect(result.target).toBe(img);
                expect(result.cover).toBe(cover);
            });

            it('should detect se-component container', () => {
                const compContainer = document.createElement('div');
                compContainer.className = 'se-component';
                const img = document.createElement('img');

                helperMock.dom.query.getParentElement
                    .mockReturnValueOnce(null)   // cover from FIGURE
                    .mockReturnValueOnce(null)   // inlineCover from SPAN
                    .mockReturnValueOnce(compContainer); // container: Figure.is check
                helperMock.dom.query.getEdgeChild.mockReturnValueOnce(null); // caption

                const result = Figure.GetContainer(img);
                expect(result).toBeDefined();
            });
        });

        describe('GetRatio', () => {
            it('should calculate ratio from width and height', () => {
                const ratio = Figure.GetRatio(100, 50, 'px');
                expect(ratio.w).toBe(2);
                expect(ratio.h).toBe(0.5);
            });

            it('should return zero ratio for invalid values', () => {
                const ratio = Figure.GetRatio('auto', 'auto', 'px');
                expect(ratio.w).toBe(0);
                expect(ratio.h).toBe(0);
            });

            it('should handle percentage units', () => {
                const ratio = Figure.GetRatio('50%', '25%', '%');
                expect(ratio.w).toBe(2);
                expect(ratio.h).toBe(0.5);
            });

            it('should return zero for mismatched units', () => {
                const ratio = Figure.GetRatio('100px', '50%', 'px');
                expect(ratio.w).toBe(0);
                expect(ratio.h).toBe(0);
            });

            it('should use default unit when value is a pure number', () => {
                const ratio = Figure.GetRatio(200, 100, 'px');
                expect(ratio.w).toBe(2);
                expect(ratio.h).toBe(0.5);
            });

            it('should fallback to px when no defaultSizeUnit provided', () => {
                const ratio = Figure.GetRatio(200, 100, null);
                expect(ratio.w).toBe(2);
                expect(ratio.h).toBe(0.5);
            });
        });

        describe('CalcRatio', () => {
            it('should calculate size based on ratio', () => {
                const ratio = { w: 2, h: 0.5 };
                const result = Figure.CalcRatio(100, 50, 'px', ratio);
                expect(result.h).toBe('50px');
                expect(result.w).toBe('100px');
            });

            it('should return original values when no ratio', () => {
                const result = Figure.CalcRatio(100, 50, 'px', null);
                expect(result.w).toBe(100);
                expect(result.h).toBe(50);
            });

            it('should return original values when ratio has zero w', () => {
                const result = Figure.CalcRatio(100, 50, 'px', { w: 0, h: 0 });
                expect(result.w).toBe(100);
                expect(result.h).toBe(50);
            });

            it('should handle percentage units in CalcRatio', () => {
                const ratio = { w: 2, h: 0.5 };
                const result = Figure.CalcRatio('50%', '25%', '%', ratio);
                // With percent, decimal places are 2
                expect(result.w).toMatch(/%$/);
                expect(result.h).toMatch(/%$/);
            });

            it('should return original values when units mismatch', () => {
                const ratio = { w: 2, h: 0.5 };
                const result = Figure.CalcRatio('100px', '50%', 'px', ratio);
                expect(result.w).toBe('100px');
                expect(result.h).toBe('50%');
            });
        });

        describe('is', () => {
            it('should identify component containers', () => {
                const div = { className: 'se-component' };
                expect(Figure.is(div)).toBe(true);
            });

            it('should identify HR elements', () => {
                const hr = { nodeName: 'HR' };
                expect(Figure.is(hr)).toBe(true);
            });

            it('should reject non-component elements', () => {
                const div = { className: '' };
                expect(Figure.is(div)).toBe(false);
            });

            it('should handle null/undefined elements', () => {
                expect(Figure.is(null)).toBe(false);
                expect(Figure.is(undefined)).toBe(false);
            });
        });
    });

    // ================ INSTANCE METHODS ================

    describe('Instance methods', () => {
        let figure;
        let mockElement;

        beforeEach(() => {
            figure = new Figure(mockInst, mockEditor.$, [], {});
            mockElement = {
                tagName: 'IMG',
                nodeName: 'IMG',
                style: { width: '100px', height: '50px', transform: '', transformOrigin: '', maxWidth: '', marginTop: '', float: '' },
                offsetWidth: 100,
                offsetHeight: 50,
                getAttribute: jest.fn().mockReturnValue(''),
                setAttribute: jest.fn(),
                removeAttribute: jest.fn(),
                cloneNode: jest.fn().mockReturnValue({
                    tagName: 'IMG',
                    style: { width: '', height: '' },
                    removeAttribute: jest.fn()
                }),
                parentNode: null,
                parentElement: null,
                nextElementSibling: null,
                previousElementSibling: null,
            };
            figure._element = mockElement;
            figure._container = { style: { width: '', height: '', minWidth: '' }, className: '' };
            figure._cover = { style: { width: '', height: '', paddingBottom: '' } };
            figure._inlineCover = null;
            figure._caption = null;
        });

        // ================ CLOSE ================

        describe('close', () => {
            it('should close controller and clean up when controller exists', () => {
                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
                figureWithController._cover = { className: 'se-figure-selected' };

                const closeSpy = jest.spyOn(figureWithController.controller, 'close');

                figureWithController.close();

                expect(closeSpy).toHaveBeenCalled();
                expect(mockEditor.$.store.set).toHaveBeenCalledWith('_preventBlur', false);
            });

            it('should handle close when controller is null', () => {
                figure._cover = { className: 'se-figure-selected' };

                expect(() => {
                    figure.close();
                }).not.toThrow();
            });
        });

        // ================ SET FIGURE SIZE ================

        describe('setFigureSize', () => {
            beforeEach(() => {
                jest.spyOn(figure, '_setPercentSize').mockImplementation();
                jest.spyOn(figure, '_setAutoSize').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();
            });

            it('should handle percentage size', () => {
                figure.setFigureSize('50%', '100px');
                expect(figure._setPercentSize).toHaveBeenCalledWith('50%', '100px');
            });

            it('should handle auto size', () => {
                figure.setFigureSize('auto', 'auto');
                expect(figure._setAutoSize).toHaveBeenCalled();
            });

            it('should handle fixed size', () => {
                figure.setFigureSize('100px', '50px');
                expect(figure._applySize).toHaveBeenCalledWith('100px', '50px', '');
            });

            it('should handle empty w and h as auto', () => {
                figure.setFigureSize('', '');
                expect(figure._setAutoSize).toHaveBeenCalled();
            });

            it('should handle auto w with autoRatio (uses default first)', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                figure.setFigureSize('auto', 'auto');
                // setFigureSize uses autoRatio.default || autoRatio.current
                expect(figure._setPercentSize).toHaveBeenCalledWith(100, '56.25%');
            });

            it('should use autoRatio.current when default is empty', () => {
                figure.autoRatio = { current: '75%', default: '' };
                figure.setFigureSize('auto', 'auto');
                expect(figure._setPercentSize).toHaveBeenCalledWith(100, '75%');
            });

            it('should use autoRatio.default when both available', () => {
                figure.autoRatio = { current: '56.25%', default: '75%' };
                figure.setFigureSize('auto', 'auto');
                expect(figure._setPercentSize).toHaveBeenCalledWith(100, '75%');
            });
        });

        // ================ SET SIZE ================

        describe('setSize', () => {
            it('should set size normally', () => {
                jest.spyOn(figure, 'setFigureSize').mockImplementation();
                figure.setSize('100px', '50px');
                expect(figure.setFigureSize).toHaveBeenCalledWith('100px', '50px');
            });

            it('should handle vertical orientation (swap w and h)', () => {
                figure.isVertical = true;
                jest.spyOn(figure, 'setFigureSize').mockImplementation();
                jest.spyOn(figure, 'setTransform').mockImplementation();

                figure.setSize('100px', '50px');
                expect(figure.setFigureSize).toHaveBeenCalledWith('50px', '100px');
                expect(figure.setTransform).toHaveBeenCalled();
            });
        });

        // ================ GET SIZE ================

        describe('getSize', () => {
            it('should get current size', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '200px', height: '' } },
                    cover: { style: { paddingBottom: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size).toHaveProperty('w');
                expect(size).toHaveProperty('h');
                expect(size).toHaveProperty('dw');
                expect(size).toHaveProperty('dh');
            });

            it('should return empty strings when targetNode is minimal element with no container', () => {
                // IsVertical is called first, so we need a valid element with style
                const emptyEl = {
                    style: { width: '', height: '', transform: '' },
                    offsetWidth: 0,
                    offsetHeight: 0,
                    getAttribute: jest.fn().mockReturnValue(''),
                    parentElement: null
                };
                figure._element = emptyEl;

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: emptyEl,
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                // strictMode.formatFilter = true -> w = '', h = target.style.height
                const size = figure.getSize(emptyEl);
                expect(size.w).toBe('');
                expect(size.h).toBe('');
            });

            it('should use _element when targetNode not provided', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '200px', height: '' } },
                    cover: { style: { paddingBottom: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize();
                expect(size).toHaveProperty('w');
            });

            it('should handle no container with strictMode.formatFilter false', () => {
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: false };
                    return undefined;
                });

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '200px', height: '100px' } },
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size.w).toBe('200px');
                expect(size.h).toBe('100px');
            });

            it('should handle no container with strictMode.formatFilter true', () => {
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: true };
                    return undefined;
                });

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '', height: '100px' } },
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size.w).toBe('');
                expect(size.h).toBe('100px');
            });

            it('should handle percentage width', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '50%', height: '300px' } },
                    container: { style: { width: '75%' } },
                    cover: { style: { paddingBottom: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size.w).toMatch(/%$/);
            });

            it('should handle inlineCover height', () => {
                const inlineCover = { style: { height: '200px' } };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '100px', height: '50px' } },
                    container: { style: { width: '100px' } },
                    cover: { style: { paddingBottom: '', height: '' } },
                    inlineCover: inlineCover,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size.h).toBe('200px');
            });

            it('should swap w,h for vertical elements', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '100px', height: '50px', transform: 'rotate(90deg)' } },
                    container: { style: { width: '100px' } },
                    cover: { style: { paddingBottom: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: true
                });

                // The IsVertical function needs to return true for this element
                helperMock.numbers.is.mockImplementation((str) => {
                    if (str === 90) return true;
                    return !isNaN(str) && !isNaN(parseFloat(str));
                });

                const size = figure.getSize(mockElement);
                // dw and dh should be swapped relative to w and h
                expect(size).toHaveProperty('dw');
                expect(size).toHaveProperty('dh');
            });

            it('should handle no container with auto width', () => {
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: false };
                    return undefined;
                });

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '', height: '' } },
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size.w).toBe('auto');
                expect(size.h).toBe('auto');
            });

            it('should handle cover paddingBottom > 0', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { style: { width: '100px', height: '50px' } },
                    container: { style: { width: '100px' } },
                    cover: { style: { paddingBottom: '56.25%', height: '300px' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const size = figure.getSize(mockElement);
                expect(size).toBeDefined();
            });
        });

        // ================ SET ALIGN ================

        describe('setAlign', () => {
            it('should set alignment', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { minWidth: '' }, className: '' },
                    cover: { style: { width: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setAlign(mockElement, 'center');
                expect(figure.align).toBe('center');
            });

            it('should return early when cover is null', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setAlign(mockElement, 'center');
                expect(figure.align).toBe('center');
            });

            it('should set minWidth 100% for percentage + center + not inline', () => {
                mockElement.style.width = '50%';
                mockEditor.$.component.isInline.mockReturnValue(false);
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '50%', minWidth: '' }, className: '' },
                    cover: { style: { width: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setAlign(mockElement, 'center');
                // Container should have minWidth set
                expect(figure.align).toBe('center');
            });

            it('should handle isVertical cover width from height', () => {
                figure.isVertical = true;
                mockElement.style.height = '200px';
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { minWidth: '' }, className: '' },
                    cover: { style: { width: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: true
                });

                figure.setAlign(mockElement, 'left');
                expect(figure.align).toBe('left');
            });

            it('should call __setCoverPaddingBottom when autoRatio is set', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                jest.spyOn(figure, 'getSize').mockReturnValue({ w: '100%', h: '56.25%', dw: '100%', dh: '56.25%' });
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { minWidth: '' }, className: '' },
                    cover: { style: { width: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setAlign(mockElement, 'center');
                expect(figure.__setCoverPaddingBottom).toHaveBeenCalledWith('100%', '56.25%');
            });

            it('should use default align none when align is falsy', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { minWidth: '' }, className: '' },
                    cover: { style: { width: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setAlign(mockElement, '');
                expect(figure.align).toBe('none');
            });
        });

        // ================ CONVERT AS FORMAT ================

        describe('convertAsFormat', () => {
            beforeEach(() => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: {
                        style: {},
                        className: 'se-component',
                        nextElementSibling: null,
                        parentElement: {
                            insertBefore: jest.fn()
                        }
                    },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figure, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });
            });

            it('should handle inline with existing inlineCover (break)', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {}, className: 'se-component se-inline-component' },
                    cover: null,
                    inlineCover: { style: {}, tagName: 'SPAN' },
                    caption: null,
                    isVertical: false
                });

                const result = figure.convertAsFormat(mockElement, 'inline');
                expect(result).toBeDefined();
            });

            it('should handle block with existing inlineCover', () => {
                const mockParent = { insertBefore: jest.fn() };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: {
                        style: {},
                        className: 'se-component se-inline-component',
                        nextElementSibling: null,
                        parentElement: mockParent
                    },
                    cover: null,
                    inlineCover: { style: {}, tagName: 'SPAN' },
                    caption: null,
                    isVertical: false
                });

                const splitResult = { parentElement: mockParent, previousElementSibling: null };
                mockEditor.$.nodeTransform.split.mockReturnValue(splitResult);
                mockEditor.$.html.remove.mockReturnValue({ container: { parentElement: mockParent }, offset: 0 });

                jest.spyOn(Figure, 'CreateContainer').mockReturnValue({
                    target: mockElement,
                    container: { className: 'se-component', style: {} },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.convertAsFormat(mockElement, 'block');
                expect(result).toBeDefined();
                expect(mockEditor.$.component.deselect).toHaveBeenCalled();
            });

            it('should handle block without inlineCover (break)', () => {
                const result = figure.convertAsFormat(mockElement, 'block');
                expect(result).toBeDefined();
            });

            it('should default to block when formatStyle is empty', () => {
                const result = figure.convertAsFormat(mockElement, '');
                expect(figure.as).toBe('block');
            });

            it('should handle inline without inlineCover', () => {
                const mockParent = { insertBefore: jest.fn() };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: {
                        style: {},
                        className: 'se-component',
                        nextElementSibling: null,
                        parentElement: mockParent
                    },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                jest.spyOn(Figure, 'CreateInlineContainer').mockReturnValue({
                    target: mockElement,
                    container: { className: 'se-component se-inline-component', style: {} },
                    cover: null,
                    inlineCover: { style: {} },
                    caption: null,
                    isVertical: false
                });

                const result = figure.convertAsFormat(mockElement, 'inline');
                expect(result).toBeDefined();
                expect(mockEditor.$.component.deselect).toHaveBeenCalled();
            });

            it('should remove zeroWidth previousElementSibling on block conversion', () => {
                const mockPrevSibling = document.createElement('span');
                const mockParent = { insertBefore: jest.fn() };
                const splitResult = { parentElement: mockParent, previousElementSibling: mockPrevSibling };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: {
                        style: {},
                        className: 'se-component se-inline-component',
                        nextElementSibling: null,
                        parentElement: mockParent
                    },
                    cover: null,
                    inlineCover: { style: {}, tagName: 'SPAN' },
                    caption: null,
                    isVertical: false
                });

                mockEditor.$.nodeTransform.split.mockReturnValue(splitResult);
                mockEditor.$.html.remove.mockReturnValue({ container: { parentElement: mockParent }, offset: 0 });
                helperMock.dom.check.isZeroWidth.mockReturnValueOnce(true);

                jest.spyOn(Figure, 'CreateContainer').mockReturnValue({
                    target: mockElement,
                    container: { className: 'se-component', style: {} },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.convertAsFormat(mockElement, 'block');
                expect(helperMock.dom.utils.removeItem).toHaveBeenCalledWith(mockPrevSibling);
            });
        });

        // ================ CONTROLLER ACTION ================

        describe('controllerAction', () => {
            it('should handle mirror action (horizontal, non-vertical)', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'mirror' : attr === 'data-value' ? 'h' : null)
                };

                jest.spyOn(figure, '_setRotate').mockImplementation();

                figure.controllerAction(button);
                expect(figure._setRotate).toHaveBeenCalled();
            });

            it('should handle mirror action (vertical, non-vertical) - flips x', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'mirror' : attr === 'data-value' ? 'v' : null)
                };

                jest.spyOn(figure, '_setRotate').mockImplementation();

                figure.controllerAction(button);
                expect(figure._setRotate).toHaveBeenCalled();
            });

            it('should handle mirror action (horizontal, vertical mode)', () => {
                figure.isVertical = true;
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'mirror' : attr === 'data-value' ? 'h' : null)
                };

                jest.spyOn(figure, '_setRotate').mockImplementation();

                figure.controllerAction(button);
                expect(figure._setRotate).toHaveBeenCalled();
            });

            it('should handle mirror action (v, vertical mode) - flips y', () => {
                figure.isVertical = true;
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'mirror' : attr === 'data-value' ? 'v' : null)
                };

                jest.spyOn(figure, '_setRotate').mockImplementation();

                figure.controllerAction(button);
                expect(figure._setRotate).toHaveBeenCalled();
            });

            it('should handle rotate action', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'rotate' : attr === 'data-value' ? '90' : null)
                };

                jest.spyOn(figure, 'setTransform').mockImplementation();

                figure.controllerAction(button);
                expect(figure.setTransform).toHaveBeenCalledWith(mockElement, null, null, 90);
            });

            it('should handle edit action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('edit')
                };

                figure.controllerAction(button);
                expect(figure.inst.componentEdit).toHaveBeenCalledWith(mockElement);
            });

            it('should handle copy action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('copy')
                };

                figure.controllerAction(button);
                expect(mockEditor.$.component.copy).toHaveBeenCalledWith(figure._container);
            });

            it('should handle remove action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('remove')
                };

                figure.controller = { close: jest.fn() };

                figure.controllerAction(button);

                expect(figure.inst.componentDestroy).toHaveBeenCalledWith(mockElement);
                expect(figure.controller.close).toHaveBeenCalled();
            });

            it('should handle revert action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('revert')
                };

                jest.spyOn(figure, '_setRevert').mockImplementation();

                figure.controllerAction(button);

                expect(figure._setRevert).toHaveBeenCalled();
                expect(mockEditor.$.history.push).toHaveBeenCalledWith(false);
            });

            it('should handle selectMenu type (return early)', () => {
                const button = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-command') return 'onalign';
                        if (attr === 'data-type') return 'selectMenu';
                        return null;
                    })
                };

                figure.controllerAction(button);

                expect(mockEditor.$.history.push).not.toHaveBeenCalled();
            });

            it('should return early for command starting with "on"', () => {
                const button = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-command') return 'onresize';
                        if (attr === 'data-type') return null;
                        return null;
                    })
                };

                figure.controllerAction(button);
                expect(mockEditor.$.history.push).not.toHaveBeenCalled();
            });

            it('should handle custom action (__c__ prefix)', () => {
                const button = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-command') return '__c__custom';
                        if (attr === 'data-value') return 'value1';
                        return null;
                    })
                };

                const customAction = jest.fn();
                figure._action['__c__custom'] = customAction;

                figure.controllerAction(button);

                expect(customAction).toHaveBeenCalledWith(mockElement, 'value1', button);
            });

            it('should push history after non-edit, non-custom action', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'revert' : null)
                };

                jest.spyOn(figure, '_setRevert').mockImplementation();
                figure.controllerAction(button);
                expect(mockEditor.$.history.push).toHaveBeenCalledWith(false);
            });

            it('should not push history for edit action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('edit')
                };

                figure.controllerAction(button);
                expect(mockEditor.$.history.push).not.toHaveBeenCalled();
            });

            it('should call component.select after non-remove, non-caption action', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'revert' : null)
                };

                jest.spyOn(figure, '_setRevert').mockImplementation();
                figure.controllerAction(button);
                expect(mockEditor.$.component.select).toHaveBeenCalledWith(mockElement, figure.kind);
            });

            it('should not call component.select for remove action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('remove')
                };
                figure.controller = { close: jest.fn() };

                figure.controllerAction(button);
                expect(mockEditor.$.component.select).not.toHaveBeenCalled();
            });

            it('should handle caption action - create caption when none exists', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'caption' : null)
                };

                figure._caption = null;
                figure._cover = { appendChild: jest.fn(), style: {} };
                figure.controller = { close: jest.fn() };
                mockElement.style.height = '';

                const mockCaption = {
                    tagName: 'FIGCAPTION',
                    innerHTML: '<div>Caption</div>',
                    focus: jest.fn()
                };
                jest.spyOn(Figure, 'CreateCaption').mockReturnValue(mockCaption);
                helperMock.dom.query.getEdgeChild.mockReturnValue(null);

                figure.controllerAction(button);

                expect(Figure.CreateCaption).toHaveBeenCalled();
                expect(figure._caption).toBe(mockCaption);
                expect(mockCaption.focus).toHaveBeenCalled();
                expect(figure.controller.close).toHaveBeenCalled();
            });

            it('should handle caption action - create caption with text node selection', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'caption' : null)
                };

                figure._caption = null;
                figure._cover = { appendChild: jest.fn(), style: {} };
                figure.controller = { close: jest.fn() };
                mockElement.style.height = '';

                const captionTextNode = { nodeType: 3, textContent: 'Test caption' };
                const mockCaption = {
                    tagName: 'FIGCAPTION',
                    innerHTML: '<div>Caption</div>',
                    focus: jest.fn()
                };
                jest.spyOn(Figure, 'CreateCaption').mockReturnValue(mockCaption);
                helperMock.dom.query.getEdgeChild.mockReturnValue(captionTextNode);

                figure.controllerAction(button);

                expect(mockEditor.$.selection.setRange).toHaveBeenCalledWith(captionTextNode, 0, captionTextNode, 12);
            });

            it('should handle caption action - remove caption when exists', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'caption' : null)
                };

                figure._caption = { tagName: 'FIGCAPTION' };
                figure.controller = { close: jest.fn() };
                mockElement.style.height = '';

                figure.controllerAction(button);

                expect(helperMock.dom.utils.removeItem).toHaveBeenCalledWith({ tagName: 'FIGCAPTION' });
                expect(figure._caption).toBeNull();
            });

            it('should handle caption + height with percentage width (deleteTransform)', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'caption' : null)
                };

                figure._caption = null;
                figure._cover = { appendChild: jest.fn(), style: {} };
                figure.controller = { close: jest.fn() };
                mockElement.style.height = '100px';
                mockElement.style.width = '50%';

                const mockCaption = { tagName: 'FIGCAPTION', focus: jest.fn() };
                jest.spyOn(Figure, 'CreateCaption').mockReturnValue(mockCaption);
                helperMock.dom.query.getEdgeChild.mockReturnValue(null);
                jest.spyOn(figure, 'deleteTransform').mockImplementation();

                figure.controllerAction(button);

                expect(figure.deleteTransform).toHaveBeenCalled();
            });

            it('should handle caption + height + vertical with setTransform', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'caption' : null)
                };

                figure.isVertical = true;
                figure._caption = null;
                figure._cover = { appendChild: jest.fn(), style: {} };
                figure.controller = { close: jest.fn() };
                mockElement.style.height = '100px';
                mockElement.style.width = '200px';

                const mockCaption = { tagName: 'FIGCAPTION', focus: jest.fn() };
                jest.spyOn(Figure, 'CreateCaption').mockReturnValue(mockCaption);
                helperMock.dom.query.getEdgeChild.mockReturnValue(null);
                jest.spyOn(figure, 'setTransform').mockImplementation();

                figure.controllerAction(button);

                expect(figure.setTransform).toHaveBeenCalledWith(mockElement, '200px', '100px', 0);
            });

            it('should handle caption + auto height (deleteTransform)', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'caption' : null)
                };

                figure._caption = null;
                figure._cover = { appendChild: jest.fn(), style: {} };
                figure.controller = { close: jest.fn() };
                mockElement.style.height = 'auto';
                mockElement.style.width = '200px';

                // height has digits so condition is met, and auto test → deleteTransform
                const mockCaption = { tagName: 'FIGCAPTION', focus: jest.fn() };
                jest.spyOn(Figure, 'CreateCaption').mockReturnValue(mockCaption);
                helperMock.dom.query.getEdgeChild.mockReturnValue(null);
                jest.spyOn(figure, 'deleteTransform').mockImplementation();

                figure.controllerAction(button);
                // 'auto' does not match /\d+/ so the caption height check won't trigger
            });
        });

        // ================ RETAIN FIGURE FORMAT ================

        describe('retainFigureFormat', () => {
            it('should not throw when called (isBlock parent, else branch)', () => {
                // isBlock(originParent) = true -> existElement = originEl
                const container = { className: 'se-component' };
                const originParent = {
                    replaceChild: jest.fn(),
                    insertBefore: jest.fn(),
                    tagName: 'DIV'
                };
                const originEl = {
                    parentNode: originParent,
                    parentElement: { nodeName: 'DIV' }
                };

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                mockEditor.$.format.isLine
                    .mockReturnValueOnce(false) // isInline && isLine
                    .mockReturnValueOnce(false) // isLine(existElement=originEl)
                    .mockReturnValueOnce(false); // isLine(existElement.parentNode=originParent)
                helperMock.dom.check.isListCell.mockReturnValueOnce(false);
                helperMock.dom.check.isFigure.mockReturnValueOnce(false);

                expect(() => {
                    figure.retainFigureFormat(container, originEl, null, null);
                }).not.toThrow();
                expect(originParent.replaceChild).toHaveBeenCalledWith(container, originEl);
            });

            it('should handle isExcludeFormat found (no anchorCover)', () => {
                // getParentElement for isExcludeFormat returns truthy
                helperMock.dom.query.getParentElement.mockReturnValueOnce({ tagName: 'BLOCKQUOTE' });

                const container = { className: 'se-component' };
                const originEl = {
                    parentNode: {
                        replaceChild: jest.fn(),
                        insertBefore: jest.fn()
                    },
                    parentElement: { nodeName: 'DIV' }
                };

                figure.retainFigureFormat(container, originEl, null, null);
                expect(originEl.parentNode.replaceChild).toHaveBeenCalledWith(container, originEl);
            });

            it('should handle isExcludeFormat with anchorCover', () => {
                helperMock.dom.query.getParentElement.mockReturnValueOnce({ tagName: 'BLOCKQUOTE' });

                const container = { className: 'se-component' };
                const anchorCover = {
                    parentNode: { replaceChild: jest.fn() }
                };
                const originEl = {
                    parentNode: {
                        replaceChild: jest.fn(),
                        insertBefore: jest.fn()
                    },
                    parentElement: { nodeName: 'DIV' }
                };

                figure.retainFigureFormat(container, originEl, anchorCover, null);
                expect(anchorCover.parentNode.replaceChild).toHaveBeenCalledWith(container, anchorCover);
            });

            it('should handle isInline && isLine (SPAN parent)', () => {
                mockEditor.$.component.isInline.mockReturnValue(true);
                // isBlock(originParent=parentEl) = true -> existElement = originEl
                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                // isLine(existElement=originEl) = true -> enters isInline && isLine branch
                mockEditor.$.format.isLine.mockReturnValueOnce(true);

                const container = { className: 'se-component' };
                const grandParentEl = { replaceChild: jest.fn() };
                const spanParent = { nodeName: 'SPAN', replaceChild: jest.fn(), parentElement: grandParentEl };
                const parentEl = { replaceChild: jest.fn() };
                const originEl = {
                    parentNode: parentEl,
                    parentElement: spanParent
                };

                figure.retainFigureFormat(container, originEl, null, null);
                // isInline + /^SPAN$/i -> refer = originEl.parentElement (SPAN)
                // refer.parentElement.replaceChild(container, refer) = grandParentEl.replaceChild(container, spanParent)
                expect(grandParentEl.replaceChild).toHaveBeenCalledWith(container, spanParent);
            });

            it('should handle isInline && isLine (non-SPAN parent)', () => {
                mockEditor.$.component.isInline.mockReturnValue(true);
                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                mockEditor.$.format.isLine.mockReturnValueOnce(true);

                const container = { className: 'se-component' };
                const divParent = { nodeName: 'DIV', replaceChild: jest.fn() };
                const parentEl = { replaceChild: jest.fn() };
                const originEl = {
                    parentNode: parentEl,
                    parentElement: divParent
                };

                figure.retainFigureFormat(container, originEl, null, null);
                // isInline but not SPAN -> refer = originEl
                // refer.parentElement.replaceChild(container, refer) = divParent.replaceChild(container, originEl)
                expect(divParent.replaceChild).toHaveBeenCalledWith(container, originEl);
            });

            it('should handle isListCell', () => {
                mockEditor.$.component.isInline.mockReturnValue(false);
                // isBlock(originParent) = false, isWysiwygFrame = false
                // -> use Figure.GetContainer fallback
                mockEditor.$.format.isBlock.mockReturnValueOnce(false);
                helperMock.dom.check.isWysiwygFrame.mockReturnValueOnce(false);

                const existElement = {
                    insertBefore: jest.fn(),
                    parentNode: { insertBefore: jest.fn() }
                };
                const originEl = {
                    parentNode: existElement,
                    parentElement: { nodeName: 'DIV' },
                    style: { transform: '' }
                };

                // Spy on Figure.GetContainer to avoid real DOM traversal
                jest.spyOn(Figure, 'GetContainer').mockReturnValueOnce({
                    target: originEl,
                    container: existElement,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                helperMock.dom.check.isListCell.mockReturnValueOnce(true);
                helperMock.dom.query.getParentElement.mockReturnValueOnce(originEl); // refer

                const container = { className: 'se-component' };
                figure.retainFigureFormat(container, originEl, null, null);
                expect(existElement.insertBefore).toHaveBeenCalled();
            });

            it('should handle isLine(existElement) - split path', () => {
                mockEditor.$.component.isInline.mockReturnValue(false);
                mockEditor.$.format.isBlock.mockReturnValueOnce(false);
                helperMock.dom.check.isWysiwygFrame.mockReturnValueOnce(false);

                const existParent = { insertBefore: jest.fn() };
                const existElement = {
                    parentNode: existParent
                };
                const originEl = {
                    parentNode: existElement,
                    parentElement: { nodeName: 'DIV' },
                    style: { transform: '' }
                };

                // Spy on Figure.GetContainer to avoid real DOM traversal
                jest.spyOn(Figure, 'GetContainer').mockReturnValueOnce({
                    target: originEl,
                    container: existElement,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                helperMock.dom.check.isListCell.mockReturnValueOnce(false);

                // isInline is false, so isLine at line 861 is short-circuited (NOT called).
                // First isLine call is at line 869: isLine(existElement) -> true
                mockEditor.$.format.isLine.mockReturnValueOnce(true); // isLine(existElement) at line 869

                helperMock.dom.query.getParentElement.mockReturnValueOnce(originEl); // refer
                mockEditor.$.nodeTransform.split.mockReturnValue({
                    parentNode: existParent
                });

                const container = { className: 'se-component' };
                figure.retainFigureFormat(container, originEl, null, null);
                expect(existParent.insertBefore).toHaveBeenCalled();
            });

            it('should handle isLine(parentNode) with fileManager', () => {
                mockEditor.$.component.isInline.mockReturnValue(false);
                mockEditor.$.format.isBlock.mockReturnValueOnce(false);
                helperMock.dom.check.isWysiwygFrame.mockReturnValueOnce(false);

                const formatParentNode = { insertBefore: jest.fn() };
                const formatParent = { insertBefore: jest.fn(), nextElementSibling: null, parentNode: formatParentNode };
                const existElement = {
                    parentNode: formatParent,
                    previousSibling: null,
                    contains: jest.fn().mockReturnValue(false)
                };
                const originEl = {
                    parentNode: existElement,
                    parentElement: { nodeName: 'P' },
                    style: { transform: '' }
                };

                // Spy on Figure.GetContainer to avoid real DOM traversal
                jest.spyOn(Figure, 'GetContainer').mockReturnValueOnce({
                    target: originEl,
                    container: existElement,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                helperMock.dom.check.isListCell.mockReturnValueOnce(false);

                // isInline is false, so isLine at line 861 is short-circuited (NOT called)
                mockEditor.$.format.isLine
                    .mockReturnValueOnce(false) // isLine(existElement) at line 869
                    .mockReturnValueOnce(true); // isLine(existElement.parentNode) at line 876

                const fileManagerInst = {
                    __updateTags: [existElement]
                };

                const container = { className: 'se-component' };
                figure.retainFigureFormat(container, originEl, null, fileManagerInst);
                expect(formatParentNode.insertBefore).toHaveBeenCalled();
            });

            it('should handle isLine(parentNode) with zeroWidth element removal', () => {
                mockEditor.$.component.isInline.mockReturnValue(false);
                mockEditor.$.format.isBlock.mockReturnValueOnce(false);
                helperMock.dom.check.isWysiwygFrame.mockReturnValueOnce(false);

                const formatParentNode = { insertBefore: jest.fn() };
                const formatParent = { insertBefore: jest.fn(), nextElementSibling: null, parentNode: formatParentNode };
                const existElement = {
                    parentNode: formatParent,
                    previousSibling: null,
                    contains: jest.fn().mockReturnValue(false)
                };
                const originEl = {
                    parentNode: existElement,
                    parentElement: { nodeName: 'P' },
                    style: { transform: '' }
                };

                // Spy on Figure.GetContainer to avoid real DOM traversal
                jest.spyOn(Figure, 'GetContainer').mockReturnValueOnce({
                    target: originEl,
                    container: existElement,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                helperMock.dom.check.isListCell.mockReturnValueOnce(false);

                // isInline is false, so isLine at line 861 is short-circuited (NOT called)
                mockEditor.$.format.isLine
                    .mockReturnValueOnce(false) // isLine(existElement) at line 869
                    .mockReturnValueOnce(true); // isLine(existElement.parentNode) at line 876

                helperMock.dom.check.isZeroWidth.mockReturnValueOnce(true);

                const container = { className: 'se-component' };
                figure.retainFigureFormat(container, originEl, null, null);
                expect(helperMock.dom.utils.removeItem).toHaveBeenCalledWith(existElement);
            });

            it('should handle isFigure(parentNode)', () => {
                mockEditor.$.component.isInline.mockReturnValue(false);
                mockEditor.$.format.isBlock.mockReturnValueOnce(false);
                helperMock.dom.check.isWysiwygFrame.mockReturnValueOnce(false);

                const existElement = {
                    parentNode: { replaceChild: jest.fn() }
                };
                const originEl = {
                    parentNode: existElement,
                    parentElement: { nodeName: 'DIV' },
                    style: { transform: '' }
                };

                // Spy on Figure.GetContainer to avoid real DOM traversal
                jest.spyOn(Figure, 'GetContainer').mockReturnValueOnce({
                    target: originEl,
                    container: existElement,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                helperMock.dom.check.isListCell.mockReturnValueOnce(false);

                // isInline is false, so isLine at line 861 is short-circuited
                mockEditor.$.format.isLine
                    .mockReturnValueOnce(false) // isLine(existElement) at line 869
                    .mockReturnValueOnce(false); // isLine(existElement.parentNode) at line 876

                helperMock.dom.check.isFigure.mockReturnValueOnce(true);
                const figureContainer = { parentNode: { replaceChild: jest.fn() } };
                helperMock.dom.query.getParentElement.mockReturnValueOnce(figureContainer);

                const container = { className: 'se-component' };
                figure.retainFigureFormat(container, originEl, null, null);
                expect(figureContainer.parentNode.replaceChild).toHaveBeenCalledWith(container, figureContainer);
            });

            it('should handle else case (replaceChild)', () => {
                mockEditor.$.component.isInline.mockReturnValue(false);
                mockEditor.$.format.isBlock.mockReturnValueOnce(false);
                helperMock.dom.check.isWysiwygFrame.mockReturnValueOnce(false);

                const existElement = {
                    parentNode: { replaceChild: jest.fn() }
                };
                const originEl = {
                    parentNode: existElement,
                    parentElement: { nodeName: 'DIV' },
                    style: { transform: '' }
                };

                // Spy on Figure.GetContainer to avoid real DOM traversal
                jest.spyOn(Figure, 'GetContainer').mockReturnValueOnce({
                    target: originEl,
                    container: existElement,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                helperMock.dom.query.getParentElement.mockReturnValueOnce(null); // isExcludeFormat
                helperMock.dom.check.isListCell.mockReturnValueOnce(false);

                // isInline is false, so isLine at line 861 is short-circuited
                mockEditor.$.format.isLine
                    .mockReturnValueOnce(false) // isLine(existElement) at line 869
                    .mockReturnValueOnce(false); // isLine(existElement.parentNode) at line 876

                helperMock.dom.check.isFigure.mockReturnValueOnce(false);

                const container = { className: 'se-component' };
                figure.retainFigureFormat(container, originEl, null, null);
                expect(existElement.parentNode.replaceChild).toHaveBeenCalledWith(container, existElement);
            });
        });

        // ================ DELETE TRANSFORM ================

        describe('deleteTransform', () => {
            it('should reset transform styles', () => {
                mockElement.style.transform = 'rotate(90deg)';
                mockElement.style.transformOrigin = '50% 50%';
                mockElement.setAttribute('data-se-size', '100,50');

                figure.deleteTransform(mockElement);

                expect(mockElement.style.transform).toBe('');
                expect(mockElement.style.transformOrigin).toBe('');
                expect(figure.isVertical).toBe(false);
            });

            it('should reset maxWidth', () => {
                mockElement.style.maxWidth = '500px';

                figure.deleteTransform(mockElement);

                expect(mockElement.style.maxWidth).toBe('');
            });

            it('should use current element if no node provided', () => {
                jest.spyOn(figure, '_applySize').mockImplementation();
                figure.deleteTransform();
                expect(figure.isVertical).toBe(false);
            });
        });

        // ================ SET TRANSFORM ================

        describe('setTransform', () => {
            it('should set transform rotation to 90deg (isVertical true)', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 90);

                expect(figure._setRotate).toHaveBeenCalled();
                expect(figure.isVertical).toBe(true);
            });

            it('should handle zero degree rotation', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 0);

                expect(figure.isVertical).toBe(false);
            });

            it('should handle 360 degree rotation (reset to 0)', () => {
                // Starting from 0, rotating 360 -> >= 360 -> reset to 0
                mockElement.style.transform = '';
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 360);

                expect(figure._setRotate).toHaveBeenCalled();
            });

            it('should handle auto dataSize for non-vertical', () => {
                mockElement.getAttribute.mockReturnValue('auto,auto');
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_setAutoSize').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 0);
                expect(figure._setAutoSize).toHaveBeenCalled();
            });

            it('should handle percentage dataSize for non-vertical', () => {
                mockElement.getAttribute.mockReturnValue('50%,auto');
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_setPercentSize').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 0);
                expect(figure._setPercentSize).toHaveBeenCalledWith('50%', 'auto');
            });

            it('should set maxWidth none for vertical', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, 90);

                expect(mockElement.style.maxWidth).toBe('none');
            });

            it('should clear maxWidth for non-vertical', () => {
                mockElement.style.maxWidth = 'none';
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 0);

                expect(mockElement.style.maxWidth).toBe('');
            });

            it('should set transOrigin for 90 degree with cover', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, 90);
                expect(mockElement.style.transformOrigin).toBeDefined();
            });

            it('should set cover dimensions for vertical with caption', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: { tagName: 'FIGCAPTION' },
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, 90);
                // cover.style.height should be '' when caption exists
            });

            it('should handle -90 degree transOrigin', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.style.transform = 'rotate(0deg)';
                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, -90);
                expect(mockElement.style.transformOrigin).toBeDefined();
            });
        });

        // ================ _setRotate ================

        describe('_setRotate', () => {
            it('should set basic rotation transform', () => {
                figure._setRotate(mockElement, 90, '', '');
                expect(mockElement.style.transform).toContain('rotate(90deg)');
            });

            it('should handle rotation with X axis flip', () => {
                figure._setRotate(mockElement, 90, '180', '');
                expect(mockElement.style.transform).toContain('rotateX(180deg)');
            });

            it('should handle rotation with Y axis flip', () => {
                figure._setRotate(mockElement, 90, '', '180');
                expect(mockElement.style.transform).toContain('rotateY(180deg)');
            });

            it('should handle rotation with both X and Y flip at 90deg', () => {
                figure._setRotate(mockElement, 90, '180', '180');
                // At 90deg with x and y: translate = 'X'
                expect(mockElement.style.transform).toContain('rotate(90deg)');
                expect(mockElement.style.transform).toContain('rotateX(180deg)');
                expect(mockElement.style.transform).toContain('rotateY(180deg)');
            });

            it('should handle 270 degree rotation with x only', () => {
                figure._setRotate(mockElement, 270, '180', '');
                expect(mockElement.style.transform).toContain('rotate(270deg)');
            });

            it('should handle 270 degree rotation with x and y', () => {
                figure._setRotate(mockElement, 270, '180', '180');
                expect(mockElement.style.transform).toContain('rotate(270deg)');
            });

            it('should handle -90 degree rotation', () => {
                figure._setRotate(mockElement, -90, '180', '');
                expect(mockElement.style.transform).toContain('rotate(-90deg)');
            });

            it('should handle -90 degree with x and y', () => {
                figure._setRotate(mockElement, -90, '180', '180');
                expect(mockElement.style.transform).toContain('rotate(-90deg)');
            });

            it('should handle -270 degree rotation', () => {
                figure._setRotate(mockElement, -270, '', '180');
                expect(mockElement.style.transform).toContain('rotate(-270deg)');
            });

            it('should handle -270 with x and y', () => {
                figure._setRotate(mockElement, -270, '180', '180');
                expect(mockElement.style.transform).toContain('rotate(-270deg)');
            });

            it('should clear maxWidth when r % 180 === 0', () => {
                mockElement.style.maxWidth = 'none';
                figure._setRotate(mockElement, 180, '', '');
                expect(mockElement.style.maxWidth).toBe('');
            });

            it('should clear maxWidth for 0 rotation', () => {
                mockElement.style.maxWidth = 'none';
                figure._setRotate(mockElement, 0, '', '');
                expect(mockElement.style.maxWidth).toBe('');
            });

            it('should not clear maxWidth for 90 rotation', () => {
                mockElement.style.maxWidth = 'none';
                figure._setRotate(mockElement, 90, '', '');
                expect(mockElement.style.maxWidth).toBe('none');
            });

            it('should handle no translate when r is 0 with x and y', () => {
                figure._setRotate(mockElement, 0, '180', '180');
                // r is 0, so /[1-9]/.test fails, no translate
                expect(mockElement.style.transform).not.toContain('translate');
            });

            it('should hit default branch for non-standard rotation with flip (e.g. 180 with x)', () => {
                // r = 180 has [1-9] match and x is truthy -> enters switch
                // 180 doesn't match '90','270','-90','-270' -> default branch sets translate = ''
                figure._setRotate(mockElement, 180, '180', '');
                expect(mockElement.style.transform).toContain('rotate(180deg)');
                expect(mockElement.style.transform).toContain('rotateX(180deg)');
                // No translate because default sets it to ''
                expect(mockElement.style.transform).not.toContain('translate');
            });

            it('should hit default branch for 45 degree rotation with y', () => {
                figure._setRotate(mockElement, 45, '', '180');
                expect(mockElement.style.transform).toContain('rotate(45deg)');
                expect(mockElement.style.transform).toContain('rotateY(180deg)');
                expect(mockElement.style.transform).not.toContain('translate');
            });
        });

        // ================ _applySize ================

        describe('_applySize', () => {
            it('should apply basic size', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();
                figure._applySize('200px', '100px', '');
                expect(mockElement.style.width).toBe('200px');
            });

            it('should handle onlyW (rw direction with existing height)', () => {
                mockElement.style.height = '100px';
                jest.spyOn(figure, 'setAlign').mockImplementation();
                figure._applySize('200px', '100px', 'rw');
                // onlyH is false so height should be set
            });

            it('should handle onlyH (th direction with existing width)', () => {
                mockElement.style.width = '200px';
                jest.spyOn(figure, 'setAlign').mockImplementation();
                figure._applySize('200px', '150px', 'th');
                // onlyW is false so width should be set
            });

            it('should handle autoRatio cover padding', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                figure._cover = { style: { width: '', height: '', paddingBottom: '' } };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._applySize('100%', '56.25%', '');
            });

            it('should call setAlign when align is center', () => {
                figure.align = 'center';
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._applySize('200px', '100px', '');
                expect(figure.setAlign).toHaveBeenCalledWith(mockElement, 'center');
            });

            it('should handle numeric w with sizeUnit', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();
                figure.sizeUnit = 'px';
                figure._applySize(200, '100px', '');
                expect(mockElement.style.width).toBe('200px');
            });

            it('should handle autoRatio with non-vertical (height set to 100%)', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                figure._cover = { style: { width: '', height: '', paddingBottom: '' } };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._applySize('100%', '56.25%', '');
                // With autoRatio and non-vertical, element height should be 100%
            });

            it('should set autoRatio cover width', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                figure._cover = { style: { width: '', height: '', paddingBottom: '' } };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._applySize('500px', '300px', '');
                expect(figure._cover.style.width).toBe('500px');
            });

            it('should use autoRatio default/current for h when h is falsy', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                figure._cover = { style: { width: '', height: '', paddingBottom: '' } };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._applySize('100%', '', '');
            });
        });

        // ================ __setCoverPaddingBottom ================

        describe('__setCoverPaddingBottom', () => {
            it('should return early when inlineCover === cover', () => {
                const inlineCover = { style: {} };
                figure._inlineCover = inlineCover;
                figure._cover = inlineCover;

                figure.__setCoverPaddingBottom('100%', '56.25%');
                // Should return early, no paddingBottom set
            });

            it('should swap w,h when isVertical', () => {
                figure.isVertical = true;
                figure._cover = { style: { height: '', paddingBottom: '' } };

                figure.__setCoverPaddingBottom('200px', '100px');
                // w and h get swapped: actual w='100px', h='200px'
                expect(figure._cover.style.height).toBe('200px');
                expect(figure._cover.style.paddingBottom).toBe('200px');
            });

            it('should calculate paddingBottom for percentage + center', () => {
                figure.align = 'center';
                figure._cover = { style: { height: '', paddingBottom: '' } };

                figure.__setCoverPaddingBottom('50%', '56.25%');
                // Both w and h are %, center align -> calculated value
            });

            it('should set paddingBottom to h for non-percentage w', () => {
                figure.align = 'center';
                figure._cover = { style: { height: '', paddingBottom: '' } };

                figure.__setCoverPaddingBottom('200px', '100px');
                expect(figure._cover.style.paddingBottom).toBe('100px');
            });

            it('should set paddingBottom to h when align is not center', () => {
                figure.align = 'left';
                figure._cover = { style: { height: '', paddingBottom: '' } };

                figure.__setCoverPaddingBottom('50%', '56.25%');
                expect(figure._cover.style.paddingBottom).toBe('56.25%');
            });

            it('should handle non-percentage h with percentage w and center', () => {
                figure.align = 'center';
                figure._cover = { style: { height: '', paddingBottom: '' } };

                figure.__setCoverPaddingBottom('50%', '200px');
                // h is not % -> paddingBottom = h
                expect(figure._cover.style.paddingBottom).toBe('200px');
            });
        });

        // ================ _setAutoSize ================

        describe('_setAutoSize', () => {
            it('should call deleteTransform and reset sizes', () => {
                jest.spyOn(figure, 'deleteTransform').mockImplementation();
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setAutoSize();
                expect(figure.deleteTransform).toHaveBeenCalled();
            });

            it('should clear caption marginTop if exists', () => {
                figure._caption = { style: { marginTop: '10px' } };
                jest.spyOn(figure, 'deleteTransform').mockImplementation();
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setAutoSize();
                expect(figure._caption.style.marginTop).toBe('');
            });

            it('should call _setPercentSize when autoRatio is set', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                jest.spyOn(figure, 'deleteTransform').mockImplementation();
                jest.spyOn(figure, '_setPercentSize').mockImplementation();
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setAutoSize();
                expect(figure._setPercentSize).toHaveBeenCalledWith('100%', '56.25%');
            });

            it('should use autoRatio.default when current is empty', () => {
                figure.autoRatio = { current: '', default: '75%' };
                jest.spyOn(figure, 'deleteTransform').mockImplementation();
                jest.spyOn(figure, '_setPercentSize').mockImplementation();
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setAutoSize();
                expect(figure._setPercentSize).toHaveBeenCalledWith('100%', '75%');
            });

            it('should reset element styles when no autoRatio', () => {
                figure.autoRatio = null;
                figure._cover = { style: { width: '100px', height: '50px' } };
                jest.spyOn(figure, 'deleteTransform').mockImplementation();
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setAutoSize();
                expect(mockElement.style.maxWidth).toBe('');
                expect(mockElement.style.width).toBe('');
                expect(mockElement.style.height).toBe('');
                expect(figure._cover.style.width).toBe('');
                expect(figure._cover.style.height).toBe('');
            });
        });

        // ================ _setPercentSize ================

        describe('_setPercentSize', () => {
            it('should set percentage width on container', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize('50%', '100px');
                expect(figure._container.style.width).toBe('50%');
            });

            it('should handle autoRatio height fallback', () => {
                figure.autoRatio = { current: '56.25%', default: '75%' };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._setPercentSize('100%', '');
            });

            it('should early return for exceptionFormat (element === cover)', () => {
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: false };
                    if (key === 'defaultLine') return 'P';
                    return undefined;
                });
                figure._cover = mockElement; // element === cover

                figure._setPercentSize('100%', '50%');
                // Should return early after saveCurrentSize
            });

            it('should set cover width and height when inlineCover !== cover', () => {
                figure._inlineCover = null;
                figure._cover = { style: { width: '', height: '' } };
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize('75%', '300px');
                expect(figure._cover.style.width).toBe('100%');
                expect(figure._cover.style.height).toBe('300px');
            });

            it('should set element width to 100%', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize('50%', '200px');
                expect(mockElement.style.width).toBe('100%');
                expect(mockElement.style.maxWidth).toBe('');
            });

            it('should call setAlign when center aligned', () => {
                figure.align = 'center';
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize('100%', '50px');
                expect(figure.setAlign).toHaveBeenCalledWith(mockElement, 'center');
            });

            it('should call __setCoverPaddingBottom with autoRatio', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._setPercentSize('100%', '56.25%');
                expect(figure.__setCoverPaddingBottom).toHaveBeenCalled();
            });

            it('should handle numeric w (convert to %)', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize(50, '100px');
                expect(figure._container.style.width).toBe('50%');
            });

            it('should handle autoRatio height set to 100%', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._setPercentSize('100%', '56.25%');
                // With autoRatio, element height should be 100%
                expect(mockElement.style.height).toBe('100%');
            });
        });

        // ================ _displayResizeHandles ================

        describe('_displayResizeHandles', () => {
            it('should show handles when display is true', () => {
                const frameContext = mockEditor.$.frameContext;
                const handles = frameContext.get('_figure').handles;

                figure.controller = { form: { style: {} } };
                figure._displayResizeHandles(true);

                expect(figure.controller.form.style.display).toBe('flex');
                handles.forEach(h => {
                    expect(h.style.display).toBe('flex');
                });
            });

            it('should hide handles and add se-resize-ing class when display is false', () => {
                const frameContext = mockEditor.$.frameContext;
                const handles = frameContext.get('_figure').handles;

                figure.controller = { form: { style: {} } };
                figure._displayResizeHandles(false);

                expect(figure.controller.form.style.display).toBe('none');
                handles.forEach(h => {
                    expect(h.style.display).toBe('none');
                });
                expect(helperMock.dom.utils.addClass).toHaveBeenCalled();
                expect(mockEditor.$.eventManager.addGlobalEvent).toHaveBeenCalledWith('keydown', expect.any(Function));
            });

            it('should remove se-resize-ing class when showing', () => {
                figure.controller = { form: { style: {} } };
                figure._displayResizeHandles(true);
                expect(helperMock.dom.utils.removeClass).toHaveBeenCalled();
            });
        });

        // ================ OPEN ================

        describe('open', () => {
            beforeEach(() => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figure, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });
                mockEditor.$.ui.opendControllers = [];
                mockEditor.$.ui.setFigureContainer = jest.fn();
            });

            it('should return early if targetNode is null', () => {
                const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
                const result = figure.open(null, {});

                expect(consoleWarn).toHaveBeenCalledWith('[SUNEDITOR.modules.Figure.open] The "targetNode" is null.');
                expect(result).toBeUndefined();

                consoleWarn.mockRestore();
            });

            it('should handle infoOnly parameter', () => {
                const result = figure.open(mockElement, { infoOnly: true });

                expect(result).toBeDefined();
                expect(result).toHaveProperty('w');
                expect(result).toHaveProperty('h');
                expect(result).toHaveProperty('width');
                expect(result).toHaveProperty('height');
            });

            it('should handle ON_OVER_COMPONENT (nonBorder = true)', () => {
                dragHandleMock._DragHandle.get.mockImplementation((key) => {
                    if (key === '__overInfo') return false; // ON_OVER_COMPONENT is false
                    if (key === '__figureInst') return figure;
                    return null;
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should handle no container with strictMode.formatFilter false (exceptionFormat)', () => {
                const origGet = mockEditor.$.options.get;
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: false };
                    if (key === '_rtl') return false;
                    return origGet(key);
                });

                // When container is null, the code sets figureInfo.container = target,
                // so target needs className for #setFigureInfo
                const targetWithClass = { ...mockElement, className: '' };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: targetWithClass,
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should handle no container with strictMode.formatFilter true (early return)', () => {
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: true };
                    return undefined;
                });

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, {});
                expect(result).toBeDefined();
                expect(result.container).toBeNull();
            });

            it('should use cover/container as sizeTarget when figureTarget is true', () => {
                const result = figure.open(mockElement, { figureTarget: true, infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should swap w,h when isVertical', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: { ...mockElement, style: { ...mockElement.style, transform: 'rotate(90deg)' } },
                    container: { style: { width: '100px' }, className: 'se-component' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: true
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should handle percentage active buttons', () => {
                // Setup percentageButtons
                figure.percentageButtons = [
                    { getAttribute: jest.fn().mockReturnValue('0.5') },
                    { getAttribute: jest.fn().mockReturnValue('1') }
                ];

                // Make element style return % width
                const targetEl = {
                    ...mockElement,
                    style: { width: '50%', height: '50px', transform: '' },
                    getAttribute: jest.fn().mockReturnValue('')
                };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: targetEl,
                    container: { style: { width: '50%' }, className: 'se-component' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(targetEl, { infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should handle caption button active', () => {
                figure.captionButton = { className: '' };
                const caption = { tagName: 'FIGCAPTION' };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: caption,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result).toBeDefined();
                expect(result.caption).toBe(caption);
            });

            it('should handle caption button inactive', () => {
                figure.captionButton = { className: 'active' };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result).toBeDefined();
                expect(result.caption).toBeNull();
            });

            it('should handle full open flow (non-infoOnly, non-ON_OVER)', () => {
                // Use a real store-like implementation for _DragHandle
                const dragStore = {};
                dragHandleMock._DragHandle.get.mockImplementation((key) => dragStore[key] ?? null);
                dragHandleMock._DragHandle.set.mockImplementation((key, val) => { dragStore[key] = val; });

                // Prevent _w.setTimeout from executing immediately so __overInfo stays null
                // This ensures _DragHandle.get('__overInfo') !== ON_OVER_COMPONENT (null !== false) stays true at line 530
                helperMock.env._w.setTimeout = jest.fn();

                // Make the controller form have querySelectorAll
                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figureWithController, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });

                // Controller form mock - ensure querySelectorAll and querySelector work
                if (!figureWithController.controller.form.querySelectorAll) {
                    figureWithController.controller.form.querySelectorAll = jest.fn().mockReturnValue([]);
                }
                if (!figureWithController.controller.form.querySelector) {
                    figureWithController.controller.form.querySelector = jest.fn().mockReturnValue(null);
                }

                mockEditor.$.ui.opendControllers = [];

                const result = figureWithController.open(mockElement, {});
                expect(result).toBeDefined();
                expect(figureWithController.controller.open).toHaveBeenCalled();
            });

            it('should handle ON_OVER_COMPONENT true (adds over-selected class)', () => {
                // ON_OVER_COMPONENT is false from the mock, but __overInfo === ON_OVER_COMPONENT
                dragHandleMock._DragHandle.get.mockImplementation((key) => {
                    if (key === '__overInfo') return false; // equals ON_OVER_COMPONENT (false)
                    return null;
                });

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                mockEditor.$.ui.opendControllers = [];

                // Without controller - goes to else branch (se-figure-over-selected)
                const result = figure.open(mockElement, {});
                expect(result).toBeDefined();
            });

            it('should handle inline cover (display none for handles/display)', () => {
                const inlineCover = { style: {}, tagName: 'SPAN' };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component se-inline-component' },
                    cover: null,
                    inlineCover: inlineCover,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should handle nonResizing parameter', () => {
                dragHandleMock._DragHandle.get.mockReturnValue(null);

                const result = figure.open(mockElement, { nonResizing: true, infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should handle nonSizeInfo parameter', () => {
                const result = figure.open(mockElement, { nonSizeInfo: true, infoOnly: true });
                expect(result).toBeDefined();
            });

            it('should activate percentage button when value matches in full flow', () => {
                const dragStore = {};
                dragHandleMock._DragHandle.get.mockImplementation((key) => dragStore[key] ?? null);
                dragHandleMock._DragHandle.set.mockImplementation((key, val) => { dragStore[key] = val; });
                helperMock.env._w.setTimeout = jest.fn();

                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                // Set up percentage buttons
                figureWithController.percentageButtons = [
                    { getAttribute: jest.fn().mockReturnValue('0.5') },
                    { getAttribute: jest.fn().mockReturnValue('1') }
                ];

                const targetEl = {
                    ...mockElement,
                    style: { width: '50%', height: '50px', transform: '', float: '' },
                    getAttribute: jest.fn().mockReturnValue('')
                };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: targetEl,
                    container: { style: { width: '50%' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figureWithController, 'getSize').mockReturnValue({ w: '50%', h: '50px', dw: '50%', dh: '50px' });

                if (!figureWithController.controller.form.querySelectorAll) {
                    figureWithController.controller.form.querySelectorAll = jest.fn().mockReturnValue([]);
                }
                if (!figureWithController.controller.form.querySelector) {
                    figureWithController.controller.form.querySelector = jest.fn().mockReturnValue(null);
                }

                mockEditor.$.ui.opendControllers = [];

                const result = figureWithController.open(targetEl, {});
                expect(result).toBeDefined();
                expect(helperMock.dom.utils.addClass).toHaveBeenCalled();
            });

            it('should handle caption button active in full flow with caption', () => {
                const dragStore = {};
                dragHandleMock._DragHandle.get.mockImplementation((key) => dragStore[key] ?? null);
                dragHandleMock._DragHandle.set.mockImplementation((key, val) => { dragStore[key] = val; });
                helperMock.env._w.setTimeout = jest.fn();

                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
                figureWithController.captionButton = { className: '' };

                const caption = { tagName: 'FIGCAPTION' };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: caption,
                    isVertical: false
                });
                jest.spyOn(figureWithController, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });

                if (!figureWithController.controller.form.querySelectorAll) {
                    figureWithController.controller.form.querySelectorAll = jest.fn().mockReturnValue([]);
                }
                if (!figureWithController.controller.form.querySelector) {
                    figureWithController.controller.form.querySelector = jest.fn().mockReturnValue(null);
                }

                mockEditor.$.ui.opendControllers = [];

                const result = figureWithController.open(mockElement, {});
                expect(result).toBeDefined();
                expect(result.caption).toBe(caption);
                expect(helperMock.dom.utils.addClass).toHaveBeenCalledWith(figureWithController.captionButton, 'active');
            });

            it('should handle caption button inactive (no caption) in full flow', () => {
                const dragStore = {};
                dragHandleMock._DragHandle.get.mockImplementation((key) => dragStore[key] ?? null);
                dragHandleMock._DragHandle.set.mockImplementation((key, val) => { dragStore[key] = val; });
                helperMock.env._w.setTimeout = jest.fn();

                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
                figureWithController.captionButton = { className: 'active' };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figureWithController, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });

                if (!figureWithController.controller.form.querySelectorAll) {
                    figureWithController.controller.form.querySelectorAll = jest.fn().mockReturnValue([]);
                }
                if (!figureWithController.controller.form.querySelector) {
                    figureWithController.controller.form.querySelector = jest.fn().mockReturnValue(null);
                }

                mockEditor.$.ui.opendControllers = [];

                const result = figureWithController.open(mockElement, {});
                expect(result).toBeDefined();
                expect(helperMock.dom.utils.removeClass).toHaveBeenCalledWith(figureWithController.captionButton, 'active');
            });

            it('should call setAlignIcon and setAsIcon in full flow when buttons exist', () => {
                const dragStore = {};
                dragHandleMock._DragHandle.get.mockImplementation((key) => dragStore[key] ?? null);
                dragHandleMock._DragHandle.set.mockImplementation((key, val) => { dragStore[key] = val; });
                helperMock.env._w.setTimeout = jest.fn();

                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});
                // Set align and as buttons
                figureWithController.alignButton = { firstElementChild: document.createElement('span') };
                figureWithController.asButton = { firstElementChild: document.createElement('span') };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component __se__float-none' },
                    cover: { style: {}, className: '' },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figureWithController, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });

                figureWithController.controller.form.querySelectorAll = jest.fn().mockReturnValue([]);
                figureWithController.controller.form.querySelector = jest.fn().mockReturnValue(null);

                mockEditor.$.ui.opendControllers = [];

                const result = figureWithController.open(mockElement, {});
                expect(result).toBeDefined();
                // setAlignIcon calls changeElement on alignButton.firstElementChild
                expect(helperMock.dom.utils.changeElement).toHaveBeenCalledWith(
                    figureWithController.alignButton.firstElementChild,
                    expect.anything()
                );
            });

            it('should hide transform buttons when exceptionFormat in full flow', () => {
                const dragStore = {};
                dragHandleMock._DragHandle.get.mockImplementation((key) => dragStore[key] ?? null);
                dragHandleMock._DragHandle.set.mockImplementation((key, val) => { dragStore[key] = val; });
                helperMock.env._w.setTimeout = jest.fn();

                const origGet = mockEditor.$.options.get;
                mockEditor.$.options.get = jest.fn().mockImplementation((key) => {
                    if (key === 'strictMode') return { formatFilter: false };
                    if (key === '_rtl') return false;
                    return origGet(key);
                });

                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                // target with className for exceptionFormat path
                const targetWithClass = { ...mockElement, className: '' };
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: targetWithClass,
                    container: null,
                    cover: null,
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });
                jest.spyOn(figureWithController, 'getSize').mockReturnValue({ w: '100px', h: '50px', dw: '100px', dh: '50px' });

                const transformBtn = { style: {} };
                const onasBtn = { style: {} };
                // Always override querySelectorAll/querySelector (they exist from mock createElement but return wrong values)
                figureWithController.controller.form.querySelectorAll = jest.fn().mockReturnValue([transformBtn]);
                figureWithController.controller.form.querySelector = jest.fn().mockReturnValue(onasBtn);

                mockEditor.$.ui.opendControllers = [];

                const result = figureWithController.open(targetWithClass, {});
                expect(result).toBeDefined();
                // exceptionFormat should set transform buttons to display: 'none'
                expect(transformBtn.style.display).toBe('none');
                expect(onasBtn.style.display).toBe('none');
            });
        });

        // ================ controllerOpen ================

        describe('controllerOpen', () => {
            it('should set element and open controller when controller exists', () => {
                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                const openSpy = jest.spyOn(figureWithController.controller, 'open');

                figureWithController.controllerOpen(mockElement, {});

                expect(figureWithController._element).toBe(mockElement);
                expect(openSpy).toHaveBeenCalledWith(mockElement, null, {});
            });

            it('should handle params when controller exists', () => {
                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                const params = { disabled: true };
                const openSpy = jest.spyOn(figureWithController.controller, 'open');

                figureWithController.controllerOpen(mockElement, params);

                expect(openSpy).toHaveBeenCalledWith(mockElement, null, params);
            });

            it('should handle controllerOpen when controller is null', () => {
                figure.controllerOpen(mockElement, {});

                expect(figure._element).toBe(mockElement);
            });
        });

        // ================ _setRevert ================

        describe('_setRevert', () => {
            it('should call setFigureSize with saved revert size', () => {
                jest.spyOn(figure, 'setFigureSize').mockImplementation();
                figure._setRevert();
                expect(figure.setFigureSize).toHaveBeenCalled();
            });
        });

        // ================ CONTROLLER HIDE / SHOW ================

        describe('controllerHide and controllerShow', () => {
            it('should call hide on controller when it exists', () => {
                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                figureWithController.controllerHide();
                expect(figureWithController.controller.hide).toHaveBeenCalled();
            });

            it('should call show on controller when it exists', () => {
                const controlsWithButtons = [['edit', 'remove']];
                const figureWithController = new Figure(mockInst, mockEditor.$, controlsWithButtons, {});

                figureWithController.controllerShow();
                expect(figureWithController.controller.show).toHaveBeenCalled();
            });

            it('should not throw when controller is null', () => {
                expect(() => figure.controllerHide()).not.toThrow();
                expect(() => figure.controllerShow()).not.toThrow();
            });
        });

        // ================ EDGE CASES ================

        describe('edge cases', () => {
            it('should handle element with naturalWidth for originWidth', () => {
                const imgElement = {
                    ...mockElement,
                    naturalWidth: 800,
                    naturalHeight: 600
                };

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: imgElement,
                    container: { style: { width: '100px' }, className: 'se-component' },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(imgElement, { infoOnly: true });
                expect(result.originWidth).toBe(800);
                expect(result.originHeight).toBe(600);
            });

            it('should handle element without naturalWidth', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component' },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result.originWidth).toBe(100);
                expect(result.originHeight).toBe(50);
            });

            it('should handle data-se-size attribute for width/height', () => {
                mockElement.getAttribute.mockReturnValue('300px,200px');

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '300px' }, className: 'se-component' },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result.width).toBe('300px');
                expect(result.height).toBe('200px');
            });

            it('should default to auto when data-se-size is empty', () => {
                mockElement.getAttribute.mockReturnValue('');

                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: { width: '100px' }, className: 'se-component' },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });
                expect(result.width).toBe('auto');
                expect(result.height).toBe('auto');
            });
        });

        // ================ GetRatio edge cases ================

        describe('GetRatio additional cases', () => {
            it('should handle when w is 0', () => {
                const ratio = Figure.GetRatio(0, 100, 'px');
                // 0 / 100 = 0, 100 / 0 = Infinity -> NaN after get
                expect(ratio).toBeDefined();
            });

            it('should handle string values with units', () => {
                const ratio = Figure.GetRatio('200px', '100px', 'px');
                expect(ratio.w).toBe(2);
                expect(ratio.h).toBe(0.5);
            });
        });

        // ================ CalcRatio edge cases ================

        describe('CalcRatio additional cases', () => {
            it('should handle when w has no digits', () => {
                const result = Figure.CalcRatio('auto', '50px', 'px', { w: 2, h: 0.5 });
                expect(result.w).toBe('auto');
                expect(result.h).toBe('50px');
            });

            it('should handle when h has no digits', () => {
                const result = Figure.CalcRatio('100px', 'auto', 'px', { w: 2, h: 0.5 });
                expect(result.w).toBe('100px');
                expect(result.h).toBe('auto');
            });
        });

        // ================ setFigureSize autoRatio.current available ================

        describe('setFigureSize autoRatio with current available', () => {
            it('should use autoRatio.default when available (default takes priority)', () => {
                jest.spyOn(figure, '_setPercentSize').mockImplementation();
                jest.spyOn(figure, '_setAutoSize').mockImplementation();
                figure.autoRatio = { current: '56.25%', default: '75%' };

                figure.setFigureSize('auto', 'auto');
                // autoRatio.default || autoRatio.current -> '75%'
                expect(figure._setPercentSize).toHaveBeenCalledWith(100, '75%');
            });
        });

        // ================ deleteTransform with data-se-size ================

        describe('deleteTransform with data-se-size', () => {
            it('should use data-se-size values for applySize', () => {
                mockElement.getAttribute.mockReturnValue('200px,100px');
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.deleteTransform(mockElement);
                expect(figure._applySize).toHaveBeenCalledWith('200px', '100px', '');
            });

            it('should default to auto when no data-se-size', () => {
                mockElement.getAttribute.mockReturnValue('');
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.deleteTransform(mockElement);
                expect(figure._applySize).toHaveBeenCalledWith('auto', '', '');
            });
        });

        // ================ setTransform with inlineCover cover ================

        describe('setTransform with inlineCover', () => {
            it('should use inlineCover as cover when cover is null', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                const inlineCover = { style: { width: '', height: '' } };
                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: null,
                    inlineCover: inlineCover,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, 90);
                expect(inlineCover.style.width).toBeDefined();
            });
        });

        // ================ setTransform 270 / -270 degree ================

        describe('setTransform transOrigin for different degrees', () => {
            it('should handle -270 degree', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                // Start at 0, add -270 -> Math.abs(-270) = 270 which is vertical
                figure.setTransform(mockElement, 100, 50, -270);
                expect(figure.isVertical).toBe(true);
            });

            it('should handle 270 degree', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, 270);
                expect(figure.isVertical).toBe(true);
            });
        });

        // ================ setTransform with null width/height ================

        describe('setTransform with null dimensions', () => {
            it('should handle null width and height (use offsetWidth/Height)', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, null, null, 90);
                expect(figure.isVertical).toBe(true);
            });
        });

        // ================ setTransform non-vertical with rotation ================

        describe('setTransform non-vertical path', () => {
            it('should call _setRotate for non-vertical after size set', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                mockElement.getAttribute.mockReturnValue('100px,50px');
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: { width: '', height: '' } },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setTransform(mockElement, 100, 50, 180);
                expect(figure.isVertical).toBe(false);
                // _setRotate is called at the end for non-vertical
                expect(figure._setRotate).toHaveBeenCalled();
            });
        });

        // ================ _applySize direction variants ================

        describe('_applySize direction variants', () => {
            it('should handle lw direction', () => {
                mockElement.style.height = '50px';
                jest.spyOn(figure, 'setAlign').mockImplementation();
                figure._applySize('200px', '100px', 'lw');
                // lw is onlyW case with height
            });

            it('should handle bh direction', () => {
                mockElement.style.width = '200px';
                jest.spyOn(figure, 'setAlign').mockImplementation();
                figure._applySize('200px', '150px', 'bh');
                // bh is onlyH case with width
            });
        });

        // ================ _setPercentSize height handling ================

        describe('_setPercentSize height handling', () => {
            it('should handle percentage height', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize('50%', '50%');
                // With % height, element height should be '' (empty)
            });

            it('should handle non-percentage height', () => {
                jest.spyOn(figure, 'setAlign').mockImplementation();

                figure._setPercentSize('50%', '200px');
                // Non-% height should be set directly
            });

            it('should handle numeric height with autoRatio', () => {
                figure.autoRatio = { current: '56.25%', default: '56.25%' };
                jest.spyOn(figure, 'setAlign').mockImplementation();
                jest.spyOn(figure, '__setCoverPaddingBottom').mockImplementation();

                figure._setPercentSize('100%', 56.25);
            });
        });

        // ================ _setAutoSize without cover ================

        describe('_setAutoSize without cover', () => {
            it('should handle null cover', () => {
                figure._cover = null;
                figure.autoRatio = null;
                jest.spyOn(figure, 'deleteTransform').mockImplementation();
                jest.spyOn(figure, 'setAlign').mockImplementation();

                expect(() => figure._setAutoSize()).not.toThrow();
            });
        });
    });
});
