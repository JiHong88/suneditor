import { dom } from '../../../src/helper';

describe('dom.query helper', () => {
	describe('getPositionIndex', () => {
		it('should return index of node among siblings', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');
			const child3 = document.createElement('span');

			parent.appendChild(child1);
			parent.appendChild(child2);
			parent.appendChild(child3);

			expect(dom.query.getPositionIndex(child1)).toBe(0);
			expect(dom.query.getPositionIndex(child2)).toBe(1);
			expect(dom.query.getPositionIndex(child3)).toBe(2);
		});
	});

	describe('getNodePath', () => {
		it('should return path array for nested elements', () => {
			const parent = document.createElement('div');
			const child = document.createElement('p');
			const grandchild = document.createElement('span');

			parent.appendChild(child);
			child.appendChild(grandchild);

			const path = dom.query.getNodePath(grandchild, parent);
			expect(Array.isArray(path)).toBe(true);
			expect(path.length).toBeGreaterThan(0);
		});

		it('should handle text nodes', () => {
			const parent = document.createElement('div');
			const textNode = document.createTextNode('hello');
			parent.appendChild(textNode);

			const path = dom.query.getNodePath(textNode, parent);
			expect(Array.isArray(path)).toBe(true);
		});
	});

	describe('getNodeFromPath', () => {
		it('should retrieve node from path array', () => {
			const parent = document.createElement('div');
			const child = document.createElement('p');
			const grandchild = document.createElement('span');

			parent.appendChild(child);
			child.appendChild(grandchild);

			const path = [0, 0]; // first child, first grandchild
			const result = dom.query.getNodeFromPath(path, parent);
			expect(result).toBe(grandchild);
		});

		it('should handle invalid paths gracefully', () => {
			const parent = document.createElement('div');
			const path = [99, 99]; // non-existent path

			const result = dom.query.getNodeFromPath(path, parent);
			expect(result).toBeTruthy(); // should return some node, likely parent
		});
	});

	describe('getChildNode', () => {
		it('should find child node matching validation', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			const child3 = document.createElement('strong');

			parent.appendChild(child1);
			parent.appendChild(child2);
			parent.appendChild(child3);

			const result = dom.query.getChildNode(parent, (node) => node.tagName === 'P');
			expect(result).toBe(child2);
		});

		it('should return null when no child matches', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			const result = dom.query.getChildNode(parent, (node) => node.tagName === 'P');
			expect(result).toBeNull();
		});

		it('should return null for empty parent', () => {
			const parent = document.createElement('div');
			const result = dom.query.getChildNode(parent);
			expect(result).toBeNull();
		});
	});

	describe('getListChildren', () => {
		it('should return array of child elements', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.getListChildren(parent);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
			expect(result).toContain(child1);
			expect(result).toContain(child2);
		});

		it('should respect validation function', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			const p = document.createElement('p');
			parent.appendChild(span);
			parent.appendChild(p);

			const result = dom.query.getListChildren(parent, (node) => node.tagName === 'P');
			expect(result.length).toBe(1);
			expect(result[0]).toBe(p);
		});

		it('should respect depth parameter', () => {
			const parent = document.createElement('div');
			const child = document.createElement('div');
			const grandchild = document.createElement('span');

			parent.appendChild(child);
			child.appendChild(grandchild);

			const result1 = dom.query.getListChildren(parent, null, 1);
			expect(result1.length).toBe(1);
			expect(result1[0]).toBe(child);

			const result2 = dom.query.getListChildren(parent, null, 2);
			expect(result2.length).toBe(2);
			expect(result2).toContain(child);
			expect(result2).toContain(grandchild);
		});
	});

	describe('getListChildNodes', () => {
		it('should return array including text nodes', () => {
			const parent = document.createElement('div');
			const element = document.createElement('span');
			const textNode = document.createTextNode('hello');

			parent.appendChild(element);
			parent.appendChild(textNode);

			const result = dom.query.getListChildNodes(parent);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
			expect(result).toContain(element);
			expect(result).toContain(textNode);
		});
	});

	describe('getNodeDepth', () => {
		it('should return depth of nested elements', () => {
			const body = document.createElement('body');
			body.className = 'se-wrapper-wysiwyg'; // Make it a wysiwyg frame
			const div = document.createElement('div');
			const p = document.createElement('p');
			const span = document.createElement('span');

			body.appendChild(div);
			div.appendChild(p);
			p.appendChild(span);

			expect(dom.query.getNodeDepth(div)).toBe(0);
			expect(dom.query.getNodeDepth(p)).toBe(1);
			expect(dom.query.getNodeDepth(span)).toBe(2);
		});

		it('should return -1 for wysiwyg frame', () => {
			const body = document.createElement('body');
			body.className = 'se-wrapper-wysiwyg';
			expect(dom.query.getNodeDepth(body)).toBe(-1);
		});
	});

	describe('compareElements', () => {
		it('should compare element positions', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('span');

			parent.appendChild(child1);
			parent.appendChild(child2);

			const result = dom.query.compareElements(child1, child2);
			expect(result.result).toBe(-1); // child1 comes before child2
			expect(result.ancestor).toBe(parent);
		});

		it('should handle elements with no common ancestor', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');

			const result = dom.query.compareElements(div1, div2);
			expect(result.result).toBe(0);
			expect(result.ancestor).toBeNull();
		});
	});

	describe('getParentElement', () => {
		it('should find parent by tag name', () => {
			const body = document.createElement('body');
			const div = document.createElement('div');
			const p = document.createElement('p');
			const span = document.createElement('span');

			body.appendChild(div);
			div.appendChild(p);
			p.appendChild(span);

			const result = dom.query.getParentElement(span, 'div');
			expect(result).toBe(div);
		});

		it('should find parent by class name', () => {
			const div = document.createElement('div');
			div.className = 'container';
			const p = document.createElement('p');
			const span = document.createElement('span');

			div.appendChild(p);
			p.appendChild(span);

			const result = dom.query.getParentElement(span, '.container');
			expect(result).toBe(div);
		});

		it('should find parent by ID', () => {
			const div = document.createElement('div');
			div.id = 'wrapper';
			const p = document.createElement('p');
			const span = document.createElement('span');

			div.appendChild(p);
			p.appendChild(span);

			const result = dom.query.getParentElement(span, '#wrapper');
			expect(result).toBe(div);
		});

		it('should find parent by validation function', () => {
			const div = document.createElement('div');
			div.setAttribute('data-test', 'true');
			const p = document.createElement('p');
			const span = document.createElement('span');

			div.appendChild(p);
			p.appendChild(span);

			const result = dom.query.getParentElement(span, (el) => el.hasAttribute('data-test'));
			expect(result).toBe(div);
		});

		it('should return null when not found', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			div.appendChild(span);

			const result = dom.query.getParentElement(span, 'table');
			expect(result).toBeNull();
		});
	});

	describe('getParentElements', () => {
		it('should return array of matching ancestors', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');
			const div3 = document.createElement('div');
			const span = document.createElement('span');

			div1.appendChild(div2);
			div2.appendChild(div3);
			div3.appendChild(span);

			const result = dom.query.getParentElements(span, 'div');
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(3);
			expect(result).toContain(div1);
			expect(result).toContain(div2);
			expect(result).toContain(div3);
		});
	});

	describe('getEdgeChild', () => {
		it('should find first matching child', () => {
			const parent = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('span');
			const p = document.createElement('p');

			parent.appendChild(span1);
			parent.appendChild(p);
			parent.appendChild(span2);

			const result = dom.query.getEdgeChild(parent, 'span', false);
			expect(result).toBe(span1);
		});

		it('should find last matching child', () => {
			const parent = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('span');
			const p = document.createElement('p');

			parent.appendChild(span1);
			parent.appendChild(p);
			parent.appendChild(span2);

			const result = dom.query.getEdgeChild(parent, 'span', true);
			expect(result).toBe(span2);
		});

		it('should work with validation function', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			const p = document.createElement('p');
			p.className = 'special';

			parent.appendChild(span);
			parent.appendChild(p);

			const result = dom.query.getEdgeChild(parent, (el) => el.className === 'special');
			expect(result).toBe(p);
		});
	});

	describe('getEdgeChildNodes', () => {
		it('should return first and last child nodes', () => {
			const parent = document.createElement('div');
			const text1 = document.createTextNode('first');
			const span = document.createElement('span');
			const text2 = document.createTextNode('last');

			parent.appendChild(text1);
			parent.appendChild(span);
			parent.appendChild(text2);

			const result = dom.query.getEdgeChildNodes(parent, parent);
			expect(result.sc).toBe(text1);
			expect(result.ec).toBe(text2);
		});

		it('should handle single element', () => {
			const div = document.createElement('div');
			const text = document.createTextNode('content');
			div.appendChild(text);

			const result = dom.query.getEdgeChildNodes(div);
			expect(result.sc).toBe(text);
			expect(result.ec).toBe(text);
		});
	});

	describe('findTextIndexOnLine', () => {
		it('should find text index in line element', () => {
			const line = document.createElement('p');
			const text1 = document.createTextNode('Hello ');
			const span = document.createElement('span');
			const text2 = document.createTextNode('world');

			line.appendChild(text1);
			line.appendChild(span);
			span.appendChild(text2);

			const index = dom.query.findTextIndexOnLine(line, text2, 2);
			expect(typeof index).toBe('number');
			expect(index).toBeGreaterThanOrEqual(0);
		});

		it('should return 0 for null line', () => {
			expect(dom.query.findTextIndexOnLine(null, null, 0)).toBe(0);
		});
	});

	describe('getScrollParents', () => {
		it('should return array of scrollable parents', () => {
			const div = document.createElement('div');
			const result = dom.query.getScrollParents(div);
			expect(Array.isArray(result)).toBe(true);
		});

		it('should handle null input', () => {
			const result = dom.query.getScrollParents(null);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
	});

	describe('getIframeDocument', () => {
		it('should handle iframe without contentWindow', () => {
			const iframe = document.createElement('iframe');
			const result = dom.query.getIframeDocument(iframe);
			// Result will depend on browser implementation
			expect(result).toBeDefined();
		});
	});
});