import { OnPaste_wysiwyg, OnCopy_wysiwyg, OnCut_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_clipboard';
import { createMockThis, createMockClipboardData } from '../../../../__mocks__/editorMock';

describe('handler_ww_clipboard', () => {
	let mockThis;
	let mockFrameContext;
	let mockEvent;

	beforeEach(() => {
		const mockWindow = {
			getSelection: jest.fn().mockReturnValue({
				toString: jest.fn().mockReturnValue('selected text')
			})
		};

		mockFrameContext = new Map([
			['_ww', mockWindow],
			['key', 'test-frame']
		]);

		mockEvent = {
			clipboardData: createMockClipboardData(),
			preventDefault: jest.fn(),
			stopPropagation: jest.fn()
		};

		mockThis = createMockThis();
	});

	describe('OnPaste_wysiwyg', () => {
		it('should handle paste with clipboardData', () => {
			const result = OnPaste_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._dataTransferAction).toHaveBeenCalledWith('paste', mockEvent, mockEvent.clipboardData, mockFrameContext);
			expect(result).toBeDefined();
		});

		it('should return true when clipboardData is not available', () => {
			mockEvent.clipboardData = null;

			const result = OnPaste_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(result).toBe(true);
			expect(mockThis._dataTransferAction).not.toHaveBeenCalled();
		});

		it('should return true when clipboardData is undefined', () => {
			mockEvent.clipboardData = undefined;

			const result = OnPaste_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(result).toBe(true);
			expect(mockThis._dataTransferAction).not.toHaveBeenCalled();
		});

		it('should handle paste with empty clipboardData', () => {
			mockEvent.clipboardData = {};

			const result = OnPaste_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._dataTransferAction).toHaveBeenCalledWith('paste', mockEvent, mockEvent.clipboardData, mockFrameContext);
		});
	});

	describe('OnCopy_wysiwyg', () => {
		it('should handle copy event successfully', async () => {
			mockThis.triggerEvent.mockResolvedValue(true);

			const result = await OnCopy_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onCopy', {
				frameContext: mockFrameContext,
				event: mockEvent,
				clipboardData: mockEvent.clipboardData
			});
			expect(mockThis.__secopy).toBe('selected text');
			expect(result).toBeUndefined();
		});

		it('should prevent default when user event returns false', async () => {
			mockThis.triggerEvent.mockResolvedValue(false);

			const result = await OnCopy_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should store selection text in __secopy', async () => {
			const selectedText = 'custom selected text';
			const mockWindow = {
				getSelection: jest.fn().mockReturnValue({
					toString: jest.fn().mockReturnValue(selectedText)
				})
			};
			mockFrameContext.set('_ww', mockWindow);

			await OnCopy_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.__secopy).toBe(selectedText);
		});

		it('should handle empty selection', async () => {
			const mockWindow = {
				getSelection: jest.fn().mockReturnValue({
					toString: jest.fn().mockReturnValue('')
				})
			};
			mockFrameContext.set('_ww', mockWindow);

			await OnCopy_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.__secopy).toBe('');
		});
	});

	describe('OnCut_wysiwyg', () => {
		it('should handle cut event successfully', async () => {
			mockThis.triggerEvent.mockResolvedValue(true);

			const result = await OnCut_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onCut', {
				frameContext: mockFrameContext,
				event: mockEvent,
				clipboardData: mockEvent.clipboardData
			});
			expect(mockThis.__secopy).toBe('selected text');
			expect(result).toBeUndefined();
		});

		it('should prevent default when user event returns false', async () => {
			mockThis.triggerEvent.mockResolvedValue(false);

			const result = await OnCut_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should store selection text in __secopy', async () => {
			const selectedText = 'cut selected text';
			const mockWindow = {
				getSelection: jest.fn().mockReturnValue({
					toString: jest.fn().mockReturnValue(selectedText)
				})
			};
			mockFrameContext.set('_ww', mockWindow);

			await OnCut_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.__secopy).toBe(selectedText);
		});

		it('should handle async triggerEvent rejection', async () => {
			mockThis.triggerEvent.mockRejectedValue(new Error('Trigger error'));

			await expect(OnCut_wysiwyg.call(mockThis, mockFrameContext, mockEvent)).rejects.toThrow('Trigger error');
		});
	});

	describe('clipboard integration', () => {
		it('should work with real ClipboardEvent structure', async () => {
			const clipboardEvent = {
				clipboardData: createMockClipboardData({
					getData: jest.fn().mockReturnValue('clipboard text'),
					types: ['text/plain', 'text/html']
				}),
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
				type: 'copy'
			};

			const result = await OnCopy_wysiwyg.call(mockThis, mockFrameContext, clipboardEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onCopy', {
				frameContext: mockFrameContext,
				event: clipboardEvent,
				clipboardData: clipboardEvent.clipboardData
			});
		});

		it('should handle multiple clipboard data types', async () => {
			mockEvent.clipboardData.types = ['text/plain', 'text/html', 'application/json'];
			mockEvent.clipboardData.getData = jest.fn().mockReturnValueOnce('plain text').mockReturnValueOnce('<p>html text</p>').mockReturnValueOnce('{"json": "data"}');

			await OnCopy_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should handle triggerEvent throwing synchronous error in copy', async () => {
			mockThis.triggerEvent.mockImplementation(() => {
				throw new Error('Sync error');
			});

			await expect(OnCopy_wysiwyg.call(mockThis, mockFrameContext, mockEvent)).rejects.toThrow('Sync error');
		});

		it('should handle triggerEvent throwing synchronous error in cut', async () => {
			mockThis.triggerEvent.mockImplementation(() => {
				throw new Error('Sync error');
			});

			await expect(OnCut_wysiwyg.call(mockThis, mockFrameContext, mockEvent)).rejects.toThrow('Sync error');
		});

		it('should handle frameContext without _ww', async () => {
			const emptyFrameContext = new Map();

			await expect(OnCopy_wysiwyg.call(mockThis, emptyFrameContext, mockEvent)).rejects.toThrow();
		});
	});
});
