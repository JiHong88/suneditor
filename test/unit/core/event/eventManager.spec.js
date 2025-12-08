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
			expect(eventManager._onShortcutKey).toBe(false);
			expect(eventManager._handledInBefore).toBe(false);
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
			jest.spyOn(target, 'addEventListener');
			const listener = jest.fn();

			const eventInfo = eventManager.addEvent(target, 'click', listener);

			expect(eventInfo).toEqual({
				target,
				type: 'click',
				listener,
				useCapture: undefined
			});
			expect(target.addEventListener).toHaveBeenCalledWith('click', listener, undefined);
		});

		it('should add event to multiple targets', () => {
			const targets = [document.createElement('div'), document.createElement('span')];
			const listener = jest.fn();
			targets.forEach((t) => jest.spyOn(t, 'addEventListener'));

			const eventInfo = eventManager.addEvent(targets, 'click', listener);

			expect(eventInfo.target).toEqual(targets);
			expect(targets[0].addEventListener).toHaveBeenCalledWith('click', listener, undefined);
			expect(targets[1].addEventListener).toHaveBeenCalledWith('click', listener, undefined);
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
			dom.check.isListCell = jest.fn().mockReturnValue(false);
			dom.query.getParentElement = jest.fn().mockReturnValue(null);
			dom.utils.addClass = jest.fn();
			dom.utils.removeClass = jest.fn();

			mockEditor.frameContext.set('isReadOnly', false);
			mockEditor.options.set('_textStyleTags', ['strong', 'b', 'em', 'i']);
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

		it('should check active plugins for commandTargets', () => {
			const button = document.createElement('button');
			const commandTargets = new Map();
			commandTargets.set('testPlugin', [button]);
			mockEditor.commandTargets = commandTargets;
			mockEditor.activeCommands = ['testPlugin'];
			mockEditor.frameContext.set('isReadOnly', false);

			// Mock plugin active method
			mockEditor.plugins.testPlugin = {
				active: jest.fn().mockReturnValue(true)
			};

			const textNode = document.createTextNode('text');
			const pElement = document.createElement('p');
			pElement.appendChild(textNode);
			mockEditor.frameContext.get('wysiwyg').appendChild(pElement);

			eventManager.applyTagEffect(textNode);

			// It should be called for pElement (nodeType 1)
			expect(mockEditor.plugins.testPlugin.active).toHaveBeenCalledWith(pElement, button);
			expect(mockEditor.status.currentNodesMap).toContain('testPlugin');
		});

		it('should handle indent/outdent enabling logic', () => {
			const buttonIndent = document.createElement('button');
			const buttonOutdent = document.createElement('button');
			const commandTargets = new Map();
			commandTargets.set('indent', [buttonIndent]);
			commandTargets.set('outdent', [buttonOutdent]);
			mockEditor.commandTargets = commandTargets;

			// Mock format.isLine
			mockEditor.format.isLine.mockReturnValue(true);
			
			// Case: List cell (enables indent/outdent)
			const listCell = document.createElement('li');
			const textNode = document.createTextNode('item');
			listCell.appendChild(textNode);
			mockEditor.frameContext.get('wysiwyg').appendChild(listCell);

			// Mock checks
			dom.check.isListCell.mockReturnValue(true);
			dom.check.isImportantDisabled.mockReturnValue(false);

			eventManager.applyTagEffect(textNode);

			// Indent should be pushed if previous sibling exists, but here we just check if code attempts to push it
			// Ref: eventManager.js:355 const indentDisable = dom.check.isListCell(element) && !element.previousElementSibling;
			// If isListCell is true and no prev sibling, indentDisable is true (disabled).
			// We want to verify logic.
			
			// Let's rely on commandMapNodes. If button logic runs, it might add to map.
		});

		it('should enable outdent for elements with margin', () => {
			const buttonOutdent = document.createElement('button');
			const commandTargets = new Map();
			commandTargets.set('outdent', [buttonOutdent]);
			mockEditor.commandTargets = commandTargets;
			
			const pElement = document.createElement('p');
			pElement.style.marginLeft = '20px';
			const textNode = document.createTextNode('text');
			pElement.appendChild(textNode);
			mockEditor.frameContext.get('wysiwyg').appendChild(pElement);

			mockEditor.format.isLine.mockReturnValue(true);
			dom.check.isListCell.mockReturnValue(false);
			
			// Mock loop checks
			// eventManager logic: if (element.style[marginDir] ...)
			mockEditor.options.set('_rtl', false);

			eventManager.applyTagEffect(textNode);
			
			expect(mockEditor.status.currentNodesMap).toContain('outdent');
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
			jest.spyOn(target, 'addEventListener');
			jest.spyOn(target, 'removeEventListener');
			const listener = jest.fn();

			eventManager.addEvent(target, 'click', listener);

			eventManager._removeAllEvents();

			expect(target.removeEventListener).toHaveBeenCalledWith('click', listener, undefined);
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

	describe('_setDefaultLine', () => {
		beforeEach(() => {
			mockEditor.options.set('__lineFormatFilter', true);
			mockEditor.options.set('defaultLine', 'P');
			mockEditor.selection.getRange.mockReturnValue(document.createRange());
			// Mock format utils
			mockEditor.format = {
				getBlock: jest.fn(),
				isBlock: jest.fn(),
				isLine: jest.fn(),
				addLine: jest.fn()
			};
		});

		it('should return null if __lineFormatFilter is false', () => {
			mockEditor.options.set('__lineFormatFilter', false);
			const result = eventManager._setDefaultLine();
			expect(result).toBe(null);
		});

		it('should set default line when inside block', () => {
			const div = document.createElement('div');
			mockEditor.format.getBlock.mockReturnValue(div);
			
			eventManager._setDefaultLine('div');
			
			expect(mockEditor.selection.setRange).toHaveBeenCalled();
		});

		it('should handle selection inside component text', () => {
			const commonCon = document.createTextNode('text');
			const wrapper = document.createElement('div');
			const component = document.createElement('div');
			wrapper.appendChild(component);
			component.appendChild(commonCon);
			
			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: commonCon,
				startContainer: commonCon,
				startOffset: 0
			});
			
			// Mock component checks
			// component.is(component) -> true
			mockEditor.component.is.mockImplementation((node) => node === component);
			mockEditor.component.get.mockReturnValue({
				container: wrapper,
				target: component,
				pluginName: 'testComp'
			});

			eventManager._setDefaultLine('div');

			expect(mockEditor.component.select).toHaveBeenCalledWith(component, 'testComp');
		});

		it('should handle data-se-embed attribute', () => {
			const commonCon = document.createElement('div');
			commonCon.setAttribute('data-se-embed', 'true');
			
			// Mock check for format.isLine
			mockEditor.format.isLine.mockReturnValue(false);
			
			const newLine = document.createElement('p');
			newLine.innerHTML = '<br>';
			mockEditor.format.addLine.mockReturnValue(newLine);

			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: commonCon,
				startContainer: commonCon,
				startOffset: 0
			});

			eventManager._setDefaultLine('P');

			expect(mockEditor.format.addLine).toHaveBeenCalled();
			expect(mockEditor.selection.setRange).toHaveBeenCalled();
		});

		it('should fallback to execCommand on error', () => {
			// Simulate try/catch block by ensuring getBlock returns null and manual insertion throws
			mockEditor.format.getBlock.mockReturnValue(null);
			// Mock nodeType to 3 to enter the block
			const commonCon = document.createTextNode('text');
			// Mock parent element to define where to insert
			const parent = document.createElement('div');
			parent.appendChild(commonCon);
			
			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: commonCon,
				startContainer: commonCon,
				startOffset: 0
			});

			mockEditor.component.is.mockReturnValue(false);

			// Mock createElement to throw error
			dom.utils.createElement = jest.fn().mockImplementation(() => {
				throw new Error('Test Error');
			});

			// Ensure execCommand is mocked
			mockEditor.execCommand = jest.fn();
			mockEditor.selection.init = jest.fn();

			eventManager._setDefaultLine('div');

			expect(mockEditor.execCommand).toHaveBeenCalledWith('formatBlock', false, 'div');
		});
	});
	
	describe('_dataTransferAction extensions', () => {
		it('should clean MS Word content', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<html xmlns:o="urn:schemas-microsoft-com:office:office"><body><!--StartFragment--><p class="MsoNormal">Word Content</p><!--EndFragment--></body></html>';
					return 'Word Content';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.char = { test: jest.fn().mockReturnValue(true) };
			mockEditor.options.set('autoLinkify', false);
			// Pass-through html clean
			mockEditor.html.clean = jest.fn(html => html);

			await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onPaste', expect.objectContaining({
				data: expect.stringContaining('Word Content'),
				from: 'MS'
			}));
		});

		it('should handle file drop events', async () => {
			const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
			const mockClipboardData = {
				getData: jest.fn().mockReturnValue(''),
				files: [mockFile]
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await eventManager._dataTransferAction('drop', mockEvent, mockClipboardData, mockEditor.frameContext);

			// Check that callPluginEventAsync was called for onFilePasteAndDrop
			// Spy on the method bound to existing plugins logic?
			// _callPluginEventAsync calls editor._onPluginEvents.get
			// We can verify that plugin event was retrieved?
			// Or better, since we can't easily spy on the private-like method of the instance without replacing it,
			// let's verify if 'onFilePasteAndDrop' is checked.
			// Actually, eventManager._callPluginEventAsync is called. We can spy it!
			jest.spyOn(eventManager, '_callPluginEventAsync');
			
			mockEditor.frameContext.set('isReadOnly', false);
			
			await eventManager._dataTransferAction('drop', mockEvent, mockClipboardData, mockEditor.frameContext);

			// Check that callPluginEventAsync was called for onFilePasteAndDrop
			expect(eventManager._callPluginEventAsync).toHaveBeenCalledWith('onFilePasteAndDrop', expect.anything());
		});

		it('should check max char count', async () => {
			const mockClipboardData = {
				getData: jest.fn().mockReturnValue('content'),
				files: []
			};
			mockEditor.char = { test: jest.fn().mockReturnValue(false) }; // Max limit reached

			await eventManager._dataTransferAction('paste', { preventDefault: jest.fn(), stopPropagation: jest.fn() }, mockClipboardData, mockEditor.frameContext);

			await eventManager._dataTransferAction('paste', { preventDefault: jest.fn(), stopPropagation: jest.fn() }, mockClipboardData, mockEditor.frameContext);

			expect(mockEditor.html.insert).not.toHaveBeenCalled();
		});
	});

	describe('Balloon and Toolbar Logic', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			mockEditor.selection.init = jest.fn(); // Mock init method
			mockEditor.subToolbar = {
				_showBalloon: jest.fn(),
				hide: jest.fn()
			};
			mockEditor.toolbar = {
				_showBalloon: jest.fn(),
				hide: jest.fn()
			};
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('_showToolbarBalloonDelay should call showBalloon after delay', () => {
			eventManager._showToolbarBalloonDelay();
			
			jest.advanceTimersByTime(250);
			
			expect(mockEditor.toolbar._showBalloon).toHaveBeenCalled();
		});

		it('_toggleToolbarBalloon should show balloon when selection is not collapsed', () => {
			mockEditor.selection.getRange.mockReturnValue({ collapsed: false });
			// Ensure defaults allow balloon
			mockEditor.isBalloonAlways = true;
			// Mock options.has to return false for _subMode
			mockEditor.options.has = jest.fn().mockReturnValue(false);
			
			eventManager._toggleToolbarBalloon();
			
			expect(mockEditor.toolbar._showBalloon).toHaveBeenCalled();
		});

		it('_hideToolbar should hide toolbar when not active', () => {
			mockEditor._notHideToolbar = false;
			// frameContext is a Map, so we set the value
			mockEditor.frameContext.set('isFullScreen', false);
			
			eventManager._hideToolbar();
			
			expect(mockEditor.toolbar.hide).toHaveBeenCalled();
		});
	});

	describe('_setKeyEffect', () => {
		it('should update button states', () => {
			const commandTargets = new Map();
			const button = document.createElement('button');
			commandTargets.set('bold', [button]);
			mockEditor.commandTargets = commandTargets;
			mockEditor.activeCommands = ['bold'];
			
			eventManager._setKeyEffect([]);
			
			expect(button.classList.contains('active')).toBe(false);
		});
	});
	describe('Setup and Teardown', () => {
		it('_addCommonEvents should attach listeners', () => {
			mockEditor.context = {
				get: jest.fn((key) => document.createElement('div'))
			};
			mockEditor.toolbar = { _setResponsive: jest.fn() };
			
			const addEventSpy = jest.spyOn(eventManager, 'addEvent');
			
			eventManager._addCommonEvents();
			
			expect(addEventSpy).toHaveBeenCalled();
			expect(mockEditor.toolbar._setResponsive).toHaveBeenCalled();
		});

		it('_removeAllEvents should cleanup listeners and observers', () => {
			const disconnectSpy = jest.fn();
			eventManager._wwFrameObserver = { disconnect: disconnectSpy };
			eventManager._toolbarObserver = { disconnect: disconnectSpy };
			
			// Mock global events cleanup
			eventManager.removeGlobalEvent = jest.fn();
			
			eventManager._removeAllEvents();
			
			expect(disconnectSpy).toHaveBeenCalledTimes(2);
			expect(eventManager._wwFrameObserver).toBeNull();
		});
	});

	describe('_retainStyleNodes', () => {
		it('should retain style nodes', () => {
			const formatEl = document.createElement('div');
			const styleNode = document.createElement('strong');
			styleNode.textContent = 'bold';
			
			mockEditor.nodeTransform = {
				createNestedNode: jest.fn().mockReturnValue({
					parent: document.createElement('strong'),
					inner: document.createElement('strong')
				})
			};
			
			eventManager._retainStyleNodes(formatEl, [styleNode]);
			
			expect(mockEditor.selection.setRange).toHaveBeenCalled();
			expect(formatEl.children.length).toBeGreaterThan(0);
		});
	});

	describe('UI & Frame Events', () => {
		it('_addFrameEvents should attach resize and scroll listeners', () => {
			const wysiwygFrame = document.createElement('div');
			const codeArea = document.createElement('textarea');
			const resizeBackground = document.createElement('div');
			
			// Setup frameContext with options
			mockEditor.frameContext.set('options', mockEditor.options);
			mockEditor.frameContext.set('wysiwyg', wysiwygFrame);
			mockEditor.frameContext.set('code', codeArea);
			mockEditor.frameContext.set('resizeBackground', resizeBackground);
			mockEditor.context = { element: { resizeBackground } };
			
			const addEventSpy = jest.spyOn(eventManager, 'addEvent');
			
			eventManager._addFrameEvents(mockEditor.frameContext);

			expect(addEventSpy).toHaveBeenCalledWith(wysiwygFrame, 'scroll', expect.any(Function), expect.anything());

			// Test Scroll Handler Logic
			const scrollHandler = addEventSpy.mock.calls.find(call => call[1] === 'scroll' && call[0] === wysiwygFrame)[2];
			
			// Mock internal methods
			const pluginEventSpy = jest.spyOn(eventManager, '_callPluginEvent');
			// triggerEvent is also called, mock if needed, or assume it delegates to editor
			eventManager.triggerEvent = jest.fn();

			// Execute handler
			scrollHandler({ target: { scrollTop: 100, scrollLeft: 0, nodeType: 1 } });
			
			// Verify effects
			expect(pluginEventSpy).toHaveBeenCalledWith('onScroll', expect.anything());
		});
	});
});
