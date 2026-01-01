/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('Selection', () => {
	let editor;
	let selection;
	let wysiwyg;
	let getClientRectsSpy;
	let scrollIntoViewSpy;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		selection = editor.selection;
		wysiwyg = editor.frameContext.get('wysiwyg');

		// jsdom stubs
		const rectImpl = () => [{ top: 0, bottom: 10, left: 0, right: 10, width: 10, height: 10 }];
		if (Element.prototype.getClientRects) {
			getClientRectsSpy = jest.spyOn(Element.prototype, 'getClientRects').mockImplementation(rectImpl);
		} else {
			Object.defineProperty(Element.prototype, 'getClientRects', {
				value: rectImpl,
				writable: true,
			});
		}
		if (!Node.prototype.getClientRects) {
			Object.defineProperty(Node.prototype, 'getClientRects', {
				value: rectImpl,
				writable: true,
			});
		}
		if (typeof Range !== 'undefined' && !Range.prototype.getClientRects) {
			Object.defineProperty(Range.prototype, 'getClientRects', {
				value: rectImpl,
				writable: true,
			});
		}

		const scrollImpl = () => {};
		if (Element.prototype.scrollIntoView) {
			scrollIntoViewSpy = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollImpl);
		} else {
			Object.defineProperty(Element.prototype, 'scrollIntoView', {
				value: scrollImpl,
				writable: true,
			});
		}
	});

	afterEach(() => {
		getClientRectsSpy?.mockRestore();
		scrollIntoViewSpy?.mockRestore();
		destroyTestEditor(editor);
	});

	describe('get', () => {
		it('should get window selection object', () => {
			const sel = selection.get();
			expect(sel).toBeDefined();
		});

		it('should return null if no selection available', () => {
			const mockContext = {
				get: jest.fn((key) => {
					if (key === '_ww') return { getSelection: () => null };
					if (key === 'wysiwyg') return wysiwyg;
					return null;
				}),
			};
			const origContext = selection.frameContext;
			selection.frameContext = mockContext;

			const result = selection.get();
			expect(result).toBeNull();

			selection.frameContext = origContext;
		});

		it('should handle wysiwyg not containing focusNode (lines 57-60)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;
			const text = p.firstChild;

			selection.setRange(text, 0, text, 4);

			const outsideDiv = document.createElement('div');
			document.body.appendChild(outsideDiv);
			const outsideText = document.createTextNode('outside');
			outsideDiv.appendChild(outsideText);

			const nativeSelection = window.getSelection();
			nativeSelection.removeAllRanges();
			const outsideRange = document.createRange();
			outsideRange.setStart(outsideText, 0);
			outsideRange.setEnd(outsideText, 7);
			nativeSelection.addRange(outsideRange);

			const result = selection.get();
			expect(result).toBeDefined();

			document.body.removeChild(outsideDiv);
		});
	});

	describe('isRange', () => {
		it('should validate range object', () => {
			const range = document.createRange();
			expect(selection.isRange(range)).toBe(true);
		});

		it('should return false for non-range object', () => {
			expect(selection.isRange(null)).toBe(false);
			expect(selection.isRange({})).toBe(false);
		});
	});

	describe('getRange', () => {
		it('should get current range', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			const range = selection.getRange();
			expect(range).toBeDefined();
			expect(range.startContainer).toBe(text);
		});

		it('should handle collapsed range (lines 80-92)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 2, text, 2);

			const range = selection.getRange();
			expect(range.collapsed).toBe(true);
		});

		it('should handle component startContainer (lines 84-89)', () => {
			wysiwyg.innerHTML = '<p><img src="test.jpg"></p>';
			const p = wysiwyg.firstChild;
			const img = p.firstChild;

			editor.component.is = jest.fn(() => true);
			editor.component.get = jest.fn(() => ({
				container: p,
			}));

			selection.setRange(img, 0, img, 0);
			const range = selection.getRange();

			expect(range).toBeDefined();
		});

		it('should handle selection isCollapsed mismatch (lines 83,94-96)', () => {
			wysiwyg.innerHTML = '<p>test content here</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			const sel = selection.get();
			const range = selection.getRange();

			expect(range).toBeDefined();
		});

        it('should correctly order range based on compareElements (getRange logic)', () => {
            // Setup two nodes at different depths
            // Node A (depth 2): <p><b>TextA</b></p>
            // Node B (depth 1): <p>TextB</p>
            wysiwyg.innerHTML = '<p><b>TextA</b></p><p>TextB</p>';
            const bTag = wysiwyg.querySelector('b');
            const textA = bTag.firstChild;
            const p2 = wysiwyg.children[1];
            const textB = p2.firstChild;
            
            // Native selection can be created in reverse order (focus before anchor)
            const sel = window.getSelection();
            sel.removeAllRanges();
            
            // Create a selection where Anchor is TextB (later in document) and Focus is TextA (earlier)
            // This is a "backwards" selection user might make
            const range = document.createRange();
            range.setStart(textA, 0);
            range.setEnd(textB, 1);
            sel.addRange(range);
            
            // Mock selection properties to simulate backward direction if needed, 
            // but JSDOM selection behavior is limited.
            // Selection.extend() usually creates backwards, but here we manually mock properties if we want to confirm reversal logic
            // core.selection.getRange() checks: 
            // if (selection.rangeCount > 0) return ...
            // else use anchorNode/focusNode + compareElements
            
            // To trigger the compareElements block (lines 110-117), we need rangeCount to be 0 or force the logic?
            // Actually getRange checks selection.rangeCount > 0 first.
            // If we want to test lines 110-117, we must ensure the first condition fails or we simulate a state where current range is invalid?
            // The code says: if (selection.rangeCount > 0) { this.status._range = selection.getRangeAt(0); return ... }
            // So to test the else block (fallback logic with compareElements), we need selection.rangeCount === 0 BUT selection.anchorNode to be defined?
            // This happens in some browsers or edge cases where a range exists but isn't exposed in rangeCount properly or we mock it.
            
            // Let's mock the selection object returned by selection.get()
            const mockSel = {
                rangeCount: 0,
                anchorNode: textB,
                anchorOffset: 1,
                focusNode: textA,
                focusOffset: 0,
                isCollapsed: false,
                getRangeAt: jest.fn(),
                removeAllRanges: jest.fn(),
                addRange: jest.fn()
            };
            
            jest.spyOn(selection, 'get').mockReturnValue(mockSel);
            
            // Now call getRange. It should fall through to the else block
            // textB is AFTER textA.
            // compareElements(textB, textA) -> textB is after -> result should reflect B > A
            // If result > 1 (meaning A follows B? or B follows A?)
            // compareElements return: { result: 1 (a > b), -1 (a < b) } usually.
            // Wait, standard compareDocumentPosition:
            // Node.DOCUMENT_POSITION_FOLLOWING (4) -> a follows b
            // Node.DOCUMENT_POSITION_PRECEDING (2) -> a precedes b
            
            // dom.query.compareElements returns:
            // a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
            // (If b follows a, a comes before b -> -1)
            // (If a follows b, a comes after b -> 1)
            
            // In our case: anchor=TextB, focus=TextA.
            // compareElements(TextB, TextA). 
            // TextA precedes TextB. So TextB follows TextA.
            // TextB.compareDocumentPosition(TextA) & PRECEDING is true.
            // result should be 1 (TextB > TextA i.e. TextB comes after TextA).
            
            // Logic in selection.js:
            // const compareValue = dom.query.compareElements(sc, ec); // sc=B, ec=A
            // result should be 1.
            // const rightDir = compareValue.ancestor && (compareValue.result === 0 ? so <= eo : compareValue.result > 1 ? true : false);
            // Wait, compareElements in domQuery returns -1, 0, 1.
            // If sc is after ec, result is 1.
            // rightDir calculation:
            // if result === 1, result > 1 is false. Match fails. rightDir = false.
            // setRange(rightDir ? sc : ec, ...) -> rightDir false -> ec (TextA), eo (0), sc (TextB), so (1)
            // Range(Start: TextA 0, End: TextB 1). Correct order!
            
            const resultRange = selection.getRange();
            
            // It calls setRange which sets internal _range
            expect(resultRange.startContainer).toBe(textA);
            expect(resultRange.endContainer).toBe(textB);
        });
	});

	describe('setRange', () => {
		it('should set range with four parameters', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const range = selection.setRange(text, 0, text, 4);
			expect(range).toBeDefined();
			expect(range.startContainer).toBe(text);
			expect(range.endContainer).toBe(text);
		});

		it('should set range with Range object (lines 127-133)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const inputRange = document.createRange();
			inputRange.setStart(text, 0);
			inputRange.setEnd(text, 4);

			const range = selection.setRange(inputRange);
			expect(range).toBeDefined();
		});

		it('should return early if no startContainer or endContainer', () => {
			const range = selection.setRange(null, 0, null, 0);
			expect(range).toBeUndefined();
		});

		it('should handle text length overflow (lines 141-142)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const range = selection.setRange(text, 100, text, 100);
			expect(range).toBeDefined();
		});

		it('should handle line element as startContainer (lines 143-146)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const range = selection.setRange(p, 1, p, 1);
			expect(range).toBeDefined();
		});

		it('should handle line element as endContainer (lines 147-150)', () => {
			wysiwyg.innerHTML = '<p><span>one</span><span>two</span></p>';
			const p = wysiwyg.firstChild;
			const text = p.firstChild.firstChild;

			const range = selection.setRange(text, 0, p, 2);
			expect(range).toBeDefined();
		});

		it('should not call __focus if not iframe mode (line 163)', () => {
			const focusSpy = jest.spyOn(selection, '__focus');

			const origGet = editor.frameOptions.get;
			editor.frameOptions.get = jest.fn((key) => {
				if (key === 'iframe') return false;
				return origGet.call(editor.frameOptions, key);
			});

			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			expect(focusSpy).not.toHaveBeenCalled();

			editor.frameOptions.get = origGet;
		});

		it('should call __focus if iframe mode (line 176)', () => {
			const focusSpy = jest.spyOn(selection, '__focus');

			const origGet = editor.frameOptions.get;
			editor.frameOptions.get = jest.fn((key) => {
				if (key === 'iframe') return true;
				return origGet.call(editor.frameOptions, key);
			});

			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			expect(focusSpy).toHaveBeenCalled();

			editor.frameOptions.get = origGet;
		});

		it('should set eo to 1 when ec is empty element node with eo > 0 (line 159)', () => {
			// Exception rule: eo > 0 && textContent.length === 0 && nodeType === 1 → eo = 1
			wysiwyg.innerHTML = '<p>text<span><br></span></p>';
			const text = wysiwyg.firstChild.firstChild;
			const spanWithBr = wysiwyg.querySelector('span');

			// All 3 conditions met: eo=5 > 0, textContent='', nodeType=1
			const range = selection.setRange(text, 0, spanWithBr, 5);

			expect(range).toBeDefined();
			expect(range.endContainer).toBe(spanWithBr);
			expect(range.endOffset).toBe(1); // Always 1 when exception rule applies
		});

		it('should clamp eo to range [0, textContent.length] (line 159)', () => {
			// Default rule: min 0, max textContent.length
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild; // textContent.length = 4

			// Test negative → clamped to 0
			const range1 = selection.setRange(text, 0, text, -5);
			expect(range1).toBeDefined();
			expect(range1.endOffset).toBe(0);

			// Test overflow → clamped to textContent.length
			const range2 = selection.setRange(text, 0, text, 100);
			expect(range2).toBeDefined();
			expect(range2.endOffset).toBe(4);
		});

		it('should not apply exception rule when eo = 0 (line 159)', () => {
			// Exception rule requires eo > 0, so eo = 0 stays as 0
			wysiwyg.innerHTML = '<p>text<span><br></span></p>';
			const text = wysiwyg.firstChild.firstChild;
			const spanWithBr = wysiwyg.querySelector('span');

			const range = selection.setRange(text, 0, spanWithBr, 0);

			expect(range).toBeDefined();
			expect(range.endOffset).toBe(0); // Not 1, because eo > 0 condition fails
		});
	});

	describe('removeRange', () => {
		it('should remove range and reset state', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			selection.removeRange();

			expect(selection.status._range).toBeNull();
			expect(selection.selectionNode).toBeNull();
			expect(editor.effectNode).toBeNull();
		});
	});

	describe('getNearRange', () => {
		it('should return next sibling with offset 0 (lines 204-208)', () => {
			wysiwyg.innerHTML = '<p><span>one</span><span>two</span></p>';
			const span1 = wysiwyg.querySelector('span');
			const span2 = span1.nextSibling;

			const result = selection.getNearRange(span1);

			expect(result.container).toBe(span2);
			expect(result.offset).toBe(0);
		});

		it('should return prev sibling with offset 1 (lines 209-213)', () => {
			wysiwyg.innerHTML = '<p><span>one</span><span>two</span></p>';
			const p = wysiwyg.firstChild;
			const span2 = p.lastChild;

			const result = selection.getNearRange(span2);

			expect(result.offset).toBe(1);
		});

		it('should return null if no siblings', () => {
			wysiwyg.innerHTML = '<p><span>only</span></p>';
			const span = wysiwyg.querySelector('span');

			const result = selection.getNearRange(span);

			expect(result).toBeNull();
		});
	});

	describe('getRangeAndAddLine', () => {
		it('should return range if not _isNone', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			const range = document.createRange();
			range.setStart(text, 0);
			range.setEnd(text, 4);

			const result = selection.getRangeAndAddLine(range);

			expect(result).toBe(range);
		});

		it('should add line if range _isNone (lines 227-233)', () => {
			wysiwyg.innerHTML = '<figure><img src="test.jpg"></figure>';
			const figure = wysiwyg.firstChild;
			const range = document.createRange();
			range.setStart(figure, 0);
			range.setEnd(figure, 1);

			const childCountBefore = wysiwyg.children.length;
			const result = selection.getRangeAndAddLine(range, figure);

			expect(result).toBeDefined();
			expect(wysiwyg.children.length).toBe(childCountBefore + 1);
		});

		it('should add line when range targets wysiwyg root', () => {
			const range = document.createRange();
			range.setStart(wysiwyg, 0);
			range.setEnd(wysiwyg, 0);

			const childCountBefore = wysiwyg.children.length;

			const result = selection.getRangeAndAddLine(range);

			expect(result).toBe(selection.status._range);
			expect(wysiwyg.children.length).toBe(childCountBefore + 1);
		});
	});

	describe('getNode', () => {
		it('should return current selection node', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			const node = selection.getNode();

			expect(node).toBeDefined();
		});

		it('should reinitialize if selectionNode not in wysiwyg', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const outsideNode = document.createElement('div');
			selection.selectionNode = outsideNode;

			const node = selection.getNode();

			expect(wysiwyg.contains(node) || node === wysiwyg).toBe(true);
		});

		it('should handle getEdgeChild returning null (lines 245-251)', () => {
			wysiwyg.innerHTML = '';
			selection.selectionNode = null;

			const node = selection.getNode();

			expect(node).toBeDefined();
		});

		it('should use getEdgeChild to find selectionNode (lines 245-250)', () => {
			wysiwyg.innerHTML = '<div><p><span>deep</span></p></div>';
			selection.selectionNode = null;

			const node = selection.getNode();

			expect(node).toBeDefined();
		});
	});

	describe('getRects', () => {
		it('should get rects for range', () => {
			wysiwyg.innerHTML = '<p>test content</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			const result = selection.getRects(null, 'start');
			expect(result.rects).toBeDefined();
			expect(result.position).toBe('start');
		});

		it('should get rects for end position', () => {
			wysiwyg.innerHTML = '<p>test content here</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 10);

			const result = selection.getRects(null, 'end');
			expect(result.position).toBe('end');
		});

		it('should handle no rects with line format node (lines 274-283)', () => {
			wysiwyg.innerHTML = '<p><br></p>';
			const p = wysiwyg.firstChild;
			const br = p.firstChild;
			selection.setRange(br, 0, br, 0);

			const result = selection.getRects(null, 'start');
			expect(result).toBeDefined();
		});

		it('should handle text node target', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			const result = selection.getRects(text, 'start');
			expect(result).toBeDefined();
		});
	});

	describe('getDragEventLocationRange', () => {
		it('should get range from drag event using caretRangeFromPoint (lines 335-341)', () => {
			const mockEvent = {
				clientX: 10,
				clientY: 10,
			};

			const mockRange = {
				startContainer: wysiwyg.firstChild,
				startOffset: 0,
				endContainer: wysiwyg.firstChild,
				endOffset: 0,
			};

			const origFrameContext = selection.frameContext;
			selection.frameContext = {
				get: (key) => {
					if (key === '_wd')
						return {
							caretRangeFromPoint: jest.fn(() => mockRange),
						};
					return origFrameContext.get(key);
				},
			};

			const result = selection.getDragEventLocationRange(mockEvent);

			expect(result.sc).toBe(mockRange.startContainer);
			expect(result.ec).toBe(mockRange.endContainer);

			selection.frameContext = origFrameContext;
		});

		it('should get range using caretPositionFromPoint (lines 329-334)', () => {
			const mockEvent = {
				clientX: 10,
				clientY: 10,
			};

			const mockPosition = {
				offsetNode: wysiwyg.firstChild,
				offset: 0,
			};

			const origFrameContext = selection.frameContext;
			selection.frameContext = {
				get: (key) => {
					if (key === '_wd')
						return {
							caretPositionFromPoint: jest.fn(() => mockPosition),
						};
					return origFrameContext.get(key);
				},
			};

			const result = selection.getDragEventLocationRange(mockEvent);

			expect(result.sc).toBe(mockPosition.offsetNode);
			expect(result.so).toBe(mockPosition.offset);

			selection.frameContext = origFrameContext;
		});
	});

	describe('scrollTo', () => {
		it('should scroll to range', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			const range = document.createRange();
			range.setStart(text, 0);
			range.setEnd(text, 4);

			expect(() => selection.scrollTo(range, { behavior: 'auto' })).not.toThrow();
		});

		it('should handle Selection object (lines 358-359)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			const sel = selection.get();

			expect(() => selection.scrollTo(sel)).not.toThrow();
		});

		it('should handle Node object (lines 360-361)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			expect(() => selection.scrollTo(p)).not.toThrow();
		});

		it('should warn for invalid ref (lines 362-364)', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

			try {
				selection.scrollTo({});
			} catch (e) {
				// expected
			}

			expect(warnSpy).toHaveBeenCalled();

			warnSpy.mockRestore();
		});
	});

	describe('default range creation', () => {
		it('should provide range when element exists', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			selection.status._range = null;

			const range = selection.getRange();

			expect(range).toBeDefined();
			expect(range.startContainer).toBe(wysiwyg.firstChild.firstChild);
		});

		it('should create default line when editor empty (lines 500-503)', () => {
			wysiwyg.innerHTML = '';
			selection.status._range = null;

			const range = selection.getRange();

			expect(range).toBeDefined();
			expect(wysiwyg.firstElementChild).toBeTruthy();
		});

		it('should add child to existing empty element (lines 505-509)', () => {
			wysiwyg.innerHTML = '<p></p>';
			selection.status._range = null;

			const range = selection.getRange();

			expect(range).toBeDefined();
			expect(wysiwyg.firstElementChild.firstChild).toBeTruthy();
		});
	});

	describe('_init', () => {
		it('should initialize selection', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			selection.init();

			expect(selection.selectionNode).toBeDefined();
		});

		it('should handle input element as activeElement (lines 546-549)', () => {
			const input = document.createElement('input');
			input.type = 'text';
			wysiwyg.appendChild(input);
			input.focus();

			const result = selection.init();

			expect(result).toBe(input);
		});

		it('should handle no rangeCount (lines 556-560)', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const mockSel = {
				rangeCount: 0,
			};

			const origGet = selection.get;
			selection.get = jest.fn(() => mockSel);

			selection.init();

			expect(selection.selectionNode).toBeDefined();

			selection.get = origGet;
		});
	});

	describe('__focus', () => {
		it('should focus wysiwyg (lines 570-582)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			expect(() => {
				selection.__focus();
			}).not.toThrow();

			expect(selection.__iframeFocus).toBe(true);
		});

		it('should focus figcaption if present (lines 573-575)', () => {
			wysiwyg.innerHTML = '<figure><figcaption>caption</figcaption><img src="test.jpg"></figure>';
			const caption = wysiwyg.querySelector('figcaption');
			const text = caption.firstChild;
			selection.setRange(text, 0, text, 7);

			const focusSpy = jest.spyOn(caption, 'focus');

			selection.__focus();

			expect(focusSpy).toHaveBeenCalled();
		});
	});

	describe('resetRangeToTextNode', () => {
		it('should reset range to text node', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;
			selection.setRange(p, 0, p, 1);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should return false for invalid wysiwyg frame range (lines 592-594)', () => {
			wysiwyg.innerHTML = '<figure><img src="test.jpg"></figure>';
			const figure = wysiwyg.firstChild;
			const range = document.createRange();
			range.setStart(figure, 0);
			range.setEnd(figure, 1);
			selection.status._range = range;

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(false);
		});

		it('should handle setRange on wysiwyg with first/end children (lines 595-597)', () => {
			wysiwyg.innerHTML = '<p>one</p><p>two</p><p>three</p>';
			const range = document.createRange();
			range.setStart(wysiwyg, 1);
			range.setEnd(wysiwyg, 2);
			selection.status._range = range;

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle line format startContainer (lines 608-620)', () => {
			wysiwyg.innerHTML = '<p><span>test</span></p>';
			const p = wysiwyg.firstChild;
			selection.setRange(p, 0, p, 1);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle line format startContainer with no child at offset (lines 609-611)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;
			selection.setRange(p, 10, p, 10);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle line format startContainer with element descent (lines 616-619)', () => {
			wysiwyg.innerHTML = '<p><strong><em>test</em></strong></p>';
			const p = wysiwyg.firstChild;
			selection.setRange(p, 0, p, 1);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle line format endContainer (lines 621-628)', () => {
			wysiwyg.innerHTML = '<p><span>one</span><span>two</span></p>';
			const p = wysiwyg.firstChild;
			const text = p.firstChild.firstChild;
			selection.setRange(text, 0, p, 2);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle collapsed endContainer adjustment (line 626)', () => {
			wysiwyg.innerHTML = '<p><span>test</span></p>';
			const p = wysiwyg.firstChild;
			selection.setRange(p, 0, p, 0);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle break element in startContainer (lines 634-664)', () => {
			wysiwyg.innerHTML = '<p><br></p>';
			const p = wysiwyg.firstChild;
			const br = p.firstChild;
			selection.setRange(br, 0, br, 0);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle element with childNodes in startContainer (lines 636-651)', () => {
			wysiwyg.innerHTML = '<p><span><strong>deep</strong></span></p>';
			const span = wysiwyg.querySelector('span');
			selection.setRange(span, 0, span, 1);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle break element in endContainer (lines 675-701)', () => {
			wysiwyg.innerHTML = '<p>test<br></p>';
			const p = wysiwyg.firstChild;
			const text = p.firstChild;
			const br = p.lastChild;
			selection.setRange(text, 0, br, 0);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle endContainer with childNodes descent (lines 678-690)', () => {
			wysiwyg.innerHTML = '<p><span><strong>content</strong></span></p>';
			const p = wysiwyg.firstChild;
			const span = p.firstChild;
			const text = span.querySelector('strong').firstChild;
			selection.setRange(text, 0, span, 1);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle create format for table cell (line 687)', () => {
			wysiwyg.innerHTML = '<table><tr><td><br></td></tr></table>';
			const td = wysiwyg.querySelector('td');
			const br = td.firstChild;
			selection.setRange(br, 0, br, 0);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle endContainer break only and remove (lines 698-700)', () => {
			wysiwyg.innerHTML = '<p><span>text</span><br></p>';
			const p = wysiwyg.firstChild;
			const text = p.querySelector('span').firstChild;
			const br = p.lastChild;
			selection.setRange(text, 0, br, 0);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should create format line when needed (lines 645-651)', () => {
			wysiwyg.innerHTML = '<div><br></div>';
			const div = wysiwyg.firstChild;
			const br = div.firstChild;
			selection.setRange(br, 0, br, 0);

			editor.format.getLine = jest.fn(() => div);
			editor.format.getBlock = jest.fn(() => div);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
		});

		it('should handle startCon===endCon in onlyBreak (lines 659-662)', () => {
			wysiwyg.innerHTML = '<p><br></p>';
			const br = wysiwyg.querySelector('br');
			selection.setRange(br, 0, br, 0);

			const result = selection.resetRangeToTextNode();

			expect(result).toBe(true);
			expect(selection.getRange().startContainer).toBe(selection.getRange().endContainer);
		});
	});

	describe('setRange error recovery', () => {
		it('should return early when startContainer is null', () => {
			// setRange with null should return undefined and not throw
			const result = selection.setRange(null, 0, null, 0);
			expect(result).toBeUndefined();
		});

		it('should return early when endContainer is null', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			// setRange with null endContainer should return undefined
			const result = selection.setRange(text, 0, null, 0);
			expect(result).toBeUndefined();
		});

		it('should handle setRange with orphaned node gracefully', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			// Remove the node from DOM before setRange
			wysiwyg.innerHTML = '';

			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

			// Text node is now orphaned - this simulates DOM mutation during undo/redo
			// Should handle gracefully (not throw)
			expect(() => selection.setRange(text, 0, text, 4)).not.toThrow();

			warnSpy.mockRestore();
		});

		it('should clamp offset values to valid range', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			// Large offset should be clamped
			const range = selection.setRange(text, 0, text, 1000);

			expect(range).toBeDefined();
			expect(range.endOffset).toBeLessThanOrEqual(text.textContent.length);
		});
	});

	describe('selection restoration after DOM changes', () => {
		it('should handle selection when startContainer is removed', () => {
			wysiwyg.innerHTML = '<p>first</p><p>second</p>';
			const firstP = wysiwyg.firstChild;
			selection.setRange(firstP.firstChild, 0, firstP.firstChild, 5);

			// Simulate DOM mutation (like undo operation)
			wysiwyg.removeChild(firstP);

			// getRange should not throw, should return valid range or create new one
			expect(() => selection.getRange()).not.toThrow();
		});

		it('should handle getNode when selectionNode is removed from DOM', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			// Store current selectionNode
			selection.selectionNode = text;

			// Remove node
			wysiwyg.innerHTML = '<p>new content</p>';

			// getNode should reinitialize, not return stale node
			const node = selection.getNode();
			expect(wysiwyg.contains(node) || node === wysiwyg).toBe(true);
		});

		it('should create default range when wysiwyg becomes empty', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			selection.setRange(text, 0, text, 4);

			// Clear wysiwyg content
			wysiwyg.innerHTML = '';
			selection.status._range = null;

			// getRange should create a new default line and range
			const range = selection.getRange();
			expect(range).toBeDefined();
			expect(wysiwyg.firstElementChild).toBeTruthy();
		});
	});
});
