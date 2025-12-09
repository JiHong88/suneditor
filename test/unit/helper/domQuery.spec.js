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

		it('should merge text nodes and calculate offsets when _newOffsets is provided', () => {
			// Setup: <div>Text1|Target|Text2</div>
			// We want to simulate a situation where we are at "Target" text node, 
            // and siblings are also text nodes, and we want to know the offsets.
            // But getNodePath logic actually MODIFIES the DOM (removes siblings and merges).
            
			const parent = document.createElement('div');
			const text1 = document.createTextNode('Hello ');
			const text2 = document.createTextNode('World'); // Target
			const text3 = document.createTextNode('!');
			
			parent.appendChild(text1);
			parent.appendChild(text2);
			parent.appendChild(text3);
            
            const newOffsets = { s: 0, e: 0 };
            const path = dom.query.getNodePath(text2, parent, newOffsets);
            
            // Logic:
            // text1 ("Hello ") is previous sibling.
            // text3 ("!") is next sibling.
            // Merges:
            // previous: text1 removed. text2.textContent becomes "Hello World". _newOffsets.s (start offset?) += "Hello ".length (6).
            // next: text3 removed. text2.textContent becomes "Hello World!". _newOffsets.e (end offset?) += "!".length (1).
            
            // Actually verifying logic in source:
            // _newOffsets.s += tempText.length (previous)
            // _newOffsets.e += tempText.length (next)
            
            // Wait, source: 
            // previous loop: el.textContent = tempText + el.textContent.
            // next loop: el.textContent += tempText.
            
            expect(text2.textContent).toBe('Hello World!');
            expect(parent.childNodes.length).toBe(1); // others removed
            expect(newOffsets.s).toBe(6); // "Hello " length
            expect(newOffsets.e).toBe(1); // "!" length
		});
	});

	describe('getNodeFromPath', () => {
		it('should retrieve node from path array', () => {
			const parent = document.createElement('div');
			const child = document.createElement('p');
			const grandchild = document.createElement('span');

			parent.appendChild(child);
			child.appendChild(grandchild);

			const path = dom.query.getNodePath(grandchild, parent); // Get valid path first
			const result = dom.query.getNodeFromPath(path, parent);
			expect(result).toBe(grandchild);
		});

		it('should handle invalid paths gracefully', () => {
			const parent = document.createElement('div');
			const path = [99, 99]; // non-existent path

			const result = dom.query.getNodeFromPath(path, parent);
			expect(result).toBeTruthy(); // returns parent or closest?
            // Source: if nodes.length <= offsets[i]: current = nodes[nodes.length-1].
            // So it clamps to last child.
		});
	});

	describe('getParentElement', () => {
		it('should find parent by tag name', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			expect(dom.query.getParentElement(child, 'DIV')).toBe(parent);
		});

		it('should find parent by class name (regex check)', () => {
			const parent = document.createElement('div');
			parent.className = 'my-class other';
			const child = document.createElement('span');
			parent.appendChild(child);
			
			expect(dom.query.getParentElement(child, '.my-class')).toBe(parent);
			expect(dom.query.getParentElement(child, '.other')).toBe(parent);
		});

		it('should find parent by ID', () => {
			const parent = document.createElement('div');
			parent.id = 'my-id';
			const child = document.createElement('span');
			parent.appendChild(child);
			
			expect(dom.query.getParentElement(child, '#my-id')).toBe(parent);
		});
        
        it('should find parent by name attribute', () => {
             const parent = document.createElement('form'); // Use form as it has 'name' property
             parent.setAttribute('name', 'my-name');
             const child = document.createElement('span');
             parent.appendChild(child);
             
             expect(dom.query.getParentElement(child, ':my-name')).toBe(parent);
        });

		it('should return null when not found', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			div.appendChild(span);

			const result = dom.query.getParentElement(span, 'table');
			expect(result).toBeNull();
		});
	});

	describe('findVisualLastCell', () => {
		it('should find the visually last cell in a table with rowspans/colspans', () => {
            // Table structure:
            // Row 0: [A (rowspan 2)] [B]
            // Row 1: [C]
            // Visual:
            // A B
            // A C
            // Last visual cell is C? Or A?
            // maxRowEnd: 1. maxColEnd: 1.
            // A: row 0, rowspan 2 -> ends row 1. col 0.
            // B: row 0, rowspan 1 -> ends row 0. col 1.
            // C: row 1, rowspan 1 -> ends row 1. col 1.
            
            // Logic iterates cells.
            // A: occupied[0][0], occupied[1][0]. visualRowEnd=1, visualColEnd=0.
            // B: occupied[0][1]. visualRowEnd=0, visualColEnd=1.
            // C: occupied[1][1]. visualRowEnd=1, visualColEnd=1.
            
            // Check logic:
            // if (visualRowEnd > maxRowEnd || (visualRowEnd === maxRowEnd && visualColEnd > maxColEnd))
            
            // 1. A: maxRowEnd=1, maxColEnd=0. Target=A.
            // 2. B: visualRowEnd=0 (not > 1).
            // 3. C: visualRowEnd=1 (== 1). visualColEnd=1 (> 0). Target=C.
            
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            
            const tr0 = document.createElement('tr');
            const tdA = document.createElement('td');
            tdA.rowSpan = 2;
            tdA.textContent = 'A';
            const tdB = document.createElement('td');
            tdB.textContent = 'B';
            tr0.appendChild(tdA);
            tr0.appendChild(tdB);
            
            const tr1 = document.createElement('tr');
            const tdC = document.createElement('td');
            tdC.textContent = 'C';
            tr1.appendChild(tdC);
            
            tbody.appendChild(tr0);
            tbody.appendChild(tr1);
            
            // Need to mock rowIndex since JSDOM might not calculate it automatically if not attached? 
            // Or JSDOM supports it.
            // JSDOM supports rowIndex.
            
            const cells = [tdA, tdB, tdC];
			const result = dom.query.findVisualLastCell(cells);
			expect(result).toBe(tdC);
		});
        
        it('should handle complex mixed span scenarios', () => {
             // 3x3
             // [A (colspan 2)] [B]
             // [C (rowspan 2)] [D] [E]
             //                 [F] [G]
             
             // Row 0: A A B
             // Row 1: C D E
             // Row 2: C F G
             
             // Last should be G (Row 2, Col 2).
             
             // Implementation note: findVisualLastCell takes an array of cells. logic relies on rowIndex.
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             table.appendChild(tbody);
             
             const tr0 = document.createElement('tr');
             const tdA = document.createElement('td'); tdA.colSpan = 2;
             const tdB = document.createElement('td');
             tr0.appendChild(tdA); tr0.appendChild(tdB);
             
             const tr1 = document.createElement('tr');
             const tdC = document.createElement('td'); tdC.rowSpan = 2;
             const tdD = document.createElement('td');
             const tdE = document.createElement('td');
             tr1.appendChild(tdC); tr1.appendChild(tdD); tr1.appendChild(tdE);
             
             const tr2 = document.createElement('tr');
             const tdF = document.createElement('td');
             const tdG = document.createElement('td');
             tr2.appendChild(tdF); tr2.appendChild(tdG);
             
             tbody.appendChild(tr0); tbody.appendChild(tr1); tbody.appendChild(tr2);

             const cells = [tdA, tdB, tdC, tdD, tdE, tdF, tdG];
             const result = dom.query.findVisualLastCell(cells);
             expect(result).toBe(tdG);
        });
	});

    describe('getEdgeChildNodes', () => {
        it('should return first and last text nodes in deep structure', () => {
            const div = document.createElement('div');
            div.innerHTML = '<p><b>First</b></p><p><span>Last</span></p>';
            // Structure:
            // DIV
            //   P
            //     B
            //       "First"
            //   P
            //     SPAN
            //       "Last"
            
            const result = dom.query.getEdgeChildNodes(div);
            expect(result.sc.textContent).toBe('First');
            expect(result.ec.textContent).toBe('Last');
        });
    });

    describe('getPreviousDeepestNode / getNextDeepestNode', () => {
        it('should traverse previous nodes deeply', () => {
             const div = document.createElement('div');
             div.innerHTML = '<p>1</p><p>2</p>';
             const p2 = div.lastChild;
             const result = dom.query.getPreviousDeepestNode(p2);
             expect(result.textContent).toBe('1');
        });
        
        it('should return previous sibling of parent if no direct previous sibling', () => {
             const wrapper = document.createElement('div');
             const prev = document.createElement('span');
             prev.textContent = 'prev';
             const container = document.createElement('div');
             const target = document.createElement('p');
             target.textContent = 'target';
             
             container.appendChild(target);
             wrapper.appendChild(prev);
             wrapper.appendChild(container);
             
             // structure: <div><span>prev</span><div><p>target</p></div></div>
             // target ('target' text node? No, target element p)
             // previousSibling of p is null.
             // parent (container). previousSibling is prev (span).
             // prev.lastChild (text 'prev').
             
             // wait, function descends into lastChild of found sibling.
             // prev has text node child.
             
             const result = dom.query.getPreviousDeepestNode(target);
             expect(result.textContent).toBe('prev');
        });

        it('should traverse next nodes deeply', () => {
             const div = document.createElement('div');
             div.innerHTML = '<p>1</p><p>2</p>';
             const p1 = div.firstChild;
             const result = dom.query.getNextDeepestNode(p1);
             expect(result.textContent).toBe('2');
        });
            
        it('should return next sibling of parent if no direct next sibling', () => {
             const wrapper = document.createElement('div');
             const container = document.createElement('div');
             const target = document.createElement('p');
             target.textContent = 'target';
             const next = document.createElement('span');
             next.textContent = 'next';
             
             container.appendChild(target);
             wrapper.appendChild(container);
             wrapper.appendChild(next);
             
             // structure: <div><div><p>target</p></div><span>next</span></div>
             // target nextSibling null.
             // parent (container) nextSibling is next (span).
             // next.firstChild ('next').
             
             const result = dom.query.getNextDeepestNode(target);
             expect(result.textContent).toBe('next');
        });
    });

    describe('getEdgeChild (More coverage)', () => {
        it('should skip comment nodes', () => {
             const div = document.createElement('div');
             const comment = document.createComment('skip');
             const span = document.createElement('span');
             div.appendChild(comment);
             div.appendChild(span);
             
             const result = dom.query.getEdgeChild(div, 'span');
             expect(result).toBe(span);
        });
    });

    // ... Rest of the existing tests could be included or implied ...
    // To be safe, I'll include the other standard ones concisely.
    
    describe('getChildNode', () => {
		it('should find child node matching validation', () => {
			const parent = document.createElement('div');
			const child = document.createElement('p');
			parent.appendChild(child);
			expect(dom.query.getChildNode(parent, (n) => n.tagName === 'P')).toBe(child);
		});
    });
    
    describe('getListChildren', () => {
        it('should return array of child elements', () => {
             const parent = document.createElement('div');
             parent.innerHTML = '<span>1</span><span>2</span>';
             expect(dom.query.getListChildren(parent).length).toBe(2);
        });
    });

    describe('getScrollParents', () => {
		it('should return array of scrollable parents', () => {
			const div = document.createElement('div');
            div.style.overflow = 'auto';
            const inner = document.createElement('div');
            div.appendChild(inner);
            document.body.appendChild(div);
            
			const result = dom.query.getScrollParents(inner);
            // Expect to find div
            // Note: Computed style requires element to be in DOM or mocked.
            // JSDOM computes styles if in DOM.
            expect(result).toContain(div);
            document.body.removeChild(div);
		});
	});

    describe('findTabEndIndex', () => {
		it('should find index where tab ends (consecutive spaces)', () => {
             const div = document.createElement('div');
             div.textContent = 'A    B'; // 4 spaces
             // minTabSize = 4
             const index = dom.query.findTabEndIndex(div, 0, 4);
             expect(index).toBeGreaterThan(0);
		});
        
        it('should return 0 if no tab found', () => {
             const div = document.createElement('div');
             div.textContent = 'A B';
             const index = dom.query.findTabEndIndex(div, 0, 4);
             expect(index).toBe(0);
        });
	});

    describe('getEdgeChild with Regex', () => {
        it('should support regex queries for custom attributes', () => {
             const div = document.createElement('div');
             const span = document.createElement('span');
             span.setAttribute('data-test', 'foo');
             div.appendChild(span);
             
             // To trigger lines 440+ (nodeName #text check etc)
             const text = document.createTextNode('txt');
             div.appendChild(text);
             // getEdgeChild(div, 'text', true)
             // query='text' -> query='#text'. regex=/^#text$/i.
             
             const result = dom.query.getEdgeChild(div, 'text', true);
             expect(result).toBe(text);
        });
    });
    
    describe('findTextIndexOnLine (Complex)', () => {
        it('should traverse recursively skipping comments and components', () => {
             const line = document.createElement('div');
             const comment = document.createComment('ignore');
             const comp = document.createElement('span');
             // We need a validation function that returns true for 'comp' to skip it
             // but findTextIndexOnLine logic: if (validation(node)) return ...?
             // No, checking source:
             // findTextIndexOnLine(nodes, target, index, validation)
             // ...
             // if (validation && validation(node)) continue; (skips)?
             
             const text1 = document.createTextNode('A');
             const b = document.createElement('b');
             const text2 = document.createTextNode('B');
             
             line.appendChild(comment);
             line.appendChild(comp);
             line.appendChild(text1);
             line.appendChild(b);
             b.appendChild(text2);
             
             // validation ignores span
             const index = dom.query.findTextIndexOnLine(line, text2, 0, (n) => n === comp);
             // 'A' (length 1) + text2 (target).
             expect(index).toBe(1);
        });
    });

    describe('sortNodeByDepth', () => {
        it('should sort nodes by depth ascending', () => {
             const ul = document.createElement('ul');
             const li1 = document.createElement('li'); // depth 0 relative?
             // Implementation uses getNodeDepth.
             // getNodeDepth checks parent until wysiwyg frame or null.
             // We need full structure to have depth.
             
             document.body.appendChild(ul);
             ul.appendChild(li1);
             const ul2 = document.createElement('ul');
             li1.appendChild(ul2);
             const li2 = document.createElement('li');
             ul2.appendChild(li2);
             // li1 depth: 1 (ul -> li1)
             // li2 depth: 2 (ul -> li1 -> ul2 -> li2)
             
             const arr = [li2, li1];
             dom.query.sortNodeByDepth(arr, false); // ascending (Deepest First)
             
             expect(arr[0]).toBe(li2);
             expect(arr[1]).toBe(li1);
             
             document.body.removeChild(ul);
        });
        
        it('should sort nodes by depth descending', () => {
             const ul = document.createElement('ul');
             const li1 = document.createElement('li');
             const ul2 = document.createElement('ul');
             const li2 = document.createElement('li');
             
             ul.appendChild(li1);
             li1.appendChild(ul2);
             ul2.appendChild(li2);
             document.body.appendChild(ul); // for getNodeDepth
             
             const arr = [li1, li2];
             dom.query.sortNodeByDepth(arr, true); // descending (Shallowest First)
             
             expect(arr[0]).toBe(li1);
             expect(arr[1]).toBe(li2);
             
             document.body.removeChild(ul);
        });
    });

    describe('compareElements (Deep)', () => {
		it('should find common ancestor for deep divergent branches', () => {
            const root = document.createElement('div');
            const branchA = document.createElement('div');
            const branchB = document.createElement('div');
            root.appendChild(branchA);
            root.appendChild(branchB);
            
            const leafA = document.createElement('span');
            branchA.appendChild(leafA);
            
            const midB = document.createElement('p');
            branchB.appendChild(midB);
            const leafB = document.createElement('span');
            midB.appendChild(leafB);
            
            // root -> A -> span
            // root -> B -> p -> span
            
            const result = dom.query.compareElements(leafA, leafB);
            expect(result.ancestor).toBe(root);
            // order: branchA vs branchB. A is index 0. B is index 1.
            // result should be -1.
            expect(result.result).toBe(-1);
		});
    });

    describe('getCommandTarget', () => {
        it('should find element with data-command or command class', () => {
             const div = document.createElement('div');
             div.setAttribute('data-command', 'bold');
             const span = document.createElement('span');
             div.appendChild(span);
             
             expect(dom.query.getCommandTarget(span)).toBe(div);
        });

        it('should return null if no command found', () => {
             const div = document.createElement('div');
             const span = document.createElement('span');
             div.appendChild(span);
             expect(dom.query.getCommandTarget(span)).toBeNull();
        });
    });

    describe('getEventTarget', () => {
        it('should return event.target', () => {
             const span = document.createElement('span');
             const mockEvent = { target: span };
             
             expect(dom.query.getEventTarget(mockEvent)).toBe(span);
        });
    });

    describe('getParentElements (Coverage)', () => {
        it('should finds parents by class name', () => {
             const div1 = document.createElement('div');
             div1.className = 'target';
             const div2 = document.createElement('div');
             const span = document.createElement('span');
             div1.appendChild(div2);
             div2.appendChild(span);
             
             const result = dom.query.getParentElements(span, '.target');
             expect(result).toContain(div1);
             expect(result).not.toContain(div2);
        });
    });
});