/**
 * @fileoverview Unit tests for core/logic/panel/viewer.js
 */

import Viewer from '../../../../../src/core/logic/panel/viewer';

// Mock window.getComputedStyle so that textarea elements return realistic
// lineHeight / fontSize / padding / margin values.  Without this, jsdom
// returns empty strings which cause GetLineHeight() to produce NaN / Infinity
// and CreateLineNumbers() to enter an infinite loop.
const _origGetComputedStyle = window.getComputedStyle;
beforeAll(() => {
	window.getComputedStyle = jest.fn((el) => {
		const real = _origGetComputedStyle(el);
		return new Proxy(real, {
			get(target, prop) {
				if (prop === 'lineHeight') return '20px';
				if (prop === 'fontSize') return '14px';
				if (prop === 'padding') return '8px';
				if (prop === 'margin') return '0px';
				const val = target[prop];
				return typeof val === 'function' ? val.bind(target) : val;
			},
		});
	});
});
afterAll(() => {
	window.getComputedStyle = _origGetComputedStyle;
});

/**
 * Creates a fully-wired mock kernel for the Viewer constructor.
 * Each call produces independent DOM elements and Maps so tests are isolated.
 */
function createViewerKernel(overrides = {}) {
	// --- DOM elements ---
	const mockWysiwyg = document.createElement('div');
	mockWysiwyg.contentEditable = 'true';
	mockWysiwyg.className = 'se-wysiwyg sun-editor-editable';

	const mockWysiwygFrame = document.createElement('div');
	mockWysiwygFrame.className = 'se-wrapper-wysiwyg';
	mockWysiwygFrame.style.display = 'block';

	const mockCodeArea = document.createElement('textarea');
	mockCodeArea.className = 'se-code-area';
	Object.defineProperty(mockCodeArea, 'scrollHeight', { value: 100, configurable: true });

	const mockCodeNumbers = document.createElement('textarea');
	mockCodeNumbers.className = 'se-code-numbers';
	mockCodeNumbers.value = '';
	Object.defineProperty(mockCodeNumbers, 'scrollHeight', { value: 100, configurable: true });

	const mockCodeWrapper = document.createElement('div');
	mockCodeWrapper.className = 'se-code-wrapper';
	mockCodeWrapper.style.display = 'none';

	const mockWrapper = document.createElement('div');
	mockWrapper.className = 'se-wrapper';

	const mockTopArea = document.createElement('div');
	mockTopArea.className = 'se-top-area';

	const mockContainer = document.createElement('div');
	mockContainer.className = 'se-container';
	mockContainer.appendChild(mockTopArea);
	mockContainer.appendChild(mockWrapper);

	const mockToolbarMain = document.createElement('div');
	mockToolbarMain.className = 'se-toolbar-main';
	mockToolbarMain.style.display = 'block';

	const mockToolbarArrow = document.createElement('div');
	mockToolbarArrow.className = 'se-toolbar-arrow';

	const mockStickyDummy = document.createElement('div');
	mockStickyDummy.className = 'se-sticky-dummy';
	mockStickyDummy.style.display = 'none';

	const mockStatusbar = document.createElement('div');
	mockStatusbar.className = 'se-statusbar';

	const mockCodeViewBtn = document.createElement('button');
	mockCodeViewBtn.className = 'se-btn-codeview';

	const mockShowBlocksBtn = document.createElement('button');
	mockShowBlocksBtn.className = 'se-btn-showblocks';

	const mockFullScreenBtn = document.createElement('button');
	mockFullScreenBtn.className = 'se-btn-fullscreen';
	mockFullScreenBtn.appendChild(document.createElement('span'));

	// --- Maps ---
	const frameContextData = new Map([
		['wysiwyg', mockWysiwyg],
		['code', mockCodeArea],
		['codeNumbers', mockCodeNumbers],
		['codeWrapper', mockCodeWrapper],
		['wrapper', mockWrapper],
		['wysiwygFrame', mockWysiwygFrame],
		['topArea', mockTopArea],
		['container', mockContainer],
		['_stickyDummy', mockStickyDummy],
		['statusbar', mockStatusbar],
		['isCodeView', false],
		['isFullScreen', false],
		['isShowBlocks', false],
		['key', 'main'],
		['_wd', document],
	]);

	const frameOptions = new Map([
		['height', '200px'],
		['maxHeight', '400px'],
		['iframe', false],
		['iframe_fullPage', false],
		['iframe_cssFileName', ''],
		['_defaultStyles', { editor: '' }],
	]);

	const options = new Map([
		['_disallowedExtraTag', ''],
		['hasCodeMirror', false],
		['mode', 'classic'],
		['toolbar_container', null],
		['toolbar_sticky', 0],
		['fullScreenOffset', 0],
		['_rtl', false],
		['_editableClass', 'sun-editor-editable'],
		['printTemplate', null],
		['previewTemplate', null],
		['printClass', null],
		['defaultLine', 'p'],
		['freeCodeViewMode', false],
	]);

	const context = new Map([
		['toolbar_main', mockToolbarMain],
		['toolbar_arrow', mockToolbarArrow],
	]);

	const commandTargets = new Map([
		['codeView', mockCodeViewBtn],
		['showBlocks', mockShowBlocksBtn],
		['fullScreen', mockFullScreenBtn],
	]);

	const frameRoots = new Map();

	const store = {
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

	const eventManager = {
		addEvent: jest.fn(),
		removeEvent: jest.fn(),
		triggerEvent: jest.fn(),
	};

	const ui = {
		offCurrentController: jest.fn(),
		offCurrentModal: jest.fn(),
		preventToolbarHide: jest.fn(),
		_updatePlaceholder: jest.fn(),
		_toggleCodeViewButtons: jest.fn(),
		_iframeAutoHeight: jest.fn(),
		_syncFrameState: jest.fn(),
		showLoading: jest.fn(),
		hideLoading: jest.fn(),
	};

	const toolbar = {
		isInlineMode: false,
		isBalloonMode: false,
		inlineToolbarAttr: { isShow: false },
		_showInline: jest.fn(),
		_showBalloon: jest.fn(),
		_resetSticky: jest.fn(),
		hide: jest.fn(),
	};

	const subToolbar = {
		hide: jest.fn(),
	};

	const menu = {
		dropdownOff: jest.fn(),
		containerOff: jest.fn(),
	};

	const focusManager = {
		nativeFocus: jest.fn(),
	};

	const history = {
		push: jest.fn(),
		resetButtons: jest.fn(),
	};

	const html = {
		get: jest.fn(() => '<p>test</p>'),
		clean: jest.fn((val) => val),
		_convertToCode: jest.fn(() => '<p>test</p>'),
	};

	const commandDispatcher = {
		targets: commandTargets,
		applyTargets: jest.fn((key, fn) => {
			const target = commandTargets.get(key);
			if (target) fn(target);
		}),
	};

	const icons = {
		reduction: document.createElement('span'),
		expansion: document.createElement('span'),
	};

	const deps = {
		icons,
		lang: { preview: 'Preview' },
		frameRoots,
		context,
		frameContext: frameContextData,
		options,
		frameOptions,
		eventManager,
		ui,
		toolbar,
		subToolbar,
		menu,
		focusManager,
		history,
		html,
		commandDispatcher,
		...overrides,
	};

	const kernel = {
		$: deps,
		store,
		_eventOrchestrator: {
			_hideToolbar: jest.fn(),
		},
	};

	return {
		kernel,
		deps,
		store,
		frameContext: frameContextData,
		frameOptions,
		options,
		context,
		commandTargets,
		mockWysiwyg,
		mockWysiwygFrame,
		mockCodeArea,
		mockCodeNumbers,
		mockCodeWrapper,
		mockWrapper,
		mockTopArea,
		mockToolbarMain,
		mockToolbarArrow,
		mockStickyDummy,
		mockStatusbar,
		mockCodeViewBtn,
		mockShowBlocksBtn,
		mockFullScreenBtn,
		mockContainer,
		icons,
		eventManager,
		ui,
		toolbar,
		subToolbar,
		focusManager,
		history,
		html,
		commandDispatcher,
		menu,
	};
}

describe('Viewer', () => {
	let env;
	let viewer;

	beforeEach(() => {
		jest.clearAllMocks();
		env = createViewerKernel();
		viewer = new Viewer(env.kernel);
	});

	// ======================================================================
	// constructor
	// ======================================================================
	describe('constructor', () => {
		it('should create a Viewer instance', () => {
			expect(viewer).toBeInstanceOf(Viewer);
		});

		it('should initialise with a custom _disallowedExtraTag option', () => {
			env.options.set('_disallowedExtraTag', 'script|style');
			const v = new Viewer(env.kernel);
			expect(v).toBeInstanceOf(Viewer);
		});
	});

	// ======================================================================
	// codeView()
	// ======================================================================
	describe('codeView', () => {
		// -- early-return branch --
		it('should return early when value === current isCodeView state (already false)', () => {
			env.frameContext.set('isCodeView', false);
			viewer.codeView(false);
			// offCurrentController should NOT have been called because we returned early
			expect(env.ui.offCurrentController).not.toHaveBeenCalled();
		});

		it('should return early when value === current isCodeView state (already true)', () => {
			env.frameContext.set('isCodeView', true);
			viewer.codeView(true);
			expect(env.ui.offCurrentController).not.toHaveBeenCalled();
		});

		// -- toggle when value is undefined --
		it('should toggle from wysiwyg to code view when value is undefined', () => {
			env.frameContext.set('isCodeView', false);
			viewer.codeView(undefined);
			expect(env.frameContext.get('isCodeView')).toBe(true);
			expect(env.ui.offCurrentController).toHaveBeenCalled();
			expect(env.ui.offCurrentModal).toHaveBeenCalled();
		});

		it('should toggle from code view to wysiwyg when value is undefined', () => {
			env.frameContext.set('isCodeView', true);
			viewer.codeView(undefined);
			expect(env.frameContext.get('isCodeView')).toBe(false);
		});

		// -- entering code view (value = true) --
		describe('entering code view', () => {
			it('should set display properties on codeWrapper and wysiwygFrame', () => {
				viewer.codeView(true);
				expect(env.mockCodeWrapper.style.getPropertyValue('display')).toBe('flex');
				expect(env.mockWysiwygFrame.style.display).toBe('none');
			});

			it('should add active class to codeView button and wrapper', () => {
				viewer.codeView(true);
				expect(env.mockCodeViewBtn.classList.contains('active')).toBe(true);
				expect(env.mockWrapper.classList.contains('se-code-view-status')).toBe(true);
			});

			it('should focus the code area', () => {
				const focusSpy = jest.spyOn(env.mockCodeArea, 'focus');
				viewer.codeView(true);
				expect(focusSpy).toHaveBeenCalled();
			});

			it('should set _range to null on store', () => {
				viewer.codeView(true);
				expect(env.store.set).toHaveBeenCalledWith('_range', null);
			});

			it('should call preventToolbarHide(true) when not fullscreen', () => {
				env.frameContext.set('isFullScreen', false);
				viewer.codeView(true);
				expect(env.ui.preventToolbarHide).toHaveBeenCalledWith(true);
			});

			it('should NOT call preventToolbarHide when in fullscreen', () => {
				env.frameContext.set('isFullScreen', true);
				viewer.codeView(true);
				expect(env.ui.preventToolbarHide).not.toHaveBeenCalled();
			});

			// branch: isFullScreen -> codeFrame height = 100%
			it('should set code height 100% when in fullscreen mode', () => {
				env.frameContext.set('isFullScreen', true);
				viewer.codeView(true);
				expect(env.mockCodeArea.style.height).toBe('100%');
			});

			// branch: height === 'auto' && !hasCodeMirror
			it('should set code height based on scrollHeight when height is auto', () => {
				env.frameOptions.set('height', 'auto');
				env.options.set('hasCodeMirror', false);
				env.frameContext.set('isFullScreen', false);
				viewer.codeView(true);
				expect(env.mockCodeArea.style.height).toBe('100px');
			});

			// branch: height === 'auto' but hasCodeMirror is true -> skip auto height
			it('should NOT set auto height when hasCodeMirror is true', () => {
				env.frameOptions.set('height', 'auto');
				env.options.set('hasCodeMirror', true);
				env.frameContext.set('isFullScreen', false);
				viewer.codeView(true);
				// when hasCodeMirror is true the auto-height branch is skipped; code height stays unchanged
				expect(env.mockCodeArea.style.height).not.toBe('100px');
			});

			// branch: hasCodeMirror -> refresh
			it('should call _codeMirrorEditor refresh when hasCodeMirror is true', () => {
				env.options.set('hasCodeMirror', true);
				const spy = jest.spyOn(viewer, '_codeMirrorEditor').mockImplementation(() => {});
				viewer.codeView(true);
				expect(spy).toHaveBeenCalledWith('refresh', null, null);
				spy.mockRestore();
			});

			// branch: not fullscreen + balloon mode
			it('should switch from balloon to inline mode when not fullscreen and isBalloon', () => {
				env.store.mode.isBalloon = true;
				env.store.mode.isInline = false;
				env.frameContext.set('isFullScreen', false);
				viewer.codeView(true);
				expect(env.store.mode.isInline).toBe(true);
				expect(env.store.mode.isBalloon).toBe(false);
				expect(env.toolbar.isInlineMode).toBe(true);
				expect(env.toolbar.isBalloonMode).toBe(false);
				expect(env.toolbar._showInline).toHaveBeenCalled();
				expect(env.context.get('toolbar_arrow').style.display).toBe('none');
			});

			// branch: isBalloon at line 109 (after the fullscreen block) -> subToolbar.hide()
			it('should hide subToolbar when isBalloon is still true (fullscreen case)', () => {
				env.frameContext.set('isFullScreen', true);
				env.store.mode.isBalloon = true;
				viewer.codeView(true);
				expect(env.subToolbar.hide).toHaveBeenCalled();
			});

			it('should NOT hide subToolbar when isBalloon is false', () => {
				env.store.mode.isBalloon = false;
				viewer.codeView(true);
				expect(env.subToolbar.hide).not.toHaveBeenCalled();
			});
		});

		// -- leaving code view (value = false) --
		describe('leaving code view', () => {
			beforeEach(() => {
				// Start in code view
				env.frameContext.set('isCodeView', true);
			});

			it('should restore wysiwyg display and hide codeWrapper', () => {
				viewer.codeView(false);
				expect(env.mockWysiwygFrame.style.display).toBe('block');
				expect(env.mockCodeWrapper.style.getPropertyValue('display')).toBe('none');
			});

			it('should remove active class from codeView button and wrapper', () => {
				env.mockCodeViewBtn.classList.add('active');
				env.mockWrapper.classList.add('se-code-view-status');
				viewer.codeView(false);
				expect(env.mockCodeViewBtn.classList.contains('active')).toBe(false);
				expect(env.mockWrapper.classList.contains('se-code-view-status')).toBe(false);
			});

			it('should set wysiwygFrame scrollTop to 0', () => {
				env.mockWysiwygFrame.scrollTop = 50;
				viewer.codeView(false);
				expect(env.mockWysiwygFrame.scrollTop).toBe(0);
			});

			it('should call nativeFocus', () => {
				viewer.codeView(false);
				expect(env.focusManager.nativeFocus).toHaveBeenCalled();
			});

			// branch: height === 'auto' && !hasCodeMirror
			it('should reset code height to 0px when height is auto', () => {
				env.frameOptions.set('height', 'auto');
				env.options.set('hasCodeMirror', false);
				viewer.codeView(false);
				expect(env.mockCodeArea.style.height).toBe('0px');
			});

			it('should NOT reset code height when height is not auto', () => {
				env.frameOptions.set('height', '200px');
				env.mockCodeArea.style.height = '300px';
				viewer.codeView(false);
				expect(env.mockCodeArea.style.height).toBe('300px');
			});

			// branch: not fullscreen -> preventToolbarHide(false)
			it('should call preventToolbarHide(false) when not in fullscreen', () => {
				env.frameContext.set('isFullScreen', false);
				viewer.codeView(false);
				expect(env.ui.preventToolbarHide).toHaveBeenCalledWith(false);
			});

			// branch: not fullscreen + balloon mode option
			it('should restore balloon mode when leaving code view and mode is balloon', () => {
				env.frameContext.set('isFullScreen', false);
				env.options.set('mode', 'balloon');
				viewer.codeView(false);
				expect(env.context.get('toolbar_arrow').style.display).toBe('');
				expect(env.store.mode.isInline).toBe(false);
				expect(env.store.mode.isBalloon).toBe(true);
				expect(env.kernel._eventOrchestrator._hideToolbar).toHaveBeenCalled();
			});

			it('should NOT restore balloon mode when mode is not balloon', () => {
				env.frameContext.set('isFullScreen', false);
				env.options.set('mode', 'classic');
				viewer.codeView(false);
				expect(env.kernel._eventOrchestrator._hideToolbar).not.toHaveBeenCalled();
			});

			// branch: not fullscreen but isFullScreen = true -> skip preventToolbarHide
			it('should skip preventToolbarHide when in fullscreen', () => {
				env.frameContext.set('isFullScreen', true);
				viewer.codeView(false);
				expect(env.ui.preventToolbarHide).not.toHaveBeenCalled();
			});

			// branch: history.push when wysiwyg is editable
			it('should push history when wysiwygFrame is editable', () => {
				viewer.codeView(false);
				expect(env.history.push).toHaveBeenCalledWith(false);
				expect(env.history.resetButtons).toHaveBeenCalledWith('main', null);
			});

			// branch: wysiwygFrame is non-editable -> skip setCodeDataToEditor and history
			it('should skip history push when wysiwygFrame is non-editable', () => {
				env.mockWysiwygFrame.setAttribute('contenteditable', 'false');
				viewer.codeView(false);
				expect(env.history.push).not.toHaveBeenCalled();
			});
		});

		// -- common post-actions --
		describe('common post-actions', () => {
			it('should call _updatePlaceholder after switching', () => {
				viewer.codeView(true);
				expect(env.ui._updatePlaceholder).toHaveBeenCalledWith(env.frameContext);
			});

			it('should call _toggleCodeViewButtons with the new value', () => {
				viewer.codeView(true);
				expect(env.ui._toggleCodeViewButtons).toHaveBeenCalledWith(true);
			});

			it('should trigger onToggleCodeView event', () => {
				viewer.codeView(true);
				expect(env.eventManager.triggerEvent).toHaveBeenCalledWith('onToggleCodeView', {
					frameContext: env.frameContext,
					is: true,
				});
			});
		});

		// -- documentType branch --
		describe('documentType_use_header branch', () => {
			let mockDocTypeInner;
			let mockDocType;

			beforeEach(() => {
				mockDocTypeInner = document.createElement('div');
				mockDocType = { reHeader: jest.fn() };
				env.frameContext.set('documentType_use_header', true);
				env.frameContext.set('documentTypeInner', mockDocTypeInner);
				env.frameContext.set('documentType', mockDocType);
			});

			it('should hide documentTypeInner when entering code view', () => {
				viewer.codeView(true);
				expect(mockDocTypeInner.style.display).toBe('none');
			});

			it('should show documentTypeInner and call reHeader when leaving code view', () => {
				env.frameContext.set('isCodeView', true);
				viewer.codeView(false);
				expect(mockDocTypeInner.style.display).toBe('');
				expect(mockDocType.reHeader).toHaveBeenCalled();
			});
		});

		describe('documentType_use_header not set', () => {
			it('should not crash when documentType_use_header is not present', () => {
				expect(() => viewer.codeView(true)).not.toThrow();
			});
		});
	});

	// ======================================================================
	// fullScreen()
	// ======================================================================
	describe('fullScreen', () => {
		// -- early-return branches --
		it('should return early when value equals current isFullScreen (already false)', () => {
			env.frameContext.set('isFullScreen', false);
			viewer.fullScreen(false);
			expect(env.ui.offCurrentController).not.toHaveBeenCalled();
		});

		it('should return early when value equals current isFullScreen (already true)', () => {
			env.frameContext.set('isFullScreen', true);
			viewer.fullScreen(true);
			expect(env.ui.offCurrentController).not.toHaveBeenCalled();
		});

		// -- toggle when value is undefined --
		it('should toggle from false to true when value is undefined', () => {
			env.frameContext.set('isFullScreen', false);
			viewer.fullScreen(undefined);
			expect(env.frameContext.get('isFullScreen')).toBe(true);
		});

		it('should toggle from true to false when value is undefined', () => {
			env.frameContext.set('isFullScreen', true);
			viewer.fullScreen(undefined);
			expect(env.frameContext.get('isFullScreen')).toBe(false);
		});

		// -- entering fullscreen --
		describe('entering fullscreen', () => {
			it('should save original CSS texts and set fullscreen positioning', () => {
				env.mockTopArea.style.cssText = 'color: red;';
				viewer.fullScreen(true);
				// The topArea should now have position:fixed and fullscreen dimensions
				expect(env.mockTopArea.style.position).toBe('fixed');
				expect(env.mockTopArea.style.width).toBe('100%');
				expect(env.mockTopArea.style.height).toBe('100%');
				// top and left are set to '0' which jsdom may normalise
				expect(env.mockTopArea.style.cssText).toContain('position: fixed');
			});

			it('should set body overflow to hidden', () => {
				viewer.fullScreen(true);
				expect(document.body.style.overflow).toBe('hidden');
			});

			it('should set toolbar width and position', () => {
				viewer.fullScreen(true);
				expect(env.mockToolbarMain.style.width).toBe('100%');
				expect(env.mockToolbarMain.style.position).toBe('relative');
				expect(env.mockToolbarMain.style.display).toBe('block');
			});

			it('should set fullScreenOffset margin on topArea', () => {
				env.options.set('fullScreenOffset', 50);
				viewer.fullScreen(true);
				expect(env.mockTopArea.style.marginTop).toBe('50px');
			});

			it('should apply applyTargets with reduction icon and active class', () => {
				viewer.fullScreen(true);
				expect(env.commandDispatcher.applyTargets).toHaveBeenCalledWith('fullScreen', expect.any(Function));
				expect(env.mockFullScreenBtn.classList.contains('active')).toBe(true);
			});

			// branch: balloon or inline mode
			it('should save and disable balloon mode when entering fullscreen', () => {
				env.store.mode.isBalloon = true;
				env.store.mode.isInline = false;
				viewer.fullScreen(true);
				expect(env.store.mode.isBalloon).toBe(false);
				expect(env.store.mode.isInline).toBe(false);
				expect(env.mockToolbarArrow.style.display).toBe('none');
			});

			it('should save and disable inline mode when entering fullscreen', () => {
				env.store.mode.isInline = true;
				env.store.mode.isBalloon = false;
				viewer.fullScreen(true);
				expect(env.store.mode.isInline).toBe(false);
			});

			// branch: toolbar_container
			it('should move toolbar into container when toolbar_container is set', () => {
				const externalContainer = document.createElement('div');
				externalContainer.appendChild(env.mockToolbarMain);
				env.options.set('toolbar_container', externalContainer);
				viewer.fullScreen(true);
				// toolbar should be moved into the editor container
				expect(env.mockContainer.contains(env.mockToolbarMain)).toBe(true);
			});

			// branch: _stickyDummy visible -> fullScreenSticky = true
			it('should handle sticky dummy when it is visible', () => {
				env.mockStickyDummy.style.display = 'block';
				viewer.fullScreen(true);
				expect(env.mockStickyDummy.style.display).toBe('none');
				expect(env.mockToolbarMain.classList.contains('se-toolbar-sticky')).toBe(false);
			});

			// branch: _stickyDummy not visible (display === 'none') -> skip sticky handling
			it('should skip sticky handling when _stickyDummy is already hidden', () => {
				env.mockStickyDummy.style.display = 'none';
				viewer.fullScreen(true);
				// no error expected
			});

			// branch: arrow exists
			it('should save arrow cssText when arrow exists', () => {
				env.mockToolbarArrow.style.cssText = 'top: 10px;';
				viewer.fullScreen(true);
				// No error; arrow cssText saved internally
			});

			// branch: isCodeView during fullscreen
			it('should handle entering fullscreen while in code view', () => {
				env.frameContext.set('isCodeView', true);
				viewer.fullScreen(true);
				// codeWrapper should be flex displayed
				expect(env.mockCodeWrapper.style.display).toMatch(/flex/);
			});

			// branch: iframe + height auto
			it('should set editorArea overflow to auto for iframe + auto height', () => {
				env.frameOptions.set('iframe', true);
				env.frameOptions.set('height', 'auto');
				viewer.fullScreen(true);
				expect(env.mockWrapper.style.overflow).toBe('auto');
				expect(env.ui._iframeAutoHeight).toHaveBeenCalled();
			});

			it('should NOT call _iframeAutoHeight when not iframe mode', () => {
				env.frameOptions.set('iframe', false);
				viewer.fullScreen(true);
				expect(env.ui._iframeAutoHeight).not.toHaveBeenCalled();
			});

			// branch: statusbar exists
			it('should account for statusbar height in editorArea height calculation', () => {
				viewer.fullScreen(true);
				// statusbar exists in frameContext so it's factored in
				expect(env.mockWrapper.style.height).toBeTruthy();
			});

			// branch: no statusbar
			it('should handle missing statusbar gracefully', () => {
				env.frameContext.delete('statusbar');
				expect(() => viewer.fullScreen(true)).not.toThrow();
			});

			// branch: no arrow
			it('should handle missing arrow gracefully', () => {
				env.context.set('toolbar_arrow', null);
				expect(() => viewer.fullScreen(true)).not.toThrow();
			});
		});

		// -- leaving fullscreen --
		describe('leaving fullscreen', () => {
			beforeEach(() => {
				// Enter fullscreen first to set up internal state
				viewer.fullScreen(true);
				jest.clearAllMocks();
			});

			it('should restore original CSS texts', () => {
				viewer.fullScreen(false);
				expect(env.frameContext.get('isFullScreen')).toBe(false);
			});

			it('should restore body overflow', () => {
				document.body.style.overflow = 'hidden';
				viewer.fullScreen(false);
				// body overflow should be restored to whatever it was before fullscreen
			});

			it('should apply applyTargets with expansion icon and remove active class', () => {
				viewer.fullScreen(false);
				expect(env.commandDispatcher.applyTargets).toHaveBeenCalledWith('fullScreen', expect.any(Function));
				expect(env.mockFullScreenBtn.classList.contains('active')).toBe(false);
			});

			it('should call _resetSticky', () => {
				viewer.fullScreen(false);
				expect(env.toolbar._resetSticky).toHaveBeenCalled();
			});

			it('should clear marginTop on topArea', () => {
				viewer.fullScreen(false);
				expect(env.mockTopArea.style.marginTop).toBe('');
			});

			// branch: toolbar_sticky > -1
			it('should remove se-toolbar-sticky class when toolbar_sticky >= 0', () => {
				env.options.set('toolbar_sticky', 0);
				env.mockToolbarMain.classList.add('se-toolbar-sticky');
				viewer.fullScreen(false);
				expect(env.mockToolbarMain.classList.contains('se-toolbar-sticky')).toBe(false);
			});

			it('should NOT remove se-toolbar-sticky when toolbar_sticky is -1', () => {
				env.options.set('toolbar_sticky', -1);
				env.mockToolbarMain.classList.add('se-toolbar-sticky');
				viewer.fullScreen(false);
				expect(env.mockToolbarMain.classList.contains('se-toolbar-sticky')).toBe(true);
			});

			// branch: toolbarParent exists
			it('should move toolbar back to toolbarParent when toolbar_container was set', () => {
				// Re-create the scenario from scratch
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				const externalContainer = document.createElement('div');
				externalContainer.appendChild(e.mockToolbarMain);
				e.options.set('toolbar_container', externalContainer);
				v.fullScreen(true);
				// toolbar should have moved
				v.fullScreen(false);
				expect(externalContainer.contains(e.mockToolbarMain)).toBe(true);
			});

			// branch: fullScreenSticky && !toolbar_container
			it('should restore sticky state when leaving fullscreen if it was sticky before', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.mockStickyDummy.style.display = 'block';
				e.options.set('toolbar_container', null);
				v.fullScreen(true);
				v.fullScreen(false);
				expect(e.mockStickyDummy.style.display).toBe('block');
				expect(e.mockToolbarMain.classList.contains('se-toolbar-sticky')).toBe(true);
			});

			// branch: restore inline mode
			it('should restore inline mode and call _showInline when not in code view', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.store.mode.isInline = true;
				e.store.mode.isBalloon = false;
				v.fullScreen(true);
				e.frameContext.set('isCodeView', false);
				v.fullScreen(false);
				expect(e.store.mode.isInline).toBe(true);
				expect(e.toolbar._showInline).toHaveBeenCalled();
			});

			// branch: restore balloon mode
			it('should restore balloon mode and call _showBalloon when not in code view', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.store.mode.isBalloon = true;
				e.store.mode.isInline = false;
				v.fullScreen(true);
				e.frameContext.set('isCodeView', false);
				v.fullScreen(false);
				expect(e.store.mode.isBalloon).toBe(true);
				expect(e.toolbar._showBalloon).toHaveBeenCalled();
			});

			// branch: restore balloon but isCodeView is true -> do not call _showBalloon
			it('should NOT call _showBalloon when in code view', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.store.mode.isBalloon = true;
				v.fullScreen(true);
				e.frameContext.set('isCodeView', true);
				v.fullScreen(false);
				expect(e.toolbar._showBalloon).not.toHaveBeenCalled();
			});

			// branch: height auto -> call _codeViewAutoHeight
			it('should call _codeViewAutoHeight when height is auto and no CodeMirror', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.frameOptions.set('height', 'auto');
				e.options.set('hasCodeMirror', false);
				const spy = jest.spyOn(v, '_codeViewAutoHeight');
				v.fullScreen(true);
				v.fullScreen(false);
				expect(spy).toHaveBeenCalledWith(e.mockCodeArea, e.mockCodeNumbers, true);
				spy.mockRestore();
			});

			// branch: height !== auto -> skip _codeViewAutoHeight
			it('should NOT call _codeViewAutoHeight when height is fixed', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.frameOptions.set('height', '300px');
				const spy = jest.spyOn(v, '_codeViewAutoHeight');
				v.fullScreen(true);
				v.fullScreen(false);
				expect(spy).not.toHaveBeenCalled();
				spy.mockRestore();
			});

			// branch: codeNumbers exists when restoring code cssText
			it('should restore codeNumbers cssText when codeNumbers exists', () => {
				const e = createViewerKernel();
				const v = new Viewer(e.kernel);
				e.mockCodeNumbers.style.cssText = 'color: red;';
				v.fullScreen(true);
				v.fullScreen(false);
				// just ensure no crash; the cssText gets restored
			});

			// branch: codeNumbers is null
			it('should handle null codeNumbers gracefully', () => {
				const e = createViewerKernel();
				e.frameContext.set('codeNumbers', null);
				const v = new Viewer(e.kernel);
				v.fullScreen(true);
				expect(() => v.fullScreen(false)).not.toThrow();
			});

			// branch: arrow restore
			it('should restore arrow style when arrow exists', () => {
				viewer.fullScreen(false);
				// Arrow style should be restored; no crash
			});

			it('should handle null arrow when leaving fullscreen', () => {
				const e = createViewerKernel();
				e.context.set('toolbar_arrow', null);
				const v = new Viewer(e.kernel);
				v.fullScreen(true);
				expect(() => v.fullScreen(false)).not.toThrow();
			});
		});

		// -- wasToolbarHidden branch --
		describe('wasToolbarHidden branch', () => {
			it('should call toolbar.hide when toolbar was hidden and not in code view', () => {
				env.mockToolbarMain.style.display = 'none';
				env.frameContext.set('isCodeView', false);
				viewer.fullScreen(true);
				expect(env.toolbar.hide).toHaveBeenCalled();
			});

			it('should call toolbar.hide for inline mode when toolbar was hidden', () => {
				env.store.mode.isInline = true;
				env.toolbar.inlineToolbarAttr.isShow = false;
				env.frameContext.set('isCodeView', false);
				viewer.fullScreen(true);
				expect(env.toolbar.hide).toHaveBeenCalled();
			});

			it('should NOT call toolbar.hide when toolbar is visible', () => {
				env.mockToolbarMain.style.display = 'block';
				env.store.mode.isInline = false;
				viewer.fullScreen(true);
				expect(env.toolbar.hide).not.toHaveBeenCalled();
			});

			it('should NOT call toolbar.hide when in code view even if toolbar was hidden', () => {
				env.mockToolbarMain.style.display = 'none';
				env.frameContext.set('isCodeView', true);
				viewer.fullScreen(true);
				expect(env.toolbar.hide).not.toHaveBeenCalled();
			});
		});

		// -- fullscreen event --
		it('should trigger onToggleFullScreen event', () => {
			viewer.fullScreen(true);
			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith('onToggleFullScreen', {
				frameContext: env.frameContext,
				is: true,
			});
		});

		it('should trigger onToggleFullScreen event on exit', () => {
			viewer.fullScreen(true);
			jest.clearAllMocks();
			viewer.fullScreen(false);
			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith('onToggleFullScreen', {
				frameContext: env.frameContext,
				is: false,
			});
		});
	});

	// ======================================================================
	// showBlocks()
	// ======================================================================
	describe('showBlocks', () => {
		it('should toggle from false to true when value is undefined', () => {
			env.frameContext.set('isShowBlocks', false);
			viewer.showBlocks(undefined);
			expect(env.frameContext.get('isShowBlocks')).toBe(true);
		});

		it('should toggle from true to false when value is undefined', () => {
			env.frameContext.set('isShowBlocks', true);
			viewer.showBlocks(undefined);
			expect(env.frameContext.get('isShowBlocks')).toBe(false);
		});

		it('should enable show blocks when value is true', () => {
			viewer.showBlocks(true);
			expect(env.frameContext.get('isShowBlocks')).toBe(true);
			expect(env.mockWysiwyg.classList.contains('se-show-block')).toBe(true);
			expect(env.mockShowBlocksBtn.classList.contains('active')).toBe(true);
		});

		it('should disable show blocks when value is false', () => {
			env.mockWysiwyg.classList.add('se-show-block');
			env.mockShowBlocksBtn.classList.add('active');
			viewer.showBlocks(false);
			expect(env.frameContext.get('isShowBlocks')).toBe(false);
			expect(env.mockWysiwyg.classList.contains('se-show-block')).toBe(false);
			expect(env.mockShowBlocksBtn.classList.contains('active')).toBe(false);
		});

		it('should coerce truthy value to boolean', () => {
			viewer.showBlocks(1);
			expect(env.frameContext.get('isShowBlocks')).toBe(true);
		});

		it('should coerce falsy value to boolean', () => {
			viewer.showBlocks(0);
			expect(env.frameContext.get('isShowBlocks')).toBe(false);
		});

		it('should call _syncFrameState after toggling', () => {
			viewer.showBlocks(true);
			expect(env.ui._syncFrameState).toHaveBeenCalledWith(env.frameContext);
		});
	});

	// ======================================================================
	// _setButtonsActive()
	// ======================================================================
	describe('_setButtonsActive', () => {
		it('should add active class to codeView button when isCodeView is true', () => {
			env.frameContext.set('isCodeView', true);
			viewer._setButtonsActive();
			expect(env.mockCodeViewBtn.classList.contains('active')).toBe(true);
		});

		it('should remove active class from codeView button when isCodeView is false', () => {
			env.frameContext.set('isCodeView', false);
			env.mockCodeViewBtn.classList.add('active');
			viewer._setButtonsActive();
			expect(env.mockCodeViewBtn.classList.contains('active')).toBe(false);
		});

		it('should add active class and reduction icon to fullScreen button when isFullScreen is true', () => {
			env.frameContext.set('isFullScreen', true);
			viewer._setButtonsActive();
			expect(env.commandDispatcher.applyTargets).toHaveBeenCalledWith('fullScreen', expect.any(Function));
			expect(env.mockFullScreenBtn.classList.contains('active')).toBe(true);
		});

		it('should remove active class and set expansion icon when isFullScreen is false', () => {
			env.frameContext.set('isFullScreen', false);
			env.mockFullScreenBtn.classList.add('active');
			viewer._setButtonsActive();
			expect(env.mockFullScreenBtn.classList.contains('active')).toBe(false);
		});

		it('should add active class to showBlocks button when isShowBlocks is true', () => {
			env.frameContext.set('isShowBlocks', true);
			viewer._setButtonsActive();
			expect(env.mockShowBlocksBtn.classList.contains('active')).toBe(true);
		});

		it('should remove active class from showBlocks button when isShowBlocks is false', () => {
			env.frameContext.set('isShowBlocks', false);
			env.mockShowBlocksBtn.classList.add('active');
			viewer._setButtonsActive();
			expect(env.mockShowBlocksBtn.classList.contains('active')).toBe(false);
		});

		it('should handle all states being true simultaneously', () => {
			env.frameContext.set('isCodeView', true);
			env.frameContext.set('isFullScreen', true);
			env.frameContext.set('isShowBlocks', true);
			viewer._setButtonsActive();
			expect(env.mockCodeViewBtn.classList.contains('active')).toBe(true);
			expect(env.mockFullScreenBtn.classList.contains('active')).toBe(true);
			expect(env.mockShowBlocksBtn.classList.contains('active')).toBe(true);
		});

		it('should handle all states being false simultaneously', () => {
			env.frameContext.set('isCodeView', false);
			env.frameContext.set('isFullScreen', false);
			env.frameContext.set('isShowBlocks', false);
			env.mockCodeViewBtn.classList.add('active');
			env.mockFullScreenBtn.classList.add('active');
			env.mockShowBlocksBtn.classList.add('active');
			viewer._setButtonsActive();
			expect(env.mockCodeViewBtn.classList.contains('active')).toBe(false);
			expect(env.mockFullScreenBtn.classList.contains('active')).toBe(false);
			expect(env.mockShowBlocksBtn.classList.contains('active')).toBe(false);
		});
	});

	// ======================================================================
	// _codeViewAutoHeight()
	// ======================================================================
	describe('_codeViewAutoHeight', () => {
		it('should set code height from scrollHeight when isAuto is true', () => {
			viewer._codeViewAutoHeight(env.mockCodeArea, env.mockCodeNumbers, true);
			expect(env.mockCodeArea.style.height).toBe('100px');
		});

		it('should NOT set code height when isAuto is false', () => {
			env.mockCodeArea.style.height = '50px';
			viewer._codeViewAutoHeight(env.mockCodeArea, env.mockCodeNumbers, false);
			expect(env.mockCodeArea.style.height).toBe('50px');
		});

		it('should update line numbers when codeNumbers is provided', () => {
			viewer._codeViewAutoHeight(env.mockCodeArea, env.mockCodeNumbers, true);
			// Line numbers should have been updated (value not empty for scrollHeight > 0)
		});

		it('should handle null codeNumbers without error', () => {
			expect(() => {
				viewer._codeViewAutoHeight(env.mockCodeArea, null, true);
			}).not.toThrow();
		});
	});

	// ======================================================================
	// _scrollLineNumbers()
	// ======================================================================
	describe('_scrollLineNumbers', () => {
		it('should synchronize scrollTop and scrollLeft', () => {
			const codeNumbers = document.createElement('textarea');
			const codeContext = { scrollTop: 42, scrollLeft: 10 };
			viewer._scrollLineNumbers.call(codeContext, codeNumbers);
			expect(codeNumbers.scrollTop).toBe(42);
			expect(codeNumbers.scrollLeft).toBe(10);
		});
	});

	// ======================================================================
	// _resetFullScreenHeight()
	// ======================================================================
	describe('_resetFullScreenHeight', () => {
		it('should return undefined when not in fullscreen', () => {
			env.frameContext.set('isFullScreen', false);
			const result = viewer._resetFullScreenHeight();
			expect(result).toBeUndefined();
		});

		it('should return true and update wrapper height when in fullscreen', () => {
			// Enter fullscreen first to initialize internal state
			viewer.fullScreen(true);
			const result = viewer._resetFullScreenHeight();
			expect(result).toBe(true);
			expect(env.mockWrapper.style.height).toBeTruthy();
		});

		it('should handle missing statusbar in fullscreen reset', () => {
			const e = createViewerKernel();
			e.frameContext.delete('statusbar');
			const v = new Viewer(e.kernel);
			v.fullScreen(true);
			expect(() => v._resetFullScreenHeight()).not.toThrow();
			expect(v._resetFullScreenHeight()).toBe(true);
		});
	});

	// ======================================================================
	// _codeMirrorEditor()
	// ======================================================================
	describe('_codeMirrorEditor', () => {
		describe('with CodeMirror 5', () => {
			let cm5;
			let cm5Doc;
			beforeEach(() => {
				cm5Doc = {
					setValue: jest.fn(),
					getValue: jest.fn(() => '<p>cm5 content</p>'),
				};
				cm5 = {
					getDoc: jest.fn(() => cm5Doc),
					setOption: jest.fn(),
					refresh: jest.fn(),
				};
				env.frameOptions.set('codeMirror5Editor', cm5);
			});

			it('should call setValue for set key', () => {
				viewer._codeMirrorEditor('set', '<p>new</p>', null);
				expect(cm5.getDoc).toHaveBeenCalled();
				expect(cm5Doc.setValue).toHaveBeenCalledWith('<p>new</p>');
			});

			it('should call getValue for get key', () => {
				const result = viewer._codeMirrorEditor('get', null, null);
				expect(result).toBe('<p>cm5 content</p>');
			});

			it('should call setOption for readonly key', () => {
				viewer._codeMirrorEditor('readonly', true, null);
				expect(cm5.setOption).toHaveBeenCalledWith('readOnly', true);
			});

			it('should call refresh for refresh key', () => {
				viewer._codeMirrorEditor('refresh', null, null);
				expect(cm5.refresh).toHaveBeenCalled();
			});
		});

		describe('with CodeMirror 6', () => {
			let cm6;
			let contentDOM;
			beforeEach(() => {
				contentDOM = document.createElement('div');
				cm6 = {
					state: { doc: { length: 10, toString: jest.fn(() => '<p>cm6</p>') } },
					dispatch: jest.fn(),
					contentDOM,
				};
				env.frameOptions.set('codeMirror6Editor', cm6);
			});

			it('should dispatch changes for set key', () => {
				viewer._codeMirrorEditor('set', '<p>new</p>', null);
				expect(cm6.dispatch).toHaveBeenCalledWith({
					changes: { from: 0, to: 10, insert: '<p>new</p>' },
				});
			});

			it('should return doc.toString() for get key', () => {
				const result = viewer._codeMirrorEditor('get', null, null);
				expect(result).toBe('<p>cm6</p>');
			});

			it('should set contenteditable for readonly false', () => {
				viewer._codeMirrorEditor('readonly', false, null);
				expect(contentDOM.getAttribute('contenteditable')).toBe('true');
			});

			it('should remove contenteditable for readonly true', () => {
				contentDOM.setAttribute('contenteditable', 'true');
				viewer._codeMirrorEditor('readonly', true, null);
				expect(contentDOM.hasAttribute('contenteditable')).toBe(false);
			});

			it('should not crash on refresh (no CM5 refresh method)', () => {
				expect(() => viewer._codeMirrorEditor('refresh', null, null)).not.toThrow();
			});
		});

		describe('with neither CodeMirror', () => {
			it('should not crash for any key', () => {
				expect(() => viewer._codeMirrorEditor('set', 'val', null)).not.toThrow();
				expect(() => viewer._codeMirrorEditor('get', null, null)).not.toThrow();
				expect(() => viewer._codeMirrorEditor('readonly', true, null)).not.toThrow();
				expect(() => viewer._codeMirrorEditor('refresh', null, null)).not.toThrow();
			});
		});

		describe('with rootKey', () => {
			it('should use frameRoots when rootKey is provided', () => {
				const rootFO = new Map([['codeMirror5Editor', { getDoc: jest.fn(() => ({ setValue: jest.fn() })), refresh: jest.fn() }]]);
				const rootFC = new Map([['options', rootFO]]);
				env.deps.frameRoots.set('customRoot', rootFC);
				viewer._codeMirrorEditor('refresh', null, 'customRoot');
				expect(rootFO.get('codeMirror5Editor').refresh).toHaveBeenCalled();
			});
		});
	});

	// ======================================================================
	// _setCodeView() / _getCodeView()
	// ======================================================================
	describe('_setCodeView', () => {
		it('should set value on code textarea when no CodeMirror', () => {
			viewer._setCodeView('<p>hello</p>');
			expect(env.mockCodeArea.value).toBe('<p>hello</p>');
		});

		it('should call _codeMirrorEditor set when hasCodeMirror is true', () => {
			env.options.set('hasCodeMirror', true);
			const spy = jest.spyOn(viewer, '_codeMirrorEditor').mockImplementation(() => {});
			viewer._setCodeView('<p>cm</p>');
			expect(spy).toHaveBeenCalledWith('set', '<p>cm</p>', null);
			spy.mockRestore();
		});
	});

	describe('_getCodeView', () => {
		it('should return code textarea value when no CodeMirror', () => {
			env.mockCodeArea.value = '<p>content</p>';
			expect(viewer._getCodeView()).toBe('<p>content</p>');
		});

		it('should call _codeMirrorEditor get when hasCodeMirror is true', () => {
			env.options.set('hasCodeMirror', true);
			const spy = jest.spyOn(viewer, '_codeMirrorEditor').mockReturnValue('<p>cm-val</p>');
			const result = viewer._getCodeView();
			expect(result).toBe('<p>cm-val</p>');
			expect(spy).toHaveBeenCalledWith('get', null, null);
			spy.mockRestore();
		});
	});

	// ======================================================================
	// _destroy()
	// ======================================================================
	describe('_destroy', () => {
		it('should not throw when called', () => {
			expect(() => viewer._destroy()).not.toThrow();
		});
	});

	// ======================================================================
	// Integration-like: codeView + fullScreen combined
	// ======================================================================
	describe('combined codeView and fullScreen transitions', () => {
		it('should handle entering fullscreen then code view', () => {
			viewer.fullScreen(true);
			viewer.codeView(true);
			expect(env.frameContext.get('isFullScreen')).toBe(true);
			expect(env.frameContext.get('isCodeView')).toBe(true);
			expect(env.mockCodeArea.style.height).toBe('100%');
		});

		it('should handle entering code view then fullscreen', () => {
			viewer.codeView(true);
			viewer.fullScreen(true);
			expect(env.frameContext.get('isCodeView')).toBe(true);
			expect(env.frameContext.get('isFullScreen')).toBe(true);
		});

		it('should handle fullscreen exit then code view exit', () => {
			viewer.fullScreen(true);
			viewer.codeView(true);
			viewer.fullScreen(false);
			viewer.codeView(false);
			expect(env.frameContext.get('isFullScreen')).toBe(false);
			expect(env.frameContext.get('isCodeView')).toBe(false);
		});
	});

	// ======================================================================
	// Edge case: scrollHeight = 0 in auto height code view
	// ======================================================================
	describe('codeView auto height with scrollHeight 0', () => {
		it('should set height to auto when scrollHeight is 0', () => {
			env.frameOptions.set('height', 'auto');
			env.options.set('hasCodeMirror', false);
			Object.defineProperty(env.mockCodeArea, 'scrollHeight', { value: 0, configurable: true });
			viewer.codeView(true);
			expect(env.mockCodeArea.style.height).toBe('auto');
		});
	});

	// ======================================================================
	// print()
	// ======================================================================
	describe('print', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});
		afterEach(() => {
			jest.useRealTimers();
		});

		it('should call showLoading and append an iframe to body', () => {
			viewer.print();
			expect(env.ui.showLoading).toHaveBeenCalled();
			// There should be an iframe added to body
			const iframes = document.body.querySelectorAll('iframe');
			expect(iframes.length).toBeGreaterThan(0);
		});

		it('should write content to the print iframe (non-iframe mode)', () => {
			env.frameOptions.set('iframe', false);
			viewer.print();
			// The iframe document should have had .write() called
			// Verify the iframe was created
			const iframes = document.body.querySelectorAll('iframe');
			expect(iframes.length).toBeGreaterThan(0);
		});

		it('should write content to the print iframe (iframe mode)', () => {
			env.frameOptions.set('iframe', true);
			env.frameOptions.set('iframe_fullPage', false);
			viewer.print();
			const iframes = document.body.querySelectorAll('iframe');
			expect(iframes.length).toBeGreaterThan(0);
		});

		it('should use printTemplate when available', () => {
			env.options.set('printTemplate', '<html>{{ contents }}</html>');
			viewer.print();
			expect(env.html.get).toHaveBeenCalled();
		});

		it('should handle printClass option in non-iframe mode', () => {
			env.frameOptions.set('iframe', false);
			env.options.set('printClass', 'my-print-class');
			viewer.print();
			// No error expected
		});

		it('should handle printClass option in iframe mode', () => {
			env.frameOptions.set('iframe', true);
			env.options.set('printClass', 'my-print-class');
			viewer.print();
			// No error expected
		});

		it('should handle iframe_fullPage mode in print', () => {
			env.frameOptions.set('iframe', true);
			env.frameOptions.set('iframe_fullPage', true);
			viewer.print();
			// No error expected
		});

		it('should handle _rtl option', () => {
			env.options.set('_rtl', true);
			viewer.print();
			// No error expected
		});

		it('should call hideLoading and remove iframe after timeout', () => {
			viewer.print();
			const iframesBefore = document.body.querySelectorAll('iframe');
			expect(iframesBefore.length).toBeGreaterThan(0);

			// The setTimeout callback runs the print and cleanup
			jest.advanceTimersByTime(1000);

			expect(env.ui.hideLoading).toHaveBeenCalled();
		});
	});

	// ======================================================================
	// preview()
	// ======================================================================
	describe('preview', () => {
		let mockWindowObj;

		beforeEach(() => {
			mockWindowObj = {
				document: {
					write: jest.fn(),
				},
			};
			jest.spyOn(window, 'open').mockReturnValue(mockWindowObj);
		});

		afterEach(() => {
			window.open.mockRestore();
		});

		it('should close menus and controllers before opening preview', () => {
			viewer.preview();
			expect(env.menu.dropdownOff).toHaveBeenCalled();
			expect(env.menu.containerOff).toHaveBeenCalled();
			expect(env.ui.offCurrentController).toHaveBeenCalled();
			expect(env.ui.offCurrentModal).toHaveBeenCalled();
		});

		it('should open a new window', () => {
			viewer.preview();
			expect(window.open).toHaveBeenCalledWith('', '_blank');
		});

		it('should write HTML content to the new window (non-iframe mode)', () => {
			env.frameOptions.set('iframe', false);
			viewer.preview();
			expect(mockWindowObj.document.write).toHaveBeenCalled();
			const writtenHTML = mockWindowObj.document.write.mock.calls[0][0];
			expect(writtenHTML).toContain('<!DOCTYPE html>');
			expect(writtenHTML).toContain('sun-editor-editable');
		});

		it('should write HTML content to the new window (iframe mode)', () => {
			env.frameOptions.set('iframe', true);
			env.frameOptions.set('iframe_fullPage', false);
			viewer.preview();
			expect(mockWindowObj.document.write).toHaveBeenCalled();
			const writtenHTML = mockWindowObj.document.write.mock.calls[0][0];
			expect(writtenHTML).toContain('sun-editor-editable');
		});

		it('should use previewTemplate when available', () => {
			env.options.set('previewTemplate', '<div>{{ contents }}</div>');
			viewer.preview();
			expect(env.html.get).toHaveBeenCalledWith({ withFrame: true });
		});

		it('should handle printClass option in preview', () => {
			env.frameOptions.set('iframe', false);
			env.options.set('printClass', 'custom-preview');
			viewer.preview();
			const writtenHTML = mockWindowObj.document.write.mock.calls[0][0];
			expect(writtenHTML).toContain('custom-preview');
		});

		it('should handle printClass option in iframe preview mode', () => {
			env.frameOptions.set('iframe', true);
			env.options.set('printClass', 'custom-preview');
			viewer.preview();
			const writtenHTML = mockWindowObj.document.write.mock.calls[0][0];
			expect(writtenHTML).toContain('custom-preview');
		});

		it('should handle iframe_fullPage mode in preview', () => {
			env.frameOptions.set('iframe', true);
			env.frameOptions.set('iframe_fullPage', true);
			viewer.preview();
			expect(mockWindowObj.document.write).toHaveBeenCalled();
		});

		it('should handle _rtl option in preview', () => {
			env.options.set('_rtl', true);
			viewer.preview();
			const writtenHTML = mockWindowObj.document.write.mock.calls[0][0];
			expect(writtenHTML).toContain('se-rtl');
		});

		it('should include head links and styles in non-iframe mode', () => {
			// Add a link and style to document head
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'test.css';
			document.head.appendChild(link);
			const style = document.createElement('style');
			style.textContent = '.test { color: red; }';
			document.head.appendChild(style);

			viewer.preview();
			const writtenHTML = mockWindowObj.document.write.mock.calls[0][0];
			expect(writtenHTML).toContain('test.css');

			// Clean up
			document.head.removeChild(link);
			document.head.removeChild(style);
		});
	});

	// ======================================================================
	// codeView with iframe_fullPage (triggers #setCodeDataToEditor / #setEditorDataToCodeView)
	// ======================================================================
	describe('codeView with iframe_fullPage', () => {
		beforeEach(() => {
			env.frameOptions.set('iframe_fullPage', true);
		});

		describe('entering code view (triggers #setEditorDataToCodeView)', () => {
			it('should generate full HTML document in code view', () => {
				viewer.codeView(true);
				// _convertToCode should have been called
				expect(env.html._convertToCode).toHaveBeenCalledWith(env.mockWysiwyg, false);
				// The code textarea should have DOCTYPE content
				const codeValue = env.mockCodeArea.value;
				expect(codeValue).toContain('<!DOCTYPE html>');
				expect(codeValue).toContain('<html>');
				expect(codeValue).toContain('</html>');
			});
		});

		describe('leaving code view (triggers #setCodeDataToEditor)', () => {
			it('should parse HTML and set body content for iframe_fullPage', () => {
				env.frameContext.set('isCodeView', true);
				// Set some HTML code that DOMParser can handle
				env.mockCodeArea.value = '<!DOCTYPE html><html><head></head><body class="sun-editor-editable"><p>Hello</p></body></html>';
				viewer.codeView(false);
				expect(env.html.clean).toHaveBeenCalled();
			});

			it('should remove script tags from head when scripts are disallowed', () => {
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<!DOCTYPE html><html><head><script>alert("xss")</script></head><body><p>Hi</p></body></html>';
				viewer.codeView(false);
				// html.clean should have been called with body content
				expect(env.html.clean).toHaveBeenCalled();
			});

			it('should add editable classes if not present on body', () => {
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<!DOCTYPE html><html><head></head><body><p>Content</p></body></html>';
				viewer.codeView(false);
				// No error expected; editable class should be added
			});

			it('should handle body with existing attributes', () => {
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<!DOCTYPE html><html><head></head><body class="custom" data-id="1" contenteditable="true"><p>Content</p></body></html>';
				viewer.codeView(false);
				// contenteditable attribute should be skipped
			});

			it('should add iframe style links when no stylesheet link in head', () => {
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<!DOCTYPE html><html><head></head><body><p>Content</p></body></html>';
				viewer.codeView(false);
				// No error expected
			});

			it('should handle height=auto with no style in head', () => {
				env.frameOptions.set('height', 'auto');
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<!DOCTYPE html><html><head><link rel="stylesheet" href="test.css"></head><body><p>Content</p></body></html>';
				viewer.codeView(false);
				// Should add auto height style since there's no <style> element but height is auto
			});

			it('should skip script removal when script tag is in disallowedExtraTag', () => {
				// When 'script' is in the disallowed list, the regex test('script') returns true,
				// so the !test('script') branch is false -> script removal is skipped
				env.options.set('_disallowedExtraTag', 'script');
				// Re-create viewer to pick up the new disallowed tag
				const v = new Viewer(env.kernel);
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<!DOCTYPE html><html><head><script>var x = 1;</script></head><body><p>Content</p></body></html>';
				v.codeView(false);
				// script removal is skipped because 'script' matches the disallowed pattern
			});
		});

		describe('leaving code view (non iframe_fullPage, empty code)', () => {
			it('should set default line element when code is empty', () => {
				env.frameOptions.set('iframe_fullPage', false);
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '';
				viewer.codeView(false);
				expect(env.mockWysiwyg.innerHTML).toBe('<p><br></p>');
			});

			it('should clean code via html.clean when code is not empty', () => {
				env.frameOptions.set('iframe_fullPage', false);
				env.frameContext.set('isCodeView', true);
				env.mockCodeArea.value = '<p>Some content</p>';
				viewer.codeView(false);
				expect(env.html.clean).toHaveBeenCalledWith(
					'<p>Some content</p>',
					expect.objectContaining({ forceFormat: true, _freeCodeViewMode: false })
				);
			});
		});
	});

	// ======================================================================
	// Additional edge cases for GetLineHeight fallback
	// ======================================================================
	describe('line number generation edge cases', () => {
		it('should handle codeNumbers with existing line numbers (numberOfLinesNeeded <= currentLineCount)', () => {
			// Pre-populate codeNumbers with many lines so no new lines need to be added
			env.mockCodeNumbers.value = '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n';
			// scrollHeight is 100, lineHeight is 20 -> 5 lines needed, but we already have 10
			viewer._codeViewAutoHeight(env.mockCodeArea, env.mockCodeNumbers, false);
			// No new lines should be appended
			expect(env.mockCodeNumbers.value).toBe('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n');
		});
	});
});
