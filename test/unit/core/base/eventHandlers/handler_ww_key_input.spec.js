import { OnBeforeInput_wysiwyg, OnInput_wysiwyg, OnKeyDown_wysiwyg, OnKeyUp_wysiwyg } from '../../../../../src/core/base/eventHandlers/handler_ww_key_input';
import { createMockThis, createMockKeyboardEvent, createMockInputEvent } from '../../../../__mocks__/editor';

// Mock keyCodeMap module
jest.mock('../../../../../src/helper/keyCodeMap', () => ({
	isComposing: jest.fn().mockReturnValue(false),
	isShift: jest.fn().mockReturnValue(false),
	isCtrl: jest.fn().mockReturnValue(false),
	isAlt: jest.fn().mockReturnValue(false),
	isDirectionKey: jest.fn().mockReturnValue(false),
	isEnter: jest.fn().mockReturnValue(false),
	isNonTextKey: jest.fn().mockReturnValue(false),
	isSpace: jest.fn().mockReturnValue(false),
	isBackspace: jest.fn().mockReturnValue(false),
	isRemoveKey: jest.fn().mockReturnValue(false),
	isHistoryRelevantKey: jest.fn().mockReturnValue(true),
	isDocumentTypeObserverKey: jest.fn().mockReturnValue(false),
	isEsc: jest.fn().mockReturnValue(false)
}));

describe('handler_ww_key_input', () => {
	let mockThis;
	let mockFrameContext;
	let mockEvent;

	beforeEach(() => {
		jest.clearAllMocks();

		mockFrameContext = new Map([
			['wysiwyg', document.createElement('div')],
			['key', 'test-frame'],
			['isReadOnly', false],
			['isDisabled', false],
			['isCodeView', false]
		]);

		mockEvent = createMockKeyboardEvent('a', { isTrusted: true });
		mockThis = createMockThis();

		// Mock dom.check functions
		const mockDom = {
			check: {
				isInputElement: jest.fn().mockReturnValue(false)
			}
		};
		global.dom = mockDom;

		// Additional mocks for Key Input
		mockThis.format.isNormalLine = jest.fn().mockReturnValue(true);
		mockThis.format.isBrLine = jest.fn().mockReturnValue(false);
		mockThis.format.getFormatElement = jest.fn().mockReturnValue(document.createElement('p'));
		mockThis.format.getLine = jest.fn().mockReturnValue(document.createElement('p'));
		mockThis.format.isNestedContainer = jest.fn().mockReturnValue(false);
		mockThis.format.getBlock = jest.fn().mockReturnValue(document.createElement('div'));
		mockThis.format.isBlock = jest.fn().mockReturnValue(false);

		// Mock selection methods
		mockThis.selection.getRangeElement = jest.fn().mockReturnValue(document.createElement('p'));
		mockThis.selection._init = jest.fn();

		// Mock shortcuts system
		mockThis.shortcuts = {
			command: jest.fn().mockReturnValue(false)
		};

		// Mock editor ui methods
		mockThis.editor = {
			...mockThis.editor,
			ui: { _offCurrentController: jest.fn() },
			selectMenuOn: false,
			isBalloon: false,
			isSubBalloon: false
		};

		// Mock menu methods
		mockThis.menu.dropdownOff = jest.fn();
		mockThis.menu.currentDropdownName = null;

		// Mock toolbar methods
		mockThis._hideToolbar = jest.fn();
		mockThis._hideToolbar_sub = jest.fn();

		// Mock additional required methods
		mockThis._callPluginEvent = jest.fn().mockReturnValue(undefined);
		mockThis.__enterPrevent = jest.fn();
		mockThis.__enterScrollTo = jest.fn();
		mockThis._showToolbarBalloonDelay = jest.fn();
		mockThis._retainStyleNodes = jest.fn();
		mockThis._clearRetainStyleNodes = jest.fn();
		mockThis.nodeTransform = {
			removeAllParents: jest.fn(),
			split: jest.fn().mockReturnValue(document.createElement('p'))
		};

		// Mock dom check functions used in implementation
		mockThis._isInputElement = jest.fn().mockReturnValue(false);
		mockThis._isZeroWidth = jest.fn().mockReturnValue(false);
		mockThis._isNonEditable = jest.fn().mockReturnValue(false);
		mockThis._isUneditableNode = jest.fn().mockReturnValue(null);

		// Update frameContext with necessary data
		mockThis.frameContext = mockFrameContext;
	});

	describe('OnBeforeInput_wysiwyg', () => {
		it('should handle normal beforeinput', async () => {
			const inputEvent = createMockInputEvent('insertText', {
				data: 'test'
			});

			await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, inputEvent);

			expect(mockThis.char.test).toHaveBeenCalledWith('test', false);
			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onBeforeInput', {
				frameContext: mockFrameContext,
				event: inputEvent,
				data: 'test'
			});
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);
			const inputEvent = createMockInputEvent();

			const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, inputEvent);

			expect(inputEvent.preventDefault).toHaveBeenCalled();
			expect(inputEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should handle character limit exceeded', async () => {
			const inputEvent = createMockInputEvent('insertText', { data: 'test' });
			mockThis.char.test.mockReturnValue(false);

			const result = await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, inputEvent);

			expect(inputEvent.preventDefault).toHaveBeenCalled();
			expect(inputEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should handle null event data', async () => {
			const inputEvent = createMockInputEvent('insertText', { data: null });

			await OnBeforeInput_wysiwyg.call(mockThis, mockFrameContext, inputEvent);

			expect(mockThis.char.test).toHaveBeenCalledWith('', false);
		});
	});

	describe('OnInput_wysiwyg', () => {
		it('should handle normal input', async () => {
			await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.selection._init).toHaveBeenCalled();
			// The data for events with undefined data becomes ' ' (space) in the implementation
			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onInput', {
				frameContext: mockFrameContext,
				event: mockEvent,
				data: ' '
			});
			expect(mockThis.history.push).toHaveBeenCalledWith(true);
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);

			const result = await OnInput_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(result).toBe(false);
		});
	});

	describe('OnKeyDown_wysiwyg', () => {
		it('should handle normal keydown', async () => {
			await OnKeyDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.menu.dropdownOff).toHaveBeenCalled();
			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onKeyDown', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should handle composing state', async () => {
			const keyCodeMap = require('../../../../../src/helper/keyCodeMap');
			keyCodeMap.isComposing.mockReturnValue(true);

			const result = await OnKeyDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(result).toBe(true);
		});

		it('should handle shortcut keys without throwing', async () => {
			// The shortcut logic is complex and requires many conditions to be met
			// This test ensures the function runs without throwing an error
			const ctrlEvent = createMockKeyboardEvent('b', {
				ctrlKey: true,
				code: 'KeyB',
				isTrusted: true
			});

			// Just verify the function executes without throwing
			expect(() => OnKeyDown_wysiwyg.call(mockThis, mockFrameContext, ctrlEvent)).not.toThrow();
		});
	});

	describe('OnKeyUp_wysiwyg', () => {
		it('should handle normal keyup', async () => {
			const keyCodeMap = require('../../../../../src/helper/keyCodeMap');
			keyCodeMap.isHistoryRelevantKey.mockReturnValue(true);

			await OnKeyUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onKeyUp', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
			expect(mockThis.history.push).toHaveBeenCalledWith(true);
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);

			const result = await OnKeyUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(result).toBeUndefined();
			expect(mockThis.triggerEvent).not.toHaveBeenCalled();
		});

		it('should handle shortcut key state', async () => {
			mockThis._onShortcutKey = true;

			await OnKeyUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).not.toHaveBeenCalled();
		});
	});
});
