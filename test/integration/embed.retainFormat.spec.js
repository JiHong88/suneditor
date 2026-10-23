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
});
