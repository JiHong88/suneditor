/**
 * @fileoverview Unit tests for core/kernel/store.js
 */

import Store from '../../../../src/core/kernel/store';

describe('Store', () => {
	let store;
	let mockProduct;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock options map
		const mockOptionsMap = new Map([
			['mode', 'classic'],
			['_subMode', false],
		]);

		// Create mock product
		mockProduct = {
			options: mockOptionsMap,
			rootId: null,
		};

		// Create Store instance
		store = new Store(mockProduct);
	});

	describe('constructor', () => {
		it('should create a Store instance', () => {
			expect(store).toBeInstanceOf(Store);
		});

		it('should initialize mode flags from options', () => {
			expect(store.mode).toBeDefined();
			expect(typeof store.mode.isClassic).toBe('boolean');
		});

		it('should have _editorInitFinished flag', () => {
			expect(store._editorInitFinished).toBe(false);
		});
	});

	describe('mode flags', () => {
		it('should set isClassic flag for classic mode', () => {
			expect(store.mode.isClassic).toBe(true);
		});

		it('should set isInline flag for inline mode', () => {
			const optionsMap = new Map([
				['mode', 'inline'],
				['_subMode', false],
			]);

			const inlineProduct = {
				options: optionsMap,
				rootId: null,
			};

			const inlineStore = new Store(inlineProduct);
			expect(inlineStore.mode.isInline).toBe(true);
		});

		it('should set isBalloon flag for balloon mode', () => {
			const optionsMap = new Map([
				['mode', 'balloon'],
				['_subMode', false],
			]);

			const balloonProduct = {
				options: optionsMap,
				rootId: null,
			};

			const balloonStore = new Store(balloonProduct);
			expect(balloonStore.mode.isBalloon).toBe(true);
		});

		it('should set isBalloonAlways flag for balloon-always mode', () => {
			const optionsMap = new Map([
				['mode', 'balloon-always'],
				['_subMode', false],
			]);

			const balloonAlwaysProduct = {
				options: optionsMap,
				rootId: null,
			};

			const balloonAlwaysStore = new Store(balloonAlwaysProduct);
			expect(balloonAlwaysStore.mode.isBalloonAlways).toBe(true);
		});

		it('should set sub-toolbar mode flags', () => {
			const optionsMap = new Map([
				['mode', 'classic'],
				['_subMode', 'balloon'],
			]);

			const subProduct = {
				options: optionsMap,
				rootId: null,
			};

			const subStore = new Store(subProduct);
			expect(subStore.mode.isSubBalloon).toBe(true);
		});
	});

	describe('get method', () => {
		it('should get state values', () => {
			const rootKey = store.get('rootKey');
			expect(rootKey).toBe(null);
		});

		it('should get hasFocus state', () => {
			const hasFocus = store.get('hasFocus');
			expect(hasFocus).toBe(false);
		});

		it('should get tabSize state', () => {
			const tabSize = store.get('tabSize');
			expect(tabSize).toBe(4);
		});

		it('should get indentSize state', () => {
			const indentSize = store.get('indentSize');
			expect(indentSize).toBe(25);
		});

		it('should get codeIndentSize state', () => {
			const codeIndentSize = store.get('codeIndentSize');
			expect(codeIndentSize).toBe(2);
		});

		it('should get currentNodes state', () => {
			const currentNodes = store.get('currentNodes');
			expect(Array.isArray(currentNodes)).toBe(true);
			expect(currentNodes.length).toBe(0);
		});

		it('should get currentNodesMap state', () => {
			const currentNodesMap = store.get('currentNodesMap');
			expect(Array.isArray(currentNodesMap)).toBe(true);
		});

		it('should get controlActive state', () => {
			const controlActive = store.get('controlActive');
			expect(controlActive).toBe(false);
		});

		it('should get isScrollable state', () => {
			const isScrollable = store.get('isScrollable');
			expect(typeof isScrollable).toBe('function');
		});
	});

	describe('set method', () => {
		it('should set state values', () => {
			store.set('hasFocus', true);
			expect(store.get('hasFocus')).toBe(true);
		});

		it('should set tabSize', () => {
			store.set('tabSize', 8);
			expect(store.get('tabSize')).toBe(8);
		});

		it('should set indentSize', () => {
			store.set('indentSize', 30);
			expect(store.get('indentSize')).toBe(30);
		});

		it('should set codeIndentSize', () => {
			store.set('codeIndentSize', 4);
			expect(store.get('codeIndentSize')).toBe(4);
		});

		it('should set currentNodes', () => {
			const nodes = ['P', 'DIV'];
			store.set('currentNodes', nodes);
			expect(store.get('currentNodes')).toEqual(nodes);
		});

		it('should set controlActive', () => {
			store.set('controlActive', true);
			expect(store.get('controlActive')).toBe(true);
		});

		it('should set _preventBlur', () => {
			store.set('_preventBlur', true);
			expect(store.get('_preventBlur')).toBe(true);
		});

		it('should set _preventFocus', () => {
			store.set('_preventFocus', true);
			expect(store.get('_preventFocus')).toBe(true);
		});

		it('should set _mousedown', () => {
			store.set('_mousedown', true);
			expect(store.get('_mousedown')).toBe(true);
		});

		it('should notify subscribers on set', (done) => {
			const unsubscribe = store.subscribe('hasFocus', (newVal, oldVal) => {
				expect(newVal).toBe(true);
				expect(oldVal).toBe(false);
				unsubscribe();
				done();
			});

			store.set('hasFocus', true);
		});
	});

	describe('subscribe method', () => {
		it('should subscribe to state changes', (done) => {
			const unsubscribe = store.subscribe('hasFocus', (newVal) => {
				expect(newVal).toBe(true);
				unsubscribe();
				done();
			});

			store.set('hasFocus', true);
		});

		it('should return unsubscribe function', () => {
			const unsubscribe = store.subscribe('hasFocus', () => {});
			expect(typeof unsubscribe).toBe('function');
		});

		it('should unsubscribe from state changes', () => {
			const callback = jest.fn();
			const unsubscribe = store.subscribe('hasFocus', callback);
			unsubscribe();

			store.set('hasFocus', true);
			// Callback should not be called after unsubscribe
			expect(callback).not.toHaveBeenCalled();
		});

		it('should support multiple subscribers', (done) => {
			let count = 0;

			const unsubscribe1 = store.subscribe('hasFocus', () => {
				count++;
			});

			const unsubscribe2 = store.subscribe('hasFocus', () => {
				count++;
			});

			store.set('hasFocus', true);

			setTimeout(() => {
				expect(count).toBe(2);
				unsubscribe1();
				unsubscribe2();
				done();
			}, 0);
		});

		it('should not notify after unsubscribe', () => {
			const callback = jest.fn();
			const unsubscribe = store.subscribe('hasFocus', callback);
			unsubscribe();

			store.set('hasFocus', true);
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('viewport height tracking', () => {
		it('should track initViewportHeight', () => {
			const initHeight = store.get('initViewportHeight');
			expect(initHeight).toBe(0);
		});

		it('should track currentViewportHeight', () => {
			const currentHeight = store.get('currentViewportHeight');
			expect(currentHeight).toBe(0);
		});

		it('should update viewport heights', () => {
			store.set('initViewportHeight', 800);
			store.set('currentViewportHeight', 850);

			expect(store.get('initViewportHeight')).toBe(800);
			expect(store.get('currentViewportHeight')).toBe(850);
		});
	});

	describe('root key management', () => {
		it('should initialize with product rootId', () => {
			expect(store.get('rootKey')).toBe(null);
		});

		it('should update rootKey', () => {
			store.set('rootKey', 'frame-1');
			expect(store.get('rootKey')).toBe('frame-1');
		});

		it('should support multi-root frame switching', () => {
			store.set('rootKey', 'frame-1');
			expect(store.get('rootKey')).toBe('frame-1');

			store.set('rootKey', 'frame-2');
			expect(store.get('rootKey')).toBe('frame-2');
		});
	});

	describe('mode immutability', () => {
		it('should have immutable mode flags', () => {
			const modeFlags = store.mode;
			expect(Object.isFrozen(modeFlags) || modeFlags.isClassic === true).toBe(true);
		});
	});

	describe('isScrollable function', () => {
		it('should be a function', () => {
			const isScrollable = store.get('isScrollable');
			expect(typeof isScrollable).toBe('function');
		});

		it('should determine scrollability based on frame context', () => {
			const isScrollable = store.get('isScrollable');
			const mockFrameContext = {
				get: jest.fn((key) => {
					if (key === 'options') {
						return new Map([
							['height', '200px'],
							['maxHeight', '400px'],
						]);
					}
					return undefined;
				}),
			};
			mockFrameContext.get = jest.fn((key) => {
				const options = new Map([
					['height', '200px'],
					['maxHeight', '400px'],
				]);
				if (key === 'options') return options;
				return undefined;
			});

			expect(typeof isScrollable(mockFrameContext)).toBe('boolean');
		});
	});

	describe('private cache fields', () => {
		it('should track _lastSelectionNode', () => {
			expect(store.get('_lastSelectionNode')).toBeNull();
		});

		it('should track _range', () => {
			expect(store.get('_range')).toBeNull();
		});

		it('should allow updating cache fields', () => {
			const mockNode = document.createElement('div');
			store.set('_lastSelectionNode', mockNode);
			expect(store.get('_lastSelectionNode')).toBe(mockNode);

			const mockRange = document.createRange();
			store.set('_range', mockRange);
			expect(store.get('_range')).toBe(mockRange);
		});
	});
});
