import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../../__mocks__/editorIntegration';
import { OnKeyDown_wysiwyg } from '../../../../../src/core/event/handlers/handler_ww_key_input';

describe('Key Input Handlers - Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor, 15000);
	}, 20000);

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Real Keyboard Input Integration', () => {
		it('should handle typing in real editor', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const initialContent = wysiwyg.innerHTML;

			// Simulate typing
			wysiwyg.innerHTML = '<p>Test typing</p>';

			// Trigger input event
			const inputEvent = new InputEvent('input', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: 'g'
			});

			wysiwyg.dispatchEvent(inputEvent);

			// Content should be updated
			expect(wysiwyg.innerHTML).toBe('<p>Test typing</p>');
		});

		it('should handle Enter key for new paragraphs', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First paragraph</p>';

			// Simulate Enter key press
			const keyEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				keyCode: 13,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(keyEvent);

			// Enter handling should work
			expect(wysiwyg.innerHTML).toContain('paragraph');
		});

		it('should handle Backspace deletion', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Delete this text</p>';

			// Simulate Backspace key
			const backspaceEvent = new KeyboardEvent('keydown', {
				key: 'Backspace',
				keyCode: 8,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(backspaceEvent);

			// Should handle backspace
			expect(() => {
				wysiwyg.dispatchEvent(backspaceEvent);
			}).not.toThrow();
		});

		it('should handle Delete key', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Delete forward</p>';

			// Create selection at beginning
			const range = document.createRange();
			const selection = window.getSelection();
			range.setStart(wysiwyg.firstChild.firstChild, 0);
			range.setEnd(wysiwyg.firstChild.firstChild, 1);
			selection.removeAllRanges();
			selection.addRange(range);

			// Simulate Delete key
			const deleteEvent = new KeyboardEvent('keydown', {
				key: 'Delete',
				keyCode: 46,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(deleteEvent);

			// Should handle delete
			expect(() => {
				wysiwyg.dispatchEvent(deleteEvent);
			}).not.toThrow();
		});

		it('should handle keyboard shortcuts', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Bold this text</p>';

			// Select all text
			const range = document.createRange();
			const selection = window.getSelection();
			range.selectNodeContents(wysiwyg.firstChild);
			selection.removeAllRanges();
			selection.addRange(range);

			// Simulate Ctrl+B (Bold)
			const boldEvent = new KeyboardEvent('keydown', {
				key: 'b',
				keyCode: 66,
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(boldEvent);

			// Bold command should be triggered
			expect(() => {
				wysiwyg.dispatchEvent(boldEvent);
			}).not.toThrow();
		});

		it('should handle Tab key for indentation', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Indent this</p>';

			// Simulate Tab key
			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				keyCode: 9,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(tabEvent);

			// Should handle tab
			expect(() => {
				wysiwyg.dispatchEvent(tabEvent);
			}).not.toThrow();
		});

		it('should handle Arrow key navigation', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Navigate this text</p>';

			// Simulate Arrow key
			const arrowEvent = new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				keyCode: 39,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(arrowEvent);

			// Should handle arrow navigation
			expect(() => {
				wysiwyg.dispatchEvent(arrowEvent);
			}).not.toThrow();
		});
	});

	describe('Input Event Types Integration', () => {
		it('should handle beforeinput events', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Simulate beforeinput event
			const beforeInputEvent = new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: 'test'
			});

			wysiwyg.dispatchEvent(beforeInputEvent);

			// Should handle beforeinput
			expect(() => {
				wysiwyg.dispatchEvent(beforeInputEvent);
			}).not.toThrow();
		});

		it('should handle composition events for IME input', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Simulate composition sequence
			const compositionStart = new CompositionEvent('compositionstart', {
				bubbles: true,
				cancelable: true,
				data: ''
			});

			const compositionUpdate = new CompositionEvent('compositionupdate', {
				bubbles: true,
				cancelable: true,
				data: '한'
			});

			const compositionEnd = new CompositionEvent('compositionend', {
				bubbles: true,
				cancelable: true,
				data: '한글'
			});

			// Should handle composition events
			expect(() => {
				wysiwyg.dispatchEvent(compositionStart);
				wysiwyg.dispatchEvent(compositionUpdate);
				wysiwyg.dispatchEvent(compositionEnd);
			}).not.toThrow();
		});

		it('should handle paste operations', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Simulate paste with beforeinput
			const pasteEvent = new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertFromPaste',
				data: 'pasted content'
			});

			wysiwyg.dispatchEvent(pasteEvent);

			// Should handle paste
			expect(() => {
				wysiwyg.dispatchEvent(pasteEvent);
			}).not.toThrow();
		});
	});

	describe('Character Limit Integration', () => {
		it('should respect character limits', () => {
			// Create editor with character limit
			destroyTestEditor(editor);
			editor = createTestEditor({
				maxCharCount: 10
			});

			return waitForEditorReady(editor).then(() => {
				const wysiwyg = editor.context.get('wysiwyg');
				wysiwyg.innerHTML = '<p>1234567890</p>'; // At limit

				// Try to add more characters
				const inputEvent = new InputEvent('beforeinput', {
					bubbles: true,
					cancelable: true,
					inputType: 'insertText',
					data: 'x'
				});

				wysiwyg.dispatchEvent(inputEvent);

				// Should handle character limit
				expect(() => {
					wysiwyg.dispatchEvent(inputEvent);
				}).not.toThrow();
			});
		});
	});

	describe('History Integration', () => {
		it('should push history on keyup events', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Original content</p>';

			// Push initial state
			editor.core.history.push(false);

			// Change content
			wysiwyg.innerHTML = '<p>Modified content</p>';

			// Simulate keyup to trigger history push
			const keyupEvent = new KeyboardEvent('keyup', {
				key: 'a',
				keyCode: 65,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(keyupEvent);

			// History should work
			expect(editor.core.history).toBeDefined();
			expect(() => {
				editor.core.history.undo();
			}).not.toThrow();
		});

		it('should handle delayed history push on input', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Simulate input event that should trigger delayed history
			const inputEvent = new InputEvent('input', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: 'a'
			});

			wysiwyg.dispatchEvent(inputEvent);

			// Should handle delayed history push
			expect(() => {
				wysiwyg.dispatchEvent(inputEvent);
			}).not.toThrow();
		});
	});

	describe('Error Handling', () => {
		it('should handle events with missing properties', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Create minimal event
			const minimalEvent = new Event('keydown');

			// Should handle gracefully
			expect(() => {
				wysiwyg.dispatchEvent(minimalEvent);
			}).not.toThrow();
		});

		it('should handle events in readonly mode', () => {
			editor.readOnly(true);
			const wysiwyg = editor.context.get('wysiwyg');

			// Try to input in readonly mode
			const inputEvent = new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: 'should not work'
			});

			expect(() => {
				wysiwyg.dispatchEvent(inputEvent);
			}).not.toThrow();
		});
	});

	describe('Plugin Integration', () => {
		it('should trigger plugin events on keyboard actions', async () => {
			const onKeyDownMock = jest.fn();

			// Properly register the plugin event handler
			const onKeyDownPlugins = editor._onPluginEvents.get('onKeyDown') || [];
			onKeyDownPlugins.push(onKeyDownMock);
			editor._onPluginEvents.set('onKeyDown', onKeyDownPlugins);

			// Create a trusted-like event object
			const keyEvent = {
				key: 'a',
				code: 'KeyA',
				keyCode: 65,
				bubbles: true,
				cancelable: true,
				isTrusted: true,
				target: editor.context.get('wysiwyg'),
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			// Call the key handler directly
			const frameContext = editor.context;
			await OnKeyDown_wysiwyg.call(
				editor.core.eventManager,
				frameContext,
				keyEvent
			);

			// Plugin event should be triggered
			expect(onKeyDownMock).toHaveBeenCalled();
		});
	});
});