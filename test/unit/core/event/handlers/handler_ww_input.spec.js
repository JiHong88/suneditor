/**
 * @fileoverview Unit tests for input handler
 */

import { OnBeforeInput_wysiwyg, OnInput_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_input';
import { keyCodeMap } from '../../../../../src/helper';

describe('Input Handler', () => {
	let mockThis;
	let mockFrameContext;
	let mockEvent;

	beforeEach(() => {
		// Mock 'this' context
		mockThis = {
			char: {
				test: jest.fn(() => true)
			},
			triggerEvent: jest.fn(async () => true),
			_callPluginEventAsync: jest.fn(async () => true),
			_callPluginEvent: jest.fn(() => true),
			_handledInBefore: false,
			selection: {
				getRange: jest.fn(() => ({
					collapsed: true
				})),
				getNode: jest.fn(() => document.createTextNode('text')),
				_init: jest.fn()
			},
			format: {
				getLine: jest.fn(() => document.createElement('p')),
				isNormalLine: jest.fn(() => true),
				isBrLine: jest.fn(() => false),
				getBlock: jest.fn(() => null),
				isBlock: jest.fn(() => false)
			},
			component: {
				is: jest.fn(() => false)
			},
			_setDefaultLine: jest.fn(),
			options: new Map([
				['defaultLine', 'P']
			]),
			history: {
				push: jest.fn()
			}
		};

		// Mock frame context
		mockFrameContext = new Map([
			['isReadOnly', false],
			['isDisabled', false]
		]);

		// Mock input event
		mockEvent = {
			data: 'a',
			preventDefault: jest.fn(),
			stopPropagation: jest.fn()
		};
	});

	describe('OnBeforeInput_wysiwyg', () => {
		describe('ReadOnly/Disabled checks', () => {
			it('should prevent event if readonly', async () => {
				mockFrameContext.set('isReadOnly', true);

				const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(result).toBe(false);
			});

			it('should prevent event if disabled', async () => {
				mockFrameContext.set('isDisabled', true);

				const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(result).toBe(false);
			});
		});

		describe('Data handling', () => {
			it('should handle null data as empty string', async () => {
				mockEvent.data = null;
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).toHaveBeenCalledWith('', false);
			});

			it('should handle undefined data as space', async () => {
				mockEvent.data = undefined;
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).toHaveBeenCalledWith(' ', false);
			});

			it('should handle empty string data', async () => {
				mockEvent.data = '';
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).toHaveBeenCalledWith('', false);
			});
		});

		describe('Composing state', () => {
			it('should set _handledInBefore to true when not composing', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._handledInBefore).toBe(true);
			});

			it('should set _handledInBefore to false when composing', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(true);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._handledInBefore).toBe(false);
			});

			it('should not test char when composing', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(true);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).not.toHaveBeenCalled();
			});
		});

		describe('Character validation', () => {
			it('should prevent event if char test fails', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);
				mockThis.char.test.mockReturnValue(false);

				const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(result).toBe(false);
			});

			it('should continue if char test passes', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);
				mockThis.char.test.mockReturnValue(true);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.triggerEvent).toHaveBeenCalled();
			});
		});

		describe('Event triggering', () => {
			it('should trigger onBeforeInput user event', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.triggerEvent).toHaveBeenCalledWith('onBeforeInput', {
					frameContext: mockFrameContext,
					event: mockEvent,
					data: 'a'
				});
			});

			it('should return early if user event returns false', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);
				mockThis.triggerEvent.mockResolvedValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
			});

			it('should call plugin event', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

				await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._callPluginEventAsync).toHaveBeenCalledWith('onBeforeInput', {
					frameContext: mockFrameContext,
					event: mockEvent,
					data: 'a'
				});
			});

			it('should return early if plugin event returns false', async () => {
				jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);
				mockThis._callPluginEventAsync.mockResolvedValue(false);

				const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(result).toBeUndefined();
			});
		});
	});

	describe('OnInput_wysiwyg', () => {
		describe('ReadOnly/Disabled checks', () => {
			it('should prevent event if readonly', async () => {
				mockFrameContext.set('isReadOnly', true);

				const result = await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(result).toBe(false);
			});

			it('should prevent event if disabled', async () => {
				mockFrameContext.set('isDisabled', true);

				const result = await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(result).toBe(false);
			});
		});

		describe('Format checking', () => {
			it('should call _setDefaultLine for non-normal/non-br lines', async () => {
				mockThis.format.isNormalLine.mockReturnValue(false);
				mockThis.format.isBrLine.mockReturnValue(false);

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._setDefaultLine).toHaveBeenCalled();
			});

			it('should not call _setDefaultLine for normal lines', async () => {
				mockThis.format.isNormalLine.mockReturnValue(true);

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._setDefaultLine).not.toHaveBeenCalled();
			});

			it('should not call _setDefaultLine for br lines', async () => {
				mockThis.format.isNormalLine.mockReturnValue(false);
				mockThis.format.isBrLine.mockReturnValue(true);

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._setDefaultLine).not.toHaveBeenCalled();
			});

			it('should set DIV as default when rangeEl is block', async () => {
				mockThis.format.isNormalLine.mockReturnValue(false);
				mockThis.format.isBrLine.mockReturnValue(false);
				mockThis.format.getBlock.mockReturnValue(document.createElement('div'));
				mockThis.format.isBlock.mockReturnValue(true);

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._setDefaultLine).toHaveBeenCalledWith('DIV');
			});
		});

		describe('Selection initialization', () => {
			it('should call selection._init', async () => {
				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.selection._init).toHaveBeenCalled();
			});
		});

		describe('Character validation', () => {
			it('should test char when not handled in before', async () => {
				mockThis._handledInBefore = false;

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).toHaveBeenCalledWith('a', true);
			});

			it('should not test char when handled in before', async () => {
				mockThis._handledInBefore = true;

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).not.toHaveBeenCalled();
			});

			it('should prevent event if char test fails', async () => {
				mockThis._handledInBefore = false;
				mockThis.char.test.mockReturnValue(false);

				const result = await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(result).toBe(false);
			});

			it('should reset _handledInBefore to false', async () => {
				mockThis._handledInBefore = true;

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._handledInBefore).toBe(false);
			});
		});

		describe('Event triggering', () => {
			it('should trigger onInput user event', async () => {
				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.triggerEvent).toHaveBeenCalledWith('onInput', {
					frameContext: mockFrameContext,
					event: mockEvent,
					data: 'a'
				});
			});

			it('should return early if user event returns false', async () => {
				mockThis.triggerEvent.mockResolvedValue(false);

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._callPluginEventAsync).not.toHaveBeenCalled();
			});

			it('should call plugin event', async () => {
				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis._callPluginEventAsync).toHaveBeenCalledWith('onInput', {
					frameContext: mockFrameContext,
					event: mockEvent,
					data: 'a'
				});
			});
		});

		describe('History', () => {
			it('should push history with true', async () => {
				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.history.push).toHaveBeenCalledWith(true);
			});
		});

		describe('Data handling', () => {
			it('should handle null data as empty string', async () => {
				mockEvent.data = null;
				mockThis._handledInBefore = false;

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).toHaveBeenCalledWith('', true);
			});

			it('should handle undefined data as space', async () => {
				mockEvent.data = undefined;
				mockThis._handledInBefore = false;

				await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

				expect(mockThis.char.test).toHaveBeenCalledWith(' ', true);
			});
		});
	});

	describe('Integration tests', () => {
		it('should handle beforeInput followed by input', async () => {
			jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(false);

			// BeforeInput
			await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);
			expect(mockThis._handledInBefore).toBe(true);

			// Input
			await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);
			expect(mockThis.char.test).not.toHaveBeenCalledWith('a', true); // Should not test again
			expect(mockThis.history.push).toHaveBeenCalled();
		});

		it('should handle composing input workflow', async () => {
			jest.spyOn(keyCodeMap, 'isComposing').mockReturnValue(true);

			// BeforeInput (composing)
			await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);
			expect(mockThis._handledInBefore).toBe(false);

			// Input (not handled in before, so test char)
			await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);
			expect(mockThis.char.test).toHaveBeenCalledWith('a', true);
		});
	});
});
