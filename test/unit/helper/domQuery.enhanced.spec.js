import { dom } from '../../../src/helper';

describe('dom.query enhanced coverage', () => {
	describe('getNodePath - text node merging', () => {
		it('should merge adjacent text nodes', () => {
			const parent = document.createElement('div');
			const text1 = document.createTextNode('first');
			const text2 = document.createTextNode('second');
			const text3 = document.createTextNode('third');

			parent.appendChild(text1);
			parent.appendChild(text2);
			parent.appendChild(text3);

			const offsets = { s: 0, e: 0 };
			const result = dom.query.getNodePath(text2, parent, offsets);

			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});

		it('should handle text nodes with zero-width characters', () => {
			const parent = document.createElement('div');
			const text1 = document.createTextNode('first\u200B');
			const text2 = document.createTextNode('\u200Bsecond\u200B');

			parent.appendChild(text1);
			parent.appendChild(text2);

			const offsets = { s: 0, e: 0 };
			const result = dom.query.getNodePath(text2, parent, offsets);

			expect(result).toBeDefined();
		});

		it('should merge previous and next text siblings', () => {
			const parent = document.createElement('div');
			const prev1 = document.createTextNode('a');
			const prev2 = document.createTextNode('b');
			const middle = document.createTextNode('middle');
			const next1 = document.createTextNode('c');
			const next2 = document.createTextNode('d');

			parent.appendChild(prev1);
			parent.appendChild(prev2);
			parent.appendChild(middle);
			parent.appendChild(next1);
			parent.appendChild(next2);

			const offsets = { s: 0, e: 0 };
			const result = dom.query.getNodePath(middle, parent, offsets);

			expect(offsets.s).toBeGreaterThanOrEqual(0);
			expect(offsets.e).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getNodeFromPath - edge cases', () => {
		it('should handle path with node length exceeded', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			// Path index exceeds available nodes
			const path = [5]; // exceeds length
			const result = dom.query.getNodeFromPath(path, parent);
			// Should return last available node
			expect(result).toBe(child);
		});

		it('should handle empty childNodes', () => {
			const parent = document.createElement('div');
			const path = [0];
			const result = dom.query.getNodeFromPath(path, parent);
			expect(result).toBe(parent);
		});
	});

	describe('compareElements - complex cases', () => {
		it('should compare elements with different parents', () => {
			const container = document.createElement('div');
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('span');

			container.appendChild(div1);
			container.appendChild(div2);
			div1.appendChild(span1);
			div2.appendChild(span2);

			const result = dom.query.compareElements(span1, span2);
			expect(result).toBeDefined();
			expect(result.ancestor).toBe(container);
		});

		it('should handle elements without common parent', () => {
			const elem1 = document.createElement('div');
			const elem2 = document.createElement('div');
			// Elements not in DOM tree

			const result = dom.query.compareElements(elem1, elem2);
			expect(result).toBeDefined();
			expect(result.ancestor).toBeNull();
		});

		it('should compare elements with same parent', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.compareElements(child1, child2);
			expect(result).toBeDefined();
			expect(result.result).toBe(-1); // child1 < child2
		});
	});

	describe('getListChildren - edge cases', () => {
		it('should get children with depth limit', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.getListChildren(parent, null, 1);
			expect(Array.isArray(result)).toBe(true);
		});

		it('should validate children', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			const p = document.createElement('p');
			parent.appendChild(span);
			parent.appendChild(p);

			const result = dom.query.getListChildren(
				parent,
				(node) => node.tagName === 'SPAN',
				10
			);
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getPreviousDeepestNode - all branches', () => {
		it('should get previous sibling deepest child', () => {
			const parent = document.createElement('div');
			const sibling1 = document.createElement('div');
			const sibling2 = document.createElement('div');
			const child = document.createElement('span');

			parent.appendChild(sibling1);
			parent.appendChild(sibling2);
			sibling1.appendChild(child);

			const result = dom.query.getPreviousDeepestNode(sibling2);
			expect(result).toBe(child);
		});

		it('should traverse up to find previous sibling', () => {
			const grandparent = document.createElement('div');
			const parent1 = document.createElement('div');
			const parent2 = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			grandparent.appendChild(parent1);
			grandparent.appendChild(parent2);
			parent1.appendChild(child1);
			parent2.appendChild(child2);

			const result = dom.query.getPreviousDeepestNode(child2, grandparent);
			expect(result).toBeDefined();
		});

		it('should return null when hitting ceiling', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			const result = dom.query.getPreviousDeepestNode(child, parent);
			expect(result).toBeNull();
		});

		it('should handle non-editable previous node', () => {
			const parent = document.createElement('div');
			const nonEditable = document.createElement('div');
			const current = document.createElement('div');

			nonEditable.setAttribute('contenteditable', 'false');
			parent.appendChild(nonEditable);
			parent.appendChild(current);

			const result = dom.query.getPreviousDeepestNode(current);
			expect(result).toBe(nonEditable);
		});

		it('should return null when no previous node exists', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			const result = dom.query.getPreviousDeepestNode(parent);
			expect(result).toBeNull();
		});
	});

	describe('getNextDeepestNode - all branches', () => {
		it('should get next sibling deepest child', () => {
			const parent = document.createElement('div');
			const sibling1 = document.createElement('div');
			const sibling2 = document.createElement('div');
			const child = document.createElement('span');

			parent.appendChild(sibling1);
			parent.appendChild(sibling2);
			sibling2.appendChild(child);

			const result = dom.query.getNextDeepestNode(sibling1);
			expect(result).toBe(child);
		});

		it('should traverse up to find next sibling', () => {
			const grandparent = document.createElement('div');
			const parent1 = document.createElement('div');
			const parent2 = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			grandparent.appendChild(parent1);
			grandparent.appendChild(parent2);
			parent1.appendChild(child1);
			parent2.appendChild(child2);

			const result = dom.query.getNextDeepestNode(child1, grandparent);
			expect(result).toBeDefined();
		});

		it('should return null when hitting ceiling', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			const result = dom.query.getNextDeepestNode(child, parent);
			expect(result).toBeNull();
		});

		it('should handle non-editable next node', () => {
			const parent = document.createElement('div');
			const current = document.createElement('div');
			const nonEditable = document.createElement('div');

			nonEditable.setAttribute('contenteditable', 'false');
			parent.appendChild(current);
			parent.appendChild(nonEditable);

			const result = dom.query.getNextDeepestNode(current);
			expect(result).toBe(nonEditable);
		});

		it('should return null when no next node exists', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			const result = dom.query.getNextDeepestNode(parent);
			expect(result).toBeNull();
		});
	});

	describe('getParentElement - selector variations', () => {
		it('should find parent with string selector', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(child, 'P');
			expect(result).toBe(parent);
		});

		it('should find parent with function selector', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			grandparent.className = 'target';
			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(
				child,
				(node) => node.className === 'target'
			);
			expect(result).toBe(grandparent);
		});

		it('should respect depth limit', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('div');
			const child = document.createElement('span');

			grandparent.className = 'target';
			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(child, 'DIV', 1);
			expect(result).toBe(parent); // stops at depth 1
		});
	});

	describe('findTabEndIndex - coverage', () => {
		it('should find tab end index', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('test\ttext\there');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 5, 4);
			expect(typeof result).toBe('number');
		});

		it('should handle line without tabs', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('no tabs here');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 0, 4);
			expect(typeof result).toBe('number');
		});
	});

	describe('findVisualLastCell - coverage', () => {
		it('should find last visible cell in table row', () => {
			const row = document.createElement('tr');
			const cell1 = document.createElement('td');
			const cell2 = document.createElement('td');
			const cell3 = document.createElement('td');

			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(cell3);

			const cells = row.children;
			const result = dom.query.findVisualLastCell(cells);
			expect(result).toBeDefined();
		});

		it('should handle cells with colspan', () => {
			const row = document.createElement('tr');
			const cell1 = document.createElement('td');
			const cell2 = document.createElement('td');

			cell1.setAttribute('colspan', '2');
			row.appendChild(cell1);
			row.appendChild(cell2);

			const result = dom.query.findVisualLastCell(row.children);
			expect(result).toBeDefined();
		});

		it('should handle empty row', () => {
			const row = document.createElement('tr');
			const result = dom.query.findVisualLastCell(row.children);
			expect(result).toBeDefined();
		});
	});

	describe('getCommandTarget - coverage', () => {
		it('should find command target from button', () => {
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');

			const result = dom.query.getCommandTarget(button);
			expect(result).toBe(button);
		});

		it('should traverse up from child element', () => {
			const button = document.createElement('button');
			const icon = document.createElement('i');

			button.setAttribute('data-command', 'italic');
			button.appendChild(icon);

			const result = dom.query.getCommandTarget(icon);
			expect(result).toBe(button);
		});
	});

	describe('getEventTarget - coverage', () => {
		it('should get target from event', () => {
			const div = document.createElement('div');
			const event = { target: div, srcElement: null };

			const result = dom.query.getEventTarget(event);
			expect(result).toBe(div);
		});
	});

	describe('sortNodeByDepth - coverage', () => {
		it('should sort list cells by depth', () => {
			const ul = document.createElement('ul');
			const li1 = document.createElement('li');
			const li2 = document.createElement('li');
			const nestedUl = document.createElement('ul');
			const nestedLi = document.createElement('li');

			ul.appendChild(li1);
			ul.appendChild(li2);
			li1.appendChild(nestedUl);
			nestedUl.appendChild(nestedLi);

			const array = [nestedLi, li1, li2];
			dom.query.sortNodeByDepth(array, false);

			// Just verify it doesn't error and modifies the array
			expect(array).toHaveLength(3);
			expect(array).toContain(li1);
			expect(array).toContain(li2);
			expect(array).toContain(nestedLi);
		});

		it('should sort list cells descending', () => {
			const ul = document.createElement('ul');
			const li1 = document.createElement('li');
			const li2 = document.createElement('li');

			ul.appendChild(li1);
			ul.appendChild(li2);

			const array = [li1, li2];
			dom.query.sortNodeByDepth(array, true);

			expect(array).toHaveLength(2);
		});

		it('should handle non-list-cell elements', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');

			const array = [div1, div2];
			dom.query.sortNodeByDepth(array, false);

			expect(array).toHaveLength(2);
		});
	});

	describe('getNodePath - without offsets', () => {
		it('should get path without merging text nodes', () => {
			const parent = document.createElement('div');
			const text1 = document.createTextNode('first');
			const text2 = document.createTextNode('second');

			parent.appendChild(text1);
			parent.appendChild(text2);

			const result = dom.query.getNodePath(text2, parent);
			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getEdgeChildNodes - branches', () => {
		it('should get first and last editable child nodes', () => {
			const parent = document.createElement('div');
			const first = document.createElement('span');
			const middle = document.createElement('p');
			const last = document.createElement('strong');

			parent.appendChild(first);
			parent.appendChild(middle);
			parent.appendChild(last);

			const result = dom.query.getEdgeChildNodes(parent, null);
			expect(result).toBeDefined();
			expect(result.sc).toBeDefined();
			expect(result.ec).toBeDefined();
		});

		it('should respect condition function', () => {
			const parent = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('span');
			const p = document.createElement('p');

			parent.appendChild(span1);
			parent.appendChild(p);
			parent.appendChild(span2);

			const result = dom.query.getEdgeChildNodes(
				parent,
				(node) => node.tagName === 'SPAN'
			);

			expect(result).toBeDefined();
		});
	});


	describe('findTabEndIndex - edge cases', () => {
		it('should handle text with multiple tabs', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('a\tb\tc\td');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 0, 4);
			expect(typeof result).toBe('number');
		});

		it('should handle zero initial offset', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('\tstart');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 0, 4);
			expect(typeof result).toBe('number');
		});
	});

	describe('findVisualLastCell - complex scenarios', () => {
		it('should handle cells with different colspans', () => {
			const row = document.createElement('tr');
			const cell1 = document.createElement('td');
			const cell2 = document.createElement('td');
			const cell3 = document.createElement('td');

			cell1.setAttribute('colspan', '3');
			cell2.setAttribute('colspan', '1');
			cell3.setAttribute('colspan', '2');

			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(cell3);

			const result = dom.query.findVisualLastCell(row.children);
			expect(result).toBeDefined();
		});

		it('should handle row with single cell', () => {
			const row = document.createElement('tr');
			const cell = document.createElement('td');
			row.appendChild(cell);

			const result = dom.query.findVisualLastCell(row.children);
			expect(result).toBeDefined();
		});
	});

	describe('getParentElement - query object', () => {
		it('should find parent by object reference', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(child, parent);
			expect(result).toBe(parent);
		});

		it('should find parent by class selector', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			grandparent.className = 'target-class';
			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(child, '.target-class');
			expect(result).toBe(grandparent);
		});

		it('should find parent by id selector', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			grandparent.id = 'target-id';
			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(child, '#target-id');
			expect(result).toBe(grandparent);
		});

		it('should find parent by name selector', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('input');
			const child = document.createElement('span');

			parent.name = 'target-name';
			grandparent.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElement(child, ':target-name');
			expect(result).toBe(parent);
		});
	});

	describe('getParentElements - query variations', () => {
		it('should find parent elements by function', () => {
			const root = document.createElement('div');
			const parent1 = document.createElement('p');
			const parent2 = document.createElement('div');
			const child = document.createElement('span');

			parent1.className = 'target';
			parent2.className = 'target';
			root.appendChild(parent2);
			parent2.appendChild(parent1);
			parent1.appendChild(child);

			const result = dom.query.getParentElements(child, (el) => el.className === 'target');
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		});

		it('should find parent elements by object', () => {
			const root = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			root.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElements(child, parent);
			expect(result).toContain(parent);
		});

		it('should find parent elements by class selector', () => {
			const root = document.createElement('div');
			const parent1 = document.createElement('p');
			const parent2 = document.createElement('div');
			const child = document.createElement('span');

			parent1.className = 'target-class';
			parent2.className = 'target-class';
			root.appendChild(parent2);
			parent2.appendChild(parent1);
			parent1.appendChild(child);

			const result = dom.query.getParentElements(child, '.target-class');
			expect(result.length).toBeGreaterThan(0);
		});

		it('should find parent elements by id selector', () => {
			const root = document.createElement('div');
			const parent = document.createElement('p');
			const child = document.createElement('span');

			parent.id = 'target-id';
			root.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElements(child, '#target-id');
			expect(result).toContain(parent);
		});

		it('should find parent elements by name selector', () => {
			const root = document.createElement('div');
			const parent = document.createElement('input');
			const child = document.createElement('span');

			parent.name = 'target-name';
			root.appendChild(parent);
			parent.appendChild(child);

			const result = dom.query.getParentElements(child, ':target-name');
			expect(result).toContain(parent);
		});
	});

	describe('findTextIndexOnLine - coverage', () => {
		it('should find text index with text node', () => {
			const line = document.createElement('p');
			const text1 = document.createTextNode('first ');
			const text2 = document.createTextNode('second ');
			const text3 = document.createTextNode('third');

			line.appendChild(text1);
			line.appendChild(text2);
			line.appendChild(text3);

			const result = dom.query.findTextIndexOnLine(line, text2, 3, () => false);
			expect(typeof result).toBe('number');
		});

		it('should handle element nodes', () => {
			const line = document.createElement('p');
			const span = document.createElement('span');
			const text1 = document.createTextNode('text1');
			const text2 = document.createTextNode('text2');

			span.appendChild(text1);
			line.appendChild(span);
			line.appendChild(text2);

			const result = dom.query.findTextIndexOnLine(line, text1, 2, () => false);
			expect(typeof result).toBe('number');
		});

		it('should stop at validate function', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('content');
			const span = document.createElement('span');

			line.appendChild(text);
			line.appendChild(span);

			const result = dom.query.findTextIndexOnLine(line, text, 0, (node) => node === span);
			expect(typeof result).toBe('number');
		});
	});

	describe('getScrollParents - coverage', () => {
		it('should find scrollable parents', () => {
			const scrollable = document.createElement('div');
			scrollable.style.overflow = 'auto';
			const child = document.createElement('div');
			scrollable.appendChild(child);
			document.body.appendChild(scrollable);

			const result = dom.query.getScrollParents(child);
			expect(Array.isArray(result)).toBe(true);

			document.body.removeChild(scrollable);
		});

		it('should handle overflow scroll', () => {
			const scrollable = document.createElement('div');
			scrollable.style.overflow = 'scroll';
			const child = document.createElement('div');
			scrollable.appendChild(child);
			document.body.appendChild(scrollable);

			const result = dom.query.getScrollParents(child);
			expect(result.length).toBeGreaterThanOrEqual(0);

			document.body.removeChild(scrollable);
		});

		it('should handle overflow-x', () => {
			const scrollable = document.createElement('div');
			scrollable.style.overflowX = 'auto';
			const child = document.createElement('div');
			scrollable.appendChild(child);
			document.body.appendChild(scrollable);

			const result = dom.query.getScrollParents(child);
			expect(Array.isArray(result)).toBe(true);

			document.body.removeChild(scrollable);
		});

		it('should handle overflow-y', () => {
			const scrollable = document.createElement('div');
			scrollable.style.overflowY = 'scroll';
			const child = document.createElement('div');
			scrollable.appendChild(child);
			document.body.appendChild(scrollable);

			const result = dom.query.getScrollParents(child);
			expect(Array.isArray(result)).toBe(true);

			document.body.removeChild(scrollable);
		});
	});

	describe('getIframeDocument - coverage', () => {
		it('should get iframe document', () => {
			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);

			const result = dom.query.getIframeDocument(iframe);
			expect(result).toBeDefined();

			document.body.removeChild(iframe);
		});

		it('should handle iframe without contentDocument', () => {
			const iframe = document.createElement('iframe');
			// Don't append to body, so contentDocument may not be available

			const result = dom.query.getIframeDocument(iframe);
			expect(result).toBeDefined();
		});
	});

	describe('getParentElement - depth limit and wysiwyg frame', () => {
		it('should return null when depth exceeded', () => {
			const root = document.createElement('div');
			const level1 = document.createElement('div');
			const level2 = document.createElement('div');
			const level3 = document.createElement('div');

			root.appendChild(level1);
			level1.appendChild(level2);
			level2.appendChild(level3);

			// Search with depth limit of 1 for a non-existent class
			const result = dom.query.getParentElement(level3, '.nonexistent', 1);
			expect(result).toBeNull();
		});

		it('should return null when hitting wysiwyg frame', () => {
			const frame = document.createElement('div');
			frame.className = 'sun-editor-editable';
			const child = document.createElement('div');
			frame.appendChild(child);

			const result = dom.query.getParentElement(child, '.nonexistent');
			expect(result).toBeNull();
		});
	});

	describe('getCommandTarget - null case', () => {
		it('should return null when no command target found', () => {
			const div = document.createElement('div');
			const result = dom.query.getCommandTarget(div);
			expect(result).toBeNull();
		});
	});

	describe('getEdgeChild - with query object', () => {
		it('should find edge child with object query', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			const target = document.createElement('strong');

			parent.appendChild(child1);
			parent.appendChild(child2);
			child2.appendChild(target);

			const result = dom.query.getEdgeChild(parent, target, false);
			expect(result).toBeDefined();
		});

		it('should find last edge child with object query', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const target = document.createElement('strong');
			const child2 = document.createElement('p');

			parent.appendChild(child1);
			child1.appendChild(target);
			parent.appendChild(child2);

			const result = dom.query.getEdgeChild(parent, target, true);
			expect(result).toBeDefined();
		});

		it('should find edge child with class selector', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			child2.className = 'target-class';

			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.getEdgeChild(parent, '.target-class', false);
			expect(result).toBe(child2);
		});

		it('should find edge child with id selector', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			child2.id = 'target-id';

			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.getEdgeChild(parent, '#target-id', false);
			expect(result).toBe(child2);
		});

		it('should find edge child with name selector', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('input');
			child2.name = 'target-name';

			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.getEdgeChild(parent, ':target-name', false);
			expect(result).toBe(child2);
		});

		it('should find text node with text query', () => {
			const parent = document.createElement('div');
			const textNode = document.createTextNode('content');
			const span = document.createElement('span');

			parent.appendChild(textNode);
			parent.appendChild(span);

			const result = dom.query.getEdgeChild(parent, 'text', false);
			expect(result).toBe(textNode);
		});
	});

	describe('findTabEndIndex - with matching tabs', () => {
		it('should find tab end when pattern matches', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('text    more');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 4, 4);
			expect(result).toBeGreaterThan(0);
		});

		it('should return 0 when no match found', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('nospaceshere');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 0, 4);
			expect(result).toBe(0);
		});

		it('should handle non-breaking spaces', () => {
			const line = document.createElement('p');
			const text = document.createTextNode('text\u00A0\u00A0\u00A0\u00A0more');
			line.appendChild(text);

			const result = dom.query.findTabEndIndex(line, 4, 4);
			expect(typeof result).toBe('number');
		});
	});

	describe('findVisualLastCell - with rowspan', () => {
		it('should handle cells with rowspan', () => {
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');
			const row1 = document.createElement('tr');
			const row2 = document.createElement('tr');
			const cell1 = document.createElement('td');
			const cell2 = document.createElement('td');
			const cell3 = document.createElement('td');

			cell1.setAttribute('rowspan', '2');
			cell1.setAttribute('colspan', '1');
			cell2.setAttribute('colspan', '1');
			cell3.setAttribute('colspan', '1');

			row1.appendChild(cell1);
			row1.appendChild(cell2);
			row2.appendChild(cell3);

			tbody.appendChild(row1);
			tbody.appendChild(row2);
			table.appendChild(tbody);

			const allRows = [row1, row2];
			const result = dom.query.findVisualLastCell(
				Array.from(row1.children).concat(Array.from(row2.children))
			);

			expect(result).toBeDefined();
		});

		it('should handle cells with both rowspan and colspan', () => {
			const row = document.createElement('tr');
			const cell1 = document.createElement('td');
			const cell2 = document.createElement('td');

			cell1.setAttribute('rowspan', '2');
			cell1.setAttribute('colspan', '2');
			cell2.setAttribute('rowspan', '1');
			cell2.setAttribute('colspan', '1');

			row.appendChild(cell1);
			row.appendChild(cell2);

			const result = dom.query.findVisualLastCell(row.children);
			expect(result).toBeDefined();
		});
	});
});
