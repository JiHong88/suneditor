/**
 * @fileoverview Unit tests for src/core/event/ports.js - makePorts function
 */

// Variable to control mocked isMobile value per test
let mockIsMobileValue = false;

// Mock the env module before importing ports
jest.mock('../../../../src/helper/env', () => {
	const actual = jest.requireActual('../../../../src/helper/env');
	return {
		__esModule: true,
		...actual,
		get isMobile() {
			return mockIsMobileValue;
		}
	};
});

import { makePorts } from '../../../../src/core/event/ports';

/**
 * Creates a minimal mock inst (EventManager-like instance) with all kernel modules
 * needed by makePorts.
 */
function createMockInst() {
	const wysiwyg = document.createElement('div');
	wysiwyg.contentEditable = 'true';
	wysiwyg.focus = jest.fn();

	const focusTemp = document.createElement('input');
	focusTemp.focus = jest.fn();

	const frameContext = new Map([['wysiwyg', wysiwyg]]);
	frameContext.get = jest.fn((key) => {
		const map = { wysiwyg };
		return map[key];
	});

	const selection = {
		getRange: jest.fn().mockReturnValue('mockRange'),
		getNode: jest.fn().mockReturnValue('mockNode'),
		setRange: jest.fn(),
		get: jest.fn().mockReturnValue('mockSelection'),
		scrollTo: jest.fn()
	};

	const format = {
		isLine: jest.fn().mockReturnValue(true),
		getLine: jest.fn().mockReturnValue('mockLine'),
		getLines: jest.fn().mockReturnValue(['line1', 'line2']),
		getBrLine: jest.fn().mockReturnValue('mockBrLine'),
		getBlock: jest.fn().mockReturnValue('mockBlock'),
		isNormalLine: jest.fn().mockReturnValue(true),
		isBrLine: jest.fn().mockReturnValue(false),
		isClosureBrLine: jest.fn().mockReturnValue(false),
		isClosureBlock: jest.fn().mockReturnValue(false),
		isEdgeLine: jest.fn().mockReturnValue(true),
		removeBlock: jest.fn(),
		addLine: jest.fn()
	};

	const listFormat = {
		applyNested: jest.fn()
	};

	const component = {
		deselect: jest.fn(),
		is: jest.fn().mockReturnValue(true),
		get: jest.fn().mockReturnValue('mockComponent'),
		select: jest.fn()
	};

	const html = {
		remove: jest.fn(),
		insert: jest.fn(),
		insertNode: jest.fn()
	};

	const history = {
		push: jest.fn()
	};

	const nodeTransform = {
		removeAllParents: jest.fn(),
		split: jest.fn().mockReturnValue({ before: null, after: null })
	};

	const char = {
		check: jest.fn().mockReturnValue(true)
	};

	const menu = {
		dropdownOff: jest.fn()
	};

	const focusManager = {
		nativeFocus: jest.fn(),
		blur: jest.fn()
	};

	const ui = {
		_iframeAutoHeight: jest.fn()
	};

	const $ = {
		frameContext,
		ui,
		focusManager,
		selection,
		format,
		listFormat,
		component,
		html,
		history,
		nodeTransform,
		char,
		menu
	};

	return {
		$,
		_setDefaultLine: jest.fn(),
		_hideToolbar: jest.fn(),
		_hideToolbar_sub: jest.fn(),
		__cacheStyleNodes: ['cachedNode1', 'cachedNode2'],
		_formatAttrsTemp: null,
		_onShortcutKey: false,
		scrollparents: [],
		__focusTemp: focusTemp
	};
}

