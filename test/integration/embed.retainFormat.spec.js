/**
 * @fileoverview Regression tests for the embed plugin `retainFormat` hook.
 * A bare allowed iframe (no figure yet) made the async hook reject with
 * "Cannot read properties of null (reading 'setAttribute')" — `#ready` wrote `data-se-origin`
 * to a cover that `#fixTagStructure` had not created yet, and the iframe was never wrapped.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import Embed from '../../src/plugins/modal/embed';

describe('Embed retainFormat - bare allowed iframe', () => {
	let editor;
	let warn;

	beforeEach(async () => {
		warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		editor = createTestEditor({ plugins: { embed: Embed }, buttonList: [['embed']] });
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it('wraps the iframe synchronously in an embed figure without a hook error', () => {
		const cleaned = editor.$.html.clean('<iframe src="https://platform.twitter.com/embed/Tweet.html"></iframe>');

		const probe = document.createElement('div');
		probe.innerHTML = cleaned;
		expect(probe.querySelector('.se-embed-container iframe')).not.toBeNull();
		expect(warn.mock.calls.filter(([m]) => String(m).includes('retainFormat.fail'))).toEqual([]);
	});

	it('preserves raw embed input through repeated serialization and restores it in the edit modal', async () => {
		const src = 'https://platform.twitter.com/embed/Tweet.html?value=%25&mode=x';
		const original = '<iframe src="https://platform.twitter.com/embed/Tweet.html?value=%25&amp;mode=x" title="한글 😀 100% &quot;quoted&quot;"></iframe>';
		const embed = editor.$.plugins.embed;
		const ww = editor.$.frameContext.get('wysiwyg');
		editor.$.html.set('<p>before</p>');
		const text = ww.querySelector('p').firstChild;
		editor.$.selection.setRange(text, 6, text, 6);
		await embed.submitSRC(original);

		for (let i = 0; i < 3; i++) {
			const cover = ww.querySelector('figure');
			expect(cover.getAttribute('data-se-origin')).toBe(encodeURIComponent(original));
			editor.$.html.set(editor.$.html.get());
			expect(ww.querySelectorAll('iframe')).toHaveLength(1);
			expect(ww.querySelector('iframe').getAttribute('src')).toBe(src);
			expect(ww.textContent).not.toContain('<iframe');
			embed.componentSelect(ww.querySelector('iframe'));
			embed.modalOn(true);
			expect(embed.embedInput.value).toBe(original);
			expect(embed.previewSrc.textContent).toBe(original);
		}
		expect(warn.mock.calls.filter(([m]) => String(m).includes('retainFormat.fail'))).toEqual([]);
	});

	it('encodes a missing origin URL and decodes it once when opening the edit modal', () => {
		const src = 'https://platform.twitter.com/embed/Tweet.html?value=%25';
		editor.$.html.set(`<iframe src="${src}"></iframe>`);
		const iframe = editor.$.frameContext.get('wysiwyg').querySelector('iframe');
		const embed = editor.$.plugins.embed;
		embed.componentSelect(iframe);
		expect(iframe.closest('figure').getAttribute('data-se-origin')).toBe(encodeURIComponent(src));
		embed.modalOn(true);
		expect(embed.embedInput.value).toBe(src);
	});

});
