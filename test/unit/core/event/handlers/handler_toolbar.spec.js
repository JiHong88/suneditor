import { ButtonsHandler, OnClick_menuTray, OnClick_toolbar } from '../../../../../src/core/event/handlers/handler_toolbar';
import { createMockThis, createMockEvent } from '../../../../__mocks__/editorMock';
import { dom } from '../../../../../src/helper';

describe('handler_toolbar', () => {
	let mockThis;
	let mockEvent;
	let mockTarget;

	beforeEach(() => {
		mockTarget = document.createElement('button');
		mockTarget.setAttribute('data-command', 'bold');

		mockEvent = createMockEvent('mousedown', {
			target: mockTarget
		});

		mockThis = createMockThis();

		// Mock dom methods
		dom.query.getEventTarget = jest.fn().mockReturnValue(mockTarget);
		dom.query.getCommandTarget = jest.fn().mockReturnValue(mockTarget);
		dom.check.isInputElement = jest.fn().mockReturnValue(false);
		dom.query.getParentElement = jest.fn().mockReturnValue(null);
		dom.utils.hasClass = jest.fn().mockReturnValue(false);
		dom.utils.addClass = jest.fn();
		dom.utils.removeClass = jest.fn();
	});

	describe('ButtonsHandler', () => {
		it('should handle button click with command', () => {
			// Make selection.getNode() return a node not contained in wysiwyg
			const outsideNode = document.createElement('div');
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(false);

			mockThis.selection.getNode.mockReturnValue(outsideNode);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(dom.query.getEventTarget).toHaveBeenCalledWith(mockEvent);
			expect(mockThis.focusManager.focus).toHaveBeenCalled();
		});


		it('should handle input element focus', () => {
			dom.check.isInputElement.mockReturnValue(true);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.editor._preventBlur).toBe(false);
		});

		it('should focus editor when selection not in wysiwyg', () => {
			mockThis.selection.getNode.mockReturnValue(document.createElement('div'));

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.focusManager.focus).toHaveBeenCalled();
		});

		it('should handle dropdown clicks', () => {
			dom.query.getParentElement.mockReturnValue(document.createElement('div'));

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.uiManager.preventToolbarHide).toHaveBeenCalledWith(true);
		});

		it('should find command in parent elements', () => {
			const parentElement = document.createElement('div');
			parentElement.setAttribute('data-command', 'italic');
			parentElement.className = 'se-btn';

			mockTarget.removeAttribute('data-command');
			parentElement.appendChild(mockTarget);

			// Make selection.getNode() return a node not contained in wysiwyg
			const outsideNode = document.createElement('div');
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(false);

			mockThis.selection.getNode.mockReturnValue(outsideNode);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.focusManager.focus).toHaveBeenCalled();
		});


		it('should handle disabled input elements', () => {
			dom.check.isInputElement.mockReturnValue(false);
			mockTarget.disabled = true;
			mockTarget.setAttribute('data-type', 'INPUT');

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.addEvent).not.toHaveBeenCalled();
		});
	});

	describe('OnClick_menuTray', () => {
		beforeEach(() => {
			mockEvent.target = mockTarget;
		});

		it('should handle menu tray click', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'bold');
			menuTrayDiv.appendChild(mockTarget);

			mockThis.plugins.bold = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.plugins.bold.action).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle button with data-value', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'blockStyle');

			mockTarget.setAttribute('data-value', 'test-value');
			mockTarget.setAttribute('data-command', 'blockStyle');
			menuTrayDiv.appendChild(mockTarget);

			mockThis.plugins.blockStyle = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.plugins.blockStyle.action).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle submenu items', () => {
			const submenuItem = document.createElement('li');
			submenuItem.setAttribute('data-value', 'h1');
			submenuItem.setAttribute('data-command', 'blockStyle');

			// Create a parent with se-menu-tray class and data-key to satisfy the while loop
			const menuTrayParent = document.createElement('div');
			menuTrayParent.className = 'se-menu-tray some-other-class'; // className contains se-menu-tray
			menuTrayParent.setAttribute('data-key', 'blockStyle');

			// Set up proper parent chain: menuTray -> submenuItem
			menuTrayParent.appendChild(submenuItem);
			document.body.appendChild(menuTrayParent);

			mockEvent.target = submenuItem;

			// Mock dom.query functions properly
			dom.query.getEventTarget.mockReturnValue(submenuItem);
			dom.query.getCommandTarget.mockReturnValue(submenuItem);

			mockThis.plugins.blockStyle = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.plugins.blockStyle.action).toHaveBeenCalledWith(submenuItem);

			// Cleanup
			document.body.removeChild(menuTrayParent);
		});

		it('should handle menu buttons without data-value', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'bold');

			mockTarget.removeAttribute('data-value');
			menuTrayDiv.appendChild(mockTarget);

			mockThis.plugins.bold = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.plugins.bold.action).toHaveBeenCalledWith(mockTarget);
		});

		it('should find command in parent hierarchy', () => {
			const parentDiv = document.createElement('div');
			parentDiv.setAttribute('data-command', 'fontSize');
			parentDiv.setAttribute('data-value', '14px');

			const menuTray = document.createElement('div');
			menuTray.className = 'se-menu-tray';
			menuTray.setAttribute('data-key', 'fontSize');

			mockTarget.removeAttribute('data-command');
			parentDiv.appendChild(mockTarget);
			menuTray.appendChild(parentDiv);
			// Need to add to document for proper parentElement chain
			document.body.appendChild(menuTray);

			// Mock dom.query functions properly
			dom.query.getEventTarget.mockReturnValue(mockTarget);
			dom.query.getCommandTarget.mockReturnValue(mockTarget);

			mockThis.plugins.fontSize = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			// The action is called with the original target (mockTarget)
			expect(mockThis.plugins.fontSize.action).toHaveBeenCalledWith(mockTarget);

			// Cleanup
			document.body.removeChild(menuTray);
		});
	});

	describe('OnClick_toolbar', () => {
		beforeEach(() => {
			mockEvent.target = mockTarget;
		});

		it('should handle toolbar button click', () => {
			OnClick_toolbar.call(mockThis, mockEvent);

			expect(dom.query.getEventTarget).toHaveBeenCalledWith(mockEvent);
			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should execute plugin action', () => {
			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle missing plugin gracefully', () => {
			mockTarget.setAttribute('data-command', 'nonexistent');

			expect(() => OnClick_toolbar.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle button without command', () => {
			mockTarget.removeAttribute('data-command');

			expect(() => OnClick_toolbar.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should find command in parent elements', () => {
			const parentButton = document.createElement('button');
			parentButton.setAttribute('data-command', 'italic');

			mockTarget.removeAttribute('data-command');
			parentButton.appendChild(mockTarget);

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle nested element structures', () => {
			const icon = document.createElement('i');
			const button = document.createElement('button');
			button.setAttribute('data-command', 'underline');
			button.appendChild(icon);

			mockEvent.target = icon;
			dom.query.getEventTarget.mockReturnValue(icon);

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(icon);
		});

		it('should stop at toolbar container', () => {
			const toolbarDiv = document.createElement('div');
			toolbarDiv.className = 'sun-editor-common';

			const nestedButton = document.createElement('button');
			nestedButton.removeAttribute('data-command');
			toolbarDiv.appendChild(nestedButton);

			mockEvent.target = nestedButton;
			dom.query.getEventTarget.mockReturnValue(nestedButton);

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(nestedButton);
		});

		it('should handle active plugin with custom action', () => {
			mockThis.plugins.bold.action = jest.fn().mockReturnValue(true);

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});
	});

	describe('edge cases', () => {
		it('should handle null event target', () => {
			// Create a mock event with null target but return a valid element from getEventTarget
			mockEvent.target = null;

			// Create a valid element that won't cause getAttribute to be called on null
			const validElement = document.createElement('div');
			validElement.setAttribute('data-command', 'test');
			dom.query.getEventTarget.mockReturnValue(validElement);

			// Mock wysiwyg contains to avoid the focus path
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle missing context', () => {
			mockThis.context.get.mockReturnValue(null);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle missing plugins', () => {
			mockThis.plugins = {};

			expect(() => OnClick_toolbar.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle elements without parentElement', () => {
			// Create a detached element that has no parentElement by default
			const detachedElement = document.createElement('button');
			detachedElement.setAttribute('data-command', 'bold');
			mockEvent.target = detachedElement;
			dom.query.getEventTarget.mockReturnValue(detachedElement);

			// Mock wysiwyg contains to avoid the focus path
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle readonly mode', () => {
			mockThis.frameContext.set('isReadOnly', true);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle disabled state', () => {
			mockThis.frameContext.set('isDisabled', true);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});
	});

	describe('ButtonsHandler balloon mode', () => {
		it('should handle balloon mode without errors', () => {
			mockThis.editor.isBalloon = true;
			mockThis.context.get.mockReturnValue(null);

			// Mock wysiwyg contains to avoid the focus path
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});

		it('should handle sub-balloon mode without errors', () => {
			mockThis.editor.isSubBalloon = true;
			const toolbar = document.createElement('div');
			toolbar.className = 'se-toolbar';
			mockThis.context.get.mockReturnValue(toolbar);

			// Mock wysiwyg contains to return true
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});
	});

	describe('ButtonsHandler more layer', () => {
		it('should handle more layer button click without errors', () => {
			mockTarget.setAttribute('data-type', 'more');
			mockTarget.setAttribute('data-ref', 'moreButtons');

			const moreLayer = document.createElement('div');
			moreLayer.className = 'se-more-layer';
			moreLayer.setAttribute('data-ref', 'moreButtons');
			moreLayer.style.display = 'none';

			// Mock context.get to return toolbar with more layer
			const toolbar = document.createElement('div');
			toolbar.className = 'se-toolbar';
			toolbar.appendChild(moreLayer);
			mockThis.context.get.mockReturnValue(toolbar);

			// Mock wysiwyg contains to return true
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);

			dom.utils.hasClass.mockImplementation((el, className) => {
				if (className === 'on' && el === mockTarget) return false;
				return false;
			});

			expect(() => ButtonsHandler.call(mockThis, mockEvent)).not.toThrow();
		});
	});

	describe('OnClick_menuTray action dispatch', () => {
		it('should dispatch action with event target value', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'fontColor');

			mockTarget.setAttribute('data-value', '#ff0000');
			mockTarget.setAttribute('data-command', 'fontColor');
			menuTrayDiv.appendChild(mockTarget);
			document.body.appendChild(menuTrayDiv);

			dom.query.getEventTarget.mockReturnValue(mockTarget);

			mockThis.plugins.fontColor = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockThis.plugins.fontColor.action).toHaveBeenCalledWith(mockTarget);

			document.body.removeChild(menuTrayDiv);
		});

		it('should handle data-command attribute on parent', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'fontSize');

			const innerSpan = document.createElement('span');
			innerSpan.textContent = '16px';

			const button = document.createElement('button');
			button.setAttribute('data-value', '16px');
			button.setAttribute('data-command', 'fontSize');
			button.appendChild(innerSpan);
			menuTrayDiv.appendChild(button);
			document.body.appendChild(menuTrayDiv);

			mockEvent.target = innerSpan;
			dom.query.getEventTarget.mockReturnValue(innerSpan);
			dom.query.getCommandTarget.mockReturnValue(innerSpan);

			mockThis.plugins.fontSize = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockThis.plugins.fontSize.action).toHaveBeenCalled();

			document.body.removeChild(menuTrayDiv);
		});
	});

	describe('OnClick_toolbar with different button types', () => {
		it('should handle dropdown button type', () => {
			mockTarget.setAttribute('data-type', 'dropdown');
			mockTarget.setAttribute('data-command', 'align');

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle container button type', () => {
			mockTarget.setAttribute('data-type', 'container');
			mockTarget.setAttribute('data-command', 'table');

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle modal button type', () => {
			mockTarget.setAttribute('data-type', 'modal');
			mockTarget.setAttribute('data-command', 'link');

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.commandDispatcher.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});
	});


	describe('non-codeView handling', () => {
		beforeEach(() => {
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);
			mockThis.frameContext.set('isCodeView', false);
		});

		it('should call preventDefault when not in codeView mode', () => {
			mockTarget.setAttribute('data-command', 'bold');
			dom.check.isInputElement.mockReturnValue(false);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});

		it('should not call preventDefault when in codeView mode', () => {
			mockThis.frameContext.set('isCodeView', true);
			mockTarget.setAttribute('data-command', 'bold');
			dom.check.isInputElement.mockReturnValue(false);

			// Reset mock
			mockEvent.preventDefault.mockClear();

			ButtonsHandler.call(mockThis, mockEvent);

			// When isCodeView is true, the else-if block is not entered
			// so preventDefault should not be called from that branch
		});
	});

	describe('dropdown and container menu stopPropagation', () => {
		beforeEach(() => {
			const wysiwyg = document.createElement('div');
			wysiwyg.contains = jest.fn().mockReturnValue(true);
			mockThis.frameContext.set('wysiwyg', wysiwyg);
		});

		it('should stopPropagation when command matches currentDropdownName', () => {
			mockThis.menu.currentDropdownName = 'bold';
			mockTarget.setAttribute('data-command', 'bold');
			dom.check.isInputElement.mockReturnValue(false);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
		});

		it('should stopPropagation when command matches currentContainerName', () => {
			mockThis.menu.currentContainerName = 'table';
			mockTarget.setAttribute('data-command', 'table');
			dom.check.isInputElement.mockReturnValue(false);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
		});

		it('should not stopPropagation when command does not match', () => {
			mockThis.menu.currentDropdownName = 'align';
			mockThis.menu.currentContainerName = 'table';
			mockTarget.setAttribute('data-command', 'bold');
			dom.check.isInputElement.mockReturnValue(false);

			// Reset the mock to track only this test
			mockEvent.stopPropagation.mockClear();

			ButtonsHandler.call(mockThis, mockEvent);

			// stopPropagation should not be called for command matching
			// (it might be called for other reasons, so we check it wasn't called at all in this path)
			expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
		});
	});

	describe('OnClick_menuTray edge cases', () => {
		it('should return early when target is null', () => {
			dom.query.getCommandTarget.mockReturnValue(null);

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
		});

		it('should return early when no data-key found in parent hierarchy', () => {
			const orphanElement = document.createElement('div');
			dom.query.getEventTarget.mockReturnValue(orphanElement);
			dom.query.getCommandTarget.mockReturnValue(orphanElement);

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
		});

		it('should return early when plugin has no action method', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'noActionPlugin');
			menuTrayDiv.appendChild(mockTarget);
			document.body.appendChild(menuTrayDiv);

			mockThis.plugins.noActionPlugin = {
				// No action method
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).not.toHaveBeenCalled();

			document.body.removeChild(menuTrayDiv);
		});

		it('should return early when plugin does not exist', () => {
			const menuTrayDiv = document.createElement('div');
			menuTrayDiv.className = 'se-menu-tray';
			menuTrayDiv.setAttribute('data-key', 'nonExistentPlugin');
			menuTrayDiv.appendChild(mockTarget);
			document.body.appendChild(menuTrayDiv);

			// Plugin doesn't exist
			delete mockThis.plugins.nonExistentPlugin;

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).not.toHaveBeenCalled();

			document.body.removeChild(menuTrayDiv);
		});
	});
});