describe('makePorts', () => {
	let inst;
	let styleNodes;
	let ports;

	beforeEach(() => {
		mockIsMobileValue = false;
		inst = createMockInst();
		styleNodes = { value: [] };
		ports = makePorts(inst, { _styleNodes: styleNodes });
	});

	// ============================================================
	// focusManager ports
	// ============================================================
	describe('focusManager port', () => {
		it('nativeFocus delegates to focusManager.nativeFocus', () => {
			ports.focusManager.nativeFocus();
			expect(inst.$.focusManager.nativeFocus).toHaveBeenCalledTimes(1);
		});

		it('blur delegates to focusManager.blur', () => {
			ports.focusManager.blur();
			expect(inst.$.focusManager.blur).toHaveBeenCalledTimes(1);
		});
	});

	// ============================================================
	// selection ports
	// ============================================================
	describe('selection port', () => {
		it('getRange delegates to selection.getRange', () => {
			const result = ports.selection.getRange();
			expect(inst.$.selection.getRange).toHaveBeenCalledTimes(1);
			expect(result).toBe('mockRange');
		});

		it('getNode delegates to selection.getNode', () => {
			const result = ports.selection.getNode();
			expect(inst.$.selection.getNode).toHaveBeenCalledTimes(1);
			expect(result).toBe('mockNode');
		});

		it('setRange delegates to selection.setRange with all four arguments', () => {
			const se = document.createElement('span');
			const ec = document.createElement('div');
			ports.selection.setRange(se, 1, ec, 3);
			expect(inst.$.selection.setRange).toHaveBeenCalledWith(se, 1, ec, 3);
		});

		it('get delegates to selection.get', () => {
			const result = ports.selection.get();
			expect(inst.$.selection.get).toHaveBeenCalledTimes(1);
			expect(result).toBe('mockSelection');
		});
	});

	// ============================================================
	// format ports
	// ============================================================
	describe('format port', () => {
		it('isLine delegates with node argument', () => {
			const node = document.createElement('p');
			const result = ports.format.isLine(node);
			expect(inst.$.format.isLine).toHaveBeenCalledWith(node);
			expect(result).toBe(true);
		});

		it('getLine delegates with node and parent arguments', () => {
			const node = document.createElement('p');
			ports.format.getLine(node, 'parent');
			expect(inst.$.format.getLine).toHaveBeenCalledWith(node, 'parent');
		});

		it('getLines delegates with value argument', () => {
			const result = ports.format.getLines('someValue');
			expect(inst.$.format.getLines).toHaveBeenCalledWith('someValue');
			expect(result).toEqual(['line1', 'line2']);
		});

		it('getBrLine delegates with node and parent arguments', () => {
			const node = document.createElement('pre');
			ports.format.getBrLine(node, 'parent');
			expect(inst.$.format.getBrLine).toHaveBeenCalledWith(node, 'parent');
		});

		it('getBlock delegates with node and parent arguments', () => {
			const node = document.createElement('blockquote');
			ports.format.getBlock(node, 'parent');
			expect(inst.$.format.getBlock).toHaveBeenCalledWith(node, 'parent');
		});

		it('isNormalLine delegates with node argument', () => {
			const node = document.createElement('p');
			const result = ports.format.isNormalLine(node);
			expect(inst.$.format.isNormalLine).toHaveBeenCalledWith(node);
			expect(result).toBe(true);
		});

		it('isBrLine delegates with node argument', () => {
			const node = document.createElement('pre');
			const result = ports.format.isBrLine(node);
			expect(inst.$.format.isBrLine).toHaveBeenCalledWith(node);
			expect(result).toBe(false);
		});

		it('isClosureBrLine delegates with node argument', () => {
			const node = document.createElement('div');
			const result = ports.format.isClosureBrLine(node);
			expect(inst.$.format.isClosureBrLine).toHaveBeenCalledWith(node);
			expect(result).toBe(false);
		});

		it('isClosureBlock delegates with node argument', () => {
			const node = document.createElement('table');
			const result = ports.format.isClosureBlock(node);
			expect(inst.$.format.isClosureBlock).toHaveBeenCalledWith(node);
			expect(result).toBe(false);
		});

		it('isEdgeLine delegates with node, offset, and dir arguments', () => {
			const node = document.createElement('p');
			const result = ports.format.isEdgeLine(node, 5, 'start');
			expect(inst.$.format.isEdgeLine).toHaveBeenCalledWith(node, 5, 'start');
			expect(result).toBe(true);
		});

		it('removeBlock delegates with node and parent arguments', () => {
			const node = document.createElement('blockquote');
			ports.format.removeBlock(node, 'parent');
			expect(inst.$.format.removeBlock).toHaveBeenCalledWith(node, 'parent');
		});

		it('addLine delegates with element and nextOrTag arguments', () => {
			const el = document.createElement('div');
			ports.format.addLine(el, 'P');
			expect(inst.$.format.addLine).toHaveBeenCalledWith(el, 'P');
		});
	});

	// ============================================================
	// listFormat ports
	// ============================================================
	describe('listFormat port', () => {
		it('applyNested delegates with cells and shift arguments', () => {
			const cells = ['cell1', 'cell2'];
			ports.listFormat.applyNested(cells, true);
			expect(inst.$.listFormat.applyNested).toHaveBeenCalledWith(cells, true);
		});
	});

	// ============================================================
	// component ports
	// ============================================================
	describe('component port', () => {
		it('deselect delegates to component.deselect', () => {
			ports.component.deselect();
			expect(inst.$.component.deselect).toHaveBeenCalledTimes(1);
		});

		it('is delegates with node argument', () => {
			const node = document.createElement('img');
			const result = ports.component.is(node);
			expect(inst.$.component.is).toHaveBeenCalledWith(node);
			expect(result).toBe(true);
		});

		it('get delegates with node argument', () => {
			const node = document.createElement('img');
			const result = ports.component.get(node);
			expect(inst.$.component.get).toHaveBeenCalledWith(node);
			expect(result).toBe('mockComponent');
		});

		it('select delegates with target and position arguments', () => {
			const target = document.createElement('img');
			ports.component.select(target, 'start');
			expect(inst.$.component.select).toHaveBeenCalledWith(target, 'start');
		});
	});

	// ============================================================
	// html ports
	// ============================================================
	describe('html port', () => {
		it('remove delegates to html.remove', () => {
			ports.html.remove();
			expect(inst.$.html.remove).toHaveBeenCalledTimes(1);
		});

		it('insert delegates with html string and position arguments', () => {
			ports.html.insert('<p>test</p>', 'afterend');
			expect(inst.$.html.insert).toHaveBeenCalledWith('<p>test</p>', 'afterend');
		});

		it('insertNode delegates with node and position arguments', () => {
			const node = document.createElement('p');
			ports.html.insertNode(node, 'beforebegin');
			expect(inst.$.html.insertNode).toHaveBeenCalledWith(node, 'beforebegin');
		});
	});

	// ============================================================
	// history ports
	// ============================================================
	describe('history port', () => {
		it('push delegates with hard=true, converting to boolean', () => {
			ports.history.push(true);
			expect(inst.$.history.push).toHaveBeenCalledWith(true);
		});

		it('push delegates with hard=false, converting to boolean', () => {
			ports.history.push(false);
			expect(inst.$.history.push).toHaveBeenCalledWith(false);
		});

		it('push converts truthy value to boolean true via !!', () => {
			ports.history.push(1);
			expect(inst.$.history.push).toHaveBeenCalledWith(true);
		});

		it('push converts falsy value to boolean false via !!', () => {
			ports.history.push(0);
			expect(inst.$.history.push).toHaveBeenCalledWith(false);
		});

		it('push converts undefined to boolean false via !!', () => {
			ports.history.push(undefined);
			expect(inst.$.history.push).toHaveBeenCalledWith(false);
		});
	});

	// ============================================================
	// nodeTransform ports
	// ============================================================
	describe('nodeTransform port', () => {
		it('removeAllParents delegates with all three arguments', () => {
			ports.nodeTransform.removeAllParents('s', 'n', 'p');
			expect(inst.$.nodeTransform.removeAllParents).toHaveBeenCalledWith('s', 'n', 'p');
		});

		it('split delegates with node, offset, and direction arguments', () => {
			const node = document.createElement('span');
			const result = ports.nodeTransform.split(node, 3, 'left');
			expect(inst.$.nodeTransform.split).toHaveBeenCalledWith(node, 3, 'left');
			expect(result).toEqual({ before: null, after: null });
		});
	});

	// ============================================================
	// char ports
	// ============================================================
	describe('char port', () => {
		it('check delegates with content argument', () => {
			const result = ports.char.check('hello world');
			expect(inst.$.char.check).toHaveBeenCalledWith('hello world');
			expect(result).toBe(true);
		});
	});

	// ============================================================
	// menu ports
	// ============================================================
	describe('menu port', () => {
		it('dropdownOff delegates to menu.dropdownOff', () => {
			ports.menu.dropdownOff();
			expect(inst.$.menu.dropdownOff).toHaveBeenCalledTimes(1);
		});
	});

	// ============================================================
	// inst-level command ports
	// ============================================================
	describe('inst-level command ports', () => {
		it('setDefaultLine delegates to inst._setDefaultLine with tag', () => {
			ports.setDefaultLine('DIV');
			expect(inst._setDefaultLine).toHaveBeenCalledWith('DIV');
		});

		it('hideToolbar delegates to inst._hideToolbar', () => {
			ports.hideToolbar();
			expect(inst._hideToolbar).toHaveBeenCalledTimes(1);
		});

		it('hideToolbar_sub delegates to inst._hideToolbar_sub', () => {
			ports.hideToolbar_sub();
			expect(inst._hideToolbar_sub).toHaveBeenCalledTimes(1);
		});

		it('styleNodeCache copies inst.__cacheStyleNodes into _styleNodes.value', () => {
			ports.styleNodeCache();
			expect(styleNodes.value).toEqual(['cachedNode1', 'cachedNode2']);
		});

		it('styleNodeCache updates the _styleNodes reference each time', () => {
			inst.__cacheStyleNodes = ['nodeA'];
			ports.styleNodeCache();
			expect(styleNodes.value).toEqual(['nodeA']);

			inst.__cacheStyleNodes = ['nodeB', 'nodeC'];
			ports.styleNodeCache();
			expect(styleNodes.value).toEqual(['nodeB', 'nodeC']);
		});

		it('formatAttrsTempCache sets inst._formatAttrsTemp', () => {
			const attrs = { style: 'color: red;', class: 'test' };
			ports.formatAttrsTempCache(attrs);
			expect(inst._formatAttrsTemp).toEqual(attrs);
		});

		it('formatAttrsTempCache can set null', () => {
			ports.formatAttrsTempCache(null);
			expect(inst._formatAttrsTemp).toBeNull();
		});

		it('setOnShortcutKey sets inst._onShortcutKey', () => {
			ports.setOnShortcutKey(true);
			expect(inst._onShortcutKey).toBe(true);
		});

		it('setOnShortcutKey can toggle to false', () => {
			inst._onShortcutKey = true;
			ports.setOnShortcutKey(false);
			expect(inst._onShortcutKey).toBe(false);
		});
	});

	// ============================================================
	// enterScrollTo
	// ============================================================
	describe('enterScrollTo', () => {
		it('calls ui._iframeAutoHeight with frameContext', () => {
			const mockRange = document.createRange();
			ports.enterScrollTo(mockRange);
			expect(inst.$.ui._iframeAutoHeight).toHaveBeenCalledWith(inst.$.frameContext);
		});

		it('calls selection.scrollTo with range and scroll options when not mobile', () => {
			mockIsMobileValue = false;
			// Re-create ports with updated mock state
			ports = makePorts(inst, { _styleNodes: styleNodes });

			const mockRange = document.createRange();
			ports.enterScrollTo(mockRange);
			expect(inst.$.selection.scrollTo).toHaveBeenCalledWith(mockRange, {
				behavior: 'auto',
				block: 'nearest',
				inline: 'nearest'
			});
		});

		it('calls selection.scrollTo on mobile even when scrollparents has entries', () => {
			mockIsMobileValue = true;
			inst.scrollparents = [document.createElement('div')];
			ports = makePorts(inst, { _styleNodes: styleNodes });

			const mockRange = document.createRange();
			ports.enterScrollTo(mockRange);

			expect(inst.$.ui._iframeAutoHeight).toHaveBeenCalledWith(inst.$.frameContext);
			expect(inst.$.selection.scrollTo).toHaveBeenCalledWith(mockRange, {
				behavior: 'auto',
				block: 'nearest',
				inline: 'nearest'
			});
		});
	});

	// ============================================================
	// enterPrevent
	// ============================================================
	describe('enterPrevent', () => {
		it('calls preventDefault on the event (non-mobile)', () => {
			mockIsMobileValue = false;
			ports = makePorts(inst, { _styleNodes: styleNodes });

			const mockEvent = { preventDefault: jest.fn() };
			ports.enterPrevent(mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
		});

		it('returns early after preventDefault when not mobile (does not focus)', () => {
			mockIsMobileValue = false;
			ports = makePorts(inst, { _styleNodes: styleNodes });

			const mockEvent = { preventDefault: jest.fn() };
			ports.enterPrevent(mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			// On non-mobile, it returns early: __focusTemp.focus and wysiwyg.focus should NOT be called
			expect(inst.__focusTemp.focus).not.toHaveBeenCalled();
		});

		it('on mobile, calls preventDefault then focuses __focusTemp and wysiwyg', () => {
			mockIsMobileValue = true;
			ports = makePorts(inst, { _styleNodes: styleNodes });

			const wysiwyg = { focus: jest.fn() };
			inst.$.frameContext.get = jest.fn((key) => {
				if (key === 'wysiwyg') return wysiwyg;
				return undefined;
			});
			// Re-create ports to pick up new frameContext.get
			ports = makePorts(inst, { _styleNodes: styleNodes });

			const mockEvent = { preventDefault: jest.fn() };
			ports.enterPrevent(mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
			expect(inst.__focusTemp.focus).toHaveBeenCalledWith({ preventScroll: true });
			expect(wysiwyg.focus).toHaveBeenCalledWith({ preventScroll: true });
		});
	});

	// ============================================================
	// Returned object structure
	// ============================================================
	describe('returned ports object structure', () => {
		it('contains all expected top-level port groups and functions', () => {
			expect(ports).toHaveProperty('focusManager');
			expect(ports).toHaveProperty('selection');
			expect(ports).toHaveProperty('format');
			expect(ports).toHaveProperty('listFormat');
			expect(ports).toHaveProperty('component');
			expect(ports).toHaveProperty('html');
			expect(ports).toHaveProperty('history');
			expect(ports).toHaveProperty('nodeTransform');
			expect(ports).toHaveProperty('char');
			expect(ports).toHaveProperty('menu');
			expect(ports).toHaveProperty('setDefaultLine');
			expect(ports).toHaveProperty('hideToolbar');
			expect(ports).toHaveProperty('hideToolbar_sub');
			expect(ports).toHaveProperty('styleNodeCache');
			expect(ports).toHaveProperty('formatAttrsTempCache');
			expect(ports).toHaveProperty('setOnShortcutKey');
			expect(ports).toHaveProperty('enterScrollTo');
			expect(ports).toHaveProperty('enterPrevent');
		});

		it('selection port has all required methods', () => {
			expect(typeof ports.selection.getRange).toBe('function');
			expect(typeof ports.selection.getNode).toBe('function');
			expect(typeof ports.selection.setRange).toBe('function');
			expect(typeof ports.selection.get).toBe('function');
		});

		it('format port has all required methods', () => {
			expect(typeof ports.format.isLine).toBe('function');
			expect(typeof ports.format.getLine).toBe('function');
			expect(typeof ports.format.getLines).toBe('function');
			expect(typeof ports.format.getBrLine).toBe('function');
			expect(typeof ports.format.getBlock).toBe('function');
			expect(typeof ports.format.isNormalLine).toBe('function');
			expect(typeof ports.format.isBrLine).toBe('function');
			expect(typeof ports.format.isClosureBrLine).toBe('function');
			expect(typeof ports.format.isClosureBlock).toBe('function');
			expect(typeof ports.format.isEdgeLine).toBe('function');
			expect(typeof ports.format.removeBlock).toBe('function');
			expect(typeof ports.format.addLine).toBe('function');
		});

		it('component port has all required methods', () => {
			expect(typeof ports.component.deselect).toBe('function');
			expect(typeof ports.component.is).toBe('function');
			expect(typeof ports.component.get).toBe('function');
			expect(typeof ports.component.select).toBe('function');
		});

		it('html port has all required methods', () => {
			expect(typeof ports.html.remove).toBe('function');
			expect(typeof ports.html.insert).toBe('function');
			expect(typeof ports.html.insertNode).toBe('function');
		});

		it('nodeTransform port has all required methods', () => {
			expect(typeof ports.nodeTransform.removeAllParents).toBe('function');
			expect(typeof ports.nodeTransform.split).toBe('function');
		});
	});
});
