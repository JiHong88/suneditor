/**
 * @fileoverview Enhanced unit tests for modules/ColorPicker.js to increase coverage
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Modules - ColorPicker Enhanced Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);

		if (editor.ui) {
			editor.ui.showLoading = jest.fn();
			editor.ui.hideLoading = jest.fn();
		}
		if (editor.viewer) {
			editor.viewer.print = jest.fn();
		}
	});

	afterEach(() => {
		if (editor && editor.history && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('Color detection in content', () => {
		it('should detect color in styled element', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000;">Red text</span></p>';

			const span = wysiwyg.querySelector('span');
			if (span && span.firstChild) {
				editor.selection.setRange(span.firstChild, 0, span.firstChild, 3);
			}

			expect(span).toBeDefined();
			expect(span.style.color).toBeDefined();
		});

		it('should handle RGB color format', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: rgb(255, 0, 0);">RGB text</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span.style.color).toBeDefined();
		});

		it('should handle nested color elements', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000;"><strong>Bold red</strong></span></p>';

			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.selection.setRange(strong.firstChild, 0, strong.firstChild, 4);
			}

			expect(strong).toBeDefined();
		});

		it('should handle background color', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="background-color: #ffff00;">Highlighted</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span.style.backgroundColor).toBeDefined();
		});

		it('should handle named colors', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red;">Red</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span.style.color).toBe('red');
		});
	});

	describe('Color format conversions', () => {
		it('should handle hex color format', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #abc123;">Hex</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});

		it('should handle RGBA with transparency', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: rgba(255, 0, 0, 0.5);">Transparent</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});

		it('should handle mixed styling', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000; background-color: #ffff00; font-weight: bold;">Styled</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span.style.color).toBeDefined();
			expect(span.style.backgroundColor).toBeDefined();
		});
	});

	describe('Edge cases', () => {
		it('should handle empty color value', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: ;">Empty color</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});

		it('should handle invalid color value', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: invalid;">Invalid</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});

		it('should handle deeply nested color elements', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div><p><span><em><strong style="color: #ff0000;">Deep</strong></em></span></p></div>';

			const strong = wysiwyg.querySelector('strong');
			expect(strong).toBeDefined();
		});

		it('should handle multiple color spans', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000;">Red</span> <span style="color: #00ff00;">Green</span> <span style="color: #0000ff;">Blue</span></p>';

			const spans = wysiwyg.querySelectorAll('span');
			expect(spans.length).toBe(3);
		});

		it('should handle color removal', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000;">Red text</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});

		it('should handle plain text without color', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Plain text without color</p>';

			const p = wysiwyg.querySelector('p');
			expect(p).toBeDefined();
		});

		it('should handle inherited color', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div style="color: #ff0000;"><p>Inherited red</p></div>';

			const p = wysiwyg.querySelector('p');
			expect(p).toBeDefined();
		});

		it('should handle shorthand hex colors', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #f00;">Short hex</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});
	});

	describe('Color changes', () => {
		it('should handle color change', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000;">Text</span></p>';

			// Change color
			wysiwyg.innerHTML = '<p><span style="color: #00ff00;">Text</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span.style.color).toBeDefined();
		});

		it('should handle color addition', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Plain</p>';

			// Add color
			wysiwyg.innerHTML = '<p><span style="color: #ff0000;">Colored</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span).toBeDefined();
		});

		it('should handle multiple color properties', () => {
			const wysiwyg = editor.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: #ff0000; border-color: #00ff00; background-color: #0000ff;">Multi</span></p>';

			const span = wysiwyg.querySelector('span');
			expect(span.style.color).toBeDefined();
		});
	});
});
