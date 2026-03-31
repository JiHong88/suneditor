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
