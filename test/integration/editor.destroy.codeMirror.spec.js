/**
 * @fileoverview Regression tests for `destroy()` with CodeMirror 5 attached to the code view.
 *
 * The constructor detaches the code-view textarea after `fromTextArea`, so CodeMirror's `toTextArea`
 * (which removes its wrapper through `textarea.parentNode`) threw and skipped the rest of the teardown.
 * `destroy()` no longer calls it: the wrapper is removed with `topArea`.
 */

import CodeMirror from 'codemirror';
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('editor.destroy - CodeMirror code view', () => {
	const originCreateRange = document.createRange;
	let editor;
	let cm;

	beforeAll(() => {
		// jsdom ranges have no layout; CodeMirror measures text with them
		document.createRange = function () {
			const range = originCreateRange.call(document);
			range.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
			range.getClientRects = () => [];
			return range;
		};
	});

	afterAll(() => {
		document.createRange = originCreateRange;
	});

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['codeView']],
			externalLibs: { codeMirror: { src: CodeMirror } },
		});
		await waitForEditorReady(editor);
		cm = editor.$.frameOptions.get('codeMirrorEditor');
	});

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		editor = null;
	});

	function destroy() {
		const target = editor;
		editor = null;
		expect(() => target.destroy()).not.toThrow();
		if (target._testTarget && target._testTarget.parentNode)
			target._testTarget.parentNode.removeChild(target._testTarget);
	}

	it('uses the CodeMirror wrapper as the code frame and detaches the textarea', () => {
		const code = editor.$.frameContext.get('code');

		expect(code).toBe(cm.getWrapperElement());
		expect(code.classList.contains('se-code-viewer-mirror')).toBe(true);
		expect(cm.getTextArea().parentNode).toBeNull();
	});

	it('round-trips content through CodeMirror in code view', () => {
		editor.$.html.set('<p>mirror</p>');
		editor.$.viewer.codeView(true);
		expect(cm.getValue()).toContain('mirror');
		editor.$.viewer.codeView(false);
		expect(editor.$.html.get()).toContain('mirror');
	});

	it('destroys without throwing and removes the editor DOM', () => {
		const toTextArea = jest.spyOn(cm, 'toTextArea');
		const topArea = editor.$.frameContext.get('topArea');
		expect(topArea.isConnected).toBe(true);

		destroy();

		expect(toTextArea).not.toHaveBeenCalled();
		expect(topArea.isConnected).toBe(false);
		expect(document.getElementsByClassName('sun-editor')).toHaveLength(0);
		expect(document.getElementsByClassName('CodeMirror')).toHaveLength(0);
	});

	it('leaves a surrounding form submit method intact', () => {
		const form = document.createElement('form');
		const origin = editor.$.frameContext.get('originElement');
		origin.parentNode.insertBefore(form, origin);
		form.appendChild(origin);
		form.appendChild(editor.$.frameContext.get('topArea'));

		destroy();

		expect(Object.prototype.hasOwnProperty.call(form, 'submit')).toBe(false);
		expect(typeof form.submit).toBe('function');
		form.remove();
	});
});
