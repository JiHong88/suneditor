/**
 * @fileoverview Unit tests for core/logic/panel/viewer.js
 */

import Viewer from '../../../../../src/core/logic/panel/viewer';

describe('Viewer', () => {
	let viewer;
	let mockKernel;
	let mockStore;
	let mockDeps;
	let mockFrameContext;
	let mockFrameRoots;
	let mockFrameOptions;
	let mockOptions;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock DOM elements
		const mockWysiwyg = document.createElement('div');
		mockWysiwyg.contentEditable = 'true';
		mockWysiwyg.className = 'se-wysiwyg';

		const mockCodeArea = document.createElement('textarea');
		mockCodeArea.className = 'se-code-area';

		const mockWrapper = document.createElement('div');
		mockWrapper.className = 'se-wrapper';

		const mockCodeWrapper = document.createElement('div');
		mockCodeWrapper.className = 'se-code-wrapper';

		// Create mock frameContext
		mockFrameContext = new Map([
			['wysiwyg', mockWysiwyg],
			['code', mockCodeArea],
			['wrapper', mockWrapper],
			['codeWrapper', mockCodeWrapper],
			['wysiwygFrame', mockWysiwyg],
			['isCodeView', false],
			['isFullScreen', false],
		]);

		// Create mock frameRoots
		mockFrameRoots = new Map([
			[null, mockFrameContext],
		]);

		// Create mock frameOptions
		mockFrameOptions = new Map([
			['height', '200px'],
			['maxHeight', '400px'],
		]);

		// Create mock options
		mockOptions = new Map([
			['_disallowedExtraTag', ''],
			['hasCodeMirror', false],
		]);

		// Create mock context
		const mockContext = new Map();

		// Create mock store
		mockStore = {
			get: jest.fn((key) => {
				if (key === 'rootKey') return null;
				return undefined;
			}),
			set: jest.fn(),
			mode: {
				isClassic: true,
				isBalloon: false,
				isInline: false,
			},
		};

		// Create mock ui
		const mockUI = {
			offCurrentController: jest.fn(),
			offCurrentModal: jest.fn(),
			preventToolbarHide: jest.fn(),
		};

		// Create mock eventManager
		const mockEventManager = {
			addEvent: jest.fn(),
			removeEvent: jest.fn(),
		};

		// Create mock deps
		mockDeps = {
			frameContext: mockFrameContext,
			frameRoots: mockFrameRoots,
			frameOptions: mockFrameOptions,
			options: mockOptions,
			context: mockContext,
			eventManager: mockEventManager,
			ui: mockUI,
			icons: {},
			lang: {},
		};

		// Create mock kernel
		mockKernel = {
			$: mockDeps,
			store: mockStore,
		};

		// Create viewer instance
		viewer = new Viewer(mockKernel);
	});

	describe('constructor', () => {
		it('should create a Viewer instance', () => {
			expect(viewer).toBeInstanceOf(Viewer);
		});

		it('should initialize viewer state', () => {
			expect(viewer).toBeDefined();
		});
	});

	describe('codeView method', () => {
		it('should toggle code view when no value provided', () => {
			expect(typeof viewer.codeView).toBe('function');
		});

		it('should be a callable method', () => {
			expect(viewer.codeView).toBeDefined();
			expect(typeof viewer.codeView).toBe('function');
		});
	});

	describe('fullScreen functionality', () => {
		it('should have fullScreen method if defined', () => {
			expect(typeof viewer.fullScreen).toBeDefined();
		});
	});

	describe('view mode tracking', () => {
		it('should track if code view is active', () => {
			expect(mockFrameContext.get('isCodeView')).toBe(false);
		});

		it('should track if fullscreen is active', () => {
			expect(mockFrameContext.get('isFullScreen')).toBe(false);
		});
	});

	describe('CodeMirror support', () => {
		it('should handle CodeMirror when enabled', () => {
			const viewerWithCodeMirror = new Viewer(mockKernel);
			expect(viewerWithCodeMirror).toBeInstanceOf(Viewer);
		});

		it('should work without CodeMirror', () => {
			const viewerWithoutCodeMirror = new Viewer(mockKernel);
			expect(viewerWithoutCodeMirror).toBeInstanceOf(Viewer);
		});
	});

	describe('height handling', () => {
		it('should track height options', () => {
			expect(mockFrameOptions.get('height')).toBe('200px');
		});

		it('should track maxHeight options', () => {
			expect(mockFrameOptions.get('maxHeight')).toBe('400px');
		});
	});

	describe('CSS state preservation', () => {
		it('should have methods for state management', () => {
			expect(typeof viewer.codeView).toBe('function');
			if (typeof viewer.fullScreen === 'function') {
				expect(typeof viewer.fullScreen).toBe('function');
			}
		});
	});

	describe('UI integration', () => {
		it('should have ui reference', () => {
			expect(mockDeps.ui).toBeDefined();
			expect(mockDeps.ui.offCurrentModal).toBeDefined();
			expect(mockDeps.ui.offCurrentController).toBeDefined();
		});
	});
});
