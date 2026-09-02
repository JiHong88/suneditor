/**
 * @fileoverview Unit tests for delete rule
 */

import { reduceDeleteDown } from '../../../../../src/core/event/rules/keydown.rule.delete';
import { A } from '../../../../../src/core/event/actions';

describe('Delete Rule', () => {
	let mockPorts;
	let mockCtx;
	let actions;
	let wysiwygDiv;
	let formatEl;
	let textNode;

	beforeEach(() => {
		actions = [];

		// Create mock DOM elements
		wysiwygDiv = document.createElement('div');
		wysiwygDiv.setAttribute('data-se-wysiwyg', 'true');
		formatEl = document.createElement('p');
		textNode = document.createTextNode('Hello World');
		formatEl.appendChild(textNode);
		wysiwygDiv.appendChild(formatEl);
		document.body.appendChild(wysiwygDiv);

		const range = document.createRange();
		range.setStart(textNode, 5);
		range.setEnd(textNode, 5);

		mockPorts = {
			format: {
				isNormalLine: jest.fn().mockReturnValue(true),
				isBrLine: jest.fn().mockReturnValue(false),
				isBlock: jest.fn().mockReturnValue(false),
				isLine: jest.fn().mockReturnValue(true),
				getLine: jest.fn().mockReturnValue(formatEl),
				getBlock: jest.fn().mockReturnValue(null),
				isEdgeLine: jest.fn().mockReturnValue(false),
				isClosureBlock: jest.fn().mockReturnValue(false),
				isClosureBrLine: jest.fn().mockReturnValue(false),
				getBrLine: jest.fn().mockReturnValue(null)
			},
			component: {
				is: jest.fn().mockReturnValue(false),
				get: jest.fn().mockReturnValue(null)
			},
			selection: {
				getRange: jest.fn().mockReturnValue(range)
			},
			focusManager: {
				focus: jest.fn(),
				blur: jest.fn(),
				focusEdge: jest.fn(),
				nativeFocus: jest.fn()
			}
		};

		mockCtx = {
			fc: new Map([['wysiwyg', wysiwygDiv]]),
			options: new Map([['defaultLine', 'P']]),
			range,
			formatEl,
			selectionNode: textNode,
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			}
		};
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should push componentDeselect and cacheStyleNode actions', () => {
		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(actions[0]).toEqual(A.componentDeselect());
		expect(actions[1]).toEqual(A.cacheStyleNode());
		expect(result).toBe(true);
	});

	it('merges the next normal line up when deleting on an empty line (deterministic empty-line delete)', () => {
		const wrap = document.createElement('div');
		wrap.setAttribute('data-se-wysiwyg', 'true');
		const empty = document.createElement('p');
		const zws = document.createTextNode('​');
		empty.appendChild(zws);
		empty.appendChild(document.createElement('br'));
		const next = document.createElement('p');
		next.textContent = 'BBB';
		wrap.appendChild(empty);
		wrap.appendChild(next);
		document.body.appendChild(wrap);

		const range = document.createRange();
		range.setStart(zws, 1);
		range.setEnd(zws, 1);

		mockPorts.selection.getRange.mockReturnValue(range);
		mockPorts.format.getLine.mockReturnValue(empty);
		mockCtx.range = range;
		mockCtx.formatEl = empty;
		mockCtx.selectionNode = zws;
		mockCtx.fc = new Map([['wysiwyg', wrap]]);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(false);
		expect(actions).toContainEqual(A.deleteEmptyLineMergeNext(empty, next));
	});

	it('selects the next component instead of merging when deleting on an empty line before a component', () => {
		const wrap = document.createElement('div');
		wrap.setAttribute('data-se-wysiwyg', 'true');
		const empty = document.createElement('p');
		const zws = document.createTextNode('​');
		empty.appendChild(zws);
		empty.appendChild(document.createElement('br'));
		const figure = document.createElement('figure');
		figure.className = 'se-component';
		wrap.appendChild(empty);
		wrap.appendChild(figure);
		document.body.appendChild(wrap);

		const range = document.createRange();
		range.setStart(zws, 1);
		range.setEnd(zws, 1);

		mockPorts.selection.getRange.mockReturnValue(range);
		mockPorts.format.getLine.mockReturnValue(empty);
		mockPorts.component.is.mockImplementation((el) => el === figure);
		mockCtx.range = range;
		mockCtx.formatEl = empty;
		mockCtx.selectionNode = zws;
		mockCtx.fc = new Map([['wysiwyg', wrap]]);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		// existing component branch wins (returns true); the empty-line merge branch never runs
		expect(result).toBe(true);
		expect(actions).toContainEqual(A.deleteComponentSelectNext(empty, figure));
		expect(actions).not.toContainEqual(A.deleteEmptyLineMergeNext(empty, figure));
	});

	it('should return true for normal delete', () => {
		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle non-collapsed range', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		p1.appendChild(document.createTextNode('Start'));
		p2.appendChild(document.createTextNode('End'));
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		const newRange = document.createRange();
		newRange.setStart(p1.firstChild, 0);
		newRange.setEnd(p2.firstChild, 3);

		mockCtx.range = newRange;
		mockPorts.selection.getRange.mockReturnValue(newRange);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete at end of line with next element', () => {
		// Create next element
		const nextElement = document.createElement('p');
		nextElement.appendChild(document.createTextNode('Next'));

		// Rebuild DOM
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);
		wysiwygDiv.appendChild(nextElement);

		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete with component at next position', () => {
		const img = document.createElement('img');
		img.src = 'test.jpg';

		// Append img after textNode
		formatEl.appendChild(img);

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image'
		});

		mockCtx.selectionNode = textNode;

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete in list', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete at end of last element', () => {
		// Ensure formatEl is the last child
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;
		mockCtx.selectionNode = textNode;

		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isBrLine.mockReturnValue(false);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});

	it('should handle nested list delete', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const nestedUl = document.createElement('ul');
		const nestedLi = document.createElement('li');

		nestedLi.appendChild(document.createTextNode('Nested'));
		nestedUl.appendChild(nestedLi);
		li.appendChild(document.createTextNode('Parent'));
		li.appendChild(nestedUl);
		ul.appendChild(li);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = nestedLi;
		mockCtx.selectionNode = nestedLi.firstChild;

		const newRange = document.createRange();
		newRange.setStart(nestedLi.firstChild, nestedLi.firstChild.length);
		newRange.setEnd(nestedLi.firstChild, nestedLi.firstChild.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(nestedLi);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should add actions array', () => {
		reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle format attributes caching with next element', () => {
		// Create next element with attributes
		const nextElement = document.createElement('p');
		nextElement.setAttribute('class', 'test-class');
		nextElement.setAttribute('data-value', 'test');
		nextElement.appendChild(document.createTextNode('Next'));

		// Rebuild DOM
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);
		wysiwygDiv.appendChild(nextElement);

		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		const cacheAction = actions.find(a => a.t === 'cache.formatAttrsTemp');
		if (cacheAction) {
			expect(cacheAction.p.attrs).toBeTruthy();
		}

		expect(result).toBe(true);
	});

	it('should handle delete with hardDelete scenario', () => {
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		const tr1 = document.createElement('tr');
		const tr2 = document.createElement('tr');
		const td1 = document.createElement('td');
		const td2 = document.createElement('td');

		td1.appendChild(document.createTextNode('Cell 1'));
		td2.appendChild(document.createTextNode('Cell 2'));
		tr1.appendChild(td1);
		tr2.appendChild(td2);
		tbody.appendChild(tr1);
		tbody.appendChild(tr2);
		table.appendChild(tbody);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(table);

		const newRange = document.createRange();
		newRange.setStart(td1.firstChild, 0);
		newRange.setEnd(td2.firstChild, 6);
		mockCtx.range = newRange;

		mockPorts.format.getBlock.mockReturnValueOnce(td1).mockReturnValueOnce(td2);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete between two paragraphs', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		p1.appendChild(document.createTextNode('First'));
		p2.appendChild(document.createTextNode('Second'));

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p1;
		mockCtx.selectionNode = p1.firstChild;

		const newRange = document.createRange();
		newRange.setStart(p1.firstChild, p1.firstChild.length);
		newRange.setEnd(p1.firstChild, p1.firstChild.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p1);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle closure block scenario', () => {
		const blockquote = document.createElement('blockquote');
		const p = document.createElement('p');
		p.appendChild(document.createTextNode('Quote'));
		blockquote.appendChild(p);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(blockquote);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = p.firstChild;

		const newRange = document.createRange();
		newRange.setStart(p.firstChild, p.firstChild.length);
		newRange.setEnd(p.firstChild, p.firstChild.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.isClosureBlock.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});

	describe('brLine empty row (PRE middle-row delete)', () => {
		let preEl, br1, br2;

		beforeEach(() => {
			// AAAA<br(br1)><br(br2)>BBBB — empty row between br1 and br2, caret on br2
			preEl = document.createElement('pre');
			preEl.innerHTML = 'AAAA<br><br>BBBB';
			[br1, br2] = preEl.querySelectorAll('br');
			wysiwygDiv.innerHTML = '';
			wysiwygDiv.appendChild(preEl);

			const r = document.createRange();
			r.setStart(br2, 0);
			r.setEnd(br2, 0);
			mockCtx.range = r;
			mockCtx.formatEl = preEl;
			mockCtx.selectionNode = br2;
			mockPorts.selection.getRange.mockReturnValue(r);
			mockPorts.format.getLine.mockReturnValue(preEl);
			mockPorts.format.isBrLine.mockReturnValue(true);
			mockPorts.format.isNormalLine.mockReturnValue(false);
			mockPorts.format.isLine.mockImplementation((el) => el === preEl); // a <br> is not a line
		});

		it('dispatches deleteBrLineRowMerge for an empty row (caret on the row-ending <br>)', () => {
			const result = reduceDeleteDown(actions, mockPorts, mockCtx);

			const merge = actions.find((a) => a.t === 'delete.brline.rowMerge');
			expect(merge).toBeDefined();
			expect(merge.p.rowEndBr).toBe(br2); // the <br> ending the empty row, removed to pull the next row up
			expect(result).toBe(false);
		});

		it('dispatches preventStop before, and historyPush after, the row merge', () => {
			reduceDeleteDown(actions, mockPorts, mockCtx);
			const preventIdx = actions.findIndex((a) => a.t === 'prevent.stop');
			const mergeIdx = actions.findIndex((a) => a.t === 'delete.brline.rowMerge');
			const historyIdx = actions.findIndex((a) => a.t === 'history.push');
			expect(preventIdx).toBeLessThan(mergeIdx);
			expect(historyIdx).toBeGreaterThan(mergeIdx);
		});
	});

	describe('empty line before a brLine (PRE)', () => {
		it('merges the empty line into the following PRE (deterministic, not native)', () => {
			// <p>(empty)</p><pre>...</pre> — caret in the empty <p>, next sibling is a brLine
			const empty = document.createElement('p');
			const zws = document.createTextNode('​');
			empty.appendChild(zws);
			empty.appendChild(document.createElement('br'));
			const pre = document.createElement('pre');
			pre.innerHTML = 'code<br>line';
			wysiwygDiv.innerHTML = '';
			wysiwygDiv.appendChild(empty);
			wysiwygDiv.appendChild(pre);

			const r = document.createRange();
			r.setStart(zws, 1);
			r.setEnd(zws, 1);
			mockCtx.range = r;
			mockCtx.formatEl = empty;
			mockCtx.selectionNode = zws;
			mockPorts.selection.getRange.mockReturnValue(r);
			mockPorts.format.getLine.mockReturnValue(empty);
			mockPorts.format.isNormalLine.mockImplementation((el) => el === empty);
			mockPorts.format.isBrLine.mockImplementation((el) => el === pre);

			const result = reduceDeleteDown(actions, mockPorts, mockCtx);

			expect(actions).toContainEqual(A.deleteEmptyLineMergeNext(empty, pre));
			expect(result).toBe(false);
		});
	});

	describe('document-order edge decisions (realistic format classification)', () => {
		// The default mocks (isLine always true, isEdgeLine always false) hide edge geometry, so these
		// tests install classifiers matching the real format module.
		function installRealisticFormat() {
			const isLine = (el) => !!el && el.nodeType === 1 && /^(P|DIV|H[1-6]|LI|PRE)$/.test(el.nodeName) && !el.classList?.contains('se-component');
			const isBlock = (el) => !!el && el.nodeType === 1 && /^(UL|OL|BLOCKQUOTE|TABLE|THEAD|TBODY|TR|TD|TH)$/.test(el.nodeName);
			mockPorts.format.isLine.mockImplementation(isLine);
			mockPorts.format.isBlock.mockImplementation(isBlock);
			mockPorts.format.isClosureBlock.mockImplementation((el) => !!el && /^(TD|TH)$/.test(el.nodeName));
			mockPorts.format.isNormalLine.mockImplementation((el) => isLine(el) && !isBlock(el));
			mockPorts.format.isBrLine.mockImplementation((el) => !!el && el.nodeName === 'PRE');
			mockPorts.format.getLine.mockImplementation((node) => {
				let el = node?.nodeType === 1 ? node : node?.parentElement;
				while (el && !isLine(el)) el = el.parentElement;
				return el;
			});
			mockPorts.format.getBlock.mockImplementation((node) => {
				let el = node?.nodeType === 1 ? node : node?.parentElement;
				while (el && (el === node || !isBlock(el))) el = el.parentElement;
				return el;
			});
		}

		// Regression: `getAdjacentLine` returning null was treated as the document edge, so Delete at the
		// end of the line before a component prevented and did nothing — component selection never ran.
		it('falls through to component selection at the end of a line before a component', () => {
			wysiwygDiv.innerHTML = '';
			const p = document.createElement('p');
			const text = document.createTextNode('text');
			p.appendChild(text);
			const figure = document.createElement('figure');
			figure.className = 'se-component';
			figure.textContent = 'img';
			wysiwygDiv.appendChild(p);
			wysiwygDiv.appendChild(figure);

			installRealisticFormat();
			mockPorts.format.isEdgeLine.mockReturnValue(true);
			mockPorts.component.is.mockImplementation((el) => el === figure);

			const r = document.createRange();
			r.setStart(text, text.length);
			r.setEnd(text, text.length);
			mockCtx.range = r;
			mockCtx.formatEl = p;
			mockCtx.selectionNode = text;
			mockPorts.selection.getRange.mockReturnValue(r);

			const result = reduceDeleteDown(actions, mockPorts, mockCtx);

			expect(actions).toContainEqual(A.deleteComponentSelectNext(p, figure));
			expect(result).toBe(true);
		});

		// Regression: the step-out walk aborted at the outer <li> (a line, not a block), read "document
		// edge" and killed the key even though a following cell existed.
		it('merges the following outer cell when deleting at the end of the last nested cell', () => {
			wysiwygDiv.innerHTML = '<ul><li>A<ul><li>B</li></ul></li><li>C</li></ul>';
			const cells = wysiwygDiv.querySelectorAll('li');
			const nested = cells[1]; // "B"
			const following = cells[2]; // "C"
			const text = nested.firstChild;

			installRealisticFormat();
			mockPorts.format.isEdgeLine.mockReturnValue(true);

			const r = document.createRange();
			r.setStart(text, text.length);
			r.setEnd(text, text.length);
			mockCtx.range = r;
			mockCtx.formatEl = nested;
			mockCtx.selectionNode = text;
			mockPorts.selection.getRange.mockReturnValue(r);

			const result = reduceDeleteDown(actions, mockPorts, mockCtx);

			expect(actions).toContainEqual(A.preventStop());
			expect(actions).toContainEqual(A.mergeLineInto(nested, following));
			expect(result).toBe(false);
		});

		it('still prevents at the true document edge behind a nested cell', () => {
			wysiwygDiv.innerHTML = '<ul><li>A<ul><li>B</li></ul></li></ul>';
			const nested = wysiwygDiv.querySelectorAll('li')[1]; // "B", nothing after anywhere
			const text = nested.firstChild;

			installRealisticFormat();
			mockPorts.format.isEdgeLine.mockReturnValue(true);

			const r = document.createRange();
			r.setStart(text, text.length);
			r.setEnd(text, text.length);
			mockCtx.range = r;
			mockCtx.formatEl = nested;
			mockCtx.selectionNode = text;
			mockPorts.selection.getRange.mockReturnValue(r);

			const result = reduceDeleteDown(actions, mockPorts, mockCtx);

			expect(actions).toContainEqual(A.preventStop());
			expect(actions).not.toContainEqual(A.mergeLineInto(nested, expect.anything()));
			expect(result).toBe(false);
		});

		// Regression: gating the nested-list branch on getNestedListTarget also cut off the
		// selection-range path, whose effect runs html.remove() — cross-cell selections fell to native.
		it('keeps handling a cross-cell selection without a nested list', () => {
			wysiwygDiv.innerHTML = '<ul><li>abc</li><li>def</li></ul>';
			const ul = wysiwygDiv.querySelector('ul');
			const [liA, liB] = wysiwygDiv.querySelectorAll('li');

			installRealisticFormat();

			const r = document.createRange();
			r.setStart(liA.firstChild, 1);
			r.setEnd(liB.firstChild, 1);
			mockCtx.range = r;
			mockCtx.formatEl = liA;
			mockCtx.selectionNode = liA.firstChild;
			mockPorts.selection.getRange.mockReturnValue(r);

			const result = reduceDeleteDown(actions, mockPorts, mockCtx);

			expect(actions).toContainEqual(A.deleteListRemoveNested(r, liA, ul));
			expect(result).toBe(true);
		});
	});
});
