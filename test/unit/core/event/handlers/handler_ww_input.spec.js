/**
 * @fileoverview Unit tests for handler_ww_input.js
 */

import { OnBeforeInput_wysiwyg, OnInput_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_input';

describe('handler_ww_input', () => {
	let mockThis;
	let mockFc;
	let mockEvent;

	beforeEach(() => {
		mockFc = new Map([
			['isReadOnly', false],
			['isDisabled', false],
			['wysiwyg', document.createElement('div')]
		]);

		mockEvent = {
			data: 'a',
			isComposing: false,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn()
		};

		mockThis = {
			_handledInBefore: false,
			$: {
				char: {
					test: jest.fn().mockReturnValue(true)
				},
				eventManager: {
					triggerEvent: jest.fn().mockResolvedValue(undefined)
				},
				selection: {
					getRange: jest.fn().mockReturnValue({ collapsed: true, startContainer: document.createElement('p'), endContainer: document.createElement('p') }),
					getNode: jest.fn().mockReturnValue(document.createElement('p')),
					init: jest.fn()
				},
				format: {
					getLine: jest.fn().mockReturnValue(document.createElement('p')),
					getBlock: jest.fn().mockReturnValue(null),
					isNormalLine: jest.fn().mockReturnValue(true),
					isBrLine: jest.fn().mockReturnValue(false),
					isBlock: jest.fn().mockReturnValue(false)
				},
				component: {
					is: jest.fn().mockReturnValue(false)
				},
				options: {
					get: jest.fn().mockReturnValue('P')
				},
				history: {
					push: jest.fn()
				}
			},
			_callPluginEventAsync: jest.fn().mockResolvedValue(undefined),
			_setDefaultLine: jest.fn()
		};
	});

	describe('OnBeforeInput_wysiwyg', () => {
		it('should prevent input in read-only mode', async () => {
			mockFc.set('isReadOnly', true);

			const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should prevent input in disabled mode', async () => {
			mockFc.set('isDisabled', true);

			const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should validate characters via char.test when not composing', async () => {
			mockThis.$.char.test.mockReturnValue(true);

			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.char.test).toHaveBeenCalledWith('a', false);
			expect(mockThis._handledInBefore).toBe(true);
		});

		it('should prevent input when char.test fails', async () => {
			mockThis.$.char.test.mockReturnValue(false);

			const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should skip char.test during composition', async () => {
			mockEvent.isComposing = true;

			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.char.test).not.toHaveBeenCalled();
			expect(mockThis._handledInBefore).toBe(false);
		});

		it('should handle null event data as empty string', async () => {
			mockEvent.data = null;

			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.char.test).toHaveBeenCalledWith('', false);
		});

		it('should handle undefined event data as space', async () => {
			mockEvent.data = undefined;

			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.char.test).toHaveBeenCalledWith(' ', false);
		});

		it('should trigger user event onBeforeInput', async () => {
			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onBeforeInput', {
				frameContext: mockFc,
				event: mockEvent,
				data: 'a'
			});
		});

		it('should stop if user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);

			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis._callPluginEventAsync).not.toHaveBeenCalled();
		});

		it('should trigger plugin event after user event', async () => {
			await OnBeforeInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis._callPluginEventAsync).toHaveBeenCalledWith('onBeforeInput', {
				frameContext: mockFc,
				event: mockEvent,
				data: 'a'
			});
		});
	});

	describe('OnInput_wysiwyg', () => {
		it('should prevent input in read-only mode', async () => {
			mockFc.set('isReadOnly', true);

			const result = await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should prevent input in disabled mode', async () => {
			mockFc.set('isDisabled', true);

			const result = await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should call selection.init', async () => {
			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.selection.init).toHaveBeenCalled();
		});

		it('should run char.test when _handledInBefore is false', async () => {
			mockThis._handledInBefore = false;

			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.char.test).toHaveBeenCalledWith('a', true);
		});

		it('should skip char.test when _handledInBefore is true', async () => {
			mockThis._handledInBefore = true;

			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.char.test).not.toHaveBeenCalled();
		});

		it('should prevent input when char.test fails in OnInput', async () => {
			mockThis._handledInBefore = false;
			mockThis.$.char.test.mockReturnValue(false);

			const result = await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should reset _handledInBefore to false', async () => {
			mockThis._handledInBefore = true;

			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis._handledInBefore).toBe(false);
		});

		it('should push history after valid input', async () => {
			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.history.push).toHaveBeenCalledWith(true);
		});

		it('should call _setDefaultLine when format is not normal or br', async () => {
			mockThis.$.format.isNormalLine.mockReturnValue(false);
			mockThis.$.format.isBrLine.mockReturnValue(false);

			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis._setDefaultLine).toHaveBeenCalled();
		});

		it('should not call _setDefaultLine when format is normal line', async () => {
			mockThis.$.format.isNormalLine.mockReturnValue(true);

			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis._setDefaultLine).not.toHaveBeenCalled();
		});

		it('should trigger user event onInput', async () => {
			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onInput', {
				frameContext: mockFc,
				event: mockEvent,
				data: 'a'
			});
		});

		it('should not push history if user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);

			await OnInput_wysiwyg.call(mockThis, mockFc, mockEvent);

			expect(mockThis.$.history.push).not.toHaveBeenCalled();
		});
	});
});
