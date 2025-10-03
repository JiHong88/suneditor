import EventManager from '../../../../src/core/event/eventManager';
import { createMockEditor } from '../../../__mocks__/editorMock';
import { dom, unicode } from '../../../../src/helper';

describe('EventManager - Working Tests', () => {
	let mockEditor;
	let eventManager;

	beforeEach(() => {
		mockEditor = createMockEditor();
		eventManager = new EventManager(mockEditor);

		// Inject all dependencies properly
		eventManager.component = mockEditor.component;
		eventManager.selection = mockEditor.selection;
		eventManager.char = mockEditor.char;
		eventManager.format = mockEditor.format;
		eventManager.html = mockEditor.html;
		eventManager.ui = mockEditor.ui;
		eventManager.toolbar = mockEditor.toolbar;
		eventManager.subToolbar = mockEditor.subToolbar;
		eventManager.menu = mockEditor.menu;
		eventManager.history = mockEditor.history;
		eventManager.viewer = mockEditor.viewer;
		eventManager.nodeTransform = mockEditor.nodeTransform;
		eventManager.triggerEvent = mockEditor.triggerEvent;
		eventManager.carrierWrapper = mockEditor.carrierWrapper;
		eventManager.context = mockEditor.context;
		eventManager.frameContext = mockEditor.frameContext;
		eventManager.frameOptions = mockEditor.frameOptions;
		eventManager.frameRoots = mockEditor.frameRoots;
		eventManager.options = mockEditor.options;
		eventManager.plugins = mockEditor.plugins;
		eventManager.status = mockEditor.status;
		eventManager.editor = mockEditor;
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
		beforeEach(() => {
			global.window = {
				addEventListener: jest.fn(),
				removeEventListener: jest.fn()
			};
		});

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
			const mockIframeWindow = { addEventListener: jest.fn() };
			mockEditor.frameContext.set('_ww', mockIframeWindow);
			const listener = jest.fn();

			const eventInfo = eventManager.addGlobalEvent('resize', listener);

			expect(eventInfo.type).toBe('resize');
		});
	});

	describe('removeGlobalEvent', () => {
		beforeEach(() => {
			global.window = {
				addEventListener: jest.fn(),
				removeEventListener: jest.fn()
			};
		});

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

	describe('_isUneditableNode', () => {
		beforeEach(() => {
			dom.check.isComponentContainer = jest.fn().mockReturnValue(false);
			dom.check.isNonEditable = jest.fn().mockReturnValue(false);
			dom.check.isEdgePoint = jest.fn().mockReturnValue(false);
		});

		it('should detect uneditable container node', () => {
			const range = document.createRange();
			const container = document.createElement('div');
			const uneditableDiv = document.createElement('div');
			uneditableDiv.className = 'se-component';

			container.appendChild(uneditableDiv);
			range.setStart(container, 0);
			dom.check.isComponentContainer = jest.fn().mockReturnValue(true);

			eventManager._isUneditableNode_getSibling = jest.fn().mockReturnValue(uneditableDiv);

			const result = eventManager._isUneditableNode(range, true);

			expect(result).toBe(uneditableDiv);
		});

		it('should return null for editable nodes', () => {
			const range = document.createRange();
			const editableDiv = document.createElement('div');

			range.setStart(editableDiv, 0);

			const result = eventManager._isUneditableNode(range, true);

			expect(result).toBe(null);
		});
	});

	describe('_hardDelete', () => {
		beforeEach(() => {
			dom.check.isTableCell = jest.fn().mockReturnValue(false);
			dom.check.isFigure = jest.fn().mockReturnValue(false);
			dom.query.getParentElement = jest.fn().mockReturnValue(null);
			dom.utils.removeItem = jest.fn();
		});

		it('should handle table cell deletion', () => {
			const tableCell = document.createElement('td');
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');
			const tr = document.createElement('tr');

			tr.appendChild(tableCell);
			tbody.appendChild(tr);
			table.appendChild(tbody);
			document.body.appendChild(table);

			const range = document.createRange();
			range.setStart(tableCell, 0);
			range.setEnd(tableCell, 0);

			mockEditor.selection.getRange.mockReturnValue(range);
			mockEditor.format.getBlock.mockReturnValue(tableCell);
			dom.check.isTableCell = jest.fn().mockReturnValue(true);

			const result = eventManager._hardDelete();

			expect(result).toBe(false);
			document.body.removeChild(table);
		});

		it('should handle component deletion', () => {
			const componentDiv = document.createElement('div');
			componentDiv.className = 'se-component';

			const range = document.createRange();
			range.setStart(componentDiv, 0);
			range.setEnd(componentDiv, 0);

			mockEditor.selection.getRange.mockReturnValue(range);
			mockEditor.format.getBlock.mockReturnValue(null);
			dom.query.getParentElement = jest.fn().mockReturnValue(componentDiv);

			const result = eventManager._hardDelete();

			expect(result).toBe(false);
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

	describe('clipboard data processing', () => {
		let mockClipboardData;
		let mockEvent;

		beforeEach(() => {
			mockClipboardData = {
				getData: jest.fn(),
				files: []
			};
			mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};
			mockEditor.triggerEvent.mockResolvedValue(undefined);
			mockEditor.html.clean.mockReturnValue('<p>cleaned</p>');
			mockEditor.char.test.mockReturnValue(true);
			mockEditor.html.insert = jest.fn();
			mockEditor.frameOptions.get = jest.fn().mockReturnValue('char');
			mockEditor.options.get = jest.fn().mockReturnValue(false);

			// Mock converter for text processing
			const mockConverter = {
				htmlToEntity: jest.fn((text) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;')),
				textToAnchor: jest.fn()
			};

			// Mock dom.query.getListChildNodes
			dom.query.getListChildNodes = jest.fn();

			// Mock global DOMParser
			global.DOMParser = jest.fn().mockImplementation(() => ({
				parseFromString: jest.fn().mockReturnValue({
					body: {
						innerHTML: '<p>parsed</p>',
						childNodes: []
					}
				})
			}));

			// Replace converter import with mock
			jest.doMock('../../../../src/helper', () => ({
				dom: dom,
				unicode: unicode,
				converter: mockConverter
			}));
		});

		it('should handle plain text data', async () => {
			mockClipboardData.getData.mockImplementation((type) => {
				if (type === 'text/plain') return 'plain text';
				if (type === 'text/html') return '';
				return '';
			});

			// Mock converter for plain text processing
			const convertedText = 'plain text'.replace(/\n/g, '<br>');

			const result = await eventManager._setClipboardData('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(mockEditor.html.insert).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should handle HTML data', async () => {
			mockClipboardData.getData.mockImplementation((type) => {
				if (type === 'text/plain') return 'plain text';
				if (type === 'text/html') return '<p>html content</p>';
				return '';
			});

			const result = await eventManager._setClipboardData('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(mockEditor.html.clean).toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('should handle files when present', async () => {
			mockClipboardData.files = [new File([''], 'test.txt')];
			mockClipboardData.getData.mockReturnValue('');
			eventManager._callPluginEvent = jest.fn();

			const result = await eventManager._setClipboardData('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(eventManager._callPluginEvent).toHaveBeenCalledWith('onFilePasteAndDrop', expect.any(Object));
			expect(result).toBe(false);
		});

		it('should respect user event callbacks', async () => {
			mockClipboardData.getData.mockReturnValue('<p>content</p>');
			mockEditor.triggerEvent.mockResolvedValue(false);

			const result = await eventManager._setClipboardData('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(result).toBe(false);
			expect(mockEditor.html.insert).not.toHaveBeenCalled();
		});
	});

	describe('style management', () => {
		describe('_retainStyleNodes', () => {
			it('should retain and restructure style nodes', () => {
				const formatEl = document.createElement('p');
				const styleNode1 = document.createElement('strong');
				const styleNode2 = document.createElement('em');
				const styleNodes = [styleNode1, styleNode2];

				mockEditor.nodeTransform.createNestedNode.mockReturnValue({
					parent: document.createElement('strong'),
					inner: document.createElement('em')
				});
				dom.utils.createTextNode = jest.fn(() => document.createTextNode(unicode.zeroWidthSpace));

				eventManager._retainStyleNodes(formatEl, styleNodes);

				expect(formatEl.innerHTML).not.toBe('');
				expect(mockEditor.selection.setRange).toHaveBeenCalled();
			});
		});

		describe('_clearRetainStyleNodes', () => {
			it('should clear format element and set selection', () => {
				const formatEl = document.createElement('p');
				formatEl.innerHTML = '<strong>content</strong>';

				eventManager._clearRetainStyleNodes(formatEl);

				expect(formatEl.innerHTML).toBe('<br>');
				expect(mockEditor.selection.setRange).toHaveBeenCalledWith(formatEl, 0, formatEl, 0);
			});
		});
	});

	describe('plugin events', () => {
		describe('_callPluginEvent', () => {
			it('should call plugin event handlers and return result', () => {
				const handler1 = jest.fn().mockReturnValue(undefined);
				const handler2 = jest.fn().mockReturnValue(true);
				const handler3 = jest.fn();

				mockEditor._onPluginEvents = new Map();
				mockEditor._onPluginEvents.set('testEvent', [handler1, handler2, handler3]);

				const result = eventManager._callPluginEvent('testEvent', { test: 'data' });

				expect(handler1).toHaveBeenCalledWith({ test: 'data' });
				expect(handler2).toHaveBeenCalledWith({ test: 'data' });
				expect(handler3).not.toHaveBeenCalled();
				expect(result).toBe(true);
			});

			it('should handle empty event handlers', () => {
				mockEditor._onPluginEvents = new Map();
				mockEditor._onPluginEvents.set('emptyEvent', []);

				const result = eventManager._callPluginEvent('emptyEvent', { test: 'data' });

				expect(result).toBeUndefined();
			});
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

		it('should handle missing elements gracefully', () => {
			mockEditor.context.get.mockReturnValue(null);

			expect(() => eventManager._moveContainer({ scrollTop: 0, scrollLeft: 0 })).not.toThrow();
		});

		it('should handle missing clipboard data gracefully', async () => {
			const mockClipboardData = {
				getData: jest.fn().mockReturnValue(''),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.char.test.mockReturnValue(false);

			const result = await eventManager._setClipboardData('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(result).toBe(false);
			expect(mockEditor.html.insert).not.toHaveBeenCalled();
		});
	});
});