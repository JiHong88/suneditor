import { OnMouseDown_wysiwyg, OnMouseUp_wysiwyg, OnClick_wysiwyg, OnMouseMove_wysiwyg, OnMouseLeave_wysiwyg } from '../../../../../src/core/base/eventHandlers/handler_ww_mouse';
import { createMockThis, createMockMouseEvent } from '../../../../__mocks__/editorMock';

describe('handler_ww_mouse', () => {
	let mockThis;
	let mockFrameContext;
	let mockEvent;

	beforeEach(() => {
		mockFrameContext = new Map([
			['wysiwyg', document.createElement('div')],
			['key', 'test-frame'],
			['isReadOnly', false],
			['isDisabled', false],
			['isCodeView', false]
		]);

		mockEvent = createMockMouseEvent('mousedown', {
			button: 0,
			clientX: 100,
			clientY: 100
		});

		mockThis = createMockThis();
		// Add missing editor status properties
		mockThis.editor.status = {
			_onMousedown: false,
			...mockThis.editor.status
		};
		// Add missing mock methods
		mockThis._setSelectionSync = jest.fn();
		mockThis.addGlobalEvent = jest.fn();
		mockThis.removeGlobalEvent = jest.fn();
		mockThis._w = {
			...window,
			open: jest.fn() // Mock window.open
		};
		mockThis._toggleToolbarBalloon = jest.fn();

		// Add missing selection methods
		mockThis.selection._init = jest.fn();
		mockThis.selection._rangeInfo = jest.fn();
		mockThis.selection.get = jest.fn().mockReturnValue(null);

		// Add missing format/nodeTransform methods
		mockThis._setDefaultLine = jest.fn();
	});

	describe('OnMouseDown_wysiwyg', () => {
		it('should handle normal mouse down', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.editor.status._onMousedown).toBe(true);
			expect(mockThis._setSelectionSync).toHaveBeenCalled();
			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onMouseDown', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onMouseDown', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should handle right-click (context menu)', async () => {
			mockEvent.button = 2;
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.editor.status._onMousedown).toBe(true);
			expect(mockThis.triggerEvent).toHaveBeenCalled();
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			// Should return early without doing anything
			expect(mockThis._setSelectionSync).not.toHaveBeenCalled();
			expect(mockThis.triggerEvent).not.toHaveBeenCalled();
		});

		it('should handle disabled mode', async () => {
			mockFrameContext.set('isDisabled', true);
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			// isDisabled doesn't prevent OnMouseDown execution in the actual implementation
			expect(mockThis.editor.status._onMousedown).toBe(true);
			expect(mockThis._setSelectionSync).toHaveBeenCalled();
		});

		it('should handle code view mode', async () => {
			mockFrameContext.set('isCodeView', true);
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			// isCodeView doesn't prevent OnMouseDown execution in the actual implementation
			expect(mockThis.editor.status._onMousedown).toBe(true);
			expect(mockThis._setSelectionSync).toHaveBeenCalled();
		});

		it('should handle exclude selection elements', async () => {
			mockThis.format._isExcludeSelectionElement.mockReturnValue(true);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockThis.triggerEvent).not.toHaveBeenCalled();
		});

		it('should handle FIGURE elements', async () => {
			mockEvent.target = document.createElement('figure');
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should hide balloon toolbar when isBalloon is true', async () => {
			mockThis.editor.isBalloon = true;
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._hideToolbar).toHaveBeenCalled();
		});

		it('should hide sub-balloon toolbar when isSubBalloon is true', async () => {
			mockThis.editor.isSubBalloon = true;
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._hideToolbar_sub).toHaveBeenCalled();
		});

		it('should handle triggerEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(false);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
		});

		it('should handle _callPluginEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(false);

			await OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._callPluginEvent).toHaveBeenCalled();
			// Should return early, not hiding toolbars
			expect(mockThis._hideToolbar).not.toHaveBeenCalled();
		});
	});

	describe('OnMouseUp_wysiwyg', () => {
		it('should handle normal mouse up', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onMouseUp', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onMouseUp', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).toHaveBeenCalled();
		});

		it('should handle triggerEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(false);

			await OnMouseUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
		});

		it('should handle _callPluginEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(false);

			await OnMouseUp_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).toHaveBeenCalled();
		});
	});

	describe('OnClick_wysiwyg', () => {
		it('should handle normal click', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);
			mockThis.component.get.mockReturnValue(null);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onClick', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onClick', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);

			const result = await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(result).toBe(false);
			expect(mockThis.triggerEvent).not.toHaveBeenCalled();
		});

		it('should handle anchor links in readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);
			const anchor = document.createElement('a');
			anchor.href = 'https://example.com';
			anchor.target = '_blank';
			mockEvent.target = anchor;

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should handle component selection', async () => {
			const componentInfo = {
				target: mockEvent.target,
				pluginName: 'test'
			};
			mockThis.component.get.mockReturnValue(componentInfo);
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockThis.component.select).toHaveBeenCalledWith(componentInfo.target, componentInfo.pluginName);
		});

		it('should handle triple click', async () => {
			mockEvent.detail = 3;
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);
			mockThis.component.get.mockReturnValue(null);
			const mockRange = {
				startContainer: document.createTextNode('text'),
				startOffset: 0,
				endContainer: document.createTextNode('text'),
				endOffset: 0
			};
			mockThis.selection.getRange.mockReturnValue(mockRange);
			mockThis.format.isLine.mockReturnValue(true);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.selection.getRange).toHaveBeenCalled();
		});

		it('should handle triggerEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(false);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
		});

		it('should handle _callPluginEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(false);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).toHaveBeenCalled();
		});
	});

	describe('OnMouseMove_wysiwyg', () => {
		it('should handle normal mouse move', () => {
			mockThis._callPluginEvent.mockReturnValue(undefined);

			// Need to mock _DragHandle.get for the overComponentSelect check
			// This is tricky since _DragHandle is imported, so we'll assume it's working

			OnMouseMove_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._overComponentSelect).toHaveBeenCalledWith(mockEvent.target);
			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onMouseMove', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should handle readonly mode', () => {
			mockFrameContext.set('isReadOnly', true);

			const result = OnMouseMove_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(result).toBe(false);
			expect(mockThis._overComponentSelect).not.toHaveBeenCalled();
			expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
		});

		it('should handle disabled mode', () => {
			mockFrameContext.set('isDisabled', true);

			const result = OnMouseMove_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(result).toBe(false);
			expect(mockThis._overComponentSelect).not.toHaveBeenCalled();
			expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
		});

		it('should call plugin event when not in restricted modes', () => {
			mockThis._callPluginEvent.mockReturnValue(undefined);

			OnMouseMove_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onMouseMove', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should not call _overComponentSelect in restricted modes', () => {
			mockFrameContext.set('isReadOnly', true);

			OnMouseMove_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis._overComponentSelect).not.toHaveBeenCalled();
		});
	});

	describe('OnMouseLeave_wysiwyg', () => {
		it('should handle normal mouse leave', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseLeave_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalledWith('onMouseLeave', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
			expect(mockThis._callPluginEvent).toHaveBeenCalledWith('onMouseLeave', {
				frameContext: mockFrameContext,
				event: mockEvent
			});
		});

		it('should handle readonly mode', async () => {
			mockFrameContext.set('isReadOnly', true);
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);

			await OnMouseLeave_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).toHaveBeenCalled();
		});

		it('should handle triggerEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(false);

			await OnMouseLeave_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).not.toHaveBeenCalled();
		});

		it('should handle _callPluginEvent returning false', async () => {
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(false);

			await OnMouseLeave_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
			expect(mockThis._callPluginEvent).toHaveBeenCalled();
		});
	});

	describe('balloon toolbar modes', () => {
		it('should handle balloon mode in OnClick', async () => {
			mockThis.editor.isBalloon = true;
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);
			mockThis.component.get.mockReturnValue(null);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			// _toggleToolbarBalloon is called with setTimeout(0), so we need to wait for next tick
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(mockThis._toggleToolbarBalloon).toHaveBeenCalled();
		});

		it('should handle sub-balloon mode in OnClick', async () => {
			mockThis.editor.isSubBalloon = true;
			mockThis.triggerEvent.mockResolvedValue(undefined);
			mockThis._callPluginEvent.mockReturnValue(undefined);
			mockThis.component.get.mockReturnValue(null);

			await OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			// _toggleToolbarBalloon is called with setTimeout(0), so we need to wait for next tick
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(mockThis._toggleToolbarBalloon).toHaveBeenCalled();
		});
	});

	describe('edge cases', () => {
		it('should handle null event target', () => {
			mockEvent.target = null;

			expect(() => OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent)).not.toThrow();
		});

		it('should handle component without plugin info', () => {
			mockThis.component.is.mockReturnValue(true);
			mockThis.component.get.mockReturnValue(null);

			expect(() => OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent)).not.toThrow();
		});

		it('should handle missing selection', () => {
			mockThis.selection.getNode.mockReturnValue(null);

			expect(() => OnMouseDown_wysiwyg.call(mockThis, mockFrameContext, mockEvent)).not.toThrow();
		});
	});

	describe('keyboard modifiers', () => {
		it('should handle shift+click', () => {
			mockEvent.shiftKey = true;

			OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
		});

		it('should handle ctrl+click', () => {
			mockEvent.ctrlKey = true;

			OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
		});

		it('should handle meta+click (cmd on mac)', () => {
			mockEvent.metaKey = true;

			OnClick_wysiwyg.call(mockThis, mockFrameContext, mockEvent);

			expect(mockThis.triggerEvent).toHaveBeenCalled();
		});
	});
});
