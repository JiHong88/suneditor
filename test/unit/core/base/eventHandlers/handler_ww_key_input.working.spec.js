import { OnBeforeInput_wysiwyg, OnInput_wysiwyg, OnKeyDown_wysiwyg, OnKeyUp_wysiwyg } from '../../../../../src/core/base/eventHandlers/handler_ww_key_input';
import { createMockEditor } from '../../../../__mocks__/editorMock';
import { dom, env, unicode, keyCodeMap } from '../../../../../src/helper';

describe('handler_ww_key_input - Working Tests', () => {
	let mockEditor;
	let mockFrameContext;
	let originalWindow;

	beforeEach(() => {
		mockEditor = createMockEditor();

		// Create mock frame context
		mockFrameContext = {
			get: jest.fn(),
			has: jest.fn().mockReturnValue(false)
		};

		// Mock DOM utilities
		dom.check = {
			isInputElement: jest.fn().mockReturnValue(false),
			isZeroWidth: jest.fn().mockReturnValue(false),
			isBreak: jest.fn().mockReturnValue(false),
			isEdgePoint: jest.fn().mockReturnValue(false),
			isWysiwygFrame: jest.fn().mockReturnValue(false),
			isListCell: jest.fn().mockReturnValue(false),
			isList: jest.fn().mockReturnValue(false),
			isTableCell: jest.fn().mockReturnValue(false),
			isElement: jest.fn().mockReturnValue(false),
			isNonEditable: jest.fn().mockReturnValue(false)
		};

		dom.utils = {
			removeItem: jest.fn(),
			createElement: jest.fn((tag, attrs, html) => {
				const element = document.createElement(tag);
				if (html) element.innerHTML = html;
				return element;
			}),
			createTextNode: jest.fn((text) => document.createTextNode(text)),
			copyTagAttributes: jest.fn(),
			copyFormatAttributes: jest.fn(),
			arrayFind: jest.fn()
		};

		dom.query = {
			getParentElement: jest.fn(),
			getPreviousDeepestNode: jest.fn(),
			getNextDeepestNode: jest.fn(),
			getNodeDepth: jest.fn().mockReturnValue(1),
			getEdgeChild: jest.fn(),
			findTextIndexOnLine: jest.fn().mockReturnValue(0),
			findTabEndIndex: jest.fn().mockReturnValue(0)
		};

		// Mock keyCodeMap utilities
		keyCodeMap.isComposing = jest.fn().mockReturnValue(false);
		keyCodeMap.isShift = jest.fn().mockReturnValue(false);
		keyCodeMap.isCtrl = jest.fn().mockReturnValue(false);
		keyCodeMap.isAlt = jest.fn().mockReturnValue(false);
		keyCodeMap.isDirectionKey = jest.fn().mockReturnValue(false);
		keyCodeMap.isEnter = jest.fn().mockReturnValue(false);
		keyCodeMap.isNonTextKey = jest.fn().mockReturnValue(false);
		keyCodeMap.isBackspace = jest.fn().mockReturnValue(false);
		keyCodeMap.isSpace = jest.fn().mockReturnValue(false);
		keyCodeMap.isEsc = jest.fn().mockReturnValue(false);
		keyCodeMap.isRemoveKey = jest.fn().mockReturnValue(false);
		keyCodeMap.isHistoryRelevantKey = jest.fn().mockReturnValue(false);
		keyCodeMap.isDocumentTypeObserverKey = jest.fn().mockReturnValue(false);

		// Unicode mocking
		unicode.zeroWidthSpace = '\u200B';
		unicode.zeroWidthRegExp = /[\u200B-\u200D\uFEFF]/g;

		// Editor mocking
		Object.assign(mockEditor, {
			char: {
				test: jest.fn().mockReturnValue(true),
				check: jest.fn().mockReturnValue(true)
			},
			triggerEvent: jest.fn().mockResolvedValue(undefined),
			_callPluginEvent: jest.fn().mockReturnValue(undefined),
			selection: {
				getRange: jest.fn().mockReturnValue({
					collapsed: true,
					startContainer: document.createTextNode('test'),
					endContainer: document.createTextNode('test'),
					startOffset: 0,
					endOffset: 0,
					commonAncestorContainer: document.createTextNode('test')
				}),
				getNode: jest.fn().mockReturnValue(document.createElement('div')),
				_init: jest.fn(),
				setRange: jest.fn(),
				_resetRangeToTextNode: jest.fn(),
				get: jest.fn().mockReturnValue({
					focusOffset: 0,
					focusNode: document.createTextNode('test')
				})
			},
			format: {
				getLine: jest.fn().mockReturnValue(document.createElement('p')),
				isNormalLine: jest.fn().mockReturnValue(true),
				isBrLine: jest.fn().mockReturnValue(false),
				getBlock: jest.fn().mockReturnValue(document.createElement('div')),
				isBlock: jest.fn().mockReturnValue(false),
				isLine: jest.fn().mockReturnValue(true),
				getBrLine: jest.fn().mockReturnValue(null),
				isEdgeLine: jest.fn().mockReturnValue(false),
				isClosureBlock: jest.fn().mockReturnValue(false),
				isClosureBrLine: jest.fn().mockReturnValue(false),
				addLine: jest.fn().mockReturnValue(document.createElement('p')),
				removeBlock: jest.fn().mockReturnValue({
					cc: document.createElement('div'),
					ec: null
				}),
				getLines: jest.fn().mockReturnValue([document.createElement('p')])
			},
			options: {
				get: jest.fn().mockImplementation((key) => {
					switch (key) {
						case 'defaultLine': return 'P';
						case 'tabDisable': return false;
						case 'syncTabIndent': return false;
						case 'lineAttrReset': return [];
						case 'retainStyleMode': return 'none';
						default: return null;
					}
				})
			},
			_setDefaultLine: jest.fn().mockReturnValue(null),
			history: {
				push: jest.fn()
			},
			html: {
				remove: jest.fn().mockReturnValue({
					commonCon: document.createElement('div'),
					container: document.createElement('div')
				}),
				insert: jest.fn(),
				insertNode: jest.fn().mockReturnValue(document.createTextNode('test'))
			},
			component: {
				is: jest.fn().mockReturnValue(false),
				get: jest.fn().mockReturnValue(null),
				deselect: jest.fn(),
				select: jest.fn().mockReturnValue(true)
			},
			menu: {
				currentDropdownName: null,
				dropdownOff: jest.fn()
			},
			editor: {
				selectMenuOn: false,
				isBalloon: false,
				isSubBalloon: false,
				isBalloonAlways: false,
				isSubBalloonAlways: false,
				blur: jest.fn(),
				_nativeFocus: jest.fn()
			},
			nodeTransform: {
				removeAllParents: jest.fn(),
				split: jest.fn().mockReturnValue(document.createElement('p'))
			},
			frameOptions: {
				get: jest.fn().mockReturnValue('char')
			},
			shortcuts: {
				command: jest.fn().mockReturnValue(false)
			},
			listFormat: {
				applyNested: jest.fn().mockReturnValue({
					sc: document.createTextNode('test'),
					so: 0,
					ec: document.createTextNode('test'),
					eo: 0
				})
			},
			status: {
				tabSize: 4,
				currentNodes: [document.createElement('p')]
			},
			toolbar: {
				_showBalloon: jest.fn()
			},
			subToolbar: {
				_showBalloon: jest.fn()
			},
			_hideToolbar: jest.fn(),
			_hideToolbar_sub: jest.fn(),
			_showToolbarBalloonDelay: jest.fn(),
			_isUneditableNode: jest.fn().mockReturnValue(false),
			_hardDelete: jest.fn().mockReturnValue(false),
			_retainStyleNodes: jest.fn(),
			_clearRetainStyleNodes: jest.fn(),
			__enterPrevent: jest.fn(),
			__enterScrollTo: jest.fn(),
			applyTagEffect: jest.fn(),
			isComposing: false,
			_onShortcutKey: false,
			_handledInBefore: false,
			_formatAttrsTemp: null,
			__cacheStyleNodes: [],
			__retainTimer: null
		});

		originalWindow = global.window;
		global.window = {
			...originalWindow,
			setTimeout: jest.fn((fn, delay) => {
				fn();
				return 1;
			}),
			clearTimeout: jest.fn()
		};
	});

	afterEach(() => {
		global.window = originalWindow;
	});

	describe('OnKeyDown_wysiwyg - Core Functionality', () => {
		it('should handle backspace key basic flow', async () => {
			const backspaceEvent = {
				code: 'Backspace',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, backspaceEvent);

			expect(mockEditor.component.deselect).toHaveBeenCalled();
			expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
		});

		it('should handle delete key basic flow', async () => {
			const deleteEvent = {
				code: 'Delete',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, deleteEvent);

			expect(mockEditor.component.deselect).toHaveBeenCalled();
			expect(mockEditor.menu.dropdownOff).toHaveBeenCalled();
		});

		it('should handle tab key basic flow', async () => {
			const tabEvent = {
				code: 'Tab',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, tabEvent);

			expect(tabEvent.preventDefault).toHaveBeenCalled();
			expect(mockEditor.format.getLines).toHaveBeenCalled();
		});

		it('should handle ctrl+key combinations', async () => {
			const ctrlEvent = {
				code: 'KeyB',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			keyCodeMap.isCtrl.mockReturnValue(true);
			keyCodeMap.isNonTextKey.mockReturnValue(false);
			mockEditor.shortcuts.command.mockReturnValue(true);

			const result = await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, ctrlEvent);

			expect(result).toBe(false);
			expect(ctrlEvent.preventDefault).toHaveBeenCalled();
			expect(ctrlEvent.stopPropagation).toHaveBeenCalled();
		});

		it('should handle normal text input', async () => {
			const textEvent = {
				code: 'KeyA',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			keyCodeMap.isEnter.mockReturnValue(true);
			mockEditor.format.isLine.mockReturnValue(true);

			await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, textEvent);

			expect(mockEditor.selection._resetRangeToTextNode).toHaveBeenCalled();
		});

		it('should handle non-breaking space insertion', async () => {
			const spaceEvent = {
				code: 'Space',
				isTrusted: true,
				shiftKey: true,
				ctrlKey: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			keyCodeMap.isShift.mockReturnValue(true);
			keyCodeMap.isCtrl.mockReturnValue(true);
			keyCodeMap.isSpace.mockReturnValue(true);

			// Mock env.isOSX_IOS
			env.isOSX_IOS = false;

			await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, spaceEvent);

			expect(spaceEvent.preventDefault).toHaveBeenCalled();
			expect(spaceEvent.stopPropagation).toHaveBeenCalled();
			expect(mockEditor.html.insertNode).toHaveBeenCalled();
		});

		it('should handle zero width space insertion for break elements', async () => {
			const textEvent = {
				code: 'KeyA',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const breakElement = document.createElement('br');
			const range = {
				collapsed: true,
				commonAncestorContainer: breakElement
			};

			mockEditor.selection.getRange.mockReturnValue(range);
			keyCodeMap.isNonTextKey.mockReturnValue(false);
			dom.check.isBreak.mockReturnValue(true);

			await OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, textEvent);

			expect(mockEditor.html.insertNode).toHaveBeenCalled();
		});
	});

	describe('OnKeyUp_wysiwyg - Core Functionality', () => {
		it('should handle sub balloon toolbar logic', async () => {
			const keyEvent = {
				code: 'KeyA',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.editor.isSubBalloon = true;
			mockEditor.selection.getRange.mockReturnValue({ collapsed: false });

			await OnKeyUp_wysiwyg.call(mockEditor, mockFrameContext, keyEvent);

			expect(mockEditor.subToolbar._showBalloon).toHaveBeenCalled();
		});

		it('should handle format attributes restoration', async () => {
			const keyEvent = {
				code: 'KeyA',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const formatEl = document.createElement('p');
			formatEl.setAttribute = jest.fn();
			formatEl.removeAttribute = jest.fn();

			const attrs = [
				{ name: 'class', value: 'test-class' },
				{ name: 'data-attr', value: 'test-value' }
			];

			mockEditor.format.getLine.mockReturnValue(formatEl);
			mockEditor._formatAttrsTemp = attrs;

			await OnKeyUp_wysiwyg.call(mockEditor, mockFrameContext, keyEvent);

			expect(formatEl.setAttribute).toHaveBeenCalledWith('class', 'test-class');
			expect(formatEl.setAttribute).toHaveBeenCalledWith('data-attr', 'test-value');
			expect(mockEditor._formatAttrsTemp).toBe(null);
		});

		it('should handle zero width character cleanup', async () => {
			const keyEvent = {
				code: 'KeyA',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const textNode = document.createTextNode('\u200Btest\u200B');
			const range = {
				startOffset: 2,
				endOffset: 4,
				startContainer: textNode,
				endContainer: textNode
			};

			mockEditor.selection.getNode.mockReturnValue(textNode);
			mockEditor.selection.getRange.mockReturnValue(range);
			keyCodeMap.isNonTextKey.mockReturnValue(false);

			await OnKeyUp_wysiwyg.call(mockEditor, mockFrameContext, keyEvent);

			expect(mockEditor.selection.setRange).toHaveBeenCalled();
		});

		it('should handle history push for relevant keys', async () => {
			const keyEvent = {
				code: 'KeyA',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			keyCodeMap.isHistoryRelevantKey.mockReturnValue(true);

			await OnKeyUp_wysiwyg.call(mockEditor, mockFrameContext, keyEvent);

			expect(mockEditor.history.push).toHaveBeenCalledWith(true);
		});

		it('should handle document type observer events', async () => {
			const keyEvent = {
				code: 'KeyA',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			keyCodeMap.isDocumentTypeObserverKey.mockReturnValue(true);

			const documentType = {
				reHeader: jest.fn(),
				on: jest.fn()
			};

			mockFrameContext.has.mockImplementation((key) => {
				if (key === 'documentType_use_header') return true;
				return false;
			});
			mockFrameContext.get.mockImplementation((key) => {
				if (key === 'documentType') return documentType;
				return null;
			});

			await OnKeyUp_wysiwyg.call(mockEditor, mockFrameContext, keyEvent);

			expect(documentType.reHeader).toHaveBeenCalled();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('should handle events with missing properties gracefully', async () => {
			const malformedEvent = {
				code: 'KeyA',
				// Missing isTrusted and other properties
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await expect(OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, malformedEvent)).resolves.not.toThrow();
		});

		it('should handle null selection nodes', async () => {
			const keyEvent = {
				code: 'KeyA',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.selection.getNode.mockReturnValue(null);

			await expect(OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, keyEvent)).resolves.not.toThrow();
		});

		it('should handle events when editor properties are missing', async () => {
			const keyEvent = {
				code: 'KeyA',
				isTrusted: true,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			// Temporarily remove some editor properties
			const originalEditor = mockEditor.editor;
			mockEditor.editor = {};

			await expect(OnKeyDown_wysiwyg.call(mockEditor, mockFrameContext, keyEvent)).resolves.not.toThrow();

			mockEditor.editor = originalEditor;
		});
	});
});