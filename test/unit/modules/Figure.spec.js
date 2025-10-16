/**
 * @fileoverview Unit tests for modules/Figure.js
 */

import Figure from '../../../src/modules/Figure.js';

// Mock dependencies
jest.mock('../../../src/modules', () => ({
    Controller: jest.fn().mockImplementation(function() {
        this.open = jest.fn();
        this.close = jest.fn();
        this.hide = jest.fn();
        this.show = jest.fn();
        this.form = {
            style: {},
            querySelector: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([])
        };
        // Add eventManager with addGlobalEvent
        this.eventManager = {
            addGlobalEvent: jest.fn(() => 'event-id'),
            removeGlobalEvent: jest.fn()
        };
    }),
    SelectMenu: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        create: jest.fn(),
        open: jest.fn(),
        close: jest.fn()
    })),
    _DragHandle: {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn()
    }
}));

jest.mock('../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.frameContext = editor.frameContext;
        this.triggerEvent = editor.triggerEvent || jest.fn();
        this.icons = editor.icons;
        this.lang = editor.lang;
        this.carrierWrapper = {
            appendChild: jest.fn(),
            contains: jest.fn().mockReturnValue(true)
        };
        this.eventManager = (editor && editor.eventManager) || {
            addEvent: jest.fn(),
            addGlobalEvent: jest.fn(() => 'event-id'),
            removeGlobalEvent: jest.fn()
        };
        this.instanceCheck = {
            isRange: jest.fn().mockReturnValue(false)
        };
        this.status = editor.status;
        this.ui = editor.ui;
        this.selection = editor.selection;
        this.offset = editor.offset;
        this.component = editor.component;
        this.toolbar = editor.toolbar;
        this.subToolbar = editor.subToolbar;
    });
});

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
                    offsetTop: 0
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

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            ui: {
                showFigure: jest.fn(),
                hideFigure: jest.fn(),
                _visibleControllers: jest.fn(),
                _offCurrentController: jest.fn(),
                disableBackWrapper: jest.fn(),
                enableBackWrapper: jest.fn()
            },
            selection: {
                getRangeElement: jest.fn(),
                isRange: jest.fn().mockReturnValue(false),
                setRange: jest.fn()
            },
            component: {
                resetComponentInfo: jest.fn(),
                _removeDragEvent: jest.fn(),
                select: jest.fn(),
                copy: jest.fn(),
                deselect: jest.fn(),
                isInline: jest.fn().mockReturnValue(false),
                __removeGlobalEvent: jest.fn()
            },
            eventManager: {
                addEvent: jest.fn(),
                addGlobalEvent: jest.fn(() => 'event-id'),
                removeGlobalEvent: jest.fn()
            },
            triggerEvent: jest.fn(),
            applyFrameRoots: jest.fn((callback) => {
                const mockContext = new Map();
                mockContext.set('wrapper', {
                    querySelector: jest.fn().mockReturnValue(null),
                    appendChild: jest.fn()
                });
                mockContext.set('_figure', {
                    main: { style: {}, appendChild: jest.fn() },
                    border: { style: {} },
                    display: { style: {} },
                    handles: [{ style: {} }, { style: {} }]
                });
                callback(mockContext);
            }),
            frameContext: new Map([
                ['_ww', { focus: jest.fn() }],
                ['wrapper', {
                    querySelector: jest.fn().mockReturnValue({ style: {} }),
                    appendChild: jest.fn()
                }],
                ['_figure', {
                    main: {
                        style: {},
                        offsetLeft: 100,
                        offsetTop: 50,
                        offsetWidth: 200,
                        offsetHeight: 100
                    },
                    border: { style: {} },
                    display: { style: {} },
                    handles: [{ style: {} }, { style: {} }]
                }],
                ['wysiwygFrame', { clientWidth: 800 }],
                ['wwComputedStyle', {
                    getPropertyValue: jest.fn().mockReturnValue('0px')
                }]
            ]),
            icons: {
                format_float_none: '🚫',
                format_float_left: '⬅',
                format_float_right: '➡',
                format_float_center: '⬇'
            },
            lang: {
                basic: 'None',
                left: 'Left',
                center: 'Center',
                right: 'Right',
                autoSize: 'Auto',
                caption: 'Caption'
            },
            opendControllers: [],
            _preventBlur: false,
            _figureContainer: null,
            options: {
                get: jest.fn((key) => {
                    if (key === 'strictMode') return { formatFilter: true };
                    if (key === 'defaultLine') return 'P';
                    if (key === '_rtl') return false;
                    return {};
                })
            },
            offset: {
                getLocal: jest.fn().mockReturnValue({
                    top: 100,
                    left: 200,
                    scrollX: 0,
                    scrollY: 0
                }),
                setAbsPosition: jest.fn().mockReturnValue(true),
                setRangePosition: jest.fn().mockReturnValue(true)
            },
            status: {
                hasFocus: true
            },
            toolbar: {
                hide: jest.fn()
            },
            subToolbar: {
                hide: jest.fn()
            },
            isBalloon: false,
            isSubBalloon: false,
            format: {
                isBlock: jest.fn().mockReturnValue(true),
                isLine: jest.fn().mockReturnValue(false)
            },
            html: {
                remove: jest.fn().mockReturnValue({
                    container: { parentElement: { insertBefore: jest.fn() } },
                    offset: 0
                })
            },
            nodeTransform: {
                split: jest.fn().mockReturnValue({ parentElement: { insertBefore: jest.fn() } }),
                removeEmptyNode: jest.fn()
            },
            history: {
                push: jest.fn()
            }
        };

        mockInst = {
            editor: mockEditor,
            constructor: {
                key: 'testFigure',
                name: 'TestFigure'
            },
            edit: jest.fn(),
            destroy: jest.fn()
        };
    });

    describe('Constructor', () => {
        it('should use constructor name as fallback', () => {
            const instWithoutKey = {
                editor: mockEditor,
                constructor: { name: 'FallbackFigure' }
            };
            const mockControls = document.createElement('div');

            const figure = new Figure(instWithoutKey, mockControls, {});
            expect(figure.kind).toBe('FallbackFigure');
        });
    });

    describe('Basic functionality', () => {
        let figure;

        beforeEach(() => {
            const mockControls = document.createElement('div');
            figure = new Figure(mockInst, mockControls, {});
        });

        it('should handle figure operations', () => {
            expect(() => {
                figure.controllerHide();
                figure.controllerShow();
            }).not.toThrow();
        });
    });

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
                const mockSpan = {
                    className: 'se-inline-component',
                    tagName: 'SPAN'
                };
                const mockDom = require('../../../src/helper').dom;
                mockDom.utils.hasClass.mockReturnValueOnce(true);

                const element = document.createElement('img');
                const result = Figure.GetContainer(element);

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
        });
    });

    describe('Instance methods', () => {
        let figure;
        let mockElement;

        beforeEach(() => {
            const mockControls = document.createElement('div');
            figure = new Figure(mockInst, mockControls, {});
            mockElement = {
                tagName: 'IMG',
                style: { width: '100px', height: '50px', transform: '' },
                offsetWidth: 100,
                offsetHeight: 50,
                getAttribute: jest.fn().mockReturnValue(''),
                setAttribute: jest.fn()
            };
            figure._element = mockElement;
            figure._container = { style: {}, className: '' };
            figure._cover = { style: {} };
            figure.history = { push: jest.fn() };
        });

        describe('close', () => {
            it('should close controller and clean up', () => {
                figure._cover = { className: 'se-figure-selected' };
                const closeSpy = jest.spyOn(figure.controller, 'close');

                figure.close();

                expect(mockEditor._preventBlur).toBe(false);
                expect(closeSpy).toHaveBeenCalled();
                expect(figure.component._removeDragEvent).toHaveBeenCalled();
            });
        });

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
        });

        describe('setSize', () => {
            it('should set size normally', () => {
                jest.spyOn(figure, 'setFigureSize').mockImplementation();
                figure.setSize('100px', '50px');
                expect(figure.setFigureSize).toHaveBeenCalledWith('100px', '50px');
            });

            it('should handle vertical orientation', () => {
                figure.isVertical = true;
                jest.spyOn(figure, 'setFigureSize').mockImplementation();
                jest.spyOn(figure, 'setTransform').mockImplementation();

                figure.setSize('100px', '50px');
                expect(figure.setFigureSize).toHaveBeenCalledWith('50px', '100px');
                expect(figure.setTransform).toHaveBeenCalled();
            });
        });

        describe('getSize', () => {
            it('should get current size', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {} },
                    cover: { style: {} },
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
        });

        describe('setAlign', () => {
            it('should set alignment', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {}, className: '' },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                figure.setAlign(mockElement, 'center');
                expect(figure.align).toBe('center');
            });
        });

        describe('controllerAction', () => {
            it('should handle mirror action', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'mirror' : 'h')
                };

                jest.spyOn(figure, '_setRotate').mockImplementation();

                figure.controllerAction(button);
                expect(figure._setRotate).toHaveBeenCalled();
            });

            it('should handle rotate action', () => {
                const button = {
                    getAttribute: jest.fn((attr) => attr === 'data-command' ? 'rotate' : '90')
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
                expect(figure.inst.edit).toHaveBeenCalledWith(mockElement);
            });

            it('should handle copy action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('copy')
                };

                figure.controllerAction(button);
                expect(figure.component.copy).toHaveBeenCalledWith(figure._container);
            });
        });

        describe('deleteTransform', () => {
            it('should reset transform styles', () => {
                mockElement.style.transform = 'rotate(90deg)';
                mockElement.style.transformOrigin = '50% 50%';
                mockElement.setAttribute('data-se-size', '100,50');

                jest.spyOn(figure, '_deleteCaptionPosition').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.deleteTransform(mockElement);

                expect(mockElement.style.transform).toBe('');
                expect(mockElement.style.transformOrigin).toBe('');
                expect(figure.isVertical).toBe(false);
            });

            it('should reset maxWidth', () => {
                mockElement.style.maxWidth = '500px';
                jest.spyOn(figure, '_deleteCaptionPosition').mockImplementation();
                jest.spyOn(figure, '_applySize').mockImplementation();

                figure.deleteTransform(mockElement);

                expect(mockElement.style.maxWidth).toBe('');
            });
        });

        describe('setTransform', () => {
            it('should set transform rotation', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_setCaptionPosition').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 90);

                expect(figure._setRotate).toHaveBeenCalled();
                expect(figure.isVertical).toBe(true);
            });

            it('should handle zero degree rotation', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_setCaptionPosition').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 0);

                expect(figure.isVertical).toBe(false);
            });

            it('should handle 360 degree rotation', () => {
                jest.spyOn(figure, '_setRotate').mockImplementation();
                jest.spyOn(figure, '_setCaptionPosition').mockImplementation();

                figure.setTransform(mockElement, 100, 50, 360);

                expect(figure._setRotate).toHaveBeenCalled();
            });
        });


        describe('open', () => {
            it('should return early if targetNode is null', () => {
                const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
                const result = figure.open(null, {});

                expect(consoleWarn).toHaveBeenCalledWith('[SUNEDITOR.modules.Figure.open] The "targetNode" is null.');
                expect(result).toBeUndefined();

                consoleWarn.mockRestore();
            });

            it('should handle infoOnly parameter', () => {
                jest.spyOn(Figure, 'GetContainer').mockReturnValue({
                    target: mockElement,
                    container: { style: {}, className: 'se-component' },
                    cover: { style: {} },
                    inlineCover: null,
                    caption: null,
                    isVertical: false
                });

                const result = figure.open(mockElement, { infoOnly: true });

                expect(result).toBeDefined();
                expect(result).toHaveProperty('w');
                expect(result).toHaveProperty('h');
            });
        });

        describe('controllerOpen', () => {
            it('should set element and open controller', () => {
                const openSpy = jest.spyOn(figure.controller, 'open');

                figure.controllerOpen(mockElement, {});

                expect(figure._element).toBe(mockElement);
                expect(openSpy).toHaveBeenCalledWith(mockElement, null, {});
            });

            it('should handle params', () => {
                const params = { disabled: true };
                const openSpy = jest.spyOn(figure.controller, 'open');

                figure.controllerOpen(mockElement, params);

                expect(openSpy).toHaveBeenCalledWith(mockElement, null, params);
            });
        });

        describe('retainFigureFormat', () => {
            it('should not throw when called', () => {
                const container = { className: 'se-component' };
                const originEl = {
                    parentNode: {
                        replaceChild: jest.fn(),
                        insertBefore: jest.fn(),
                        tagName: 'DIV'
                    },
                    parentElement: {
                        nodeName: 'DIV'
                    }
                };

                expect(() => {
                    figure.retainFigureFormat(container, originEl, null, null);
                }).not.toThrow();
            });
        });

        describe('More controllerAction tests', () => {
            it('should handle remove action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('remove')
                };
                const closeSpy = jest.spyOn(figure.controller, 'close');

                figure.controllerAction(button);

                expect(figure.inst.destroy).toHaveBeenCalledWith(mockElement);
                expect(closeSpy).toHaveBeenCalled();
            });

            it('should handle revert action', () => {
                const button = {
                    getAttribute: jest.fn().mockReturnValue('revert')
                };

                jest.spyOn(figure, '_setRevert').mockImplementation();

                figure.controllerAction(button);

                expect(figure._setRevert).toHaveBeenCalled();
                expect(figure.history.push).toHaveBeenCalledWith(false);
            });

            it('should handle selectMenu type', () => {
                const button = {
                    getAttribute: jest.fn((attr) => {
                        if (attr === 'data-command') return 'onalign';
                        if (attr === 'data-type') return 'selectMenu';
                        return null;
                    })
                };

                figure.controllerAction(button);

                // selectMenu types should return early
                expect(figure.history.push).not.toHaveBeenCalled();
            });

            it('should handle custom action', () => {
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
        });
    });
});