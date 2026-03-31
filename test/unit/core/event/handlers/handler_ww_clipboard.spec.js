/**
 * @fileoverview Unit tests for handler_ww_clipboard.js
 */

import { OnPaste_wysiwyg, OnCopy_wysiwyg, OnCut_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_clipboard';

describe('handler_ww_clipboard', () => {
	let mockThis;
	let mockFc;

	beforeEach(() => {
		jest.useFakeTimers();

		mockFc = new Map([
			['isReadOnly', false],
			['_ww', {
				getSelection: jest.fn().mockReturnValue({
					toString: () => 'selected text'
				})
			}]
		]);

		mockThis = {
			__secopy: '',
			$: {
				eventManager: {
					triggerEvent: jest.fn().mockResolvedValue(undefined)
				},
				history: {
					push: jest.fn()
				}
			},
			_dataTransferAction: jest.fn().mockReturnValue(true)
		};
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('OnPaste_wysiwyg', () => {
		it('should delegate to _dataTransferAction with clipboardData', () => {
			const clipboardData = { types: ['text/plain'], getData: jest.fn() };
			const event = { clipboardData };

			OnPaste_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._dataTransferAction).toHaveBeenCalledWith('paste', event, clipboardData, mockFc);
		});

		it('should return true when clipboardData is null', () => {
			const event = { clipboardData: null };

			const result = OnPaste_wysiwyg.call(mockThis, mockFc, event);

			expect(result).toBe(true);
			expect(mockThis._dataTransferAction).not.toHaveBeenCalled();
		});

		it('should return true when clipboardData is undefined', () => {
			const event = {};

			const result = OnPaste_wysiwyg.call(mockThis, mockFc, event);

			expect(result).toBe(true);
			expect(mockThis._dataTransferAction).not.toHaveBeenCalled();
		});
	});

	describe('OnCopy_wysiwyg', () => {
		it('should store selected text in __secopy', async () => {
			const event = {
				clipboardData: { types: ['text/plain'] },
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnCopy_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.__secopy).toBe('selected text');
		});

		it('should trigger onCopy user event', async () => {
			const clipboardData = { types: ['text/plain'] };
			const event = { clipboardData, preventDefault: jest.fn(), stopPropagation: jest.fn() };

			await OnCopy_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onCopy', {
				frameContext: mockFc,
				event,
				clipboardData
			});
		});

		it('should prevent default when user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);
			const event = {
				clipboardData: { types: [] },
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const result = await OnCopy_wysiwyg.call(mockThis, mockFc, event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(event.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should not store text when user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);
			const event = {
				clipboardData: {},
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnCopy_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.__secopy).toBe('');
		});
	});

	describe('OnCut_wysiwyg', () => {
		it('should store selected text in __secopy', async () => {
			const event = {
				clipboardData: { types: [] },
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnCut_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.__secopy).toBe('selected text');
		});

		it('should defer history push via setTimeout', async () => {
			const event = {
				clipboardData: { types: [] },
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnCut_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.history.push).not.toHaveBeenCalled();

			jest.advanceTimersByTime(0);

			expect(mockThis.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should trigger onCut user event', async () => {
			const clipboardData = { types: [] };
			const event = { clipboardData, preventDefault: jest.fn(), stopPropagation: jest.fn() };

			await OnCut_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onCut', {
				frameContext: mockFc,
				event,
				clipboardData
			});
		});

		it('should prevent default and stop when user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);
			const event = {
				clipboardData: {},
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const result = await OnCut_wysiwyg.call(mockThis, mockFc, event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(event.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
			expect(mockThis.$.history.push).not.toHaveBeenCalled();
		});
	});
});
