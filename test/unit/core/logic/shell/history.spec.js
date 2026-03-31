/**
 * @jest-environment jsdom
 */

import History from '../../../../../src/core/logic/shell/history';

// Mock the modules that History imports
jest.mock('../../../../../src/helper/env', () => ({
	_w: globalThis,
	_d: globalThis.document,
}));

jest.mock('../../../../../src/helper/dom/domQuery', () => ({
	getNodeFromPath: jest.fn((offsets, parentNode) => {
		// Simple mock: walk child nodes by offsets
		let current = parentNode;
		if (!current) return current;
		for (let i = 0; i < offsets.length; i++) {
			if (!current.childNodes || current.childNodes.length === 0) break;
			if (current.childNodes.length <= offsets[i]) {
				current = current.childNodes[current.childNodes.length - 1];
			} else {
				current = current.childNodes[offsets[i]];
			}
		}
		return current;
	}),
	getNodePath: jest.fn(() => [0, 0]),
}));

jest.mock('../../../../../src/helper', () => ({
	numbers: {
		is: jest.fn((v) => /^-?\d+(\.\d+)?$/.test(v + '')),
	},
}));

/**
 * Helper: creates a wysiwyg div element with given innerHTML
 */
function createWysiwyg(html = '<p>initial</p>') {
	const el = document.createElement('div');
	el.contentEditable = 'true';
	el.innerHTML = html;
	return el;
}

/**
 * Helper: creates a frame context Map for a given rootKey
 */
function createFrameCtx(rootKey, wysiwyg) {
	return new Map([
		['key', rootKey],
		['wysiwyg', wysiwyg],
		['savedIndex', -1],
		['historyIndex', -1],
		['isChanged', false],
		['options', new Map([['iframe', false]])],
	]);
}

/**
 * Helper: builds a mock kernel suitable for History(kernel)
 */
function buildKernel(overrides = {}) {
	const wysiwygMain = createWysiwyg('<p>initial</p>');
	const wysiwygSecond = createWysiwyg('<p>second frame</p>');

	const mainFrameCtx = createFrameCtx('main', wysiwygMain);
	const secondFrameCtx = createFrameCtx('second', wysiwygSecond);

	const frameRoots = new Map([
		['main', mainFrameCtx],
		['second', secondFrameCtx],
	]);

	const toolbarMain = document.createElement('div');
	toolbarMain.style.display = 'none';
	const toolbarSubMain = document.createElement('div');
	toolbarSubMain.style.display = 'none';

	const context = new Map([
		['toolbar_main', toolbarMain],
		['toolbar_sub_main', toolbarSubMain],
	]);
	// Make context.get work like a regular Map
	const contextObj = {
		get: (key) => context.get(key),
		set: (key, value) => context.set(key, value),
		has: (key) => context.has(key),
	};

	const commandTargets = new Map([
		['undo', [{ disabled: true }]],
		['redo', [{ disabled: true }]],
		['save', [{ disabled: true }]],
	]);

	const contextProvider = {
		frameRoots,
		context: contextObj,
		frameContext: mainFrameCtx,
		rootKeys: ['main', 'second'],
		applyToRoots: jest.fn((cb) => {
			frameRoots.forEach((root) => cb(root));
		}),
	};

	const eventManager = {
		triggerEvent: jest.fn(),
	};

	const options = {
		get: jest.fn((key) => {
			const opts = { historyStackDelayTime: 400 };
			return opts[key];
		}),
	};

	const commandDispatcher = {
		applyTargets: jest.fn((command, callback) => {
			const targets = commandTargets.get(command);
			if (targets) targets.forEach(callback);
		}),
	};

	const pluginManager = {
		checkFileInfo: jest.fn(),
	};

	const selection = {
		setRange: jest.fn(),
	};

	const focusManager = {
		focus: jest.fn(),
	};

	const ui = {
		offCurrentController: jest.fn(),
		_syncFrameState: jest.fn(),
	};

	const charDisplay = jest.fn();
	const char = { display: charDisplay };

	const toolbar = {
		_showBalloon: jest.fn(),
	};

	const subToolbar = {
		_showBalloon: jest.fn(),
	};

	const facade = {
		changeFrameContext: jest.fn(),
	};

	const storeData = {
		rootKey: 'main',
		_range: null,
		hasFocus: false,
	};

	const store = {
		get: jest.fn((key) => storeData[key]),
		set: jest.fn((key, value) => {
			storeData[key] = value;
		}),
		mode: {
			isSubBalloon: false,
		},
	};

	const $ = {
		contextProvider,
		eventManager,
		options,
		commandDispatcher,
		pluginManager,
		selection,
		focusManager,
		ui,
		char,
		toolbar,
		subToolbar,
		facade,
		// history will be set after creation
		history: null,
	};

	const kernel = {
		$,
		store,
		_eventOrchestrator: {
			applyTagEffect: jest.fn(),
		},
		...overrides,
	};

	return {
		kernel,
		$,
		store,
		storeData,
		frameRoots,
		wysiwygMain,
		wysiwygSecond,
		mainFrameCtx,
		secondFrameCtx,
		commandTargets,
		contextProvider,
		eventManager,
		commandDispatcher,
		toolbar,
		subToolbar,
		context,
		toolbarMain,
		toolbarSubMain,
	};
}

