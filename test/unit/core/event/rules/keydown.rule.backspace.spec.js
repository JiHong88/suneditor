/**
 * @fileoverview Unit tests for backspace rule
 */

import { reduceBackspaceDown } from '../../../../../src/core/event/rules/keydown.rule.backspace';
import { A } from '../../../../../src/core/event/actions';

describe('Backspace Rule', () => {
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
				isLine: jest.fn().mockReturnValue(true),
				getLine: jest.fn().mockReturnValue(formatEl),
				getBlock: jest.fn().mockReturnValue(null),
				isEdgeLine: jest.fn().mockReturnValue(false),
				isClosureBlock: jest.fn().mockReturnValue(false),
				isClosureBrLine: jest.fn().mockReturnValue(false),
				getBrLine: jest.fn().mockReturnValue(null),
				removeBlock: jest.fn()
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
			},
			setDefaultLine: jest.fn()
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
		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(actions[0]).toEqual(A.componentDeselect());
		expect(actions[1]).toEqual(A.cacheStyleNode());
		expect(result).toBe(true);
	});

	it('should return true for normal backspace', () => {
		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
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

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle list elements', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		// Clear and rebuild wysiwygDiv
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const newRange = document.createRange();
		newRange.setStart(li.firstChild, 0);
		newRange.setEnd(li.firstChild, 0);
		mockCtx.range = newRange;

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle format attributes at edge with previous element', () => {
		// Create actual previous element
		const prevElement = document.createElement('p');
		prevElement.setAttribute('class', 'test-class');
		prevElement.setAttribute('data-value', 'test');
		prevElement.appendChild(document.createTextNode('Previous'));

		// Rebuild DOM with prevElement before formatEl
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(prevElement);
		wysiwygDiv.appendChild(formatEl);

		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		// Check if format attributes were cached
		const cacheAction = actions.find(a => a.t === 'cache.formatAttrsTemp');
		if (cacheAction) {
			expect(cacheAction.p.attrs).toBeTruthy();
		}

		expect(result).toBe(true);
	});

	it('should handle component at previous position', () => {
		const img = document.createElement('img');
		img.src = 'test.jpg';

		// Insert img before textNode
		formatEl.insertBefore(img, textNode);

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image'
		});

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;
		mockCtx.selectionNode = textNode;

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle start of first element', () => {
		// Ensure formatEl is the first child
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;
		mockCtx.selectionNode = textNode;

		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isBrLine.mockReturnValue(false);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});

	it('should handle nested list structure', () => {
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
		newRange.setStart(nestedLi.firstChild, 0);
		newRange.setEnd(nestedLi.firstChild, 0);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(nestedLi);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should add actions array', () => {
		reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle line deletion with previous line', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		p1.appendChild(document.createTextNode('First'));
		p2.appendChild(document.createTextNode('Second'));

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p2;
		mockCtx.selectionNode = p2.firstChild;

		const newRange = document.createRange();
		newRange.setStart(p2.firstChild, 0);
		newRange.setEnd(p2.firstChild, 6);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValueOnce(p2).mockReturnValueOnce(p2);
		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
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
		newRange.setStart(p.firstChild, 0);
		newRange.setEnd(p.firstChild, 0);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.isClosureBlock.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});

	it('should handle backspace with hardDelete scenario', () => {
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

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle empty paragraph backspace', () => {
		const emptyP = document.createElement('p');
		emptyP.innerHTML = '<br>';

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(emptyP);

		mockCtx.formatEl = emptyP;
		mockCtx.selectionNode = emptyP;

		const newRange = document.createRange();
		newRange.setStart(emptyP, 0);
		newRange.setEnd(emptyP, 0);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(emptyP);
		mockPorts.format.isLine.mockReturnValue(true);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});

	// Edge case tests
	it('should set default line when wysiwyg is empty', () => {
		wysiwygDiv.innerHTML = '';

		mockCtx.formatEl = formatEl;
		mockPorts.format.isNormalLine.mockReturnValue(false);
		mockPorts.format.isBrLine.mockReturnValue(false);
		mockPorts.component.is.mockReturnValue(false);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(false);
	});

	it('should handle backspace with component in list', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const img = document.createElement('img');
		img.src = 'test.jpg';
		const text = document.createTextNode('Text');

		li.appendChild(img);
		li.appendChild(text);
		ul.appendChild(li);
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = text;

		const newRange = document.createRange();
		newRange.setStart(text, 0);
		newRange.setEnd(text, 0);
		mockCtx.range = newRange;

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image'
		});

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle backspace in deeply nested list', () => {
		const ul1 = document.createElement('ul');
		const li1 = document.createElement('li');
		const ul2 = document.createElement('ul');
		const li2 = document.createElement('li');
		const ul3 = document.createElement('ul');
		const li3 = document.createElement('li');

		li3.appendChild(document.createTextNode('Deep'));
		ul3.appendChild(li3);
		li2.appendChild(ul3);
		ul2.appendChild(li2);
		li1.appendChild(ul2);
		ul1.appendChild(li1);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul1);

		mockCtx.formatEl = li3;
		mockCtx.selectionNode = li3.firstChild;

		const newRange = document.createRange();
		newRange.setStart(li3.firstChild, 0);
		newRange.setEnd(li3.firstChild, 0);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(li3);
		mockPorts.format.getBlock.mockReturnValue(ul3);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle backspace with zero-width text node', () => {
		const zws = document.createTextNode('\u200B');
		const text = document.createTextNode('Text');

		formatEl.innerHTML = '';
		formatEl.appendChild(zws);
		formatEl.appendChild(text);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);

		mockCtx.selectionNode = text;

		const newRange = document.createRange();
		newRange.setStart(text, 0);
		newRange.setEnd(text, 0);
		mockCtx.range = newRange;

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle backspace at start of BR line', () => {
		const div = document.createElement('div');
		const br = document.createElement('br');
		div.appendChild(br);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(div);

		mockCtx.formatEl = div;
		mockCtx.selectionNode = div;

		const newRange = document.createRange();
		newRange.setStart(div, 0);
		newRange.setEnd(div, 0);
		mockCtx.range = newRange;

		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isBrLine.mockReturnValue(true);
		mockPorts.format.isClosureBrLine.mockReturnValue(false);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	describe('brLine strip (PRE at start)', () => {
		let preEl;

		beforeEach(() => {
			preEl = document.createElement('pre');
			preEl.innerHTML = 'line1<br>line2';
			wysiwygDiv.innerHTML = '';
			wysiwygDiv.classList.add('se-wrapper-wysiwyg');
			wysiwygDiv.appendChild(preEl);

			mockCtx.formatEl = preEl;
			mockCtx.selectionNode = preEl.firstChild;

			const newRange = document.createRange();
			newRange.setStart(preEl.firstChild, 0);
			newRange.setEnd(preEl.firstChild, 0);
			mockCtx.range = newRange;

			mockPorts.format.isLine.mockReturnValue(true);
			mockPorts.format.isBrLine.mockReturnValue(true);
			mockPorts.format.isClosureBrLine.mockReturnValue(false);
			mockPorts.format.isNormalLine.mockReturnValue(false);
		});

		it('should dispatch brLineStrip when PRE is first child of wysiwyg', () => {
			const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

			const stripAction = actions.find((a) => a.t === 'backspace.brline.strip');
			expect(stripAction).toBeDefined();
			expect(stripAction.p.formatEl).toBe(preEl);
			expect(result).toBe(false);
		});

		it('should dispatch preventStop before brLineStrip', () => {
			reduceBackspaceDown(actions, mockPorts, mockCtx);

			const preventIdx = actions.findIndex((a) => a.t === 'prevent.stop');
			const stripIdx = actions.findIndex((a) => a.t === 'backspace.brline.strip');
			expect(preventIdx).toBeLessThan(stripIdx);
		});

		it('should dispatch historyPush after brLineStrip', () => {
			reduceBackspaceDown(actions, mockPorts, mockCtx);

			const stripIdx = actions.findIndex((a) => a.t === 'backspace.brline.strip');
			const historyIdx = actions.findIndex((a) => a.t === 'history.push');
			expect(historyIdx).toBeGreaterThan(stripIdx);
		});

		it('should NOT dispatch brLineStrip when PRE has previous sibling', () => {
			const prevP = document.createElement('p');
			prevP.textContent = 'before';
			wysiwygDiv.insertBefore(prevP, preEl);

			const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

			const stripAction = actions.find((a) => a.t === 'backspace.brline.strip');
			expect(stripAction).toBeUndefined();
			expect(result).toBe(true);
		});

		it('should NOT dispatch brLineStrip when PRE is inside a block (not wysiwyg direct child)', () => {
			const blockquote = document.createElement('blockquote');
			blockquote.appendChild(preEl);
			wysiwygDiv.innerHTML = '';
			wysiwygDiv.appendChild(blockquote);

			const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

			const stripAction = actions.find((a) => a.t === 'backspace.brline.strip');
			expect(stripAction).toBeUndefined();
		});

		it('should still handle closureBrLine normally', () => {
			mockPorts.format.isClosureBrLine.mockReturnValue(true);
			mockPorts.format.isClosureBlock.mockReturnValue(true);

			const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

			const stripAction = actions.find((a) => a.t === 'backspace.brline.strip');
			expect(stripAction).toBeUndefined();
			expect(result).toBe(false);
		});
	});
});
