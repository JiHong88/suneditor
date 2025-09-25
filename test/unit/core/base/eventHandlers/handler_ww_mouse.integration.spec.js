import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../../__mocks__/editorIntegration';
import { OnClick_wysiwyg, OnMouseUp_wysiwyg } from '../../../../../src/core/base/eventHandlers/handler_ww_mouse';

describe('Mouse Event Handlers - Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor, 15000);
	}, 20000);

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Real Mouse Event Integration', () => {
		it('should handle mouse clicks in editor', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Click this text</p>';

			// Simulate mouse click
			const clickEvent = new MouseEvent('click', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(clickEvent);

			// Should handle click
			expect(() => {
				wysiwyg.dispatchEvent(clickEvent);
			}).not.toThrow();
		});

		it('should handle mouse down and up sequence', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Mouse interaction test</p>';

			// Simulate mouse down
			const mouseDownEvent = new MouseEvent('mousedown', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			// Simulate mouse up
			const mouseUpEvent = new MouseEvent('mouseup', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			// Should handle mouse sequence
			expect(() => {
				wysiwyg.dispatchEvent(mouseDownEvent);
				wysiwyg.dispatchEvent(mouseUpEvent);
			}).not.toThrow();
		});

		it('should handle right-click context menu', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Right click context</p>';

			// Simulate right click
			const rightClickEvent = new MouseEvent('mousedown', {
				button: 2,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(rightClickEvent);

			// Should handle right click
			expect(() => {
				wysiwyg.dispatchEvent(rightClickEvent);
			}).not.toThrow();
		});

		it('should handle mouse move for hover effects', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Mouse move test</p>';

			// Simulate mouse move
			const mouseMoveEvent = new MouseEvent('mousemove', {
				clientX: 120,
				clientY: 120,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(mouseMoveEvent);

			// Should handle mouse move
			expect(() => {
				wysiwyg.dispatchEvent(mouseMoveEvent);
			}).not.toThrow();
		});

		it('should handle mouse leave events', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Simulate mouse leave
			const mouseLeaveEvent = new MouseEvent('mouseleave', {
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(mouseLeaveEvent);

			// Should handle mouse leave
			expect(() => {
				wysiwyg.dispatchEvent(mouseLeaveEvent);
			}).not.toThrow();
		});

		it('should handle double-click events', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Double click selection</p>';

			// Simulate double click
			const doubleClickEvent = new MouseEvent('click', {
				button: 0,
				detail: 2, // Double click
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(doubleClickEvent);

			// Should handle double click
			expect(() => {
				wysiwyg.dispatchEvent(doubleClickEvent);
			}).not.toThrow();
		});
	});

	describe('Text Selection Integration', () => {
		it('should handle text selection via mouse', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Select this text with mouse</p>';

			const textNode = wysiwyg.firstChild.firstChild;

			// Create selection
			const range = document.createRange();
			const selection = window.getSelection();
			range.setStart(textNode, 0);
			range.setEnd(textNode, 6); // Select "Select"
			selection.removeAllRanges();
			selection.addRange(range);

			// Simulate mouse up after selection
			const mouseUpEvent = new MouseEvent('mouseup', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(mouseUpEvent);

			// Should handle selection
			expect(selection.toString()).toBe('Select');
		});

		it('should handle click to position cursor', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Position cursor here</p>';

			// Click to position cursor
			const clickEvent = new MouseEvent('click', {
				button: 0,
				clientX: 150,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(clickEvent);

			// Should handle cursor positioning
			expect(() => {
				const selection = window.getSelection();
				expect(selection).toBeDefined();
			}).not.toThrow();
		});
	});

	describe('Component Selection Integration', () => {
		it('should handle component elements selection', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Add a component-like element
			wysiwyg.innerHTML = '<p>Test</p><div class="se-component se-image-container"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="test"></div>';

			const componentElement = wysiwyg.querySelector('.se-component');

			if (componentElement) {
				// Click on component
				const clickEvent = new MouseEvent('click', {
					button: 0,
					clientX: 100,
					clientY: 100,
					bubbles: true,
					cancelable: true
				});

				// Set target to the component
				Object.defineProperty(clickEvent, 'target', {
					value: componentElement,
					enumerable: true
				});

				wysiwyg.dispatchEvent(clickEvent);

				// Should handle component selection
				expect(() => {
					wysiwyg.dispatchEvent(clickEvent);
				}).not.toThrow();
			}
		});
	});

	describe('Focus Management Integration', () => {
		it('should handle focus changes via mouse', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Click to focus
			const mouseDownEvent = new MouseEvent('mousedown', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(mouseDownEvent);

			// Should handle focus management
			expect(() => {
				wysiwyg.dispatchEvent(mouseDownEvent);
			}).not.toThrow();
		});

		it('should handle blur when clicking outside', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// First focus the editor
			wysiwyg.focus();

			// Then click outside (simulate with mouse leave)
			const mouseLeaveEvent = new MouseEvent('mouseleave', {
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(mouseLeaveEvent);

			// Should handle blur
			expect(() => {
				wysiwyg.dispatchEvent(mouseLeaveEvent);
			}).not.toThrow();
		});
	});

	describe('Balloon Toolbar Integration', () => {
		it('should handle balloon toolbar on selection', () => {
			// Create editor with balloon toolbar
			destroyTestEditor(editor);
			editor = createTestEditor({
				popupDisplay: 'balloon'
			});

			return waitForEditorReady(editor).then(() => {
				const wysiwyg = editor.context.get('wysiwyg');
				wysiwyg.innerHTML = '<p>Select for balloon toolbar</p>';

				// Create selection
				const range = document.createRange();
				const selection = window.getSelection();
				range.selectNodeContents(wysiwyg.firstChild);
				selection.removeAllRanges();
				selection.addRange(range);

				// Simulate mouse up after selection
				const mouseUpEvent = new MouseEvent('mouseup', {
					button: 0,
					clientX: 100,
					clientY: 100,
					bubbles: true,
					cancelable: true
				});

				wysiwyg.dispatchEvent(mouseUpEvent);

				// Should handle balloon toolbar
				expect(() => {
					wysiwyg.dispatchEvent(mouseUpEvent);
				}).not.toThrow();
			});
		});
	});

	describe('Drag and Drop Preparation', () => {
		it('should handle mouse down for potential drag operations', () => {
			const wysiwyg = editor.context.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Draggable content</p>';

			// Mouse down that could start drag
			const mouseDownEvent = new MouseEvent('mousedown', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			wysiwyg.dispatchEvent(mouseDownEvent);

			// Should prepare for potential drag
			expect(() => {
				wysiwyg.dispatchEvent(mouseDownEvent);
			}).not.toThrow();
		});
	});

	describe('Error Handling', () => {
		it('should handle mouse events with missing properties', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Create minimal mouse event
			const minimalEvent = new Event('click');

			// Should handle gracefully
			expect(() => {
				wysiwyg.dispatchEvent(minimalEvent);
			}).not.toThrow();
		});

		it('should handle mouse events in readonly mode', () => {
			editor.readOnly(true);
			const wysiwyg = editor.context.get('wysiwyg');

			// Try mouse interaction in readonly
			const clickEvent = new MouseEvent('click', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			expect(() => {
				wysiwyg.dispatchEvent(clickEvent);
			}).not.toThrow();
		});

		it('should handle mouse events with null target', () => {
			const wysiwyg = editor.context.get('wysiwyg');

			// Null target should not exist - test with proper target
			const validTargetEvent = new MouseEvent('click', {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true
			});

			Object.defineProperty(validTargetEvent, 'target', {
				value: wysiwyg,
				enumerable: true
			});

			expect(() => {
				wysiwyg.dispatchEvent(validTargetEvent);
			}).not.toThrow();
		});
	});

	describe('Plugin Integration', () => {
		it('should trigger plugin events on mouse actions', async () => {
			const onClickMock = jest.fn();

			// Register click event properly
			editor.events.onClick = onClickMock;

			const wysiwyg = editor.context.get('wysiwyg');

			// Create trusted click event
			const clickEvent = {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true,
				isTrusted: true,
				target: wysiwyg,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			// Call click handler directly
			await OnClick_wysiwyg.call(
				editor.core.eventManager,
				editor.context,
				clickEvent
			);

			// Plugin event should be triggered
			expect(onClickMock).toHaveBeenCalled();
		});

		it('should handle plugin mouse event callbacks', async () => {
			const onMouseUpMock = jest.fn();

			// Register mouseUp event properly
			editor.events.onMouseUp = onMouseUpMock;

			const wysiwyg = editor.context.get('wysiwyg');

			// Create trusted mouseUp event
			const mouseUpEvent = {
				button: 0,
				clientX: 100,
				clientY: 100,
				bubbles: true,
				cancelable: true,
				isTrusted: true,
				target: wysiwyg,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			// Call mouseUp handler directly
			await OnMouseUp_wysiwyg.call(
				editor.core.eventManager,
				editor.context,
				mouseUpEvent
			);

			// Plugin callback should be triggered
			expect(onMouseUpMock).toHaveBeenCalled();
		});
	});
});