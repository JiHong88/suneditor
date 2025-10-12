/**
 * @fileoverview Unit tests for event actions
 */

import { A } from '../../../../../src/core/event/actions';

describe('Event Actions', () => {
	describe('Common actions', () => {
		it('should create prevent action', () => {
			const action = A.prevent();
			expect(action).toEqual({ t: 'event.prevent' });
		});

		it('should create stop action', () => {
			const action = A.stop();
			expect(action).toEqual({ t: 'event.stop' });
		});

		it('should create preventStop action', () => {
			const action = A.preventStop();
			expect(action).toEqual({ t: 'event.prevent.stop' });
		});

		it('should create cacheStyleNode action', () => {
			const action = A.cacheStyleNode();
			expect(action).toEqual({ t: 'cache.styleNode' });
		});

		it('should create cacheFormatAttrsTemp action with attrs', () => {
			const mockAttrs = { name: 'test', value: 'value' };
			const action = A.cacheFormatAttrsTemp(mockAttrs);
			expect(action).toEqual({
				t: 'cache.formatAttrsTemp',
				p: { attrs: mockAttrs }
			});
		});
	});

	describe('Component actions', () => {
		it('should create componentDeselect action', () => {
			const action = A.componentDeselect();
			expect(action).toEqual({ t: 'component.deselect' });
		});

		it('should create selectComponentFallback action', () => {
			const componentInfo = {
				target: document.createElement('div'),
				pluginName: 'image'
			};
			const action = A.selectComponentFallback(componentInfo);
			expect(action).toEqual({
				t: 'select.component.fallback',
				p: { cmponentInfo: componentInfo }
			});
		});
	});

	describe('Editor commands', () => {
		it('should create editorNativeFocus action', () => {
			const action = A.editorNativeFocus();
			expect(action).toEqual({ t: 'editor._nativeFocus' });
		});

		it('should create historyPush action with hard parameter', () => {
			const action = A.historyPush(true);
			expect(action).toEqual({ t: 'history.push', p: true });
		});

		it('should create documentTypeRefreshHeader action', () => {
			const action = A.documentTypeRefreshHeader();
			expect(action).toEqual({ t: 'documentType.refreshHeader' });
		});
	});

	describe('Selection actions', () => {
		it('should create selectionSetRange action with range parameters', () => {
			const sc = document.createTextNode('start');
			const ec = document.createTextNode('end');
			const action = A.selectionSetRange(sc, 0, ec, 5);
			expect(action).toEqual({
				t: 'selection.setRange',
				p: { sc, so: 0, ec, eo: 5 }
			});
		});
	});

	describe('Format actions', () => {
		it('should create formatRemoveBlock action', () => {
			const rangeEl = document.createElement('div');
			const selectedFormats = [document.createElement('p')];
			const newBlockElement = document.createElement('div');

			const action = A.formatRemoveBlock(rangeEl, selectedFormats, newBlockElement, true, false);
			expect(action).toEqual({
				t: 'format.removeBlock',
				p: {
					rangeEl,
					selectedFormats,
					newBlockElement,
					shouldDelete: true,
					skipHistory: false
				}
			});
		});

		it('should create domUtilsRemoveItem action', () => {
			const item = document.createElement('span');
			const action = A.domUtilsRemoveItem(item);
			expect(action).toEqual({
				t: 'dom.utils.removeItem',
				p: { item }
			});
		});
	});

	describe('Backspace actions', () => {
		it('should create delFormatRemoveAndMove action', () => {
			const container = document.createTextNode('text');
			const formatEl = document.createElement('p');
			const action = A.delFormatRemoveAndMove(container, formatEl);
			expect(action).toEqual({
				t: 'del.format.removeAndMove',
				p: { container, formatEl }
			});
		});

		it('should create backspaceFormatMaintain action', () => {
			const formatEl = document.createElement('p');
			const action = A.backspaceFormatMaintain(formatEl);
			expect(action).toEqual({
				t: 'backspace.format.maintain',
				p: { formatEl }
			});
		});

		it('should create backspaceComponentSelect action', () => {
			const selectionNode = document.createElement('div');
			const range = document.createRange();
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			const action = A.backspaceComponentSelect(selectionNode, range, fileComponentInfo);
			expect(action).toEqual({
				t: 'backspace.component.select',
				p: { selectionNode, range, fileComponentInfo }
			});
		});

		it('should create backspaceComponentRemove action', () => {
			const sel = document.createElement('div');
			const formatEl = document.createElement('p');
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			const action = A.backspaceComponentRemove(true, sel, formatEl, fileComponentInfo);
			expect(action).toEqual({
				t: 'backspace.component.remove',
				p: { isList: true, sel, formatEl, fileComponentInfo }
			});
		});

		it('should create backspaceListMergePrev action', () => {
			const prev = document.createElement('li');
			const formatEl = document.createElement('li');
			const rangeEl = document.createElement('ul');

			const action = A.backspaceListMergePrev(prev, formatEl, rangeEl);
			expect(action).toEqual({
				t: 'backspace.list.mergePrev',
				p: { prev, formatEl, rangeEl }
			});
		});

		it('should create backspaceListRemoveNested action', () => {
			const range = document.createRange();
			const action = A.backspaceListRemoveNested(range);
			expect(action).toEqual({
				t: 'backspace.list.removeNested',
				p: { range }
			});
		});
	});

	describe('Delete actions', () => {
		it('should create deleteComponentSelect action', () => {
			const formatEl = document.createElement('p');
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			const action = A.deleteComponentSelect(formatEl, fileComponentInfo);
			expect(action).toEqual({
				t: 'delete.component.select',
				p: { formatEl, fileComponentInfo }
			});
		});

		it('should create deleteComponentSelectNext action', () => {
			const formatEl = document.createElement('p');
			const nextEl = document.createElement('div');

			const action = A.deleteComponentSelectNext(formatEl, nextEl);
			expect(action).toEqual({
				t: 'delete.component.selectNext',
				p: { formatEl, nextEl }
			});
		});

		it('should create deleteListRemoveNested action', () => {
			const range = document.createRange();
			const formatEl = document.createElement('li');
			const rangeEl = document.createElement('ul');

			const action = A.deleteListRemoveNested(range, formatEl, rangeEl);
			expect(action).toEqual({
				t: 'delete.list.removeNested',
				p: { range, formatEl, rangeEl }
			});
		});
	});

	describe('Tab actions', () => {
		it('should create tabFormatIndent action', () => {
			const range = document.createRange();
			const formatEl = document.createElement('p');

			const action = A.tabFormatIndent(range, formatEl, false);
			expect(action).toEqual({
				t: 'tab.format.indent',
				p: { range, formatEl, shift: false }
			});
		});

		it('should create tabFormatIndent action with shift', () => {
			const range = document.createRange();
			const formatEl = document.createElement('p');

			const action = A.tabFormatIndent(range, formatEl, true);
			expect(action).toEqual({
				t: 'tab.format.indent',
				p: { range, formatEl, shift: true }
			});
		});
	});

	describe('Enter actions', () => {
		it('should create enterScrollTo action', () => {
			const range = document.createRange();
			const action = A.enterScrollTo(range);
			expect(action).toEqual({
				t: 'enter.scrollTo',
				p: { range }
			});
		});

		it('should create enterLineAddDefault action', () => {
			const formatEl = document.createElement('h1');
			const action = A.enterLineAddDefault(formatEl);
			expect(action).toEqual({
				t: 'enter.line.addDefault',
				p: { formatEl }
			});
		});

		it('should create enterListAddItem action', () => {
			const formatEl = document.createElement('li');
			const selectionNode = document.createTextNode('text');

			const action = A.enterListAddItem(formatEl, selectionNode);
			expect(action).toEqual({
				t: 'enter.list.addItem',
				p: { formatEl, selectionNode }
			});
		});

		it('should create enterFormatExitEmpty action', () => {
			const formatEl = document.createElement('li');
			const rangeEl = document.createElement('ul');

			const action = A.enterFormatExitEmpty(formatEl, rangeEl);
			expect(action).toEqual({
				t: 'enter.format.exitEmpty',
				p: { formatEl, rangeEl }
			});
		});

		it('should create enterFormatCleanBrAndZWS action', () => {
			const selectionNode = document.createElement('p');
			const brBlock = document.createElement('div');
			const children = selectionNode.childNodes;

			const action = A.enterFormatCleanBrAndZWS(selectionNode, true, brBlock, children, 2);
			expect(action).toEqual({
				t: 'enter.format.cleanBrAndZWS',
				p: {
					selectionNode,
					selectionFormat: true,
					brBlock,
					children,
					offset: 2
				}
			});
		});

		it('should create enterFormatInsertBrHtml action', () => {
			const brBlock = document.createElement('div');
			const range = document.createRange();
			const wSelection = window.getSelection();

			const action = A.enterFormatInsertBrHtml(brBlock, range, wSelection, 3);
			expect(action).toEqual({
				t: 'enter.format.insertBrHtml',
				p: { brBlock, range, wSelection, offset: 3 }
			});
		});

		it('should create enterFormatInsertBrNode action', () => {
			const wSelection = window.getSelection();
			const action = A.enterFormatInsertBrNode(wSelection);
			expect(action).toEqual({
				t: 'enter.format.insertBrNode',
				p: { wSelection }
			});
		});

		it('should create enterFormatBreakAtEdge action', () => {
			const formatEl = document.createElement('p');
			const selectionNode = document.createTextNode('text');

			const action = A.enterFormatBreakAtEdge(formatEl, selectionNode, true, false);
			expect(action).toEqual({
				t: 'enter.format.breakAtEdge',
				p: {
					formatEl,
					selectionNode,
					formatStartEdge: true,
					formatEndEdge: false
				}
			});
		});

		it('should create enterFormatBreakWithSelection action', () => {
			const formatEl = document.createElement('p');
			const range = document.createRange();

			const action = A.enterFormatBreakWithSelection(formatEl, range, false, true);
			expect(action).toEqual({
				t: 'enter.format.breakWithSelection',
				p: {
					formatEl,
					range,
					formatStartEdge: false,
					formatEndEdge: true
				}
			});
		});

		it('should create enterFormatBreakAtCursor action', () => {
			const formatEl = document.createElement('p');
			const range = document.createRange();

			const action = A.enterFormatBreakAtCursor(formatEl, range);
			expect(action).toEqual({
				t: 'enter.format.breakAtCursor',
				p: { formatEl, range }
			});
		});

		it('should create enterFigcaptionExitInList action', () => {
			const formatEl = document.createElement('figcaption');
			const action = A.enterFigcaptionExitInList(formatEl);
			expect(action).toEqual({
				t: 'enter.figcaption.exitInList',
				p: { formatEl }
			});
		});
	});

	describe('Keydown input actions', () => {
		it('should create keydownInputInsertNbsp action', () => {
			const action = A.keydownInputInsertNbsp();
			expect(action).toEqual({ t: 'keydown.input.insertNbsp' });
		});

		it('should create keydownInputInsertZWS action', () => {
			const action = A.keydownInputInsertZWS();
			expect(action).toEqual({ t: 'keydown.input.insertZWS' });
		});
	});

	describe('Action structure validation', () => {
		it('all actions should have t property', () => {
			const allActionCreators = Object.keys(A);

			allActionCreators.forEach(actionName => {
				// Test each action creator with dummy params
				let action;
				try {
					// Provide enough dummy params
					action = A[actionName](...Array(10).fill(null));
				} catch (e) {
					// Some actions don't need params
					action = A[actionName]();
				}

				expect(action).toHaveProperty('t');
				expect(typeof action.t).toBe('string');
			});
		});

		it('actions with parameters should have p property', () => {
			const actionsWithParams = [
				{ fn: A.cacheFormatAttrsTemp, params: [{}] },
				{ fn: A.historyPush, params: [true] },
				{ fn: A.selectionSetRange, params: [null, 0, null, 0] },
				{ fn: A.formatRemoveBlock, params: [null, null, null, false, false] }
			];

			actionsWithParams.forEach(({ fn, params }) => {
				const action = fn(...params);
				expect(action).toHaveProperty('p');
			});
		});
	});

	describe('Action type naming convention', () => {
		it('all action types should use dot notation', () => {
			const allActionCreators = Object.keys(A);

			allActionCreators.forEach(actionName => {
				let action;
				try {
					action = A[actionName](...Array(10).fill(null));
				} catch (e) {
					action = A[actionName]();
				}

				// Should contain at least one dot
				expect(action.t).toMatch(/\./);
			});
		});
	});
});
