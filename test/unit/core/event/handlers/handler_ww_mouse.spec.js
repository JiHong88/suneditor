/**
 * @fileoverview Unit tests for handler_ww_mouse.js
 */

import { OnMouseDown_wysiwyg, OnMouseUp_wysiwyg, OnClick_wysiwyg, OnMouseMove_wysiwyg, OnMouseLeave_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_mouse';

describe('handler_ww_mouse', () => {
	let mockThis;
	let mockFc;

	beforeEach(() => {
		jest.useFakeTimers();

		const wysiwyg = document.createElement('div');
		wysiwyg.setAttribute('contenteditable', 'true');

		mockFc = new Map([
			['isReadOnly', false],
			['isDisabled', false],
			['wysiwyg', wysiwyg]
		]);

		mockThis = {
			__onDownEv: null,
			$: {
				store: {
					set: jest.fn(),
					mode: { isBalloon: false, isSubBalloon: false }
				},
				eventManager: {
					addGlobalEvent: jest.fn().mockReturnValue('global-ev-id'),
					removeGlobalEvent: jest.fn().mockReturnValue(null),
					triggerEvent: jest.fn().mockResolvedValue(undefined)
				},
				format: {
					_isExcludeSelectionElement: jest.fn().mockReturnValue(false),
					getLine: jest.fn().mockReturnValue(document.createElement('p')),
					getBlock: jest.fn().mockReturnValue(null),
					isLine: jest.fn().mockReturnValue(false),
					isBlock: jest.fn().mockReturnValue(false)
				},
				selection: {
					init: jest.fn(),
					getRange: jest.fn().mockReturnValue({
						collapsed: true,
						startContainer: document.createTextNode('text'),
						startOffset: 0,
						endContainer: document.createTextNode('text'),
						endOffset: 0
					}),
					getNode: jest.fn().mockReturnValue(document.createElement('p')),
					setRange: jest.fn()
				},
				component: {
					get: jest.fn().mockReturnValue(null),
					is: jest.fn().mockReturnValue(false),
					select: jest.fn(),
					hoverSelect: jest.fn()
				},
				focusManager: {
					focus: jest.fn(),
					nativeFocus: jest.fn()
				},
				options: {
					get: jest.fn().mockReturnValue('P')
				},
				commandDispatcher: {
					_copyFormat: jest.fn()
				}
			},
			_setSelectionSync: jest.fn(),
			_callPluginEventAsync: jest.fn().mockResolvedValue(undefined),
			_callPluginEvent: jest.fn(),
			_hideToolbar: jest.fn(),
			_hideToolbar_sub: jest.fn(),
			_toggleToolbarBalloon: jest.fn(),
			_setDefaultLine: jest.fn().mockReturnValue(null)
		};
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('OnMouseDown_wysiwyg', () => {
		it('should set _mousedown to true', async () => {
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.store.set).toHaveBeenCalledWith('_mousedown', true);
		});

		it('should add global mouseup event listener', async () => {
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.addGlobalEvent).toHaveBeenCalledWith('mouseup', expect.any(Function));
		});

		it('should remove previous global event before adding new one', async () => {
			mockThis.__onDownEv = 'prev-ev-id';
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.removeGlobalEvent).toHaveBeenCalledWith('prev-ev-id');
		});

		it('should return early in read-only mode', async () => {
			mockFc.set('isReadOnly', true);
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			// Should still set _mousedown but skip the rest
			expect(mockThis.$.store.set).toHaveBeenCalledWith('_mousedown', true);
			expect(mockThis._setSelectionSync).not.toHaveBeenCalled();
		});

		it('should prevent default when target is exclude selection element', async () => {
			mockThis.$.format._isExcludeSelectionElement.mockReturnValue(true);
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(event.preventDefault).toHaveBeenCalled();
		});

		it('should trigger onMouseDown user event', async () => {
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onMouseDown', {
				frameContext: mockFc,
				event
			});
		});

		it('should hide toolbar in balloon mode', async () => {
			mockThis.$.store.mode.isBalloon = true;
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._hideToolbar).toHaveBeenCalled();
		});

		it('should hide sub toolbar in sub balloon mode', async () => {
			mockThis.$.store.mode.isSubBalloon = true;
			const event = { target: document.createElement('p'), preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._hideToolbar_sub).toHaveBeenCalled();
		});

		it('should prevent default on FIGURE element click', async () => {
			const figure = document.createElement('figure');
			const event = { target: figure, preventDefault: jest.fn() };

			await OnMouseDown_wysiwyg.call(mockThis, mockFc, event);

			expect(event.preventDefault).toHaveBeenCalled();
		});
	});

	describe('OnMouseUp_wysiwyg', () => {
		it('should trigger onMouseUp user event', async () => {
			const event = { target: document.createElement('p') };

			await OnMouseUp_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onMouseUp', {
				frameContext: mockFc,
				event
			});
		});

		it('should trigger plugin event', async () => {
			const event = { target: document.createElement('p') };

			await OnMouseUp_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._callPluginEventAsync).toHaveBeenCalledWith('onMouseUp', {
				frameContext: mockFc,
				event
			});
		});

		it('should stop if user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);
			const event = { target: document.createElement('p') };

			await OnMouseUp_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._callPluginEventAsync).not.toHaveBeenCalled();
		});
	});

	describe('OnClick_wysiwyg', () => {
		it('should prevent default and open link in read-only mode when clicking anchor', async () => {
			mockFc.set('isReadOnly', true);
			const anchor = document.createElement('a');
			anchor.href = 'https://example.com';
			anchor.target = '_blank';
			const event = { target: anchor, preventDefault: jest.fn(), detail: 1 };

			await OnClick_wysiwyg.call(mockThis, mockFc, event);

			expect(event.preventDefault).toHaveBeenCalled();
		});

		it('should return false in read-only mode', async () => {
			mockFc.set('isReadOnly', true);
			const event = { target: document.createElement('p'), preventDefault: jest.fn(), detail: 1 };

			const result = await OnClick_wysiwyg.call(mockThis, mockFc, event);

			expect(result).toBe(false);
		});

		it('should select component when clicking on component element', async () => {
			const img = document.createElement('img');
			const componentInfo = { target: img, pluginName: 'image' };
			mockThis.$.component.get.mockReturnValue(componentInfo);

			const event = { target: img, preventDefault: jest.fn(), detail: 1 };

			await OnClick_wysiwyg.call(mockThis, mockFc, event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(mockThis.$.component.select).toHaveBeenCalledWith(img, 'image');
		});

		it('should trigger copyFormat on click', async () => {
			mockThis.$.component.get.mockReturnValue(null);
			const event = { target: document.createElement('p'), preventDefault: jest.fn(), detail: 1 };

			await OnClick_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.commandDispatcher._copyFormat).toHaveBeenCalled();
		});

		it('should trigger onClick user event', async () => {
			const event = { target: document.createElement('p'), preventDefault: jest.fn(), detail: 1 };

			await OnClick_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onClick', {
				frameContext: mockFc,
				event
			});
		});

		it('should stop if user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);
			const event = { target: document.createElement('p'), preventDefault: jest.fn(), detail: 1 };

			await OnClick_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.component.get).not.toHaveBeenCalled();
		});
	});

	describe('OnMouseMove_wysiwyg', () => {
		it('should return false in read-only mode', () => {
			mockFc.set('isReadOnly', true);
			const event = { target: document.createElement('p') };

			const result = OnMouseMove_wysiwyg.call(mockThis, mockFc, event);

			expect(result).toBe(false);
		});

		it('should return false in disabled mode', () => {
			mockFc.set('isDisabled', true);
			const event = { target: document.createElement('p') };

			const result = OnMouseMove_wysiwyg.call(mockThis, mockFc, event);

			expect(result).toBe(false);
		});

		it('should trigger plugin onMouseMove event', () => {
			const event = { target: document.createElement('p') };

			OnMouseMove_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onMouseMove', {
				frameContext: mockFc,
				event
			});
		});
	});

	describe('OnMouseLeave_wysiwyg', () => {
		it('should trigger onMouseLeave user event', async () => {
			const event = { target: document.createElement('p') };

			await OnMouseLeave_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis.$.eventManager.triggerEvent).toHaveBeenCalledWith('onMouseLeave', {
				frameContext: mockFc,
				event
			});
		});

		it('should trigger plugin event after user event', async () => {
			const event = { target: document.createElement('p') };

			await OnMouseLeave_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._callPluginEventAsync).toHaveBeenCalledWith('onMouseLeave', {
				frameContext: mockFc,
				event
			});
		});

		it('should stop if user event returns false', async () => {
			mockThis.$.eventManager.triggerEvent.mockResolvedValue(false);
			const event = { target: document.createElement('p') };

			await OnMouseLeave_wysiwyg.call(mockThis, mockFc, event);

			expect(mockThis._callPluginEventAsync).not.toHaveBeenCalled();
		});
	});
});
