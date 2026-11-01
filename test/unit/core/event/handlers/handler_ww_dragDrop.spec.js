/**
 * @fileoverview Unit tests for handler_ww_dragDrop.js
 */

import { OnDragOver_wysiwyg, OnDragEnd_wysiwyg, OnDrop_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_dragDrop';

// _DragHandle is a real Map - mock the module/ui barrel export
jest.mock('../../../../../src/modules/ui', () => {
	const map = new Map([
		['__figureInst', null],
		['__dragInst', null],
		['__dragHandler', null],
		['__dragContainer', null],
		['__dragCover', null],
		['__dragMove', null],
		['__overInfo', null],
	]);
	return { _DragHandle: map };
});

// JSDOM Range doesn't have getBoundingClientRect - polyfill
if (!Range.prototype.getBoundingClientRect) {
	Range.prototype.getBoundingClientRect = function () {
		return { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
	};
}

describe('handler_ww_dragDrop', () => {
	let mockThis;
	let mockFc;
	let mockDragCursor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockDragCursor = document.createElement('div');
		mockDragCursor.style.display = 'none';

		const mockWysiwyg = document.createElement('div');
		mockWysiwyg.innerHTML = '<p>Hello World</p>';

		const mockWysiwygFrame = document.createElement('div');
		mockWysiwygFrame.appendChild(mockWysiwyg);

		mockFc = new Map([
			['wysiwyg', mockWysiwyg],
			['wysiwygFrame', mockWysiwygFrame],
			['isReadOnly', false],
			['_wd', document],
		]);

		mockThis = {
			$: {
				selection: {
					getDragEventLocationRange: jest.fn().mockReturnValue({
						sc: mockWysiwyg.querySelector('p').firstChild,
						so: 0,
						ec: mockWysiwyg.querySelector('p').firstChild,
						eo: 5,
					}),
					setRange: jest.fn(),
					getRange: jest.fn().mockReturnValue(document.createRange()),
				},
				format: {
					isLine: jest.fn((el) => /^(P|DIV|LI|TD|TH|H[1-6]|PRE)$/i.test(el?.nodeName)),
					isBlock: jest.fn((el) => /^(BLOCKQUOTE|OL|UL|TABLE|THEAD|TBODY|TR)$/i.test(el?.nodeName)),
					getLine: jest.fn((node) => node?.closest?.('p, div:not(.se-component), li, td, th') || null),
				},
				offset: {
					getGlobal: jest.fn().mockReturnValue({ top: 0, left: 0 }),
				},
				context: {
					get: jest.fn().mockReturnValue(document.createElement('div')),
				},
				html: {
					remove: jest.fn(),
					insertNode: jest.fn(),
				},
				component: {
					deselect: jest.fn(),
					is: jest.fn((el) => !!el.classList?.contains('se-component')),
				},
			},
			_dataTransferAction: jest.fn(),
		};
	});

	describe('OnDragEnd_wysiwyg', () => {
		it('should hide drag cursor', () => {
			mockDragCursor.style.display = 'block';
			OnDragEnd_wysiwyg.call(mockThis, mockDragCursor);
			expect(mockDragCursor.style.display).toBe('none');
		});
	});

	describe('OnDragOver_wysiwyg', () => {
		it('should call preventDefault on drag over', () => {
			const mockEvent = {
				preventDefault: jest.fn(),
			};

			OnDragOver_wysiwyg.call(mockThis, mockFc, mockDragCursor, null, null, mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should return early if no selection container', () => {
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({
				sc: null, so: 0, ec: null, eo: 0,
			});

			const mockEvent = { preventDefault: jest.fn() };
			OnDragOver_wysiwyg.call(mockThis, mockFc, mockDragCursor, null, null, mockEvent);
			expect(mockEvent.preventDefault).not.toHaveBeenCalled();
		});

		it('should hide cursor when rect height is 0', () => {
			// getBoundingClientRect returns {0,0} in JSDOM, so height=0
			const mockEvent = { preventDefault: jest.fn() };
			OnDragOver_wysiwyg.call(mockThis, mockFc, mockDragCursor, null, null, mockEvent);
			expect(mockDragCursor.style.display).toBe('none');
		});
	});

	describe('OnDrop_wysiwyg', () => {
		it('should prevent drop in read-only mode', () => {
			mockFc.set('isReadOnly', true);
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
				dataTransfer: { types: [], files: [] },
			};

			const result = OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should hide drag cursor after drop', () => {
			mockDragCursor.style.display = 'block';
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [], getData: jest.fn() },
				target: document.createElement('div'),
			};

			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(mockDragCursor.style.display).toBe('none');
		});

		it('should return true when no dataTransfer', () => {
			const mockEvent = {
				preventDefault: jest.fn(),
				target: document.createElement('div'),
			};
			delete mockEvent.dataTransfer;

			const result = OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(result).toBe(true);
		});

		it('should return early when no selection container', () => {
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({
				sc: null, so: 0, ec: null, eo: 0,
			});

			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [] },
				target: document.createElement('div'),
			};

			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(mockThis.$.html.remove).not.toHaveBeenCalled();
		});

		it('should call _dataTransferAction for normal drop', () => {
			const mockDataTransfer = { types: ['text/plain'], files: [], getData: jest.fn() };
			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: mockDataTransfer,
				target: document.createElement('div'),
			};

			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(mockThis.$.html.remove).toHaveBeenCalled();
			expect(mockThis.$.selection.setRange).toHaveBeenCalled();
			expect(mockThis._dataTransferAction).toHaveBeenCalledWith('drop', mockEvent, mockDataTransfer, mockFc);
		});

		it('should treat dropping the dragged selection onto itself as a no-op', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild;
			const dragged = document.createRange();
			dragged.setStart(text, 0);
			dragged.setEnd(text, 5);
			mockThis._dragFromWysiwyg = true;
			mockThis.$.selection.getRange.mockReturnValue(dragged);
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({ sc: text, so: 2, ec: text, eo: 2 });
			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [], getData: jest.fn() },
				target: document.createElement('div'),
			};

			const result = OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);

			expect(result).toBe(false);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockThis.$.html.remove).not.toHaveBeenCalled();
			expect(mockThis._dataTransferAction).not.toHaveBeenCalled();
		});

		/**
		 * Drags `[sc, so]..[ec, eo]` from inside the editor and drops it at `[dc, doff]`; `remove` stands in for
		 * `html.remove()` and makes the DOM edits it makes for that selection. Its return value is not used by the drop.
		 */
		function moveDrop([sc, so, ec, eo], [dc, doff], remove) {
			const dragged = document.createRange();
			dragged.setStart(sc, so);
			dragged.setEnd(ec, eo);
			mockThis._dragFromWysiwyg = true;
			mockThis.$.selection.getRange.mockReturnValue(dragged);
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({ sc: dc, so: doff, ec: dc, eo: doff });
			mockThis.$.html.remove.mockImplementation(() => {
				remove();
				return { container: mockFc.get('wysiwyg'), offset: 99 };
			});
			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [], getData: jest.fn() },
				target: document.createElement('div'),
			};
			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			return mockEvent;
		}

		it('should keep a drop point after the selection in the text node the removal rewrote', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild; // "Hello World"

			const mockEvent = moveDrop([text, 0, text, 5], [text, 8], () => {
				text.textContent = text.textContent.slice(5); // "Hello" removed
			});

			expect(text.textContent).toBe(' World');
			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(text, 3, text, 3); // " Wo|rld"
			expect(mockThis._dataTransferAction).toHaveBeenCalledWith('drop', mockEvent, mockEvent.dataTransfer, mockFc);
		});

		it('should keep a drop point at the end of the text node the removal rewrote', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild; // "Hello World"

			moveDrop([text, 0, text, 5], [text, 11], () => {
				text.textContent = text.textContent.slice(5);
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(text, 6, text, 6);
		});

		it('should keep a drop point placed before the dragged selection', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild; // "Hello World"

			moveDrop([text, 6, text, 11], [text, 2], () => {
				text.textContent = text.textContent.slice(0, 6); // "World" removed
			});

			expect(text.textContent).toBe('Hello ');
			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(text, 2, text, 2);
		});

		it('should keep a drop point in the end text node of a selection that spans two nodes', () => {
			const p = mockFc.get('wysiwyg').querySelector('p');
			p.innerHTML = 'ab<strong>cdef</strong>';
			const [ab, strong] = p.childNodes;
			const cdef = strong.firstChild;

			// "b" + "cd" dragged, dropped at "cde|f"
			moveDrop([ab, 1, cdef, 2], [cdef, 3], () => {
				ab.textContent = 'a';
				cdef.textContent = 'ef';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(cdef, 1, cdef, 1); // "e|f"
		});

		it('should keep the drop point on the near side of an inline component', () => {
			const p = mockFc.get('wysiwyg').querySelector('p');
			p.innerHTML = 'abc<span class="se-component se-inline-component" contenteditable="false">X</span>def';
			const [abc] = p.childNodes;

			moveDrop([abc, 0, abc, 1], [abc, 3], () => {
				abc.textContent = 'bc';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(abc, 2, abc, 2);
		});

		it('should follow a drop point whose wrapper the removal took out to where it was, as a text position', () => {
			const p = mockFc.get('wysiwyg').querySelector('p');
			p.innerHTML = 'ab<i>cd</i>ef';
			const [ab, i, ef] = p.childNodes;

			// "cd" + "e" dragged from the start of <i>, dropped at (<i>, 0), the left edge just before the selection;
			// the removal takes out the emptied <i>
			moveDrop([i.firstChild, 0, ef, 1], [i, 0], () => {
				i.remove();
				ef.textContent = 'f';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(ab, 2, ab, 2);
		});

		it('should shift an element drop point by the children the removal took out before it', () => {
			const p = mockFc.get('wysiwyg').querySelector('p');
			p.innerHTML = 'ab<b>cd</b>ef<i>gh</i>';
			const [ab, b, ef] = p.childNodes;

			// drop at (p, 3), between "ef" and <i>, after the selection "cd"
			moveDrop([b.firstChild, 0, b.firstChild, 2], [p, 3], () => {
				b.remove();
			});

			expect(ab.textContent).toBe('ab');
			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(ef, 2, ef, 2);
		});

		it.each([
			['a component', '<span class="se-component se-inline-component"><span>X</span></span>'],
			['a non-editable element', '<span contenteditable="false"><span>X</span></span>'],
		])('should not enter %s when turning an element drop point into a text position', (_, inner) => {
			const p = mockFc.get('wysiwyg').querySelector('p');
			p.innerHTML = `ab${inner}cd`;
			const [ab, , cd] = p.childNodes;

			// drop at (p, 2), right after the element
			moveDrop([ab, 0, ab, 1], [p, 2], () => {
				ab.textContent = 'b';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(cd, 0, cd, 0);
		});

		it('should read an element drop point between two blocks as the start of the next one', () => {
			const wysiwyg = mockFc.get('wysiwyg');
			wysiwyg.innerHTML = '<p>abc</p><ul><li>x</li></ul><p>def</p>';
			const abc = wysiwyg.firstChild.firstChild;
			const def = wysiwyg.lastChild.firstChild;

			// drop at (wysiwyg, 2), between the list and the last paragraph
			moveDrop([abc, 0, abc, 1], [wysiwyg, 2], () => {
				abc.textContent = 'bc';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(def, 0, def, 0);
		});

		it('should read an element drop point at the end of a container of blocks as the end of the last one', () => {
			const wysiwyg = mockFc.get('wysiwyg');
			wysiwyg.innerHTML = '<p>abc</p><blockquote><p>q</p></blockquote>';
			const abc = wysiwyg.firstChild.firstChild;
			const q = wysiwyg.querySelector('blockquote p').firstChild;

			moveDrop([abc, 0, abc, 1], [wysiwyg, 2], () => {
				abc.textContent = 'bc';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(q, 1, q, 1);
		});

		it('should keep an element drop point after a trailing inline component at the line end', () => {
			const p = mockFc.get('wysiwyg').querySelector('p');
			p.innerHTML = 'abc<span class="se-component se-inline-component" contenteditable="false">X</span>';
			const [abc] = p.childNodes;

			moveDrop([abc, 0, abc, 1], [p, 2], () => {
				abc.textContent = 'bc';
			});

			expect(mockThis.$.selection.setRange).toHaveBeenCalledWith(p, 2, p, 2);
		});

		it('should not treat an external drop inside the selection as a self-drop', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild;
			const dragged = document.createRange();
			dragged.setStart(text, 0);
			dragged.setEnd(text, 5);
			mockThis._dragFromWysiwyg = false;
			mockThis.$.selection.getRange.mockReturnValue(dragged);
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({ sc: text, so: 2, ec: text, eo: 2 });
			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [], getData: jest.fn() },
				target: document.createElement('div'),
			};

			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);

			expect(mockThis.$.html.remove).toHaveBeenCalled();
			expect(mockThis._dataTransferAction).toHaveBeenCalled();
		});

		it('should clear the drag-from-editor flag after a drop, so a lost dragend cannot leave it set', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild;
			const dragged = document.createRange();
			dragged.setStart(text, 0);
			dragged.setEnd(text, 5);
			mockThis._dragFromWysiwyg = true;
			mockThis.$.selection.getRange.mockReturnValue(dragged);
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({ sc: text, so: 11, ec: text, eo: 11 });
			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [], getData: jest.fn() },
				target: document.createElement('div'),
			};

			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(mockThis._dragFromWysiwyg).toBe(false);

			// a later external drop inside a selection is inserted, not swallowed as a self-drop
			mockThis.$.html.remove.mockClear();
			mockThis._dataTransferAction.mockClear();
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({ sc: text, so: 2, ec: text, eo: 2 });
			OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			expect(mockThis.$.html.remove).toHaveBeenCalled();
			expect(mockThis._dataTransferAction).toHaveBeenCalled();
		});

		it('should clear the drag-from-editor flag on a self-drop no-op', () => {
			const text = mockFc.get('wysiwyg').querySelector('p').firstChild;
			const dragged = document.createRange();
			dragged.setStart(text, 0);
			dragged.setEnd(text, 5);
			mockThis._dragFromWysiwyg = true;
			mockThis.$.selection.getRange.mockReturnValue(dragged);
			mockThis.$.selection.getDragEventLocationRange.mockReturnValue({ sc: text, so: 2, ec: text, eo: 2 });
			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: ['text/plain'], files: [], getData: jest.fn() },
				target: document.createElement('div'),
			};

			expect(OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent)).toBe(false);
			expect(mockThis._dragFromWysiwyg).toBe(false);
		});

		it('should hide drag cursor even on error', () => {
			mockDragCursor.style.display = 'block';
			mockThis.$.selection.getDragEventLocationRange.mockImplementation(() => {
				throw new Error('test error');
			});

			const mockEvent = {
				preventDefault: jest.fn(),
				dataTransfer: { types: [] },
				target: document.createElement('div'),
			};

			expect(() => {
				OnDrop_wysiwyg.call(mockThis, mockFc, mockDragCursor, mockEvent);
			}).toThrow();
			expect(mockDragCursor.style.display).toBe('none');
		});
	});
});
