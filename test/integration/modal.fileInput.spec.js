/**
 * @fileoverview Media modal file input integration tests
 * The selected file name must be shown in the file input of the image, video and audio modals,
 * also when the URL input is disabled with `createUrlInput: false` (#1726).
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import { image, video, audio } from '../../src/plugins';

function selectFile(input, name) {
	const file = new File(['x'], name);
	Object.defineProperty(input, 'files', { configurable: true, value: [file] });
	Object.defineProperty(input, 'value', { configurable: true, value: `C:\\fakepath\\${name}` });
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

const cases = [
	{ key: 'image', plugin: image, fileInput: 'imgInputFile', urlInput: 'imgUrlFile', fileName: 'picture.png', media: '<img src="https://example.com/a.png">' },
	{ key: 'video', plugin: video, fileInput: 'videoInputFile', urlInput: 'videoUrlFile', fileName: 'clip.mp4', media: '<video src="https://example.com/a.mp4"></video>' },
	{ key: 'audio', plugin: audio, fileInput: 'audioInputFile', urlInput: 'audioUrlFile', fileName: 'sound.mp3', media: '<audio src="https://example.com/a.mp3" controls></audio>' },
];

describe.each(cases)('$key modal file input', ({ key, plugin, fileInput, urlInput, fileName, media }) => {
	let editor;

	const createEditor = async (pluginOptions) => {
		editor = createTestEditor({
			plugins: { [key]: plugin },
			buttonList: [[key]],
			[key]: pluginOptions,
		});
		await waitForEditorReady(editor);
		return editor.$.plugins[key];
	};

	afterEach(() => {
		if (editor) {
			destroyTestEditor(editor);
			editor = null;
		}
	});

	it('shows the selected file name when the URL input is disabled', async () => {
		const inst = await createEditor({ createFileInput: true, createUrlInput: false });
		expect(inst[urlInput]).toBeFalsy();

		selectFile(inst[fileInput], fileName);

		const fileCnt = inst.fileModalWrapper.querySelector('.se-input-file-cnt');
		expect(fileCnt.textContent).toBe(fileName);
		expect(fileCnt.style.display).toBe('block');
	});

	it('shows the selected file name and disables the URL input when both inputs exist', async () => {
		const inst = await createEditor({ createFileInput: true, createUrlInput: true });

		selectFile(inst[fileInput], fileName);

		expect(inst.fileModalWrapper.querySelector('.se-input-file-cnt').textContent).toBe(fileName);
		expect(inst[urlInput].disabled).toBe(true);
	});

	it('opens the update modal of a selected component when the URL input is disabled', async () => {
		const inst = await createEditor({ createFileInput: true, createUrlInput: false });
		editor.$.html.set(`<p>a</p>${media}<p>b</p>`);
		const target = editor.$.frameContext.get('wysiwyg').querySelector(key === 'image' ? 'img' : key);

		editor.$.component.select(target, key);
		expect(editor.$.ui.currentControllerName).toBe(key);

		expect(() => inst.open()).not.toThrow();
		expect(inst.modal.isUpdate).toBe(true);
	});
});
