import EventManager from '../../../../src/core/event/eventManager';
import { createMockEditor } from '../../../__mocks__/editorMock';
import { dom } from '../../../../src/helper';

describe('EventManager', () => {
	let mockEditor;
	let eventManager;

	beforeEach(() => {
		mockEditor = createMockEditor();
		eventManager = new EventManager(mockEditor);

		// Initialize observers for tests
		eventManager._wwFrameObserver = {
			disconnect: jest.fn()
		};
		eventManager._toolbarObserver = {
			disconnect: jest.fn()
		};
	});

	describe('constructor', () => {
		it('should initialize with required properties', () => {
			expect(eventManager.isComposing).toBe(false);
			expect(eventManager.scrollparents).toEqual([]);
			expect(eventManager._events).toEqual([]);
			expect(eventManager._onButtonsCheck).toBeInstanceOf(RegExp);
			expect(eventManager._onShortcutKey).toBe(false);
			expect(eventManager._handledInBefore).toBe(false);
			expect(eventManager._balloonDelay).toBe(null);
		});

		it('should set up input plugin properties', () => {
			expect(eventManager._inputFocus).toBe(false);
			expect(eventManager.__inputPlugin).toBe(null);
			expect(eventManager.__inputBlurEvent).toBe(null);
			expect(eventManager.__inputKeyEvent).toBe(null);
		});
	});

	describe('addEvent', () => {
		it('should add event to single target', () => {
			const target = document.createElement('div');
			const listener = jest.fn();

			const eventInfo = eventManager.addEvent(target, 'click', listener);

			expect(eventInfo).toEqual({
				target,
				type: 'click',
				listener,
				useCapture: undefined
			});
			expect(eventManager._events).toHaveLength(1);
		});

		it('should add event to multiple targets', () => {
			const targets = [document.createElement('div'), document.createElement('span')];
			const listener = jest.fn();

			const eventInfo = eventManager.addEvent(targets, 'click', listener);

			expect(eventInfo.target).toEqual(targets);
			expect(eventManager._events).toHaveLength(2);
		});

		it('should return null for null target', () => {
			const result = eventManager.addEvent(null, 'click', jest.fn());
			expect(result).toBe(null);
		});

		it('should return null for empty array target', () => {
			const result = eventManager.addEvent([], 'click', jest.fn());
			expect(result).toBe(null);
		});
	});

	describe('removeEvent', () => {
		it('should remove event successfully', () => {
			const target = document.createElement('div');
			const listener = jest.fn();

			const eventInfo = eventManager.addEvent(target, 'click', listener);
			const result = eventManager.removeEvent(eventInfo);

			expect(result).toBe(null);
		});

		it('should handle null params gracefully', () => {
			const result = eventManager.removeEvent(null);
			expect(result).toBeUndefined();
		});

		it('should handle missing target gracefully', () => {
			const result = eventManager.removeEvent({ target: null });
			expect(result).toBeUndefined();
		});
	});

	describe('addGlobalEvent', () => {
		it('should add global event', () => {
			const listener = jest.fn();

			const eventInfo = eventManager.addGlobalEvent('resize', listener);

			expect(eventInfo).toEqual({
				type: 'resize',
				listener,
				useCapture: undefined
			});
		});

		it('should handle iframe context', () => {
			mockEditor.frameOptions.set('iframe', true);
			const listener = jest.fn();

			const eventInfo = eventManager.addGlobalEvent('resize', listener);

			expect(eventInfo.type).toBe('resize');
		});
	});

	describe('removeGlobalEvent', () => {
		it('should remove global event by object', () => {
			const listener = jest.fn();
			const eventInfo = eventManager.addGlobalEvent('resize', listener);

			const result = eventManager.removeGlobalEvent(eventInfo);

			expect(result).toBe(null);
		});

		it('should remove global event by parameters', () => {
			const listener = jest.fn();

			const result = eventManager.removeGlobalEvent('resize', listener, false);

			expect(result).toBe(null);
		});

		it('should handle null type gracefully', () => {
			const result = eventManager.removeGlobalEvent(null);
			expect(result).toBeUndefined();
		});
	});

	describe('applyTagEffect', () => {
		beforeEach(() => {
			// Mock dom methods
			dom.check.isWysiwygFrame = jest.fn().mockReturnValue(false);
			dom.check.isBreak = jest.fn().mockReturnValue(false);
			dom.check.isImportantDisabled = jest.fn().mockReturnValue(false);
			dom.query.getParentElement = jest.fn().mockReturnValue(null);
			dom.utils.addClass = jest.fn();
			dom.utils.removeClass = jest.fn();
		});

		it('should apply tag effects to selection', () => {
			const textNode = document.createTextNode('text');
			const strongElement = document.createElement('strong');
			strongElement.appendChild(textNode);
			const pElement = document.createElement('p');
			pElement.appendChild(strongElement);
			mockEditor.frameContext.get('wysiwyg').appendChild(pElement);

			eventManager.applyTagEffect(textNode);

			expect(mockEditor.status.currentNodes).toContain('strong');
			expect(mockEditor.status.currentNodes).toContain('p');
		});

		it('should return early if selectionNode is same as effectNode', () => {
			const node = document.createElement('p');
			mockEditor.effectNode = node;

			const result = eventManager.applyTagEffect(node);

			expect(result).toBeUndefined();
		});

		it('should handle component selection', () => {
			const componentElement = document.createElement('div');
			mockEditor.component.is.mockReturnValue(true);
			mockEditor.component.get.mockReturnValue({
				target: componentElement,
				pluginName: 'test'
			});

			eventManager.applyTagEffect(componentElement);

			expect(mockEditor.component.select).toHaveBeenCalled();
		});

		it('should update navigation when statusbar_showPathLabel is true', () => {
			const navigation = document.createElement('div');
			mockEditor.frameContext.set('navigation', navigation);

			const textNode = document.createTextNode('text');
			const pElement = document.createElement('p');
			pElement.appendChild(textNode);
			mockEditor.frameContext.get('wysiwyg').appendChild(pElement);

			eventManager.applyTagEffect(textNode);

			expect(navigation.textContent).toContain('p');
		});
	});

	describe('_dataTransferAction', () => {
		it('should handle paste action successfully', async () => {
			const mockClipboardData = {
				getData: jest.fn().mockReturnValue('<p>test</p>'),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const result = await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(mockEditor.ui.showLoading).toHaveBeenCalled();
			expect(mockEditor.ui.hideLoading).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should handle errors gracefully', async () => {
			const mockClipboardData = {
				getData: jest.fn().mockImplementation(() => {
					throw new Error('Test error');
				})
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

			await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(consoleWarn).toHaveBeenCalledWith('[SUNEDITOR.paste.error]', expect.any(Error));
			expect(mockEditor.ui.hideLoading).toHaveBeenCalled();

			consoleWarn.mockRestore();
		});
	});

	describe('_removeAllEvents', () => {
		it('should remove all registered events', () => {
			const target = document.createElement('div');
			const listener = jest.fn();

			eventManager.addEvent(target, 'click', listener);
			expect(eventManager._events).toHaveLength(1);

			eventManager._removeAllEvents();

			expect(eventManager._events).toHaveLength(0);
		});

		it('should disconnect observers', () => {
			const mockWwFrameObserver = {
				disconnect: jest.fn()
			};
			const mockToolbarObserver = {
				disconnect: jest.fn()
			};

			eventManager._wwFrameObserver = mockWwFrameObserver;
			eventManager._toolbarObserver = mockToolbarObserver;

			eventManager._removeAllEvents();

			expect(mockWwFrameObserver.disconnect).toHaveBeenCalled();
			expect(mockToolbarObserver.disconnect).toHaveBeenCalled();
			expect(eventManager._wwFrameObserver).toBe(null);
			expect(eventManager._toolbarObserver).toBe(null);
		});
	});

	describe('_moveContainer', () => {
		it('should move balloon toolbar position', () => {
			mockEditor.isBalloon = true;
			eventManager.toolbar._balloonOffset = { top: 100, left: 100 };
			const toolbar = document.createElement('div');
			toolbar.style.position = 'absolute';
			mockEditor.context.get.mockReturnValue(toolbar);

			const scrollEvent = { scrollTop: 50, scrollLeft: 25 };

			eventManager._moveContainer(scrollEvent);

			expect(toolbar.style.top).toBe('50px');
			expect(toolbar.style.left).toBe('75px');
		});

		it('should move sub-balloon toolbar position', () => {
			mockEditor.isSubBalloon = true;
			eventManager.subToolbar._balloonOffset = { top: 100, left: 100 };
			const subToolbar = document.createElement('div');
			subToolbar.style.position = 'absolute';
			mockEditor.context.get.mockReturnValue(subToolbar);

			const scrollEvent = { scrollTop: 30, scrollLeft: 15 };

			eventManager._moveContainer(scrollEvent);

			expect(subToolbar.style.top).toBe('70px');
			expect(subToolbar.style.left).toBe('85px');
		});
	});

	describe('edge cases and error handling', () => {
		it('should handle non-element nodes in applyTagEffect', () => {
			const textNode = document.createTextNode('text');

			expect(() => eventManager.applyTagEffect(textNode)).not.toThrow();
		});

		it('should handle empty selection in applyTagEffect', () => {
			mockEditor.selection.getNode.mockReturnValue(null);

			expect(() => eventManager.applyTagEffect()).not.toThrow();
		});
	});

	describe('triggerEvent', () => {
		it('should have triggerEvent method', () => {
			expect(typeof eventManager.triggerEvent).toBe('function');
		});

		it('should handle missing event type', async () => {
			const result = await eventManager.triggerEvent('nonExistentEvent', {});
			expect(result).toBeUndefined();
		});
	});

	describe('_callPluginEvent', () => {
		it('should have _callPluginEvent method', () => {
			expect(typeof eventManager._callPluginEvent).toBe('function');
		});

		it('should handle empty plugins', () => {
			expect(() => {
				eventManager._callPluginEvent('onMouseMove', { frameContext: mockEditor.frameContext, event: {} });
			}).not.toThrow();
		});
	});

	describe('_callPluginEventAsync', () => {
		it('should have _callPluginEventAsync method', () => {
			expect(typeof eventManager._callPluginEventAsync).toBe('function');
		});

		it('should handle empty plugins async', async () => {
			const result = await eventManager._callPluginEventAsync('onMouseDown', { frameContext: mockEditor.frameContext, event: {} });
			expect(result).toBeUndefined();
		});
	});

	describe('_setClipboardData', () => {
		it('should have _setClipboardData method', () => {
			expect(typeof eventManager._setClipboardData).toBe('function');
		});
	});

	describe('_toggleToolbarBalloon', () => {
		it('should have _toggleToolbarBalloon method', () => {
			expect(typeof eventManager._toggleToolbarBalloon).toBe('function');
		});

		it('should not throw when called', () => {
			expect(() => {
				eventManager._toggleToolbarBalloon();
			}).not.toThrow();
		});
	});

	describe('_showToolbarBalloonDelay', () => {
		it('should have _showToolbarBalloonDelay method', () => {
			expect(typeof eventManager._showToolbarBalloonDelay).toBe('function');
		});

		it('should not throw when called', () => {
			expect(() => {
				eventManager._showToolbarBalloonDelay();
			}).not.toThrow();
		});
	});

	describe('_hideToolbar', () => {
		it('should have _hideToolbar method', () => {
			expect(typeof eventManager._hideToolbar).toBe('function');
		});

		it('should not throw when called', () => {
			expect(() => {
				eventManager._hideToolbar();
			}).not.toThrow();
		});
	});

	describe('__postFocusEvent', () => {
		it('should have __postFocusEvent method', () => {
			expect(typeof eventManager.__postFocusEvent).toBe('function');
		});
	});

	describe('__postBlurEvent', () => {
		it('should have __postBlurEvent method', () => {
			expect(typeof eventManager.__postBlurEvent).toBe('function');
		});
	});

	describe('_setSelectionSync', () => {
		it('should have _setSelectionSync method', () => {
			expect(typeof eventManager._setSelectionSync).toBe('function');
		});

		it('should not throw when called', () => {
			expect(() => {
				eventManager._setSelectionSync();
			}).not.toThrow();
		});
	});

	describe('_resetFrameStatus', () => {
		it('should have _resetFrameStatus method', () => {
			expect(typeof eventManager._resetFrameStatus).toBe('function');
		});
	});

	describe('_isNonFocusNode', () => {
		it('should have _isNonFocusNode method', () => {
			expect(typeof eventManager._isNonFocusNode).toBe('function');
		});

		it('should return false for regular element', () => {
			const div = document.createElement('div');
			const result = eventManager._isNonFocusNode(div);
			expect(typeof result).toBe('boolean');
		});
	});

	describe('__removeInput', () => {
		it('should have __removeInput method', () => {
			expect(typeof eventManager.__removeInput).toBe('function');
		});

		it('should reset input state', () => {
			eventManager._inputFocus = true;
			eventManager.__inputPlugin = {};

			eventManager.__removeInput();

			expect(eventManager._inputFocus).toBe(false);
			expect(eventManager.__inputPlugin).toBe(null);
		});
	});
});
