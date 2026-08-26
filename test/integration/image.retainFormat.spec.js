/**
 * @fileoverview Regression tests for the image plugin `retainFormat` hook.
 * Covers GitHub issue: pasting a <span> containing multiple <img> children in code view
 * threw "Cannot read properties of null (reading 'replaceChild')" and dropped every image
 * after the first.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import Image from '../../src/plugins/modal/image/index';

describe('Image retainFormat - multiple images in one inline wrapper', () => {
	let editor;
	let container;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'w-image-retain-format-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			plugins: { image: Image },
			buttonList: [['image']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') destroyTestEditor(editor);
		if (container && container.parentNode) document.body.removeChild(container);
	});

	it('does not throw when a span wraps two images', () => {
		const html = '<span><img src="one.svg"><img src="two.svg"></span>';
		expect(() => editor.$.html.clean(html, { forceFormat: true })).not.toThrow();
	});

	it('keeps every image when a span wraps two images', () => {
		const html = '<span><img src="one.svg"><img src="two.svg"></span>';
		const cleaned = editor.$.html.clean(html, { forceFormat: true });

		const probe = document.createElement('div');
		probe.innerHTML = cleaned;
		const srcs = Array.from(probe.querySelectorAll('img')).map((img) => img.getAttribute('src'));

		expect(srcs).toEqual(['one.svg', 'two.svg']);
	});

	it('keeps every image when a span wraps three images', () => {
		const html = '<span><img src="one.svg"><img src="two.svg"><img src="three.svg"></span>';
		const cleaned = editor.$.html.clean(html, { forceFormat: true });

		const probe = document.createElement('div');
		probe.innerHTML = cleaned;
		const srcs = Array.from(probe.querySelectorAll('img')).map((img) => img.getAttribute('src'));

		expect(srcs).toEqual(['one.svg', 'two.svg', 'three.svg']);
	});

	it('leaves no empty caret-less line behind', () => {
		const html = '            <span>\n              <img src="one.svg">\n              <img src="two.svg">\n            </span>';
		const cleaned = editor.$.html.clean(html, { forceFormat: true });

		const probe = document.createElement('div');
		probe.innerHTML = cleaned;
		const deadLines = Array.from(probe.querySelectorAll('p')).filter((p) => !p.firstChild);

		expect(deadLines).toHaveLength(0);
	});

	it('keeps text siblings on their own line without a trailing empty line', () => {
		const cleaned = editor.$.html.clean('<span>hello <img src="a.svg"></span>', { forceFormat: true });

		const probe = document.createElement('div');
		probe.innerHTML = cleaned;

		expect(Array.from(probe.querySelectorAll('p')).filter((p) => !p.firstChild)).toHaveLength(0);
		expect(probe.textContent).toContain('hello');
		expect(probe.querySelectorAll('img')).toHaveLength(1);
	});

	it('still unwraps a span that holds a single image', () => {
		const html = '<span><img src="only.svg"></span>';
		const cleaned = editor.$.html.clean(html, { forceFormat: true });

		const probe = document.createElement('div');
		probe.innerHTML = cleaned;

		expect(probe.querySelectorAll('img').length).toBe(1);
		expect(probe.querySelector('img').getAttribute('src')).toBe('only.svg');
	});
});