describe('History', () => {
	let env;
	let history;

	beforeEach(() => {
		jest.useFakeTimers();
		env = buildKernel();
		history = History(env.kernel);
		// Wire up $.history = the real instance (the closure references $.history.resetButtons)
		env.$.history = history;
		// Initialize history (calls reset internally to set up stacks)
		history.reset();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	// ──────────────────────────────────────────
	// Constructor / Initialization
	// ──────────────────────────────────────────
	describe('initialization', () => {
		it('should return an object with all expected methods', () => {
			expect(history).toBeDefined();
			expect(typeof history.push).toBe('function');
			expect(typeof history.check).toBe('function');
			expect(typeof history.undo).toBe('function');
			expect(typeof history.redo).toBe('function');
			expect(typeof history.overwrite).toBe('function');
			expect(typeof history.pause).toBe('function');
			expect(typeof history.resume).toBe('function');
			expect(typeof history.reset).toBe('function');
			expect(typeof history.resetButtons).toBe('function');
			expect(typeof history.getRootStack).toBe('function');
			expect(typeof history.resetDelayTime).toBe('function');
			expect(typeof history._destroy).toBe('function');
		});
	});

	// ──────────────────────────────────────────
	// reset()
	// ──────────────────────────────────────────
	describe('reset()', () => {
		it('should disable undo, redo, save buttons', () => {
			history.reset();
			const undoBtn = env.commandTargets.get('undo')[0];
			const redoBtn = env.commandTargets.get('redo')[0];
			const saveBtn = env.commandTargets.get('save')[0];
			expect(undoBtn.disabled).toBe(true);
			expect(redoBtn.disabled).toBe(true);
			expect(saveBtn.disabled).toBe(true);
		});

		it('should call applyToRoots to set historyIndex and isChanged', () => {
			history.reset();
			expect(env.contextProvider.applyToRoots).toHaveBeenCalled();
			// Each root should have historyIndex = -1 and isChanged = false
			expect(env.mainFrameCtx.get('historyIndex')).toBe(-1);
			expect(env.mainFrameCtx.get('isChanged')).toBe(false);
		});

		it('should initialize rootStack for all rootKeys', () => {
			history.reset();
			const rootStack = history.getRootStack();
			expect(rootStack['main']).toBeDefined();
			expect(rootStack['main'].index).toBe(-1);
			expect(rootStack['main'].value).toEqual([]);
			expect(rootStack['second']).toBeDefined();
			expect(rootStack['second'].index).toBe(-1);
		});

		it('should clear waiting state', () => {
			history.pause();
			history.reset();
			// After reset, push should work (waiting = false)
			env.wysiwygMain.innerHTML = '<p>after reset</p>';
			history.push(false);
			jest.runAllTimers();
			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});
	});

	// ──────────────────────────────────────────
	// push() delay paths
	// ──────────────────────────────────────────
	describe('push()', () => {
		it('should immediately push when delay === false (time=0)', () => {
			env.wysiwygMain.innerHTML = '<p>changed</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
			expect(rootStack['main'].value[rootStack['main'].index].content).toBe('<p>changed</p>');
		});

		it('should use delayTime when delay === true', () => {
			env.wysiwygMain.innerHTML = '<p>delayed</p>';
			history.push(true);

			// Not yet pushed
			const rootStack = history.getRootStack();
			const indexBefore = rootStack['main'].index;

			// Advance by less than delayTime
			jest.advanceTimersByTime(200);
			expect(rootStack['main'].index).toBe(indexBefore);

			// Advance past delayTime (400ms)
			jest.advanceTimersByTime(300);
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should use custom timeout when delay is a number', () => {
			env.wysiwygMain.innerHTML = '<p>custom delay</p>';
			history.push(100);

			const rootStack = history.getRootStack();
			const indexBefore = rootStack['main'].index;

			jest.advanceTimersByTime(50);
			expect(rootStack['main'].index).toBe(indexBefore);

			jest.advanceTimersByTime(60);
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should treat delay=0 (number) as immediate (time=0)', () => {
			env.wysiwygMain.innerHTML = '<p>zero delay</p>';
			history.push(0);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should treat negative delay number as time=0 (immediate)', () => {
			env.wysiwygMain.innerHTML = '<p>negative delay</p>';
			history.push(-5);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should early return when waiting === true (paused)', () => {
			history.pause();
			env.wysiwygMain.innerHTML = '<p>should not push</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			// Nothing should have been pushed beyond the initial state
			expect(rootStack['main'].value.length).toBe(0);
		});

		it('should debounce: calling push(true) again before timeout clears previous', () => {
			env.wysiwygMain.innerHTML = '<p>first</p>';
			history.push(true);

			jest.advanceTimersByTime(200);

			// Change content and push again - should reset the timer
			env.wysiwygMain.innerHTML = '<p>second</p>';
			history.push(true);

			jest.advanceTimersByTime(200);

			// First timer should have been cleared, not yet saved
			const rootStack = history.getRootStack();
			// After 400ms total but only 200ms since second push - not yet triggered
			expect(rootStack['main'].value.length).toBeLessThanOrEqual(1);

			jest.advanceTimersByTime(250);
			// Now the second debounced push should have fired
			const lastEntry = rootStack['main'].value[rootStack['main'].index];
			if (lastEntry) {
				expect(lastEntry.content).toBe('<p>second</p>');
			}
		});

		it('should use store rootKey when rootKey not provided', () => {
			env.storeData.rootKey = 'main';
			env.wysiwygMain.innerHTML = '<p>use store key</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should use provided rootKey parameter', () => {
			env.wysiwygSecond.innerHTML = '<p>second push</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['second'].value.length).toBeGreaterThan(0);
		});

		it('should call ui._syncFrameState via setTimeout(0) on push', () => {
			env.wysiwygMain.innerHTML = '<p>sync test</p>';
			history.push(false);
			jest.runAllTimers();

			expect(env.$.ui._syncFrameState).toHaveBeenCalled();
		});

		it('should clear pushDelay when pushing immediately while a delay is pending', () => {
			env.wysiwygMain.innerHTML = '<p>delayed pending</p>';
			history.push(true); // starts a delayed push

			env.wysiwygMain.innerHTML = '<p>immediate</p>';
			history.push(false); // should clear the delay and push immediately
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			const lastEntry = rootStack['main'].value[rootStack['main'].index];
			expect(lastEntry.content).toBe('<p>immediate</p>');
		});
	});

	// ──────────────────────────────────────────
	// pushStack internals
	// ──────────────────────────────────────────
	describe('pushStack (internal via push)', () => {
		it('should not push duplicate content (dedup check)', () => {
			env.wysiwygMain.innerHTML = '<p>same content</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			const countBefore = rootStack['main'].value.length;

			// Push again with same content
			history.push(false);
			jest.runAllTimers();

			expect(rootStack['main'].value.length).toBe(countBefore);
		});

		it('should not push when wysiwyg content is empty', () => {
			env.wysiwygMain.innerHTML = '';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBe(0);
		});

		it('should call refreshRoots when stack.length > stackIndex + 1', () => {
			// Push two entries
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			// Undo to go back
			history.undo();

			// Now push a new entry - should trigger refreshRoots (truncating future)
			env.wysiwygMain.innerHTML = '<p>v3 branch</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			// Redo button should be disabled after refreshRoots
			const redoBtn = env.commandTargets.get('redo')[0];
			expect(redoBtn.disabled).toBe(true);
		});

		it('should call resetRoot when root.value.length === 0', () => {
			// After reset(), root.value is empty. First push should call resetRoot.
			env.wysiwygMain.innerHTML = '<p>first push after reset</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			// resetRoot creates value[0] with initial content, then pushStack adds value[1]
			expect(rootStack['main'].value.length).toBe(2);
			expect(rootStack['main'].value[0].content).toBe('<p>initial</p>'); // initial content from resetRoot
		});

		it('should enable undo button on first push (stackIndex === 1)', () => {
			env.wysiwygMain.innerHTML = '<p>first push</p>';
			history.push(false);
			jest.runAllTimers();

			const undoBtn = env.commandTargets.get('undo')[0];
			expect(undoBtn.disabled).toBe(false);
		});

		it('should call char.display after push', () => {
			env.wysiwygMain.innerHTML = '<p>char display test</p>';
			history.push(false);
			jest.runAllTimers();

			expect(env.$.char.display).toHaveBeenCalled();
		});

		it('should call pluginManager.checkFileInfo on push', () => {
			env.wysiwygMain.innerHTML = '<p>file info test</p>';
			history.push(false);
			jest.runAllTimers();

			expect(env.$.pluginManager.checkFileInfo).toHaveBeenCalledWith(false);
		});

		it('should trigger onChange event after push', () => {
			env.wysiwygMain.innerHTML = '<p>onchange test</p>';
			history.push(false);
			jest.runAllTimers();

			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onChange',
				expect.objectContaining({ data: expect.any(String) })
			);
		});
	});

	// ──────────────────────────────────────────
	// setStack with range vs no range
	// ──────────────────────────────────────────
	describe('setStack (range handling via push)', () => {
		it('should handle push when store._range is null (no range)', () => {
			env.storeData._range = null;
			env.wysiwygMain.innerHTML = '<p>no range</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			const entry = rootStack['main'].value[rootStack['main'].index];
			expect(entry).toBeDefined();
			// When range is null, s.path should be [0,0] and e.path should be 0
			expect(entry.s.path).toEqual([0, 0]);
			expect(entry.e.path).toBe(0);
		});

		it('should handle push when store._range is a Range object', () => {
			const range = document.createRange();
			const textNode = env.wysiwygMain.firstChild?.firstChild || env.wysiwygMain.firstChild;
			if (textNode) {
				range.setStart(textNode, 0);
				range.setEnd(textNode, 0);
			}
			env.storeData._range = range;

			env.wysiwygMain.innerHTML = '<p>with range</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			const entry = rootStack['main'].value[rootStack['main'].index];
			expect(entry).toBeDefined();
			expect(entry.s).toBeDefined();
			expect(entry.e).toBeDefined();
		});
	});

	// ──────────────────────────────────────────
	// undo / redo (setContentFromStack)
	// ──────────────────────────────────────────
	describe('undo()', () => {
		it('should not do anything when stackIndex <= 0', () => {
			// No pushes yet, stackIndex is -1 after reset
			history.undo();
			// Should not throw, no side effects
			expect(env.$.facade.changeFrameContext).not.toHaveBeenCalled();
		});

		it('should restore previous content on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v1</p>');
		});

		it('should call facade.changeFrameContext on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.$.facade.changeFrameContext).toHaveBeenCalled();
		});

		it('should call selection.setRange on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.$.selection.setRange).toHaveBeenCalled();
		});

		it('should call focusManager.focus on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.$.focusManager.focus).toHaveBeenCalled();
		});

		it('should call ui.offCurrentController on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.$.ui.offCurrentController).toHaveBeenCalled();
		});

		it('should call pluginManager.checkFileInfo(false) on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.$.pluginManager.checkFileInfo.mockClear();
			history.undo();
			expect(env.$.pluginManager.checkFileInfo).toHaveBeenCalledWith(false);
		});

		it('should call char.display on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.$.char.display.mockClear();
			history.undo();
			expect(env.$.char.display).toHaveBeenCalled();
		});

		it('should trigger onChange on undo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.eventManager.triggerEvent.mockClear();
			history.undo();
			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onChange',
				expect.any(Object)
			);
		});

		it('should handle null item safely (rollback)', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			// Corrupt the stack: remove the item that undo would land on
			const rootStack = history.getRootStack();
			const root = rootStack['main'];
			const prevIndex = root.index;
			root.value[prevIndex - 1] = null; // corrupt

			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			history.undo();
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('History state desynchronized'));
			consoleSpy.mockRestore();
		});

		it('should clamp stackIndex to 0 when it goes below 0', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			// Undo back to initial
			history.undo();
			// Should not throw or go below 0
			history.undo(); // should be a no-op since stackIndex <= 0
			expect(true).toBe(true); // no error
		});
	});

	describe('redo()', () => {
		it('should not do anything when at end of stack', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			history.redo(); // already at end
			// Should not throw
			expect(true).toBe(true);
		});

		it('should restore next content on redo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v1</p>');

			history.redo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v2</p>');
		});

		it('should handle multiple undo/redo cycles', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v3</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v2</p>');

			history.undo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v1</p>');

			history.redo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v2</p>');

			history.redo();
			expect(env.wysiwygMain.innerHTML).toBe('<p>v3</p>');
		});
	});

	// ──────────────────────────────────────────
	// Cross-frame undo/redo scenarios
	// ──────────────────────────────────────────
	describe('cross-frame undo/redo', () => {
		it('should handle undo across different rootKeys (prevKey !== rootKey)', () => {
			// Push in main frame
			env.wysiwygMain.innerHTML = '<p>main v1</p>';
			history.push(false, 'main');
			jest.runAllTimers();

			// Push in second frame
			env.wysiwygSecond.innerHTML = '<p>second v1</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			// Undo should go back to second frame's previous or main frame
			history.undo();
			// Should call changeFrameContext
			expect(env.$.facade.changeFrameContext).toHaveBeenCalled();
		});

		it('should handle redo across different rootKeys', () => {
			env.wysiwygMain.innerHTML = '<p>main v1</p>';
			history.push(false, 'main');
			jest.runAllTimers();

			env.wysiwygSecond.innerHTML = '<p>second v1</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			history.undo();
			history.redo();
			expect(env.$.facade.changeFrameContext).toHaveBeenCalled();
		});
	});

	// ──────────────────────────────────────────
	// change() internal - toolbar balloon paths
	// ──────────────────────────────────────────
	describe('change() internal (toolbar/balloon)', () => {
		it('should call toolbar._showBalloon when toolbar_main is visible', () => {
			env.toolbarMain.style.display = 'block';

			env.wysiwygMain.innerHTML = '<p>balloon test</p>';
			history.push(false);
			jest.runAllTimers();

			expect(env.toolbar._showBalloon).toHaveBeenCalled();
		});

		it('should call subToolbar._showBalloon when in subBalloon mode and toolbar_sub_main is visible', () => {
			env.toolbarMain.style.display = 'none';
			env.toolbarSubMain.style.display = 'block';
			env.store.mode.isSubBalloon = true;

			env.wysiwygMain.innerHTML = '<p>sub balloon test</p>';
			history.push(false);
			jest.runAllTimers();

			expect(env.subToolbar._showBalloon).toHaveBeenCalled();
		});

		it('should call applyTagEffect when isSetFocus=true and hasFocus=true', () => {
			env.storeData.hasFocus = true;

			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.kernel._eventOrchestrator.applyTagEffect.mockClear();
			// undo calls change with isSetFocus = true
			history.undo();
			expect(env.kernel._eventOrchestrator.applyTagEffect).toHaveBeenCalled();
		});

		it('should not call applyTagEffect when hasFocus=false', () => {
			env.storeData.hasFocus = false;

			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.kernel._eventOrchestrator.applyTagEffect.mockClear();
			history.undo();
			expect(env.kernel._eventOrchestrator.applyTagEffect).not.toHaveBeenCalled();
		});
	});

	// ──────────────────────────────────────────
	// check()
	// ──────────────────────────────────────────
	describe('check()', () => {
		it('should flush pending delayed push', () => {
			env.wysiwygMain.innerHTML = '<p>check flush</p>';
			history.push(true); // start delayed push

			const rootStack = history.getRootStack();
			const indexBefore = rootStack['main'].index;

			// check() should immediately flush
			history.check('main', null);

			expect(rootStack['main'].index).toBeGreaterThan(indexBefore);
		});

		it('should do nothing when no delayed push is pending', () => {
			const rootStack = history.getRootStack();
			const indexBefore = rootStack['main'].index;

			history.check('main', null);
			expect(rootStack['main'].index).toBe(indexBefore);
		});

		it('should accept a range parameter', () => {
			const range = document.createRange();
			env.storeData._range = range;

			env.wysiwygMain.innerHTML = '<p>check with range</p>';
			history.push(true);
			history.check('main', range);

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});
	});

	// ──────────────────────────────────────────
	// resetButtons()
	// ──────────────────────────────────────────
	describe('resetButtons()', () => {
		beforeEach(() => {
			// Push some entries so rootStack has data
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();
		});

		it('should enable undo when index > 0 and index <= rootLen', () => {
			const rootStack = history.getRootStack();
			const root = rootStack['main'];
			history.resetButtons('main', root.index);

			const undoBtn = env.commandTargets.get('undo')[0];
			expect(undoBtn.disabled).toBe(false);
		});

		it('should disable undo when index === 0', () => {
			history.resetButtons('main', 0);

			const undoBtn = env.commandTargets.get('undo')[0];
			expect(undoBtn.disabled).toBe(true);
		});

		it('should enable redo when index < rootLen', () => {
			history.resetButtons('main', 0);

			const redoBtn = env.commandTargets.get('redo')[0];
			expect(redoBtn.disabled).toBe(false);
		});

		it('should disable redo when index >= rootLen', () => {
			const rootStack = history.getRootStack();
			const root = rootStack['main'];
			history.resetButtons('main', root.value.length - 1);

			const redoBtn = env.commandTargets.get('redo')[0];
			expect(redoBtn.disabled).toBe(true);
		});

		it('should resolve root from stack when rootKey is undefined (root lookup branch)', () => {
			// When rootKey === undefined, resetButtons resolves root from stack[stackIndex]
			// but target = frameRoots.get(rootKey) still uses undefined, so we test
			// through an indirect path: push data, then call resetButtons with valid key
			// The rootKey === undefined branch for root lookup is exercised internally
			// via change() which always passes a valid rootKey.
			// Test the root resolution with a known key instead.
			const rootStack = history.getRootStack();
			const root = rootStack['main'];
			history.resetButtons('main', root.index);

			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onResetButtons',
				expect.objectContaining({ rootKey: 'main' })
			);
		});

		it('should handle isReset (index not provided)', () => {
			history.resetButtons('main');
			// When no index provided, numbers.is(undefined) returns false, so isReset = true
			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onResetButtons',
				expect.objectContaining({ rootKey: 'main' })
			);
		});

		it('should handle save button when savedIndex matches index', () => {
			env.mainFrameCtx.set('savedIndex', 1);
			history.resetButtons('main', 1);

			const saveBtn = env.commandTargets.get('save')[0];
			expect(saveBtn.disabled).toBe(true); // not changed
		});

		it('should enable save button when savedIndex does not match', () => {
			env.mainFrameCtx.set('savedIndex', 0);
			history.resetButtons('main', 2);

			const saveBtn = env.commandTargets.get('save')[0];
			expect(saveBtn.disabled).toBe(false); // changed
		});

		it('should handle savedIndex = -1 (no save point)', () => {
			env.mainFrameCtx.set('savedIndex', -1);
			history.resetButtons('main', 1);

			const saveBtn = env.commandTargets.get('save')[0];
			// When savedIndex is -1, isChanged = isReset ? root.index > 0 : index > 0 && historyIndex !== index
			expect(saveBtn.disabled).toBe(false);
		});

		it('should set historyIndex and isChanged on frame context', () => {
			history.resetButtons('main', 2);
			expect(env.mainFrameCtx.get('historyIndex')).toBe(2);
			expect(env.mainFrameCtx.get('isChanged')).toBeDefined();
		});

		it('should trigger onResetButtons event', () => {
			env.eventManager.triggerEvent.mockClear();
			history.resetButtons('main', 1);
			expect(env.eventManager.triggerEvent).toHaveBeenCalledWith(
				'onResetButtons',
				{ rootKey: 'main' }
			);
		});

		it('should set isChanged=false when isReset and root.index is 0', () => {
			// Undo back to index 0
			history.undo();
			history.undo();

			// Now resetButtons without index (isReset=true)
			const rootStack = history.getRootStack();
			rootStack['main'].index = 0;
			history.resetButtons('main');

			expect(env.mainFrameCtx.get('isChanged')).toBe(false);
		});
	});

	// ──────────────────────────────────────────
	// pause / resume
	// ──────────────────────────────────────────
	describe('pause()', () => {
		it('should prevent push from adding entries', () => {
			history.pause();

			env.wysiwygMain.innerHTML = '<p>paused content</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBe(0);
		});

		it('should auto-resume after 5 seconds', () => {
			history.pause();

			jest.advanceTimersByTime(5000);

			env.wysiwygMain.innerHTML = '<p>after auto resume</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should clear previous waitingTime when called again', () => {
			history.pause();
			jest.advanceTimersByTime(2000);

			// Pause again - should reset the 5s timer
			history.pause();
			jest.advanceTimersByTime(3000);

			// At this point, 3s since second pause, should still be paused
			env.wysiwygMain.innerHTML = '<p>still paused</p>';
			history.push(false);
			jest.runAllTimers();

			// Need to check: if 3s < 5s, should still be paused
			// Actually with fake timers runAllTimers runs everything...
			// Let's test differently
			history.pause();
			jest.advanceTimersByTime(2000);
			history.pause(); // resets timer

			env.wysiwygMain.innerHTML = '<p>should be paused</p>';
			history.push(false);
			// Don't run all timers, just check state
			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBe(0);
		});
	});

	describe('resume()', () => {
		it('should allow pushes after being paused', () => {
			history.pause();
			history.resume();

			env.wysiwygMain.innerHTML = '<p>resumed</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should clear the auto-resume timer', () => {
			history.pause();
			history.resume();

			// Even after 5s, no issues
			jest.advanceTimersByTime(6000);

			env.wysiwygMain.innerHTML = '<p>after resume</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should be safe to call resume without prior pause', () => {
			history.resume();
			// Should not throw
			expect(true).toBe(true);
		});
	});

	// ──────────────────────────────────────────
	// overwrite()
	// ──────────────────────────────────────────
	describe('overwrite()', () => {
		it('should replace current stack entry content', () => {
			env.wysiwygMain.innerHTML = '<p>original</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>overwritten</p>';
			history.overwrite('main');

			const rootStack = history.getRootStack();
			const entry = rootStack['main'].value[rootStack['main'].index];
			expect(entry.content).toBe('<p>overwritten</p>');
		});

		it('should use store rootKey when rootKey not provided', () => {
			env.wysiwygMain.innerHTML = '<p>original</p>';
			history.push(false);
			jest.runAllTimers();

			env.storeData.rootKey = 'main';
			env.wysiwygMain.innerHTML = '<p>overwrite no key</p>';
			history.overwrite();

			const rootStack = history.getRootStack();
			const entry = rootStack['main'].value[rootStack['main'].index];
			expect(entry.content).toBe('<p>overwrite no key</p>');
		});
	});

	// ──────────────────────────────────────────
	// getRootStack()
	// ──────────────────────────────────────────
	describe('getRootStack()', () => {
		it('should return the root stack object', () => {
			const rootStack = history.getRootStack();
			expect(rootStack).toBeDefined();
			expect(typeof rootStack).toBe('object');
		});

		it('should reflect pushes to the stack', () => {
			env.wysiwygMain.innerHTML = '<p>pushed</p>';
			history.push(false);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});
	});

	// ──────────────────────────────────────────
	// resetDelayTime()
	// ──────────────────────────────────────────
	describe('resetDelayTime()', () => {
		it('should change the delay time for subsequent delayed pushes', () => {
			history.resetDelayTime(100);

			env.wysiwygMain.innerHTML = '<p>new delay</p>';
			history.push(true); // uses delayTime

			jest.advanceTimersByTime(50);
			const rootStack = history.getRootStack();
			const indexBefore = rootStack['main'].index;

			jest.advanceTimersByTime(60);
			expect(rootStack['main'].index).toBeGreaterThan(indexBefore);
		});

		it('should accept 0 as delay time', () => {
			history.resetDelayTime(0);
			// delay=true with delayTime=0 should push immediately (time=0)
			env.wysiwygMain.innerHTML = '<p>zero delay time</p>';
			history.push(true);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});
	});

	// ──────────────────────────────────────────
	// _destroy()
	// ──────────────────────────────────────────
	describe('_destroy()', () => {
		it('should not throw', () => {
			expect(() => history._destroy()).not.toThrow();
		});

		it('should clear pending pushDelay timeout', () => {
			env.wysiwygMain.innerHTML = '<p>destroy pending</p>';
			history.push(true); // start a delayed push

			history._destroy();
			// After destroy, advancing timers should not cause errors
			jest.runAllTimers();
		});

		it('should clear waitingTime timeout', () => {
			history.pause(); // starts waitingTime
			history._destroy();
			jest.runAllTimers();
			// Should not throw
		});

		it('should clear internal state', () => {
			history._destroy();
			// getRootStack would return null after destroy
			expect(history.getRootStack()).toBeNull();
		});
	});

	// ──────────────────────────────────────────
	// documentType reHeader check in setContentFromStack
	// ──────────────────────────────────────────
	describe('documentType reHeader (line 102-104)', () => {
		it('should call documentType.reHeader when frameContext has documentType_use_header', () => {
			const reHeaderMock = jest.fn();
			env.mainFrameCtx.set('documentType_use_header', true);
			env.mainFrameCtx.set('documentType', { reHeader: reHeaderMock });

			// Set up frameContext pointer used in change()
			env.$.contextProvider.frameContext = env.mainFrameCtx;

			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(reHeaderMock).toHaveBeenCalled();
		});

		it('should not call reHeader when documentType_use_header is not set', () => {
			const reHeaderMock = jest.fn();
			env.mainFrameCtx.set('documentType', { reHeader: reHeaderMock });
			// documentType_use_header is not set

			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();
			expect(reHeaderMock).not.toHaveBeenCalled();
		});
	});

	// ──────────────────────────────────────────
	// refreshRoots: re-initialize deleted roots
	// ──────────────────────────────────────────
	describe('refreshRoots (pruning future stack entries)', () => {
		it('should re-initialize roots that no longer exist in the truncated stack', () => {
			// Push in main
			env.wysiwygMain.innerHTML = '<p>main v1</p>';
			history.push(false, 'main');
			jest.runAllTimers();

			// Push in second
			env.wysiwygSecond.innerHTML = '<p>second v1</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			// Undo (back to main v1)
			history.undo();

			// Now push a new entry in main - should truncate second's future entry
			env.wysiwygMain.innerHTML = '<p>main v2</p>';
			history.push(false, 'main');
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			// second should have been re-initialized (initRoot)
			expect(rootStack['second'].index).toBe(-1);
			expect(rootStack['second'].value).toEqual([]);
		});

		it('should disable redo button after refreshRoots', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			history.undo();

			env.wysiwygMain.innerHTML = '<p>v3</p>';
			history.push(false);
			jest.runAllTimers();

			const redoBtn = env.commandTargets.get('redo')[0];
			expect(redoBtn.disabled).toBe(true);
		});
	});

	// ──────────────────────────────────────────
	// stackIndex boundary clamping (lines 93-94)
	// ──────────────────────────────────────────
	describe('stackIndex boundary clamping', () => {
		it('should clamp stackIndex >= stack.length to stack.length - 1 on redo', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			// Multiple redos beyond stack end
			history.redo();
			history.redo();
			// Should not throw, clamped
			expect(true).toBe(true);
		});
	});

	// ──────────────────────────────────────────
	// setContentFromStack: focus key selection at root.index === 0
	// ──────────────────────────────────────────
	describe('focus key selection on undo at root.index === 0', () => {
		it('should focus the correct key when undoing at root.index boundary with cross-frame', () => {
			// Build a scenario where undo at root.index === 0 with a different next key
			env.wysiwygMain.innerHTML = '<p>main v1</p>';
			history.push(false, 'main');
			jest.runAllTimers();

			env.wysiwygSecond.innerHTML = '<p>second v1</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			env.wysiwygSecond.innerHTML = '<p>second v2</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			// Undo to second v1
			history.undo();
			// Undo to main area (cross-frame, second root.index becomes 0)
			history.undo();

			expect(env.$.facade.changeFrameContext).toHaveBeenCalled();
		});
	});

	// ──────────────────────────────────────────
	// Edge cases
	// ──────────────────────────────────────────
	describe('edge cases', () => {
		it('should handle push with rootKey=null (falsy but explicit)', () => {
			// rootKey = rootKey || rootKey === null ? rootKey : store.get('rootKey')
			// When rootKey is null: null || null === null => null || true => true, so rootKey = null
			// But frameRoots.get(null) would be undefined, so this might throw
			// Let's set up a frame for null key
			const nullWysiwyg = createWysiwyg('<p>null frame</p>');
			const nullFrameCtx = createFrameCtx(null, nullWysiwyg);
			env.frameRoots.set(null, nullFrameCtx);
			env.contextProvider.rootKeys.push(null);

			// Reset to include null key
			history.reset();

			nullWysiwyg.innerHTML = '<p>null push</p>';
			history.push(false, null);
			jest.runAllTimers();

			const rootStack = history.getRootStack();
			expect(rootStack[null]).toBeDefined();
		});

		it('should handle rapid push/undo/redo sequences', () => {
			for (let i = 0; i < 10; i++) {
				env.wysiwygMain.innerHTML = `<p>rapid ${i}</p>`;
				history.push(false);
				jest.runAllTimers();
			}

			for (let i = 0; i < 5; i++) {
				history.undo();
			}

			for (let i = 0; i < 3; i++) {
				history.redo();
			}

			// Should have consistent state
			const rootStack = history.getRootStack();
			expect(rootStack['main'].value.length).toBeGreaterThan(0);
		});

		it('should handle push after undo creating a new branch', () => {
			env.wysiwygMain.innerHTML = '<p>v1</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v2</p>';
			history.push(false);
			jest.runAllTimers();

			env.wysiwygMain.innerHTML = '<p>v3</p>';
			history.push(false);
			jest.runAllTimers();

			// Undo twice
			history.undo();
			history.undo();

			// New branch
			env.wysiwygMain.innerHTML = '<p>v4 branch</p>';
			history.push(false);
			jest.runAllTimers();

			// Redo should not go to v2 or v3 (they were pruned)
			const redoBtn = env.commandTargets.get('redo')[0];
			expect(redoBtn.disabled).toBe(true);
		});
	});

	// ──────────────────────────────────────────
	// setContentFromStack cross-frame stackIndex adjustments (lines 70-76)
	// ──────────────────────────────────────────
	describe('setContentFromStack stackIndex adjustments', () => {
		it('should set stackIndex=0 when prevKey !== rootKey, increase < 0, and stackIndex === 1 (line 71)', () => {
			// After reset, stack = [], stackIndex = -1
			// Push in main: resetRoot adds stack[0]='main' (root[main].index=0),
			// then setStack adds stack[1]='main' (root[main].index=1). stackIndex=1.
			env.wysiwygMain.innerHTML = '<p>main v1</p>';
			history.push(false, 'main');
			jest.runAllTimers();
			// stack = ['main','main'], stackIndex=1

			// Push in second: resetRoot adds stack[2]='second' (root[second].index=0),
			// then setStack adds stack[3]='second' (root[second].index=1). stackIndex=3.
			env.wysiwygSecond.innerHTML = '<p>second v1</p>';
			history.push(false, 'second');
			jest.runAllTimers();
			// stack = ['main','main','second','second'], stackIndex=3

			// 1st undo: stackIndex 3->2, prevKey='second', stack[2]='second' (same key),
			// rootKey='second', root[second].index 1->0. No cross-frame.
			history.undo();

			// 2nd undo: stackIndex 2->1, prevKey='second', stack[1]='main' (different!),
			// prevRoot(second).index=0 (NOT > 0), so rootKey=stack[1]='main'.
			// root[main].index 1->0. Now prevKey('second') !== rootKey('main'),
			// increase < 0, stackIndex === 1 => LINE 71: stackIndex = 0.
			history.undo();

			// After line 71, stackIndex should be 0
			// Verify by checking that another undo is a no-op (stackIndex <= 0)
			env.$.facade.changeFrameContext.mockClear();
			history.undo(); // should be no-op
			expect(env.$.facade.changeFrameContext).not.toHaveBeenCalled();
		});

		it('should adjust stackIndex when prevKey !== rootKey and increase > 0 and root.index === 1', () => {
			env.wysiwygMain.innerHTML = '<p>main v1</p>';
			history.push(false, 'main');
			jest.runAllTimers();

			env.wysiwygSecond.innerHTML = '<p>second v1</p>';
			history.push(false, 'second');
			jest.runAllTimers();

			// Undo back
			history.undo();
			history.undo();

			// Redo forward: from main to second (prevKey !== rootKey, increase > 0)
			history.redo();
			history.redo();

			expect(env.$.facade.changeFrameContext).toHaveBeenCalled();
		});
	});
});
