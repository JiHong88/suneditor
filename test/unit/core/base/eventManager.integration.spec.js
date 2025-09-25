import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { OnKeyDown_wysiwyg } from '../../../../src/core/base/eventHandlers/handler_ww_key_input';
import { OnInput_wysiwyg } from '../../../../src/core/base/eventHandlers/handler_ww_key_input';

describe('EventManager - Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor, 15000); // Increase timeout to 15 seconds
	}, 20000); // Set hook timeout to 20 seconds

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Real Editor Integration', () => {
		it('should create eventManager instance with real editor', () => {
			expect(editor.eventManager).toBeDefined();
			expect(typeof editor.eventManager.addEvent).toBe('function');
			expect(typeof editor.eventManager.removeEvent).toBe('function');
			expect(typeof editor.eventManager.applyTagEffect).toBe('function');
		});

		it('should handle real keydown events', async () => {
			const wysiwyg = editor.context.get('wysiwyg');
			const onKeyDownMock = jest.fn();

			// Register the event callback properly in editor.events
			editor.events.onKeyDown = onKeyDownMock;

			// Create trusted keyboard event
			const keyEvent = {
				key: 'a',
				code: 'KeyA',
				keyCode: 65,
				bubbles: true,
				cancelable: true,
				isTrusted: true,
				target: wysiwyg,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			// Call handler directly
			await OnKeyDown_wysiwyg.call(editor.core.eventManager, editor.context, keyEvent);

			// User event should be triggered
			expect(onKeyDownMock).toHaveBeenCalled();
		});

		it('should handle real mouse events', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Create and dispatch a real mouse event
			const mouseEvent = new MouseEvent('mousedown', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			// Should not throw when handling real events
			expect(() => {
				wysiwyg.dispatchEvent(mouseEvent);
			}).not.toThrow();
		});

		it('should handle clipboard operations', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Create mock clipboard event since ClipboardEvent might not be available in test environment
			const mockClipboardData = {
				getData: jest.fn((type) => (type === 'text/plain' ? 'Test paste content' : '')),
				setData: jest.fn(),
				types: ['text/plain'],
				items: []
			};

			const clipboardEvent = new Event('paste', {
				bubbles: true,
				cancelable: true
			});

			// Add clipboardData property
			Object.defineProperty(clipboardEvent, 'clipboardData', {
				value: mockClipboardData,
				writable: false
			});

			// Should handle paste event
			expect(() => {
				wysiwyg.dispatchEvent(clipboardEvent);
			}).not.toThrow();
		});

		it('should apply tag effects to real content', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Set some content
			wysiwyg.innerHTML = '<p>Test content</p>';

			// Apply tag effect should work with real DOM
			expect(() => {
				editor.eventManager.applyTagEffect();
			}).not.toThrow();

			// Content should still be there
			expect(wysiwyg.innerHTML).toContain('Test content');
		});

		it('should handle focus and blur events', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Create focus event
			const focusEvent = new FocusEvent('focus', {
				bubbles: true,
				cancelable: true
			});

			// Create blur event
			const blurEvent = new FocusEvent('blur', {
				bubbles: true,
				cancelable: true
			});

			// Should handle both events
			expect(() => {
				wysiwyg.dispatchEvent(focusEvent);
				wysiwyg.dispatchEvent(blurEvent);
			}).not.toThrow();
		});

		it('should handle selection changes', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test selection content</p>';

			// Create a selection
			const range = document.createRange();
			const selection = window.getSelection();
			range.selectNodeContents(wysiwyg.firstChild);
			selection.removeAllRanges();
			selection.addRange(range);

			// Apply tag effect should work with real selection
			expect(() => {
				editor.eventManager.applyTagEffect();
			}).not.toThrow();
		});

		it('should handle input composition events', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Composition start
			const compositionStart = new CompositionEvent('compositionstart', {
				bubbles: true,
				cancelable: true,
				data: ''
			});

			// Composition update
			const compositionUpdate = new CompositionEvent('compositionupdate', {
				bubbles: true,
				cancelable: true,
				data: 'test'
			});

			// Composition end
			const compositionEnd = new CompositionEvent('compositionend', {
				bubbles: true,
				cancelable: true,
				data: 'test'
			});

			// Should handle composition events
			expect(() => {
				wysiwyg.dispatchEvent(compositionStart);
				wysiwyg.dispatchEvent(compositionUpdate);
				wysiwyg.dispatchEvent(compositionEnd);
			}).not.toThrow();
		});

		it('should handle drag and drop events', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Create drag event
			const dragEvent = new DragEvent('dragover', {
				bubbles: true,
				cancelable: true,
				clientX: 100,
				clientY: 100
			});

			// Mock dataTransfer
			Object.defineProperty(dragEvent, 'dataTransfer', {
				value: {
					types: ['text/plain'],
					files: [],
					getData: () => 'test data',
					setData: () => {},
					dropEffect: 'copy'
				}
			});

			// Should handle drag events
			expect(() => {
				wysiwyg.dispatchEvent(dragEvent);
			}).not.toThrow();
		});

		it('should handle toolbar events', () => {
			const toolbar = editor.context.get('toolbar');

			if (toolbar) {
				// Find a button in toolbar
				const boldButton = toolbar.querySelector('[data-command="bold"], .se-btn-bold');

				if (boldButton) {
					// Create click event
					const clickEvent = new MouseEvent('click', {
						bubbles: true,
						cancelable: true
					});

					// Should handle toolbar button clicks
					expect(() => {
						boldButton.dispatchEvent(clickEvent);
					}).not.toThrow();
				}
			}
		});
	});

	describe('Event Manager State', () => {
		it('should maintain event listeners through editor lifecycle', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Verify event listeners are attached
			expect(wysiwyg.onkeydown).toBeDefined();
			expect(wysiwyg.onkeyup).toBeDefined();
			expect(wysiwyg.onmousedown).toBeDefined();
			expect(wysiwyg.onmouseup).toBeDefined();
		});

		it('should handle editor state changes', () => {
			// Test readonly mode
			editor.readOnly(true);
			expect(editor.core.eventManager).toBeDefined();

			// Test back to edit mode
			editor.readOnly(false);
			expect(editor.core.eventManager).toBeDefined();
		});

		it('should handle frame context switching', () => {
			const currentFrame = editor.currentFrame;
			expect(currentFrame).toBeDefined();
			expect(currentFrame.has('wysiwyg')).toBe(true);

			// EventManager should work with frame context
			expect(() => {
				editor.eventManager.applyTagEffect();
			}).not.toThrow();
		});
	});

	describe('Plugin Integration', () => {
		it('should handle plugin events through eventManager', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Set some content and trigger plugin events
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';

			// Should handle plugin-related events
			expect(() => {
				editor.eventManager.applyTagEffect();
			}).not.toThrow();
		});

		it('should trigger plugin callbacks on events', async () => {
			const onInputMock = jest.fn();

			// Register the input event callback
			editor.events.onInput = onInputMock;

			const wysiwyg = editor.context.get('wysiwyg');

			// Create trusted input event
			const inputEvent = {
				data: 'a',
				bubbles: true,
				cancelable: true,
				isTrusted: true,
				target: wysiwyg,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			// Call input handler directly
			await OnInput_wysiwyg.call(editor.core.eventManager, editor.context, inputEvent);

			// Plugin callback should be triggered
			expect(onInputMock).toHaveBeenCalled();
		});
	});
});
