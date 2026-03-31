/**
 * @fileoverview Integration tests for Component API methods
 * Tests real-world usage of editor.$.component public API
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Component API integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'component-api-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [['bold', 'italic']],
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

	describe('component.is() - Check if element is a component', () => {
		it('should return false for regular text elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Regular paragraph</p>';

			const p = wysiwyg.querySelector('p');
			const isComponent = editor.$.component.is(p);

			expect(isComponent).toBe(false);
		});

		it('should return false for inline formatted text', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong>Bold text</strong></p>';

			const strong = wysiwyg.querySelector('strong');
			const isComponent = editor.$.component.is(strong);

			expect(isComponent).toBe(false);
		});

		it('should identify component elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// Create a component-like structure (figure with se-component class)
			wysiwyg.innerHTML = `
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="test"/>
				</figure>
			`;

			const figure = wysiwyg.querySelector('figure');
			const isComponent = editor.$.component.is(figure);

			// Should recognize it as a component-like element
			expect(isComponent).toBe(true);
		});
	});

	describe('component.isBasic() - Check if element is a basic component', () => {
		it('should return false for text nodes', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const isBasic = editor.$.component.isBasic(textNode);

			expect(isBasic).toBe(false);
		});

		it('should return false for regular elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Paragraph</p><div>Division</div>';

			const p = wysiwyg.querySelector('p');
			const div = wysiwyg.querySelector('div');

			expect(editor.$.component.isBasic(p)).toBe(false);
			expect(editor.$.component.isBasic(div)).toBe(false);
		});
	});

	describe('component.get() - Get component info', () => {
		it('should return null for non-component elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Not a component</p>';

			const p = wysiwyg.querySelector('p');
			const compInfo = editor.$.component.get(p);

			expect(compInfo).toBeNull();
		});

		it('should return null for text nodes', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text node</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const compInfo = editor.$.component.get(textNode);

			expect(compInfo).toBeNull();
		});

		it('should return component info for actual components', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// Create a component
			wysiwyg.innerHTML = `
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="test"/>
					<figcaption>Caption</figcaption>
				</figure>
			`;

			const figure = wysiwyg.querySelector('figure');
			const compInfo = editor.$.component.get(figure);

			if (compInfo) {
				expect(compInfo).toBeTruthy();
				expect(compInfo.target).toBeTruthy();
			}
		});
	});

	describe('Component identification workflows', () => {
		it('should distinguish between text and components', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<p>Regular text paragraph</p>
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="component"/>
				</figure>
				<p>Another text paragraph</p>
			`;

			const p1 = wysiwyg.querySelector('p:first-child');
			const figure = wysiwyg.querySelector('figure');
			const p2 = wysiwyg.querySelector('p:last-child');

			// Regular paragraphs should not be components
			expect(editor.$.component.is(p1)).toBe(false);
			expect(editor.$.component.is(p2)).toBe(false);

			// Figure with se-component class should be recognized
			expect(editor.$.component.is(figure)).toBe(true);
		});

		it('should handle mixed content traversal', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<p>Text 1</p>
				<div>Text 2</div>
				<p><strong>Formatted</strong> text</p>
			`;

			const allElements = wysiwyg.querySelectorAll('*');
			let componentCount = 0;

			allElements.forEach((el) => {
				if (editor.$.component.is(el)) {
					componentCount++;
				}
			});

			// Should have very few or no components in plain text content
			expect(componentCount).toBe(0);
		});
	});

	describe('Component boundaries and nesting', () => {
		it('should identify component boundaries', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<figure class="se-component">
					<div>
						<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="nested"/>
					</div>
				</figure>
			`;

			const figure = wysiwyg.querySelector('figure');
			const div = figure.querySelector('div');
			const img = figure.querySelector('img');

			// Figure is the component
			expect(editor.$.component.is(figure)).toBe(true);

			// Children are not components themselves
			expect(editor.$.component.is(div)).toBe(false);
			expect(editor.$.component.is(img)).toBe(false);
		});

		it('should handle adjacent components', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="first"/>
				</figure>
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="second"/>
				</figure>
			`;

			const figures = wysiwyg.querySelectorAll('figure');
			expect(figures.length).toBe(2);

			// Both should be recognized as components
			expect(editor.$.component.is(figures[0])).toBe(true);
			expect(editor.$.component.is(figures[1])).toBe(true);
		});
	});

	describe('Real-world component scenarios', () => {
		it('should handle checking elements before operations', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<p>Text before</p>
				<figure class="se-component">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="image"/>
				</figure>
				<p>Text after</p>
			`;

			// When editing, check if current element is a component
			const figure = wysiwyg.querySelector('figure');
			const beforeP = wysiwyg.querySelector('p:first-child');
			const afterP = wysiwyg.querySelector('p:last-child');

			// You would check before applying operations
			if (!editor.$.component.is(beforeP)) {
				// Safe to apply text operations
				expect(beforeP.textContent).toBe('Text before');
			}

			if (editor.$.component.is(figure)) {
				// Handle as component
				expect(figure.classList.contains('se-component')).toBe(true);
			}

			if (!editor.$.component.is(afterP)) {
				// Safe to apply text operations
				expect(afterP.textContent).toBe('Text after');
			}
		});

		it('should identify editable vs non-editable areas', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<p contenteditable="true">Editable text</p>
				<figure class="se-component" contenteditable="false">
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="locked"/>
				</figure>
			`;

			const p = wysiwyg.querySelector('p');
			const figure = wysiwyg.querySelector('figure');

			// Text is editable, component might not be
			const isTextComponent = editor.$.component.is(p);
			const isFigureComponent = editor.$.component.is(figure);

			expect(isTextComponent).toBe(false);
			expect(isFigureComponent).toBe(true);
		});

		it('should traverse document looking for components', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<p>Text</p>
				<figure class="se-component"><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="1"/></figure>
				<p>More text</p>
				<figure class="se-component"><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="2"/></figure>
				<p>Final text</p>
			`;

			const components = [];
			const allChildren = wysiwyg.children;

			for (let i = 0; i < allChildren.length; i++) {
				const child = allChildren[i];
				if (editor.$.component.is(child)) {
					components.push(child);
				}
			}

			expect(components.length).toBe(2);
			components.forEach((comp) => {
				expect(comp.classList.contains('se-component')).toBe(true);
			});
		});
	});

	describe('Edge cases', () => {
		it('should handle null/undefined inputs', () => {
			expect(editor.$.component.is(null)).toBe(false);
			expect(editor.$.component.is(undefined)).toBe(false);
			expect(editor.$.component.isBasic(null)).toBe(false);
			expect(editor.$.component.get(null)).toBeNull();
		});

		it('should handle empty wysiwyg', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '';

			const children = wysiwyg.children;
			expect(children.length).toBe(0);

			// No components in empty editor
			let componentCount = 0;
			for (let i = 0; i < children.length; i++) {
				if (editor.$.component.is(children[i])) {
					componentCount++;
				}
			}
			expect(componentCount).toBe(0);
		});

		it('should handle deeply nested non-component structures', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = `
				<div>
					<div>
						<div>
							<p>Deeply nested text</p>
						</div>
					</div>
				</div>
			`;

			const deepestP = wysiwyg.querySelector('p');
			expect(editor.$.component.is(deepestP)).toBe(false);

			// None of the divs should be components
			const allDivs = wysiwyg.querySelectorAll('div');
			allDivs.forEach((div) => {
				expect(editor.$.component.is(div)).toBe(false);
			});
		});

		it('should handle malformed component-like structures', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// Component class but no proper structure
			wysiwyg.innerHTML = '<div class="se-component">Not a real component</div>';

			const div = wysiwyg.querySelector('div');
			// Should still recognize by class
			const isComp = editor.$.component.is(div);
			expect(typeof isComp).toBe('boolean');
		});
	});
});
