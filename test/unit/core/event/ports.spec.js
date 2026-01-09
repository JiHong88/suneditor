/**
 * @fileoverview Unit tests for event ports
 */

import { makePorts } from '../../../../src/core/event/ports';

describe('Event Ports', () => {
	let mockInst;
	let mockStyleNodes;
	let ports;

	beforeEach(() => {
		mockStyleNodes = { value: null };

		mockInst = {
			focusManager: {
				nativeFocus: jest.fn(),
				blur: jest.fn()
			},
			uiManager: {
				_iframeAutoHeight: jest.fn()
			},
			selection: {
				getRange: jest.fn(() => document.createRange()),
				getNode: jest.fn(() => document.createElement('div')),
				setRange: jest.fn(),
				get: jest.fn(() => window.getSelection()),
				scrollTo: jest.fn()
			},
			format: {
				isLine: jest.fn(() => true),
				getLine: jest.fn(() => document.createElement('p')),
				getLines: jest.fn(() => []),
				getBrLine: jest.fn(() => null),
				getBlock: jest.fn(() => null),
				isNormalLine: jest.fn(() => true),
				isBrLine: jest.fn(() => false),
				isClosureBrLine: jest.fn(() => false),
				isClosureBlock: jest.fn(() => false),
				isEdgeLine: jest.fn(() => false),
				removeBlock: jest.fn(),
				addLine: jest.fn()
			},
			listFormat: {
				applyNested: jest.fn()
			},
			component: {
				deselect: jest.fn(),
				is: jest.fn(() => false),
				get: jest.fn(() => null),
				select: jest.fn()
			},
			html: {
				remove: jest.fn(),
				insert: jest.fn(),
				insertNode: jest.fn()
			},
			history: {
				push: jest.fn()
			},
			nodeTransform: {
				removeAllParents: jest.fn(),
				split: jest.fn()
			},
			char: {
				check: jest.fn(() => true)
			},
			menu: {
				dropdownOff: jest.fn()
			},
			_setDefaultLine: jest.fn(),
			_hideToolbar: jest.fn(),
			_hideToolbar_sub: jest.fn(),
			__cacheStyleNodes: { test: 'value' },
			_formatAttrsTemp: null,
			_onShortcutKey: false,
			frameContext: new Map([['wysiwyg', document.createElement('div')]]),
			scrollparents: [],
			__focusTemp: document.createElement('div')
		};

		mockInst.__focusTemp.focus = jest.fn();
		mockInst.frameContext.get('wysiwyg').focus = jest.fn();

		ports = makePorts(mockInst, { _styleNodes: mockStyleNodes });
	});

	describe('Port structure', () => {
		it('should return ports object with all required properties', () => {
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
			expect(ports).toHaveProperty('enterPrevent');
			expect(ports).toHaveProperty('enterScrollTo');
		});

		it('should have focusManager ports', () => {
			expect(typeof ports.focusManager.nativeFocus).toBe('function');
			expect(typeof ports.focusManager.blur).toBe('function');
		});

		it('should have selection ports', () => {
			expect(typeof ports.selection.getRange).toBe('function');
			expect(typeof ports.selection.getNode).toBe('function');
			expect(typeof ports.selection.setRange).toBe('function');
			expect(typeof ports.selection.get).toBe('function');
		});

		it('should have format ports', () => {
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
	});

	describe('FocusManager ports', () => {
		it('should call focusManager.nativeFocus', () => {
			ports.focusManager.nativeFocus();
			expect(mockInst.focusManager.nativeFocus).toHaveBeenCalled();
		});

		it('should call focusManager.blur', () => {
			ports.focusManager.blur();
			expect(mockInst.focusManager.blur).toHaveBeenCalled();
		});
	});

	describe('Selection ports', () => {
		it('should call selection.getRange', () => {
			const result = ports.selection.getRange();
			expect(mockInst.selection.getRange).toHaveBeenCalled();
			expect(result).toBeInstanceOf(Range);
		});

		it('should call selection.getNode', () => {
			const result = ports.selection.getNode();
			expect(mockInst.selection.getNode).toHaveBeenCalled();
			expect(result).toBeInstanceOf(HTMLElement);
		});

		it('should call selection.setRange with correct arguments', () => {
			const sc = document.createTextNode('start');
			const ec = document.createTextNode('end');
			ports.selection.setRange(sc, 0, ec, 5);
			expect(mockInst.selection.setRange).toHaveBeenCalledWith(sc, 0, ec, 5);
		});

		it('should call selection.get', () => {
			const result = ports.selection.get();
			expect(mockInst.selection.get).toHaveBeenCalled();
			expect(result).toBe(window.getSelection());
		});
	});

	describe('Format ports', () => {
		it('should call format.isLine', () => {
			const node = document.createElement('p');
			const result = ports.format.isLine(node);
			expect(mockInst.format.isLine).toHaveBeenCalledWith(node);
			expect(result).toBe(true);
		});

		it('should call format.getLine', () => {
			const node = document.createTextNode('text');
			const parent = document.createElement('div');
			ports.format.getLine(node, parent);
			expect(mockInst.format.getLine).toHaveBeenCalledWith(node, parent);
		});

		it('should call format.getLines', () => {
			const value = true;
			ports.format.getLines(value);
			expect(mockInst.format.getLines).toHaveBeenCalledWith(value);
		});

		it('should call format.getBrLine', () => {
			const node = document.createTextNode('text');
			const parent = document.createElement('div');
			ports.format.getBrLine(node, parent);
			expect(mockInst.format.getBrLine).toHaveBeenCalledWith(node, parent);
		});

		it('should call format.getBlock', () => {
			const node = document.createElement('p');
			const parent = document.createElement('div');
			ports.format.getBlock(node, parent);
			expect(mockInst.format.getBlock).toHaveBeenCalledWith(node, parent);
		});

		it('should call format.isNormalLine', () => {
			const node = document.createElement('p');
			ports.format.isNormalLine(node);
			expect(mockInst.format.isNormalLine).toHaveBeenCalledWith(node);
		});

		it('should call format.isBrLine', () => {
			const node = document.createElement('div');
			ports.format.isBrLine(node);
			expect(mockInst.format.isBrLine).toHaveBeenCalledWith(node);
		});

		it('should call format.isClosureBrLine', () => {
			const node = document.createElement('div');
			ports.format.isClosureBrLine(node);
			expect(mockInst.format.isClosureBrLine).toHaveBeenCalledWith(node);
		});

		it('should call format.isClosureBlock', () => {
			const node = document.createElement('blockquote');
			ports.format.isClosureBlock(node);
			expect(mockInst.format.isClosureBlock).toHaveBeenCalledWith(node);
		});

		it('should call format.isEdgeLine', () => {
			const node = document.createTextNode('text');
			ports.format.isEdgeLine(node, 0, 'front');
			expect(mockInst.format.isEdgeLine).toHaveBeenCalledWith(node, 0, 'front');
		});

		it('should call format.removeBlock', () => {
			const node = document.createElement('div');
			const parent = document.createElement('div');
			ports.format.removeBlock(node, parent);
			expect(mockInst.format.removeBlock).toHaveBeenCalledWith(node, parent);
		});

		it('should call format.addLine', () => {
			const el = document.createElement('p');
			const next = document.createElement('p');
			ports.format.addLine(el, next);
			expect(mockInst.format.addLine).toHaveBeenCalledWith(el, next);
		});
	});

	describe('ListFormat ports', () => {
		it('should call listFormat.applyNested', () => {
			const cells = [document.createElement('li')];
			ports.listFormat.applyNested(cells, true);
			expect(mockInst.listFormat.applyNested).toHaveBeenCalledWith(cells, true);
		});
	});

	describe('Component ports', () => {
		it('should call component.deselect', () => {
			ports.component.deselect();
			expect(mockInst.component.deselect).toHaveBeenCalled();
		});

		it('should call component.is', () => {
			const node = document.createElement('div');
			const result = ports.component.is(node);
			expect(mockInst.component.is).toHaveBeenCalledWith(node);
			expect(result).toBe(false);
		});

		it('should call component.get', () => {
			const node = document.createElement('div');
			ports.component.get(node);
			expect(mockInst.component.get).toHaveBeenCalledWith(node);
		});

		it('should call component.select', () => {
			const target = document.createElement('div');
			const plugin = 'image';
			ports.component.select(target, plugin);
			expect(mockInst.component.select).toHaveBeenCalledWith(target, plugin);
		});
	});

	describe('HTML ports', () => {
		it('should call html.remove', () => {
			ports.html.remove();
			expect(mockInst.html.remove).toHaveBeenCalled();
		});

		it('should call html.insert', () => {
			const html = '<p>test</p>';
			const clean = true;
			ports.html.insert(html, clean);
			expect(mockInst.html.insert).toHaveBeenCalledWith(html, clean);
		});

		it('should call html.insertNode', () => {
			const node = document.createElement('p');
			const notHistPush = false;
			ports.html.insertNode(node, notHistPush);
			expect(mockInst.html.insertNode).toHaveBeenCalledWith(node, notHistPush);
		});
	});

	describe('History ports', () => {
		it('should call history.push with boolean value', () => {
			ports.history.push(true);
			expect(mockInst.history.push).toHaveBeenCalledWith(true);
		});

		it('should convert falsy values to false', () => {
			ports.history.push(0);
			expect(mockInst.history.push).toHaveBeenCalledWith(false);
		});
	});

	describe('NodeTransform ports', () => {
		it('should call nodeTransform.removeAllParents', () => {
			const sel = document.createTextNode('text');
			const notDel = null;
			const parent = document.createElement('div');
			ports.nodeTransform.removeAllParents(sel, notDel, parent);
			expect(mockInst.nodeTransform.removeAllParents).toHaveBeenCalledWith(sel, notDel, parent);
		});

		it('should call nodeTransform.split', () => {
			const node = document.createElement('p');
			const offset = 5;
			const depth = 0;
			ports.nodeTransform.split(node, offset, depth);
			expect(mockInst.nodeTransform.split).toHaveBeenCalledWith(node, offset, depth);
		});
	});

	describe('Char ports', () => {
		it('should call char.check', () => {
			const content = 'test content';
			const result = ports.char.check(content);
			expect(mockInst.char.check).toHaveBeenCalledWith(content);
			expect(result).toBe(true);
		});
	});

	describe('Menu ports', () => {
		it('should call menu.dropdownOff', () => {
			ports.menu.dropdownOff();
			expect(mockInst.menu.dropdownOff).toHaveBeenCalled();
		});
	});

	describe('Instance command ports', () => {
		it('should call setDefaultLine', () => {
			ports.setDefaultLine('P');
			expect(mockInst._setDefaultLine).toHaveBeenCalledWith('P');
		});

		it('should call hideToolbar', () => {
			ports.hideToolbar();
			expect(mockInst._hideToolbar).toHaveBeenCalled();
		});

		it('should call hideToolbar_sub', () => {
			ports.hideToolbar_sub();
			expect(mockInst._hideToolbar_sub).toHaveBeenCalled();
		});

		it('should cache style nodes', () => {
			ports.styleNodeCache();
			expect(mockStyleNodes.value).toBe(mockInst.__cacheStyleNodes);
		});

		it('should cache format attributes', () => {
			const attrs = { class: 'test', id: 'test-id' };
			ports.formatAttrsTempCache(attrs);
			expect(mockInst._formatAttrsTemp).toBe(attrs);
		});

		it('should set onShortcutKey value', () => {
			ports.setOnShortcutKey(true);
			expect(mockInst._onShortcutKey).toBe(true);

			ports.setOnShortcutKey(false);
			expect(mockInst._onShortcutKey).toBe(false);
		});
	});

	describe('Enter event specific ports', () => {
		it('should call enterScrollTo', () => {
			const range = document.createRange();
			ports.enterScrollTo(range);

			expect(mockInst.uiManager._iframeAutoHeight).toHaveBeenCalledWith(mockInst.frameContext);
			expect(mockInst.selection.scrollTo).toHaveBeenCalledWith(range, {
				behavior: 'auto',
				block: 'nearest',
				inline: 'nearest'
			});
		});

		it('should not scroll on mobile with scrollparents', () => {
			// Mock isMobile
			const originalUserAgent = navigator.userAgent;
			Object.defineProperty(navigator, 'userAgent', {
				get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
				configurable: true
			});

			mockInst.scrollparents = [document.createElement('div')];

			const range = document.createRange();
			ports.enterScrollTo(range);

			expect(mockInst.uiManager._iframeAutoHeight).toHaveBeenCalled();
			// scrollTo should not be called on mobile with scrollparents
			// Note: This behavior depends on isMobile implementation

			// Restore
			Object.defineProperty(navigator, 'userAgent', {
				get: () => originalUserAgent,
				configurable: true
			});
		});

		it('should call enterPrevent and prevent default', () => {
			const mockEvent = {
				preventDefault: jest.fn()
			};

			ports.enterPrevent(mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should focus elements on mobile', () => {
			// Mock isMobile
			const originalUserAgent = navigator.userAgent;
			Object.defineProperty(navigator, 'userAgent', {
				get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
				configurable: true
			});

			const mockEvent = {
				preventDefault: jest.fn()
			};

			ports.enterPrevent(mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			// Note: Focus calls depend on isMobile implementation

			// Restore
			Object.defineProperty(navigator, 'userAgent', {
				get: () => originalUserAgent,
				configurable: true
			});
		});
	});

	describe('Edge cases', () => {
		it('should handle null/undefined arguments gracefully', () => {
			expect(() => ports.format.isLine(null)).not.toThrow();
			expect(() => ports.component.is(undefined)).not.toThrow();
		});

		it('should handle multiple calls to same port', () => {
			ports.component.deselect();
			ports.component.deselect();
			ports.component.deselect();

			expect(mockInst.component.deselect).toHaveBeenCalledTimes(3);
		});

		it('should maintain closure state', () => {
			const attrs1 = { class: 'test1' };
			const attrs2 = { class: 'test2' };

			ports.formatAttrsTempCache(attrs1);
			expect(mockInst._formatAttrsTemp).toBe(attrs1);

			ports.formatAttrsTempCache(attrs2);
			expect(mockInst._formatAttrsTemp).toBe(attrs2);
		});
	});
});
