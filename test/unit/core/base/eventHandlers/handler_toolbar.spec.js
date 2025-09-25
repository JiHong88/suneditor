import { ButtonsHandler, OnClick_menuTray, OnClick_toolbar } from '../../../../../src/core/base/eventHandlers/handler_toolbar';
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
			expect(mockThis.editor.focus).toHaveBeenCalled();
		});

		it('should handle sub-balloon toolbar hiding', () => {
			mockThis.editor.isSubBalloon = true;
			mockThis.context.get.mockReturnValue(null);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis._hideToolbar_sub).toHaveBeenCalled();
		});

		it('should handle input element focus', () => {
			dom.check.isInputElement.mockReturnValue(true);

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.editor._preventBlur).toBe(false);
		});

		it('should focus editor when selection not in wysiwyg', () => {
			mockThis.selection.getNode.mockReturnValue(document.createElement('div'));

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.editor.focus).toHaveBeenCalled();
		});

		it('should handle dropdown clicks', () => {
			dom.query.getParentElement.mockReturnValue(document.createElement('div'));

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.editor._notHideToolbar).toBe(true);
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

			expect(mockThis.editor.focus).toHaveBeenCalled();
		});

		it('should handle input plugin activation', () => {
			dom.check.isInputElement.mockReturnValue(true);
			mockTarget.setAttribute('data-type', 'INPUT');
			mockThis.status.hasFocus = false;

			ButtonsHandler.call(mockThis, mockEvent);

			expect(mockThis.editor._preventBlur).toBe(true);
			expect(mockThis._inputFocus).toBe(true);
			expect(mockThis.applyTagEffect).toHaveBeenCalled();
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
			menuTrayDiv.setAttribute('data-key', 'formatBlock');

			mockTarget.setAttribute('data-value', 'test-value');
			mockTarget.setAttribute('data-command', 'formatBlock');
			menuTrayDiv.appendChild(mockTarget);

			mockThis.plugins.formatBlock = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.plugins.formatBlock.action).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle submenu items', () => {
			const submenuItem = document.createElement('li');
			submenuItem.setAttribute('data-value', 'h1');
			submenuItem.setAttribute('data-command', 'formatBlock');

			// Create a parent with se-menu-tray class and data-key to satisfy the while loop
			const menuTrayParent = document.createElement('div');
			menuTrayParent.className = 'se-menu-tray some-other-class'; // className contains se-menu-tray
			menuTrayParent.setAttribute('data-key', 'formatBlock');

			// Set up proper parent chain: menuTray -> submenuItem
			menuTrayParent.appendChild(submenuItem);
			document.body.appendChild(menuTrayParent);

			mockEvent.target = submenuItem;

			// Mock dom.query functions properly
			dom.query.getEventTarget.mockReturnValue(submenuItem);
			dom.query.getCommandTarget.mockReturnValue(submenuItem);

			mockThis.plugins.formatBlock = {
				action: jest.fn()
			};

			OnClick_menuTray.call(mockThis, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockThis.plugins.formatBlock.action).toHaveBeenCalledWith(submenuItem);

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
			expect(mockThis.editor.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should execute plugin action', () => {
			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.runFromTarget).toHaveBeenCalledWith(mockTarget);
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

			expect(mockThis.editor.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});

		it('should handle nested element structures', () => {
			const icon = document.createElement('i');
			const button = document.createElement('button');
			button.setAttribute('data-command', 'underline');
			button.appendChild(icon);

			mockEvent.target = icon;
			dom.query.getEventTarget.mockReturnValue(icon);

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.runFromTarget).toHaveBeenCalledWith(icon);
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

			expect(mockThis.editor.runFromTarget).toHaveBeenCalledWith(nestedButton);
		});

		it('should handle active plugin with custom action', () => {
			mockThis.plugins.bold.action = jest.fn().mockReturnValue(true);

			OnClick_toolbar.call(mockThis, mockEvent);

			expect(mockThis.editor.runFromTarget).toHaveBeenCalledWith(mockTarget);
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
});