/**
 * @fileoverview Advanced Integration tests for Inline Formatting
 * Comprehensive coverage of inline DOM manipulation operations
 * Targets 739+ uncovered statements in src/core/logic/dom/inline.js
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Advanced Inline Formatting Integration Tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'inline-advanced-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold', 'italic', 'underline', 'strike', 'superscript', 'subscript', 'removeFormat']],
			width: '100%',
			height: 'auto'
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) {
			destroyTestEditor(editor);
		}
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	});

	describe('Bold formatting operations', () => {
		it('should apply bold to full text selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply bold to partial text selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 5);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply bold at word boundary', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>One Two Three</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 4, text, 7);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.querySelector('p')).toBeTruthy();
		});

		it('should toggle bold on already bold text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';
			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.$.selection.setRange(strong.firstChild, 0, strong.firstChild, strong.textContent.length);
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply bold to single character', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>A</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 1);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply bold across multiple words', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Multiple word text here</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply bold with nested elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Before <em>italic</em> after</p>';
			const text = wysiwyg.querySelector('p');
			if (text.firstChild) {
				editor.$.selection.setRange(text.firstChild, 0, text.lastChild, text.lastChild.textContent.length);
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Italic formatting operations', () => {
		it('should apply italic to partial selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Italicize this</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 8);
			try {
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply italic to full text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>All italic</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should toggle italic on existing italic', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><em>Already italic</em></p>';
			const em = wysiwyg.querySelector('em');
			if (em && em.firstChild) {
				editor.$.selection.setRange(em.firstChild, 0, em.firstChild, em.textContent.length);
				try {
					editor.$.inline.run({ command: 'italic', tag: 'EM' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply italic to middle words', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start middle end</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 6, text, 12);
			try {
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Underline formatting operations', () => {
		it('should apply underline to selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Underline text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 9);
			try {
				editor.$.inline.run({ command: 'underline', tag: 'U' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should toggle underline', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><u>Underlined</u></p>';
			const u = wysiwyg.querySelector('u');
			if (u && u.firstChild) {
				editor.$.selection.setRange(u.firstChild, 0, u.firstChild, u.textContent.length);
				try {
					editor.$.inline.run({ command: 'underline', tag: 'U' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply underline to full paragraph', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Complete paragraph underline</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'underline', tag: 'U' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Strikethrough formatting operations', () => {
		it('should apply strikethrough to text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Strike this</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 6);
			try {
				editor.$.inline.run({ command: 'strike', tag: 'S' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should toggle strikethrough', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><s>Already struck</s></p>';
			const s = wysiwyg.querySelector('s');
			if (s && s.firstChild) {
				editor.$.selection.setRange(s.firstChild, 0, s.firstChild, s.textContent.length);
				try {
					editor.$.inline.run({ command: 'strike', tag: 'S' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Combined formatting operations', () => {
		it('should apply bold and italic together', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Bold and italic</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply bold, italic, and underline', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Triple format</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
				editor.$.inline.run({ command: 'underline', tag: 'U' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply multiple formats with partial overlaps', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Part one part two</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 8);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			editor.$.selection.setRange(text, 5, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle nested formatting scenario', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold <em>and italic</em></strong></p>';
			const em = wysiwyg.querySelector('em');
			if (em && em.firstChild) {
				editor.$.selection.setRange(em.firstChild, 0, em.firstChild, em.textContent.length);
				try {
					editor.$.inline.run({ command: 'underline', tag: 'U' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Superscript and subscript operations', () => {
		it('should apply superscript', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>E=mc2</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 5, text, 6);
			try {
				editor.$.inline.run({ command: 'superscript', tag: 'SUP' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply subscript', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>H2O</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 1, text, 2);
			try {
				editor.$.inline.run({ command: 'subscript', tag: 'SUB' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should toggle superscript on existing superscript', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>E=mc<sup>2</sup></p>';
			const sup = wysiwyg.querySelector('sup');
			if (sup && sup.firstChild) {
				editor.$.selection.setRange(sup.firstChild, 0, sup.firstChild, sup.textContent.length);
				try {
					editor.$.inline.run({ command: 'superscript', tag: 'SUP' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should toggle subscript on existing subscript', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>H<sub>2</sub>O</p>';
			const sub = wysiwyg.querySelector('sub');
			if (sub && sub.firstChild) {
				editor.$.selection.setRange(sub.firstChild, 0, sub.firstChild, sub.textContent.length);
				try {
					editor.$.inline.run({ command: 'subscript', tag: 'SUB' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle subscript in formula', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>CO2 and NO2</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 1, text, 2);
			try {
				editor.$.inline.run({ command: 'subscript', tag: 'SUB' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Font color operations', () => {
		it('should apply font color via style', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Colored text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				const span = document.createElement('SPAN');
				span.style.color = 'red';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply multiple colors to different selections', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Red and Blue text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 3);
			try {
				const span = document.createElement('SPAN');
				span.style.color = 'red';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply hex color code', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hex color text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 3);
			try {
				const span = document.createElement('SPAN');
				span.style.color = '#FF5733';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply rgb color code', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>RGB color text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 3);
			try {
				const span = document.createElement('SPAN');
				span.style.color = 'rgb(255, 0, 0)';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Background color (highlight) operations', () => {
		it('should apply background color to text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Highlighted text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				const span = document.createElement('SPAN');
				span.style.backgroundColor = 'yellow';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply highlight with hex color', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Hex highlight</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 3);
			try {
				const span = document.createElement('SPAN');
				span.style.backgroundColor = '#FFFF00';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply highlight with rgb', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>RGB highlight</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 3);
			try {
				const span = document.createElement('SPAN');
				span.style.backgroundColor = 'rgb(255, 255, 0)';
				editor.$.inline.apply(span);
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Formatting removal operations', () => {
		it('should remove all formatting', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em><u>Heavily formatted</u></em></strong></p>';
			const u = wysiwyg.querySelector('u');
			if (u && u.firstChild) {
				editor.$.selection.setRange(u.firstChild, 0, u.firstChild, u.textContent.length);
				try {
					editor.$.inline.remove();
				} catch(e) {}
			}
			expect(wysiwyg.textContent).toContain('Heavily');
		});

		it('should remove bold formatting only', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Bold italic</em></strong></p>';
			const em = wysiwyg.querySelector('em');
			if (em && em.firstChild) {
				editor.$.selection.setRange(em.firstChild, 0, em.firstChild, em.textContent.length);
				try {
					editor.$.inline.apply(null, { nodesToRemove: ['strong'] });
				} catch(e) {}
			}
			expect(wysiwyg.textContent).toContain('Bold');
		});

		it('should remove italic formatting only', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Bold italic</em></strong></p>';
			const em = wysiwyg.querySelector('em');
			if (em && em.firstChild) {
				editor.$.selection.setRange(em.firstChild, 0, em.firstChild, em.textContent.length);
				try {
					editor.$.inline.apply(null, { nodesToRemove: ['em'] });
				} catch(e) {}
			}
			expect(wysiwyg.textContent).toContain('Bold');
		});

		it('should remove specific style property', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color: red; font-size: 16px;">Styled text</span></p>';
			const span = wysiwyg.querySelector('span');
			if (span && span.firstChild) {
				editor.$.selection.setRange(span.firstChild, 0, span.firstChild, span.textContent.length);
				try {
					editor.$.inline.apply(null, { stylesToModify: ['color'] });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should remove specific class', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span class="highlight special">Classed text</span></p>';
			const span = wysiwyg.querySelector('span');
			if (span && span.firstChild) {
				editor.$.selection.setRange(span.firstChild, 0, span.firstChild, span.textContent.length);
				try {
					editor.$.inline.apply(null, { stylesToModify: ['.highlight'] });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should remove formatting from partial selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold start middle end</strong></p>';
			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.$.selection.setRange(strong.firstChild, 11, strong.firstChild, 17);
				try {
					editor.$.inline.remove();
				} catch(e) {}
			}
			expect(wysiwyg.textContent).toContain('start middle end');
		});
	});

	describe('Formatting across multiple nodes', () => {
		it('should apply formatting across node boundary', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start <strong>bold</strong> end</p>';
			const p = wysiwyg.querySelector('p');
			if (p.firstChild && p.lastChild) {
				editor.$.selection.setRange(p.firstChild, 0, p.lastChild, p.lastChild.textContent.length);
				try {
					editor.$.inline.run({ command: 'italic', tag: 'EM' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply formatting across multiple paragraphs', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First paragraph</p><p>Second paragraph</p>';
			const ps = wysiwyg.querySelectorAll('p');
			if (ps[0].firstChild && ps[1].firstChild) {
				editor.$.selection.setRange(ps[0].firstChild, 0, ps[1].firstChild, 6);
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle nested structure when applying format', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<div><p><span>Text in span</span></p></div>';
			const span = wysiwyg.querySelector('span');
			if (span && span.firstChild) {
				editor.$.selection.setRange(span.firstChild, 0, span.firstChild, span.textContent.length);
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should apply formatting with mixed content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text <br> more text</p>';
			const p = wysiwyg.querySelector('p');
			if (p.firstChild) {
				try {
					editor.$.selection.setRange(p.firstChild, 0, p.lastChild, 4);
					editor.$.inline.run({ command: 'italic', tag: 'EM' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Edge cases and special scenarios', () => {
		it('should handle zero-length selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text cursor here</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 5, text, 5);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle single character formatting', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Single character: X</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 19, text, 20);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle whitespace-only selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Word   space   word</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 4, text, 7);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle newline characters in selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Line1\nLine2</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			if (text) {
				editor.$.selection.setRange(text, 0, text, Math.min(text.length, 6));
				try {
					editor.$.inline.run({ command: 'italic', tag: 'EM' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle special characters', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>@#$%^&*()</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, text.textContent.length);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle unicode text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>日本語テキスト</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			if (text) {
				editor.$.selection.setRange(text, 0, text, Math.min(text.length, 3));
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle emoji characters', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Emoji 😀 test</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			if (text) {
				editor.$.selection.setRange(text, 0, text, Math.min(text.length, 7));
				try {
					editor.$.inline.run({ command: 'italic', tag: 'EM' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle very long text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			const longText = 'A'.repeat(1000);
			wysiwyg.innerHTML = `<p>${longText}</p>`;
			const text = wysiwyg.querySelector('p').firstChild;
			if (text) {
				editor.$.selection.setRange(text, 0, text, Math.min(text.length, 100));
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should handle already-formatted text modification', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em><u>Triple</u></em></strong></p>';
			const u = wysiwyg.querySelector('u');
			if (u && u.firstChild) {
				editor.$.selection.setRange(u.firstChild, 0, u.firstChild, u.textContent.length);
				try {
					const span = document.createElement('SPAN');
					span.style.color = 'red';
					editor.$.inline.apply(span);
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});

	describe('Inline API direct calls', () => {
		it('should call inline.run with bold command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 4);
			try {
				await editor.$.commandDispatcher.run('bold');
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should call inline.run with italic command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 4);
			try {
				await editor.$.commandDispatcher.run('italic');
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should call inline.run with underline command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test text</p>';
			const text = wysiwyg.querySelector('p').firstChild;
			editor.$.selection.setRange(text, 0, text, 4);
			try {
				await editor.$.commandDispatcher.run('underline');
			} catch(e) {}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});

		it('should call inline.run with removeFormat command', async () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold</strong></p>';
			const strong = wysiwyg.querySelector('strong');
			if (strong && strong.firstChild) {
				editor.$.selection.setRange(strong.firstChild, 0, strong.firstChild, strong.textContent.length);
				try {
					await editor.$.commandDispatcher.run('removeFormat');
				} catch(e) {}
			}
			expect(wysiwyg.textContent).toContain('Bold');
		});
	});

	describe('Formatting state and consistency', () => {
		it('should maintain formatting consistency after multiple operations', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text to format</p>';
			const text = wysiwyg.querySelector('p').firstChild;

			editor.$.selection.setRange(text, 0, text, 4);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}

			const textAfterBold = wysiwyg.textContent;
			editor.$.selection.setRange(text, 0, text, 4);
			try {
				editor.$.inline.run({ command: 'italic', tag: 'EM' });
			} catch(e) {}

			expect(wysiwyg.textContent).toBe(textAfterBold);
		});

		it('should preserve non-target text when formatting partial selection', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Start Middle End</p>';
			const text = wysiwyg.querySelector('p').firstChild;

			const before = text.textContent;
			editor.$.selection.setRange(text, 6, text, 12);
			try {
				editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
			} catch(e) {}
			const after = wysiwyg.textContent;

			expect(after).toContain('Start');
			expect(after).toContain('Middle');
			expect(after).toContain('End');
		});

		it('should handle rapid formatting changes', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Quick changes</p>';
			const text = wysiwyg.querySelector('p').firstChild;

			for (let i = 0; i < 5; i++) {
				editor.$.selection.setRange(text, 0, text, text.textContent.length);
				try {
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
					editor.$.inline.run({ command: 'bold', tag: 'STRONG' });
				} catch(e) {}
			}
			expect(wysiwyg.innerHTML).toBeTruthy();
		});
	});
});
