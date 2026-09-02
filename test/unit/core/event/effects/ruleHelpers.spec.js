/**
 * @fileoverview Unit tests for ruleHelpers
 */

import { hardDelete, cleanRemovedTags, isUneditableNode, setDefaultLine, isEdgeBreakCaret, getEmptyLineMergeTarget, getNestedListTarget, getAdjacentLine, getAdjacentElement } from '../../../../../src/core/event/effects/ruleHelpers';
import { dom } from '../../../../../src/helper';

describe('Rule Helpers', () => {
	let mockPorts;

	beforeEach(() => {
		mockPorts = {
			selection: {
				getRange: jest.fn(() => document.createRange())
			},
			format: {
				getBlock: jest.fn(),
				getLine: jest.fn()
			},
			component: {
				is: jest.fn()
			},
			focusManager: {
				nativeFocus: jest.fn()
			},
			nodeTransform: {
				removeAllParents: jest.fn()
			},
			setDefaultLine: jest.fn()
		};
	});

	describe('hardDelete', () => {
		it('should return false when no special deletion needed', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			range.setStart(textNode, 0);
			range.setEnd(textNode, 4);

			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValue(null);

			const result = hardDelete(mockPorts);
			expect(result).toBe(false);
		});

		it('should delete table when cells are at edges', () => {
			const range = document.createRange();
			const sCell = document.createElement('td');
			const eCell = document.createElement('td');
			const sRow = document.createElement('tr');
			const eRow = document.createElement('tr');
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');

			// Setup: first cell of first row, last cell of last row
			sRow.appendChild(sCell);
			eRow.appendChild(eCell);
			tbody.appendChild(sRow);
			tbody.appendChild(eRow);
			table.appendChild(tbody);
			document.body.appendChild(table);

			range.setStart(sCell, 0);
			range.setEnd(eCell, 0);

			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValueOnce(sCell).mockReturnValueOnce(eCell);

			const result = hardDelete(mockPorts);

			// Should have called nativeFocus
			expect(mockPorts.focusManager.nativeFocus).toHaveBeenCalled();
			expect(result).toBe(true);

			// Cleanup
			document.body.removeChild(table);
		});

		it('should remove component elements', () => {
			const range = document.createRange();
			const sComp = document.createElement('div');
			sComp.className = 'se-component';
			const eComp = document.createElement('div');
			eComp.className = 'se-component';

			document.body.appendChild(sComp);
			document.body.appendChild(eComp);

			range.setStart(sComp, 0);
			range.setEnd(eComp, 0);

			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValue(null);

			const result = hardDelete(mockPorts);

			expect(result).toBe(false);
			expect(document.body.contains(sComp)).toBe(false);
			expect(document.body.contains(eComp)).toBe(false);
		});
	});

	describe('cleanRemovedTags', () => {
		it('should return true and clean when node is outside formatEl', () => {
			const formatEl = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');

			parent.appendChild(startCon);
			document.body.appendChild(formatEl);
			document.body.appendChild(parent);

			const result = cleanRemovedTags(mockPorts, startCon, formatEl);

			expect(result).toBe(true);
			expect(mockPorts.nodeTransform.removeAllParents).toHaveBeenCalled();

			// Cleanup
			document.body.removeChild(formatEl);
			document.body.removeChild(parent);
		});

		it('should add BR if no siblings exist', () => {
			const formatEl = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');
			const container = document.createElement('div');

			parent.appendChild(startCon);
			container.appendChild(parent); // parent has no siblings now
			document.body.appendChild(formatEl);
			document.body.appendChild(container);

			cleanRemovedTags(mockPorts, startCon, formatEl);

			expect(formatEl.querySelector('br')).toBeTruthy();

			// Cleanup
			document.body.removeChild(formatEl);
			document.body.removeChild(container);
		});

		it('should return undefined when node is inside formatEl', () => {
			const formatEl = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');
			const sibling = document.createElement('span'); // Add sibling to stop loop

			parent.appendChild(startCon);
			formatEl.appendChild(sibling); // Add sibling first
			formatEl.appendChild(parent);
			document.body.appendChild(formatEl);

			const result = cleanRemovedTags(mockPorts, startCon, formatEl);

			expect(result).toBeUndefined();

			// Cleanup
			document.body.removeChild(formatEl);
		});
	});

	describe('isUneditableNode', () => {
		it('should return null for editable element', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('should return component node when at edge', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('');
			const p = document.createElement('p');
			const componentDiv = document.createElement('div');
			componentDiv.className = 'se-component';

			p.appendChild(textNode);
			p.appendChild(componentDiv);
			document.body.appendChild(p);

			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);
			mockPorts.component.is.mockReturnValue(true);

			// Mock dom.check methods
			const originalIsComponentContainer = dom.check.isComponentContainer;
			const originalIsNonEditable = dom.check.isNonEditable;
			const originalIsEdgePoint = dom.check.isEdgePoint;

			dom.check.isComponentContainer = jest.fn().mockReturnValue(true);
			dom.check.isNonEditable = jest.fn().mockReturnValue(false);
			dom.check.isEdgePoint = jest.fn().mockReturnValue(true);

			const result = isUneditableNode(mockPorts, range, false);

			expect(result).toBeTruthy();

			// Restore
			dom.check.isComponentContainer = originalIsComponentContainer;
			dom.check.isNonEditable = originalIsNonEditable;
			dom.check.isEdgePoint = originalIsEdgePoint;

			// Cleanup
			document.body.removeChild(p);
		});

		it('should check previousSibling when isFront is true', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('should check nextSibling when isFront is false', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, textNode.length);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, false);
			expect(result).toBeNull();
		});

		it('should handle element container (nodeType === 1)', () => {
			const range = document.createRange();
			const div = document.createElement('div');
			const span = document.createElement('span');

			div.appendChild(span);
			range.setStart(div, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('should check chidren null', () => {
			const range = document.createRange();
			const div = document.createElement('div');

			range.setStart(div, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});
	});

	describe('setDefaultLine', () => {
		it('should call ports.setDefaultLine', () => {
			mockPorts.setDefaultLine.mockReturnValue(null);

			const result = setDefaultLine(mockPorts, 'P');

			expect(mockPorts.setDefaultLine).toHaveBeenCalledWith('P');
			expect(result).toBeNull();
		});

		it('should pass through return value', () => {
			const mockElement = document.createElement('p');
			mockPorts.setDefaultLine.mockReturnValue(mockElement);

			const result = setDefaultLine(mockPorts, 'DIV');

			expect(result).toBe(mockElement);
		});

		it('should handle different tag names', () => {
			setDefaultLine(mockPorts, 'H1');
			expect(mockPorts.setDefaultLine).toHaveBeenCalledWith('H1');

			setDefaultLine(mockPorts, 'DIV');
			expect(mockPorts.setDefaultLine).toHaveBeenCalledWith('DIV');
		});
	});

	describe('Edge cases', () => {
		it('hardDelete should handle null range containers', () => {
			const range = document.createRange();
			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValue(null);

			const result = hardDelete(mockPorts);
			expect(result).toBe(false);
		});

		it('isUneditableNode should handle missing siblings', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('cleanRemovedTags should handle formatEl with existing next sibling', () => {
			const formatEl = document.createElement('p');
			const next = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');

			parent.appendChild(startCon);
			document.body.appendChild(formatEl);
			document.body.appendChild(next);
			document.body.appendChild(parent);

			formatEl.appendChild(next);

			cleanRemovedTags(mockPorts, startCon, formatEl);

			// Should not add BR since next exists
			expect(parent.previousSibling).toBeTruthy();

			// Cleanup
			document.body.removeChild(formatEl);
			document.body.removeChild(parent);
		});
	});
	describe('isEdgeBreakCaret', () => {
		/**
		 * @param {string} html Inner HTML of the line
		 * @returns {HTMLElement} The line element
		 */
		function makeLine(html) {
			const li = document.createElement('li');
			li.innerHTML = html;
			document.body.appendChild(li);
			return li;
		}

		/**
		 * @param {Node} con Range container
		 * @param {number} off Range offset
		 * @returns {Range} Collapsed range
		 */
		function caret(con, off) {
			const range = document.createRange();
			range.setStart(con, off);
			range.setEnd(con, off);
			return range;
		}

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('detects the caret on the <br> of an empty line (both edges)', () => {
			const li = makeLine('\u200B<br>');
			const br = li.querySelector('br');

			expect(isEdgeBreakCaret(caret(br, 0), br, 'front')).toBe(true);
			expect(isEdgeBreakCaret(caret(br, 0), br, 'end')).toBe(true);
		});

		it('treats a nested list as the line edge', () => {
			const li = makeLine('\u200B<br><ul><li>x</li></ul>');
			const br = li.querySelector('br');

			expect(isEdgeBreakCaret(caret(br, 0), br, 'front')).toBe(true);
			expect(isEdgeBreakCaret(caret(br, 0), br, 'end')).toBe(true);
		});

		it('rejects a <br> with content on the tested side', () => {
			const li = makeLine('A<br>B');
			const br = li.querySelector('br');

			expect(isEdgeBreakCaret(caret(br, 0), br, 'front')).toBe(false);
			expect(isEdgeBreakCaret(caret(br, 0), br, 'end')).toBe(false);
		});

		it('rejects a non-break selection node and a non-collapsed range', () => {
			const li = makeLine('\u200B<br>');
			const br = li.querySelector('br');
			const zws = li.firstChild;
			const range = document.createRange();
			range.setStart(zws, 0);
			range.setEnd(zws, 1);

			expect(isEdgeBreakCaret(caret(zws, 0), zws, 'front')).toBe(false);
			expect(isEdgeBreakCaret(range, br, 'front')).toBe(false);
		});
	});
	describe('getEmptyLineMergeTarget', () => {
		// `isNormalLine` is true for LI as well as P — an empty list cell must collapse through the same
		// path as an empty paragraph. Delete used to be dead on an empty cell because the list branch
		// claimed the key and then did nothing.
		const format = {
			isNormalLine: (el) => !!el && /^(P|DIV|H[1-6]|LI)$/.test(el.nodeName),
			isBrLine: (el) => !!el && el.nodeName === 'PRE',
		};

		/**
		 * @param {string} html Wysiwyg content
		 * @returns {HTMLElement} The container
		 */
		function build(html) {
			const root = document.createElement('div');
			root.innerHTML = html;
			document.body.appendChild(root);
			return root;
		}

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('returns the neighbouring cell for an empty list cell (both directions)', () => {
			const root = build('<ul><li><br></li><li><br></li></ul>');
			const [first, second] = root.querySelectorAll('li');

			expect(getEmptyLineMergeTarget(format, first, 'end')).toBe(second);
			expect(getEmptyLineMergeTarget(format, second, 'front')).toBe(first);
		});

		it('returns the neighbouring line for an empty paragraph', () => {
			const root = build('<p>A</p><p><br></p>');
			const [first, second] = root.querySelectorAll('p');

			expect(getEmptyLineMergeTarget(format, second, 'front')).toBe(first);
		});

		it('returns null when the line is not empty, has no neighbour, or is a brLine', () => {
			const root = build('<p>A</p><p><br></p><pre><br></pre>');
			const [withText, empty] = root.querySelectorAll('p');

			expect(getEmptyLineMergeTarget(format, withText, 'end')).toBeNull();
			expect(getEmptyLineMergeTarget(format, empty, 'end')).toBe(root.querySelector('pre'));
			expect(getEmptyLineMergeTarget(format, root.querySelector('pre'), 'front')).toBeNull();
			expect(getEmptyLineMergeTarget(format, null, 'front')).toBeNull();
		});

		it('leaves a cell that owns a nested list to the list rules', () => {
			const root = build('<ul><li><br><ul><li>x</li></ul></li><li>B</li></ul>');
			const cell = root.querySelector('li');

			expect(getEmptyLineMergeTarget(format, cell, 'end')).toBeNull();
		});
	});

	describe('getNestedListTarget', () => {
		/**
		 * @param {string} html Wysiwyg content
		 * @returns {HTMLElement} The container
		 */
		function build(html) {
			const root = document.createElement('div');
			root.innerHTML = html;
			document.body.appendChild(root);
			return root;
		}

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('finds a nested list inside the cell', () => {
			const root = build('<ul><li><br><ul><li>x</li></ul></li></ul>');
			const cell = root.querySelector('li');

			expect(getNestedListTarget(cell, root.querySelector('ul'))).toBe(cell.querySelector('ul'));
		});

		it('finds a following cell that carries a nested list', () => {
			const root = build('<ul><li>A</li><li><ul><li>x</li></ul></li></ul>');
			const [first, second] = root.querySelectorAll('ul > li');

			expect(getNestedListTarget(first, root.querySelector('ul'))).toBe(second);
		});

		// Regression: returning a plain sibling here made the list branch claim the key and do nothing,
		// which blocked the empty-line merge behind it — Delete on an empty cell did nothing at all.
		it('returns null when the neighbouring cell holds no list', () => {
			const root = build('<ul><li><br></li><li>B</li></ul>');
			const cell = root.querySelector('li');

			expect(getNestedListTarget(cell, root.querySelector('ul'))).toBeNull();
		});

		it('returns null for a lone cell', () => {
			const root = build('<ul><li><br></li></ul>');

			expect(getNestedListTarget(root.querySelector('li'), root.querySelector('ul'))).toBeNull();
		});
	});
	describe('getAdjacentLine', () => {
		// Regression: edge decisions used to read `formatEl.nextSibling`, so the last cell of a list looked
		// like the end of the document and Delete died there; a line before a list found no neighbour either.
		const format = {
			isLine: (el) => !!el && /^(P|DIV|H[1-6]|LI|PRE|TD|TH)$/.test(el.nodeName),
			isBlock: (el) => !!el && /^(UL|OL|BLOCKQUOTE|TABLE|THEAD|TBODY|TR|TD|TH)$/.test(el.nodeName),
			isClosureBlock: (el) => !!el && /^(TD|TH)$/.test(el.nodeName),
		};

		/**
		 * @param {string} html Wysiwyg content
		 * @returns {HTMLElement} The container
		 */
		function build(html) {
			const root = document.createElement('div');
			root.innerHTML = html;
			document.body.appendChild(root);
			return root;
		}

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('steps into a list from the line before it', () => {
			const root = build('<p>A</p><ul><li>B</li><li>C</li></ul>');

			expect(getAdjacentLine(format, root.querySelector('p'), 'end')).toBe(root.querySelector('li'));
		});

		it('steps out of a list from its last cell', () => {
			const root = build('<ul><li>A</li></ul><p>B</p>');

			expect(getAdjacentLine(format, root.querySelector('li'), 'end')).toBe(root.querySelector('p'));
		});

		it('walks backwards symmetrically', () => {
			const root = build('<ul><li>A</li></ul><p>B</p>');

			expect(getAdjacentLine(format, root.querySelector('p'), 'front')).toBe(root.querySelector('li'));
		});

		it('returns null at the document edges', () => {
			const root = build('<ul><li>A</li></ul>');
			const cell = root.querySelector('li');

			expect(getAdjacentLine(format, cell, 'front')).toBeNull();
			expect(getAdjacentLine(format, cell, 'end')).toBeNull();
		});

		it('stops at a closure block instead of escaping the table cell', () => {
			const root = build('<table><tbody><tr><td><p>x</p></td></tr></tbody></table><p>B</p>');

			expect(getAdjacentLine(format, root.querySelector('td p'), 'end')).toBeNull();
		});

		// Regression: the step-out loop only climbed through blocks, so a nested list cell's outer
		// `<li>` parent (a line, not a block) read as the document edge and Delete died there.
		it('steps out through the outer cell from the last nested cell', () => {
			const root = build('<ul><li>A<ul><li>B</li></ul></li><li>C</li></ul>');
			const nested = root.querySelectorAll('li')[1]; // "B"

			expect(getAdjacentLine(format, nested, 'end')).toBe(root.querySelectorAll('li')[2]); // "C"
		});

		it('returns the outer cell itself as the previous line of a first nested cell', () => {
			const root = build('<ul><li>A<ul><li>B</li></ul></li></ul>');
			const nested = root.querySelectorAll('li')[1]; // "B"

			expect(getAdjacentLine(format, nested, 'front')).toBe(root.querySelector('li')); // "A"
		});

		it('returns null at the document edge behind a nested cell', () => {
			const root = build('<ul><li>A<ul><li>B</li></ul></li></ul>');
			const nested = root.querySelectorAll('li')[1]; // "B"

			expect(getAdjacentLine(format, nested, 'end')).toBeNull();
			expect(getAdjacentElement(format, nested, 'end')).toBeNull();
		});

		// Regression: a component next door is not the document edge — getAdjacentLine returns null
		// (no line), but getAdjacentElement must still surface the element so the delete rule falls
		// through to its component-select branches instead of claiming a dead no-op.
		it('tells a component neighbour apart from the document edge', () => {
			const root = build('<p>A</p><figure class="se-component">img</figure>');
			const line = root.querySelector('p');

			expect(getAdjacentLine(format, line, 'end')).toBeNull();
			expect(getAdjacentElement(format, line, 'end')).toBe(root.querySelector('figure'));
		});
	});
});
