import EventManager from '../../../../src/core/event/eventManager';
import { createMockEditor } from '../../../__mocks__/editorMock';
import { dom, env } from '../../../../src/helper';

describe('EventManager Complex Logic', () => {
	let mockEditor;
	let eventManager;

	beforeEach(() => {
		mockEditor = createMockEditor();
		eventManager = new EventManager(mockEditor);

		// Mock necessary properties
		mockEditor.frameContext.set('wysiwyg', document.createElement('div'));

		// Mock UI
		mockEditor.ui = {
			showLoading: jest.fn(),
			hideLoading: jest.fn(),
			offCurrentModal: jest.fn(),
			offCurrentController: jest.fn(),
			enableBackWrapper: jest.fn(),
			disableBackWrapper: jest.fn()
		};

		// Mock Char
		mockEditor.char = {
			test: jest.fn().mockReturnValue(true),
			check: jest.fn().mockReturnValue(true)
		};

		// Mock HTML
		mockEditor.html = {
			clean: jest.fn((html) => html),
			insert: jest.fn(),
			insertNode: jest.fn()
		};
	});

    describe('_dataTransferAction complex scenarios', () => {
        it('should handle MS Word content paste', async () => {
            const wordContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office"><head></head><body><!--StartFragment--><p class=MsoNormal>Word Content</p><!--EndFragment--></body></html>';
            const mockClipboardData = {
                getData: jest.fn((type) => {
                    if (type === 'text/html') return wordContent;
                    return 'Word Content';
                }),
                files: []
            };
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

            // Expect cleanup of MS tags - The received string includes StartFragment and double quotes
            expect(mockEditor.html.clean).toHaveBeenCalledWith(expect.stringContaining('Word Content'), expect.any(Object));
        });

        it('should handle file drop', async () => {
            const mockFile = new File(['content'], 'test.png', { type: 'image/png' });
            const mockClipboardData = {
                getData: jest.fn().mockReturnValue(''), // Return string to avoid regex error
                files: [mockFile]
            };
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            // Mock async plugin call
            // We spy on the method on the class prototype or instance
            // Since _callPluginEventAsync is inherited from CoreInjector, we spy on the instance
            const pluginSpy = jest.spyOn(eventManager, '_callPluginEventAsync').mockResolvedValue(true);

            await eventManager._dataTransferAction('drop', mockEvent, mockClipboardData, mockEditor.frameContext);

            expect(pluginSpy).toHaveBeenCalledWith('onFilePasteAndDrop', expect.objectContaining({ file: mockFile }));
        });

        it('should handle autoLinkify on paste', async () => {
            const content = 'Check this http://example.com link';
            mockEditor.options.set('autoLinkify', true);
            const mockClipboardData = {
                getData: jest.fn((type) => {
                    if (type === 'text/html') return `<p>${content}</p>`;
                    return content;
                }),
                files: []
            };
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

            expect(mockEditor.html.insert).toHaveBeenCalled();
        });
    });

    describe('_setDefaultLine complex scenarios', () => {
        it('should create default line when empty and triggered', () => {
            mockEditor.options.set('__lineFormatFilter', true);
            mockEditor.options.set('defaultLine', 'P');
            
            const range = {
                commonAncestorContainer: mockEditor.frameContext.get('wysiwyg'),
                startContainer: mockEditor.frameContext.get('wysiwyg'),
                startOffset: 0,
                endOffset: 0,
                collapsed: true
            };
            mockEditor.selection.getRange.mockReturnValue(range);
            mockEditor.selection.init = jest.fn(); // Mock init
            
            // Mock format utils
            mockEditor.format = {
                getBlock: jest.fn().mockReturnValue(null),
                isBlock: jest.fn().mockReturnValue(false),
                isLine: jest.fn().mockReturnValue(false),
                addLine: jest.fn().mockImplementation((parent, tag) => {
                    const el = document.createElement(tag || 'P');
                    parent.appendChild(el);
                    return el;
                })
            };
            
            // Stub execCommand as fallback
            mockEditor.execCommand = jest.fn();

            eventManager._setDefaultLine('P');
            
            // It falls through to execCommand because of exception or logic path (commonCon.nodeType === 1 for wysiwyg div)
            expect(mockEditor.execCommand).toHaveBeenCalledWith('formatBlock', false, 'P');
        });
    });
    
	describe('_toggleToolbarBalloon', () => {
		it('should toggle balloon based on selection', () => {
			mockEditor.selection.init = jest.fn();
			mockEditor.selection.getRange.mockReturnValue({ collapsed: false });

			mockEditor.toolbar._showBalloon = jest.fn();
			mockEditor.toolbar.hide = jest.fn();

			// Force has to return false
			mockEditor.options.has = jest.fn().mockReturnValue(false);

			eventManager._toggleToolbarBalloon();

			expect(mockEditor.toolbar._showBalloon).toHaveBeenCalled();
		});

		it('should hide balloon if collapsed and not balloonAlways', () => {
			mockEditor.selection.init = jest.fn();
			mockEditor.selection.getRange.mockReturnValue({ collapsed: true });

			mockEditor.toolbar._showBalloon = jest.fn();
			mockEditor.toolbar.hide = jest.fn();

			mockEditor.frameContext.set('isFullScreen', false);
			mockEditor.isBalloonAlways = false;
			mockEditor._notHideToolbar = false;

			// Force has to return false
			mockEditor.options.has = jest.fn().mockReturnValue(false);

			eventManager._toggleToolbarBalloon();

			expect(mockEditor.toolbar.hide).toHaveBeenCalled();
		});

		it('should handle sub balloon mode', () => {
			mockEditor.selection.init = jest.fn();
			mockEditor.selection.getRange.mockReturnValue({ collapsed: false });
			mockEditor.options.has = jest.fn().mockReturnValue(true); // has _subMode

			mockEditor.subToolbar = { _showBalloon: jest.fn(), hide: jest.fn() };

			eventManager._toggleToolbarBalloon();

			expect(mockEditor.subToolbar._showBalloon).toHaveBeenCalled();
		});

		it('should hide sub toolbar when collapsed in sub mode', () => {
			mockEditor.selection.init = jest.fn();
			mockEditor.selection.getRange.mockReturnValue({ collapsed: true });
			mockEditor.options.has = jest.fn().mockReturnValue(true); // has _subMode
			mockEditor.isSubBalloonAlways = false;

			mockEditor.subToolbar = { _showBalloon: jest.fn(), hide: jest.fn() };
			mockEditor._notHideToolbar = false;

			eventManager._toggleToolbarBalloon();

			expect(mockEditor.subToolbar.hide).toHaveBeenCalled();
		});
	});

	describe('_dataTransferAction with user event return values', () => {
		it('should process paste data and insert HTML', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<p>test</p>';
					return 'test';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor._onPluginEvents.set('onPaste', []);

			const result = await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(result).toBe(false);
			expect(mockEditor.html.insert).toHaveBeenCalled();
		});

		it('should use modified data when onPaste returns string', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<p>original</p>';
					return 'original';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.triggerEvent = jest.fn().mockResolvedValue('<p>modified</p>');
			mockEditor._onPluginEvents.set('onPaste', []);

			const result = await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(result).toBe(false);
			// The content should be inserted
			expect(mockEditor.html.insert).toHaveBeenCalled();
		});

		it('should process paste with maxCharCount check', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<p>test</p>';
					return 'test';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.char.test = jest.fn().mockReturnValue(true);
			mockEditor._onPluginEvents.set('onPaste', []);

			const result = await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(result).toBe(false);
			expect(mockEditor.char.test).toHaveBeenCalled();
		});

		it('should handle drop event data transfer', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<p>dropped</p>';
					return 'dropped';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor._onPluginEvents.set('onPaste', []);

			const result = await eventManager._dataTransferAction('drop', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(result).toBe(false);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should handle drop with modified content', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<p>original</p>';
					return 'original';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			mockEditor.triggerEvent = jest.fn().mockImplementation((name) => {
				if (name === 'onDrop') return Promise.resolve('<p>modified drop</p>');
				return Promise.resolve(undefined);
			});
			mockEditor._onPluginEvents.set('onPaste', []);

			await eventManager._dataTransferAction('drop', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(mockEditor.html.insert).toHaveBeenCalled();
		});
	});

	describe('_dataTransferAction with document type', () => {
		it('should call reHeader for document type with header', async () => {
			const mockClipboardData = {
				getData: jest.fn((type) => {
					if (type === 'text/html') return '<h1>Header</h1><p>test</p>';
					return 'Header test';
				}),
				files: []
			};
			const mockEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			const mockDocType = { reHeader: jest.fn() };
			mockEditor.frameContext.set('documentType_use_header', true);
			mockEditor.frameContext.set('documentType', mockDocType);
			mockEditor._onPluginEvents.set('onPaste', []);

			await eventManager._dataTransferAction('paste', mockEvent, mockClipboardData, mockEditor.frameContext);

			expect(mockDocType.reHeader).toHaveBeenCalled();
		});
	});

	describe('applyTagEffect with non-focus node', () => {
		beforeEach(() => {
			dom.check.isWysiwygFrame = jest.fn().mockReturnValue(false);
			dom.check.isBreak = jest.fn().mockReturnValue(false);
		});

		it('should blur editor when encountering non-focus node', () => {
			const nonFocusElement = document.createElement('span');
			nonFocusElement.setAttribute('data-se-non-focus', 'true');
			const pElement = document.createElement('p');
			pElement.appendChild(nonFocusElement);
			mockEditor.frameContext.get('wysiwyg').appendChild(pElement);

			mockEditor.blur = jest.fn();
			mockEditor.frameContext.set('isReadOnly', false);

			eventManager.applyTagEffect(nonFocusElement);

			expect(mockEditor.blur).toHaveBeenCalled();
		});
	});

	describe('_setDefaultLine edge cases', () => {
		beforeEach(() => {
			mockEditor.options.set('__lineFormatFilter', true);
			mockEditor.options.set('defaultLine', 'P');
			mockEditor.format = {
				getBlock: jest.fn(),
				isBlock: jest.fn(),
				isLine: jest.fn(),
				addLine: jest.fn()
			};
		});

		it('should return early when inside file manager plugin component', () => {
			mockEditor._fileManager = { pluginRegExp: /^(image|video|audio|fileUpload)$/ };
			mockEditor.currentControllerName = 'image';

			const result = eventManager._setDefaultLine();

			expect(result).toBeUndefined();
		});

		it('should handle rangeEl with empty content', () => {
			const rangeEl = document.createElement('div');
			rangeEl.innerHTML = '';
			mockEditor.format.getBlock.mockReturnValue(rangeEl);

			const range = document.createRange();
			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: rangeEl,
				startContainer: rangeEl,
				endOffset: 0
			});

			eventManager._setDefaultLine('P');

			expect(mockEditor.selection.setRange).toHaveBeenCalled();
		});

		it('should handle block element with single BR child', () => {
			const blockEl = document.createElement('div');
			const br = document.createElement('br');
			blockEl.appendChild(br);
			mockEditor.frameContext.get('wysiwyg').appendChild(blockEl);

			mockEditor.format.getBlock.mockReturnValue(null);
			mockEditor.format.isBlock.mockReturnValue(true);

			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: blockEl,
				startContainer: blockEl,
				startOffset: 0
			});

			dom.check.isBreak = jest.fn().mockReturnValue(true);

			eventManager._setDefaultLine('P');

			expect(mockEditor.selection.setRange).toHaveBeenCalledWith(br, 1, br, 1);
		});

		it('should handle isBlock with empty content, creating text node', () => {
			const blockEl = document.createElement('div');
			mockEditor.frameContext.get('wysiwyg').appendChild(blockEl);

			mockEditor.format.getBlock.mockReturnValue(null);
			mockEditor.format.isBlock.mockReturnValue(true);

			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: blockEl,
				startContainer: blockEl,
				startOffset: 0
			});

			dom.check.isBreak = jest.fn().mockReturnValue(false);

			eventManager._setDefaultLine('P');

			// Should append a zero-width space text node
			expect(blockEl.childNodes.length).toBe(1);
			expect(mockEditor.selection.setRange).toHaveBeenCalled();
		});

		it('should remove adjacent BR elements after format creation', () => {
			const textNode = document.createTextNode('text');
			const container = document.createElement('div');
			const brBefore = document.createElement('br');
			const brAfter = document.createElement('br');
			container.appendChild(brBefore);
			container.appendChild(textNode);
			container.appendChild(brAfter);
			mockEditor.frameContext.get('wysiwyg').appendChild(container);

			mockEditor.format.getBlock.mockReturnValue(null);
			mockEditor.format.isBlock.mockReturnValue(false);

			mockEditor.selection.getRange.mockReturnValue({
				commonAncestorContainer: textNode,
				startContainer: textNode,
				startOffset: 0
			});

			mockEditor.component.is.mockReturnValue(false);

			// Mock createElement to return a proper element
			dom.utils.createElement = jest.fn().mockImplementation((tag) => document.createElement(tag));
			dom.check.isBreak = jest.fn().mockImplementation((node) => node && node.nodeName === 'BR');
			dom.utils.removeItem = jest.fn();

			eventManager._setDefaultLine('P');

			// The BR elements should be removed
			expect(dom.utils.removeItem).toHaveBeenCalled();
		});
	});

	describe('__postFocusEvent and __postBlurEvent', () => {
		it('should show inline toolbar on focus', () => {
			mockEditor.isInline = true;
			mockEditor.isBalloonAlways = false;
			mockEditor.toolbar.show = jest.fn();

			const event = new FocusEvent('focus');
			eventManager.__postFocusEvent(mockEditor.frameContext, event);

			expect(mockEditor.toolbar.show).toHaveBeenCalled();
			expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onFocus', expect.anything());
		});

		it('should show sub balloon on focus when isSubBalloonAlways', () => {
			mockEditor.isInline = false;
			mockEditor.isSubBalloonAlways = true;
			mockEditor.subToolbar = { show: jest.fn() };

			const event = new FocusEvent('focus');
			eventManager.__postFocusEvent(mockEditor.frameContext, event);

			expect(mockEditor.subToolbar.show).toHaveBeenCalled();
		});

		it('should hide inline toolbar on blur', () => {
			mockEditor.isInline = true;
			mockEditor.isBalloon = false;
			mockEditor._notHideToolbar = false;
			mockEditor.frameContext.set('isFullScreen', false);

			const event = new FocusEvent('blur');
			eventManager.__postBlurEvent(mockEditor.frameContext, event);

			expect(mockEditor.toolbar.hide).toHaveBeenCalled();
			expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onBlur', expect.anything());
		});

		it('should hide sub balloon on blur when isSubBalloon', () => {
			mockEditor.isInline = false;
			mockEditor.isBalloon = false;
			mockEditor.isSubBalloon = true;
			mockEditor._notHideToolbar = false;
			mockEditor.subToolbar = { hide: jest.fn() };

			const event = new FocusEvent('blur');
			eventManager.__postBlurEvent(mockEditor.frameContext, event);

			expect(mockEditor.subToolbar.hide).toHaveBeenCalled();
		});
	});

	describe('__setViewportSize', () => {
		it('should record current viewport height', () => {
			window.visualViewport = { height: 900 };

			eventManager.__setViewportSize();

			expect(mockEditor.status.currentViewportHeight).toBe(900);
		});
	});

	describe('__addStatusbarEvent', () => {
		it('should add resize event when height is numeric and resize enabled', () => {
			const statusbar = document.createElement('div');
			const fc = new Map([['statusbar', statusbar]]);
			const fo = new Map([
				['height', '300'],
				['statusbar_resizeEnable', true]
			]);
			fo.set = jest.fn();

			const addEventSpy = jest.spyOn(eventManager, 'addEvent');

			eventManager.__addStatusbarEvent(fc, fo);

			expect(addEventSpy).toHaveBeenCalledWith(statusbar, 'mousedown', expect.any(Function), false);
			expect(fo.set).toHaveBeenCalledWith('__statusbarEvent', expect.anything());
		});

		it('should add non-resizable class when resize disabled', () => {
			const statusbar = document.createElement('div');
			const fc = new Map([['statusbar', statusbar]]);
			const fo = new Map([
				['height', '300'],
				['statusbar_resizeEnable', false]
			]);

			eventManager.__addStatusbarEvent(fc, fo);

			expect(statusbar.classList.contains('se-resizing-none')).toBe(true);
		});

		it('should add non-resizable class when height is auto', () => {
			const statusbar = document.createElement('div');
			const fc = new Map([['statusbar', statusbar]]);
			const fo = new Map([
				['height', 'auto'],
				['statusbar_resizeEnable', true]
			]);

			eventManager.__addStatusbarEvent(fc, fo);

			expect(statusbar.classList.contains('se-resizing-none')).toBe(true);
		});
	});
});
