/**
 * @fileoverview Link modal integration tests
 * Verifies that the `link.title` and `link.textToDisplay` options control the
 * visibility of the corresponding fields in the link modal (#1722).
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import { link } from '../../src/plugins';

function getModalFields() {
	const displayInput = document.querySelector('._se_display_text');
	const displayLabel = displayInput ? displayInput.previousElementSibling : null;
	const titleInput = document.querySelector('._se_title');
	const titleLabel = titleInput ? titleInput.previousElementSibling : null;

	return { displayInput, displayLabel, titleInput, titleLabel };
}

describe('Link modal option visibility', () => {
	let editor;

	const createLinkEditor = async (linkOptions) => {
		const container = document.createElement('div');
		container.id = 'link-modal-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			plugins: { link },
			buttonList: [['link']],
			...(linkOptions ? { link: linkOptions } : {})
		});
		await waitForEditorReady(editor);
		return editor;
	};

	afterEach(() => {
		if (editor) {
			try {
				destroyTestEditor(editor);
			} catch (e) {
				// ignore cleanup errors
			}
			editor = null;
		}
		document.body.innerHTML = '';
	});

	describe('default options', () => {
		it('shows both "Text to display" and "Title" fields', async () => {
			await createLinkEditor();

			const { displayInput, displayLabel, titleInput, titleLabel } = getModalFields();
			expect(displayInput).toBeTruthy();
			expect(displayInput.style.display).not.toBe('none');
			expect(displayLabel.style.display).not.toBe('none');
			expect(titleInput).toBeTruthy();
			expect(titleInput.style.display).not.toBe('none');
			expect(titleLabel.style.display).not.toBe('none');
		});
	});

	describe('link: { title: false, textToDisplay: false }', () => {
		it('hides both "Text to display" and "Title" fields', async () => {
			await createLinkEditor({ title: false, textToDisplay: false });

			const { displayInput, displayLabel, titleInput, titleLabel } = getModalFields();
			expect(displayInput).toBeTruthy();
			expect(displayInput.style.display).toBe('none');
			expect(displayLabel.style.display).toBe('none');
			expect(titleInput).toBeTruthy();
			expect(titleInput.style.display).toBe('none');
			expect(titleLabel.style.display).toBe('none');
		});
	});

	describe('link: { title: false }', () => {
		it('hides only the "Title" field', async () => {
			await createLinkEditor({ title: false });

			const { displayInput, titleInput, titleLabel } = getModalFields();
			expect(displayInput.style.display).not.toBe('none');
			expect(titleInput.style.display).toBe('none');
			expect(titleLabel.style.display).toBe('none');
		});
	});
});
